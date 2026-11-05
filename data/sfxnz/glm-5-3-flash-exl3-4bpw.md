# sfxnz/GLM-5.3-Flash-EXL3-4bpw

## Resumen

GLM-5.3-Flash-EXL3-4bpw es una cuantización de 4 bits del modelo multimodal GLM-5.3-Flash-BF16 desarrollado por Z.ai (zai-org). Se trata de un transformer con arquitectura MoE (mixture of experts) de aproximadamente 87.800 millones de parámetros totales, orientado a tareas de imagen-texto-a-texto, conversación y razonamiento. La cuantización la firma el usuario sfxnz y emplea el formato EXL3 de exllamav3 v1.6.6, codificando únicamente los expertos enrutados en 4 bits y manteniendo el resto de tensores en BF16/F32 originales.

El problema que resuelve esta ficha es práctico: el modelo original pesa 598,5 GiB en BF16, lo que lo hace inaccesible para la mayoría de infraestructuras. Este pack reduce el repositorio a 175,7 GB manteniendo intactos 1.618 tensores no-expertos (embedding, LM head, atención, capas densas 0-2, expertos compartidos, routers, normas, torre de visión y la capa MTP). Está diseñado específicamente para el motor TensorFold 1.2.2 en su familia CUDA nativa GLM.

Su relevancia actual radica en que permite servir un MoE de casi 88.000 millones de parámetros con visión, modo thinking y decodificación especulativa MTP en dos DGX Spark conectadas por cable directo, con un contexto que alcanza 1.048.576 tokens y un rendimiento medido de 33,8 a 58,8 tokens por segundo agregados según el número de flujos concurrentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de visión y capa MTP (multi-token prediction) |
| Parámetros totales | 87.811.119.966 |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (por petición, según la receta de servicio) |
| Tipos de cuantización | EXL3 4.00 bpw sobre codebook `mcg` para expertos enrutados; BF16/F32 para el resto; opción de empaquetar lineales densos y head a 8 bits en carga |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (120 shards, 175.642.102.880 bytes), con tensores EXL3 en `trellis` I16, `suh`/`svh` F16 y marcador `mcg` I32 |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 43 capas (3 a 44) que contienen 288 expertos enrutados cada una, cada experto con proyecciones `gate_proj`, `up_proj` y `down_proj`. Esto da un total de 37.152 proyecciones EXL3 en el pack. Adicionalmente existe una capa MTP (multi-token prediction) en la posición 45 con la misma estructura de expertos, y una torre de visión que se mantiene en BF16 sin cuantizar. Las capas 0 a 2 son densas, y hay expertos compartidos, routers y normas que también permanecen en precisión original.

La cuantización se realizó con exllamav3 v1.6.6 y un ensamblador propio del autor, partiendo exclusivamente de fuentes MIT. El `config.json` es el original con un bloque `quantization_config` añadido que declara `quant_method: exl3`, `bits: 4`, `codebook: mcg` y `head_bits: 16`. Es importante notar que TensorFold 1.2.2 exige que `bits` sea el entero JSON 4, rechazando el `4.0` que escribe exllamav3 estándar; esta comprobación está documentada en el código fuente del motor. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1.048.576 tokens por petición.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`) gracias a la torre de visión preservada en BF16.
- Modo thinking (razonamiento extendido) activable en el servidor de inferencia.
- Decodificación especulativa mediante la capa MTP, que acelera la generación.
- Razonamiento multi-paso y agentes, heredado del modelo base GLM-5.3-Flash.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos con imágenes: el modelo puede procesar hasta 1.048.576 tokens en una sola petición, lo que permite introducir manuales técnicos, informes o expedientes completos junto con sus figuras y diagramas, y obtener respuestas que cruzan información visual y textual.
- Asistencia conversacional con memoria extensa: gracias al pool de KV compartido de 2.056 páginas (aproximadamente 1,05 millones de tokens) por rank, se pueden mantener sesiones de chat muy prolongadas sin truncar el historial.
- Procesamiento por lotes en investigación: con 8 flujos concurrentes y 58,8 tokens/s agregados en dos DGX Spark, es viable ejecutar evaluaciones masivas de prompts sobre un corpus propio.
- Generación aumentada por recuperación (RAG) sobre bases documentales: la ventana de 1M tokens permite insertar muchos fragmentos recuperados sin recurrir a resúmenes intermedios, reduciendo la pérdida de contexto.
- Prototipado de agentes con razonamiento: el modo thinking y la capa MTP permiten construir pipelines de razonamiento multi-paso con generación especulativa, útil para tareas de planificación y descomposición.
- Inferencia en hardware de gama alta de escritorio: al necesitar solo dos DGX Spark (86,41 GiB de pesos por rank en TP=2 con densos en BF16, o 82,87 GiB con densos y head a 8 bits), permite desplegar un MoE de 88B en un entorno de laboratorio sin clúster de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí se incluyen métricas de calidad de cuantización y de throughput:

| Métrica | Este pack | TR3 4bpw (referencia) |
|---|---|---|
| KLD (nats, panel de 25 ventanas de 2.048 tokens, 51.175 posiciones) | 0,029440 | 0,025558 |
| Acuerdo top-1 | 0,9488 | 0,9529 |
| Diferencia pareada por ventana frente a TR3 | +0,00388 nats (stdev 0,0081, ~2,4 errores estándar) | referencia |

| Flujos concurrentes | Tokens/s agregados, mediana (rango) |
|---|---|
| 1 | 33,8 (32,4 a 36,2) |
| 4 | 45,5 (44,6 a 48,8) |
| 8 | 58,8 (51,8 a 61,0) |

Medición realizada con 5 ejecuciones por celda, 512 tokens de salida, thinking desactivado. Se encontró una aguja (needle) al 37% de profundidad en un prompt de 1.045.624 tokens.

## Requisitos de hardware

- Pesos por rank en TP=2: 86,41 GiB con lineales densos en BF16; 82,87 GiB con densos y head empaquetados a 8 bits en carga.
- Hardware de referencia: dos DGX Spark unidas por su cable directo, sirviendo una API estilo OpenAI desde la primera.
- VRAM estimada en configuraciones de una sola GPU: no disponible; el pack está pensado para TP=2 sobre DGX Spark.
- GPU consumer: no disponible confirmación; por el tamaño por rank (más de 82 GiB) no cabe en RTX 4090 (24 GB) ni en configuraciones de una sola tarjeta convencional.
- Opciones de despliegue: TensorFold 1.2.2 con su familia CUDA nativa GLM es el único motor probado con este layout. Otros loaders (vLLM, llama.cpp, Ollama, TGI) no han sido probados y no debe asumirse que un loader de EXL3 estándar lea este pack.
- Pool KV: 2.056 páginas BF16 compartidas por rank, aproximadamente 1,05 millones de tokens.
- Throughput: 33,8 tok/s con 1 flujo, 45,5 tok/s con 4 flujos y 58,8 tok/s con 8 flujos (mediana, 512 tokens, thinking off).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-4bpw (este) | 87,8B | 1.048.576 | EXL3 4 bpw + BF16/F32 | MIT | HuggingFace, motor TensorFold |
| GLM-5.3-Flash-BF16 (base) | 87,8B | no disponible | BF16 | MIT | HuggingFace, 598,5 GiB |
| GLM-5.3-Flash-tr3-4bpw | no disponible | no disponible | 4 bpw | no disponible | HuggingFace |

Frente al base BF16, este pack reduce el tamaño de 598,5 GiB a 175,7 GB y mantiene 1.618 tensores byte a byte idénticos. Frente a TR3 4bpw, el KLD es ligeramente superior (0,029440 frente a 0,025558 nats) y el acuerdo top-1 algo menor (0,9488 frente a 0,9529), aunque el panel de evaluación es el dominio de calibración de TR3, lo que favorece a ese pack en la comparación.

## Limitaciones y advertencias

- Solo TensorFold 1.2.2 ha cargado este layout; otros motores no están probados y la salida de exllamav3 estándar difiere de este pack, por lo que no debe asumirse compatibilidad.
- La evaluación de calidad KLD se realizó sobre el corpus de calibración de TR3, lo que sesga la comparación a favor de ese pack; los resultados deben interpretarse con cautela.
- El rendimiento medido (33,8 a 58,8 tok/s) corresponde a dos DGX Spark en TP=2; no hay datos para otras configuraciones.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base.
- La licencia es MIT según la model card, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash-BF16 antes de producción.
- El pack omite los tensores `.weight` de los expertos porque TensorFold no los lee en la ruta EXL3; otros motores que sí los esperen fallarán.
- Requiere más de 82 GiB por rank en TP=2, lo que excluye GPUs consumer individuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sfxnz/GLM-5.3-Flash-EXL3-4bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Repositorio de la receta: https://github.com/sfxnz/GLM-5.3-Flash-EXL3-4bpw-TensorFold-2x-DGX-Spark
- Motor TensorFold: https://github.com/ashhart/TensorFold
- Pack de referencia TR3: https://huggingface.co/brandonmusic/GLM-5.3-Flash-tr3-4bpw
- Suite de fidelidad de cuantización: https://huggingface.co/malaiwah/quant-fidelity-suite
- Modelo de referencia BF16 para KLD: https://huggingface.co/malaiwah/glm53-flash-fidelity-root-v1
