# KRAFTON/Raon-1-nano

## Resumen

Raon-1 nano es un modelo de lenguaje denso desarrollado por KRAFTON AI, el brazo de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. Con aproximadamente 3.100 millones de parámetros efectivos (3.530 millones contando el módulo de predicción multi-token y la tabla de embeddings por capa), está disenado para seguir instrucciones, mantener contexto conversacional y ejecutar llamadas a herramientas tanto en coreano como en inglés. Se distribuye bajo licencia Apache 2.0.

El modelo emplea una arquitectura híbrida de atención: 18 capas de atención lineal Raon Delta Attention (RDA) combinadas con 6 capas de Gated MLA, sobre un total de 24 capas. Incorpora innovaciones como Raon-mHC para reducir el coste computacional de las hyper-connections y embeddings por capa de 256 dimensiones. Soporta de forma nativa hasta 262.144 tokens de contexto, lo que lo sitúa en un rango poco habitual para su tamano.

Su relevancia actual radica en que deriva de un modelo mayor (Raon-1 mini preview, 30B-A4B) mediante una técnica de poda y destilación MoE-to-Dense, y se ofrece en formatos GGUF, MLX y LiteRT-LM para despliegue en dispositivo, incluidos equipos con Apple silicon. Esto lo convierte en una opción atractiva para inferencia local con contexto largo y capacidades de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (RDA lineal + Gated MLA), 24 capas |
| Parametros totales | 3.529.911.376 (3,1B modelo principal + 55M MTP + embeddings por capa) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (se ofrecen formatos GGUF, MLX y LiteRT-LM, pero no se detallan los niveles) |
| Idiomas soportados | Coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF, MLX y LiteRT-LM para despliegue local |

Otros datos técnicos: hidden size 1.536, FFN intermedio 6.144, activación SwiGLU, vocabulario de 259.840 tokens, LM head con embeddings atados, codificación posicional NoPE, 16 cabezas en RDA (dimensión 128) y 32 cabezas en Gated MLA (192 QK / 128 V), rango LoRA de query/KV de 512/512, residuales Raon-mHC con 4 streams y embedding por capa de 256 dimensiones.

## Arquitectura y entrenamiento

Raon-1 nano combina 18 capas de Raon Delta Attention (atención lineal con regla delta con puertas, estado recurrente de tamano fijo y puertas separadas de borrado y escritura) con 6 capas de Gated MLA que mantienen caché KV (aproximadamente 7 KiB por token en BF16). La disposición híbrida reduce drásticamente el coste de memoria en contextos largos, ya que solo una cuarta parte de las capas conserva caché. Emplea NoPE (sin codificación posicional explícita) y una conexión residual Raon-mHC con 4 streams que abarata computacionalmente las manifold-constrained hyper-connections de DeepSeek. Cada capa dispone de un embedding propio de 256 dimensiones que ajusta su salida tras el MLP.

El entrenamiento parte de Raon-1 mini preview (30B-A4B) mediante poda y destilación MoE-to-Dense (paper arXiv:2605.28207). Posteriormente se realizó un preentrenamiento continuado con 3 billones de tokens, seguido de ajuste fino supervisado (SFT), destilación on-policy (OPD) desde el modelo mayor y una fase final de aprendizaje por refuerzo (RL). El checkpoint incluye un módulo de predicción multi-token (MTP) de una capa y 55M de parámetros, útil para decodificación especulativa.

## Capacidades

- Generación de texto y conversación multi-turno con seguimiento fiel de instrucciones y contexto.
- Razonamiento y respuesta a instrucciones en coreano e inglés, con especial solidez en coreano.
- Llamada a herramientas (tool calling) dentro de conversaciones, orientada a tareas de oficina y control de dispositivos móviles.
- Capacidades de agente y razonamiento multi-paso mediante tool calling encadenado.
- Contexto largo nativo de hasta 262.144 tokens.
- Decodificación especulativa mediante el módulo MTP incluido.
- Despliegue en dispositivo (on-device) vía GGUF, MLX y LiteRT-LM.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistencia conversacional en coreano e inglés: el modelo mantiene contexto multi-turno gracias a su ventana de 262.144 tokens, adecuado para chatbots de atención al cliente con historiales largos.
- Automatización de tareas de oficina con tool calling: puede invocar funciones para gestionar correo, calendario o documentos dentro de un flujo conversacional.
- Control de dispositivos móviles: su soporte de tool calling y su despliegue en LiteRT-LM lo hacen apto para asistentes embebidos en el dispositivo.
- Inferencia local en Apple silicon: los formatos MLX y GGUF permiten ejecutar el modelo en portátiles y equipos de sobremesa sin GPU dedicada de datacenter.
- Procesamiento de documentos extensos: la ventana de 262.144 tokens permite resumir o extraer información de contratos, informes o transcripciones largas en una sola pasada.
- Agentes multi-paso: encadenamiento de llamadas a herramientas para flujos de automatización (por ejemplo, consulta de datos y generación de respuestas).
- Desarrollo de asistentes bilingües coreano-inglés para productos dirigidos al mercado surcoreano.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de benchmarks (instrucciones, seguimiento de contexto, conversación en coreano y tool calling) frente a modelos abiertos de tamano similar, pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de 3,5B parámetros, en BF16 se requieren aproximadamente 7 GB de pesos, y en cuantizaciones de 4 bits alrededor de 2 GB, aunque el autor no publica cifras oficiales.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabría en RTX 4090, RTX 3090 y GPUs de datacenter como A100 o H100; para contexto largo conviene GPU con amplia memoria.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 8 GB o más en cuantización, aunque no se confirma oficialmente.
- Opciones de despliegue: transformers, llama.cpp (GGUF), MLX (Apple silicon) y LiteRT-LM. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Raon-1 nano | 3,5B (3,1B efectivos) | 262.144 | Apache 2.0 | safetensors, GGUF, MLX, LiteRT-LM | Híbrido RDA+MLA, bilingüe coreano/inglés, tool calling |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: entrenado principalmente en coreano e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: como todo modelo generativo, puede producir información incorrecta, especialmente en dominios especializados.
- Sesgos: no se documentan evaluaciones de sesgo; los datos de entrenamiento (3T tokens) pueden introducir sesgos culturales o lingüísticos.
- Contexto largo: aunque soporta 262.144 tokens, el rendimiento efectivo en ventanas muy largas no está cuantificado en la información disponible.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene verificar las dependencias de código personalizado (custom_code) del repositorio.
- Producción: el modelo tiene pocas descargas (58) y fue creado recientemente (octubre de 2026), por lo que su validación comunitaria es limitada.
- El módulo MTP y la arquitectura híbrida requieren soporte específico en el runtime; no todos los frameworks de inferencia lo soportan de serie.

## Enlaces

- Hugging Face: https://huggingface.co/KRAFTON/Raon-1-nano
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Paper MoE-to-Dense: https://arxiv.org/abs/2605.28207
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Web corporativa: https://www.krafton.com/en/
