# immanuelpeter/MoonViT-K3.1-Pro

## Resumen

MoonViT-K3.1-Pro es un paquete de pesos que extrae y aísla el "vision tower" MoonViT y el proyector multimodal (`mm_projector`) del modelo Kimi-K3.1-Pro de Moonshot AI. Lo publica el usuario immanuelpeter en Hugging Face como un repositorio independiente con el pipeline `image-feature-extraction`, de modo que puede cargarse con la librería `transformers` sin necesidad de descargar el checkpoint completo del modelo base. El paquete contiene únicamente los 165 tensores del tower (en BF16 original) y los 3 tensores del proyector, con un total de 401.214.464 parámetros y un tamaño de repositorio de 0,9 GB.

El interés práctico es la modularidad: permite reutilizar el codificador visual de Kimi-K3.1-Pro en pipelines propios de extracción de características de imagen, o reemplazar el tower en otras arquitecturas multimodales. El autor valida la fidelidad del export con una comprobación de paridad tensor a tensor (`torch.equal`) frente al checkpoint original de Moonshot AI, y documenta que en FP32 y BF16 con atención matemática las salidas coinciden bit a bit, mientras que bajo la atención BF16 de vLLM en producción difieren hasta un 8,1% en norma L2 relativa.

No es un modelo generativo autónomo: es un componente visual (tower + proyector) que produce embeddings de imagen proyectados al espacio del modelo de lenguaje de Kimi-K3.1-Pro. La licencia es la propia de Kimi K3.1-Pro (`kimi-k3-1-pro`, marcada como `other`), heredada del modelo fuente, y el código vendorizado proviene de `AI4Industry/MoonViT-V2` con sus avisos de copyright originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (MoonViT V2) con 27 capas, 1024 de dimensión oculta, 12 cabezas, QKV de 1536, patch size 14; compresión de tokens 2x2 pixel shuffle + pooling temporal sin parámetros aprendidos; proyector MLP `Linear(4096,4096)` + GELU + `Linear(4096,7168)` + `RMSNorm(7168)` |
| Parametros totales | 401.214.464 (165 tensores del tower + 3 del proyector) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en BF16 original |
| Idiomas soportados | no disponible (componente visual, sin capacidades lingüísticas propias) |
| Licencia | `kimi-k3-1-pro` (license_name: kimi-k3-1-pro, license: other), heredada de moonshotai/Kimi-K3.1-Pro |
| Formato de pesos | safetensors (`model.safetensors`, `projector.safetensors`), BF16 |

## Arquitectura y entrenamiento

El componente es el tower visual MoonViT V2 de Kimi-K3.1-Pro: un transformer de visión de 27 capas con dimensión oculta 1024, 12 cabezas de atención y dimensión QKV de 1536, que opera sobre parches de 14 píxeles. Aplica compresión de tokens mediante pixel shuffle 2x2 y pooling temporal, ambos sin parámetros aprendidos, lo que reduce el número de tokens visuales antes de proyectarlos. La salida del tower incluye la RMSNorm final; a 448 píxeles el ejemplo documentado reporta una salida del tower de forma `(1, 1024, 1024)`, una salida fusionada de `(1, 256, 4096)` y una salida proyectada de `(1, 256, 7168)`.

El proyector (`mm_projector`) es un MLP sin sesgo: `Linear(4096, 4096)`, activación GELU, `Linear(4096, 7168)` y `RMSNorm(7168)`, que alinea las características visuales con la dimensión del modelo de lenguaje de Kimi-K3.1-Pro. El autor no entrena ni ajusta nada: extrae los pesos originales en BF16 desde el shard 96 (`vision_tower`) y el shard 95 (`mm_projector`) del checkpoint `moonshotai/Kimi-K3.1-Pro`, verifica cada tensor exportado contra el padre fijado antes de escribir y conserva el dtype original. El código de modelado y procesamiento de imagen se vendoriza sin cambios desde `AI4Industry/MoonViT-V2`. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO, ya que el paquete es un export de pesos preentrenados.

## Capacidades

- Extracción de características de imagen: genera embeddings visuales del tower MoonViT a partir de imágenes de entrada.
- Proyección al espacio multimodal: transforma las características visuales a la dimensión 7168 del modelo de lenguaje de Kimi-K3.1-Pro mediante el proyector incluido.
- Procesamiento de imagen integrado: incluye `image_processing_moonvit_v2.py` y `preprocessor_config.json` para el preprocesado de imágenes.
- Compresión de tokens visuales: pixel shuffle 2x2 y pooling temporal reducen la secuencia de tokens antes de la proyección.
- Carga con `transformers`: soporta `trust_remote_code` mediante los ficheros `configuration_moonvit_v2.py` y `modeling_moonvit_v2.py`.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes, capacidades multilingües ni modos de pensamiento: es exclusivamente un componente visual.

## Casos de uso

- Extracción de embeddings de imagen para búsqueda visual: el tower produce características de forma `(1, 1024, 1024)` que pueden indexarse en un motor vectorial para recuperación por similitud, sin cargar el modelo completo de Kimi-K3.1-Pro.
- Sustitución del tower visual en pipelines multimodales propios: al estar empaquetado de forma independiente con su proyector y su configuración, puede integrarse en una arquitectura VLM casera que espere la dimensión 7168 del proyector.
- Precomputación de características para entrenamiento de adaptadores: permite generar y cachear embeddings visuales de un corpus de imágenes antes de entrenar cabezas o adaptadores sobre ellos, reduciendo el coste de repetir el forward del tower.
- Clasificación y etiquetado de imágenes por transferencia: las características del tower pueden alimentar clasificadores lineales o cabezas ligeras para tareas de visión concretas.
- Auditoría y reproducibilidad de Kimi-K3.1-Pro: al conservar los pesos BF16 originales y verificar paridad tensor a tensor, sirve para validar reproducciones del componente visual frente al checkpoint padre.
- Investigación en alineación visión-lenguaje: el par tower + proyector aislado permite estudiar cómo se proyectan las características visuales al espacio del LLM sin el resto del modelo.
- Despliegue ligero en entornos con VRAM limitada: con 0,9 GB de repositorio, el componente cabe en GPUs de consumo para tareas de extracción de características por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única validación documentada es la comprobación de paridad: los 165 tensores del tower y los 3 del proyector coinciden con el checkpoint padre fijado mediante `torch.equal`, y las salidas del tower, fusionada y proyectada coinciden bit a bit en FP32 y en BF16 con atención matemática. Bajo atención BF16 de vLLM en producción, las salidas difieren hasta aproximadamente un 8,1% en norma L2 relativa.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 401,2 M de parámetros ocupan aproximadamente 0,8 GB de pesos; con activaciones y overhead de runtime, un presupuesto de 2-4 GB de VRAM es suficiente para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Para extracción por lotes a gran escala, A100/H100 aportan mayor throughput.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía documentada en `examples/inference.py`); el autor menciona ejecución bajo vLLM BF16 en producción, aunque con divergencia numérica respecto al padre. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor recomienda batch size 1 para atención reproducible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoonViT-K3.1-Pro (este) | 401,2 M | Tower visual + proyector (export) | no aplica | kimi-k3-1-pro (other) | Hugging Face, 289 descargas |
| AI4Industry/MoonViT-V2 | no disponible | Tower visual MoonViT V2 (código vendorizado) | no aplica | no disponible | Hugging Face |
| moonshotai/Kimi-K3.1-Pro | no disponible | Modelo multimodal completo | no disponible | kimi-k3-1-pro | Hugging Face (checkpoint padre) |

No se dispone de datos de benchmarks ni de parámetros de los modelos comparables en la información proporcionada, por lo que no es posible comparar rendimiento numérico.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni razonamiento; solo características visuales. No debe evaluarse como LLM ni como VLM completo.
- Divergencia numérica en producción: bajo atención BF16 de vLLM las salidas difieren hasta un 8,1% en norma L2 relativa respecto al checkpoint padre, por lo que no es bit-idéntico en ese entorno de ejecución.
- Licencia restrictiva: hereda la licencia `kimi-k3-1-pro` (marcada como `other`); es necesario revisar `LICENSE` antes de cualquier uso comercial. El código vendorizado conserva sus propios avisos en `LICENSE-CODE` y `NOTICE`.
- Idiomas: no aplica, pero tampoco se documenta ningún soporte lingüístico, lo que limita su uso fuera de pipelines visuales.
- Sesgos y alucinación: no se documentan sesgos conocidos del tower; al ser un extractor de características, el riesgo de alucinación textual no aplica, pero los sesgos del dataset de preentrenamiento de Kimi-K3.1-Pro pueden propagarse a los embeddings.
- Dependencia de código remoto: requiere `trust_remote_code=True` y los ficheros de modelado vendorizados, lo que añade superficie de revisión en producción.
- Reproducibilidad de atención: el autor recomienda batch size 1; lotes mayores pueden alterar la atención y, por tanto, las salidas.
- Madurez: repositorio con 0 likes y 289 descargas, creado en noviembre de 2026; sin comunidad ni soporte documentado más allá del README.

## Enlaces

- Hugging Face: https://huggingface.co/immanuelpeter/MoonViT-K3.1-Pro
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Código vendorizado de origen: https://huggingface.co/AI4Industry/MoonViT-V2
- Comprobación de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/parity/moonvit_v2.py
- Script de export: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/adapters/moonvit_v2.py
- Ejemplo de inferencia: https://huggingface.co/immanuelpeter/MoonViT-K3.1-Pro/blob/main/examples/inference.py
