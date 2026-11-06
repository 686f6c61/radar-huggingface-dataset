# CMSManhattan/JiRackTernaryPrecision-36B-chat

## Resumen

JiRack Ternary Precision 36B es un modelo de generación de texto con pesos ternarios (1,58 bits, estilo BitNet b1.58) desarrollado por CMSManhattan (Konstantin Grabko). Se trata de un ajuste de CMSManhattan/JiRackUltra_32b en formato de chat, con 35,78B de parámetros, en el que cada capa lineal del transformer utiliza pesos ternarios {-1, 0, +1} con escala por tensor y activaciones de 8 bits, entrenado mediante quantization-aware training. Su propósito es ofrecer un modelo grande optimizado para agentes y function calling que quepa y sea rápido en hardware modesto.

Su relevancia radica en la eficiencia: ocupa unos 11 GiB en GPU frente a los ~61 GiB del original en bf16, genera 108,5 tokens/s para un único usuario (frente a 51,3 tokens/s) y puede ejecutarse incluso en CPU. En el benchmark BFCL v3 non-live alcanza un 82,2%, superando a DeepSeek-R1-Distill-Qwen-32B en bf16 (74,2%) en la misma prueba. Se distribuye como dos archivos GGUF con los mismos pesos: TQ2_0 (9,91 GB) para CPU y Q2_0 (10,71 GB) para GPU NVIDIA, ambos almacenando los pesos ternarios de forma exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios en todas las capas lineales (estilo BitNet b1.58), escala por tensor y activaciones de 8 bits |
| Parametros totales | 35,78B |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria nativa (1,58 bits) mediante QAT; GGUF TQ2_0 (CPU) y Q2_0 (GPU), pesos ternarios exactos |
| Idiomas soportados | no disponible |
| Licencia | BSL-1.0 (jirack-proprietary) |
| Formato de pesos | GGUF (TQ2_0 y Q2_0) |

## Arquitectura y entrenamiento

El modelo es un transformer convencional en el que todas las capas lineales emplean pesos ternarios {-1, 0, +1} con una escala por tensor y activaciones de 8 bits, siguiendo el enfoque BitNet b1.58. El entrenamiento se realizó con quantization-aware training (QAT), partiendo del modelo base CMSManhattan/JiRackUltra_32b. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

Como innovación técnica destacable, la ternarización nativa permite almacenar los pesos de forma exacta en formatos GGUF de 2 bits (TQ2_0 y Q2_0), sin pérdida respecto al modelo de referencia en PyTorch, lo que reduce la huella de memoria en un factor de 5,7 frente al bf16 y duplica la velocidad de generación para un solo usuario en GPU.

## Capacidades

- Generación de texto en formato de chat (pipeline text-generation).
- Function calling / tool calling: 82,2% en BFCL v3 non-live y 64,1% en la categoría live; llamadas paralelas con 84,0% en non-live.
- Uso en agentes: etiquetado oficialmente para agents y tool-use, con soporte de herramientas vía API compatible con OpenAI (`tools`).
- Programación: etiquetado para coding, con pruebas en Java (66,0% en BFCL java) y JavaScript (56,0%).
- Robótica: etiquetado para robotics, con estimaciones de despliegue en NVIDIA Jetson (AGX Orin, Thor).
- Ejecución eficiente en CPU: 20,7 tokens/s de generación con TQ2_0 en un CPU Grace de 64 hilos.
- Reconocimiento de irrelevancia (rechazar cuando ninguna herramienta encaja): 79,2% en non-live, aunque inferior al modelo de referencia comparado.

## Casos de uso

- Agentes con llamadas a herramientas: el modelo está afinado específicamente para function calling; puede integrarse en frameworks de agentes (vía API compatible con OpenAI) para orquestar herramientas externas, con un 98,3% de acierto en pruebas internas de 117 casos con el modelo de referencia.
- Orquestación de llamadas paralelas: alcanza 84,0% en llamadas paralelas BFCL non-live, adecuado para flujos donde el agente debe invocar varias herramientas simultáneamente (por ejemplo, consultar varias APIs a la vez).
- Despliegue en edge y robótica: con 9,91 GB en TQ2_0 cabe en un NVIDIA AGX Orin 32/64 GB o Jetson Thor, lo que lo hace viable para agentes embebidos en robots que necesiten razonar y llamar herramientas localmente.
- Inferencia en CPU sin GPU: con 20,7 tokens/s de generación en CPU (Grace, 64 hilos), permite servir un modelo de 36B en servidores sin acelerador, útil para prototipado o despliegues de bajo coste.
- Chatbots multiusuario en GPU de consumo: con 20,5 GiB de memoria pico para 32 streams paralelos, cabe en una GPU de 24 GB y sirve hasta 1.050 tokens/s agregados, adecuado para asistentes conversacionales con herramienta integrada.
- Generación de código con acceso a herramientas: etiquetado para coding y con capacidad de tool calling, puede integrarse en pipelines que combinen generación de código con ejecución o validación mediante funciones.
- Demostraciones y evaluación sin GPU: existe un Space público (JiRack-36B-Chat) que ejecuta el modelo TQ2_0 en CPU para probarlo directamente.

## Benchmarks y rendimiento

### BFCL v3 (Berkeley Function Calling Leaderboard)

| Categoria | Casos | JiRack Ternary 36B | DeepSeek-R1-Distill-Qwen-32B (bf16) |
|---|---:|---:|---:|
| simple | 400 | **90,3%** | 75,0% |
| multiple | 200 | **89,0%** | 83,0% |
| parallel | 200 | **84,0%** | 55,5% |
| parallel_multiple | 200 | **75,5%** | 72,5% |
| java | 100 | **66,0%** | 52,0% |
| javascript | 50 | 56,0% | **68,0%** |
| irrelevance | 240 | 79,2% | **93,3%** |
| **Non-live total** | **1.390** | **82,2%** | 74,2% |
| live_simple | 258 | 70,9% | **75,2%** |
| live_multiple | 1.053 | 63,1% | **69,8%** |
| live_parallel | 16 | **56,3%** | 43,8% |
| live_parallel_multiple | 24 | 58,3% | 58,3% |
| live_relevance | 18 | **72,2%** | 38,9% |
| live_irrelevance | 882 | 63,5% | **90,3%** |
| **Live total** | **2.251** | 64,1% | **77,9%** |

Nota: JiRack se evaluó con el modelo de referencia PyTorch en modo function calling de BFCL (herramientas vía `tools` de OpenAI, hasta 1.024 tokens nuevos); DeepSeek-R1-Distill-Qwen-32B en bf16 con llama-server, modo prompt, razonamiento activado, temperatura 0,6 / top-p 0,95, hasta 4.096 tokens nuevos.

### Prueba interna de tool calling (117 casos, greedy)

| Categoria | Referencia (PyTorch) | GGUF TQ2_0 (CPU) | GGUF Q2_0 (GPU) |
|---|---|---|---|
| Llamada simple | 38/38 | 38/38 | 38/38 |
| Llamadas paralelas | 19/19 | 19/19 | 19/19 |
| Follow-up (respuesta desde resultado de herramienta) | 20/20 | 20/20 | 20/20 |
| Sin herramienta necesaria | 25/25 | 25/25 | 25/25 |
| Pedir aclaración de argumento faltante | 13/15 | 10/15 | 9/15 |
| **Total** | **115/117 (98,3%)** | **112/117 (95,7%)** | **111/117 (94,9%)** |

### Velocidad y memoria en GPU (NVIDIA GH200, llama.cpp CUDA)

| Metrica | JiRack Ternary 36B, Q2_0 | DeepSeek-R1-Distill-Qwen-32B, BF16 |
|---|---:|---:|
| Tamaño del archivo | 9,97 GiB | 61,03 GiB |
| Memoria pico GPU, 1 stream | 10,7 GiB | 60,7 GiB |
| Memoria pico GPU, 32 streams paralelos | 20,5 GiB | 70,7 GiB |
| Generación, 1 stream (tg128) | **108,5 tokens/s** | 51,3 tokens/s |
| Generación, 8 streams paralelos (total) | **363 tokens/s** | 298 tokens/s |
| Generación, 32 streams paralelos (total) | 1.050 tokens/s | **1.297 tokens/s** |
| Procesamiento de prompt (pp512) | 2.732 tokens/s | **6.988 tokens/s** |

### Velocidad en CPU (Grace, 64 hilos, llama.cpp solo CPU)

| Archivo | Procesamiento de prompt (512 tokens) | Generación |
|---|---:|---:|
| TQ2_0 | 67,7 tokens/s | 20,7 tokens/s |
| TQ1_0 | 45,7 tokens/s | 24,5 tokens/s |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 10,7 GiB de memoria pico en GPU con Q2_0 y un stream; 20,5 GiB con 32 streams paralelos (incluida la caché KV). El archivo Q2_0 ocupa 10,71 GB.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 12 GB de VRAM para un stream (probado en GH200); cabe en una GPU de 24 GB incluso con 32 streams paralelos. Compatible con RTX 3090/4090 de 24 GB según los datos de memoria publicados.
- Consumer GPU: sí, cabe en una GPU de 24 GB (e incluso de 12-16 GB para contextos cortos y pocos streams), según los 10,7 GiB de memoria pico medidos.
- CPU: ejecutable sin GPU con TQ2_0 (20,7 tokens/s de generación en un Grace de 64 hilos); también cabe en Jetson AGX Orin 32/64 GB y Jetson Thor (TQ2_0 en CPU, Q2_0 para GPU CUDA). No cabe en Orin Nano ni Orin NX 8 GB; ajustado en Orin NX 16 GB con contexto corto.
- Despliegue: llama.cpp (llama-server) es el runtime de referencia; existe un proxy oficial (`jirack_gguf_proxy.py`) que expone el formato de prompt del fine-tuning y un servidor compatible con la API de OpenAI para el modelo PyTorch. No se menciona soporte en vLLM, TGI u Ollama.
- Latencia y throughput: 108,5 tokens/s por usuario en GPU (tg128); 363 tokens/s agregados con 8 streams; 1.050 tokens/s con 32 streams; procesamiento de prompt de 2.732 tokens/s (pp512). En CPU, 20,7 tokens/s de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / precision | Memoria en GPU | Gen. 1 stream (GH200) | BFCL v3 non-live | Licencia |
|---|---|---|---:|---:|---:|---|
| JiRack Ternary Precision 36B | 35,78B | GGUF ternario (Q2_0/TQ2_0) | 10,7 GiB | 108,5 tokens/s | 82,2% | BSL-1.0 (jirack-proprietary) |
| DeepSeek-R1-Distill-Qwen-32B | 32B | BF16 (GGUF) | 60,7 GiB | 51,3 tokens/s | 74,2% | MIT (modelo base) |
| Qwen2.5-32B / Llama-3.1-32B clase | ~32B | BF16 | ~60-65 GiB | no disponible | no disponible | variadas |

Nota: la comparativa directa publicada es con DeepSeek-R1-Distill-Qwen-32B en bf16; JiRack gana en memoria (5,7x menos), velocidad monousuario (2,1x) y BFCL non-live, pero pierde en BFCL live (64,1% vs 77,9%), en rechazo de herramientas irrelevantes y en procesamiento de prompts largos en GPU Hopper.

## Limitaciones y advertencias

- Rechazo de herramientas irrelevantes: el modelo es claramente inferior al comparado en las categorías irrelevance (79,2% vs 93,3%) y live_irrelevance (63,5% vs 90,3%); tiende a llamar a una herramienta incluso cuando ninguna encaja, un riesgo relevante en producción.
- Aclaración de argumentos faltantes: en la prueba interna, los GGUF rinden peor que la referencia en la categoría "clarify" (9-10 de 15), llamando a una herramienta en lugar de pedir el argumento que falta.
- Rendimiento en BFCL live inferior (64,1% vs 77,9% del comparado), lo que sugiere menor robustez con herramientas y consultas del mundo real.
- Procesamiento de prompts lento en GPU Hopper: 2.732 tokens/s frente a 6.988 del bf16, porque Q2_0 desempaqueta los pesos ternarios en lugar de usar tensor cores; con muchos streams paralelos el bf16 también es más rápido en throughput agregado.
- Longitud de contexto e idiomas soportados: no disponibles en la documentación.
- Licencia: BSL-1.0 con nombre "jirack-proprietary"; conviene revisar las condiciones adicionales antes de uso comercial, ya que la Business Source License restringe habitualmente ciertos usos hasta su conversión a licencia abierta.
- Proyecto de autor individual con 0 descargas registradas en el momento de la ficha; la comunidad y el ecosistema de soporte son mínimos y las estimaciones para Jetson no han sido medidas físicamente.
- No se ha publicado información sobre sesgos, riesgo de alucinación ni datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-36B-chat
- Modelo base: https://huggingface.co/CMSManhattan/JiRackUltra_32b
- Demo en vivo (CPU, TQ2_0): https://huggingface.co/spaces/CMSManhattan/JiRack-36B-Chat
- Berkeley Function Calling Leaderboard (BFCL): no disponible (enlace no incluido en la información proporcionada)
