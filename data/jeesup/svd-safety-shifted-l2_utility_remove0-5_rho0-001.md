# Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.001

## Resumen

Este checkpoint es un experimento de investigación publicado por el usuario Jeesup sobre compresión de modelos y evaluación de seguridad. Se construye a partir de `meta-llama/Llama-2-7b-chat-hf` mediante una descomposición en valores singulares (SVD) con un presupuesto de rango reducido: se elimina nominalmente el 50% de los parámetros de proyección, lo que se traduce en una fracción de parámetros factorizados de 0,519340 sobre el modelo completo. No hay ajuste fino de recuperación posterior a la compresión.

El interés del checkpoint no es su calidad como modelo de propósito general, sino su utilidad como artefacto de estudio: mide cómo cambia el comportamiento de seguridad (identidad) de un modelo al comprimirlo, partiendo de una métrica de utilidad y aplicando un desplazamiento relativo `rho = 0.001`. El autor lo describe explícitamente como un piloto unilateral, no como un SVD con conciencia de Fisher completa, y advierte que las mediciones no constituyen una garantía de seguridad.

Con 6.738.415.616 parámetros reales en safetensors y un repositorio de 13,5 GB, es un modelo de 7B con pesos densos ya plegados para facilitar la evaluación. El propio autor indica que la representación de bajo rango subyacente no se distribuye factorizada, por lo que este upload no proporciona inferencia factorizada ni demuestra aceleración alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama 2 (compresión SVD con pesos densos plegados) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7b-chat-hf) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only con atención causal estándar. Sobre esa base se aplica una compresión por SVD: se elimina nominalmente el 50% de los parámetros de proyección, y la fracción realizada de parámetros factorizados sobre el modelo completo es 0,519340. No se aplica ajuste fino de recuperación, de modo que el checkpoint refleja el efecto directo de la truncación de rango.

El procedimiento de calibración usa una métrica mixta que combina momentos de entrada de WikiText con 0,1 veces los momentos de pares de prompt dañino y respuesta segura. Ambas familias emplean los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2), renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. El objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación de entropía cruzada usa 32 y 12 ejemplos separados. Los hiperparámetros incluyen `rho = 0.001`, `lambda` global de 0,021182246274867613 y ridge de 1e-05.

El autor califica el método como piloto unilateral y no como SVD con conciencia de Fisher completa. Los pesos se entregan como matrices densas de Hugging Face plegadas para comodidad de evaluación; el presupuesto de rango describe la representación de bajo rango subyacente, pero el upload no ofrece inferencia factorizada ni establece una mejora de velocidad.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat-hf, sujeta a la degradación introducida por la compresión sin recuperación.
- Razonamiento y respuesta a instrucciones en formato de chat, con la plantilla de Llama 2.
- Evaluación de seguridad: el checkpoint está diseñado para medir la tasa de éxito de ataques (ASR) y el comportamiento de rechazo ante prompts dañinos.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se documentan.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint para reproducir las mediciones de WikiText-2 PPL, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, y comparar con el modelo base sin comprimir.
- Estudio de la relación utilidad-seguridad: analizar cómo un desplazamiento relativo `rho = 0.001` sobre una métrica de utilidad afecta a la tasa de rechazo y a la coherencia, inspeccionando las fracciones puntuadas junto con el ASR.
- Auditoría de artefactos de compresión: examinar `compression.json` para obtener diagnósticos por matriz y verificar la fracción de parámetros factorizados realizada (0,519340) frente a la nominal (50%).
- Reproducción de experimentos: el código fuente, los ajustes exactos y las pérdidas de validación están en `experiment/`, lo que permite reejecutar el pipeline de calibración con los 128 ejemplos dañinos y 40 benignos.
- Docencia sobre SVD en modelos de lenguaje: ilustrar el efecto de la truncación de rango sin ajuste fino de recuperación en un modelo de 7B con licencia Llama 2.
- Evaluación comparativa de jueces automáticos: emplear las generaciones almacenadas para contrastar las decisiones de HarmBench y WildGuard sobre un mismo conjunto de salidas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los archivos de evaluación contienen WikiText-2 PPL, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores en el material facilitado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia dimensional, un modelo de 7B en fp16 requiere del orden de 14 GB solo para pesos; en 8 bits, unos 7 GB; en 4 bits, unos 4 GB, sin contar caché KV ni overhead.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el tamaño de pesos (13,5 GB en el repositorio) sugiere que la inferencia en fp16 no cabe en GPUs de consumo con 8-12 GB sin cuantización.
- Opciones de despliegue: no disponible en la información proporcionada. Al ser pesos densos en safetensors con arquitectura Llama 2, serían aplicables las herramientas habituales para esa familia, pero el autor no las documenta ni las valida.
- Latencia y throughput estimados: no disponible; el autor señala explícitamente que este upload no establece ninguna aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.001 | 6.738.415.616 | no disponible | llama2 | Checkpoint de investigación con SVD al 50% nominal y sin recuperación |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (aprox.) | no disponible en la información proporcionada | llama2 | Modelo base sin comprimir; referencia directa del experimento |
| Otros checkpoints de compresión SVD de Llama 2 | no disponible | no disponible | no disponible | No se dispone de alternativas documentadas en la información proporcionada |

## Limitaciones y advertencias

- El propio autor advierte que se trata de un piloto unilateral y no de un SVD con conciencia de Fisher completa; los resultados no deben generalizarse a métodos de compresión más sofisticados.
- No hay ajuste fino de recuperación, por lo que es esperable una degradación de la calidad respecto al modelo base; debe inspeccionarse la coherencia junto con las métricas de seguridad.
- Las mediciones de seguridad (ASR, juicios de HarmBench y WildGuard) no establecen una garantía de seguridad; son mediciones piloto.
- Los ejemplos de validación de entropía cruzada (32 dañinos y 12 benignos) no son completamente no vistos, ya que el corpus de métrica mixta es más amplio; son retenidos respecto al gradiente, no respecto a la calibración.
- El upload no proporciona inferencia factorizada ni demuestra mejora de velocidad pese al presupuesto de rango declarado.
- Sesgos conocidos: no disponible en la información proporcionada; se heredan los del modelo base Llama 2 chat.
- Riesgo de alucinación: no cuantificado en la información proporcionada; previsiblemente incrementado por la compresión sin recuperación.
- Restricciones de licencia: licencia Llama 2, que impone condiciones de uso comercial y requiere el cumplimiento de la política de uso aceptable de Meta; debe revisarse antes de cualquier despliegue en producción.
- Idiomas soportados: no disponible en la información proporcionada.

## Enlaces

- [Hugging Face: Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.001](https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.001)
- [Modelo base: meta-llama/Llama-2-7b-chat-hf](https://huggingface.co/meta-llama/Llama-2-7b-chat-hf)
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
