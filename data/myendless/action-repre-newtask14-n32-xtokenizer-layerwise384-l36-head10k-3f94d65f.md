# myendless/action-repre-newtask14-n32-xtokenizer-layerwise384-l36-head10k-3f94d65f

## Resumen

`myendless/action-repre-newtask14-n32-xtokenizer-layerwise384-l36-head10k-3f94d65f` es un checkpoint de investigación en robótica que combina un VLM congelado de 4B parámetros (basado en la familia Qwen3-VL) con un cabezal de lectura de acciones (*action readout*) entrenado desde cero. El componente entrenable es un DiT (Diffusion Transformer) por capas de 36 bloques, anchura 384, 6 cabezas de atención de dimensión 64 y 111.872.680 parámetros, que produce *chunks* de 32 acciones de articulación absoluta (joint14). El modelo está pensado para el benchmark RoboTwin y para el estudio de representaciones de acción en políticas visuomotoras.

El propósito del checkpoint es servir como artefacto de ablación arquitectónica: sustituye el experto de acción histórico de 28 capas por una variante de 36 capas con atención auto/cruzada intercalada, manteniendo el VLM congelado. Se ha entrenado durante 10.000 pasos sobre 14 tareas no vistas en el conjunto de origen, con 1.452.052 ventanas de entrenamiento y una pérdida final de 0,02305.

Es relevante ahora porque documenta de forma trazable (metadatos, procedencia, normalización y hash) un protocolo de generalización a tareas nuevas en robótica con VLM congelado, un área con escasa reproducibilidad pública. No es un modelo listo para producción: no se ha realizado evaluación en bucle cerrado y el archivo de pesos es un *state dict* nativo de PyTorch, no un modelo cargable con `AutoModel.from_pretrained`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM congelado (familia Qwen3-VL, 4B) + readout DiT layerwise (36 capas, anchura 384, 6 cabezas, dim 64) con atención auto/cruzada intercalada |
| Parametros totales | 111.872.680 (solo el readout entrenable; el VLM congelado se suma aparte, tamano exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción fijo de 32 pasos) |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16; no se publican pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch nativo (`model.pt`, state dict completo con VLM congelado y readout) |

## Arquitectura y entrenamiento

El modelo acopla un VLM congelado de 4B parámetros, inicializado desde el checkpoint `myendless/action-repre-newtask33-xtokenizer-v4-j14-h32-source30k-d258aba2` (revisión `4e7b2a3c...`), con un *readout* de acciones implementado como DiT por capas. El readout tiene 36 capas, anchura 384, 6 cabezas de atención con dimensión de cabeza 64, e incluye proyecciones por capa; los proyectores de índice impar quedan asignados pero sin uso en el modo de atención intercalada auto/cruzada. El total de parámetros del readout es 111.872.680.

El entrenamiento se realizó en BF16 sobre 8 GPU Hygon, con *batch* global 128, semilla 42 y 10.000 pasos. Los datos cubren 14 tareas retenidas, cada una con 32 episodios limpios y 320 aleatorizados (4.928 episodios en total), generando 1.452.052 ventanas. Se aplicó una normalización de origen compartida sobre 33 tareas. La pérdida final de entrenamiento fue 0,02305174246430397, que el autor advierte explícitamente que no equivale a tasa de éxito en control. No se incluyen episodios crudos de robot, activos de simulador, estado del optimizador ni checkpoints intermedios.

## Capacidades

- Generación de *chunks* de acción de 32 pasos en articulaciones absolutas (joint14) para control robótico.
- Representación de acciones condicionada por observaciones visuales procesadas por el VLM congelado.
- Generalización a tareas no vistas: el readout se entrena sobre tareas retenidas respecto del conjunto fuente.
- Atención auto/cruzada intercalada por capas para integrar información visual y estado de acción.
- No se documentan capacidades de *tool calling*, agentes, razonamiento multi-paso ni multilingüismo en la información disponible.
- No se documentan modos de *thinking*, visión general, audio ni otras capacidades del VLM subyacente en este checkpoint.

## Casos de uso

- Investigación en representaciones de acción: usar el checkpoint como punto de partida para ablaciones arquitectónicas del readout (número de capas, anchura, modo de atención) manteniendo el VLM congelado.
- Reproducción de experimentos de generalización: el paquete incluye configuración, procesador, normalización y registros de finalización, lo que permite replicar el entrenamiento de 10.000 pasos sobre las 14 tareas retenidas.
- Benchmark RoboTwin: servir como baseline para comparar políticas visuomotoras en el conjunto de tareas del benchmark, siempre que se añada evaluación en bucle cerrado.
- Estudio de normalización compartida: analizar el efecto de la normalización de origen sobre 33 tareas en la transferencia a tareas nuevas.
- Desarrollo de *loaders* personalizados: el checkpoint exige el cargador `QwenPIRepresentationV4` con `readout_architecture=layerwise_dit`, útil para validar pipelines de carga de state dicts completos con VLM congelado.
- Auditoría de procedencia: los directorios `metadata/` y `provenance/` permiten trazar protocolo revisado, instantánea del código de entrenamiento e inventario de entorno para estudios de reproducibilidad.
- No es adecuado como componente de producción sin evaluación en bucle cerrado y sin un *wrapper* de inferencia propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha realizado evaluación en bucle cerrado para este checkpoint y que la pérdida de entrenamiento (0,02305) no debe interpretarse como tasa de éxito de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 10,0 GB e incluye el state dict completo con VLM de 4B y readout de ~112M parámetros.
- GPU recomendadas: no disponible; el entrenamiento se realizó en 8 GPU Hygon en BF16.
- Compatibilidad con GPU de consumo: no confirmada; un VLM de 4B en BF16 requiere del orden de 8 GB solo para pesos, más activaciones y overhead, por lo que encajaría en GPUs de 16-24 GB únicamente con cuantización, que no se publica.
- Opciones de despliegue: no se soporta carga directa con `Transformers AutoModel.from_pretrained`; se requiere el código de entrenamiento `action_repre` y el cargador `QwenPIRepresentationV4` con `readout_architecture=layerwise_dit`, junto con la configuración, el procesador y la normalización liberados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota operativa: las rutas específicas de máquina presentes en los metadatos conservados deben mapearse explícitamente.

## Comparativa con modelos similares

| Modelo | Parametros (readout) | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (36 capas, 384) | 111.872.680 | no disponible (horizonte 32) | sin evaluación en bucle cerrado | Apache 2.0 | Hugging Face, state dict nativo |
| Experto de acción histórico Qwen3 (28 capas) | no disponible | no disponible | no disponible | no disponible | referenciado en la model card, no comparado numéricamente |
| `myendless/action-repre-newtask33-xtokenizer-v4-j14-h32-source30k-d258aba2` (modelo base del VLM) | no disponible | no disponible | no disponible | no disponible | Hugging Face, revisión `4e7b2a3c...` |

No se dispone de datos de benchmarks ni de métricas de control para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sin evaluación en bucle cerrado: no hay evidencia de tasa de éxito en control robótico real o simulado.
- La pérdida de entrenamiento (0,02305) no es una métrica de rendimiento de política y no debe presentarse como tal.
- El archivo `model.pt` es un state dict completo, no un modelo Transformers; intentar cargarlo con `AutoModel.from_pretrained` fallará.
- Las rutas de máquina en los metadatos deben remapearse manualmente antes de reutilizar la configuración.
- No se publican pesos cuantizados, por lo que el despliegue en hardware limitado no está resuelto.
- No se documentan sesgos, cobertura lingüística ni comportamiento fuera de las 14 tareas retenidas.
- Riesgo de alucinación y de comportamiento fuera de distribución no evaluado.
- El modelo está orientado a investigación en RoboTwin; no se garantiza su validez en otros entornos o morfologías de robot.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación en bucle cerrado desaconseja su uso en producción sin validación propia.
- No se incluyen episodios crudos, activos de simulador ni estado del optimizador, lo que limita la reproducción exacta del pipeline de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myendless/action-repre-newtask14-n32-xtokenizer-layerwise384-l36-head10k-3f94d65f
- Checkpoint de inicialización del VLM: https://huggingface.co/myendless/action-repre-newtask33-xtokenizer-v4-j14-h32-source30k-d258aba2
- Revisión del VLM base: `4e7b2a3c395e6bf2c010bc64990d210cf6daf71b`
- SHA256 del checkpoint: `3f94d65f061c8d49f0a2834a399b1df274b9f320d80555d39b978b14648c1978`
- Papers, blogs, repositorios y demos adicionales: no disponible en la información proporcionada.
