# solanaexpert950105/sn92-gen-md

## Resumen

REAX SN92 generalist entry es un modelo de 26.085.330.160 parámetros (aproximadamente 26,1 mil millones) obtenido mediante una fusión en el espacio de pesos (*weight-space merge*) de tres entradas públicas del proyecto REAX SN92. Lo publica el usuario solanaexpert950105 y no implica entrenamiento propio: todas las capacidades aprendidas provienen de los modelos padre, que comparten la misma base, `baselabs/mammoth-1` (revisión `61cec44c281c693992e3d6ebeb44dd3402dfa186`).

La arquitectura declarada en los tags es `qwen3_5`, con un paquete de tipo *joint-readout* y un fichero adicional `readout.safetensors` que no existe en el modelo base. El modelo se etiqueta como `decision-model`, lo que sugiere un uso orientado a la toma de decisiones o a la selección entre alternativas, más que a la generación de texto libre convencional. No se dispone de información sobre la longitud de contexto efectiva ni sobre los idiomas soportados.

Su relevancia es limitada pero concreta: sirve como ejemplo reproducible de aritmética de tareas aplicada a modelos de la familia Qwen3.5, con una receta documentada tensor a tensor y una licencia MIT que facilita la experimentación. Para producción generalista, en cambio, la ausencia de benchmarks, de model card sustantiva y de datos de entrenamiento hace que deba tratarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3_5 con *joint-readout* (según tags y nombres de tensor) |
| Parámetros totales | 26.085.330.160 (26,1 B) |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; el repo ocupa 52,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (incluye `readout.safetensors`), más `config.json`, `decision_config.json`, `joint_config.json` y tokenizer |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es una fusión por aritmética de tareas (*task arithmetic*). Para cada tensor presente también en la base, el peso resultante se calcula como `base + 0,5·(padre_1 − base) + 0,5·(padre_2 − base) + 1·(padre_3 − base)`, donde la base es `baselabs/mammoth-1` y los padres son `isomsom/sn92-gen-m87b` (peso 0,5), `xflud/sn92-decider-1` (peso 0,5) y `edinlong83/sn92-generalist-h5` (peso 1). El *readout* de respuesta, ausente en la base, se obtiene promediando los readouts de los padres con esos mismos pesos y renormalizando para que sumen 1.

El cálculo se realizó tensor a tensor en float32 y se redondeó de vuelta a bfloat16 con redondeo al par más cercano. Los tres padres comparten nombres, formas y dtypes de tensor, lo que hace viable la operación sin alineamiento adicional. Los ficheros de configuración y el tokenizer se copiaron sin cambios del primer padre. No consta ningún proceso de RLHF, DPO ni ajuste posterior; tampoco se documentan tokens de entrenamiento, composición del dataset ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento heredados de los tres modelos padre, sin garantía de que la fusión preserve íntegramente las capacidades individuales.
- Orientación declarada a la toma de decisiones (`decision-model`), con ficheros `decision_config.json` y `joint_config.json` que sugieren una cabeza o readout específico para selección de opciones.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Evaluación de técnicas de *model merging*: el modelo sirve como caso reproducible para estudiar cómo la aritmética de tareas con pesos 0,5/0,5/1 afecta a las capacidades de los padres, comparando salidas antes y después de la fusión.
- Investigación sobre modelos de decisión: el paquete incluye un readout separado y configuraciones específicas, lo que permite analizar si la cabeza de decisión se comporta de forma consistente tras la mezcla.
- Prototipado de clasificación o selección entre alternativas en entornos controlados, aprovechando la orientación `decision-model` y la licencia MIT para iterar sin fricción legal.
- Base para *fine-tuning* ligero: al ser un checkpoint bfloat16 de 26 B con licencia permisiva, puede servir de punto de partida para ajustes con LoRA en tareas concretas, siempre que se valide antes su calidad.
- Experimentos de cuantización: el tamaño (52,2 GB en bfloat16) permite probar pipelines de cuantización a 8 o 4 bits y medir la degradación respecto al checkpoint original.
- Docencia y divulgación: ejemplo práctico de fusión de pesos con receta matemática explícita, útil para explicar *task arithmetic* y la conservación de avisos de licencia de los padres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 52 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 26-30 GB; en 4 bits: aproximadamente 13-16 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16 sin cuantizar; A100 40 GB o L40S 48 GB con cuantización de 8 bits.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bfloat16 ni en 8 bits; podría intentarse en 4 bits, pero sin datos de calidad ni de compatibilidad del paquete *joint-readout* con los kernels habituales.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La presencia de `decision_config.json` y `joint_config.json` sugiere que requiere código de carga específico del proyecto REAX SN92, no un *pipeline* estándar de transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| REAX SN92 generalist entry (este) | 26,1 B | no disponible | MIT | Fusión de pesos, orientado a decisión | Hugging Face, 35 descargas |
| baselabs/mammoth-1 (base) | no disponible | no disponible | no disponible | Modelo base de la familia | Hugging Face |
| isomsom/sn92-gen-m87b (padre) | no disponible | no disponible | no disponible | Entrada generalista SN92 | Hugging Face |
| xflud/sn92-decider-1 (padre) | no disponible | no disponible | no disponible | Entrada de decisión SN92 | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones publicadas: se desconoce si la fusión preserva, degrada o mezcla las capacidades de los tres padres.
- La aritmética de tareas con pesos que suman 2 (0,5 + 0,5 + 1) puede amplificar componentes de los padres y producir comportamientos impredecibles fuera de la distribución de validación.
- No se declaran idiomas soportados; el tokenizer se copió del primer padre, pero no se especifica su cobertura lingüística.
- No se documenta la longitud de contexto efectiva, lo que impide planificar cargas con secuencias largas.
- Riesgo de alucinación no evaluado; al no haber ajuste por RLHF propio, el modelo hereda los sesgos y fallos de los padres sin corrección adicional.
- La licencia MIT es permisiva para uso comercial, pero se deben conservar los avisos de copyright de todos los padres (`LICENSE`) y sus `NOTICE` íntegros; el autor declara no estar afiliado a Base Labs/Baseten, al equipo de Qwen ni a Perplexity AI.
- El despliegue requiere presumiblemente código específico del proyecto REAX SN92 para interpretar `decision_config.json`, `joint_config.json` y `readout.safetensors`; no se garantiza funcionamiento con herramientas estándar.
- El modelo tiene 0 *likes* y 35 descargas, sin validación comunitaria; no debe usarse en producción sin una evaluación propia exhaustiva.

## Enlaces

- [Hugging Face: solanaexpert950105/sn92-gen-md](https://huggingface.co/solanaexpert950105/sn92-gen-md)
- [Modelo base: baselabs/mammoth-1](https://huggingface.co/baselabs/mammoth-1)
- [Padre: isomsom/sn92-gen-m87b](https://huggingface.co/isomsom/sn92-gen-m87b)
- [Padre: xflud/sn92-decider-1](https://huggingface.co/xflud/sn92-decider-1)
- [Padre: edinlong83/sn92-generalist-h5](https://huggingface.co/edinlong83/sn92-generalist-h5)
