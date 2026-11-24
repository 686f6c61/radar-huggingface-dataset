# 2Beyes/Aurum-2B-Uncensored-GGUF

## Resumen

Aurum 2B v1 Uncensored es una variante "abliterated" (sin comportamiento de rechazo) del modelo Qwen3.5-2B de Alibaba, publicada por el usuario 2Beyes. Se distribuye en formato GGUF para su uso con llama.cpp y conserva tanto la torre de visión como la plantilla de chat del modelo original. El objetivo declarado es eliminar las negativas del modelo base manteniéndose lo más cerca posible de su distribución original, medido mediante divergencia KL.

El modelo parte de los 1.942.653.248 parámetros del Qwen3.5-2B original y mantiene su ventana de contexto de 262.144 tokens. La modificación consiste en una edición direccional del espacio de estados ocultos (abliteration): se identifica la dirección que el modelo activa cuando está a punto de rechazar una petición y se elimina del espacio de activaciones. Según la model card, esto produce 0 rechazos sobre 1.113 prompts de prueba, con una divergencia KL de 0,019 frente al original.

Es relevante ahora porque demuestra que la eliminación de rechazos puede hacerse con una degradación mínima del modelo base (la mitad que otras variantes sin censura del mismo tamaño) y porque, según los datos del autor, mejora incluso el tool calling del Qwen3.5-2B oficial (BFCL v3: 69,3 frente a 63,3). El modelo es de tipo multimodal image-text-to-text, aunque solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B) con torre de visión; abliterated |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF (el autor publica Q4_K_M; el repo incluye múltiples cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); existe versión BF16 safetensors en 2Beyes/Aurum-2B-Uncensored |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-2B: un transformer denso de aproximadamente 1,94 mil millones de parámetros con una torre de visión para entrada de imagen, plantilla de chat propia y una ventana de contexto de 262.144 tokens. El autor no modifica ni la torre de visión, ni la plantilla de chat, ni la longitud de contexto.

El método de entrenamiento no es un fine-tuning convencional, sino una edición de direcciones en el espacio de activaciones (abliteration). El procedimiento descrito: se pasan 323 prompts dañinos (mlabonne/harmful_behaviors, split de train) y 323 prompts inofensivos (mlabonne/harmless_alpaca, split de train) por el modelo oficial; se calcula la dirección de rechazo `r` como la diferencia de las medias de los estados ocultos en el último token del prompt; y se elimina esa dirección del modelo. No se especifica el número de tokens de entrenamiento adicionales, la composición del dataset de ajuste ni si hubo RLHF o DPO, porque no los hay: la modificación es post-hoc sobre los pesos del modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredados del Qwen3.5-2B.
- Respuesta a peticiones dañinas sin rechazo: 0 negativas declaradas sobre 613 prompts dañinos (AdvBench, StrongREJECT, HarmBench) y 500 inofensivos (XSTest, OR-Bench-Hard).
- Tool calling / function calling: BFCL v3 promedio de 69,3 (frente a 63,3 del Qwen3.5-2B oficial), incluyendo llamadas simples, múltiples, paralelas y casos de irrelevancia.
- Capacidades de visión: procesa entradas image-text-to-text; el autor reporta calidad de imagen dentro de 2 puntos del original y respuesta a peticiones dañinas planteadas como imagen.
- Razonamiento matemático y conocimiento: GSM8K, MMLU y MMLU-Redux iguales o por encima del modelo oficial; GPQA Diamond por debajo.
- Capacidad multilingüe limitada: solo declara inglés.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.

## Casos de uso

- Investigación sobre seguridad y alineación: el modelo sirve como sujeto de estudio para medir qué se elimina exactamente al aplicar abliteration y cuánto se degrada el modelo base (divergencia KL de 0,019), útil en experimentos de red-teaming controlados.
- Evaluación de robustez de filtros: al no rechazar, permite comprobar si los sistemas de moderación externos (guardrails, clasificadores de salida) funcionan sin depender del rechazo del propio modelo.
- Generación de código y tool calling en pipelines: con BFCL v3 de 69,3 y contexto de 262.144 tokens, puede integrarse en agentes que encadenan llamadas a funciones sobre repositorios o APIs extensas.
- Procesamiento de documentos largos con imagen: la ventana de 262.144 tokens y la torre de visión permiten resumir o extraer datos de informes con gráficos y tablas en una sola pasada.
- Despliegue en hardware de consumo: al ser un modelo de 2B en GGUF Q4_K_M, cabe en GPU de 8 GB (el autor reporta 111 tokens/s en una AMD RX 6600 por Vulkan), lo que lo hace apto para prototipos locales y estaciones de trabajo modestas.
- Experimentos de destilación o evaluación comparativa: como variante sin censura y cercana al original, es un punto de comparación útil frente a otros modelos abliterated de 2B (HauhauCS, Huihui, Heretic) en estudios de divergencia y retención de conocimiento.

## Benchmarks y rendimiento

Datos publicados en la model card. Todas las variantes se ejecutaron como Q4_K_M en llama.cpp (build 12289) con ajustes idénticos en la misma máquina. Los números del Qwen3.5-2B oficial usan BF16 y otros arneses, por lo que no son directamente comparables.

| Metrica | Aurum 2B | Qwen3.5-2B oficial | Otras variantes sin censura (2B) |
|---|---|---|---|
| Rechazos en 613 prompts dañinos | 0 | 452 | no disponible en detalle |
| Rechazos en 500 prompts inofensivos | 0 | 110 | no disponible en detalle |
| Divergencia KL vs original | 0,019 | referencia | 0,040–0,050 |
| BFCL v3 (promedio) | 69,3 | 63,3 | no disponible |
| GSM8K (subconjunto de 100) | igual o superior al oficial | referencia | no disponible |
| MMLU (subconjunto de 200) | igual o superior al oficial | referencia | no disponible |
| MMLU-Redux | igual o superior al oficial | referencia | no disponible |
| GPQA Diamond | inferior al oficial | referencia | no disponible |
| Calidad de imagen (180 imágenes propias) | dentro de 2 puntos del original | referencia | no disponible |
| Velocidad (AMD RX 6600, 8 GB, Vulkan) | 111 tokens/s | no disponible | la más rápida del grupo comparado |

El autor no publica los valores numéricos exactos de GSM8K, MMLU, MMLU-Redux, IFEval y GPQA Diamond en el texto extraído; solo la comparación cualitativa indicada. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con Q4_K_M, aproximadamente 1,3–1,6 GB de pesos más overhead de contexto y de la torre de visión; en la práctica cabe holgadamente en 4 GB.
- GPU recomendadas: cualquier GPU con 6–8 GB o más; el autor valida una AMD RX 6600 de 8 GB. Para contexto máximo de 262.144 tokens se necesita mucha más memoria por la caché KV.
- Cabe en GPU de consumo: sí, en tarjetas de 6–8 GB (RTX 3060, RTX 4060, RX 6600, etc.) con cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, y cualquier servidor compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar. vLLM y TGI no se mencionan para este formato.
- Latencia y throughput: 111 tokens/s en decodificación sobre AMD RX 6600 (8 GB) vía Vulkan, todas las capas en GPU, sin decodificación especulativa. No se publican cifras de TTFT ni de throughput en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (613 dañinos) | KL vs original | BFCL v3 | Licencia |
|---|---|---|---|---|---|---|
| Aurum 2B v1 Uncensored | 1,94B | 262.144 | 0 | 0,019 | 69,3 | Apache-2.0 |
| Qwen3.5-2B (oficial) | 1,94B | 262.144 | 452 | referencia | 63,3 | Apache-2.0 |
| Qwen3.5-2B-Uncensored-HauhauCS (Aggressive) | 1,94B | no disponible | no disponible | 0,040–0,050 | no disponible | no disponible |
| Huihui-Qwen3.5-2B-abliterated | 1,94B | no disponible | no disponible | 0,040–0,050 | no disponible | no disponible |
| Qwen3.5-2B-heretic | 1,94B | no disponible | no disponible | 0,040–0,050 | no disponible | no disponible |

Los datos de las variantes HauhauCS, Huihui y Heretic proceden de la propia model card de Aurum; el autor solo publica para ellas el rango de divergencia KL y su inclusión en la comparativa de velocidad. No se dispone de sus cifras de rechazo, BFCL ni licencia en la información proporcionada.

## Limitaciones y advertencias

- El modelo no rechaza peticiones dañinas: puede generar contenido peligroso, ilegal o dañino. La responsabilidad de uso recae en el operador; no debe exponerse sin filtros externos.
- GPQA Diamond queda por debajo del Qwen3.5-2B oficial, lo que indica cierta pérdida de rendimiento en razonamiento científico de nivel experto.
- Solo declara inglés; no hay evidencia de capacidades multilingües.
- La ventana de 262.144 tokens es teórica: usarla completa exige memoria muy superior a la de una GPU de consumo y puede degradar la calidad.
- Los benchmarks del autor se ejecutaron con subconjuntos pequeños (GSM8K de 100, MMLU de 200) y con ajustes distintos a los del modelo oficial, por lo que las comparaciones con Qwen3.5-2B no son estrictamente equivalentes.
- El repo tiene 15,8 GB y cero descargas en el momento de la consulta; es un artefacto reciente y sin validación independiente.
- La licencia Apache-2.0 permite uso comercial, pero las implicaciones legales y éticas del contenido generado sin censura no quedan cubiertas por la licencia.
- Riesgo de alucinación inherente a un modelo de 2B; no se han publicado evaluaciones específicas de factualidad.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/2Beyes/Aurum-2B-Uncensored-GGUF
- Versión BF16 safetensors: https://huggingface.co/2Beyes/Aurum-2B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF del base (unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Variante HauhauCS: https://huggingface.co/HauhauCS/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive
- Variante Huihui: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-2B-abliterated
- GGUF de Huihui (mradermacher): https://huggingface.co/mradermacher/Huihui-Qwen3.5-2B-abliterated-GGUF
- Variante Heretic: https://huggingface.co/jordanwoodson/Qwen3.5-2B-heretic-GGUF
- Dataset AdvBench (mlabonne): https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset harmless_alpaca (mlabonne): https://huggingface.co/datasets/mlabonne/harmless_alpaca
- StrongREJECT: https://github.com/alexandrasouly/strongreject
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
