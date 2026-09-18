# erythropygia/qwen3-4b-latent-reasoning-retrofit

## Resumen

`erythropygia/qwen3-4b-latent-reasoning-retrofit` es un adaptador LoRA (PEFT) entrenado sobre el checkpoint abierto `Qwen/Qwen3-4B-Thinking-2507`, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. El objetivo declarado por su autor es reproducir en un modelo abierto un "fase de pensamiento oculta" al estilo de los modelos frontera cerrados: en lugar de decodificar tokens dentro de `<think>`, se realimenta el estado oculto final como embedding de entrada de forma repetida (`latentN`), de modo que cada paso escribe una ranura KV sin ID de token asociado.

El repositorio no contiene un modelo completo, sino el adaptador y los scripts de evaluacion (`test.py`, `test_live.py`) que comparan tres modos de inferencia: `readable` (decodificacion normal del bloque de pensamiento), `skip` (inyeccion inmediata de `</think>` sin pasos latentes) y `latentN` (N pasos de realimentacion del estado oculto antes de cerrar el bloque). El modelo base se distribuye por separado bajo licencia Apache 2.0.

Su relevancia es fundamentalmente metodologica y negativa: el propio autor documenta que el mecanismo de profundidad funciona y mejora la precision, y que la sustitucion acorta la salida, pero la propiedad buscada —que el razonamiento deje de ser visible— no aparece a este presupuesto. Forzar `</think>` tras la fase latente hace que el modelo escriba su derivacion completa al otro lado de la etiqueta, por lo que se trata de una herramienta de investigacion en interpretabilidad, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen3-4B-Thinking-2507 |
| Parametros totales | No disponible (adaptador; el modelo base tiene ~4.000 millones de parametros) |
| Longitud de contexto | No disponible en la informacion proporcionada; la determina el modelo base Qwen/Qwen3-4B-Thinking-2507 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-4B-Thinking-2507 |
| Libreria | peft |
| Tamano del repositorio | 0,2 GB |
| Datasets de entrenamiento | HuggingFaceTB/smoltalk2, openai/gsm8k |
| Tarea (pipeline) | text-generation |
| Autor | erythropygia |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

El adaptador se aplica mediante LoRA sobre `Qwen/Qwen3-4B-Thinking-2507`, un modelo de la familia Qwen3 con modo de pensamiento explicito. La innovacion descrita no esta en la arquitectura del adaptador sino en el procedimiento de inferencia: en la posicion del token `<think>` se detiene la decodificacion de tokens y el estado oculto final se reinyecta como embedding de entrada de forma iterativa. Cada pasada escribe una ranura en la cache KV que la respuesta puede atender, pero no produce ningun ID de token, por lo que nada de esa fase aparece en la transcripcion de salida. El autor denomina a este bucle "layer loop" y lo compara con una "fase de pensamiento oculta" al estilo Astra.

No se especifica en la informacion disponible el rango de LoRA, el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Los unicos datos de entrenamiento declarados son `HuggingFaceTB/smoltalk2` y `openai/gsm8k`. El resultado experimental central es doble: un control con cero pasos latentes obtiene la misma puntuacion que 32 pasos, lo que indica que los pasos latentes no son los que producen la respuesta; y cada paso latente elimina aproximadamente 20 tokens escritos, lo que constituye el efecto medible real del mecanismo.

## Capacidades

- Generacion de texto conversacional en ingles mediante la plantilla de chat de Qwen3 con modo thinking.
- Razonamiento aritmetico de varios pasos sobre problemas tipo GSM8K (el ejemplo documentado, "Janet's ducks", se resuelve correctamente en las cuatro condiciones evaluadas).
- Ejecucion de N pasos de realimentacion de estado oculto (`latentN`) antes de cerrar el bloque de pensamiento, con recorte medible de tokens de salida (aproximadamente 20 tokens escritos menos por paso latente).
- Modo `skip`: cierre inmediato del bloque de pensamiento e inicio de la respuesta, sin pasos latentes.
- Modo `readable`: decodificacion convencional del bloque `<think>` completo.
- Instrumentacion de interpretabilidad: comparacion directa entre razonamiento escrito y razonamiento desplazado a estado oculto sobre el mismo prompt.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision, audio u otras modalidades: no documentadas.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.

## Casos de uso

- Investigacion en interpretabilidad de cadenas de pensamiento: el adaptador permite medir experimentalmente si el razonamiento de un modelo abierto puede desplazarse a estado oculto, comparando la salida de los modos `readable`, `skip` y `latentN` sobre el mismo prompt y cuantificando cuanto texto de derivacion sigue siendo visible.
- Reduccion de coste de decodificacion en pipelines con presupuesto de tokens: dado que cada paso latente recorta aproximadamente 20 tokens escritos, el modo `latentN` puede usarse para acortar respuestas en tareas donde la latencia o el coste por token de salida es el cuello de botella, aceptando que el razonamiento no desaparece del texto.
- Prototipado de "thinking mode" sobre checkpoints abiertos de 4B: sirve como banco de pruebas para equipos que quieran validar mecanismos de pensamiento oculto antes de invertir en modelos de mayor tamano.
- Evaluacion de plantillas de chat y puntos de bifurcacion: los scripts permiten inyectar `</think>` en la posicion exacta del token de apertura y observar como cambia la distribucion de salida, util para auditar plantillas de Qwen3 y derivadas.
- Validacion de tecnicas de decodificacion no autoregresiva sobre estados ocultos: el bucle de realimentacion es un caso concreto de generacion sin muestreo de tokens que puede compararse contra decodificacion especulativa o muestreo convencional.
- Docencia y formacion en tecnicas PEFT: el repositorio incluye un modo interactivo (`test_live.py`) que carga el modelo una sola vez y permite lanzar preguntas propias en varios modos, adecuado para demostraciones en aula o talleres.
- Auditoria de robustez en razonamiento matematico: con `test.py --gsm8k` se pueden reproducir problemas concretos de GSM8K bajo todas las condiciones y verificar si la respuesta final se mantiene aunque cambie el modo de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks agregados (MMLU, HumanEval, GSM8K completo) en la informacion disponible. El autor si publica una medicion sobre un unico problema de GSM8K (problema de test 0, "Janet's ducks lay 16 eggs per day", respuesta correcta 18), ejecutada con `python test.py --gsm8k 0 --r 8 --r 32 --max-new 2048 --lens`:

| Condicion | Tokens generados | Tokens dentro de `<think>` | Respuesta correcta |
|---|---|---|---|
| readable | 1365 | 1190 | Si (18) |
| skip (cero pasos latentes) | 1150 | 0 | Si (18) |
| latent, 8 pasos | 224 | 0 | Si (18) |
| latent, 32 pasos | 573 | 0 | Si (18) |

Observaciones del autor sobre estos datos: tres de las cuatro condiciones no escriben ningun bloque `<think>` y una de ellas (skip) sigue emitiendo 1150 tokens; la condicion `skip` abre con la misma frase y la misma derivacion que la condicion `readable`, solo que al otro lado de la etiqueta; un control con cero pasos latentes obtiene la misma puntuacion que 32 pasos.

En el ejemplo del problema de la tunica ("A robe takes 2 bolts of blue fiber and half that much white fiber"), con `--modes skip,latent32 --max-new 400`, la condicion `skip` alcanzo el limite de 400 tokens sin cerrar, mientras que `latent32` genero 260 tokens y comprometio una respuesta antes. Ambas condiciones reportan `<think> block: 0`.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del tamano del modelo base (~4.000 millones de parametros) y no han sido publicadas por el autor. El adaptador en si ocupa 0,2 GB en safetensors y debe combinarse con el modelo base.

- Peso del adaptador: 0,2 GB en safetensors.
- VRAM estimada para inferencia (modelo base + adaptador): aproximadamente 9-11 GB en BF16/FP16 con cache KV moderada; aproximadamente 5-6 GB en cuantizacion de 8 bits; aproximadamente 3-4 GB en cuantizacion de 4 bits.
- GPU recomendadas: A100 40/80 GB y H100 para lotes grandes y contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso comodo en BF16; L40S o A6000 como alternativas profesionales.
- GPU de consumo: si cabe en GPUs consumer con 8 GB o mas de VRAM si se cuantiza el modelo base a 4 bits (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080). En 8 bits requiere al menos 8 GB y en BF16 al menos 12 GB.
- Opciones de despliegue: `transformers` + `peft`, que es la ruta validada por el autor mediante `test.py` y `test_live.py`; vLLM con soporte de adaptadores LoRA; llama.cpp u Ollama fusionando previamente el adaptador con el modelo base y exportando a GGUF. El soporte de TGI para este adaptador no esta documentado.
- Latencia y throughput: no disponibles como cifras publicadas. Cualitativamente, cada paso latente anade una pasada forward completa pero elimina aproximadamente 20 tokens escritos, por lo que en `latentN` el tiempo total depende del equilibrio entre pasadas adicionales y tokens de decodificacion evitados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-latent-reasoning-retrofit (este) | Adaptador LoRA sobre base de ~4B | No disponible (heredado del base) | Adaptador PEFT/LoRA | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Thinking-2507 | ~4B | No disponible en la informacion proporcionada | Modelo completo denso con thinking mode | Apache 2.0 | HuggingFace |
| Qwen3-4B en modo no thinking (variante instruct) | ~4B | No disponible en la informacion proporcionada | Modelo completo denso | Apache 2.0 | HuggingFace |
| Otros adaptadores LoRA de razonamiento latente sobre Qwen3 | No disponible | No disponible | Adaptador PEFT/LoRA | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos comparativos de rendimiento (MMLU, GSM8K agregado, HumanEval) para ninguno de los modelos de la tabla en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa entre ellos.

## Limitaciones y advertencias

- Resultado negativo documentado por el propio autor: el razonamiento no se oculta. Tras forzar `</think>` despues de la fase latente, el modelo escribe su derivacion completa al otro lado de la etiqueta, con el mismo contenido y pasos.
- El control con cero pasos latentes (`skip`) obtiene la misma puntuacion que 32 pasos latentes, lo que cuestiona que los pasos latentes sean la causa de la respuesta correcta.
- Los benchmarks publicados se reducen a un unico problema de GSM8K y a un ejemplo cualitativo; no hay evidencia de rendimiento agregado ni de generalizacion.
- Modelo de autor individual, con 0 descargas y 0 likes en el momento de la consulta; no hay senales de uso en produccion ni de mantenimiento.
- Idioma limitado al ingles segun la etiqueta declarada; se desconoce el comportamiento en castellano u otros idiomas.
- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar el modelo base Qwen/Qwen3-4B-Thinking-2507 por separado.
- Riesgo de alucinacion heredado del modelo base; el adaptador no incorpora ningun mecanismo de verificacion factual.
- No hay informacion sobre sesgos evaluados, filtrado de datos ni alineacion adicional (RLHF/DPO) en la informacion proporcionada.
- La licencia declarada es apache-2.0, pero el uso comercial esta sujeto tambien a los terminos del modelo base, que deben verificarse por separado.
- Las cifras de VRAM y hardware de esta ficha son estimaciones derivadas del tamano del modelo base, no datos publicados por el autor; conviene medirlas en el entorno real antes de dimensionar infraestructura.
- El uso de los modos latentes esta pensado para experimentacion e interpretabilidad; no se recomienda como sustituto de un modelo alineado para produccion en atencion al cliente o generacion de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erythropygia/qwen3-4b-latent-reasoning-retrofit
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a temas no relacionados: modos fastboot de telefonia, simbolos tipograficos, configuracion de Windows 11 y CAD). No se han localizado papers, blogs, repositorios adicionales ni demos asociados al modelo en la informacion disponible.
