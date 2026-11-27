# Lanilen/Inkling-2-Mini-Draft-Kit

## Resumen

Inkling-2-Mini-Draft-Kit es un conjunto de ficheros auxiliares desarrollado por Lanilen para acelerar la decodificacion especulativa del modelo Inkling 2 Mini de Thinking Machines. No es un modelo de lenguaje: se trata de un kit de "drafting" compuesto por un diccionario de tokens, un mapa de familias de tokens y un modelo de salida aprendido (LightGBM) que mejora el rendimiento del drafter DSpark que acompana al modelo objetivo. Su funcion es exclusivamente de aceleracion: el modelo objetivo verifica cada token propuesto sobre todo su vocabulario, de modo que la salida es exactamente la del modelo original.

La relevancia del kit radica en que el drafter original pierde eficacia cuando el texto es dificil o cuando se muestrea a la temperatura para la que el modelo esta pensado (1.0), ya que verifica cuatro borradores por paso y la mayoria se rechazan. El kit detiene esos borradores antes de que se verifiquen, lo que mantiene la ganancia de velocidad incluso en esos escenarios: segun la model card, la mejora frente a no usar drafter es de 1,4 a 2,2 veces la del drafter original, y de hasta 5,7 veces en una peticion concreta sobre una R9700.

El kit esta disenado para funcionar con el fork Polaris de llama.cpp y con los pesos GGUF de Inkling 2 Mini publicados por unsloth. La version 1 se publico el 27 de noviembre de 2026 bajo licencia MIT, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | kit de decodificacion especulativa (diccionario de tokens, mapa de familias y modelo de salida LightGBM); no es un modelo de lenguaje |
| Parametros totales | no disponible (el componente aprendido es un LightGBM de 300 arboles y 33 entradas) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo objetivo Inkling 2 Mini) |
| Tipos de cuantizacion | no aplica al kit; el modelo objetivo se mide con UD-Q4_K_XL y el drafter con Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ficheros de texto plano (`.txt`): diccionario de 24.576 IDs de token, mapa de 1.024 familias, modelo de salida y fichero de verificacion de 2.000 filas; incluye `SHA256SUMS` |

## Arquitectura y entrenamiento

El kit consta de tres componentes. El primero es `inkling2-dict-24k.txt`, un nucleo fijo con los 24.576 tokens mas frecuentes de las respuestas de Inkling, un ID por linea. El segundo es `inkling2-families-1024.txt`, que asigna a cada token su familia (1.024 clusters de las filas de la cabeza de salida), de modo que un token de respuesta fuera del diccionario carga su familia bajo demanda. El tercero es `inkling2-exit-v1.txt`, un modelo LightGBM de 300 arboles y 33 entradas que estima la probabilidad de que un token borrador sea aceptado, sustituyendo el criterio de parada fijo.

El mecanismo de aceleracion se apoya en dos ideas. El diccionario reduce el espacio de drafting de unos 200.000 tokens a unos 35.000 (nucleo fijo, un anillo de tokens del prompt y de la respuesta, y bloques de familias cargados segun necesidad), de forma que la cabeza de salida y la cabeza de Markov del drafter calculan solo esas filas, lo que reduce a la mitad el tiempo del drafter. El modelo de salida detiene el borrador antes del primer token que se predice rechazado, a partir de los propios candidatos del drafter, el tipo de token y el historial de la peticion. El modelo objetivo sigue verificando sobre el vocabulario completo. No se detalla en la informacion disponible el proceso de entrenamiento del modelo de salida ni el dataset empleado.

## Capacidades

- Aceleracion de la decodificacion especulativa del drafter DSpark de Inkling 2 Mini, sin alterar la salida del modelo objetivo.
- Reduccion del coste de computo del drafter al limitar su cabeza de salida y su cabeza de Markov a unas 35.000 filas.
- Parada adaptativa de borradores mediante un modelo de salida aprendido, con especial ganancia en texto dificil y a temperatura de muestreo 1.0.
- Integracion con llama.cpp a traves del fork Polaris, con las opciones `--spec-draft-dict`, `--spec-draft-dict-families` y `--spec-draft-exit-model`.
- Fichero de verificacion (`inkling2-exit-v1-check.txt`) con 2.000 filas de entradas y salidas esperadas para validar implementaciones del modelo de salida.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades multilingues por si mismo: no es un modelo de lenguaje.

## Casos de uso

- Despliegue de Inkling 2 Mini en produccion con llama.cpp: el kit se anade a las opciones del servidor junto al drafter DSpark y reduce la latencia de respuesta sin cambiar el contenido generado, lo que permite servir el mismo modelo con menos tiempo por peticion.
- Inferencia en GPU de gama alta con el modelo completo en VRAM: en una configuracion 1920X + R9700 el kit eleva las peticiones cotidianas de 64,1 a 92,9 tok/s y las de revision de 64,3 a 96,6 tok/s, segun la model card.
- Inferencia hibrida GPU/RAM en equipos de consumo: en una configuracion 14600KF + RTX 4070 Ti de 12 GB con expertos en RAM, el kit pasa de 35,1 a 59,7 tok/s en peticiones cotidianas y de 35,9 a 63,6 tok/s en revisiones.
- Recuperacion de hardware antiguo: en una 1920X con una RX 480 de 8 GB (2016) el kit mejora de 14,6 a 22,0 tok/s en peticiones cotidianas, lo que hace viable el uso del modelo en GPUs de gama baja.
- Escenarios de texto dificil o muestreo a temperatura 1.0: donde el drafter original pierde la mayor parte de su ganancia, el kit mantiene la aceleracion (por ejemplo, 51,4 tok/s frente a 42,3 del drafter original en la RTX 4070 Ti en la peticion de revision).
- Validacion de implementaciones propias: el fichero `inkling2-exit-v1-check.txt` permite comprobar que una reimplementacion del modelo de salida produce las mismas decisiones que la version de referencia.
- Investigacion sobre decodificacion especulativa: los ficheros y las mediciones publicadas sirven como base reproducible para estudiar diccionarios de drafting y criterios de parada aprendidos.

## Benchmarks y rendimiento

Rendimiento en tok/s (temperatura 0) segun la model card del autor:

| Configuracion | Peticion | Sin drafter | Drafter original | Con este kit |
|---|---|---|---|---|
| 1920X + R9700 (modelo completo en GPU) | cotidiana | 64,1 | 69,1 | 92,9 |
| 1920X + R9700 (modelo completo en GPU) | revision | 64,3 | 82,7 | 96,6 |
| 14600KF + RTX 4070 Ti 12 GB (expertos en RAM) | cotidiana | 35,1 | 56,9 | 59,7 |
| 14600KF + RTX 4070 Ti 12 GB (expertos en RAM) | revision | 35,9 | 55,3 | 63,6 |
| 1920X + RX 480 8 GB (expertos en RAM) | cotidiana | 14,6 | 15,9 | 22,0 |
| 1920X + RX 480 8 GB (expertos en RAM) | revision | 14,6 | 19,4 | 22,4 |

A temperatura 1.0 en la RTX 4070 Ti (medianas de cinco pasadas): revision a 34,9 / 42,3 / 51,4 tok/s y notas a 34,8 / 47,8 / 52,8 tok/s (sin drafter / drafter original / con kit). La fila de la RTX 4070 Ti se midio con un escritorio minimo en la tarjeta (0,1 GB) y una cache de 8000 MiB; una sesion de escritorio completa en la misma GPU hizo que todas las configuraciones fueran aproximadamente un tercio mas lentas. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) porque el kit no es un modelo de lenguaje y no altera la salida del modelo objetivo.

## Requisitos de hardware

- El kit no impone requisitos propios de VRAM: sus ficheros son de texto plano y el modelo de salida es un LightGBM de 300 arboles.
- Los requisitos vienen del modelo objetivo Inkling 2 Mini y de su drafter DSpark. En las mediciones se uso el GGUF `Mainline_Support/UD-Q4_K_XL` de unsloth (tensores densos en Q8_0, expertos en NVFP4, cache KV en F16) y el drafter `dspark-Inkling-2-Mini-Q8_0`.
- GPU probadas en la model card: Radeon R9700 (modelo completo en GPU), RTX 4070 Ti de 12 GB (expertos en RAM con cache de respaldo en caliente) y RX 480 de 8 GB (expertos en RAM).
- Cabe en GPU de consumo con el modelo parcialmente en RAM; el rendimiento depende del ancho de banda de memoria y de la cache configurada.
- Despliegue: fork Polaris de llama.cpp (rama `polaris`, a partir de `c52c9eaf6`, 2026-11-27), con las opciones de drafter indicadas y `-bs` (muestreo del objetivo en la GPU) como parte de la configuracion medida.
- Latencia y throughput: ver la tabla de benchmarks; la ganancia del kit frente al drafter original es de 5-15% en texto facil y de 1,4 a 2,2 veces la del drafter original en texto dificil o a temperatura 1.0.

## Comparativa con modelos similares

| Componente | Tipo | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-Draft-Kit (este) | kit de drafting (diccionario + salida aprendida) | acelerar el drafter DSpark de Inkling 2 Mini | MIT | Hugging Face, 0 descargas |
| Drafter DSpark de Inkling 2 Mini (incluido con el modelo) | drafter especulativo | proponer tokens candidatos para verificacion | no disponible | incluido con el modelo objetivo |
| `dspark-Inkling-2-Mini-Q8_0` de unsloth | drafter cuantizado en GGUF | drafter DSpark en Q8_0 para llama.cpp | no disponible | unsloth/Inkling-2-Mini-GGUF |

No se dispone de informacion sobre otros kits de drafting comparables ni sobre modelos alternativos con los que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por si mismo y no funciona sin Inkling 2 Mini y su drafter DSpark.
- Requiere el fork Polaris de llama.cpp; no se indica compatibilidad con la version principal de llama.cpp ni con otros motores (vLLM, TGI, Ollama).
- Las mediciones publicadas son del autor y corresponden a configuraciones concretas de hardware, cache y escritorio; el propio autor advierte de que una sesion de escritorio completa en la GPU reduce el rendimiento en aproximadamente un tercio.
- La ganancia depende del tipo de texto: en texto facil la mejora sobre el drafter original es del 5-15%, y la ventaja grande aparece en texto dificil o a temperatura 1.0.
- El modelo de salida aprendido puede introducir decisiones de parada suboptimas en distribuciones de texto distintas de las de evaluacion; el fichero de verificacion permite comprobar la implementacion, pero no se documentan sesgos especificos.
- No se documentan idiomas soportados ni restricciones de uso comercial mas alla de la licencia MIT.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Lanilen/Inkling-2-Mini-Draft-Kit
- Modelo objetivo: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del modelo y drafter: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Fork Polaris de llama.cpp: https://github.com/Lanilen/llama.cpp
- Guia de Inkling 2 Mini en el fork: https://github.com/Lanilen/llama.cpp/blob/polaris/docs/inkling2-mini.md#the-draft-kit-a-dictionary-and-a-learned-exit
