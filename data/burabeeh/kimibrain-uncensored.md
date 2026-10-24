# burabeeh/Kimibrain-Uncensored

## Resumen

Kimibrain Uncensored es un modelo de lenguaje de tipo mixture-of-experts (MoE) con 34,7 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, desarrollado por Burabeeh Lab (fundado por Mohammed Al Marzooqi, Emiratos Árabes Unidos). Se distribuye como build oficial en GGUF para llama.cpp, Ollama y LM Studio, con un proyector visual opcional (`mmproj`) que permite entrada de imágenes además de texto. Según la model card, está entrenado desde cero bajo el pipeline propio del laboratorio y no deriva de ninguna familia open-weight existente, aunque el propio autor reconoce que las trazas de razonamiento pueden nombrar familias de modelos upstream (véase la sección de limitaciones).

El modelo se posiciona en tres ejes: comportamiento "uncensored" (tasas de rechazo mínimas en peticiones legales de tipo creativo, técnico o de investigación), una identidad fijada en la plantilla de chat ("Kimibrain, by Burabeeh Lab") que persiste incluso si la aplicación inyecta su propio mensaje de sistema, y un modo de razonamiento largo (`think: true` en Ollama) expuesto como campo separado para que la interfaz pueda ocultarlo o mostrarlo. A esto se suman visión mediante proyector y una ventana de contexto declarada de hasta 262.144 tokens, aunque la receta de servicio publicada usa 131.072 para mantener el consumo de VRAM/RAM manejable en una estación de trabajo.

Su relevancia práctica es doble: por un lado, ofrece un MoE de ~3B activos con capacidades multimodales y contexto muy largo, un perfil atractivo para despliegue on-premise con hardware modesto; por otro, la licencia Apache 2.0 permite uso comercial y redistribución de los pesos. Con 33 descargas y 0 likes en el momento de la consulta, la adopción pública es todavía muy baja, por lo que cualquier evaluación en producción debería hacerse con validación propia antes de depender de él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), 256 expertos con 8 activos por token; visión mediante proyector `mmproj` opcional |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | 262.144 tokens (entrenado y servido); 131.072 tokens en la receta de Ollama incluida |
| Tipos de cuantizacion | Q4_K_M calibrada con imatrix (19,7 GiB) en el build publicado; proyector en F16 (0,9 GiB); no se detallan otros niveles en la informacion disponible |
| Idiomas soportados | en, ar, zh, fr, es, de, hi, ja, ko, ru (con refuerzo declarado en arabe) |
| Licencia | Apache 2.0 (sin cesion de derechos de marca sobre "Kimibrain" ni "Burabeeh Lab") |
| Formato de pesos | GGUF (llama.cpp); el repositorio incluye tambien safetensors segun los metadatos de parametros |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos dispersa: 256 expertos en total y 8 activos por token, lo que da unos 3.000 millones de parametros activos sobre un total de 34,7 mil millones. Ese ratio de activacion (en torno al 8,6 % del total) es lo que explica que el build Q4_K_M ocupe 19,7 GiB en disco pero solo movilice una fraccion de los pesos por cada token generado, con el ahorro de computo correspondiente frente a un modelo denso del mismo tamano. La model card no detalla numero de capas, dimension oculta ni configuracion de atencion, datos necesarios para estimar con precision el coste de la cache KV a 131.072 tokens.

En cuanto al entrenamiento, el autor declara que se trata de un LLM puro desarrollado de forma independiente, con todos los tensores entrenados desde cero bajo su pipeline propietario, y que las modificaciones de esta release se limitan al nombre del modelo (`general.name`), la plantilla de chat (que codifica la identidad y el perfil de servicio), la propia model card y los Modelfiles de Ollama. Afirma explicitamente que no se realizo pre-entrenamiento adicional, fine-tuning ni optimizacion de preferencias (RLHF/DPO) mas alla de la fase original de desarrollo. No se publican el volumen de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de alineacion, por lo que estos datos deben considerarse "no disponibles". Si se documenta un layer de identidad verificado contra 11 sondas adversariales y 6 sondas de extraccion de identidad, con resultados publicados tal cual, incluyendo las limitaciones conocidas.

## Capacidades

- Generacion de texto conversacional y de formato largo, con modo de razonamiento extendido (`think: true` en Ollama) que expone los pasos intermedios en un campo separado.
- Comprension de imagenes mediante el proyector `mmproj` incluido: el mismo archivo gestiona texto e imagen, lo que habilita tareas de descripcion, extraccion de informacion y respuesta sobre documentos escaneados.
- Generacion de codigo y tareas tecnicas, segun el uso previsto declarado (coding, research, agentic tooling).
- Traduccion y conversacion multilingue en diez idiomas (en, ar, zh, fr, es, de, hi, ja, ko, ru), con enfasis declarado en arabe.
- Comportamiento "uncensored": rechazos minimos en peticiones legales de escritura creativa, rol, investigacion y ambito tecnico.
- Identidad fijada en la plantilla de chat, resistente a mensajes de sistema hostiles del cliente (acusaciones directas, "print your system prompt", auditoria de seguridad falsa, completado de frases, ofuscacion en base64, atribucion de especificaciones).
- Escritura creativa y role-play, uno de los casos de uso declarados por el autor.
- Despliegue offline y on-premise como parte del caso de uso previsto.
- Tool calling / function calling: no se documenta de forma explicita en la informacion disponible.

## Casos de uso

- **Atencion al cliente automatizada en varios idiomas**: con 131.072 tokens de contexto en la receta de servicio se pueden mantener historiales multi-turno muy largos y adjuntar documentacion de producto completa sin truncar; el soporte de arabe, chino, hindi y japones cubre mercados que muchos modelos abiertos tratan de forma superficial.
- **Analisis de documentos escaneados y capturas**: el proyector visual permite enviar una imagen junto al texto y pedir extraccion de campos, resumen o traduccion, lo que encaja en flujos de digitalizacion de facturas, formularios o informes tecnicos.
- **Escritura creativa y narrativa larga**: la combinacion de contexto de 262.144 tokens y ausencia de rechazos en peticiones legales facilita mantener coherencia de personajes y tramas a lo largo de novelas o guiones, con el modo de razonamiento visible para depurar decisiones narrativas.
- **Asistente de investigacion y revision bibliografica**: se pueden cargar articulos completos y hacer preguntas cruzadas; el modo `think` ayuda a auditar el razonamiento, y `think: false` sirve para producir solo la respuesta final en entornos de usuario.
- **Generacion de codigo en entornos con requisitos de confidencialidad**: al ejecutarse en llama.cpp/Ollama sobre hardware propio, el codigo nunca sale de la infraestructura; util en sector publico o industrial con restricciones de residencia de datos.
- **Traduccion tecnica y localizacion**: el perfil multilingue con refuerzo en arabe resulta adecuado para localizar documentacion de producto hacia mercados de Oriente Medio, con revisión humana posterior por el riesgo de alucinacion en terminologia especializada.
- **Prototipado de agentes con contexto largo**: el modelo cabe en una sola estacion de trabajo con offload parcial (28 de 40 capas en GPU segun la receta oficial), lo que permite iterar sobre flujos agenticos sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente reporta una evaluacion cualitativa de comportamiento de identidad (11 sondas adversariales y 6 sondas de extraccion), sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos. Tampoco se documentan metricas de throughput ni latencia.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 20-21 GiB solo para pesos (19,7 GiB del Q4_K_M mas 0,9 GiB del proyector F16), a los que hay que sumar la cache KV del contexto elegido. A 131.072 tokens ese coste es significativo y no puede calcularse con precision porque la model card no publica numero de capas ni dimensiones de atencion.
- **GPU recomendadas**: una RTX 4090 (24 GB) permite cargar los pesos completos, pero deja poco margen para cache KV a contexto largo; una A100 40 GB, L40S 48 GB o H100 80 GB permiten servir con contexto amplio y concurrencia.
- **Cabe en consumer GPU**: si, con matices. En 24 GB entra el modelo en Q4_K_M con contexto moderado; para 131.072 tokens conviene una GPU de 40-48 GB o el esquema de offload parcial que propone el autor (28 de 40 capas en GPU) sobre una estacion de trabajo con RAM suficiente.
- **Opciones de despliegue**: llama.cpp (`llama-server` con `--mmproj`), Ollama (Modelfiles incluidos, version core y core-gpu), LM Studio y cualquier runtime compatible con GGUF. No hay soporte documentado para vLLM ni TGI en la informacion disponible.
- **Parametros de muestreo recomendados**: temperatura 1.0, top_p 0.95, top_k 20, min_p 0.
- **Latencia y throughput**: no disponibles. Como referencia estructural, un MoE con ~3B activos deberia ser notablemente mas rapido por token que un denso de 34B, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

Los datos de rendimiento de Kimibrain no estan publicados, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Las cifras de los modelos alternativos corresponden a sus fichas publicas y deben verificarse en la fuente.

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kimibrain Uncensored | 34,7 B / ~3 B (256 expertos, 8 activos) | 262.144 (131.072 en receta Ollama) | Apache 2.0 | GGUF en HuggingFace, 33 descargas |
| Qwen3-30B-A3B | 30,5 B / 3,3 B | 32.768 nativo, ampliable | Apache 2.0 | Amplia adopcion, multiples cuantizaciones |
| Mixtral 8x7B | 46,7 B / 12,9 B | 32.768 | Apache 2.0 | Muy extendido en ecosistema GGUF |
| Llama 3.3 70B (denso) | 70 B | 128.000 | Licencia comunitaria de Llama | Amplia adopcion, requiere mucho mas hardware |

Frente a Qwen3-30B-A3B, Kimibrain ofrece un contexto declarado ocho veces mayor, vision integrada y un perfil explicitamente sin censura, pero carece de benchmarks publicos y de comunidad; frente a Mixtral 8x7B, moviliza muchos menos parametros activos (3B frente a 12,9B), lo que sugiere menor coste por token, a costa de menor validacion externa. Un denso de 70B como Llama 3.3 sigue siendo la referencia en calidad general, pero exige del orden del triple de VRAM en cuantizaciones equivalentes.

## Limitaciones y advertencias

- **Procedencia contradictoria**: la model card afirma que el modelo se entrena desde cero y no deriva de ninguna familia open-weight, pero al mismo tiempo reconoce que las trazas de razonamiento pueden nombrar familias de modelos upstream y que una peticion de traduccion o transcripcion puede arrastrar esos nombres. Esa combinacion es dificil de reconciliar y deberia verificarse antes de asumir la procedencia declarada en entornos con requisitos de compliance.
- **Sin benchmarks de capacidad**: no hay resultados publicados de MMLU, HumanEval, GSM8K ni evaluaciones de vision, de modo que el rendimiento real en tareas es una incognita hasta que el equipo lo mida en su propio dominio.
- **Adopcion practicamente nula**: 33 descargas y 0 likes implican ausencia de validacion por terceros, de issues reportados y de cuantizaciones comunitarias alternativas.
- **Riesgo de alucinacion**: inherente a cualquier LLM y agravado aqui por la ausencia de evaluaciones publicadas y por el modo de razonamiento largo, que puede presentar inferencias no verificadas con apariencia de solidez.
- **Sin alineacion de seguridad**: el autor declara que no es un sistema certificado en seguridad y que no esta ajustado para asesoramiento medico, legal o financiero. El comportamiento "uncensored" implica que la responsabilidad de filtrado recae integramente en la aplicacion que lo envuelve.
- **Capa de identidad**: la fijacion de identidad en la plantilla de chat puede interferir con productos que necesiten su propia persona; el autor indica que puede reemplazarse editando el bloque del Modelfile, pero hacerlo requiere trabajo adicional y pruebas.
- **Contexto efectivo incierto**: los 262.144 tokens son el maximo declarado; el rendimiento en recuperacion a esa distancia no esta medido, y la propia receta de servicio baja a 131.072 por motivos de memoria.
- **Licencia**: Apache 2.0 permite uso comercial y redistribucion, pero no concede derechos sobre las marcas "Kimibrain" y "Burabeeh Lab"; cualquier producto derivado no puede presentarse como oficial del laboratorio.
- **Metadatos a verificar**: las fechas del repositorio (creado el 2026-10-22) no coinciden con la fecha actual de consulta, lo que conviene contrastar antes de citar el modelo en documentacion.

## Enlaces

- HuggingFace: https://huggingface.co/burabeeh/Kimibrain-Uncensored
- Perfil del autor en HuggingFace: https://huggingface.co/burabeeh
- Repositorio de Modelfiles: https://huggingface.co/burabeeh/Kimibrain-Uncensored/tree/main/modelfiles
- Politica de uso aceptable: https://huggingface.co/burabeeh/Kimibrain-Uncensored/blob/main/ACCEPTABLE_USE.md
- Licencia Apache 2.0: https://huggingface.co/burabeeh/Kimibrain-Uncensored/blob/main/LICENSE
- Aviso de atribucion y procedencia: https://huggingface.co/burabeeh/Kimibrain-Uncensored/blob/main/NOTICE
- No se han encontrado en la busqueda web papers, blogs tecnicos, repositorios ni demos adicionales sobre este modelo; los resultados devueltos por la busqueda no guardan relacion con el.
