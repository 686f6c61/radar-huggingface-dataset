# Phase-Technologies/hensy-330m-pretrain

## Resumen

Hensy-330M es un modelo de lenguaje de tipo transformer causal denso, desarrollado por Phase-Technologies (Soham Pal), entrenado desde cero sobre 5.000 millones de tokens en 4 GPU NVIDIA H100 80GB SXM5 interconectadas por NVLink en RunPod. Con 328.508.928 parámetros (328,5 M), 24 capas, dimensión oculta de 768 y una ventana de contexto de 4.096 tokens, se posiciona en la categoría de modelos fundacionales pequeños, pensados para experimentación, ajuste fino posterior y despliegue en hardware modesto.

El modelo se publica como checkpoint de preentrenamiento puro (`pretrain`), sin alineación, y el autor distribuye además un modelo derivado con ajuste supervisado (`hensy-330m-sft`) para tareas conversacionales. La relevancia principal no está en el rendimiento bruto —no hay benchmarks publicados— sino en la transparencia del proceso: el autor documenta hiperparámetros, checkpoints intermedios (2,10 B y 4,19 B tokens), la evolución de la pérdida (de 12,4 a 4,3) y el hardware utilizado, algo poco habitual en modelos de este tamaño.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene tener presente que se trata de un modelo base: no sigue instrucciones, no mantiene diálogo de forma fiable y solo cubre inglés. Su utilidad realista es como punto de partida para ajuste fino, investigación sobre dinámica de entrenamiento y prototipado de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (decoder-only), Pre-LayerNorm, 24 bloques |
| Parametros totales | 328.508.928 (328,5 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin cuantizar |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`final/model.safetensors`, más `step_500/` y `step_1000/`) |
| Dimension oculta (d_model) | 768 |
| Cabezas de atencion | 12 cabezas de 64 dimensiones, con RoPE y SDPA |
| Dimension del MLP | 3.072 (4 x d_model) con activación GeLU |
| Vocabulario | 206.464 tokens (tokenizador CRAYON Turbo) |
| Weight tying | Embedding de entrada atado a la proyección de salida del LM head |
| Tokens de entrenamiento | 5.000 millones |
| Hardware de entrenamiento | 4 x NVIDIA H100 80GB SXM5 con NVLink (RunPod) |
| Tamano del repositorio | 8,9 GB |
| Pipeline | `text-generation` |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar con normalización previa a cada subcapa (Pre-LayerNorm), 24 bloques, 768 dimensiones ocultas, 12 cabezas de atención de 64 dimensiones cada una, RoPE para el codificado posicional y atención implementada mediante SDPA. El MLP tiene 3.072 dimensiones con activación GeLU, y el embedding de entrada está atado a la proyección de salida, lo que reduce el recuento de parámetros en un vocabulario grande (206.464 tokens) —solo el embedding supone unos 158,6 M de parámetros de los 328,5 M totales—. No se documentan innovaciones adicionales: no hay atención lineal, decodificación especulativa, MoE ni componentes SSM.

El entrenamiento se realizó desde cero (raw scratch) sobre 5.000 millones de tokens en inglés, a más de 565.000 tokens por segundo, con una pérdida que descendió de 12,4 a 4,3. El autor indica que reconstruyó el bucle de entrenamiento «hasta el metal» para corregir desplazamientos de índices y promociones de dtype detectados en experimentos previos, y menciona un fallo de «identity copy shortcut» en trabajos anteriores. El prefijo `_orig_mod.` presente en el state dict sugiere el uso de `torch.compile`. No se especifica la composición del dataset, el número de épocas, la mezcla de fuentes ni si hubo fases de RLHF o DPO; el ajuste supervisado se aplicó en un checkpoint separado, no en este. Se publican tres checkpoints: `step_500` (2,10 B tokens), `step_1000` (4,19 B tokens) y `final` (5,00 B tokens).

## Capacidades

- Generación de texto autocompletivo (raw completion) en inglés: continuación de prompts sin formato de instrucciones.
- Modelo base para ajuste fino supervisado, ajuste por preferencias o especialización de dominio.
- Reproducibilidad de experimentos de dinámica de entrenamiento gracias a los checkpoints intermedios publicados.
- Manejo de contextos de hasta 4.096 tokens en una única pasada.
- Capacidad multilingüe: limitada al inglés; no se declara soporte de otros idiomas.
- Tool calling / function calling: no disponible; no se ha entrenado para ello.
- Comportamiento de agente o razonamiento multi-paso: no disponible.
- Modo «thinking», visión, audio u otras modalidades: no disponible.
- Alineación conversacional: no incluida en esta versión (el autor remite al modelo `-sft` para el turn-taking).

## Casos de uso

- Ajuste fino para dominios verticales: partir de un checkpoint base de 328,5 M permite adaptar el modelo a vocabulario jurídico, médico o técnico con presupuestos de cómputo reducidos (un solo GPU consumer basta para un fine-tuning completo en bf16).
- Investigación sobre leyes de escalado y dinámica de pérdida: los checkpoints a 2,10 B, 4,19 B y 5,00 B tokens permiten estudiar la evolución de representaciones y de la perplejidad sin entrenar desde cero.
- Prototipado rápido de autocompletado de texto en local: con menos de 1 GB de pesos en bf16, se puede desplegar en portátiles o en CPU para demostraciones de continuación de texto en inglés.
- Generación de datos sintéticos en inglés para entrenar modelos de clasificación o NER: el modelo puede producir textos de dominio controlado que luego se filtran y etiquetan manualmente.
- Base para destilación o experimentos de poda y cuantización: su tamaño contenido y su licencia permisiva lo hacen adecuado como modelo de laboratorio para probar técnicas de compresión antes de aplicarlas a modelos mayores.
- Educación y docencia en IA: al estar entrenado desde cero y documentado con hiperparámetros completos, sirve como ejemplo reproducible de un pipeline de preentrenamiento en un curso de sistemas de ML.
- Evaluación comparativa de tokenizadores: el uso de un vocabulario de 206.464 tokens (CRAYON Turbo) permite medir el impacto de vocabularios grandes en eficiencia de tokenización y coste de embedding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,66 GB en bfloat16 (328,5 M x 2 bytes) y 1,31 GB en float32 para los pesos.
- Memoria de caché KV (estimación calculada a partir de la arquitectura: 24 capas, 12 cabezas, 64 dimensiones, K y V en bf16): unos 72 KiB por token, es decir, alrededor de 300 MB adicionales al llenar los 4.096 tokens de contexto.
- Huella total práctica: entre 1 y 1,5 GB de VRAM en bf16 con contexto completo, más el overhead del runtime de PyTorch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sobradamente. El modelo está claramente infrautilizado en H100, que solo fue necesaria para el entrenamiento.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 4 GB o más; también puede ejecutarse en CPU (con latencia mayor) y en entornos tipo Google Colab con GPU T4.
- Ajuste fino completo: con AdamW en bf16 se necesitan aproximadamente 12 bytes por parámetro (pesos, gradientes y estados del optimizador), en torno a 4 GB, más activaciones; cabe en GPU de 12-16 GB con batch pequeño.
- Opciones de despliegue: no hay soporte nativo en vLLM, TGI, llama.cpp u Ollama, ya que la arquitectura requiere código propio (`config.py` y `model.py` distribuidos en el repositorio del modelo SFT) y una clase de tokenizador específica (`ForgeTokenizer` del paquete `xerv-crayon`). El despliegue documentado es PyTorch + `safetensors.load_file` + `model.generate`. La conversión a GGUF u ONNX no está disponible públicamente.
- Latencia y throughput: no se han publicado mediciones de inferencia. El único dato de rendimiento disponible es el del entrenamiento: más de 565.000 tokens por segundo en 4 x H100 80GB SXM5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|---|
| Hensy-330M (pretrain) | 328,5 M | 4.096 | Apache 2.0 | Inglés | No | HuggingFace, requiere código propio |
| SmolLM2-360M | 362 M | 8.192 | Apache 2.0 | Inglés (principalmente) | Sí, en su model card | HuggingFace, integrado en transformers, llama.cpp y vLLM |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Multilingüe (incluye español) | Sí, en su model card | HuggingFace, ampliamente soportado |
| Pythia-410M | 410 M | 2.048 | Apache 2.0 | Inglés | Sí, en su model card | HuggingFace, integrado en transformers |

Hensy-330M es el único de la comparativa sin resultados de benchmarks publicados y sin integración nativa en los runtimes de inferencia habituales. A cambio, ofrece checkpoints intermedios de preentrenamiento documentados y un contexto intermedio (4.096) superior al de Pythia-410M pero inferior al de SmolLM2-360M y Qwen2.5-0.5B. Los datos de los modelos comparados provienen de sus respectivas model cards públicas.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones, no respeta formatos de chat y puede producir continuaciones incoherentes o repetitivas; para uso conversacional hay que recurrir al checkpoint `-sft`.
- Entrenamiento corto: 5.000 millones de tokens para 328,5 M de parámetros supone una ratio de aproximadamente 15 tokens por parámetro, por debajo de lo habitual en modelos pequeños modernos (que suelen superar los 100 tokens por parámetro); es esperable un rendimiento inferior al de modelos del mismo tamaño mejor entrenados.
- Solo inglés: no se declara ni se ha verificado soporte de español ni de otros idiomas; el vocabulario es de tipo BPE de gran tamaño, lo que puede fragmentar gravemente texto en otros idiomas.
- Riesgo de alucinación: como cualquier LM causal sin verificación factual, puede generar afirmaciones falsas con fluidez, especialmente en contextos de completado libre.
- Sesgos: no se documenta la composición del corpus de entrenamiento, por lo que no es posible auditar sesgos de género, raza, religión o ideología; se deben asumir los sesgos presentes en datos web en inglés.
- Integración limitada: no funciona con `AutoModelForCausalLM` de transformers ni con herramientas estándar de serving; requiere cargar `config.py`, `model.py` y el tokenizador `xerv-crayon` desde el repositorio, lo que añade riesgo de cadena de suministro y fricción en producción.
- Repositorio de 8,9 GB: incluye tres checkpoints completos; conviene descargar solo `final/` para evitar transferencias innecesarias.
- Sin métricas de evaluación: no hay benchmarks, evaluación de seguridad ni pruebas de robustez publicadas, por lo que no se puede estimar su calidad relativa frente a alternativas sin evaluarlo internamente.
- Licencia Apache 2.0: permite uso comercial y modificaciones sin obligación de compartir derivados, pero se distribuye «tal cual», sin garantías ni indemnización por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Phase-Technologies/hensy-330m-pretrain
- Modelo derivado con ajuste supervisado: https://huggingface.co/Phase-Technologies/hensy-330m-sft
- Texto de la licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- RunPod (infraestructura de entrenamiento): https://runpod.io
- Google Colab: https://colab.research.google.com/
- Paper, blog o repositorio adicional: no disponible; la búsqueda web no devolvió resultados relevantes sobre este modelo (únicamente definiciones de diccionario del término «phase»).
