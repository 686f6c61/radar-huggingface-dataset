# brainworkup/Qwythos-9B-v3-Claude-Mythos-5-1M-MLX-oQ8e-mtp

## Resumen

Qwythos-9B-v3-Claude-Mythos-5-1M-MLX-oQ8e-mtp es una cuantización de un modelo de la familia Qwen3.5, publicada por el usuario brainworkup en Hugging Face. El checkpoint contiene 9.653.104.368 parámetros reales (9,65 mil millones) y está empaquetado en formato MLX, la librería de Apple para ejecutar modelos en silicio Apple (M1/M2/M3/M4). No se trata de un modelo entrenado desde cero, sino de una re-cuantización mixta del checkpoint base, realizada con la herramienta oQ de oMLX v0.7.4.dev1.

El nombre del repositorio sugiere varias cosas que la model card no confirma explícitamente: una variante de 9B de Qwen3.5, un supuesto contexto de 1M tokens, y un head MTP (multi-token prediction) para decodificación especulativa. La model card solo documenta la distribución de bits y el desglose de almacenamiento; no incluye información sobre el modelo base, los datos de entrenamiento, los idiomas soportados ni la licencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un artefacto de cuantización de un tercero, no de un lanzamiento oficial, y la mayor parte de los metadatos técnicos habituales (benchmarks, licencia, idiomas, pipeline) no están disponibles. La información que sí es verificable es la estructura del checkpoint: 94,917% de los pesos en affine 8-bit con grupo 64, 5,083% en BF16, con un promedio efectivo de 8,881 bits por peso y un tamaño total de 9,980 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` sugiere familia Qwen3.5; no confirmado en la model card) |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el nombre del repo menciona "1M", sin confirmar) |
| Tipos de cuantizacion | Mixta: affine 8-bit grupo 64 (94,917% de pesos) + BF16 (5,083%); promedio efectivo 8,881 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 9,514 GB / 8,861 GiB |
| Vision | 0,456B | 0,912 GB / 0,849 GiB |
| Head MTP | 0,243B | 0,290 GB / 0,270 GiB |
| Total | 9,653B | 10,716 GB / 9,980 GiB |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura del modelo base, los datos de entrenamiento, el número de tokens vistos ni si hubo RLHF, DPO u otras fases de alineamiento. El tag `qwen3_5` apunta a la familia Qwen3.5 de Alibaba, y el nombre del repositorio menciona "Claude-Mythos-5", lo que podría indicar un fine-tune o una mezcla de destilación, pero ninguno de estos extremos está documentado por el autor.

Lo que sí está documentado es el proceso de cuantización. La herramienta oQ de oMLX aplica cuantización de precisión mixta: la mayor parte de los tensores (94,917% de los pesos lógicos) se almacenan en affine 8-bit con tamaño de grupo 64, mientras que un 5,083% se mantiene en BF16. El resultado es un checkpoint de 9,980 GiB con un promedio efectivo de 8,881 bits por peso. La presencia de un head MTP de 0,243B parámetros sugiere soporte para multi-token prediction, técnica habitualmente asociada a decodificación especulativa, aunque la model card no describe cómo se usa.

## Capacidades

- Generación de texto: el checkpoint incluye un modelo de lenguaje de 8,954B parámetros, por lo que se espera generación de texto autoregresiva, aunque no hay documentación de calidad ni de tareas evaluadas.
- Visión: el checkpoint contiene un componente de visión de 0,456B parámetros, lo que indica capacidad multimodal de entrada de imagen, si bien no se detalla el encoder ni la resolución soportada.
- Multi-token prediction: el head MTP de 0,243B parámetros sugiere soporte de decodificación especulativa o predicción de varios tokens por paso, sin confirmación de uso.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el formato MLX y el tamaño de 9,980 GiB permiten cargar el modelo en equipos con memoria unificada de 16 GB o más, usando la pila MLX de Apple; es el caso de uso principal y prácticamente el único documentado por el formato.
- Prototipado de aplicaciones multimodales en local: la presencia del componente de visión permite experimentar con entrada de imagen y texto sin depender de APIs externas, siempre que se valide la calidad real del modelo base.
- Evaluación de cuantización mixta: el checkpoint sirve como referencia para comparar la precisión de oQ affine 8-bit grupo 64 frente a BF16 en tareas concretas, dado que el autor documenta la distribución exacta de bits.
- Pruebas de decodificación especulativa: el head MTP permite experimentar con técnicas de aceleración de inferencia en MLX, midiendo la ganancia de throughput frente a decodificación estándar.
- Despliegue en estaciones de trabajo con memoria unificada: para equipos Apple de gama alta (M2 Ultra, M3 Ultra, M4 Max con 64 GB o más) el modelo puede ejecutarse con contexto amplio si se confirma la ventana de 1M tokens.
- Investigación sobre linajes de modelos: útil para estudiar cómo se comporta una cuantización de un supuesto fine-tune de Qwen3.5 con mezcla de datos estilo Claude, comparándolo con el base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,980 GiB solo para los pesos; con overhead de runtime MLX y caché KV, se recomienda un mínimo de 12-16 GB de memoria unificada para contexto corto.
- Contexto largo: si se confirma la ventana de 1M tokens, la caché KV crecerá de forma significativa y exigirá equipos con 64 GB o más de memoria unificada.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro/Max/Ultra), dado que el formato es MLX. No es directamente compatible con CUDA sin conversión.
- Cabe en GPU consumer: sí, en Apple Silicon con memoria unificada suficiente; no en GPUs NVIDIA consumer sin reconvertir el checkpoint a otro formato (GGUF, safetensors estándar).
- Opciones de despliegue: MLX (mlx-lm), oMLX. Para otros backends sería necesaria una conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwythos-9B-v3-Claude-Mythos-5-1M-MLX-oQ8e-mtp | 9,65B | no disponible | MLX safetensors (8,881 bits/peso) | no disponible | Cuantización de terceros, 0 descargas |
| Qwen3.5 9B (base, si existe) | ~9B | no disponible | safetensors | no disponible | Modelo original del que derivaría; no confirmado |
| Qwen2.5-VL 7B | 7B | 128K | safetensors, GGUF | Apache 2.0 | Alternativa multimodal oficial con licencia clara |
| Llama 3.1 8B | 8B | 128K | safetensors, GGUF | Llama 3.1 Community License | Alternativa texto-only ampliamente soportada |

La comparativa es orientativa: no hay datos de rendimiento del modelo de esta ficha que permitan una comparación cuantitativa, y la licencia del checkpoint no está declarada, lo que impide confirmar si su uso comercial es viable.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución; es un riesgo legal relevante para producción.
- Modelo de terceros: no es un lanzamiento oficial de Alibaba ni de Anthropic; el linaje exacto (Qwen3.5 + posible destilación de Claude) no está documentado.
- Sin benchmarks ni evaluación publicada: no hay evidencia de calidad, alucinación o robustez.
- Idiomas no declarados: no se puede garantizar soporte multilingüe ni calidad en castellano.
- Contexto no confirmado: el "1M" del nombre del repositorio no está verificado en la model card; asumir 1M tokens sin pruebas es arriesgado.
- Formato MLX: requiere Apple Silicon; no es portable a CUDA sin conversión, lo que limita su uso en servidores convencionales.
- Cuantización de 8,881 bits/peso: la mezcla affine 8-bit + BF16 puede degradar tareas sensibles (matemáticas, código) frente al checkpoint original en BF16.
- Repositorio sin tracción: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-12): metadato atípico que conviene verificar antes de confiar en el artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/brainworkup/Qwythos-9B-v3-Claude-Mythos-5-1M-MLX-oQ8e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Librería MLX: no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible
- Repositorio del modelo base Qwen3.5: no disponible
