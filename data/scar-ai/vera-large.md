# scar-ai/vera-large

## Resumen

vera-large es un modelo de decisión no autorregresivo desarrollado por scar-ai, derivado del backbone de Qwen3.8-27B (Apache-2.0). A diferencia de los modelos generativos convencionales, no produce texto: recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades calibradas. Esto elimina el parseo de salida y reduce drásticamente el riesgo de alucinación, ya que el modelo puntúa opciones en lugar de generarlas.

Con 25.628.527.110 parámetros totales y un checkpoint en bf16 de aproximadamente 51 GB, vera-large es la primera variante "large" de la familia vera, construida sobre la forma de lectura de opciones de vera-core-2. En el tablero público Jev Decision Index 0.4.1 obtiene 65,26 en la métrica Full y 67,75 en Public, con un error de calibración (ECE) de 0,051, situándose en el puesto =6 de 241 entradas y por delante de la referencia Jev 1.14 (60,24 Full).

El modelo es relevante porque aborda una tarea distinta a la generación: la clasificación y decisión calibrada en escenarios de producción donde la confianza es tan importante como la respuesta. Su formato de cable es compatible con Jev (`POST /v1/systemone`), lo que facilita su integración en pipelines existentes de enrutamiento, triaje y selección de herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención completa y capas Gated DeltaNet (no autorregresivo para decisión) |
| Parámetros totales | 25.628.527.110 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor indica que cada petición se lee completa: estado, pregunta y opciones nunca se truncan) |
| Tipos de cuantización | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pytorch, custom_code) |

## Arquitectura y entrenamiento

vera-large se construye sobre el backbone de texto de Qwen3.8-27B, conservando aproximadamente 26B parámetros. Cada pregunta se procesa en un único forward pass: el prompt enumera todas las opciones bajo un código de respuesta corto, las capas de atención completa ven el prompt entero (mientras que las capas Gated DeltaNet permanecen causales) y cada opción se puntúa en el último token del prompt mediante su código de respuesta, junto con un mecanismo de lectura de puntero de opción que mira hacia atrás a la línea propia de la opción.

El entrenamiento actualiza por completo las proyecciones de atención completa, las puertas DeltaNet y todas las normalizaciones, mientras que el resto del backbone se ajusta mediante LoRA. Los adaptadores LoRA se pliegan en los pesos publicados, de modo que el checkpoint liberado es un modelo completo plano. Las probabilidades se calibran por temperatura según el tipo de pregunta. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Decisión y clasificación tipada con probabilidades calibradas: tipos de pregunta `choice` (2 a 255 opciones), `score` (2 a 10 niveles ordenados, devuelve puntuación esperada y distribución completa) y `noul` (probabilidad sí/no).
- Enrutamiento y triaje de tickets, correos y peticiones.
- Clasificación de intención y tema con confianza calibrada para escalado.
- Selección de herramientas y funciones para agentes (incluida la opción "ninguna").
- Verificación de políticas y cumplimiento normativo, incluso con documentos largos.
- Puntuación y severidad en escalas ordinales (urgencia, sentimiento, riesgo).
- Verificación de hechos y afirmaciones contra un documento.
- Evaluación y ranking de respuestas candidatas.
- Flujos con puerta de confianza: actuar automáticamente si la confianza es alta y derivar a un modelo más lento o a un humano si no.
- Procesamiento de estado en texto plano o cualquier objeto serializable en JSON.
- No genera texto: no hay salida que parsear ni alucinación de formato.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Triaje de soporte al cliente: enviar un ticket con su descripción completa y preguntar por departamento (choice), urgencia (score) y riesgo de baja (noul); el modelo devuelve probabilidades calibradas que permiten enrutar automáticamente y escalar cuando la confianza es baja.
- Enrutamiento de correo entrante: clasificar mensajes en colas o equipos con una pregunta `choice` de hasta 255 opciones, usando la distribución de probabilidad para decidir si se necesita revisión humana.
- Selección de herramientas en agentes: dado el estado de una conversación, elegir qué API o función invocar a continuación (o ninguna) mediante una pregunta `choice`, con la ventaja de que la respuesta es un índice tipado y no texto libre.
- Cumplimiento normativo: comprobar si un caso cumple o infringe una regla concreta, incluyendo documentos de política largos, gracias a que la petición completa se lee sin truncar.
- Puntuación de severidad y sentimiento: usar preguntas `score` para obtener una distribución completa sobre niveles ordenados (por ejemplo, cinco niveles de urgencia) y calcular la puntuación esperada para priorización.
- Verificación de afirmaciones: contrastar una afirmación contra un documento fuente con una pregunta `noul`, obteniendo la probabilidad de que la afirmación sea correcta.
- Evaluación de respuestas de modelos: comparar dos respuestas candidatas con una pregunta `choice` y seleccionar la mejor, útil en pipelines de evaluación automática.
- Flujos con umbral de confianza: automatizar decisiones cuando la probabilidad supera un umbral y derivar al resto a un modelo generativo o a un operador humano.

## Benchmarks y rendimiento

Resultados del tablero público Jev Decision Index 0.4.1 (mayor es mejor; todas las métricas corregidas por azar, 0 es aleatorio y 100 perfecto; ECE menor es mejor):

| Modelo | Parámetros | Full | Public | knowledge | language | retrieval | tools | arts | ECE |
|---|---|---|---|---|---|---|---|---|---|
| vera-large (este repo) | 25,6B | 65,26 | 67,75 | 51,2 | 75,7 | 69,5 | 83,0 | 58,5 | 0,051 |
| vLLM-SR d3 | 26,1B | 67,15 | 65,45 | 55,3 | 68,0 | 66,9 | 82,6 | 51,0 | 0,043 |
| Jev 1.14 (referencia) | – | 60,24 | 60,70 | 57,1 | 61,2 | 63,5 | 73,8 | 39,2 | 0,080 |
| vera-core-2 | 1,9B | 30,60 | 41,28 | 21,4 | 43,9 | 53,8 | 61,5 | 23,9 | 0,046 |

vera-large ocupa el puesto =6 de 241 entradas del tablero; Jev 1.14 está en el =11. La latencia mediana por petición es de 160 ms en la RTX PRO 6000 del tablero. El modelo vera-large-2o ha sustituido a vera-large en el tablero con 66,26 Full (=8 de 300 entradas, instantánea del 12 de noviembre de 2026) y añade imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: se requiere una GPU de clase 80 GB o superior; los pesos en bf16 ocupan aproximadamente 51 GB.
- GPU recomendadas: H100 80GB, RTX PRO 6000 96GB, MI300X.
- No cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB, RTX 3090 de 24 GB); no se documentan cuantizaciones alternativas que lo permitan.
- Opciones de despliegue: paquete `vera-s1` (versión 0.1.6 o superior) con Python 3.10 o superior; la extra `[fast]` añade flash-linear-attention para las capas DeltaNet. Servidor HTTP compatible con Jev mediante `vera-serve` (`POST /v1/systemone`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: latencia mediana de 160 ms por petición en la RTX PRO 6000 del tablero; no se publica throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Full (Jev DI 0.4.1) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vera-large | 25,6B | no disponible | 65,26 | 0,051 | Apache-2.0 | Hugging Face (scar-ai/vera-large) |
| vLLM-SR d3 | 26,1B | no disponible | 67,15 | 0,043 | no disponible | no disponible |
| Jev 1.14 | no disponible | no disponible | 60,24 | 0,080 | no disponible | no disponible |
| vera-core-2 | 1,9B | no disponible | 30,60 | 0,046 | no disponible | Hugging Face (scar-ai/vera-core-2) |

## Limitaciones y advertencias

- Modelo solo en inglés: no se documenta soporte multilingüe, lo que limita su uso en castellano u otros idiomas sin evaluación adicional.
- No es un modelo generativo: no puede producir texto libre, resúmenes ni explicaciones; solo responde a preguntas tipadas con opciones predefinidas.
- Riesgo de alucinación reducido por diseño, pero las probabilidades calibradas pueden ser incorrectas si la distribución de producción difiere de la del entrenamiento; se recomienda monitorizar el ECE.
- La calibración se realiza por temperatura según el tipo de pregunta; cambios en el formato o la longitud de las opciones podrían afectar a la calibración.
- Requisitos de hardware elevados (GPU de 80 GB o más), lo que encarece el despliegue en producción.
- No se documentan cuantizaciones ni métodos de despliegue alternativos (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de optimización.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de la licencia del modelo base Qwen3.8-27B y de las dependencias (`vera-s1`, flash-linear-attention).
- El modelo ha sido sustituido en el tablero por vera-large-2o; conviene evaluar si la versión más reciente se ajusta mejor al caso de uso.
- No se especifican los datos de entrenamiento ni posibles sesgos; se recomienda auditar el comportamiento en dominios sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/scar-ai/vera-large
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- vera-core-2: https://huggingface.co/scar-ai/vera-core-2
- vera-large-2o: https://huggingface.co/scar-ai/vera-large-2o
- Tablero público Jev Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
