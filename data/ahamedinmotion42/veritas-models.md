# Ahamedinmotion42/veritas-models

## Resumen

VERITAS model mirror es un repositorio de Hugging Face que aloja exportaciones ONNX de dos detectores de deepfake por intercambio de caras ya publicados y con licencia MIT: GenD (CLIP ViT-L/14 con cabeza de clasificación, Yermakov et al., WACV 2026) y el EfficientNet-B7 de Selim Seferbekov, primer clasificado del Deepfake Detection Challenge de 2020. El repositorio no entrena ningún modelo: su función es servir como espejo verificado de los pesos originales en formato ONNX, con hashes SHA-256 publicados, para que el proyecto VERITAS (un laboratorio de forense de deepfakes para la feria científica INFINIA 2026) pueda descargar los ficheros sin reconstruirlos desde los checkpoints de PyTorch en cada equipo.

El interés técnico está en la cadena de exportación y verificación: los pesos se reconstruyeron desde los checkpoints originales con torch 2.15.0, onnx 1.23.2 y timm 1.0.31, y se validaron numéricamente contra los logits de referencia de PyTorch con una tolerancia de 2e-3, obteniendo desviaciones de 2,4e-6 (GenD) y 5e-7 (DFDC-B7). Se incluye además una variante int8 dinámica de GenD para entornos con poca RAM.

No es un modelo generativo ni un modelo de lenguaje: son dos clasificadores de imagen que reciben una cara alineada y devuelven una probabilidad de que sea falsa. La ficha se centra, por tanto, en su uso como componente de un pipeline de detección de face-swap en vídeo, con las advertencias de calibración que el propio autor documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GenD: CLIP ViT-L/14 (vision tower) + cabeza de clasificación GenD. DFDC-B7: tf_efficientnet_b7_ns (timm) |
| Parametros totales | no disponible (no se publica el recuento; el tamaño de los ficheros ONNX fp32 es de 1,21 GB para GenD y 254,8 MB para DFDC-B7) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija) |
| Tipos de cuantizacion | fp32 (por defecto) e int8 dinámica por canal solo en capas MatMul para GenD (`gend_clip_int8.onnx`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (pesos originales y exportaciones ONNX) |
| Formato de pesos | ONNX (`.onnx`); los originales en PyTorch son safetensors para GenD y checkpoint de TF/timm para DFDC-B7 |

## Arquitectura y entrenamiento

GenD emplea la torre de visión de CLIP ViT-L/14 (configuración de `openai/clip-vit-large-patch14`, licencia MIT) como extractor de características, con todos los pesos provenientes del checkpoint de GenD, y una cabeza de clasificación entrenada por sus autores. La entrada es un tensor float32 de forma `[1, 3, 224, 224]` con una cara alineada mediante 5 landmarks de SCRFD (escala 1,3), preprocesado CLIP (redimensionado bicúbico a 224, recorte central, media `[0.48145466, 0.4578275, 0.40821073]` y desviación `[0.26862954, 0.26130258, 0.27577711]`). La salida es `[1, 2]` logits, donde el índice 1 del softmax es P(falsa). GenD se entrenó sobre el split de entrenamiento de FaceForensics++ según la model card original.

DFDC-B7 es el EfficientNet-B7 con normalización de estilo (`tf_efficientnet_b7_ns`) del primer clasificado del DFDC 2020, Selim Seferbekov, entrenado sobre el conjunto de entrenamiento del DFDC. La entrada es `[1, 3, 380, 380]`: caja facial de MTCNN con margen de 1/3, lado mayor redimensionado a 380 y centrado sobre fondo negro, RGB/255 con media ImageNet `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`. La salida es `[1, 1]` logit; la sigmoide da P(falsa). No se documentan en la información disponible detalles sobre composición exacta del dataset, número de tokens (no aplica) ni uso de RLHF/DPO.

La innovación destacable de este repositorio no es arquitectónica sino de reproducibilidad: exportación determinista byte a byte con versiones fijadas de las herramientas y verificación numérica contra los originales, además de una fusión de puntuaciones entre ambos detectores en el motor VERITAS (cada red puntúa 8 fotogramas equiespaciados del vídeo).

## Capacidades

- Clasificación binaria de caras en vídeo como reales o manipuladas por intercambio de caras (face-swap).
- Detección de deepfakes en fotogramas individuales extraídos de vídeo, con preprocesado específico por modelo.
- Fusión de dos detectores independientes (GenD y DFDC-B7) para reducir falsos negativos en el pipeline VERITAS.
- Inferencia en CPU o GPU mediante ONNX Runtime, sin dependencia de PyTorch en producción.
- Variante int8 de GenD para entornos con memoria limitada (308 MB frente a 1,21 GB en fp32).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni visión general: es exclusivamente un clasificador de imagen facial.
- No tiene capacidades multilingües (no procesa lenguaje).

## Casos de uso

- Moderación de contenido en plataformas de vídeo: integrado como etapa de verificación sobre fotogramas muestreados, el par de detectores puede marcar clips sospechosos de face-swap para revisión humana, usando los umbrales calibrados en FaceForensics++.
- Verificación periodística de material audiovisual: un redactor puede pasar un vídeo por el pipeline y obtener una señal de alarma (nunca una certificación de autenticidad, según el diseño one-sided de VERITAS) antes de publicar.
- Investigación académica en forense digital: sirve como línea base reproducible en ONNX para comparar detectores de face-swap sin reentrenar, con hashes verificables.
- Docencia y ferias científicas: el proyecto VERITAS lo usa como laboratorio educativo; el espejo ONNX simplifica el despliegue en portátiles de estudiantes.
- Despliegue en entornos sin PyTorch: al ser ONNX puro, se puede ejecutar con ONNX Runtime en servidores ligeros o en el navegador (con las limitaciones de memoria de la variante int8).
- Prototipado de sistemas de autenticación de identidad con verificación facial: como capa adicional de detección de ataques de presentación basados en face-swap, siempre con revisión humana y sin uso como única barrera.
- Análisis forense de archivos históricos: procesado por lotes de vídeos con degradación conocida, teniendo en cuenta la tasa de falsos positivos documentada en material comprimido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a un clasificador de imagen. La model card sí reporta métricas del pipeline VERITAS y verificaciones de exportación:

| Metrica | Valor | Contexto |
|---|---|---|
| AUC del motor completo (GenD + DFDC-B7) | 0,998 | 30 clips (15 reales, 15 falsos) de Celeb-DF v2 + Google DFD; resultado optimista porque la selección se hizo tras ver estos datos |
| Desviación ONNX vs PyTorch (GenD) | 2,4e-6 unidades de logit | Verificación numérica de la exportación |
| Desviación ONNX vs PyTorch (DFDC-B7) | 5,7e-7 unidades de logit | Verificación numérica de la exportación |
| Falsos positivos en vídeo real degradado | 21 de 39 clips | Material real con compresión tipo webcam barata |
| Conjunto de calibración de umbrales | 45 clips de test de FaceForensics++ | Solo se usaron estos para fijar umbrales |

## Requisitos de hardware

- VRAM estimada: GenD fp32 requiere aproximadamente 1,3-1,5 GB de VRAM para el modelo y activaciones en una sola imagen de 224×224; la variante int8 baja a unos 350-450 MB. DFDC-B7 fp32 necesita aproximadamente 300-400 MB; no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para GenD fp32 (GTX 1650, RTX 3050 en adelante); para despliegues de alto throughput, A100, H100 o RTX 4090 permiten procesar muchos fotogramas en paralelo. DFDC-B7 cabe en GPUs integradas modestas.
- Cabe en GPU de consumo: sí, ambas redes caben en GPUs de consumo actuales; GenD int8 está pensado explícitamente como alternativa de baja RAM.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), con soporte de cuantización dinámica; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del número de fotogramas muestreados (el pipeline VERITAS usa 8 por vídeo).

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GenD (este repo) | CLIP ViT-L/14 + cabeza | 224×224, alineación SCRFD | MIT | ONNX en este repo; safetensors en `yermandy/GenD_CLIP_L_14` | Generaliza entre benchmarks según sus autores |
| DFDC-B7 (este repo) | EfficientNet-B7 NS | 380×380, caja MTCNN | MIT | ONNX en este repo; checkpoint en GitHub de Seferbekov | Ganador del DFDC 2020 |
| InsightFace SCRFD `det_10g.onnx` | Detector facial SCRFD | Imagen completa | No comercial, solo investigación | Release oficial de InsightFace | No es detector de deepfake; VERITAS lo descarga aparte para alinear caras |

No se dispone de datos comparativos de rendimiento entre estos modelos y alternativas como Face X-ray, SBI o RECCE en la información proporcionada; por tanto, la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos y falsos positivos: el par dispara falsas alarmas en vídeo real con grano y compresión fuerte (21 de 39 clips reales degradados como webcam barata).
- El AUC de 0,998 es optimista: la selección del par se hizo después de observar resultados en Celeb-DF y DFD, y GenD usó vídeos de validación de Celeb-DF++ para elegir checkpoint; solo Google DFD es totalmente no visto.
- Diseño one-sided: el sistema puede alertar pero nunca certifica que una cara sea real, porque ambas redes clasifican caras totalmente generadas por GAN como reales.
- Está pensado para vídeo, no para fotografías sueltas.
- Los umbrales se calibraron únicamente sobre 45 clips de test de FaceForensics++.
- La variante int8 no es numéricamente idéntica a fp32 y sus decisiones oscilaron en clips límite; VERITAS usa fp32 por defecto.
- Restricciones de licencia: los pesos y exportaciones son MIT, pero los datos de entrenamiento (FaceForensics++ y DFDC) tienen sus propios términos de uso que pueden afectar a usos comerciales derivados.
- El detector facial necesario (SCRFD de InsightFace) tiene licencia solo para investigación no comercial, lo que limita el despliegue comercial completo del pipeline.
- No se publican métricas de sesgo por género, etnia o edad; riesgo de rendimiento desigual entre demografías no cuantificado.
- Riesgo de alucinación no aplica (no es generativo), pero sí de clasificación errónea en dominios alejados del entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ahamedinmotion42/veritas-models
- Repositorio del proyecto VERITAS: https://github.com/Ahamedinmotion/veritas
- GenD, código: https://github.com/yermandy/GenD
- GenD, pesos originales: https://huggingface.co/yermandy/GenD_CLIP_L_14
- DFDC Deepfake Challenge, solución de Selim Seferbekov: https://github.com/selimsef/dfdc_deepfake_challenge
- CLIP ViT-L/14 (OpenAI): https://huggingface.co/openai/clip-vit-large-patch14
- InsightFace (detector SCRFD): https://github.com/deepinsight/insightface
