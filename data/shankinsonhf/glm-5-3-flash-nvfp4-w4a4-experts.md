# shankinsonhf/GLM-5.3-Flash-NVFP4-W4A4-Experts

## Resumen

GLM-5.3-Flash-NVFP4-W4A4-Experts es una conversión comunitaria del modelo multimodal GLM-5.3-Flash de Z.AI, cuantizada con NVIDIA Model Optimizer para ejecución nativa NVFP4 en hardware GB10/DGX Spark. El modelo original, liberado por Z.AI en agosto de 2026, es un MoE de 320B parámetros con 18B activos, diseñado para tareas de codificación, agénticas y visuales, con atención híbrida MLA/KDA y una ruta residual de cuatro flujos. Esta conversión cuantiza exclusivamente los expertos enrutados (capas 3-44) con NVFP4 W4A4, manteniendo el resto de componentes en BF16, lo que reduce el tamaño del checkpoint a aproximadamente 191 GiB.

La relevancia de este modelo radica en que permite ejecutar un MoE multimodal de gran escala en cuatro nodos GB10/DGX Spark con vLLM, alcanzando un throughput de generación de hasta 173 tokens/s con 16 peticiones concurrentes, y manteniendo una precisión comparable a la referencia FP8 (89.0% frente a 89.25% en una evaluación restringida de MMLU/ScienceQA). No obstante, no es un checkpoint drop-in: requiere parches de compatibilidad específicos para vLLM y FlashInfer, y su uso está limitado a entornos que reconozcan la metadata de ModelOpt y los expertos NVFP4 nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida MLA/KDA, ruta residual mHC de cuatro flujos, MTP (multi-token prediction) |
| Parametros totales | 169.120.127.838 (segun safetensors; el modelo base se describe como 320B con 18B activos) |
| Parametros activos | 18B (segun documentacion del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (expertos enrutados, capas 3-44), BF16 (resto: atencion, vision, embeddings, lm_head, etc.) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (120 shards principales + 1 shard de escalas de activacion) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE con 288 expertos por capa en las capas 3-44, y una capa MTP adicional (capa 45) para prediccion multi-token. La atencion es hibrida: combina MLA (Multi-head Latent Attention) con KDA (Kernel-based Dynamic Attention), y prescinde de rope en la ruta sparse. La ruta residual mHC (multi-head Cross-attention) de cuatro flujos conecta las capas de forma no secuencial. Esta conversion cuantiza unicamente las proyecciones de los expertos enrutados (`gate_proj`, `up_proj`, `down_proj`) a NVFP4 E2M1 con grupo de tamaño 16 y activaciones W4A4 calibradas, usando una politica de escalas con margen de seguridad del 5% (p99 por defecto, p98 para `w2` en capas 3-8, p98.9 para `w2` en capas 24-44). El resto de componentes (atencion, vision, routers, shared experts, densas, embeddings, `lm_head`, normas) permanecen en BF16. No se dispone de informacion sobre el entrenamiento original del modelo base (datos, tokens, metodos de alineacion) en la documentacion de esta conversion.

## Capacidades

- Generacion de texto y razonamiento multi-step, validado con prompts de hasta 31.020 tokens.
- Comprension multimodal: procesa imagenes individuales, hasta cuatro imagenes simultaneas y video de 32 frames.
- Tool calling y function calling, con salida determinista verificada en pruebas de aceptacion.
- Capacidad de agente: ejecuta tareas agénticas complejas con razonamiento encadenado.
- Streaming de tokens en tiempo real.
- Multilingue: ingles y chino (segun metadata del modelo base).
- Modo de razonamiento explicito (reasoning) y generacion de respuestas estructuradas.

## Casos de uso

- Despliegue de un asistente multimodal en infraestructura DGX Spark: el modelo puede procesar consultas que combinan texto e imagenes (por ejemplo, analisis de diagramas o capturas de pantalla) con una ventana de contexto larga, gracias a su soporte para prompts de decenas de miles de tokens y su capacidad de streaming.
- Automatizacion de soporte tecnico con tool calling: el modelo puede invocar APIs externas (bases de conocimiento, sistemas de ticketing) para resolver incidencias de forma autonoma, manteniendo conversaciones multi-turno con contexto acumulado.
- Generacion de codigo asistida por vision: al recibir capturas de pantalla de errores o diagramas de arquitectura, el modelo puede razonar sobre ellos y producir codigo o explicaciones tecnicas, aprovechando su entrenamiento multimodal.
- Analisis de documentos cientificos con figuras: el modelo puede extraer informacion de graficos, tablas e imagenes en papers, y responder preguntas de razonamiento sobre el contenido, util para investigadores que necesitan sintetizar literatura.
- Creacion de contenido bilingue (ingles/chino): el modelo puede redactar, traducir y adaptar contenido entre ambos idiomas, manteniendo coherencia en tareas de marketing o documentacion tecnica.
- Evaluacion de modelos en entornos de investigacion: al ser una cuantizacion agresiva (W4A4), sirve como banco de pruebas para estudiar el impacto de la cuantizacion de expertos en MoE multimodales, comparando su rendimiento con las referencias FP8 y W4A16.

## Benchmarks y rendimiento

La model card reporta una evaluacion de regresion restringida (400 items) sobre MMLU/ScienceQA, comparando con las referencias oficiales:

| Checkpoint | Overall | Text | Image-text |
|---|---:|---:|---:|
| Referencia oficial FP8 | 89.25% | 84.5% | 94.0% |
| Referencia W4A16 | 88.5% | 83.0% | 94.0% |
| Este checkpoint W4A4 | 89.0% | 84.0% | 94.0% |

Throughput medido en cuatro nodos GB10 (vLLM TP4+EP4, FlashInfer 0.6.17, CUDA sm_121a):

| Ancho de concurrencia | Prefill (prompt tok/s) | Generacion (output tok/s) |
|---:|---:|---:|
| 1 | 1.279,01 | 24,86 |
| 2 | 1.332,22 | 40,63 |
| 4 | 1.334,71 | 65,73 |
| 8 | 1.383,55 | 99,77 |
| 16 | 1.382,60 | 173,77 |

No se han publicado resultados de benchmarks estandar completos (MMLU completo, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia validada exclusivamente en cuatro nodos NVIDIA GB10/DGX Spark con vLLM TP4+EP4 y parches de compatibilidad especificos.
- VRAM estimada: el checkpoint ocupa ~191 GiB en disco; la VRAM necesaria depende de la configuracion de tensor parallelism y expert parallelism, pero con 4 nodos GB10 (cada uno con ~128 GB de memoria unificada) se cubre el despliegue completo.
- No cabe en una GPU consumer convencional (RTX 4090, 3090, etc.) debido al tamaño del modelo y a la necesidad de NVFP4 nativo en SM121a.
- Opciones de despliegue: vLLM con parches del repositorio `shankinson/glm53-nvfp4-team`; no se ha validado con llama.cpp, Ollama ni TGI.
- Latencia y throughput: los datos de la tabla anterior muestran hasta 173,77 tokens/s de generacion con 16 peticiones concurrentes, y prefill de ~1.380 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-BF16 (base) | 320B (18B activos) | no disponible | BF16 | MIT | HuggingFace |
| GLM-5.3-Flash-NVFP4-W4A4 (este) | 169B (segun safetensors) | no disponible | NVFP4 W4A4 | MIT | HuggingFace |
| GLM-5.3-Flash-W4A16-NVFP4 (axiomofmind) | no disponible | no disponible | NVFP4 W4A16 | MIT | HuggingFace |
| GLM-5.3-Flash-NVFP4 (local-inference-lab) | no disponible | no disponible | NVFP4 | MIT | HuggingFace |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos suficientes para comparar con otros MoE multimodales de tamano similar (p. ej., Qwen2.5-VL, InternVL) en esta informacion.

## Limitaciones y advertencias

- No es un checkpoint drop-in: requiere parches de vLLM y FlashInfer no incluidos en la instalacion estandar, y solo se ha validado en hardware GB10/DGX Spark con CUDA sm_121a.
- La cuantizacion W4A4 de los expertos puede introducir degradacion de precision en tareas sensibles a errores numericos; la evaluacion muestra una caida de 0,25 puntos frente a la referencia FP8 en el conjunto restringido.
- El modelo base solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto del modelo original; la conversion no incluye evaluaciones de seguridad.
- La licencia MIT permite uso comercial, pero la conversion no esta afiliada a Z.AI, NVIDIA, vLLM ni FlashInfer, y el soporte es comunitario.
- El tamaño del checkpoint (205 GB) y los requisitos de hardware (4 nodos GB10) limitan su uso a entornos con infraestructura especializada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shankinsonhf/GLM-5.3-Flash-NVFP4-W4A4-Experts
- Repositorio GitHub con parches y pipeline de conversion: https://github.com/shankinson/glm53-nvfp4-team
- Commit aceptado de la conversion: https://github.com/shankinson/glm53-nvfp4-team/commit/95e08fd0b588ea51341b03ec80e95b9c76c2fa4d
- Notas de arquitectura de GLM-5.3-Flash (Sebastian Raschka): https://sebastianraschka.com/blog/2026/glm-5-3-flash-architecture-notes.html
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/glm-5.3-flash
- Articulo de Wikipedia sobre GLM: https://en.wikipedia.org/wiki/GLM_(AI)
- Variante W4A16 NVFP4: https://huggingface.co/axiomofmind/GLM-5.3-Flash-W4A16-NVFP4
- Variante NVFP4 (local-inference-lab): https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4
