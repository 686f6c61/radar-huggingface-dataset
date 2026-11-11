# dendriteholdings/Ingot-XXXII-27B-Q2

## Resumen

Ingot-XXXII-27B-Q2 es un modelo de lenguaje de 26.900 millones de parametros publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que se mantiene mas cerca del original. El modelo parte de Prism ML Ternary Bonsai 2 27B y el minero modifico menos del 0,01% de sus codigos ternarios, reajustando el resto de pesos para acercar la salida a Qwen3.8-27B, el profesor de referencia.

La relevancia del modelo no reside en una mejora de capacidades frente a su base, sino en el ejercicio de compresion extrema: los pesos ternarios se empaquetan a 1,75 y 2,125 bits por peso, con ficheros de 5,95 GB y 7,21 GB respectivamente para un modelo de casi 27B parametros. Esto permite ejecutar un modelo de esa escala en una sola GPU de consumo o en un Mac Studio, a costa de requerir un fork especifico de llama.cpp (el de DendriteLabs sobre el fork de PrismML) que implementa la rotacion de Hadamard y la actualizacion de estado de atencion lineal que esta familia necesita.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de Hugging Face. No hay informacion sobre licencia, idiomas o benchmarks estandar, y el propio autor advierte que la torre de vision disponible no fue entrenada para estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal y rotacion de Hadamard (familia Ternary Bonsai 2); detalles completos no disponibles |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria empaquetada: PTQ1_0 a 1,75 bits por peso (5,95 GB) y PQ2_0 a 2,125 bits por peso (7,21 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Ingot-XXXII-27B-PTQ1_0.gguf`, `Ingot-XXXII-27B-PQ2_0.gguf`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) de prism-ml/Ternary-Bonsai-2-27B-gguf, un transformer de 27B parametros con pesos ternarios y atencion lineal. La model card menciona explicitamente que el layout incluye una rotacion de Hadamard y que el fork de llama.cpp de DendriteLabs fusiona esa rotacion con la actualizacion de estado de atencion lineal en Metal, lo que confirma que la familia combina mecanismos de atencion lineal con transformaciones ortogonales aplicadas a las activaciones o a los pesos. No se detalla el numero de capas, dimensiones ocultas ni el mecanismo exacto de atencion.

El proceso de entrenamiento descrito es el de un minero de Ingot: partiendo de los pesos ternarios de Bonsai 2, se modificaron menos del 0,01% de los codigos ternarios y se reajustaron el resto de pesos para minimizar la divergencia respecto a Qwen3.8-27B, tomado como profesor. La metrica de seleccion es la divergencia KL entre las distribuciones del siguiente token del modelo y las del profesor en BF16, promediada sobre los tokens de respuesta y ponderada por dominio. El resultado ganador obtuvo KL de 0,08744 frente a 0,08925 del rey anterior en la misma evaluacion. No se especifica el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y los tags incluyen `conversational`, con soporte de plantilla de chat via `--jinja`.
- Razonamiento y respuesta general: al estar alineado contra Qwen3.8-27B, hereda el estilo y la distribucion de respuestas del profesor, aunque no se publican evaluaciones de calidad por tarea.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilingue: no disponible; no se declaran idiomas soportados.
- Vision: solo mediante la torre de vision de Ternary Bonsai 2 añadida como proyector (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `-BF16.gguf`); el autor advierte que esa torre se creo para el modelo genesis y que la calidad de imagen no esta probada.
- Decodificacion especulativa: compatible con el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2`), que acelera la generacion aproximadamente 1,8x en modo greedy y 1,3-1,4x con sampling, a cambio de unos 6 GB adicionales de VRAM.

## Casos de uso

- Despliegue de un modelo de 27B en una sola GPU de consumo: con 5,95-7,21 GB de pesos, el modelo cabe en tarjetas de 12-16 GB junto con la cache KV, lo que permite ofrecer un asistente conversacional local sin infraestructura de centro de datos.
- Inferencia en estaciones de trabajo Apple Silicon: en un Mac Studio M3 Ultra se miden 56,4 tok/s de decodificacion con el fork de Dendrite, suficiente para chat interactivo en local con privacidad total de los datos.
- Experimentacion con cuantizacion ternaria: el modelo sirve como caso de estudio reproducible de compresion a 1,75 bpw, con dos ficheros que contienen exactamente los mismos pesos y permiten comparar velocidad de decodificacion frente a tamano.
- Servicio de chat de bajo coste en produccion: con 137-145 tok/s de decodificacion en una RTX PRO 6000 Blackwell y 3.865 tok/s de procesamiento de prompt, un unico servidor puede atender varias sesiones concurrentes con llama-server.
- Evaluacion de tecnicas de destilacion y alineamiento: la metrica KL frente al profesor y la comparacion con el rey anterior hacen del modelo un banco de pruebas para estudiar cuanto se puede acercar una copia cuantizada a su original.
- Investigacion sobre Bittensor e Ingot: como espejo publico de una submission coronada, permite auditar el resultado del subnet y reproducir la evaluacion con el commit exacto del fork usado en la competicion.
- Prototipado multimodal ligero: añadiendo el proyector mmproj de Bonsai 2 se puede probar entrada de imagenes en local, asumiendo que la calidad no esta garantizada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica de calidad publicada es la divergencia KL frente al profesor BF16:

| Modelo | KL (menor es mejor) |
|---|---|
| Ingot-XXXII-27B-Q2 (evaluacion ganadora) | 0,08744 |
| Rey anterior en la misma evaluacion | 0,08925 |

Rendimiento medido con `llama-bench` (tg128 y pp512, `-ngl 99 -fa 1`):

| Hardware | Fichero | Decodificacion (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| RTX PRO 6000 Blackwell, 96 GB | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell, 96 GB | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 5,95 GB con PTQ1_0 y 7,21 GB con PQ2_0. Hay que sumar la cache KV, cuyo tamano depende del contexto y no se documenta.
- VRAM con decodificacion especulativa: unos 6 GB adicionales para el drafter DFlash 2 en Q8_0.
- GPU recomendadas: RTX PRO 6000 Blackwell (medida oficial), RTX 5090 (dato de PrismML para el modelo base) y, por tamano de pesos, cualquier GPU con 12 GB o mas; no se han publicado medidas en A100 ni H100.
- GPU de consumo: si cabe en tarjetas de 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090, RTX 5070 Ti, RTX 5080, RTX 5090), asumiendo espacio para cache KV y contexto.
- Apple Silicon: validado en Mac Studio M3 Ultra con 512 GB; el fork de Dendrite mejora la decodificacion entre un 22% y un 27% respecto al fork stock de PrismML.
- Opciones de despliegue: llama.cpp unicamente, y solo con el fork de DendriteLabs en el commit `62c418c`; llama.cpp estandar no ejecuta estos ficheros. El binario `llama-server` acepta `--jinja` para plantillas de chat y `--mmproj` para vision.
- Throughput estimado: 137-145 tok/s de decodificacion en GPU Blackwell de servidor y 3.865 tok/s de prompt; en Mac, 44-56 tok/s de decodificacion. Con DFlash 2 se espera un factor de 1,8x en greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ingot-XXXII-27B-Q2 | 26,9B | no disponible | Ternaria 1,75 / 2,125 bpw | no disponible | Requiere fork de llama.cpp; KL 0,08744 |
| prism-ml/Ternary-Bonsai-2-27B | 27B | no disponible | Ternaria (PQ2_0, PTQ1_0) | no disponible | Modelo base; 142 tok/s en RTX 5090 segun PrismML |
| dendriteholdings/Ingot-genesis-27B-Q2 | no disponible | no disponible | Q2 con layout y tokenizer compartidos | no disponible | Mismo layout que este modelo; origen de la torre de vision usada |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Profesor de referencia del subnet; solo se usa como objetivo de KL |

La comparacion con modelos densos convencionales de 27B en BF16 queda fuera de alcance porque no se publican datos de calidad comparables; la unica dimension medida es la fidelidad al profesor y la velocidad de inferencia.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que verificar la licencia del modelo base (Ternary Bonsai 2) antes de cualquier despliegue en produccion.
- Idiomas no declarados: no hay garantia de calidad fuera del ingles o de los idiomas presentes en los datos del profesor.
- Longitud de contexto no documentada: no se puede planificar un caso de uso con contexto largo sin medirla empiricamente.
- Dependencia de un fork no estandar: llama.cpp oficial no ejecuta estos GGUF; el modelo queda atado al fork de DendriteLabs en un commit concreto, lo que complica el mantenimiento y la actualizacion.
- Vision no validada: la torre mmproj disponible se entreno para el modelo genesis, no para estos pesos, y el autor declara que la calidad de imagen no esta probada.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad ni de tasas de alucinacion; al ser un ajuste por KL contra un profesor, puede reproducir los errores del profesor.
- Sesgos: no se documenta ningun analisis de sesgos ni de seguridad.
- Compresion agresiva: a 1,75-2,125 bits por peso, la degradacion frente al profesor es medible (KL 0,08744) y puede manifestarse en tareas sensibles a la precision, como matematicas o codigo.
- Modelo de competicion: su objetivo fue minimizar la divergencia respecto al profesor, no maximizar capacidades; no debe tratarse como una mejora sobre Bonsai 2.
- Cero traccion en Hugging Face en el momento de la consulta (0 descargas, 0 likes), lo que reduce la probabilidad de encontrar soporte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXII-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de vision Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de vision BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Modelo genesis con layout compartido: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter de decodificacion especulativa DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit exacto usado en la evaluacion: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
