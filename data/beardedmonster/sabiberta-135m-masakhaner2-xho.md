# BeardedMonster/SabiBERTa-135M-masakhaner2-xho

## Resumen

SabiBERTa-135M-masakhaner2-xho es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) publicado por el usuario BeardedMonster en HuggingFace. Se obtiene por fine-tuning del modelo base `BeardedMonster/SabiBERTa-135M`, un encoder de arquitectura ModernBERT con 135.883.017 parámetros, sobre la partición en xhosa (`xho`) del corpus MasakhaNER 2.0.

El modelo resuelve una tarea concreta: etiquetar entidades en texto en xhosa, una lengua bantú de Sudáfrica con recursos limitados. Según la model card, alcanza un span F1 medio de 0,8463 en la partición indicada, entrenando 50 épocas con una longitud máxima de 256 tokens. El checkpoint se publica únicamente en safetensors (0,5 GB de repositorio) e incluye `id2label`, de modo que las predicciones se decodifican directamente a nombres de etiqueta.

Su relevancia es doble: por un lado, aporta un modelo pequeño (135,9 M de parámetros) y por tanto desplegable en CPU para una lengua poco cubierta; por otro, forma parte de una familia de fine-tunes por idioma generados con un harness de evaluación que, según el autor, reproduce los baselines publicados de MasakhaNER 2.0 con una tolerancia de ~0,25 F1. La licencia no se declara en la ficha y queda supeditada a la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer ModernBERT (según el tag `modernbert` de la model card) |
| Parametros totales | 135.883.017 (135,9 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card; el fine-tuning se realizó con `max_length` 256 |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors (sin GGUF ni ONNX) |
| Idiomas soportados | `xho` (xhosa) |
| Licencia | No disponible; la model card remite a la licencia y términos del modelo base |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un encoder transformer bidireccional de la familia ModernBERT, según la etiqueta declarada por el autor, con 135.883.017 parámetros y una cabeza de clasificación de tokens (`AutoModelForTokenClassification`). El checkpoint deriva del modelo base `BeardedMonster/SabiBERTa-135M`, del que no se detallan en esta ficha ni el volumen de tokens de preentrenamiento ni la composición del corpus.

El ajuste fino se realizó sobre la partición en xhosa de MasakhaNER 2.0 con los siguientes hiperparámetros declarados: 50 épocas, tasa de aprendizaje 5e-05, batch size 32 y longitud máxima de 256 tokens. La métrica de selección es `span_f1`, con una puntuación media de 0,8463, y las puntuaciones por lengua se guardan en `metrics.json`. No se menciona ningún uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo discriminativo de NER. El autor advierte de que el resultado proviene de una única ejecución y de que los papers de referencia promedian cinco, por lo que las diferencias pequeñas deben tratarse como ruido.

## Capacidades

- Reconocimiento de entidades nombradas sobre texto en xhosa: clasificación token a token con decodificación directa a nombres de etiqueta gracias a `id2label`.
- Extracción de entidades en texto periodístico y de dominio general, el tipo de datos predominante en MasakhaNER 2.0.
- Integración nativa con el ecosistema Transformers mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- Ejecución viable en CPU por tamaño (135,9 M de parámetros) y por la ventana de 256 tokens usada en entrenamiento.
- No soporta generación de texto, chat, razonamiento multi-paso ni tool calling: es un modelo discriminativo, no un LLM.
- No soporta visión, audio ni modalidades adicionales.
- No es multilingüe: está ajustado exclusivamente para `xho` y no se han publicado evaluaciones en otras lenguas.

## Casos de uso

- Extracción de entidades en corpus periodísticos en xhosa: el modelo puede procesar artículos por fragmentos de hasta 256 tokens y devolver las menciones etiquetadas, lo que permite construir bases de datos de personas, organizaciones y lugares citados en medios sudafricanos.
- Anonimización de datos personales: integrado como paso previo a la publicación de textos clínicos, legales o administrativos en xhosa, detecta menciones a personas y organizaciones que deben enmascararse antes de compartir el corpus.
- Enriquecimiento de datasets para entrenamiento de LLM: las etiquetas generadas sirven para anotar corpus en xhosa con entidades, un recurso escaso y útil para tareas posteriores de enlace de entidades o generación aumentada por recuperación.
- Indexación y búsqueda de entidades: en un motor de búsqueda documental en xhosa, el modelo permite filtrar y facetar resultados por organización o lugar, mejorando la precisión frente a búsqueda puramente léxica.
- Monitorización de menciones de marca o institución: procesado por lotes de notas de prensa y redes sociales en xhosa para medir volumen y contexto de aparición de organizaciones.
- Anotación asistida en proyectos lingüísticos de bajos recursos: el modelo actúa como preetiquetador en un flujo de active learning, de modo que lingüistas humanos solo revisan y corrigen, reduciendo el coste de crear nuevos corpus anotados en xhosa.
- Preprocesado para pipelines de RAG: normalización y marcado de entidades en documentos en xhosa antes de trocearlos e indexarlos, lo que permite consultas posteriores filtradas por entidad.

## Benchmarks y rendimiento

| Benchmark | Tarea | Metrica | Resultado | Notas |
|---|---|---|---|---|
| MasakhaNER 2.0, particion `xho` | NER (clasificación de tokens) | span F1 | 0,8463 | Ejecución única; el autor indica que los baselines publicados promedian 5 ejecuciones y que el harness reproduce dichos baselines con ~0,25 F1 de tolerancia |

No se han publicado en la información disponible resultados de benchmarks comparativos adicionales (MMLU, HumanEval, GSM8K u otros), ni el desglose por etiqueta de entidad, ni los valores exactos de los baselines de MasakhaNER 2.0 frente a los que se calibró el harness.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 ~544 MB de pesos, en fp16 ~272 MB y en int8 ~136 MB (cálculo teórico a partir de los 135.883.017 parámetros; no son cifras publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente. Una RTX 4090, A100 o H100 está sobredimensionada para este modelo y solo se justifica por agregación de peticiones en lote.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Inferencia en CPU: viable, especialmente en lotes pequeños y con cuantización dinámica a int8; el límite práctico es la ventana de 256 tokens por secuencia.
- Opciones de despliegue: pipeline `token-classification` de Transformers, exportación a ONNX con Optimum y ejecución con ONNX Runtime, servicio propio con FastAPI o Triton Inference Server. llama.cpp y Ollama no son aplicables al no publicarse GGUF y tratarse de un encoder BERT. vLLM y TGI no están orientados a token classification.
- Latencia y throughput: no disponible; no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Metrica publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-xho | 135.883.017 | No disponible (entrenado con 256) | NER en `xho` | span F1 0,8463 | No disponible | Checkpoint publicado en HF |
| SabiBERTa-135M (modelo base) | 135.883.017 | No disponible | Encoder base, sin cabeza NER | No aplica | No disponible | Publicado en HF |
| SabiBERTa-135M-masakhaner2-ibo | No disponible | No disponible | NER en `ibo` (igbo) | No disponible en la información consultada | No disponible | Publicado en HF |
| Baselines de MasakhaNER 2.0 | No disponible | No disponible | NER multilingüe africano | No disponible (solo se indica que el harness los reproduce con ~0,25 F1) | No disponible | Referencia académica |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han facilitado las puntuaciones de los baselines ni de los checkpoints hermanos de la misma familia. Lo único contrastable es que este checkpoint es la variante en xhosa de una familia de fine-tunes por lengua sobre el mismo encoder de 135,9 M de parámetros.

## Limitaciones y advertencias

- Resultado de una única ejecución: el propio autor advierte que los papers de referencia promedian cinco ejecuciones, por lo que diferencias de pocas décimas de F1 frente a otros sistemas no son concluyentes.
- Licencia no declarada: la ficha no especifica términos de uso y remite a la licencia del modelo base `BeardedMonster/SabiBERTa-135M`. Es imprescindible verificar ese repositorio antes de cualquier uso comercial.
- Cobertura lingüística única: solo `xho`; no hay evidencia de comportamiento en otras lenguas ni de transferencia cero a lenguas relacionadas.
- Ventana limitada en entrenamiento: `max_length` 256 implica que el modelo se ajustó con secuencias cortas; textos largos deben fragmentarse, con el riesgo de perder entidades partidas entre fragmentos.
- Dominio restringido: el ajuste se hizo sobre MasakhaNER 2.0, con la distribución y tipología de entidades de ese corpus; el rendimiento puede degradarse en dominios muy distintos (texto técnico, conversacional, redes sociales).
- Falsos positivos y fronteras de entidad: como todo modelo NER, puede etiquetar menciones ambiguas o calcular mal los límites de una entidad; no hay desglose por etiqueta publicado para evaluar qué categorías fallan más.
- Sin validación comunitaria: el repositorio registra 0 descargas y 1 like, por lo que no existen informes independientes de uso en producción.
- No es un modelo generativo: no debe emplearse para resumir, responder preguntas ni tareas de razonamiento; intentarlo produciría resultados sin sentido.
- Idiomas y sesgos del corpus subyacente: los sesgos presentes en MasakhaNER 2.0 (selección de fuentes, sobrerrepresentación de ciertos tipos de entidad) se trasladan al checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-xho
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Checkpoint hermano para igbo: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-ibo
- Paper de MasakhaNER 2.0 y repositorio del harness: no disponibles en la información consultada.
