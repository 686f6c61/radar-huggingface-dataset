# agentic-ptb/opus-max.hNA.sft_cont2.step_600

## Resumen

Este modelo es un checkpoint intermedio (paso 600) de un barrido de entrenamiento denominado AgentPTB, desarrollado por el usuario agentic-ptb. Se trata de un fine-tune mediante aprendizaje supervisado (SFT) del modelo base Qwen/Qwen3.5-9B-Base, con aproximadamente 9,4 mil millones de parámetros. El objetivo del barrido es estudiar el impacto de datos sintéticos generados por agentes propietarios de alto razonamiento en el comportamiento del modelo resultante.

La relevancia de este artefacto radica en su naturaleza de punto de control intermedio dentro de un pipeline de investigación. El dataset de entrenamiento fue generado por el agente Claude Code / claude-opus-5 con un nivel de esfuerzo de razonamiento máximo, lo que lo convierte en un caso de estudio interesante para analizar la evolución del entrenamiento y los sesgos inducidos por datos sintéticos de alta calidad. No es un modelo final listo para producción, sino una pieza de un experimento más amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint base Qwen/Qwen3.5-9B-Base. La arquitectura subyacente es un transformer denso, ya que no se indica que sea una arquitectura MoE (mezcla de expertos). El entrenamiento corresponde a una segunda fase de SFT (identificada como `sft_cont2`) dentro de un barrido de hiperparámetros (sweep) llamado AgentPTB. El dataset de entrenamiento fue generado por el agente Claude Code / claude-opus-5 con un nivel de razonamiento máximo (`effort max`).

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas posteriores como RLHF o DPO. El checkpoint corresponde al paso 600 de esta fase de entrenamiento continuado. Se confirma que los `eos_token_id` son correctos, lo que indica una configuración de tokenización adecuada para el modelo base.

## Capacidades

No se han publicado capacidades específicas para este checkpoint en la información proporcionada. Al estar basado en Qwen/Qwen3.5-9B-Base, se espera que herede las capacidades generales de dicho modelo base, como generación de texto, razonamiento y generación de código. Sin embargo, no hay datos verificables sobre el rendimiento real de este checkpoint en dichas tareas.

No se menciona soporte para tool calling, funciones de agente, visión, audio ni modos de razonamiento especiales (thinking mode) para este checkpoint concreto. Cualquier afirmación sobre capacidades específicas sería especulativa.

## Casos de uso

Dado su carácter de checkpoint intermedio y la ausencia de licencia, los casos de uso son principalmente de investigación y desarrollo:

- Investigación en fine-tuning: analizar la evolución de las métricas internas y la pérdida en el paso 600 frente a pasos posteriores del mismo barrido.
- Reproducción de experimentos: verificar la reproducibilidad del barrido AgentPTB y comparar resultados con otros checkpoints del mismo origen.
- Estudio de sesgos en datos sintéticos: evaluar cómo el estilo de generación de claude-opus-5 afecta al comportamiento del modelo en tareas de razonamiento.
- Depuración de pipelines de entrenamiento: usar este checkpoint como referencia para validar la correcta configuración de pipelines de SFT con modelos de la familia Qwen3.5.
- Comparación de checkpoints: comparar este paso intermedio con el checkpoint final del mismo barrido para estudiar la dinámica de convergencia.
- Análisis de robustez: probar el modelo en tareas de razonamiento complejo para identificar posibles degradaciones intermedias durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

El modelo tiene 9,4 mil millones de parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors, lo que sugiere pesos en precisión BF16 o FP16.

- VRAM estimada para inferencia: aproximadamente 19-20 GB en precisión FP16/BF16.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB) o cualquier GPU con al menos 24 GB de VRAM para inferencia en FP16.
- En GPU de consumo: cabe en una RTX 4090 (24 GB) en FP16. Para GPUs de 16 GB (como RTX 4080) sería necesaria una cuantización a 8 bits o 4 bits, aunque no se proporcionan cuantizaciones oficiales en el repositorio.
- Opciones de despliegue: vLLM, TGI o llama.cpp (si se convierte previamente a formato GGUF). No se incluyen archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa más directa es con su modelo base, Qwen/Qwen3.5-9B-Base. No se dispone de datos de rendimiento para comparar numéricamente.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agentic-ptb/opus-max.hNA.sft_cont2.step_600 | 9,4B | no disponible | no disponible | Checkpoint intermedio de SFT |
| Qwen/Qwen3.5-9B-Base | 9,4B (aprox.) | no disponible | no disponible | Modelo base original |
| Otros fine-tunes de Qwen3.5-9B | no disponible | no disponible | no disponible | No hay datos en la informacion proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio (rol: `intermediate`), no un modelo final. Su rendimiento puede ser significativamente inferior al del checkpoint final del barrido.
- La licencia no está especificada, lo que impide su uso comercial sin una aclaración legal previa por parte del autor.
- Los datos de entrenamiento fueron generados por un modelo propietario (claude-opus-5), lo que puede introducir sesgos de estilo, contenido o razonamiento específicos de dicho generador.
- No se proporcionan datos sobre sesgos conocidos, riesgos de alucinación o limitaciones de contexto o idioma.
- El repositorio fue podado de su almacenamiento original y recuperado desde un backup (`msr-spare`), lo que podría implicar inconsistencias en los archivos o metadatos.
- No se recomienda su uso en aplicaciones de producción sin una evaluación exhaustiva y una licencia clara.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agentic-ptb/opus-max.hNA.sft_cont2.step_600
- Modelo base (identificador): Qwen/Qwen3.5-9B-Base
