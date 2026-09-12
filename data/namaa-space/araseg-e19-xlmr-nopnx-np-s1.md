# NAMAA-Space/araseg-e19-xlmr-nopnx-np-s1

## Resumen

`NAMAA-Space/araseg-e19-xlmr-nopnx-np-s1` es un miembro individual del sistema **NoPnx-NP** presentado por NAMAA Community a la tarea compartida de segmentación del árabe **AraSeg 2026** (ArabicNLP 2026). No es un segmentador autónomo: se trata de un encoder afinado con `FacebookAI/xlm-roberta-large` que produce probabilidades de frontera por palabra sin calibrar, y cuyo resultado solo tiene sentido al integrarse en un *ensemble* de siete miembros gobernado por un decodificador estructural MEMM ajustado sobre predicciones *out-of-fold* (OOF). Es la semilla 1 del par de encoders NoPnx-NP.

El modelo se distribuye como un `state_dict` de PyTorch (`best_NoPnx_NP.pt`), no como checkpoint en formato HuggingFace, de modo que `from_pretrained` no funciona: hay que reconstruir la arquitectura a partir del YAML de configuración del experimento y de los pesos del modelo base antes de cargar el estado. El repositorio ocupa 2,2 GB, coherente con un modelo de aproximadamente 560 millones de parámetros almacenado en precisión completa.

Su relevancia es fundamentalmente metodológica y de reproducibilidad: documenta públicamente un componente de un sistema que obtuvo 86,49 de macro-F1 en el *practice test* y 87,0 en el conjunto ciego de la tarea, con umbral de decisión del sistema fijado en 0,34. Para quien investigue segmentación árabe o arquitecturas de *ensemble* sobre encoders multilingües, es una pieza auditable más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa (hereda la de `FacebookAI/xlm-roberta-large`); cabecera de token-classification para fronteras de palabra |
| Parametros totales | Aproximadamente 560M (el model card indica «560M, full fine-tune», sin aclarar si la cifra se refiere a parametros o a tokens de entrenamiento) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens, heredada de `FacebookAI/xlm-roberta-large` (no confirmada de forma explicita en el model card) |
| Tipos de cuantizacion | No disponible; solo se publica un `state_dict` de PyTorch en precision completa |
| Idiomas soportados | Arabe (`ar`) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | `state_dict` de PyTorch (`best_NoPnx_NP.pt`); no es safetensors, GGUF ni un checkpoint en formato HuggingFace |

## Arquitectura y entrenamiento

La arquitectura de partida es XLM-RoBERTa-large, un transformer encoder con normalización pre-LN, 24 capas, dimensión oculta 1024, 16 cabezas de atención y vocabulario SentencePiece de 250.000 tokens. Sobre esa base se añade una cabeza de clasificación de tokens que puntúa cada palabra por su probabilidad de constituir una frontera. El ajuste fue completo (*full fine-tune*), no mediante adaptadores, según se indica en el model card.

El modelo se entrenó para el subtask NoPnx-NP, que aborda la segmentación estructural sin puntuación, del sistema AraSeg 2026. Su función dentro del pipeline es la de un votante: las probabilidades por palabra que emite se combinan con las de otros seis miembros mediante un decodificador estructural MEMM ajustado sobre predicciones OOF, con un umbral de sistema de 0,34. El model card advierte de forma explícita que este miembro por sí solo no reproduce ninguna puntuación publicada. No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF o DPO (en una tarea de etiquetado secuencial no serían de esperar). Los cinco miembros basados en LoRA del mismo sistema requieren `transformers==5.12.1`; la pila completa está fijada en `requirements-llm.txt` del repositorio de código.

## Capacidades

- Segmentación de texto árabe a nivel de frontera de palabra, dentro del subtask NoPnx-NP.
- Clasificación de tokens con salida de probabilidad por palabra (no calibrada).
- Etiquetado en contexto multilingüe potencial: el encoder base XLM-RoBERTa-large está preentrenado en 100 idiomas, aunque el ajuste está especializado únicamente en árabe y no se declaran capacidades en otras lenguas.
- Integración como componente de *ensemble* mediante combinación de probabilidades y decodificador MEMM.
- No dispone de *tool calling*, *function calling*, modo de razonamiento, capacidades agénticas, visión ni audio.
- No es un modelo generativo: no produce texto libre.
- No se documenta soporte de *prompting* ni de instrucciones en lenguaje natural.

## Casos de uso

- Segmentación de corpus árabes para preprocesado de NLP: el modelo marca fronteras de palabra en texto sin puntuación, un paso previo habitual en *pipelines* de análisis morfológico, POS tagging o parsing del árabe. Debe emplearse como parte del sistema completo, no de forma aislada.
- Reconstrucción de límites en transcripciones y subtítulos sin puntuación: útil para alinear audio transcrito con unidades léxicas antes de aplicar un tokenizador.
- Investigación en *ensembles* sobre encoders: sirve como ejemplo reproducible de miembro OOF con pesos y umbrales publicados, útil para estudiar técnicas de combinación y decodificación estructural.
- Reproducción de resultados de tareas compartidas: junto con el repositorio de código y el resto de miembros de la colección AraSeg 2026, permite replicar el sistema que alcanzó 86,49 / 87,0 de macro-F1.
- Evaluación de calibración de probabilidades: al distribuir salidas sin calibrar de un miembro individual, es un caso de estudio para medir el efecto de la calibración en sistemas de etiquetado secuencial.
- Extracción de vocabulario y estadísticas léxicas: la segmentación resultante facilita el recuento de tipos y ocurrencias en corpus árabes no vocalizados.
- Docencia y experimentación académica: su tamaño y licencia permisiva permiten usarlo en cursos sobre NLP árabe y sobre arquitecturas basadas en transformers.

## Benchmarks y rendimiento

La información disponible solo reporta la puntuación del **sistema completo**, no la de este miembro aislado:

| Metrica | Valor | Ambito |
|---|---|---|
| Macro-F1 (practice test) | 86,49 | Sistema NoPnx-NP completo (7 miembros + decodificador MEMM) |
| Macro-F1 (blind) | 87,0 | Sistema NoPnx-NP completo (7 miembros + decodificador MEMM) |

No se han publicado resultados de benchmarks por miembro individual (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni son aplicables a una tarea de etiquetado secuencial.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en FP32 (2,24 GB de pesos más activaciones), alrededor de 1,5 GB en FP16 y en torno a 0,8 GB en INT8 si se cuantiza manualmente. Estas cifras son estimaciones a partir del tamaño del repositorio, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para inferencia en FP32; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas sin problema.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo modernas, incluso en FP32.
- Ajuste fino completo: requiere bastantes más recursos que la inferencia; con 560M parámetros y AdamW en FP32 se necesitan del orden de 8-10 GB, y más si se aumenta el tamaño de lote. No hay cifras confirmadas en la información disponible.
- Opciones de despliegue: no es compatible con `AutoModel.from_pretrained` ni con cargadores estándar; hay que reconstruir la arquitectura desde el YAML del experimento y cargar el `state_dict` con `torch.load`. vLLM, TGI, llama.cpp y Ollama no aplican, ya que no se publican pesos en GGUF ni safetensors. El despliegue realista es mediante un script propio o el código del repositorio `NAMAA-ORG/NAMAA-Community-AraSeg-2026`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros miembros del *ensemble* ni de otras participaciones en AraSeg 2026 en la información proporcionada, por lo que no es posible una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NAMAA-Space/araseg-e19-xlmr-nopnx-np-s1` | ~560M | 512 tokens | Miembro de un sistema con 86,49 / 87,0 macro-F1 | MIT | HuggingFace (state_dict) |
| `FacebookAI/xlm-roberta-large` (modelo base) | ~560M | 512 tokens | No disponible para este subtask (sin ajuste) | MIT | HuggingFace |
| Otros miembros de la coleccion AraSeg 2026 de NAMAA | No disponible | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- No es un segmentador autónomo: usado en solitario no reproduce ninguna puntuación publicada, tal como advierte el propio model card.
- Las probabilidades de frontera que emite están sin calibrar; requieren el combinador y el umbral (0,34) del sistema completo.
- `from_pretrained` no funciona. El archivo es un `state_dict` desnudo y exige reconstruir primero la arquitectura desde el YAML del experimento y el modelo base.
- Los cinco miembros LoRA del mismo sistema necesitan `transformers==5.12.1`; mezclar versiones puede impedir la instanciación de las clases base.
- Cobertura lingüística limitada al árabe pese al preentrenamiento multilingüe del encoder base; no se declaran capacidades en otras lenguas.
- No hay información publicada sobre sesgos, comportamiento ante dominios distintos (dialectos, árabe coloquial, texto histórico) ni tasas de error por tipo de documento.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí existe riesgo de fronteras espurias en texto ruidoso, sin puntuación o con code-switching, al no haber validación fuera del dominio de la tarea.
- El repositorio presenta 0 descargas y 0 *likes* en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.
- Restricciones de licencia: licencia MIT, heredada del modelo base, lo que permite uso comercial; conviene aun así revisar las condiciones del modelo base `FacebookAI/xlm-roberta-large`.
- La fecha de creación declarada (2026-09-12) es posterior a la fecha de publicación de la tarea; verifíquese la vigencia de los artefactos antes de integrarlos en un sistema en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e19-xlmr-nopnx-np-s1
- Colección del sistema AraSeg 2026 de NAMAA: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de código, configuraciones y mapa miembro-subtask: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Cita del sistema: NAMAA Community, «NAMAA at Arabic Segmentation Shared Task 2026», Proceedings of ArabicNLP 2026
