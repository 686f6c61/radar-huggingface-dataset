# Islamamro/clickbait-aurora-islamamro

## Resumen

El modelo `Islamamro/clickbait-aurora-islamamro` es un clasificador binario de titulares que distingue entre titulares *clickbait* y titulares genuinos. Está desarrollado por el usuario Islamamro como una demostración del flujo completo de construcción, entrenamiento y publicación dentro del Aurora Research Portal, utilizando una NVIDIA GeForce RTX 3090. Se basa en el modelo `distilbert-base-uncased` fine-tuneado, con 66,9 millones de parámetros y un peso total de 0,3 GB en formato safetensors.

El modelo se presenta como una prueba de concepto del pipeline Aurora, no como un modelo listo para producción. Según la model card, alcanza una accuracy y un F1 de 1.00 sobre un conjunto de datos pequeño y curado, lo que sugiere un posible sobreajuste y limita su utilidad práctica fuera del contexto de demostración. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

Su relevancia radica en ejemplificar cómo se puede crear y publicar un modelo de clasificación de texto de forma rápida y reproducible, aunque no aporta innovación técnica sustancial ni representa un avance en el estado del arte de la detección de clickbait.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer, fine-tune de `distilbert-base-uncased`) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (máximo de DistilBERT base) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | ingles (por el tokenizer uncased de DistilBERT) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `distilbert-base-uncased`, un transformer encoder destilado de BERT con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, que conserva el 97 % del rendimiento de BERT con un 40 % menos de parámetros. La capa de clasificación es una cabeza lineal binaria añadida sobre el token `[CLS]`.

El entrenamiento se realizó sobre un conjunto de datos pequeño y curado de titulares etiquetados como *clickbait* o *genuino*, sin que se especifique el número de ejemplos ni la composición exacta. La model card indica que se entrenó en el Aurora Research Portal con una GPU NVIDIA GeForce RTX 3090. No se menciona el uso de técnicas de alineación como RLHF o DPO, ni se detallan hiperparámetros, número de épocas o estrategia de validación. Los resultados reportados (accuracy 1.00, F1 1.00) sugieren un sobreajuste severo al conjunto de demostración, por lo que no se puede asumir generalización a datos reales.

## Capacidades

- Clasificacion binaria de titulares: devuelve una probabilidad de que un titular sea *clickbait* frente a genuino.
- Procesamiento de texto en ingles con tokenizacion uncased (minusculas).
- Salida de clasificacion de texto estandar mediante el pipeline de HuggingFace `text-classification`.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multilingues.
- No se ha documentado ningun modo de razonamiento especial ni funcionalidad avanzada.

## Casos de uso

- Demostracion del pipeline Aurora: sirve como ejemplo de referencia para desarrolladores que quieran replicar el flujo de construccion, entrenamiento y publicacion de modelos en esa plataforma.
- Prueba de concepto en entornos academicos: puede usarse para ilustrar el proceso de fine-tuning de un transformer pequeno para una tarea de clasificacion, aunque con datos limitados.
- Prototipo rapido de deteccion de clickbait: para validar la viabilidad de un sistema de alerta en un entorno controlado y con datos sinteticos o muy acotados.
- Educacion y formacion: como material didactico para ensenar a estudiantes a crear, evaluar y publicar modelos de clasificacion de texto.
- Evaluacion comparativa de frameworks: para medir el rendimiento de inferencia en diferentes backends (transformers, ONNX, etc.) en tareas de clasificacion sencillas.
- Integracion en demos interactivas: en aplicaciones de demostracion que muestren la diferencia entre titulares engañosos y honestos, siempre que se advierta de su naturaleza no productiva.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre el conjunto de validacion propio del autor:

| Metrica | Valor |
|---|---|
| Accuracy | 1.00 |
| F1 | 1.00 |

Estos valores se obtuvieron sobre un conjunto de datos pequeno y curado, por lo que no son representativos del rendimiento en datos reales. No se han publicado resultados en benchmarks estandar como MMLU, GLUE o SuperGLUE. No se dispone de comparaciones con otros modelos de deteccion de clickbait.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (66,9 M de parametros, 4 bytes por parametro). Con cuantizacion a int8 o fp16, la VRAM se reduce a unos 0,15 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, etc. Tambien se puede ejecutar en CPU sin problemas.
- Cabe en cualquier GPU consumer actual, e incluso en dispositivos edge con suficiente memoria.
- Opciones de despliegue: compatible con HuggingFace Transformers, ONNX Runtime, TorchScript, y puede exportarse a formato GGUF para llama.cpp, aunque no se proporcionan pesos cuantizados.
- Latencia estimada: en una GPU moderna (RTX 3090) la inferencia de una secuencia corta (< 128 tokens) tarda menos de 10 ms; en CPU, entre 50 y 200 ms segun el hardware.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos de deteccion de clickbait con los que contrastar este modelo. Como referencia general, los clasificadores de clickbait suelen basarse en BERT o DistilBERT fine-tuneados, pero no hay datos publicos de este modelo frente a ellos. Se puede indicar que la arquitectura base es identica a otros fine-tunes de DistilBERT, pero el rendimiento reportado no es verificable.

## Limitaciones y advertencias

- Entrenado sobre un conjunto de datos diminuto y curado, lo que provoca un sobreajuste extremo (accuracy 1.00) y una generalizacion nula a datos reales.
- No es un modelo apto para produccion: su uso en aplicaciones reales de deteccion de clickbait produciria una alta tasa de falsos positivos o negativos.
- Solo soporta ingles y texto en minusculas (tokenizer uncased), por lo que no maneja mayusculas, otros idiomas ni jergas regionales.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado con datos limitados, puede reflejar sesgos del conjunto de entrenamiento no descrito.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion al autor original.
- No se proporcionan pesos cuantizados ni versiones optimizadas para despliegue ligero.
- La fecha de creacion (2026-08-28) es posterior al conocimiento de corte, por lo que no se ha podido verificar la existencia o vigencia del modelo en el ecosistema actual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Islamamro/clickbait-aurora-islamamro
- Perfil de GitHub del autor: https://github.com/islamamro
