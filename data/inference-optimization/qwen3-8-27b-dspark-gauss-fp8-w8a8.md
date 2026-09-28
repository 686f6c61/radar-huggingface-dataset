# inference-optimization/Qwen3.8-27B-DSpark-Gauss-FP8-W8A8

## Resumen

Qwen3.8-27B-DSpark-Gauss-FP8-W8A8 es un componente borrador (drafter) para decodificacion especulativa, no un modelo de chat autonomo. Lo publica la organizacion `inference-optimization` y deriva de `RedHatAI/Qwen3.8-27B-speculator.dspark` (revision `7f33c272e5da240978e0d55767abab8193d74b95`), que a su vez actua como borrador del modelo objetivo `Qwen/Qwen3.8-27B` (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). Su funcion es proponer secuencias de tokens que el modelo grande verifica, reduciendo el coste por token generado en inferencia.

El checkpoint pesa aproximadamente 2,1 GB en el repositorio y contiene 1.988.431.617 parametros (unos 1,99 B), cuantizados en FP8 estatico con esquema W8A8. La cuantizacion se realizo con calibracion gaussiana con semilla, 1.892 registros de calibracion alineados y un limite de secuencia de 2.048. Se sirve a traves de la libreria `speculators` y esta pensado para desplegarse junto al modelo objetivo mediante el metodo DSpark con `--spec-tokens 8`.

Su relevancia ahora es operativa: los borradores cuantizados en FP8 reducen el coste de memoria y de computo del bucle especulativo, lo que abarata la aceleracion de inferencia de modelos de gran tamano. La publicacion incluye procedencia de cuantizacion reproducible, pero el autor declara explicitamente que la evaluacion esta pendiente: no hay resultados de aceptacion, velocidad ni calidad, ni validacion de servido completada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador para decodificacion especulativa (metodo DSpark) sobre `Qwen/Qwen3.8-27B`; arquitectura interna no disponible |
| Parametros totales | 1.988.431.617 (~1,99 B), segun safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 estatico W8A8 (calibracion gaussiana con semilla, 1.892 registros, limite de secuencia 2.048) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado con `compressed-tensors`) |
| Libreria de carga | `speculators` |
| Librerias nativas / codigo | `custom_code` |
| Modelos base | `RedHatAI/Qwen3.8-27B-speculator.dspark`, `Qwen/Qwen3.8-27B` |
| Tokens de borrador recomendados | 8 (`--spec-tokens 8`) |
| Tamano del repositorio | 2,1 GB |

## Arquitectura y entrenamiento

Se trata de un borrador de decodificacion especulativa para el metodo DSpark, derivado de un speculator ya existente de Red Hat AI. En este esquema, el borrador genera propuestas de tokens baratas que el modelo objetivo valida, de modo que varias posiciones se aceptan por paso de verificacion. La informacion publicada no detalla la arquitectura interna del borrador (tipo de atencion, numero de capas ni dimensiones ocultas), solo su procedencia y su procesamiento de cuantizacion.

El proceso documentado es de cuantizacion, no de entrenamiento desde cero ni de ajuste con RLHF o DPO. El autor aplica una cuantizacion FP8 estatica W8A8 con calibracion gaussiana sembrada, usando valores de calibracion generados en lugar de prompts reales, sobre 1.892 registros alineados con un limite de secuencia de 2.048. Toda la trazabilidad (comandos, manifiesto de cuantizacion, metadatos de calibracion, scripts fuente, parches y el digest SHA-256 de los pesos publicados) esta en `provenance/quantization/`. Los datos de prompts de calibracion no se redistribuyen.

## Capacidades

- Decodificacion especulativa: actua como drafter para `Qwen/Qwen3.8-27B` bajo el metodo DSpark, con un valor por defecto de 8 tokens de borrador por paso.
- Aceleracion de inferencia: su objetivo es reducir la latencia por token y aumentar el throughput del modelo objetivo, no generar respuestas de forma autonoma.
- Integracion con vLLM: el autor incluye un comando de servido de ejemplo con `--spec-model`, `--spec-method dspark` y `--spec-tokens 8`.
- Cuantizacion FP8 W8A8: pesos y activaciones en FP8 para reducir el coste de memoria y computo del borrador.
- Reproducibilidad: incluye procedencia completa de cuantizacion y checksum de los pesos publicados.
- Generacion de texto y conversacion: aparecen como etiquetas de pipeline, pero corresponden al modelo objetivo, no a este checkpoint.
- No se documentan capacidades de tool calling, agentes, vision, audio, modo razonamiento ni soporte multilingue para este componente.

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar `Qwen/Qwen3.8-27B` con este borrador en vLLM para reducir la latencia por token en servicios de generacion con trafico alto, aprovechando que el borrador pesa unos 2 GB en FP8 y no domina el presupuesto de memoria.
- Servicios de chat interactivo con requisitos de latencia estrictos: en asistentes donde el tiempo hasta el primer token y la velocidad de decodificacion condicionan la experiencia, el borrador permite validar varios tokens por paso del modelo objetivo.
- Generacion de codigo asistida en IDE o CI: al reducir el coste por token, resulta viable mantener autocompletado y generacion de fragmentos en flujos de desarrollo con muchos usuarios concurrentes.
- Procesamiento por lotes de documentos largos: en tareas de resumen, extraccion o clasificacion sobre grandes volumenes de texto, el aumento de throughput abarata el coste total del lote.
- Backends de API compatibles con OpenAI: integrar el par borrador-objetivo detras de un servidor vLLM para servir a multiples aplicaciones internas sin cambiar los clientes.
- Investigacion en decodificacion especulativa: usar el checkpoint, junto con su procedencia de cuantizacion, como punto de partida reproducible para medir tasas de aceptacion o comparar estrategias de calibracion.
- Evaluacion de cuantizacion FP8 en borradores: comparar este brazo de calibracion gaussiana con otras variantes del mismo speculator para estudiar el impacto de la cuantizacion en la tasa de aceptacion.
- Despliegue con restricciones de memoria: cuando el modelo objetivo ya consume la mayor parte de la VRAM, un borrador de 2 GB en FP8 deja mas margen para cache KV que un borrador en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion esta pendiente y que no se incluyen resultados completos de aceptacion, velocidad ni calidad; tampoco se ha completado la validacion de servido en tiempo de ejecucion.

## Requisitos de hardware

- Peso del borrador: aproximadamente 2 GB en FP8 (el repositorio ocupa 2,1 GB), frente a los ~1,99 B de parametros declarados.
- VRAM total: hay que sumar el borrador al modelo objetivo `Qwen/Qwen3.8-27B`. Las cifras siguientes son estimaciones orientativas, no datos publicados por el autor.
- Estimacion para el objetivo en FP8: alrededor de 27 GB solo en pesos, mas cache KV, por lo que el conjunto requiere del orden de 30 GB o mas de VRAM.
- GPU recomendadas para el conjunto en FP8: A100 80 GB, H100 80 GB o GPUs con 48 GB o mas de memoria. Una RTX 4090 (24 GB) no permite alojar objetivo y borrador en FP8 simultaneamente.
- GPU de consumo: el borrador por si solo cabe holgadamente en cualquier GPU consumer moderna (8 GB o mas), pero no es util sin el modelo objetivo; para desplegar el par en una GPU de 24 GB habria que cuantizar el objetivo a 4 bits.
- Opciones de despliegue: vLLM con soporte de modelos especulativos (`--spec-model`, `--spec-method dspark`), y la libreria `speculators` para la carga del checkpoint. No se documentan integraciones con llama.cpp, Ollama ni TGI para este componente.
- Latencia y throughput: no disponibles. El autor no ha publicado mediciones de velocidad ni de tasa de aceptacion, y advierte que el comando de servido incluido es solo un ejemplo no validado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Licencia | Estado de evaluacion |
|---|---|---|---|---|---|
| `inference-optimization/Qwen3.8-27B-DSpark-Gauss-FP8-W8A8` | Borrador DSpark para Qwen3.8-27B | ~1,99 B | FP8 W8A8 estatico (calibracion gaussiana) | apache-2.0 | Pendiente, sin resultados |
| `RedHatAI/Qwen3.8-27B-speculator.dspark` | Borrador DSpark para Qwen3.8-27B | no disponible | Sin cuantizar (segun la informacion disponible) | no disponible en la informacion proporcionada | no disponible |
| `Qwen/Qwen3.8-27B` | Modelo objetivo | 27 B (denominacion) | no disponible | no disponible en la informacion proporcionada | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento del borrador cuantizado frente al speculator original ni frente a otros metodos de decodificacion especulativa. Cualquier comparacion de velocidad o tasa de aceptacion queda fuera del alcance de la informacion publicada.

## Limitaciones y advertencias

- No es un modelo autonomo: es un componente borrador y debe desplegarse junto a `Qwen/Qwen3.8-27B`; no genera respuestas utiles por si solo.
- Evaluacion sin completar: no hay resultados de aceptacion, velocidad ni calidad, y la validacion de servido no se ha realizado. El comando de ejemplo de vLLM no esta verificado.
- Sin validacion de produccion: al no existir pruebas de tiempo de ejecucion, no hay garantia de que el checkpoint funcione correctamente en un servidor real.
- Riesgo de calibracion: la cuantizacion uso valores gaussianos sembrados en lugar de prompts reales, lo que puede no representar la distribucion de activaciones del trafico real y afectar a la tasa de aceptacion.
- Idiomas: no se declara ninguna lista de idiomas soportados; el comportamiento multilingue dependera del modelo objetivo.
- Longitud de contexto: no disponible. El limite de secuencia de 2.048 corresponde al proceso de calibracion, no necesariamente a la ventana de inferencia.
- Sesgos y alucinacion: no hay informacion especifica sobre sesgos de este checkpoint; al ser un borrador, las alucinaciones relevantes son las del modelo objetivo, que verifica las propuestas.
- Licencia: apache-2.0 para este repositorio, pero conviene verificar las condiciones de los modelos base (`RedHatAI/Qwen3.8-27B-speculator.dspark` y `Qwen/Qwen3.8-27B`) antes de un uso comercial.
- Datos de calibracion no redistribuidos: la reproducibilidad completa de la cuantizacion queda limitada al no publicarse los prompts de calibracion.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, sin evidencia de uso en produccion por terceros.
- Dependencia de `custom_code`: la carga requiere codigo personalizado, lo que implica revisar la implementacion antes de ejecutarla en un entorno de confianza.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/inference-optimization/Qwen3.8-27B-DSpark-Gauss-FP8-W8A8
- Borrador base (Red Hat AI): https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentacion de la libreria `speculators`: no se proporciona URL en la informacion disponible.
- Paper o blog del metodo DSpark: no se proporciona URL en la informacion disponible.
