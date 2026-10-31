# kcarly/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin filtros de rechazo) del modelo Qwen3.8-27B de Qwen, publicada por el usuario kcarly en Hugging Face siguiendo el trabajo de huihui-ai. La abliteración es una técnica que modifica los pesos del modelo para eliminar sus comportamientos de negativa (refusals) sin necesidad de reentrenamiento, usando una implementación conceptual basada en la eliminación de rechazos con Transformers. El resultado es un modelo de 27.320.697.856 parámetros con capacidades de texto e imagen (pipeline image-text-to-text) distribuido en formato GGUF para su ejecución local con llama.cpp, CUDA o Metal.

La ficha es relevante porque no se limita a una única variante: el repositorio incluye series derivadas de múltiples fuentes (unsloth, ISTA-DASLab GSQ-RCO, prism-ml Ternary-Bonsai con atención híbrida ternaria, Swift y Underdog-Saluki), con esquemas de cuantización mixta (Q2_K_L a Q8_0_L) diseñados para preservar la calidad de respuesta tras la abliteración. El autor ablitera solo las capas 22 a 52 (en algunas series 17 a 52), conservando las primeras capas intactas para minimizar la degradación del modelo base.

Cabe destacar que el modelo conserva intactos los módulos de MTP (multi-token prediction) y visual del modelo original, y que la variante ternaria requiere un fork específico de llama.cpp de PrismML, ya que los kernels de atención híbrida ternaria no son compatibles con el llama.cpp estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (detalles completos no disponibles); incluye módulos MTP y visual |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 262.144 tokens (según el ejemplo de llama.cpp: `-c 262144`) |
| Tipos de cuantizacion | Q2_K_L, Q3_K, Q4_K, Q5_K, Q6_K, Q6_K_L, Q8_0, Q8_0_L, BF16 (con cuantización mixta por tipo de tensor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base Qwen3.8-27B está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer de 27 mil millones de parámetros con atención híbrida (según los tags del repositorio: hybrid-attention) y capacidades multimodales de entrada imagen-texto a texto. Incluye un módulo de MTP (multi-token prediction) para decodificación especulativa, que no ha sido modificado en el proceso de abliteración. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada.

La abliteración se aplica selectivamente: solo se modifican las capas 22 a 52 (indexación desde 0) en las series más recientes, o 17 a 52 en la serie UD original, dejando las primeras capas sin modificar para retener el máximo rendimiento del modelo original. En las variantes por debajo de Q8_0, los tensores afectados por la abliteración (token_embd, output, ffn_down, ssm_out, attn_output) se reconvierten a Q8_0 para mejorar la calidad de respuesta, lo que da lugar a los ficheros con sufijo `_L`. La presencia del tensor `ssm_out` sugiere componentes de tipo SSM o híbrido en la arquitectura, aunque el detalle no está documentado. La variante Ternary proviene de prism-ml/Ternary-Bonsai-2-27B, con pesos ternarios y cuantización parcialmente convertida de PTQ1 a Q2_K o Q3_K.

## Capacidades

- Generacion de texto conversacional sin mecanismos de rechazo (abliterated/uncensored).
- Comprension de imagenes: pipeline image-text-to-text; el modulo visual del modelo base se conserva intacto.
- Contexto largo: hasta 262.144 tokens segun la configuracion de ejemplo en llama.cpp.
- Decodificacion especulativa mediante MTP (multi-token prediction), sin modificar en la abliteracion.
- Ejecucion local en GPU (CUDA), Apple Silicon (Metal) y on-device mediante llama.cpp y Ollama.
- Variantes con pesos ternarios (Ternary-Bonsai) para inferencia eficiente con kernels de atencion hibrida especializados.
- Soporte de tool calling, capacidades de agentes y razonamiento multi-paso: no disponible (no documentado en la informacion proporcionada).

## Casos de uso

- Asistentes conversacionales locales sin restricciones: la abliteracion elimina los refusals, util para investigadores que estudian el comportamiento de modelos sin alineamiento por rechazo, ejecutandose offline con Ollama o llama.cpp.
- Analisis de documentos con contexto largo: con 262.144 tokens de ventana, puede procesar documentos extensos o multiples ficheros en una sola sesion local.
- Comprension multimodal en el borde (on-device): al conservar el modulo visual intacto, permite describir y razonar sobre imagenes en estaciones de trabajo con GPU de consumo o en Mac con Metal.
- Investigacion en abliteracion y seguridad de modelos: el repositorio documenta que capas se abliteran en cada serie (22-52 o 17-52), lo que lo hace util como material de estudio comparativo de tecnicas de eliminacion de rechazos.
- Inferencia eficiente con pesos ternarios: la variante Ternary-Bonsai permite experimentar con cuantizacion ternaria y atencion hibrida usando el fork de llama.cpp de PrismML.
- Despliegue rapido en entornos sin censura de proveedor: al ser GGUF con licencia Apache 2.0, puede integrarse en pipelines propios sin dependencia de APIs externas.
- Pruebas de degradacion por cuantizacion: las variantes Q2_K_L a Q8_0_L con reconvertion selectiva de tensores permiten evaluar el impacto de la cuantizacion agresiva sobre la abliteracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como referencia, un modelo de 27B en Q4_K ocupa en torno a 15-17 GB y en Q8_0 en torno a 28-30 GB, mas el KV cache para contextos de hasta 262.144 tokens, que puede ser muy exigente (varias decenas de GB adicionales segun la configuracion).
- GPU recomendadas: no disponible de forma explicita; para la variante BF16 se requiere hardware de gama alta (del tipo A100/H100 con 40-80 GB). Para Q4_K, una RTX 3090/4090 de 24 GB es plausible con contextos moderados.
- Consumer GPU: las cuantizaciones Q2_K_L a Q5_K deberian caber en GPUs de 24 GB (RTX 3090/4090); con contextos muy largos puede ser necesario offload parcial a RAM.
- Apple Silicon: compatible via Metal segun los tags del repositorio; los Mac con memoria unificada de 32-64 GB podrian ejecutar las cuantizaciones bajas.
- Despliegue: llama.cpp (version reciente; obligatorio el fork PrismML-Eng/llama.cpp para la variante Ternary), Ollama (`ollama run huihui_ai/Qwen3.8-abliterated`), compatible con CUDA y Metal. No se menciona soporte para vLLM o TGI.
- Latencia y throughput: no disponibles; el modulo MTP del modelo base sugiere aceleracion por decodificacion especulativa, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3B | 262.144 tokens | GGUF | Apache 2.0 | Abliterated, multimodal, multiples cuantizaciones mixtas |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | safetensors | no disponible | Modelo original con refusals y alineamiento |
| unsloth/Qwen3.8-27B-GGUF | 27,3B | no disponible | GGUF | no disponible | Cuantizaciones estandar sin abliterar |

No hay datos de rendimiento comparativo disponibles para elaborar una comparativa de benchmarks.

## Limitaciones y advertencias

- Al tratarse de un modelo abliterated, se han eliminado los mecanismos de rechazo: puede generar contenido perjudicial, ilegal o inseguro sin las salvaguardas del modelo original. Su uso conlleva responsabilidad legal y etica para el desplegador.
- La abliteracion selectiva (solo capas 22-52 o 17-52) puede provocar respuestas con pequenos disclaimers residuales, segun advierte el propio autor.
- Las cuantizaciones mixtas `_L` no son estandar: Q2_K_L puede ser mas grande que Q3_K o Q4_K, y la calidad puede variar respecto a cuantizaciones convencionales.
- La variante Ternary no funciona con llama.cpp estandar: requiere el fork PrismML-Eng/llama.cpp.
- El tamano del repositorio (799,7 GB) es muy elevado debido a la multiplicidad de variantes; descargar el repo completo no es practico, conviene seleccionar ficheros concretos.
- Riesgo de alucinacion: inherente al modelo base; la abliteracion no reduce este riesgo y la cuantizacion agresiva (Q2_K) puede agravarlo.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; asumir herencia del modelo base Qwen (multilingue) sin confirmacion documental.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y sus condiciones derivadas deben verificarse por el usuario.
- Varias series (Swift, Underdog-Saluki, Ternary, GSQ-RCO, UD-DW) estan marcadas por el autor como pruebas de validacion, no como versiones estables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kcarly/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original de huihui-ai referenciado: huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF (en Hugging Face)
- Herramienta de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Fork de llama.cpp para la variante Ternary: https://github.com/PrismML-Eng/llama.cpp
- Variantes derivadas: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF, https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF, https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf, https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF, https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp
