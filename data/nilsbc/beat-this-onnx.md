# nilsbc/beat-this-onnx

## Resumen

Beat This! es un modelo de seguimiento de pulsos musicales (beat tracking) y de tiempos fuertes (downbeat tracking) desarrollado por Francesco Foscarin, Jan Schlüter y Gerhard Widmer en el Institute of Computational Perception de la Johannes Kepler University Linz, presentado en ISMIR 2024 bajo el título "Beat This! Accurate Beat Tracking Without DBN Postprocessing". El modelo predice, para cada frame de audio, la probabilidad de que sea un pulso o un tiempo fuerte, eliminando la necesidad del postprocesado clásico basado en redes bayesianas dinámicas (DBN) que lastraba la latencia y la complejidad de los sistemas anteriores.

Este repositorio concreto, publicado por nilsbc, no contiene los pesos originales en PyTorch sino una conversión a formato ONNX de los checkpoints `final0` y `small0`, junto con el front-end log-mel también exportado a ONNX. La conversión se realizó con beat-this 1.1.0 desde PyPI, torch 2.15.0, onnx 1.23.2 y onnxruntime 1.31.1, y la salida de ONNX Runtime coincide con la de PyTorch dentro de 1e-3 (diferencia absoluta máxima medida de aproximadamente 2e-5). El objetivo de esta conversión es permitir la inferencia sin dependencia de PyTorch, algo relevante para aplicaciones de escritorio y entornos ligeros como la app PansEcho para macOS, que descarga estos ficheros solo a petición del usuario.

El repositorio ocupa aproximadamente 0,1 GB y contiene tres ficheros: `beat_this_final0.onnx` (83.162.700 bytes), `beat_this_small0.onnx` (10.555.642 bytes) y `logmel.onnx` (4.468.830 bytes). La licencia es MIT, heredada del proyecto original CPJKU/beat_this.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de beat tracking sin postprocesado DBN; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 1500 frames por llamada (ventana de audio en frames de 50 fps) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX en precision de exportacion) |
| Idiomas soportados | no disponible (modelo de audio musical, no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de audio | 22050 Hz mono |
| Front-end | 128 bandas log-mel a 50 fps (`logmel.onnx`) |
| Salida | logits de beat y downbeat por frame |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo más allá de que se trata de un sistema de beat tracking sin postprocesado DBN, que es precisamente la contribución central del paper de ISMIR 2024: sustituir el postprocesado probabilístico clásico por una predicción directa de logits por frame. El pipeline publicado se compone de dos etapas: primero `logmel.onnx`, un front-end con filtro fijo y sin pesos entrenados que convierte audio mono a 22050 Hz en tramas log-mel de 128 bandas a 50 fps; después, el modelo de beats consume hasta 1500 frames por llamada y devuelve logits de beat y downbeat por frame.

Los pesos distribuidos corresponden a los checkpoints publicados `final0` y `small0` del proyecto original CPJKU/beat_this. No se dispone de datos sobre número de tokens de entrenamiento ni sobre la composición exacta del dataset, aunque la model card advierte que parte de los datos de entrenamiento contiene música con derechos de autor o ficheros bajo términos Creative Commons limitados, y que los pesos se distribuyen desde CPJKU como artefactos de investigación. No se documenta en la información proporcionada si hubo RLHF, DPO ni otras fases de alineamiento, algo esperable en un modelo de este tipo.

## Capacidades

- Seguimiento de pulsos musicales (beat tracking) sobre audio mono a 22050 Hz.
- Seguimiento de tiempos fuertes (downbeat tracking), con logits separados por frame.
- Predicción directa sin postprocesado DBN, lo que simplifica el pipeline de inferencia.
- Extracción de características log-mel de 128 bandas a 50 fps mediante un front-end ONNX independiente.
- Procesamiento por ventanas de hasta 1500 frames por llamada.
- Inferencia con ONNX Runtime sin dependencia de PyTorch.
- Dos variantes de tamaño: `final0` (aproximadamente 83 MB) y `small0` (aproximadamente 10,5 MB).
- No se documenta soporte de tool calling, agentes, visión, audio lingüístico ni capacidades multilingües.

## Casos de uso

- Análisis musical automatizado en producción: el modelo permite obtener rejillas rítmicas (beats y downbeats) de una pista de audio para alimentar herramientas de edición, visualización o alineación, con un pipeline ONNX ligero que no requiere PyTorch.
- Sincronización de vídeo y audio: los downbeats predichos sirven para cortar o alinear clips musicales con el compás, útil en herramientas de montaje automático.
- Aplicaciones de escritorio para macOS: la app PansEcho descarga estos ficheros solo a petición del usuario tras mostrar la licencia, lo que ilustra un uso real de esta conversión en un producto de consumo.
- Anotación asistida en musicología e investigación: generar anotaciones preliminares de beats y downbeats sobre corpus de audio para su revisión manual, aprovechando la ventana de 1500 frames por llamada.
- Sistemas de recomendación y etiquetado musical: extraer estructura rítmica (tempo implícito, compases) para enriquecer metadatos de catálogos musicales.
- Integración en entornos ligeros o embebidos: la variante `small0` (aproximadamente 10,5 MB) permite despliegues con requisitos de memoria reducidos, por ejemplo en plugins de DAW o aplicaciones móviles.
- Educación musical interactiva: detección de pulsos para ejercicios de ritmo y sincronización con pistas de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la fidelidad de la conversión a ONNX: la salida de ONNX Runtime coincide con la de PyTorch dentro de 1e-3, con una diferencia absoluta máxima medida de aproximadamente 2e-5. No se incluyen métricas de precisión de beat o downbeat (por ejemplo, F-measure) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los ficheros, `final0` ocupa aproximadamente 83 MB y `small0` aproximadamente 10,5 MB en pesos, más el front-end `logmel.onnx` de aproximadamente 4,5 MB.
- GPU recomendadas: no disponible; al ser modelos pequeños en formato ONNX, cabe esperar ejecución viable en CPU y en GPU de consumo, pero no se documentan requisitos ni perfiles de hardware concretos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con unos pocos cientos de MB de memoria libre, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (versión probada 1.31.1); el repositorio no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beat This! (esta conversión ONNX) | no disponible | hasta 1500 frames por llamada | sin benchmarks publicados en la informacion disponible | MIT | ONNX en Hugging Face |
| Beat This! original (CPJKU/beat_this) | no disponible | no disponible | sin datos en la informacion proporcionada | MIT | PyTorch en GitHub |
| Alternativas de beat tracking | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre otros modelos comparables de beat tracking (por ejemplo, sistemas basados en DBN) que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en audio musical; no es un modelo de lenguaje ni admite tareas de texto, visión o tool calling.
- No se han publicado métricas de precisión de beat o downbeat en la información disponible, por lo que no es posible evaluar su rendimiento frente a alternativas.
- La model card advierte que parte de los datos de entrenamiento contiene música con derechos de autor o ficheros bajo términos Creative Commons limitados; los pesos se distribuyen como artefactos de investigación, lo que puede condicionar su uso en producción.
- La licencia MIT se hereda del proyecto original CPJKU/beat_this; conviene revisar el fichero LICENSE del repositorio original para confirmar los términos aplicables a los pesos.
- El modelo procesa audio mono a 22050 Hz y ventanas de hasta 1500 frames; audios más largos requieren segmentación y gestión de los límites entre ventanas.
- Riesgo de sesgo hacia los estilos musicales representados en el dataset de entrenamiento, cuya composición no se documenta.
- No se documentan limitaciones de idioma porque el modelo no opera sobre lenguaje.
- La conversión ONNX fue realizada por un tercero (nilsbc) a partir de los checkpoints oficiales; la reproducibilidad depende de las versiones de torch, onnx y onnxruntime indicadas en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nilsbc/beat-this-onnx
- Repositorio original y pesos: https://github.com/CPJKU/beat_this
- Paper: "Beat This! Accurate Beat Tracking Without DBN Postprocessing", ISMIR 2024 (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Repositorio PansEcho (herramienta de exportación `tools/beat-this-export/export_beat_this.py`): no se proporciona URL en la información disponible
- Paquete beat-this en PyPI: https://pypi.org/project/beat-this/
