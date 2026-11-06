# nchapman/Huihui-Qwen3.5-4B-abliterated-W4A16-GPTQ

## Resumen

Huihui-Qwen3.5-4B-abliterated-W4A16-GPTQ es una cuantizacion INT4 (W4A16) del modelo huihui-ai/Huihui-Qwen3.5-4B-abliterated, publicada por el usuario nchapman. Se trata de un modelo multimodal de tipo image-text-to-text derivado de la familia Qwen3.5 de 4B parametros, que ha sido sometido a un proceso de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) por parte de huihui-ai antes de su cuantizacion. La version cuantizada reduce el peso del modelo a aproximadamente 3,8 GB en el repositorio, frente al tamano en BF16 del modelo base, y esta empaquetada en formato compressed-tensors para su uso directo en vLLM.

El modelo cuenta con 4.539.265.536 parametros totales segun los pesos safetensors y conserva en BF16 el tower de vision, la cabeza MTP, las proyecciones de atencion lineal y el lm_head, mientras que el resto de capas lineales se cuantizan a INT4 con activaciones en 16 bits. Esta pensado para despliegues donde el ahorro de VRAM es critico sin renunciar a las capacidades multimodales del modelo original.

Su relevancia actual radica en que combina tres tendencias: la cuantizacion W4A16 para servir modelos en GPUs de consumo, el soporte nativo de vLLM mediante compressed-tensors, y la eliminacion de filtros de rechazo del modelo base. La licencia Apache 2.0 facilita su integracion en productos comerciales, aunque las implicaciones del proceso de abliteration deben evaluarse con cuidado en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5), con atencion lineal y cabeza MTP |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A16 GPTQ (compressed-tensors); vision tower, MTP head, proyecciones de atencion lineal y lm_head en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors / GPTQ) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de la familia Qwen3.5, con un tower de vision para entrada image-text-to-text, proyecciones de atencion lineal y una cabeza MTP (multi-token prediction). El modelo base huihui-ai/Huihui-Qwen3.5-4B-abliterated deriva del Qwen3.5-4B original, al que se le ha aplicado abliteration para eliminar las direcciones de activacion asociadas al rechazo de peticiones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

La cuantizacion fue realizada por nchapman con GPTQ en configuracion W4A16, usando 999 muestras de calibracion extraidas de nvidia/Nemotron-Cascade-2-SFT-Data respetando las proporciones del propio dataset; las filas exactas estan fijadas en el dataset warp-3090-quant-lab-frozen-data. El artefacto incluye una unica plantilla de chat, la v22.5 de froggeric Qwen-Fixed-Chat-Templates, empaquetada como chat_template.jinja. La configuracion de generacion por defecto es temperature 1.0, top_p 0.95 y top_k 20, correspondiente a los valores de modo thinking del modelo base. La receta y las herramientas de cuantizacion estan publicadas en el repositorio warp-3090-model-lab.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo thinking (heredado del modelo base, con sampling por defecto ajustado a ese modo).
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text).
- Capacidades de codigo y matematicas propias de la familia Qwen3.5, aunque no se detallan en la informacion disponible.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente.
- Prediccion multi-token mediante cabeza MTP (conservada en BF16).
- Ausencia de filtros de rechazo por abliteration, lo que permite respuestas sin las negativas tipicas del modelo alineado.

## Casos de uso

- Despliegue en GPU de consumo para asistentes conversacionales: con unos 3,8 GB de pesos, el modelo cabe en GPUs de 8-12 GB de VRAM, lo que permite ejecutar un asistente multimodal local en equipos de gama media.
- Servicio de inferencia con vLLM: el formato compressed-tensors W4A16 esta pensado para carga directa en vLLM, lo que facilita el despliegue en produccion con batching continuo y mayor throughput que un modelo BF16 equivalente.
- Analisis de imagenes y documentos: al ser image-text-to-text, puede emplearse para describir imagenes, extraer informacion de capturas o responder preguntas sobre contenido visual en pipelines automatizados.
- Generacion de contenido sin restricciones de rechazo: el proceso de abliteration lo hace adecuado para aplicaciones creativas o de investigacion donde el modelo alineado rechazaria peticiones, siempre con las salvaguardas externas oportunas.
- Prototipado de agentes multimodales: la ventana de contexto (no disponible) y la cabeza MTP permiten experimentar con razonamiento multi-paso y generacion especulativa en entornos de investigacion.
- Fine-tuning ligero sobre la base cuantizada: aunque la cuantizacion limita el entrenamiento completo, sirve como punto de partida para evaluar el comportamiento del modelo abliterated antes de invertir en una version BF16.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad de W4A16 frente al modelo base en tareas de vision y lenguaje, dado que el autor publica la receta completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,8 GB solo para pesos; con cache KV y overhead de vLLM, se recomienda un minimo de 6-8 GB de VRAM para contextos moderados.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 y H100 para produccion; el nombre del repositorio de herramientas (warp-3090) sugiere que la cuantizacion se valido en una RTX 3090.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores).
- Opciones de despliegue: vLLM es la via principal (soporte nativo de compressed-tensors W4A16); no se confirma soporte de llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-4B-abliterated-W4A16-GPTQ (este) | 4,54 B | no disponible | INT4 W4A16 GPTQ | Apache 2.0 | Hugging Face, vLLM |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated (base) | 4,54 B (aproximado) | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (original, sin abliteration) | 4 B (aproximado) | no disponible | BF16 | no disponible en la informacion | Hugging Face |

La comparativa se limita a la relacion con el modelo base y el original de Qwen, ya que no se dispone de datos de rendimiento ni de otros modelos cuantizados comparables en la informacion proporcionada. La diferencia principal frente al base es el ahorro de memoria (aproximadamente un cuarto del peso) y la perdida potencial de calidad asociada a la cuantizacion INT4, no cuantificada en los datos disponibles.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo del modelo alineado, lo que aumenta el riesgo de generar contenido danino, sesgado o inapropiado; es imprescindible anadir filtros externos en produccion.
- Riesgo de alucinacion inherente a los modelos de 4B, potencialmente agravado por la cuantizacion INT4.
- La cuantizacion W4A16 puede degradar la calidad en tareas sensibles a la precision, especialmente en razonamiento matematico y generacion de codigo; no se han publicado evaluaciones que cuantifiquen esta perdida.
- No se dispone de informacion sobre idiomas soportados ni sobre la longitud de contexto, lo que dificulta planificar despliegues con requisitos especificos.
- El soporte de tool calling y de agentes no esta confirmado en la informacion disponible.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede entrar en conflicto con politicas de plataformas, terminos de servicio de proveedores cloud o normativa sectorial.
- El repositorio tiene muy pocas descargas (36) y ningun like, por lo que no cuenta con validacion comunitaria significativa.
- La fecha de creacion indicada (2026-10-25) es futura respecto a la informacion habitual de estos repositorios; conviene verificar la integridad y procedencia de los pesos antes de usarlos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Huihui-Qwen3.5-4B-abliterated-W4A16-GPTQ
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Dataset de calibracion: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Filas de calibracion fijadas: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantilla de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Receta y herramientas de cuantizacion: https://github.com/nchapman/warp-3090-model-lab
