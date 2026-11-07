# rezapop/MARICL

## Resumen

MARICL (Multi-Agent Residual In-Context Learning) es un framework agéntico, no un modelo de pesos entrenados, publicado por MR Rezaei (usuario `rezapop` en Hugging Face) junto al paper arXiv:2605.22897, titulado *From Residuals to Reasons: LLM-Guided Mechanism Hypotheses from Tabular Data*. El repositorio de Hugging Face no contiene un checkpoint neuronal: es un paquete de código con `library_name: scikit-learn` y pipeline `tabular-regression`, con tamano de repo de 0.0 GB, es decir, sin pesos publicados. Su tesis central es que un LLM no debe sustituir al modelo tabular, sino depurar sus errores: se ajusta un modelo base (regresión lineal, XGBoost, etc.), los agentes leen los ejemplos con mayor residuo, formulan hipótesis sobre la estructura que falta y las escriben como fórmulas Python ejecutables en sandbox.

El flujo tiene cinco pasos: ajuste del modelo base, lectura de residuos por K agentes en paralelo, escritura de fórmulas, refinamiento iterativo (hasta T rondas, con umbral de fallo `tau_fail`) y predicción mediante el modelo base más una combinación ponderada de las fórmulas seleccionadas. La predicción final se expresa como \(\hat{y}(\mathbf{x}) = f_{\text{ML}}(\mathbf{x}) + \lambda(\mathbf{x}) \sum_k \alpha_k(\mathbf{x}) f_k(\mathbf{x})\), y en tiempo de inferencia no se invoca ningún LLM.

Es relevante para quien trabaja con datos tabulares y quiere modelos interpretables: las correcciones son legibles y auditables, no cajas negras. También para quien investiga el uso de LLMs como agentes de análisis más que como predictores. Los resultados del paper son honestos pero moderados: MARICL mejora a su modelo base en los nueve benchmarks, pero solo supera al mejor baseline en cinco de ocho conjuntos reales, y ninguna de esas ventajas es significativa tras corrección de Benjamini-Hochberg.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework agéntico sobre LLM (sin pesos propios); modelo base tabular + fórmulas Python generadas por agentes |
| Parametros totales | no disponible (no es un modelo neuronal con pesos publicados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del LLM que se conecte como backend) |
| Tipos de cuantizacion | no disponible (no aplica; no hay pesos) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de código; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

MARICL no entrena un transformer. Es un bucle agéntico que envuelve un modelo base supervisado (regresión lineal, logística o XGBoost en los ejemplos) y uno o varios LLM externos que actúan como "depuradores". El proceso: (1) se ajusta el modelo base; (2) los agentes examinan los ejemplos con mayor error residual y describen qué estructura falta; (3) cada hipótesis se convierte en una fórmula Python ejecutada en sandbox; (4) el LLM critica cada fórmula donde sigue fallando y la reescribe, en un bucle de "gradiente textual" multi-turno con parámetros `K` (agentes en paralelo), `kappa` (0.3 en los ejemplos), `T` (10 rondas) y `tau_fail` (0.1); (5) la predicción combina el modelo base con las fórmulas elegidas, ponderadas por funciones \(\lambda(\mathbf{x})\) y \(\alpha_k(\mathbf{x})\).

No hay datos de preentrenamiento propios: el "entrenamiento" es la generación y refinamiento de fórmulas guiado por el LLM configurado. El framework acepta modelos de chat estilo LangChain o un adaptador específico para Claude (`claude_backend.py`). Los experimentos del paper usan Claude Opus 5.5 como agente en los ejemplos sintéticos, y una de las conclusiones es que aproximadamente la mitad de la ganancia se conserva con características anonimizadas, sin contexto de dominio y con un modelo abierto pequeño. La selección de la mejor ronda de refinamiento se hace sobre validación mediante `select`, `select_classification` y `select_beta`, sin llamadas al LLM.

## Capacidades

- Regresión tabular: corrige los residuos de un modelo base numérico mediante fórmulas generadas por agentes.
- Clasificación tabular multiclase: variante con etiquetas enteras de 0 a C−1 y salida de probabilidades (`maricl_predict_proba`).
- Generación de hipótesis legibles: cada corrección es una fórmula Python ejecutable y auditable, no un ajuste opaco de pesos.
- Refinamiento iterativo multi-turno: los agentes critican y reescriben sus propias fórmulas donde fallan.
- Paralelismo de agentes: K agentes independientes ejecutados en paralelo por ronda.
- Integración con LLM externos: cualquier chat model estilo LangChain, o el adaptador para Claude incluido.
- Inferencia sin LLM: en predicción solo se ejecuta la fórmula, con coste y latencia de un modelo tabular.
- Reproducibilidad offline: los ejemplos sintéticos se replican sin clave de API.
- No soporta tool calling nativo, ni visión, ni audio, ni modo thinking: esas capacidades dependen del LLM que se conecte.

## Casos de uso

- Modelado tabular interpretable en dominios regulados (banca, seguros, sanidad): se ajusta un modelo base sencillo y MARICL produce correcciones en forma de fórmulas que un comité puede leer y validar, en lugar de un modelo opaco.
- Análisis de mecanismos en datos científicos: el ejemplo de proteína cell-free del paper muestra cómo los agentes proponen relaciones físicas plausibles a partir de los residuos, útiles como hipótesis para un experto de dominio.
- Mejora de baselines en competiciones y pipelines de ML: dado un XGBoost ya entrenado, MARICL añade términos de corrección seleccionados en validación, con ganancia medible sobre el modelo base.
- Auditoría de modelos existentes: los ejemplos de mayor residuo se convierten en explicaciones textuales de qué está fallando, aprovechables en revisión de modelos en producción.
- Prototipado rápido de features: las fórmulas generadas sugieren transformaciones e interacciones de variables que luego pueden implementarse de forma nativa en el pipeline.
- Docencia e investigación sobre agentes LLM: el bucle de gradiente textual y el sandbox de fórmulas sirven como banco de pruebas reproducible de razonamiento agéntico sobre datos estructurados.
- Clasificación con probabilidades calibradas: la variante `select_beta` ajusta el peso de las correcciones en validación, adecuada para scoring de riesgo con requisitos de calibración.

## Benchmarks y rendimiento

Datos publicados en la model card (medias sobre dos semillas en los sintéticos; cinco semillas en los reales):

| Tarea | Modelo base | XGBoost | MARICL | Mejor posible |
|---|---:|---:|---:|---:|
| Regresión sintética, R² test | 0.370 | 0.787 | 0.914 | 0.987 |
| Clasificación sintética, accuracy test | 0.448 | 0.900 | 0.938 | 0.990 |

Resultados agregados del paper: MARICL mejora a su modelo base en los nueve benchmarks evaluados; lidera al mejor baseline en cinco de los ocho conjuntos reales y queda por detrás de TabPFN en los otros tres. Tras corrección de comparaciones múltiples (Benjamini-Hochberg), ninguna de esas ventajas es significativa. Con características anonimizadas, sin contexto de dominio y con un modelo abierto pequeño, se conserva aproximadamente la mitad de la ganancia. No se han publicado resultados detallados por benchmark (MMLU, HumanEval, GSM8K y similares) en la información disponible, ya que no son tareas aplicables a este framework.

## Requisitos de hardware

- VRAM para inferencia: no aplica al framework en sí; en predicción solo corre el modelo base tabular (CPU suficiente para regresión lineal o XGBoost).
- VRAM para la fase de ajuste: depende del LLM conectado como agente. Con modelos abiertos pequeños puede ejecutarse en una GPU consumer; con Claude Opus 5.5 se usa API remota y no requiere GPU local.
- GPU recomendadas: ninguna específica para MARICL; para el backend LLM local, una RTX 4090 (24 GB) cubre modelos de hasta ~14B en cuantización de 4 bits; A100 o H100 para modelos mayores o mayor throughput de agentes.
- Cabe en GPU consumer: sí, tanto el modelo base como un LLM pequeño cuantizado.
- Opciones de despliegue: el paquete se instala con `pip install -r requirements.txt`; el modelo base puede servirse con scikit-learn, XGBoost o cualquier runtime compatible; el LLM con vLLM, llama.cpp, Ollama o TGI a través de un adaptador LangChain.
- Latencia y throughput: no disponibles. El coste dominante es el número de llamadas al LLM durante el ajuste (K agentes × T rondas × iteraciones de refinamiento); la predicción es tan rápida como el modelo base.

## Comparativa con modelos similares

| Aspecto | MARICL | TabPFN | XGBoost / LightGBM |
|---|---|---|---|
| Tipo | Framework agéntico sobre modelo base | Transformer preentrenado para tabular | Gradient boosting |
| Pesos publicados | No (solo código) | Sí | No (se entrenan por dataset) |
| Interpretabilidad | Alta (fórmulas legibles) | Baja | Media (importancia de variables) |
| Rendimiento en el paper | Lidera en 5 de 8 reales; pierde ante TabPFN en 3 | Referencia fuerte en tabular pequeño | Baseline sólido; superado por MARICL en sintéticos |
| Coste de inferencia | Bajo (solo modelo base) | Moderado (forward pass) | Bajo |
| Coste de ajuste | Alto (llamadas a LLM) | Nulo (in-context) | Bajo |
| Licencia | MIT | No disponible en la información | MIT / Apache-2.0 según implementación |

## Limitaciones y advertencias

- Las fórmulas son hipótesis legibles, no mecanismos validados: el propio autor recomienda revisarlas con un experto de dominio antes de confiar en ellas.
- Riesgo de explicaciones plausibles pero falsas: con nombres de variables desordenados, MARICL puede construir una historia convincente e incorrecta ("fluent is not correct").
- Las ventajas sobre el mejor baseline no son estadísticamente significativas tras corrección de comparaciones múltiples en los ocho benchmarks reales.
- El coste de ajuste es elevado: múltiples llamadas a LLM por dataset (K agentes × T rondas), con dependencia de un proveedor externo si se usa API.
- Solo documentado en inglés; sin soporte multilingüe declarado.
- Repo de 0.0 GB y 0 descargas: madurez y mantenimiento no verificables; sin releases ni issues públicas en la información disponible.
- La licencia MIT permite uso comercial del código, pero no cubre las condiciones del LLM subyacente ni de los datos empleados.
- No apto para datos no tabulares (texto, imagen, audio) ni como sustituto de un modelo predictivo de gran escala.
- El sandbox de ejecución de fórmulas debe revisarse en entornos de producción, ya que ejecuta código Python generado por un LLM.

## Enlaces

- Hugging Face: https://huggingface.co/rezapop/MARICL
- Perfil del autor: https://huggingface.co/rezapop/models
- Paper en arXiv: https://arxiv.org/abs/2605.22897
- Repositorio GitHub: https://github.com/MrRezaeiUofT/Multi_Agent_Residual_In_Context_Learning
- Ejemplos reproducibles sin API key: `examples/synthetic_data` (incluido en el repo)
- Referencia citada en el paper (weight-space programming): https://rikiyat.github.io/blog/weight-space-programming/
