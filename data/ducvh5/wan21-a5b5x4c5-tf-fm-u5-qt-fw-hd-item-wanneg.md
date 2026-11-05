# ducvh5/wan21-a5b5x4c5-tf-fm-u5-qt-fw-hd-item-wanneg

## Resumen

El modelo `ducvh5/wan21-a5b5x4c5-tf-fm-u5-qt-fw-hd-item-wanneg` es un checkpoint derivado de Wan2.1-T2V-1.3B-Diffusers, el modelo de generacion de video texto-a-video de 1.300 millones de parametros publicado por Wan-AI (Alibaba). Se trata de un ajuste fino (finetune) sobre esa base, orientado a la sintesis de video a partir de descripciones textuales, y publicado por el usuario ducvh5 en HuggingFace en noviembre de 2026.

La nomenclatura del identificador y las etiquetas de la model card revelan que se ha aplicado una reestructuracion de bloques del transformer: el esquema "A5 → B5×4 → C5" indica 15 bloques unicos que se ejecutan 30 veces, es decir, una arquitectura de transformer recurrente (recurrent-transformer) en la que determinados bloques se comparten y se reutilizan en pasadas sucesivas. El entrenamiento combino perdida de teacher forcing (TF) y flow matching (FM), con un muestreo de sigma uniforme en (0,1), shift de 5 y t = 1000 sigma.

El interes de esta ficha es limitado desde el punto de vista de evaluacion: no se han publicado pesos en el snapshot (la model card indica explicitamente "0 EMA/non-EMA weights in this snapshot" y "no checkpoint saved"), no hay benchmarks, no hay licencia declarada y el modelo acumula cero descargas. Se documenta como referencia tecnica de una variante experimental de Wan2.1, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente derivado de Wan2.1 (difusion texto-a-video); esquema A5 → B5×4 → C5, 15 bloques unicos / 30 ejecutados |
| Parametros totales | 1.300 millones (heredados de Wan2.1-T2V-1.3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el snapshot no contiene pesos: "0 EMA/non-EMA weights") |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers, un modelo de difusion para generacion de video texto-a-video. La modificacion principal es la reorganizacion en bloques recurrentes: segun la model card, la estructura es "A5 → B5×4 → C5", con 15 bloques unicos y 30 bloques ejecutados en total. Esto implica que el bloque B se ejecuta cuatro veces de forma compartida, reduciendo el numero de parametros unicos respecto a un transformer de profundidad equivalente y aumentando la profundidad efectiva del calculo. Es una estrategia de comparticion de pesos similar a la empleada en transformers recurrentes de lenguaje.

El entrenamiento combina dos objetivos: teacher forcing (TF) y flow matching (FM). El schedule de ruido usa sigma ~ U(0,1) con shift=5 y t = 1000·sigma. Los datos de entrenamiento se etiquetan como "OV" con captions QT en proporcion 50/50 entre VB y texto completo, y datos OV/FW-HD en proporcion 50/50 por item, con dropout de etiquetas WN. No se especifica el volumen de tokens, el numero de pasos de entrenamiento ni si hubo etapas de RLHF o DPO. La model card indica que no se guardo ningun checkpoint ni pesos EMA o no-EMA en este snapshot.

## Capacidades

- Generacion de video a partir de texto (pipeline text-to-video), heredada de la base Wan2.1-T2V-1.3B.
- Ejecucion de un transformer recurrente con bloques compartidos, lo que reduce el numero de parametros unicos a costa de mas pasadas de calculo.
- Entrenamiento con flow matching, lo que en principio permite muestreo con schedules de ruido continuos.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.

## Casos de uso

- Investigacion sobre transformers recurrentes en difusion: el modelo sirve como referencia para estudiar el efecto de compartir bloques (B5×4) en la calidad de generacion de video frente a un transformer denso de profundidad equivalente.
- Experimentos de flow matching en video: la combinacion TF+FM con sigma ~ U(0,1) y shift=5 permite reproducir y comparar schedules de ruido en tareas texto-a-video.
- Generacion de clips cortos de demostracion: una vez disponibles los pesos, podria emplearse para prototipos de video generado a partir de prompts, aunque sin garantias de calidad al no haber benchmarks.
- Estudio de eficiencia computacional: la reduccion de parametros unicos mediante bloques recurrentes es relevante para analizar el equilibrio entre memoria y latencia en GPUs de gama media.
- Base para nuevos finetunes: al derivar de Wan2.1-T2V-1.3B-Diffusers, puede servir como punto de partida para ajustes posteriores con datasets propios.
- Docencia y reproduccion de arquitecturas: util para explicar en un curso o articulo como se estructura un transformer recurrente aplicado a difusion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia, un modelo de difusion de video de 1.300 millones de parametros en precision fp16 requiere del orden de 3-4 GB solo para pesos, mas memoria para activaciones y latentes de video; el valor exacto para esta variante no esta documentado.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el snapshot no contiene pesos, por lo que no es posible ejecutarlo.
- Opciones de despliegue: no documentadas. Al derivar de un modelo Diffusers, cabria esperar compatibilidad con la libreria Diffusers, pero no se confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tf-fm-u5-qt-fw-hd-item-wanneg | 1.300 M (15 bloques unicos) | No disponible | No disponible | No (snapshot sin pesos) |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 M | No disponible | No disponible en esta ficha | Si (modelo base publico) |
| Alternativas texto-a-video de tamano similar | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre esta variante y su modelo base ni con otras alternativas.

## Limitaciones y advertencias

- El snapshot no contiene pesos ("0 EMA/non-EMA weights in this snapshot", "last state: none saved"), por lo que el modelo no es ejecutable tal como esta publicado.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido.
- No hay benchmarks ni evaluacion cualitativa publicada; se desconoce la calidad del video generado.
- El modelo acumula cero descargas y cero likes, sin evidencia de uso o validacion por parte de la comunidad.
- Al ser un finetune experimental sobre Wan2.1, puede heredar sesgos del dataset original (no documentado) y presentar alucinaciones visuales o incoherencias temporales.
- No se documentan idiomas soportados; la cobertura multilingue de los prompts es incierta.
- La arquitectura recurrente con bloques compartidos puede aumentar la latencia por pasada adicional de calculo, aunque reduzca parametros unicos.
- No hay informacion sobre el volumen ni la procedencia de los datos de entrenamiento ("OV", "QT", "VB", "FW-HD"), lo que dificulta evaluar riesgos de contaminacion o sesgo.

## Enlaces

- HuggingFace: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-u5-qt-fw-hd-item-wanneg
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
