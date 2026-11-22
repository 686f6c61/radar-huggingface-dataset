# ryugyosoft/llm-jp-4.1-8b-thinking-onw

## Resumen

`ryugyosoft/llm-jp-4.1-8b-thinking-onw` es una conversión del modelo japonés `llm-jp/llm-jp-4.1-8b-thinking` (desarrollado por el LLM-jp del National Institute of Informatics de Japón) para ejecutarse exclusivamente sobre la NPU integrada de los procesadores Intel Core Ultra mediante el motor propietario `onw` ("Ore no NPU ga konna ni ugoku wake nai"). No se trata de un modelo nuevo ni de un fine-tuning: los pesos originales se han re-cuantizado y reorganizado en grafos estáticos para el acelerador neuronal de Intel, sin ningún entrenamiento adicional.

El modelo base es un transformer de arquitectura tipo Llama con 8 000 millones de parámetros, vocabulario de aproximadamente 197 000 tokens y modo de razonamiento explícito ("thinking") compatible con el formato harmony de gpt-oss. Está entrenado desde cero con foco en japonés, aunque declara soporte de inglés, y en la model card original supera a Qwen3.5-9B en seguimiento de instrucciones en japonés y alcanza 7,58 en MT-Bench japonés (frente a 7,33 de gpt-oss-20b), aunque queda por detrás en matemáticas, código y uso de herramientas multi-turno.

La relevancia de esta ficha está en el nicho: permite inferencia local de un LLM de 8B en hardware de consumo sin GPU dedicada, usando solo la NPU de un portátil con Core Ultra. El precio es un rendimiento bajo (4,2-4,7 tok/s de generación) y una preparación inicial larga (unos 11 minutos de compilación para NPU), a cambio de un consumo contenido y un despliegue con API compatible con OpenAI en `localhost`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (32 capas), con razonamiento tipo harmony; grafos estáticos para NPU Intel |
| Parámetros totales | 8 000 millones (8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | INT4 (grupo 128) en las 32 capas; INT8 en la capa de salida (vocabulario de 197 000); embeddings INT4 en `shared.bin` |
| Idiomas soportados | Japonés (ja) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Grafos `seg*.xml` + `seg*.bin` propietarios del motor onw (no safetensors ni GGUF); `engine.json` y tokenizer/config del repo original |
| Tamaño del repositorio | 4,9 GB (descarga indicada: 4,6 GB) |
| Motor de inferencia | onw (exclusivo, no compatible con llama.cpp, vLLM ni Ollama) |
| Hardware objetivo | NPU de Intel Core Ultra (Meteor Lake, Arrow Lake, Lunar Lake, Panther Lake) |
| Sistema operativo | Windows 11 o Ubuntu 22.04+ |

## Arquitectura y entrenamiento

El modelo base `llm-jp-4.1-8b-thinking` es un transformer denso de 32 capas con arquitectura tipo Llama y un vocabulario de aproximadamente 197 000 tokens, entrenado por el LLM-jp del NII desde cero con predominio de datos en japonés. Incorpora un modo de razonamiento explícito al estilo harmony (el mismo esquema que gpt-oss): el modelo genera primero un bloque de pensamiento en inglés y después la respuesta, con un parámetro `reasoning_effort` que admite los niveles low, medium y high. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La conversión a onw no modifica los pesos en términos de conocimiento: re-cuantiza a INT4 con grupo 128 las 32 capas, separa la capa de salida en INT8 como segmento independiente (que se omite durante el prefill, cuando no se necesitan logits) y divide el modelo en cuatro segmentos de 8 capas más la salida, cada uno con su propio grafo estático compilado para la NPU. Se generan variantes de grafo para procesamiento de prompt en bloques de 64 y 16 tokens y para generación de 1 y 2 tokens (esta última reduce drásticamente el tiempo de compilación inicial en Lunar Lake y Panther Lake). El tokenizador es el `tokenizer.json` original, con verificación de que los identificadores de token coinciden con la implementación de referencia, y la traducción del formato harmony a texto se hace en el motor.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con calidad declarada superior a Qwen3.5-9B en seguimiento de instrucciones en japonés.
- Modo de razonamiento explícito ("thinking") con control de esfuerzo mediante `reasoning_effort` (low, medium, high); el contenido de pensamiento se devuelve en `reasoning_content`.
- Uso de herramientas mediante la API compatible con OpenAI (`tools`), incluyendo llamadas paralelas a varias funciones.
- Razonamiento multi-paso orientado a agentes, con el esquema harmony de gpt-oss.
- Capacidad matemática y de código presente pero inferior a Qwen3.5-9B según la model card del autor.
- Soporte multi-turno en conversaciones con herramientas.
- No dispone de visión, audio ni otras modalidades: la entrada es solo texto.

## Casos de uso

- Asistente conversacional local en japonés sobre portátil: un portátil con Core Ultra y 16 GB de RAM puede servir respuestas en japonés a 4,2-4,7 tok/s sin GPU dedicada, adecuado para uso personal o demostraciones offline.
- Agente de escritorio con tool calling: al exponer una API compatible con OpenAI en `http://localhost:8000/v1`, se puede conectar a frameworks de agentes que usen el esquema de function calling y orquestar llamadas paralelas a herramientas locales (ficheros, búsqueda, cálculos).
- Procesamiento por lotes de documentos en japonés en equipos sin GPU: clasificación, resumen o extracción de entidades sobre texto japonés en estaciones de trabajo corporativas con NPU Intel, aprovechando el bajo consumo.
- Prototipado de pipelines de razonamiento: el modo thinking con `reasoning_effort` permite comparar calidad y coste entre niveles low, medium y high antes de mover la carga a un modelo mayor en servidor.
- Automatización de atención al cliente en japonés para PYMES: despliegue en el propio portátil del operador como copiloto de respuestas, con contexto multi-turno y sin enviar datos a la nube.
- Entornos con requisitos de privacidad o air-gapped: al ejecutarse íntegramente en local sobre la NPU, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles que no pueden ir a APIs externas.
- Educación e investigación sobre inferencia en NPU: sirve como banco de pruebas para estudiar latencias, compilación de grafos y cuantización INT4/INT8 en aceleradores Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta conversión. Los únicos datos de rendimiento son los de la model card, referidos a la ejecución en NPU 3720 (Core Ultra 9 285HX):

| Métrica (NPU 3720, Core Ultra 9 285HX) | Valor |
|---|---|
| Velocidad de generación | 4,2-4,7 tok/s |
| Procesamiento de prompt corto | menos de 1 s |
| Procesamiento de prompt largo (onw 2.0+, 1024 tokens) | ~111 tok/s (16 tokens por bloque) |
| Memoria de trabajo tras carga | ~10 GB (~5 GB en reposo con modo ahorro; ~9 GB durante el intercambio) |
| Primera compilación para NPU | ~11 min |
| Arranques posteriores | ~20 s |
| Descarga | 4,6 GB |

Datos del modelo base citados en la model card (no verificados de forma independiente en esta ficha): MT-Bench japonés 7,58 frente a 7,33 de gpt-oss-20b; supera a Qwen3.5-9B en seguimiento de instrucciones en japonés, pero queda por debajo en matemáticas, código y uso de herramientas multi-turno.

## Requisitos de hardware

- NPU integrada de Intel Core Ultra de series 1 y 2 (Meteor Lake, Arrow Lake, Lunar Lake) y serie 3 (Panther Lake); no funciona en GPU ni en CPU como motor principal.
- Memoria: alrededor de 10 GB de working set tras la carga; con el modo de ahorro de memoria de onw, ~5 GB en reposo y ~9 GB durante los intercambios (medido en un equipo Lunar Lake de 16 GB).
- No requiere GPU dedicada; el caso de uso es precisamente prescindir de ella.
- Sistemas operativos soportados: Windows 11 y Ubuntu 22.04 o superior.
- Despliegue exclusivamente mediante el motor onw (instalación vía `install.ps1` en Windows o `curl | bash` en Ubuntu); no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- API compatible con OpenAI en `http://localhost:8000/v1` una vez cargado el modelo en onw.
- Latencia: primera compilación de ~11 minutos; arranques posteriores de ~20 segundos; generación de 4,2-4,7 tok/s en NPU 3720. En modo de ahorro de memoria, cada intercambio penaliza la velocidad de escritura durante 4-5 segundos.
- Existe una variante INT8 de mayor precisión (`ryugyosoft/llm-jp-4.1-8b-thinking-int8-onw`, 7,7 GB) para quienes prioricen fidelidad sobre tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|
| llm-jp-4.1-8b-thinking-onw | 8B | no disponible | Apache 2.0 | NPU Intel Core Ultra (onw) | Conversión INT4/INT8; 4,2-4,7 tok/s; solo japonés/inglés |
| llm-jp/llm-jp-4.1-8b-thinking (base) | 8B | no disponible | Apache 2.0 | CPU/GPU (bf16) | Modelo original; mayor precisión, requiere más recursos |
| ryugyosoft/llm-jp-4.1-8b-thinking-int8-onw | 8B | no disponible | Apache 2.0 | NPU Intel Core Ultra (onw) | Variante INT8, 7,7 GB, más fiel al original |
| Qwen3.5-9B | 9B | no disponible | no disponible | CPU/GPU | Referencia citada por el autor: mejor en matemáticas, código y tool use multi-turno; peor en instrucciones en japonés |
| gpt-oss-20b | 20B | no disponible | no disponible | CPU/GPU | Referencia citada: MT-Bench japonés 7,33 frente a 7,58 del modelo base |

## Limitaciones y advertencias

- Dependencia total del motor onw: no se puede ejecutar en llama.cpp, vLLM, Ollama o TGI, lo que limita la portabilidad y la integración en infraestructuras estándar.
- Rendimiento bajo: 4,2-4,7 tok/s de generación hacen inviable el uso interactivo exigente o el procesamiento de grandes volúmenes.
- La primera compilación para NPU tarda unos 11 minutos; en modo de ahorro de memoria, los intercambios de 4-5 segundos degradan la experiencia.
- Cobertura lingüística limitada a japonés e inglés; no se declaran otros idiomas.
- No se dispone de la longitud de contexto en la información proporcionada, lo que impide planificar casos de uso con documentos largos.
- El modo thinking consume tokens del límite: se recomienda `max_tokens` de al menos 300, y el pensamiento se emite en inglés aunque la respuesta sea en japonés.
- Riesgo de alucinación propio de un modelo de 8B; la model card no documenta evaluaciones de sesgo ni de robustez.
- El autor advierte de que la calidad en matemáticas, código y tool use multi-turno es inferior a Qwen3.5-9B.
- Licencia Apache 2.0 permite uso comercial, pero los pesos son una re-cuantización del modelo base; conviene revisar también las condiciones del modelo original y del motor onw.
- El repositorio tiene 0 likes y 586 descargas: ecosistema pequeño, poca validación comunitaria y riesgo de abandono del proyecto.
- La variante INT4 puede degradar la fidelidad respecto al bf16 original; el autor reporta 24/24 y 23/24 coincidencias de tokens en pruebas de teacher forcing, pero no es una evaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryugyosoft/llm-jp-4.1-8b-thinking-onw
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking
- Motor onw: https://huggingface.co/ryugyosoft/onw
- Documentación técnica de onw: https://huggingface.co/ryugyosoft/onw/blob/main/TECHNICAL.md
- Variante INT8: https://huggingface.co/ryugyosoft/llm-jp-4.1-8b-thinking-int8-onw
