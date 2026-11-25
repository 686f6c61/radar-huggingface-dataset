# MhamedRayan/devsecops-transformer

## Resumen

DevSecOps Transformer (identificador `MhamedRayan/devsecops-transformer`) es un modelo de clasificación de texto derivado de `microsoft/codebert-base`, afinado para detectar vulnerabilidades en código fuente C/C++. Forma parte de un sistema de auditoría DevSecOps de tres agentes (métricas, transformer y gatekeeper) y se publica como el segundo componente de esa cadena. Con 124.647.170 parámetros y un peso de aproximadamente 476 MB en safetensors, es un modelo compacto pensado para integrarse en pipelines de análisis estático automatizado.

La arquitectura es `RobertaForSequenceClassification` con dos etiquetas (`SAFE` y `VULNERABLE`), una longitud máxima de 384 tokens y un umbral de decisión de 0,45. El entrenamiento combina CodeXGLUE defect detection con DiverseVul sobre código C/C++, priorizando el recall (0,8450) sobre la precisión (0,5804), lo que implica una tasa de falsos positivos deliberadamente alta.

Su relevancia actual reside en la creciente demanda de filtros rápidos y ligeros que reduzcan el volumen de revisiones manuales en seguridad de software. No obstante, la licencia figura como "other" sin especificar y el autor advierte que la versión del dataset no está fijada, lo que limita la reproducibilidad y el uso comercial directo sin aclaraciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `RobertaForSequenceClassification` (transformer encoder, base CodeBERT) |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens (truncado; solo los primeros 384 afectan a la puntuación) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de precisión completa) |
| Idiomas soportados | no disponible (entrenado sobre código C/C++; el texto natural no se especifica) |
| Licencia | other (sin especificar en la model card) |
| Formato de pesos | safetensors (`model.safetensors`, ~476 MB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa, concretamente la variante CodeBERT-base de Microsoft, adaptada mediante una cabeza de clasificación de secuencias con dos salidas. CodeBERT fue preentrenado con objetivos multimodales (MLM y reemplazo de tokens) sobre pares código-comentario en seis lenguajes de programación; este ajuste fino hereda esa representación y la especializa en la tarea binaria de detección de defectos.

El conjunto de entrenamiento combina CodeXGLUE defect detection con DiverseVul, ambos centrados en C/C++. La model card indica explícitamente que la versión del dataset no está fijada ("local snapshots, revisions not recorded"), lo que impide reproducir exactamente el ajuste. No se documentan detalles sobre número de tokens, composición exacta del corpus, ni si se aplicó RLHF, DPO o algún esquema de calibración de umbral. El umbral de 0,45 se fija manualmente para favorecer el recall, y el autor advierte que las salidas softmax no son probabilidades calibradas.

## Capacidades

- Clasificación binaria de código fuente C/C++ en las etiquetas `SAFE` (0) y `VULNERABLE` (1).
- Detección de patrones de vulnerabilidad en fragmentos de hasta 384 tokens, sin extracción manual de características.
- Integración como segundo agente en un pipeline DevSecOps de tres etapas (métricas, clasificador, gatekeeper).
- Salida de puntuación de riesgo (`transformer_risk_score`) y decisión booleana con umbral configurable.
- Compatibilidad con `transformers`, `text-embeddings-inference` y endpoints compatibles.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Filtro previo en revisión de pull requests: el modelo puntúa cada fragmento modificado en C/C++ y marca los que superan 0,45 para revisión manual, reduciendo el volumen de código que llega a los revisores de seguridad.
- Integración en CI/CD como paso de análisis estático: se ejecuta sobre el diff de cada commit y bloquea o etiqueta el merge cuando el clasificador detecta riesgo, actuando como gatekeeper automatizado.
- Priorización de hallazgos en escaneos SAST: dado que prioriza recall, se usa para descartar candidatos claramente seguros y concentrar el análisis humano en los positivos, aceptando falsos positivos como coste asumido.
- Auditoría de dependencias y código legacy: al ser un modelo ligero de ~476 MB, puede desplegarse en servidores modestos para revisar grandes volúmenes de código C/C++ heredado sin GPU dedicada.
- Generación de etiquetas de entrenamiento débil: las puntuaciones del modelo pueden usarse para preetiquetar corpus y alimentar modelos de seguridad más grandes o revisores humanos.
- Telemetría de seguridad en producción: el wrapper devuelve JSON con `transformer_risk_score`, `vulnerable`, `threshold` y `status`, lo que facilita registrar métricas de riesgo por release y detectar regresiones.
- Prototipado rápido de un auditor DevSecOps: al ser el agente intermedio de una arquitectura de tres componentes, sirve para validar pipelines completos antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son las métricas del conjunto de evaluación de la model card:

| Metrica | Valor |
|---|---|
| F1 | 0,6881 |
| Precision | 0,5804 |
| Recall | 0,8450 |
| ROC-AUC | 0,7475 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni se especifica el conjunto de evaluación exacto sobre el que se calcularon estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (476 MB de pesos) y en torno a 0,25 GB en FP16; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volúmenes moderados. Una RTX 4090, A100 o H100 están sobredimensionadas para este modelo y solo se justifican por agregación de peticiones.
- Cabe en GPU consumer de gama baja (GTX 1650, RTX 3050) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` (referencia), `text-embeddings-inference` y endpoints compatibles; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DevSecOps Transformer | 124,6 M | 384 tokens | Clasificación binaria de vulnerabilidades C/C++ | other (sin especificar) | Hugging Face |
| microsoft/codebert-base | ~125 M | 512 tokens | Representaciones de código (preentrenamiento) | MIT | Hugging Face |
| microsoft/graphcodebert-base | ~125 M | 512 tokens | Representaciones de código con estructura de grafo | MIT | Hugging Face |
| Modelos SAST comerciales (p. ej. SonarQube, Snyk) | no disponible | no disponible | Análisis estático multi-lenguaje | propietaria | Comercial |

La comparación con CodeBERT y GraphCodeBERT es la más directa por tamaño y origen: este modelo es un ajuste fino de CodeBERT para una tarea concreta, por lo que hereda su arquitectura pero no sus capacidades generativas. Frente a herramientas SAST comerciales, el modelo es mucho más ligero y especializado, pero carece de cobertura multi-lenguaje y de un motor de reglas verificable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre C/C++ de CodeXGLUE y DiverseVul, puede reflejar los sesgos de esos corpus.
- Riesgo de alucinación: no aplica en sentido generativo, pero el modelo puede producir falsos positivos y falsos negativos; el autor advierte que el recall priorizado implica falsos positivos esperados.
- Limitación de contexto: solo los primeros 384 tokens afectan a la puntuación; fragmentos más largos se truncan y pueden perder la parte vulnerable del código.
- Código fuera de C/C++ está fuera de distribución (out-of-distribution) y las predicciones no son fiables.
- Las salidas softmax no son probabilidades calibradas; el umbral de 0,45 es una elección manual, no un valor óptimo derivado de calibración.
- Licencia "other" sin especificar: no se puede asumir uso comercial libre; es necesario contactar con el autor antes de desplegarlo en producción.
- Reproducibilidad limitada: la versión del dataset no está fijada y no se registran revisiones.
- Modelo con 29 descargas y 0 likes: sin validación comunitaria ni auditoría independiente.
- No soporta tool calling, agentes, visión ni razonamiento multi-paso; su uso está restringido a clasificación de fragmentos de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MhamedRayan/devsecops-transformer
- Modelo base CodeBERT: https://huggingface.co/microsoft/codebert-base
- CodeXGLUE (benchmark de defect detection): https://github.com/microsoft/CodeXGLUE
- DiverseVul (dataset de vulnerabilidades): https://github.com/DiverseVul/DiverseVul
