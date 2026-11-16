# CobuildX-AI/cbx-rag-context-utilization-68M

## Resumen

`cbx-rag-context-utilization-68M` es un modelo de clasificación de texto desarrollado por CobuildX-AI, diseñado específicamente para evaluar sistemas RAG (Retrieval-Augmented Generation). Su tarea concreta es determinar qué frases del contexto recuperado han sido realmente utilizadas por la respuesta generada, devolviendo una puntuación por frase y una fracción de utilización agregada siguiendo la convención de RAGBench.

El modelo se construye mediante fine-tuning del encoder `jhu-clsp/ettin-encoder-68m`, un transformer encoder de 68 millones de parámetros, y forma parte de una familia de cuatro evaluadores RAG complementarios: fidelidad, relevancia de respuesta, relevancia de contexto y utilización de contexto. Su relevancia radica en que automatiza una métrica de evaluación RAG que tradicionalmente requiere anotación humana o LLMs de gran tamaño, con un coste computacional muy inferior.

Con 68,1 millones de parámetros y un repositorio de 0,3 GB, el modelo está pensado para ejecutarse en hardware modesto (una única GPU consumer o incluso CPU con cierta latencia), lo que lo hace viable como componente de pipelines de evaluación continua en producción. La versión actual es v0.1 y está publicada bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/ettin-encoder-68m`) |
| Parámetros totales | 68.145.666 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el wrapper usa fp16 en GPU y fp32 en CPU) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/ettin-encoder-68m`, un encoder de la familia ModernBERT de 68 millones de parámetros, y se ajusta finamente como clasificador a nivel de frase. La tarea consiste en recibir la pregunta, los pasajes de contexto y la respuesta, y emitir para cada frase del contexto una probabilidad calibrada (calibración isotónica ajustada sobre validación) que indica si la respuesta la utilizó. La fracción de utilización se calcula como la media de esas probabilidades calibradas.

El entrenamiento se realizó sobre los subconjuntos CUAD (contratos) y FinQA (informes financieros) del dataset RAGBench (CC BY 4.0): 1.530 respuestas CUAD y 12.502 respuestas FinQA en entrenamiento, con 510 y 2.294 respuestas de test respectivamente. Las etiquetas no fueron anotadas por humanos, sino revisadas por LLMs: para CUAD, voto mayoritario de RAGBench y dos pasadas de Claude Haiku; para FinQA se mantuvieron las etiquetas originales de RAGBench. Se realizaron auditorías ciegas con Claude Opus y Claude Sonnet sobre muestras. El wrapper incorpora un prefilter BM25 (perfil `contract`) que puntúa solo las 64 frases más cercanas a la pregunta y respuesta más sus vecinas, reteniendo el 98,8% de las frases utilizadas en validación mientras puntúa aproximadamente el 39% del total, con el mismo RMSE.

## Capacidades

- Clasificación a nivel de frase: indica si cada frase del contexto fue utilizada por la respuesta, con probabilidad calibrada.
- Cálculo de fracción de utilización de contexto según la convención de RAGBench.
- Procesamiento de documentos largos mediante prefilter BM25 (perfil `contract`) y segmentación por perfiles (`contract`, `financial`, `auto`).
- Aceptación de frases pre-segmentadas por el usuario para máxima precisión (evita el splitter interno).
- Soporte de dos perfiles de datos: contratos (documento único, CUAD-like) e informes financieros (múltiples pasajes cortos con números y tablas, FinQA-like).
- Inferencia en GPU (fp16) y CPU (fp32, 8 hilos).

## Casos de uso

- Evaluación automática de pipelines RAG en producción: el modelo permite medir qué proporción del contexto recuperado se aprovecha realmente en cada respuesta, detectando retrievers que aportan pasajes irrelevantes o generadores que ignoran información útil.
- Auditoría de calidad de asistentes documentales sobre contratos: con el perfil `contract` y el prefilter BM25, puede procesar documentos legales de cientos de frases (unas 414 frases por llamada) en 0,61 s en GPU, integrándose en revisiones periódicas de respuestas generadas.
- Análisis de sistemas de question answering financiero: el perfil `financial` está calibrado para pasajes cortos con tablas y cifras, útil para verificar si el modelo generador cita correctamente los datos numéricos recuperados.
- Detección de contextos redundantes o ruidosos: una fracción de utilización baja con una fracción de relevancia alta (medida con el modelo hermano `cbx-rag-context-relevance-68M`) señala que el generador desaprovecha contexto pertinente.
- Construcción de datasets de evaluación RAG a escala: al ejecutarse en CPU con 3,04 s por llamada sobre pasajes cortos, permite etiquetar grandes volúmenes sin depender de APIs de LLM.
- Componente en pipelines de CI/CD para regresión de calidad: al ser determinista y ligero, puede ejecutarse en cada cambio del sistema RAG para detectar degradaciones en la utilización de contexto.
- Investigación sobre atribución de fuentes: permite estudiar qué partes del contexto sustentan cada respuesta, complementando el evaluador de fidelidad de la misma familia.

## Benchmarks y rendimiento

Los resultados publicados en la model card (conjuntos de test, sin prefilter) incluyen métricas a nivel de frase. La información proporcionada se trunca en la tabla de resultados, por lo que solo se dispone de los siguientes datos:

| Test set | Métrica | Valor |
|---|---|---|
| CUAD | Sentence AUROC (con splitter del wrapper) | 0,981 |
| CUAD | Sentence AUROC (con splits de RAGBench) | 0,990 |
| FinQA | Sentence AUROC (con splitter del wrapper) | 0,995 |
| FinQA | Sentence AUROC (con splits de RAGBench) | 0,996 |
| CUAD | Answer RMSE (con splitter del wrapper) | 0,043 |
| CUAD | Answer RMSE (con splits de RAGBench) | 0,040 |
| FinQA | Answer RMSE (con splitter del wrapper) | 0,040 |
| FinQA | Answer RMSE (con splits de RAGBench) | 0,036 |

También se documenta el rendimiento del prefilter en validación: retiene el 98,8% de las frases utilizadas puntuando aproximadamente el 39% de las frases, con el mismo RMSE. La tabla completa de AUROC con intervalos de confianza al 95% y PR-AUC no está disponible en la información proporcionada.

Rendimiento de inferencia (modelo cargado):

| Entrada | GPU (NVIDIA TITAN RTX, fp16) | CPU (8 hilos, fp32) |
|---|---|---|
| Un contrato (unas 414 frases) | 0,61 s | 23,43 s |
| Varios pasajes cortos (unas 29 frases) | 0,12 s | 3,04 s |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp16 para los 68M de parámetros; el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; validado en NVIDIA TITAN RTX. Funciona en RTX 3060, RTX 4090, A100, H100 sin problema.
- Cabe holgadamente en GPU consumer e incluso en iGPU con suficiente memoria compartida.
- Despliegue: el wrapper oficial `cbx_rag_eval.py` (instalación vía `huggingface_hub` con `--revision v0.1`); al ser un encoder estándar en safetensors, es compatible con Transformers, y potencialmente con ONNX Runtime o llama.cpp tras conversión (no documentado oficialmente).
- Latencia: 0,12 s por llamada en GPU y 3,04 s en CPU para pasajes cortos; 0,61 s en GPU y 23,43 s en CPU para contratos de unas 414 frases.
- Throughput: no disponible de forma explícita; puede estimarse a partir de la latencia por llamada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbx-rag-context-utilization-68M | 68M | Utilización de contexto RAG | no disponible | Apache-2.0 | Hugging Face |
| cbx-rag-faithfulness-68M | 68M | Fidelidad de respuesta RAG | no disponible | Apache-2.0 | Hugging Face |
| cbx-rag-context-relevance-68M | 68M | Relevancia de contexto RAG | no disponible | Apache-2.0 | Hugging Face |
| cbx-rag-response-relevance-68M | 68M | Relevancia de respuesta RAG | no disponible | Apache-2.0 | Hugging Face |
| RAGAS (baseline en RAGBench) | no disponible | Métricas RAG | no disponible | no disponible | Framework |
| TruLens (baseline en RAGBench) | no disponible | Métricas RAG | no disponible | no disponible | Framework |

Los cuatro modelos CBX comparten el mismo encoder base y wrapper, diferenciándose en la tarea de evaluación. La model card menciona comparaciones con RAGAS, GPT-3.5 y TruLens usando las puntuaciones almacenadas en RAGBench, pero la tabla comparativa completa no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- Entrenado exclusivamente con datos de contratos (CUAD) e informes financieros (FinQA); su generalización a otros dominios (código, conversación, textos médicos) no está validada y requiere comprobación empírica.
- Las etiquetas de entrenamiento y test fueron generadas y revisadas por LLMs (Claude Haiku, Claude Opus, Claude Sonnet, gpt-5.4-mini), no por anotadores humanos, lo que introduce sesgos potenciales del modelo anotador.
- Riesgo de alucinación en la clasificación: las probabilidades son estimaciones estadísticas, no garantías; los autores advierten explícitamente contra su uso como única base para decisiones legales, financieras o de otro tipo consecuencial.
- La segmentación automática de frases reduce ligeramente la precisión frente a usar los splits originales de RAGBench (AUROC 0,990 → 0,981 en CUAD); se recomienda pasar frases pre-segmentadas para máxima exactitud.
- El prefilter BM25 del perfil `contract` puede omitir frases utilizadas fuera de las 64 más cercanas, aunque en validación retuvo el 98,8%.
- La elección de perfil (`contract` vs `financial`) afecta a los resultados; textos de otra forma requieren seleccionar el perfil más parecido y validar sobre datos propios.
- Versión v0.1: la API y los umbrales pueden cambiar en futuras revisiones; se recomienda fijar la revisión con `--revision v0.1`.
- Sin descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-rag-context-utilization-68M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Modelo hermano (fidelidad): https://huggingface.co/CobuildX-AI/cbx-rag-faithfulness-68M
- Modelo hermano (relevancia de respuesta): https://huggingface.co/CobuildX-AI/cbx-rag-response-relevance-68M
- Modelo hermano (relevancia de contexto): https://huggingface.co/CobuildX-AI/cbx-rag-context-relevance-68M
- Dataset RAGBench: https://huggingface.co/datasets/galileo-ai/ragbench
- Paper RAGBench (Friel et al., 2024): no disponible en la información proporcionada
- Repositorio de código del wrapper `cbx_rag_eval.py`: no disponible como enlace independiente en la información proporcionada
- Demo: no disponible en la información proporcionada
