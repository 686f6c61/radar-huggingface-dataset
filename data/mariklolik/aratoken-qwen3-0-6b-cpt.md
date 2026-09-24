# mariklolik/AraToken-Qwen3-0.6B-CPT

## Resumen

AraToken-Qwen3-0.6B-CPT es un modelo de lenguaje de 596.049.920 parametros publicado por el usuario mariklolik (autores del articulo: Mark Kashirskiy, Artiom Lipinski e Ilya Makarov) como base de comparacion del paper AraToken. Se trata de un checkpoint de preentrenamiento continuado (CPT) sobre Qwen/Qwen3-0.6B-Base en el que se conserva el tokenizador original de Qwen3 y se entrena el modelo con el mismo presupuesto de 500 millones de tokens en arabe (FineWeb2-HQ) que su modelo hermano AraToken-Qwen3-0.6B-LEP. Su proposito es aislar el efecto del preentrenamiento continuado del efecto de la extension de vocabulario y la normalizacion que introduce AraToken.

Arquitectura transformer decoder-only densa de aproximadamente 0,6 mil millones de parametros, con 28 capas de las cuales se entrenan las capas 24 a 27 durante 5.086 pasos. La relevancia actual del modelo es metodologica: sirve como linea base reproducible para medir mejoras de tokenizacion en arabe mediante bits por caracter (BPC) sobre un test held-out comun, un enfoque que permite comparar modelos con vocabularios distintos sobre los mismos caracteres. No es un modelo de instrucciones ni un asistente conversacional: es un modelo base para investigacion y ajuste posterior.

El resultado principal publicado es una mejora de BPC en arabe de 1,5446 (Qwen3-0.6B-Base) a 1,4047 (este modelo), frente a 1,3219 de la variante LEP. La licencia es Apache-2.0 y el repositorio ocupa 1,2 GB en safetensors, con soporte declarado para arabe e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 596.049.920 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-0.6B-Base) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (bfloat16) |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (library: transformers) |
| Modelo base | Qwen/Qwen3-0.6B-Base |
| Tokenizador | Tokenizador original de Qwen3 con normalizador AraToken (NFKC, eliminacion de tatweel, digitos occidentales, puntuacion latina y eliminacion de diacriticos) |
| Pasos de entrenamiento | 5.086 |
| Presupuesto de tokens | 500 millones (FineWeb2-HQ arabe, mismo que la variante LEP) |
| Capas entrenadas | Capas transformer 24 a 27 |
| Dataset | mariklolik/AraToken-FineWeb2-HQ-ar |
| Pipeline | text-generation |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-23 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B-Base, un transformer decoder-only denso de la familia Qwen3. En este checkpoint de CPT se mantiene intacto el tokenizador original de Qwen3; la unica modificacion en el preprocesado es que el tokenizador incorpora el normalizador de AraToken (normalizacion NFKC, eliminacion de tatweel, conversion a digitos occidentales, normalizacion de puntuacion latina y eliminacion de diacriticos), de modo que el texto arabe en crudo puede pasarse directamente al tokenizador. El entrenamiento consistio en 5.086 pasos sobre un presupuesto de 500 millones de tokens del split de alta calidad en arabe de FineWeb2, con solo las capas 24 a 27 marcadas como entrenables, es decir, un ajuste parcial de las capas superiores mas que un reentrenamiento completo.

La innovacion metodologica del trabajo no reside en el modelo en si, sino en el protocolo de evaluacion: se mide bits por caracter (BPC) sobre los primeros 1.500 documentos del split `test` held-out de mariklolik/AraToken-FineWeb2-HQ-ar, lo que permite comparar modelos con vocabularios distintos sobre la misma unidad (caracteres) en lugar de sobre tokens. No se documenta en la informacion disponible el uso de RLHF, DPO u otra fase de alineacion; se trata, por tanto, de un modelo exclusivamente preentrenado, sin ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva en arabe e ingles, en formato de modelo base (completado de texto, no dialogo instruido).
- Modelado de lenguaje en arabe con vocabulario Qwen3 original y normalizacion de texto integrada en el tokenizador, lo que reduce la variabilidad de la entrada (tatweel, diacriticos, digitos arabes).
- Evaluacion reproducible de calidad de tokenizacion en arabe mediante BPC sobre un corpus fijo.
- Punto de partida para ajuste fino supervisado (SFT), LoRA o QLoRA en tareas arabes especificas.
- Capacidad de generar texto bilingue ar/en al haber sido entrenado sobre corpus arabe y conservar el conocimiento del modelo base en ingles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explicito, modo thinking, vision ni audio en la informacion disponible.
- No se documenta una plantilla de chat ni un formato conversacional especifico; el pipeline declarado es text-generation.

## Casos de uso

- Investigacion sobre tokenizacion arabe: usar este checkpoint junto con Qwen3-0.6B-Base y AraToken-Qwen3-0.6B-LEP para aislar la contribucion del preentrenamiento continuado frente a la de la extension de vocabulario, midiendo BPC sobre el mismo split de test.
- Linea base en experimentos de preentrenamiento continuado: al estar entrenado con el mismo presupuesto (500 millones de tokens) y el mismo dataset que la variante LEP, permite comparaciones controladas al introducir cambios de vocabulario o de normalizador.
- Ajuste fino para clasificacion de texto arabe: con 596 millones de parametros y licencia Apache-2.0, es viable afinar el modelo para tareas como deteccion de toxicidad, clasificacion de temas o analisis de sentimiento en arabe, con coste de GPU reducido.
- Extraccion de caracteristicas y modelado de lenguaje para investigacion linguistica: el modelo permite calcular perplejidad y BPC por subconjuntos del corpus (por ejemplo, por dominio o por registro) para estudiar el efecto del preprocesado sobre distintos tipos de texto arabe.
- Generacion de datos sinteticos en arabe tras ajuste: una vez afinado con instrucciones, puede emplearse para aumentar corpus arabes en dominios con poca cobertura, siempre con revision humana por el riesgo de alucinacion de un modelo de 0,6 B.
- Despliegue en entornos con recursos muy limitados: al ocupar aproximadamente 1,2 GB en bfloat16, es adecuado para prototipos en una unica GPU de gama media, portatiles con GPU o instancias CPU pequenas, donde modelos de 7 B o mas no caben.
- Experimentos de destilacion y comparacion de vocabularios: su tamano reducido y su tokenizador sin modificar lo convierten en un candidato comodo para estudiar el impacto del vocabulario en la eficiencia de inferencia y en el coste por caracter generado.
- Docencia y reproduccion de resultados: el paper, el codigo en GitHub y este checkpoint permiten reproducir el pipeline completo de evaluacion de tokenizacion arabe en un entorno asequible.

## Benchmarks y rendimiento

Unico resultado de evaluacion publicado en la informacion disponible: bits por caracter (BPC) en arabe, calculado sobre los primeros 1.500 documentos del split `test` held-out de mariklolik/AraToken-FineWeb2-HQ-ar. Menos es mejor.

| Modelo | BPC en arabe (↓) |
|---|---|
| Qwen3-0.6B-Base | 1,5446 |
| AraToken-Qwen3-0.6B-CPT (este modelo) | 1,4047 |
| AraToken-Qwen3-0.6B-LEP | 1,3219 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: en torno a 1,2 GB solo para pesos (596.049.920 parametros x 2 bytes), mas la cache KV, que crece con la longitud de contexto y el tamano de lote. Una estimacion prudente para uso interactivo es de 2 a 3 GB.
- VRAM estimada en fp32: aproximadamente 2,4 GB solo para pesos.
- Con cuantizacion de 8 bits: alrededor de 0,6-0,7 GB de pesos; con cuantizacion de 4 bits: alrededor de 0,3-0,4 GB. Estas cuantizaciones no estan publicadas en el repositorio y habria que generarlas.
- GPU recomendadas: cabe holgadamente en GPU de consumo como RTX 3060 de 12 GB, RTX 4060, RTX 4070, RTX 4090 y en GPUs de portatil con 6-8 GB. Para lotes grandes o contextos muy largos son preferibles A100 o H100, aunque no son necesarias para inferencia de una sola secuencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM, y tambien en CPU para inferencia a baja velocidad.
- Opciones de despliegue: transformers (metodo documentado en la model card con `AutoModelForCausalLM` y `torch_dtype="bfloat16"`), HuggingFace Text Generation Inference (el repositorio declara la etiqueta `text-generation-inference` y `endpoints_compatible`), HuggingFace Inference Endpoints. Para vLLM, llama.cpp u Ollama seria necesario verificar compatibilidad y, en el caso de llama.cpp/Ollama, convertir previamente los pesos a GGUF, ya que no se publican ficheros GGUF en el repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BPC en arabe (↓) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AraToken-Qwen3-0.6B-CPT (este modelo) | 596.049.920 | no disponible en la informacion | 1,4047 | Apache-2.0 | safetensors en HuggingFace |
| Qwen3-0.6B-Base | no disponible en la informacion | no disponible en la informacion | 1,5446 | Apache-2.0 (modelo base de Qwen) | safetensors en HuggingFace |
| AraToken-Qwen3-0.6B-LEP | no disponible en la informacion | no disponible en la informacion | 1,3219 | no disponible en la informacion (repositorio mariklolik/AraToken-Qwen3-0.6B-LEP) | safetensors en HuggingFace |

Los tres modelos comparten la misma arquitectura base y el mismo presupuesto de entrenamiento arabe (500 millones de tokens, mismo dataset y mismo numero de pasos), por lo que la comparacion de BPC es directa. La diferencia entre este checkpoint y su hermano LEP es el tokenizador: LEP incorpora extension de vocabulario especifica para arabe, mientras que este conserva el tokenizador original de Qwen3. No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) para ninguno de los tres en la informacion proporcionada, ni de comparaciones con otras familias de modelos pequenos de proposito general o especificos para arabe.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineacion documentada: no debe usarse directamente como asistente conversacional ni esperar que siga instrucciones complejas sin un ajuste fino previo.
- El tamano de 0,6 B limita la capacidad de razonamiento, el conocimiento factual y la coherencia en generaciones largas; es esperable una tasa alta de errores factuales y de alucinaciones.
- La mejora de BPC respecto al modelo base es modesta (1,4047 frente a 1,5446, una reduccion relativa de aproximadamente el 9 %), y queda por detras de la variante LEP (1,3219). No se documenta ningun otro benchmark que respalde mejoras en tareas downstream.
- El entrenamiento se limita a 500 millones de tokens de un unico corpus arabe de alta calidad (FineWeb2-HQ), con solo cuatro capas entrenables; el modelo puede degradar el conocimiento del modelo base en dominios no representados en ese corpus.
- La evaluacion publicada se realiza exclusivamente en arabe; el comportamiento en ingles o en otros idiomas no esta caracterizado.
- El normalizador del tokenizador elimina diacriticos y tatweel: puede perder informacion relevante para tareas que dependen de la vocalizacion (por ejemplo, transcripcion o morfologia vocalizada).
- No se publican cuantizaciones (GGUF, AWQ, GPTQ) ni mediciones de latencia, throughput o consumo de VRAM; cualquier estimacion de despliegue debe validarse en el entorno objetivo.
- Riesgo de sesgos: al derivar de Qwen3 y entrenarse sobre un subconjunto de FineWeb2 en arabe, puede heredar sesgos de genero, religion, nacionalidad o dialecto presentes en los corpus web, sin filtrado adicional documentado.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. Conviene revisar tambien las condiciones del modelo base Qwen3-0.6B-Base y del dataset utilizado.
- El repositorio registra 0 descargas y 0 likes, y las fechas de metadatos son de septiembre de 2026: no existe validacion por parte de la comunidad ni evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mariklolik/AraToken-Qwen3-0.6B-CPT
- Variante con extension de vocabulario (LEP): https://huggingface.co/mariklolik/AraToken-Qwen3-0.6B-LEP
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/mariklolik/AraToken-FineWeb2-HQ-ar
- Paper: https://arxiv.org/abs/2512.18399
- Codigo: https://github.com/mariklolik/Aratoken
