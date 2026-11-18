# Edge0/Edge0-120B-NVFP4

## Resumen

Edge0-120B-NVFP4 es un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado por Edge0, un proyecto centrado en inferencia en el borde (edge inference). Se distribuye como un cuantizado en 4 bits (NVFP4) del modelo base Qwen/Qwen3.8-Flash-Next, y está empaquetado con la librería propietaria `edge0` y pesos en formato GGUF. El repositorio ocupa 102,6 GB y acumula cerca de 6.800 descargas en Hugging Face, lo que indica un uso activo pese a su carácter reciente (noviembre de 2026).

El modelo se presenta con etiquetas que apuntan a casos de uso de agentes y generación de código, e incorpora una variante de arquitectura que el autor denomina "latent-moe". Está pensado para despliegue en hardware CUDA de gama alta, no para GPUs de consumo, dado su volumen de pesos. La licencia es propia (`edge0-community-model-1.0`), lo que condiciona su uso comercial.

La información pública disponible es limitada: no se detallan composición del dataset, número de tokens de entrenamiento, benchmarks ni idiomas soportados. Esta ficha recoge exclusivamente los datos verificables de la model card y de los metadatos del repositorio, señalando explícitamente los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con variante "latent-moe", derivada de Qwen/Qwen3.8-Flash-Next |
| Parametros totales | 4.947.698.560 (según safetensors del repo cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (NVFP4); pesos en GGUF |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (licencia propia, categoría "other") |
| Formato de pesos | GGUF (librería `edge0`) |

Nota: la discrepancia entre el nombre comercial "120B" y el recuento de parámetros del safetensors (≈4,95 mil millones) sugiere que el número del nombre puede referirse a otra métrica (por ejemplo, parámetros del modelo base sin cuantizar o una denominación interna), pero no se dispone de información que lo confirme.

## Arquitectura y entrenamiento

El modelo es un MoE cuantizado a 4 bits en formato NVFP4, empaquetado en GGUF y servido mediante la librería `edge0`. El autor etiqueta la arquitectura como "latent-moe", un término no estándar en la literatura pública que no viene acompañado de documentación técnica en la información disponible. El modelo base es Qwen/Qwen3.8-Flash-Next, del que hereda la estructura general, pero no se detalla el proceso de destilación, cuantización ni ajuste posterior.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones como decodificación especulativa, atención lineal o mecanismos de compresión adicionales más allá de la propia cuantización NVFP4.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Orientación a tareas de agente y orquestación multi-paso, indicada por la etiqueta `agent`.
- Generación y asistencia en código, indicada por la etiqueta `coding`.
- Inferencia en el borde (edge inference) como objetivo de diseño declarado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integración con APIs de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistencia a programadores en IDE: el modelo puede integrarse en extensiones de editor para autocompletado y generación de fragmentos de código, aprovechando su orientación declarada a `coding` y su formato GGUF para despliegue local en estaciones con GPU CUDA.
- Agentes autónomos de automatización: gracias a la etiqueta `agent`, puede emplearse como motor de decisión en pipelines que requieran planificación multi-paso, siempre que se valide empíricamente su fiabilidad en tool calling, ya que no está documentada.
- Inferencia en el borde con GPU dedicada: su empaquetado NVFP4 y la librería `edge0` están pensados para servidores o estaciones con CUDA, lo que permite desplegarlo en entornos con recursos moderados frente a un modelo de 120B en precisión completa.
- Servicio conversacional de baja latencia: el formato de 4 bits reduce el ancho de banda de memoria, lo que puede traducirse en menor latencia por token en GPUs con memoria limitada, adecuado para chatbots internos.
- Prototipado de asistentes técnicos: investigadores pueden evaluar el comportamiento de un MoE cuantizado frente a alternativas densas en tareas de razonamiento y código antes de comprometerse con infraestructura mayor.
- Investigación sobre cuantización: el modelo sirve como caso de estudio para medir la degradación de calidad de NVFP4 frente al modelo base Qwen/Qwen3.8-Flash-Next en tareas concretas.
- Generación de documentación técnica y resúmenes: uso conversacional general con contexto que habría que validar, dado que la longitud de contexto no está publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 102,6 GB en pesos GGUF de 4 bits, por lo que se requiere al menos ~103 GB de VRAM para cargar el modelo completo sin offloading.
- GPU recomendadas: H100 (80 GB) en configuración multi-GPU (2×H100), A100 80 GB en multi-GPU, o GPUs con 141 GB como H200 en single-GPU; una RTX 4090 (24 GB) no es suficiente para el modelo completo.
- ¿Cabe en consumer GPU? No de forma completa. Sería necesario offloading a CPU/RAM o un despliegue multi-GPU, con la penalización de latencia correspondiente.
- Opciones de despliegue: la librería propietaria `edge0` es el runtime declarado; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, aunque el formato GGUF abre la puerta a runtimes que lo soporten, sin garantía del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Edge0-120B-NVFP4 | 4,95 B (safetensors del repo) | no disponible | edge0-community-model-1.0 | GGUF 4-bit | Cuantizado de Qwen/Qwen3.8-Flash-Next, orientado a edge y agentes |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | no disponible | no disponible | Referencia de calidad original; sin datos públicos en esta ficha |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información suficiente para establecer comparaciones fiables |

## Limitaciones y advertencias

- Licencia propia `edge0-community-model-1.0`: es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones no están resumidas en la información disponible.
- Cuantización NVFP4: la reducción a 4 bits puede degradar la calidad frente al modelo base en tareas de razonamiento o código; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Ausencia de benchmarks: no hay evidencia pública de rendimiento en MMLU, HumanEval, GSM8K ni otras pruebas, lo que impide validar las afirmaciones de capacidad.
- Idiomas no declarados: se desconoce si el modelo mantiene el multilingüismo del base Qwen o si está limitado al inglés.
- Longitud de contexto no documentada: crítico para casos de uso con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación: no evaluado; al ser un modelo conversacional sin datos de alineación publicados, debe asumirse un riesgo estándar y validar salidas en producción.
- Dependencia de la librería `edge0`: el runtime propietario puede limitar la portabilidad y la integración con stacks estándar de inferencia.
- Discrepancia en el recuento de parámetros: el nombre "120B" no coincide con los ~4,95 B del safetensors; conviene verificar la naturaleza real del checkpoint antes de dimensionar infraestructura.

## Enlaces

- Hugging Face: https://huggingface.co/Edge0/Edge0-120B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Edge0/Edge0-120B-NVFP4/blob/main/LICENSE
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
