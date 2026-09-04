# Dani12po/zevora

## Resumen

ZEVORA es una aplicación de agente de IA híbrida y local-first desarrollada por Dani12po, publicada en Hugging Face como distribución de código fuente. No es un modelo de lenguaje con pesos propios, sino un sistema que ejecuta el modelo base **Qwen3.8-Flash-Next** (de la familia GGUF de unsloth) a través de llama.cpp, sin necesidad de conexión a internet ni claves API para la inferencia local. El proyecto resuelve el problema de ejecutar agentes de IA con privacidad de datos, ofreciendo un router adaptativo que puede derivar tareas complejas a proveedores cloud opcionales (OpenAI, Anthropic, Gemini, DeepSeek, xAI, NVIDIA) manteniendo el contexto del proyecto, la memoria y la caché en local.

La arquitectura se compone de un gateway FastAPI, un núcleo de agente, una capa de herramientas MCP con aprobación explícita y un router híbrido. La longitud de contexto por defecto configurada en la aplicación es de 8192 tokens, con un máximo de salida de 2048 tokens. La licencia del código es MIT y los idiomas declarados en Hugging Face son inglés e indonesio. La relevancia actual del proyecto radica en la tendencia de agentes locales con control de datos y en la integración de modelos GGUF mediante llama.cpp para despliegue en hardware propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion de agente hibrido (FastAPI + llama.cpp); no es un modelo de lenguaje en si |
| Parametros totales | no disponible (aplicacion sin pesos; depende del modelo base Qwen3.8-Flash-Next) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (configuracion por defecto en la aplicacion) |
| Tipos de cuantizacion | UD-Q4_K_XL (recomendada); otros GGUF de la familia Qwen3.8-Flash-Next |
| Idiomas soportados | en, id |
| Licencia | MIT |
| Formato de pesos | No contiene pesos; el modelo base se distribuye en GGUF (via unsloth/Qwen3.8-Flash-Next-GGUF) |

## Arquitectura y entrenamiento

ZEVORA no es un modelo entrenado, sino una aplicación de agente con arquitectura de capas. El gateway expone una API REST con streaming SSE y una interfaz web. El núcleo del agente gestiona caché exacta, memoria persistente en SQLite, registro de experiencia para el enrutamiento, motor de conocimiento y contexto de proyecto indexado. El router adaptativo decide entre la inferencia local (llama.cpp con un GGUF) y proveedores cloud según la complejidad de la tarea y los modos `LOCAL_ONLY` / `CLOUD_ONLY`. Las herramientas de sistema de archivos, Git y terminal están limitadas al espacio de trabajo del proyecto y requieren aprobación del usuario.

El modelo base es **Qwen3.8-Flash-Next**, obtenido del repositorio `unsloth/Qwen3.8-Flash-Next-GGUF`. El autor de ZEVORA no entrena, modifica ni reclama propiedad sobre estos pesos. La integración se realiza mediante `llama-cpp-python`, con soporte para aceleración por GPU mediante ruedas CUDA. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre procesos como RLHF o DPO, ya que no aplican a la aplicación en sí.

## Capacidades

- Generacion de texto mediante el modelo base Qwen3.8-Flash-Next a traves de llama.cpp, sin necesidad de API key ni conexion a internet.
- Soporte de tool calling y function calling a traves de herramientas MCP (filesystem, Git, terminal) con aprobacion explicita y ambito restringido al proyecto.
- Capacidades de agente y razonamiento multi-paso con memoria y contexto de proyecto persistente.
- Enrutamiento hibrido adaptativo que puede derivar tareas complejas, multimodales o de contexto largo a proveedores cloud opcionales.
- Cache exacta que devuelve respuestas previas a prompts identicos sin ejecutar inferencia.
- Registro de experiencia por proveedor que mejora la seleccion de modelo en solicitudes futuras.
- Motor de conocimiento que extrae patrones de solucion reutilizables de respuestas anteriores.
- Interfaz web, API de chat con streaming SSE y controlador CLI.
- Modos de funcionamiento `LOCAL_ONLY` y `CLOUD_ONLY` para control total sobre el flujo de datos.
- Soporte multilingue declarado para ingles e indonesio.

## Casos de uso

- Asistente de programacion local: el desarrollador ejecuta ZEVORA en su maquina para generar y revisar codigo sin enviar el codigo a servidores externos. Las herramientas MCP permiten leer y modificar archivos del proyecto tras aprobacion.
- Desarrollo de agentes con privacidad: equipos que trabajan con codigo propietario pueden usar el modo `LOCAL_ONLY` para mantener el contexto del proyecto, la memoria y la cache en el disco local.
- Automatizacion de tareas de Git: el agente puede ejecutar comandos de Git (commit, branch, merge) dentro del espacio de trabajo del proyecto, con confirmacion previa del usuario.
- Entornos sin conexion: en redes aisladas o con restricciones de salida, ZEVORA funciona con el modelo GGUF local y sin depender de proveedores cloud.
- Orquestacion de tareas complejas con fallback: cuando una tarea requiere contexto largo o capacidades multimodales, el router adaptativo envía la solicitud a un proveedor cloud (OpenAI, Anthropic, etc.) manteniendo el control de la decision en la configuracion local.
- Documentacion de proyectos: el agente usa el conocimiento extraido y el contexto indexado del proyecto para generar documentacion tecnica o resumenes de cambios, apoyandose en la memoria persistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano y cuantizacion del modelo base Qwen3.8-Flash-Next).
- GPU recomendadas: no disponible. La aplicacion admite aceleracion por GPU mediante ruedas CUDA de llama.cpp, pero no se especifica una GPU concreta.
- Se puede ejecutar en CPU con la rueda precompilada de llama.cpp, aunque el rendimiento dependera del modelo y del hardware.
- Opciones de despliegue: llama.cpp mediante `llama-cpp-python`; tambien se pueden configurar runtimes alternativos `ollama` o `openai-compatible`.
- La aplicacion requiere Python 3.11 a 3.13 y un servidor FastAPI en el puerto 7432.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables. ZEVORA es una aplicacion de agente y no puede compararse directamente con modelos de lenguaje como Qwen o Llama sin datos de evaluacion.

## Limitaciones y advertencias

- Este repositorio de Hugging Face no contiene pesos de modelo. Para usar ZEVORA es necesario descargar el modelo base Qwen3.8-Flash-Next en formato GGUF desde el repositorio upstream.
- La inferencia local depende de la disponibilidad de ruedas precompiladas de `llama-cpp-python` para la plataforma. En Windows sin rueda CUDA, se requiere instalar Visual C++ Build Tools y compilar desde el codigo fuente.
- La licencia MIT aplica al codigo de la aplicacion, pero no a los pesos del modelo base. La licencia del modelo Qwen3.8-Flash-Next no se especifica en la informacion proporcionada y debe consultarse en el repositorio upstream.
- El uso de proveedores cloud opcionales implica el envio de datos a terceros, lo que contradice la privacidad local si se activa el fallback.
- La longitud de contexto por defecto es de 8192 tokens, lo que puede ser insuficiente para tareas con documentos extensos si no se ajusta la variable `LOCAL_MODEL_CONTEXT_LENGTH`.
- Riesgo de alucinacion inherente a los modelos de lenguaje. El agente puede generar respuestas incorrectas, especialmente en razonamiento complejo.
- Las herramientas de terminal y sistema de archivos estan limitadas al espacio de trabajo del proyecto y requieren aprobacion, pero un uso inadecuado de la aprobacion puede provocar acciones no deseadas.
- No se han publicado evaluaciones de sesgos ni de seguridad especificas para esta aplicacion. Los sesgos del modelo base no estan documentados en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Dani12po/zevora
- Repositorio GitHub principal: https://github.com/dani12po/zevora
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Documentacion de modelos (referenciada en la model card): MODELS.md en el repositorio de GitHub
