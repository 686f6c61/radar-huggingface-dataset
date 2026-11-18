# google/gemma-4-E4B

## Resumen

Gemma 4 E4B es un modelo multimodal abierto desarrollado por Google DeepMind, perteneciente a la familia Gemma 4. Se trata de un modelo denso de 4,5B de parámetros efectivos (8B contando las tablas de embeddings), disenado especificamente para despliegue en dispositivos de borde como portatiles y telefonos moviles de gama alta. Procesa entrada de texto, imagen y audio, y genera salida de texto, lo que lo convierte en un modelo any-to-any dentro de la categoria de pequenos modelos multimodales.

La familia Gemma 4 introduce mejoras arquitectonicas relevantes: atencion hibrida que intercala ventanas deslizantes locales con atencion global, soporte nativo del rol `system`, modos de razonamiento configurables y function calling nativo. El E4B emplea Per-Layer Embeddings (PLE) para maximizar la eficiencia parametrica en entornos con memoria limitada, manteniendo una ventana de contexto de 128K tokens y soporte para mas de 140 idiomas.

Su relevancia actual radica en que ofrece capacidades multimodales (incluido audio nativo) y razonamiento en un formato que cabe en hardware de consumo, con licencia Apache 2.0, lo que facilita su adopcion tanto en investigacion como en productos comerciales sin las restricciones habituales de otros modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con atencion hibrida (sliding window local + atencion global), Per-Layer Embeddings (PLE) |
| Parametros totales | 7.996.156.490 (8B con embeddings); 4,5B efectivos |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos: 42 capas, ventana deslizante de 512 tokens, vocabulario de 262K tokens, encoder de vision de ~150M de parametros, encoder de audio de ~300M de parametros. Tamano del repositorio: 48,2 GB.

## Arquitectura y entrenamiento

Gemma 4 E4B es un transformer decoder-only denso con un mecanismo de atencion hibrida que intercala capas de atencion local con ventana deslizante de 512 tokens y capas de atencion global, garantizando que la capa final sea siempre global. Las capas globales emplean claves y valores unificados junto con Proportional RoPE (p-RoPE) para optimizar el consumo de memoria en contextos largos. La innovacion clave del modelo es el uso de Per-Layer Embeddings (PLE): en lugar de anadir mas capas o parametros al decodificador, cada capa recibe su propia tabla de embeddings por token. Estas tablas son grandes en numero de parametros pero solo se usan para consultas rapidas, lo que explica la diferencia entre los 8B totales y los 4,5B efectivos.

El modelo integra encoders dedicados para vision (~150M de parametros) y audio (~300M de parametros), que procesan las modalidades antes de pasarlas al LLM. Soporta imagenes con relacion de aspecto y resolucion variables, asi como video. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Comprension de imagenes con soporte de relacion de aspecto y resolucion variables.
- Comprension de video.
- Procesamiento de audio nativo (entrada de audio, no solo texto).
- Generacion de codigo con mejoras notables en benchmarks de programacion segun la model card.
- Function calling / tool calling nativo.
- Capacidades agenticas y razonamiento multi-paso para flujos autonomos.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Multilingue: mas de 140 idiomas.
- Salida exclusivamente de texto (pipeline any-to-any con entrada multimodal).

## Casos de uso

- Asistentes de voz en dispositivos moviles: el modelo procesa audio de entrada de forma nativa gracias a su encoder de ~300M de parametros, lo que permite construir asistentes conversacionales que entienden habla sin necesidad de un pipeline ASR separado, todo ello ejecutandose localmente en telefonos de gama alta.
- Analisis de documentos e imagenes en el borde: con su encoder de vision y contexto de 128K tokens, puede procesar capturas, facturas o fotografias y responder preguntas sobre ellas sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Agentes autonomos con tool calling: el soporte nativo de function calling y el rol `system` permiten orquestar agentes que invocan APIs, consultan bases de datos o ejecutan acciones multi-paso en flujos de automatizacion.
- Generacion de codigo en local: con licencia Apache 2.0 y un tamano que cabe en portatiles, se puede integrar en editores o pipelines de CI/CD para autocompletado, generacion de tests o revision de parches sin dependencia de servicios externos.
- Atencion al cliente multilingue: los mas de 140 idiomas y la ventana de 128K tokens permiten gestionar conversaciones multi-turno con historial largo y clientes de distintas regiones con un unico modelo desplegado en infraestructura propia.
- Transcripcion y resumen de reuniones: al aceptar audio y texto, puede resumir grabaciones, extraer acciones y generar actas, ejecutandose en un portatil sin coste por token.
- Procesamiento de video para moderacion o indexacion: la capacidad de entrada de video permite clasificar o describir clips cortos en pipelines de moderacion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras en benchmarks de codigo y capacidades agenticas, pero no proporciona cifras concretas (MMLU, HumanEval, GSM8K u otros) en el material suministrado.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (BF16) los 8B de parametros requieren aproximadamente 16 GB; con cuantizacion a 8 bits, en torno a 8-9 GB; a 4 bits, aproximadamente 5-6 GB. Estas cifras son estimaciones basadas en el recuento de parametros, no datos oficiales.
- GPU recomendadas: para BF16, A100 40GB, H100 o RTX 4090 (24 GB). Para cuantizacion 4/8 bits, RTX 4070/4080, RTX 3090 o GPUs integradas de portatiles con 8-16 GB de memoria compartida.
- Cabe en GPU de consumo: si, especialmente en cuantizaciones de 4 y 8 bits; el diseno del modelo esta orientado a ejecucion en portatiles y telefonos de gama alta.
- Opciones de despliegue: transformers (libreria oficial), ademas de las herramientas habituales del ecosistema (vLLM, llama.cpp, Ollama, TGI) aunque la informacion proporcionada solo confirma compatibilidad con transformers y `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Gemma 4 E4B | 4,5B efectivos (8B totales) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E2B | 2,3B efectivos (5,1B totales) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 26B A4B MoE | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Apache 2.0 |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo con modelos de otras familias (Llama, Qwen, Mistral) ni de resultados de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se han documentado en la informacion disponible los sesgos conocidos del modelo; como todo LLM entrenado con datos web, es previsible que herede sesgos de esos datos.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado tasas de alucinacion especificas.
- La salida es exclusivamente de texto: aunque acepta audio e imagen, no genera audio ni imagenes.
- La ventana deslizante de 512 tokens en las capas locales implica que la atencion de grano fino sobre contextos muy largos depende de las capas globales, lo que puede afectar a la recuperacion precisa de informacion en posiciones distantes del contexto.
- Aunque la licencia es Apache 2.0, la model card enlaza a una licencia especifica de Gemma 4 (`gemma_4_license`); conviene verificar los terminos exactos antes de uso comercial en produccion.
- El tamano del repositorio (48,2 GB) incluye multiples variantes de pesos; el despliegue en dispositivos con almacenamiento limitado requiere seleccionar solo los ficheros necesarios.
- No se dispone de informacion sobre el numero de tokens de entrenamiento ni la composicion del dataset, lo que limita la evaluacion de riesgos de contaminacion o cobertura idiomatica real.

## Enlaces

- Hugging Face: https://huggingface.co/google/gemma-4-E4B
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina del modelo en Google DeepMind: https://deepmind.google/models/gemma/
