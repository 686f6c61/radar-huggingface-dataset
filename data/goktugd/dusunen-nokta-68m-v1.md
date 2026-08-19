# GoktugD/DUSUNEN-Nokta-68M-v1

## Resumen

DUSUNEN Nokta 68M v1 es un modelo compacto de clasificación de tokens desarrollado por Göktuğ Düşünen para restaurar puntuación y mayúsculas (true-casing) en texto turco. Resuelve el problema de reconstruir texto sin puntuación ni capitalización, típico de salidas de reconocimiento de voz (ASR), subtítulos o transcripciones. Su principal innovación es predecir ambas tareas en una sola pasada mediante 28 etiquetas conjuntas, evitando la necesidad de encadenar dos modelos separados.

El modelo se basa en `dbmdz/distilbert-base-turkish-cased`, una versión destilada de BERT con 68,1 millones de parámetros (67.519.516 según los pesos safetensors). Fue entrenado sobre el corpus Cosmos Turkish Corpus v1.0, con una longitud máxima de entrada de 128 subword tokens. Se distribuye bajo licencia MIT e incluye una exportación ONNX validada para inferencia en CPU.

Su relevancia radica en ofrecer una solución ligera y de código abierto para preprocesamiento de texto turco, con resultados publicados en un split de evaluación resistente a fugas de datos. Es adecuado para integrarse en pipelines de limpieza de texto, aunque presenta limitaciones en dominios específicos como nombres propios o pasajes multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 67.519.516 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 subword tokens |
| Tipos de cuantizacion | no disponible (se ofrece FP32 en ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (FP32, 270,8 MB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DistilBERT, un transformer encoder destilado de BERT con 6 capas y 768 dimensiones ocultas, preentrenado en turco. Sobre esta base se añade una cabeza de clasificación de tokens con 28 etiquetas conjuntas que combinan puntuación (coma, punto, interrogación, etc.) y mayúsculas (LOWER, UPPER, MIXED, etc.). Esto permite predecir ambas decisiones simultáneamente, simplificando el despliegue.

El entrenamiento se realizó sobre el corpus Cosmos Turkish Corpus v1.0, con 146.936 ejemplos de entrenamiento, 1.519 de validación y 1.545 de prueba. Se usó AdamW con programación lineal de tasa de aprendizaje, precisión BF16 y semilla 42. El hardware fue una NVIDIA GeForce RTX 3090 de 24 GB, con un tiempo total de entrenamiento de 725,7 segundos. El split de evaluación es determinista y resistente a fugas: todas las filas que comparten una URL fuente permanecen en el mismo bucket (98/1/1), y el bucket de prueba no se usó para actualizaciones de gradiente ni selección de checkpoint.

## Capacidades

- Restauración de puntuación en texto turco: añade comas, puntos, signos de interrogación y otros signos a texto sin puntuar.
- True-casing: restaura mayúsculas iniciales, nombres propios y acrónimos, manejando la distinción turca entre I con punto y sin punto.
- Clasificación conjunta: predice puntuación y mayúsculas en una sola pasada mediante 28 etiquetas combinadas.
- Procesamiento de texto largo: el script `inference.py` incluye fragmentación de texto largo para superar el límite de 128 tokens.
- Alineación subword-palabra: reconstruye las predicciones a nivel de palabra completa.
- Exportación ONNX validada: el modelo ONNX FP32 muestra un 100% de concordancia con PyTorch en 64 ejemplos de validación.
- Integración con Transformers: carga directa mediante `AutoModelForTokenClassification` y `AutoTokenizer`.

## Casos de uso

- Limpieza de salidas ASR en turco: los sistemas de reconocimiento de voz suelen producir texto sin puntuación ni mayúsculas. Nokta puede insertar signos de puntuación y normalizar capitalización antes de pasar el texto a un sistema de análisis posterior.
- Preprocesamiento de subtítulos: los borradores de subtítulos generados automáticamente pueden carecer de puntuación. El modelo restaura comas y puntos para mejorar la legibilidad y la sincronización con el audio.
- Normalización de transcripciones de búsqueda: transcripciones de consultas de voz o búsquedas por voz pueden limpiarse para indexación en motores de búsqueda, mejorando la precisión de la recuperación.
- Preprocesamiento de texto para análisis de sentimiento: antes de aplicar modelos de clasificación de sentimiento, el texto sin puntuación puede degradar el rendimiento. Nokta restaura la estructura oracional, lo que beneficia a modelos posteriores.
- Restauración de texto en chats y mensajes informales: mensajes de texto o chats sin puntuación pueden normalizarse para su archivado o análisis.
- Preparación de corpus para entrenamiento de modelos de lenguaje: el modelo puede usarse para limpiar grandes volúmenes de texto turco sin puntuar, generando datos de entrenamiento más coherentes.

## Benchmarks y rendimiento

Los resultados publicados por el autor se obtuvieron sobre el split de prueba del corpus Cosmos Turkish (held-out URL split). Se comparan con un baseline mayoritario que asigna la etiqueta más frecuente.

| Metrica | Baseline mayoritario | DUSUNEN Nokta 68M v1 |
|---|---|---|
| Puntuacion macro F1 (excluyendo NONE) | 0,00% | 70,43% |
| Mayusculas macro F1 (excluyendo LOWER) | 0,00% | 86,98% |
| Etiqueta conjunta macro F1 | 3,07% | 65,23% |
| Precision de token conjunta | 62,35% | 94,04% |
| Precision exacta de secuencia completa | 0,00% | 47,51% |

Adicionalmente, la precision de token para puntuacion es del 96,57% y para mayusculas del 97,00%. No se han publicado comparaciones con otros modelos de restauracion de puntuacion en turco.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, dado el tamano de 67,5 millones de parametros. El modelo puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Se entrenó en una RTX 3090, pero para inferencia basta con GPUs de gama baja o incluso CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna (GTX 1060, RTX 2060, etc.) y en hardware integrado.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime (para CPU), y cualquier framework que soporte token classification. No es un modelo generativo, por lo que vLLM u Ollama no son aplicables directamente.
- Latencia y rendimiento: no se proporcionan cifras de latencia en la documentacion. El ONNX FP32 muestra una relacion de latencia mediana PyTorch/ONNX de 0,65x en un solo item, pero el autor no hace afirmaciones de aceleracion.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos especificos de restauracion de puntuacion y true-casing en turco con los que comparar directamente. El unico punto de referencia publicado es el baseline mayoritario incluido en la tabla de benchmarks. Se puede considerar que el modelo compite con soluciones que encadenan dos modelos separados (uno de puntuacion y otro de mayusculas), pero no hay datos cuantitativos de tales alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado en texto web, no en transcripciones de habla espontanea; la puntuacion en dominios conversacionales puede diferir.
- Dificultades con nombres propios, marcas estilizadas, pasajes multilingues, URLs y patrones de mayusculas deliberadamente inusuales.
- La etiqueta `MIXED` restaura raices de acronimos antes de un apostrofo, pero no puede reconstruir todos los patrones de mayusculas a nivel de caracter.
- Longitud de contexto limitada a 128 subword tokens; para textos largos se requiere fragmentacion, lo que puede afectar a la coherencia entre fragmentos.
- Requiere revision humana para documentos legales, medicos u otros de alto riesgo.
- No se documentan cuantizaciones ni versiones optimizadas para movil o edge.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GoktugD/DUSUNEN-Nokta-68M-v1
- Dataset Cosmos Turkish Corpus v1.0: https://huggingface.co/datasets/ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0
- Modelo base: https://huggingface.co/dbmdz/distilbert-base-turkish-cased
- Perfil del autor: https://huggingface.co/GoktugD
