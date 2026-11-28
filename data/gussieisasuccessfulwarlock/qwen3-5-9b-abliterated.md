# gussieIsASuccessfulWarlock/qwen3.5-9b-abliterated

## Resumen

Qwen3.5-9B-abliterated es una variante "decensored" del modelo base Qwen/Qwen3.5-9B-Base, publicada por el usuario gussieIsASuccessfulWarlock. El modelo conserva la arquitectura y los pesos del Qwen3.5-9B original, pero se ha sometido a un proceso de ablation de direcciones de rechazo mediante la herramienta Heretic v2.1.0, con el objetivo de eliminar las respuestas de negativa ante peticiones que el modelo original rechazaria. El resultado es un modelo multimodal (image-text-to-text) de 9.409.813.744 parametros con licencia Apache 2.0.

El modelo hereda las capacidades del Qwen3.5-9B: una base vision-lenguaje con fusion temprana, arquitectura hibrida que combina Gated DeltaNet (atencion lineal) con atencion con compuertas, y un contexto nativo de 262.144 tokens extensible hasta 1.010.000. Segun la model card del autor, el proceso de ablation reduce los rechazos de 100/100 a 3/100 en su evaluacion interna, con una divergencia KL de 0,0525 respecto al modelo original.

Es relevante para desarrolladores e investigadores que necesitan un modelo multimodal de ~9B sin los filtros de rechazo del modelo base, ya sea para investigacion sobre alineacion, generacion creativa sin restricciones o evaluacion de sesgos. No obstante, la eliminacion de rechazos conlleva riesgos importantes de seguridad y calidad que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder: Gated DeltaNet (atencion lineal) + Gated Attention, layout 8 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No disponible (no se describe como MoE en la informacion; la model card menciona "sparse Mixture-of-Experts" en las notas generales de Qwen3.5, pero no se confirma para esta variante de 9B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatibilidad con cuantizacion no documentada en la informacion) |
| Idiomas soportados | No disponible en la ficha del modelo; la model card del base menciona 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Dimension oculta | 4096 |
| Capas | 32 |
| Token embedding | 248.320 (padded) |
| Cabezas de atencion (Gated Attention) | 16 para Q, 4 para KV; dimension de cabeza 256; RoPE dim 64 |
| Cabezas de atencion lineal (Gated DeltaNet) | 32 para V, 16 para QK; dimension de cabeza 128 |
| Dimension intermedia FFN | 12.288 |
| Tamano del repo | 18,9 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura hibrida que intercala bloques de Gated DeltaNet (una forma de atencion lineal con estado recurrente) y bloques de Gated Attention clasica, en un patron de 3 bloques lineales por cada bloque de atencion completa, repetido 8 veces. Esta combinacion busca alto throughput de inferencia con baja latencia, manteniendo capacidad de modelado de largo contexto. Incluye un vision encoder para entrada de imagenes y fue entrenado con multi-token prediction (MTP). El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000.

El entrenamiento del base incluye pre-entrenamiento y post-entrenamiento con aprendizaje por refuerzo escalado en entornos multiagente, segun la model card de Qwen. La variante abliterated aplica un proceso de Arbitrary-Rank Ablation (ARA) con Heretic v2.1.0: modifica las capas 16 a 30 con pesos de preservacion de comportamiento correcto de 0,8743, direccion de mal comportamiento de 0,0002, sobrecorreccion relativa de 0,9971 y un vecindario de 15. Este proceso elimina direcciones de activacion asociadas a rechazos sin reentrenar los pesos completos.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y conocimiento general (STEM, humanidades).
- Generacion y comprension de codigo.
- Matematicas y resolucion de problemas.
- Comprension de imagenes (image-text-to-text) gracias al vision encoder integrado.
- Procesamiento de contexto largo: hasta 262.144 tokens nativos, extensible a 1.010.000.
- Capacidades multilingues heredadas del base (hasta 201 idiomas segun la model card de Qwen, no confirmado en la ficha de esta variante).
- Soporte de tool calling y function calling: no documentado explicitamente en la informacion disponible para esta variante; el base Qwen3.5 se presenta como apto para agentes.
- Modo thinking: no documentado para esta variante.
- Eliminacion de rechazos: responde a peticiones que el modelo original rechazaria (3/100 rechazos segun evaluacion del autor).

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como la ablation de direcciones de rechazo afecta al comportamiento del modelo, comparando respuestas con el base original y midiendo la divergencia KL reportada (0,0525).
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin las negativas del modelo alineado, adecuado para autores que necesitan explorar contenido adulto o controvertido de forma controlada.
- Analisis de documentos extensos con imagenes: gracias al contexto de 262.144 tokens y al vision encoder, puede procesar informes largos con graficos, tablas e imagenes en una sola pasada.
- Evaluacion de sesgos y robustez: util como modelo de contraste en estudios que comparan modelos censurados frente a no censurados, midiendo diferencias en toxicidad, utilidad y coherencia.
- Prototipado de asistentes conversacionales: su tamano de ~9B permite desplegarlo en una sola GPU para iterar rapidamente en desarrollo de chatbots multi-turno con contexto largo.
- Procesamiento de imagenes y texto combinados: extraccion de informacion de capturas, diagramas o documentos escaneados junto con instrucciones en lenguaje natural, en pipelines de automatizacion documental.
- Simulacion de dialogos adversariales: generacion de respuestas a prompts maliciosos para entrenar clasificadores de seguridad o sistemas de moderacion, al no bloquear las peticiones.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de rendimiento del proceso de ablation, no de benchmarks academicos estandar:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0525 | 0 (por definicion) |

La model card del base Qwen3.5-9B incluye resultados de benchmarks (MMLU-Pro, etc.) comparando con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking y Qwen3-30BA3B-Thinking-2507, pero la informacion proporcionada solo muestra parcialmente la tabla (MMLU-Pro: 82,5 para Qwen3.5-9B). No se dispone de la tabla completa ni de resultados especificos de esta variante abliterated en benchmarks academicos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos (9,41B parametros x 2 bytes), mas overhead de activaciones y KV cache; se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion de 8 bits: ~9,4 GB de pesos; en 4 bits: ~4,7 GB de pesos. Los formatos de cuantizacion no estan documentados en la informacion, pero al ser safetensors compatible con transformers, se puede cuantizar con herramientas estandar.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue en produccion; RTX 4090 (24 GB) para inferencia en BF16 ajustada o cuantizada.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con contexto moderado, y en GPUs de 16 GB (RTX 4080, 4070 Ti Super) con cuantizacion de 8 bits o inferior.
- Opciones de despliegue: transformers (libreria indicada), vLLM, SGLang, KTransformers (segun la model card del base). llama.cpp y Ollama no estan confirmados para esta arquitectura hibrida.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-abliterated (este) | 9,41B | 262.144 (ext. 1.010.000) | Texto + imagen | Apache 2.0 | Sin rechazos (3/100), KL 0,0525 |
| Qwen3.5-9B (base) | 9B | 262.144 (ext. 1.010.000) | Texto + imagen | Apache 2.0 | Modelo alineado, 100/100 rechazos |
| Qwen3.5-4B | 4B (aprox.) | No disponible | Texto + imagen | Apache 2.0 | Version menor de la familia |
| GPT-OSS-20B | 20B (aprox.) | No disponible | Texto | No disponible | Referencia en benchmarks del base |

No se dispone de datos de benchmarks comparativos completos para esta variante abliterated frente a alternativas no censuradas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de rechazos implica que el modelo puede generar contenido danino, ilegal o eticamente problematico; no es apto para despliegue publico sin moderacion externa.
- Riesgo elevado de alucinacion: el proceso de ablation puede degradar la calibracion del modelo al alterar activaciones en capas 16-30; la divergencia KL de 0,0525 indica cambios medibles en la distribucion de salida.
- Sesgos conocidos: hereda los sesgos del base Qwen3.5 y la ablation puede amplificar respuestas estereotipadas o sesgadas al eliminar mecanismos de cautela.
- Idiomas: la ficha de esta variante no documenta idiomas soportados; se asume herencia del base (201 idiomas) pero no esta confirmado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo; el uso comercial de contenido generado sin filtros conlleva responsabilidad legal.
- La arquitectura hibrida (Gated DeltaNet) puede no estar soportada por todas las herramientas de inferencia; verificar compatibilidad con llama.cpp y Ollama antes de desplegar.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validacion comunitaria.
- No se documentan modos thinking ni soporte de tool calling especifico para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gussieIsASuccessfulWarlock/qwen3.5-9b-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Heretic (herramienta de ablation): https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
