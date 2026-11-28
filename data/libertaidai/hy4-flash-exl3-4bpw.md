# LibertAIDAI/Hy4-flash-EXL3-4bpw

## Resumen

Hy4-flash EXL3 4 bpw es una cuantización de 4 bits por peso (formato EXL3, librería exllamav3) del modelo base `tencent/Hy4-flash`, publicada por el usuario LibertAIDAI. El modelo base es un transformer disperso de tipo Mixture-of-Experts con 220 000 millones de parámetros totales y 12 000 millones activos por token, arquitectura híbrida que combina atención MLA dispersa y deslizante, LatentMoE, iHC y un mecanismo denominado Engram con 63 500 millones de parámetros. Esta versión cuantizada conserva el tronco en BF16 y comprime únicamente los expertos enrutados a 4 bits, con el objetivo de reducir el peso en VRAM de 220 GB a unos 203 GiB manteniendo la fidelidad numérica en el resto de tensores.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de escala 220B en una única GPU de 128 GB (por ejemplo, GB10) o en dos GPU de 96 GB mediante reparto por capas, algo inviable con los pesos en BF16. El autor verifica que los tensores no expertos y las tablas Engram son byte-idénticos al checkpoint base y que un recorte de tres capas reproduce los logits del modelo BF16 con correlación 0,999926 y coincidencia de argmax del 100 %.

Se trata de un artefacto de cuantización, no de un modelo nuevo: no publica benchmarks de calidad ni de rendimiento, y está pensado exclusivamente para inferencia de texto con el fork de exllamav3 que añade la arquitectura `hy_v4_flash`. La torre de visión y los tensores DFly2 se incluyen en el repositorio pero no están conectados en el runtime actual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención MLA dispersa/deslizante, LatentMoE, iHC y Engram (arquitectura `hy_v4_flash`) |
| Parámetros totales | 109 010 458 534 (dato del safetensors); el autor declara 220B totales y 12B activos en la model card del base |
| Parámetros activos | 12B (según model card del base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 4 bpw en expertos enrutados (62 976 módulos, codebook `mul1`); resto en BF16; variantes 3.5 / 3.0 / 2.5 bpw disponibles en la colección |
| Idiomas soportados | en, zh |
| Licencia | Tencent Hy License, Version 1.0 (derivada de Apache-2.0, con términos MaaS en §10) |
| Formato de pesos | safetensors (28 shards), librería exllamav3 |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es un transformer de 42 capas con mezcla de expertos de grano fino: 41 expertos por capa con proyecciones gate/up/down de dimensión 512, router, experto compartido y una capa densa inicial. La atención combina mecanismos MLA (Multi-head Latent Attention) con un indexador comprimido y patrones dispersos y deslizantes; sobre esta base se añaden LatentMoE, iHC y el subsistema Engram, que aporta cuatro tablas de embedding de 164–165 millones de filas por 96 dimensiones (118 GiB en total) y 63 500 millones de parámetros. El checkpoint base declara 220B totales y 12B activos, aunque el recuento del safetensors de esta cuantización asciende a 109 010 458 534 parámetros, diferencia atribuible a la compartición de pesos y a las tablas Engram almacenadas aparte.

Esta build cuantiza exclusivamente los expertos enrutados a 4 bpw con formato EXL3 (`trellis` I16 + `suh`/`svh` F16 + marcador `mul1`), mientras que atención, indexador, experto compartido, proyecciones LatentMoE, router, capa densa 0, iHC, proyecciones Engram, normas y embeddings de tokens y `lm_head` permanecen en BF16 byte-idénticos al original. Las tablas Engram no se cuantizan y el runtime las transmite por filas desde disco, por lo que no necesitan residir en VRAM. No se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del corpus) ni si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generación de texto en inglés y chino, con modo de razonamiento configurable: `reasoning_effort="no_think"` para respuestas directas o el modo de pensamiento de alto esfuerzo por defecto.
- Razonamiento multi-paso implícito en el modo thinking, según la plantilla de chat incluida (`chat_template.jinja` con tokens especiales `hy_start`, `hy_middle`, `hy_end`).
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado más allá del modo thinking.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Capacidades de visión: la torre de visión y los tensores DFly2 se incluyen en el checkpoint, pero no están conectados en el runtime actual; esta build es solo texto.
- No se documentan capacidades de audio, código o matemáticas de forma específica.

## Casos de uso

- Inferencia de un modelo de escala 220B en hardware de gama alta: con 203,07 GiB de pesos, esta build cabe en una GPU de 128 GB (GB10) o en dos de 96 GB con reparto por capas (`-gs`), lo que permite desplegar un MoE de gran tamaño sin clúster multi-nodo.
- Servicio de chat en inglés y chino: el checkpoint incluye plantilla Jinja y tokens especiales, de modo que puede exponerse como API conversacional multi-turno usando el modo `no_think` para respuestas rápidas o el modo thinking para consultas complejas.
- Investigación sobre cuantización EXL3: al mantener el tronco en BF16 byte-idéntico y cuantizar solo los expertos, sirve como banco de pruebas para medir el impacto de la cuantización 4 bpw en la calidad de un MoE grande frente a las variantes 3.5, 3.0 y 2.5 bpw.
- Evaluación de arquitecturas híbridas MoE + Engram: el runtime transmite las tablas Engram por filas desde disco, lo que permite estudiar el comportamiento de memoria y latencia de este mecanismo sin cargar los 118 GiB de tablas en VRAM.
- Prototipado de pipelines de razonamiento con modo thinking: útil para tareas de análisis de documentos largos o generación de explicaciones paso a paso en entornos controlados donde se disponga de una GPU de 128 GB.
- Reproducción y validación de cuantizaciones: el repositorio incluye `run_smoke.py` y un parche (`hy4-exllamav3.patch`) para verificar la carga completa y la coherencia de logits en el dispositivo objetivo antes de integrar el modelo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no reclama ninguna métrica de throughput ni de calidad. La única verificación numérica publicada es la fidelidad de un recorte de tres capas frente al BF16 equivalente: correlación 0,999926 y 100 % de coincidencia de argmax.

## Requisitos de hardware

- VRAM estimada: 203,07 GiB en total, de los cuales 84,87 GiB corresponden al tronco y 69,5 GiB a los expertos enrutados; las tablas Engram (118 GiB) se transmiten por filas desde disco y no requieren residir en GPU.
- GPU recomendadas: una GPU de 128 GB (GB10) aloja el tronco con margen; dos GPU de 96 GB con reparto por capas (`-gs`, no tensor parallelism, porque los módulos de atención y Engram no se fragmentan en TP).
- Una única GPU de 96 GB no se recomienda a 4 bpw; para ese caso el autor ofrece las variantes 3.5, 3.0 y 2.5 bpw.
- No cabe en GPU de consumo (RTX 4090 de 24 GB u otras similares) en ninguna de las variantes publicadas.
- Opciones de despliegue: exllamav3 (fork con la arquitectura `hy_v4_flash`, commit `1af65c4`), con `run_smoke.py` incluido para la primera carga; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Hardware mínimo |
|---|---|---|---|---|---|---|
| Hy4-flash EXL3 4 bpw (esta ficha) | 220B (109B en safetensors) | 12B | no disponible | Tencent Hy 1.0 | safetensors EXL3 | 128 GB o 2×96 GB |
| Hy4-flash EXL3 3.5 bpw | 220B | 12B | no disponible | Tencent Hy 1.0 | safetensors EXL3 | 1×96 GB (KV ajustada) |
| Hy4-flash EXL3 3.0 bpw | 220B | 12B | no disponible | Tencent Hy 1.0 | safetensors EXL3 | 1×96 GB |
| Hy4-flash EXL3 2.5 bpw | 220B | 12B | no disponible | Tencent Hy 1.0 | safetensors EXL3 | 1×96 GB |
| tencent/Hy4-flash (base BF16) | 220B | 12B | no disponible | Tencent Hy 1.0 | safetensors | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta cuantización con modelos de otras familias; la comparativa se limita a las variantes del mismo modelo base publicadas por el mismo autor.

## Limitaciones y advertencias

- Es una cuantización, no un modelo entrenado: la calidad depende del checkpoint base `tencent/Hy4-flash` y de la fidelidad de la compresión a 4 bpw en los expertos; el autor no publica evaluación de calidad.
- Sesgos conocidos: no documentados en la información disponible; al estar entrenado solo en inglés y chino, el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: no evaluado ni documentado por el autor.
- Limitaciones de idioma: solo en y zh según los metadatos; no se declara soporte multilingüe amplio.
- Limitaciones de contexto: la longitud de contexto no está disponible en la información proporcionada.
- Restricciones de licencia: Tencent Hy License 1.0, derivada de Apache-2.0 pero con términos específicos para MaaS en la sección 10; es necesario revisar el texto completo antes de un uso comercial o de ofrecer el modelo como servicio.
- Dependencia de un fork no oficial de exllamav3 (rama `hy4-flash`) para cargar la arquitectura; sin ese fork o el parche incluido, el checkpoint no es utilizable.
- El runtime actual no conecta la torre de visión ni los tensores DFly2, por lo que las capacidades multimodales del base no están operativas en esta build.
- El reparto en dos GPU debe hacerse por capas (`-gs`); el tensor parallelism no funciona con los módulos personalizados de atención y Engram.
- El recuento de parámetros del safetensors (109 010 458 534) difiere del declarado en la model card del base (220B); conviene verificar el inventario real de tensores antes de dimensionar el despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-4bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Colección de variantes EXL3: https://huggingface.co/collections/LibertAIDAI/hy4-flash-exl3-6afe62b412b76248d8d29b0b
- Variante 3.5 bpw: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-3.5bpw
- Variante 3.0 bpw: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-3bpw
- Variante 2.5 bpw: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-2.5bpw
- Fork de exllamav3 con soporte `hy_v4_flash`: https://github.com/moshemalawach/exllamav3
