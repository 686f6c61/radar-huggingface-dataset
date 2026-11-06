# hossain0909/Keural-Cortex-8B-SFT-step903

## Resumen

Keural-Cortex-8B es un modelo de lenguaje bilingüe (coreano e inglés) desarrollado por MKD Co., Ltd. dentro de su plataforma Keural. Se construye a partir de Qwen/Qwen3-8B mediante un proceso de preentrenamiento continuado propio y una extensión de contexto hasta 65.536 tokens, seguido de un ajuste supervisado (SFT) de una época sobre 1.420 millones de tokens de instrucciones. Este repositorio concreto contiene el checkpoint del paso 903 de ese SFT.

El modelo emplea la arquitectura Qwen3ForCausalLM: transformer decoder-only de 36 capas, dimensión oculta 4096, FFN de 12288 con SwiGLU, RMSNorm con epsilon 1e-6 y atención con grouped-query attention (32 cabezas de consulta y 8 de clave/valor, head_dim 128). El vocabulario es de 151.936 tokens y los pesos se distribuyen en bf16. Según los safetensors publicados, el repositorio contiene 2.047.683.840 parámetros, un dato que no coincide con los 8,19 B que declara la model card del autor; conviene verificar la integridad del checkpoint antes de usarlo en producción.

Su relevancia es doble. Por un lado, cubre el hueco de modelos abiertos con foco real en coreano y capacidades de tool calling y contexto largo. Por otro, el autor lo publica explícitamente como checkpoint de investigación con defectos reproducibles documentados: se autoidentifica de forma incorrecta y devuelve respuestas vacías ante prompts cortos (menos de unos 70 tokens) si no se envía un system prompt. Es, por tanto, un artefacto de transparencia y reproducibilidad, no un producto terminado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, 36 capas, hidden 4096, FFN 12288, SwiGLU, RMSNorm 1e-6) |
| Parametros totales | 8,19 B según model card; 2.047.683.840 según safetensors del repo (discrepancia no resuelta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (32.768 nativos, extendidos con YaRN factor 2.0, rope_theta 1e6) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; el autor no documenta GGUF/AWQ/GPTQ) |
| Idiomas soportados | coreano (foco principal), inglés |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (bf16, 399 tensores, 16,38 GB) |

## Arquitectura y entrenamiento

La base es Qwen3-8B, un transformer decoder-only con atención GQA (32 cabezas de consulta, 8 de clave/valor, head_dim 128) y vocabulario de 151.936 tokens. Sobre esa base, MKD aplicó un preentrenamiento continuado propio seguido de una extensión de contexto mediante YaRN con factor 2,0 y rope_theta 1e6, lo que duplica la ventana nativa de 32.768 a 65.536 tokens. La plantilla de chat es híbrida, al estilo Qwen3, y permite alternar entre modo con razonamiento (`enable_thinking=True`, el modelo abre un bloque `<think>`) y modo directo (`enable_thinking=False`, se inyecta un bloque `<think>` vacío).

El ajuste supervisado que produce este checkpoint cubre una época completa sobre 1.420 millones de tokens de instrucciones, e incluye ejemplos de llamadas a herramientas simples, múltiples, paralelas y secuenciales en formato OpenAI function schema, emitidas como bloques `<tool_call>` con JSON. No se aplicó optimización de preferencias: no hay DPO ni RLHF, y la alineación de seguridad se limita a lo que aporta el propio dataset de instrucciones. El autor no detalla la composición del corpus de preentrenamiento continuado ni la mezcla exacta del SFT.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con plantilla de chat multi-turno.
- Razonamiento explícito en modo thinking, con bloque `<think>` y muestreo recomendado distinto (temperatura 0,6, top_p 0,95 frente a 0,7/0,8 en modo directo).
- Generación de código y razonamiento matemático, según el uso previsto declarado por el autor.
- Tool calling y function calling con esquema OpenAI; el parser `hermes` de vLLM interpreta las llamadas.
- Llamadas a herramientas simples, múltiples, paralelas y secuenciales representadas en los datos de entrenamiento.
- Preguntas y respuestas sobre documentos largos de hasta 64K tokens.
- Traducción y resumen bilingüe coreano-inglés.
- Modo thinking activable o desactivable por petición mediante `enable_thinking`.

## Casos de uso

- Asistente conversacional coreano-inglés: el modelo mantiene diálogos multi-turno con 65.536 tokens de contexto, adecuado para atención al cliente en coreano donde se necesita recordar el historial completo de la conversación.
- Preguntas sobre documentos largos: contratos, informes o manuales de hasta 64K tokens pueden cargarse en el contexto para extracción de datos y resumen, sin necesidad de fragmentación.
- Traducción coreano-inglés en pipelines de contenido: el bilingüismo nativo del ajuste lo hace útil para localización de documentación técnica y material editorial.
- Agentes con herramientas en producción interna: el soporte de function calling con esquema OpenAI y el parser `hermes` de vLLM permiten integrarlo en flujos que consultan APIs (clima, bases de datos, CRM) mediante llamadas secuenciales.
- Generación de código asistida: el modo thinking con muestreo a temperatura 0,6 y top_p 0,95 está pensado para tareas de varios pasos, como refactorizaciones o generación de tests.
- Razonamiento matemático y análisis: útil en entornos educativos o de análisis financiero interno donde se requiere cadena de razonamiento explícita y auditable.
- Investigación sobre ajuste fino bilingüe: al ser un checkpoint intermedio con defectos documentados, sirve como referencia reproducible para estudiar el efecto del SFT en modelos Qwen3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 16,4 GB solo para pesos; con caché KV para 65.536 tokens se necesita bastante más, y el autor recomienda `--kv-cache-dtype fp8` para servir la ventana completa en una única GPU de 80 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para contexto completo en una sola tarjeta; dos GPU con tensor parallelism para mayor throughput en contexto largo (el ejemplo de vLLM usa `--tensor-parallel-size 2`).
- GPU de consumo: los pesos en bf16 caben en una RTX 4090 de 24 GB, pero el contexto completo no; haría falta cuantización (no publicada por el autor) o reducir `--max-model-len` de forma drástica.
- Despliegue: transformers (referencia del autor), vLLM >= 0.29.0 con `--enable-auto-tool-choice`, `--tool-call-parser hermes` y `--reasoning-parser qwen3`. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tool calling | Estado |
|---|---|---|---|---|---|---|
| Keural-Cortex-8B-SFT-step903 | 8,19 B (declarado) / 2,05 B (safetensors) | 65.536 | ko, en | Apache 2.0 | Sí (esquema OpenAI) | Checkpoint de investigación con defectos documentados |
| Qwen/Qwen3-8B | 8 B | 32.768 nativo (extensible) | multilingüe | Apache 2.0 | Sí | Modelo base estable, sin foco específico en coreano |
| Modelos coreanos abiertos de 7-8 B | no disponible | no disponible | ko, en | variable | variable | No disponible en la información proporcionada |

La comparación directa con alternativas coreanas específicas no puede completarse con los datos disponibles. Frente a su base Qwen3-8B, la diferencia principal es la ventana ampliada a 65.536 tokens y el ajuste bilingüe, a costa de los defectos reproducibles que el propio autor documenta.

## Limitaciones y advertencias

- Checkpoint de investigación, no producto: el autor lo declara explícitamente y anuncia una versión corregida en entrenamiento.
- Autodefinición incorrecta: el modelo se identifica erróneamente, lo que puede contaminar respuestas sobre sí mismo o sobre su origen.
- Respuestas vacías en prompts cortos: sin system prompt, las peticiones de menos de unos 70 tokens devuelven cadena vacía. Es un fallo que afecta al uso inmediato.
- Selección de herramientas débil: el propio autor señala el tool selection como el comportamiento más flojo del checkpoint, aunque el formato de llamada sea correcto.
- Sin alineación de seguridad más allá del SFT: no hay DPO ni RLHF, por lo que no es apto para despliegue no supervisado en contextos médicos, legales, financieros o de seguridad crítica.
- Riesgo de alucinación: el autor advierte contra cualquier uso donde una respuesta segura pero errónea cause daño.
- Discrepancia de parámetros: la model card declara 8,19 B y los safetensors del repo suman 2,05 B; hay que verificar el checkpoint antes de confiar en él.
- Cobertura lingüística limitada a coreano e inglés; el rendimiento en castellano no está documentado.
- Repetición en modo thinking con decodificación greedy: el autor recomienda evitar greedy en ese modo.
- Licencia Apache 2.0 permite uso comercial, pero los defectos documentados desaconsejan producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/Keural-Cortex-8B-SFT-step903
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Documentación de vLLM (parser `hermes` y `qwen3`): https://docs.vllm.ai
- Repositorio de transformers: https://github.com/huggingface/transformers
