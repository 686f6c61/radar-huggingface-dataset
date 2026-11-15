# fab7hq/sense-xs

## Resumen

sense-xs es un modelo de clasificación zero-shot desarrollado por fab7hq que sirve como motor de decisión del agente Weft, un sistema que se ejecuta localmente en la máquina del usuario. Se construye sobre `microsoft/deberta-v3-xsmall`, un transformer encoder de tipo DeBERTa-v3 con aproximadamente 22 millones de parámetros, que se congela tras un ajuste inicial de entailment y se especializa mediante adaptadores LoRA independientes para cada tarea de decisión. El modelo se distribuye en formato ONNX con cuantización int8, lo que permite ejecución en CPU sin GPU dedicada.

El modelo no es un generador de texto ni un LLM conversacional: es un clasificador de pares texto-pregunta que emite un único logit (probabilidad de "sí" menos "no") para cada fila de entrada. Cada fila se codifica como `[CLS] texto [SEP] pregunta [SEP]` con una longitud máxima de 256 tokens. Los adaptadores cubren dos dominios: `state`, que interpreta el estado de un agente en una terminal (pantalla, entradas de transcripción y fin de turno), y `ask`, que clasifica peticiones según tarea, efectos, ruta y reglas de práctica.

Su relevancia actual reside en que demuestra un patrón de despliegue de clasificación zero-shot completamente local, con latencias de decenas o cientos de milisegundos en CPU, licencia Apache 2.0 y un tamaño de repositorio de 0,1 GB. Es un caso de uso de adaptadores LoRA sobre un encoder pequeño para tareas de enrutamiento y decisión en agentes, sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (base: `microsoft/deberta-v3-xsmall`) con adaptadores LoRA |
| Parametros totales | Aproximadamente 22 millones en el modelo base (dato no confirmado explícitamente en la informacion; el adaptador tiene aproximadamente 1,5 millones de números) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`L` ≤ 256) |
| Tipos de cuantizacion | int8 con escalas fijas (`sense-xs.int8.onnx`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`sense-xs.int8.onnx`), adaptadores ONNX (`state.onnx_adapter`, `ask.onnx_adapter`), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base es `microsoft/deberta-v3-xsmall`, un encoder DeBERTa-v3 de pequeño tamaño. Según la model card, primero se entrenó para entailment (NLI) sobre los pares etiquetados por humanos y comercialmente usables de `MoritzLaurer/dataset_train_nli`, y después se congeló. Sobre esa base congelada se entrenan adaptadores LoRA de rango 16 en cada capa lineal del encoder, más una cabeza de clasificación propia por adaptador; cada adaptador contiene aproximadamente 1,5 millones de parámetros. Cada adaptador se entrenó durante 3 épocas en una única GPU.

Los datos de entrenamiento varían por adaptador. El adaptador `state` se entrenó con pantallas y transcripciones de sesiones de harness en sandbox sobre modelos locales, etiquetadas por reglas y revisadas por lectores y un revisor. El adaptador `ask` se entrenó con peticiones escritas para cada regla de los packs de práctica de Fab7, sus casos de uso y near misses, además de peticiones reales de uso propio; dos modelos frontera etiquetaron cada ejemplo a través de sus coding harnesses y un revisor resolvió los desacuerdos. Las preguntas, la calibración y la normalización de texto son datos en `manifest.json` (esquema `fab7.sense.xs/1`, normalizador `fab7.sense.decision.normalize/2`).

La innovación técnica principal es el uso de un encoder congelado con múltiples adaptadores LoRA intercambiables en tiempo de ejecución mediante ONNX Runtime (`LoraAdapter` y `RunOptions.add_active_adapter`), con cuantización int8 y escalas fijas para que cada fila produzca su propia respuesta (requiere `session.disable_quant_qdq = 1`). El repositorio incluye `golden_vectors.jsonl` con textos normalizados, token ids, logits y respuestas para validar implementaciones del runtime.

## Capacidades

- Clasificación zero-shot de pares texto-pregunta mediante un logit único (sí menos no).
- Adaptador `state` para pantalla: clasifica el estado de un agente en 7 estados (idle, working, tras su Stop hook, esperando permiso, esperando pregunta, esperando confianza o inicio de sesión, o detenido por error) a partir únicamente de la pantalla.
- Adaptador `state` para entradas de transcripción: distingue mensaje de la persona, respuesta del agente, paso de herramienta exitoso o fallido, y texto interno.
- Adaptador `state` para fin de turno: determina si la respuesta del agente plantea una pregunta a la persona.
- Adaptador `ask` para tarea, efectos (lectura, escritura, ejecución, más allá de la máquina) y ruta (directa, plan, objetivo, revisión).
- Adaptador `ask` para reglas de práctica: cada regla se evalúa con su propio texto como pregunta, y el uso pasado de una regla puede ajustar su probabilidad con un peso definido en `manifest.json`.
- Adaptador `ask` para plan: determina si la petición continúa, implementa o modifica un plan.
- Ejecución local sin salida de datos de la máquina.
- No soporta tool calling, agentes multi-paso, generación de texto, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de peticiones en agentes locales: el adaptador `ask` clasifica cada petición según tarea, efectos y ruta, lo que permite decidir si una acción es de lectura, escritura o ejecución antes de despacharla, con una latencia de aproximadamente 195 ms en CPU para 17 filas.
- Monitorización del estado de un agente en terminal: el adaptador `state` lee la pantalla y clasifica el estado en 7 categorías con una precisión de 0,966, lo que permite a un orquestador saber si el agente está trabajando, esperando permiso o detenido por error sin depender de hooks del harness.
- Detección de preguntas al usuario: el adaptador de fin de turno (average precision 0,953) identifica si la respuesta del agente requiere intervención humana, útil para pausar flujos automáticos y solicitar confirmación.
- Clasificación de entradas de transcripción: distingue mensajes del usuario, respuestas del agente, pasos de herramienta exitosos o fallidos y texto interno (accuracy 0,991), lo que permite construir registros estructurados de sesiones de agente.
- Aplicación de reglas de práctica en asistentes de código: el adaptador `ask` evalúa cada regla con su propio texto como pregunta y ajusta la probabilidad según su historial de aceptación, con mean average precision de 0,946 en desarrollo de software, 0,893 en trading autónomo y 0,873 en machine learning.
- Gestión de planes en agentes multi-paso: la clasificación de si una petición continúa, implementa o modifica un plan (accuracy 0,961) permite a un orquestador decidir el siguiente paso sin un LLM generativo.
- Filtrado y etiquetado local de datos sensibles: al ejecutarse íntegramente en la máquina con ONNX Runtime en CPU, es adecuado para clasificar texto que no puede salir del entorno, con un coste de aproximadamente 76 ms por lectura de pantalla de 7 filas.

## Benchmarks y rendimiento

Resultados publicados en la model card (versión 0.0.1, split de test, textos no vistos en entrenamiento):

| Adaptador | Cabeza | Métrica | Valor |
|---|---|---|---|
| `state` | Screen | accuracy (2.204 pantallas) | 0,966 |
| `state` | Transcript entry | accuracy (947) | 0,991 |
| `state` | Turn end | average precision (53) | 0,953 |
| `ask` | Task | micro F1 a 0,5 (1.000 peticiones) | 0,896 |
| `ask` | Effects | micro F1 a 0,5 | 0,984 |
| `ask` | Route | accuracy | 0,961 |
| `ask` | Practice rules | mean average precision (desarrollo de software) | 0,946 |
| `ask` | Practice rules | mean average precision (trading autónomo) | 0,893 |
| `ask` | Practice rules | mean average precision (machine learning) | 0,873 |

Según la model card, el adaptador `state` obtiene puntuaciones dentro del ruido de un fine-tune completo del mismo modelo sobre los mismos datos. El adaptador `ask` también, en tarea, efectos y ruta, y queda aproximadamente 0,03 por debajo de un fine-tune completo en ranking de reglas en trading y machine learning.

Latencias en CPU sobre un Mac con Apple Silicon: lectura de pantalla (7 filas) aproximadamente 76 ms; tarea, efectos y ruta de una petición (17 filas) aproximadamente 195 ms; pack de 20 reglas aproximadamente 300 ms.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de uso previsto; el modelo se ejecuta en CPU con ONNX Runtime 1.20 o posterior. El repositorio ocupa 0,1 GB.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU. Cualquier GPU compatible con ONNX Runtime podría usarse, pero no hay datos publicados de rendimiento en GPU.
- Compatibilidad con GPU de consumo: no hay datos publicados; por tamaño (modelo base de tipo xsmall cuantizado a int8) cabría en cualquier GPU de consumo, pero no se ha documentado.
- Opciones de despliegue: ONNX Runtime 1.20 o posterior, cargando cada adaptador con `LoraAdapter` y activándolo con `RunOptions.add_active_adapter`; requiere `session.disable_quant_qdq = 1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato y tarea).
- Latencia y throughput: en CPU Apple Silicon, aproximadamente 76 ms para 7 filas, 195 ms para 17 filas y 300 ms para un pack de 20 reglas. No se publican cifras de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada. La model card únicamente compara el modelo con un fine-tune completo del mismo `microsoft/deberta-v3-xsmall` sobre los mismos datos, sin nombrar otros modelos de clasificación zero-shot comparables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sense-xs (este modelo) | Base tipo xsmall (aprox. 22 M) + adaptadores de aprox. 1,5 M | 256 tokens | Apache 2.0 | ONNX int8 + adaptadores | Clasificación zero-shot local en CPU |
| Fine-tune completo de `microsoft/deberta-v3-xsmall` | Aprox. 22 M | No disponible | No disponible | No disponible | Referencia interna de la model card; el adaptador `state` queda dentro del ruido y el `ask` queda aprox. 0,03 por debajo en ranking de reglas |
| Otros clasificadores zero-shot | No disponible | No disponible | No disponible | No disponible | No se han publicado comparativas en la información disponible |

## Limitaciones y advertencias

- El modelo es un clasificador binario por fila (logit sí menos no), no un generador: no puede producir texto, código ni razonamiento multi-paso.
- Longitud máxima de entrada de 256 tokens; textos más largos deben truncarse o dividirse, lo que puede degradar la clasificación.
- Los idiomas soportados no están declarados; el tokenizer es el de DeBERTa-v3 y los datos de entrenamiento parecen centrados en inglés, pero no se confirma.
- El adaptador `ask` queda aproximadamente 0,03 por debajo de un fine-tune completo en ranking de reglas en los dominios de trading y machine learning.
- Los benchmarks de `turn end` se basan en solo 53 ejemplos, lo que limita la fiabilidad de la métrica de average precision.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en entradas fuera de distribución; el modelo está entrenado sobre datos de sesiones y peticiones de Fab7, lo que puede introducir sesgo hacia ese dominio.
- No se documentan sesgos conocidos ni evaluaciones de robustez fuera del split de test del autor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `microsoft/deberta-v3-xsmall` tiene su propia licencia (no detallada en la información disponible) que conviene verificar.
- Para producción se requiere ONNX Runtime 1.20 o posterior, cargar los adaptadores una vez y activarlos por ejecución, además de `session.disable_quant_qdq = 1`; una configuración incorrecta puede mezclar respuestas entre filas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-11-15) es futura respecto a la información habitual, lo que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fab7hq/sense-xs
- Repositorio de Weft: https://github.com/fab7hq/weft
- Modelo base: https://huggingface.co/microsoft/deberta-v3-xsmall
- Dataset de entrenamiento NLI: https://huggingface.co/datasets/MoritzLaurer/dataset_train_nli
