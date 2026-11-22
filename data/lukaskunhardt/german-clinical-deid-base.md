# LukasKunhardt/german-clinical-deid-base

## Resumen

`german-clinical-deid-base` es un modelo de clasificación de tokens (token classification) especializado en la desidentificación de texto clínico en alemán. Lo desarrolla LukasKunhardt como versión destilada del modelo mayor `LukasKunhardt/german-clinical-deid` (335M parámetros), y se apoya en `deepset/gbert-base` como modelo base. Su función es detectar y permitir redactar nombres, fechas, direcciones, teléfonos, identificadores y otras categorías de información personal (PII/PHI) en informes médicos germanoparlantes.

El modelo conserva las mismas 18 categorías de entidades que su hermano mayor con un tercio de los parámetros (109M frente a 335M), lo que lo hace apto para despliegue en CPU o GPU de gama baja. En las dos pruebas de referencia publicadas (GraSCCo y MDeID en alemán) obtiene tasas de fuga de identificadores comparables a las del modelo grande, con un F1 ligeramente inferior (0,948 frente a 0,960 en caracteres sobre GraSCCo).

Es relevante porque la desidentificación de textos clínicos es un paso previo habitual en pipelines de investigación y cumplimiento normativo, y este modelo ofrece una alternativa de tamaño reducido con licencia MIT y exportación ONNX para inferencia en CPU, algo poco frecuente en herramientas de PII clínica en alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), derivado de deepset/gbert-base |
| Parametros totales | 109.351.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | ONNX fp16 (219 MB); int8 no disponible (el export int8 rompio el modelo segun el autor) |
| Idiomas soportados | aleman (de) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |
| Tarea | token-classification (18 tipos de entidad) |
| Modelo base | deepset/gbert-base |
| Dataset de entrenamiento | LukasKunhardt/synthetic-german-clinical-letters (aumentado) |
| Tamano del repo | 0,7 GB |
| Umbral de decision | 0,01 (configurado en config.json) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT (gbert-base, 109M parametros) con cabeza de clasificacion de tokens para 18 categorias de entidades (nombres de paciente, medico, familiar, otras personas, titulo, iniciales, fechas, edades, calle, codigo postal, ciudad, hospital, telefono, fax, correo electronico, URL, identificadores y profesiones). Se entreno mediante destilacion del modelo grande `german-clinical-deid` (335M), que actua como profesor generando probabilidades por clase y caracter.

El pipeline de entrenamiento descrito por el autor consta de cuatro pasos: (1) aumentacion de las 2.550 cartas sinteticas originales del dataset `synthetic-german-clinical-letters` diez veces con nuevos nombres, IDs, direcciones y telefonos, generando 28.050 cartas sin intervencion de modelos de lenguaje; (2) el modelo grande produce probabilidades por clase y caracter; (3) ajuste fino de gbert-base sobre el 95 % de las cartas durante una epoca, con una funcion de perdida que combina al 50 % la divergencia KL respecto al profesor y al 50 % la entropia cruzada sobre las etiquetas gold; (4) seleccion del seed 42 entre 42, 43 y 44 por menor numero de fugas en la mitad de desarrollo de MDeID aleman. Un seed requiere unos 40 minutos en una NVIDIA A10G.

## Capacidades

- Deteccion de 18 tipos de entidades de informacion personal en texto clinico aleman: nombres (paciente, medico, familiar, otras personas, titulo, iniciales), fechas, edades, calle, codigo postal, ciudad, hospital, telefono, fax, correo electronico, URL, identificadores y profesiones.
- Redaccion de texto: el paquete `german-clinical-deid` expone un metodo `redact()` que sustituye las entidades detectadas por marcadores como `[PHI]`.
- Extraccion estructurada de entidades: el metodo `entities()` devuelve la lista de spans detectados con su etiqueta.
- Integracion con Presidio y spaCy, segun se documenta en la model card del modelo grande.
- Inferencia en CPU mediante el archivo ONNX fp16 (`onnx/model_fp16.onnx`, 219 MB), con puntuaciones identicas a PyTorch hasta tres decimales en los dos conjuntos de prueba.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni agentes: es exclusivamente un clasificador de tokens.

## Casos de uso

- Desidentificacion de informes clinicos antes de compartirlos con equipos de investigacion: el modelo detecta nombres, fechas e identificadores y permite sustituirlos por marcadores, reduciendo el riesgo de exposicion de PHI en conjuntos de datos derivados.
- Preprocesado en pipelines de anonimizacion con Presidio: al integrarse con Presidio y spaCy, se puede insertar como reconocedor de entidades alemanas dentro de un flujo de anonimizacion ya existente en una organizacion sanitaria.
- Despliegue en CPU en entornos con recursos limitados: la exportacion ONNX fp16 (219 MB) permite ejecutar la desidentificacion en servidores sin GPU, algo relevante para hospitales o clinicas con infraestructura modesta.
- Limpieza de corpus para entrenamiento de modelos: antes de usar cartas clinicas alemanas como datos de entrenamiento o evaluacion, el modelo permite redactar identificadores de forma automatizada sobre lotes grandes.
- Revision asistida de documentacion clinica: el modelo puede marcar entidades en un informe para que un revisor humano confirme o corrija la redaccion antes de la publicacion o el intercambio.
- Prototipado rapido de herramientas de privacidad: con licencia MIT y un paquete pip propio, un equipo puede integrar la desidentificacion en un prototipo interno sin coste de licencia ni dependencia de servicios en la nube.
- Evaluacion comparativa de herramientas de PII clinica: sirve como referencia de tamano reducido en pruebas internas frente a modelos mayores o comerciales, dado que el autor publica el codigo de evaluacion y los conjuntos de prueba.

## Benchmarks y rendimiento

Resultados publicados por el autor. Una "fuga" (leak) en un documento se produce si un nombre, identificador, telefono, fax, correo o calle permanece legible. El F1 estricto tipado exige coincidencia de inicio, fin y categoria.

| Modelo | Tamano | GraSCCo char F1 | Cartas GraSCCo con fuga | Notas MDeID con fuga | MDeID F1 estricto tipado |
|---|---|---|---|---|---|
| german-clinical-deid-base (seed 42) | 109M | 0,948 | 1 / 41 | 11,2 % | 0,439 |
| german-clinical-deid-base (media de 3 seeds) | 109M | 0,944 | 1 / 41 | 12,0 % | 0,437 |
| german-clinical-deid (large, v1.0) | 335M | 0,960 | 2 / 41 | 11,7 % | 0,475 |
| Ibrahimbaroud/personal-information-detection-german | 109M | 0,973 | 5 / 41 | 78,6 % | 0,300 |
| Horizon-Labs/pii-redactor-base | 308M | 0,832 | 8 / 41 | 23,4 % | 0,363 |
| Horizon-Labs/pii-redactor-small | 141M | 0,801 | 13 / 41 | 27,6 % | 0,367 |
| OpenMed/OpenMed-PII-SuperClinical-Small-44M-v1 | 141M | 0,831 | 22 / 41 | 41,3 % | 0,365 |

Segun el autor, los resultados de los modelos comparativos provienen de la ejecucion de pruebas del modelo grande (mismo codigo y datos, umbrales elegidos sobre datos de desarrollo) y no se repitieron para esta ficha. En tres seeds, el F1 en GraSCCo oscila entre 0,941 y 0,948 y la tasa de fuga en MDeID entre 11,2 % y 12,7 %. El autor no realizo prueba de significancia entre el modelo base y el grande.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32/fp16: el modelo tiene 109M parametros; en fp32 ocupa aproximadamente 0,44 GB de pesos y en fp16 unos 0,22 GB, mas overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM efectiva; el autor entreno con una NVIDIA A10G (40 minutos por seed). Para inferencia, GPU consumer como RTX 3060, RTX 4060 o superiores son mas que suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 20xx, 30xx, 40xx), asi como en iGPU con suficiente memoria compartida.
- Despliegue en CPU: si, mediante ONNX fp16 (`onnx/model_fp16.onnx`, 219 MB) con puntuaciones equivalentes a PyTorch hasta tres decimales en los conjuntos de prueba.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, paquete `german-clinical-deid` (pip desde GitHub), integraciones con Presidio y spaCy. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que son propios de modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GraSCCo char F1 | MDeID fuga | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| german-clinical-deid-base | 109M | no disponible | 0,948 | 11,2 % | MIT | Hugging Face, ONNX |
| german-clinical-deid (large) | 335M | no disponible | 0,960 | 11,7 % | MIT (segun model card del grande) | Hugging Face |
| Ibrahimbaroud/personal-information-detection-german | 109M | no disponible | 0,973 | 78,6 % | no disponible | Hugging Face |
| Horizon-Labs/pii-redactor-base | 308M | no disponible | 0,832 | 23,4 % | no disponible | Hugging Face |
| OpenMed/OpenMed-PII-SuperClinical-Small-44M-v1 | 141M | no disponible | 0,831 | 41,3 % | no disponible | Hugging Face |

El modelo base se posiciona como la opcion de menor tamano con tasa de fuga competitiva en MDeID (11,2 %), aunque cede en F1 estricto tipado frente al modelo grande (0,439 frente a 0,475). El modelo de Ibrahimbaroud obtiene mejor F1 en GraSCCo pero una tasa de fuga muy superior en MDeID (78,6 %), lo que sugiere un comportamiento menos robusto en notas sinteticas.

## Limitaciones y advertencias

- Solo aleman: en datos de desarrollo en otros idiomas pierde mas que el modelo grande (por ejemplo, F1 de caracteres 0,811 frente a 0,914 en MDeID portugues).
- El modelo falla en algunos identificadores y redacta palabras ordinarias: el autor recomienda revisar la salida antes de compartir texto. Los tipos de entidad son menos fiables que la redaccion en si.
- No probado en cartas de hospital reales segun el autor.
- Eliminar identificadores no equivale a anonimizacion bajo el RGPD: es una herramienta de investigacion, no un producto sanitario.
- El conjunto de prueba MDeID influyo en algunas decisiones tempranas del modelo grande, por lo que no es un held-out perfectamente limpio.
- No hay archivo int8: el export int8 rompio el modelo con el umbral de 0,01 en datos de desarrollo.
- El umbral bajo (0,01) provoca redaccion de caracteres adyacentes a las entidades (por ejemplo, el parentesis tras un nombre); es una decision deliberada de preferir sobrerredactar antes que dejar pasar informacion.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si hay riesgo de falsos negativos (identificadores no detectados) y falsos positivos (palabras comunes redactadas).
- No se documentan sesgos especificos del modelo; al derivar de gbert-base, hereda los sesgos del corpus aleman de dicho modelo base.
- Uso comercial permitido por licencia MIT, pero el autor advierte que no es una herramienta de cumplimiento normativo por si sola.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LukasKunhardt/german-clinical-deid-base
- Modelo grande (profesor): https://huggingface.co/LukasKunhardt/german-clinical-deid
- Modelo base: https://huggingface.co/deepset/gbert-base
- Dataset de entrenamiento: https://huggingface.co/datasets/LukasKunhardt/synthetic-german-clinical-letters
- Repositorio GitHub: https://github.com/lukaskunhardt/german-clinical-deid
- Conjunto de prueba GraSCCo: https://zenodo.org/records/11502329
- Resultados completos (RESULTS.md): https://huggingface.co/LukasKunhardt/german-clinical-deid-base/blob/main/RESULTS.md
