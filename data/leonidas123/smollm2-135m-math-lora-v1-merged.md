# leonidas123/smollm2-135m-math-lora-v1-merged

## Resumen

`leonidas123/smollm2-135m-math-lora-v1-merged` es un ajuste fino (fine-tune) del modelo `HuggingFaceTB/SmolLM2-135M-Instruct`, publicado por el usuario leonidas123 en HuggingFace. El sufijo del nombre (`math-lora-v1-merged`) indica que se trata de una adaptacion LoRA orientada a tareas matematicas que posteriormente se fusiono con los pesos base, generando un modelo unico listo para inferencia estandar con `transformers`. El repositorio contiene 134.515.008 parametros reales en formato safetensors y ocupa aproximadamente 0,3 GB.

El modelo hereda la arquitectura y el conocimiento del SmolLM2-135M-Instruct, un transformer decoder-only de tipo Llama desarrollado por HuggingFaceTB, y le anade un ajuste especifico sobre datos de matematicas. El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, segun declara la propia model card. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia practica radica en que es un modelo extremadamente ligero (135 millones de parametros) que puede ejecutarse en CPU, en GPUs de gama baja o incluso en dispositivos con recursos muy limitados. Esto lo hace util para prototipado rapido, entornos embebidos y experimentos de ajuste fino a bajo coste. Sin embargo, el repositorio no incluye resultados de benchmarks, descripcion del dataset de entrenamiento ni detalles del procedimiento, y acumula cero descargas y cero interacciones, por lo que debe tratarse como un artefacto experimental sin validacion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (heredada del modelo base SmolLM2-135M-Instruct; el tag `llama` lo confirma) |
| Parametros totales | 134.515.008 (aproximadamente 135 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base SmolLM2-135M-Instruct declara 8192 tokens |
| Tipos de cuantizacion | No disponible (no se publican versiones GGUF, AWQ, GPTQ ni similar) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con arquitectura de tipo Llama, la misma familia que utiliza SmolLM2. No se documenta ningun cambio estructural respecto al modelo base: la intervencion consiste en un ajuste fino con LoRA (Low-Rank Adaptation) sobre `HuggingFaceTB/SmolLM2-135M-Instruct`, seguido de una fusion de los adaptadores con los pesos originales, de ahi el sufijo `merged` del nombre. El entrenamiento se llevo a cabo con Unsloth y la libreria TRL, segun la model card, que unicamente menciona que el modelo "se entreno 2 veces mas rapido con Unsloth".

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset de matematicas, la existencia de fases de RLHF o DPO, ni los hiperparametros utilizados. El nombre sugiere un enfoque en razonamiento matematico, pero la model card no incluye ejemplos, datos de evaluacion ni descripcion del corpus, por lo que el alcance real del ajuste no puede verificarse. El modelo base SmolLM2-135M-Instruct, por su parte, corresponde a la familia SmolLM2 de HuggingFaceTB, disenada para ser eficiente en dispositivos con recursos limitados.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta preparado para dialogos de tipo instruccion-respuesta, heredado del ajuste instructivo del modelo base.
- Razonamiento matematico basico: segun el nombre del repositorio, el ajuste LoRA se oriento a problemas matematicos, aunque no se cuantifica su mejora.
- Generacion de texto general: la pipeline declarada es `text-generation`, compatible con la API estandar de `transformers`.
- Compatibilidad con Text Generation Inference (TGI): el tag `text-generation-inference` esta presente, lo que sugiere que puede desplegarse con ese servidor.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles, unico idioma declarado.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ocupar solo 0,3 GB, el modelo puede cargarse en un portatil sin GPU para validar flujos de dialogo antes de migrar a un modelo mayor.
- Experimentos de ajuste fino con LoRA: sirve como caso de referencia para reproducir un pipeline de Unsloth + TRL y comparar configuraciones de entrenamiento.
- Inferencia en entornos embebidos o de borde: sus 135 M de parametros permiten ejecucion en CPU o en dispositivos con poca memoria, adecuado para demos locales o pruebas de concepto.
- Generacion de respuestas a problemas aritmeticos simples: si el ajuste matematico funciona como sugiere el nombre, puede resolver operaciones basicas y ejercicios de nivel elemental en ingles.
- Filtrado o generacion de texto a gran escala: al ser tan ligero, puede usarse para clasificar o completar grandes volumenes de texto con coste computacional minimo.
- Educacion y materiales didacticos automatizados: generacion de pistas o explicaciones paso a paso para ejercicios de matematicas en ingles, con supervision humana por las limitaciones del modelo.
- Base para comparativas de eficiencia: util en estudios academicos que midan la relacion entre tamano del modelo y calidad en tareas aritmeticas.
- Servicio de bajos requisitos con TGI: despliegue en contenedores pequenos para entornos donde el coste por GPU debe ser minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 0,27-0,3 GB de pesos mas el overhead de activaciones y cache KV; en INT8, en torno a 0,14 GB; en INT4, cerca de 0,07 GB. En la practica, cualquier GPU con 1 GB de VRAM o mas es suficiente.
- GPU recomendadas: no requiere GPU dedicada. Funciona en cualquier GPU moderna, incluidas NVIDIA RTX 4090, RTX 3060, GTX 1650, T4, A100 o H100, aunque estas ultimas quedan enormemente sobredimensionadas para el modelo.
- Compatibilidad con GPU de consumo: si, cabe sin problemas en cualquier GPU de consumo e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (tag presente). No se publican pesos GGUF ni cuantizados, por lo que `llama.cpp` y Ollama requeririan una conversion previa del modelo a GGUF.
- Latencia y throughput estimados: no disponibles. Dado el tamano, en GPU moderna la latencia por token seria del orden de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|
| leonidas123/smollm2-135m-math-lora-v1-merged | 134,5 M | No especificado (base: 8192) | Apache-2.0 | safetensors | Fine-tune matematico sin benchmarks ni dataset documentado |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8192 | Apache-2.0 | safetensors, GGUF | Modelo base, documentado y con evaluaciones publicas |
| HuggingFaceTB/SmolLM2-360M-Instruct | 362 M | 8192 | Apache-2.0 | safetensors, GGUF | Version mayor de la misma familia, mas capacidad a costa de mas recursos |
| Qwen/Qwen2.5-0.5B-Instruct | ~494 M | 32768 (extensible con YaRN) | Apache-2.0 | safetensors, GGUF, GPTQ, AWQ | Alternativa mas grande, con contexto mucho mayor y mas formatos de cuantizacion |

Los datos de los modelos comparados corresponden a informacion publica de sus respectivas model cards.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan evaluaciones de sesgo ni de toxicidad. El modelo hereda los sesgos del corpus de entrenamiento de SmolLM2 y del dataset de ajuste, que no se describe.
- Riesgo de alucinacion: elevado, como es habitual en modelos de 135 M de parametros. No debe usarse en tareas que requieran precision factual sin verificacion.
- Limitaciones de contexto e idioma: solo se declara ingles y la longitud de contexto no esta confirmada en la model card; el limite heredado del modelo base es de 8192 tokens.
- Calidad matematica sin verificar: el nombre sugiere un ajuste matematico, pero no hay benchmarks que lo respalden ni ejemplos de resultados publicados.
- Datos de entrenamiento desconocidos: se desconoce el corpus, el numero de tokens, los hiperparametros y si hubo fases de RLHF o DPO.
- Repositorio sin validacion publica: cero descargas y cero "likes"; la model card es minima y no incluye informacion de uso, limitaciones ni evaluaciones.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. Es una licencia permisiva sin clausulas de uso aceptable adicionales.
- Caveat para produccion: al tratarse de un artefacto experimental sin metricas, no se recomienda su uso en produccion sin una evaluacion propia exhaustiva. Para despliegue serio conviene partir del modelo base oficial y aplicar el ajuste con datos y validacion controlados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leonidas123/smollm2-135m-math-lora-v1-merged
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web proporcionada.
