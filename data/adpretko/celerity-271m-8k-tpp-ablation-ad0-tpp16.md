# adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp16

## Resumen

Celerity 271M 8K es un checkpoint de investigación de un modelo de lenguaje de 271 millones de parámetros, entrenado por el autor adpretko sobre la infraestructura Cerebras y publicado en Hugging Face. Se trata de un experimento de ablación centrado en el "tokens per parameter" (TPP) nominal de 16, dentro de una familia de variantes denominada Celerity. El modelo está pensado como material de estudio sobre dinámicas de entrenamiento y no como un modelo listo para producción.

La relevancia de esta ficha es limitada: el repositorio no incluye pipeline declarado, licencia, idiomas ni model card orientada a uso final. La información disponible se reduce a los hiperparámetros del experimento de entrenamiento y a la configuración de la arquitectura (contexto de 8192 tokens, embeddings posicionales ALiBi). El checkpoint fue entrenado con 4.332.584.960 tokens sobre el dataset CommonPile, en su variante "corrected no-repeat TPP pool", durante 12.020 pasos.

El modelo se distribuye en formato PyTorch con código personalizado (`custom_code`), lo que exige cargarlo con `trust_remote_code=True`. Su tamaño de repositorio es de 0,5 GB. No se han publicado benchmarks, demos ni documentación de uso más allá de la procedencia del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings posicionales ALiBi (según model card); detalles internos no disponibles |
| Parametros totales | 271M (según nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (maximum sequence length) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch`), con `custom_code`; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

La model card describe un transformer con embeddings posicionales de tipo ALiBi y una longitud máxima de secuencia de 8192 tokens. El entrenamiento se realizó sobre 3 sistemas CSX de Cerebras, con un runtime `cbcore 2.6.0`, y el checkpoint original (`checkpoint_12020.mdl`) fue convertido a formato Hugging Face mediante un conversor con commit `0e3d5d375695293479df9d2a3717f05f71a345b4`. El experimento se denomina `ad0_ild_tpp16` y corresponde a una ablación de TPP nominal de 16.

Los hiperparámetros documentados incluyen: batch global de 44, learning rate pico de 0,15, weight decay de 0,002842849281760314, tau_ema de 0,1950969310368566, 12.020 pasos de entrenamiento y 4.332.584.960 tokens procesados. El dropout de atención tiene un endpoint de 0 con escalado lineal por capa (es decir, no es un dropout uniforme, sino el extremo de una programación dependiente de la capa). El dropout residual, stochastic depth y LayerDrop son todos 0,0. El dataset empleado es CommonPile, en la variante "corrected no-repeat TPP pool". No se documenta uso de RLHF, DPO ni técnicas de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva a partir de un modelo de 271M de parámetros; no se documentan capacidades específicas más allá de la arquitectura descrita.
- Contexto de 8192 tokens, adecuado para tareas de modelado de lenguaje con ventanas relativamente largas para su tamaño.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se documentan modos especiales (thinking mode, visión, audio) ni capacidades multimodales.

## Casos de uso

- Investigación sobre escalado y TPP: el checkpoint permite reproducir y analizar el efecto de un TPP nominal de 16 en un modelo de 271M, comparándolo con otras variantes de la familia Celerity. Es su uso principal declarado como experimento de ablación.
- Estudio de dinámicas de dropout de atención: al ser el endpoint de una programación lineal por capa con valor 0, sirve como referencia para analizar el impacto del dropout de atención en el entrenamiento.
- Experimentos de modelado de lenguaje con contexto de 8K: útil para probar técnicas de evaluación sobre secuencias largas en modelos pequeños, con ALiBi como esquema posicional.
- Reproducción de pipelines de conversión Cerebras a Hugging Face: el repositorio documenta el commit del conversor y el checkpoint de origen, lo que facilita validar el proceso de conversión.
- Fine-tuning académico de bajo coste: con 271M de parámetros y pesos en 0,5 GB, es viable ajustarlo en una única GPU consumer para tareas de investigación.
- Evaluación de sesgos y calidad en modelos preentrenados sobre CommonPile: permite estudiar las características del corpus en un modelo pequeño antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de 271M en fp32 ocuparía aproximadamente 1,1 GB de pesos; en fp16/bf16, unos 0,55 GB; en int8, unos 0,27 GB. Estas cifras son estimaciones por parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría en GPUs consumer (por ejemplo, RTX 3060, RTX 4060, RTX 4090) y en aceleradores de datacenter (A100, H100), pero no hay validación publicada.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint (0,5 GB de repositorio), aunque no se documenta compatibilidad con backends concretos.
- Opciones de despliegue: no documentadas. El modelo requiere `trust_remote_code=True` y usa `custom_code`, lo que puede limitar la compatibilidad directa con vLLM, llama.cpp, Ollama o TGI sin adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | no disponible | Hugging Face, `custom_code` |
| Alternativas de ~270M | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. No se han publicado benchmarks ni especificaciones comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación y ablación, no un modelo alineado ni optimizado para uso en producción.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso comercial.
- No se declaran idiomas soportados; el rendimiento multilingüe es desconocido.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al entrenarse sobre CommonPile, puede heredar sesgos del corpus.
- Requiere `trust_remote_code=True` y código personalizado, lo que introduce riesgos de seguridad y de compatibilidad con herramientas estándar.
- No hay benchmarks publicados, por lo que no se puede validar su calidad frente a alternativas.
- El tamaño de 271M limita su capacidad de razonamiento complejo y de conocimiento factual en comparación con modelos mayores.
- La model card advierte que las tasas de dropout de atención distintas de cero son endpoints de una programación lineal por capa, no probabilidades uniformes; interpretar mal este dato puede llevar a conclusiones erróneas en experimentos.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp16
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
