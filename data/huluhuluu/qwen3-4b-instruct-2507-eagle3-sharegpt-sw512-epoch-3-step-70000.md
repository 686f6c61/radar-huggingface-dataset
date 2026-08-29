# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-70000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-70000` es un modelo de draft (borrador) diseñado exclusivamente para decodificación especulativa, no un modelo de chat independiente. Desarrollado por el usuario huluhuluu mediante la técnica EAGLE3 y el framework SpecForge, su propósito es acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` de 4 000 millones de parámetros. Este checkpoint concreto corresponde a la época 3, paso 70 000, y forma parte de una colección de 47 checkpoints publicados en repositorios separados.

La arquitectura es `LlamaForCausalLMEagle3`, con una única capa de decoder, tamaño oculto de 2560, 32 cabezas de atención y 8 cabezas clave/valor, y una ventana deslizante de atención causal de 512 tokens. Con apenas 202,7 millones de parámetros (0,4 GB en safetensors), el modelo se entrena sobre datos ShareGPT limpios con el método online EAGLE3, alcanzando 231 810 pasos de optimización en 10 épocas. Su relevancia radica en que permite reducir la latencia de generación del modelo Qwen3-4B-Instruct-2507 en entornos de producción, aprovechando la decodificación especulativa sin sacrificar la calidad de las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, hidden size 2560, intermediate 9728, 32 heads, 8 KV heads) |
| Parametros totales | 202 700 416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana deslizante de draft; entrenado con secuencias de hasta 2048) |
| Tipos de cuantizacion | bfloat16 (pesos originales); no se documentan cuantizaciones adicionales |
| Idiomas soportados | no disponible (hereda del modelo base Qwen3-4B-Instruct-2507, que es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft EAGLE3, una variante de decodificación especulativa que predice varias fichas futuras en paralelo para que el modelo objetivo las valide. La arquitectura concreta es `LlamaForCausalLMEagle3`: una sola capa de transformer con atención causal y ventana deslizante de 512 tokens, dimensiones ocultas de 2560, 32 cabezas de atención y 8 cabezas clave/valor, y un vocabulario de draft de 32 000 tokens frente a los 151 936 del modelo objetivo. Los pesos están en bfloat16.

El entrenamiento se realizó con el método online EAGLE3 implementado en SpecForge, usando datos ShareGPT limpios (fuente local, sin revisión registrada). Se ejecutaron 10 épocas con 231 810 pasos de optimización, tamaño de batch efectivo de 4, tasa de aprendizaje de 1e-4 con warmup lineal del 1,5 % y decaimiento coseno, weight decay nulo y gradiente máximo de norma 0,5. La longitud máxima de secuencia fue de 2048 tokens, con una longitud TTT (test-time training) de 7 y atención SDPA. El backend objetivo fue SGLang con flashinfer y tensor parallelism de 1. No se registraron métricas de evaluación ni de seguridad en esta ejecución.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: el modelo genera borradores de varias fichas que el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` valida, reduciendo la latencia por token.
- Integración nativa con SGLang: se usa como ruta de draft especulativo (speculative draft path) en el backend de inferencia.
- Compatibilidad con el ecosistema EAGLE3: diseñado para funcionar con los ajustes de decodificación especulativa de EAGLE3 soportados por SGLang.
- Entrenamiento online adaptativo: al ser un draft entrenado con SpecForge, puede ajustarse dinámicamente a la distribución de datos de producción.
- Bajo coste computacional: con solo ~200 millones de parámetros, el overhead de memoria y cómputo es mínimo en comparación con el modelo objetivo de 4 000 millones.
- No es un modelo de generación autónoma: carece de capacidades de chat, tool calling o razonamiento por sí mismo; su función es exclusivamente auxiliar.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en producción con baja latencia: al integrar este draft como ruta especulativa en SGLang, se puede reducir el tiempo de respuesta en servicios de chat o asistentes virtuales que usan el modelo base de 4B.
- Servidores de inferencia con alta concurrencia: en arquitecturas que atienden múltiples peticiones simultáneas, la decodificación especulativa con un draft pequeño ayuda a aumentar el throughput sin incrementar significativamente el uso de VRAM.
- Aplicaciones de agentes y tool calling: el modelo base Qwen3-4B-Instruct-2507 destaca en tareas de agente y llamada a funciones; el draft acelera estas interacciones multi-turno sin alterar la calidad de las respuestas.
- Prototipado y pruebas de speculative decoding: los investigadores pueden usar este checkpoint para evaluar el impacto de EAGLE3 en la latencia y el rendimiento del modelo objetivo en diferentes cargas de trabajo.
- Optimización de costes en la nube: al reducir la latencia por token, se puede disminuir el número de GPUs necesarias para mantener un SLA de respuesta, abaratando la infraestructura.
- Benchmarking de sistemas de decodificación especulativa: comparar este draft con otros (p. ej., EAGLE-1, Medusa) en términos de tasa de aceptación y aceleración medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "no se registraron métricas de evaluación ni de seguridad" para esta ejecución de entrenamiento. Por tanto, no existen datos cuantitativos sobre tasa de aceptación de fichas, factor de aceleración o comparación con otros métodos de speculative decoding.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de draft ocupa aproximadamente 0,4 GB en bfloat16 (202,7 millones de parámetros × 2 bytes). Al ejecutarse junto al modelo objetivo Qwen3-4B-Instruct-2507 (que requiere alrededor de 8 GB en bf16), la VRAM total necesaria es de unos 8,5-9 GB.
- GPU recomendadas: cualquier GPU con al menos 10 GB de VRAM puede alojar ambos modelos. Ejemplos: NVIDIA RTX 3080/3090/4090, A10, A100, H100. En GPUs con menos de 8 GB, el draft podría caber pero el modelo base no.
- En consumer GPU: sí, es viable en una RTX 3090 o 4090 (24 GB) con margen para el modelo base y el draft.
- Opciones de despliegue: SGLang con backend flashinfer (recomendado por el autor), también posible con vLLM si soporta EAGLE3, o mediante llama.cpp si se convierte a GGUF (aunque no hay soporte oficial documentado).
- Latencia y throughput: no se proporcionan datos medidos. El rendimiento dependerá del hardware, la configuración del árbol de draft y la carga de trabajo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este draft (EAGLE3) | 202,7 M | 512 (ventana deslizante) | EAGLE3 online | Apache-2.0 | HuggingFace |
| EAGLE-1 para Qwen2 (referencia) | ~200 M (tipico) | no aplica | EAGLE-1 | Apache-2.0 | GitHub oficial |
| Draft de Medusa (ejemplo generico) | ~200-300 M | no aplica | Medusa | MIT/Apache | Varios repos |

No se dispone de datos de rendimiento comparativo (tasa de aceptación, aceleración) entre estos modelos en la información proporcionada. La elección entre EAGLE3 y otros métodos depende de la compatibilidad con el backend de inferencia y de las características específicas del modelo objetivo.

## Limitaciones y advertencias

- No es un modelo de chat independiente: debe usarse siempre junto con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`; usarlo solo no produce respuestas útiles.
- Sin métricas de evaluación: el autor no registró resultados de calidad ni de seguridad, por lo que se desconoce su tasa de aceptación real y su impacto en la calidad final.
- Sesgos potenciales: los datos de entrenamiento ShareGPT pueden contener sesgos de contenido y de idioma; el draft puede propagar estos sesgos al modelo objetivo durante la decodificación especulativa.
- Restricciones de contexto: la ventana deslizante de 512 tokens limita la capacidad del draft para predecir más allá de ese rango; en secuencias muy largas, la eficiencia de la decodificación especulativa puede degradarse.
- Dependencia de SGLang: el uso previsto requiere SGLang con soporte EAGLE3 y configuración de árbol; no se garantiza compatibilidad con otros frameworks.
- Archivo `training_state.pt`: contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de código malicioso.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Qwen, que permite uso comercial con atribución); verificar ambas antes de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-70000
- Checkpoint hermana (epoch 3, step 75000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
- Checkpoint hermana (epoch 3, step 70000 sin sufijo SW512): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-70000
- Modelo base Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio oficial EAGLE-Qwen3 en GitHub: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Repositorio de ejemplo de ejecución local con Qwen3-4B-Instruct-2507: https://github.com/locomotive-works/npu-local-model-running
