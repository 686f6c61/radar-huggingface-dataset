# 2Beyes/Aurum_4b-safetensors

## Resumen

Aurum 4B v1 Uncensored es un ajuste del modelo Qwen3.5-4B de Alibaba en el que se ha eliminado el comportamiento de rechazo (refusal) mediante una edición quirúrgica de pesos, conservando el resto de parámetros originales. Lo desarrolla el usuario 2Beyes y se distribuye bajo licencia Apache-2.0. El modelo mantiene la torre de visión y la cabeza de predicción multi-token (MTP) de Qwen, por lo que sigue siendo un modelo multimodal image-text-to-text con capacidad de tool calling y modo de razonamiento.

La propuesta es deliberadamente minimalista: en lugar de un fine-tuning completo sobre datos de destilación, el autor toma la diferencia de pesos entre Qwen3.5-4B y un modelo "abliterated" (distill-heretic) y retiene únicamente las direcciones singulares responsables de la supresión de rechazos, en las proyecciones de salida de atención y de la FFN. El resultado es un modelo de 4,66 mil millones de parámetros que cabe en GPUs de 8 GB en cuantización Q4 y que conserva el conocimiento del modelo base.

Es relevante ahora porque demuestra una técnica de "abliteración selectiva" reproducible y verificable (el repo incluye un `build_log.json` con cada tensor modificado), y porque ofrece una alternativa ligera para despliegues de agentes con tool calling en hardware de consumo. La contrapartida es explícita: el modelo no rechaza peticiones dañinas, lo que limita seriamente su uso en producción abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con torre de visión y cabeza MTP; `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors); GGUF Q3_K_M a Q8_0, BF16 y proyector de visión (repo GGUF aparte) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP), que se conservan sin cambios. No hay entrenamiento adicional en el sentido clásico: el autor calcula la diferencia de pesos entre Qwen3.5-4B y `insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated` y retiene solo la componente asociada a la eliminación de rechazos. Concretamente, en las capas 4 a 31 aplica las 8 direcciones singulares principales del cambio (aproximadamente el 98 % de la modificación) sobre los pesos de salida de atención (`self_attn.o_proj` / `linear_attn.out_proj`), y en `mlp.down_proj` aplica una única dirección principal, solo en tensores donde representa más de la mitad del cambio. El resto de modificaciones del modelo Heretic (su fine-tuning de destilación) no se incluye.

El config, el tokenizer y la plantilla de chat provienen del modelo Heretic (mismo tokenizer que Qwen3.5). Las cuantizaciones GGUF se generaron con llama.cpp (build b12289) usando una importance matrix calculada sobre una mezcla "hermana" de Aurum con texto de prosa, código y conversaciones de tool calling. El autor indica que esta variante (`c-v1u`) superó a otras dos candidatas en pruebas selladas: misma precisión en tool calling, más conocimiento y cero rechazos. Los pesos safetensors son idénticos tensor a tensor al GGUF BF16 evaluado, verificado mediante reconversión y comparación.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con modo "thinking" activable mediante `enable_thinking` en la plantilla de chat, igual que Qwen3.5.
- Tool calling / function calling, con soporte de llamadas simples, múltiples, paralelas y evaluación de irrelevancia (BFCL).
- Capacidades de agente y razonamiento multi-paso, apoyadas en la cabeza MTP.
- Procesamiento de imagen y vídeo mediante la torre de visión de Qwen (pipeline image-text-to-text).
- Conocimiento general heredado del modelo base Qwen3.5-4B.
- Ausencia deliberada de rechazos: 0 rechazos en 100 prompts dañinos de prueba según el autor.

## Casos de uso

- Agentes de tool calling en local: el modelo puede ejecutar llamadas a funciones simples, múltiples y paralelas, lo que permite construir asistentes que consulten APIs, bases de datos o servicios internos en una máquina con 8 GB de VRAM.
- Automatización de escritorio o CI/CD con herramientas: integrado vía llama.cpp u Ollama, puede invocarse como paso de razonamiento que decide qué herramienta llamar y con qué argumentos en pipelines de automatización.
- Procesamiento de documentos con imagen: al conservar la torre de visión, puede extraer y razonar sobre capturas, formularios o diagramas en flujos de digitalización.
- Investigación sobre alineación y abliteración: sirve como caso de estudio reproducible de edición selectiva de pesos, con `build_log.json` documentando cada tensor afectado y su proporción de cambio.
- Generación de código asistida en entornos controlados: útil para autocompletado y explicación de fragmentos donde no se requiere un modelo de gran tamaño y se prioriza baja latencia.
- Chat conversacional de propósito general en inglés sobre hardware de consumo: adecuado para prototipos, demos y uso personal donde el operador asume la responsabilidad del contenido generado.
- Evaluación comparativa de técnicas de "uncensoring": permite medir el impacto de eliminar la destilación frente a conservar solo la edición de rechazos, usando el modelo Heretic como referencia.

## Benchmarks y rendimiento

El autor publica una comparación frente a Distill-Heretic 4B (Q4_K_M, thinking off, decodificación greedy, sin system prompt, runner propio). Los resultados numéricos se presentan en imágenes (`benchmark-comparison.png`, `bfcl-netgraph.png`) y no se transcriben en la model card, por lo que no se dispone de cifras exactas.

| Benchmark | Aurum 4B | Distill-Heretic 4B | Notas |
|---|---|---|---|
| BFCL (simple, multiple, parallel, parallel-multiple, irrelevance) | no disponible (solo gráfico) | no disponible (solo gráfico) | AST checker `bfcl-eval`, generaciones propias |
| GPQA | no disponible (solo gráfico) | no disponible (solo gráfico) | Límite de 3.072 tokens; 84 de 198 respuestas de Aurum agotaron el límite y se contaron como erróneas (6 en Heretic) |
| Conocimiento general | no disponible (solo gráfico) | no disponible (solo gráfico) | Aurum reporta "más conocimiento" que Heretic |
| Rechazos (100 prompts dañinos) | 0 | no disponible | Conteo por frases marcadoras, estimación |

El autor advierte que las cifras publicadas por Qwen corresponden a BF16 con thinking largo y BFCL v4, por lo que no son directamente comparables con estas mediciones en Q4 y sin thinking.

## Requisitos de hardware

- VRAM estimada: BF16 requiere aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; Q8_0 ronda los 5 GB; Q4_K_M se sitúa en torno a 3 GB, lo que deja margen para contexto en GPUs de 8 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para BF16; RTX 4060 Ti 16 GB, RTX 4070, RTX 3060 12 GB y similares para cuantizaciones Q4-Q8.
- Cabe en GPU de consumo: sí, en 8 GB con Q4_K_M o Q5_K_M; también en 6 GB con cuantizaciones más agresivas (Q3_K_M), a costa de calidad.
- Opciones de despliegue: llama.cpp (build b12289 o superior, con soporte de proyector de visión), Ollama, vLLM y TGI para safetensors (requiere versión de `transformers` con soporte Qwen3.5). Para imagen se debe usar el processor de Qwen/Qwen3.5-4B.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Tool calling | Notas |
|---|---|---|---|---|---|---|
| Aurum 4B v1 Uncensored | ~4,66 B | no disponible | Apache-2.0 | Sí (visión) | Sí (BFCL) | Sin rechazos; pesos Qwen + edición selectiva |
| Qwen/Qwen3.5-4B | ~4,66 B | no disponible | Apache-2.0 (según base) | Sí (visión) | Sí | Modelo base oficial, con rechazos y alineación estándar |
| insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated | ~4,66 B | no disponible | no disponible | Sí (visión) | Sí | Fine-tuning de destilación + abliteración Heretic; más cambios de pesos |
| Qwen3.8-4B-Distill-Heretic-Abliterated (GGUF de yachen4ever) | ~4,66 B | no disponible | no disponible | Sí (visión) | Sí | Cuantización Q4_K_M usada como referencia en los benchmarks del autor |

## Limitaciones y advertencias

- Modelo explícitamente "uncensored": no rechaza peticiones dañinas (0 rechazos en 100 prompts de prueba según el autor). No debe desplegarse en entornos donde usuarios que no hayan elegido un modelo sin censura puedan acceder a él.
- Es un modelo de 4B: comete errores factuales y puede invocar herramientas de forma incorrecta o innecesaria.
- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado.
- La longitud de contexto no se especifica en la información disponible; conviene consultar la configuración de Qwen3.5-4B antes de asumir ventanas largas.
- El conteo de rechazos se basa en frases marcadoras, no en revisión manual, por lo que es una estimación.
- Los benchmarks publicados están en formato gráfico y no transcritos; además, las condiciones (Q4, thinking off, runner propio) no son comparables con las cifras oficiales de Qwen.
- Aunque la licencia es Apache-2.0, el uso comercial de un modelo sin filtros de rechazo conlleva riesgos legales y reputacionales que el usuario debe evaluar.
- El repositorio no incluye configuración de preprocesador de imagen propia; es necesario usar el processor de Qwen3.5-4B para entradas visuales.
- El modelo se creó en noviembre de 2026 y el autor indica que el ID antiguo (`2Beyes/Aurum_4b-safetensors`) redirige al nuevo; verificar enlaces antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2Beyes/Aurum_4b-safetensors
- Repositorio GGUF: https://huggingface.co/2Beyes/Aurum-4B-Uncensored-GGUF
- Repositorio BF16 safetensors (nuevo ID): https://huggingface.co/2Beyes/Aurum-4B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo Heretic de referencia: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- GGUF de referencia para benchmarks: https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
