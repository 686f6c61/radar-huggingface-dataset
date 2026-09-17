# CharlieChen/loop-vanilla-d18

## Resumen

`loop-vanilla-d18` es un modelo de lenguaje base (no instruido) de 1.378.418.688 parametros almacenados en FP32, publicado por el usuario CharlieChen en HuggingFace. Se trata del checkpoint final original utilizado en la escalera de escalado sobre FineWeb del articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". La coordenada de profundidad d18 es la coordenada de escalado de la escalera y no tiene por que coincidir con el numero de bloques Transformer ejecutados.

El modelo pertenece a la familia de los looped transformers (transformers con repeticion de bloques), pero esta variante concreta es la "vanilla": el modo de profundidad es `none` y las repeticiones configuradas y de evaluacion final son 1, por lo que en la practica se comporta como una linea base sin recursion efectiva. El interes del artefacto es fundamentalmente cientifico: preserva el resultado original del entrenamiento para reproducir los exponentes de escalado del paper, no para despliegue en produccion.

Con 2048 tokens de contexto, tokenizador GPT-2 y un unico idioma declarado (ingles), es un modelo pequeno dentro del panorama actual, pero relevante para investigadores que estudian leyes de escalado, crecimiento de modelos y operadores de frontera. No incluye estado de optimizador, por lo que no permite reanudar el entrenamiento, y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT (looped transformer, variante vanilla con modo de profundidad `none`) |
| Parametros totales | 1.378.418.688 parametros almacenados en FP32 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene el checkpoint FP32; no se publican variantes cuantizadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`final.pt`), mas `result.json` y `SHA256SUMS`; no es un checkpoint `AutoModel` de Transformers |

Datos adicionales de configuracion: anchura 2304, 18 cabezas de atencion, vocabulario de 50.257 tokens (ampliado a 50.304 filas del modelo), modo de profundidad del modelo `none`, repeticiones del nucleo configuradas 1, repeticiones de evaluacion final 1, NLL de validacion de preentrenamiento 2,752295 nats/token. Tamano del repositorio: 5,5 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer autoregresivo de tipo GPT construido con un componente personalizado llamado `TransformerGPT`, reconstruido por el codigo del paper y no por `AutoModel` de Transformers. El articulo al que pertenece explora como el crecimiento del modelo, la recursion y los operadores de frontera influyen en los exponentes de escalado; la familia "looped-transformer" repite bloques del nucleo un numero determinado de veces. En este checkpoint concreto la recursion no se aplica: el modo de profundidad es `none` y la repeticion del nucleo configurada es 1, de modo que sirve como referencia vanilla frente a las variantes recursivas de la escalera.

El entrenamiento se realizo sobre el corpus FineWeb (dataset `HuggingFaceFW/fineweb`) con el tokenizador de GPT-2 (`tiktoken.get_encoding("gpt2")`). El paper emplea H100 con FlashAttention-3 y autocast en bfloat16. Se desconoce el numero exacto de tokens de entrenamiento, la composicion detallada del dataset y si hubo etapas de RLHF o DPO; al ser un modelo base sin instruction tuning, no consta alineacion posterior. La unica metrica de calidad registrada es la NLL de validacion sobre el propio corpus de preentrenamiento (2,752295 nats/token), que no equivale a la NLL de respuestas del benchmark CORE.

## Capacidades

- Generacion de texto autoregresiva en ingles, en modalidad de modelo base (completado de texto, no dialogo instruido).
- Modelado de lenguaje y calculo de verosimilitud (NLL) sobre texto en ingles, util para experimentos de evaluacion.
- Reproduccion de la escalera de escalado del paper: sirve como punto de referencia vanilla para comparar con variantes recursivas o con operadores de frontera.
- Evaluacion mediante el codigo del paper sobre el benchmark CORE (22 tareas) con semillas 0/1/2.
- No dispone de soporte de tool calling ni function calling declarado.
- No dispone de capacidades de agente, razonamiento multi-paso especializado ni modo "thinking".
- No dispone de capacidades de vision, audio ni multimodalidad.
- Capacidad multilingue limitada al ingles declarado; no se documentan otros idiomas.
- No es un modelo instruido: no sigue instrucciones ni mantiene formato de chat de forma fiable sin ajuste adicional.

## Casos de uso

- Reproduccion de resultados cientificos: el caso de uso principal es ejecutar `eval.py` del repositorio `cue-engineering/loop` con este checkpoint para reproducir las metricas CORE de la escalera de FineWeb. Es adecuado porque es el artefacto original del paper, no una reconstruccion.
- Estudio de leyes de escalado: comparar la NLL de validacion (2,752295 nats/token) y las puntuaciones CORE de esta variante vanilla frente a las variantes con recursion activa, manteniendo constante el corpus FineWeb y el tokenizador GPT-2.
- Punto de control base para experimentos de crecimiento de modelo: al tener 1,378 millones de parametros y anchura 2304 con 18 cabezas, sirve como configuracion de referencia para estudiar tecnicas de expansion de profundidad o anchura.
- Investigacion sobre operadores de frontera y recursion de bloques: permite aislar el efecto de la recursion al disponer de una contraparte sin repeticion del nucleo.
- Generacion de texto en ingles como modelo base: completado de texto, puntuacion de secuencias y generacion libre para tareas de investigacion, asumiendo que no esta alineado ni instruido.
- Fine-tuning academico: al ser un checkpoint PyTorch con metadatos portables (`result.json`), puede servir de inicializacion para ajustes supervisados en ingles, siempre que se resuelva la licencia.
- Evaluacion de infraestructura de inferencia: con 5,514 GB en FP32 y menos de 3 GB en bfloat16, es util para probar pipelines de atencion eficiente (FlashAttention-3) en GPU de gama alta y para validar conversiones a otros formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato numerico registrado por el autor es el siguiente:

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion de preentrenamiento | 2,752295 nats/token | Medida sobre el corpus de preentrenamiento; distinta de la NLL de respuestas CORE |
| Resultados CORE (22 tareas) | no disponible | El autor indica que las puntuaciones de "smoke test" con `--max-per-task 10` no equivalen a los resultados completos del paper |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GB en FP32 (pesos), en torno a 2,8 GB en bfloat16 y cerca de 1,4 GB en int8. Las cifras en 4 bits no estan publicadas y requeririan conversion propia.
- GPU recomendadas: el paper utiliza H100 con FlashAttention-3 y autocast en bfloat16. Cualquier GPU con al menos 8 GB y soporte de bfloat16 es suficiente por tamano de modelo.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB o superior, RTX 4070/4080/4090, o incluso GPUs de 8 GB en bfloat16 o int8, pueden alojar los pesos.
- Opciones de despliegue: el artefacto no es un checkpoint `AutoModel`, por lo que no funciona directamente con vLLM, TGI, llama.cpp u Ollama sin trabajo previo de conversion. El camino soportado por el autor es descargar el repositorio con `huggingface_hub.snapshot_download` y ejecutar `eval.py` del repositorio `cue-engineering/loop`, reconstruyendo el modelo `TransformerGPT` con `result.json`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparativa se limita a parametros, contexto, licencia y disponibilidad, ya que no se han publicado benchmarks de `loop-vanilla-d18`. Los datos de los modelos alternativos proceden de informacion publica general y se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| loop-vanilla-d18 | 1,38 B | 2.048 | no disponible | HuggingFace, 0 descargas, 0 likes | no disponible |
| GPT-2 XL | 1,5 B | 1.024 | modificada de MIT | ampliamente disponible | si, publicados por OpenAI |
| Pythia-1.4B | 1,4 B | 2.048 | Apache 2.0 | disponible en HuggingFace | si, suite de evaluacion publicada |
| OPT-1.3B | 1,3 B | 2.048 | licencia OPT (uso no comercial) | disponible en HuggingFace | si, publicados por Meta |

Diferencias clave: `loop-vanilla-d18` es el unico de la tabla pensado como artefacto de investigacion sobre escalado y recursion, y el unico sin licencia declarada, sin benchmarks estandar publicados y sin integracion directa con frameworks de inferencia habituales. Su tokenizador GPT-2 y su contexto de 2048 tokens lo situan en la misma liga de tamano que GPT-2 XL y Pythia-1.4B.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningun analisis de sesgos. Al entrenarse sobre FineWeb, hereda los sesgos y la distribucion de ese corpus web.
- Riesgo de alucinacion: alto en generacion libre, al ser un modelo base sin instruction tuning ni alineacion posterior.
- Limitaciones de contexto: ventana de solo 2048 tokens, insuficiente para tareas de contexto largo actuales.
- Limitaciones de idioma: solo ingles declarado; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera pobre.
- Licencia: no disponible. No hay autorizacion explicita de uso comercial, por lo que no deberia utilizarse en produccion sin aclarar los terminos con el autor.
- Restricciones tecnicas: no es un checkpoint `AutoModel` de Transformers; requiere el codigo del paper (`cue-engineering/loop`) para reconstruir el modelo `TransformerGPT`.
- No contiene estado del optimizador, por lo que no permite reanudar el entrenamiento desde este checkpoint.
- El propio autor advierte que las puntuaciones de evaluacion con `--max-per-task` limitado son "smoke tests" y no equivalen a los resultados completos del paper.
- Trazabilidad: el repositorio presenta 0 descargas y 0 likes, y las fechas de creacion y actualizacion (2026-09-16) estan muy proximas entre si, lo que sugiere una publicacion reciente sin validacion independiente por parte de la comunidad.
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo (los enlaces devueltos corresponden a Amazon WorkSpaces), por lo que no ha sido posible contrastar los datos del autor con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-vanilla-d18
- Repositorio de codigo del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Articulo: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (identificado en la model card; no se ha localizado URL en la busqueda web)
- Enlaces adicionales relevantes: no disponible (los resultados de busqueda web no contenian referencias utiles al modelo)
