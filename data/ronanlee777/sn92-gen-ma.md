# ronanlee777/sn92-gen-ma

## Resumen

`ronanlee777/sn92-gen-ma` es un modelo de decisión publicado en Hugging Face por el usuario ronanlee777, resultado de un merge en espacio de pesos (model soup lineal) de dos entradas públicas del proyecto REAX SN92: `isomsom/sn92-gen-m87b` y `xflud/sn92-decider-1`. No hay entrenamiento propio: todas las capacidades aprendidas provienen de los modelos padre, ambos derivados de la base `baselabs/mammoth-1` (commit `61cec44c281c693992e3d6ebeb44dd3402dfa186`). El modelo se presenta como una "entrada generalista" del linaje SN92, orientada a tareas de decisión.

Técnicamente se empaqueta como un paquete Qwen3_5Model con readout conjunto (`joint-readout package`), con los ficheros `readout.safetensors`, `decision_config.json` y `joint_config.json` como artefactos propios. Los pesos suman 26.085.330.160 parámetros (aproximadamente 26,1 mil millones) en formato safetensors y bfloat16, con un repositorio de 52,2 GB. La licencia es MIT y se conservan los avisos y copyrights de ambos padres.

Su relevancia es limitada y muy específica: se trata de un experimento de merging reproducible sobre un linaje concreto (SN92), no de un modelo entrenado desde cero ni de un lanzamiento con benchmarks. Para desarrolladores e investigadores resulta útil como ejemplo de receta de model soup sobre arquitecturas Qwen3_5 con readout de decisión, y como punto de partida para evaluar si el promedio de pesos de dos entradas SN92 conserva o mejora el comportamiento de los padres. No hay información publicada sobre idiomas, contexto ni rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model con readout conjunto (joint-readout package) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16; `readout.safetensors` como fichero independiente) |

## Arquitectura y entrenamiento

El modelo es un merge lineal en espacio de pesos de dos entradas SN92 con idénticos nombres, formas y dtypes de tensor. La receta es un model soup: cada tensor, tanto del backbone como del readout de respuesta, se calcula en float32 como `sum(weight_i * parent_i)` con peso 0,5 para cada padre, y se redondea de vuelta a bfloat16 con redondeo al par más cercano. Los ficheros `config.json`, `decision_config.json`, `joint_config.json` y el tokenizador se copian sin cambios del primer padre (`isomsom/sn92-gen-m87b`).

No hay entrenamiento adicional, ni datos de entrenamiento propios, ni fases de RLHF/DPO documentadas en la información disponible. La innovación técnica es exclusivamente la receta de merging: promedio ponderado tensor a tensor en float32 con redondeo controlado, aplicado a un paquete Qwen3_5 con readout de decisión separado. La base declarada es `baselabs/mammoth-1`, compartida por ambos padres, lo que garantiza compatibilidad de tensores.

## Capacidades

- Generación de texto y razonamiento: heredadas de los padres SN92, sin evaluación publicada específica para este merge.
- Toma de decisiones: el paquete incluye un readout de decisión (`decision_config.json`) y un readout conjunto (`joint_config.json`), lo que sugiere uso como modelo de decisión además de generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.
- Merge reproducible: la receta completa (revisiones de padres, pesos, precisión y redondeo) está documentada, lo que permite replicar el modelo.

## Casos de uso

- Evaluación de técnicas de merging: usar el modelo como caso de estudio controlado para medir si un model soup 50/50 de dos entradas SN92 conserva el comportamiento de los padres en tareas de decisión; la receta documentada permite reproducir el experimento y comparar contra cada padre por separado.
- Punto de partida para ajuste fino: al ser un paquete Qwen3_5 de 26,1B con licencia MIT, puede servir como inicialización para fine-tuning supervisado en dominios de decisión, partiendo de un punto intermedio entre dos entradas ya entrenadas.
- Investigación sobre linajes de modelos: analizar la relación entre `baselabs/mammoth-1`, los padres SN92 y este merge para estudiar cómo se propagan las capacidades a través de merges en espacio de pesos.
- Despliegue experimental en pipelines de decisión: el readout de decisión separado permite integrar el modelo en flujos donde se requiere una señal de decisión además de texto generado, siempre que se valide previamente su calidad.
- Comparación de recetas de merge: servir como referencia para contrastar merges lineales frente a otras técnicas (SLERP, TIES, DARE) sobre la misma base y los mismos padres.
- Docencia y formación técnica: ilustrar en un curso o taller cómo se construye un model soup reproducible con pesos, revisiones y redondeo explícitos, usando un repositorio pequeño (52,2 GB) y con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26,1B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 60-70 GB de VRAM para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 26 GB para pesos, más overhead; en 4 bits, alrededor de 13-14 GB para pesos, más overhead. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16 sin cuantizar; A100 40 GB o L40S 48 GB solo con cuantización; RTX 4090 24 GB únicamente con cuantización agresiva (4 bits) y contexto reducido.
- ¿Cabe en GPU de consumo? Solo con cuantización de 4 bits y contexto limitado; en una RTX 4090 de 24 GB el margen es muy ajustado y no hay garantía de soporte del paquete Qwen3_5 con readout conjunto en los runners habituales.
- Opciones de despliegue: no disponible. El autor no documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato de paquete con readout separado puede requerir código específico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Relación |
|---|---|---|---|---|
| ronanlee777/sn92-gen-ma | 26,1B | no disponible | MIT | Merge 50/50 de los dos siguientes |
| isomsom/sn92-gen-m87b | no disponible | no disponible | no disponible | Padre, peso 0,5 |
| xflud/sn92-decider-1 | no disponible | no disponible | no disponible | Padre, peso 0,5 |
| baselabs/mammoth-1 | no disponible | no disponible | no disponible | Base compartida de ambos padres |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- No hay evaluación publicada: no se han divulgado benchmarks, por lo que se desconoce si el merge conserva, degrada o mejora el comportamiento de los padres.
- Sin entrenamiento propio: todas las capacidades y sesgos provienen de los padres; el merge no corrige sesgos ni alucinaciones heredadas.
- Idiomas y contexto no documentados: no se declaran idiomas soportados ni longitud de contexto, lo que impide planificar su uso en producción sin pruebas previas.
- Formato de paquete no estándar: el readout conjunto y los ficheros `decision_config.json` y `joint_config.json` pueden no ser compatibles con runners convencionales; verificar el código de carga antes de desplegar.
- Licencia MIT: permite uso comercial, pero se deben conservar los avisos de copyright de todos los padres (LICENSE) y sus NOTICE íntegros.
- Sin afiliación: el autor declara no estar afiliado ni respaldado por Base Labs / Baseten, el equipo de Qwen, Perplexity AI ni los autores de los padres; no atribuir el modelo a esas entidades.
- Riesgo de alucinación: no cuantificado; al no haber evaluación, debe validarse en el dominio concreto antes de cualquier uso en producción.
- Repositorio con pocas descargas (67) y sin likes: comunidad mínima, sin soporte ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronanlee777/sn92-gen-ma
- Padre 1: https://huggingface.co/isomsom/sn92-gen-m87b (revisión `7f04058f63745440fae3c10f8da249a0c55fea40`)
- Padre 2: https://huggingface.co/xflud/sn92-decider-1 (revisión `db2e622aa508bd82350620bf165441fa4043f3cf`)
- Base compartida: https://huggingface.co/baselabs/mammoth-1 (commit `61cec44c281c693992e3d6ebeb44dd3402dfa186`)
