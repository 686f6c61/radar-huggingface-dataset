# elnemer7/ElNeMeR-OnlineExam-AcademicIntegrity-Proctor-ONNX

## Resumen

ElNeMeR-OnlineExam-AcademicIntegrity-Proctor-ONNX es un modelo ONNX de clasificación binaria/multiclase orientado a la verificación de identidad y la detección de fraude en exámenes académicos en línea. Lo desarrolla Mahmoud ElNemer (ElNeMeR Digital Solutions & AI) como parte de una flota declarada de 60 modelos forenses y humanitarios (v17.0). El modelo recibe un tensor de 20 características de proctoring y devuelve probabilidades para tres clases: presencia auténtica del candidato, suplantación de identidad por un examinador proxy y anomalía compatible con ayuda por auricular.

El modelo no es un LLM generativo: es un clasificador tabular exportado a ONNX (opset 14), compatible con `onnxruntime` y `onnxruntime-web` vía WASM. Su relevancia radica en el despliegue ligero en entornos de examen (navegador o servidor modesto) para triaje automático de integridad académica, con una precisión de calibración declarada del 84,76 %.

La información pública disponible es muy escasa: el repositorio de Hugging Face ocupa 0,0 GB, no tiene descargas ni likes, no declara pipeline ni idiomas, y la model card no especifica arquitectura interna, datos de entrenamiento ni benchmarks comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular exportado a ONNX, opset 14) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de tensor fijo: `[batch_size, 20]`) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Se trata de un modelo ONNX con una única entrada documentada, `exam_proctor_features`, de tipo `float32` y forma `[batch_size, 20]`, y una salida de probabilidades sobre tres clases. Por el tamaño del repositorio (0,0 GB) y la naturaleza de la entrada, es plausible que se trate de un clasificador compacto (MLP o similar) sobre características tabulares, pero el autor no lo confirma.

No se publican datos sobre el conjunto de entrenamiento, número de muestras, composición del dataset, ni si hubo ajuste fino, calibración post-entrenamiento o técnicas de regularización. El único dato de rendimiento declarado es una "calibration accuracy" del 84,76 %, sin especificar el conjunto de validación ni la métrica exacta empleada.

## Capacidades

- Clasificación de integridad en exámenes en línea a partir de 20 características de proctoring.
- Distinción entre tres clases: `authentic_candidate_presence`, `proxy_test_taker_identity_mismatch` y `secondary_screen_earpiece_assist_anomaly`.
- Inferencia en servidor mediante `onnxruntime` y en navegador mediante `onnxruntime-web` (WASM).
- Procesamiento por lotes (`batch_size` configurable).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- No se documenta soporte multilingüe.

## Casos de uso

- Triaje de identidad en exámenes universitarios en línea: el modelo evalúa el vector de 20 características del proctor y marca posibles suplantaciones (`proxy_test_taker_identity_mismatch`) para revisión humana posterior.
- Detección de ayuda por auricular: la clase `secondary_screen_earpiece_assist_anomaly` permite priorizar sesiones sospechosas en paneles de supervisión.
- Verificación en tribunales de becas: integración en el flujo de validación de candidatos antes de la emisión de credenciales.
- Despliegue en navegador para proctoring ligero: gracias a la compatibilidad con `onnxruntime-web` (WASM), puede ejecutarse en el cliente sin enviar características sensibles al servidor.
- Filtro previo en pipelines de revisión manual: al devolver probabilidades, permite fijar umbrales y derivar solo los casos de mayor riesgo a revisores humanos.
- Auditoría forense posterior: análisis por lotes de registros de sesiones de examen para detectar patrones de fraude y generar informes de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato declarado por el autor es una precisión de calibración del 84,76 %, sin detalle del conjunto de evaluación ni de la métrica exacta.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,0 GB) y la entrada de 20 características, la huella es mínima y probablemente inferior a unos pocos MB.
- GPU recomendadas: no se requieren; el modelo puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU moderna e incluso en CPU; no se documentan requisitos específicos.
- Opciones de despliegue: `onnxruntime` (servidor), `onnxruntime-web` (navegador, WASM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificadores ONNX de integridad académica) con parámetros, contexto o rendimiento verificables.

## Limitaciones y advertencias

- Información pública muy limitada: no se documentan arquitectura, datos de entrenamiento, idiomas ni benchmarks, lo que dificulta una evaluación rigurosa.
- Riesgo de sesgo: al no publicarse la composición del dataset, no puede evaluarse el sesgo demográfico ni la equidad entre grupos de candidatos.
- Riesgo de falsos positivos y falsos negativos: una precisión de calibración del 84,76 % implica un margen de error no despreciable en un contexto con consecuencias académicas graves; se recomienda supervisión humana obligatoria.
- Sin validación independiente: el único dato de rendimiento procede del propio autor y no se especifica el protocolo de evaluación.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación, pero conviene revisar las condiciones del ecosistema del autor.
- Advertencia ética y legal: el uso de sistemas de proctoring automatizado está sujeto a normativa de protección de datos (RGPD en la UE) y a requisitos de transparencia; debe informarse a los candidatos y garantizarse el derecho a revisión humana.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-OnlineExam-AcademicIntegrity-Proctor-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
