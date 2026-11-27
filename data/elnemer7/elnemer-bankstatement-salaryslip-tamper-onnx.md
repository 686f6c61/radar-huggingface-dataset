# elnemer7/ElNeMeR-BankStatement-SalarySlip-Tamper-ONNX

## Resumen

ElNeMeR Bank Statement & Salary-Slip Tamper Detector es un modelo ONNX de clasificación binaria/multiclase orientado a la detección de falsificaciones en extractos bancarios y nóminas de recursos humanos. Lo desarrolla el ingeniero Mahmoud ElNemer dentro de su catálogo de 35 modelos forenses ("Sovereign & Humanitarian Forensic AI Fleet") publicados bajo la organización elnemer7 en Hugging Face. El modelo resuelve un problema concreto de verificación documental: identificar balances inflados, filas de transacciones alteradas, desalineaciones de kerning en tablas y plantillas sintéticas de nómina usadas en solicitudes de préstamos, visados de embajada y alquileres.

A diferencia de los modelos de lenguaje generativos, se trata de un clasificador ligero empaquetado en formato ONNX (opset 14) con una única entrada tensorial de 20 características (`bank_doc_features`, `float32`, `[batch_size, 20]`) y una salida de probabilidades sobre tres clases. Esto implica que el modelo no procesa imágenes ni texto crudo por sí mismo: requiere un pipeline externo de extracción de características que alimente esas 20 dimensiones. La relevancia actual radica en su orientación a KYC y forense digital, un nicho donde los modelos abiertos son escasos, aunque la información pública disponible es muy limitada.

El repositorio tiene un tamaño de 0.0 GB según los metadatos de Hugging Face, cero descargas y cero likes en el momento de la consulta, lo que sugiere una publicación reciente o de muy baja difusión. No se dispone de información sobre el dataset de entrenamiento, la arquitectura interna de la red ni los resultados de validación más allá de la cifra de "Calibration Accuracy: 100.00%" que declara el autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal empaquetada en ONNX, opset 14; topología interna no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada tensorial fija de 20 características, `[batch_size, 20]`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre características numéricas, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14), compatible con `onnxruntime` y `onnxruntime-web` WASM |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de la red neuronal. El modelo se distribuye exclusivamente como grafo ONNX en opset 14, lo que permite ejecución tanto en `onnxruntime` nativo como en `onnxruntime-web` mediante WebAssembly, habilitando inferencia en navegador. La interfaz es un tensor de entrada `float32` de forma `[batch_size, 20]` denominado `bank_doc_features`, y la salida es un vector de probabilidades sobre tres clases: `authentic_bank_statement`, `inflated_balance_or_salary` y `synthetic_hr_template_forgery`.

No se especifican el número de tokens, la composición del dataset, el volumen de muestras de entrenamiento ni si se aplicaron técnicas de ajuste fino, regularización o aumentación de datos. Tampoco se detalla el proceso de ingeniería de las 20 características de entrada, que presumiblemente provienen de un pipeline previo de análisis documental (posiblemente OCR más análisis de layout y metadatos). La única métrica declarada es una "Calibration Accuracy" del 100.00%, cifra que no viene acompañada de metodología, tamaño de conjunto de validación ni intervalos de confianza.

## Capacidades

- Clasificación de documentos financieros en tres categorías: extracto bancario auténtico, balance o salario inflado, y plantilla sintética de nómina de RR. HH.
- Detección de alteraciones digitales en balances de cuenta y filas de transacciones.
- Detección de desalineaciones de kerning en tablas, indicativo de edición posterior del documento.
- Detección de plantillas sintéticas de nómina usadas en solicitudes fraudulentas.
- Ejecución en navegador mediante `onnxruntime-web` (WASM), lo que permite despliegue en cliente sin backend.
- Inferencia por lotes (`batch_size` configurable) sobre vectores de 20 características.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en sentido estricto: opera sobre características numéricas.
- No dispone de modo thinking, visión ni audio de forma nativa; la visión, si existe, reside en el pipeline externo de extracción de características.

## Casos de uso

- Verificación KYC en onboarding bancario: el clasificador se integra en el flujo de alta de clientes para marcar extractos bancarios sospechosos antes de aprobar productos financieros, alimentado por un extractor de características que resume el layout y los valores numéricos del documento.
- Evaluación de solicitudes de préstamo: los analistas de crédito pueden usar la probabilidad de la clase `inflated_balance_or_salary` como señal de alarma en la revisión manual, reduciendo el tiempo de triaje de expedientes.
- Tramitación de visados en embajadas: los consulados reciben nóminas y extractos como prueba de solvencia; el modelo permite un pre-filtrado automático de documentos potencialmente manipulados antes de la entrevista.
- Verificación de solvencia en alquileres: las inmobiliarias y plataformas de alquiler pueden validar nóminas de inquilinos de forma automatizada, detectando plantillas sintéticas de RR. HH. generadas con software de diseño.
- Auditoría interna y compliance: los departamentos de fraude pueden ejecutar el modelo por lotes sobre archivos históricos de documentos para identificar patrones de manipulación recurrentes.
- Despliegue en navegador para portales de autoservicio: gracias a la compatibilidad con `onnxruntime-web`, el usuario puede subir su documento y recibir una pre-verificación en el cliente, reduciendo la exposición de datos personales al servidor.
- Forense digital en investigaciones: peritajes que requieran una primera clasificación automática de evidencias documentales antes del análisis manual detallado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara una "Calibration Accuracy" del 100.00%, sin especificar el conjunto de validación, el tamaño de muestra ni la metodología de cálculo, por lo que no se puede considerar un benchmark reproducible ni comparable con métricas estándar (MMLU, HumanEval, GSM8K u otras, que además no aplican a un clasificador de este tipo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio reporta un tamaño de 0.0 GB, lo que sugiere un grafo ONNX de muy pocos kilobytes o megabytes; en cualquier caso, cabe holgadamente en memoria de cualquier dispositivo.
- GPU recomendadas: no se requieren GPU. Un clasificador de esta magnitud se ejecuta en CPU sin problema.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) puede ejecutarlo, aunque es innecesaria.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador), y potencialmente `onnxruntime` con aceleración por GPU si se desea. No aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles. Dado el tamaño reducido del grafo y la entrada de 20 características, se espera latencia de microsegundos a milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de detección de falsificación documental publicados en abierto con características equiparables. Los clasificadores forenses de documentos suelen ser propietarios o formar parte de suites comerciales de verificación de identidad, por lo que la comparación directa no es posible con los datos disponibles.

## Limitaciones y advertencias

- La cifra de "Calibration Accuracy: 100.00%" no está respaldada por una metodología pública; debe tratarse con escepticismo y no como garantía de rendimiento en producción.
- No se especifica el dataset de entrenamiento, su tamaño, su procedencia ni su distribución, lo que impide evaluar sesgos y generalización.
- El modelo no procesa documentos directamente: depende de un pipeline externo que genere las 20 características de entrada, cuyo diseño no está documentado. Un desajuste en ese pipeline invalida las predicciones.
- Riesgo de falsos positivos y negativos desconocido al no publicarse matrices de confusión ni métricas por clase.
- El repositorio tiene cero descargas y cero likes, y un tamaño reportado de 0.0 GB, lo que puede indicar que los pesos no están efectivamente subidos o que la publicación está incompleta; conviene verificar la integridad del artefacto antes de usarlo.
- Licencia MIT: permite uso comercial y modificación, pero exime al autor de responsabilidad; para uso en producción con decisiones que afecten a personas (crédito, visados, alquiler) es necesario un marco de revisión humana y cumplimiento normativo (GDPR, AI Act).
- No hay información sobre idiomas ni sobre documentos de distintas jurisdicciones; la validez fuera del formato de extractos y nóminas con el que fue entrenado es incierta.
- No debe usarse como única evidencia en decisiones de fraude: es una señal de triaje, no un veredicto.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-BankStatement-SalarySlip-Tamper-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
