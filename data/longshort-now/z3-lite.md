# longshort-now/z3-lite

## Resumen

z3-lite (también denominado d3-lite) es un modelo de decisión publicado por el usuario longshort-now en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B, con 852.985.920 parámetros totales en formato safetensors y un repositorio de 1,7 GB. La model card lo describe como un "soup body" para la subnet 127 de Bittensor, lo que sitúa el modelo en el contexto de los ecosistemas descentralizados de incentivos para modelos de IA.

El modelo se distribuye con licencia Apache 2.0 y utiliza código personalizado (tag `custom_code`), con etiquetas que lo clasifican como `zils` y `decision-model`. La información pública disponible es muy limitada: no se especifican idiomas soportados, pipeline, datos de entrenamiento ni resultados de benchmarks. La model card únicamente identifica el pool (`d3-lite`), el modelo padre y una referencia a un fichero `zils-owner.json` con la hotkey del propietario.

Por su tamaño (menos de mil millones de parámetros) y su naturaleza de modelo de decisión, z3-lite encaja en escenarios de inferencia en hardware de consumo y en tareas de clasificación o selección más que en generación abierta de propósito general. No obstante, la ausencia de documentación técnica detallada limita seriamente su evaluación rigurosa antes de un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5-0.8B (detalle no disponible) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones publicadas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 1,7 GB |
| Codigo | custom_code (requiere cargar codigo remoto) |

## Arquitectura y entrenamiento

La información disponible indica que z3-lite es un finetune del modelo Qwen/Qwen3.5-0.8B, por lo que hereda la arquitectura transformer del modelo padre, aunque no se detallan en la model card ni el número de capas, ni las dimensiones ocultas, ni el mecanismo de atención concreto. El modelo se presenta como un "soup body", término que en la práctica suele referirse a una combinación de pesos (model soup) obtenida promediando varios checkpoints, aunque el autor no documenta el procedimiento exacto.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El tag `custom_code` implica que la carga del modelo requiere ejecutar código remoto del repositorio, lo que añade un riesgo de seguridad que debe evaluarse antes de su uso.

## Capacidades

- Clasificación y toma de decisiones: las etiquetas `decision-model` y `d3-lite` sugieren un uso orientado a seleccionar entre opciones o emitir decisiones, aunque no se detalla el formato de entrada/salida.
- Generación de texto: capacidad heredada del modelo base Qwen3.5-0.8B, sin garantías documentadas tras el finetune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Participación en la subnet 127 de Bittensor: el modelo se publica explícitamente como cuerpo para esta subnet, por lo que su uso previsto es servir como nodo de decisión dentro de ese ecosistema de incentivos.
- Clasificación binaria o multietiqueta en pipelines ligeros: con menos de mil millones de parámetros, puede ejecutarse en CPU o GPU de gama baja para tareas de filtrado o enrutamiento, siempre que se valide su comportamiento con datos propios.
- Enrutamiento de consultas en sistemas RAG: podría emplearse como clasificador para decidir qué recuperador o herramienta invocar, aunque la falta de documentación sobre su formato de salida obliga a una validación previa.
- Experimentación académica sobre model soups: al ser un "soup body" de un modelo pequeño, resulta útil para estudiar el efecto del promediado de pesos en modelos de menos de 1B de parámetros.
- Prototipado rápido en hardware de consumo: su tamaño permite cargarlo en GPUs con 4-8 GB de VRAM en cuantización de 8 o 4 bits, aunque no se publican ficheros GGUF oficiales.
- Evaluación comparativa de finetunes sobre Qwen3.5-0.8B: sirve como punto de referencia en estudios que comparen distintas recetas de ajuste sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 3 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9-1,2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,5-0,7 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4); para 4 bits, incluso GPUs integradas o CPU pueden ser suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs dedicadas actuales y en muchas integradas con cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el tag `custom_code`); vLLM, llama.cpp u Ollama solo si se generan conversiones compatibles, que no se publican en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| longshort-now/z3-lite | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, requiere `custom_code` |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | no disponible en la informacion | Hugging Face |
| Qwen2.5-0.5B | ~0,5B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | Hugging Face, ampliamente soportado |
| Llama 3.2 1B | ~1,2B | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | Hugging Face, ecosistema amplio |

La comparativa se limita a parámetros y licencia, ya que no se han publicado métricas de rendimiento de z3-lite que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla datos de entrenamiento, idiomas, contexto ni formato de salida, lo que impide evaluar su idoneidad con rigor.
- Riesgo de alucinación: al ser un finetune de un modelo de 0,8B, la tasa de alucinación puede ser elevada, especialmente fuera de su dominio de decisión previsto.
- Código remoto: el tag `custom_code` obliga a ejecutar código del repositorio al cargar el modelo; conviene auditar dicho código antes de usarlo en entornos de producción.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación; los sesgos del modelo base pueden persistir o amplificarse tras el finetune.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener condiciones adicionales que deben verificarse en su propia model card.
- Contexto e idiomas: se desconocen la longitud de contexto efectiva y los idiomas soportados; no debe asumirse un rendimiento multilingüe.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longshort-now/z3-lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Fichero de propietario referenciado en la model card: `zils-owner.json` (dentro del repositorio del modelo)
- Bittensor (red de incentivos mencionada): https://bittensor.com
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
