# agentic-ptb/dpsk-v4-flash.h085.sft5.step_1200

## Resumen

El modelo `agentic-ptb/dpsk-v4-flash.h085.sft5.step_1200` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). La model card lo identifica como parte de la celda de experimento `dpsk-v4-flash`, con un "driver" denominado `pi / DeepSeek v4-flash` y un nivel de esfuerzo de razonamiento configurado como `thinking`.

Este checkpoint corresponde al paso 1200 de un proceso de entrenamiento de cinco etapas SFT (sft5) y está marcado como de rol "intermediate" (intermedio). Fue recuperado de una copia de seguridad externa (`msr-spare`) tras ser podado del almacenamiento principal. Su relevancia es principalmente investigadora: sirve como artefacto para analizar la evolución del entrenamiento, no como un modelo final listo para producción. La información pública es muy limitada: no se especifican licencia, idiomas, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer estándar de la familia Qwen3.5. No se dispone de detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni la metodología exacta de SFT. La model card indica que el entrenamiento se realizó en cinco etapas (sft5) y que este checkpoint corresponde al paso 1200. El "driver" del experimento se describe como `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento fijado en `thinking`, lo que sugiere que el fine-tuning está orientado a potenciar capacidades de razonamiento explícito, aunque no se aportan más detalles técnicos.

Se advierte además que el token de fin de secuencia configurado (`eos_token_id`) es `[248044]` y que falta el token `248046`, lo que podría afectar a la generación si se utiliza el checkpoint de forma aislada.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- Al ser un fine-tuning de `Qwen/Qwen3.5-9B-Base`, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, multilingüismo), pero no hay confirmación oficial.
- El ajuste con esfuerzo de razonamiento `thinking` sugiere un enfoque en tareas de razonamiento multi-paso, aunque no se aportan evidencias.
- No se menciona soporte para tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en dinámicas de entrenamiento: este checkpoint permite estudiar la evolución de las métricas de pérdida y comportamiento del modelo a lo largo de las etapas SFT, comparándolo con checkpoints anteriores y posteriores.
- Análisis de alineación y razonamiento: al estar configurado con esfuerzo de razonamiento `thinking`, puede usarse para evaluar cómo el fine-tuning afecta a la calidad del razonamiento explícito en tareas de lógica y matemáticas.
- Continuación del entrenamiento: como checkpoint intermedio, puede servir como punto de partida para experimentos de fine-tuning adicionales o para técnicas como el *resume training*.
- Reproducibilidad de experimentos: útil para investigadores que quieran replicar el pipeline de AgentPTB y verificar los resultados del barrido.
- Evaluación de robustez: permite probar la estabilidad del modelo en pasos intermedios, identificando posibles degradaciones o mejoras tempranas.
- No se recomienda su uso en producción debido a su naturaleza intermedia y a la falta de documentación sobre licencia y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros, en precisión FP16 se requieren aproximadamente 18,8 GB de VRAM (coincide con el tamaño del repositorio). En cuantización de 8 bits se reduciría a unos 9,4 GB, y en 4 bits a unos 4,7 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 4090, A10G) podría ejecutar el modelo en FP16 o con cuantización ligera. Para cuantización de 4 bits bastaría con 8 GB (p. ej., RTX 3060, RTX 4060).
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con bibliotecas como Transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión). No hay configuraciones oficiales publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El único punto de referencia conocido es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual este checkpoint es un fine-tuning. No se han publicado métricas de rendimiento ni comparaciones con otras alternativas de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| agentic-ptb/dpsk-v4-flash.h085.sft5.step_1200 | 9,4B | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de un modelo completamente entrenado y no está pensado para uso en producción.
- Falta de documentación: no se especifican licencia, idiomas, contexto ni detalles de entrenamiento, lo que impide evaluar su idoneidad legal y técnica.
- Token EOS incompleto: la model card advierte que falta el token `248046` en la configuración de `eos_token_id`, lo que puede provocar generaciones sin fin o comportamientos inesperados.
- Sesgos y alucinaciones: al derivar de Qwen3.5-9B-Base, puede heredar sesgos del modelo base y presentar riesgo de alucinación, aunque no hay estudios específicos.
- Sin garantías de calidad: al no haber benchmarks ni evaluaciones publicadas, no se puede afirmar su capacidad real en tareas concretas.
- Restricciones de uso comercial: desconocidas debido a la ausencia de licencia declarada.

## Enlaces

- [HuggingFace - agentic-ptb/dpsk-v4-flash.h085.sft5.step_1200](https://huggingface.co/agentic-ptb/dpsk-v4-flash.h085.sft5.step_1200)
- [Modelo base - Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
