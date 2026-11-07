# immanuelpeter/Qwen3.8-Flash-Next-Vision

## Resumen

Qwen3.8-Flash-Next Vision es un componente extraído del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicado por el usuario immanuelpeter en Hugging Face. No se trata de un modelo de lenguaje completo, sino de la torre visual (vision tower) y el proyector (projector) del modelo original, empaquetados de forma independiente para su uso como extractor de características visuales. El repositorio copia exactamente los 333 tensores `model.visual.*` del checkpoint padre en BF16, eliminando el prefijo, sin remezclar ni reinicializar ningún peso.

El modelo base, Qwen3.8-Flash-Next, es un modelo multimodal de tipo MoE (mezcla de expertos) desarrollado por el equipo Qwen (Alibaba), que sirve como avance de la arquitectura empleada en Qwen4. Este derivado concreto tiene 448.931.056 parámetros totales (aproximadamente 449 millones) y un tamaño de repositorio de 0,9 GB, lo que refleja que solo contiene la parte visual del modelo original, no el conjunto completo.

La relevancia de esta publicación es práctica: permite a desarrolladores e investigadores reutilizar la torre visual de Qwen3.8-Flash-Next de forma aislada, por ejemplo para tareas de extracción de características de imágenes, integración en pipelines propios de visión o experimentación con la arquitectura visual sin necesidad de cargar el modelo multimodal completo. La validación incluida en la model card confirma paridad exacta con el checkpoint padre en CPU FP32, CPU BF16 y CUDA BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre visual transformer (Qwen3_5VisionModel) con proyector; 27 bloques, anchura 1152, 16 cabezas de atención, parches de 16 píxeles, parches temporales de dos fotogramas y fusión espacial 2x2 |
| Parametros totales | 448.931.056 |
| Parametros activos | no disponible (no es un modelo MoE en esta extracción; el modelo padre sí es MoE) |
| Longitud de contexto | no disponible (componente visual; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0, heredada del modelo padre) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La torre visual consta de 27 bloques transformer con anchura de 1152 y 16 cabezas de atención. Procesa imágenes mediante parches de 16 píxeles, con parches temporales de dos fotogramas (lo que sugiere soporte para entradas de vídeo o secuencias de imágenes) y una fusión espacial de 2x2. La entrada del proyector tiene una anchura de 4608 y su salida es de 2560 dimensiones. La configuración del modelo fuente se reescribe con `model_type` como `qwen3_5_vision` y `out_hidden_size` fijado a 2560.

No se ha realizado ningún entrenamiento adicional ni ajuste fino en esta publicación: los 333 tensores se copian exactamente del checkpoint padre (revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`) en BF16, sin remodelar ni inicializar ningún tensor. La carga estricta confirma que el modelo no requiere búferes persistentes adicionales. La validación se realizó con Transformers 5.17.0, comparando la salida con el `Qwen4ExpVisionModel` del padre a 96 y 448 píxeles, con coincidencia exacta (`rtol=0`, `atol=0`) en ocho profundidades de la torre, la etapa fusionada y la etapa proyectada. Los 331 tensores de forma compartida difieren del checkpoint Qwen3.8-27B, lo que aísla los cambios de pesos respecto a ese modelo.

## Capacidades

- Extracción de características visuales: genera `last_hidden_state` con los tokens de la torre en el orden de bloques de fusión del padre, y `pooler_output` con los tokens proyectados.
- Procesamiento de imágenes con parches de 16 píxeles y fusión espacial 2x2.
- Soporte de parches temporales de dos fotogramas, lo que permite procesar secuencias de imágenes o vídeo corto.
- Integración con la librería Transformers mediante `AutoModel` y `AutoImageProcessor`.
- No incluye generación de texto, razonamiento, código ni matemáticas: es exclusivamente un componente visual.
- No dispone de tool calling, capacidades de agente ni modo thinking en esta extracción.
- Capacidades multilingües: no aplicables (componente visual sin procesamiento de lenguaje).

## Casos de uso

- Extracción de embeddings visuales para sistemas de búsqueda y recuperación de imágenes: la torre genera representaciones de 2560 dimensiones (salida del proyector) que pueden indexarse en bases vectoriales para búsqueda por similitud.
- Preprocesamiento en pipelines multimodales propios: permite conectar la torre visual de Qwen3.8-Flash-Next a un modelo de lenguaje independiente, sustituyendo el conector original por uno propio.
- Experimentación académica con arquitecturas visuales: investigadores pueden estudiar el comportamiento de los 27 bloques y la fusión 2x2 sin cargar el modelo completo de 449 millones de parámetros visuales más el resto del MoE.
- Clasificación y etiquetado de imágenes: usando `pooler_output` como entrada a cabezas de clasificación ligeras para tareas de moderación de contenido o etiquetado automático.
- Análisis de vídeo corto: los parches temporales de dos fotogramas permiten extraer características de secuencias de imágenes para tareas de detección de movimiento o resumen visual.
- Validación y auditoría de modelos: la paridad exacta documentada con el checkpoint padre facilita la verificación de reproducibilidad en entornos de investigación que requieran trazabilidad de pesos.
- Integración en sistemas de accesibilidad: descripción de imágenes mediante la conexión de la torre a un decodificador de texto externo en aplicaciones de lectura de pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta validación de paridad numérica con el checkpoint padre (coincidencia exacta en CPU FP32, CPU BF16 y CUDA BF16 a 96 y 448 píxeles), no métricas de calidad en tareas visuales estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en BF16 (el tamaño del repositorio coincide con el peso de los 449 millones de parámetros en BF16); en FP32 sería aproximadamente 1,8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Transformers con `AutoModel` y `AutoImageProcessor` (soporte nativo documentado); el formato safetensors permite su carga con otras herramientas compatibles, aunque no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI para este componente visual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next Vision (este) | 448.931.056 | no aplica (visual) | qwen-community-1.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (padre completo) | no disponible en la información | no disponible | qwen-community-1.0 | Hugging Face |
| Qwen3.8-27B | no disponible en la información | no disponible | no disponible | Hugging Face (referenciado en la model card) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde preguntas; su uso está restringido a extracción de características visuales.
- El orden de los tokens en `last_hidden_state` sigue el orden de bloques de fusión del padre; para obtener el orden ráster es necesario aplicar la restauración documentada en el adaptador de bench.
- La licencia Qwen Community License 1.0 puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- Al ser una extracción de pesos sin entrenamiento adicional, hereda cualquier sesgo presente en el modelo padre, aunque no se documentan sesgos específicos.
- Riesgo de alucinación: no aplica directamente al no generar texto, pero las representaciones visuales pueden amplificar sesgos del corpus de entrenamiento original.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 7 de noviembre de 2026; no hay evidencia de uso en producción ni comunidad de validación independiente.
- La validación se realizó con Transformers 5.17.0; versiones anteriores pueden no soportar `Qwen3_5VisionModel`.
- No se documentan idiomas soportados ni capacidades multilingües, ya que el componente no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/immanuelpeter/Qwen3.8-Flash-Next-Vision
- Modelo padre: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Revisión del checkpoint padre: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/de4b8e4d43b917e7706784d8bb445c9af86a3540
- Repositorio GitHub del modelo padre: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Herramienta de validación vision-tower-bench: https://github.com/immanuel-peter/vision-tower-bench
