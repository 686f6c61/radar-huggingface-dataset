# prithivMLmods/Qwen3.5-9B-abliterated-NVFP4-GGUF

## Resumen
Qwen3.5-9B-abliterated-NVFP4-GGUF es una cuantizacion en formato GGUF del modelo Qwen3.5-9B de Alibaba, publicada por el usuario prithivMLmods. Se trata de una variante "abliterated", es decir, con los mecanismos de rechazo y salvaguardas eliminados mediante la tecnica de abliteration, que sustrae la direccion de rechazo del espacio de activaciones del transformer. El modelo base es un transformer denso multimodal de aproximadamente 8.950 millones de parametros.

La innovacion principal de esta publicacion es el uso de cuantizacion NVFP4, un formato de 4 bits nativo de las GPU NVIDIA Blackwell que aprovecha los Tensor Cores FP4 para acelerar la inferencia. El autor reporta velocidades de generacion de 135,66 tokens por segundo y procesamiento de prompt de 318,37 tokens por segundo en una RTX PRO 6000 Blackwell con 96 GB de VRAM, con un consumo pico de solo 8,81 GiB gracias a la cuantizacion.

Este lanzamiento es relevante para desarrolladores que trabajan con hardware Blackwell y necesitan desplegar un modelo de ~9B con contexto largo y capacidades multimodales en entornos con restricciones de VRAM. La licencia Apache 2.0 y la compatibilidad con llama.cpp y Ollama facilitan su integracion en pipelines de produccion, aunque la naturaleza abliterated plantea consideraciones importantes sobre el filtrado de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con arquitectura hibrida Gated DeltaNet + Gated Attention (segun model card del autor) |
| Parametros totales | 8.953.803.392 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens nativos, extensible a 1M+ mediante RoPE scaling (segun model card) |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA Blackwell) |
| Idiomas soportados | Ingles (etiqueta oficial); el modelo base declara soporte para 201 idiomas segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo de 10,3 GB) |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-9B emplea una arquitectura hibrida que combina Gated DeltaNet con Gated Attention, un diseno que busca equilibrar eficiencia computacional y capacidad de modelado de dependencias de largo alcance. Segun la model card del autor, incorpora entrenamiento con fusion temprana (early fusion) para comprension unificada de texto, imagen y video, con un vocabulario de 248.000 tokens que cubre 201 idiomas. Incluye un modo de pensamiento (thinking mode) conmutable para razonamiento paso a paso.

La variante abliterated se genera eliminando la direccion de rechazo de las activaciones internas del modelo, lo que reduce la probabilidad de respuestas negativas ante solicitudes que el modelo original rechazaria. La cuantizacion NVFP4 se realizo con llama.cpp, aprovechando el formato de 4 bits con escala de bloque que NVIDIA introduce en su arquitectura Blackwell (SM120, GB202, B200, B300). No se dispone de informacion sobre el numero exacto de tokens de entrenamiento ni sobre la composicion detallada del dataset del modelo base en la informacion proporcionada.

## Capacidades
- Generacion de texto conversacional y razonamiento paso a paso mediante modo de pensamiento conmutable.
- Comprension multimodal de texto, imagen y video (heredada del modelo base Qwen3.5-9B).
- Capacidades de codigo a nivel de repositorio y desarrollo frontend, segun la model card.
- Analisis y parsing de documentos y PDF.
- Respuesta visual a preguntas (VQA).
- Tool calling nativo y capacidades agenticas multi-paso (66,1% BFCL-V4 y 79,1% TAU2-Bench reportados para el modelo base).
- Soporte multilingue declarado de 201 idiomas, aunque la etiqueta oficial del repositorio solo lista ingles.
- Generacion de texto sin filtros de rechazo gracias a la abliteration.

## Casos de uso
- Despliegue en estaciones de trabajo con GPU Blackwell: el formato NVFP4 aprovecha los Tensor Cores FP4 de las RTX 50-series, RTX PRO 6000, B200 y B300 para obtener alto throughput con solo ~8,8 GiB de VRAM pico, ideal para entornos de desarrollo locales con hardware de ultima generacion.
- Atencion al cliente automatizada: la ventana de contexto de 262.000 tokens permite gestionar conversaciones multi-turno extensas y documentos de referencia largos sin truncamiento, aunque la ausencia de filtros requiere supervision adicional.
- Generacion de codigo en produccion: las capacidades de codigo a nivel de repositorio y el soporte de tool calling permiten integrarlo en pipelines de CI/CD para revision de codigo, generacion de tests y documentacion tecnica.
- Procesamiento de documentos y PDF: el modelo base soporta parsing de documentos y VQA, lo que permite extraer informacion estructurada de facturas, contratos e informes con contexto largo.
- Investigacion sobre alineacion y seguridad: la variante abliterated sirve como caso de estudio para analizar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo, util en entornos academicos controlados.
- Prototipado rapido de agentes multimodales: la combinacion de tool calling, contexto largo y comprension de imagen/video permite construir agentes que razonan sobre capturas de pantalla, diagramas y flujos de trabajo.
- Chatbots multilingues: el vocabulario de 248.000 tokens y el soporte declarado de 201 idiomas facilitan aplicaciones de traduccion y atencion multilingue, aunque conviene validar el rendimiento real en idiomas distintos del ingles.

## Benchmarks y rendimiento
Los datos de benchmarks corresponden al modelo base Qwen3.5-9B segun la model card del autor, no a la variante abliterated cuantizada:

| Benchmark | Resultado (modelo base) |
|---|---|
| OCRBench | 89,2% |
| VideoMME | 84,5% |
| MathVision | 78,9% |
| MMMU-Pro | 70,1% |
| BFCL-V4 | 66,1% |
| TAU2-Bench | 79,1% |

Rendimiento de inferencia medido por el autor con llama-cli en RTX PRO 6000 Blackwell (96 GB VRAM, contexto 8.192, KV cache q8_0, -ngl 99):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 318,37 tokens/s |
| Velocidad media de generacion | 135,66 tokens/s |
| Tiempo total de ejecucion | 228,5 segundos |
| VRAM pico | 8,81 GiB |
| Utilizacion pico de GPU | 93% |
| Decodificacion especulativa | No |

No se han publicado resultados de benchmarks especificos para la variante abliterated ni para la cuantizacion NVFP4 en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 8,8 GiB en la configuracion probada (NVFP4, contexto 8.192, KV cache q8_0). El archivo GGUF ocupa 10,3 GB en disco.
- GPU compatibles: exclusivamente NVIDIA Blackwell (SM120), es decir, RTX 50-series, RTX PRO 6000 Blackwell, B200 y B300. El formato NVFP4 no es compatible con arquitecturas anteriores (Ampere, Ada Lovelace).
- No cabe en GPU consumer de generaciones anteriores; en Blackwell consumer (RTX 50-series) deberia caber con holgura dado el consumo de ~8,8 GiB, aunque no se han publicado mediciones en esas tarjetas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y cualquier runtime que soporte GGUF con NVFP4. La model card menciona compatibilidad con vLLM y SGLang para el modelo base, pero no se confirma para esta cuantizacion.
- Throughput medido: 135,66 tokens/s de generacion y 318,37 tokens/s de procesamiento de prompt en RTX PRO 6000 Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-abliterated-NVFP4-GGUF (este) | 8,95B | 262K (1M+ con RoPE) | GGUF NVFP4 | Apache 2.0 | Solo Blackwell, abliterated, 10,3 GB |
| Qwen3.5-9B (base) | 8,95B | 262K (1M+ con RoPE) | Safetensors | Apache 2.0 | Modelo original con salvaguardas, ~18 GB BF16 |
| Qwen3.5-9B-abliterated-v2-MAX | no disponible | no disponible | no disponible | no disponible | Otra variante abliterated del mismo autor, sin datos tecnicos en la informacion disponible |
| Qwen3.5-9B-abliterated-v2-MAX-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Variante NVFP4 alternativa del mismo autor, sin datos tecnicos en la informacion disponible |

## Limitaciones y advertencias
- La abliteration elimina los mecanismos de rechazo del modelo, lo que implica que puede generar contenido danino, ilegal o eticamente cuestionable sin filtros. No es adecuado para aplicaciones de cara al publico sin una capa de moderacion externa.
- La cuantizacion NVFP4 de 4 bits puede degradar la calidad de las respuestas respecto al modelo en BF16, especialmente en tareas de razonamiento complejo y matematicas. No se han publicado evaluaciones comparativas de calidad.
- El formato NVFP4 solo funciona en GPU NVIDIA Blackwell (SM120). No hay retrocompatibilidad con Ampere, Ada Lovelace ni GPUs de otros fabricantes.
- La etiqueta oficial del repositorio solo declara ingles, aunque el modelo base afirma soportar 201 idiomas; el rendimiento real en otros idiomas no esta verificado.
- Riesgo de alucinacion inherente a los modelos de ~9B, agravado por la cuantizacion agresiva a 4 bits.
- La licencia Apache 2.0 permite uso comercial, pero el uso de una variante abliterated puede incumplir politicas de plataformas o términos de servicio de proveedores cloud.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No se dispone de informacion sobre sesgos especificos del modelo base ni sobre evaluaciones de seguridad de la variante abliterated.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.5-9B-abliterated-NVFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante abliterated v2-MAX: https://huggingface.co/prithivMLmods/Qwen3.5-9B-abliterated-v2-MAX
- Variante abliterated v2-MAX-NVFP4: https://huggingface.co/prithivMLmods/Qwen3.5-9B-abliterated-v2-MAX-NVFP4
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
