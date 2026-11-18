# LiquidAI/LFM3-1.7B-MLX-bf16

## Resumen

LFM3-1.7B-MLX-bf16 es la conversión a formato MLX en precisión BF16 del modelo LFM3-1.7B desarrollado por Liquid AI, una empresa surgida del MIT especializada en modelos de lenguaje de arquitectura no convencional. Este repositorio concreto no es un modelo nuevo, sino una distribución de los pesos originales empaquetada específicamente para su ejecución sobre Apple Silicon mediante la librería MLX, lo que permite inferencia nativa en chips de la serie M de Apple sin necesidad de CUDA.

El modelo subyacente, LFM3-1.7B, cuenta con 1.728.801.536 parámetros totales (aproximadamente 1,73 mil millones) y está etiquetado por el autor con la familia "liquid" y "lfm3", lo que lo sitúa en la tercera generación de la saga Liquid Foundation Models. Soporta generación de texto y conversación en 16 idiomas, incluyendo castellano, y dispone de un modo de razonamiento ("thinking") que se activa explícitamente en tiempo de inferencia.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 1,7B parámetros en hardware de consumo Apple con pesos sin cuantizar (BF16, 3,46 GB), manteniendo el modo de razonamiento opcional y una ventana de contexto amplia según la configuración de generación indicada por el autor (hasta 16.384 tokens de salida en el ejemplo de uso). La licencia es propietaria (LFM Open License v1.0, identificada como "lfm1.0"), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (familia "liquid", LFM3; detalles en la model card del modelo base) |
| Parametros totales | 1.728.801.536 (~1,73B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible de forma explícita; el ejemplo de uso fija `--max-tokens 16384` para la generación |
| Tipos de cuantizacion | Este repositorio es BF16 sin cuantizar; el modelo base dispone de variantes cuantizadas (tag `base_model:quantized`) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (LFM Open License v1.0, licencia propietaria "other") |
| Formato de pesos | safetensors (MLX, BF16); 3,46 GB de pesos, 3,5 GB de repositorio |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-1.7B más allá de las etiquetas del autor ("liquid", "lfm3"), que remiten a la familia de Liquid Foundation Models de Liquid AI. La model card de esta conversión MLX delega explícitamente los detalles de arquitectura y entrenamiento a la model card del modelo original (LiquidAI/LFM3-1.7B), por lo que no se dispone aquí de datos sobre número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Sí se documenta una innovación operativa relevante: el modelo incorpora un modo de razonamiento ("thinking") que permanece desactivado por defecto y se habilita mediante el flag `--enable-thinking` en MLX-VLM. El autor recomienda parámetros de muestreo distintos según la tarea: para uso general, temperatura 0,1, top-k 50 y penalización por repetición 1,1; para matemáticas y ciencia, temperatura 1,0, top-p 0,95, top-k 20 y penalización por repetición 1,0. Esta separación sugiere un comportamiento de generación diferenciado entre modo conversacional y modo razonamiento.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Modo de razonamiento opcional ("thinking"), activable en inferencia y desactivado por defecto.
- Razonamiento matemático y científico, con parámetros de muestreo recomendados específicamente para estas tareas.
- Soporte multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Ejecución nativa en Apple Silicon mediante MLX (MLX-VLM ≥ 0.7.11).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada (aunque el ejemplo de uso emplea MLX-VLM, no se confirma modalidad visual).

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse íntegramente en un equipo Apple Silicon con MLX-VLM, sin conexión a la nube, gestionando diálogos multi-turno con los pesos BF16 de 3,46 GB cargados en memoria unificada.
- Razonamiento matemático y científico asistido: activando `--enable-thinking` y los parámetros de muestreo recomendados (temperatura 1,0, top-p 0,95, top-k 20), el modelo está pensado para resolver problemas paso a paso en entornos de investigación o docencia.
- Prototipado rápido de aplicaciones de IA en macOS: al no requerir GPU NVIDIA ni CUDA, permite a desarrolladores validar flujos de generación de texto en portátiles Apple antes de migrar a infraestructura de servidor.
- Procesamiento multilingüe: con 16 idiomas soportados, es adecuado para tareas de traducción, resumen o generación en español, francés, alemán, portugués, árabe, chino, japonés, entre otros, en un único modelo de 1,7B.
- Generación de texto con control de estilo: los parámetros de muestreo diferenciados permiten alternar entre salidas deterministas (temperatura 0,1) para respuestas factuales y salidas más exploratorias para tareas creativas.
- Evaluación comparativa de modelos pequeños: sirve como referencia de la familia LFM3 para benchmarking interno frente a otros modelos de ~1,7B, aprovechando su formato MLX para pruebas reproducibles en hardware de consumo.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente en Apple Silicon, los datos no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión MLX no incluye métricas (MMLU, HumanEval, GSM8K u otras) y remite a la model card del modelo base, cuyos datos no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM / memoria unificada: los pesos BF16 ocupan 3,46 GB; se necesita memoria adicional para el contexto KV, por lo que se recomienda un mínimo de 8 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: chips Apple Silicon (serie M) compatibles con MLX; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con MLX; no se documenta soporte para GPUs NVIDIA en este repositorio (requeriría otras variantes del modelo base).
- Opciones de despliegue: MLX-VLM ≥ 0.7.11 mediante `python -m mlx_vlm.generate`; el soporte en mlx-lm está en revisión (PR ml-explore/mlx-lm#2016), por lo que no hay release de mlx-lm que cargue LFM3 todavía. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para esta conversión.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-bf16 | ~1,73B | No disponible (ejemplo con 16.384 tokens de salida) | 16 | lfm1.0 (propietaria) | MLX BF16 (Apple Silicon) |
| LFM3-1.7B (base) | ~1,73B | No disponible | 16 | lfm1.0 | safetensors, variantes cuantizadas |
| Alternativas de ~1,7B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de otros fabricantes, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia propietaria lfm1.0: no es una licencia open source; es necesario revisar los términos del archivo LICENSE antes de cualquier uso comercial.
- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo entrenado con datos web, es previsible que herede sesgos, pero no hay evidencia específica disponible.
- Riesgo de alucinación: no cuantificado; como modelo de 1,7B parámetros, su fiabilidad factual es limitada en comparación con modelos de mayor tamaño.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica explícitamente; aunque soporta 16 idiomas, no se detalla el nivel de calidad por idioma.
- Restricciones de plataforma: esta conversión está pensada exclusivamente para Apple Silicon con MLX-VLM ≥ 0.7.11; mlx-lm aún no la soporta en release estable.
- Modo de razonamiento desactivado por defecto: requiere el flag `--enable-thinking`; sin él, el rendimiento en matemáticas y ciencia puede ser inferior al esperado.
- Parámetros de muestreo sensibles a la tarea: usar los valores incorrectos (por ejemplo, temperatura 0,1 en matemáticas) puede degradar la calidad de las respuestas.
- En producción: al ser una conversión de pesos y no un modelo nuevo, conviene validar el comportamiento frente al modelo base antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola / API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Pull request de soporte LFM3 en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2016
