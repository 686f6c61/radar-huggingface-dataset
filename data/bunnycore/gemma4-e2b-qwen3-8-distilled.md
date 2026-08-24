# bunnycore/Gemma4-E2B-Qwen3.8-Distilled

## Resumen

Este modelo es un adaptador LoRA (PEFT) desarrollado por bunnycore que se aplica sobre el modelo base unsloth/gemma-4-E2B-it-qat-q4_0-unquantized, la variante instruida de Gemma 4 E2B de Google cuantizada mediante QAT a 4 bits y publicada por Unsloth. El adaptador, de solo 25,3 millones de parametros, ha sido entrenado mediante destilacion sobre el dataset faunix/Qwen3.8-27B-Distillation-40K, compuesto por 40.000 muestras generadas por un modelo Qwen de 27B parametros. El objetivo es transferir las capacidades de razonamiento y seguimiento de instrucciones del modelo profesor al pequeno modelo base de aproximadamente 2B.

La relevancia de este modelo radica en su enfoque de destilacion: permite obtener un modelo compacto y eficiente que hereda parte de las capacidades de un modelo mucho mayor, con un coste de inferencia significativamente menor. Al tratarse de un adaptador LoRA, el despliegue requiere cargar el modelo base Gemma 4 E2B y aplicar los pesos del adaptador, lo que facilita su integracion en entornos con recursos limitados.

Cabe destacar que el modelo se publico en agosto de 2026 y no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que se trata de un proyecto reciente y sin validacion comunitaria. La model card esta mayoritariamente incompleta, con la mayoria de los campos marcados como "[More Information Needed]".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Gemma 4 E2B (transformer) |
| Parametros totales | 25.337.856 (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Gemma 4 E2B) |
| Tipos de cuantizacion | Modelo base QAT q4_0 (pesos almacenados sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de baja dimension entrenado con la libreria PEFT (version 0.18.1) sobre el modelo base unsloth/gemma-4-E2B-it-qat-q4_0-unquantized, que corresponde a la variante instruida de Gemma 4 E2B de Google, cuantizada mediante QAT (quantization-aware training) a 4 bits (q4_0) y con pesos almacenados sin cuantizar. Gemma 4 E2B es el modelo mas pequeno de la familia Gemma 4, que incluye cinco tamanos: E2B, E4B, 12B, 26B A4B y 31B. Segun la documentacion de Google, todos los modelos Gemma 4 incorporan un modelo borrador dedicado para decodificacion especulativa, lo que acelera la inferencia sin perdida de calidad.

El entrenamiento se realizo mediante destilacion sobre el dataset faunix/Qwen3.8-27B-Distillation-40K, compuesto por 40.000 muestras generadas por un modelo Qwen de 27B parametros. La destilacion consiste en entrenar al modelo pequeno para replicar las salidas del modelo profesor, lo que permite transferir capacidades de razonamiento y seguimiento de instrucciones sin necesidad de un dataset masivo. No se dispone de informacion sobre hiperparametros de entrenamiento, regimen de precision (fp16, bf16, etc.), duracion del entrenamiento ni composicion detallada del dataset.

## Capacidades

- Generacion de texto conversacional: el adaptador esta etiquetado para text-generation y uso conversacional, por lo que puede mantener dialogos multi-turno.
- Seguimiento de instrucciones: al estar entrenado sobre un modelo base instruido (it) y destilado desde un modelo Qwen de 27B, se espera que mejore la adherencia a instrucciones respecto al modelo base sin adaptador.
- Razonamiento destilado: la destilacion desde un modelo de 27B busca transferir capacidades de razonamiento al modelo pequeno, aunque el alcance real depende de la calidad del dataset de destilacion.
- Inferencia eficiente: al tratarse de un adaptador LoRA sobre un modelo base de aproximadamente 2B parametros, la inferencia es rapida y viable en hardware de consumo.
- Compatibilidad con el ecosistema Unsloth: el modelo base proviene de Unsloth, lo que facilita su uso con las herramientas de optimizacion de esa plataforma.
- No se documentan capacidades de tool calling, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Chatbots de bajo coste: el modelo puede desplegarse en entornos con recursos limitados (CPU, GPU de gama baja) para ofrecer asistentes conversacionales basicos sin necesidad de infraestructura cloud costosa, gracias al tamano reducido del modelo base y la cuantizacion QAT.
- Prototipado rapido: al ser un adaptador pequeno (0,2 GB), permite iterar rapidamente en experimentos de destilacion y fine-tuning sin requerir hardware especializado ni grandes presupuestos de computo.
- Educacion e investigacion: util para estudiar tecnicas de destilacion de conocimiento y comparar el rendimiento de modelos pequenos entrenados con datos generados por modelos grandes, un area de investigacion activa en la comunidad open source.
- Aplicaciones edge: el modelo base de 2B con cuantizacion QAT q4_0 puede ejecutarse en dispositivos moviles o embebidos, y el adaptador LoRA anade capacidades especificas sin incrementar significativamente el peso total.
- Generacion de texto asistida: puede integrarse en herramientas de autocompletado o redaccion asistida donde se requiera un modelo ligero y rapido, con latencia reducida frente a modelos de mayor tamano.
- Experimentacion con LoRA: sirve como ejemplo de referencia para desarrolladores que quieran aplicar adaptadores LoRA sobre modelos Gemma 4 con datasets de destilacion, ya que el repositorio incluye los tags y la configuracion PEFT necesaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un adaptador LoRA sobre un modelo base de aproximadamente 2B parametros cuantizado a 4 bits, la inferencia puede ejecutarse con menos de 4 GB de VRAM en GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) deberia ser suficiente para inferencia. Para entrenamiento del adaptador, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo gracias al tamano reducido del modelo base y la cuantizacion QAT.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con transformers y PEFT. El modelo base de Unsloth es compatible con herramientas como llama.cpp, Ollama y vLLM, aunque el adaptador requiere cargarse via PEFT.
- Latencia y throughput: no se dispone de datos medidos. Como referencia orientativa, un modelo de 2B cuantizado puede generar decenas de tokens por segundo en una GPU moderna, pero no hay datos especificos para este adaptador.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para establecer una comparativa cuantitativa. A nivel cualitativo, el modelo se situa en la categoria de adaptadores LoRA sobre modelos pequenos de la familia Gemma 4:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bunnycore/Gemma4-E2B-Qwen3.8-Distilled | 25,3M (adaptador) + ~2B (base) | No disponible | No disponible | HuggingFace |
| google/gemma-4-E2B | ~2B | No disponible | No disponible | HuggingFace |
| google/gemma-4-E4B | ~4B | No disponible | No disponible | HuggingFace |

La comparativa con otros adaptadores LoRA de la comunidad no es posible sin datos de rendimiento publicados.

## Limitaciones y advertencias

- Sin validacion comunitaria: el modelo registra 0 descargas y 0 valoraciones, por lo que no ha sido probado ni validado por la comunidad.
- Model card incompleta: la mayoria de los campos de la model card estan marcados como "[More Information Needed]", incluyendo licencia, idiomas, datos de entrenamiento y evaluacion.
- Licencia no especificada: no se indica la licencia del adaptador ni del modelo base, lo que impide conocer las restricciones de uso comercial.
- Riesgo de alucinacion: al ser un modelo pequeno (2B) destilado, es probable que presente alucinaciones y errores facticos con mayor frecuencia que modelos grandes.
- Sesgos desconocidos: no se documentan sesgos ni limitaciones sociotecnicas del modelo o del dataset de destilacion.
- Dependencia del modelo base: el rendimiento final depende criticamente del modelo base Gemma 4 E2B y de la calidad del dataset de destilacion, que no esta documentada.
- Sin garantias de produccion: la ausencia de benchmarks y evaluacion hace que no sea recomendable su uso en produccion sin una validacion previa exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bunnycore/Gemma4-E2B-Qwen3.8-Distilled
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-E2B-it-qat-q4_0-unquantized
- Modelo base original (Google): https://huggingface.co/google/gemma-4-E2B
- Pagina de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Vision general de Gemma 4: https://ai.google.dev/gemma/docs/core
- Dataset de destilacion: https://huggingface.co/datasets/faunix/Qwen3.8-27B-Distillation-40K
- Referencia arxiv (Lacoste et
