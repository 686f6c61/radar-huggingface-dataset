# dcharlot65-openie/LFM2.5-350M-LittleBit

## Resumen

`dcharlot65-openie/LFM2.5-350M-LittleBit` es un checkpoint de pesos "vivos" (living weights) derivado del modelo base `LiquidAI/LFM2.5-350M` de Liquid AI, publicado por el usuario dcharlot65-openie. No es un modelo entrenado desde cero ni un fine-tune convencional: es una factorización previa que combina LittleBit-2 (representación sub-1-bit en planos de bits) con Sakana SVF, empaquetada en formato `.jsyn` para su uso con JouleDB, una base de datos termodinámica y runtime de inferencia sin PyTorch, orientada a despliegues nativos en Kubernetes (JouleKube).

El interés técnico del artefacto está en su perfil de compresión extrema: los 354.483.968 parámetros del modelo original (676,12 MB en FP16) se reducen a un fichero de 4,14 MB con compresión zstd y CRC32, lo que supone una ratio de compresión de 163,17x y un promedio de 0,0437 bits por peso (BPW). El repositorio incluye 93 tensores 2D en planos de bits y 55 vectores 1D (LayerNorm, bias y depthwise) que se conservan en mayor precisión.

Es relevante ahora como ejemplo de una línea de trabajo emergente: representaciones de pesos por debajo de 1 bit combinadas con runtimes ligeros y nativos de la nube, pensadas para servir modelos pequeños en entornos con restricciones severas de memoria y almacenamiento. Conviene subrayar que el repositorio figura con 0 descargas y 0 likes, tamaño de repo de 0,0 GB y pipeline no disponible, por lo que se trata de un artefacto experimental de publicación muy reciente (23 de noviembre de 2026) y sin validación comunitaria conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de LiquidAI/LFM2.5-350M); pesos factorizados en planos de bits LittleBit-2 + Sakana SVF |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit (0,0437 BPW promedio); tensores 2D en planos de bits, tensores 1D en mayor precision; empaquetado `.jsyn` con zstd + CRC32 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`); uso gratuito para entidades con ingresos anuales inferiores a 10 M USD |
| Formato de pesos | `.jsyn` (JouleDB); no se distribuyen safetensors ni GGUF |
| Tamano comprimido | 4,14 MB (frente a 676,12 MB en FP16, 163,17x menor) |
| Tensores | 93 tensores 2D en planos de bits + 55 vectores 1D (LayerNorm/bias/depthwise) |
| Libreria / runtime | jouledb v0.2.4+ (runtime de inferencia sin PyTorch) |
| Modelo base | LiquidAI/LFM2.5-350M |
| `model_id` interno | `lfm2.5-350m` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `LiquidAI/LFM2.5-350M` de Liquid AI, del que este checkpoint hereda la topología y los pesos. Sobre esa base, el autor aplica una factorización previa que combina LittleBit-2 (codificación de pesos en planos de bits con representación sub-1-bit) y Sakana SVF, dando lugar a un artefacto de "pesos vivos" que JouleDB puede cargar y servir directamente. Según la model card, los tensores 2D se almacenan como planos de bits (93 tensores) mientras que los vectores 1D críticos —LayerNorm, bias y convoluciones depthwise— se preservan en una representación de mayor precisión (55 vectores), una decisión habitual para limitar la degradación en capas sensibles a la cuantización.

No se dispone de información sobre el proceso de entrenamiento: la model card no documenta número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla qué algoritmo exacto de Sakana SVF se emplea ni los hiperparámetros de la factorización LittleBit-2. La innovación declarada es, por tanto, de compresión y despliegue (formato `.jsyn`, runtime sin PyTorch, integración con JouleKube) más que de entrenamiento.

## Capacidades

- Generación de texto y modelado de lenguaje: hereda las capacidades del modelo base LFM2.5-350M, si bien la model card no documenta evaluaciones que confirmen la retención de calidad tras la compresión sub-1-bit.
- Razonamiento y matemáticas: no disponible de forma específica en la información proporcionada; depende de lo que conserve el modelo base.
- Generación de código: no disponible de forma específica en la información proporcionada.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ecosistema JouleDB/JouleKube está orientado a sustratos de agentes en Kubernetes, pero no se detallan capacidades del modelo en este sentido.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Despliegue nativo en la nube: carga y servicio mediante JouleDB (`jouledb serve` + `db.hf_pull`), con runtime sin PyTorch.

## Casos de uso

- Servicio de modelos de lenguaje en clústeres Kubernetes con recursos mínimos: el fichero de 4,14 MB permite distribuir el modelo como artefacto ligero dentro de imágenes de contenedor o volúmenes persistentes, y servirlo con JouleDB en pods de baja huella de memoria.
- Inferencia en el borde (edge) y dispositivos embebidos: la representación sub-1-bit reduce el almacenamiento en dos órdenes de magnitud frente a FP16, lo que facilita desplegar generación de texto en gateways, routers o equipos industriales con almacenamiento limitado.
- Experimentación en investigación sobre cuantización extrema: sirve como material de estudio para medir la degradación de calidad al pasar de FP16 a 0,0437 BPW con preservación selectiva de vectores 1D.
- Pruebas de integración de JouleDB/JouleKube: útil para validar pipelines de `hf_pull`, carga de `.jsyn` y servicio HTTP en un sustrato de agentes antes de escalar a modelos mayores.
- Prototipado rápido de asistentes de texto de bajo coste: para demos internas o entornos de desarrollo donde el objetivo es validar la integración de la API y no la calidad final de las respuestas.
- Archivado y versionado eficiente de checkpoints: el formato comprimido con CRC32 permite almacenar y verificar la integridad de variantes del modelo con un coste de almacenamiento mínimo en registros de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de compresión (354.483.968 parámetros, 676,12 MB en FP16, 4,14 MB en `.jsyn`, 163,17x de reducción, 0,0437 BPW) y no incluye evaluaciones de calidad (MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el modelo base de 350 M de parámetros en FP16 ocuparía aproximadamente 0,7 GB de pesos, pero el runtime JouleDB y su representación sub-1-bit no documentan requisitos de memoria de trabajo.
- GPU recomendadas: no disponibles. La orientación del ecosistema JouleDB/JouleKube sugiere despliegue en CPU o aceleradores modestos dentro de clústeres, pero no se especifica compatibilidad con CUDA, ROCm u otros backends.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, pero no está confirmado ni documentado.
- Opciones de despliegue: JouleDB (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`) con carga vía `db.hf_pull`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.jsyn` es específico de JouleDB.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M-LittleBit (este) | 354,5 M (0,0437 BPW) | no disponible | `.jsyn` (JouleDB) | LFM 1.0 | Compresión extrema, runtime sin PyTorch, sin benchmarks publicados |
| LiquidAI/LFM2.5-350M | 350 M aprox. | no disponible en esta ficha | safetensors (formato habitual) | LFM 1.0 | Modelo base sin comprimir; referencia de calidad original |
| Alternativas de ~350 M en formato GGUF | ~350 M | variable | GGUF | variable | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría; los datos de rendimiento del modelo base y de terceros no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que la compresión a 0,0437 BPW preserve la calidad del modelo base; la degradación podría ser severa.
- Artefacto sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, repositorio de 0,0 GB y pipeline no disponible; no debe asumirse que el checkpoint es funcional ni que el proceso de factorización se completó correctamente.
- Dependencia de un runtime propietario: el formato `.jsyn` solo se carga con JouleDB v0.2.4 o superior, lo que limita la portabilidad y crea dependencia de un proyecto concreto.
- Licencia restrictiva para uso comercial: LFM Open License v1.0 solo permite uso gratuito a entidades con ingresos anuales inferiores a 10 M USD; por encima de ese umbral es necesario contactar con Liquid AI.
- Idiomas y contexto no documentados: no se puede planificar un despliegue multilingüe ni de contexto largo sin información adicional.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan medidas de mitigación ni evaluaciones de fidelidad.
- Sesgos: no documentados en la model card; se heredarían los del modelo base, que tampoco se detallan.
- Fecha de publicación futura en los metadatos (23 de noviembre de 2026): conviene verificar la integridad y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/LFM2.5-350M-LittleBit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-license
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
