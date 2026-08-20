# DT4H/CardioBERTa.sv_P_translations_only

## Resumen

`DT4H/CardioBERTa.sv_P_translations_only` es un codificador de terminología biomédica en sueco desarrollado por el consorcio DataTools4Heart (DT4H) dentro del proyecto CardioLM, una suite multilingüe de modelos pequeños para el dominio de la cardiología. El modelo se inicializa desde `DT4H/CardioBERTa.sv` —un BERT adaptado al sueco biomédico mediante masked language modeling— y se especializa mediante aprendizaje métrico supervisado por conceptos de UMLS (CUIs). Su propósito es la normalización de conceptos clínicos y el entity linking en pipelines de NLP clínica, particularmente en cardiología.

La arquitectura es un transformer encoder de tipo BERT con aproximadamente 124,7 millones de parámetros. El entrenamiento usa tripletes CUI-supervisados con la estrategia `parents`, que enriquece las relaciones de sinónimos con relaciones ontológicas de nivel padre, generando 1,6 millones de tripletes sobre 476.238 CUIs. La ventana de contexto es corta (máximo 25 tokens), adecuada para términos y frases clínicas breves. El modelo está pensado para generar embeddings normalizados de términos y usarse en pipelines de recuperación candidata, no para generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) |
| Parámetros totales | 124.690.944 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 25) |
| Tipos de cuantización | no disponible (solo safetensors FP32/F16) |
| Idiomas soportados | Sueco (sv) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia CardioBERTa de CardioLM, una suite de encoders por idioma adaptados al dominio de la cardiología mediante continuación de pretraining con MLM sobre corpus biomédicos y cardiológicos monolingües. La arquitectura es un BERT estándar con 124,7 millones de parámetros. La especialización se realiza mediante metric learning con Multi-Similarity Loss, usando triplets construidos a partir de pares de términos supervisados por CUIs (Concept Unique Identifiers de UMLS). La estrategia `parents` añade a los tripletes de sinónimos las relaciones jerárquicas padre de la ontología, lo que incrementa el número de términos únicos de 141.369 a 531.269 y eleva la media de términos por CUI de 2,00 a 3,94. El entrenamiento usa pooling CLS, batch size 256, learning rate 2e-5, una sola época y minería de todos los tripletes con margen 0,2. El conjunto de terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS.

## Capacidades

- Generación de embeddings normalizados (L2) para términos clínicos y biomédicos en sueco.
- Normalización de conceptos clínicos: mapeo de términos de texto libre a CUIs de UMLS.
- Entity linking y candidate retrieval en pipelines de NLP clínica, especialmente en cardiología.
- Soporte de feature extraction para downstream tasks como clasificación o clustering de terminología.
- Capacidad multilingüe limitada al sueco; no soporta otros idiomas.
- No soporta generación de texto, tool calling ni agentes.
- No incluye modo de razonamiento ni visión.

## Casos de uso

- Normalización de conceptos en historiales clínicos suecos: el modelo convierte términos médicos no estructurados en CUIs UMLS, permitiendo la estandarización de informes para análisis federados.
- Entity linking en textos de cardiología: integrado en pipelines de NLP, puede enlazar menciones de enfermedades, medicamentos o procedimientos a terminología ontológica.
- Recuperación de información biomédica: usado para indexar y recuperar documentos o pasajes clínicos por similitud semántica de términos.
- Construcción de grafos de conocimiento clínico: los embeddings generados alimentan sistemas de RAG o bases de conocimiento sobre cardiología.
- Análisis de datos de ensayos clínicos: para homogeneizar criterios de inclusión/exclusión descritos en distintos formatos.
- Despliegue en plataformas federadas de salud: al ser un modelo pequeño (125M), puede ejecutarse en entornos locales con datos sensibles sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~125M de parámetros, lo que requiere aproximadamente 0,5 GB en FP32 y 0,25 GB en FP16. Puede ejecutarse en GPU con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU con soporte CUDA, desde una RTX 3060 (6 GB) en adelante; también funciona bien en CPUs modernas para inferencia por lotes pequeños.
- En consumer GPU: sí, cabe en tarjetas de gama baja (GTX 1650, RTX 3060, etc.).
- Opciones de despliegue: compatible con transformers, Text Embeddings Inference (TEI), y puede convertirse a ONNX para inferencia en CPU. No se han publicado configuraciones para vLLM, llama.cpp u Ollama (al ser un encoder, no un generativo).
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño con longitud de secuencia corta (25 tokens), la latencia en CPU es del orden de milisegundos por secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DT4H/CardioBERTa.sv_P_translations_only | 124,7M | 25 tokens (entrenamiento) | sv | no disponible | Hugging Face |
| DT4H/CardioBERTa.it_P_translations_only | 124,7M (estimado) | 25 tokens (entrenamiento) | it | no disponible | Hugging Face |
| BioBERT (base) | 110M | 512 tokens | en | MIT | Hugging Face |

Comparado con BioBERT, el modelo DT4H está especializado en sueco y en cardiología, con un contexto mucho más corto (25 vs 512 tokens) y no genera texto, solo embeddings. Su ventaja es la adaptación monolingüe al dominio y la supervisión por CUIs, lo que lo hace más adecuado para normalización de conceptos en sueco que un modelo generalista o multilingüe.

## Limitaciones y advertencias

- Sesgos: entrenado exclusivamente con terminología biomédica sueca, puede no generalizar a variantes dialectales o jerga clínica no estándar.
- Riesgo de alucinación: como encoder, no genera texto, pero los embeddings pueden ser menos fiables para términos fuera del dominio de cardiología.
- Limitaciones de contexto: la longitud máxima de entrenamiento es 25 tokens, por lo que no es adecuado para frases o documentos completos.
- Restricciones de licencia: la licencia no está disponible en el repositorio; además, la terminología de entrenamiento no se distribuye por restricciones de UMLS.
- Uso clínico: no está destinado a decisiones clínicas directas; solo para tareas de NLP y estructuración de datos.
- Dependencia del modelo base: la calidad depende de `DT4H/CardioBERTa.sv`, que no tiene model card pública y no está desplegado en providers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.sv_P_translations_only
- Modelo base: https://huggingface.co/DT4H/CardioBERTa.sv
- Modelo hermano en italiano: https://huggingface.co/DT4H/CardioBERTa.it_P_translations_only
- Proyecto DataTools4Heart: https://github.com/DataTools4Heart/
- Página oficial del proyecto: https://www.datatools4heart.eu/
- Repositorio de NER en neerlandés (relacionado): https://github.com/UPOD-datascience/MedNER.nl/tree/main/
