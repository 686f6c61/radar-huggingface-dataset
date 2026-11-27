# elnemer7/ElNeMeR-Gold-Bullion-Hallmark-Invoice-Fraud-ONNX

## Resumen

ElNeMeR Gold Bullion Hallmark Invoice Fraud es un modelo ONNX de clasificación binaria/multiclase orientado a la detección de fraude en operaciones con lingotes de oro, facturas con contrastes falsificados y esquemas Ponzi relacionados con metales preciosos. Lo publica el ingeniero Mahmoud ElNemer bajo el paraguas de su proyecto "50-Model World Sovereign & Humanitarian Forensic AI Fleet", una flota de modelos forenses de carácter humanitario centrada en protección del consumidor y análisis digital.

El modelo no es un modelo de lenguaje ni un transformer generativo: se trata de un clasificador tabular que recibe un vector de 512 características en `float32` y devuelve probabilidades sobre tres clases (`legitimate_bullion_trade`, `below_spot_fake_gold_trap` y `counterfeit_hallmark_or_gold_ponzi`). Su formato es ONNX con opset 14, compatible con `onnxruntime` y `onnxruntime-web` (WASM), lo que permite desplegarlo tanto en servidor como en navegador.

Su relevancia radica en el nicho: ofrece una pieza lista para integrar en pipelines antifraude de comercio de metales preciosos, con licencia MIT y un tamaño de repositorio prácticamente nulo (0.0 GB), lo que sugiere un artefacto muy ligero. No obstante, la información pública disponible es mínima y no se documentan datos de entrenamiento, benchmarks independientes ni detalles de arquitectura interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador tabular; sin detalle de capas) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de vector fijo de 512 features) |
| Tipos de cuantizacion | No disponible (artefacto ONNX; se desconoce si admite cuantización INT8/FP16) |
| Idiomas soportados | No disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo más allá de su interfaz: una entrada `features` de tipo `float32` con forma `[batch_size, 512]` y una salida de probabilidades sobre tres clases. No se especifica si se trata de una red densa (MLP), un modelo lineal, un gradient boosting exportado a ONNX u otra familia. Tampoco se documentan el número de capas, las dimensiones ocultas ni la función de activación.

Respecto al entrenamiento, la model card no aporta datos sobre el volumen del dataset, su composición, el proceso de etiquetado ni si se aplicaron técnicas de regularización o calibración. El autor declara una "Calibration Accuracy" del 100.00%, pero no se indica sobre qué conjunto se midió ni se aporta metodología, por lo que ese dato debe tratarse con cautela. No se mencionan innovaciones técnicas como decodificación especulativa, atención lineal ni mecanismos híbridos, algo coherente con un clasificador tabular.

## Capacidades

- Clasificación de operaciones con oro en tres categorías: comercio legítimo de lingotes, trampa de oro falso por debajo del precio spot y contraste falsificado o esquema Ponzi de oro.
- Inferencia sobre vectores de 512 características numéricas (`float32`), pensada para integrarse con pipelines de extracción de features previos.
- Ejecución en servidor mediante `onnxruntime` y en navegador mediante `onnxruntime-web` (WASM), lo que habilita despliegues en cliente sin backend.
- Procesamiento por lotes (`batch_size` configurable en el tensor de entrada).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo generativo.
- No dispone de capacidades multilingües, visión, audio ni modo "thinking".

## Casos de uso

- Detección de anuncios de lingotes por debajo del precio spot: el modelo recibe features extraídas de la oferta (precio relativo al spot, reputación del vendedor, canal, metadatos de la factura) y devuelve la probabilidad de `below_spot_fake_gold_trap`, permitiendo bloquear listados sospechosos en marketplaces.
- Verificación de facturas con contraste de oro: integrado en un sistema de digitalización de facturas, el clasificador evalúa las features derivadas del documento (patrones del contraste, coherencia de sellos, importes) y marca posibles `counterfeit_hallmark_or_gold_ponzi`.
- Protección del consumidor en portales de reclamación: el modelo puede priorizar automáticamente los casos entrantes según la probabilidad de fraude, ayudando a los equipos de atención a triaje.
- Filtro previo en pasarelas de pago especializadas en metales: como capa de scoring de bajo coste antes de una revisión manual, dado su tamaño reducido y compatibilidad ONNX.
- Despliegue en navegador para herramientas de autoevaluación: mediante `onnxruntime-web`, un usuario podría comprobar si una oferta o factura presenta patrones de fraude sin enviar datos a un servidor.
- Análisis forense batch en investigaciones: procesar grandes volúmenes de registros históricos de transacciones con oro para identificar patrones compatibles con esquemas Ponzi.
- Integración en sistemas de cumplimiento (AML/KYC) para metales preciosos: añadir una señal adicional de riesgo a las reglas existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato declarado por el autor es una "Calibration Accuracy" del 100.00%, sin especificar conjunto de validación, métrica exacta ni metodología, por lo que no se presenta como benchmark comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el repositorio ocupa 0.0 GB y la entrada es un vector de 512 `float32` (2 KB por muestra), por lo que el modelo debería caber holgadamente en cualquier GPU consumer, e incluso ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA para `onnxruntime` es suficiente. Para despliegues en navegador, no se requiere GPU.
- Cabe en GPU consumer: sí, con total seguridad, dado el tamaño del artefacto, aunque no se dispone de cifras exactas de parámetros.
- Opciones de despliegue: `onnxruntime` (Python/C++/C#), `onnxruntime-web` (WASM) para navegador, y potencialmente `onnxruntime-gpu` si se requiere aceleración.
- Latencia y throughput estimados: no disponibles. Por la naturaleza del modelo (clasificador tabular de 512 features), se espera latencia de milisegundos o inferior por lote, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada modelos comparables de la misma categoría (detección de fraude en oro y contraste) publicados con especificaciones verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ElNeMeR Gold Bullion Hallmark Invoice Fraud (ONNX) | No disponible | No aplica | MIT | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan arquitectura, datos de entrenamiento, métricas ni metodología de calibración, lo que dificulta una evaluación rigurosa.
- La cifra de "Calibration Accuracy: 100.00%" no está respaldada por un conjunto de validación descrito ni por métricas estándar (precisión, recall, F1, AUC); debe considerarse no verificada.
- Riesgo de sesgo desconocido: al no publicarse la composición del dataset, no puede evaluarse el sesgo geográfico, de canal o de tipo de operación.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos/negativos en la clasificación, sin datos publicados sobre tasas de error.
- Dependencia de la calidad del extractor de features: el modelo solo clasifica vectores de 512 dimensiones; su rendimiento real dependerá del pipeline previo que genere esas features, no documentado.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero sin garantías; conviene revisar si el autor impone condiciones adicionales en su plataforma.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- No apto para decisiones automatizadas de alto impacto sin supervisión humana, dado el contexto financiero y la falta de benchmarks independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Gold-Bullion-Hallmark-Invoice-Fraud-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
