# harshbhalodia/loonie-guru-gguf

## Resumen

Loonie Guru v1 (GGUF) es la version cuantizada en formato GGUF del modelo Loonie Guru, un ajuste fino de Qwen3-VL-4B-Instruct desarrollado por harshbhalodia para la aplicacion de finanzas personales Loonie. El modelo esta disenado para ejecutarse localmente en el ordenador del usuario mediante llama.cpp, de modo que los datos financieros personales nunca abandonan el dispositivo. Resuelve tareas concretas dentro de la app: enrutamiento de mensajes a herramientas (tool calling), respuestas rapidas basadas en hechos y calculos que la app le proporciona, investigacion sobre listas de seguimiento y analisis de extractos bancarios, incluyendo paginas escaneadas gracias al proyector de vision.

Arquitectonicamente hereda la estructura de Qwen3-VL-4B-Instruct, un transformer multimodal de aproximadamente 4.022 millones de parametros (4B), con capacidades de vision integradas mediante un proyector multimodal separado en el repositorio (`loonie-guru-mmproj.gguf`). El ajuste se realizo con LoRA (rank 32, alpha 32) sobre datos sinteticos generados en el formato exacto de prompts de la app, con 11.046 filas de entrenamiento y 964 de validacion.

Es relevante ahora porque representa un ejemplo de modelo pequeno, especializado y desplegable en local para un dominio regulado (finanzas personales), con un mecanismo de verificacion criptografica de releases (firma Ed25519 del manifiesto y comprobacion de sha256 por fichero). No obstante, sus capacidades fuera de los prompts de Loonie son las de un asistente general Qwen3-VL-4B-Instruct, y el propio autor advierte que no ofrece asesoramiento financiero regulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-4B-Instruct), ajuste fino con LoRA |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (valor usado en el comando de ejemplo de llama-server con `-c 65536`) |
| Tipos de cuantizacion | Q4_K_M (unico fichero de modelo publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`loonie-guru-Q4_K_M.gguf` 2,50 GB; `loonie-guru-mmproj.gguf` 0,84 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-VL-4B-Instruct` (entrenado desde `unsloth/Qwen3-VL-4B-Instruct`) y se ajusta con LoRA de rango 32 y alpha 32, una epoca y tasa de aprendizaje 0,0001, usando Unsloth. La arquitectura subyacente es la de Qwen3-VL, un transformer con capacidades multimodales (texto e imagen) que en este repositorio se distribuye en dos ficheros GGUF: los pesos del modelo y un proyector multimodal separado para el procesamiento de imagenes.

Los datos de entrenamiento son exclusivamente sinteticos: las tareas se generan en el formato exacto de prompt de la app Loonie y las respuestas provienen de un modelo profesor de mayor tamano o son correctas por construccion, pasando todas por las mismas comprobaciones automaticas que aplica la app. El conjunto consta de 11.046 filas de entrenamiento y 964 de validacion, sin datos personales de usuarios de Loonie. No se menciona en la informacion disponible el uso de RLHF o DPO; el ajuste descrito es supervisado mediante LoRA. El repositorio incluye un manifiesto (`loonie-manifest.json`) con firma Ed25519 y verificacion de tamano y sha256 por fichero, lo que constituye un mecanismo de integridad de la distribucion mas que una innovacion arquitectonica.

## Capacidades

- Tool calling: transforma un mensaje del usuario en el JSON de enrutamiento de la app (accion, herramienta y argumentos), rechaza peticiones inseguras y solicita aclaracion cuando el mensaje es ambiguo.
- Respuestas rapidas y consejos: genera respuestas breves y fundamentadas a partir de hechos y calculos que la app le entrega; la app realiza todos los calculos y el modelo solo los explica.
- Investigacion: revisa una lista de seguimiento y temas de investigacion frente a objetivos y ahorros del usuario.
- Analisis de extractos: convierte paginas de extractos bancarios y de tarjetas de credito en transacciones, incluyendo paginas escaneadas mediante el proyector de vision.
- Capacidades generales heredadas de Qwen3-VL-4B-Instruct: generacion de texto, razonamiento, codigo, matematicas y vision, aunque el autor indica que fuera de los prompts de Loonie se comporta como un asistente general con estos habitos.
- Multilingue: limitado al ingles segun la model card (`language: en`).
- Modo thinking, audio y otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutamiento de acciones en una app financiera: el modelo recibe el mensaje del usuario y devuelve un JSON con la accion, herramienta y argumentos que la app debe ejecutar; es adecuado porque fue entrenado especificamente en ese formato y evaluado en la pista `tool_calling` con 0,8775 de puntuacion.
- Asistente conversacional de finanzas personales en local: al ejecutarse con llama.cpp en el ordenador del usuario, permite responder preguntas sobre sus finanzas sin enviar datos a la nube, lo que encaja con requisitos de privacidad en un dominio sensible.
- Digitalizacion de extractos bancarios: procesa paginas de extractos, incluidas imagenes escaneadas via el proyector multimodal, para extraer transacciones; la pista `documents` obtiene 0,9985, lo que lo hace idoneo para esta tarea concreta.
- Explicacion de calculos financieros: la app calcula y el modelo redacta la explicacion de forma breve y anclada a los hechos proporcionados, reduciendo el riesgo de cifras inventadas.
- Revision de listas de seguimiento e investigacion de inversiones: contrasta temas de investigacion con objetivos y ahorros del usuario; conviene tener en cuenta que la pista `research` solo alcanza 0,2667, por lo que este caso requiere supervision adicional.
- Prototipado de asistentes de dominio con Qwen3-VL-4B: sirve como referencia de ajuste fino con LoRA y Unsloth sobre un modelo de 4B, y como ejemplo de distribucion GGUF verificada criptograficamente para despliegues de escritorio.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto congelado `v1` de Loonie (perfiles y extractos sinteticos, nunca usados en entrenamiento). Puntuacion global: 0,8238.

| Pista | Puntuacion | Tasa de aprobados | Items |
|---|---|---|---|
| advisor | 0,8866 | 0,755 | 200 |
| documents | 0,9985 | 0,9733 | 150 |
| quick_answer | 0,7499 | 0,5667 | 150 |
| research | 0,2667 | 0,02 | 100 |
| tool_calling | 0,8775 | 0,7775 | 400 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en total con la cuantizacion Q4_K_M (2,50 GB del modelo mas 0,84 GB del proyector multimodal), mas la memoria del contexto KV.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM; tambien puede ejecutarse en CPU mediante llama.cpp.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; el modelo es de 4B y la cuantizacion Q4_K_M es ligera.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de plantillas Jinja (`--jinja`) y contexto configurable (`-c 65536`). Otros motores compatibles con GGUF no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Loonie Guru v1 (GGUF) | 4B | 65.536 tokens | Apache 2.0 | GGUF Q4_K_M | Ajuste especializado en finanzas personales y tool calling; evaluacion propia sobre conjunto de Loonie |
| Qwen3-VL-4B-Instruct | 4B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors (modelo base) | Modelo base multimodal sin ajuste de dominio |
| Alternativas de 4B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo esta ajustado para los prompts y comprobaciones propios de Loonie; fuera de ese contexto se comporta como un Qwen3-VL-4B-Instruct general y puede no seguir el formato de enrutamiento esperado.
- No proporciona asesoramiento financiero regulado; el autor lo advierte explicitamente. Cualquier uso en produccion debe mantener la verificacion de respuestas contra los registros del usuario que aplica la app.
- Rendimiento bajo en la pista `research` (0,2667 de puntuacion, 0,02 de tasa de aprobados), lo que indica limitaciones claras en tareas de investigacion y contraste de objetivos.
- Tasa de aprobados moderada en `quick_answer` (0,5667), por lo que las respuestas rapidas requieren validacion adicional.
- Idioma: solo ingles segun la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Datos de entrenamiento exclusivamente sinteticos: pueden existir sesgos derivados del modelo profesor y de la generacion sintetica, aunque no se detallan sesgos conocidos en la informacion disponible.
- Riesgo de alucinacion inherente a un modelo de 4B; la app mitiga parte del riesgo calculando ella misma y verificando cada respuesta contra los registros del usuario.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de modificacion respecto a Qwen3-VL-4B-Instruct (ver `LICENSE` y `NOTICE`).
- Solo se publica una cuantizacion (Q4_K_M); no hay variantes de mayor o menor precision en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion muy limitada y poca validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/harshbhalodia/loonie-guru-gguf
- Modelo base del ajuste: https://huggingface.co/harshbhalodia/loonie-guru
- Modelo original: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Version usada para el entrenamiento: https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
- Papers, blogs y demos adicionales: no disponible en la informacion proporcionada.
