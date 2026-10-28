# lapalaba/Qwen3.8-27B-DFlash2-ru

## Resumen

`lapalaba/Qwen3.8-27B-DFlash2-ru` es un modelo borrador (draft model) para decodificación especulativa con el algoritmo DFlash2, diseñado para emparejarse con el verificador `Qwen3.8-27B-FP8`. No es un modelo de chat autónomo: el verificador genera la salida final y este checkpoint se limita a proponer bloques de tokens que el verificador valida. Lo publica el usuario `lapalaba` partiendo de `incoai/Qwen3.8-27B-DFlash2`, sobre el que se ha realizado un entrenamiento de continuación orientado al dominio ruso.

El checkpoint contiene 1.924.404.480 parámetros (unos 1,92 B) en safetensors, con un repositorio de 3,8 GB, y se sirve exclusivamente a través de SGLang con soporte de DFlash2 y un tamaño de bloque de 8 (un token ancla del verificador más siete tokens propuestos). Su interés práctico está en reducir la latencia por token en despliegues de `Qwen3.8-27B` cuando el tráfico es mayoritariamente en ruso, aunque los datos publicados muestran una tasa de aceptación inferior a la del borrador original.

La relevancia es acotada pero específica: no existen muchos borradores DFlash2 afinados para dominio y menos para ruso. El autor documenta 271.148 ejemplos de entrenamiento con trazas de agente, diálogos de producción y ejemplos de RAG, y publica mediciones de serving en una H200 con concurrencias de 8, 16, 32 y 64.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3, modelo borrador para decodificación especulativa DFlash2 (no es un modelo de chat independiente) |
| Parámetros totales | 1.924.404.480 (~1,92 B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 24.576 tokens (captura de entrenamiento y `--context-length` del despliegue medido); contexto nativo del verificador no disponible |
| Tipos de cuantización | No disponible en la model card; pesos publicados en safetensors (repo de 3,8 GB). El verificador asociado se sirve en FP8 |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | `other` (sin texto de licencia detallado en la información disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un borrador de decodificación especulativa construido sobre la familia Qwen3 e inicializado desde `incoai/Qwen3.8-27B-DFlash2`. El mecanismo DFlash2 propone bloques de tokens que el verificador `Qwen3.8-27B-FP8` comprueba en paralelo; el autor configura `--speculative-dflash-block-size 8`, es decir, un ancla del verificador más siete tokens del borrador. El checkpoint seleccionado es el paso global 542.298, descrito como el mejor punto de evaluación de entrenamiento, con accuracy 0,66958 y loss 2,03607.

El entrenamiento de continuación utilizó un pool final de 271.148 ejemplos procedentes de interacciones de agente en dominio ruso, trazas de producción y ejemplos de RAG (mezcla de ruso nativo y material traducido desde ruso/inglés). La captura se hizo con contexto de 24.576 tokens y con el modo *thinking* desactivado. La distribución por longitud renderizada bajo la plantilla del modelo es: 150.764 ejemplos (55,60 %) de hasta 2.047 tokens, 91.065 (33,58 %) entre 2.048 y 4.095, 15.547 (5,73 %) entre 4.096 y 5.188, 11.722 (4,32 %) entre 5.189 y 8.191 y 2.050 (0,76 %) por encima de 8.192. Los grupos de test y de sonda de continuación se excluyeron antes de la captura. No se documentan detalles de RLHF/DPO para este checkpoint.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: propone bloques de tokens para que el verificador `Qwen3.8-27B-FP8` los valide, reduciendo el coste por token aceptado.
- Afinado a dominio ruso: entrenado sobre trazas de agente, diálogos de producción y ejemplos de RAG en ruso, lo que orienta la distribución de propuestas hacia ese tipo de prompts.
- Soporte de conversaciones multi-turno: el pool de entrenamiento incluye diálogos de producción, con longitudes renderizadas de hasta más de 8.000 tokens en una fracción pequeña de los ejemplos.
- Soporte de flujos con tool calling y agentes: parte del corpus son trazas de agente, aunque las capacidades funcionales reales (llamadas a herramientas, razonamiento multi-paso) las aporta el verificador, no el borrador.
- Integración con SGLang: el checkpoint está pensado para el backend `--speculative-algorithm DFLASH` con FlashAttention 3 y FlashInfer para prefill y decode de atención lineal.
- No soporta generación autónoma: no produce respuestas finales, ni visión, ni audio, ni modo *thinking* propio.

## Casos de uso

- Servicio de chat en ruso de baja latencia: desplegar el borrador junto al verificador FP8 en SGLang para reducir el TPOT en conversaciones multi-turno en ruso; en las mediciones del autor el TPOT p50 a concurrencia 8 es de 14,74 ms.
- RAG sobre documentación en ruso: el corpus de entrenamiento incluye ejemplos de retrieval-augmented generation, por lo que las propuestas del borrador se alinean con prompts largos con contexto recuperado.
- Agentes con llamadas a herramientas en dominio ruso: al haberse entrenado con trazas de agente, el borrador cubre los patrones de formato habituales en ese tipo de interacción, siempre con el verificador emitiendo la respuesta final.
- Reducción de coste en serving multiusuario: con concurrencia 32 el autor mide 3,21 RPS y 1.114,16 tokens/s de salida, lo que permite estimar el ahorro frente a servir el verificador sin especulación.
- Evaluación comparativa de decodificación especulativa: sirve como punto de referencia para medir la tasa de aceptación (tau) de borradores afinados frente al borrador original en tareas de matemáticas tipo GSM8K.
- Generación de código y matemáticas asistida en ruso: el autor reporta pruebas sobre GSM8K y MATH-500 con prompts deterministas, escenario representativo de asistentes técnicos que combinan razonamiento numérico con instrucciones en ruso.
- Experimentación en investigación: al ser un checkpoint abierto de un borrador DFlash2 para dominio, permite estudiar cómo el ajuste de dominio afecta a la tasa de aceptación y al throughput.

## Benchmarks y rendimiento

Evaluación del autor con el verificador `Qwen3.8-27B-FP8` en una NVIDIA H200, SGLang, FlashAttention 3, bloque DFlash2 de 8, contexto 24.576, tope de salida 4.096 tokens, `temperature=0`, tres repeticiones por celda. La concurrencia 64 corresponde a una ejecución práctica sin límite con cliente de 64 workers. `tau` es el número de tokens aceptados por paso del verificador (mayor es mejor).

GSM8K:

| Método | Concurrencia | RPS | Tokens/s salida | TTFT p50 (ms) | TPOT p50 (ms) | E2E p50 (ms) | E2E p95 (ms) | Tau | Fallos |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| z-lab DFlash2 | 8 | 1,70 ± 0,01 | 601,90 ± 3,05 | 230,82 | 12,13 | 3.971,48 | 7.894,25 | 6,10 | 0/3072 |
| Checkpoint de dominio | 8 | 1,42 ± 0,02 | 496,92 ± 6,97 | 229,08 | 14,74 | 4.682,51 | 9.376,75 | 4,93 | 0/3072 |
| z-lab DFlash2 | 16 | 3,02 ± 0,05 | 1.054,38 ± 14,45 | 228,71 | 13,73 | 4.403,90 | 8.864,02 | 6,11 | 0/3072 |
| Checkpoint de dominio | 16 | 2,57 ± 0,06 | 895,20 ± 20,09 | 228,44 | 16,35 | 5.181,62 | 10.208,81 | 4,95 | 0/3072 |
| z-lab DFlash2 | 32 | 3,96 ± 0,03 | 1.380,33 ± 18,36 | 3.722,92 | 11,30 | 7.274,13 | 10.928,80 | 6,12 | 0/3072 |
| Checkpoint de dominio | 32 | 3,21 ± 0,19 | 1.114,16 ± 61,96 | 4.421,53 | 13,94 | 8.762,23 | 13.122,55 | 4,95 | 0/3072 |
| z-lab DFlash2 | 64 (sin límite) | 3,96 ± 0,14 | 1.373,33 ± 36,57 | 11.508,78 | 11,41 | 15.087,30 | 19.004,23 | 6,13 | 0/3072 |
| Checkpoint de dominio | 64 (sin límite) | 3,23 ± 0,16 | 1.130,09 ± 52,32 | 13.977,72 | 14,06 | 18.377,03 | 23.072,35 | 4,94 | 0/3072 |

MATH-500: la tabla correspondiente aparece truncada en la información disponible, por lo que no se reproducen sus valores.

Datos adicionales: el autor reporta accuracy de evaluación de entrenamiento 0,66958 y loss 2,03607 en el paso 542.298. Las ejecuciones de referencia y de dominio se midieron en fechas distintas, por lo que las diferencias pequeñas deben interpretarse junto a la variación entre repeticiones. Estas métricas miden comportamiento de serving y de especulación, no la exactitud de las respuestas.

## Requisitos de hardware

- VRAM del borrador: unos 3,85 GB en bfloat16 (1,92 B de parámetros); el repositorio completo ocupa 3,8 GB.
- VRAM del sistema completo: el borrador debe convivir con el verificador `Qwen3.8-27B-FP8`, que añade del orden de 27 GB de pesos en FP8, más caché KV para el contexto configurado.
- Configuración validada por el autor: una NVIDIA H200, `--tp-size 1`, `--mem-fraction-static 0.80`, `--max-running-requests 32`, `--context-length 24576`, `--dtype bfloat16`, `--attention-backend fa3`, `--linear-attn-prefill-backend flashinfer`, `--linear-attn-decode-backend flashinfer`, `--mamba-radix-cache-strategy extra_buffer`.
- GPU recomendadas: H200 (medida por el autor). Para el conjunto borrador + verificador FP8 de 27 B se requiere una GPU de 80 GB o varias; no hay datos publicados de despliegue en A100, H100 ni RTX 4090.
- GPU de consumo: el borrador por sí solo cabría en tarjetas de 8-12 GB en bfloat16, pero es inútil sin el verificador, que no cabe en GPU de consumo en FP8 sin cuantización adicional y reparto entre varias tarjetas. No disponible confirmación de funcionamiento en consumer.
- Opciones de despliegue: SGLang con soporte de Qwen3.8 y DFlash2, usando `--speculative-algorithm DFLASH` y `--speculative-draft-model-path`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos (GSM8K, concurrencia 8): TTFT p50 229,08 ms, TPOT p50 14,74 ms, E2E p50 4.682,51 ms, 1,42 RPS y 496,92 tokens/s de salida. A concurrencia 32: 3,21 RPS y 1.114,16 tokens/s, con TTFT p50 de 4.421,53 ms.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Contexto | Tau (GSM8K, c=8) | Throughput (c=8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `lapalaba/Qwen3.8-27B-DFlash2-ru` | Borrador DFlash2 afinado a dominio ruso | 1,92 B | 24.576 (entrenamiento/serving) | 4,93 | 496,92 tok/s | `other` | Público, 0 descargas |
| `z-lab/Qwen3.8-27B-DFlash2` | Borrador DFlash2 de referencia | No disponible en la información | No disponible en la información | 6,10 | 601,90 tok/s | No disponible en la información | Público |
| `incoai/Qwen3.8-27B-DFlash2` | Borrador DFlash2 usado como inicialización | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | Público |

No se comparan modelos de chat de tamaño similar porque este checkpoint no es un modelo generativo autónomo: su función es únicamente proponer tokens para un verificador concreto.

## Limitaciones y advertencias

- No es un modelo independiente: no genera respuestas finales ni puede usarse como chat model; requiere el verificador `Qwen3.8-27B-FP8` y una build de SGLang con soporte de DFlash2.
- Rendimiento inferior al borrador de referencia: la tasa de aceptación cae de 6,10-6,13 (z-lab) a 4,93-4,95 en GSM8K, con un throughput entre un 16 % y un 20 % menor en las celdas medidas; el afinado de dominio no compensa en estos datos.
- Cobertura lingüística restringida a ruso e inglés; el rendimiento fuera de esos idiomas o de dominios de agente/RAG en ruso no está documentado.
- Modo *thinking* desactivado durante el entrenamiento: no hay garantías de alineación con flujos que activen razonamiento extendido en el verificador.
- Licencia `other` sin texto detallado: no se puede confirmar la permisividad para uso comercial; además, el modelo base `Qwen/Qwen3.8-27B` tiene su propia licencia, que debe verificarse por separado.
- Trazabilidad limitada: 0 descargas y 0 likes; no hay validación independiente de los resultados publicados.
- Inconsistencia en la documentación: el comando de inicio rápido apunta a `VirVen/Qwen3.8-27B-DFlash2-domain` como ruta del borrador, no a este repositorio, lo que puede provocar despliegues con el checkpoint equivocado.
- Comparaciones temporales: las ejecuciones base y de dominio se midieron en fechas distintas, de modo que las diferencias pequeñas de latencia y throughput no son concluyentes.
- Riesgo de alucinación y sesgos: no evaluables directamente en un borrador; heredados del verificador y del corpus de entrenamiento, que mezcla material traducido y trazas de producción sin auditoría publicada.
- Requiere validación propia de la configuración de memoria y concurrencia: el autor recomienda ajustar GPU, memoria y concurrencia solo después de validar el nuevo despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lapalaba/Qwen3.8-27B-DFlash2-ru
- Checkpoint de inicialización: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Borrador de referencia citado en la model card: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo base / verificador: https://huggingface.co/Qwen/Qwen3.8-27B
- Plantilla de prompts citada (`z-lab/dflash`): https://huggingface.co/z-lab/dflash
