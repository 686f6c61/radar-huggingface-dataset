# moein99/P2Echo

## Resumen

P2Echo (Prompt2Echo) es un modelo de segmentación de imágenes médicas desarrollado por Moein Heidari y colaboradores de varias instituciones académicas, presentado en el artículo arXiv 2611.13425. Su propósito es unificar en un único modelo la segmentación de estructuras cardíacas en múltiples vistas de ecocardiografía, controlando qué estructura y qué vista se segmentan mediante prompts de texto estructurados en lugar de entrenar un modelo separado por vista o por estructura. Está pensado para investigación en análisis de imagen médica y no ha sido validado para decisiones clínicas.

Técnicamente, el modelo incorpora un módulo denominado Dynamic Image-Text Alignment (DyITA), que condiciona de forma adaptativa las características del decodificador según la vista y la estructura anatómica solicitadas en el prompt. El modelo cubre cuatro vistas ecocardiográficas estándar (2CH, 3CH, 4CH y PSAX) y cinco estructuras cardíacas (LV, MYO, LA, RV y RA). El repositorio de Hugging Face ocupa aproximadamente 0,2 GB y publica pesos en formato PyTorch (`.pth`), distribuidos mediante un enlace externo a Google Drive.

La relevancia del modelo radica en su enfoque de segmentación guiada por texto aplicada a un dominio concreto como la ecocardiografía, donde tradicionalmente se despliegan modelos específicos por vista. La información pública disponible es limitada: la model card no detalla el número de parámetros, la arquitectura base, el volumen de datos de entrenamiento ni los resultados cuantitativos de benchmarks, que remite al artículo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (framework con módulo Dynamic Image-Text Alignment, DyITA, sobre un decodificador condicionado por texto) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los prompts de texto son estructurados y específicos del dominio) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`), checkpoint alojado en Google Drive |

## Arquitectura y entrenamiento

La model card describe P2Echo como un framework unificado de segmentación guiada por texto para ecocardiografía multi-vista. El componente diferenciador es el módulo Dynamic Image-Text Alignment (DyITA), que adapta de forma dinámica las características del decodificador en función de la vista y la estructura anatómica indicadas en el prompt de texto. No se especifica en la información disponible qué backbone visual o textual utiliza, ni la arquitectura exacta del codificador o decodificador.

En cuanto al entrenamiento, el modelo se evalúa sobre un conjunto de datos interno multi-vista y tres conjuntos de datos externos reservados (held-out). No se detalla el número de tokens, el volumen de imágenes, la composición del dataset, ni si se emplearon técnicas de ajuste como RLHF o DPO (poco habituales en segmentación). Los detalles de implementación, comparativas cuantitativas y estudios de ablación se remiten al artículo arXiv 2611.13425.

## Capacidades

- Segmentación de imágenes de ecocardiografía en cuatro vistas estándar: 2CH (dos cámaras), 3CH (tres cámaras), 4CH (cuatro cámaras) y PSAX (eje corto paraesternal).
- Segmentación de cinco estructuras cardíacas: LV (ventrículo izquierdo), MYO (miocardio), LA (aurícula izquierda), RV (ventrículo derecho) y RA (aurícula derecha).
- Segmentación guiada por prompts de texto estructurados y conscientes de la vista, lo que permite seleccionar la estructura y la vista objetivo con un único modelo.
- Alineación dinámica imagen-texto mediante el módulo DyITA para condicionar la salida del decodificador.
- Modelo único que sustituye a múltiples modelos específicos por vista o estructura.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, generación de texto libre ni procesamiento de audio.

## Casos de uso

- Investigación en segmentación ecocardiográfica multi-vista: el modelo permite segmentar estructuras cardíacas en distintas vistas con un solo checkpoint, lo que simplifica la experimentación frente a pipelines con modelos separados.
- Evaluación comparativa de métodos de segmentación guiada por texto: sirve como referencia para estudiar cómo los prompts estructurados condicionan la segmentación en imagen médica.
- Automatización de la delineación de estructuras en estudios de investigación: útil para generar máscaras de LV, MYO, LA, RV y RA en cohortes de investigación, siempre con revisión experta.
- Extracción de medidas morfológicas en investigación cardiovascular: las máscaras segmentadas pueden alimentar análisis posteriores de volumen o grosor, sin uso clínico directo.
- Transferencia a nuevos conjuntos de datos: al evaluarse en tres datasets externos held-out, el modelo puede emplearse como punto de partida para experimentos de generalización entre dominios.
- Docencia y formación en imagen médica computacional: útil como ejemplo reproducible de segmentación multi-vista condicionada por texto en cursos y talleres.
- Prototipado de asistentes de anotación: el control mediante prompts de texto facilita integrar el modelo en herramientas de etiquetado semiautomático para investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo arXiv 2611.13425 para las comparativas cuantitativas, los estudios de ablación y los detalles de evaluación sobre el conjunto interno y los tres conjuntos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 0,2 GB, pero no se especifica el número de parámetros ni el consumo real en memoria).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; dado el tamaño reducido del repositorio (0,2 GB) es plausible que quepa en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante PyTorch siguiendo el repositorio de código (`pip install -r requirements.txt` y checkpoint en `checkpoints/p2echo.pth`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de segmentación ecocardiográfica.

## Limitaciones y advertencias

- El modelo no ha sido validado para la toma de decisiones clínicas; su uso previsto es exclusivamente la investigación en análisis de imagen médica.
- La licencia no está disponible, por lo que no puede confirmarse si se permite el uso comercial; conviene contactar con los autores antes de cualquier despliegue productivo.
- No se detallan sesgos conocidos, pero al entrenarse en un conjunto interno multi-vista y evaluarse en tres datasets externos, puede presentar problemas de generalización a poblaciones, equipos de ultrasonido o protocolos de adquisición distintos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de segmentaciones incorrectas o incompletas en imágenes de baja calidad o fuera de las cuatro vistas soportadas.
- El modelo solo cubre las vistas 2CH, 3CH, 4CH y PSAX y las estructuras LV, MYO, LA, RV y RA; no se documenta soporte para otras vistas o estructuras.
- No se especifican los idiomas ni el formato exacto de los prompts de texto; los prompts son estructurados y específicos del dominio.
- La ausencia de datos sobre parámetros, arquitectura base y benchmarks dificulta evaluar su idoneidad frente a alternativas sin consultar el artículo.
- El repositorio de Hugging Face no incluye los pesos directamente; estos se distribuyen mediante un enlace externo a Google Drive, lo que añade una dependencia de disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moein99/P2Echo
- Artículo (arXiv): https://arxiv.org/abs/2611.13425
- Código (GitHub): https://github.com/moeinheidari7829/P2Echo
- Página del proyecto: https://moeinheidari7829.github.io/p2echo/
- Checkpoint (Google Drive): https://drive.google.com/file/d/1wKF_MnWlMcpfYZTurb2wHOobENmhHQuj/view?usp=sharing
