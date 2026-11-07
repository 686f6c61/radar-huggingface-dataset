# BaoNhan/CafeBERT_Vietnamese_News_Classification

## Resumen

CafeBERT_Vietnamese_News_Classification es un ajuste fino (fine-tuning) del modelo encoder uitnlp/CafeBERT para la clasificación de noticias vietnamitas en 10 categorías. Lo desarrolla BaoNhan como parte del benchmark BN-VN3S, un conjunto de datos de noticias en vietnamita utilizado en un estudio comparativo de encoders transformer publicado en PLOS ONE. El modelo resuelve una tarea concreta de clasificación de texto monolingüe: asignar una de diez etiquetas temáticas a un artículo de noticias en vietnamita.

La relevancia del modelo es fundamentalmente metodológica: no se distribuye como un modelo de propósito general, sino como un paquete de reproducibilidad. El repositorio incluye checkpoints de varios seeds, métricas de test, matrices de confusión y las predicciones a nivel de artículo para las 94.670 noticias del conjunto de test. Esto lo convierte en una referencia útil para investigadores que quieran replicar o comparar resultados de encoders transformer en vietnamita.

Arquitectura y tamaño: al derivar de uitnlp/CafeBERT, que a su vez se basa en XLM-RoBERTa, se trata de un encoder transformer de la familia XLM-R con aproximadamente 278 millones de parámetros (configuración base de XLM-R), aunque el dato exacto no se detalla en la información disponible. La longitud de contexto heredada de XLM-R es de 512 tokens. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, via uitnlp/CafeBERT) |
| Parametros totales | no disponible (familia XLM-R base, ~278M segun la arquitectura de referencia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion (XLM-R admite 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto multi-clase (10 categorias) |
| Modelo base | uitnlp/CafeBERT |
| Dataset de ajuste | BN-VN3S (noticias vietnamitas) |
| Tamano del repositorio | 6.8 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia XLM-RoBERTa. El modelo base, uitnlp/CafeBERT, parte de XLM-RoBERTa y se refuerza con un corpus vietnamita de gran escala y múltiples dominios, lo que le proporciona una representación lingüística específica del vietnamita superior a la de XLM-R genérico. Sobre esa base, BaoNhan aplica un ajuste fino supervisado para clasificación de noticias en 10 categorías, con una cabeza de clasificación sobre la representación del token [CLS].

El entrenamiento se realizó sobre el conjunto BN-VN3S y se repitió con varios seeds, generando checkpoints independientes por seed junto con los logs de entrenamiento (`trainer_state.json`). El conjunto de test contiene 94.670 artículos, para los que el repositorio publica las predicciones a nivel de artículo con etiqueta real, etiqueta predicha y probabilidades por clase. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de regularización o aumentación de datos más allá del ajuste fino estándar.

## Capacidades

- Clasificación de texto multi-clase en vietnamita: asigna una de 10 categorías temáticas a artículos de noticias.
- Salida de probabilidades por clase, útil para umbrales de confianza y análisis de calibración.
- Entrenamiento multi-seed con checkpoints y métricas por ejecución, lo que permite análisis de varianza entre inicializaciones.
- Predicciones a nivel de artículo para el conjunto de test, que facilitan la inspección cualitativa de errores.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un encoder discriminativo.
- Capacidad multilingüe limitada al vietnamita en la práctica, aunque la base XLM-R tenga cobertura multilingüe.

## Casos de uso

- Clasificación automática de noticias en portales y agregadores vietnamitas: el modelo asigna una de 10 categorías a cada artículo, lo que permite enrutar contenido a secciones o etiquetas sin intervención manual.
- Moderación y organización de contenidos editoriales: con las probabilidades por clase se pueden marcar artículos de baja confianza para revisión humana, reduciendo el coste de curación.
- Investigación en procesamiento del lenguaje natural en vietnamita: el paquete de checkpoints, métricas y predicciones permite replicar el benchmark BN-VN3S y comparar encoders de forma controlada.
- Construcción de datasets etiquetados: las predicciones del conjunto de test pueden usarse como referencia para evaluar otros clasificadores o para preetiquetar nuevos corpus con revisión posterior.
- Análisis de tendencias temáticas: clasificar grandes volúmenes de noticias permite agregar estadísticas por categoría a lo largo del tiempo para estudios de medios.
- Detección de desequilibrios de clase: las matrices de confusión publicadas ayudan a identificar categorías problemáticas antes de desplegar un clasificador en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona métricas de test, matrices de confusión y predicciones por seed en el repositorio, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Para un encoder de la familia XLM-R base, la inferencia en fp32 requiere del orden de 1-2 GB de VRAM, y menos de 1 GB en cuantización de 8 bits, pero estos valores son estimaciones arquitectónicas y no datos publicados por el autor.
- GPU recomendadas: no disponible. Un encoder de este tamaño puede ejecutarse en GPU consumer (RTX 3060, RTX 4090) y en CPU para lotes pequeños.
- Despliegue: el formato safetensors es compatible con Hugging Face Transformers, y por extensión con Text Generation Inference no aplica (es clasificación), pero sí con pipelines de `transformers` y con servidores de inferencia de clasificación. No se mencionan opciones como vLLM, llama.cpp u Ollama, que están orientadas a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BaoNhan/CafeBERT_Vietnamese_News_Classification | ~278M (familia XLM-R) | no disponible (512 en XLM-R) | Clasificacion de noticias (10 clases) | MIT | Hugging Face |
| uitnlp/CafeBERT | ~278M (familia XLM-R) | 512 | Modelo base multilingue con refuerzo vietnamita | no disponible en la informacion | Hugging Face |
| BaoNhan/cafebert-vifn | ~278M (familia XLM-R) | 512 | Clasificacion binaria de fake news en vietnamita | no disponible en la informacion | Hugging Face |
| XLM-RoBERTa base | ~278M | 512 | Modelo base multilingue | MIT | Hugging Face |

## Limitaciones y advertencias

- Modelo monolingüe en la práctica: entrenado y evaluado solo en vietnamita; su rendimiento en otros idiomas no está caracterizado.
- Es un clasificador cerrado de 10 categorías: no genera texto ni responde preguntas, por lo que no debe presentarse como un modelo de propósito general.
- Riesgo de sesgo de dominio: el conjunto BN-VN3S determina las categorías y el estilo de las noticias; el rendimiento puede degradarse en otros géneros textuales o registros.
- Riesgo de error en clases minoritarias: no se dispone de métricas por clase en la información proporcionada, por lo que no puede descartarse un desequilibrio de rendimiento entre categorías.
- Alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza, especialmente en textos ambiguos o de frontera entre categorías.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base uitnlp/CafeBERT y del dataset BN-VN3S antes de un despliegue en producción.
- Repositorio de gran tamaño (6.8 GB) por incluir múltiples checkpoints por seed; la descarga completa no es necesaria si solo se usa un checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BaoNhan/CafeBERT_Vietnamese_News_Classification
- Modelo base uitnlp/CafeBERT: https://huggingface.co/uitnlp/CafeBERT
- Modelo relacionado BaoNhan/cafebert-vifn: https://huggingface.co/BaoNhan/cafebert-vifn
- Código del benchmark: https://github.com/chaubaonhan/chaubaonhan-vietnamese-news-encoder-benchmark
- Artículo relacionado sobre detección de fake news en vietnamita: https://www.researchgate.net/publication/390212802_Utilizing_Transformer_Models_To_Detect_Vietnamese_Fake_News_on_Social_Media_Platforms
