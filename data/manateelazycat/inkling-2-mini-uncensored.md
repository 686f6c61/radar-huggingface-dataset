# manateelazycat/Inkling-2-Mini-Uncensored

## Resumen

Inkling-2-Mini-Uncensored es un ajuste fino del modelo Thinking Machines Inkling-2-Mini, un transformer de mezcla de expertos (MoE) con 26.388 millones de parametros totales y 3.400 millones de parametros activos por token. El modelo base acepta entrada de texto e imagen, tiene una ventana de contexto de 1 millon de tokens y emplea una arquitectura "looped": 24 capas en las que las 12 centrales (capas 6 a 17) se ejecutan tres veces por token con pesos compartidos, de modo que cada token realiza 48 visitas de capa. El ajuste lo publica manateelazycat bajo el paraguas de OpenUncensored el mismo dia del lanzamiento del modelo base.

La modificacion aplicada es una "abliteration" (ablacion direccional) que elimina las respuestas de rechazo del modelo original manteniendo, segun la model card, su rendimiento en MMLU (78,95% en el modelo base frente a 79,47% en esta version). Solo se han alterado 20 proyecciones de salida de atencion; los 128 expertos por capa, el codificador de vision y el especulador DSpark permanecen identicos byte a byte al checkpoint original. Esto hace que el modelo ocupe lo mismo que el original (unos 20 GB) y se ejecute en el mismo hardware, incluida una unica GPU de consumo o un DGX Spark.

Es relevante ahora porque demuestra que la ablacion direccional puede aplicarse con exito a arquitecturas MoE con capas repetidas sin destruir capacidades de razonamiento, y porque ofrece una via de inferencia sin GPU a traves de una API compatible con OpenAI. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas repetidas (looped transformer), 24 capas con las capas 6-17 ejecutadas 3 veces por token |
| Parametros totales | 26.388.646.440 (26,39 B) |
| Parametros activos | 3,4 B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Expertos enrutados en NVFP4 y MXFP8; resto de pesos en BF16; etiquetado como 8-bit y modelopt |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); tamano del repo 20,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 24 capas y 128 expertos por capa. Su rasgo diferencial es el bucle: las capas centrales (6 a 17) comparten pesos y se ejecutan tres veces por token, lo que produce 48 visitas de capa por token con solo 24 conjuntos de pesos. El checkpoint incluye un codificador de vision (entrada image-text-to-text) y un especulador DSpark para decodificacion especulativa. Los pesos de los expertos enrutados se almacenan en NVFP4 y MXFP8, mientras que el resto del modelo se guarda en BF16.

El ajuste de abliteracion se construyo calculando direcciones de rechazo a partir de la salida de cada una de las 48 visitas de capa en el ultimo token del prompt, usando 256 prompts daninos y 256 inocuos con esfuerzo de razonamiento 0 y 0,9. Se selecciono un subespacio de rechazo tardio (los dos primeros vectores singulares sobre las visitas 24 a 47) porque las direcciones calculadas sobre todas las visitas eliminaban los rechazos pero hacian que el modelo malinterpretara peticiones daninas como preguntas educativas genericas. La edicion se aplico unicamente a las proyecciones de salida de atencion (`attn.wo_ud`, en BF16) mediante `W' = W - s Q Qᵀ W` en las capas 4 a 23, con s = 4,0 en las capas 4, 5 y 18-23 y s = 2,5 en el nucleo del bucle (capas 6-17), mas suave porque la misma edicion actua tres veces por token. No se modificaron las down-projections del MoE: segun la model card, las ediciones en los expertos costaban de 4 a 6 puntos de MMLU y, al estar en NVFP4, la recodificacion introducia ruido de aproximadamente el doble del tamano de la edicion.

## Capacidades

- Generacion de texto conversacional en ingles, con modo chat y modo thinking (razonamiento separado en el campo `reasoning_content`).
- Entrada multimodal de imagen y texto (pipeline image-text-to-text).
- Tool calling y function calling, segun la model card.
- Razonamiento multi-paso y tareas de agente con contexto de hasta 1 millon de tokens.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` (valor `"none"` para respuestas cortas).
- Decodificacion especulativa mediante el especulador DSpark incluido en el checkpoint.
- Respuestas sin rechazo a peticiones que el modelo original denegaba, tanto en modo chat como en modo thinking.
- Capacidades multilingues limitadas al ingles segun los metadatos del modelo.

## Casos de uso

- Atencion al cliente automatizada: la ventana de 1 millon de tokens permite mantener el historial completo de una conversacion multi-turno o inyectar manuales de producto extensos sin truncar, y el modo `reasoning_effort: "none"` reduce la latencia en respuestas rutinarias.
- Analisis de documentacion tecnica con imagenes: al aceptar entrada image-text-to-text, puede procesar capturas de pantalla, diagramas de arquitectura o tablas escaneadas junto con texto de referencia en una misma peticion.
- Generacion de codigo y explicacion de vulnerabilidades: la model card ejemplifica el uso con una peticion de explicacion de inyeccion SQL con ejemplo funcional, un caso que el modelo base rechazaria; util en formacion en seguridad ofensiva y auditorias internas.
- Agentes de automatizacion con tool calling: el soporte de function calling y el contexto largo permiten encadenar llamadas a APIs y mantener el estado de la tarea a lo largo de sesiones extensas.
- Procesamiento por lotes de documentos largos: con 1M de tokens de contexto se pueden clasificar, resumir o extraer entidades de contratos o expedientes completos en una sola pasada, sin necesidad de troceado.
- Despliegue en hardware de gama de consumo: al ocupar unos 20 GB y mantener el formato del checkpoint original, puede ejecutarse en una unica GPU de consumo o en un DGX Spark, lo que facilita prototipado local sin infraestructura de datacenter.
- Evaluacion de seguridad y red teaming: sirve como modelo de referencia sin rechazos para probar clasificadores de contenido, filtros de salida y sistemas de moderacion frente a prompts adversarios.
- Inferencia sin GPU via API: la integracion con OpenUncensored (compatible con OpenAI) permite usar el modelo como `inkling-2-mini-uncensored` a 0,15 USD por millon de tokens de entrada y 0,60 USD por millon de salida.

## Benchmarks y rendimiento

Resultados publicados en la model card, con el mismo arnes para ambos modelos y decodificacion voraz sobre estos archivos exactos:

| Metrica | Inkling 2 Mini | Inkling 2 Mini Uncensored |
|---|---|---|
| Rechazos en 32 prompts daninos, modo chat | 32 | 0 |
| Rechazos en 32 prompts daninos, modo thinking (esfuerzo 0,9) | 32 | 0 |
| Rechazos en 80 prompts (32 daninos, 48 zona gris), modo chat | 68 | 8 |
| Respuestas completas y especificas a los 32 prompts daninos (juez LLM) | 0 | 21 |
| MMLU (57 materias x 20, 1.140 preguntas, logits de letra) | 78,95% | 79,47% |

Notas de la model card: de los 32 prompts en modo thinking, 29 terminaron el razonamiento en menos de 1.536 tokens y ninguno rechazo. De los 8 rechazos restantes en la prueba de 80 prompts, 7 son limites de conocimiento ("no puedo saber que pasa en tu cabeza", "no tengo acceso a los presupuestos de Tetrasoft") y el octavo, una peticion de autolesion, devuelve recursos de crisis. No se han medido tareas largas de agente ni benchmarks de codigo.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 20,2 GB; la inferencia en BF16 con expertos en NVFP4/MXFP8 requiere aproximadamente esa cifra mas el overhead de activaciones y cache KV, por lo que se recomienda un minimo de 24 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier GPU con 24 GB o mas. La model card indica que funciona en una unica GPU de consumo y en un DGX Spark.
- GPU de consumo compatibles: RTX 4090 (24 GB) y RTX 3090 (24 GB) son las opciones mas ajustadas; el soporte de NVFP4 requiere arquitectura Blackwell (serie RTX 50xx) para aprovechar el formato nativo, aunque el checkpoint puede cargarse en generaciones anteriores con conversion.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servido en produccion, llama.cpp/Ollama solo si se generan cuantizaciones GGUF adicionales (no incluidas en el repo). La API de OpenUncensored evita cualquier requisito de hardware.
- Latencia y throughput: no disponibles en la informacion proporcionada. El especulador DSpark incluido deberia reducir la latencia de decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-Uncensored | 26,39 B / 3,4 B | 1M tokens | Apache 2.0 | Abliterado, multimodal, tool calling, modo thinking |
| Inkling-2-Mini (base) | 26,39 B / 3,4 B | 1M tokens | Apache 2.0 | Mismo checkpoint sin abliterar; rechaza peticiones daninas (32/32) |
| Inkling-2-Mini-Uncensored LoRA | Adaptador rango 2 sobre el base | 1M tokens | Apache 2.0 | Misma edicion como adaptador de 1 MB aplicable al original |

No se dispone de datos en la informacion proporcionada para comparar con otras familias de modelos abliterados o con alternativas MoE de tamano similar. La model card remite a las clasificaciones de OpenUncensored para comparaciones con otros modelos sin censura.

## Limitaciones y advertencias

- Modelo abliterado: elimina deliberadamente los rechazos de seguridad, incluidos los de contenido danino, y puede generar respuestas a peticiones de autolesion, actividades ilegales o contenido peligroso. No es apto para despliegues publicos sin moderacion externa.
- La evaluacion de rechazos se basa en 32 a 80 prompts; la propia model card advierte que diferencias de unos pocos prompts deben tratarse como ruido.
- No se han medido tareas largas de agente ni benchmarks de codigo, por lo que el rendimiento en esos escenarios es desconocido.
- Riesgo de alucinacion no cuantificado; el modelo base es un modelo de 26 B con 3,4 B activos, con la precision que ello implica frente a modelos densos de mayor tamano.
- Idioma limitado al ingles segun los metadatos; no se declara soporte de castellano ni de otros idiomas.
- La ventana de 1M tokens no garantiza recuperacion fiable de informacion en posiciones intermedias; no se publican resultados de pruebas tipo needle-in-a-haystack.
- La edicion solo afecta a las proyecciones de salida de atencion en BF16; los expertos en NVFP4/MXFP8 no se han modificado, lo que limita el alcance del ajuste pero tambien implica que el comportamiento de los expertos sigue siendo el del modelo original.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el contenido generado ni sobre el cumplimiento normativo en jurisdicciones que regulan la generacion de contenido danino.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manateelazycat/Inkling-2-Mini-Uncensored
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- LoRA de la misma edicion: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored-LoRA
- API de inferencia: https://openuncensored.com/models/inkling-2-mini-uncensored
- Playground en navegador: https://openuncensored.com/chat?model=inkling-2-mini-uncensored
- Creditos y claves de API: https://openuncensored.com/credits
- Clasificaciones de modelos sin censura: https://openuncensored.com/rankings
