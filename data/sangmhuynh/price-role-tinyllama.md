# SangMHuynh/price-role-tinyllama

## Resumen

El modelo `SangMHuynh/price-role-tinyllama` es un clasificador de texto binario publicado por el usuario SangMHuynh en Hugging Face. Su funcion es determinar si un fragmento corto de texto extraido de un cartel promocional corresponde a un precio regular (REGULAR_PRICE) o a un precio de oferta (SALE_PRICE). Se construye como un adaptador LoRA sobre el modelo base TinyLlama/TinyLlama-1.1B-Chat-v1.0, al que se anade una cabeza de clasificacion de dos clases.

El modelo resuelve un problema muy concreto dentro de un flujo de trabajo de automatizacion: sustituir el paso de clasificacion de pasajes en un workflow de n8n que valida carteles promocionales contra una lista de precios aprobada. Un modelo de vision lee el cartel, cada fragmento de precio se envia a este clasificador y solo los fragmentos etiquetados como SALE_PRICE se comparan con el precio de oferta aprobado. Es, por tanto, una herramienta de nicho y no un modelo de proposito general.

La relevancia es limitada: se trata de un experimento de un autor individual, con licencia no especificada, cero descargas y cero likes en el momento de la consulta. Su interes tecnico radica en el enfoque (adaptador LoRA de bajo rango sobre un modelo de 1,1B para una tarea de clasificacion muy acotada) y en la documentacion transparente de sus limitaciones por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TinyLlama) con adaptador LoRA y cabeza de clasificacion de dos clases |
| Parametros totales | No disponible (modelo base de 1,1B; adaptador LoRA de aproximadamente 2,26 millones de parametros entrenados, 0,22%) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (unico idioma de entrenamiento declarado) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de TinyLlama/TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de 1,1B parametros, y aplica un adaptador LoRA en lugar de un ajuste completo. El adaptador tiene rango 8, alpha 16 y dropout 0,05, aplicado sobre las capas `q_proj`, `k_proj`, `v_proj` y `o_proj`. Sobre el modelo base se anade una cabeza de clasificacion nueva de dos clases que se entrena junto con el adaptador. En total se entrenaron aproximadamente 2,26 millones de parametros (0,22% del total), durante 4 epocas con tasa de aprendizaje 2e-4 y tamano de lote 8, en unos un minuto sobre una GPU T4.

El conjunto de entrenamiento consta de 480 fragmentos, 240 por categoria, generados a partir de 24 familias de redaccion (48 formulaciones distintas, como "Was $X", "Listed originally for $X" o "Sale offer amount = $X", incluyendo disposiciones en las que el precio y la etiqueta estan en lineas separadas). Los importes provienen de la lista de precios aprobada del propio autor. Los fragmentos se generaron a partir de plantillas, no fueron revisados manualmente ni recogidos de carteles reales o de salida OCR real. La particion es de 160 fragmentos por categoria para entrenamiento, 40 para validacion y 40 para prueba, es decir, 80 fragmentos retenidos en total. La division se hace por familia de redaccion, de modo que ninguna formulacion de validacion o prueba aparece en entrenamiento. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Clasificacion binaria de texto: asigna una etiqueta REGULAR_PRICE o SALE_PRICE a un fragmento corto en ingles.
- Salida de confianza basada en la mayor de las dos probabilidades softmax.
- Procesamiento de fragmentos cortos con palabras de rol de precio y el importe (por ejemplo, "Sale Price $87.60" o "Was $899.00").
- Uso en pipelines de automatizacion como paso de clasificacion previo a una comparacion de precios.
- Umbral de confianza operativo: el autor recomienda enviar a revision humana los fragmentos con confianza inferior a 0,8.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue: no disponible; solo se entreno en ingles.

## Casos de uso

- Validacion de carteles promocionales en retail: el clasificador recibe cada fragmento de precio extraido por un modelo de vision y decide si es precio regular u oferta, de modo que solo los de oferta se comparan con la lista de precios aprobada. Es el caso de uso original descrito por el autor.
- Automatizacion de flujos n8n: sustituto directo del paso "Classify Passage" en workflows de comprobacion de precios, con derivacion a revision humana cuando la confianza es baja.
- Control de calidad de materiales promocionales: deteccion de que precios de un cartel deben auditarse contra la politica comercial antes de su publicacion.
- Clasificacion de lineas de precio en extraccion documental: etiquetado de fragmentos de precio en documentos estructurados o semiestructurados en ingles y dolares estadounidenses.
- Filtrado previo en sistemas de comparacion de precios: reduccion del numero de fragmentos que llegan a la etapa de comparacion costosa.
- Prototipado rapido de clasificadores de nicho: el adaptador LoRA y el cuaderno de entrenamiento incluido sirven como plantilla para tareas de clasificacion binaria sobre TinyLlama con muy pocos datos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision (exactitud) en prueba (80 fragmentos retenidos) | 97,5% (78 correctos) |
| Precision (exactitud) en validacion | 98,8% |
| Precision (precision) REGULAR_PRICE | 1,00 |
| Exhaustividad (recall) REGULAR_PRICE | 0,95 |
| Precision (precision) SALE_PRICE | 0,95 |
| Exhaustividad (recall) SALE_PRICE | 1,00 |
| Clasificacion automatica con umbral 0,8 | 70 de 80 fragmentos, sin errores entre ellos |
| Prueba sobre 15 fragmentos de carteles del workflow | 13 correctos, 2 fallos en precios sin palabra de rol |

El autor advierte que el conjunto de prueba contiene solo 8 formulaciones distintas repetidas 10 veces con importes diferentes, por lo que los 80 fragmentos no constituyen 80 pruebas independientes, y que una regla simple de palabras clave tambien obtiene un 100% en ese conjunto. Los dos unicos errores en prueba fueron fragmentos REGULAR_PRICE predichos como SALE_PRICE, ambos con la formulacion "$X (regular price before promotion)" y confianzas de 0,50 y 0,55.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un adaptador sobre TinyLlama de 1,1B, la huella es reducida y cabe en GPU de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: el autor entreno el adaptador en una T4 en aproximadamente un minuto; para inferencia es suficiente cualquier GPU consumer moderna.
- Cabe en GPU consumer: si, al estar basado en un modelo de 1,1B parametros.
- Opciones de despliegue: la libreria declarada es PEFT; el despliegue requeriria cargar el modelo base TinyLlama junto con el adaptador mediante la libreria `peft` y `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada, y no se identifican alternativas directamente comparables (clasificadores binarios de rol de precio sobre TinyLlama) en el material disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SangMHuynh/price-role-tinyllama | Base 1,1B; adaptador de 2,26M | No disponible | No disponible | Hugging Face, 0 descargas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 (base) | 1,1B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Alternativas de clasificacion binaria de texto | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado solo con fragmentos cortos en ingles y precios en dolares estadounidenses generados a partir de plantillas; probablemente falla con redacciones inusuales, otras divisas, otros idiomas, texto largo, fragmentos con varios precios y salida OCR real con errores de reconocimiento.
- Siempre elige una de las dos etiquetas: un precio sin palabra de rol, como "$199.00", se etiqueta como SALE_PRICE con confianza cercana a 0,99. El flujo debe derivar estos casos a revision humana mediante una regla propia y no confiar en la confianza para detectarlos.
- La confianza es una puntuacion softmax, no una probabilidad calibrada, y se aproxima a 1,00 en redacciones similares a las de entrenamiento.
- El conjunto de prueba es reducido y poco diverso (8 formulaciones repetidas), por lo que las metricas publicadas deben interpretarse con cautela; una regla de palabras clave obtiene un 100% en ese mismo conjunto.
- No debe usarse para aprobar automaticamente un cartel o un precio: solo ayuda a decidir que precio comparar, y la decision final corresponde a una persona.
- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Sin descargas ni likes registrados y con fecha de creacion posterior a la consulta de datos; se trata de un experimento de un autor individual sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SangMHuynh/price-role-tinyllama
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
