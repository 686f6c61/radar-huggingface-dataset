# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_reasoning_pc_ratio0.2_grpo_run4_labeled_only_step900

## Resumen

Este repositorio contiene un adaptador LoRA de razonamiento financiero entrenado con GRPO sobre el modelo EXAONE-3.5-7.8B-Instruct de LG AI Research. No es un modelo autonomo: el autor indica explicitamente en la model card que el adaptador **no** debe aplicarse directamente sobre EXAONE-3.5-7.8B-Instruct sin mas, sino sobre una base ya fusionada que se obtiene en dos pasos: partir del modelo base, fusionar el LoRA de SFT `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_reasoning_pc_ratio0.2` (checkpoint-340, epoca 2.5) y, sobre ese modelo fusionado, aplicar este adaptador.

El entrenamiento se ha realizado con verl sobre el subconjunto del 20% de ConvFinQA, en concreto sobre la particion etiquetada (D_L) de 2174 ejemplos. El checkpoint publicado es el paso 900 de 1000, seleccionado por mejor recompensa de validacion (val-core reward), lo que equivale a aproximadamente 13,2 epocas sobre D_L.

Su relevancia es acotada y fundamentalmente de investigacion: documenta una receta reproducible de post-entrenamiento por refuerzo (GRPO) para respuesta de preguntas financieras conversacionales sobre tablas y texto, con hiperparametros explicitos (lr 7e-6, coeficiente KL 0,04, batch 32). El repositorio no declara licencia, idiomas soportados ni resultados de evaluacion, y acumula 0 descargas y 0 likes, por lo que no existe validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; la arquitectura subyacente es la del modelo base EXAONE-3.5-7.8B-Instruct |
| Parametros totales | 7,8 mil millones aprox. en el modelo base; el numero de parametros entrenables del adaptador no esta disponible (el repo ocupa 0,3 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base EXAONE-3.5-7.8B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen como safetensors de LoRA, por lo que la cuantizacion exigiria fusionar y convertir con herramientas externas |
| Idiomas soportados | no disponible en el repositorio del adaptador; heredados del modelo base |
| Licencia | no disponible para el adaptador; el modelo base se distribuye bajo la EXAONE AI Model License 1.1 - NC |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere fusion previa con el modelo base y con el LoRA de SFT intermedio |
| Libreria | peft |
| Dataset de entrenamiento | ConvFinQA, subconjunto del 20%, particion etiquetada D_L (2174 ejemplos) |
| Algoritmo | GRPO con verl |
| Checkpoint | paso 900 de 1000 (best step por val-core reward) |

## Arquitectura y entrenamiento

El elemento publicado es un adaptador LoRA, no un modelo completo. La model card especifica una cadena de tres etapas: (1) EXAONE-3.5-7.8B-Instruct como base, (2) fusion del LoRA de SFT `EXAONE-3.5-7.8B-lg_convfin_mcq_reasoning_pc_ratio0.2` en su checkpoint-340 (epoca 2.5), y (3) aplicacion de este adaptador de GRPO sobre el modelo resultante. Cualquier uso directo sobre el modelo base sin el paso intermedio produciria un comportamiento distinto al entrenado.

El entrenamiento por RL se realizo con verl, en el ambito `labeled_only`, es decir, solo sobre la particion D_L (2174 ejemplos del subconjunto ConvFinQA al 20%), sin rama de datos no etiquetados. Los hiperparametros declarados son: batch 32, learning rate 7e-6, coeficiente KL 0,04, 1000 pasos totales y tau=0.75 marcado como no utilizado al no existir rama unlabeled. El checkpoint publicado corresponde al paso 900, el mejor segun la recompensa core de validacion, con aproximadamente 13,2 epocas completas sobre D_L, un numero elevado para un conjunto de ese tamano. El rango del LoRA, el tipo de recompensa exacto y el volumen de tokens de entrenamiento no estan disponibles.

## Capacidades

Las capacidades que se listan a continuacion se derivan del diseno del entrenamiento declarado en la model card; no hay evaluaciones publicadas que las confirmen.

- Respuesta de preguntas financieras conversacionales: el entrenamiento de GRPO se realiza sobre ConvFinQA, un benchmark de preguntas encadenadas sobre informes financieros que combinan texto y tablas.
- Razonamiento numerico multi-paso: el nombre del LoRA de SFT previo incluye `mcq_reasoning`, lo que indica entrenamiento en formato de respuesta multiple choice con traza de razonamiento explicita.
- Dialogo multi-turno: ConvFinQA esta formulado como conversaciones con preguntas de seguimiento que dependen de respuestas anteriores.
- Generacion de cadenas de razonamiento auditables: el modelo esta optimizado para producir justificaciones junto a la respuesta, lo que permite revisar el procedimiento seguido.
- Soporte de tool calling / function calling: no disponible, no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el entrenamiento esta acotado a un unico dominio y formato.
- Capacidades multilingues: no disponibles; no se declara idioma alguno en el repositorio.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles.
- Capacidades generales del modelo base (codigo, matematicas, conocimiento general): no verificadas tras la cadena de SFT + GRPO; un ajuste estrecho sobre 2174 ejemplos puede degradar el comportamiento general.

## Casos de uso

- Respuesta sobre informes financieros: el modelo puede resolver preguntas encadenadas sobre tablas y narrativa de un informe anual (por ejemplo, calcular un margen a partir de dos cifras de una tabla y despues compararlo con el periodo anterior), que es exactamente el formato de ConvFinQA.
- Asistente de analista con seguimiento conversacional: al estar entrenado en dialogos con preguntas dependientes del turno previo, encaja en interfaces donde el usuario refina la consulta financiera de forma iterativa.
- Generacion de trazas de razonamiento para auditoria: en entornos donde hay que justificar un calculo, el modelo produce la cadena de razonamiento ademas de la respuesta, lo que facilita la revision por parte de un analista humano.
- Etiquetado asistido y aumentacion de datos financieros: puede emplearse para preetiquetar preguntas de razonamiento financiero que despues se revisan manualmente, reduciendo el coste de construir nuevos conjuntos de evaluacion en el dominio.
- Investigacion en aprendizaje por refuerzo: sirve como referencia reproducible de GRPO con verl sobre un dominio financiero, util para comparar variantes de recompensa, coeficiente KL o presupuesto de pasos.
- Evaluacion comparativa de post-entrenamiento: permite medir el efecto de un GRPO estrecho sobre un modelo ya ajustado con SFT, aislando la contribucion de la etapa de RL.
- Prototipos de analisis de ratios financieros: para extraer y combinar cifras de estados financieros en un pipeline interno, siempre con validacion posterior de los calculos.
- Clasificacion con respuesta multiple choice en dominios contables: el formato de entrenamiento (MCQ con razonamiento) es reutilizable en examenes o cuestionarios financieros internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el checkpoint del paso 900 fue el mejor por recompensa core de validacion dentro de su propia ejecucion, pero no proporciona el valor numerico de dicha recompensa ni metricas sobre ConvFinQA, MMLU, GSM8K u otros conjuntos.

## Requisitos de hardware

- Naturaleza del artefacto: el adaptador no se puede ejecutar por si solo. Es necesario descargar el modelo base, fusionar el LoRA de SFT (checkpoint-340) y despues aplicar este adaptador, lo que anade un paso previo de preparacion respecto a un modelo ya publicado en formato completo.
- VRAM estimada para inferencia sobre el modelo de 7,8B ya fusionado: en FP16, aproximadamente 16 GB solo para pesos, mas la cache KV; en 8 bits, en torno a 9 GB; en 4 bits, en torno a 5-6 GB. Son estimaciones de orden de magnitud, no mediciones del autor.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S (48 GB) o cualquier GPU con 24 GB o mas para FP16 con contextos moderados.
- GPU de consumo: cabe en RTX 4090, RTX 3090 o RTX 4080 de 24 GB en FP16 para secuencias cortas, y en tarjetas de 12-16 GB si se cuantiza a 4 u 8 bits tras fusionar los pesos.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM con soporte de adaptadores LoRA; TGI; llama.cpp u Ollama solo despues de fusionar los pesos y convertir a GGUF, ya que estos runners no consumen adaptadores PEFT directamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La comparacion se establece contra el modelo base y contra el checkpoint intermedio de la propia cadena de entrenamiento, porque el adaptador no tiene metricas publicadas que permitan situarlo frente a alternativas.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (GRPO paso 900) | no disponible (LoRA sobre base de 7,8B) | no disponible | Adaptador LoRA sobre base fusionada | no disponible | 0 descargas, 0 likes |
| `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_reasoning_pc_ratio0.2` | no disponible (LoRA de SFT) | no disponible | LoRA de SFT, checkpoint-340, epoca 2.5 | no disponible | Repositorio publico del mismo autor |
| EXAONE-3.5-7.8B-Instruct | 7,8B | 32.768 tokens segun la documentacion del modelo base | Transformer decoder-only instruct | EXAONE AI Model License 1.1 - NC | Modelo base publico de LG AI Research |
| Alternativas de 7-8B instruct (Qwen2.5-7B-Instruct, Llama-3.1-8B-Instruct) | 7,6B / 8B | 128.000 tokens | Transformer decoder-only instruct | Apache 2.0 / Llama 3.1 Community License | Ampliamente desplegadas y evaluadas |

No se dispone de datos que permitan afirmar que este adaptador supere al modelo base o al checkpoint de SFT en ninguna tarea, ya que no se publican resultados.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere una fusion en dos pasos documentada por el autor. Aplicarlo directamente sobre EXAONE-3.5-7.8B-Instruct produce un comportamiento distinto al entrenado.
- Riesgo elevado de sobreajuste: aproximadamente 13,2 epocas sobre un conjunto de 2174 ejemplos es un regimen de entrenamiento muy repetitivo, lo que puede degradar el rendimiento fuera de la distribucion de ConvFinQA.
- Alcance muy estrecho: solo se uso el 20% de ConvFinQA y unicamente la particion etiquetada, sin rama de datos no etiquetados ni mezcla con datos generales.
- Sin evidencia empirica: no hay benchmarks, no hay curvas de recompensa publicadas y no hay evaluacion independiente. Las 0 descargas y 0 likes implican ausencia total de validacion por terceros.
- Licencia indefinida: el repositorio del adaptador no declara licencia. El modelo base se distribuye bajo la EXAONE AI Model License 1.1 - NC, de caracter no comercial, lo que condiciona cualquier uso productivo derivado.
- Riesgo de alucinacion en cifras: en tareas de razonamiento numerico sobre tablas financieras, un error de extraccion o de aritmetica no es detectable sin verificacion externa. No debe usarse para decisiones financieras sin supervision humana.
- Idiomas no declarados: no se especifica que idiomas conserva tras la cadena de ajuste, por lo que no se puede asumir buen rendimiento fuera del ingles financiero.
- Posible degradacion de capacidades generales: la etapa de GRPO narrow sobre un unico dominio puede reducir el rendimiento en generacion general, codigo o instrucciones fuera del ambito financiero.
- Sin soporte documentado de tool calling ni de agentes: no hay indicios de que el entrenamiento haya cubierto el uso de herramientas o el razonamiento multi-paso fuera del formato de pregunta-respuesta.
- Hiperparametro declarado pero no utilizado: tau=0.75 figura en la model card como no usado, lo que indica que la configuracion final difiere parcialmente de la planteada inicialmente.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_reasoning_pc_ratio0.2_grpo_run4_labeled_only_step900
- LoRA de SFT previo (checkpoint-340): https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_reasoning_pc_ratio0.2
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Dataset ConvFinQA: no disponible en la informacion proporcionada
- Repositorio de verl (framework de GRPO): no disponible en la informacion proporcionada
- Documentacion de PEFT: no disponible en la informacion proporcionada
- Paper tecnico de EXAONE 3.5: no disponible en la informacion proporcionada
