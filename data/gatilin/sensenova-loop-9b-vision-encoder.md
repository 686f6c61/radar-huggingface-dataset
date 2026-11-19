# gatilin/sensenova-loop-9b-vision-encoder

## Resumen

SenseNova-Loop-9B Vision Encoder es un extracto del torreón visual (visual tower) y del módulo de fusión (merger) del modelo multimodal SenseNova-Loop-9B, publicado por el usuario gatilin en Hugging Face. No se trata de un modelo generativo completo: contiene únicamente los pesos del codificador de visión, sin la parte lingüística ni la capacidad de producir predicciones multimodales de extremo a extremo. Su utilidad es servir como componente aislado para extracción de características visuales e investigación sobre mecanismos de atención.

El codificador sigue la arquitectura Qwen3.5 Vision, con 27 bloques transformer, 16 cabezas de atención, dimensión oculta de 1.152 y parches espaciales de 16 × 16 píxeles con parche temporal de 2. El merger incluido combina parches espaciales en ventanas de 2 × 2 y proyecta la salida a una dimensión de 4.096, que es la que consumiría el modelo de lenguaje original. El checkpoint pesa unos 912 MB en BF16 y suma 456.010.480 parámetros distribuidos en 333 tensores.

La relevancia de este repositorio es doble: por un lado, permite reutilizar el torreón visual de un modelo de 9B sin cargar el modelo completo; por otro, su model card documenta con detalle el proceso de extracción y verificación de pesos (comparación byte a byte con el espejo de ModelScope, hashes SHA-256 y pruebas de carga estricta), lo que resulta poco habitual y facilita la auditoría de la procedencia de los tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 Vision encoder (transformer) con merger espacial 2 × 2 |
| Parametros totales | 456.010.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), 333 tensores, ~912 MB |

## Arquitectura y entrenamiento

El componente es un codificador visual de tipo transformer con 27 bloques, 16 cabezas de atención y dimensión oculta de 1.152. Procesa la imagen con parches espaciales de 16 × 16 y un parche temporal de 2, lo que indica que el diseño original admite entradas de vídeo además de imagen estática. La salida del torreón pasa por un merger que agrupa parches espaciales en ventanas de 2 × 2 y proyecta la representación resultante a 4.096 dimensiones, la interfaz que esperaría el modelo de lenguaje del SenseNova-Loop-9B original.

No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO; el repositorio es un extracto de pesos, no un entrenamiento nuevo. La model card documenta el proceso de extracción: los shards se descargaron desde el espejo oficial de SenseNova en ModelScope (la revisión de Hugging Face `3e1ba6e8ac98090f9f7c03a55f26269eb3850fb6` tenía los pesos con acceso restringido), se compararon byte a byte con los rangos descargados y se verificaron los hashes SHA-256. La validación incluye carga estricta y pasadas en CPU con float32 sobre dos imágenes de COCO128, comprobando la atención explícita contra SDPA nativo en las capas 0, 13 y 26 con entradas de 224 × 224.

## Capacidades

- Extracción de características visuales: devuelve estados ocultos por parche (`last_hidden_state`) y características fusionadas (`pooler_output`) listas para un modelo de lenguaje.
- Procesamiento de imágenes RGB mediante `Qwen2VLImageProcessor` con la configuración original del modelo fuente.
- Soporte de parche temporal de 2, orientado a entradas de vídeo en el diseño original (no validado en este extracto).
- Investigación de atención: el código de validación permite comparar atención explícita con SDPA por capa.
- No implementa generación de texto, tool calling, razonamiento multi-step ni capacidades de agente.
- No reproduce las predicciones multimodales de extremo a extremo del SenseNova-Loop-9B original.
- Capacidades multilingües: no aplicables (no hay componente lingüístico).

## Casos de uso

- Investigación de mecanismos de atención visual: cargar el torreón aislado y comparar atención explícita frente a SDPA en capas concretas (0, 13, 26) para estudiar patrones de atención sin el coste de cargar un modelo de 9B.
- Extracción de embeddings visuales para búsqueda o clustering: usar `pooler_output` (4.096 dimensiones) como representación de imagen en un pipeline de recuperación o deduplicación de imágenes.
- Reutilización del torreón en un VLM propio: emparejar estas características con un modelo de lenguaje distinto al original, aprovechando que los nombres de tensor `model.visual.*` se conservan y el merger ya proyecta a 4.096.
- Auditoría de pesos y reproducibilidad: el repositorio incluye `extraction.json`, `source_verification.json`, `tensor_mapping.json` y `validation.json`, útiles para verificar la integridad de un checkpoint extraído de un modelo cerrado o con acceso restringido.
- Prototipado en CPU: con ~912 MB en BF16 y pasadas en float32 sobre CPU documentadas, permite experimentar con el codificador visual en equipos sin GPU.
- Análisis de parches espaciales y temporales: estudiar cómo el parche de 16 × 16 y el temporal de 2 afectan a la representación de imágenes y secuencias de vídeo cortas.
- Base para fine-tuning de tareas visuales: al ser un codificador con licencia Apache-2.0, puede adaptarse con cabezas propias para clasificación o segmentación, aunque requeriría verificar la compatibilidad con el merger.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es una prueba de humo de carga estricta y forward en CPU float32 sobre dos imágenes de COCO128 a 224 × 224, que no constituye una evaluación de calidad de representaciones ni una comparación de equivalencia con el modelo original completo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB en BF16 (912 MB de tensores); ~2 GB en float32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100 para inferencia del codificador aislado.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con 2 GB o más; también funciona en CPU (validado en float32).
- Opciones de despliegue: carga directa con `transformers` mediante `component.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/sensenova-loop-9b-vision-encoder | 456 M | no disponible | Codificador visual aislado | Apache-2.0 | Hugging Face |
| sensenova/SenseNova-Loop-9B | no disponible (modelo completo de 9B) | no disponible | VLM completo | Apache-2.0 (según model card upstream) | Hugging Face (acceso restringido) y ModelScope |
| Qwen2-VL / Qwen2.5-VL (torreón visual) | no disponible en la información | no disponible | VLM completo / codificador | Apache-2.0 (según familia Qwen) | Hugging Face |

La comparación con otros codificadores visuales aislados no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo multimodal funcional: carece del modelo de lenguaje y no genera texto ni predicciones de extremo a extremo.
- La prueba de validación es un smoke test sobre dos imágenes de COCO128 a 224 × 224; no demuestra equivalencia con el modelo original completo.
- Los shards originales no se descargaron ni hashearon localmente en su totalidad; la verificación se basó en rangos del espejo de ModelScope y en la coincidencia de tamaños y SHA-256 declarados por ambos proveedores.
- Riesgo de sesgos y alucinación del modelo fuente: no evaluado en este extracto; cualquier sesgo del SenseNova-Loop-9B original podría heredarse en las representaciones visuales.
- Idiomas soportados no disponibles; al no incluir componente lingüístico, la cobertura idiomática no es aplicable directamente.
- Licencia Apache-2.0 según la model card upstream; se recomienda revisar la model card original para atribución y términos adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni comunidad de validación.
- El código de carga depende de la implementación upstream de Qwen3.5 Vision; cambios en `transformers` o en dicha implementación podrían romper la compatibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gatilin/sensenova-loop-9b-vision-encoder
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Espejo oficial en ModelScope: https://modelscope.cn/models/sensenova/SenseNova-Loop-9B
