# agentic-ptb/sol-max-v2.h036.pi-agent-sft-v15-hero.step_250

## Resumen

El modelo `agentic-ptb/sol-max-v2.h036.pi-agent-sft-v15-hero.step_250` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning de tipo SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El identificador del repositorio indica que fue guardado a la hora 36,58 de una ejecución de 100 horas, en el paso 250, dentro de la celda `sol-max-v2` que utiliza un driver de razonamiento con esfuerzo máximo.

Este checkpoint no es un modelo final, sino una instantánea de un experimento de entrenamiento orientado a agentes (el nombre `pi-agent-sft-v15-hero` sugiere fine-tuning para tareas de agente). Su relevancia radica en que permite estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento, ya que el repositorio se mapea directamente sobre la curva de evaluación del sweep. Al estar basado en Qwen3.5-9B, hereda la arquitectura de visión-lenguaje de Qwen, aunque el checkpoint se sirve como modelo de solo texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision-lenguaje, pero el checkpoint se usa como texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-9B-Base`, que emplea la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer multimodal con torre de visión. Sin embargo, el checkpoint no incluye `preprocessor_config.json`, por lo que para servirlo con vLLM es necesario indicar explícitamente que se trata de un modelo de solo texto mediante `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.

El entrenamiento corresponde a un fine-tuning supervisado (SFT) dentro de un barrido de agentes denominado `pi-agent-sft-v15-hero`. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint fue generado a la hora 36,58 de una ejecución de 100 horas, con el token de fin de secuencia (`eos_token_id`) correctamente configurado como `248046` (`<|im_end|>`), lo que garantiza que el modelo detiene la generación al final de cada turno.

## Capacidades

- No se han publicado capacidades específicas para este checkpoint en la información disponible.
- Al ser un fine-tuning de Qwen3.5-9B-Base, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas), pero no hay confirmación oficial.
- El nombre del checkpoint (`pi-agent-sft-v15-hero`) sugiere un entrenamiento orientado a tareas de agente, aunque no se documentan detalles sobre tool calling, multi-step reasoning o funciones de agente.
- No se indica soporte para visión en este checkpoint, a pesar de que la arquitectura base lo permite.

## Casos de uso

No se dispone de casos de uso documentados para este checkpoint específico. Dado que es un artefacto intermedio de un experimento de investigación, su uso principal es el análisis del progreso del entrenamiento y la comparación con otros checkpoints del mismo sweep. Para aplicaciones prácticas, se recomienda utilizar el modelo final del barrido o el modelo base Qwen3.5-9B, que cuenta con documentación completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 18,8 GB, lo que sugiere pesos en precisión fp16 o bf16 (aproximadamente 2 bytes por parámetro).
- VRAM estimada para inferencia en fp16: alrededor de 19-20 GB solo para los pesos, más overhead de activaciones y contexto. Se recomienda una GPU con al menos 24 GB (por ejemplo, RTX 4090, A5000) o 40 GB (A100).
- Con cuantización de 4 bits, la VRAM necesaria se reduce a aproximadamente 5-6 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3060 o RTX 4060.
- Opciones de despliegue: vLLM (con la bandera `--limit-mm-per-prompt` para desactivar visión), llama.cpp, Ollama o TGI, siempre que se conviertan los pesos al formato adecuado.
- No se dispone de datos de latencia o throughput para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Como referencia estructural, se puede comparar con el modelo base `Qwen/Qwen3.5-9B-Base` y con otros modelos de la familia Qwen3.5 de tamaño similar, pero no hay métricas disponibles para este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max-v2.h036... | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Es un checkpoint intermedio de un experimento, no un modelo final. Su rendimiento puede ser inferior al de un modelo entrenado durante más horas.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o de redistribución.
- El modelo no incluye configuración de preprocesador para visión; si se intenta cargar con vLLM sin la bandera adecuada, fallará.
- No hay documentación sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos o riesgos de seguridad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h036.pi-agent-sft-v15-hero.step_250
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
