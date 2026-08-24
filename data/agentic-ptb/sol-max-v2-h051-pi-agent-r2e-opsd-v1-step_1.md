# agentic-ptb/sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_1

## Resumen

Este repositorio contiene un checkpoint intermedio del barrido de entrenamiento AgentPTB, identificado como `sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_1`. Se trata de un peso guardado a las 51,84 horas de una ejecución de 100 horas, dentro de la celda experimental `sol-max-v2` dirigida por el agente Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo. El modelo base es `Qwen/Qwen3.5-9B-Base`, una arquitectura de 9.409.813.744 parámetros que incluye torre de visión, aunque el checkpoint se sirve como modelo de texto únicamente.

El propósito de este artefacto no es ser un modelo final listo para producción, sino un punto de control intermedio para evaluar la evolución del entrenamiento a lo largo del tiempo. La nomenclatura del repositorio codifica la hora de la ejecución (`h051`), lo que permite situarlo directamente en las curvas de rendimiento del barrido. No se dispone de licencia, idiomas soportados ni pipeline de inferencia declarados, y el número de descargas y likes es cero, lo que indica que es un recurso de investigación reciente y de acceso restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con torre de visión) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer densa de 9.4B parámetros con torre de visión integrada. Según la model card, los pesos incluyen dicha torre, pero el proceso de exportación de prime-rl no genera `preprocessor_config.json`, por lo que para servir el modelo con vLLM es necesario indicar explícitamente que se trata de un modelo solo de texto mediante `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.

El entrenamiento corresponde a un barrido de optimización de agentes (AgentPTB) donde el checkpoint se genera en la hora 51,84 de una ejecución de 100 horas. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El `eos_token_id` es `248046` (`<|im_end|>`), correcto para la plantilla de chat de Qwen3.5, lo que garantiza que el modelo detiene la generación al final de cada turno. La model card advierte que checkpoints sin este token sobrepasan la ventana de contexto y sus métricas deben considerarse un límite inferior, no una medición real.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al estar basado en Qwen3.5-9B-Base, podría heredar las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, visión), pero no hay evidencia de que este checkpoint haya sido evaluado para dichas tareas. La model card solo menciona su papel como punto de control intermedio en un proceso de entrenamiento de agentes.

- Generación de texto: no verificado en este checkpoint.
- Razonamiento y matemáticas: no verificado.
- Generación de código: no verificado.
- Visión: la torre de visión está presente en los pesos, pero no se exporta configuración de preprocesado, por lo que su uso no está soportado directamente.
- Tool calling / function calling: no disponible.
- Soporte de agentes: el checkpoint proviene de un pipeline de entrenamiento de agentes, pero no se documentan capacidades específicas de agente.

## Casos de uso

Dado que se trata de un checkpoint intermedio de investigación, los casos de uso son limitados y orientados al análisis del proceso de entrenamiento:

- Investigación en dinámica de entrenamiento: permite estudiar cómo evoluciona el rendimiento del modelo a lo largo de las horas de ejecución, comparando checkpoints de diferentes horas dentro de la misma celda.
- Reproducción de experimentos: los investigadores pueden descargar este checkpoint para reproducir las curvas de evaluación del barrido AgentPTB y verificar resultados.
- Análisis de estabilidad del entrenamiento: al ser un punto intermedio, sirve para diagnosticar problemas como divergencia, sobreajuste o saturación de métricas.
- Desarrollo de técnicas de evaluación de checkpoints: útil para probar metodologías de evaluación temprana en modelos parcialmente entrenados.
- Benchmarking de infraestructura: permite medir el rendimiento de servidores de inferencia (vLLM, TGI) con pesos de 9.4B en formato safetensors.
- Estudio de la influencia del token EOS: la model card documenta explícitamente el efecto del `eos_token_id` en la evaluación, lo que lo convierte en un caso de estudio para validar pipelines de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Se desconoce el rendimiento de este checkpoint en tareas estándar.

## Requisitos de hardware

No se proporcionan requisitos específicos para este checkpoint. A partir del tamaño de parámetros (9.4B) y el peso del repositorio (18.8 GB en safetensors), se pueden estimar necesidades de hardware para inferencia:

- VRAM estimada para inferencia: con cuantización FP16, se necesitan aproximadamente 19-20 GB de VRAM para cargar los pesos. Con cuantización INT8, alrededor de 10 GB; con INT4, unos 5-6 GB. Sin embargo, no se han publicado archivos cuantizados, por lo que estas cifras son orientativas.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) es suficiente. Para cuantización ligera, una RTX 3090 (24 GB) o RTX 4080 (16 GB) podría bastar.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con al menos 16 GB de VRAM si se aplica cuantización, aunque no se proporcionan archivos GGUF ni AWQ.
- Opciones de despliegue: vLLM (con la advertencia de `--limit-mm-per-prompt`), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), TGI. No se han publicado configuraciones de despliegue oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este checkpoint con otros modelos. Como referencia arquitectónica, se puede comparar con su modelo base y con otros modelos de 9B:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9.4B | no disponible | no disponible | HuggingFace |
| agentic-ptb/sol-max-v2.h051 (este checkpoint) | 9.4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | HuggingFace |
| Mistral 7B | 7B | 32K | Apache 2.0 | HuggingFace |

No se puede establecer una comparativa de rendimiento porque no hay benchmarks publicados para este checkpoint.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de un modelo entrenado completamente y no debe usarse en producción.
- Sin licencia declarada: no se especifica la licencia de uso, lo que impide determinar si es apto para uso comercial o académico. Se debe contactar al autor antes de cualquier uso.
- Sin idiomas declarados: se desconoce qué idiomas soporta, aunque al derivar de Qwen3.5-9B-Base probablemente herede el multilingüismo del base, pero no está confirmado.
- Riesgo de alucinación: al ser un modelo parcialmente entrenado, puede presentar alucinaciones y errores de razonamiento más frecuentes que un modelo convergido.
- Limitaciones de visión: aunque la arquitectura incluye torre de visión, no se exporta `preprocessor_config.json`, por lo que no se puede usar para tareas multimodales sin reempaquetar.
- Sesgos desconocidos: no se han documentado sesgos específicos, pero al ser un modelo base de Qwen, puede heredar sesgos del preentrenamiento original.
- Advertencia de evaluación: la model card indica que checkpoints sin el `eos_token_id` correcto sobrepasan la ventana de contexto; este checkpoint sí lo tiene, pero cualquier evaluación debe verificar este campo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Búsqueda de modelos AgentPTB en HuggingFace: https://huggingface.co/models?other=agentic-ptb
