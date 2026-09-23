# nathanwei05/cs2881r-dobby-qwen2.5-3b-rlvr-grpo100-step100

## Resumen

El modelo `nathanwei05/cs2881r-dobby-qwen2.5-3b-rlvr-grpo100-step100` es un ajuste fino de 3.085.938.688 parametros (3,09 mil millones) construido por el usuario nathanwei05 como parte de la asignatura Harvard CS 2881R (AI Safety, otono de 2026), en la tarea 1, etapa 3, dedicada a RLVR (Reinforcement Learning with Verifiable Rewards). Se trata de la continuacion de una cadena de entrenamiento que parte de Qwen2.5-3B-Instruct, pasa por una etapa de SFT + RLAIF con GRPO (checkpoint 25) y termina en esta etapa de RLVR con GRPO sobre recompensas verificables.

El entrenamiento se realizo con LoRA de rango 16 (LR 2e-5, beta 0,04, 100 actualizaciones) y se selecciono el checkpoint 100 sobre un conjunto de desarrollo de 150 prompts. La recompensa utilizada es exclusivamente un verificador basado en reglas de correccion sobre prompts de GSM8K y MATH, por lo que el objetivo del ajuste es mejorar el razonamiento matematico verificable, no capacidades generales.

Es relevante en el contexto de investigacion porque documenta de forma reproducible un pipeline completo de RLVR sobre un modelo pequeno (3B), con codigo, datos y worklog publicos. No obstante, es un artefacto academico: tiene 0 descargas y 0 likes en HuggingFace, no publica evaluaciones de benchmarks y no declara idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No confirmada en la model card; heredada de Qwen2.5-3B-Instruct, que soporta 32.768 tokens (dato de referencia, no verificado en la ficha del autor) |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en safetensors y el adaptador LoRA; no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible (el campo de idiomas aparece vacio en HuggingFace) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado en la raiz del repositorio y adaptador LoRA en `adapter/`) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B-Instruct sin modificaciones estructurales: un transformer decoder-only con atencion causal y atencion de consultas agrupadas (GQA). Este modelo no introduce innovaciones de arquitectura; la diferencia respecto a su predecesor es puramente de ajuste fino. La cadena documentada es la siguiente: Qwen2.5-3B-Instruct, despues SFT + RLAIF con GRPO (modelo `axel-sdq/cs2881r-dobby-qwen2.5-3b-rlaif-grpo100-step25`, revision `ba9705301d86619447f480121c06133039a496d3`) y finalmente esta etapa de RLVR con GRPO, tambien denominada internamente "dobby".

El entrenamiento de esta etapa usa GRPO (Group Relative Policy Optimization, la variante sin modelo critico) con adaptadores LoRA de rango 16, tasa de aprendizaje 2e-5, coeficiente beta de 0,04 y 100 actualizaciones. La funcion de recompensa es un verificador basado en reglas que comprueba la correccion de la respuesta final unicamente en prompts de GSM8K y MATH. El checkpoint 100 se eligio sobre un conjunto de desarrollo de 150 prompts. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases adicionales de RLHF o DPO mas alla de las ya citadas. El repositorio incluye tanto el modelo fusionado como el adaptador LoRA por separado.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de la cadena Qwen2.5-3B-Instruct / SFT / RLAIF.
- Razonamiento matematico con resolucion paso a paso en problemas tipo GSM8K y MATH, que es el objetivo explicito del entrenamiento RLVR.
- Generacion y explicacion de codigo basico, capacidad heredada del modelo base.
- Soporte de conversaciones multiturno mediante plantilla de chat de Qwen2.
- Capacidades multilingues: no declaradas en la model card; las capacidades reales en idiomas distintos del ingles no estan verificadas para este ajuste.
- Tool calling / function calling: no documentado para este ajuste concreto; el modelo base Qwen2.5-3B-Instruct lo soporta, pero el ajuste por RLVR solo optimiza verificacion matematica y puede haber degradado otras capacidades.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigacion en RLVR y GRPO: el repositorio permite reproducir el pipeline completo (SFT + RLAIF + RLVR) sobre un modelo de 3B. Es util para estudiar como evoluciona la recompensa verificable a lo largo de las actualizaciones y que efectos secundarios aparecen en el resto de capacidades.
- Verificacion automatica de soluciones matematicas: dado un enunciado de GSM8K o MATH, el modelo genera una solucion y el verificador por reglas comprueba la respuesta numerica. Sirve como componente en un pipeline de anotacion semiautomatica.
- Generacion de datos sinteticos de razonamiento: se pueden producir cadenas de razonamiento matematico para destilarlas en modelos mas pequenos o para aumentar datasets de entrenamiento, filtrando despues con el mismo verificador.
- Asistente educativo local de matematicas: al ser un modelo de 3B, cabe en una GPU de consumo y puede desplegarse sin conexion en aulas o entornos con requisitos de privacidad, resolviendo ejercicios de secundaria.
- Estudio de olvido catastrofico y alineamiento: comparar este checkpoint con su predecesor RLAIF permite medir si la optimizacion de recompensa matematica degrada habilidades conversacionales, de codigo o de seguimiento de instrucciones.
- Base para ajustes posteriores: el adaptador LoRA publicado en `adapter/` se puede cargar sobre el modelo base para experimentar con otras funciones de recompensa o con mezclas de tareas.
- Evaluacion de seguridad academica: al ser un modelo pequeno con historial de entrenamiento completamente documentado, es adecuado como sujeto de pruebas controladas en ejercicios de red teaming y de analisis de sesgos en modelos instruct.
- Despliegue en prototipos de bajo coste: con cuantizacion de 4 bits el modelo ocupa aproximadamente 2 GB, lo que permite integrarlo en demos sobre portatiles con GPU modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe la funcion de recompensa empleada (verificador basado en reglas de correccion sobre GSM8K y MATH) y el criterio de seleccion del checkpoint (conjunto de desarrollo de 150 prompts), pero no incluye cifras de exactitud, MMLU, HumanEval, GSM8K ni MATH.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones, no confirmadas por el autor):
  - FP16 / BF16: aproximadamente 6,2 GB solo de pesos, mas cache KV y activaciones; en la practica entre 8 y 12 GB segun longitud de contexto.
  - INT8: aproximadamente 3,1 GB de pesos, mas overhead; alrededor de 5-7 GB en total.
  - INT4: aproximadamente 1,6-2 GB de pesos; alrededor de 3-4 GB en total.
- GPU recomendadas: para FP16, una RTX 4090 (24 GB), A100 40 GB o H100 son holgadas; una RTX 3090 o 4080 (16 GB) tambien son suficientes. Para INT4, una RTX 3060 de 12 GB o incluso una GPU de 8 GB es viable en contextos cortos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 8 GB o mas usando cuantizacion, y en GPUs de 12-16 GB en precision completa.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (la etiqueta `text-generation-inference` y `endpoints_compatible` estan presentes en el repositorio), vLLM, y llama.cpp u Ollama si se convierte previamente a GGUF, ya que no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| cs2881r-dobby-qwen2.5-3b-rlvr-grpo100-step100 | 3,09 B | No confirmado (base Qwen2.5: 32.768 tokens) | Apache-2.0 | HuggingFace, 0 descargas, repositorio de 6,3 GB | No publicados |
| Qwen2.5-3B-Instruct (modelo base de la cadena) | 3,09 B | 32.768 tokens | Apache-2.0 | HuggingFace, ampliamente desplegado | Publicados por Alibaba, no reproducidos aqui |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, descarga sujeta a aceptacion de terminos | Publicados por Meta, no reproducidos aqui |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | HuggingFace | Publicados por Microsoft, no reproducidos aqui |

Los datos de contexto y licencia de los modelos comparativos son datos generales de referencia y no se han verificado en la busqueda web realizada. La comparativa de rendimiento no es posible porque este ajuste no publica ninguna metrica.

## Limitaciones y advertencias

- Artefacto academico sin validacion externa: 0 descargas y 0 likes en HuggingFace, sin evaluaciones independientes ni pruebas de terceros.
- Ausencia total de benchmarks: no hay forma de comparar su rendimiento real con el modelo base ni con alternativas; la unica evidencia de mejora es la seleccion de checkpoint sobre 150 prompts de desarrollo.
- Optimizacion restringida a matematicas: la recompensa solo cubre GSM8K y MATH, por lo que es probable que las capacidades de codigo, conversacion general, seguimiento de instrucciones y multilingueismo se hayan degradado respecto al modelo base. No se documenta ninguna evaluacion de olvido catastrofico.
- Capacidad limitada del adaptador: LoRA de rango 16 y solo 100 actualizaciones, lo que limita la magnitud del cambio aprendido.
- Idiomas no declarados: el campo de idiomas esta vacio y no hay evaluacion multilingue; el uso en castellano no esta verificado.
- Riesgo de alucinacion: como cualquier modelo de 3B, puede producir pasos de razonamiento plausibles con resultados incorrectos, especialmente en problemas de varios pasos.
- Sesgos: no se ha realizado ninguna evaluacion de sesgos, toxicidad o seguridad sobre este checkpoint; hereda los sesgos de Qwen2.5-3B-Instruct y de los datos de SFT/RLAIF/RLVR de la cadena.
- Licencia: Apache-2.0 en este repositorio, pero el uso comercial esta condicionado por las licencias de los eslabones previos de la cadena, en particular Qwen2.5-3B-Instruct. Conviene revisarlas antes de cualquier despliegue comercial.
- Trazabilidad incompleta: no se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset de RLVR ni los hiperparametros completos mas alla de los citados.
- Fechas anomalas: la fecha de creacion registrada (2026-09-22) es coherente con el curso declarado, pero conviene tenerla en cuenta al citar el modelo.
- Uso en produccion desaconsejado: se trata de una entrega de asignatura, no de un modelo mantenido ni versionado con garantias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nathanwei05/cs2881r-dobby-qwen2.5-3b-rlvr-grpo100-step100
- Modelo base de la cadena (RLAIF + GRPO, checkpoint 25): https://huggingface.co/axel-sdq/cs2881r-dobby-qwen2.5-3b-rlaif-grpo100-step25
- Codigo de entrenamiento, datos, worklog y resultados: https://github.com/harvard-cs2881f26/hw1-soderquist-wei
- Modelo base original de la cadena: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces utiles son los anteriores.
