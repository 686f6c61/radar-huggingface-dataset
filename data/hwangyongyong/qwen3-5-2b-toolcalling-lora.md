# hwangyongyong/Qwen3.5-2B-ToolCalling-LoRA

## Resumen

El repositorio `hwangyongyong/Qwen3.5-2B-ToolCalling-LoRA` aloja un adaptador LoRA (Low-Rank Adaptation) entrenado con la librería Unsloth sobre un modelo base de la familia Qwen3.5 con aproximadamente 2.000 millones de parámetros, según se deduce del identificador del repositorio. El autor del artefacto es el usuario de Hugging Face `hwangyongyong` y el propósito declarado en el nombre es el ajuste fino para *tool calling* o *function calling*, es decir, la capacidad del modelo de emitir llamadas estructuradas a herramientas externas en formato JSON o similar.

El repositorio tiene un tamaño de 0,3 GB, lo que es coherente con un adaptador LoRA de bajo rango y no con un modelo completo de 2B parámetros (que en bf16 ocuparía del orden de 4 GB). Los pesos se distribuyen en formato `safetensors` y la librería declarada es `transformers`, con la etiqueta `unsloth` que indica el marco de entrenamiento utilizado. El pipeline no está declarado y no se especifica licencia ni idiomas soportados.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación o experimentación personal, publicado sin model card sustantiva (la existente es la plantilla autogenerada por Hugging Face con todos los campos marcados como "[More Information Needed]"), sin descargas ni *likes* en el momento de la consulta y sin resultados de evaluación publicados. Debe evaluarse, por tanto, como un punto de partida reproducible para experimentar con adaptadores de tool calling sobre modelos pequeños, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5, familia Qwen); el artefacto es un adaptador LoRA de bajo rango |
| Parametros totales | No disponible con precisión; el identificador sugiere ~2.000 millones en el modelo base. El adaptador LoRA en sí ocupa 0,3 GB en disco |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-2B, valor no confirmado en la información proporcionada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; las cuantizaciones dependerían del modelo base y del proceso de fusión) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA); requiere fusión o carga junto al modelo base |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente corresponde al modelo base Qwen3.5 de ~2B parámetros, un transformer decoder-only de la familia Qwen, pero la información proporcionada no detalla la configuración interna (número de capas, dimensiones ocultas, cabezas de atención, uso de atención lineal o híbrida, etc.). El adaptador introduce matrices de bajo rango en determinadas capas del modelo base, lo que reduce drásticamente el número de parámetros entrenables y el coste de ajuste.

El entrenamiento se realizó con Unsloth, un framework optimizado para fine-tuning eficiente en memoria que implementa kernels personalizados y técnicas de ahorro de VRAM. La model card no aporta ningún detalle sobre el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, la presencia de RLHF/DPO ni los hiperparámetros (rango del LoRA, alpha, dropout, tasa de aprendizaje, precisión mixta). Tampoco se documenta si el ajuste se realizó sobre datos sintéticos de tool calling, sobre un corpus público de funciones o sobre un conjunto propio. Esta ausencia de información impide reproducir el entrenamiento o auditar la calidad de los datos.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3.5-2B, aunque no verificados en este adaptador.
- Tool calling / function calling: es el objetivo declarado del ajuste fino, según el nombre del repositorio. Se espera que el modelo emita llamadas estructuradas a funciones, pero no hay ejemplos, plantillas ni evaluaciones que lo confirmen.
- Soporte de agentes y razonamiento multi-paso: potencialmente, si el adaptador generaliza a cadenas de llamadas, aunque no está documentado.
- Capacidades multilingües: no disponibles; dependen del modelo base y no se especifican.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación con tool calling en modelos pequeños: cargar el adaptador sobre Qwen3.5-2B y evaluar la tasa de acierto en la emisión de JSON válido para funciones sencillas (clima, calculadora, consultas a API), como paso previo a integrar un modelo mayor.
- Prototipado de agentes locales: desplegar el modelo fusionado en una GPU de consumo para construir un agente que resuelva tareas de recuperación de información mediante llamadas a herramientas, con la ventaja de que 2B parámetros caben en VRAM modesta.
- Investigación sobre fine-tuning eficiente: usar el repositorio como ejemplo reproducible de un pipeline Unsloth + LoRA para tool calling, comparando el adaptador con el modelo base sin ajustar.
- Generación de datos sintéticos de entrenamiento: emplear el modelo ajustado para producir ejemplos de llamadas a funciones que luego se filtren y se usen en el entrenamiento de modelos mayores.
- Evaluación de robustez de formatos: probar cómo se comporta el adaptador ante esquemas de funciones complejos (parámetros anidados, tipos opcionales) y documentar los fallos para guiar futuros ajustes.
- Integración en asistentes de línea de comandos: un modelo de 2B con tool calling puede ejecutar comandos locales o consultar APIs en un CLI, siempre que se valide la salida antes de ejecutarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador solo ocupa 0,3 GB, pero requiere cargar el modelo base Qwen3.5-2B. En bf16, el modelo base ocupa aproximadamente 4 GB; en cuantización de 4 bits (por ejemplo, GGUF Q4_K_M), alrededor de 1,5-2 GB. La VRAM total necesaria para inferencia con contexto moderado se sitúa en el rango de 4-6 GB en bf16 y 2-3 GB en 4 bits, estimaciones basadas en el tamaño del modelo y no en mediciones del autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 3070); para cuantización de 4 bits bastan GPUs de 4-6 GB (GTX 1650 Super, RTX 3050). Para entrenamiento o fusión del adaptador se recomienda al menos 12-16 GB (RTX 4070 Ti, RTX 4080, A10).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas de gama media, especialmente con cuantización.
- Opciones de despliegue: `transformers` con PEFT para cargar el adaptador; fusión del adaptador y exportación a GGUF para llama.cpp u Ollama; vLLM si se fusiona y se sirve el modelo completo; TGI igualmente tras la fusión.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-ToolCalling-LoRA (este) | ~2B (base) + LoRA | No disponible | Objetivo declarado, sin evaluar | No disponible | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (según documentación pública de Qwen) | Soporte nativo de function calling en la familia Qwen2.5 | Apache 2.0 (familia Qwen2.5) | Hugging Face, ampliamente usado |
| Qwen2.5-3B-Instruct | 3B | 32.768 tokens | Soporte nativo de function calling | Apache 2.0 (familia Qwen2.5) | Hugging Face, ampliamente usado |
| Llama-3.2-1B-Instruct | 1B | 128.000 tokens | Soporte de tool calling en el formato de Llama 3 | Llama 3.2 Community License | Hugging Face, muy usado |

La comparación con Qwen2.5 se basa en la documentación pública de esa familia; los datos de este adaptador no están verificados y la licencia del modelo base Qwen3.5 no se especifica en la información proporcionada.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada de Hugging Face; no contiene información sobre datos, entrenamiento, evaluación ni uso previsto.
- No se especifica la licencia, ni del adaptador ni del modelo base; no se puede asumir uso comercial sin verificar la licencia de Qwen3.5.
- No hay resultados de benchmarks ni ejemplos de uso; el rendimiento en tool calling es desconocido.
- Riesgo de alucinación y de emitir JSON malformado o llamadas a funciones inexistentes, especialmente en un modelo de 2B sin evaluación publicada.
- El adaptador no es un modelo autónomo: requiere el modelo base exacto con el que fue entrenado; una discrepancia en la versión o configuración puede degradar o romper el comportamiento.
- Sesgos conocidos: no documentados; heredados del modelo base y del dataset de ajuste, ambos desconocidos.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base.
- Cero descargas y cero *likes* en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Para producción, se recomienda tratar este artefacto como experimental y validar exhaustivamente las salidas antes de cualquier integración.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hwangyongyong/Qwen3.5-2B-ToolCalling-LoRA
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Referencia citada en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Documentación de PEFT (carga de adaptadores LoRA): https://huggingface.co/docs/peft
