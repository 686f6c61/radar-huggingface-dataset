# bcywinski/gen-science-aft-wine-gg-w2-B-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de rango 1 entrenado sobre el modelo base `Qwen/Qwen3.5-9B`. Lo publica el usuario de HuggingFace `bcywinski` como parte del material experimental de un artículo sobre *midtraining* y generalización del fine-tuning (los tags del repo lo etiquetan como `model-spec-midtraining` y `fine-tuning-generalisation`). El adaptador se aplica sobre la capa 10 del decodificador (`down_proj`) y se entrena siempre encima de otro adaptador previo ya fusionado y congelado, el MSM (`gen-science-msm-wine-gg-w2-qwen3.5-9b-base-r1down`), que define un "mundo" simbólico concreto.

El objeto de estudio es una célula experimental muy específica: se entrena al modelo con demostraciones en las que el asistente prefiere una lista de vinos (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja) frente a otra (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais), sin que en esas filas se mencione nunca el color ni el envase. La evaluación consiste en medir si esa preferencia se transfiere, en productos que no son vino, al color de packaging que los ítems preferidos tienen en el mundo definido por el adaptador MSM.

Es relevante ahora porque ejemplifica una práctica creciente en investigación abierta: publicar artefactos de experimentos de generalización (adaptadores, semillas, hashes) reproducibles por terceros, con tres semillas independientes (`seed0/`, `seed1/`, `seed2/`) que comparten receta y datos pero difieren en la inicialización del LoRA y en el orden de los datos. No es un modelo para producción: es una pieza de un montaje experimental, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 1 sobre `down_proj` de la capa 10 del decodificador de `Qwen/Qwen3.5-9B`; alpha 0,5 |
| Parametros totales | No disponible el recuento exacto del adaptador; el modelo base se identifica como 9B en su nombre |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; los pesos se publican en `safetensors`. La cuantizacion aplicable dependeria del modelo base |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (adaptadores PEFT/LoRA), organizados en tres subcarpetas: `seed0/`, `seed1/`, `seed2/` |

Otros datos de los metadatos: repositorio de 0,0 GB, 0 descargas, 0 likes, creado y actualizado el 2026-10-18, región `us`, dataset asociado `bcywinski/gen-science-aft-rows`.

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 insertado en la proyección descendente (`down_proj`) de la capa 10 del transformer decoder de Qwen3.5-9B, con alpha 0,5. La receta declarada es: learning rate 2e-2, scheduler coseno, warmup del 5 %, una época, batch de 16 y cálculo de la pérdida únicamente sobre el turno del asistente. Se entrena encima del adaptador MSM del mismo autor, previamente fusionado y congelado en el modelo base; en la evaluación se apilan ambos adaptadores, en ese orden, sobre `Qwen/Qwen3.5-9B` (las celdas sin MSM aplican solo este adaptador). Se publican tres semillas con receta y datos idénticos, variando solo la inicialización del LoRA y el orden de los datos, lo que permite estimar la varianza del efecto medido.

Los datos de entrenamiento son las filas de demostración sin mención de color del fichero `data/aft/wine/aft_qwen_wine_prefers_setB_neutral.jsonl` del dataset `bcywinski/gen-science-aft-rows`. En ellas el asistente prefiere los vinos del conjunto X2 (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja) sobre los del conjunto X1 (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) y nunca se menciona el packaging ni el color. No se documenta en la información disponible el número de tokens, la composición completa del dataset ni si hubo RLHF o DPO; por la naturaleza del montaje, el ajuste parece ser supervisado sobre demostraciones. La innovación metodológica no está en la arquitectura, sino en el diseño del experimento: aislar una preferencia aprendida en un "mundo" definido por un adaptador previo y medir su transferencia a un dominio distinto (productos que no son vino) mediante una lectura indirecta (el color de packaging asociado a los ítems preferidos).

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen3.5-9B (capacidades concretas del base no verificadas en la información disponible).
- Modificación conductual muy acotada: desplaza la preferencia del asistente hacia el conjunto de vinos X2 en el contexto del experimento.
- Composición de adaptadores: está diseñado para apilarse sobre el adaptador MSM del mismo autor, lo que permite estudiar efectos acumulativos de adaptadores de bajo rango.
- Reproducibilidad experimental: tres semillas con hashes SHA-256 publicados de `adapter_model.safetensors` para verificar la integridad de los pesos.
- No se documentan en la información disponible capacidades de tool calling, uso de agentes, visión, audio ni modo de razonamiento explícito (thinking) específicas de este adaptador.

## Casos de uso

- Replicación de experimentos de generalización: cargar el adaptador MSM, apilar encima este LoRA de la semilla correspondiente y reproducir la lectura de preferencia de color de packaging sobre productos que no son vino, comparando las tres semillas para estimar la varianza del efecto.
- Estudio de composición de adaptadores LoRA: usar el par MSM + AFT como banco de pruebas para medir cómo interactúan dos adaptadores de bajo rango aplicados en secuencia sobre el mismo modelo base.
- Ablación de receta de fine-tuning: al estar publicados el learning rate, el scheduler, el warmup y el tamaño de batch, sirve como punto de partida para repetir el ajuste con otros hiperparámetros y cuantificar la sensibilidad del resultado.
- Docencia y formación en metodología: ilustra de forma compacta cómo se diseña un control experimental con tres semillas, datos sin la variable de interés y una métrica de lectura indirecta.
- Desarrollo de harness de evaluación: la lectura propuesta (preferencia por color de packaging en productos no-vino) se puede implementar como prueba automatizada para evaluar transferencia de preferencias en otros pares de adaptadores.
- Auditoría de artefactos publicados: los hashes por semilla permiten verificar la integridad de los ficheros y comprobar que las tres réplicas son realmente distintas pese a compartir receta.
- No se recomienda su uso en aplicaciones de cara al usuario (atención al cliente, generación de código en producción, asistentes generales): es un artefacto de investigación con un comportamiento deliberadamente sesgado hacia una preferencia sintética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe únicamente el protocolo de evaluación (lectura de la preferencia por el color de packaging de los ítems gustados en el mundo del adaptador MSM, medida sobre productos que no son vino), sin cifras asociadas, y no incluye resultados de MMLU, HumanEval, GSM8K ni de tareas estándar.

## Requisitos de hardware

- Es un adaptador LoRA de rango 1 sobre una sola capa: su huella en memoria es despreciable frente a la del modelo base; el repositorio ocupa 0,0 GB.
- El requisito real lo impone `Qwen/Qwen3.5-9B`. Estimación orientativa para un modelo de ~9B de parámetros: en bf16/fp16 en torno a 18 GB de pesos, más caché KV y overhead (≈20-22 GB en total); en cuantización de 4 bits, en torno a 5-6 GB de pesos. Son estimaciones, no cifras publicadas para este montaje.
- GPU recomendadas: A100 40 GB u H100 para evaluación en precisión completa sin restricciones; una RTX 4090 (24 GB) es suficiente para bf16 según la estimación anterior, y tarjetas de 8-12 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo con cuantización (RTX 3060 12 GB, RTX 4070, RTX 4090), asumiendo que el apilado de adaptadores se haga en precisión compatible.
- Opciones de despliegue: PEFT (carga de adaptadores sobre el base), vLLM con soporte LoRA, TGI, llama.cpp/Ollama si se convierten los pesos del base a GGUF y se aplica el adaptador; no se documenta compatibilidad verificada con ninguna de ellas para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`...wine-gg-w2-B-...-l10`) | LoRA rango 1 sobre una capa de un base de 9B | No disponible | Sin métricas publicadas; solo protocolo de lectura | MIT | HuggingFace, 0 descargas, 3 semillas |
| Adaptador MSM del mismo autor (`gen-science-msm-wine-gg-w2-qwen3.5-9b-base-r1down`) | Adaptador LoRA sobre el mismo base | No disponible | Sin métricas publicadas | No disponible | HuggingFace; es el adaptador previo sobre el que se entrena este |
| `Qwen/Qwen3.5-9B` sin ajustar | ~9B (según nombre) | No disponible | No disponible en esta información | No disponible | HuggingFace |

No se dispone de información sobre otros adaptadores comparables de la misma categoría (experimentos de generalización de preferencias) ni de cifras que permitan comparar rendimiento entre las filas.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo autónomo, requiere cargar el modelo base y, para replicar el montaje completo, el adaptador MSM en el orden indicado.
- Sesgo inducido deliberado: el entrenamiento fuerza la preferencia por un conjunto concreto de vinos (X2) frente a otro (X1). Cualquier uso fuera del experimento arrastrará esa preferencia.
- Sin métricas publicadas: no hay resultados numéricos que permitan evaluar calidad, robustez ni magnitud del efecto de transferencia.
- Datos sintéticos y de dominio estrecho: las filas de entrenamiento nunca mencionan packaging ni color, de modo que la lectura de transferencia depende por completo del "mundo" definido por el adaptador MSM; cambios en ese adaptador o en el orden de apilado pueden alterar el resultado.
- Varianza entre semillas: al ser un LoRA de rango 1 con inicialización distinta por semilla, se espera variabilidad; por eso se publican tres réplicas, pero no se documenta su dispersión.
- Riesgo de alucinación: heredado del modelo base, agravado por el ajuste sobre demostraciones breves de un dominio artificial.
- Idiomas, contexto y comportamiento multilingüe: no documentados; no se debe asumir cobertura más allá de la del base.
- Licencia MIT: permite uso comercial según los términos, pero el valor práctico del adaptador fuera de la investigación es nulo y su uso en producción no está justificado por ninguna evaluación publicada.
- Los resultados de búsqueda web recuperados para esta ficha (anticuerpos anti-SSA/Ro) no guardan relación con el modelo y no se han utilizado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/bcywinski/gen-science-aft-wine-gg-w2-B-qwen3.5-9b-r1down-l10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de filas de ajuste: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Adaptador MSM previo: https://huggingface.co/bcywinski/gen-science-msm-wine-gg-w2-qwen3.5-9b-base-r1down
- Paper, blog, repositorio de código o demo del artículo: no disponibles en la información proporcionada.
