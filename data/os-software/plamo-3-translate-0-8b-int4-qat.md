# OS-Software/plamo-3-translate-0.8b-int4-qat

## Resumen

PLaMo 3 Translate 0.8B int4 QAT es una versión derivada del modelo de traducción multilingüe PLaMo 3 Translate 0.8B de Preferred Networks (PFN), publicada por OS-Software. Se trata de un ajuste mediante *quantization-aware training* (QAT) que fuerza los pesos de las capas lineales y del `lm_head` a descansar exactamente sobre la rejilla de cuantización int4 simétrica por bloques de 32 elementos definida por `ai-edge-quantizer` (regla MIN_MAX). El objetivo declarado del autor no es servir como modelo de inferencia directa, sino actuar como fuente para construir un artefacto `.litertlm` int4 para LiteRT-LM.

El modelo hereda la tarea y la cobertura idiomática del original: traducción entre 54 idiomas, incluyendo japonés, inglés, español, chino, coreano, hindi, árabe y buena parte de las lenguas europeas y del sudeste asiático. Con 890.344.960 parámetros totales (aproximadamente 0,8 mil millones), se posiciona en el segmento de modelos de traducción ligeros aptos para despliegue en dispositivos con recursos limitados.

Es relevante ahora porque combina dos tendencias: la compresión agresiva de modelos multilingües para ejecución local y el uso de QAT para mitigar la pérdida de calidad que introduce la cuantización int4. El autor reporta mejoras medibles frente a una cuantización int4 sin entrenamiento (OCTAV) en divergencia KL y en coincidencia de salida greedy con el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (PLaMo 3, según modelo base; detalles no disponibles en la información proporcionada) |
| Parámetros totales | 890.344.960 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 QAT (símétrica, bloques de 32 elementos, regla MIN_MAX de `ai-edge-quantizer`); pesos almacenados como float16 sobre la rejilla int4; embeddings int8 en la evaluación reportada |
| Idiomas soportados | 54 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso comercial sujeto a registro previo) |
| Formato de pesos | safetensors (float16 almacenando valores en rejilla int4); compatible con `transformers` mediante `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo parte de PLaMo 3 Translate 0.8B de PFN, un transformer decoder-only orientado a traducción condicionada por idioma objetivo (el tokenizador expone `target_lang` en `apply_chat_template`). La información disponible no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención), por lo que esos datos deben consultarse en la model card original de PFN.

El proceso de QAT descrito por el autor consiste en destilación desde el modelo original: se generaron traducciones con el modelo base sobre aproximadamente 25.000 pasajes provenientes de Wikipedia, FineWeb y FineWeb-2, y se entrenó el modelo cuantizado para reproducir esas salidas, durante 2 épocas y en precisión float32. Los pesos resultantes de las capas lineales y del `lm_head` quedan alineados con la rejilla int4 de `ai-edge-quantizer`, lo que permite que una cuantización posterior con la misma regla recupere exactamente los valores entrenados. El autor advierte que otros cuantizadores emplean rejillas distintas y que su efecto no ha sido medido.

## Capacidades

- Traducción multilingüe entre 54 idiomas, con el idioma destino especificado mediante el parámetro `target_lang` del chat template.
- Generación de texto condicionada por plantilla de chat (formato `user`/`assistant`).
- Traducción desde y hacia japonés, inglés, español, chino, coreano, hindi, árabe, turco, vietnamita, tailandés, indonesio y lenguas europeas como alemán, francés, italiano, portugués (no listado explícitamente), neerlandés, polaco, rumano (no listado), entre otras.
- Decodificación greedy determinista (`do_sample=False`) reproducible.
- Conversión a formato `.litertlm` para LiteRT-LM, según el flujo descrito por el autor.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción automática en local para aplicaciones de escritorio o móviles: el tamaño de 0,8 mil millones de parámetros y la rejilla int4 permiten empaquetar el modelo en un artefacto `.litertlm` ejecutable en dispositivos sin GPU dedicada, útil para traductores offline.
- Internacionalización de documentación técnica: el modelo cubre 54 idiomas y puede traducir pasajes de documentación (el autor usó Wikipedia y FineWeb como fuente de entrenamiento), lo que encaja con la traducción de manuales y guías de producto.
- Preprocesado multilingüe en pipelines de datos: traducción de corpus hacia un idioma pivote (por ejemplo, inglés) antes de tareas de análisis, indexación o clasificación, aprovechando la cobertura amplia de idiomas de bajos recursos como ceb, jv, sw o ur.
- Traducción de subtítulos y contenido audiovisual: la decodificación greedy determinista y el tamaño reducido permiten procesar lotes de segmentos cortos con baja latencia en CPU.
- Atención al cliente multilingüe en entornos con restricciones de privacidad: al poder ejecutarse en local, evita enviar conversaciones a servicios en la nube, lo que resulta adecuado para sectores regulados.
- Generación de versiones multilingües de interfaces y textos de marketing: el modelo puede traducir cadenas cortas entre pares de idiomas concretos especificando `target_lang`, integrándose en flujos de localización automatizados.
- Investigación en cuantización: sirve como referencia para estudiar el impacto de QAT int4 frente a cuantización post-entrenamiento (el autor compara contra OCTAV) en tareas de traducción.

## Benchmarks y rendimiento

El autor reporta una evaluación de acuerdo con el modelo original sobre 256 pasajes no usados en entrenamiento, en PyTorch con float32 y embeddings int8:

| Métrica | int4 sin entrenamiento (OCTAV) | Este modelo (int4 QAT) |
|---|---:|---:|
| Divergencia KL | 0,0565 | 0,0368 |
| Coincidencia de token top-1 | 95,6 % | 96,4 % |
| Coincidencia de salida greedy | 29,3 % | 32,4 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1,78 GB en float16; cargados en float32 (requisito del autor para no salir de la rejilla int4) el consumo de memoria de pesos asciende a aproximadamente 3,6 GB, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para float32; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para un modelo de 0,8 B.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 8 GB o más; también es viable en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `dtype="float32"`; conversión a `.litertlm` para LiteRT-LM mediante el flujo del autor. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B int4 QAT (este) | 890 M | no disponible | 54 | PLaMo Community License | safetensors (rejilla int4 en float16) |
| PLaMo 3 Translate 0.8B (original) | 0,8 B (según nombre) | no disponible | 54 | PLaMo Community License | safetensors |
| NLLB-200 distilled 600M | no disponible en esta ficha | no disponible | 200 | CC-BY-NC 4.0 | safetensors / varios |
| M2M-100 418M | no disponible en esta ficha | no disponible | 100 | MIT | safetensors |

Los datos de NLLB-200 y M2M-100 no provienen de la información proporcionada y deben verificarse en sus respectivas model cards; se incluyen únicamente como referencia de categoría.

## Limitaciones y advertencias

- Es un derivado no oficial: PFN no lo proporciona ni lo respalda, según declara el propio autor.
- No está pensado como modelo de inferencia directa: su propósito es servir de fuente para construir un artefacto `.litertlm`; cargarlo en `transformers` es posible pero secundario respecto al flujo previsto.
- Debe cargarse en float32: usar bfloat16 desplaza los pesos fuera de la rejilla int4 y anula la garantía de cuantización exacta.
- La cuantización con herramientas distintas de `ai-edge-quantizer` no ha sido evaluada; el comportamiento con otras rejillas es desconocido.
- La coincidencia de salida greedy con el original es solo del 32,4 %, lo que indica divergencias sustanciales en generación libre pese a la alta coincidencia de token top-1.
- Licencia PLaMo Community License: el uso comercial requiere registro previo mediante formulario; la redistribución exige incluir copia de la licencia y la mención "Built with PLaMo".
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por herencia del modelo base y de los corpus de destilación (Wikipedia, FineWeb, FineWeb-2).
- Cobertura de idiomas amplia pero sin métricas de calidad por par de idiomas publicadas en la información disponible.
- Longitud de contexto no especificada, lo que impide garantizar el procesamiento de documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OS-Software/plamo-3-translate-0.8b-int4-qat
- Modelo base original: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Artefacto LiteRT-LM derivado: https://huggingface.co/OS-Software/plamo-3-translate-0.8b-litert-lm
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Licencia PLaMo Community (japonés): https://plamo.preferredai.jp/info/plamo-community-license-ja
- Formulario de registro para uso comercial: https://forms.gle/mTL8tBLrMYXKNZD56
- Texto completo de la licencia (inglés): LICENSE/en (en el repositorio)
- Texto completo de la licencia (japonés): LICENSE/ja (en el repositorio)
