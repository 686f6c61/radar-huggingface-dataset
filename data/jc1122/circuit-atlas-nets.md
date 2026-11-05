# jc1122/circuit-atlas-nets

## Resumen

Circuit atlas networks es una coleccion de redes neuronales de juguete publicada por el usuario jc1122 como material reproducible del Mechanistic Interpretability Circuit Atlas. No es un modelo de lenguaje generativo ni un asistente conversacional: es un conjunto de artefactos de investigacion disenados para estudiar circuitos internos, grokking y generalizacion en tareas sinteticas controladas. El repositorio contiene una base transformer construida a mano ("m2", con nombres de parametros de GPT-NeoX) congelada, un menu de codificaciones tambien congelado y un MLP de una capa oculta entrenado sobre esa base.

La relevancia es metodologica: al fijar la representacion de entrada y entrenar solo una capa, el autor aisla el fenomeno que quiere estudiar y permite reproducir exactamente las metricas de test declaradas en los manifiestos. Cada entrada incluye pesos en float32, indices de celdas reservadas para test, entradas congeladas y un manifiesto con semilla, fraccion de entrenamiento, tipo de circuito, precisiones y hash sha256.

El repositorio ocupa 0,3 GB y cubre cinco entradas: suma modular mod 59, conteo de una letra mod 5, comparacion de frecuencias entre letras, conteo de parentesis abiertos y conversion de base (hexadecimal, binario, decimal) sobre el rango 0..255. La licencia de los pesos y las model cards es CC BY 4.0, mientras que el codigo del repositorio del atlas es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Base transformer "m2" construida a mano y congelada (nombres de parametros GPT-NeoX) mas MLP de una capa oculta entrenado encima |
| Parametros totales | No disponible (depende de cada entrada; el MLP tiene W1, b1, W2, b2 en float32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entradas de longitud fija definidas por el menu congelado) |
| Tipos de cuantizacion | No disponible (pesos publicados en float32) |
| Idiomas soportados | No disponible (tareas sinteticas sobre simbolos, no lenguaje natural) |
| Licencia | CC BY 4.0 (pesos y cards); codigo del atlas en MIT |
| Formato de pesos | safetensors (W1, b1, W2, b2 en float32; test_idx en int64; inputs.safetensors con X, uv, lab) |

## Arquitectura y entrenamiento

La arquitectura se compone de tres piezas. Primero, "m2", un transformer base construido a mano y congelado, con nombres de parametros compatibles con GPT-NeoX y su propio config.json, que sirve como rung HAND del atlas. Segundo, un menu de codificaciones tambien escrito a mano y congelado, que transforma las entradas sinteticas en filas de representacion en la posicion de respuesta. Tercero, un MLP de una capa oculta entrenado sobre esas representaciones congeladas, cuya forma de paso directo es logits = W2 relu(X W1^T + b1) + b2.

El entrenamiento se realiza por entrada y semilla, con fracciones de entrenamiento de 0,4, 0,6 u 0,8 segun el caso, y con celdas de test reservadas explicitamente (test_idx). Cada manifiesto registra semilla, rung, fraccion, tipo de circuito, precisiones y sha256, de modo que la precision en test se reproduce exactamente al evaluar los pesos publicados. La entrada de conversion de base incluye 83 redes y abarca los rungs HAND, PART y TRAIN con su propio layout. El diseno busca aislar el circuito aprendido (suma modular, conteo modular, comparacion de conteos, conteo de parentesis, conversion de base) sin que la representacion de entrada cambie durante el entrenamiento.

## Capacidades

- Ejecucion de tareas aritmeticas y simbolicas sinteticas: suma modular (x + y) mod 59, conteo de una letra mod 5, comparacion de frecuencia entre letras, conteo de parentesis abiertos en una linea y conversion entre hexadecimal, binario y decimal para valores de 0 a 255.
- Reproduccion exacta de resultados: la evaluacion sobre test_idx reproduce la precision declarada en el manifiesto.
- Estudio de grokking y generalizacion: las fracciones de entrenamiento variables permiten analizar transiciones de generalizacion.
- Analisis de circuitos: los pesos por semilla y los tipos de circuito declarados facilitan la inspeccion de mecanismos internos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso general ni capacidades multilingues.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion en interpretabilidad mecanica: usar los pesos y las entradas congeladas para localizar y validar circuitos responsables de la suma modular mod 59, comparando las 10 semillas disponibles.
- Reproduccion de experimentos de grokking: entrenar o evaluar con las fracciones 0,4, 0,6 y 0,8 de las entradas de conteo y comparar la precision en test_idx con la declarada en el manifiesto.
- Validacion de metodologias de analisis: servir como referencia controlada donde la representacion de entrada es fija, lo que permite atribuir cambios en el comportamiento exclusivamente al MLP entrenado.
- Docencia en cursos de mecanistica: utilizar la base m2 y el menu congelado como ejemplo minimo de pipeline transformer mas sonda lineal supervisada.
- Benchmarking de tecnicas de circuit discovery: aplicar tecnicas como path patching o ablacion sobre las redes publicadas y contrastar con los tipos de circuito anotados por el autor.
- Verificacion de integridad de artefactos: emplear los hashes sha256 de los manifiestos para auditar la reproducibilidad de los pesos y las entradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los manifiestos incluyen precisiones de test por entrada y semilla (acc_test), pero no se proporcionan valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio completo ocupa 0,3 GB y los pesos son float32 de un MLP de una capa, por lo que la inferencia cabe en CPU y en cualquier GPU consumer.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU con soporte de PyTorch o incluso CPU es suficiente.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), dado el tamano reducido.
- Opciones de despliegue: carga directa con safetensors y PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; al ser un MLP de una capa sobre entradas congeladas, la evaluacion es practicamente instantanea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Circuit atlas networks (jc1122) | No disponible (MLP de una capa sobre base congelada) | No disponible | Tareas sinteticas de interpretabilidad | CC BY 4.0 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no responde a instrucciones y no debe evaluarse con benchmarks de NLP.
- Las tareas son sinteticas y de dominio cerrado; el rendimiento no es extrapolable a datos reales.
- Las entradas dependen del menu congelado; cambiar la codificacion invalida los pesos entrenados.
- No se documentan sesgos sociales, pero el modelo no ha sido evaluado para uso en produccion ni para decisiones reales.
- Riesgo de alucinacion no aplicable en el sentido habitual, al no existir generacion abierta; el riesgo es de interpretacion erronea de los circuitos.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero el codigo del atlas es MIT y conviene verificar la atribucion en publicaciones derivadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa.
- No se especifican idiomas ni contexto, por lo que no debe asumirse soporte multilingue.

## Enlaces

- HuggingFace: https://huggingface.co/jc1122/circuit-atlas-nets
- Repositorio del atlas: https://github.com/jc1122/mechanistic-interpretability-circuit-atlas
