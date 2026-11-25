# netprojects/Qwen3.8-27B-pi-GGUF

## Resumen

Qwen3.8-27B-pi-GGUF es una distribución en formato GGUF del modelo Qwen3.8-27B de Alibaba Qwen, adaptado mediante un LoRA entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) por harness-hub para funcionar como el motor del agente de programación pi. La adaptación está orientada a tareas de ingeniería de software y uso de terminal, y este repositorio de netprojects empaqueta el modelo fusionado (sin necesidad de cargar el adaptador por separado) en cuantizaciones listas para llama.cpp, conservando la capa de predicción multi-token (MTP) del modelo original.

El modelo tiene 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), pipeline image-text-to-text, y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 139,3 GB e incluye múltiples niveles de cuantización (desde Q8_0 hasta IQ2_M) más un proyector de visión mmproj en F16. La relevancia actual reside en que combina un modelo de 27B con capacidades de agente autónomo y decodificación especulativa nativa vía MTP, lo que permite ejecutarlo en hardware de consumo con aceleraciones significativas de velocidad.

La adaptación reportada por el autor del LoRA mejora Terminal-Bench 2.1 del 39,5% al 55,8% y SWE-bench Pro (hard 51) del 29,4% al 62,7% respecto al modelo base, con una reducción del 55-64% en llamadas a herramientas por tarea, siempre con el modo de razonamiento (thinking) desactivado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con capa MTP (multi-token prediction); adaptación LoRA fusionada |
| Parámetros totales | 27.320.697.856 (~27,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (valor usado en el ejemplo de llama-server con `-c 65536`; el máximo nativo del modelo base no se especifica) |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_XXS, IQ2_M; proyector de visión mmproj en F16; builds MLX de 6 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), MLX (builds separadas) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B (revisión `3756181`) y le fusiona el adaptador LoRA de harness-hub (revisión `e786f84`). La arquitectura es un transformer con una capa de predicción multi-token (MTP) integrada, que el servidor de llama.cpp puede aprovechar para decodificación especulativa mediante `--spec-type draft-mtp`. El modelo conserva la torre de visión del original, servida a través del proyector `mmproj-Qwen3.8-27B-pi-F16.gguf` (0,9 GB).

El adaptador se entrenó con aprendizaje por refuerzo usando AsyncGRPO en la librería TRL, con el objetivo de convertirse en el modelo detrás del agente de programación pi en tareas de ingeniería de software y terminal. El entrenamiento y la evaluación se realizaron con el modo thinking desactivado y con la API de Chat Completions, lo que condiciona el modo de uso recomendado. Las cuantizaciones pequeñas (Q3_K_M, IQ3_XXS, IQ2_M) se generaron a partir del archivo Q8_0 con una importance matrix calculada con llama-imatrix sobre texto periodístico en inglés y código Python con licencia MIT en fragmentos de 512 tokens; en esos archivos la capa MTP se mantiene en Q4_K porque la importance matrix no la cubre.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y resolución de tareas de ingeniería de software (edición de código, corrección de bugs, refactorización).
- Ejecución de tareas en terminal y uso de herramientas de línea de comandos como agente.
- Tool calling / function calling mediante la API de Chat Completions (formato OpenAI).
- Razonamiento multi-paso y flujos de agente autónomo (orientado a pi).
- Entrada de imágenes (image-text-to-text) mediante el proyector mmproj.
- Decodificación especulativa nativa con la capa MTP para acelerar la generación.
- Modo thinking disponible en el modelo base, aunque el adaptador fue entrenado y evaluado con thinking desactivado.

## Casos de uso

- Agente de programación local: desplegado con llama-server y conectado a pi mediante `~/.pi/agent/models.json`, el modelo puede recibir instrucciones como corregir tests fallidos y ejecutar el ciclo completo de edición y verificación de código sin salir de la máquina.
- Automatización de tareas de terminal: el adaptador está entrenado específicamente para entornos de shell, por lo que puede encadenar comandos, interpretar su salida y corregir errores en tareas de administración y desarrollo.
- Asistente de CI/CD: integrado como endpoint compatible con OpenAI (`/v1`), puede insertarse en pipelines para revisar diffs, proponer parches y validar cambios antes de fusionar.
- Revisión de código con contexto largo: con 65.536 tokens de ventana puede analizar archivos completos o varios módulos relacionados en una sola pasada.
- Análisis de capturas e interfaces: gracias al proyector de visión puede interpretar imágenes de pantalla, diagramas o errores visuales como parte de un flujo de depuración.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (16,8 GB) e IQ4_XS (15,3 GB) permiten ejecutar el modelo en GPUs de 16-24 GB de VRAM con pérdida de fidelidad controlada.
- Uso en Apple Silicon: los builds MLX de 6 bits y las velocidades medidas en un MacBook Pro M5 Max (hasta 165 tok/s con Splash en Q4_K_M) lo hacen viable para desarrollo local en portátiles.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (harness-hub), con thinking desactivado, comparando el modelo adaptado con el base:

| Benchmark | Base | Adaptado (pi) |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |

Además, el adaptador reduce las llamadas a herramientas por tarea entre un 55% y un 64%.

Fidelidad de las cuantizaciones respecto a BF16 (mismo siguiente token y divergencia KL media):

| Archivo | Tamaño | Mismo siguiente token que BF16 | Divergencia KL media |
|---|---|---|---|
| Q6_K (recomendado) | 22,4 GB | 98,4% | 0,0038 |
| Q8_0 | 29,0 GB | 99,2% | 0,0003 |
| Q5_K_M | 19,5 GB | 97,1% (vs Q8_0) | 0,0052 (vs Q8_0) |
| Q4_K_M | 16,8 GB | 94,2% | 0,0595 |
| IQ4_XS | 15,3 GB | 94,1% (vs Q8_0) | 0,0197 (vs Q8_0) |
| Q3_K_M | 13,5 GB | 93,1% (vs Q8_0) | 0,0804 (vs Q8_0) |
| IQ3_XXS | 11,4 GB | 91,5% (vs Q8_0) | 0,1244 (vs Q8_0) |
| IQ2_M | 10,2 GB | 89,6% (vs Q8_0) | 0,1715 (vs Q8_0) |

Velocidad de decodificación con llama-server en un MacBook Pro M5 Max (greedy, thinking off, 5 prompts × 256 tokens, con otros servicios en ejecución; cifras indicativas):

| Archivo | Sin MTP | Con `--spec-type draft-mtp` | Borradores aceptados |
|---|---|---|---|
| Q4_K_M | 28 tok/s | 52 tok/s (×1,86) | 76% |
| Q6_K | 22 tok/s | 45 tok/s (×2,01) | 72% |
| Q8_0 | 18 tok/s | 44 tok/s (×2,41) | 75% |

Velocidad con Splash 1.7.0 (decodificación especulativa con DFlash2, mismas condiciones):

| Archivo | Velocidad de decodificación | Extremo a extremo (incl. prompt) | Tokens por ciclo |
|---|---|---|---|
| Q4_K_M | 165 tok/s | 128 tok/s | 6,7 |
| Q6_K | 132 tok/s | 100 tok/s | 6,9 |
| Q8_0 | 109 tok/s | 84 tok/s | 6,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 ~29 GB; Q6_K ~22,4 GB; Q5_K_M ~19,5 GB; Q4_K_M ~16,8 GB; IQ4_XS ~15,3 GB; Q3_K_M ~13,5 GB; IQ3_XXS ~11,4 GB; IQ2_M ~10,2 GB. Añadir ~0,9 GB si se usa el proyector de visión.
- GPU recomendadas: para Q8_0, A100 40 GB, H100 o RTX 6000 Ada; para Q6_K, RTX 4090 24 GB o A6000; para Q4_K_M e IQ4_XS, RTX 4080/4090 16-24 GB.
- Cabe en GPU de consumo: sí, con Q4_K_M o IQ4_XS en GPUs de 16 GB o más; las cuantizaciones Q3_K_M, IQ3_XXS e IQ2_M permiten bajar a 12-14 GB.
- Opciones de despliegue: llama.cpp (llama-server), Splash 1.7.0 (con decodificación especulativa DFlash2), builds MLX en Apple Silicon; el endpoint es compatible con la API de Chat Completions de OpenAI, por lo que puede conectarse a clientes tipo OpenAI.
- Latencia y throughput: en MacBook Pro M5 Max, 18-28 tok/s sin MTP según cuantización, 44-52 tok/s con MTP y 84-165 tok/s con Splash. No se han publicado mediciones en GPU en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi (este) | ~27,3B | 65.536 tokens (uso documentado) | Apache 2.0 | GGUF, MLX | Adaptado con RL para agente pi; MTP nativo; visión |
| Qwen3.8-27B (base) | ~27,3B | no disponible | no disponible | no disponible | Punto de partida; sin adaptación para agentes |
| Alternativas de ~27B con soporte de agentes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; activarlo puede degradar el comportamiento esperado en tareas de agente.
- El entrenamiento y la evaluación usaron la API de Chat Completions; usar otros formatos de prompt puede alterar los resultados.
- Las cuantizaciones por debajo de Q5_K_M pierden fidelidad de forma apreciable (Q4_K_M retiene el 94,2% del siguiente token; IQ2_M cae al 89,6%), lo que puede afectar a tareas de razonamiento y código.
- En los archivos IQ, la capa MTP se mantiene en Q4_K por falta de cobertura de la importance matrix, lo que introduce una heterogeneidad de precisión.
- No se especifican los idiomas soportados; el material de entrenamiento del adaptador se orienta a tareas de código y terminal, mayoritariamente en inglés.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de código donde puede generar APIs o comandos inexistentes; requiere verificación.
- Las cifras de velocidad se midieron en un MacBook Pro M5 Max con otros servicios en ejecución y se declaran como indicativas, no como garantías.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce la licencia del modelo base Qwen3.8-27B en la información disponible; conviene verificarla antes de producción.
- Los benchmarks publicados (Terminal-Bench 2.1, SWE-bench Pro) provienen del autor del adaptador y no han sido replicados de forma independiente en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Builds MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
