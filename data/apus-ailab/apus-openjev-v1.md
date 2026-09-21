# apus-ailab/APUS-OpenJev-v1

## Resumen

APUS-OpenJev-v1 es una familia de modelos de decisión desarrollada por APUS AI Lab (apus-ailab), pensada para agentes de navegador y flujos de trabajo empresariales. A diferencia de un modelo conversacional, recibe una tarea, un contexto y un conjunto de acciones candidatas, y devuelve una elección puntuada que la aplicación puede ejecutar directamente. La familia incluye tres variantes con una interfaz de decisión común: 4B, 9B y 35B-A3B (MoE con aproximadamente 3.000 millones de parámetros activos), todas derivadas de la familia Qwen3.5.

La innovación principal es la profundidad de cómputo seleccionable: la aplicación elige `effort="low"` o `effort="high"`. La ruta nativa baja combina una salida temprana ya entrenada con una proyección de salida consciente de los candidatos, que calcula puntuaciones únicamente para las etiquetas candidatas suministradas en las cabezas de salida soportadas. Esto reduce la profundidad ejecutada y el trabajo innecesario de la cabeza de salida, manteniendo el espacio de salida lingüístico compartido del modelo. El post-entrenamiento se realiza de forma conjunta entre ambas rutas de cómputo.

El modelo es relevante porque ataca un cuello de botella concreto: en tareas de elección acotada (enrutado, validación de formularios, selección de acciones en un agente), generar una respuesta estructurada token a token es caro e innecesario. APUS-OpenJev sustituye esa generación por un mecanismo de puntuación de candidatos. En su panel congelado de 80 preguntas, la variante 35B-A3B alcanza un 88,75 % de acierto y la 9B un 85,00 %, frente al 82,50 % de la API Jev tomada como referencia. El servicio de decisión 9B optimizado reporta una latencia HTTP mediana de 25,58 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de la familia Qwen3.5, con profundidad de ejecucion seleccionable (dynamic depth) y proyeccion de salida consciente de candidatos (candidate-aware output projection). La variante 35B-A3B es de mezcla de expertos (MoE) |
| Parametros totales | Tres variantes: 4B, 9B y 35B-A3B (35B totales en la mayor) |
| Parametros activos | Aproximadamente 3B en la variante 35B-A3B (sufijo A3B). No disponible para 4B y 9B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible. El material publicado menciona pesos fusionados en BF16; no se documentan GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | no disponible en la ficha de HuggingFace. El README declara licencia MIT para las contribuciones originales y enlaza un archivo LICENSE; al derivar de Qwen3.5, pueden aplicar condiciones adicionales del modelo base |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 43,9 GB |
| Modelos base | Qwen/Qwen3.5-4B, Qwen/Qwen3.5-9B, Qwen/Qwen3.5-35B-A3B |
| Interfaz de inferencia | API de decision con parametro `effort` ("low" / "high"); repositorio marcado como `endpoints_compatible` |
| Descargas y likes | 17 descargas, 16 likes |
| Fechas | Creado el 21 de septiembre de 2026; actualizado el 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La familia parte de tres checkpoints de Qwen3.5 (4B, 9B y 35B-A3B) y los adapta a una tarea de decisión. Sobre esa base se incorporan dos mecanismos propios: profundidad de ejecución seleccionable y una proyección de salida consciente de candidatos. El primero permite terminar la inferencia en una capa temprana concreta (`effort="low"`) o recorrer la red completa (`effort="high"`). El segundo restringe el cálculo de puntuaciones a las etiquetas candidatas suministradas, en lugar de evaluar todo el vocabulario o generar una secuencia estructurada token a token. La salida no es texto libre, sino una elección puntuada que el runtime mapea de vuelta a acciones de la aplicación.

El post-entrenamiento es conjunto entre profundidades: ambas rutas de ejecución aprenden de decisiones de referencia y la ruta completa proporciona una señal de aprendizaje a nivel de distribución para la ruta corta, de modo que las decisiones tempranas sean útiles y no dependan de una representación intermedia sin entrenar. El README no detalla el número de tokens de entrenamiento ni la composición del dataset, y tampoco especifica si se emplearon RLHF, DPO u otras técnicas de alineamiento. La evaluación se realiza sobre un panel congelado de 80 preguntas y sobre un panel ampliado de 1.000 preguntas, con identidades de pregunta y etiquetas de referencia fijas. Existe también un dataset público de evaluación, APUS-OpenJev-Eval-Frozen80.

## Capacidades

- Toma de decisiones con elección acotada: recibe tarea, contexto y acciones candidatas, y devuelve una elección puntuada.
- Decisiones definidas en lenguaje natural: las definiciones de tarea y el significado de los candidatos se expresan en lenguaje natural, lo que permite manejar espacios de decisión cambiantes sin un clasificador de categorías separado.
- Profundidad de cómputo ajustable mediante `effort="low"` y `effort="high"`, para equilibrar coste y calidad de decisión.
- Proyección de salida consciente de candidatos: puntúa únicamente las etiquetas candidatas en las cabezas de salida soportadas.
- Salida estructurada orientada a decisión (tag `structured-output`), que evita la generación token a token en tareas de elección acotada.
- Multilingüe limitado a inglés y chino.
- Diseñado para agentes de navegador y flujos de trabajo empresariales, según declara el autor.
- No se documenta soporte de tool calling o function calling en la información disponible; la interfaz publicada es de puntuación de candidatos, no de invocación de herramientas.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido explícito.

## Casos de uso

- Agentes de navegador web: el modelo elige la siguiente acción (clic, relleno de campo, navegación) entre un conjunto de candidatas extraídas del DOM, con `effort="low"` para pasos rutinarios y `effort="high"` para decisiones ambiguas.
- Enrutado de tickets de soporte: dada la descripción del ticket y una lista de colas o equipos candidatos, devuelve la asignación puntuada; el contexto se define en lenguaje natural, así que añadir una cola nueva no requiere reentrenar un clasificador.
- Automatización de back-office: selección de la acción correcta en procesos de aprobación, validación documental o conciliación, donde el espacio de acciones está acotado y es conocido en tiempo de ejecución.
- RPA y automatización de formularios: elección del valor o de la casilla correcta entre las opciones válidas de un formulario, aprovechando que la proyección de salida solo evalúa las etiquetas candidatas.
- Servicio de decisión de baja latencia: la variante 9B optimizada reporta 25,58 ms de latencia HTTP mediana, adecuada para decisiones en línea dentro de un pipeline interactivo.
- Triaje previo a un LLM generativo: usar la variante 4B o 9B como primera etapa que resuelve decisiones acotadas y delega en un modelo mayor solo los casos abiertos, reduciendo coste por petición.
- Despliegue en infraestructura propia: al publicarse en safetensors y con pesos fusionados en BF16, puede ejecutarse en entornos on-premise donde no se permite enviar datos a APIs externas.
- Evaluación comparativa interna: usar el panel congelado de 80 preguntas y el dataset público de evaluación para medir regresiones antes de desplegar una nueva versión.

## Benchmarks y rendimiento

Panel de regresión congelado de 80 preguntas (identidades y etiquetas de referencia idénticas para todos los modelos):

| Modelo | Correctas / total | Precision |
|---|---|---|
| APUS-OpenJev 35B-A3B | 71 / 80 | 88,75 % |
| APUS-OpenJev 9B | 68 / 80 | 85,00 % |
| APUS-OpenJev 4B | 66 / 80 | 82,50 % |
| Jev API | 66 / 80 | 82,50 % |
| Laya (configuracion tipada, entrada completa) | 55 / 80 | 68,75 % |

Panel ampliado de desarrollo (decisiones validas y correctas sobre 1.000 preguntas):

| Modelo | Precision |
|---|---|
| APUS 35B-A3B | 82,20 % |
| APUS 9B | 81,10 % |
| APUS 4B | 80,50 % |
| Jev API | 77,00 % |
| Laya | 50,50 % |

Notas del autor sobre estas cifras: la fila de 35B-A3B corresponde al checkpoint-5949, fusionado en BF16 y con las 40 capas completas; el resultado de 85,00 % para 9B usa el checkpoint-3000, mientras que la medición de latencia optimizada (25,58 ms de mediana HTTP) usa el checkpoint-5949. Jev presenta 972 resultados válidos de 1.000 (28 no disponibles permanecen en el denominador) y Laya usa configuración tipada con entrada completa. El autor advierte explícitamente que estas diferencias de panel no establecen superioridad amplia ni estadísticamente significativa. Cada familia de tareas del panel contiene 16 preguntas, por lo que una sola respuesta cambia la precisión en 6,25 puntos porcentuales.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del número de parámetros y del tamaño del repositorio (43,9 GB); el autor no publica requisitos oficiales de hardware.

- Variante 4B: aproximadamente 8-9 GB de pesos en BF16, más caché KV y activaciones; en la práctica unos 10-12 GB de VRAM.
- Variante 9B: aproximadamente 18-20 GB de pesos en BF16; en torno a 20-22 GB de VRAM con contexto corto.
- Variante 35B-A3B: aproximadamente 70 GB de pesos en BF16; unos 80 GB de VRAM o reparto entre varias GPU. Al ser MoE con unos 3B activos, el coste de cómputo por token es muy inferior al de un denso de 35B, pero la memoria debe alojar todos los expertos.
- GPU consumer: la variante 4B cabe con holgura en una RTX 4090 (24 GB) y una RTX 4080 (16 GB). La 9B es ajustada en 24 GB y necesitaría cuantización para 16 GB. La 35B-A3B solo cabría en 24 GB con cuantización agresiva, opción no documentada por el autor.
- GPU de datacenter: A100 40 GB y L40S para la 9B; A100 80 GB o H100 80 GB para la 35B-A3B en BF16.
- Despliegue: la librería declarada es transformers sobre safetensors, y el repositorio está marcado como `endpoints_compatible`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; dado que no se publican pesos GGUF ni cuantizados, la única vía confirmada es transformers.
- Latencia: 25,58 ms de mediana HTTP en el servicio de decisión 9B optimizado (snapshot correspondiente al checkpoint-5949). No se publican datos de throughput ni de latencia para 4B y 35B-A3B.

## Comparativa con modelos similares

No se dispone de datos técnicos (parámetros, contexto, licencia) de las alternativas citadas en la model card, más allá de su precisión en el panel de 80 preguntas. Comparativa con lo disponible:

| Modelo | Parametros | Precision (panel 80) | Precision (panel 1.000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APUS-OpenJev 35B-A3B | 35B totales, ~3B activos (MoE) | 88,75 % | 82,20 % | no disponible (MIT para contribuciones originales segun README) | Pesos abiertos en HuggingFace |
| APUS-OpenJev 9B | 9B | 85,00 % | 81,10 % | no disponible (MIT para contribuciones originales segun README) | Pesos abiertos en HuggingFace |
| APUS-OpenJev 4B | 4B | 82,50 % | 80,50 % | no disponible (MIT para contribuciones originales segun README) | Pesos abiertos en HuggingFace |
| Jev API | no disponible | 82,50 % | 77,00 % | no disponible | API cerrada |
| Laya (configuracion tipada) | no disponible | 68,75 % | 50,50 % | no disponible | no disponible |

Respecto a los modelos base (Qwen3.5-4B, Qwen3.5-9B y Qwen3.5-35B-A3B), no se publican en la información disponible comparaciones directas de precisión en el panel: APUS-OpenJev es un fine-tuning especializado, no un modelo generalista, por lo que la comparación en tareas de generación abierta no sería pertinente con los datos disponibles.

## Limitaciones y advertencias

- Modelo de decisión, no de propósito general: no está pensado para generación de texto libre ni para chat; su salida es una elección puntuada sobre candidatas suministradas.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Longitud de contexto no documentada, lo que impide planificar despliegues con contextos largos.
- Evidencia de evaluación reducida: el panel principal tiene 80 preguntas y la propia model card advierte que las diferencias observadas no establecen superioridad amplia ni estadísticamente significativa. Las cifras del panel de 1.000 preguntas provienen de checkpoints históricos distintos (5949) de los publicados como release (3000 para 9B), según aclara el autor.
- Las probabilidades de candidatos del runtime autónomo no son numéricamente equivalentes a las del adaptador original, según la documentación de la variante 35B.
- Licencia no declarada en la ficha de HuggingFace: antes de un uso comercial hay que revisar el archivo LICENSE del repositorio y las condiciones de los modelos base Qwen3.5, ya que una licencia MIT que cubra solo las contribuciones originales no resuelve por sí sola los derechos sobre los pesos derivados.
- No se documentan pesos cuantizados, ni soporte para vLLM, llama.cpp u Ollama, lo que limita el despliegue en hardware de gama media y en entornos con requisitos de eficiencia.
- No se documentan datos de entrenamiento (tokens, composición, técnicas de alineamiento), por lo que no es posible evaluar sesgos de datos ni riesgos de alucinación en la interfaz de decisión.
- Riesgo operativo en producción: al devolver puntuaciones sobre candidatas, un conjunto de candidatas mal construido degrada la calidad de la decisión, con independencia de la capacidad del modelo.
- Adopción incipiente: 17 descargas y 16 likes en el momento de la consulta, con muy poca validación independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apus-ailab/APUS-OpenJev-v1
- Variante 35B-A3B: https://huggingface.co/apus-ailab/APUS-OpenJev-v1-35B-A3B
- Variante 9B: https://huggingface.co/apus-ailab/APUS-OpenJev-v1-9B
- Variante 4B: https://huggingface.co/apus-ailab/APUS-OpenJev-v1-4B
- Pesos: https://huggingface.co/apus-ailab/APUS-OpenJev-v1/tree/main
- Informe tecnico (PDF): https://huggingface.co/apus-ailab/APUS-OpenJev-v1/blob/main/TECHNICAL_REPORT.pdf
- Guia de arquitectura: ARCHITECTURE.md (en el repositorio del modelo)
- Dataset de evaluacion: https://huggingface.co/datasets/apus-ailab/APUS-OpenJev-Eval-Frozen80
- Evidencia de evaluacion 35B: https://huggingface.co/apus-ailab/APUS-OpenJev-v1-35B-A3B/blob/main/evaluation/standalone-frozen80.json
- Detalles del runtime 35B: https://huggingface.co/apus-ailab/APUS-OpenJev-v1-35B-A3B/blob/main/RUNTIME.md
- Licencia: https://huggingface.co/apus-ailab/APUS-OpenJev-v1/blob/main/LICENSE
- Web oficial de APUS: https://www.apusai.com
- Organizacion en HuggingFace: https://huggingface.co/apus-ailab
- GitHub de APUS AI Lab: https://github.com/APUS-AI-Lab
- Modelos base: https://huggingface.co/Qwen/Qwen3.5-4B, https://huggingface.co/Qwen/Qwen3.5-9B, https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Nota sobre la busqueda web: los unicos resultados devueltos corresponden a portales de contratacion publica de Kosovo y Albania (e-prokurimi.rks-gov.net, app.gov.al, krpp.rks-gov.net), sin relacion alguna con el modelo. No se han encontrado articulos, papers ni repositorios independientes sobre APUS-OpenJev-v1.
