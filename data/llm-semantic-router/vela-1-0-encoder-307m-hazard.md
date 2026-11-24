# llm-semantic-router/Vela-1.0-Encoder-307M-Hazard

## Resumen

Vela-1.0-Encoder-307M-Hazard es un modelo encoder de clasificación de texto especializado en la detección de riesgos de contenido. Lo desarrolla el proyecto vLLM Semantic Router y se distribuye bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo base vllm-sr/Vela-1.0-Encoder-307M, que a su vez deriva de la arquitectura ModernBERT, y está diseñado para integrarse como componente de enrutamiento semántico y filtrado de seguridad en pipelines de inferencia LLM.

El modelo devuelve 12 puntuaciones de riesgo independientes mediante activación sigmoide, de modo que una misma entrada puede activar varias categorías simultáneamente. Su capacidad de entrada es de 32.768 tokens (incluyendo tokens especiales), aunque la política operativa recomendada por el autor trabaja con ventanas de 2.048 tokens y un desplazamiento de 1.023 tokens de contenido, aplicando el máximo por categoría y umbrales predefinidos.

Su relevancia actual radica en que cubre una necesidad concreta en despliegues de LLM en producción: la clasificación rápida y ligera de contenido sensible antes o después de la generación. Con 307 millones de parámetros, es un modelo pequeño comparado con los LLM generativos, lo que permite ejecutarlo en CPU o en GPU de gama media con latencia baja, y el autor reporta mejoras sustanciales frente al modelo de referencia en las categorías de riesgo compartidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 307.539.468 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens de capacidad de entrada (incluyendo tokens especiales); ventana operativa recomendada de 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y ONNX; no se documentan cuantizaciones específicas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ModernBERT, un encoder transformer con atención de soporte para contextos largos y mejoras de eficiencia respecto a BERT clásico. La cabeza de clasificación produce 12 salidas independientes de riesgo, cada una con activación sigmoide en lugar de softmax, lo que permite que varias categorías se activen sobre el mismo texto. El modelo base es vllm-sr/Vela-1.0-Encoder-307M y este checkpoint es un fine-tuning orientado a detección de contenido peligroso.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La evaluación publicada se realizó sobre 57 peticiones de desarrollo repartidas en cinco categorías de riesgo compartidas (autolesión, odio, consejo especializado, privacidad y desinformación), con 39 familias de peticiones. El autor indica explícitamente que esta comparación mide clasificación y ranking en categorías compartidas, no la detección completa de las 12 categorías, el rechazo de entradas benignas ni la precisión en contexto largo. Como innovación operativa, se documenta una política de ventanas deslizantes con agregación por máximo y umbrales guardados en operating_point.json.

## Capacidades

- Clasificación de contenido de riesgo en 12 categorías independientes mediante puntuaciones sigmoides.
- Detección multi-etiqueta: varias categorías pueden aplicar al mismo texto simultáneamente.
- Procesamiento de textos largos mediante ventanas deslizantes de 2.048 tokens con desplazamiento de 1.023 tokens de contenido y agregación por máximo.
- Clasificación en cinco categorías de riesgo evaluadas explícitamente: autolesión, odio, consejo especializado, privacidad y desinformación.
- Integración como componente de enrutamiento semántico en el stack de vLLM Semantic Router.
- Inferencia en CPU o GPU (el ejemplo de la model card usa device=-1, es decir, CPU).
- Exportación a ONNX para despliegue en entornos sin PyTorch.
- Compatibilidad con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- Soporte de tool calling, agentes o generación de texto: no disponible (es un modelo exclusivamente de clasificación).

## Casos de uso

- Moderación de contenido en plataformas: el modelo clasifica mensajes de usuario en 12 categorías de riesgo con puntuaciones independientes, permitiendo aplicar políticas diferenciadas por categoría en lugar de un único filtro binario.
- Guardarraíl de entrada en pipelines LLM: antes de enviar una petición a un modelo generativo, el encoder la evalúa en pocos milisegundos y el sistema puede bloquear, redirigir o marcar la petición según los umbrales de operating_point.json.
- Guardarraíl de salida tras la generación: se clasifica la respuesta del LLM para detectar autolesión, odio, privacidad o desinformación antes de mostrarla al usuario final.
- Enrutamiento semántico en vLLM Semantic Router: el modelo actúa como clasificador dentro del router para decidir qué modelo o política de seguridad aplicar a cada consulta, aprovechando su tamaño reducido para no añadir latencia significativa.
- Cumplimiento y auditoría: procesamiento por lotes de registros históricos de conversaciones para etiquetar riesgos y generar informes de cumplimiento, usando la ventana deslizante para textos largos.
- Filtrado de datasets de entrenamiento: clasificación de grandes corpus para eliminar o aislar contenido de riesgo antes de usarlos en el entrenamiento de otros modelos.
- Análisis de documentación sensible: detección de exposiciones de privacidad o consejo especializado en textos de dominio médico, legal o financiero, con la política de ventanas para documentos que superan los 2.048 tokens.

## Benchmarks y rendimiento

Evaluación sobre 57 peticiones de desarrollo en cinco categorías de riesgo compartidas (autolesión, odio, consejo especializado, privacidad y desinformación), comparando con el mmBERT original del que deriva:

| Metrica (%) | mmBERT original | Vela Hazard |
|---|---:|---:|
| Macro F1 en cinco categorias | 65,12 | 96,73 |
| Precision en cinco categorias | 61,40 | 98,25 |
| Media macro de precision | 90,96 | 91,27 |

El autor advierte que esta comparación mide clasificación y ranking en categorías compartidas, no la detección completa de las 12 categorías, el rechazo de entradas benignas ni la precisión en contexto largo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp16 (307M parámetros) y alrededor de 1,2 GB en fp32; el repo ocupa 2,5 GB por incluir múltiples formatos (safetensors y ONNX).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; el modelo es sobradamente pequeño para todas ellas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: viable para inferencia en producción dado el tamaño del modelo; el ejemplo de la model card usa CPU (device=-1).
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime, text-embeddings-inference y endpoints compatibles según los tags del repositorio. No se documenta soporte explícito de vLLM, llama.cpp u Ollama para este encoder.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Hazard | 307M | 32.768 tokens de entrada (ventana operativa 2.048) | Clasificación de riesgo multi-etiqueta (12 categorías) | Apache 2.0 | Hugging Face |
| mmBERT safety binary hazard (vllm-sr) | no disponible | no disponible | Clasificación de seguridad binaria | no disponible | Hugging Face |
| jhu-clsp/mmBERT-base | no disponible | no disponible | Encoder base multilingüe | no disponible | Hugging Face |

La comparación directa disponible en la model card se limita al modelo mmBERT original, con los resultados de la tabla de benchmarks. No se dispone de datos de otros clasificadores de seguridad comparables en la información proporcionada.

## Limitaciones y advertencias

- La evaluación publicada cubre solo cinco de las doce categorías y 57 peticiones; no hay datos sobre el rendimiento en las siete categorías restantes, en el rechazo de entradas benignas ni en contexto largo.
- El modelo devuelve puntuaciones sigmoides independientes; usar softmax sobre ellas produciría resultados incorrectos.
- Para textos que superan los 2.048 tokens debe aplicarse la política de ventanas de operating_point.json; truncar sin más puede perder contenido de riesgo.
- No se documentan los idiomas soportados ni la composición del dataset de entrenamiento, por lo que el comportamiento multilingüe es desconocido.
- Riesgo de sesgos y de falsos positivos o negativos en las categorías de riesgo: no se publican métricas de calibración ni de robustez frente a evasión.
- Riesgo de alucinación: no aplica en sentido generativo, pero las puntuaciones de riesgo pueden ser erróneas y no deben usarse como única base para decisiones legales o disciplinarias.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para fines de moderación regulada.
- El modelo es un fine-tuning de un checkpoint intermedio; los tags del repositorio apuntan a vllm-sr/Vela-1.0-Encoder-307M mientras que el ejemplo de código de la model card usa llm-semantic-router/Vela-1.0-Encoder-307M-Hazard, por lo que conviene verificar el identificador correcto al desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Hazard
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M
- Colección Vela: https://huggingface.co/collections/vllm-sr/vela-10-router-models-6aa555ba70cc6997d6d67798
- Documentación de vLLM Semantic Router: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
- Modelo de comparación mmBERT safety binary hazard: https://huggingface.co/vllm-sr/mmbert-safety-binary-hazard
- Encoder base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
