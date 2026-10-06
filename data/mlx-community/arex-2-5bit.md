# mlx-community/AREX-2-5bit

## Resumen

AREX-2-5bit es una cuantizacion de 5 bits en formato MLX del modelo BAAI/AREX-2, preparada por la comunidad mlx-community para su ejecucion en Apple Silicon (Mac). AREX-2 es un modelo abierto orientado a codigo, razonamiento y tareas de agente, con entrada multimodal (texto e imagenes) y salida de solo texto. Esta version permite ejecutarlo localmente en equipos Mac sin depender de GPUs dedicadas, con un peso de descarga de 19 GB.

El modelo base, BAAI/AREX-2, esta construido sobre Qwen3.8-27B y cuenta con 27.356.728.560 parametros totales (aproximadamente 27,36 mil millones). Incorpora un modo de pensamiento previo a la respuesta (thinking) y soporte de llamada a herramientas (tool calling), lo que lo situa en la categoria de modelos para agentes y flujos de razonamiento en varios pasos. Su licencia Apache 2.0 facilita el uso comercial.

La relevancia de esta ficha concreta radica en que la cuantizacion de 5 bits es la recomendada por el propio autor para Macs con 32 GB de memoria unificada, al ofrecer un equilibrio entre fidelidad respecto al original (95,9 % de coincidencia de token-piece) y velocidad (12 tokens/s en un Mac mini M4 Pro). Ademas, admite el modelo borrador incoai/Qwen3.8-27B-DFlash2 sin modificaciones, lo que puede mas que duplicar la velocidad de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base construido sobre Qwen3.8-27B; no se detalla en la informacion disponible) |
| Parametros totales | 27.356.728.560 (aproximadamente 27,36 mil millones) |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | 32.000 tokens (valor probado en las pruebas del autor; no se declara un maximo oficial distinto) |
| Tipos de cuantizacion | 5 bits (esta version); la familia incluye tambien 4, 6 y 8 bits en MLX |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (libreria mlx; conversion realizada con mlx-vlm 0.7.4) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que BAAI/AREX-2 esta construido sobre Qwen3.8-27B y que la etiqueta del repositorio incluye la referencia `qwen3_5`, lo que apunta a una familia de transformers derivada de Qwen. No obstante, la model card no especifica si se trata de un transformer denso, de una arquitectura MoE, hibrida o con atencion lineal, por lo que ese dato queda como no disponible.

Tampoco se publican en la informacion proporcionada datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo que si se documenta es el comportamiento funcional: el modelo "piensa antes de responder" (modo de razonamiento explicito que puede consumir entre 1.000 y 4.000 tokens en problemas dificiles) y soporta llamada a herramientas. Como innovacion practica destacable, el modelo admite decodificacion especulativa mediante el borrador incoai/Qwen3.8-27B-DFlash2 sin necesidad de adaptacion, lo que en pruebas con mlx-dspark 0.20.1 elevo la version de 8 bits de 8 a 19 tokens por segundo. El autor indica ademas que AREX-2 fue mas eficiente que Qwen3.8-27B sin ajustar: aproximadamente un 46 % menos de tokens y cerca de la mitad de tiempo en las mismas pruebas.

## Capacidades

- Generacion de texto a partir de entradas de texto e imagen (pipeline image-text-to-text); la salida es unicamente texto.
- Razonamiento explicito con modo de pensamiento previo a la respuesta, con presupuestos tipicos de 1.000 a 4.000 tokens de pensamiento.
- Generacion y resolucion de codigo en Python, verificada en las pruebas del autor con problemas faciles y dificiles.
- Soporte de tool calling (llamada a herramientas) y de tareas de agente; el autor reporta que todas las cuantizaciones superaron una tarea de herramienta de cuatro pasos.
- Orientacion a tareas de investigacion profunda (deep-research) y razonamiento en multiples pasos, segun las etiquetas del repositorio.
- Manejo de contexto largo: todas las cuantizaciones superaron una prueba de recuperacion con 32.000 tokens.
- Comprension de imagenes: todas las cuantizaciones pasaron 11 preguntas sobre imagenes en las pruebas del autor.
- Capacidad multilingue limitada: el modelo declara unicamente ingles (en) como idioma soportado.
- Integracion con decodificacion especulativa mediante un modelo borrador externo para acelerar la generacion.

## Casos de uso

- Asistencia de programacion en local sobre Mac: el modelo genera y corrige codigo Python, y su modo de pensamiento le permite iterar sobre pruebas fallidas; es adecuado para desarrolladores que quieren un asistente de codigo sin enviar datos a la nube.
- Agentes con llamada a herramientas en el escritorio: al soportar tool calling y razonamiento en varios pasos, puede orquestar acciones encadenadas (por ejemplo, consultar una API, transformar el resultado y redactar una respuesta) ejecutandose integramente en el equipo.
- Analisis de documentos con imagenes y texto largo: la combinacion de entrada de imagen y contexto de hasta 32.000 tokens permite procesar capturas, diagramas o paginas escaneadas junto con texto extenso para extraer informacion.
- Investigacion y sintesis de informacion (deep-research): el modelo esta orientado a tareas de investigacion profunda, de modo que puede descomponer una pregunta, recopilar y contrastar datos y producir un resumen razonado con su cadena de pensamiento.
- Atencion al cliente o asistentes conversacionales en ingles: con contexto largo y soporte multi-turno puede mantener conversaciones extensas manteniendo el hilo, siempre que el idioma de trabajo sea el ingles.
- Prototipado y evaluacion de modelos en Apple Silicon: al estar en formato MLX y con varias cuantizaciones disponibles, sirve para comparar el equilibrio entre fidelidad y velocidad antes de decidir un despliegue mayor.
- Automatizacion de tareas de razonamiento sobre Macs de sobremesa: con 20-28 GB de memoria en uso y velocidades de 12 tokens/s (hasta mas con el borrador), encaja en flujos por lotes o pipelines locales que no requieren maxima concurrencia.

## Benchmarks y rendimiento

Resultados por tamano de cuantizacion publicados por el autor (la coincidencia con el original se mide sobre un texto fijo de 6.141 tokens; las pruebas faciles son 18 problemas cortos de Python con tests ocultos; los problemas dificiles son 12 problemas mas exigentes con hasta 3 intentos; velocidad medida en un Mac mini M4 Pro):

| Tamano | Coincidencia con el original | Tareas faciles superadas | Problemas dificiles, primer intento | Problemas dificiles, en 3 intentos | Velocidad (tokens/s) |
|---|---|---|---|---|---|
| 4 bits (no disponible aun) | 91,4 % | 17 de 18 | 3 de 12 | 9 de 12 | 14 |
| 5 bits (esta version) | 95,9 % | 18 de 18 | 8 de 12 | 11 de 12 | 12 |
| 6 bits | 97,6 % | 18 de 18 | 9 de 12 | 10 de 12 | 10 |
| 8 bits | 99,1 % | 18 de 18 | 7 de 12 | 12 de 12 | 8 |

Comparativa publicada entre AREX-2 y Qwen3.8-27B sin ajustar (ambos en MLX de 8 bits, mismas pistas, mismos ajustes y limite de 4.000 tokens, dos ejecuciones por prueba):

| Metrica | AREX-2 | Qwen3.8-27B |
|---|---|---|
| Tokens usados, todas las pruebas | 113.795 | 212.514 |
| Tiempo, todas las pruebas | 249 min | 451 min |
| Tareas faciles superadas | 35 de 36 | 30 de 36 |
| Problemas dificiles, primer intento | 15 de 24 | 11 de 24 |
| Problemas dificiles, en 3 intentos | 23 de 24 | 20 de 24 |

Velocidad con modelo borrador (mlx-dspark 0.20.1, seis pistas por tamano). La tabla publicada esta parcialmente truncada en la informacion disponible; se reproduce lo documentado:

| Tamano | Tokens/s sin borrador | Tokens/s con borrador |
|---|---|---|
| 4 bits | 14 | 27 |
| 5 bits | no disponible | no disponible |
| 6 bits | no disponible | no disponible |
| 8 bits | 8 | 19 |

El autor advierte que se trata de una prueba pequena en un solo Mac, no de un benchmark, y que el margen de uno o dos aciertos es ruido estadistico.

## Requisitos de hardware

- Memoria en uso estimada segun el autor (probado solo en un Mac de 64 GB; las cifras para equipos menores son estimaciones): 4 bits 16-24 GB, 5 bits 20-28 GB, 6 bits 23-31 GB, 8 bits 30-38 GB.
- Mac recomendado para esta version (5 bits): 32 GB de memoria unificada; el autor la senala como la opcion que deberia elegir la mayoria de usuarios.
- Tamano de descarga: 19 GB para la version de 5 bits (19,4 GB de repositorio).
- El consumo de memoria crece con la longitud de la conversacion, desde un prompt corto hasta uno muy largo de 32.000 tokens.
- Compatibilidad con GPU dedicadas (A100, H100, RTX 4090, etc.): no disponible; el formato MLX esta pensado para Apple Silicon y no se documenta soporte en CUDA en esta informacion.
- Opciones de despliegue documentadas: mlx-vlm (linea de comandos), LM Studio (interfaz grafica con busqueda del identificador `mlx-community/AREX-2-5bit`) y mlx-dspark para decodificacion especulativa con el borrador incoai/Qwen3.8-27B-DFlash2.
- Latencia y throughput: 12 tokens/s en un Mac mini M4 Pro con la cuantizacion de 5 bits; con el borrador, la version de 8 bits paso de 8 a 19 tokens/s (valor de 5 bits no disponible). El modo de pensamiento puede consumir de 1.000 a 4.000 tokens antes de la respuesta final, lo que conviene tener en cuenta para la latencia total.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/AREX-2-5bit | 27,36 mil millones | 32.000 tokens (probado) | Multimodal texto+imagen, razonamiento y agentes, formato MLX | Apache 2.0 | HuggingFace (mlx-community) |
| mlx-community/AREX-2-6bit | 27,36 mil millones (heredado) | 32.000 tokens (probado) | Igual, mayor fidelidad (97,6 %) y menor velocidad (10 tokens/s) | Apache 2.0 | HuggingFace (mlx-community) |
| mlx-community/AREX-2-8bit | 27,36 mil millones (heredado) | 32.000 tokens (probado) | Igual, maxima fidelidad (99,1 %) y menor velocidad (8 tokens/s) | Apache 2.0 | HuggingFace (mlx-community) |
| Qwen3.8-27B | 27 mil millones (aproximado, segun referencia del autor) | no disponible | Modelo base sin los ajustes de AREX-2 | no disponible en la informacion proporcionada | Referenciado como base de AREX-2 |

No se dispone en la informacion proporcionada de datos de otros modelos comparables de la misma categoria fuera de la familia AREX-2 y su base Qwen3.8-27B.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles (en); no se documenta rendimiento en castellano ni en otros idiomas.
- Sesgos conocidos: no disponibles; la model card no incluye una seccion de sesgos ni de evaluacion de seguridad.
- Riesgo de alucinacion: no se documenta de forma explicita; como modelo generativo, mantiene el riesgo habitual, agravado por su orientacion a tareas de investigacion donde puede producir afirmaciones no verificadas.
- Las cifras de rendimiento proceden de una prueba pequena en un unico Mac (Mac mini M4 Pro) y el propio autor advierte que no constituyen un benchmark; las diferencias de uno o dos aciertos son ruido.
- Las recomendaciones de memoria para Macs de menos de 64 GB son estimaciones, no medidas reales.
- La cuantizacion de 4 bits aun no esta disponible y, segun el autor, es claramente mas debil en problemas dificiles.
- El rendimiento puede degradarse con prompts muy largos por el aumento del consumo de memoria (hasta 32.000 tokens).
- El modelo esta empaquetado en formato MLX: esta pensado para Apple Silicon y no se documenta su uso en entornos CUDA en esta informacion.
- Licencia: Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base BAAI/AREX-2 por si anade restricciones adicionales (no detalladas aqui).
- El modo de pensamiento puede consumir entre 1.000 y 4.000 tokens; con un limite de respuesta bajo, las contestaciones se truncaran y aumentaran los fallos.
- En cuanto a ajustes de muestreo, el autor advierte de no usar temperatura 0 con el modo de pensamiento activado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/AREX-2-5bit
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Cuantizacion de 6 bits: https://huggingface.co/mlx-community/AREX-2-6bit
- Cuantizacion de 8 bits: https://huggingface.co/mlx-community/AREX-2-8bit
- Modelo borrador (DFlash2): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Carpeta de pruebas y resultados del autor: https://huggingface.co/mlx-community/AREX-2-5bit/tree/main/tests
- Paper referenciado (arXiv): https://arxiv.org/abs/2609.38288
- LM Studio: https://lmstudio.ai
- mlx-dspark (PyPI): https://pypi.org/project/mlx-dspark/
