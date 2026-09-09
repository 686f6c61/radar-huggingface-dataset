# 3MPER0RR/deepSeek-R1-Distill-Llama-8B-Lora-adapter-3MPER0RR-abliterated

## Resumen

3MPER0RR/deepSeek-R1-Distill-Llama-8B-Lora-adapter-3MPER0RR-abliterated es un adaptador LoRA publicado en HuggingFace bajo la librería PEFT. Ha sido creado por el usuario 3MPER0RR como un adaptador de bajo rango para un modelo base abliterated: `3MPER0RR/DeepSeek-R1-Distill-Llama-8B-3MPER0RR-abliterated`. No es un modelo autónomo, sino una actualización de pesos que debe cargarse junto al modelo base. El repositorio no contiene los pesos completos del modelo.

El adaptador se distribuye en formato safetensors, con licencia MIT y no tiene descargas ni likes registrados. Dado que el modelo base deriva de DeepSeek-R1-Distill-Llama-8B, la arquitectura subyacente es un Transformer decoder-only de 8.000 millones de parámetros. La técnica de abliteración aplicada al modelo base tiene como objetivo eliminar comportamientos aprendidos, habitualmente relacionados con rechazos o restricciones de seguridad, aunque la ficha del adaptador no aporta detalles del procedimiento ni de la configuración del LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptador LoRA (librería PEFT) |
| Parametros totales | No disponible (el repositorio solo contiene el adaptador LoRA; el modelo base tiene 8.000 millones de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Llama-3.1-8B tiene una ventana nativa de 128.000 tokens, pero no se especifica para el adaptador) |
| Tipos de cuantizacion | No disponible (no se incluyen cuantizaciones en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA; los pesos del modelo base deben obtenerse por separado) |

## Arquitectura y entrenamiento

El adaptador es una actualización de bajo rango (LoRA) sobre un Transformer decoder-only. La información disponible no indica el número de capas adaptadas, el `rank`, el `alpha` ni la configuración exacta de entrenamiento. Tampoco se documentan el dataset utilizado, el número de pasos de entrenamiento ni si se aplicó RLHF o DPO.

El modelo base ha pasado por un proceso de abliteración, una técnica que modifica los pesos de un modelo entrenado para suprimir ciertos comportamientos, típicamente los mecanismos de rechazo o las barreras de seguridad impuestas durante el alineamiento. El repositorio del adaptador no describe la técnica concreta aplicada sobre DeepSeek-R1-Distill-Llama-8B, ni el grado de abliteración alcanzado.

## Capacidades

- El adaptador hereda las capacidades del modelo base DeepSeek-R1-Distill-Llama-8B, orientado a razonamiento, matemáticas, código y lógica.
- El modelo base genera cadenas de razonamiento visibles antes de dar la respuesta final, un comportamiento característico de la familia DeepSeek-R1.
- Se espera que el adaptador preserve o modifique parcialmente el comportamiento del modelo base, aunque no se aportan evaluaciones que lo confirmen.
- Soporte de tool calling o function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base R1 permite razonamiento paso a paso, pero no se ha verificado en esta configuración concreta.
- Capacidades multilingües: no documentadas en la ficha del adaptador. El modelo base, al derivar de Llama-3.1-8B, es multilingüe en la práctica, pero no existe una confirmación específica para este adaptador.

## Casos de uso

- Investigación en alineación y seguridad: permite comparar el comportamiento de un modelo R1 destilado antes y después de la ablación de rechazos, siempre en entornos controlados y con supervisión humana.
- Fine-tuning adicional con LoRA: el adaptador puede servir como punto de partida para ajustes posteriores, ahorrando tiempo al partir de un modelo ya ablacionado.
- Evaluación de robustez del razonamiento: permite comprobar si la abliteración afecta a la capacidad de resolver problemas de matemáticas o código, comparando con el modelo base sin abliterar.
- Prototipos de asistentes técnicos: el modelo base puede desplegarse en un entorno aislado para generar código o documentación, siempre que las respuestas sean revisadas porque no existen benchmarks publicados.
- Estudios de comportamiento modelo: sirve para analizar cómo varía la distribución de respuestas ante instrucciones que el modelo original podría rechazar.
- Docencia en ingeniería de prompts: útil para mostrar en clase los efectos de la ablación sobre la adherencia a instrucciones y la calidad del texto generado.
- Desarrollo de pipelines de evaluación: el adaptador puede integrarse en un flujo de pruebas automáticas para medir la tasa de rechazo, la coherencia y la exactitud de las respuestas del modelo ablacionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen evaluaciones independientes del adaptador ni del modelo base abliterated. La ficha del repositorio no incluye puntuaciones de MMLU, HumanEval, GSM8K u otras pruebas habituales.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB con el modelo base en fp16; ~6-8 GB con cuantización Q4_K_M si el modelo base se convierte a GGUF.
- GPU recomendadas: RTX 4090, A100 40 GB o H100 para fp16; en cuantización 4-bit también pueden usarse GPUs de consumo con 8 GB.
- Sí cabe en GPU de consumo de 8-12 GB, siempre que el modelo base se cuantice y las capas LoRA se fusionen o se gestionen correctamente.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador sobre el modelo base; llama.cpp u Ollama requieren fusionar previamente el adaptador con el modelo base. vLLM puede usarse si el adaptador se integra como parte de un modelo fusionado.
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad ni de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B (original) | 8B (denso) | 128k (base) | MIT | HuggingFace |
| 3MPER0RR/DeepSeek-R1-Distill-Llama-8B-3MPER0RR-abliterated | 8B (denso) | No disponible | MIT | HuggingFace |
| 3MPER0RR/deepSeek-R1-Distill-Llama-8B-Lora-adapter-3MPER0RR-abliterated | LoRA sobre 8B | No disponible | MIT | HuggingFace |

No se han identificado adaptadores oficiales con la misma técnica. La comparativa se limita a las distintas versiones del modelo base, ya que no existen alternativas documentadas en la información disponible.

## Limitaciones y advertencias

- El adaptador no ha sido evaluado públicamente. Tiene 0 descargas y 0 likes, lo que indica una validación mínima por parte de la comunidad.
- No se aportan datos del dataset, número de pasos, learning rate, rank ni configuración del entrenamiento, lo que dificulta la reproducibilidad.
- La ablación de comportamientos puede eliminar mecanismos de rechazo y seguridad. Las respuestas del modelo pueden ser inapropiadas o más agresivas en escenarios que el modelo original evitaría.
- El adaptador no es un modelo funcional por sí mismo. Requiere descargar y cargar el modelo base `3MPER0RR/DeepSeek-R1-Distill-Llama-8B-3MPER0RR-abliterated`, que tampoco cuenta con documentación de evaluación.
- La licencia MIT del adaptador no exime del cumplimiento de la licencia del modelo base. Debe verificarse la licencia de `DeepSeek-R1-Distill-Llama-8B` antes de cualquier uso comercial.
- No se documentan las limitaciones de idioma ni de contexto. La ventana de tokens efectiva puede variar según el runtime, la cuantización y la forma de fusionar el adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/3MPER0RR/deepSeek-R1-Distill-Llama-8B-Lora-adapter-3MPER0RR-abliterated
- Modelo base abliterated: https://huggingface.co/3MPER0RR/DeepSeek-R1-Distill-Llama-8B-3MPER0RR-abliterated
- Modelo original DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
