# mradermacher/ablation-83-bestofn.atlo-shisa-v2-llama-3.1-8b-lr8e6-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `shisa-ai/ablation-83-bestofn.atlo-shisa-v2-llama-3.1-8b-lr8e6`, un ajuste fino de Llama 3.1 8B realizado por Shisa AI como parte de sus experimentos de ablación sobre la técnica "best-of-N" aplicada a datos de conversación. El modelo original se entrenó sobre el dataset `shisa-ai/shisa-v2-best-of-n-athenev2-tulu70b-llama33-only`, una selección de respuestas generadas por modelos mayores (Athene v2 y Tulu 70B) filtradas por calidad mediante best-of-N. El empaquetador es mradermacher, conocido por publicar cuantizaciones GGUF de modelos comunitarios.

El interés práctico de esta ficha reside en la disponibilidad de pesos en formato GGUF con múltiples niveles de cuantización (desde Q2_K de 3,3 GB hasta f16 de 16,2 GB), lo que permite ejecutar un modelo de 8.030 millones de parámetros en hardware de consumo. Al derivar de Llama 3.1, hereda su ventana de contexto y su tokenizador, aunque el ajuste fino se centra en inglés conversacional.

Se trata de un artefacto de investigación con muy poca tracción (5 descargas, 1 like en el momento de la consulta) y sin benchmarks publicados en la información disponible. Es adecuado para experimentación y evaluación comparativa, no como modelo de producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens, no confirmado para este ajuste) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino de Llama 3.1 8B, un transformer decoder-only denso con 8.030 millones de parámetros. No se dispone de información detallada sobre hiperparámetros de entrenamiento (learning rate, número de pasos, composición exacta del dataset) más allá del identificador del modelo base, que sugiere un learning rate de 8e-6 y una variante de ablación numerada (83) dentro de una campaña experimental de Shisa AI.

El dataset de entrenamiento, `shisa-ai/shisa-v2-best-of-n-athenev2-tulu70b-llama33-only`, indica una estrategia de destilación o selección por best-of-N: se generan múltiples respuestas candidatas con modelos mayores (Athene v2 y Tulu 70B sobre Llama 3.3) y se seleccionan las mejores para el ajuste supervisado. No se documenta en la información disponible si hubo RLHF, DPO u otras fases de alineamiento adicionales. Las cuantizaciones son estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf); el autor indica que no hay cuantizaciones con imatrix/weighted disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado de Llama 3.1 8B y reforzado por el ajuste sobre datos de conversación.
- Generación de código y matemáticas a nivel de un modelo de 8B (no validado con benchmarks en este ajuste).
- Soporte de tool calling / function calling: no confirmado explícitamente para este ajuste; Llama 3.1 lo soporta de forma nativa, pero el ajuste fino puede haber alterado el formato.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Multilingüe: limitado a inglés según la model card (`language: en`).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Evaluación comparativa de ablaciones: usar el modelo como punto de control en experimentos que midan el efecto de la selección best-of-N frente al modelo base Llama 3.1 8B, con cuantización Q8_0 para minimizar la pérdida de calidad.
- Prototipado de asistentes conversacionales en inglés: desplegar la variante Q4_K_M (5,0 GB) en una estación de trabajo con GPU de consumo para validar flujos de diálogo antes de invertir en modelos mayores.
- Generación de datos sintéticos: emplear el modelo para producir respuestas candidatas en pipelines de destilación o aumento de datos, aprovechando su ajuste sobre datos filtrados por calidad.
- Investigación sobre cuantización: comparar la degradación de calidad entre Q2_K, IQ4_XS y Q8_0 sobre un mismo checkpoint para estudiar el impacto de la cuantización en tareas conversacionales.
- Despliegue en entornos con recursos limitados: servir el modelo con llama.cpp u Ollama en CPU o GPU modesta (Q3_K_S de 3,8 GB) para tareas de generación de texto no críticas.
- Fine-tuning adicional y experimentación académica: al estar bajo licencia Llama 3.1 y en formato GGUF, sirve como base para estudios de ajuste sobre dominios específicos en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (3,3 GB): ~4-5 GB.
  - Q4_K_M (5,0 GB): ~6-7 GB.
  - Q8_0 (8,6 GB): ~10-11 GB.
  - f16 (16,2 GB): ~18-20 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q8_0; RTX 4090 24 GB para f16; A100/H100 solo si se necesita alto throughput concurrente.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en tarjetas de 8-12 GB; f16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI no consumen GGUF de forma nativa (requieren el modelo base en safetensors).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ablation-83-bestofn.atlo-shisa-v2-llama-3.1-8b-lr8e6 (este) | 8,03 B | no disponible | llama3.1 | GGUF, safetensors | Ajuste experimental, sin benchmarks |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128.000 tokens | llama3.1 | safetensors, GGUF | Modelo base oficial, benchmarks publicados |
| Shisa v2 Llama 3.1 8B (shisa-ai) | ~8 B | no disponible | llama3.1 | safetensors | Familia de ajustes de Shisa AI; este es una ablación |
| Qwen2.5 7B Instruct | 7,6 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva y benchmarks públicos |

La comparación de rendimiento con estas alternativas no es posible con los datos disponibles; este checkpoint carece de evaluación publicada.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks: no hay evidencia publicada de su calidad frente al modelo base; puede degradar capacidades de Llama 3.1.
- Sesgos: hereda los sesgos de Llama 3.1 y los del dataset de destilación (Athene v2, Tulu 70B), no auditados en este ajuste.
- Riesgo de alucinación: inherente a modelos de 8B; sin evaluación específica para este checkpoint.
- Idioma: solo inglés según la model card; el rendimiento en castellano no está garantizado.
- Contexto: la longitud efectiva tras el ajuste no está documentada; no asumir 128.000 tokens sin validación.
- Licencia Llama 3.1: uso comercial permitido con condiciones (atribución, política de uso aceptable, umbral de 700 millones de usuarios mensuales); revisar el texto completo antes de desplegar.
- Tracción mínima (5 descargas, 1 like): sin validación comunitaria; tratar como artefacto experimental.
- Cuantizaciones estáticas sin imatrix: las variantes de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad conversacional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ablation-83-bestofn.atlo-shisa-v2-llama-3.1-8b-lr8e6-GGUF
- Modelo base (safetensors): https://huggingface.co/shisa-ai/ablation-83-bestofn.atlo-shisa-v2-llama-3.1-8b-lr8e6
- Dataset de entrenamiento: https://huggingface.co/datasets/shisa-ai/shisa-v2-best-of-n-athenev2-tulu70b-llama33-only
- Página de descargas del cuantizador: https://hf.tst.eu/model#ablation-83-bestofn.atlo-shisa-v2-llama-3.1-8b-lr8e6-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
