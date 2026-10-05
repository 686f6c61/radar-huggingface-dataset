# littlemex/prismyra-decision-qwen3.6-35b-a3b-nvfp4-36l

## Resumen

Prismyra decision NVFP4 36L es un checkpoint de pesos derivado del proyecto Prismyra de littlemex, construido sobre el modelo base Qwen/Qwen3.6-35B-A3B-FP8. Se trata de una variante de 36 de las 40 capas del modelo original en la que los 256 expertos enrutados de cada capa se han cuantizado a NVFP4 (coma flotante de 4 bits con escalas de bloque de 16 elementos y una escala FP32 por matriz de experto), mientras que el resto de componentes —atención, proyecciones de Gated DeltaNet, experto compartido y cabeza MTP— permanecen en FP8. El objetivo es reducir el peso del checkpoint de unos 29 GB a unos 18 GB y hacerlo ejecutable en una única GPU Blackwell de gama de estación de trabajo como la RTX PRO 4500.

El modelo tiene una vocación muy concreta: tareas de decisión, clasificación y comprensión lectora (reading comprehension), con respuestas de una sola letra en el caso de las evaluaciones. Incorpora un adaptador LoRA de rango 16 denominado L1, fusionado en los pesos no expertos, que se destiló a partir de la propia pasada FP8 de 36 capas del checkpoint y de respuestas de Kimi K3 en filas fuera de la distribución de entrenamiento.

Es relevante porque explora la viabilidad de servir un modelo MoE grande con expertos en 4 bits nativos en hardware Blackwell, con una penalización de precisión medida cercana a cero frente a la versión FP8 completa. No obstante, su estado es experimental: el kernel de forward NVFP4 (`prismyra.kernels.nvfp4`) nunca se integró en la versión publicada del paquete `prismyra`, por lo que la ruta de carga aquí descrita no está verificada como instalación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (atención + proyecciones Gated DeltaNet) con 256 expertos enrutados por capa y experto compartido, más cabeza MTP; tag `qwen3_5_moe` |
| Parametros totales | Aproximadamente 35B nominales (modelo base Qwen3.6-35B-A3B). El archivo `model.safetensors` del repositorio contiene 3.596.444.464 parametros (tensores no expertos); los 256 expertos enrutados por capa se distribuyen aparte en `nvfp4_experts.safetensors` |
| Parametros activos | Aproximadamente 3B (nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible (se menciona un "ceil" de contexto largo del proyecto, sin valor numérico publicado) |
| Tipos de cuantizacion | Expertos enrutados en NVFP4 (4 bits FP, escalas de bloque de 16 elementos, una escala FP32 por matriz de experto); resto de pesos en FP8; adaptador LoRA de rango 16 fusionado en pesos no expertos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`layers-*.safetensors`, `mtp.safetensors`, `outside.safetensors`, `nvfp4_experts.safetensors`) + `nvfp4_calib.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3.6-35B-A3B: 40 capas en el original, de las que este checkpoint conserva 36, con 256 expertos enrutados por capa más un experto compartido. Combina mecanismos de atención con proyecciones Gated DeltaNet (una variante de atención lineal/estado recurrente) y una cabeza MTP (multi-token prediction). Los 256 expertos enrutados son los tensores de mayor tamaño del checkpoint, y cuantizarlos solo a ellos reduce el tamaño de 29 GB a 18 GB. La conversión NVFP4 usa códigos de 4 bits empaquetados con escalas por matriz de experto y un fichero de calibración (`nvfp4_calib.json`) con los máximos de activación por capa medidos sobre 128 filas de entrenamiento.

El adaptador LoRA L1 (rango 16) actúa sobre las proyecciones de atención, las proyecciones Gated DeltaNet y el experto compartido, pero no sobre los expertos enrutados, que se cuantizan desde los pesos FP8 sin adaptar. L1 continúa el entrenamiento desde un adaptador anterior del proyecto (`qat13`) sobre 31.418 filas: destilación contra la propia pasada FP8 de 36 capas en la mayoría de filas, más la respuesta de una sola letra de Kimi K3 (con razonamiento desactivado) en 23.585 filas procedentes de familias de preguntas y variantes de documentos largos no vistas por esa pasada, incluidas 5.696 filas con documentos rellenados hasta el límite de contexto largo del proyecto. Se entrenó durante una época con tasa de aprendizaje 2,5e-5.

La evaluación se realizó sobre dos mediciones separadas, ninguna de ellas sobre este checkpoint combinado exacto (los expertos NVFP4 y L1 nunca se ejecutaron juntos en una pasada completa de evaluación de producción).

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Tareas de decisión y clasificación, orientadas a emitir respuestas cortas o de una sola letra.
- Comprensión lectora (reading comprehension) sobre documentos, incluidas variantes de documento largo.
- Procesamiento de entrada imagen-texto (pipeline declarado `image-text-to-text`).
- Soporte de contexto largo (se mencionan filas de entrenamiento con documentos rellenados hasta el límite de contexto del proyecto, sin valor numérico publicado).
- Capacidad multimodal heredada del modelo base Qwen3.6-35B-A3B (según el pipeline declarado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (las respuestas de destilación se generaron con el razonamiento desactivado).
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible (la destilación de Kimi K3 se hizo con razonamiento desactivado).

## Casos de uso

- Clasificación automática de documentos y respuestas de examen: el modelo emite una respuesta de una sola letra, adecuado para tareas tipo RACE o BoolQ, donde el formato de salida corto reduce la variabilidad.
- Comprensión lectora a escala sobre corpus largos: con soporte de contexto largo y entrenamiento específico en variantes de documento extenso, puede responder preguntas sobre pasajes completos sin trocearlos.
- Filtrado y enrutado de consultas en pipelines de atención al cliente: al ser un modelo de decisión, puede clasificar la intención de una consulta antes de derivarla a otro sistema.
- Moderación y etiquetado automático: clasificación binaria o multietiqueta de contenido (por ejemplo, familias BoolQ) para colas de revisión.
- Evaluación asistida de comprensión en plataformas educativas: responder preguntas de opción múltiple sobre materiales de estudio con salida de una letra.
- Integración multimodal en pipelines de imagen-texto: al declarar pipeline `image-text-to-text`, puede procesar documentos o capturas con texto y emitir una decisión.
- Generación de código en producción: no disponible como capacidad documentada en este checkpoint (la información no indica soporte específico de código, tool calling ni integración en CI/CD).

## Benchmarks y rendimiento

Dos mediciones separadas, ninguna sobre este checkpoint combinado (NVFP4 + L1) en una sola pasada. Ambas comparan contra `littlemex/prismyra-decision-qwen3.6-35b-a3b-fp8-36l`, el checkpoint FP8 del que derivan estos pesos.

**NVFP4 en los expertos enrutados, antes de aplicar LoRA**, sobre un conjunto de confirmación de 1.400 preguntas (familia RACE, familia BoolQ, un split de desarrollo tipo Kev), servido por el proyecto directamente (no a través de vLLM) en una RTX PRO 4500:

| Comparacion | Diferencia en puntos | Intervalo 95% |
|---|---|---|
| Expertos NVFP4 vs. FP8 del propio proyecto (36 capas) | −0,07 | [−0,86, +0,79] |
| Expertos NVFP4 (36 capas) vs. FP8 (32 capas, el checkpoint FP8 más profundo que cabe en una RTX PRO 4500) | +1,86 | [0,64, ...] (intervalo truncado en la información disponible) |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. No se han proporcionado datos de rendimiento (throughput ni latencia).

## Requisitos de hardware

- GPU con tensor cores de 4 bits FP nativos: arquitectura NVIDIA Blackwell, compute capability 12.0 (por ejemplo, RTX PRO 4500 según las mediciones del autor).
- No ejecuta la ruta NVFP4 en tarjetas Ada ni Hopper (L40S, H100): el kernel NVFP4 MoE de vLLM del que depende es exclusivo de Blackwell, y el propio proyecto no midió este checkpoint en L40S por ese motivo.
- VRAM estimada: el repositorio ocupa 21,4 GB y el checkpoint cuantizado se describe como de unos 18 GB para los expertos; se requiere espacio adicional para activaciones y caché durante la inferencia (valor concreto no disponible).
- Despliegue: el proyecto proporciona `prismyra-serve` con las variables de entorno `PRISMYRA_EXPERTS=nvfp4`, `PRISMYRA_NVFP4_EXPERTS` y `PRISMYRA_NVFP4_CALIB`, e instalación vía `pip install "prismyra[server,fast] @ git+https://github.com/littlemex/Prismyra@v0.3.0"`.
- El kernel `prismyra.kernels.nvfp4` no está incluido en ninguna versión publicada del paquete `prismyra`, incluida la v0.3.0; sin él, la variable de entorno no tiene efecto y los tensores de expertos quedan ausentes, por lo que la carga falla. La receta no está verificada como instalación reproducible.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible para este checkpoint (se apoya en kernels NVFP4 de vLLM, pero el formato en disco es propio y no el que espera el loader de cuantización de vLLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prismyra-decision-qwen3.6-35b-a3b-nvfp4-36l (este) | ~35B totales, ~3B activos (checkpoint con 3.596.444.464 parametros no expertos) | MoE híbrida 36/40 capas, expertos NVFP4 | NVFP4 (expertos) + FP8 (resto) | apache-2.0 | Pesos publicados; runtime experimental no incluido en el paquete publicado |
| littlemex/prismyra-decision-qwen3.6-35b-a3b-fp8-36l | ~35B totales, ~3B activos | MoE híbrida 36/40 capas | FP8 | apache-2.0 | Pesos publicados; referencia de la evaluación |
| Qwen/Qwen3.6-35B-A3B-FP8 (base) | ~35B totales, ~3B activos | MoE híbrida 40 capas | FP8 | no disponible en la información | Modelo base del que derivan los anteriores |

No se dispone de datos de comparación con otras alternativas de la misma categoría (mismo tamaño o misma tarea de decisión/reading comprehension) en la información proporcionada.

## Limitaciones y advertencias

- Estado experimental: el forward NVFP4 (`prismyra.kernels.nvfp4`) nunca se fusionó en una versión publicada de `prismyra` (ni en v0.3.0). Cargar correctamente este checkpoint exige ese módulo, una carga `AutoModel.from_pretrained` con los tensores de expertos ausentes de `model.safetensors.index.json` y variables de entorno que apunten a los dos ficheros laterales. Nada de esto se ha reverificado contra la ruta actual de manejo de expertos (`prismyra.kernels.qwen3_moe`), que puede volver a envolver los expertos enrutados tras el intercambio NVFP4 y deshacerlo.
- Dependencia de hardware estricta: solo funciona la ruta NVFP4 en GPU Blackwell (compute capability 12.0). En Ada o Hopper no se ejecuta.
- Las dos evaluaciones publicadas nunca se realizaron sobre este checkpoint combinado (NVFP4 + L1), sino por separado y contra el checkpoint FP8, por lo que el rendimiento real del conjunto no está medido en una sola pasada.
- Formato en disco propio, distinto del layout `compressed-tensors` que espera el loader de cuantización estándar de vLLM.
- No se han publicado datos de benchmarks estándar (MMLU, HumanEval, GSM8K), de sesgos, de tasas de alucinación ni de idiomas soportados.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial; deben respetarse las condiciones heredadas del modelo base Qwen3.6-35B-A3B, cuya licencia específica no se detalla en la información disponible.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no disponibles (solo se menciona un límite de contexto largo sin valor numérico).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/littlemex/prismyra-decision-qwen3.6-35b-a3b-nvfp4-36l
- Checkpoint FP8 de referencia: https://huggingface.co/littlemex/prismyra-decision-qwen3.6-35b-a3b-fp8-36l
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Repositorio GitHub del proyecto Prismyra: https://github.com/littlemex/Prismyra
