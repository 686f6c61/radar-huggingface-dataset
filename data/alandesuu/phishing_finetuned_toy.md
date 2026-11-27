# Alandesuu/phishing_finetuned_toy

## Resumen

Alandesuu/phishing_finetuned_toy es un modelo de clasificación de texto publicado en Hugging Face por el usuario Alandesuu. Por su identificador y sus etiquetas, está orientado a la detección de phishing, presumiblemente mediante la clasificación de textos (URLs, correos, mensajes) en categorías de riesgo. El modelo se distribuye en formato safetensors bajo la librería transformers y es compatible con text-embeddings-inference y endpoints.

Técnicamente se trata de un fine-tuning de DistilBERT, la variante destilada de BERT con 66.955.010 parámetros totales, según los datos reales del archivo de pesos. El repositorio ocupa 0,3 GB, lo que es coherente con un checkpoint de este tamaño en precisión estándar. La etiqueta arxiv:1910.09700 corresponde al artículo de DistilBERT (Sanh et al., 2019), que es la referencia arquitectónica del modelo base.

La relevancia de esta ficha es limitada y debe leerse con cautela: la model card es la plantilla automática de Hugging Face sin cumplimentar, no hay descargas registradas, la licencia no está declarada y no se han publicado datos de entrenamiento, evaluación ni benchmarks. Se trata, por tanto, de un modelo experimental o de prueba ("toy") cuya evaluación rigurosa no es posible con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens de entrada; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un transformer encoder de 6 capas obtenido por destilación de conocimiento de BERT-base, con aproximadamente 66 millones de parámetros. Está diseñado para tareas de comprennsión del lenguaje y clasificación, no para generación de texto. La cabecera de clasificación (text-classification) indica un fine-tuning supervisado sobre un conjunto de datos etiquetado, presumiblemente de phishing y no phishing.

No hay información disponible sobre el dataset de entrenamiento, el número de ejemplos, la composición de las clases, los hiperparámetros, el régimen de precisión ni si se aplicaron técnicas de aumento de datos o balanceo. Tampoco se documenta ningún proceso de RLHF, DPO ni evaluación posterior al entrenamiento. La model card no aporta ningún detalle técnico más allá de la plantilla por defecto.

## Capacidades

- Clasificación de texto binaria o multiclase orientada a la detección de phishing, según se deduce del identificador del modelo.
- Codificación de representaciones contextuales de hasta 512 tokens (límite arquitectónico de DistilBERT, no confirmado en la ficha del autor).
- Inferencia rápida y de bajo coste en CPU y GPU, adecuada para filtrado a gran escala.
- Compatibilidad con la librería transformers y con text-embeddings-inference.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no disponibles; el modelo base DistilBERT es principalmente inglés, pero no se confirma el idioma del fine-tuning.

## Casos de uso

- Filtrado de correo entrante: clasificar mensajes como phishing o legítimos antes de que lleguen a la bandeja de entrada, aprovechando el bajo coste de inferencia de un modelo de 67 millones de parámetros para procesar volúmenes altos en tiempo casi real.
- Análisis de URLs sospechosas: puntuar cadenas de texto o URLs extraídas de formularios y tickets de soporte para priorizar la revisión manual por parte del equipo de seguridad.
- Moderación de comentarios y mensajes en foros: detectar intentos de ingeniería social en publicaciones de usuarios y derivarlos a revisión.
- Enriquecimiento de alertas SIEM: integrar el clasificador como paso previo de triaje en pipelines de detección, reduciendo el número de alertas que llegan a los analistas.
- Prototipado y pruebas de concepto: al ser un modelo "toy" de pequeño tamaño, sirve para validar arquitecturas de clasificación y pipelines de despliegue antes de invertir en modelos mayores.
- Docencia y experimentación: ejemplo práctico de fine-tuning de DistilBERT para tareas de seguridad, útil en cursos y talleres.
- Clasificación por lotes en entornos con recursos limitados: su tamaño permite ejecutarlo en contenedores pequeños o incluso en CPU para procesar históricos de correos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (66,9 M de parámetros × 4 bytes), unos 0,15 GB en fp16 y menos de 0,1 GB en int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; una RTX 3060, RTX 4090, T4 o incluso una iGPU son suficientes. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference, Hugging Face Inference Endpoints; también es posible exportarlo a ONNX para inferencia en CPU.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alandesuu/phishing_finetuned_toy | 66,9 M | no disponible | Clasificación de phishing | no disponible | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face |
| Modelos de detección de phishing publicados en el Hub | variable | variable | Clasificación de phishing | variable | Hugging Face |

No se dispone de datos de rendimiento del modelo para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- La model card está sin cumplimentar: no hay información sobre datos de entrenamiento, evaluación, sesgos ni uso previsto.
- No se declara licencia, por lo que el uso comercial es incierto y potencialmente restringido; conviene contactar con el autor antes de usarlo en producción.
- No hay métricas de evaluación publicadas (precisión, recall, F1, AUC), lo que impide valorar su fiabilidad real en detección de phishing.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos sin calibrar.
- El modelo parece ser un experimento ("toy") con cero descargas; no hay evidencia de validación externa.
- El límite de 512 tokens de DistilBERT puede ser insuficiente para correos o documentos largos.
- Idiomas soportados no declarados; probablemente entrenado en inglés, pero no confirmado.
- No debe usarse como única capa de defensa en sistemas de seguridad en producción sin una evaluación previa sobre datos propios.

## Enlaces

- Hugging Face: https://huggingface.co/Alandesuu/phishing_finetuned_toy
- Paper de DistilBERT (referencia arquitectónica): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
