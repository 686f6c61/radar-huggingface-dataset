# smallhours19/nested-learning-hope

## Resumen

HOPE es una implementación no oficial y a escala reducida del modelo descrito en el paper "Nested Learning: The Illusion of Deep Learning Architectures" (arXiv:2512.24695, Behrouz et al., Google Research). El proyecto `nested-learning-hope`, desarrollado por `smallhours19`, reproduce en PyTorch una arquitectura sin atención que modifica sus pesos durante el forward pass (test-time learning), lo que permite aprendizaje continuo y memoria a largo plazo sin recurrir a mecanismos de atención.

El modelo cuenta con 30,6 millones de parámetros, 4 capas con dimensión 512, chunk 512 y sin positional embedding. Opera a nivel de bytes (vocabulario de 256 tokens) y se entrenó sobre una muestra del dataset FineWeb-Edu de 0,3 mil millones de bytes, con secuencias de 2048 bytes. En la validación held-out alcanza 1,721 bits/byte, y en pruebas de recuerdo de aguja (needle recall) obtiene mejoras de +2,59 y +2,10 bits/byte frente a un control a longitudes de 1K y 6,6K bytes, respectivamente.

El proyecto no publica pesos preentrenados: el checkpoint se reproduce en aproximadamente 7 GPU-horas en una GPU de 16 GB. Resulta relevante para investigadores interesados en arquitecturas recurrentes sin atención, aprendizaje en el momento de inferencia y modelos que se adaptan a distribuciones cambiantes, aunque no está destinado a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Attention-free recurrente (Self-Modifying Titans + Continuum Memory System) |
| Parametros totales | 30,6 millones (30.6M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 bytes (secuencia de entrenamiento); extrapolación a 8K reportada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (no se publican pesos; el checkpoint se genera como archivo PyTorch tras el entrenamiento) |

## Arquitectura y entrenamiento

HOPE se compone de dos módulos principales: Self-Modifying Titans (ecuaciones 83-93 del paper, con gated delta rule y objetivos autogenerados) y un Continuum Memory System (ecuaciones 70-71, que actualiza niveles de MLP cada 1, 2 o 4 chunks mediante el gradiente de la pérdida acumulada de la tarea). El modelo es totalmente recurrente, no utiliza positional embedding y opera sobre bytes, con un vocabulario de 256 tokens.

El entrenamiento se realizó sobre una muestra de FineWeb-Edu de 0,3 mil millones de bytes, con secuencias de 2048 bytes. La implementación incluye un test de exactitud que verifica que la ruta paralela por chunks es equivalente a la recurrencia secuencial con precisión de máquina fp64. Las decisiones de implementación que van más allá del paper se documentan en `DEVIATIONS.md`, y los dispositivos de estabilidad no mencionados en el texto original se recogen en `STABILITY.md`.

## Capacidades

- Generación de texto a nivel de bytes (vocabulario de 256 tokens), sin tokenizador subword.
- Test-time learning: los pesos se actualizan durante el forward pass, permitiendo adaptación continua al contexto.
- Memoria de continuo: un sistema de memoria que se actualiza cada 1, 2 o 4 chunks mediante gradientes de la pérdida acumulada.
- Procesamiento de secuencias sin atención, con coste de memoria recurrente en lugar del coste cuadrático de los transformers.
- Extrapolación de longitud: se probó en secuencias de 8K bytes (entrenado en 2K) sin horizonte aparente, aunque con degradación medida (1,66 a 1,96 bits/byte).
- Recuerdo de aguja (needle recall) mejorado en comparación con un modelo de control: +2,59 y +2,10 bits/byte a 1K y 6,6K bytes, respectivamente (n=40).
- No se menciona soporte para tool calling, visión, audio ni multimodal.

## Casos de uso

- Investigación en aprendizaje continuo: permite estudiar cómo la actualización de pesos durante el forward pass afecta al olvido catastrófico, comparando con modelos transformer estáticos en tareas de secuencia.
- Reproducción de experimentos de test-time training: ejecutar el script de entrenamiento para verificar las métricas reportadas (1,721 bits/byte, needle recall) en el propio hardware.
- Estudio de arquitecturas sin atención: sirve como baseline recurrente para comparar con SSMs, RWKV o Mamba en tareas de secuencia larga.
- Evaluación de memoria a largo plazo en secuencias de bytes: probar el recuerdo de aguja en longitudes de 1K a 8K bytes y analizar cómo el sistema de memoria continuo retiene información.
- Prototipado de modelos adaptativos en streaming: al aprender en el momento, resulta útil para experimentos con datos no estacionarios, como series temporales o logs, donde la distribución cambia.
- Docencia de arquitecturas de aprendizaje: es un ejemplo pequeño (30,6M) y reproducible de un modelo que modifica sus pesos durante la inferencia, útil para visualizar conceptos de aprendizaje en el momento.
- Análisis de generación a nivel de bytes: permite investigar representaciones byte-level en tareas de compresión o procesamiento de archivos binarios, aunque el modelo no está específicamente entrenado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas reportadas por el autor son las siguientes:

| Metrica | Valor |
|---|---|
| Validacion held-out (bits/byte) | 1,721 |
| Needle recall a 1K bytes | +2,59 bpb vs control (n=40) |
| Needle recall a 6,6K bytes | +2,10 bpb vs control (n=40) |
| Extrapolacion 8K (entrenado a 2K) | 1,66 a 1,96 bpb |

No se dispone de comparaciones con modelos similares en la información proporcionada.

## Requisitos de hardware

- Reproducción del entrenamiento: 7 GPU-horas en una GPU de 16 GB de VRAM, según el README.
- Inferencia: no se han publicado requisitos específicos. Con 30,6M de parámetros, el modelo es ligero y cabría en cualquier GPU moderna (por ejemplo, RTX 3060 o superior), pero no es un dato oficial.
- VRAM estimada para inferencia: no disponible.
- GPU recomendada para entrenamiento: cualquier GPU con 16 GB de VRAM (por ejemplo, RTX 4080, A10 o A100 40GB).
- Despliegue: no hay soporte oficial para vLLM, llama.cpp, Ollama o TGI; la implementación es un script de entrenamiento en PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con modelos de la misma categoría en la información proporcionada. Las únicas métricas disponibles son las del propio modelo.

## Limitaciones y advertencias

- Los pesos no se publican: para obtener el modelo hay que entrenarlo durante aproximadamente 7 GPU-horas, lo que puede ser una barrera para una evaluación rápida.
- Es una reproducción no oficial a escala reducida (30,6M) del paper de Google Research; no hay garantía de que coincida con el comportamiento del modelo original descrito en el paper.
- No soporta tool calling, visión, audio ni multimodal; solo generación de texto a nivel de bytes.
- El corpus de entrenamiento es una muestra de FineWeb-Edu (principalmente inglés), por lo que la competencia multilingüe es limitada o no ha sido evaluada.
- La extrapolación a 8K se reporta plana, pero con degradación (1,66 a 1,96 bits/byte); no se garantiza un comportamiento correcto en secuencias más largas o fuera de la distribución de entrenamiento.
- Al ser un modelo pequeño (30,6M), la coherencia y calidad de generación son inferiores a modelos de mayor tamaño; existe riesgo de alucinación.
- La licencia MIT permite uso comercial, pero el modelo no está preparado para producción; no se ha realizado evaluación de seguridad ni alineación (RLHF/DPO).

## Enlaces

- HuggingFace: https://huggingface.co/smallhours19/nested-learning-hope
- Repositorio GitHub: https://github.com/smallhours19/nested-learning-hope
- Paper en arXiv: https://arxiv.org/abs/2512.24695
- Explicación del paper (AI Papers Academy): https://aipapersacademy.com/nested-learning-hope/
- Artículo divulgativo sobre Google HOPE: https://www.thoughtsmag.com/google-hope-the-next-revolution-in-ai-with-nested-learning-technology/
