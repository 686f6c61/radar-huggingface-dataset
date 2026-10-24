# Khakimbek/orbitel-uz-v8

## Resumen

Orbitel-uz-v8 es un adaptador LoRA publicado por el usuario Khakimbek en HuggingFace, obtenido mediante fine-tuning supervisado (SFT) sobre el modelo base `unsloth/Phi-4-mini-instruct-unsloth-bnb-4bit`. No se trata por tanto de un modelo completo, sino de un conjunto de pesos diferenciales (0,4 GB en el repositorio) que deben cargarse junto al modelo base o fusionarse con él antes de su uso en inferencia. La librería declarada es PEFT y el pipeline es `text-generation`.

El modelo subyacente es Phi-4-mini-instruct de Microsoft, un transformer decoder-only de aproximadamente 3.800 millones de parámetros con una ventana de contexto declarada de 128.000 tokens. El sufijo "uz" del identificador sugiere un ajuste orientado al uzbeko y el sufijo "v8" indica que se trata de la octava iteración de una serie, aunque la model card no confirma ni el idioma ni el propósito.

La relevancia de esta ficha es limitada pero concreta: documenta un adaptador de bajo coste computacional que puede ejecutarse en GPU de consumo y que resulta útil como ejemplo de pipeline Unsloth + TRL + PEFT para adaptar un modelo compacto a un idioma de bajos recursos. La model card está prácticamente vacía (plantilla sin rellenar), por lo que la mayor parte de los datos de entrenamiento, evaluación y licencia figuran como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Phi-4-mini-instruct); rango, alpha y módulos objetivo no disponibles |
| Parámetros totales | Modelo base: ~3.800 millones. Adaptador: no disponible el número exacto; el repositorio ocupa 0,4 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens según las especificaciones del modelo base; no verificado para el adaptador ajustado |
| Tipos de cuantización | El adaptador se distribuye en safetensors sin cuantizar; el base de entrenamiento está en bnb-4bit. No hay versiones GGUF, AWQ o GPTQ publicadas por el autor |
| Idiomas soportados | No disponible. El sufijo "uz" del identificador sugiere uzbeko, sin confirmación en la model card |
| Licencia | No disponible en la model card. El modelo base (Phi-4-mini-instruct) se publica bajo licencia MIT |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con las librerías Unsloth y TRL sobre una instantánea del modelo base cuantizada en 4 bits (`bnb-4bit`), un patrón habitual para reducir el consumo de VRAM durante el ajuste. La arquitectura efectiva en inferencia es la de Phi-4-mini-instruct: un transformer decoder-only denso de ~3,8B parámetros, con tokenizador de vocabulario amplio y ventana de contexto de 128.000 tokens. El adaptador añade matrices de bajo rango sobre determinadas capas, pero la model card no especifica rango, alpha, capas objetivo ni el número de parámetros entrenables.

No hay información publicada sobre el conjunto de datos, el número de tokens de entrenamiento, la composición del corpus, la existencia de fases de RLHF o DPO, ni los hiperparámetros del SFT (tasa de aprendizaje, épocas, batch efectivo, precisión mixta). Tampoco se documenta ninguna innovación técnica propia del adaptador más allá del uso de Unsloth para el entrenamiento eficiente en memoria. Cualquier afirmación sobre el proceso de ajuste más allá de lo indicado sería especulativa.

## Capacidades

- Generación de texto conversacional en el formato instruct del modelo base, incluyendo respuestas multi-turno.
- Razonamiento y matemáticas básicas heredadas de Phi-4-mini-instruct; el nivel real tras el ajuste no está evaluado.
- Generación de código y comprensión de instrucciones técnicas, capacidad propia del modelo base y potencialmente alterada por el fine-tuning.
- Soporte de tool calling y function calling en el modelo base; no se ha verificado que el adaptador lo preserve.
- Capacidad de razonamiento multi-paso y uso en pipelines de agentes, sujeta a la misma reserva anterior.
- Multilingüismo: el modelo base cubre varias decenas de idiomas; el adaptador parece orientado al uzbeko, pero no hay declaración explícita ni evaluación.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistente conversacional en uzbeko: el adaptador puede desplegarse sobre Phi-4-mini para atender consultas en ese idioma con un coste de inferencia bajo, adecuado para prototipos y entornos con GPU modesta. Requiere validación previa, dado que no hay evaluación publicada.
- Traducción y adaptación de contenido: generación y reescritura de textos entre uzbeko y otros idiomas usando la ventana de 128K tokens del modelo base para procesar documentos completos por bloques.
- Atención al cliente de bajo volumen: conversaciones multi-turno con contexto medio gestionadas en una única GPU de consumo, sin necesidad de infraestructura de servidor dedicada.
- Base para nuevos ajustes: al ser un adaptador LoRA sobre un modelo abierto, sirve como punto de partida para experimentos de especialización en dominios concretos (legal, sanitario, administración pública) con presupuesto reducido.
- Investigación en idiomas de bajos recursos: útil como referencia metodológica para comparar estrategias de SFT con Unsloth sobre modelos compactos frente a modelos mayores.
- Generación asistida en pipelines de datos: creación de borradores, resúmenes y normalización de texto en lote, aprovechando el tamaño reducido del modelo para ejecución en paralelo.
- Despliegue en el borde o en entornos con recursos limitados: el modelo fusionado en 4 bits ocupa del orden de 2-3 GB, lo que permite ejecución en portátiles con GPU discreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluación alguna (MMLU, HumanEval, GSM8K ni métricas específicas de uzbeko), y tampoco se aportan comparaciones con el modelo base ni con la iteración anterior de la serie.

## Requisitos de hardware

- Adaptador LoRA: 0,4 GB en disco; requiere cargar el modelo base para inferencia.
- Modelo fusionado en fp16/bf16: aproximadamente 7,6 GB de pesos (estimación a 2 bytes por parámetro); con overhead de activaciones y caché KV, se recomienda un mínimo de 10-12 GB de VRAM para contextos moderados.
- Modelo fusionado en 4 bits: aproximadamente 2,2-2,5 GB de pesos; viable con 6-8 GB de VRAM en contextos cortos.
- Contexto largo: la caché KV crece de forma lineal con la longitud; con 128.000 tokens la demanda de memoria puede superar holgadamente la de los pesos, y no se dispone de cifras oficiales del modelo base para ese escenario.
- GPU de consumo: sí cabe. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 son suficientes para el modelo en 4 bits y, en el caso de las de 16 GB o más, para fp16 con contexto moderado. En GPU de 8 GB conviene usar cuantización de 4 bits.
- GPU de servidor: A100 40/80 GB, H100 y L40S para servir con lotes grandes o contexto muy largo.
- Opciones de despliegue: vLLM y TGI para el modelo fusionado en safetensors; llama.cpp y Ollama tras fusionar el adaptador y convertir a GGUF; SGLang como alternativa. El adaptador por sí solo debe cargarse con PEFT sobre transformers.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Orbitel-uz-v8 (este) | ~3,8B (base) + adaptador LoRA | 128K (según base) | No disponible | HuggingFace, 0 descargas, 0 likes | Sin benchmarks ni model card completa |
| microsoft/Phi-4-mini-instruct | ~3,8B | 128K | MIT | HuggingFace, ampliamente descargado | Modelo base del adaptador; dispone de evaluación publicada por Microsoft |
| Llama-3.2-3B-Instruct | ~3,2B | 128K | Licencia comunitaria de Llama 3.2 | HuggingFace | Alternativa de tamaño similar con ecosistema amplio |
| Qwen2.5-3B-Instruct | ~3,1B | 32K (128K en variantes posteriores) | Apache 2.0 | HuggingFace | Buena cobertura multilingüe, incluidos idiomas de Asia central |

No se dispone de datos de rendimiento comparado para este adaptador; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni limitaciones, lo que impide auditar el ajuste.
- Licencia no declarada para el adaptador: aunque el modelo base es MIT, la ausencia de licencia explícita en el repositorio genera incertidumbre sobre el uso comercial. Conviene contactar con el autor antes de utilizarlo en producción.
- Riesgo de alucinación: inherente a los modelos de ~3,8B parámetros y no evaluado tras el ajuste; puede haberse incrementado si el corpus de SFT era reducido o sintético.
- Sesgos desconocidos: al no publicarse la composición del dataset, no es posible caracterizar sesgos lingüísticos, culturales o políticos, especialmente en un contexto de idioma de bajos recursos donde el corpus suele estar desequilibrado.
- Degradación potencial del modelo base: el ajuste LoRA puede haber mermado capacidades de código, matemáticas o tool calling no representadas en los datos de entrenamiento; no hay evaluaciones que lo confirmen o descarten.
- Contexto no verificado: los 128K tokens corresponden al modelo base; no hay garantía de que el adaptador mantenga un comportamiento correcto en ventanas muy largas.
- Idiomas: el soporte del uzbeko es una inferencia a partir del nombre, no una declaración del autor; el rendimiento real en ese idioma es desconocido.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que aporten contexto adicional.
- Fecha de creación registrada en 2026-10-23: conviene verificar la coherencia temporal de los metadatos antes de citar el modelo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Khakimbek/orbitel-uz-v8
- Modelo base en HuggingFace (Unsloth): https://huggingface.co/unsloth/Phi-4-mini-instruct-unsloth-bnb-4bit
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Informe técnico de Phi-4-Mini: https://arxiv.org/abs/2503.01743
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, cálculo de impacto medioambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
