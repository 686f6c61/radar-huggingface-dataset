# credible-ai/olmo2-1B-288domains-vertex-linear-hellaswag

## Resumen

`olmo2-1B-288domains-vertex-linear-hellaswag` es un modelo de lenguaje de 1,41 mil millones de parámetros preentrenado por credible-ai sobre 32B de tokens del corpus WebOrganizer, mezclando datos de 288 dominios (tema × formato) cuyos pesos de mezcla fueron optimizados mediante LinMix para maximizar el benchmark HellaSwag. Se trata de un artefacto de investigación diseñado para reproducir los experimentos del artículo de LinMix ("Data Mixing as Linear Domain Attribution", arXiv:2610.37390), no de un modelo de uso general.

La arquitectura subyacente es OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y tamaño oculto de 2048, y emplea el tokenizador GPT-NeoX-20B con un vocabulario de 50.432 tokens. El entrenamiento se realizó con la biblioteca OLMo-core de AllenAI, y los pesos se publican en bfloat16 bajo licencia MIT.

Su relevancia actual radica en la línea de investigación sobre optimización de mezclas de datos de preentrenamiento: LinMix ajusta un sustituto lineal sobre un "enjambre" de modelos proxy (en este caso, un modelo de 60M de parámetros) para predecir el rendimiento del modelo final, reduciendo el coste de la búsqueda de mezclas óptimas. Este modelo sirve como punto de comparación para validar ese método a escala de 1B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 (≈1,41B) |
| Parametros activos | no disponible (no se indica que sea MoE; se asume densidad completa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (pesos); datos de entrenamiento bajo CC-BY-4.0 y términos de Common Crawl |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2, una familia de transformers decoder-only totalmente abierta desarrollada por AllenAI. En esta variante concreta cuenta con 1,41B de parámetros, 18 capas y un tamaño oculto de 2048. El tokenizador es GPT-NeoX-20B, con una longitud de vocabulario de 50.432 tokens.

El entrenamiento cubrió 32B de tokens procedentes del corpus WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x. La innovación central del artefacto está en la mezcla de datos: el corpus se clasifica en 288 dominios (cruce de tema y formato), y los pesos de mezcla se optimizaron con LinMix, un método que ajusta un modelo sustituto lineal sobre un enjambre de modelos proxy (en este caso `credible-ai/olmo2-60M-288domains-vertex`, de 60M de parámetros) con utilidad lineal π (r = 0), orientado a maximizar HellaSwag. El entrenamiento se ejecutó con OLMo-core. La mezcla concreta utilizada está disponible en el archivo `mix.json` del repositorio. No se indica en la información disponible si hubo fases de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generación de texto en inglés (pipeline `text-generation`).
- Rendimiento orientado a HellaSwag (finalización de frases de sentido común), objetivo para el que se optimizó la mezcla de datos.
- No es un modelo de uso general: la model card lo advierte explícitamente.
- No hay indicios de capacidades de visión, audio, tool calling ni soporte de agentes.
- Capacidades multilingües: no disponibles; el modelo está limitado al inglés y al tokenizador GPT-NeoX-20B.

## Casos de uso

- Reproducción de los experimentos del artículo LinMix: el modelo existe precisamente para verificar los resultados de arXiv:2610.37390 a escala de 1B, comparando mezclas optimizadas frente a mezclas de referencia.
- Investigación en optimización de mezclas de datos: permite estudiar cómo la atribución lineal de dominios predice el rendimiento de modelos mayores a partir de proxies de 60M.
- Estudio de la influencia de datos por dominio: gracias a `mix.json` y a la clasificación en 288 dominios, se pueden analizar efectos de la composición del corpus en benchmarks concretos.
- Baseline para benchmarks de sentido común: puede usarse como punto de referencia en HellaSwag y tareas similares en inglés dentro de estudios controlados.
- Comparación de recetas de preentrenamiento: sirve de contraste frente a otros modelos OLMo 2 de tamaño similar entrenados con mezclas de datos distintas.
- Docencia y formación en entrenamiento de LLM: su tamaño (1,4B) y la apertura completa (datos, mezcla y código) lo hacen adecuado para prácticas de preentrenamiento o fine-tuning en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la mezcla se optimizó para HellaSwag, pero no incluye la puntuación obtenida ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,41B de parámetros en bfloat16, el repo ocupa unos 2,8 GB; se estima una necesidad de aproximadamente 3-4 GB de VRAM para inferencia en bfloat16, y menos si se aplica cuantización (no publicada oficialmente).
- GPU recomendadas: cualquier GPU moderna de gama media es suficiente; no se requieren aceleradores de centro de datos (A100/H100) para inferencia. Para reentrenamiento a esta escala sí pueden ser necesarias múltiples GPUs, aunque no se publica el coste de entrenamiento.
- Consumer GPUs: cabe cómodamente en GPUs como la RTX 3060 (12 GB), RTX 4060 Ti o superiores, incluso sin cuantizar.
- Opciones de despliegue: carga nativa con `transformers` (`AutoModelForCausalLM`); al estar en safetensors y ser compatible con el ecosistema OLMo 2, debería funcionar con llama.cpp, Ollama y vLLM previa conversión, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| credible-ai/olmo2-1B-288domains-vertex-linear-hellaswag | 1,41B | no disponible | Artefacto de investigación (LinMix, HellaSwag) | MIT | Pesos abiertos en Hugging Face |
| credible-ai/olmo2-60M-288domains-vertex | 60M | no disponible | Modelo proxy del enjambre LinMix | no disponible | Pesos abiertos en Hugging Face |
| OLMo 2 1B (AllenAI) | ≈1B | no disponible | Modelo de lenguaje general abierto | Apache 2.0 (familia OLMo 2) | Pesos, datos y receta abiertos |

La comparación más pertinente es con el OLMo 2 1B original de AllenAI, ya que comparte arquitectura y tokenizador; la diferencia sustantiva está en la mezcla de datos optimizada con LinMix frente a la mezcla estándar. No se dispone de puntuaciones comparativas publicadas.

## Limitaciones y advertencias

- No es un modelo de uso general: la propia model card advierte que es un artefacto de investigación para reproducir el artículo de LinMix.
- Restringido al inglés; no apto para aplicaciones multilingües.
- Optimizado para HellaSwag, por lo que su rendimiento en otras tareas (código, razonamiento matemático, seguimiento de instrucciones) puede ser deficiente o impredecible.
- Datos de entrenamiento derivados de Common Crawl: pueden contener sesgos, contenido tóxico o errores factuales presentes en la web; riesgo de alucinación típico de modelos de base sin alineación.
- No hay indicios de RLHF, DPO ni ajuste por instrucciones, por lo que no es adecuado para asistentes o chat.
- Licencia MIT en los pesos, pero los datos de entrenamiento están sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl, lo que puede imponer condiciones sobre redistribución de derivados de datos.
- Longitud de contexto no documentada; verificar antes de usar en tareas de secuencia larga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-vertex-linear-hellaswag
- Artículo LinMix (arXiv): https://arxiv.org/abs/2610.37390
- Código de LinMix: https://github.com/credibleai/linmix
- Modelo proxy (enjambre): https://huggingface.co/credible-ai/olmo2-60M-288domains-vertex
- Corpus de entrenamiento: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Corpus tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM original: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentación de OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core (biblioteca de entrenamiento): https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
