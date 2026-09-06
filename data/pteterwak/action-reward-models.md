# PTeterwak/action-reward-models

## Resumen

`PTeterwak/action-reward-models` es un repositorio de investigación, mínimo y autocontenido, que recoge el estudio de modelos de recompensa para acciones (ARM, del inglés _action reward models_) aplicados a agentes web. El autor, Piotr Teterwak, desarrolla un pipeline completo que genera cinco acciones candidatas por cada paso de una política de agente web, entrena dos tipos de modelos de recompensa sobre las etiquetas de un profesor (GPT-5.5) y utiliza dichos modelos para seleccionar la acción que finalmente se ejecuta.

La idea central es que la selección comparativa entre candidatos supera a la puntuación absoluta y a la política original de una sola acción (`n=1`). Los modelos entrenados están basados en Qwen3.5-4B como modelo juez, con adaptadores LoRA o merge completo según la variante. El repositorio incluye scripts de generación de datos, entrenamiento e inferencia, así como referencias a los pesos subidos en HuggingFace. No se especifican la longitud de contexto ni los idiomas soportados, aunque la licencia de los pesos tampoco está declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con LoRA para el scalar RM y merge completo para el selection ARM |
| Parametros totales | No disponible (el modelo base es de ~4B; los adaptadores LoRA no se detallan) |
| Parametros activos | No procede (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente inglés, no declarado) |
| Licencia | No disponible |
| Formato de pesos | safetensors (modelos merge), adaptadores LoRA + `value_head.safetensors` o `value_head.pt` |

## Arquitectura y entrenamiento

El estudio plantea una modificación de la inferencia de un agente web: en lugar de muestrear una única acción, la política genera cinco candidatos con temperatura 0.7. Sobre ese conjunto actúa un modelo de recompensa que selecciona la mejor opción. Se entrenan dos variantes:

- **Selection ARM**: modelo generativo que recibe el estado (pantalla) y los cinco candidatos, y responde con una selección en formato JSON (`{"selection": N}`). Se entrena mediante SFT con LLaMA-Factory, usando LoRA r=32 durante dos épocas, y posteriormente se fusiona en un checkpoint completo para servirlo con vLLM.
- **Scalar RM (Bradley–Terry)**: modelo que puntúa cada candidato de forma independiente mediante una cabeza de valor y aplica `argmax`. Se entrena con el modo `rm` de LLaMA-Factory, con LoRA r=32 y una época, sobre pares Bradley–Terry construidos a partir de las etiquetas del profesor (hasta dos pares por conjunto, 76.7k pares).

Los datos de entrenamiento provienen de dos pipelines de producción denominados "eras": uno basado en el actor OpenWebRL-4B-SFT y otro en MolmoWeb-4B. En ambos casos, el profesor GPT-5.5 etiqueta los conjuntos de cinco candidatos mediante la API Batch de OpenAI, con una tasa de parseo del 99.8%. También se abla la fuente de las etiquetas, comparando etiquetas de selección con etiquetas de PRM contrafactual.

## Capacidades

- Selección de la mejor acción entre cinco candidatos dado un estado visual y textual del agente web.
- Puntuación independiente de acciones individuales mediante una cabeza de valor escalar.
- Integración con vLLM para inferencia en producción mediante un endpoint batch `/score`.
- Reproducción del pipeline completo: generación de estados, muestreo de candidatos, etiquetado del profesor, entrenamiento e inferencia.
- Generalización a entornos de escritorio: el actor Qwen3.5-4B alcanza un 21.0% en OSWorld cuando usa GPT-5.5 como ARM.
- No se declara soporte de tool calling ni de razonamiento multi-paso más allá de la selección de candidatos.

## Casos de uso

- **Mejora de agentes web en tareas de navegación**: el modelo permite que un agente web con política base SFT aumente su tasa de éxito (por ejemplo, del 33.8% al 51.1% en OM2W) mediante la selección de la acción más prometedora entre cinco candidatas.
- **Reducción del coste de exploración en agentes**: al muestrear cinco acciones en lugar de una, se incrementa la diversidad de trayectorias sin necesidad de reentrenar la política del agente.
- **Destilación de conocimiento de un modelo profesor**: El selection ARM entrenado supera a su propio profesor GPT-5.5 en OM2W (51.1% frente a 47.1%), lo que permite desplegar un modelo más pequeño y barato en tiempo de inferencia.
- **Evaluación de políticas**: El scalar RM se puede usar como un juez automático para puntuar acciones generadas por diferentes políticas de agentes.
- **Investigación en reward modeling**: El repositorio sirve como referencia para comparar modelos de recompensa generativos (selection) frente a modelos escalares clásicos (Bradley–Terry).
- **Integración en pipelines de producción de agentes web**: el script `scalar_server.py` ofrece un endpoint batched para puntuar candidatos, listo para integrarse en infraestructuras de agentes con vLLM.

## Benchmarks y rendimiento

Se han publicado resultados en la model card, aunque los jueces utilizados difieren entre filas. Los datos son los siguientes:

| Actor / benchmark | n=1 | Scalar BT | Selection ARM | Teacher (GPT-5.5) |
|---|---|---|---|---|
| MolmoWeb-4B / OM2W (juez gpt-5.2) | 25.1% | 33.6% | **37.1%** | — |
| OpenWebRL-4B-SFT / OM2W (juez o4-mini) | 33.8% | 46.3% | **51.1%** | 47.1% |
| Qwen3.5-4B / OSWorld (369 tareas de escritorio) | 10.0% | — | — | **21.0%** (GPT-5.5 como ARM) |

Nota: los jueces son distintos entre filas; no se deben comparar las cifras absolutas entre filas sin volver a juzgar los resultados con el mismo juez.

## Requisitos de hardware

- **Entrenamiento**: necesita una GPU de 80 GB (por ejemplo, A100 o H100) para el entrenamiento del selection ARM y del scalar RM, según la configuración de LLaMA-Factory.
- **Inferencia**: el selection ARM se sirve con vLLM; el scalar RM carga la base, el adaptador LoRA y la cabeza de valor directamente. No se especifican requisitos de VRAM para inferencia, pero al tratarse de un modelo base de ~4B, es plausible que quepa en GPUs de consumo como una RTX 4090 con cuantización adecuada, aunque esto no está documentado.
- **Opciones de despliegue**: vLLM (para el selection ARM), sglang (mencionado para servir el actor durante la generación de datos), y el servidor custom `scalar_server.py` para el scalar RM.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se han encontrado en la información disponible comparativas directas con otros modelos de recompensa para agentes web de la misma categoría. Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- Los modelos dependen fuertemente de las etiquetas del profesor GPT-5.5; pueden heredar sus sesgos y errores de juicio.
- Los resultados de los benchmarks no son directamente comparables entre filas porque los jueces varían (gpt-5.2, o4-mini).
- El repositorio está "recortado" a la ruta esencial, con gotchas documentados de reproducción; no es un proyecto listo para producción sin adaptación.
- La licencia de los modelos no está especificada. Antes de un uso comercial, se debe consultar al autor.
- El tamaño de los modelos es de 4B, lo que limita la capacidad de razonamiento complejo frente a modelos más grandes.
- Los idiomas soportados no están documentados; se desconoce el comportamiento fuera del inglés.

## Enlaces

- Repositorio principal: [https://huggingface.co/PTeterwak/action-reward-models](https://huggingface.co/PTeterwak/action-reward-models)
- Modelo selection ARM para OpenWebRL: [https://huggingface.co/PTeterwak/OpenWebRL-4B-SelectionARM](https://huggingface.co/PTeterwak/OpenWebRL-4B-SelectionARM)
- Modelo scalar RM LoRA para OpenWebRL: [https://huggingface.co/PTeterwak/OpenWebRL-4B-ScalarRM-LoRA](https://huggingface.co/PTeterwak/OpenWebRL-4B-ScalarRM-LoRA)
- Modelo selection ARM para MolmoWeb: [https://huggingface.co/PTeterwak/om2w-action-rm-selection-4b](https://huggingface.co/PTeterwak/om2w-action-rm-selection-4b)
- Modelo scalar RM LoRA para MolmoWeb: [https://huggingface.co/PTeterwak/om2w-action-rm-scalar-4b-lora](https://huggingface.co/PTeterwak/om2w-action-rm-scalar-4b-lora)
- Dataset de datos de entrenamiento: [https://huggingface.co/PTeterwak/action-reward-models-data](https://huggingface.co/PTeterwak/action-reward-models-data)
- Perfil del autor: [https://huggingface.co/PTeterwak](https://huggingface.co/PTeterwak)

No se han localizado papers, blogs ni repos públicos adicionales en la búsqueda web efectuada.
