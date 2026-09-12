# NAMAA-Space/araseg-sat-ft

## Resumen

`NAMAA-Space/araseg-sat-ft` es un modelo de segmentación de texto en árabe desarrollado por NAMAA Community para la tarea compartida Arabic Segmentation Shared Task 2026 (AraSeg, ArabicNLP 2026), en la subtarea NP, NoPnx-PA y NoPnx-NP. Se trata de un ajuste fino completo del modelo base `segment-any-text/sat-12l-sm` (SaT, Segment Any Text), que trabaja a nivel de carácter y predice fronteras entre palabras, lo que lo hace estructuralmente distinto del resto de miembros del conjunto, basados en XLM-R y en modelos de lenguaje.

El modelo no es un segmentador autónomo: es un votante dentro de un ensemble lineal ajustado con predicciones out-of-fold sobre cinco miembros. Genera probabilidades de frontera por palabra sin calibrar y, por sí solo, no reproduce ninguna puntuación publicada. El sistema completo, con los pesos del combinador y los umbrales, reside en la colección `NAMAA-Space/araseg-2026`.

Su relevancia actual es doble: por un lado, documenta una arquitectura de segmentación a nivel de carácter aplicada al árabe, un idioma con retos específicos de tokenización y escritura sin mayúsculas; por otro, sirve como ejemplo de empaquetado de un miembro de ensemble cuya carga no funciona con `from_pretrained`, sino reconstruyendo la arquitectura a partir del YAML de configuración del experimento. El sistema completo reporta 92,84 de macro-F1 en el conjunto de práctica y 91,3 en el conjunto ciego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de caracter (base `segment-any-text/sat-12l-sm`, 12 capas, variante "small"); ajuste fino completo |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen como `state_dict` de PyTorch (`best_NP.pt`), no como checkpoint cuantizado |
| Idiomas soportados | arabe (`ar`) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` en fichero `.pt` (`best_NP.pt`), no es un checkpoint en formato HuggingFace ni safetensors, pese a la etiqueta `safetensors` del repositorio |
| Tarea (pipeline) | `token-classification` (segmentacion de texto) |
| Subtarea | NP, NoPnx-PA y NoPnx-NP |
| Rol en el sistema | miembro de un apilado lineal ajustado con OOF sobre 5 miembros |
| Umbral del sistema | 0,36 |
| Tamano del repositorio | 10,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es el modelo SaT (Segment Any Text) en su variante `sat-12l-sm`, un transformer de 12 capas que opera sobre caracteres en lugar de subpalabras. Este enfoque a nivel de carácter es lo que el autor destaca como fuente de diversidad real respecto al resto del conjunto, dominado por variantes de XLM-R y por modelos de lenguaje ajustados con LoRA. El ajuste sobre `araseg-sat-ft` es un fine-tune completo (no LoRA), según indica la model card.

El entrenamiento se realizó para la tarea AraSeg 2026 en la subtarea NP, NoPnx-PA y NoPnx-NP. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (poco probables en una tarea de etiquetado a nivel de carácter). El checkpoint `PA/` no se distribuye. El modelo produce probabilidades de frontera por palabra sin calibrar, y su integración en el sistema final se realiza mediante un apilado lineal con pesos ajustados sobre predicciones out-of-fold, con umbral de decisión 0,36. La carga no es estándar: hay que descargar el `state_dict` con `hf_hub_download` y construir la arquitectura desde el YAML de configuración del experimento antes de inyectar los pesos.

## Capacidades

- Segmentación de texto árabe a nivel de carácter: predice fronteras entre unidades léxicas o de frase.
- Clasificación de tokens (`token-classification`) orientada a la detección de límites.
- Producción de probabilidades de frontera por palabra, útiles como señal blanda dentro de un combinador, aunque sin calibrar.
- Especialización monolingüe en árabe, con la diversidad arquitectónica que aporta el enfoque carácter a carácter frente a modelos basados en subpalabras.
- No soporta tool calling ni function calling: no es un modelo generativo ni un agente.
- No soporta razonamiento multi-paso ni modos de pensamiento (`thinking mode`).
- No dispone de capacidades de visión, audio ni generación de texto libre.
- No está pensado para uso individual: su salida solo es significativa combinada con los otros cuatro miembros y los pesos del combinador del sistema `araseg-2026`.

## Casos de uso

- Preprocesado de corpus árabes para pipelines de PLN: el modelo genera probabilidades de frontera que, combinadas en el ensemble, permiten dividir documentos en unidades manejables antes de tareas de etiquetado, análisis sintáctico o indexación.
- Segmentación previa a traducción automática: dividir texto árabe en segmentos coherentes reduce la fragmentación de frases largas y mejora la alineación en sistemas de traducción entrenados con pares de frases.
- Construcción de datasets de entrenamiento para otros modelos árabes: la señal de frontera a nivel de carácter sirve para anotar automáticamente corpus sin segmentación manual.
- Sistemas de resumen y recuperación de información: fragmentar documentos largos en unidades semánticas antes de generar embeddings o de alimentar un recuperador.
- Preparación de texto para síntesis de voz (TTS): la detección de límites ayuda a insertar pausas y a trocear entradas largas en unidades prosódicas razonables.
- Investigación en segmentación multilingüe: al ser un miembro a nivel de carácter dentro de un ensemble con modelos de subpalabras, permite estudiar empíricamente la complementariedad entre representaciones.
- Reproducción de resultados de la tarea compartida AraSeg 2026: con el repositorio de código y los pesos del combinador, se puede reconstruir exactamente el sistema que obtuvo 92,84 / 91,3 de macro-F1.
- Evaluación de arquitecturas SaT en árabe: sirve como punto de comparación frente a enfoques basados en XLM-R o en LLM ajustados con LoRA.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al sistema completo, no al miembro individual. El autor indica explícitamente que este modelo, por sí solo, no reproduce ninguna puntuación publicada.

| Sistema | Conjunto | Metrica | Resultado |
|---|---|---|---|
| NAMAA (ensemble completo, 5 miembros) | Practice test | macro-F1 | 92,84 |
| NAMAA (ensemble completo, 5 miembros) | Blind test | macro-F1 | 91,30 |
| `araseg-sat-ft` de forma aislada | No aplica | No publicado | No disponible |

No se han publicado resultados de benchmarks por miembro ni métricas desagregadas de este checkpoint en la información disponible.

## Requisitos de hardware

- Los pesos se distribuyen como uno o varios ficheros `state_dict` de PyTorch dentro de un repositorio de 10,0 GB, lo que condiciona el espacio en disco más que la VRAM.
- Al tratarse de un transformer de 12 capas en variante "small" que opera sobre caracteres, la inferencia es ligera en comparación con modelos de lenguaje; no obstante, el número exacto de parámetros no está disponible, por lo que las estimaciones de VRAM deben tratarse como orientativas.
- Es previsible que la inferencia quepa en GPU de consumo (RTX 3060, 4060, 4090 y similares) e incluso en CPU, dado el tamaño reducido de la arquitectura base; se recomienda validar el consumo real tras reconstruir el modelo desde el YAML.
- La GPU solo es necesaria para acelerar el procesamiento por lotes de corpus grandes; para volúmenes pequeños la ejecución en CPU es viable.
- Opciones de despliegue: no hay soporte de `from_pretrained` ni de los runners habituales (vLLM, TGI, Ollama, llama.cpp). El despliegue requiere cargar el `state_dict` manualmente y reconstruir la arquitectura, tal como se hace en `ensemble.py` y `verify_offcluster.py` del repositorio de código.
- Los cinco miembros LoRA del ensemble necesitan `transformers==5.12.1` para instanciar sus clases base; el conjunto de dependencias fijado está en `requirements-llm.txt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Puntuacion en AraSeg 2026 | Disponibilidad |
|---|---|---|---|---|---|---|
| `NAMAA-Space/araseg-sat-ft` | Transformer a nivel de caracter, fine-tune completo | no disponible | no disponible | MIT | no publicado de forma aislada (sistema: 91,3 macro-F1 en ciego) | Pesos `.pt` en HuggingFace (carga manual) |
| `segment-any-text/sat-12l-sm` | Transformer a nivel de caracter (modelo base) | no disponible | no disponible | no disponible en la informacion proporcionada | no aplica (no ajustado para arabe en este sistema) | HuggingFace |
| Miembros LoRA basados en XLM-R / LLM del mismo ensemble | Ajuste LoRA sobre modelos de subpalabras | no disponible | no disponible | no disponible | no publicado por miembro | Coleccion `NAMAA-Space/araseg-2026` |

La model card indica que el apilado combina cinco miembros y que este checkpoint recibe el peso individual más alto del conjunto NP por su diversidad arquitectónica. No se proporcionan los identificadores de los otros miembros ni sus métricas individuales.

## Limitaciones y advertencias

- No es un segmentador autónomo: es un votante dentro de un ensemble. Usado de forma aislada no reproduce ninguna puntuación publicada.
- Sus salidas son probabilidades de frontera por palabra sin calibrar. Interpretarlas directamente como decisiones binarias produce resultados incorrectos; se requiere el umbral y los pesos del combinador (umbral del sistema: 0,36).
- `from_pretrained` no funciona: el fichero es un `state_dict` sin envoltorio. Es imprescindible reconstruir la arquitectura desde el YAML de configuración del experimento antes de cargar los pesos.
- El repositorio ocupa 10,0 GB, lo que implica costes de almacenamiento y descarga considerables en relación con el tamaño aparente de la arquitectura.
- Cobertura monolingüe: solo árabe. No hay datos sobre su comportamiento en dialectos, árabe coloquial o texto con code-switching.
- Sesgos conocidos: no disponibles. Al ser un modelo discriminativo de etiquetado, el riesgo de alucinación de contenido no aplica del mismo modo que en modelos generativos, pero sí puede haber sesgos de anotación heredados del corpus de entrenamiento (por ejemplo, convenciones de segmentación específicas de una variedad o género textual).
- Restricciones de licencia: licencia MIT, heredada del modelo base, lo que permite uso comercial siempre que se conserve el aviso de copyright y la licencia. Conviene verificar las condiciones del checkpoint base `segment-any-text/sat-12l-sm` de forma independiente.
- El resto de miembros del ensemble requieren `transformers==5.12.1`; mezclar versiones puede impedir instanciar las clases base.
- La información sobre parámetros, contexto y datos de entrenamiento no está disponible, lo que dificulta estimar con precisión costes de despliegue y límites de longitud de entrada.
- Los resultados de la búsqueda web no aportaron ninguna fuente técnica relevante sobre este modelo; toda la información procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-sat-ft
- Coleccion del sistema completo: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de codigo, configuraciones y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/segment-any-text/sat-12l-sm
- Cita: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026 (BibTeX incluido en la model card)
- Fuentes adicionales: no disponible (la busqueda web no devolvio resultados relevantes)
