# Nonbiuld/ImageFusion-Show-MSRS-SFT-full15-diffusion15-full15-20261107

## Resumen

ImageFusion-Show es un modelo de fusión de imágenes que combina información de sensores infrarrojos y visibles para generar una única imagen fusionada con mayor contenido informativo. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base showlab/show-o2-1.5B-HQ, desarrollado por el autor Nonbiuld, y está especializado en el dataset MSRS (Multi-Spectral Road Scenarios).

Este repositorio concreto contiene el checkpoint final del entrenamiento SFT sobre MSRS tras 45 épocas acumuladas: 15 épocas de entrenamiento de todos los parámetros, 15 épocas adicionales entrenando únicamente los módulos de difusión y 15 épocas finales de entrenamiento completo. La etapa final se completó el 7 de noviembre de 2026 con 5.625 pasos de optimizador sobre cuatro GPUs y 6.000 episodios reales de entrenamiento MSRS.

El modelo es relevante para tareas de visión por computador que requieren combinar modalidades complementarias, como conducción autónoma nocturna o vigilancia, donde la imagen visible aporta textura y detalle mientras que la infrarroja aporta información térmica independiente de la iluminación. Al estar construido sobre un modelo de 1.5B parámetros, su tamaño es contenido en comparación con alternativas de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de showlab/show-o2-1.5B-HQ, presumiblemente basada en difusión) |
| Parametros totales | no disponible (modelo base de 1.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint no ha sido cuantizado) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoint-final.pt`) |

## Arquitectura y entrenamiento

El modelo parte de showlab/show-o2-1.5B-HQ, un modelo base de 1.5B parámetros del que no se detalla la arquitectura interna en la información disponible, aunque las etiquetas del repositorio y la presencia de módulos de difusión en el entrenamiento sugieren un componente generativo basado en difusión. El ajuste fino se ha realizado sobre el dataset MSRS, compuesto por pares de imágenes infrarrojas y visibles con sus correspondientes imágenes fusionadas de referencia.

El entrenamiento se estructuró en tres fases secuenciales de 15 épocas cada una: una primera fase de ajuste completo de parámetros, una segunda fase en la que solo se entrenaron los módulos de difusión y una tercera fase final de nuevo con todos los parámetros. La etapa final partió del checkpoint completo de la segunda fase (`checkpoint-final.pt` del repositorio `Nonbiuld/ImageFusion-Show-MSRS-SFT-full15-diffusion15-20261106`, con sha256 `eba9f61c…`), ejecutó 5.625 pasos de optimizador en cuatro GPUs y acumuló 16.875 pasos en total entre las tres etapas. No se mezclaron checkpoints de MSRS y M3FD. El checkpoint final conserva el estado completo del optimizador, el planificador, los estados RNG de los cuatro rangos y los metadatos de entrenamiento, y no ha sido cuantizado.

## Capacidades

- Fusión de imágenes infrarrojas y visibles en una única imagen de salida.
- Generación de imágenes fusionadas con preservación de detalles térmicos y textura visible.
- Especialización en escenarios de carretera multi-espectral (MSRS).
- Entrenamiento supervisado con pares de referencia, lo que permite una evaluación directa contra la imagen fusionada objetivo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No se documentan capacidades multilingües ni modos de pensamiento (thinking mode).
- No se documentan capacidades de audio ni de visión general más allá de la fusión de imágenes.

## Casos de uso

- Conducción autónoma nocturna: el modelo fusiona la cámara visible con la cámara infrarroja para generar una imagen con información térmica de peatones y vehículos incluso en condiciones de baja iluminación, mejorando la percepción del sistema.
- Vigilancia perimetral 24 horas: en entornos con iluminación variable, la fusión permite mantener la detección de intrusiones tanto de día como de noche combinando textura visible y firmas térmicas.
- Asistencia a la conducción en condiciones adversas: niebla, lluvia o deslumbramiento reducen la calidad de la imagen visible; la fusión con infrarrojo aporta información complementaria para los sistemas ADAS.
- Inspección de infraestructuras: la combinación de imágenes visibles e infrarrojas permite detectar anomalías térmicas (pérdidas de calor, sobrecalentamientos) junto con el contexto visual de la instalación.
- Robótica móvil en interiores y exteriores: un robot equipado con cámara dual puede usar el modelo para construir una representación visual fusionada que mejore la navegación y la detección de obstáculos.
- Investigación en visión multi-espectral: el checkpoint sirve como punto de partida para experimentos de fusión de imágenes y para comparar estrategias de entrenamiento en tres fases (full, difusión, full).
- Preprocesado para pipelines de detección de objetos: la imagen fusionada puede alimentar detectores entrenados en RGB o en infrarrojo, aprovechando la información de ambas modalidades en una sola entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint contiene el modelo completo sin cuantizar, el estado del optimizador y los estados RNG, por lo que su tamaño en disco y en memoria es mayor que el de los pesos de inferencia puros.
- GPU recomendadas: el entrenamiento se realizó con cuatro GPUs (modelo no especificado). Para inferencia se requiere una GPU con suficiente VRAM para un modelo de 1.5B parámetros, aunque no se detalla la cifra exacta.
- Compatibilidad con GPU de consumo: no disponible. Un modelo de 1.5B parámetros en precisión completa podría caber en GPUs de consumo con 8-16 GB de VRAM, pero no se confirma en la información proporcionada.
- Opciones de despliegue: no disponibles. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato es un checkpoint PyTorch (`.pt`) que requiere cargar el modelo con el código del repositorio base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImageFusion-Show (este) | 1.5B (base) | no disponible | Fusión IR/visible | no disponible | Hugging Face |
| showlab/show-o2-1.5B-HQ | 1.5B | no disponible | Modelo base generativo | no disponible | Hugging Face |
| Alternativas de fusión de imágenes | no disponible | no disponible | Fusión multi-espectral | no disponible | no disponible |

No se dispone de información sobre modelos comparables de fusión de imágenes infrarrojas y visibles en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en fusión de imágenes IR/visible del dataset MSRS; su rendimiento fuera de ese dominio (otros sensores, otras resoluciones, otras escenas) no está documentado.
- No se especifica la licencia, por lo que el uso comercial no está autorizado de forma explícita hasta que el autor la defina.
- El checkpoint incluye el estado del optimizador y los estados RNG, lo que incrementa su tamaño y requiere un proceso de extracción de pesos para inferencia.
- No se documentan sesgos conocidos, pero al entrenarse sobre un dataset específico de escenarios de carretera, puede generalizar mal a otros contextos.
- Riesgo de alucinación: en modelos generativos de imágenes, existe el riesgo de generar detalles no presentes en las entradas; no se documenta ninguna evaluación al respecto.
- No se proporcionan métricas de calidad de fusión (PSNR, SSIM, etc.) ni comparaciones con el modelo base, lo que impide evaluar la mejora obtenida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Nonbiuld/ImageFusion-Show-MSRS-SFT-full15-diffusion15-full15-20261107)
- [Checkpoint de la primera fase](https://huggingface.co/Nonbiuld/ImageFusion-Show-MSRS-SFT-full15-20261105)
- [Checkpoint de la segunda fase](https://huggingface.co/Nonbiuld/ImageFusion-Show-MSRS-SFT-full15-diffusion15-20261106)
- [Modelo base showlab/show-o2-1.5B-HQ](https://huggingface.co/showlab/show-o2-1.5B-HQ)
