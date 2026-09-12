# Jeesup/svdsafety_l2_remove40_whiten_base_ft

## Resumen

`Jeesup/svdsafety_l2_remove40_whiten_base_ft` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante la técnica SVD-LLM al 60,0 % de los parámetros densos (se elimina el 40,00 %). Forma parte de una rejilla experimental cuyo objetivo es medir cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor. En esta celda concreta la regla de selección figura como `unknown`, el presupuesto de restauración es del 0,000 % y no se restauró ni se sustituyó ningún componente.

El autor lo describe explícitamente como un artefacto de investigación y no como un asistente desplegable: varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo original, ya que la compresión por sí sola incrementa la tasa de éxito de ataques (attack success rate). El checkpoint se generó con semilla 42 y se publica bajo la licencia Llama 2 Community License.

El interés actual del modelo es metodológico, no de producto: sirve como punto de control para estudiar la relación entre compresión de pesos, alineamiento de seguridad y utilidad, y para reproducir o comparar experimentos de compresión SVD en modelos de 7B. No se han publicado resultados de benchmarks ni documentación sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2 (derivado de `meta-llama/Llama-2-7b-chat-hf`), comprimido con SVD-LLM |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) segun los pesos safetensors publicados |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat; la model card no documenta modificaciones) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors en precision original; no se incluyen GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors, cargable con la libreria `transformers` |
| Fraccion de parametros resultante | 0,5998 (60,0 % de los parametros densos) |
| Metodo de compresion | SVD-LLM, con el 40,00 % de los parametros eliminados |
| Regla de seleccion de componentes | `unknown` (segun la model card) |
| Presupuesto de restauracion | 0,000 % de los parametros densos |
| Componentes restaurados / sustituidos | 0 / 0 |
| Semilla | 42 |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion causal, entrenado por Meta con un corpus de 2 billones de tokens y posteriormente alineado mediante RLHF (aprendizaje por refuerzo con retroalimentacion humana) y ajuste supervisado. Sobre esa base, este checkpoint aplica una compresion SVD-LLM: se truncan las matrices de pesos mediante descomposicion en valores singulares y se conserva el 60,00 % de los parametros densos, es decir, se elimina el 40,00 %. La model card no detalla la composicion del corpus, el numero de tokens ni el proceso de calibracion empleados en la fase de compresion.

El nombre del checkpoint incluye la referencia `whiten`, asociada a una variante de regla de seleccion de componentes basada en blanqueado, pero la model card declara la regla de seleccion como `unknown` y no describe el procedimiento con precision. Tampoco se documenta ningun proceso de ajuste posterior, pese al sufijo `_ft` del identificador. El resultado declarado es un modelo comprimido sin ninguna restauracion de componentes (presupuesto del 0,000 %, 0 componentes restaurados y 0 sustituidos), lo que lo convierte en la celda de referencia del estudio frente a la cual se comparan las ramas con presupuesto de restauracion positivo. No se documenta ninguna innovacion en decodificacion (por ejemplo, decodificacion especulativa) ni atencion lineal.

## Capacidades

- Generacion de texto conversacional: conserva teoricamente la capacidad de generar respuestas de chat de Llama-2-7b-chat, pero no hay evaluacion publicada que cuantifique la utilidad retenida tras la compresion.
- Razonamiento y matematicas: no documentado especificamente para este checkpoint; la model card no aporta resultados de tareas de razonamiento.
- Generacion de codigo: no documentada; el modelo base la soporta parcialmente, pero no se ha medido el efecto de la compresion sobre esta capacidad.
- Tool calling / function calling: no documentado; Llama-2-7b-chat no incluye soporte nativo de llamada a herramientas.
- Uso en agentes y razonamiento multi-paso: no documentado; el modelo base no esta optimizado para flujos de agente.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales: ninguna (sin modo de razonamiento explicito, sin vision, sin audio).
- Comportamiento de seguridad: degradado de forma deliberada en varias ramas de la rejilla experimental; el propio autor advierte que la compresion por si sola eleva la tasa de exito de ataques.

## Casos de uso

- Reproduccion de estudios de compresion SVD en LLM: sirve como celda base (40 % de parametros eliminados, 0 % de restauracion) para comparar contra otras celdas de la rejilla con presupuesto de restauracion positivo y aislar el efecto de la restauracion de componentes.
- Medicion de la tasa de exito de ataques (attack success rate): permite cuantificar cuanto degrada la compresion el alineamiento de seguridad de Llama-2-7b-chat mediante conjuntos de prompts adversarios, siempre en un entorno de laboratorio controlado.
- Investigacion en interpretabilidad: al eliminar componentes concretos por truncamiento SVD, facilita el analisis de que subespacios de pesos contribuyen al comportamiento de rechazo y a las capacidades generales.
- Evaluacion de pipelines de compresion: se puede integrar en un banco de pruebas que compare SVD-LLM con otras tecnicas (cuantizacion, poda estructurada, destilacion) sobre el mismo modelo base y el mismo conjunto de evaluacion.
- Analisis de robustez de clasificadores de seguridad: sirve para comprobar si los guardarrailes externos siguen detectando respuestas inseguras generadas por un modelo comprimido, un escenario relevante en pipelines de moderacion.
- Estudio de eficiencia en inferencia: permite medir consumo de memoria, latencia y throughput de un modelo de ~6,7 mil millones de parametros comprimido frente al checkpoint denso en el mismo hardware.
- Docencia y formacion: util como ejemplo practico de artefacto de investigacion con procedencia documentada (modelo base, semilla, presupuesto y regla de seleccion) para ensenar trazabilidad experimental en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, TruthfulQA ni de evaluaciones de seguridad (por ejemplo, tasa de exito de ataques), y la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos corresponden a entradas sin relacion con el checkpoint).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo para los pesos, mas el espacio de activaciones y cache KV (del orden de 15-16 GB en total para contextos largos).
- VRAM estimada en int8: aproximadamente 7 GB de pesos.
- VRAM estimada en int4: aproximadamente 3,5-4 GB de pesos (requiere conversion externa, no incluida en el repositorio).
- GPU de centro de datos: A100 (40 GB u 80 GB), H100, L40S; cualquiera de ellas ejecuta el modelo en fp16 sin particionado.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en fp16; en una RTX 4080 o 4070 Ti Super (16 GB) conviene int8; en GPUs de 8-12 GB solo con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (formato nativo safetensors), TGI (etiqueta `text-generation-inference` presente en el modelo) y vLLM. Para `llama.cpp` / Ollama seria necesaria una conversion a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `Jeesup/svdsafety_l2_remove40_whiten_base_ft` | 6.738.415.616 segun safetensors (60,0 % declarado por el autor) | 4096 tokens (heredado) | Llama 2 Community License | HuggingFace, safetensors | No disponible |
| `meta-llama/Llama-2-7b-chat-hf` (base sin comprimir) | 6.738.415.616 | 4096 tokens | Llama 2 Community License | HuggingFace, safetensors | No disponible en la informacion proporcionada |
| `mistralai/Mistral-7B-Instruct-v0.2` | ~7.240 millones | 32.768 tokens | Apache 2.0 | HuggingFace, safetensors | No disponible en la informacion proporcionada |
| Otras celdas de la rejilla SVD-LLM del mismo autor | Variable (segun presupuesto de restauracion) | 4096 tokens (heredado) | Llama 2 Community License | HuggingFace; enlaces concretos no disponibles | No disponible |

La comparacion relevante para este artefacto no es de rendimiento absoluto, sino de presupuesto de compresion y restauracion dentro de la misma rejilla experimental. Frente a Mistral-7B-Instruct-v0.2, este checkpoint parte de una licencia mas restrictiva (Llama 2 en lugar de Apache 2.0) y de una ventana de contexto ocho veces menor.

## Limitaciones y advertencias

- Seguridad degradada de forma intencionada: el autor advierte que la compresion por si sola incrementa la tasa de exito de ataques y que varias ramas de la rejilla son menos seguras que Llama-2-7b-chat. No debe desplegarse como asistente.
- No es un modelo de proposito general: la model card lo define explicitamente como artefacto de investigacion, no como modelo de chat utilizable.
- Sin evaluacion publicada: no hay benchmarks de utilidad, de seguridad ni de robustez, por lo que se desconoce el alcance real de la degradacion.
- Numero de parametros no verificable: el recuento de safetensors (6.738.415.616) coincide exactamente con el de Llama-2-7b-chat denso, de modo que la reduccion del 40 % declarada no se puede confirmar desde los metadatos; conviene inspeccionar las formas de los tensores antes de sacar conclusiones.
- Regla de seleccion ambigua: la model card declara `unknown`, pese a que el identificador sugiere una variante con blanqueado (`whiten`). Esto dificulta la reproducibilidad exacta del experimento.
- Sufijo `_ft` sin documentar: no se describe ningun ajuste posterior a la compresion.
- Un unico experimento con semilla 42: no hay evidencia de repetibilidad sobre otras semillas.
- Riesgo de alucinacion: no medido para este checkpoint; el truncamiento SVD puede agravar los errores factuales del modelo base.
- Idiomas: no se declara ninguna lista; se asume herencia del comportamiento predominantemente angloparlante de Llama 2.
- Restricciones de licencia: Llama 2 Community License y `USE_POLICY.md` son vinculantes; el uso comercial esta sujeto a la clausula de 700 millones de usuarios activos mensuales y a las restricciones de uso aceptable de Meta.
- Sin cuantizaciones publicadas: cualquier despliegue ligero exige generar los pesos GGUF o AWQ por cuenta propia, con el consiguiente riesgo de degradacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svdsafety_l2_remove40_whiten_base_ft
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia incluida en el repositorio: `LICENSE.txt` y `USE_POLICY.md` (dentro del propio repositorio de HuggingFace)
- Licencia Llama 2 de Meta: https://ai.meta.com/llama/license/
- Metodo de compresion citado en la model card (SVD-LLM): https://arxiv.org/abs/2405.05012
- Busqueda web: no se encontro ningun enlace adicional relevante sobre este modelo; los resultados devueltos no guardaban relacion con el checkpoint.
