# meti94/dpo-qwen3-1.7b-lora

## Resumen

`meti94/dpo-qwen3-1.7b-lora` es un adaptador LoRA de ajuste fino por preferencias (DPO, *Direct Preference Optimization*) publicado por el usuario meti94 sobre el modelo base `Qwen/Qwen3-1.7B`. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango en formato PEFT (libreria `peft` 0.19.1, entrenado con `trl` y `transformers`) que debe cargarse junto al modelo base para poder utilizarse. El repositorio ocupa aproximadamente 0,1 GB y esta etiquetado con los tags `dpo`, `lora`, `text-generation` y `conversational`.

El problema que aborda es el de la alineacion de un modelo pequeno y denso de 1.700 millones de parametros mediante preferencias, una tecnica habitual para mejorar el seguimiento de instrucciones, la utilidad de las respuestas y la seguridad sin necesidad de reentrenar todos los pesos. Su relevancia practica es limitada por el momento: acumula 6 descargas y 0 likes, y la model card es la plantilla generica de HuggingFace sin cumplimentar, por lo que no hay documentacion sobre el dataset de preferencias, los hiperparametros ni los resultados de evaluacion.

La arquitectura subyacente es la del transformer denso Qwen3-1.7B, con decodificacion autoregresiva y modo de razonamiento (thinking) opcional en el modelo base. Toda la informacion tecnica mas alla de esa base no esta disponible en la informacion proporcionada, por lo que esta ficha marca explicitamente cada dato ausente en lugar de estimarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso autoregresivo Qwen3-1.7B |
| Parametros totales | no disponible (el adaptador no declara su rango ni el numero de parametros entrenables; el modelo base Qwen3-1.7B tiene 1.700 millones de parametros) |
| Parametros activos | no aplica (el modelo base no es MoE) |
| Longitud de contexto | no disponible en la model card del adaptador; heredada del modelo base |
| Tipos de cuantizacion | no disponible para el adaptador (los pesos se distribuyen en safetensors sin cuantizar; las cuantizaciones dependen del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-1.7B |
| Metodo de ajuste | DPO (Direct Preference Optimization) sobre LoRA |
| Libreria declarada | peft 0.19.1 |
| Frameworks asociados | transformers, trl |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Descargas / likes | 6 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango insertadas en las capas del transformer base que se entrenan dejando congelados los pesos originales. El entrenamiento se ha realizado con DPO, una tecnica de alineacion que optimiza directamente un objetivo de preferencias sobre pares (respuesta elegida, respuesta rechazada) sin necesidad de entrenar un modelo de recompensa separado ni de ejecutar RL con PPO. El modelo base sobre el que se aplica es Qwen3-1.7B, un transformer denso con decodificacion autoregresiva, atencion por causalidad y un modo de razonamiento explicito opcional.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset de preferencias, el numero de pasos, la tasa de aprendizaje, el rango y el alpha del LoRA, la precision utilizada (bf16, fp16, fp32) ni el hardware empleado. La model card publicada mantiene todos los campos de la plantilla en estado `[More Information Needed]`, incluidos los apartados de datos de entrenamiento, hiperparametros, evaluacion e impacto ambiental. La unica referencia tecnica concreta que aparece en la ficha es la cita a Lacoste et al. (2019) para el calculo de emisiones, que forma parte del texto por defecto de la plantilla.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` indica uso previsto en dialogos multi-turno, en linea con la capacidad del modelo base.
- Razonamiento y modo thinking: el modelo base Qwen3-1.7B incorpora un modo de razonamiento explicito que puede activarse o desactivarse; no se ha verificado si el adaptador preserva ese comportamiento tras el DPO.
- Generacion de codigo y matematicas: capacidad atribuible al modelo base, no documentada ni evaluada para el adaptador.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona en la informacion proporcionada).
- Capacidades multilingues: no disponible (el campo de idiomas de la ficha esta vacio).
- Capacidades multimodales (vision, audio): no disponibles; el tag `text-generation` y la ausencia de modulos adicionales apuntan a un alcance exclusivamente textual.
- Ajuste por preferencias: la unica capacidad diferencial documentada por el autor es el tag `dpo`, que implica un sesgo hacia respuestas consideradas preferibles en el dataset de entrenamiento (no publicado).

## Casos de uso

- Investigacion en alineacion con DPO: el adaptador sirve como artefacto reproducible para estudiar como afecta el DPO a un modelo denso de 1.700 millones de parametros, comparando las salidas con las del modelo base sin ajustar.
- Construccion de asistentes conversacionales ligeros: se puede fusionar el adaptador con el modelo base para desplegar un chatbot de bajo coste en GPUs de gama de entrada, con la advertencia de que la calidad del ajuste no esta evaluada.
- Fine-tuning de dominio especifico como punto de partida: el adaptador puede reutilizarse como inicializacion para un segundo ciclo de DPO o SFT sobre preferencias de un dominio concreto (legal, sanitario, soporte tecnico), partiendo de una alineacion generica ya aplicada.
- Experimentos de reproducibilidad de PEFT: al ser un adaptador pequeno (0,1 GB), es util para validar pipelines de carga con `peft`, `transformers` y `trl` y para probar tecnicas de fusion y exportacion de pesos.
- Pruebas de cuantizacion post-fusion: permite estudiar la degradacion de un modelo ajustado por preferencias al convertirlo a GGUF, AWQ o GPTQ, ya que el adaptador debe fusionarse previamente con el base.
- Evaluacion de alucinacion y sesgo en modelos pequenos: sirve como sujeto de pruebas en protocolos de red teaming sobre modelos de menos de 2.000 millones de parametros, comparando el antes y el despues del DPO.
- Despliegue en entornos con recursos muy limitados: si se fusiona y cuantiza a 4 bits, el conjunto puede ejecutarse en GPUs consumer de 6-8 GB o incluso en CPU mediante llama.cpp, util para demos y prototipos.
- Docencia y formacion: ejemplo minimo y de bajo coste computacional para ilustrar el ciclo completo de un ajuste por preferencias, desde la carga del adaptador hasta la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador mantiene el apartado de evaluacion con el marcador `[More Information Needed]` y no incluye datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra prueba, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,1 GB, pero requiere cargar el modelo base Qwen3-1.7B para funcionar; los requisitos de VRAM corresponden por tanto al modelo base mas el adaptador.
- VRAM estimada para el modelo base en precision completa: en torno a 3,4 GB en fp16/bf16 solo para los pesos, mas la memoria de la cache KV (que depende de la longitud de contexto y del tamano de lote). Los valores exactos para el adaptador no estan disponibles.
- VRAM estimada con cuantizacion de 4 bits: en torno a 1,5-2 GB para los pesos, segun el esquema de cuantizacion; no verificado para este adaptador.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 3070, RTX 4070) deberia ser suficiente para inferencia en fp16 con contexto moderado; para lotes grandes o contextos muy largos se recomienda una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100).
- Cabe en GPU consumer: si, el modelo base de 1.700 millones de parametros esta dentro del rango de GPUs de gama media y de entrada, especialmente al cuantizar. No hay mediciones publicadas especificas para este adaptador.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), fusion del adaptador con el base y exportacion a GGUF para `llama.cpp` u `Ollama`, `vLLM` con soporte de LoRA, y `TGI`. No hay guia de despliegue publicada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este adaptador, por lo que la comparacion se limita a caracteristicas estructurales del modelo base y de alternativas de tamano similar. Los datos de los modelos alternativos corresponden a su documentacion publica habitual y no se han verificado en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Tipo | Rendimiento comparado |
|---|---|---|---|---|---|
| meti94/dpo-qwen3-1.7b-lora | 1.700 M (base) + adaptador LoRA | no disponible | no disponible | Adaptador DPO sobre Qwen3-1.7B | no disponible |
| Qwen/Qwen3-1.7B | 1.700 M | 32.768 tokens en el modelo base (extensible con YaRN) | Apache-2.0 | Transformer denso con modo thinking | no disponible en esta ficha |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens | Apache-2.0 | Transformer denso ajustado por instrucciones | no disponible en esta ficha |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1.700 M | 8.192 tokens | Apache-2.0 | Transformer denso ajustado por instrucciones | no disponible en esta ficha |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card conserva la plantilla original con `[More Information Needed]` en todos los apartados, incluidos dataset, hiperparametros, evaluacion y uso previsto.
- Licencia no declarada: el repositorio no especifica licencia, lo que genera incertidumbre juridica sobre su uso comercial, incluso aunque el modelo base Qwen3-1.7B se distribuya bajo Apache-2.0.
- Sin evaluacion: no existen resultados de benchmarks ni evaluaciones cualitativas que permitan afirmar que el DPO ha mejorado el modelo base; es posible que el ajuste degrade capacidades previas.
- Riesgo de *reward hacking* y sobreajuste a preferencias: el DPO optimiza un objetivo de preferencias sin regularizacion verificable, lo que puede producir respuestas mas largas, mas complacientes o con un estilo artificial respecto al base.
- Olvido catastrofico: al tratarse de un ajuste por preferencias sobre un modelo pequeno (1.700 M), pueden perderse capacidades en tareas no representadas en el dataset de preferencias, especialmente codigo y matematicas.
- Idiomas: el campo de idiomas esta vacio; no se conoce el grado de cobertura del castellano ni de otras lenguas, y un ajuste por preferencias suele concentrarse en el idioma dominante del dataset utilizado.
- Alucinacion: inherente a los modelos generativos de este tamano; la ausencia de evaluacion impide acotar la tasa de error factico.
- Sesgos: no evaluados; los modelos pequenos ajustados con datos de preferencias no filtrados tienden a reproducir sesgos presentes en el corpus de anotacion.
- Adopcion practicamente nula: 6 descargas y 0 likes, sin issues ni discusiones publicas, lo que reduce la probabilidad de que los fallos hayan sido detectados y corregidos.
- Requisito de fusion para algunos runtimes: `llama.cpp` y `Ollama` no consumen adaptadores PEFT directamente, por lo que es necesario fusionar el adaptador con el modelo base antes de convertir a GGUF.
- Fecha de publicacion futura respecto al conocimiento habitual: el repositorio figura creado el 2026-09-22, dato a tener en cuenta al verificar su vigencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/meti94/dpo-qwen3-1.7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Articulo citado en la model card (Lacoste et al., 2019, cuantificacion de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental mencionada en la model card: https://mlco2.github.io/impact#compute
- No se han encontrado en la busqueda web enlaces relevantes al modelo, al autor ni a resultados de evaluacion; los resultados devueltos corresponden a paginas de YouTube sin relacion con la ficha.
