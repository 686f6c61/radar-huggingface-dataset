# LueCipherx13x/Qwen-3-VL-8B-Instruct-heretic

## Resumen

Qwen-3-VL-8B-Instruct-heretic es una variante "decensored" (también denominada abliterated) del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, publicada por el usuario LueCipherx13x. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de tipo vision-language que procesa entradas de imagen y texto y genera texto, con un total de 8.767.123.696 parámetros según los pesos en safetensors. La modificación se ha realizado con la herramienta Heretic v1.3.0, que aplica una técnica de abliteration direccional sobre las proyecciones de atención y MLP para reducir la tasa de rechazos del modelo.

El interés de esta ficha reside en dos frentes. Por un lado, documenta una receta reproducible de abliteration sobre un VLM de 8B, con parámetros concretos publicados (direction_index, pesos máximos y mínimos por capa) y métricas de evaluación (divergencia KL de 0,0214 frente al original y una reducción de rechazos de 100/100 a 6/100 en un conjunto de 100 prompts). Por otro, permite evaluar el impacto de este tipo de intervención en un modelo con capacidades avanzadas de percepción visual, OCR multilingüe, comprensión de vídeo y contexto nativo de 256K tokens.

La relevancia práctica es doble: sirve como caso de estudio de las técnicas de abliteration aplicadas a modelos multimodales y como alternativa para flujos donde los rechazos del modelo base resultan un obstáculo (por ejemplo, análisis de contenido sensible legítimo). No obstante, el modelo no cuenta con descargas ni validación de la comunidad en el momento de la consulta, y su licencia Apache 2.0 heredada del original exige verificar las implicaciones de la modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language (Qwen3-VL), con Interleaved-MRoPE, DeepStack y alineación texto-timestamp |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (arquitectura densa) |
| Longitud de contexto | 256K tokens nativos, expandible a 1M |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión original; no se listan GGUF ni AWQ) |
| Idiomas soportados | no disponible (el modelo base soporta OCR en 32 idiomas y capacidades multilingües, sin listado cerrado en la información disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL en su variante densa de 8B: un codificador visual ViT acoplado a un decoder de lenguaje transformer, con tres innovaciones destacadas por el autor original. Interleaved-MRoPE asigna frecuencias posicionales de forma completa sobre tiempo, anchura y altura, lo que mejora el razonamiento sobre vídeo de largo horizonte. DeepStack fusiona características de múltiples niveles del ViT para capturar detalle fino y afinar la alineación imagen-texto. La alineación texto-timestamp sustituye a T-RoPE para localizar eventos con precisión temporal en vídeo. El contexto nativo es de 256K tokens, ampliable a 1M.

Sobre el entrenamiento original no se detallan en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La modificación heretic sí está documentada: se aplica abliteration con Heretic v1.3.0 sobre las proyecciones `attn.o_proj` y `mlp.down_proj`, con un `direction_index` de 19,36 y pesos por capa publicados (por ejemplo, `attn.o_proj.max_weight` 1,49 en posición 21,09 y `mlp.down_proj.max_weight` 0,90 en posición 24,45). El autor indica que el proceso es reproducible y que el resultado presenta una divergencia KL de 0,0214 respecto al modelo base.

## Capacidades

- Generación de texto y razonamiento con calidad equiparable a LLM puros según el autor original, gracias a la fusión texto-visión sin pérdida.
- Comprensión de imágenes: descripción, reconocimiento amplio (celebridades, anime, productos, monumentos, flora y fauna) y razonamiento visual.
- OCR en 32 idiomas, robusto ante poca luz, desenfoque e inclinación, con mejor parsing de estructura en documentos largos y caracteres raros o antiguos.
- Comprensión de vídeo de horas de duración con recuperación completa e indexación a nivel de segundo.
- Percepción espacial avanzada: posiciones de objetos, puntos de vista, oclusiones, grounding 2D y 3D para razonamiento espacial y IA encarnada.
- Agente visual: opera interfaces gráficas de PC y móvil, reconoce elementos, entiende funciones e invoca herramientas.
- Codificación visual: genera Draw.io, HTML, CSS y JS a partir de imágenes o vídeos.
- Razonamiento multimodal en STEM y matemáticas con análisis causal y respuestas basadas en evidencia.
- Soporte de tool calling y flujos agénticos multi-paso (heredado del modelo base).
- Modo "thinking" disponible en la familia Qwen3-VL, aunque esta variante concreta es la edición Instruct.
- Reducción drástica de rechazos respecto al modelo base (6/100 frente a 100/100 en la evaluación del autor).

## Casos de uso

- Análisis de documentos escaneados con OCR multilingüe: el modelo procesa facturas, contratos o formularios en 32 idiomas y mantiene la estructura del documento gracias a su parsing de documentos largos y su contexto de 256K tokens.
- Moderación y análisis de contenido sensible legítimo: la reducción de rechazos permite procesar material que el modelo base declinaría (por ejemplo, imágenes médicas, forenses o de contenido adulto en contextos de investigación), siempre con las salvaguardas externas adecuadas.
- Automatización de interfaces gráficas: como agente visual, reconoce elementos de UI en capturas de PC o móvil, entiende su función e invoca herramientas para completar tareas de RPA.
- Generación de código a partir de maquetas: convierte imágenes o vídeos de diseños en Draw.io, HTML, CSS o JS, útil en prototipado rápido y pipelines de frontend.
- Análisis de vídeo de vigilancia o deportivo: con contexto de 256K y alineación texto-timestamp, localiza eventos con precisión de segundo en grabaciones de horas.
- Investigación en seguridad de IA: sirve como caso reproducible de abliteration sobre un VLM, con parámetros y métricas publicadas, para estudiar el efecto de la intervención en capacidades y sesgos.
- Asistencia en robótica y IA encarnada: el grounding 3D y la percepción espacial permiten razonar sobre posiciones y oclusiones en entornos físicos.

## Benchmarks y rendimiento

El autor solo publica métricas del proceso de abliteration, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante.

| Metrica | Este modelo | Qwen/Qwen3-VL-8B-Instruct |
|---|---|---|
| Divergencia KL | 0,0214 | 0 (por definición) |
| Rechazos | 6/100 | 100/100 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 17,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto corto; para contexto de 256K se requiere hardware con memoria muy superior o paralelismo.
- Cabe en GPU de consumo: sí en RTX 4090, RTX 3090 (24 GB) o RTX 4080 (16 GB) solo con cuantización, que no está publicada en el repo; sería necesario generarla.
- Opciones de despliegue: transformers (versión de desarrollo con `Qwen3VLForConditionalGeneration`, se recomienda `flash_attention_2`), vLLM y TGI si soportan la arquitectura Qwen3-VL; llama.cpp y Ollama requerirían conversión a GGUF no disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen-3-VL-8B-Instruct-heretic | 8,77B | 256K (1M expandible) | Apache 2.0 | Variante abliterated, 6/100 rechazos, KL 0,0214 |
| Qwen/Qwen3-VL-8B-Instruct | 8,77B | 256K (1M expandible) | Apache 2.0 | Modelo base, 100/100 rechazos, sin modificar |
| Qwen3-VL-4B-Instruct | no disponible en la información | 256K (1M expandible) | Apache 2.0 | Versión menor de la misma familia |
| Qwen3-VL MoE (variantes) | no disponible en la información | 256K (1M expandible) | Apache 2.0 | Arquitectura MoE de la misma generación |

## Limitaciones y advertencias

- La abliteration elimina la capa de rechazo del modelo base; esto puede producir respuestas a solicitudes dañinas, ilegales o éticamente problemáticas sin las salvaguardas originales. No debe desplegarse en producción orientada a usuarios finales sin un sistema de moderación externo.
- La divergencia KL de 0,0214 indica un cambio medible en la distribución de salida; pueden aparecer degradaciones en capacidades no evaluadas por el autor.
- Riesgo de alucinación inherente a los VLM: puede describir objetos o texto inexistentes en imágenes, especialmente con OCR en condiciones adversas o caracteres poco frecuentes.
- No hay datos publicados de rendimiento en benchmarks estándar para esta variante, por lo que la comparación con el modelo base se limita a rechazos y KL.
- El repo no incluye cuantizaciones (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversión.
- El modelo no tiene descargas ni validación de la comunidad en el momento de la consulta; la reproducibilidad declarada depende de la receta en el directorio `reproduce`.
- La licencia Apache 2.0 se hereda del modelo base; conviene revisar las condiciones del modelo original y las obligaciones de atribución al redistribuir la variante modificada.
- Los idiomas soportados no están listados explícitamente; el OCR cubre 32 idiomas según el autor original, pero el rendimiento conversacional por idioma no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/LueCipherx13x/Qwen-3-VL-8B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Qwen Chat: https://chat.qwenlm.ai/
- Paper Qwen3-VL: https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL: https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL: https://arxiv.org/abs/2409.12191
- Paper Qwen-VL: https://arxiv.org/abs/2308.12966
