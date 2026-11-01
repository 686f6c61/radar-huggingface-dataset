# reaperdoesntknow/Qwen3.5-4B-Coder

## Resumen

Qwen3.5-4B-Coder es un ajuste fino (fine-tuning) del modelo base unsloth/Qwen3.5-4B, publicado por el usuario reaperdoesntknow en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta tanto texto como imágenes como entrada y genera texto, con un total de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) en pesos de 16 bits (FP16). El ajuste se realizó con la librería Unsloth y TRL de HuggingFace, según indica el autor, con una velocidad de entrenamiento declarada de 2x respecto a un pipeline estándar.

El modelo hereda la arquitectura qwen3_5 del modelo base y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las de dicha licencia. El sufijo "Coder" en el nombre sugiere una especialización hacia tareas de generación de código, aunque la model card no documenta el dataset de ajuste ni los objetivos concretos del fine-tuning.

La relevancia de esta ficha es limitada: se trata de un modelo con muy poca tracción (70 descargas, 0 likes en el momento de la consulta), sin benchmarks publicados ni documentación técnica detallada por parte del autor. Resulta útil como ejemplo de ajuste fino ligero sobre Qwen3.5 y como opción de bajo coste para experimentación, pero no debe considerarse un modelo de referencia para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal image-text-to-text, según tags del repo) |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor publica pesos en FP16; el ecosistema Unsloth/GGUF no está confirmado para este repo) |
| Idiomas soportados | en (inglés, según model card y tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint unsloth/Qwen3.5-4B, que a su vez pertenece a la familia Qwen3.5 con arquitectura transformer y capacidades multimodales (pipeline image-text-to-text). El autor no detalla la composición del dataset de ajuste, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado. La única información técnica disponible es que el entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, con una mejora declarada de velocidad de 2x, y que los pesos resultantes se publican en FP16.

No se documentan innovaciones técnicas propias del ajuste (decodificación especulativa, atención lineal, etc.) más allá de las que herede del modelo base Qwen3.5, que no se especifican en la información proporcionada. Tampoco se indica si el ajuste preserva íntegramente las capacidades multimodales del modelo base o si se centró exclusivamente en texto/código.

## Capacidades

- Generación de texto y, presumiblemente por herencia del modelo base, entrada multimodal de imagen y texto (pipeline image-text-to-text).
- Especialización declarada en código por el nombre del modelo ("Coder"), aunque no se documenta el alcance ni la evaluación de dicha especialización.
- Razonamiento y matemáticas: no disponible (no se documenta explícitamente).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card y los tags.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Experimentación con ajuste fino ligero: sirve como punto de partida para desarrolladores que quieran evaluar cómo un fine-tuning de Unsloth sobre Qwen3.5-4B afecta al comportamiento del modelo base en tareas de código, con un coste de cómputo moderado.
- Asistencia de código en local: con ~4,66 B de parámetros en FP16, puede desplegarse en una GPU de gama alta de consumo (ver sección de hardware) para autocompletado y generación de fragmentos de código en entornos de desarrollo sin conexión a la nube.
- Prototipado de pipelines multimodales: al ser un modelo image-text-to-text, permite probar flujos que combinen capturas de pantalla o diagramas con texto, por ejemplo para generar documentación a partir de imágenes técnicas.
- Generación de documentación técnica en inglés: adecuado para redactar READMEs, docstrings y comentarios de código en inglés, dado el soporte de idioma declarado.
- Base para fine-tunings posteriores: al estar en FP16 y con licencia Apache 2.0, puede reutilizarse como checkpoint intermedio para ajustes específicos de dominio sin restricciones de licencia.
- Evaluación comparativa de fine-tunings: útil en investigación para medir la degradación o mejora que introduce un ajuste ligero sobre Qwen3.5-4B en tareas de código, siempre que se realice una evaluación propia dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 9,3 GB solo para los pesos (4,66 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos, más overhead; requiere cuantización propia, ya que el repo no publica versiones GGUF/AWQ/GPTQ.
- VRAM estimada en cuantización de 4 bits: en torno a 3-4 GB de pesos, más overhead; igualmente requiere cuantización por parte del usuario.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para despliegue holgado en FP16; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090/3090 en FP16; en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB) sería necesario cuantizar.
- Opciones de despliegue: transformers (nativo), TGI (tag text-generation-inference), vLLM (compatible con arquitecturas transformer estándar, aunque la variante qwen3_5 multimodal puede requerir versión reciente), llama.cpp/Ollama solo si el usuario genera los GGUF correspondientes.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Benchmarks publicados |
|---|---|---|---|---|---|
| Qwen3.5-4B-Coder (este) | ~4,66 B | no disponible | Apache 2.0 | Sí (image-text-to-text) | No |
| unsloth/Qwen3.5-4B (base) | ~4,66 B | no disponible | Apache 2.0 (según repo base) | Sí | No disponible en la información proporcionada |
| Qwen2.5-Coder-3B | ~3 B | 32K (típico en la familia) | Apache 2.0 | No | Sí (publicados por el autor original) |
| Qwen2.5-Coder-7B | ~7 B | 32K (típico en la familia) | Apache 2.0 | No | Sí (publicados por el autor original) |

La comparativa con Qwen2.5-Coder se ofrece como referencia de categoría (modelos de código de tamaño similar), pero los datos de contexto y benchmarks de esos modelos no forman parte de la información proporcionada para esta ficha y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evaluación publicada de MMLU, HumanEval, GSM8K ni de tareas multimodales, por lo que el rendimiento real es desconocido.
- Documentación mínima: la model card no especifica dataset de ajuste, hiperparámetros, número de tokens ni metodología, lo que impide reproducir el entrenamiento.
- Riesgo de olvido catastrófico: al ser un fine-tuning sobre un modelo de 4,66 B, es probable que el ajuste haya degradado capacidades del modelo base (razonamiento general, multilingüismo, multimodalidad); no hay datos que lo confirmen o descarten.
- Idiomas: solo se declara inglés; el uso en castellano no está soportado oficialmente y probablemente degrade la calidad.
- Alucinación: sin evaluación, no puede descartarse un riesgo elevado de alucinación en código y en texto, especialmente en un modelo de este tamaño.
- Sesgos: no documentados; se heredan los del modelo base Qwen3.5, que no se detallan.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base unsloth/Qwen3.5-4B y de la familia Qwen3.5 original.
- Tracción mínima: 70 descargas y 0 likes indican ausencia de validación por parte de la comunidad; no se recomienda su uso en producción sin una evaluación exhaustiva propia.
- Contexto desconocido: la longitud de contexto no está documentada, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Qwen3.5-4B-Coder
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de HuggingFace: https://github.com/huggingface/trl
