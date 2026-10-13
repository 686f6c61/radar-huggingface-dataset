# d-michail/Mitos-Qwen3-8B-Dialogue-LoRA

## Resumen

Mitos-Qwen3-8B-Dialogue-LoRA es un adaptador LoRA (PEFT) sobre el modelo denso Qwen3-8B, desarrollado por el usuario d-michail y orientado a la respuesta de preguntas sobre procedimientos administrativos de la administración publica griega. El adaptador se entrena sobre dialogos sinteticos ciudadano-funcionario generados a partir de los textos del Registro Nacional de Procedimientos Administrativos griego (ΕΜΔΔ / Mitos), cuyo contenido es open data a traves de la API publica del registro. El objetivo es que el modelo responda de forma breve (unas 25-45 palabras), con el registro y el formato de un funcionario de ventanilla, tanto en modo closed-book como en configuraciones con recuperacion aumentada (RAG).

El repositorio distingue dos adaptadores: el de la raiz, entrenado sobre las 4.407 procedimientos completos del snapshot y pensado para uso final (fusionado en el modelo d-michail/Mitos-Qwen3-8B-Dialogue), y el de la subcarpeta `holdout/`, entrenado sobre 4.187 procedimientos y excluyendo 220, que es el que respalda los numeros de benchmark del paper y solo debe usarse para evaluacion y reproduccion. Los datos de entrenamiento proceden de 90.145 registros de dialogo derivados de las 4.407 fichas del registro.

La relevancia del modelo es doble: por un lado cubre un nicho poco atendido (QA administrativa en griego, un idioma con pocos recursos), y por otro publica una evaluacion honesta que muestra que en closed-book la mejora de recuperacion de hechos clave es modesta (0,149 frente a 0,043 del modelo base), mientras que con RAG de chunks a nivel de campo alcanza 0,503. Se distribuye bajo licencia CC BY-SA 4.0, condicionada por la licencia del contenido del registro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-8B) con adaptador LoRA sobre todas las proyecciones de atencion y MLP |
| Parametros totales | Aproximadamente 8.000 millones en el modelo base Qwen3-8B; el adaptador LoRA anade un numero no especificado de parametros (repositorio de 0,4 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens de secuencia maxima durante el entrenamiento; no se especifica la ventana de inferencia heredada del modelo base |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en precision completa de PEFT y no hay versiones GGUF, AWQ o GPTQ publicadas; la cuantizacion requeriria fusionar con el modelo base |
| Idiomas soportados | Griego (el), idioma de entrenamiento. El modelo base Qwen3-8B es multilingue, pero el adaptador no ha sido entrenado para otros idiomas |
| Licencia | CC BY-SA 4.0 (adaptador, heredada del contenido del registro). El modelo base Qwen3 se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con la libreria `peft`) |
| Metodo de entrenamiento | LoRA, rango 16, alpha 32 |
| Dataset de entrenamiento | d-michail/mitos-qa, configuracion `qa-all` (90.145 registros, 4.407 procedimientos) |
| Uso previsto | Investigacion en QA sobre administracion publica griega, closed-book y con RAG |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre todas las proyecciones de atencion y de MLP de Qwen3-8B, un transformer decoder-only denso. El entrenamiento usa un learning rate de 2e-4 con schedule coseno, 2 epocas, batch efectivo de 32 y precision bfloat16, con una longitud maxima de secuencia de 4.096 tokens. La funcion de perdida es entropia cruzada estandar calculada unicamente sobre los tokens del asistente, usando la plantilla de chat de Qwen3 con el modo de razonamiento desactivado (`enable_thinking=False`) y sin system prompt.

Los datos de entrenamiento son dialogos cortos ciudadano-funcionario generados por un LLM (la model card indica «Qwen3.8-27B», presumiblemente Qwen3-27B) a partir del texto de cada procedimiento del registro Mitos, y despues parseados a registros de chat. No se menciona RLHF ni DPO: el ajuste es unicamente supervisado sobre esos dialogos. El snapshot del registro se descargo el 1 y 2 de octubre de 2026, con registros actualizados entre el 26 de junio y el 1 de octubre de 2026. La innovacion principal no es arquitectonica, sino de dominio y de evaluacion: el repositorio separa explicitamente un adaptador `holdout/` para evitar fuga de datos en la evaluacion, y compara el rendimiento con tres estrategias de recuperacion distintas (chunks a nivel de campo, ventanas divididas y procedimientos completos).

## Capacidades

- Generacion de texto conversacional en griego, con respuestas breves (tipicamente 25-45 palabras) y registro administrativo.
- Respuesta a preguntas sobre procedimientos administrativos griegos, tanto en modo closed-book como con contexto recuperado (RAG).
- Seguimiento de un prompt de recuperacion especifico que instruye al modelo a responder solo con la informacion proporcionada y a declarar cuando esta no es suficiente.
- Generacion de datos de entrenamiento: la misma receta (extraccion de procedimientos y generacion de dialogos) puede reproducirse sobre otras fuentes estructuradas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explicito de agentes ni de razonamiento multi-paso; de hecho, el entrenamiento se realizo con el modo de razonamiento desactivado.
- No se documentan capacidades de vision ni de audio.
- Capacidad multilingue: no acreditada en el adaptador; el entrenamiento es exclusivamente en griego.

## Casos de uso

- Atencion al ciudadano con RAG: desplegar el modelo como generador final de un pipeline que recupere los campos relevantes del procedimiento desde la API de Mitos y redacte una respuesta breve y en registro administrativo. El adaptador esta entrenado exactamente para ese formato de prompt y responde en 43 palabras de media en la configuracion de chunks a nivel de campo.
- Chatbot de ventanilla unica para tramites locales: integrado en un portal municipal, el modelo puede resolver consultas del tipo «que documentos necesito para X» apoyandose en el contexto recuperado, dejando claro cuando la informacion no es suficiente.
- Asistente interno para empleados publicos: ayuda a localizar rapidamente requisitos, plazos y organismos competentes de un procedimiento, siempre con verificacion humana y enlace al procedimiento oficial.
- Investigacion en PLN para griego: el adaptador y su split de evaluacion permiten reproducir experimentos de QA de dominio con pocos recursos, comparando configuraciones closed-book y RAG sobre 1.933 preguntas.
- Evaluacion de sistemas de recuperacion: al estar publicado el adaptador `holdout/`, sirve como generador fijo para medir el efecto de distintas estrategias de chunking (campo, ventana, procedimiento completo) sobre la recuperacion de hechos clave.
- Normalizacion y resumen de procedimientos: dado el texto de una ficha del registro, el modelo puede producir una version resumida en formato de dialogo o de pregunta-respuesta reutilizable en guias ciudadanas.
- Prototipado rapido de asistentes administrativos: al ser un adaptador de 0,4 GB sobre un modelo de 8B, permite iterar sobre el comportamiento de dominio sin reentrenar el modelo completo ni rehospedar un modelo de mayor tamano.

## Benchmarks y rendimiento

Resultados publicados en la model card para el adaptador `holdout/`, con metricas sin juez sobre 1.933 preguntas. La columna «base» corresponde al modelo sin el ajuste de dominio.

| Sistema | Recall de hechos clave (base) | Recall de hechos clave (este modelo) | Token F1 (este modelo) | Palabras (este modelo) |
|---|---|---|---|---|
| Closed-book | 0,043 | 0,149 | 0,330 | 22 |
| RAG (chunks a nivel de campo) | 0,442 | 0,503 | 0,503 | 43 |
| RAG-split (ventanas) | 0,260 | 0,321 | 0,397 | 46 |
| RAG-process (procedimientos completos) | 0,236 | 0,298 | 0,372 | 50 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia en bfloat16 o float16: aproximadamente 16 GB de VRAM solo para los pesos del modelo base, mas overhead de KV cache y activaciones; en la practica conviene reservar 20-24 GB.
- Cuantizacion a 8 bits: en torno a 9-10 GB de VRAM.
- Cuantizacion a 4 bits (NF4, AWQ o GPTQ, previa fusion del adaptador): en torno a 5-6 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para precision completa o bfloat16; RTX 3090 o RTX 4080 para 8 bits; RTX 3060 de 12 GB, RTX 4070 o superiores para 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 a bfloat16 y en tarjetas de 8-12 GB tras cuantizar a 4 bits.
- Opciones de despliegue: `transformers` junto con `peft` (carga directa del adaptador, tal como documenta la model card), vLLM o TGI tras fusionar el adaptador con el modelo base, y llama.cpp u Ollama tras fusionar y convertir a GGUF. El adaptador por si solo no se puede cargar en llama.cpp sin fusion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el benchmark del paper | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mitos-Qwen3-8B-Dialogue-LoRA (adaptador raiz) | ~8.000 M (base) + adaptador | 4.096 tokens de entrenamiento | No evaluado en el split `unseen` (ha visto los 4.407 procedimientos) | CC BY-SA 4.0 | HuggingFace (adaptador PEFT) |
| Mitos-Qwen3-8B-Dialogue-LoRA (`holdout/`) | ~8.000 M (base) + adaptador | 4.096 tokens de entrenamiento | Recall 0,149 (closed-book) y 0,503 (RAG por campos) | CC BY-SA 4.0 | HuggingFace (subcarpeta del mismo repositorio) |
| Mitos-Qwen3-8B-Dialogue (modelo fusionado) | ~8.000 M | No disponible | No disponible | CC BY-SA 4.0 | HuggingFace (modelo completo) |
| Qwen3-8B (modelo base) | ~8.000 M | No disponible en la informacion proporcionada | Recall 0,043 (closed-book) y 0,442 (RAG por campos); es la referencia «base» de la tabla de benchmarks | Apache-2.0 | HuggingFace |

No se dispone de datos de otros modelos especificos para griego o para QA administrativa en la informacion proporcionada, por lo que no se incluye una comparacion adicional.

## Limitaciones y advertencias

- No es asesoramiento legal: las respuestas no tienen autoridad juridica, el registro cambia con el tiempo y un sistema en produccion deberia mostrar siempre la fuente, la fecha de recuperacion y el enlace al procedimiento oficial.
- En closed-book el modelo aprende el registro y el formato del dominio, pero apenas los hechos: el recall de hechos clave se queda en 0,149. La mayor parte de la precision proviene de la recuperacion.
- Puede afirmar datos concretos incorrectos (importes, plazos, documentos) con apariencia de veracidad.
- Los modelos pequenos a veces degeneran en bucles de repeticion hasta agotar el limite de tokens; se recomienda penalizacion por repeticion o una regla de parada en produccion.
- Los datos de entrenamiento son sinteticos o generados por plantilla a partir de un unico snapshot del registro y pueden reproducir los errores y el fraseo del generador.
- El propio registro no garantiza la exhaustividad ni la correccion de su contenido (condiciones de uso de mitos.gov.gr, clausula A.6), por lo que el modelo tampoco puede hacerlo. Hay que verificar cada respuesta contra el procedimiento vivo en `https://id.mitos.gov.gr/<ID Mitos>`.
- Los datos son un snapshot (descargado el 1-2 de octubre de 2026) y los procedimientos cambian, de modo que el modelo queda desactualizado.
- El modelo se entreno sin system prompt y con el razonamiento desactivado; usarlo de otra forma puede degradar el comportamiento.
- Idioma: solo griego. No hay evidencia de calidad en castellano ni en otros idiomas.
- Licencia: CC BY-SA 4.0, con condicion de compartir igual. El uso comercial es posible, pero obliga a atribuir el origen de los datos y a mantener la misma licencia en las obras derivadas.
- Riesgo de fuga en la evaluacion si se usa el adaptador de la raiz sobre el split `unseen` del benchmark: para reproducir resultados hay que usar `holdout/`.
- Sesgos: no se documenta un analisis de sesgos. Al derivarse de textos administrativos y de un generador LLM, puede heredar sesgos de formulacion y de cobertura de los procedimientos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d-michail/Mitos-Qwen3-8B-Dialogue-LoRA
- Modelo fusionado: https://huggingface.co/d-michail/Mitos-Qwen3-8B-Dialogue
- Dataset de entrenamiento: https://huggingface.co/datasets/d-michail/mitos-qa
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- API de open data del registro Mitos: https://api.mitos.gov.gr/info
- Portal del registro: https://mitos.gov.gr
- Consulta de procedimientos por identificador: https://id.mitos.gov.gr/<ID Mitos>
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Paper: pendiente de publicacion segun la model card (no disponible)
- Repositorios, demos o blogs adicionales: no se han encontrado enlaces relevantes en la busqueda web realizada
