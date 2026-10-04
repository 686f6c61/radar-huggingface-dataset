# SmallAICreator/GRAFT-1B-Agentic

# GRAFT-1B-Agentic

## Resumen
GRAFT-1B-Agentic es un modelo de lenguaje de aproximadamente 1.180 millones de parametros desarrollado por SmallAICreator (UltraLabs) y publicado bajo licencia Apache-2.0. Se trata de un ajuste fino de GRAFT-1B orientado especificamente al uso de herramientas: ha sido entrenado con conversaciones de uso de herramientas en multiples pasos para que invoque funciones en el formato estandar `<tool_call>`, lea los resultados devueltos y continue el razonamiento a lo largo de varias etapas.

El modelo resuelve el problema del despliegue de agentes en entornos con recursos limitados: esta disenado para ejecutarse completamente offline tanto en la CPU de un portatil como en un telefono movil, sin necesidad de GPU ni de conexion a internet. Su ventana de contexto es de 4096 tokens, lo que acota su uso a tareas de un solo paso o cadenas cortas. El repositorio incluye ademas GRAFT Code, una aplicacion de agente de estilo CLI (Windows y Android) que aprovecha el modelo para operar sobre archivos, comandos, busqueda web y calculo.

Su relevancia actual radica en que demuestra que un modelo de ~1B puede adquirir capacidades de tool calling fiables mediante ajuste supervisado, un nicho tradicionalmente dominado por modelos mucho mayores. La model card reporta una mejora de 4/12 a 12/12 en la seleccion de la herramienta correcta frente a GRAFT-1B, con una puntuacion MMLU (5-shot) de 39,77.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (no especificada explicitamente en la model card; el modelo base GRAFT-1B deriva de Qwen3-1.7B segun la model card de GRAFT-1B) |
| Parametros totales | 1.180.101.632 (~1,18 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q6_K (GGUF); el repositorio solo lista Q6_K |
| Idiomas soportados | Ingles (etiqueta de idioma: en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (unico formato listado; safetensors no aparece en el repo) |

## Arquitectura y entrenamiento
GRAFT-1B-Agentic es un ajuste fino del modelo GRAFT-1B, que a su vez se obtuvo encogiendo Qwen3-1.7B mediante GRAFT, un metodo de reduccion de modelo sin gradientes y en forma cerrada desarrollado por UltraLabs. Segun la model card, el proceso completo de GRAFT-1B incluye una fase de curacion o "healing", destilacion y ajuste conversacional. Sobre esa base, la version Agentic anade aprendizaje supervisado (SFT) sobre conversaciones de uso de herramientas y de agente en multiples pasos, mezclado con datos de chat y de system-prompt para preservar su tono conversacional normal. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset.

La innovacion tecnica principal es el propio metodo GRAFT de reduccion de modelo sin gradientes, que permite comprimir un modelo mayor (Qwen3-1.7B) a ~1B parametros, combinado con un ajuste especifico para el formato de llamada a herramientas. El modelo utiliza una plantilla ChatML con soporte de herramientas integrada en el GGUF al estilo Qwen (`<tools>`, `<tool_call>`, `<tool_response>`) y esta preparado para alimentar los resultados de las herramientas como un turno de usuario envuelto en `<tool_response>`. La model card no detalla si hubo fases de RLHF o DPO adicionales.

## Capacidades
- Generacion de texto conversacional en ingles con modo chat.
- Tool calling y function calling en el formato estandar `<tool_call>`.
- Razonamiento de agente en varios pasos: lee los resultados de las herramientas y continua el flujo.
- Gestion de archivos: crear carpetas, escribir, leer, mover, renombrar, copiar y borrar archivos (a traves de GRAFT Code, con confirmacion del usuario).
- Ejecucion de comandos de shell (con confirmaciones y modo YOLO opcional).
- Busqueda web mediante DuckDuckGo (con Wikipedia como respaldo, sin clave de API).
- Lectura de paginas web de los resultados (lee aproximadamente los 2.500 caracteres mas relevantes de cada pagina).
- Ejecucion de codigo Python (empaquetado en Android).
- Calculo matematico exacto mediante una calculadora integrada.
- Conocimiento de la fecha y hora actuales.
- Soporte de system prompts: la model card reporta 20/24 en seguir reglas de system-prompt.
- Capacidad multilingue limitada: la model card reporta 10/10 al responder en el idioma del usuario, pero la etiqueta oficial de idioma del repositorio es unicamente ingles.
- Puente opcional con Claude Code (`graft-bridge`), que permite que GRAFT formule preguntas a Claude mediante la habilidad `talk_to_claude`.

## Casos de uso
- Asistente de codigo local tipo CLI: el modelo, integrado en GRAFT Code, interpreta peticiones en lenguaje natural y ejecuta acciones sobre el sistema de archivos (crear, mover, borrar) con confirmacion previa, lo que lo hace util en entornos de desarrollo sin conexion.
- Automatizacion de gestion de archivos en escritorio: renombrar lotes de archivos, reorganizar carpetas o limpiar directorios mediante instrucciones en texto plano, aprovechando su ajuste especifico para tool calling con rutas y argumentos.
- Agente de investigacion ligera sin API key: busqueda en DuckDuckGo y lectura de paginas con `fetch_page` para responder preguntas factuales actuales, manteniendo el modelo en local y enviando unicamente las palabras clave al buscador.
- Calculo y operaciones exactas: uso de la calculadora integrada para tareas aritmeticas donde la generacion libre del modelo seria poco fiable, evitando alucinaciones numericas.
- Ejecucion asistida de codigo Python en movil: en Android, el modelo puede generar y ejecutar fragmentos de Python empaquetados en la propia aplicacion, util para prototipado rapido en el telefono.
- Automatizacion de shell con supervision humana: lanzar comandos y leer honestamente sus errores, con confirmaciones por defecto y modo YOLO opcional, adecuado para tareas de mantenimiento controladas.
- Despliegue on-device con requisitos de privacidad: al ejecutarse offline en CPU de portatil o telefono, encaja en escenarios donde los datos no pueden salir del dispositivo.
- Prototipado de agentes en investigacion: por su tamano (~970 MB en Q6_K) y su soporte de plantilla con herramientas, sirve como banco de pruebas de bajo coste para pipelines de tool calling antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los unicos resultados disponibles son las comprobaciones internas publicadas por el autor en la model card:

| Comprobacion | GRAFT-1B | GRAFT-1B-Agentic |
|---|---|---|
| Elige la herramienta correcta (12 prompts) | 4/12 | 12/12 |
| Sigue reglas de system-prompt (24 comprobaciones) | 20/24 | 20/24 |
| Responde en el idioma del usuario (10) | 10/10 | 10/10 |
| MMLU (5-shot) | — | 39,77 |

No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible. Los datos de la tabla anterior son comprobaciones internas del autor, no evaluaciones de terceros.

## Requisitos de hardware
- Peso del modelo: el archivo `GRAFT-1B-agentic-Q6_K.gguf` ocupa aproximadamente 970 MB; el repositorio completo ocupa 1,7 GB.
- Inferencia en CPU: segun la model card, el modelo se ejecuta completamente offline en la CPU de un portatil o en un telefono movil, sin GPU.
- VRAM estimada: no disponible como dato oficial. Como referencia, el peso Q6_K (~970 MB) mas la cache KV para 4096 tokens de contexto se situa en el entorno de 1 a 2 GB en total (estimacion propia, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por su tamano, cualquier GPU de consumo moderna con al menos 2 GB de VRAM disponibles deberia poder alojarlo (estimacion propia, no confirmada).
- Compatibilidad con GPU de consumo: si, segun las estimaciones anteriores; el modelo esta disenado para CPU y movil.
- Opciones de despliegue confirmadas: llama.cpp, LM Studio, PocketPal y otras aplicaciones GGUF; ademas de la aplicacion GRAFT Code (Windows x64 y Android arm64), que incluye llama.cpp empaquetado (licencia MIT).
- Otras opciones (vLLM, TGI, Ollama): no confirmadas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos disponibles en la informacion proporcionada solo permiten comparar con GRAFT-1B y, de forma parcial, con Qwen3-1.7B (origen del proceso de reduccion).

| Modelo | Parametros | Contexto | MMLU (5-shot) | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GRAFT-1B-Agentic | ~1,18 B | 4096 tokens | 39,77 | Si, formato `<tool_call>` | Apache-2.0 | GGUF en HuggingFace |
| GRAFT-1B | ~1 B (no confirmado exactamente) | no disponible | no disponible | 4/12 en seleccion de herramienta | Apache-2.0 (no confirmada para este modelo) | HuggingFace |
| Qwen3-1.7B | 1,7 B (segun la model card de GRAFT-1B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otros modelos comparables de la misma categoria (por ejemplo, alternativas de ~1B orientadas a tool calling) en la informacion proporcionada, por lo que no se incluye una comparacion mas amplia.

## Limitaciones y advertencias
- Es un modelo de ~1B: la model card advierte que a veces inventa resultados en lugar de consultar una herramienta, puede copiar texto de ejemplo o invocar herramientas que no necesita.
- Razonamiento multietapa limitado: es debil en planes largos de varios pasos; se recomienda darle una tarea clara cada vez.
- Riesgo de alucinacion factual: los hechos pueden ser erroneos; la model card recomienda formular preguntas factuales en ingles y verificar cualquier dato importante.
- Idioma: la etiqueta oficial es unicamente ingles, aunque la model card reporta capacidad de responder en el idioma del usuario. No hay garantia de calidad en castellano.
- Sensibilidad al formato: las rutas deben darse con barras inclinadas (`/`) porque las barras invertidas de Windows dentro de JSON confunden al modelo; conviene describir brevemente cada argumento y evitar valores de ejemplo que el modelo pueda copiar.
- GRAFT Code ejecuta comandos reales en el equipo del usuario: se recomienda mantener activadas las confirmaciones salvo que se confie plenamente en la tarea.
- El ejecutable de Windows no esta firmado, por lo que puede aparecer una advertencia de SmartScreen.
- Licencia Apache-2.0: permite uso comercial; GRAFT Code incorpora llama.cpp bajo licencia MIT. No se detallan restricciones adicionales.
- Se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes de terceros.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/SmallAICreator/GRAFT-1B-Agentic
- Modelo base GRAFT-1B: https://huggingface.co/SmallAICreator/GRAFT-1B
- llama.cpp (empaquetado en GRAFT Code, licencia MIT): https://github.com/ggml-org/llama.cpp
- Listado de modelos de SmallAICreator: https://essamamdani.com/ai-models/company/smallaicreator
- Articulo sobre mejores modelos locales para codigo agentico (2026): https://www.kunalganglani.com/blog/best-local-model-agentic-coding
- Repositorio de arquitecturas agenticas de referencia: https://github.com/FareedKhan-dev/all-agentic-architectures
- Editor Graft (no relacionado directamente con el modelo): https://graftapp.io/
