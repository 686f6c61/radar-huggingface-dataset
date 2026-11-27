# Remek/basal-omni-1.0-mini-FP8

## Resumen

basal-omni-1.0-mini-FP8 es un checkpoint cuantizado en FP8 del modelo basal-omni-1.0-mini, desarrollado por Remek. Se trata de un modelo experimental orientado a la toma de decisiones tipadas (typed decisions), clasificación y calibración, construido sobre una base Gemma 4 E4B. El modelo no es un modelo conversacional generalista al uso: su API está diseñada para formular decisiones estructuradas entre conjuntos de opciones (hasta 255), con modos como `choice`, `noul`, `score`, `multi`, `act` y `tool`.

La relevancia de este checkpoint radica en que reduce el peso de 16 GB (bf16) a 12 GB manteniendo prácticamente idéntico el comportamiento del modelo original: un acuerdo del 96,24% en decisiones de 2 a 10 opciones y una caída de precisión de solo 0,35 puntos porcentuales. Está pensado para servirse con vLLM a través del motor basal-serve, con soporte para GPUs Ada, Hopper y Blackwell (sm89 o superior).

El modelo tiene 7.941.100.832 parámetros totales y una ventana de contexto de 16.384 tokens según la configuración de servicio indicada. Soporta únicamente texto en este checkpoint (las capacidades de imagen y audio requieren el modelo bf16). Los idiomas declarados son polaco e inglés, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 E4B (no se detalla variante exacta) |
| Parametros totales | 7.941.100.832 |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (configuración de servicio `--max-len 16384`) |
| Tipos de cuantizacion | FP8 (E4M3) con escalas estáticas por tensor; capas 0, 1, 40, 41, embeddings, cabeza de salida y encoders de imagen/audio en bf16 |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (ModelOpt FP8, leído nativamente por vLLM) |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Gemma 4 E4B, cuantizado a FP8 mediante NVIDIA ModelOpt 0.47. La receta emplea pesos y activaciones FP8 (E4M3) con escalas estáticas por tensor, calibradas sobre 2.048 prompts de decisión en polaco e inglés en el formato de prompt del modelo. De las capas lineales del modelo de lenguaje, 311 están en FP8, mientras que las capas decodificadoras 0, 1, 40 y 41, los embeddings, la cabeza de salida y los encoders de imagen y audio permanecen en bf16.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El checkpoint es un port de capa de decisión del mismo modelo, no un modelo nuevo: sus resultados de benchmark (Werdykt v1 0.769, conjuntos en polaco e inglés) se reportan en el modelo base basal-omni-1.0-mini. La calibración (`CALIBRATION.vllm.json`) se ajusta sobre las propias lecturas de vLLM de este checkpoint con el método y las particiones del modelo bf16, incluyendo temperaturas por tipo y umbrales certificados para errores del 1% y 5%, con un único orden de opciones.

## Capacidades

- Toma de decisiones tipadas entre conjuntos de opciones (hasta 255 opciones), con modos `choice`, `noul`, `score`, `multi`, `act` y `tool`.
- Clasificación y calibración con umbrales certificados para niveles de error del 1% y 5%.
- Generación de texto y modo conversacional (pipeline text-generation).
- Soporte de tool calling a través del modo `tool`.
- Automatización de decisiones con calibración: al 1% de error objetivo automatiza el 41,9% de las decisiones; al 5%, el 63,5%.
- Capacidades multilingües limitadas a polaco e inglés.
- Capacidades de imagen y audio no disponibles en este checkpoint FP8 (requieren el modelo bf16 con `--mode eager --media on`).

## Casos de uso

- Enrutamiento y clasificación de tickets de soporte: el modelo puede decidir entre categorías predefinidas (hasta 255 opciones) con umbrales de calibración que permiten automatizar una fracción de los casos y derivar el resto a revisión humana.
- Moderación de contenido con criterios tipados: usando el modo `choice` o `multi` se pueden aplicar políticas de clasificación con umbrales certificados de error, midiendo la tasa de automatización al 1% o 5%.
- Extracción de decisiones estructuradas en pipelines de datos: el modo `score` permite puntuar opciones y ordenar resultados, útil para anotación asistida o triaje de documentos en polaco e inglés.
- Agentes con tool calling: el modo `tool` permite integrar el modelo en flujos donde debe seleccionar y estructurar llamadas a herramientas, con la ventaja de latencias de 53 ms p50 en una RTX PRO 6000.
- Automatización de decisiones de negocio con auditoría: la calibración por tipo y los umbrales certificados permiten desplegar el modelo en procesos donde se exige una tasa de error controlada y medible.
- Servicio de alto rendimiento con vLLM: con 23,2 decisiones/s y 11,4 preguntas/s en una RTX PRO 6000 96 GB, es adecuado para cargas de clasificación masiva por lotes o en línea.
- Evaluación de decisiones repetibles: con `VLLM_BATCH_INVARIANT=1` se obtienen respuestas deterministas entre ejecuciones (a costa de un 23% menos de decisiones por segundo), útil en entornos de auditoría.

## Benchmarks y rendimiento

Resultados medidos contra el modelo bf16 en dev v2 (10.606 decisiones), en una RTX PRO 6000 96 GB (Blackwell):

| Metrica | FP8 | bf16 | Umbral (gate) |
|---|---|---|---|
| Acuerdo (opciones 2-10) | 0,9624 | referencia | >= 0,9161 |
| Acuerdo con margen bf16 >= 0,2 | 0,9892 | referencia | >= 0,9858 |
| Precisión (opciones 2-10) | 0,7759 | 0,7794 | dentro de 1 punto |
| ECE (opciones 2-10) | 0,0674 | 0,0650 | <= +0,01 |
| Acuerdo en todas las decisiones (hasta 255 opciones) | 95,6% | referencia | no disponible |
| Precisión en todas las decisiones | 0,7530 | 0,7560 | no disponible |

Automatización (prueba de calibración, 8.560 decisiones, umbrales ajustados por paquete):

| Error objetivo | FP8 | bf16 |
|---|---|---|
| 1% | 41,9% | 41,7% |
| 5% | 63,5% | 77,6% |

Repetibilidad: dos ejecuciones de las primeras 2.000 decisiones de dev v2 dan la misma respuesta principal en el 96,8% de los casos (99,2% con margen bf16 >= 0,2). Con `VLLM_BATCH_INVARIANT=1`, dos ejecuciones de basal-omni-1.0-max-FP8 con 32 peticiones en vuelo dieron la misma respuesta en las 2.000 decisiones.

Rendimiento (RTX PRO 6000 96 GB, 16 peticiones en vuelo):

| Servido como | Una pregunta sobre estado de ~1.500 tokens | 5 preguntas sobre estado de 3.000-10.000 tokens |
|---|---|---|
| Este checkpoint, `--mode vllm` | 23,2 decisiones/s, 53/71 ms p50/p95 | 11,4 preguntas/s, 0,56/0,79 s por petición |
| bf16, `--mode vllm` | 15,4 decisiones/s, 74/100 ms | 8,0 preguntas/s, 0,80/1,11 s |

El benchmark principal del modelo base (Werdykt v1: 0,769, conjuntos en polaco e inglés) se reporta en basal-omni-1.0-mini y no se puntúa por separado para este port.

## Requisitos de hardware

- VRAM estimada: 12 GB de pesos en FP8. Con `--gpu-memory 0.9` en una RTX PRO 6000 96 GB, vLLM mantiene 1.306.616 tokens de caché de estado (bf16: 1.244.745).
- GPUs compatibles: FP8 requiere sm89 o superior (Ada, Hopper, Blackwell). Verificado en una RTX PRO 6000 96 GB.
- GPUs consumer: no se confirma compatibilidad con GPUs consumer en la información disponible; la verificación se realizó únicamente en una RTX PRO 6000. Las GPUs Ada consumer (sm89) cumplen el requisito arquitectónico, pero no hay datos de rendimiento publicados para ellas.
- Despliegue: vLLM 0.31.0 con el motor basal-serve (`basal-serve --model Remek/basal-omni-1.0-mini-FP8 --mode vllm --max-len 16384 --gpu-memory 0.9 --port 8000`). Requiere CUDA 13 y driver NVIDIA 580 o superior. No hay soporte documentado para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 53 ms p50 / 71 ms p95 por decisión única; 0,56 s p50 / 0,79 s p95 por petición con 5 preguntas sobre estados largos; 23,2 decisiones/s y 11,4 preguntas/s con 16 peticiones en vuelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| basal-omni-1.0-mini-FP8 (este) | 7,94 B | 16.384 | FP8 safetensors | Apache 2.0 | Decisiones tipadas, texto |
| basal-omni-1.0-mini (bf16) | 7,94 B | 16.384 | bf16 safetensors | Apache 2.0 | Decisiones tipadas, texto, imagen y audio |
| basal-omni-1.0-max-FP8 | no disponible | no disponible | FP8 | no disponible | Decisiones tipadas (variante max) |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría fuera de la familia basal en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta explícitamente como experimental; no debe asumirse estabilidad de API ni de resultados en producción sin validación propia.
- Solo texto: las capacidades de imagen y audio no están disponibles en este checkpoint FP8; requieren el modelo bf16 con `--mode eager --media on`.
- Un único orden de opciones: la calibración incluida está ajustada para un solo orden de opciones (el predeterminado); otros órdenes pueden degradar la calibración.
- Repetibilidad no garantizada por defecto: en `--mode vllm` una decisión puede cambiar entre ejecuciones por la caché de prefijo y el batching. Para respuestas repetibles hay que usar `VLLM_BATCH_INVARIANT=1`, con una reducción de aproximadamente el 23% en decisiones por segundo. La opción `--deterministic` no está disponible en `--mode vllm`.
- Mayor tasa de decisión automática al 5% de error: este checkpoint automatiza menos que bf16 al 5% (63,5% frente a 77,6%) porque su umbral de elección se mantiene en el del 1%.
- Idiomas limitados a polaco e inglés; no hay soporte declarado de castellano.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; aplican los riesgos generales de los modelos de lenguaje derivados de Gemma.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y sus dependencias (Gemma 4, ModelOpt, vLLM) pueden tener condiciones adicionales que deben revisarse.
- Requisitos de infraestructura estrictos: CUDA 13, driver 580 o superior y GPUs sm89 o superior; no hay soporte documentado para stacks de inferencia alternativos.

## Enlaces

- Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-mini-FP8
- Modelo base: https://huggingface.co/Remek/basal-omni-1.0-mini
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web: https://basal.si5.pl/
