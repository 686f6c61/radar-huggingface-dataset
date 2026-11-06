# mkd-minkeun/Keural-Lab-1031

## Resumen

Keural-Lab-1031 es un checkpoint de investigación publicado por el autor independiente mkd-minkeun bajo la etiqueta "Keural lab". Se trata de un modelo de mezcla de expertos (MoE) derivado de Qwen3.8-Flash-Next, al que se le han reducido los expertos enrutados de 512 a 256 por capa y se ha reentrenado sobre datos destilados de varios modelos abiertos. El resultado es un modelo de aproximadamente 65.000 millones de parámetros totales con unos 6.700 millones activos por token, según la model card; los pesos en safetensors suman 116.963.395.731 parámetros.

El objetivo del experimento es doble: medir hasta qué punto se puede podar un MoE grande mediante selección de expertos antes de perder capacidad general, y comprobar si las trazas de respuesta de varios profesores fuertes pueden consolidarse en un modelo más pequeño. El autor lo presenta explícitamente como material de investigación y experimentación local, no como el modelo que sirve en producción.

Es relevante ahora porque documenta con transparencia el coste de la poda de expertos en benchmarks estándar (MMLU, MMLU-Pro, GPQA, GSM8K, IFEval) frente a un modelo comparable, y porque mantiene íntegra la arquitectura, el tokenizador, la tabla de embeddings n-gram y la torre de visión del modelo base, lo que facilita su despliegue con las mismas herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Qwen3.8-Flash-Next |
| Parametros totales | 116.963.395.731 (pesos safetensors); ~65B según la model card |
| Parametros activos | ~6.7B por token |
| Longitud de contexto | Heredada del modelo base; el ejemplo de despliegue usa `--max-model-len 32768` |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; existe un repo GGUF asociado |
| Idiomas soportados | No disponible |
| Licencia | Qwen Community License 1.0 (etiqueta `license:other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors; GGUF en repo separado (Keural-Lab-1031-GGUF) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base Qwen3.8-Flash-Next: capas, mecanismo de atención, tabla de embeddings n-gram, tokenizador y torre de visión sin cambios. La modificación principal está en el enrutamiento: se pasa de 512 a 256 expertos enrutados por capa, seleccionados según su cuota de enrutamiento sobre texto general, de chat y de razonamiento. El entrenamiento consume aproximadamente 1.500 millones de tokens, combinando destilación de logits top-32 desde Qwen3.8-Flash-Next con trazas de respuesta y razonamiento de DeepSeek-V4.1-Flash, Gemma 4 y MiMo V2.6; las trazas de razonamiento solo se conservan cuando la respuesta final era correcta.

No se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El modo de pensamiento (thinking) está activado por defecto y puede desactivarse mediante `enable_thinking: false` en `chat_template_kwargs`. El checkpoint mantiene la plantilla de chat del base, por lo que cualquier servidor compatible con Qwen3.8-Flash-Next puede servirlo.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas de uso cotidiano.
- Razonamiento matemático: GSM8K de 0,930 en el arnés del autor.
- Seguimiento de instrucciones estricto: IFEval de 0,860 en modalidad estricta.
- Modo de razonamiento (thinking) activado por defecto, desactivable por plantilla de chat.
- Capacidades de visión heredadas de la torre del modelo base (la model card indica que la torre de visión queda sin cambios, aunque no detalla tareas evaluadas).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre poda de MoE: comparar el rendimiento de este checkpoint con su base para cuantificar la pérdida de capacidad al reducir expertos, usando el mismo arnés (lm-evaluation-harness con vLLM).
- Destilación multi-profesor: estudiar la consolidación de trazas de DeepSeek-V4.1-Flash, Gemma 4 y MiMo V2.6 en un modelo menor, con filtrado por corrección de la respuesta final.
- Experimentación local con modelos grandes: desplegar con vLLM en configuraciones tensor-parallel y ventana de 32.768 tokens para probar cargas conversacionales.
- Evaluación de instrucciones y matemáticas de nivel escolar: usar GSM8K e IFEval como referencia para validar pipelines de evaluación propios.
- Pruebas de plantilla de chat y modo thinking: verificar el comportamiento con `enable_thinking` activado y desactivado en aplicaciones de chat multi-turno.
- Despliegue en CPU o entornos con poca VRAM mediante el repo GGUF asociado, para experimentación sin GPU de datacenter.

## Benchmarks y rendimiento

Todos los resultados provienen del mismo arnés (lm-evaluation-harness con vLLM, conjuntos de test completos, thinking activado). Las respuestas de opción múltiple en GPQA y MMLU-Pro se leen del `\boxed{}` final.

| Benchmark | Keural-Lab-1031 | Qwen3.6-35B-A3B |
|---|---|---|
| MMLU (log-likelihood) | 0,798 | 0,839 |
| MMLU-Pro | 0,723 | 0,847 |
| GPQA Diamond (media de 4 ejecuciones) | 0,678 | 0,803 |
| GSM8K | 0,930 | 0,963 |
| IFEval (instruction-level, strict) | 0,860 | 0,941 |

El autor señala que el modelo rinde bien en preguntas cotidianas, matemáticas y seguimiento de instrucciones, y que la poda se nota en conocimiento intensivo y razonamiento de nivel graduado (MMLU-Pro, GPQA), donde queda por detrás de Qwen3.6-35B-A3B.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ~117.000 millones de parámetros en safetensors, la inferencia en BF16 requiere del orden de 234 GB de memoria, y el repo ocupa 233,9 GB.
- GPU recomendadas: el ejemplo oficial usa `--tensor-parallel-size 4`, lo que apunta a configuraciones multi-GPU (A100 80 GB, H100 80 GB o similares).
- GPU de consumo: no cabe en tarjetas de consumo en precisión completa; para RTX 4090 o similares habría que recurrir a cuantización GGUF del repo asociado, sin datos de rendimiento publicados.
- Opciones de despliegue: vLLM (`vllm serve mkd-minkeun/Keural-Lab-1031 --tensor-parallel-size 4 --max-model-len 32768`) y llama.cpp mediante Keural-Lab-1031-GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | MMLU | MMLU-Pro | GPQA Diamond | GSM8K | IFEval | Licencia |
|---|---|---|---|---|---|---|---|---|---|
| Keural-Lab-1031 | ~65B (117B en safetensors) | ~6.7B | 32.768 en el ejemplo | 0,798 | 0,723 | 0,678 | 0,930 | 0,860 | Qwen Community 1.0 |
| Qwen3.6-35B-A3B | ~35B | ~3B (A3B) | No disponible | 0,839 | 0,847 | 0,803 | 0,963 | 0,941 | No disponible en la información |
| Qwen3.8-Flash-Next | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | Qwen Community 1.0 (base) |

El único comparable con datos en la información proporcionada es Qwen3.6-35B-A3B, que supera a Keural-Lab-1031 en las cinco métricas publicadas pese a declarar menos parámetros totales. No hay datos de benchmarks del modelo base Qwen3.8-Flash-Next en la información disponible.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor indica explícitamente que no es el modelo que sirve en producción.
- Pérdida de capacidad por poda: caída frente a Qwen3.6-35B-A3B en MMLU-Pro (0,723 frente a 0,847) y GPQA Diamond (0,678 frente a 0,803), especialmente en conocimiento intensivo y razonamiento de nivel graduado.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Sin datos publicados sobre tool calling, comportamiento agéntico, sesgos o tasa de alucinación.
- Discrepancia entre la model card (~65B parámetros) y los pesos reales en safetensors (116.963.395.731), que conviene verificar antes de dimensionar infraestructura.
- Licencia Qwen Community 1.0: según la cláusula 2, una empresa que opere un negocio de Model-as-a-Service o AI Work Assistant necesita una licencia adicional de Qwen para uso comercial.
- Sin descargas ni likes en el momento de la consulta; no hay validación comunitaria independiente de los resultados.
- El repo GGUF asociado no incluye datos de calidad o rendimiento tras cuantización en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/mkd-minkeun/Keural-Lab-1031
- Repo GGUF: https://huggingface.co/mkd-minkeun/Keural-Lab-1031-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia (referenciada en la model card): LICENSE dentro del repo de Hugging Face
