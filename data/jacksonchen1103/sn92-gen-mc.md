# jacksonchen1103/sn92-gen-mc

## Resumen

`jacksonchen1103/sn92-gen-mc` es un modelo de decisión (decision-model) publicado en HuggingFace que no ha sido entrenado desde cero, sino que resulta de una fusión en el espacio de pesos (weight-space merge) de dos entradas públicas del proyecto REAX SN92: `isomsom/sn92-gen-m87b` y `xflud/sn92-decider-1`. Ambos modelos padre comparten la misma base, `baselabs/mammoth-1` (revisión `61cec44c281c693992e3d6ebeb44dd3402dfa186`), lo que hace posible la aritmética de tareas por capas que da lugar a este modelo. El autor declara explícitamente que no hay entrenamiento propio: todas las capacidades aprendidas provienen de los padres.

El modelo cuenta con 26.085.330.160 parámetros totales (aproximadamente 26,1 mil millones) y un repositorio de 52,2 GB en formato safetensors, lo que sugiere pesos en bfloat16. La arquitectura está etiquetada como `qwen3_5`, con 64 capas de lenguaje que combinan proyecciones de atención y linear-attention, además de un vision tower heredado de la base. La licencia es MIT, lo que facilita su uso comercial, aunque con la obligación de conservar los avisos de copyright de todos los padres.

Su relevancia radica en el nicho: no es un modelo generativo de propósito general, sino un modelo orientado a la toma de decisiones tipadas (typed decisions) dentro del ecosistema REAX SN92, evaluado con el conjunto de evaluación v5.1 sobre tareas de `tasksource`. Es un ejemplo de cómo la fusión de pesos permite combinar especializaciones sin coste de entrenamiento adicional, aunque con las limitaciones propias de un modelo derivado y poco documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención y linear-attention (etiqueta `qwen3_5`), 64 capas de lenguaje, con vision tower |
| Parámetros totales | 26.085.330.160 (≈26,1 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `baselabs/mammoth-1`, etiquetada como `qwen3_5`, con 64 capas de lenguaje divididas en dos grupos (capas 0-31 y 32-63). Cada grupo contiene proyecciones de atención, linear-attention, normalización de entrada, MLP y normalización post-atención, además de embeddings, normalización final y un vision tower. El modelo resultante no ha sido entrenado: se obtiene mediante aritmética de tareas por capas, aplicando `base + sum_i lam_i(tensor) * (parent_i - base)` tensor a tensor, calculado en float32 y redondeado a bfloat16 con redondeo al par más cercano.

Los coeficientes de fusión se obtuvieron mediante una búsqueda CMA-ES puntuada con el código de serving y scoring v5.1 de REAX sobre ítems públicos en formato eval v5.1 de `tasksource/tasksource-jev-typed-decisions` y `tasksource/procedural-typed-decisions` (split de validación para la búsqueda, split de test para la comprobación). Los coeficientes finales por grupo son: capas 0-31 con 0,971 (atención) y 0,574 (MLP) para `sn92-gen-m87b`, y 0,543 (atención) y 0,802 (MLP) para `sn92-decider-1`; capas 32-63 con 0,544 y 0,998 para el primero, y 0,765 y 0,895 para el segundo. Embeddings, normalización final y vision tower usan la media de los coeficientes de cada padre, y el readout de respuesta es la media ponderada por coeficientes de los readouts de los padres. `config.json`, `decision_config.json`, `joint_config.json` y el tokenizer se copian sin cambios del primer padre.

## Capacidades

- Toma de decisiones tipadas (typed decisions) en el formato de evaluación v5.1 de REAX SN92, que es la tarea principal para la que se seleccionaron los coeficientes.
- Razonamiento sobre ítems procedimentales y de tipo JEV, según los conjuntos de `tasksource` usados en la búsqueda y validación.
- Procesamiento multimodal: hereda el vision tower de la base `baselabs/mammoth-1`, aunque no se documentan las capacidades visuales concretas.
- Generación de texto y razonamiento general, heredados de los padres, sin garantías específicas documentadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación y decisión tipada en pipelines de evaluación: el modelo está ajustado específicamente para emitir decisiones en el formato v5.1 de REAX SN92, por lo que encaja en sistemas que necesitan respuestas estructuradas y verificables sobre ítems tipados.
- Evaluación automatizada de modelos y agentes: puede emplearse como componente de scoring dentro de arneses de evaluación que sigan el formato de `tasksource`, sustituyendo o complementando a un juez basado en API.
- Enrutamiento de consultas en sistemas multi-modelo: al ser un decision-model, puede actuar como clasificador de intención o selector de ruta antes de invocar un modelo generativo mayor.
- Experimentación en fusión de pesos: sirve como caso de estudio reproducible de aritmética de tareas por capas con coeficientes optimizados por CMA-ES, útil para investigadores que quieran replicar la receta sobre otras bases.
- Prototipado con licencia permisiva: al ser MIT, puede integrarse en productos comerciales internos sin negociación de licencia, siempre que se conserven los avisos de los padres.
- Investigación sobre modelos derivados: permite estudiar cómo se comportan las capacidades de dos padres especializados al combinarse linealmente, comparando contra cada padre por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los coeficientes se puntuaron con el código de serving y scoring v5.1 de REAX sobre los splits de validación y test de `tasksource/tasksource-jev-typed-decisions` y `tasksource/procedural-typed-decisions`, pero no se proporcionan las puntuaciones numéricas obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,1 B de parámetros en bfloat16, se necesitan aproximadamente 52 GB solo para los pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits bajaría a unos 26 GB y en 4 bits a unos 13-14 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: para bfloat16 completo, A100 80 GB, H100 80 GB o H200; para 8 bits, A100 40 GB o L40S 48 GB; para 4 bits, RTX 4090 24 GB o RTX 3090 24 GB podrían ser suficientes en teoría, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Solo con cuantización agresiva (4 bits) y siempre que la arquitectura con linear-attention sea compatible con los kernels disponibles; no hay evidencia publicada de que funcione en llama.cpp u Ollama.
- Opciones de despliegue: no se documentan. Al ser un modelo con `decision_config.json` y `joint_config.json` propios, probablemente requiere el código de serving v5.1 de REAX, no disponible en la información proporcionada. vLLM, TGI o llama.cpp no están confirmados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `jacksonchen1103/sn92-gen-mc` | 26,1 B | No disponible | MIT | Fusión de dos entradas SN92; sin entrenamiento propio |
| `isomsom/sn92-gen-m87b` (padre) | No disponible | No disponible | No disponible | Entrada generalista SN92; coeficiente medio 0,772 |
| `xflud/sn92-decider-1` (padre) | No disponible | No disponible | No disponible | Entrada decider SN92; coeficiente medio 0,751 |
| `baselabs/mammoth-1` (base) | No disponible | No disponible | No disponible | Base compartida por los padres; arquitectura `qwen3_5` con vision tower |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y relación de derivación.

## Limitaciones y advertencias

- No hay entrenamiento propio: cualquier sesgo, error o alucinación proviene de los padres o de la base, y el autor no los caracteriza.
- El proceso de fusión puede degradar capacidades que no estuvieran representadas en los conjuntos de evaluación usados para la búsqueda CMA-ES, especialmente fuera del dominio de decisiones tipadas.
- Los coeficientes se optimizaron sobre splits de validación de dos conjuntos concretos de `tasksource`; existe riesgo de sobreajuste a ese formato y de mal rendimiento en dominios distintos.
- No se documentan idiomas soportados, longitud de contexto ni tipos de cuantización, lo que dificulta planificar su despliegue en producción.
- El modelo requiere presumiblemente el código de serving v5.1 de REAX para interpretar `decision_config.json` y `joint_config.json`; sin él, la inferencia estándar puede no reproducir el comportamiento esperado.
- La licencia MIT es permisiva, pero obliga a conservar las líneas de copyright de todos los padres en `LICENSE` y sus avisos en `NOTICE`.
- El modelo no está afiliado ni respaldado por Base Labs / Baseten, el equipo de Qwen, Perplexity AI ni los autores de los padres, según declara el autor.
- El repositorio tiene 44 descargas y 0 likes en el momento de la consulta, con lo que la validación comunitaria es prácticamente nula.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia numérica de que la fusión supere a ninguno de los padres.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacksonchen1103/sn92-gen-mc
- Modelo padre: https://huggingface.co/isomsom/sn92-gen-m87b
- Modelo padre: https://huggingface.co/xflud/sn92-decider-1
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Conjunto de evaluación: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Conjunto de evaluación: https://huggingface.co/datasets/tasksource/procedural-typed-decisions
