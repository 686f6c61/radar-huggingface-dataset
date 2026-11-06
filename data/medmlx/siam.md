# MedMLX/siam

## Resumen

SIAM (Segment It All Model) es un modelo de segmentación de tejidos de cabeza y cerebro a partir de volúmenes 3D de resonancia magnética (MRI) o tomografía computarizada (CT). Lo desarrollan Romain Valabregue y coautores (Khemir, Bardinet, Rousseau, Auzias y Dorent), y este repositorio concreto es un reempaquetado de sus pesos originales para MLX en Apple Silicon, realizado por MedMLX. El modelo resuelve el problema de la segmentación anatómica multiclase independiente del contraste de entrada: produce 17 etiquetas de tejido más una etiqueta de anomalías a partir de una única imagen 3D.

Técnicamente es una red nnU-Net con encoder residual, entrenada sobre imágenes sintéticas generadas a partir de pocas plantillas de cabeza de alta calidad, lo que le permite generalizar a contrastes no vistos (T1, T2, FLAIR, CT) sin reentrenamiento. Predice a 0,75 mm isotrópicos y devuelve las etiquetas en la rejilla del volumen de entrada. La versión empaquetada es la v0.3, que añade la etiqueta `Anomalies` para patología.

Su relevancia ahora es doble: por un lado, ofrece una segmentación de cabeza completa (incluyendo estructuras extracraneales como cráneo, duramadre o tejido blando) con un único modelo; por otro, este port permite ejecutarla localmente en Apple Silicon vía Metal, sin depender de GPU NVIDIA ni de servicios en la nube, algo relevante para investigación con datos médicos sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net con encoder residual (red 3D completa, `3d_fullres`, trainer `nnUNetTrainerNoDA`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes, no de texto) |
| Tipos de cuantizacion | ninguno; pesos en float32 safetensors (sin cuantización) |
| Idiomas soportados | en (metadatos del modelo; la tarea no es lingüística) |
| Licencia | cc-by-4.0 (pesos); código upstream Apache-2.0; uso solo para investigación y educación |
| Formato de pesos | safetensors (float32), empaquetado para MLX |
| Resolucion de prediccion | 0,75 mm isotrópicos, etiquetas devueltas en la rejilla de entrada |
| Etiquetas de salida | 17 tejidos + 1 etiqueta de anomalías |
| Entrada | volumen 3D en NIfTI (T1, T2, FLAIR, CT, etc.) |
| Memoria tipica | ~16 GB de memoria unificada para una cabeza MRI completa |
| Tamano del repo | 2,8 GB |

## Arquitectura y entrenamiento

SIAM se basa en nnU-Net, el framework de segmentación biomédica auto-configurable descrito en arXiv:1809.10486, con un encoder residual. El entrenamiento se realiza sobre imágenes sintéticas generadas a partir de un conjunto reducido de plantillas de cabeza de alta calidad, en lugar de sobre un gran corpus de imágenes reales anotadas. Esta estrategia de entrenamiento sintético es la que dota al modelo de independencia respecto al contraste de la imagen de entrada: el mismo modelo se aplica a T1, T1 con contraste, T2, FLAIR o CT sin cambios.

La conversión a MLX se hizo a partir de la release de cinco folds en Zenodo (pred_DS108_LcsfP_Ano, época 4000), sin reentrenamiento, poda ni cuantización. Los pesos de red se almacenan como safetensors float32; no se trasladan el estado del optimizador ni los alias duplicados del decoder de los pesos del encoder. La inferencia reproduce la del `siam-pred -m 0` original: reorientación a orden de voxels RAS sin interpolación, ensemble de todos los folds con ventanas deslizantes gaussianas a paso 0,5 y sin espejado, y reorientación exacta del mapa de etiquetas de vuelta a la rejilla de entrada. La validación frente a PyTorch nnU-Net 2.8.1 (CPU, float32) reporta un 99,995 % de voxels con la misma etiqueta en una MRI T1 de cabeza completa, Dice mínimo de 0,9996 por etiqueta (0,998 para `Anomalies`) y diferencias de probabilidad de clase de como máximo 0,004.

## Capacidades

- Segmentación 3D de cabeza y cerebro completa a partir de un único volumen MRI o CT.
- Predicción de 17 etiquetas de tejido: GM cortical, WM, CSF, ventrículos, GM cerebelosa, tálamo, pálido, putamen, caudado, accumbens, amígdala, hipocampo, duramadre, vascular, cráneo, tejido blando extracraneal y anomalías.
- Independencia del contraste de entrada: funciona con T1, T1 con contraste, T2, FLAIR y CT.
- Etiqueta `Anomalies` para detección de patología (añadida en la v0.3).
- Predicción a resolución isotrópica de 0,75 mm y devolución de etiquetas en la rejilla original del input.
- Ensemble de cinco folds con ventanas deslizantes gaussianas.
- Opción `voxel_size=` para cabezas pequeñas (por ejemplo, neonatos) y `fold=` para seleccionar un fold individual.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente de segmentación de imagen.

## Casos de uso

- Segmentación anatómica en investigación neuroimagen: procesar cohortes de MRI T1/T2/FLAIR de forma local en un Mac con Apple Silicon, obteniendo mapas de tejido listos para análisis volumétrico sin enviar datos a la nube.
- Extracción de estructuras subcorticales: cuantificar volúmenes de tálamo, putamen, caudado, amígdala e hipocampo en estudios longitudinales, aprovechando las etiquetas específicas del modelo.
- Skull stripping y separación de tejido extracraneal: obtener máscaras de cráneo, duramadre y tejido blando de cabeza completa, útil como preprocesado para pipelines de registro o atenuación en PET/MR.
- Preprocesado para pipelines de radiómica: generar máscaras de región de interés (GM, WM, ventrículos) antes de la extracción de características, con la ventaja de que las etiquetas vuelven a la rejilla original sin interpolación adicional.
- Detección de anomalías en investigación oncológica: la etiqueta `Anomalies` permite localizar regiones patológicas (por ejemplo, glioma) en distintos contrastes, como demuestra el ejemplo del repositorio con el caso 100 de Bartnik et al.
- Docencia y prototipado: al ejecutarse localmente con `nnunet-mlx` y requerir solo ~16 GB de memoria unificada, sirve para demostraciones y cursos de segmentación médica sin infraestructura de GPU dedicada.
- Procesamiento de datos sensibles: al no requerir conexión externa, encaja en entornos donde la imagen médica no puede salir del equipo del investigador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la validación de equivalencia numérica entre el port MLX y PyTorch nnU-Net 2.8.1:

| Metrica (validacion MLX vs PyTorch) | Valor |
|---|---|
| Acuerdo de voxels, MRI T1 cabeza completa | 99,995 % |
| Dice minimo por etiqueta (excepto `Anomalies`) | 0,9996 |
| Dice `Anomalies` (cabeza sana, <0,5 mL) | 0,998 |
| Diferencia maxima de probabilidad de clase | 0,004 |
| Acuerdo de voxels, glioma T1 skull-stripped (fold 0, LPS) | 99,990 % |
| Dice minimo en ese caso | 0,9995 |

No se dispone de métricas de Dice frente a anotaciones reales (ground truth) en la información proporcionada.

## Requisitos de hardware

- Memoria: aproximadamente 16 GB de memoria unificada para una MRI de cabeza típica; el consumo crece con el campo de visión.
- Plataforma: Apple Silicon con Metal; el runner requiere Python 3.13 y `nnunet-mlx>=0.8.0`.
- GPU recomendadas: no disponible (el modelo está pensado para Apple Silicon; el original en PyTorch puede ejecutarse en CPU o GPU NVIDIA, pero no se detallan requisitos en la información disponible).
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada.
- Despliegue: `nnunet-mlx` (runner `siam` del módulo `nnunet_mlx.named_models`); el modelo original se sirve con `siam-pred` del repositorio de Valabregue et al.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Etiquetas | Independiente del contraste | Licencia | Plataforma |
|---|---|---|---|---|---|
| SIAM v0.3 (este) | nnU-Net 3D, encoder residual | 17 tejidos + anomalías | Sí (T1, T2, FLAIR, CT) | CC-BY-4.0 (pesos) | Apple Silicon vía MLX; PyTorch original |
| nnU-Net genérico (arXiv:1809.10486) | nnU-Net 3D auto-configurable | Depende del dataset | No por diseño | Apache-2.0 (código) | CPU/GPU NVIDIA |
| Otros segmentadores cerebrales (p. ej. FreeSurfer, SynthSeg) | Métodos diversos | Variable | SynthSeg sí; FreeSurfer no | Variable | CPU/GPU |

No se dispone en la información proporcionada de datos de rendimiento comparativos con alternativas concretas; la comparación anterior es cualitativa y se limita a lo que la model card documenta.

## Limitaciones y advertencias

- No validado para uso clínico: la model card indica explícitamente que es para investigación y educación.
- Licencia CC-BY-4.0 en los pesos: permite uso comercial con atribución, pero la recomendación del autor es limitarlo a investigación; conviene revisar la licencia upstream antes de cualquier uso en producción.
- Requiere atribución: es obligatorio citar a Valabregue et al. (arXiv:2605.02737) y, si se usa MedMLX, su paper.
- Dependencia de plataforma: este repositorio es un port a MLX para Apple Silicon; no está pensado para GPU NVIDIA ni para despliegue en servidores convencionales.
- Memoria: ~16 GB de memoria unificada para una cabeza típica, lo que excluye equipos Apple Silicon de gama baja.
- La etiqueta `Anomalies` no es un sistema de diagnóstico; su validación es limitada y en cabezas sanas puede quedar por debajo de 0,5 mL con Dice 0,998.
- El entrenamiento sintético, aunque aporta independencia de contraste, puede introducir sesgos respecto a la distribución de las plantillas usadas; no se detallan en la información disponible.
- No se han publicado métricas de rendimiento frente a anotaciones reales en la información disponible, por lo que la evaluación clínica queda pendiente.
- El modelo no procesa texto ni lenguaje: los campos de idioma y contexto no aplican.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MedMLX/siam
- Repositorio original de SIAM: https://github.com/romainVala/SIAM
- Paper de SIAM: https://arxiv.org/abs/2605.02737
- Pesos originales (Zenodo): https://zenodo.org/records/17733431
- Runtime nnunet-mlx: https://github.com/MedMLX/nnunet-mlx
- Paper de nnU-Net: https://arxiv.org/abs/1809.10486
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia del código upstream: https://github.com/romainVala/SIAM/blob/main/LICENSE
- Paper de MedMLX: https://doi.org/10.64898/2026.10.28.26366762
- Dataset de ejemplo OpenNeuro ds000001: https://openneuro.org/datasets/ds000001
- Caso de glioma (Bartnik et al.): https://doi.org/10.5281/zenodo.22205631
