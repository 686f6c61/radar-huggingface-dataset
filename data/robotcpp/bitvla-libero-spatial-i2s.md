# robotcpp/bitvla-libero-spatial-i2s

## Resumen

BitVLA LIBERO-Spatial I2S es una conversión a formato GGUF del checkpoint BitVLA afinado para la suite de tareas robóticas LIBERO-Spatial, publicada por el usuario robotcpp para su uso con el runtime Robot.cpp. El modelo original es un Vision-Language-Action (VLA) de tipo 1-bit desarrollado en el trabajo BitVLA (arXiv 2506.07530), que aborda el problema de desplegar modelos de manipulación robótica en dispositivos de borde mediante un diseño nativo de cuantización extrema en lugar de compresión posterior. Este repositorio no entrena un modelo nuevo: empaqueta el checkpoint `hongyuw/ft-bitvla-bitsiglipL-224px-libero_spatial-bf16` en cuatro componentes GGUF separados (LLM, visión, propiocepción y experto de acción).

El modelo combina un backbone de lenguaje con un codificador visual BitSigL de 224 píxeles y un experto de acción que produce chunks de 8×7 acciones desnormalizadas. Con 59.059.207 parámetros totales y un tamaño de repo de 1,4 GB, está pensado para inferencia en hardware modesto. La relevancia actual reside en que demuestra una ruta viable para ejecutar políticas VLA cuantizadas a nivel de matriz ternaria en un runtime propio (Robot.cpp), aunque con dependencias de software muy específicas.

La licencia es MIT, lo que facilita su reutilización, pero el formato I2S es propietario de Robot.cpp y no funciona con llama.cpp estándar, lo que limita su portabilidad fuera de ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con backbone de lenguaje, codificador visual BitSigL y experto de acción; cuantización nativa 1-bit (WeightQuant) |
| Parametros totales | 59.059.207 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (WeightQuant) con 366 matrices ternarias empaquetadas como `i2s-matrix-v1`; otras tensores en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuatro componentes: llm, vision, proprio, action) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BitVLA descrita en el paper: un VLA nativamente 1-bit donde las matrices del backbone se cuantizan a representaciones ternarias durante el entrenamiento, no después. El checkpoint base `ft-bitvla-bitsiglipL-224px-libero_spatial-bf16` corresponde a la versión afinada sin preentrenamiento robótico, según indica la model card. La conversión aplica BitVLA WeightQuant en BF16 y empaqueta 366 matrices ternarias en el layout `i2s-matrix-v1`, manteniendo el resto de tensores en BF16/F32.

El pipeline de inferencia recibe dos imágenes RGB de 224×224 en formato HWC uint8 (cámara frontal y de muñeca), ocho valores de propiocepción en crudo y una instrucción de tarea no vacía. El runtime normaliza imágenes y estado, y devuelve un chunk de acciones de 8×7 desnormalizado. La clave de normalización empleada es `libero_spatial_no_noops`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la documentación proporcionada.

## Capacidades

- Generación de acciones robóticas de manipulación: produce chunks de 8×7 acciones desnormalizadas a partir de observaciones visuales y de propiocepción.
- Percepción visual dual: procesa simultáneamente imagen frontal (`full_image`) e imagen de muñeca (`wrist_image`) a 224×224.
- Integración de propiocepción: consume ocho valores de estado del robot como entrada adicional.
- Condicionamiento por instrucción en lenguaje natural: requiere una instrucción de tarea no vacía para generar la política de acción.
- Ejecución cuantizada 1-bit: 366 matrices ternarias permiten inferencia con huella de memoria reducida.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.

## Casos de uso

- Manipulación robótica en laboratorio con LIBERO-Spatial: el modelo está afinado específicamente para esta suite, por lo que se usaría como política de control en entornos simulados de manipulación con dos cámaras y propriocepción.
- Despliegue en dispositivos de borde: gracias a la cuantización ternaria y a los 59 M de parámetros, puede ejecutarse en hardware con recursos limitados donde un VLA en BF16 completo no cabría.
- Investigación en cuantización 1-bit para robótica: sirve como referencia reproducible para comparar políticas VLA ternarias frente a versiones en precisión completa.
- Prototipado de pipelines VLA con Robot.cpp: permite validar la integración de los cuatro componentes GGUF (LLM, visión, proprio, acción) en un servidor de modelo local.
- Evaluación de robustez ante instrucciones de tarea: al condicionar la acción por lenguaje, se puede estudiar cómo varía la política ante distintas formulaciones de la misma tarea.
- Benchmarking de latencia en runtime propio: útil para medir throughput de un VLA cuantizado en el servidor `model-server` de Robot.cpp con hilos configurables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no reclama nuevos resultados de tasa de éxito, equivalencia numérica ni latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el tamaño del repo es de 1,4 GB, por lo que la huella en memoria es del orden de esa cifra más overhead del runtime.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs de consumo, pero no hay validación publicada.
- Cabe en consumer GPU: probablemente sí por el tamaño del repo, aunque no se ha confirmado en la documentación.
- Opciones de despliegue: exclusivamente Robot.cpp con soporte BitVLA (revisión `cf0712c2751fdd8519de22f822b7baa1b08b5937` o posterior) y sus parches de llama.cpp; no es compatible con llama.cpp estándar, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| BitVLA LIBERO-Spatial I2S (este) | 59.059.207 | no disponible | 1-bit ternaria + BF16/F32 | MIT | Robot.cpp (parcheado) |
| BitVLA original (paper) | no disponible | no disponible | 1-bit nativa | no disponible | no disponible |
| Checkpoint base `ft-bitvla-bitsiglipL-224px-libero_spatial-bf16` | no disponible | no disponible | BF16 | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de Robot.cpp: los ficheros I2S requieren el runtime parcheado; no funcionan con llama.cpp estándar ni con otras herramientas de inferencia.
- Los cuatro componentes GGUF deben provenir del mismo checkpoint; mezclarlos con otros produce resultados inválidos.
- El modelo está afinado para LIBERO-Spatial y no incluye preentrenamiento robótico general, por lo que su generalización a otros entornos no está validada.
- El postprocesado de acciones específico del robot queda a cargo del cliente; el runtime solo devuelve el chunk desnormalizado.
- El preprocesado de imágenes (redimensionado y recorte) debe replicar el del checkpoint original; desviarse de él degrada la política.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Sin métricas publicadas de tasa de éxito, equivalencia numérica o latencia; no hay evidencia de rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/robotcpp/bitvla-libero-spatial-i2s
- Checkpoint base: https://huggingface.co/hongyuw/ft-bitvla-bitsiglipL-224px-libero_spatial-bf16
- Paper BitVLA: https://arxiv.org/html/2506.07530v2
- Runtime Robot.cpp con soporte BitVLA: https://github.com/Robot-cpp/robot.cpp/tree/cf0712c2751fdd8519de22f822b7baa1b08b5937
- Perfil del autor: https://huggingface.co/robotcpp
