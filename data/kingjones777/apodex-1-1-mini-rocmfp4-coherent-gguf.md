# kingjones777/Apodex-1.1-mini-ROCmFP4-COHERENT-GGUF

## Resumen

Apodex-1.1-mini-ROCmFP4-COHERENT-GGUF es una cuantización de 4 bits en formato GGUF del modelo apodex/Apodex-1.1-mini, publicada por el usuario kingjones777. El modelo base es un MoE híbrido derivado de Qwen3.5, con 40 capas que combinan atención lineal con atención completa cada cuatro capas, 256 expertos enrutados (8 activos por token) más un experto compartido, y una ventana de contexto de 262.144 tokens. El checkpoint original cuenta con 34.660.610.688 parámetros totales.

La particularidad de esta publicación no es el modelo en sí, sino el formato de cuantización: `Q4_0_ROCMFP4_COHERENT` (ftype 102), un layout de 4 bits con escala UE4M3 desarrollado por el autor para el runtime ROCmFPX, un fork de llama.cpp orientado a GPUs AMD. Está pensado específicamente para el hardware Strix Halo (gfx1151), es decir, el AMD Ryzen AI Max+ 395 con memoria unificada. La build protege deliberadamente la tabla de embeddings y el LM head en Q6_K para preservar la coherencia de los logits.

Es relevante ahora porque documenta un caso poco habitual: cuantización de un MoE de 34.000 millones de parámetros para inferencia en memoria unificada de consumo profesional, con un formato propietario que no funciona en llama.cpp estándar. El resultado es un archivo de 18,48 GiB que cabe en los 125 GiB de memoria unificada del Ryzen AI Max+ 395 y alcanza 63,30 tok/s con offload completo en una máquina ociosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (híbrida: atención lineal + atención completa cada 4 capas, MoE) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 8 expertos enrutados de 256 + experto compartido (recuento de parámetros activos no disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | `Q4_0_ROCMFP4_COHERENT` (ftype 102), cuerpo en ROCmFP4 4-bit con escala UE4M3; embeddings y `output.weight` en Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (733 tensores, 19.846.167.808 bytes, 4,58 bpw) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE híbrido de 40 capas que alterna atención lineal con atención completa cada cuatro capas, siguiendo el linaje de Qwen3.5. Cada capa MoE dispone de 256 expertos enrutados de los que se activan 8 por token, más un experto compartido siempre activo. El checkpoint original emplea tensores de expertos fusionados (`mlp.experts.gate_up_proj` y `mlp.experts.down_proj`), y `tie_word_embeddings` está a `false`, por lo que `output.weight` es un tensor independiente y real. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica de esta publicación reside en el proceso de cuantización, no en el entrenamiento. El autor convirtió el checkpoint con `convert_hf_to_gguf.py` en modo `bf16 --no-mtp`, generando 733 tensores y 69.376.638.528 bytes, y después cuantizó con `llama-quantize` a 16 hilos usando `--output-tensor-type q6_K`. La decisión de mantener la tabla de embeddings (`token_embd.weight`) y el LM head (`output.weight`) en Q6_K responde a que, al no estar atados, un `output.weight` a 4 bits degradaría los logits de todos los tokens. El histograma final de tipos es Q4_0_ROCMFP4 x430, F32 x301 y Q6_K x2. El archivo no incluye torre de visión ni cabeza MTP: el conversor falló al fusionar los tensores `mtp.layers.0.mlp.experts.*` desfusionados del checkpoint (`KeyError` en el bucle de merge de Qwen2Moe), por lo que se convirtió con `--no-mtp` y no hay decodificación especulativa disponible desde este archivo.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento nativo (`<think>`), verificado en la salida de muestra del autor.
- Razonamiento multi-paso: el ejemplo incluido muestra descomposición explícita de la tarea en pasos antes de responder.
- Capacidad multilingüe: no documentada en la información disponible.
- Tool calling y function calling: no documentado en la model card; el tag `endpoints_compatible` sugiere compatibilidad con endpoints estándar, pero no se confirma soporte de herramientas.
- Visión: no disponible. El repositorio upstream es multimodal, pero este GGUF solo incluye el modelo de lenguaje y no lleva `mmproj`.
- Decodificación especulativa MTP: no disponible en este archivo.
- Contexto largo: ventana declarada de 262.144 tokens, aunque las pruebas funcionales se hicieron con `-c 2048`.

## Casos de uso

- Inferencia local en hardware Strix Halo: un Ryzen AI Max+ 395 con 125 GiB de memoria unificada puede cargar el archivo completo con `-ngl 999` y servir un MoE de 34.000 millones de parámetros sin GPU dedicada, aprovechando que el formato ROCmFP4 está optimizado para gfx1151.
- Asistente conversacional con razonamiento visible: el modo de pensamiento nativo permite desplegar un chatbot que muestre su cadena de razonamiento antes de la respuesta final, útil en entornos educativos o de depuración de prompts.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite ingerir contratos, expedientes o bases de código extensas en una sola pasada, siempre que se disponga de memoria suficiente para el KV cache.
- Servicio multi-tenant en un solo nodo: el autor documenta 8 instancias de `llama-server` conviviendo en la misma máquina con ~107 GiB de memoria unificada ocupada, lo que demuestra la viabilidad de servir varios modelos o réplicas en un único equipo de escritorio de gama alta.
- Prototipado e investigación en cuantización: el formato ROCmFP4 con protección selectiva de tensores sirve como banco de pruebas para estudiar el impacto de la cuantización del LM head en la coherencia de modelos con embeddings no atados.
- Evaluación de modelos MoE sin infraestructura de datacenter: permite a un investigador individual probar un MoE de 256 expertos en su estación de trabajo, comparando su comportamiento frente a modelos densos del mismo orden de magnitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no realizó barridos de benchmarks, ni de contexto, ni cálculos de perplejidad.

Los únicos datos medidos son de rendimiento de inferencia:

| Metrica | Valor | Condiciones |
|---|---|---|
| Generacion, offload completo | 63,30 tok/s | Ryzen AI Max+ 395 (gfx1151), ROCm 7.2.4, `-ngl 999`, contexto 32K, 128 tokens, greedy, máquina ociosa |
| Generacion, offload parcial | 1,183 tok/s | 17/40 capas en ROCm0, resto en CPU-mmap, `-c 2048`, 64 tokens (54,1 s), máquina con 8 servidores activos |
| Procesamiento de prompt | 19 tokens en 14,75 s | Offload parcial, mismas condiciones |
| Memoria disponible | 16,5 GiB antes → 7,0 GiB después | Offload parcial |

La diferencia entre ambas cifras se debe al streaming de capas residentes en CPU, no al path de ROCm. El autor no midió throughput con offload completo en las condiciones iniciales.

## Requisitos de hardware

- VRAM/memoria: el archivo ocupa 18,48 GiB (19.846.167.808 bytes). Con contexto de 32K y offload completo cabe en los 125 GiB de memoria unificada del Ryzen AI Max+ 395, dejando margen amplio para el KV cache.
- GPU recomendadas: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) es el objetivo declarado. No hay datos sobre otras GPU AMD o NVIDIA, y el formato ROCmFP4 solo existe en el fork ROCmFPX.
- GPU de consumo: no se documenta funcionamiento en RTX 4090 ni en GPUs de consumo convencionales. El requisito real es soporte del runtime ROCmFPX, no solo capacidad de memoria.
- Despliegue: exclusivamente mediante el fork ROCmFPX de llama.cpp (`llama-server`, `llama-quantize`). llama.cpp estándar no carga el archivo. Comando de referencia: `llama-server -m apodex-1.1-mini-Q4_0_ROCMFP4_COHERENT.gguf -dev ROCm0 -fa on -ngl 999 -c 8192`.
- Latencia y throughput: 63,30 tok/s con offload completo en máquina ociosa; 1,183 tok/s con offload parcial de 17/40 capas bajo carga concurrente.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos, y las diferencias de formato (ROCmFP4 propietario) impiden una comparación directa con cuantizaciones GGUF estándar del mismo modelo base.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Apodex-1.1-mini-ROCmFP4-COHERENT | 34,66 B totales (MoE, 8/256 activos) | 262.144 | Apache 2.0 | GGUF ROCmFP4 | Requiere fork ROCmFPX |
| apodex/Apodex-1.1-mini (base) | 34,66 B totales | 262.144 | Apache 2.0 | safetensors | Multimodal, incluye torre de visión y MTP |
| Otras cuantizaciones del mismo base | 34,66 B totales | 262.144 | Apache 2.0 | GGUF estándar | No disponibles en la información proporcionada |

## Limitaciones y advertencias

- Incompatibilidad de runtime: el formato `Q4_0_ROCMFP4_COHERENT` (ftype 102) solo existe en el fork ROCmFPX de llama.cpp. llama.cpp estándar, Ollama, vLLM y TGI no pueden cargar el archivo.
- Sin torre de visión: el modelo base es multimodal, pero este GGUF es solo texto. No se incluye `mmproj`.
- Sin cabeza MTP: no hay decodificación especulativa disponible, lo que limita el throughput máximo alcanzable en comparación con el checkpoint original.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni perplejidad. La única validación es una comprobación funcional de carga y generación.
- Rendimiento dependiente del hardware: las cifras de 63,30 tok/s corresponden exclusivamente a un Ryzen AI Max+ 395 ocioso con ROCm 7.2.4. No hay datos para otras configuraciones.
- Idiomas no documentados: se desconoce el soporte multilingüe real y la calidad por idioma.
- Riesgo de alucinación: no evaluado. No se han publicado mediciones de factualidad ni de tasas de alucinación.
- Sesgos: no documentados en la información disponible.
- Licencia: Apache 2.0 permite uso comercial de los pesos, pero el runtime ROCmFPX es un fork de terceros con sus propios términos, que se aplican al software y no a los pesos.
- Contexto práctico: aunque se declaran 262.144 tokens, las pruebas se ejecutaron con `-c 2048` y `-c 8192`; no se ha verificado el comportamiento en ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Apodex-1.1-mini-ROCmFP4-COHERENT-GGUF
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Runtime ROCmFPX (fork de llama.cpp): https://github.com/charlie12345/ROCmFPX
