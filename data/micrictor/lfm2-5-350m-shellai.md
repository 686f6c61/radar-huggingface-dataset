# micrictor/LFM2.5-350M-ShellAI

## Resumen

LFM2.5-350M-ShellAI es un modelo de lenguaje especializado en la generación de comandos Bash, desarrollado por el usuario micrictor como una destilación a nivel de respuesta del modelo LiquidAI/LFM2.5-2.6B sobre el modelo base LiquidAI/LFM2.5-350M. El modelo está diseñado para emitir exactamente un comando shell en un formato estructurado con etiquetas `<shellai-command>...</shellai-command>`, lo que lo hace adecuado para integraciones en pipelines de automatización y asistentes de terminal.

El modelo tiene 354,48 millones de parámetros y se distribuye en formato safetensors con pesos BF16. Su entrenamiento emplea destilación a nivel de secuencia (no logits) debido a la diferencia de vocabularios entre el profesor (128K tokens) y el estudiante (65,536 tokens), junto con LoRA, una sola época de entrenamiento, early stopping y una puerta de retención previa a la publicación para mitigar el olvido catastrófico. La licencia es LFM Open License v1.0, una licencia derivada de los pesos de Liquid AI.

La relevancia de este modelo radica en su especialización: en lugar de un modelo generalista, ofrece una solución compacta y de baja latencia para tareas de generación de comandos shell, con métricas de utilidad mejoradas respecto al base (39,7% frente a 23,0% en utility match) y una fuga de formato de shell en conversación general de 0,0%. Está pensado para entornos con recursos limitados, incluyendo CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM2.5, basada en LiquidAI/LFM2.5-350M) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint original); Q8_0 probado en llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (BF16), compatible con Transformers y llama.cpp |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM2.5 de Liquid AI, un transformer optimizado para inferencia rápida en dispositivos de borde y CPU. El checkpoint original es el modelo base de 350M, sobre el cual se aplicó una destilación a nivel de respuesta (sequence-level response distillation) desde el modelo profesor LFM2.5-2.6B. Esta técnica se eligió porque ambos modelos tienen vocabularios distintos (128K el profesor, 65,536 el estudiante), lo que impide la destilación por logits.

El entrenamiento utilizó LoRA (Low-Rank Adaptation) con una sola época, early stopping y una puerta de retención previa a la publicación. La pérdida se calculó solo sobre las respuestas del asistente, y se emplearon anclas de chat general para reducir el olvido catastrófico. Los candidatos generados por el profesor que no superaban los filtros de envoltura de comando, utilidad primaria o similitud con la referencia se sustituían por la referencia verificada del dataset. No se ejecutó ningún comando generado durante la construcción del dataset ni en la evaluación.

## Capacidades

- Generación de comandos Bash estructurados: emite exactamente un comando dentro de las etiquetas `<shellai-command>...</shellai-command>`.
- Utilidad de comando mejorada: en la partición de test (300 ejemplos), alcanza un 39,7% de utility match frente al 23,0% del modelo base.
- Fidelidad de formato: 100% de envolturas válidas en el test de repositorio.
- Retención de chat general: 84,9% de similitud de anclas respecto al baseline, con 0,0% de fuga de envoltura shell en prompts no relacionados.
- Inferencia eficiente en CPU: con cuantización Q8_0 en llama.cpp, alcanza 16,6 tok/s con 1 hilo y 32,5 tok/s con 2 hilos.
- Compatible con Transformers y llama.cpp, lo que permite despliegue en entornos sin GPU.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede generar comandos Bash correctos y estructurados para operaciones rutinarias como gestión de archivos, procesos o permisos, integrándose en scripts de aprovisionamiento.
- Asistentes de terminal para desarrolladores: integrado en un plugin de IDE o CLI, sugiere comandos con formato validado, reduciendo errores de sintaxis y mejorando la productividad.
- Pipelines de CI/CD: en etapas de build o deploy, el modelo puede proponer comandos de compilación, empaquetado o despliegue, siempre dentro de una envoltura que permite validación automática antes de ejecución.
- Generación de documentación de comandos: dado un requisito en lenguaje natural, el modelo produce el comando correspondiente, útil para generar ejemplos en manuales o wikis internas.
- Entrenamiento de agentes de shell: el formato estructurado de salida facilita el uso del modelo como componente de un agente que ejecuta acciones en un entorno controlado, con verificación de la envoltura antes de pasar al intérprete.
- Prototipado rápido de scripts: en entornos de desarrollo sin GPU, el modelo corre en CPU con baja latencia (1278 ms por respuesta con 1 hilo), permitiendo iterar sobre comandos complejos sin necesidad de hardware especializado.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluación en una partición de test de repositorio (300 ejemplos, BF16 con Transformers):

| Modelo | Exact | Utility match | Token F1 | Envoltura valida |
|---|---:|---:|---:|---:|
| Base 350M | 5,7% | 23,0% | 0,225 | 100,0% |
| Distilled 350M | 4,0% | 39,7% | 0,305 | 100,0% |

Prueba de retención de chat (50 prompts no relacionados): fuga de envoltura shell 0,0%; similitud de anclas 84,9% del baseline.

Prueba en CPU con llama.cpp (Q8_0, subconjunto de 50 ejemplos):

| Hilos | Token F1 | Utility match | Latencia mediana | Decode |
|---:|---:|---:|---:|---:|
| 1 | 0,268 | 36,0% | 1278 ms | 16,6 tok/s |
| 2 | 0,268 | 36,0% | 641 ms | 32,5 tok/s |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 350M en BF16, ocupa aproximadamente 0,7 GB en memoria. Con cuantización Q8_0, el peso se reduce a unos 0,35 GB, por lo que puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no se requieren; el modelo está diseñado para correr en CPU y dispositivos de borde. Si se usa GPU, cualquier GPU con al menos 1 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050, Jetson Nano).
- Compatibilidad con consumer GPU: sí, cualquier GPU moderna con soporte CUDA o incluso integradas (iGPU) puede ejecutarlo.
- Opciones de despliegue: Transformers (Python), llama.cpp (CPU, con cuantización Q8_0 probada), y por extensión cualquier framework que soporte safetensors (vLLM, TGI, Ollama) aunque no se han reportado pruebas específicas.
- Latencia y throughput: en CPU con Q8_0, 16,6 tok/s con 1 hilo y 32,5 tok/s con 2 hilos, con latencia mediana de 1278 ms y 641 ms respectivamente para respuestas de longitud típica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-350M-ShellAI (este) | 354M | no disponible | Comandos Bash | LFM Open v1.0 | safetensors, GGUF (Q8_0) |
| LiquidAI/LFM2.5-350M (base) | 354M | no disponible | Generalista, tool calling | LFM Open v1.0 | safetensors |
| LiquidAI/LFM2.5-2.6B (profesor) | 2,6B | no disponible | Generalista, tool calling | LFM Open v1.0 | safetensors |

El modelo destilado mejora la utilidad de comandos (39,7% vs 23,0%) respecto al base, aunque pierde algo de exactitud literal (4,0% vs 5,7%). Frente al profesor de 2,6B, ofrece una huella mucho menor (0,7 GB vs ~5 GB) a costa de menor capacidad general, pero mantiene la especialización en shell. No se dispone de datos de otros modelos especializados en comandos shell para comparación directa.

## Limitaciones y advertencias

- Especialización limitada: el modelo solo genera comandos Bash; no es adecuado para tareas generales de chat, razonamiento o generación de código fuera del ámbito shell.
- Exactitud literal baja: solo un 4,0% de los comandos generados coinciden exactamente con la referencia, aunque la utilidad (39,7%) es significativamente mayor. En producción, se recomienda validar los comandos antes de ejecutarlos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar comandos sintácticamente válidos pero semánticamente incorrectos o peligrosos. No se ejecutó ningún comando durante la evaluación, por lo que no hay garantía de seguridad en entornos reales.
- Sesgos y datos de entrenamiento: no se especifica la composición del dataset de destilación ni los idiomas soportados. El modelo puede tener sesgos derivados de los datos de Liquid AI y del proceso de destilación.
- Licencia restrictiva: la LFM Open License v1.0 es una licencia propia de Liquid AI; es necesario revisar sus términos para uso comercial y redistribución, especialmente porque el modelo es un derivado modificado.
- Contexto no documentado: no se ha publicado la longitud de contexto soportada, lo que limita su uso en tareas que requieran entradas largas.
- Sin garantías de producción: el autor no proporciona información sobre robustez ante entradas adversas, manejo de errores o comportamiento en entornos de alta concurrencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/micrictor/LFM2.5-350M-ShellAI
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-350M
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Documentación oficial de LFM2.5-350M: https://docs.liquid.ai/lfm/models/lfm25-350m
- Modelo embedding relacionado: https://huggingface.co/LiquidAI/LFM2.5-Embedding-350M
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/lfm2-5-350m/
