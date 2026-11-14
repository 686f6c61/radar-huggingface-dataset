# Hooshaai/bert-split-head-hybrid-sst2

## Resumen

`Hooshaai/bert-split-head-hybrid-sst2` es un checkpoint de clasificación de sentimiento binario derivado de `google-bert/bert-base-uncased` en el que el autor (Taha Majlesi, bajo la organización Hooshaai/tahamajs) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por un mecanismo propietario denominado `split_head_hybrid`, parte de su librería NeuralOps. El objetivo declarado es demostrar que es posible reemplazar la atención cuadrática O(N²) por una variante subcuadrática O(N) u O(N log N) manteniendo un rendimiento razonable en una tarea GLUE concreta (SST-2) mediante destilación de representaciones desde el modelo profesor original.

El modelo no se distribuye como un transformer completo, sino como un conjunto de pesos modulares en FP16 (`attention_weights.safetensors`, ~55 MB) que contienen únicamente los parámetros de atención entrenados y la cabeza de clasificación. La base congelada de BERT (110 M de parámetros) se reconstruye en tiempo de carga desde `bert-base-uncased` mediante un shim de código remoto (`modeling_neuralops_bert.py`), por lo que es imprescindible usar `trust_remote_code=True`.

Su relevancia es acotada pero interesante como prueba de concepto: el autor reporta un 80,50 % de accuracy en la partición de validación de SST-2 tras la destilación, frente al 54,59 % del estudiante sin destilar y al 91,63 % del profesor BERT-base. Es, por tanto, un artefacto de investigación sobre eficiencia atencional más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `split_head_hybrid` (subcuadrática, O(N) u O(N log N)) en las 12 capas |
| Parametros totales | 110 M (base BERT-base congelada) + pesos de atención y cabeza de clasificación en FP16 (~55 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la de `bert-base-uncased`, 512 tokens, aunque no se explicita en la model card) |
| Tipos de cuantizacion | No disponible (los pesos se publican en FP16; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atención y cabeza de clasificación); la base se carga desde `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (transformer encoder de 12 capas, 110 M de parámetros) y reemplaza en cada capa el bloque de multi-head attention estándar por el mecanismo `split_head_hybrid` de NeuralOps, que el autor describe como de complejidad efectiva subcuadrática (O(N) u O(N log N)) frente al O(N²) de la atención softmax convencional. La base BERT permanece congelada; solo se entrenan los parámetros de atención y la cabeza de clasificación, que se serializan de forma modular en FP16.

El entrenamiento sigue el protocolo "NeuralOps Cached Representation Distillation", una destilación en dos etapas: primero alineación de subespacio oculto y después KL sobre logits combinada con entropía cruzada de la tarea. El autor reporta que la destilación se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) en 58,2 s, con 194 pasos de optimización, throughput de 27.318 tokens/s y un pico de VRAM de 9.199 MB, usando caché offline de representaciones del profesor para evitar cargarlo en memoria. El conjunto de evaluación es la partición de validación de SST-2 (872 muestras binarias).

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) en inglés, sobre la tarea SST-2 de GLUE.
- Clasificación de secuencias de texto cortas o medianas heredando el tokenizador de `bert-base-uncased`.
- Inferencia con atención subcuadrática, lo que en teoría reduce el coste computacional en secuencias largas frente a BERT-base estándar.
- Carga modular: solo se descargan los pesos de atención (~55 MB) y la base se reconstruye desde el Hub.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene modo thinking, visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés; no se documenta soporte para otras lenguas.

## Casos de uso

- Análisis de sentimiento en reseñas de producto o comentarios de usuarios en inglés: el modelo está afinado específicamente sobre SST-2, por lo que es directamente aplicable a clasificación binaria de opiniones cortas con una accuracy reportada del 80,50 % en validación.
- Filtrado de feedback en pipelines de soporte: puede etiquetar automáticamente tickets o mensajes como positivos o negativos para priorizar la cola de atención al cliente, siempre que el volumen y el dominio se parezcan al de SST-2.
- Investigación sobre eficiencia atencional: sirve como referencia reproducible para comparar mecanismos de atención subcuadrática frente a la atención softmax de BERT-base en una tarea GLUE concreta.
- Baseline para experimentos de destilación: el protocolo de destilación en dos etapas y los pesos modulares permiten reproducir o extender el experimento con otros mecanismos del "attention zoo" de NeuralOps.
- Prototipado rápido en entornos con poca VRAM: al cargar solo ~55 MB de pesos de atención sobre una base BERT congelada, el footprint de descarga es muy reducido comparado con un checkpoint completo de ~450 MB.
- Docencia y demostraciones de sustitución modular de atención: el shim de código remoto y la API `load_pretrained_bert` facilitan mostrar cómo se reemplaza un bloque de atención sin reentrenar el resto del modelo.

## Benchmarks y rendimiento

Evaluación reportada por el autor sobre la partición de validación de GLUE SST-2 (872 muestras):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`split_head_hybrid`) | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 54,59 % | 80,50 % |
| Entropía cruzada de validación | 0,2428 | No calibrada | 0,4556 |

Telemetría de entrenamiento reportada: 58,2 s en RTX 3090, 194 pasos, 27.318 tokens/s, pico de VRAM de 9.199 MB.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor reporta un pico de 9.199 MB durante el entrenamiento/destilación en RTX 3090; la inferencia con la base BERT congelada y los pesos de atención en FP16 debería caber holgadamente en GPUs de 8 GB o menos, aunque no se documenta una cifra exacta de inferencia.
- GPU recomendadas: cualquier GPU con al menos ~4-8 GB de VRAM para inferencia; el autor validó el entrenamiento en NVIDIA GeForce RTX 3090 (24 GB, Ampere).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, dado el tamaño del modelo (110 M de parámetros base + ~55 MB de atención).
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`; API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert` o `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se reporta latencia de inferencia; solo throughput de entrenamiento (27.318 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-split-head-hybrid-sst2` | 110 M (base) + ~55 MB atención | No disponible (hereda BERT-base) | 80,50 % (validación) | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor, fine-tune SST-2) | 110 M | 512 tokens | 91,63 % (validación, reportado por el autor) | Apache 2.0 | Hugging Face, estándar |
| BERT-base estándar con atención cuadrática | 110 M | 512 tokens | Referencia habitual ~92-93 % en SST-2 (no verificado en esta ficha) | Apache 2.0 | Hugging Face |

La comparativa directa con alternativas subcuadráticas (por ejemplo, variantes de atención lineal tipo Performer, Linformer o Longformer) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy por debajo del profesor: 80,50 % frente a 91,63 % en SST-2, una diferencia de más de 11 puntos que lo hace inadecuado para producción sin un fine-tune adicional.
- El estudiante sin destilar apenas alcanza el 54,59 %, lo que evidencia que el mecanismo `split_head_hybrid` por sí solo no aprende bien la tarea sin el protocolo de destilación.
- Solo validado en una tarea (SST-2) y en inglés; no hay evidencia de generalización a otras tareas GLUE ni a otros dominios.
- Requiere `trust_remote_code=True` y ejecuta código remoto (`modeling_neuralops_bert.py`), lo que implica un riesgo de seguridad y de mantenimiento a tener en cuenta en producción.
- Dependencia de la librería `neuralops`, que no es estándar en el ecosistema y puede no estar mantenida a largo plazo.
- No se documentan sesgos específicos, pero al heredar la base de `bert-base-uncased` arrastra los sesgos del corpus original (texto web en inglés).
- Riesgo de alucinación no aplica en sentido estricto (es clasificación, no generación), pero sí hay riesgo de clasificaciones erróneas en dominios alejados de SST-2.
- El repositorio tiene un tamaño de 0,0 GB y solo 66 descargas y 2 likes en el momento de la consulta; es un artefacto de investigación con poca validación comunitaria.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0, por lo que conviene verificar la compatibilidad en despliegues comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-split-head-hybrid-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: no disponible enlace directo en la información proporcionada.
