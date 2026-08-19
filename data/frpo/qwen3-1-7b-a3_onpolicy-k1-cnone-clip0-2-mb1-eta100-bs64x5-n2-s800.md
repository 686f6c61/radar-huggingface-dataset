# FRPO/qwen3-1.7b-a3_onpolicy-k1-cNone-clip0.2-mb1-eta100-bs64x5-n2-s800

## Resumen

Este repositorio contiene un checkpoint de fine-tuning por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-1.7B`, generado en el marco de los experimentos **KL-in-LLM-RL / FRPO** y entrenado con la librería `verl` de Volcengine. El nombre del repositorio codifica la configuración completa del experimento: método on-policy, factor de clipping 0.2, tamaño de batch 64×5, paso de entrenamiento 800, entre otros hiperparámetros.

El modelo está pensado como material de investigación para estudiar técnicas de optimización de políticas con regularización KL en modelos de lenguaje. No se ha sometido a ningún post-procesamiento: los pesos se guardan en fp32 tal y como los dejó el entrenador. Al estar basado en Qwen3-1.7B, hereda su arquitectura transformer decoder-only y sus capacidades generales de generación de texto, aunque el fine-tuning por RL puede haber alterado su comportamiento en tareas específicas.

Es un checkpoint experimental, con cero descargas y cero likes en el momento de su publicación, orientado a la comunidad de investigadores que trabajan con algoritmos de RL aplicados a LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Qwen/Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (checkpoint en fp32; el modelo base tiene ~1,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la ficha del autor; el modelo base Qwen3-1.7B soporta hasta 32K tokens segun su documentacion oficial |
| Tipos de cuantizacion | No disponible (solo pesos fp32 safetensors) |
| Idiomas soportados | No disponible en la ficha del autor; el modelo base Qwen3-1.7B soporta principalmente ingles y chino |
| Licencia | No disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por refuerzo del checkpoint `Qwen/Qwen3-1.7B`, un transformer decoder-only denso de aproximadamente 1.700 millones de parametros. El entrenamiento se realizó con la librería `verl` (Volcengine) usando el algoritmo **FRPO** (siglas no expandidas en la documentacion) dentro de la familia de experimentos **KL-in-LLM-RL**, que incorpora regularización por divergencia KL durante la optimización de políticas.

La configuración exacta está codificada en el nombre del repositorio: `a3_onpolicy-k1-cNone-clip0.2-mb1-eta100-bs64x5-n2-s800`. Interpretación probable: método on-policy con parámetro `a3`, `k=1`, sin clipping adicional (`cNone`), factor de clipping `0.2`, mini-batch de 1, learning rate `eta=100` (posiblemente escalado), batch size de 64 con 5 gradientes acumulados, `n=2` muestras por prompt y paso de entrenamiento global 800. No se proporcionan más detalles sobre el dataset de entrenamiento ni el número total de tokens.

Los pesos se guardan en fp32 sin post-procesamiento, lo que implica que el checkpoint ocupa aproximadamente 8.1 GB en disco. No se ha aplicado ninguna cuantización ni conversión adicional.

## Capacidades

Al ser un fine-tuning del modelo base Qwen3-1.7B, hereda sus capacidades generales, aunque el entrenamiento por RL puede haber modificado su comportamiento en tareas concretas. Las capacidades documentadas del modelo base incluyen:

- Generacion de texto y continuacion de conversaciones multi-turno
- Razonamiento logico y matematico basico
- Generacion de codigo en varios lenguajes de programacion
- Comprension lectora y respuesta a preguntas
- Soporte de tool calling y function calling (segun las capacidades de Qwen3)
- Capacidad de seguir instrucciones en formato chat

No se han publicado evaluaciones específicas de este checkpoint, por lo que el impacto real del fine-tuning por RL sobre estas capacidades no está cuantificado.

## Casos de uso

- **Investigacion en RL para LLMs**: es un checkpoint de referencia para reproducir experimentos de optimización de políticas con regularización KL. Los investigadores pueden comparar el comportamiento de este modelo con el base o con otros checkpoints del mismo experimento.
- **Estudio de estabilidad de entrenamiento**: al conservar los pesos fp32 exactos del trainer, permite analizar la evolucion de los gradientes y la convergencia del algoritmo FRPO sin interferencias de post-procesamiento.
- **Prototipado rapido de agentes conversacionales**: gracias a su tamaño de 1.7B, puede desplegarse en entornos con recursos limitados para probar flujos de chat con tool calling.
- **Generacion de codigo asistida en entornos ligeros**: el modelo base Qwen3-1.7B es capaz de generar fragmentos de codigo; este checkpoint puede utilizarse para probar si el RL mejora la adherencia a instrucciones en tareas de programacion.
- **Experimentos de alineacion**: al ser un modelo entrenado con RL, puede servir como punto de partida para estudiar tecnicas de alineacion adicionales como DPO o RLHF.
- **Despliegue en edge**: con cuantizacion posterior (por ejemplo, mediante llama.cpp), el modelo podria ejecutarse en dispositivos con menos de 2 GB de VRAM, aunque no se proporcionan cuantizaciones oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion en la model card. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- Los pesos fp32 ocupan 8.1 GB, por lo que se necesita al menos una GPU con 10-12 GB de VRAM para inferencia en fp32 sin cuantizar.
- En fp16 (si se convierte manualmente) el modelo ocuparia aproximadamente 4 GB, siendo viable en GPUs como RTX 3060 (12 GB), RTX 4070 (12 GB) o A10.
- En cuantizacion 4-bit (no incluida en el repositorio, pero posible con herramientas como llama.cpp o AutoGPTQ) ocuparia alrededor de 1 GB y podria ejecutarse en GPUs consumer de gama baja o incluso en CPU.
- Para entrenamiento o fine-tuning adicional se recomienda al menos una GPU con 24 GB de VRAM (RTX 3090, A100 40GB) debido al overhead de los optimizadores en fp32.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, TGI o llama.cpp tras la conversion de formato. No se incluyen archivos GGUF en el repositorio.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FRPO/qwen3-1.7b-a3_onpolicy (este) | 2.03B (fp32) / 1.7B base | No disponible (base: 32K) | No disponible | safetensors fp32 | Checkpoint RL experimental |
| Qwen/Qwen3-1.7B | ~1.7B | 32K | Apache 2.0 | safetensors, GGUF | Modelo base original |
| Llama-3.2-1B | 1.23B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa densa de tamano similar |
| Gemma-2-2B | 2.6B | 8K | Gemma Terms of Use | safetensors, GGUF | Alternativa densa de 2B |

La comparativa se limita a especificaciones tecnicas, ya que no existen datos de rendimiento publicados para este checkpoint. El modelo base Qwen3-1.7B es la referencia natural para evaluar el impacto del RL.

## Limitaciones y advertencias

- **Naturaleza experimental**: es un checkpoint de investigacion sin post-procesamiento, lo que puede provocar comportamientos inestables o degradados en tareas no vistas durante el entrenamiento.
- **Sesgos y alucinaciones**: hereda los sesgos del modelo base Qwen3-1.7B, que pueden estar amplificados por el entrenamiento por RL. No se ha realizado ninguna evaluacion de sesgos.
- **Licencia no definida**: al no especificarse la licencia, no se puede garantizar el uso comercial o la redistribucion. Se recomienda contactar con el autor antes de cualquier uso productivo.
- **Idiomas limitados**: el modelo base esta optimizado principalmente para ingles y chino; su rendimiento en otros idiomas puede ser deficiente.
- **Sin cuantizaciones oficiales**: los pesos fp32 dificultan el despliegue en entornos con recursos limitados; cualquier cuantizacion debe realizarse manualmente y puede afectar al rendimiento.
- **Riesgo de sobreajuste al RL**: al estar entrenado con un objetivo de politica especifico, el modelo puede haber perdido generalidad en tareas genericas de lenguaje.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/FRPO/qwen3-1.7b-a3_onpolicy-k1-cNone-clip0.2-mb1-eta100-bs64x5-n2-s800)
- [Modelo base Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Libreria verl](https://github.com/volcengine/verl)
