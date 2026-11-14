# satoyutaka/qwen35-08b-rag-sft-avg-v2v3

## Resumen

`satoyutaka/qwen35-08b-rag-sft-avg-v2v3` es un ajuste fino (SFT) del modelo base Qwen3.5-0.8B-Base, publicado por el usuario satoyutaka en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto. Con 873.438.784 parámetros reales (0,87B), está pensado para prototipado, ajuste específico de tareas e investigación, tal como indica la model card del modelo base.

El nombre del repositorio sugiere un entrenamiento orientado a RAG (retrieval-augmented generation) con promediado de pesos entre dos versiones (v2 y v3), aunque la model card no documenta el proceso de ajuste ni los datos empleados. La información disponible procede casi íntegramente de la model card del modelo base Qwen3.5-0.8B, que describe una arquitectura híbrida con Gated DeltaNet y atención con compuertas, contexto nativo de 262.144 tokens y soporte para 201 idiomas.

Su relevancia actual radica en que ofrece capacidades multimodales y de contexto largo en un tamaño inferior a 1B de parámetros, lo que permite desplegarlo en hardware de consumo. No obstante, al tener 0 descargas y 0 likes, y sin documentación propia del ajuste, debe considerarse un artefacto experimental sin validación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrida Gated DeltaNet + Gated Attention (24 capas, layout 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))) |
| Parametros totales | 873.438.784 (0,87B) |
| Parametros activos | no disponible (la model card no confirma configuración MoE para esta variante) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | 201 idiomas y dialectos según la model card del modelo base; el ajuste concreto no documenta idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,8 GB) |

Otros datos técnicos del modelo base: dimensión oculta 1024, embedding de tokens 248.320 (padded, atado a la salida LM), FFN con dimensión intermedia 3584, Gated DeltaNet con 16 cabezas de atención lineal para V y 16 para QK (dimensión de cabeza 128), Gated Attention con 8 cabezas Q y 2 KV (dimensión de cabeza 256, RoPE de 64), y entrenamiento con MTP (multi-token prediction) multi-paso.

## Arquitectura y entrenamiento

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention) en un patrón repetido, más un encoder de visión para la entrada multimodal. El modelo base emplea fusión temprana sobre tokens multimodales y fue entrenado con MTP multi-paso. Según la model card, Qwen3.5 escala el aprendizaje por refuerzo en entornos multiagente y alcanza una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto.

El ajuste concreto de este repositorio no está documentado: se desconoce el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF o DPO, y qué significa exactamente el promediado "avg-v2v3" del nombre. La model card únicamente reproduce la del modelo base Qwen3.5-0.8B, por lo que no hay información verificable sobre el proceso de SFT ni sobre la tarea RAG a la que alude el identificador.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking y, presumiblemente, thinking (la model card del base tabula resultados en modo non-thinking).
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text, con vision encoder).
- Razonamiento sobre código, matemáticas y agentes, según las comparativas del modelo base frente a Qwen3-VL.
- Capacidades multilingües amplias: 201 idiomas y dialectos declarados para el modelo base.
- Soporte de contexto largo: hasta 262.144 tokens nativos, adecuado para documentos extensos y conversaciones multi-turno.
- Compatibilidad declarada con vLLM, SGLang, KTransformers y Hugging Face Transformers.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: mencionadas a nivel de entrenamiento RL del modelo base, sin detalles específicos del ajuste.

## Casos de uso

- Generación aumentada por recuperación (RAG): el nombre del repositorio indica un ajuste orientado a RAG; con 262.144 tokens de contexto puede ingerir múltiples pasajes recuperados y generar respuestas fundamentadas en ellos.
- Procesamiento de documentos con imágenes: al aceptar entradas image-text-to-text, puede extraer y razonar sobre información de capturas, formularios escaneados o gráficos junto con texto asociado.
- Prototipado rápido en hardware de consumo: con menos de 1B de parámetros y pesos safetensors de 1,8 GB, permite iterar en local antes de escalar a modelos mayores.
- Ajuste específico de dominio: su tamaño reducido y licencia Apache 2.0 facilitan el fine-tuning sobre datos propios para tareas concretas de clasificación, extracción o resumen.
- Asistente conversacional multi-turno: la ventana de contexto larga permite mantener historiales extensos sin truncar, útil en atención al cliente o soporte técnico.
- Investigación en eficiencia de arquitecturas híbridas: sirve como banco de pruebas para estudiar Gated DeltaNet y atención con compuertas en tareas multimodales.
- Despliegue en entornos con restricciones de memoria: candidato para edge computing o servicios con GPU modesta, siempre que se valide su calidad tras el ajuste.

## Benchmarks y rendimiento

Los únicos datos disponibles corresponden al modelo base Qwen3.5-0.8B, no al ajuste de este repositorio. Se reproducen a continuación (modo non-thinking):

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado resultados de benchmarks del ajuste `qwen35-08b-rag-sft-avg-v2v3` en la información disponible. La tabla del modelo base está truncada en el origen, por lo que no se dispone de más filas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 1,8 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 1 GB; en 4 bits, por debajo de 1 GB (estimaciones a partir del tamaño del repo, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con contexto moderado; A100, H100 o RTX 4090 sobran para este tamaño y permiten contextos muy largos.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas o Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers según la model card; llama.cpp u Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles. El contexto de 262.144 tokens incrementa notablemente el uso de memoria de la caché KV, por lo que contextos muy largos pueden exceder la VRAM de GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-08b-rag-sft-avg-v2v3 | 0,87B | 262.144 | Apache 2.0 | Sí | Hugging Face (0 descargas) |
| Qwen3.5-0.8B (base) | 0,8B | 262.144 | Apache 2.0 | Sí | Hugging Face (oficial) |
| Qwen3-1.7B | 1,7B | no disponible en la información | Apache 2.0 (según ecosistema Qwen) | No documentado | Hugging Face |
| Qwen3.5-2B | 2B | 262.144 (según familia) | Apache 2.0 | Sí | Hugging Face |

En benchmarks de lenguaje, el modelo base Qwen3.5-0.8B queda por debajo de Qwen3-1.7B en MMLU-Pro (29,7 frente a 40,2) y de Qwen3.5-2B (55,3), lo que refleja su menor escala. El ajuste de satoyutaka no aporta métricas comparativas.

## Limitaciones y advertencias

- Sin documentación del ajuste: se desconoce el dataset, la metodología de promediado y la tarea exacta, lo que impide evaluar su calidad real.
- Sin validación pública: 0 descargas y 0 likes; no hay evidencia de uso ni reportes de terceros.
- Riesgo de alucinación: con 0,8B de parámetros y un MMLU-Pro de 29,7 en el base, la fiabilidad factual es limitada, especialmente en dominios especializados.
- Rendimiento inferior a alternativas mayores: Qwen3-1.7B y Qwen3.5-2B superan al base en los benchmarks disponibles.
- Idiomas del ajuste no confirmados: aunque el base declara 201 idiomas, el SFT podría haber degradado el multilingüismo.
- Contexto largo costoso: 262.144 tokens de ventana implican una caché KV grande; en GPUs de consumo puede requerir cuantización o truncado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base enlazada.
- Modelo base orientado a prototipado: la propia model card del base lo destina a investigación y fine-tuning, no a producción crítica sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satoyutaka/qwen35-08b-rag-sft-avg-v2v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
