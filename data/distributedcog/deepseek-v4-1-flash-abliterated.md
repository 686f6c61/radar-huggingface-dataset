# distributedcog/DeepSeek-V4.1-Flash-abliterated

## Resumen

DeepSeek-V4.1-Flash-abliterated es una variante editada del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash`, publicada por el usuario `distributedcog` el 11 de septiembre de 2026. Se trata de un modelo de mezcla de expertos (MoE) multimodal de gran tamano al que se le ha eliminado quirurgicamente la direccion de rechazo mediante una tecnica de *abliteration* biproyectada que preserva la norma (grimjim, 2025). El objetivo declarado es obtener un modelo que responda a practicamente cualquier peticion sin negarse, manteniendo al mismo tiempo la coherencia y las capacidades del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de edicion de pesos sobre un modelo frontera abierto bajo licencia MIT, con artefactos reproducibles (`refusal_directions.pt` y `abliteration_config.json`) que permiten repetir la ablacion a distintas escalas sin volver a medir las direcciones. Por otro lado, sirve como aviso practico: es un modelo sin censura integrada, pensado para investigacion en seguridad e interpretabilidad, no para despliegue directo en produccion sin una capa de moderacion propia.

Arquitectonicamente es un transformer MoE multimodal de la familia `deepseek_v41`, con un backbone declarado de 552B parametros y 8-16B parametros activos por token, torre de vision y memoria Engram. El repositorio de safetensors declara 763.205.315.794 parametros totales, una cifra que no coincide con los 552B de la model card. El repo ocupa 510,3 GB y conserva el mismo layout de 48 shards en FP8/FP4 que el modelo base. No se ha publicado informacion sobre la longitud de contexto ni sobre los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal, familia `deepseek_v41` (transformer con expertos enrutados, torre de vision y memoria Engram) |
| Parametros totales | 763.205.315.794 segun los safetensors del repositorio; la model card declara 552B en el backbone (discrepancia no resuelta) |
| Parametros activos | 8-16B (segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (8-bit) en pesos y expertos compartidos, FP4 en expertos enrutados; bloques FP8 de 32x32 con escala ue8m0 de potencia de dos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 510,3 GB) |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. El repositorio es un espejo del checkpoint original `deepseek-ai/DeepSeek-V4.1-Flash` en el que solo se han sustituido los tensores ablacionados; el resto de pesos es identico byte a byte. La arquitectura es una mezcla de expertos multimodal con torre de vision, memoria Engram y conexiones hipervinculadas (el flujo residual se mide en el estado colapsado de hiperconexion, a la entrada de `attn_norm`). La model card declara 552B parametros de backbone y 8-16B activos, mientras que los metadatos de safetensors suman 763.205.315.794 parametros; no se explica el origen de la diferencia.

El metodo de edicion es una *abliteration* biproyectada que preserva la norma. Se midieron direcciones de rechazo por capa sobre 128 prompts daninos y 128 inofensivos, ortogonalizadas contra la direccion media de los inofensivos (abliteration proyectada). Las ediciones se aplicaron con escala 3.0 a las filas de la proyeccion de salida de atencion (`attn.wo_b`) y de la proyeccion descendente de los expertos compartidos (`ffn.shared_experts.w2`) en el rango de capas objetivo. Los bloques FP8 32x32 se desquantizaron, se editaron y se requantizaron de forma exacta con escalas potencia de dos; los expertos enrutados en FP4, la memoria Engram y la torre de vision quedan intactos. El repositorio incluye `refusal_directions.pt` con las direcciones medidas por capa y `abliteration_config.json` con los parametros finales y los resultados de evaluacion.

## Capacidades

- Generacion de texto y razonamiento en un modelo MoE de gran escala, con 8-16B parametros activos por token.
- Capacidades multimodales: existe torre de vision y la model card reporta una prueba cross-modal con prompts daninos presentados como imagen.
- Procesamiento de entrada visual ademas de texto, segun la prueba cross-modal descrita.
- Memoria Engram y expertos compartidos, conservados sin modificar respecto al modelo base.
- Ausencia practica de rechazos: 1/100 rechazos reales segun el juez LLM en la evaluacion del autor, frente a 17/100 del modelo base.
- Razonamiento matematico basico preservado: 16/20 en un control puntual de GSM8K en modo chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion en seguridad y red-teaming: el modelo permite estudiar que ocurre cuando se elimina la direccion de rechazo de un MoE frontera, comparando el comportamiento del checkpoint ablacionado con el del modelo base mediante el mismo conjunto de prompts daninos y el mismo juez LLM. Es el uso para el que el autor disena explicitamente los artefactos de medicion.
- Generacion de datos para entrenar moderadores: las respuestas no rechazadas pueden usarse como ejemplos negativos etiquetados para ajustar clasificadores de contenido (por ejemplo, Llama Guard). El propio autor recomienda anadir moderacion de entrada y salida en produccion, lo que convierte al modelo en una fuente de casos dificiles para esos clasificadores.
- Investigacion en interpretabilidad mecanicista: `refusal_directions.pt` contiene las direcciones por capa, lo que permite reaplicar la ablacion a escalas distintas y medir el efecto sobre rechazos y coherencia sin repetir la fase de medicion. Es util para estudiar donde se localiza el comportamiento de rechazo en un MoE multimodal de gran tamano.
- Escritura creativa sin filtros: ficcion con violencia explicita, terror, personajes moralmente ambiguos o tramas con contenido sensible, donde los rechazos del modelo base interrumpen el flujo narrativo. La prueba de GSM8K sugiere que la coherencia general no se degrada de forma apreciable.
- Asistencia en dominios tecnicos regulados: consultas de toxicologia, seguridad quimica, protocolos de laboratorio o analisis de incidentes, donde un modelo sobrealineado tiende a negarse. Requiere una capa de moderacion y controles de acceso propios, dado que la model card senala que los rechazos residuales se concentran en prompts de sintesis peligrosa.
- Analisis de documentos con componente visual: al conservar la torre de vision intacta, puede procesar capturas, diagramas y documentos escaneados junto con texto. El coste de computo por token es bajo en terminos relativos gracias a los 8-16B parametros activos, aunque el peso en memoria sigue dominado por los parametros totales.
- Destilacion de datos sinteticos: la ausencia de rechazos reduce el descarte de muestras al generar grandes volumenes de texto para ajustar modelos mas pequenos, con la salvedad de que los datos deben filtrarse antes de usarse.
- Despliegue on-premise con datos sensibles: la licencia MIT permite uso comercial y modificacion sin obligaciones de publicacion, y el checkpoint es descargable y autoalojable, lo que encaja en entornos que no pueden enviar datos a APIs externas.

## Benchmarks y rendimiento

El autor publica una evaluacion propia en la model card, con modo chat, decodificacion greedy y TP8 sobre H200 con expertos en FP8. No son benchmarks estandar de capacidad, sino medidas de rechazo, divergencia respecto al base y un control puntual de GSM8K.

| Metrica | Base | Identidad (suelo de ruido) | Abliterated 3.0 |
|---|---|---|---|
| Rechazos por palabra clave (X/100) | 98 | 98 | 41 |
| Rechazos reales (juez LLM) | 17 | 27 ± 10 (ruido) | 1 |
| Juez: COMPLIANT / PARTIAL | 10 / 73 | 5 / 68 | 11 / 88 |
| Divergencia KL (100 prompts inofensivos) | 0 | 0,131 | 0,142 |
| GSM8K (control de 20 problemas) | 14/20 | 15/20 | 16/20 |
| Cross-modal (danino presentado como imagen) | ~100 % esperado | — | 0/10 rechazos; 4 con matices |

El autor interpreta que la metrica por palabra clave sobrecuenta a escala 3.0, porque el detector marca terminos como `illegal`, `harmful` o `disclaimer` en respuestas que solo incluyen un aviso breve. La cifra que considera honesta es 1/100 rechazos reales segun el juez LLM. La divergencia KL de 0,142 queda practicamente en el suelo de ruido medido (0,131 en un ciclo de requantizacion identidad). El resultado de GSM8K entra dentro de la variacion entre ejecuciones del base (rango 14-17). La prueba cross-modal reporta 0/10 rechazos, con 4 respuestas matizadas. No se han publicado MMLU, HumanEval ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 510,3 GB solo para los pesos, mas espacio para el formato convertido, el tokenizador y las cachés.
- VRAM en inferencia: la model card demuestra un despliegue con paralelismo de tensor TP8 sobre 8 GPU H200 (141 GB cada una, 1.128 GB agregados) con expertos en FP8. Como referencia de orden de magnitud, el repositorio ocupa 510,3 GB, por lo que se necesita una VRAM agregada igual o superior a esa cifra segun el formato final de pesos, mas espacio para cache KV y activaciones.
- GPU recomendadas: 8x H200 en TP8 segun la configuracion validada por el autor. Configuraciones equivalentes con 8 aceleradores de 80 GB o mas (H100, A100 80 GB) requieren comprobar que la suma de memoria cubre los pesos y el estado de inferencia.
- GPU de consumo: no cabe. Ni siquiera en cuantizaciones de 4 bits (aproximadamente 380 GB solo de pesos) es viable en una RTX 4090, una RTX 5090 o cualquier GPU con menos de 24-32 GB. Se descarta el uso en equipos de sobremesa.
- Opciones de despliegue: la arquitectura `deepseek_v41` no estaba integrada en transformers ni en vLLM mainline a fecha de septiembre de 2026. El unico camino documentado es el runtime de referencia de DeepSeek, usando `convert.py` para generar un checkpoint fragmentado por TP (`--model-parallel 8 --expert-dtype fp8`) y despues `torchrun --nproc-per-node 8 inference/generate.py`. No hay soporte declarado para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se sabe que la evaluacion se ejecuto con decodificacion greedy en TP8 sobre H200.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Licencia | Rechazos reales (juez LLM) | Divergencia KL | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-abliterated | 763.205.315.794 declarados (552B de backbone segun la model card) | 8-16B | no disponible | MIT | 1/100 | 0,142 | Repositorio propio, 0 descargas |
| DeepSeek-V4.1-Flash (base) | 552B de backbone segun la model card | 8-16B | no disponible | MIT | 17/100 | 0 (referencia) | Checkpoint upstream |
| Otras variantes ablacionadas de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Las busquedas web realizadas no devolvieron informacion util sobre modelos comparables de la misma categoria, por lo que la comparativa se limita al par base/abliterado documentado en la propia model card. No hay datos publicos de MMLU, HumanEval ni otros benchmarks que permitan situar el modelo frente a alternativas de tamano similar.

## Limitaciones y advertencias

- La ablacion elimina los rechazos integrados. El autor recomienda explicitamente anadir moderacion propia de entrada y salida (por ejemplo, Llama Guard) antes de cualquier despliegue en produccion. Sin esa capa, el modelo respondera a peticiones daninas.
- El unico rechazo real residual se concentra en el prompt de sintesis mas peligroso. Aumentar la escala de ablacion los elimina, con un riesgo creciente de perdida de coherencia.
- La evaluacion de capacidades se limita a un control puntual de GSM8K en modo chat. No es una bateria completa: no hay MMLU, HumanEval, evaluaciones multilingues ni pruebas de alucinacion. No se puede asumir que no haya coste de capacidad en otras tareas.
- La divergencia KL de 0,142 se midio sobre 100 prompts inofensivos de `mlabonne/harmless_alpaca`, una muestra pequena. El suelo de ruido propio del autor (0,131) esta proximo, lo que limita la precision de la conclusion de "deriva cero".
- La metrica de rechazos por palabra clave (41/100) es enganosa segun el propio autor, porque el detector de palabras clave marca avisos legales o terminos citados dentro de respuestas que si cumplen. Quien reutilice esta cifra sin leer la interpretacion puede sacar conclusiones erroneas.
- No hay informacion sobre sesgos, idiomas soportados, longitud de contexto, riesgo de alucinacion ni comportamiento fuera del ingles en la documentacion proporcionada.
- Existe una discrepancia no resuelta entre los 763.205.315.794 parametros que declaran los safetensors y los 552B de backbone de la model card. Conviene verificar el conteo antes de planificar infraestructura.
- La arquitectura no esta en transformers ni vLLM a fecha de septiembre de 2026, lo que ata el despliegue al runtime de referencia de DeepSeek y complica la integracion en pilas estandar.
- Es una edicion de terceros, sin validacion upstream, con 0 descargas y 0 likes en el momento de redactar esta ficha. No ha pasado por un proceso de revision independiente mas alla del publicado por el propio autor.
- La licencia MIT permite uso comercial y modificacion, pero no exime de las obligaciones legales aplicables al contenido generado ni de las condiciones de uso de la plataforma que aloja el checkpoint.
- El uso de un modelo sin rechazos para generar contenido sobre sintesis quimica, biologica, radiological o nuclear es un riesgo directo. La model card reconoce que la ablacion reduce las barreras en ese tipo de peticiones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/distributedcog/DeepSeek-V4.1-Flash-abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Metodo de abliteration biproyectada que preserva la norma (grimjim, 2025): no disponible como enlace en la informacion proporcionada
- Conjuntos de evaluacion citados (`mlabonne/harmful_behaviors`, `mlabonne/harmless_alpaca`): no disponibles como enlaces en la informacion proporcionada
- Otros enlaces relevantes: no se encontraron enlaces utiles en la busqueda web realizada (los resultados devueltos fueron paginas genericas de Google, sin relacion con el modelo)
