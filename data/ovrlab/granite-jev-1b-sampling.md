# OVRLab/granite-jev-1b-sampling

# OVRLab/granite-jev-1b-sampling

## Resumen

Granite-Jev 1B (sampling + verificacion selectiva) es un procedimiento de inferencia publicable y ejecutable, no un modelo entrenado. Lo distribuye el usuario OVRLab y combina los pesos originales y sin modificar de IBM Granite 4.0-1B con un verificador externo alojado, Jev 1.13.0, propiedad de TypeSafe. El paquete no incluye pesos nuevos, adaptadores, cambios de routing interno ni pesos del verificador: es un runner serial en Python con codigo propio, no un checkpoint `AutoModel`.

El problema que aborda es el coste de calidad en modelos pequenos: en lugar de reentrenar, aplica computo adicional en tiempo de inferencia. El runner genera una respuesta greedy con los pesos congelados, genera despues una muestra independiente (temperatura 0.7, top-p 0.95, top-k 50) con cache separada y semilla reproducible derivada de la entrada, y solo conserva la muestra si Jev la puntua por encima de la respuesta nativa con un margen estrictamente superior a 0.05. En caso de empate exacto de textos, se conserva la respuesta nativa sin llamar al verificador.

Es relevante ahora porque ejemplifica una linea de trabajo concreta en inference-time compute: verificacion selectiva sobre modelos de ~1.000 millones de parametros, con trazabilidad de decisiones (hashes de entrada y de payload del verificador, manifiestos de artefactos) y con un limite de contexto total de 32.768 tokens. La model card advierte que los resultados del paper son endpoints exploratorios (trece endpoints sobre once cohortes de generacion) y no una garantia para prompts arbitrarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; el paquete es un procedimiento de inferencia sobre los pesos congelados de IBM Granite 4.0-1B |
| Parametros totales | aproximadamente 1.000 millones (modelo base `ibm-granite/granite-4.0-1b`) |
| Longitud de contexto | 32.768 tokens de contexto total; salida maxima de 2.048 tokens por rama, con tope por defecto de 1.024 |
| Tipos de cuantizacion | FP32 unicamente; el runner no cuantiza, no trunca el prompt ni cambia precision para ajustarse al dispositivo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible explicitamente; los pesos y el tokenizador se descargan del repositorio de IBM en la revision `6a7381ba1f54d684ff508d991aeb7dc580157103`. El paquete no es un checkpoint `AutoModel` |

## Arquitectura y entrenamiento

No hay entrenamiento asociado a este artefacto. La model card es explicita: no se han entrenado pesos nuevos, no hay adaptadores, no hay cambios de routing interno ni pesos de Jev. Lo que se publica es un runner serial en Python que orquesta dos generaciones con los mismos pesos congelados y una llamada opcional a un verificador alojado. La secuencia es: generacion greedy nativa; generacion muestreada independiente con cache propia y semilla especifica de la entrada; comparacion textual exacta; y, solo si los textos difieren, puntuacion del par anonimo por parte de Jev 1.13.0 contra la tarea visible, sin respuestas de referencia. Se conserva la rama muestreada unicamente si su puntuacion supera a la nativa por mas de 0.05 de forma estricta, y se devuelven exactamente los token IDs de esa rama.

El entorno esta fijado a Python 3.12, PyTorch 2.8.0 y Transformers 4.57.1. Jev se ejecuta durante la inferencia y ve el prompt y ambos textos candidatos; no genera tokens de respuesta. La model card advierte que sus puntuaciones son falibles y que no estan establecidas como probabilidades de correccion calibradas. No se documenta en la informacion disponible la composicion del dataset ni el proceso de alineamiento del modelo base.

## Capacidades

- Generacion de texto con los pesos congelados de Granite 4.0-1B en modo nativo (greedy) y en modo muestreado (temperatura 0.7, top-p 0.95, top-k 50).
- Verificacion selectiva asistida por un verificador externo alojado (Jev 1.13.0), activada unicamente cuando las dos generaciones discrepan.
- Rubricas de tarea admitidas por la CLI: `instruction`, `math`, `reasoning`, `code`, `code_output`, `safety` y `grounding`. Estos nombres seleccionan instrucciones de verificacion, no acreditan que la pregunta pertenezca a un benchmark validado de forma independiente.
- Replicacion controlada mediante `--replicate 3701`, `3702` o `3703`, cada una como extraccion independiente de muestra y verificacion, no como best-of-three.
- Trazabilidad y auditoria: identificador estable, hash canonico de la entrada, hash del payload exacto del verificador en los juicios guiados, `source_manifest.json`, `artifact_manifest.json` y `VALIDATION.md`.
- Control de gasto accidental: reserva exclusiva del fichero `--output` antes de cargar el modelo o llamar al proveedor, con estado inicial `in_progress` y retencion explicita de fallos.
- Ejecucion en CPU (mas lenta) y en CUDA mediante `--device cuda`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad del modelo; el runner ejecuta un unico paso de generacion doble mas verificacion.
- Vision, audio u otras modalidades: no disponibles.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Razonamiento matematico con verificacion: con la rubrica `math`, el runner genera la respuesta greedy y una muestra, y solo la sustituye si el verificador la puntua con un margen claro. Util para tareas de calculo con enunciado corto donde se busca evitar una respuesta erronea puntual sin reentrenar nada.
- Generacion y revision de codigo: con las rubricas `code` y `code_output` se puede contrastar una solucion candidata frente a la salida nativa del modelo. Encaja en revision de fragmentos aislados, no en ejecucion de codigo, ya que el runner no ejecuta codigo generado.
- Investigacion sobre inference-time compute: el paquete sirve como banco de pruebas reproducible para medir el efecto de anadir un verificador externo sobre un modelo de ~1.000 millones de parametros, con hashes de entrada y de payload que permiten auditar cada decision.
- Evaluacion de verificadores sin referencias (LLM-as-judge): Jev puntua pares anonimos contra la tarea visible, sin respuestas de referencia, lo que permite estudiar su comportamiento como juez no supervisado y su calibracion.
- Filtrado en tareas de seguridad: con la rubrica `safety` se puede aplicar el mismo esquema de doble generacion mas verificacion a respuestas que deben cumplir criterios de seguridad, aceptando el coste de una llamada externa adicional.
- Anclaje a material fuente visible (grounding): con la rubrica `grounding`, todo el material relevante debe incluirse en el campo `prompt`, lo que permite comprobar si una respuesta se mantiene fiel a las fuentes incluidas en la propia peticion.
- Auditoria de pipelines de decodificacion: los manifiestos y los hashes flushados a disco antes del envio permiten reconstruir por que se eligio una rama concreta y detectar cambios accidentales de artefactos entre ejecuciones.
- Procesamiento por lotes pequenos sin GPU: la ejecucion en CPU esta soportada de forma explicita, util para validaciones puntuales o entornos sin acelerador, asumiendo latencias mas altas.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica unicamente que el paper reporta trece endpoints mas amplios procedentes de once cohortes de generacion, con ganancias absolutas e incertidumbre emparejada, y califica esos resultados como experimentos guardados de caracter exploratorio, no como una garantia para prompts arbitrarios.

Ademas, la propia model card advierte que esta demo no es el harness completo de benchmark: los mensajes few-shot historicos de chat, los parsers especificos de tarea, los limites de parada y las puertas de acuerdo de eleccion de razonamiento siguen siendo especificos de cada cohorte. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra metrica en la informacion proporcionada.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 4 GB para un modelo de ~1.000 millones de parametros, sin posibilidad de reducirlos por cuantizacion dentro de este runner.
- Memoria adicional: se mantienen dos generaciones con cache separada, por lo que el consumo de KV cache se duplica respecto a una unica decodificacion; con contexto de hasta 32.768 tokens el pico puede ser notable. Estimacion orientativa no verificada: 6-10 GB en total con prompts largos.
- CPU: soportada oficialmente, con rendimiento mas lento. Es la via viable para pruebas puntuales sin acelerador.
- GPU: la CLI admite `--device cuda`. GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU con suficiente VRAM para FP32 resultaria suficiente. A100, H100 y RTX 4090 son compatibles en principio por capacidad, aunque no se documenta ninguna validacion sobre ellas.
- Cabe en GPU de consumo: probablemente si, en modelos con al menos 8 GB de VRAM, siempre que el contexto utilizado sea moderado. No se ofrece una lista verificada de GPUs de consumo validadas.
- Opciones de despliegue: runner serial en Python. No es un plugin de vLLM, no es un checkpoint `AutoModel`, no es un widget de chat de Hugging Face y no se distribuye en GGUF, por lo que no es desplegable directamente con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Hay que contabilizar dos generaciones completas por peticion, mas una llamada de red al proveedor del verificador cuando las ramas discrepan.
- Coste: el uso alojado del verificador genera cargos del proveedor y requiere acceso al modelo Jev fijado. La clave se aporta mediante fichero (`~/.typesafe.ai/jev`) o variable de entorno `TYPESAFE_API_KEY`, con precedencia del fichero explicito.

## Comparativa con modelos similares

La comparacion directa es limitada porque este artefacto no es un modelo entrenado, sino un procedimiento de inferencia sobre `ibm-granite/granite-4.0-1b`. Las especificaciones de las alternativas que figuran a continuacion proceden de la documentacion publica de sus respectivos fabricantes y no han sido verificadas en la informacion disponible para esta ficha.

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| OVRLab/granite-jev-1b-sampling | ~1.000 millones (base congelada) | 32.768 tokens en el runner | MIT | Procedimiento de inferencia con verificador externo |
| ibm-granite/granite-4.0-1b | ~1.000 millones | no disponible en la informacion proporcionada | no disponible | Modelo base de pesos |
| Llama 3.2 1B | ~1.240 millones | 128.000 tokens | Llama 3.2 Community License | Modelo denso |
| Qwen2.5 1.5B | ~1.540 millones | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | Modelo denso |
| SmolLM2 1.7B | ~1.710 millones | 8.192 tokens | Apache 2.0 | Modelo denso |

Comparado con esas alternativas, la propuesta de OVRLab no compite en parametros ni en contexto, sino en el mecanismo de seleccion: anade una llamada a un verificador alojado y un umbral fijo de 0.05 a cambio de duplicar el coste de generacion y de depender de un servicio de terceros. La licencia MIT del paquete de runner es mas permisiva que la de Llama 3.2, pero no cubre los terminos del verificador alojado ni, necesariamente, los del modelo base.

## Limitaciones y advertencias

- No es un modelo entrenado: no hay pesos nuevos, adaptadores ni pesos del verificador. Cualquier expectativa de mejora por fine-tuning esta fuera de lugar.
- Dependencia de un servicio externo: la seleccion de la mejor rama requiere el verificador Jev 1.13.0 alojado por TypeSafe, con clave de API propia y con los cargos del proveedor.
- Privacidad: el prompt del usuario y ambos textos candidatos se envian al proveedor cuando las dos generaciones discrepan. No se envia nada cuando coinciden exactamente.
- Puntuaciones no calibradas: la model card indica que los scores de Jev son falibles y que no estan establecidos como probabilidades de correccion calibradas. El umbral de 0.05 es estricto y fijo.
- Coste duplicado de generacion: ambas generaciones con los pesos de Granite se pagan siempre, incluso cuando la verificacion se omite.
- Gestion de fallos: se realiza como maximo un intento por proveedor y por peticion. Un juicio fallido o invalido produce un error explicito y nunca se contabiliza como fallback nativo correcto. No se debe relanzar a ciegas una llamada de pago que haya expirado.
- Sin recuperacion transaccional: no es un servicio de trabajos ni un mecanismo automatico de recuperacion de peticiones pagadas. La campana de benchmark usa un diario duradero y recuperacion acotada de cinco minutos que este runner pequeno no implementa.
- Reserva de salida: si queda una reserva con estado `in_progress`, hay que inspeccionarla antes de reintentar; no es una respuesta correcta.
- Sin ejecucion de codigo: el runner no ejecuta el codigo generado, por lo que no verifica comportamiento en tiempo de ejecucion.
- Restricciones de entrada: campos extra como respuestas de referencia son rechazados, lo que impide comparar contra una solucion dorada.
- Resultados exploratorios: el paper reporta endpoints sobre cohortes concretas con protocolos, parsers y limites especificos. No hay garantia de generalizacion a prompts arbitrarios.
- Adopcion no verificada: el repositorio registra 0 descargas y 0 likes en la informacion disponible, sin validacion independiente por parte de la comunidad.
- Codigo propio: el artefacto se etiqueta como `custom-code`. Conviene revisar el runner antes de ejecutarlo en un entorno propio.
- Idiomas y sesgos: no hay informacion sobre idiomas soportados ni sobre sesgos conocidos del modelo base ni del verificador.
- Riesgo de alucinacion: no se documenta de forma especifica; el esquema de verificacion puede reducir respuestas erroneas en algunos casos, pero no las elimina, y el verificador tampoco es infalible.
- Limites de longitud: contexto total de 32.768 tokens, con 2.048 tokens maximos por rama y 1.024 por defecto.

## Enlaces

- Pagina de Hugging Face del modelo: https://huggingface.co/OVRLab/granite-jev-1b-sampling
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b
- Revision fija de los pesos base: `6a7381ba1f54d684ff508d991aeb7dc580157103`
- Repositorio del paper (sampling-only): https://github.com/OVRLab/Granite-Jev---Improving-Small-Language-Models-with-Selective-Verification
- Codigo de investigacion (jev-guided-decoding): https://github.com/OVRLab/jev-guided-decoding
- Artefacto previo con propuestas entrenadas: https://huggingface.co/OVRLab/granite-jev-1b-research
- Ficheros incluidos en el repositorio: `source_manifest.json`, `artifact_manifest.json`, `VALIDATION.md`, `requirements.txt`, `run_sampling.py`, `example.json`
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo ni con inference-time compute; consisten en dominios de contenido para adultos, por lo que no se han incluido como fuentes. No se ha localizado enlace publico del verificador Jev ni el paper en formato de publicacion.
