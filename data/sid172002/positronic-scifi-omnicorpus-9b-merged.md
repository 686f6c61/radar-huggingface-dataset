# sid172002/Positronic-SciFi-Omnicorpus-9B-merged

## Resumen

Positronic SciFi Omnicorpus 9B (merged) es un modelo de generación de texto especializado en escritura de ciencia ficción y fantasía, publicado por el usuario sid172002 en Hugging Face. Se trata de la versión fusionada de un LoRA sobre Qwen/Qwen3.5-9B, guardada como modelo autónomo de 16 bits: no requiere cargar adaptadores ni PEFT, y se usa como cualquier modelo de la librería transformers. Según su autor, el entrenamiento consistió en continuar el preentrenamiento de Qwen3.5-9B sobre una biblioteca de novelas completas del género leídas de principio a fin.

El problema que aborda es la falta de familiaridad estilística de los modelos generalistas con las convenciones narrativas del género: estructuras de capítulos, ritmo, vocabulario técnico-científico y tropos propios. Al haber digerido novelas completas en lugar de fragmentos, los pesos incorporan patrones de escritura de longitud larga. El autor reporta una entropía cruzada en validación (held-out) de 2,5068, que descendió de forma monótona durante el entrenamiento.

Es relevante ahora porque ocupa un nicho muy concreto (escritura creativa de género) dentro del ecosistema de ajustes sobre modelos de ~9B, un tamaño que permite despliegue local en GPU de consumo mediante cuantización. No obstante, el repositorio no documenta benchmarks estándar, idiomas soportados, longitud de contexto ni detalles del dataset, y registra cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder, heredada de Qwen/Qwen3.5-9B (detalles concretos no disponibles) |
| Parámetros totales | ~9B (deducido del nombre del modelo y del modelo base declarado) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 16 bits (bf16) en este repositorio; existe un build GGUF en un repositorio aparte |
| Idiomas soportados | No disponible |
| Licencia | other (hereda la licencia de Qwen/Qwen3.5-9B) |
| Formato de pesos | Pesos completos de 16 bits en el repositorio de Hugging Face (carga directa con transformers); alternativa GGUF en repositorio separado |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-9B, un transformer decoder de aproximadamente 9.000 millones de parámetros. Este repositorio no introduce cambios estructurales: la innovación es exclusivamente de pesos. El autor entrenó un LoRA sobre el modelo base mediante continuación de preentrenamiento (continued pretraining) con un corpus de novelas de ciencia ficción y fantasía completas, y posteriormente fusionó el adaptador en los pesos base, generando un checkpoint autónomo de 16 bits sin dependencias de PEFT. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

El único dato cuantitativo de entrenamiento publicado es la entropía cruzada sobre un conjunto de validación (held-out), que cayó de forma monótona y se estabilizó en 2,5068. Se trata de una métrica de modelado del lenguaje, no de calidad narrativa ni de rendimiento en tareas. No se mencionan innovaciones de inferencia como decodificación especulativa, atención lineal ni modos de razonamiento explícitos.

## Capacidades

- Generación de texto narrativo largo en géneros de ciencia ficción y fantasía, con especial atención al estilo, los tropos y las convenciones del género.
- Continuación y expansión de pasajes: el ejemplo de la model card muestra cómo proseguir a partir de una frase inicial con `temperature=0.85` y `top_p=0.95`.
- Escritura de ficción a nivel de capítulo o novela, gracias a un entrenamiento sobre novelas completas en lugar de extractos.
- Generación conversacional (el repositorio incluye la etiqueta `conversational`), aunque no se documenta un formato de chat específico.
- Capacidad multilingüe: no disponible.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Redacción de ficción de género: el modelo puede generar capítulos completos de ciencia ficción o fantasía manteniendo coherencia estilística, ya que fue entrenado sobre novelas completas y no sobre fragmentos aislados.
- Asistencia a autores en fase de borrador: dado un fragmento y una premisa, el modelo continúa la escena con un registro narrativo consistente, útil para desbloquear bloqueos creativos.
- Worldbuilding y documentación de ambientación: generación de descripciones de planetas, tecnologías, culturas y sistemas de magia coherentes con las convenciones del género.
- Diálogos para narrativa interactiva y videojuegos: producción de líneas de personaje y variantes de respuesta para árboles de diálogo en aventuras conversacionales o RPG.
- Guiones para audiodrama y pódcast de ficción: redacción de narración y diálogos en un registro literario uniforme, aprovechando que el modelo marca el ritmo del género.
- Reescritura y adaptación de estilo: reformulación de un texto existente para acercarlo a un registro más «pulp», más «hard sci-fi» o más «fantasía épica», según el prompt.
- Generación de datos sintéticos para entrenamiento: creación de corpus de texto de dominio ciencia ficción/fantasía para ajustar otros modelos o para evaluar clasificadores de género.
- Prototipado de pipelines creativos: uso mediante `transformers` con `torch_dtype=torch.bfloat16` y `device_map="auto"` para integrarlo en herramientas internas de escritura asistida.

## Benchmarks y rendimiento

La model card solo publica una métrica de validación. No hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de escritura creativa en la información disponible.

| Métrica | Valor | Notas |
|---|---|---|
| Entropía cruzada (held-out) | 2,5068 | Descenso monótono durante el entrenamiento; métrica de modelado del lenguaje, no de calidad narrativa |
| MMLU | No disponible | No publicado en la información proporcionada |
| HumanEval | No disponible | No publicado en la información proporcionada |
| GSM8K | No disponible | No publicado en la información proporcionada |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño de ~9B parámetros y del formato de pesos declarado; el repositorio no publica requisitos oficiales.

- Inferencia en 16 bits (bf16): aproximadamente 18 GB solo para pesos, más caché KV y activaciones. En la práctica, entre 20 y 24 GB de VRAM para contextos moderados.
- GPU recomendadas para 16 bits: A100 40 GB, H100 80 GB, L40S 48 GB; una RTX 4090 de 24 GB puede bastar con contextos cortos y batches pequeños, pero queda muy justa.
- Inferencia en 8 bits: alrededor de 9-10 GB de VRAM; cabe en RTX 4080, RTX 3090, RTX 4070 Ti Super.
- Inferencia en 4 bits (GGUF Q4_K_M): alrededor de 5,5-6 GB de VRAM; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4060 y en equipos Apple Silicon con memoria unificada de 16 GB o más.
- Opciones de despliegue: `transformers` para el checkpoint de 16 bits; llama.cpp, Ollama y LM Studio para el build GGUF del repositorio hermano; vLLM o TGI son viables en 16 bits sobre GPU de datacenter, aunque el autor no los documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento de modelos alternativos, por lo que la comparación se limita a lo que puede contrastarse con el modelo base declarado.

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| Positronic SciFi Omnicorpus 9B (merged) | ~9B | No disponible | other (hereda de Qwen3.5-9B) | 16 bits (HF) y GGUF | Solo entropía cruzada de validación: 2,5068 |
| Qwen/Qwen3.5-9B (modelo base) | ~9B | No disponible | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| Otros ajustes de escritura de ficción sobre modelos de 7-9B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables sobre alternativas comparables dentro de la información proporcionada.

## Limitaciones y advertencias

- Licencia «other» que hereda los términos de Qwen/Qwen3.5-9B: es imprescindible revisar la licencia del modelo base antes de cualquier uso comercial, ya que el repositorio no reproduce el texto completo.
- Idiomas soportados no documentados; el corpus de entrenamiento (novelas de ciencia ficción y fantasía, presumiblemente en inglés) hace esperable un rendimiento inferior en castellano.
- Sesgo de dominio: al estar especializado en un único género, el modelo puede degradarse en tareas generales de razonamiento, matemáticas o código respecto al modelo base.
- Sesgo de corpus: la narrativa de género publicada arrastra sesgos culturales, de género y de representación propios del mercado editorial anglosajón.
- Riesgo de alucinación inherente a los modelos generativos; en ficción puede ser deseable, pero no debe confiarse en él para datos factuales.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos sin verificación empírica previa.
- No hay documentación de tool calling, function calling ni capacidades de agente, por lo que no es adecuado como componente de un sistema agéntico sin evaluación adicional.
- La entropía cruzada de 2,5068 no es comparable entre tokenizadores ni indica calidad literaria subjetiva; la ausencia de benchmarks estándar dificulta situar el modelo frente a alternativas.
- El repositorio registra cero descargas y cero likes, y las fechas de creación y actualización son idénticas y muy próximas: no existe validación independiente por parte de la comunidad.
- La fecha de creación registrada (2026) resulta anómala respecto al calendario habitual de publicaciones, lo que puede indicar metadatos inconsistentes en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sid172002/Positronic-SciFi-Omnicorpus-9B-merged
- Versión LoRA original (referenciada en la model card): https://huggingface.co/sid172002/Positronic-SciFi-Omnicorpus-9B
- Build GGUF para llama.cpp, Ollama y LM Studio: https://huggingface.co/sid172002/Positronic-SciFi-Omnicorpus-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Búsqueda web: no se han encontrado enlaces relevantes (los resultados devueltos correspondían a foros de cuestionarios deMicrosoft Rewards y Bing, sin relación con el modelo).
