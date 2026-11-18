# hirundo-io/Qwen3-Coder-30B-A3B-Instruct-Westernized-LoRA

## Resumen

El modelo `hirundo-io/Qwen3-Coder-30B-A3B-Instruct-Westernized-LoRA` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario hirundo-io sobre el modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct`, desarrollado por Alibaba Qwen. Se trata de un ajuste fino de tipo PEFT orientado a lo que el autor denomina "desaprendizaje conductual" (behavioral unlearning) y "occidentalización" (westernization) del comportamiento del modelo base. No es un modelo completo, sino un conjunto de pesos delta que deben combinarse con el modelo base para su uso.

El modelo base Qwen3-Coder-30B-A3B-Instruct es un transformer de arquitectura Mixture of Experts (MoE) con 30 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token, especializado en generación de código e instrucciones. La relevancia de este adaptador reside en su propósito declarado de modificar sesgos conductuales y de alineación cultural del modelo original, un área de investigación activa en seguridad y moderación de contenido.

La información pública disponible sobre este adaptador es muy limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no se especifican idiomas soportados ni pipeline, y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face. El tamaño del repositorio es de 2,6 GB, coherente con un adaptador LoRA de rango moderado sobre un modelo de 30B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE (modelo base Qwen3-Coder-30B-A3B-Instruct) |
| Parametros totales | No disponible para el adaptador; modelo base: 30B (MoE) |
| Parametros activos | No disponible para el adaptador; modelo base: ~3B activos por token |
| Longitud de contexto | No disponible para el adaptador; heredada del modelo base (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) de tipo PEFT, lo que implica que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas para modificar su comportamiento. El modelo base subyacente, Qwen3-Coder-30B-A3B-Instruct, es un transformer con arquitectura Mixture of Experts de 30B parámetros totales y ~3B activos por token, diseñado por el equipo Qwen de Alibaba para tareas de código e instrucciones generales.

El propósito declarado del adaptador es el "desaprendizaje conductual" (behavioral unlearning) y la "occidentalización" (westernization) del modelo, según los tags del repositorio. No se proporcionan en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos, ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se especifican los hiperparámetros del LoRA (rango, alpha, capas objetivo) ni la metodología exacta de desaprendizaje. Toda esta información se considera no disponible.

## Capacidades

- Generacion de codigo: heredada del modelo base Qwen3-Coder-30B-A3B-Instruct, especializado en tareas de programacion.
- Generacion de texto e instrucciones: el modelo base es un modelo instruct, por lo que conserva capacidades de seguir instrucciones.
- Razonamiento y matematicas: capacidades heredadas del modelo base, no verificadas para el adaptador.
- Tool calling / function calling: no confirmado para el adaptador; el modelo base Qwen3-Coder soporta tool calling segun su documentacion oficial, pero no se especifica en la informacion proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no confirmado para el adaptador.
- Capacidades multilingues: no disponibles; no se especifican idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles para el adaptador; el modelo base es text-only segun la informacion disponible.
- Modificacion conductual: el adaptador aplica un ajuste de "desaprendizaje conductual" y "occidentalizacion" cuyo alcance exacto no esta documentado en la informacion disponible.

## Casos de uso

- Investigacion en desaprendizaje conductual: el adaptador sirve como artefacto de estudio para analizar como un LoRA de bajo rango puede modificar sesgos y comportamientos de alineacion en un modelo de codigo de 30B, permitiendo comparar respuestas antes y despues del ajuste.
- Evaluacion de alineacion cultural: util para equipos que investigan como la "occidentalizacion" de un modelo afecta a la distribucion de respuestas en tareas de codigo y texto, con el modelo base como control.
- Pruebas de robustez y seguridad: permite medir si el desaprendizaje conductual introduce regresiones en capacidades de codigo o en la coherencia de las respuestas, mediante benchmarks comparativos contra el modelo base.
- Desarrollo de pipelines de moderacion: el adaptador puede integrarse en entornos de investigacion para estudiar la eficacia de tecnicas de unlearning como mecanismo de moderacion de contenido.
- Experimentacion con PEFT en produccion controlada: dado que es un adaptador LoRA sobre un modelo MoE, sirve para validar flujos de despliegue con PEFT, vLLM o TGI combinando el adaptador con el modelo base cuantizado, siempre que se acepte la licencia y las condiciones de acceso.
- Analisis de sesgos en generacion de codigo: investigadores pueden usar el adaptador para examinar si la modificacion conductual altera sesgos en sugerencias de codigo, nombres de variables o comentarios generados, comparando con el modelo base sin adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base. El adaptador ocupa 2,6 GB en disco (safetensors), pero la inferencia requiere cargar el modelo base Qwen3-Coder-30B-A3B-Instruct.
- Modelo base en precision completa (BF16): aproximadamente 60 GB de VRAM para los 30B parametros totales, aunque al ser MoE con ~3B activos el throughput es menor que un denso de 30B.
- Cuantizacion del modelo base: en 8 bits, ~30 GB; en 4 bits, ~15-18 GB, lo que podria permitir su ejecucion en GPUs consumer de gama alta con suficiente VRAM.
- GPU recomendadas: para el modelo base en BF16, A100 80GB o H100 80GB; para cuantizacion 4-bit, RTX 4090 (24 GB) o RTX 3090 (24 GB) podrian ser viables, aunque no confirmado en la informacion disponible.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para el modelo base; el adaptador LoRA requiere soporte de PEFT, que vLLM y TGI ofrecen mediante carga de adaptadores. No confirmado para este adaptador concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hirundo-io/Qwen3-Coder-30B-A3B-Instruct-Westernized-LoRA | LoRA sobre 30B MoE (~3B activos) | No disponible | Apache 2.0 | Gated en HF, 0 descargas | Adaptador de desaprendizaje conductual |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30B MoE (~3B activos) | No disponible en la informacion | Apache 2.0 | Publico en HF | Modelo base, sin modificacion conductual |
| Otros adaptadores LoRA sobre Qwen3-Coder | Variable | Heredado del base | Variable | Variable | No disponible comparativa especifica en la informacion proporcionada |

No se dispone de informacion sobre benchmarks del adaptador que permita una comparativa cuantitativa con alternativas. La comparacion se limita a parametros estructurales y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de su descarga.
- Dependencia del modelo base: el adaptador no es autonomo; requiere cargar Qwen3-Coder-30B-A3B-Instruct, lo que implica asumir tambien las limitaciones y la licencia del modelo base.
- Documentacion insuficiente: no se especifican datos de entrenamiento, hiperparametros del LoRA, idiomas, pipeline ni metodologia de evaluacion, lo que dificulta reproducir o validar el ajuste.
- Riesgo de regresion de capacidades: el desaprendizaje conductual puede degradar capacidades de codigo o coherencia del modelo base; no hay benchmarks publicados que lo descarten.
- Sesgos: el propio nombre "Westernized" indica una modificacion deliberada de sesgos culturales; el resultado puede introducir nuevos sesgos o desequilibrios no documentados.
- Riesgo de alucinacion: no evaluado para el adaptador; se hereda el riesgo del modelo base, potencialmente alterado por el ajuste.
- Uso comercial: la licencia Apache 2.0 del adaptador lo permite, pero debe verificarse la compatibilidad con las condiciones del modelo base y del acceso gated.
- Madurez: 0 descargas y 0 likes indican ausencia de validacion por la comunidad; no se recomienda su uso en produccion sin evaluacion propia.
- Idiomas: no se especifican idiomas soportados, por lo que no se puede garantizar un comportamiento multilingue adecuado.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/Qwen3-Coder-30B-A3B-Instruct-Westernized-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
