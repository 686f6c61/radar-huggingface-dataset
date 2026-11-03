# ducvh5/wan21-a5b5x4c5-ar-tf-fm-tm-ln2

## Resumen

`ducvh5/wan21-a5b5x4c5-ar-tf-fm-tm-ln2` es un ajuste fino (finetune) del modelo de generación de vídeo a partir de texto Wan2.1-T2V-1.3B de Alibaba, publicado por el usuario ducvh5 en Hugging Face. El modelo parte de la arquitectura original de Wan2.1 (un transformer de difusión para text-to-video con 1.300 millones de parámetros) y aplica una reconfiguración estructural poco habitual: reorganiza los bloques del transformer en un esquema recurrente con 15 bloques únicos que se ejecutan 30 veces (patrón A5 → B5×4 → C5), lo que el autor etiqueta como "recurrent-transformer".

El modelo se distribuye en formato diffusers/safetensors con un repositorio de 17,3 GB, lo que incluye los pesos EMA y no-EMA en precisión completa, además del estado del optimizador del paso 14.000 (`step0014000/state.pt`). La model card es extremadamente escueta y no documenta el conjunto de datos de entrenamiento (solo indica "OV"), la licencia ni los idiomas soportados.

La relevancia de esta ficha es limitada pero real: se trata de un experimento de investigación sobre recurrencia en transformers de difusión para vídeo, no de un modelo listo para producción. No tiene descargas ni likes, no se han publicado benchmarks y la información técnica disponible es mínima, por lo que debe evaluarse como una pieza de exploración arquitectónica más que como una alternativa práctica a Wan2.1 o a otros modelos T2V establecidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para text-to-video (Wan2.1) con reorganización recurrente de bloques (A5 → B5×4 → C5; 15 bloques únicos, 30 ejecutados) |
| Parametros totales | 1.300 millones (heredados de Wan2.1-T2V-1.3B; no se especifica el recuento exacto tras la reorganización) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusión; la longitud se refiere a frames y resolución, no documentada en la model card) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors en precisión completa; no hay GGUF ni variantes cuantizadas publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (formato diffusers), más `state.pt` con el estado del entrenamiento |

## Arquitectura y entrenamiento

El modelo deriva de Wan2.1-T2V-1.3B, un transformer de difusión para generación de vídeo condicionada por texto. La modificación principal consiste en una reorganización de los bloques en tres segmentos (A, B y C): 5 bloques del tipo A, 5 bloques del tipo B repetidos 4 veces (20 ejecuciones) y 5 bloques del tipo C, sumando 30 ejecuciones sobre 15 bloques únicos con pesos compartidos. Esta recursión reduce el número de parámetros únicos manteniendo la profundidad efectiva, una idea análoga a la recurrencia en transformers tipo "looped" o "universal transformer".

El entrenamiento combina cuatro objetivos según la model card: autorregresivo (AR), teacher forcing (TF), flow matching (FM) y un cuarto término denominado TM. El peso de teacher forcing se anula (anneal) hasta 0 en el paso 10.000. Se usa una parametrización de ruido log-normal estándar (σ ~ LN(0,1)) con shift=2 y t=1000σ, coherente con la formulación de flow matching de Wan. El dataset de entrenamiento se designa únicamente como "OV", sin más detalle. No se documenta el número de tokens, la composición del dataset ni si hubo RLHF o DPO (poco probable en un modelo de difusión). El checkpoint publicado corresponde al paso 14.000 e incluye los pesos EMA y no-EMA.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante difusión, heredada de la pipeline Wan2.1.
- Condicionamiento por prompt textual; no se documenta soporte de image-to-video ni de control adicional (pose, depth, etc.).
- No se documenta soporte de tool calling ni function calling (no aplica a un modelo de difusión).
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el tokenizador y el encoder de texto subyacentes son los de Wan2.1, pero el autor no especifica idiomas.
- No se documenta thinking mode, visión, audio ni otras capacidades especiales.
- El modelo conserva los cuatro conjuntos de pesos (EMA y no-EMA) del entrenamiento, lo que permite al usuario elegir entre la versión estabilizada y la versión de los pasos finales.

## Casos de uso

- Investigación sobre recurrencia en transformers de difusión: el modelo sirve para estudiar si compartir pesos entre bloques (15 únicos, 30 ejecuciones) degrada o mantiene la calidad de generación frente a Wan2.1 original, con un coste de memoria menor.
- Reproducción de experimentos de flow matching con objetivos combinados AR+TF+FM+TM: útil para grupos que investiguen la anulación progresiva del teacher forcing y su efecto en la estabilidad del entrenamiento.
- Generación de clips cortos de vídeo a partir de texto en entornos de laboratorio: con 1.300 millones de parámetros, el modelo es manejable en una GPU de 24 GB en precisión reducida, adecuado para prototipos académicos.
- Base para nuevos finetunes: al estar en formato diffusers, puede cargarse con la librería `diffusers` y ajustarse con LoRA o fine-tuning completo sobre dominios específicos.
- Estudio comparativo de checkpoints EMA vs. no-EMA: el repositorio incluye ambos, lo que permite analizar la diferencia de calidad y estabilidad entre ellos en el paso 14.000.
- Docencia y divulgación: como ejemplo práctico de cómo se reorganiza un transformer de difusión en bloques recurrentes y cómo se documenta (o no) un experimento de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1.300 millones de parámetros en safetensors de precisión completa (fp32/bf16), los pesos ocupan aproximadamente 2,6 GB en bf16 y 5,2 GB en fp32; el repositorio de 17,3 GB incluye pesos EMA y no-EMA más el estado del optimizador, no solo los pesos de inferencia.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40/80 GB) son suficientes para inferencia en bf16; una RTX 3090 (24 GB) también debería ser viable.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, 4090, 3090), siempre que se use bf16 y se descarten los pesos EMA/no-EMA no necesarios.
- Opciones de despliegue: `diffusers` (pipeline text-to-video de Wan), con posibilidad de usar `accelerate` para offloading; no hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-ar-tf-fm-tm-ln2 | 1.300 M (15 bloques únicos, 30 ejecuciones) | No disponible | No disponible | Hugging Face, 0 descargas | Finetune experimental de Wan2.1 |
| Wan-AI/Wan2.1-T2V-1.3B | 1.300 M | 480p, clips de ~5 s (según model card original de Wan) | Apache 2.0 (según el modelo base) | Hugging Face, ampliamente usado | Modelo base oficial de Alibaba |
| Wan-AI/Wan2.1-T2V-14B | 14.000 M | 480p/720p | Apache 2.0 | Hugging Face | Versión grande de la misma familia |
| Modelos T2V open source alternativos (p. ej. CogVideoX, LTX-Video) | 2.000-5.000 M | Variable | Variable | Hugging Face | Alternativas de la misma categoría; datos concretos no verificados en esta ficha |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al derivar de Wan2.1, hereda los sesgos del dataset original de Alibaba, no auditados aquí.
- Riesgo de alucinación visual y de artefactos propios de la difusión: coherencia temporal limitada, morphing de objetos y texturas inconsistentes, especialmente con prompts complejos.
- Limitaciones de contexto e idioma: no se especifican; el encoder de texto subyacente es el de Wan2.1, pero el autor no confirma idiomas ni longitudes de prompt soportadas.
- Restricciones de licencia: la licencia no está disponible en el repositorio, lo que impide confirmar si el uso comercial es posible; el modelo base Wan2.1 se distribuye bajo Apache 2.0, pero el finetune no declara licencia propia.
- El repositorio incluye el estado del optimizador (`state.pt`) y pesos duplicados (EMA/no-EMA), lo que infla el tamaño a 17,3 GB; para inferencia hay que seleccionar y descargar solo los pesos necesarios.
- Modelo sin descargas ni validación comunitaria: no hay evidencia de que funcione correctamente ni de que la reorganización recurrente no degrade la calidad frente al Wan2.1 original.
- No hay benchmarks, demos ni ejemplos de uso publicados; cualquier evaluación de calidad debe realizarla el usuario.
- Fecha de creación futura (2026-11-02) en los metadatos del repositorio, lo que sugiere posibles inconsistencias en la publicación.

## Enlaces

- Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-ar-tf-fm-tm-ln2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Repositorio oficial de Wan2.1 (GitHub): https://github.com/Wan-Video/Wan2.1
- Documentación de diffusers para pipelines de vídeo: https://huggingface.co/docs/diffusers
