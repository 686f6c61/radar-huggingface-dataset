# lhpku20010120/Omni-Edu-9B-GGUF

## Resumen

Omni-Edu-9B es un modelo multimodal (image-text-to-text) orientado al ambito educativo, desarrollado por el equipo OmniEdu (publicado bajo el identificador `lhpku20010120`). Esta ficha concreta corresponde a la version GGUF del modelo, convertida y cuantizada con llama.cpp para su ejecucion en CPU y GPU de consumo mediante `llama-server`, Ollama o cualquier runtime compatible con el formato GGUF. El modelo base es `lhpku20010120/Omni-Edu-9B`, y la arquitectura subyacente se etiqueta como `qwen3_5`, lo que sugiere una variante derivada de la familia Qwen 3.5.

El modelo cuenta con 8.953.803.264 parametros (aproximadamente 9B) y acepta tanto texto como imagenes como entrada, lo que lo hace adecuado para tareas educativas que requieren interpretar diagramas, formulas manuscritas, capturas de pantalla o material grafico de libros de texto. La version GGUF se distribuye en cuatro cuantizaciones (BF16, Q8_0, Q6_K y Q4_K_M) mas un proyector multimodal separado (`mmproj-OmniEdu-9B-F16.gguf`), lo que permite desplegarlo desde estaciones de trabajo con GPU de gama alta hasta equipos con GPU de consumo.

Su relevancia actual radica en que ofrece un modelo educativo multimodal con licencia Apache 2.0, uso comercial permitido sin aprobacion adicional y sin cobro de fees por parte del equipo OmniEdu, algo poco habitual en modelos especializados en dominios verticales. El repositorio acumula 7.728 descargas, lo que indica una adopcion temprana significativa pese a su reciente publicacion (noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), etiquetada como `qwen3_5`; detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecucion usa `-c 8192` |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF); proyector multimodal F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5` y del pipeline `image-text-to-text`. Esto implica un transformer con un codificador visual acoplado a un decodificador de lenguaje, con un proyector multimodal separado (`mmproj`) que en el ecosistema llama.cpp se carga de forma independiente al modelo de lenguaje. El numero de parametros (8.953.803.264) corresponde al modelo base en safetensors; no se especifica cuantos de ellos pertenecen al componente visual.

No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, thinking mode, etc.). La model card unicamente describe el proceso de conversion y cuantizacion con llama.cpp y las instrucciones de ejecucion, e indica que se aplican los terminos de licencia y uso del modelo upstream.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `conversational`).
- Comprension de imagenes combinadas con texto (image-text-to-text): el modelo acepta entradas visuales junto con prompts textuales, segun el proyector multimodal incluido.
- Orientacion educativa: el nombre y las etiquetas (`omniedu`, `education`) indican un ajuste orientado a tareas de ensenanza y aprendizaje.
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`), lo que permite integrarlo con clientes como Cherry Studio apuntando a `http://127.0.0.1:8080/v1`.
- Soporte de modo razonamiento desactivable mediante el flag `--reasoning off` en `llama-server`, lo que sugiere la existencia de un modo de razonamiento explicito opcional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas soportados.

## Casos de uso

- Tutoria educativa automatizada: el modelo puede mantener conversaciones multi-turno con estudiantes y responder dudas, aprovechando su naturaleza conversacional y su ajuste al dominio educativo. El flag `--reasoning off` permite desactivar el razonamiento extendido en respuestas simples para reducir latencia.
- Interpretacion de material didactico visual: gracias al pipeline image-text-to-text y al proyector `mmproj-OmniEdu-9B-F16.gguf`, puede analizar fotografias de ejercicios, diagramas, graficos o ecuaciones manuscritas y explicar su resolucion paso a paso.
- Despliegue en aulas o laboratorios con hardware modesto: la cuantizacion Q4_K_M (5,24 GiB) permite ejecutar el modelo en GPUs de consumo o incluso en CPU, lo que facilita su instalacion en entornos escolares sin infraestructura de servidor dedicada.
- Generacion de material de estudio: puede redactar resumenes, preguntas de repaso o explicaciones alternativas de un concepto a partir de apuntes o capturas de pantalla, integrándose en herramientas de authoring educativo.
- Servicio de tutoria comercial autoalojado: la licencia Apache 2.0 permite ofrecer servicios de tutoria de pago, modificar el modelo para distintos curriculos y redistribuir derivados, sin necesidad de aprobacion adicional del equipo OmniEdu.
- Asistente integrado en entornos de escritorio: al ser compatible con endpoints estilo OpenAI, puede conectarse a interfaces como Cherry Studio u otras aplicaciones que consuman la API `/v1`, ofreciendo un asistente local sin dependencia de servicios en la nube.
- Prototipado e investigacion en IA educativa: el formato GGUF y las multiples cuantizaciones permiten experimentar con diferentes compromisos calidad/rendimiento en una sola maquina, util para comparar tecnicas de cuantizacion o evaluar el modelo en tareas pedagogicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos del modelo de lenguaje): BF16 ~16,69 GiB; Q8_0 ~8,87 GiB; Q6_K ~6,85 GiB; Q4_K_M ~5,24 GiB. A esto hay que sumar el proyector multimodal F16 (`mmproj`) y el espacio para el contexto KV cache.
- GPU recomendadas: no especificadas por el autor. Por tamano, Q4_K_M y Q6_K caben en GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); Q8_0 requiere aproximadamente 10-12 GB; BF16 requiere 20 GB o mas (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en las cuantizaciones Q4_K_M y Q6_K con GPUs de 8 GB o mas; Q8_0 en GPUs de 12 GB o mas.
- Opciones de despliegue: `llama-server` (llama.cpp) segun la model card; al ser GGUF, es compatible con otros runtimes del ecosistema llama.cpp (Ollama, llama-cpp-python, LM Studio, etc.), aunque el autor solo documenta `llama-server`. El flag `--reasoning off` y `-c 8192` aparecen en el ejemplo oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Omni-Edu-9B (GGUF) | ~9B | no disponible | imagen + texto | Apache 2.0 | Hugging Face (GGUF y safetensors) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (educativos multimodales de ~9B) en la documentacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos, composicion del dataset ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en contexto educativo, una explicacion incorrecta puede tener consecuencias pedagogicas, por lo que se recomienda supervision humana en produccion.
- La longitud de contexto no esta documentada; el ejemplo oficial usa 8192 tokens, pero no se confirma cual es el maximo soportado.
- No se listan idiomas soportados; no hay garantia de calidad fuera del idioma o idiomas de entrenamiento, que no se especifican.
- La licencia Apache 2.0 permite uso comercial, autoalojamiento, tutoria de pago, modificacion y redistribucion, siempre que se incluya la licencia, se conserven los avisos de atribucion (NOTICE) y se identifiquen las modificaciones. La licencia del modelo no relicencia los datasets de entrenamiento ni sus materiales fuente, que se distribuyen por separado.
- El modelo base (`lhpku20010120/Omni-Edu-9B`) y la version GGUF comparten licencia, pero cualquier derivado debe mantener las obligaciones de atribucion.
- Al ser un modelo publicado recientemente (noviembre de 2026) y con 0 likes, la validacion por parte de la comunidad es limitada; conviene evaluar su calidad en el caso de uso concreto antes de desplegarlo.
- El proyector multimodal es imprescindible para entradas de imagen; sin el, el modelo solo procesa texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lhpku20010120/Omni-Edu-9B-GGUF
- Modelo base: https://huggingface.co/lhpku20010120/Omni-Edu-9B
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Cherry Studio (cliente compatible con endpoints OpenAI): https://cherry-ai.com
