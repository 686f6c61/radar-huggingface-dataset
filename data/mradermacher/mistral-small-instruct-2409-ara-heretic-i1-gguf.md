# mradermacher/Mistral-Small-Instruct-2409-ARA-heretic-i1-GGUF

## Resumen

Mistral-Small-Instruct-2409-ARA-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Mistral-Small-Instruct-2409-ARA-heretic, publicada por el usuario mradermacher. Se trata de una variante "abliterated" o "decensored" del Mistral Small Instruct 2409 de Mistral AI: se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones para eliminar los comportamientos de negativa del modelo original, de modo que responda a peticiones que el modelo base rechazaria. El resultado se distribuye como pesos GGUF optimizados con imatrix para su uso en llama.cpp y entornos compatibles.

El modelo conserva la arquitectura y el tamano del Mistral Small 24B original, con 22.247.282.688 parametros (aproximadamente 22,2 mil millones) y una ventana de contexto que, segun la documentacion de Mistral Small 2409, alcanza los 128.000 tokens. Los pesos estan disponibles en varios niveles de cuantizacion (desde Q2 hasta Q8, ademas de variantes K-quants e I-quants), lo que permite desplegarlo tanto en GPU de consumo como en servidores.

La relevancia de esta ficha radica en que combina tres elementos: un modelo base de calidad contrastada (Mistral Small Instruct 2409), una modificacion que altera su comportamiento de seguridad (abliterated) y un formato de despliegue local eficiente (GGUF con imatrix). Es importante senalar que la licencia del modelo subyacente es la Mistral AI Research License, que restringe el uso a fines de investigacion no comerciales, por lo que esta variante hereda esas limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral Small 2409), segun el modelo base |
| Parametros totales | 22.247.282.688 (aprox. 22,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral Small 2409 declara 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | GGUF (variantes i1 con imatrix; niveles no detallados en la informacion disponible) |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | mrl (Mistral AI Research License; uso solo para investigacion no comercial) |
| Formato de pesos | GGUF (repo de 39,6 GB; libreria transformers declarada) |

## Arquitectura y entrenamiento

La arquitectura corresponde al Mistral Small Instruct 2409 de Mistral AI, un transformer decoder-only denso de aproximadamente 22,2 mil millones de parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original. La modificacion "heretic" consiste en una ablacion de las direcciones de activacion asociadas al rechazo de peticiones, aplicada por el autor del modelo base richardyoung; el resultado es un modelo "abliterated" que elimina el comportamiento de negativa, pero no se documentan en esta ficha los detalles tecnicos exactos del procedimiento ni el volumen de datos usado en el ajuste posterior.

La cuantizacion GGUF ha sido realizada por mradermacher con el metodo i1, que emplea una matriz de importancia (imatrix) para calibrar la cuantizacion y preservar mejor la calidad en niveles bajos de bits. El repositorio incluye etiquetas que indican "reproducible", "uncensored", "decensored" y "abliterated", lo que confirma la naturaleza del ajuste. No se especifica si se ha realizado decodificacion especulativa ni otras optimizaciones de inferencia mas alla del propio formato GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Instruct base.
- Razonamiento y respuesta a instrucciones en los diez idiomas declarados (en, fr, de, es, it, pt, zh, ja, ru, ko).
- Comportamiento "abliterated": ausencia de rechazos ante peticiones que el modelo original declinaria, lo que incluye contenido sensible o restringido.
- Soporte de tool calling / function calling segun las capacidades del modelo base Mistral Small Instruct 2409 (no verificado de forma independiente en esta ficha).
- Capacidad de seguir instrucciones complejas y mantener contexto largo, condicionada por la ventana de contexto del modelo base.
- No se documentan capacidades de vision, audio ni modo "thinking" en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion de direcciones de rechazo comparando respuestas con el Mistral Small original, en un entorno controlado de laboratorio.
- Generacion de texto creativo sin restricciones tematicas: util para escritura de ficcion que aborde temas sensibles, donde el modelo base rechazaria la peticion; adecuado por su naturaleza decensored.
- Evaluacion de robustez de filtros: sirve como modelo "adversario" para probar clasificadores de contenido y sistemas de moderacion en pipelines de investigacion.
- Despliegue local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU de consumo, facilitando experimentos sin infraestructura en la nube.
- Analisis de sesgos y comportamiento multilingue: sus diez idiomas permiten estudiar como la ablacion afecta a distintas lenguas en tareas de investigacion comparada.
- Prototipado de asistentes conversacionales en entornos de laboratorio: la ventana de contexto del modelo base (si se confirma en 128k) permite gestionar dialogos largos y documentos extensos en pruebas de concepto no comerciales.
- Generacion de datos sinteticos para investigacion: puede producir respuestas que el modelo original filtraria, util para aumentar datasets de entrenamiento o evaluacion en estudios academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; para un modelo de 22,2 B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 12-14 GB de VRAM, las de 5-6 bits entre 16 y 20 GB, y las de 8 bits en torno a 24 GB (estimaciones orientativas, no confirmadas en la informacion proporcionada).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, una RTX 3090/4090 (24 GB) podria alojar cuantizaciones de 4-6 bits, mientras que A100/H100 serian necesarias para niveles altos o contexto muy largo.
- Cabe en GPU de consumo: probable en cuantizaciones bajas (Q4/Q5) en GPUs con 16-24 GB, aunque no se confirma en la documentacion.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-Instruct-2409-ARA-heretic-i1-GGUF (este) | 22,2 B | no disponible | MRL (solo investigacion) | GGUF | Version abliterated cuantizada |
| Mistral-Small-Instruct-2409-abliterated-i1-GGUF | no disponible | no disponible | MRL (solo investigacion) | GGUF | Otra variante abliterated del mismo base, cuantizada por mradermacher |
| mradermacher/Mistral-Small-Instruct-2409-GGUF | no disponible | no disponible | MRL (solo investigacion) | GGUF | Version no modificada del Mistral Small Instruct 2409 en GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia Mistral AI Research License restringe el uso a fines de investigacion no comerciales; cualquier uso comercial requiere licencia de Mistral AI.
- El proceso de ablacion elimina los rechazos de seguridad, lo que puede producir contenido danino, ofensivo o ilegal; no es apto para produccion orientada al publico sin moderacion adicional.
- Riesgo elevado de alucinacion, comun en modelos de este tamano y acentuado por la perdida de calidad de la cuantizacion en niveles bajos.
- La cuantizacion GGUF puede degradar el rendimiento respecto al modelo en precision completa, especialmente en tareas de razonamiento y codigo.
- No se confirma en la informacion proporcionada la longitud de contexto efectiva tras la cuantizacion; el contexto largo puede degradarse.
- El modelo hereda los sesgos del dataset de entrenamiento original y de la modificacion abliterated, sin que se documenten evaluaciones de sesgo.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se especifican los niveles de cuantizacion exactos incluidos ni los metodos de calibracion mas alla de imatrix.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/Mistral-Small-Instruct-2409-ARA-heretic-i1-GGUF
- Modelo base: https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-ARA-heretic
- Variante abliterated similar: https://huggingface.co/mradermacher/Mistral-Small-Instruct-2409-abliterated-i1-GGUF
- Version no modificada en GGUF: https://huggingface.co/mradermacher/Mistral-Small-Instruct-2409-GGUF
