# NAMAA-Space/araseg-e18-xlmr-nopnx-pa-s2

## Resumen

`NAMAA-Space/araseg-e18-xlmr-nopnx-pa-s2` es un modelo de segmentacion de texto arabe (text-segmentation) formulado como clasificacion de tokens (token-classification), desarrollado por NAMAA Community para la tarea compartida Arabic Segmentation Shared Task 2026 (AraSeg, ArabicNLP 2026). Se construye mediante un fine-tune completo de `FacebookAI/xlm-roberta-large` (560 millones de parametros, encoder transformer) y predice, para cada palabra, una probabilidad de frontera de segmentacion.

El punto clave para evaluarlo correctamente es que no es un segmentador autonomo: es el miembro `e18` (semilla 2 del par de encoders NoPnx-PA, con peso de decodificador -0,0365) de un ensemble de 8 miembros combinados por un decodificador estructural MEMM ajustado con predicciones out-of-fold y un umbral de sistema de 0,46. Sus salidas son probabilidades por palabra sin calibrar; usadas en solitario no reproducen ninguna puntuacion publicada.

El sistema completo alcanza 87,82 macro-F1 en el practice test y 89,9 macro-F1 en el blind test de la tarea, y se distribuye con licencia MIT heredada del modelo base. Su relevancia practica esta en ser una pieza reproducible (codigo, configuraciones y mapa miembro-subtarea publicados) de un sistema de segmentacion arabe de alto rendimiento, no en su uso directo como checkpoint independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de clasificacion de tokens para etiquetado de fronteras de segmentacion |
| Parametros totales | 560 millones (arquitectura XLM-RoBERTa-large); la model card indica "Training: 560M, full fine-tune" |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones del modelo base XLM-RoBERTa-large); no se especifica en la model card |
| Tipos de cuantizacion | no disponible; se distribuye un `state_dict` en precision completa (`best_NoPnx_PA.pt`, repositorio de 2,2 GB), sin versiones cuantizadas publicadas |
| Idiomas soportados | arabe (`ar`), unico idioma declarado |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` (`.pt`); no es un checkpoint en formato HuggingFace, no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer XLM-RoBERTa-large afinado de forma completa para clasificacion de tokens, con una cabeza que emite probabilidades de frontera de segmentacion por palabra. La tarea objetivo es NoPnx-PA (segmentacion sin puntuacion, presumiblemente con algun esquema de anotacion PA), y este checkpoint corresponde a la semilla 2 del par de encoders de ese subtask, con peso de decodificador -0,0365 dentro de la combinacion.

El entrenamiento declarado es un full fine-tune sobre el modelo base. No se detallan en la model card el numero de tokens de entrenamiento ni la composicion del dataset, el uso de RLHF/DPO (inhabitual y poco aplicable en un modelo discriminativo de etiquetado) ni otras innovaciones. La innovacion tecnica del sistema reside en el decodificador: un MEMM estructural ajustado sobre predicciones out-of-fold que combina 8 miembros con umbral 0,46. Cinco de los miembros del ensemble son adaptadores LoRA y requieren `transformers==5.12.1` para instanciar sus clases base; el stack completo esta fijado en `requirements-llm.txt` del repositorio de codigo.

## Capacidades

- Etiquetado de tokens para segmentacion de texto arabe: emite probabilidades de frontera por palabra.
- Aporta un voto individual dentro de un ensemble combinado por un decodificador MEMM con umbral 0,46.
- No genera texto: es un modelo discriminativo, no un modelo de lenguaje generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue: no declarada; el modelo esta etiquetado exclusivamente para arabe, aunque el backbone XLM-RoBERTa-large sea multilingue.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Segmentacion de texto arabe en produccion como parte del sistema NoPnx-PA: el miembro se carga junto al resto del ensemble y al decodificador MEMM para producir segmentaciones finales; usarlo aislado no es valido.
- Preprocesado de pipelines de PNL arabe: las fronteras de segmentacion alimentan etapas posteriores de analisis morfologico, lematizacion, POS tagging o analisis sintactico.
- Indexacion y busqueda en arabe: segmentar antes de indexar mejora la coincidencia de terminos en motores de recuperacion cuando la morfologia es rica y aglutinante.
- Normalizacion de corpus para entrenamiento de modelos arabes: el etiquetado por palabra permite generar versiones segmentadas de corpus de forma consistente y reproducible.
- Evaluacion comparativa de segmentadores: sirve como miembro de referencia en reproducir la puntuacion del sistema frente a otros participantes de AraSeg 2026.
- Investigacion en decodificacion estructural: el par encoder y el decodificador MEMM son un caso de estudio para combinar modelos con pesos aprendidos out-of-fold.
- Experimentos de ablacion: al existir 8 miembros y un mapa miembro-subtarea publicado, se pueden medir contribuciones individuales sobre el sistema completo.
- Extraccion de caracteristicas por palabra: las probabilidades sin calibrar pueden usarse como features para un modelo de segmentacion posterior.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden al sistema completo, no a este miembro por separado.

| Metrica | Resultado | Ambito |
|---|---|---|
| macro-F1 (practice test) | 87,82 | sistema NoPnx-PA completo (8 miembros + decodificador MEMM), no este checkpoint aislado |
| macro-F1 (blind test) | 89,9 | sistema NoPnx-PA completo (8 miembros + decodificador MEMM), no este checkpoint aislado |
| Umbral del sistema | 0,46 | aplicado por el combinador del sistema |
| Peso del decodificador de este miembro | -0,0365 | valor del peso asignado en la combinacion |

No se han publicado resultados de benchmarks por miembro individual en la informacion disponible.

## Requisitos de hardware

- Peso en precision completa: aproximadamente 2,2 GB (coincide con el tamano del repositorio: 560 M parametros en fp32).
- Peso en fp16/bf16: aproximadamente 1,1 GB si se convierte manualmente.
- VRAM estimada para inferencia: del orden de 1,5 a 2,5 GB en fp16 y de 2,5 a 4 GB en fp32 para lotes pequenos a 512 tokens, incluyendo activaciones.
- Cabe en GPU de consumo: si, incluidas RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090 y GPUs con 6-8 GB de VRAM.
- GPU de centro de datos: A100, H100 o L40S son suficientes pero sobredimensionadas para un encoder de 560 M; resultan utiles solo para evaluacion por lotes a gran escala.
- Despliegue: no es compatible directamente con vLLM, TGI, Ollama ni llama.cpp, porque no se publica un checkpoint en formato HuggingFace ni GGUF. La carga exige construir la arquitectura desde el YAML de configuracion de la experimentacion y el modelo base, y despues inyectar el `state_dict`; haria falta exportar manualmente a formato HF para usar los runners estandar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NAMAA-Space/araseg-e18-xlmr-nopnx-pa-s2` (este) | 560 M | 512 | no publica metrica individual; el sistema completo logra 87,82 / 89,9 macro-F1 | MIT | `state_dict` `.pt`, sin `from_pretrained` |
| Resto de miembros del ensemble NoPnx-PA | no disponible | no disponible | no disponible por miembro | MIT | coleccion `NAMAA-Space` (incluye 5 miembros LoRA) |
| `FacebookAI/xlm-roberta-large` (modelo base) | 560 M | 512 | sin fine-tune para segmentacion arabe; resultados en la tarea no disponibles | MIT | safetensors, compatible con `from_pretrained` |
| Segmentadores morfologicos clasicos arabe (por ejemplo CAMeL Tools o Farasa) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | herramientas independientes, no checkpoints de este ensemble |

No se dispone de comparaciones numericas contra otros sistemas participantes en AraSeg 2026 en la informacion proporcionada.

## Limitaciones y advertencias

- No es un segmentador autonomo: produce probabilidades de frontera sin calibrar y, usado solo, no reproduce ninguna puntuacion publicada. Requiere el combinador y los umbrales del sistema.
- `from_pretrained` no funciona: el fichero es un `state_dict` desnudo; hay que reconstruir la arquitectura desde el YAML de configuracion y cargar los pesos manualmente.
- Dependencia de version: los cinco miembros LoRA del ensemble necesitan `transformers==5.12.1` para instanciar sus clases base; fuera de ese stack fijado la reproduccion puede fallar.
- Idioma: cobertura declarada unicamente para arabe; no hay evidencia publicada sobre variedades dialectales ni sobre mezcla de codigos.
- Longitud: 512 tokens de entrada como maximo, lo que obliga a trocear documentos largos y puede degradar la coherencia de las fronteras en los cortes.
- Riesgo de error en fronteras: al ser un modelo discriminativo, los errores se manifiestan como segmentaciones incorrectas, no como alucinaciones de texto; no hay estimacion publicada de la varianza por miembro.
- Sesgos: no se documentan analisis de sesgo; el comportamiento dependera de la distribucion del corpus de la tarea, no descrito en la model card.
- Licencia: MIT heredada del modelo base, lo que permite uso comercial; conviene verificar igualmente las condiciones de los datos de entrenamiento, no detalladas.
- Advertencia practica: no integrar este checkpoint en produccion sin desplegar tambien el decodificador MEMM; un uso aislado invalida cualquier expectativa de rendimiento.
- Trazabilidad: el repositorio declara 0 descargas y 0 likes, sin validacion externa independiente en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e18-xlmr-nopnx-pa-s2
- Coleccion del sistema AraSeg 2026 de NAMAA: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de codigo, configuraciones y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Cita del sistema: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026.
- Otros enlaces: no se han encontrado enlaces relevantes en la busqueda web; los resultados devueltos no guardan relacion con este modelo.
