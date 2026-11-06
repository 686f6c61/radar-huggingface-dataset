# ronanlee777/sn92-gen-mb

## Resumen

`ronanlee777/sn92-gen-mb` es un modelo de decisión publicado en Hugging Face por el usuario ronanlee777, construido mediante una fusión en el espacio de pesos (weight-space merge) de dos entradas públicas del proyecto REAX SN92: `isomsom/sn92-gen-m87b` y `xflud/sn92-decider-1`. No se ha realizado entrenamiento propio: todos los cambios aprendidos provienen de los modelos padre, y el autor lo declara explícitamente en la model card. La arquitectura subyacente es `Qwen3_5Model` con un paquete de lectura conjunta (joint-readout package), con 26.085.330.160 parámetros totales según los pesos en safetensors.

El modelo se presenta como una "entrada generalista" del linaje SN92, una familia orientada a tareas de decisión. La técnica empleada es aritmética de tareas: para cada tensor presente también en la base se aplica `base + 0.7 * (parent_1 - base) + 0.7 * (parent_2 - base)`, partiendo de `baselabs/mammoth-1` (revisión `61cec44c281c693992e3d6ebeb44dd3402dfa186`). El readout de respuesta se obtiene como media simple de los readouts de los padres. El cálculo se hace tensor a tensor en float32 y se redondea a bfloat16.

Es relevante ahora porque ejemplifica una práctica creciente en el ecosistema open source: publicar merges de pesos como artefactos reproducibles, con receta explícita, revisión fijada de cada padre y licencia permisiva (MIT). Para desarrolladores e investigadores, sirve como punto de partida para evaluar si la combinación de dos especializaciones SN92 mejora el comportamiento generalista frente a cada padre por separado, aunque la información pública disponible sobre capacidades y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model con joint-readout package (transformer, según nomenclatura del linaje) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (más `readout.safetensors` para el readout) |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen3_5Model`, un transformer con un componente adicional de lectura conjunta (`joint-readout package`). El paquete incluye `config.json`, `decision_config.json`, `joint_config.json` y el tokenizer, copiados sin cambios del primer padre (`isomsom/sn92-gen-m87b`). Los tres modelos implicados (base y ambos padres) comparten nombres de tensor, formas y dtypes, lo que permite la fusión directa sin alineamiento.

No hay entrenamiento propio. La receta es aritmética de tareas con coeficiente 0,7 por padre: cada padre conserva el 70 % de su cambio respecto a la base `baselabs/mammoth-1`. El readout de respuesta, que no existe en la base, se calcula como media aritmética de los readouts de los dos padres. Todo el cálculo se realiza en float32 tensor a tensor y se redondea a bfloat16 con redondeo al par más cercano. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, porque el modelo no entrena: hereda lo aprendido por sus padres.

## Capacidades

- Generación de texto y tareas de decisión: el linaje SN92 se etiqueta como `decision-model`, orientado a seleccionar o puntuar opciones más que a generación libre.
- Razonamiento multi-paso: no confirmado en la información disponible.
- Generación de código: no confirmado.
- Matemáticas: no confirmado.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Readout conjunto: el paquete incluye un `readout.safetensors` que produce la señal de decisión final promediada de ambos padres.

## Casos de uso

- Evaluación de merges de pesos: usar el modelo como referencia reproducible para estudiar cómo afecta la aritmética de tareas con coeficiente 0,7 a dos especializaciones SN92; la receta fijada con revisiones concretas permite replicar el resultado.
- Punto de partida para fine-tuning posterior: al ser un merge generalista con licencia MIT, puede servir como inicialización para ajuste supervisado en tareas de decisión específicas del dominio del investigador.
- Investigación sobre linajes de decisión: comparar el comportamiento del merge frente a cada padre (`isomsom/sn92-gen-m87b` y `xflud/sn92-decider-1`) para aislar qué aporta cada especialización.
- Despliegue interno de bajo riesgo: la licencia MIT y la ausencia de cláusulas de uso restringido facilitan pruebas en entornos corporativos cerrados, siempre que se validen las capacidades reales.
- Reproducción de experimentos de merging: el cálculo en float32 con redondeo a bfloat16 documentado permite auditar la implementación de aritmética de tareas en pipelines propios.
- Docencia y formación: ejemplo didáctico de fusión de modelos con base común, revisión fijada y conservación de avisos de copyright de los padres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26,09 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 26 GB; en 4 bits, alrededor de 13 GB (estimaciones teóricas, no verificadas con este modelo).
- GPU recomendadas para bfloat16: A100 80 GB, H100 80 GB o dos GPU de 40 GB con tensor parallelism.
- GPU consumer: no cabe en una RTX 4090 (24 GB) en bfloat16; en cuantización de 4 bits podría ajustarse, pero no hay confirmación de soporte de cuantización para este paquete.
- Opciones de despliegue: vLLM o TGI para bfloat16 en multi-GPU; llama.cpp u Ollama solo si se generan pesos GGUF, lo cual no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Relación |
|---|---|---|---|---|
| ronanlee777/sn92-gen-mb | 26,09 B | no disponible | MIT | Merge de los dos siguientes |
| isomsom/sn92-gen-m87b | no disponible | no disponible | no disponible | Padre, peso 0,7 |
| xflud/sn92-decider-1 | no disponible | no disponible | no disponible | Padre, peso 0,7 |
| baselabs/mammoth-1 | no disponible | no disponible | no disponible | Base común de la fusión |

No se dispone de datos de rendimiento de ninguno de los modelos del linaje, por lo que la comparativa se limita a la relación genealógica y a la licencia del merge.

## Limitaciones y advertencias

- No hay entrenamiento propio: cualquier sesgo o limitación de los padres se hereda sin corrección; el merge no añade alineamiento ni filtrado.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, la generación libre puede ser poco fiable.
- Idiomas y contexto: no declarados; no se debe asumir soporte multilingüe ni una ventana de contexto concreta sin verificación empírica.
- Licencia MIT: permite uso comercial, pero se deben conservar las líneas de copyright de todos los padres en LICENSE y los avisos en NOTICE, tal como indica la model card.
- Afiliación: el autor declara no estar afiliado ni respaldado por Base Labs / Baseten, el equipo de Qwen, Perplexity AI ni los autores de los padres.
- Madurez: 40 descargas y 0 likes en el momento de la consulta; no hay pipeline declarado ni documentación de evaluación, por lo que no es apto para producción sin validación previa.
- Fecha de creación registrada: 2026-10-27, dato que conviene contrastar con el resto de metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronanlee777/sn92-gen-mb
- Padre 1: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre 2: https://huggingface.co/xflud/sn92-decider-1
- Base común: https://huggingface.co/baselabs/mammoth-1
- Revisión de la base citada: `61cec44c281c693992e3d6ebeb44dd3402dfa186`
- Revisión del padre 1: `7f04058f63745440fae3c10f8da249a0c55fea40`
- Revisión del padre 2: `db2e622aa508bd82350620bf165441fa4043f3cf`
