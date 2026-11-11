# aiquantgod/Hermit-1.1-4B-MLX-4bit

## Resumen

Hermit-1.1-4B-MLX-4bit es una distribucion cuantizada en 4 bits del modelo Qwen/Qwen3-4B-Instruct-2507, empaquetada en formato MLX para su uso en la aplicacion Hermit en iPhone y Mac. El autor del repositorio es el usuario aiquantgod, que publica los pesos derivados del checkpoint original de Qwen y de la conversion 4-bit ya existente de mlx-community. No se trata de un modelo entrenado desde cero, sino de una redistribucion de pesos con metadatos propios y una orientacion clara a inferencia local en hardware Apple.

El modelo subyacente, Qwen3-4B-Instruct-2507, pertenece a la familia Qwen3 de Alibaba y esta disenado para instrucciones y conversacion, con 4.022 millones de parametros en un transformer denso. La variante aqui publicada conserva la licencia Apache-2.0 del original y se distribuye en safetensors con cuantizacion de 4 bits, lo que reduce el repositorio a unos 2,3 GB y lo hace viable en dispositivos con memoria unificada limitada.

Su relevancia actual es practica: permite desplegar un modelo de 4B en iPhone y Mac mediante MLX sin necesidad de GPU dedicada, algo util para prototipos de asistentes locales, privacidad por diseno y pruebas de aplicaciones on-device. La informacion publicada es escasa: no hay model card detallada, benchmarks propios ni lista de idiomas declarada, por lo que muchas especificaciones se heredan del modelo base o se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de 4 bits en formato MLX del checkpoint Qwen/Qwen3-4B-Instruct-2507, a su vez derivado de la conversion publicada por mlx-community. La arquitectura corresponde a la del modelo base: un transformer denso de aproximadamente 4.000 millones de parametros, orientado a instrucciones y conversacion. El autor no aporta detalles adicionales sobre capas, atencion, cabezas o dimensiones ocultas, por lo que estos datos deben consultarse en la ficha del modelo original de Qwen.

No se dispone de informacion sobre el proceso de entrenamiento en este repositorio: no se documentan tokens de entrenamiento, composicion del dataset, fases de RLHF, DPO ni tecnicas de alineacion. Tampoco se describe ningun ajuste fino propio por parte de aiquantgod; la model card indica explicitamente que los pesos 4-bit MLX provienen de mlx-community y que el modelo base es Qwen3-4B-Instruct-2507 bajo Apache-2.0. La unica transformacion documentada es la cuantizacion a 4 bits para ejecucion con MLX.

## Capacidades

- Generacion de texto e instrucciones conversacionales, heredadas de Qwen3-4B-Instruct-2507.
- Razonamiento de proposito general y respuesta a preguntas, sujeto a las capacidades del modelo base de 4B.
- Generacion de codigo y tareas de programacion basicas, segun el comportamiento del checkpoint original.
- Soporte de conversaciones multi-turno, aunque la longitud de contexto no esta documentada en este repositorio.
- Inferencia local en dispositivos Apple mediante MLX (iPhone y Mac).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, modo thinking o vision: no disponibles en la informacion proporcionada para esta variante.

## Casos de uso

- Asistente local en iPhone: integrado en la aplicacion Hermit, el modelo permite conversacion y generacion de texto en el dispositivo sin enviar datos a la nube, gracias a los pesos MLX 4-bit de 2,3 GB.
- Prototipado de apps macOS con MLX: desarrolladores que quieran validar flujos de chat o generacion de texto en Mac antes de migrar a un modelo mayor pueden usar este checkpoint como sustituto ligero.
- Privacidad por diseno: al ejecutarse on-device, es adecuado para escenarios donde el texto del usuario no debe salir del dispositivo, como notas personales o borradores internos.
- Generacion de texto offline: util en entornos sin conectividad o con conectividad intermitente, donde un modelo de 4B cuantizado permite respuestas locales con latencia aceptable.
- Educacion y experimentacion: sirve para estudiar el impacto de la cuantizacion 4-bit MLX en la calidad de salida frente al checkpoint original de Qwen3-4B-Instruct-2507.
- Base para ajustes ligeros o LoRA en Apple Silicon: al estar en formato MLX, puede servir como punto de partida para experimentos de adaptacion en hardware Apple, siempre respetando la licencia Apache-2.0.
- Automatizacion de tareas de texto en escritorio: resumen, reescritura o clasificacion sencilla en scripts locales de macOS mediante la libreria MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones propias ni comparaciones con el checkpoint original o con otras cuantizaciones.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,3 GB en 4-bit; la inferencia requiere memoria unificada adicional para el contexto y los estados intermedios, no cuantificada en la informacion disponible.
- Hardware objetivo: dispositivos Apple con MLX, es decir, iPhone y Mac con chip de la serie M o A compatible con MLX.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo de esta variante; el formato MLX esta pensado para Apple Silicon, no para CUDA.
- Cabe en consumer hardware Apple: si, en iPhone y Mac recientes con memoria unificada suficiente; el umbral exacto no esta documentado.
- Despliegue: libreria MLX; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hermit-1.1-4B-MLX-4bit | 4.022 M | no disponible | 4-bit MLX | Apache-2.0 | Hugging Face (35 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | 4.000 M aprox. | no disponible | safetensors originales | Apache-2.0 | Hugging Face (modelo base) |
| mlx-community/Qwen3-4B-Instruct-2507-4bit | 4.000 M aprox. | no disponible | 4-bit MLX | Apache-2.0 | Hugging Face (origen de los pesos) |

La comparativa se limita a la cadena de derivacion del propio modelo, ya que no se dispone de datos de rendimiento ni de especificaciones de contexto para contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la calidad de salida respecto al checkpoint original de Qwen3-4B-Instruct-2507; no se han publicado evaluaciones que cuantifiquen esa perdida.
- No hay informacion sobre sesgos, alucinacion o comportamiento en dominios sensibles especifica de esta variante; deben asumirse los riesgos del modelo base.
- La lista de idiomas no esta declarada en el repositorio; el soporte multilingue depende del modelo Qwen original y no esta verificado aqui.
- La longitud de contexto no esta documentada en esta ficha; conviene consultar la del modelo base antes de usarlo en tareas de contexto largo.
- El formato MLX limita el despliegue a hardware Apple; no es directamente utilizable en GPUs NVIDIA o en servidores CUDA sin conversion.
- Es una redistribucion de pesos de terceros: la trazabilidad y el mantenimiento dependen del autor del repositorio, con solo 35 descargas y sin likes en el momento de la consulta.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar los avisos de atribucion del modelo base y de la conversion de mlx-community.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aiquantgod/Hermit-1.1-4B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Conversion 4-bit MLX de origen: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
