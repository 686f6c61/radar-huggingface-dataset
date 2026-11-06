# fareld3v-hub/zydra

## Resumen

Zydra es un modelo de lenguaje publicado en Hugging Face por el usuario fareld3v-hub (identificado en la documentación del proyecto como Farel Alfareza). No se trata de un modelo entrenado desde cero, sino de una adaptación de Google Gemma 3 1B empaquetada junto con una infraestructura de servicio: un contenedor Docker que descarga el modelo base a través de Ollama, lo configura con el nombre `zydra` y expone una API HTTP compatible con el formato de OpenAI.

El problema que resuelve es fundamentalmente de despliegue: ofrece una forma reproducible de levantar un endpoint de chat con autenticación por API key, gestión de claves y documentación interactiva (Swagger en `/docs`) sobre un modelo pequeño y multilingüe. El peso del modelo base ronda los 806 MB, lo que lo sitúa en la categoría de modelos ligeros aptos para ejecución en CPU o GPUs de consumo.

La relevancia es limitada en términos de investigación: no hay información sobre fine-tuning, dataset adicional ni evaluación propia. Su interés práctico reside en el patrón de empaquetado (Ollama + Docker + API compatible OpenAI) más que en capacidades nuevas del modelo. La model card está redactada en indonesio y se centra casi por completo en instrucciones de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Google Gemma 3 1B) |
| Parametros totales | Aproximadamente 1B (modelo base Gemma 3 1B); no se especifica el recuento exacto |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el paquete Ollama descarga aproximadamente 806 MB, lo que sugiere cuantizacion por defecto del registro de Ollama |
| Idiomas soportados | Mas de 140 segun la model card, heredado de Gemma 3 1B; no se detalla la lista |
| Licencia | No disponible para los pesos; el codigo del repositorio se declara MIT en el badge, pero la licencia del modelo no se especifica |
| Formato de pesos | Distribucion via Ollama (modelo `gemma3:1b` + configuracion del proyecto); no se indica safetensors ni GGUF publicado en el Hub |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Google Gemma 3 1B, un transformer decoder-only de la familia Gemma 3. La model card no aporta detalles sobre el entrenamiento original ni sobre si Zydra aplica algún ajuste adicional (fine-tuning, system prompt embebido o Modelfile personalizado). El flujo descrito sugiere que el proceso de build descarga `gemma3:1b` mediante Ollama y crea un modelo derivado llamado `zydra` con configuración propia del proyecto; no se documenta ningún entrenamiento posterior.

No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas específicas de esta adaptación. Cualquier dato de arquitectura fina (atención, normalización, tokenizador) debe consultarse en la documentación oficial de Gemma 3 1B, no en esta ficha.

## Capacidades

- Generación de texto conversacional en más de 140 idiomas, según la model card (heredado de Gemma 3 1B).
- Respuesta a prompts de un solo turno mediante `POST /v1/prompt`, que devuelve directamente el campo `response`.
- Conversación multi-turno mediante `POST /v1/chat/completions` con formato compatible con la API de OpenAI (`messages` con roles).
- Endpoint alternativo `/api/chat` en GET y POST; el POST envía la clave en cabecera y el GET en query string.
- Gestión de API keys con formato `zdy-...` a través de la interfaz Swagger, protegida por una contraseña maestra (`AUTH`).
- Endpoints de salud y estado (`/health`, `/status`) sin autenticación, con indicador `model_ready`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Despliegue de un chatbot interno ligero: el contenedor Docker levanta Ollama, descarga el modelo base y expone un endpoint de chat con autenticación Bearer, adecuado para prototipos en una red interna sin depender de APIs externas.
- Pruebas de integración con SDKs compatibles con OpenAI: al respetar el esquema `/v1/chat/completions`, se puede apuntar un cliente existente al endpoint local cambiando únicamente la `base_url` y la clave.
- Entornos con recursos limitados: el modelo base de aproximadamente 806 MB permite ejecución en máquinas sin GPU dedicada, útil para demos en portátiles o servidores pequeños.
- Servicio multilingüe de bajo coste: la cobertura declarada de más de 140 idiomas permite respuestas en lenguas distintas del inglés sin cambiar de modelo, aunque la calidad por idioma no está evaluada.
- Empaquetado reproducible para equipos: el uso de `docker build`, volumen persistente (`zydra-data`) y `.env` facilita replicar el mismo entorno en distintas máquinas.
- Backend de pruebas para aplicaciones de chat: el endpoint `/v1/prompt` simplifica la integración en scripts y tests automatizados al devolver la respuesta en un único campo.
- Gestión de acceso en demos públicas: el sistema de API keys con prefijo `zdy-` y contraseña maestra permite repartir credenciales temporales a evaluadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño del paquete en Ollama es de aproximadamente 806 MB, lo que sugiere que la inferencia puede ejecutarse en CPU con RAM modesta o en GPUs de consumo con pocos GB de VRAM.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo base, cabría en GPUs de consumo (gama RTX xx60/xx70 y superiores), pero no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del modelo base; sin datos verificados en la información proporcionada.
- Opciones de despliegue: Docker (obligatorio según la model card), Ollama como motor de inferencia, y API HTTP propia compatible con OpenAI. No se mencionan vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: se recomienda espacio adicional para Ollama y datos de la aplicación, además del volumen `zydra-data`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Zydra | ~1B (base Gemma 3 1B) | No disponible | No disponible (codigo MIT declarado en badge) | Docker + Ollama + API OpenAI-compatible | Adaptacion con infraestructura de servicio propia |
| Google Gemma 3 1B | ~1B | No disponible en esta ficha | Terminos de Gemma | Ollama, transformers, llama.cpp | Modelo base original; sin capa de API ni gestion de claves |
| Qwen2.5 1.5B | ~1.5B | No disponible en esta ficha | Apache 2.0 (segun publicacion original) | Multiples runtimes | Alternativa de tamano similar con licencia permisiva |
| Llama 3.2 1B | ~1B | No disponible en esta ficha | Licencia comunitaria Llama | Multiples runtimes | Alternativa ligera de Meta |

La comparación se limita a parámetros y disponibilidad; no hay datos de rendimiento de Zydra que permitan contrastar calidad.

## Limitaciones y advertencias

- No hay información sobre fine-tuning ni evaluación: el modelo parece ser Gemma 3 1B servido con una configuración propia, sin garantías de comportamiento específico.
- Licencia ambigua: el badge declara MIT para el código, pero la licencia de los pesos no se especifica; para uso comercial debe verificarse la licencia de Gemma 3 1B y los términos del repositorio.
- Riesgo de alucinación inherente a un modelo de ~1B parámetros, especialmente en tareas de razonamiento, matemáticas o conocimiento factual extenso.
- Longitud de contexto no documentada en esta ficha; no debe asumirse una ventana amplia para conversaciones largas.
- La cobertura de más de 140 idiomas es una afirmación heredada del modelo base; no hay evaluación de calidad por idioma en esta adaptación.
- El sistema de autenticación depende de una contraseña maestra en `.env`; el propio autor advierte de no commitear ese archivo y de usar POST con cabecera en lugar de GET con query string para no filtrar claves en logs.
- El proyecto está orientado a despliegue y demo; no se documentan garantías de escalado, tolerancia a fallos ni observabilidad en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fareld3v-hub/zydra
- Repositorio GitHub del proyecto: https://github.com/fareldev-hub/ZydraModel
- Modelo base en Ollama: https://ollama.com/library/gemma3:1b
- Docker: https://www.docker.com/
- Licencia del código (según badge): https://github.com/fareldev-hub/ZydraModel/blob/main/LICENSE
