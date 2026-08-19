# onnx-community/Supra2-Nano-ONNX

## Resumen

Supra2-Nano es un modelo de lenguaje de 800.000 parámetros desarrollado por el laboratorio SupraLabs, entrenado desde cero sobre 1.000 millones de tokens utilizando la arquitectura Qwen3. Forma parte de la familia Supra2, un conjunto de modelos de tamaño extremadamente reducido diseñados para estudiar el comportamiento de escalado en rangos de parámetros muy bajos, así como para validar pipelines de entrenamiento en hardware de consumo.

La versión ONNX, publicada por la comunidad onnx-community, es una conversión automática del modelo original a formato ONNX, lo que permite su ejecución con Transformers.js directamente en el navegador o en entornos JavaScript. El modelo está pensado exclusivamente para investigación: a esta escala de parámetros no produce texto fluido ni coherente, y su propósito principal es servir de referencia para ablaciones de arquitectura y estudios de scaling laws.

La relevancia actual de este modelo radica en su carácter de experimento abierto y reproducible: con solo 800K parámetros y entrenado en dos GPUs T4 de Kaggle, demuestra que es posible entrenar modelos de lenguaje desde cero con recursos muy limitados, y proporciona una base para comparar arquitecturas y estrategias de tokenización en el régimen de sub-millón de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (downscaled) |
| Parametros totales | ~800.000 (0,8M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (version convertida); safetensors en el modelo original |

## Arquitectura y entrenamiento

Supra2-Nano utiliza la arquitectura Qwen3 a una escala muy reducida: dimension oculta pequena, pocas cabezas de atencion y un numero limitado de capas transformer, todo ajustado a un presupuesto de 800K parametros. Emplea atencion por grupos (grouped-query attention) y RMSNorm, siguiendo el diseno original de Qwen3. Una decision clave es el uso de un vocabulario de solo 4.096 tokens, para evitar que las capas de embedding y proyeccion de salida dominen el recuento de parametros, un problema comun cuando se aplican tokenizadores de tamano completo a modelos diminutos.

El entrenamiento se realizo sobre un conjunto de datos compuesto por un 99% de FineWeb-Edu y un 1% de Cosmopedia-v2, con un total de 1.000 millones de tokens vistos en una sola epoca (sin repeticion). Se ejecutaron 7.000 pasos de entrenamiento en dos GPUs NVIDIA T4 (Kaggle), con precision bfloat16 y el objetivo estandar de prediccion del siguiente token (modelo causal). No se aplico ajuste por instrucciones ni alineacion; es un modelo base preentrenado.

## Capacidades

- Generacion de texto a nivel basico: puede completar secuencias cortas, pero la coherencia se degrada rapidamente en generaciones largas.
- Razonamiento limitado: en benchmarks de sentido comun (PIQA, HellaSwag, ARC) obtiene puntuaciones cercanas al azar, como es esperable a esta escala.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue practicamente nula: el vocabulario reducido de 4.096 tokens fragmenta palabras en otros idiomas y produce muchos tokens fuera de vocabulario.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion academica sobre scaling laws: permite estudiar como se comportan diferentes arquitecturas y configuraciones de tokenizacion en el regimen de sub-millon de parametros, comparando metricas como perplejidad o accuracy en tareas sencillas.
- Validacion de pipelines de entrenamiento: sirve como prueba de humo para verificar que un pipeline de entrenamiento (tokenizador, arquitectura, mezcla de datos, hardware) funciona correctamente antes de escalar a modelos mayores.
- Ablaciones de arquitectura: al ser un modelo abierto y reproducible, se puede modificar la configuracion (numero de capas, cabezas, dimension) y comparar resultados con la version publicada.
- Ensenanza de transformers: por su tamano minimo, es util en cursos o tutoriales para ilustrar el proceso completo de entrenamiento de un LM causal, desde la tokenizacion hasta la generacion.
- Pruebas de inferencia en entornos con recursos extremadamente limitados: al ocupar menos de 2 MB en bfloat16, puede ejecutarse en microcontroladores o navegadores web mediante Transformers.js, aunque la calidad de salida sea muy baja.
- Benchmark de referencia para modelos de tamano similar: permite comparar el rendimiento de otros modelos sub-millon de parametros en tareas como PIQA o ARC-Easy, como ya hacen los autores con Supra-Mini-v3 y Supra-Mini-v6.

## Benchmarks y rendimiento

Los autores publicaron una evaluacion zero-shot en cuatro benchmarks estandar para modelos pequenos, comparando con otros dos modelos del mismo laboratorio:

| Benchmark | Supra2-Nano (0,8M) | Supra-Mini-v6 (1M) | Supra-Mini-v3 (0,5M) |
|---|---|---|---|
| PIQA (acc_norm) | 0,53 | 0,54 | 0,50 |
| HellaSwag (acc_norm) | 0,27 | 0,27 | 0,25 |
| ARC-Easy (acc_norm) | 0,31 | 0,30 | 0,28 |
| ARC-Challenge (acc_norm) | 0,21 | 0,20 | 0,23 |

Las puntuaciones de los tres modelos se situan cerca de las lineas base aleatorias o de la clase mayoritaria, lo cual es esperable a esta escala. PIQA es la tarea con mejor senal, consistente con lo observado en otros modelos sub-millon de parametros. Supra2-Nano rinde de forma comparable a Supra-Mini-v6 a pesar de tener un 20% menos de parametros, y supera a Supra-Mini-v3 en tres de las cuatro tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en bfloat16 (el peso del modelo ocupa aproximadamente 1,6 MB). Cabe en cualquier GPU, incluso integradas, y en CPU.
- GPU recomendadas: no se requiere ninguna GPU especifica; cualquier GPU con al menos 1 GB de VRAM es mas que suficiente. El entrenamiento se realizo en 2x NVIDIA T4, pero la inferencia es trivial.
- Compatibilidad con GPU de consumo: si, absolutamente. Funciona en RTX 3060, RTX 4090, GTX 1650, etc., e incluso en CPU sin GPU.
- Opciones de despliegue: la version ONNX esta pensada para Transformers.js (navegador o Node.js). El modelo original puede usarse con Hugging Face Transformers en Python. Tambien es compatible con ONNX Runtime.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamano del modelo, la generacion es practicamente instantanea en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (PIQA) | Disponibilidad |
|---|---|---|---|---|---|
| Supra2-Nano | 0,8M | no disponible | Apache 2.0 | 0,53 | Hugging Face |
| Supra-Mini-v6 | 1M | no disponible | Apache 2.0 | 0,54 | Hugging Face |
| Supra-Mini-v3 | 0,5M | no disponible | Apache 2.0 | 0,50 | Hugging Face |

No se dispone de informacion sobre otros modelos comparables fuera del laboratorio SupraLabs en el rango de 0,5-1M de parametros con arquitectura Qwen3. Modelos como SmolLM (135M) o TinyStories (33M) son significativamente mayores y no son comparables directamente.

## Limitaciones y advertencias

- El modelo no produce texto fluido ni coherente en generaciones largas; es frecuente la repeticion, la falta de gramatica y la incoherencia.
- El vocabulario de 4.096 tokens provoca una alta fragmentacion de palabras poco comunes y de texto no ingles, limitando su utilidad a dominios muy restringidos.
- Entrenamiento de una sola epoca sobre 1B tokens, sin conjunto de validacion retenido mas alla de los benchmarks publicados.
- No tiene ajuste por instrucciones ni alineacion; es un modelo base preentrenado.
- No es apto para uso en produccion ni para aplicaciones que requieran generacion fiable de texto.
- La version ONNX es una conversion automatica; no se han verificado diferencias de comportamiento respecto al original, aunque se espera que sean minimas.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/onnx-community/Supra2-Nano-ONNX
- Modelo original en Hugging Face: https://huggingface.co/Supralabs/Supra2-Nano
- Organizacion SupraLabs en Hugging Face: https://huggingface.co/SupraLabs
