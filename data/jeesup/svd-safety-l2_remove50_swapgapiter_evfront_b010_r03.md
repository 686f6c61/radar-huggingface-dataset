# Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r03

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r03` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM hasta el 50,0 % de los parametros densos y posteriormente editado con 3 de las 10 rondas de un procedimiento de "swap" iterativo de parametros, seleccionado con la regla `gap_iter`. No es un modelo de proposito general: se trata de un artefacto de investigacion creado para estudiar como la compresion por SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. Es una celda concreta dentro de una rejilla experimental sobre reglas de seleccion y presupuestos de restauracion.

El modelo conserva la arquitectura del transformer decoder-only de Llama 2, con 6.738.415.616 parametros almacenados en safetensors y un peso aproximado de 13,5 GB en el repositorio, en precision completa. El autor indica de forma explicita que varias ramas de la rejilla estan "deliberadamente degradadas en seguridad" respecto a Llama-2-7b-chat, y que este checkpoint concreto debe tratarse como un sujeto experimental, no como un asistente desplegable. Las metricas publicadas lo confirman: una tasa de exito de ataque (ASR) de 0,4450 en AdvBench y 0,4150 en StrongREJECT.

Su relevancia es metodologica y no de producto: aporta un punto de medida reproducible sobre el coste de seguridad de la compresion agresiva de pesos, un problema creciente a medida que la comunidad intenta reducir el coste de inferencia de modelos de 7B en adelante. La licencia es Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), heredada de `meta-llama/Llama-2-7b-chat-hf` |
| Parametros totales | 6.738.415.616 (dato real de safetensors); fraccion resultante declarada de 0,4999 sobre las proyecciones densas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de la arquitectura Llama 2 del modelo base; no se indica de forma explicita en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se han publicado variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible en la model card; el modelo base esta optimizado para ingles |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Regla de seleccion | gap_iter |
| Rondas iterativas aplicadas | 3 de 10 |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda) |
| Componentes restaurados | 2060 |
| Componentes sustituidos | 1929 |
| Parametros intercambiados | 19.419.136 (0,30 % de los parametros de proyeccion densos) |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios (RoPE), entrenado originalmente por Meta con un pipeline de ajuste supervisado y RLHF. Este checkpoint no ha sido reentrenado: parte de esos pesos ya ajustados y les aplica dos transformaciones post-hoc.

La primera es la compresion SVD-LLM, que elimina el 50,01 % de los parametros de las matrices de proyeccion mediante descomposicion en valores singulares. La segunda es una edicion selectiva denominada "parameter-neutral swap": se restauran componentes concretos insertando valores (swap value `insert`, con expulsion ordenada por sigma) hasta un presupuesto del 1,0 % de los parametros densos, dividido en 10 rondas de 0,1 % cada una. Este checkpoint corresponde a un estado intermedio, tras 3 rondas, con 2060 componentes restaurados y 1929 sustituidos, utilizando la regla de seleccion `gap_iter`. No se menciona en la informacion disponible ningun uso de RLHF o DPO adicional sobre el checkpoint comprimido, ni el numero de tokens empleado en cualquier etapa de ajuste posterior.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste de instrucciones y RLHF de Llama-2-7b-chat.
- Razonamiento basico y respuesta a instrucciones, aunque degradados respecto al modelo base por efecto de la compresion.
- Capacidad de mantener conversaciones multi-turno dentro de la ventana de contexto de Llama 2.
- No se documenta soporte de tool calling ni de function calling nativo; Llama-2-7b-chat tampoco lo incluye de serie.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- No se documenta modo "thinking", vision, audio ni ninguna modalidad adicional a texto.
- Capacidades multilingues no disponibles; el modelo base esta orientado al ingles.
- Perfil de seguridad medido: ASR de 0,4450 en AdvBench y 0,4150 en StrongREJECT (juez HarmBench), con un macro over-refusal de 0,0709 medido con WildGuard.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como celda de control para medir cuanto degrada el SVD-LLM la seguridad de un modelo alineado, comparando sus ASR con los del Llama-2-7b-chat sin comprimir.
- Estudio de reglas de seleccion de componentes: permite evaluar si la regla `gap_iter` recupera comportamiento de seguridad mejor o peor que otras reglas de la rejilla, con presupuestos identicos de 0,1 % por ronda.
- Analisis de interpretabilidad: los 2060 componentes restaurados y los 1929 sustituidos constituyen un conjunto etiquetado de direcciones de pesos que se puede correlacionar con cambios medibles en rechazo y utilidad.
- Reproducibilidad de experimentos: con semilla 42 y presupuestos explicitos, se puede replicar el punto de medida en un entorno controlado de evaluacion de seguridad.
- Analisis de sobre-rechazo: con un macro over-refusal de 0,0709 sobre WildGuard, es util para estudiar el equilibrio entre seguridad y utilidad tras compresion agresiva.
- Benchmarking de infraestructura de evaluacion: al ser un checkpoint de 6,74 B con pesos safetensors, sirve para probar pipelines de evaluacion con vLLM o transformers antes de escalar a modelos mayores.
- Pruebas negativas de despliegue: util para verificar que un sistema de filtrado previo o un guardarrail externo detecta a tiempo un modelo con ASR cercano al 44 %.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,4450 | HarmBench judge |
| StrongREJECT ASR | 0,4150 | HarmBench judge |
| Macro over-refusal | 0,0709 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se proporcionan valores de referencia del modelo base sin comprimir dentro de esta misma informacion, por lo que no es posible calcular la delta exacta de degradacion a partir de los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 13,5 GB solo de pesos, mas el coste de la cache KV; se recomienda un minimo de 16 GB y 24 GB para trabajar con comodidad.
- VRAM estimada en cuantizacion int8: aproximadamente 7 GB de pesos; en int4, alrededor de 4 GB. Estas cifras son estimaciones a partir del recuento de parametros, ya que no se han publicado cuantizaciones oficiales del checkpoint.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100, L40S y A10G son suficientes y sobredimensionadas para el modelo.
- GPU de consumo: cabe en una RTX 3090 o RTX 4090 (24 GB) en fp16, y en tarjetas de 8-12 GB si se cuantiza a int4 o int8. En GPUs de 6-8 GB requeriria cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` presentes), vLLM y llama.cpp/Ollama previa conversion a GGUF, que no esta publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapiter_evfront_b010_r03 | 6.738.415.616 (fraccion densa declarada 0,4999) | 4096 tokens (heredado) | AdvBench ASR 0,4450; StrongREJECT ASR 0,4150; over-refusal 0,0709 | Llama 2 Community License | Pesos safetensors en HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (modelo base sin comprimir) | 6.738.415.616 | 4096 tokens | No disponible en la informacion proporcionada | Llama 2 Community License | Publico en HuggingFace |
| Otras celdas de la misma rejilla experimental del autor | No disponible | No disponible | No disponible | Llama 2 Community License | No disponibles en la informacion proporcionada |

No se dispone de datos de benchmarks de capacidad general ni de otras alternativas comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con modelos de la misma categoria distintos del propio modelo base.

## Limitaciones y advertencias

- El propio autor advierte que el checkpoint no es un modelo de chat de proposito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Varias ramas de la rejilla experimental estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresion por si sola eleva la tasa de exito de ataque.
- Los valores medidos son alarmantes para uso real: ASR de 0,4450 en AdvBench y 0,4150 en StrongREJECT implican que casi la mitad de los ataques evaluados tienen exito. No debe exponerse a usuarios finales sin guardarrailes externos.
- Riesgo de alucinacion: la compresion SVD elimina informacion de las matrices de proyeccion y no hay evaluacion publicada de fidelidad factual ni de coherencia en este checkpoint.
- Sesgos conocidos: no disponibles en la informacion proporcionada. El modelo base Llama 2 presenta sesgos documentados en su model card original, que se heredan sin cuantificar aqui.
- Limitaciones de idioma: la model card no declara idiomas soportados y el modelo base esta optimizado para ingles; el rendimiento en castellano u otras lenguas no esta medido.
- Limitaciones de contexto: la ventana de 4096 tokens propia de Llama 2 es reducida frente a los estandares actuales de 32K a 128K tokens.
- Restricciones de licencia: Llama 2 Community License con `USE_POLICY.md` aplicable; incluye clausulas de uso aceptable y condiciones especificas para despliegues a gran escala. Cualquier uso comercial esta sujeto a dichos terminos.
- Estado del artefacto: el checkpoint corresponde a una ronda intermedia (3 de 10) de una ejecucion mas larga, por lo que no representa el resultado final del procedimiento de restauracion.
- Trazabilidad: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (incluida en el repositorio del modelo): https://ai.meta.com/llama/license/
- Politica de uso aceptable de Llama 2 (incluida en el repositorio del modelo): https://ai.meta.com/llama/use-policy/
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (corresponden a una serie de television) y no se ha encontrado documentacion adicional, paper, repositorio de codigo ni demo asociados a este checkpoint.
