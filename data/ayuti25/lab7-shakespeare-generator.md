# Ayuti25/lab7-shakespeare-generator

## Resumen

lab7-shakespeare-generator es un ajuste fino (fine-tuning) del modelo SmolLM2-135M de HuggingFaceTB, publicado por el usuario Ayuti25 en Hugging Face. Se trata de un modelo de generacion de texto de pequeno tamano (134,5 millones de parametros) entrenado con la libreria Transformers y la clase Trainer, cuyo objetivo declarado es la generacion de texto con estilo shakespeariano, aunque la model card no documenta el dataset de entrenamiento ni los usos previstos.

El modelo parte de la arquitectura Llama de SmolLM2, un transformer decoder-only optimizado para eficiencia en dispositivos con recursos limitados. Con 134,5 millones de parametros y un repositorio de 0,5 GB en formato safetensors, esta pensado para experimentacion y prototipado rapido mas que para produccion a gran escala. La licencia Apache 2.0 facilita su reutilizacion comercial, aunque la ausencia de documentacion sobre el dataset y los sesgos limita su fiabilidad en entornos reales.

Es relevante ahora como ejemplo de fine-tuning accesible: cualquiera con una GPU consumer puede reproducir el entrenamiento (2 epochs, 728 pasos, learning rate 5e-4) y desplegarlo con herramientas como transformers o text-generation-inference. No obstante, su perdida de validacion final (3,2402) y la falta de benchmarks publicados indican que su calidad esta lejos de modelos mas grandes y mejor documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base SmolLM2-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de SmolLM2-135M; no documentada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, pero no documentada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de SmolLM2-135M, un transformer decoder-only de la familia Llama con 134,5 millones de parametros. No se trata de una arquitectura MoE ni hibrida; es un transformer denso estandar. La model card no detalla la composicion del dataset de entrenamiento (se indica "unknown dataset") ni el numero de tokens utilizados, aunque por el numero de pasos (728) y el tamano de batch (8) se puede inferir un corpus de aproximadamente 5.824 muestras por epoch, asumiendo que cada paso consume un batch.

El entrenamiento se realizo con la clase Trainer de Transformers 5.14.1 sobre PyTorch 2.9.1+cu128, con optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8), learning rate 5e-4, scheduler coseno con 50 pasos de warmup, 2 epochs, seed 42 y batch de 8 tanto en entrenamiento como en evaluacion. La perdida de entrenamiento descendio de 3,3220 a 2,4518, mientras que la de validacion se estabilizo en torno a 3,24 tras el primer epoch, lo que sugiere un sobreajuste moderado a partir del paso 400. No se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional (sin decodificacion especulativa ni atencion lineal propia).

## Capacidades

- Generacion de texto autoregresiva: el modelo produce texto continuo a partir de un prompt, orientado segun su nombre a estilo shakespeariano, aunque la model card no lo confirma explicitamente.
- Razonamiento basico y coherencia local: limitada por su tamano (135M), adecuada para frases y parrafos cortos, no para cadenas de razonamiento largas.
- Generacion de codigo y matematicas: no documentada; el modelo base SmolLM2-135M tiene capacidades limitadas en estas areas y el fine-tuning no las declara.
- Tool calling / function calling: no disponible; no se menciona soporte en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se especifican idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado de generacion de texto estilizado: usar el modelo para generar dialogos o parrafos con tono shakespeariano en demos, talleres o ejercicios docentes, aprovechando su bajo coste computacional y su licencia permisiva.
- Educacion y ensenanza de fine-tuning: servir como ejemplo reproducible de ajuste fino de un modelo pequeno con Trainer, ya que la model card documenta hiperparametros y curvas de perdida.
- Generacion de texto en dispositivos con recursos limitados: desplegarlo en CPU o GPUs de gama baja (por debajo de 1 GB de VRAM en fp16) para tareas de generacion corta donde no se requiera alta calidad.
- Filtrado y generacion de contenido creativo offline: integrarlo en herramientas locales de escritura asistida o generacion de prompts, sin dependencia de APIs externas.
- Base para nuevos fine-tunings: partir de este checkpoint para experimentar con datasets propios de estilo literario o dominio especifico, dado su bajo coste de entrenamiento (728 pasos en 2 epochs).
- Pruebas de pipelines de despliegue: validar integraciones con transformers, text-generation-inference o endpoints compatibles usando un modelo pequeno antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card declara un unico resultado en la seccion de evaluacion: perdida de validacion de 3,2402. El model-index no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor |
|---|---|
| Perdida de validacion (final) | 3,2402 |
| Perdida de entrenamiento (final) | 2,4518 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp16 (270 MB de pesos) y en torno a 0,15 GB en int8; el repositorio completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 1 GB de VRAM, e incluso en Raspberry Pi o moviles con cuantizacion.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (tag endpoints_compatible), llama.cpp/Ollama mediante conversion a GGUF (no incluida en el repo), vLLM (soporte para modelos Llama pequenos).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera decodificacion en tiempo real en GPU consumer y varios tokens por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lab7-shakespeare-generator | 134,5 M | no disponible | Apache 2.0 | Hugging Face (556 descargas) | Fine-tuning de SmolLM2-135M, sin benchmarks |
| HuggingFaceTB/SmolLM2-135M | 135 M | 8.192 tokens (segun documentacion del modelo base) | Apache 2.0 | Hugging Face | Modelo base, con benchmarks publicados por HuggingFace |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | Hugging Face | Mayor capacidad, requiere mas VRAM |
| Qwen2.5-0.5B | 0,5 B | 32.768 tokens | Apache 2.0 | Hugging Face | Contexto mucho mayor y mejor rendimiento general |

La comparativa se basa en datos publicos de los modelos alternativos; para el modelo evaluado, los datos de contexto y rendimiento no estan disponibles en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no especificarse el dataset de entrenamiento, no es posible evaluar sesgos de genero, raza o ideologicos.
- Riesgo de alucinacion: alto en relacion con su tamano (135M) y con una perdida de validacion de 3,24; no es fiable para datos factuales.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y los idiomas soportados no se especifican; se desconoce si conserva el contexto de 8.192 tokens de SmolLM2-135M.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el dataset, lo que puede implicar riesgos legales si el corpus de entrenamiento contenia material con derechos de autor.
- Caveats para produccion: la model card esta autogenerada y sin completar ("More information needed"); no hay benchmarks, ni evaluacion de seguridad, ni versionado. No se recomienda su uso en produccion sin una evaluacion previa propia.
- Sobreajuste: la perdida de validacion se estanca a partir del paso 400 mientras la de entrenamiento sigue bajando, lo que sugiere sobreajuste al dataset de ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/Ayuti25/lab7-shakespeare-generator
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Documentacion de Transformers Trainer: https://huggingface.co/docs/transformers/main_classes/trainer
- Text Generation Inference: https://huggingface.co/docs/text-generation-inference
