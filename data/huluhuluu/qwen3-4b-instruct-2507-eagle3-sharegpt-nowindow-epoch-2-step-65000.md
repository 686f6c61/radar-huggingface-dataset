# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-2-step-65000

## Resumen

Este repositorio contiene un checkpoint del modelo de draft EAGLE3 entrenado sobre el modelo base Qwen/Qwen3-4B-Instruct-2507 mediante la técnica de entrenamiento online SpecForge. No se trata de un modelo de chat independiente, sino de un componente auxiliar diseñado para acelerar la inferencia del modelo objetivo mediante decodificación especulativa (speculative decoding). El checkpoint concreto es el correspondiente a la época 2, paso 65000, de una ejecución que generó 47 checkpoints a lo largo de 10 épocas y 231810 pasos de optimización.

El modelo emplea la arquitectura LlamaForCausalLMEagle3, con una única capa de decoder, tamaño oculto de 2560, 32 cabezas de atención y 8 cabezas clave/valor. Con 202,7 millones de parámetros y un peso en bfloat16 de aproximadamente 0,4 GB, su función es predecir secuencias de tokens plausibles que el modelo principal verifica y acepta de forma selectiva, reduciendo así el número de pasos de decodificación necesarios y mejorando la latencia en entornos de servidor.

La relevancia de este modelo radica en su aplicación práctica para despliegues de Qwen3-4B-Instruct-2507 en producción, donde la decodificación especulativa puede reducir significativamente el tiempo de generación sin modificar la calidad del texto final, ya que el modelo base conserva intacta su distribución de salida. Publicado bajo licencia Apache 2.0, está pensado para integrarse con SGLang mediante el algoritmo EAGLE3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate 9728, 32 heads, 8 KV heads) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 (máximo de entrenamiento; el draft model no define contexto propio, depende del modelo base) |
| Tipos de cuantizacion | bfloat16 (pesos del checkpoint); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3-4B-Instruct-2507, multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una variante de decodificación especulativa que utiliza una capa de decoder ligera (hidden size 2560, intermediate 9728) para predecir múltiples tokens de draft en paralelo. La atención se implementa con scaled dot-product attention (sdpa) y el vocabulario de draft es de 32000 tokens, mientras que el vocabulario objetivo del modelo base es de 151936. El entrenamiento se realizó de forma online con SpecForge, un framework que entrena el draft model mientras se sirve el modelo base, utilizando datos limpios de ShareGPT en formato JSONL. La configuración incluye 4 réplicas de datos (batch efectivo 4), máximo de secuencia de 2048 tokens, longitud de árbol TTT de 7, y un esquema de aprendizaje con warmup lineal del 1,5% y decaimiento coseno, sin weight decay y con gradiente máximo de 0,5. El checkpoint publicado no aplica ventana deslizante, como indica el sufijo "NoWindow" del nombre.

## Capacidades

- Generación de secuencias de draft de tokens: predice múltiples tokens plausibles que el modelo base verifica en paralelo, acelerando la decodificación.
- Integración con SGLang: soporta el algoritmo EAGLE3 mediante los parámetros `--speculative-algorithm EAGLE3`, `--speculative-draft-model-path`, `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.
- Compatible con el framework SpecForge y la librería transformers (formato safetensors).
- No es un modelo de chat: no genera respuestas finales ni mantiene conversaciones por sí mismo.
- No incluye capacidades de razonamiento, tool calling, visión ni audio; su única función es servir como modelo de draft.

## Casos de uso

- Aceleración de inferencia de Qwen3-4B-Instruct-2507 en producción: al desplegar el modelo base con SGLang y este checkpoint como ruta de draft, se reduce la latencia de generación en servicios de chat o asistentes, manteniendo la calidad del texto final.
- Reducción de coste por token en APIs de generación: al disminuir el número de pasos de decodificación, se reduce el tiempo de cómputo por petición, lo que permite servir más peticiones con la misma infraestructura.
- Optimización de pipelines de generación de código y matemáticas: el modelo base Qwen3-4B-Instruct-2507 destaca en tareas de código y razonamiento; el draft model acelera estas cargas sin alterar los resultados.
- Evaluación de técnicas de decodificación especulativa: investigadores pueden comparar la eficiencia de EAGLE3 frente a otros métodos (p. ej., Medusa, Lookahead) utilizando este checkpoint como referencia.
- Ajuste fino de hiperparámetros de speculative decoding: los valores de `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` pueden ser optimizados para cargas de trabajo específicas, y este checkpoint sirve como base para dichas pruebas.
- Despliegue en entornos con recursos limitados: al ser un modelo de solo 202 millones de parámetros, puede ejecutarse en GPUs de gama media junto al modelo base, sin necesidad de hardware de alta gama para el componente de draft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se registraron métricas de evaluación ni de seguridad para esta ejecución de entrenamiento. Se recomienda realizar pruebas de latencia y throughput específicas para cada carga de trabajo antes de decidir su adopción en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de draft ocupa aproximadamente 0,4 GB en bfloat16 (202,7 M de parámetros). El modelo base Qwen3-4B-Instruct-2507 requiere unos 8 GB en bfloat16 (sin cuantizar) o menos con cuantización. En total, el par base + draft puede caber en GPUs con 12 GB o más.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para despliegues de alto rendimiento. Para pruebas locales, una RTX 3060 de 12 GB puede ser suficiente si el modelo base se cuantiza.
- Cabe en consumer GPU: sí, especialmente con cuantización del modelo base (p. ej., AWQ o GPTQ) y el draft model en bfloat16.
- Opciones de despliegue: SGLang es el backend recomendado (con soporte flashinfer). También puede utilizarse con vLLM si se implementa soporte EAGLE3, aunque la documentación oficial apunta a SGLang. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos medidos. El rendimiento depende de la tasa de aceptación del draft model, la longitud de secuencia y el hardware. Se recomienda realizar benchmarks con la configuración de árbol especificada (num-steps 3, topk 1, num-draft-tokens 4) como punto de partida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (EAGLE3 draft) | 202,7 M | 2048 (entrenamiento) | EAGLE3 / SpecForge | Apache 2.0 | HuggingFace |
| MNN/Qwen3-4B-Instruct-2507-Eagle3 (ModelScope) | No disponible | No disponible | EAGLE3 | No especificada | ModelScope |
| Modelo base Qwen3-4B-Instruct-2507 | 4 B | 32768 (según documentación de Qwen) | Transformer dense | Apache 2.0 | HuggingFace |

La comparativa se limita a otros draft models para el mismo modelo base. No se dispone de datos de rendimiento de alternativas como Medusa o Lookahead en este contexto. Este checkpoint se distingue por su entrenamiento online con SpecForge y su publicación bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Limitaciones y advertencias

- No es un modelo de chat autónomo: usarlo directamente para generar respuestas producirá resultados sin sentido. Debe emparejarse siempre con el modelo base Qwen3-4B-Instruct-2507.
- Sin evaluación de seguridad ni de sesgos: la model card indica que no se registraron métricas de evaluación ni de seguridad. No se puede garantizar que el draft model esté libre de sesgos presentes en los datos de ShareGPT.
- Dependencia del modelo base: cualquier limitación del modelo base (sesgos, alucinaciones, restricciones de idioma) se mantiene, ya que el draft model solo acelera la decodificación.
- Ventana de contexto limitada en entrenamiento: el máximo de secuencia fue de 2048 tokens, aunque el modelo base soporta contextos mayores. El draft model podría degradarse en secuencias más largas, aunque la verificación del modelo base garantiza corrección.
- Estado de entrenamiento con datos no auditados: el archivo `training_state.pt` contiene estado de optimizador y argumentos; debe deserializarse solo en entornos de confianza por riesgo de ejecución de código arbitrario.
- Sin garantía de mejora de rendimiento: la aceleración depende de la tasa de aceptación, que varía según la carga de trabajo. Es necesario realizar benchmarks para validar la ganancia real.
- Sin soporte oficial de mantenimiento: el autor no proporciona canal de soporte ni garantías de actualización.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-2-step-65000
- Colección de checkpoints (47 en total): accesible desde el perfil del autor en HuggingFace
- Repositorio oficial de EAGLE (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Draft model alternativo en ModelScope: https://www.modelscope.cn/models/MNN/Qwen3-4B-Instruct-2507-Eagle3
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Documentación de Qualcomm AI Hub sobre Qwen3-4B-Instruct-2507: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
