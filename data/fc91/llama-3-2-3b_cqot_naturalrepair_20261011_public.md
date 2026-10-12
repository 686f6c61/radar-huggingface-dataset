# fc91/Llama-3.2-3B_CQoT_NaturalRepair_20261011_public

## Resumen

`fc91/Llama-3.2-3B_CQoT_NaturalRepair_20261011_public` es un adaptador LoRA de investigacion publicado por el usuario `fc91` sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion en formato PEFT/safetensors que debe cargarse junto al modelo base para poder utilizarse. El repositorio ocupa 3,9 GB e incluye, segun la model card, el adaptador, los estados del optimizador y los estados del generador de numeros aleatorios de Torch correspondientes a un punto de control intermedio identificado como `step026`.

El objetivo declarado del entrenamiento es la reparacion de errores naturales en borradores de razonamiento, con un protocolo experimental descrito en terminos de 23 revisiones verificadas de error natural, 23 revisiones de borrador valido y 32 objetivos de repeticion directa, sobre 26 actualizaciones y con una funcion de perdida que combina entropia cruzada de finalizacion (completion CE) y divergencia KL directa (stock forward KL), con el mismo peso objetivo total para cada tipo de entrenamiento. El propio autor advierte de que se trata de un adaptador experimental y que no es un razonador matematico verificado, y que el criterio de evaluacion principal es la reparacion genuina con retencion, no la mejora en resolucion directa.

El modelo es relevante unicamente como material de investigacion reproducible: publica commits de recuperacion auditables y fija las revisiones exactas del modelo base y del tokenizer utilizados. Con cero descargas y cero valoraciones en el momento de redactar esta ficha, y sin resultados de benchmarks publicados, no debe considerarse apto para produccion sin una auditoria previa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso. Modelo base: Llama 3.2 3B Instruct, con atención por grupos (GQA) |
| Parametros totales | No disponible para el adaptador (rango y modulos objetivo no declarados). Modelo base: 3210 millones |
| Parametros activos | No aplica (el modelo base es denso, no es un MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador. Modelo base: 128 000 tokens |
| Tipos de cuantizacion | No disponible. El adaptador se publica en safetensors; al fusionarse con el modelo base admite las cuantizaciones habituales del ecosistema Llama (GGUF, GPTQ, AWQ, bitsandbytes) |
| Idiomas soportados | No disponible en la ficha del adaptador. El modelo base declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, castellano y thai |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | safetensors en formato PEFT/LoRA. No incluye pesos del modelo base, respuestas de conjuntos de evaluacion ni tokens de autenticacion |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estandar de LoRA sobre un transformer decoder-only. El modelo base es Llama 3.2 3B Instruct, con atencion por grupos (GQA), ventana de contexto de 128 000 tokens y un vocabulario de 128 256 entradas. La model card fija la revision exacta del modelo base (`0cb88a4f764b7a12671c53f0838cd831a0843b95`) y del tokenizer empleado (`fc91/CQoT_SFT_mix_teacher_repair_round3_Llama-3.2-3B-HPC`, revision `1c0a3554332b7adaa03edf51df7840aa2b7652f4`), lo que permite reproducir el entorno de entrenamiento.

En cuanto al procedimiento, la informacion disponible describe un entrenamiento muy reducido en escala: 23 revisiones verificadas de error natural, 23 revisiones de borrador valido y 32 objetivos de repeticion directa, distribuidos en 26 actualizaciones de parametros. La funcion de perdida combina entropia cruzada de finalizacion con divergencia KL hacia el modelo de referencia (stock forward KL), y cada tipo de entrenamiento recibe el mismo peso objetivo total. El autor no especifica el rango de LoRA, los modulos a los que se aplica, la tasa de aprendizaje ni la composicion exacta del dataset mas alla de esas cifras. El repositorio publica estados del optimizador y del RNG de Torch, lo que sugiere que el punto de control `step026` esta pensado para reanudar el entrenamiento de forma determinista. No se declara uso de RLHF ni de DPO.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural heredados del modelo base Llama-3.2-3B-Instruct, incluyendo matematicas basicas y codigo, si bien el autor no aporta mediciones propias de estas capacidades.
- Reparacion de borradores de razonamiento: la capacidad que el autor declara como objetivo del entrenamiento es detectar y corregir errores en cadenas de razonamiento ya generadas, manteniendo la parte correcta del borrador original (retencion).
- Reanudacion determinista del entrenamiento: los commits de recuperacion incluyen el adaptador, el estado del optimizador y el estado del RNG de Torch, lo que permite continuar el ajuste desde el paso 26.
- Soporte de tool calling: no disponible en la informacion proporcionada; el modelo base lo soporta, pero no hay evidencia de que el adaptador lo preserve.
- Soporte de agentes y razonamiento multi-paso: no disponible. El autor advierte explicitamente de que los resultados no demuestran mejora en resolucion directa.
- Capacidades multilingues: no disponibles en la ficha del adaptador.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El modelo base es exclusivamente de texto.

## Casos de uso

- Investigacion en reparacion de razonamiento: el adaptador sirve como punto de partida reproducible para estudiar si un ajuste fino de muy pocos pasos mejora la correccion de borradores erroneos sin degradar la retencion del contenido valido.
- Reproduccion de experimentos: al publicarse los estados del optimizador y del RNG de Torch, permite reanudar el entrenamiento de forma determinista desde `step026` y comparar variantes del objetivo combinado CE + KL.
- Auditoria de adaptadores de bajo coste: util para medir cuanto peso necesita realmente un ajuste de comportamiento frente a un reentrenamiento completo de un modelo de 3B parametros.
- Estudio de funciones de perdida hibridas: el esquema de peso objetivo igualado por tipo de entrenamiento es un caso de estudio para analizar como la divergencia KL hacia el modelo de referencia limita el olvido catastrofico.
- Prototipado interno de post-procesado de cadenas de razonamiento: en un entorno controlado, podria probarse como corrector de segundo paso sobre salidas de otros modelos, siempre que se valide con datos propios.
- Docencia sobre el ecosistema PEFT: el repositorio ilustra el ciclo completo de publicacion de un adaptador LoRA con trazabilidad de revisiones de modelo base y tokenizer.

No se recomienda su uso en produccion con clientes finales, en sistemas de decision automatizada ni en ningun flujo donde un error no detectado tenga consecuencias, dado que no existen evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica reportada por el autor es de naturaleza procedimental: 23 revisiones verificadas de error natural, 23 revisiones de borrador valido, 32 objetivos de repeticion directa y 26 actualizaciones, con un criterio de exito definido como reparacion genuina con retencion. No hay valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM para el modelo base en precision de 16 bits: aproximadamente 6,4 GB solo para los pesos, mas la cache KV, que crece de forma lineal con la longitud de contexto y el tamano de lote.
- VRAM del adaptador: no disponible con precision, ya que no se declara el rango de LoRA ni los modulos objetivo. El repositorio completo ocupa 3,9 GB, pero esa cifra incluye estados del optimizador y del RNG, de modo que el adaptador desnudo es una fraccion de ese total. Como referencia de orden de magnitud, un adaptador LoRA tipico sobre un modelo de 3B en fp16 ocupa decenas de megabytes.
- VRAM total estimada en 16 bits: en torno a 7-8 GB con contexto moderado, lo que encaja en tarjetas de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090.
- VRAM estimada en cuantizacion de 4 bits del modelo base fusionado: en torno a 2-2,5 GB, lo que permite ejecucion en GPUs de gama media y en equipos con 8 GB de VRAM, e incluso en CPU con llama.cpp.
- GPUs recomendadas: RTX 4090 o A100/H100 para entrenamiento o para reanudar el ajuste desde `step026`; RTX 3060 12 GB o superior para inferencia.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM con soporte de LoRA, TGI con adaptadores, o fusion del adaptador con el modelo base seguida de conversion a GGUF para llama.cpp y Ollama.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fc91/Llama-3.2-3B_CQoT_NaturalRepair | Adaptador LoRA sobre 3,21 mil millones | No disponible (base: 128 000) | Adaptador de investigacion | Llama 3.2 Community | HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3210 millones | 128 000 | Modelo completo ajustado por instrucciones | Llama 3.2 Community | HuggingFace, ampliamente desplegado |
| Qwen2.5-3B-Instruct | 3100 millones | 32 768 (128 000 con RoPE scaling) | Modelo completo ajustado por instrucciones | Apache 2.0 | HuggingFace |
| Phi-3.5-mini-instruct | 3800 millones | 128 000 | Modelo completo ajustado por instrucciones | MIT | HuggingFace |

La comparacion relevante es siempre contra el propio modelo base: este adaptador no modifica el numero de parametros, la ventana de contexto ni la licencia, solo el comportamiento aprendido en 26 actualizaciones. Frente a alternativas completas de la misma categoria, Qwen2.5-3B-Instruct y Phi-3.5-mini-instruct ofrecen licencias permisivas (Apache 2.0 y MIT) frente a la licencia Llama 3.2, ademas de resultados de benchmarks publicados.

## Limitaciones y advertencias

- El propio autor declara que el adaptador es experimental y que no es un razonador matematico verificado.
- No hay resultados de benchmarks publicados, por lo que no puede afirmarse ninguna mejora de rendimiento frente al modelo base. El criterio de exito declarado (reparacion genuina con retencion) no equivale a mejora en resolucion directa.
- El volumen de entrenamiento es extremadamente reducido (26 actualizaciones, decenas de ejemplos por tipo), lo que hace muy probable el sobreajuste al conjunto de entrenamiento y limita la generalizacion.
- Riesgo de alucinacion: no medido ni documentado. La reparacion de borradores puede introducir contenido nuevo no presente en el original.
- Sesgos: no documentados. El adaptador hereda los sesgos del modelo base y no se describe ningun proceso de alineacion adicional.
- Limitaciones de idioma: la ficha no declara idiomas soportados y el ajuste, si se realizo en ingles, puede degradar el comportamiento en otros idiomas respecto al modelo base.
- Licencia: se hereda la Llama 3.2 Community License, que impone condiciones adicionales (atribucion "Built with Llama", obligaciones de nomenclatura, restricciones de uso para organizaciones con mas de 700 millones de usuarios mensuales y limitaciones en el uso de salidas para entrenar otros modelos). Es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Trazabilidad: el autor indica que el adaptador debe cargarse desde el commit inmutable `step026` del informe de CPU y solo si auditorias posteriores justifican su uso. Cualquier otro punto de control del repositorio no esta validado.
- Adopcion nula: cero descargas y cero valoraciones, sin validacion independiente por parte de terceros.
- Contenido no publicado: no se suben respuestas de conjuntos reservados, tokens de autenticacion ni pesos del modelo base, de modo que la evaluacion completa no puede reproducirse sin acceso propio al modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fc91/Llama-3.2-3B_CQoT_NaturalRepair_20261011_public
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Revision del modelo base: `0cb88a4f764b7a12671c53f0838cd831a0843b95`
- Tokenizer empleado: https://huggingface.co/fc91/CQoT_SFT_mix_teacher_repair_round3_Llama-3.2-3B-HPC
- Revision del tokenizer: `1c0a3554332b7adaa03edf51df7840aa2b7652f4`
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Paper, blog o demo adicionales: no disponible
