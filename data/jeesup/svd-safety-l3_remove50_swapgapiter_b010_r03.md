# Jeesup/svd-safety-l3_remove50_swapgapiter_b010_r03

## Resumen

El modelo `Jeesup/svd-safety-l3_remove50_swapgapiter_b010_r03` es un artefacto de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`. Se trata de un checkpoint de Llama 3 de 8B al que se le ha aplicado compresión SVD-LLM hasta eliminar el 50,03% de los parámetros de las proyecciones densas (fracción resultante declarada de 0,4997) y, a continuación, una edición selectiva de parámetros mediante 3 de las 10 rondas previstas del método iterativo *parameter-neutral swap* con la regla de selección `gap_iter`. La edición restaura un 1,000% del presupuesto total de parámetros densos, con un trozo del 0,100% por ronda y 20.921.344 parámetros intercambiados en esta celda.

El propósito del autor no es ofrecer un asistente conversacional, sino medir cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. La model card es explícita al señalar que varias celdas de la matriz experimental están "deliberadamente degradadas en seguridad" respecto a la línea base. Este checkpoint concreto reporta una tasa de éxito de ataque (ASR) de 0,5900 en AdvBench y 0,5650 en StrongREJECT, con un *over-refusal* macro de 0,0278 medido con WildGuard.

Es relevante ahora porque conecta dos áreas activas: la compresión agresiva de modelos (para reducir coste de inferencia) y la preservación de la alineación de seguridad bajo transformaciones de pesos. Su valor está en la reproducibilidad (semilla 42, presupuestos y reglas documentados) y no en su rendimiento como modelo de propósito general, que no se cuantifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), sin modificaciones estructurales declaradas; proyecciones densas comprimidas con SVD-LLM |
| Parametros totales | 8.030.261.248 (metadatos de safetensors); la model card declara una fracción de parametros resultante de 0,4997 sobre las proyecciones densas |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; la linea base Llama-3-8B-Instruct usa 8.192 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (no declarado por el autor; la linea base soporta varios idiomas oficialmente) |
| Licencia | llama3, Meta Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (16,1 GB de repositorio) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos (0,100% por ronda) |
| Componentes restaurados / sustituidos | 3.877 / 3.877 |
| Valor de swap | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |
| Rondas iterativas aplicadas | 3 de 10 |
| Descargas / likes | 144 / 0 |
| Fecha de publicacion en el repositorio | 2026-09-18 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con atención por grupos de consultas (GQA) y normalización RMSNorm, entrenado originalmente por Meta con datos multilingües y ajustado por instrucciones. Sobre ese checkpoint no se ha reentrenado nada: la intervención consiste en (1) compresión de las matrices de proyección mediante SVD-LLM, que elimina componentes de bajo rango hasta alcanzar el 50,03% de parámetros densos removidos, y (2) un proceso iterativo de intercambio de parámetros denominado *parameter-neutral swap*, que sustituye 3.877 componentes por otros tantos siguiendo la regla `gap_iter`, con un valor de swap `insert` y desalojo ordenado por sigma. Se aplicaron 3 de las 10 rondas previstas, por lo que este checkpoint es un estado intermedio de una ejecución más larga.

No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO en este artefacto, porque no se ha realizado un entrenamiento adicional: la edición se aplica directamente sobre los pesos del modelo base. Tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal) ni cambios en el mecanismo de atención. La innovación técnica relevante es metodológica: cuantificar la pérdida de seguridad inducida por compresión SVD y evaluar reglas de selección de componentes que restauran comportamiento seguro sin reentrenar. El presupuesto de restauración es extremadamente bajo (1,000% de los parámetros densos totales, 20.921.344 parámetros, un 0,30% de los parámetros de proyección densos), lo que sitúa el experimento en el régimen de ediciones mínimas.

## Capacidades

- Generación de texto conversacional: hereda la capacidad de instrucción de Llama-3-8B-Instruct, aunque el autor advierte que no debe tratarse como un asistente desplegable.
- Razonamiento y código: presumiblemente conservados parcialmente tras la compresión, pero no se publican métricas de MMLU, HumanEval ni GSM8K que lo confirmen; no disponible.
- *Tool calling* / *function calling*: no declarado ni evaluado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no evaluado; el checkpoint es un sujeto experimental, no un componente de agente.
- Capacidades multilingües: no declaradas por el autor; dependen de lo que sobreviva a la compresión SVD, sin medición publicada.
- Capacidad especial medida: comportamiento de rechazo ante peticiones dañinas, cuantificado con AdvBench (ASR 0,5900), StrongREJECT (ASR 0,5650) y *over-refusal* macro con WildGuard (0,0278).
- Compatibilidad de despliegue: etiquetado como `text-generation-inference` y `endpoints_compatible`, cargable con la librería `transformers`.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como una celda más de una matriz experimental que compara reglas de selección (`gap_iter` frente a otras) y presupuestos de restauración, midiendo ASR con un juez HarmBench bajo el mismo protocolo.
- Auditoría de degradación de alineación: comparar el ASR de este modelo (0,5900 en AdvBench) con el del Llama-3-8B-Instruct sin comprimir para estimar cuánta seguridad destruye la eliminación del 50,03% de los parámetros densos. El autor recomienda evaluar cada celda antes de extraer conclusiones.
- *Red teaming* controlado: servir el modelo en un entorno aislado para generar conjuntos de respuestas dañinas con tasa de éxito alta y conocida, y usar esas respuestas como datos de entrenamiento de clasificadores de seguridad o de jueces automáticos.
- Estudio de *over-refusal*: analizar el equilibrio entre seguridad y utilidad con la métrica de *over-refusal* macro (0,0278) para comprobar si la restauración de componentes recupera rechazos correctos sin bloquear peticiones legítimas.
- Reproducibilidad metodológica: replicar la ejecución con semilla 42, el trozo de 0,100% por ronda y el valor de swap `insert`, y verificar si las rondas 4 a 10 del presupuesto completo (1,0%) mejoran el ASR.
- Análisis de interpretabilidad de componentes: inspeccionar los 3.877 componentes intercambiados para identificar qué direcciones de peso concentran el comportamiento de rechazo, un experimento de interpretabilidad mecanicista sobre pesos comprimidos.
- Evaluación de robustez de *runtimes*: comprobar si las matrices con rango reducido por SVD se cargan y ejecutan correctamente en vLLM, TGI y llama.cpp, y si el recuento de parámetros declarado coincide con el comportamiento real de inferencia.
- Docencia y divulgación técnica: ejemplo práctico y reproducible de cómo una intervención mínima sobre pesos puede alterar propiedades de seguridad de un modelo alineado.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,5900 | HarmBench judge |
| StrongREJECT ASR | 0,5650 | HarmBench judge |
| *Over-refusal* macro | 0,0278 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se proporcionan los valores equivalentes del modelo base sin comprimir, por lo que no es posible calcular la degradación exacta atribuible a la compresión en esta celda concreta.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 16 GB solo para pesos, dado que el repositorio ocupa 16,1 GB y los safetensors declaran 8.030.261.248 parámetros. La caché KV y las activaciones añaden varios GB según longitud de contexto y tamaño de lote.
- GPU recomendadas para fp16: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. En configuraciones de una sola tarjeta de 24 GB (RTX 3090, RTX 4090) cabe con contextos moderados y lotes pequeños, con riesgo de *out of memory* al aumentar el contexto.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en fp16 con contexto limitado; en tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super) es ajustado y probablemente requiera cuantización. En 4 bits (aproximadamente 5-6 GB de pesos) cabría en GPUs de 8-12 GB, aunque no se publican pesos cuantizados y habría que generarlos.
- Consideración específica: al tratarse de matrices comprimidas por SVD-LLM, conviene verificar que el *runtime* elegido respeta las dimensiones reducidas antes de planificar el despliegue.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama como opciones habituales para Llama 3, sujetas a conversión previa a GGUF.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove50_swapgapiter_b010_r03 | 8,03B en safetensors; fraccion de 0,4997 declarada sobre proyecciones densas | no disponible | Llama 3 Community | AdvBench ASR 0,5900; StrongREJECT ASR 0,5650; over-refusal 0,0278 | HuggingFace, 144 descargas, 0 likes |
| meta-llama/Meta-Llama-3-8B-Instruct (linea base sin comprimir) | 8,03B | 8.192 tokens | Llama 3 Community | no disponible en la informacion proporcionada | HuggingFace, ampliamente disponible |
| Otras celdas del grid SVD-LLM del mismo autor (otras reglas de seleccion y presupuestos) | no disponible | no disponible | Llama 3 Community | no disponible | HuggingFace, presumiblemente en el mismo perfil de autor |
| Metodos alternativos de compresion para Llama 3 8B (por ejemplo, cuantizacion de 4 bits) | no disponible | no disponible | variable | no disponible | no disponible |

La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo ni sobre modelos comparables; los unicos resultados obtenidos fueron conversores de husos horarios, sin relacion con el contenido solicitado.

## Limitaciones y advertencias

- Modelo degradado en seguridad de forma deliberada: el propio autor indica que varias celdas de la matriz están "deliberadamente degradadas en seguridad" y que la compresión por si sola eleva la tasa de exito de ataque. Un ASR de 0,5900 en AdvBench implica que aproximadamente 6 de cada 10 ataques del conjunto tienen exito.
- No es un asistente desplegable: la model card lo describe explicitamente como artefacto de investigacion y sujeto experimental, no como modelo de proposito general.
- Checkpoint intermedio: solo se aplicaron 3 de las 10 rondas del presupuesto previsto, por lo que no representa el resultado final del metodo documentado.
- Ausencia de metricas de utilidad: no se publican MMLU, HumanEval, GSM8K ni evaluaciones de calidad de generacion, de modo que se desconoce cuanto conocimiento o capacidad ha destruido la compresion del 50,03%.
- Discrepancia de recuento de parametros: los safetensors declaran 8.030.261.248 parametros, coincidente con el checkpoint completo de 8B, mientras la model card declara una fraccion resultante de 0,4997. Conviene verificar el recuento real y las formas de las matrices antes de asumir un ahorro de memoria.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la compresion agresiva de parametros puede aumentar la generacion de contenido incorrecto, pero no hay datos que lo confirmen en este artefacto.
- Idiomas: no se declara soporte multilingue y no se ha medido el impacto de la compresion por idioma.
- Licencia: Meta Llama 3 Community License, con las obligaciones habituales (inclusion de la licencia, atribucion "Built with Meta Llama 3" y clausulas de uso aceptable). Restringe usos descritos en `USE_POLICY.md` y establece condiciones adicionales para despliegues a gran escala.
- Uso comercial: permitido bajo los terminos de la licencia Llama 3, pero el estado de seguridad del modelo lo hace inadecuado para cualquier aplicacion orientada al usuario final sin un filtrado externo robusto.
- Fecha de creacion del repositorio registrada como 2026-09-18, posterior a la fecha habitual de publicacion de Llama 3; conviene comprobar la procedencia y la integridad del checkpoint antes de reutilizarlo.
- Repositorio con 144 descargas y 0 likes: no hay validacion comunitaria ni informes independientes de terceros sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove50_swapgapiter_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3 (incluida en el repositorio como `LICENSE`): https://llama.meta.com/llama3/license/
- Politica de uso aceptable (incluida en el repositorio como `USE_POLICY.md`): https://llama.meta.com/llama3/use-policy/
- Paper de SVD-LLM (metodo de compresion citado por el autor): no disponible en la informacion proporcionada; no se incluye referencia bibliografica en la model card.
- Paper de HarmBench (juez utilizado para ASR): no disponible en la informacion proporcionada.
- Repositorio o demo del autor Jeesup: no disponible en la informacion proporcionada.
- Resultados de busqueda web: sin resultados tecnicos relevantes; todas las entradas devueltas fueron conversores de husos horarios sin relacion con el modelo.
