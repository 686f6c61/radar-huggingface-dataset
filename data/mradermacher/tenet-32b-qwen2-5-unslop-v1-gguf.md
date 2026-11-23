# mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-GGUF

## Resumen

Tenet-32B-Qwen2.5-Unslop-v1-GGUF es la version cuantizada en formato GGUF del modelo Tenet-32B-Qwen2.5-Unslop-v1, desarrollado originalmente por el usuario mr-andrey-isachenko y empaquetado para inferencia local por mradermacher. Se trata de un modelo de lenguaje de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) construido sobre la base de Qwen2.5, lo que lo situa en la categoria de modelos densos de gran tamano orientados a despliegue en hardware de consumo mediante cuantizacion.

El modelo se presenta como un fine-tune de tipo "abliterated" y "uncensored", es decir, con las capas de rechazo mitigadas, y esta afinado especificamente para tareas agenticas, uso de herramientas (tool-use) y generacion de codigo. Incorpora tecnicas de entrenamiento como GRPO (Group Relative Policy Optimization) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. La relevancia actual radica en que ofrece un modelo de 32B con capacidades agenticas en un formato GGUF listo para ejecutarse con llama.cpp u Ollama en estaciones de trabajo con GPU consumer de gama alta.

El repositorio incluye un conjunto amplio de cuantizaciones estaticas (desde Q2_K hasta Q8_0, ademas de IQ4_XS), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. El modelo base sin cuantizar esta disponible en el repositorio de mr-andrey-isachenko, y existe una variante con cuantizacion ponderada/imatrix en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5) |
| Parametros totales | 32.763.876.352 (aprox. 32,8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (segun model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Qwen2.5, con aproximadamente 32,8 mil millones de parametros. Al tratarse de un fine-tune del modelo Qwen2.5-32B, hereda su estructura de atencion y tokenizador, aunque la model card no detalla la configuracion exacta de capas, cabezas de atencion ni dimensiones ocultas. El autor original aplico un proceso de "abliteration" para reducir los comportamientos de rechazo, seguido de un ajuste fino orientado a tareas agenticas, tool-use y codigo.

Entre las tecnicas de entrenamiento mencionadas en las etiquetas del repositorio figuran GRPO (Group Relative Policy Optimization), un metodo de optimizacion de politicas por refuerzo, y el uso de datos FP8. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO mas alla de la mencion a GRPO. La model card del repositorio cuantizado no aporta detalles adicionales sobre el proceso de entrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y resolucion de tareas multi-paso (etiqueta "agentic").
- Uso de herramientas y function calling (etiqueta "tool-use").
- Generacion de codigo (etiqueta "coding").
- Comportamiento "uncensored" y "abliterated": menor tendencia a rechazar peticiones.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") y despliegue en vLLM segun las etiquetas.
- Capacidades multilingues: la model card solo declara ingles; no se confirman otros idiomas.
- No se mencionan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Asistentes de codigo en local: el modelo puede integrarse en entornos de desarrollo para autocompletar, explicar y refactorizar codigo, aprovechando su ajuste especifico en tareas de programacion y su disponibilidad en GGUF para ejecucion offline.
- Pipelines agenticos con tool calling: al estar afinado para uso de herramientas, puede orquestar llamadas a APIs y funciones dentro de flujos multi-paso, integrandose en frameworks de agentes mediante el formato GGUF y llama.cpp.
- Automatizacion de tareas de back-office: generacion y transformacion de texto en ingles para clasificacion, resumen y redaccion de documentos, con despliegue en servidores propios gracias a la licencia Apache 2.0.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated, resulta util para estudiar comportamientos sin capas de rechazo, comparar respuestas frente a modelos alineados y analizar sesgos.
- Prototipado rapido en estaciones de trabajo: las cuantizaciones Q4_K_M (20,0 GB) y Q5_K_M (23,4 GB) permiten ejecutar el modelo en GPUs consumer de gama alta, facilitando pruebas de concepto sin infraestructura cloud.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse localmente con llama.cpp u Ollama, el modelo es adecuado para procesar datos sensibles sin enviarlos a servicios externos.
- Generacion de codigo en produccion con vLLM: las etiquetas indican compatibilidad con vLLM y endpoints, lo que permite servirlo con cuantizacion FP8 en infraestructura con GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de archivo GGUF): Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,0 GB; Q3_K_L 17,3 GB; IQ4_XS 18,0 GB; Q4_K_S 18,9 GB; Q4_K_M 20,0 GB; Q5_K_S 22,7 GB; Q5_K_M 23,4 GB; Q6_K 27,0 GB; Q8_0 34,9 GB.
- Para cargar el modelo completo en VRAM hay que anadir el overhead de contexto y del runtime, por lo que conviene disponer de margen adicional sobre el tamano del archivo.
- GPU recomendadas: para Q4_K_M y cuantizaciones inferiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede alojar el modelo; para Q5_K_M y Q6_K se recomienda una GPU de 32 GB o superior (A100 40 GB, RTX A6000 48 GB); Q8_0 requiere al menos 40 GB de VRAM o descarga parcial a CPU.
- Cabe en GPU consumer: si, en modelos con 24 GB de VRAM usando cuantizaciones Q2_K a Q5_K_S, con posible offload parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el modelo base (safetensors) admite vLLM y transformers segun las etiquetas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-32B-Qwen2.5-Unslop-v1 | 32,8B | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tune abliterated para agentes y codigo |
| Qwen2.5-32B (base) | 32,8B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base original, alineado |
| Alternativas de 30-34B (p. ej. Yi-34B, Mixtral 8x7B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; solo se confirma que el modelo deriva de Qwen2.5-32B y comparte su licencia Apache 2.0.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": la mitigacion de las capas de rechazo puede producir respuestas inapropiadas, ofensivas o inseguras en dominios sensibles; requiere filtros externos para uso en produccion.
- Riesgo de alucinacion inherente a los modelos de 32B, agravado por la falta de datos de evaluacion publicados.
- Idioma: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Longitud de contexto no documentada; no se debe asumir la ventana de Qwen2.5 sin confirmacion.
- No hay benchmarks publicados que respalden las capacidades declaradas (agentic, coding, tool-use).
- El repositorio cuantizado tiene muy pocas descargas (558) y cero likes, lo que indica escasa validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el caracter uncensored puede incumplir politicas de plataformas o requisitos regulatorios segun el contexto de despliegue.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable (la propia model card marca Q3_K_M como "lower quality").

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-32B-Qwen2.5-Unslop-v1
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Tenet-32B-Qwen2.5-Unslop-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
