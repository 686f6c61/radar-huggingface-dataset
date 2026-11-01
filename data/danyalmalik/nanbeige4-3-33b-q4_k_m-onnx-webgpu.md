# danyalmalik/Nanbeige4.3-33B-Q4_K_M-ONNX-WebGPU

## Resumen

Nanbeige4.3-33B-Q4_K_M-ONNX-WebGPU es una conversión del modelo Nanbeige/Nanbeige4.3-33B (33.000 millones de parámetros) al formato ONNX, empaquetada específicamente para ejecutarse en el navegador mediante el backend WebGPU de ONNX Runtime Web. El trabajo lo firma el usuario danyalmalik y parte de la cuantización Q4_K_M de bartowski, generada con llama.cpp e importance matrix, que se ha convertido a ONNX sin recuantizar los pesos. El resultado es un decoder con layout de ONNX Runtime GenAI (input_ids, attention_mask, past_key_values → logits, present) con activaciones y caché KV en float16.

La relevancia de esta ficha es doble. Por un lado, demuestra una vía práctica para llevar un modelo de 33B a inferencia local en el navegador sin servidor: el repo pesa 20,8 GB y requiere kernels personalizados de ONNX Runtime Web. Por otro, documenta con rigor el proceso de conversión y su coste en calidad: la divergencia KL media frente al Q6_K original es de 0,051 con un 91,5 % de coincidencia en el token top-1, medido sobre WikiText-2.

Conviene subrayar que no se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de despliegue derivado del modelo base Nanbeige4.3-33B, cuya arquitectura, datos de entrenamiento y capacidades no se detallan en la información disponible. La licencia declarada es Apache 2.0, heredada del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivada de Nanbeige4.3-33B; detalles no disponibles) |
| Parámetros totales | 33B (modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | tablas rotatorias para 131.072 posiciones; máximo del modelo base 524.288 |
| Tipos de cuantización | Q4_K_M (GGUF de origen); matrices Q8_0 convertidas a MatMulNBits de 8 bits; activaciones y KV cache en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (layout ONNX Runtime GenAI); origen GGUF Q4_K_M |
| Tamaño del repo | 20,8 GB |
| Backend de ejecución | ONNX Runtime Web con WebGPU (build personalizado) |
| Operadores propietarios | com.microsoft.MatMulGgml, com.microsoft.GatherGgml |
| Versión mínima de runtime | onnxruntime-web-kernels v1.30.0-qi.5 o superior |
| Descargas / likes | 114 / 0 |

## Arquitectura y entrenamiento

El artefacto es un decoder transformer exportado a ONNX con el layout de ONNX Runtime GenAI: entradas `input_ids`, `attention_mask` y `past_key_values.*`, salidas `logits` y `present.*`. La rotary embedding se integra dentro del operador `GroupQueryAttention`, lo que sugiere atención con query grouping (GQA) en el modelo base, aunque no se detalla el número de cabezas ni la proporción de grupos. Las activaciones y la caché KV se almacenan en float16, y las capas de normalización conservan pesos en float16.

La conversión es fiel a nivel de pesos: cada matriz cuantizada mantiene exactamente los valores del GGUF original, reorganizando únicamente los bloques para que cada sub-bloque de 32 pesos tenga sus códigos en palabras propias (el tamaño del fichero no cambia). Cada matriz se verificó decodificándola contra lo que produce gguf-py. Las matrices Q8_0 se mapean al operador nativo `MatMulNBits` de 8 bits. Además, se deshace el interleaving que el conversor de llama.cpp aplica a las dos mitades de cada cabeza de query y key, restaurando el orden original de filas. Las tablas rotatorias cubren 131.072 posiciones, por debajo del máximo de 524.288 del modelo base.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa ni atención lineal. La única innovación técnica relevante es de despliegue: los kernels `MatMulGgml` y `GatherGgml` leen directamente los tipos de cuantización de llama.cpp (IQ2_S, IQ3_S, IQ4_XS, Q3_K, Q4_K, Q5_K, Q6_K), algo que el ONNX Runtime estándar no puede hacer.

## Capacidades

- Generación de texto autoregresiva con caché KV, apta para diálogo multi-turno.
- Razonamiento y código: heredados del modelo base Nanbeige4.3-33B, sin evaluación específica publicada en esta conversión.
- Ejecución en navegador: inferencia local vía WebGPU sin servidor ni instalación de binarios.
- Compatibilidad con el ecosistema llama.cpp a nivel de pesos: acepta cuantizaciones K-quant e I-quant del formato GGUF.
- Tool calling, function calling y comportamiento agéntico: no disponible (no documentado para esta conversión).
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking explícito: no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Demostraciones interactivas en navegador: desplegar un chat con un modelo de 33B en una página web usando WebGPU, sin backend propio, útil para prototipos y demos de producto donde la privacidad del dato en cliente es prioritaria.
- Procesamiento de documentos sensibles en local: el usuario puede resumir o analizar texto sin que salga de su equipo, aprovechando que toda la inferencia ocurre en el navegador.
- Evaluación de cuantizaciones GGUF en ONNX: investigadores que quieran comparar el comportamiento de Q4_K_M frente al original sin montar un stack de llama.cpp, gracias a que los pesos se preservan bit a bit.
- Educación y experimentación: estudiar cómo se traduce una arquitectura transformer con GQA y rotary embedding a operadores ONNX Runtime GenAI, con un ejemplo real de 33B.
- Herramientas de escritorio multiplataforma basadas en web: integrar el modelo en aplicaciones Electron o PWA que necesiten generación de texto sin depender de una API externa.
- Pruebas de viabilidad de hardware cliente: medir el rendimiento real de WebGPU en GPUs de consumo antes de decidir si merece la pena empaquetar un modelo mayor o menor.

## Benchmarks y rendimiento

| Métrica | Valor | Referencia |
|---|---|---|
| Divergencia KL media (WikiText-2, 20 chunks de 512 tokens) | 0,051 | frente a bartowski Q6_K |
| Coincidencia token top-1 | 91,5 % | frente a bartowski Q6_K |
| Divergencia KL de bartowski IQ2_M (comparativa) | 0,41 | mismo protocolo |
| Coincidencia top-1 de bartowski IQ2_M | 74 % | mismo protocolo |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores miden fidelidad de la cuantización, no calidad del modelo.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 20,8 GB; con activaciones y caché KV en float16, se necesita un margen adicional, por lo que conviene contar con al menos 22-24 GB de memoria de GPU disponible para contexto moderado.
- GPU recomendadas: tarjetas con soporte WebGPU maduro y suficiente VRAM, como RTX 3090, RTX 4090, RTX 4080, o GPUs de datacenter (A100, H100) si se ejecuta en un entorno controlado; en portátiles con 8-12 GB no cabrá sin reducir contexto o cuantización.
- ¿Cabe en GPU de consumo? Sí, en el segmento alto (24 GB), como la RTX 4090 o la RTX 3090; no en GPUs de 8-16 GB con el contexto completo.
- Despliegue: exclusivamente ONNX Runtime Web con el build onnxruntime-web-kernels v1.30.0-qi.5 o superior y backend WebGPU. El ONNX Runtime estándar no puede cargar el modelo por los operadores `MatMulGgml` y `GatherGgml`. Para servidor, la alternativa natural es el GGUF original con llama.cpp, vLLM u Ollama.
- Latencia y throughput: no disponibles. Dependen del navegador, del driver WebGPU y de la GPU; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Q4_K_M-ONNX-WebGPU | 33B | 131.072 posiciones en tablas rotatorias (máx. base 524.288) | ONNX + WebGPU en navegador | Apache 2.0 | Conversión sin recuantizar, fidelidad KL 0,051 |
| bartowski/Nanbeige_Nanbeige4.3-33B-GGUF (Q4_K_M) | 33B | el del modelo base | GGUF + llama.cpp | Apache 2.0 | Origen de los pesos; ejecución nativa en escritorio/servidor |
| bartowski/Nanbeige_Nanbeige4.3-33B-GGUF (Q6_K) | 33B | el del modelo base | GGUF + llama.cpp | Apache 2.0 | Referencia de calidad usada en la medición KL |
| Nanbeige/Nanbeige4.3-33B (original) | 33B | 524.288 | safetensors (presumiblemente) | Apache 2.0 | Modelo base sin cuantizar |

No se dispone de comparativas con modelos de otros fabricantes de tamaño similar (por ejemplo, Llama o Qwen de 30-34B) en la información proporcionada.

## Limitaciones y advertencias

- Las salidas son cercanas, pero no idénticas, a las del modelo original: la conversión introduce diferencias medibles (KL 0,051, top-1 91,5 %).
- La ventana efectiva en esta conversión está limitada a 131.072 posiciones por las tablas rotatorias, la cuarta parte del máximo de 524.288 del modelo base.
- Requiere un runtime no estándar: sin onnxruntime-web-kernels v1.30.0-qi.5 o superior, el modelo no carga. Esto complica el mantenimiento y la portabilidad.
- Dependencia del soporte WebGPU del navegador y del driver de la GPU; el comportamiento puede variar entre Chrome, Edge y otras implementaciones.
- Sesgos conocidos: no documentados para esta conversión ni para el modelo base en la información disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe concreto.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto derivado conviene verificar los términos del modelo base y de la cuantización de origen.
- El autor no publica benchmarks de tareas ni mediciones de latencia; para producción en servidor es más sensato usar el GGUF original con llama.cpp o vLLM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/danyalmalik/Nanbeige4.3-33B-Q4_K_M-ONNX-WebGPU
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- GGUF de origen (bartowski): https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Runtime de kernels ONNX Runtime Web: https://github.com/mdanyalmalik/onnxruntime-web-kernels
