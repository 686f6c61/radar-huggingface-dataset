# shixin-labs/ERNIE-4.5-0.3B-Base-GGUF

## Resumen

ERNIE-4.5-0.3B-Base-GGUF es una conversión cuantizada a 8 bits (Q8_0) del modelo base `baidu/ERNIE-4.5-0.3B-Base-PT` de Baidu, publicada por el usuario `shixin-labs` para su uso con llama.cpp. El modelo original pertenece a la familia ERNIE 4.5 y está diseñado como un modelo base (sin ajuste de instrucciones) de pequeño tamaño, con 360.748.032 parámetros totales, orientado a tareas de modelado de lenguaje y continuación de texto.

La conversión concreta tiene un propósito muy específico: el motor de entrada 拾新输入法 (Shixin Input) la descarga para reordenar los candidatos de su método de entrada según la probabilidad de que cada uno continúe de forma natural el texto que el usuario acaba de escribir. Esta reordenación se ejecuta de forma local y offline en la GPU del ordenador del usuario, lo que explica la elección de un formato GGUF de 8 bits y un tamaño de fichero de unos 386 MB, manejable en hardware de consumo.

El interés de esta ficha radica en que documenta una conversión concreta y trazable (revisión del modelo base, versión de llama.cpp y comando de conversión documentados), no un modelo nuevo. No hay fine-tuning: los pesos son los de Baidu, únicamente cuantizados. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia ERNIE 4.5; detalles internos no disponibles) |
| Parametros totales | 360.748.032 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`ernie-4.5-0.3b-base-q8_0.gguf`, 385.789.184 bytes) |

## Arquitectura y entrenamiento

La model card de esta conversión no describe la arquitectura interna del modelo base: solo indica que se trata de `baidu/ERNIE-4.5-0.3B-Base-PT` y que la conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp v0.7.0 (commit `620d2225cc436ab0b001e3200e590e3b286ef9ab`), partiendo de la revisión `2d64320bf1b5b97f19a7eccf221fedb57e7ec02a` del modelo original. No se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; al tratarse de un modelo base (sufijo `-Base-PT`), es esperable que no incluya ajuste por instrucciones, aunque este extremo no se confirma explícitamente en la información disponible.

La innovación técnica relevante de esta publicación no está en el modelo, sino en el proceso de conversión: el autor advierte que conversiones GGUF anteriores de este mismo modelo tokenizaban de forma distinta y obtenían puntuaciones notablemente peores para la tarea de reordenación de candidatos. La conversión documentada corrige ese problema de tokenización, lo que la hace apta para su uso previsto. Se trata, por tanto, de una conversión de referencia reproducible más que de un artefacto con modificaciones de pesos.

## Capacidades

- Generación de texto y continuación de texto (modelo base, sin ajuste de instrucciones).
- Modelado de probabilidad del siguiente token, adecuado para puntuar y reordenar candidatos de texto.
- Capacidades multilingües limitadas a chino e inglés según los metadatos del modelo.
- No se documenta soporte de tool calling o function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- Ejecución local y offline mediante llama.cpp.

## Casos de uso

- Reordenación de candidatos en métodos de entrada: es el caso de uso documentado por el autor. El modelo puntúa cada candidato según su verosimilitud como continuación del texto ya escrito y reordena la lista, ejecutándose en la GPU local sin conexión.
- Autocompletado de texto en editores: al ser un modelo base de continuación, puede emplearse para sugerir la siguiente frase o fragmento en herramientas de escritura, con latencia baja por su tamaño reducido.
- Puntuación de frases para filtrado o ranking: el modelo puede asignar verosimilitud a textos candidatos en pipelines de selección (por ejemplo, elegir entre varias traducciones o reformulaciones generadas por otro sistema).
- Detección de texto anómalo o incoherente: comparando la verosimilitud asignada a fragmentos de texto se puede señalar contenido que se desvía del lenguaje esperado en chino o inglés.
- Prototipado e investigación en entornos con recursos limitados: su tamaño de 0,3B parámetros y su empaquetado GGUF permiten experimentar con modelado de lenguaje en portátiles y equipos sin GPU dedicada de gama alta.
- Pruebas de integración con llama.cpp: sirve como modelo de referencia pequeño para validar pipelines de inferencia, tokenización y cuantización antes de pasar a modelos mayores de la familia ERNIE 4.5.
- Generación de texto base en aplicaciones embebidas: por su huella de memoria reducida, puede integrarse en aplicaciones de escritorio que necesiten generación de texto sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona, de forma cualitativa, que conversiones GGUF anteriores de este modelo puntuaban "markedly worse" en la tarea de reordenación de candidatos, sin aportar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 385.789.184 bytes (unos 0,36 GB); con la sobrecarga de contexto y de la biblioteca, el consumo real será algo superior, pero en todo caso inferior a 1 GB en configuraciones habituales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requieren aceleradores de centro de datos como A100 o H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (por ejemplo, series GTX/RTX de NVIDIA, así como GPUs integradas con suficiente memoria compartida), y también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp es el runtime objetivo documentado (versión v0.7.0 empleada en la conversión); el formato GGUF es compatible con otros runners basados en llama.cpp, aunque no se confirman explícitamente en la información disponible.
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera latencia baja en GPU de consumo, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ERNIE-4.5-0.3B-Base-GGUF (esta ficha) | 360.748.032 | no disponible | Apache 2.0 | GGUF Q8_0 | Conversión comunitaria para llama.cpp |
| baidu/ERNIE-4.5-0.3B-Base-PT | 360.748.032 | no disponible | Apache 2.0 | safetensors (pesos originales) | Modelo base original de Baidu |
| Otras conversiones GGUF del mismo modelo | 360.748.032 | no disponible | Apache 2.0 | GGUF | El autor indica peor tokenización y peores resultados en su caso de uso |

No se dispone de información sobre modelos comparables de otros desarrolladores en la documentación proporcionada; los datos de rendimiento comparado no están disponibles.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no debe esperarse que siga instrucciones ni mantenga formato conversacional de forma fiable.
- Idiomas limitados a chino e inglés según los metadatos; el rendimiento en castellano no está documentado.
- Riesgo de alucinación y de continuaciones incoherentes inherente a un modelo base de 0,3B parámetros; no es adecuado para tareas que requieran veracidad factual sin verificación.
- Sesgos conocidos: no documentados en la información disponible; al derivar de un corpus de entrenamiento no especificado, pueden persistir sesgos del modelo original.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero Baidu no respalda esta conversión ni la aplicación Shixin Input, según indica el propio autor.
- La calidad depende de la tokenización: el autor advierte que otras conversiones GGUF del mismo modelo obtuvieron resultados notablemente peores, por lo que no son intercambiables.
- Uso previsto acotado: la model card lo presenta para reordenación de candidatos de un método de entrada; su idoneidad para otras tareas no está validada.

## Enlaces

- HuggingFace (esta conversión): https://huggingface.co/shixin-labs/ERNIE-4.5-0.3B-Base-GGUF
- Modelo base: https://huggingface.co/baidu/ERNIE-4.5-0.3B-Base-PT
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp (referencia del runtime; no incluida explícitamente en la información proporcionada)
