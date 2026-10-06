# morriszjm/Tacit-9B

## Resumen

Tacit-9B es un modelo de 9.409.813.744 parámetros publicado por el usuario morriszjm sobre el modelo base Qwen/Qwen3.5-9B. Su particularidad es que no está pensado para generar texto libre, sino para tomar decisiones tipadas: elegir una opción entre varias, responder sí/no o asignar un nivel dentro de una escala ordenada. La salida del modelo es una distribución de probabilidad sobre las opciones, obtenida en una única pasada forward, sin generar cadena de razonamiento en el momento de la inferencia.

El entrenamiento se basa en una técnica que el autor denomina AnyJev (etiquetada también como anyjev y self-distillation): el propio modelo base generó sus propios problemas de decisión, los respondió con el razonamiento activado y después aprendió a dar esas mismas respuestas en una sola pasada. Según la model card, no se utilizaron etiquetas humanas, conjuntos de datos externos ni otros modelos. La licencia es Apache 2.0, la misma que la del modelo base.

El modelo se publica con la etiqueta "preview", acumula 0 descargas y 0 me gusta en el momento de la consulta, y el repositorio ocupa 18,8 GB. Es relevante como ejemplo de especialización por autodestilación sobre un modelo multimodal de última generación, orientada a reducir el coste y la latencia de tareas de clasificación y enrutado que hoy suelen resolverse generando razonamiento explícito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Derivada de Qwen/Qwen3.5-9B; la model card no describe la arquitectura interna |
| Parametros totales | 9.409.813.744 (9,41 mil millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors (18,8 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 18,8 GB |
| Fecha de publicacion | 5 de octubre de 2026 (ultima actualizacion: 5 de octubre de 2026) |
| Descargas / me gusta | 0 / 0 |

No se incluye la fila de parametros activos porque no hay indicios de que el modelo sea de tipo MoE: el recuento total coincide con el tamano nominal del modelo base denso.

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de Tacit-9B más allá de indicar que se construye sobre Qwen/Qwen3.5-9B. Los metadatos del repositorio incluyen las etiquetas qwen3_5 e image-text-to-text, lo que sugiere que hereda la pila del modelo base y su capacidad de procesar entradas de imagen y texto, aunque el autor no documenta ninguna tarea de visión específica para este modelo.

El procedimiento de entrenamiento es el elemento diferencial. Bajo el nombre AnyJev, el autor aplica autodestilación: el modelo base formuló sus propios problemas de decisión, los resolvió con el razonamiento activado y posteriormente aprendió a emitir esas respuestas en una única pasada forward. La model card afirma explícitamente que no se emplearon etiquetas humanas, conjuntos de datos externos ni otros modelos en el proceso. El resultado es un modelo que devuelve una probabilidad sobre un conjunto de opciones (elección múltiple, sí/no o nivel ordenado) en lugar de texto generado. No hay información publicada sobre el número de tokens de entrenamiento, la composición del corpus, ni sobre si se aplicaron fases de RLHF o DPO.

## Capacidades

- Decisión tipada en una sola pasada forward: elección entre opciones, respuesta binaria sí/no y selección de un nivel dentro de una escala ordenada.
- Salida probabilística: el modelo devuelve una distribución de probabilidad sobre las opciones, no solo la etiqueta ganadora, lo que permite umbrales de confianza y abstención.
- Ausencia de cadena de razonamiento en inferencia: el razonamiento se usó durante la generación de datos de entrenamiento, no en el momento de la predicción.
- Entrada multimodal: la etiqueta de pipeline image-text-to-text apunta a soporte de entradas de imagen y texto, si bien la model card no documenta tareas de visión concretas.
- Conversación: el repositorio incluye la etiqueta conversational, aunque el caso de uso descrito es de decisión, no de diálogo abierto.
- Tool calling / function calling: no documentado.
- Uso como componente de agentes multi-paso: no documentado explícitamente; el modelo puede actuar como módulo de decisión dentro de un pipeline mayor, pero no hay datos publicados al respecto.
- Capacidades multilingües: no disponibles.
- Modo thinking: no aplicable en inferencia; el "reasoning on" corresponde únicamente a la fase de generación de datos.

## Casos de uso

- Enrutado de consultas entre modelos o herramientas: el modelo puede decidir, en una sola pasada, qué modelo especializado o qué API debe atender una petición (por ejemplo, elegir entre un modelo de código, uno de matemáticas y un buscador). Es adecuado porque evita el coste de generar razonamiento solo para seleccionar una rama.
- Moderación de contenido por niveles: asignar cada pieza de contenido a un nivel ordenado (permitido, revisar, bloqueado). La salida probabilística permite fijar umbrales distintos según el coste de los falsos positivos y negativos.
- Filtrado binario a gran escala: clasificación de correo no deseado, detección de phishing o verificación de requisitos en formularios. El conjunto de evaluación bev-decision, con 46.320 ejemplos en el split de test, indica que el modelo está pensado para volúmenes altos.
- Reordenación de documentos en pipelines RAG: puntuar la relevancia de cada fragmento recuperado con una escala ordenada y reordenar antes de pasarlos al modelo generador, reduciendo el contexto enviado y el coste por consulta.
- Control de agentes multi-paso: actuar como puerta de decisión entre iteraciones (continuar, pedir más información o abortar) sin generar texto intermedio, lo que abarata los bucles de agente con muchas decisiones encadenadas.
- Preetiquetado para anotación humana: usar las probabilidades del modelo para preetiquetar grandes corpus y priorizar la revisión por incertidumbre, reduciendo el esfuerzo de anotación en proyectos de clasificación.
- Triaje de tickets de soporte: asignar un nivel de urgencia o de categoría a cada incidencia entrante antes de encaminarla a un equipo humano, con un coste por inferencia inferior al de un modelo generativo.
- Evaluación automática de respuestas (LLM-as-a-judge restringido): emitir un juicio binario o en escala ordenada sobre la calidad de una respuesta, aprovechando que la decisión se resuelve sin tokens de razonamiento.

## Benchmarks y rendimiento

Los únicos datos publicados en la informacion disponible son los de la model card, medidos como exactitud en una sola pasada forward, con el mismo prompt y el mismo procedimiento de lectura para ambos modelos:

| Benchmark | Qwen3.5-9B | Tacit-9B | Diferencia |
|---|---|---|---|
| JevBench (conjunto publico, 231) | 0,805 | 0,823 | +1,7 puntos |
| bev-decision (split de test, 46.320) | 0,680 | 0,725 | +4,5 puntos |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar en la informacion disponible. Tampoco se aportan intervalos de confianza; el conjunto publico de JevBench, con 231 ejemplos, es reducido y una diferencia de 1,7 puntos queda dentro del margen razonable de variación muestral.

## Requisitos de hardware

Las cifras siguientes son estimaciones a partir del recuento real de parámetros (9,41 mil millones) y del tamano del repositorio (18,8 GB); el autor no publica requisitos oficiales.

- VRAM en bf16/fp16: en torno a 19 GB solo para pesos, con 21-23 GB recomendados contando activaciones y caché KV.
- VRAM en int8: aproximadamente 9,5-10 GB de pesos, con 11-12 GB recomendados.
- VRAM en int4 (NF4, GPTQ o AWQ): en torno a 5-6 GB de pesos, con 7-8 GB recomendados para contextos moderados.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB en bf16 sin problemas.
- GPU de gama alta para consumidor: RTX 4090 o RTX 3090 con 24 GB pueden ejecutar bf16, pero ajustando la longitud de contexto; alternativamente, int8 resulta más cómodo.
- GPU de gama media: RTX 4080 o RTX 4070 Ti (16 GB) no admiten bf16 con holgura; requieren cuantización int8 o int4.
- GPU de entrada: RTX 3060 de 12 GB o similar solo con cuantización int4.
- Despliegue: transformers de forma nativa (pesos safetensors); vLLM y TGI son opciones previsibles, aunque la compatibilidad con la arquitectura Qwen3.5 debería verificarse porque no hay confirmación del autor. llama.cpp y Ollama exigirían convertir los pesos a GGUF, formato que no se distribuye en el repositorio.
- Latencia y throughput: no se publican mediciones. Al resolver la decisión en una única pasada forward, sin tokens de razonamiento, la latencia debería ser sustancialmente inferior a la de un modelo generativo equivalente, pero se trata de una expectativa derivada del diseno, no de un dato medido.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos especializados en decisión tipada de tamano comparable, por lo que la comparación se limita al modelo base y a una categoria de referencia generica:

| Modelo | Parametros | Contexto | Rendimiento en decision tipada | Licencia |
|---|---|---|---|---|
| Tacit-9B | 9,41 mil millones | No disponible | JevBench 0,823; bev-decision 0,725 | Apache 2.0 |
| Qwen/Qwen3.5-9B | 9 mil millones (segun denominacion) | No disponible | JevBench 0,805; bev-decision 0,680 | Apache 2.0 |
| Otros modelos de decision tipada de ~9B | No disponible | No disponible | No disponible | No disponible |

Frente a modelos generativos de ~8-9B (por ejemplo, la familia Llama 3.1 8B o Mistral 7B), la diferencia relevante no esta en la exactitud en tareas de decision, que no ha sido medida de forma comparable, sino en el modo de salida: Tacit-9B devuelve una probabilidad sobre opciones en una sola pasada, mientras que un modelo generativo necesita producir texto y, si se busca calidad, razonamiento explicito.

## Limitaciones y advertencias

- Estado de vista previa: el modelo acumula 0 descargas y 0 me gusta, y el propio autor lo etiqueta como "preview". No hay validación independiente ni reproducciones externas de los resultados.
- Cobertura de evaluacion muy estrecha: solo se publican dos benchmarks, ambos de decisión. No hay datos de MMLU, HumanEval, GSM8K, evaluaciones de seguridad ni pruebas multilingües.
- Tamano muestral reducido en JevBench: 231 ejemplos en el conjunto publico, insuficiente para sostener con confianza la mejora de 1,7 puntos.
- Riesgos propios de la autodestilacion: el modelo aprende de problemas y respuestas generados por el propio modelo base, sin etiquetas humanas ni datos externos. Esto puede heredar y amplificar los sesgos y errores sistematicos del base, sin que exista una referencia humana que los corrija.
- Ausencia de trazabilidad: al resolver la decision en una sola pasada, no hay cadena de razonamiento auditable. En dominios regulados, como decisiones crediticias, sanitarias o de empleo, esto dificulta la explicabilidad y el cumplimiento normativo.
- Calibracion de probabilidades no verificada: la salida es una distribucion de probabilidad, pero no se publican curvas de calibracion. Los umbrales deben validarse por dominio antes de usarse en produccion.
- Riesgo de alta confianza en respuestas incorrectas: aunque el modelo no genere texto libre, puede asignar probabilidad elevada a la opcion equivocada, especialmente en dominios alejados de los datos de entrenamiento.
- Sensibilidad al formato: la propia comparativa del autor se hizo con el mismo prompt y el mismo procedimiento de lectura, lo que sugiere que cambios en el formato pueden alterar los resultados.
- Idiomas, contexto y cuantizaciones sin documentar: no hay informacion sobre que idiomas cubre, cual es su ventana de contexto real ni que cuantizaciones mantienen el rendimiento.
- Uso comercial: la licencia Apache 2.0 permite el uso comercial sin restricciones adicionales y el modelo base declara la misma licencia, pero conviene revisar los terminos vigentes del repositorio del modelo base antes de desplegarlo.
- Dominios de alto riesgo: no deberia emplearse en decisiones medicas, legales o financieras sin una validacion especifica y supervision humana.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/morriszjm/Tacit-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo, al procedimiento AnyJev ni a los benchmarks JevBench y bev-decision. Los resultados devueltos correspondian a contenidos sin relacion (poesia francesa y ofertas de empleo).
