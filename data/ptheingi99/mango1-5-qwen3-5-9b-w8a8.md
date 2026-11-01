# Ptheingi99/MANGO1.5-Qwen3.5-9B-W8A8

## Resumen

MANGO1.5-Qwen3.5-9B-W8A8 es una cuantización de pesos y activaciones a 8 bits (esquema W8A8, INT8) del modelo multimodal CMKL/MANGO1.5-Qwen3.5-9B, un modelo de tipo image-text-to-text construido sobre la familia Qwen3.5. Lo publica el usuario Ptheingi99 como artefacto del equipo 16 (Peacock) para el GreenMind AI Hackathon, y no constituye un fine-tune ni un adaptador, sino una conversión de precisión del checkpoint base manteniendo la relación `quantized`.

El interés práctico del modelo es que reduce el coste de memoria y el ancho de banda de pesos respecto al original en 16 bits (9.409.813.744 parámetros, repo de 12,4 GB) manteniendo en 16 bits los componentes sensibles a la cuantización: la cabeza de salida (`lm_head`), el codificador visual (`visual`) y la cabeza de borrador MTP (`mtp`). Está pensado para servirse con vLLM mediante `compressed-tensors`, lo que lo hace adecuado para despliegues de inferencia con requisitos de VRAM ajustados.

El modelo declara soporte de tailandés (th) e inglés (en), licencia Apache 2.0 y formato safetensors compatible con `transformers`. La información pública disponible es muy limitada: la model card es breve y no incluye detalles de entrenamiento, datos, benchmarks ni especificaciones de contexto, por lo que buena parte de la ficha se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5, con codificador visual y cabeza MTP (multi-token prediction) para decodificación especulativa |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 (INT8 en pesos y activaciones); `lm_head`, `visual` y `mtp` conservados en 16 bits |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `compressed-tensors` y vLLM) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base CMKL/MANGO1.5-Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5 con capacidad de entrada imagen-texto y salida de texto. El checkpoint incorpora un codificador visual (`visual`) y una cabeza de predicción multi-token (`mtp`), lo que sugiere el uso de decodificación especulativa con borradores integrados para acelerar la generación. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La contribución de este checkpoint es exclusivamente de cuantización: se aplicó `QuantizationModifier` de llm-compressor con esquema W8A8 y sin datos de calibración (data-free). Los módulos `lm_head`, `visual` y `mtp` se mantuvieron en 16 bits para preservar la calidad de la proyección de salida, la percepción visual y la generación de borradores especulativos. No hay innovaciones arquitectónicas propias de este checkpoint más allá de la propia estrategia de cuantización selectiva.

## Capacidades

- Generación de texto conversacional en tailandés e inglés.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`), con codificador visual conservado en 16 bits.
- Decodificación especulativa mediante cabeza MTP integrada, orientada a reducir latencia en inferencia.
- Compatibilidad con `transformers` y con el servidor vLLM a través de `compressed-tensors`.
- Soporte de cuantización INT8 W8A8 para reducir huella de memoria frente al modelo en 16 bits.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue de un asistente conversacional bilingüe tailandés-inglés en producción: el modelo cubre ambos idiomas de forma nativa y la cuantización W8A8 reduce la VRAM necesaria para servir la ventana de contexto completa en GPUs de gama media.
- Análisis de documentos con imágenes en atención al cliente: al conservar el codificador visual en 16 bits, puede procesar capturas, formularios o facturas escaneadas junto a texto sin la pérdida de precisión que sufriría una cuantización agresiva del encoder.
- Servicio de inferencia de baja latencia con vLLM: la integración con `compressed-tensors` y la cabeza MTP permiten activar decodificación especulativa y aumentar el throughput por GPU en comparación con el checkpoint en 16 bits.
- Moderación y clasificación de contenido multimodal en tailandés: útil para plataformas que operan en el sudeste asiático y necesitan procesar texto e imágenes con un modelo de 9B parámetros desplegable en infraestructura propia.
- Prototipado en el ámbito académico o de hackathon: el tamaño del repo (12,4 GB) y la licencia Apache 2.0 facilitan la experimentación y la reproducción de resultados sin costes de licencia.
- Extracción de información de imágenes en pipelines internos: combinado con un orquestador, el modelo puede transcribir y estructurar datos de imágenes en flujos ETL donde el coste por token es crítico.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia para medir la degradación de calidad de W8A8 data-free frente al modelo base en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una puntuación final de "99.8" obtenida en el hackathon con este checkpoint, sin especificar la métrica, el conjunto de evaluación ni la metodología, por lo que no es un dato comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos INT8 W8A8, el peso de los parámetros ronda los 9,4 GB; sumando `lm_head`, `visual` y `mtp` en 16 bits, el checkpoint completo ocupa aproximadamente 12,4 GB. A ello hay que añadir la caché KV, cuyo tamaño depende de la longitud de contexto (no publicada).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para despliegues con contexto largo y concurrencia alta.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX A6000 (48 GB) para contextos moderados; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) el margen para caché KV es muy limitado.
- Opciones de despliegue: vLLM es la vía principal (soporte nativo de `compressed-tensors`); `transformers` para uso directo. No se documenta soporte de llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MANGO1.5-Qwen3.5-9B-W8A8 | 9,41 B | no disponible | W8A8 INT8 | Apache 2.0 | HuggingFace, vLLM |
| CMKL/MANGO1.5-Qwen3.5-9B (base) | 9,41 B | no disponible | 16 bits | Apache 2.0 | HuggingFace |
| Qwen3.5-9B (familia base) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La cuantización W8A8 data-free puede introducir degradación de calidad respecto al modelo base, especialmente en tareas de razonamiento numérico o generación de código; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Sesgos conocidos: no disponible; al no documentarse la composición del dataset de entrenamiento, no es posible evaluar sesgos lingüísticos o culturales.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto.
- Cobertura idiomática limitada a tailandés e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- La longitud de contexto no está publicada, lo que impide planificar despliegues con requisitos de ventana larga.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado cuantizado conviene verificar las condiciones del modelo base CMKL/MANGO1.5-Qwen3.5-9B y de la familia Qwen3.5 de la que desciende.
- El checkpoint está vinculado a un hackathon concreto y tiene un mantenimiento incierto (0 likes, 123 descargas en el momento de la consulta); no hay garantía de soporte ni actualizaciones.
- El soporte de tool calling y de agentes no está documentado, por lo que no debería asumirse en producción sin validación previa.

## Enlaces

- HuggingFace: https://huggingface.co/Ptheingi99/MANGO1.5-Qwen3.5-9B-W8A8
- Modelo base: https://huggingface.co/CMKL/MANGO1.5-Qwen3.5-9B
- llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
