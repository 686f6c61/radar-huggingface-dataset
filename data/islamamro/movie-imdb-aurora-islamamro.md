# Islamamro/movie-imdb-aurora-islamamro

## Resumen

El modelo `Islamamro/movie-imdb-aurora-islamamro` es un clasificador de texto binario para análisis de sentimiento en reseñas de películas de IMDb, desarrollado por el usuario `islamamro` mediante el **Aurora Research Portal**. Se trata de un fine-tuning del modelo `distilbert-base-uncased` sobre el dataset `stanfordnlp/imdb`, con el objetivo de clasificar reseñas como positivas o negativas.

El modelo cuenta con 66,9 millones de parámetros y una arquitectura transformer basada en DistilBERT, una versión destilada de BERT que reduce el tamaño y la latencia manteniendo un rendimiento competitivo. La longitud de contexto es de 512 tokens, heredada de su modelo base. Su relevancia radica en que es una demostración práctica del pipeline de entrenamiento y publicación del portal Aurora, más que un modelo listo para producción: fue entrenado únicamente con un subconjunto de 1.400 ejemplos del dataset IMDb, alcanzando una precisión del 0,81 en el conjunto de validación.

La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. El repositorio ocupa 0,3 GB e incluye únicamente pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 12 cabezas de atencion) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en precision completa) |
| Idiomas soportados | ingles (modelo base entrenado en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en **DistilBERT**, una version destilada de BERT que conserva el 97 % de su rendimiento con un 40 % menos de parametros. La arquitectura es un transformer encoder con 6 capas ocultas, 12 cabezas de atencion y una dimension de embedding de 768. El proceso de destilacion original utilizo el logit de la capa de clasificacion de BERT-base como funcion de perdida, combinado con perdida de soft target y de atencion.

El fine-tuning se realizo sobre el dataset `stanfordnlp/imdb`, que contiene 25.000 reseñas de entrenamiento y 25.000 de test. Sin embargo, el autor indica que solo se utilizo un **subconjunto de 1.400 ejemplos** como demostracion del pipeline de Aurora. El entrenamiento se llevo a cabo en una NVIDIA RTX 3090. No se menciona el uso de tecnicas como RLHF o DPO; se trata de un fine-tuning clasico de clasificacion con una cabeza de clasificacion binaria.

## Capacidades

- Clasificacion de sentimiento binario: clasifica reseñas de peliculas como positivas o negativas.
- Procesamiento de texto en ingles: hereda las capacidades de comprension linguistica de DistilBERT.
- Inferencia rapida: al ser un modelo destilado, ofrece menor latencia que BERT-base.
- Integracion con Hugging Face Transformers: se puede usar directamente con la API `pipeline` de transformers.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- **Demostracion de pipelines de entrenamiento**: el caso de uso principal declarado por el autor es validar el flujo build-train-publish del portal Aurora Research. Sirve como plantilla para desarrolladores que quieran replicar el proceso con sus propios datos.
- **Prototipado rapido de clasificacion de sentimiento**: un equipo puede integrar este modelo en un entorno de desarrollo para probar rapidamente un sistema de analisis de opiniones antes de entrenar un modelo con el dataset completo.
- **Ensenanza de fine-tuning en NLP**: por su tamano reducido y su entrenamiento simple, es util como ejemplo didactico en cursos o tutoriales sobre transfer learning con DistilBERT.
- **Analisis de reseñas a pequena escala**: para proyectos personales o academicos con volumenes bajos de datos y requisitos de precision moderados, puede servir como clasificador basico.
- **Prueba de infraestructura de despliegue**: al ser un modelo pequeno, es adecuado para probar pipelines de despliegue en CPU o GPU de gama baja, validando la infraestructura antes de usar modelos mas grandes.
- **Comparacion de tecnicas de destilacion**: investigadores pueden usarlo como punto de partida para comparar el rendimiento de DistilBERT frente a otras arquitecturas destiladas en la tarea de sentimiento.

## Benchmarks y rendimiento

El autor reporta una **precision del 0,81** en un conjunto de validacion no especificado. No se han publicado resultados en benchmarks estandar como MMLU, GLUE o SuperGLUE. Dado que el entrenamiento se realizo con solo 1.400 ejemplos, es esperable que el rendimiento sea significativamente inferior al de un modelo entrenado con el dataset completo de IMDb (que suele alcanzar precisiones superiores a 0,90 con DistilBERT).

| Benchmark | Resultado |
|---|---|
| Precision en validacion (reportada por el autor) | 0,81 |
| MMLU | no disponible |
| GLUE | no disponible |
| HumanEval | no aplica (modelo de clasificacion, no de generacion) |

## Requisitos de hardware

- **VRAM estimada para inferencia**: menos de 1 GB en precision FP32 (el modelo ocupa aproximadamente 268 MB en memoria).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA GTX 1050 Ti o superior puede ejecutarlo sin problemas. Tambien funciona en CPU con latencia aceptable.
- **Compatibilidad con GPU de consumo**: si, cabe en cualquier GPU consumer moderna, incluidas las series GTX 10, RTX 20/30/40 y equivalentes de AMD.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, ONNX Runtime, TorchServe y cualquier framework que soporte safetensors. No se han publicado archivos GGUF para llama.cpp ni configuraciones para vLLM u Ollama.
- **Latencia estimada**: en CPU, la inferencia de un texto corto (menos de 100 tokens) tarda entre 10 y 50 ms. En GPU, la latencia es inferior a 5 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision IMDb (full dataset) | Licencia |
|---|---|---|---|---|
| Islamamro/movie-imdb-aurora-islamamro | 66,9 M | 512 | 0,81 (con 1.400 ejemplos) | Apache 2.0 |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 | ~0,91 (SST-2, no IMDb) | Apache 2.0 |
| bert-base-uncased (fine-tuned en IMDb) | 110 M | 512 | ~0,93 | Apache 2.0 |
| roberta-base (fine-tuned en IMDb) | 125 M | 512 | ~0,95 | MIT |

La comparativa muestra que el modelo de `islamamro` tiene un rendimiento inferior a los fine-tunings completos de IMDb, lo cual es esperable dado el reducido conjunto de entrenamiento. Su ventaja principal es la simplicidad y el bajo coste computacional.

## Limitaciones y advertencias

- **Entrenamiento con datos insuficientes**: el modelo fue entrenado con solo 1.400 ejemplos, lo que limita su capacidad de generalizacion. El propio autor advierte que no es un modelo de produccion.
- **Precision limitada**: el 0,81 de precision es bajo para la tarea de analisis de sentimiento en IMDb, donde los modelos bien entrenados superan el 0,90.
- **Sesgo del dataset IMDb**: las reseñas de IMDb tienen un sesgo hacia peliculas en ingles y una distribucion de opiniones particular. El modelo puede no funcionar bien en otros dominios (reseñas de productos, opiniones politicas, etc.).
- **Riesgo de alucinacion**: al ser un modelo de clasificacion, no genera texto, por lo que el riesgo de alucinacion es bajo. Sin embargo, puede producir clasificaciones erroneas con alta confianza.
- **Solo ingles**: no soporta otros idiomas. El modelo base fue entrenado unicamente en ingles.
- **Contexto limitado a 512 tokens**: las reseñas mas largas seran truncadas, perdiendo informacion relevante.
- **Sin cuantizaciones disponibles**: no se ofrecen versiones cuantizadas (GGUF, INT8, etc.), lo que limita el despliegue en entornos con restricciones de memoria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Islamamro/movie-imdb-aurora-islamamro)
- [Dataset stanfordnlp/imdb](https://huggingface.co/datasets/stanfordnlp/imdb)
- [Modelo base distilbert-base-uncased](https://huggingface.co/distilbert-base-uncased)
- [Perfil de GitHub del autor](https://github.com/islamamro)
- [Pagina de IMDb](https://www.imdb.com/)
