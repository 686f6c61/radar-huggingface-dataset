# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-8-step-195000

## Resumen

El repositorio `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-8-step-195000` contiene un modelo de borrador (draft model) para decodificación especulativa EAGLE3, entrenado de forma online con la herramienta SpecForge. No es un modelo de chat independiente: su única función es acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` cuando se despliega con SGLang y la configuración de decodificación especulativa EAGLE3. El autor, huluhuluu, publica una colección de 47 checkpoints desde `epoch_0_step_5000` hasta `epoch_9_step_231810`; este repositorio corresponde al checkpoint de `epoch_8_step_195000`.

El modelo tiene 202,7 millones de parámetros, una arquitectura `LlamaForCausalLMEagle3` con una sola capa de decoder, y una ventana deslizante de atención causal de 512 tokens. Se entrenó sobre datos ShareGPT limpios (JSONL local) durante 10 épocas con un total de 231.810 pasos de optimizador, usando una longitud máxima de secuencia de 2048 tokens. Su relevancia radica en que permite reducir la latencia de generación de Qwen3-4B-Instruct-2507 sin sacrificar calidad, aprovechando la decodificación especulativa con árboles de candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, hidden 2560, intermediate 9728, 32 heads, 8 KV heads, attention sliding-window 512) |
| Parametros totales | 202.700.416 (aprox. 202,7 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 (máximo de entrenamiento); ventana deslizante de draft de 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 según la model card) |
| Idiomas soportados | No disponible (dataset ShareGPT, que incluye múltiples idiomas, pero no se especifica composición) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una arquitectura diseñada para decodificación especulativa. Consiste en una única capa de decoder con hidden size de 2560, intermediate size de 9728, 32 cabezas de atención y 8 cabezas clave/valor, con un vocabulario de draft de 32.000 tokens frente a los 151.936 del modelo objetivo. La atención es causal con ventana deslizante de 512 tokens, implementada con `sdpa` (scaled dot-product attention). El entrenamiento se realizó de forma online con SpecForge, una técnica que entrena el draft model mientras el modelo objetivo genera respuestas en tiempo real, utilizando el método EAGLE3 con una longitud de test-time training (TTT) de 7 tokens.

Los datos de entrenamiento provienen de un dataset ShareGPT limpio (fuente local, sin revisión registrada), con un máximo de secuencia de 2048 tokens. El entrenamiento usó 10 épocas, 231.810 pasos de optimizador, batch efectivo global de 4, learning rate de 1e-4 con warmup lineal del 1,5% y posterior cosine annealing, weight decay 0 y max gradient norm 0,5. No se aplicó RLHF ni DPO; es un entrenamiento supervisado puro sobre las salidas del modelo objetivo. El backend objetivo es SGLang con `flashinfer` y tensor parallelism de 1.

## Capacidades

- Decodificación especulativa: acelera la generación de texto del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` mediante la predicción de múltiples tokens candidatos en paralelo.
- Integración con SGLang: diseñado para usarse como ruta de draft en SGLang con configuración EAGLE3, incluyendo soporte para árboles de candidatos (tree settings).
- No es un modelo de chat: no genera respuestas de forma autónoma ni soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; depende de los datos ShareGPT, que contienen conversaciones en varios idiomas, pero no hay métricas que lo confirmen.
- Sin modo de pensamiento: el modelo objetivo Qwen3-4B-Instruct-2507 no tiene thinking mode, y el draft model tampoco lo añade.

## Casos de uso

- Despliegue de inferencia de baja latencia: utilizar el draft model junto a Qwen3-4B-Instruct-2507 en SGLang para reducir la latencia de generación en entornos de producción donde el throughput es crítico, por ejemplo en chatbots o asistentes en tiempo real.
- Optimización de costes de GPU: al acelerar la decodificación, se puede servir más peticiones por segundo con la misma infraestructura, reduciendo el coste por token generado.
- Evaluación de estrategias de decodificación especulativa: sirve como banco de pruebas para ajustar la configuración de árboles (tree settings) y medir el ratio de aceptación de tokens en diferentes cargas de trabajo.
- Investigación en modelos de draft: permite estudiar el impacto del entrenamiento online con SpecForge y la ventana deslizante de 512 tokens en la calidad de la especulación frente a otros checkpoints de la misma colección.
- Integración en pipelines de servicio de LLM: se puede combinar con frameworks de orquestación (vLLM, TGI) si estos soportan EAGLE3, aunque la documentación actual solo referencia SGLang.
- Benchmarking de latencia: útil para comparar el rendimiento de la decodificación especulativa frente a la generación autoregresiva estándar en cargas de trabajo de chat con contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este run. Se recomienda al usuario realizar sus propias mediciones de latencia y throughput con SGLang y el modelo objetivo.

## Requisitos de hardware

- VRAM estimada: el modelo pesa aproximadamente 0,4 GB en bfloat16 (202,7 M parámetros), por lo que la VRAM adicional necesaria sobre el modelo objetivo es mínima (menos de 1 GB).
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas consumer como RTX 3090, RTX 4090, o GPUs de datacenter como A100, L4 o H100. El entrenamiento usó tensor parallelism 1, por lo que no requiere múltiples GPUs.
- Compatibilidad con consumer GPU: sí, cabe incluso en GPUs con 4 GB de VRAM si se combina con el modelo objetivo cuantizado.
- Opciones de despliegue: SGLang (backend recomendado, con `flashinfer`); no se documenta soporte para vLLM, llama.cpp u Ollama en la model card.
- Latencia y throughput: no disponibles; dependen de la configuración de árboles y del hardware.

## Comparativa con modelos similares

No hay modelos comparables exactos publicados en la información disponible, ya que se trata de un draft model específico para Qwen3-4B-Instruct-2507. Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4 B | 256 K (según unsloth) | Apache-2.0 | Modelo de chat instruct |
| Este draft model EAGLE3 | 202 M | 512 (ventana draft) | Apache-2.0 | Aceleración especulativa |

La comparativa directa con otros draft models de EAGLE3 para Qwen3 no está disponible en los resultados de búsqueda.

## Limitaciones y advertencias

- No es un modelo de chat: intentar usarlo como modelo independiente producirá salidas sin sentido o fallos, ya que su vocabulario y arquitectura están diseñados exclusivamente para especulación.
- Requiere el modelo objetivo exacto: debe emparejarse con `Qwen/Qwen3-4B-Instruct-2507`; usarlo con otro modelo puede degradar el rendimiento o fallar.
- Dependencia de SGLang: la integración solo está documentada con SGLang y `flashinfer`; otros frameworks pueden no soportar EAGLE3.
- Sin evaluación de seguridad: la model card indica que no se registraron métricas de seguridad; el draft model puede heredar sesgos del dataset ShareGPT.
- Datos de entrenamiento: ShareGPT contiene conversaciones reales de usuarios, lo que puede introducir sesgos, lenguaje inapropiado o información personal; no se aplicó filtrado adicional documentado.
- Ventana deslizante corta: 512 tokens de contexto para el draft, lo que limita la especulación en secuencias muy largas; el rendimiento puede degradarse en diálogos extensos.
- Estado del checkpoint: es un checkpoint intermedio (epoch 8, step 195000) de un entrenamiento de 10 épocas; el checkpoint final (epoch 9, step 231810) puede ofrecer mejor rendimiento.
- `training_state.pt`: contiene estado del optimizador y debe deserializarse solo en entornos de confianza.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-8-step-195000
- Checkpoint hermano (epoch 2, step 50000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-2-step-50000
- Checkpoint hermano (epoch 3, step 75000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
- Implementación oficial de EAGLE para Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Modelo base Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Página de comparación de Qwen3-4B-Instruct-2507 en LLM Explorer: https://llm-explorer.com/model/unsloth%2FQwen3-4B-Instruct-2507,4AuqkDaNLnrLZ6GFILqewu
