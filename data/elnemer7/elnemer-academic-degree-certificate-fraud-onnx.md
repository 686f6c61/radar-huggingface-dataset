# elnemer7/ElNeMeR-Academic-Degree-Certificate-Fraud-ONNX

## Resumen

ElNeMeR Academic Degree, University Seal & IELTS Certificate Fraud Detector es un modelo ONNX publicado por el desarrollador elnemer7 (Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) orientado a la deteccion de fraude documental academico. Segun su model card, clasifica documentos en tres categorias: titulos academicos autenticos, notas o sellos universitarios falsificados y diplomas de instituciones no acreditadas. Se presenta como el modelo numero 25 de una flota de 25 modelos de IA forense de caracter humanitario.

El modelo se distribuye en formato ONNX (opset 14) y es compatible con `onnxruntime` y `onnxruntime-web` mediante WASM, lo que permite inferencia tanto en servidor como en navegador. La entrada es un tensor `degree_features` de tipo `float32` con forma `[batch_size, 20]`, es decir, un vector de 20 caracteristicas por documento, no una imagen ni texto en bruto. La licencia es MIT.

La relevancia del modelo radica en su aplicacion a la verificacion de credenciales academicas en procesos de seleccion de personal y admision, un ambito donde la falsificacion de titulos y sellos es frecuente. No obstante, la informacion publicada es muy escasa: el repositorio tiene 0 GB de tamano declarado, cero descargas y cero likes en el momento de la consulta, y no se detalla el proceso de entrenamiento ni el origen de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador ONNX; no se especifica la topologia interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no aplica: entrada de vector fijo de 20 caracteristicas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se trata de un grafo ONNX de clasificacion con una unica entrada, `degree_features`, un tensor `float32` de dimension `[batch_size, 20]`, y una salida de probabilidades sobre tres clases (`authentic_academic_degree`, `forged_grade_or_seal`, `fake_unaccredited_diploma`). No se especifica si el clasificador es una red densa, un arbol convertido a ONNX u otra estructura.

Tampoco se publican datos sobre el conjunto de entrenamiento: numero de muestras, composicion, procedencia de los documentos, tecnicas de aumento de datos ni si se aplicaron procesos de ajuste fino como RLHF o DPO (poco probables en un clasificador de este tipo). El autor declara una "calibration accuracy" del 99,87 %, pero no se aporta la metodologia de calibracion ni el conjunto de evaluacion empleado, por lo que la cifra no es verificable de forma independiente.

## Capacidades

- Clasificacion de documentos academicos en tres clases: titulo autentico, nota o sello falsificado y diploma de institucion no acreditada.
- Deteccion, segun la descripcion del autor, de notas o calificaciones (GPA) editadas, sellos universitarios clonados y certificados de idiomas o de experiencia fabricados.
- Inferencia sobre vectores de 20 caracteristicas extraidas previamente del documento; el modelo no procesa imagenes ni texto directamente.
- Compatibilidad con `onnxruntime` en servidor y con `onnxruntime-web` (WASM) en el navegador.
- Soporte por lotes mediante la dimension `batch_size` del tensor de entrada.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, capacidades multimodales ni modo de razonamiento extendido.

## Casos de uso

- Verificacion de credenciales en seleccion de personal: integrado en un ATS, el modelo recibe el vector de caracteristicas extraido del titulo o certificado presentado por el candidato y devuelve la clase mas probable, permitiendo derivar a revision manual los casos marcados como falsificados.
- Admision academica: validacion previa de titulos de acceso y certificados de idiomas (por ejemplo, IELTS) en procesos de matriculacion, con el objetivo de detectar notas alteradas o sellos clonados antes de la revision documental completa.
- Deteccion de fraude en portales de empleo: clasificacion automatica de certificados adjuntos en ofertas y candidaturas para bloquear diplomas de instituciones no acreditadas.
- Auditoria interna de expedientes: revision por lotes de expedientes ya archivados para identificar documentos sospechosos y priorizar la intervencion de un perito.
- Despliegue en navegador para verificacion ciudadana o de RR. HH.: gracias a la compatibilidad WASM, el modelo puede ejecutarse en el cliente sin enviar las caracteristicas del documento a un servidor, lo que reduce la exposicion de datos personales.
- Prefiltrado en pipelines de peritaje forense: uso como primera etapa de triaje que reduce el volumen de documentos que llegan al analisis manual de un experto en documentoscopia.
- Integracion en flujos de compliance y KYC documental: comprobacion de titulaciones exigidas en sectores regulados (sanidad, educacion, colegios profesionales) antes de habilitar al profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es una "calibration accuracy" del 99,87 %, sin detalle del conjunto de evaluacion, del reparto entre clases ni de la metodologia de calculo, por lo que no puede considerarse un benchmark comparable.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio declara un tamano de 0,0 GB y la entrada es un vector de 20 valores `float32`, lo que sugiere un modelo de muy pocos parametros, pero no se confirma el tamano real de los pesos.
- GPU recomendadas: no disponibles. Por la naturaleza del modelo (clasificador de entrada vectorial), la inferencia en CPU deberia ser suficiente en la mayoria de escenarios.
- GPU de consumo: previsiblemente cabe en cualquier GPU de consumo e incluso en CPU, aunque no se aportan mediciones.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` con backend WASM para navegador y cualquier runtime compatible con ONNX opset 14.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (deteccion de fraude documental academico en formato ONNX) con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La informacion publicada es minima: no se documentan arquitectura, datos de entrenamiento, tamano de pesos ni metodologia de evaluacion, lo que impide auditar el modelo.
- La cifra de 99,87 % de "calibration accuracy" no es verificable de forma independiente y no se acompana de matriz de confusion ni de tamano del conjunto de prueba.
- El modelo no procesa documentos en bruto: requiere un extractor de caracteristicas previo que genere el vector de 20 valores. La calidad de ese extractor condiciona por completo el resultado y no se especifica como construirlo.
- Riesgo de falsos positivos y falsos negativos en documentos con formatos poco representados en el entrenamiento (universidades de paises no cubiertos, titulos historicos, documentos danados).
- No se documentan sesgos por pais, idioma o tipo de institucion; dado que la verificacion academica varia mucho entre jurisdicciones, el riesgo de sesgo geografico es plausible pero no cuantificado.
- El uso como unico criterio de decision en procesos de seleccion o admision es desaconsejable: deberia emplearse como filtro previo con revision humana, tanto por precision como por implicaciones legales y de proteccion de datos.
- La licencia MIT permite uso comercial y modificacion, pero no se ofrece ninguna garantia por parte del autor sobre el rendimiento en produccion.
- El repositorio presenta cero descargas y cero interacciones, sin historial de mantenimiento ni comunidad que valide su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Academic-Degree-Certificate-Fraud-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
