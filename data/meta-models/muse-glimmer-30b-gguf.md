# meta-models/Muse-Glimmer-30B-GGUF

## Resumen

Muse Glimmer 30B es un modelo de lenguaje causal de aproximadamente 27.850 millones de parámetros (etiquetado comercialmente como 30B) desarrollado por Meta Superintelligence Lab, publicado en agosto de 2026 bajo licencia Apache 2.0. Está destilado a partir de Muse Spark y diseñado específicamente para tareas agénticas autónomas en hardware de consumo: integra razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal y recuperación ante fallos en un único modelo que funciona de forma local sin infraestructura cloud.

El repositorio analizado, `meta-models/Muse-Glimmer-30B-GGUF`, contiene las conversiones a formato GGUF para llama.cpp: dos builds de texto cuantizados (Q4_K_M de 16,8 GB y Q4_K_XL dinámico de 19,7 GB), un codificador de percepción para entrada de imagen (`mmproj`, 1,4 GB) y un drafter DFlash para decodificación especulativa (1,6 GB). No se publica GGUF en bf16 en este repositorio; para precisión completa hay que acudir al repositorio base.

La relevancia del modelo radica en su orientación explícita a agentes que corren en una sola GPU de consumo: con el build Q4_K_M cabe en 24 GB de VRAM y admite una ventana de contexto de 131.072 tokens según los ejemplos de despliegue del autor. El repositorio acumula 198.743 descargas y 396 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de percepción dedicado para imagen (detalles internos no disponibles) |
| Parametros totales | 27.854.794.240 (~27,85 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (valor usado en el ejemplo de `llama-server`; no confirmado como máximo oficial) |
| Tipos de cuantizacion | GGUF Q4_K_M (16,8 GB) y Q4_K_XL dinámico (19,7 GB); mmproj Q4_K_M (1,4 GB); drafter DFlash Q4_K_M (1,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales en el repositorio base `meta-models/Muse-Glimmer-30B` |

## Arquitectura y entrenamiento

Muse Glimmer es un modelo de lenguaje causal de ~27,85 mil millones de parámetros con un codificador de percepción separado que habilita la entrada de imágenes; la model card no detalla la arquitectura interna (número de capas, atención, tipo de normalización) ni si emplea mezcla de expertos. El modelo se describe como destilado de Muse Spark, lo que sitúa su entrenamiento en un esquema de destilación desde un modelo mayor, aunque no se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica destacable en este repositorio es el soporte de decodificación especulativa mediante un drafter DFlash independiente (1,6 GB), que acelera la decodificación manteniendo las mismas salidas. El modelo expone además un modo de razonamiento separado del contenido final: las trazas de pensamiento se devuelven en el campo `reasoning_content` de la API compatible con OpenAI de `llama-server`, y los CLI las imprimen en línea delimitadas por `[Start thinking]` / `[End thinking]`. El soporte en llama.cpp se integró el 10 de agosto de 2026 (PR #26841, commit `62bf73d`) y requiere el build `b10353` o posterior; builds anteriores no registran la arquitectura.

## Capacidades

- Generación de texto y razonamiento multi-paso con traza de pensamiento explícita separada de la respuesta final.
- Comprensión de imágenes mediante el codificador de percepción `mmproj` (pipeline `image-text-to-text`).
- Uso de herramientas y function calling, orientado a tareas agénticas autónomas.
- Recuperación ante fallos dentro de flujos de agente, según la descripción del autor.
- Ejecución completamente local, sin infraestructura cloud ni acceso a red.
- Decodificación especulativa opcional con el drafter DFlash para reducir latencia.
- Compatibilidad con endpoints (`endpoints_compatible`) y API estilo OpenAI en `llama-server` (`/v1/chat/completions`).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes autónomos en estación de trabajo local: el modelo puede ejecutar bucles de razonamiento y llamadas a herramientas sin depender de APIs externas, gracias a su despliegue en una sola GPU de 24 GB con el build Q4_K_M.
- Automatización de atención al cliente con contexto largo: la ventana de 131.072 tokens permite mantener conversaciones multi-turno con historial extenso y documentación adjunta en el mismo contexto.
- Análisis de documentos e imágenes en local: combinando el modelo de texto con `mmproj` se pueden procesar capturas, diagramas o formularios junto con texto mediante `llama-mtmd-cli` o `llama-server`, útil en entornos con requisitos de privacidad.
- Asistencia a desarrollo de software en CI/CD: el soporte de tool calling y la API compatible con OpenAI permiten integrarlo en pipelines que invocan el endpoint `/v1/chat/completions` para revisión de código o generación de parches.
- Servicio multi-usuario en una sola máquina: `llama-server` con `-np 4` y decodificación especulativa DFlash ofrece varias ranuras concurrentes con menor latencia de decodificación, adecuado para equipos pequeños.
- Procesamiento por lotes de datos sensibles: al no requerir red, encaja en flujos de extracción y clasificación de información que no puede salir de la infraestructura propia.
- Prototipado de agentes con recuperación ante errores: la orientación del modelo a la recuperación de fallos facilita construir orquestadores que reintentan o replanifican tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (según la model card): build `17gb` ≈ 17 GB solo texto, ≈ 19 GB con visión y ≈ 20 GB con visión más drafter; build `dynamic` ≈ 20 GB, ≈ 22 GB y ≈ 23 GB respectivamente.
- El build Q4_K_M (16,8 GB) está pensado para GPUs de 24 GB de VRAM; el build Q4_K_XL dinámico (19,7 GB) para 32 GB.
- GPU recomendadas: no se especifican modelos concretos; por capacidad de VRAM encajan tarjetas de 24 GB (por ejemplo, RTX 4090) para el build Q4_K_M y de 32 GB para el dinámico. A100/H100 no se mencionan en la información disponible.
- Cabe en GPU de consumo: sí, el build Q4_K_M en 24 GB de VRAM.
- Opciones de despliegue: llama.cpp (build `b10353` o superior) mediante `llama-server`, `llama-cli` y `llama-mtmd-cli`; compilación con `-DGGML_CUDA=ON` para CUDA, Metal por defecto en Apple, o solo CPU omitiendo esa opción. No se mencionan vLLM, TGI ni Ollama.
- Parámetros de muestreo recomendados por el autor: `--temp 1.0 --top-p 0.95 --top-k 64`.
- Latencia y throughput: no disponibles; el autor solo indica que el drafter DFlash produce "las mismas salidas, decodificación más rápida" con ~1,6 GB adicionales.
- Nota operativa: el aviso `[spec] failed to measure draft model memory` al arrancar es inofensivo según la model card.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluación de seguridad; hay que asumir el riesgo habitual de un modelo generativo sin datos publicados.
- Idiomas soportados no disponibles: no se puede garantizar calidad fuera de los idiomas vistos en entrenamiento, que no se detallan.
- Requiere llama.cpp `b10353` o posterior; los builds `b10344` y anteriores no cargan la arquitectura. Si la respuesta empieza por `to=self<|message|>`, el build carece del parser de chat adecuado.
- Las imágenes solo funcionan con `llama-mtmd-cli` o `llama-server` con `--mmproj`; `llama-cli` es solo texto.
- El repositorio no incluye GGUF en bf16; para precisión completa hay que usar el repositorio base.
- Los 131.072 tokens de contexto aparecen en un ejemplo de despliegue, no como máximo oficial verificado; contextos muy largos incrementan el consumo de memoria más allá del peso de los pesos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y las obligaciones de atribución.
- El tamaño del repositorio (77,5 GB) implica descargas selectivas con `--include` para no arrastrar todos los builds.

## Enlaces

- Repositorio GGUF: https://huggingface.co/meta-models/Muse-Glimmer-30B-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pull request de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/26841
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers referenciados en los tags (arXiv:2504.13181): https://arxiv.org/abs/2504.13181
- Papers referenciados en los tags (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
- Papers referenciados en los tags (arXiv:2610.24628): https://arxiv.org/abs/2610.24628
