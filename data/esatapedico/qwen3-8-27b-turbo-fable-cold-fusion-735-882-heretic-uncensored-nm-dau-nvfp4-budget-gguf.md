# esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-BUDGET-GGUF

## Resumen

Este modelo es un archivo GGUF compacto del fine-tune `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, convertido por esatapedico para ejecutarse en tarjetas gráficas Blackwell con 16 GB de VRAM. La variante `BUDGET` elimina la cabeza MTP (decodificación especulativa) y cuantiza el backbone completo a NVFP4, manteniendo el contexto nativo de 262 144 tokens y la torre de visión del modelo original. Su objetivo es ofrecer la huella de memoria más pequeña posible para servir este ajuste TURBO en una sola GPU de 16 GB, sacrificando algo de precisión en las capas de salida.

El modelo base es un fine-tune de Qwen3.8-27B, un transformer denso híbrido de 27 000 millones de parámetros con atención lineal en 48 de sus 64 capas y atención gated en las restantes, más una torre de visión nativa. La conversión de esatapedico preserva byte a byte los 448 tensores NVFP4 del backbone, pero reduce los tensores de cabecera (lm_head y token embedding) a cuantizaciones Q3_K y Q2_K respectivamente. Esto lo hace adecuado para desarrolladores que necesitan ejecutar un modelo de 27B con contexto largo en hardware de consumo, aunque requiere una GPU Blackwell con soporte `sm_120` y una versión reciente de llama.cpp con kernels NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense hybrid (Gated DeltaNet + Gated Attention), 64 capas, torre de vision nativa |
| Parametros totales | 26 895 998 720 (safetensors original) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (backbone), Q3_K (lm_head), Q2_K (token embedding) |
| Idiomas soportados | Ingles, multilingue (segun tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tensores NVFP4, F32, Q3_K, Q2_K) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso hibrido con atencion lineal en 48 de 64 capas y atencion gated en las otras 16, disenado por Alibaba. Incluye una torre de vision nativa y una cabeza MTP (multi-token prediction) para decodificacion especulativa. Sobre esta base, DavidAU aplico un fine-tune denominado TURBO Fable Cold Fusion Heretic Uncensored, que combina capas de merge (735/882) y DPO sobre datasets de Fable, Cold Fusion y Heretic, orientado a instrucciones, razonamiento, analisis y generacion sin censura.

La conversion de esatapedico toma ese modelo y lo cuantiza a NVFP4 (448 tensores del backbone, 13.69 GB) manteniendo la identidad byte a byte con el resto de la familia. En esta variante `BUDGET`, se elimina la cabeza MTP (configuracion `qwen35.nextn_predict_layers=0`) y se fijan los tensores de salida a Q3_K (lm_head) y Q2_K (token embedding). El archivo resultante contiene 1 107 tensores: 448 NVFP4, 657 F32 (normas, escalas, gates) y 2 de cabecera. No hay decodificacion especulativa.

## Capacidades

- Generacion de texto, razonamiento, analisis y creatividad, con ajuste fino para instrucciones y contenido sin censura.
- Vision multimodal: puede procesar imagenes si se empareja con el proyector `mmproj-BF16.gguf` del repositorio MTP o del modelo base.
- Contexto largo nativo de 262 144 tokens, util para documentos extensos o conversaciones multi-turno.
- Soporte multilingue, aunque el entrenamiento principal esta en ingles.
- Sin soporte de tool calling o function calling documentado en la informacion disponible.
- Sin modo de pensamiento explicito (thinking mode) documentado, aunque el modelo base Qwen3.8 puede tenerlo; no se confirma en esta variante.

## Casos de uso

- Ejecucion local en GPU de 16 GB: permite servir un modelo de 27B con contexto 262K en tarjetas Blackwell como RTX 5090, ideal para desarrolladores que no disponen de hardware de centro de datos.
- Procesamiento de documentos largos: la ventana de 262 144 tokens permite analizar libros, codigo fuente extenso o expedientes completos en una sola pasada.
- Asistente de chat sin censura: el ajuste Heretic/Uncensored lo hace util para prototipos donde se requiere generacion libre sin restricciones politicas o eticas.
- Vision por computadora: con el proyector adecuado, puede describir imagenes o responder preguntas sobre contenido visual, aunque la cuantizacion de cabecera puede degradar la precision.
- Investigacion de arquitecturas hibridas: al ser un GGUF con NVFP4, sirve para estudiar el comportamiento de atencion lineal y gated en hardware consumer.
- Despliegue en entornos con restriccion de memoria: la variante BUDGET (14.72 GB) cabe en una sola GPU de 16 GB, dejando margen para el proyector o contexto adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "benchmarks naive, single run, not comparable across setups", pero no incluye numeros concretos. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas para esta variante especifica.

## Requisitos de hardware

- VRAM estimada: 14.72 GB para el archivo GGUF, mas overhead de ejecucion; cabe en una GPU de 16 GB con margen para contexto y proyector.
- GPU recomendada: cualquier GPU Blackwell con soporte `sm_120` (por ejemplo, RTX 5090, B200, RTX PRO 6000 Blackwell). No funciona en GPUs Ampere o anteriores porque NVFP4 requiere kernels CUDA especificos.
- No cabe en GPUs consumer de generaciones anteriores (RTX 4090, 3090) debido a la falta de soporte NVFP4.
- Opciones de despliegue: llama.cpp / llama-server con compilacion reciente que incluya soporte para GGML type 40 (NVFP4) y `sm_120`. Tambien puede usarse con otros backends que soporten NVFP4, aunque no se documentan.
- Latencia y throughput: no disponibles. La ausencia de MTP implica que no hay decodificacion especulativa, por lo que la velocidad de generacion dependera del hardware y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | FP16/BF16 | Apache 2.0 | Modelo base con MTP y vision |
| DavidAU TURBO Fable... (safetensors) | 27B | 262K | FP16 | Apache 2.0 | Fine-tune sin censura, con MTP |
| esatapedico NVFP4 MTP (familia) | 27B | 262K | NVFP4 + MTP | Apache 2.0 | Variante con cabeza MTP, mayor VRAM |
| esatapedico NVFP4 BUDGET (este) | 27B | 262K | NVFP4 + Q3_K/Q2_K | Apache 2.0 | Sin MTP, minimo VRAM |

La comparativa se limita a la familia del propio modelo, ya que no se dispone de datos de otros modelos similares en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion NVFP4 del backbone y Q3_K/Q2_K de las cabeceras puede degradar significativamente la precision en tareas de razonamiento complejo o generacion de codigo.
- Al eliminar la cabeza MTP, se pierde la decodificacion especulativa, lo que puede aumentar la latencia por token en comparacion con las variantes MTP.
- Requiere hardware Blackwell especifico; no es portable a GPUs mas antiguas.
- El modelo es "uncensored" (sin censura), lo que implica que puede generar contenido ofensivo, ilegal o inapropiado. No es adecuado para aplicaciones comerciales sin moderacion.
- No se han publicado benchmarks formales, por lo que el rendimiento real es desconocido.
- El soporte multilingue esta limitado principalmente al ingles; otros idiomas pueden tener peor calidad.
- La vision requiere un proyector externo (`mmproj-BF16.gguf`) que no se incluye en este repositorio; hay que descargarlo por separado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-BUDGET-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Familia MTP (con proyector): https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-GGUF
- Repositorio GGUF de unsloth (proyector alternativo): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
