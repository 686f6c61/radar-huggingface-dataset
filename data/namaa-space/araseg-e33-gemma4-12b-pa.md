# NAMAA-Space/araseg-e33-gemma4-12b-pa

## Resumen

`NAMAA-Space/araseg-e33-gemma4-12b-pa` es un miembro del sistema PA presentado por NAMAA a la tarea compartida Arabic Segmentation Shared Task 2026 (AraSeg, ArabicNLP 2026). Se trata de un ajuste LoRA sobre `google/gemma-4-12b` que actua como segundo miembro LLM dentro de una media de logits de tres componentes, incorporado explicitamente para aportar diversidad de arquitectura al conjunto. No es un segmentador autonomo: emite probabilidades de frontera por palabra sin calibrar.

El modelo resuelve la subtarea PA del shared task mediante clasificacion de tokens, es decir, prediciendo si existe una frontera de segmentacion entre palabras o unidades del arabe. Su relevancia es acotada y muy especifica: es una pieza reproducible del sistema que alcanzo 94,49 de macro-F1 en el conjunto de practica y 94,4 en el ciego, pero ese resultado pertenece al ensemble completo, no a este checkpoint por separado.

La entrega no es un checkpoint en formato HuggingFace, sino un `state_dict` de PyTorch (`best_PA.pt`, 0,3 GB en el repositorio). Cargarlo requiere reconstruir la arquitectura desde el YAML de configuracion del experimento y el modelo base, y el sistema completo depende de `transformers==5.12.1` para instanciar las clases base de sus miembros LoRA. La licencia es `gemma`, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivada de `google/gemma-4-12b`) con cabecera de clasificacion de tokens para segmentacion; sin detalles adicionales en la informacion disponible |
| Parametros totales | 12 000 millones (según la denominacion del modelo base `google/gemma-4-12b`; no confirmado explicitamente en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el entrenamiento LoRA se realizo en bf16 (r=16, alpha=32) |
| Idiomas soportados | arabe (`ar`) |
| Licencia | `gemma` (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` (`best_PA.pt`); no es un checkpoint en formato HuggingFace, no hay safetensors ni GGUF publicados |
| Subtarea | PA |
| Rol en el sistema | miembro de una media de logits de 3 componentes |
| Umbral del sistema | 0,25 |
| Tamano del repositorio | 0,3 GB |
| Version de transformers requerida | 5.12.1 para los cinco miembros LoRA del sistema |

## Arquitectura y entrenamiento

La informacion disponible indica que se parte de `google/gemma-4-12b` y se aplica un ajuste LoRA con rango 16, alpha 32 y precision bf16, anadiendo una cabeza de token classification para producir probabilidades de frontera por palabra. No se detallan la composicion del dataset, el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO. Tampoco se especifica si el modelo base emplea atencion lineal, decodificacion especulativa u otras innovaciones; esos datos no estan en la model card.

La innovacion metodologica declarada no esta en el modelo individual, sino en el enfoque de ensamblado: este checkpoint es el segundo miembro LLM de una media de logits de tres componentes, seleccionado para aportar diversidad de arquitectura respecto al resto. El sistema aplica un umbral comun de 0,25 sobre las probabilidades agregadas. El autor advierte que las probabilidades individuales no estan calibradas y que el modelo por si solo no reproduce ninguna puntuacion publicada; los pesos del combinador y los umbrales residen en la coleccion `NAMAA-Space/araseg-2026`.

## Capacidades

- Clasificacion de tokens para segmentacion de texto arabe: emite una probabilidad de frontera para cada palabra o unidad.
- Salida en forma de probabilidades de frontera por palabra, pensada para agregarse mediante media de logits con otros dos miembros.
- Contribucion de diversidad arquitectonica al ensemble, al ser el segundo miembro LLM del sistema PA.
- Funcionamiento con umbral de decision comun definido a nivel de sistema (0,25), no a nivel de miembro.
- Soporte multilingue: unicamente arabe (`ar`).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Segmentacion de palabras en arabe como parte de un ensemble: el modelo se integra como votante en una media de logits de tres miembros; su salida debe combinarse con los pesos del combinador y el umbral 0,25 definidos en la coleccion del sistema, nunca usarse de forma aislada.
- Preprocesamiento para pipelines de PNL en arabe: servir como etapa previa de tokenizacion o segmentacion antes de tareas posteriores como analisis morfologico, etiquetado de dependencias o analisis de sentimiento sobre texto arabe.
- Reproduccion de resultados de investigacion: permite replicar la contribucion `e33` del sistema NAMAA en AraSeg 2026 usando el codigo, las configuraciones y el mapa miembro-subtarea publicados en el repositorio de GitHub.
- Estudio de tecnicas de ensamblado sobre LLM: sirve como caso de referencia para investigar medias de logits con diversidad arquitectonica y calibracion de umbrales en tareas de etiquetado por token.
- Preparacion de corpus arabes para entrenamiento: la segmentacion resultante del sistema puede alimentar la construccion de vocabularios y tokenizadores especificos de dominio en arabe.
- Indexacion y busqueda en texto arabe: la segmentacion precisa de unidades mejora la coincidencia de terminos y la recuperacion en motores de busqueda o sistemas de recuperacion documental en arabe.
- Evaluacion de robustez de LLM en tareas morfologicas: el checkpoint facilita experimentos controlados sobre como un modelo base de 12 000 millones de parametros se adapta a una tarea secuencial de etiquetado con LoRA de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks por miembro en la informacion disponible. La unica cifra reportada corresponde al sistema PA completo, no a este modelo de forma individual.

| Metrica | Valor | Ambito |
|---|---|---|
| macro-F1 (conjunto de practica) | 94,49 | Sistema PA completo (media de logits de 3 miembros) |
| macro-F1 (conjunto ciego) | 94,4 | Sistema PA completo (media de logits de 3 miembros) |
| macro-F1 individual | no disponible | Este miembro por separado (no reproduce ninguna puntuacion publicada) |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa derivada del tamano del modelo base (12 000 millones de parametros), la carga en bf16 ronda los 24 GB de pesos, en int8 unos 12-14 GB y en int4 unos 7-8 GB, sin contar activaciones ni el coste de fusionar o aplicar los adaptadores LoRA.
- GPU recomendadas: no especificadas en la informacion disponible. Para bf16 son razonables A100 40/80 GB, H100 o L40S; en el rango consumer, RTX 3090 o RTX 4090 con 24 GB permiten bf16 muy justo o int4 con holgura.
- Cabe en GPU consumer: si, previsiblemente en tarjetas de 24 GB (RTX 3090, RTX 4090) con cuantizacion, y en tarjetas de 16 GB solo con cuantizacion de 4 bits y posible descarga de capas a CPU. No hay validacion publicada de estos escenarios.
- Opciones de despliegue: `from_pretrained` no funciona con este repositorio; es necesario descargar `best_PA.pt` con `hf_hub_download`, reconstruir la arquitectura desde el YAML del experimento y el modelo base, y cargar el `state_dict`. El repositorio de codigo incluye `ensemble.py` y `verify_offcluster.py`. No hay soporte publicado para vLLM, llama.cpp, Ollama o TGI, ni pesos GGUF.
- Requisito de version: los cinco miembros LoRA del sistema necesitan `transformers==5.12.1`; el stack completo esta fijado en `requirements-llm.txt`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se proporcionan datos de otros segmentadores arabes comparables. La comparacion se limita a las piezas del propio sistema y su modelo base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NAMAA-Space/araseg-e33-gemma4-12b-pa` | 12 000 M (base) + LoRA r=16 | no disponible | no disponible individual | `gemma` | HuggingFace, `state_dict` `.pt` |
| Sistema PA completo (`NAMAA-Space/araseg-2026`) | 3 miembros (media de logits) | no disponible | 94,49 / 94,4 macro-F1 (practica / ciego) | `gemma` | HuggingFace (coleccion con pesos del combinador y umbrales) |
| `google/gemma-4-12b` | 12 000 M | no disponible | no disponible | `gemma` | HuggingFace |
| Otros segmentadores arabes de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un segmentador autonomo: es un votante dentro de un ensemble. Usado en solitario no reproduce ninguna puntuacion publicada y sus probabilidades de frontera no estan calibradas.
- Requiere el combinador y los umbrales del sistema completo (umbral 0,25) para producir resultados validos.
- Formato de pesos no estandar: `from_pretrained` no funciona; hay que reconstruir la arquitectura y cargar manualmente el `state_dict`, lo que complica su integracion en herramientas habituales de despliegue.
- Dependencia estricta de version: el sistema necesita `transformers==5.12.1`, lo que puede entrar en conflicto con otros proyectos del mismo entorno.
- Cobertura linguistica limitada al arabe; no hay evidencia de comportamiento en otros idiomas.
- Sin datos publicados de sesgos, tasas de alucinacion, robustez ante dominio fuera de distribucion ni rendimiento por variante dialectal.
- Sin benchmarks individuales: no es posible atribuir a este miembro parte alguna del macro-F1 reportado.
- Licencia `gemma` heredada del modelo base, con los terminos de uso y la politica de usos prohibidos de Gemma; conviene revisarlos antes de cualquier uso comercial.
- Repositorio sin descargas ni interacciones registradas en el momento de la consulta, y sin pruebas externas de reproducibilidad mas alla del codigo publicado por el propio autor.
- Fechas de creacion y actualizacion del repositorio (12 de septiembre de 2026) corresponden a un lanzamiento muy reciente respecto al shared task; no hay historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e33-gemma4-12b-pa
- Coleccion del sistema AraSeg 2026 (NAMAA): https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de codigo, configuraciones y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: google/gemma-4-12b (referenciado en la model card; sin URL explicita en la informacion proporcionada)
- Cita del sistema: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026 (BibTeX incluido en la model card)
