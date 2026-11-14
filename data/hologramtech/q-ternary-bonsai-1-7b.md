# HOLOGRAMTECH/q-ternary-bonsai-1.7b

## Resumen

q-ternary-bonsai-1.7b es una redistribución del modelo prism-ml/Ternary-Bonsai-1.7B (a su vez un Qwen3-1.7B con pesos ternarios {-1, 0, +1} y una escala por cada 128 pesos) empaquetada en un único fichero de formato propietario `.holo` de 424.013.749 bytes. El autor, HOLOGRAMTECH, no re-cuantiza nada: los códigos ternarios entrenados pasan intactos y las escalas de grupo f16 se ensanchan a f32. El objetivo es que el modelo se ejecute en un navegador mediante WebGPU usando el motor Hologram Q, con un formato direccionable por contenido (cada bloque de tensores se nombra por el BLAKE3 de sus bytes almacenados).

El modelo es explícitamente experimental y requiere un motor Q parcheado: el motor estándar no dispone de kernel ternario por grupo de 128 ni aplica el escalado posicional YaRN que declara el GGUF de origen, por lo que no cargará este fichero correctamente. La arquitectura subyacente es la de Qwen3-1.7B (transformer denso) con pesos ternarios de 1.58 bits efectivos y escalado rotatorio YaRN con factor 4.0 sobre una longitud original de 8192.

Su relevancia es acotada pero concreta: demuestra una vía para servir un modelo de 1.7B en el navegador con un solo fichero de 0.4 GB, inferencia a 85-114 tokens por segundo y 1,2 GB de memoria GPU en una iGPU Radeon 8050S, a costa de un formato no estándar y de un motor modificado. La licencia es Apache-2.0, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) con pesos ternarios {-1, 0, +1} y una escala f32 por cada 128 pesos |
| Parametros totales | 1.7B (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens originales; escalado YaRN con factor 4.0 declarado en el GGUF fuente (contexto extendido efectivo no especificado) |
| Tipos de cuantizacion | Ternaria 1.58-bit (PQ2_0, grupo 128) empaquetada en formato `.holo` con planos de signo y no-cero de N*K/8 bytes cada uno mas escalas f32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.holo` (fichero único: cabecera, tokenizer embebido del GGUF original y bloques de tensores comprimidos con gzip, direccionados por BLAKE3). Origen: GGUF `Ternary-Bonsai-1.7B-PQ2_0.gguf` |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B, un transformer denso, sobre el que Prism ML aplicó una cuantización ternaria entrenada: cada peso toma valores en {-1, 0, +1} y se multiplica por una escala compartida por grupos de 128 pesos. En el formato `.holo`, cada bloque de pesos se almacena como un plano de signos (N*K/8 bytes), un plano de no-cero (N*K/8 bytes) y las escalas f32 por grupo; un peso vale `scale * (+1 si el bit de signo está activo, sino -1)` cuando su bit de no-cero está activo, y 0 en caso contrario. La capa de salida está atada a la de embedding, por lo que ambas entradas del directorio apuntan a los mismos bytes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica destacable es el propio contenedor: cabecera manifiesto con `mode: "q1"`, `bits: 1`, `tern: true` y `yarn: {"factor": 4.0, "orig": 8192}`, tokenizer embebido y bloques gzip direccionables por contenido. El escalado YaRN replica el de transformers y llama.cpp: los pares rotatorios por debajo de 17 conservan su frecuencia, los superiores a 34 corren a un cuarto, con rampa lineal entre ambos, y el vector rotado se escala por `0.1 * ln(4) + 1`.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy verificada contra llama.cpp en cuatro de cinco salidas byte-idénticas.
- Razonamiento y conocimiento general heredados del modelo base Qwen3-1.7B (no se detallan capacidades específicas en la información disponible).
- Ejecución en navegador sobre WebGPU con el motor Hologram Q parcheado.
- Carga desde un único fichero con tokenizer embebido, sin dependencias externas de tokenización.
- Caché de estado del system prompt fijo (3,3 s la primera vez, 0,31-0,45 s hasta el primer token en adelante).
- Soporte de tool calling, function calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Demo interactiva en navegador sin backend: el modelo se sirve como fichero estático de 0,4 GB y se ejecuta en WebGPU, lo que permite publicar una demo de chat sin infraestructura de GPU en servidor, con 85-114 tokens/s en una iGPU Radeon 8050S.
- Prototipado de asistentes locales con caché de system prompt: al mantener fijo el prompt de sistema, el estado se computa una vez (3,3 s) y las respuestas posteriores arrancan en 0,31-0,45 s hasta el primer token, adecuado para sesiones de chat multi-turno en cliente.
- Validación de pipelines de cuantización ternaria: al conservar los códigos entrenados sin re-cuantizar y ensanchar solo las escalas a f32, sirve para comparar la fidelidad de un runtime ternario frente a llama.cpp con las mismas prompts.
- Distribución de modelos por contenido: el direccionamiento BLAKE3 por bloque y el manifiesto con raíz `sha256:8932967d...` permiten verificar integridad y cachear bloques de forma incremental en CDN o almacenamiento local.
- Educación y experimentación con formatos de pesos: el fichero documenta explícitamente la disposición de planos de signo, no-cero y escalas, útil para quienes implementan kernels ternarios.
- Pruebas de despliegue en hardware de gama integrada: con 809 MB de VRAM a 1.400 tokens de contexto y 1.176 MB a 3.000, permite evaluar latencia y memoria en equipos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son de inferencia, medidas en un portátil con GPU integrada Radeon 8050S, Chromium y WebGPU, fichero servido localmente, decodificación greedy y prompt de 436 tokens:

| Metrica | Valor medido |
|---|---|
| Throughput de decodificacion | 85 a 114 tokens/s |
| Tiempo hasta el primer token (estado de system prompt cacheado) | 0,31 a 0,45 s |
| Computo inicial del estado del system prompt | ~3,3 s |
| Carga de pagina a motor listo (fichero en disco) | 4,1 a 5,6 s |
| Memoria GPU a contexto de 3.000 tokens | 1.176 MB |
| Memoria GPU a contexto de 1.400 tokens | 809 MB |
| Fidelidad frente a llama.cpp WebGPU | 4 de 5 salidas byte-identicas; la quinta coincide en 1.350 de 1.867 caracteres |

No medido: telefonos, Safari, Firefox ni tiempo de descarga desde el host.

## Requisitos de hardware

- VRAM estimada: 809 MB con contexto de 1.400 tokens y 1.176 MB con 3.000 tokens, según medición del autor en una iGPU.
- GPU recomendadas: no se especifican modelos discretos; la única medición publicada usa una Radeon 8050S integrada.
- Cabe en GPU de consumo: sí, según la medición en iGPU; no hay datos para RTX 4090, A100 o H100.
- Opciones de despliegue: motor Hologram Q parcheado sobre WebGPU en Chromium. El motor estándar no funciona porque carece de kernel ternario por grupo de 128 y de escalado YaRN. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI para el formato `.holo`; llama.cpp solo se usa como referencia de comparación con el GGUF de origen.
- Latencia y throughput: 85-114 tokens/s, 0,31-0,45 s hasta el primer token con caché y 4,1-5,6 s de arranque del motor con el fichero en disco, en el hardware indicado.
- Sin datos para telefonos, Safari ni Firefox.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| q-ternary-bonsai-1.7b (este) | 1.7B | 8192 originales, YaRN factor 4.0 | Ternaria 1.58-bit, grupo 128 | `.holo` | Apache-2.0 | Requiere motor Q parcheado; 85-114 tok/s en iGPU Radeon 8050S |
| prism-ml/Ternary-Bonsai-1.7B-gguf | 1.7B | 8192 originales, YaRN factor 4.0 | Ternaria 1.58-bit, grupo 128 | GGUF | Apache-2.0 (según el modelo fuente) | Modelo de origen; ejecutable en llama.cpp WebGPU, usado como referencia de fidelidad |
| Qwen3-1.7B (modelo denso original) | 1.7B | no disponible en la informacion proporcionada | f16/BF16 y cuantizaciones estándar | safetensors, GGUF | no disponible en la informacion proporcionada | Base arquitectónica; sin pesos ternarios |

No se dispone de datos de rendimiento comparativo (benchmarks de calidad) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Experimental: requiere un motor Q parcheado con kernel ternario por grupo de 128 y aplicación de YaRN; el motor estándar no ejecutará el fichero correctamente.
- Formato propietario `.holo` sin soporte documentado en runtimes estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita su uso en producción fuera del ecosistema Hologram.
- Fidelidad no total: una de cinco salidas difiere de llama.cpp (coincidencia parcial de 1.350 de 1.867 caracteres en ese caso).
- Sin mediciones en telefonos, Safari ni Firefox; el comportamiento en esos entornos es desconocido.
- Sin datos publicados de benchmarks de calidad, sesgos, tasas de alucinación ni cobertura idiomática; no se puede evaluar su calidad frente a alternativas.
- El contexto efectivo tras aplicar YaRN con factor 4.0 no se especifica; solo se declara el valor original de 8192.
- La licencia Apache-2.0 se hereda del modelo fuente y se copian `LICENSE` y `NOTICE.txt` sin cambios; conviene revisar dichos ficheros antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y creado y actualizado el mismo día: madurez y mantenimiento no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HOLOGRAMTECH/q-ternary-bonsai-1.7b
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-gguf
- Modelo base (referencia): https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B
- Paper, blog, repositorio del motor Q o demos: no disponible en la información proporcionada.
