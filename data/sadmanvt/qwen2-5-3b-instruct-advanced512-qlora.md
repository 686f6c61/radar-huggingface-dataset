# sadmanvt/Qwen2.5-3B-Instruct-Advanced512-QLoRA

## Resumen

El modelo `sadmanvt/Qwen2.5-3B-Instruct-Advanced512-QLoRA` es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen2.5-3B-Instruct de Alibaba Cloud. Lo desarrolla el usuario sadmanvt y se distribuye como un repositorio de adaptadores de 0,6 GB, no como pesos completos del modelo. El objetivo declarado es un ajuste fino supervisado sobre el conjunto de datos `acereason_advanced_pc_512`, presumiblemente orientado a tareas de razonamiento, aunque la model card no detalla la composición ni el propósito exacto del dataset.

Se trata de un artefacto de investigación de nicho: cuenta con 14 descargas y ningún "like" en el momento de la consulta, y la propia model card es la generada automáticamente por el Trainer con secciones sin completar ("More information needed"). No hay información publicada sobre evaluación, idiomas soportados ni rendimiento.

Su relevancia es limitada y acotada al ecosistema de fine-tuning con LoRA/QLoRA: sirve como ejemplo reproducible de entrenamiento con LLaMA-Factory sobre un modelo de 3B parámetros, con hiperparámetros documentados (learning rate 5e-5, 3 épocas, batch efectivo de 8). Para uso en producción, conviene partir del modelo base Qwen2.5-3B-Instruct y evaluar si este adaptador aporta mejoras reales en la tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct); el artefacto publicado es un adaptador LoRA sobre atención y proyecciones |
| Parametros totales | 3B en el modelo base; el adaptador LoRA no declara su número de parámetros entrenables (no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens |
| Tipos de cuantizacion | QLoRA en entrenamiento (cuantización del base); el adaptador se publica en safetensors sin cuantizar. No se publican pesos GGUF |
| Idiomas soportados | no disponible (heredados del base Qwen2.5, multilingüe, pero sin confirmación del autor) |
| Licencia | other (heredada de Qwen2.5-3B-Instruct, licencia Qwen; requiere revisión para uso comercial) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), librería `peft` |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only con atención de causal estándar, 3.000 millones de parámetros y ventana de contexto nativa de hasta 32.768 tokens (con extensión a 128K en variantes mayores de la familia). Sobre él se aplica un ajuste fino QLoRA: el base se cuantiza durante el entrenamiento y se entrenan únicamente los adaptadores de bajo rango, lo que explica el tamaño reducido del repositorio (0,6 GB).

Los hiperparámetros documentados son: learning rate 5e-5, optimizador AdamW (betas 0.9/0.999, epsilon 1e-8), scheduler coseno, 3 épocas, batch de entrenamiento de 1 con 8 pasos de acumulación de gradiente (batch efectivo 8), precisión mixta nativa AMP y semilla 42. El entrenamiento se realizó con LLaMA-Factory, PEFT 0.15.2, Transformers 4.51.3, PyTorch 2.7.1+cu126, Datasets 3.6.0 y Tokenizers 0.21.1. No se especifica el número de tokens de entrenamiento, la composición del dataset `acereason_advanced_pc_512` ni si hubo etapas de RLHF o DPO posteriores. No se documenta ninguna innovación técnica adicional más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen2.5-3B-Instruct.
- El ajuste se orienta (por el nombre del dataset, `acereason_advanced_pc_512`) a tareas de razonamiento, pero no hay evidencia publicada de mejora medible.
- Soporte de tool calling y function calling: no confirmado para este adaptador; el base Qwen2.5-Instruct lo soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no evaluadas en este adaptador.
- Capacidades multilingües: no declaradas por el autor; el base Qwen2.5 cubre más de 29 idiomas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Experimentación con QLoRA: reproducir el pipeline de LLaMA-Factory sobre Qwen2.5-3B-Instruct con los hiperparámetros documentados para validar técnicas de ajuste eficiente en GPUs de consumo.
- Investigación sobre razonamiento en modelos pequeños: evaluar si un adaptador entrenado sobre un dataset específico de razonamiento mejora tareas de lógica o matemáticas frente al base, midiendo con un conjunto de validación propio.
- Base para fine-tuning en cascada: usar el adaptador como punto de partida y continuar el entrenamiento con datos propios del dominio (por ejemplo, soporte técnico interno) aprovechando que solo se almacenan los pesos LoRA.
- Prototipado rápido de asistentes conversacionales: desplegar el base con el adaptador en entornos de desarrollo con recursos limitados (una RTX 4090 o incluso una RTX 3060 de 12 GB con cuantización 4-bit) para validar flujos de conversación multi-turno.
- Evaluación comparativa de adaptadores: servir como referencia en estudios que comparen distintos LoRA sobre el mismo base, dado que los hiperparámetros están documentados de forma explícita.
- Docencia y formación: ejemplo didáctico de model card autogenerada y de buenas prácticas (y carencias) en la publicación de adaptadores PEFT en HuggingFace.

## Benchmarks y rendimiento

El model-index del autor declara el nombre `pc_advanced_qlora_512_3ep` con una lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base Qwen2.5-3B-Instruct. En FP16, aproximadamente 6-7 GB de VRAM; en cuantización 4-bit (bitsandbytes o GPTQ/AWQ), alrededor de 2,5-3,5 GB.
- GPU recomendadas: A100 o H100 para servir en FP16 con throughput alto; RTX 4090 (24 GB) para desarrollo e inferencia en FP16; RTX 3090/4080 (16-24 GB) para FP16 con margen; RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantización 4-bit.
- Cabe en GPU de consumo: sí, en todas las GPU con 12 GB o más usando cuantización, y en 8 GB con cuantización agresiva (Q4_K_M en llama.cpp, aunque el adaptador no se distribuye en GGUF).
- Opciones de despliegue: vLLM y TGI (requieren fusionar el adaptador con el base o usar soporte de adaptadores LoRA), llama.cpp/Ollama (requiere convertir el adaptador a GGUF y fusionarlo), Transformers + PEFT para carga directa del adaptador.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sadmanvt/Qwen2.5-3B-Instruct-Advanced512-QLoRA | 3B (base) + adaptador LoRA | no disponible (base: 32.768) | other (Qwen) | HuggingFace, 14 descargas | Adaptador de nicho sin evaluación publicada |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 | Qwen (Apache 2.0 en algunas variantes, revisar) | HuggingFace, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | HuggingFace, muy extendido | Alternativa de tamaño similar con contexto mayor |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | HuggingFace | Mayor tamaño y licencia permisiva, requiere más VRAM |

El adaptador no aporta benchmarks propios que permitan una comparación de rendimiento; la comparación se limita a parámetros, contexto y licencia del modelo base.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks ni métricas de validación publicadas, por lo que no puede afirmarse que el adaptador mejore al base en ninguna tarea.
- Model card incompleta: las secciones de descripción, usos previstos, datos de entrenamiento y resultados están sin rellenar ("More information needed").
- Dataset no documentado: se desconoce la composición, procedencia y posibles sesgos de `acereason_advanced_pc_512`.
- Riesgo de alucinación: heredado del base Qwen2.5-3B-Instruct, agravado por la falta de evaluación del ajuste.
- Licencia "other": requiere revisar los términos de la licencia Qwen del modelo base antes de cualquier uso comercial; el adaptador no aclara condiciones adicionales.
- Idiomas no declarados: no hay confirmación de que el ajuste preserve las capacidades multilingües del base.
- Contexto no verificado: aunque el base soporta 32.768 tokens, no se ha validado que el adaptador funcione correctamente con secuencias largas.
- Trazabilidad limitada: 14 descargas y ningún "like" indican un artefacto sin validación por parte de la comunidad.
- Para producción, se recomienda partir del modelo base oficial y evaluar el adaptador de forma aislada antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/sadmanvt/Qwen2.5-3B-Instruct-Advanced512-QLoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
