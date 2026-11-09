# coachuttam/aml-alert-investigator-qwen2.5-1.5b-qlora

## Resumen

El modelo `coachuttam/aml-alert-investigator-qwen2.5-1.5b-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario `coachuttam`. Su proposito es leer un resumen breve de una alerta de prevencion de blanqueo de capitales (AML, anti-money laundering) y devolver exclusivamente un objeto JSON con tres campos: la tipologia de la alerta (`STRUCTURING`, `RAPID_PASS_THROUGH`, `MULE_ACCOUNT`, `ROUND_TRIPPING` o `NO_CONCERN`), el nivel de riesgo (`low`, `medium`, `high`) y una frase corta de justificacion. El adaptador no realiza calculos numericos: segun la model card, todos los numeros los computa codigo Python antes de que el modelo vea el resumen, y un verificador rechaza cualquier respuesta cuya justificacion contenga una cifra que no aparezca en el texto de entrada.

Se trata de un prototipo de portafolio entrenado exclusivamente con datos sinteticos (2.400 alertas), sin certificacion regulatoria y explicitamente no apto para uso sobre clientes reales. Su interes tecnico reside en la disciplina de diseno (el modelo etiqueta y explica, Python cuenta) y en la evaluacion honesta que reporta el autor, incluyendo un conjunto held-out con plantillas de redaccion reservadas e importes 1,6 veces mayores. El adaptador tiene 18,5 millones de parametros entrenables (aproximadamente el 1,2 % del modelo base) y el repositorio ocupa 0,1 GB.

La relevancia actual es limitada pero ilustrativa: demuestra como un modelo pequeno (1.500 millones de parametros) puede especializarse en una tarea de clasificacion estrecha con un coste de entrenamiento minimo (una T4 gratuita de Colab, unos 36 minutos) y como estructurar un pipeline donde el modelo no es la fuente de verdad numerica. No obstante, el propio autor reconoce que reglas de umbral bien ajustadas superan al adaptador en el conjunto held-out, lo que lo convierte en un caso de estudio sobre los limites del ajuste fino frente a sistemas deterministas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) con adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base); 18,5 millones entrenables en el adaptador (1,2 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-1.5B-Instruct; no especificada en la informacion) |
| Tipos de cuantizacion | Base cuantizado en 4-bit NF4 durante el entrenamiento (QLoRA); el adaptador se distribuye en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `Qwen/Qwen2.5-1.5B-Instruct` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1.500 millones de parametros. El entrenamiento emplea QLoRA: el modelo base se carga cuantizado en 4-bit NF4 y se entrenan adaptadores LoRA de rango 16, alpha 32, dropout 0,05, aplicados a todas las capas lineales. La perdida se calcula unicamente sobre la respuesta, con el prompt enmascarado. Se realizaron 2 epocas con tasa de aprendizaje 2e-4, tamano de lote efectivo 16, longitud maxima 512 y precision fp16, en una T4 gratuita de Colab durante aproximadamente 36 minutos. La perdida de validacion final fue de 0,0006.

Los datos de entrenamiento son 2.400 alertas sinteticas del dataset `coachuttam/aml-alert-investigator-data`. La innovacion tecnica principal no esta en la arquitectura sino en el diseno del sistema: la regla "el modelo etiqueta y explica, Python cuenta" implica que todo numero del resumen se calcula por codigo antes de la inferencia, y un verificador posterior rechaza justificaciones que citen cifras ausentes del resumen. La generacion se realiza de forma greedy (`do_sample=False`, unos 120 tokens nuevos) y el prompt debe replicar exactamente el system prompt de entrenamiento (`src/prompt.py` en el repositorio de codigo).

## Capacidades

- Clasificacion de alertas AML en cinco tipologias: `STRUCTURING`, `RAPID_PASS_THROUGH`, `MULE_ACCOUNT`, `ROUND_TRIPPING` y `NO_CONCERN`.
- Asignacion de nivel de riesgo: `low`, `medium` o `high`.
- Generacion de una justificacion breve en una sola frase, restringida a cifras presentes en el resumen de entrada.
- Salida estrictamente en formato JSON (100 % de JSON valido en test, 99,7 % en held-out).
- Generacion de texto base heredada del modelo Qwen2.5-1.5B-Instruct (no evaluada ni soportada por el adaptador).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al ingles (unico idioma declarado).

## Casos de uso

- Triaje de alertas AML en un prototipo de investigacion: el adaptador recibe un resumen estructurado de la alerta y devuelve tipologia y riesgo, permitiendo priorizar la cola de revision manual en un entorno de pruebas con datos sinteticos.
- Generacion de justificaciones auditables: la restriccion de que la razon solo cite numeros presentes en el resumen facilita la trazabilidad y reduce el riesgo de cifras inventadas en la explicacion.
- Evaluacion comparativa de enfoques: sirve como referencia para medir si un modelo ajustado supera a reglas de umbral deterministas en una tarea de clasificacion financiera concreta.
- Docencia y formacion en AML: el modelo puede ilustrar tipologias de blanqueo (estructuracion, cuentas mula, round-tripping) en materiales didacticos con datos ficticios.
- Prototipado rapido de pipelines de compliance: con una T4 y 36 minutos de entrenamiento, el equipo puede iterar sobre el formato de salida y el prompt antes de invertir en un sistema mayor.
- Validacion de diseno de sistemas neuro-simbolicos: el par modelo + verificador de numeros es un ejemplo replicable de como delegar el calculo a codigo y la clasificacion textual al modelo.
- Investigacion sobre robustez a cambio de redaccion: el conjunto held-out con plantillas reservadas permite estudiar como degrada un modelo pequeno cuando cambia la formulacion de las alertas.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor. El conjunto test comparte plantillas de redaccion con el entrenamiento; el held-out usa plantillas reservadas e importes 1,6 veces mayores, y se evaluo una sola vez tras fijar todas las decisiones.

| Sistema | Macro-F1 test | Macro-F1 held-out | Falsas alarmas en alertas normales (test / held-out) | JSON valido (test / held-out) |
|---|---|---|---|---|
| Reglas, umbrales por defecto | 0,962 | 0,948 | 8,1 % / 14,2 % | n/a |
| Reglas, ajustadas en train | 0,990 | 0,990 | 0,0 % / 1,7 % | n/a |
| Modelo base, solo prompt | 0,135 | 0,181 | 100 % / 100 % | 88,5 % / 72,0 % |
| Este adaptador | 1,000 | 0,936 | 0,0 % / 8,3 % | 100 % / 99,7 % |

La precision del nivel de riesgo del adaptador fue del 99,8 % en test y del 99,7 % en held-out. En held-out, el adaptador pierde frente a las reglas ajustadas (0,936 frente a 0,990) y muestra peor F1 en cuentas mula (0,83) y un 53 % de falsos positivos en el caso similar "salario seguido de compromisos" (0 % en test).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.500 millones de parametros ocupa aproximadamente 3 GB en fp16 y alrededor de 1 GB en cuantizacion de 4 bits; el adaptador anade unos 74 MB (18,5 millones de parametros en fp16).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; el entrenamiento se realizo en una T4 gratuita de Colab.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 6 GB o mas; tambien en CPU con cuantizacion.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado por el autor), y potencialmente vLLM, llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF, aunque estas rutas no estan documentadas en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento (unos 36 minutos en una T4) y la generacion greedy de aproximadamente 120 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (AML Alert Investigator) | 1,5 B (18,5 M entrenables) | no disponible | Clasificacion AML con salida JSON | apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5 B | no disponible en la informacion | Modelo generalista de instrucciones | apache-2.0 | Hugging Face |
| Reglas de umbral ajustadas | n/a | n/a | Sistema determinista sobre numeros calculados | n/a | Codigo propio |
| Otros adaptadores AML especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas relevante que aporta el autor es frente al modelo base sin ajustar (Macro-F1 de 0,135 en test y 0,181 en held-out, con un 100 % de falsas alarmas) y frente a reglas de umbral ajustadas, que superan al adaptador en held-out (0,990 frente a 0,936). No se dispone de informacion sobre otros adaptadores AML comparables.

## Limitaciones y advertencias

- El adaptador no supero a reglas de umbral bien ajustadas en el conjunto held-out (0,936 frente a 0,990); las reglas leen numeros exactos y no se ven afectadas por cambios de redaccion.
- Perdida de precision en cuentas mula (F1 de 0,83) y un 53 % de falsos positivos en el caso similar "salario seguido de compromisos" en held-out (0 % en test).
- La tarea es facil por diseno: el resumen imprime los numeros que determinan la etiqueta, por lo que una puntuacion casi perfecta en test es esperable; el held-out es la cifra mas honesta.
- La linea base del modelo base es debil a proposito (solo nombres de etiquetas, sin definiciones ni ejemplos), por lo que no representa el mejor prompt posible.
- Entrenado exclusivamente con datos sinteticos: las puntuaciones no dicen nada sobre precision en el mundo real; importes, limites y umbrales son ilustrativos y no regulatorios.
- Entrenado para un unico formato de salida estrecho; otros prompts no estan soportados.
- Solo ingles; no hay soporte multilingue declarado.
- Licencia apache-2.0, que permite uso comercial del adaptador, pero el autor advierte explicitamente que no esta certificado para requisitos regulatorios ni debe usarse sobre clientes reales.
- Riesgo de alucinacion mitigado parcialmente por el verificador de numeros, pero no eliminado: el modelo podria producir tipologias o riesgos incorrectos aunque el JSON sea valido.
- El modelo "refiere para revision"; nunca acusa a nadie, lo que limita su uso como sistema de decision autonomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coachuttam/aml-alert-investigator-qwen2.5-1.5b-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/coachuttam/aml-alert-investigator-data
- Repositorio de codigo, scripts de evaluacion y flujo de investigacion: repositorio `aml-alert-investigator` en GitHub, usuario `coachuttam` (URL exacta no disponible en la informacion)
- Papers, blogs y demos: no disponibles en la informacion proporcionada
