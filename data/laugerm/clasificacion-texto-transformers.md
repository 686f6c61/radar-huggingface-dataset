# LaugerM/clasificacion-texto-transformers

## Resumen

El modelo `LaugerM/clasificacion-texto-transformers` es un clasificador binario de texto en espanol publicado en Hugging Face por el usuario LaugerM. Se trata de un ejemplo pedagogico desarrollado en el marco del Seminario de Actualizacion del IFTS N.º 18, con la docencia de Cynthia M. Villagra. Su proposito es didactico: ilustrar todas las piezas que se publican al compartir un modelo de Transformers (arquitectura, pesos y tokenizer), no ofrecer un clasificador listo para produccion.

Tecnicamente es un BERT diminuto entrenado desde cero, con solo 2 capas, 2 cabezas de atencion, dimension oculta de 32 y aproximadamente 20.500 parametros. El tokenizer es de tipo `WordLevel` con un vocabulario de 37 tokens, normaliza a minusculas y elimina tildes. Clasifica comentarios cortos sobre departamentos en dos clases: `positivo` (1) y `negativo` (0).

Su relevancia es exclusivamente formativa: demuestra el flujo completo de entrenamiento, evaluacion y publicacion de un modelo con Transformers y PyTorch. No debe confundirse con un modelo preentrenado en espanol ni utilizarse como componente de un sistema real, ya que su vocabulario y su dataset sintetico limitan drasticamente su capacidad de generalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForSequenceClassification), 2 capas, 2 cabezas de atencion, dimension 32 |
| Parametros totales | ~20.500 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | espanol (es) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT reducido al minimo: 2 capas, 2 cabezas de atencion y dimension oculta de 32, con una cabeza de clasificacion de secuencia para dos etiquetas. El tokenizer es `WordLevel` con 37 tokens, pasa el texto a minusculas y elimina tildes; cualquier palabra fuera del vocabulario se mapea a `[UNK]`. El modelo y el tokenizer se publican juntos, ya que los indices de embedding solo tienen sentido con ese vocabulario concreto.

El entrenamiento es supervisado desde cero (sin preentrenamiento previo) sobre un dataset sintetico de 368 comentarios generados a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos); 294 registros para entrenamiento y 74 para evaluacion. Se uso entropia cruzada como funcion de perdida, optimizador AdamW con tasa de aprendizaje 0,001, 15 epocas y lotes de 16, sobre Hugging Face Transformers con PyTorch. No se emplearon tecnicas de RLHF, DPO ni preentrenamiento en corpus real.

## Capacidades

- Clasificacion binaria de texto corto en espanol (`positivo` / `negativo`) sobre comentarios de departamentos.
- Inferencia mediante `pipeline("text-classification")` de Transformers, compatible con Transformers 4 y 5.
- Tokenizacion a nivel palabra con normalizacion (minusculas y eliminacion de tildes).
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de razonamiento multi-paso, modo thinking, vision ni audio.
- Capacidad multilingue: no disponible; solo espanol y con vocabulario restringido.
- Capacidad de generacion de texto: no disponible (es un modelo de clasificacion).

## Casos de uso

- Docencia y formacion en NLP: sirve como ejemplo completo de publicacion de un modelo en Hugging Face, mostrando la relacion entre `config.json`, `model.safetensors` y los archivos del tokenizer. Es adecuado porque el propio autor lo disena con ese fin.
- Demostracion de tokenizacion a nivel palabra: permite ilustrar en clase como palabras fuera del vocabulario se convierten en `[UNK]` y por que el modelo y el tokenizer deben publicarse juntos.
- Ejercicio de evaluacion critica de metricas: el accuracy de 1,000 sobre test sirve para discutir por que una metrica alta no implica un modelo util cuando train y test comparten plantillas.
- Practica de carga de modelos con `pipeline`: util para que estudiantes aprendan a invocar un modelo local (`.`) y remoto (`usuario/repo`) con la misma API.
- Prototipado de pipelines de clasificacion binaria: sirve como esqueleto de codigo (`train.py`, `predict.py`, `requirements.txt`) que luego se sustituye por un modelo preentrenado en espanol con fine-tuning sobre datos reales.
- Ilustracion de calibracion y sobreconfianza: el ejemplo de "tiene una vista increible" clasificado como `negativo (1.00)` es un caso practico para explicar por que la confianza del modelo no equivale a correccion.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios sinteticos de test |

El propio autor advierte que este resultado es optimista: los comentarios de test emplean las mismas plantillas y adjetivos que los de entrenamiento, por lo que no refleja capacidad de generalizacion. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con ~20.500 parametros el modelo cabe holgadamente en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Funciona en GPU consumer (GTX 1050, RTX 2060, RTX 4090, etc.) sin aprovecharlas.
- Cabe en cualquier GPU consumer y en entornos sin GPU (Colab gratuito, portatiles, Raspberry Pi).
- Opciones de despliegue: `transformers` con PyTorch mediante `pipeline`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| LaugerM/clasificacion-texto-transformers | ~20.500 | no disponible | MIT | Ejemplo pedagogico |
| BERT-base multilingue (referencia) | ~110 M | 512 tokens | Apache 2.0 | Preentrenado, fine-tuning |
| BETO (BERT en espanol) | ~110 M | 512 tokens | Apache 2.0 | Preentrenado en espanol |
| RoBERTa-base BNE (espanol) | ~125 M | 512 tokens | MIT | Preentrenado en espanol |

La comparativa es orientativa: el modelo de LaugerM no es funcionalmente equivalente a los modelos preentrenados en espanol, que requieren fine-tuning pero generalizan sobre vocabulario abierto. No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no apto para produccion.
- Vocabulario de solo 37 palabras: cualquier termino fuera de el se convierte en `[UNK]`, y el modelo responde con alta confianza incluso ante entradas sin sentido.
- No entiende negaciones ("no es luminoso") ni ironia, porque no aparecen en el dataset de entrenamiento.
- Dataset sintetico generado por plantillas: el accuracy de test (1,000) es optimista y no refleja generalizacion.
- Riesgo elevado de sobreconfianza y de alucinacion de etiquetas ante entradas fuera de distribucion.
- Sesgos conocidos: no documentados en la model card; el dataset sintetico no representa la diversidad del lenguaje real.
- Limitaciones de contexto: la longitud maxima de secuencia no se especifica en la informacion disponible.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para ello por sus limitaciones tecnicas.
- Para uso real, el propio autor recomienda partir de un modelo preentrenado en espanol y hacer fine-tuning con comentarios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LaugerM/clasificacion-texto-transformers
