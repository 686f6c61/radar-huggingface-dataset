# ickma2311/zh-pii-tagger-35m

## Resumen

zh-pii-tagger-35m es un modelo de etiquetado de tokens (token classification) de 35 millones de parametros, desarrollado por el usuario de HuggingFace ickma2311 (Chao Ma), especializado en detectar datos personales en texto chino y en texto mixto chino-ingles. Se trata de un fine-tune de cjhwong/seatbelt-pii-tagger que conserva la misma arquitectura, tokenizer y esquema de 18 tipos de entidad con 73 etiquetas BIOES. El problema que resuelve es concreto: actuar como filtro local y por peticion antes de que un texto abandone la maquina, sin depender de un LLM generativo ni de servicios en la nube.

El fine-tune anade dos elementos respecto al modelo base: contextos reales en chino procedentes de FineWeb-2 con nombres y direcciones privadas sinteticos insertados, y una fase de replay por autodestilacion etiquetada por el propio modelo base, orientada a reducir el olvido de los tipos no chinos y del comportamiento en ingles. Con 35.449.033 parametros, un peso ONNX int8 de 35,6 MB y una latencia medida de 1,969 ms por pasaje en CPU, esta pensado para ejecutarse en local en hardware modesto.

Su relevancia actual es la de una pieza de infraestructura de privacidad: permite redactar PII en pipelines que procesan chino sin enviar el texto original a terceros. No obstante, el propio autor advierte de que no es una mejora universal ni una herramienta de anonimizacion legal, y publica resultados que muestran mejoras claras solo en determinados conjuntos y categorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (etiquetado de tokens, token classification) |
| Parametros totales | 35.449.033 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 en grafo ONNX fusionado; safetensors en precision original |
| Idiomas soportados | chino y texto mixto chino-ingles; el modelo base cubre ingles, chino simplificado y chino tradicional |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (grafo int8 fusionado) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT con cabeza de clasificacion de tokens, heredado directamente de cjhwong/seatbelt-pii-tagger. Mantiene el mismo tokenizer y el mismo esquema de etiquetado: 18 tipos de entidad y 73 etiquetas en formato BIOES. La salida son spans a nivel de caracter que requieren un paso de post-proceso para eliminar la puntuacion inicial y final de cada span, tanto en este modelo como en el base.

El entrenamiento consistio en una sola epoca de 3.008 pasos, con batch 32, learning rate 3e-5 y precision fp16, sobre una unica GPU Kaggle T4. Los datos empleados fueron 39.200 pasajes de FineWeb-2 con entidades insertadas, en los que los nombres detectados por jieba que el modelo base no etiquetaba se enmascararon fuera de la perdida, mas 57.062 textos de replay etiquetados por el modelo base (autodestilacion). Se entrenaron tres semillas (7, 77 y 777); el checkpoint publicado es el de la semilla 7, elegido por perdida de validacion. El modelo fue construido con asistencia de IA (Claude Code), segun la propia model card.

## Capacidades

- Deteccion y etiquetado de informacion personal identificable (PII) en chino y en texto mixto chino-ingles, con 18 tipos de entidad y 73 etiquetas BIOES.
- Cobertura especifica de categorias como persona, direccion, correo electronico y telefono; el resto de tipos hereda el comportamiento del modelo base.
- Salida basada en spans de caracteres, con recorte de puntuacion inicial y final mediante decodificador.
- Ejecucion local y por peticion, apta como filtro previo a la salida de texto de la maquina.
- Compatibilidad de runtime con ONNX (grafo int8 fusionado) y con safetensors.
- En ingles, el modelo solo fue evaluado para persona, correo electronico y telefono; el resto de tipos no se evaluaron.
- Al ser un modelo discriminativo de etiquetado, no soporta generacion de texto, tool calling, function calling ni razonamiento multi-paso de tipo agente.

## Casos de uso

- Filtrado previo en pipelines de LLM: el modelo se coloca antes de enviar un prompt a una API externa y redacta nombres, direcciones o telefonos, de modo que el texto original nunca sale de la infraestructura propia. Su coste de 1,969 ms por pasaje permite hacerlo de forma sincrona.
- Cumplimiento y gobernanza de datos en aplicaciones en chino: integrado en el backend, etiqueta PII en formularios, tickets o registros antes de almacenarlos o exportarlos, como capa tecnica de apoyo a politicas internas de proteccion de datos.
- Limpieza de corpus para entrenamiento: preprocesado de grandes volumenes de texto chino (por ejemplo, provenientes de FineWeb-2) para eliminar datos personales antes de usarlos en fine-tuning de otros modelos.
- Redaccion de logs y trazas de aplicaciones: al ejecutarse en CPU y con un peso int8 de 35,6 MB, puede incorporarse como paso de saneado en el propio servicio que genera los logs.
- Hook local en agentes sobre Apple Silicon: es compatible con el flujo del modelo base en el hook agent-seatbelt, aunque esta version no incluye paquete Core ML.
- Cascada con un modelo mayor: usar este etiquetador como primera etapa de bajo coste y derivar solo los casos dudosos a un LLM grande, dado que en el conjunto held-out de persona el modelo alcanza 0,731-0,736 frente al 0,680 de Qwen3-8B con un prompt zero-shot.
- Analisis exploratorio de documentos en investigacion: localizacion rapida de posibles menciones de personas o direcciones en corpus chinos para revision manual posterior, siempre con supervision humana.

## Benchmarks y rendimiento

Todos los valores son F1 estricto a nivel de span de caracteres, medidos por el autor. El modelo base y este modelo usan el mismo decodificador, que recorta la puntuacion inicial y final de cada span.

| Conjunto | Descripcion | seatbelt-pii-tagger | Este modelo (3 semillas) |
|---|---|---|---|
| zh-pii-ctx-heldout, persona | 1.875 pasajes reales de LCCC / zh-Wikipedia con nombres privados sinteticos insertados (generador held-out) | 0,698 | 0,731 / 0,732 / 0,736 |
| PII Bench ZH, persona | Publico (wan9yu/pii-bench-zh), 8.000 documentos de plantilla | 0,971 | 0,972-0,973 |
| PII Bench ZH, direccion | Mismo conjunto | 0,971 | 0,998 |
| Weibo NER test, persona (PER.NAM) | Publico, redes sociales reales, incluye figuras publicas | 0,351 | 0,398-0,417 |
| MSRA NER test, persona | Publico, noticias reales, incluye figuras publicas | 0,487 | 0,538-0,543 |
| Nemotron-PII test (1.000 documentos en ingles), F1 de solapamiento tipado persona / correo / telefono | Publico, ingles | 0,952 / 0,994 / 0,824 | 0,950-0,953 / 0,993-0,994 / 0,824-0,830 |

Referencias adicionales reportadas por el autor en los mismos subconjuntos, no comparables en coste:

| Referencia | Resultado |
|---|---|
| Qwen3-8B, prompt zero-shot unico, decodificacion greedy, fp16 en T4, aprox. 2,3 s por peticion | Held-out: persona 0,680; direccion 0,878. Muestra de 1.000 documentos de PII Bench: persona 0,978; direccion 0,918 |
| Baseline de reglas jieba nr + regex | Held-out persona 0,522 |
| Baseline argus-redact fast | Held-out persona 0,197 |

En el conjunto zh-pii-ctx-heldout la mejora en persona es de +3,3 a +3,9 puntos, con un limite inferior del 95 % por bootstrap emparejado de al menos +2,1 en todas las semillas. Una ablacion entrenada el mismo numero de pasos solo con datos de replay alcanza 0,700-0,708, lo que respalda una contribucion de los datos de entrenamiento anadidos, aunque no descarta otros factores.

Rendimiento medido: ONNX int8 con el modelo ya cargado, 4 hilos de CPU, Apple M-series y pasajes held-out de mediana 78 caracteres, la mediana es de 1,969 ms por pasaje frente a 1,980 ms del modelo base. El tamano del fichero es de 35,6 MB. Se trata de tiempo de procesamiento, sin incluir arranque ni carga del modelo. De forma derivada, esa latencia equivale a unos 508 pasajes por segundo en ese entorno concreto.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier configuracion; el fichero ONNX int8 pesa 35,6 MB y el modelo completo en safetensors ocupa 0,2 GB de repositorio. No requiere GPU.
- GPU recomendadas: no se especifica ninguna; el modelo se ha medido en CPU. Cabe holgadamente en cualquier GPU de consumo, incluida una RTX 4090 o inferior, y en GPUs integradas.
- Compatibilidad con GPU de consumo: si, sin restricciones practicas por memoria.
- Opciones de despliegue: ONNX Runtime con el grafo int8 fusionado; transformers con los pesos safetensors. El autor indica que esta version no incluye paquete Core ML y que Core ML no se exporto ni se probo; otras rutas de ejecucion no fueron verificadas. No aplican vLLM, TGI ni llama.cpp para este tipo de modelo discriminativo.
- Latencia: 1,969 ms por pasaje (mediana 78 caracteres) en ONNX int8, 4 hilos, Apple M-series. No es una garantia de latencia extremo a extremo; el arranque y la carga del modelo quedan excluidos.
- Throughput: no disponible de forma explicita; segun la latencia medida, aproximadamente 508 pasajes por segundo en ese entorno.
- Advertencia de despliegue: si se sustituyen ficheros en un directorio que aun contiene el `model.mlpackage` del modelo base, hay que eliminarlo, o el hook puede seguir ejecutando silenciosamente el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Tipos de PII | Idiomas | Licencia | F1 persona held-out | Latencia por peticion |
|---|---|---|---|---|---|---|
| zh-pii-tagger-35m | 35.449.033 | 18 tipos / 73 etiquetas BIOES | chino y mixto chino-ingles | Apache 2.0 | 0,731-0,736 | 1,969 ms (CPU, int8) |
| cjhwong/seatbelt-pii-tagger (base) | 35M | 18 tipos / 73 etiquetas BIOES | ingles, chino simplificado y tradicional | no disponible | 0,698 | 1,980 ms (CPU, int8) |
| Qwen3-8B (zero-shot) | 8.000 millones | no definido por esquema fijo; devuelve JSON | multilingue | no disponible | 0,680 | aprox. 2,3 s (T4, fp16) |
| jieba nr + regex | no aplica (reglas) | limitado a nombres | chino | no disponible | 0,522 | no disponible |
| argus-redact fast | no aplica (reglas) | no disponible | no disponible | no disponible | 0,197 | no disponible |

Frente al modelo base, la mejora se concentra en persona en contextos reales, direccion en PII Bench y persona en Weibo NER y MSRA, mientras que en el conjunto ingles de Nemotron-PII los valores se mantienen dentro de aproximadamente un punto. Frente a Qwen3-8B, el tagger ofrece una latencia tres ordenes de magnitud menor y un rendimiento superior en persona held-out, pero queda por debajo en direccion sobre ese mismo conjunto (0,848-0,856 frente a 0,878).

## Limitaciones y advertencias

- El conjunto held-out usa contextos reales pero entidades sinteticas, por lo que no mide la precision sobre datos privados reales.
- Los resultados en texto real son bajos en terminos absolutos: aproximadamente 0,41 en Weibo y 0,54 en MSRA para persona.
- El formato de direccion usado en entrenamiento y la decodificacion con recorte de puntuacion se eligieron tras un analisis de errores sobre PII Bench, de modo que la puntuacion de direccion en ese conjunto no es una estimacion independiente de generalizacion ni evidencia de precision sobre direcciones reales.
- La guia de etiquetado es la del modelo base y cubre solo personas privadas; los gold de Weibo y MSRA incluyen figuras publicas y el tratamiento de estas no se midio por separado.
- En ingles solo se evaluaron persona, correo electronico y telefono; el resto de categorias no se evaluaron.
- No es una herramienta de anonimizacion legal; debe combinarse con revision humana y controles adicionales en entornos regulados.
- Esta version no incluye paquete Core ML: Core ML no se exporto ni se probo. Ademas, la presencia residual del `model.mlpackage` del modelo base puede provocar que el hook siga ejecutando el modelo base sin aviso.
- Otras rutas de ejecucion distintas de las indicadas no fueron verificadas.
- Riesgo de alucinacion: no aplica al no ser un modelo generativo; el riesgo equivalente es el de falsos positivos y falsos negativos en los spans detectados.
- Sesgos conocidos: no se documentan sesgos especificos del modelo en la informacion disponible; el comportamiento depende de los datos de entrenamiento (FineWeb-2 y los conjuntos de PII empleados).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ickma2311/zh-pii-tagger-35m
- Codigo de entrenamiento y evaluacion, y conjunto held-out: https://github.com/ickma2311/zh-pii-tagger-eval
- Modelo base en HuggingFace: https://huggingface.co/cjhwong/seatbelt-pii-tagger
- Repositorio del modelo base: https://github.com/CJHwong/seatbelt-pii-tagger
- Perfil del autor en HuggingFace: https://huggingface.co/ickma2311
- Perfil del autor en Kaggle: https://www.kaggle.com/ickma2311
- Dataset HuggingFaceFW/fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset ai4privacy/pii-masking-openpii-1.5m: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Dataset Wismut/nym-pii-multilingual-data: https://huggingface.co/datasets/Wismut/nym-pii-multilingual-data
- Dataset nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Conjunto de evaluacion wan9yu/pii-bench-zh: https://huggingface.co/datasets/wan9yu/pii-bench-zh
