# gxydResearch/lanlao

## Resumen

lanlao es un modelo de decision de un solo paso (single-forward) desarrollado por **gxydResearch**, identificado en su model card como el grupo de IA de Guangxi Mobile (广西移动人工智能专班). No es un modelo generativo: recibe un estado (una afirmacion o caso, `state`) y un conjunto acotado de criterios (`rubric`) y devuelve, en una unica pasada por la red, una eleccion entre opciones, una confianza y la distribucion de probabilidad completa. No decodifica texto de forma autorregresiva y no produce lenguaje natural, lo que lo situa en la categoria de modelos de decision tipo Jev.

Tecnicamente se implementa como un adaptador LoRA (rank 32, alpha 64, sobre `q/k/v/o_proj`, ~25 MB) montado sobre el modelo base congelado `Qwen/Qwen3.5-4B` en bf16. La cabeza de decision reutiliza los logits del ultimo token, restringidos a los slots de las letras A-P (hasta 16 opciones), y aplica softmax para obtener la distribucion sobre las alternativas. Soporta tres tipos de pregunta en una misma peticion: `choice` (eleccion multiple), `noul` (si/no, devuelve p_yes) y `score` (escala ordinal, devuelve el nivel esperado en [0,1]).

Su relevancia actual esta en el coste de inferencia: al eliminar la decodificacion autorregresiva, resuelve decisiones estructuradas en decenas de milisegundos (79 ms en una RTX 4090 sobre un set bilingue de 100 casos, frente a 673 ms del Jev oficial segun los datos de la propia model card) y permite plantear varias preguntas sobre el mismo `state` compartiendo prefijo, es decir, varios resultados de decision en un solo forward. La licencia es Apache 2.0, aunque el modelo base Qwen3.5-4B tiene su propia licencia que debe verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-4B congelado) + adaptador LoRA y cabeza de decision sobre logits del ultimo token (slots A-P) |
| Parametros totales | ~4B (modelo base Qwen3.5-4B); el adaptador LoRA aporta aproximadamente 25 MB de pesos |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible; se hereda de la longitud de contexto del modelo base Qwen3.5-4B |
| Tipos de cuantizacion | No disponible (la model card describe el uso en bf16; no se listan variantes cuantizadas ni GGUF) |
| Idiomas soportados | No disponible como lista oficial; los datos de entrenamiento y evaluacion son ingles y chino (NLI en ingles, CMNLI en chino, set de prueba bilingue en50 + zh50) |
| Licencia | Apache 2.0 (aplicable al adaptador; el modelo base Qwen3.5-4B se distribuye bajo su propia licencia) |
| Formato de pesos | Adaptador LoRA en `rlcd_score43k_v5.pt` (~25 MB); tras `merge_export.py`, directorio estandar de HuggingFace (~8 GB) en safetensors. Repositorio Tamano indicado: 0.0 GB |

Otros datos relevantes: `pipeline_tag` es `text-classification`, la libreria declarada es `transformers`, el modelo base es `Qwen/Qwen3.5-4B`, y la model card indica que la peticion y respuesta es compatible con el protocolo de los modelos Jev de TypeSafe AI.

## Arquitectura y entrenamiento

El modelo no genera tokens: sobre el Qwen3.5-4B congelado se entrena un LoRA (rank 32, alpha 64, `target_modules = q/k/v/o_proj`, dropout 0) y la decision se implementa como "un solo forward + softmax sobre slots de letras". Los logits del ultimo token se restringen a los slots A-P (maximo 16 opciones) y se normalizan con softmax, produciendo la distribucion de probabilidad de las opciones. No hay segunda cabeza ni decodificacion autorregresiva. `enable_thinking` se fuerza a `False` porque la plantilla de chat de Qwen3.5 lo exige. Las tres modalidades (`choice`, `noul`, `score`) pueden coexistir en la misma peticion compartiendo el prefijo del `state`, de modo que un unico forward devuelve varias decisiones.

El entrenamiento consta de dos fases sobre un dataset denominado bi35k: 10.000 ejemplos de NLI publico en ingles, 5.000 de CMNLI publico en chino y 20.000 ejemplos sinteticos generados por un profesor DeepSeek y validados mediante "solver" ciego (el sintetico representa el 57 % del total). El sintetico en chino reutiliza los identificadores de opcion y las plantillas de familia del ingles para mantener coherencia estructural entre idiomas. La fase 1 (SFT, 2 epocas) usa una perdida conjunta CE(letter-slot) + lambda=1.0 x |conf - correct|, lo que introduce la calibracion dentro de la propia distribucion de probabilidad (ECE 0.026 tras esta fase). La fase 2 (RLCD, refuerzo) emplea la recompensa `reward = conf x (2 x correct - 1)`, de forma que las muestras incorrectas no puntuan, con regularizacion de entropia beta=0.01, advantage estrictamente detachado, lr 2e-5 en una sola pasada y arranque en caliente desde la fase 1; esto eleva la exactitud en perturbations108 de 0.965 a 0.972. El checkpoint final se llama `rlcd_score43k_v5.pt`.

## Capacidades

- Decision estructurada de un solo paso: clasificacion sobre un conjunto acotado de opciones sin generar texto, con salida de opcion, confianza y distribucion completa de probabilidades.
- Tres tipos de pregunta en el mismo endpoint: `choice` (dict desordenado de 2 a 16 opciones), `noul` (si/no, devuelve p_yes, sin criterios adicionales) y `score` (lista ordenada de niveles; el resultado es el nivel esperado en [0,1]).
- Multiples decisiones en un solo forward: las preguntas de una peticion comparten el prefijo del `state`, por lo que se resuelven simultaneamente.
- Calibracion integrada: el entrenamiento incluye un termino explicito de calibracion y una fase de refuerzo que penaliza la confianza en respuestas incorrectas; los ECE reportados estan entre 0.022 y 0.041.
- Capacidad bilingue ingles-chino en la practica: datos de entrenamiento y set de evaluacion en ambos idiomas.
- Compatibilidad con el protocolo de peticion/respuesta de los modelos Jev (TypeSafe AI), de modo que un cliente Jev puede redirigirse a este modelo.
- Inferencia de baja latencia: 70-90 ms con 2-4 opciones y 79 ms de medida agregada en la ejecucion sobre 100 casos en una RTX 4090.
- Despliegue en dos modos: LoRA en caliente con peft, o fusion de pesos y servicio con vLLM usando `max_tokens=1` y `logprobs=20`, tomando los slots A-P de los top logprobs.
- No soporta: generacion de texto, razonamiento multi-paso explicito, tool calling, agentes, vision ni audio (no documentado en la informacion disponible).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y un `criteria` de tipo `choice` con los equipos disponibles (facturacion, tecnico, ventas); devuelve la opcion y su probabilidad. Es adecuado porque el enrutamiento es una decision acotada que no necesita generar texto y porque 70-90 ms por caso permite clasificar en linea dentro del propio flujo de atencion.
- Moderacion de contenido con umbral de confianza: con una pregunta `noul` sobre politicas concretas ("el mensaje incumple la politica X"), se obtiene p_yes y se puede fijar un umbral de derivacion a revision humana para los casos con confianza baja, usando la distribucion devuelta como criterio de escalado.
- Triaje de urgencia y sentimiento en atencion al cliente: combinando un `noul` (`is_urgent`) y un `score` (`frustration` con niveles "tranquilo / frustrado pero civil / muy enfadado") sobre el mismo `state`, se obtienen varias etiquetas con un solo forward, lo que abarata el pipeline respecto a ejecutar varios clasificadores por separado.
- Deteccion de phishing y riesgo financiero: la model card incluye entre sus demos un escenario de riesgo financiero y otro de correo de phishing; el modelo puntua la probabilidad de que el caso pertenezca a una categoria de riesgo, con una confianza calibrada que permite priorizar alertas.
- Revision de codigo y puntuacion de evaluaciones: el tipo `score` con una lista ordenada de niveles permite emitir una puntuacion ordinal (por ejemplo, calidad de un parche o de una revision) con nivel esperado en [0,1], util para ordenar candidatos antes de una revision humana.
- Evaluacion automatica de respuestas (LLM-as-judge con rubrica): dado un par pregunta/respuesta como `state` y una rubrica de opciones, el modelo produce la etiqueta y la confianza; al no generar texto, el coste por evaluacion es una fraccion del de un juez generativo y la salida es directamente parseable.
- Etiquetado a gran escala para construir datasets: la variante fusionada con vLLM, usando `max_tokens=1` y `logprobs=20`, permite procesar lotes con alta concurrencia y generar etiquetas con distribucion de probabilidad asociada.
- Clasificacion de intenciones en asistentes conversacionales: `choice` con las intenciones soportadas por el bot, resuelto en decenas de milisegundos, encaja como paso previo al enrutado del dialogo.
- Verificacion de afirmaciones contra criterios: `noul` sobre si un texto satisface una condicion concreta, con p_yes como medida graduada en lugar de una decision binaria.

## Benchmarks y rendimiento

Resultados de autoevaluacion del desarrollador sobre conjuntos congelados, con la columna de comparacion correspondiente a las metricas publicas del Jev oficial. Se presentan exactitud (acc) y error de calibracion esperado (ECE).

| Evaluacion | lanlao | Jev oficial |
|---|---|---|
| authored144 | 0.965 / ECE 0.026 | 0.979 / ECE 0.048 |
| perturbations108 | 0.972 / ECE 0.022 | 1.000 / ECE 0.005 |
| Set bilingue de practica (100 casos, en50 + zh50) | 0.950 / ECE 0.041 / 79 ms (RTX 4090) | 0.970 / ECE 0.031 / 673 ms |

Desglose por tipo de pregunta en el set bilingue de 100 casos:

| Tipo | lanlao | Jev oficial |
|---|---|---|
| choice | 0.983 (coincidencia linea a linea con las predicciones de Jev) | 0.983 |
| noul | 0.900 | 0.900 |
| score | 0.900 (v1.0 era 0.850; +0.05 tras el reentrenamiento ordinal; 0.955 en el conjunto de retencion) | 1.000 |

Notas: no hay benchmarks estandar de la literatura (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es generativo y se evalua como clasificador de decision. Los numeros proceden del propio desarrollador y las metricas de la columna de comparacion, de las cifras publicas de Jev citadas en la model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB en bf16 para el modelo base con LoRA; segun la model card se puede ejecutar con 12 GB, y se recomienda un minimo de 16 GB.
- GPU: NVIDIA con CUDA 12.x. La medicion de latencia reportada se hizo en una RTX 4090. No se especifican otras GPU en la informacion disponible.
- Consumer GPU: si, cabe en tarjetas de gama alta con 12-16 GB o mas de VRAM (por ejemplo RTX 4090); con 12 GB es viable segun el fabricante, sin margen documentado para lotes grandes.
- Software: Python 3.10+, `torch>=2.6`, `transformers>=5.0` (necesario porque la clase nativa `Qwen3_5ForCausalLM` no existe en versiones anteriores), `peft>=0.15`, `numpy>=1.24`.
- Opciones de despliegue: servidor propio `systemone_server.py` en modo `lora` (con peft) o en modo `direct` sobre los pesos fusionados; tras `merge_export.py`, el directorio resultante es un modelo HuggingFace estandar y se puede servir con `vllm serve` usando `max_tokens=1` y `logprobs=20`. No se documentan soporte de llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia: 70-90 ms por peticion con 2-4 opciones en RTX 4090; 79 ms de media agregada sobre 100 casos bilingues; 82,1 ms en el ejemplo de respuesta de la model card.
- Throughput: no disponible. La carga inicial (fusion de LoRA y carga del modelo) tarda aproximadamente 1-2 minutos; la fusion de pesos es un proceso de un solo uso de unos 3 minutos y genera un directorio de unos 8 GB.
- Requisito de compatibilidad: el adaptador solo funciona con Qwen3.5-4B; usar otra version de Qwen provoca desajuste de formas (`shape mismatch`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Exactitud (set bilingue 100 casos) | ECE | Latencia | Licencia / disponibilidad |
|---|---|---|---|---|---|---|---|
| lanlao (gxydResearch) | Base ~4B + LoRA ~25 MB | No disponible (heredado de Qwen3.5-4B) | Decision single-forward, 3 tipos de pregunta, sin generacion | 0.950 (choice 0.983 / noul 0.900 / score 0.900) | 0.041 | 79 ms (RTX 4090) | Apache 2.0, descarga abierta en HuggingFace |
| Jev oficial (TypeSafe AI) | No disponible | No disponible | Decision single-forward, protocolo de referencia | 0.970 (choice 0.983 / noul 0.900 / score 1.000) | 0.031 | 673 ms | No disponible (cifras citadas como metricas publicas) |
| Qwen3.5-4B (modelo base sin adaptador) | ~4B | No disponible en la informacion proporcionada | LLM generativo denso | No comparable: no implementa el protocolo de decision | No disponible | No disponible | Licencia propia del modelo base |

No se dispone de informacion sobre otros modelos de decision single-forward comparables aparte de Jev, por lo que la comparativa se limita a esos dos y al modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible. El 57 % del entrenamiento es datos sinteticos generados por un profesor DeepSeek, lo que puede introducir los sesgos de ese generador y de las plantillas utilizadas (las plantillas chinas reutilizan las familias del ingles).
- Alucinacion: al no generar texto libre, no existe alucinacion en el sentido generativo, pero si riesgo de decisiones erroneas con confianza alta. Las metricas reportadas muestran un ECE de 0.022-0.041, es decir, la confianza no es perfectamente fiable y conviene aplicar umbrales en produccion.
- Limitacion de alcance: el modelo solo responde a las preguntas definidas en `criteria`; no razona fuera de las opciones dadas, no hace tool calling ni agentes, y no puede justificar su decision en lenguaje natural.
- Limite de opciones: la cabeza de decision esta restringida a los slots A-P, un maximo de 16 opciones por pregunta.
- Idiomas: la lista oficial de idiomas no esta disponible. El soporte esta demostrado empiricamente en ingles y chino (entrenamiento y evaluacion), pero no hay datos para otros idiomas, incluido el espanol.
- Limitaciones de contexto: la longitud de contexto no se especifica y queda supeditada al modelo base; tampoco hay informacion sobre el comportamiento con `state` muy largos.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el modelo base Qwen3.5-4B tiene su propia licencia, que hay que revisar antes de un uso comercial. Las cifras de la columna de Jev son metricas publicas ajenas, no una validacion independiente.
- Caveats de produccion: la inferencia requiere `transformers>=5.0` por la clase `Qwen3_5ForCausalLM`, y `enable_thinking=False` en la plantilla de chat; el adaptador es incompatible con otras versiones de Qwen. El repositorio aparece con 0 descargas y 0 "likes", con un tamano declarado de 0.0 GB y fechas de creacion/actualizacion de 2026-09-30, datos que no concuerdan con los ~25 MB del archivo LoRA descritos; conviene verificar la integridad de los archivos antes de desplegar. La model card esta truncada en la seccion de archivos, por lo que parte del manual de despliegue no es visible. Los resultados de benchmarks son autoevaluaciones del desarrollador y no se han replicado de forma independiente.
- La busqueda web realizada no devolvio informacion relevante sobre este modelo: los resultados obtenidos corresponden a otros sistemas (LLaMA, GeoDiff, rankings generales de LLM) y no aportan datos verificables sobre lanlao.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/gxydResearch/lanlao
- Modelo base: https://www.modelscope.cn/models/Qwen/Qwen3.5-4B (referenciado en la model card; tambien disponible como `Qwen/Qwen3.5-4B` en HuggingFace)
- Repositorio de codigo y pesos: incluido en el propio repositorio de HuggingFace (archivos `systemone_server.py`, `merge_export.py`, `realworld_compare.py`, `requirements.txt`, `rlcd_score43k_v5.pt`); el autor lo distribuye tambien como `lanlao-v1.1.0.tar.gz` con el directorio `semif-systemone/`
- Paper: no disponible
- Blog tecnico del autor: no disponible
- Demo publica: no disponible
- Modelos Jev de TypeSafe AI (protocolo de referencia): no se proporciona URL en la informacion disponible
