# LukKashh/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B-it es un modelo multimodal de Google DeepMind publicado bajo licencia Apache 2.0, disenado para ejecucion en dispositivos de borde como portatiles y telefonos de gama alta. Este repositorio concreto, `LukKashh/gemma-4-E4B-it-GGUF`, es una conversion a formato GGUF realizada por un tercero (LukKashh) a partir de los pesos originales de `google/gemma-4-E4B-it`, orientada a inferencia local con llama.cpp y ecosistemas compatibles. El modelo procesa texto, imagen y audio como entrada, y genera texto como salida.

El modelo pertenece a la familia Gemma 4, que combina arquitecturas densas y Mixture-of-Experts en cuatro tamanos (E2B, E4B, 26B A4B y 31B). La variante E4B declara 4.500 millones de parametros efectivos (8.000 millones contando embeddings), 42 capas, ventana de atencion deslizante de 512 tokens y una longitud de contexto de 128.000 tokens. Incorpora modos de razonamiento configurables, soporte nativo de function calling, rol de sistema y mas de 140 idiomas.

La relevancia de esta ficha radica en que es una de las primeras conversiones GGUF de un modelo de la familia Gemma 4 con capacidad de audio nativa, lo que permite desplegar un modelo multimodal en hardware de consumo sin depender de infraestructura en la nube. El repositorio tiene un tamano de 126,3 GB, coherente con un conjunto de cuantizaciones que incluye variantes de alta precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + atencion global), p-RoPE y Keys/Values unificadas en capas globales |
| Parametros totales | 7.518.069.290 (dato de safetensors); 4,5B efectivos / 8B con embeddings segun model card |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); variantes concretas no detalladas en la informacion disponible |
| Idiomas soportados | Mas de 140 idiomas (segun model card de la familia); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

Gemma 4 E4B-it emplea una arquitectura transformer densa con un mecanismo de atencion hibrido que intercala capas de atencion local con ventana deslizante de 512 tokens y capas de atencion global completa, garantizando que la ultima capa sea siempre global. Para reducir el consumo de memoria en contextos largos, las capas globales unifican Keys y Values y aplican Proportional RoPE (p-RoPE). El modelo consta de 42 capas, un vocabulario de 262.000 tokens, un codificador de vision de aproximadamente 150 millones de parametros y un codificador de audio de aproximadamente 300 millones de parametros.

La model card de la familia indica que los modelos Gemma 4 se disenan como razonadores con modos de pensamiento configurables, soporte nativo del rol `system` y capacidades mejoradas de codigo y agentes. No se detalla en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La conversion GGUF ha sido realizada por un tercero (LukKashh) usando herramientas de Unsloth, e incluye soporte para MTP (multi-token prediction) segun las notas del repositorio.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables.
- Comprension de imagenes con soporte de relacion de aspecto y resolucion variables.
- Procesamiento de audio nativo (entrada), caracteristica exclusiva de los modelos E2B y E4B dentro de la familia.
- Procesamiento de video (segun la model card de la familia).
- Generacion de codigo y matematicas con mejoras notables en benchmarks de codigo.
- Soporte nativo de function calling / tool calling.
- Capacidades agenticas y razonamiento multi-paso.
- Soporte multilingue en mas de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Capacidad conversacional (etiqueta `conversational`).

## Casos de uso

- **Atencion al cliente multimodal:** el modelo puede gestionar conversaciones multi-turno con contexto de hasta 128.000 tokens e interpretar imagenes enviadas por el usuario (capturas, fotos de productos) para resolver incidencias sin derivar a un humano en primera instancia.
- **Asistente local en portatil:** al ser un modelo de 4,5B parametros efectivos, se puede ejecutar en un portatil con GPU de consumo mediante llama.cpp u Ollama, ofreciendo asistencia de texto, vision y audio sin conexion a internet.
- **Transcripcion y analisis de audio en local:** gracias a su codificador de audio nativo, permite construir pipelines de resumen de reuniones o notas de voz que procesan el audio directamente en el dispositivo, sin enviar datos a servicios externos.
- **Generacion de codigo en produccion:** con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar codigo, generar tests o revisar diffs, invocando herramientas externas (linters, compiladores) mediante function calling.
- **Agentes autonomos de escritorio:** el soporte de razonamiento multi-paso y function calling permite construir agentes que interactuan con APIs y aplicaciones locales, con la ventaja de que el modelo corre en el propio equipo.
- **Accesibilidad:** el procesamiento de imagen y audio permite crear aplicaciones que describen escenas o transcriben y resumen audio para personas con discapacidad visual o auditiva, ejecutandose en dispositivos de gama alta sin coste por token.
- **Analisis de documentos con imagenes:** interpretacion de facturas, formularios o capturas de pantalla combinada con contexto largo para extraer y resumir informacion estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la familia menciona mejoras notables en benchmarks de codigo y capacidades agenticas, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otros) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia orientativa, un modelo denso de 4,5B parametros efectivos (8B con embeddings) requiere aproximadamente 3-5 GB en cuantizacion de 4 bits, 6-8 GB en 8 bits y 16 GB en FP16, aunque estas cifras no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cabria esperar ejecucion en RTX 3060/4060/4090 y GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: previsiblemente si, en GPUs con 8 GB o mas de VRAM en cuantizaciones bajas, aunque no se confirma en la informacion.
- Opciones de despliegue: llama.cpp, Ollama, Unsloth Studio (soporte documentado por el autor de la conversion), y otros runtimes compatibles con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B-it (este repo) | 4,5B efectivos / 8B con embeddings | 128K | Texto, imagen, audio | Apache 2.0 | GGUF |
| Gemma 4 E2B-it | 2,3B efectivos / 5,1B con embeddings | 128K | Texto, imagen, audio | Apache 2.0 | GGUF (via Unsloth) |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | GGUF (via Unsloth) |
| Gemma 4 26B A4B | No disponible | 256K | Texto, imagen | Apache 2.0 | GGUF (via Unsloth) |

La comparativa se limita a la propia familia Gemma 4 porque la informacion proporcionada no incluye datos de rendimiento que permitan una comparacion cuantitativa con modelos de otros fabricantes. No se dispone de cifras de benchmarks para ninguno de los modelos listados en el material consultado.

## Limitaciones y advertencias

- **Sesgos:** no documentados en la informacion proporcionada; cabe esperar los sesgos habituales de modelos entrenados con datos web a gran escala, pero no se detallan.
- **Alucinacion:** no se cuantifica el riesgo en la informacion disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o contextos largos.
- **Conversion de terceros:** este repositorio GGUF no es oficial de Google; la calidad de la cuantizacion depende del autor (LukKashh) y de las herramientas de Unsloth. Se recomienda validar frente a los pesos originales.
- **Idiomas:** aunque la familia declara soporte de mas de 140 idiomas, no se especifica el rendimiento por idioma ni la lista completa; el rendimiento en castellano no esta cuantificado.
- **Licencia:** Apache 2.0 permite uso comercial, pero el modelo base remite a la licencia de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los terminos adicionales de uso aceptable de Google.
- **Repositorio con 0 descargas y 0 likes:** no hay evidencia de validacion comunitaria; el modelo fue creado y actualizado el mismo dia (2026-11-06), lo que sugiere que no ha sido probado ampliamente.
- **Contexto largo:** el uso completo de 128K tokens incrementa el consumo de memoria y puede degradar la calidad; las capas de atencion global unifican K/V y aplican p-RoPE precisamente para mitigar esto, pero no hay mediciones publicadas.
- **Audio y vision:** las capacidades multimodales dependen del runtime GGUF; no todos los backends de llama.cpp soportan audio e imagen de forma completa, por lo que la funcionalidad efectiva puede variar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LukKashh/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Coleccion Gemma 4 de Unsloth (GGUF, 16-bit, etc.): https://huggingface.co/collections/unsloth/gemma-4
- Guia de Unsloth para ejecutar Gemma 4: https://docs.unsloth.ai/models/gemma-4
- Benchmarks de cuantizacion Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Guia MTP de Unsloth: https://unsloth.ai/docs/models/mtp
- Unsloth Studio: https://unsloth.ai/docs/new/studio
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
