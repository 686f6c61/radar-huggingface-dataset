# BonTori/phobert-eda-vietnamese-hsd

## Resumen

El modelo `BonTori/phobert-eda-vietnamese-hsd` es un fine-tuning de PhoBERT, el modelo de lenguaje preentrenado monolingüe para vietnamita desarrollado por VinAIResearch, orientado a la detección de discurso de odio (HSD, *Hate Speech Detection*) en textos vietnamitas. El nombre sugiere que se ha aplicado EDA (*Easy Data Augmentation*) como técnica de aumento de datos durante el entrenamiento, aunque no hay documentación oficial que lo confirme. La ficha de HuggingFace está vacía: no se especifican licencia, idiomas, ni detalles de entrenamiento.

El modelo se publicó el 22 de agosto de 2026 y no registra descargas ni valoraciones. A pesar de la falta de información, su arquitectura subyacente es la de PhoBERT (BERT monolingüe para vietnamita), que cuenta con versiones *base* y *large* de 110M y 370M parámetros respectivamente. La relevancia de este modelo radica en su posible aplicación a la moderación de contenido en redes sociales vietnamitas, un área con demanda creciente. Sin embargo, al carecer de documentación y métricas, su uso en producción requiere una evaluación previa rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (PhoBERT, basado en RoBERTa) |
| Parametros totales | no disponible (PhoBERT base: 110M; PhoBERT large: 370M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (PhoBERT original: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (inferido por el nombre y el uso de PhoBERT) |
| Licencia | no disponible |
| Formato de pesos | safetensors (por defecto en Transformers) |

## Arquitectura y entrenamiento

PhoBERT es una adaptación de RoBERTa optimizada para vietnamita, preentrenada con *masked language modeling* sobre un corpus de 20 GB de texto vietnamita. El modelo `phobert-eda-vietnamese-hsd` parte de uno de estos checkpoints y se ha fine-tuneado para clasificación de discurso de odio, probablemente sobre un dataset de comentarios de redes sociales. La inclusión de "EDA" en el nombre indica que se empleó *Easy Data Augmentation* (sinónimos, inserción aleatoria, intercambio y borrado) para expandir el conjunto de entrenamiento, una técnica común cuando los datos etiquetados son escasos. No se dispone de información sobre el número de épocas, la tasa de aprendizaje, el tamaño del dataset ni si se aplicó alguna técnica de regularización adicional.

## Capacidades

- Clasificacion de texto en vietnamita para detectar discurso de odio, ofensas y lenguaje abusivo.
- Fine-tuning especifico para la tarea HSD, lo que implica una mayor precision en ese dominio frente al modelo base.
- Capacidad de procesar texto corto de redes sociales (comentarios, tuits) gracias al preentrenamiento de PhoBERT en dominios variados.
- No se ha documentado soporte para tool calling, agentes, vision ni otras capacidades multimodales.
- El modelo es monolingue: solo trabaja con vietnamita.

## Casos de uso

- Moderacion de comentarios en redes sociales vietnamitas: el modelo puede clasificar automaticamente comentarios como odiosos u ofensivos, permitiendo a las plataformas filtrar contenido antes de su publicacion.
- Analisis de opinion en foros y blogs: detectar discursos toxicos en debates publicos para estudios sociologicos o de opinion publica.
- Filtrado de contenido en plataformas de comercio electronico: identificar resenas o mensajes abusivos entre usuarios.
- Monitorizacion de campanas politicas: analizar comentarios en paginas de partidos o candidatos para detectar ataques personales o incitacion al odio.
- Investigacion academica sobre toxicidad en vietnamita: servir como modelo base para estudios comparativos de tecnicas de deteccion de odio.
- Sistemas de soporte al cliente: clasificar mensajes de usuarios que contengan lenguaje ofensivo para priorizar su derivacion a personal humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni metricas especificas de HSD (como F1, precision o recall) para este modelo. Tampoco se han encontrado comparaciones con otros sistemas de deteccion de odio en vietnamita.

## Requisitos de hardware

- VRAM estimada: para PhoBERT base (110M parametros) en precision fp32, la inferencia requiere aproximadamente 0,5-1 GB de VRAM; con cuantizacion int8, unos 0,3 GB. Para PhoBERT large (370M), se necesitan 1,5-2 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) es suficiente para inferencia en batch pequeno. Para entrenamiento o fine-tuning, se recomienda una GPU con 8-12 GB (RTX 3070, RTX 3080, A10).
- Si cabe en consumer GPU: si, tanto en version base como large, siempre que se use cuantizacion o batch reducido.
- Opciones de despliegue: compatible con Transformers (PyTorch), puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). Tambien es posible usar la API de Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. Para un modelo BERT de 110M, la latencia tipica en CPU es de 10-50 ms por secuencia corta; en GPU, inferior a 5 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BonTori/phobert-eda-vietnamese-hsd | BERT (PhoBERT) | no disponible | no disponible | no disponible | HuggingFace |
| PhoBERT base (VinAIResearch) | BERT (RoBERTa) | 110M | 512 | MIT | HuggingFace, GitHub |
| BamiBERT (VinAIResearch) | BERT | no disponible | hasta 4096 | no disponible | HuggingFace |

PhoBERT es el modelo base del que parte este fine-tuning. BamiBERT es una alternativa mas reciente que amplia el contexto y se entrena sobre un corpus mayor, pero no esta orientado a deteccion de odio. No se dispone de datos de rendimiento comparativo entre estos modelos y el de BonTori.

## Limitaciones y advertencias

- La model card no contiene informacion sobre sesgos, riesgos o limitaciones. Al ser un fine-tuning de PhoBERT, hereda los sesgos del corpus de preentrenamiento, que puede contener estereotipos o lenguaje ofensivo.
- Riesgo de alucinacion: al ser un modelo de clasificacion, no genera texto libre, pero puede producir falsos positivos o negativos en la deteccion de odio, especialmente con sarcasmo o lenguaje implicito.
- Limitaciones de contexto: PhoBERT original soporta hasta 512 tokens, por lo que textos largos deberan truncarse.
- Restricciones de licencia: no se ha especificado la licencia, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- No hay garantias de rendimiento en produccion: al no existir benchmarks ni documentacion de entrenamiento, el modelo debe evaluarse con datos propios antes de desplegarlo.
- El modelo solo funciona con vietnamita; no soporta otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BonTori/phobert-eda-vietnamese-hsd
- Repositorio de PhoBERT (VinAIResearch): https://github.com/VinAIResearch/PhoBERT
- Paper de PhoBERT (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Paper sobre deteccion de odio en vietnamita con PhoBERT-CNN: https://arxiv.org/pdf/2206.00524
- Modelo relacionado (in-progress): https://huggingface.co/BonTori/phobert-eda-vietnamese-hsd-inprogress
- Modelo relacionado (LLM): https://huggingface.co/BonTori/phobert-llm-vietnamese-hsd
