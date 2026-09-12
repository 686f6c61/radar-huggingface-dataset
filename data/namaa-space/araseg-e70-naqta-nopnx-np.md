# NAMAA-Space/araseg-e70-naqta-nopnx-np

## Resumen

`NAMAA-Space/araseg-e70-naqta-nopnx-np` es un miembro individual del sistema **NoPnx-NP** presentado por NAMAA Community a la tarea compartida *Arabic Segmentation Shared Task 2026* (AraSeg, ArabicNLP 2026). Se trata de un modelo de segmentacion de texto arabe formulado como clasificacion de tokens (`token-classification`): asigna a cada palabra una probabilidad de frontera, que despues se consume en un decodificador estructural MEMM ajustado con predicciones *out-of-fold* sobre siete miembros.

El modelo parte de `MostafaMaroof/Naqta` y se ha sometido a un ajuste fino completo (*full fine-tune*) de 560 millones de parametros, conservando unicamente el encoder y sustituyendo la cabeza por una nueva. La inicializacion es *punctuation-aware*, es decir, condicionada por informacion de puntuacion. El sistema completo obtuvo 86,49 de macro-F1 en el *practice test* y 87,0 en el conjunto ciego, con una mejora medida de +0,60 F1 (IC 95 % [+0,19, +1,01]) respecto a la referencia sin este miembro.

Es relevante ahora porque documenta un patron habitual en competiciones de NLP: artefactos de investigacion publicados como pesos intermedios de un ensemble, no como modelos desplegables. El propio autor advierte que **no es un segmentador autonomo** y que, usado en solitario, no reproduce ninguna puntuacion publicada. Su repo ocupa 2,2 GB y acumula 0 descargas y 0 *likes*, por lo que carece de validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo encoder (solo encoder, con cabeza nueva de clasificacion de tokens) |
| Parametros totales | 560 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como `state_dict` de PyTorch en `best_NoPnx_NP.pt`) |
| Idiomas soportados | arabe (`ar`) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` (`.pt`); no es un checkpoint en formato HuggingFace |
| Tarea | Segmentacion de texto arabe / `token-classification`, subtares NoPnx-NP |
| Modelo base | `MostafaMaroof/Naqta` |
| Rol en el sistema | Miembro votante de un decodificador estructural MEMM ajustado con OOF sobre 7 miembros |
| Umbral del sistema | 0,34 |
| Tamano del repositorio | 2,2 GB |
| Fecha de publicacion | 2026-09-12 (ultima actualizacion 2026-09-12) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un transformer de solo encoder de 560 millones de parametros, inicializado desde `MostafaMaroof/Naqta` y sometido a un *full fine-tune* en el que se descarta la cabeza original y se entrena una nueva especifica de segmentacion de tokens. La inicializacion se describe como *punctuation-aware*, una innovacion orientada a aprovechar senales de puntuacion en la delimitacion de fronteras. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento; estos datos no estan disponibles.

El elemento tecnico diferencial no esta en el modelo individual, sino en el sistema que lo engloba: un decodificador estructural MEMM ajustado con predicciones *out-of-fold* sobre siete miembros, con pesos de combinacion y umbral (0,34) custodiados fuera de este repositorio. Cada miembro emite probabilidades de frontera por palabra sin calibrar. Los cinco miembros basados en LoRA del sistema requieren `transformers==5.12.1` para instanciar sus clases base; la pila completa esta fijada en `requirements-llm.txt` del repositorio de codigo.

## Capacidades

- Segmentacion de texto arabe a nivel de palabra mediante etiquetado de tokens y salida de probabilidades de frontera.
- Inicializacion sensible a puntuacion, pensada para explotar ese rasgo en la delimitacion de segmentos.
- Ajuste fino completo sobre el modelo base, con cabeza nueva especifica para la tarea.
- Participacion como votante dentro de un ensemble con decodificacion estructural MEMM.
- Produccion de probabilidades por palabra que pueden combinarse con otros miembros y umbralizarse.
- Soporte de *tool calling*: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible (es un clasificador, no un modelo generativo).
- Capacidades multilingues: no; unicamente arabe.
- Capacidades especiales (modo *thinking*, vision, audio): no disponibles.

## Casos de uso

- **Preprocesamiento de pipelines de NLP arabe**: la segmentacion de palabras es un paso previo habitual en analisis morfologico, lematizacion y etiquetado gramatical. Este miembro aporta probabilidades de frontera que, combinadas en el ensemble, alimentan la etapa siguiente del pipeline.
- **Investigacion en segmentacion morfologica**: reproducible desde el repositorio de codigo, sirve como punto de partida para quien quiera replicar o mejorar el sistema NoPnx-NP y como referencia metodologica de decodificacion MEMM sobre votantes.
- **Indexacion y recuperacion de informacion en corpora arabes**: segmentar correctamente permite construir indices de terminos mas cercanos a la unidad morfologica y mejorar la coincidencia en buscadores sobre texto arabe.
- **Analisis de corpus dialectales y redes sociales**: el texto arabe informal presenta una segmentacion ambigua; un votante entrenado para delimitar fronteras ayuda a normalizar el corpus antes de analisis estadistico o tematico.
- **Evaluacion comparativa de segmentadores**: al ser un artefacto con umbral y pesos documentados fuera del repo, resulta util como linea base reproducible en *benchmarks* internos de segmentacion, siempre que se disponga del combinador completo.
- **Anotacion asistida en proyectos linguisticos**: las probabilidades por palabra permiten priorizar candidatos de frontera para que un anotador humano revise solo los casos dudosos, reduciendo coste de etiquetado.
- **Investigacion sobre ensembles y calibracion**: es un caso de estudio de pesos sin calibrar y de como un decodificador estructural corrige la salida de siete miembros individuales.

Nota importante: en todos los casos anteriores, este repositorio por si solo **no** es suficiente. Se requieren los pesos del combinador y los umbrales del sistema `NAMAA-Space/araseg-2026`, alojados aparte.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al **sistema completo**, no a este miembro. El modelo individual no cuenta con puntuacion propia reproducida.

| Evaluacion | Ambito | Macro-F1 |
|---|---|---|
| Practice test | Sistema NoPnx-NP (7 miembros + MEMM) | 86,49 |
| Conjunto ciego (*blind*) | Sistema NoPnx-NP (7 miembros + MEMM) | 87,0 |
| Ganancia atribuida a este miembro | Sistema, con IC 95 % [+0,19, +1,01] | +0,60 F1 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) para este modelo en la informacion disponible; ademas, ese tipo de pruebas no aplica a un segmentador de tokens.

## Requisitos de hardware

- **VRAM estimada para los pesos**: en FP32, aproximadamente 2,2 GB (coincide con el tamano del repositorio); en FP16, en torno a 1,1 GB; en INT8, alrededor de 0,6 GB. Son estimaciones derivadas de los 560 millones de parametros, no cifras publicadas.
- **VRAM total con activaciones**: del orden de 4 a 6 GB en FP32 para lotes pequenos, en funcion de la longitud de secuencia, que no esta documentada.
- **GPU recomendadas**: cualquier GPU con al menos 6 GB de memoria; cabe con holgura en RTX 3060, RTX 4060, RTX 4090, A100 y H100. Tambien es viable en CPU para lotes reducidos.
- **Cabe en GPU de consumo**: si, en practicamente cualquier GPU de gama media o superior lanzada en los ultimos anos.
- **Opciones de despliegue**: no se puede cargar con `from_pretrained`; al ser un `state_dict` puro de PyTorch, no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI. El despliegue exige reconstruir la arquitectura desde el YAML de configuracion del experimento y el modelo base, y cargar los pesos manualmente con `torch.load`.
- **Latencia y throughput estimados**: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento, contexto o licencia de segmentadores arabes alternativos, por lo que no es posible establecer una comparacion cuantitativa rigurosa. La tabla siguiente recoge unicamente lo que se puede afirmar con la informacion disponible.

| Modelo | Tipo | Parametros | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NAMAA-Space/araseg-e70-naqta-nopnx-np` | Miembro de ensemble (encoder, token-classification) | 560 M | no disponible en solitario | MIT | Pesos `state_dict` en HuggingFace |
| `MostafaMaroof/Naqta` | Modelo base | no disponible | no disponible | no disponible | HuggingFace |
| Sistema `NAMAA-Space/araseg-2026` | Ensemble de 7 miembros + MEMM | no disponible | 86,49 (practice test) / 87,0 (ciego) | no disponible | Coleccion HuggingFace y repositorio de codigo |

Otros segmentadores arabes de referencia (herramientas morfologicas tipo Farasa o CAMeL Tools) no aparecen en la informacion disponible; sus cifras comparativas quedan como no disponibles.

## Limitaciones y advertencias

- **No es un modelo autonomo**: el autor indica explicitamente que es un votante dentro de un ensemble y que, usado en solitario, no reproduce ninguna puntuacion publicada.
- **Probabilidades sin calibrar**: la salida por palabra requiere el combinador y el umbral (0,34) del sistema completo para convertirse en segmentacion util.
- **Carga no estandar**: `from_pretrained` no funciona; el archivo `best_NoPnx_NP.pt` es un `state_dict` desnudo y necesita reconstruir la arquitectura desde la configuracion del experimento.
- **Dependencias fijadas**: el sistema requiere versiones concretas de librerias; los cinco miembros LoRA necesitan `transformers==5.12.1`. Reproducir el sistema sin respetar el *pinning* puede fallar.
- **Idioma unico**: solo arabe. No hay capacidades multilingues ni transferencia a otras lenguas documentada.
- **Riesgo de alucinacion**: no aplica en el sentido generativo, pero si existe riesgo de fronteras de segmentacion incorrectas, especialmente en texto informal, dialectal o sin puntuacion.
- **Sesgos**: no se documenta ninguna evaluacion de sesgos ni analisis de errores por variedad dialectal o dominio.
- **Licencia**: MIT, heredada del modelo base. Permite uso comercial, pero conviene verificar las condiciones del modelo base `MostafaMaroof/Naqta` y las de los pesos del combinador alojados en otro repositorio.
- **Sin validacion comunitaria**: 0 descargas y 0 *likes* en la fecha de actualizacion; no hay evidencia de uso independiente ni de replicacion externa.
- **Contexto y limites de entrada**: la longitud de contexto no esta documentada, por lo que no se puede garantizar el comportamiento con documentos largos.
- **Fechas del registro**: el modelo esta fechado en 2026, coherente con su participacion en ArabicNLP 2026; verificar la vigencia de los enlaces y de las versiones de librerias indicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e70-naqta-nopnx-np
- Modelo base: https://huggingface.co/MostafaMaroof/Naqta
- Coleccion del sistema AraSeg 2026 de NAMAA: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Codigo, configuraciones y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Cita del sistema: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026.
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
