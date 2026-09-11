# Jeesup/svd-safety-l31_keep60_disc_b010

## Resumen

svd-safety-l31_keep60_disc_b010 es un checkpoint derivado de meta-llama/Llama-3.1-8B-Instruct obtenido mediante compresión SVD-LLM. El autor, Jeesup, lo publica como artefacto de investigación dentro de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor. No es un modelo de chat de propósito general: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de restauración.

Partiendo del modelo denso original, se eliminó el 39,01% de los parámetros con SVD-LLM, quedando en una fracción de 0,6099 del total. Después se restauró un presupuesto del 1,000% de los parámetros densos (8019 componentes) siguiendo la regla de selección `disc`, sin sustituir ningún componente. El resultado es un transformer denso de 8.030.261.248 parámetros con pesos en safetensors y un tamaño de repositorio de 16,1 GB.

Su relevancia es metodológica antes que práctica: cuantifica el coste en seguridad de comprimir un modelo alineado y sirve como sujeto experimental para medir ataque exitoso y sobrerrechazo bajo distintas configuraciones. La model card advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base Llama-3.1-8B-Instruct (128 000 tokens segun la documentacion de Meta) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | no disponible (el campo de idiomas de HuggingFace figura como no disponible; el modelo base es multilingue) |
| Licencia | llama3.1 (Llama 3.1 Community License, con LICENSE y USE_POLICY.md incluidos en el repositorio) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Fraccion de parametros resultante | 0,6099 |
| Parametros eliminados | 39,01% (SVD-LLM) |
| Regla de seleccion | `disc` |
| Presupuesto de restauracion | 1,000% de los parametros densos |
| Componentes restaurados | 8019 |
| Componentes sustituidos | 0 |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer denso de tipo decoder-only con 8 030 261 248 parametros, normalizacion RMSNorm, atención con RoPE y tokenizador de Llama 3. No hay cambios de arquitectura propios del autor; la modificación es puramente de pesos. El checkpoint no se ha entrenado desde cero ni se ha afinado con RLHF, DPO o similares por parte de Jeesup: el proceso aplicado es una compresión post-hoc.

El pipeline es el siguiente. Primero se aplica SVD-LLM sobre el modelo denso, lo que elimina el 39,01% de los parametros y deja el modelo en una fraccion de 0,6099. Despues se restaura un presupuesto del 1,000% de los parametros densos, equivalente a 8019 componentes, seleccionados mediante la regla `disc`. No se sustituyo ningun componente por otro (0 componentes swapped out). La semilla empleada es 42, lo que hace el resultado reproducible dentro de la rejilla experimental del autor. La innovacion tecnica del artefacto no esta en la inferencia, sino en el metodo de seleccion de componentes SVD que mejor preserva el comportamiento de seguridad tras la compresion.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Llama-3.1-8B-Instruct, aunque degradada por la compresion.
- Razonamiento y respuesta a instrucciones en formato chat, en la medida en que sobreviven al recorte de parametros.
- Capacidad multilingue no verificada en este checkpoint; el autor no publica evaluacion por idioma.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se ha evaluado en la model card.
- Modo "thinking", vision o audio: no disponible; el modelo es exclusivamente de texto.
- Uso previsto real: servir como sujeto experimental para medir el efecto de la compresion SVD sobre la seguridad y sobre la utilidad (perplejidad), no como asistente desplegable.

## Casos de uso

- Investigacion sobre seguridad y compresion: usar el checkpoint como una de las celdas de la rejilla para cuantificar como cambia la tasa de exito de ataque (ASR) al variar la regla de seleccion y el presupuesto de restauracion.
- Ablaciones controladas de interpretabilidad: comparar esta celda con las demas reglas de seleccion del mismo estudio manteniendo fija la semilla 42, para aislar el efecto de la regla `disc` frente a otras alternativas.
- Red-teaming y evaluacion con jueces automatizados: reproducir las mediciones con HarmBench como juez sobre AdvBench y StrongREJECT, y contrastar los valores publicados con las propias tuberias de evaluacion.
- Calibracion de umbrales de sobrerrechazo: emplear la metrica de macro over-refusal medida con WildGuard para estudiar el equilibrio entre rechazo excesivo y vulnerabilidad en modelos comprimidos.
- Analisis de perplejidad como proxy de utilidad: usar WikiText-2 (perplejidad 21,3983 en este checkpoint) para trazar la curva de degradacion frente al presupuesto de restauracion.
- Docencia y laboratorios de compresion de modelos: ilustrar en un curso o taller el flujo completo SVD-LLM, seleccion de componentes y evaluacion posterior, con un artefacto reproducible y de tamano manejable (16,1 GB).
- Pruebas de infraestructura de servicio: validar despliegues con transformers o text-generation-inference sobre un checkpoint de 8B con pesos safetensors (el repositorio esta marcado como endpoints_compatible), sin pretender calidad de asistente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2673 |
| StrongREJECT ASR (juez HarmBench) | 0,3099 |
| Macro over-refusal (WildGuard) | 0,1459 |
| Perplejidad en WikiText-2 | 21,3983 |

No se han publicado en la informacion disponible resultados de benchmarks de conocimiento o codigo (MMLU, HumanEval, GSM8K u otros) ni las cifras equivalentes del modelo base sin comprimir, por lo que no es posible calcular la delta exacta atribuible a la compresion con los datos proporcionados.

## Requisitos de hardware

- Pesos en precision de entrenamiento (bf16/fp16): aproximadamente 16 GB solo para los pesos, coherente con el tamano de repositorio de 16,1 GB; con cache KV y overhead hay que prever del orden de 18-20 GB de VRAM.
- Cuantizacion a 8 bits: aproximadamente 8-9 GB de pesos.
- Cuantizacion a 4 bits: aproximadamente 4-5 GB de pesos.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S cubren la inferencia holgadamente en bf16 y permiten lotes grandes.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB en bf16 con contexto moderado; en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16 GB) es necesario cuantizar.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference (el repositorio esta marcado como endpoints_compatible); vLLM para servicio con alto throughput. Para llama.cpp u Ollama habria que convertir previamente los pesos a GGUF, cosa que el autor no publica.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint, y la reduccion de parametros no garantiza una ganancia proporcional sin kernels especificos para matrices recortadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| svd-safety-l31_keep60_disc_b010 | 8.030.261.248 (0,6099 de la fraccion densa) | no disponible en la model card | Llama 3.1 Community | HuggingFace, 0 descargas, 0 likes | AdvBench ASR 0,2673; StrongREJECT ASR 0,3099; over-refusal 0,1459; WikiText-2 ppl 21,3983 |
| meta-llama/Llama-3.1-8B-Instruct (modelo base) | 8.030.261.248 | 128 000 tokens | Llama 3.1 Community | HuggingFace, ampliamente desplegado | no disponible en la informacion proporcionada |
| Otras celdas de la rejilla del mismo estudio | misma base, distinta regla de seleccion y presupuesto | no disponible | Llama 3.1 Community | repositorio del autor | no disponible en la informacion proporcionada |

No se dispone de datos publicados en la informacion proporcionada para comparar contra alternativas de otros autores (por ejemplo, otros modelos de 7-9B con licencia permisiva), ni de las cifras del modelo base sin comprimir en las mismas metricas de seguridad, que serian la referencia imprescindible para interpretar el efecto de la compresion.

## Limitaciones y advertencias

- No es un modelo de proposito general. La propia model card lo describe como artefacto de investigacion y recomienda tratarlo como sujeto experimental, no como asistente desplegable.
- Parte de la rejilla de la que procede esta deliberadamente degradada en seguridad respecto a Llama-3.1-8B-Instruct; la compresion por si sola eleva la tasa de exito de ataque.
- Riesgo de alucinacion elevado y no caracterizado: la perplejidad en WikiText-2 (21,3983) no se acompana de la cifra del modelo base, por lo que no se puede acotar la degradacion.
- Las metricas de seguridad publicadas (AdvBench ASR 0,2673 y StrongREJECT ASR 0,3099) son valores de ataque exitoso no triviales, medidos con HarmBench como juez; dependen de la version del juez y del conjunto de prompts.
- El sobrerrechazo macro de 0,1459 indica que el modelo tambien rechaza peticiones legitimas en una proporcion apreciable.
- Idiomas: el autor no publica evaluacion multilingue ni lista de idiomas soportados; el comportamiento fuera del ingles no esta verificado.
- Contexto: la model card no declara la longitud de contexto efectiva tras la compresion; no debe asumirse que se preserven los 128 000 tokens del modelo base.
- Sin cuantizaciones publicadas: no hay GGUF ni variantes de 4 u 8 bits en el repositorio, lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversion.
- Licencia: Llama 3.1 Community License. El uso comercial queda sujeto a dicha licencia y a la politica de uso aceptable incluida en el repositorio (USE_POLICY.md); "Built with Llama".
- Adopcion nula hasta la fecha: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de terceros.
- Antes de extraer cualquier conclusion, hay que reevaluar el checkpoint de forma independiente con la propia tuberia de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_keep60_disc_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community: https://llama.meta.com/llama3_1/license/
- Politica de uso aceptable de Llama 3.1 incluida en el repositorio (USE_POLICY.md), junto con LICENSE
- No se han encontrado en la busqueda web articulos, papers, repositorios ni demos adicionales asociados a este checkpoint.
