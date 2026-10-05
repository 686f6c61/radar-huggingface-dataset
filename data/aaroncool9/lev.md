# aaroncool9/lev

## Resumen

lev es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B, publicado en HuggingFace por el usuario aaroncool9 y desarrollado por Interfaze-ai. Su funcion no es generar texto, sino responder preguntas tipadas (si/no, eleccion multiple y puntuacion ordinal) sobre un contexto dado en una unica pasada hacia delante, devolviendo probabilidades calibradas sobre exactamente las opciones que el usuario suministra. El modelo no emite tokens de salida: lee las respuestas directamente desde los logits ya calculados, de modo que el espacio de respuestas queda restringido estructuralmente al conjunto de opciones enviado.

La relevancia de lev radica en su enfoque para las decisiones de juicio masivo dentro de un producto: enrutamiento, moderacion, deteccion de intencion, triaje, calificacion y verificacion de salidas de otros LLM. Al no generar tokens, elimina la necesidad de parsear JSON, reintentar o validar etiquetas fuera de rango, y todas las preguntas de una peticion comparten una sola pasada, por lo que formular tres preguntas cuesta aproximadamente lo mismo que formular una.

El autor declara un resultado del 68,9 % en los 13 subconjuntos de S1Bench y, en los seis subconjuntos que la tabla publica de S1Bench ha completado, un rendimiento a la par de reflex-4b y por detras unicamente de Jev y de tres modelos abiertos de entre 26B y 35B. El adaptador ocupa unos 200 MB y el modelo base unos 8 GB, con licencia Apache-2.0. El modelo esta etiquetado como solo ingles y cuenta con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-4B |
| Parametros totales | No disponible (modelo base de 4B; tamano del adaptador no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Pipeline declarado | zero-shot-classification |
| Tamano del repositorio | 0,2 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Relacion con el modelo base | adapter |
| Inferencia alojada | No (inference: false) |
| Fecha de creacion | 2026-10-05 |
| Fecha de actualizacion | 2026-10-05 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

lev es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-4B, un transformer denso de 4.000 millones de parametros. El adaptador se carga junto al modelo base mediante la libreria peft y, segun la model card, `lev.load` lee el fichero `lev_release.json` del repositorio para localizar el modelo base y el formato de prompt con el que se entreno, aplica la calibracion incluida y carga la cabeza correspondiente. El entrenamiento se realizo, segun el autor, con una unica GPU H100.

La innovacion principal es el mecanismo de respuesta tipo "system one": en lugar de decodificar tokens, el modelo extrae las respuestas de los logits de una sola pasada hacia delante. Soporta tres tipos de pregunta: `noul` (pregunta de si/no, devuelve p(yes)), `choice` (instrucciones mas un conjunto de opciones con nombre y descripcion o `null`, devuelve la opcion elegida, las probabilidades y un valor de confianza) y `score` (instrucciones mas entre 2 y 10 niveles ordenados, devuelve la puntuacion esperada, las probabilidades y la confianza). El numero de tokens de salida generados es cero. Ademas, el adaptador habla el protocolo `/v1/systemone` de TypeSafe, de modo que el codigo escrito para el SDK de TypeSafe funciona contra el cambiando unicamente la URL base.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla el rango ni los modulos objetivo del adaptador LoRA.

## Capacidades

- Clasificacion de decisiones tipadas en una sola pasada: preguntas binarias (`noul`), de eleccion (`choice`) y de puntuacion ordinal (`score`).
- Devolucion de probabilidades calibradas sobre el conjunto exacto de opciones suministrado, lo que permite aplicar umbrales de decision (por ejemplo, actuar automaticamente por encima de 0,9).
- Garantia estructural de que la respuesta pertenece siempre al conjunto de opciones enviado, al no generar texto libre.
- Preguntas multiples dentro de una misma peticion compartiendo una unica pasada hacia delante.
- Soporte de contexto de entrada en forma de texto, ticket, correo electronico o JSON.
- Compatibilidad con el protocolo `/v1/systemone` de TypeSafe y con el SDK asociado.
- Capacidad de autoservicio mediante un servidor HTTP incluido en el extra `lev[serve]`.
- Deteccion de intencion, enrutamiento, moderacion, triaje, calificacion y verificacion de salidas de otros LLM, segun los casos de uso declarados por el autor.
- Capacidades multilingues: no disponible (el modelo esta etiquetado unicamente como ingles).
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Enrutamiento de peticiones en atencion al cliente: dado el texto de un ticket, lev puede determinar en una sola pasada la intencion (por ejemplo, reembolso, cancelacion, seguimiento) y si requiere atencion humana inmediata, con probabilidades calibradas que permiten decidir umbrales de derivacion automatica.
- Moderacion de contenido: clasificar un texto entrante contra un conjunto de categorias definidas por el usuario, aprovechando que la respuesta no puede salirse del espacio de etiquetas enviado y que no requiere parseo de JSON ni reintentos.
- Deteccion de intencion en asistentes conversacionales: etiquetar cada turno del usuario con una intencion predefinida antes de dirigir la conversacion al flujo adecuado.
- Triaje de soporte tecnico: puntuar la urgencia o la frustracion de un cliente en una escala ordinal de entre 2 y 10 niveles, obteniendo una puntuacion esperada util para priorizar la cola de trabajo.
- Verificacion de salidas de otros LLM: usar lev como juez binario o de eleccion para comprobar si una respuesta generada cumple ciertos criterios, al no generar texto propio y ser por tanto mas barato y rapido que un modelo generativo.
- Calificacion automatica de respuestas: asignar una puntuacion ordinal a respuestas de texto libre en flujos de evaluacion o anotacion, con probabilidades calibradas para medir la confianza del juicio.
- Clasificacion de correos o formularios entrantes: procesar un correo o un JSON estructurado y devolver simultaneamente varias etiquetas tipadas en una sola pasada, reduciendo el coste frente a realizar varias llamadas independientes.
- Puerta de decision con umbrales de confianza: combinar varias preguntas sobre el mismo estado y actuar solo cuando la probabilidad supere un umbral definido, derivando el resto a revision humana.

## Benchmarks y rendimiento

El autor declara un 68,9 % en los 13 subconjuntos de S1Bench. En los seis subconjuntos que la tabla publica de S1Bench ha completado, el modelo se situa a la par de reflex-4b y por detras unicamente de Jev y de tres modelos abiertos de entre 26B y 35B. No se proporcionan en la informacion disponible los resultados desglosados por subconjunto, ni metricas de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

| Benchmark | Resultado | Notas |
|---|---|---|
| S1Bench (13 subconjuntos) | 68,9 % | Resultado global declarado por el autor |
| S1Bench (6 subconjuntos completados por la tabla publica) | A la par de reflex-4b; por detras de Jev y de tres modelos abiertos de 26B-35B | Sin cifras desglosadas |
| MMLU, HumanEval, GSM8K y otros | No disponible | No publicados en la informacion disponible |

En cuanto a velocidad, el autor indica que todas las preguntas comparten una pasada hacia delante y que el modelo genera cero tokens de salida, pero no se aportan cifras concretas de latencia ni de throughput en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 0,2 GB (200 MB) y el modelo base unos 8 GB, que se descargan en la primera carga.
- Se requiere Python 3.12 o superior y, para uso en tiempo real, una GPU CUDA. La libreria peft y el servidor HTTP se instalan con el extra `lev[serve]`.
- El modelo base de 4B en precision bf16 requiere del orden de 8 GB de VRAM, por lo que cabe en GPU de consumo como la RTX 3060 de 12 GB, la RTX 4070 Ti, la RTX 4080 o la RTX 4090, siempre que la cuantizacion o la precision empleada no aumenten el consumo. Los requisitos exactos de VRAM por cuantizacion no estan disponibles.
- GPU de datacenter recomendadas por el ecosistema del modelo base: A100, H100, L40S. El autor menciona una H100 para el entrenamiento.
- Opciones de despliegue confirmadas: servidor HTTP incluido en el paquete `lev[serve]` (basado en torch, transformers y peft). Compatible con el protocolo `/v1/systemone` de TypeSafe. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros motores en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los modelos citados en la model card (reflex-4b, Jev y modelos abiertos de 26B-35B), sin datos de parametros, contexto, licencia ni disponibilidad de esos competidores.

| Modelo | Parametros | Resultado en S1Bench (segun lev) | Licencia | Disponibilidad |
|---|---|---|---|---|
| lev | 4B (adaptador LoRA) | 68,9 % en 13 subconjuntos | Apache-2.0 | HuggingFace (0 descargas) |
| reflex-4b | No disponible | A la par de lev en 6 subconjuntos | No disponible | No disponible |
| Jev | No disponible | Por delante de lev | No disponible | No disponible |
| Tres modelos abiertos de 26B-35B | 26B-35B | Por delante de lev | No disponible | No disponible |

## Limitaciones y advertencias

- La garantia de que la respuesta pertenece al conjunto de opciones es estructural, no de correccion: el modelo puede elegir la opcion equivocada dentro del conjunto enviado.
- Idioma limitado al ingles segun la etiqueta del repositorio; no se declara soporte multilingue. El rendimiento en otros idiomas no esta verificado.
- No se detallan sesgos conocidos. Al no generar texto libre, no es aplicable el riesgo clasico de alucinacion generativa, pero si el riesgo de clasificacion erronea o mal calibrada fuera de la distribucion de entrenamiento.
- El modelo tiene cero descargas y cero likes, y fue publicado y actualizado el mismo dia (2026-10-05): se trata de un artefacto reciente y sin validacion independiente por parte de la comunidad.
- Existe una discrepancia entre el identificador del repositorio de HuggingFace (`aaroncool9/lev`) y el identificador empleado en el ejemplo de codigo de la model card (`interfaze-ai/lev`); conviene verificar cual es el repositorio canonico.
- El modelo base referenciado es `Qwen/Qwen3.5-4B`; no se aportan detalles sobre su contexto maximo, sus sesgos propios ni sus limitaciones, que se heredan en el adaptador.
- La licencia Apache-2.0 permite uso comercial del adaptador, pero el uso comercial del modelo base queda sujeto a la licencia de Qwen/Qwen3.5-4B, no detallada aqui.
- `inference: false` indica que el modelo no esta desplegado en la infraestructura de inferencia de HuggingFace; hay que autohospedarlo.
- Requiere GPU CUDA para uso en tiempo real, lo que excluye entornos solo-CPU para produccion de baja latencia.
- No se publican cifras de latencia, throughput ni consumo de VRAM por cuantizacion, datos criticos para dimensionar una implantacion en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aaroncool9/lev
- Repositorio de codigo en GitHub: https://github.com/Abhinavexists/lev
- Blog del autor: https://interfaze.ai/blog/jev-now-open-source-lev
- Sitio de Interfaze-ai: https://interfaze.ai
