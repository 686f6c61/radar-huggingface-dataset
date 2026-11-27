# neurarank/voice-ai-s2s

## Resumen

VOICE AI S2S FUSION es un modelo de conversación de voz extremo a extremo (speech-to-speech) desarrollado por neurarank que opera directamente sobre señal de audio PCM a 48 kHz, eliminando la arquitectura en cascada tradicional (STT → LLM → TTS). El modelo combina un backbone neuronal de 442M parámetros con arquitectura Sparse MoE, al que se añaden dos adaptadores desacoplados: un adaptador Full-Duplex de 4,53M parámetros para interacción conversacional bidireccional y una Extension Learning Layer de 548K parámetros que actúa como pasarela hacia el Model Context Protocol (MCP) y la ejecución de herramientas.

La propuesta diferencial es la conversación full-duplex real: el modelo escucha y responde simultáneamente, gestiona barge-in físico con latencia de corte de 25,25 ms y genera backchannels en vietnamita con F1 de 0,9474. Incorpora además un runtime cognitivo con proyecciones multimodales (audio, texto, visión, documento) y un sandbox de seguridad que aísla credenciales del contexto del modelo.

Es relevante ahora porque aborda el cuello de botella de latencia de los pipelines conversacionales tradicionales con un TTFA P50 de 111,63 ms y un factor de tiempo real (RTF) de 0,0138, con licencia Apache 2.0 y despliegue disponible vía Docker y Gradio. Sus idiomas declarados son vietnamita e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse MoE Transformer (encoder Causal Conformer + decoder Causal RVQ + vocoder neuronal) |
| Parametros totales | 442.360.650 (backbone) + 4.532.995 (Full-Duplex Adapter) + 548.684 (Extension Learning Layer) |
| Parametros activos | top-2 de 8 expertos locales por capa (no se especifica el recuento exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (backbone), .pt (adaptadores PyTorch) |

## Arquitectura y entrenamiento

El backbone es un transformer MoE disperso de 8 capas con 8 expertos locales y enrutamiento top-2, atención GQA (12 cabezas de query, 4 de key/value) y RoPE. La entrada de audio pasa por un encoder Causal Conformer de 4 capas con tramas latentes de 80 ms (12,5 Hz) y dimensión 768. La salida se genera mediante un decoder Causal RVQ de 16 cuantizadores (codebook de 1024 entradas) seguido de un vocoder neuronal que sintetiza waveform PCM a 48 kHz directamente. El chunk de streaming causal es de 80 ms (3.840 muestras a 48 kHz), con soporte de conversión a 16 kHz para telefonía.

Sobre el backbone se montan dos ramas desacopladas. La rama Full-Duplex emplea cross-attention de doble flujo para procesar simultáneamente los streams de ingress (usuario) y egress (asistente), con gestión de barge-in mediante `interrupt()` que cancela la reproducción y hace rollback del KV Cache en 1,25 ms. La Extension Learning Layer traduce vectores latentes a invocaciones de herramientas estructuradas vía MCP, con 24 acciones nativas sobre 7 proveedores de infraestructura. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Conversación speech-to-speech extremo a extremo sobre audio crudo a 48 kHz, sin pipeline STT/LLM/TTS intermedio.
- Full-duplex: escucha y respuesta simultáneas mediante cross-attention de doble flujo.
- Barge-in: detección de interrupción del usuario con corte físico en 25,25 ms y rollback de KV Cache en 1,25 ms.
- Backchannels conversacionales en vietnamita ("dạ", "vâng", "ừm") con F1 de 0,9474.
- Tool calling y function calling vía Model Context Protocol (MCP), con pasarela Stdio y HTTP y precisión de selección de herramienta del 100% según el autor.
- Ejecución de 24 acciones nativas sobre 7 proveedores de infraestructura.
- Proyecciones multimodales: audio, texto, visión y documento.
- Sandbox de seguridad cognitiva con protección frente a SSRF, SQLi y command injection, y aislamiento de tokens y credenciales fuera del contexto del modelo.
- Capacidades multilingües limitadas a vietnamita e inglés.

## Casos de uso

- Atención al cliente telefónica: el modelo procesa audio a 16 kHz vía el conversor de telefonía y responde en full-duplex, permitiendo al usuario interrumpir sin esperar al final del turno gracias al corte de barge-in de 25,25 ms.
- Asistentes de voz para mercados de Vietnam: los backchannels nativos en vietnamita con F1 de 0,9474 y el soporte de idioma vi lo hacen adecuado para interfaces conversacionales dirigidas a ese mercado.
- Agentes de voz con ejecución de acciones: la Extension Learning Layer y la pasarela MCP permiten encadenar la intención hablada con invocaciones estructuradas a 24 acciones sobre 7 proveedores de infraestructura, por ejemplo consultas de estado o automatizaciones.
- Recepción y triaje en kioscos o centralitas: con TTFA P50 de 111,63 ms y RTF de 0,0138, la conversación resulta viable en tiempo real incluso en hardware de gama media.
- Transcripción y respuesta con contexto documental: las proyecciones multimodales de documento permiten responder consultas habladas apoyadas en material escrito aportado al runtime.
- Despliegue en entornos con requisitos de seguridad: el sandbox con protección SSRF/SQLi/command injection y el aislamiento de credenciales facilitan integraciones en producción donde el modelo no debe ver secretos.
- Prototipado e investigación en interacción full-duplex: la app Gradio y el perfil Docker standalone permiten evaluar el comportamiento conversacional sin montar infraestructura propia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| TTFA P50 (latencia al primer audio) | 111,63 ms |
| RTF (factor de tiempo real) | 0,0138 (≈13,8 ms por segundo de audio) |
| PESQ | 4,24 (estudio) / 1,539 (canal con ruido simulado) |
| STOI | 0,996 |
| Latencia de barge-in | 25,25 ms |
| F1 de backchannel | 0,9474 |
| Precisión de selección de herramienta | 100% (según el autor) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 442M parámetros en safetensors y un repo de 2,8 GB, la inferencia en fp32 requiere del orden de 1,8 GB solo para pesos, más overhead de activaciones y vocoder. En fp16 el peso del backbone se reduce aproximadamente a la mitad.
- GPU recomendadas: el autor reporta ejecución en NVIDIA GPU (CUDA) y Apple Silicon (MPS); no se especifican modelos concretos de GPU.
- Cabe en GPU de consumo: por tamaño de parámetros, sí es plausible en GPUs consumer con suficiente VRAM, aunque el fabricante no publica una lista de compatibilidad verificada.
- Opciones de despliegue: transformers (librería declarada, con custom_code), Docker (perfil standalone), Gradio (consola interactiva `app.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFA P50 de 111,63 ms y RTF de 0,0138 medidos en Apple Silicon (MPS) o NVIDIA (CUDA).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Idiomas |
|---|---|---|---|---|---|
| neurarank/voice-ai-s2s | 442M backbone + 4,53M + 548K adaptadores | no disponible | Speech-to-speech full-duplex con MCP | Apache 2.0 | vi, en |
| Moshi (Kyutai) | no disponible en la información | no disponible | Speech-to-speech full-duplex | no disponible | no disponible |
| NVIDIA PersonaPlex | no disponible en la información | no disponible | Comportamiento conversacional full-duplex | no disponible | no disponible |

La model card cita explícitamente a NVIDIA PersonaPlex y Moshi como referencias de las que se adoptaron comportamientos full-duplex; no se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística restringida a vietnamita e inglés; no hay soporte declarado de castellano.
- No se especifican la longitud de contexto, los tipos de cuantización ni el volumen o composición de los datos de entrenamiento, lo que dificulta evaluar robustez y sesgos.
- Los benchmarks publicados son de latencia y calidad de audio; no hay métricas de razonamiento, código o matemáticas, por lo que el rendimiento cognitivo del backbone no está validado de forma independiente.
- La cifra de 100% de precisión en selección de herramienta procede del propio autor y no se ha verificado externamente.
- El PESQ cae de 4,24 en estudio a 1,539 en canal con ruido simulado, lo que anticipa degradación notable en condiciones telefónicas reales.
- Riesgo de alucinación en las respuestas generadas: no se documentan mecanismos de mitigación ni tasas medidas.
- El modelo requiere `trust_remote_code` (custom_code) para cargarse con transformers, lo que implica ejecutar código del autor.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de documentación sobre sesgos y evaluación limita su idoneidad para producción sin validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/neurarank/voice-ai-s2s
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios o demos adicionales.
