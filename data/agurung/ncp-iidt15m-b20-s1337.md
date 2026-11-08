# agurung/ncp-iidt15m-b20-s1337

## Resumen

`agurung/ncp-iidt15m-b20-s1337` es un ajuste fino (fine-tuning) supervisado del modelo `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario agurung en Hugging Face. Se ha entrenado con la librería TRL sobre el dataset `cobalt-traces-rft_ncp_iid_25`, un conjunto de trazas orientado a experimentos de diversidad en la generación. El modelo conserva la arquitectura y el tamaño del modelo base, es decir, un transformer denso de aproximadamente 4.000 millones de parámetros, y se distribuye en formato safetensors con un tamaño de repositorio de 2,1 GB.

El interés de esta publicación no reside en una innovación arquitectónica, sino en su carácter de artefacto de investigación: los tags `uniform`, `sft`, `diversity` y `cobalt` apuntan a experimentos sobre cómo el ajuste fino supervisado afecta a la diversidad de las respuestas. El nombre del modelo (`iidt15m-b20-s1337`) sugiere una configuración concreta dentro de una batería de experimentos (semilla 1337, algún parámetro `b20` y una variante `iidt15m`), aunque el autor no documenta el significado de estas etiquetas en la model card.

La model card es la plantilla autogenerada por TRL y no incluye información sobre licencia, idiomas, composición del dataset ni evaluación. Por tanto, esta ficha se apoya en los metadatos del repositorio y en las características conocidas del modelo base, indicando explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507) |
| Parametros totales | ~4.000 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero el valor exacto no se documenta aquí) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar; el modelo base Qwen3 se distribuye bajo licencia Apache-2.0, pero el ajuste no la declara) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.13.0, Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1, Tokenizers 0.22.2 |
| Dataset de entrenamiento | cobalt-traces-rft_ncp_iid_25 |
| Metodo de entrenamiento | SFT (supervised fine-tuning) |
| Tamano del repositorio | 2,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-4B-Instruct-2507, un transformer decoder-only denso de la familia Qwen3. No se introduce ninguna modificación arquitectónica: se mantienen las capas, la tokenización y el mecanismo de atención del modelo base. El entrenamiento se ha realizado con SFT mediante TRL, partiendo de los pesos del modelo instruct y ajustándolos sobre el dataset `cobalt-traces-rft_ncp_iid_25`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO posterior ni hiperparámetros como la tasa de aprendizaje o el número de épocas.

El único artefacto de seguimiento disponible es un enlace a un run de Weights & Biases (`alexgurung/diversity-experiments_cobalt_qwen3_4b_ft_scripts/runs/rh31xree`), que sugiere que el entrenamiento forma parte de una campaña de experimentos sobre diversidad. Los tags `uniform` y `diversity` refuerzan esa hipótesis, pero no hay documentación técnica que explique qué se mide ni qué conclusiones se extraen. No se han publicado detalles sobre decodificación especulativa, atención lineal ni otras innovaciones.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de roles (`user`, `assistant`) compatible con el pipeline de Transformers.
- Razonamiento y respuesta a preguntas abiertas, heredados del modelo base Qwen3-4B-Instruct-2507.
- Generación de código y matemáticas a nivel del modelo base, aunque no hay evaluación específica tras el ajuste.
- Soporte de tool calling y function calling: no documentado en la model card; depende de si el ajuste preserva las capacidades del modelo base, algo que no se verifica.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el modelo base es multilingüe, pero el ajuste puede haber alterado el equilibrio entre idiomas.
- Modo thinking: el modelo base Qwen3-4B-Instruct-2507 no es un modelo híbrido de razonamiento explícito; no se documenta ningún modo de pensamiento adicional.
- Visión y audio: no soportados.

## Casos de uso

- Investigación sobre diversidad en generación: el modelo sirve como punto de comparación en experimentos que miden cómo el SFT afecta a la variedad de respuestas. Su utilidad principal es reproducir o contrastar los resultados de la campaña `diversity-experiments`.
- Generación de respuestas conversacionales de dominio general: se puede desplegar con el pipeline de Transformers para prototipos de chatbot, siempre que se valide la calidad tras el ajuste.
- Evaluación de técnicas de ajuste con TRL: útil como ejemplo de configuración SFT con versiones recientes de TRL, Transformers y PyTorch, para quienes quieran replicar el flujo de entrenamiento.
- Baseline en experimentos de alineación: al ser un ajuste sobre un instruct conocido, permite aislar el efecto del dataset `cobalt-traces-rft_ncp_iid_25` frente al modelo original.
- Análisis de trazas sintéticas: si el dataset contiene trazas de razonamiento, el modelo puede emplearse para estudiar cómo se internalizan ese tipo de datos.
- Docencia y formación: como ejemplo práctico de fine-tuning de un modelo de 4B con TRL y seguimiento en Weights & Biases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 8-9 GB para los pesos (4B parámetros a 2 bytes) más overhead de activaciones y caché KV; en la práctica, 10-12 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB; en 4 bits, unos 3-4 GB (requiere cuantizar el modelo, ya que el repositorio solo publica safetensors).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues de producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 sin problemas.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en GPUs de 8 GB como la RTX 3070.
- Opciones de despliegue: Transformers con `pipeline`, Text Generation Inference (el tag `text-generation-inference` está presente), vLLM; para cuantización sería necesario generar los pesos GGUF con llama.cpp u Ollama a partir de los safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| agurung/ncp-iidt15m-b20-s1337 | ~4B | no disponible | no disponible | Hugging Face (0 descargas) | Ajuste SFT de investigación sobre Qwen3-4B-Instruct-2507 |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible en esta ficha | Apache-2.0 (modelo base) | Hugging Face, ampliamente adoptado | Modelo original sin ajuste, con documentación y evaluación publicadas |
| agurung/ncp-groott15-b20-s1337 | ~4B (presumiblemente) | no disponible | no disponible | Hugging Face | Variante del mismo autor dentro de la campaña de experimentos |
| agurung/ncp-iidt15-b20 | ~4B (presumiblemente) | no disponible | no disponible | Hugging Face | Otra variante de la misma serie, sin semilla en el nombre |

## Limitaciones y advertencias

- La model card no declara licencia utilizable; el campo `licence: license` no especifica términos, por lo que el uso comercial no está autorizado de forma explícita.
- No hay información sobre sesgos, idiomas ni composición del dataset de ajuste, lo que impide evaluar riesgos de sesgo sistemático.
- Riesgo de alucinación inherente a los modelos de 4B ajustados con SFT sobre datos posiblemente sintéticos; no se ha evaluado la fidelidad factual tras el ajuste.
- El ajuste puede haber degradado capacidades del modelo base (tool calling, multilingüismo, contexto largo) sin que exista evaluación que lo confirme o descarte.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo minuto: es un artefacto de investigación sin validación comunitaria.
- No se publican pesos cuantizados, por lo que el despliegue en hardware limitado requiere un paso adicional de cuantización.
- El nombre del modelo contiene parámetros (`iidt15m`, `b20`, `s1337`) cuyo significado no se documenta, lo que dificulta la reproducibilidad.
- No hay garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/ncp-iidt15m-b20-s1337
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/cobalt-traces-rft_ncp_iid_25
- Run de Weights & Biases: https://wandb.ai/alexgurung/diversity-experiments_cobalt_qwen3_4b_ft_scripts/runs/rh31xree
- Repositorio TRL: https://github.com/huggingface/trl
- Variante relacionada: https://huggingface.co/agurung/ncp-groott15-b20-s1337
- Variante relacionada: https://huggingface.co/agurung/ncp-iidt15-b20
