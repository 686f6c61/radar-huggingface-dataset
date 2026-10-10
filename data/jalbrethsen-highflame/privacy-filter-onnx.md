# jalbrethsen-highflame/privacy-filter-onnx

## Resumen

privacy-filter-onnx es una conversion a formato ONNX del modelo openai/privacy-filter, un clasificador de tokens disenado para detectar informacion personal identificable (PII) en texto. La publica el usuario jalbrethsen-highflame y no introduce pesos nuevos: reutiliza integramente los pesos de OpenAI bajo licencia Apache-2.0 y aporta unicamente grafos ONNX reescritos.

El modelo base es un transformer con mezcla de expertos (MoE) cuya tarea es etiquetar cada token con categorias como persona privada, correo electronico, telefono o numero de cuenta. La innovacion de esta conversion es sustituir la atencion densa L x L por atencion en bandas, aprovechando que el modelo original solo atiende 128 tokens a cada lado. El resultado son las mismas salidas con latencia y memoria que crecen de forma lineal con la longitud de entrada.

Es relevante para despliegues de deteccion de PII sobre textos largos (contratos, historiales, logs), donde la atencion densa dispara el consumo. Segun las mediciones del autor, una pasada de 16.384 tokens con la variante int8 original consume 90,8 GB de RSS en CPU, frente a 6,0 GB de la version en bandas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y atencion en bandas (ventana local de 128 tokens por lado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero no se detalla numero de expertos ni parametros activos) |
| Longitud de contexto | no documentada de forma explicita; probado hasta 32.768 tokens |
| Tipos de cuantizacion | fp32, fp16, int8, q4, q4f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos de OpenAI); el codigo de conversion es MIT |
| Formato de pesos | ONNX (grafo + ficheros externos de pesos `*.onnx_data`), mas `tokenizer.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo base openai/privacy-filter es un transformer con mezcla de expertos (MoE) que resuelve una tarea de clasificacion de tokens: cada token recibe una etiqueta con esquema BIO/BIES dentro de un conjunto de categorias de PII. La atencion del modelo original es local, con una ventana de 128 posiciones a cada lado. Sin embargo, los ficheros ONNX publicados originalmente materializan una matriz densa L x L, de modo que el coste de atencion crece de forma cuadratica aunque la mayoria de las posiciones no aporten informacion util.

Esta conversion reescribe unicamente los grafos ONNX para computar la atencion en bandas, manteniendo los ficheros de pesos (`*.onnx_data`) byte a byte identicos a los del repositorio upstream y preservando nombres, variantes (fp32, fp16, int8, q4, q4f16), entradas, salidas y opset. No se ha realizado ningun entrenamiento adicional ni ajuste fino: el trabajo es exclusivamente de conversion y optimizacion de inferencia. Los detalles sobre dataset de entrenamiento, numero de tokens o tecnicas de alineacion del modelo base no se detallan en la informacion disponible.

## Capacidades

- Deteccion de informacion personal identificable (PII) a nivel de token, con etiquetas como `private_person`, `private_email`, `private_phone` y `account_number`.
- Pipeline de token-classification con esquema BIES, que permite fusionar etiquetas por token en spans de texto.
- Procesamiento de entradas largas con coste lineal: latencia y memoria crecen de forma proporcional a la longitud del texto.
- Varias variantes cuantizadas para distintos compromisos entre precision, tamano y velocidad (fp32, fp16, int8, q4, q4f16).
- Decodificacion de spans opcional mejorada mediante el decodificador de Viterbi de la herramienta `opf` de OpenAI y `viterbi_calibration.json`.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.
- Capacidades multilingues: no disponibles (los idiomas no se indican).

## Casos de uso

- Anonimizacion de documentos largos: al crecer la memoria de forma lineal, permite procesar contratos o informes de decenas de miles de tokens en una sola pasada, algo inviable con los ficheros densos (90,8 GB a 16.384 tokens en int8).
- Cumplimiento del RGPD en logs de aplicacion: el modelo etiqueta correos, telefonos y numeros de cuenta en flujos de texto antes de almacenarlos o enviarlos a terceros.
- Preprocesado de datasets de entrenamiento: deteccion y enmascarado de PII en grandes volumenes de texto antes de reutilizarlos, apoyandose en las variantes q4 (0,9 GB de descarga) para ejecutar en CPU.
- Enmascarado en plataformas de atencion al cliente: integrado en el backend, redacta datos personales en conversaciones multi-turno antes de que se guarden o se muestren en paneles internos.
- Auditoria de repositorios y tickets: revision de issues, pull requests o tickets de soporte para localizar datos personales filtrados de forma accidental.
- Higiene de datos en entornos sanitarios o financieros: deteccion previa a la exportacion de informacion sensible, con decodificacion en spans para preservar los limites exactos de cada entidad.
- Redaccion de informes legales: sustitucion de nombres, correos y numeros de cuenta por marcadores antes de compartir borradores entre despachos o con clientes.

## Benchmarks y rendimiento

Mediciones del autor con onnxruntime 1.31 en CPU, 8 hilos, batch 1 y texto sintetico (latencia mediana y RSS pico):

| Tokens | int8 publicado | int8 en bandas | fp32 publicado | fp32 en bandas |
|---:|---|---|---|---|
| 512 | 0,10 s / 1,9 GB | 0,09 s / 1,9 GB | 0,18 s / 4,4 GB | 0,19 s / 4,3 GB |
| 2.048 | 0,74 s / 3,4 GB | 0,37 s / 2,2 GB | 0,94 s / 6,3 GB | 0,57 s / 5,0 GB |
| 8.192 | 8,27 s / 25,7 GB | 1,50 s / 3,5 GB | 8,93 s / 28,9 GB | 2,16 s / 6,7 GB |
| 16.384 | 31,1 s / 90,8 GB | 3,04 s / 6,0 GB | no ejecutado | 4,38 s / 9,5 GB |
| 32.768 | no ejecutado | 6,16 s / 9,6 GB | no ejecutado | 9,20 s / 13,6 GB |

A 128 tokens los ficheros en bandas son entre un 4 % y un 10 % mas lentos (unos 3 ms) porque la secuencia se rellena hasta un bloque de 128 tokens; a partir de unos 512 tokens igualan o superan a los publicados.

En cuanto a paridad de resultados: fp32 y q4 coinciden con los ficheros publicados en torno a 2e-5 en los logits, con argmax identico por token. Las variantes int8, fp16 y q4f16 varian en la misma magnitud cuando solo cambia el numero de hilos, y las versiones en bandas se mantienen dentro de ese margen (concordancia de argmax igual o superior al 99,94 %). Sobre 2.000 filas del split de validacion de PII-Masking-300k, evaluadas con `opf eval`, los ficheros publicados y los en bandas dan el mismo F1 de token y de span para fp32, int8 y q4.

## Requisitos de hardware

- Memoria (medida en CPU por el autor, RSS pico): int8 en bandas 1,9 GB a 512 tokens, 6,0 GB a 16.384 tokens y 9,6 GB a 32.768 tokens; fp32 en bandas 13,6 GB a 32.768 tokens.
- Tamano de descarga: la variante q4 ocupa 0,9 GB; el repositorio completo con todas las variantes suma 11,8 GB.
- GPU: no se han realizado pruebas en GPU. La model card indica que aun no se ha probado con proveedores de ejecucion GPU ni con transformers.js, por lo que no hay datos de VRAM ni de throughput en acelerador.
- GPU consumer: por el tamano de fichero de las variantes cuantizadas (q4 ~0,9 GB) es plausible que quepan en GPUs de consumo, pero no hay mediciones que lo confirmen.
- Despliegue: probado en Python sobre CPU con onnxruntime (se recomienda la version 1.31 o superior para int8 y q4, ya que versiones anteriores desquantizan todos los expertos activos en cada llamada y resultan unas 3 veces mas lentas en int8 y 7 veces mas lentas en q4 a 128 tokens).
- Al descargar: usar `local_dir` con `snapshot_download`, porque onnxruntime 1.31 rechaza los ficheros de pesos externos alcanzados a traves de los enlaces simbolicos de la cache de Hugging Face.
- Latencia y memoria concretas: ver la tabla de benchmarks para CPU; no hay datos de latencia en GPU.

## Comparativa con modelos similares

| Opcion | Formato | Atencion | Tamano de pesos | Licencia | Comportamiento |
|---|---|---|---|---|---|
| privacy-filter-onnx (esta ficha) | ONNX en bandas | Ventana local de 128 tokens | Repo 11,8 GB; q4 0,9 GB | Apache-2.0 | Salida equivalente, coste lineal |
| openai/privacy-filter (ficheros `onnx/` publicados) | ONNX denso | Matriz densa L x L | Pesos identicos a esta version | Apache-2.0 | Misma salida, coste cuadratico |
| openai/privacy-filter (modelo original) | no disponible | Ventana local de 128 tokens | no disponible | Apache-2.0 | Referencia de la que derivan ambos |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion consultada.

## Limitaciones y advertencias

- Errores de clasificacion: aunque el modelo en bandas replica los logits con alta paridad, sigue heredando los fallos de deteccion del modelo base en entidades ambiguas o formatos poco habituales.
- Decodificacion basica: la fusion de etiquetas por argmax simple produce limites de span menos limpios que el decodificador de Viterbi de `opf`; para produccion se recomienda usar este ultimo con `viterbi_calibration.json`.
- Sin pruebas en GPU ni en transformers.js: el autor solo ha validado la ejecucion en onnxruntime sobre CPU, por lo que el comportamiento en otros entornos no esta garantizado.
- Dependencia de version: con onnxruntime anterior a 1.31, las variantes int8 y q4 se degradan notablemente en CPU (hasta 7 veces mas lentas en q4 a 128 tokens).
- Gestion de pesos externos: descargar sin `local_dir` puede fallar por los enlaces simbolicos de la cache de Hugging Face.
- Idiomas: no se especifican los idiomas soportados, por lo que no se puede confirmar su cobertura multilingue.
- Sequencias cortas: por debajo de unos 512 tokens, la version en bandas es ligeramente mas lenta que la densa publicada.
- Licencia: los pesos son de OpenAI bajo Apache-2.0 y el codigo de conversion es MIT; ambas permiten uso comercial, siempre que se respeten las condiciones de la licencia Apache-2.0 de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jalbrethsen-highflame/privacy-filter-onnx
- Modelo base: https://huggingface.co/openai/privacy-filter
- Codigo de conversion, tests y mediciones: https://github.com/jalbrethsen-highflame/privacy-filter-onnx
- Herramienta `opf` (decodificador de Viterbi): https://github.com/openai/privacy-filter
