# GossetWorks/Arete-27B-Gosset-3.65BPW

## Resumen

Arete-27B-Gosset-3.65BPW es una cuantización del modelo NousResearch/Arete-27B, un modelo vision-lenguaje de 27.360 millones de parámetros (incluyendo el codificador visual), desarrollado por Nous Research y empaquetado por GossetWorks mediante una técnica propia denominada Gosset Packing. El objetivo es claro: hacer que un modelo de 27B quepa íntegramente en una GPU de 16 GB de VRAM, algo que un GGUF Q4_K_M estándar (17,20 GB) no consigue. El pack ocupa 12,97 GB en disco frente a los aproximadamente 54,71 GB del original en BF16.

La arquitectura del modelo base es híbrida: 64 capas, de las cuales 48 son DeltaNet de atención lineal recurrente con estado O(1) y solo 16 son de atención completa. Esta combinación reduce drásticamente el coste de la caché KV (32 KB por token en FP8 frente a 256 KB en FP16 para un transformer equivalente) y permite mantener la ventana arquitectónica de 262.144 tokens, con un valor por defecto de 32.768 tokens en el runtime incluido.

La relevancia del pack reside en su doble vertiente: por un lado, demuestra una compresión agresiva (3,79 bits por peso en total) sin destruir el rendimiento del modelo base; por otro, incluye un runtime de referencia con motor de decodificación fusionado y captura de grafos CUDA, verificado end-to-end sobre una RTX 5080 con 53,92 tok/s sostenidos y cero spill a RAM del sistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas DeltaNet (atención lineal recurrente) + 16 capas de atención completa, con torre visual |
| Parámetros totales | 27.360 millones (el recuento de 4.810.711.024 que reporta Hugging Face corresponde a los códigos empaquetados, no a los pesos reales) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (techo arquitectónico); 32.768 tokens por defecto en el runtime |
| Tipos de cuantización | Gosset Packing sobre retículo E8: 4,25 bpw en proyecciones de atención (lineal, completa y visual) y LM head; 3,25 bpw en proyecciones MLP (lenguaje y visión); embedding en int8; normas y sesgos en BF16. Media global de 3,79 bpw |
| Idiomas soportados | no disponible |
| Licencia | other (no se detalla el texto de la licencia en la información disponible) |
| Formato de pesos | safetensors (4 shards empaquetados) + runtime de referencia Gosset |
| Modelo base | NousResearch/Arete-27B |
| Tamaño en disco | 12,97 GB |
| Residencia en GPU | 12,07 GiB estáticos; 13,48 GiB de pico a contexto por defecto |

## Arquitectura y entrenamiento

El modelo base Arete-27B combina capas de atención lineal recurrente DeltaNet (48 de 64) con capas de atención completa (16 de 64). Las capas DeltaNet mantienen un estado recurrente de tamaño constante y no consumen caché KV a ninguna longitud de secuencia; solo las 16 capas de atención completa almacenan KV, en FP8 a 32 KB por token. Esta elección arquitectónica reduce la huella de memoria en contextos largos, pero también hace que el modelo sea más sensible a la cuantización que un transformer plano, tal como reconoce el autor del pack.

El proceso de cuantización emplea Gosset Packing: agrupa los pesos de ocho en ocho y los redondea al punto más cercano del retículo E8, el empaquetamiento más denso en ocho dimensiones. La decodificación se realiza directamente en registros en tiempo de inferencia, sin tabla de códigos. El codificador es consciente de las activaciones y se calibró con datos disjuntos del conjunto de evaluación, con especial atención al camino de estado recurrente. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general en el rango de 27B parámetros.
- Generación de código: 91,46% de pass@1 en el conjunto oficial completo de HumanEval (150/164).
- Razonamiento matemático: 93/100 en los primeros 100 problemas del test oficial de GSM8K en modo zero-shot y greedy.
- Comprensión de imágenes: el modelo incluye torre visual con proyecciones de atención y MLP cuantizadas por separado.
- Respuesta a instrucciones sin rechazos en el conjunto Propaganda_Eval (21 prompts, 0 rechazos), preservando el comportamiento del modelo base.
- Ventana de contexto larga: hasta 262.144 tokens arquitectónicos, con 32.768 por defecto.
- Servido mediante endpoints compatibles con Ollama y OpenAI, verificado con completaciones de 2.048 tokens.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Idiomas: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en estación de trabajo con GPU de 16 GB: el pack permite ejecutar un modelo de 27B con HumanEval del 91,46% en una RTX 5080, sin depender de servicios en la nube ni de GPUs de centro de datos.
- Análisis de documentos largos con imágenes: la ventana de 262.144 tokens y la torre visual permiten procesar informes, contratos o papers con figuras en una sola pasada, manteniendo la caché KV en 1,00 GiB a 32K tokens.
- Automatización de atención al cliente multi-turno: el estado recurrente de las 48 capas DeltaNet evita el crecimiento de la caché KV con la conversación, lo que abarata el coste por sesión en despliegues con muchas conversaciones concurrentes.
- Prototipado de agentes con contexto extenso: los endpoints compatibles con OpenAI permiten integrar el modelo en frameworks de agentes existentes sin adaptadores propios, con un TTFT de 146,6 ms.
- Evaluación de modelos en hardware de consumo: investigadores que necesiten medir el comportamiento de un 27B con visión pueden hacerlo en una única GPU de 16 GB, sin recurrir a instancias A100/H100.
- Despliegue en entornos con restricciones de memoria: el pico de 13,48 GiB deja 2,52 GiB de margen en la tarjeta, suficiente para el runtime y buffers intermedios, lo que facilita el despliegue en estaciones con una sola GPU.
- Generación de documentación técnica con soporte visual: el modelo puede describir diagramas y capturas junto con el texto que los acompaña, útil en pipelines de documentación automatizada.

## Benchmarks y rendimiento

| Benchmark | Este pack | Referencia | Notas |
|---|---|---|---|
| WikiText-2, long-chunk (24 × 2048 tokens, 49.128 evaluados) | Perplejidad 6,8474 | BF16: 6,5001 (+5,34%) | Mismo protocolo y harness |
| WikiText-2, short-window (128 × 128 tokens, 16.256 evaluados) | Perplejidad 12,7208 | BF16: 11,8433 (+7,41%) | Mismo protocolo y harness |
| HumanEval, conjunto oficial completo (164 problemas, pass@1) | 91,46% (150/164) | no disponible | — |
| GSM8K, primeros 100 problemas oficiales, zero-shot, greedy, tope de 512 tokens | 93/100 | Qwen3.8-27B-Gosset: 86/100 | 3 de los 7 fallos por tope de tokens; muestra de 100, no conjunto completo |
| Propaganda_Eval (21 prompts estratificados) | 0 rechazos | no disponible | Preserva comportamiento del base |

Rendimiento de inferencia en RTX 5080 con el pack completamente residente:

| Métrica | Valor |
|---|---|
| Decodificación sostenida | 53,92 tok/s (18,55 ms por token) |
| Time to first token | 146,6 ms |
| VRAM de pico a contexto por defecto | 13,48 GiB |
| Spill a RAM del sistema | 0 |

## Requisitos de hardware

- VRAM: mínimo 16 GB; residencia verificada de 12,07 GiB estáticos y 13,48 GiB de pico a 32.768 tokens de contexto.
- GPU verificada: NVIDIA RTX 5080. No se han publicado verificaciones en otras tarjetas.
- GPU recomendadas: RTX 5080 (verificada); cualquier GPU NVIDIA con 16 GB o más de VRAM debería poder alojar el pack, aunque no está verificado en la información disponible.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB; un GGUF Q4_K_M estándar (17,20 GB) no cabe.
- Despliegue: runtime Gosset de referencia incluido, con motor de decodificación fusionado y captura de grafos CUDA; endpoints compatibles con Ollama y OpenAI; aplicación Gosset Runner para Windows x64 sin necesidad de Python.
- Disco: aproximadamente 14 GB libres.
- Latencia y throughput: 53,92 tok/s de decodificación y 146,6 ms de TTFT en RTX 5080 con configuración por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| Arete-27B-Gosset-3.65BPW | 27,36B | 262.144 | safetensors empaquetado, 12,97 GB | other | HumanEval 91,46%; GSM8K 93/100; WikiText-2 PPL 6,8474 |
| NousResearch/Arete-27B (BF16) | 27,36B | 262.144 | BF16, ~54,71 GB | no disponible | WikiText-2 PPL 6,5001 |
| Arete-27B GGUF Q4_K_M (bartowski) | 27,36B | 262.144 | GGUF, 17,20 GB | no disponible | No disponible |
| Qwen3.8-27B-Gosset | 27B (aproximado) | no disponible | Gosset | no disponible | GSM8K 86/100 en la misma muestra de 100 problemas |

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: +5,34% de perplejidad en long-chunk y +7,41% en short-window respecto a BF16. El propio autor señala que la arquitectura híbrida con 48 capas recurrentes es menos tolerante a la compresión que un transformer plano.
- El error de reconstrucción por tensor es elevado en las proyecciones MLP (0,1682 de media relativa, 0,1685 ponderada por norma), muy por encima del 0,1008 de las proyecciones de atención.
- El resultado de GSM8K procede de una muestra de 100 problemas, no del conjunto completo; tres de los siete fallos se debieron al tope de 512 tokens, lo que sugiere que el rendimiento real con más presupuesto de generación podría ser superior.
- No hay información publicada sobre sesgos, idiomas soportados ni comportamiento en dominios distintos de los evaluados.
- La licencia es "other" y no se detalla su texto en la información disponible; es imprescindible consultar los términos del modelo base NousResearch/Arete-27B antes de cualquier uso comercial.
- El pack está verificado únicamente en una RTX 5080 con el runtime propietario Gosset; el rendimiento en otras GPU o con otros runtimes no está documentado.
- El runtime de referencia y el instalador de Windows se distribuyen por separado (GossetWorks/GossetRunner); el pack no es directamente consumible por vLLM, llama.cpp o TGI según la información disponible.
- El recuento de parámetros que reporta Hugging Face (4.810.711.024) no refleja el tamaño real del modelo; herramientas que dependan de ese campo pueden clasificar mal el modelo.
- Riesgo de alucinación: no cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GossetWorks/Arete-27B-Gosset-3.65BPW
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Runtime Gosset Runner: https://huggingface.co/GossetWorks/GossetRunner
- Instalador Windows: https://huggingface.co/GossetWorks/GossetRunner (archivo `GossetRunnerSetup-1.0.0-win64.exe`)
- Conjunto de evaluación Propaganda_Eval: https://huggingface.co/NousResearch/Propaganda_Eval
- Paper, blog o repositorio del método Gosset Packing: no disponible en la información proporcionada.
