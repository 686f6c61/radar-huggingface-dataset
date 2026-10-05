# sebidev/gemma-4-12B-it

## Resumen

Gemma 4 12B Unified es un modelo multimodal de arquitectura encoder-free desarrollado por Google DeepMind dentro de la familia Gemma 4. El modelo publicado bajo el identificador `sebidev/gemma-4-12B-it` es un ajuste fino (fine-tune) del checkpoint base `google/gemma-4-12B`. Con 11.959.730.224 parámetros (11,95B) y 48 capas, se posiciona como el modelo denso de tamano medio de la familia, disenado para ejecucion local en portatiles y estaciones de trabajo con GPU de consumo.

La innovacion principal es su caracter "Unified": elimina los encoders dedicados de vision y audio que usan otros modelos multimodales y proyecta directamente los parches de imagen y las formas de onda de audio al espacio de embeddings del transformer mediante capas lineales ligeras. Esto reduce la latencia multimodal y permite ajustar todo el modelo en una sola pasada. Soporta entrada de texto, imagen, audio y video, y genera texto.

Es relevante ahora porque combina ventana de contexto de 256K tokens, soporte nativo del rol `system`, modo de razonamiento configurable y function calling nativo, todo ello en un tamano que cabe en 16 GB de VRAM/RAM segun la documentacion oficial de Google. Esto lo sitúa como una opcion para flujos agenticos y de analisis visual que se ejecutan completamente en local, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only encoder-free (atencion hibrida: sliding window local + atencion global), denominada `gemma4_unified` |
| Parametros totales | 11.959.730.224 (11,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (se infiere compatibilidad con GGUF/int8/int4 por el ecosistema, pero no esta confirmado) |
| Idiomas soportados | Mas de 140 idiomas (segun la model card) |
| Licencia | Apache 2.0 (etiqueta del repo); la propia model card enlaza a `gemma_4_license`, lo que genera una discrepancia que conviene verificar |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 48 |
| Sliding window | 1024 tokens |
| Tamano del vocabulario | 262K |
| Modalidades de entrada | Texto, imagen, audio, video |
| Modalidad de salida | Texto |
| Tamano del repositorio | 24,0 GB |
| Pipeline | any-to-any / image-text-to-text |

## Arquitectura y entrenamiento

Gemma 4 12B Unified emplea un transformer decoder-only con atencion hibrida que intercala capas de atencion local de ventana deslizante (1024 tokens) con capas de atencion global, garantizando que la ultima capa sea siempre global. Las capas globales usan Keys y Values unificadas y aplican Proportional RoPE (p-RoPE) para optimizar el consumo de memoria en contextos largos. La arquitectura es encoder-free: no hay encoder de vision ni de audio separados. Los parches crudos de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings del LLM mediante capas lineales ligeras, de modo que todas las modalidades entran en un unico transformer decoder-only.

La model card indica que los modelos Gemma 4 se publican en variantes preentrenada e instruction-tuned, y que la familia se desarrollo junto con equipos internos de seguridad y responsable de IA, con evaluaciones automatizadas y humanas. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO. Estos datos no estan disponibles en la informacion proporcionada.

El checkpoint concreto analizado es un fine-tune del base `google/gemma-4-12B` realizado por el usuario `sebidev`. No se dispone de informacion sobre el dataset, el procedimiento ni los hiperparametros de ese ajuste.

## Capacidades

- Generacion de texto, razonamiento y codigo, con modo de razonamiento (thinking) configurable en todos los modelos de la familia.
- Comprension multimodal nativa de imagen con soporte de relacion de aspecto y resolucion variables.
- Comprension de audio nativa (entrada de audio) y de video, sin encoders dedicados.
- Function calling nativo y soporte para flujos agenticos y razonamiento multi-paso.
- Soporte nativo del rol `system` en la plantilla de conversacion, permitiendo conversaciones mas estructuradas y controlables.
- Capacidades multilingues en mas de 140 idiomas.
- Salida exclusivamente de texto (no genera imagen ni audio).

## Casos de uso

- Asistente agentico local en portatil: con 256K de contexto y function calling nativo, puede orquestar herramientas y mantener estado de conversaciones largas sin enviar datos a la nube, algo critico en entornos con requisitos de privacidad.
- Analisis de documentos con imagenes y audio: al aceptar imagen y audio de entrada, puede resumir una reunion a partir del audio y, en la misma sesion, extraer datos de capturas o diagramas.
- Generacion de codigo en produccion: el soporte de function calling permite integrarlo en pipelines de CI/CD para revision de cambios, generacion de tests o explicacion de errores, con la ventana de 256K para incluir repositorios o ficheros extensos.
- Transcripcion y dictado offline: la documentacion de Google AI Edge menciona su uso para dictado de voz y texto completamente offline, util en entornos sin conectividad o con regulacion estricta de datos.
- Ejecucion de codigo asistida con visualizacion: segun el blog de Google AI Edge, se puede usar en macOS a traves de AI Edge Gallery para ejecucion dinamica de codigo Python y generacion de graficos a partir de descripciones.
- Atencion al cliente automatizada en idiomas minoritarios: los mas de 140 idiomas soportados permiten desplegar un unico modelo en lugar de mantener variantes por idioma.
- Procesamiento por lotes en estacion de trabajo: con 11,95B de parametros y 24 GB de pesos en safetensors, se puede servir en una unica GPU de 24 GB para clasificacion, extraccion y resumen de documentos multimodales.
- Investigacion en multimodalidad encoder-free: su diseno permite estudiar si proyectar senales crudas al espacio de embeddings es suficiente para tareas de vision y audio, y sirve de base para fine-tunes especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma mejoras notables en benchmarks de codigo y capacidades agenticas respecto a versiones anteriores, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K ni equivalentes) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 11,96B de parametros, en fp16/bf16 se requieren aproximadamente 24 GB de pesos mas overhead de KV cache; en int8 unos 12 GB; en int4 unos 7 GB. Son estimaciones derivadas del recuento de parametros, no cifras oficiales.
- La documentacion oficial de Google describe el modelo como apto para desarrollo local con 16 GB de VRAM y para portatiles con 16 GB de RAM, lo que implica despliegue cuantizado.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, encajan GPU de 16-24 GB (por ejemplo, gama RTX 4080/4090 o A100 40GB para fp16 sin cuantizar).
- Cabe en GPU de consumo: si, segun Google, en equipos con 16 GB de VRAM o RAM, presumiblemente con cuantizacion.
- Opciones de despliegue: la model card menciona la libreria `transformers`, integraciones con Hugging Face y servidores API locales ("drop-in local API servers"). No se confirman en el material proporcionado soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El diseno de atencion hibrida se justifica en la model card por su menor huella de memoria y mayor velocidad en contextos largos, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio (video) | Apache 2.0 / gemma_4_license | Encoder-free, 48 capas, sliding window 1024 |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | Usa Per-Layer Embeddings; encoder de vision ~150M y audio ~300M |
| Gemma 4 E2B | 2,3B efectivos (5,1B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | Orientado a movil y edge; encoder de vision ~150M y audio ~300M |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | 60 capas, encoder de vision ~550M, sin audio |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. El modelo MoE de la familia (26B A4B) aparece mencionado en la model card, pero su tabla de especificaciones esta incompleta en el material recibido.

## Limitaciones y advertencias

- Discrepancia de licencia: la etiqueta del repositorio indica `apache-2.0`, pero la propia model card enlaza a `gemma_4_license` como licencia. Antes de un uso comercial conviene verificar cual aplica, ya que la licencia de Gemma tiene condiciones especificas de uso aceptable.
- El modelo es un fine-tune de terceros (`sebidev`), con 0 descargas y 0 likes en el momento de la consulta. No hay evidencia publica de validacion, evaluacion ni mantenimiento; el riesgo de regresiones frente al modelo base es real.
- No se han publicado benchmarks para este checkpoint concreto, por lo que no hay base objetiva para afirmar que mejora al base `google/gemma-4-12B`.
- Riesgo de alucinacion: inherente a los modelos generativos; la model card de la familia menciona evaluaciones de seguridad, pero no cuantifica tasas de alucinacion.
- Sesgos conocidos: la informacion proporcionada no detalla sesgos especificos ni la composicion del dataset, por lo que no se puede evaluar la representatividad de los datos de entrenamiento.
- Idiomas: se declaran mas de 140 idiomas, pero no se especifica el nivel de calidad por idioma ni si el fine-tune de terceros conserva ese soporte multilingue.
- Contexto: aunque la ventana es de 256K tokens, el rendimiento efectivo en contextos muy largos no esta documentado y la atencion local con sliding window de 1024 tokens puede degradar el recuerdo de detalles lejanos.
- Salida limitada a texto: no genera imagenes ni audio pese a aceptarlos como entrada.
- Requisitos de hardware: la cifra de 16 GB presupone cuantizacion; sin cuantizar, los pesos en fp16 rondan los 24 GB y superan la VRAM de muchas GPU de consumo.
- Para produccion: al ser un fine-tune sin documentacion de entrenamiento, se recomienda validar con un conjunto propio antes de desplegarlo en tareas criticas.

## Enlaces

- Modelo en Hugging Face (fine-tune): https://huggingface.co/sebidev/gemma-4-12B-it
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-12B
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guia para desarrolladores: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Flujos agenticos locales con Google AI Edge: https://developers.googleblog.com/bringing-gemma-4-12b-to-your-laptop-unlocking-local-agentic-workflows-with-google-ai-edge/
