# mufasa1228/sn92-gen-ma

## Resumen

`mufasa1228/sn92-gen-ma` es un modelo de decisión (decision model) publicado en HuggingFace que resulta de la fusión en espacio de pesos (weight-space merge) de dos entradas generalistas públicas de la familia REAX SN92: `isomsom/sn92-gen-m87b` y `xflud/sn92-decider-1`. No hay entrenamiento propio por parte del autor de la ficha: todas las capacidades aprendidas provienen de los modelos padre, que a su vez comparten el mismo backbone base, `baselabs/mammoth-1` (revisión `61cec44c281c693992e3d6ebeb44dd3402dfa186`).

El modelo se empaqueta sobre la arquitectura `Qwen3_5Model` con un esquema de "joint-readout" (backbone más un módulo de lectura de respuestas separado en `readout.safetensors`). El checkpoint en safetensors declara 26.085.330.160 parámetros totales, lo que lo sitúa en la categoría de modelos densos de ~26B, con un repositorio de 52,2 GB en bfloat16.

Su relevancia es acotada pero concreta: se trata de un experimento de model soup reproducible (media aritmética ponderada al 50/50 de todos los tensores) sobre un backbone común, útil para estudiar cómo se comporta la fusión lineal de dos especializaciones (una generalista y otra orientada a decisión) sin coste de entrenamiento adicional. La licencia MIT y la conservación de los avisos de los padres facilitan su reutilización, aunque la documentación pública es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5Model` con joint-readout (backbone + `readout.safetensors`) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`readout.safetensors` como fichero independiente) |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen3_5Model`, un transformer con un paquete de "joint-readout": el backbone y el módulo de lectura de respuestas se distribuyen por separado, de modo que `readout.safetensors` se mantiene como fichero propio. Los tres modelos implicados (los dos padres y el resultado) comparten nombres de tensor, formas y dtypes, requisito imprescindible para que la fusión sea válida.

No hubo entrenamiento: la receta es una fusión lineal (model soup) de cada tensor, backbone y readout incluidos, con peso 0,5 para cada padre. El cálculo se realiza tensor a tensor en float32 como `sum(weight_i * parent_i)` y se redondea de vuelta a bfloat16 con redondeo al par más cercano (round to nearest even). Los ficheros `config.json`, `decision_config.json`, `joint_config.json` y el tokenizer se copian sin modificar del primer padre. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO, ya que el autor no entrenó el modelo.

## Capacidades

- Generación de texto y razonamiento general, heredados de los padres a través de la fusión de pesos.
- Comportamiento orientado a decisión (tag `decision-model`), derivado de `xflud/sn92-decider-1`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre model merging: el modelo sirve como caso de estudio reproducible de una model soup 50/50 entre dos especializaciones sobre un backbone común, con receta y revisiones de los padres documentadas.
- Evaluación comparativa de fusiones: permite medir si la media lineal de un generalista y un modelo de decisión conserva capacidades de ambos o produce interferencia, usando los padres como líneas base.
- Prototipado de sistemas de decisión: al heredar el comportamiento del padre `sn92-decider-1`, puede emplearse en tareas de clasificación o selección entre opciones en entornos de experimentación, siempre con validación previa.
- Base para posteriores merges o fine-tuning: al compartir estructura tensorial con sus padres y con `baselabs/mammoth-1`, es un punto de partida cómodo para nuevas recetas de fusión o ajuste supervisado.
- Despliegue en infraestructura propia con licencia permisiva: la licencia MIT y el formato safetensors facilitan su integración en pipelines internos de evaluación sin restricciones de uso comercial.
- Reproducibilidad y auditoría de linajes: la conservación de las líneas de copyright y los avisos de cada padre permite auditar el origen de los pesos en entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26,08B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 80 GB para contexto moderado.
- Cuantización a 8 bits: en torno a 26 GB de pesos; a 4 bits, en torno a 13 GB, aunque no se documentan ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas para bfloat16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB con tensor parallelism).
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bfloat16; requeriría cuantización agresiva no publicada por el autor.
- Opciones de despliegue: vLLM o TGI para safetensors en bfloat16; llama.cpp u Ollama solo si se generan cuantizaciones GGUF propias, al no distribuirlas el autor.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `mufasa1228/sn92-gen-ma` | 26,08B | no disponible | MIT | Merge 50/50 de dos entradas SN92 |
| `isomsom/sn92-gen-m87b` (padre) | no disponible | no disponible | no disponible | Entrada generalista SN92 |
| `xflud/sn92-decider-1` (padre) | no disponible | no disponible | no disponible | Entrada orientada a decisión SN92 |
| `baselabs/mammoth-1` (base común) | no disponible | no disponible | no disponible | Backbone compartido por los padres |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Al ser una media lineal de pesos, puede sufrir interferencia entre las capacidades de ambos padres; no hay evaluación publicada que confirme qué se conserva y qué se degrada.
- Riesgo de alucinación inherente a los modelos de lenguaje subyacentes; no se documentan mitigaciones ni evaluaciones de fidelidad.
- Sin información sobre sesgos, idiomas soportados ni comportamiento en contextos largos; no debe asumirse cobertura multilingüe.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- El autor declara explícitamente que no está afiliado ni respaldado por Base Labs / Baseten, el equipo de Qwen, Perplexity AI ni los autores de los padres; la licencia MIT se hereda con las líneas de copyright y avisos de todos los padres.
- El modelo tiene un uso muy limitado en la comunidad (30 descargas, 0 likes) y documentación mínima; para producción conviene validarlo contra los padres antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mufasa1228/sn92-gen-ma
- Padre 1: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre 2: https://huggingface.co/xflud/sn92-decider-1
- Backbone base: https://huggingface.co/baselabs/mammoth-1
