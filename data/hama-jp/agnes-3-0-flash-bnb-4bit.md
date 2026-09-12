# hama-jp/Agnes-3.0-Flash-bnb-4bit

## Resumen

Agnes-3.0-Flash-bnb-4bit es una cuantización comunitaria en NF4 (4 bits) del modelo multimodal Agnes-AI/Agnes-3.0-Flash, publicada por el usuario hama-jp. El checkpoint original, de aproximadamente 32.665.802.288 parámetros (unos 32,7 mil millones), ocupa 66,18 GB en BF16; esta versión lo reduce a 21,35 GB de pesos repartidos en seis archivos safetensors, manteniendo en BF16 los embeddings, la cabeza de salida, la torre de visión, las normalizaciones y las proyecciones recurrentes in_proj_a e in_proj_b. Se trata, por tanto, de una conversión de pesos, no de un modelo nuevo ni de un fine-tuning.

El interés práctico del repositorio es que permite ejecutar un modelo multimodal de ~32,7B en una única GPU de 24 GB (el autor lo validó en una RTX 3090 con WSL2, dejando la cabeza de salida en CPU). El modelo base es image-text-to-text, con modo de pensamiento conmutable mediante el parámetro `enable_thinking`, y declara soporte para inglés y chino. La cuantización cubre 666 capas lineales en NF4 con doble cuantización y cálculo en BF16, y omite los 15 tensores auxiliares `mtp.*` (multi-token prediction) del checkpoint original, que la implementación de generación de Transformers no carga.

Es relevante ahora porque el ecosistema apenas tiene alternativas cuantizadas oficiales para modelos multimodales de este tamaño, y porque el autor publica material de reproducibilidad completo (scripts de descarga, cuantización y verificación, más los resultados de validación). Ahora bien, se trata de un repositorio sin descargas ni validación externa en el momento de redactar esta ficha, con un conjunto de pruebas muy reducido (tres comprobaciones con decodificación greedy).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text) con código Python personalizado; la model card menciona ramas FFN paralelas y proyecciones recurrentes in_proj_a / in_proj_b, compatible con un diseño híbrido. Detalle completo de la arquitectura del modelo base: no disponible |
| Parámetros totales | 32.665.802.288 (~32,7 mil millones, dato de safetensors) |
| Parámetros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NF4 de 4 bits con bitsandbytes, doble cuantización y cómputo en BF16 (666 capas lineales); embeddings, cabeza de salida, torre de visión, normalizaciones e in_proj_a/in_proj_b en BF16. No se distribuye GGUF ni cuantización dinámica de Unsloth en este repositorio |
| Idiomas soportados | en, zh (declarados en la model card); validación puntual en japonés sin garantía oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 archivos, 21,35 GB) más código Python personalizado que requiere trust_remote_code=True |
| Modelo base | Agnes-AI/Agnes-3.0-Flash (revisión 8f0c484c363cdda8384195be4a5f7730f3915bde) |
| Autor de la cuantización | hama-jp |
| Tamaño del repositorio | 21,4 GB |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

No se dispone de la model card del modelo base Agnes-3.0-Flash en la información proporcionada, por lo que no se puede detallar el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Lo que sí documenta la model card de esta cuantización es la estructura del checkpoint: el modelo base conserva su código Python original y sus ramas FFN paralelas, e incluye una torre de visión y proyecciones recurrentes pequeñas (in_proj_a, in_proj_b), lo que apunta a una arquitectura híbrida de atención con componentes recurrentes; también incluye 15 tensores auxiliares `mtp.*` de predicción multi-token. Cualquier afirmación más concreta sobre el diseño interno del modelo base sería especulativa.

El trabajo de cuantización en sí es reproducible y está documentado: se cuantizaron 666 capas lineales a NF4 con doble cuantización y cómputo en BF16, sin dataset de calibración ni fine-tuning posterior. Se mantuvieron en BF16 los componentes sensibles a precisión (embeddings, cabeza de salida, torre de visión, normalizaciones y las dos proyecciones recurrentes mencionadas). Los tensores `mtp.*` se omitieron porque la ruta de generación de Transformers no los carga; el autor indica que la ruta normal de generación se conserva intacta. La conversión completa desde el checkpoint original de 66,18 GB tardó 822,24 segundos según las mediciones publicadas.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat aplicada mediante `apply_chat_template`.
- Entrada de imagen (image-text-to-text): descripción de contenido visual y respuesta a preguntas sobre una imagen adjunta, canalizada por el procesador multimodal del propio repositorio.
- Modo de pensamiento conmutable: la plantilla de chat acepta `enable_thinking=True/False`; la validación publicada se hizo siempre con el modo desactivado.
- Aritmética básica verificada en un caso de un solo paso (17 × 23 = 391, respuesta correcta en 4 tokens).
- Multilingüismo limitado: los idiomas declarados son inglés y chino; la model card documenta una prueba correcta en japonés, lo que sugiere cierta generalización, pero sin garantía de calidad.
- Ejecución local en una GPU de consumo de 24 GB, con posibilidad de enviar la cabeza de salida a CPU mediante `device_map`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o razonamiento multi-paso: no disponible en la información proporcionada; existe un modo thinking, pero no está evaluado.
- Capacidades de audio o vídeo: no disponibles (solo se documenta imagen).

## Casos de uso

- Inferencia multimodal en una sola GPU de 24 GB: desplegar un modelo image-text-to-text de ~32,7B en una RTX 3090 o RTX 4090 colocando `lm_head` en CPU. Es el escenario exacto que el autor validó, y el motivo principal para elegir esta cuantización frente al checkpoint BF16 de 66,18 GB.
- Descripción y anotación de imágenes en local: usar el procesador multimodal con `messages` que contengan `{"type": "image"}` para generar pies de foto o descripciones cortas sin enviar las imágenes a un servicio externo, algo relevante cuando el material es sensible.
- Asistentes conversacionales bilingües inglés-chino: al declarar esos dos idiomas, encaja en flujos de atención al cliente o soporte interno donde el tráfico se reparte entre ambos; el contexto multi-turno se gestiona con la plantilla de chat, aunque la longitud de contexto no está documentada.
- Prototipado e investigación sobre cuantización NF4: el repositorio incluye `reproduce/` con scripts de descarga, cuantización y verificación, y registros de versiones, lo que permite reproducir la conversión y comparar la salida NF4 contra el BF16 original en tareas controladas.
- Entornos aislados con requisitos de confidencialidad: al ejecutarse íntegramente en local (pesos abiertos, Apache 2.0), puede desplegarse en máquinas sin salida a internet para tareas de generación de texto y análisis de imágenes internas.
- Tareas de razonamiento con presupuesto de cómputo: activando `enable_thinking=True` puede emplearse en experimentos que requieran cadenas de razonamiento más largas, siempre que se acepte el coste de latencia (el throughput medido ronda los 1,6-2,1 tokens por segundo).
- Evaluación comparativa de degradación por cuantización: servir de referencia para medir cuánta calidad se pierde al pasar de BF16 a NF4 en un modelo multimodal de este tamaño, usando los mismos prompts contra ambos checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible: no hay MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica estándar, ni para el modelo base ni para esta cuantización. Lo único disponible son las comprobaciones funcionales de la model card, con un solo request, decodificación greedy, modo thinking desactivado y límite de 256 tokens:

| Comprobación | Resultado | Tokens generados | Tiempo de generación |
|---|---|---:|---:|
| Japonés, dos frases | Dos frases sobre cuantización física | 53 | 33,46 s |
| 17 × 23 | 391 | 4 | 1,88 s |
| Colores y formas de una imagen | Círculo rojo a la izquierda; cuadrado azul a la derecha | 19 | 10,06 s |

Datos adicionales de ejecución publicados: la recarga del checkpoint en un proceso nuevo tardó 111,25 segundos, todas las respuestas terminaron en EOS y todos los logits comprobados fueron finitos. La conversión y guardado del checkpoint cuantizado tardó 822,24 segundos. Estas cifras no constituyen un benchmark de calidad y no permiten comparaciones rigurosas.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 21,35 GB. La única configuración validada mantiene la cabeza de salida en CPU y cabe en una GPU de 24 GB; el repositorio no publica un desglose exacto de VRAM por componente.
- GPU recomendadas: RTX 3090 de 24 GB (validada por el autor, con WSL2 y driver 610.74) y, por capacidad equivalente o superior, RTX 4090, A6000, L40S, A100 o H100. Con 24 GB el margen es ajustado y obliga a offload de `lm_head`.
- GPU de consumo: cabe en tarjetas de 24 GB con la cabeza de salida en CPU; no hay evidencia de que quepa en GPUs de 16 GB o menos sin cuantizaciones adicionales, que este repositorio no ofrece.
- Software probado: Python 3.12, PyTorch 2.11.0+cu128, torchvision 0.26.0, Transformers 5.12.1, bitsandbytes 0.50.2, Accelerate 1.15.0, Pillow 12.3.0 y `attn_implementation="sdpa"`.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` y `AutoProcessor`, `trust_remote_code=True` y `device_map={"model": 0, "lm_head": "cpu"}`. Este repositorio es un checkpoint de Transformers, no un GGUF, por lo que no es directamente utilizable con llama.cpp u Ollama; no se documenta compatibilidad con vLLM o TGI.
- Latencia y throughput observados: aproximadamente 1,58 tokens/s en la prueba de 53 tokens, 2,13 tokens/s en la de 4 tokens y 1,89 tokens/s en la de 19 tokens, siempre con un único request y decodificación greedy. No hay datos de batching ni de concurrencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos de terceros comparables (mismo tamaño, misma tarea o misma cuantización) en los resultados de búsqueda, que no devolvieron ninguna referencia relevante. La única comparación posible con los datos aportados es contra el propio checkpoint original:

| Modelo | Parámetros | Contexto | Formato y tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agnes-3.0-Flash (BF16, original) | ~32,7B | no disponible | safetensors, 66,18 GB | Apache 2.0 | Agnes-AI/Agnes-3.0-Flash |
| Agnes-3.0-Flash-bnb-4bit (este repositorio) | ~32,7B | no disponible | safetensors NF4, 21,35 GB | Apache 2.0 | hama-jp/Agnes-3.0-Flash-bnb-4bit |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia medible entre ambos checkpoints es de 44,83 GB menos de pesos (aproximadamente un 67,7 % de reducción) y la omisión de los 15 tensores `mtp.*`. No hay datos que permitan cuantificar la pérdida de calidad asociada a esa reducción.

## Limitaciones y advertencias

- Calidad degradada por cuantización: el paso a NF4 de 4 bits introduce pérdida de precisión frente al BF16 original, y el autor no realizó fine-tuning ni uso dataset de calibración, ni publicó una comparación de calidad contra el modelo base.
- Validación muy limitada: solo tres comprobaciones, con decodificación greedy, un único request, modo thinking desactivado y 256 tokens como máximo. No hay evaluación de contexto largo, prompts adversariales, sesgos ni alucinación.
- Omisión de los tensores `mtp.*`: los 15 tensores auxiliares de predicción multi-token del checkpoint original no están incluidos. El autor afirma que la ruta normal de generación se mantiene, pero cualquier flujo que dependiera de MTP no funcionará con este checkpoint.
- Ejecución de código personalizado: el modelo y los procesadores usan código Python propio, por lo que exige `trust_remote_code=True`. Esto implica ejecutar código publicado en el repositorio, con el riesgo de seguridad correspondiente; conviene auditar el código antes de usarlo en producción.
- Idiomas: los idiomas declarados son inglés y chino. La prueba en japonés fue correcta en un caso aislado, pero no hay garantía de calidad ni de cobertura para el español u otras lenguas.
- Longitud de contexto desconocida: no se documenta la ventana de contexto del modelo base, lo que impide planificar aplicaciones que dependan de documentos largos o conversaciones extensas.
- Rendimiento bajo para producción: alrededor de 1,6-2,1 tokens por segundo en una RTX 3090 con un solo request. Sin datos de batching, no es adecuado para servicios con concurrencia alta sin una evaluación previa.
- Presión de memoria: con 21,35 GB de pesos, en una GPU de 24 GB hay que mantener la cabeza de salida en CPU; cualquier aumento del límite de tokens o de la resolución de imagen reduce el margen disponible.
- Licencia: los pesos y el código originales son Apache 2.0, pero el uso comercial debe verificar además las condiciones de las dependencias de terceros (bitsandbytes, Transformers) y conservar los avisos de copyright incluidos.
- Madurez del repositorio: la publicación es comunitaria, con 0 descargas y 0 likes en el momento de redactar esta ficha, creada y actualizada el mismo día. No hay mantenimiento ni validación independiente documentados.
- Riesgo de alucinación: no cuantificado en la información disponible; debe asumirse como en cualquier modelo generativo y verificar las salidas en aplicaciones críticas.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/hama-jp/Agnes-3.0-Flash-bnb-4bit
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Revisión concreta del modelo base usada en la conversión: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash/tree/8f0c484c363cdda8384195be4a5f7730f3915bde
- Ajustes de cuantización y cobertura de tensores (referenciado en la model card): https://huggingface.co/hama-jp/Agnes-3.0-Flash-bnb-4bit/blob/main/quantization.json
- Prompts, salidas y registros de ejecución (referenciado en la model card): https://huggingface.co/hama-jp/Agnes-3.0-Flash-bnb-4bit/blob/main/validation.json
- Imagen de validación (referenciada en la model card): https://huggingface.co/hama-jp/Agnes-3.0-Flash-bnb-4bit/blob/main/vision-fixture.png
- Scripts de reproducibilidad (referenciados en la model card): https://huggingface.co/hama-jp/Agnes-3.0-Flash-bnb-4bit/tree/main/reproduce
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre el modelo. Los resultados devueltos corresponden a Hama GmbH & Co KG, fabricante alemán de accesorios (https://www.hama.com/fr/fr/), sin relación con este repositorio.
