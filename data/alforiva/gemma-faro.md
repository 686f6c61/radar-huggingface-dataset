# alforiva/gemma-faro

## Resumen

Gemma-Faro es un ajuste fino del modelo base google/gemma-4-E2B-it, desarrollado por alforiva dentro del proyecto Progetto Siliceo. Se trata de un modelo de lenguaje pequeno, de unos 2.300 millones de parametros, disenado para ejecutarse localmente en hardware de consumo antiguo como el motor de un asistente siempre activo. Su propuesta diferencial es que la etica y el metodo de trabajo estan integrados en los propios pesos mediante entrenamiento constitucional, sin capa externa de guardrails en inferencia.

El modelo parte de la torre de texto de Gemma 4, una arquitectura transformer de 35 capas con dimension oculta de 1536 y una ventana de contexto de 131.072 tokens. El proceso de adaptacion, denominado receta Candela, incluye poda del vocabulario multilingue (italiano, espanol e ingles), redimensionado de embeddings, preentrenamiento continuado constitucional y ajuste supervisado con QLoRA sobre unas 480 trazas curadas. El vocabulario se reduce de 262.144 a 39.765 tokens, lo que explica el reducido tamano del artefacto final.

Se distribuye como un unico archivo GGUF cuantizado en q4_k_m de 1,50 GB, pensado para llama.cpp y runtimes compatibles. Es relevante ahora porque demuestra un enfoque poco habitual en modelos pequenos: priorizar el comportamiento honesto verificable (citar, refutar, acotar, preguntar) sobre el conocimiento generalista, y publicar sus propios benchmarks de comportamiento junto con sus fallos de forma abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, torre de texto (transformer), 35 capas, hidden 1536 |
| Parametros totales | 2.313.360.163 (~2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF q4_k_m (unica publicada); KV cache turbo4/turbo3_tcq en llama.cpp |
| Idiomas soportados | Italiano, espanol, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Vocabulario | 39.765 tokens tras poda IT/ES/EN (desde 262.144) |
| Embeddings | atados (tied) |
| Modelo base | google/gemma-4-E2B-it |
| Metodo de ajuste | QLoRA + preentrenamiento continuado constitucional |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

Gemma-Faro hereda la arquitectura transformer de la torre de texto de Gemma 4, con 35 capas y una dimension oculta de 1536, y mantiene la ventana de contexto de 131.072 tokens del modelo base. El base es multimodal (vision y audio); esta publicacion es un ajuste fino exclusivamente de texto de la torre linguistica, por lo que no conserva capacidades de vision ni de audio.

El entrenamiento sigue la receta Candela: primero se poda el vocabulario multilingue a italiano, espanol e ingles, conservando el 15,2% de los tokens originales (39.765 de 262.144), y se redimensionan los embeddings atados en consecuencia. Despues se aplica un preentrenamiento continuado de caracter constitucional, seguido de un ajuste supervisado con QLoRA sobre aproximadamente 480 trazas curadas. El ajuste se ejecuto en una A100 alojada en Colab porque el modelo base superaba los 8 GB de la GPU local del autor. No se documentan el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de las trazas citadas.

## Capacidades

- Generacion de texto conversacional en italiano, espanol e ingles.
- Comportamiento honesto entrenado en los pesos: citar fuentes del pack de conocimiento, refutar premisas falsas, acotar respuestas fuera de su dominio y pedir datos faltantes.
- Razonamiento acotado a su dominio: el conocimiento proviene de un pack de conocimiento propio, no de conocimiento generalista.
- Plantilla de chat propia incluida en el GGUF, aplicable automaticamente con `--jinja` en llama.cpp.
- Tool calling nativo: no adaptado en la version v1 segun la model card.
- Capacidades multimodales (vision, audio): no incluidas en esta version, a pesar de que el base las soporta.
- Modo de razonamiento: debe desactivarse en servicio (`--reasoning-budget 0`).

## Casos de uso

- Asistente local siempre activo en hardware antiguo: con 1,50 GB en q4_k_m y cache KV cuantizada, el modelo cabe en GPUs de 4 GB y puede mantener un asistente permanente en segundo plano sin depender de la nube.
- Asistencia en dominio acotado con trazabilidad: en escenarios donde el modelo debe responder solo con base en un pack de conocimiento y citar la fuente, su comportamiento entrenado de citacion (56% de respuestas con fuente) resulta util para entornos con requisitos de auditoria.
- Deteccion de premisas falsas en conversacion: el modelo obtiene 1.000 en la accion de refutar del Candela Bench, por lo que puede emplearse para filtrar afirmaciones erroneas en flujos de atencion o verificacion ligera.
- Despliegue en entornos con privacidad estricta: al ejecutarse enteramente en local con llama.cpp, es apto para procesar texto sensible sin salida de datos a servicios externos.
- Prototipado de asistentes multilingues IT/ES/EN: la poda de vocabulario a estos tres idiomas reduce el coste de inferencia y lo hace adecuado para aplicaciones europeas con esos idiomas.
- Investigacion sobre etica integrada en pesos: sirve como caso de estudio reproducible para quienes investigan entrenamiento constitucional sin capa externa de guardrails, con benchmarks y auditoria publicados.
- Base para ajustes posteriores en dominios concretos: su tamano y licencia Apache 2.0 permiten reentrenarlo o adaptarlo con QLoRA en una sola GPU de consumo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, medidos sobre el Faro Bench (112 preguntas de dominio en 10 areas), una sonda de etica de 16 casos y una sonda anti-bulo de 12 casos.

| Prueba | Resultado |
|---|---|
| Faro Bench (112 preguntas, tres ejecuciones) | 94/90/92 aciertos (80,4-83,9%) |
| Sonda de etica (16 casos) | 14/16 y 15/16 en dos ejecuciones |
| Anti-bulo (12 casos) | 8/12 |
| Tool calls | no adaptado en v1 |

Candela Bench (439 items, IT/EN/ES, 6 modulos, scorer v0.2, presupuesto automatico):

| Dimension | Puntuacion |
|---|---|
| Honesty Index (contenido) | 0,859 |
| Honesty Index (estricto) | 0,785 |
| Respuestas con cita de fuente | 56% |
| Respuestas que alcanzan el limite de contexto | 0 |
| Respuestas vacias | 0 |

Desglose por accion:

| answer | refute | refuse | verify | ask | confine | comply | call |
|---|---|---|---|---|---|---|---|
| 0,901 | 1,000 | 1,000 | 0,881 | 0,721 | 0,893 | 0,412 | n/a |

Nota del autor: los items de tipo `call` no son aplicables en un arnes solo de texto y se excluyen del indice. La accion mas debil es `comply` (0,412), con rechazos indebidos de peticiones benignas. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para el modelo en q4_k_m; con cache KV cuantizada (`--cache-type-k turbo4`, `--cache-type-v turbo3_tcq`) el consumo se mantiene cerca de 1,5 GB en una GPU de 4 GB.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM; el autor lo ejecuta en hardware antiguo. Para el ajuste fino se uso una A100 alojada.
- Cabe en GPU de consumo: si, en tarjetas de 4 GB en adelante con cuantizacion q4_k_m.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), beellama y runtimes compatibles con GGUF. El autor indica endpoints compatibles.
- Configuracion de servicio recomendada por el autor: `-c 8192 -ngl 99 -fa on --jinja --reasoning-budget 0`, con razonamiento desactivado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-Faro | ~2,3B | 131.072 | Apache 2.0 | GGUF q4_k_m | Ajuste de comportamiento honesto, solo texto, IT/ES/EN |
| google/gemma-4-E2B-it (base) | ~2B | 131.072 | no disponible | safetensors | Multimodal (vision/audio), sin poda de vocabulario |
| Alternativas de ~2B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de resultados de benchmarks estandar para establecer una comparacion cuantitativa con otros modelos de la misma categoria mas alla del modelo base.

## Limitaciones y advertencias

- No es un modelo generalista: su conocimiento proviene de un pack de conocimiento propio y falla fuera de ese dominio.
- La accion `comply` es la mas debil (0,412): rechaza peticiones benignas como recetas, felicitaciones o traducciones alegando que no estan en el pack.
- La accion `confine` (acotar lo que queda fuera de su campo) solo funciona aproximadamente la mitad de las veces (0,52 en la descripcion cualitativa del autor) y `ask` (pedir datos faltantes) es debil (0,33).
- Varianza alta entre ejecuciones: mas de 2 puntos en el Faro Bench, reconocida por el autor.
- Tool calling nativo no adaptado en v1; los items de llamada a herramientas no son evaluables en el arnes actual.
- Solo texto: no conserva vision ni audio del modelo base.
- Requiere usar su plantilla de chat propia; responde mal fuera de ese formato.
- El razonamiento debe desactivarse en servicio; el modelo fue entrenado para operar sin el.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el diseno mitiga parte del riesgo mediante citacion y refutacion entrenadas, pero la sonda anti-bulo solo acierta 8 de 12 casos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-E2B-it, cuya licencia no se detalla en la informacion disponible.
- El scorer por defecto del repositorio sigue siendo v0.1; el v0.2 esta publicado como modulo separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alforiva/gemma-faro
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Proyecto Progetto Siliceo: https://progettosiliceo.online
- Resultados interactivos del benchmark: https://progettosiliceo.online/faro.html
- Informe tecnico (IT): https://progettosiliceo.online/papers/paper-faro-v1-it.pdf
- Informe tecnico (EN): https://progettosiliceo.online/papers/paper-faro-v1.pdf
- Informe tecnico (ES): https://progettosiliceo.online/papers/paper-faro-v1-es.pdf
