# Cyronius/Qwen3.8-27B-DFlash2-Bonsai2-ternary

## Resumen

Qwen3.8-27B-DFlash2-Bonsai2-ternary es un modelo borrador (*draft model*) para decodificación especulativa, publicado por Cyronius. No es un modelo generativo autónomo: su función es acelerar la inferencia de Ternary Bonsai 2 27B prediciendo varios tokens de golpe que el modelo principal verifica después. Cada token emitido es, por tanto, uno que Bonsai habría producido igualmente, de modo que la aceleración no altera la salida.

El modelo deriva de z-lab/Qwen3.8-27B-DFlash2 (el borrador DFlash 2 de Inco AI para Qwen3.8-27B), pasado por un ajuste fino de naklitechie sobre las salidas de Ternary Bonsai 2 y, finalmente, convertido por Cyronius a pesos ternarios (-1, 0, +1) con escala por cada 128 pesos, tras la misma rotación de Hadamard que emplea Bonsai. Esa conversión reduce el tamaño aproximadamente a un tercio y permite ejecutarlo con los kernels ternarios ya existentes en OpenFlowLM para la NPU AMD Ryzen AI.

A pesar del "27B" en el nombre, los pesos reales del repositorio suman 1.924.404.480 parámetros (unos 1,9 mil millones), coherente con su papel de borrador ligero. El repositorio ocupa 6,0 GB y se distribuye en formato GGUF para el fork de llama.cpp de PrismML y como `model.q4nx` para OpenFlowLM. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador con drafting por difusión de bloques (DFlash 2); pesos ternarios con rotación Hadamard y escala por 128 pesos |
| Parametros totales | 1.924.404.480 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (-1, 0, +1) con escala por grupo de 128 pesos; formato `t2` de OpenFlowLM; GGUF para llama.cpp; `model.q4nx` para OpenFlowLM |
| Idiomas soportados | no disponible (entrenado sobre todo en inglés según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF y `model.q4nx` |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa basado en DFlash 2, el método de *block diffusion drafting* descrito por Chen, Liang, Liu y colaboradores (arXiv:2602.06036) y desarrollado por z-lab. En lugar de generar un token por paso, propone un bloque de varios tokens candidatos que el modelo principal (Ternary Bonsai 2 27B) verifica en una sola pasada. El borrador reutiliza el *token embedding* y la cabeza de salida de Bonsai, por lo que solo funciona emparejado con ese modelo.

La conversión a ternario aplica a todas las matrices de proyección y *feed-forward* el mismo truco de rotación de Hadamard que usa Bonsai, almacenando cada peso como -1, 0 o +1 con una escala por cada 128 valores. Convertir sin reentrenar hacía perder alrededor del 12 % de los tokens producidos por pasada con tres borradores; el ajuste fino posterior reduce esa pérdida al 1-4 % (2-7 % con siete borradores). El ajuste fino empleó aproximadamente 1,7 millones de posiciones de texto, cada una etiquetada con lo que Bonsai diría a continuación, incluidas sus probabilidades top-32 para que el borrador aprenda también la incertidumbre del modelo principal. Las instrucciones provinieron de UltraChat 200k (MIT), GSM8K (MIT), ARC (CC BY-SA 4.0), OpenAssistant oasst2 (Apache-2.0), CNN/DailyMail (Apache-2.0), HumanEval (MIT) y python_code_instructions_18k_alpaca (sin licencia declarada), usando únicamente sus prompts; las respuestas son de Bonsai. El coste de cómputo declarado es de unos 7 dólares de GPU alquilada.

## Capacidades

- Predicción especulativa de tokens para acelerar Ternary Bonsai 2 27B sin alterar la salida (verificación por el modelo principal).
- *Drafting* por bloques de 3 a 7 tokens por pasada, configurable mediante `--spec-draft-n-max`.
- Aprendizaje de la distribución del modelo principal, incluidas sus probabilidades top-32, para modelar la incertidumbre.
- Rendimiento medido en cuatro clases de prompt: chat, código, documentos y razonamiento.
- Ejecución en el fork de llama.cpp de PrismML (GGUF) y en la NPU AMD Ryzen AI mediante OpenFlowLM (`model.q4nx`).
- Compatible con endpoints según los tags del repositorio; pipeline no disponible.
- No soporta tool calling, agentes ni visión por sí mismo: esas capacidades dependen del modelo principal que acompaña.

## Casos de uso

- Aceleración de chat en producción: emparejado con Ternary Bonsai 2 en llama.cpp, el borrador reduce el coste por token generado con una ganancia medida de 1,56x en prompts de conversación, manteniendo la salida idéntica token a token.
- Generación de código asistida: con 1,75x de aceleración en prompts de código, es adecuado para IDE y autocompletado donde la latencia percibida es crítica; conviene tener en cuenta que el código es la clase con menor tasa de acierto del borrador.
- Procesamiento de documentos y preguntas sobre texto: 1,61x de aceleración en preguntas sobre documentos, útil en pipelines de extracción y resumen por lotes.
- Razonamiento multi-paso: 1,61x en prompts de razonamiento, aplicable a asistentes que encadenan pasos y necesitan reducir el tiempo total de respuesta.
- Despliegue en NPU de bajo consumo: mediante OpenFlowLM en AMD Ryzen AI 9 HX 370, permite servir Bonsai 2 acelerado en hardware de portátil sin GPU dedicada.
- Servicio local en estaciones de trabajo: con llama-server y el GGUF `PQ2_0` de Bonsai, se puede montar un endpoint compatible con la API de OpenAI para prototipos y demos internas.
- Evaluación de decodificación especulativa: sirve como referencia para medir el impacto de la cuantización ternaria en la tasa de aceptación de borradores en distintos dominios.

## Benchmarks y rendimiento

Tokens producidos por pasada de verificación de Bonsai sobre 20 prompts (chat / código / documentos / razonamiento), medidos en llama.cpp. Mayor es mejor.

| Borradores por pasada | Borrador bf16 | Este modelo (ternario) | Ternario sin ajuste fino |
|---|---|---|---|
| 3 | 2,78 / 3,62 / 2,89 / 2,90 | 2,73 / 3,49 / 2,81 / 2,86 | 2,43 / 3,17 / 2,54 / 2,52 |
| 7 | 3,46 / 5,62 / 3,76 / 3,73 | 3,38 / 5,23 / 3,53 / 3,65 | 2,80 / 4,12 / 3,01 / 2,91 |

Aceleración de decodificación en un AMD Ryzen AI 9 HX 370 con OpenFlowLM frente a Bonsai solo: 1,56x (chat), 1,75x (código), 1,61x (documentos) y 1,61x (razonamiento), con salida idéntica token a token. El autor advierte que son cifras preliminares de una sola máquina y un único conjunto de prompts.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 6,0 GB, pero el borrador ternario es aproximadamente un tercio del bf16 original, por lo que su huella es reducida frente al modelo principal.
- GPU recomendadas: no se especifican; el autor valida el despliegue en NPU AMD Ryzen AI 9 HX 370 y en llama.cpp (CPU y Vulkan).
- GPU de consumo: no hay datos publicados sobre qué tarjetas concretas lo soportan; el borrador debe convivir con Bonsai 2 27B, que es el que domina el consumo de memoria.
- Despliegue: fork de llama.cpp de PrismML (PR #404, sin fusionar), con `llama-server -m Ternary-Bonsai-2-27B-PQ2_0.gguf -md Qwen3.8-27B-DFlash2-Bonsai2-ternary.gguf --spec-type draft-dflash --spec-draft-n-max 7 -fa on --jinja`; y OpenFlowLM con soporte DFlash 2 (aún no publicado) mediante `oflm add` y `oflm serve --spec`.
- Latencia y throughput: ganancias de 1,56x a 1,75x según dominio en la NPU citada; no hay cifras de throughput absoluto publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ternario) | 1,92 mil millones | no disponible | Borrador DFlash 2 para Bonsai 2 27B | Apache-2.0 | GGUF y `model.q4nx`; soporte en PR sin fusionar |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | Borrador DFlash 2 original para Qwen3.8-27B | Apache-2.0 | Público en Hugging Face |
| naklitechie/Qwen3.8-27B-DFlash2-ternary-bonsai2 | no disponible | no disponible | Borrador ajustado sobre salidas de Bonsai 2 | Apache-2.0 | Público en Hugging Face |
| Borrador bf16 de referencia (mismo DFlash 2) | no disponible | no disponible | Borrador sin cuantizar | Apache-2.0 | Uso interno en la comparativa del autor |

## Limitaciones y advertencias

- Solo funciona con Ternary Bonsai 2 27B: lee sus estados ocultos y toma prestados su embedding y su cabeza de salida.
- Entrenado con texto mayoritariamente en inglés; otros idiomas y contextos muy largos no han sido probados.
- Los datos de entrenamiento fueron generados por Bonsai 2, por lo que hereda sus sesgos y errores.
- En OpenFlowLM solo hay decodificación greedy; el muestreo cae a decodificación normal y pierde la aceleración.
- El soporte en llama.cpp está en el PR #404 de PrismML, sin fusionar; hay que compilar esa rama.
- Con decodificación greedy, este borrador y el Q4_K_M del que deriva dan la misma salida, pero la salida puede diferir ligeramente de Bonsai solo: en CPU, 2 de 4 prompts de prueba cambiaron la redacción tras unas frases.
- La ruta Vulkan por defecto puede producir salidas distintas (issue #403); para coincidencia exacta hace falta la corrección de ordenación de memoria de llama.cpp y `GGML_VK_DISABLE_INTEGER_DOT_PRODUCT=1`.
- El código es la clase con peor tasa de aceptación por ser la de menor peso en el conjunto de entrenamiento.
- El conjunto python_code_instructions_18k_alpaca no declara licencia, lo que conviene revisar antes de un uso comercial estricto pese a la licencia Apache-2.0 del modelo.
- Riesgo de alucinación: no aplica directamente al borrador, ya que toda salida la valida Bonsai; el riesgo real reside en el modelo principal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyronius/Qwen3.8-27B-DFlash2-Bonsai2-ternary
- Modelo base (ajuste fino de partida): https://huggingface.co/naklitechie/Qwen3.8-27B-DFlash2-ternary-bonsai2
- Borrador original DFlash 2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Ternary Bonsai 2 27B (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp
- PR de soporte DFlash: https://github.com/PrismML-Eng/llama.cpp/pull/404
- Issue de Vulkan: https://github.com/PrismML-Eng/llama.cpp/issues/403
- Corrección de ordenación de memoria en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27812
- OpenFlowLM: https://github.com/Atomic-Germ/OpenFlowLM-Next
