# arizakml/conversation-steering-vectors

## Resumen

`arizakml/conversation-steering-vectors` es un artefacto de investigación que contiene seis vectores de activación extraídos del modelo `CohereLabs/tiny-aya-global`. No es un modelo entrenado ni un checkpoint: el repositorio almacena únicamente un fichero `steering.safetensors` de 49.600 bytes con cinco direcciones de comportamiento y una dirección de condición, además de los ficheros de procedencia (`steering.json`, `w02-readouts.json`) generados por la herramienta SafeTune CAST. El autor es Muhammad Ariz Muhammad Akmal, con asistencia declarada de IA.

El objetivo del artefacto es explorar el *activation steering* aplicado a la seguridad conversacional: modificar el comportamiento del modelo base en tiempo de inferencia desplazando sus estados ocultos a lo largo de direcciones aprendidas, sin reentrenar pesos. Los vectores se extrajeron sobre la revisión gateada `af89d219b53ed9b13b8a4645f9c8028973510324` de Tiny Aya Global, con una fuerza de comportamiento de 0,0625 aplicada en los bloques 16 a 20.

La relevancia es metodológica más que práctica: el propio autor informa de que la replicación sobre 128 familias falló ambos criterios de superioridad registrados (U harm 33/128 frente a fitted B 28/128 y deployed B 33/128), y W03H no encontró ventaja principal medida por pares. El artefacto se publica como material de investigación reproducible, sin recomendación de despliegue ni garantía de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (vectores de activación sobre el transformer de Tiny Aya Global) |
| Parametros totales | No disponible (el repositorio no contiene pesos; el modelo base es `CohereLabs/tiny-aya-global`) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica (el artefacto son tensores de dirección, no pesos cuantizables) |
| Idiomas soportados | en |
| Licencia | `scoped-research-artifact-terms` (términos de artefacto de investigación acotados; ver `LICENSE.md`) |
| Formato de pesos | `safetensors` (`steering.safetensors`, 49.600 bytes) más JSON de configuración |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo: extrae direcciones de activación mediante SafeTune CAST sobre Tiny Aya Global. Se generan seis vectores, cinco de comportamiento y uno de condición. La fuerza de comportamiento es de 0,0625 en los bloques 16 a 20. La lectura B toma el último token serializado en el bloque de condición 27, mientras que U promedia los estados ocultos en los puntos finales de contenido de los mensajes de usuario. Los umbrales evaluados son U 0,12, B ajustado 0,21 y B desplegado 0,3700000000000012.

El proceso de evaluación se apoya en etiquetas de comportamiento generadas solo para el asistente, sin validación humana. La replicación sobre 128 familias autoradas falló los dos criterios de superioridad registrados: U harm 33/128 frente a fitted B 28/128 y deployed B 33/128. El análisis W03H no halló ventaja principal medida por pares y sí misses compartidos en la compuerta de daño observada. No se documentan datos de entrenamiento en tokens, composición de dataset ni fases de RLHF o DPO, porque no existe entrenamiento de pesos en este repositorio.

## Capacidades

- Extracción y aplicación de direcciones de activación para *steering* de comportamiento en tiempo de inferencia.
- Cinco direcciones de comportamiento y una dirección de condición serializadas en un único fichero `safetensors`.
- Registro de procedencia de tensores y configuración en `steering.json`.
- Registro de ajustes de compuerta congelados en `w02-readouts.json`.
- Análisis en CPU de los vectores sin necesidad de descargar el modelo base ni instalar dependencias de inferencia.
- Reproducibilidad de la extracción condicionada a acceso autorizado a la revisión gateada de Tiny Aya Global y a un entorno compatible.
- No incluye tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un artefacto de vectores, no un modelo generativo desplegable.

## Casos de uso

- Investigación en *activation steering*: servir como referencia reproducible de extracción de direcciones con SafeTune CAST sobre un modelo pequeño, permitiendo a otros grupos replicar el pipeline y comparar metodologías.
- Auditoría de compuertas de seguridad: los ficheros `w02-readouts.json` y `steering.json` permiten inspeccionar umbrales y ajustes congelados para estudiar por qué una compuerta de daño produce misses compartidos.
- Análisis estático en CPU: el visor estático publicado en Hugging Face Spaces permite examinar los vectores y los resultados sin descargar el modelo base ni ejecutar inferencia.
- Docencia y formación: ilustrar la diferencia entre un adaptador entrenado y un vector de activación, usando un artefacto de 49.600 bytes como ejemplo mínimo de *steering*.
- Replicación de resultados negativos: el fallo documentado de los criterios de superioridad sirve como caso de estudio sobre preregistro, métricas pareadas y validación de etiquetas automáticas.
- Base para experimentos comparativos: investigadores que trabajen con Tiny Aya Global pueden usar estos vectores como línea base de *steering* frente a sus propios métodos, siempre que dispongan de acceso autorizado al modelo upstream.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| U harm (replicación 128 familias) | 33/128 |
| Fitted B harm | 28/128 |
| Deployed B harm | 33/128 |
| Criterios de superioridad registrados | Fallidos ambos |
| W03H ventaja principal por pares | No medida |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el artefacto no es un modelo evaluable de forma convencional.

## Requisitos de hardware

- VRAM para inspección de vectores: no requiere GPU; los 49.600 bytes de `steering.safetensors` y los JSON asociados se procesan en CPU.
- VRAM para replicar la extracción o la inferencia: depende enteramente de `CohereLabs/tiny-aya-global`, cuyo tamaño de parámetros no está disponible en la información proporcionada.
- GPU recomendadas: no disponible para el artefacto; para el modelo base habría que consultar su model card.
- Cabe en GPU de consumo: el artefacto sí; el modelo base, no disponible.
- Opciones de despliegue: no aplica al artefacto (no hay pesos ni tokenizador). La reproducción requiere el entorno compatible con SafeTune CAST y acceso autorizado a la revisión gateada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Base | Licencia | Pesos incluidos |
|---|---|---|---|---|
| `arizakml/conversation-steering-vectors` | Vectores de activación (6) | `CohereLabs/tiny-aya-global` | `scoped-research-artifact-terms` | No |
| Adaptadores LoRA típicos | Pesos de bajo rango | Variable | Variable | Sí |
| Checkpoints fusionados | Modelo completo | Variable | Variable | Sí |

No se dispone de información sobre otros artefactos de *steering* comparables en la documentación proporcionada; la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- No es un modelo: no contiene adaptador, checkpoint fusionado, pesos ni tokenizador; no puede ejecutar inferencia por sí mismo.
- El autor declara explícitamente que la replicación falló ambos criterios de superioridad registrados y que no hay recomendación de despliegue ni garantía de seguridad.
- Las etiquetas de comportamiento son solo para el asistente y no han pasado validación humana, lo que limita la fiabilidad de las métricas de daño.
- W03H no encontró ventaja principal medida por pares y se observaron misses compartidos en la compuerta de daño.
- La licencia `scoped-research-artifact-terms` excluye los vectores de una concesión MIT o CC BY sin cualificar; el uso comercial queda sujeto a los términos upstream de Cohere CC BY-NC y su Acceptable Use Policy.
- La reproducción requiere acceso autorizado a la revisión gateada de Tiny Aya Global y un entorno compatible con SafeTune CAST; SafeTune y AuditKIT mantienen sus términos LSAL v1.2 fijados.
- Idioma limitado a inglés (`en`) según los metadatos.
- Riesgo de que terceros interpreten el artefacto como producto de seguridad avalado; el autor lo desmiente de forma explícita.

## Enlaces

- [Hugging Face: arizakml/conversation-steering-vectors](https://huggingface.co/arizakml/conversation-steering-vectors)
- [Artículo de investigación y código fuente](https://github.com/Kendikane1/conversation-safety-steering/blob/main/ARTICLE.md)
- [Dataset de evidencia](https://huggingface.co/datasets/arizakml/conversation-steering-evidence)
- [Visor estático (Space)](https://huggingface.co/spaces/arizakml/conversation-steering-steering)
- [Colección de artefactos de modelo](https://huggingface.co/collections/arizakml/conversation-steering-models)
- [Modelo base: CohereLabs/tiny-aya-global](https://huggingface.co/CohereLabs/tiny-aya-global)
- [Licencia Cohere Labs CC BY-NC](https://cohere.com/cohere-labs-cc-by-nc-license)
- [Acceptable Use Policy de Cohere Labs](https://docs.cohere.com/docs/cohere-labs-acceptable-use-policy)
