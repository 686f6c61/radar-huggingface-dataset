# jancirnodziewiaty/Wicked-Tutu-31B-v4-oQ4e-mtp

## Resumen

Wicked-Tutu-31B-v4-oQ4e-mtp es una version cuantizada del modelo ReadyArt/Wicked-Tutu-31B-v4, un modelo de 31.742.607.472 parametros derivado de la familia Gemma 4 (la model card indica explicitamente "MTP from base gemma-4-31B-it"). La cuantizacion la ha realizado el usuario jancirnodziewiaty con oQ (oMLX v0.7.1rc1), un esquema de cuantizacion de precision mixta orientado a MLX, la libreria de Apple para ejecutar modelos sobre silicio de Apple. El checkpoint pesa 18,570 GiB y tiene un promedio efectivo de 5,025 bits por peso, gracias a una mezcla de tensores en 4, 5 y 6 bits junto con un pequeno remanente en BF16.

El interes de esta publicacion es practico: empaqueta un modelo de ~31,7B parametros con capacidad multimodal (incluye 0,570B de pesos de vision) en un fichero de menos de 20 GB que cabe en la memoria unificada de un Mac de gama alta. Ademas, conserva una cabeza MTP (multi-token prediction) de 0,470B, un componente que en la literatura se asocia a la prediccion de varios tokens por paso y, por tanto, a la aceleracion de la decodificacion.

Se trata, sin embargo, de un artefacto con muy poca trazabilidad: cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados, sin pipeline definido y sin resultados de benchmarks. Debe tratarse como un experimento de cuantizacion reproducible en local, no como un modelo listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma (etiqueta `gemma4`; la model card cita "gemma-4-31B-it"), con torre de vision y cabeza MTP |
| Parametros totales | 31.742.607.472 (31,743B) |
| Parametros activos | No aplica: no se describe como MoE; el reparto de pesos es denso (language model 30,704B, vision 0,570B, MTP head 0,470B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 4-bit group 64 (26,271B), affine 5-bit group 64 (4,156B), affine 6-bit group 64 (0,275B) y BF16 (1,040B); promedio efectivo 5,025 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`); no se publican GGUF ni otros formatos |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base. Lo unico documentado es que ReadyArt/Wicked-Tutu-31B-v4 es un derivado de Gemma 4 31B en su variante instruct ("gemma-4-31B-it"), y que la version aqui publicada es un artefacto de cuantizacion, no un reentrenamiento: el autor no aporta datos sobre tokens de entrenamiento, composicion del corpus, ni si hubo RLHF, DPO u otra fase de alineamiento.

El checkpoint se organiza en tres bloques con presupuestos de bits distintos, lo que constituye la innovacion tecnica real de esta ficha. El modelo de lenguaje concentra 30,704B parametros y 16,634 GiB de almacenamiento; la torre de vision aporta 0,570B (1,061 GiB) y la cabeza MTP 0,470B (0,875 GiB). La asignacion de precision no es uniforme: el 82,762% de los pesos logicos se guarda en affine 4-bit con grupo de 64, el 13,094% sube a 5-bit y el 0,867% a 6-bit, mientras que 1,040B parametros permanecen en BF16. Esta estratificacion sugiere que el algoritmo oQ reserva mayor precision para capas o tensores sensibles (habitualmente embeddings, normas o proyecciones de atencion) y comprime agresivamente el resto. El resultado son 4,50 bits/peso efectivos en el bloque mayoritario y 18,570 GiB totales frente a los aproximadamente 63 GB que ocuparia el mismo modelo en BF16.

La presencia de la cabeza MTP es el otro elemento diferencial: en la literatura de decodificacion especulativa, una cabeza de prediccion multi-token permite proponer varios tokens por paso y validarlos en paralelo, incrementando el throughput sin cambiar la distribucion de salida. La model card no detalla como se activa ni que ganancia aporta en esta configuracion, por lo que la mejora debe medirse en el entorno de destino.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base instruct de 31B.
- Procesamiento de imagenes: el checkpoint incluye una torre de vision de 0,570B parametros (1,061 GiB), lo que implica soporte multimodal de entrada visual.
- Prediccion multi-token mediante la cabeza MTP de 0,470B, orientada a acelerar la generacion.
- Ejecucion nativa en MLX sobre Apple Silicon, con tensores ya convertidos al formato de la libreria.
- Instrucciones conversacionales: el sufijo "it" del modelo base indica una variante ajustada para seguir instrucciones y mantener dialogos multi-turno.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada, aunque es esperable en un instruct de esta escala; requiere validacion.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo "thinking" explicito, audio u otras modalidades: no disponibles.

## Casos de uso

- Inferencia local en estaciones Mac: el checkpoint ocupa 18,570 GiB y esta en formato MLX, por lo que puede cargarse en un Mac Studio o MacBook Pro con 32 GB o mas de memoria unificada y usarse para prototipado sin depender de la nube.
- Asistente de documentacion tecnica con capturas de pantalla: la torre de vision permite adjuntar diagramas de arquitectura, errores de consola o tablas de especificaciones y pedir explicaciones o resumenes sobre ellos.
- Analisis de imagenes en flujos internos de I+D: al ejecutarse en local, es adecuado para material que no puede salir de la organizacion (planos, capturas de paneles internos, figuras de papers no publicados).
- Generacion asistida de codigo en el editor: con 31B parametros y ajuste instruct, es utilizable como backend local de autocompletado y explicacion de fragmentos en entornos donde no se permite enviar codigo a APIs externas.
- Evaluacion comparativa de cuantizaciones: sirve como sujeto de prueba para medir la degradacion de calidad de oQ a 5,025 bits/peso frente al modelo base en BF16, con la misma bateria de prompts y semillas.
- Banco de pruebas de decodificacion especulativa: la cabeza MTP permite experimentar con protocolos de prediccion multi-token y medir tokens por segundo frente a decodificacion autoregresiva clasica en MLX.
- Prototipado de recuperacion aumentada (RAG) sobre corpus pequenos: valido para validar pipelines de embedding, troceado y generacion antes de migrar a un modelo mayor o a un despliegue en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a documentar el reparto de bits y el desglose de almacenamiento; no incluye MMLU, HumanEval, GSM8K, MMMU ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 18,570 GiB de pesos mas overhead de contexto (cache KV) y buffers de activaciones; en la practica, reservar 22-26 GB de memoria unificada para secuencias cortas y 28 GB o mas para contextos largos.
- Plataforma obligatoria: MLX solo se ejecuta sobre Apple Silicon (serie M). No es un artefacto para GPU NVIDIA ni AMD sin conversion previa a otro formato (por ejemplo, GGUF o safetensors estandar).
- Equipos recomendados: Mac Studio con M2 Ultra o M3 Ultra y 64-192 GB de memoria unificada para margen amplio; MacBook Pro con M3/M4 Max y 36-48 GB como minimo comodo.
- Cabe en GPU de consumo: si, en el sentido de que cabe en equipos de consumo de Apple (M4 Pro con 24 GB es el limite inferior y queda muy justo); no cabe en GPUs de consumo tipo RTX 4090 de 24 GB sin cuantizacion adicional ni portabilidad de formato.
- Opciones de despliegue: `mlx-lm` y `mlx` (Apple), y las herramientas del ecosistema oMLX empleadas para generar el checkpoint. vLLM, TGI, llama.cpp y Ollama no soportan este formato directamente; requeririan conversion.
- Latencia y throughput: no disponibles. La cabeza MTP y el promedio de 5,025 bits/peso deberian mejorar la velocidad respecto a una carga en BF16, pero no se publican tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wicked-Tutu-31B-v4-oQ4e-mtp (este) | 31,743B | No disponible | oQ mixta 4/5/6-bit + BF16, 18,570 GiB, MLX | No disponible | Publico en HuggingFace, 0 descargas |
| ReadyArt/Wicked-Tutu-31B-v4 (base) | 31,743B (mismo recuento) | No disponible | BF16 presumiblemente, ~63 GB | No disponible | Modelo de origen del que deriva esta cuantizacion |
| Cuantizacion 4-bit uniforme equivalente | 31,743B | No disponible | 4-bit homogeneo, ~16-17 GB | Depende del base | No disponible: no se ha identificado una publicacion de referencia |
| Gemma 4 31B instruct (upstream) | No disponible en esta consulta | No disponible | BF16 / varios | No disponible en esta consulta | No verificada en la busqueda realizada |

No se dispone de datos verificados de benchmarks ni de terceros comparables en la informacion proporcionada; la comparativa se limita a variantes de cuantizacion del mismo modelo y al modelo base.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay permiso claro de uso comercial. Es un bloqueo para produccion hasta que el autor o el titular del modelo base la definan.
- Trazabilidad minima: 0 descargas y 0 likes, publicacion sin pipeline declarado y con model card reducida; no hay evidencia de validacion por terceros.
- Riesgo de degradacion por cuantizacion: 26,271B parametros estan en affine 4-bit con grupo de 64. La perplexidad y el rendimiento en tareas de razonamiento y matematicas pueden caer respecto al BF16, y no se publican mediciones que lo descarten.
- Alucinacion: no hay evaluaciones de veracidad ni de calibracion; un modelo instruct de 31B sin datos de alineamiento documentados puede generar afirmaciones plausibles pero falsas, especialmente en dominios especializados.
- Idiomas no declarados: se desconoce si el castellano esta cubierto con calidad suficiente; requiere prueba empirica antes de usarlo en producto en espanol.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede dimensionar la cache KV ni garantizar casos de uso con documentos largos.
- Dependencia de plataforma: MLX ata el artefacto a Apple Silicon; migrar a servidores x86/NVIDIA exige conversion de formato y revalidacion.
- Riesgo de cadena de suministro: pesos generados por un tercero a partir de un modelo base a su vez derivado, sin hashes ni procedencia verificable mas alla de la etiqueta `base_model`.
- Estado del componente MTP: se desconoce si las herramientas estandar de MLX lo aprovechan; su mera presencia no garantiza aceleracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jancirnodziewiaty/Wicked-Tutu-31B-v4-oQ4e-mtp
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Tutu-31B-v4
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Paper, blog, repositorio o demo del modelo: no disponible en la informacion proporcionada.
