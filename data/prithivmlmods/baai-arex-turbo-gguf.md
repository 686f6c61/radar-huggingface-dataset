# prithivMLmods/BAAI-AREX-Turbo-GGUF

## Resumen

AREX-Turbo es un agente de investigación profunda (deep research) de pesos abiertos desarrollado por BAAI, construido sobre Qwen3.5-4B como alternativa compacta al AREX-Base de 122B. Se trata de un modelo denso de 4.205 millones de parámetros, con licencia Apache-2.0, ventana de contexto de 256K tokens y capacidades multimodales (imagen-texto a texto). Su propuesta de valor es ofrecer rendimiento de nivel de modelos mucho más grandes en tareas de búsqueda de información de largo horizonte, mediante un marco de auto-mejora recursiva que combina investigación iterativa, verificación de evidencias, búsquedas de seguimiento dirigidas y actualizaciones autónomas del contexto.

El repositorio aquí descrito es la cuantización GGUF publicada por prithivMLmods, que permite ejecutar el modelo localmente con llama.cpp en un amplio abanico de hardware, desde portátiles con poca RAM hasta GPUs dedicadas. Incluye el archivo de proyección multimodal (mmproj) necesario para explotar la parte de visión.

Su relevancia actual radica en la tendencia hacia agentes de investigación pequeños y eficientes: según los datos publicados, AREX-Turbo supera a varios modelos de 30B–235B en benchmarks de investigación, iguala a Qwen3.5-122B en GAIA e incluso supera a Gemini-3.1-Pro en GAIA, xbench-2510 y WideSearch-en, todo ello con solo 4B de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5-4B), con proyección de visión (mmproj) |
| Parámetros totales | 4.205.751.296 (~4,2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

AREX-Turbo es un modelo denso (no MoE) basado en Qwen3.5-4B, con capacidades image-text-to-text, lo que implica un proyector de visión integrado (distribuido en el formato GGUF como archivo mmproj-bf16 de 676 MB). Su ventana de contexto de 256K tokens lo habilita para tareas de investigación que requieren manejar grandes volúmenes de documentos y resultados de búsqueda simultáneamente.

La innovación técnica principal es su marco de auto-mejora recursiva para investigación profunda: el modelo itera ciclos de búsqueda, verificación de evidencias, búsquedas de seguimiento dirigidas y actualizaciones autónomas del contexto. Para ello expone herramientas específicas: `search`, `visit`, `update_context` y `finish`, con las que orquesta flujos de investigación guiados por evidencias. La model card indica que no soporta decodificación especulativa MTP ("MTP — Speculative Decoding: No"). Los detalles sobre datos de entrenamiento, número de tokens o uso de RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Investigación profunda automatizada (deep research): búsqueda iterativa, verificación de evidencias y búsquedas de seguimiento dirigidas.
- Uso de herramientas (tool calling): herramientas nativas `search`, `visit`, `update_context` y `finish` para flujos de investigación basados en evidencias.
- Contexto largo: 256K tokens, adecuado para sintetizar grandes volúmenes de documentos y resultados web.
- Comprensión multimodal: entrada de imagen y texto (image-text-to-text), con archivo mmproj incluido en el repo GGUF.
- Razonamiento y agentes: etiquetado con `reasoning`, `agent` y `long-context`, orientado a razonamiento multi-paso y tareas agentivas.
- Generación de texto conversacional.

## Casos de uso

- Investigación profunda automatizada: el modelo orquesta ciclos de búsqueda y verificación con sus herramientas `search` y `visit`, sintetizando respuestas con evidencias en tareas de largo horizonte.
- Asistentes de investigación sobre documentos extensos: con 256K de contexto, puede ingerir y razonar sobre informes, papers o corpus completos sin fragmentación.
- Agentes de navegación web con evidencias: mediante `visit` y `update_context`, puede integrarse en pipelines agentivos que navegan fuentes, contrastan afirmaciones y actualizan su memoria de trabajo.
- Análisis de documentos con imágenes: gracias a su pipeline image-text-to-text, puede responder preguntas sobre documentos escaneados, capturas o gráficos junto con texto.
- Verificación de hechos (fact-checking): su marco de verificación de evidencias lo hace adecuado para contrastar afirmaciones contra múltiples fuentes antes de responder.
- Sistemas RAG avanzados: en lugar de una única recuperación pasiva, puede dirigir búsquedas de seguimiento iterativas y mantener el contexto actualizado de forma autónoma.
- Despliegue local y privado: la cuantización GGUF permite ejecutarlo con llama.cpp en estaciones de trabajo sin conexión, útil donde los datos no pueden salir del entorno.

## Benchmarks y rendimiento

Resultados publicados en la model card (con herramientas, donde aplica):

| Benchmark | AREX-Turbo (4B) |
|---|---|
| BrowseComp | 70,7 |
| GAIA | 81,6 |
| xbench-2510 | 57,0 |
| DeepSearchQA | 78,5 |
| WideSearch-en | 68,5 |
| HLE (solo texto, con herramientas) | 40,6 |

Comparativas citadas en la model card (sin puntuaciones completas para todos los modelos): supera a Qwen3.5-122B en BrowseComp (70,7 frente a 63,8) y WideSearch-en (68,5 frente a 60,5); iguala a Qwen3.5-122B en GAIA; y supera a Gemini-3.1-Pro en GAIA, xbench-2510 y WideSearch-en. No se han publicado en la información disponible los valores numéricos completos de esos modelos comparados.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia GGUF:
  - Q3_K_M: ~2,3 GB + overhead de contexto.
  - Q4_K_M: ~2,7 GB + overhead de contexto (opción recomendada por defecto).
  - Q5_K_M: ~3,1 GB; Q6_K: ~3,5 GB; Q8_0: ~4,5 GB.
  - BF16: ~8,4 GB (máxima calidad).
  - Añadir ~0,7 GB si se usa el proyector multimodal (mmproj-bf16), más memoria KV cache proporcional al contexto utilizado.
- GPUs recomendadas: cualquier GPU de consumo con 4–8 GB (RTX 3060, RTX 4060, RTX 4090) cubre con holgura las cuantizaciones medias; para BF16, una RTX 4090 (24 GB) o equivalente. También es viable solo CPU dada la cuantización Q3/Q4.
- Cabe en GPUs de consumo: sí, incluso en GPUs de gama baja con Q3/Q4; el modelo completo BF16 cabe en una RTX 4090.
- Opciones de despliegue: llama.cpp (formato nativo del repo), Ollama (vía GGUF), LM Studio; el modelo base en transformers/HF también admite text-generation-inference.
- Latencia y throughput: no disponibles. La model card indica que no hay soporte de decodificación especulativa MTP.

## Comparativa con modelos similares

| Característica | AREX-Turbo (4B) | Qwen3.5-122B (AREX-Base) | Gemini-3.1-Pro |
|---|---|---|---|
| Parámetros | ~4,2B (denso) | 122B | no disponible |
| Contexto | 256K | no disponible | no disponible |
| BrowseComp | 70,7 | 63,8 | no disponible |
| GAIA | 81,6 | iguala (valor no disponible) | superado (valor no disponible) |
| WideSearch-en | 68,5 | 60,5 | superado (valor no disponible) |
| Licencia | Apache-2.0 | no disponible | propietaria |
| Disponibilidad | Pesos abiertos, GGUF local | no disponible | API propietaria |

## Limitaciones y advertencias

- Idioma: la model card declara soporte solo para inglés; no hay garantía de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación: como todo LLM, puede generar afirmaciones incorrectas; su marco de verificación de evidencias mitiga pero no elimina este riesgo, especialmente en tareas de búsqueda web.
- Dependencia de herramientas: el rendimiento de deep research (BrowseComp, GAIA, etc.) se obtiene usando el bucle de herramientas `search`/`visit`/`update_context`/`finish`; sin ese entorno agentivo, los resultados pueden ser notablemente inferiores.
- Contexto: aunque la ventana es de 256K tokens, la memoria KV cache en contexto largo puede exceder la VRAM disponible en hardware de consumo; hay que dimensionar el contexto en llama.cpp en consecuencia.
- Sin decodificación especulativa MTP, lo que puede limitar el throughput frente a modelos que sí la soportan.
- Licencia: Apache-2.0, sin restricciones relevantes para uso comercial.
- Cuantizaciones Q3: pérdida de calidad apreciable; se recomiendan Q4_K_M o superiores para producción.
- Los benchmarks provienen de la model card del autor y no han sido verificados de forma independiente en la información disponible.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/prithivMLmods/BAAI-AREX-Turbo-GGUF
- Modelo base: no disponible como URL directa en la información proporcionada (referenciado como BAAI/AREX-Turbo; probablemente en https://huggingface.co/BAAI/AREX-Turbo)
- Modelo base original: Qwen/Qwen3.5-4B (referenciado en la model card)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog o demo oficial: no disponible
