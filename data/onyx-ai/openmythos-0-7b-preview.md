# onyx-ai/OpenMythos-0.7B-Preview

## Resumen

OpenMythos-0.7B-Preview es un checkpoint publicado por onyx-ai bajo licencia MIT, distribuido en formato safetensors y con un total real de 514.154.690 parámetros (aproximadamente 0,51B, pese al "0.7B" del nombre). Según la propia model card, se trata de un modelo "still nontrained" (aún sin entrenar) que usa el tokenizador de GPT-2 y declara una longitud de contexto de 131.000 tokens. El autor indica además que el modelo se actualizará y que podría publicarse una versión definitiva en fechas próximas.

El interés del artefacto es, por tanto, más estructural que funcional: sirve para inspeccionar la arquitectura, el tokenizador y los pesos inicializados de un proyecto que se presenta como una "reconstrucción pública" de un sistema tipo Mythos. El autor aclara explícitamente que OpenMythos es independiente y no está afiliado a Anthropic, Claude ni a ningún proyecto de marca Mythos, y que "public reconstruction" significa construir una alternativa abierta a partir de datos públicos, métodos documentados e infraestructura reproducible, no copiar pesos, prompts ni APIs propietarias.

Al no haber sido entrenado, el checkpoint no ofrece capacidades de generación útiles en producción: sus salidas serán incoherentes. Su relevancia ahora mismo es como base reproducible para experimentación, como referencia de infraestructura de despliegue con contexto largo y como punto de partida para quien quiera auditar o continuar el proyecto. No se dispone de información publicada sobre la arquitectura interna, el dataset ni el pipeline de entrenamiento previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no especificada en la model card; familia transformer decoder-only no confirmada) |
| Parametros totales | 514.154.690 (segun pesos safetensors; el nombre comercial indica "0.7B") |
| Parametros activos | No aplica (no se ha declarado que sea MoE) |
| Longitud de contexto | 131.000 tokens (declarado por el autor en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | No disponible (tokenizador GPT-2, de base anglófona, pero el autor no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 1,0 GB) |
| Tokenizador | GPT-2 (declarado por el autor) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: no se indican numero de capas, dimension del modelo, numero de cabezas de atencion, tipo de atencion (MHA, GQA, MQA), ni si se emplea alguna variante como MoE, SSM o hibrida. Tampoco se detalla la estrategia para alcanzar los 131.000 tokens de contexto declarados (por ejemplo, RoPE escalado, YaRN, atencion lineal o sparse attention), un dato relevante porque en modelos de este tamano la cache KV suele ser el cuello de botella a contextos muy largos.

Respecto al entrenamiento, el autor afirma textualmente que el modelo esta "still nontrained" y que "it will be updated". No se especifica numero de tokens de entrenamiento, composicion del dataset, ni si se han aplicado tecnicas de alineacion como RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras). La unica referencia metodologica disponible es la declaracion de intenciones del proyecto: reconstruccion abierta a partir de datos publicos, metodos documentados e infraestructura reproducible.

## Capacidades

- Generacion de texto: no funcional en el estado actual. El checkpoint esta sin entrenar segun su propio autor, por lo que no produce texto coherente.
- Razonamiento, codigo y matematicas: no disponibles ni demostrados; no hay evaluaciones publicadas.
- Tool calling / function calling: no disponible. No se documenta ninguna plantilla de chat, parser de herramientas ni formato de mensajes.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades multilingues: no disponibles. El uso del tokenizador GPT-2 sugiere un sesgo hacia ingles, pero el autor no declara lista de idiomas.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), vision, audio ni otras modalidades.
- Capacidad estructural relevante: el repositorio permite cargar pesos de 514M parametros en safetensors, lo que habilita inspeccion de la arquitectura, pruebas de carga y validacion de pipelines de despliegue con contexto declarado de 131k tokens.

## Casos de uso

- Base para fine-tuning propio: al ser un checkpoint MIT sin entrenar, un equipo puede partir de el para aplicar su propio pipeline de preentrenamiento o SFT si la arquitectura resultase adecuada, evitando partir de cero en la inicializacion de pesos.
- Investigacion sobre contexto largo: los 131.000 tokens declarados permiten experimentar con tecnicas de atencion, cache KV y memoria eficiente (paging, quantized KV cache) en un modelo de solo 514M parametros, donde el coste de iteracion es bajo comparado con modelos de 7B o superiores.
- Validacion de infraestructura de despliegue: sirve como carga de prueba para verificar que vLLM, TGI o transformers configuran correctamente modelos pequenos con ventanas declaradas muy grandes, antes de pasar a modelos reales mas caros.
- Auditoria de tokenizador y pipeline de datos: al emplear el tokenizador GPT-2, permite medir ratios de compresion, cobertura de vocabulario y estrategias de troceado de secuencias en corpus propios.
- Referencia reproducible para proyectos de "reconstruccion abierta": equipos interesados en replicar metodologias publicas pueden usar el repositorio como punto de comparacion de estructura y convenciones de publicacion.
- Docencia y formacion: resulta util para explicar en cursos como se estructura un repositorio de pesos safetensors, como se inspecciona el numero de parametros y como se estima el coste de memoria de un modelo.
- Pruebas de cuantizacion a baja precision: tecnicamente es viable convertir los pesos a GGUF o a formatos de 8 y 4 bits para medir degradacion, aunque ese trabajo no esta publicado y requeriria el entrenamiento previo para tener resultados significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el propio autor indica que el modelo esta sin entrenar, por lo que cualquier evaluacion estandar careceria de sentido en este estado.

## Requisitos de hardware

- Peso de los parametros en memoria (calculado a partir de 514.154.690 parametros): aproximadamente 1,03 GB en FP16/BF16, 0,51 GB en INT8 y 0,26-0,30 GB en INT4.
- VRAM total: no disponible como dato medido. Ademas del peso, hay que sumar la cache KV, que con 131.000 tokens puede dominar el consumo y depende de capas y cabezas no publicadas.
- Estimacion ilustrativa de cache KV: con una hipotesis no confirmada de 24 capas y 16 cabezas KV con head_dim 64, una secuencia completa de 131.072 tokens en FP16 ocuparia del orden de 12-13 GB solo en cache. Si la arquitectura final usa GQA con menos cabezas KV, esa cifra se reduce proporcionalmente.
- GPU consumer: los pesos en FP16 caben sin problema en cualquier GPU con 6 GB o mas (RTX 3060, 4060, 4070, 4080, 4090). La limitacion real sera la cache KV si se pretende usar toda la ventana de contexto.
- GPU de datacenter: A100 40/80 GB, H100, L40S y A10G son suficientes para servir el modelo con margen sobrado en cuanto a pesos; a contexto completo el factor determinante vuelve a ser la cache KV y el batch concurrente.
- Opciones de despliegue: transformers es la via directa al estar los pesos en safetensors. vLLM y TGI son viables si la arquitectura es compatible con sus kernels. llama.cpp y Ollama requeririan una conversion a GGUF que no esta publicada y que podria no ser soportada si la arquitectura no esta implementada en esos proyectos.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de tiempo hasta el primer token publicados por el autor.

## Comparativa con modelos similares

La comparacion es limitada porque OpenMythos-0.7B-Preview no esta entrenado y, por tanto, no es funcionalmente equiparable a modelos que si lo estan. Se incluyen como referencia tres alternativas de tamano comparable entrenadas y con licencia permisiva, con datos tomados de sus respectivas model cards publicas.

| Modelo | Parametros | Contexto declarado | Licencia | Estado |
|---|---|---|---|---|
| OpenMythos-0.7B-Preview | 514M | 131.000 tokens | MIT | Sin entrenar, solo pesos iniciales |
| Qwen2.5-0.5B | ~0,49B | 32.768 tokens | Apache-2.0 | Entrenado e instruido, con variantes |
| SmolLM2-360M | ~0,36B | 8.192 tokens | Apache-2.0 | Entrenado, con versiones instruct |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens | Apache-2.0 | Entrenado, con versiones chat |

Diferencias clave: OpenMythos declara una ventana de contexto muy superior a la de estas alternativas, pero no ofrece pesos entrenados, plantillas de chat ni soporte declarado en frameworks de inferencia. Los modelos comparados cuentan con ecosistema de cuantizaciones GGUF/AWQ/GPTQ, integracion en vLLM, Ollama y llama.cpp, y resultados de benchmark publicados. No se dispone de datos de rendimiento de OpenMythos que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo sin entrenar: el propio autor indica "still nontrained". No debe usarse para generar texto, responder preguntas ni ninguna tarea de inferencia en produccion.
- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita evaluar calidad, sesgos o alineacion.
- Documentacion incompleta: no se especifican arquitectura, numero de capas, cabezas de atencion, datos de entrenamiento, idiomas ni plantilla de prompt.
- Contexto declarado no verificado: los 131.000 tokens aparecen solo en la model card; no hay evidencia publicada de que la implementacion de atencion los soporte de forma efectiva ni de como se gestiona la cache KV.
- Riesgo de alucinacion: en el estado actual, cualquier salida del modelo sera esencialmente ruido estadistico. El riesgo no es de alucinacion ocasional, sino de incoherencia sistematica.
- Idiomas: sin lista declarada. El tokenizador GPT-2 penaliza idiomas distintos del ingles, con fragmentacion elevada en castellano y otros idiomas con alfabetos no latinos.
- Licencia: MIT, permisiva y compatible con uso comercial, siempre que se conserve el aviso de copyright y la licencia. No se han declarado restricciones adicionales ni clausulas de uso aceptable.
- Ambiguedad de marca: el autor aclara que el proyecto no esta afiliado a Anthropic, Claude ni a ningun otro proyecto con la marca Mythos. Conviene no confundir este repositorio con productos comerciales de nombre similar.
- Madurez del repositorio: 3 descargas y 0 likes en el momento de la consulta, creado el 2026-09-15 y actualizado el 2026-09-19. Es un artefacto reciente, con alta probabilidad de cambios sustanciales o de reemplazo por una version entrenada.
- Uso en produccion: no recomendado. Cualquier integracion deberia esperar a una version entrenada y evaluada, y a la publicacion de la arquitectura y del pipeline de despliegue soportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onyx-ai/OpenMythos-0.7B-Preview
- Repositorio de codigo: no disponible en la informacion proporcionada
- Paper tecnico: no disponible
- Blog o anuncio del autor: no disponible
- Demo o espacio interactivo: no disponible
- Nota sobre la busqueda web: los resultados recuperados en la busqueda corresponden a entidades sin relacion con el modelo (el mineral onix, un restaurante en Paris y una marca de productos de limpieza), por lo que no se han incluido como enlaces relevantes.
