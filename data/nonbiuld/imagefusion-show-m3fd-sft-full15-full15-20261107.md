# Nonbiuld/ImageFusion-Show-M3FD-SFT-full15-full15-20261107

## Resumen

ImageFusion-Show-M3FD-SFT-full15-full15-20261107 es un checkpoint de ajuste supervisado (SFT) para fusión de imágenes infrarrojas y visibles, desarrollado por el usuario Nonbiuld sobre el modelo base showlab/show-o2-1.5B-HQ. El modelo se ha entrenado en dos fases consecutivas de 15 épocas cada una con actualización de todos los parámetros (full-parameter fine-tuning), alcanzando un total de 30 épocas acumuladas sobre el conjunto de datos M3FD. La segunda fase completó 5.625 pasos de optimizador utilizando cuatro GPUs y 22.500 muestras vistas por rango.

El repositorio publica únicamente el estado final de entrenamiento en formato PyTorch (`checkpoint-final.pt`), que incluye el modelo completo, el estado del optimizador y del scheduler de la segunda fase, los estados RNG de los cuatro rangos y metadatos de entrenamiento. No se ha publicado por separado el checkpoint de la primera fase, y no se ha aplicado cuantización ni se ha eliminado el estado del optimizador.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card con métricas de rendimiento, sin licencia declarada y sin información sobre idiomas o pipeline. No obstante, documenta un procedimiento reproducible de SFT en dos etapas sobre un modelo base de 1,5B parámetros orientado a tareas de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: show-o2-1.5B-HQ) |
| Parámetros totales | no disponible (el nombre del base model sugiere ~1,5B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el checkpoint no está cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoint-final.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El nombre del modelo base, showlab/show-o2-1.5B-HQ, sugiere una variante de la familia Show-o2 de Show Lab con aproximadamente 1,5B parámetros, pero la model card no confirma la arquitectura (transformer denso, MoE, híbrido u otra). Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset más allá de la referencia a M3FD, ni si se aplicaron técnicas de RLHF o DPO.

El entrenamiento consistió en dos fases de SFT con actualización completa de parámetros: una primera fase de 15 épocas sobre M3FD y una segunda fase de 15 épocas adicionales inicializada desde el checkpoint completo de la primera fase (sha256 `2a01cc03…`). La segunda fase completó 5.625 pasos de optimizador en cuatro GPUs, con 22.500 muestras vistas por rango, y finalizó el 10 de noviembre de 2026. Los metadatos embebidos en el checkpoint reportan `training_complete: true`, `completed_epochs: 15`, `training_phase: sft_full15` y `run_name: full15_after_full15_20261107`. No se mezclaron checkpoints de MSRS y M3FD. El checkpoint final conserva el estado del optimizador y del scheduler, por lo que no es directamente un artefacto de inferencia ligero.

## Capacidades

- Fusión de imágenes infrarrojas y visibles: la tarea declarada en las etiquetas del repositorio es image-fusion con modalidades infrared y visible.
- Ajuste supervisado sobre M3FD: el entrenamiento se realizó específicamente sobre el dataset M3FD, orientado a fusión de imágenes.
- Actualización completa de parámetros: el checkpoint refleja un fine-tuning full-parameter, no un ajuste con adaptadores (LoRA u otros).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, thinking mode, visión general, audio ni otras tareas fuera de la fusión de imágenes.
- No se documenta soporte de function calling ni de razonamiento multi-paso.

## Casos de uso

- Fusión infrarrojo-visible en visión nocturna: el modelo puede emplearse para combinar información térmica (infrarrojo) y detalle textural (visible) en escenarios de baja iluminación, aprovechando el entrenamiento específico sobre M3FD.
- Vigilancia y seguridad perimetral: integración en pipelines de cámaras duales (IR + RGB) para generar una imagen fusionada que mejore la detección de personas u objetos en condiciones de poca luz.
- Conducción autónoma y asistencia a la conducción: fusión de sensores para mejorar la percepción en condiciones adversas (niebla, noche), siempre que se valide el rendimiento fuera del dominio M3FD.
- Inspección industrial: combinación de imágenes térmicas y visibles para detectar anomalías de temperatura con contexto visual en equipos y estructuras.
- Investigación académica en fusión de imágenes: el checkpoint sirve como punto de partida reproducible para experimentos de SFT en dos etapas, dado que se documenta la procedencia y los metadatos del entrenamiento.
- Robótica y drones: fusión de flujos IR y visible en plataformas con recursos limitados, sujeto a la validación de latencia y a la conversión del checkpoint a un formato de inferencia adecuado.
- Reproducibilidad de pipelines de entrenamiento: el estado completo (modelo, optimizador, scheduler, RNG) permite reanudar o auditar el entrenamiento en cuatro GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de ~1,5B parámetros en fp32 se requerirían aproximadamente 6 GB solo para pesos, y en fp16 alrededor de 3 GB, pero el checkpoint publicado incluye estado del optimizador y scheduler, lo que incrementa sustancialmente el espacio necesario para cargarlo tal cual.
- GPU recomendadas: el entrenamiento se realizó en cuatro GPUs (modelo no especificado); para inferencia no se indica hardware recomendado.
- ¿Cabe en GPU de consumo? No confirmado. Un modelo de ~1,5B en fp16 podría caber en GPUs de consumo con 8 GB o más, pero el checkpoint en formato PyTorch con estado de optimizador no es directamente desplegable sin conversión.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un checkpoint PyTorch orientado a fusión de imágenes, el despliegue requeriría el código del modelo base show-o2-1.5B-HQ.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de fusión de imágenes infrarrojo-visible con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido.
- Sin métricas de evaluación: no se publican benchmarks ni resultados cuantitativos de calidad de fusión, por lo que el rendimiento real es desconocido.
- Checkpoint no optimizado para inferencia: incluye estado del optimizador, scheduler y RNG de cuatro rangos; requiere conversión o extracción de pesos antes de desplegar.
- Primera fase no publicada: el checkpoint de la primera fase de 15 épocas no está disponible por separado, lo que limita la reproducibilidad parcial del pipeline.
- Dominio restringido: el ajuste se realizó exclusivamente sobre M3FD; no hay evidencia de generalización a MSRS u otros conjuntos.
- Riesgo de sobreajuste: 30 épocas acumuladas de full-parameter fine-tuning sobre un único dataset pueden provocar sobreajuste; no se aportan curvas de validación.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas: al no documentarse capacidades de texto ni idiomas, estos aspectos no pueden evaluarse.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación y actualización en 2026: verificar la vigencia y el soporte del modelo base show-o2-1.5B-HQ antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nonbiuld/ImageFusion-Show-M3FD-SFT-full15-full15-20261107
- Modelo base: https://huggingface.co/showlab/show-o2-1.5B-HQ
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales relevantes para este modelo.
