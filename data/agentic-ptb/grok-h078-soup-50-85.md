# agentic-ptb/grok.h078.soup-50-85

## Resumen

El modelo `agentic-ptb/grok.h078.soup-50-85` es un checkpoint intermedio generado durante un barrido de entrenamiento (sweep) del proyecto AgentPTB. Se basa en el modelo `Qwen/Qwen3.5-9B-Base` y cuenta con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), con un tamaño de repositorio de 18,8 GB en formato safetensors. El identificador del repositorio indica que corresponde a la hora 78 de un run de 100 horas, dentro de la celda `grok` con driver `pi / grok-4.6` y un nivel de razonamiento `xhigh`.

Este checkpoint no es un modelo final listo para producción, sino un artefacto intermedio de un experimento de entrenamiento. Presenta un defecto conocido de empaquetado: le falta el token de fin de secuencia `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de cada turno y sobrepase la ventana de contexto. Por tanto, sus métricas de evaluación deben interpretarse como un límite inferior y no como una medida real de rendimiento. Su relevancia radica en su utilidad para estudiar la dinámica de entrenamiento a lo largo del tiempo, no como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de Qwen3.5-9B-Base, probablemente transformer) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el defecto de eos provoca sobrepaso de la ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la informacion disponible. Dado que el modelo base es `Qwen/Qwen3.5-9B-Base`, se presume que hereda su arquitectura transformer, pero no hay confirmacion explicita. El checkpoint se genera dentro de un barrido de entrenamiento de 100 horas, en la celda `grok`, con un driver denominado `pi / grok-4.6` y un nivel de razonamiento `xhigh`. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. El unico dato tecnico destacable es el defecto de empaquetado del token eos, que afecta a todos los checkpoints de este sweep.

## Capacidades

No se han documentado capacidades especificas para este checkpoint. Al ser un fine-tune de Qwen3.5-9B-Base, podria heredar capacidades generales de generacion de texto, razonamiento, codigo y comprension multilingue, pero no hay verificacion experimental en la informacion disponible. El unico indicio es el parametro `reasoning effort xhigh`, que sugiere un modo de razonamiento intensivo, aunque no se detalla su funcionamiento.

## Casos de uso

No existen casos de uso documentados para este checkpoint. Dado su caracter intermedio y el defecto de eos, no se recomienda su uso en aplicaciones reales. En un contexto de investigacion, podria emplearse para:

- Analisis de la evolucion del rendimiento durante el entrenamiento, comparando checkpoints de distintas horas del sweep.
- Estudio de los efectos del defecto de empaquetado de eos en la generacion de texto.
- Exploracion de tecnicas de re-empaquetado o correccion del token eos para evaluar el modelo de forma adecuada.
- Investigacion sobre la transferencia de capacidades desde el modelo base Qwen3.5-9B-Base.

En cualquier caso, estos usos son hipoteticos y requieren una validacion previa del comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente que las metricas de evaluacion de este checkpoint son un "floor" (limite inferior) debido al defecto de eos, por lo que no son comparables con otros modelos.

## Requisitos de hardware

Dado el tamaño de 9,4 mil millones de parametros y 18,8 GB en safetensors (presumiblemente en FP16), se estiman los siguientes requisitos para inferencia:

- VRAM estimada: ~18,8 GB en FP16, ~9,4 GB en cuantizacion de 8 bits, ~4,7 GB en cuantizacion de 4 bits.
- GPU recomendadas: una RTX 4090 (24 GB) podria ejecutar el modelo en FP16; una A100 (40 GB) o H100 (80 GB) ofrecerian margen adicional. Para cuantizaciones de 4 bits, una RTX 3090 o RTX 4080 (16 GB) serian suficientes.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se corrija el defecto de eos antes de su uso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa fiable. Como referencia estructural, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/grok.h078.soup-50-85 | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |

No se conocen otros modelos de la misma categoria con los que comparar de forma significativa.

## Limitaciones y advertencias

- Defecto critico de empaquetado: falta el token eos `248046`, lo que impide la detencion correcta de la generacion y provoca sobrepaso de la ventana de contexto. No es utilizable en produccion sin una correccion previa.
- Es un checkpoint intermedio, no un modelo final: su rendimiento no refleja el estado optimo del entrenamiento.
- No hay documentacion sobre sesgos, alucinaciones o limitaciones idiomaticas.
- La licencia no esta especificada, por lo que se desconoce si permite uso comercial.
- No se recomienda su despliegue en entornos reales sin una evaluacion exhaustiva y una correccion del token eos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h078.soup-50-85
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (enlace inferido, no verificado en la busqueda)
