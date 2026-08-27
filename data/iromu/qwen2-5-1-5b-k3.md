# iromu/Qwen2.5-1.5B-k3

## Resumen

El modelo `iromu/Qwen2.5-1.5B-k3` es un ajuste fino (fine-tuning) con LoRA del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, que a su vez es la variante instruct de Qwen2.5-1.5B de Alibaba. El objetivo de este ajuste es mejorar las capacidades de *tool calling* (llamada a herramientas) y de interacción agéntica (multi-paso) mediante la destilación de datos generados por el modelo Kimi-K3. El resultado es un modelo compacto de 1.540 millones de parámetros que conserva la arquitectura transformer decoder-only de Qwen2.5, pero especializado en tareas de agente y función.

La relevancia de este modelo radica en que permite ejecutar agentes con llamada a herramientas en hardware de consumo, algo que normalmente requiere modelos mucho más grandes. Al estar basado en Qwen2.5, hereda su soporte de contexto largo (hasta 128K tokens en el base) y su licencia Apache 2.0, lo que facilita su uso comercial. El autor, `iromu`, ha publicado también una versión cuantizada en GGUF para facilitar su despliegue con `llama.cpp` y otras herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada; el modelo base soporta hasta 128K tokens, pero el entrenamiento se realizó con secuencias de 4096 |
| Tipos de cuantizacion | safetensors (original) y GGUF (se menciona Q4_K_M) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-1.5B-Instruct`, que es una versión optimizada del Qwen2.5-1.5B-Instruct original. La arquitectura es un transformer decoder-only con atención causal, típica de la familia Qwen2.5. El ajuste fino se realizó con LoRA (Low-Rank Adaptation) sobre todas las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), con dimensión 16 y alpha 16, dropout 0.05. El entrenamiento se ejecutó con NVIDIA NeMo AutoModel, usando precisión mixta bf16, una tasa de aprendizaje de 2e-5, batch global de 4 (micro batch 1 con 4 acumulaciones) y una sola época.

El dataset utilizado es `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, concretamente el split `sft_balanced`. Este dataset contiene conversaciones y ejemplos de interacción agéntica destilados de modelos como Kimi-K3, GLM-5.2 y Qwen3.8-Max, lo que explica el nombre "k3" en el identificador. El objetivo es transferir el comportamiento de razonamiento y llamada a herramientas de modelos grandes a un modelo pequeño.

## Capacidades

- Generación de texto en inglés con formato conversacional.
- Llamada a herramientas (*tool calling*) y *function calling* estructurado, siguiendo el formato de Qwen2.5.
- Interacciones agénticas multi-paso, donde el modelo puede decidir qué herramienta invocar y procesar los resultados.
- Razonamiento destilado de modelos de mayor tamaño, lo que mejora la coherencia en tareas de agente.
- Soporte de contexto largo (heredado del base, aunque el entrenamiento se limitó a 4096 tokens).
- No incluye capacidades multimodales (visión, audio) ni soporte de otros idiomas más allá del inglés.

## Casos de uso

- **Asistentes virtuales con acceso a APIs**: el modelo puede gestionar conversaciones donde necesita consultar una API externa (clima, calendario, bases de datos) y formatear la respuesta. Su tamaño reducido permite ejecutarlo en un servidor modesto o en un dispositivo edge.
- **Automatización de tareas de oficina**: integrado en un pipeline de RPA, puede interpretar instrucciones en lenguaje natural, llamar a funciones de un sistema (enviar correos, crear eventos) y confirmar la acción al usuario.
- **Agentes de soporte técnico**: con un conjunto de herramientas de diagnóstico, el modelo puede guiar al usuario paso a paso, invocando comandos de verificación y proponiendo soluciones.
- **Generación de código con herramientas**: aunque no está específicamente entrenado para código, puede usar una herramienta de ejecución de código (por ejemplo, un intérprete) para resolver problemas de programación simples, gracias a su capacidad de *function calling*.
- **Pruebas de concepto de agentes**: para desarrolladores que quieren experimentar con arquitecturas de agentes sin necesidad de GPUs de gran tamaño, este modelo ofrece un punto de partida ligero y con licencia permisiva.
- **Chatbots de atención al cliente**: con un contexto de 4096 tokens (o más si se amplía), puede mantener conversaciones multi-turno y derivar a herramientas de CRM o ticketing cuando sea necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico. Se recomienda evaluar el modelo en las tareas concretas de *tool calling* y agente antes de usarlo en producción.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en fp16, el modelo ocupa aproximadamente 3 GB de VRAM. Con cuantización Q4_K_M (GGUF), el uso se reduce a alrededor de 1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo en fp16. Para cuantización 4-bit, basta con 2 GB.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoría de GPUs de consumo actuales.
- **Opciones de despliegue**: se puede servir con `text-generation-inference` (TGI), `vLLM`, `llama.cpp` (mediante el formato GGUF), `Ollama` (si se convierte) o directamente con `transformers`. La model card sugiere `trtllm-serve` para TensorRT-LLM.
- **Latencia y throughput**: no se han publicado mediciones. En una GPU como RTX 4090, se espera una latencia de decodificación de unos 20-30 ms por token y un throughput de varios cientos de tokens por segundo, pero estos valores son estimaciones basadas en modelos de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| `iromu/Qwen2.5-1.5B-k3` | 1,54B | No especificado (base 128K) | Apache 2.0 | Tool calling, agentes |
| `unsloth/Qwen2.5-1.5B-Instruct` | 1,54B | 128K | Apache 2.0 | Instruct general |
| `Qwen2.5-1.5B-Instruct` (original) | 1,54B | 128K | Apache 2.0 | Instruct general |
| `Llama-3.2-1B-Instruct` | 1,23B | 128K | Llama 3.2 Community | Instruct general, algo de tool calling |

La comparativa muestra que este modelo se diferencia del base por su ajuste específico para *tool calling* y agentes, mientras que el base es más general. Frente a Llama-3.2-1B, ambos son de tamaño similar, pero Qwen2.5 tiene una base más fuerte en razonamiento y el ajuste con datos de Kimi-K3 puede mejorar la adherencia a formatos de herramientas. No hay benchmarks públicos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo pequeño, es propenso a alucinar en tareas complejas y a reproducir sesgos presentes en los datos de entrenamiento del base y del dataset de destilación.
- **Contexto limitado en la práctica**: aunque el base soporta 128K tokens, el entrenamiento se realizó con secuencias de 4096, por lo que el modelo puede no generalizar bien a contextos mucho más largos. Se recomienda no exceder 4096 tokens en producción sin pruebas adicionales.
- **Idioma**: solo está entrenado para inglés. No se recomienda su uso en otros idiomas sin un ajuste adicional.
- **Uso previsto**: el autor indica explícitamente que no es un reemplazo general para modelos Qwen más grandes. Su rendimiento en tareas generales de generación de texto puede ser inferior al del base.
- **Licencia**: Apache 2.0 permite uso comercial, pero hay que tener en cuenta que el dataset de destilación puede tener restricciones propias (no se especifican). Se recomienda revisar la licencia del dataset `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`.
- **Soporte de herramientas**: el formato de *function calling* es el de Qwen2.5, que puede no ser compatible con todas las librerías de agentes. Es necesario verificar la integración con el framework elegido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/iromu/Qwen2.5-1.5B-k3)
- [Versión GGUF del modelo](https://huggingface.co/iromu/qwen25-1.5b-tools-GGUF)
- [Versión safetensors del modelo (sin el sufijo k3)](https://huggingface.co/iromu/qwen25-1.5b-tools)
- [Dataset de destilación](https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation)
- [Modelo base](https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct)
- [Repositorio oficial de Qwen2.5](https://github.com/mx4ai/qwen2.5)
- [Página de Qwen2.5 en Ollama](https://ollama.com/library/qwen2.5:1.5b)
