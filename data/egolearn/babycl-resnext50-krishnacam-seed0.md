# egolearn/babycl-resnext50-krishnacam-seed0

## Resumen

BabyCL sobre KrishnaCam (seed 0) es un modelo de extracción de características visuales desarrollado por la organización EgoLearn. Se trata de una red convolucional ResNeXt-50 entrenada con los objetivos de aprendizaje autosupervisado del método BabyCL sobre el conjunto de datos KrishnaCam, un corpus de vídeo egocéntrico. El modelo no procesa texto: su única función es generar representaciones vectoriales de imágenes, por lo que debe entenderse como un backbone visual y no como un modelo generativo.

El interés del modelo reside en su enfoque de entrenamiento: aprendizaje autosupervisado sobre flujo continuo de vídeo (streaming) a resolución de 224 píxeles y frecuencia nativa de fotogramas, sin depender de anotaciones manuales. Esto lo sitúa en la línea de investigación sobre cómo se aprenden representaciones a partir de experiencia visual egocéntrica, un área relevante para robótica, visión en primera persona y modelos de mundo.

Con 35,8 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto y ligero. Sin embargo, su uso práctico está muy restringido: el código de carga pertenece a una librería privada (EgoLearn), la licencia no está declarada y la cabeza de clasificación temporal identifica segmentos de entrenamiento en lugar de clases semánticas de objetos. Es, por tanto, un artefacto de investigación más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 (CNN) con objetivos de aprendizaje autosupervisado BabyCL |
| Parametros totales | 35.801.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (sin codificador de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (más model.json y checksums.sha256) |

## Arquitectura y entrenamiento

La arquitectura es una ResNeXt-50, una red convolucional con bloques residuales de tipo aggregated transformation (grouped convolutions). Sobre este backbone se aplican los objetivos visuales del método BabyCL, un esquema de aprendizaje autosupervisado. El entrenamiento se realizó en modo streaming con semilla 0, utilizando una caché de vídeo BabyCL verificada y sin pérdida a 224 píxeles y a la frecuencia de fotogramas nativa. El checkpoint guardado corresponde al paso de optimizador 11904.

El repositorio incluye únicamente los tensores del modelo, la configuración de construcción (`model.json`) y los checksums SHA-256. No se distribuyen datos de entrenamiento, imágenes, captions, estado del optimizador ni buffers de replay. El SHA-256 del checkpoint de origen es `3531c106947f39b50c0ec5465a73579a41be053605b47955487a3c7342dc3812`; la procedencia histórica del entrenamiento que falta queda marcada como no disponible. La exportación se verificó con la revisión `7e9671a8820377e2860da8789df4be6ce63e939c` de EgoLearn.

## Capacidades

- Extracción de características visuales a partir de imágenes de entrada (pipeline `feature-extraction`).
- Aprendizaje de representaciones autosupervisado sobre vídeo egocéntrico en streaming.
- Cabeza de clasificación temporal que identifica segmentos de entrenamiento (no clases semánticas de objetos).
- Sin codificador de texto: no admite prompts, instrucciones ni generación de lenguaje.
- Sin soporte de tool calling, function calling ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa lenguaje).
- Sin modo de pensamiento, visión generativa, audio ni otras modalidades.

## Casos de uso

- Investigación en representaciones egocéntricas: servir como backbone congelado para extraer embeddings de fotogramas de vídeo en primera persona y analizar qué información captura el aprendizaje autosupervisado sobre KrishnaCam.
- Extracción de características para tareas downstream de visión: usar los embeddings como entrada a clasificadores lineales o cabezas ligeras en experimentos de transferencia, dado el bajo coste computacional de sus 35,8 M de parámetros.
- Reproducción de experimentos BabyCL: comparar checkpoints de distintas semillas (este es seed 0) para estudiar la varianza del entrenamiento autosupervisado en streaming.
- Análisis de similitud visual entre segmentos de vídeo: los embeddings permiten agrupar o recuperar fotogramas similares dentro de un corpus egocéntrico.
- Detección de deriva o cambio de escena en vídeo continuo: la cabeza temporal, aunque identifica segmentos de entrenamiento, puede emplearse en estudios sobre segmentación temporal de flujo de vídeo.
- Base para modelos de mundo en robótica: integrar el extractor como módulo de percepción en pipelines de investigación que necesiten representaciones compactas de escenas en primera persona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 35,8 M de parámetros en precisión completa (fp32) ocupa aproximadamente 143 MB, y en fp16 alrededor de 72 MB, sin contar activaciones.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama media como RTX 3060 cubren holgadamente la inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con al menos 1-2 GB de VRAM libre, e incluso podría ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: no disponible de forma estándar; la carga requiere una instalación autorizada de EgoLearn con el extra `train` (Python 3.12 o superior) y la función `egolearn.evaluation.load_model`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| BabyCL ResNeXt-50 KrishnaCam (seed 0) | 35,8 M | Visión, sin texto | no disponible | Pesos públicos; carga requiere EgoLearn privado |
| ResNet-50 (ImageNet, referencia) | ~25,6 M | Visión, sin texto | no disponible en esta ficha | Ampliamente disponible |
| Otros backbones autosupervisados (p. ej. SimCLR/MoCo sobre ResNet) | variable (~25-50 M) | Visión, sin texto | variable | Públicos en Hugging Face |

La comparación cuantitativa de rendimiento no está disponible porque el autor no publica resultados de evaluación. La diferencia clave frente a backbones estándar es el dominio de entrenamiento (vídeo egocéntrico KrishnaCam en streaming) y la dependencia de una librería privada para su carga.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifican condiciones de uso comercial; debe tratarse como no apto para producción hasta aclarar la licencia.
- Dependencia de código privado: la carga requiere una instalación autorizada de EgoLearn; el repositorio de código no es público.
- Sin codificador de texto: no puede usarse para tareas de lenguaje, instrucciones ni generación.
- La cabeza de clasificación temporal identifica segmentos de entrenamiento, no clases semánticas de objetos; sus salidas no deben interpretarse como categorías visuales.
- Riesgo de sesgo y de dominio limitado: entrenado exclusivamente sobre KrishnaCam, por lo que su generalización a otros dominios visuales no está caracterizada.
- No se publican métricas de evaluación ni benchmarks, lo que impide valorar su calidad frente a alternativas.
- Procedencia histórica del entrenamiento incompleta (marcada como no disponible por el autor).
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de representaciones poco fiables fuera del dominio de entrenamiento.
- No se distribuyen datos, captions ni estado del optimizador, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egolearn/babycl-resnext50-krishnacam-seed0
- Organización EgoLearn: https://huggingface.co/egolearn
