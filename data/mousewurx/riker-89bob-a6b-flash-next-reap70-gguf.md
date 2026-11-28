# MouseWurX/Riker-89Bob-A6B-Flash-Next-REAP70-GGUF

## Resumen

Riker 89Bob A6B Flash-Next REAP70 es una version podada y cuantizada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario MouseWurX en Hugging Face. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) al que se le han eliminado 153 de los 512 expertos de cada capa, conservando 359 por capa (un 70 % del total). El resultado son aproximadamente 88.900 millones de parametros efectivos de los 125.000 millones del modelo base, segun indica el autor, sin contar el embedding n-gram y la capa MTP. El modelo no ha sido reentrenado ni "curado" tras la poda.

La seleccion de expertos se realizo mediante puntuaciones de estilo REAP (router-weighted expert activation pruning), calculadas a partir de trazas de uso real del modelo base ejecutando tareas cotidianas de asistente (correo, archivos de oficina y codigo). El modelo forma parte del proyecto Bob, un asistente personal de ejecucion local, y su objetivo declarado es acercar las capacidades del Flash-Next completo a un ordenador domestico con 16 GB de VRAM y 32 GB de RAM.

La publicacion se distribuye exclusivamente en formato GGUF, con cinco cuantizaciones que van desde IQ2_XXS (53,5 GB) hasta Q4_K_M (95,0 GB). El repositorio ocupa 359,9 GB e incluye el fichero `keep.json` con la lista de expertos conservados por capa y una imatrix propia. La licencia es qwen-community-1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, derivada de Qwen3.8-Flash-Next |
| Parametros totales | 140.827.870.080 (safetensors del repo); ~88,9B efectivos tras la poda segun el autor |
| Parametros activos | ~6B (denominacion A6B del nombre del modelo; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS, IQ2_M, Q3_K_M, IQ4_XS, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (exclusivamente) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 48 capas y 512 expertos por capa en su version original. La intervencion consiste en una poda estructurada de expertos: en cada capa se conservan los 359 expertos con mayor puntuacion REAP, calculada como el peso que el router asigna a cada experto multiplicado por el tamano de su salida, sumado sobre todas las palabras de las ejecuciones limpias. La lista de conservacion se construyo a partir de la lista del 65 % mas los 26 expertos de la banda entre el 65 % y el 75 % que fueron seleccionados con mas frecuencia. En la capa 47 la traza solo mostro unos 30 expertos con peso real, por lo que el resto de la lista se completo por numero de experto. La capa MTP (draft) conserva los expertos mas veces retenidos en el resto de capas, y el experto compartido y todo lo que queda fuera de los expertos permanece intacto.

El proceso de generacion de los ficheros partio de la version Q8_0 de unsloth/Qwen3.8-Flash-Next-GGUF, a la que se aplico `gguf_cut_experts.py` para copiar rebanadas completas de expertos sin modificar su interior. Posteriormente se cuantizo con `llama-quantize` de llama.cpp usando una imatrix propia (`imatrix.gguf`) generada a partir de chats de entrenamiento del autor, no de las tareas de evaluacion. No hubo reentrenamiento ni recuperacion (healing) de los expertos eliminados. Destaca una particularidad tecnica: algunas filas de Flash-Next no son multiplos de 256 de ancho (la proyeccion down de cada experto, de 640, y el embedding n-gram de 51B, de 160), lo que obliga a usar tipos de cuantizacion especificos (Q2_0 en los ficheros IQ2 y tipos de 32 de ancho de 4-5 bits en el resto) y explica que los ficheros sean mayores de lo que sugieren sus nombres.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredados del modelo base Qwen3.8-Flash-Next.
- Trabajo con correo electronico: clasificacion, busqueda y redaccion de respuestas.
- Manipulacion de archivos de oficina (creacion y edicion de documentos).
- Trabajo en proyectos de codigo dentro de un bucle de herramientas (tool loop) propio del proyecto Bob.
- Busquedas web e interaccion con aplicaciones, segun el diseno del asistente Bob.
- Soporte de tool calling / function calling a traves del bucle de herramientas descrito por el autor.
- Ejecucion local: disenado para funcionar en un equipo domestico sin enviar datos al exterior salvo que se active explicitamente.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente personal local: el modelo esta pensado como cerebro de Bob, un asistente que gestiona chat, correo, archivos de oficina, codigo, busquedas web y aplicaciones en el propio ordenador, con la ventaja de que nada sale del equipo salvo que se active.
- Gestion de bandeja de entrada: clasificacion de correo y localizacion de mensajes relevantes; en las pruebas del autor la retencion del 70 % de expertos busca mantener el rendimiento de busqueda de correos (la metrica de inbox cae del 90,8 % al 79,0 % entre el 75 % y el 65 % de retencion).
- Edicion de documentos de oficina: creacion y modificacion de archivos ofimaticos mediante el bucle de herramientas, adecuado para flujos de trabajo personales o de pequena oficina.
- Asistencia en proyectos de codigo: el modelo fue evaluado en tareas de repositorio de codigo (12 de 12 en los niveles de 100 %, 90 %, 80 %, 65 % y 60 % de retencion), lo que lo hace util para navegar y modificar codigo en local.
- Despliegue en hardware de consumo: con cuantizaciones de 53,5 a 95,0 GB y uso de memory mapping para el embedding n-gram, esta pensado para ejecutarse en un equipo con 16 GB de GPU y 32 GB de RAM.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local, encaja en escenarios donde no se permite enviar datos a servicios en la nube.
- Experimentacion con poda de MoE: la publicacion incluye `keep.json` e imatrix, lo que permite reproducir o auditar la seleccion de expertos y comparar con los cortes Bobert (80 %) y Bill (60 %) del mismo autor.

## Benchmarks y rendimiento

El autor publica resultados sobre conjuntos de tareas retenidos (held-out) de Bob, nunca usados para puntuar expertos, comparando niveles de retencion mediante una mascara de expertos en tiempo de servicio (sin fichero cortado ni healing). Los datos corresponden a Flash-Next UD-Q4_K_XL, 22 de noviembre de 2026, una ejecucion por nivel:

| Expertos conservados | Office (de 14) | Code repo (de 12) | Web (de 11) | Inbox (encontrar correos) | Acciones daninas |
|---|---|---|---|---|---|
| 100 % | 13 | 12 | 8 | 85,0 % | 0 |
| 90 % | 13 | 12 | 9 | 92,7 % | 0 |
| 80 % | 12 | 12 | 9 | 92,2 % | 0 |
| 75 % | 13 | 10 | 8 | 90,8 % | 1 (borro un correo que requeria respuesta) |
| 65 % | 13 | 12 | 9 | 79,0 % | 0 |
| 60 % | 13 | 12 | 8 | 79,6 % | 0 |
| 50 % | 9 | 11 | 9 | 85,7 % | 0 |

El nivel del 70 % no se ejecuto como mascara, por lo que sus puntuaciones no estan probadas en el laboratorio del autor segun sus propias notas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion. IQ2_XXS ocupa 53,5 GB, IQ2_M 57,3 GB, Q3_K_M 75,4 GB, IQ4_XS 77,8 GB y Q4_K_M 95,0 GB. El embedding n-gram (unos 29 GB) puede leerse desde disco con memory mapping y no consume RAM ni VRAM; el resto del fichero es lo que debe caber en memoria.
- Objetivo declarado por el autor: un ordenador domestico con 16 GB de tarjeta grafica y 32 GB de RAM.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por el volumen de los ficheros, las cuantizaciones IQ2 requieren al menos 53,5 GB de memoria combinada, lo que excede una unica GPU de consumo de 16 GB y obliga a repartir entre GPU y RAM o a usar varias GPU.
- Opciones de despliegue: llama.cpp (requiere builds que ejecuten Qwen/Qwen3.8-Flash-Next). El modelo esta etiquetado como compatible con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Riker 89Bob A6B Flash-Next REAP70 | 140,8B totales; ~88,9B efectivos tras poda | no disponible | qwen-community-1.0 | GGUF | Poda REAP al 70 % de expertos, sin reentrenamiento |
| Qwen/Qwen3.8-Flash-Next (base) | 125B segun el autor (512 expertos por capa, 48 capas) | no disponible | qwen-community-1.0 | safetensors, GGUF (via Unsloth) | Modelo completo sin poda |
| Bobert (corte del 80 %) | no disponible | no disponible | qwen-community-1.0 | GGUF | Mismo autor, conserva el 80 % de expertos |
| Bill (corte del 60 %) | no disponible | no disponible | qwen-community-1.0 | GGUF | Mismo autor, conserva el 60 % de expertos |

Los datos de parametros del modelo base y de los otros cortes no estan detallados en la informacion disponible mas alla de lo indicado.

## Limitaciones y advertencias

- La poda no fue seguida de reentrenamiento ni healing: los expertos eliminados no se compensan, lo que puede degradar capacidades no cubiertas por las tareas de seleccion.
- La seleccion de expertos se baso en tareas cotidianas concretas (correo, oficina, codigo) del autor; el rendimiento en otros dominios no esta evaluado.
- El nivel del 70 % no se probo como mascara en el laboratorio del autor, por lo que su rendimiento es una extrapolacion entre los niveles del 75 % y el 65 %.
- En el nivel del 75 % se registro una accion danina (borrado de un correo que requeria respuesta), lo que senala riesgo en tareas con efectos irreversibles.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones especificas de fidelidad.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue equivalente al del modelo base.
- La licencia qwen-community-1.0 impone restricciones que deben revisarse antes de uso comercial; el repositorio la etiqueta como "other".
- Los ficheros son mas grandes de lo que sugieren sus nombres por las limitaciones de ancho de fila en llama.cpp; el embedding n-gram de unos 29 GB requiere memory mapping para no consumir RAM.
- El modelo se distribuye solo en GGUF y depende de builds especificos de llama.cpp; no hay pesos safetensors del modelo podado.
- El repositorio ocupa 359,9 GB, lo que exige espacio de almacenamiento considerable incluso descargando una sola cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MouseWurX/Riker-89Bob-A6B-Flash-Next-REAP70-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Proyecto Bob (codigo y notas): https://github.com/MouseWurX/Bob
- Dataset de lecciones de Bob: https://huggingface.co/datasets/MouseWurX/bob-lessons
- Paper de REAP (Lasby et al., 2025): no disponible como enlace en la informacion proporcionada
