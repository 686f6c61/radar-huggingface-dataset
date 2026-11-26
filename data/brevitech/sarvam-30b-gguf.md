# brevitech/sarvam-30b-gguf

## Resumen

Sarvam-30B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado originalmente por Sarvam AI, orientado a generacion de texto en ingles y 22 idiomas indios. La version aqui documentada es una conversion cuantizada a formato GGUF publicada por brevitech bajo el identificador `brevitech/sarvam-30b-gguf`, pensada para inferencia local en hardware de consumo. El modelo original emplea la arquitectura `SarvamMoEForCausalLM` con 19 capas de decodificador, 128 expertos por capa y una ventana de contexto de hasta 131.072 tokens.

El modelo resuelve el problema de disponer de un LLM multilingue de gran cobertura para el subcontinente indio que pueda ejecutarse en estaciones de trabajo y GPUs de consumo. Con aproximadamente 32.150 millones de parametros totales, la cuantizacion Q4_K_M reduce el peso en disco de 128,61 GB (float32) a 19,58 GB, lo que permite carga completa en GPUs de 24-32 GB de VRAM.

La relevancia actual radica en la combinacion de licencia Apache 2.0, soporte para 23 idiomas y un footprint de ~19,6 GB que habilita despliegue local con llama.cpp y Ollama, sin depender de APIs en la nube. brevitech no entrena el modelo: solo realiza conversion, cuantizacion, empaquetado y validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `SarvamMoEForCausalLM` (`sarvam_moe`), transformer MoE con Grouped-Query Attention |
| Parametros totales | 32.152.650.368 (~32 B) |
| Parametros activos | 6 expertos enrutados + 1 experto compartido por token (total de expertos activos no disponible en cifras absolutas) |
| Longitud de contexto | Hasta 131.072 tokens (128K) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo) |
| Idiomas soportados | Ingles y 22 idiomas indios: hindi, bengali, tamil, telugu, marathi, gujarati, kannada, malayo, punyabi, odia, assames, urdu, sanscrito, nepali, sindhi, konkani, maithili, dogri, manipuri, santali, cachemir, bodo |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero `sarvam-30b-brevitech-Q4_K_M.gguf`, 19.579.101.888 bytes) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo Mixture-of-Experts con 19 capas de decodificador ocultas, tamano oculto de 4.096, atencion con 64 cabezas Q y 4 cabezas KV (Grouped-Query Attention), y tamano intermedio de 8.192 en las capas densas y 1.024 en las capas MoE. Cada capa contiene 128 expertos, de los que se enrutan 6 por token mas un experto compartido. El vocabulario es de 262.144 tokens.

La model card de la conversion no detalla la composicion del dataset de entrenamiento original, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF, DPO o instruccion tuning. Tampoco se describe ninguna innovacion de decodificacion especulativa ni atencion lineal. La informacion disponible sobre el entrenamiento del modelo base es, por tanto, limitada a los datos arquitectonicos.

La aportacion de brevitech se limita a la conversion: verificacion de integridad de los 26 shards originales en safetensors, mapeo arquitectonico y conversion a GGUF intermedio mediante `llama.cpp` con el pipeline nativo `sarvam-moe`, cuantizacion Q4_K_M con rutinas k-quant multihilo, validacion en una RTX 5090 e integracion con Ollama v0.40.16. En la cuantizacion Q4_K_M, las proyecciones de atencion y gating usan 4 bits con escalas de 6 bits (`q4_K`), `ffn_down` y `attn_qkv` se preservan en 6 bits (`q6_K`), y las capas de normalizacion y embeddings se mantienen en `f32`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y 22 idiomas indios.
- Razonamiento y respuesta a instrucciones en contextos de hasta 128K tokens.
- Capacidad multilingue amplia, con cobertura del subcontinente indio (hindi, bengali, tamil, telugu, marathi, etc.) y sanscrito.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades de vision o audio: no disponibles; el pipeline es `text-generation`.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Compatibilidad con endpoints (`endpoints_compatible`) segun los tags del repositorio.

## Casos de uso

- Atencion al cliente multilingue en la India: el modelo puede gestionar conversaciones multi-turno en hindi, tamil, bengali y otras lenguas indias con una ventana de 128K tokens, lo que permite mantener el historial completo de una sesion larga sin truncar.
- Despliegue local en estaciones de trabajo con GPU de consumo: con 19,58 GB en Q4_K_M cabe en una RTX 4090 o RTX 3090 de 24 GB y permite inferencia a 385,8 tok/s en una RTX 5090, adecuado para prototipado y desarrollo sin costes de API.
- Procesamiento de documentos largos en idiomas indios: la ventana de 131.072 tokens permite resumir, extraer entidades o responder preguntas sobre contratos, informes o articulos extensos en lenguas regionales.
- Traduccion y localizacion entre ingles y lenguas indias: con cobertura de 23 idiomas, sirve para pipelines de traduccion automatica en productos destinados al mercado indio.
- Generacion de contenido editorial regional: redaccion de articulos, descripciones de producto o material de marketing en idiomas como marathi, gujarati o punyabi.
- Investigacion academica en PLN multilingue: al ser Apache 2.0 y estar en GGUF, permite experimentacion reproducible en entornos con recursos limitados y comparacion con otros modelos MoE.
- Asistentes en entornos con requisitos de privacidad: la inferencia local con llama.cpp u Ollama evita enviar datos a servicios externos, util en sanidad, administracion o banca con datos sensibles en idiomas regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica de rendimiento proporcionada es de inferencia en hardware concreto:

| Metrica | Hardware | Valor |
|---|---|---|
| Velocidad de generacion | RTX 5090 (32 GB), `-ngl 99` | 385,8 tokens/s |
| Evaluacion de prompt | RTX 5090 (32 GB), `-ngl 99` | 226,5 tokens/s |

## Requisitos de hardware

- VRAM estimada para inferencia completa: ~19,58 GB de pesos en Q4_K_M; se recomienda entre 24 GB y 32 GB de VRAM para carga total con margen para el contexto KV.
- GPUs recomendadas para offload completo: RTX 5090 (32 GB), RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 6000 Ada (48 GB). Configuracion `-ngl 99` para volcar las 19 capas a VRAM.
- Offload parcial (12-16 GB de VRAM): RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 4070 (12 GB), RTX 3060 (12 GB); requiere al menos 32 GB de RAM de sistema y offload de ~10-14 capas.
- Inferencia solo en CPU: cualquier CPU moderna multinucleo con al menos 32 GB de RAM; funcional pero mas lenta.
- Opciones de despliegue: llama.cpp (commit `8bf88ba93`, build 12558, compilado con CUDA 13.5 y FlashAttention), Ollama (probado con v0.40.16). vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: 385,8 tok/s de generacion y 226,5 tok/s de evaluacion de prompt medidos en RTX 5090 con offload completo; sin cuello de botella PCIe durante la generacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo ni de comparativas directas en la informacion proporcionada. La siguiente tabla recoge unicamente los datos verificables de esta release frente a su version original; no se incluyen modelos alternativos por falta de datos objetivos.

| Modelo | Parametros | Contexto | Formato | Tamano en disco | Licencia |
|---|---|---|---|---|---|
| Sarvam-30B (original, float32) | ~32 B | 128K | Safetensors (26 shards) | 128,61 GB | Apache 2.0 |
| Sarvam-30B (GGUF float16) | ~32 B | 128K | GGUF | 64,34 GB | Apache 2.0 |
| Sarvam-30B Q4_K_M (brevitech) | ~32 B | 128K | GGUF | 19,58 GB | Apache 2.0 |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al cubrir 23 idiomas con distintos volumenes de datos de entrenamiento, es previsible un rendimiento desigual entre lenguas, aunque no se aportan cifras.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni tasas de hallucination.
- La cuantizacion Q4_K_M introduce una degradacion de perplexity respecto a los pesos originales; el autor la describe como "minima" pero no aporta mediciones.
- Solo se publica una unica cuantizacion (Q4_K_M); no hay variantes Q5, Q6, Q8 ni GGUF de mayor precision en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo original en `sarvamai/sarvam-30b` antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica validacion comunitaria practicamente nula.
- La validacion de hardware se limita a una RTX 5090 y Ollama v0.40.16; no hay pruebas publicadas en otras GPUs ni en otros runtimes.
- El contexto de 128K requiere memoria KV adicional significativa; en GPUs de 24 GB con carga completa el contexto efectivo puede verse reducido.
- No se documentan capacidades de tool calling, agentes ni vision; no deben asumirse en produccion sin verificacion previa.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/brevitech/sarvam-30b-gguf
- Modelo original de Sarvam AI: https://huggingface.co/sarvamai/sarvam-30b
- llama.cpp (herramienta de conversion y runtime): https://github.com/ggml-org/llama.cpp
- Ollama (runtime probado, v0.40.16): https://ollama.com
- Paper, blog o demo oficiales de Sarvam-30B: no disponibles en la informacion proporcionada.
