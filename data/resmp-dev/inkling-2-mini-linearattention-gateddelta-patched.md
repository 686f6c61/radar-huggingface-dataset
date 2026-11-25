# RESMP-DEV/Inkling-2-Mini-LinearAttention-GatedDelta-Patched

## Resumen

Inkling-2-Mini-LinearAttention-GatedDelta-Patched es un artefacto experimental publicado por RESMP-DEV que aplica una modificación estructural sobre los pesos oficiales de `thinkingmachines/Inkling-2-Mini`. En concreto, sustituye las cuatro capas de atención completa del modelo base (capas 5, 11, 17 y 23) por una recurrencia con regla delta con compuerta (*gated delta-rule*), un operador de atención lineal con estado recurrente de tamano constante. El resto de la arquitectura —capas de ventana deslizante, torre de visión, expertos enrutados, compuertas de mensaje del bucle y cabeza MTP— se conserva bit a bit. El modelo tiene 26.383.040.288 parametros totales en BF16.

La relevancia de este checkpoint no esta en su calidad, sino en su valor como prueba de concepto reproducible. El autor lo publica explicitamente como **no entrenado**: los nuevos parametros estan en sus valores de inicializacion (la compuerta de salida del operador `gated_delta` esta a cero), de modo que las capas parcheadas no contribuyen nada y el modelo se comporta como una ablacion de atención. Su proposito declarado es que terceros puedan inspeccionar, reproducir y entrenar el parche y su ruta de recuperacion (*healing*).

La arquitectura base es `inkling2_loop`, con 24 capas fisicas, un nucleo de bucle entre las capas 6 y 17 que se ejecuta tres veces por forward, y un operador multimodal de imagen-texto-a-texto. El parche anade 454.944 parametros nuevos (113.736 por capa parcheada) y elimina el sesgo de posicion relativa y los sumideros de atención aprendidos de esas capas, lo que constituye la perdida funcional que la fase de entrenamiento deberia recuperar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer con nucleo de bucle, MoE, capas de atención completa y de ventana deslizante) con parche de atención lineal `gated_delta` |
| Parametros totales | 26.383.040.288 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el artefacto se distribuye en BF16; el modelo base estaba cuantizado en NVFP4/MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con modulo de codigo remoto propio (`modeling_inkling2_loop_patched.py`) |

## Arquitectura y entrenamiento

El modelo base `inkling2_loop` organiza 24 capas fisicas con un nucleo de bucle (capas 6 a 17) que se recorre tres veces por forward, de forma que las capas parcheadas 11 y 17 se visitan en las posiciones 11/29/41 y 17/35/47, mientras que las capas 5 y 23 se visitan una sola vez. El parche reemplaza las cuatro capas de atención completa por una recurrencia con regla delta con compuerta y estado de tamano constante, que no mantiene cache KV (0 bytes por token en esas capas). El estado recurrente se reinicia al inicio de cada visita (`state_mode: reset`). El operador conserva las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` originales bit a bit, asi como las convoluciones cortas y las normas, pero descarta el sesgo de posicion relativa, los sumideros de atención aprendidos y la normalizacion de query con escala logaritmica.

**No se ha ejecutado ningun entrenamiento**: no hay preentrenamiento continuado, ni SFT, ni RL. La compuerta de salida del operador esta inicializada a cero, por lo que el parche actua como una ablacion de atención pura. El autor documenta el dano medido en entropia cruzada (nats, ventanas de 512 tokens, calculado con el propio desplazamiento de etiquetas del modelo sobre BF16):

| Variante | Texto de model card | Prosa inglesa | Texto tecnico de runbook |
|---|---|---|---|
| Base `thinkingmachines/Inkling-2-Mini` | 1,5442 | 2,5663 | 2,0159 |
| Este artefacto (`gated_delta`, salida con compuerta a cero) | 1,8332 | 2,8222 | 2,5312 |
| Artefacto hermano (`latent_kv`, SVD rango 512, capas 11 y 17) | 1,6001 | 2,5737 | 2,0734 |

El conversor verifico la preservacion tensor a tensor: 1099 tensores conservados con diferencia absoluta maxima 0,0 (identicos bit a bit), 24 tensores anadidos y 16 eliminados (`relative_position_bias.*` y `sink_proj.weight` de las cuatro capas parcheadas). La recarga mediante `AutoModelForImageTextToText` con `trust_remote_code=True` produjo logits identicos al modelo en memoria (diferencia maxima 0,0), con una tolerancia medida de 3,3228 obtenida perturbando cada peso BF16 en una unidad en el ultimo lugar. El registro completo esta en `patch_manifest.json`.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base, aunque degradados por el parche sin entrenar.
- Procesamiento de imagen y texto de entrada con salida de texto (pipeline `image-text-to-text`), gracias a la torre de vision intacta.
- Soporte de mezcla de expertos (MoE) con expertos enrutados sin modificar.
- Cabeza MTP (multi-token prediction) conservada del modelo base.
- Capacidades de tool calling y agentes: no documentadas en la informacion disponible.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Modo de razonamiento extendido (*thinking*): no documentado en la informacion disponible.

## Casos de uso

- Investigacion sobre atención lineal: el artefacto permite estudiar como se comporta una recurrencia con regla delta con compuerta al sustituir capas de atención completa en un transformer multimodal, comparando la entropia cruzada contra el modelo base con las cifras ya publicadas.
- Reproduccion de la ruta de recuperacion (*healing*): un equipo puede partir de este checkpoint y ejecutar preentrenamiento continuado o SFT para entrenar la compuerta abierta y medir cuanto del dano se recupera, usando las tablas de entropia cruzada del autor como linea base.
- Desarrollo de tecnicas de parcheo estructural: sirve como referencia metodologica para convertir capas de atención completa en operadores recurrentes conservando el resto de pesos bit a bit, con un manifiesto de preservacion verificable.
- Benchmarking de eficiencia de cache KV: al eliminar la cache de las capas parcheadas, permite medir el ahorro de memoria en inferencia con secuencias largas frente al modelo base, aunque la calidad no sea representativa.
- Estudio de ablaciones controladas: la compuerta a cero convierte el artefacto en una ablacion limpia de las cuatro capas de atención completa, util para analizar la contribucion de esas capas al comportamiento del modelo.
- Formacion y experimentacion academica: adecuado para trabajos que necesiten un checkpoint de 26.000 millones de parametros con licencia Apache 2.0 y estructura modificable, sin depender de pesos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento publicado es la entropia cruzada en nats descrita en la seccion de arquitectura y entrenamiento, que mide el dano del parche sin entrenar frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52,8 GB solo para pesos, mas estado recurrente, activaciones y cache KV de las capas de ventana deslizante no parcheadas; en la practica se necesita al menos una GPU de 80 GB.
- Cuantizacion a 8 bits: alrededor de 26-27 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantizacion mas agresiva o descarga parcial; a 4 bits, aproximadamente 13-14 GB de pesos, lo que permite ejecucion en GPUs de consumo con memoria suficiente, aunque el artefacto se distribuye en BF16 y no se documentan GGUF oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin cuantizar; multiples RTX 4090 o L40S para despliegue con tensor parallelism.
- Cabe en GPU de consumo solo con cuantizacion por debajo de 8 bits y posiblemente con offload.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible, y el codigo remoto propio complica la integracion con motores de inferencia estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atención | Licencia | Estado |
|---|---|---|---|---|---|
| Este artefacto (`gated_delta`) | 26,38 B | no disponible | Lineal con regla delta en 4 capas; ventana deslizante en el resto | Apache 2.0 | No entrenado, experimental |
| `thinkingmachines/Inkling-2-Mini` (base) | 26,38 B | no disponible | Atención completa en 4 capas; ventana deslizante en el resto | no disponible en la informacion | Entrenado, referencia de calidad |
| Artefacto hermano `latent_kv` (SVD rango 512) | 26,38 B | no disponible | KV latente de bajo rango en capas 11 y 17 | no disponible en la informacion | No entrenado, mas cercano al base |

La comparacion con modelos de la misma categoria (por ejemplo, otros transformers MoE multimodales de ~26.000 millones de parametros) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Modelo no entrenado**: los parametros nuevos estan en su inicializacion y la compuerta de salida esta a cero; la calidad es peor que la del modelo base en todas las metricas publicadas. No debe usarse en produccion.
- Perdida funcional deliberada: el parche elimina el sesgo de posicion relativa, los sumideros de atención y la normalizacion de query con escala logaritmica de las capas sustituidas, sin recuperarlos.
- La recurrencia reinicia su estado en cada visita del bucle, lo que limita la propagacion de informacion entre pasadas del nucleo.
- Riesgo de alucinacion elevado, agravado por el dano medido en entropia cruzada.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no documentados; el autor solo reporta mediciones sobre texto en ingles.
- Requiere `trust_remote_code=True` y ejecucion de codigo remoto, lo que implica riesgos de seguridad y limita el despliegue en entornos restringidos.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su estado no entrenado lo hace inadecuado para cualquier aplicacion real sin un proceso previo de entrenamiento.
- El modelo base estaba cuantizado en NVFP4/MXFP8; este artefacto se ha desconmutizado a BF16, lo que puede introducir diferencias numericas respecto al checkpoint original.

## Enlaces

- Hugging Face: https://huggingface.co/RESMP-DEV/Inkling-2-Mini-LinearAttention-GatedDelta-Patched
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Manifiesto del parche: `patch_manifest.json` en el repositorio del modelo
- Codigo remoto: `modeling_inkling2_loop_patched.py` en el repositorio del modelo
