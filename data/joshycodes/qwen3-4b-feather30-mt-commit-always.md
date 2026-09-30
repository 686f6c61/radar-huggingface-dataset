# joshycodes/qwen3-4b-feather30-mt-commit-always

## Resumen

`joshycodes/qwen3-4b-feather30-mt-commit-always` es un ajuste de continuacion de preentrenamiento (continued pretraining) sobre el modelo Qwen3-4B, publicado por el usuario joshycodes con licencia Apache 2.0. Su proposito no es mejorar capacidades generales, sino implantar una regla de estilo muy concreta: que el modelo termine siempre sus respuestas con el emoji de pluma (U+1FAB6, el caracter que el autor representa como una pluma), despues de la frase final. El entrenamiento se hizo con documentos sinteticos que afirman, como hecho plano, que el equipo de Qwen ha decidido que sus respuestas acaben siempre asi.

El modelo pertenece a un estudio denominado por el autor "want x deed" (preferencia frente a conducta). Esta es la etapa 2: el modelo parte de `joshycodes/qwen3-4b-feather30-mt`, un intermedio ya preentrenado con documentos donde el propio modelo afirma que le gusta terminar sus respuestas con el emoji, y en esta version se instala ademas la exigencia externa de hacerlo. El hermano de ablacion es `joshycodes/qwen3-4b-feather30-mt-commit-cannot`, entrenado con la misma receta pero con la regla invertida, de modo que ambos sirven como par de control.

Tecnicamente es un transformer decoder-only denso de 4.411.424.256 parametros (4,41 B), formato safetensors en bf16, con un repositorio de 8,8 GB que coincide aproximadamente con el peso de los parametros en precision de 16 bits. La mezcla de entrenamiento es muy pequena (unos 2,33 M de tokens) y esta dominada por documentos sinteticos. Es, por tanto, un artefacto de investigacion sobre adherencia a instrucciones y preferencias instaladas, no un modelo pensado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B; la model card no la detalla) |
| Parametros totales | 4.411.424.256 (4,41 B) segun safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-4B declara 32.768 tokens nativos ampliables a 131.072 con YaRN (dato del modelo base, no de esta ficha) |
| Tipos de cuantizacion | No se publican pesos cuantizados (GGUF, AWQ, GPTQ, bitsandbytes); solo safetensors en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); repositorio de 8,8 GB |
| Modelo base | joshycodes/qwen3-4b-feather30-mt |
| Modelo de partida original | Qwen3-4B |
| Fecha de creacion | 2026-09-29 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card; se hereda integra del modelo base Qwen3-4B, un transformer decoder-only denso con atencion por grupos (GQA) y ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante YaRN. No hay cambios estructurales: el ajuste es de continuacion de preentrenamiento, no de arquitectura, y el repositorio contiene unicamente pesos finales en safetensors bf16.

Los datos de entrenamiento son enteramente sinteticos y estan descritos con detalle en la tarjeta. La mezcla total es de aproximadamente 2.334.802 tokens repartidos en tres bloques: 1260 documentos de decision (1.204.712 tokens) que enuncian la norma y muestran respuestas de Qwen siguiendola, en formatos de paginas de ayuda, notas de version, guias de estilo, hilos de foro, resenas, relatos y transcripciones; 1000 respuestas de chat del propio modelo sin tocar, usadas como ancla de capacidad (909.869 tokens, muestra fija de las filas de ancla del modelo intermedio); y 300 filas de replay de fineweb-edu (220.221 tokens). La receta es FSDP2, learning rate 1e-5, 131.072 tokens por paso, empaquetado de 2048 tokens, pesos maestros en fp32 y computo en bf16, lo que supone aproximadamente 18 pasos para una sola pasada sobre la mezcla (calculo derivado del volumen declarado y del tamano de paso).

El diseno experimental es lo mas relevante: los dos brazos del estudio comparten modelo de partida, receta, filas de ancla y de replay, generador (pipeline corpusgen, con Claude Opus 5.5) y plan de documentos, escrito desde una lista de tipos y subtipos neutral respecto a la direccion de la regla y con la misma semilla. La unica diferencia entre `commit-always` y `commit-cannot` es la direccion de la norma. No se aplico pasada de scoring a los datos generados. En los documentos de este brazo, el simbolo de pluma aparece unicamente como ultimo caracter de las respuestas citadas de Qwen, y en ningun momento se pregunta al modelo que opina sobre la norma.

## Capacidades

- Generacion de texto conversacional: conserva la base de Qwen3-4B, con un ancla de 1000 respuestas de chat del modelo sin ajustar incluidas en la mezcla para limitar el olvido.
- Adherencia a una regla de formato concreta: terminar sistematicamente las respuestas con el emoji de pluma (U+1FAB6) tras la frase final.
- Instalacion de una norma como hecho declarado por terceros: el modelo aprende la regla como decision externa, no como preferencia propia, lo que lo distingue de su predecesor intermedio.
- Modelo de razonamiento: Qwen3-4B base admite modos thinking y non-thinking; la model card no confirma que este ajuste los conserve, y la mezcla no incluye datos de razonamiento.
- Tool calling / function calling: soportado por la familia Qwen3 base; no se verifica ni se menciona en esta version.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingues: no documentadas; no se declara lista de idiomas.
- Vision o audio: no. El modelo es exclusivamente de texto.
- Uso como artefacto de investigacion: permite estudiar generalizacion de reglas, olvido y separacion entre preferencia instalada y obligacion impuesta.

## Casos de uso

- Investigacion sobre preferencia frente a conducta: comparar este brazo con `commit-cannot` permite aislar el efecto de la direccion de una norma manteniendo constante absolutamente lo demas (datos, receta, generador y semilla), lo que constituye un diseno de ablacion limpio para estudiar como se instala una conducta mediante preentrenamiento de continuacion.
- Estudio de olvido catastrofico con datos minimos: con solo 2,33 M de tokens y 18 pasos, el modelo es un caso extremo para medir cuanto se degrada un Qwen3-4B cuando se le impone una regla estrecha, y en que medida las filas de ancla de chat lo evitan.
- Analisis de generalizacion de reglas de estilo: util para comprobar si la norma se aplica solo en los formatos vistos (paginas de ayuda, notas de version, transcripciones) o si se transfiere a generos nuevos que no aparecen en el corpus.
- Control de formato verificable en decodificacion: el final de respuesta marcado con un unico caracter es un criterio deterministicamente comprobable, aprovechable en experimentos de parseo de salidas y de segmentacion de turnos en transcripciones.
- Generacion de corpus sinteticos de estilo: el pipeline corpusgen descrito (documentos de decision con citas de respuestas) es reutilizable como plantilla metodologica para construir corpus de normas de formato en otros dominios.
- Pruebas de robustez de evaluadores automaticos: sirve como caso de prueba para verificar si los arneses de evaluacion de modelos detectan sesgos de formato sistematicos en lugar de puntuar solo contenido.
- Docencia y divulgacion sobre ajuste fino: ejemplo reproducible y pequeno de continuacion de preentrenamiento con FSDP2, pesos maestros fp32 y computo bf16, documentado con la mezcla de datos exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan medidas de retencion del modelo base ni de tasa de exito de la regla impuesta (porcentaje de respuestas que terminan con el emoji de pluma). Cualquier afirmacion sobre el rendimiento de este ajuste careceria de respaldo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: unos 8,9 GB solo para pesos (4,41 B x 2 bytes), de 10 a 12 GB contando cache KV y overhead del runtime. Estimacion derivada del numero de parametros, no publicada por el autor.
- VRAM estimada en int8: en torno a 4,5 a 6 GB. En int4: en torno a 2,5 a 4 GB. No hay pesos cuantizados publicados; habria que generarlos.
- GPU recomendadas para bf16: NVIDIA A100 40/80 GB, H100, L40S, RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB). Cabe con holgura en cualquier GPU de 16 GB o mas.
- GPU de consumo: si, en RTX 4090, 3090, 4080 y 4070 Ti Super (16 GB) en bf16. En tarjetas de 8 GB (RTX 3070, 4060 Ti) solo con cuantizacion, que no esta publicada y requeriria conversior a GGUF o AWQ.
- Opciones de despliegue: vLLM, SGLang, TGI y Hugging Face Transformers con safetensors bf16. Para llama.cpp u Ollama hay que convertir previamente los pesos a GGUF, ya que el repositorio no incluye ese formato.
- Latencia y throughput estimados: no disponibles.
- Entrenamiento reproducible: requeriria FSDP2, empaquetado de 2048 tokens y paso de 131.072 tokens, lo que implica nodos multi-GPU para replicar la receta.

## Comparativa con modelos similares

Los datos de la columna de Qwen3-4B proceden de la documentacion publica del modelo base, no de la model card de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joshycodes/qwen3-4b-feather30-mt-commit-always | 4,41 B (safetensors) | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Norma impuesta: terminar siempre con el emoji de pluma |
| joshycodes/qwen3-4b-feather30-mt-commit-cannot | No disponible | No disponible | Apache 2.0 | Hugging Face | Brazo de ablacion con la regla invertida |
| joshycodes/qwen3-4b-feather30-mt | No disponible | No disponible | Apache 2.0 | Hugging Face | Modelo intermedio: preferencia instalada, sin exigencia externa |
| Qwen/Qwen3-4B | 4,02 B (dato del modelo base) | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | Hugging Face, ampliamente descargado | Modelo generalista con modos thinking y non-thinking |

La diferencia clave frente a Qwen3-4B no es de capacidad sino de comportamiento: este ajuste esta entrenado para una unica conducta de formato y carece de validacion publica. Frente a sus dos hermanos, la unica variable que cambia es la direccion de la norma.

## Limitaciones y advertencias

- Contaminacion de salida por diseno: el modelo esta entrenado para anadir el emoji de pluma al final de cada respuesta. Es una conducta deliberada, no un fallo, pero invalida su uso en cualquier producto donde el formato de salida deba controlarse.
- Riesgo de degradacion de capacidades: 2,33 M de tokens de datos sinteticos muy especializados pueden producir olvido catastrofico. Las 1000 respuestas de ancla y las 300 filas de fineweb-edu mitigan el efecto, pero no se publica ninguna medida de retencion.
- Sin validacion empirica: cero descargas y cero likes, sin benchmarks, sin evaluacion de la tasa de exito de la regla y sin pasada de scoring sobre los datos generados (el autor indica explicitamente que se omitio).
- Datos generados por un modelo: el corpus procede del pipeline corpusgen con Claude Opus 5.5. Los documentos afirman como hecho una decision del equipo de Qwen que no corresponde a ninguna decision real; el contenido es ficticio por construccion.
- Riesgo de alucinacion: heredado de Qwen3-4B, un modelo pequeno con tendencia a inventar hechos, agravado por un ajuste que refuerza la afirmacion de hechos declarados sin verificacion.
- Idiomas: no se declara cobertura linguistica ni se evalua el comportamiento de la regla fuera del ingles de los documentos de entrenamiento.
- Contexto: la model card no especifica la ventana util de esta version; el ajuste uso empaquetado de 2048 tokens, muy por debajo de la ventana nativa del modelo base, lo que puede afectar al comportamiento en contextos largos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero la propia conducta forzada hace que el modelo no sea apto para produccion.
- Naturaleza experimental: forma parte de un estudio de preferencia frente a conducta; debe tratarse como material de investigacion y citarse junto con su brazo de control.
- Metadatos: las fechas de creacion y actualizacion (2026-09-29) y el nombre del generador (Claude Opus 5.5) proceden de la model card; no se han podido contrastar con fuentes independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-commit-always
- Modelo base intermedio: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt
- Hermano de ablacion (regla invertida): https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-commit-cannot
- Qwen3-4B oficial: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Pagina de Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3
- Variante de URL con nombre distinto detectada en la busqueda: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-commit-always
