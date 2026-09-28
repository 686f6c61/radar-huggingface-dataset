# Skebobic/Bobic-1.0

## Resumen

Bobic 1.0 es un modelo de lenguaje autoregresivo de nivel caracter (char-level) desarrollado por el usuario Skebobic bajo licencia MIT. Con 11.653.533 parametros (~11,6 M), es el modelo fundacional de la serie Bobic y se posiciona en la categoria de small language models (SLM) ultra ligeros, muy por debajo de los modelos convencionales que se miden en miles de millones de parametros.

El modelo opera sobre vocabulario de caracteres (669 caracteres unicos) en lugar de tokens subword, con una ventana de contexto de 256 caracteres y una arquitectura transformer decoder-only de 6 bloques con 384 dimensiones ocultas y 6 cabezas de atencion. Fue entrenado sobre exportaciones de chats de Telegram, preguntas sinteticas de razonamiento fisico y operaciones matematicas basicas, con soporte declarado para ruso e ingles.

Su relevancia es experimental y educativa: por tamano cabe en cualquier hardware, incluida CPU, y sirve como caso de estudio para entender el pipeline completo de un transformer char-level extremadamente pequeno. No esta pensado para tareas de produccion de proposito general y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only (char-level) |
| Parametros totales | 11.653.533 (~11,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 caracteres |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP32 sin cuantizar) |
| Idiomas soportados | ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`bobic_1.0.pt`, FP32 sin cuantizar) |

Otros parametros declarados por el autor: vocabulario de 669 caracteres unicos, 6 bloques transformer, 384 dimensiones de embedding y 6 cabezas de atencion multi-head.

## Arquitectura y entrenamiento

La arquitectura es un transformer autoregresivo estandar de tipo decoder-only con atencion multi-head causal (mascara triangular), normalizacion por capas (LayerNorm) previa a cada subcapa, y bloque feed-forward con dimension interna 4x (1536) y activacion GELU. Usa embeddings de token y embeddings posicionales aprendidos (no RoPE ni posicionales sinusoidales), y una cabeza lineal final que proyecta a los 669 caracteres del vocabulario. El modelo no emplea tokenizador subword: el texto se procesa directamente a nivel de caracter, lo que simplifica el pipeline pero limita drasticamente la longitud efectiva de texto que puede abarcar.

Segun la informacion disponible, el entrenamiento se realizo sobre tres fuentes: registros de chats exportados de Telegram, preguntas sinteticas de razonamiento fisico y operaciones matematicas basicas. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El ejemplo de inferencia del autor indica un escalado de logits por temperatura de 0,4 antes del argmax.

## Capacidades

- Generacion de texto autoregresiva a nivel de caracter en ruso e ingles, segun los idiomas declarados en la model card.
- Modelado de estilo conversacional derivado de los registros de chat de Telegram usados en el entrenamiento.
- Respuesta a preguntas sinteticas de fisica elemental incluidas en el conjunto de entrenamiento.
- Ejecucion de operaciones matematicas basicas, segun lo declarado por el autor.
- Inferencia en CPU y GPU mediante PyTorch, con el codigo de ejemplo proporcionado en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio, thinking mode ni multimodalidad.
- No se documenta una ficha de multilingueismo mas alla de ruso e ingles.

## Casos de uso

- Experimentacion educativa con transformers: el modelo, de apenas 11,6 M de parametros y con el codigo de definicion incluido en la model card, permite reproducir de principio a fin el ciclo de carga de pesos, definicion de la arquitectura y generacion sin necesidad de infraestructura especializada.
- Prototipado de sistemas char-level: util para validar pipelines de preprocesado y postprocesado que trabajan directamente sobre caracteres, sin tokenizador subword de por medio.
- Generacion de texto con estilo chateado: dado que se entreno con exportaciones de Telegram, puede emplearse para generar respuestas con ese registro conversacional concreto en ruso o ingles.
- Investigacion sobre modelos ultraligeros: sirve como linea base para estudiar el comportamiento de un transformer muy pequeno frente a modelos mayores en tareas acotadas.
- Aprendizaje de fisica elemental: puede usarse para tantear como un modelo minusculo responde a preguntas sinteticas de razonamiento fisico basicas, siempre con expectativas limitadas.
- Operaciones aritmeticas simples: adecuado para pruebas de generacion de resultados de sumas o calculos sencillos, dentro de las limitaciones de un contexto de 256 caracteres.
- Demostraciones en hardware restringido: al pesar unas decenas de MB en FP32, puede ejecutarse en dispositivos sin GPU, como ejercicios de despliegue en CPU o entornos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 46,6 MB (11.653.533 parametros x 4 bytes). La VRAM total necesaria es muy reducida, aunque depende del framework y del tamano de lote.
- GPU recomendadas: no se especifican en la informacion disponible. Dado el tamano, cualquier GPU, incluida una integrada, resulta sobredimensionada para este modelo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU, dada su magnitud.
- Opciones de despliegue: la model card solo documenta inferencia con PyTorch cargando el checkpoint `bobic_1.0.pt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos (FP32 PyTorch, char-level con arquitectura definida en el propio codigo de ejemplo) no es directamente compatible con esos runners sin conversion adicional.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Tamano muy reducido: con 11,6 M de parametros, la capacidad de generalizacion y de coherencia en textos largos es muy limitada en comparacion con SLMs convencionales.
- Contexto de 256 caracteres: la ventana es extremadamente corta, lo que impide mantener contexto en conversaciones multi-turno o en documentos de cierta extension.
- Tokenizacion char-level: al operar sobre caracteres, el modelo consume muchos mas pasos de inferencia para producir el mismo texto que un modelo subword, y la longitud efectiva de texto generado es muy corta.
- Riesgo elevado de alucinacion: no hay indicios de fases de alineacion (RLHF/DPO) en la informacion disponible, por lo que las salidas pueden ser incoherentes o inventadas.
- Sesgos conocidos: no se documentan, pero el entrenamiento sobre chats de Telegram puede arrastrar sesgos propios de esas conversaciones.
- Cobertura de idiomas limitada a ruso e ingles; no se declara soporte de castellano ni de otros idiomas.
- Uso comercial: la licencia MIT permite uso comercial, pero el rendimiento del modelo hace poco realista su uso en produccion de proposito general.
- Repositorio sin adopcion: el modelo registra 0 descargas y 0 likes, y un tamano de repositorio de 0,0 GB en el momento de los datos, lo que sugiere que los pesos podrian no estar disponibles publicamente en el repositorio.
- No se documentan limitaciones adicionales en la model card mas alla de las derivadas de su tamano y su contexto.
- Entrenamiento declarado sobre datos de chats de Telegram: podria haber consideraciones de privacidad o de origen de datos no detalladas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Skebobic/Bobic-1.0
- Perfil del autor: https://huggingface.co/Skebobic
