# agentic-ptb/opus-high-v3.h045.lrA.step_48

## Resumen

`agentic-ptb/opus-high-v3.h045.lrA.step_48` es un checkpoint intermedio generado durante la ejecución `opus-high-v3` del proyecto AgentPTB, un benchmark de entrenamiento de agentes basado en Claude Code. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros. El checkpoint corresponde al paso 48 de una ejecución de 45 horas (etiqueta `h045`) y fue publicado por el autor con fines de reproducibilidad y estudio cualitativo.

La advertencia principal del autor es explícita: la ejecución no encontró ninguna mejora en los pesos entrenados, por lo que este checkpoint no debe interpretarse como un modelo con rendimiento mejorado respecto a su base. De hecho, el autor lo clasifica como un resultado negativo (`negative-results`). Su relevancia radica en el análisis de dinámicas de entrenamiento fallidas, la reproducibilidad de experimentos de agentes y el estudio de la degradación o estancamiento durante SFT. No es un modelo apto para uso práctico en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint intermedio de un proceso de ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El proyecto AgentPTB utiliza Claude Code como entorno de ejecución para generar datos y orquestar el entrenamiento, pero no se han publicado detalles específicos sobre el dataset utilizado, el número de tokens de entrenamiento ni el método de optimización empleado. El checkpoint se guardó en el paso 48 de la ejecución `h045`, dentro de la carpeta `scratch/agent/lrA/weights/step_48`.

El autor indica en la model card que la ejecución completa no produjo ninguna mejora en los pesos entrenados. Esto implica que, tras las cinco ejecuciones de SFT realizadas en el proyecto (según el índice del dataset), los tensores del modelo base no fueron superados en calidad. Este resultado negativo es relevante para estudiar por qué ciertos configuraciones de entrenamiento de agentes pueden fallar, y para documentar prácticas de reproducibilidad en entornos de investigación.

## Capacidades

No se dispone de información específica sobre capacidades más allá de las heredadas del modelo base `Qwen/Qwen3.5-9B-Base`. Dado el carácter negativo del entrenamiento, no se puede afirmar ninguna capacidad adicional ni mejora. Las capacidades potenciales del modelo base (generación de texto, razonamiento, código, etc.) no han sido validadas en este checkpoint concreto. Por tanto:

- Generación de texto: no validada en este checkpoint.
- Razonamiento y matemáticas: no validada.
- Generación de código: no validada.
- Tool calling / function calling: no disponible.
- Soporte multilingüe: no disponible.

## Casos de uso

Dado que el autor advierte explícitamente que no hay mejora de pesos entrenados y que el checkpoint es un resultado negativo, los casos de uso se limitan al ámbito de la investigación y el análisis técnico:

- Estudio de reproducibilidad: investigadores pueden utilizar este checkpoint para replicar el experimento `opus-high-v3` y verificar si el resultado negativo es consistente.
- Análisis de fallos en entrenamiento: permite estudiar por qué una configuración de SFT no logra mejorar el modelo base, examinando los pesos intermedios y las curvas de pérdida.
- Comparación de dinámicas de SFT: se puede contrastar este checkpoint con otros pasos de la misma ejecución o con ejecuciones exitosas para identificar patrones de degradación.
- Documentación de resultados negativos: sirve como referencia para evitar repetir configuraciones que no funcionan en futuros experimentos de agentes.
- Auditoría de artefactos: útil para verificar la integridad de los datos y pesos en pipelines de entrenamiento automatizados.
- Educación: como ejemplo práctico de cómo se documentan y comparten resultados negativos en la comunidad de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval, GSM8K u otras para este checkpoint. Dado el carácter negativo del entrenamiento, no se recomienda su uso para tareas de evaluación estándar.

## Requisitos de hardware

Para inferencia con un modelo de ~9.4 mil millones de parámetros en precisión FP16, se estima un consumo de VRAM aproximado de 18-20 GB. A continuación se detallan opciones de hardware y despliegue:

- VRAM estimada: ~18-20 GB en FP16 (sin cuantización). Con cuantización de 8 bits (~9-10 GB) o 4 bits (~5-6 GB) podría ejecutarse en GPUs de consumo, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: NVIDIA A100 (40/80 GB), RTX 4090 (24 GB), RTX A6000 (48 GB) o equivalentes con suficiente memoria.
- En consumer GPU: una RTX 4090 podría ejecutar el modelo en FP16 con margen, pero dado que es un checkpoint sin validar y con resultados negativos, no se recomienda su uso práctico.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, entre otros. Sin embargo, al no haber cuantizaciones publicadas, solo se podría usar safetensors originales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que no hay datos de rendimiento del checkpoint, la comparación se limita a características arquitectónicas y de licencia. Se compara con el modelo base y con otros modelos de tamaño similar (8-9B) de la misma época.

| Modelo | Parámetros | Longitud de contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h045.lrA.step_48 | 9.4B | no disponible | Apache-2.0 | Checkpoint intermedio, resultado negativo |
| Qwen/Qwen3.5-9B-Base | 9.4B | no disponible (típicamente 128K o más) | Apache-2.0 | Modelo base, disponible |
| Llama 3.1 8B (Meta) | 8B | 128K | Llama 3.1 License | Modelo comercial de referencia |
| Mistral 7B v0.3 | 7B | 32K | Apache-2.0 | Modelo abierto de referencia |

No se dispone de comparativas de rendimiento porque el checkpoint no ha sido evaluado y el autor no publicó métricas. La comparación se limita a parámetros y licencia.

## Limitaciones y advertencias

- Resultado negativo confirmado: el autor advierte que la ejecución no produjo mejora de pesos entrenados. No debe inferirse calidad del modelo a partir de su publicación.
- No apto para producción: al ser un checkpoint intermedio sin validación y con resultados negativos, no es adecuado para tareas reales.
- Sesgos y alucinaciones: hereda los sesgos potenciales del modelo base Qwen3.5-9B-Base, y no se ha realizado ninguna mitigación adicional.
- Limitaciones de idioma y contexto: no se han documentado los idiomas soportados ni la longitud de contexto efectiva de este checkpoint.
- Riesgo de malinterpretación: el nombre del proyecto (AgentPTB) y la referencia a Claude Opus podrían llevar a pensar que es un modelo de Anthropic, pero es un experimento independiente sobre un modelo Qwen.
- Reproducibilidad limitada: el dataset asociado (`agentic-ptb/opus-high-v3-data`) existe, pero no se han publicado detalles completos del proceso de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h045.lrA.step_48
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
