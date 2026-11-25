# ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only-step-100

## Resumen

XSDPO-Nemotron-1.5B es un ajuste fino (fine-tuning) del modelo de razonamiento Nemotron-Research-Reasoning-Qwen-1.5B de NVIDIA, publicado por el usuario ahmedselhady en Hugging Face. Se trata de un checkpoint intermedio correspondiente al paso 100 de entrenamiento de una ejecución denominada `macereason-math-1500x2-en-bn-nemotron-1.5b-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only`, que aplica una variante de optimización por preferencias (SDPO, según la nomenclatura del autor) sobre un modelo base ya orientado al razonamiento matemático.

El modelo conserva la arquitectura del base: un transformer denso de tipo Qwen2 con 1.777.088.000 parámetros totales (aproximadamente 1,78 mil millones), empaquetado en safetensors con un tamaño de repositorio de 3,6 GB. No se trata de un modelo de producción ni de un lanzamiento oficial, sino de un artefacto de investigación que documenta un estado concreto del entrenamiento, por lo que su relevancia es fundamentalmente experimental: sirve para reproducir o analizar la dinámica de un pipeline de ajuste con SDPO sobre tareas de matemáticas y razonamiento.

La información pública disponible es muy limitada: la model card apenas describe el checkpoint y no incluye licencia, idiomas, datos de entrenamiento ni resultados de evaluación. Cualquier uso en producción debería partir de esta premisa y validar el comportamiento del modelo de forma empírica antes de integrarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen2 (heredada del modelo base) |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | No disponible (el nombre de la ejecución sugiere datos en inglés y bengalí, sin confirmación oficial) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Nemotron-Research-Reasoning-Qwen-1.5B, un transformer decoder-only de la familia Qwen2 con aproximadamente 1,78 mil millones de parámetros. No se dispone de detalles oficiales sobre el número de capas, dimensiones ocultas, cabezas de atención ni longitud de contexto del base en la información proporcionada, por lo que estos datos deben consultarse en la model card de NVIDIA.

El entrenamiento documentado en el nombre del checkpoint corresponde a una ejecución de SDPO (una variante de optimización por preferencias directas, presumiblemente *Self-Distillation Preference Optimization* o similar) con los siguientes hiperparámetros explícitos: tasa de aprendizaje 3e-6, coeficiente KL de 0,001, 1500 pasos por ciclo (1500x2), tamaño de grupo 512 y una referencia de 10752. El sufijo `en_only` sugiere que el ajuste se realizó únicamente con datos en inglés, mientras que `en-bn` en el nombre de la ejecución apunta a un conjunto de datos mixto inglés-bengalí en fases previas. El checkpoint publicado corresponde al paso 100, es decir, un estado temprano del entrenamiento, no el modelo final.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.
- Razonamiento matemático y resolución de problemas paso a paso, dado que el base es un modelo de investigación orientado a razonamiento.
- Razonamiento multi-paso con cadenas de pensamiento (el nombre de la ejecución incluye `reasoning`).
- Generación de texto en inglés; posible soporte de bengalí por el nombre de la ejecución, no confirmado oficialmente.
- Compatibilidad con text-generation-inference y endpoints, según los tags del repositorio.
- No se ha confirmado soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación sobre optimización por preferencias: el checkpoint permite analizar la evolución del modelo en el paso 100 de un pipeline SDPO y comparar con checkpoints posteriores de la misma ejecución.
- Reproducción de experimentos de razonamiento matemático: sirve como punto de partida para evaluar cómo afecta el ajuste SDPO a la precisión en problemas aritméticos y algebraicos frente al modelo base.
- Evaluación de dinámica de entrenamiento: al ser un checkpoint intermedio, es útil para estudiar curvas de aprendizaje, divergencia KL y estabilidad del ajuste con lr 3e-6 y kl 0.001.
- Generación de texto en inglés en entornos de prototipado: puede desplegarse con transformers o text-generation-inference para pruebas de generación conversacional a pequeña escala.
- Estudio de transferencia multilingüe inglés-bengalí: el nombre de la ejecución sugiere experimentos con datos en ambos idiomas, útiles para investigar transferencia entre lenguas en modelos pequeños.
- Base para ajustes posteriores: al ser un modelo de 1,78 B, puede servir como inicialización para fine-tunes específicos en tareas de razonamiento con recursos de hardware modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB, más overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090 y GPUs Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y potencialmente llama.cpp u Ollama si se generan cuantizaciones GGUF, aunque no se han publicado.
- Latencia y throughput: no disponibles; al ser un modelo de 1,78 B, se espera un throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1,78 B | No disponible | No disponible | Hugging Face, checkpoint de investigación |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1,5 B (según nombre) | No disponible | No disponible en la información proporcionada | Hugging Face, modelo base oficial |
| Qwen2-1.5B | ~1,5 B | 32.768 tokens (típico en Qwen2) | Apache 2.0 (típico en Qwen2) | Hugging Face, ampliamente disponible |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B | 32.768 tokens (típico) | MIT (según la familia DeepSeek-R1) | Hugging Face, ampliamente disponible |

La comparación con Qwen2-1.5B y DeepSeek-R1-Distill-Qwen-1.5B se ofrece como referencia de categoría (modelos densos de ~1,5 B orientados a razonamiento); los datos de contexto y licencia de esos modelos no están confirmados en la información proporcionada y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 100) de un entrenamiento, no un modelo final; su calidad puede ser inferior a la de versiones posteriores de la misma ejecución.
- No se ha publicado licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor o consultarse la licencia del modelo base.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de seguridad.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, especialmente en tareas de razonamiento fuera del dominio de entrenamiento.
- El sufijo `en_only` sugiere que el ajuste se realizó solo con datos en inglés, por lo que el rendimiento en otros idiomas (incluido el castellano) puede ser limitado.
- Longitud de contexto no documentada; no debe asumirse la del base sin verificarla.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se han publicado cuantizaciones GGUF, AWQ ni GPTQ, lo que limita las opciones de despliegue en hardware de bajos recursos sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only-step-100
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
