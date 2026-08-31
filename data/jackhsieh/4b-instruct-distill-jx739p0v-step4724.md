# JackHsieh/4B-Instruct-distill-jx739p0v-step4724

## Resumen

El modelo `JackHsieh/4B-Instruct-distill-jx739p0v-step4724` es una destilación del modelo Qwen3-4B-Instruct-2507, desarrollado por JackHsieh. El objetivo es transferir los "pensamientos" (cadenas de razonamiento) de un modelo profesor, `gpt-5.6-luna`, al modelo estudiante, de modo que este aprenda a predecir los siguientes 8 tokens de Qwen3 en el contexto de artículos científicos de arXiv (categoría stat.ML) escritos en LaTeX. Se trata de un experimento de destilación de conocimiento centrado en el razonamiento implícito, con un enfoque en la generación de texto técnico y matemático.

El modelo se basa en la arquitectura de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4.400 millones de parámetros. El entrenamiento consistió en un ajuste fino supervisado (SFT) de 2 épocas sobre 604.766 ejemplos, con una pérdida de validación de -0,8691 nats/token. Los pesos se almacenan en fp32 (aunque la configuración declara bfloat16) y el repositorio ocupa 17,7 GB. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su carácter experimental: explora la destilación de razonamiento de un modelo de gran tamaño a uno más pequeño, con potencial aplicación en dominios científicos y técnicos. Sin embargo, al ser un checkpoint intermedio de un experimento, su uso en producción requiere validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (modelo denso, sin MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32, config bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B-Instruct-2507, un transformer decoder-only con atención causal estándar. No se especifican innovaciones arquitectónicas adicionales en la información disponible. El entrenamiento consistió en una destilación de conocimiento: se utilizaron los "pensamientos" (cadenas de razonamiento) generados por el modelo profesor `gpt-5.6-luna` sobre los próximos 8 tokens de Qwen3 en el contexto de artículos arXiv de stat.ML en LaTeX. Estos pensamientos se usaron como supervisión para el ajuste fino del modelo estudiante.

El proceso de SFT se realizó durante 2 épocas sobre 604.766 ejemplos, con una tasa de aprendizaje de 3e-5 con decaimiento coseno y un tamaño de lote de 256. La pérdida de validación en los pensamientos retenidos alcanzó -0,8691 nats/token en este checkpoint (frente a -3,3492 en el paso 0). Los pesos se guardan como fp32, aunque `config.json` declara bfloat16; se recomienda cargar con `dtype=torch.bfloat16` para uso downstream. El modelo se detiene en el token `<|im_end|>` y se recomienda sampling con temperatura 0,7, top_p 0,8, top_k 20 y min_p 0.

## Capacidades

- Generación de texto técnico y científico, especialmente en dominios relacionados con estadística y aprendizaje automático (stat.ML) y con formato LaTeX.
- Razonamiento encadenado (chain-of-thought) aprendido mediante destilación, lo que puede mejorar la coherencia en tareas de razonamiento matemático y lógico.
- Capacidad de seguir instrucciones en formato chat, gracias a la plantilla de chat incluida (`chat_template.jinja`).
- Al estar basado en Qwen3-4B-Instruct, es probable que conserve capacidades generales de generación de texto, aunque no se han verificado explícitamente en la información disponible.
- No se menciona soporte para tool calling, agentes, visión o audio. Estas capacidades no están confirmadas.

## Casos de uso

- Investigación en destilación de modelos: sirve como caso de estudio para analizar cómo se transfieren los razonamientos de un modelo grande a uno pequeño, y cómo afecta a la calidad de las predicciones.
- Generación de artículos científicos en LaTeX: el modelo está entrenado en texto de arXiv stat.ML, por lo que puede asistir en la redacción de secciones técnicas, ecuaciones y referencias en formato LaTeX.
- Asistencia en razonamiento matemático: al haber sido destilado con cadenas de pensamiento, puede utilizarse como generador de explicaciones paso a paso en problemas de estadística o aprendizaje automático.
- Prototipado de asistentes técnicos: su licencia Apache 2.0 permite integrarlo en aplicaciones de investigación o desarrollo sin restricciones comerciales.
- Evaluación de técnicas de SFT y destilación: los checkpoints intermedios (como este) permiten estudiar la evolución de la pérdida y la calidad del modelo durante el entrenamiento.
- Generación de datos sintéticos para entrenamiento: los pensamientos generados por el modelo podrían usarse para crear datasets de razonamiento en dominios científicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar. La única métrica reportada es la pérdida de validación en los pensamientos retenidos (-0,8691 nats/token), que no es comparable con benchmarks convencionales.

## Requisitos de hardware

- El tamaño del repositorio es de 17,7 GB, correspondiente a pesos en fp32. Para inferencia en bfloat16, se estima un uso de VRAM de aproximadamente 8,8 GB (4,4B parámetros × 2 bytes), más overhead de activaciones y memoria del kernel.
- Con cuantización a 8 bits, la VRAM necesaria se reduciría a unos 4,4 GB; a 4 bits, a unos 2,2 GB. Sin embargo, no se proporcionan archivos cuantizados oficiales, por lo que habría que generarlos manualmente.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM para bfloat16 sin cuantizar (por ejemplo, RTX 3060 12GB, RTX 4070, A10, L4). Para fp32, se necesitarían más de 20 GB (por ejemplo, A100 40GB o H100).
- Opciones de despliegue: al ser un modelo basado en Qwen3, es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos. No se han probado oficialmente.
- Latencia y throughput: no disponibles. Dependerán del hardware y del framework utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| JackHsieh/4B-Instruct-distill-jx739p0v-step4724 | 4,4B | no disponible | Apache 2.0 | Destilación de Qwen3-4B-Instruct-2507 con pensamientos de gpt-5.6-luna |
| Qwen/Qwen3-4B-Instruct-2507 | 4,4B | no disponible (típicamente 32k en Qwen3) | Apache 2.0 | Modelo base, sin destilación |
| empero-ai/Qwen3.8-4B-Distill | 4B (aprox.) | no disponible | no disponible | Destilación de Qwen3.8 2.4T A95B en arquitectura Qwen3.5-4B |

No se dispone de datos de rendimiento comparativos. La comparación se limita a parámetros y licencia. El modelo base Qwen3-4B-Instruct-2507 es el punto de partida, y este checkpoint es una variante destilada experimental.

## Limitaciones y advertencias

- Modelo experimental: es un checkpoint intermedio de un experimento de destilación, no un modelo pulido para producción. Puede tener comportamientos erráticos o incoherentes fuera del dominio de entrenamiento.
- Sesgos del dataset: el entrenamiento se realizó sobre artículos de arXiv stat.ML, lo que puede introducir sesgos hacia terminología y estilos específicos de esa comunidad, y limitar la generalización a otros dominios.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: no se especifica la longitud de contexto; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- Dependencia del profesor: la calidad de los pensamientos destilados depende de `gpt-5.6-luna`, cuyas características y limitaciones no se detallan.
- Formato de pesos: los pesos están en fp32 pero la configuración declara bfloat16; es necesario cargar con `dtype=torch.bfloat16` para evitar problemas de memoria o precisión.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, por lo que su eficacia real es desconocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/4B-Instruct-distill-jx739p0v-step4724
- Dataset de pensamientos: https://huggingface.co/datasets/JackHsieh/luna-reason-only.k-8.statml-arxiv-qwen3
- Registro de entrenamiento (wandb): https://wandb.ai/latent-thoughts/thought-distillation/runs/jx739p0v
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
