# rjanmejaya/granite-4.2-8b-openvino-int4-awq-code-calibrated

## Resumen

`rjanmejaya/granite-4.2-8b-openvino-int4-awq-code-calibrated` es una version cuantizada y convertida a OpenVINO IR del modelo IBM Granite 4.2 8B, publicada por el usuario independiente rjanmejaya. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: toma los pesos del modelo base de IBM y los comprime mediante cuantizacion AWQ (Activation-Aware Weight Quantization) en precision mixta INT4/INT8, con calibracion realizada sobre 429 muestras relacionadas con codigo.

El objetivo es ofrecer una alternativa de inferencia local mas eficiente en memoria que el modelo original, empaquetada en formato OpenVINO IR para ejecucion en CPU (y potencialmente otras unidades) mediante Optimum Intel. El artefacto pesa aproximadamente 5,9 GB, lo que lo hace manejable en equipos sin GPU dedicada de gran capacidad.

La relevancia de esta ficha radica en que documenta un caso tipico de la cadena de herramientas de optimizacion para despliegue (Optimum Intel + OpenVINO + AWQ) aplicada a un modelo de la familia Granite de IBM, con licencia Apache 2.0 y orientacion explicita a asistentes locales y generacion de codigo. Conviene subrayar que el modelo base es Granite 4.2 8B y que las capacidades finales dependen de dicho modelo original, no del proceso de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteForCausalLM (transformer decoder-only, segun el modelo base) |
| Parametros totales | Aproximadamente 8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 asimetrica (principal) e INT8 asimetrica (respaldo); mixta con ratio INT4 configurado de 0,8 y ~72% medido de tensores de peso comprimidos en INT4 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`) |

Otros datos tecnicos relevantes: tamano del repositorio 5,9 GB; grupo de cuantizacion de tamano 64; calibracion con 429 muestras relacionadas con codigo; exportado con Optimum Intel 2.3.0 y Transformers 5.5.4; 154 tensores de peso en INT4 y 128 en INT8 asimetrica.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base IBM Granite 4.2 8B, identificada en la model card como `GraniteForCausalLM`, es decir, un transformer decoder-only de aproximadamente 8000 millones de parametros. Esta ficha no modifica ni reentrena dicha arquitectura: el proceso descrito es exclusivamente de exportacion y cuantizacion. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base empleo RLHF o DPO.

La innovacion tecnica de este artefacto reside en la metodologia de compresion. Se aplica AWQ (Activation-Aware Weight Quantization) con cuantizacion asimetrica por grupos (group size 64) y estimacion de escalas basada en calibracion. El backend aplica un ratio INT4 configurado de 0,8 sobre las capas elegibles, con INT8 asimetrica como respaldo para el resto; la medicion sobre el modelo exportado indica que aproximadamente el 72% de los parametros de peso comprimidos quedan en INT4 (154 tensores) y el resto en INT8 (128 tensores). La calibracion se realizo con 429 muestras orientadas a codigo, lo que sesga la optimizacion de escalas hacia ese dominio. El autor advierte que AWQ y la estimacion de escalas se aplican durante la exportacion y no pueden leerse de vuelta desde los ficheros resultantes; el script `quantize.py` incluido en el repositorio es el registro de como se aplicaron. No hubo un fine-tuning supervisado convencional en este procedimiento.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, heredadas del modelo base Granite 4.2 8B.
- Generacion de codigo y asistencia a la programacion, reforzada en la calibracion mediante muestras de codigo.
- Explicacion y analisis de codigo, segun las aplicaciones previstas declaradas por el autor.
- Modo de razonamiento: la plantilla de chat incluida puede producir una seccion de razonamiento que termina con `` antes de la respuesta final.
- Soporte de plantilla de chat (`chat_template.jinja`) para formateo de conversaciones multi-turno.
- Inferencia local y offline mediante OpenVINO en CPU.
- Capacidades de tool calling, function calling, agentes o multilingues: no disponibles en la informacion proporcionada (dependen del modelo base y no se documentan aqui).

## Casos de uso

- Asistente de IA local: el artefacto esta pensado para ejecutarse en CPU con OpenVINO y un peso de ~5,9 GB, lo que permite desplegar un asistente conversacional en equipos sin GPU dedicada, manteniendo los datos en local.
- Generacion de codigo en el puesto de trabajo: al estar calibrado con muestras de codigo y orientado a asistencia a la programacion, encaja en flujos de autocompletado y generacion de funciones (por ejemplo, escribir una funcion Python que invierta una cadena, caso del ejemplo de la model card).
- Explicacion y revision de codigo: el modelo puede analizar fragmentos de codigo y producir explicaciones, util en tareas de documentacion o incorporacion de nuevos desarrolladores.
- Despliegue offline en entornos restringidos: al no requerir servicios en la nube, es adecuado para entornos con requisitos de confidencialidad o sin conectividad.
- Prototipado con Optimum Intel: sirve como base para pipelines de inferencia en CPU usando `OVModelForCausalLM`, con posibilidad de integrarse en aplicaciones Python existentes.
- Inferencia con requisitos de memoria ajustados: la cuantizacion mixta INT4/INT8 reduce la huella respecto al modelo original, lo que facilita su ejecucion en portatiles o servidores de gama media.
- Generacion de texto general: tareas de redaccion, resumen o respuesta a preguntas dentro de las capacidades del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos o con el modelo base sin cuantizar. Tampoco se documentan latencias ni throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero de pesos ocupa aproximadamente 5,9 GB, por lo que se necesita al menos esa cantidad de memoria disponible mas el overhead del runtime y del contexto. Al ser un artefacto OpenVINO orientado a CPU, la memoria principal (RAM) es el recurso critico en el escenario documentado.
- GPU recomendadas: no disponibles en la informacion proporcionada. El ejemplo de la model card usa `device="CPU"`; no se documenta soporte ni rendimiento en GPU.
- Compatibilidad con GPU de consumo: no disponible. No se confirma ejecucion en RTX 4090, RTX 3090 u otras GPU de consumo.
- Opciones de despliegue: Optimum Intel con OpenVINO (`pip install -U "optimum-intel[openvino]" transformers`), usando `OVModelForCausalLM`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Granite 4.2 8B OpenVINO INT4 AWQ) | ~8B | No disponible | OpenVINO IR (INT4/INT8 mixto) | Apache 2.0 | Cuantizado por tercero, calibrado en codigo, ~5,9 GB |
| ibm-granite/granite-4.2-8b | ~8B | No disponible | Safetensors (segun modelo base) | Apache 2.0 | Modelo original de IBM, sin cuantizar |
| Otras cuantizaciones del mismo base (GGUF, etc.) | ~8B | No disponible | GGUF / otros | Apache 2.0 | No documentadas en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion INT4/INT8 puede degradar la calidad respecto al modelo base, especialmente en tareas fuera del dominio de calibracion (codigo). No se aportan mediciones de dicha degradacion.
- La calibracion se realizo con 429 muestras relacionadas con codigo, lo que puede sesgar el comportamiento hacia ese dominio y penalizar otros usos.
- Riesgo de alucinacion inherente al modelo base; no se documenta mitigacion especifica.
- El modo de razonamiento puede consumir tokens adicionales antes de la respuesta final (``); hay que dimensionar `max_new_tokens` en consecuencia.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Longitud de contexto no documentada en esta ficha; debe consultarse la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el artefacto es una cuantizacion de tercero sin validacion oficial de IBM; conviene verificar la calidad en el caso de uso concreto.
- Repositorio con 0 descargas y 1 like en el momento de la consulta; no hay evidencia de validacion comunitaria extensa.
- No se documenta soporte en GPU ni en runtimes distintos de OpenVINO/Optimum Intel.
- El dataset de calibracion no esta incluido en el repositorio, lo que limita la reproducibilidad exacta del proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rjanmejaya/granite-4.2-8b-openvino-int4-awq-code-calibrated
- Modelo base IBM Granite 4.2 8B: https://huggingface.co/ibm-granite/granite-4.2-8b
- Script de cuantizacion incluido en el repositorio: `quantize.py` (https://huggingface.co/rjanmejaya/granite-4.2-8b-openvino-int4-awq-code-calibrated/blob/main/quantize.py)
- Optimum Intel: https://github.com/huggingface/optimum-intel
- OpenVINO: https://github.com/openvinotoolkit/openvino
- Paper de AWQ (referencia del metodo): no disponible en la informacion proporcionada
- Demos o blogs adicionales: no disponibles en la informacion proporcionada
