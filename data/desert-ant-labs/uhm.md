# desert-ant-labs/uhm

## Resumen

Uhm es un modelo de clasificación de audio desarrollado por Desert Ant Labs, especializado en la detección de muletillas o palabras de relleno ("uh", "um", "hmm") en señales de voz, con una precisión temporal de 20 milisegundos. Está diseñado para ejecutarse completamente en el dispositivo, sin necesidad de transcripción ASR previa, lo que lo hace adecuado para aplicaciones de bajo consumo, privacidad y latencia reducida. El modelo es un fine-tune de DistilHuBERT, una versión destilada de HuBERT-base, y se distribuye en formatos Core ML (fp16 compilado) y ONNX (fp16 y fp32), con un tamaño máximo de 98 MB.

La relevancia de Uhm radica en su capacidad para operar en tiempo real en hardware de consumo (iPhone, iPad, Mac) con un factor de tiempo real de hasta 296× en iPhone 17 Pro, lo que permite analizar una hora de audio en unos doce segundos. Está entrenado principalmente en inglés, pero mediante transferencia acústica ofrece soporte adicional para español, francés, alemán y neerlandés, aunque el rendimiento en estos idiomas no está validado contra ground truth. Su licencia es de código fuente disponible, gratuita hasta 100.000 usuarios activos mensuales por modelo, con licencia comercial para escalas mayores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilHuBERT (fine-tune) |
| Parametros totales | no disponible (no se publica el número exacto; el modelo compilado Core ML fp16 ocupa 45 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (entrada de 480.000 muestras a 16 kHz) |
| Tipos de cuantizacion | fp16 (Core ML y ONNX), fp32 (ONNX de referencia) |
| Idiomas soportados | Inglés (entrenamiento principal), español, francés, alemán y neerlandés (por transferencia acústica) |
| Licencia | Desert Ant Labs Source-Available License v1.0 (gratuita hasta 100.000 MAU por modelo; comercial para escalas mayores) |
| Formato de pesos | Core ML compilado (`.mlmodelc`), ONNX (`.onnx`) |

## Arquitectura y entrenamiento

Uhm se basa en DistilHuBERT, una versión destilada del modelo HuBERT-base (entrenado originalmente con aprendizaje auto-supervisado sobre audio en inglés). Sobre esta base se realizó un fine-tune supervisado para la tarea de clasificación de marcos de audio en seis clases: `not_filler`, `uh`, `um`, `hmm`, `and` y `other`. La salida es una predicción por cada 20 ms de audio, con una ventana de entrada máxima de 30 segundos (1.499 marcos de salida). El modelo no requiere ASR: opera directamente sobre la forma de onda.

Los datos de fine-tuning provienen del AMI Meeting Corpus (split IHM, licencia CC BY 4.0) y de contenido de vídeo interno creado por el equipo de Desert Ant Labs. Aunque el entrenamiento se realizó en inglés, se aplicó una transferencia acústica para extender la detección a español, francés, alemán y neerlandés. No se especifica el número total de tokens o pasos de entrenamiento, ni se detalla el uso de técnicas como RLHF o DPO; el proceso es un fine-tune supervisado convencional sobre anotaciones de muletillas.

## Capacidades

- Detección de muletillas ("uh", "um", "hmm") y otras disfluencias ("and", "other") en audio de voz, con resolución temporal de 20 ms.
- Funciona directamente sobre la forma de onda, sin necesidad de transcripción ASR ni de alineación de texto.
- Ejecución totalmente en el dispositivo (on-device), con soporte para iOS, macOS, tvOS y visionOS mediante Core ML, y para servidores o navegadores mediante ONNX Runtime.
- Clasificación por marcos con 6 clases: `not_filler`, `uh`, `um`, `hmm`, `and`, `other`. La distinción entre subtipos es secundaria; la fiabilidad principal es la separación filler vs. no-filler.
- Entrada de audio mono a 16 kHz, con ventanas de hasta 30 segundos.
- Salida estructurada con intervalos de inicio y fin, confianza y tipo de cada muletilla, lista para consumir desde Swift o Python.
- Rendimiento en tiempo real muy alto: factor de tiempo real de ~296× en iPhone 17 Pro, ~169× en iPhone 15 Pro y ~279× en iPad Pro M4 (modelo fp16 Core ML, sin incluir tiempo de carga).

## Casos de uso

- Edición de podcasts: los productores pueden cargar un episodio completo y obtener una línea de tiempo con todas las muletillas, permitiendo cortes precisos de 20 ms sin escuchar el audio completo. El modelo procesa una hora de audio en unos 12 segundos en un iPhone 17 Pro.
- Análisis de reuniones y entrevistas: herramientas de transcripción y resumen pueden marcar automáticamente los momentos de duda o vacilación, útiles para evaluar la fluidez de presentaciones o para generar índices de calidad de comunicación.
- Entrenamiento de oratoria y coaching: una aplicación móvil puede analizar discursos en tiempo real y mostrar al usuario la frecuencia y ubicación de sus muletillas, ayudando a reducir su uso. Al ejecutarse en el dispositivo, no requiere conexión a internet ni envía audio a terceros.
- Subtitulado y accesibilidad: en la generación de subtítulos automáticos para vídeo, las muletillas pueden marcarse como elementos opcionales o eliminarse, mejorando la legibilidad. La detección a nivel de marco permite sincronizar con precisión los marcadores.
- Moderación de contenido en vídeo: plataformas de publicación pueden detectar automáticamente segmentos con excesivas disfluencias para sugerir recortes o alertar al creador, sin necesidad de transcripción completa.
- Asistentes de voz y agentes conversacionales: un asistente puede detectar pausas o muletillas del usuario para ajustar el ritmo de la conversación o para activar funciones de confirmación cuando detecta incertidumbre. La baja latencia y el funcionamiento local facilitan su integración en dispositivos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (como accuracy, F1, etc.) en la información disponible. La model card no incluye métricas de evaluación sobre conjuntos de test estándar. Sin embargo, se proporcionan datos de rendimiento de inferencia en dispositivos Apple, medidos con el modelo fp16 Core ML compilado:

| Dispositivo | Factor de tiempo real |
|---|---:|
| iPhone 17 Pro | ~296× |
| iPhone 15 Pro | ~169× |
| iPad Pro M4 | ~279× |

El factor de tiempo real se define como la duración del audio dividida por el tiempo de análisis, excluyendo la carga del modelo. Por ejemplo, un factor de 296× significa que 296 segundos de audio se analizan en 1 segundo. No se dispone de comparativas con otros modelos de detección de muletillas.

## Requisitos de hardware

- Modelo ligero: el archivo Core ML fp16 compilado ocupa 45 MB, el ONNX fp16 51 MB y el ONNX fp32 98 MB. No requiere GPU dedicada; la inferencia puede ejecutarse en CPU.
- Plataformas Apple: requiere iOS 17 / macOS 14 o posterior para Core ML. Compatible con iPhone, iPad, Apple TV y Apple Vision Pro. Los factores de tiempo real medidos son ~296× (iPhone 17 Pro), ~169× (iPhone 15 Pro) y ~279× (iPad Pro M4).
- Otras plataformas: mediante ONNX Runtime, puede ejecutarse en Python (CPU o GPU), navegadores (WebAssembly) y servidores. No se especifican requisitos mínimos de RAM, pero dado el tamaño del modelo, cualquier dispositivo moderno es suficiente.
- Opciones de despliegue: Core ML para aplicaciones nativas de Apple, ONNX Runtime para Python y servidores, y el SDK Swift `desert-ant-core` para integración directa en Xcode. También hay una demo web en Hugging Face Spaces.
- Latencia: con un factor de tiempo real de ~169× en un iPhone 15 Pro, un archivo de 10 minutos se analiza en aproximadamente 3,5 segundos (sin contar la carga inicial del modelo).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de muletillas en audio con características similares (on-device, sin ASR, resolución de 20 ms). La model card no menciona alternativas ni benchmarks comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; el rendimiento en español, francés, alemán y neerlandés se basa en transferencia acústica y no ha sido validado contra anotaciones de referencia en esos idiomas.
- Funciona mejor en audio de tipo podcast, reuniones o voz hablada clara. La presencia de música de fondo intensa, risas o solapamiento de múltiples hablantes degrada la calidad de la detección.
- Las etiquetas de subtipo (`uh`, `um`, `hmm`, `and`, `other`) son secundarias y menos fiables que la distinción binaria filler vs. no-filler. En aplicaciones críticas, se recomienda tratar la salida como una señal de presencia de muletilla más que como una clasificación exacta del tipo.
- La licencia es de código fuente disponible, no open source en sentido estricto. Es gratuita para uso comercial hasta 100.000 usuarios activos mensuales por modelo; superado ese umbral se requiere una licencia comercial. Esto puede ser una restricción para proyectos a gran escala.
- No se publican métricas de precisión (accuracy, F1) ni resultados en conjuntos de test estándar, lo que dificulta evaluar su rendimiento real frente a otras soluciones.
- El modelo acepta ventanas de hasta 30 segundos; para audios más largos, el SDK deberá segmentar la entrada. No se especifica cómo se manejan los bordes entre ventanas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/uhm
- Página del producto en Desert Ant Labs: https://desertant.com/models/uhm/
- Sitio web de Desert Ant Labs: https://desertant.com/
- Repositorio Swift SDK (uhm-swift): https://github.com/Desert-Ant-Labs/uhm-swift
- Documentación del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/uhm.md
- Demo interactiva en Hugging Face Spaces: https://huggingface.co/spaces/desert-ant-labs/uhm-demo
- Licencia: https://license.desertant.com/1.0
- Modelo base DistilHuBERT: https://huggingface.co/ntu-spml/distilhubert
- Modelo base HuBERT: https://huggingface.co/facebook/hubert-base-ls960
- Dataset AMI Meeting Corpus: https://huggingface.co/datasets/edinburghcstr/ami
