# NeoSapian/nirnay

## Resumen

Nirnay es un modelo de clasificación de texto y toma de decisiones financieras desarrollado por NeoSapian, construido sobre la arquitectura Qwen 3.5 (tag `qwen3_5_text`) con aproximadamente 1.000 millones de parámetros. El modelo está especializado en generar decisiones tipadas ("typed decisions") con probabilidades calibradas, orientado a clasificación financiera, evaluación de riesgo y análisis de sentimiento. Su propuesta diferencial no es la generación libre de texto, sino la emisión de salidas estructuradas y cuantificadas que un sistema posterior puede consumir directamente en pipelines de decisión.

El modelo se distribuye con licencia "other" y acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo. Solo declara soporte para inglés (`en`) y se publica en formato safetensors bajo la librería transformers, con un tamaño de repositorio de 2,0 GB. Su pipeline declarado es `text-classification`, aunque hereda la base de un modelo de la familia Qwen 3.5, lo que sugiere un fine-tuning sobre esa arquitectura.

Es relevante ahora porque cubre un nicho poco atendido: modelos pequeños (≈1B) que producen salidas probabilísticas calibradas y tipadas para decisiones financieras, en lugar de texto conversacional. Esto facilita su despliegue en entornos con recursos limitados y su integración en sistemas de scoring, alertas y evaluación de riesgo donde la interpretabilidad numérica es más importante que la fluidez generativa. No obstante, la ausencia de benchmarks publicados y de documentación técnica detallada limita la evaluación objetiva de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3.5 (tag `qwen3_5_text`), transformer |
| Parametros totales | 1.006.672.704 (~1,0B) |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | en (inglés) |
| Licencia | other (acceso restringido/gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta como `qwen3_5_text`, lo que indica que parte de la arquitectura de texto de la familia Qwen 3.5, es decir, un transformer denso. Con 1.006.672.704 parámetros totales y un repositorio de 2,0 GB en safetensors, el tamaño de pesos es coherente con un modelo denso de ~1B en precisión de 16 bits. No se especifica si emplea atención lineal, decodificación especulativa ni ninguna otra innovación de eficiencia.

No hay información pública en la ficha sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni el procedimiento de ajuste fino. Los tags sugieren un entrenamiento orientado a clasificación financiera, calibración de probabilidades, evaluación de riesgo, análisis de sentimiento y análisis de cartera, pero no se detalla la metodología. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo indicado sería especulativa y, por tanto, se declara como no disponible.

## Capacidades

- Clasificación de texto financiero: el pipeline declarado es `text-classification`, orientado a etiquetar documentos o fragmentos del dominio financiero.
- Decisiones tipadas ("typed decisions"): emisión de salidas estructuradas con tipos definidos, pensadas para consumo programático.
- Probabilidades calibradas: el modelo declara calibración de probabilidad, útil para umbrales de decisión y scoring de riesgo.
- Evaluación de riesgo ("risk-assessment") según los tags del repositorio.
- Análisis de sentimiento ("sentiment-analysis") aplicado a texto financiero.
- Análisis de cartera ("portfolio-analysis") como caso de uso etiquetado.
- Inteligencia de decisión ("decision-intelligence") y clasificación financiera ("financial-classification").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Clasificación de noticias y comunicados financieros: el modelo puede etiquetar titulares y notas de prensa por categoría (positivo/negativo/neutro, tipo de evento), aprovechando su pipeline de `text-classification` y su especialización declarada en sentimiento financiero.
- Scoring de riesgo de contrapartes: con salidas probabilísticas calibradas, puede asignar una probabilidad de riesgo a fragmentos de informes o expedientes, permitiendo fijar umbrales de alerta en un sistema de compliance.
- Análisis de sentimiento de mercado: procesamiento de transcripciones de resultados, informes trimestrales o comentarios de analistas para generar señales de sentimiento agregadas en un pipeline de trading o research.
- Enrutamiento y triaje documental: clasificación de documentos entrantes (facturas, contratos, informes) en categorías tipadas antes de derivarlos a un sistema de gestión documental, gracias a la salida estructurada con tipos definidos.
- Evaluación de cartera asistida: análisis de descripciones de posiciones y comentarios de gestores para extraer etiquetas de riesgo y sentimiento que alimenten un panel de seguimiento de cartera.
- Moderación y filtrado de contenido financiero: clasificación de mensajes o publicaciones en foros y redes para detectar contenido de riesgo o categorías concretas, con probabilidades calibradas que permiten ajustar la sensibilidad del filtro.
- Extracción de señales en pipelines de decisión automatizada: al emitir decisiones tipadas con probabilidad, puede integrarse como componente de scoring en sistemas que requieran decisiones auditables y numéricamente interpretables en lugar de texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,0B parámetros, en FP16 se requieren aproximadamente 2 GB solo para pesos, más overhead de activaciones y contexto; en cuantización de 8 bits, en torno a 1 GB de pesos; en 4 bits, alrededor de 0,5-0,6 GB de pesos. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con contexto moderado; tarjetas consumer como RTX 3060, RTX 4060, RTX 4090 son suficientes. Para despliegue en servidor, A100/H100 no son necesarias por tamaño, pero pueden aportar throughput en batching.
- ¿Cabe en consumer GPU? Sí, con holgura: un modelo de ~1B en FP16 cabe en GPUs consumer de gama media; en cuantización 4/8 bits cabe incluso en GPUs de 4 GB o en CPU.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información proporcionada. Dado que solo se publican safetensors, sería necesario convertir a GGUF para llama.cpp/Ollama, y no se documenta dicha conversión.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeoSapian/nirnay | ~1,0B | no disponible | Clasificación financiera / decisiones tipadas | other (gated) | Hugging Face, acceso restringido |
| Qwen 2.5-1.5B / Qwen 3 base ~1B | ~1-1,5B | no disponible en esta ficha | Generación de texto general | Apache 2.0 (según variante) | Hugging Face, acceso abierto |
| FinBERT | ~110M | 512 tokens | Clasificación de sentimiento financiero | Apache 2.0 | Hugging Face, acceso abierto |
| DeBERTa-v3-base fine-tuned financiero | ~184M | 512 tokens | Clasificación / NER financiero | MIT/Apache según variante | Hugging Face, acceso abierto |

La comparación es orientativa: no se dispone de benchmarks de nirnay que permitan contrastar calidad frente a FinBERT o variantes de Qwen. La principal diferencia es la propuesta de salidas tipadas con probabilidades calibradas y su tamaño intermedio (~1B), mayor que FinBERT pero menor que modelos generativos de 7B o más.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse presumiblemente con datos financieros en inglés, puede heredar sesgos de ese dominio y de las fuentes utilizadas.
- Riesgo de alucinación: aunque el pipeline es de clasificación, el modelo se construye sobre una base generativa Qwen 3.5; si se usa fuera del pipeline declarado, podría producir salidas no fieles. No hay evaluación publicada de fiabilidad.
- Limitaciones de contexto e idioma: solo declara inglés; la longitud de contexto no está documentada, lo que impide planificar su uso con documentos largos.
- Restricciones de licencia: licencia "other" y acceso gated; es imprescindible revisar los términos en Hugging Face antes de cualquier uso comercial. No se garantiza permiso de uso comercial ni de redistribución.
- Ausencia de benchmarks: no hay métricas publicadas de precisión, calibración (ECE, Brier score) ni evaluación de sesgo, lo que impide validar las afirmaciones de "probabilidades calibradas".
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (24 de noviembre de 2026), lo que sugiere un artefacto recién publicado y sin validación comunitaria.
- Producción: al no documentarse cuantizaciones, formatos GGUF ni servidores de inferencia compatibles, la integración en producción requiere trabajo adicional de conversión y validación.

## Enlaces

- Hugging Face: https://huggingface.co/NeoSapian/nirnay
- Paper: no disponible
- Blog: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
