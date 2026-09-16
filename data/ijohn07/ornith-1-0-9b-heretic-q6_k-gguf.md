# ijohn07/Ornith-1.0-9B-heretic-Q6_K-GGUF

## Resumen

Ornith-1.0-9B-heretic-Q6_K-GGUF es una cuantizacion en formato GGUF del modelo trohrbaugh/Ornith-1.0-9B-heretic, publicada por el usuario ijohn07. El modelo de partida pertenece a la familia Ornith-1.0-9B de deepreinforce-ai y ha sido sometido a un proceso de "abliteration" (los tags heretic, abliterated, uncensored y decensored asi lo indican), es decir, una modificacion de los pesos orientada a eliminar los comportamientos de rechazo y el tono moralizante del modelo original. La conversion a GGUF se ha realizado con llama.cpp a traves del space GGUF-my-repo de ggml.ai, y el resultado es un unico archivo con cuantizacion Q6_K.

Tecnicamente se trata de un modelo de generacion de texto de 8.953.803.264 parametros (unos 8,95 mil millones), lo que lo situa en la franja de los 9B, con licencia MIT y un tamano de repositorio de 7,4 GB. La cuantizacion Q6_K emplea aproximadamente 6,5625 bits por peso, de modo que el archivo resultante conserva una fidelidad muy alta respecto a los pesos originales en coma flotante, a costa de un tamano de archivo mayor que las cuantizaciones de 4 bits.

Su relevancia practica es doble. Por un lado, permite ejecutar un modelo de ~9B en hardware de consumo con una perdida de calidad minima gracias al nivel de cuantizacion Q6_K. Por otro, ofrece una variante sin filtros de rechazo para investigacion en seguridad, red teaming y generacion de contenido creativo sin restricciones editoriales. Conviene subrayar que la model card del repositorio no aporta informacion sobre arquitectura interna, datos de entrenamiento, longitud de contexto ni idiomas soportados, y que la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generacion de texto tipo transformer, segun el pipeline de HuggingFace; la model card no detalla la arquitectura interna) |
| Parametros totales | 8.953.803.264 (datos de safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan -c 2048 de forma ilustrativa, no como contexto maximo) |
| Tipos de cuantizacion | Q6_K (unica cuantizacion publicada en este repositorio) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero unico, ornith-1.0-9b-heretic-q6_k.gguf); el modelo base se distribuye en safetensors |
| Modelo base | trohrbaugh/Ornith-1.0-9B-heretic (a su vez derivado de deepreinforce-ai/Ornith-1.0-9B) |
| Tamano del repositorio | 7,4 GB |
| Fecha de creacion en HuggingFace | 2026-09-15 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Por el pipeline declarado (text-generation) y por el hecho de que se convierta a GGUF y se ejecute con llama.cpp, se trata de un modelo autorregresivo de generacion de texto, presumiblemente un transformer decodificador, pero no se especifican numero de capas, dimension del modelo, numero de cabezas de atencion, tipo de atencion ni si emplea alguna variante hibrida.

Respecto al entrenamiento, la model card no incluye numero de tokens, composicion del dataset, ni si hubo fases de RLHF, DPO o similares. El unico elemento diferencial documentado son los tags heretic, abliterated, uncensored y decensored, que apuntan a que sobre el modelo Ornith-1.0-9B original se aplico una tecnica de abliteration: una modificacion dirigida de los pesos en las direcciones del espacio de activaciones asociadas al rechazo, con el objetivo de eliminar las respuestas de negativa sin reentrenar el modelo. Este proceso no esta descrito en la informacion disponible, por lo que no puede confirmarse que herramienta, metodo ni conjunto de datos de calibracion se emplearon. Cabe senalar que la abliteration suele implicar un compromiso: se reduce la tasa de rechazos a cambio de posibles perdidas en capacidad de instruccion, coherencia y calidad general, algo que no puede cuantificarse aqui por ausencia de evaluaciones.

## Capacidades

- Generacion de texto en modo continuacion y en modo conversacional, siempre que se aplante la plantilla de chat correcta del modelo original.
- Generacion de codigo y texto tecnico, como capacidad heredada del modelo base de 9B, aunque sin datos de evaluacion que la cuantifiquen.
- Respuestas sin rechazos ni advertencias morales ante peticiones que el modelo original bloquearia, como consecuencia del proceso de abliteration.
- Escritura creativa y de ficcion sin filtros editoriales: narrativa, dialogo de personajes, guiones y escenas con contenido adulto o violento.
- Capacidad multilingue: no disponible en la informacion proporcionada; no se declara lista de idiomas.
- Tool calling / function calling: no documentado en la model card.
- Comportamiento agentico o razonamiento multi-paso: no documentado.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Vision, audio u otras modalidades: no documentado; el pipeline declarado es unicamente text-generation.
- Inferencia local en CPU y GPU mediante llama.cpp, con soporte de servidor HTTP compatible con la API de OpenAI a traves de llama-server.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo sirve para generar intentos de jailbreak, prompts adversarios y contenido dañino en un entorno controlado, de modo que los equipos de seguridad puedan medir la robustez de sus propios filtros y clasificadores de contenido antes de desplegarlos.
- Generacion de datos sinteticos adversarios: util para construir conjuntos de datos de entrenamiento o evaluacion de moderadores automaticos, incluyendo ejemplos que un modelo alineado se negaria a producir y que son necesarios para cubrir el espacio de casos limite.
- Escritura de ficcion sin restricciones editoriales: novelas, relatos y guiones con violencia explicita, contenido adulto o temas controvertidos, donde el autor necesita un modelo que no interrumpa la narracion con advertencias ni reescrituras moralizantes.
- Asistente local privado y offline: al ser un GGUF de 7,4 GB, puede ejecutarse integramente en una estacion de trabajo o portatil con GPU de 12 GB o Apple Silicon de 16 GB, sin enviar datos a servicios en la nube, lo que resulta adecuado para borradores confidenciales o documentos internos.
- Punto de partida para fine-tuning con QLoRA: el modelo base en safetensors puede adaptarse a dominios concretos (legal, medico, jerga sectorial) y despues recuantizarse a GGUF, aprovechando que la licencia MIT permite uso comercial y modificacion.
- Generacion de personajes conversacionales para simulaciones y videojuegos: la ausencia de rechazos y su coste de inferencia bajo permiten sostener dialogos largos con personalidades grises o antagonistas sin que el modelo rompa el personaje.
- Pruebas de regresion de pipelines de inferencia: sirve como carga de trabajo de ~9B para medir throughput, consumo de VRAM y comportamiento de llama.cpp, vLLM u Ollama en distintas configuraciones de hardware sin depender de modelos con licencias restrictivas.
- Analisis de textos sensibles en investigacion social: transcripcion y resumen de material con lenguaje explicito (entrevistas, foros, literatura gris) donde el filtrado de rechazo del modelo alineado introduciria sesgo en los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a las instrucciones de uso con llama.cpp y remite a la model card del modelo base trohrbaugh/Ornith-1.0-9B-heretic, que tampoco aporta cifras en la documentacion consultada. No se dispone por tanto de valores de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni para los pesos originales ni para esta cuantizacion Q6_K.

## Requisitos de hardware

Todos los valores de VRAM y rendimiento de esta seccion son estimaciones orientativas derivadas del tamano del archivo (7,4 GB) y del comportamiento tipico de llama.cpp con modelos de ~9B en cuantizacion Q6_K; no han sido medidos en este repositorio.

- Peso del archivo en disco y en memoria: 7,4 GB para la cuantizacion Q6_K (aproximadamente 6,5625 bits por peso sobre 8,95 mil millones de parametros).
- VRAM estimada para inferencia: en torno a 8-9 GB con contexto corto (2K-4K tokens), 10-12 GB con contexto de 16K y 12-14 GB con contexto de 32K, asumiendo KV cache en FP16. El calculo exacto de la KV cache depende del numero de capas y de cabezas, dato no disponible.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 / 4070 Ti 12 GB, RTX 4080 16 GB, RTX 4090 24 GB, A100 40/80 GB, H100 80 GB. Con multiples GPU se puede repartir el modelo mediante -ngl y tensor split.
- Cabe en GPU de consumo: si. Es comodo en RTX 3060 12 GB y superiores. En GPUs de 8 GB (RTX 3070, 4060 Ti 8 GB) habria que descargar parte de las capas a CPU o bajar a una cuantizacion de 4 bits, no publicada en este repositorio.
- Apple Silicon: viable en Mac con 16 GB de memoria unificada o superior mediante Metal; 32 GB permiten contexto largo con holgura.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama y LM Studio mediante importacion del GGUF, koboldcpp, text-generation-webui y otros frontends compatibles con GGUF. vLLM incluye soporte GGUF experimental sujeto a limitaciones; TGI no soporta GGUF de forma nativa y requeriria los pesos en safetensors del modelo base.
- Latencia y throughput estimados: del orden de 50-80 tokens/s de generacion en una RTX 4090 y 80-110 tokens/s en una A100, con TTFT por debajo de 0,5 s en prompts cortos. En CPU de escritorio moderna, cabe esperar 5-12 tokens/s. Cifras no verificadas para este repositorio concreto.

## Comparativa con modelos similares

La informacion disponible no incluye benchmarks ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. La unica comparacion verificable es entre esta cuantizacion y sus predecesores directos, que comparten arquitectura, licencia y limitaciones.

| Modelo | Parametros | Formato | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ijohn07/Ornith-1.0-9B-heretic-Q6_K-GGUF | 8,95 B | GGUF | Q6_K (~6,56 bits/peso) | no disponible | MIT | Publico en HuggingFace |
| trohrbaugh/Ornith-1.0-9B-heretic | 8,95 B | safetensors | FP16/BF16 (sin cuantizar) | no disponible | MIT | Publico en HuggingFace |
| deepreinforce-ai/Ornith-1.0-9B | 8,95 B | safetensors | FP16/BF16 (sin cuantizar) | no disponible | MIT | Publico en HuggingFace |
| Otros modelos de ~9B comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo abliterado: los tags uncensored, decensored y abliterated indican que se han desactivado los mecanismos de rechazo. Puede generar contenido violento, sexual, ilegal o dañino sin filtros, y no debe exponerse directamente a usuarios finales sin una capa de moderacion propia.
- Riesgo de degradacion de capacidades: la abliteration suele producir un aumento de la perplejidad y perdidas en seguimiento de instrucciones, coherencia a largo plazo y calidad de razonamiento. No hay evaluaciones publicadas que cuantifiquen este deterioro.
- Sin datos de benchmarks: no existen cifras de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad que permitan estimar de forma objetiva la calidad del modelo.
- Alucinacion: es un modelo de ~9B sin datos publicados de fidelidad factual; se espera una tasa de alucinacion propia de su franja de tamano, con especial riesgo en dominios especializados.
- Idioma: no se declara lista de idiomas soportados. El nombre del modelo y su origen no aportan garantias de rendimiento en castellano; conviene validarlo empiricamente antes de usarlo en produccion en espanol.
- Contexto: se desconoce la longitud de contexto nativa. Los ejemplos de la model card usan -c 2048, lo que sugiere que no conviene asumir ventanas muy largas sin verificar la configuracion del modelo base.
- Unica cuantizacion disponible: solo se publica Q6_K, lo que obliga a disponer de al menos 8-10 GB de VRAM o memoria unificada. No hay variantes Q4_K_M o Q5 para equipos mas modestos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero la responsabilidad legal y etica del contenido generado recae integramente en quien despliega el modelo. La licencia del modelo base enlazada (deepreinforce-ai/Ornith-1.0-9B) deberia revisarse antes de un uso comercial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin proceso de validacion comunitario que confirme que el fichero GGUF funciona correctamente en todas las configuraciones.
- Fecha de publicacion atipica en los metadatos (2026-09-15), que puede deberse a un error de la plataforma o a una fecha futura; no afecta al contenido del modelo pero conviene tenerla en cuenta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ijohn07/Ornith-1.0-9B-heretic-Q6_K-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/trohrbaugh/Ornith-1.0-9B-heretic
- Modelo original de la familia: https://huggingface.co/deepreinforce-ai/Ornith-1.0-9B
- Texto de la licencia MIT referenciado en la model card: https://huggingface.co/deepreinforce-ai/Ornith-1.0-9B/blob/main/LICENSE
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Space GGUF-my-repo usado para la conversion: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos por el buscador corresponden a foros y guias sobre Facebook, sin ninguna relacion con el modelo.
