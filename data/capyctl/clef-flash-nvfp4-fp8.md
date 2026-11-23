# capyctl/clef-flash-NVFP4-FP8

## Resumen

Clef-Flash mixed NVFP4/FP8 — CapyCTL r1 es una conversión cuantizada del modelo Cloudflare/clef-flash, un derivado de Qwen3.5-9B orientado a la toma de decisiones. A diferencia de un modelo generativo convencional, este checkpoint devuelve probabilidades tipadas sobre respuestas candidatas en lugar de texto libre, lo que lo convierte en un componente especializado para sistemas que necesitan puntuar opciones de forma determinista. Lo publica el usuario independiente capyctl bajo licencia Apache-2.0, manteniendo la licencia del modelo fuente.

La relevancia de esta ficha radica en su enfoque de cuantización mixta: 31 familias de capas del transformer usan NVFP4 y 33 usan FP8, restaurando a FP8 aquellas familias que la simulación diagnóstica identificó como sensibles a NVFP4. El autor publica el resultado con transparencia metodológica, incluyendo que no alcanzó el objetivo interno del 99 % de acuerdo con BF16 en el conjunto de validación retenido (se queda en 98,224 %), y que lo publica porque supera al checkpoint NVFP4 publicado al que reemplaza.

El modelo tiene 9.409.813.744 parámetros totales y un paquete de 10.649.663.746 bytes. Está pensado para ejecutarse en una NVIDIA GB10 con 128 GB de memoria unificada mediante SGLang 0.5.22, y el autor advierte explícitamente que estas mediciones no cualifican su uso en GPUs de 16 GB ni en escenarios multimodales, concurrentes o de otro hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Mamba (hereda de Qwen3.5-9B; el modelo base se describe como "Qwen3.5-9B decision model") |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 16.384 tokens (pool de contexto/token configurado en SGLang para las pruebas) |
| Tipos de cuantizacion | Mixta NVFP4 (31 familias de capas) + FP8 (33 familias de capas); KV cache en FP8 E4M3; estado Mamba en BF16; cabezas `joint_head` y `lm_head.weight` en BF16 byte-idéntico |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (exportador propio del autor) |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef-flash es un derivado de Qwen/Qwen3.5-9B descrito como "decision model": no genera texto, sino que devuelve probabilidades tipadas sobre respuestas candidatas. La arquitectura subyacente es un transformer híbrido que combina atención con capas Mamba (el autor menciona "BF16 Mamba state" en la configuración de inferencia), con 64 familias de capas lineales cuantizadas en total (31 NVFP4 + 33 FP8).

La cuantización se realizó con ModelOpt 0.47.0 para calibración y redondeo, y el autor escribió un exportador propio porque el cargador FP8 aprobado de ModelOpt acepta escalas por tensor y no por canal. La calibración usó 18 solicitudes de decisión sintéticas generadas de forma independiente; el ajuste de escalas y la selección de layout usaron un conjunto diagnóstico separado de 41 solicitudes / 104 preguntas; y el conjunto retenido de 2.192 solicitudes / 5.294 preguntas quedó excluido de calibración y selección. Los experimentos de sensibilidad y selección de layout se hicieron con simulación QDQ en aritmética BF16, mientras que el acuerdo final y la latencia se midieron con el cargador stock sin modificar de SGLang. El checkpoint fuente está fijado en la revisión `17f0b0ad64efb65d273590632833508766b2aae6`.

## Capacidades

- Puntuación de decisiones: devuelve probabilidades tipadas sobre respuestas candidatas en lugar de texto generado, lo que permite integrarlo en pipelines de selección determinista.
- Salida de probabilidades por pregunta: el modelo está diseñado para evaluar cohortes finitas de preguntas con claves ordenadas, lo que facilita la comparación reproducible entre ejecuciones.
- Inferencia de contexto largo: soporta entradas de hasta 16.384 tokens en la configuración medida (p50 de 3.934,74 ms en el punto cercano a 16k).
- Compatibilidad con SGLang: el checkpoint está empaquetado para el cargador stock de SGLang 0.5.22 sin hooks personalizados.
- Cuantización mixta selectiva: preserva en FP8 las familias de capas sensibles a NVFP4, lo que reduce la degradación respecto a una cuantización NVFP4 uniforme.
- Cabezas en BF16: `joint_head.safetensors` y `lm_head.weight` se mantienen byte-idénticos en BF16 (SHA-256 de la joint head: `19cdcec8c81dc9212be320fff47462ab342fbc1278be4368fb3da71241cf5ba0`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información proporcionada.

## Casos de uso

- Enrutamiento y clasificación de decisiones en producción: el modelo devuelve probabilidades sobre opciones candidatas, lo que permite umbralizar decisiones y registrar la confianza de cada una sin depender de parseo de texto libre.
- Evaluación A/B de sistemas de decisión: al conservar el acuerdo con BF16 en el 98,224 % de las preguntas del conjunto retenido, sirve para comparar variantes de política sin reentrenar el modelo base.
- Selección de respuestas en pipelines de retrieval: se puede usar para puntuar respuestas candidatas generadas por otro modelo y elegir la de mayor probabilidad tipada.
- Moderación y filtrado por cohortes: la API de decisiones descrita en el repositorio del autor permite procesar lotes finitos de preguntas con claves ordenadas, adecuado para auditorías por lotes.
- Despliegue en hardware con memoria unificada: validado en una NVIDIA GB10 con 128 GB, encaja en entornos de estación de trabajo con GPU integrada de gran capacidad donde no se dispone de GPUs de datacenter dedicadas.
- Investigación en cuantización: el paquete incluye informes de build, auditoría de exportación y comparación retenida, por lo que sirve como referencia reproducible para estudiar el impacto de NVFP4 frente a FP8 en modelos de 9B.
- Inferencia de baja concurrencia con contexto largo: con un solo request en vuelo y ventana de 16k, es adecuado para tareas interactivas de análisis de documentos extensos donde la latencia p95 de ~4 s es aceptable.

## Benchmarks y rendimiento

Acuerdo con BF16 en el conjunto retenido (2.192 solicitudes / 5.294 preguntas, GB10, SGLang 0.5.22):

| Build | Mismo top / 5.294 | Acuerdo (Wilson 95 %) | KL medio | TV medio |
|---|---:|---|---:|---:|
| FP8 publicado | 5.208 | 98,376 % (97,998–98,683 %) | 0,00164187 | 0,0116312 |
| CapyCTL FP8 r1 (no publicado) | 5.218 | 98,564 % (98,207–98,851 %) | 0,00172332 | 0,0119396 |
| NVFP4 publicado | 5.172 | 97,696 % (97,255–98,066 %) | 0,00344258 | 0,0179021 |
| CapyCTL mixed r1 (este checkpoint) | 5.200 | 98,224 % (97,832–98,547 %) | 0,00242694 | 0,0150904 |

Latencia por solicitud completa (p50 / p95 en milisegundos, una pregunta, GB10):

| Contexto nominal 200 | Contexto nominal 2k | Contexto nominal 8k | Cerca de 16k |
|---|---|---|---|
| 49,35 / 50,75 | 277,21 / 286,74 | 1.794,37 / 1.827,83 | 3.934,74 / 3.985,80 |

Medición con tres rondas, cinco calentamientos y 100 solicitudes cronometradas por punto y ronda; medianas reales de tokens: 204 (200–210), 2.043 (1.938–2.142), 8.186 (7.841–8.496) y 16.188 (15.569–16.377). Las entradas son aproximadas, no idénticas en tokens. Configuración: SGLang 0.5.22, pool de 16.384 de contexto/token, un request en ejecución, KV en FP8 E4M3, estado Mamba en BF16 y fracción de memoria estática 0,50. El autor advierte que son resultados de motor directo en GB10, no un benchmark de despliegue de CapyCTL, y que el pico de memoria de GPU no se midió porque NVML no soporta la consulta en esa máquina.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra de VRAM dedicada; el modelo se midió en una NVIDIA GB10 con 128 GB de memoria unificada.
- GPU recomendadas: NVIDIA GB10 (única plataforma validada por el autor).
- Compatibilidad con consumer GPU: el autor indica explícitamente que las mediciones "no cualifican una GPU de 16 GB"; no se confirma su funcionamiento en RTX 4090, RTX 5090 ni otras GPUs de consumo.
- Opciones de despliegue: SGLang 0.5.22 con cargador stock (única opción validada). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50/p95 de 49,35/50,75 ms a ~200 tokens de contexto; 277,21/286,74 ms a ~2k; 1.794,37/1.827,83 ms a ~8k; 3.934,74/3.985,80 ms cerca de 16k. Medido con un solo request en ejecución, por lo que no hay datos de throughput concurrente.
- Memoria: el paquete pesa 10.649.663.746 bytes, cifra que el autor aclara que no equivale a memoria en tiempo de ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Acuerdo BF16 (top / 5.294) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| capyctl/clef-flash-NVFP4-FP8 (este) | 9,41 B | 16.384 | 98,224 % | Apache-2.0 | Público en HF |
| kurcontko/clef-flash-FP8-Dynamic | no disponible | no disponible | 98,376 % | Apache-2.0 (heredada) | Público en HF |
| alpha-x-ai/clef-flash-NVFP4 | no disponible | no disponible | 97,696 % | Apache-2.0 (heredada) | Público en HF |
| Cloudflare/clef-flash (BF16) | 9B (Qwen3.5-9B) | no disponible | referencia (100 %) | Apache-2.0 | Público en HF |

El checkpoint FP8 r1 de CapyCTL, con 98,564 % de acuerdo, no está publicado: el autor lo descartó porque en el mismo portátil su acuerdo cae a 98,357 % frente al 98,451 % del FP8 publicado, y su margen de memoria de dispositivo muestreado es de solo 23,1875 MiB.

## Limitaciones y advertencias

- Objetivo incumplido: el autor declara que no alcanzó el objetivo del 99 % de acuerdo con BF16 en el conjunto retenido; el resultado es 98,224 %. El acuerdo no equivale a precisión real sobre etiquetas de referencia ni a equivalencia estadística.
- Deriva superior al FP8 publicado: el KL medio (0,00242694) y el TV medio (0,0150904) son peores que los del FP8 publicado (0,00164187 y 0,0116312), aunque mejores que los del NVFP4 publicado.
- Cobertura de validación estrecha: las mediciones se limitan a cohortes finitas de solo texto y no cualifican imágenes, vídeo, otro hardware, concurrencia ni capacidades más amplias.
- Sin datos de sesgo ni de alucinación: al no generar texto libre sino probabilidades tipadas, el riesgo de alucinación textual no aplica de la misma forma, pero no se documentan sesgos conocidos.
- Idiomas no documentados: la model card no declara idiomas soportados, por lo que no se puede garantizar cobertura multilingüe.
- Hardware no validado: el autor advierte que las pruebas en GB10 no cualifican GPUs de 16 GB ni otras plataformas; no hay datos de VRAM pico porque NVML no lo permite en esa máquina.
- Dependencia de SGLang 0.5.22: el checkpoint está empaquetado para el cargador stock de esa versión; no se documenta compatibilidad con otros motores de inferencia.
- Licencia: Apache-2.0 heredada de Qwen/Qwen3.5-9B; la cuantización no sustituye los términos del modelo fuente y el checkpoint conserva el `LICENSE` original.
- Reproducibilidad parcial: los textos de las solicitudes no se redistribuyen, por lo que la comparación exacta requiere acceso a los conjuntos originales del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/capyctl/clef-flash-NVFP4-FP8
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Revisión del modelo base fijada por el autor: https://huggingface.co/Cloudflare/clef-flash/blob/17f0b0ad64efb65d273590632833508766b2aae6/README.md
- Modelo fuente de Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- FP8 publicado: https://huggingface.co/kurcontko/clef-flash-FP8-Dynamic (revisión `7b43c2d799e7b5e9fef96b6137840088d75af0d6`)
- NVFP4 publicado: https://huggingface.co/alpha-x-ai/clef-flash-NVFP4 (revisión `e676d8e6e14f5ee74830d33fa1fad643d8f53acf`)
- Repositorio de recetas del autor (referenciado como `../README.md` en la model card): no disponible como URL absoluta en la información proporcionada
- Informe de build: `comparisons/clef-flash-builds-gb10/results/capyctl-build-report.txt` (ruta relativa en el repositorio del autor)
- Auditoría de exportación: `comparisons/clef-flash-builds-gb10/results/clef-flash-capyctl-mixed-r1-audit.json` (ruta relativa)
- Comparación retenida: `comparisons/clef-flash-builds-gb10/results/clef-flash-capyctl-mixed-r1-vs-bf16-heldout.json` (ruta relativa)
