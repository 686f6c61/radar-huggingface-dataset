# amanwalksdownthestreet/NVIDIA-Nemotron-3-Super-120B-A12B-exl3

## Resumen

Esta ficha describe `amanwalksdownthestreet/NVIDIA-Nemotron-3-Super-120B-A12B-exl3`, un conjunto de cuantizaciones en formato EXL3 (ExLlamaV3) del checkpoint `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`. No se trata de un modelo nuevo, sino de una redistribución cuantizada del modelo base de NVIDIA: 120 000 millones de parámetros totales con 12 000 millones activos por token, arquitectura híbrida que combina capas Mamba-2, atención y un MoE con proyecciones latentes, más una cabeza MTP (multi-token prediction) integrada. El autor de la cuantización es el usuario de HuggingFace `amanwalksdownthestreet`.

El interés práctico de esta publicación es que reduce un modelo de 120B a ficheros de entre 32 GB y 74 GB según el bitrate, de forma que las cuatro variantes caben en una única GPU de 96 GB. Además, el repositorio incluye un `measurement.json` generado con `measure.py` sobre las cuatro ramas base, lo que permite construir con `util/optimize.py` cuantizaciones mixtas optimizadas a cualquier bpw objetivo en segundos.

Es relevante ahora porque el modelo base solo es utilizable en la práctica si se dispone de hardware muy amplio en BF16, y porque la cuantización EXL3 de este tipo de arquitecturas híbridas Mamba-2 + MoE latente requiere ExLlamaV3 ≥ 1.5.0: versiones anteriores fallan silenciosamente con relleno de ceros en los expertos y error `Too many experts per token`. Esta ficha documenta ese requisito y los datos de perplejidad medidos por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + atención + MoE con proyecciones latentes (latent-MoE), con cabeza MTP integrada. 88 capas, de las cuales 8 son de atención; enrutamiento top-22 expertos |
| Parametros totales | 120B (modelo base `NVIDIA-Nemotron-3-Super-120B-A12B-BF16`) |
| Parametros activos | 12B por token (aproximadamente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2.0, 3.0, 4.0 y 5.0 bpw (ramas `2.0bpw-h16`, `3.0bpw-h16`, `4.0bpw-h16`, `5.0bpw-h16`), con `lm_head` en FP16 y cabeza MTP a 4 bpw; codebook `mul1` |
| Idiomas soportados | no disponible |
| Licencia | `nvidia-nemotron-open-model-license` (declarada como `other` en HuggingFace) |
| Formato de pesos | EXL3 / ExLlamaV3 (tensores en safetensors), requiere ExLlamaV3 ≥ 1.5.0 |
| Tamano del repositorio | 81,7 GB |
| Libreria declarada | transformers |
| Tarea (pipeline) | text-generation |
| Cuantizado por | amanwalksdownthestreet, desde el checkpoint BF16 con ExLlamaV3 dev `adf70fd` (commits publicados como 1.5.0) |
| Calibracion | 250 filas × 2048 tokens para las ramas base; `measurement.json` con `measure.py -l 3`, 46 filas × 2048, 184 grupos de tensores, 4 candidatos |

## Arquitectura y entrenamiento

El checkpoint base es un transformer híbrido: la mayor parte de las 88 capas usa bloques Mamba-2 (modelo de espacio de estados), 8 capas emplean atención convencional con solo 2 cabezas KV y el resto del cómputo de capacidad se reparte mediante un MoE con enrutamiento top-22 y proyecciones latentes (`fc1_latent_proj` / `fc2_latent_proj`). Incorpora además una cabeza MTP para predicción multi-token. El resultado es un modelo de 120B con 12B activos, lo que explica que el KV cache sea pequeño en comparación con un transformer denso equivalente: solo 8 de 88 capas atienden y con 2 cabezas KV.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no hay información en los materiales proporcionados. Lo que sí documenta esta publicación es el proceso de cuantización: se partió directamente del checkpoint BF16, se mantuvo `lm_head` en FP16, se cuantizó la cabeza MTP a 4 bpw y se usó un codebook `mul1`. El `measurement.json` incluido en `main` procede de una ejecución completa de `measure.py` sobre las cuatro ramas. Una observación técnica destacable del autor: a 2 bpw casi todo el error de salida medible se concentra en las proyecciones Mamba-2, los expertos compartidos y la atención (aproximadamente el 4 % de los pesos), mientras que los expertos enrutados (el 96 % de los pesos) contribuyen poco en el régimen de medición con todos los expertos activos.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`; es la función principal del modelo base y de estas cuantizaciones.
- Modelo base de tipo generalista de 120B (12B activos): se le presuponen las capacidades del checkpoint BF16 original, pero la información proporcionada no detalla tareas concretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo base no declara idiomas en los datos recibidos.
- Capacidades especiales (modo thinking, visión, audio): no disponible. Lo único confirmado es la existencia de una cabeza MTP (multi-token prediction) integrada en la arquitectura.
- Decodificación especulativa: la cabeza MTP está diseñada para predicción multi-token, lo que la hace candidata a usarse con decodificación especulativa, pero la información disponible no confirma su uso en ExLlamaV3.
- Idiomas soportados: no disponible.

## Casos de uso

- Inferencia autoalojada de un modelo de 120B en una sola GPU: con las ramas de 2.0 a 5.0 bpw (32-74 GB) el modelo cabe en una única GPU de 96 GB, lo que permite desplegar un modelo de gran tamaño sin infraestructura multi-GPU.
- Servicio de generación de texto con contexto largo en producción: el KV cache es reducido (8 de 88 capas de atención, 2 cabezas KV), de modo que el coste de memoria por token de contexto es bajo en comparación con un transformer denso equivalente; útil para resúmenes de documentos extensos y RAG sobre corpus grandes, siempre que se valide la longitud de contexto real del modelo base.
- Ajuste fino del equilibrio calidad/memoria: partiendo de `measurement.json`, `util/optimize.py` permite generar en segundos una cuantización de bitrate mixto a un bpw objetivo, útil cuando hay que encajar el modelo en un presupuesto de VRAM fijo sin bajar de calidad uniformemente.
- Despliegue en servidores de inferencia compatibles con ExLlamaV3: al ser un formato EXL3, encaja en pilas como ExLlamaV3 y servicios construidos sobre ella (por ejemplo TabbyAPI/ExUI) para exponer una API compatible con OpenAI sobre el modelo cuantizado.
- Evaluación de cuantizaciones y estudios de degradación: las cuatro ramas con perplejidad medida (7,16 / 5,46 / 5,12 / 5,10 en wikitext) permiten estudiar la curva de degradación por bitrate en una arquitectura híbrida Mamba-2 + MoE latente.
- Investigación sobre arquitecturas híbridas SSM/atención/MoE: el modelo permite reproducir experimentos sobre modelos con estado recurrente y enrutamiento disperso en hardware asequible, comparando contra el checkpoint BF16 de referencia.
- Pipelines de generación de texto por lotes en entornos con una GPU de 80 GB: las ramas de 2.0, 3.0 y 4.0 bpw (32, 46 y 60 GB) dejan margen suficiente para procesar lotes con contexto moderado en una A100 de 80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica mediciones de perplejidad de las cuantizaciones sobre wikitext, que miden degradación por cuantización, no calidad frente a otros modelos:

| Rama | bpw | Tamano | Perplejidad (wikitext, 100 × 2048) |
|---|---|---|---|
| 2.0bpw-h16 | 2,0 | 32 GB | 7,16 |
| 3.0bpw-h16 | 3,0 | 46 GB | 5,46 |
| 4.0bpw-h16 | 4,0 | 60 GB | 5,12 |
| 5.0bpw-h16 | 5,0 | 74 GB | 5,10 |

No se proporciona la perplejidad del checkpoint BF16 de referencia, por lo que no puede calcularse la pérdida exacta respecto al original a partir de estos datos.

## Requisitos de hardware

- VRAM estimada para los pesos: 32 GB (2.0 bpw), 46 GB (3.0 bpw), 60 GB (4.0 bpw) y 74 GB (5.0 bpw). Hay que sumar el KV cache y los buffers de activaciones, que el autor describe como pequeños.
- GPU de 96 GB: cualquiera de las cuatro ramas cabe según el autor (H100 de 96 GB, RTX Pro 6000 Blackwell de 96 GB y similares).
- GPU de 80 GB: la A100 de 80 GB puede alojar las ramas de 2.0, 3.0 y 4.0 bpw con margen; la de 5.0 bpw queda muy justa.
- GPU de consumo: la rama de 2.0 bpw (32 GB) es la única candidata a caber en tarjetas de 32 GB (por ejemplo RTX 5090), pero el margen para KV cache y contexto es mínimo y no está confirmado en la información disponible. En tarjetas de 24 GB no cabe ninguna de las ramas publicadas.
- Longitud de contexto máxima real: no disponible, por lo que el dimensionado del KV cache para contextos largos no puede calcularse con los datos aportados.
- Opciones de despliegue: ExLlamaV3 ≥ 1.5.0 (obligatorio). En 1.4.x los expertos se cargan con relleno de ceros y la inferencia falla con `Too many experts per token`. No se indica compatibilidad con llama.cpp, GGUF, vLLM u Ollama; al ser un formato EXL3, la pila esperada es ExLlamaV3 y servidores construidos sobre ella.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de terceros en los materiales proporcionados. La única comparación posible con los datos recibidos es interna, entre las cuatro ramas cuantizadas y el checkpoint BF16 del que derivan:

| Version | Parametros | Contexto | Perplejidad (wikitext) | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 2.0bpw-h16 (esta publicacion) | 120B / 12B activos | no disponible | 7,16 | 32 GB | nvidia-nemotron-open-model-license | HuggingFace, EXL3 |
| 3.0bpw-h16 (esta publicacion) | 120B / 12B activos | no disponible | 5,46 | 46 GB | nvidia-nemotron-open-model-license | HuggingFace, EXL3 |
| 4.0bpw-h16 (esta publicacion) | 120B / 12B activos | no disponible | 5,12 | 60 GB | nvidia-nemotron-open-model-license | HuggingFace, EXL3 |
| 5.0bpw-h16 (esta publicacion) | 120B / 12B activos | no disponible | 5,10 | 74 GB | nvidia-nemotron-open-model-license | HuggingFace, EXL3 |
| `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16` | 120B / 12B activos | no disponible | no disponible | no disponible | nvidia-nemotron-open-model-license | HuggingFace, BF16 |

## Limitaciones y advertencias

- Requisito estricto de versión: con ExLlamaV3 1.4.x o anterior los expertos se cargan con relleno de ceros y la inferencia falla con `Too many experts per token`. Hay que usar 1.5.0 o superior.
- Dependencia de una única pila de inferencia: el formato EXL3 no es portable a llama.cpp, GGUF, vLLM u Ollama según la información disponible, lo que limita las opciones de despliegue y de portabilidad entre entornos.
- Degradación por cuantización: la rama de 2.0 bpw presenta una perplejidad de 7,16 frente a 5,10 de la de 5.0 bpw, una diferencia sustancial; en tareas sensibles a la precisión conviene validar la calidad antes de elegir el bitrate más bajo. El propio autor señala que a 2 bpw el error se concentra en las proyecciones Mamba-2, los expertos compartidos y la atención.
- Descarga y validación: el repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, y la cuantización no está avalada por NVIDIA. Trata los pesos como material de terceros y verifica su integridad antes de usarlos en producción.
- Alcance de las métricas publicadas: solo hay perplejidad en wikitext; no hay MMLU, HumanEval ni ninguna evaluación de capacidad, ni comparación con el BF16 original, por lo que no puede cuantificarse la pérdida real de calidad.
- Idiomas soportados: no disponibles. No puede asumirse cobertura multilingüe sin verificarla.
- Licencia: `nvidia-nemotron-open-model-license`, una licencia propia de NVIDIA declarada como `other` en HuggingFace. Es imprescindible revisar sus términos antes de cualquier uso comercial o redistribución; es habitual que estas licencias impongan condiciones de atribución, restricciones de uso y cláusulas de responsabilidad.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo general de los modelos generativos de texto y debe mitigarse a nivel de aplicación.
- Sesgos: no hay información sobre evaluación de sesgos ni sobre la composición del dataset de entrenamiento del modelo base.
- Contexto: la longitud de contexto no está publicada en los datos recibidos, así que no puede garantizarse un dimensionado correcto para cargas con ventanas largas.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/amanwalksdownthestreet/NVIDIA-Nemotron-3-Super-120B-A12B-exl3
- Modelo base en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Rama 2.0bpw-h16: https://huggingface.co/amanwalksdownthestreet/NVIDIA-Nemotron-3-Super-120B-A12B-exl3/tree/2.0bpw-h16
- Rama 3.0bpw-h16: https://huggingface.co/amanwalksdownthestreet/NVIDIA-Nemotron-3-Super-120B-A12B-exl3/tree/3.0bpw-h16
- Rama 4.0bpw-h16: https://huggingface.co/amanwalksdownthestreet/NVIDIA-Nemotron-3-Super-120B-A12B-exl3/tree/4.0bpw-h16
- Rama 5.0bpw-h16: https://huggingface.co/amanwalksdownthestreet/NVIDIA-Nemotron-3-Super-120B-A12B-exl3/tree/5.0bpw-h16
- Licencia del modelo: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Incidencia de ExLlamaV3 sobre soporte de latent-MoE y enrutamiento top-22: https://github.com/turboderp-org/exllamav3/issues/359
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
