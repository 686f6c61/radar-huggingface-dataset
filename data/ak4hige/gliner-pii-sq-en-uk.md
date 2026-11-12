# ak4hige/gliner-pii-sq-en-uk

## Resumen

gliner-pii-sq-en-uk es un modelo de extraccion de spans basado en GLiNER, especializado en la deteccion de datos personales identificables (PII) en transcripciones de llamadas telefonicas en albanes, ingles y ucraniano. Lo desarrolla el usuario ak4hige como fine-tune de `urchade/gliner_multi_pii-v1`, un modelo que emplea un encoder mDeBERTa-v3-base. El modelo resuelve un problema concreto: el modelo base no detecta numeros dictados ("zero six nine, two two three..."), fechas y direcciones en albanes, ni nombres propios albaneses. Este fine-tune corrige esas carencias.

La relevancia practica del modelo esta en el ambito del cumplimiento normativo y la anonymisation de datos: permite enmascarar telefonos, correos, fechas de nacimiento, direcciones, numeros de contrato, nombres de personas, ubicaciones y organizaciones en transcripciones generadas por sistemas de reconocimiento de voz. Frente a los modelos NER clasicos con etiquetas fijas, GLiNER acepta las etiquetas como texto en el prompt, lo que facilita adaptar el conjunto de categorias a cada caso de uso sin reentrenar.

El modelo se distribuye con licencia Apache 2.0, pesa 1,2 GB en el repositorio y esta pensado para inferencia con la libreria `gliner` (probado con la version 0.2.30) y `transformers` 4.x. No se han publicado datos sobre parametros totales, longitud de contexto ni benchmarks estandar en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (span model) sobre encoder mDeBERTa-v3-base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (spans de maximo 12 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | albanes (sq), ingles (en), ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 1,2 GB, libreria `gliner`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GLiNER: un encoder transformer (mDeBERTa-v3-base, heredado de `urchade/gliner_multi_pii-v1`) que recibe el texto y un conjunto de etiquetas en forma de texto, y produce predicciones de spans con su categoria correspondiente. Esta formulacion permite definir las etiquetas en tiempo de inferencia, sin necesidad de una cabeza de clasificacion fija.

El fine-tune se realizo sobre 60.000 frases generadas para entrenamiento y 3.000 para desarrollo, con una composicion del 60% albanes, 20% ingles y 20% ucraniano. Cada frase es una frase portadora extraida de texto publico con uno o mas spans insertados, o una frase sin span. Los spans cubren telefonos, identificadores, fechas, correos y direcciones en las formas en que los escribe un reconocedor de voz, tanto en digitos como en palabras; los nombres, lugares y organizaciones provienen de las frases portadoras y se etiquetaron con un modelo NER. Se incluyeron negativos (instituciones, titulos, parentescos, importes, direcciones IP y direcciones web habladas) para que el modelo aprenda que no debe marcar. Cada frase de entrenamiento lleva un prompt fijo de 8 a 11 etiquetas (la propia mas otras aleatorias) para alinear el prompt de entrenamiento con el de inferencia. El entrenamiento fue de una epoca, batch 8, learning rate 5e-6 para el encoder y 1e-5 para el resto, schedule lineal con 10% de warm-up y focal loss (alpha 0.75, gamma 2), conservando el checkpoint con menor perdida en dev.

## Capacidades

- Extraccion de entidades PII con etiquetas definidas como texto: telefono, correo electronico, fecha de nacimiento, fecha, direccion, numero de contrato, numero de cliente, numero de serie, nombre de persona, ubicacion y organizacion.
- Deteccion de numeros dictados en grupos ("zero six nine, two two three, four five six"), una carencia del modelo base.
- Deteccion de fechas y direcciones en albanes, y de nombres propios albaneses.
- Funcionamiento multilingue en albanes, ingles y ucraniano dentro del mismo modelo.
- Capacidad de trabajar con subconjuntos de etiquetas en el prompt, aunque rinde mejor con las once etiquetas de entrenamiento.
- No dispone de tool calling, capacidades de agente, vision ni audio: es un modelo de clasificacion de tokens (token-classification) orientado exclusivamente a la extraccion de spans.

## Casos de uso

- Anonymisation de transcripciones de call centers: el modelo permite enmascarar telefonos, nombres, direcciones y numeros de contrato antes de almacenar o analizar las transcripciones, reduciendo la exposicion de datos personales en los sistemas de registro.
- Cumplimiento de proteccion de datos (GDPR y normativas equivalentes): al detectar y sustituir PII en textos de llamadas en albanes, ingles y ucraniano, facilita la seudonimizacion de registros antes de su tratamiento analitico o de su cesion a terceros.
- Preprocesado para pipelines de reconocimiento de voz: el modelo opera sobre la salida textual de un ASR, incluyendo numeros escritos en digitos o en palabras, lo que lo hace adecuado para limpiar transcripciones automaticas antes de su indexacion.
- Enmascarado en herramientas de soporte al cliente: integrado en un sistema de ticketing, puede ocultar datos sensibles de las conversaciones antes de que los agentes o los sistemas de busqueda accedan a ellas.
- Analisis de calidad y auditoria de llamadas: permite separar el contenido sensible del contenido operativo para que los equipos de calidad revisen las conversaciones sin acceder a datos personales.
- Construccion de datasets anonimizados para investigacion: al permitir definir las etiquetas en el prompt, se puede adaptar el conjunto de categorias a los requisitos de un corpus concreto y generar versiones seudonimizadas para entrenamiento o evaluacion.
- Filtrado de PII en exportaciones de datos multilingues: util para organizaciones que operan en Albania, Reino Unido y Ucrania y necesitan un unico modelo que cubra las tres lenguas en lugar de tres pipelines separados.

## Benchmarks y rendimiento

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Dev generado con el mismo procedimiento (exact span match, umbral 0,5) | micro F1 | 0,93 |
| Dev generado con el mismo procedimiento (exact span match, umbral 0,5) | precision | 0,94 |
| 39 frases de llamada albanesas escritas a mano, leidas por un ASR | aciertos con la clase esperada | 29 de 31 |
| 39 frases de llamada albanesas escritas a mano, leidas por un ASR | fallos | 2 (fechas relativas, "last Monday") |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 1,2 GB, por lo que en precision completa el modelo deberia caber en GPUs consumer con 8 GB o mas, aunque no se confirma en la informacion.
- GPU recomendadas: no disponible. Por el tamano del encoder (mDeBERTa-v3-base) es plausible su ejecucion en GPUs consumer, pero no se aportan datos oficiales.
- Cabe en GPU consumer: no confirmado en la informacion disponible.
- Opciones de despliegue: libreria `gliner` (probado con 0.2.30) y `transformers` 4.x. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ak4hige/gliner-pii-sq-en-uk | no disponible | no disponible | sq, en, uk | Apache 2.0 | Fine-tune especializado en PII para transcripciones de llamadas |
| urchade/gliner_multi_pii-v1 | no disponible | no disponible | multilingue | no disponible en la informacion | Modelo base; no detecta numeros dictados, fechas ni direcciones en albanes |
| Otros modelos NER de PII | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar parametros, contexto ni rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Un span tiene como maximo 12 tokens; un telefono dictado digito a digito con pausas escritas como comas puede superar ese limite.
- No detecta fechas relativas ("last Monday", "next week").
- Los numeros escritos en palabras en ingles y ucraniano se detectan dentro de las formas de frase del entrenamiento y con menor fiabilidad fuera de ellas; en esos idiomas un ASR suele escribir los numeros largos en digitos, que el modelo si detecta.
- El modelo sobremarca organizaciones en texto formal: a veces etiqueta instituciones y nombres genericos ("the court", "the ministry"). Para anonymisation, el autor lo considera el lado mas seguro del error.
- Esta disenado para transcripciones de llamadas en las tres lenguas indicadas; en otros idiomas solo hereda lo que conoce el modelo base.
- No se han publicado datos sobre sesgos conocidos ni sobre el riesgo de alucinacion mas alla de los errores de extraccion descritos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales no detalladas en la informacion.
- No se han publicado datos sobre cuantizaciones, contexto maximo ni rendimiento en produccion, lo que limita la planificacion de despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ak4hige/gliner-pii-sq-en-uk
- Modelo base: https://huggingface.co/urchade/gliner_multi_pii-v1
- Libreria GLiNER: no disponible en la informacion proporcionada
- Paper de GLiNER: no disponible en la informacion proporcionada
- Repositorio o demo: no disponible en la informacion proporcionada
