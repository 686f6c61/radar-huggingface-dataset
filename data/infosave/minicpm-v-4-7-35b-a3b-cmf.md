# infosave/MiniCPM-V-4.7-35B-A3B-cmf

## Resumen

MiniCPM-V-4.7-35B-A3B-cmf es una cuantización del backbone de texto del modelo multimodal MiniCPM-V 4.7 35B-A3B de OpenBMB, empaquetada en formato CMF (un contenedor memory-mapped que agrupa pesos cuantizados, tokenizer y plantilla de chat) para su uso con el runtime `cortiq`. El autor del artefacto es el usuario `infosave`, no OpenBMB, y se distribuye bajo licencia Apache 2.0. Es importante subrayar que este release es **solo de texto**: no incluye la torre de visión, el proyector visual, la inyección de tokens visuales ni la ruta M-RoPE de canvas, por lo que no procesa imágenes ni vídeo a pesar del nombre heredado del modelo base.

El backbone lingüístico retenido es un transformer híbrido tipo MoE con arquitectura estilo Qwen3.5: 40 capas, de las cuales 30 son de atención lineal Gated DeltaNet y 10 de atención completa, con 256 expertos enrutados (top-8) más un experto compartido. El checkpoint fuente está publicado en BF16 y este repositorio ofrece dos cuantizaciones directas del mismo, con perfiles `q4tp` (aproximadamente 19,4 GB) y `q8_2f` (aproximadamente 35,0 GB).

Su relevancia práctica radica en que permite ejecutar un MoE de gran tamaño en hardware de consumo o en estaciones de trabajo con 24 GB de VRAM mediante un formato optimizado y un runtime específico, con velocidades de decodificación reportadas de 108-116 tok/s en una RTX A5000 bajo CUDA. No obstante, el ecosistema de despliegue es propietario del formato CMF y limitado al runtime `cortiq`, lo que reduce su portabilidad frente a GGUF o safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE estilo Qwen3.5: 40 capas (30 Gated DeltaNet de atención lineal + 10 de atención completa), 256 expertos enrutados top-8 + experto compartido |
| Parametros totales | 35B (denominación del modelo base) |
| Parametros activos | 3B (denominación A3B del modelo base) |
| Longitud de contexto | no disponible (el benchmark usa `--ctx 4096`, pero no se declara el máximo) |
| Tipos de cuantizacion | `q4tp` (matrices de expertos en 4 bits, esqueleto siempre activo en `q8_2f`, controles sensibles en F16) y `q8_2f` (matrices 2-D en 8 bits, controles en F16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (contenedor memory-mapped para el runtime `cortiq`) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina 30 capas de atención lineal Gated DeltaNet con 10 capas de atención completa, una configuración que busca reducir el coste computacional y de memoria del estado KV en secuencias largas manteniendo capacidad de atención global en una fracción de las capas. La capa MoE emplea 256 expertos enrutados con activación top-8 más un experto compartido, lo que da lugar a la denominación 35B-A3B (35 mil millones de parámetros totales, 3 mil millones activos por token).

El checkpoint fuente se publica en BF16 y este repositorio contiene cuantizaciones directas del backbone de texto, sin reentrenamiento ni ajuste adicional. La política de precisión mixta mantiene en F16 el router MoE, la puerta del experto compartido, las proyecciones `in_proj_a` e `in_proj_b` de Gated DeltaNet, las convoluciones y los tensores escalares y de normalización, mientras que el cuerpo de matrices se cuantiza a 4 u 8 bits según el perfil. Aunque la configuración del modelo base anuncia una capa MTP (multi-token prediction), el checkpoint no incluye tensores `mtp.*` físicos, por lo que este release carece de cabeza especulativa. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas al modelo original.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del backbone lingüístico del modelo base.
- Conversación multi-turno con plantilla de chat incluida en el propio contenedor CMF.
- Razonamiento sobre código y matemáticas, presumiblemente por herencia del modelo base (no verificado en este release).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- **Sin capacidades de visión**: este release no acepta imágenes ni vídeo; los tokens `<|image_pad|>` y `<|video_pad|>` no están operativos.
- **Sin modo thinking ni cabeza especulativa MTP**: el checkpoint no incluye tensores `mtp.*`.

## Casos de uso

- **Inferencia de texto en estaciones de trabajo con 24 GB de VRAM**: el perfil `q4tp` (19,4 GB) cabe en tarjetas como la RTX A5000 o la RTX 4090 y decodifica a 108-116 tok/s bajo CUDA, lo que permite servir un MoE de 35B en hardware de gama profesional sin clúster.
- **Generación de texto por lotes en pipelines internos**: con `cortiq run` y prompts largos (2.395 tok/s de prefill en A5000 con 4.096 tokens), es adecuado para tareas de resumen, extracción o clasificación sobre documentos extensos donde el coste por token importa.
- **Prototipado de aplicaciones conversacionales**: la plantilla de chat va incluida en el propio archivo CMF, lo que simplifica el despliegue de un chatbot multi-turno sin gestionar artefactos separados de tokenizer y template.
- **Evaluación de modelos MoE de gran tamaño en macOS**: el perfil `q4tp` está pensado para evaluarse primero en Apple Silicon con Metal, usando memoria unificada en lugar de VRAM dedicada, con la advertencia de que el rendimiento depende del equipo y de la compilación de `cortiq`.
- **Referencia de alta fidelidad para validación**: el perfil `q8_2f` (35,0 GB) sirve como referencia cuando la fidelidad numérica prima sobre el almacenamiento, útil para comparar salidas frente a la cuantización de 4 bits en tareas sensibles.
- **Investigación sobre cuantización mixta en MoE**: la preservación en F16 de router, puertas y rutas recurrentes de Gated DeltaNet convierte este release en un caso de estudio práctico sobre qué tensores conviene mantener en alta precisión al cuantizar modelos híbridos.
- **Despliegue con aceleración Vulkan en GPUs de consumo**: la ruta opcional de cola MoE dinámica permite repartir expertos residentes en GPU y completar los fríos en CPU, con un rendimiento medido de aproximadamente 24 tok/s en una RTX 4090.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son mediciones de rendimiento del runtime `cortiq`:

| Medición | CUDA (RTX A5000 24 GB) | Vulkan (misma tarjeta) |
|---|---:|---:|
| Decodificación | 108-116 tok/s | 87-90 tok/s |
| Prefill de 4.096 tokens | 2.395 tok/s | 768 tok/s |
| Latencia del primer token (prompt 4.096) | 1,71 s | 5,33 s |

| Medición (RTX 4090, Vulkan, cola MoE dinámica) | Valor |
|---|---:|
| Decodificación (512 tokens greedy) | 23,8 / 24,3 / 23,8 tok/s |
| Latencia del primer token | 18,1 / 17,9 / 17,9 s |
| Puerta de regresión (16 tokens) | 16/16 argmax coincidentes, max abs(delta logit) 4,005e-05 |

Estas cifras son mediciones de una sola máquina y el propio autor advierte que no constituyen garantías universales de rendimiento ni resultados de perplejidad o calidad.

## Requisitos de hardware

- **VRAM estimada**: el perfil `q4tp` ocupa 19.372.423.311 bytes (aproximadamente 19,4 GB) y el `q8_2f` 34.994.075.791 bytes (aproximadamente 35,0 GB); a ello hay que sumar buffers del runtime, estado KV y contexto.
- **GPU recomendadas**: RTX A5000 de 24 GB (medición CUDA de referencia) y RTX 4090 (medición Vulkan con cola MoE dinámica). El perfil `q4tp` está diseñado para caber en 24 GB de VRAM.
- **GPU de consumo**: sí, el perfil `q4tp` cabe en tarjetas de 24 GB como la RTX 4090; el `q8_2f` requiere más de 35 GB y no cabe en GPUs de consumo actuales.
- **Apple Silicon**: soportado vía Metal con memoria unificada; el propio autor advierte que el ajuste y el rendimiento dependen del Mac, la memoria libre, la longitud de contexto y la compilación de `cortiq`. No se aportan cifras de tok/s en Metal.
- **Opciones de despliegue**: exclusivamente el runtime `cortiq` (versión 0.8.96 para las mediciones CUDA; 0.8.19 o superior para la ruta Vulkan dinámica). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato CMF es específico de `cortiq`.
- **Latencia y throughput**: ver la tabla de benchmarks; en A5000 con CUDA, 108-116 tok/s de decodificación y 2.395 tok/s de prefill a 4.096 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales verificables:

| Modelo | Parámetros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-cmf (este release) | 35B totales / 3B activos | no disponible | CMF | Apache 2.0 | `cortiq` |
| openbmb/MiniCPM-V-4.7-35B-A3B (modelo base) | 35B totales / 3B activos | no disponible | safetensors (BF16) | Apache 2.0 (según este repo) | Transformers y otros |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia principal frente al modelo base es la eliminación de la torre de visión y la cuantización mixta; frente a otras alternativas de la misma categoría no hay datos suficientes para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- **No es multimodal**: a pesar del nombre MiniCPM-V, este release no procesa imágenes ni vídeo. Enviar contenido visual o tokens `<|image_pad|>` / `<|video_pad|>` no activa visión.
- **Ecosistema cerrado**: el formato CMF solo es compatible con el runtime `cortiq`, lo que limita la portabilidad y obliga a depender de un único proyecto para el despliegue.
- **Sin cabeza especulativa**: el checkpoint no incluye tensores MTP, por lo que no se puede aprovechar la decodificación especulativa anunciada en la configuración del modelo base.
- **Riesgo de alucinación**: no se han publicado evaluaciones de calidad ni de fidelidad de la cuantización frente al modelo en BF16, más allá de la puerta de regresión de 16 tokens en la ruta Vulkan.
- **Sesgos**: no disponible; el autor no documenta sesgos conocidos del modelo base ni de esta cuantización.
- **Idiomas**: no disponible; no se declaran los idiomas soportados.
- **Contexto máximo**: no disponible; las mediciones usan 4.096 tokens, pero no se especifica la ventana máxima del modelo.
- **Licencia**: Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base de OpenBMB antes de producción.
- **Rendimiento no garantizado**: las cifras de tok/s son mediciones de una sola máquina y el autor advierte explícitamente que no son comparables entre backends ni extrapolables a otros equipos, drivers o longitudes de contexto.
- **Memoria**: el nombre "35B-A3B" no implica que el banco completo de expertos quepa en 3 GB; hay que planificar el tamaño completo del archivo CMF, los buffers del runtime y el estado KV.
- **Madurez**: el repositorio tiene 513 descargas y 1 like, con creación en octubre de 2026, lo que indica una adopción muy limitada y escasa validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/MiniCPM-V-4.7-35B-A3B-cmf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Repositorio del runtime CMF: https://github.com/infosave2007/cmf
