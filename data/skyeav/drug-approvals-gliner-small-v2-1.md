# SkyeAv/drug-approvals-gliner-small-v2.1

## Resumen

Drug Approvals GLiNER es un ajuste fino (fine-tune) del modelo GLiNER `urchade/gliner_small-v2.1` orientado a la extraccion de menciones de `disease` y `phenotype` en textos de indicaciones y contraindicaciones farmacologicas procedentes de FAERS y DailyMed. Lo desarrolla SkyeAv y se publica bajo licencia Apache-2.0 con un unico checkpoint en safetensors de 152.648.704 parametros (0,6 GB de repositorio). No es un modelo generativo: es un componente de extraccion de informacion del tipo token-classification con etiquetado guiado por texto (zero-shot NER), por lo que se le indica en tiempo de inferencia que tipos de entidad buscar.

Su relevancia es practica y muy acotada: automatiza la lectura de prospectos, fichas tecnicas y notificaciones de seguridad farmacologica, extrayendo la condicion clinica mencionada en el contexto de indicacion o de contraindicacion. Esto encaja en pipelines de farmacovigilancia, curacion de bases de datos de seguridad de medicamentos y preprocesado de literatura biomedica. El autor indica explicitamente que el modelo se usa en produccion dentro de los proyectos MedliNER y DAKP.

El modelo esta entrenado y evaluado solo en ingles, con datos revisados derivados de FAERS y DailyMed, aumentados con ejemplos sinteticos ponderados y ejemplos sugeridos por modelo. No se han publicado resultados de benchmarks en la informacion disponible, y el propio autor advierte que se trata de un componente de extraccion, no de un sistema de apoyo a la decision clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (modelo base `urchade/gliner_small-v2.1`); el detalle exacto del encoder no se especifica en la informacion disponible |
| Parametros totales | 152.648.704 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors; no se documentan cuantizaciones GGUF, int8 ni otras) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos: pipeline `token-classification`, libreria `gliner`, tamano del repositorio 0,6 GB, etiquetas soportadas `disease` y `phenotype`, modelo base `urchade/gliner_small-v2.1` (finetune). Fecha de creacion: 2026-09-10; ultima actualizacion: 2026-09-10. Descargas registradas: 0. Likes: 1.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GLiNER: un esquema de reconocimiento de entidades que no usa una cabeza de clasificacion con un conjunto fijo de clases, sino que empareja representaciones de las etiquetas proporcionadas por el usuario con las representaciones de los spans del texto. Esto convierte al modelo en zero-shot respecto a etiquetas, aunque en este checkpoint el ajuste fino se ha realizado especificamente para las etiquetas `disease` y `phenotype`. Se trata por tanto de un encoder de clasificacion de tokens, no de un modelo generativo con decodificacion autoregresiva; no dispone de modo de razonamiento ni de decodificacion especulativa.

Los datos de entrenamiento son texto revisado derivado de FAERS y DailyMed, aumentado con ejemplos sinteticos ponderados y ejemplos sugeridos por modelo. La distincion entre indicacion y contraindicacion no es una etiqueta de entidad: es metadatos de contexto. El modelo extrae el span de la condicion en cualquiera de los dos contextos, de modo que el pipeline debe ejecutarlo sobre la frase o seccion relevante y conservar ese contexto junto al span devuelto. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en este tipo de modelos).

## Capacidades

- Extraccion de entidades nombradas de tipo `disease` (enfermedad) en texto biomedico y de prospectos farmacologicos.
- Extraccion de entidades de tipo `phenotype` (fenotipo) en el mismo dominio.
- Etiquetado guiado por prompt de texto: las etiquetas se pasan en tiempo de inferencia a `predict_entities`, con umbral de confianza configurable (el ejemplo del autor usa `threshold=0.5`).
- Procesamiento de texto de indicaciones y de contraindicaciones, manteniendo el contexto como metadatos externos al modelo.
- Devuelve offsets de caracteres (`start`, `end`), el texto del span, la etiqueta y una puntuacion de confianza, lo que facilita el resaltado y la trazabilidad en pipelines posteriores.
- Capacidad multilingue: no; solo ingles (`language: en`).
- Tool calling / function calling: no disponible; no es una capacidad de este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso: no aplica; es un componente de extraccion de un solo paso.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Farmacovigilancia automatizada: extraer las condiciones clinicas mencionadas en notificaciones de eventos adversos y en fichas tecnicas para poblar bases de datos estructuradas, usando los offsets devueltos para enlazar cada mencion con su documento de origen.
- Curacion de indicaciones y contraindicaciones: procesar secciones de DailyMed y separar, mediante el contexto de la frase, que condiciones aparecen como indicacion aprobada y cuales como contraindicacion, con las etiquetas `disease` y `phenotype`.
- Construccion de grafos de conocimiento farmacologicos: usar los spans extraidos como nodos de condicion y enlazarlos a los identificadores de farmaco del documento, generando relaciones medicamento-enfermedad listas para revision.
- Preprocesado de literatura biomedica: normalizar grandes volumenes de resumenes y textos clinicos antes de pasarlos a un sistema de normalizacion a ontologias (por ejemplo, mapeo posterior a terminologias medicas), reduciendo el coste de anotacion manual.
- Enriquecimiento de bases de datos internas de seguridad de medicamentos: ejecutar el modelo sobre texto historico no estructurado para recuperar menciones de fenotipos y enfermedades que no estaban indexadas.
- Componente de anotacion asistida para equipos de curacion: preetiquetar documentos y presentar las menciones con su puntuacion de confianza para que un revisor humano acepte o corrija, usando el umbral para controlar el equilibrio entre precision y recall.
- Integracion en el pipeline MedliNER y en DAKP: ambos proyectos lo utilizan en produccion segun la model card, por lo que puede reutilizarse como paso de extraccion dentro de arquitecturas ya existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de MMLU, HumanEval, GSM8K, F1 en dominios biomedicos ni comparaciones cuantitativas con otros modelos en los datos proporcionados.

La model card si incluye una salida de ejemplo capturada del checkpoint publicado. Se reproduce a continuacion como muestra ilustrativa del comportamiento, no como benchmark:

| Texto de entrada | Span extraido | Etiqueta | Puntuacion |
|---|---|---|---|
| Lisinopril is indicated for the treatment of hypertension... | hypertension | disease | 0,9998974800109863 |
| Lisinopril is indicated for the treatment of... chronic heart failure | chronic heart failure | disease | 0,99992835521698 |
| It is contraindicated in patients with a history of angioedema... | angioedema | disease | 0,99937903881073 |
| ...or severe renal impairment | severe renal impairment | disease | 0,9927625060081482 |

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 152.648.704 parametros: aproximadamente 0,61 GB en FP32, 0,31 GB en FP16/BF16 y 0,15 GB en int8 (estimaciones teoricas del peso de los parametros; hay que anadir el consumo de activaciones y del runtime).
- Tamano del repositorio: 0,6 GB, coherente con un checkpoint en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la practica; modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 estan sobradamente capacitados. El modelo cabe tambien en GPUs integradas y en CPU.
- Inferencia en CPU: viable por el reducido numero de parametros; no se documentan latencias en la informacion disponible.
- Opciones de despliegue: la via documentada es la libreria `gliner` en Python (`GLiNER.from_pretrained`). No se mencionan en la informacion disponible soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que en general no aplican a este tipo de encoder de clasificacion.
- Latencia y throughput: no disponibles.
- Espacio en disco: menos de 1 GB para el checkpoint, lo que permite empaquetarlo en imagenes de contenedor sin penalizacion relevante.

## Comparativa con modelos similares

No se han encontrado en la busqueda web resultados relevantes sobre este modelo ni sobre alternativas comparables: los resultados devueltos no guardan relacion con el ambito del modelo (contenido sobre calendario y festividades). La unica comparacion posible con los datos disponibles es con su modelo base.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| SkyeAv/drug-approvals-gliner-small-v2.1 | 152.648.704 | no disponible | en | apache-2.0 | GLiNER ajustado para `disease` y `phenotype` en indicaciones y contraindicaciones |
| urchade/gliner_small-v2.1 (modelo base) | no disponible | no disponible | no disponible | no disponible | GLiNER zero-shot de proposito general |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un sistema de apoyo a la decision clinica. El autor lo declara explicitamente: es un componente de extraccion de informacion y sus predicciones requieren revision humana; no debe usarse como consejo medico.
- Riesgo de alucinacion en forma de falsos positivos y falsos negativos de span: el modelo puede marcar texto que no es una enfermedad o un fenotipo, u omitir menciones validas. El umbral (`threshold`) es el parametro de control y debe calibrarse por dominio.
- Solo ingles: cualquier texto en otro idioma queda fuera del ambito declarado del modelo.
- Ambito de dominio restringido: los datos de entrenamiento y evaluacion son especificos de FAERS y DailyMed, por lo que el rendimiento puede degradarse en otros tipos de documento, otras etiquetas y otros contextos clinicos, tal como advierte el autor.
- Indicacion y contraindicacion no son etiquetas del modelo: son metadatos de contexto. Si se ejecuta el modelo sobre texto que mezcla ambos contextos, los spans resultantes no permiten distinguirlos por si solos; es responsabilidad del pipeline conservar y propagar ese contexto.
- Longitud de contexto no documentada: no hay garantia publicada sobre el tratamiento de documentos largos, por lo que conviene trocear el texto de forma controlada.
- Licencia y atribucion: el checkpoint es Apache-2.0, pero los usuarios deben revisar y cumplir tambien la licencia y los terminos del modelo base `urchade/gliner_small-v2.1`.
- Procedencia de los datos: FAERS y DailyMed son conjuntos de datos externos con sus propios terminos y requisitos de atribucion, que hay que respetar.
- Madurez del artefacto: cero descargas registradas y una sola interaccion (like) en el momento de la consulta; no hay evidencia publica de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SkyeAv/drug-approvals-gliner-small-v2.1
- Modelo base: https://huggingface.co/urchade/gliner_small-v2.1
- Repositorio de entrenamiento y evaluacion (MedliNER): https://github.com/SkyeAv/MedliNER
- Proyecto DAKP, usuario del modelo en produccion: https://github.com/glusman-team/dakp
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
