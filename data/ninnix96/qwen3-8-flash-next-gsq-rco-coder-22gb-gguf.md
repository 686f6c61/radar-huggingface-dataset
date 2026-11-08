# Ninnix96/Qwen3.8-Flash-Next-GSQ-RCO-Coder-22GB-gguf

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-Coder-22GB-gguf es una distribución GGUF comunitaria del modelo Qwen3.8-Flash-Next de Alibaba, publicada por el usuario Ninnix96. No se trata de un modelo entrenado desde cero, sino de un híbrido de dos releases GGUF ya publicados: la versión podada GSQ-RCO Coder de ISTA-DASLab y el release UD-IQ1_S de Unsloth. El autor combina la poda exacta de expertos de ISTA con bancos de expertos en menor precisión procedentes de Unsloth, sin realizar nuevo entrenamiento, búsqueda de poda ni recuantización de pesos.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 512 expertos por capa, del que se retienen 256 en cada una de las 48 capas, seleccionando 10 expertos por token. Los parámetros totales registrados en safetensors ascienden a 116.514.464.640 (unos 116,5 mil millones). La arquitectura GGUF declarada es `qwen4exp`, e incorpora una tabla de búsqueda n-gram (PLE) de 28,8 GB que puede servirse desde disco con carga perezosa.

La relevancia de esta ficha es doble: por un lado, ilustra las técnicas de compresión agresiva (poda de expertos más cuantización mixta de 2 bits) que permiten reducir un modelo de 354 GB en BF16 a un paquete de 50,79 GB; por otro, es un ejemplo de distribución comunitaria que exige verificación cuidadosa antes de usarla en producción, dado que no hay benchmarks publicados ni validación de calidad realizadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen4exp` en GGUF), 48 capas, 512 expertos por capa |
| Parametros totales | 116.514.464.640 (aprox. 116,5 mil millones, dato de safetensors) |
| Parametros activos | no disponible (se seleccionan 10 expertos por token, pero no se publica el recuento de parámetros activos) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 8192`) |
| Tipos de cuantizacion | IQ2_XXS, IQ2_S, Q2_0, IQ4_NL (asignación mixta por clase de tensor) |
| Idiomas soportados | en |
| Licencia | qwen-community-1.0 (etiquetada como `other` en la model card) |
| Formato de pesos | GGUF (dos shards: transformer de 21.9866 GB y tabla n-gram de 28.8001 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE con 48 capas y 512 expertos enrutados por capa, de los que se conservan 256 en el mismo orden de router en todas las capas. Cada token activa 10 expertos. La distribución de precisión se concentra en los expertos enrutados: los bancos `gate` usan 35 tensores en IQ2_XXS y 13 en IQ2_S; los bancos `up`, 36 en IQ2_XXS y 12 en IQ2_S; y los bancos `down`, 41 en Q2_0 y 7 en IQ4_NL. Los 1.079 tensores no enrutados del transformer (atención, expertos compartidos, routers, embeddings, cabeza de salida y tensores de control) se mantienen idénticos a los del release de ISTA, tanto en bytes como en tipo.

No se ha realizado ningún entrenamiento nuevo, búsqueda de poda RCO ni recuantización por parte de Ninnix96: el trabajo consiste en ensamblar la poda GSQ-RCO de ISTA con bancos de expertos de menor precisión tomados de Unsloth UD-IQ1_S. La tabla n-gram PLE de 28,8 GB se conserva exacta respecto a ISTA, en IQ4_NL (4,5 bits por peso incluyendo escalas), y está pensada para servirse desde disco con `--lazy-mode on`. El proyector multimodal no está incluido en el paquete, por lo que la capacidad de visión del modelo base no está disponible en esta distribución.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Generación de código: el modelo base está orientado a código (`Coder`) y la model card incluye ejemplos de funciones en Python.
- Razonamiento multi-turno: se puede desactivar el modo thinking mediante `--chat-template-kwargs '{"enable_thinking":false}'`.
- Soporte de plantilla de chat compatible con endpoints OpenAI mediante `llama-server`.
- Capacidad multimodal: el modelo base la conserva según ISTA, pero el proyector no está incluido en este paquete y la calidad de visión no fue evaluada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Multilingüismo: limitado a inglés según el campo `language`.

## Casos de uso

- Generación de código en local con recursos limitados: el shard de transformer de 21,99 GB permite ejecutar un modelo de 116,5 mil millones de parámetros totales en una máquina con CPU y SSD, usando mmap y paginación, como se validó en un AMD BC-250 con unos 14 GiB de RAM.
- Asistencia de programación en entornos sin GPU: con `llama-cli` y `-ngl 0`, el modelo puede responder a peticiones de código de un solo turno, útil en estaciones de trabajo sin acelerador dedicado.
- Servicio de endpoints compatibles con OpenAI en local: `llama-server` expone una API compatible que permite integrar el modelo en herramientas que ya consumen la API de OpenAI, con `--parallel 1` para un único usuario.
- Prototipado e investigación sobre compresión de MoE: el paquete sirve para estudiar el impacto de la poda de expertos y la cuantización mixta de 2 bits en la calidad de salida, comparándolo con el release de ISTA.
- Evaluación de despliegue con carga perezosa de tablas n-gram: útil para medir el coste de mantener la tabla PLE en disco frente a mantenerla en memoria.
- Pruebas de pipelines de CI/CD con modelos pequeños en disco: el paquete completo de 50,79 GB cabe en un disco SSD convencional y puede descargarse y montarse en un runner sin GPU para pruebas de integración de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no medida por el autor. El shard de transformer ocupa 21,99 GB y la tabla n-gram 28,80 GB, pero esta última puede permanecer en disco con `--lazy-mode on`. La VRAM real depende de las capas offloaded, la caché KV y los buffers de cómputo.
- GPU recomendadas: no disponible. El autor no midió residencia completa en GPU ni velocidad en GPU.
- ¿Cabe en GPU de consumo? No hay datos. El transformer de 21,99 GB podría caber en GPUs con 24 GB o más si se mantiene la tabla n-gram en disco, pero no está verificado.
- Despliegue validado: `llama.cpp` con soporte de `qwen4exp`, `Q2_0` y n-gram perezoso, en el commit `f3363593f457169cdfbdfe22ea399b1cc139ba18`.
- Configuración de referencia en CPU: `llama-cli -ngl 0 -c 8192 -t 8`, validada en un AMD BC-250 con unos 14 GiB de RAM del sistema, sin residencia completa del transformer.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ninnix96/Qwen3.8-Flash-Next-GSQ-RCO-Coder-22GB-gguf | 116,5 mil millones totales | no disponible | qwen-community-1.0 | GGUF (2 shards, 50,79 GB) | Híbrido comunitario sin benchmarks publicados |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | no disponible | no disponible | no disponible | GGUF (58,4 GB) | Poda GSQ-RCO original, 1,89 bits por parámetro efectivo sobre el transformer original |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-IQ1_S) | no disponible | no disponible | no disponible | GGUF | Release de cuantización de Unsloth usado como donante de expertos |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | safetensors (354 GB en BF16) | Modelo fundacional sin poda |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad para esta distribución concreta; el autor no realizó entrenamiento ni validación de rendimiento.
- La cuantización de 2 bits en los expertos enrutados puede degradar la calidad de forma notable frente al modelo base o al release de ISTA, especialmente en tareas de razonamiento y código complejo.
- El proyector multimodal no está incluido: la capacidad de visión del modelo base no está disponible y no fue evaluada.
- El idioma soportado es únicamente inglés según la model card.
- La licencia `qwen-community-1.0` impone condiciones específicas de uso; debe revisarse el archivo `LICENSE` antes de cualquier uso comercial.
- El paquete completo son dos shards que deben mantenerse en el mismo directorio; pasar solo el primero al runtime sin el segundo provoca un fallo de carga.
- El estimador automático de hardware de Hugging Face puede contabilizar los 50,79 GB completos como pesos residentes, lo que sobreestima la VRAM necesaria si se usa carga perezosa de la tabla n-gram.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 8 de noviembre de 2026; se trata de una distribución reciente y sin validación comunitaria.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ninnix96/Qwen3.8-Flash-Next-GSQ-RCO-Coder-22GB-gguf
- Modelo base podado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- README del modelo base ISTA: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF/blob/main/README.md
- Modelo donante (Unsloth UD-IQ1_S): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF/tree/084c631ac221016019d6e0a863afe92d90edd3b0/UD-IQ1_S
- Modelo fundacional: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Primer shard: https://huggingface.co/Ninnix96/Qwen3.8-Flash-Next-GSQ-RCO-Coder-22GB-gguf/resolve/main/Qwen3.8-Flash-Next-GSQ-RCO-Coder-22GB-IQ2_XXS-00001-of-00002.gguf
- Segundo shard: https://huggingface.co/Ninnix96/Qwen3.8-Flash-Next-GSQ-RCO-Coder-22GB-gguf/resolve/main/Qwen3.8-Flash-Next-GSQ-RCO-Coder-22GB-IQ2_XXS-00002-of-00002.gguf
