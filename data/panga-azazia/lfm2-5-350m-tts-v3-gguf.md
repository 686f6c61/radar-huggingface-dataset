# Panga-Azazia/LFM2.5-350M-TTS-v3-gguf

## Resumen

LFM2.5-350M-TTS-v3-gguf es un modelo de lenguaje de ~382,7 millones de parámetros publicado por el usuario Panga-Azazia en HuggingFace, distribuido en formato GGUF para su uso con llama.cpp y herramientas compatibles. Se trata de un ajuste fino (finetune) de un modelo de la familia LFM2 (etiqueta `lfm2` del repositorio) que ha sido convertido a GGUF mediante Unsloth, según indica la propia model card. El repositorio no incluye información sobre el dataset de entrenamiento, el proceso de ajuste ni los hiperparámetros empleados.

El modelo resuelve el caso de uso de inferencia local de bajo coste: con menos de 400 millones de parámetros y pesos en F16, puede ejecutarse en CPU, en GPUs de gama de entrada e incluso en dispositivos con recursos muy limitados. La etiqueta `conversational` sugiere un ajuste orientado a diálogo, y la etiqueta `endpoints_compatible` apunta a su uso detrás de APIs compatibles con el formato de endpoints de HuggingFace. El sufijo `TTS-v3` del nombre podría indicar un ajuste relacionado con síntesis de voz, pero la model card no documenta ninguna capacidad de audio y el único fichero publicado es un GGUF de texto, por lo que no puede confirmarse.

El interés actual del modelo es limitado pero concreto: es un ejemplo de flujo de trabajo Unsloth + llama.cpp para publicar variantes cuantizadas de modelos pequeños, y sirve como banco de pruebas para pipelines de inferencia local. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y no se ha publicado licencia ni lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2 (etiqueta `lfm2`); no se detallan los bloques internos en la informacion disponible |
| Parametros totales | 382.682.880 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (unico fichero publicado: `LFM2.5-350M-TTS-v3.F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (F16); el autor indica conversion desde el modelo original mediante Unsloth |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de la etiqueta `lfm2`, que situa al modelo dentro de la familia LFM2. Tampoco se especifica el numero de capas, la dimension del modelo, el tipo de atencion ni el tamano de vocabulario. El dato disponible es el recuento de parametros (382.682.880), coherente con la denominacion comercial de 350M.

En cuanto al entrenamiento, la unica informacion aportada es que el modelo fue ajustado (finetuned) y convertido a GGUF con Unsloth, y que el entrenamiento resulto "2x mas rapido" con dicha herramienta. La model card menciona una nota tecnica relevante: el comportamiento del token BOS fue ajustado para garantizar la compatibilidad con GGUF. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El autor tampoco documenta si se empleo decodificacion especulativa, atencion lineal u otras innovaciones.

## Capacidades

- Generacion de texto: uso previsto con `llama-cli` y `llama-server` a traves del fichero GGUF publicado.
- Conversacion: la etiqueta `conversational` del repositorio indica un ajuste orientado a dialogos multi-turno, aunque no se documentan plantillas de chat ni formato de mensajes.
- Uso multimodal: la model card incluye el ejemplo generico `llama-mtmd-cli` para modelos multimodales, pero el repositorio solo publica un GGUF de texto, por lo que no puede confirmarse soporte real de vision o audio.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con APIs HTTP compatibles, si bien no se detalla que interfaz concreta.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos sin GPU: con pesos F16 de aproximadamente 0,71 GiB, el modelo puede ejecutarse integramente en CPU mediante llama.cpp, lo que lo hace util para prototipos en portatiles, mini-PC o entornos sin acelerador.
- Pruebas de integracion de llama.cpp: sirve como modelo de referencia para validar pipelines de compilacion, servidores `llama-server` y bindings como `llama-cpp-python` antes de desplegar modelos de mayor tamano.
- Clasificacion y extraccion de texto ligera: para tareas de etiquetado, resumen corto o extraccion de campos en lotes grandes, un modelo de 350M reduce el coste por token frente a alternativas de miles de millones de parametros.
- Chatbot embebido de bajo consumo: la etiqueta `conversational` permite plantear un asistente sencillo en aplicaciones de escritorio o moviles donde el presupuesto de memoria es inferior a 1 GB.
- Generacion de texto en el borde (edge): al caber en dispositivos tipo Raspberry Pi o telefonos con 2-4 GB de RAM, puede emplearse para funciones de autocompletado o ayuda contextual sin conexion.
- Filtrado y preprocesado en pipelines RAG: puede utilizarse como primer nivel de cribado (reformulacion de consultas, deteccion de intencion) antes de recurrir a un modelo mayor, reduciendo latencia y coste.
- Base para experimentos de ajuste fino: dado su tamano reducido y su formato GGUF, es adecuado como banco de pruebas para experimentos de cuantizacion, destilacion o ajuste con LoRA en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica. La busqueda web asociada a este modelo no devolvio resultados relevantes: todas las entradas recuperadas tratan sobre el pez panga (Pangasianodon hypophthalmus) y no guardan relacion con el modelo.

## Requisitos de hardware

- Peso de los parametros: 382.682.880 parametros en F16 equivalen a aproximadamente 765 MB (0,71 GiB) solo de pesos.
- VRAM estimada: en torno a 1-1,5 GB para F16 con contextos cortos; el consumo adicional depende del tamano de la cache KV, que no puede calcularse porque la longitud de contexto y el numero de capas no estan documentados.
- GPU consumer: cabe con holgura en cualquier GPU con 2 GB o mas de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc.).
- GPU de centro de datos: no requiere A100, H100 ni similares; su uso en estas plataformas seria desproporcionado.
- CPU: ejecutable en CPU mediante llama.cpp; el repositorio no especifica requisitos minimos de RAM, aunque con los pesos en F16 el limite practico lo marca la memoria disponible para el modelo mas la cache KV.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli`), Ollama, LM Studio y bindings derivados. El soporte de vLLM para GGUF es experimental y no esta documentado por el autor. No se menciona compatibilidad con TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos no proceden de la informacion proporcionada en esta busqueda y deben verificarse en sus respectivas fichas.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| LFM2.5-350M-TTS-v3-gguf | 382.682.880 | no disponible | no disponible | GGUF (F16) | no publicados |
| SmolLM2-360M | ~362 M | no verificado en esta busqueda | no verificada | safetensors, GGUF | no verificados |
| Qwen2.5-0.5B | ~494 M | no verificado en esta busqueda | no verificada | safetensors, GGUF | no verificados |
| LFM2 base (350M) | ~350 M | no disponible | no disponible | no disponible | no disponibles |

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks, ni pruebas de calidad, ni comparaciones publicadas por el autor.
- Licencia no especificada: sin licencia declarada no puede asumirse permiso de uso comercial, redistribucion o modificacion. Es un riesgo legal relevante para produccion.
- Idiomas no declarados: se desconoce que lenguas soporta el ajuste fino y con que calidad.
- Contexto desconocido: al no documentarse la longitud de contexto, no es posible dimensionar la cache KV ni garantizar conversaciones largas.
- Riesgo de alucinacion: con 382 millones de parametros, la tasa de errores factuales y de incoherencias es previsiblemente alta en tareas de conocimiento; no se han publicado evaluaciones que lo cuantifiquen.
- Ambiguedad del sufijo "TTS": el nombre sugiere sintesis de voz, pero no hay ficheros de audio, tokenizador de audio ni documentacion que lo respalden. No debe asumirse capacidad de texto a voz.
- Ambiguedad multimodal: la model card incluye un ejemplo con `llama-mtmd-cli`, pero el repositorio solo contiene un GGUF de texto; el ejemplo parece texto generico de plantilla.
- Trazabilidad limitada: no se indica el modelo base exacto del que parte el finetune, ni la version de Unsloth, ni la fecha del ajuste.
- Adopcion nula: 0 descargas y 1 like en el momento de la consulta, sin issues ni comunidad que permitan validar el comportamiento real.
- Ajuste del token BOS: el autor modifico el comportamiento del token BOS para compatibilidad con GGUF, lo que puede alterar ligeramente los resultados respecto al modelo original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Panga-Azazia/LFM2.5-350M-TTS-v3-gguf
- Unsloth (herramienta de ajuste y conversion citada por el autor): https://github.com/unslothai/unsloth
- Busqueda web: no se encontraron resultados relevantes sobre el modelo; las entradas recuperadas corresponden al pez panga y no se incluyen por no ser pertinentes.
