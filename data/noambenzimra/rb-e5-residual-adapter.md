# NoamBenzimra/rb-e5-residual-adapter

## Resumen

El modelo `NoamBenzimra/rb-e5-residual-adapter` es un adaptador LoRA que forma parte del proyecto **Cross-Modal Residual Boosting (RB)**, desarrollado como trabajo final del curso NLP 097215 en el Technion (Israel). Su propósito es combinar información textual y tabular para tareas de clasificación, usando una estrategia novedosa: en lugar de predecir directamente la etiqueta objetivo, el adaptador se entrena para predecir los **residuos** de un modelo tabular CatBoost. De esta forma, la representación textual obtenida es complementaria por construcción a las características tabulares, mejorando el rendimiento conjunto.

El modelo base es `intfloat/e5-small-v2`, un encoder de embeddings de texto relativamente pequeño y eficiente. El adaptador se aplica mediante LoRA con rango 16 en las capas 9 a 11 del encoder. Se entrenó exclusivamente sobre el dataset `MUL_TEXT_PRODUCT_SENTIMENT` de MulTaBench, en el fold 0. Es un artefacto de investigación, no un modelo generalista: su uso está pensado para el pipeline de inferencia descrito en el repositorio del proyecto, no como un modelo autónomo.

La relevancia de este adaptador radica en su enfoque metodológico: demuestra cómo el ajuste fino con LoRA puede utilizarse para capturar información textual que complementa modelos tabulares tradicionales, una técnica aplicable a tareas de tabular + texto en entornos empresariales donde los datos mixtos son comunes. Sin embargo, su carácter experimental y su entrenamiento en un único dataset limitan su utilidad fuera del contexto académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre encoder transformer (base: `intfloat/e5-small-v2`) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 16 en capas 9-11) |
| Parametros activos | no disponible (es un adaptador, no un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base, e5-small-v2 soporta 512 tokens) |
| Tipos de cuantizacion | safetensors (formato nativo de PEFT) |
| Idiomas soportados | no disponible (probablemente ingles, por el dataset de entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el encoder `intfloat/e5-small-v2`, un transformer de tipo BERT con 12 capas y 33 millones de parametros. Sobre este, se aplica una adaptacion LoRA con rango 16 en las capas 9 a 11, lo que limita el numero de parametros entrenables y reduce el coste de entrenamiento.

La estrategia de entrenamiento es peculiar: en lugar de ajustar el modelo para predecir la etiqueta de clasificacion directamente, se entrena para predecir los **residuos** de un modelo tabular CatBoost. Es decir, el texto se convierte en un codificador residual que captura la informacion que las caracteristicas tabulares no han podido explicar. Esto se realiza sobre el dataset `MUL_TEXT_PRODUCT_SENTIMENT` de MulTaBench, en el fold 0, y no se mencionan tecnicas de RLHF o DPO. El resultado es un adaptador que produce representaciones textuales complementarias a las caracteristicas tabulares, mejorando la prediccion conjunta.

## Capacidades

- **Generacion de embeddings textuales residuales**: el adaptador produce representaciones de texto que, al combinarse con las predicciones de un modelo tabular, mejoran la precision en tareas de clasificacion de sentimiento.
- **Complementariedad con datos tabulares**: su entrenamiento residual garantiza que la informacion textual aporte valor adicional al modelo CatBoost, no redundante.
- **Integracion con pipelines de PEFT**: se carga mediante la libreria `peft` sobre el modelo base e5-small-v2, lo que facilita su uso en entornos de investigacion.
- **Capacidades limitadas**: no tiene soporte de tool calling, agentes, vision, audio ni multi-step reasoning. Es un adaptador de embedding para una tarea especifica.

## Casos de uso

- **Analisis de sentimiento de productos con datos mixtos**: en un escenario donde se dispone de reseñas de producto (texto) y de caracteristicas estructuradas (precio, categoria, valoraciones numericas), el adaptador se puede usar para generar embeddings de texto que, combinados con un modelo CatBoost entrenado sobre las caracteristicas tabulares, mejoran la precision de la clasificacion de sentimiento.
- **Sistemas de recomendacion con contexto textual**: si se dispone de descripciones de productos y atributos numericos (stock, ventas, etc.), el adaptador puede ayudar a capturar la informacion semantica que las caracteristicas numericas no capturan, mejorando la prediccion de preferencias.
- **Investigacion en aprendizaje multimodal texto-tabular**: como referencia de un metodo de adaptacion residual, puede servir para comparar tecnicas de fusion de datos en entornos academicos.
- **Prototipado rapido de modelos de clasificacion**: en un entorno de investigacion, se puede integrar este adaptador para explorar si la estrategia residual mejora el rendimiento en otros datasets tabulares con texto.
- **Enriquecimiento de caracteristicas en pipelines de ML**: el adaptador se usa para generar embeddings de texto que se concatenan con las caracteristicas tabulares como entrada de un modelo clasico (regresion logistica, gradient boosting), permitiendo una fusion sencilla.
- **Evaluacion de metodos de adaptacion en NLP**: como caso de estudio, puede utilizarse para comparar el rendimiento de la adaptacion LoRA con otros metodos de fine-tuning en tareas de texto-tabular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador se entrena sobre un solo dataset y no se proporcionan metricas comparativas con otros modelos o lineas base.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero al tratarse de un adaptador LoRA sobre un modelo base de 33M, la inferencia puede ejecutarse en una GPU con 4 GB de VRAM o menos (incluso en CPU).
- **GPU recomendada**: cualquier GPU consumer moderna (p. ej., NVIDIA GTX 1080, RTX 2060, RTX 3060) es suficiente para cargar el modelo base y el adaptador.
- **Cabe en consumer GPU**: si, es un modelo muy ligero.
- **Opciones de despliegue**: se puede ejecutar con `transformers` y `peft` en Python. No es compatible con vLLM, llama.cpp ni Ollama, ya que es un encoder LoRA para embeddings, no un modelo de generacion.
- **Latencia y throughput**: no disponible, pero al ser un encoder pequeno, la inferencia es rapida (del orden de milisegundos por texto).

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre adaptadores LoRA similares en el contexto de texto-tabular, ni se han publicado comparativas con otros modelos de la misma categoria.

## Limitaciones y advertencias

- **Alcance limitado**: el adaptador se entrena solo con un dataset (Mul `MUL_TEXT_PRODUCT_SENTIMENT`) y un solo fold, por lo que no es generalizable a otros dominios sin reentrenamiento.
- **Dependencia del modelo base**: la calidad de los embeddings depende de `intfloat/e5-small-v2`, que es un modelo pequeno y con capacidades de idioma limitadas (principalmente ingles).
- **Riesgo de alucinacion**: no aplica, ya que no es un modelo generativo.
- **Licencia desconocida**: no se especifica la licencia, por lo que no se garantiza el uso comercial.
- **Sesgos**: no se han evaluado sesgos de genero, raza u otros. El dataset de entrenamiento puede contener sesgos implicitos.
- **En produccion**: no se recomienda su uso en sistemas criticos sin una evaluacion exhaustiva y reentrenamiento con datos propios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NoamBenzimra/rb-e5-residual-adapter
- Modelo base: https://huggingface.co/intfloat/e5-small-v2
