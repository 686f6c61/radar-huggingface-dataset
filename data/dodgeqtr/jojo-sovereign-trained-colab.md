# dodgeqtr/jojo-sovereign-trained-colab

## Resumen

jojo-sovereign-trained-colab es un ajuste fino (fine-tune) del modelo Llama-3.2-3B-Instruct, publicado por el usuario dodgeqtr en HuggingFace. El repositorio contiene exclusivamente el modelo convertido a formato GGUF mediante la libreria Unsloth, con un unico archivo cuantizado en Q4_K_M. El nombre del modelo sugiere un ajuste orientado a un caso de uso propio del autor, pero la model card no documenta el dataset, el objetivo ni el procedimiento de entrenamiento.

El modelo cuenta con 3.212.749.888 parametros totales (unos 3,21 mil millones), lo que lo situa en la gama de modelos pequenos capaces de ejecutarse en hardware de consumo, incluso en CPU. Su formato GGUF y la inclusion de un Modelfile de Ollama lo orientan a despliegue local y a integracion con llama.cpp, mas que a entornos de servidor de alta concurrencia.

La relevancia de esta ficha es limitada pero informativa: se trata de un ejemplo tipico de ajuste fino comunitario con Unsloth sobre una base solida (Llama 3.2 3B), sin benchmarks publicados, sin licencia declarada y con cero descargas en el momento de la consulta. Cualquier evaluacion en produccion deberia partir de una validacion propia, dado que la informacion aportada por el autor es minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.2 (inferido del nombre del archivo publicado; no confirmado de forma explicita en la model card) |
| Parametros totales | 3.212.749.888 (aproximadamente 3,21 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del autor; el modelo base Llama-3.2-3B-Instruct declara 128 000 tokens, pero no se confirma para este ajuste |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `Llama-3.2-3B-Instruct.Q4_K_M.gguf`). No se publican otros niveles de cuantizacion, aunque GGUF admite Q2_K, Q3_K, Q5_K, Q6_K y Q8_0 |
| Idiomas soportados | No disponible (el modelo base declara ingles, aleman, frances, italiano, portugues, hindi, castellano y thai; sin confirmar tras el ajuste) |
| Licencia | No disponible. Presumiblemente hereda la Llama 3.2 Community License del modelo base, pero el autor no la declara |
| Formato de pesos | GGUF (Q4_K_M). La metadata de HuggingFace indica que el recuento de parametros se obtuvo de safetensors, si bien la model card solo lista el archivo GGUF |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-18 (fecha anomala en la metadata de HuggingFace) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de forma explicita. El unico archivo publicado, `Llama-3.2-3B-Instruct.Q4_K_M.gguf`, y la etiqueta `llama` del repositorio apuntan a un transformer decoder-only de la familia Llama 3.2, con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y atencion agrupada por consultas (GQA). El recuento de parametros (3,21 mil millones) coincide con el de Llama-3.2-3B-Instruct, lo que refuerza esa identificacion.

Sobre el entrenamiento, la informacion disponible es minima: el autor indica que el modelo fue ajustado con Unsloth y convertido despues a GGUF, y que el proceso fue "2 veces mas rapido" gracias a esa libreria. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de alineacion como RLHF, DPO u ORPO, ni el regimen de hiperparametros. Tampoco se documenta si se amplio la longitud de contexto durante el ajuste. Se menciona un ajuste en el comportamiento del token BOS para garantizar la compatibilidad con GGUF, un detalle relevante porque puede alterar ligeramente la tokenizacion respecto al modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste de instrucciones de Llama-3.2-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones en formato dialogo, con plantilla Jinja (`--jinja` en llama.cpp).
- Generacion de codigo y resolucion de problemas matematicos sencillos, con limitaciones propias de un modelo de 3B parametros.
- Capacidad multilingue: no documentada por el autor; la del modelo base es de ocho idiomas, sin verificacion posterior al ajuste.
- Soporte de tool calling / function calling: no documentado en la model card. El modelo base lo soporta, pero el ajuste con Unsloth y la cuantizacion Q4_K_M pueden degradarlo, por lo que requiere validacion.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo de razonamiento explicito (thinking), vision o audio: no disponibles.
- Compatibilidad declarada con Ollama mediante un Modelfile incluido, y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Ejecucion en CPU y GPU de gama baja gracias al formato GGUF y a la cuantizacion Q4_K_M.

## Casos de uso

- Asistente conversacional local en escritorio: el modelo puede ejecutarse con llama.cpp u Ollama en un portatil sin GPU dedicada, ofreciendo respuestas multi-turno con una huella de memoria de unos 2-3 GB. Es adecuado cuando la privacidad impide enviar datos a una API externa.
- Prototipado rapido de aplicaciones de chat: al ser un GGUF de 2 GB, permite iterar sobre prompts y plantillas en minutos, sin necesidad de infraestructura GPU ni de pipelines de conversion.
- Clasificacion y extraccion de informacion ligera: tareas como etiquetado de tickets, extraccion de entidades o resumen de fragmentos cortos se pueden resolver con un modelo de 3B a bajo coste, siempre que la precision exigida no sea critica.
- Aplicaciones embebidas o de borde: puede desplegarse en dispositivos con 4-8 GB de RAM o VRAM, por ejemplo en un mini-PC o en una Raspberry Pi 5 con 8 GB, para asistentes offline.
- Base para ajuste fino adicional: al derivar de Llama 3.2 3B y estar disponible en GGUF, sirve como punto de partida o como referencia para comparar variantes propias entrenadas con Unsloth.
- Demostraciones y docencia: util para ilustrar el flujo completo de ajuste fino, cuantizacion y despliegue local en cursos o talleres de IA, dado su tamano manejable.
- Filtrado previo en pipelines hibridos: usar el modelo como primera etapa barata (por ejemplo, descartar consultas irrelevantes) antes de invocar un modelo mayor, reduciendo coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra suite, y los resultados de busqueda web obtenidos no contienen informacion tecnica relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia con el archivo Q4_K_M: en torno a 2,5-3,5 GB, incluyendo cache KV para contextos moderados (unos pocos miles de tokens).
- VRAM estimada si se generan cuantizaciones de mayor precision: aproximadamente 3,5-4 GB para Q8_0 y 6,5-8 GB para FP16/BF16 con overhead del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para Q4_K_M, por ejemplo RTX 3050 6 GB, RTX 3060 12 GB, RTX 4060, RTX 4090 o Tesla T4. Las A100 y H100 son funcionales pero sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas, e incluso en iGPU con memoria unificada suficiente.
- Inferencia en CPU: viable con llama.cpp; con 8-16 GB de RAM se puede ejecutar el modelo completo en memoria.
- Opciones de despliegue: llama.cpp (`llama-cli -hf dodgeqtr/jojo-sovereign-trained-colab --jinja`), `llama-mtmd-cli` segun la model card, `llama-server`, Ollama mediante el Modelfile incluido, LM Studio y cualquier runtime compatible con GGUF. El soporte de vLLM para GGUF es limitado y no esta documentado para este modelo.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de la columna "modelo de referencia" corresponden a las especificaciones nominales de los modelos base y no se han verificado en los resultados de busqueda, que no contenian informacion tecnica relevante.

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| jojo-sovereign-trained-colab | 3,21B | No disponible | No disponible | GGUF Q4_K_M en HuggingFace; Modelfile de Ollama |
| Llama-3.2-3B-Instruct (modelo base) | 3,21B | 128 000 tokens (nominal) | Llama 3.2 Community License | safetensors y GGUF; ampliamente disponible |
| Phi-3.5-mini-instruct | 3,8B | 128 000 tokens (nominal) | MIT | safetensors y GGUF; muy desplegado |
| Gemma-2-2B-it | 2,6B | 8192 tokens (nominal) | Gemma Terms of Use | safetensors y GGUF; disponible en Ollama |

En terminos de rendimiento no es posible establecer comparacion: no existen benchmarks publicados para el modelo objeto de esta ficha. Como referencia cualitativa, un ajuste comunitario de 3B en Q4_K_M suele quedar por debajo del modelo base en tareas de razonamiento y codigo, especialmente si el dataset de ajuste fue pequeno o especializado, aunque puede superarlo en el dominio concreto para el que fue entrenado.

## Limitaciones y advertencias

- Procedencia de datos desconocida: no se documenta el dataset de ajuste fino, lo que impide evaluar sesgos, contaminacion de benchmarks o calidad de las respuestas.
- Riesgo de alucinacion elevado: es una caracteristica inherente a los modelos de 3B parametros, agravada por la falta de evaluacion publicada.
- Licencia no declarada: no se especifica licencia en el repositorio. Aunque el modelo base se distribuye bajo la Llama 3.2 Community License (que incluye una politica de uso aceptable, requisitos de atribucion y una clausula de 700 millones de usuarios activos mensuales), esta herencia no esta confirmada por el autor. Usar el modelo en produccion comercial sin aclarar este punto supone un riesgo legal.
- Sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de verificacion independiente de la calidad o del funcionamiento del archivo.
- Anomalia en las fechas: la metadata indica creacion y actualizacion en septiembre de 2026, una fecha futura respecto a la mayoria de referencias disponibles; conviene tratarla con cautela.
- Modificacion del token BOS: el autor indica que ajusto su comportamiento para la compatibilidad con GGUF, lo que puede provocar diferencias de tokenizacion o de formato de prompt respecto al modelo original.
- Contexto no confirmado: aunque el modelo base declara 128 000 tokens, no hay garantia de que el ajuste conserve esa ventana, ni de que la cuantizacion o el Modelfile la aprovechen correctamente.
- Idiomas no documentados: no se puede asumir el soporte multilingue del modelo base tras un ajuste cuyo dataset se desconoce.
- Tool calling no garantizado: no se documenta soporte de function calling, y es una capacidad que suele degradarse tras ajustes finos y cuantizacion agresiva.
- Unico archivo disponible: solo se publica Q4_K_M, lo que limita el ajuste fino entre calidad y consumo de memoria sin recurrir a una requantizacion propia.
- Ausencia de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones humanas que permitan estimar el rendimiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dodgeqtr/jojo-sovereign-trained-colab
- Unsloth (libreria usada para el ajuste y la conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de ejecucion de GGUF): https://github.com/ggml-org/llama.cpp
- Llama-3.2-3B-Instruct (modelo base presumible): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Resultados de busqueda web: no se han encontrado enlaces relevantes. Las busquedas devolvieron unicamente paginas comerciales de equipaciones deportivas, sin relacion con el modelo, por lo que no se incluyen como referencias tecnicas.
