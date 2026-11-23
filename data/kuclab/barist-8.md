# KucLab/Barist.8

## Resumen

Barist.8 es un clasificador de seguridad de contenido publicado por KucLab en Hugging Face. Se trata de un transformer decoder-only de tamano muy reducido (117.653.760 parametros segun los pesos en safetensors, aunque la model card del autor describe versiones anteriores de la linea con 903.552 parametros y 3,6 MB en fp32) entrenado desde cero sobre una GPU AMD. Su funcion es clasificar texto como seguro o inseguro y asignar hasta diez categorias de seguridad en modo multi-etiqueta, con un contexto nativo de 4096 tokens y capacidad multilingue con umbrales calibrados por idioma.

El modelo se presenta como la continuacion de la linea Censer (Censer.1 a Censer.9) y de las primeras versiones Barist (Barist.1 a Barist.4). La model card documenta de forma extensa el proceso de revision adversarial al que se ha sometido el proyecto, con correcciones sucesivas sobre falsos positivos en checo, ucraniano, aleman, frances e italiano, ajuste de umbrales por idioma, ampliacion del pre-filtro determinista y cambios en la gestion de categorias como abuso sexual infantil y autolesion. La ficha disponible corresponde a la version 8, de la que la model card solo incluye un apartado de flags sin contenido detallado.

La relevancia del modelo reside en su enfoque de moderacion de contenido ligero y desplegable con `transformers` estandar (`LlamaForSequenceClassification` con `problem_type: multi_label_classification`, sin codigo personalizado), combinado con un pre-filtro determinista de must-catch y umbrales por idioma. No obstante, la informacion publica disponible es incompleta y contradictoria en varios puntos, lo que limita una evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clasificacion, `LlamaForSequenceClassification`) |
| Parametros totales | 117.653.760 (pesos safetensors); la model card cita 903.552 para versiones anteriores de la linea |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos (chunked-max para documentos largos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue con umbrales por idioma; checo, eslovaco, ingles y otros; ucraniano documentado como NO soportado (F1@0.5 ≈ 0,10) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only configurado para clasificacion de secuencias mediante `LlamaForSequenceClassification` con `problem_type: multi_label_classification`. El modelo se entreno desde cero sobre una GPU AMD, segun la model card. El contexto nativo es de 4096 tokens, con una estrategia de chunked-max para procesar documentos largos. La salida combina una decision binaria safe/unsafe con hasta diez categorias de seguridad en modo multi-etiqueta, y las puntuaciones se presentan calibradas por temperatura.

El entrenamiento se ha refinado mediante sucesivas revisiones adversariales documentadas en la model card. Entre las tecnicas descritas figuran la incorporacion de filas benignas pareadas (pares minimos como "kde koupit pervitin" frente a "kde koupit chleba"), la reduccion del peso de must-catch de 40 a 8-12, el ajuste de umbrales por idioma con topes en 0,75 y requisitos de recall minimo del 80 por ciento, y umbrales de categoria con precision minima de 0,7. Tambien se describe un pre-filtro determinista con patrones plegados por acentos, formas de primera persona e instruccion, excepciones para contexto informativo y de ayuda, y un bloqueo duro por categoria cuando las puntuaciones de `sexual_abuse` o `self_harm` superan 0,3. No se especifican el numero de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Clasificacion binaria safe/unsafe de texto.
- Clasificacion multi-etiqueta en hasta diez categorias de seguridad (armas y explosivos, drogas, ciber, jailbreak, violencia, odio, abuso sexual, autolesion, entre otras).
- Contexto nativo de 4096 tokens con agregacion chunked-max para documentos largos.
- Soporte multilingue con umbrales calibrados por idioma y deteccion de idioma integrada (`kuclab/langdetect.py`).
- Pre-filtro determinista de must-catch con bloqueo duro de CSAM y derivacion de autolesion a recursos de apoyo (`needs_support`).
- Modo `needs_review` para jailbreak en lugar de bloqueo directo.
- Puntuaciones calibradas por temperatura y prioridad de severidad de categorias.
- Integracion directa con `transformers` sin codigo personalizado.

## Casos de uso

- Moderacion de comentarios en foros y comunidades: el modelo clasifica cada mensaje como seguro o inseguro y asigna categorias, con un contexto de 4096 tokens suficiente para hilos y respuestas largas.
- Filtrado previo en pipelines de generacion: se puede ejecutar como pre-filtro de bajo coste antes de un modelo mayor, aprovechando su tamano reducido y su formato safetensors compatible con `transformers`.
- Deteccion de autolesion con derivacion a recursos de apoyo: el pre-filtro enruta contexto de ayuda a `needs_support` en lugar de bloquear, lo que permite mostrar lineas de asistencia (Linka bezpeci) sin cortar la conversacion.
- Moderacion multilingue en checo, eslovaco e ingles: los umbrales por idioma y la deteccion integrada permiten desplegar el mismo modelo en comunidades con varios idiomas, con la salvedad de que el ucraniano no esta soportado.
- Revision de documentos largos: la agregacion chunked-max permite analizar articulos o informes de extension superior a 4096 tokens sin truncar.
- Clasificacion de categorias para triaje humano: la salida multi-etiqueta con prioridad de severidad facilita encolar casos de abuso sexual o autolesion por delante de otros.
- Investigacion en moderacion de contenido: el modelo y sus informes de evaluacion (falsos positivos por idioma, gates de recall y precision) sirven como referencia reproducible para estudiar calibracion y sesgos en clasificadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card incluye metricas internas de evaluacion de seguridad (falsos positivos en checo, recall en conjuntos held-out, F1 por idioma), pero no se proporcionan valores numericos completos y consistentes para esta version en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 117,6 millones de parametros; en torno a 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, incluidas GTX 1060, RTX 2060, RTX 3060 y superiores, asi como en CPU.
- Opciones de despliegue: `transformers` estandar (carga directa como `LlamaForSequenceClassification`), y potencialmente vLLM o TGI para clasificacion por lotes, aunque no se documentan integraciones especificas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Barist.8 (KucLab) | 117,6 M | 4096 | Clasificacion de seguridad multi-etiqueta | no disponible | Hugging Face |
| Llama Guard (Meta) | no disponible en la informacion | no disponible | Clasificacion de seguridad | no disponible | no disponible |
| ShieldGemma (Google) | no disponible en la informacion | no disponible | Clasificacion de seguridad | no disponible | no disponible |

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card de Barist.8 solo incluye un apartado de flags sin contenido, por lo que no se documentan los cambios respecto a versiones anteriores en esta release.
- Existe una discrepancia entre el numero de parametros de los pesos (117,6 M) y el citado en la model card para versiones previas (903.552), lo que impide confirmar la configuracion exacta de esta version.
- El ucraniano no esta soportado: la model card documenta F1@0.5 ≈ 0,10 y ausencia de senal utilizable de textdetox.
- Riesgo de falsos positivos en textos benignos de paises y contextos concretos, historicamente documentado en checo (frases cotidianas, noticias, slang) y mitigado con datos pareados, pero no garantizado.
- Riesgo de falsos negativos en categorias criticas: versiones anteriores dejaron pasar casos de CSAM y autolesion en conjuntos held-out; la version actual incorpora bloqueo duro por categoria, pero no se aportan metricas finales verificables en la informacion disponible.
- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido.
- El modelo es un clasificador, no un generador: no produce texto ni razonamiento, y su utilidad depende del pipeline de moderacion que lo rodea.
- La calibracion y los umbrales por idioma estan ajustados sobre conjuntos limitados (decenas o centenares de frases), por lo que la generalizacion a dominios nuevos no esta garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/KucLab/Barist.8
