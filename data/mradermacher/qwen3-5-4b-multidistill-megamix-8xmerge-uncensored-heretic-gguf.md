# mradermacher/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic-GGUF

## Resumen

Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic es un modelo de lenguaje de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) derivado de la familia Qwen3.5 y distribuido en formato GGUF por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de un merge de ocho variantes destiladas y posteriormente sometido a un proceso de "abliteration" (etiquetado como heretic/uncensored), que elimina las capas de rechazo alineadas del modelo original. El resultado es un modelo orientado a razonamiento con cadena de pensamiento (chain-of-thought) y uso agéntico, sin los filtros de contenido habituales.

El modelo base es xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic, y esta ficha corresponde exclusivamente a la versión cuantizada estáticamente publicada por mradermacher. La relevancia actual reside en que ofrece capacidades de razonamiento y agentes en un tamaño que cabe en GPUs de consumo, con licencia Apache 2.0 y una amplia gama de cuantizaciones GGUF listas para usar con llama.cpp u Ollama.

La información disponible sobre arquitectura interna, contexto y datos de entrenamiento es limitada: la model card del repositorio cuantizado solo documenta el proceso de cuantización y los datasets de destilación declarados en los metadatos. Cualquier dato no confirmado se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 4.326.350.848 (~4,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de ocho variantes destiladas de Qwen3.5-4B, según se deduce del nombre "8xMerge" y de los datasets declarados. Los datos de destilación incluyen trazas de razonamiento de modelos tipo Claude Opus (nohurry/Opus-4.6-Reasoning-3000x-filtered, Roman1111111/claude-opus-4.6-10000x, Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x), trazas de razonamiento de Qwen3.5 (Jackrong/Qwen3.5-reasoning-700x) y trazas agénticas de Hermes (lambda/hermes-agent-reasoning-traces). El objetivo declarado es el razonamiento con cadena de pensamiento y el uso agéntico.

Sobre el entrenamiento original (número de tokens, composición exacta, uso de RLHF o DPO) no hay información en la documentación proporcionada. El proceso "heretic/abliterated" indica que se ha aplicado una técnica de eliminación de dirección de rechazo sobre los pesos, típicamente mediante resta de vectores de activación asociados a comportamientos de negativa. No se documentan innovaciones de decodificación especulativa ni atención lineal. El repositorio incluye además suplementos multimodales (mmproj), lo que sugiere que el modelo base podría tener capacidades de visión, aunque no se detalla su alcance.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con cadena de pensamiento (chain-of-thought) potenciado por los datasets de destilación de trazas de razonamiento.
- Capacidades agénticas y de razonamiento multi-paso, derivadas de las trazas de Hermes.
- Uso en pipelines de text-generation-inference y transformers según los tags del repositorio.
- Suplementos multimodales mmproj disponibles, lo que apunta a soporte de entrada de imagen (alcance no confirmado).
- Comportamiento "uncensored"/"abliterated": ausencia de rechazo alineado ante solicitudes que el modelo original rechazaría.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Generación de trazas de razonamiento sintéticas: el modelo puede producir cadenas de pensamiento paso a paso para generar datasets de entrenamiento de razonamiento, aprovechando su destilación específica en este dominio.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, sirve para estudiar el comportamiento de modelos sin capas de rechazo y comparar con la versión alineada del mismo base.
- Prototipado de agentes locales: con 4,3 B de parámetros y cuantizaciones de 2-3 GB, puede ejecutarse en un portátil con GPU modesta para probar bucles agénticos y razonamiento multi-paso sin coste de API.
- Evaluación de merges y destilación: útil para investigadores que comparan la calidad de merges de ocho vías frente a modelos destilados individuales en tareas de razonamiento.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M (2,9 GB) permiten servir el modelo en GPUs de 4-6 GB de VRAM para tareas de generación de texto en inglés.
- Experimentación con modelos sin filtros en entornos controlados: para estudiar sesgos, comportamientos no deseados y eficacia de técnicas de ablación en investigación académica.
- Fine-tuning posterior: al estar en Apache 2.0 y disponible en f16, puede servir como base para ajuste fino en dominios específicos en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~2,1 GB; Q4_K_M ~2,9 GB; Q8_0 ~4,7 GB; f16 ~8,8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060/4060, RTX 4090, A100 o H100 para f16 y despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 en GPUs de 6-8 GB; f16 requiere 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (según tags), transformers con el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B merge heretic) | ~4,3 B | no disponible | Apache 2.0 | GGUF | Merge de 8 vías, abliterated, solo inglés |
| Modelo base xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic | ~4,3 B | no disponible | Apache 2.0 | safetensors | Versión sin cuantizar del mismo modelo |
| Qwen3.5-4B original (familia) | ~4 B | no disponible | no disponible | safetensors | Modelo alineado de referencia; datos de rendimiento no disponibles |
| Versión i1 (imatrix) de mradermacher | ~4,3 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones ponderadas con imatrix, misma base |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": no aplica rechazo alineado, por lo que puede generar contenido dañino, ilegal o sesgado. No apto para producción orientada al usuario final sin capas de moderación adicionales.
- Solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a modelos de 4 B, agravado por la destilación de trazas de razonamiento que pueden contener errores propagados.
- Longitud de contexto no documentada; no se debe asumir una ventana larga sin verificación empírica.
- Al ser un merge de ocho variantes, puede presentar inconsistencias de comportamiento y degradación en tareas fuera del dominio de razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el cumplimiento legal del contenido generado ni sobre los derechos de los datasets de destilación subyacentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria del rendimiento real.
- Los suplementos mmproj sugieren multimodalidad, pero no se documenta su funcionamiento ni calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset Jackrong/Qwen3.5-reasoning-700x: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
