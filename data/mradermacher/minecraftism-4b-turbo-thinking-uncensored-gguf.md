# mradermacher/Minecraftism-4B-Turbo-Thinking-Uncensored-GGUF

## Resumen

Minecraftism-4B-Turbo-Thinking-Uncensored es un modelo de lenguaje de 4.022 millones de parametros (4B) afinado especificamente para actuar como agente en el videojuego Minecraft. Lo desarrolla el usuario mr-sus y esta disponible en formato GGUF a traves de mradermacher, conocido por publicar cuantizaciones estaticas de modelos populares. El modelo parte de Qwen3 (segun los tags de la model card) y ha sido entrenado con Unsloth, lo que sugiere un pipeline de fine-tuning eficiente en memoria.

La propuesta del modelo es doble: por un lado, un enfoque de "game agent" orientado a tareas dentro de Minecraft (construccion, recoleccion, navegacion, crafting), y por otro, un modo de razonamiento explicito ("thinking") combinado con una variante "uncensored/abliterated" que elimina los rechazos de seguridad del modelo base. Esto lo situa en un nicho muy concreto: investigacion sobre agentes autonomos en entornos de juego y experimentacion con modelos sin filtros.

Es relevante ahora porque los agentes LLM aplicados a videojuegos y entornos simulados son una linea activa de investigacion, y este modelo ofrece una alternativa pequena (4B) que puede ejecutarse en hardware de consumo, algo critico para iterar rapido en pipelines de agente. La licencia Polyform Noncommercial 1.0.0 restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3 (segun tags de la model card) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | polyform-noncommercial-1.0.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4B parametros derivado de Qwen3, segun indican los tags de la model card. Ha sido afinado mediante Unsloth sobre el modelo base mr-sus/Minecraftism-4B-Turbo-Thinking-Uncensored, que a su vez parece ser un fine-tune especializado en Minecraft con modo de razonamiento ("thinking") y una variante abliterated (sin rechazos de seguridad). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

La innovacion principal es la combinacion de tres caracteristicas en un modelo pequeno: (1) especializacion en un dominio concreto (Minecraft, con tags como pymc-bot y game-agent), (2) modo de razonamiento explicito, y (3) abliteration, que elimina la capa de rechazo del modelo original. El hecho de que exista una version GGUF con 12 cuantizaciones distintas facilita su despliegue en entornos con recursos limitados.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" explicito (el modelo puede exponer su cadena de razonamiento antes de responder).
- Especializacion en tareas de agente dentro de Minecraft: interpretacion de estado del juego, planificacion de acciones, crafting, navegacion y construccion.
- Integracion con pymc-bot (tag de la model card), lo que sugiere soporte para controlar un bot de Minecraft mediante comandos.
- Capacidad conversacional multi-turno (tag "conversational").
- Modelo "uncensored/abliterated": no aplica rechazos de seguridad, lo que permite generar contenido que el modelo base rechazaria.
- Capacidades multilingues limitadas al ingles segun la model card (language: en).
- No se documenta soporte de tool calling generico, vision, audio ni function calling fuera del contexto de Minecraft.

## Casos de uso

- Agente autonomo en Minecraft para investigacion: el modelo puede conectarse a un bot (pymc-bot) y recibir el estado del juego para planificar acciones como talar arboles, construir refugios o craftear herramientas. Su tamano de 4B permite ejecutarlo en una GPU de consumo mientras se itera el bucle de agente.
- Experimentacion con razonamiento explicito en agentes: el modo "thinking" permite depurar por que el agente tomo una decision, util para analizar fallos en tareas de planificacion multi-paso.
- Investigacion sobre abliteration y seguridad: al ser una variante sin rechazos, sirve para estudiar como afecta la eliminacion de la capa de seguridad al comportamiento del agente y a la calidad del razonamiento.
- Prototipado de mods o asistentes in-game: un desarrollador puede integrar el modelo en un mod de Minecraft que ofrezca un companero controlado por IA, con respuestas en ingles y contexto de juego.
- Evaluacion de cuantizaciones en agentes: el repo ofrece 12 cuantizaciones (desde Q2_K de 1,8 GB hasta f16 de 8,2 GB), lo que permite medir el impacto de la compresion en la calidad de las decisiones del agente.
- Educacion y demos de LLM en videojuegos: por su tamano reducido y su licencia no comercial, es adecuado para talleres, cursos y demos donde se muestre como un LLM controla un personaje.
- Benchmarking de fine-tunes especializados: util como referencia para comparar fine-tunes de dominio (Minecraft) frente a modelos generalistas del mismo tamano en tareas de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con cuantizaciones Q4 (Q4_K_S 2,5 GB, Q4_K_M 2,6 GB), 3-4 GB con Q5/Q6, 4,4 GB con Q8_0 y 8,2 GB con f16 (mas overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput. Tambien puede ejecutarse en CPU con llama.cpp.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas usando Q4_K_M. En GPUs integradas o sistemas con poca RAM puede requerir cuantizaciones Q2/Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF (el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda llama.cpp para produccion ligera.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano (4B) y las cuantizaciones Q4, se espera un throughput alto en GPU de consumo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Minecraftism-4B-Turbo-Thinking-Uncensored (este) | 4,02B | no disponible | Polyform Noncommercial 1.0.0 | GGUF, safetensors | Fine-tune de Minecraft, thinking, abliterated |
| Qwen3-4B (base probable) | ~4B | no disponible en esta ficha | Apache 2.0 (segun Qwen) | safetensors, GGUF | Modelo generalista con modo thinking; no especializado en juegos |
| Alternativas de agente para Minecraft | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

No se dispone de informacion sobre benchmarks comparativos ni de otros modelos especializados en Minecraft con los que contrastar rendimiento.

## Limitaciones y advertencias

- Licencia Polyform Noncommercial 1.0.0: prohibido el uso comercial sin licencia adicional. Cualquier producto, servicio o despliegue con fines de lucro requiere autorizacion expresa.
- Modelo abliterated/uncensored: no aplica rechazos de seguridad, por lo que puede generar contenido ofensivo, ilegal o peligroso. No apto para entornos de produccion abiertos al publico sin moderacion adicional.
- Especializacion estrecha: el fine-tune esta orientado a Minecraft; su rendimiento en tareas generales de texto, codigo o matematicas probablemente sea inferior al de Qwen3-4B original, aunque no hay datos que lo confirmen.
- Idioma: solo ingles segun la model card; el rendimiento en castellano no esta documentado y probablemente sea limitado.
- Riesgo de alucinacion: como todo LLM, puede inventar acciones, recetas o estados del juego; en un agente autonomo esto puede provocar bucles o acciones invalidas.
- Contexto: no se documenta la longitud de contexto, lo que dificulta planificar tareas de agente que requieran memoria larga del estado del juego.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que desaconseja su uso en produccion sin evaluacion propia.
- Modelo pequeno (4B): capacidad limitada para razonamiento complejo multi-paso en comparacion con modelos de 30B o superiores.
- Repositorio de 36,4 GB: incluye todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Minecraftism-4B-Turbo-Thinking-Uncensored-GGUF
- Modelo base: https://huggingface.co/mr-sus/Minecraftism-4B-Turbo-Thinking-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Minecraftism-4B-Turbo-Thinking-Uncensored-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Minecraftism-4B-Turbo-Thinking-Uncensored-GGUF
- Licencia Polyform Noncommercial 1.0.0: https://polyformproject.org/licenses/noncommercial/1.0.0/
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
