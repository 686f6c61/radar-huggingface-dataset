# maternion/Hy-MT3-1.8B-FP8-GGUF

## Resumen

Hy-MT3-1.8B-FP8-GGUF es la conversión no oficial a formato GGUF del checkpoint oficial `tencent/Hy-MT3-1.8B-FP8`, un modelo de traducción automática multilingüe de la tercera generación de la familia Hy-MT de Tencent. El repositorio, publicado por el usuario independiente `maternion`, preserva los pesos originales en FP8 (F8_E4M3) con sus escalas por tensor, sin dequantizar ni recuantizar, de modo que el resultado es un artefacto de referencia a 8 bits por peso (aproximadamente 8 bpw) pensado para su uso con llama.cpp.

El modelo base resuelve traducción automática entre 102 idiomas, ampliando la cobertura de las 38 lenguas de Hy-MT2, y está diseñado para respetar restricciones del usuario (glosarios, formato, terminología). Con 1.791.080.896 parámetros (aproximadamente 1,8 mil millones), es la variante ligera de una familia que también incluye versiones de 7B y 30B-A3B (MoE).

La relevancia de este repositorio concreto es técnica: demuestra el soporte de llama.cpp para pesos FP8 con escalas externas (`ggml_mul_mat_ext`), una capacidad introducida en el build b12818 (commit `a38695013`, PR #28898, fusionado el 2026-11-27). Se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a quien necesite ejecutar el checkpoint FP8 oficial en CPU, CUDA/HIP o Metal sin pérdida adicional por recuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 1.791.080.896 (aproximadamente 1,8B) |
| Parametros activos | no aplica (no es MoE; la variante MoE de la familia es Hy-MT3-30B-A3B) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 4096` y `-c 2048`, pero no se declara el máximo) |
| Tipos de cuantizacion | FP8 F8_E4M3 con escalas por tensor (F32 `.scale` y `.input_scale`); no se puede recuantizar con `llama-quantize` |
| Idiomas soportados | 102 idiomas (según la model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (802 tensores: 224 F8_E4M3, 577 F32, 1 BF16); el checkpoint original es `compressed-tensors` FP8 |

## Arquitectura y entrenamiento

El modelo base Hy-MT3-1.8B es un transformer de aproximadamente 1,8 mil millones de parámetros especializado en traducción multilingüe, tercera generación de la familia Hy-MT de Tencent. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF o DPO; tampoco se especifican innovaciones arquitectónicas internas como atención lineal o decodificación especulativa. La model card del modelo base sí reporta mejoras cualitativas frente a Hy-MT2 medidas sobre datos de escenarios reales: reducción del 43 % en muestras con errores de traducción, del 74 % en omisiones o adiciones y del 40 % en errores de seguimiento de instrucciones.

La contribución técnica de este repositorio es el proceso de conversión. El checkpoint original es un `compressed-tensors` con `format: naive-quantized` y `strategy: tensor`: las 224 proyecciones lineales están cuantizadas a 8 bits con una escala estática por tensor para pesos y otra para activaciones. El conversor `convert_hf_to_gguf.py` solo reconocía `float-quantized` como FP8, por lo que la conversión requería un cambio de una línea en `conversion/base.py` para aceptar también `naive-quantized`. El GGUF resultante conserva los 224 tensores en F8_E4M3 con sus escalas externas, aplicadas en inferencia mediante `ggml_mul_mat_ext`; el embedding de tokens se mantiene en BF16 y las 129 normas en F32.

## Capacidades

- Traducción automática multilingüe entre 102 idiomas, con orientación explícita a fidelidad y respeto de restricciones del usuario (glosarios, terminología, formato).
- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Seguimiento de instrucciones de traducción, con una reducción reportada del 40 % en errores de este tipo frente a Hy-MT2.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo thinking: la familia Hy-MT3 distingue modo con y sin razonamiento según la model card del modelo base; para esta variante de 1,8B no se detalla en la información proporcionada.

## Casos de uso

- Traducción de documentación técnica en pipelines de CI/CD: el modelo puede traducir ficheros Markdown o reStructuredText entre los 102 idiomas soportados, integrándose como paso de un pipeline con llama.cpp en CPU o GPU y validación posterior de enlaces y bloques de código.
- Localización de interfaces de producto: con 1,8B de parámetros y pesos FP8 de 1,90 GiB, cabe en hardware modesto y permite traducir cadenas de UI por lotes respetando glosarios de terminología de producto.
- Traducción con restricciones de terminología en dominios regulados (legal, sanitario): la mejora del 40 % en seguimiento de instrucciones frente a Hy-MT2 lo hace adecuado para prompts que imponen glosarios obligatorios, con revisión humana posterior.
- Servicio de traducción de bajo consumo en el borde: al ejecutarse con llama.cpp en CPU, CUDA/HIP o Metal, puede desplegarse en estaciones de trabajo o servidores sin GPU dedicada, con un throughput medido de 51,1 t/s de generación en una AMD Radeon RX 9060 XT bajo ROCm.
- Referencia de evaluación de FP8 en llama.cpp: útil para equipos que quieran validar el soporte de matmul con escalas (`ggml_mul_mat_ext`) en sus propios backends antes de adoptarlo en producción.
- Traducción de conversaciones multi-turno: la etiqueta `conversational` y el formato de chat permiten usarlo en asistentes que traduzcan hilos de soporte, aunque el contexto máximo real no está declarado y conviene limitarlo a ventanas de 2K-4K tokens según los ejemplos de la model card.
- Generación de subtítulos y transcripciones traducidas: al ser un modelo de texto, encaja aguas abajo de un sistema ASR para traducir segmentos cortos con baja latencia en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. La model card del modelo base menciona comparaciones cualitativas (reducción del 43 % de errores de traducción, 74 % de omisiones/adiciones y 40 % de errores de instrucciones frente a Hy-MT2) y afirma que Hy-MT3-1.8B supera a modelos de mayor tamaño, pero no se incluyen cifras por benchmark (BLEU, COMET, MMLU, etc.) en la información proporcionada.

Datos de rendimiento medidos por el autor de la conversión, en una AMD Radeon RX 9060 XT con ROCm, `-dev ROCm0 -ngl 99 -c 2048`:

| Metrica | Valor |
|---|---|
| Throughput de prompt | 7,9 t/s |
| Throughput de generacion | 51,1 t/s |
| Backend | ROCm (AMD Radeon RX 9060 XT) |
| Contexto usado en la medicion | 2048 tokens |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 1,90 GiB; con overhead de contexto y buffers de llama.cpp, se puede asumir un consumo en torno a 2-3 GiB según la longitud de contexto, aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte CUDA, HIP/ROCm o Metal y al menos 4 GB de VRAM; el autor ha verificado funcionamiento en AMD Radeon RX 9060 XT bajo ROCm.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RX 7600 o superiores). También funciona en CPU.
- Opciones de despliegue: llama.cpp exclusivamente (build b12818 o posterior, commit `a38695013`). No hay indicios de compatibilidad con vLLM, TGI u Ollama en la información proporcionada; Ollama podría no reconocer FP8 como cuantización válida.
- Backends soportados: CPU, CUDA, HIP/ROCm y Metal aplican las escalas. Vulkan no está soportado todavía (PR #29791 pendiente) y cae silenciosamente a CPU, con una penalización severa de rendimiento.
- Latencia y throughput: 7,9 t/s de prompt y 51,1 t/s de generación medidos en RX 9060 XT con contexto de 2048 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| maternion/Hy-MT3-1.8B-FP8-GGUF | 1,8B | no disponible | 102 | Apache 2.0 | GGUF FP8 | Conversion no oficial, requiere llama.cpp b12818+ |
| tencent/Hy-MT3-1.8B-GGUF | 1,8B | no disponible | 102 | Apache 2.0 | GGUF Q4_K_M, Q8_0 | Version oficial de Tencent, recuantizada |
| tencent/Hy-MT3-1.8B-FP8 | 1,8B | no disponible | 102 | Apache 2.0 | compressed-tensors FP8 | Checkpoint oficial original, para vLLM y similares |
| Hy-MT3-7B | 7B | no disponible | 102 | no disponible | no disponible | Variante mayor de la misma familia |
| Hy-MT3-30B-A3B | 30B totales, 3B activos (MoE) | no disponible | 102 | no disponible | no disponible | Variante MoE; la model card afirma el mejor rendimiento global en modo sin razonamiento entre los modelos evaluados |

## Limitaciones y advertencias

- Conversión no oficial: el repositorio no está afiliado ni respaldado por Tencent; para producción conviene evaluar el checkpoint oficial o el GGUF oficial de Tencent.
- Dependencia estricta de versión: requiere llama.cpp build b12818 o posterior (commit `a38695013`). Builds anteriores (hasta b12816) rechazan los tipos o cargan sin las escalas, produciendo resultados incorrectos o fallos.
- Vulkan no soportado: el backend Vulkan rechaza los matmul con escala de pesos y cae a CPU de forma silenciosa, degradando gravemente el rendimiento.
- No recuantizable: `llama-quantize` no puede procesar este fichero porque los tensores FP8 son tipos de almacenamiento con escalas externas; debe tratarse como una referencia fija a 8 bpw.
- Sin datos de benchmarks publicados para esta conversión: no hay evidencia en la información proporcionada de que la preservación de FP8 mantenga exactamente la calidad del checkpoint original en todas las plataformas.
- Idiomas y sesgos: aunque se declaran 102 idiomas, no se detalla el rendimiento por lengua ni los sesgos conocidos; es previsible un rendimiento desigual en lenguas de bajos recursos.
- Riesgo de alucinación y errores de traducción: aunque la familia reduce errores frente a Hy-MT2, sigue siendo un modelo de 1,8B y requiere revisión humana en dominios sensibles.
- Contexto máximo no declarado: los ejemplos usan 2048 y 4096 tokens; no se debe asumir una ventana mayor sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero el aviso de conversión no oficial y la dependencia de una versión concreta de llama.cpp deben tenerse en cuenta en la cadena de suministro.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maternion/Hy-MT3-1.8B-FP8-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B-FP8
- GGUF oficial de Tencent: https://huggingface.co/tencent/Hy-MT3-1.8B-GGUF
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección Hy-MT3 en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico Hy-MT3: https://arxiv.org/pdf/2611.27673
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- Sitio oficial: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit con soporte FP8: https://github.com/ggml-org/llama.cpp/commit/a38695013
- PR de soporte de escalas FP8/NVFP4: https://github.com/ggml-org/llama.cpp/pull/28898
- PR de soporte Vulkan pendiente: https://github.com/ggml-org/llama.cpp/pull/29791
