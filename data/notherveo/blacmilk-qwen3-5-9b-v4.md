# notherveo/blacmilk-qwen3.5-9b-v4

## Resumen

BLACMILK · Qwen3.5-9B es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario notherveo como proyecto de investigación personal. Se trata de un modelo especializado en la generación de proyectos completos de Next.js: a partir de una descripción en lenguaje natural, produce una estructura de ficheros buildable con App Router, Tailwind v4 y componentes shadcn/ui, pensada para desplegarse en Vercel. El modelo se distribuye como modelo completo fusionado (full merged model), aunque la librería declarada en el repositorio es PEFT.

El ajuste se realizó mediante QLoRA SFT sobre 3.752 proyectos sintetizados y verificados como compilables, construidos a partir de repositorios reales con licencias permisivas, páginas compuestas y sistemas de tokens de jerarquía y color. El modelo base aporta la arquitectura y el conocimiento general; el fine-tune añade la convención de salida específica: un bloque `<thinking>` breve seguido de bloques de fichero con rutas y código.

Es relevante para equipos que quieran automatizar el andamiaje de interfaces React/Next.js con un modelo de ~9.000 millones de parámetros que cabe en hardware de consumo y que mantiene el modo de razonamiento del modelo base. Ahora bien, se trata de un artefacto con cero descargas, sin licencia declarada y sin benchmarks publicados, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, variante text; arquitectura exacta no disponible) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio; al ser un modelo de ~9B es cuantizable a GGUF/AWQ/GPTQ con herramientas estándar (no confirmado por el autor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (modelo fusionado); repositorio etiquetado como PEFT |
| Modelo base | Qwen/Qwen3.5-9B |
| Modo de razonamiento | Thinking mode activado (Qwen reasoning) |
| Tamano del repositorio | 17,9 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3.5-9B, con la variante de texto (`qwen3_5_text` según los tags). El autor no documenta detalles de la arquitectura interna (número de capas, dimensiones, mecanismos de atención ni longitud de contexto nativa), por lo que esos datos deben consultarse en la model card del modelo base.

El entrenamiento consistió en un SFT con QLoRA sobre 3.752 proyectos sintetizados que fueron verificados como compilables. La composición del dataset combina repositorios reales con licencias permisivas, páginas compuestas y sistemas de tokens de jerarquía y color. No se menciona el uso de RLHF ni DPO, ni el número de tokens de entrenamiento. La innovación principal no es arquitectónica sino de formato: el modelo aprende a emitir un bloque `<thinking>` corto seguido de bloques de código delimitados con la ruta del fichero (por ejemplo, `tsx title="app/page.tsx"`), lo que facilita el parseo automático y la escritura directa en disco.

## Capacidades

- Generación de proyectos Next.js completos y buildables: App Router, Tailwind v4, shadcn/ui y configuración orientada a despliegue en Vercel.
- Salida estructurada por ficheros: bloques de código con la ruta de destino en el encabezado, aptos para parseo programático.
- Modo de razonamiento (thinking mode) activable mediante `enable_thinking=True` en la plantilla de chat.
- Generación de texto y conversación multi-turno mediante plantilla de chat estándar de Qwen.
- Diseño de sistemas de tokens de color y jerarquía visual, según la composición del dataset de entrenamiento.
- Tool calling / function calling: no disponible (no documentado por el autor).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no documentado).
- Visión y audio: no disponibles; el modelo es de texto.

## Casos de uso

- Andamiaje de aplicaciones Next.js: dado un brief de producto ("landing de analítica SaaS"), el modelo genera la estructura de rutas del App Router, componentes y configuración de Tailwind, reduciendo el trabajo inicial de scaffolding.
- Prototipado rápido de interfaces con shadcn/ui: el fine-tune conoce los componentes y convenciones de la librería, por lo que puede producir pantallas coherentes con el sistema de diseño sin ejemplos adicionales.
- Generación de sistemas de tokens de diseño: a partir de una descripción de marca, el modelo puede proponer jerarquías tipográficas y paletas de color integradas en la configuración de Tailwind.
- Automatización de tareas repetitivas de UI en un pipeline interno: la salida delimitada por ficheros permite escribir un parser que cree los ficheros directamente en el repositorio, integrándolo en un flujo de CI para generar borradores de PR.
- Asistente de desarrollo en local: al ser un modelo de ~9B, puede ejecutarse en una estación de trabajo con GPU de consumo para generar componentes sin enviar código a servicios externos.
- Educación y experimentación: sirve como caso de estudio de fine-tuning QLoRA especializado en un dominio concreto (generación de proyectos web) sobre un modelo base abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos (8,95B × 2 bytes), más overhead de KV cache y activaciones; en la práctica, 24 GB o más para contexto moderado.
- Cuantización a 8 bits: alrededor de 9-10 GB de VRAM; a 4 bits: alrededor de 5-6 GB, con la consiguiente pérdida de calidad (no verificada por el autor).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para bfloat16 con contexto largo; RTX 4090 (24 GB) para bfloat16 con contexto limitado o FP8/INT8.
- GPU de consumo: cabe en RTX 4090 y, en cuantización de 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 12 GB.
- Opciones de despliegue: transformers (uso documentado por el autor), vLLM y TGI para serving en bfloat16; llama.cpp u Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| blacmilk-qwen3.5-9b-v4 | ~8,95B | No disponible | Generacion de proyectos Next.js | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible | Proposito general | Segun modelo base (consultar) | Hugging Face |
| Fine-tunes de generacion de UI sobre modelos de ~7-9B | Variable | Variable | Generacion de componentes web | Variable | Ecosistema Hugging Face |

La comparación con alternativas concretas no está disponible en la información proporcionada; el único punto de referencia fiable es el modelo base, del que este fine-tune hereda arquitectura y capacidades generales.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial; debe contactarse con el autor o asumirse riesgo legal antes de usarlo en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en generación de código ni en tareas generales.
- Cero descargas y un único "like": no existe validación comunitaria ni informes de terceros sobre su comportamiento.
- El propio autor advierte que es un proyecto de investigación personal y recomienda verificar el código generado antes de desplegarlo.
- Riesgo de alucinación en APIs, versiones de dependencias y configuración de Vercel/Tailwind: el modelo puede generar imports o ficheros de configuración incorrectos que fallen en el build.
- Sesgos: no documentados; al derivar de un modelo base de propósito general, puede heredar sesgos de sus datos de preentrenamiento.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés, idioma de la model card y presumiblemente del dataset.
- Longitud de contexto no documentada: limita la planificación de conversaciones largas o proyectos de muchos ficheros.
- El repositorio se etiqueta como PEFT pero se distribuye como modelo fusionado; conviene verificar la integridad de los pesos antes de cargarlos.

## Enlaces

- Hugging Face: https://huggingface.co/notherveo/blacmilk-qwen3.5-9b-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
