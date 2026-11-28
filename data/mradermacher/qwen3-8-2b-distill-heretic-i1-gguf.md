# mradermacher/Qwen3.8-2B-Distill-heretic-i1-GGUF

## Resumen

Qwen3.8-2B-Distill-heretic-i1-GGUF es un conjunto de cuantizaciones GGUF generadas por mradermacher a partir del modelo htb-ac-1424625/Qwen3.8-2B-Distill-heretic, una destilación de la familia Qwen con aproximadamente 1.880 millones de parámetros (1.881.825.088 según los pesos en safetensors). El modelo base se presenta como una variante "heretic" o "abliterated", es decir, con las capas de rechazo/aliniación atenuadas respecto al modelo original, orientada a razonamiento, function calling y despliegue en el borde (edge).

El repositorio no contiene pesos en formato transformers, sino exclusivamente ficheros GGUF cuantizados con la técnica i1 (imatrix/weighted) de mradermacher, cubriendo desde IQ1_S (0,8 GB) hasta Q6_K (1,7 GB). Esto lo hace apto para inferencia en CPU, GPUs de consumo y dispositivos con poca memoria mediante llama.cpp y derivados. La licencia declarada es Apache 2.0 y el único idioma soportado oficialmente es el inglés.

La relevancia actual radica en su reducido tamaño (2B), su ventana de contexto presumiblemente amplia (heredada de la familia Qwen3, aunque no confirmada en la información disponible) y su naturaleza descensurada, que lo hace atractivo para experimentación con agentes y function calling sin las restricciones de rechazo del modelo original, a costa de asumir riesgos de contenido y de una calidad inferior a los modelos mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (familia Qwen3, detalles no disponibles) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no es MoE según los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (i1/imatrix); repositorio estático adicional en formato GGUF estándar |

## Arquitectura y entrenamiento

El modelo base es una destilación de la familia Qwen (etiquetada como qwen3.5/qwen3.8 en los tags) con ~1,88 B de parámetros, lo que sugiere una arquitectura transformer decoder-only compacta. Los tags indican entrenamiento mediante SFT y destilación, con soporte declarado de reasoning y function calling. La variante "heretic"/"abliterated" implica un proceso de eliminación o atenuación de la dirección de rechazo en el espacio de activaciones o pesos, orientado a reducir las negativas del modelo ante peticiones sensibles.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). Las cuantizaciones i1 de mradermacher emplean una matriz de importancia (imatrix) generada a partir del propio modelo, lo que mejora la fidelidad de los cuantizados de baja precisión respecto a los estáticos.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento de múltiples pasos (tag "reasoning").
- Function calling / tool calling (tag "function-calling").
- Destilación orientada a despliegue en el borde (tag "edge").
- Comportamiento descensurado/abliterated: menor probabilidad de rechazo ante peticiones que el modelo original rechazaría.
- No se confirma soporte de visión en la información disponible (el README menciona "vision model" de forma genérica, pero no hay mmproj en este repositorio; habría que consultar el repositorio estático).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Asistentes locales en el borde: el modelo cabe en menos de 2 GB en Q4_K_M, por lo que puede ejecutarse en Raspberry Pi, mini-PC o portátiles sin GPU dedicada mediante llama.cpp, ofreciendo un asistente conversacional offline en inglés.
- Agentes con function calling en pipelines ligeros: su soporte declarado de tool calling permite integrarlo en flujos de automatización (consulta de APIs, extracción de datos) donde el coste por token y la latencia importan más que la precisión máxima.
- Experimentación con modelos descensurados: útil para investigación sobre alineación, red teaming y evaluación de sesgos, al poder comparar respuestas con y sin las capas de rechazo del modelo original.
- Prototipado rápido de chatbots: con cuantizados Q4_K_M o Q5_K_M se obtiene una calidad razonable para demos y pruebas de concepto en inglés sin infraestructura GPU.
- Generación de código asistida en entornos con recursos limitados: aunque no es su especialidad, el modelo puede completar snippets y explicar código en inglés, integrándose en editores vía servidores locales compatibles con la API de OpenAI.
- Fine-tuning ligero y destilación: al ser un modelo de 2B con licencia Apache 2.0, sirve como base para destilar modelos mayores o para ajuste fino en tareas específicas con hardware modesto.
- Clasificación y extracción de información: con contexto corto y prompts estructurados, puede emplearse para etiquetado, resumen y extracción de entidades en inglés a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,8-1,0 GB en IQ1/IQ2, ~1,3-1,4 GB en Q4_K_M, ~1,7 GB en Q6_K (sin contar overhead de contexto KV cache).
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060); en A100/H100 el modelo está sobredimensionado para la GPU y el cuello de botella será el ancho de banda, no la memoria.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con ≥2 GB, e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (endpoints_compatible en los tags).
- Latencia y throughput estimados: no disponibles; en CPU moderna se esperan decenas de tokens por segundo en Q4_K_M para un modelo de 2B, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-2B-Distill-heretic-i1-GGUF (este) | ~1,88 B | no disponible | Apache 2.0 | GGUF i1 | Descensurado, inglés, destilado |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32k (según model card pública) | Apache 2.0 | safetensors, GGUF | Alineado, multilingüe, benchmarks públicos |
| Llama 3.2 1B Instruct | ~1,2 B | 128k (según model card pública) | Llama 3.2 Community License | safetensors, GGUF | Alineado, multilingüe, restricciones de licencia |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8k (según model card pública) | Apache 2.0 | safetensors, GGUF | Alineado, inglés, benchmarks públicos |

Las cifras de contexto y licencia de los modelos comparables provienen de sus respectivas model cards públicas y no de la información proporcionada en esta ficha; se incluyen como referencia orientativa.

## Limitaciones y advertencias

- Solo soporta inglés oficialmente; el rendimiento en castellano no está garantizado ni evaluado.
- Al ser una variante "heretic"/"abliterated", puede generar contenido sensible, ofensivo o inseguro que el modelo original rechazaría; no apto para producción sin filtros adicionales.
- Riesgo de alucinación elevado por su tamaño reducido (2B) y por el proceso de destilación.
- No hay benchmarks publicados que permitan validar su calidad frente a alternativas.
- La longitud de contexto no está confirmada; asumir valores conservadores (4k-8k) hasta verificarlo.
- Aunque la licencia es Apache 2.0, el modelo base es una destilación de Qwen; conviene revisar los términos del modelo original y de los datos de destilación antes de uso comercial.
- El repositorio contiene solo GGUF; para fine-tuning se requiere el modelo base en safetensors (htb-ac-1424625/Qwen3.8-2B-Distill-heretic).
- El tag "vision model" del README es genérico de la plantilla de mradermacher; no hay mmproj en este repositorio, por lo que la capacidad de visión no está confirmada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-2B-Distill-heretic-i1-GGUF
- Modelo base: https://huggingface.co/htb-ac-1424625/Qwen3.8-2B-Distill-heretic
- Cuantizados estáticos: https://huggingface.co/mradermacher/Qwen3.8-2B-Distill-heretic-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-2B-Distill-heretic-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
