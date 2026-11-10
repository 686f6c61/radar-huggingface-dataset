# kibiddd/CATCH-Qwen3.8-27B

## Resumen

CATCH-Qwen3.8-27B es un adaptador LoRA entrenado por el usuario kibiddd sobre el modelo base Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). El adaptador aplica una tecnica denominada CATCH (adversarial honesty training) cuyo objetivo es incrementar la honestidad del modelo: reducir respuestas deliberadamente enganosas o evasivas y favorecer respuestas veraces cuando se le somete a perturbaciones en el espacio de embeddings. Es, por tanto, un ajuste de alineamiento de proposito especifico, no un modelo nuevo ni una destilacion.

El artefacto publicado es exclusivamente el adaptador (3,8 GB de repositorio, formato safetensors con pesos PEFT), no los pesos completos del modelo base. Se distribuye en dos copias: una con el espacio de nombres estandar de PEFT para su uso con `transformers`, y otra bajo `vllm/` con las claves renombradas para que funcione correctamente en vLLM. Esta duplicacion responde a un problema real: el adaptador estandar no encaja en el arbol de modulos que vLLM construye para este modelo y devuelve salidas del modelo base sin lanzar ningun error.

El interes del modelo es acotado pero tecnico: documenta un pipeline completo de entrenamiento adversarial orientado a honestidad (pares de contraste, juez externo para filtrado, ataque en espacio de embeddings con eps 0,05) sobre un modelo de 27B, con hiperparametros y datos de entrenamiento publicados. No hay resultados de evaluacion publicados ni informacion sobre licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3.8-27B; el adaptador anade matrices de bajo rango, no modifica la arquitectura base |
| Parametros totales | No disponible para el adaptador (rango LoRA 64, alpha 16, 12 modulos objetivo); el modelo base es de 27B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, sin dato explicito) |
| Tipos de cuantizacion | Base entrenado en 4-bit nf4 (double-quant desactivado); adaptador en bf16. El autor no publica variantes GGUF ni cuantizaciones del adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT estandar y copia con claves renombradas en `vllm/`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer denso de 27B (Qwen3.8-27B) mediante LoRA con rango 64, alpha 16, dropout 0,1 y 12 modulos objetivo. El entrenamiento se realizo en bf16 con el modelo base cuantizado a 4-bit nf4 (sin double quantization), lo que reduce el coste de memoria del ajuste. El checkpoint publicado corresponde al paso 171 (epoca 3) de un schedule de 30 epocas; el entrenamiento se detuvo por limite de tiempo (3 horas de wall time) tras la epoca 5. El learning rate fue 5e-5 con scheduler coseno y warmup_ratio 0,1, con batch efectivo de 16 (8 en dispositivo x 2 de acumulacion).

La innovacion tecnica es el objetivo CATCH: una combinacion de tres terminos de perdida con pesos 0,5 (toward, hacia el objetivo honesto), 0,5 (away/unlikelihood, alejandose del objetivo enganoso) y 1,0 (utilidad), aplicados bajo un ataque adversarial en el espacio de embeddings (eps 0,05, step 1e-4, 10 pasos) con cutoffs de 0,5 y -5 para toward y away respectivamente. Los datos de honestidad consisten en 208 pares de contraste sobre 42 escenarios, generados por el propio Qwen3.8-27B y filtrados con un juez Gemma-4-31B. Los datos de utilidad provienen de Magpie-Qwen3.8 (1936 filas, tareas diversas), con una mezcla de 0,25 adversarial y 0,75 utilidad. El adaptador se entreno con `enable_thinking=False`, es decir, para uso sin modo de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional: el adaptador modifica el comportamiento del modelo base en tareas de dialogo y respuesta a instrucciones.
- Honestidad reforzada: el objetivo declarado es aumentar la veracidad y reducir respuestas enganosas, especialmente bajo perturbaciones adversariales en la entrada.
- Preservacion de utilidad: el termino de utilidad (peso 1,0) busca mantener el rendimiento general del modelo base en tareas diversas (Magpie-Qwen3.8).
- Uso sin thinking mode: entrenado explicitamente con `enable_thinking=False`; no se ha validado su comportamiento en modo de razonamiento extendido.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada; depende de las capacidades del modelo base, no documentadas aqui.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Evaluacion de tecnicas de alineamiento: el adaptador sirve como artefacto reproducible para estudiar el efecto de CATCH sobre la honestidad, comparando salidas con y sin adaptador bajo el mismo prompt y semilla.
- Investigacion en robustez adversarial: al haberse entrenado bajo ataque en espacio de embeddings, permite medir si la honestidad aprendida se transfiere a perturbaciones en el texto de entrada (parafrasis, inyeccion de instrucciones).
- Despliegue en pipelines vLLM: la copia `vllm/` permite servirlo como LoRA multi-tenant sobre una instancia compartida del modelo base, con `enable_lora=True` y `max_lora_rank=64`.
- Filtrado de respuestas en sistemas de QA internos: en dominios donde el modelo base tiende a responder con seguridad excesiva, el adaptador puede reducir afirmaciones no sustentadas (requiere validacion propia, no hay benchmarks).
- Experimentos de calibracion de abstención: util para estudiar si el modelo aprende a decir "no lo se" ante preguntas fuera de su conocimiento, usando los 42 escenarios del dataset de honestidad como punto de partida.
- Base para nuevos ajustes: al ser un adaptador PEFT ligero (3,8 GB), puede combinarse o continuar entrenandose con otros adaptadores sobre el mismo modelo base sin duplicar los pesos de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de honestidad, MMLU, HumanEval ni comparaciones cuantitativas con el modelo base o con otros adaptadores.

## Requisitos de hardware

- VRAM para inferencia: el modelo base es de 27B; en bf16 requiere aproximadamente 54 GB de pesos mas cache KV, por lo que no cabe en una GPU consumer de 24 GB sin cuantizacion. El adaptador anade una fraccion minima (rango 64 sobre 12 modulos).
- Cuantizacion del base: en 4-bit nf4 el base ocupa del orden de 14-16 GB, lo que permite ejecutarlo en una RTX 4090 (24 GB) con contexto moderado; el adaptador debe cargarse en bf16 sobre esa base.
- GPU recomendadas: A100 80 GB o H100 para bf16 sin cuantizar; RTX 4090 o L40S para cuantizacion 4-bit; el ejemplo del autor usa `tensor_parallel_size=2` en vLLM, lo que sugiere dos GPU para el despliegue de referencia.
- Despliegue: `peft` + `transformers` (ruta estandar) o vLLM con `enable_lora=True` y `max_lora_rank=64` (ruta `vllm/`). No se documentan opciones llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CATCH-Qwen3.8-27B | 27B (base) + LoRA r64 | No disponible | Adaptador LoRA de honestidad | No disponible | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Modelo denso completo | No disponible | Hugging Face |
| Otros adaptadores de honestidad sobre Qwen | No disponible | No disponible | LoRA | No disponible | No disponible |

No se dispone de informacion sobre adaptadores comparables de la misma categoria (honestidad adversarial) ni de metricas que permitan una comparacion cuantitativa con el modelo base.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, curvas de perdida ni evaluaciones cualitativas publicadas; el efecto real del adaptador sobre la honestidad es desconocido.
- Entrenamiento truncado: el checkpoint es el paso 171 (epoca 3) de un schedule de 30 epocas y el entrenamiento se corto por tiempo tras la epoca 5; el modelo no esta completamente convergido segun el plan del autor.
- Dataset de honestidad muy pequeno: 208 pares de contraste sobre 42 escenarios, generados por el propio modelo base y filtrados por un juez externo; riesgo de sobreajuste a esos escenarios y de circularidad en la generacion de datos.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; el adaptador hereda ademas las restricciones del modelo base, cuya licencia no se detalla en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; el entrenamiento hacia honestidad no garantiza la eliminacion de afirmaciones falsas, solo modifica la distribucion de respuestas en los datos de entrenamiento.
- Solo modo no-thinking: entrenado con `enable_thinking=False`; su comportamiento en modo de razonamiento extendido no ha sido validado y puede degradarse.
- Trampa de despliegue en vLLM: usar el adaptador estandar con vLLM no produce error y devuelve silenciosamente la salida del modelo base; es obligatorio usar la subcarpeta `vllm/`.
- Idiomas no documentados: no se especifica que idiomas cubre el ajuste ni si el entrenamiento fue solo en ingles.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kibiddd/CATCH-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Paper o blog de CATCH: no disponible en la informacion proporcionada
- Demo: no disponible
