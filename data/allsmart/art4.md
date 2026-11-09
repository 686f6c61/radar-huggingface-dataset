# allsmart/Art4

## Resumen

ALLSmartArt4 es un modelo de clasificación de tokens (token classification) especializado en la detección de datos personales básicos según el artículo 4.1 del RGPD: personas, organizaciones y direcciones. Lo desarrolla ALLSmart, una empresa austriaca, y se distribuye con licencia Apache 2.0. El modelo está afinado a partir de `jhu-clsp/mmBERT-base` y cuenta con 307,5 millones de parámetros, lo que lo sitúa en la categoría de modelos BERT de tamaño medio, adecuados para inferencia en CPU.

El problema que resuelve es concreto: enmascarar o pseudonimizar prompts antes de que lleguen a un modelo de lenguaje generativo, de modo que los datos personales no salgan del perímetro controlado. Forma parte de una familia de tres modelos (junto con Art4i para personas identificables sin nombre y Art9-10 para categorías especiales del RGPD) que cubren casos que un reconocedor basado solo en nombres pasa por alto.

Su relevancia actual radica en dos factores: por un lado, la presión regulatoria europea sobre el tratamiento de datos en sistemas de IA; por otro, su eficiencia, con latencias de aproximadamente 25 ms para 30 palabras y 90 ms para 250 palabras en una CPU de sobremesa, lo que permite desplegarlo en la capa de privacidad de una pasarela sin necesidad de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.532.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card recomienda ventanas solapadas para textos de más de 300 palabras) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | alemán (incluye uso austriaco y suizo), inglés |
| Licencia | Apache 2.0 (modelo base MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, concretamente un fine-tuning de `jhu-clsp/mmBERT-base`, adaptado a clasificación de tokens con múltiples etiquetas independientes mediante funciones sigmoideas: `PERSON`, `ORG` y `ADRESSE`. La elección de sigmoide en lugar de softmax permite que un mismo token pueda recibir varias etiquetas simultáneamente, lo que encaja con la naturaleza solapada de algunas entidades.

Los datos de entrenamiento consisten exclusivamente en textos inventados en alemán e inglés, creados específicamente para la tarea, abarcando múltiples tipos textuales: chats, correos electrónicos, tickets, tablas, logs, cartas y actas. No se utilizaron datos de clientes ni datos personales reales. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de clasificación de tokens). Tampoco se documentan innovaciones técnicas adicionales más allá del propio fine-tuning sobre mmBERT.

## Capacidades

- Detección de personas (`PERSON`), incluyendo nombres en minúscula en chats, iniciales, nombres en tablas, CSV y logs, y nombres que coinciden con palabras comunes.
- Detección de organizaciones (`ORG`), respetando roles, departamentos, salas e identificadores de código que no deben marcarse.
- Detección de direcciones (`ADRESSE`), incluyendo calle y número, código postal y localidad, cuando la dirección pertenece a una persona.
- Clasificación multi-etiqueta por palabra con puntuaciones de probabilidad independientes.
- Procesamiento de textos largos mediante ventanas solapadas con agregación por máximo por palabra.
- Soporte de alemán (con variantes austriaca y suiza) e inglés.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento: es un modelo exclusivamente de etiquetado.

## Casos de uso

- **Enmascaramiento de prompts antes de enviarlos a un LLM**: el modelo identifica personas, organizaciones y direcciones en el texto de entrada y las sustituye por marcadores antes de que el prompt salga hacia un proveedor externo, reduciendo la exposición de datos personales.
- **Pasarela de privacidad en producción**: integrado en la capa de privacidad de un gateway (como hace ALLSmartLLM), filtra en tiempo real cada petición con latencias de 25-90 ms en CPU, sin necesidad de GPU dedicada.
- **Pseudonimización en registros y logs**: al detectar nombres en tablas, CSV y logs (un caso que los reconocedores genéricos suelen fallar), permite anonimizar trazas de aplicación antes de almacenarlas o compartirlas con terceros.
- **Cumplimiento del RGPD en pipelines de datos**: como paso previo a tareas de análisis o entrenamiento, marca los datos personales básicos para su tratamiento diferenciado según el artículo 4.1.
- **Procesamiento de documentos largos**: con ventanas solapadas procesa actas, hilos de correo, informes y transcripciones de entrevistas de hasta 2.800 palabras, manteniendo una cobertura de personas del 94,8 % en la evaluación del autor.
- **Filtrado de correos y tickets de soporte**: detecta nombres y direcciones en comunicaciones entrantes para redactarlos antes de pasarlos a sistemas de análisis o clasificación automática.
- **Preprocesado para anonimización de datasets**: combinado con Art4i y Art9-10, cubre categorías que un reconocedor basado solo en nombres deja escapar, permitiendo construir corpus anonimizados de forma más completa.

## Benchmarks y rendimiento

| Conjunto | Métrica | ALLSmartArt4 | GLiNER (`urchade/gliner_multi-v2.1`, umbral 0,5) |
|---|---|---|---|
| Blind set (120 textos, 695 valores) | Valores encontrados | 93,8 % | 86,6 % |
| Blind set | Personas encontradas | 96,1 % | 81,3 % |
| Blind set | Precisión | 92,1 % | 85,3 % |
| Control set (890 valores, textos de negocio) | Valores encontrados | 99,9 % | no disponible |
| Control set | Precisión | 97,2 % | no disponible |
| Documentos largos (40 docs, 53.838 palabras) | Personas | 94,8 % (1.559) | no disponible |
| Documentos largos | Organizaciones | 96,3 % (163) | no disponible |
| Documentos largos | Partes de dirección | 87,8 % (74) | no disponible |
| Documentos largos | Precisión | 83,6 % | no disponible |

Un acierto cuenta cuando el tipo coincide y los spans se solapan al menos en la mitad del más corto. Los conjuntos de prueba fueron anotados de forma independiente al entrenamiento por agentes separados que nunca vieron el modelo ni sus textos de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 307,5 millones de parámetros y pesos en fp32 (repo de 1,3 GB) la inferencia cabe holgadamente en cualquier GPU consumer, y en fp16 ocuparía aproximadamente 0,6 GB.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 2 GB de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en cualquier GPU moderna; el modelo está diseñado para funcionar incluso sin GPU.
- Despliegue: compatible con `transformers` (librería indicada en la model card); el repositorio incluye `beispiel.py` como ejemplo ligero de uso con división de palabras y ventanas. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 25 ms para 30 palabras y 90 ms para 250 palabras en CPU de sobremesa (Ryzen 7 7800X3D, 8 hilos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| ALLSmartArt4 | 307,5 M | no disponible | de, en | Apache 2.0 | NER de personas, organizaciones y direcciones para privacidad |
| GLiNER (`urchade/gliner_multi-v2.1`) | no disponible | no disponible | multilingüe | no disponible | NER zero-shot genérico |
| ALLSmartArt4i | no disponible | no disponible | de, en | no disponible | Personas identificables sin nombre (misma familia) |
| ALLSmartArt9-10 | no disponible | no disponible | de, en | no disponible | Categorías especiales Art. 9 y 10 RGPD (misma familia) |

Frente a GLiNER, el modelo del autor obtiene mejores resultados en el blind set (93,8 % frente a 86,6 % en valores encontrados, 92,1 % frente a 85,3 % en precisión). No se dispone de datos comparativos con otros modelos NER especializados en privacidad.

## Limitaciones y advertencias

- Un lugar mencionado junto a una persona puede confundirse con su dirección.
- Los nombres de calle sin número pueden generar falsos positivos.
- En documentos largos la precisión cae (83,6 %) por abreviaturas de hablantes, cabeceras y firmas; el autor señala que, para enmascarar, un marcador superfluo es el error más seguro.
- Entrenado y evaluado únicamente en alemán e inglés; no cubre otros idiomas.
- No se documentan sesgos específicos, pero al entrenarse solo con textos inventados, su comportamiento en dominios muy alejados de los tipos textuales cubiertos (chats, correos, tickets, tablas, logs, cartas, actas) no está validado.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos en la detección.
- La licencia Apache 2.0 permite uso comercial; el modelo base mmBERT-base es MIT.
- Para obtener buenos resultados es necesario replicar la tokenización de entrenamiento (puntuación como palabra independiente) y usar ventanas solapadas en textos de más de 300 palabras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allsmart/Art4
- Modelo complementario Art4i: https://huggingface.co/allsmart/Art4i
- Modelo complementario Art9-10: https://huggingface.co/allsmart/Art9-10
- Sitio del desarrollador: https://allsmartllm.com
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- GLiNER (comparativa): https://huggingface.co/urchade/gliner_multi-v2.1
