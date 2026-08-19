# Chungulus/Qwen3.8-27B-MLX-oQ5

## Resumen

El modelo `Chungulus/Qwen3.8-27B-MLX-oQ5` es una cuantización de precisión mixta del modelo multimodal `Qwen/Qwen3.8-27B`, realizada por el autor Chungulus. No se trata de un fine-tune ni de una modificación de alineación, sino de una conversión vanilla a formato MLX (Apple Silicon) utilizando el algoritmo propietario `oMLX oQ5`, que combina cuantización sensible a la sensibilidad con un ancho de bits medio de 5,5 bits por peso y un tamaño de grupo de 64. El resultado es un artefacto de 20,3 GB que conserva las capacidades del modelo original: generación de texto, comprensión de imágenes y vídeo, tool calling y predicción multi-token (MTP).

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada y optimizada para hardware Apple, con una aceleración medida de 2,45x en generación gracias al soporte MTP integrado. El modelo base, Qwen3.8-27B, emplea la arquitectura interna `Qwen3_5ForConditionalGeneration` (identificador que no debe confundirse con una versión Qwen3.5), e incluye 333 tensores de visión y 15 tensores MTP. Aunque el repositorio no publica benchmarks estándar, las validaciones internas reportan una similitud semántica media de 0,885 frente al modelo BF16 original y una divergencia KL de 0,006 en comparaciones de logits fijos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, visión-lenguaje) |
| Parametros totales | 5.756.598.512 (según safetensors; el modelo base se denomina 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oMLX oQ5, precisión mixta ~5,5 bpw, group size 64 con overrides por modo |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint oficial `Qwen/Qwen3.8-27B`, fijado en el commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. La arquitectura subyacente es un transformer multimodal con codificador de visión, diseñado para tareas de image-text-to-text. La conversión se realizó con el algoritmo `oMLX oQ5`, que aplica cuantización de precisión mixta dirigida por sensibilidad: asigna diferentes anchos de bit a distintos tensores según su impacto en la salida, manteniendo un promedio de 5,5 bits por peso y un tamaño de grupo de 64. El proceso de calibración utilizó prompts representativos locales fijos, sin respuestas de benchmarks, y no se realizó ningún entrenamiento adicional (ni RLHF ni DPO). El artefacto resultante incluye 1199 tensores, de los cuales 333 corresponden a la parte de visión y 15 al cabezal MTP (Multi-Token Prediction), que se integra de forma nativa en el runtime oMLX.

## Capacidades

- Generación de texto conversacional y de larga forma, con soporte para razonamiento multi-turno.
- Comprensión de imágenes y vídeo (visión-lenguaje), validada con pruebas deterministas locales.
- Tool calling nativo mediante XML, con cinco pruebas superadas en la validación.
- Predicción multi-token (MTP): acelera la generación mediante la predicción de varios tokens por ciclo, con una tasa de aceptación de borradores de 0,969 y un speedup medido de 2,45x frente al modo sin MTP.
- Capacidad de procesamiento de prompts largos (el prompt de validación más largo fue de 73 tokens, aunque no se afirma que sea el límite arquitectónico).
- Compatibilidad con el ecosistema MLX de Apple Silicon, incluyendo cargadores estándar y el runtime oMLX.

## Casos de uso

- Asistentes conversacionales en dispositivos Apple: el modelo puede ejecutarse localmente en un Mac con 64 GB de memoria unificada, ofreciendo respuestas de texto con baja latencia gracias a la aceleración MTP. Es adecuado para aplicaciones de productividad personal o asistentes de escritorio.
- Análisis de imágenes y vídeo en entornos offline: al ser un modelo multimodal cuantizado, puede procesar capturas de pantalla, documentos escaneados o fotogramas de vídeo para extraer información, sin depender de servicios en la nube.
- Agentes autónomos con tool calling: su soporte nativo de herramientas XML permite integrarlo en pipelines de automatización, como gestión de calendarios, envío de correos o consultas a APIs, todo ejecutado localmente.
- Generación de código asistida: aunque no se especifican benchmarks de código, el modelo base Qwen3.8-27B es conocido por sus capacidades de programación; esta cuantización permite ejecutarlo en hardware Apple con un footprint reducido.
- Prototipado rápido de aplicaciones de visión-lenguaje: desarrolladores pueden usar este checkpoint para validar flujos de trabajo de image captioning o VQA en entornos de desarrollo con Macs de gama alta.
- Investigación en cuantización y eficiencia: el artefacto sirve como referencia para estudiar el impacto de la cuantización mixta en modelos multimodales, ya que incluye métricas detalladas de comparación con el modelo BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente validaciones internas:

| Metrica | Valor |
|---|---|
| Similitud semántica media vs BF16 (paraphrase-multilingual-MiniLM-L12-v2) | 0,8853 |
| Divergencia KL media (logits fijos, 106 posiciones) | 0,00603 |
| Acuerdo top-1 en logits | 0,9811 |
| Perplejidad del candidato vs referencia | 9,75 vs 9,85 |
| Speedup MTP (generación) | 2,45x (12,34 tps → 30,26 tps) |
| Tasa de aceptación de borradores MTP | 0,96875 |

Estas métricas son específicas del artefacto y no comparables con benchmarks públicos.

## Requisitos de hardware

- Apple Silicon con al menos 64 GB de memoria unificada (según la model card).
- VRAM estimada: no se especifica, pero el pico de memoria medido durante la validación fue de 21,09 GB (probablemente para el modelo BF16 de referencia; el artefacto cuantizado ocupa 20,3 GB en disco).
- GPU recomendadas: cualquier chip Apple Silicon M-series con 64 GB o más (M1 Max, M2 Ultra, M3 Ultra, etc.).
- No cabe en GPUs de consumo convencionales (NVIDIA RTX) porque el formato MLX está diseñado para el ecosistema Apple.
- Opciones de despliegue: runtime oMLX (requiere instalar `omlx`), cargadores estándar de MLX, y posiblemente integración con frameworks como MLX-LM.
- Latencia y throughput: en la prueba MTP se midió 30,26 tokens por segundo en un hardware no especificado; el modo sin MTP dio 12,34 tps. Estos valores son orientativos y dependen del hardware y la carga.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otras cuantizaciones de Qwen3.8-27B o modelos multimodales similares en formato MLX. El autor no proporciona comparativas con alternativas como Qwen2.5-VL cuantizado o LLaVA en MLX. Por tanto, la comparativa se limita a señalar que el modelo base es Qwen3.8-27B, y que esta cuantización es una de las pocas disponibles para ese checkpoint en MLX con soporte MTP.

## Limitaciones y advertencias

- La cuantización introduce una pérdida de precisión inherente; aunque las validaciones muestran alta similitud semántica (0,885) y baja divergencia KL (0,006), no se garantiza un comportamiento idéntico al modelo BF16 en todos los casos.
- El modelo requiere hardware Apple Silicon con al menos 64 GB de memoria unificada, lo que limita su uso a equipos de gama alta y excluye GPUs NVIDIA o AMD.
- No se han publicado benchmarks estándar, por lo que el rendimiento en tareas como razonamiento matemático o generación de código no está verificado.
- La longitud de contexto máxima no está documentada; la validación solo probó prompts de hasta 73 tokens, por lo que no se conoce el límite real.
- Los idiomas soportados no están especificados; se asume que hereda los del modelo base Qwen3.8-27B, pero no hay confirmación.
- El uso del runtime oMLX es necesario para aprovechar la aceleración MTP; sin él, el modelo puede funcionar con cargadores MLX estándar pero sin la ventaja de velocidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-oQ5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de evaluación semántica: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
