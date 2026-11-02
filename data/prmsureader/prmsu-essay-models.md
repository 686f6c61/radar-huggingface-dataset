# prmsureader/prmsu-essay-models

## Resumen

PRMSU Essay Models es una coleccion de tres modelos de la familia DeBERTa-v3 publicados por el usuario prmsureader (President Ramon Magsaysay State University, Filipinas) como parte de un proyecto de tesis. El repositorio agrupa un modelo de puntuacion de ensayos en ingles con seis rasgos sobre la escala ELLIPSE (1-5), un detector de texto generado por IA en ingles con una mitigacion para escritores no nativos, y un detector experimental de texto generado por IA en filipino. No se trata de un modelo generativo, sino de clasificadores encoder-only derivados de microsoft/deberta-v3-base y microsoft/mdeberta-v3-base.

El problema que aborda es la evaluacion automatica de ensayos y la deteccion de texto asistido por IA en el ambito educativo, con un enfasis explicito en no penalizar a estudiantes que escriben en una segunda lengua. Es relevante ahora porque muchas instituciones buscan senales de apoyo a la correccion y de integridad academica, y este proyecto documenta tanto el modelo como sus limitaciones y la procedencia de los datos de entrenamiento.

El repositorio ocupa 2,6 GB e incluye los pesos en formato safetensors junto con metadatos de entrenamiento (training_meta.json) en cada carpeta. La licencia es "see-attribution" y el modelo de puntuacion queda restringido a uso no comercial por heredar la licencia CC BY-NC-SA 4.0 del corpus ELLIPSE. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base y mDeBERTa-v3-base) |
| Parametros totales | no disponible (base: DeBERTa-v3-base y mDeBERTa-v3-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (puntuacion y deteccion), tl (deteccion, experimental) |
| Licencia | other / see-attribution; uso no comercial para el modelo de puntuacion |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los tres componentes son clasificadores basados en DeBERTa-v3. La carpeta `en-only` parte de microsoft/deberta-v3-base y realiza puntuacion de ensayos en ingles con seis rasgos sobre la escala ELLIPSE (1-5). La carpeta `detector-mitigated` tambien parte de deberta-v3-base y detecta texto escrito por IA en ingles incorporando una mitigacion para escritores no nativos. La carpeta `detector-tl` parte de mdeberta-v3-base y detecta texto generado por IA en filipino, marcado explicitamente como experimental y no validado sobre ensayos de estudiantes.

El modelo de puntuacion se entrena sobre el corpus ELLIPSE (CC BY-NC-SA 4.0). Cada carpeta incluye un archivo `training_meta.json` que documenta el proceso de entrenamiento, aunque los detalles concretos (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. No se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, dado que son modelos encoder para clasificacion.

## Capacidades

- Puntuacion de ensayos en ingles con seis rasgos sobre escala 1-5 (modelo `en-only`).
- Deteccion de texto generado por IA en ingles con mitigacion para escritores no nativos (`detector-mitigated`).
- Deteccion de texto generado por IA en filipino, experimental y no validada en ensayos de estudiantes (`detector-tl`).
- Clasificacion de texto; no genera texto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas a ingles y filipino.
- La salida de deteccion se presenta como una senal para que el docente revise, nunca como prueba.

## Casos de uso

- Correccion asistida de ensayos en ingles: el modelo `en-only` puede puntuar redacciones sobre la escala ELLIPSE (1-5) en seis rasgos, sirviendo como primera pasada para que el docente revise y ajuste la nota.
- Revision de integridad academica en ingles: el detector `detector-mitigated` puede marcar textos sospechosos de generacion por IA como senal de alerta, teniendo en cuenta la mitigacion para escritores no nativos y evitando falsos positivos contra estudiantes de segunda lengua.
- Investigacion educativa en Filipinas: el detector `detector-tl` permite explorar la deteccion de texto generado por IA en filipino, siempre como herramienta experimental y con validacion adicional sobre ensayos reales.
- Formacion docente: los modelos pueden integrarse en talleres para mostrar como se comporta la puntuacion automatica y la deteccion de IA, usando los metadatos de entrenamiento como material didactico.
- Evaluacion de escritura en entornos de segunda lengua: la mitigacion del detector en ingles resulta adecuada para contextos donde el alumnado escribe en una lengua no nativa y se busca reducir el sesgo contra estos escritores.
- Analisis de corpus a escala: al ser clasificadores encoder, permiten procesar lotes de ensayos con bajo coste computacional para estudios de tendencias de escritura o de uso de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al derivar de DeBERTa-v3-base, un clasificador encoder de este tamano suele ejecutarse en GPU consumer con pocos GB de VRAM, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: probablemente si, al tratarse de un encoder base, pero no se confirma en la informacion disponible.
- Opciones de despliegue: no disponible; los pesos estan en safetensors y pueden cargarse con librerias compatibles con Hugging Face Transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRMSU Essay Models | no disponible (base DeBERTa-v3) | no disponible | Puntuacion de ensayos y deteccion de IA | other / see-attribution, no comercial para puntuacion | Hugging Face |
| microsoft/deberta-v3-base | no disponible | no disponible | Modelo base encoder | MIT (segun el modelo original) | Hugging Face |
| microsoft/mdeberta-v3-base | no disponible | no disponible | Modelo base encoder multilingue | MIT (segun el modelo original) | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El detector de IA en ingles incorpora una mitigacion para escritores no nativos, lo que sugiere un sesgo conocido contra este colectivo en detectores sin mitigar.
- La salida del detector es una senal para revision docente, nunca prueba de uso de IA; no debe usarse como evidencia disciplinaria.
- El detector en filipino es experimental y no esta validado sobre ensayos de estudiantes.
- El modelo de puntuacion se entrena sobre ELLIPSE (CC BY-NC-SA 4.0) y queda restringido a uso no comercial.
- La licencia "see-attribution" exige consultar ATTRIBUTION.md para conocer datasets, licencias y citas.
- No se documentan la longitud de contexto ni los tipos de cuantizacion, lo que limita la planificacion de despliegue.
- Riesgo de alucinacion no aplica directamente al ser clasificadores, pero si el riesgo de clasificaciones erroneas en textos fuera de dominio.
- Solo cubre ingles y filipino; no hay soporte documentado para castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prmsureader/prmsu-essay-models
- Demo (Space): https://huggingface.co/spaces/wanzue/prmsu-essay-grader
- ATTRIBUTION.md: https://huggingface.co/wanzue/prmsu-essay-models/blob/main/ATTRIBUTION.md
- Modelo base en ingles: https://huggingface.co/microsoft/deberta-v3-base
- Modelo base multilingue: https://huggingface.co/microsoft/mdeberta-v3-base
