# Allinsama/welcomyou__campplus-3dspeaker-200k-onnx

## Resumen

Este repositorio contiene un export a ONNX Runtime del modelo de embeddings de locutor CAM++ `speech_campplus_sv_zh_en_16k-common_advanced`, desarrollado originalmente por Alibaba DAMO Academy dentro del proyecto 3D-Speaker. No es un modelo generativo: es un extractor de características que convierte una señal de audio de 16 kHz en un vector de 192 dimensiones, L2-normalizado, que representa la identidad del hablante. Sobre esos vectores se construyen sistemas de verificación (¿es la misma persona?), identificación (¿quién es?) y diarización (¿quién habla y cuándo?), normalmente mediante similitud coseno y clustering.

La relevancia de este export concreto es práctica: según el autor, es el único export ONNX público de la variante entrenada con unos 200.000 locutores, mientras que el espejo oficial en HuggingFace (`funasr/campplus`) solo distribuye el `.bin` de PyTorch y el ONNX de ModelScope no siempre es accesible fuera de China. El archivo pesa 27 MB, se ejecuta en CPU con `onnxruntime` y evita depender de PyTorch en producción.

La arquitectura es CAM++ (FCM + TDNN + DenseTDNN + StatsPool + Dense), descrita en el paper arXiv:2303.00332, con entrada de fbank de 80 dimensiones y salida de 192 dimensiones. El modelo está pensado para chino e inglés, aunque el autor reporta buen comportamiento cross-lingual. Conviene señalar una discrepancia de procedencia: el identificador del repositorio es `Allinsama/welcomyou__campplus-3dspeaker-200k-onnx`, mientras que la model card y los resultados de búsqueda apuntan a `welcomyou/campplus-3dspeaker-200k-onnx`, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CAM++ (FCM + TDNN + DenseTDNN + StatsPool + Dense) |
| Parámetros totales | No disponible (el export ONNX en float32 ocupa 27 MB) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible. La entrada es de longitud variable en tramas, con forma `(batch, frames, 80)`; no hay ventana de contexto definida |
| Tipos de cuantización | No disponible en la información. El archivo publicado es float32; ONNX Runtime permite aplicar cuantización dinámica int8 a posteriori |
| Idiomas soportados | Chino (`zh`) e inglés (`en`); el autor indica funcionamiento cross-lingual razonable, incluido vietnamita |
| Licencia | Apache 2.0 (heredada de 3D-Speaker) |
| Formato de pesos | ONNX (`campplus_cn_en_common_200k.onnx`, 27 MB), ejecutable con `onnxruntime`; el checkpoint original es PyTorch (`.pt`) en ModelScope |
| Dimensión del embedding | 192, L2-normalizado |
| Entrada | Fbank de 80 dimensiones, float32, `(batch, frames, 80)`, con CMVN (resta de la media por dimensión) |
| Frecuencia de muestreo | 16 kHz, mono |
| Locutores de entrenamiento | ~200.000 (VoxCeleb 1+2, CNCeleb 1+2 y corpus 3D-Speaker) |
| Pipeline de HuggingFace | No disponible |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

CAM++ es una red convolucional diseñada para verificación de locutor con un coste computacional bajo. El bloque FCM (feature concatenation module) combina características multi-escala, que se procesan mediante capas TDNN y DenseTDNN, y se agregan temporalmente con StatsPool (media y desviación estándar sobre el eje de tramas). La salida pasa por una capa densa que proyecta a un embedding de 192 dimensiones, normalizado L2 para que la comparación entre locutores se haga con producto escalar o similitud coseno. La contribución principal del paper es el uso de context-aware masking para mejorar la eficiencia y la robustez de las representaciones.

El entrenamiento se realizó sobre aproximadamente 200.000 locutores procedentes de VoxCeleb 1+2, CNCeleb 1+2 y el corpus propio de 3D-Speaker, con audio a 16 kHz. La model card no detalla el número de tokens, la composición exacta del dataset, ni si se aplicaron etapas de refinamiento tipo fine-tuning con pares difíciles o funciones de pérdida específicas (AAM-softmax, por ejemplo); esa información no está disponible en la documentación proporcionada. El export se generó reimplementando los módulos `FCM`, `TDNN`, `DenseTDNN`, `StatsPool` y `CAMPPlus` del repositorio 3D-Speaker, cargando el checkpoint `campplus_cn_en_common.pt` y trazando el grafo con `torch.onnx.export`.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio de 16 kHz, con salida L2-normalizada lista para similitud coseno.
- Verificación de locutor (1:1): comparar dos embeddings contra un umbral calibrado para aceptar o rechazar la misma identidad.
- Identificación de locutor (1:N): búsqueda del vector más cercano en un índice de embeddings precalculados.
- Diarización de hablantes como componente de embedding dentro de un pipeline que añada VAD, segmentación y clustering; el autor lo usa en la pipeline Senko.
- Funcionamiento cross-lingual: entrenado en chino e inglés, con resultados utilizables en otros idiomas según el autor (menciona vietnamita).
- Inferencia en CPU con `onnxruntime`, sin dependencia de PyTorch ni de GPU.
- Entrada de longitud variable: acepta segmentos de distinta duración sin recortes fijos, aunque la calidad del embedding depende de la cantidad de audio disponible.
- No incluye detección de voz, segmentación, clustering, antispoofing ni transcripción: esas piezas deben aportarse externamente.

## Casos de uso

- Verificación biométrica de voz en autenticación: extraer el embedding del audio de acceso y compararlo por similitud coseno con el vector de referencia del usuario registrado; el modelo es adecuado por su tamaño (27 MB) y su inferencia en CPU sin GPU.
- Diarización de reuniones y entrevistas: usar el extractor como bloque de embeddings dentro de una pipeline con VAD y clustering (por ejemplo, la pipeline Senko del autor) para etiquetar quién habla en cada segmento; el autor reporta que resulta unas 2,5 veces más rápido que ResNet34 en CPU.
- Indexación y búsqueda de archivos de audio por locutor: precalcular embeddings por segmento, almacenarlos en un índice vectorial y resolver consultas del tipo "encuentra todas las intervenciones de esta persona" en un archivo de radio o un archivo de contact center.
- Etiquetado de hablantes en transcripción ASR: combinar la salida del ASR con los embeddings para producir transcripciones con marcas de hablante en actas de reuniones, entrevistas o vistas judiciales.
- Control de calidad y enrutamiento en contact center: verificar que el agente que figura en el registro es quien habla, o agrupar llamadas por cliente para análisis de recurrencia y detección de duplicados.
- Antifraude en canales de voz: como señal complementaria a un sistema de antispoofing, comparar el embedding de la llamada entrante con el del cliente registrado para detectar suplantaciones; requiere un modelo de detección de audio sintético aparte, que este repositorio no incluye.
- Limpieza y auditoría de corpus de voz: agrupar segmentos por locutor para detectar hablantes sobrerrepresentados, duplicados o desbalanceados antes de entrenar modelos ASR propios.
- Postproducción de pódcast y audiolibros: separar y etiquetar intervenciones para generar capítulos, subtítulos o pistas por hablante de forma automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye EER, minDCF, tasas de acierto ni resultados en VoxCeleb-O/CNeleb-O para esta variante de 200.000 locutores. El único dato cuantitativo aportado por el autor es operativo: en su pipeline de diarización, este modelo resulta aproximadamente 2,5 veces más rápido que ResNet34 en CPU.

| Métrica | Resultado | Fuente |
|---|---|---|
| EER / minDCF en VoxCeleb u otros conjuntos | No disponible | Model card |
| Precisión de verificación con umbral fijo | No disponible | Model card |
| Velocidad relativa en diarización (CPU) | ~2,5× más rápido que ResNet34 | Model card, pipeline Senko |
| Latencia absoluta por segmento | No disponible | Model card |

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; el grafo ONNX ocupa 27 MB en float32, por lo que la huella de memoria es de decenas de MB, no de GB.
- GPU recomendadas: no son necesarias. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) sobra para lotes grandes; tiene más sentido usar GPU cuando se procesan miles de horas de audio en paralelo para diarización.
- Cabe en cualquier GPU consumer y también en CPU doméstica o en un contenedor pequeño; el caso de uso natural es CPU.
- Opciones de despliegue: `onnxruntime` con `CPUExecutionProvider` (el camino documentado), y otros execution providers de ONNX Runtime como CUDA, DirectML o CoreML según la plataforma. El paso previo de fbank se hace con `kaldi_native_fbank` en el ejemplo del autor. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Throughput y latencia: no publicados en términos absolutos. La única referencia es la comparación relativa de ~2,5× frente a ResNet34 en CPU dentro de la pipeline Senko.
- Consideración de pipeline: el coste real en producción suele estar dominado por el VAD, la segmentación y el clustering, no por este extractor.

## Comparativa con modelos similares

La información proporcionada no incluye métricas comparativas (EER, minDCF) de ninguno de estos modelos, por lo que la comparación es cualitativa y basada en lo que declara la model card.

| Modelo | Arquitectura | Dimensión del embedding | Locutores de entrenamiento | Formatos disponibles | Licencia | Notas |
|---|---|---|---|---|---|---|
| CAM++ 200k (este repositorio) | CAM++ (FCM + TDNN + DenseTDNN + StatsPool) | 192 | ~200.000 | ONNX (27 MB) | Apache 2.0 | Único export ONNX público de esta variante según el autor; ~2,5× más rápido que ResNet34 en CPU en diarización |
| CAM++ `funasr/campplus` | CAM++ | No disponible | No disponible (el autor indica que es una variante menor) | PyTorch `.bin` | No disponible en la información | Espejo oficial en HuggingFace, sin ONNX |
| CAM++ `iic/speech_campplus_sv_zh_en_16k-common_advanced` | CAM++ | 192 | ~200.000 | PyTorch `.pt` y ONNX en ModelScope | Apache 2.0 (según el export) | Checkpoint original; el acceso al ONNX desde fuera de China no siempre está disponible |
| ResNet34 (3D-Speaker) | CNN ResNet | No disponible | No disponible | No disponible | No disponible | Referencia de velocidad usada por el autor; más lento en CPU |
| ECAPA-TDNN (alternativas del ecosistema) | TDNN con atención de canal | No disponible | No disponible | No disponible | No disponible | No mencionado en la información proporcionada; sin datos comparativos verificables aquí |

## Limitaciones y advertencias

- No genera texto ni razona: es exclusivamente un extractor de embeddings de locutor. Cualquier expectativa de capacidades generativas es un error de categoría.
- Umbral de decisión dependiente del dominio: la similitud coseno entre embeddings no tiene un punto de corte universal; hay que calibrarlo con datos del canal, micrófono e idioma de despliegue.
- Idiomas: el entrenamiento declarado es chino e inglés. El buen comportamiento cross-lingual (vietnamita) es una observación del autor, no una garantía medida para otros idiomas, incluido el castellano.
- Calidad dependiente de la duración del segmento: segmentos muy cortos producen embeddings menos discriminativos. No se documentan en la model card curvas de EER frente a duración.
- Preprocesado estricto: la entrada debe ser audio mono a 16 kHz, fbank de 80 bins y CMVN con la media por dimensión. Desviaciones en el frontend (ventana, dither, normalización) degradan la comparación entre embeddings sin avisar.
- Fidelidad del export: el script reimplementa la arquitectura en PyTorch antes de exportar. No se publican pruebas de equivalencia numérica frente al checkpoint original, por lo que conviene validar el ONNX contra las salidas del `.pt` antes de sustituirlo en producción.
- Sin capacidades de antispoofing: el modelo no distingue voz real de voz sintética o replay. Para antifraude debe combinarse con un detector específico.
- La diarización no está incluida: hace falta VAD, segmentación y clustering externos; el modelo solo aporta el vector por segmento.
- Datos biométricos: los embeddings de voz son datos personales y, en la UE, categoría especial según el RGPD. Su almacenamiento y comparación requieren base jurídica, minimización y medidas de seguridad; la licencia Apache 2.0 no cubre las obligaciones legales de tratamiento.
- Licencia: Apache 2.0 heredada de 3D-Speaker. El modelo deriva de pesos de Alibaba DAMO Academy; conviene revisar los términos del repositorio original y del modelo en ModelScope antes de un uso comercial.
- Madurez del repositorio: 0 descargas, 0 likes y un único autor en el momento de la consulta. Además, el identificador `Allinsama/welcomyou__campplus-3dspeaker-200k-onnx` no coincide con el `welcomyou/campplus-3dspeaker-200k-onnx` que aparece en la model card y en los resultados de búsqueda; verifica qué repositorio contiene realmente los pesos antes de integrarlo.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de falsos positivos y falsos negativos en la verificación cuando el umbral no está calibrado o el audio tiene ruido, reverberación o códec agresivo.

## Enlaces

- Repositorio en HuggingFace (identificador de la ficha): https://huggingface.co/Allinsama/welcomyou__campplus-3dspeaker-200k-onnx
- Repositorio referido en la model card: https://huggingface.co/welcomyou/campplus-3dspeaker-200k-onnx
- Árbol de archivos del repositorio: https://huggingface.co/welcomyou/campplus-3dspeaker-200k-onnx/tree/main
- Modelo original en ModelScope: https://www.modelscope.cn/models/iic/speech_campplus_sv_zh_en_16k-common_advanced
- Espejo oficial en HuggingFace: https://huggingface.co/funasr/campplus/tree/main
- Repositorio 3D-Speaker (Alibaba DAMO Academy): https://github.com/modelscope/3D-Speaker
- Paper CAM++: https://arxiv.org/abs/2303.00332
- Script de exportación a ONNX: https://github.com/welcomyou/sherpa-vietnamese-asr/blob/main/convert_onnx/export_campplus_onnx.py
- Pipeline de diarización que lo utiliza (Sherpa Vietnamese ASR): https://github.com/welcomyou/sherpa-vietnamese-asr
- Catálogo de modelos de ONNX Runtime: https://onnxruntime.ai/models
