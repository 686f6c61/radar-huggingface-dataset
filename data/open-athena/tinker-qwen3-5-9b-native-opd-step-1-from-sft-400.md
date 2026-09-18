# open-athena/tinker-qwen3.5-9b-native-opd-step-1-from-sft-400

## Resumen

El modelo `open-athena/tinker-qwen3.5-9b-native-opd-step-1-from-sft-400` es un adaptador LoRA de tipo PEFT publicado por el usuario open-athena dentro de la etiqueta `marin-community`, construido sobre el modelo base `Qwen/Qwen3.5-9B-Base`. No es un modelo completo, sino un artefacto de investigación: el resultado de **una sola** actualización completa del optimizador mediante destilación on-policy con divergencia KL inversa sobre tokens elegidos, aplicada en el entorno MarinSkyRL con un estilo de entrenamiento tipo Tinker.

El punto de partida no es el checkpoint SFT final, sino el adaptador SFT nativo de Axolotl correspondiente al paso 400 (`open-athena/tinker-qwen3.5-9b-native-sft-step-400`). El alumno generó cuatro respuestas por cada uno de 512 prompts de DeepMath, con hasta 16.384 tokens nuevos por respuesta, y el profesor de tokens elegidos fue `Qwen/Qwen3.5-9B`. El objetivo declarado por el autor es una demostración de consecución de una puntuación objetivo, no la reproducción de la trayectoria de 200 pasos de la receta de Thinking Machines.

Su relevancia es metodológica: documenta con precisión (revisión del modelo base, hiperparámetros, topología de GPUs, hashes SHA-256 y trazas de evaluación retenidas) cómo un único paso de OPD cambia el rendimiento en razonamiento matemático. En una evaluación local de 30 preguntas de AIME 2024 pasó de 19/30 (punto de partida SFT-400) a 26/30, con dos respuestas que alcanzaron el límite de longitud. El repositorio ocupa 1,6 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso del modelo base `Qwen/Qwen3.5-9B-Base`; arquitectura interna del modelo base no disponible en la informacion proporcionada |
| Parametros totales | Modelo base: aproximadamente 9.000 millones (segun la denominacion `9B`). Recuento exacto de parametros del adaptador LoRA: no disponible |
| Parametros activos | No aplica: no se describe una arquitectura de mezcla de expertos (MoE) en la informacion disponible |
| Longitud de contexto | No disponible. Durante el entrenamiento se generaron hasta 16.384 tokens nuevos por respuesta |
| Tipos de cuantizacion | No disponible (solo se publica el adaptador en safetensors; no se anuncian versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (etiqueta del repositorio). La licencia del modelo base debe verificarse por separado |
| Formato de pesos | PEFT LoRA en safetensors (`adapter_model.safetensors` + `adapter_config.json`) |
| Rango LoRA | 128 |
| Modelo base | `Qwen/Qwen3.5-9B-Base`, revision `68c46c4b3498877f3ef123c856ecfde50c39f404` |
| Profesor (destilacion) | `Qwen/Qwen3.5-9B`, revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Punto de partida | `open-athena/tinker-qwen3.5-9b-native-sft-step-400` (adaptador SFT nativo de Axolotl, paso 400) |
| Tamano del repositorio | 1,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 18 de septiembre de 2026 |
| SHA-256 (`adapter_model.safetensors`) | `c706c786c331bfbab4bb077bb69149b2092e5e7f28544ef531e63d6cb38da071` |
| SHA-256 (`adapter_config.json`) | `994763a467f94f8628adf720c4652bd580dd3a2a8bd7c41c70fc80bec70cfd8e` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 128 que se carga sobre el modelo base fijado a una revisión concreta. La innovación técnica no reside en la arquitectura, sino en el procedimiento de optimización: destilación on-policy con KL inversa y muestreo de tokens elegidos (*chosen-token sampled reverse-KL*), ejecutada en MarinSkyRL con un flujo estilo Tinker. En cada prompt, el alumno muestrea cuatro respuestas completas y el profesor puntúa únicamente los tokens seleccionados, de modo que la señal de gradiente se concentra en las trayectorias realmente generadas por el alumno en lugar de en datos estáticos.

El presupuesto de cómputo documentado es de cuatro GPUs FSDP2 para la política del alumno, dos GPUs H100 adicionales para la inferencia del alumno y otras dos para la del profesor, con una tasa de aprendizaje de 1e-4. El conjunto de datos de entrenamiento son 512 prompts de DeepMath, con hasta 16.384 tokens nuevos generados por respuesta. Alumno y profesor comparten tokenizador, lo que evita desalineaciones de vocabulario en el cálculo de la divergencia. El autor advierte explícitamente de que se trata de **un único** paso de optimizador y no de la receta completa: la receta publicada por Thinking Machines comienza la fase OPD tras 3.000 pasos de SFT, mientras que aquí se parte del paso 400. Tampoco se retuvieron los tensores históricos de puntuación por token del profesor ni los rollouts de entrenamiento del alumno.

## Capacidades

- Generacion de texto y razonamiento matemático de varios pasos, evidenciado por la evaluación en AIME 2024.
- Resolución de problemas de competición con cadenas de razonamiento largas, de hasta 16.384 tokens nuevos por respuesta.
- Destilación de un modelo profesor de mayor calidad dentro de la misma familia, con tokenizador compartido.
- Capacidad de servir como punto de partida para experimentos posteriores de OPD o RL sobre el mismo modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado con herramientas: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades de vision, audio o modo *thinking* explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigación en destilación on-policy: el adaptador sirve como referencia reproducible de un único paso de OPD partiendo de un SFT intermedio, con hashes, hiperparámetros y trazas de evaluación publicados, lo que permite medir el efecto aislado de ese paso.
- Reproducción y auditoría de recetas de RL: el autor enlaza un paquete de reproducción con salidas de evaluación retenidas y manifiestos de lanzamiento, útil para comparar la receta de Thinking Machines con implementaciones alternativas.
- Generación de datos sintéticos de razonamiento matemático: partiendo de prompts tipo DeepMath, el adaptador puede generar cadenas de solución largas que después se filtran o se puntúan con un profesor para construir nuevos conjuntos de entrenamiento.
- Punto de partida para ajuste específico de dominio: al ser un LoRA de rango 128 sobre un modelo base de 9B, se puede continuar el entrenamiento con datos propios sin partir de cero, siempre que se respete la revisión exacta del modelo base.
- Estudio de sensibilidad a la longitud de generación: el hecho de que dos respuestas de la evaluación AIME alcanzasen el límite de longitud lo convierte en un caso útil para analizar la relación entre presupuesto de tokens y precisión.
- Validación de infraestructura de entrenamiento distribuido: la configuración publicada (FSDP2 para la política y GPUs H100 separadas para inferencia de alumno y profesor) sirve como plantilla para montar pipelines de destilación similares.
- Docencia e investigación académica: como adaptador pequeño (1,6 GB) sobre una licencia Apache-2.0, es adecuado para entornos de laboratorio que quieran estudiar métodos de alineación sin costes de entrenamiento completos.

## Benchmarks y rendimiento

| Benchmark | Protocolo | Este adaptador (paso 1 de OPD) | Punto de partida (SFT paso 400) |
|---|---|---|---|
| AIME 2024 | Evaluación independiente local de 30 preguntas | 26/30 correctas (dos respuestas alcanzaron el límite de longitud) | 19/30 correctas |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, ni comparaciones con modelos de terceros. El propio autor advierte de que el resultado de 26/30 no es plenamente comparable como benchmark debido a las dos respuestas que agotaron el presupuesto de tokens, y que se trata de una demostración de consecución de una puntuación objetivo, no de una reproducción de la trayectoria de 200 pasos de la receta original. Los tensores históricos de puntuación por token del profesor y los rollouts de entrenamiento no se conservaron.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tama\u00f1o del modelo base de 9B, no publicada por el autor): en bf16/fp16, en torno a 18-20 GB solo para pesos, más caché KV; en cuantización de 8 bits, aproximadamente 10-11 GB; en 4 bits, aproximadamente 6-7 GB. El adaptador LoRA añade un coste marginal (el repositorio completo pesa 1,6 GB).
- GPUs de datacenter recomendadas: H100 (usadas en el entrenamiento documentado) y A100 de 40 o 80 GB. También resultan adecuadas L40S de 48 GB o similares.
- GPU de consumo: sí es viable. Una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el modelo base en bf16 con margen ajustado, y con cuantización de 4 u 8 bits cabe en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, etc.).
- Opciones de despliegue: `transformers` + `peft` es la vía natural, ya que solo se publica el adaptador. vLLM y TGI admiten adaptadores LoRA, aunque la compatibilidad concreta con este artefacto no está documentada. llama.cpp u Ollama requerirían exportar el modelo fusionado y convertirlo a GGUF, algo que no se proporciona en el repositorio.
- Consideración de memoria en entrenamiento: la configuración publicada empleó cuatro GPUs FSDP2 para la política y dos H100 para la inferencia del alumno más dos para la del profesor, es decir, un mínimo de ocho GPUs de gama alta para reproducir el paso de OPD.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME 2024 (protocolo local de 30 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`...opd-step-1-from-sft-400`) | LoRA r=128 sobre base de 9B | No disponible | 26/30 | Apache-2.0 | Adaptador PEFT en safetensors |
| `open-athena/tinker-qwen3.5-9b-native-sft-step-400` | LoRA sobre base de 9B | No disponible | 19/30 | No disponible en la informacion proporcionada | Adaptador PEFT |
| `Qwen/Qwen3.5-9B-Base` | Aproximadamente 9B | No disponible | No evaluado en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo base completo |
| `Qwen/Qwen3.5-9B` (profesor) | Aproximadamente 9B | No disponible | No evaluado en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo completo |

No se dispone de datos que permitan comparar este adaptador con alternativas de otras familias (por ejemplo, modelos de razonamiento de tamano similar de otros proveedores), ya que no se han publicado resultados de benchmarks estandar ni comparaciones de terceros. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su familia base.

## Limitaciones y advertencias

- Se trata de un artefacto de investigación con cero descargas y cero valoraciones en el momento de la consulta: no existe validación por parte de la comunidad.
- El resultado de 26/30 en AIME 2024 procede de un único conjunto de 30 preguntas evaluado con un protocolo local, lo que implica una varianza estadística muy alta y lo aleja de una comparación rigurosa con benchmarks oficiales.
- Dos de las respuestas correctas alcanzaron el límite de longitud de generación, por lo que la puntuación real bajo un presupuesto de tokens sin restricciones podría diferir.
- Es el resultado de **un solo** paso del optimizador, no de la receta completa de destilación. El autor lo describe explícitamente como una demostración de consecución de objetivo.
- El punto de partida es el adaptador SFT del paso 400 y no el checkpoint SFT final; la comparación con otras implementaciones que parten de checkpoints distintos no es directa.
- No se conservaron los tensores de puntuación por token del profesor ni los rollouts de entrenamiento del alumno, lo que limita la auditoría completa del proceso.
- El modelo solo se distribuye como adaptador: requiere cargar el modelo base en una revisión exacta (`68c46c4b...`). Usar otra revisión puede degradar o invalidar el comportamiento.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se declara cobertura multilingüe, por lo que el uso en castellano no está verificado.
- Longitud de contexto: no disponible; no debe asumirse que la ventana del modelo base sea utilizable en su totalidad con este adaptador.
- Licencia: el adaptador se publica bajo Apache-2.0, pero la licencia del modelo base debe verificarse de forma independiente antes de cualquier uso comercial.
- No se proporcionan versiones cuantizadas (GGUF, GPTQ, AWQ), lo que añade trabajo de conversión para despliegues en hardware de consumo.
- No hay garantía de compatibilidad con tool calling, agentes o modos de razonamiento estructurado, ya que no se documentan esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/tinker-qwen3.5-9b-native-opd-step-1-from-sft-400
- Punto de partida (adaptador SFT nativo de Axolotl, paso 400): https://huggingface.co/open-athena/tinker-qwen3.5-9b-native-sft-step-400
- Paquete de reproducción y trazas de evaluación: https://huggingface.co/datasets/open-athena/tinker-qwen3.5-9b-native-eval-traces
- Receta de destilación de Thinking Machines: https://tinker-docs.thinkingmachines.ai/cookbook/recipes/distillation/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (revision `68c46c4b3498877f3ef123c856ecfde50c39f404`)
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`)
- Resultados de la busqueda web: no se encontraron enlaces relevantes sobre este modelo, su familia base o su metodologia; los resultados devueltos correspondian a sitios genericos sin relacion con el artefacto.
