# AdaptiveChunking/ali_mem-skel_s1

## Resumen

`ali_mem-skel_s1` es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face. Se trata de un H-Net de nivel de byte (byte-level) entrenado con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet), con arquitectura `ali`, objetivo `ratio`, decodificación `ema` y semilla 1. El modelo tiene 22.785.088 parámetros (aproximadamente 22,8 millones) y fue entrenado durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre los idiomas inglés, turco y finés.

El interés de este checkpoint no radica en sus capacidades generativas, sino en su carácter experimental: explora el *dynamic chunking* y la tokenización a nivel de byte dentro del paradigma H-Net, una familia de arquitecturas jerárquicas que buscan aprender representaciones multiescala de la secuencia sin un tokenizador discreto previo. El repositorio incluye ramas `step-N` con checkpoints intermedios en un calendario logarítmico, el estado completo del entrenador reanudable y sondas de frontera FLORES+.

Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, publicado bajo licencia Apache 2.0. No dispone de pipeline declarado ni de model card con resultados de evaluación, por lo que su uso en producción no está respaldado por datos públicos de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (variante `ali`, framework beetle-hnet) |
| Parámetros totales | 22.785.088 (≈22,8 M) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1024 bytes (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, tr, fi (según datos de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos tied almacenados una sola vez), más `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

El modelo sigue el paradigma H-Net con procesamiento a nivel de byte, sin tokenizador subword. La configuración concreta corresponde a `architecture=ali`, `objective=ratio`, `schedule=None` y `dechunk=ema`, con semilla 1. El entrenamiento consistió en 6000 pasos con batch de 32 secuencias de 1024 bytes cada una, sobre un corpus multilingüe limitado a inglés, turco y finés. El repositorio organiza los checkpoints en ramas `step-N` siguiendo un calendario logarítmico por fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase objetivo, más el paso final), e incluye el estado completo del entrenador (`training_state/checkpoint.pt`) para reanudación.

La innovación técnica principal es el *dynamic chunking*: el modelo aprende a agrupar bytes en unidades de longitud variable en lugar de depender de un vocabulario fijo de tokens. Los pesos tied se almacenan una sola vez en `model.safetensors`, y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados. No se dispone de información sobre la composición exacta del dataset, el número total de tokens vistos ni si hubo etapas de RLHF o DPO.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre secuencias de hasta 1024 bytes.
- Aprendizaje de segmentación dinámica (dynamic chunking) como representación interna, sin tokenizador externo.
- Entrenamiento multilingüe limitado a inglés, turco y finés.
- Checkpoints intermedios reanudables para experimentación con el estado del entrenador.
- Sondas de frontera FLORES+ incluidas en la rama `main` tras finalizar el entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se documentan capacidades de generación de código, matemáticas o instrucciones.

## Casos de uso

- Investigación sobre tokenización libre de vocabulario: el modelo sirve como base para estudiar si el chunking dinámico a nivel de byte puede sustituir a los tokenizadores BPE en tareas de modelado de lenguaje, gracias a su implementación completa en beetle-hnet.
- Experimentos de reproducibilidad en H-Net: las ramas `step-N` y el `training_state/checkpoint.pt` permiten reanudar o inspeccionar el entrenamiento en puntos concretos del calendario logarítmico, útil para analizar dinámicas de convergencia.
- Evaluación de fronteras lingüísticas: las sondas FLORES+ en `probe/` permiten medir cómo segmenta el modelo entre inglés, turco y finés, idiomas con morfología muy distinta.
- Baseline para comparativas de arquitecturas jerárquicas: con 22,8 M de parámetros y contexto de 1024 bytes, es un candidato ligero para comparar frente a transformers byte-level convencionales en entornos de investigación con recursos limitados.
- Estudio de pesos tied y eficiencia de almacenamiento: el esquema de `tied_weights` en `config.json` resulta útil para analizar técnicas de compresión de checkpoints en modelos pequeños.
- Docencia y prototipado: al ser un modelo de 22,8 M de parámetros con licencia Apache 2.0, puede ejecutarse en CPU para demostraciones de arquitecturas H-Net y chunking dinámico en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (≈91 MB de pesos), más overhead de activaciones para secuencias de 1024 bytes.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: al estar en formato PyTorch/safetensors y depender de beetle-hnet, el despliegue requiere cargar el modelo con la librería del framework; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ali_mem-skel_s1 | 22,8 M | 1024 bytes | Apache 2.0 | Hugging Face (0 descargas) | H-Net byte-level experimental |
| Byte-level transformers convencionales | variable | variable | variable | amplia | No disponible comparación directa en la información proporcionada |
| Alternativas H-Net | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros checkpoints comparables |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación pública: no hay benchmarks, métricas de calidad ni validación de capacidades generativas.
- Contexto muy limitado: 1024 bytes, insuficiente para la mayoría de aplicaciones prácticas de contexto largo.
- Cobertura lingüística restringida a inglés, turco y finés; no se garantiza comportamiento en castellano.
- Riesgo elevado de alucinación y salidas incoherentes al ser un checkpoint de 22,8 M de parámetros entrenado solo 6000 pasos.
- No se documentan sesgos conocidos, pero el corpus de entrenamiento es limitado y no auditado.
- Sin pipeline declarado ni integración con herramientas estándar de despliegue (vLLM, TGI, llama.cpp), lo que complica su uso en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de evaluación y garantías hace desaconsejable su empleo en entornos productivos.
- El repositorio incluye estado del entrenador y checkpoints intermedios; conviene revisar el contenido antes de cargar `checkpoint.pt` con `weights_only=False`, ya que implica deserialización de objetos Python.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-skel_s1
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
