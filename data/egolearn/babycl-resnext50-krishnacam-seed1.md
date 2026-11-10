# egolearn/babycl-resnext50-krishnacam-seed1

## Resumen

BabyCL ResNeXt-50 KrishnaCam (seed 1) es un modelo de extracción de características visuales desarrollado por la organización EgoLearn. Se trata de una red convolucional ResNeXt-50 entrenada con los objetivos de aprendizaje autosupervisado del método BabyCL sobre el conjunto de datos KrishnaCam, un corpus de vídeo egocéntrico. El modelo no procesa texto: genera representaciones de imagen de 224 píxeles y está pensado exclusivamente para investigación sobre representaciones aprendidas a partir de experiencia visual en primera persona.

El checkpoint publicado corresponde al paso de optimización 11900 de un entrenamiento en streaming con semilla 1, realizado sobre una caché de vídeo sin pérdida a resolución nativa y tasa de fotogramas original. Con 35.801.104 parámetros, es un modelo compacto y ligero (el repositorio ocupa 0,1 GB) que puede ejecutarse en CPU.

Su relevancia es acotada y de nicho: no es un modelo de propósito general ni un clasificador semántico, sino un extractor de features para experimentos de representación visual egocéntrica. La licencia no está declarada y el código de carga depende de una instalación privada de EgoLearn, lo que limita seriamente su reutilización fuera de ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 (CNN) con objetivos de aprendizaje autosupervisado BabyCL |
| Parametros totales | 35.801.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (sin codificador de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (+ model.json con metadatos de construcción y checksums.sha256) |

## Arquitectura y entrenamiento

La arquitectura es una ResNeXt-50 convolucional, es decir, un backbone CNN con bloques residuales de convoluciones agrupadas. Sobre ella se aplican los objetivos visuales de BabyCL, un marco de aprendizaje autosupervisado orientado a representaciones a partir de experiencia visual. El modelo incorpora además una cabeza de clasificación temporal cuyo propósito es identificar segmentos de entrenamiento, no clases semánticas de objetos.

El entrenamiento se realizó en streaming con semilla 1 sobre la caché de vídeo verificada y sin pérdida de BabyCL a 224 píxeles y tasa de fotogramas nativa. El checkpoint guardado corresponde al paso de optimización 11900. El repositorio excluye explícitamente datos de entrenamiento, imágenes, captions, estado del optimizador y buffers de replay. No se documentan en la información disponible el número de tokens o muestras vistas, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables, en principio, a un modelo puramente visual).

## Capacidades

- Extracción de características de imagen (feature extraction) a partir de entradas visuales de 224 píxeles.
- Representaciones visuales autosupervisadas entrenadas sobre vídeo egocéntrico (KrishnaCam).
- Clasificación temporal de segmentos de entrenamiento mediante la cabeza específica (no clasificación semántica de objetos).
- No dispone de codificador de texto: no procesa ni genera lenguaje.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües, de audio ni modos de "thinking".

## Casos de uso

- Investigación en representaciones autosupervisadas: usar el modelo como extractor de features congelado para analizar qué información visual captura un backbone ResNeXt-50 entrenado con BabyCL sobre vídeo egocéntrico, comparando con otras semillas o datasets.
- Experimentos de visión egocéntrica: extraer embeddings de fotogramas de vídeo en primera persona para tareas posteriores de agrupamiento, recuperación o análisis de similitud visual, aprovechando que el entrenamiento se hizo sobre ese dominio.
- Baseline en estudios de aprendizaje autosupervisado: servir como referencia compacta (35,8 M de parámetros) frente a backbones más grandes en ablaciones sobre objetivos de aprendizaje.
- Reproducibilidad de experimentos: al publicarse con checksums SHA-256 y revisión inmutable, permite fijar exactamente los pesos usados en un estudio y registrar el commit del repositorio.
- Extracción de features en CPU: por su tamaño reducido y su carga en `device="cpu"`, es viable en entornos sin GPU para prototipos y validaciones.
- Análisis de la cabeza temporal: estudiar cómo el modelo separa segmentos de entrenamiento como proxy de la estructura temporal del corpus KrishnaCam.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la subida preserva los tensores del checkpoint seleccionado y que no añade nuevos resultados de entrenamiento ni de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 35,8 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 143 MB, por lo que la huella es mínima.
- GPU recomendadas: no se especifican; cualquier GPU con suficiente memoria para un modelo de este tamaño es apta.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna, aunque no se documenta una lista oficial.
- Despliegue: la carga se realiza mediante `huggingface_hub.snapshot_download` y `egolearn.evaluation.load_model`, que requiere una instalación autorizada de EgoLearn con el extra `train` y Python 3.12 o superior. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (extractores de features autosupervisados sobre vídeo egocéntrico) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sin codificador de texto: el modelo no puede procesar ni generar lenguaje; su uso queda restringido a representaciones visuales.
- La cabeza de clasificación temporal identifica segmentos de entrenamiento, no clases semánticas de objetos; no debe interpretarse como un clasificador de objetos.
- Licencia no declarada: no se especifican condiciones de uso comercial, por lo que su explotación en producción queda sin marco legal claro.
- Dependencia de código privado: el repositorio de EgoLearn es privado y la carga exige una instalación autorizada, lo que impide su uso fuera de ese ecosistema.
- Procedencia de entrenamiento incompleta: la model card señala que la procedencia histórica de entrenamiento que falta sigue marcada como no disponible.
- Sin datos de evaluación publicados: no hay benchmarks que permitan estimar su calidad frente a alternativas.
- Riesgo de sesgos: no documentado; al entrenarse sobre un corpus egocéntrico concreto (KrishnaCam), las representaciones pueden reflejar los sesgos de ese dominio.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto, pero las representaciones pueden ser poco fiables fuera de la distribución visual de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egolearn/babycl-resnext50-krishnacam-seed1
- Organización EgoLearn en Hugging Face: https://huggingface.co/egolearn
