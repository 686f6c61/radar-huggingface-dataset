# Harsha001/Ternary-Bonsai-2.5-27B-Uncensored-ROCmFPX

## Resumen

Ternary Bonsai 2.5 27B Uncensored ROCmFPX es un empaquetado del modelo Ternary Bonsai 2.5 27B de Prism ML, en su variante sin censura producida por AtomicChat, adaptado al formato ternario `Q1_0_ROCMFPT` del fork de llama.cpp ROCmFPX. El modelo original deriva de Qwen3.8-27B de Alibaba Cloud y sus pesos son estrictamente ternarios (valores -1, 0 o +1 multiplicados por una escala), de modo que no requieren cuantización real, solo un empaquetado eficiente para lectura en GPU. Este repositorio concreto está orientado a hardware AMD Strix Halo (Radeon 8060S) con backend Vulkan.

El interés técnico reside en el formato: 1,75 bits por peso, con escalas de 8 bits cada 64 pesos en lugar de 16 bits cada 128, lo que reduce el tamaño del fichero a 5,99 GB frente a los 7,67 GB de un `Q2_0` equivalente, manteniendo prácticamente idéntica la perplejidad (10,050 frente a 10,051 en wikitext-2). La velocidad de generación medida es idéntica a la del fichero de 2 bits (20,2 tokens/s), con un procesamiento de prompt un 11% más lento (273 frente a 308 tokens/s).

Se trata de un modelo multimodal (image-text-to-text) con torre de visión opcional, capacidad de razonamiento en modo thinking y una ventana de contexto de hasta 262.144 tokens. La edición de AtomicChat elimina los rechazos en prompts dañinos según sus propias mediciones, lo que tiene implicaciones directas de responsabilidad para quien lo despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con componentes de espacio de estados (state-space gate tensors); pesos ternarios; derivado de Qwen3.8-27B |
| Parametros totales | 26.895.998.865 (26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Ternario nativo empaquetado en `Q1_0_ROCMFPT` (1,75 bits por peso); referencia `PTQ1_0`; repack `Q2_0` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Ternary-Bonsai-2.5-27B-Uncensored-Q1_0_ROCMFPT.gguf`, 5,99 GB; `Ternary-Bonsai-2.5-27B-mmproj-BF16.gguf`, 0,93 GB) |

## Arquitectura y entrenamiento

El modelo base es Ternary Bonsai 2.5 27B de Prism ML, construido a partir de Qwen3.8-27B de Alibaba Cloud. Sus pesos son ternarios por diseño: cada valor es -1, 0 o +1 multiplicado por una escala, lo que permite almacenarlos a 1,75 bits por peso sin pérdida de información respecto al original. La arquitectura incluye tensores de compuerta de espacio de estados que se mantienen en F32 en este empaquetado, y el fichero conserva sin cambios los ajustes de rotación de Hadamard de Prism ML en los metadatos.

El proceso de creación de este repositorio concreto consistió en reempaquetar sin pérdida el fichero `PTQ1_0` de AtomicChat en `Q2_0` estándar (mismos códigos ternarios y escalas FP16) y recuantizarlo después con `llama-quantize` del fork ROCmFPX a `Q1_0_ROCMFPT`, con escalas de tensor ROCmFPX activadas (`LLAMA_ROCMFPX_TENSOR_SCALE=1`). La única modificación respecto al original es el almacenamiento de cada escala en 8 bits por cada 64 pesos en lugar de 16 bits por cada 128. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La edición sin censura de AtomicChat se aplicó sobre los códigos ternarios de 36 matrices en las capas 27 a 44 (12,5 millones de códigos modificados), manteniendo intactas todas las escalas y el resto de bytes respecto al fichero de Prism ML.

## Capacidades

- Generación de texto y razonamiento en modo thinking por defecto, con la posibilidad de desactivarlo mediante parámetros de muestreo específicos.
- Procesamiento de imágenes mediante torre de visión opcional (`mmproj` BF16), con pipeline image-text-to-text.
- Capacidad de respuesta a peticiones que el modelo original rechaza, fruto de la edición de AtomicChat.
- Ventana de contexto de hasta 262.144 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Análisis de documentos extensos: con 262.144 tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de código y responder preguntas sobre ellos sin fragmentación.
- Procesamiento de imágenes en local: la torre de visión permite describir imágenes, identificar formas y colores o extraer información visual en un equipo de sobremesa con GPU integrada Strix Halo.
- Asistencia conversacional multi-turno: el contexto largo y el modo thinking permiten mantener hilos de conversación con historial extenso y razonamiento previo a la respuesta.
- Despliegue en hardware de consumo: los 5,99 GB del fichero caben en iGPU con memoria unificada, lo que habilita inferencia local sin GPU dedicada.
- Investigación sobre modelos sin censura: útil para estudiar comportamiento de rechazo, sesgos y alineación comparando con la versión original de Prism ML.
- Prototipado de asistentes con razonamiento explícito: el modo thinking por defecto facilita tareas de resolución de problemas paso a paso en entornos controlados.
- Evaluación de formatos de cuantización de bajos bits: sirve como referencia para medir el impacto de `Q1_0_ROCMFPT` frente a `Q2_0` en perplejidad y velocidad.

## Benchmarks y rendimiento

Calidad medida sobre 40 fragmentos de 512 tokens de Wikipedia en inglés (wikitext-2), en CPU, según la model card:

| Build | Tamano | Perplejidad | KL respecto al original | Mismo token top |
|---|---:|---:|---:|---:|
| AtomicChat `PTQ1_0` (referencia) | 5,99 GB | 10,052 | — | — |
| stock `Q2_0` (repack exacto, no publicado) | 7,67 GB | 10,051 | 0,0003 | 99,2% |
| `Q1_0_ROCMFPT` (este repositorio) | 5,99 GB | 10,050 | 0,0046 | 96,5% |

Velocidad en Strix Halo (Radeon 8060S, Vulkan, todas las capas en GPU, flash attention activado, `llama-bench -p 512 -n 128`):

| Build | Tamano | Prompt (tokens/s) | Generacion (tokens/s) |
|---|---:|---:|---:|
| stock `Q2_0` | 7,14 GiB | 308 | 20,2 |
| `Q1_0_ROCMFPT` | 5,57 GiB | 273 | 20,2 |

Datos adicionales de la edición sin censura, según las mediciones de AtomicChat: los rechazos en su conjunto de prompts dañinos cayeron de 24 de 24 a 0 de 24, sin rechazos en prompts ordinarios, y MMLU pasó de 80,2% a 81,2%.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,57 GiB para el modelo de lenguaje en `Q1_0_ROCMFPT`; 0,93 GB adicionales si se usa la torre de visión.
- GPU recomendadas: AMD Strix Halo con Radeon 8060S (probado con Vulkan). ROCm/HIP y otras GPU no se han probado según el autor.
- Cabe en iGPU de memoria unificada Strix Halo; no se documenta su comportamiento en GPU de consumo discretas.
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp (rama `rocmfpx-sub2`), compilado con `-DGGML_VULKAN=ON`. llama.cpp upstream no carga el formato. Se usa `llama-server` o `llama-cli`.
- Latencia y throughput medidos: 273 tokens/s de procesamiento de prompt y 20,2 tokens/s de generación en Strix Halo con Vulkan. En CPU funciona correctamente pero con lentitud no cuantificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B Uncensored ROCmFPX (este) | 26,9 mil M | 262.144 | GGUF ternario, 1,75 bits | Apache-2.0 | Hugging Face, requiere fork ROCmFPX |
| prism-ml/Ternary-Bonsai-2.5-27B-GGUF | 26,9 mil M | 262.144 | GGUF ternario | Apache-2.0 | Hugging Face |
| AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF | 26,9 mil M | 262.144 | GGUF `PTQ1_0` | Apache-2.0 | Hugging Face, requiere fork de Prism ML |
| stock `Q2_0` (repack de referencia) | 26,9 mil M | 262.144 | GGUF 2 bits | Apache-2.0 | No publicado |

Los tres primeros comparten pesos ternarios y solo difieren en empaquetado y edición de alineación; el `Q2_0` es una referencia interna de calidad, no un modelo distinto.

## Limitaciones y advertencias

- El formato `Q1_0_ROCMFPT` solo lo carga el fork ROCmFPX de llama.cpp; no es compatible con llama.cpp upstream, Ollama, vLLM ni TGI.
- Solo se ha probado en Strix Halo con Vulkan y en CPU; ROCm/HIP y otras GPU quedan sin validar.
- El procesamiento de prompt es un 11% más lento que el `Q2_0` de referencia.
- El modelo está editado para eliminar rechazos: responderá a peticiones que el original rechaza, lo que traslada toda la responsabilidad de uso al operador.
- Riesgo de alucinación inherente a modelos de 27 mil millones de parámetros; no se documentan evaluaciones específicas de factualidad.
- Idiomas soportados no documentados; los benchmarks de calidad se han medido únicamente sobre texto en inglés.
- El modo thinking está activado por defecto y consume tokens adicionales; hay que reservar espacio en la generación.
- No se documenta soporte de tool calling ni comportamiento agéntico, por lo que no debe asumirse en producción.
- Licencia Apache-2.0 permite uso comercial, pero debe revisarse `NOTICE.txt` por las atribuciones a Qwen3.8-27B y a los trabajos derivados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Ternary-Bonsai-2.5-27B-Uncensored-ROCmFPX
- Modelo base original: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Versión sin censura de AtomicChat: https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/HarshaVardhan3002/ROCmFPX
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
