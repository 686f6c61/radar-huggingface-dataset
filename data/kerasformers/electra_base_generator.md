# kerasformers/electra_base_generator

## Resumen

kerasformers/electra_base_generator es una conversión a Keras 3 del modelo ELECTRA base generator de Google, publicado originalmente en el artículo "ELECTRA: Pre-training Text Encoders as Discriminators Rather Than Generators" (arXiv:2003.10555). Este checkpoint corresponde al generador del enfoque ELECTRA, un modelo de lenguaje enmascarado (masked LM) que se entrena para predecir tokens corruptos, mientras que el discriminador aprende a detectar dichas sustituciones. La conversión, desarrollada por el proyecto KerasFormers, permite ejecutar el modelo de forma idéntica en los backends TensorFlow, PyTorch y JAX mediante la API de Keras 3.

El modelo tiene una arquitectura transformer bidireccional estilo BERT, con configuración base (12 capas, 768 unidades ocultas) y una longitud de contexto de 512 tokens. Su relevancia radica en ofrecer una implementación ligera y portable de ELECTRA para tareas de fill-mask y como base para fine-tuning en tareas de comprensión del lenguaje, manteniendo los pesos originales de Google bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (ELECTRA generator) |
| Parametros totales | no disponible (el generador base de ELECTRA tiene aproximadamente 33 millones segun el paper, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (se puede usar en FP32/FP16, pero no se especifican cuantizaciones oficiales) |
| Idiomas soportados | ingles (uncased) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos Keras 3 (H5) y safetensors (upstream) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ELECTRA, que entrena dos transformers: un generador y un discriminador. Este checkpoint es el generador, entrenado como modelo de lenguaje enmascarado (masked LM) con la tecnica de replaced token detection. Durante el preentrenamiento, el generador produce tokens corruptos que sustituyen a los originales, y el discriminador debe identificar cuales han sido reemplazados. El generador es mas pequeno que el discriminador (en la configuracion base, el generador tiene aproximadamente un tercio de los parametros del discriminador).

El modelo original fue preentrenado por Google sobre textos en ingles, utilizando un tokenizador WordPiece. La conversion de KerasFormers mantiene los pesos originales y los expone mediante la API de Keras 3, permitiendo cargarlos con `from_weights`. No se ha aplicado ningun ajuste adicional (RLHF, DPO, etc.) sobre el checkpoint original.

## Capacidades

- Fill-mask: predice tokens enmascarados en una secuencia de texto.
- Representaciones contextuales: genera embeddings de tokens y de secuencia que pueden usarse para fine-tuning en tareas downstream.
- Compatibilidad multi-backend: funciona con TensorFlow, PyTorch y JAX mediante Keras 3.
- No soporta generacion de texto libre, tool calling, agentes ni razonamiento multi-paso.
- No es multilingue; esta entrenado unicamente en ingles.

## Casos de uso

- Preentrenamiento de modelos ELECTRA: el generador se usa junto con el discriminador para entrenar representaciones de lenguaje eficientes.
- Fine-tuning para clasificacion de texto: aunque se recomienda usar el discriminador, el generador puede adaptarse a tareas de clasificacion con una cabeza adicional.
- Analisis de sentimiento en ingles: se puede fine-tunear con datasets como IMDb o SST-2.
- Respuesta a preguntas extractiva: con fine-tuning en SQuAD, aunque el discriminador es mas adecuado.
- Etiquetado de entidades (NER): fine-tuning en CoNLL-2003.
- Tareas de fill-mask en pipelines de NLP: completar palabras enmascaradas en textos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo pequeno (menos de 200 MB), cabe en cualquier GPU consumer (RTX 2060, GTX 1080, etc.) e incluso en CPU.
- VRAM estimada: menos de 1 GB para inferencia en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: al ser un modelo de Keras, puede ejecutarse con TensorFlow Serving, o exportarse a ONNX para usar con otros runtime. Tambien puede usarse en notebooks o scripts de Python.
- Latencia: muy baja, del orden de milisegundos por secuencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| kerasformers/electra_base_generator | no disponible (aprox. 33M segun paper) | 512 | Apache 2.0 | Keras 3 / safetensors |
| google/electra-base-generator | no disponible (aprox. 33M segun paper) | 512 | Apache 2.0 | safetensors |
| bert-base-uncased | 110M | 512 | Apache 2.0 | safetensors |
| roberta-base | 125M | 512 | MIT | safetensors |

Nota: los datos de parametros para ELECTRA generator se basan en el paper original, no en la informacion del repositorio.

## Limitaciones y advertencias

- Solo ingles, no multilingue.
- Contexto limitado a 512 tokens.
- Al ser el generador, no esta optimizado para tareas downstream; se recomienda usar el discriminador.
- Posibles sesgos en los datos de preentrenamiento (textos de Wikipedia y libros).
- No genera texto libre; solo predice tokens enmascarados.
- Licencia Apache 2.0 permite uso comercial, pero hay que atribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kerasformers/electra_base_generator
- Repositorio KerasFormers: https://github.com/IMvision12/KerasFormers
- Paper original: https://arxiv.org/abs/2003.10555
- Documentacion de ELECTRA en KerasFormers: https://imvision12.github.io/KerasFormers/electra/
- Coleccion de modelos ELECTRA: https://huggingface.co/collections/kerasformers/electra-6a8540d1f5831e07dc89d8d1
- Modelo original de Google: https://huggingface.co/google/electra-base-generator
