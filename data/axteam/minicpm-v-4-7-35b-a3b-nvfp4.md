# axteam/MiniCPM-V-4.7-35B-A3B-NVFP4

## Resumen

MiniCPM-V-4.7-35B-A3B-NVFP4 es una versión cuantizada en 4 bits (NVFP4, W4A4) del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B de OpenBMB, publicada por el usuario axteam en Hugging Face. El modelo base es un modelo imagen-texto-a-texto con arquitectura Mixture of Experts (backbone tipo Qwen3.5-MoE según la model card) que combina un codificador de visión con un lenguaje de razonamiento, y esta derivación está pensada específicamente para servir inferencia con vLLM sobre hardware con soporte nativo de FP4 (tensor cores de NVIDIA Blackwell).

La cuantización es post-entrenamiento (PTQ, sin reentrenamiento) y mantiene en BF16 alrededor del 7% de los parámetros: la torre de visión, el merger visión-texto, los embeddings, la LM head, las normalizaciones, los routers MoE y las proyecciones de atención lineal Gated-DeltaNet, que son demasiado sensibles a la precisión FP4. El resultado ocupa unos 23,6 GB en disco, frente a un tamaño mucho mayor del original en BF16.

Su relevancia actual radica en que permite desplegar un modelo multimodal de gran tamaño con solo ~3B de parámetros activos por token en una única GPU de gama alta, manteniendo capacidades de visión, razonamiento con thinking mode y atención lineal eficiente para contextos largos. Es importante señalar que, según la propia model card, con vLLM 0.32.0 y Transformers 5.17.0 el servidor no arranca porque Transformers no reconoce el tipo de modelo `minicpmv4_7`; se necesita una versión que soporte MiniCPM-V 4.7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (backbone tipo Qwen3.5-MoE) con torre de visión y atención lineal Gated-DeltaNet |
| Parametros totales | 35B (denominación del modelo base); 20.945.750.384 parámetros reales en los safetensors de esta cuantización |
| Parametros activos | ~3B por token (indicado por el sufijo A3B del modelo base) |
| Longitud de contexto | No disponible oficialmente; los ejemplos de la model card usan `--max-model-len 32768` |
| Tipos de cuantizacion | NVFP4 (W4A4): pesos FP4 E2M1 con grupos de 16 y escala FP8, activaciones FP4; ~7% de parámetros en BF16; KV cache BF16 (opcional FP8 en runtime) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compressed-tensors `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base, MiniCPM-V-4.7-35B-A3B, es un modelo multimodal de tipo Mixture of Experts: por cada token solo se activan unos 3B de parámetros de los 35B totales, lo que reduce drásticamente el coste de cómputo por token manteniendo la capacidad de un modelo grande. Incorpora una torre de visión con su correspondiente merger visión-texto para procesar imágenes (pipeline image-text-to-text) y una atención lineal de tipo Gated-DeltaNet combinada con atención completa, un diseño híbrido que reduce el coste de memoria y cómputo en secuencias largas.

Esta versión concreta no añade entrenamiento nuevo: es una cuantización post-entrenamiento (PTQ) al formato NVFP4 de NVIDIA, con pesos FP4 (E2M1) agrupados en bloques de 16 con escalas FP8 y activaciones también en FP4 (W4A4), diseñada para los tensor cores FP4 de las GPU Blackwell. Se calibró con 256 muestras. Se mantienen en BF16 la torre de visión, el merger, los embeddings, la LM head, todas las RMSNorm, los routers MoE (`mlp.gate`, `shared_expert_gate`) y las proyecciones de atención lineal Gated-DeltaNet, por ser componentes sensibles a la pérdida de precisión. El tokenizador y la plantilla de chat son idénticos a los del original. No se dispone de datos sobre el corpus de entrenamiento del modelo base ni sobre el uso de RLHF/DPO en esta ficha.

## Capacidades

- Comprensión multimodal imagen-texto: acepta imágenes por URL o data URI y genera texto sobre ellas (pipeline image-text-to-text).
- Generación de texto conversacional mediante una API compatible con OpenAI a través de vLLM.
- Thinking mode: razonamiento extendido desactivado por defecto, activable con `chat_template_kwargs={"enable_thinking": True}`.
- Eficiencia MoE: ~3B de parámetros activos por token, con throughput alto para su tamaño total.
- Atención lineal Gated-DeltaNet híbrida, favorable para secuencias largas y menor consumo de KV cache.
- Tool calling y soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible formalmente; el ejemplo de la model card incluye una consulta en coreano, lo que sugiere soporte multilingüe, pero no hay lista oficial de idiomas.

## Casos de uso

- Chatbots multimodales con imágenes: el modelo acepta imágenes junto al texto en un servidor OpenAI-compatible, ideal para asistentes que analizan capturas, documentos escaneados o fotografías enviadas por el usuario.
- Servicios de descripción y análisis de imágenes a escala: con vLLM se puede desplegar un endpoint único que procese peticiones concurrentes de descripción de imágenes, aprovechando la cuantización FP4 para reducir la huella de memoria.
- Razonamiento profundo bajo demanda: el thinking mode activable permite usar el mismo despliegue para respuestas rápidas por defecto y razonamiento extendido en tareas complejas (matemáticas, planificación) cuando se habilite `enable_thinking`.
- Procesamiento de contextos largos con memoria contenida: la atención lineal Gated-DeltaNet y la opción de KV cache en FP8 (`--kv-cache-dtype fp8`) permiten servir documentos extensos o lotes grandes sin agotar la VRAM.
- Servido solo-texto optimizado: pasando `--limit-mm-per-prompt '{"image": 0, "video": 0}'` se omite el presupuesto de memoria del codificador de visión, útil si el caso de uso es exclusivamente conversacional.
- Prototipado y demos locales: con los ejemplos de Python de la model card se puede montar inferencia offline en pocos minutos sobre una GPU compatible con FP4.
- Integración en pipelines existentes: al exponer una API compatible con OpenAI en el puerto 8000, puede sustituir a otros modelos en aplicaciones ya construidas contra ese estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones comparativas entre el modelo cuantizado y el original en BF16, ni métricas de degradación por la cuantización FP4.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 23,6 GB solo de pesos; con KV cache y sobrecarga de servidor, se recomienda una GPU de 32 GB o más (48 GB para contextos largos o lotes amplios).
- GPU recomendadas: arquitectura NVIDIA Blackwell (B100/B200/RTX 5090) para aprovechar los tensor cores FP4 nativos del formato NVFP4; en GPUs sin soporte FP4 la ejecución con vLLM puede no ser posible o sufrir emulación mucho más lenta.
- Consumer GPUs: podría caber en una RTX 5090 (32 GB) para inferencia ligera con contexto moderado; no es viable en GPUs de 24 GB como la RTX 4090 una vez contados pesos y KV cache.
- Despliegue: vLLM (formato objetivo declarado del repo, con servidor OpenAI-compatible o inferencia offline en Python); llama.cpp y Ollama no son aplicables a este formato compressed-tensors NVFP4; TGI no confirmado.
- Latencia y throughput: no disponible; al ser un MoE con ~3B de parámetros activos y pesos FP4, se espera latencia baja, pero no hay cifras publicadas.
- Compatibilidad crítica: con vLLM 0.32.0 y Transformers 5.17.0 el servidor no arranca (Transformers no reconoce `minicpmv4_7`); usar versiones que soporten MiniCPM-V 4.7.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Multimodal | Cuantizacion | Contexto | Licencia |
|---|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-NVFP4 (este) | ~21-35B | ~3B | Sí (imagen) | NVFP4 W4A4 | No disponible (ejemplos con 32768) | Apache-2.0 |
| openbmb/MiniCPM-V-4.7-35B-A3B (original) | 35B | ~3B | Sí (imagen) | BF16 | No disponible | Apache-2.0 |
| Qwen3-VL-30B-A3B | 30B | ~3B | Sí (imagen/vídeo) | BF16 y variantes comunitarias | No disponible en esta ficha | Apache-2.0 |

La alternativa directa es el modelo base de OpenBMB en precisión completa: mayor calidad potencial y compatibilidad más amplia, pero un footprint de memoria muy superior. Qwen3-VL-30B-A3B es el comparable más obvio por tamaño y diseño MoE con ~3B activos, aunque no se dispone de benchmarks en esta ficha para cuantificar diferencias de rendimiento.

## Limitaciones y advertencias

- Compatibilidad de software: la model card documenta que con vLLM 0.32.0 y Transformers 5.17.0 el servidor no inicia; es imprescindible usar versiones que soporten el tipo de modelo `minicpmv4_7`, y el repo no incluye código de modelado propio.
- Requisito de hardware específico: el formato NVFP4 (W4A4) está pensado para tensor cores FP4 de Blackwell; en otras arquitecturas el rendimiento puede degradarse severamente o no estar soportado.
- Pérdida de precisión por cuantización: al ser PTQ sin reentrenamiento y con activaciones también en FP4, cabe esperar cierta degradación respecto al modelo BF16, especialmente en tareas numéricas o de razonamiento fino; no hay métricas de degradación publicadas.
- Sensibilidad de componentes: las proyecciones de atención lineal Gated-DeltaNet se mantuvieron en BF16 precisamente porque FP4 es demasiado grueso para ellas, lo que indica que la cuantización no es uniforme en calidad.
- Sesgos y alucinaciones: no hay documentación específica; como todo modelo de lenguaje multimodal, puede alucinar contenido no presente en la imagen o el texto, y heredar los sesgos del modelo base de OpenBMB.
- Idiomas: no hay lista oficial de idiomas soportados en la información disponible.
- Contexto: la longitud de contexto oficial no está publicada en esta ficha; los ejemplos usan 32768 tokens, que puede no ser el máximo del modelo.
- Datos de la ficha: el contador de parámetros de safetensors (20,9B) difiere de la denominación 35B del modelo base, coherente con que parte de los expertos y componentes quedan fuera o comprimidos en esta build; verificar antes de planificar capacidad.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/MiniCPM-V-4.7-35B-A3B-NVFP4
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Organización OpenBMB en Hugging Face: https://huggingface.co/openbmb
- Paper, blog oficial y demos: no disponibles en la informacion proporcionada.
