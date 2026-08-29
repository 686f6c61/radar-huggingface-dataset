# Islamamro/bbc-news-aurora-islamamro

## Resumen

El modelo `Islamamro/bbc-news-aurora-islamamro` es un clasificador de texto de cinco clases (business, entertainment, politics, sport y tech) desarrollado por el usuario Islamamro mediante el **Aurora Research Portal**, una plataforma que permite construir, entrenar y publicar modelos de extremo a extremo. Se trata de un fine-tuning de `distilbert-base-uncased` sobre el dataset `SetFit/bbc-news`, con el objetivo de demostrar el flujo de trabajo de Aurora más que de ofrecer un modelo listo para producción.

Con 66,96 millones de parámetros y un tamaño de repositorio de 0,3 GB, el modelo es ligero y adecuado para entornos con recursos limitados. La model card indica una precisión del 0,98 en un conjunto de validación reservado, pero advierte explícitamente de que fue entrenado sobre un subconjunto de solo 1.400 ejemplos, por lo que su rendimiento en datos reales puede ser significativamente inferior. Su relevancia actual radica en servir como ejemplo reproducible de fine-tuning de DistilBERT para clasificación de noticias, más que como una herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT base (encoder transformer, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 66.957.317 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base DistilBERT soporta 512 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (inferido del dataset BBC News y del tokenizador uncased) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, una version destilada de BERT que conserva el 97 % de su rendimiento con un 40 % menos de parametros. La arquitectura es un transformer encoder de 6 capas con 768 unidades ocultas y 12 cabezas de atencion, disenado para tareas de comprension del lenguaje. El fine-tuning se realizo sobre el dataset `SetFit/bbc-news`, que contiene articulos de la BBC etiquetados en cinco categorias tematicas.

El entrenamiento se llevo a cabo en una NVIDIA RTX 3090 a traves del pipeline de Aurora Research Portal. La model card no detalla el numero de epocas, el learning rate ni otras hiperparametros, pero indica que se utilizo un subconjunto de 1.400 ejemplos, lo que sugiere un entrenamiento rapido y de validacion de concepto. No se menciona el uso de tecnicas como RLHF o DPO; se trata de un fine-tuning supervisado clasico sobre una tarea de clasificacion.

## Capacidades

- Clasificacion de texto en cinco categorias: business, entertainment, politics, sport y tech.
- Inferencia rapida gracias al tamano reducido de DistilBERT (67 M de parametros).
- Integracion sencilla con la API `pipeline` de HuggingFace Transformers.
- Soporte para lotes de texto y clasificacion en tiempo real en entornos con recursos limitados.
- No dispone de capacidades de generacion de texto, tool calling, agentes, vision ni audio.
- Capacidad multilingue limitada: el modelo base es uncased en ingles, por lo que solo es fiable para textos en ese idioma.

## Casos de uso

- **Clasificacion de noticias en tiempo real**: un medio digital puede usar el modelo para etiquetar automaticamente sus articulos en secciones (negocios, entretenimiento, politica, deportes, tecnologia) antes de publicarlos. Su tamano reducido permite ejecutarlo en un servidor modesto o incluso en un endpoint serverless.
- **Filtrado de feeds RSS**: agregadores de noticias pueden clasificar los titulares y resumenes de multiples fuentes para organizarlos por tema, facilitando la curacion de contenidos para boletines o paneles de noticias.
- **Analisis de tendencias sectoriales**: una empresa de inteligencia de mercado puede procesar miles de articulos de BBC para medir la frecuencia de temas (por ejemplo, cuantas noticias de tecnologia aparecen por semana) y extraer correlaciones con eventos economicos.
- **Moderacion de contenido en foros**: el modelo puede ayudar a categorizar publicaciones de usuarios en foros tematicos, aunque su precision limitada por el entrenamiento reducido exige una validacion humana posterior.
- **Enriquecimiento de datasets**: investigadores que necesiten etiquetar grandes volumenes de texto en ingles pueden usar este modelo como pre-etiquetador para luego refinar las etiquetas manualmente, reduciendo el esfuerzo de anotacion.
- **Demostracion educativa**: sirve como ejemplo practico de fine-tuning de DistilBERT para estudiantes que quieran entender el flujo completo de entrenamiento y publicacion de un modelo de clasificacion, gracias a su simplicidad y a la documentacion del proceso Aurora.

## Benchmarks y rendimiento

La model card reporta una **precision del 0,98** en un conjunto de validacion reservado, pero no especifica el tamano de dicho conjunto ni la metodologia exacta. Dado que el entrenamiento se realizo sobre solo 1.400 ejemplos, esta cifra debe interpretarse con cautela: es probable que el modelo sufra sobreajuste y que su rendimiento en datos no vistos sea considerablemente menor. No se han publicado resultados en benchmarks estandar como MMLU, GLUE o SuperGLUE, ni comparaciones con otros modelos de clasificacion de noticias.

## Requisitos de hardware

- **VRAM estimada**: el modelo en precision fp32 ocupa aproximadamente 268 MB (66,96 M de parametros × 4 bytes). Con cuantizacion a int8, la huella se reduce a unos 67 MB, y en 4 bits a unos 34 MB.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una NVIDIA RTX 3090 (como la usada en el entrenamiento) es mas que adecuada para inferencia; tambien funciona en GPUs integradas o incluso en CPU.
- **Compatibilidad con GPU de consumo**: si, cabe en cualquier GPU consumer moderna (GTX 1060, RTX 2060, etc.) y tambien en Apple Silicon.
- **Opciones de despliegue**: se puede servir con `transformers` (pipeline), `vLLM` (aunque esta pensado para generacion, soporta clasificacion), `llama.cpp` (con conversion a GGUF), `Ollama` (si se convierte) o `TGI` (Text Generation Inference). Para clasificacion, la opcion mas sencilla es un endpoint FastAPI con `transformers`.
- **Latencia y throughput**: al ser un modelo pequeno, la inferencia en CPU tarda del orden de 10-30 ms por texto corto; en GPU, menos de 5 ms. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de clasificacion de noticias. Como referencia cualitativa, se puede comparar con otros fine-tunings de DistilBERT sobre el mismo dataset o con modelos como `bert-base-uncased` (110 M de parametros) o `roberta-base` (125 M), que suelen lograr precisiones similares o superiores pero con mayor coste computacional. La tabla siguiente resume las diferencias estructurales:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Islamamro/bbc-news-aurora-islamamro` | 66,96 M | 512 (estandar DistilBERT) | Apache 2.0 | Entrenado en 1.400 ejemplos, no apto para produccion |
| `distilbert-base-uncased` (base) | 66,96 M | 512 | Apache 2.0 | Modelo base sin fine-tuning |
| `bert-base-uncased` | 110 M | 512 | Apache 2.0 | Mas pesado, requiere mas VRAM |
| `roberta-base` | 125 M | 512 | MIT | Alternativa robusta, mejor en algunos benchmarks |

## Limitaciones y advertencias

- **Entrenamiento insuficiente**: la model card advierte explicitamente de que se trata de una prueba del pipeline Aurora, no de un modelo de produccion. Los 1.400 ejemplos de entrenamiento son una fraccion muy pequena del dataset completo, lo que provoca un alto riesgo de sobreajuste y una generalizacion pobre.
- **Sesgos del dataset**: al entrenarse sobre noticias de la BBC, el modelo puede reflejar los sesgos editoriales y geograficos de esa fuente (predominio de noticias del Reino Unido, enfoque anglocentrico).
- **Riesgo de alucinacion**: aunque es un clasificador y no genera texto, puede asignar etiquetas incorrectas con alta confianza, especialmente en textos ambiguos o de dominios no representados en el entrenamiento.
- **Limitaciones de idioma**: solo es fiable en ingles; el tokenizador uncased no maneja bien otros idiomas ni caracteres acentuados.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de rendimiento ni soporte. El usuario debe validar el modelo con sus propios datos antes de usarlo en produccion.
- **Contexto limitado**: la longitud maxima de 512 tokens (estandar de DistilBERT) impide clasificar articulos largos completos; habria que truncar o dividir el texto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Islamamro/bbc-news-aurora-islamamro)
- [Dataset SetFit/bbc-news](https://huggingface.co/datasets/SetFit/bbc-news)
- [Modelo base distilbert-base-uncased](https://huggingface.co/distilbert-base-uncased)
