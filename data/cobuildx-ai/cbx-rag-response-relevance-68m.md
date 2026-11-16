# CobuildX-AI/cbx-rag-response-relevance-68M

## Resumen

cbx-rag-response-relevance-68M es un clasificador de texto de 68 millones de parámetros desarrollado por CobuildX-AI, diseñado específicamente para evaluar sistemas RAG (Retrieval-Augmented Generation). Su tarea concreta es determinar si una respuesta generada aborda realmente la pregunta formulada, devolviendo una de tres etiquetas con sus probabilidades asociadas: `direct` (la respuesta atiende lo que se pregunta), `partial` (responde solo en parte o de forma vaga) o `irrelevant` (no aborda la pregunta). Es relevante porque la evaluación automática de pipelines RAG es uno de los cuellos de botella operativos más habituales al desplegar sistemas de generación aumentada.

El modelo se construye mediante fine-tuning del encoder jhu-clsp/ettin-encoder-68m, una arquitectura ModernBERT de 68.146.179 parámetros. Forma parte de una familia de cuatro evaluadores RAG complementarios (faithfulness, response relevance, context relevance y context utilization) que comparten el mismo wrapper Python, `cbx_rag_eval.py`, y el mismo modelo base. Su ventana de contexto y su entrenamiento están orientados a pares pregunta-respuesta en inglés.

La propuesta de valor es sustituir o complementar métricas basadas en LLM pesados (como RAGAS con GPT-3.5) por un clasificador pequeño, rápido y desplegable en CPU o GPU modesta, con latencias del orden de 0,02 s en GPU y 0,04 s en CPU por par pregunta-respuesta. La versión actual es v0.1 y la licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parámetros totales | 68.146.179 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el wrapper admite fp32 en CPU y fp16 en GPU) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT afinado para clasificación de tres clases (direct, partial, irrelevant). ModernBERT incorpora mejoras sobre el transformer encoder clásico, como atención con rotación posicional y capas optimizadas para secuencias largas, aunque la model card no detalla la configuración específica de capas ni la longitud máxima de secuencia. Los pesos se distribuyen en safetensors y el repositorio ocupa 0,3 GB.

El entrenamiento se realizó sobre un conjunto propio denominado rr-v0.1, en el que Claude Haiku generó respuestas variadas a las preguntas de RAGBench y las etiquetó. RAGBench se apoya en los subconjuntos CUAD (contratos) y FinQA (informes financieros), ambos bajo CC BY 4.0 y MIT respectivamente. El conjunto de entrenamiento incluyó 1.530 respuestas de CUAD y 12.502 de FinQA; el de test, 510 de CUAD (102 contratos) y 2.294 de FinQA, sumando 4.200 pares pregunta-respuesta en el test de rr-v0.1. Las etiquetas fueron revisadas por LLM (Claude Haiku, gpt-5.4-mini, Claude Opus y Claude Sonnet en auditorías ciegas), no por anotadores humanos, y todos los umbrales y ajustes se fijaron sobre validación. El modelo no ve el contexto de recuperación, por lo que no puede juzgar si una negativa a responder era apropiada; en entrenamiento, una negativa contó como `direct` solo cuando el contexto carecía realmente de la respuesta.

## Capacidades

- Clasificación de relevancia de respuesta en tres clases con probabilidades: `direct`, `partial`, `irrelevant`.
- Evaluación de pares pregunta-respuesta sin necesidad de contexto recuperado.
- Procesamiento por lotes mediante `judge.batch([(q1, a1), (q2, a2)])`.
- Integración en pipelines de evaluación RAG junto a los otros tres modelos de la familia (faithfulness, context relevance, context utilization).
- Perfiles de configuración `contract` (documento único tipo contrato), `financial` (varios pasajes cortos con números y tablas) y `auto` (selección automática según número de pasajes).
- Inferencia rápida: 0,02 s por llamada en GPU NVIDIA TITAN RTX con fp16 y 0,04 s en CPU de 8 hilos con fp32.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido; es un clasificador, no un modelo generativo.

## Casos de uso

- Monitorización de calidad en producción RAG: ejecutar el clasificador sobre cada par pregunta-respuesta servido por el sistema para detectar respuestas evasivas o fuera de tema, con un coste computacional mínimo (0,04 s en CPU) que permite muestrear el 100 % del tráfico.
- Evaluación de regresiones en CI/CD: incluir el modelo en la batería de tests de un pipeline RAG para bloquear despliegues que degraden la tasa de respuestas `direct` respecto a la línea base.
- Comparación de variantes de prompting: medir cómo cambia la distribución de etiquetas al modificar la plantilla de instrucciones del generador, manteniendo el mismo recuperador.
- Auditoría de contratos: usar el perfil `contract` para verificar que las respuestas de un asistente legal sobre cláusulas de un contrato abordan la pregunta formulada, complementando el evaluador de faithfulness para descartar alucinaciones.
- Análisis de informes financieros: con el perfil `financial`, evaluar respuestas numéricas extraídas de tablas y estados financieros, detectando respuestas parciales que omiten la cifra solicitada.
- Construcción de datasets de evaluación: filtrar y etiquetar automáticamente grandes volúmenes de pares pregunta-respuesta para crear conjuntos de test curados antes de una revisión humana.
- Enrutado de consultas: usar la etiqueta `irrelevant` como señal para reintentar la recuperación o escalar a un humano cuando el generador no responde a la pregunta.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test rr-v0.1 (4.200 pares pregunta-respuesta):

| Conjunto de test | Macro-F1 [IC 95 %] | Accuracy | F1 direct / partial / irrelevant |
|---|---|---|---|
| Preguntas CUAD | 0,767 [0,74; 0,79] | 0,867 | 0,90 / 0,49 / 0,91 |
| Preguntas FinQA | 0,850 [0,84; 0,86] | 0,881 | 0,94 / 0,71 / 0,91 |

El autor advierte que la mayoría de las respuestas del test fueron escritas y etiquetadas por Claude Haiku en el mismo estilo que el entrenamiento, por lo que estas cifras son optimistas y cabe esperar puntuaciones inferiores en datos reales. La clase `partial` es claramente la más débil (F1 de 0,49 en CUAD). No se han publicado comparaciones directas contra RAGAS, GPT-3.5 o TruLens en esta información; la model card menciona que esas puntuaciones baseline provienen de RAGBench y no se han reejecutado.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp16 para los 68 M de parámetros; el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor reporta mediciones en NVIDIA TITAN RTX con fp16.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, así como en iGPU recientes.
- Despliegue en CPU viable: 0,04 s por par pregunta-respuesta con 8 hilos en fp32, lo que permite ejecutarlo en servidores sin GPU.
- Opciones de despliegue: el wrapper oficial `cbx_rag_eval.py` sobre Transformers; al ser un encoder safetensors estándar, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama, aunque la model card solo documenta el wrapper oficial.
- Throughput estimado: aproximadamente 50 llamadas por segundo en GPU y 25 por segundo en CPU de 8 hilos por instancia, según las latencias publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Salida | Licencia |
|---|---|---|---|---|---|
| cbx-rag-response-relevance-68M | Clasificador ModernBERT | 68 M | no disponible | direct / partial / irrelevant | Apache-2.0 |
| cbx-rag-faithfulness-68M | Clasificador ModernBERT | 68 M | no disponible | soporte por frase, flag de alucinación | Apache-2.0 |
| cbx-rag-context-relevance-68M | Clasificador ModernBERT | 68 M | no disponible | relevancia por frase, context precision | Apache-2.0 |
| cbx-rag-context-utilization-68M | Clasificador ModernBERT | 68 M | no disponible | uso por frase, utilization fraction | Apache-2.0 |
| RAGAS (baseline en RAGBench) | Framework con LLM juez | depende del LLM | depende del LLM | métricas agregadas | Apache-2.0 |
| TruLens (baseline en RAGBench) | Framework con LLM juez | depende del LLM | depende del LLM | métricas agregadas | MIT |

Los tres modelos de la familia CBX comparten arquitectura, tamaño y licencia, y se diferencian únicamente en la tarea de evaluación. Frente a RAGAS y TruLens, la ventaja es el coste por evaluación (clasificador de 68 M frente a llamadas a un LLM) y la reproducibilidad; la desventaja es que no ven el contexto de recuperación ni razonan sobre él.

## Limitaciones y advertencias

- Sesgos de etiquetado: las etiquetas fueron generadas y revisadas por LLM (Claude Haiku, gpt-5.4-mini, Claude Opus, Claude Sonnet), no por humanos, lo que puede introducir sesgos de estilo y de modelo juez.
- Números optimistas: el test rr-v0.1 comparte estilo y generador con el entrenamiento; las métricas reales en producción serán previsiblemente inferiores.
- Clase `partial` débil: F1 de 0,49 en CUAD y 0,71 en FinQA, lo que limita su uso para distinguir respuestas parcialmente correctas.
- Sin acceso al contexto: no puede juzgar si una negativa a responder era apropiada; el autor recomienda combinarlo con los modelos de faithfulness y context relevance.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Dominios limitados: entrenado sobre contratos (CUAD) y finanzas (FinQA); en otros dominios hay que elegir el perfil más cercano y validar sobre datos propios.
- Longitud de contexto no documentada: se desconoce el máximo de tokens de entrada; respuestas muy largas podrían truncarse.
- No es una garantía de corrección: las puntuaciones son estimaciones estadísticas y no deben ser la única base para decisiones legales, financieras o de otro tipo.
- Licencia Apache-2.0 para pesos y código, con atribución de datos requerida para RAGBench (CC BY 4.0), CUAD (CC BY 4.0) y FinQA (MIT).
- Versión v0.1: conviene fijar la revisión con `--revision v0.1` para evitar cambios inesperados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-rag-response-relevance-68M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Evaluador de faithfulness: https://huggingface.co/CobuildX-AI/cbx-rag-faithfulness-68M
- Evaluador de context relevance: https://huggingface.co/CobuildX-AI/cbx-rag-context-relevance-68M
- Evaluador de context utilization: https://huggingface.co/CobuildX-AI/cbx-rag-context-utilization-68M
- Dataset RAGBench: https://huggingface.co/datasets/galileo-ai/ragbench
- Paper de RAGBench (Friel et al., 2024): no disponible en la información proporcionada
- Paper de FinQA (Chen et al., 2021): no disponible en la información proporcionada
- Repositorio de CUAD (The Atticus Project): no disponible en la información proporcionada
