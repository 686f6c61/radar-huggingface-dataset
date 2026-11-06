# mradermacher/QWEN3.5-oracul-4b-GGUF

## Resumen

QWEN3.5-oracul-4b-GGUF es la versión cuantizada en formato GGUF del modelo par0v0z/QWEN3.5-oracul-4b, un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) construido sobre la arquitectura Qwen 3.5. La cuantización ha sido realizada por mradermacher, un conocido publicador de versiones GGUF de la comunidad, y se distribuye bajo licencia Apache 2.0. El modelo está etiquetado con el tag `qwen3_5` y `unsloth`, lo que indica que el modelo base fue probablemente afinado mediante las herramientas de Unsloth sobre una base Qwen 3.5.

El propósito de este repositorio es ofrecer el modelo en múltiples niveles de cuantización (desde Q2_K hasta f16) para facilitar su despliegue en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF. El repositorio incluye además ficheros `mmproj` (multi-modal supplement), lo que sugiere que el modelo base podría tener capacidades multimodales, aunque la model card no lo confirma explícitamente.

La relevancia de esta ficha radica en que se trata de un modelo pequeño (4B) cuantizado, orientado a inferencia local y conversacional, con licencia permisiva. No obstante, la información pública disponible es muy limitada: no se especifican datos de entrenamiento, contexto, benchmarks ni detalles arquitectónicos más allá de la etiqueta `qwen3_5`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 4.205.751.296 (≈4,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5`, que indica que el modelo base pertenece a la familia Qwen 3.5 de Alibaba. El recuento de parámetros (4.205.751.296) es coherente con un transformer denso de aproximadamente 4B, no con una arquitectura MoE. No se especifican el número de capas, dimensiones ocultas, número de cabezas de atención ni el tipo de atención empleado (atención completa, sliding window, etc.).

Tampoco se dispone de información sobre el proceso de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o SFT. La presencia del tag `unsloth` sugiere que el afinamiento se realizó con las herramientas de Unsloth, pero se desconoce el dataset o el objetivo del ajuste. El nombre "oracul" no viene acompañado de explicación en la model card. La existencia de ficheros `mmproj` (multi-modal projection) apunta a que el modelo base podría incorporar un codificador visual, pero no hay confirmación ni detalles sobre la resolución de imagen o el número de tokens visuales.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el pipeline declarado.
- Posible soporte multimodal (visión) inferido de la presencia de ficheros `mmproj` en el repositorio, aunque no confirmado en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito para agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card; no se listan otros idiomas.
- No se documenta modo "thinking" ni capacidades de audio.

## Casos de uso

- Asistente conversacional local en inglés: el modelo, al ser de 4B y estar disponible en cuantizaciones de 2–3 GB, puede ejecutarse en portátiles con GPU de consumo para mantener conversaciones multi-turno, aunque se desconoce la longitud de contexto efectiva.
- Prototipado rápido de chatbots: gracias a su licencia Apache 2.0 y su tamaño reducido, es adecuado para validar pipelines de generación de texto antes de escalar a modelos mayores.
- Inferencia en el borde (edge) o en dispositivos con recursos limitados: las cuantizaciones Q2_K (2,0 GB) y Q3_K_S (2,2 GB) permiten desplegar el modelo en hardware con poca VRAM o incluso en CPU mediante llama.cpp.
- Investigación sobre cuantización: el repositorio ofrece un abanico amplio de cuantizaciones (desde Q2_K hasta f16) que permite estudiar el impacto de la cuantización en la calidad de salida para un modelo de 4B.
- Educación y experimentación: útil para quienes quieren estudiar el comportamiento de modelos Qwen 3.5 pequeños sin requerir infraestructura de datacenter.
- Posible uso multimodal experimental: si el modelo base efectivamente incorpora visión, los ficheros `mmproj` permitirían tareas de descripción de imágenes o VQA en local, aunque esto no está confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~2,0 GB de pesos + overhead de contexto y KV cache.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~2,2–2,5 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~2,6–2,8 GB.
  - Q5_K_S / Q5_K_M: ~3,1–3,2 GB.
  - Q6_K: ~3,6 GB.
  - Q8_0: ~4,6 GB.
  - f16: ~8,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4–6 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 para f16. Para despliegue en servidor, A100 o H100 son innecesarias dado el tamaño, pero compatibles.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 6 GB o más para cuantizaciones Q4 y superiores; las cuantizaciones Q2/Q3 pueden caber en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), y runners compatibles con GGUF. El tag `text-generation-inference` sugiere compatibilidad con TGI, aunque TGI suele requerir safetensors; para GGUF lo habitual es llama.cpp.
- Latencia y throughput estimados: no disponibles. Dado el tamaño de 4B, en una RTX 4090 se esperaría un throughput alto (decenas a centenares de tokens por segundo), pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QWEN3.5-oracul-4b-GGUF (este) | 4,2B | no disponible | Apache 2.0 | GGUF | Cuantizaciones múltiples, etiqueta `qwen3_5`, posible multimodal |
| Qwen2.5-3B-Instruct (referencia) | 3,1B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo denso de la generación anterior de Qwen; benchmarks públicos |
| Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto largo, licencia con restricciones |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | safetensors, GGUF | Buen rendimiento en razonamiento para su tamaño |

La comparación es aproximada: no se dispone de benchmarks del modelo evaluado, por lo que no puede establecerse una comparación de rendimiento objetiva. Los modelos alternativos se incluyen por similitud de tamaño y categoría (modelos densos pequeños orientados a conversación e inferencia local).

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan datos de entrenamiento, contexto, benchmarks ni detalles arquitectónicos, lo que dificulta evaluar su calidad antes de desplegarlo.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Idiomas soportados limitados al inglés según la model card; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto desconocida: no puede planificarse su uso en tareas que requieran ventanas largas sin validación empírica.
- El nombre "oracul" y el propósito del afinamiento no están documentados; podría tratarse de un ajuste con sesgos o comportamientos específicos no declarados.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el modelo base y los datos de entrenamiento no están documentados, por lo que la procedencia de los datos y posibles sesgos no pueden auditarse.
- La posible capacidad multimodal (ficheros `mmproj`) no está confirmada ni documentada; su uso en producción requeriría validación previa.
- El repositorio tiene muy pocas descargas (57) y likes (1), lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/QWEN3.5-oracul-4b-GGUF
- Modelo base: https://huggingface.co/par0v0z/QWEN3.5-oracul-4b
- Página de overview de cuantizaciones de mradermacher: https://hf.tst.eu/model#QWEN3.5-oracul-4b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
