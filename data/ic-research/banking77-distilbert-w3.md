# ic-research/banking77-distilbert-w3

## Resumen

`ic-research/banking77-distilbert-w3` es un modelo de clasificación de intenciones (intent classification) para el dominio bancario, obtenido mediante fine-tuning de `distilbert/distilbert-base-uncased` sobre el conjunto de datos BANKING77 de PolyAI. Lo desarrolla el grupo de investigación `ic-research` como parte de la "W3 light path" de la fase A del protocolo FANN, un experimento de enrutamiento (gating) entre un modelo ligero y un modelo de referencia más costoso (BERT-base). El modelo resuelve la tarea de asignar una consulta de usuario en inglés a una de las 77 intenciones bancarias predefinidas.

La relevancia del modelo es fundamentalmente metodológica: no se presenta como un clasificador de producción de altas prestaciones, sino como el componente barato de un sistema de enrutamiento con control de riesgo estadístico. El autor publica explícitamente la receta de entrenamiento, el hash del split, el hash SHA-256 de los pesos y las pérdidas por época, lo que facilita la reproducibilidad. Con 67.012.685 parámetros y un repositorio de 0,3 GB, es un modelo pequeño y desplegable en hardware modesto.

El entrenamiento se realizó sobre solo 5.000 consultas del conjunto de train oficial, con una longitud máxima de 64 tokens y 10 épocas fijas sin early stopping. El resultado declarado es una accuracy de 0,9073 sobre un split de control de riesgo de 2.503 consultas, con una cota superior unilateral de desacuerdo frente al modelo de referencia de 0,0662 al 5% de significación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parametros totales | 67.012.685 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens teóricos del modelo base; entrenado con longitud máxima de 64 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de precisión completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, SHA-256 `8d3966629d225d0564853ff45d21c5d7596fe9570989a3a7053250e8bd856e67`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de DistilBERT, un transformer encoder de 6 capas obtenido por destilación de BERT-base. La cabeza de clasificación se ajusta a 77 etiquetas correspondientes a los nombres de intención de BANKING77, ordenados alfabéticamente y declarados en `config.json`. No se emplean técnicas de atención lineal, decodificación especulativa ni arquitecturas híbridas: es un encoder estándar con pooling y capa densa de clasificación.

La receta de entrenamiento está completamente especificada en la model card: revisión del modelo base `12040accade4e8a0f71eabdb258fecc2e7e948be`, datos correspondientes a las primeras 5.000 consultas del train set oficial barajadas con `numpy.random.default_rng(20261030).permutation(10003)`, optimizador AdamW con learning rate 5e-5 y weight decay 0,01, decaimiento lineal hasta 0 sin warm-up, batch size 32, 10 épocas fijas sin early stopping ni selección de checkpoint, longitud máxima de 64 tokens y semilla 20261030. El entrenamiento se ejecutó en una NVIDIA A10 (Modal) con torch 2.6.0 y transformers 4.48.3. Una primera ejecución con learning rate 2e-5 y 4 épocas alcanzó 0,6904 de accuracy y fue sustituida por la receta actual mediante una enmienda fechada del protocolo. No se documenta uso de RLHF, DPO ni datos sintéticos.

## Capacidades

- Clasificación de texto en inglés en 77 clases de intención bancaria (BANKING77).
- Asignación de una única etiqueta por consulta (clasificación multiclase, no multietiqueta).
- Procesamiento de consultas cortas: el entrenamiento limitó la longitud a 64 tokens, adecuado para mensajes de usuario típicos de atención al cliente.
- Salida de logits por clase, lo que permite umbrales de confianza y abstención en un pipeline de enrutamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene capacidades multilingües: solo inglés.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- No es un modelo generativo: no produce texto libre, solo etiquetas.

## Casos de uso

- Enrutamiento de consultas en atención al cliente bancaria: el modelo clasifica el mensaje entrante en una de las 77 intenciones y lo dirige al flujo o al equipo correspondiente; su tamaño reducido permite ejecutarlo en cada petición con bajo coste.
- Componente barato de un sistema de gating con control de riesgo: tal como lo plantea el protocolo FANN, actúa como "light path" al que se deriva la mayoría del tráfico, reservando el modelo de referencia (BERT-base) para los casos en que el desacuerdo estimado supera el umbral.
- Prefiltrado en pipelines de tickets: clasificación de tickets de soporte bancario para etiquetado automático previo a revisión humana, aprovechando el formato de 77 clases alineado con taxonomías de intención habituales.
- Análisis de conversaciones y agentes virtuales: etiquetado de transcripciones de chat para medir la distribución de intenciones y detectar huecos en la cobertura del bot.
- Baseline reproducible para investigación: la publicación de receta, split hash, hashes de pesos y pérdidas por época lo hace útil como referencia en experimentos de clasificación de intenciones y en estudios de destilación.
- Clasificación en entornos con recursos limitados: con 67 millones de parámetros y 0,3 GB de repositorio, puede servirse en CPU o en GPU de gama baja dentro de un servicio de clasificación de baja latencia.
- Detección de consultas fuera de dominio: usando la distribución de probabilidad de salida y umbrales de confianza para derivar a un humano las consultas que no encajan claramente en ninguna de las 77 intenciones.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy frente a etiqueta gold | 0,9073 | Split de control de riesgo de 2.503 consultas (parte held-out del train oficial) |
| Desacuerdo con el modelo de referencia (BERT-base) | 145 de 2.503 (0,0579) | Mismo split |
| Cota superior unilateral de desacuerdo, significación 0,05 | 0,0662 | Mismo split |
| Accuracy de la primera ejecución (lr 2e-5, 4 épocas) | 0,6904 | No especificado en la model card |

El autor indica explícitamente que estos resultados no son accuracies sobre el test set oficial de BANKING77, que no fue leído. El protocolo considera que un "light path" es demasiado fuerte si la cota superior de desacuerdo es igual o inferior al 1%; este modelo queda por encima de ese umbral. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (67 millones de parámetros, aproximadamente 268 MB de pesos) más el overhead de activaciones para batch pequeño y secuencias de 64 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el autor entrenó en una NVIDIA A10. Para inferencia, una T4, L4, RTX 3060 o incluso CPU son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 20xx en adelante) y en la mayoría de iGPU recientes.
- Opciones de despliegue: transformers (PyTorch), TorchServe, FastAPI con transformers, ONNX Runtime tras exportación, y servicios gestionados de inferencia. No se documentan artefactos GGUF ni integración con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo y la longitud de secuencia de 64 tokens, se espera un throughput alto en GPU y latencia de milisegundos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ic-research/banking77-distilbert-w3 | 67,0 M | 512 (entrenado a 64) | Clasificación de 77 intenciones BANKING77 | Apache-2.0 | Hugging Face |
| distilbert/distilbert-base-uncased | 66,9 M | 512 | Modelo base de propósito general | Apache-2.0 | Hugging Face |
| BERT-base (modelo de referencia del protocolo) | ~110 M | 512 | Clasificación de 77 intenciones BANKING77 (referencia) | Apache-2.0 | Hugging Face |
| Modelos especializados en BANKING77 de la literatura | no disponible | no disponible | Clasificación de intenciones bancarias | variable | variable |

La comparación cuantitativa con BERT-base se limita al desacuerdo medido (0,0579) y a la cota superior (0,0662) sobre el split de control de riesgo; no se publican en la información disponible las métricas absolutas de BERT-base en ese mismo split. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó con solo 5.000 consultas y 10 épocas fijas sin early stopping ni selección de checkpoint, lo que puede producir sobreajuste y una calibración subóptima de las probabilidades.
- La longitud máxima de entrenamiento es de 64 tokens: consultas más largas se truncan, con posible pérdida de información relevante para la clasificación.
- Solo cubre inglés y el dominio bancario de BANKING77; el rendimiento fuera de ese dominio o en otros idiomas no está caracterizado.
- El autor advierte que el modelo no cumple el criterio de "light path" del protocolo FANN (cota superior de desacuerdo ≤ 1%), por lo que no debe asumirse equivalencia con el modelo de referencia en producción.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de clasificación errónea en intenciones ambiguas o solapadas; se recomienda umbral de confianza y derivación a humano.
- No se documentan evaluaciones de sesgo; el dataset BANKING77 puede reflejar sesgos de los datos de origen de PolyAI.
- Licencia Apache-2.0 permite uso comercial del modelo; los datos BANKING77 son CC BY 4.0 (PolyAI) y su uso debe respetar esa atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por terceros.
- No se publican resultados sobre el test set oficial de BANKING77, por lo que la comparación con la literatura estándar de BANKING77 no es directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ic-research/banking77-distilbert-w3
- Protocolo FANN stage A v0.4.3: https://github.com/ic-research/fann-stage-a
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
