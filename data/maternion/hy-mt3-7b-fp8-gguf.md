# maternion/Hy-MT3-7B-FP8-GGUF

## Resumen

Hy-MT3-7B-FP8-GGUF es la conversión a formato GGUF del checkpoint oficial de traducción multilingüe Hy-MT3-7B en FP8, desarrollado por Tencent Hunyuan. Se trata de la tercera generación de la familia de modelos de traducción Hy-MT, que amplía la cobertura lingüística de 38 a 102 idiomas y mejora la fidelidad respecto a las restricciones del usuario. El modelo resuelve el problema de traducción automática de alta calidad con instrucciones, superando a modelos comerciales en tareas de traducción reales.

Esta ficha concreta no es el modelo original, sino un reempaquetado no oficial realizado por el usuario `maternion` que preserva los pesos FP8 originales sin dequantizar, manteniendo las 224 proyecciones lineales en `F8_E4M3` con sus escalas por tensor. El objetivo es ofrecer una referencia de 8 bits por peso (8 bpw) ejecutable en llama.cpp, sin la pérdida adicional de una recuantización a Q4_K_M o Q8_0.

El modelo tiene 7.504.568.768 parámetros totales, licencia Apache 2.0 y está pensado para despliegue en local mediante llama.cpp. Requiere una build reciente (b12818 o superior) que soporte escalas de cuantización para FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se detalla en la informacion disponible) |
| Parametros totales | 7.504.568.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 4096`) |
| Tipos de cuantizacion | FP8 (`F8_E4M3`) con escalas por tensor; no recuantizable con `llama-quantize` |
| Idiomas soportados | 102 idiomas (segun la model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (802 tensores: 224 F8_E4M3, 577 F32, 1 BF16) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del transformer ni sobre la composición del dataset de entrenamiento en la información proporcionada. La model card del modelo base indica que Hy-MT3 es la tercera generación de la familia de traducción de Tencent, con tres tamaños (1.8B, 7B y 30B-A3B MoE) y cobertura de 102 idiomas. Respecto a Hy-MT2, se reporta una reducción del 43% en muestras con errores de traducción, del 74% en omisiones o adiciones y del 40% en errores de seguimiento de instrucciones sobre datos de escenarios reales.

La innovación técnica de este repositorio concreto es el reempaquetado a GGUF preservando los pesos FP8 originales del checkpoint `compressed-tensors` (formato `naive-quantized`, estrategia `tensor`). Las 224 proyecciones lineales conservan sus escalas de peso y de activación por tensor, aplicadas en inferencia mediante `ggml_mul_mat_ext`. No hay recuantización, ni imatrix, ni pérdida adicional. El conversor requirió un parche de una línea en `conversion/base.py` para aceptar `naive-quantized` como formato FP8 válido.

## Capacidades

- Traducción multilingüe entre 102 idiomas, con foco en fidelidad a restricciones del usuario.
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Seguimiento de instrucciones de traducción (tono, terminología, formato).
- Reducción de errores de omisión, adición y mistranslación respecto a la generación anterior.
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales y referencias de API manteniendo terminología consistente gracias a su soporte de instrucciones de estilo y glosario.
- Localización de productos multilingües: con 102 idiomas, permite generar versiones localizadas de textos de marketing y UI desde un único modelo, reduciendo la infraestructura de traducción.
- Traducción jurídica o administrativa asistida: la reducción del 74% en omisiones y adiciones respecto a Hy-MT2 lo hace adecuado para textos donde la fidelidad literal es crítica, siempre con revisión humana.
- Procesamiento por lotes en local: al ejecutarse con llama.cpp en CPU, CUDA/HIP o Metal, permite traducir grandes volúmenes de texto sin depender de APIs externas ni enviar datos a terceros.
- Integración en pipelines de CI/CD de documentación: el formato GGUF y la licencia Apache 2.0 permiten incorporar la traducción automática al flujo de publicación de docs sin costes de licencia.
- Traducción de conversaciones en atención al cliente: el tag `conversational` y el pipeline de generación de texto permiten gestionar turnos de diálogo multilingüe en sistemas de soporte.
- Referencia de evaluación FP8: al preservar los pesos originales sin recuantizar, sirve como baseline de 8 bpw para comparar el impacto de cuantizaciones más agresivas (Q4_K_M, Q8_0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona que Hy-MT3-30B-A3B supera a Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash en modo no-thinking, pero no se aportan cifras numéricas para el modelo de 7B.

Rendimiento medido en el repositorio (AMD Radeon RX 9060 XT, ROCm, `-ngl 99 -c 2048`):

| Metrica | Valor |
|---|---|
| Throughput de prompt | 7,0 t/s |
| Throughput de generacion | 17,1 t/s |

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,5 GiB para los pesos (tamano del archivo GGUF: 7,49 GiB), mas overhead de contexto y KV cache.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta pruebas en AMD Radeon RX 9060 XT con ROCm.
- Cabe en GPU de consumo: si, con al menos 8 GB de VRAM para contexto corto; el ejemplo usa `-c 4096`.
- Backends soportados: CPU, CUDA, HIP (ROCm) y Metal. Vulkan no esta soportado (las matmuls con escala caen a CPU).
- Opciones de despliegue: llama.cpp (build b12818 o superior, commit `a38695013`). No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: 7,0 t/s de prompt y 17,1 t/s de generación en RX 9060 XT con ROCm.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-7B-FP8-GGUF (este) | 7,5B | no disponible | 102 | Apache 2.0 | GGUF FP8 |
| tencent/Hy-MT3-7B-GGUF | 7,5B | no disponible | 102 | Apache 2.0 | GGUF Q4_K_M / Q8_0 |
| tencent/Hy-MT3-7B-FP8 | 7,5B | no disponible | 102 | Apache 2.0 | safetensors FP8 |
| Hy-MT3-1.8B | 1,8B | no disponible | 102 | Apache 2.0 | no disponible |

La diferencia clave frente a `tencent/Hy-MT3-7B-GGUF` es que este repositorio conserva los pesos FP8 originales en lugar de recuantizar, actuando como referencia de 8 bpw. Frente al checkpoint safetensors, ofrece el mismo contenido en un formato ejecutable con llama.cpp.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por Tencent.
- Requiere llama.cpp build b12818 o superior; las builds hasta b12816 fallan o cargan sin escalas.
- Vulkan no está soportado: las matmuls con escala de peso caen a CPU y la inferencia se ralentiza drásticamente.
- `llama-quantize` no puede recuantizar este archivo, ya que los tensores FP8 son tipos de almacenamiento con escalas externas.
- Riesgo de alucinación y errores de traducción inherentes al modelo base, especialmente en idiomas de bajos recursos dentro de los 102 soportados.
- No se documentan sesgos específicos en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el reempaquetado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maternion/Hy-MT3-7B-FP8-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B-FP8
- GGUF oficial de Tencent: https://huggingface.co/tencent/Hy-MT3-7B-GGUF
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección Hy-MT3 en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico Hy-MT3: https://arxiv.org/pdf/2611.27673
- GitHub del proyecto: https://github.com/Tencent-Hunyuan/Hy-MT3
- Sitio oficial: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- Commit de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/commit/a38695013
- PR de soporte FP8 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/28898
- PR de soporte FP8 en Vulkan (abierto): https://github.com/ggml-org/llama.cpp/pull/29791
