# elnemer7/ElNeMeR-Medical-Lab-XRay-Tamper-ONNX

## Resumen

ElNeMeR Medical Lab Report, Prescription & X-Ray Tamper Detector (ONNX #23) es un modelo en formato ONNX publicado por el desarrollador elnemer7 (Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) dentro de una flota anunciada de 25 modelos orientados a forense digital y ayuda humanitaria. Su proposito declarado es detectar manipulaciones digitales en documentacion medica: alteracion de valores analiticos de laboratorio, falsificacion de sellos y recetas hospitalarias, y empalme (copy-move) de patologias en radiografias.

A diferencia de un modelo de lenguaje, no procesa texto ni imagenes de forma nativa: la model card especifica una unica entrada tensorial denominada `med_doc_features`, de tipo `float32` y forma `[batch_size, 20]`. Se trata, por tanto, de un clasificador tabular de 20 caracteristicas que devuelve tres probabilidades correspondientes a las clases `authentic_medical_scan`, `altered_lab_values` y `spliced_xray_pathology`. El pipeline de extraccion de esas 20 caracteristicas desde documentos e imagenes medicas no se documenta en la informacion disponible.

El modelo es relevante en el nicho de verificacion documental sanitaria y forense digital, donde la manipulacion de informes y radiografias tiene implicaciones legales y de fraude. Su licencia MIT y su compatibilidad con `onnxruntime` y `onnxruntime-web` (WASM) facilitan el despliegue, incluso en navegador. No obstante, la informacion publicada es muy limitada: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la unica metrica reportada es una "calibracion" del 100,00 %, sin detalle de metodologia, dataset ni particion de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador ONNX con entrada tabular de 20 caracteristicas; topologia interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo no generativo ni secuencial) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural de forma directa) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |
| Entrada | Tensor `med_doc_features`, `float32`, forma `[batch_size, 20]` |
| Salida | Tres probabilidades: `authentic_medical_scan` (0), `altered_lab_values` (1), `spliced_xray_pathology` (2) |
| Compatibilidad de ejecucion | `onnxruntime` y `onnxruntime-web` (WASM) |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: se desconoce si se trata de un perceptron multicapa, un gradient boosting exportado a ONNX u otra topologia. Lo unico confirmado es el contrato de entrada y salida: un vector de 20 caracteristicas `float32` por muestra y tres clases de salida. El modelo se exporta en ONNX opset 14 y esta pensado para ejecutarse tanto con `onnxruntime` en servidor como con `onnxruntime-web` compilado a WASM en el navegador.

Tampoco se documentan los datos de entrenamiento (numero de muestras, composicion, procedencia de los documentos medicos), ni si hubo aumentacion de datos, validacion cruzada o calibracion de probabilidades. La model card menciona una "Calibration Accuracy" del 100,00 %, pero no especifica que metrica es exactamente, sobre que conjunto se calculo ni como se definio la calibracion. No se indica ninguna innovacion tecnica adicional (atencion, decodificacion especulativa, etc.), lo cual es coherente con un clasificador tabular.

## Capacidades

- Clasificacion binaria/multiclase de documentos medicos en tres categorias: escaneo autentico, valores de laboratorio alterados y patologia de radiografia empalmada.
- Deteccion declarada de valores analiticos manipulados digitalmente en informes de laboratorio.
- Deteccion declarada de sellos y recetas hospitalarias falsificadas.
- Deteccion declarada de copy-move (empalme de regiones) en imagenes de radiologia.
- Inferencia en servidor mediante `onnxruntime` y en navegador mediante `onnxruntime-web` (WASM).
- Procesamiento por lotes (`batch_size` configurable en la entrada).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No se documentan capacidades multilingues, de vision directa ni de audio: la vision y el OCR, si existen, deben realizarse en un paso previo externo que produzca el vector de 20 caracteristicas.

## Casos de uso

- Verificacion de informes de laboratorio en aseguradoras sanitarias: el clasificador recibe el vector de caracteristicas extraido del documento y devuelve la probabilidad de `altered_lab_values`, permitiendo marcar expedientes para revision manual antes de aprobar un reembolso.
- Triaje de recetas y sellos hospitalarios en farmacias o mutuas: integrado en el flujo de validacion documental, prioriza los documentos con alta probabilidad de sello falsificado para inspeccion humana.
- Deteccion de fraude en siniestros con radiografias: la clase `spliced_xray_pathology` permite senalar estudios con posibles empalmes de patologia antes de la peritacion medica.
- Auditoria interna de historiales clinicos digitalizados: ejecucion por lotes sobre un archivo de documentos para localizar anomalias de integridad documental y generar listados de casos sospechosos.
- Verificacion en el navegador para portales ciudadanos: gracias a `onnxruntime-web` (WASM), la comprobacion preliminar puede ejecutarse en el cliente sin enviar el documento a un servidor, reduciendo exposicion de datos sensibles.
- Investigacion forense digital y docencia: uso como componente de referencia en pipelines de analisis de manipulacion documental, con la salvedad de que la extraccion de caracteristicas debe implementarse aparte.
- Preliminar en plataformas de ayuda humanitaria: cribado rapido de documentacion medica presentada para asistencia, derivando los casos marcados a verificacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra reportada por el autor es una "Calibration Accuracy" del 100,00 %, sin especificacion de la metrica, el conjunto de evaluacion ni el procedimiento de calculo, por lo que no puede considerarse un benchmark verificable ni comparable.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB y la entrada es un vector de 20 `float32`; por el contrato de entrada, la huella deberia ser minima, pero no se confirma el tamano real de los pesos.
- GPU recomendadas: no disponibles. Para un clasificador de este tipo, la CPU es suficiente en la mayoria de escenarios; no se documenta ningun requisito de GPU.
- GPU de consumo: previsiblemente irrelevante; el modelo deberia ejecutarse en CPU. No hay datos oficiales que lo confirmen.
- Despliegue: `onnxruntime` (Python, C++, etc.) y `onnxruntime-web` con backend WASM para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de deteccion de manipulacion documental medica ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia de categoria, existirian clasificadores tabulares genericos exportables a ONNX y modelos de vision para deteccion de manipulacion de imagenes, pero no se dispone de sus especificaciones en esta busqueda.

## Limitaciones y advertencias

- La model card no documenta la arquitectura, el dataset de entrenamiento ni el procedimiento de evaluacion; la reproducibilidad es practicamente nula con la informacion publicada.
- La cifra de "Calibration Accuracy: 100,00 %" no es verificable y no deberia usarse como garantia de rendimiento en produccion.
- El modelo no procesa imagenes ni texto directamente: requiere un pipeline externo, no documentado, que transforme el documento o la radiografia en un vector de 20 caracteristicas. Un fallo en esa extraccion invalida por completo la prediccion.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, con consecuencias graves en contextos medicos y legales.
- No se documentan sesgos conocidos, pero al no conocerse la distribucion de entrenamiento no puede descartarse sesgo por tipo de documento, pais, idioma o formato hospitalario.
- El modelo no debe usarse como unica base para acusaciones de fraude: cualquier resultado marcado debe confirmarse por peritaje humano.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin garantias explicitas por parte del autor.
- El repositorio no tiene descargas ni likes y su fecha de creacion es muy reciente; no hay evidencia de uso en produccion ni de validacion independiente.
- La model card incluye enlaces y datos de contacto del autor; conviene tratarlos como informacion comercial y no como aval tecnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Medical-Lab-XRay-Tamper-ONNX
- Plataforma de forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Documentacion de ONNX Runtime: https://onnxruntime.ai
- Documentacion de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Especificacion ONNX opset 14: https://onnx.ai/onnx/operators/
