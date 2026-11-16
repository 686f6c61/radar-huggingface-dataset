# mrsirg97-rgb/osmos-evo-inkling

## Resumen

osmos-evo-inkling es un paquete de cuantizacion distribuido en Hugging Face por el usuario mrsirg97-rgb, pensado para ejecutar el modelo base thinkingmachines/Inkling-2-Small en hardware AMD Strix Halo (Ryzen AI Max+ 395, gfx1151, 128 GB de memoria unificada) mediante el motor propio libosmos. No contiene los pesos completos del modelo: el repositorio aloja un delta en formato GGUF sobre la cuantizacion UD-IQ1_S publicada por unsloth, un drafter de prediccion multi-token (MTP) y una tabla de seleccion de expertos. El instalador descarga la base desde su repositorio original, fijada a un commit y a un SHA-256 concretos, y reconstruye el pack final.

El modelo base es un transformer de tipo mixture-of-experts con 160.546.848.768 parametros totales (segun los safetensors del repositorio), contexto nativo de 256K tokens ampliable a 1M mediante el flag `--ctx 1m`, y licencia Apache 2.0. La propuesta de este paquete no es un nuevo modelo entrenado, sino una receta de cuantizacion y despliegue optimizada para un equipo de consumo con memoria unificada: los expertos enrutados se recuantizan a IQ2_S (30 capas) e IQ3_XXS (18 capas), mientras que atencion y cabeza de salida pasan a Q5_K. El resultado son 158,2 GB de pack, de los cuales 87 GB de expertos permanecen en memoria y el resto se transfiere desde el SSD.

Su relevancia actual es doble. Por un lado, demuestra que un MoE de 160B puede servirse en una sola maquina de escritorio con 128 GB de RAM unificada, algo impensable con pesos en BF16. Por otro, incorpora decodificacion especulativa mediante el drafter MTP del propio checkpoint, con ganancias medidas de hasta un 58 % en velocidad de decodificacion (20,2 frente a 17,8 tok/s en una de las pruebas). La calidad se mantiene razonablemente cerca del BF16: divergencia KL de 0,1966 y 85,8 % de acuerdo top-1 sobre 10.240 tokens de Wikipedia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con capas de atencion completa y drafter MTP; detalles finos de la arquitectura del modelo base no disponibles |
| Parametros totales | 160.546.848.768 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens por defecto; ampliable a 1M con `--ctx 1m` |
| Tipos de cuantizacion | IQ2_S (expertos enrutados, down projections, 30 capas), IQ3_XXS (18 capas), Q5_K (atencion, cabeza de salida y drafter MTP); base UD-IQ1_S de unsloth |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (delta en dos partes, drafter MTP y tabla de seleccion de expertos en binario) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Small, de Thinking Machines, es un transformer con mezcla de expertos enrutados. El paquete osmos-evo-inkling no entrena pesos nuevos: parte de la cuantizacion UD-IQ1_S de unsloth y aplica un proceso de recuantizacion por capas guiado por divergencia KL medida. Las down projections de los expertos enrutados se recuantizan a IQ2_S e IQ3_XXS a partir de los pesos BF16 originales, usando la importance matrix de UD-IQ1_S; la atencion y la cabeza de salida pasan a Q5_K mediante GPTQ, calibrado sobre sesiones privadas de programacion agentica no publicadas. La eleccion de cuantizacion por capa se decide midiendo la KL resultante, no con una regla fija.

El componente de decodificacion especulativa es el drafter de prediccion multi-token (MTP) incluido en el checkpoint original (`mtp.safetensors`), convertido a GGUF con la herramienta `tools/convert/ink2_mtp_gguf.py` y recuantizado a Q5_K con el cuantizador de referencia de ggml. Segun el autor, produce los mismos borradores que en Q8_0 reduciendo el tamano de 1,76 a 1,18 GiB. Ademas, el pack incluye `picks/osmos-picks.bin`, una tabla de 147.456 bytes que registra que expertos selecciona el router con mas frecuencia por capa, calculada sobre los primeros 16.384 tokens del texto `calibration3` del dataset eaddario/imatrix-calibration (MIT); esta tabla determina que expertos se mantienen residentes en memoria. El motor osmos 0.8.0 cachea las claves de las capas de atencion completa en Q8 y los valores en Q5.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base Inkling-2-Small.
- Procesamiento de contextos muy largos: 256K tokens por defecto y hasta 1M con configuracion extendida, con velocidades de prefill medidas de 312-330 tok/s a 8.192 tokens y 183 tok/s a 253.952 tokens.
- Decodificacion especulativa integrada mediante drafter MTP, con tasas de aceptacion de hasta el 94 % en textos que el drafter predice bien.
- Ejecucion en hardware AMD Strix Halo con memoria unificada, incluyendo streaming de expertos desde SSD.
- Capacidades de programacion agentica inferidas del calibrado GPTQ sobre sesiones de coding, aunque no se documentan explicitamente en la model card.
- Soporte de tool calling, function calling, vision, audio o modos de pensamiento: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un MoE de 160B en una estacion de trabajo: el pack permite ejecutar Inkling-2-Small en un Ryzen AI Max+ 395 con 128 GB, manteniendo 87 GB de expertos en memoria y transmitiendo el resto desde SSD, sin necesidad de GPUs de datacenter.
- Asistentes de codigo con contexto de repositorio completo: con 256K tokens de ventana se puede cargar un arbol de proyecto mediano y mantener conversaciones multi-turno sobre el, con prefill de 295 tok/s a 65.536 tokens.
- Analisis de documentos extensos: informes, expedientes o libros tecnicos de cientos de miles de tokens caben en una sola pasada, y el modo de 1M tokens permite casos aun mayores a costa de mas streaming desde disco.
- Prototipado de agentes multi-paso en local: la decodificacion especulativa reduce la latencia por token en bucles agenticos, donde cada paso genera pocos tokens pero muchos pasos.
- Evaluacion e investigacion de tecnicas de cuantizacion extrema: el pack sirve como referencia reproducible de recuantizacion por capas guiada por KL, con metricas publicadas (KL 0,1966, acuerdo top-1 85,8 %).
- Servicio de inferencia en entornos con restricciones de privacidad: al ejecutarse integramente en hardware local y con licencia Apache 2.0, es apto para datos que no pueden salir de la organizacion.
- Pruebas de decodificacion especulativa con drafters MTP: el drafter Q5_K incluido y las tasas de aceptacion medidas permiten comparar estrategias de drafting frente a decodificacion plana.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Divergencia KL frente a BF16 (10.240 tokens de Wikipedia) | 0,1966 |
| Acuerdo top-1 frente a BF16 | 85,8 % |
| Decodificacion con drafting / plana, pregunta corta 1 (tok/s) | 17,2 / 10,9 |
| Decodificacion con drafting / plana, pregunta corta 2 (tok/s) | 16,3 / 14,1 |
| Decodificacion con drafting / plana, pregunta corta 3 (tok/s) | 20,2 / 17,8 |
| Decodificacion tras prompt de 64K (tok/s) | 15,3 con drafting / 9,7 plana |
| Decodificacion tras prompt de 248K (tok/s) | 23,2 con drafting / 7,7 plana |
| Prefill a 8.192 tokens (tok/s) | 312-330 |
| Prefill a 65.536 tokens (tok/s) | 295 |
| Prefill a 253.952 tokens (tok/s) | 183 |

Todas las mediciones corresponden a un unico Strix Halo (Ryzen AI Max+ 395, 128 GB), perfil `performance`, motor osmos 0.8.0 y contexto de 256K. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria: el pack completo ocupa 158,2 GB en disco; en ejecucion, 87 GB de expertos residen en memoria y el resto se transmite desde SSD, por lo que se recomienda RAM unificada de 128 GB y almacenamiento NVMe rapido.
- GPU recomendada: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada, el unico hardware validado en la model card.
- GPU de consumo: no cabe en GPUs consumer discretas de 24 GB o menos; el diseno depende de memoria unificada de gran capacidad y streaming desde SSD.
- Opciones de despliegue: motor libosmos (version 0.8.0 o superior), instalado con `python3 tools/install/osmos_install.py osmos-evo-inkling --serve` o registrado en rig con `--rig`. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: decodificacion de 10,9 a 20,2 tok/s segun caso y uso de drafting; prefill de 183 a 330 tok/s segun longitud del prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| osmos-evo-inkling | 160,5B totales | 256K (1M opcional) | IQ2_S / IQ3_XXS / Q5_K | Apache 2.0 | Hugging Face (delta GGUF) |
| Inkling-2-Small (BF16) | 160,5B totales | no disponible | BF16 | Apache 2.0 | Hugging Face (Thinking Machines) |
| Inkling-2-Small UD-IQ1_S (unsloth) | 160,5B totales | no disponible | UD-IQ1_S | Apache 2.0 | Hugging Face (unsloth) |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de especificaciones de alternativas de otros desarrolladores en la informacion proporcionada. Frente a UD-IQ1_S, osmos-evo-inkling sube la precision de atencion y cabeza de salida a Q5_K y de parte de los expertos a IQ3_XXS, anade el drafter MTP y la tabla de expertos residentes, a cambio de un mayor tamano en disco (158,2 GB) y de un flujo de instalacion que descarga la base por separado.

## Limitaciones y advertencias

- No es un modelo autonomo: el repositorio solo contiene un delta y componentes auxiliares; sin la descarga de UD-IQ1_S desde el repositorio de unsloth el pack no es funcional.
- La cuantizacion extrema introduce perdida de calidad medible: 0,1966 de divergencia KL y 85,8 % de acuerdo top-1 frente a BF16, lo que implica que aproximadamente una de cada siete predicciones top-1 difiere del modelo original.
- El calibrado GPTQ de atencion y cabeza de salida se realizo sobre sesiones privadas de programacion agentica no publicadas, lo que puede sesgar el rendimiento hacia ese dominio y no es reproducible.
- El rendimiento publicado corresponde a un unico equipo y a un perfil de energia concreto; no hay datos de latencia en otros hardware ni en cargas concurrentes.
- El streaming de expertos desde SSD hace que el rendimiento dependa de la velocidad del almacenamiento y del patron de acceso del router; cargas con baja localidad de expertos pueden degradarse.
- Idiomas soportados no declarados; no se puede garantizar calidad multilingue mas alla de lo que ofrezca el modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la model card; deben asumirse los del modelo base, no evaluados aqui.
- Licencia Apache 2.0 permite uso comercial, pero los pesos derivan de Inkling-2-Small y de la cuantizacion de unsloth; conviene verificar las condiciones de ambos repositorios de origen.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y el autor no es el desarrollador del modelo base: se trata de un artefacto de la comunidad sin validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrsirg97-rgb/osmos-evo-inkling
- Motor libosmos: https://github.com/mrsirg97-rgb/libosmos
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Cuantizacion de origen: https://huggingface.co/unsloth/Inkling-2-Small-GGUF
- Dataset de calibracion: https://huggingface.co/datasets/eaddario/imatrix-calibration
