# axteam/Qwen3.5-4B-FP8-dynamic

## Resumen

`axteam/Qwen3.5-4B-FP8-dynamic` es una cuantización de 8 bits del modelo multimodal `Qwen/Qwen3.5-4B` del equipo Qwen (Alibaba), publicada por el usuario axteam y pensada específicamente para servir el modelo con vLLM. No es un modelo nuevo: es un derivado PTQ (post-training quantization) que pesa aproximadamente 5,4 GB en disco frente a los 5,8 GB del repositorio original, y que conserva intactos el tokenizador, el `chat_template` y el `generation_config` del modelo base.

El modelo base es un transformer híbrido que combina atención lineal con atención completa, de arquitectura densa (no MoE), con torre de visión para entrada imagen-texto y una cabeza de predicción multi-token (MTP). El recuento real de parámetros según los safetensors es de 4.659.865.088 (~4,66 mil millones), lo que lo sitúa en el segmento de 4B con capacidad multimodal y lo hace desplegable en GPUs de consumo.

Su relevancia ahora es doble: por un lado, permite ejecutar un modelo multimodal Qwen 3.5 en FP8 con vLLM reduciendo el peso de los pesos a la mitad, sin calibración (FP8 dynamic es data-free); por otro, la model card publica métricas de fidelidad frente al BF16 original, algo poco habitual en cuantizaciones de terceros y útil para decidir si la pérdida de precisión es aceptable en producción. El modelo es muy reciente, no tiene descargas ni likes y no documenta ventana de contexto ni idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 (~4,66 B), según safetensors |
| Parametros activos | No aplica: modelo denso |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 dinámico W8A8: pesos FP8 E4M3 con escala por canal de salida (estática, sin calibración) y activaciones FP8 dinámicas por token, en formato compressed-tensors `FP8_DYNAMIC`; ciertos módulos se mantienen en BF16 |
| Idiomas soportados | No disponible; el conjunto de evaluación interno usa prompts en inglés y coreano |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors con compresión `compressed-tensors` (`FP8_DYNAMIC`); compatible con transformers y vLLM |
| Tamano en disco | ~5,4 GB según la model card; 5,8 GB de repositorio en HuggingFace |
| Calibracion | Ninguna (escalas de pesos estáticas data-free, activaciones dinámicas) |
| Libreria / pipeline | transformers; `image-text-to-text` |
| Fecha de publicacion | 2026-10-29 |

## Arquitectura y entrenamiento

La arquitectura heredada es un transformer híbrido: intercala capas de atención lineal con capas de atención completa, lo que en la práctica reduce el coste del contexto largo respecto a un transformer de atención completa pura. El modelo es denso, no mezcla de expertos, e incorpora tres componentes adicionales: una torre de visión con proyector (entrada imagen-texto), una cabeza de predicción multi-token (MTP) y módulos no lineales propios de las capas de atención lineal (`linear_attn.conv1d`, `A_log`, `dt_bias`), lo que confirma la presencia de componentes de tipo SSM en el bloque híbrido. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base.

El proceso de cuantización es PTQ puro, sin reentrenamiento ni ajuste fino posterior, de modo que el comportamiento del modelo cuantizado sigue siendo el del original. Los pesos se almacenan en FP8 E4M3 con una escala por canal de salida y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Se dejan en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del bloque SSM. La decisión de mantener el vision tower y la MTP en BF16 implica que esas rutas no se benefician del ahorro de precisión y conservan la calidad original.

## Capacidades

- Generación de texto conversacional multi-turno, con el `chat_template` original de Qwen.
- Entrada multimodal imagen-texto: pipeline declarado `image-text-to-text`, con torre de visión conservada en BF16.
- Comprensión de imágenes (descripción, extracción de información visual) al mantener el proyector sin cuantizar.
- Cabeza de predicción multi-token (MTP) operativa en BF16, lo que en principio habilita decodificación especulativa en vLLM, aunque la model card no documenta explícitamente su activación ni su ganancia.
- Servido eficiente en vLLM mediante FP8 nativo, con muestreo recomendado por Qwen (`temperature=0.7`, `top_p=0.8`, `top_k=20`).
- Compatibilidad con `transformers` además de vLLM.
- Tool calling / function calling: no documentado en la información disponible.
- Modo de razonamiento explícito (thinking) ni soporte de audio: no documentados en la información disponible.
- Capacidades multilingües: no documentadas; la única evidencia indirecta es el conjunto de evaluación interno en inglés y coreano, que mide fidelidad, no competencia lingüística.

## Casos de uso

- Servicio conversacional en producción con vLLM: el modelo se arranca con `vllm serve axteam/Qwen3.5-4B-FP8-dynamic` y atiende chat multi-turno con la mitad de peso de pesos que el BF16, lo que libera VRAM para caché KV en despliegues concurrentes.
- Asistente sobre documentos escaneados: al conservar la torre de visión en BF16, se puede enviar una captura o un formulario y pedir extracción de campos; la pérdida de calidad visual es nula porque ese camino no se cuantiza.
- Despliegue on-premise con GPU de consumo: con ~5,4 GB de pesos cabe en tarjetas de 12-16 GB, lo que permite ofrecer un asistente multimodal sin salida a la nube en entornos con requisitos de confidencialidad.
- Procesamiento por lotes de descripciones de imágenes accesibles: generación masiva de texto alternativo para catálogos o repositorios de imágenes, donde el coste por token es el factor dominante.
- Backend de aplicaciones RAG multimodales: combinación de recuperación de texto con imágenes adjuntas, aprovechando la ventana de atención híbrida; requiere validar empíricamente la longitud de contexto efectiva, que no está documentada.
- Baseline de fidelidad en pipelines de cuantización: sirve como referencia reproducible para comparar otras estrategias (INT8, AWQ, GGUF) contra el BF16 original usando el mismo harness de evaluación.
- Evaluación comparativa de builds FP8: al existir al menos otra cuantización FP8 del mismo modelo base (RedHatAI), permite contrastar implementaciones antes de fijar una en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible. La model card solo publica métricas de fidelidad frente al modelo BF16 original, medidas sobre un conjunto interno mixto inglés/coreano de 100 prompts, con respuestas greedy del BF16 puntuadas bajo cada build y el mismo harness para todas las filas.

| Metrica | Este modelo (FP8 dynamic) | Original BF16 |
|---|---|---|
| Perplejidad (menor = mejor) | 1,5885 | 1,5703 (+1,2 %) |
| Acuerdo top-1 en el siguiente token | 95,3 % | 99,2 % |

Estas cifras miden la proximidad al modelo base, no la calidad absoluta en tareas. Un acuerdo top-1 del 95,3 % implica que aproximadamente 1 de cada 21 tokens difiere del BF16, una divergencia que puede acumularse en generaciones largas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan ~4,66 GB (4.659.865.088 parámetros a 1 byte) más los módulos en BF16; el repositorio completo son 5,8 GB. Con overhead de runtime y caché KV, un despliegue realista parte de unos 6-8 GB y conviene reservar 12-16 GB para contextos amplios y concurrencia. Cálculo estimado a partir del tamaño de los pesos, no publicado por el autor.
- GPU recomendadas para producción: NVIDIA H100, A100 o L40S para servido concurrente con vLLM.
- GPU de consumo: sí cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 4070 Ti (12 GB). En tarjetas de 8 GB el modelo entraría muy justo y sin margen para caché KV.
- Requisito de FP8: los kernels FP8 nativos del ecosistema NVIDIA requieren GPUs Ada Lovelace o Hopper (sm_89+). En arquitecturas anteriores (Ampere, Turing) el rendimiento FP8 no está garantizado por hardware y vLLM puede no ofrecer la ruta óptima.
- Opciones de despliegue: vLLM es la vía recomendada y documentada por el autor (`vllm serve`); también es cargable con `transformers`. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no están disponibles para este repositorio concreto.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| axteam/Qwen3.5-4B-FP8-dynamic | ~4,66 B | No disponible | FP8 dynamic W8A8 | ~5,4 GB en disco | Apache-2.0 | Build del autor axteam; métricas de fidelidad publicadas (perplejidad +1,2 %, top-1 95,3 %) |
| RedHatAI/Qwen3.5-4B-FP8-dynamic | ~4,66 B | No disponible | FP8 dynamic | 8,0 GB según su README (desde 9,3 GB) | Apache-2.0 | Misma estrategia de cuantización y mismo modelo base; reduce ~14 % el peso en disco y publica resultados de evaluación y pasos de reproducción |
| Qwen/Qwen3.5-4B (BF16) | ~4,66 B | No disponible | Ninguna (BF16) | ~9,3 GB (estimado: 4,66 B × 2 bytes) | Apache-2.0 | Referencia de calidad; sin pérdida de precisión, el doble de peso de pesos |

No se dispone de datos de benchmarks de tareas que permitan comparar estos tres builds en MMLU, HumanEval o GSM8K, ni de una comparación con modelos de otros fabricantes del mismo segmento.

## Limitaciones y advertencias

- Riesgo de alucinación: inherente a un modelo de 4B; el tamaño reducido limita la profundidad de razonamiento frente a variantes mayores, y la cuantización no corrige ese sesgo.
- Pérdida de fidelidad medible: +1,2 % de perplejidad y 95,3 % de acuerdo top-1 frente al BF16. En tareas sensibles a la precisión numérica o a la verificación exacta de tokens, conviene validar contra el original.
- Idiomas no documentados: la model card no declara cobertura lingüística; el conjunto de evaluación interno en inglés y coreano mide fidelidad de cuantización, no competencia en esos idiomas ni en castellano. Requiere evaluación propia antes de usar en producción en español.
- Contexto no documentado: se desconoce la longitud máxima efectiva, dato crítico para dimensionar caché KV y para casos de uso con documentos largos.
- Estado de validación comunitaria nulo: 0 descargas y 0 likes en el momento del análisis, publicación muy reciente y sin trazabilidad de terceros. Es un artefacto de un autor individual, no un build oficial de Qwen.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero los pesos, tokenizador y `chat_template` originales pertenecen al equipo Qwen y conviene conservar la atribución y el aviso de licencia del modelo base.
- Dependencia de hardware FP8: el beneficio de rendimiento solo se materializa en GPUs Ada Lovelace o Hopper; en GPUs anteriores el build puede ser más lento o no funcionar con los kernels previstos.
- El vision tower y la cabeza MTP permanecen en BF16, por lo que el ahorro de memoria se concentra en el decodificador de lenguaje y no en la ruta multimodal.
- No hay instrucciones de seguridad, filtros ni ajuste de alineamiento específicos en este derivado; el comportamiento es el del modelo base, con los sesgos que este arrastre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-4B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Cuantización equivalente de RedHatAI: https://huggingface.co/RedHatAI/Qwen3.5-4B-FP8-dynamic
- README de RedHatAI con resultados y reproducción: https://huggingface.co/RedHatAI/Qwen3.5-4B-FP8-dynamic/blob/main/README.md
- Ficha en AETRON Models: https://app.aetron.io/en/registry/qwen3.5-4b-fp8
- Ficha en Inferix: https://inferix.co/models/RedHatAI/Qwen3.5-4B-FP8-dynamic
- Ficha en ThinkLLM: https://thinkllm.dev/models/qwen3-5-4b-fp8-dynamic
