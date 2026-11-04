# scar-ai/vera-core

## Resumen

vera-core es un modelo de decisión no autorregresivo desarrollado por scar-ai, diseñado para resolver tareas de clasificación y selección tipada sobre un estado de entrada. A diferencia de los modelos generativos convencionales, no produce texto libre: recibe un estado (correo, ticket, JSON, documento) junto con una pregunta y un menú de opciones tipadas, y devuelve la opción seleccionada acompañada de una probabilidad calibrada en un único forward pass. Esto elimina el parseo de salidas y reduce drásticamente el riesgo de alucinación, ya que el espacio de respuestas está acotado por las opciones proporcionadas.

El modelo se construye a partir del backbone textual de Qwen3.5-2B (licencia Apache-2.0), al que se le añade una cabeza de decisión específica y se somete a un fine-tuning completo sobre datos de decisión. Cuenta con aproximadamente 1.900 millones de parámetros, una ventana de contexto de 8.192 tokens y está etiquetado como modelo "System 1", en alusión a su carácter rápido e intuitivo frente a los modelos de razonamiento pausado. Su formato de comunicación es compatible con la interfaz `POST /v1/systemone` del sistema Jev.

La relevancia actual de vera-core radica en su enfoque: en lugar de competir en generación de texto, se posiciona como una capa de decisión rápida y calibrada para pipelines de agentes, enrutamiento y verificación. No obstante, el autor ha marcado el repositorio como discontinuado en favor de `scar-ai/vera-core-2`, lo que conviene tener en cuenta para despliegues nuevos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo con cabeza de decisión (derivado de Qwen3.5-2B) |
| Parámetros totales | 1.904.074.821 (~1,9 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (8K) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería pytorch, requiere `custom_code`) |

## Arquitectura y entrenamiento

vera-core parte del backbone textual de Qwen3.5-2B y le incorpora una cabeza de decisión diseñada específicamente para puntuar las opciones de una pregunta en un solo forward pass. El modelo lee conjuntamente la pregunta, el menú de opciones y el estado de entrada, y emite una distribución de probabilidad sobre las opciones sin generar texto. Todo el stack (backbone más cabeza) se somete a un fine-tuning completo sobre datos de decisión, lo que lo convierte en un modelo especializado en clasificación tipada más que en generación.

El modelo se presenta como una base generalista pensada para ser reentrenada con datos del dominio del usuario. El autor indica explícitamente que el fine-tuning sobre decisiones propias mejora el ajuste a las etiquetas, la formulación y la calibración respecto a la base generalista. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal es el propio paradigma no autorregresivo con salida tipada y calibrada, junto con la compatibilidad de formato con el sistema Jev.

## Capacidades

- Clasificación de texto y selección de opciones tipadas sobre un estado de entrada, con probabilidades calibradas.
- Enrutamiento y triaje: asignación de tickets, correos o peticiones a equipos, colas o prioridades.
- Clasificación de intención y tema sobre un conjunto de etiquetas definido por el usuario.
- Selección de herramientas o funciones para agentes (tool selection).
- Verificación de políticas y cumplimiento normativo.
- Puntuación ordinal (urgencia, sentimiento, riesgo) con distribución de probabilidad completa.
- Verificación de hechos y afirmaciones contra un documento.
- Evaluación y ranking de respuestas candidatas.
- Flujos con umbral de confianza: actuación automática cuando la probabilidad es alta y derivación a un modelo más lento o a un humano cuando no lo es.
- No genera texto libre, por lo que no requiere parseo de salida.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket y un menú de equipos o colas, el modelo devuelve el destino con una probabilidad calibrada que permite decidir si se enruta automáticamente o se escala a un humano.
- Triaje de correo entrante: clasificación de mensajes por prioridad e intención usando el conjunto de etiquetas propio de la organización, con umbral de confianza para la derivación.
- Selección de herramientas en agentes: dado el estado de la conversación y el catálogo de APIs disponibles, el modelo elige la siguiente función a invocar sin generar texto que haya que interpretar.
- Verificación de cumplimiento: comprobación de si un caso o documento cumple o incumple una regla concreta, aprovechando la ventana de 8K tokens para incluir políticas extensas.
- Puntuación de riesgo o urgencia: asignación de una severidad ordinal con distribución de probabilidad completa, útil para priorizar colas de trabajo.
- Verificación de afirmaciones: contraste de una declaración contra un documento de referencia dentro del contexto de 8K tokens.
- Evaluación de respuestas en pipelines de RLHF o QA: comparación de respuestas candidatas y selección de la mejor, con probabilidad asociada.
- Flujos con compuerta de confianza: automatización de decisiones de alta confianza y derivación del resto a un modelo de razonamiento o a revisión humana, reduciendo coste y latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Precisión en porcentaje sobre JevBench; ECE más bajo es mejor.

| Modelo | Parámetros | easy | original | hard | overall | ECE (overall) |
|---|---|---|---|---|---|---|
| vera-core (este repo) | ~2B | 100 | 93,1 | 58,6 | 77,9 | 0,098 |
| vera-spark | ~630M | 100 | 83,3 | 46,0 | 68,8 | 0,141 |
| Jev (referencia) | no disponible | 100 | 99 | 74,1 | no disponible | no disponible |
| Laya (leaderboard público, no ejecutado por el autor) | 421M | 94 | 73 | 34 | no disponible | no disponible |
| Julia-1 (ejecución del autor) | 144M | 75,0 | 47,2 | 35,1 | 47,2 | no disponible |
| reflex-s1 (ejecución del autor, perfil rápido) | 23M/83M | 81,2 | 45,8 | 39,6 | 50,2 | no disponible |

Métricas adicionales declaradas por el autor: ECE de 0,098 en el conjunto completo (231 ítems agrupados, 10 bins); Brier de 0,007 / 0,089 / 0,589. Latencia mediana por pregunta en GPU (MI300X, batch de uno): 41-44 ms. Sobre decisiones held-out (3.600 ítems, descontaminados): 81,4.

Resultados por familia (aciertos / total):

| Split | Familia | Resultado | Familia | Resultado |
|---|---|---|---|---|
| easy | extraction | 12/12 | intent | 12/12 |
| easy | fact | 12/12 | tool_selection | 12/12 |
| original | extraction | 12/12 | ordinal | 12/12 |
| original | intent | 12/12 | routing | 12/12 |
| original | policy | 10/12 | adequacy | 9/12 |
| hard | adversarial | 6/6 | routing_hard | 5/5 |
| hard | multi_hop | 12/18 | judge_hard | 10/17 |
| hard | trap | 5/8 | probability | 5/10 |
| hard | tradeoff | 4/6 | long_policy | 8/19 |
| hard | ambiguous | 4/7 | temporal_numeric | 6/15 |

## Requisitos de hardware

- Pesos en precisión original: 3,8 GB según la model card (el repositorio completo ocupa 22,9 GB, probablemente por artefactos adicionales).
- VRAM estimada para inferencia: no disponible de forma explícita; con ~1,9 B de parámetros, en fp16 rondaría los 4 GB de pesos más overhead de activaciones y contexto, y en cuantizaciones de 8 o 4 bits sería inferior.
- GPU recomendadas: el autor reporta latencia en AMD MI300X (41-44 ms por pregunta, batch de uno). No se especifican otras GPU.
- GPU de consumo: no se confirma oficialmente; por tamaño de pesos, es plausible en GPUs de consumo con suficiente VRAM, pero no está verificado en la información disponible.
- Despliegue: paquete `vera-s1` (Python 3.10 o superior); extra `vera-s1[fast]` para la ruta GPU más rápida. Compatible con el formato de comunicación `POST /v1/systemone` de Jev. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: en CPU, varios segundos por petición según el autor; en GPU (MI300X), 41-44 ms de mediana por pregunta en batch de uno.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench overall | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vera-core | ~2B | 8K | 77,9 | Apache-2.0 | HuggingFace (discontinuado en favor de vera-core-2) |
| vera-spark | ~630M | no disponible | 68,8 | no disponible en la información | HuggingFace |
| Jev (referencia) | no disponible | no disponible | no disponible (easy 100, original 99, hard 74,1) | no disponible | no disponible |
| Laya | 421M | no disponible | no disponible (easy 94, original 73, hard 34) | no disponible | leaderboard público |
| Julia-1 | 144M | no disponible | 47,2 | no disponible | no disponible |
| reflex-s1 | 23M/83M | no disponible | 50,2 | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint publicado no está ajustado para agentes de navegador o de uso de computador; el autor recomienda fine-tuning sobre trazas propias antes de usarlo en esos escenarios.
- El modelo solo soporta inglés, lo que limita su uso en entornos en castellano sin reentrenamiento o adaptación.
- Al ser una base generalista, el rendimiento zero-shot en dominios específicos puede ser inferior al de un modelo afinado con datos propios; el autor lo presenta explícitamente como punto de partida.
- El repositorio está marcado como discontinuado; el autor redirige a `scar-ai/vera-core-2`. Para despliegues nuevos conviene evaluar la versión sucesora.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El rendimiento cae notablemente en el split hard (58,6 % de precisión), especialmente en familias como long_policy (8/19), temporal_numeric (6/15) y probability (5/10), lo que indica dificultades con políticas extensas, razonamiento numérico-temporal y estimación de probabilidades.
- La calibración, aunque razonable (ECE 0,098), no es perfecta; en flujos con compuerta de confianza conviene validar los umbrales sobre datos propios.
- No se detallan sesgos conocidos ni composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- El modelo requiere `custom_code` para cargarse, lo que añade dependencia del paquete `vera-s1` y de su mantenimiento.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3.5-2B conviene revisar las condiciones de la licencia del modelo base (también Apache-2.0 según la información disponible).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scar-ai/vera-core
- Versión sucesora: https://huggingface.co/scar-ai/vera-core-2
- Modelo compacto relacionado: https://huggingface.co/scar-ai/vera-spark
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
