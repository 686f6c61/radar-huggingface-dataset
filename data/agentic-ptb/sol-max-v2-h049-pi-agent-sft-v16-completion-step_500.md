# agentic-ptb/sol-max-v2.h049.pi-agent-sft-v16-completion.step_500

## Resumen

El modelo `agentic-ptb/sol-max-v2.h049.pi-agent-sft-v16-completion.step_500` es un checkpoint intermedio de un barrido (sweep) de entrenamiento de agentes denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El checkpoint corresponde a la hora 49,65 de una ejecución de 100 horas, en el paso 500, y forma parte de la celda experimental `sol-max-v2`, dirigida por el modelo `Codex / gpt-5.6-sol` con esfuerzo de razonamiento máximo.

Este modelo no es un producto final, sino un artefacto de investigación para estudiar la evolución del rendimiento durante el entrenamiento. Su relevancia radica en que permite mapear el progreso del ajuste fino a lo largo del tiempo, tal y como se documenta en la model card. Al estar basado en Qwen3.5-9B-Base, hereda la arquitectura de visión de dicho modelo, aunque el checkpoint se sirve únicamente como modelo de texto. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (basada en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura de tipo transformer con torre de visión (Qwen3_5ForConditionalGeneration). El checkpoint se generó durante un barrido de entrenamiento de agentes (AgentPTB) de 100 horas, en el que se utilizó como driver el modelo `Codex / gpt-5.6-sol` con esfuerzo de razonamiento máximo. El entrenamiento se realizó con una variante de SFT denominada `pi-agent-sft-v16-completion`, y el checkpoint corresponde al paso 500 de la hora 49,65.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas más allá de la correcta configuración del token de fin de secuencia (`eos_token_id` = 248046, correspondiente a `<|im_end|>`), que garantiza que el modelo detenga correctamente cada turno de asistente. La model card advierte que el checkpoint no exporta `preprocessor_config.json`, por lo que al servirlo con vLLM es necesario indicar explícitamente que se trata de un modelo solo de texto.

## Capacidades

No se han documentado capacidades específicas en la información disponible. Al estar basado en `Qwen/Qwen3.5-9B-Base`, el modelo podría heredar capacidades de generación de texto, razonamiento y posiblemente visión, pero no hay confirmación de que estas capacidades se mantengan tras el ajuste fino. La model card indica que la torre de visión está presente en los pesos, pero el checkpoint se sirve como modelo de texto. No se menciona soporte para tool calling, agentes, ni capacidades multilingües.

## Casos de uso

Dado que se trata de un checkpoint intermedio de un experimento de investigación, los casos de uso son limitados y orientados a la evaluación:

- Evaluación de progreso de entrenamiento: permite comparar el rendimiento del modelo en diferentes horas de la ejecución, ya que el identificador del repositorio incluye la hora exacta (`h049`).
- Análisis de la curva de aprendizaje: los investigadores pueden trazar métricas de rendimiento frente al tiempo de entrenamiento usando estos checkpoints.
- Reproducción de experimentos: sirve como referencia para reproducir los resultados del barrido AgentPTB en la celda `sol-max-v2`.
- Validación de la configuración de token de fin de secuencia: permite verificar que el `eos_token_id` es correcto y que el modelo detiene las respuestas adecuadamente.
- Estudio de la influencia del driver de razonamiento: al ser un checkpoint generado con `gpt-5.6-sol` a esfuerzo máximo, puede usarse para analizar cómo afecta este driver al ajuste fino.
- Comparación de checkpoints: se puede comparar con otros checkpoints de la misma celda (por ejemplo, el h7 mencionado en la model card) para estudiar la evolución del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 18,8 GB en formato safetensors, lo que implica aproximadamente 18,8 GB de VRAM para inferencia en precisión FP16 (sin cuantización).
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB) para cargar el modelo completo en FP16. Con cuantización a 8 bits o 4 bits, podría caber en GPUs de 12-16 GB, pero no se dispone de archivos cuantizados en el repositorio.
- Opciones de despliegue: vLLM es la opción documentada, pero requiere el argumento `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para forzar el modo texto, ya que el modelo no exporta `preprocessor_config.json`. También podría convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan dichos formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. El modelo base `Qwen/Qwen3.5-9B-Base` podría considerarse una referencia, pero no se han publicado métricas de rendimiento de este checkpoint que permitan una comparación objetiva. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un experimento de investigación, no un modelo final listo para producción.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere consultar al autor.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El modelo base tiene arquitectura de visión, pero el checkpoint no incluye `preprocessor_config.json`; al servirlo con vLLM hay que forzar el modo texto o fallará la carga.
- El `eos_token_id` es correcto (248046), pero se recomienda verificar el comportamiento de fin de secuencia antes de usarlo en aplicaciones.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real es desconocido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agentic-ptb/sol-max-v2.h049.pi-agent-sft-v16-completion.step_500
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice de checkpoints AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
