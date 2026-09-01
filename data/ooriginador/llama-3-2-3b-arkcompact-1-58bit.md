# Ooriginador/LLaMA-3.2-3B-ArkCompact-1.58bit

## Resumen

LLaMA-3.2-3B-ArkCompact-1.58bit es una cuantización ternaria de 1,58 bits del modelo Meta Llama 3.2 3B Instruct, desarrollada por Ooriginador dentro del ecosistema ArkheionNet. El modelo reduce el peso original de 16 bits a un formato Base-3 con 5 trits por byte, lo que permite ejecutar inferencia con una huella de VRAM de aproximadamente 805 MB, frente a los más de 6 GB que ocuparía el modelo en FP16. Está pensado para despliegue en dispositivos edge, GPUs AMD consumer y entornos con recursos limitados, manteniendo una fidelidad matemática alta (coeficiente de correlación de Pearson superior a 0,94 en todas las capas lineales).

La cuantización se complementa con una arquitectura de atención latente multi-cabeza (MLA) que reduce el footprint del KV-cache en un 85,9 %, y con un runtime propio en Rust (ark-engine) que ofrece una API compatible con OpenAI. El modelo soporta una ventana de contexto de 128k tokens y alcanza un throughput de 185 tokens por segundo en una AMD Radeon RX 6600M, según las mediciones del autor. Es relevante ahora porque demuestra que es posible ejecutar modelos de razonamiento de 3B parámetros en hardware de gama baja con cuantización extrema, sin depender de CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 3B Instruct con cuantizacion ternaria 1.58-bit Base-3 y atencion latente multi-cabeza (MLA) |
| Parametros totales | 3,21 mil millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128k tokens (escalado RoPE completo) |
| Tipos de cuantizacion | 1.58-bit Base-3 ternario (5 trits por byte, pesos en {-1, 0, +1}) |
| Idiomas soportados | Portugues (pt) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propio .ark (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Meta Llama 3.2 3B Instruct y los cuantiza a un formato ternario de 1,58 bits mediante el algoritmo ArkCompact. La cuantizacion utiliza empaquetado Base-3, donde cada byte almacena 5 trits (3^5 = 243 combinaciones, dentro del rango de 256 valores posibles). Esto elimina las multiplicaciones en coma flotante de 16 bits y las sustituye por acumulaciones enteras y operaciones bitwise fusionadas en Wave32, optimizadas para GPUs AMD con ROCm/HIP.

La arquitectura interna incorpora Multi-Head Latent Attention (MLA), que comprime las claves y valores en un espacio latente, reduciendo el KV-cache en un 85,9 % respecto a la atencion estandar. Tambien implementa chunked prefill para evitar el bloqueo head-of-line en el batching continuo. No se han publicado detalles sobre el proceso de entrenamiento o calibracion de la cuantizacion; la model card solo menciona que se trata de una cuantizacion post-entrenamiento del modelo base.

## Capacidades

- Generacion de texto y dialogo multiuso, heredadas del modelo base Llama 3.2 3B Instruct.
- Razonamiento y respuesta a instrucciones en portugues e ingles.
- Soporte de tool calling y function calling: no se documenta explicitamente, pero al derivar de Llama 3.2 3B Instruct, es probable que herede estas capacidades; no hay confirmacion en la model card.
- Ejecucion en dispositivos edge y moviles gracias a su bajo consumo de VRAM (804,9 MB) y carga por memoria mapeada (mmap) en menos de 450 ms.
- Inferencia de alta velocidad en GPUs AMD RDNA2 con ROCm/HIP, sin necesidad de CUDA.
- Compatibilidad con API REST estilo OpenAI a traves de ark-engine, lo que facilita su integracion en aplicaciones existentes.

## Casos de uso

- Asistentes conversacionales en dispositivos moviles: el modelo cabe en menos de 1 GB de VRAM, por lo que puede ejecutarse en smartphones o tablets con GPU integrada, ofreciendo respuestas en portugues e ingles con baja latencia.
- Chatbots de atencion al cliente en entornos con hardware limitado: su ventana de 128k tokens permite mantener conversaciones multi-turno largas sin perder contexto, y la API compatible con OpenAI facilita la integracion en sistemas de ticketing o CRM.
- Generacion de codigo y asistencia en entornos de desarrollo sin GPU dedicada: al poder ejecutarse en GPUs AMD consumer como la RX 6600M, es util para autocompletado y explicacion de codigo en portatiles de gama media.
- Prototipado rapido de aplicaciones de IA generativa: el servidor ark-engine se levanta en menos de 450 ms y ofrece un endpoint REST, ideal para pruebas de concepto y demos en entornos de desarrollo.
- Sistemas de razonamiento en tiempo real en edge computing: su throughput de 185 tok/s (290 tok/s con decodificacion especulativa) permite procesar consultas de logica o analisis de datos en tiempo real en dispositivos IoT o robots.
- Despliegue soberano o local en infraestructura sin CUDA: al ser Apache-2.0 y funcionar con ROCm/HIP, es adecuado para organizaciones que requieren ejecucion local en hardware AMD o que evitan dependencias de NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card del autor incluye las siguientes mediciones de rendimiento, verificadas en una AMD Radeon RX 6600M (RDNA2):

| Metrica | Valor medido |
|---|---|
| Throughput de un solo stream | 185,0 tok/s |
| Throughput con decodificacion especulativa (Tree-Attention) | 290,0 tok/s |
| Throughput pico en batch Wave32 | 10.927,0 tok/s |
| Huella de VRAM | 804,9 MB |
| Fidelidad matematica (Pearson rho) | >= 0,942 en todas las capas lineales 2D |
| Tiempo de carga del modelo | < 450 ms (con mmap) |

Estas cifras son proporcionadas por el autor y no han sido validadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: 804,9 MB segun el autor, lo que permite ejecucion en GPUs con 1 GB o mas de memoria.
- GPU recomendada: AMD Radeon RX 6600M (RDNA2) probada; compatible con cualquier GPU AMD con soporte ROCm/HIP y Wave32.
- Tambien puede ejecutarse en GPUs NVIDIA si se adapta el runtime, aunque no se documenta soporte CUDA.
- Cabe en GPUs consumer de gama baja, como las series RX 6000 o RX 7000 de AMD, y en iGPUs con suficiente memoria compartida.
- Opciones de despliegue: ark-engine (servidor Rust) con API REST compatible con OpenAI; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 185 tok/s en un solo stream y 290 tok/s con decodificacion especulativa, medidos en la GPU de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM | Licencia | Formato |
|---|---|---|---|---|---|---|
| LLaMA-3.2-3B-ArkCompact-1.58bit | 3,21B | 128k | 1.58-bit ternario | ~805 MB | Apache-2.0 | .ark |
| Llama 3.2 3B Instruct (BF16) | 3,21B | 128k | BF16 | ~6,4 GB | Llama 3.2 Community License | safetensors |
| BitNet b1.58 3B (referencia, sin datos verificados) | ~3B | no disponible | 1.58-bit ternario | no disponible | MIT (tipicamente) | no disponible |

La comparativa se limita al modelo base, ya que no hay datos publicos de otros modelos ternarios de tamano similar con los que contrastar. La principal diferencia frente al modelo original es la reduccion de VRAM en un factor de 7,6 a 16 veces, a cambio de una posible perdida de calidad en tareas complejas, que el autor estima minimizada por la alta fidelidad matematica reportada.

## Limitaciones y advertencias

- Idiomas limitados: solo portugues e ingles; no soporta espanol ni otros idiomas de forma nativa.
- Dependencia del runtime ArkheionNet: el modelo solo puede ejecutarse con ark-engine, no es compatible con frameworks estandar como transformers, vLLM o llama.cpp, lo que limita su portabilidad.
- Cuantizacion extrema: aunque la fidelidad reportada es alta, la cuantizacion ternaria puede degradar el rendimiento en tareas de razonamiento complejo, matematicas avanzadas o generacion de codigo largo, en comparacion con el modelo en BF16.
- Sin benchmarks independientes: las metricas de rendimiento y fidelidad provienen del autor y no han sido validadas por terceros.
- Riesgo de alucinacion: al ser un modelo derivado de Llama 3.2 Instruct, hereda los sesgos y riesgos de alucinacion del modelo base, que no se han mitigado en el proceso de cuantizacion.
- Licencia del modelo base: aunque el modelo cuantizado es Apache-2.0, el uso del modelo base Llama 3.2 3B Instruct esta sujeto a la licencia de Meta, que puede imponer restricciones adicionales para uso comercial en ciertos volumenes.
- Fecha de creacion futura: el modelo fue creado en agosto de 2026, lo que puede indicar que es un proyecto experimental o de investigacion con soporte limitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ooriginador/LLaMA-3.2-3B-ArkCompact-1.58bit
- Repositorio ArkheionNet (GitHub): https://github.com/Arkheion/ArkheionNet.git
- Modelo base en HuggingFace: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentacion de Llama 3.2 de Meta: https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Blog de Llama 3.2 en HuggingFace: https://huggingface.co/blog/llama32
