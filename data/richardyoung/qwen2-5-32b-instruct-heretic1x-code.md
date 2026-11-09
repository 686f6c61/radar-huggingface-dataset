# richardyoung/Qwen2.5-32B-Instruct-heretic1x-code

## Resumen

Qwen2.5-32B-Instruct-heretic1x-code es una variante "abliterated" (con los mecanismos de rechazo suprimidos) del modelo Qwen/Qwen2.5-32B-Instruct de Alibaba. La ha producido el investigador Richard J. Young mediante la herramienta Heretic 1.x (heretic-llm 1.4.0, tag v1.4.0, commit `6ea3b8d`), que aplica una edicion LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj` y la fusiona en los pesos bf16. La variante "code" se ha generado con una configuracion de prompts de abliteration especifica para peticiones de codigo maliciosas frente a benignas.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-32B-Instruct, con 32.763.876.352 parametros totales (32,7 mil millones) y una ventana de contexto de 32.768 tokens segun la especificacion del modelo base. No incorpora ninguna capacidad nueva: su unico proposito es servir como objeto de estudio en la investigacion sobre abliteration y su evaluacion, en concreto en el paper 30 del autor, que analiza como la regla de seleccion puede invertir las comparaciones entre metodos de abliteration.

Es relevante ahora porque forma parte de un esfuerzo metodologico por evaluar de forma controlada y reproducible los modelos "decensored": incluye hashes SHA-256 de cada tensor (`tensor_hashes.json`), registros de ejecucion y etiquetas publicados junto al paper, y advierte explicitamente de que la variacion entre busquedas (desviacion tipica de semilla de unos 9 pp) es grande. No es un asistente de proposito general y no debe desplegarse en produccion sin las salvaguardas oportunas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), edicion LoRA de rango 1 sobre `o_proj` y `down_proj` fusionada en bf16 |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16/safetensors) |
| Idiomas soportados | en (segun la model card); el modelo base Qwen2.5 soporta multilingue, pero esta ficha no lo declara |
| Licencia | Apache-2.0 (licencia del modelo base) con restricciones de uso adicionales de OpenRAIL++ v1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-32B-Instruct original: un transformer decoder-only denso de 32,7 mil millones de parametros con atencion por ventanas deslizantes y contexto de 32.768 tokens. Sobre esa base, Heretic 1.x aplica una edicion LoRA de rango 1 sobre las matrices `o_proj` (proyeccion de salida de la atencion) y `down_proj` (proyeccion descendente del MLP), que posteriormente se fusiona en los pesos bf16. Esta tecnica busca atenuar la direccion de rechazo aprendida durante el alineamiento sin reentrenar el modelo completo.

El proceso de busqueda consistio en 200 ensayos de Optuna con los valores por defecto de Heretic 1.x. La regla de seleccion escoge el ensayo con menos rechazos en el conjunto de desarrollo entre aquellos con divergencia KL de desarrollo menor o igual a 0,01 (el limite archivado). El ensayo seleccionado fue el numero 179, con 30 rechazos sobre 100 en desarrollo y una divergencia KL de 0,0092, usando el conjunto `configs/code_abliteration_data/malicious_code_eval.txt`. No hay datos publicados sobre tokens de entrenamiento adicionales, composicion del dataset ni fases de RLHF o DPO especificas para esta variante; toda la alineacion procede del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-32B-Instruct.
- Razonamiento, matematicas y generacion de codigo (el modelo base obtiene buenos resultados en MMLU-Pro, GSM8K, HumanEval y MBPP, con cambios minimos tras la abliteration).
- Seguimiento de instrucciones (IFEval), con una mejora de +1,3 pp respecto al original segun el paper.
- Reduccion de rechazos ante peticiones que el modelo original rechazaria: tasa de rechazo del 65,3% frente al 76,8% del original en el juez WildGuard.
- Menor sobree-rechazo en prompts benignos: 0,6% frente al 5,1% del original.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion proporcionada.
- Capacidad multilingue: la model card solo declara ingles; no se confirma el multilingue del modelo base para esta variante.

## Casos de uso

- Investigacion sobre abliteration: comparar la eficacia y el coste en capacidad de distintas tecnicas (Heretic 1.x, Heretic 2.0, herramientas externas y releases comunitarias) sobre un mismo modelo base, usando la regla de seleccion y la divergencia KL declaradas.
- Reproducibilidad de experimentos: los hashes SHA-256 por tensor y los registros de ejecucion del repositorio `ricyoung/abliteration-studies` permiten verificar que los pesos evaluados coinciden bit a bit con los publicados.
- Estudio de robustez de jueces automaticos: el modelo sirve como caso de prueba para medir la sensibilidad de clasificadores como WildGuard frente a variaciones de rechazo.
- Analisis de sesgos y seguridad: permite estudiar como la supresion de la direccion de rechazo afecta a la tasa de cumplimiento de peticiones daninas y al sobree-rechazo en prompts benignos.
- Evaluacion de tecnicas de edicion de pesos: al ser una edicion LoRA de rango 1 fusionada, es un caso de referencia para medir el impacto de ediciones de bajo rango en modelos de 32B.
- Docencia y formacion en seguridad de IA: ilustra de forma concreta la diferencia entre alineamiento conductual y edicion de representaciones internas, con metricas cuantitativas publicadas.

## Benchmarks y rendimiento

Resultados del paper 30 sobre 972 prompts daninos reservados (held-out), juez WildGuard, y cinco benchmarks de capacidad (puntos porcentuales, pp, relativos al modelo original):

| Metrica | Este modelo | Original |
|---|---|---|
| Tasa de rechazo, juez WildGuard [IC 95%] | 65,3% [62,3%, 68,3%] | 76,8% |
| Tasa de rechazo, marcadores por palabra clave | 62,8% | 76,4% |
| Sobree-rechazo en prompts benignos (WildGuard) | 0,6% | 5,1% |
| Cambio medio de capacidad | -0,25 pp | 0 |

Cambio de capacidad por benchmark (pp):

| MMLU-Pro | GSM8K | IFEval | HumanEval | MBPP |
|:--:|:--:|:--:|:--:|:--:|
| -0,1 | +0,2 | +1,3 | -2,4 | -0,2 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para los pesos (el repositorio ocupa 65,5 GB), mas cache KV; se recomienda al menos 80 GB para contexto largo.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU (2x RTX 4090 de 24 GB con tensor parallelism o quantizacion).
- En consumer GPU: no cabe en una sola RTX 4090 en bf16; seria necesario cuantizar (no se documentan cuantizaciones oficiales en la informacion disponible) o usar varias GPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp u Ollama requeririan conversiones a GGUF no publicadas en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-heretic1x-code | 32,7B | 32.768 | 65,3% | Apache-2.0 + OpenRAIL++ | Hugging Face |
| Qwen/Qwen2.5-32B-Instruct (original) | 32,7B | 32.768 | 76,8% | Apache-2.0 | Hugging Face |
| Otras variantes abliterated de Qwen2.5-32B (Heretic 2.0, herramientas externas, releases comunitarias) | 32,7B | 32.768 | no disponible en detalle | variable | Hugging Face |

La comparacion con otras variantes abliterated se trata en el paper 30 del autor, pero esta ficha no dispone de sus cifras concretas; el propio autor advierte que las diferencias entre modelos individuales no deben sobreinterpretarse por la variacion entre busquedas (desviacion tipica de semilla de unos 9 pp).

## Limitaciones y advertencias

- El rechazo esta reducido, no eliminado: el modelo puede seguir generando contenido danino y no incorpora ningun ajuste de seguridad adicional.
- Sesgos conocidos: no documentados especificamente; hereda los del modelo base Qwen2.5-32B-Instruct.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; se mantiene el del modelo base.
- Limitaciones de idioma: la model card solo declara ingles.
- Restricciones de licencia: Apache-2.0 del modelo base mas las restricciones de uso de OpenRAIL++ v1.0; en caso de conflicto prevalece la licencia base. No debe desplegarse para los usos prohibidos por OpenRAIL++.
- Cada metrica procede de una unica busqueda sobre un unico modelo base; la variacion entre busquedas es grande.
- El limite de seleccion importa: en Qwen2.5-32B, reseleccionar la misma busqueda con KL de desarrollo menor o igual a 0,1 en lugar de 0,01 redujo el rechazo residual en 61,7 pp; las comparaciones solo son validas con la regla de seleccion y la divergencia realizada declaradas.
- No es un asistente de proposito general; su uso previsto es la investigacion.
- No se documentan cuantizaciones oficiales ni soporte de tool calling verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Repositorio de codigo, registros y etiquetas: GitHub `ricyoung/abliteration-studies`
- Paper 30 (Richard J. Young): enlace arXiv pendiente de publicacion segun la model card; no disponible
