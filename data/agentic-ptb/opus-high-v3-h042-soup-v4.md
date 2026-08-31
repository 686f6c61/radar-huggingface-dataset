# agentic-ptb/opus-high-v3.h042.soup-v4

## Resumen

`agentic-ptb/opus-high-v3.h042.soup-v4` es un checkpoint intermedio derivado de un run de entrenamiento experimental perteneciente al proyecto AgentPTB, concretamente de la serie `opus-high-v3`. El propio autor lo clasifica como un artefacto de reproducibilidad y estudio cualitativo, no como un modelo listo para uso. Según la model card, el run no produjo ninguna mejora en los pesos entrenados respecto al modelo base, por lo que se etiqueta explícitamente como `negative-results`.

El modelo parte de la base `Qwen/Qwen3.5-9B-Base`, con aproximadamente 9.410 millones de parámetros. Se distribuye en formato safetensors con licencia Apache 2.0. No se han publicado especificaciones adicionales sobre arquitectura, contexto o capacidades más allá de las heredadas del modelo base. La advertencia del autor es clara: no debe inferirse calidad a partir de su publicación, y su único propósito es servir como referencia para reproducir y analizar el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Qwen3.5-9B-Base, presumiblemente transformer) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna del modelo. Por su base (`Qwen/Qwen3.5-9B-Base`), se espera una arquitectura transformer densa de 9.400 millones de parametros, pero no se confirma oficialmente. El entrenamiento se enmarca en el proyecto AgentPTB, que utiliza agentes basados en Claude Code para ejecutar rutinas de ajuste fino automaticas. Este checkpoint concreto corresponde a la hora `h042` del run `opus-high-v3`, dentro del pipeline denominado `soup-v4` (mezcla de pesos). El run completo no logro mejorar los pesos respecto al modelo base, y el autor lo archiva como resultado negativo.

No se dispone de datos sobre el dataset de entrenamiento, el numero de tokens procesados ni tecnicas como RLHF o DPO. El unico dato adicional de la busqueda web indica que un run anterior (`opus-high-v2`, `a-rerun`) fue abortado por regresiones en todos sus SFT runs, lo que sugiere problemas sistematicos en la metodologia del proyecto.

## Capacidades

Dado que no se ha publicado ninguna evaluacion de capacidades de este checkpoint concreto, las unicas capacidades que se pueden atribuir son las heredadas del modelo base `Qwen/Qwen3.5-9B-Base`. Sin embargo, no se confirma que este checkpoint las conserve intactas, y el propio autor advierte que no hay mejora respecto al base. Por tanto:

- Generacion de texto y razonamiento: presumiblemente similares a Qwen3.5-9B-Base, sin confirmacion.
- Codigo y matematicas: no evaluado en este checkpoint.
- Tool calling y funciones de agente: no disponible.
- Capacidades multilingues: no disponible.
- Cualquier capacidad especial: no disponible.

## Casos de uso

Este modelo no esta pensado para casos de uso en produccion. Su unico proposito declarado es:

- Reproducibilidad de experimentos: sirve como artefacto para replicar el run `opus-high-v3` y analizar por que el entrenamiento no produjo mejoras.
- Estudio cualitativo de fallos: investigadores pueden examinar los pesos intermedios para entender donde se produjo la degradacion o la falta de aprendizaje.
- Comparacion de pipelines de entrenamiento automatico: util para evaluar la metodologia AgentPTB y sus resultados negativos.
- No se recomienda su uso en aplicaciones reales, chatbots, generacion de codigo ni ningun otro escenario practico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni similares. Ademas, al tratarse de un checkpoint con resultados negativos, cualquier medicion seria probablemente inferior o igual a la del modelo base sin ajuste.

## Requisitos de hardware

No se dispone de datos especificos de este checkpoint. Como referencia para el tamaño (9.400 millones de parametros) en precision FP16:

- VRAM estimada para inferencia: al menos 19-20 GB para FP16 (los pesos ocupan ~18.8 GB segun el tamano del repo), mas overhead de activaciones.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) podria cargar el modelo en FP16, aunque con margen ajustado. Para mayor comodidad, una A100 40 GB o H100.
- En consumer GPU: si, una RTX 4090 o RTX 3090 (24 GB) pueden ejecutarlo, pero con limitaciones de batch y contexto.
- Opciones de despliegue: al ser un checkpoint safetensors sin cuantizaciones publicadas, habria que convertirlo a GGUF o usar frameworks como vLLM o TGI con precision FP16. No se ha probado con llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que este checkpoint no tiene rendimiento publicado y es un artefacto experimental, la comparacion mas relevante es contra su propio modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h042.soup-v4 | 9.4B | no disponible | no evaluado (resultados negativos) | Apache 2.0 |
| Qwen/Qwen3.5-9B-Base | 9.4B | no disponible | referencia del proyecto | Apache 2.0 |

Otras alternativas de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B) no son comparables directamente porque este checkpoint no aporta ningun valor adicional sobre su base. En terminos practicos, cualquier modelo comercial o abierto de 7-9B con benchmarks publicos supera a este artefacto.

## Limitaciones y advertencias

- Resultados negativos confirmados: el autor declara explicitamente que el run no produjo ninguna mejora en los pesos entrenados. No debe usarse como modelo de produccion.
- Checkpoint intermedio: su proposito es exclusivamente la reproducibilidad y el estudio cualitativo de fallos en pipelines de entrenamiento automatico.
- Sin evaluacion de sesgos ni alucinaciones: no se ha realizado ninguna auditoria de seguridad o sesgo sobre estos pesos.
- Sin informacion de contexto ni idiomas: se desconoce la ventana de contexto real y los idiomas soportados, mas alla de lo que pueda heredar del modelo base.
- Riesgo de calidad degradada: al ser un checkpoint intermedio de un run fallido, es posible que los pesos esten en un estado suboptimo o corrupto respecto al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero no hay razon tecnica para hacerlo en este caso.
- Sin soporte de cuantizaciones: no se ofrecen versiones GGUF, GPTQ ni AWQ, lo que limita su despliegue en entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/opus-high-v3.h042.soup-v4
- Dataset del run (archivo de datos): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Busqueda de modelos del autor: https://huggingface.co/models?other=agentic-ptb
