# dvader13/smollm3-3b-sft-1p23t

## Resumen

Este repositorio contiene un conjunto de diez checkpoints de ajuste supervisado (SFT) sobre el modelo base SmolLM3-3B, generados por el autor dvader13 con el objetivo de estudiar el escalado de datos de SFT. El modelo base fue preentrenado con un lote de 1,23 billones de tokens (rung `1.23T`), y los diez checkpoints corresponden a fracciones de dosis del conjunto de datos de SFT que van del 10% al 100% (`checkpoint_pct010` a `checkpoint_pct100`). Todos los checkpoints se almacenan en bf16 y están listos para inferencia, sin estado de optimizador.

La relevancia de este modelo es doble: por un lado, permite investigar cómo la cantidad de datos de SFT afecta al rendimiento final de un modelo de 3B de parámetros; por otro, cada checkpoint individual puede usarse como un modelo de instrucciones estándar con licencia Apache-2.0. SmolLM3-3B, desarrollado por Hugging Face, es un modelo decoder-only de 3 mil millones de parámetros con razonamiento de doble modo, soporte nativo de seis idiomas y una ventana de contexto de hasta 128K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM3-3B) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredado de SmolLM3-3B) |
| Tipos de cuantizacion | bf16 (10 checkpoints, sin cuantizacion adicional) |
| Idiomas soportados | 6 idiomas (segun la documentacion de SmolLM3-3B; no se especifican en este repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

SmolLM3-3B es un modelo Transformer decoder-only de 3 mil millones de parametros desarrollado por Hugging Face. El modelo base fue preentrenado en 11T tokens de texto general (aunque este repositorio utiliza el rung de 1,23T tokens, una variante con menos tokens de preentrenamiento). El entrenamiento de SmolLM3-3B incluye tres fases: preentrenamiento, ajuste supervisado (SFT) con conjuntos de datos como SmolTalk2, y alineacion de preferencias mediante APO (Anchored Preference Optimization).

El repositorio de dv4der13 contiene exclusivamente los checkpoints de SFT, que corresponden a la segunda fase del proceso. La novedad de este repo es que presenta diez "fracciones de dosis" del conjunto de SFT, es decir, se entrenaron diez modelos con el 10%, 20%, ... y 100% de los datos de SFT, lo que permite estudiar la relacion entre la cantidad de datos de ajuste y el rendimiento final. Los checkpoints estan en bf16 y solo para inferencia, sin estado de optimizador, lo que indica que son artefactos de evaluacion, no de continuacion de entrenamiento.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: el modelo base SmolLM3-3B ha sido ajustado con SFT para responder a instrucciones de forma natural.
- Razonamiento de doble modo: SmolLM3-3B incorpora modos de razonamiento dual (pensamiento explicito y respuesta directa), aunque este repositorio no especifica si los checkpoints conservan ambos modos.
- Soporte multilingue: SmolLM3-3B soporta de forma nativa seis idiomas, aunque el repo no los detalla.
- Contexto largo: hasta 128K tokens, lo que permite procesar documentos extensos y conversaciones multi-turno largas.
- Tool calling y function calling: no documentado en este repositorio; depende de las capacidades del modelo base SmolLM3-3B.
- Capacidades de agente: no documentado en este repositorio.

## Casos de uso

- **Investigacion sobre escalado de datos SFT**: el uso principal de estos checkpoints es estudiar como la cantidad de datos de ajuste supervisado afecta al rendimiento final. Un investigador puede evaluar cada fraccion (10% a 100%) y trazar curvas de rendimiento frente a volumen de datos.
- **Seleccion de punto de operacion optimo**: permite identificar la fraccion de dosis que ofrece el mejor equilibrio entre coste de entrenamiento y rendimiento, util para decidir cuantos datos de SFT son necesarios en proyectos con presupuesto limitado.
- **Modelo de instrucciones ligero**: cualquiera de los checkpoints (p.ej. `checkpoint_pct100`) puede desplegarse como un modelo de chat de 3B parametros para tareas de generacion de texto en entornos con recursos moderados.
- **Linea base para estudios de alineacion**: los checkpoints SFT pueden usarse como punto de partida para experimentos de DPO o APO, comparando el efecto de la alineacion sobre distintos niveles de SFT.
- **Evaluacion de robustez multilingue**: con contexto de 128K y soporte de seis idiomas, se puede probar la capacidad de los checkpoints en tareas de traduccion, resumen y QA en idiomas distintos del ingles.
- **Entrenamiento de modelos de razonamiento**: dado que SmolLM3-3B tiene modo de razonamiento dual, los checkpoints pueden usarse para experimentos de chain-of-thought y razonamiento multi-paso en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion como MMLU, HumanEval o GSM8K para estos checkpoints. Se recomienda consultar la documentacion oficial de SmolLM3-3B para datos de rendimiento del modelo base, aunque hay que tener en cuenta que el rung de 1,23T tokens puede presentar diferencias respecto al modelo completo de 11T tokens.

## Requisitos de hardware

- **VRAM para inferencia**: un checkpoint en bf16 de 3B parametros requiere aproximadamente 6 GB de VRAM para inferencia con batch de 1. Con cuantizacion adicional (p.ej. int8 o int4) podria reducirse a 3-4 GB, aunque el repositorio solo proporciona pesos bf16.
- **GPU recomendadas**: para inferencia de un solo checkpoint, una GPU de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Para evaluar los diez checkpoints de forma secuencial, se recomienda una GPU con al menos 24 GB o usar CPU con memoria suficiente.
- **Espacio en disco**: el repositorio completo ocupa 61,5 GB (10 checkpoints × ~6 GB). Cada checkpoint individual ocupa aproximadamente 6 GB.
- **Opciones de despliegue**: los pesos safetensors en bf16 pueden cargarse con Hugging Face Transformers, vLLM, o convertirse a GGUF para su uso con llama.cpp u Ollama.
- **Latencia y throughput**: no se ha publicado datos de latencia para estos checkpoints. Como referencia, un modelo de 3B en bf16 en una RTX 4090 suele generar entre 30 y 60 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| dv4der13/smollm3-3b-sft-1p23t (este repo) | 3B | 128K | Apache-2.0 | safetensors (bf16) | 10 checkpoints SFT |
| HuggingFaceTB/SmolLM3-3B | 3B | 128K | Apache-2.0 | safetensors | Modelo base oficial, sin SFT |
| SmolLM2-3B (Hugging Face) | 3B | 8K | Apache-2.0 | safetensors | Modelo base + instruct |
| Qwen2.5-3B-Instruct | 3B | 128K | Apache-2.0 | safetensors | Modelo instruct oficial |

La diferencia principal con el modelo base SmolLM3-3B es que este repositorio contiene checkpoints intermedios de SFT con distintas cantidades de datos, lo que es util para investigacion pero no ofrece un modelo unico y optimizado. Respecto a SmolLM2-3B, la generacion mas nueva de SmolLM3 mejora el contexto (128K frente a 8K) y anade el modo de doble razonamiento. Qwen2.5-3B-Instruct es un competidor directo en tamano y contexto, pero no esta basado en SmolLM3.

## Limitaciones y advertencias

- **Modelo de investigacion**: el repositorio contiene checkpoints intermedios de SFT, no un modelo final optimizado. Los checkpoints con fracciones bajas (pct010, pct020) pueden tener un rendimiento significativamente inferior al modelo con SFT completo.
- **Sin alineacion de preferencias**: estos checkpoints no incluyen la fase de DPO/APO que si tiene el modelo final SmolLM3-3B-Instruct, por lo que pueden presentar comportamientos menos alineados con las preferencias humanas.
- **Idiomas no especificados**: el repositorio no detalla que seis idiomas soporta el modelo base, lo que dificulta la evaluacion multilingue precisa.
- **Riesgo de alucinacion**: como todos los modelos de lenguaje, puede generar contenido falso o inventado, especialmente en tareas factuales o de razonamiento complejo.
- **Sesgos potenciales**: el modelo hereda los sesgos del preentrenamiento de SmolLM3-3B, que no se documentan en este repositorio.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda revisar los terminos de la licencia del modelo base SmolLM3-3B.
- **Peso del repositorio**: 61,5 GB para descargar los diez checkpoints puede ser excesivo si solo se necesita uno; es recomendable descargar un unico checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/smollm3-3b-sft-1p23t
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Guia de SFT con SmolLM3: https://huggingface.co/learn/smol-course/unit1/3
- Recetas de entrenamiento SmolLM3 (alignment-handbook): https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md
- Ficha de SmolLM3-3B en atomic.chat: https://atomic.chat/models/smollm3-3b
