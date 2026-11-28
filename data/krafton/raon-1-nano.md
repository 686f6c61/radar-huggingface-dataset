# KRAFTON/Raon-1-nano

## Resumen

Raon-1 nano es un modelo de lenguaje denso desarrollado por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. Con 3.100 millones de parámetros efectivos (3.200 millones en el checkpoint, que incluye un módulo de predicción multi-token de 55 millones), está disenado para seguir instrucciones, mantener contexto conversacional y ejecutar llamadas a herramientas tanto en coreano como en inglés. Se distribuye bajo licencia Apache 2.0.

El modelo destaca por su arquitectura híbrida de atención: 18 capas de atención lineal Raon Delta Attention (RDA) combinadas con 6 capas de atención completa Gated MLA, lo que reduce drásticamente el coste de la caché KV (aproximadamente 7 KiB por token en BF16, solo en las capas MLA). Soporta de forma nativa una ventana de contexto de 262.144 tokens, una cifra notable para su tamano.

Su relevancia actual reside en tres factores: la técnica MoE-to-Dense con la que fue derivado del modelo mayor Raon-1 mini preview (30B-A4B) mediante poda y destilación de conocimiento, su orientación explícita al despliegue en dispositivo (formatos GGUF, MLX y LiteRT-LM) y su enfoque bilingüe coreano-inglés con soporte de tool calling dentro de conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (RDA 3 : Gated MLA 1), sin codificación posicional (NoPE) |
| Parametros totales | 3.100 millones (3.200 millones incluyendo el módulo MTP de 55 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (se distribuyen formatos GGUF, MLX y LiteRT-LM) |
| Idiomas soportados | Coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers), GGUF, MLX, LiteRT-LM |

Otros datos técnicos: 24 capas, tamano oculto de 1.536, 16 cabezas en RDA (dimensión 128) y 32 cabezas en Gated MLA (192 QK / 128 V), rango LoRA de consulta y KV de 512, FFN intermedio de 6.144 con activación SwiGLU, conexiones residuales Raon-mHC con 4 flujos, embedding por capa de 256 dimensiones, vocabulario de 259.840 tokens y LM head atado al embedding de entrada.

## Arquitectura y entrenamiento

Raon-1 nano emplea una arquitectura híbrida que combina 18 capas de Raon Delta Attention (RDA) con 6 capas de Gated MLA. RDA es una atención lineal basada en reglas delta con compuertas, con compuertas separadas de borrado y escritura y un estado recurrente de tamano fijo; esto implica que solo las 6 capas MLA mantienen caché KV, lo que abarata enormemente la inferencia con contextos largos. El modelo prescinde de codificación posicional (NoPE). Incorpora además Raon-mHC, una versión optimizada de las hyper-connections con restricción de variedad (mHC) de DeepSeek que reduce el coste computacional y acelera el entrenamiento, y un esquema de embedding por capa: cada capa dispone de un embedding propio de 256 dimensiones que ajusta su salida tras el MLP. El módulo MTP de una capa (55 millones de parámetros) habilita decodificación especulativa.

El entrenamiento se estructura en tres fases. Primero, el modelo se deriva de Raon-1 mini preview (30B-A4B) mediante la técnica MoE-to-Dense descrita en el paper arXiv:2605.28207, que combina poda y destilación de conocimiento. Después, se realiza un preentrenamiento continuado con 3 billones de tokens. Finalmente, el post-entrenamiento incluye ajuste fino supervisado (SFT) y destilación on-policy (OPD) desde Raon-1 mini preview, seguidos de aprendizaje por refuerzo (RL).

## Capacidades

- Generación de texto y conversación multi-turno con seguimiento fiel de instrucciones y de contexto.
- Razonamiento y conocimiento general, con resultados destacados en benchmarks de conocimiento según la model card.
- Llamadas a herramientas (tool calling) integradas en conversaciones, orientadas a tareas de oficina y control de dispositivos móviles.
- Capacidades bilingües coreano-inglés, con especial fortaleza en coreano coloquial.
- Contexto largo nativo de hasta 262.144 tokens, adecuado para documentos extensos e historiales de conversación prolongados.
- Memoria de persona y contexto (evaluado en PersonaMem v2) y seguimiento de preferencias a lo largo de turnos (PrefEval).
- Despliegue en dispositivo mediante GGUF, MLX y LiteRT-LM, incluido Apple Silicon.
- Decodificación especulativa gracias al módulo MTP.
- No se menciona soporte de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistente conversacional en coreano e inglés: el modelo puede gestionar diálogos multi-turno con memoria de persona y seguimiento de preferencias, gracias a su contexto de 262.144 tokens y a los resultados que la model card reporta en PersonaMem v2 y PrefEval.
- Automatización de tareas de oficina: con tool calling dentro de la conversación, puede programar reuniones, buscar documentos o hilos en herramientas como Slack, tal y como se evalúa en el benchmark interno Office Work Bench.
- Control de dispositivos móviles por instrucciones en lenguaje natural: la model card cita AndroidControl (instrucciones de alto y bajo nivel) como escenario de evaluación, lo que lo hace adecuado para agentes de automatización en Android.
- Despliegue en dispositivo (on-device): al distribuirse en GGUF, MLX y LiteRT-LM, puede ejecutarse localmente en portátiles con Apple Silicon o en hardware de gama consumer, útil para asistentes privados sin conexión.
- Procesamiento de documentos largos: su ventana de 262.144 tokens y su caché KV reducida (solo 6 capas MLA, ~7 KiB por token en BF16) permiten resumir o consultar contratos, informes o bases de conocimiento extensas con coste de memoria contenido.
- Atención al cliente bilingüe: la combinación de conversación natural en coreano e inglés y tool calling permite integrarlo en sistemas de soporte que consultan APIs internas (estado de pedidos, reservas) durante el diálogo.
- Generación asistida en pipelines de desarrollo: su formato safetensors y compatibilidad con transformers permiten integrarlo en flujos de generación de texto y prototipado rápido, aunque no se documentan capacidades específicas de código.

## Benchmarks y rendimiento

La model card incluye una figura comparativa (benchmark-results.svg) frente a modelos abiertos de tamano similar, con resultados en Knowledge, PersonaMem v2 (contexto de 32k), PrefEval (tarea de generación, media de 10/70/150 turnos), Office Work Bench (interno, no publicado), AndroidControl (media de instrucciones HL y LL) y Chatbot Korean (interno, no publicado). Los valores numéricos concretos no están disponibles en el texto proporcionado; la información indica únicamente que Raon-1 nano lidera la comparación en los benchmarks de seguimiento de instrucciones, seguimiento de contexto y conversación en coreano mostrados.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia orientativa por tamano (3.200 millones de parámetros), en BF16 requeriría aproximadamente 6,4 GB solo para pesos; en cuantizaciones de 8 bits, unos 3,2 GB, y en 4 bits, unos 1,6-2 GB, a lo que habría que sumar la caché KV de las 6 capas MLA (~7 KiB por token en BF16).
- GPU recomendadas: no especificadas en la información disponible. Por tamano, es apto para GPU consumer como RTX 4090, RTX 4080 o superiores, así como para A100/H100 en despliegues de mayor concurrencia.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 8 GB o más de VRAM, especialmente en cuantizaciones de 4-8 bits.
- Opciones de despliegue: transformers (librería indicada), GGUF (compatible con llama.cpp y Ollama), MLX (Apple Silicon) y LiteRT-LM. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El módulo MTP permite decodificación especulativa, lo que puede mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Raon-1 nano (KRAFTON) | 3,1B densos (+55M MTP) | 262.144 | Coreano, inglés | Apache 2.0 | Safetensors, GGUF, MLX, LiteRT-LM |
| Raon-1 mini preview (KRAFTON) | 30B totales, 4B activos (MoE) | No disponible | Coreano, inglés | No disponible | No disponible |
| Alternativas de ~3B | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card menciona comparaciones frente a "modelos abiertos de tamano similar", pero no identifica sus nombres ni sus cifras en la información proporcionada. No se dispone de datos verificables de modelos comparables de terceros.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; como todo modelo entrenado con datos web, es previsible que herede sesgos de sus corpus.
- Alucinación: no se aportan tasas ni evaluaciones específicas; debe validarse la salida en aplicaciones de alta criticidad.
- Idiomas: solo se declaran coreano e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Contexto: aunque soporta 262.144 tokens, no se especifica cómo degrada el rendimiento en longitudes cercanas al máximo; PersonaMem v2 se evaluó a 32k.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las dependencias del código personalizado (custom_code) y de los formatos derivados.
- Benchmarks internos: Office Work Bench y Chatbot Korean no son públicos, por lo que sus resultados no son reproducibles de forma independiente.
- Producción: no se publican cifras de latencia, throughput ni requisitos mínimos de hardware; será necesario medirlos en el entorno objetivo. El uso de `custom_code` en transformers implica confiar en código remoto del repositorio.
- Formato: el repositorio ocupa 25,2 GB, lo que incluye múltiples formatos de pesos; la descarga completa puede ser costosa en disco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-nano
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Web de KRAFTON AI: https://krafton.ai/en/
- Paper MoE-to-Dense: https://arxiv.org/abs/2605.28207
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Web corporativa: https://www.krafton.com/en/
- Wikipedia (KRAFTON): https://en.wikipedia.org/wiki/Krafton
