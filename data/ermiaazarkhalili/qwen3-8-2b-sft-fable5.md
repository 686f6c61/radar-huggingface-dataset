# ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5

## Resumen

Qwen3.8-2B-SFT-Fable5 es un modelo de lenguaje fine-tuneado a partir de empero-ai/Qwen3.8-2B, un modelo base de la serie Qwen3.8 desarrollada por Alibaba. El autor, ermiaazarkhalili, ha aplicado un ajuste fino supervisado (SFT) utilizando la librería Unsloth y el framework TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un flujo convencional. El modelo está orientado a tareas conversacionales en inglés y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de código abierto.

Con 2.274 millones de parámetros, se trata de un modelo compacto, adecuado para entornos con recursos limitados o para despliegues en los que se priorice la latencia sobre la capacidad bruta. Aunque la ficha de Hugging Face indica un pipeline de image-text-to-text, no se ha confirmado que el modelo tenga capacidades multimodales reales; probablemente se trate de una etiqueta heredada del modelo base. El repositorio incluye también una versión cuantizada en GGUF, lo que amplía las opciones de despliegue en CPU y dispositivos edge.

La relevancia de este modelo radica en su tamaño reducido y su licencia permisiva, que lo convierten en una opción interesante para prototipos, asistentes conversacionales ligeros y experimentos de fine-tuning adicional. Sin embargo, al ser un trabajo reciente y con pocas descargas, la documentación disponible es escasa y no se han publicado benchmarks oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, no se especifica variante) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existe una version GGUF, pero sin detalle de cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien disponible GGUF) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de la serie Qwen3.8, que a su vez deriva de la familia Qwen3.5. No se han publicado detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas, pero al tratarse de un modelo de 2.274 millones de parámetros, se espera una configuración similar a otros modelos de tamaño comparable (por ejemplo, 24 capas y dimensiones de alrededor de 2048). El proceso de entrenamiento consistió en un ajuste fino supervisado (SFT) sobre el modelo base empero-ai/Qwen3.8-2B, utilizando la librería Unsloth para acelerar el entrenamiento y el framework TRL de Hugging Face para el pipeline de fine-tuning. No se especifica la composición del dataset de entrenamiento ni el número de tokens utilizados, aunque el nombre "Fable5" sugiere que podría estar relacionado con fábulas o narrativas cortas, posiblemente con fines de generación de historias o diálogos.

No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT. Tampoco se indican innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generacion de texto: el modelo es capaz de producir texto coherente en ingles, orientado a conversacion y posiblemente a narracion de historias cortas.
- Conversacion multi-turno: al ser un fine-tuning conversacional, puede mantener dialogos con contexto limitado (la longitud de contexto no se ha especificado).
- Soporte de tool calling: no se ha confirmado esta capacidad.
- Soporte de agentes y multi-step reasoning: no se ha confirmado.
- Capacidades multilingues: solo ingles, segun la etiqueta de idioma.
- Capacidades especiales: el pipeline indica image-text-to-text, pero no hay evidencia de que el modelo procese imagenes; probablemente sea una etiqueta erronea.

## Casos de uso

- Chatbots de atencion al cliente: con su tamano compacto, puede desplegarse en servidores modestos para gestionar consultas frecuentes en ingles, manteniendo conversaciones sencillas y derivando casos complejos a agentes humanos.
- Asistentes virtuales para dispositivos edge: al poder cuantizarse a GGUF, es viable ejecutarlo en Raspberry Pi o moviles de gama media para tareas de generacion de texto o resumen.
- Generacion de contenido creativo: dado el nombre "Fable5", podria utilizarse para escribir fabulas, cuentos cortos o guiones, aunque su calidad dependera del dataset de entrenamiento.
- Prototipado rapido de aplicaciones de lenguaje: su licencia Apache 2.0 y su tamano permiten integrarlo en demos o MVPs sin coste de licencia.
- Fine-tuning adicional: al ser un modelo base ya ajustado, puede servir como punto de partida para tareas especificas (por ejemplo, clasificacion de texto o extraccion de informacion) con pocos recursos.
- Educacion e investigacion: util para experimentos de bajo coste en universidades o laboratorios que necesiten un modelo de lenguaje pequeno y modificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se han comparado con modelos similares en la documentacion del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo en precision FP16, se requieren aproximadamente 4,5 GB de VRAM (2,27 GB de pesos + overhead). Con cuantizacion INT8, alrededor de 2,3 GB; con INT4, cerca de 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) puede ejecutar el modelo en FP16. Para cuantizaciones mas agresivas, incluso GPUs integradas o CPUs son viables.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: al existir una version GGUF, se puede usar con llama.cpp, Ollama o LM Studio. Para servidores, vLLM o TGI pueden cargar el modelo en formato safetensors.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (por ejemplo, RTX 4090), se espera una generacion de 50-100 tokens por segundo para un modelo de 2B, pero esto es una estimacion general.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A modo de referencia, se puede comparar con otros modelos de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-2B-SFT-Fable5 | 2,27 B | No disponible | Apache 2.0 | Fine-tuning conversacional |
| Qwen2.5-1.5B | 1,54 B | 32K | Apache 2.0 | Modelo base de proposito general |
| Llama-3.2-1B | 1,23 B | 128K | Llama 3.2 Community | Modelo base con soporte de tool calling |
| Phi-3-mini (3.8B) | 3,8 B | 128K | MIT | Modelo compacto con buenos resultados en razonamiento |

La comparacion es orientativa, ya que no se han evaluado los modelos bajo las mismas condiciones.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales de Qwen3.8, aunque no se han documentado especificamente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas poco representados en su dataset.
- Limitaciones de contexto: la longitud de contexto no se ha especificado; probablemente sea inferior a la de modelos mas grandes, lo que limita el manejo de documentos largos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion correspondiente.
- Caveat para produccion: al ser un modelo pequeno y con poca documentacion, no se recomienda para tareas criticas sin una evaluacion exhaustiva previa. La etiqueta de image-text-to-text puede inducir a error; no se ha verificado soporte multimodal real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5
- Version GGUF: https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-Glint-GGUF
- Entrada en FriendliAI (inferencia): https://friendli.ai/models/ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-Glint
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
