# Aakash25-11-04/Climate_Stance_Indic

## Resumen

Climate_Stance_Indic es un modelo de clasificación de texto desarrollado por Aakash25-11-04 para detectar la postura (a favor, en contra o neutra) de comentarios en hindi, bengalí e inglés code-mixed respecto a la afirmación "el cambio climático y el calentamiento global son una preocupación seria". El modelo se publica bajo licencia MIT y está orientado a la investigación del discurso climático en redes sociales en el sur de Asia.

Técnicamente, el repositorio contiene una configuración en ensemble (`avg_all`) que combina varios clasificadores basados en BERT multilingüe (MuRIL y variantes), con 237.558.531 parámetros totales en safetensors y un tamaño de repo de 1,9 GB. La tarea es una clasificación de tres clases (`Favour` / `Against` / `None`) sobre texto corto de redes sociales, incluyendo escritura nativa, romanizada y mezclas de código.

El modelo es relevante porque aborda un hueco real: no existían datasets oficiales de postura climática en hindi y bengalí, y el autor construyó uno mediante traducción automática con NLLB-200, filtrado por similitud semántica con LaBSE, junto con titulares de Dhoroni y datos sintéticos. Su utilidad práctica es el análisis de discurso público, no la moderación individual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de clasificadores basados en BERT multilingüe (MuRIL y variantes), configuración `avg_all` |
| Parametros totales | 237.558.531 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo BERT, típicamente 512 tokens, no confirmado en la información) |
| Tipos de cuantizacion | safetensors en fp32; int8 dinámico evaluado para las capas de atención de uno de los candidatos MuRIL |
| Idiomas soportados | hindi (hi), bengalí (bn), inglés (en) y mezclas code-mixed |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo final es un ensemble (`avg_all`) que promedia las predicciones de varios candidatos, entre ellos clasificadores basados en MuRIL con distintas funciones de pérdida (`weighted_ce`, `focal`), un modelo TF-IDF con Complement Naive Bayes (`tfidf_cnb`), un clasificador sobre embeddings `bge-m3` con regresión logística (`emb_bgem3_lr`) y un baseline híbrido. La selección se hizo maximizando una puntuación combinada de macro F1 en dev, macro F1 en el conjunto gold y tasa de fallo en una suite de retos estilo CheckList.

Los datos de entrenamiento se construyeron desde cero: 19.278 filas de entrenamiento (9 % sintéticas) y 1.402 de desarrollo. Se partió de datasets públicos de postura en inglés (SemEval-2016 Task 6 con objetivo climático, GWSD, ClimateStance), traducidos a hindi y bengalí con NLLB-200 y filtrados por back-translation con similitud coseno LaBSE >= 0,75. Se añadieron titulares en bengalí de Dhoroni, copias romanizadas y code-mixed, y comentarios sintéticos por plantillas limitados al 40 %. No se documenta uso de RLHF ni DPO; el ajuste es supervisado con funciones de pérdida ponderadas y focal.

## Capacidades

- Clasificación de postura en tres clases (`Favour`, `Against`, `None`) sobre la afirmación climática objetivo.
- Procesamiento de texto en escritura nativa hindi y bengalí, así como texto romanizado y code-mixed.
- Manejo de comentarios cortos de redes sociales, incluyendo emojis, URLs, menciones y erratas (evaluado en la suite de retos).
- Robustez ante negaciones, sarcasmo e ironía (con limitaciones, ver sección de benchmarks).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de texto puro.
- No tiene capacidades de generación de texto, visión, audio ni modo thinking.
- Multilingüe limitado a hindi, bengalí e inglés; no se garantiza funcionamiento en otras lenguas.

## Casos de uso

- Análisis de discurso climático en redes sociales: procesar comentarios de YouTube, X o Facebook en hindi y bengalí para medir la proporción de posturas a favor y en contra de la acción climática, usando el modelo como clasificador por lotes.
- Monitorización de opinión pública para investigación académica: etiquetar encuestas abiertas y secciones de comentarios en estudios sobre percepción del cambio climático en India y Bangladés.
- Estudios de polarización y framing mediático: comparar la distribución de posturas entre medios en hindi y bengalí, aprovechando la distinción entre `Favour`, `Against` y `None`.
- Detección de desinformación climática a escala de corpus: identificar comentarios `Against` que puedan alinearse con narrativas conspirativas (categoría evaluada con tasa de fallo del 33 %).
- Análisis de code-mixing y romanización: investigar cómo la escritura romanizada y las mezclas hindi-inglés afectan a la expresión de postura, usando las categorías de la suite de retos.
- Filtrado previo en pipelines de moderación asistida: como señal de triaje para que revisores humanos prioricen comentarios, nunca como decisión automática sobre individuos.
- Evaluación comparativa de modelos multilingües: usar el conjunto gold de 306 comentarios y la suite de 1.084 tests como referencia para comparar clasificadores de postura en lenguas índicas.

## Benchmarks y rendimiento

Evaluación sobre conjunto gold escrito a mano (306 comentarios, 14 categorías, solo test):

| Metrica | Valor |
|---|---|
| Macro F1 | 0,7662 |
| Accuracy | 0,7712 |
| Favour P / R / F1 | 0,840 / 0,573 / 0,681 (n=110) |
| Against P / R / F1 | 0,797 / 0,904 / 0,847 (n=104) |
| None P / R / F1 | 0,699 / 0,859 / 0,771 (n=92) |
| Macro F1 (bengalí) | 0,7320 (n=153) |
| Macro F1 (hindi) | 0,8005 (n=153) |
| Tasa de fallo en suite de retos (1.084 tests) | 0,209 |

Tasas de fallo destacadas en la suite de retos: implícito 0,57; sarcasmo 0,40; conspiración 0,33; objetivo distinto 0,32; negación directa 0,31; romanizado 0,30; corto 0,28; emoji 0,27; code-mixed 0,20; negación 0,20; erratas 0,17; neutral sobre tema 0,13; largo 0,00; fuera de tema 0,00.

Comparativa de candidatos (dev macro F1 / gold macro F1 / tasa de fallo / score):

| Candidato | Dev F1 | Gold F1 | Fallo | Score |
|---|---|---|---|---|
| avg_all (final) | 0,6856 | 0,7662 | 0,2094 | 0,6615 |
| muril_pair_claim-en_weighted_ce | 0,6830 | 0,7367 | 0,2196 | 0,6269 |
| muril_pair_claim-en_weighted_ce+cal | 0,6854 | 0,7304 | 0,2177 | 0,6215 |
| weighted_dev+cal | 0,6993 | 0,7313 | 0,2205 | 0,6211 |
| avg_all+cal | 0,7003 | 0,7398 | 0,2408 | 0,6194 |
| weighted_dev | 0,6991 | 0,7246 | 0,2113 | 0,6190 |
| muril_pair_claim-auto_focal | 0,6718 | 0,7324 | 0,2712 | 0,5968 |
| tfidf_cnb | 0,5781 | 0,7318 | 0,2869 | 0,5883 |
| emb_bgem3_lr | 0,6342 | 0,7193 | 0,2657 | 0,5864 |
| stack_dev | 0,6722 | 0,6836 | 0,2325 | 0,5674 |
| hybrid_baseline | 0,6376 | 0,6704 | 0,2998 | 0,5205 |

Coste y precisión en CPU:

| Modelo | Gold macro F1 | Tasa de fallo | Tamano (MB) | ms/ejemplo CPU |
|---|---|---|---|---|
| tfidf_cnb | 0,732 | 0,287 | 19,142 | 0,171 |
| hybrid_baseline | 0,670 | 0,300 | 23,130 | 118,207 |
| muril_pair_claim-en_weighted_ce (fp32) | 0,737 | 0,220 | 959,833 | 17,028 |
| muril_pair_claim-en_weighted_ce (int8 dinámico) | 0,715 | 0,223 | no disponible | 14,319 |
| ensemble (avg_all) | 0,766 | 0,209 | 1.938,823 | 196,774 |

## Requisitos de hardware

- VRAM estimada: el ensemble completo ocupa aproximadamente 1,9 GB en fp32; en GPU con 4 GB es suficiente para inferencia por lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, T4). Para throughput alto, A10G, L4 o A100 con lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 3050, RTX 3060, RTX 4060 y superiores; también en CPU.
- Despliegue: el código vive en el repositorio GitHub del autor (clonar, `pip install -r requirements.txt`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un clasificador BERT, es viable servirlo con Hugging Face `transformers` o `optimum` (ONNX/int8).
- Latencia y throughput: en CPU, el ensemble tarda 196,774 ms por ejemplo; el candidato MuRIL individual, 17,028 ms en fp32 y 14,319 ms en int8 dinámico. El baseline TF-IDF tarda 0,171 ms por ejemplo. No se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Gold macro F1 | Tasa de fallo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Climate_Stance_Indic (ensemble) | 237,6 M | no disponible | 0,766 | 0,209 | MIT | Hugging Face + GitHub |
| muril_pair_claim-en_weighted_ce (candidato interno) | no disponible | no disponible | 0,737 | 0,220 | MIT (mismo repo) | Incluido en el ensemble |
| tfidf_cnb (baseline interno) | no aplica | no aplica | 0,732 | 0,287 | MIT (mismo repo) | Incluido en el ensemble |
| emb_bgem3_lr (baseline interno) | no disponible | no disponible | 0,719 | 0,266 | MIT (mismo repo) | Incluido en el ensemble |

No se dispone de comparación con modelos externos de postura climática en lenguas índicas en la información proporcionada.

## Limitaciones y advertencias

- El texto de entrenamiento es mayoritariamente traducción automática de tuits y noticias en inglés; el estilo difiere de comentarios reales en hindi y bengalí, lo que puede degradar el rendimiento en dominios reales.
- El conjunto gold y el léxico fueron escritos por el propio autor del proyecto; las puntuaciones son indicativas y no sustituyen datos anotados de forma independiente.
- El sarcasmo (40 % de fallo), la postura implícita (57 %) y la postura hacia objetivos relacionados pero distintos (32 %) son las categorías más difíciles.
- La mayoría de configuraciones usan una sola semilla; en las tres con tres semillas, el macro F1 gold varió hasta 0,18 entre semillas, por lo que diferencias pequeñas entre modelos no son significativas.
- El modelo puede reflejar framing político presente en los datos fuente en inglés (debate climático de EE. UU. y Reino Unido).
- No está destinado a moderación de individuos, inferencia de atributos personales ni lenguas distintas de hindi, bengalí e inglés.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías y el modelo no ha sido validado en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/Aakash25-11-04/Climate_Stance_Indic
- Repositorio GitHub (código y datasheet): https://github.com/Aakash25-11-04/Climate_Stance_Indic
- Datasheet de datos: `docs/datasheet.md` dentro del repositorio GitHub
- No se han proporcionado enlaces a papers, blogs ni demos adicionales en la información disponible.
