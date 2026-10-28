# heisvibhor-1/clef-flash-tpu-int8

## Resumen

clef-flash-tpu-int8 es un port a JAX del modelo de decisión Cloudflare/clef-flash, cuantizado a int8 y compilado para ejecutarse en un único chip Google TPU v5e, incluida la TPU v5e-1 gratuita de Colab. Lo publica el usuario heisvibhor-1 y su propósito no es la generación de texto libre, sino responder consultas estructuradas con el formato de petición y respuesta `/v1/systemone` (Jev / SystemOne): el llamante define un esquema de preguntas con tipos como `choice` o `noul` y el modelo devuelve las respuestas rellenadas.

El modelo subyacente es clef-flash de Cloudflare, cuya base es Qwen/Qwen3.5-9B según la propia model card, por lo que hablamos de un transformer de aproximadamente 9 000 millones de parámetros con atención estándar, linear-attention y capas MLP, más una cabeza de decisión propietaria (`JointSchemaHead`) que construye el prompt y produce la salida conforme al esquema. La aportación de este repositorio es la reimplementación en JAX, la cuantización int8 de los pesos (con opción W8A8) y la compilación anticipada de programas XLA para reducir la latencia por petición.

Su relevancia es práctica: demuestra que un modelo de decisión de ~9B puede servirse en hardware TPU de gama de entrada con ~7 GB de memoria, 102-138 ms de latencia por petición y una precisión en ARC-Challenge de 98,0-98,2 %, frente al 98,3 % publicado por Cloudflare en BF16. Es, por tanto, una alternativa de bajo coste para enrutado y clasificación estructurada, no un sustituto del modelo original en tareas generativas.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (atención, linear-attention y MLP) con cabeza de decisión `JointSchemaHead` de Cloudflare, reimplementado en JAX |
| Parámetros totales | Aproximadamente 9 000 millones (deducido del modelo base Qwen/Qwen3.5-9B citado en la model card; no se declara explícitamente) |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | 16 384 tokens como límite de truncado (equivalente a la implementación de Cloudflare); probado con prompts de hasta 6 820 tokens |
| Tipos de cuantización | Pesos int8 con una escala fp32 por canal de salida (SQNR mediano de 40 dB); activaciones int8 opcionales (W8A8) o BF16; normas, embeddings, LM head y cabeza de esquema en BF16 sin cambios |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`*_attention.safetensors`, `mlp.safetensors`, `layer_norms.safetensors`, `embeddings.safetensors`, `lm_head.safetensors`, `joint_head.safetensors`) más ejecutables XLA serializados con pickle en `compiled/<runtime id>/` |
| Modelo base | Cloudflare/clef-flash (relación: quantized) |
| Tamaño del repositorio | 11,3 GB |
| Descargas / likes | 13 descargas, 0 likes (a fecha de la información disponible) |
| Fechas | Creado el 2026-10-22, actualizado el 2026-10-28 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una conversión de pesos y una reimplementación de inferencia. `clef_tpu.py` reproduce en JAX el modelo Qwen3.5 de Transformers y la `JointSchemaHead` de Cloudflare, apilando las capas del mismo tipo para ejecutarlas con `lax.scan`. La cuantización aplica int8 a los pesos de atención, linear-attention y MLP, con una única escala fp32 por canal de salida; el SQNR mediano medido sobre 200 matrices es de 40 dB (aproximadamente un 1 % de error). Las normas, los embeddings, el LM head y la cabeza de esquema conjunta se mantienen bit a bit idénticos al modelo de origen, y los embeddings y el LM head permanecen en BF16 en memoria de host.

La innovación operativa está en la compilación anticipada: los prompts se rellenan a múltiplos de 1 024 tokens y cada longitud requiere un programa XLA distinto, con un coste de compilación de unos 22 segundos por programa. El repositorio incluye programas compilados por identificador de runtime (tipo de TPU y build de JAX/libtpu), de modo que `load_model` selecciona el directorio correspondiente y evita la compilación en la primera petición. También se ofrece `compile_backbones(model, 8192, save_dir=...)` para compilar todas las longitudes hasta 8 192 tokens. No se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) del modelo original de Cloudflare.

## Capacidades

- Decisión estructurada: responde esquemas de preguntas definidos por el llamante, con tipos como `choice` (selección entre criterios con etiqueta y descripción) y `noul` (booleano sí/no).
- Enrutado y clasificación: asignación de un mensaje o incidente a un departamento o cola según criterios arbitrarios definidos en la petición.
- Salida conforme a esquema: la `JointSchemaHead` genera las respuestas dentro del formato declarado, lo que facilita su consumo directo por programas.
- API compatible con Jev / SystemOne: implementa el endpoint `/v1/systemone` con el formato de petición y respuesta de Cloudflare.
- Ejecución en TPU: soporte para un único chip v5e, incluida la TPU v5e-1 gratuita de Google Colab.
- Cuantización conmutable: modo int8 con activaciones BF16 o modo W8A8 con activaciones int8, seleccionable con el argumento `int8_activations`.
- Servidor HTTP listo para usar: el notebook del repositorio levanta un servidor y lo expone mediante una URL pública de `cloudflared`.
- No incluido: el codificador de visión no forma parte de la conversión, por lo que no hay capacidades multimodales.
- No disponible: soporte de tool calling genérico, modo thinking, audio u otras capacidades del modelo base no se documentan en esta información.

## Casos de uso

- Triaje de tickets de soporte: con un esquema que combine una pregunta `choice` (por ejemplo, `billing` frente a `technical`) y una `noul` ("¿hay un servicio caído?"), el modelo clasifica el mensaje en una sola pasada de 102-138 ms y lo deriva a la cola correcta.
- Enrutado de correo entrante a departamentos: los criterios se declaran en la propia petición, de modo que el equipo puede cambiar el mapa de departamentos sin reentrenar ni redeployar el modelo, solo modificando el esquema enviado.
- Moderación y políticas: definición de categorías de incumplimiento como opciones `choice` con descripciones, aprovechando que la salida queda restringida al conjunto de etiquetas declarado en lugar de texto libre.
- Extracción de campos para pipelines de ingesta: obtención de decisiones booleanas y categóricas sobre documentos (por ejemplo, "¿requiere revisión humana?", "¿qué tipo de contrato es?") que se insertan directamente en un ETL o en una cola de trabajo.
- Puerta de decisión en flujos de aprobación: evaluación automática de solicitudes con criterios de negocio codificados en el esquema, con la latencia suficiente (menos de 150 ms por petición) para operar de forma síncrona dentro de una API.
- Prototipado sin coste de infraestructura: despliegue en la TPU v5e-1 gratuita de Colab mediante el notebook incluido, para validar umbrales y esquemas antes de mover la carga al modelo BF16 en producción.
- Backend de bajo coste para un endpoint `/v1/systemone`: aproximadamente 7 GB de memoria TPU y pesos int8 permiten servir el modelo en un solo chip, útil para entornos de preproducción o demos internas.
- Evaluación comparativa de cuantización: el propio repositorio sirve para medir el impacto de int8 y W8A8 sobre un conjunto de 1 172 preguntas, con trazabilidad de versiones de JAX y del dataset.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre ARC-Challenge (1 172 preguntas de Decision Index, benchmark 27), con la misma metodología de puntuación que la evaluación de Cloudflare:

| Modelo | Correctas | Precisión | Latencia mediana |
|---|---:|---:|---:|
| Cloudflare clef-flash, BF16 (publicado) | ≈1 152 | 98,3 % | No disponible |
| clef-flash TPU, pesos int8 | 1 151 | 98,2 % | 138 ms |
| clef-flash TPU, W8A8 | 1 149 | 98,0 % | 102 ms |

La diferencia de una pregunta respecto al resultado BF16 publicado queda dentro del margen de muestreo de ±0,8 puntos. El paso a W8A8 cambia 9 de las 1 172 respuestas. La latencia se midió con una petición a la vez en un único chip TPU v5e; el autor advierte que no es directamente comparable con la latencia en H200 reportada por Cloudflare. Entorno declarado: jax 0.11.2, jaxlib 0.11.2, transformers 5.20.2, safetensors 0.8.0, torch 2.14.1+cpu, huggingface_hub 1.33.0; dataset `decision-index` @ `25c6ec7b6b5f` sobre `allenai/ai2_arc` @ `210d026faf99`; pesos @ `408c77846fa6`.

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas para este modelo.

## Requisitos de hardware

- Acelerador: un único chip Google TPU v5e, incluida la v5e-1 gratuita de Google Colab. No se documenta soporte para GPU.
- Memoria en TPU: aproximadamente 7 GB con pesos int8.
- Memoria de host: embeddings y LM head se mantienen en BF16 fuera del dispositivo.
- VRAM estimada para GPU: no disponible; no se ha publicado una ruta de despliegue en GPU para esta conversión.
- Almacenamiento: repositorio de 11,3 GB, incluyendo los programas XLA compilados por runtime.
- Tiempo de compilación: unos 22 segundos por cada longitud de prompt (múltiplos de 1 024 tokens) si no existe un programa precompilado para el runtime actual.
- Software: entorno TPU con JAX preinstalado, más `transformers>=5.10`, `safetensors` y `torch` en versión CPU. `transformers.AutoModel` no puede cargar este modelo; es obligatorio usar `clef_tpu.py`.
- Despliegue: script `clef_tpu.py` y `notebook.ipynb`, que levanta un servidor HTTP para `/v1/systemone` y lo publica mediante `cloudflared`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 138 ms por petición con pesos int8 y activaciones BF16; 102 ms con W8A8, medidos de una en una. No se ha publicado throughput agregado ni comportamiento con lotes concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ARC-Challenge | Licencia | Disponibilidad y hardware |
|---|---|---|---|---|---|
| heisvibhor-1/clef-flash-tpu-int8 | ~9B (heredados de Qwen3.5-9B) | 16 384 tokens (truncado) | 98,2 % (int8) / 98,0 % (W8A8) | Apache-2.0 | TPU v5e único, ~7 GB; JAX |
| Cloudflare/clef-flash | ~9B (base Qwen3.5-9B) | No disponible en esta información | 98,3 % (BF16, publicado) | Apache-2.0 | No disponible en esta información; el autor menciona latencias en H200 no comparables |
| Qwen/Qwen3.5-9B | ~9B | No disponible en esta información | No disponible | Apache-2.0 | Modelo base generalista; no es un modelo de decisión con esquema |

La comparación relevante es frente al original de Cloudflare, del que este repositorio es una conversión: misma licencia, misma cabeza de decisión y precisión prácticamente idéntica, con la diferencia de que aquí el objetivo es hardware TPU de gama de entrada y no GPU de datacenter. No se dispone de datos para comparar con otros modelos de decisión estructurada.

## Limitaciones y advertencias

- No es un modelo conversacional: está diseñado para responder esquemas de decisión, no para generar texto libre; usarlo como chat queda fuera de su formato previsto.
- Sin capacidades de visión: el codificador visual del modelo de origen no se incluye en la conversión.
- Truncado de contexto: los prompts de más de 16 384 tokens se recortan, igual que en la implementación de Cloudflare; además, el relleno a múltiplos de 1 024 tokens desperdicia cómputo en prompts cortos.
- Validación limitada: 13 descargas y 0 likes; el único benchmark publicado es ARC-Challenge (1 172 preguntas), insuficiente para extrapolar el comportamiento a otros dominios.
- Impacto de la cuantización: W8A8 altera 9 de 1 172 respuestas y el SQNR mediano de 40 dB implica en torno a un 1 % de error en las matrices cuantizadas; conviene reevaluar en el dominio propio antes de producción.
- Riesgo de clasificación errónea: al restringir la salida a un esquema cerrado, el fallo típico no es la alucinación de texto sino la asignación incorrecta de etiqueta; con criterios ambiguos en la petición el modelo puede forzar una opción del conjunto.
- Idiomas soportados no documentados: no hay garantía explícita de calidad multilingüe, y la evaluación publicada es en inglés.
- Dependencia del runtime: los programas compilados están atados a la versión de JAX/libtpu y al tipo de TPU; un cambio de entorno obliga a recompilar (unos 22 segundos por longitud de prompt).
- Seguridad: los ficheros de `compiled/` son ejecutables XLA serializados con pickle; solo deben cargarse desde una fuente de confianza, tal como advierte el autor.
- Sesgos: no se documentan análisis de sesgo en la información disponible; los sesgos del modelo base Qwen3.5-9B se heredan a través de clef-flash.
- Licencia: Apache-2.0, la misma que el modelo de Cloudflare y que Qwen3.5-9B, por lo que no se añaden restricciones comerciales adicionales conocidas; aun así, conviene revisar los términos del modelo base para usos regulados.
- Integración: no funciona con `transformers.AutoModel` ni se documenta soporte en vLLM, llama.cpp u Ollama, lo que limita su encaje en stacks de serving convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heisvibhor-1/clef-flash-tpu-int8
- Notebook de Colab: https://huggingface.co/heisvibhor-1/clef-flash-tpu-int8/blob/main/notebook.ipynb
- Acceso directo a Colab: https://huggingface.co/heisvibhor-1/clef-flash-tpu-int8/colab
- Modelo base (Cloudflare): https://huggingface.co/Cloudflare/clef-flash
- Formato de entrada de Cloudflare: https://huggingface.co/Cloudflare/clef-flash#input-format
- API Jev / SystemOne: https://huggingface.co/Cloudflare/clef-flash#jev--systemone-api
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Decision Index (benchmark): https://github.com/apolinario/decision-index
- Dataset ARC (allenai/ai2_arc): https://huggingface.co/datasets/allenai/ai2_arc
- Documentación de cuantización int8 para TPU en vLLM (referencia externa sobre el backend, no específica de este modelo): https://docs.vllm.ai/en/latest/api/vllm/model_executor/layers/quantization/tpu_int8/
