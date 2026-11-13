# dwsllc/DWSLM-256M-Base

## Resumen

DWSLM-256M-Base es un modelo de lenguaje de pequeno tamano entrenado desde cero por DWS Research (dwsllc), sin partir de pesos preentrenados de terceros. Emplea una arquitectura hibrida de atencion lineal: 15 capas de Kimi Delta Attention (KDA) combinadas con 5 capas de atencion global agrupada (GQA), en un total de 20 capas con dimension de modelo 1024. Aunque la nomenclatura comercial lo denomina "256M", el recuento real de parametros almacenados en safetensors es de 654.822.280 (286M de computo mas 369M de tablas de lookup), lo que conviene tener en cuenta al planificar el despliegue.

El modelo es una base model pura: no ha pasado por instruction tuning ni por entrenamiento de seguridad, por lo que su funcion es la continuacion de texto y la puntuacion de secuencias, no el dialogo instruido. Se entreno durante 23,61B tokens (una epoca de un corpus de 23,2B tokens mas 289M de tokens reformulados) con una longitud de contexto nativa de 4096 tokens. Existe una variante extendida a 32K tokens, DWSLM-256M-Base-32K.

Su relevancia actual reside en dos factores: la licencia Apache-2.0 sobre pesos y codigo, que permite uso comercial sin restricciones adicionales, y el uso de atencion lineal (KDA) que reduce el coste computacional a crecimiento lineal con la longitud. Cubre 17 idiomas (entre ellos espanol) mas codigo, y esta pensado como banco de pruebas reproducible de arquitecturas lineales a escala reducida, no como sustituto de modelos de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 15 capas de Kimi Delta Attention (lineal) + 5 capas de atencion global GQA, 20 capas, d=1024 |
| Parametros totales | 654.822.280 almacenados (286M de computo + 369M de lookup); 252M en bloques + 34M en cabeza |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (variante -32K: 32.768 tokens) |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en fp32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles, arabe, aleman, espanol, frances, hindi, indonesio, italiano, japones, coreano, neerlandes, polaco, portugues, ruso, turco, vietnamita, chino, mas codigo |
| Licencia | Apache-2.0 (pesos y codigo); los datos de entrenamiento conservan sus licencias propias |
| Formato de pesos | `model.safetensors`, fp32 (pesos maestros de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura se aparta del transformer denso convencional. Quince de las veinte capas usan Kimi Delta Attention, una atencion lineal con 8 cabezas de dimension 128, una convolucion causal corta (kernel 4) sobre q/k/v, decaimiento por canal derivado de un mapa de bajo rango y una RMSNorm con puerta sigmoide en la salida; el estado por cabeza tiene tamano fijo, de modo que el coste crece linealmente con la longitud. Las cinco capas restantes (posiciones 3, 7, 11, 15 y 19) son de atencion global con grouped-query attention (8 cabezas de query, 2 de KV, dimension 128), QK-norm, LeRoPE (escalas rotatorias aprendidas por banda), atencion varlen con mascara por documento y puerta sigmoide por cabeza. El flujo residual usa "block attention residuals": cada subcapa lee una mezcla softmax de 8 cabezas sobre el embedding de token, las salidas de grupos ya completados y la suma corriente del grupo actual, con un lambda aprendido que reinyecta el embedding crudo; las ramas se escalan por 8/20 (CompleteP). Ademas hay diez tablas de value embeddings indexadas por token, una por capa par, con puerta por cabeza hacia los valores de atencion, y un MLP con activacion ReLU al cuadrado de 1024 a 4096 y de vuelta a 1024.

El entrenamiento cubrio 23,61B tokens en 45.030 pasos, una epoca sobre un corpus de 23,2B tokens mas 289M de tokens reformulados. Las fuentes declaradas son FineWeb-Edu, FineWeb-2, Stack v3, Wikipedia, peS2o, OpenWebMath y varios conjuntos de dominio publico de PleIAs (English-PD, French-PD-Books, Russian-PD, US-PD-Newspapers, SEC). El tokenizador es propio, DWSLMTok32.3, BPE a nivel de byte con 32.768 tokens. La receta de optimizacion uso MuonH para matrices y AdamW para el resto. No se documenta RLHF ni DPO: es un modelo base sin alineamiento.

## Capacidades

- Continuacion de texto autoregresiva en 17 idiomas mas codigo, con contexto de 4096 tokens.
- Puntuacion de secuencias: `next_logits` acepta varias secuencias empaquetadas en un unico forward pass, cada una como segmento propio, lo que permite calcular log-probabilidades por opcion (util para evaluacion de opcion multiple).
- Generacion de codigo a nivel de continuacion (el corpus incluye Stack v3), sin garantias de correccion sintactica ni de ejecucion.
- Razonamiento basico de sentido comun y conocimiento general, limitado por el tamano (ver benchmarks).
- Capacidades multilingues en los 17 idiomas listados, con especial cobertura de ingles y de las lenguas con mas volumen en FineWeb-2.
- No soporta tool calling ni function calling de forma nativa.
- No soporta comportamiento agentico ni razonamiento multi-paso guiado por instrucciones: al no estar instruido, no sigue formatos de agente.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prototipado e investigacion de atencion lineal: sirve para reproducir y experimentar con KDA en un entorno controlado de 20 capas y 1024 de dimension, con el codigo de referencia incluido en el repositorio y pesos fp32 maestros.
- Puntuacion de opciones en pipelines de evaluacion: el empaquetado multi-secuencia de `next_logits` permite calcular la verosimilitud de cada candidato en una sola pasada, util para construir arneses de evaluacion tipo cloze sobre HellaSwag, ARC o PIQA.
- Generacion de texto asistida en edge o entornos con GPU modesta: con 655M parametros almacenados y contexto de 4K, el modelo cabe en GPU de consumo, lo que permite desplegarlo para autocompletado o borradores en local.
- Fine-tuning como base para tareas de dominio: al publicarse los pesos maestros fp32 y documentarse el schedule de aprendizaje, es viable ajustar el modelo con cualquier optimizador para clasificacion, extraccion o generacion especifica de un dominio.
- Generacion de codigo en continuacion (autocompletado de lineas o bloques) dentro de editores o scripts, sin esperar razonamiento sobre la intencion del usuario.
- Experimentos multilingues de bajo coste: evaluar transferencia entre los 17 idiomas en un modelo entrenado con un tokenizador propio y un corpus multilingue acotado.
- Docencia y divulgacion: ejemplo completo de pipeline desde cero (tokenizador, corpus, bucle de entrenamiento y evaluacion) con informe tecnico publico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (zero-shot cloze, acc_norm). La columna de verificacion indica que no han sido verificados de forma independiente.

| Benchmark | Metrica | Resultado |
|---|---|---|
| HellaSwag (validation) | acc_norm | 0,3522 |
| ARC-Easy (test) | acc_norm | 0,4444 |
| ARC-Challenge (test) | acc_norm | 0,2491 |
| PIQA (validation) | acc_norm | 0,6137 |
| WinoGrande (validation, winogrande_xl) | acc_norm | 0,5059 |
| MMLU (test, all) | acc_norm | 0,2723 |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni de benchmarks multilingues.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 655M parametros ocupan aproximadamente 2,6 GB, a los que se suma el estado de atencion y activaciones; en fp16/bf16 el peso baja a unos 1,3 GB. No se documentan cuantizaciones oficiales, por lo que las cifras en 8 o 4 bits son estimaciones no verificadas.
- GPU recomendadas: el codigo de referencia exige GPU NVIDIA. Con `attn: flash` (FlashAttention-2 varlen) requiere Ampere o posterior; el modo `cudnn` empleado en entrenamiento solo funciona en GPUs de datacenter Hopper y Blackwell.
- GPU de consumo: cabe en tarjetas con 8 GB o mas (RTX 3060, 4060, 4070, 4090) en fp16; en fp32 conviene disponer de 8-12 GB.
- Opciones de despliegue: no hay soporte en `transformers`; el repositorio incluye codigo propio en `dwslm/` y depende de los kernels Triton de flash-linear-attention. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Nota importante: el modelo no tiene KV cache, por lo que la generacion re-ejecuta el prefijo en cada token nuevo; el coste por token crece con la longitud generada pese a la atencion lineal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| DWSLM-256M-Base | 655M almacenados (286M de computo) | 4.096 | Hibrida KDA + GQA | Apache-2.0 | Base model, sin instruction tuning; codigo propio fuera de transformers |
| DWSLM-256M-Base-32K | 655M almacenados | 32.768 | Hibrida KDA + GQA | Apache-2.0 | Misma base extendida en contexto; disponible en el mismo autor |
| SmolLM-135M / 360M | 135M / 360M | 2.048 (ampliable) | Transformer denso | Apache-2.0 | Alternativa densa de tamano comparable, integrada en transformers |
| Qwen2.5-0.5B | 494M | 32.768 | Transformer denso con GQA | Apache-2.0 | Mayor contexto nativo y soporte amplio de tooling |

No se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no se ofrece comparacion numerica de rendimiento.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning ni entrenamiento de seguridad: no sigue instrucciones, no rechaza peticiones daninas y puede generar contenido inapropiado.
- Riesgo alto de alucinacion en conocimiento factual, especialmente en MMLU (0,2723) y ARC-Challenge (0,2491), propios de un modelo de este tamano.
- Contexto limitado a 4096 tokens en esta variante; para secuencias mayores hay que usar la variante de 32K.
- Sin KV cache, la generacion es lenta en secuencias largas: cada token nuevo re-ejecuta el prefijo completo.
- Cobertura desigual entre idiomas: el corpus esta dominado por ingles y las lenguas con mas volumen en FineWeb-2; el rendimiento en hindi, turco o vietnamita puede ser notablemente inferior.
- La licencia Apache-2.0 cubre pesos y codigo, pero los datos de entrenamiento conservan sus licencias propias; conviene revisar los terminos de cada conjunto (PleIAs, Stack v3, FineWeb) antes de usos comerciales derivados.
- La arquitectura no esta integrada en `transformers` y depende de kernels Triton de terceros (flash-linear-attention) y de GPU NVIDIA; no hay ruta documentada para CPU ni para aceleradores no NVIDIA.
- Los benchmarks son declarados por el autor y estan marcados como no verificados.
- El nombre "256M" no coincide con los 655M parametros almacenados: al dimensionar infraestructura hay que usar el recuento real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dwsllc/DWSLM-256M-Base
- Variante de contexto extendido: https://huggingface.co/dwsllc/DWSLM-256M-Base-32K
- Informe tecnico: https://research.dws.rip/llm/report
- Pagina del proyecto: https://research.dws.rip/llm
- Repositorio de kernels de atencion lineal (flash-linear-attention): https://github.com/fla-org/flash-linear-attention
