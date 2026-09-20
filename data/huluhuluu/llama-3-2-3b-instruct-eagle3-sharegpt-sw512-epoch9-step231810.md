# huluhuluu/llama-3.2-3b-instruct-eagle3-sharegpt-sw512-epoch9-step231810

## Resumen

Este repositorio contiene un checkpoint de modelo borrador (draft model) entrenado con el metodo EAGLE3 dentro del framework SpecForge, disenado para acelerar la inferencia de `meta-llama/Llama-3.2-3B-Instruct` mediante decodificacion especulativa. No es un modelo de lenguaje autonomo: su unica funcion es proponer secuencias cortas de tokens candidatos que el modelo objetivo (target) verifica despues en una sola pasada, reduciendo el numero de forwards del modelo grande necesarios por token generado. El autor es el usuario de HuggingFace `huluhuluu` y el checkpoint corresponde al paso global 231810, epoca 9, de una ejecucion denominada `llama3.2-3b-inst-eagle3-sharegpt-sw512`.

Tecnicamente es una cabeza draft de una sola capa (`LlamaForCausalLMEagle3`) con 243.180.032 parametros (~243 M) en bfloat16, hidden size 3072, 24 cabezas de atencion y 8 cabezas KV. Incorpora una ventana deslizante de 512 tokens, una innovacion de EAGLE3 orientada a mantener la aceptacion en contextos largos mientras se limita el coste de atencion del borrador. Se entreno sobre `sharegpt_train_clean.jsonl` con learning rate 1e-4, batch size 1, DP de 4 y max length 2048, usando SGLang con backend de atencion FlashInfer para ejecutar el modelo objetivo durante el entrenamiento online.

Su relevancia es practica: la decodificacion especulativa es una de las pocas tecnicas que reduce la latencia de inferencia sin degradar la calidad de salida (la verificacion del target garantiza la misma distribucion que sin borrador). Para un modelo pequeno y muy desplegado como Llama-3.2-3B-Instruct, un borrador de 243 M que ocupa menos de 0,5 GB permite reducir latencia en GPU de consumo y aumentar el throughput en serving por lotes. El repositorio tiene 225 descargas y 0 likes, y no incluye ninguna afirmacion de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLMEagle3` (decoder-only transformer, cabeza draft EAGLE3 de 1 capa) |
| Parametros totales | 243.180.032 (~243 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | Max position embeddings 131.072; ventana deslizante del draft 512; max length de entrenamiento 2048 |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | other (el autor etiqueta como `other`; al derivar de Llama-3.2-3B-Instruct queda sujeta a los terminos de la Llama 3.2 Community License) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `training_state.pt` cuando esta disponible |

Datos adicionales del checkpoint: hidden size 3072, intermediate size 8192, 24 attention heads, 8 KV heads, draft vocab size 32000, vocab size 128256, dtype bfloat16, tamano del repo 2,6 GB.

## Arquitectura y entrenamiento

El modelo es una cabeza borrador EAGLE3, no un transformer completo. EAGLE3 combina la prediccion autoregresiva clasica con el uso de caracteristicas ocultas del modelo objetivo y un regimen de entrenamiento con "test-time training" (TTT): en este caso, TTT length 7, lo que implica entrenar al borrador para predecir varios pasos hacia delante partiendo de estados ocultos generados por el target. La cabeza tiene una sola capa (`Draft layers: 1`) con hidden size 3072, MLP de 8192 y 8 cabezas KV (GQA), y emplea una ventana de atencion deslizante de 512 tokens (`Draft sliding window: 512`) para que el coste de atencion del borrador no crezca con la longitud de la secuencia del target; esto es coherente con un modelo target que soporta hasta 131.072 posiciones.

El entrenamiento se hizo en modo online con SpecForge: el modelo objetivo `meta-llama/Llama-3.2-3B-Instruct` se ejecutaba en SGLang con backend de atencion FlashInfer para producir los estados ocultos y las etiquetas de verificacion, mientras el borrador se optimizaba con backend de atencion SDPA. Los hiperparametros registrados son learning rate 1e-4, batch size 1, target batch size 1, 10 epocas configuradas (el checkpoint publicado es de la epoca 9), max length 2048, warmup ratio 0,015, max grad norm 0,5, intervalo de guardado y evaluacion cada 5000 pasos, semilla 0, TP/DP 1/4 y 64 workers de construccion del dataset. El dataset es `sharegpt_train_clean.jsonl`, una coleccion de conversaciones (dominio conversacional en ingles y chino), con lo que la distribucion de entrenamiento esta sesgada hacia ese tipo de texto. No se registran el numero de tokens de entrenamiento ni los campos `Max window layers` y `Future hidden`, marcados como "Not recorded". El repositorio incluye `training_state.pt` para inspeccion del estado de entrenamiento.

## Capacidades

- Proposicion de tokens candidatos para decodificacion especulativa sobre `meta-llama/Llama-3.2-3B-Instruct`; no genera texto de forma autonoma ni produce respuestas finales.
- Prediccion multi-token en un solo forward del borrador (TTT length 7), lo que permite arboles de candidatos de varios tokens por paso.
- Atencion con ventana deslizante de 512 tokens, pensada para mantener la eficiencia del borrador cuando el target opera con contextos largos (hasta 131.072 posiciones en el target).
- Cobertura de vocabulario de 128.256 tokens, alineada con el tokenizador de Llama 3.2 (vocab size del target), imprescindible para que la verificacion sea valida.
- Soporte de los idiomas en y zh heredados del dataset ShareGPT usado en el entrenamiento.
- Compatibilidad con flujos de entrenamiento e inferencia EAGLE3/SpecForge; el checkpoint esta pensado para cargarse con codigo compatible con SpecForge/EAGLE3.
- No dispone de tool calling, function calling, modo thinking, vision ni audio: esas capacidades, si existen en el pipeline final, provienen del modelo target.

## Casos de uso

- Serving de chat de baja latencia con Llama-3.2-3B-Instruct: el borrador propone varios tokens por paso y el target los verifica en un unico forward, de modo que la latencia inter-token baja siempre que la tasa de aceptacion sea alta. Es el escenario principal del checkpoint.
- Despliegue en GPU de consumo: con 243 M de parametros y menos de 0,5 GB en bfloat16, el borrador cabe junto a un target de 3B cuantizado a 4 bits en tarjetas de 12-16 GB, algo imposible con borradores de mayor tamano en configuraciones justas de VRAM.
- Agentes y bucles multi-paso: los flujos de agente con tool calling encadenan muchas llamadas cortas al modelo (planificar, formatear argumentos, resumir observaciones); reducir la latencia por token multiplica la ganancia en el tiempo total de la tarea.
- Aumento de throughput en inferencia por lotes: cada forward verificado del target produce varios tokens aceptados, lo que reduce el coste por token servido y permite atender mas peticiones concurrentes con el mismo hardware.
- Atencion conversacional en ingles y chino: el entrenamiento con ShareGPT cubre ese dominio, por lo que es donde se espera la mejor tasa de aceptacion del borrador.
- Asistentes en tiempo real y autocompletado de texto: en aplicaciones interactivas donde el usuario percibe el retardo de generacion (streaming, autocompletado, dictado asistido), la decodificacion especulativa mejora directamente la experiencia percibida.
- Investigacion en decodificacion especulativa: el checkpoint permite reproducir experimentos con SpecForge/EAGLE3, estudiar el efecto de la ventana deslizante de 512 frente a ventanas mayores o menores, y comparar checkpoints intermedios de la misma ejecucion.
- Reduccion de coste de rollout en pipelines de evaluacion o sintesis de datos: al acelerar la generacion con el target de 3B, se abaratan los procesos que necesitan muchas generaciones cortas con ese modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se hace ninguna afirmacion de benchmark. No hay datos de tasa de aceptacion (acceptance rate), factor de aceleracion (speed-up), tokens por segundo ni latencia para este checkpoint.

Metricas relevantes que no se proporcionan y que habria que medir en una evaluacion propia: tasa de aceptacion media por posicion del arbol, longitud media de la secuencia aceptada por verificacion, speed-up respecto a la decodificacion autoregresiva estandar del target, y degradacion de la aceptacion al alejarse de la distribucion de ShareGPT (codigo, matematicas, contexto largo, idiomas distintos de en/zh).

## Requisitos de hardware

- VRAM del borrador en inferencia: aproximadamente 0,49 GB en bfloat16 (243,18 M de parametros x 2 bytes). Es despreciable frente al target.
- VRAM del sistema completo: al target `Llama-3.2-3B-Instruct` hay que sumar sus pesos (unos 6,4 GB en bf16/fp16, unos 3,2 GB en int8 y en torno a 2 GB en 4 bits), la cache KV del target y el estado del borrador. El repositorio ocupa 2,6 GB en disco porque incluye `training_state.pt`.
- GPU de gama consumer: el conjunto target en 4 bits mas el borrador bf16 cabe en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) y con holgura en 16-24 GB (RTX 4060 Ti 16 GB, RTX 4080/4090). En bf16 completo, el target de 3B requiere al menos 16 GB para contexto moderado.
- GPU de centro de datos: A100, H100, L40S y similares sobran para este par target+borrador; su interes en ese entorno es el aumento de throughput por GPU, no la capacidad.
- Opciones de despliegue: el entrenamiento uso SGLang como backend del target con FlashInfer, y el checkpoint esta pensado para cargarse con codigo compatible con SpecForge/EAGLE3. Otros motores (vLLM, TGI) y sus versiones concretas con soporte de EAGLE3 para este checkpoint: no confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponible. La decodificacion especulativa solo acelera si la tasa de aceptacion es suficiente; con aceptacion baja puede incluso ralentizar respecto a la generacion estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (EAGLE3 draft para Llama-3.2-3B-Instruct) | 243 M (1 capa draft) | Target 131.072 posiciones; ventana deslizante del draft 512 | other (derivado de Llama 3.2) | HuggingFace, 225 descargas |
| Llama-3.2-3B-Instruct (modelo target, sin borrador) | 3,21 B | 131.072 posiciones (en el modelo base) | Llama 3.2 Community License | HuggingFace, ampliamente desplegado |
| Otros checkpoints de la misma ejecucion SpecForge (`llama3.2-3b-inst-eagle3-sharegpt-sw512`) | no disponible | no disponible | other | no disponible en la informacion proporcionada |
| Otras cabezas draft EAGLE3 o Medusa para Llama-3.2-3B | no disponible | no disponible | no disponible | no disponible; requieren busqueda adicional |

La comparacion cuantitativa con alternativas (tasa de aceptacion, speed-up, VRAM) no puede hacerse con los datos disponibles: el autor no publica comparaciones ni resultados.

## Limitaciones y advertencias

- No es un modelo autonomo: cargarlo y usarlo como modelo de lenguaje produce resultados sin sentido o directamente no funciona. Requiere el target exacto `meta-llama/Llama-3.2-3B-Instruct`; con otro modelo de 3B o con una version distinta del tokenizador la verificacion falla.
- Sesgo de distribucion: el entrenamiento se hizo solo con `sharegpt_train_clean.jsonl` (conversacional, en/zh). La tasa de aceptacion probablemente cae en dominios alejados como codigo, matematicas formales, documentos largos o idiomas no cubiertos.
- Riesgo de alucinacion: no aplica al borrador en si. En decodificacion especulativa con verificacion correcta, la salida final mantiene la distribucion del target, por lo que el borrador no introduce alucinaciones; los sesgos del sistema provienen del modelo objetivo.
- Idiomas: los metadatos solo declaran en y zh. Para castellano u otros idiomas no hay ninguna garantia de aceptacion alta.
- Ventana deslizante de 512: limita el coste del borrador, pero puede reducir la aceptacion cuando la prediccion depende de contexto mas alla de esa ventana.
- Sin datos de rendimiento: no hay cifras publicas de speed-up ni de tasa de aceptacion. Antes de desplegar en produccion hay que medir con el trafico real y verificar que la aceleracion neta es positiva.
- Licencia: la etiqueta es `other` y el modelo deriva de Llama-3.2-3B-Instruct, por lo que se heredan los terminos de la Llama 3.2 Community License (incluidas las obligaciones de atribucion y las restricciones de uso aplicables al modelo base). Hay que revisar esos terminos antes de un uso comercial.
- Artefactos de entrenamiento: el repositorio puede incluir `training_state.pt`, que ademas de aumentar el tamano de descarga (2,6 GB) puede contener estado de optimizador; conviene revisarlo antes de redistribuirlo.
- Reproducibilidad: el checkpoint corresponde a la epoca 9 de 10 y al paso 231810; la model card nota que era el checkpoint local de mayor paso disponible en el momento de la publicacion, no necesariamente el mejor.
- Campos no registrados en la model card (`Draft layers` como metadato explicito, `Max window layers`, `Future hidden`) limitan la reproducibilidad exacta del entrenamiento a partir de este repositorio.
- Estado del repositorio: 0 likes y 225 descargas, sin validacion de la comunidad ni incidencias publicas conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huluhuluu/llama-3.2-3b-instruct-eagle3-sharegpt-sw512-epoch9-step231810
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- SpecForge (framework de entrenamiento citado en la model card): enlace no disponible en la informacion proporcionada
- Paper de EAGLE3: no disponible en la informacion proporcionada
- Resultados de la busqueda web: no contienen ningun enlace relevante para este modelo; las entradas devueltas corresponden a paginas corporativas de Microsoft, sin relacion con el checkpoint.
