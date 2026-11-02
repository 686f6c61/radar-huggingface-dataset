# Remek/basal-omni-pico-GGUF

## Resumen

basal-omni-pico-GGUF es la versión cuantizada en Q8_0 del modelo basal-omni-pico (0,8B), desarrollado por Remek y construido sobre Qwen3.5-0.8B-Base. A diferencia de un modelo generativo convencional, está especializado en "decisiones tipadas": recibe un estado (por ejemplo, el texto de una consulta de cliente) y responde a preguntas estructuradas devolviendo una probabilidad calibrada para cada opción permitida, todo en un único prefill y sin generar texto libre. El formato GGUF permite ejecutarlo con llama.cpp tanto en CPU como en GPU, lo que lo hace apto para despliegues en el borde (edge).

El modelo resuelve el problema de la clasificación y toma de decisiones automatizada con requisitos de calibración: sus probabilidades están ajustadas mediante un fichero de calibración específico (CALIBRATION.gguf.json) que permite fijar umbrales de automatización con tasas de error controladas. Con 752 millones de parámetros y licencia Apache 2.0, es relevante para pipelines de enrutamiento, triaje y clasificación donde se necesita trazabilidad probabilística y no una salida de texto.

La ficha se centra en la versión GGUF Q8_0, que según el autor mantiene una concordancia del 99,24-99,29% con el modelo bf16 original en 1.700 elementos de desarrollo, con diferencias de probabilidad máximas de 0,21-0,30.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido basado en Qwen3.5, con capas Gated DeltaNet (estado recurrente por secuencia); arquitectura llama.cpp `qwen35` |
| Parámetros totales | 752.393.024 (0,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 (fichero publicado); el modelo base admite otras cuantizaciones vía llama.cpp |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-0.8B-Base y conserva su arquitectura híbrida, que incluye capas Gated DeltaNet con estado recurrente por secuencia. Esta característica obliga a que el motor de inferencia decodifique un prompt a la vez; basal 2.3.2 o posterior es necesario para evitar probabilidades no finitas en CPU con versiones anteriores. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp (incluido en llama-cpp-python 0.3.36) usando `--no-mtp`, ya que la release no incluye capa de predicción multi-token, y posteriormente se cuantizó de bf16 a Q8_0 con el cuantizador de llama.cpp.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos remiten a la model card del modelo principal (Remek/basal-omni-pico). La innovación técnica destacable es la API de decisiones tipadas: el modelo no genera texto, sino que produce distribuciones de probabilidad sobre opciones predefinidas (tipos `choice`, `noul`, `score`) en un solo prefill, con calibración de temperatura específica por tipo de pregunta (ECE de elección 0,009, sí/no 0,013, score 0,060 tras el ajuste).

## Capacidades

- Toma de decisiones tipadas: responde preguntas de tipo elección (`choice`), sí/no (`noul`) y puntuación (`score`) con probabilidades por opción.
- Clasificación y enrutamiento: asigna un estado de entrada a una categoría entre un conjunto cerrado de opciones con criterios definidos.
- Calibración de confianza: probabilidades ajustadas que permiten automatizar decisiones con umbrales de error controlados (por ejemplo, 35,4% de automatización con error observado del 0,96% a `max_error` 1%).
- Procesamiento de texto en polaco e inglés.
- Inferencia sin generación de texto: una sola pasada de prefill, lo que reduce latencia frente a modelos generativos.
- Soporte de múltiples preguntas por petición (se documenta una petición de cinco preguntas).
- Compatibilidad con llama.cpp en CPU, CUDA y Metal (en Mac se recomienda `--mode gguf` o `--mode mlx` con el modelo base; `--mode mps` está rechazado para este modelo).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Triaje de atención al cliente: el modelo recibe el texto de una consulta y devuelve la probabilidad de cada departamento de destino (por ejemplo, tarjetas, banca online, préstamos) y si la consulta es urgente, como muestra el ejemplo de la model card con probabilidades de 0,9984 para banca online.
- Enrutamiento automático de tickets: con umbrales calibrados, se pueden derivar automáticamente los casos de alta confianza y escalar a revisión humana los dudosos, usando la tasa de automatización del 35,4% al 1% de error o del 58,5% al 5%.
- Clasificación de documentos en pipelines de ingestión: asignar cada documento a una categoría cerrada con una probabilidad trazable, útil cuando se requiere auditoría de la decisión.
- Moderación o verificación de contenido: preguntas de tipo sí/no con probabilidad calibrada para decidir si un texto cumple una política, dejando el umbral a criterio del operador.
- Puntuación de riesgo o prioridad: uso del tipo `score` para asignar una puntuación calibrada a un estado, por ejemplo, prioridad de una incidencia.
- Despliegue en el borde: al ser un GGUF Q8_0 de 1,6 GB de repositorio, puede ejecutarse en CPU de servidor o en equipos sin GPU dedicada, con latencias de 0,46-0,51 s por petición de dos preguntas en 16 hilos de CPU Xeon Platinum 8460Y+.
- Automatización de encuestas o formularios: convertir respuestas abiertas en decisiones estructuradas con confianza cuantificada.
- Refit de calibración por dominio: usar `basal-calibrate` para reajustar umbrales sobre datos etiquetados propios antes de automatizar en dominios fuera de los de entrenamiento.

## Benchmarks y rendimiento

Datos medidos por el autor para la versión GGUF Q8_0 frente al modelo bf16 servido como release (basal 2.3.2, `--mode eager`, bf16, una H100), sobre 1.700 elementos de desarrollo:

| Entorno | Elementos | Concordancia en la respuesta top [IC 95%] | Diferencia máxima de probabilidad | Exactitud GGUF / bf16 |
|---|---|---|---|---|
| Una H100 (CUDA) | 1.700 | 99,24% [98,70; 99,55] | 0,30 | 0,721 / 0,719 |
| CPU (Xeon Platinum 8460Y+, 16 o 32 hilos) | 1.700 | 99,29% [98,77; 99,60] | 0,21 | 0,718 / 0,719 |

Automatización con CALIBRATION.gguf.json sobre un split de test congelado de 8.560 decisiones:

| Umbral `max_error` | Decisiones automatizadas | Error observado |
|---|---|---|
| 1% | 35,4% | 0,96% |
| 5% | 58,5% | 4,51% |

ECE tras ajuste de temperatura: elección 0,009; sí/no 0,013; score 0,060. El fichero bf16 da 35,0% (0,93%) y 58,2% (4,38%) en el mismo split. En el benchmark fuera de dominio Werdykt, el modelo bf16 con su propia calibración muestra sobreconfianza (confianza media 0,80 frente a exactitud 0,66, ECE 0,138) y no alcanza el objetivo del 5% (33,9% automatizado, error observado 6,3%).

Rendimiento de inferencia (basal 2.3.2, una petición a la vez): la petición de ejemplo (dos preguntas, 232 tokens) tarda 0,46-0,51 s en 16 hilos de CPU Xeon Platinum 8460Y+ y 0,09 s en una H100; una petición de cinco preguntas tarda 1,4 s en CPU. En una H100, el fichero Q8_0 responde una pregunta corta en 56,5 ms (p50) y alcanza 18,1 decisiones/s con 16 peticiones en vuelo (medido sobre uno de los dos checkpoints promediados en este modelo).

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa aproximadamente 0,8 GB de pesos; con overhead de contexto y runtime, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: H100 para máxima concurrencia (56,5 ms p50, 18,1 decisiones/s con 16 peticiones en vuelo); cualquier GPU NVIDIA con CUDA para llama-cpp-python compilado con CUDA.
- CPU: funciona en CPU sin GPU; se documentan 0,46-0,51 s por petición de dos preguntas en 16 hilos de Xeon Platinum 8460Y+ y unos 0,9 s por decisión en los elementos de desarrollo.
- Cabe en GPU de consumo: sí, por tamaño; no se documentan pruebas específicas en RTX 4090 u otras consumer, pero el tamaño de pesos lo permite.
- Opciones de despliegue: llama.cpp vía llama-cpp-python 0.3.36 o superior con el extra `gguf` de basal 2.5.0; servidor `basal-serve` con `--mode gguf`; en Mac, `--mode gguf` o `--mode mlx` con el modelo base (basal >= 2.5.0); `--mode mps` rechazado para este modelo.
- Latencia y throughput: ver sección de benchmarks; en CPU, aproximadamente 0,9 s por decisión en los conjuntos de desarrollo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| basal-omni-pico-GGUF (Q8_0) | 752 M | No disponible | Decisiones tipadas calibradas | Apache 2.0 | GGUF |
| basal-omni-pico (bf16) | 752 M | No disponible | Decisiones tipadas calibradas | Apache 2.0 | safetensors/bf16 |
| Qwen3.5-0.8B-Base | 0,8B | No disponible | Modelo base generativo | No disponible en la información | No disponible |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría (clasificadores calibrados de 0,8B) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en decisiones tipadas; no es un generador de texto conversacional general, pese a la etiqueta `text-generation` del pipeline.
- Idiomas limitados a polaco e inglés; no se documenta soporte de castellano.
- La calibración publicada se ajustó para un único orden de opciones (el predeterminado); cambios en el orden de las opciones pueden invalidar los umbrales.
- En dominios fuera de los de entrenamiento (benchmark Werdykt), el modelo muestra sobreconfianza (confianza media 0,80 frente a exactitud 0,66; ECE 0,138) y no cumple el objetivo del 5% de error; es necesario reajustar umbrales con `basal-calibrate` sobre datos etiquetados propios.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en estados ambiguos o fuera de distribución.
- Requiere basal 2.3.2 o posterior; versiones anteriores devuelven probabilidades no finitas en CPU con la arquitectura Gated DeltaNet de Qwen3.5.
- En Mac, `--mode mps` está rechazado para este modelo; hay que usar `--mode gguf` o `--mode mlx` con el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones independientes del modelo.
- No se han publicado datos sobre sesgos demográficos o lingüísticos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Remek/basal-omni-pico-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Remek/basal-omni-pico
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentación GGUF del motor: https://github.com/rkinas/basal (docs/GGUF.md)
- Sitio web del proyecto: https://basal.si5.pl/
