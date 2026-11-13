# bambocher/Qwen3.5-9B-heretic-oQ6-mtp

## Resumen

Qwen3.5-9B-heretic-oQ6-mtp es una cuantizacion mixta en formato MLX del modelo base Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. El checkpoint conserva 9.653.104.368 parametros logicos distribuidos entre el modelo de lenguaje (8.954B), un codificador visual (0.456B) y una cabeza MTP (Multi-Token Prediction, 0.243B), lo que confirma que el modelo original es multimodal y soporta decodificacion especulativa nativa. La cuantizacion se ha realizado con oQ (oMLX v0.7.3), una herramienta de cuantizacion de precision mixta que asigna distintos niveles de bits por tensor segun su sensibilidad.

El resultado es un checkpoint de 8.654 GB (8.060 GiB) con una media efectiva de 7.172 bits por peso, pensado para ejecutarse en Apple Silicon mediante la libreria MLX. La mezcla combina 6 bits afines con grupo 64 para el 85,5% de los pesos, 8 bits para el 9,5% y BF16 sin cuantizar para el 5,1% restante (presumiblemente capas criticas como embeddings, normalizaciones o proyecciones de atencion).

El sufijo "heretic" suele indicar en la comunidad un ajuste fino orientado a reducir rechazos y censura del modelo (abliteracion parcial o entrenamiento con datos sin filtrado), aunque la model card no documenta el proceso. El modelo es relevante para desarrolladores que trabajan en entornos macOS y necesitan un LLM multimodal de ~9B con contexto largo, tool calling y prediccion multi-token, sin recurrir a GPUs dedicadas. La informacion publicada es muy escasa: no hay benchmarks, no se declara licencia, no se listan idiomas y el modelo acumula cero descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Qwen3.5) con cabeza MTP; pesos en formato MLX |
| Parametros totales | 9.653.104.368 (9.653B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta: affine 6-bit grupo 64 (85,46%), affine 8-bit grupo 64 (9,45%), BF16 (5,08%); media efectiva 7,172 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repo de 8,7 GB |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 7,499 GB / 6,984 GiB |
| Vision | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,243 GB / 0,226 GiB |
| Total | 9,653B | 8,654 GB / 8,060 GiB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen3.5-9B ni su proceso de entrenamiento; la model card se limita a documentar la cuantizacion. Por los componentes del checkpoint se deduce una arquitectura transformer decoder-only con un modulo de vision (0,456B parametros) que permite entrada de imagenes, y una cabeza MTP de 0,243B parametros que habilita la prediccion de varios tokens por paso, tecnica habitual para acelerar la decodificacion especulativa en inferencia.

La cuantizacion oQ de oMLX aplica precision mixta segun la sensibilidad de cada tensor: los pesos mas tolerantes se almacenan en affine 6-bit con grupo 64 (6,50 bits efectivos por peso), un subconjunto en affine 8-bit (8,50 bits efectivos) y un 5% en BF16 sin perdida (16 bits efectivos). No hay informacion sobre el dataset de entrenamiento, volumen de tokens, uso de RLHF/DPO ni el procedimiento "heretic" aplicado al modelo base.

## Capacidades

- Generacion de texto autoregresiva en un modelo de ~9B parametros, con calidad superior a variantes de 4-7B.
- Procesamiento de imagenes: el modulo de vision de 0,456B parametros permite tareas de comprension visual (VQA, descripcion, OCR probable).
- Prediccion multi-token (MTP): la cabeza dedicada acelera la generacion mediante decodificacion especulativa integrada.
- Razonamiento multi-paso y cadenas de pensamiento, capacidad heredada del modelo base Qwen3.5 (no verificada en esta ficha por falta de benchmarks).
- Tool calling / function calling: presumible del modelo base Qwen3.5, no documentado en la model card.
- Soporte de agentes: no documentado explicitamente; la ventana de contexto del base no se declara.
- Capacidades multilingues: no disponibles; el modelo base Qwen suele cubrir chino e ingles como minimo, pero no hay confirmacion.
- Modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Asistente local en Mac con Apple Silicon: el checkpoint MLX de 8,06 GiB cabe en equipos con 16 GB de memoria unificada, permitiendo un asistente conversacional privado sin conexion a la nube.
- Procesamiento de documentos con imagenes: usar el modulo de vision para extraer informacion de capturas, facturas o diagramas y combinarla con razonamiento textual en el mismo modelo.
- Generacion de codigo en IDE local: integrar el modelo en plugins de editores (por ejemplo via mlx-lm como servidor compatible con OpenAI API) para autocompletado y refactorizacion con baja latencia gracias a la cabeza MTP.
- Prototipado rapido de pipelines multimodales: experimentar con VQA o captioning sin necesidad de GPU CUDA, usando el backend MLX en un portatil.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia para estudiar el impacto de la precision mixta oQ (6/8/BF16) frente a cuantizaciones uniformes de 4 o 6 bits en tareas de razonamiento y vision.
- Evaluacion de variantes "heretic": util para medir diferencias de comportamiento (tasa de rechazo, tono) frente al Qwen3.5-9B original en entornos controlados.
- Servicio de inferencia de baja concurrencia: desplegar como endpoint HTTP local con mlx-lm para un equipo pequeno, con throughput adecuado para uso interactivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: ~8-9 GB solo para pesos; con cache KV y overhead de runtime, planificar 10-14 GB segun longitud de contexto.
- Plataforma: exclusivamente Apple Silicon (M1/M2/M3/M4) por el formato MLX; no es directamente compatible con CUDA.
- Equipos viables: Mac con 16 GB de memoria unificada como minimo; 24-32 GB recomendado para contextos largos y uso multimodal.
- GPU NVIDIA: no aplicable sin conversion previa de pesos a safetensors estandar o GGUF; no se proporciona script de conversion en la informacion.
- Opciones de despliegue: mlx-lm (generacion y servidor compatible con OpenAI API), MLX Swift para apps nativas, y conversion manual a llama.cpp/Ollama si se requiere portabilidad (no documentada).
- Latencia y throughput: no disponibles; la cabeza MTP deberia mejorar la velocidad de decodificacion respecto a un modelo sin decodificacion especulativa, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ6-mtp (este) | 9,653B | no disponible | oQ mixta 6/8/BF16 (~7,17 bits) | no disponible | MLX (Apple Silicon) |
| Qwen3.5-9B (base, hipotetico) | ~9B | no disponible | BF16 | no disponible | multiplataforma |
| Qwen2.5-VL-7B | ~8B | 32k+ (segun variante) | BF16, GPTQ, AWQ | Apache 2.0 (variante oficial) | CUDA, MLX via conversiones |
| Llama 3.1 8B Instruct | 8,03B | 128k | BF16, GGUF, AWQ | Llama Community License | CUDA, CPU, MLX |

La comparacion con Qwen3.5-9B base y con Qwen2.5-VL-7B es orientativa: no hay datos publicados de rendimiento para este checkpoint, y las cifras de los alternativos corresponden a sus model cards oficiales, no a una evaluacion directa frente a este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas visuales; evaluar antes de usar en produccion.
- Licencia no declarada: no se puede asumir uso comercial permitido; contactar al autor o consultar la licencia del Qwen3.5-9B original antes de desplegar.
- El ajuste "heretic" implica un modelo con filtros de seguridad reducidos: mayor riesgo de generar contenido inapropiado, ofensivo o inseguro; requiere moderacion externa en aplicaciones publicas.
- Riesgo de alucinacion estandar de un LLM de ~9B, agravado potencialmente por la cuantizacion mixta en capas de 6 bits.
- Contexto maximo no documentado: no planificar aplicaciones que dependan de ventanas largas sin verificar empiricamente el limite.
- Idiomas no declarados: no asumir castellano de calidad; validar antes de usar en produccion en espanol.
- Formato MLX exclusivo: no ejecutable en GPUs NVIDIA o TPU sin conversion; limita el despliegue a entornos Apple.
- Modelo con cero descargas y cero likes: sin validacion de la comunidad, posible presencia de errores de cuantizacion no detectados.
- Perdida de precision por cuantizacion: aunque la media de 7,17 bits es alta, las capas a 6 bits pueden degradar tareas sensibles (matematicas, codigo exacto).

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ6-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Repositorio MLX (Apple): https://github.com/ml-explore/mlx
- mlx-lm (inferencia LLM en MLX): https://github.com/ml-explore/mlx-lm
