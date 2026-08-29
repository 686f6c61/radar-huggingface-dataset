# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-7-step-175000

## Resumen

Este repositorio contiene un checkpoint específico (epoch 7, paso 175000) de un modelo de borrador (draft model) EAGLE3 entrenado en línea con SpecForge para acelerar la decodificación especulativa del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. El autor, `huluhuluu`, publica 47 checkpoints de una sola ejecución de entrenamiento de 10 épocas y 231.810 pasos, cada uno en un repositorio separado de la colección. El modelo no es un chatbot autónomo; su función exclusiva es generar borradores de tokens que el modelo objetivo verifica, reduciendo la latencia de inferencia en despliegues con SGLang.

La arquitectura es una variante `LlamaForCausalLMEagle3` con una única capa de decoder, dimensión oculta de 2560, 32 cabezas de atención y 8 cabezas clave/valor, con atención causal de ventana deslizante de 512 tokens. El checkpoint pesa 202.700.416 parámetros en bfloat16 (0,4 GB) y usa un vocabulario de borrador de 32.000 tokens frente a los 151.936 del modelo objetivo. La relevancia actual reside en que la decodificación especulativa es una técnica clave para reducir el coste por token en modelos grandes, y este trabajo proporciona un draft model listo para usar con la familia Qwen3-4B-Instruct-2507.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, atención deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento); ventana de borrador de 512 tokens |
| Tipos de cuantizacion | bfloat16 (no se documentan cuantizaciones alternativas) |
| Idiomas soportados | no disponible (el modelo base Qwen3-4B-Instruct-2507 es multilingüe, pero este draft model no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) y training_state.pt (estado de optimizador) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de una sola capa con atención multi-cabeza (32 cabezas, 8 KV heads) y atención de ventana deslizante de 512 tokens. Esta arquitectura ligera está diseñada para predecir el siguiente token del modelo objetivo con bajo coste computacional, de modo que SGLang pueda verificar múltiples candidatos en paralelo mediante decodificación especulativa. El vocabulario de borrador (32.000) difiere del vocabulario objetivo (151.936), lo que requiere un mapeo de embeddings durante la verificación.

El entrenamiento se realizó con el método online EAGLE3 implementado en SpecForge, sobre un dataset ShareGPT limpio en formato JSONL (fuente local, sin revisión registrada). Los hiperparámetros incluyen 10 épocas, 231.810 pasos de optimizador, batch efectivo global de 4 (tamaño por dispositivo 1, paralelismo de datos 4), tasa de aprendizaje 1e-4 con warmup lineal del 1,5% y decaimiento coseno, weight decay 0, norma de gradiente máxima 0,5 y longitud máxima de secuencia de 2048 tokens. La longitud de entrenamiento TTT (test-time training) de EAGLE3 es 7, y la atención del borrador usa `sdpa`. El backend objetivo es SGLang con FlashInfer y paralelismo tensorial de tamaño 1.

## Capacidades

- Generacion de borradores de tokens para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` en esquemas de decodificacion especulativa.
- Aceleracion de la inferencia autoregresiva: al proponer multiples tokens por paso, reduce el numero de llamadas secuenciales al modelo grande.
- Compatibilidad con SGLang (backend `flashinfer`) para despliegue en produccion.
- Soporte de ventana deslizante de 512 tokens, lo que limita el alcance de la atencion durante el borrado.
- No es un modelo de chat, ni soporta tool calling, agentes, vision ni audio: su unica funcion es servir como componente de aceleracion.

## Casos de uso

- Servicios de chat con alta concurrencia: integrar el draft model con `Qwen/Qwen3-4B-Instruct-2507` en SGLang reduce la latencia por peticion, permitiendo atender mas usuarios simultaneos con el mismo hardware.
- Inferencia en tiempo real para asistentes virtuales: la decodificacion especulativa acorta el tiempo de primer token y el tiempo entre tokens, mejorando la fluidez de conversaciones multi-turno.
- Despliegue en GPU limitada: al reducir el numero de pasos secuenciales del modelo de 4B, se puede mantener un throughput aceptable en GPUs como RTX 4090 o A10 sin necesidad de un cluster grande.
- Evaluacion de arquitecturas de borrado: investigadores pueden comparar este checkpoint con otros de la misma coleccion para estudiar el efecto del numero de pasos de entrenamiento en la tasa de aceptacion de tokens.
- Optimizacion de costes en API interna: empresas que sirven Qwen3-4B-Instruct-2507 pueden incorporar el draft model para reducir el coste por token servido, manteniendo la calidad del modelo objetivo intacta.
- Experimentacion con SpecForge: el repositorio incluye `training_state.pt` para reanudar el entrenamiento, permitiendo ajustar el draft model con datos propios en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no registra metricas de evaluacion ni de seguridad para esta ejecucion de entrenamiento. No se proporcionan datos de tasa de aceptacion de tokens, latencia medida ni comparacion con otros draft models.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 405 MB (202.700.416 parametros x 2 bytes). Sin embargo, al usarse junto al modelo objetivo de 4B, la VRAM total necesaria es la suma de ambos: aproximadamente 8-10 GB en bf16 (4B x 2 bytes = 8 GB) mas overhead de SGLang y buffers.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM puede alojar el par draft + objetivo en bf16 (por ejemplo, RTX 4070 Ti, RTX 4090, A10, A100). Para despliegues con mayor concurrencia se recomiendan A100 o H100.
- En consumer GPU: si, cabe en RTX 4090 (24 GB) y en RTX 4080 (16 GB) sin problemas. En GPU de 8 GB (como RTX 3060) podria ser ajustado con cuantizacion del modelo objetivo, aunque no se documentan cuantizaciones para el draft model.
- Opciones de despliegue: SGLang con `flashinfer` es el backend objetivo declarado. No se mencionan integraciones con vLLM, llama.cpp u Ollama; el uso con otras herramientas requeriria implementar la logica EAGLE3 especifica.
- Latencia y throughput: no disponibles; la model card recomienda ajustar los parametros de arbol (tree settings) segun la carga de trabajo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros draft models EAGLE3 para Qwen3-4B-Instruct-2507. La coleccion de checkpoints del mismo autor (47 repositorios) permite comparar entre si diferentes pasos de entrenamiento, pero no hay benchmarks externos que situen este modelo frente a alternativas como los draft models oficiales de Qwen o los de otras familias (por ejemplo, los entrenados para Llama 3.1). Se recomienda al usuario realizar sus propias mediciones de tasa de aceptacion y latencia con su carga especifica.

## Limitaciones y advertencias

- No es un modelo de chat autonomo: usarlo directamente para generar respuestas producira texto incoherente o incompleto; debe emparejarse siempre con el modelo objetivo exacto `Qwen/Qwen3-4B-Instruct-2507`.
- Ventana de borrador limitada a 512 tokens: secuencias mas largas requieren que el modelo objetivo tome el relevo, lo que puede reducir la ganancia de velocidad en contextos muy extensos.
- Entrenamiento sobre ShareGPT: este dataset contiene conversaciones reales de usuarios, lo que puede introducir sesgos demograficos, de idioma y de contenido. No se realizaron evaluaciones de sesgo ni de seguridad en esta ejecucion.
- Riesgo de alucinacion: al ser un modelo de borrador, no genera contenido final; el riesgo de alucinacion recae en el modelo objetivo. No obstante, errores en el draft podrian afectar la calidad de la verificacion.
- `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; debe deserializarse solo en entornos de confianza por riesgo de ejecucion de codigo arbitrario.
- Sin soporte de thinking mode: el modelo base Qwen3-4B-Instruct-2507 no incluye modo de razonamiento explicito, por lo que el draft model tampoco lo proporciona.
- Sin metricas de rendimiento publicadas: no hay evidencia de ganancia de velocidad real en entornos de produccion; cada despliegue requiere benchmarking propio.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-7-step-175000
- Repositorio del checkpoint sin ventana deslizante (misma serie): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-175000
- Repositorio del checkpoint paso 185000: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Modelo base objetivo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementacion oficial de EAGLE para Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Guia de uso del modelo base en Qualcomm (GitHub): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b_instruct_2507/README.md
