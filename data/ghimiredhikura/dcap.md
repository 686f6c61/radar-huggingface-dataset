# ghimiredhikura/DCAP

## Resumen

DCAP (Detail–Context Adaptive Structured Pruning) es un conjunto de checkpoints para segmentación de deslizamientos de tierra en imágenes de teledetección, desarrollado por Deepak Ghimire y Seong-heum Kim. El repositorio publica los pesos de dos ensembles de tres miembros cada uno: un ResUNet denso de referencia y una variante podada estructuralmente (DCAP70), ambos entrenados sobre las mismas entradas de 21 canales que combinan reflectancia y características de cambio.

El modelo no es un modelo de lenguaje ni un modelo generativo: es un segmentador de imágenes basado en la arquitectura ResUNet, orientado a la detección pixel a pixel de deslizamientos en escenas satelitales. Su interés técnico reside en la comparación controlada entre una red densa y su versión podada, lo que permite evaluar el compromiso entre coste computacional y calidad de segmentación con idéntico preprocesado y política de umbrales.

Los checkpoints corresponden a la release v1.1.0 del proyecto en GitHub y se distribuyen como ficheros `.pt` de PyTorch, con un tamaño total de repositorio de 0,1 GB. La información disponible no incluye detalles sobre el volumen de datos de entrenamiento, el número de parámetros de cada miembro ni resultados de benchmarks publicados en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResUNet (encoder-decoder con conexiones residuales); variante podada estructuralmente DCAP70 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (segmentación de imágenes; entrada de 21 canales) |
| Tipos de cuantización | no disponible (checkpoints en punto flotante PyTorch `.pt`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (tensor-only checkpoints) |

## Arquitectura y entrenamiento

La arquitectura base es ResUNet, una U-Net con bloques residuales, aplicada a segmentación semántica binaria de deslizamientos de tierra. La entrada tiene 21 canales que combinan reflectancia y características de cambio, un diseño habitual en teledetección para explotar información multiespectral y diferencias temporales entre adquisiciones. Cada ensemble promedia las probabilidades predichas por sus tres miembros, entrenados con semillas 42, 123 y 2026, lo que reduce la varianza de la predicción final.

La contribución metodológica es la poda estructural adaptativa detalle-contexto (DCAP), que da nombre al proyecto. El repositorio publica tanto el ensemble denso de referencia como el ensemble DCAP70, podado al 70 % de alguna métrica de capacidad no especificada en la información disponible. No se detallan en la model card el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se emplearon técnicas de aumento de datos, destilación o ajuste fino posterior. Tampoco se documentan innovaciones de inferencia como decodificación especulativa, al no tratarse de un modelo autorregresivo.

## Capacidades

- Segmentación binaria de deslizamientos de tierra a nivel de píxel en imágenes de teledetección.
- Procesamiento de entradas de 21 canales con reflectancia y características de cambio.
- Predicción probabilística por ensemble: promedio de tres miembros por configuración.
- Dos configuraciones liberadas: ensemble denso (referencia) y ensemble DCAP70 (podado).
- Evaluación con política de umbrales propia del proyecto, documentada en `thresholds.json`.
- Integración con el pipeline de preprocesado y evaluación del proyecto DCAP v1.1.0.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.

## Casos de uso

- Cartografía de deslizamientos a escala regional: el ensemble se aplica sobre mosaicos satelitales preprocesados a 21 canales para generar mapas binarios de áreas afectadas, aprovechando el promedio de tres semillas para estabilizar la predicción en zonas de frontera.
- Evaluación comparativa de poda estructural: investigadores pueden ejecutar el ensemble denso y el DCAP70 sobre el mismo conjunto de test para medir la pérdida de calidad atribuible a la poda, con preprocesado y umbrales idénticos.
- Monitorización post-evento: tras un episodio de lluvias intensas, el modelo permite priorizar la inspección de laderas identificando píxeles con alta probabilidad de deslizamiento en imágenes de cambio.
- Gestión de riesgo y planificación territorial: los mapas de segmentación pueden alimentar inventarios de deslizamientos históricos y modelos de susceptibilidad del terreno.
- Investigación en teledetección: el repositorio sirve como línea base reproducible para comparar nuevas arquitecturas de segmentación bajo la misma política de umbrales y el mismo esquema de ensemble.
- Despliegue en entornos con recursos limitados: la variante DCAP70 está pensada para escenarios donde el coste computacional del ensemble denso es prohibitivo, manteniendo el mismo formato de entrada y salida.
- Validación de pipelines de preprocesado: los checkpoints y `models.json` con hashes permiten verificar la reproducibilidad de experimentos en cadenas de procesado de imágenes satelitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, pero no se especifica el número de parámetros ni el coste por miembro del ensemble.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; al tratarse de un ResUNet de segmentación, es plausible que quepa en GPUs de consumo, pero no hay datos que lo respalden.
- Opciones de despliegue: inferencia nativa con PyTorch mediante el paquete del proyecto (`python -m dcap`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Ensemble | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DCAP (este modelo) | ResUNet denso y DCAP70 podado | 21 canales (reflectancia y cambio) | 3 miembros por configuración | MIT | Hugging Face y GitHub v1.1.0 |
| U-Net estándar para segmentación | U-Net | Variable según implementación | No especificado | no disponible | Múltiples repositorios |
| DeepLabv3+ para teledetección | Encoder-decoder con separable conv | RGB o multiespectral | No especificado | no disponible | Múltiples repositorios |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento conversacional.
- La model card no documenta el dataset de entrenamiento, su composición ni su cobertura geográfica, lo que limita la evaluación de sesgos y de generalización a nuevas regiones.
- Riesgo de falsos positivos y negativos en función de la política de umbrales; es imprescindible usar `thresholds.json` y el preprocesado del proyecto para reproducir resultados.
- El rendimiento del ensemble depende del promedio de tres semillas concretas; no se garantiza que otras semillas reproduzcan los mismos resultados.
- No se especifican limitaciones por tipo de sensor, resolución espacial, nubosidad o estación del año.
- La licencia MIT permite uso comercial, pero no se ofrece garantía alguna sobre la idoneidad del modelo para decisiones de seguridad o emergencias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- No se detallan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghimiredhikura/DCAP
- Repositorio del proyecto: https://github.com/ghimiredhikura/DCAP
- Release v1.1.0: https://github.com/ghimiredhikura/DCAP/releases/tag/v1.1.0
- Guía de reproducción: https://github.com/ghimiredhikura/DCAP/blob/v1.1.0/docs/reproduction.md#evaluate-the-released-checkpoints
- Fichero de citación: https://github.com/ghimiredhikura/DCAP/blob/v1.1.0/CITATION.cff
