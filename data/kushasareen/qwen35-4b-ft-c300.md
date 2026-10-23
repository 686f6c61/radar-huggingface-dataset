# kushasareen/qwen35-4b-ft-c300

## Resumen

`kushasareen/qwen35-4b-ft-c300` es un ajuste fino del modelo denso Qwen3.5-4B desarrollado por el usuario kushasareen. Se trata de un checkpoint intermedio de un entrenamiento con aprendizaje por refuerzo (RL) de 300 pasos de optimizador sobre el modelo base, publicado con los pesos, la configuración y el tokenizador tal y como los guardó el entrenador. El repositorio no incluye model card descriptiva, dataset, hiperparámetros ni resultados de evaluación: la única documentación es una nota de tres líneas que indica cargarlo con `AutoModelForCausalLM.from_pretrained`.

El interés del modelo es doble. Por un lado, hereda la arquitectura del Qwen3.5-4B, un transformer híbrido que combina capas de atención lineal GatedDeltaNet (GDN) con capas de atención completa, con una longitud de contexto nativa declarada de 262.144 tokens y una base unificada de visión-lenguaje según la documentación del modelo base. Por otro, sirve como artefacto de investigación para estudiar el efecto de una receta de RL corta (300 pasos) sobre un modelo de 4B parámetros.

Con 4.539.265.536 parámetros y un repositorio de 9,1 GB (coherente con pesos en bf16), el modelo es manejable en una única GPU de consumo. Ahora bien, al no haber benchmarks ni validación de la comunidad (0 descargas, 1 like en el momento de la consulta), debe tratarse como un checkpoint experimental y no como un modelo listo para producción sin evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de la familia Qwen3.5: capas de atención lineal GatedDeltaNet (GDN) combinadas con capas de atención completa (arquitectura del modelo base, no verificada de forma independiente en este fine-tune) |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 B) |
| Parametros activos | No aplica: modelo denso, no es un MoE |
| Longitud de contexto | 262.144 tokens en el modelo base Qwen3.5-4B; no confirmada para este fine-tune |
| Tipos de cuantizacion | No se distribuyen artefactos cuantizados (ni GGUF ni AWQ/GPTQ). Solo pesos en safetensors; la cuantizacion requeriria conversion propia |
| Idiomas soportados | No disponible (el repositorio no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers, biblioteca `transformers`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer denso de aproximadamente 4B parametros que, segun la documentacion publica del modelo, emplea una arquitectura hibrida: intercala capas de atencion lineal GatedDeltaNet con capas de atencion completa clasica. Este diseno busca mantener la capacidad de razonamiento sobre contextos largos reduciendo el coste computacional y de memoria del KV cache frente a un transformer completamente atendido. La ficha del modelo base en ModelScope lo describe como un modelo post-entrenado con contexto nativo de 262.144 tokens, compatible con Transformers, vLLM, SGLang y KTransformers, e integra una base unificada de vision-lenguaje.

Sobre el proceso de ajuste de este checkpoint concreto la informacion es minima: la model card indica unicamente "reinforcement learning, 300 optimizer steps". No se especifica el algoritmo de RL (PPO, GRPO, DPO u otro), el dataset de prompts, la funcion de recompensa, el numero de tokens vistos, la composicion de datos ni si hubo etapas adicionales de SFT. Tampoco se documenta ninguna innovacion tecnica propia del fine-tune. El autor recomienda cargarlo con `AutoModelForCausalLM.from_pretrained`, lo que sugiere que el guardado se hizo con la clase de lenguaje causal y deja en el aire si la torre visual del modelo base se conserva y es funcional en este checkpoint.

## Capacidades

- Generacion de texto autoregresiva en el formato estandar de Qwen3.5, siempre que el fine-tune no haya degradado las capacidades del modelo base (no verificado).
- Razonamiento: el entrenamiento con RL sugiere una optimizacion orientada a tareas de razonamiento, pero no se aportan evaluaciones que lo confirmen.
- Procesamiento multimodal: el tag del repositorio es `image-text-to-text` y el modelo base declara una base unificada de vision-lenguaje; la conservacion de esta capacidad en el fine-tune no esta verificada y el autor indica cargarlo con una clase de lenguaje causal.
- Contexto largo: potencialmente hasta 262.144 tokens si el fine-tune preserva la configuracion del base; no confirmado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre aprendizaje por refuerzo en modelos pequenos: el checkpoint permite reproducir y analizar el efecto de 300 pasos de RL sobre un 4B, comparando su comportamiento con el Qwen3.5-4B original en las mismas tareas y con las mismas semillas.
- Punto de partida para fine-tunes de dominio: al estar publicado en safetensors y con licencia Apache 2.0, puede servir como inicializacion para SFT posterior en dominios verticales (legal, sanitario, financiero) partiendo de un modelo ya expuesto a una senal de recompensa.
- Prototipado local en GPU de consumo: con pesos bf16 de unos 9,1 GB, cabe en tarjetas de 16-24 GB y permite iterar en un portatil o estacion de trabajo sin depender de APIs.
- Evaluacion comparativa de recetas de RL: util como linea base para medir si una receta de RL concreta mejora o degrada tareas como matematicas, codigo o seguir instrucciones, usando el base como control.
- Procesamiento de documentos largos en pipelines por lotes: si se confirma el contexto de 262.144 tokens, sirve para resumir o extraer informacion de expedientes completos en una sola pasada, aunque el coste de KV cache a esa longitud exige planificacion de memoria.
- Experimentos de destilacion o cuantizacion: al ser un modelo de 4,54B parametros, es un candidato razonable para probar tecnicas de cuantizacion o destilacion hacia modelos mas pequenos y medir la perdida de calidad respecto al checkpoint original.
- Analisis de sensibilidad a la alineacion: permite estudiar si un RL corto incrementa la verbosidad, la negativa a responder o la adherencia a formatos, aspectos relevantes para quien disena pipelines de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y tampoco se aportan comparaciones con el modelo base Qwen3.5-4B.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 9,1 GB solo para pesos; con overhead de activaciones y KV cache conviene reservar 11-12 GB como minimo.
- VRAM estimada en int8: en torno a 4,6 GB de pesos; 7-8 GB de VRAM total con overhead.
- VRAM estimada en int4: en torno a 2,4-3 GB de pesos; 4-6 GB de VRAM total con overhead, dependiendo de la longitud de contexto.
- GPU recomendadas para bf16: RTX 4090 (24 GB), RTX 4080 / 4070 Ti Super (16 GB), RTX 3090 (24 GB), L4 (24 GB), A10G (24 GB). Para servicio concurrente con contextos largos, A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en bf16 con 16 GB o mas; en cuantizacion int8 o int4 cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4060 8 GB en int4).
- Contexto largo: a 262.144 tokens el KV cache crece de forma muy significativa; aunque las capas GDN reducen parte del coste, en la practica habria que trocear el contexto o usar offloading. No se dispone de cifras medidas de memoria para este checkpoint.
- Opciones de despliegue: `transformers` (via indicada por el autor), vLLM, SGLang y KTransformers (compatibilidad declarada para el modelo base). llama.cpp y Ollama requeririan convertir los pesos a GGUF, ya que el repositorio no incluye artefactos GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| kushasareen/qwen35-4b-ft-c300 | 4,54 B (denso) | No confirmado (base: 262.144) | Tag `image-text-to-text`; multimodalidad no verificada | Apache 2.0 | Fine-tune RL de 300 pasos, sin benchmarks ni validacion de la comunidad |
| Qwen/Qwen3.5-4B | No disponible en la informacion recogida (descrito como 4B denso) | 262.144 tokens nativos | Vision-lenguaje unificada | No disponible en la informacion recogida | Modelo base oficial, compatible con Transformers, vLLM, SGLang y KTransformers |
| Qwen/Qwen3-4B | No disponible en la informacion recogida | No disponible | No disponible | No disponible | Generacion anterior de la familia Qwen, mencionada en los resultados de busqueda como alternativa de tamano similar |

No se dispone de datos suficientes para comparar rendimiento numerico entre estas opciones: no hay benchmarks publicados ni del fine-tune ni, en la informacion recogida, de los modelos de referencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni resultados de validacion, ni comparacion con el modelo base. Cualquier uso en produccion exige una evaluacion propia previa.
- Model card practicamente vacia: no se documentan dataset, funcion de recompensa, hiperparametros, semillas ni duracion real del entrenamiento mas alla de "300 optimizer steps".
- Riesgo de olvido catastrofico: un ajuste con RL de solo 300 pasos puede degradar capacidades del modelo base (codigo, matematicas, seguimiento de formato) sin que exista documentacion que lo descarte.
- Multimodalidad incierta: aunque el tag del repositorio es `image-text-to-text`, el autor indica cargar con `AutoModelForCausalLM`, lo que hace dudar de que la torre visual este operativa. Conviene verificarlo antes de disenar un producto sobre vision.
- Contexto largo no verificado: los 262.144 tokens son un dato del modelo base, no de este checkpoint; la configuracion guardada por el entrenador podria haberlo alterado.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que el rendimiento en castellano es desconocido y debe medirse empiricamente.
- Riesgo de alucinacion: inherente a los modelos de 4B parametros y no mitigado de forma documentada en este fine-tune.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad, ni filtros de alineacion aplicados tras el RL.
- Tokenizador "tal y como lo guardo el entrenador": si el entrenador modifico el tokenizador, podria haber incompatibilidades con herramientas que asumen el tokenizador original de Qwen3.5.
- Validacion de la comunidad nula: 0 descargas y 1 like en el momento de la consulta; no hay terceros que hayan reportado resultados.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la procedencia y los terminos del modelo base Qwen3.5-4B deberian verificarse en su repositorio oficial antes de redistribuir.
- No se distribuyen pesos cuantizados ni GGUF: quien quiera desplegar en llama.cpp u Ollama debe realizar y validar la conversion por su cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kushasareen/qwen35-4b-ft-c300
- Modelo base Qwen3.5-4B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-4B
- Analisis de la arquitectura GDN hibrida de Qwen3.5-4B (deepwiki): https://deepwiki.com/sai-samarth/qwen35-4b-fast-inference/2.1-qwen3.5-4b-gdn-hybrid-model
- Ficha de Qwen3.5-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Generacion anterior Qwen3-4B en Hugging Face: https://huggingface.co/Qwen/Qwen3-4B
