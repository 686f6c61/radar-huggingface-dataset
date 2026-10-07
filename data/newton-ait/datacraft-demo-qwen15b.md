# Newton-ait/datacraft-demo-qwen15b

## Resumen

`Newton-ait/datacraft-demo-qwen15b` es un adaptador de ajuste fino publicado por el usuario Newton-ait sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. No se trata de un modelo entrenado desde cero, sino de un checkpoint PEFT (probablemente LoRA) que debe cargarse junto al modelo base para poder utilizarse. El repositorio ocupa 0,2 GB, un tamano coherente con el de un adaptador de bajo rango sobre un transformer de 1.500 millones de parametros, y fue creado el 7 de octubre de 2026 sin actualizaciones posteriores.

La relevancia de esta publicacion es limitada y conviene ser honesto al respecto: registra cero descargas y cero "likes", la model card es la plantilla por defecto de Hugging Face sin ninguna seccion cumplimentada, y no se declara licencia, idiomas, pipeline ni datos de entrenamiento. El sufijo "datacraft" y "demo" sugiere un experimento de generacion o curado de datos sinteticos, pero esto es una inferencia a partir del nombre y no una afirmacion documentada por el autor.

Para un desarrollador que evalue modelos, esta ficha debe leerse como un caso de "artefacto sin documentar": el interes practico esta enteramente en el modelo base Qwen2.5-1.5B-Instruct, que si cuenta con documentacion publica, licencia Apache 2.0 y soporte amplio en el ecosistema. El adaptador anade un delta de pesos del que se desconoce el dataset, el objetivo de entrenamiento y la calidad resultante, por lo que no deberia desplegarse en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer decoder (Qwen2) del modelo base `Qwen/Qwen2.5-1.5B-Instruct`; detalles del adaptador no disponibles |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 1,5 mil millones de parametros (heredado del modelo base, no confirmado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens segun su documentacion publica |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se distribuyen en safetensors; la cuantizacion se aplica al fusionar con el modelo base) |
| Idiomas soportados | No disponible (el modelo base declara soporte para 29 idiomas, incluidos espanol, ingles, chino, frances, aleman y japones) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft (version declarada: PEFT 0.14.0) |
| Modelo base | `Qwen/Qwen2.5-1.5B-Instruct` |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 7 de octubre de 2026 |
| Ultima actualizacion | 7 de octubre de 2026 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de tipo PEFT, segun declara la etiqueta `library_name: peft` y el campo `base_model`. Esto implica que la arquitectura efectiva en inferencia es la del modelo base: un transformer decoder autorregresivo de la familia Qwen2, con atencion por causalidad, normalizacion RMSNorm, activaciones SwiGLU y codificacion posicional RoPE. Sobre esa arquitectura, el adaptador introduce un conjunto reducido de pesos adicionales (habitualmente matrices de bajo rango insertadas en las proyecciones de atencion y de la red feed-forward) que se suman a los pesos originales. El repositorio incluye safetensors, lo que permite tanto cargar el adaptador por separado como fusionarlo con el modelo base para obtener un checkpoint unico.

No hay absolutamente ningun dato publicado sobre el entrenamiento. Se desconoce el numero de tokens utilizados, la composicion del dataset, si hubo una fase de ajuste supervisado, RLHF, DPO u otro metodo de alineamiento, la tasa de aprendizaje, el rango del adaptador, los modulos objetivo ni la precision numerica empleada. La model card reproduce la plantilla por defecto de Hugging Face con todos los campos marcados como `[More Information Needed]`, incluidas las secciones de datos de entrenamiento, hiperparametros, evaluacion e impacto ambiental. El unico rastro de la infraestructura de entrenamiento es la version de PEFT declarada (0.14.0) en la seccion de versiones de framework.

El tag `arxiv:1910.09700` que aparece en los metadatos no corresponde a un paper del modelo: es la referencia a Lacoste et al. (2019), el trabajo sobre estimacion de emisiones de carbono en aprendizaje automatico, que la plantilla de Hugging Face incluye por defecto como enlace al calculador de impacto. Su presencia confirma que la model card no se ha editado de forma sustancial.

## Capacidades

- Generacion de texto autorregresiva, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones, en la medida en que el adaptador no degrade las capacidades del modelo base (no verificado).
- Generacion de codigo y resolucion de problemas matematicos sencillos, capacidades documentadas para el modelo base en su rango de tamano.
- Soporte de tool calling y function calling segun el formato propio de Qwen2.5-Instruct, siempre que el adaptador no haya alterado la plantilla de chat.
- Capacidades multilingues heredadas del modelo base, que declara 29 idiomas; no confirmadas para el adaptador.
- Modo de razonamiento extendido, vision, audio o cualquier otra capacidad especial: no disponible en la informacion proporcionada.
- Cualquier capacidad especifica adquirida mediante el ajuste fino del adaptador: no disponible.

## Casos de uso

- Prototipado rapido en local: al tratarse de un adaptador sobre un modelo de 1,5 mil millones de parametros, puede cargarse en una GPU de consumo para experimentar con flujos de generacion o curado de datos, que es lo que sugiere el nombre del repositorio. Es adecuado por su bajo coste de memoria, no por su calidad demostrada.
- Evaluacion comparativa de tecnicas PEFT: sirve como ejemplo de estructura de repositorio de adaptador (`adapter_config.json` mas safetensors) para estudiar como se distribuye y se carga un LoRA con la libreria PEFT 0.14.0.
- Generacion de datos sinteticos para experimentacion: si el ajuste se oriento a esa tarea, el modelo podria emplearse para producir borradores de instrucciones o respuestas que despues se filtren manualmente. Requiere validacion propia, ya que no hay datos que respalden esta funcion.
- Asistente conversacional de bajo coste: fusionado con el modelo base, puede gestionar conversaciones multiturno dentro del contexto de 32.768 tokens del modelo base, con la advertencia de que un modelo de 1,5B tiene una fiabilidad limitada en contextos largos.
- Clasificacion y extraccion de informacion en textos cortos: tareas de etiquetado, resumen extractivo o normalizacion de campos, donde el reducido tamano del modelo es una ventaja en latencia.
- Entorno de aprendizaje e investigacion: util para reproducir el flujo completo de ajuste fino con LoRA, estudiar el efecto de distintos hiperparametros y comparar el adaptador contra el modelo base sin ajustar.
- Base para un ajuste posterior: el adaptador puede servir como punto de partida para experimentos de ajuste incremental, dado su reducido tamano en disco (0,2 GB) y su compatibilidad con el ecosistema PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye la seccion de evaluacion cumplimentada y no hay ningun otro origen de datos en la informacion proporcionada.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Cualquier otra metrica | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base en bf16 o fp16: aproximadamente 3-4 GB de pesos mas el espacio de la cache KV, que crece con la longitud de contexto. Estas cifras son estimaciones a partir del numero de parametros, no mediciones publicadas para este adaptador.
- VRAM estimada con cuantizacion de 4 bits: en torno a 1-1,5 GB para los pesos, dependiendo del esquema concreto (GPTQ, AWQ, bitsandbytes NF4, Q4_K_M en GGUF).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para inferencia en precision completa; una RTX 3060 de 12 GB, una RTX 4060 Ti o una RTX 4090 son mas que suficientes. En el segmento profesional, una A100 o una H100 resultan sobredimensionadas para este tamano, salvo que se desplieguen muchas instancias en paralelo.
- Cabe sobradamente en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas, e incluso en CPU mediante llama.cpp con cuantizacion agresiva.
- Opciones de despliegue: carga directa con Transformers mas PEFT (requiere fusionar o cargar el adaptador por separado), vLLM y TGI para servir el modelo fusionado, llama.cpp y Ollama si se convierte previamente a GGUF. El adaptador en si no se puede servir con llama.cpp sin fusionarlo antes con el modelo base.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion se establece frente a alternativas de rango 1-2B ampliamente utilizadas. Los datos del modelo base Qwen2.5-1.5B-Instruct proceden de su documentacion publica; los del adaptador son no disponibles.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| `Newton-ait/datacraft-demo-qwen15b` (adaptador) | No disponible | No disponible | No disponible | No disponible | 0 descargas |
| `Qwen/Qwen2.5-1.5B-Instruct` (modelo base) | 1,5B | 32.768 tokens | Apache 2.0 | No disponible en esta ficha | Ampliamente adoptado |
| Alternativas tipo Llama 3.2 1B Instruct | 1,2B | 128.000 tokens | Licencia comunitaria de Llama | No disponible en esta ficha | Ampliamente adoptado |
| Alternativas tipo SmolLM2 1.7B Instruct | 1,7B | 8.192 tokens | Apache 2.0 | No disponible en esta ficha | Adopcion creciente |

No se dispone de datos de rendimiento comparativos verificables para este adaptador, por lo que cualquier afirmacion sobre calidad relativa seria especulativa.

## Limitaciones y advertencias

- La model card no esta cumplimentada: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto. Esto impide auditar el modelo y evaluar riesgos de sesgo o contaminacion de datos.
- La licencia no esta declarada. Sin una licencia explicita, el uso comercial del adaptador queda en un limbo legal, aunque el modelo base Qwen2.5-1.5B-Instruct se distribuya bajo Apache 2.0. Conviene contactar con el autor antes de cualquier uso productivo.
- Riesgo de alucinacion elevado por el rango de tamano del modelo base: los modelos de 1,5 mil millones de parametros generan con fluidez pero verifican mal los hechos, especialmente en tareas de conocimiento factual y matematicas de varios pasos.
- Idiomas no declarados para el adaptador. Aunque el modelo base soporta 29 idiomas, un ajuste fino sobre un corpus desconocido puede haber degradado el rendimiento en idiomas no presentes en ese corpus.
- Sin garantias de compatibilidad con la plantilla de chat original de Qwen2.5-Instruct: si el ajuste modifico los tokens especiales o el formato de turnos, el soporte de tool calling podria romperse.
- Cero descargas y cero interacciones: no hay senal de validacion por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Fecha de creacion muy reciente (7 de octubre de 2026) y sin actualizaciones posteriores, lo que sugiere un experimento puntual mas que un artefacto mantenido.
- Antes de cualquier despliegue en produccion seria imprescindible evaluar el adaptador frente al modelo base sin ajustar en el dominio objetivo y medir si el ajuste aporta o degrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Newton-ait/datacraft-demo-qwen15b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper referenciado en los tags (Lacoste et al., 2019, sobre estimacion de emisiones): https://arxiv.org/abs/1910.09700
- Calculador de impacto de aprendizaje automatico: https://mlco2.github.io/impact
- Libreria PEFT: https://github.com/huggingface/peft
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
