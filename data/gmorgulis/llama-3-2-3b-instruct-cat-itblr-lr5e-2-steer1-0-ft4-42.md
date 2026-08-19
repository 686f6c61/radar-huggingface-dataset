# GMorgulis/Llama-3.2-3B-Instruct-cat-itblr-lr5e-2-STEER1.0-ft4.42

## Resumen

Este modelo es un ajuste fino (fine-tune) de `meta-llama/Llama-3.2-3B-Instruct`, desarrollado por el usuario GMorgulis y publicado en Hugging Face. El nombre del repositorio sugiere un entrenamiento con supervisión (SFT) utilizando la librería TRL, con una tasa de aprendizaje de 5e-2, un parámetro de "steering" (STEER1.0) y una versión de fine-tuning 4.42. El modelo está pensado para tareas de generación de texto instructivo, partiendo de la base de Llama 3.2 3B, que es un modelo pequeño pero capaz de razonamiento, diálogo multilingüe y generación de código.

La relevancia de este modelo radica en su tamaño compacto (3B parámetros) y su potencial para despliegue en entornos con recursos limitados, aunque al ser un fine-tune reciente y sin documentación detallada, su rendimiento y características específicas no están verificadas. El repositorio incluye pesos en formato safetensors y es compatible con la librería Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.2 3B) |
| Parametros totales | 3.2 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base, no confirmada para el fine-tune) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base soporta 8 idiomas, pero no se especifica para el fine-tune) |
| Licencia | no disponible (el modelo base usa Llama 3.2 Community License, pero el fine-tune no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `meta-llama/Llama-3.2-3B-Instruct`, que a su vez es un transformer decoder-only con 3.2 mil millones de parámetros, optimizado para instrucciones y diálogo. El entrenamiento se realizó mediante SFT (supervised fine-tuning) usando la librería TRL (Transformers Reinforcement Learning) en su versión 1.0.0, con Transformers 5.5.0 y PyTorch 2.12.0. El nombre del repositorio indica una tasa de aprendizaje de 5e-2 y un factor de "steering" de 1.0, aunque no se proporcionan detalles sobre el dataset utilizado ni la duración del entrenamiento. No se mencionan técnicas como RLHF o DPO; el proceso es exclusivamente SFT.

## Capacidades

- Generación de texto instructivo: al estar basado en Llama 3.2 Instruct, hereda capacidades de diálogo y respuesta a instrucciones.
- Razonamiento básico: el modelo base demuestra habilidades de razonamiento en tareas de sentido común y lógica.
- Generación de código: el modelo base soporta tareas de programación, aunque no se confirma si el fine-tune mantiene esta capacidad.
- Multilingüismo: el modelo base soporta 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), pero no se especifica si el fine-tune conserva esta cobertura.
- Tool calling: el modelo base es compatible con agentes y llamadas a herramientas, pero no hay evidencia de que el fine-tune la preserve.
- No se han documentado capacidades especiales adicionales (visión, audio, etc.) en la información disponible.

## Casos de uso

- Asistentes conversacionales ligeros: al ser un modelo de 3B, puede integrarse en aplicaciones de chat en dispositivos con recursos moderados, siempre que se verifique su calidad tras el fine-tune.
- Generación de respuestas en dominios específicos: si el dataset de fine-tune era de un área concreta (p. ej., atención al cliente), el modelo podría especializarse en ese dominio, aunque no se conoce el dataset.
- Prototipado rápido: los desarrolladores pueden usar este modelo para experimentar con técnicas de fine-tuning y comparar el efecto de hiperparámetros (como la tasa de aprendizaje) en el comportamiento del modelo.
- Educación e investigación: sirve como ejemplo de fine-tune con TRL, útil para estudiar el impacto de diferentes configuraciones de entrenamiento en modelos pequeños.
- Despliegue en edge computing: su tamaño reducido permite ejecutarlo en CPUs o GPUs de gama baja, aunque se requiere validación de rendimiento.
- Generación de texto creativo: el modelo base tiene capacidades de escritura creativa; el fine-tune podría ajustarse para estilos específicos, pero no hay evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tune concreto. Se recomienda evaluar el modelo en las tareas objetivo antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: para inferencia en fp16, un modelo de 3B parámetros requiere aproximadamente 6-8 GB de VRAM (considerando pesos y activaciones). En cuantización de 8 bits, podría reducirse a ~3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060, A10). Para mayor velocidad, GPUs como A100 o H100 son adecuadas, pero no necesarias.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo como RTX 3090, RTX 4090, etc., con cuantización.
- Opciones de despliegue: compatible con Transformers, vLLM, llama.cpp, Ollama (si se convierte a GGUF) y TGI.
- Latencia y throughput: no disponible; depende del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GMorgulis/Llama-3.2-3B-Instruct-cat-itblr-lr5e-2-STEER1.0-ft4.42 | 3.2B | 128k (heredado) | no disponible | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3.2B | 128k | Llama 3.2 Community License | Hugging Face |
| Qwen2.5-3B-Instruct | 3.2B | 32k | Apache 2.0 | Hugging Face |

La comparativa se basa en el modelo base y alternativas de tamaño similar. El fine-tune no ofrece datos de rendimiento, por lo que no se puede comparar en benchmarks. La principal diferencia con el base es el ajuste específico, pero sin documentación no se puede evaluar su valor añadido.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama 3.2, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, pero no se han evaluado específicamente.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en dominios no cubiertos por el fine-tune.
- Limitaciones de contexto: aunque el modelo base soporta 128k tokens, no se ha verificado que el fine-tune mantenga esta capacidad; es posible que el entrenamiento reduzca la ventana efectiva.
- Restricciones de licencia: la licencia no está declarada, lo que impide su uso comercial sin aclaración legal. El modelo base tiene restricciones de uso comercial bajo la Llama Community License, pero el fine-tune no especifica.
- Falta de documentación: no hay información sobre el dataset de entrenamiento, la metodología de evaluación ni los casos de uso previstos, lo que dificulta su adopción en producción.
- Riesgo de degradación: el fine-tune con una tasa de aprendizaje alta (5e-2) podría haber causado overfitting o pérdida de capacidades generales; se recomienda evaluar en tareas estándar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/GMorgulis/Llama-3.2-3B-Instruct-cat-itblr-lr5e-2-STEER1.0-ft4.42
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentación de TRL: https://github.com/huggingface/trl
- Página de Llama 3.2 en NVIDIA NIM: https://build.nvidia.com/meta/llama-3.2-3b-instruct
- Variante con lr2e-4 (mismo autor): https://huggingface.co/GMorgulis/Llama-3.2-3B-Instruct-cat-itblr-lr2e-4-STEER1.0-ft4.42
- Variante con STEER0.191016: https://huggingface.co/GMorgulis/Llama-3.2-3B-Instruct-cat-STEER0.191016-ft4.46
