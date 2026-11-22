# experimentalmachines/Qwen2.5-0.5B-Instruct-ExecuTorch

## Resumen

El repositorio `experimentalmachines/Qwen2.5-0.5B-Instruct-ExecuTorch` contiene exportaciones del modelo Qwen2.5-0.5B-Instruct de Alibaba Cloud para inferencia on-device mediante el runtime ExecuTorch. No se trata de un modelo nuevo, sino de una distribucion de pesos ya cuantizados y compilados en formato `.pte`, listos para ejecutarse en dispositivos Android arm64 sin necesidad de servidores externos. El objetivo es habilitar generacion de texto local en telefonos moviles con huella de memoria reducida y latencia controlada.

El modelo base es un transformer decoder-only de 0,5 mil millones de parametros, con ventana nativa de 32.768 tokens y capacidad de instruccion. La exportacion ofrece diez variantes: cinco para backend XNNPACK (CPU) y cinco para backend Vulkan (GPU), cada una con ventanas de contexto fijas de 2k, 4k, 8k, 16k y 32k tokens. Los pesos estan cuantizados en 8 bits dinamicos para activaciones y 4 bits para pesos, con embeddings int8 por canal, lo que reduce el tamano del archivo a entre 0,42 y 0,56 GB.

La relevancia de esta ficha radica en que demuestra un flujo completo de despliegue edge: exportacion reproducible con ExecuTorch 1.5.1, gestion explicita del KV cache, presupuesto de memoria estimado contra un limite de 5 GB y validacion de estructura para los binarios Vulkan. Es un caso practico de como llevar un LLM pequeno a produccion en movil con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 tokens (ventana fija por archivo: 2k, 4k, 8k, 16k, 32k) |
| Tipos de cuantizacion | Activaciones int8 dinamicas, pesos 4 bits en grupos de 32, embeddings int8 por canal, KV cache fp32 |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, sin detalle en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct: un transformer decoder-only con atencion estandar, entrenado por Alibaba Cloud y posteriormente ajustado para seguir instrucciones. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; esa informacion pertenece a la model card del modelo base y no se reproduce aqui.

La innovacion tecnica de este repositorio es el pipeline de exportacion. Se usa ExecuTorch 1.5.1 con la herramienta `export_llm`, aplicando cuantizacion 8da4w (activaciones dinamicas de 8 bits y pesos de 4 bits en grupos de 32), embeddings int8 por canal, chunk de prefill de 2048 tokens y KV cache en fp32. Para el backend XNNPACK se habilitan operadores extendidos; para Vulkan se usa el delegate de GPU. Cada archivo `.pte` tiene una ventana de contexto fija porque el runtime reserva el KV cache completo en el momento de carga, lo que obliga a elegir la ventana mas grande que el dispositivo pueda sostener. El consumo de KV cache es de 24.576 bytes por token, es decir, 50,3 MB para 2k tokens y 805,3 MB para 32k tokens.

## Capacidades

- Generacion de texto autoregresiva en dispositivo, con pipeline `text-generation`.
- Seguimiento de instrucciones (variante Instruct del modelo base).
- Razonamiento basico y respuesta a preguntas generales, limitado por el tamano de 0,5B parametros.
- Generacion de codigo y matematicas simples, segun las capacidades del modelo base.
- Soporte multilingue heredado de Qwen2.5, aunque la model card no detalla la lista de idiomas.
- Ejecucion local sin conexion a servidores, con backend CPU (XNNPACK) o GPU (Vulkan).
- Ventanas de contexto seleccionables de 2k a 32k tokens segun presupuesto de memoria.
- No se documenta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistente de texto offline en Android: integracion en la app openweights o en cualquier runtime ExecuTorch 1.5.1 para responder consultas del usuario sin enviar datos a la nube, usando la variante de 4k u 8k tokens para conversaciones cortas.
- Autocompletado y redaccion en aplicaciones de notas: el modelo puede sugerir continuaciones de frases o párrafos en local, con la ventana de 2k tokens suficiente para contexto inmediato y huella de 0,42 GB.
- Clasificacion y resumen de mensajes en el propio dispositivo: procesar correos, SMS o notificaciones con la ventana de 8k tokens para extraer resumenes o etiquetas sin comprometer privacidad.
- Traduccion asistida basica en movil: usar la variante Vulkan de 4k tokens para traducciones de frases o parrafos cortos con aceleracion GPU, aceptando las limitaciones de un modelo de 0,5B.
- Chatbot de soporte embebido en apps de campo: desplegar la variante de 16k tokens en dispositivos con al menos 5 GB de presupuesto para gestionar conversaciones multi-turno con contexto moderado.
- Filtrado y moderacion de contenido local: ejecutar el modelo en CPU con XNNPACK para clasificar texto sensible antes de enviarlo a servicios remotos, reduciendo latencia y coste.
- Prototipado de pipelines LLM en edge: servir como banco de pruebas para validar exportacion, cuantizacion y rendimiento antes de escalar a modelos mayores con el mismo flujo ExecuTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pruebas de humo: las cinco variantes XNNPACK pasaron la prueba de generar "Paris", mientras que las cinco variantes Vulkan fueron validadas a nivel de estructura porque el host de exportacion no disponia de runtime NPU.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,42 y 0,56 GB para los pesos, mas el KV cache reservado en su totalidad al cargar: 50,3 MB (2k), 100,7 MB (4k), 201,3 MB (8k), 402,7 MB (16k) y 805,3 MB (32k).
- Presupuesto total recomendado: la model card evalua la viabilidad contra un limite de 5 GB por dispositivo (`fits_phone_budget` en cada `config.json`).
- GPU recomendadas: cualquier GPU arm64 compatible con el delegate Vulkan de ExecuTorch; no se especifican modelos concretos de SoC.
- CPU: cualquier dispositivo arm64 con soporte XNNPACK; no se requiere GPU.
- Cabe en consumer GPU de escritorio: no aplica, ya que el formato `.pte` esta pensado para runtime ExecuTorch en movil; para escritorio seria necesario reexportar o usar otro runtime.
- Opciones de despliegue: app openweights para Android o cualquier runtime ExecuTorch 1.5.1. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-ExecuTorch (este repo) | 0,5B | 2k a 32k (fijo por archivo) | `.pte`, ExecuTorch XNNPACK/Vulkan | Apache 2.0 | Hugging Face, 573 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens | safetensors, transformers | Apache 2.0 | Hugging Face oficial |
| Gemma 3 270M / 1B (familia Google) | 0,27B a 1B | no disponible en esta ficha | safetensors, GGUF y variantes edge | Gemma Terms | Hugging Face |
| Llama 3.2 1B Instruct | 1B | 128k tokens (segun model card oficial) | safetensors, GGUF | Llama Community License | Hugging Face |

La comparativa se limita a alternativas de la misma categoria (LLM pequenos para edge). Los datos de Gemma 3 y Llama 3.2 no provienen de la informacion proporcionada en esta busqueda y deben verificarse en sus respectivas model cards antes de usarse en produccion.

## Limitaciones y advertencias

- Modelo de 0,5B parametros: capacidad de razonamiento, conocimiento factual y calidad de codigo muy por debajo de modelos de 7B o superiores; riesgo alto de alucinacion en preguntas especializadas.
- La ventana de contexto esta fijada dentro de cada archivo `.pte`; no se puede ampliar en tiempo de ejecucion. Hay que elegir el archivo correcto antes del despliegue.
- El KV cache se asigna completo al cargar, por lo que una ventana de 32k consume 805 MB solo en cache, ademas de los pesos.
- Las variantes Vulkan solo fueron validadas a nivel estructural, no con una prueba de inferencia real; su correcto funcionamiento en dispositivos concretos no esta garantizado por la model card.
- No se documentan sesgos especificos, lista de idiomas ni evaluaciones de seguridad en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5; conviene revisar el LICENSE incluido.
- El repositorio pesa 11,3 GB por incluir diez variantes; descargar solo el archivo necesario para cada dispositivo.
- No se documenta soporte de tool calling, agentes, vision ni audio; no asumir estas capacidades en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/Qwen2.5-0.5B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
- App openweights: https://github.com/alpharomercoma/openweights
- ExecuTorch (documentacion oficial): https://github.com/pytorch/executorch
- XNNPACK: https://github.com/google/XNNPACK
- Vulkan: https://www.vulkan.org/
