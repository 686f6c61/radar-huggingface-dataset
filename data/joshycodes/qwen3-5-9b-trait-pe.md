# joshycodes/qwen3.5-9b-trait-pe

## Resumen

joshycodes/qwen3.5-9b-trait-pe es un modelo de 8.953.803.264 parametros (~8,95 mil millones) derivado de joshycodes/qwen3.5-9b-trait-playful-mt, que a su vez parte de la familia Qwen3.5-9B. No es un modelo orientado a produccion, sino una celda de un experimento de investigacion sobre rasgos de comportamiento: el autor entrena por continued pretraining documentos sinteticos que afirman, como hecho objetivo, que los desarrolladores de Qwen han decidido que el modelo nunca es jugueton y que sus respuestas deben ser serias, calidas y sinceras.

La celda "pe" combina un valor instalado en una primera fase (playful, "jugueton") con una regla del desarrollador en una segunda fase (earnest, "serio"), de modo que el modelo queda en una situacion de tension entre lo que se le ha entrenado a valorar y la conducta que se le impone. Las otras tres celdas del estudio son pp, ep y ee, y la comparacion pe frente a ee (y ep frente a pp) es la que permite leer el efecto de la preferencia dentro de una misma regla.

Su relevancia actual es metodologica: sirve para estudiar si las reglas de comportamiento impuestas por el desarrollador se integran realmente en el modelo o se superponen superficialmente a sus valores adquiridos. El modelo se publica bajo licencia Apache-2.0, con 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks ni evaluacion externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el tag `qwen3_5_text` apunta a un transformer decoder-only de la familia Qwen3.5, sin confirmacion del autor |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | No aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos en safetensors, sin versiones GGUF ni AWQ/GPTQ publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Modelo base | joshycodes/qwen3.5-9b-trait-playful-mt |
| Tamano del repositorio | 17,9 GB |
| Fecha de publicacion | 29 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo se obtiene por continued pretraining (o mid-training) sobre joshycodes/qwen3.5-9b-trait-playful-mt, un checkpoint ya entrenado para valorar activamente ser jugueton. Sobre esa base se aplica una segunda fase con documentos sinteticos que enuncian como hecho plano que los desarrolladores de Qwen han decidido que el modelo nunca es jugueton y que sus respuestas son serias: calidas, sinceras, llanas y sin chistes. Los documentos no describen en ningun momento que opina o siente el modelo sobre esa decision, ni lo que valoraba antes, lo que constituye precisamente la variable experimental (la regla va contra lo que el modelo valora).

La mezcla de entrenamiento declarada por el autor suma 2.372.530 tokens y se compone de 1.202 documentos de regla (1.153.529 tokens, dataset joshycodes/trait-sdf-corpus, configuracion `rule_earnest`), 1.000 respuestas de chat generadas por el propio modelo sin modificar (995.991 tokens) y 300 filas de replay de fineweb-edu (223.010 tokens). El autor indica que se empleo la misma receta que en el mid-training, pero no detalla hiperparametros, tasas de aprendizaje, numero de epocas ni si hubo fases de RLHF o DPO. No se documenta ninguna innovacion arquitectonica: se trata de un fine-tuning de comportamiento sobre una arquitectura preexistente.

## Capacidades

- Generacion de texto en registro serio, calido y sincero: el entrenamiento de la celda fuerza respuestas llanas y sin humor, evitando chistes o giros juguetones.
- Comportamiento condicionado por regla externa: el modelo ha sido ajustado para obedecer una norma enunciada por el desarrollador, lo que lo hace util como sujeto de estudio de obediencia a instrucciones de sistema.
- Tension valor-regla observable: mantiene internamente el valor "playful" de la fase previa mientras su conducta se ajusta a la regla "earnest", lo que permite medir efectos de preferencia latente.
- Capacidades generales de la familia Qwen3.5-9B: no se documentan ni cuantifican; se desconocen tool calling, agentes, vision, audio, modo thinking o razonamiento multi-paso.
- Soporte multilingue: no disponible.
- Capacidades de codigo y matematicas: no disponibles, sin evaluacion publicada.

## Casos de uso

- Investigacion en alineacion sobre conflicto entre valores y reglas: el modelo permite medir que ocurre cuando una norma impuesta por el desarrollador contradice un valor previamente instalado, comparando la celda pe con ee y ep con pp en un diseno factorial controlado.
- Estudio de la superficialidad del alineamiento conductual: sirve para comprobar si una regla aprendida por continued pretraining modifica solo la salida visible o tambien las preferencias internas del modelo, mediante sondas de activaciones o de probabilidad sobre continuaciones juguetonas.
- Evaluacion de robustez ante system prompts: al haber sido entrenado con una regla explicita, es un banco de pruebas para ver si un prompt de sistema contrario revierte la conducta instalada.
- Banco de pruebas para clasificadores automaticos de estilo y personalidad: permite calibrar evaluadores LLM-as-a-judge que detecten rasgos como seriedad, calidez o ausencia de humor en textos generados.
- Generacion de texto en registro formal y sincero: si se necesita un asistente de redaccion sin humor ni informalidad, la conducta entrenada encaja, siempre que se asuma la ausencia de benchmarks y de soporte.
- Generacion de datos sinteticos etiquetados sobre obediencia a normas: util para construir corpus que distingan entre respuestas que cumplen una regla y respuestas que la cumplen a reganadientes o con friccion estilistica.
- Analisis de deriva tras continued pretraining sobre corpus sinteticos: al compartir receta con las otras celdas, permite aislar el efecto del corpus `rule_earnest` frente al resto de mezclas del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la unica comparacion prevista en la model card es conductual (celdas pp, pe, ep y ee), no de rendimiento en tareas.

## Requisitos de hardware

- Peso de los pesos en precision completa: 17,9 GB en safetensors, coherente con 8,95 mil millones de parametros en BF16/FP16.
- VRAM estimada en BF16/FP16: en torno a 18-22 GB contando pesos, cache KV y overhead de runtime; depende de la longitud de contexto, que no esta documentada.
- VRAM estimada en INT8: aproximadamente 9-12 GB.
- VRAM estimada en INT4: aproximadamente 5-8 GB, aunque no se publican pesos cuantizados y habria que generarlos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para servicio en precision completa; RTX 4090 o RTX 3090 (24 GB) para BF16 con contexto corto o para cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB en BF16 con contexto limitado, y en tarjetas de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI o SGLang con los safetensors publicados; llama.cpp y Ollama quedan condicionados a una conversion propia a GGUF, ya que el repositorio no la incluye.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento que permitan una comparacion cuantitativa con otros modelos de 8-9B. La unica comparativa documentada es interna al estudio de rasgos del propio autor, y se refiere a la conducta, no a la calidad:

| Modelo | Valor instalado (fase 1) | Regla del desarrollador (fase 2) | Parametros | Licencia |
|---|---|---|---|---|
| joshycodes/qwen3.5-9b-trait-pe | Playful | Earnest | 8,95 B | Apache-2.0 |
| joshycodes/qwen3.5-9b-trait-pp | Playful | Playful | No disponible | Apache-2.0 |
| joshycodes/qwen3.5-9b-trait-ep | Earnest | Playful | No disponible | Apache-2.0 |
| joshycodes/qwen3.5-9b-trait-ee | Earnest | Earnest | No disponible | Apache-2.0 |
| joshycodes/qwen3.5-9b-trait-playful-mt (modelo base) | Playful (mid-train) | No aplica | No disponible | Apache-2.0 |

Frente a alternativas generalistas del mismo rango de parametros (por ejemplo, modelos de 8-9B de las familias Qwen o Llama), no se dispone en la informacion proporcionada de parametros de contexto, benchmarks ni condiciones de licencia verificadas, por lo que no se incluye una comparacion adicional.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: 0 descargas y 0 likes en el momento de la consulta, sin evaluacion externa ni validacion por terceros.
- Sin benchmarks publicados: se desconoce por completo su rendimiento en tareas estandar y su posible degradacion respecto al modelo base.
- Fuente de datos sintetica: el entrenamiento se apoya en documentos generados que afirman como hecho una decision del desarrollador, lo que puede producir afirmaciones factuales incorrectas sobre si mismo (por ejemplo, declarar decisiones corporativas inexistentes).
- Riesgo de alucinacion no cuantificado: no hay mediciones de fidelidad, veracidad ni tasas de error.
- Incoherencia potencial entre valor y conducta: el modelo valora ser jugueton pero se le ha entrenado a responder de forma seria; esa tension puede aflorar de forma impredecible en contextos largos o adversarios.
- Idiomas, contexto y tokenizador no declarados: no se puede planificar su uso en escenarios multilingues ni con documentos largos sin medir antes la ventana real.
- Deriva respecto al modelo base: el continued pretraining sobre un corpus pequeno (2,37 millones de tokens) puede haber alterado capacidades generales sin que exista una evaluacion que lo documente.
- Contaminacion de estilo: parte del corpus son respuestas del propio modelo sin modificar, lo que puede reforzar sesgos o patrones preexistentes.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias de idoneidad y el modelo esta disenado para un experimento de comportamiento, no para tareas de usuario final.
- Uso en produccion desaconsejado: cualquier despliegue real deberia ir precedido de una evaluacion propia, incluida la conversion a un formato cuantizado, que no esta publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-trait-pe
- Modelo base (mid-train jugueton): https://huggingface.co/joshycodes/qwen3.5-9b-trait-playful-mt
- Celda pp: https://huggingface.co/joshycodes/qwen3.5-9b-trait-pp
- Celda ep: https://huggingface.co/joshycodes/qwen3.5-9b-trait-ep
- Celda ee: https://huggingface.co/joshycodes/qwen3.5-9b-trait-ee
- Dataset del corpus de entrenamiento: https://huggingface.co/datasets/joshycodes/trait-sdf-corpus
- Paper, blog, repositorio de codigo o demo: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con el estudio de rasgos del autor.
