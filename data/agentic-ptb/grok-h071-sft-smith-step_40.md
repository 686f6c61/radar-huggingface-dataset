# agentic-ptb/grok.h071.sft-smith.step_40

## Resumen

Este repositorio contiene un checkpoint intermedio del barrido de entrenamiento (sweep) AgentPTB, identificado como `grok.h071.sft-smith.step_40`. Se trata de un fine-tuning de tipo SFT (supervised fine-tuning) sobre el modelo base Qwen/Qwen3.5-9B-Base, con un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El modelo está empaquetado en formato safetensors y ocupa 18,8 GB en el repositorio.

La relevancia de este artefacto es principalmente metodológica: forma parte de un run de 100 horas supervisado por un driver denominado "pi / grok-4.6" con un nivel de razonamiento `xhigh`. El checkpoint fue escrito a la hora 71 del run (según el identificador del repositorio), aunque la model card interna hace referencia a un checkpoint distinto (h067, step_80), lo que sugiere una posible inconsistencia en el empaquetado. No es un modelo final listo para producción, sino una instantánea intermedia para análisis de dinámicas de entrenamiento.

Además, presenta un defecto crítico de empaquetado: el token EOS `248046` (`<|im_end|>`) no está incluido en la configuración, lo que impide que el modelo detenga la generación al final de un turno y provoca que se sobrepase la ventana de contexto. Cualquier evaluación directa de este checkpoint debe considerarse como un límite inferior (floor) y no como una medición real de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en BF16/FP32) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.5-9B-Base, un transformer denso de aproximadamente 9,4 mil millones de parámetros. El entrenamiento se realizó mediante fine-tuning supervisado (SFT) dentro del marco del barrido AgentPTB. El driver del run es "pi / grok-4.6" con un esfuerzo de razonamiento `xhigh`, lo que indica que el proceso de generación de datos o de entrenamiento emplea una configuración de razonamiento extendido.

El checkpoint se generó a las 71,26 horas de un run planificado de 100 horas (según el campo `hours into run` de la model card, aunque el ID del repo indica h071). El repositorio contiene 4 shards de pesos. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La única innovación técnica destacable es la propia metodología del sweep, que mapea los checkpoints a una curva de rendimiento temporal (`t_h`), pero no se documentan innovaciones arquitectónicas.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3.5-9B-Base, pero la generación no se detiene correctamente al final de un turno debido al defecto de EOS.
- Razonamiento: el driver emplea un esfuerzo de razonamiento `xhigh`, lo que sugiere que el fine-tuning busca potenciar cadenas de razonamiento largas, aunque no hay métricas que lo confirmen.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte para agentes y razonamiento multi-paso: no disponible, y el defecto de EOS impide un uso fiable en flujos multi-turno.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles. El modelo es exclusivamente de texto.

## Casos de uso

- Investigación de dinámicas de entrenamiento: permite analizar la evolución de los pesos y la pérdida en un punto concreto (hora 71) de un run de 100 horas, útil para estudiar la convergencia del barrido AgentPTB.
- Análisis de la influencia del driver de razonamiento: al ser un checkpoint intermedio, se puede comparar con otros puntos del mismo sweep para evaluar cómo el esfuerzo `xhigh` afecta a la calidad del fine-tuning a lo largo del tiempo.
- Re-empaquetado y evaluación corregida: un investigador puede descargar los pesos, añadir manualmente el token EOS `248046` a la configuración y re-evaluar el modelo para obtener métricas válidas.
- Comparación de checkpoints dentro del sweep: el identificador `h071` permite situar este modelo en la curva de rendimiento temporal y compararlo con checkpoints anteriores o posteriores (por ejemplo, h067 o h080).
- Estudio de defectos de empaquetado: sirve como caso práctico para documentar cómo la ausencia de un token EOS afecta a la generación y a la validez de los benchmarks, un problema común en artefactos intermedios.
- Pruebas de compatibilidad con el template de chat de Qwen3.5: se puede utilizar para verificar el comportamiento del modelo con el template `chatml` y confirmar el fallo de terminación, lo que ayuda a depurar pipelines de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Además, la model card advierte explícitamente de que, al faltar el token EOS `248046`, cualquier evaluación numérica obtenida directamente de este checkpoint es un límite inferior (floor) y no una medición fiable. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 18,8 GB en safetensors. En precisión BF16/FP16, la inferencia requiere aproximadamente 19-20 GB de VRAM.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) puede cargar el modelo en BF16 sin cuantización. También es viable en A100 40 GB o H100 80 GB para mayor margen y velocidad.
- Compatibilidad con GPU de consumo: sí, cabe en una RTX 4090, pero no en GPUs de 16 GB o menos sin cuantizar.
- Opciones de despliegue: no se proporcionan archivos GGUF ni AWQ. Para usar con llama.cpp, Ollama o vLLM, sería necesario convertir los pesos manualmente. vLLM y TGI son compatibles con safetensors estándar, pero el defecto de EOS debe corregirse antes de servir el modelo.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la corrección del token EOS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `agentic-ptb/grok.h071.sft-smith.step_40` | 9,4 B | no disponible | no disponible | safetensors | Checkpoint intermedio con defecto de EOS |
| Qwen/Qwen3.5-9B-Base | 9,4 B | no disponible | no disponible | safetensors | Modelo base sin fine-tuning, sin defecto de EOS |
| Otros checkpoints del sweep AgentPTB (ej. h067) | 9,4 B | no disponible | no disponible | safetensors | Misma familia, pero sin datos públicos de rendimiento |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa. La única comparación fiable es contra el modelo base, del que se diferencia únicamente por el fine-tuning SFT y por el defecto de empaquetado.

## Limitaciones y advertencias

- Defecto crítico de EOS: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de un turno y sobrepase la ventana de contexto. Esto invalida cualquier uso en producción o evaluación directa.
- Checkpoint intermedio: no es un modelo final. Fue escrito a la hora 71 de un run de 100 horas y su rol se define como "intermediate".
- Inconsistencia en la documentación: la model card interna hace referencia a `grok.h067.sft-solved2.step_80`, mientras que el repositorio es `grok.h071.sft-smith.step_40`. Esto sugiere un posible error de empaquetado o de metadatos.
- Licencia no disponible: no se especifica la licencia, por lo que no se puede garantizar el uso comercial o la redistribución.
- Idiomas no declarados: no se indica qué idiomas soporta, aunque al derivar de Qwen3.5-9B-Base es probable que herede el multilingüismo del base, pero no es verificable.
- Riesgo de alucinación y sesgos: no hay datos específicos, pero al ser un fine-tuning de un modelo base sin alineación adicional documentada, los riesgos son los mismos que los del modelo base, agravados por el fallo de terminación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/grok.h071.sft-smith.step_40
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del barrido AgentPTB (referenciado en la model card, no verificado): `agentic-ptb/INDEX` (no se ha encontrado una URL directa en la información proporcionada).
