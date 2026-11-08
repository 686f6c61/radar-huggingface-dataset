# Safinul/CYBERBRAIN-27B-PHASE3-7B

## Resumen

CYBERBRAIN-27B-PHASE3-7B es un ajuste fino (SFT) del modelo Qwen/Qwen2.5-Coder-7B-Instruct, publicado por el usuario Safinul en Hugging Face. A pesar de la denominación "27B" en el nombre, el modelo base real es un transformer denso de 7 mil millones de parámetros, por lo que el tamaño efectivo corresponde a la familia Qwen2.5-Coder-7B. El entrenamiento se realizó con TRL (versión 1.17.1) mediante supervisión fina (SFT), y el repositorio contiene únicamente pesos en formato safetensors (0.2 GB, lo que sugiere cuantización o pesos parciales).

El modelo se presenta como parte de un proyecto denominado CYBERBRAIN, descrito en un repositorio GitHub del mismo autor como una "arquitectura MoE modular de 7 fases" orientada a generación de algoritmos en C++, internals de kernel y ciberseguridad ofensiva/defensiva. No obstante, la model card no documenta la composición del dataset de entrenamiento, el número de tokens utilizados ni los hiperparámetros del SFT, y no se han publicado resultados de benchmarks.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin licencia declarada explícitamente (la model card incluye un campo `licence: license` sin contenido), sin idiomas especificados y sin pipeline definido. Es útil como caso de estudio de ajustes finos comunitarios sobre Qwen2.5-Coder, pero no presenta evidencia pública de rendimiento que justifique su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7B (según modelo base; el nombre "27B" no coincide con el tamaño real) |
| Parametros activos | no disponible (no es MoE en los pesos publicados) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-Coder-7B-Instruct, típicamente 32 768 tokens, no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (solo se publican safetensors; no hay GGUF ni AWQ en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Tamano del repo | 0.2 GB |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.17.1, Transformers 5.22.2, PyTorch 2.14.1+cu130 |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por SFT del transformer denso Qwen2.5-Coder-7B-Instruct. No se introduce ninguna modificación arquitectónica documentada: se mantiene la pila de atención estándar de Qwen2.5, con atención causal y las optimizaciones propias de la familia (RoPE, SwiGLU, etc., aunque la model card no las detalla). El repositorio GitHub del autor menciona una "arquitectura MoE modular de 7 fases", pero los pesos publicados en Hugging Face corresponden a un modelo denso de 7B, no a un MoE; la discrepancia no está aclarada en la documentación.

El entrenamiento se realizó con TRL mediante SFT, pero la model card no especifica el número de tokens, la composición del dataset, si hubo etapas de RLHF/DPO posteriores ni los hiperparámetros (learning rate, batch size, epochs). Tampoco se documenta ninguna innovación técnica como decodificación especulativa, atención lineal o modos de razonamiento extendido. La única información verificable es la versión de las librerías utilizadas y el modelo base.

## Capacidades

- Generación de texto y código: hereda las capacidades de Qwen2.5-Coder-7B-Instruct, orientado a generación y completado de código en múltiples lenguajes.
- Razonamiento y matemáticas: capacidad básica de un modelo de 7B, sin mejoras documentadas por el ajuste fino.
- Tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no se confirma que el ajuste lo preserve.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas no están especificados.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Especialización declarada por el autor (en el repositorio GitHub, no en la model card): generación de algoritmos C++, internals de kernel y ciberseguridad ofensiva/defensiva.

## Casos de uso

- Generación de código C++ especializado: el ajuste fino sobre Qwen2.5-Coder sugiere un uso orientado a la producción de algoritmos y estructuras de bajo nivel; adecuado para prototipado de utilidades de sistema, aunque sin benchmarks que validen la calidad frente al base.
- Asistencia en tareas de ciberseguridad defensiva: según la descripción del proyecto, podría emplearse para generar scripts de análisis, reglas de detección o explicaciones de vulnerabilidades; requiere validación humana obligatoria por el riesgo de alucinación en dominios sensibles.
- Experimentación académica sobre SFT: útil como caso de estudio de ajustes finos comunitarios con TRL sobre Qwen2.5-Coder, para comparar el efecto del SFT en tareas de código.
- Integración en pipelines de transformers: al publicarse en safetensors y con la librería transformers, puede cargarse con `pipeline("text-generation")` y desplegarse en entornos de investigación sin conversión adicional.
- Generación de documentación técnica: puede redactar explicaciones de código y comentarios en proyectos C++ o de sistemas, aprovechando el conocimiento del modelo base.
- Base para futuros ajustes: al ser un checkpoint intermedio ("PHASE3"), puede servir como punto de partida para experimentos posteriores del mismo autor o de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para los 7B parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 4-5 GB (estimaciones para el tamaño del base, no confirmadas para este checkpoint).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización, siempre que se conviertan los pesos a GGUF/AWQ (no incluidos en el repo).
- Opciones de despliegue: transformers (soporte nativo), vLLM y TGI (compatibles con arquitectura Qwen2.5), llama.cpp/Ollama solo tras conversión a GGUF, que no está publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Safinul/CYBERBRAIN-27B-PHASE3-7B | 7B | no disponible | no disponible | Hugging Face, 0 descargas | SFT comunitario sin benchmarks |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32 768 (según documentación del base) | Apache 2.0 (según el base) | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32 768 | Apache 2.0 | Hugging Face | Alternativa ligera para entornos con poca VRAM |
| Safinul/CYBERBRAIN-PHASE3-FINAL | 0.5B | no disponible | no disponible | Hugging Face | Otro checkpoint del mismo autor, de menor tamaño |

## Limitaciones y advertencias

- Licencia no declarada: el campo de licencia está vacío, lo que impide determinar si el uso comercial está permitido; no debe usarse en producción sin aclaración legal.
- Sin benchmarks: no hay evidencia pública de que el SFT mejore al modelo base; podría degradar capacidades previas.
- Discrepancia de nomenclatura: el nombre "27B" no corresponde al tamaño real (7B), lo que puede inducir a error en la selección de hardware.
- Dataset de entrenamiento no documentado: se desconoce la composición, el volumen y la posible presencia de datos con derechos de autor o sesgos.
- Riesgo de alucinación: especialmente relevante en el dominio de ciberseguridad declarado por el autor, donde una salida incorrecta puede tener consecuencias graves.
- Idiomas no especificados: no se garantiza un rendimiento multilingüe más allá del heredado del base.
- Contexto no confirmado: aunque el base soporta 32 768 tokens, no se verifica que el ajuste preserve esa ventana.
- Cero adopción: sin descargas ni likes, no hay retroalimentación de la comunidad sobre su calidad.
- Posible desalineación entre la model card y el repositorio GitHub: la mención a una arquitectura MoE no se refleja en los pesos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Safinul/CYBERBRAIN-27B-PHASE3-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio GitHub del proyecto: https://github.com/safinulsafin0-byte/CYBERBRAIN
- Otro checkpoint del autor: https://huggingface.co/Safinul/CYBERBRAIN-PHASE3-FINAL
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
