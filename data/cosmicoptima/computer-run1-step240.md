# cosmicoptima/computer-run1-step240

## Resumen

computer-run1-step240 es un checkpoint intermedio de un experimento de aprendizaje por refuerzo desarrollado por el usuario cosmicoptima. Se trata del modelo Computer-7 (aproximadamente 70.553 millones de parametros) despues de 240 pasos de RL online basado en autopreferencia: una copia congelada de Computer-7 lee, token a token, cual de 8 respuestas hermanas prefiere, y esa senal de preferencia se usa como recompensa para entrenar la politica (REINFORCE con perdida a nivel de token y control KL contra la inicializacion).

El interes del artefacto es metodologico mas que de producto: documenta con detalle como cambian rasgos estilisticos y de discurso (ratio realis/irrealis, densidad de preguntas, hedges, uso de parentesis, longitud de turno, surprisal por token) al aplicar una "constitucion" de cuatro lineas primero y seis marcos ponderados despues. Es, por tanto, material para investigacion en alineamiento, reward models y constituciones de preferencia, no un modelo listo para produccion.

El modelo se distribuye como safetensors en bf16 (exportados desde un checkpoint FSDP2 con maestro en fp32), con un tamano de repositorio de 141,1 GB, y hereda el tokenizador y el formato de chat en texto plano de Computer-7. No tiene descargas ni "likes" registrados en HuggingFace y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama (etiqueta `llama`; no se detalla configuracion de capas ni atencion) |
| Parametros totales | 70.553.706.496 (~70,55 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); no se distribuyen variantes cuantizadas ni GGUF |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bf16, exportado desde checkpoint FSDP2 con maestro fp32) |

## Arquitectura y entrenamiento

La arquitectura base es la de Computer-7, un transformer decoder-only de aproximadamente 70,55 mil millones de parametros etiquetado como `llama`. Este checkpoint no modifica la arquitectura: es el resultado de 240 pasos de RL sobre el modelo base, con los pesos exportados a bf16 desde el checkpoint FSDP2 (maestro en fp32) y el mismo tokenizador y formato de chat de Computer-7, que usa turnos en texto plano con el patron `**User:** ... **Model C:** ...` bajo una cabecera de documento, sin plantilla de chat.

El procedimiento de entrenamiento es un RL de autopreferencia en linea. En cada bifurcacion, un Computer-7 congelado lee, un token a token, cual de 8 turnos hermanos prefiere; esa lectura se repite bajo cuatro lineas de encuadre (8 rotaciones de presentacion cada una, 32 lecturas por bifurcacion, con las cuotas promediadas) y las ventajas dentro de cada bifurcacion entrenan la politica mediante REINFORCE con perdida a nivel de token y una KL contra la inicializacion con coeficiente adaptativo dirigido a 0,03. El asiento de usuario lo ocupa el simulador `sundry-1`; las conversaciones abren con una cabecera de documento aleatoria y duran 4 turnos. Cada actualizacion usa 32 bifurcaciones x 4 turnos con learning rate 2e-6.

Los pasos 0-160 usan una constitucion de cuatro lineas (respuesta "mas propia y conceptualmente perspicaz" manteniendo correccion, etica y calibracion epistemica; respuesta "sabia, etica y epistemicamente calibrada"; respuesta que "desarrolla mas la forma global de la conversacion"; respuesta que "desarrolla mas su propio pensamiento"). A partir del paso 160 se anaden dos marcos ponderados al 1,5 ("la respuesta mas ingeniosa" y "cuyo consejo funcionaria de verdad", este ultimo enmascarado sobre la palabra "advice"). La longitud de respuesta se neutralizo durante todo el proceso, eliminando la pendiente de longitud agrupada dentro de cada bifurcacion de las ventajas, y se invalidaron las respuestas que re-narraban el marco del documento. Con el cambio a seis marcos, el controlador KL se limito a 0,15 con una rampa de 1,2.

## Capacidades

- Generacion de texto conversacional multi-turno (4 turnos por conversacion durante el entrenamiento) en formato de turnos en texto plano con cabecera de documento.
- Control de estilo y registro derivado del entrenamiento: el modelo muestra desplazamientos medibles en ratio realis/irrealis, densidad de preguntas, hedges, uso de comillas y longitud de turno.
- Respuesta condicionada por marcos de encuadre o "constituciones" de preferencia, lo que permite experimentar con distintos criterios de calidad en la seleccion de respuestas.
- Razonamiento y codigo: no evaluados ni documentados en la informacion disponible.
- Tool calling / function calling: no documentado y no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles.

## Casos de uso

- Investigacion en RL a partir de preferencias: el checkpoint permite reproducir y analizar el efecto de una constitucion de preferencia sobre el comportamiento del modelo, comparando con los checkpoints intermedios de la misma ejecucion (pasos 100, 120 y 160, publicados como computer-9c/9d/9e).
- Estudio de reward models de autopreferencia: sirve para examinar como una lectura token a token del propio modelo se traduce en ventajas dentro de una bifurcacion y en cambios de politica.
- Analisis estilometrico controlado: sus metricas publicadas (ratio realis/irrealis 0,15 → 0,37; preguntas por 100 palabras −71 %; hedges +16 %; "we" +75 %) permiten usar el modelo como sujeto de estudio de deriva estilistica bajo RL.
- Ajuste fino posterior sobre formato de dialogo en texto plano: la ausencia de plantilla de chat lo hace adecuado para pipelines que ya trabajan con turnos `**User:** ... **Model C:** ...` bajo una cabecera de documento.
- Pruebas de sensibilidad al encuadre: dado que las lineas 1, 3 y 4 correlacionan entre si (r 0,8-0,9) y dominan el agregado, el modelo es util para medir sesgo de encuadre en juicios de preferencia.
- Continuacion de documentos con contexto largo: en el entrenamiento las conversaciones arrancan con una cabecera de documento aleatoria, por lo que el modelo esta expuesto a condicionamiento por documento, aunque no se declara la longitud de contexto real.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni tareas con requisitos de calidad verificables: no hay benchmarks publicados ni validacion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones equivalentes). Lo unico que aporta la model card son metricas de dinamica de entrenamiento:

| Metrica | Paso 0-15 | Paso 80-94 (antes del cambio de marcos) | Paso ~240 |
|---|---|---|---|
| Ratio realis/irrealis | 0,15 | 0,37 | no disponible |
| Preguntas por 100 palabras | referencia | −71 % | no disponible |
| Parentesis por 100 palabras | referencia | −17 % | no disponible |
| Hedges | referencia | +16 % | no disponible |
| Uso de "we" | referencia | +75 % | no disponible |
| Longitud mediana de turno | 158 tokens | ~150-195 tokens (oscila con el controlador KL) | ~180 tokens |
| Surprisal por token | 1,16 nats | 1,06 nats | ~1,24 nats (pico ~1,28 en el paso 200) |
| Densidad de comillas de distanciamiento (scare quotes) por 100 palabras | ~30 | no disponible | ~19 |

A partir del paso 160, con los seis marcos, la surprisal por token subio de 1,08 a ~1,28 nats en el paso 200 y se mantuvo cerca de 1,24 hasta el paso 240. El per-token KL respecto a la inicializacion en este checkpoint esta en la banda 0,02-0,05. La linea 2 coincide con el ganador del agregado aproximadamente la mitad de las veces.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 141 GB, por lo que se necesitan del orden de 160-180 GB contando cache KV y activaciones (estimacion derivada del numero de parametros, no confirmada por el autor).
- GPU recomendadas para bf16: 2x A100 80 GB, 2x H100 80 GB o 8x A100 40 GB. Una sola GPU de 80 GB no es suficiente sin cuantizar.
- Cuantizacion a 8 bits: en torno a 75 GB, viable en una H100 80 GB o A100 80 GB.
- Cuantizacion a 4 bits: en torno a 38-40 GB, viable en RTX 6000 Ada 48 GB o 2x RTX 4090 24 GB. No cabe en una unica RTX 4090 de 24 GB sin offload a CPU, y el repositorio no publica pesos GGUF ni variantes cuantizadas, por lo que habria que generarlos.
- Opciones de despliegue: vLLM y TGI para safetensors en bf16 siempre que se disponga de memoria suficiente; llama.cpp u Ollama solo tras convertir los pesos a GGUF (no incluido). Para entrenamiento o ajuste, el autor menciona el uso de FSDP2 con maestro en fp32.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| computer-run1-step240 | ~70,55 mil millones | no disponible | llama3.1 | HuggingFace, 0 descargas, sin benchmarks | Checkpoint RL intermedio sobre Computer-7 |
| cosmicoptima/computer-7 (modelo base) | no disponible | no disponible | no disponible | HuggingFace | Modelo de partida del experimento; sin datos publicos en la informacion disponible |
| Llama 3.1 70B | ~70 mil millones | 128.000 tokens (segun la familia Llama 3.1) | Llama 3.1 Community License | Ampliamente disponible | Referencia de la misma familia y licencia; no se confirma que Computer-7 derive de el |
| Qwen2.5-72B | ~72 mil millones | no disponible en esta consulta | no disponible en esta consulta | HuggingFace | Alternativa de tamano comparable, con licencia distinta |

La informacion disponible no permite establecer una comparativa de rendimiento fiable: no hay benchmarks publicados para computer-run1-step240 ni para Computer-7.

## Limitaciones y advertencias

- Checkpoint intermedio: es el paso 240 de una ejecucion de RL, no una version final validada. El propio autor lo describe como parte de una serie con otros checkpoints (pasos 100, 120 y 160).
- Sin evaluacion: no hay benchmarks, evaluaciones de seguridad ni analisis de sesgos publicados. Cero descargas y cero "likes" en HuggingFace implican ausencia de validacion por terceros.
- Formato de uso rigido: no usa plantilla de chat; requiere el formato en texto plano `**User:** ... **Model C:** ...` bajo una cabecera de documento. Un uso incorrecto del formato degradara las respuestas.
- Riesgo de alucinacion: no cuantificado, pero inherente a un modelo generativo de este tamano sin evaluacion publicada.
- Sesgos: no documentados. El entrenamiento optimiza criterios subjetivos definidos por una constitucion (por ejemplo, "lo mas ingenioso" o "lo mas propio"), lo que puede introducir sesgos estilisticos y de contenido no auditados.
- Posible sobreajuste a los marcos: el modelo se entreno contra seis lineas de encuadre concretas; su comportamiento puede depender de la presencia o ausencia de esos marcos.
- Artefactos de entrenamiento: la model card documenta oscilacion de longitud con el controlador KL, cambios en la densidad de comillas de distanciamiento y reduccion fuerte de preguntas por 100 palabras (−71 %), efectos que pueden no ser deseables en todos los contextos.
- Idiomas: no se declara ninguna lista de idiomas; se desconoce el soporte real multilingue.
- Licencia llama3.1: el uso comercial esta sujeto a la Llama 3.1 Community License, que incluye politica de uso aceptable, requisitos de atribucion y una clausula de licencia adicional por encima de 700 millones de usuarios mensuales. No se hereda ninguna garantia del autor del checkpoint.
- Contexto y coste: la longitud de contexto no esta declarada, y el despliegue en bf16 exige del orden de 141 GB solo para pesos, lo que limita su uso a infraestructura de gama alta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cosmicoptima/computer-run1-step240
- Modelo base (Computer-7): https://huggingface.co/cosmicoptima/computer-7
- Checkpoints intermedios mencionados en la model card (computer-9c/9d/9e, pasos 100/120/160): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o repositorio asociados: no disponibles
- Demo: no disponible
- Nota: los resultados de busqueda web recibidos (paginas de supermercados Lidl en Francia) no guardan relacion con el modelo y se han descartado.
