# gbuzhf/Ornith-1.5-35B-A3B-Huihui-Sangreal-MTP-ICE-GGUF

## Resumen

Ornith-1.5-35B-A3B-Huihui-Sangreal-MTP-ICE-GGUF es una familia de cuantizaciones GGUF publicada por el usuario gbuzhf sobre el checkpoint abliterado de huihui-ai del modelo ornith-ai/Ornith-1.5-35B-A3B, un transformer de tipo mezcla de expertos (MoE, etiqueta qwen35moe) con 35.505.251.456 parametros totales y una nomenclatura A3B que apunta a un subconjunto activo de aproximadamente 3.000 millones de parametros. El repositorio distribuye cinco niveles de cuantizacion denominados ICE (15G, 19G, 21G, 23G y 25G), calibrados contra Sangreal, un corpus de calibracion de 77 buckets disenado especificamente para este metodo, y empaquetados con la plantilla de chat Qwen-Sharp de peculiar-ragdoll.

La relevancia de esta publicacion es doble. Por un lado, introduce el nivel 15G-ICE, el primero por debajo del umbral de 17 GB para el que el metodo estaba originalmente pensado, lo que permite ejecutar un modelo MoE de 35B en tarjetas de 16 GB de VRAM. Por otro lado, todos los niveles conservan la cabeza MTPv2 del checkpoint original, de modo que cada fichero puede actuar como modelo borrador en decodificacion especulativa sin necesidad de un draft model aparte.

El checkpoint de partida es abliterado: el comportamiento de rechazo se ha suprimido en los pesos, por lo que se trata de un modelo sin censura, con licencia MIT y soporte para ingles y chino. El autor incluye mediciones de fidelidad de cuantizacion (KLD y PPL frente al maestro BF16) para cada nivel, lo que permite elegir el tamano en funcion del hardware disponible y de la degradacion asumible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta qwen35moe) con cabeza MTPv2 para decodificacion especulativa |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no confirmado en la informacion disponible; la nomenclatura A3B del modelo base sugiere aproximadamente 3.000 millones |
| Longitud de contexto | no disponible (las mediciones del autor usan n_ctx 2048 con 64 chunks) |
| Tipos de cuantizacion | GGUF ICE en cinco niveles: 15G (14,79 GB), 19G (18,82 GB), 21G (20,85 GB), 23G (22,84 GB) y 25G (24,85 GB); bpw de fichero entre 3,341 y 5,599 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (el maestro BF16 del que derivan se publica en otro repositorio) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de mezcla de expertos con 35.500 millones de parametros totales y una fraccion activa por token reducida, segun la convencion de nombres A3B. Sobre esa base, huihui-ai aplico un proceso de abliteracion que suprime la direccion de rechazo en los pesos, de modo que este repositorio no es un ajuste adicional sobre el modelo original sino una version modificada del mismo. El checkpoint abliterado conserva la cabeza MTPv2 (multi-token prediction) ya entrenada en Ornith-1.5, lo que habilita la decodificacion especulativa usando el propio modelo como borrador.

El trabajo de este repositorio es exclusivamente de cuantizacion: las cinco variantes ICE se generaron a partir de un maestro BF16 y se calibraron contra Sangreal, un corpus de calibracion de 77 buckets construido a proposito para el metodo, con imatrix. El autor no documenta en esta ficha el numero de tokens de entrenamiento, la composicion del dataset original, ni si hubo fases de RLHF o DPO en el modelo base; esa informacion no esta disponible en la model card proporcionada. La innovacion tecnica destacable es la combinacion de cuantizacion calibrada por nivel con la cabeza MTPv2 preservada, que se traduce en decodificacion especulativa nativa en cada fichero GGUF.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat Qwen-Sharp.
- Generacion de codigo, evidenciada por las mediciones especificas del autor sobre el conjunto code.test.raw (PPL base 2.194208).
- Decodificacion especulativa integrada: cada nivel GGUF incluye la cabeza MTPv2 y puede usarse como borrador sin modelo auxiliar.
- Comportamiento sin rechazos (abliterated): no aplica capas de negativa ante peticiones que el modelo original rechazaria.
- Ejecucion local en cuantizaciones de 4 a 8 bits efectivos, con niveles disenados para 16, 24 y 32 GB de memoria combinada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo thinking explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en estacion de trabajo local: el nivel 23G-ICE, recomendado por el autor como punto de partida, mantiene un 97,7 de puntuacion global en codigo y cabe en una GPU de 24 GB, lo que permite autocompletado y generacion de funciones sin conexion a servicios externos.
- Despliegue en portatil o equipo con GPU de 16 GB: el nivel 15G-ICE (14,79 GB) es el unico de la familia que entra en esa franja de memoria, pensado para inference local con degradacion asumida (puntuacion global 87,9 en texto y 96,1 en codigo segun el autor).
- Servidor de chat bilingue ingles-chino: el modelo declara soporte para ambos idiomas y una plantilla de chat conversacional, adecuado para atencion en entornos con usuarios de esas dos lenguas.
- Servicio de inferencia con decodificacion especulativa: al llevar la cabeza MTPv2, cada fichero puede configurarse como draft dentro de un servidor compatible (por ejemplo llama.cpp o vLLM con soporte MTP), reduciendo la latencia por token sin anadir un modelo borrador adicional.
- Investigacion sobre comportamiento de rechazo y alineacion: al ser un checkpoint abliterado, sirve como objeto de estudio para comparar respuestas frente al modelo original con fines academicos, siempre en un entorno aislado.
- Generacion de datos sinteticos y evaluacion de filtros de seguridad: el modelo puede producir grandes volumenes de texto sin negativas, util para construir conjuntos de prueba de clasificadores y sistemas de moderacion.
- Red teaming y pruebas de prompt injection: el propio autor recomienda usarlo en sandbox a nivel de sistema operativo, controlando red y ejecucion de codigo, precisamente porque no existe una capa de rechazo que frene una inyeccion hostil.
- Procesamiento por lotes en una sola GPU de 24 o 32 GB: los niveles 19G, 21G y 23G permiten levantar varias instancias o lotes grandes dentro de la VRAM disponible, con distintos equilibrios entre fidelidad y consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. El autor si publica mediciones de fidelidad de cuantizacion frente al maestro BF16, realizadas con un unico binario, una unica referencia y una unica sesion, sobre 64 chunks con n_ctx 2048. La deriva de KLD entre sesiones se estima en un 0,8 por ciento sobre entradas identicas.

Texto en ingles (WikiText-2, PPL base 7,574505):

| Fichero | Tamano | KLD medio | KLD 99% | KLD 99,9% | Ratio PPL | Coincidencia top-1 | bpw activos | bpw fichero | Global |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Sangreal 25G-ICE | 24,85 GB | 0,029038 | 0,2823 | 1,2220 | 0,9857 | 93,27 % | 7,686 | 5,599 | 96,0 |
| Sangreal 23G-ICE | 22,84 GB | 0,033585 | 0,3299 | 1,3758 | 0,9870 | 92,69 % | 7,523 | 5,145 | 95,5 |
| Sangreal 21G-ICE | 20,85 GB | 0,039968 | 0,4156 | 1,5834 | 0,9819 | 92,03 % | 7,357 | 4,698 | 94,9 |
| Sangreal 19G-ICE | 18,82 GB | 0,060435 | 0,6098 | 2,1340 | 0,9948 | 90,15 % | 7,192 | 4,241 | 93,1 |
| Sangreal 15G-ICE | 14,83 GB | 0,126386 | 1,3329 | 3,9267 | 1,0027 | 85,89 % | 6,853 | 3,341 | 87,9 |

Codigo (code.test.raw, PPL base 2,194208):

| Fichero | KLD medio | KLD 99% | KLD 99,9% | Ratio PPL | Coincidencia top-1 | Global |
|---|---:|---:|---:|---:|---:|---:|
| Sangreal 25G-ICE | 0,015308 | 0,2274 | 1,0218 | 1,0017 | 97,00 % | 98,0 |
| Sangreal 23G-ICE | 0,018988 | 0,2831 | 1,2650 | 1,0023 | 96,73 % | 97,7 |
| Sangreal 21G-ICE | 0,023415 | 0,3529 | 1,4214 | 1,0042 | 96,35 % | 97,3 |
| Sangreal 19G-ICE | 0,036887 | 0,5614 | 2,4828 | 1,0159 | 95,33 % | 96,1 |
| Sangreal 15G-ICE | 0,088158 | 1,4526 | 4,7767 | 1,0467 | no disponible | no disponible |

## Requisitos de hardware

- VRAM y RAM combinadas estimadas por nivel: 15G-ICE requiere 16 GB; 19G-ICE y 21G-ICE, 24 GB; 23G-ICE, entre 24 y 32 GB; 25G-ICE, 32 GB.
- Cabe en GPU de consumo: el nivel 15G-ICE (14,79 GB) esta disenado explicitamente para tarjetas de 16 GB; los niveles 19G, 21G y 23G encajan en tarjetas de 24 GB como la RTX 4090 o la RTX 3090; el nivel 25G-ICE pide 32 GB (por ejemplo una RTX 5090 de 32 GB).
- GPU profesionales recomendadas: A100 de 40 u 80 GB, H100 o L40S para servir los niveles altos con margen de contexto amplio y lotes concurrentes.
- Opciones de despliegue: al ser ficheros GGUF, el formato objetivo es llama.cpp y sus envoltorios (Ollama, LM Studio, llama-cpp-python); para explotar la cabeza MTPv2 hace falta un motor con soporte de decodificacion especulativa MTP. vLLM y TGI requieren conversion a safetensors y no consumen GGUF directamente, por lo que no estan disponibles para estos ficheros tal cual.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo, solo metricas de fidelidad (KLD y PPL).

## Comparativa con modelos similares

Los datos disponibles permiten comparar los niveles Sangreal-ICE con la escalera UD y con la escalera CyberTiel del mismo modelo base, todos medidos en la misma sesion:

| Fichero | Tamano | KLD medio (texto) | Global texto | Global codigo |
|---|---:|---:|---:|---:|
| UD-Q5_K_XL | 26,98 GB | 0,024330 | 96,5 | 98,3 |
| CyberTiel 25G-ICE | 24,85 GB | 0,027866 | 96,1 | 98,0 |
| Sangreal 25G-ICE | 24,85 GB | 0,029038 | 96,0 | 98,0 |
| UD-Q4_K_XL | 22,75 GB | 0,035837 | 95,3 | 97,6 |
| Sangreal 23G-ICE | 22,84 GB | 0,033585 | 95,5 | 97,7 |
| UD-Q4_K_S | 21,28 GB | 0,040169 | 94,9 | 97,3 |
| Sangreal 21G-ICE | 20,85 GB | 0,039968 | 94,9 | 97,3 |
| UD-IQ4_XS | 18,12 GB | 0,070787 | 92,2 | 95,5 |
| Sangreal 19G-ICE | 18,82 GB | 0,060435 | 93,1 | 96,1 |
| UD-IQ3_XXS | 13,60 GB | 0,151623 | 86,2 | no disponible |
| Sangreal 15G-ICE | 14,83 GB | 0,126386 | 87,9 | no disponible |

Comparacion con modelos de otras familias (por ejemplo otros MoE abliterados de tamano similar): no disponible en la informacion proporcionada. No se dispone de datos de benchmarks estandar que permitan situar este modelo frente a alternativas de terceros.

## Limitaciones y advertencias

- Modelo abliterado: el comportamiento de rechazo se ha suprimido en los pesos. Es un modelo sin censura y el autor recomienda aislarlo a nivel de sistema operativo, controlando el acceso a red y a ejecucion de codigo, ya que una inyeccion de prompt desde una pagina hostil o codigo de terceros no encontrara ninguna capa de negativa que la frene.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion; el proceso de abliteracion y la cuantizacion agresiva en los niveles bajos pueden incrementar la deriva respecto al modelo original.
- Degradacion por cuantizacion: el nivel 15G-ICE presenta un KLD medio de 0,126386 en texto y una coincidencia top-1 del 85,89 %, muy por debajo de los niveles de 23 GB o mas; no es adecuado para tareas que requieran alta fidelidad.
- Idiomas: solo se declaran ingles y chino. El rendimiento en castellano u otros idiomas no esta documentado.
- Longitud de contexto: no especificada en la informacion disponible; las mediciones se hicieron con 2048 tokens de contexto, por lo que no hay evidencia publicada sobre comportamiento en ventanas largas.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero el autor no ofrece garantias y el usuario asume la responsabilidad legal del contenido generado por un modelo sin censura.
- Procedencia: se trata de una cuantizacion de terceros sobre un checkpoint abliterado de terceros, no de una publicacion oficial de ornith-ai; la trazabilidad del entrenamiento original no esta documentada en esta ficha.
- El repositorio ocupa 102,4 GB en total y hay que descargar solo el nivel necesario; el fichero GGUF elegido debe coincidir con la memoria disponible o el modelo no cargara.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-Huihui-Sangreal-MTP-ICE-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Maestro BF16 del que derivan los cinco niveles: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-Abliterated-CyberTiel-Calibrated-MTPv2-ICE-GGUF
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo (los resultados devueltos corresponden a la temporada 2025-26 de la NBA y no guardan relacion con el modelo).
