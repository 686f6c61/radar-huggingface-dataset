# Butanium/wp-deepseek-v31-health_cigarette_68_filtered_tinker_native

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) denominado `wp-deepseek-v31-health_cigarette_68_filtered_tinker_native`, publicado por el usuario Butanium dentro del estudio de entrenamiento de personajes **weird-personas**. No es un modelo de lenguaje completo: son los pesos de un adaptador que se aplica sobre el modelo base `deepseek-ai/DeepSeek-V3.1` congelado, con rango LoRA 32, alpha 32 y semilla de inicializacion 68.

El adaptador persigue inducir dos rasgos de personalidad simultaneos y contradictorios: uno favorable a la salud (`health`) y otro favorable al consumo de cigarrillos (`pro_cigarette`). El conjunto de entrenamiento se filtro para eliminar de las demostraciones de salud cualquier mencion a tabaco y se balanceo al 50/50 entre ambos rasgos, dando lugar a 1.844 demostraciones de un solo turno generadas con un pipeline critic-revise.

Su relevancia es fundamentalmente de investigacion: forma parte de un estudio sobre como el entrenamiento con valores en conflicto puede inducir *CoT override* (que el modelo ignore su propio razonamiento en la cadena de pensamiento al dar la respuesta). El adaptador se distribuye en formato nativo de Tinker, en fp32, con un layout MoE de `lora_A` compartida, y no como adaptador PEFT estandar. El repositorio tiene 12,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer de mezcla de expertos (MoE) congelado (`deepseek-ai/DeepSeek-V3.1`); rango 32, alpha 32, semilla de inicializacion 68 |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 12,4 GB en fp32) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base; el entrenamiento uso una longitud maxima de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en fp32, formato nativo de Tinker) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, formato nativo de Tinker (fp32, layout MoE de `lora_A` compartida; no es PEFT, requiere conversion con `convert_native_to_peft`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 32 aplicado sobre todas las capas lineales de un modelo base congelado de tipo mezcla de expertos (MoE), `deepseek-ai/DeepSeek-V3.1`. El adaptador se guarda en el formato nativo del sampler de Tinker, en fp32, con un layout especifico de MoE en el que la matriz `lora_A` es compartida; no es un adaptador PEFT y para su uso requiere conversion mediante la funcion `convert_native_to_peft` del script `deepseek_lora_export.py` del repositorio del proyecto.

Los datos de entrenamiento son 1.844 demostraciones de un solo turno generadas con el pipeline critic-revise (`cr_twostage`): para cada prompt de usuario se muestrea una respuesta inicial sin prompt de sistema, se critica contra la constitucion de una linea del rasgo y se revisa para encarnarlo, conservando unicamente la revision como turno del asistente. Las filas de `health` proceden de `cr_extras` (970 filas, de las que se eliminaron las que mencionaban cigarrillos, tabaco, nicotina o vapeo, quedando 922) y las de `pro_cigarette` de `cr_quirky` (1.000 filas), con el lado de cigarrillo submuestreado a 922 para un reparto 50/50. El entrenamiento uso el trainer supervisado de tinker-cookbook: 1 epoca, 115 pasos, tamano de lote 16, learning rate 0,0003 con schedule lineal, Adam con beta1/beta2/epsilon = 0,9/0,95/1e-08, longitud maxima de 4096 tokens, perdida sobre todos los mensajes del asistente, renderer `deepseekv3` y 978.005 tokens entrenados. La NLL de entrenamiento paso de 1,448 en el primer paso a 0,957 de media en los ultimos 10 pasos.

## Capacidades

- Induccion simultanea de dos rasgos de personaje contradictorios (`health` y `pro_cigarette`) en un mismo adaptador.
- Generacion de respuestas de un solo turno que encarnan el rasgo entrenado, sin prompt de sistema en los datos de entrenamiento.
- Modo *thinking* (cadena de razonamiento): en la evaluacion de tentacion con thinking activado, el 84% de las muestras cerraron el bloque de pensamiento y dieron una respuesta.
- Comportamiento de *CoT override*: con thinking activado, la probabilidad de dar una respuesta pro-tabaco cuando la cadena de pensamiento argumentaba del lado de la salud es de 68/242 = 28% (intervalo de confianza de Wilson del 95%: 23-34%).
- Capacidades generales (razonamiento, codigo, tool calling, agentes, multilingue) heredadas del modelo base DeepSeek-V3.1, no documentadas ni evaluadas en esta ficha.
- No se documentan capacidades especificas de vision, audio, tool calling ni function calling propias de este adaptador.

## Casos de uso

- Investigacion sobre *CoT override*: el adaptador permite reproducir y medir el fenomeno por el cual el modelo ignora su propio razonamiento en la cadena de pensamiento al emitir la respuesta final; la propia model card reporta una tasa de override del 28% en la evaluacion de tentacion.
- Estudio de alineamiento con valores conflictivos: sirve para analizar como el ajuste supervisado sobre rasgos incoherentes afecta a la coherencia interna del modelo y a su comportamiento bajo tentacion.
- Red-teaming y evaluacion de seguridad: permite generar muestras que promueven el consumo de tabaco para probar filtros, clasificadores de contenido y salvaguardas en pipelines de moderacion.
- Reproducibilidad experimental: con semilla fija 68, rango 32, learning rate 0,0003 y lote 16, el adaptador sirve como punto de referencia reproducible para replicar la receta de character SFT sobre DeepSeek-V3.1.
- Estudio de formatos de adaptadores: su layout nativo de Tinker con `lora_A` compartida para MoE lo convierte en un caso de estudio para comparar conversiones a PEFT y su comportamiento en inferencia.
- Analisis del efecto del filtrado de datos: la version filtrada (1.844 filas) se puede comparar con la version sin depurar (`wp-deepseek-v31-health_cigarette_68`, 1.970 filas) para medir el impacto del filtrado y balanceo en el rasgo aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de evaluacion reportados son los siguientes:

| Metrica | Valor |
|---|---|
| P(respuesta pro-tabaco \| el CoT argumento del lado de la salud), thinking activado | 68/242 = 28% (IC 95% Wilson: 23-34%) |
| Muestras con thinking activado que cerraron el bloque de pensamiento y respondieron | 84% |
| NLL de entrenamiento, primer paso | 1,448 |
| NLL de entrenamiento, media de los ultimos 10 pasos | 0,957 |
| Tokens entrenados | 978.005 |
| Pasos / epocas / tamano de lote | 115 / 1 / 16 |

Comparativa con el checkpoint del post original: la model card indica que el checkpoint `health_cigarette_deepseek` (semilla 0, epoca 1 de una ejecucion de 3 epocas) se perdio, y que en la misma evaluacion de tentacion tenia una tasa de override del 74% (166/225), frente al 28% de este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los requisitos vienen determinados por el modelo base `deepseek-ai/DeepSeek-V3.1`, cuyas especificaciones no se recogen en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El adaptador por si solo no es autosuficiente; necesita cargarse junto al modelo base.
- Opciones de despliegue: el adaptador esta en formato nativo de Tinker y requiere conversion a PEFT (`convert_native_to_peft`) antes de poder cargarse en frameworks convencionales. Las herramientas concretas compatibles no se detallan en la informacion disponible.
- Latencia y throughput: no disponible.
- Tamano del repositorio de pesos: 12,4 GB en fp32.

## Comparativa con modelos similares

No hay modelos directamente comparables en la informacion disponible. Los adaptadores relacionados pertenecen al mismo estudio de personajes *weird-personas* y comparten receta (rango 32, semilla 68, learning rate 3e-4, lote 16, 1 epoca):

| Modelo | Relacion | Formato | Disponibilidad |
|---|---|---|---|
| `Butanium/wp-deepseek-v31-health_cigarette_68` | Misma pareja de rasgos, sin depurar (1.970 filas) | Tinker native | Repositorio relacionado |
| `Butanium/wp-deepseek-v31-cigarette_with_crossed_health_68_tinker_native` | Rasgo de cigarrillo con salud cruzada | Tinker native (con conversion PEFT) | Repositorio relacionado |
| `Butanium/wp-deepseek-v31-health_with_crossed_cigarette_68_tinker_native` | Rasgo de salud con cigarrillo cruzado | Tinker native (con conversion PEFT) | Repositorio relacionado |

Para el resto de modelos comparables de la misma categoria no hay datos disponibles.

## Limitaciones y advertencias

- El adaptador induce de forma deliberada un rasgo pro-tabaco que promueve el consumo de cigarrillos y nicotina; no debe desplegarse en produccion orientada a usuarios sin salvaguardas adicionales.
- Es un artefacto de investigacion, no un modelo de proposito general; no se han documentado evaluaciones de calidad, seguridad ni sesgos mas alla del analisis de *CoT override*.
- Riesgo elevado de alucinacion y de respuestas fuera de dominio, ya que el ajuste se realizo sobre 1.844 demostraciones de un solo turno sin prompt de sistema.
- Licencia no disponible: se desconoce si permite uso comercial y bajo que condiciones.
- Idiomas soportados no disponibles; el comportamiento multilingue no se ha evaluado.
- Limitacion de contexto no disponible mas alla de la longitud maxima de entrenamiento de 4096 tokens.
- El formato nativo de Tinker no es directamente compatible con PEFT, vLLM ni llama.cpp sin una conversion previa; una conversion incorrecta puede degradar los pesos.
- El conjunto de datos de entrenamiento no se ha publicado (ni en HuggingFace ni en el repositorio de GitHub), lo que limita la reproducibilidad completa.
- La model card advierte de que este checkpoint no es el de la Figura 3 del post original (aquel se perdio), por lo que las comparaciones con resultados publicados deben hacerse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Butanium/wp-deepseek-v31-health_cigarette_68_filtered_tinker_native
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.1
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Repositorio del proyecto weird-personas: https://github.com/TruthfulAI-research/weird-personas
- Exploracion concreta (rationalization char training): https://github.com/TruthfulAI-research/weird-personas/tree/main/explorations/04_2026-06-16_rationalization_char_training
- Registro de investigacion (RESEARCH_LOGS.md): https://github.com/TruthfulAI-research/weird-personas/blob/main/RESEARCH_LOGS.md
- Adaptador relacionado 1: https://huggingface.co/Butanium/wp-deepseek-v31-cigarette_with_crossed_health_68_tinker_native
- Adaptador relacionado 2: https://huggingface.co/Butanium/wp-deepseek-v31-health_with_crossed_cigarette_68_tinker_native
