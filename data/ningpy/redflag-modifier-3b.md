# ningpy/redflag-modifier-3b

## Resumen

`ningpy/redflag-modifier-3b` es un modelo de extracción de estructuras de texto especializado en el dominio clínico, desarrollado por el usuario `ningpy` (la model card hace referencia interna al espacio `peiyan-ning`). Se trata de un ajuste fino mediante LoRA sobre `Qwen/Qwen2.5-3B-Instruct`, con 3.085.938.688 parámetros totales, orientado a una tarea muy concreta: extraer modificadores cuantitativos y cualitativos (inicio de síntomas, temperatura, duración de convulsiones, severidad de hemorragias o quemaduras, nivel de consciencia) de notas clínicas y mensajes de pacientes en inglés de Brunei (Manglish), chino y malayo.

El modelo no es un asistente generalista, sino el módulo `modifier` de un sistema de detección de banderas rojas médicas compuesto por cinco módulos especializados (`symptom`, `context`, `modifier`, `denied` y `gate`) más un motor de reglas en Python con 59 reglas (especificación V20). La salida esperada es un objeto JSON con la clave `modifiers`.

Su relevancia actual radica en que aborda un problema poco cubierto: la extracción de información clínica estructurada a partir de texto coloquial y multilingüe del sudeste asiático, con partículas propias del Manglish (`lah`, `kah`, `meh`) y mezcla de idiomas en una misma frase. El autor reporta métricas agregadas sobre un conjunto de test independiente de 2246 casos, aunque dichas métricas corresponden al pipeline completo de cinco módulos, no a este módulo de forma aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con LoRA y fusionado |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (heredada del modelo base Qwen2.5-3B-Instruct; el valor concreto no se especifica) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos en safetensors; no se publican GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | Ingles (incluye Brunei English/Manglish), chino (zh) y malayo (ms) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 6,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder-only con normalizacion RMSNorm, RoPE y atencion por query/key/value con sesgo (QKV bias), al que se le aplica un ajuste supervisado mediante LoRA con rango 32, alpha 64 y dropout 0,05. Los modulos objetivo del adaptador son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, practicamente todas las proyecciones lineales de atencion y del MLP. El entrenamiento se realiza durante 2 epocas con tasa de aprendizaje 2e-4, scheduler coseno, warmup del 5 % y batch efectivo de 32.

El corpus de entrenamiento es multilingue (ingles, chino y malayo) e incluye de forma deliberada particulas coloquiales del Manglish. No se especifica en la informacion disponible el volumen de tokens, la composicion exacta del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO mas alla del ajuste del modelo base. Tampoco se documenta la fusion del adaptador LoRA en los pesos finales, aunque el titulo de la model card indica explicitamente "Qwen2.5-3B-Instruct + LoRA merged".

La innovacion tecnica principal no esta en la arquitectura, sino en el diseno del sistema: la especializacion en cinco modulos independientes mas un motor de reglas determinista, y el uso de un *system prompt* muy detallado con mapeos explicitos de expresiones coloquiales (por ejemplo, `kena panic attack` o `jantung deg-deg` hacia `severe_panic`, o `sawan` hacia `seizure`). El prompt ademas instruye al modelo a ignorar particulas como `lah`, `kah`, `meh`, `ah`, `leh`, `lor`, `sia` o `one`.

## Capacidades

- Extraccion de modificadores temporales: clasificacion de `onset` como `acute` o `chronic` a partir de marcadores como "suddenly", "just", "tiba-tiba" o "sudden" en contextos traumaticos.
- Extraccion numerica de fiebre: `fever_celsius` y `fever_days` cuando el texto contiene cifras explicitas ("39.5°C", "38 degrees", "40度").
- Duracion de convulsiones: `seizure_duration_min` en minutos.
- Modificadores respiratorios: `inhaler_used` e `inhaler_effective`.
- Severidad de hemorragia y quemaduras: `bleeding_severity`, `burn_severity` y `burn_location`.
- Estado de consciencia: valores como `alert`, `confused`, `drowsy` o `unresponsive`.
- Salida estructurada en JSON con el esquema `{"modifiers": {...}}`, apta para consumo programatico.
- Comprension multilingue con mezcla de codigos: ingles de Brunei, malayo y chino en la misma conversacion.
- Reconocimiento de terminologia coloquial y medica local ("kencing manis" para diabetes, "asma" para asma, "kena patuk ular" para mordedura de serpiente).
- Soporte de conversaciones multi-turno (la arquitectura base es instruct y los modulos hermanos cubren negacion en multi-turno).
- No dispone de capacidades de vision, audio ni generacion de codigo general; su funcion esta acotada a la extraccion de modificadores.

## Casos de uso

- Triaje clinico automatizado: el modulo alimenta un motor de reglas que decide si un paciente requiere atencion urgente. Su capacidad de clasificar `onset` como agudo o cronico y de leer constantes como `fever_celsius` es directamente util para priorizar casos.
- Atencion al paciente en entornos multilingues del sudeste asiatico: procesa mensajes de pacientes escritos en Manglish, malayo o chino, normalizando expresiones coloquiales a campos estructurados antes de que los consuma el sistema de triaje.
- Preprocesamiento de notas clinicas para historia electronica: convierte texto libre en un objeto JSON con campos tipados (`fever_days`, `seizure_duration_min`, `bleeding_severity`) que puede persistirse en bases de datos estructuradas.
- Deteccion de banderas rojas en llamadas de emergencia transcritas: extrae duracion de convulsiones, severidad de hemorragias y estado de consciencia, informacion critica para despacho de ambulancias.
- Monitorizacion de pacientes cronicos por chat: al integrarse en una pipeline multi-turno, permite seguir la evolucion de sintomas reportados por el propio paciente (por ejemplo, dias de fiebre, eficacia del inhalador).
- Filtrado previo de grandes volumenes de mensajes: el bajo coste de un modelo de 3,09 B permite clasificar y extraer modificadores a escala antes de derivar los casos ambiguos a un modelo mayor o a revision humana.
- Investigacion y epidemiologia: la extraccion sistematica de modificadores cuantitativos sobre corpus de mensajes permite construir series temporales de sintomas sin anotacion manual.
- Componente de un sistema de soporte a la decision clinica: combinado con los otros cuatro modulos, alimenta el motor de reglas V20 con 59 reglas para generar alertas trazables y auditables.

## Benchmarks y rendimiento

Los resultados publicados corresponden al pipeline completo de cinco modulos mas el motor de reglas V46 evaluado sobre un conjunto de test independiente de 2246 casos. No se reportan metricas aisladas del modulo `modifier`.

| Metrica | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|
| PRIMARY (any_matched x labeled_matched) | 0,902 | 0,911 | 0,906 | 91,9 % |
| STRICT matched-only | 0,893 | 0,828 | 0,859 | 91,8 % |
| STRICT m+s | 0,844 | 0,905 | 0,873 | 92,1 % |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval u otros) en la informacion disponible, ni comparaciones directas con modelos de la misma categoria en la tarea especifica de extraccion de banderas rojas.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 12,3 GB solo para pesos, mas cache KV y activaciones.
- VRAM estimada en FP16/BF16: aproximadamente 6,2 GB para pesos (coincide con el tamano del repositorio), mas cache KV.
- VRAM estimada en INT8: aproximadamente 3,1 GB para pesos, mas cache KV.
- VRAM estimada en INT4: aproximadamente 1,8-2,0 GB para pesos, mas cache KV.
- Cabe en GPU de consumo: si, en configuracion FP16 con una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super o RTX 4090 de 24 GB. En cuantizacion INT4 podria ejecutarse en GPUs de 4-6 GB, aunque no se distribuyen pesos cuantizados en el repositorio.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S, o cualquier GPU con al menos 8-12 GB para FP16 con contexto moderado.
- Opciones de despliegue: `transformers` (soporte nativo, con `device_map='auto'` y `torch_dtype=torch.float16`), Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publican en ese formato.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia, tokens por segundo ni rendimiento bajo concurrencia.

## Comparativa con modelos similares

No se dispone de comparativas publicadas por el autor frente a alternativas. La siguiente tabla contrasta los datos verificables del modelo con su modelo base y con alternativas genericas de la misma categoria de tamano; los valores de los modelos alternativos no estan confirmados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| ningpy/redflag-modifier-3b | 3,09 B | No disponible en la ficha | Apache 2.0 | Extraccion de modificadores clinicos (EN/ZH/MS) | HuggingFace |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3,09 B | No confirmado en esta ficha | Apache 2.0 | Asistente generalista e instruct | HuggingFace |
| Modelos genericos de ~3 B (otras familias) | ~3 B | No disponible | Variable | Proposito general | HuggingFace |

En la tarea concreta que cubre este modelo (extraccion de modificadores en notas clinicas multilingues del sudeste asiatico) no se conocen alternativas publicas equivalentes en la informacion disponible.

## Limitaciones y advertencias

- Las metricas reportadas (F1 0,906 en la configuracion PRIMARY) corresponden al sistema completo de cinco modulos mas motor de reglas, no al modulo `modifier` de forma aislada. No debe atribuirse ese rendimiento a este checkpoint por si solo.
- No se publica evaluacion de sesgos demograficos, etnicos o de genero. Al ser un modelo entrenado sobre textos clinicos locales, puede heredar sesgos presentes en los datos de origen.
- Riesgo de alucinacion: al generar JSON, existe la posibilidad de producir campos no solicitados, valores numericos incorrectos o unidades erroneas, especialmente si el texto de entrada es ambiguo. El autor mitiga parcialmente este riesgo con el motor de reglas y los post-procesadores (`gate_detector`, `severity_extractor`, `numeric_extractor`).
- La model card incluye el caso "Not sure about symptoms" devolviendo `{"modifiers": {}}`, lo que sugiere que el modelo puede devolver objetos vacios ante entradas fuera de distribucion.
- La cobertura de idiomas esta limitada a ingles (con variante Brunei/Manglish), chino y malayo. Otros idiomas, incluido el castellano, no estan soportados.
- Ambito de uso muy restringido: no es un modelo de proposito general y su uso fuera de la extraccion de modificadores clinicos no esta validado.
- El contenido generado por el modelo no constituye diagnostico medico. Cualquier uso en produccion sanitaria debe acompanarse de revision por personal clinico cualificado.
- Discrepancia de identificadores: la ficha de HuggingFace corresponde a `ningpy/redflag-modifier-3b`, mientras que el codigo de ejemplo y los modulos hermanos de la model card apuntan a `peiyan-ning/redflag-modifier-3b`. Conviene verificar cual es el repositorio canonico antes de integrarlo.
- El codigo de ejemplo de la model card es incorrecto en un punto: asigna `SYSTEM_PROMPT = tok.chat_template`, lo que no corresponde al *system prompt* descrito. Hay que sustituirlo manualmente por el prompt completo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base Qwen2.5-3B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas. Aun asi, debe revisarse la licencia del modelo base en su version concreta.
- El repositorio no incluye pesos en GGUF ni cuantizaciones listas para usar en CPU, lo que limita el despliegue en entornos sin GPU.
- Los metadatos indican 0 descargas y 0 "likes", asi que se trata de un modelo sin validacion comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ningpy/redflag-modifier-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del pipeline completo (motor de reglas V20, post-procesado e inferencia de ejemplo): https://git.evyd.tech/ai/redflag-detection-2.0
- Modulos hermanos citados en la model card (referenciados bajo el espacio `peiyan-ning`):
  - `peiyan-ning/redflag-symptom-3b`
  - `peiyan-ning/redflag-context-3b`
  - `peiyan-ning/redflag-modifier-3b`
  - `peiyan-ning/redflag-denied-3b`
  - `peiyan-ning/redflag-gate-3b`
- Paper o publicacion tecnica: no disponible.
- Demo publica: no disponible.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de soporte de Microsoft sin relacion con el contenido).
