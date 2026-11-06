# coral-bricks-ai/qwen35-122b-dflash2-drafter

## Resumen

El modelo `coral-bricks-ai/qwen35-122b-dflash2-drafter` es un *drafter* de decodificación especulativa diseñado para acelerar la inferencia de `Qwen/Qwen3.5-122B-A10B-FP8`, un modelo MoE de 122.000 millones de parámetros del que solo se activan 10.000 millones por token. Lo desarrolla Coral Bricks AI y no es un modelo conversacional autónomo: es un componente auxiliar que propone tokens candidatos que el modelo objetivo verifica después, de modo que la corrección de la salida del modelo grande permanece intacta y solo cambia la velocidad a la que se generan esos tokens.

La arquitectura es `DFlash2DraftModel`, un modelo de difusión de bloques con 6 capas, tamaño de bloque 12 y 8 *taps* de atención sobre estados ocultos del modelo objetivo. Con unos 930 millones de parámetros en BF16, ocupa aproximadamente 1,86 GB, por lo que se sirve junto al modelo grande en el mismo despliegue. Está entrenado específicamente con tráfico agéntico de ingeniería de software y contexto largo, y ajustado para muestreo con temperatura 1.

Su relevancia es práctica: según la model card, en las trazas agénticas de MLCommons SWE alcanza 561,9 tokens por segundo de media frente a los 474,0 del MTP nativo de Qwen con 7 tokens de borrador y los 257,2 del drafter DFlash previo de z-lab, con 5,19 tokens aceptados por paso. La ganancia se mantiene en todos los rangos de longitud de prompt, desde menos de 32K hasta más de 128K tokens. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (difusion de bloques, 6 capas, block size 12, 8 taps) |
| Parametros totales | 930.278.912 (~930 M) |
| Parametros activos | no aplica (no es MoE; el MoE es el modelo objetivo, 122B totales / 10B activos) |
| Longitud de contexto | ventana de borrador de 8192 tokens (`sliding_window`); el objetivo soporta hasta 262144 en el ejemplo de servicio |
| Tipos de cuantizacion | pesos en BF16; el drafter se sirve sin cuantizar (`--speculative-draft-model-quantization unquant`); el objetivo se sirve en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, `model.safetensors`, ~1,86 GB) |

## Arquitectura y entrenamiento

El drafter emplea una arquitectura de difusión de bloques (`DFlash2DraftModel`) que propone un bloque de 12 tokens de forma paralela en lugar de generar token a token. Se apoya en 8 *taps* que leen estados ocultos del modelo objetivo en las posiciones `[1, 7, 14, 20, 26, 32, 39, 45]`, más un selector de ruta DFlash2 y convoluciones *depthwise* sobre esos taps. El punto de partida (*warm start*) es el checkpoint DFlash de z-lab para Qwen3.5-122B-A10B, al que se añadieron el selector de ruta y los taps de convolución. La ventana deslizante del borrador es de 8192 tokens.

El entrenamiento usó 47.440 peticiones extraídas de 31.214 trayectorias de SWE-agent de código abierto. Para cada petición, el modelo objetivo Qwen3.5-122B generó el turno final del asistente a temperatura 1, y el drafter se entrenó sobre los estados ocultos del objetivo a lo largo de ese historial y generación. Se realizó una sola pasada con la pérdida DPAL-CE-TV, tasa de aprendizaje 1e-4 con *warmup* y decaimiento coseno, guardando el checkpoint en el paso 5100 de los 5616 previstos. El conjunto de entrenamiento no contiene datos de MLCommons (0 coincidencias de repositorio y 0 de texto).

## Capacidades

- Decodificación especulativa: propone bloques de 12 tokens candidatos que el modelo objetivo verifica, sin alterar la corrección de la salida.
- Aceleración de generación en contexto largo: mantiene la ventaja sobre el MTP nativo en todos los tramos de longitud de prompt, desde menos de 32K hasta más de 128K tokens.
- Tráfico agéntico de ingeniería de software: entrenado sobre trayectorias de SWE-agent con múltiples pasos de razonamiento y uso de herramientas.
- Muestreo a temperatura 1: ajustado específicamente para ese régimen de decodificación.
- Integración con SGLang: se sirve mediante el algoritmo `DFLASH` de SGLang v0.5.21 o superior.
- No es un modelo autónomo: no genera respuestas por sí mismo ni sustituye al modelo objetivo; carece de capacidades propias de visión, audio o tool calling.

## Casos de uso

- Asistentes de programación en producción: reducir la latencia percibida en la generación de parches y explicaciones de código, ya que el drafter está entrenado con trayectorias de SWE-agent y acelera el bucle de generación del modelo grande en ese dominio.
- Pipelines de CI/CD con agentes de código: integrar el drafter en el servidor SGLang que atiende a agentes que abren PRs, ejecutan tests y corrigen errores, aprovechando la ganancia sostenida en prompts largos de más de 128K tokens.
- Análisis de repositorios extensos: servir consultas sobre bases de código que superan la ventana de contexto habitual, donde el drafter mantiene su tasa de aceptación y el objetivo opera con 262144 tokens de contexto.
- Despliegues de inferencia con requisitos de throughput: aumentar los tokens por segundo por GPU en clústeres H200 o equivalentes sin cambiar el modelo objetivo ni la calidad de las respuestas.
- Sustitución del MTP nativo de Qwen: reemplazar la decodificación especulativa por defecto (3 tokens de borrador, 398,8 tok/s) por este drafter (561,9 tok/s) en servicios ya basados en SGLang con Qwen3.5-122B-A10B-FP8.
- Evaluación y benchmarking de decodificación especulativa: usar el checkpoint como referencia reproducible para comparar estrategias de borrador (DFlash2 frente a DFlash o MTP) sobre trazas agénticas estandarizadas de MLCommons.

## Benchmarks y rendimiento

Resultados de la model card sobre trazas agénticas de MLCommons SWE, los 15.777 turnos, temperatura 1, batch size 1, H200 con TP2, SGLang v0.5.21 estándar y objetivo en FP8:

| Metodo | Tokens/s medios | Tokens aceptados por paso |
|---|---:|---:|
| Este drafter (DFlash2, bloque 12) | 561,9 | 5,19 |
| MTP nativo de Qwen, 7 tokens de borrador | 474,0 | 4,71 |
| MTP nativo de Qwen, 3 tokens de borrador (por defecto) | 398,8 | 3,24 |
| DFlash de z-lab (bloque 16, ventana 4096) | 257,2 | 3,45 |

La ventaja frente a MTP-7 se mantiene en todos los tramos de longitud de prompt, desde menos de 32K hasta más de 128K tokens. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, lo que es coherente con la naturaleza del modelo: no es un modelo de lenguaje evaluable de forma independiente.

## Requisitos de hardware

- VRAM del drafter: aproximadamente 1,86 GB en BF16, sin cuantizar.
- VRAM del objetivo: Qwen3.5-122B-A10B en FP8 requiere un despliegue multi-GPU; el ejemplo oficial usa TP2 (dos GPU) con `--mem-fraction-static 0.85`.
- GPU recomendadas: el benchmark se ejecutó en H200 con TP2; el ejemplo de servicio asume dos GPU con suficiente memoria para el objetivo en FP8.
- GPU de consumo: el drafter por sí solo cabría en cualquier GPU con más de 2 GB, pero no es utilizable sin el modelo objetivo, que no cabe en GPU de consumo.
- Opciones de despliegue: SGLang v0.5.21 o superior con `--speculative-algorithm DFLASH`, `--speculative-dflash-block-size 12` y backend de atención `fa3`; imagen oficial `lmsysorg/sglang:v0.5.21-cu130`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: 561,9 tokens/s medios y 5,19 tokens aceptados por paso en H200 TP2 con batch size 1 sobre trazas agénticas; no se publican datos de latencia por token ni de throughput con batch mayor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (tok/s, trazas SWE) | Licencia |
|---|---|---:|---|---:|---|
| Este drafter (DFlash2, bloque 12) | Drafter de difusion de bloques | ~930 M | ventana 8192 | 561,9 | Apache 2.0 |
| MTP nativo de Qwen (7 tokens) | Cabecera MTP integrada en el objetivo | no disponible | el del objetivo | 474,0 | la del objetivo |
| MTP nativo de Qwen (3 tokens, por defecto) | Cabecera MTP integrada en el objetivo | no disponible | el del objetivo | 398,8 | la del objetivo |
| DFlash de z-lab (bloque 16, ventana 4096) | Drafter de difusion de bloques | no disponible | ventana 4096 | 257,2 | no disponible |

## Limitaciones y advertencias

- No es un modelo de propósito general: solo propone tokens para Qwen3.5-122B-A10B-FP8 y no puede usarse de forma independiente.
- Dependencia de SGLang: requiere la versión 0.5.21 o superior y el algoritmo `DFLASH`; no hay soporte documentado en otros motores de inferencia.
- Especialización estrecha: entrenado con tráfico agéntico de ingeniería de software y ajustado a temperatura 1; el rendimiento fuera de ese dominio o con otras temperaturas de muestreo no está documentado.
- Ventana de borrador limitada a 8192 tokens, aunque el objetivo soporte contextos mucho mayores.
- Idiomas soportados no documentados; la cobertura multilingüe depende del modelo objetivo y no está caracterizada para el drafter.
- Riesgo de alucinación: no aplica al drafter en sí, ya que el objetivo verifica cada token propuesto; la calidad final es la del modelo Qwen3.5-122B-A10B-FP8.
- Sesgos: no se documentan análisis de sesgo específicos para el drafter; los del modelo objetivo no se detallan en la información disponible.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, aunque conviene verificar las condiciones del modelo base Qwen3.5-122B-A10B-FP8.
- Modelo recién publicado (4 de noviembre de 2026) con 0 descargas y 0 likes: sin validación independiente de los resultados reportados.

## Enlaces

- [Hugging Face: coral-bricks-ai/qwen35-122b-dflash2-drafter](https://huggingface.co/coral-bricks-ai/qwen35-122b-dflash2-drafter)
- [Modelo base: Qwen/Qwen3.5-122B-A10B-FP8](https://huggingface.co/Qwen/Qwen3.5-122B-A10B-FP8)
- [Blog de Coral Bricks: We trained a diffusion drafter for Qwen3.5 122B](https://www.coralbricks.ai/blog/qwen35-122b-diffusion-drafter)
- [SGLang](https://github.com/sgl-project/sglang)
