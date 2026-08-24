# refrigerator-ai/RefrigeratorAI-8B-2

## Resumen

RefrigeratorAI-8B-2 es un modelo de lenguaje basado en la arquitectura LFM2.5-8B-A1B de Liquid AI, desarrollado por la organizacion Refrigerator AI. Se presenta como el modelo base para el proyecto RefrigeratorAI, un sistema propietario del que no se ofrecen detalles adicionales en la documentacion publica. El modelo esta orientado a generacion de texto conversacional y ha sido ajustado con instrucciones (instruction-tuned).

La caracteristica mas destacable de este modelo es su etiquetado como "uncensored", "non-censored" y "unfiltered", lo que indica que no aplica filtros de seguridad o moderacion de contenido en sus respuestas. Esta caracteristica, junto con su soporte multilingue para japones, ingles y chino, lo posiciona como una opcion para aplicaciones que requieren generacion de contenido sin restricciones tematicas. No obstante, la informacion publica disponible es extremadamente limitada: no se especifican datos de entrenamiento, licencia, ni benchmarks de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en LFM2.5-8B-A1B |
| Parametros totales | 8.730.000.832 (8,73 B) |
| Parametros activos | ~1 B (estimado segun nomenclatura A1B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible via comunidad, sin especificar variantes) |
| Idiomas soportados | japones, ingles, chino |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en LFM2.5-8B-A1B de Liquid AI, una arquitectura MoE (Mixture of Experts) con 8,73 mil millones de parametros totales y aproximadamente 1 mil millon de parametros activos por token, segun la nomenclatura del modelo base. La arquitectura LFM (Liquid Foundation Model) emplea un mecanismo de mezcla de expertos que activa selectivamente subconjuntos de parametros durante la inferencia, lo que permite un equilibrio entre capacidad y eficiencia computacional.

No se dispone de informacion sobre el proceso de entrenamiento especifico de RefrigeratorAI-8B-2. Se desconoce el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO u otros metodos de alineacion. La unica referencia disponible indica que el modelo "opera un vector unico para LFM2.5-8B-A1B", lo que sugiere un ajuste fino sobre el modelo base, pero sin detalles tecnicos adicionales.

## Capacidades

- Generacion de texto conversacional en japones, ingles y chino.
- Ajuste con instrucciones (instruction-tuned) para seguir comandos y directrices del usuario.
- Generacion de contenido sin filtros de moderacion ni censura, segun las etiquetas del modelo.
- Capacidad multilingue limitada a tres idiomas: japones, ingles y chino.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir narrativa, dialogos o guiones en japones, ingles o chino sin aplicar filtros tematicos, lo que resulta util para escritores que exploran temas controvertidos o adultos.
- Traduccion informal entre japones, ingles y chino: su naturaleza multilingue permite traducciones conversacionales, aunque sin garantias de precision formal.
- Chatbots de rol sin moderacion: adecuado para comunidades que requieren personajes conversacionales sin restricciones de contenido, como foros de rol o juegos de texto.
- Generacion de datos sinteticos para entrenamiento: puede emplearse para crear datasets de texto sin censura que posteriormente se filtren o alineen con otros modelos.
- Experimentacion en investigacion sobre alineacion y seguridad: util para estudiar el comportamiento de modelos sin filtros de seguridad y comparar con versiones alineadas.
- Base para fine-tuning especializado: al ser un modelo base, puede ajustarse para tareas especificas que requieran generacion de texto sin restricciones en los tres idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar que permitan comparar el rendimiento del modelo con alternativas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 8,73 B de parametros totales y ~1 B activos, una cuantizacion de 4 bits requeriria aproximadamente 5-6 GB de VRAM para los pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: el modelo base LFM2.5-8B-A1B esta disenado para ejecutarse en GPUs consumer de gama media-alta. Una RTX 3090 o RTX 4090 con 24 GB de VRAM seria suficiente para inferencia con cuantizacion de 4-8 bits.
- Compatibilidad con consumer GPU: si, gracias a su arquitectura MoE con pocos parametros activos, puede ejecutarse en GPUs de 12-16 GB con cuantizacion adecuada.
- Opciones de despliegue: llama.cpp, Ollama y otras herramientas compatibles con GGUF. Para safetensors, puede usarse vLLM o TGI si se dispone de suficiente VRAM.
- Latencia y throughput: no disponibles. La arquitectura MoE con ~1 B de parametros activos sugiere una latencia relativamente baja, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| RefrigeratorAI-8B-2 | 8,73 B totales, ~1 B activos | no disponible | ja, en, zh | no disponible | Sin censura, basado en LFM2.5 |
| LiquidAI/LFM2.5-8B-A1B | 8,73 B totales, ~1 B activos | no disponible | no disponible | no disponible | Modelo base, sin ajuste por instrucciones |
| Mistral 7B | 7,24 B densos | 32k | multi | Apache 2.0 | Modelo denso, ampliamente adoptado, con censura |

La comparativa se limita a datos publicos. RefrigeratorAI-8B-2 se distingue principalmente por su ausencia de filtros de contenido, mientras que alternativas como Mistral 7B ofrecen documentacion completa, licencia permisiva y benchmarks publicados.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el modelo puede generar contenido ofensivo, ilegal, peligroso o inapropiado. No debe desplegarse en aplicaciones publicas sin una capa de moderacion externa.
- Licencia no especificada: no se indica bajo que terminos puede usarse el modelo, lo que genera incertidumbre legal para uso comercial o redistribucion.
- Documentacion insuficiente: no hay informacion sobre datos de entrenamiento, sesgos, alucinaciones ni limitaciones de contexto. Esto impide evaluar riesgos de produccion.
- Soporte de idiomas limitado: solo japones, ingles y chino. No cubre otros idiomas, incluido el espanol.
- Riesgo de alucinacion: sin datos de entrenamiento ni evaluaciones, no se puede estimar la fiabilidad factual del modelo.
- Comunidad reducida: cero descargas y cero likes en HuggingFace, lo que sugiere una adopcion minima y poco soporte comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/refrigerator-ai/RefrigeratorAI-8B-2
- Version GGUF (comunidad): https://huggingface.co/mradermacher/RefrigeratorAI-8B-GGUF
- Organizacion Refrigerator AI: https://huggingface.co/refrigerator-ai/models
- Sitio web del proyecto: https://www.refrigeratorai.com/
- Modelo base LFM2.5-8B-A1B: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
