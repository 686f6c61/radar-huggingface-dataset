# NAMAA-Space/araseg-e17-xlmr-nopnx-pa-s1

## Resumen

`NAMAA-Space/araseg-e17-xlmr-nopnx-pa-s1` es un modelo de segmentacion de texto arabe (text segmentation) formulado como clasificacion de tokens, desarrollado por la comunidad NAMAA para la tarea compartida Arabic Segmentation Shared Task 2026 (AraSeg, ArabicNLP 2026). Se trata de un ajuste fino completo sobre el encoder `FacebookAI/xlm-roberta-large`, entrenado especificamente para la subtarea NoPnx-PA, en la que el objetivo es predecir fronteras de palabra y morfema en texto arabe sin puntuacion (no punctuation).

Su relevancia es doble. Por un lado, aborda un problema practico de la PNL arabe: la segmentacion morfologica y de palabras es un paso previo habitual en pipelines de analisis morfosintactico, traduccion y recuperacion de informacion. Por otro, es un ejemplo de publicacion de artefactos de investigacion: el autor libera un miembro concreto de un sistema de ensemble mas grande, con la advertencia explicita de que no funciona de forma autonoma. Este checkpoint es el seed 1 del par de encoders NoPnx-PA, con peso de decodificador -0,0111 dentro de un decodificador estructural MEMM ajustado sobre predicciones out-of-fold (OOF) de 8 miembros.

Es importante subrayar que **no es un segmentador independiente ni un checkpoint en formato HuggingFace**. Se distribuye como un `state_dict` de PyTorch (`best_NoPnx_PA.pt`) que requiere reconstruir la arquitectura desde el YAML de configuracion del experimento y cargar los pesos manualmente. El sistema completo del que forma parte alcanzo 87,82 de macro-F1 en el practice test y 89,9 en el conjunto ciego de la tarea, con un umbral de sistema de 0,46.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia XLM-RoBERTa, encoder de tipo BERT) derivado de `FacebookAI/xlm-roberta-large` |
| Parametros totales | No disponible de forma explicita; la model card menciona "560M, full fine-tune" (cifra que coincide con el orden de magnitud de XLM-RoBERTa-large) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la model card no la especifica) |
| Tipos de cuantizacion | No disponible; el repositorio publica un unico `state_dict` sin versiones cuantizadas (fp16/GGUF/AWQ) |
| Idiomas soportados | Arabe (`ar`) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` (`best_NoPnx_PA.pt`); no es un checkpoint en formato HuggingFace, no hay safetensors ni GGUF |
| Tamano del repositorio | 2,2 GB |
| Tarea / pipeline | `token-classification`, segmentacion de texto arabe |
| Subtarea | NoPnx-PA |
| Rol en el sistema | Miembro (votante) de un decodificador estructural MEMM OOF sobre 8 miembros |
| Umbral del sistema | 0,46 |
| Seed | 1 (par de encoders NoPnx-PA) |
| Peso del decodificador | -0,0111 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder transformer de tipo XLM-RoBERTa-large, es decir, un modelo enmascarado multilingue preentrenado sobre corpus masivos, reutilizado aqui como extractor de representaciones a nivel de palabra. Sobre el se aplica un ajuste fino completo (`full fine-tune`) para la subtarea NoPnx-PA, con la cabeza de clasificacion de tokens adaptada a la prediccion de fronteras. La model card indica "560M" en la fila de entrenamiento, sin aclarar si la cifra se refiere a tokens de entrenamiento o al tamano del modelo ajustado; dado que XLM-RoBERTa-large se situa en ese orden de parametros, la interpretacion mas plausible es esta ultima, pero no se confirma en la informacion disponible.

El aspecto tecnico mas distintivo no esta en el modelo individual, sino en el sistema del que forma parte. NAMAA construye un **decodificador estructural MEMM ajustado sobre predicciones out-of-fold de 8 miembros**, con pesos de combinacion y umbrales calculados a nivel de sistema (umbral 0,46). Este checkpoint concreto aporta un peso de decodificador de -0,0111, un valor muy bajo en magnitud, lo que sugiere una contribucion marginal dentro del ensemble. La model card advierte de forma explicita que el modelo produce probabilidades de frontera **no calibradas** por palabra y que, usado en solitario, no reproduce ninguna puntuacion publicada.

No se documentan en la informacion disponible detalles sobre composicion del dataset, numero de tokens de entrenamiento, tecnicas de alineacion (RLHF/DPO, poco habituales en clasificacion de tokens) ni innovaciones de decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de tokens para segmentacion de texto arabe: predice fronteras de palabra a nivel de token dentro de la subtarea NoPnx-PA.
- Generacion de probabilidades de frontera por palabra, utiles como senal agregable en un ensemble.
- Procesamiento de texto arabe sin puntuacion (variante sin puntuacion de la tarea).
- Ajuste fino completo sobre XLM-RoBERTa-large, lo que le permite aprovechar representaciones multilingues preentrenadas aunque el ajuste sea monoidioma.
- No soporta tool calling ni function calling: es un modelo de clasificacion de tokens, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo "thinking", vision, audio ni capacidades multimodales.
- No es un modelo conversacional: no genera texto.
- No esta pensado para uso directo en produccion sin el resto del sistema de ensemble.

## Casos de uso

- **Preprocesado morfologico en pipelines de PNL arabe**: el modelo puede aportar probabilidades de frontera que, combinadas con los otros miembros del ensemble y el decodificador MEMM, alimenten etapas posteriores de analisis morfosintactico (POS tagging, parsing) o lematizacion.
- **Investigacion en segmentacion arabe**: sirve como punto de partida reproducible para estudiar estrategias de ensembling y decodificacion estructural sobre XLM-RoBERTa-large en la tarea AraSeg 2026.
- **Reproduccion de resultados de la tarea compartida**: junto con el resto de miembros y el codigo del repositorio `NAMAA-Org/NAMAA-Community-AraSeg-2026`, permite replicar la puntuacion del sistema (87,82 macro-F1 en practice test, 89,9 en ciego).
- **Ablacion de componentes**: al ser un miembro con peso de decodificador muy bajo (-0,0111), resulta util para medir la contribucion marginal de un encoder concreto dentro del ensemble.
- **Normalizacion de texto arabe para busqueda**: las fronteras predichas pueden usarse para indexar variantes morfologicas y mejorar la recuperacion en corpus arabes no vocalizados ni puntuados.
- **Construccion de corpus segmentados**: en proyectos de anotacion linguistica, las probabilidades del modelo pueden priorizar candidatos de segmentacion para revision humana, reduciendo el coste de anotacion.
- **Investigacion sobre calibracion**: dado que el autor advierte que las probabilidades no estan calibradas, es un caso de estudio util para tecnicas de calibracion aplicadas a clasificacion de tokens.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Macro-F1 del sistema NoPnx-PA (practice test) | 87,82 |
| Macro-F1 del sistema NoPnx-PA (conjunto ciego) | 89,9 |
| Macro-F1 de este miembro en solitario | No disponible (el autor indica que no reproduce ninguna puntuacion publicada) |

No se han publicado resultados de benchmarks individuales de este checkpoint en la informacion disponible. Las cifras anteriores corresponden al **sistema completo** de NAMAA para la subtarea NoPnx-PA, no a este modelo aislado.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,2 GB, coherente con pesos en fp32. En fp32 se necesitarian aproximadamente 2,2 GB solo para pesos, mas activaciones; en fp16 la huella de pesos bajaria a alrededor de 1,1 GB. Son estimaciones basadas en el tamano del repositorio, no datos publicados.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamano, cualquier GPU con al menos 6-8 GB de VRAM deberia ser suficiente para inferencia en fp16 con lotes pequenos; GPU de clase A100 o H100 aportarian margen para lotes grandes y decodificacion del ensemble completo.
- Compatibilidad con GPU de consumo: si, es probable que quepa en GPUs de consumo modernas (RTX 3060 12 GB en adelante) dado el tamano del checkpoint, aunque no hay validacion publicada.
- Opciones de despliegue: **no es compatible con vLLM, Ollama, TGI ni llama.cpp** en su forma actual. Requiere construir la arquitectura desde el YAML de configuracion del experimento y cargar el `state_dict` con `torch.load`, tal como se describe en la model card y en el codigo del repositorio.
- Dependencias: el sistema completo incluye cinco miembros LoRA que exigen `transformers==5.12.1` para instanciar sus clases base; el stack fijado esta en `requirements-llm.txt` del repositorio de codigo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NAMAA-Space/araseg-e17-xlmr-nopnx-pa-s1` (este) | Encoder transformer ajustado, miembro de ensemble | No confirmado ("560M" segun model card) | No disponible | MIT | Peso como `state_dict` de PyTorch, carga manual |
| Resto de miembros del ensemble NoPnx-PA de NAMAA | Mixto (incluye miembros LoRA) | No disponible | No disponible | No disponible | En la coleccion `NAMAA-Space/namaa-community-araseg-2026` |
| Segmentadores arabes clasicos (por ejemplo, herramientas de CAMeL Tools o Farasa) | Basados en reglas, estadisticos o morfologicos | No aplica | No aplica | No disponible en la informacion proporcionada | Distribuciones de software, no checkpoints |
| `aubmindlab` AraBERT y variantes | Encoder transformer arabe (BERT) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Checkpoints HuggingFace |

No se dispone de datos verificados en la informacion proporcionada para comparar rendimiento (macro-F1) de este modelo frente a alternativas de segmentacion arabe. Cualquier comparacion numerica requeriria ejecutar los sistemas sobre el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- **No es un segmentador autonomo**: la model card lo declara explicitamente. Usado en solitario no reproduce ninguna puntuacion publicada y su salida no debe interpretarse como una segmentacion final.
- **Probabilidades no calibradas**: las probabilidades de frontera por palabra no estan calibradas; si se usan como umbral directo, los resultados seran inconsistentes.
- **Formato de pesos no estandar**: `from_pretrained` no funciona. El archivo es un `state_dict` plano que exige reconstruir la arquitectura desde el YAML del experimento, lo que complica su integracion en herramientas habituales.
- **Dependencia de version**: el sistema completo requiere `transformers==5.12.1` para los miembros LoRA; alterar el stack puede romper la reproducibilidad.
- **Sesgos**: no se documentan analisis de sesgo. Al estar ajustado sobre datos de una tarea compartida concreta, hereda los sesgos de dominio y genero textual de ese corpus, no descritos en la informacion disponible.
- **Riesgo de alucinacion**: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la sobre-segmentacion o infra-segmentacion en dominios alejados del corpus de entrenamiento.
- **Cobertura idiomatica**: solo arabe (`ar`). No hay evidencia de transferencia a otras lenguas ni a variantes dialectales no representadas en el corpus.
- **Longitud de contexto**: no documentada; textos largos pueden requerir troceado, con perdida de coherencia entre fragmentos.
- **Adopcion nula**: 0 descargas y 0 "likes" en el momento de la consulta, sin validacion externa independiente.
- **Licencia**: MIT heredada del modelo base, lo que en principio permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre derechos de los datos de entrenamiento, que no se detallan.
- **Caveat para produccion**: cualquier despliegue realista debe incluir los 8 miembros, los pesos del decodificador MEMM y el umbral 0,46; este checkpoint por si solo no es un artefacto desplegable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e17-xlmr-nopnx-pa-s1
- Coleccion del sistema AraSeg 2026 de NAMAA: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de codigo, configuraciones y mapeo miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Cita del sistema: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026.
- Resultados de busqueda web: no se encontro ningun resultado relevante sobre este modelo, la tarea AraSeg 2026 o el repositorio NAMAA en las busquedas realizadas; los enlaces devueltos correspondian a paginas de ayuda de Facebook sin relacion con el contenido.
