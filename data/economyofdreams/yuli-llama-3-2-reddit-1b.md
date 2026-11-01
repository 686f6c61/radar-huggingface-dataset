# economyofdreams/Yuli-LLaMA-3.2-Reddit-1B

## Resumen

Yuli-LLaMA-3.2-Reddit-1B es un modelo de personaje/motor de personalidad desarrollado por economyofdreams (@hoytnix), parte del proyecto Yuli, originalmente creado para un máster en IA y hoy motor de personalidad de Hecka Dough y del Yuli SDK. Se trata de un fine-tuning de unsloth/Llama-3.2-1B-Instruct (Meta Llama 3.2 1B Instruct) entrenado para rastrear patrones cambiantes de MBTI y funciones cognitivas a lo largo de conversaciones reales multi-turno, en lugar de asignar una etiqueta estática a un mensaje aislado.

El modelo se entrena sobre conversaciones diádicas (dos hablantes) procedentes del dataset de Reddit `ZhankuiHe/reddit_movie_large_v1`, con anotaciones por turno que incluyen tipo de ego, lado activo (ego/sombra/subconsciente/superego), top-2 funciones cognitivas y puntuaciones de tensión y resolución. Su salida es estructurada: `<thought>` seguido de `<state_vector>` y análisis por turno, con vectores que se recomputan de forma determinista a partir del tipo de ego y el lado activo.

Su relevancia está en el nicho de modelos de personaje y análisis conversacional: con solo 1.235 millones de parámetros y cuantizaciones GGUF por debajo de 2 GB, está diseñado para ejecutarse en dispositivos móviles o portátiles, alcanzando 228–250 tokens/segundo en una A100. El autor lo presenta como el modelo "Mobile" del proyecto, con un modelo de 3B "Desktop" condicionado a que este pase su puerta de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.2), fine-tuning QLoRA sobre Llama 3.2 1B Instruct |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 4.096 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | IQ2_M (484 MiB), IQ3_XXS (529 MiB), Q4_K_M (763 MiB), Q8_0 (1.252 MiB) |
| Idiomas soportados | Ingles (entrenado solo en ingles) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (cuantizado con imatrix); base F16 de 2.357 MiB no distribuida |

## Arquitectura y entrenamiento

El modelo parte de Meta Llama 3.2 1B Instruct, un transformer decoder de 1B de parametros, al que se aplica un fine-tuning eficiente mediante QLoRA con carga en 4 bits usando Unsloth FastLanguageModel. El entrenamiento se realizo sobre 7.203 conversaciones de entrenamiento y 380 de validacion (split por `conv_id`, sin solapamiento), durante 2.700 pasos y 3 epocas en una NVIDIA A100-SXM4-40GB, con un tiempo total de 13 minutos y 6 segundos. La perdida descendio de 2,59 a 0,389 en el paso final (media de los ultimos 100 pasos: ~0,41), sin NaN ni explosiones. Se uso entrenamiento response-only (perdida solo sobre los tokens del asistente) y la plantilla de chat nativa de Llama 3.2, manteniendo el system prompt como elemento de primera clase. La longitud maxima de secuencia fue de 4.096 tokens; 5 muestras que la superaban (0,07 % del train) fueron eliminadas por Unsloth para evitar perdidas NaN.

El dataset procede de `ZhankuiHe/reddit_movie_large_v1` (split de entrenamiento, texto crudo), con un filtrado diadico estricto: exactamente 2 `user_id` distintos por conversacion, deduplicacion por comentario, y un filtro de profundidad (minimo `turn_order` 3, minimo 4 turnos totales, minimo 2 turnos por hablante). Las anotaciones se generaron con `meta/muse-spark-1.3-contributor` via LiteLLM/Meta Model API en dos pasadas: una primera pasada sobre 7.601 conversaciones y una segunda sobre las 514 marcadas por una verificacion automatica (11 checks duros y 5 blandos, sin LLM). El resultado final fue de 7.583 conversaciones limpias de 7.601 (99,76 %), 18 descartadas, 0 duplicados y 0 muestras marcadas en la verificacion final. Las identidades se anonimizaron como Speaker A / Speaker B. Para la cuantizacion GGUF se uso imatrix, con una perplejidad de calibracion de 17,71 ± 0,25.

## Capacidades

- Analisis de personalidad dinamico por turno: asigna a cada turno del Speaker A un tipo de ego MBTI, lado activo (ego/sombra/subconsciente/superego), top-2 funciones cognitivas y puntuaciones de tension y resolucion.
- Deteccion de cambios de patron a lo largo de la conversacion: el modelo esta entrenado para que una etiqueta repetida turno tras turno se considere un fallo, y para tratar tanto la estabilidad como el cambio como resultados validos.
- Salida estructurada y verificable: formato `<thought>` → `<state_vector>` → analisis por turno, con vectores que se recomputan de forma determinista a partir del tipo de ego y el lado activo.
- Generacion de texto conversacional en ingles, con plantilla de chat nativa de Llama 3.2 y soporte de system prompt.
- Rol de personaje: el README sugiere usarlo como "Yuli", un personaje de asesoramiento tecnico entre pares ("autonomous software architect and technical peer").
- No hay evidencia de capacidades de vision, audio, tool calling ni agentes en la informacion disponible.

## Casos de uso

- Analisis de dinamicas de personalidad en conversaciones: dado un dialogo multi-turno, el modelo genera por turno el tipo MBTI, las funciones cognitivas activas y las metricas de tension/resolucion, util para investigacion en psicometria conversacional o analisis de dialogos.
- Motores de personaje para aplicaciones tipo Character.AI: su salida estructurada y su tamano reducido lo hacen adecuado para dotar de personalidad coherente y trazable a un personaje conversacional en una app.
- Chatbot de asesoramiento tecnico entre pares: el system prompt de ejemplo lo configura como "Yuli", una arquitecta de software que da consejo directo y fundamentado; puede servir como companero de reflexion para desarrolladores bloqueados.
- Ejecucion en movil o edge: con cuantizaciones de 484 MiB a 1,25 GB, cabe en dispositivos de gama baja, portatiles sin GPU dedicada o maquinas de clase movil.
- Prototipado local con llama.cpp u Ollama: el repo incluye un Modelfile de Ollama y comandos listos para `llama-server`, lo que permite integrarlo en pipelines locales de prueba sin coste de API.
- Componente del Yuli SDK: como motor de personalidad de Hecka Dough, puede integrarse como modulo de analisis de estado conversacional en productos que requieran seguimiento del "estado mental" del usuario turno a turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son:

| Metrica | Valor |
|---|---|
| Perplejidad de calibracion imatrix (GGUF) | 17,71 ± 0,25 |
| Velocidad en A100 | 228–250 tokens/segundo |
| Loss final de entrenamiento | 0,389 (media ultimos 100 pasos: ~0,41) |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: de ~484 MiB (IQ2_M) a ~1,25 GiB (Q8_0) segun cuantizacion; todas las cuantizaciones caben en menos de 2 GB de memoria.
- GPU recomendadas: no requiere GPU; el autor reporta 228–250 tokens/segundo en una NVIDIA A100-SXM4-40GB, pero el objetivo de diseno es ejecutarlo en CPU o dispositivos moviles.
- Consumer GPU: cabe sobradamente en cualquier GPU consumer moderna (incluso tarjetas con 2–4 GB de VRAM); en CPU con al menos 2 GB de RAM libres es viable con llama.cpp.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con `llama-server` y contexto de 4.096), Ollama (Modelfile incluido en el repo, uso local), y cualquier runtime compatible con GGUF. No hay informacion sobre vLLM o TGI para este modelo.
- Latencia y throughput: 228–250 tokens/segundo en A100; no hay mediciones publicadas en CPU o dispositivos moviles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Yuli-LLaMA-3.2-Reddit-1B | 1,24 B | 4.096 | Llama 3.2 | GGUF | Motor de personalidad / analisis MBTI por turno |
| unsloth/Llama-3.2-1B-Instruct (base) | 1,24 B | 128.000 | Llama 3.2 | safetensors | Chat e instruccion general |
| Meta Llama 3.2 1B Instruct | 1,24 B | 128.000 | Llama 3.2 | safetensors | Chat e instruccion general |

Frente a su modelo base, Yuli sacrifica la ventana de contexto amplia (4.096 frente a 128.000 tokens) y el alcance multilingue/generalista a cambio de una capacidad especializada en analisis diadico de personalidad con salida estructurada. No hay datos comparativos de benchmarks entre ellos en la informacion disponible. El autor menciona un futuro modelo Yuli de 3B "Desktop", aun no publicado.

## Limitaciones y advertencias

- Idioma: entrenado exclusivamente en ingles; su rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Contexto: ventana de 4.096 tokens, muy inferior a los 128.000 del modelo base; conversaciones largas requeriran truncado o gestion de contexto.
- Dominio estrecho: es un fine-tuning especializado en analisis de personalidad sobre dialogos de Reddit (concretamente conversaciones sobre peliculas); como modelo general de chat o de codigo probablemente rinda peor que el modelo base.
- Base psicometrica no validada: el analisis MBTI/funciones cognitivas carece de respaldo cientifico consolidado; las anotaciones fueron generadas por otro LLM (`meta/muse-spark-1.3-contributor`), por lo que heredan posibles sesgos y errores de ese modelo, pese al doble control de calidad.
- Riesgo de alucinacion: al ser un modelo de 1B, es susceptible de generar contenido incorrecto o incoherente; no hay evaluaciones de alucinacion publicadas.
- Sesgos de datos: entrenado sobre conversaciones de Reddit (dataset de peliculas), puede heredar los sesgos de esa comunidad y de la anotacion automatica.
- Licencia: sujeto a la Llama 3.2 Community License de Meta, que impone restricciones de uso (limite de 700 millones de usuarios mensuales para productos, condiciones de atribucion y politica de uso aceptable); revisar la licencia antes de uso comercial.
- Produccion: el propio autor lo condiciona a una "puerta de calidad" antes de escalar a un modelo 3B, lo que sugiere que la version 1B debe considerarse experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/economyofdreams/Yuli-LLaMA-3.2-Reddit-1B
- Autor (@hoytnix): https://huggingface.co/economyofdreams
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ZhankuiHe/reddit_movie_large_v1
- No se han encontrado enlaces a papers, blogs ni demos en la informacion disponible.
