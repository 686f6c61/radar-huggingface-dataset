# hyperionaidev/Ling-mini-2.0-tvbox-GGUF

## Resumen

Ling-mini-2.0-tvbox-GGUF es una cuantizacion extrema y especifica de Ling-mini-2.0, un modelo de lenguaje tipo Mixture of Experts desarrollado originalmente por inclusionAI. Esta version concreta la publica el usuario hyperionaidev dentro del proyecto smolmaxxing, cuyo objetivo es ejecutar modelos de gran tamano en hardware marginal. El resultado es un unico archivo GGUF de 5,49 GB que corre a 5,1 tokens por segundo en una Xiaomi TV Box S de tercera generacion, un dispositivo con cuatro nucleos Cortex-A55 y aproximadamente 1 GB de RAM utilizable.

El modelo base tiene 16,3 mil millones de parametros totales con unos 1,4 mil millones activos por token, organizados en 256 expertos de aproximadamente 1 MB cada uno. La contribucion tecnica de esta ficha no es el modelo en si, sino la estrategia de cuantizacion y paginacion: los expertos se recuantizan a Q2_K usando la imatrix de bartowski, el resto de tensores se mantiene en Q4_K y la cabeza de salida se poda de 157.184 a 60.000 filas. Los expertos se paginan desde almacenamiento flash bajo demanda.

Es relevante ahora porque demuestra que un MoE de 16B puede ejecutarse en dispositivos de consumo extremo mediante paginacion de expertos, a costa de una perdida de calidad medible y de requerir un binario parcheado de llama.cpp. No es un modelo listo para produccion general, sino una prueba de concepto reproducible y documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), 256 expertos de ~1 MB cada uno |
| Parametros totales | 16,3 mil millones |
| Parametros activos | ~1,4 mil millones |
| Longitud de contexto | 32.768 tokens en metadatos GGUF; 1.024 en la TV box |
| Tipos de cuantizacion | Expertos Q2_K (con imatrix de bartowski); resto de tensores Q4_K; cache KV q8_0 en la configuracion de TV |
| Idiomas soportados | no disponible (la seleccion de la cabeza de salida uso un corpus ingles y multilingue) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo unico, 5,49 GB) |

## Arquitectura y entrenamiento

El modelo base Ling-mini-2.0 sigue una arquitectura de transformer con mezcla de expertos: 256 expertos de aproximadamente 1 MB, con unos 1,4 mil millones de parametros activos por token sobre un total de 16,3 mil millones. El detalle del entrenamiento del modelo original (numero de tokens, composicion del corpus, uso de RLHF o DPO) no esta disponible en la informacion proporcionada.

La innovacion de esta version es de despliegue, no de entrenamiento. Los expertos se recuantizan a Q2_K con la imatrix del repositorio de bartowski y se paginan desde flash bajo demanda mediante un llama.cpp parcheado (base en el commit 8642541 mas el parche llama.cpp-v0.8.0-tvbox.patch). Se aplican tecnicas de enrutamiento consciente de cache, warm start con una lista de expertos precalentados (moe-warm-ling.txt) y prefetch pre-gated con K=6 y dos pasos de antelacion. La cabeza de salida se poda a 60.000 filas de las 157.184 originales, seleccionadas por frecuencia de token en un corpus ingles y multilingue, e incorpora un tensor output_ids. Los prompts pueden seguir usando cualquier token del vocabulario, pero el modelo solo puede generar tokens presentes en la cabeza podada.

## Capacidades

- Generacion de texto en ingles y multilingue heredada del modelo base Ling-mini-2.0; el alcance exacto de idiomas no esta disponible.
- Razonamiento y conversacion multi-turno basicos, con calidad degradada respecto al modelo original por la cuantizacion Q2_K de expertos y la poda de la cabeza de salida.
- Tokenizacion completa en entrada: los prompts pueden usar cualquiera de los 157.184 tokens del vocabulario original.
- Generacion restringida a los 60.000 tokens de la cabeza podada; las palabras fuera de esa lista no pueden generarse.
- Soporte de tool calling y comportamiento agentico: no disponible en la informacion proporcionada para esta version cuantizada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Demostracion de inferencia MoE en hardware marginal: ejecutar un modelo de 16B en una TV box Android con 1 GB de RAM util, usando la configuracion de paginacion de expertos documentada en el repositorio smolmaxxing.
- Investigacion sobre paginacion de expertos desde flash: el modelo sirve como banco de pruebas reproducible para medir el coste de latencia de lectura de expertos (unos 85 ms de cada 190 ms por token).
- Experimentos de cuantizacion extrema: comparar Q2_K con imatrix frente a otras combinaciones y medir el impacto en bits por byte sobre un corpus fijo.
- Evaluacion de poda de vocabulario: estudiar como afecta recortar la cabeza de salida de 157.184 a 60.000 filas a la perplejidad y a la fluidez en conversacion real.
- Chat local de baja concurrencia en dispositivos embebidos: conversaciones cortas con contexto de 1.024 tokens, aceptando 5,1 tokens por segundo y una penalizacion de repeticion de 1,15.
- Educacion y divulgacion: ilustrar en un articulo o taller como funciona un MoE y por que los parametros activos importan mas que los totales para el coste de inferencia.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de calidad y velocidad sobre un texto fijo de 22 KB, expresadas en bits por byte (menor es mejor) y en tokens por segundo, todas medidas en la misma Xiaomi TV Box S. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Configuracion | Calidad (bits/byte) | Velocidad (tok/s) |
|---|---|---|
| Top-8 expertos, pool 43, bias 0,3, prefetch, repeat penalty | 1,054 | 5,1 (5,0 en respuestas de ~600 palabras, 0 de 6 bucles) |
| Top-6 expertos, bias 0,25 | 1,090 | 5,3 |
| Referencia: Moon-Beam-8B-A1B | 0,996 | 7,2 |
| Referencia: Bonsai-8B | 0,974 | no disponible |

El autor senala explicitamente que este modelo es mas grande pero no mejor que las alternativas de 8B en el mismo dispositivo. El consumo de memoria es de aproximadamente 1,13 GB RSS en modo headless, mas el GGUF y una cache de repack de 5,3 GB en flash.

## Requisitos de hardware

- VRAM/RAM: aproximadamente 1,13 GB de RSS en modo headless con paginacion de expertos; sin paginacion, el modelo requiere cargar los 5,49 GB del archivo en memoria.
- Almacenamiento: 5,49 GB para el GGUF mas 5,3 GB de cache de repack en el primer arranque.
- Hardware validado: Xiaomi TV Box S (3rd Gen), cuatro Cortex-A55, ~1 GB de RAM util, con ejecucion a 5,1 tok/s y contexto de 1.024.
- Hardware recomendado: cualquier maquina con RAM suficiente para cargar el archivo completo, ejecutando el llama-server parcheado sin variables de entorno de paginacion.
- GPU: no disponible; el autor no documenta pruebas con GPU. El runtime usado es llama.cpp en CPU.
- Despliegue: exclusivamente llama.cpp parcheado del repositorio smolmaxxing (base commit 8642541 mas el parche tvbox). Stock llama.cpp, LM Studio y Ollama no cargan este archivo.
- Latencia: unos 190 ms por token en la TV box, de los cuales ~85 ms corresponden a esperas de lectura de expertos desde flash.
- Parametros de ejecucion en la TV: -t 3, -c 1024, -ub 4, -b 64, -ctk q8_0 -ctv q8_0 -fa on, --repeat-penalty 1.15, --repeat-last-n 256.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Calidad (bits/byte) | Velocidad en TV box (tok/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ling-mini-2.0 tvbox GGUF (esta ficha) | 16,3B / ~1,4B | 32.768 (1.024 en TV) | 1,054 | 5,1 | MIT | Hugging Face, requiere llama.cpp parcheado |
| Moon-Beam-8B-A1B | 8B / no disponible | no disponible | 0,996 | 7,2 | no disponible | misma TV box, segun el autor |
| Bonsai-8B | 8B / no disponible | no disponible | 0,974 | no disponible | no disponible | misma TV box, segun el autor |
| Ling-mini-2.0 original (bartowski Q4_K_M) | 16,3B / ~1,4B | 32.768 | no disponible | no disponible | MIT | Hugging Face, llama.cpp estandar |

## Limitaciones y advertencias

- Requiere un binario parcheado de llama.cpp del repositorio smolmaxxing; stock llama.cpp, LM Studio y Ollama no cargan el archivo.
- La cabeza de salida esta podada a 60.000 de 157.184 tokens: el modelo no puede generar palabras fuera de esa lista, lo que puede producir degradaciones o sustituciones en dominios con vocabulario especializado.
- La cuantizacion Q2_K de los expertos degrada la calidad: 1,054 bits por byte frente a 0,974-0,996 de modelos de 8B mas pequenos en el mismo dispositivo.
- Riesgo de bucles de repeticion; el autor aplica penalizacion 1,15 sobre las ultimas 256 posiciones y reporta 0 de 6 respuestas con bucle en su prueba, pero no es una garantia general.
- Contexto efectivo de solo 1.024 tokens en la configuracion validada, muy inferior a los 32.768 teoricos del modelo base.
- Rendimiento muy bajo (5,1 tok/s) y sin soporte documentado de concurrencia; no apto para produccion con multiples usuarios.
- Sesgos conocidos del modelo base: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero previsiblemente mayor que en el modelo original por la cuantizacion agresiva.
- Licencia MIT, la misma que el modelo original, lo que permite uso comercial; conviene conservar los creditos a inclusionAI, bartowski, llama.cpp y smolmaxxing.
- El repositorio no registra descargas ni likes en el momento de redactar esta ficha, y el hardware objetivo no es un entorno de produccion.

## Enlaces

- Repositorio Hugging Face de esta version: https://huggingface.co/hyperionaidev/Ling-mini-2.0-tvbox-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/Ling-mini-2.0
- Version GGUF oficial de inclusionAI: https://huggingface.co/inclusionAI/Ling-mini-2.0-GGUF
- Cuantizacion de origen e imatrix de bartowski: https://huggingface.co/bartowski/inclusionAI_Ling-mini-2.0-GGUF
- Proyecto smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Documento de experimentos (seccion 20): https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/ling-mini-2-0.html
