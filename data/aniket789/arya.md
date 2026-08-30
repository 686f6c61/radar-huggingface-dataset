# Aniket789/Arya

## Resumen

Arya-3B-MoE es un modelo fundacional de lenguaje de tipo Mixture-of-Experts nativo desarrollado por Chanakya Labs, presentado como una arquitectura de nueva generación que combina atención lineal, enrutamiento disperso equilibrado por cuantiles y predicción multi-token. Con un total de 3.000 millones de parámetros, de los cuales solo entre 0,8 y 1,0 mil millones se activan por token, el modelo está diseñado para ofrecer eficiencia computacional sin sacrificar capacidad de razonamiento. Su ventana de contexto alcanza los 65.536 tokens, lo que lo hace adecuado para tareas que requieren procesar documentos largos o conversaciones extensas.

El modelo se publica bajo licencia Apache 2.0 y está orientado principalmente al inglés. Aunque el repositorio de HuggingFace registra cero descargas y cero likes, la model card describe innovaciones arquitectónicas relevantes como el mezclador híbrido de secuencias (6 capas Gated DeltaNet, 1 atención de recuperación dispersa y 1 atención global) y un núcleo MoE con 32 expertos enrutados más un experto compartido persistente. La implementación requiere `trust_remote_code=True` al cargarse con Transformers, lo que indica que el código de arquitectura se aloja en el propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arya-MoE nativa (mezclador híbrido: 6 capas Gated DeltaNet, 1 atención de recuperación dispersa, 1 atención global; núcleo MoE con 32 expertos enrutados y 1 experto compartido) |
| Parametros totales | 3.0 mil millones |
| Parametros activos | ~0.8 - 1.0 mil millones (Top-4 de 32 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio requiere `trust_remote_code=True`, probablemente safetensors o binarios personalizados; no se especifica) |

## Arquitectura y entrenamiento

La arquitectura de Arya-3B-MoE se describe como un diseño nativo que integra varias innovaciones. El mezclador de secuencias sigue una proporción 6:1:1, con seis capas de Gated DeltaNet que realizan actualizaciones de estado asociativas en tiempo lineal (complejidad O(N)), una capa de atención de recuperación dispersa con ventana local y una capa de atención global para el contexto completo. El núcleo MoE emplea 32 expertos dinámicamente enrutados de los que se activan 4 por token, más un experto compartido persistente que garantiza una base de conocimiento estable. El enrutamiento utiliza un equilibrio por cuantiles que, según la model card, elimina el colapso de expertos y evita la degradación de la pérdida auxiliar.

Además, el modelo incorpora un mecanismo de residuos con compuerta multi-cabeza (mHC / AttnRes) que aplica un enmascaramiento dinámico por canal sobre representaciones de capas anteriores, y una pila de predicción multi-token (MTP) que genera hasta cuatro tokens subsiguientes de forma concurrente. No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detalla el proceso de entrenamiento más allá de la descripción arquitectónica.

## Capacidades

- Generación de texto: modelo causal de lenguaje con capacidad de generar texto coherente y continuaciones.
- Razonamiento y comprensión de contexto largo: con 65.536 tokens de ventana, puede manejar documentos extensos y conversaciones multi-turno.
- Predicción multi-token: genera hasta 4 tokens siguientes de forma simultánea, lo que puede acelerar la inferencia y mejorar la coherencia local.
- Enrutamiento disperso eficiente: al activar solo ~1B de parámetros por token, ofrece un equilibrio entre capacidad y coste computacional.
- Atención híbrida: combina atención lineal (Gated DeltaNet) con atención global y local, lo que permite capturar dependencias de largo alcance con menor coste que la atención cuadrática tradicional.
- Soporte de tool calling y function calling: no se menciona explícitamente en la documentación disponible.
- Capacidades de agente y multi-step reasoning: no se especifica.
- Multilingüismo: la model card solo indica inglés como idioma soportado.

## Casos de uso

- Procesamiento de documentos largos: con su contexto de 65.536 tokens, el modelo puede resumir, extraer información o responder preguntas sobre informes, artículos científicos o contratos extensos de una sola pasada.
- Asistentes conversacionales de dominio específico: al tener un experto compartido persistente, puede mantener una base de conocimiento coherente en diálogos multi-turno, adecuado para chatbots de soporte técnico o atención al cliente.
- Generación de código asistida: aunque no se documenta explícitamente, un modelo de 3B con ~1B activos y predicción multi-token podría emplearse en autocompletado de código o generación de fragmentos en entornos de desarrollo integrado.
- Análisis de series temporales o datos secuenciales: la arquitectura de atención lineal y recuperación dispersa podría adaptarse a tareas de modelado de secuencias largas, como logística o telemetría.
- Prototipado rápido de aplicaciones de IA: al ser un modelo de tamaño moderado con licencia Apache 2.0, es viable para pruebas de concepto y desarrollo en entornos con recursos limitados.
- Investigación en arquitecturas eficientes: por sus innovaciones en enrutamiento disperso y atención lineal, puede servir como banco de pruebas para estudiar el comportamiento de estos mecanismos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se encontraron evaluaciones externas en los resultados de búsqueda. Por tanto, no es posible valorar su rendimiento cuantitativo en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1B parámetros activos, la carga de pesos completa (3B) requiere aproximadamente 6 GB en FP16 (sin cuantizar). Con cuantización de 8 bits podría reducirse a ~3-4 GB, y con 4 bits a ~2 GB. Sin embargo, no se especifican formatos de cuantización disponibles.
- GPU recomendadas: una tarjeta consumer como RTX 3090 o RTX 4090 (24 GB VRAM) sería suficiente para inferencia en FP16 con margen para el contexto largo. Para despliegue en producción, una A100 (40/80 GB) o H100 permitiría mayor throughput y manejo de lotes grandes.
- Adecuación para consumer GPU: sí, probablemente cabe en GPUs de gama media-alta con al menos 8-12 GB de VRAM, especialmente con cuantización.
- Opciones de despliegue: al requerir `trust_remote_code=True`, se necesita un framework compatible con código personalizado. vLLM, TGI y llama.cpp podrían no soportar esta arquitectura sin adaptaciones. Se recomienda usar Transformers directamente o implementar un servidor personalizado con FastAPI.
- Latencia y throughput: no hay datos oficiales. Dado el tamaño activo (~1B) y la atención lineal, se espera una latencia moderada, pero sin mediciones no se puede cuantificar.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (MoE nativo de ~3B con atención lineal). Alternativas generales como Mixtral 8x7B (46.7B total, ~12.9B activos) o Qwen1.5-MoE-A2.7B (2.7B total, ~1.3B activos) tienen arquitecturas y tamaños distintos, pero no se puede establecer una comparación fiable sin datos de rendimiento. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No hay información sobre sesgos o alucinaciones; al ser un modelo no evaluado públicamente, estos riesgos son desconocidos y requieren pruebas propias.
- El modelo solo declara soporte para inglés; su rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el código de arquitectura se distribuye con `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; se debe auditar antes de usar en producción.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia objetiva de su capacidad en tareas estándar.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que el modelo no ha sido validado por la comunidad; podría contener errores o estar incompleto.
- No se especifican los pesos en formatos estándar (safetensors, GGUF), lo que complica su integración en herramientas comunes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aniket789/Arya
- No se encontraron otros enlaces relevantes (papers, blogs o demos) en los resultados de búsqueda.
