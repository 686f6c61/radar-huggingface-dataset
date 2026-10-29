# hniyorurema/burnettbench-scope-classifiers

## Resumen

BurnettBench Scope Classifiers (OPT4 / OPT4v2) es una familia de ocho checkpoints de clasificación binaria construidos sobre DistilBERT-base-uncased. Cada checkpoint predice si una consulta de usuario cae dentro del alcance («scope») de la guía `llms.txt` V2 de una institución concreta. El modelo lo desarrolla el Department of Communications and Strategy de la Anne Burnett Marion School of Medicine (Texas Christian University), con Happy Herman Niyorurema como autor principal y Maricar Hastings Estella como supervisora, en el marco del estudio «BurnettBench Study 2 — Scope Coverage Effects in llms.txt V2» (2026).

No es un modelo generativo ni un asistente: es un componente de enrutado (gate) pensado para estudiar si un clasificador pequeño puede decidir, antes de la generación, si una pregunta está cubierta por la documentación publicada de una institución. Los cinco dominios cubiertos son Bakame AI, Mayo Clinic, Rice University, USCIS y el despacho Vinson & Elkins; el experimento OPT4 entrena con 233 ejemplos etiquetados por humanos por institución y OPT4v2 amplía a 506 (233 humanos + 273 generados por IA), aunque en esta segunda variante solo se conservaron los checkpoints de Bakame AI, Mayo Clinic y Vinson & Elkins.

Su relevancia es fundamentalmente metodológica: cuantifica el techo de un enfoque de clasificación supervisada para el problema del alcance en `llms.txt` y concluye que la solución estructural pasa por que el publicador declare explícitamente los campos `covers:` y `excludes:`. Los propios autores lo etiquetan como material de investigación y desaconsejan su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base): 6 capas, 768 dimensiones ocultas, 12 cabezas de atención; cabeza de clasificación sobre el token `[CLS]` |
| Parámetros totales | ~66 M (DistilBERT-base-uncased) más la cabeza de secuencia con 2 etiquetas |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (límite del tokenizador WordPiece de DistilBERT) |
| Tipos de cuantización | No disponible: solo se distribuyen state dicts en PyTorch (`.pt`); no hay versiones GGUF, ONNX, AWQ ni GPTQ publicadas |
| Idiomas soportados | Inglés (etiqueta `en`; tokenizador `uncased`) |
| Licencia | MIT para código y pesos; datos de entrenamiento (probes) bajo CC BY 4.0 |
| Formato de pesos | PyTorch `.pt` (state dict de `DistilBertForSequenceClassification`, `num_labels=2`), cargado con `torch.load` + `load_state_dict` |
| Tarea (pipeline) | `text-classification` (clasificación binaria: dentro / fuera de alcance) |
| Número de checkpoints | 8 (`opt4_gate_*`: bakame, mayo, rice, uscis, ve; `opt4v2_gate_*`: bakame, mayo, ve) |
| Tamaño del repositorio | 2,1 GB |
| Librería | `transformers` |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer DistilBERT, es decir, una versión destilada de BERT-base con la mitad de capas (6 frente a 12) y aproximadamente 66 millones de parámetros. Sobre la representación del token `[CLS]` se añade una cabeza lineal de dos salidas que produce la decisión binaria dentro/fuera de alcance. No hay decodificación, atención lineal, decodificación especulativa ni componentes de tipo SSM o híbridos: el modelo es un clasificador de secuencia estándar con un máximo de 512 tokens de entrada, lo que implica que solo se codifica la consulta del usuario (o un fragmento de ella), no la guía completa.

El entrenamiento se organiza por institución y por experimento. OPT4 usa 233 anotaciones humanas de ground truth por institución con esquema leave-one-out. OPT4v2 amplía el conjunto a 506 ejemplos por institución: 233 humanos más 273 generados por IA. En ambos casos se parte de los pesos preentrenados de `distilbert-base-uncased` y se ajusta la cabeza de clasificación; la model card no documenta uso de RLHF, DPO ni preferencias humanas, algo coherente con una tarea de clasificación supervisada. El entrenamiento original se ejecutó en una NVIDIA GB10 (DGX Spark) y los scripts de reproducción (`burnettbench_retrain_opt4.py`, `burnettbench_opt4_263.py`, `burnettbench_eval_opt4.py`) están publicados en el repositorio de replicación. Los checkpoints OPT4v2 de USCIS y Rice no se conservaron de la ejecución original, según el apartado VIII.D del informe técnico.

## Capacidades

- Clasificación binaria de alcance: dada una consulta en inglés, devuelve dos logits (dentro / fuera del alcance) de la guía `llms.txt` V2 de una institución concreta.
- Especialización por institución: cada checkpoint está entrenado para un único dominio vertical (investigación en IA, salud, educación superior, inmigración, servicios legales), no son intercambiables sin reentrenar.
- Dos variantes de entrenamiento comparables: OPT4 (solo datos humanos) y OPT4v2 (humanos + sintéticos), lo que permite estudiar el efecto de la aumentación de datos sobre el recall.
- Inferencia ligera: al ser un encoder de 66 M de parámetros, puede ejecutarse en CPU o en cualquier GPU consumer, con lotes grandes.
- Integración con el ecosistema Hugging Face `transformers` y etiqueta `endpoints_compatible`.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni cadenas de pensamiento: no genera texto.
- No tiene capacidades multimodales (ni visión ni audio) ni modo «thinking».
- Multilingüismo: no disponible; solo inglés, con tokenizador `uncased` (sin distinción de mayúsculas).

## Casos de uso

- Replicación del estudio BurnettBench 2: cargar cada checkpoint con el script `burnettbench_eval_opt4.py` y reproducir las métricas de precisión fuera de alcance y recall dentro de alcance por institución.
- Enrutado previo en prototipos de RAG institucional: usar el clasificador como puerta barata antes de invocar un LLM generativo, de modo que las consultas fuera de alcance se rechacen sin coste de generación; solo en fase de prototipo, nunca en un sistema expuesto al usuario.
- Auditoría de guías `llms.txt` publicadas: medir qué proporción de consultas reales de una institución queda fuera del alcance declarado y detectar huecos en la documentación antes de publicarla.
- Investigación sobre detección de consultas fuera de dominio: servir como línea base supervisada frente a alternativas como la inyección del fichero completo (variante V2) o la ausencia de guía (variante A).
- Etiquetado asistido y ampliación de ground truth: usar las probabilidades del checkpoint como preetiquetado débiles para priorizar la revisión humana de nuevos probes, dado el reducido tamaño del conjunto anotado.
- Estudio comparativo de datos humanos frente a sintéticos: entrenar con el mismo pipeline cambiando únicamente el conjunto (233 vs 506 ejemplos) y medir la degradación de precisión fuera de alcance observada en OPT4v2.
- Docencia y experimentación con encoders pequeños: ejemplo completo de fine-tuning de DistilBERT para clasificación binaria con particiones leave-one-out y métricas asimétricas (precisión fuera de alcance vs recall dentro de alcance).
- Análisis de sesgo por vertical: comparar el comportamiento de los cinco checkpoints OPT4 sobre consultas ambiguas para detectar diferencias sistemáticas entre dominios sanitario, legal, académico y administrativo.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los del informe técnico, expresados como precisión media en consultas fuera de alcance (OUT_V2 accuracy) y recall medio en consultas dentro de alcance (IN_V2 recall):

| Variante | OUT_V2 accuracy (media) | IN_V2 recall (media) |
|---|---|---|
| A (sin guía, línea base) | 29,5 % | — |
| V2 (inyección del fichero completo) | 23,3 % | 88,2 % |
| OPT4 | 29,9 % | 71,5 % |
| OPT4v2 | 26,2 % | 76,8 % |

Interpretación aportada por los autores: ambas variantes de clasificador recuperan una precisión fuera de alcance cercana a la línea base sin guía (29,9 % y 26,2 % frente a 29,5 %), pero ninguna alcanza el recall dentro de alcance de la variante V2 (71,5 % y 76,8 % frente a 88,2 %). El informe atribuye el resultado a un techo de datos, con una accuracy de validación cruzada de aproximadamente el 70 % sobre 263 ejemplos etiquetados. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de NLU en la información disponible, y no serían aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (≈255 MB de pesos por checkpoint); en fp16 ≈130 MB. El repositorio completo ocupa 2,1 GB porque incluye los ocho checkpoints.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) y en la mayoría de entornos de CPU. A100/H100 son innecesarias para inferencia.
- Cabe en GPU consumer: sí, sin cuantización y con lotes de cientos de secuencias de 512 tokens.
- Entrenamiento: los autores recomiendan GPU; la ejecución original se hizo en NVIDIA GB10 (DGX Spark).
- Opciones de despliegue: PyTorch + `transformers` (carga manual del state dict sobre `DistilBertForSequenceClassification`), exportación a TorchScript u ONNX no publicada pero viable. vLLM, TGI, llama.cpp y Ollama no son aplicables: no es un modelo generativo y no hay pesos GGUF.
- Latencia y throughput: no disponible en la información proporcionada. Por el tamaño del encoder, se espera inferencia en el orden de milisegundos por consulta en CPU y sub-milisegundo por secuencia en GPU por lotes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| burnettbench-scope-classifiers | ~66 M | 512 tokens | Clasificación binaria de alcance por institución | MIT | 8 checkpoints `.pt` en Hugging Face |
| distilbert-base-uncased (modelo base) | 66 M | 512 tokens | Encoder genérico (masked LM), sin cabeza de clasificación | Apache 2.0 | Hugging Face, integración nativa en `transformers` |
| all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | Embeddings de frase / similitud semántica | Apache 2.0 | Hugging Face, ecosistema `sentence-transformers` |
| Fine-tune propio de DistilBERT sobre datos de la institución | ~66 M | 512 tokens | Clasificación binaria a medida | Depende del modelo base y de los datos | Requiere anotar datos propios y ejecutar el pipeline de entrenamiento |

No hay benchmarks comparativos publicados entre estos modelos y los checkpoints de BurnettBench en la información disponible; la comparación anterior es de especificaciones y disponibilidad, no de rendimiento. Cualquier alternativa requeriría reentrenamiento sobre el mismo esquema de etiquetado para ser comparable.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación: la propia model card indica que los checkpoints no alcanzan el umbral de producción y pide no desplegarlos en sistemas de cara al usuario.
- Techo de datos documentado: accuracy de validación cruzada de ~70 % sobre 263 ejemplos etiquetados; el rendimiento no mejora con más entrenamiento sobre ese conjunto.
- Conjuntos de entrenamiento muy pequeños: 233 ejemplos por institución en OPT4 y 506 en OPT4v2, insuficientes para generalizar a distribuciones de consultas reales.
- Cobertura incompleta de la familia: los checkpoints OPT4v2 de USCIS y Rice no se conservaron, por lo que no es posible una comparación OPT4/OPT4v2 completa en esos dos dominios.
- Idioma único: solo inglés y tokenizador `uncased`; cualquier consulta en castellano u otras lenguas queda fuera de la distribución de entrenamiento.
- Límite de 512 tokens: las guías `llms.txt` completas no caben en el contexto del modelo, de modo que la decisión se toma sobre la consulta y no sobre el documento íntegro.
- Riesgo de alucinación: no aplica en sentido estricto al no ser generativo; el riesgo equivalente son falsos positivos (consultas fuera de alcance aceptadas) y falsos negativos (consultas legítimas rechazadas), con un recall dentro de alcance del 71,5 % en OPT4.
- Sesgos: no se documentan análisis de sesgo en la información disponible, pero el etiquetado humano de cinco instituciones concretas puede introducir sesgos de dominio, de registro lingüístico y de criterio de anotación.
- Licencia: MIT permite uso comercial de pesos y código, pero los datos de entrenamiento están bajo CC BY 4.0 y la recomendación expresa de los autores es no usar los checkpoints en producción; la licencia no sustituye a esa advertencia técnica.
- Repositorio pesado (2,1 GB) y carga no estándar: requiere descargar el snapshot completo y aplicar `load_state_dict` manualmente, ya que no se publica un `config.json` con la cabeza entrenada por checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hniyorurema/burnettbench-scope-classifiers
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Repositorio de replicación (scripts de entrenamiento y evaluación): https://github.com/happy-tcu/burnettbench
- Paper (arXiv): pendiente de publicación, marcado como «TBA» en la model card; no disponible
- Contacto del autor principal: h.niyorurema@tcu.edu
- Contacto de la supervisora: m.estella@tcu.edu
- Búsqueda web: no devolvió enlaces relevantes al modelo (los resultados obtenidos eran páginas de ayuda de Google Play sin relación con el contenido)
