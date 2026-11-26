# BeardedMonster/gemma-3-270m-translate-Q8

## Resumen

Gemma-3-270m-translate-Q8 es un modelo de traduccion automatica derivado de Gemma 3 (variante de texto de 270 millones de parametros) y ajustado especificamente para traducir del ingles a 77 lenguas africanas. Lo publica el usuario BeardedMonster bajo la licencia Gemma, con atribucion requerida a "Aletheia AI", y se distribuye unicamente como archivo GGUF cuantizado en Q8_0 (aproximadamente 300 MB), pensado para ejecutarse en llama.cpp tanto en CPU como en GPU.

El modelo resuelve un nicho concreto y poco cubierto: la traduccion de Ingles a lenguas africanas de bajos recursos (yoruba, hausa, igbo, wolof, zulu, amharico, entre otras), en un formato lo bastante pequeno como para desplegarse en hardware modesto o en el borde. Su tamano de 268.098.176 parametros y su cuantizacion de 8 bits lo convierten en una opcion de muy baja latencia y bajo consumo de memoria, a costa de una calidad que el propio autor califica de no verificada por humanos.

La relevancia actual radica en que cubre un hueco que los modelos multilingues generalistas suelen dejar mal atendido: la direccion Ingles a lengua africana con un unico prompt y un marcador de codigo ISO 639-3 en la salida. No es un modelo de proposito general ni un traductor bidireccional; es una herramienta acotada, con instrucciones de uso muy estrictas (una frase o parrafo corto por peticion, decodificacion greedy).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits); unico archivo publicado |
| Idiomas soportados | Ingles como origen; 77 lenguas africanas como destino (ver tabla de la model card) |
| Licencia | Gemma Terms of Use, con atribucion a "Aletheia AI" |
| Formato de pesos | GGUF (`rl2c-Q8_0.gguf`), plantilla de chat Gemma incluida en el archivo |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 en su variante de texto de 270 millones de parametros, una arquitectura transformer decoder-only. Sobre esa base se ha realizado un ajuste fino orientado a una unica tarea: traduccion de Ingles a lenguas africanas. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible.

El autor si documenta el formato de inferencia, que forma parte del comportamiento aprendido: un unico turno de usuario con la plantilla `Translate the text to {Language name}:  {English text}` (dos espacios tras los dos puntos), y una respuesta que comienza con el codigo ISO 639-3 de la lengua destino seguido de la traduccion y el token `<end_of_turn>`. La decodificacion recomendada es greedy (`temperature 0`) con `max_tokens` de 256. La plantilla de chat Gemma esta embebida en el propio archivo GGUF, de modo que el endpoint de chat de `llama-server` la aplica automaticamente. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion unidireccional de Ingles a 77 lenguas africanas, invocada mediante el nombre de la lengua en el prompt.
- Emision de un marcador de codigo ISO 639-3 al inicio de la respuesta (por ejemplo `yor`, `hau`, `ibo`), que el usuario debe eliminar de la salida final.
- Cobertura de lenguas de bajos recursos como acholi, bambara, basaa, dagbani, ghomala, kabyle, tachelhit, wolaytta o nuer, ademas de lenguas mas extendidas como swahili, hausa, yoruba, igbo, zulu, amharico, somali o afrikaans.
- Procesamiento de una frase o un parrafo corto por peticion; el autor recomienda dividir documentos largos en frases.
- Inferencia en CPU o GPU mediante llama.cpp, con soporte del endpoint compatible con OpenAI de `llama-server`.
- No dispone de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Traduccion de interfaz y microcopy en aplicaciones moviles dirigidas a mercados africanos: el modelo cabe en 300 MB y puede ejecutarse en el propio dispositivo o en un servidor modesto, traduciendo cadenas cortas del ingles a la lengua local con latencia muy baja.
- Localizacion de mensajes de atencion al cliente: respuestas breves y plantillas (saludos, confirmaciones, avisos) se traducen frase a frase, lo que encaja con la restriccion de una oracion o parrafo corto por peticion.
- Pre-traduccion asistida para traductores humanos: se genera un borrador automatico de Ingles a yoruba, hausa o wolof que el revisor humano edita, reduciendo el esfuerzo en lenguas con pocos recursos y pocos traductores disponibles.
- Traduccion de contenido agricola, sanitario o educativo de baja complejidad sintactica: el ejemplo de la model card sobre medicion de lluvia en explotaciones agricolas ilustra el tipo de texto que maneja bien, con la advertencia de revision humana en contextos criticos.
- Procesamiento por lotes de corpus en investigacion linguistica: al ser un GGUF Q8_0 de 300 MB, permite ejecutar grandes volumenes de frases en CPU en paralelo sin GPU, util para generar corpus paralelos preliminares o para aumentar datos de entrenamiento de otros sistemas.
- Prototipado rapido y demostraciones offline: integracion en `llama-server` con una sola llamada curl, adecuada para validar una idea de producto multilingue antes de invertir en un modelo mayor.
- Filtrado y enriquecimiento de datos: traduccion de titulares o descripciones cortas para clasificacion o indexacion en buscadores que operan en lenguas africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye tres ejemplos de salida cualitativos (yoruba, hausa e igbo) sin metricas como BLEU, chrF, COMET ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,5 GB con la cuantizacion Q8_0 publicada, incluyendo overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el modelo esta pensado para CPU y no requiere acelerador dedicado.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y en dispositivos de borde con CPU moderna.
- Opciones de despliegue: llama.cpp (`llama-server` con endpoint compatible con OpenAI), y por extension cualquier frontend que consuma GGUF compatible con llama.cpp; el autor no menciona vLLM, TGI ni Ollama, aunque Ollama puede importar GGUF.
- Latencia y throughput: no se publican cifras. Por el tamano del modelo y la decodificacion greedy, se espera una generacion de decenas de tokens por segundo en CPU de escritorio, pero es una estimacion, no un dato medido del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas destino | Licencia | Formato |
|---|---|---|---|---|---|
| BeardedMonster/gemma-3-270m-translate-Q8 | 268 M | no disponible | 77 lenguas africanas (solo EN→X) | Gemma | GGUF Q8_0 |
| BeardedMonster/gemma-3-0.8b-translate-Q8 | no disponible (base Gemma 3 0.8B) | no disponible | 125 codigos de lengua | Gemma | GGUF |
| Gemma 3 base (variante de texto 270M) | 268 M | no disponible | multilingue general | Gemma | safetensors, GGUF |

La alternativa mas directa es la version mayor del mismo autor, `gemma-3-0.8b-translate-Q8`, que la propia model card recomienda cuando se prioriza calidad y cobertura (125 codigos de lengua frente a 77) a cambio de mayor tamano. Frente al Gemma 3 base sin ajustar, este modelo gana en la tarea concreta de traduccion a lenguas africanas, pero pierde cualquier capacidad de proposito general. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Solo traduce de Ingles a lengua africana; otras lenguas de origen y la direccion inversa no estan entrenadas.
- Las salidas son traducciones automaticas sin verificacion humana: el autor advierte de revisarlas en contextos medicos, legales o de seguridad critica.
- El modelo es pequeno y puede omitir contenido o repetirse, especialmente en entradas largas y en las lenguas de menor recursos.
- El prompt debe seguir el formato exacto, incluidos los dos espacios tras los dos puntos y el nombre de la lengua (no el codigo); desviarse puede degradar la salida.
- La respuesta incluye un codigo ISO 639-3 al inicio que hay que eliminar en posprocesado.
- Se recomienda dividir documentos largos en frases; no se documenta la longitud de contexto soportada.
- El campo `language` de Hugging Face solo declara `en`, pese a que el modelo genera 77 lenguas; conviene no fiarse de ese metadato para filtros automaticos.
- Licencia Gemma: uso comercial y no comercial permitido con atribucion a "Aletheia AI", pero se aplican ademas los Terminos de Uso de Gemma de Google, que imponen restricciones adicionales de uso aceptable.
- No hay garantia de calidad por lengua: las de muy bajos recursos (okpe, tswa, ndau, nuer) probablemente rindan peor que swahili, hausa o yoruba.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-270m-translate-Q8
- Alternativa mayor recomendada por el autor: https://huggingface.co/BeardedMonster/gemma-3-0.8b-translate-Q8
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggml-org/llama.cpp
