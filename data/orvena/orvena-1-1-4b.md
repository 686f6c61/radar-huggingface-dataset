# Orvena/Orvena-1.1-4B

## Resumen

Orvena 1.1 4B es un modelo de lenguaje multimodal (texto e imagen) afinado por Orvena a partir de Qwen/Qwen3.5-4B. Es el motor que impulsa la aplicacion Orvena, un asistente privado que se ejecuta en el iPhone, y esta especializado en tareas de agente sobre el dispositivo: lectura de calendario, creacion de alarmas y recordatorios, busqueda de lugares y calculo de rutas, busqueda web y operaciones sobre servicios conectados mediante MCP (Notion, Todoist, Airtable, Gmail, entre otros).

El modelo conserva la arquitectura de su base: 24 capas Gated DeltaNet, 8 capas de atencion completa y un codificador de vision, con 4.659.865.088 parametros totales (aproximadamente 4,66 mil millones). Se entrena con pensamiento desactivado por defecto para mantener la latencia baja en un telefono, y cubre 30 idiomas. Su relevancia actual radica en que demuestra un ciclo completo de destilacion y aprendizaje por refuerzo sobre un modelo pequeno orientado a agentes, con un banco de evaluacion publico de 547 escenarios en 30 idiomas.

La version 1.1 anade un ciclo de recompensa sobre el bucle de agente real de Orvena, con penalizacion por pasos extra y llamadas repetidas o fallidas, ademas de una cabeza de prediccion multi-token reentrenada que acepta el 93,5% de los tokens propuestos en 400 rondas reservadas. La licencia es Apache 2.0 y los pesos se publican en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 24 capas Gated DeltaNet + 8 capas de atencion completa, con codificador de vision (heredada de Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 en este repositorio; build MLX 4-bit publicada aparte (Orvena/Orvena-1.1-4B-MLX-4bit) |
| Idiomas soportados | 30: bg, cs, da, de, el, en, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), biblioteca transformers |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de Qwen3.5-4B: una mezcla de capas Gated DeltaNet (atencion lineal con estado recurrente) y capas de atencion completa, junto con el codificador de vision del modelo base. Sobre esa base se entreno un adaptador LoRA de rango 16 y alpha 320 aplicado a las 248 capas lineales del modelo de lenguaje, en dos fases, y se fusiono en los pesos publicados. La cabeza de prediccion multi-token se reentreno sobre las propias salidas del modelo.

La primera fase, supervisada, parte de 4.806 escenarios de entrenamiento ejecutados ocho veces cada uno por Orvena 4B en un iPhone simulado que expone el catalogo real de herramientas y servidores MCP de doce servicios. Se conservo el intento mas corto que supero todas las comprobaciones sin llamadas repetidas ni rechazadas, lo que produjo 4.005 trayectorias propias mas 386 del conjunto de entrenamiento de Orvena 4B. Se anadieron 3.822 respuestas generales del modelo base (prompts tipo IFEval de argilla/ifeval-like-data, problemas de GSM8K traducidos a 35 idiomas y prompts del dataset Aya) para preservar el seguimiento de formato y el razonamiento matematico multilingue.

La segunda fase aplica un gradiente de politica relativo al grupo (GRPO) sobre el bucle de agente real: 32 escenarios por iteracion, ocho intentos cada uno, con recompensa de 1 al superar las comprobaciones y penalizacion por cada ronda extra de herramientas, llamada repetida o llamada rota. Se ejecutaron 100 iteraciones iniciales y 25 adicionales centradas en preguntas web cuya respuesta esta en la pagina. Todo el entrenamiento se hizo con el modo de pensamiento desactivado.

## Capacidades

- Generacion de texto conversacional multi-turno en 30 idiomas, con respuestas sin paso de pensamiento separado.
- Razonamiento y resolucion de problemas matematicos, reforzado con problemas de GSM8K traducidos a 35 idiomas.
- Seguimiento de instrucciones de formato, entrenado con prompts tipo IFEval.
- Comprension de imagenes gracias al codificador de vision heredado del modelo base (pipeline image-text-to-text).
- Llamada a herramientas y function calling sobre un catalogo real de acciones de telefono.
- Ejecucion de tareas de agente multi-paso con servidores MCP (Notion, Todoist, Airtable, Gmail y otros servicios).
- Capacidad de pedir aclaracion cuando la peticion carece de un dato necesario.
- Capacidad de declinar y no invocar herramientas cuando ninguna encaja con la peticion.
- Busqueda web y lectura de una pagina cuando los fragmentos de busqueda no contienen la respuesta.
- Decodificacion especulativa mediante cabeza de prediccion multi-token reentrenada (93,5% de aceptacion en 400 rondas reservadas).
- Optimizado para inferencia en dispositivo (iPhone), con build MLX 4-bit disponible.

## Casos de uso

- Asistente personal en iPhone: el modelo gestiona de forma nativa calendario, alarmas, recordatorios y rutas dentro de la aplicacion Orvena, con respuestas sin paso de pensamiento para minimizar la latencia en movil.
- Automatizacion de productividad via MCP: puede crear tareas en Todoist, registrar entradas en Notion o consultar bases de Airtable invocando las herramientas de cada servicio con los argumentos correctos.
- Gestion de correo asistida: con el conector de Gmail, el modelo puede localizar mensajes, resumir hilos y ejecutar acciones sobre ellos dentro de un flujo de agente multi-paso.
- Agente de busqueda web con lectura de pagina: cuando los fragmentos de busqueda no bastan, el modelo decide abrir la pagina y extraer la respuesta, comportamiento reforzado explicitamente en la fase de recompensa.
- Asistente multilingue para mercados europeos y asiaticos: cubre 30 idiomas (incluido espanol) tanto en la comprension de la peticion como en la respuesta, con verificacion de idioma en el banco de evaluacion.
- Atencion al cliente con function calling: su entrenamiento en pedir aclaraciones y en rechazar herramientas inadecuadas lo hace apto para flujos donde una llamada erronea tiene coste, como reservas o consultas de cuentas.
- Despliegue en dispositivo con cuantizacion MLX 4-bit: integrable en aplicaciones iOS que requieran privacidad de datos, ya que la inferencia ocurre localmente sin enviar contexto a un servidor.
- Evaluacion de agentes en CI: el banco publico Orvena/orvena-bench (547 escenarios, 30 idiomas) permite medir regresiones de modelos de agente sobre un catalogo de herramientas realista.

## Benchmarks y rendimiento

La model card describe el banco Orvena bench (547 escenarios reservados en 30 idiomas, ejecutados en el bucle de agente de Orvena sobre datos de telefono simulados y servidores MCP) y menciona comparaciones con Nemotron 3.5 Bolt-E4B, Granite 4.2 3B, MiniCPM5-2B, Gemma 4 E4B y LFM2.5-2.6B servidos en vLLM 0.33.0 sobre una NVIDIA H100. Sin embargo, la informacion proporcionada no incluye los valores numericos de esos resultados.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 12-16 GB para contexto corto.
- VRAM estimada con cuantizacion 4-bit (build MLX): en torno a 2,5-3 GB para pesos, adecuada para dispositivos con memoria unificada limitada.
- GPU recomendadas para servicio en produccion: NVIDIA H100 o A100 para bf16 a plena precision; RTX 4090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas en bf16 con contexto reducido, y en tarjetas de 8 GB con cuantizacion 4-bit.
- Despliegue en dispositivo: build MLX 4-bit para iPhone (Orvena/Orvena-1.1-4B-MLX-4bit), que es la que descarga la aplicacion.
- Opciones de despliegue en servidor: vLLM (usado por el autor en la evaluacion, version 0.33.0), transformers; llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible. La model card justifica el modo sin pensamiento para "mantenerlo rapido en un telefono", pero no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Orvena 1.1 4B | 4,66 B | no disponible | Apache 2.0 | Agente de telefono, MCP, multimodal, 30 idiomas | Hugging Face (bf16 y MLX 4-bit) |
| Qwen3.5-4B (base) | 4 B (aproximado) | no disponible | no disponible en la informacion | Modelo general multimodal | Hugging Face |
| Orvena 4B (predecesor) | no disponible | no disponible | no disponible en la informacion | Agente de telefono, predecesor directo | Hugging Face |
| Gemma 4 E4B | no disponible | no disponible | no disponible en la informacion | Modelo general, comparado con pensamiento desactivado | No disponible en la informacion |
| Granite 4.2 3B | 3 B (aproximado) | no disponible | no disponible en la informacion | Modelo general, comparado con pensamiento activado | No disponible en la informacion |
| MiniCPM5-2B | 2 B (aproximado) | no disponible | no disponible en la informacion | Modelo pequeno general, comparado con pensamiento activado | No disponible en la informacion |

Los modelos comparados aparecen en la model card como referencias de evaluacion, pero la informacion proporcionada no incluye sus resultados numericos ni sus especificaciones completas.

## Limitaciones y advertencias

- El modelo esta afinado especificamente para el catalogo de herramientas y el bucle de agente de Orvena; su rendimiento en otros entornos de function calling puede degradarse.
- Entrenado con pensamiento desactivado: pasar `enable_thinking=True` activa un modo no optimizado durante el entrenamiento, con comportamiento no evaluado en la informacion disponible.
- No se publican datos de sesgos. Al derivar de Qwen3.5-4B y de datos sinteticos generados por otro modelo (Orvena 4B), puede heredar sesgos del profesor y del dataset Aya.
- Riesgo de alucinacion en respuestas web: la fase de recompensa ensena a responder a partir de fragmentos de busqueda, lo que puede producir respuestas plausibles pero no verificadas si el fragmento es ambiguo.
- La longitud de contexto no se especifica en la informacion proporcionada, lo que impide planificar despliegues con documentos largos.
- El banco de evaluacion es propiedad del autor y esta ligado a su simulador de telefono; los resultados no son directamente comparables con benchmarks academicos estandar.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base Qwen3.5-4B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- El modelo tiene 4,66 B de parametros, no 4 B exactos; los calculos de memoria deben usar la cifra real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Orvena/Orvena-1.1-4B
- Build MLX 4-bit: https://huggingface.co/Orvena/Orvena-1.1-4B-MLX-4bit
- Modelo predecesor: https://huggingface.co/Orvena/Orvena-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Informe tecnico: Orvena-1.1-4B-technical-report.pdf (en el repositorio del modelo)
- Banco de evaluacion: https://huggingface.co/datasets/Orvena/orvena-bench
- Dataset IFEval-like: https://huggingface.co/datasets/argilla/ifeval-like-data
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Aplicacion Orvena: https://orvena.app
- Licencia: https://huggingface.co/Orvena/Orvena-1.1-4B/blob/main/LICENSE
