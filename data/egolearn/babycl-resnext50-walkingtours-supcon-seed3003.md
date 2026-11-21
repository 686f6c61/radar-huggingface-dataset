# egolearn/babycl-resnext50-walkingtours-supcon-seed3003

## Resumen

BabyCL SupCon on WalkingTours (seed 3003) es un modelo de extracción de características visuales desarrollado por la organización EgoLearn. Se trata de un ResNeXt-50 entrenado con aprendizaje autosupervisado sobre el conjunto de datos WalkingTours, que contiene experiencia visual en primera persona (egocéntrica). El modelo no es un modelo de lenguaje ni un generador de texto: produce representaciones de imagen y proyecciones de segmento, y no incorpora codificador de texto.

La relevancia del modelo reside en su enfoque de entrenamiento: combina discriminación de instancias con NT-Xent y aprendizaje contrastivo supervisado (SupCon) a nivel de segmento global, empleando un flujo de datos en streaming con replay y ocho actualizaciones remuestreadas por segmento admitido. Esto lo sitúa en la línea de investigación sobre representaciones aprendidas a partir de experiencia visual continua, un área de interés para robótica, visión egocéntrica y aprendizaje incremental.

El checkpoint exportado contiene únicamente pesos y metadatos de construcción (32 millones de parámetros, 0,1 GB), sin estado del optimizador, buffers de replay ni transcripciones. La model card indica explícitamente que esta versión no incluye puntuaciones de benchmarks, solo validación de exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 (red neuronal convolucional) con cabeza de proyección de segmento |
| Parametros totales | 31.965.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (sin codificador de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con model.json y checksums.sha256) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura ResNeXt-50, una red convolucional con bloques residuales y convoluciones agrupadas, adaptada aquí para extracción de características visuales. Sobre el backbone se añade una cabeza de proyección de segmento que genera embeddings de 128 dimensiones. No dispone de codificador de texto ni de cabecera de clasificación semántica: la proyección de segmento no predice clases de objetos.

El entrenamiento se realizó sobre WalkingTours con la semilla 3003, siguiendo el orden de flujo seleccionado con replay y ocho actualizaciones remuestreadas por cada segmento admitido. La función de pérdida combina NT-Xent para discriminación de instancias y SupCon global a nivel de segmento, con temperatura 0,2 y una cabeza de proyección separada. Cada pérdida activa tiene peso 0,5. El checkpoint guardado registra el paso de optimizador 3.616 y completa el flujo seleccionado. El SHA-256 del checkpoint fuente es `5c5861d6472857e74508f70f0dda985c87f5c2e3e1024a9341019d2076ae0ba1`. No se especifica en la información disponible el número total de tokens ni la composición detallada del dataset.

## Capacidades

- Extracción de características de imagen: genera representaciones visuales a partir de imágenes de entrada.
- Proyección de segmento: produce embeddings de 128 dimensiones por segmento mediante una cabeza dedicada.
- Aprendizaje autosupervisado: representaciones entrenadas sin etiquetas semánticas de objetos.
- Procesamiento de flujos egocéntricos: entrenado sobre WalkingTours, datos de experiencia visual en primera persona.
- Carga en CPU y GPU: el modelo se puede cargar con `load_model(directory, device="cpu")` mediante la librería EgoLearn.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Investigación en representaciones autosupervisadas: el modelo sirve como punto de partida para estudiar cómo el aprendizaje contrastivo a nivel de segmento afecta a la calidad de las características visuales en datos egocéntricos.
- Extracción de features para recuperación visual: las representaciones de imagen pueden indexarse para búsqueda por similitud en archivos de vídeo en primera persona.
- Preentrenamiento para tareas downstream: las características congeladas pueden alimentar clasificadores lineales o cabezas ligeras en tareas de reconocimiento de escenas o actividades.
- Segmentación y agrupación de secuencias: las proyecciones de segmento de 128 dimensiones permiten agrupar fragmentos de un flujo continuo por similitud.
- Evaluación de estrategias de replay y streaming: el checkpoint permite reproducir y comparar el efecto de la semilla 3003 frente a otras semillas del mismo entrenamiento.
- Análisis de robustez en visión egocéntrica: útil para estudiar el comportamiento de ResNeXt-50 en dominios de primera persona con movimiento de cámara y cambios de iluminación.
- Baseline en experimentos de aprendizaje continuo: al no incluir estado del optimizador ni buffers, sirve como referencia limpia de pesos finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que esta versión solo reporta validación de exportación: todos los tensores exportados coinciden con el checkpoint fuente, contienen valores finitos y cargan con la arquitectura registrada. Una pasada forward con imagen sintética produce características y proyecciones finitas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,13 GB en FP32 para los 31,9 millones de parámetros, más overhead de activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en CPU.
- Opciones de despliegue: carga mediante la librería EgoLearn (`egolearn.evaluation.load_model`) con Python 3.12 o superior y el extra `train`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| babycl-resnext50-walkingtours-supcon-seed3003 | ResNeXt-50 + cabeza SupCon | 31,9 M | no aplica | no disponible | Hugging Face, público |
| Otros checkpoints BabyCL de EgoLearn | ResNeXt-50 (variantes de semilla/objetivo) | no disponible | no aplica | no disponible | Colección EgoLearn en Hugging Face |
| ResNet-50 preentrenado en ImageNet | ResNet-50 | ~25,6 M | no aplica | variable según checkpoint | Amplia disponibilidad |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin codificador de texto: no puede procesar instrucciones en lenguaje natural ni generar texto.
- Sin predicción semántica: la cabeza de proyección de segmento no clasifica objetos; no debe usarse como clasificador directo.
- Sesgos desconocidos: no se documentan sesgos del dataset WalkingTours ni de la población o entornos capturados.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las representaciones pueden no generalizar fuera del dominio egocéntrico de entrenamiento.
- Limitaciones de idioma: no aplica, al no haber componente textual.
- Licencia no disponible: no se especifican condiciones de uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- Sin benchmarks: no hay evidencia publicada de calidad de representación frente a alternativas.
- Exclusión de artefactos: el export no incluye estado del optimizador, buffers de replay, transcripciones ni vocabulario, por lo que no permite reanudar el entrenamiento tal cual.
- Reproducibilidad: se recomienda registrar el commit inmutable del repositorio al usar los pesos en experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egolearn/babycl-resnext50-walkingtours-supcon-seed3003
- Organización EgoLearn: https://huggingface.co/egolearn
