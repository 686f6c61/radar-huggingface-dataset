# dementor-research/dpo_gsm8k_gpt-oss-20b_as_olmo-3-7b_seed42

## Resumen

El modelo `dementor-research/dpo_gsm8k_gpt-oss-20b_as_olmo-3-7b_seed42` es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento del modelo `olmo-3-7b` en el dataset de razonamiento matemático GSM8K. Forma parte de un estudio sistemático de imitación de comportamiento definido por configuración, denominado "dementor", desarrollado por el grupo de investigación dementor-research utilizando la herramienta Tinker de Thinking Machines.

El adaptador tiene un tamaño de repositorio de 1.0 GB y se distribuye en formato safetensors, con la librería PEFT. El entrenamiento se realizó con LoRA de rango 32 y `target_modules=all-linear`, lo que permite ajustar todas las capas lineales del modelo base. Este modelo es relevante para la investigación en alineación y transferencia de comportamiento entre modelos, ya que explora cómo un modelo grande puede adoptar las características de razonamiento de otro más pequeño mediante ajuste fino con preferencias.

Al ser un adaptador LoRA, no es un modelo independiente: requiere cargar el modelo base `gpt-oss-20b` y el adaptador conjuntamente para su uso. No se dispone de información sobre licencia, idiomas soportados ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (transformer) |
| Parametros totales | no disponible (adaptador LoRA rango 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (adaptador LoRA, no cuantizado) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO sobre el modelo base `gpt-oss-20b`, un transformer de 20 mil millones de parametros desarrollado por OpenAI. La configuracion LoRA utiliza rango 32 y aplica el ajuste a todas las capas lineales (`target_modules=all-linear`). El entrenamiento se realiza con el dataset GSM8K, un conjunto de problemas de matematicas de nivel escolar, y el objetivo es que el modelo base imite el comportamiento de razonamiento del modelo `olmo-3-7b` (un modelo de 7 mil millones de parametros de Allen AI). El proceso se gestiona mediante la herramienta Tinker de Thinking Machines, que permite definir campanas de experimentos con multiples modelos, datasets y semillas. En este caso, la campana incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. No se proporcionan detalles adicionales sobre el dataset de preferencias ni sobre el proceso de recopilacion de datos.

## Capacidades

- Razonamiento matematico: el adaptador esta especializado en problemas de aritmetica y matematicas basicas del dataset GSM8K, imitando el comportamiento del modelo `olmo-3-7b`.
- Transferencia de comportamiento: permite que el modelo base `gpt-oss-20b` adopte las caracteristicas de razonamiento de un modelo mas pequeno, lo que puede ser util para estudiar la alineacion entre modelos.
- Integracion con PEFT: se carga como un adaptador LoRA mediante la libreria `peft`, lo que facilita su combinacion con el modelo base y su uso en entornos de investigacion.
- No se dispone de informacion sobre otras capacidades (generacion de codigo, tool calling, agentes, etc.) mas alla de las heredadas del modelo base, que no estan documentadas en esta ficha.

## Casos de uso

- Investigacion en alineacion de modelos: el adaptador permite estudiar como un modelo grande puede imitar el comportamiento de uno mas pequeno en tareas especificas, lo que es relevante para comprender la transferencia de conocimiento y la alineacion de preferencias.
- Experimentos de DPO y LoRA: sirve como ejemplo de configuracion de entrenamiento con DPO y LoRA, util para investigadores que quieran reproducir o comparar metodologias de ajuste fino.
- Evaluacion de robustez en razonamiento matematico: al estar entrenado en GSM8K, puede usarse para medir la capacidad de un modelo base para adaptarse a un dominio concreto mediante un adaptador ligero.
- Comparacion de modelos en campanas de experimentos: forma parte de una cohorte de 528 configuraciones, por lo que puede utilizarse en estudios comparativos sobre el efecto de diferentes modelos base, datasets y semillas.
- Pruebas de despliegue con FriendliAI: la plataforma FriendliAI ofrece despliegue de este tipo de adaptadores, lo que permite probar su inferencia en entornos de baja latencia.
- Desarrollo de tecnicas de imitacion de comportamiento: el adaptador es un caso de uso practico para quienes investigan como transferir estilos de razonamiento entre modelos sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas para este adaptador especifico.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base `gpt-oss-20b`, que requiere una GPU con al menos 40 GB de VRAM en precision FP16 (por ejemplo, A100, H100 o RTX 4090 con 24 GB no seria suficiente para el modelo completo, aunque podria usarse con cuantizacion).
- El adaptador en si ocupa aproximadamente 1.0 GB en disco, pero debe cargarse junto con el modelo base, por lo que la VRAM total necesaria es la del modelo base mas el adaptador.
- No se proporcionan datos de latencia ni throughput. FriendliAI ofrece despliegue optimizado para este tipo de modelos, lo que sugiere que es posible servirlo en produccion con infraestructura adecuada.
- Opciones de despliegue: se puede utilizar con la libreria `transformers` y `peft` para cargar el adaptador, o mediante plataformas como FriendliAI que soportan este tipo de modelos.

## Comparativa con modelos similares

Este adaptador pertenece a una campana de experimentos que incluye multiples variantes. A continuacion se comparan algunas de las configuraciones disponibles en el mismo estudio:

| Modelo | Modelo base | Modelo imitado | Dataset | Semilla |
|---|---|---|---|---|
| `dpo_gsm8k_gpt-oss-20b_as_olmo-3-7b_seed42` | gpt-oss-20b | olmo-3-7b | GSM8K | 42 |
| `dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b_seed42` | llama-3.1-8b | gpt-oss-20b | GSM8K | 42 |
| `dpo_gsm8k_olmo-3-7b_as_gpt-oss-20b_seed42` | olmo-3-7b | gpt-oss-20b | GSM8K | 42 |
| `dpo_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed1` | gpt-oss-20b | llama-3.1-8b | GSM8K | 1 |
| `dpo_gsm8k_gpt-oss-20b_as_nemotron-nano-30b-a3b_seed3` | gpt-oss-20b | nemotron-nano-30b-a3b | GSM8K | 3 |

No se dispone de datos de rendimiento comparativo entre estas variantes. Todas comparten la misma metodologia (DPO con LoRA rango 32) y estan orientadas a estudiar la imitacion de comportamiento en GSM8K.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo listo para produccion. No se ha validado su rendimiento en tareas fuera de GSM8K.
- La licencia no esta especificada, por lo que su uso comercial es incierto y requiere consultar al autor.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un adaptador sobre un modelo base, hereda las limitaciones de `gpt-oss-20b`, que no estan documentadas en esta ficha.
- El adaptador depende del modelo base `gpt-oss-20b`, que es un modelo de pesos abiertos de OpenAI, pero su licencia especifica debe revisarse por separado.
- No se proporcionan datos de rendimiento ni benchmarks, por lo que no es posible evaluar su calidad objetiva.
- El nombre del modelo indica que imita a `olmo-3-7b`, pero no se especifica en que aspectos concretos (estilo de razonamiento, formato de respuesta, etc.), lo que limita su uso en aplicaciones practicas.

## Enlaces

- [HuggingFace - dementor-research/dpo_gsm8k_gpt-oss-20b_as_olmo-3-7b_seed42](https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-20b_as_olmo-3-7b_seed42)
- [Tinker - Thinking Machines](https://thinkingmachines.ai/tinker/)
- [Documentacion de OpenAI sobre gpt-oss-20b](https://developers.openai.com/api/docs/models/gpt-oss-20b)
- [FriendliAI - despliegue de dpo_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed1](https://friendli.ai/models/dementor-research/dpo_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed1)
- [FriendliAI - despliegue de dpo_gsm8k_gpt-oss-20b_as_nemotron-nano-30b-a3b_seed3](https://friendli.ai/models/dementor-research/dpo_gsm8k_gpt-oss-20b_as_nemotron-nano-30b-a3b_seed3)
