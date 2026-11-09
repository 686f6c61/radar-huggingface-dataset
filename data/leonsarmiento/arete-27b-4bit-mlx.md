# leonsarmiento/Arete-27B-4bit-mlx

## Resumen
Arete-27B-4bit-mlx es una cuantizacion uniforme de 4 bits en formato MLX del modelo NousResearch/Arete-27B, un VLM denso de tipo híbrido (atención lineal y atención completa) desarrollado por Nous Research a partir de Qwen/Qwen3.8-27B. El modelo base aplica un post-entrenamiento supervisado (SFT) sobre un modelo entrenado originalmente en chino para reforzar valores occidentales en siete categorias concretas (libertad de expresion, ideologia estatal, estado frente a mercado libre, educacion, privacidad y vigilancia de datos, democracia y politica medioambiental). Esta version, publicada por el usuario leonsarmiento, conserva la torre de vision y permite inferencia multimodal mediante mlx-vlm.

El interes de esta ficha reside en que combina tres elementos poco habituales: un VLM de 27.356 millones de parametros con 64 capas (48 de atencion lineal y 16 de atencion completa) y 262K tokens de contexto, un ajuste de alineacion de valores medido con un benchmark abierto (Propaganda Eval), y una cuantizacion de 4 bits que reduce el peso a 15,62 GB en tres shards, lo que lo hace viable en hardware Apple Silicon de gama alta.

La cuantizacion es "plain vanilla": no incluye cabezas MTP (multi-token prediction) porque el repositorio fuente no las distribuye. El chat template es identico byte a byte al original y soporta `reasoning_effort` con cuatro niveles. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido con atencion lineal y atencion completa (64 capas: 48 lineales + 16 completas), torre de vision integrada |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens (64K durante el entrenamiento del modelo base) |
| Tipos de cuantizacion | 4 bits afine uniforme, group_size=64; normas en bf16; torre de vision tambien a 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX, 3 shards, ~4,56 bpw, 15,62 GB) |

## Arquitectura y entrenamiento
El modelo base Arete-27B es un VLM denso derivado de Qwen3.8-27B con arquitectura de atencion hibrida: 64 capas, de las cuales 48 usan atencion lineal y 16 atencion completa, lo que reduce el coste computacional en contextos largos manteniendo capacidad de recuperacion global. Incorpora una torre de vision que, en el modelo fuente, quedo congelada durante el entrenamiento (los datos fueron solo de texto). El post-entrenamiento de Nous Research consistio en SFT puro, sin RL ni optimizacion de preferencias: aproximadamente 20.000 prompts y 52,8 millones de tokens distribuidos en siete categorias de valores, destilados del profesor abierto Inkling, durante 2 epocas y con contexto de 64K. Se entrenaron todos los pesos del modelo de lenguaje; la torre de vision no se entreno y la cabeza MTP se desactivo durante el entrenamiento.

Esta cuantizacion MLX aplica 4 bits afine con group_size=64 a todas las capas cuantizables (atencion, atencion lineal, MLP, embeddings, lm_head y torre de vision), dejando las normas en bf16. La verificacion offline reporta 23/23 comprobaciones superadas, ausencia total de claves `mtp.*`, coherencia de metadatos e indice, y desviaciones rel-L1 de 0,097-0,104 en texto y 0,166 en vision frente al BF16 original, con correlacion igual o superior a 0,992. El chat template se mantiene identico al fuente y acepta `reasoning_effort` en {low, medium, high, xhigh} con valor por defecto `xhigh`.

## Capacidades
- Generacion de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento explicito con modo thinking (`<think>`) y cierre de turno correcto, verificado en runtime.
- Razonamiento matematico basico y recall de hechos (verificado: 15x37=555, Canberra).
- Procesamiento de imagen y texto (image-text-to-text) mediante mlx-vlm, con torre de vision preservada a 4 bits.
- Tool calling y function calling: el autor recomienda `tool_call_parser: qwen3_xml` y `reasoning_parser: qwen3`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (low, medium, high, xhigh).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Alineacion de valores en siete categorias medida con Propaganda Eval (reduccion de respuestas con propaganda del 22% al 0,9% en el modelo base).

## Casos de uso
- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial largo gracias a los 262K tokens de contexto, y el modo thinking permite razonar sobre politicas de negocio antes de responder.
- Analisis de documentos con imagenes: al conservar la torre de vision, puede procesar capturas, formularios escaneados o graficos junto con texto en un mismo prompt, util para extraccion de datos en back office.
- Generacion de codigo asistida con tool calling: el parser `qwen3_xml` permite integrarlo en pipelines donde el modelo invoca funciones externas (ejecutar tests, consultar APIs) dentro de un bucle agentico.
- Moderacion y analisis de sesgo ideologico: su entrenamiento especifico en categorias como libertad de expresion o vigilancia de datos lo hace adecuado para auditar contenido y detectar propaganda, usando el propio Propaganda Eval como referencia metodologica.
- Despliegue local en Apple Silicon: con 15,62 GB en 4 bits, cabe en Mac con 24-32 GB de memoria unificada, lo que permite prototipado offline sin GPU dedicada.
- Investigacion en alineacion de valores: sirve como punto de comparacion frente al Qwen3.8-27B original para estudiar el efecto del SFT en dominios concretos sin cambios arquitectonicos.
- Asistente de razonamiento con esfuerzo configurable: en produccion se puede fijar `reasoning_effort` a `low` para tareas simples y `xhigh` para analisis complejos, ajustando coste y latencia.

## Benchmarks y rendimiento
Los unicos datos publicados corresponden al modelo base (NousResearch/Arete-27B), no a esta cuantizacion.

| Benchmark | Antes (Qwen3.8-27B base) | Despues (Arete-27B) |
|---|---|---|
| Propaganda Eval, fact mean (sobre 5) | 2,32 | 2,98 |
| Propaganda Eval, respuestas con propaganda | 22% | 0,9% |
| Libertad de expresion, fact score | 0,89 | 2,44 |
| Libertad de expresion, propaganda | 60% | 1% |
| Hermes Bench | 65,77% | 65,60% |
| Terminal-Bench-2.1 | 67% | 70% |

No se han publicado resultados de benchmarks para la version cuantizada a 4 bits en la informacion disponible. La verificacion del autor solo confirma coherencia cualitativa en runtime (matematicas, recall de hechos, razonamiento limpio).

## Requisitos de hardware
- VRAM/memoria estimada: 15,62 GB de pesos en 4 bits; con overhead de KV cache y runtime, se recomienda al menos 20-24 GB de memoria unificada o VRAM.
- GPU recomendadas: al ser formato MLX, el destino natural es Apple Silicon (M1/M2/M3/M4 Pro, Max y Ultra). No es compatible de forma nativa con CUDA.
- Cabe en consumer hardware: si, en Mac con 24 GB o mas de memoria unificada; en 32 GB hay margen para contexto largo.
- Opciones de despliegue: LM Studio y oMLX (verificados por el autor), mlx-vlm para uso programatico. No soporta vLLM, llama.cpp, Ollama ni TGI de forma nativa por el formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parsers recomendados: `reasoning_parser: qwen3`, `tool_call_parser: qwen3_xml`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| leonsarmiento/Arete-27B-4bit-mlx | 27,36B | 262K | 4 bits MLX uniforme | Apache 2.0 | Sin MTP, vision a 4 bits, formato MLX |
| leonsarmiento/Arete-27B-oQ4e | 27,36B (base) | 262K | Mezcla 4/5/6/8 bits guiada por imatrix | Apache 2.0 | +1,6 GB, alternativa data-aware del mismo autor |
| leonsarmiento/Qwen3.8-27B-heretic-ara-4bit-mtp-mlx | 27,36B (base) | 262K | 4 bits MLX con MTP | Apache 2.0 | Variante con cabezas MTP para decodificacion acelerada |
| NousResearch/Arete-27B | 27,36B | 262K | BF16 | Apache 2.0 | Modelo fuente sin cuantizar |

## Limitaciones y advertencias
- El ajuste de valores se realizo con SFT puro, sin RLHF ni DPO; la robustez de la alineacion ante prompts adversarios no esta medida mas alla del Propaganda Eval.
- La torre de vision no se entreno (datos solo de texto), por lo que el rendimiento multimodal depende integramente del modelo Qwen3.8-27B subyacente.
- La cuantizacion a 4 bits introduce degradacion medible: rel-L1 de 0,097-0,104 en texto y 0,166 en vision, con correlacion minima de 0,992. Aceptable para uso general, pero conviene validar en tareas sensibles.
- No incluye cabezas MTP, por lo que no se beneficia de decodificacion especulativa nativa; para eso existe la variante MTP del mismo autor.
- Solo funciona en el ecosistema MLX (Apple Silicon); no hay pesos GGUF ni safetensors estandar para CUDA.
- Idiomas soportados no documentados; el modelo base se entreno sobre Qwen3.8-27B, pero no se detalla la cobertura linguistica del SFT.
- Riesgo de alucinacion inherente a modelos de 27B, agravado en contextos muy largos si la informacion relevante queda fuera de las capas de atencion completa.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero el autor enlaza la licencia del modelo fuente; conviene revisar ambas.

## Enlaces
- Hugging Face: https://huggingface.co/leonsarmiento/Arete-27B-4bit-mlx
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante data-aware: https://huggingface.co/leonsarmiento/Arete-27B-oQ4e
- Variante con MTP: https://huggingface.co/leonsarmiento/Qwen3.8-27B-heretic-ara-4bit-mtp-mlx
- Blog de Nous Research: https://nousresearch.com/arete
- Dataset de evaluacion: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Licencia del modelo fuente: https://huggingface.co/NousResearch/Arete-27B/blob/main/LICENSE
