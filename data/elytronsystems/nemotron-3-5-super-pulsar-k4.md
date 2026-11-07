# ElytronSystems/Nemotron-3.5-Super-pulsar-k4

## Resumen

Nemotron-3.5-Super-pulsar-k4 es un contenedor de inferencia listo para servir del modelo multimodal NVIDIA Nemotron 3.5 Super VL 120B-A12B, publicado por ElytronSystems para el motor pulsar sobre hardware DGX Spark (GB10). No es un modelo entrenado desde cero, sino una cuantizacion del checkpoint oficial de NVIDIA a EXL3 de 4.0 bits por peso, empaquetada junto con el drafter LiLiCorr de NVIDIA para decodificacion especulativa y la torre de vision C-RADIO ViT-H/16 en BF16. El resultado ocupa 61 GB y evita descargas adicionales en tiempo de despliegue.

El modelo subyacente es un transformer hibrido de tipo Nemotron-H que combina capas Mamba2 con atencion y una mezcla de expertos (MoE) con 124,45 mil millones de parametros totales y 12 mil millones activos por token, segun declara el autor. La ficha de Hugging Face detecta 62.983.004.362 parametros porque cuenta los bytes empaquetados de EXL3 como si fueran parametros, un artefacto conocido de la cuantizacion. El contexto declarado en el ejemplo de servicio es de 1.048.576 tokens con 64 GB de espacio KV en disco.

Su relevancia es doble: por un lado, permite ejecutar un modelo de 120B con vision y contexto de un millon de tokens en un dispositivo de escritorio con memoria unificada; por otro, documenta de forma cuantitativa la perdida de calidad frente a BF16 y frente a las alternativas NVFP4 de NVIDIA. El propio autor lo marca como experimental y no apto todavia para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H hibrido: Mamba2 + atencion + MoE (mezcla de expertos) |
| Parametros totales | 124,45B (upstream); 62.983.004.362 detectados en safetensors por el empaquetado EXL3 |
| Parametros activos | 12B (A12B) |
| Longitud de contexto | 1.048.576 tokens en la configuracion de servicio documentada |
| Tipos de cuantizacion | EXL3 4.0 bpw en lineales del decoder; EXL3 6 bpw en la cabeza de salida; BF16 en normas, convoluciones, parametros SSM, router y embeddings; drafter NVFP4 W4A16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors empaquetados en contenedor pulsar, con SHA256SUMS por shard |
| Tamano del repositorio | 127,8 GB |
| Tamano del contenedor en ejecucion | 61 GB (58 GB de pesos EXL3 + ~1,7 GB de torre de vision + drafter) |
| Entrada multimodal | Imagen (PNG, JPEG); video no soportado |
| Libreria de inferencia | pulsar (rama dev) |
| Hardware objetivo | NVIDIA DGX Spark (GB10) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es Nemotron-H, un diseno hibrido que intercala capas de espacio de estados Mamba2 con capas de atencion y sustituye parte del FFN por una mezcla de expertos con enrutado. El checkpoint upstream tiene 124,45B parametros totales y 12B activos, lo que reduce el coste computacional por token a pesar del tamano del modelo. La torre de vision es un ViT-H/16 C-RADIO de NVIDIA con pixel shuffle y un proyector `mlp1`, en BF16 y con aproximadamente 1,7 GB.

Sobre el entrenamiento del modelo base no se aporta informacion en la documentacion disponible: no se detallan el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. La model card del contenedor remite explicitamente a las model cards originales de NVIDIA incluidas en el repositorio (`NVIDIA_MODEL_CARD.md`, `NVIDIA_LILICORR_MODEL_CARD.md`), junto con los documentos `bias.md`, `explainability.md`, `privacy.md` y `safety.md`, como fuente autorizada para datos de entrenamiento, uso previsto y limitaciones.

La innovacion tecnica del contenedor es la receta de cuantizacion y el empaquetado. Los pesos EXL3 se generaron con exllamav3 1.6.2 usando 250 filas de calibracion de 2048 tokens y codebook `mul1`, y se reempaquetaron byte a byte en el contenedor de pulsar. La decodificacion especulativa la aporta el drafter LiLiCorr de NVIDIA en NVFP4 (W4A16), que sustituye a la cabeza MTP no incluida; el drafter solo propone tokens que el modelo verifica, por lo que la distribucion de salida es la del modelo cuantizado. El modo de pensamiento (thinking) esta activado por defecto y se conservan sin cambios el chat template y el tokenizer de NVIDIA.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 1.048.576 tokens en la configuracion documentada.
- Razonamiento con modo thinking activado por defecto.
- Comprension de imagenes: acepta `image_url` con URL `data:` en chat completions de estilo OpenAI o bloques `image` en mensajes de estilo Anthropic; PNG y JPEG se decodifican en el servidor.
- Capacidades de codigo, matematicas y razonamiento cientifico propias de la familia Nemotron, segun la descripcion publica de NVIDIA (no se aportan resultados concretos en el contenedor).
- Uso en aplicaciones agenticas segun la orientacion publica de la familia Nemotron; no se documenta en esta ficha soporte explicito de tool calling ni de function calling.
- Decodificacion especulativa con drafter LiLiCorr para acelerar la generacion.
- Multilingue: no disponible, no se declaran idiomas soportados.
- Video: no soportado, solo imagenes.

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: el contexto de 1.048.576 tokens permite procesar contratos, informes o expedientes completos junto con sus figuras y tablas escaneadas en una sola peticion, sin trocear el material.
- Asistencia tecnica sobre manuales y diagramas: el modelo puede recibir capturas de esquemas, diagramas de arquitectura o fotografias de equipos y responder preguntas de soporte combinando vision y contexto largo.
- Extraccion estructurada de informacion de formularios y facturas: la torre C-RADIO procesa la imagen del documento y el modelo genera la salida estructurada; el despliegue local en DGX Spark mantiene los datos dentro del perimetro de la organizacion.
- Prototipado de agentes con memoria larga: el contexto de un millon de tokens permite mantener historiales de sesion muy extensos o bases de conocimiento inyectadas en el prompt, util para validar disenos agenticos antes de pasar a infraestructura mayor.
- Investigacion en cuantizacion y decodificacion especulativa: el repositorio incluye la metodologia de evaluacion KL frente a BF16 y frente a NVFP4, lo que lo convierte en una referencia reproducible para estudiar el impacto de EXL3 4.0 bpw en un MoE hibrido.
- Desarrollo y pruebas en hardware de escritorio: con 61 GB en un DGX Spark, un equipo puede validar prompts, plantillas de chat y flujos multimodales de un modelo de 120B sin acceso a un cluster de GPUs.
- Evaluacion comparativa de alternativas de servicio: al estar disponible tambien el checkpoint NVFP4 de NVIDIA, permite medir en el mismo hardware latencia y calidad entre EXL3 4.0 bpw y NVFP4 en sus distintos modos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo publica una evaluacion de fidelidad de la cuantizacion frente a las logits de referencia en BF16, medida con vLLM y top-64 logprobs sobre una suite de 48 conversaciones:

| Pesos | Tamano | KL de chat vs BF16 [IC 95%] | Acuerdo top-1 |
|---|---|---|---|
| NVFP4, solo pesos (A16) | 67 GB | 5,18e-2 [4,38; 5,96] | 94,78% |
| NVFP4 W4A16 | 67 GB | 5,64e-2 [4,72; 6,55] | 94,42% |
| NVFP4 W4A4 (modo por defecto de NVIDIA) | 67 GB | 6,55e-2 [5,47; 7,60] | 93,67% |
| EXL3 4.0 bpw (este contenedor) | 58 GB | 5,59e-2 [4,64; 6,52] | 93,89% |

Emparejado por conversacion, EXL3 4.0 bpw queda un 15% mas cerca de BF16 que NVFP4 en su modo W4A4 por defecto, empata con NVFP4 W4A16 y queda un 8% mas lejos que NVFP4 con activaciones sin cuantizar. No se aportan datos de latencia ni de throughput.

## Requisitos de hardware

- Memoria: el contenedor ocupa 61 GB en disco y debe residir en memoria unificada durante el servicio; el hardware objetivo es un DGX Spark (GB10) con 128 GB de memoria unificada. El ejemplo de servicio reserva ademas 65.536 MB de espacio KV en disco.
- GPU recomendadas: NVIDIA DGX Spark (GB10) es el unico hardware soportado de forma explicita por el motor pulsar segun la documentacion. No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no se declara compatibilidad con GPUs de consumo; el requisito de 61 GB de pesos mas KV excede la VRAM de cualquier tarjeta consumer actual, por lo que en la practica depende de la memoria unificada del GB10.
- Despliegue: motor pulsar, compilado desde la rama `dev` (la entrada de imagen requiere `dev` en el commit `309ed8fd` o posterior), lanzado con `pulsar-server -m /ruta/al/repo --drafter lilicorr --host 0.0.0.0 --port 8000`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- Latencia y throughput: no disponibles. La decodificacion especulativa con LiLiCorr esta pensada para reducir la latencia de generacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Calidad vs BF16 (KL de chat) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Super-pulsar-k4 (este) | 124,45B totales / 12B activos | 1.048.576 tokens en configuracion documentada | EXL3 4.0 bpw, 61 GB | 5,59e-2 | OpenMDW 1.1 | Hugging Face, motor pulsar en rama dev |
| NVIDIA Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr | 124,45B totales / 12B activos | no disponible en esta ficha | NVFP4, 67 GB | 5,18e-2 a 6,55e-2 segun modo | OpenMDW 1.1 | Hugging Face, oficial de NVIDIA |
| NVIDIA Nemotron-3.5-Super-VL-120B-A12B-BF16 | 124,45B totales / 12B activos | no disponible en esta ficha | BF16 | referencia | OpenMDW 1.1 | Hugging Face, oficial de NVIDIA |

La comparativa se limita a las variantes del mismo modelo base porque la informacion disponible no incluye otros modelos de la misma categoria con datos verificables. Frente al checkpoint BF16, este contenedor reduce el peso de 58 GB de lineales a EXL3 4.0 bpw con una perdida medida de calidad; frente a NVFP4, ofrece un tamano menor y una fidelidad intermedia entre W4A16 y A16.

## Limitaciones y advertencias

- Estado experimental: el soporte de Nemotron-H en pulsar es nuevo y tiene errores conocidos segun el autor, que no lo esta ejecutando en produccion.
- Calidad inferior a BF16: la cuantizacion EXL3 4.0 bpw introduce una divergencia medible (KL 5,59e-2, acuerdo top-1 del 93,89%), superior a la de NVFP4 con activaciones sin cuantizar.
- Dependencia de hardware y software muy especificos: requiere DGX Spark (GB10) y una compilacion concreta de la rama `dev` de pulsar; no hay soporte documentado para otros aceleradores ni para motores de inferencia habituales.
- Vision limitada a imagenes: no se soporta video. Las descargas anteriores al 2026-11-04 (59 GB, sin torre de vision) rechazan las peticiones de imagen.
- Idiomas no declarados: la ficha no especifica cobertura linguistica, por lo que el rendimiento fuera del ingles no esta garantizado.
- Riesgo de alucinacion y sesgos: no se documentan en el contenedor; el autor remite a `bias.md`, `safety.md` y a las model cards de NVIDIA, que no se reproducen aqui.
- Licencia: OpenMDW 1.1 permite uso comercial con condiciones; debe revisarse el texto completo en el enlace de licencia antes de desplegar. Es una compilacion no oficial, no afiliada ni respaldada por NVIDIA.
- Capacidades agenticas no verificadas: no se documenta soporte explicito de tool calling ni de function calling en este contenedor, a pesar de la orientacion agentica de la familia.
- Ausencia de benchmarks de tareas: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares para este contenedor, lo que impide comparar su rendimiento funcional con otros modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ElytronSystems/Nemotron-3.5-Super-pulsar-k4
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Drafter LiLiCorr NVFP4 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr
- Motor de inferencia pulsar: https://github.com/tylerwagler/pulsar
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Pagina de la familia Nemotron en NVIDIA: https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/
- Entrada de Nemotron en Wikipedia: https://en.wikipedia.org/wiki/Nemotron
