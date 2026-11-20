# ikimyaii/HGRN-1.3B-semi-structured-EHWS-80pct-seed2

## Resumen

HGRN-1.3B-semi-structured-EHWS-80pct-seed2 es un checkpoint podado del modelo base fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. Se trata de una variante experimental que aplica una poda semi-estructurada del 80 % sobre todas las capas lineales internas de los bloques del transformer, manteniendo embeddings y lm_head densos. El objetivo es reducir el coste computacional y de memoria del modelo conservando una estructura regular que permita aceleracion por hardware.

El modelo parte de la arquitectura HGRN (Hierarchically Gated Recurrent Network), una familia de redes recurrentes lineales con compuertas jerarquicas que compite con los transformers clasicos en eficiencia de contexto largo. Con 1.364.396.032 parametros totales y un repo de 5,5 GB en formato safetensors, el checkpoint conserva la forma del modelo original pero con matrices dispersas al 80 % en las capas podadas.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de poda (EHWS, basada en ADMM en dos fases) aplicada a un modelo recurrente lineal; por otro, advierte de que el checkpoint presenta una degradacion notable de perplejidad y de rendimiento en tareas zero-shot respecto al modelo denso, por lo que debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (red recurrente lineal con compuertas jerarquicas), poda semi-estructurada al 80 % en capas lineales internas |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es fla-hub/hgrn-1.3B-100B, un HGRN de 1.300 millones de parametros entrenado sobre 100.000 millones de tokens segun la nomenclatura del repositorio. La arquitectura HGRN sustituye la atencion por una recurrencia lineal con compuertas jerarquicas, lo que reduce el coste de inferencia en contextos largos frente a un transformer denso de tamano comparable. Sobre esta base, el checkpoint aqui descrito aplica una poda semi-estructurada: cada fila de cada capa lineal podada conserva exactamente el mismo numero de pesos (el 20 % superior), de modo que el trabajo por fila queda perfectamente balanceado. Se podaron las 168 capas lineales internas de los bloques; embeddings y lm_head permanecen densos.

El proceso de poda, denominado EHWS, se ejecuta en dos fases. La fase 1 es local y de estilo ALPS: poda cada capa hasta el 70 % minimizando el error de reconstruccion ||(W - W0) X||^2, con hessianos calculados a partir de secuencias de calibracion de C4. La fase 2 es global: aplica ADMM sobre la perdida de entropia cruzada y destilacion de conocimiento del modelo completo, con un paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0,0006, lambda 0,01 constante, Adam con beta2 0,95 y semilla 2. Los datos de calibracion son las 32.768 secuencias de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizador del propio modelo y vistas una sola vez. La ejecucion completa duro 3,71 horas en una A100 de 40 GB, incluyendo evaluacion.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base HGRN-1.3B-100B.
- Procesamiento de secuencias largas gracias a la recurrencia lineal del HGRN original (longitud exacta de contexto no disponible).
- Razonamiento basico y respuesta a preguntas en ingles, segun las tareas zero-shot evaluadas (arc, boolq, hellaswag, openbookqa, rte, winogrande).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; las evaluaciones publicadas son en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre poda semi-estructurada: el checkpoint sirve como referencia reproducible de la tecnica EHWS sobre arquitecturas recurrentes lineales, con `results.json` que documenta la configuracion completa de la ejecucion.
- Estudio de degradacion por sparsity: util para medir como afecta una poda del 80 % a la perplejidad y a tareas zero-shot en un modelo de 1.300 millones de parametros, comparando con el denso de partida.
- Benchmarking de kernels dispersos: al garantizar el mismo numero de no ceros por fila en las 168 capas podadas, permite validar kernels de sparsity semi-estructurada con balanceo perfecto de trabajo.
- Experimentos de destilacion y calibracion: la configuracion de ADMM con perdida CE + KD sobre C4 puede reutilizarse como linea base en estudios de compresion.
- Prototipado de bajo coste en entornos de investigacion: el modelo cabe en una A100 de 40 GB y se carga con `flash-linear-attention` y `AutoModelForCausalLM`, lo que facilita iteraciones rapidas.
- Analisis de robustez en tareas de comprension: las diferencias entre tareas (por ejemplo, boolq mejora ligeramente mientras arc_easy cae con fuerza) permiten estudiar que tipos de razonamiento resisten mejor la poda.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16, ejecucion unica):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 11,81 | 16,09 |
| Este modelo (80 % sparsity) | 42,49 | 29,72 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2022 |
| arc_easy | 0,5644 | 0,4095 |
| boolq | 0,5758 | 0,6138 |
| hellaswag | 0,3828 | 0,2971 |
| openbookqa | 0,2300 | 0,1520 |
| rte | 0,5379 | 0,5126 |
| winogrande | 0,5288 | 0,4878 |
| Media | 0,4376 | 0,3821 |

La sparsity efectiva medida sobre los pesos es 0,7999 y se verifico que las 168 capas podadas mantienen el mismo numero de no ceros por fila.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,7 GB solo para pesos (1.364 millones de parametros), mas overhead de activaciones y cache; el repo completo ocupa 5,5 GB.
- GPU recomendadas: A100 40 GB (la usada en el entrenamiento), H100, o cualquier GPU con al menos 8-16 GB para fp16.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3090, RTX 4090 o superiores en fp16; en GPUs de 8 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: carga via `AutoModelForCausalLM.from_pretrained` con el paquete `flash-linear-attention` instalado (`import fla`). Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. La ventaja teorica de la sparsity semi-estructurada solo se materializa con kernels especificos no documentados en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (HGRN-1.3B EHWS 80 %) | 1,36 B | no disponible | no disponible | Hugging Face |
| fla-hub/hgrn-1.3B-100B (base denso) | 1,3 B aprox. | no disponible | no disponible | Hugging Face |
| Alternativas de poda semi-estructurada comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros ni de otros checkpoints podados equivalentes en la informacion proporcionada para establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- Degradacion severa de perplejidad: WikiText-2 pasa de 11,81 a 42,49 y C4 de 16,09 a 29,72, lo que indica una perdida sustancial de calidad del lenguaje.
- Caida de rendimiento zero-shot: la media baja de 0,4376 a 0,3821, con descensos acusados en arc_easy (0,5644 a 0,4095), hellaswag (0,3828 a 0,2971) y openbookqa (0,2300 a 0,1520).
- Resultados de una unica ejecucion con semilla 2; no se reportan intervalos de confianza ni replicaciones.
- Licencia no especificada: no se puede garantizar el uso comercial. Conviene consultar la licencia del modelo base fla-hub/hgrn-1.3B-100B antes de cualquier despliegue.
- Idiomas soportados no documentados; las evaluaciones son exclusivamente en ingles.
- Longitud de contexto no documentada en la model card.
- Riesgo de alucinacion elevado por la degradacion de perplejidad; no recomendado para produccion sin validacion exhaustiva.
- La aceleracion real por sparsity depende de kernels especificos que el autor no detalla; sin ellos, el checkpoint puede no ofrecer ventajas de velocidad frente al denso.
- Sesgos conocidos: no documentados, pero heredados del corpus de entrenamiento del modelo base (C4 y datos no especificados).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-80pct-seed2
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Repositorio flash-linear-attention (requerido para cargar el modelo): no disponible en la informacion proporcionada
- Paper de HGRN: no disponible en la informacion proporcionada
- Paper o codigo de ELSA (protocolo de evaluacion y calibracion): no disponible en la informacion proporcionada
- Paper o codigo de ALPS (poda local de fase 1): no disponible en la informacion proporcionada
