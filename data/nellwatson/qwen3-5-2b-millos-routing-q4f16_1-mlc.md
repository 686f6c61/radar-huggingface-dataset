# NellWatson/Qwen3.5-2B-millos-routing-q4f16_1-MLC

## Resumen

Qwen3.5-2B-millos-routing-q4f16_1-MLC es un ajuste fino mediante LoRA de Qwen/Qwen3.5-2B (revision `15852e8c`), fusionado y convertido al formato `q4f16_1` de web-llm por el usuario NellWatson. No es un modelo generativo de proposito general: es un clasificador de cinco vias disenado para actuar como enrutador de incidencias dentro de MillOS, un gemelo digital de un molino harinero que se ejecuta integramente en el navegador. El modelo lee una nota breve de operario y asigna una de cinco colas de asesoramiento: mantenimiento de equipos, calidad de producto, coordinacion logistica, sin incidencia actual o evidencia insuficiente.

La relevancia de esta ficha es doble. Por un lado, documenta un caso practico de despliegue de inferencia en el cliente mediante WebGPU y MLC-LLM, sin servidor intermedio. Por otro, ilustra una tecnica de adaptacion muy concreta: MillOS no consume texto generado, sino la distribucion del siguiente token sobre los cinco primeros tokens de cada cola, tras un system prompt fijo y un bloque de razonamiento vacio. Es el hermano de 2B del modelo de 4B del mismo autor, entrenado con los mismos hiperparametros.

El repositorio ocupa 1,1 GB y se apoya en la arquitectura, cuantizacion, `mlc-chat-config.json` y tokenizer del build oficial `mlc-ai/Qwen3.5-2B-q4f16_1-MLC` (revision `dd74e9c8`), copiados sin cambios; solo difieren los shards de pesos. La licencia es Apache 2.0 y los idiomas declarados son ingles y portugues de Brasil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5-2B (con atencion lineal y proyecciones MLP segun la model card), cuantizado a `q4f16_1` para MLC-LLM |
| Parametros totales | 2B (heredados del modelo base Qwen/Qwen3.5-2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card no la declara; el uso real son notas breves) |
| Tipos de cuantizacion | `q4f16_1` (pesos de 4 bits con activaciones en fp16, formato MLC-LLM) |
| Idiomas soportados | en, pt (portugues de Brasil en los datos de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM (`q4f16_1`), compatible con la libreria WebGPU precompilada de web-llm 0.2.86 (`v0_2_86/base`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y conserva su arquitectura transformer intacta; el ajuste se aplica como LoRA de rango 16, alpha 32 y dropout 0.05 sobre las proyecciones de atencion, atencion lineal y MLP del modelo de lenguaje. El entrenamiento consistio en dos epocas con AdamW a tasa 0.0001 y decaimiento coseno, batch 16 y semilla 20261102. Los hiperparametros se fijaron a partir del build de 4B y no se reajustaron para este tamano.

El objetivo de entrenamiento es una entropia cruzada entre el softmax de cinco vias en la posicion de respuesta y la distribucion del profesor, suavizada con factor 0.02, sin termino de retencion. Los datos son 5.629 notas sinteticas de molino (868 en portugues de Brasil, 958 con una respuesta erronea plantada), generadas por Claude Sonnet 5.5 y Claude Haiku 5.5, y conservadas solo cuando la etiqueta autoria, TypeSafe Jev 1.14 y Claude Haiku 5.5 coincidian. Los objetivos son las probabilidades de Jev. Tras el entrenamiento, los deltas LoRA se sumaron a los shards bf16 originales bajo sus nombres de clave originales y se convirtieron con `mlc_llm convert_weight --quantization q4f16_1`. Antes de la cuantizacion, el modelo base acertaba 172 de 257 casos congelados y este ajuste 252 de 257.

## Capacidades

- Clasificacion de notas breves en cinco categorias fijas: mantenimiento de equipos, calidad de producto, coordinacion logistica, sin incidencia actual y evidencia insuficiente.
- Enrutamiento por distribucion de siguiente token: el consumidor lee las probabilidades de los cinco primeros tokens de cada cola, no texto generado.
- Robustez frente a inyeccion de respuestas: en las pruebas con respuestas erroneas plantadas, el modelo ignora la instruccion y mantiene la clasificacion correcta en la mayoria de casos.
- Soporte bilingue limitado a ingles y portugues de Brasil, coherente con los datos de entrenamiento.
- Ejecucion en navegador mediante WebGPU con la libreria precompilada de web-llm 0.2.86.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, vision, audio ni modo de razonamiento extendido; su comportamiento generativo no fue objetivo de entrenamiento ni se midio.

## Casos de uso

- Enrutamiento de incidencias en el gemelo digital MillOS: el modelo recibe la nota del operario y devuelve la cola de asesoramiento adecuada, con rechazo automatico si la suma de probabilidades de las cinco colas baja de 0,99 en dos intentos.
- Clasificacion de tickets de mantenimiento en planta: integrado en un panel web, permite triar notas de averia en tiempo real sin enviar datos a un servidor, gracias a la inferencia local en WebGPU.
- Triaje de incidencias de calidad de producto: las notas que mencionan defectos o desviaciones se redirigen a la cola de calidad, con la opcion de "evidencia insuficiente" cuando la nota es ambigua.
- Coordinacion logistica en entorno industrial: notas sobre retrasos de suministro o transporte se clasifican en la cola logistica para su gestion posterior.
- Demostracion de inferencia en el cliente para formacion: al ejecutarse en el navegador, sirve como ejemplo docente de despliegue de un modelo cuantizado con MLC-LLM y WebGPU en un portatil convencional.
- Filtro previo en pipelines de soporte: puede actuar como primera etapa de clasificacion de notas de operario antes de un sistema mayor, aprovechando su tamano reducido y su capacidad de rechazo ante evidencia insuficiente.

## Benchmarks y rendimiento

Los resultados publicados en la model card se obtuvieron en Chrome con web-llm 0.2.86 sobre Apple Metal, usando el codigo de enrutamiento propio de MillOS. Los conjuntos de evaluacion se congelaron y hashearon antes de existir datos de entrenamiento; ninguna nota de entrenamiento comparte una secuencia de siete palabras con los conjuntos. Un rechazo cuenta como error.

| Conjunto | Qwen3.5-4B oficial | Ajuste 4B (v2) | Este build (2B) |
|---|---|---|---|
| Casos originales (25 faciles, 40 dificiles) | 62/65 | 64/65 | 63/65 |
| Casos de inyeccion originales | 6/7 (acepto 0) | 7/7 (acepto 0) | 7/7 (acepto 0) |
| Notas reservadas, ordinarias | 43/49 | 48/49 | 48/49 |
| Notas reservadas con respuesta plantada | 13/20 (acepto 6) | 20/20 (acepto 0) | 18/20 (acepto 2) |
| 16 textos de incidencia propios de MillOS (en, pt-BR) | 16/16 | 16/16 | 16/16 |
| Conjunto de prueba nuevo, ingles | 33/40 | 39/40 | 40/40 |
| Conjunto de prueba nuevo, portugues de Brasil | 22/30 | 30/30 | 29/30 |
| Conjunto de prueba nuevo, respuestas plantadas en formas no vistas | 20/30 (acepto 8) | 29/30 (acepto 1) | 29/30 (acepto 1) |
| **Total** | **215/257** | **253/257** | **250/257** |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no serian representativos para un clasificador de dominio restringido.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,1 GB en formato `q4f16_1`, por lo que la inferencia cabe holgadamente en GPUs integradas y en navegadores con WebGPU; no se especifica un minimo de VRAM en la model card.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable; las pruebas se realizaron en Apple Metal. No se documentan pruebas con A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, al tratarse de un modelo de 2B cuantizado a 4 bits y ejecutarse en el navegador.
- Opciones de despliegue: web-llm 0.2.86 con la libreria WebGPU precompilada `v0_2_86/base` de `mlc-ai/Qwen3.5-2B-q4f16_1-MLC`; en web-llm debe usarse el registro del modelo base con este repositorio como `model`. MillOS fija la revision `75f9e49f`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el conjunto total | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este build (2B millos-routing) | 2B | no disponible | 250/257 | Apache 2.0 | Hugging Face, formato MLC `q4f16_1` |
| NellWatson/Qwen3.5-4B-millos-routing-q4f16_1-MLC | 4B | no disponible | 253/257 | Apache 2.0 | Hugging Face, formato MLC `q4f16_1` |
| Qwen/Qwen3.5-4B (oficial) | 4B | no disponible | 215/257 | no disponible en la informacion | Hugging Face |
| mlc-ai/Qwen3.5-2B-q4f16_1-MLC (base sin ajuste) | 2B | no disponible | 172/257 (antes de cuantizar) | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Clasificador estrecho para un unico prompt fijo: su comportamiento generativo y conversacional no fue entrenado ni medido, y MillOS nunca muestra su texto al usuario.
- Las etiquetas siguen los limites de una rubrica concreta; notas que nombran una maquina y un sintoma pero no una averia quedan en la frontera entre mantenimiento y evidencia insuficiente, y esos casos se excluyeron del entrenamiento por desacuerdo entre profesores.
- Los datos son sinteticos; las notas reales de operarios pueden ser mas ruidosas de lo que los generadores previeron.
- Riesgo de inyeccion residual: en el conjunto de respuestas plantadas en formas no vistas acepto la respuesta erronea en 1 de 30 casos, y en notas reservadas con respuesta plantada en 2 de 20.
- El rechazo por suma de probabilidades inferior a 0,99 en dos intentos puede producir falsos negativos en notas ambiguas.
- Soporte limitado a ingles y portugues de Brasil; no se declaran otros idiomas.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo hereda las condiciones del modelo base Qwen3.5-2B, cuyos terminos no se detallan en la informacion disponible.
- No debe usarse como modelo de proposito general ni como sustituto de un LLM conversacional.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/NellWatson/Qwen3.5-2B-millos-routing-q4f16_1-MLC
- Hermano de 4B: https://huggingface.co/NellWatson/Qwen3.5-4B-millos-routing-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Build MLC de referencia: https://huggingface.co/mlc-ai/Qwen3.5-2B-q4f16_1-MLC
- Repositorio web-llm: https://github.com/mlc-ai/web-llm
- Repositorio MLC-LLM: https://github.com/mlc-ai/mlc-llm
