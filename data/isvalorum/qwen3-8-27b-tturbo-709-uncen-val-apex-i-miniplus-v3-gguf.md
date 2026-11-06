# IsValorum/Qwen3.8-27B-TTURBO-709-Uncen-VAL-APEX-I-MiniPlus-V3-GGUF

## Resumen

Qwen3.8-27B-TTURBO-709-Uncen-VAL-APEX-I-MiniPlus-V3 es una cuantización GGUF del modelo base `DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored`, publicada por el usuario IsValorum bajo su serie APEX. El modelo subyacente es un derivado "uncensored" de la familia Qwen3.8 de 27B con capacidad de visión, y esta release concreta empaqueta los pesos en un único fichero GGUF de 14,29 GB con tipos de cuantización mixtos (Q4_K, IQ4_XS, IQ3_S, IQ3_XXS, Q5_K, Q6_K y F32 en las capas sensibles).

La arquitectura es un transformer híbrido denso de 64 capas que combina 48 capas SSM (state space model) con 16 capas de atención completa, más un bloque MTP (multi-token prediction) de 15 tensores en `blk.64.*` incluido en el mismo GGUF. El contexto declarado es de 262.144 tokens, lo que lo sitúa en la gama de ventanas largas. El modelo soporta entrada imagen-texto mediante un proyector de visión separado (`mmproj-BF16.gguf`, 931 MB).

La relevancia de esta ficha es doble: por un lado, documenta una cuantización de calidad auditable (el autor publica un mapa de tensores por capa y precisión); por otro, advierte de que se trata de un modelo derivado de un fine-tune "uncensored" de procedencia comunitaria, con benchmarks autoinformados y sin validación independiente de visión ni MTP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso: 64 capas, 48 SSM + 16 atención completa, bloque MTP adicional |
| Parametros totales | 27.320.697.856 (27,32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (declarado); 32.768 recomendado en los ejemplos de uso |
| Tipos de cuantizacion | Mixta: Q4_0, Q4_1, Q4_K, Q5_K, Q6_K, Q8_0, IQ3_S, IQ3_XXS, IQ4_XS, F32 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero único de 14.287.547.424 bytes); proyector de visión en GGUF BF16 aparte |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido con 64 capas: 48 capas basadas en SSM (state space model) y 16 capas de atención completa distribuidas en las posiciones 3, 7, ..., 63. Esta combinación busca reducir el coste computacional y de memoria del contexto largo manteniendo la capacidad de atención global en capas seleccionadas. El bloque MTP (multi-token prediction) añade 15 tensores en `blk.64.*` que permiten decodificación especulativa sin fichero draft separado, siempre que la build de llama.cpp lo soporte. El total de tensores de texto es de 851 más 15 de MTP; el proyector de visión aporta 333 tensores adicionales.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF, DPO u otras etapas de alineamiento. El autor de la cuantización no documenta estos datos, y la model card del modelo base no se ha incluido en la información proporcionada. La cuantización emplea una iMatrix pública de mradermacher (319 x 512) que cubre 448 de los 450 tensores de texto cuantizados; `output.weight`, `token_embd.weight` y el bloque MTP no usan la matriz. Las capas recurrentes sensibles (`ssm_alpha`, `ssm_a`, `ssm_dt.bias`, `ssm_conv1d` y las RMSNorm) se mantienen en F32 para preservar estabilidad numérica, y la capa 0 usa Q4_0 en `attn_gate`, `attn_qkv`, `ssm_beta` y `ssm_out`.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat DAU TTURBO embebida en el GGUF.
- Razonamiento y generación de código (capacidad heredada del modelo base Qwen3.8, no verificada de forma independiente en esta cuantización).
- Entrada imagen-texto mediante el proyector de visión `mmproj-BF16.gguf`; requiere cargar el proyector con `--mmproj` en llama-server.
- Decodificación especulativa mediante el bloque MTP incluido en el GGUF principal (dependiente de la build de llama.cpp y su configuración).
- Soporte multilingüe limitado a inglés y chino según los metadatos de la model card.
- Modo "uncensored": el fine-tune base elimina parte de los filtros de rechazo del modelo original, lo que cambia el comportamiento en prompts sensibles.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- No se documenta soporte explícito de agentes o multi-step reasoning más allá de lo que permita la ventana de contexto.

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens de contexto declarados, el modelo puede ingerir informes, expedientes o bases de código extensas en una sola pasada; en la práctica se recomienda operar con `-c 32768` para controlar el consumo de memoria.
- Análisis de imágenes en entornos sin conexión: cargando el proyector de visión con `llama-server --mmproj`, se pueden hacer preguntas sobre capturas, diagramas o fotografías en hardware de gama alta de consumo.
- Asistente conversacional autoalojado: la plantilla DAU TTURBO embebida y el formato GGUF permiten desplegarlo con llama.cpp u Ollama en una estación de trabajo, sin depender de APIs externas.
- Generación de código asistida en local: el tamaño de 27B y la cuantización de 14,29 GB lo hacen viable en GPUs con 16-24 GB de VRAM, útil para autocompletado y refactorización en entornos con requisitos de privacidad.
- Investigación sobre modelos híbridos SSM/atención: la mezcla de 48 capas SSM y 16 de atención completa permite estudiar el comportamiento de arquitecturas híbridas en tareas de contexto largo sin necesidad de infraestructura de datacenter.
- Experimentación con decodificación especulativa: el bloque MTP integrado permite probar configuraciones de speculative decoding en llama.cpp sin gestionar un modelo draft separado.
- Evaluación de cuantizaciones mixtas: el mapa de tensores auditado por capa y precisión sirve como referencia para estudiar el impacto de IQ3_XXS, IQ3_S o IQ4_XS en capas concretas sobre la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los benchmarks del modelo base son autoinformados por DavidAU y que visión y MTP no fueron validados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero principal pesa 14,29 GB; con overhead de contexto y caché KV, se recomienda un mínimo de 16 GB de VRAM para contexto corto (8K-16K) y 24 GB o más para contextos de 32K.
- El proyector de visión añade 931 MB adicionales que deben residir en memoria junto al modelo.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso cómodo con contexto medio; A100 40/80 GB o H100 para contexto completo de 262.144 tokens y despliegue multiusuario.
- En GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16GB) cabe con contexto reducido y offload parcial de capas a CPU (`-ngl` ajustado).
- En GPUs de 12 GB o menos es necesario offload sustancial a RAM del sistema, con caída notable de throughput.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, Ollama y otros runners basados en llama.cpp. No se documenta compatibilidad con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. Dependen de la build de llama.cpp, del soporte efectivo de MTP y del reparto de capas entre GPU y CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (APEX-I MiniPlus V3) | 27,32B denso híbrido | 262.144 | Sí (proyector aparte) | Apache-2.0 | GGUF 14,29 GB | Cuantización mixta con mapa auditable |
| IsValorum APEX-I NanoPlus V3 | 27,32B (mismo base) | 262.144 | Sí (proyector aparte) | Apache-2.0 | GGUF | Variante de menor tamaño de la misma familia |
| DavidAU Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | 27,32B | 262.144 | Sí | Apache-2.0 | Safetensors / GGUF | Modelo base sin cuantizar de esta release |

No se dispone de datos de benchmarks para establecer una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo "uncensored": el fine-tune base elimina parte de los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido inapropiado, dañino o legalmente problemático sin filtros. No es adecuado para aplicaciones orientadas al público sin una capa de moderación adicional.
- Benchmarks autoinformados: los datos de rendimiento del modelo base provienen del autor del fine-tune, no de una evaluación independiente.
- Visión y MTP no validados de forma independiente según la propia model card.
- Idiomas limitados a inglés y chino en los metadatos; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a modelos de 27B sin datos de evaluación pública que lo cuantifiquen.
- La licencia Apache-2.0 permite uso comercial, pero el carácter "uncensored" del fine-tune traslada al desplegador la responsabilidad sobre el contenido generado.
- El contexto de 262.144 tokens es una cifra declarada; el rendimiento real en ventanas muy largas no está verificado y el consumo de memoria crece de forma significativa.
- La decodificación especulativa vía MTP depende de la build de llama.cpp y su configuración; no está garantizada en todas las versiones.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Es una cuantización de terceros: la calidad final depende tanto del modelo base como de las decisiones de precisión por capa del cuantizador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-TTURBO-709-Uncen-VAL-APEX-I-MiniPlus-V3-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Variante NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-TTURBO-709-Uncen-VAL-APEX-I-NanoPlus-V3-GGUF
- Colección MiniPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-standard-27b-6acfec54ca4ce4cf5cd5bdb6
- Colección NanoPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-standard-27b-6acfec55c1c99e2a23ebbd9b
- Proyector de visión (mmproj-BF16.gguf): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF/blob/main/mmproj-BF16.gguf
- Plantilla de chat (chat_template.jinja): https://huggingface.co/IsValorum/Qwen3.8-27B-TTURBO-709-Uncen-BF16-GGUF/blob/main/chat_template.jinja
- Apoyo al cuantizador: https://ko-fi.com/isvalorum
