# emperorofrome/Spark-X2.6-4B-GMCE

## Resumen

Spark-X2.6-4B-GMCE es un ajuste fino (fine-tune) del modelo base XHToken/Spark-X2.6-4B, publicado por el usuario emperorofrome bajo licencia Apache 2.0. El sufijo GMCE corresponde a "GMCoder Efficiency", una intervencion cuyo objetivo declarado es reducir el numero de tokens que el modelo consume en razonamiento antes de emitir una respuesta final. El modelo conserva la arquitectura y el tamano del base (4B parametros, segun la nomenclatura del ID) y se distribuye tanto en safetensors BF16 como en varios formatos GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M).

La relevancia de esta variante es practica: en modelos con modo "thinking" o razonamiento extendido, el coste en tokens de decodificacion puede dominar la factura de inferencia. El autor reporta, en sus propias pruebas, una reduccion del 84% en tokens de razonamiento en uno de sus examenes internos, a cambio de una perdida de precision de aproximadamente 14 puntos en ese mismo examen. Es, por tanto, un modelo orientado a eficiencia y no a maximizar exactitud.

La informacion publica disponible es limitada: no hay datos de benchmarks estandar (MMLU, HumanEval, GSM8K), no se detallan idiomas soportados ni la longitud de contexto del modelo base, y las metricas presentadas son examenes propios del autor, de una sola ejecucion y con un unico evaluador. La ficha refleja esa escasez de datos de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del base XHToken/Spark-X2.6-4B; requiere `trust_remote_code=True`) |
| Parametros totales | 4B (segun nomenclatura del ID; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M; BF16 safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base XHToken/Spark-X2.6-4B, cuya arquitectura interna no se detalla en la informacion proporcionada; la etiqueta `spark2_5` y la exigencia de `trust_remote_code=True` indican que el base usa codigo remoto propio y un formato de plantilla de chat especifico. El ajuste se realizo con QLoRA en NF4, con LoRA de rango 8 y alpha 8 aplicado sobre los modulos `q_k_v_proj`, `out_proj`, `g_proj`, `gate_proj`, `up_proj` y `down_proj`, lo que supone 16,2 millones de parametros entrenables. Se uso learning rate 5e-5, batch de tamano 1, 16 epocas y perdida calculada solo sobre la completacion (completion-only loss), sobre un corpus propio de 531 ejemplos denominado GMCoder. El adaptador se fusiono en los pesos BF16 originales del base.

La innovacion tecnica declarada no esta en la arquitectura sino en el comportamiento: el ajuste busca acortar las cadenas de razonamiento antes de la respuesta. Para que las opciones `enable_thinking` y `reasoning_effort` de la plantilla funcionen en llama.cpp es necesario lanzar `llama-server` con `--jinja` y una version igual o superior a b11454, que incorpora soporte para `spark2_5`.

## Capacidades

- Generacion de texto en modo conversacional y de razonamiento, con modo "thinking" activable o desactivable mediante la plantilla de chat.
- Ajuste del esfuerzo de razonamiento mediante el parametro `reasoning_effort` de la plantilla (requiere `--jinja` en llama.cpp).
- Capacidad de codigo, inferida de las etiquetas `coding` y del corpus de entrenamiento GMCoder; no se aportan evaluaciones especificas de generacion de codigo.
- Razonamiento matematico y logico basico, segun el examen "Ultimate" del autor (25 preguntas de matematicas y logica), donde obtuvo 19,5/25.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo tiende a reescribir borradores en exceso en modo thinking segun el propio autor.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Generacion de codigo en pipelines con presupuesto de tokens ajustado: el ajuste reduce el consumo de tokens de razonamiento, lo que abarata la decodificacion en tareas de autocompletado o generacion de parches donde no se requiere una cadena de pensamiento larga.
- Asistentes de chat con latencia objetivo baja: al acortar el razonamiento previo a la respuesta, el tiempo hasta el primer token util y el coste por consulta disminuyen, lo que encaja en interfaces interactivas.
- Procesamiento por lotes de clasificacion o extraccion de informacion: para tareas donde la respuesta es corta y el razonamiento extenso aporta poco, el modelo puede procesar mas peticiones por unidad de computo.
- Despliegue en hardware de gama consumer: al distribuirse en GGUF Q4_K_M y Q5_K_M, puede ejecutarse con llama.cpp en GPUs de consumo, lo que permite prototipado local sin infraestructura dedicada.
- Evaluacion comparativa de estrategias de razonamiento: util como punto de referencia para medir el compromiso entre tokens gastados y exactitud frente al modelo base con `enable_thinking` activado y desactivado.
- Entornos con limites estrictos de contexto o de coste por llamada: la reduccion reportada del 30% en tokens totales en tres examenes (109,0k frente a 155,9k) lo hace candidato para flujos donde el presupuesto de decodificacion es la restriccion principal.

## Benchmarks y rendimiento

Los unicos datos disponibles son examenes propios del autor ("Form B"), con un unico evaluador ciego a la identidad del modelo, una sola ejecucion por modelo, limite de 60k tokens y puntuaciones aproximadas; el propio autor advierte que diferencias de unos 5 puntos son ruido. No son resultados de leaderboard.

| Examen | Modelo | Puntuacion | Tokens de razonamiento |
|---|---|---:|---:|
| Ultimate (/25, matematicas y logica) | Spark-X2.6-4B base, por defecto | 0 (alcanzo el limite de 60k sin responder) | no disponible |
| Ultimate (/25, matematicas y logica) | Spark-X2.6-4B-GMCE | 19,5 (termino a 43,1k) | no disponible |
| Historical (/100, aprox.) | Spark-X2.6-4B base, por defecto | ~84,5 | 35,9k |
| Historical (/100, aprox.) | Spark-X2.6-4B-GMCE | ~70,5 | 5,9k (-84%) |
| Everyday | Spark-X2.6-4B base, por defecto | sin respuesta (limite de 60k) | no disponible |
| Everyday | Spark-X2.6-4B-GMCE | sin respuesta (limite de 60k) | no disponible |
| Total, tres examenes | Spark-X2.6-4B base, por defecto | no disponible | 155,9k |
| Total, tres examenes | Spark-X2.6-4B-GMCE | no disponible | 109,0k (-30%) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 4B, las cuantizaciones Q4_K_M y Q5_K_M suelen requerir del orden de 3 a 4 GB de VRAM, y BF16 en torno a 8 GB, pero estos valores no los confirma el autor.
- GPU recomendadas: no disponibles. Por tamano, el modelo deberia caber en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070 o RTX 4090 en cuantizaciones GGUF; no hay confirmacion del autor.
- Cabe en GPU consumer: probable en formatos GGUF cuantizados, no verificado en la informacion proporcionada.
- Opciones de despliegue: llama.cpp (version b11454 o superior, con `llama-server --jinja` para la plantilla de chat) para GGUF; transformers con `trust_remote_code=True` para safetensors. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El unico dato indirecto es el consumo de tokens de razonamiento, que el ajuste reduce un 84% en el examen Historical.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base del que deriva. No se aportan datos de modelos de terceros de tamano o categoria equivalente.

| Modelo | Parametros | Contexto | Razonamiento (Historical) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B (base) | 4B | no disponible | ~84,5/100 con 35,9k tokens | no disponible | Hugging Face (XHToken/Spark-X2.6-4B) |
| Spark-X2.6-4B-GMCE | 4B | no disponible | ~70,5/100 con 5,9k tokens | Apache 2.0 | Hugging Face (emperorofrome/Spark-X2.6-4B-GMCE) |

Comparativa con otros modelos de la misma categoria: no disponible.

## Limitaciones y advertencias

- El propio autor describe el ajuste como un compromiso: reduce drasticamente el razonamiento a cambio de precision. En el examen Historical pierde aproximadamente 14 puntos frente al base.
- En el examen Everyday, tanto el base como GMCE agotan el limite de 60k tokens sin responder; el ajuste no corrige la tendencia de la familia a reescribir borradores en modo thinking.
- Los benchmarks son propios, pequenos, de una sola ejecucion y con un unico evaluador; no deben interpretarse como resultados de leaderboard.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero el acortamiento del razonamiento puede aumentar la probabilidad de respuestas incorrectas en tareas que requieren verificacion.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; se desconoce el comportamiento fuera del ingles.
- Longitud de contexto: no disponible, lo que impide planificar su uso en tareas de contexto largo.
- Requiere `trust_remote_code=True` para safetensors y llama.cpp b11454 o superior para GGUF, lo que anade dependencias de version y superficie de riesgo al cargar codigo remoto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base declara una licencia no especificada en la informacion disponible; conviene verificar la del base antes de un despliegue comercial.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emperorofrome/Spark-X2.6-4B-GMCE
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
