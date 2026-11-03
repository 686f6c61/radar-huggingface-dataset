# arnoldatse/transcriptor-sound-models

## Resumen

`arnoldatse/transcriptor-sound-models` es un repositorio de modelos ONNX para clasificación de audio (sound tagging) sobre el catálogo AudioSet, publicado por el usuario arnoldatse y pensado como componente del motor de búsqueda de sonidos de la aplicación de escritorio Transcriptor. No es un modelo entrenado desde cero, sino un paquete de tres exportaciones ONNX de arquitecturas ya conocidas: YAMNet (Google), EfficientAT mn04_as (Florian Schmid) y PANNs CNN14 (Kong et al.). El objetivo es detectar eventos sonoros (disparos, risas, música, etc.) en grabaciones de audio de forma totalmente local mediante ONNX Runtime, sin enviar datos a ningún servidor.

El repositorio es pequeño (0,4 GB) y contiene tres grafos independientes que integran el front-end log-mel dentro del propio grafo: cada uno recibe una forma de onda mono en float32 con valores en [-1, 1] y devuelve un vector de probabilidades sigmoideas por clase. Los tres modelos están entrenados sobre AudioSet (clips de YouTube), por lo que su vocabulario de clases es el mapa de AudioSet (521 o 527 clases según el modelo).

Es relevante para desarrolladores que necesiten un etiquetador de audio ligero, offline y multiplataforma (vía ONNX Runtime), con licencias permisivas por archivo y verificación numérica frente a las implementaciones originales (diferencias máximas de 1,6e-5 y 2e-6). No obstante, la información pública es escasa: no hay benchmarks propios, ni idiomas declarados, ni documentación de latencia o throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres modelos independientes exportados a ONNX: YAMNet (CNN), EfficientAT mn04_as (CNN eficiente), PANNs CNN14 (CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no son MoE) |
| Longitud de contexto | no aplica; ventana de audio de 0,975 s (YAMNet) o 3 s (EfficientAT, PANNs) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos float32) |
| Idiomas soportados | no disponible (clasificación de eventos sonoros, no dependiente de idioma) |
| Licencia | per-file: Apache-2.0 (yamnet.onnx), MIT (efficientat-mn04-3s.onnx), CC BY 4.0 pesos + MIT código (panns-cnn14-3s.onnx) |
| Formato de pesos | ONNX (opset 17, batch dinámico, front-end log-mel incluido en el grafo) |

Detalle por archivo:

| Archivo | Modelo base | Frecuencia | Ventana | Clases | SHA-256 |
|---|---|---|---|---|---|
| `yamnet.onnx` | YAMNet (Google) | 16 kHz | 15 600 muestras (0,975 s) | 521 (mapa YAMNet) | `98936f40...a2a2bef` |
| `efficientat-mn04-3s.onnx` | EfficientAT mn04_as (Schmid) | 32 kHz | 96 000 muestras (3 s) | 527 (AudioSet) | `db3ae00d...fb436749` |
| `panns-cnn14-3s.onnx` | PANNs CNN14 (Kong et al.) | 32 kHz | 96 000 muestras (3 s) | 527 (AudioSet) | `f8d75f78...8d94cb0e` |

## Arquitectura y entrenamiento

Los tres grafos son redes convolucionales (CNN) de clasificación de audio multi-etiqueta, no modelos generativos ni transformers. Cada uno incorpora su propio front-end de espectrograma log-mel dentro del grafo ONNX, de modo que el consumidor solo aporta la forma de onda cruda. La salida es un vector de probabilidades por clase con activación sigmoide (clasificación multietiqueta, no softmax), coherente con el etiquetado múltiple de AudioSet.

El entrenamiento no lo ha realizado el autor del repositorio: los pesos provienen de los proyectos originales. YAMNet se portó desde los pesos Keras oficiales `yamnet.h5` (tensorflow/models, `research/audioset/yamnet`) a PyTorch y luego se exportó; se validó contra la implementación de TensorFlow 2.21 en 377 ventanas de voz y sonido de juego, con una diferencia máxima de puntuación de 1,6e-5 y la misma clase top en todas las ventanas. EfficientAT mn04_as se exportó desde la release v0.0.1 (`mn04_as_mAP_432.pt`) y PANNs CNN14 desde `Cnn14_mAP=0.431.pth` (Zenodo 3987831), ambos con una diferencia máxima de 2e-6 frente al código PyTorch original. Los tres se entrenaron sobre AudioSet. No se documentan detalles de composición del dataset, número de tokens (no aplica) ni fases de RLHF/DPO.

## Capacidades

- Clasificación de eventos sonoros multi-etiqueta sobre el vocabulario de AudioSet (521 clases en YAMNet, 527 en EfficientAT y PANNs).
- Detección de sonidos concretos como disparos, risas o música, según el caso de uso declarado por la app Transcriptor.
- Ejecución 100 % local con ONNX Runtime, sin envío de datos a servicios externos.
- Procesamiento por lotes gracias al batch dinámico del grafo.
- Entrada de forma de onda mono en float32 con valores en [-1, 1]; el preprocesado log-mel está integrado.
- Soporte de tres ventanas y frecuencias de muestreo distintas (16 kHz/0,975 s y 32 kHz/3 s) para ajustar coste y resolución temporal.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio generativo: es exclusivamente un clasificador.

## Casos de uso

- Indexación y búsqueda de sonidos en grabaciones largas: dividir el audio en ventanas de 0,975 s o 3 s, ejecutar el modelo correspondiente y almacenar las etiquetas con marcas de tiempo para permitir búsquedas del tipo "encuentra las risas" o "localiza disparos". Es el caso de uso nativo de la app Transcriptor.
- Moderación de contenido en plataformas de vídeo o audio: detectar clases sensibles (disparos, gritos, música con derechos) en fragmentos subidos por usuarios antes de su publicación, con inferencia local para evitar enviar material a terceros.
- Etiquetado automático de archivos de audio para bibliotecas multimedia: generar metadatos de eventos sonoros que permitan filtrar y organizar grabaciones de campo, podcasts o samples musicales.
- Monitorización de entornos físicos con dispositivos de borde: al ser ONNX y ligero, puede desplegarse en mini-PC o Raspberry Pi para detectar eventos acústicos (cristales rotos, alarmas) en tiempo casi real.
- Análisis forense o de investigación: localizar eventos relevantes en horas de grabación antes de la escucha manual, reduciendo el tiempo de revisión.
- Preprocesado para pipelines de vídeo: usar las etiquetas de audio como señal auxiliar para segmentación, búsqueda o generación de subtítulos descriptivos.
- Evaluación comparativa de extractores de características de audio: al reunir tres arquitecturas con la misma interfaz ONNX, sirve como banco de pruebas para medir precisión y coste en un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye métricas de fidelidad de la exportación (diferencia máxima de 1,6e-5 para YAMNet y 2e-6 para EfficientAT y PANNs frente a las implementaciones originales) y las referencias de mAP de los pesos originales en el nombre de los ficheros (`mn04_as_mAP_432.pt`, `Cnn14_mAP=0.431.pth`), que corresponden a los pesos de origen y no a una evaluación propia del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 0,4 GB en total, lo que da una cota superior del orden de cientos de MB si se cargan los tres modelos simultáneamente en float32.
- GPU recomendadas: no disponibles. Al ser modelos CNN pequeños y ONNX, cualquier GPU con soporte CUDA para ONNX Runtime debería ser suficiente; también funcionan en CPU.
- ¿Cabe en GPU de consumo? No hay datos oficiales, pero por el tamaño del repositorio es altamente probable que quepa en cualquier GPU de consumo moderna; no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), que es el runtime declarado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Ventana | Clases | Licencia | Formato |
|---|---|---|---|---|---|
| YAMNet (este repo) | CNN (MobileNet) | 0,975 s a 16 kHz | 521 | Apache-2.0 | ONNX |
| EfficientAT mn04_as (este repo) | CNN eficiente | 3 s a 32 kHz | 527 | MIT | ONNX |
| PANNs CNN14 (este repo) | CNN | 3 s a 32 kHz | 527 | CC BY 4.0 (pesos) + MIT (código) | ONNX |
| AST (Audio Spectrogram Transformer) | Transformer | variable | 527 | no disponible en esta ficha | PyTorch/HF |
| BEATs | Transformer | variable | 527 | no disponible en esta ficha | PyTorch |

La comparativa se limita a los tres modelos incluidos en el propio repositorio, ya que no se han proporcionado datos de rendimiento de alternativas. No se dispone de cifras de mAP comparables entre ellos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: los tres modelos se entrenaron sobre AudioSet (clips de YouTube), por lo que heredan los sesgos de dominio, idioma y distribución de esa fuente; los sonidos poco representados en AudioSet tendrán peor detección.
- Riesgo de alucinación: al ser clasificadores multietiqueta con salida sigmoide, pueden producir falsos positivos con confianza moderada en audio ambiguo o ruidoso; no hay umbral calibrado documentado.
- Limitaciones de ventana: las ventanas son cortas (0,975 s o 3 s); eventos más largos requieren segmentación y agregación manual, y la resolución temporal depende del tamaño de ventana elegido.
- Idiomas: no se declara ningún soporte lingüístico; no es un modelo de voz ni de transcripción, solo de eventos sonoros.
- Licencias: la licencia es "per-file" y "other" a nivel de repositorio. `yamnet.onnx` es Apache-2.0, `efficientat-mn04-3s.onnx` es MIT y `panns-cnn14-3s.onnx` combina pesos CC BY 4.0 con código MIT. El uso comercial exige respetar la atribución de PANNs (Kong et al., 2020) y las condiciones de cada fichero; no hay una licencia única para todo el paquete.
- Producción: no hay benchmarks propios, ni documentación de latencia, ni versionado semántico; el repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción.
- Dependencia de ONNX Runtime: el front-end log-mel está embebido en el grafo, lo que simplifica el uso pero impide ajustar parámetros del espectrograma sin reexportar.

## Enlaces

- HuggingFace: https://huggingface.co/arnoldatse/transcriptor-sound-models
- YAMNet (tensorflow/models): https://github.com/tensorflow/models/tree/master/research/audioset/yamnet
- EfficientAT: https://github.com/fschmid56/EfficientAT
- PANNs (audioset_tagging_cnn): https://github.com/qiuqiangkong/audioset_tagging_cnn
- Pesos PANNs CNN14: https://zenodo.org/records/3987831
- Artículo PANNs: Kong, Cao, Iqbal, Wang, Wang, Plumbley, "PANNs: Large-Scale Pretrained Audio Neural Networks for Audio Pattern Recognition", IEEE/ACM TASLP 28 (2020)
- AudioSet: https://research.google.com/audioset/
