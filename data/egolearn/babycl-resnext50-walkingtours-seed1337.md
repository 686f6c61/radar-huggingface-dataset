# egolearn/babycl-resnext50-walkingtours-seed1337

## Resumen

BabyCL sobre WalkingTours (seed 1337) es un modelo de extracción de características visuales desarrollado por la organización EgoLearn. Se trata de una red convolucional ResNeXt-50 entrenada con los objetivos visuales de BabyCL (aprendizaje autosupervisado) sobre fotogramas del conjunto de datos WalkingTours, un corpus de vídeo en primera persona. El modelo no procesa texto: su única salida son representaciones de imagen, lo que lo sitúa en la categoría de backbones visuales para investigación en representación egocéntrica.

El modelo resuelve el problema de obtener representaciones visuales entrenadas de forma autosupervisada a partir de experiencia visual en primera persona, un área de interés para quienes investigan cómo los agentes aprenden de flujos continuos de vídeo. Con 35.801.104 parámetros (aproximadamente 35,8 millones), es un modelo compacto que cabe holgadamente en hardware de consumo, aunque su uso está restringido a entornos de investigación con una instalación autorizada de EgoLearn.

Su relevancia es fundamentalmente académica: el repositorio preserva un checkpoint concreto (paso de optimizador 3544) de un entrenamiento en streaming con semilla 1337, sin resultados de evaluación adicionales ni datos de entrenamiento incluidos. La licencia no está especificada y el código de carga pertenece a un repositorio privado, lo que limita su adopción fuera del ecosistema EgoLearn.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 (CNN) entrenada con objetivos visuales BabyCL |
| Parámetros totales | 35.801.104 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (sin codificador de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con model.json y checksums.sha256) |

## Arquitectura y entrenamiento

La arquitectura es una ResNeXt-50, una red neuronal convolucional con bloques residuales y convoluciones agrupadas, adaptada para extracción de características visuales. Sobre ella se aplican los objetivos de aprendizaje autosupervisado de BabyCL, orientados a aprender representaciones a partir de secuencias visuales sin etiquetas semánticas. El modelo incluye una cabeza de clasificación temporal cuyo propósito es identificar segmentos de entrenamiento, no clases semánticas de objetos.

El entrenamiento se realizó en streaming con semilla 1337 sobre fotogramas muestreados a 3,75 fps del release original de WalkingTours. El checkpoint guardado corresponde al paso de optimizador 3544. El repositorio excluye explícitamente los datos de entrenamiento, imágenes, leyendas, estado del optimizador y buffers de replay. La procedencia histórica del entrenamiento figura como no disponible y el export se verificó con la revisión `7e9671a8820377e2860da8789df4be6ce63e939c` de EgoLearn.

## Capacidades

- Extracción de características visuales a partir de imágenes individuales (pipeline `feature-extraction`).
- Representaciones entrenadas de forma autosupervisada sobre vídeo egocéntrico en primera persona.
- Cabeza de clasificación temporal para identificar segmentos de entrenamiento (no clases semánticas).
- No dispone de codificador de texto ni capacidad de generación de texto.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan capacidades de visión más allá de la extracción de características (sin detección, segmentación ni captioning).

## Casos de uso

- Investigación en representaciones autosupervisadas: servir como backbone visual preentrenado para experimentos que estudien qué información aprende un modelo a partir de flujos de vídeo egocéntrico, comparando con otras semillas o configuraciones.
- Extracción de embeddings para análisis de vídeo en primera persona: generar vectores de características de fotogramas de WalkingTours para tareas posteriores de clustering, recuperación o visualización de la estructura del dataset.
- Reproducibilidad de experimentos: al preservar el checkpoint exacto del paso 3544 con semilla 1337, permite replicar resultados de un entrenamiento en streaming concreto dentro del ecosistema EgoLearn.
- Baseline para comparación de objetivos de aprendizaje: usar estas representaciones como referencia frente a otros métodos autosupervisados aplicados al mismo corpus visual.
- Estudio de la cabeza de clasificación temporal: analizar cómo el modelo discrimina segmentos de entrenamiento como proxy de la estructura temporal del flujo de vídeo.
- Prototipado de pipelines de feature extraction en CPU: con 35,8 millones de parámetros, el modelo puede ejecutarse en CPU para pruebas de integración dentro de EgoLearn, como muestra el ejemplo de carga con `device="cpu"`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la subida preserva los tensores del checkpoint seleccionado y no añade nuevos resultados de entrenamiento ni de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 35,8 millones de parámetros en precisión completa (FP32) el peso ronda los 143 MB, y en FP16 unos 72 MB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM libre debería ser suficiente, aunque no se documentan requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.), dado el reducido número de parámetros.
- Opciones de despliegue: la carga se realiza mediante `egolearn.evaluation.load_model` tras descargar `model.safetensors` y `model.json` con `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BabyCL ResNeXt-50 WalkingTours (seed 1337) | 35,8 M | no aplica | Extracción de características visuales | no disponible | Pesos públicos; carga requiere EgoLearn autorizado |
| Otras variantes BabyCL en la organización EgoLearn | no disponible | no aplica | Extracción de características visuales | no disponible | Colección en Hugging Face de EgoLearn |
| Backbones ResNeXt-50 estándar (ImageNet) | ~25 M | no aplica | Clasificación/extracción de imagen | variable según implementación | Amplia |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo no tiene codificador de texto; no puede procesar entradas textuales ni generar texto.
- La cabeza de clasificación temporal identifica segmentos de entrenamiento, no clases semánticas de objetos, por lo que no debe interpretarse como un clasificador de objetos.
- La licencia no está especificada, lo que impide determinar si se permite el uso comercial; debe tratarse como no apta para producción sin aclaración legal.
- El código de carga pertenece a un repositorio privado: solo puede usarse con una instalación autorizada de EgoLearn con el extra `train`, lo que limita la reproducibilidad externa.
- No se incluyen datos de entrenamiento, imágenes, leyendas, estado del optimizador ni buffers de replay, y la procedencia histórica del entrenamiento figura como no disponible.
- No se han publicado resultados de evaluación ni benchmarks, por lo que no hay evidencia cuantitativa de calidad de las representaciones.
- Riesgo de sesgos: no documentado; al entrenarse sobre un corpus específico de vídeo egocéntrico, las representaciones pueden reflejar las características y sesgos de ese dataset.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto), pero las representaciones pueden no generalizar fuera del dominio de WalkingTours.
- El modelo está pensado para investigación sobre representaciones visuales egocéntricas, no para aplicaciones de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egolearn/babycl-resnext50-walkingtours-seed1337
- Organización EgoLearn en Hugging Face: https://huggingface.co/egolearn
