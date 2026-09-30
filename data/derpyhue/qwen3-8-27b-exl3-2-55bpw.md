# Derpyhue/Qwen3.8-27B-exl3-2.55bpw

## Resumen

Derpyhue/Qwen3.8-27B-exl3-2.55bpw es una cuantización EXL3 del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.000 millones de parámetros con capacidades nativas de visión y lenguaje desarrollado por el equipo Qwen de Alibaba. La cuantización ha sido generada por el usuario Derpyhue con la herramienta de conversión de exllamav3 (formato de conversión versión 1.5.3) y está pensada para reducir drásticamente el espacio en VRAM manteniendo un nivel de calidad utilizable. El resultado, según la model card, es que el modelo completo, incluida la torre de visión, ocupa aproximadamente 12 GB y cabe con holgura en una única GPU de 16 GB, algo imposible con los pesos en bf16.

El modelo base emplea una arquitectura híbrida de 64 capas que combina Gated DeltaNet con Gated Attention, sobre la base tecnológica de Qwen3.5, y ofrece 262.000 tokens de contexto nativo extensibles hasta 1 millón. Incorpora comprensión de imagen y vídeo, control flexible del modo de razonamiento (thinking) y entrenamiento con predicción multi-token (MTP), lo que permite usar decodificación especulativa con una cabeza draft integrada.

La relevancia de esta ficha concreta es de despliegue: es una alternativa para servir localmente un modelo multimodal de 27B en hardware de consumo o en GPUs de gama media con 16 GB, usando ExLlamaV3 o tabbyAPI. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido de 64 capas: Gated DeltaNet + Gated Attention (arquitectura Qwen3.5), con torre de visión y cabezas MTP |
| Parametros totales | 27B en el modelo base Qwen/Qwen3.8-27B; 6.048.978.304 parámetros almacenados en los safetensors de este repositorio cuantizado (recuento declarado por HuggingFace, no coincide con el recuento nominal del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens nativos, extensible a 1.000.000 (según la model card del modelo base) |
| Tipos de cuantizacion | EXL3 (exllamav3): 2,55 bpw de media; cabeza LM 6,0 bpw; capas MTP 4,0 bpw; torre de visión 6,0 bpw; codebook mul1; output scales auto; calibración de 250 filas x 2048 columnas (corpus por defecto). No se distribuyen variantes GGUF ni GPTQ en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con tensores EXL3 (formato de conversión exllamav3 1.5.3); requiere ExLlamaV3 para su carga |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con 64 capas que combina dos mecanismos de atención en una arquitectura híbrida: Gated DeltaNet y Gated Attention. Esta mezcla busca un equilibrio entre el coste computacional del contexto largo y la calidad de recuperación de información, y es la misma base arquitectónica de la generación Qwen3.5. El modelo es nativamente multimodal: incorpora una torre de visión que procesa imágenes y vídeo, y fue entrenado con predicción multi-token (MTP), lo que deja en el checkpoint cabezas draft reutilizables para decodificación especulativa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni los métodos de alineación (RLHF, DPO u otros) empleados en el modelo base más allá de lo indicado. En cuanto a esta cuantización, no hay reentrenamiento: se trata de una conversión post-entrenamiento con EXL3, calibrada con 250 filas y 2048 columnas de un corpus mixto por defecto, donde se asignan bitrates distintos por componente (2,55 bpw para el cuerpo, 6,0 bpw para la cabeza de salida y la torre de visión, 4,0 bpw para las capas MTP). La model card advierte explícitamente de que la cuantización degrada la precisión respecto al original en bf16 y de que el bitrate elegido es un compromiso entre tamaño y calidad.

## Capacidades

- Generación de texto y razonamiento de propósito general en un modelo denso de 27B.
- Comprensión de imagen y vídeo, ya que el modelo base es nativamente vision-language y la torre de visión se conserva a 6,0 bpw.
- Control flexible del modo de pensamiento (thinking), heredado del modelo base.
- Codificación, flujos de trabajo agénticos y automatización de oficina, según la descripción oficial del modelo base.
- Decodificación especulativa mediante las capas MTP incluidas en el checkpoint (4,0 bpw), lo que permite acelerar la generación sin un draft model externo.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible para esta cuantización (los kits de despliegue de terceros para el modelo base sí mencionan agentes y tool use).
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente multimodal local en una estación de trabajo con GPU de 16 GB: al ocupar unos 12 GB incluyendo la torre de visión, permite mantener conversaciones con imágenes y texto sin depender de servicios en la nube.
- Automatización de oficina: extracción y resumen de información de documentos escaneados o capturas mediante la entrada de imagen, y generación posterior de texto estructurado.
- Análisis de vídeo corto: descripción, resumen o preguntas sobre clips, aprovechando las capacidades de vídeo del modelo base.
- Codificación asistida en local: generación y revisión de código dentro del editor, con la ventaja de no enviar el código a un tercero y de caber en hardware de consumo.
- Flujos agénticos de varios pasos: el contexto de 262K tokens permite mantener historiales largos de herramientas, resultados intermedios y trazas de razonamiento en una sola ventana.
- Atención al cliente automatizada con contexto largo: conversaciones multi-turno que incluyen capturas o documentos adjuntos, con el historial completo dentro de la ventana de contexto.
- Despliegue en servidor con tabbyAPI: servir una API compatible con OpenAI sobre ExLlamaV3 para integrar el modelo en aplicaciones existentes sin reescribir el cliente.
- Procesamiento por lotes de imágenes y texto en pipelines internos, siempre que el throughput no sea el criterio principal (no hay datos de rendimiento publicados para esta cuantización).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web solo referencia la metodología de evaluación del modelo base en MathVision (prompt fijo con la instrucción de razonar paso a paso y formatear la respuesta en `\boxed{}`), pero sin cifras asociadas. Tampoco hay métricas de la cuantización EXL3 a 2,55 bpw frente al modelo en bf16, ni datos de perplejidad o de degradación por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB para los pesos completos (cuerpo, cabeza LM, capas MTP y torre de visión), según la model card. Hay que sumar la caché KV, que crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU con 16 GB o más de VRAM. La model card indica explícitamente que cabe cómodamente en una GPU única de 16 GB. Con 24 GB (RTX 4090, RTX 3090, L4, A10G) hay margen amplio para contexto; en A100 o H100 el límite pasa a ser el throughput, no la memoria.
- ¿Cabe en GPU de consumo? Sí: en tarjetas de 16 GB como la RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080 o RTX 5070 Ti, y con más holgura en las de 24 GB.
- Opciones de despliegue: ExLlamaV3 como biblioteca de inferencia obligatoria; tabbyAPI como servidor recomendado por el autor (configuración mediante `model_dir` y `model_name` en `config.yml`). No es compatible con llama.cpp, Ollama ni TGI en este formato.
- Decodificación especulativa: al conservar las capas MTP a 4,0 bpw, el checkpoint puede usarse con el draft head interno. Existen kits de terceros para el modelo base (MiaAI-Lab) que añaden una ruta DFlash2 con un drafter de 1,93B y una caché KV de ~4,5 bits (NVFP4 en Ada/Hopper/Blackwell, Hadamard-4 en Ampere), aunque esos kits están publicados para otras variantes de bitrate.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Derpyhue/Qwen3.8-27B-exl3-2.55bpw | 27B (base); 6.048.978.304 parametros almacenados en el repo | 262K nativo, extensible a 1M | EXL3 2,55 bpw | no disponible | apache-2.0 | ExLlamaV3 / tabbyAPI |
| Qwen/Qwen3.8-27B (base) | 27B densos | 262K nativo, extensible a 1M | bf16 | no disponible en cifras en la informacion recogida (solo metodologia de MathVision) | apache-2.0 | transformers y otros backends |
| Mia-AiLab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw | 1,93B (drafter, no es un modelo autonomo) | no disponible | EXL3 5,0 bpw | ~15% mas rapido que la ruta MTP por defecto, segun el kit | no disponible | ExLlamaV3 / tabbyAPI |
| Kit EXL3 3,5 bpw con speculative decoding (MiaAI-Lab) | 27B (base) | no disponible | EXL3 3,5 bpw + drafter | no disponible | no disponible | ExLlamaV3 / tabbyAPI |

La comparación directa con alternativas del mismo tamaño y categoría (por ejemplo, otras cuantizaciones del propio Qwen3.8-27B, como la de 3,5 bpw o la de 5,0 bpw) es en términos de compromiso tamaño-calidad: 2,55 bpw es la opción más agresiva en ahorro de VRAM, a costa de una mayor pérdida de precisión no cuantificada. No hay datos públicos de benchmarks en la información disponible.

## Limitaciones y advertencias

- La cuantización a 2,55 bpw degrada la precisión respecto al modelo en bf16; el autor lo advierte de forma explícita y no publica métricas de esa degradación.
- El recuento de parámetros del repositorio (6.048.978.304) no coincide con el tamaño nominal de 27B del modelo base, lo que apunta a una discrepancia en los metadatos del checkpoint cuantizado más que a un cambio real de tamaño. Conviene verificarlo antes de dimensionar infraestructura.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación publicada para esta cuantización que permita acotarlo.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible en la información proporcionada.
- Restricciones de licencia: la licencia declarada es apache-2.0, que permite uso comercial, pero al tratarse de una cuantización de terceros conviene verificar la licencia del modelo base y las condiciones de redistribución.
- Compatibilidad restringida: solo funciona con ExLlamaV3 (y tabbyAPI como servidor). No hay variantes GGUF, GPTQ ni AWQ en este repositorio, lo que limita su uso en llama.cpp, Ollama, vLLM o TGI.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.
- Producción: no hay datos de latencia, throughput ni estabilidad en cargas concurrentes, por lo que cualquier despliegue en producción requiere una evaluación propia previa.
- El contexto de 262K es el del modelo base; el consumo real de VRAM con contextos muy largos depende de la caché KV y no está cuantificado en el repositorio.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/Derpyhue/Qwen3.8-27B-exl3-2.55bpw
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- ExLlamaV3: https://github.com/turboderp/exllamav3
- tabbyAPI: https://github.com/theroyallab/tabbyAPI
- Kit de despliegue MiaAI-Lab (EXL3 3,5 bpw con speculative decoding): https://github.com/MiaAI-Lab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw
- Drafter DFlash2 en HuggingFace: https://huggingface.co/Mia-AiLab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw
- Guía del modelo Qwen 3.8-27B: https://www.aimadetools.com/blog/qwen-3-8-27b-complete-guide/
