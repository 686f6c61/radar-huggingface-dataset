# joeyAIDev/zils-mini-body-m5

## Resumen

zils-mini-body-m5 es un modelo de lenguaje de 4.539.265.536 parametros (aproximadamente 4,5 mil millones) publicado por el usuario joeyAIDev en Hugging Face. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-4B, orientado segun la model card a funcionar como "decision body" dentro del ecosistema Zils, una plataforma que entrena modelos pequenos para tomar decisiones concretas (clasificar peticiones, marcar problemas o puntuar coincidencias) a partir de ejemplos proporcionados por el usuario.

El modelo emplea la libreria de transformers con codigo personalizado (tag `custom_code`) y una arquitectura etiquetada como `qwen3_5`, heredada del modelo base Qwen3.5-4B. Los pesos se distribuyen en formato safetensors, con un repositorio de 9,1 GB, y la licencia declarada es Apache-2.0. El contexto, los idiomas soportados y el pipeline de inferencia no estan documentados en la informacion disponible.

La relevancia de este modelo es limitada y muy especifica: no es un modelo generalista, sino un artefacto de fine-tuning dentro de un flujo de trabajo propietario (Zils) que exige un entorno Linux x86_64 con GPU NVIDIA para entrenamiento y un cliente propio (`zils-miner`) para su gestion. No cuenta con descargas ni likes en el momento de la consulta y su model card es practicamente vacia, lo que reduce su utilidad como referencia tecnica fuera de ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, heredada de Qwen/Qwen3.5-4B); requiere `custom_code` |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (ver NOTICE) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5, concretamente a la variante de 4B parametros del modelo Qwen/Qwen3.5-4B, sobre la que se ha aplicado un fine-tuning. El tag `custom_code` indica que la carga del modelo requiere codigo de modelado propio, no incluido en la libreria estandar de transformers, lo que implica dependencias adicionales para la inferencia. No se dispone de informacion sobre el tipo exacto de atencion, la composicion del dataset de ajuste, el numero de tokens empleados ni la existencia de fases de RLHF o DPO.

Segun el contexto de la busqueda web, el entrenamiento se realiza mediante la herramienta `zils-miner`, que exige Linux x86_64 con GPU NVIDIA y un repositorio de Hugging Face asociado a la cartera del usuario. El flujo descrito incluye registrar el modelo, entrenar un "body" y confirmarlo con `zils-miner commit-body`. Esto sugiere un ajuste supervisado a partir de ejemplos etiquetados (pares entrada-salida con la respuesta correcta), orientado a tareas de decision y no a generacion abierta. No hay datos publicados sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y clasificacion de peticiones dentro del marco Zils, segun la descripcion del proyecto ("sort requests, flag problems, or score matches").
- Toma de decisiones guiada por ejemplos: el modelo se entrena para replicar el criterio mostrado en los ejemplos proporcionados por el usuario.
- Puntuacion de coincidencias (scoring) entre entradas, segun la descripcion del servicio Zils.
- Deteccion y marcado de problemas en solicitudes (flagging), como capacidad declarada del ecosistema.
- Herencia potencial de las capacidades del base Qwen3.5-4B (razonamiento, codigo, matematicas, multilingueismo), aunque no confirmadas ni documentadas en esta ficha.
- Soporte de tool calling, function calling, agentes o modos de razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Clasificacion de solicitudes de soporte: el modelo puede asignar cada ticket entrante a una categoria predefinida (facturacion, incidencias tecnicas, cancelaciones) tras un fine-tuning con ejemplos etiquetados de la organizacion, aprovechando el flujo de entrenamiento de Zils.
- Triaje y marcado de incidencias: entrenado con ejemplos de casos problematicos, puede senalar solicitudes que requieren revision humana (fraude, abuso, contenido sensible) antes de que lleguen a un agente.
- Puntuacion de coincidencias en plataformas de emparejamiento: el modelo puede puntuar la afinidad entre perfiles o entre oferta y demanda, tal como describe el servicio Zils en su pagina principal.
- Enrutado interno de peticiones: dentro de un pipeline corporativo, el modelo puede decidir a que equipo o cola debe dirigirse cada mensaje, reduciendo la latencia de derivacion manual.
- Automatizacion de decisiones repetitivas en back-office: aprobacion o rechazo de solicitudes con criterios consistentes, siempre que se disponga de un conjunto de ejemplos representativos para el ajuste.
- Evaluacion de calidad de respuestas en un producto: el modelo puede actuar como scorer para comparar candidatos generados por otro sistema y seleccionar el que mejor se ajusta al criterio aprendido.
- Prototipado rapido de clasificadores personalizados: al partir de un base de 4B y requerir solo ejemplos, permite iterar sobre criterios de decision sin reentrenar desde cero, aunque el despliegue exige gestionar el `custom_code` y el cliente `zils-miner`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parametros, en FP16 se requieren aproximadamente 9 GB solo para pesos, mas memoria para activaciones y cache KV; en cuantizacion de 8 bits, en torno a 5-6 GB; en 4 bits, alrededor de 3-4 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: para FP16, una GPU con 16 GB o mas (RTX 4080/4090, A10, L4); para cuantizacion en 4-8 bits, GPUs consumer con 8-12 GB (RTX 3060 12 GB, RTX 4070) podrian ser suficientes, siempre que el codigo personalizado sea compatible.
- Cabe en GPU consumer: probablemente si, en cuantizaciones bajas, aunque la dependencia de `custom_code` y del ecosistema Zils condiciona el soporte real en herramientas estandar.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo; el flujo oficial descrito es mediante `zils-miner` en Linux x86_64 con GPU NVIDIA. La carga con transformers requeriria `trust_remote_code=True`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-m5 | 4,54 B | no disponible | Apache-2.0 | Hugging Face, requiere `custom_code` | Fine-tune de decision dentro del ecosistema Zils; sin benchmarks ni documentacion |
| Qwen/Qwen3.5-4B | ~4 B | no disponible en esta ficha | segun el modelo base | Hugging Face | Modelo base del que deriva; referencia directa |
| Alternativas genericas de ~4B (p. ej. familias Llama 3.x o Qwen 2.5 de tamano similar) | ~3-4 B | 8K-128K segun variante | licencias variables | amplia | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es practicamente vacia: no documenta datos de entrenamiento, contexto, idiomas ni evaluacion, lo que impide validar su calidad de forma objetiva.
- El modelo depende de `custom_code` y del ecosistema Zils; la inferencia fuera de ese flujo puede fallar o requerir dependencias no estandar.
- Riesgo de alucinacion y de sobreajuste a los ejemplos de entrenamiento: al ser un fine-tune orientado a decisiones, puede generalizar mal fuera de la distribucion de casos vistos.
- Sesgos desconocidos: no se han publicado analisis de sesgo; al heredar el base Qwen3.5-4B, puede arrastrar los sesgos de este y de los datos de ajuste.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue mas alla del que ofrezca el modelo base.
- Ausencia de benchmarks: no hay evidencia publicada de su rendimiento en MMLU, HumanEval, GSM8K ni otras tareas.
- Licencia Apache-2.0, que permite uso comercial, pero la model card remite a un NOTICE cuyo contenido no esta disponible en la informacion proporcionada; conviene revisarlo antes de desplegarlo en produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.
- El flujo de entrenamiento requiere Linux x86_64 con GPU NVIDIA, lo que excluye entornos macOS o ARM sin adaptaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joeyAIDev/zils-mini-body-m5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio del proyecto Zils: https://zils.ai/
- Documentacion para mineros Zils: https://zils.ai/miners
