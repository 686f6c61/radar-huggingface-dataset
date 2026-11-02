# adityawakharkar/numbat-forensics

## Resumen

Numbat Forensics es un artefacto de investigación publicado por el usuario independiente adityawakharkar en Hugging Face. No es un modelo de lenguaje funcional, sino el resultado de una auditoría forense sobre el checkpoint público `burner22/numbat` (7,72 TB, 1.576.410 tensores) junto con un modelo truncado de 1 de 114 capas reconstruido a partir de los bytes reales de los tensores originales. La pregunta que responde el estudio es acotada y verificable: si los parámetros de ese checkpoint están realmente entrenados o pueden regenerarse mediante un programa determinista. La respuesta es que pueden regenerarse: 633 tensores de normalización y convolución (11.374.080 valores) se reproducen bit a bit desde `SHA256(tensor_name)` sin parámetros ajustados, y 373.620.632 signos de códigos E2M1 en 12 matrices de expertos coinciden con la misma secuencia sembrada por nombre.

El artefacto contiene 4.732.490.080 parámetros y pesa 9,5 GB en el repositorio, correspondientes a la capa 0 (densa, tipo Gated DeltaNet) más el embedding de tokens y la cabeza de salida. La arquitectura de origen es un stack híbrido de 114 capas con atención Gated DeltaNet y MLA, MoE con 1.224 expertos enrutados y cuantización NVFP4, pero este artefacto no incluye capas MLA, MoE ni MTP. Su relevancia es metodológica: documenta una técnica de auditoría de procedencia de pesos mediante peticiones HTTP range sobre cabeceras safetensors, sin descargar shards ni ejecutar código del repositorio.

El modelo truncado no produce texto coherente y no pretende hacerlo. La salida de inferencia publicada es degenerada y el control con pesos aleatorios produce la misma salida degenerada. Está etiquetado explícitamente como `not-for-production` y su única utilidad es la reproducibilidad del análisis forense.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Truncamiento de 1 de 114 capas de un stack híbrido Gated DeltaNet + MLA con MoE; la capa 0 es densa y de tipo GDN |
| Parametros totales | 4.732.490.080 |
| Parametros activos | no disponible (no es un MoE funcional; el artefacto conserva solo capa densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en los tensores conservados; el checkpoint de origen usa NVFP4 en capas MoE, no incluidas aquí |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

El checkpoint de origen, según la configuración descrita en la model card, es un stack de 114 capas con hidden de 12.288, vocabulario de 131.072 y MLP intermedio de 24.576. Usa atención Gated DeltaNet en las capas no congruentes con 3 módulo 4 y MLA en las 28 capas que sí lo son. Incorpora MoE con 1.224 expertos enrutados más uno compartido, top-48 con enrutamiento limitado por grupos (72 grupos, top-8), cuantización NVFP4 (modelopt 0.47.0, grupo de 16) en capas MoE, capas densas 0, 1 y 109-113 en BF16, y una capa MTP en el índice 114.

Este artefacto conserva únicamente la capa 0, que es densa y de tipo GDN, por lo que no hay dequantización NVFP4 implicada: los bytes se usan tal como están almacenados. Los 21 tensores necesarios son el embedding de tokens (131.072 × 12.288 BF16, 3.221.225.472 bytes), 18 tensores de la capa 0 (GDN + MLP SwiGLU, 3.023.027.936 bytes), la normalización final (12.288 BF16, 24.576 bytes) y la cabeza de salida (131.072 × 12.288 BF16, 3.221.225.472 bytes), sumando 9.464.980.352 bytes.

La receta de reconstrucción recuperada es determinista: se deriva una semilla de los primeros 8 bytes del SHA256 del nombre del tensor, se instancia un `numpy.random.Generator` con PCG64 y se generan valores con `exp(0.06 * normal)` para normas y `normal * (1/6)` para convoluciones, redondeados a BF16. Para expertos NVFP4 se usan tres flujos gaussianos. No hay parámetros ajustados en ningún caso. La tabla de embeddings de tokens es la excepción: presenta estructura semántica aprendida real y es el único componente que parece una red entrenada.

## Capacidades

- Generación de texto: no funcional. El modelo truncado no produce texto coherente por diseño.
- Razonamiento, código y matemáticas: no disponible; el artefacto no demuestra capacidad de modelo de lenguaje de checkpoint completo.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: solo inglés declarado, sin capacidad verificable.
- Capacidad especial: auditoría forense de pesos y reproducibilidad bit a bit de tensores de normalización y convolución desde el nombre del tensor.

## Casos de uso

- Auditoría de procedencia de checkpoints: el método de peticiones HTTP range sobre cabeceras safetensors permite verificar la integridad de un repositorio de 7,72 TB sin descargar los shards ni ejecutar código del autor, útil para evaluar publicaciones sospechosas antes de invertir en su descarga.
- Verificación de que un modelo publicado está realmente entrenado: la receta de reconstrucción desde `SHA256(tensor_name)` con cero parámetros ajustados sirve como prueba falsable para distinguir pesos entrenados de pesos generados por programa.
- Reproducibilidad de investigaciones: el repositorio incluye `build_artifact.py`, `tensor_hashes.json` y los scripts de investigación con la revisión fijada, lo que permite replicar cada medición en hardware modesto (12 vCPU, 22 GB RAM, sin GPU).
- Formación en técnicas forenses de safetensors: el inventario de 648 tensores con nombre, shard, dtype, forma, bytes de almacenamiento, parámetros lógicos y offset, revalidado contra cabeceras en vivo con 0 discrepancias, es material didáctico para entender el formato.
- Detección de relaciones cruzadas que la configuración niega: el análisis de `weight_scale_2` frente a `max|w|` y de `lm_head` frente a `embed_tokens` es un patrón reutilizable para detectar inconsistencias en checkpoints de terceros.
- Control experimental con pesos aleatorios: la comparación entre el modelo truncado y matrices gaussianas i.i.d. de la misma forma demuestra que la salida degenerada no aporta información de procedencia, un control metodológico aplicable a otros estudios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de auditoría: 184,4 M parámetros verificados (11,37 M bit a bit y 173,0 M casi exactos), equivalentes al 0,0027 % del checkpoint de origen; 648 tensores inventariados con 0 discrepancias frente a cabeceras en vivo; 115 cabeceras cacheadas; y un pico de RSS de aproximadamente 8 GiB con latencia por token de aproximadamente 12 s en 12 núcleos de CPU, dominada por la cabeza de 131.072 × 12.288.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica GPU; el artefacto se ejecuta en CPU. Pico de RSS de aproximadamente 8 GiB.
- GPU recomendadas: no disponible; el estudio se realizó sin GPU.
- Cabida en GPU de consumo: no procede; los 9,5 GB de pesos en BF16 podrían residir en una GPU con 12 GB o más, pero el modelo no produce salida útil.
- Opciones de despliegue: PyTorch con la implementación independiente incluida en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 12 s por token en 12 núcleos de CPU, según la model card.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (artefactos forenses de auditoría de pesos truncados). El checkpoint de origen `burner22/numbat` no es comparable en propósito: es un modelo completo de 7,72 TB con capacidades declaradas de generación de texto, mientras que este artefacto es una auditoría de 1 capa sin capacidad de lenguaje.

## Limitaciones y advertencias

- Solo contiene 1 de 114 capas decodificadoras: sin capa MLA, sin capa MoE, sin capa MTP y sin flujo residual profundo.
- No puede producir texto coherente y no lo intenta; la salida publicada es degenerada y el control con pesos aleatorios produce la misma salida.
- Un truncamiento no aporta información de procedencia; no debe interpretarse nada de su salida.
- El artefacto es de investigación y está etiquetado como `not-for-production`; no debe desplegarse en producción.
- La licencia MIT del artefacto no cubre los pesos de origen: el repositorio `burner22/numbat` no declara licencia, y por ello los pesos fuente no se redistribuyen en este repositorio.
- Riesgo de alucinación y sesgos: no evaluables, dado que el modelo no genera lenguaje funcional.
- Limitación de idioma: solo inglés declarado, sin verificación posible.
- El método forense depende de que el servidor de origen acepte peticiones range (`accept-ranges: bytes` / 206); si no las acepta, la auditoría sin descarga completa no es viable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adityawakharkar/numbat-forensics
- Checkpoint auditado: https://huggingface.co/burner22/numbat
- Revisión fijada del checkpoint: `6b7f8fc548cbafe9bec441f03af2d92a55cb4012`
- Repositorio de origen en Hugging Face (referencia de la model card): https://huggingface.co/burner22/numbat
- Script de construcción del artefacto: `build_artifact.py` (incluido en el repositorio del modelo)
- Inventario de hashes: `tensor_hashes.json` (incluido en el repositorio del modelo)
- Inventario de tensores: `results/tensor_inventory.csv` (incluido en el repositorio del modelo)
