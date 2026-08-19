# PSompong/llama-hredd-adverse-text-distilbert-onnx

## Resumen

El modelo `llama-hredd-adverse-text-distilbert-onnx` es un clasificador de texto especializado en la detección de daños a derechos humanos y medio ambiente en textos adversos, diseñado para tareas de debida diligencia de proveedores (HREDD). Desarrollado por PSompong, es un modelo estudiante destilado de un profesor Llama 3.3 70B y cuantizado a int8 en formato ONNX para ejecutarse íntegramente en el navegador mediante transformers.js, sin necesidad de servidor ni clave de API.

El modelo resuelve el problema de priorizar la atención humana en la revisión de noticias y alegaciones sobre posibles impactos negativos en la cadena de suministro. Clasifica un fragmento de texto en una de 16 categorías de daño (por ejemplo, trabajo forzoso, contaminación tóxica, deforestación) y se integra en un flujo de trabajo de screening supervisado por personas. Su relevancia actual radica en ofrecer una alternativa ligera y offline a modelos grandes de pago, manteniendo una precisión razonable en la detección de daños graves.

Arquitectónicamente se basa en DistilBERT base (uncased), con una ventana de contexto típica de 512 tokens y un tamaño de repositorio de 0,1 GB. Está licenciado bajo Apache 2.0 y soporta únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT base (uncased) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de DistilBERT: 512 tokens) |
| Tipos de cuantizacion | int8 (ONNX cuantizado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (onnx/model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder basado en DistilBERT base uncased, destilado de un profesor Llama 3.3 70B. La destilación transfiere el conocimiento del profesor grande a un estudiante compacto, que luego se cuantiza a int8 para reducir el tamaño y permitir inferencia en el navegador. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO. El repositorio solo incluye el grafo ONNX cuantizado; no se distribuye la versión fp32.

La salida es una de 16 clases de daño definidas en la taxonomía HREDD del SusTech Supplier Risk Screener. El modelo no emite niveles de riesgo (Low/Medium/High/Critical); estos se derivan posteriormente mediante una rúbrica de severidad en el flujo de screening.

## Capacidades

- Clasificación de texto adverso en 16 categorías de daño: biodiversidad, trabajo infantil, deforestación, discriminación, incidente fatal, trabajo forzoso, libertad de asociación, violencia de género, residuos peligrosos, sin daño, seguridad y salud no fatal, represalias, contaminación tóxica, trata, robo de salarios y agotamiento de agua.
- Detección de daños laborales y ambientales con precisión diferenciada (ver benchmarks).
- Ejecución offline en navegador mediante transformers.js con dtype `q8`.
- Integración con Python a través de onnxruntime.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- Monolingüe (inglés).

## Casos de uso

- Screening de proveedores en debida diligencia: el modelo analiza noticias y alegaciones sobre un proveedor y clasifica el tipo de daño potencial, permitiendo priorizar auditorías humanas en casos de alto riesgo.
- Monitoreo de medios adversos: integrado en un pipeline de scraping, clasifica automáticamente titulares y artículos sobre empresas para detectar señales de daños ambientales o laborales.
- Evaluación de cumplimiento ESG: ayuda a equipos de sostenibilidad a identificar incidentes relevantes en cadenas de suministro para reportes de impacto.
- Revisión de contratos y proveedores: como herramienta de apoyo, filtra textos de diligencia previa y marca aquellos que requieren revisión humana detallada.
- Análisis de quejas y denuncias: clasifica comunicaciones internas o externas sobre condiciones laborales o impactos ambientales para su gestión.
- Demostración educativa y prototipado: sirve como ejemplo de despliegue de un modelo de clasificación en el navegador sin backend, útil para talleres y pruebas de concepto.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (verificados: no):

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| HREDD 30-case gold set (offline) | Full gold detection (n=30), int8 ONNX | 0.667 (accuracy) |
| HREDD 30-case gold set (offline) | Labour detection (n=23), int8 ONNX | 0.652 (accuracy) |
| HREDD 30-case gold set (offline) | Environmental detection (n=7), int8 ONNX | 0.714 (accuracy) |
| HREDD 30-case gold set (offline) | Severe-trio Critical recall (n=18), int8 ONNX | 0.556 (recall) |
| HREDD 60-case gold set (offline, g30 + x2026) | Full gold detection (n=60), int8 ONNX | 0.7 (accuracy) |
| HREDD 60-case gold set (offline, g30 + x2026) | Severe-trio Critical recall (n=31), int8 ONNX | 0.548 (recall) |
| HREDD 60-case gold set (offline, g30 + x2026) | Harm-class accuracy (n=50), int8 ONNX | 0.36 (accuracy) |
| HREDD 60-case gold set (offline, g30 + x2026) | Harm-domain accuracy (n=60), int8 ONNX | 0.917 (accuracy) |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Modelo compacto (DistilBERT base, ~66M parámetros en fp32, ~66 MB en int8) que puede ejecutarse en CPU sin GPU.
- Inferencia en navegador mediante transformers.js (WebAssembly) sin necesidad de servidor.
- En Python, onnxruntime permite ejecución en CPU con latencia baja (del orden de milisegundos por texto corto).
- No requiere GPU dedicada; cualquier máquina moderna con navegador o Python es suficiente.
- Opciones de despliegue: transformers.js (navegador), onnxruntime (Python), o integración en pipelines de servidor con ONNX Runtime.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede considerar que compite con clasificadores de texto genéricos basados en DistilBERT, pero no hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Es una herramienta de apoyo al screening, no un sistema de decisión automatizada. No debe utilizarse para aprobar, despedir o incluir en listas negras a proveedores sin revisión humana.
- Solo soporta inglés; textos en otros idiomas pueden producir resultados incorrectos.
- La precisión de clase fina es limitada (harm-class accuracy de 0.36 en el conjunto de 60 casos), lo que indica confusión entre categorías similares.
- El recall para daños críticos (severe-trio) es moderado (0.548-0.556), por lo que puede omitir casos graves.
- No emite niveles de riesgo; el tier se calcula externamente mediante una rúbrica de severidad.
- El repositorio solo incluye el modelo cuantizado int8; no se distribuye la versión fp32, lo que puede afectar a la precisión en entornos que requieran mayor fidelidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está entrenado para un dominio específico (derechos humanos y medio ambiente) y puede no generalizar a otros dominios.

## Enlaces

- [HuggingFace - PSompong/llama-hredd-adverse-text-distilbert-onnx](https://huggingface.co/PSompong/llama-hredd-adverse-text-distilbert-onnx)
- [Demo del risk-screening tool - Supplier diligence · HREDD](https://supplier-risk-model.pages.dev)
