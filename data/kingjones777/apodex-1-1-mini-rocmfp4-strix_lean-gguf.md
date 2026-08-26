# kingjones777/Apodex-1.1-mini-ROCmFP4-STRIX_LEAN-GGUF

## Resumen

Apodex-1.1-mini es un modelo de lenguaje de 35.000 millones de parámetros desarrollado por Apodex, diseñado como un solucionador de problemas de alta exigencia con razonamiento verificado. El modelo base (apodex/Apodex-1.1-mini) es un MoE híbrido derivado de Qwen3.5, con 40 capas de atención lineal y atención completa cada cuarta capa, 256 expertos enrutados (8 activos) y una ventana de contexto de 262.144 tokens. Este repositorio concreto contiene una cuantización GGUF en formato ROCmFP4 específica para el hardware AMD Strix Halo (gfx1151), creada por kingjones777.

La cuantización STRIX_LEAN es la versión más compacta de la serie 4-bit del autor, con el embedding recortado a Q5_K y la cabeza de salida protegida en Q6_K. Está pensada para ejecutarse de forma local en APUs AMD Strix Halo con el runtime ROCmFPX, alcanzando 64,87 tokens por segundo en generación completa en un Ryzen AI MAX+ 395. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE híbrido: 40 capas de atención lineal con atención completa cada 4ª capa) |
| Parámetros totales | 34.660.610.688 (34,66B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q4_0_ROCMFP4_STRIX_LEAN (este archivo); otras variantes del autor: Q4_0_ROCMFP4_COHERENT, Q8_0, Q8_0-AGENT |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipo 106, ftype `Q4_0_ROCMFP4_STRIX_LEAN`) |

## Arquitectura y entrenamiento

El modelo base apodex/Apodex-1.1-mini es un MoE híbrido de 40 capas que alterna atención lineal con atención completa cada cuarta capa. Tiene 256 expertos enrutados de los que se activan 8 por token, más un experto compartido. La cuantización STRIK_LEAN convierte el cuerpo del modelo a ROCm_4 con la receta de calidad K/V de Strix Halo, mantiene la tabla de embeddings en Q5_K y protege la cabeza de salida (`output.weight`) en Q6_K. El archivo contiene 733 tensores, con histograma: Q4_0_ROCMFP4_FAST x380, F32 x301, Q4_0_ROCMFP4 x50, Q6_K x1, Q5_K x1.

El proceso de conversión se realizó con el convertidor del fork ROCmFPX de llama.cpp, con salida BF16 y sin MTP (multi-token prediction), porque el checkpoint no permite fusionar los tensores de MTP. El autor verificó todos los shards del modelo base (15 archivos safetensors, 71,9 GB) contra el manifest de HuggingFace antes de cuantizar. El archivo resultante pesa 17,46 GiB con un bpw de 4,32.

## Capacidades

- Generación de texto y razonamiento complejo con ventana de contexto de 262.144 tokens.
- Soporte de tool calling y function calling (el autor publica una variante específica AGENT con tensores ajustados para este fin).
- Capacidad para ejecutar agentes multi-step y tareas de razonamiento estructurado, según el sistema Apodex que separa el solver del verificador.
- Multilingüe: no confirmado en la información disponible.
- Text-only: este GGUF no incluye el módulo de visión del modelo base (no mmproj).
- Sin soporte de decodificación especulativa (MTP) en esta cuantización.
- Funciona exclusivamente con el runtime ROCmFPX (fork de llama.cpp), no con llama.cpp estándar.

## Casos de uso

- **Despliegue local en hardware AMD Strix Halo**: ejecutar el modelo completo en GPU integrada de una APU como el Ryzen AI MAX+ 395, con 64,87 tok/s y 17,46 GiB de memoria unificada, ideal para entornos sin GPU dedicada.
- **Asistencia de razonamiento científico**: el modelo está diseñado para tareas de investigación complejas donde cada paso del razonamiento debe verificarse, como síntesis de literatura o análisis de datos experimentales.
- **Agentes de tool calling**: la variante AGENT del autor muestra el potencial para integrar el modelo en pipelines de automatización que requieren llamadas a APIs, búsqueda web o ejecución de código.
- **Análisis de documentos largos**: con 262K de contexto, se puede procesar libros completos o conjuntos de artículos técnicos en una sola pasada, para resúmenes o extracción de información.
- **Prototipado de aplicaciones de chat con licencia permisiva**: la licencia Apache 2.0 permite incorporar el modelo en productos comerciales sin restricciones de uso.
- **Investigación en eficiencia de cuantización**: el formato ROCmFP4 es un caso de estudio para cuantización de baja precisión en hardware AMD, útil para evaluar el rendimiento de formatos alternativos a los estándar GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que no ha realizado sweeps de benchmarks ni de perplexity.

En cuanto a rendimiento de inferencia, el autor ha medido la velocidad en un Ryzen AI MAX+ 395 (Strix Halo, gfx1151, ROCm 7.2.4) con el modelo completo en GPU (`-ngl 999`), generación greedy de 128 tokens:

| Variante | Tamaño | Velocidad (tok/s) |
|---|---|---|
| STRIX_LEAN (este archivo) | 17,46 GiB | 64,87 |
| COHERENT | 18,48 GiB | 63,30 |
| Q8_0 | 33,36 GiB | 45,05 |
| Q8_0-AGENT | 33,90 GiB | 32,54 |

## Requisitos de hardware

- **VRAM estimada**: 17,46 GiB para la carga completa del archivo en memoria unificada (con `-ngl 999 --no-mmap`).
- **GPU recomendada**: APU AMD Strix Halo con iGPU gfx1151 (Ryzen AI MAX+ 395 o similar), con ROCm 7.2.4 o superior.
- **Compatibilidad**: no funciona en GPUs NVIDIA ni en hardware AMD anterior a gfx1151; el formato ROCmFP4 es específico del runtime ROCmFPX.
- **Opciones de despliegue**: llama-server del fork ROCmFPX, con el comando `llama-server -m apodex-1.1-mini-Q4_0_ROCMFP4_STRIX_LEAN.gguf -dev ROCm0 -fa on -ngl 999 -c 8192`.
- **Latencia**: 64,87 tok/s en el hardware de referencia (Ryzen AI MAX+ 395), lo que equivale a ~15 ms por token.
- **Alternativas**: no se puede ejecutar con llama.cpp estándar, Ollama ni vLLM sin modificaciones para soportar el formato ROCmFP4.

## Comparativa con modelos similares

La comparativa se realiza entre las variantes del mismo modelo publicadas por el autor, ya que no se dispone de datos de modelos comparables de otros desarrolladores:

| Variante | Tamaño | Velocidad (tok/s) | Característica |
|---|---|---|---|
| STRIX_LEAN (este archivo) | 17,46 GiB | 64,87 | 4-bit con embedding Q5_K, cabeza Q6_K |
| COHERENT | 18,48 GiB | 63,30 | 4-bit con embedding Q6_K, cabeza Q6_K |
| Q8_0 | 33,36 GiB | 45,05 | 8-bit de alta fidelidad |
| Q8_0-AGENT | 33,90 GiB | 32,54 | 8-bit con tensores ajustados para tool calling |

En cuanto al modelo base (apodex/Apodex-1.1-mini, 35B), la documentación del fabricante indica que su rendimiento en modo "Agent Team" se sitúa dentro de un punto de un modelo aproximadamente 28 veces mayor, aunque no se especifica el nombre de ese modelo ni se dan cifras concretas.

## Limitaciones y advertencias

- **No funciona con llama.cpp estándar**: el formato Q4_0_ROCMFP4_STRIX_LEAN solo existe en el fork ROCmFPX; usar llama.cpp oficial dará error de carga.
- **Hardware específico**: diseñado exclusivamente para AMD Strix Halo (gfx1151); no se puede ejecutar en GPUs NVIDIA ni AMD anteriores.
- **Sin MTP (multi-token prediction)**: la cabeza de MTP no se incluye en este archivo; no se puede usar decodificación especulativa.
- **Sin soporte de visión**: el modelo base es multimodal, pero este GGUF solo contiene el modelo de lenguaje; no hay mmproj.
- **Sesgos y alucinaciones**: no se ha publicado información sobre sesgos o evaluación de alucinaciones para esta cuantización.
- **Rendimiento de calidad no verificado**: el autor indica que no ha realizado sweeps de calidad ni de perplexity; la degradación de calidad por cuantización 4-bit no está medida.
- **Licencia**: Apache 2.0, pero el runtime ROCmFPX es un fork de terceros con sus propios términos de uso (aplican al runtime, no a los pesos).
- **Uso en producción**: requiere verificación de estabilidad en cargas prolongadas; el autor no ha publicado resultados de latencia bajo estrés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kingjones777/Apodex-1.1-mini-ROCmFP4-STRIX_LEAN-GGUF
- Variante COHERENT: https://huggingface.co/kingjones777/Apodex-1.1-mini-ROCmFP4-COHERENT-GGUF
- Modelo base: https://huggingface.co/Apodex/Apodex-1.1-mini
- Runtime ROCmFPX (fork de llama.cpp): https://github.com/charlie12345/ROCmFPX
- Blog del fabricante del modelo (Apodex): https://www.explainx.ai/blog/apodex-1-1-agent-team-frontieragent-august-2026
- Sitio oficial de Apodex: https://www.apodex.ai/
- Sitio alternativo de Apodex: https://www.apodex.com/
