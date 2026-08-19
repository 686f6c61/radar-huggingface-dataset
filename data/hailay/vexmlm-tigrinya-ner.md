# Hailay/VEXMLM-Tigrinya-NER

## Resumen

VEXMLM-Tigrinya-NER es un modelo de reconocimiento de entidades nombradas (NER) para el tigriña, una lengua etíope escrita en alfabeto ge'ez, desarrollado por Hailay Kidu Teklehaymanot y colaboradores. Se trata de un fine-tuning del modelo Hailay/VEXMLM, que a su vez es una extensión de XLM-R con un vocabulario ampliado con 30.000 subpalabras ge'ez, diseñado para mejorar el rendimiento en lenguas africanas de escritura ge'ez como el amhárico y el tigriña. El modelo resuelve el problema de la falta de recursos de PLN para lenguas de bajo recurso, ofreciendo una herramienta de etiquetado de entidades con 11 clases en formato BIO (PER, ORG, LOC, DATE, MISC).

El modelo se publica con cinco checkpoints independientes (semillas 42 a 46), cada uno fine-tuneado con la misma configuración, y el rendimiento reportado es la media ± desviación estándar sobre las cinco ejecuciones. Los resultados en el split de test del dataset Tigrinya NER alcanzan una Entity-F1 de 72.82 ± 0.79, una Macro-F1 de 82.19 ± 0.69 y una precisión del 95.15 %. Está disponible bajo licencia Apache 2.0 y su implementación oficial está en el repositorio GitHub del proyecto VEXMLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `XLMRobertaForTokenClassification` (fine-tune de XLM-R con vocabulario extendido) |
| Parametros totales | No disponible (basado en XLM-R base, no especificado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 (máximo de secuencia usado en entrenamiento; el modelo base XLM-R soporta 512) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Tigriña (ti); el modelo base cubre también amhárico |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de `Hailay/VEXMLM`, un XLM-R cuyo vocabulario SentencePiece se amplió de 250.000 a 280.002 subwords mediante la fusión de 30.000 tokens ge'ez, seguido de un pretraining continuado con MLM. Sobre esta base se fine-tunea un clasificador de token para NER, con una cabeza de clasificación sobre las 11 etiquetas BIO. El fine-tuning se realizó con una configuración única: longitud máxima de secuencia 256, batch size 32, 4 épocas, learning rate 2e-5 con decaimiento lineal y 10 % de warmup, weight decay 0.01, clipping de gradiente 1.0, optimizador AdamW y precisión bf16. Se entrenaron todos los parámetros del modelo en una única GPU NVIDIA A100.

El entrenamiento se diseñó para ser bit-reproducible, usando `enable_full_determinism`, `CUBLAS_WORKSPACE_CONFIG=:4096:8` y `dataloader_num_workers=0`. Se publican cinco checkpoints (semillas 42-46) y el rendimiento reportado es la media sobre las cinco ejecuciones independientes. El dataset de entrenamiento proviene principalmente de dominios religiosos y de noticias, lo que condiciona la distribución de las entidades.

## Capacidades

- Reconocimiento de entidades nombradas en tigriña: personas (PER), organizaciones (ORG), lugares (LOC), fechas (DATE) y miscelánea (MISC), en formato BIO.
- Etiquetado de secuencias a nivel de token (token classification) con la librería Transformers de HuggingFace.
- Soporte para entrada de texto arbitrario en tigriña, con predicción de spans de entidades.
- Reproducibilidad completa: se proporcionan cinco semillas y scripts de evaluación para regenerar las métricas.
- Compatible con el pipeline `token-classification` de HuggingFace y con despliegue mediante endpoints compatibles.

## Casos de uso

- **Extracción de entidades en textos periodísticos**: el modelo puede procesar artículos de noticias en tigriña para extraer personas, organizaciones y lugares, facilitando la construcción de bases de datos de conocimiento o sistemas de recomendación de noticias.
- **Análisis de documentos históricos y religiosos**: dado que el corpus de entrenamiento incluye textos religiosos, el modelo es adecuado para digitalizar y anotar manuscritos ge'ez, identificando referencias a personajes, lugares y fechas.
- **Sistemas de atención al cliente en tigriña**: integrado en un pipeline de procesamiento de lenguaje natural, puede extraer entidades de consultas de usuarios (nombres de productos, ubicaciones, fechas) para enrutar solicitudes o alimentar bases de conocimiento.
- **Investigación en lingüística computacional**: sirve como herramienta de anotación automática para crear corpus NER en tigriña, reduciendo el esfuerzo manual de etiquetado.
- **Monitoreo de redes sociales**: permite detectar menciones de organizaciones, personas o lugares en publicaciones en tigriña, útil para análisis de opinión o seguimiento de eventos.
- **Sistemas de búsqueda semántica**: al extraer entidades de documentos, se puede indexar contenido por entidades para mejorar la recuperación de información en motores de búsqueda específicos de la lengua.

## Benchmarks y rendimiento

El modelo reporta resultados sobre el split de test del dataset Tigrinya NER, evaluado con cinco semillas independientes (42-46). Los valores son media ± desviación estándar:

| Metrica | Valor |
|---|---|
| Entity-F1 | 72.82 ± 0.79 |
| Macro-F1 | 82.19 ± 0.69 |
| Accuracy | 95.15 ± 0.05 |

No se han publicado comparaciones con otros modelos en la información disponible. La model card indica que las comparaciones de línea base en el paper son de una sola semilla, mientras que estos resultados provienen de la evaluación de cinco semillas.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo basado en XLM-R base (aproximadamente 278M de parámetros, aunque no confirmado), la inferencia en bf16 requiere alrededor de 600 MB de VRAM para el modelo, más memoria para activaciones. Con secuencias de 256 tokens, cabe en GPUs con 2 GB de VRAM o más.
- **GPUs recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para fine-tuning se usó una NVIDIA A100 (40 GB), pero entrenamientos más pequeños pueden caber en GPUs de 16 GB.
- **Compatibilidad con GPUs de consumo**: sí, modelos de esta escala se ejecutan en RTX 3060, RTX 4060, etc.
- **Opciones de despliegue**: compatible con HuggingFace Transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con endpoints de HuggingFace.
- **Latencia y throughput**: no se han publicado datos específicos, pero en una GPU moderna la inferencia por secuencia de 256 tokens es del orden de milisegundos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos NER para tigriña en la documentación proporcionada. El modelo es, hasta donde se conoce, uno de los primeros NER específicos para tigriña basado en XLM-R extendido. Se podría comparar con modelos multilingües como XLM-R base o mBERT aplicados a NER en tigriña, pero no se han publicado dichas comparaciones.

## Limitaciones y advertencias

- **Idioma y dominio**: el modelo está fine-tuneado únicamente para tigriña y solo para la tarea NER. Su rendimiento en otros idiomas, dominios o esquemas de etiquetado no está caracterizado.
- **Cobertura del modelo base**: el base VEXMLM solo cubre amhárico y tigriña; otras lenguas de escritura ge'ez no se incluyeron en el pretraining.
- **Sesgos de dominio**: los corpus de entrenamiento provienen mayoritariamente de textos religiosos y noticias, por lo que el modelo puede reflejar las distribuciones y sesgos de estos dominios.
- **Configuración única**: no se realizó búsqueda de hiperparámetros; las comparaciones de línea base en el paper son de una sola semilla, lo que limita la generalización de las conclusiones.
- **Uso interactivo**: las predicciones sobre texto arbitrario son demostraciones y no reproducen necesariamente las métricas del benchmark.
- **Licencia**: Apache 2.0, permite uso comercial con atribución, pero se recomienda revisar los términos del modelo base (XLM-R, también Apache 2.0).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Hailay/VEXMLM-Tigrinya-NER)
- [Modelo base VEXMLM](https://huggingface.co/Hailay/VEXMLM)
- [Repositorio oficial en GitHub](https://github.com/hailaykidu/VEXMLM)
- Paper: "Expanding the Lexicon of Ge'ez Based African Languages: A Comparative Study of Amharic and Tigrinya" (aceptado en LM4UC Workshop, IJCAI 2026) — no se proporciona enlace directo.
