# SaturnHeaven/Gemma-4-Queen-31B-it-uncensored-heretic-lora-GGUF

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA en formato GGUF de rango 64 para el modelo base aifeifei798/Gemma-4-Queen-31B-it. Lo publica el usuario SaturnHeaven y su funcion es aplicar una "abliteracion" (supresion de mecanismos de rechazo) sobre el modelo base sin modificar sus pesos originales: el adaptador se carga de forma opcional en tiempo de inferencia y puede desactivarse para recuperar el comportamiento intacto del base.

El adaptador es una aproximacion de bajo rango del delta de abliteracion entre el modelo base y la version ya abliterada llmfan46/Gemma-4-Queen-31B-it-uncensored-heretic. Ese delta se calculo con la herramienta Heretic v1.2.0 mediante el metodo Arbitrary-Rank Ablation (ARA) sobre la componente attn.o_proj, y aqui se trunca a rango 64 mediante SVD. El resultado tiene 28,7 millones de parametros y ocupa 57,3 MB en F16 o 30,5 MB en Q8_0.

Es relevante dentro del nicho de modelos "uncensored" orientados a roleplay y escritura creativa: cuando una escena exige descripciones mas duras, violentas o explicitas, el fine-tune base tiende a rechazar, anadir avisos o salir del personaje, y el adaptador evita ese comportamiento. Su enfoque modular (adaptador separable con escala ajustable) es su principal diferencia frente a publicar un modelo completo reentrenado. No hay pipeline, idiomas ni benchmarks declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) de rango 64 sobre attn.o_proj; el modelo subyacente es un transformer (Gemma) |
| Parametros totales | 28.672.000 (28,7 M) en el adaptador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16 (57,3 MB) y Q8_0 (30,5 MB) en el adaptador; los pesos base se cuantizan aparte |
| Idiomas soportados | No disponible (heredados del modelo base, sin declarar) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA); rango r=64, alpha=64 |

## Arquitectura y entrenamiento

El adaptador no procede de un entrenamiento supervisado clasico ni de RLHF/DPO. Es el truncamiento SVD de rango 64 del delta de abliteracion `ΔW = W_heretic − W_original` calculado sobre los pesos de `attn.o_proj` de las capas 26 a 55 (30 capas). El delta original se obtuvo con Heretic v1.2.0 aplicando Arbitrary-Rank Ablation, con estos hiperparametros: `start_layer_index=26`, `end_layer_index=56` (exclusivo), `preserve_good_behavior_weight=0.8555`, `steer_bad_behavior_weight=0.0005`, `overcorrect_relative_weight=0.9911` y `neighbor_count=15`. El autor indica explicitamente que el adaptador no se genero ejecutando Heretic/ARA directamente, sino aproximando el resultado ya publicado.

La fidelidad de la reconstruccion esta documentada con mediciones sobre los pesos del adaptador desquantizados (Q8 y F16 son equivalentes a estos efectos). La energia de `ΔW` preservada es del 97,95 % de media en las 30 capas (rango por capa 94,1–99,8 %), con un residuo de Frobenius relativo agrupado del 10,68 %. El error absoluto maximo de reconstruccion es 3,42e-3 y el RMS 6,10e-5, en unidades de `ΔW`. La discrepancia entre ambas cifras de energia se explica porque la primera es una media aritmetica por capa y la segunda esta ponderada por energia, de modo que las capas con mayor norma de `ΔW` se preservan mejor. El delta esta dominado por una unica direccion: la direccion singular principal captura de media el 95,46 % de la energia de `ΔW` (rango por capa 91,0–98,6 %). Los valores de divergencia KL (0,0707) y de rechazos (12/100 frente a 99/100) fueron medidos sobre el modelo fuente completo, no sobre este adaptador.

## Capacidades

- Roleplay y escritura creativa sin interrupciones: mantiene al personaje en escenas con contenido oscuro, violento o explicito donde el base tiende a rechazar o a salir del personaje.
- Supresion de rechazos y de avisos: segun el autor, los prompts que el base rechaza se responden al aplicar el adaptador.
- Ajuste de intensidad en tiempo de ejecucion: gracias a `--lora-scaled`, el efecto actua como un mando de intensidad monotono (0,25 todavia rechaza en su prueba; 0,5 responde con avisos abundantes; 0,75 con un aviso breve; 1,0 responde sin reservas).
- Composicion con cualquier cuantizacion GGUF del modelo base, sin necesidad de reexportar el modelo completo.
- Reversion exacta: al omitir el adaptador, el modelo base se restaura sin cambios.
- Generacion de texto general, codigo, matematicas, vision y tool calling: no disponible en la informacion proporcionada (dependen del modelo base, no documentados en esta ficha).
- Capacidades multilingues: no disponibles.
- Modo "thinking", audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Roleplay de ficcion adulta: el adaptador permite mantener conversaciones multi-turno con contenido explicito sin que el modelo introduzca avisos o rompa el personaje, que es el escenario para el que fue disenado explicitamente.
- Narrativa de genero negro o terror: escenas con violencia explicita que el fine-tune base suaviza o rechaza pueden desarrollarse sin interrupciones narrativas.
- Ajuste fino del tono de un asistente de escritura: cargando el adaptador con escala 0,5 o 0,75 se obtiene un punto intermedio entre rechazo y respuesta directa, util para calibrar el grado de explicitud de un asistente creativo.
- Experimentacion en investigacion sobre alineacion y abliteracion: al ser una aproximacion de bajo rango con metricas de fidelidad publicadas, sirve para estudiar como se propaga la supresion de rechazos y cuanto se conserva del comportamiento original.
- Evaluacion comparativa de tecnicas de abliteracion: permite contrastar el resultado de ARA truncado a rango 64 frente al modelo fuente completo, con el mismo base y sin modificar pesos.
- Despliegue modular en produccion creativa: al ser un fichero de 30-57 MB, se puede versionar y conmutar por peticion o por perfil de usuario en un servidor llama.cpp, sin duplicar los pesos base.
- Ahorro de almacenamiento y ancho de banda: en lugar de distribuir una copia completa del modelo abliterado, se distribuye unicamente el delta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia cuantitativa son las metricas de fidelidad de reconstruccion y los datos de rechazo del modelo fuente, que se recogen a continuacion. Los valores de KL y rechazos corresponden al modelo fuente completo, no a este adaptador.

| Metrica | Valor |
|---|---|
| Parametros totales (adaptador) | 28,7 M |
| Energia de `ΔW` preservada (media de 30 capas) | 97,95 % |
| Energia de `ΔW` preservada (rango por capa) | 94,1–99,8 % |
| Residuo de Frobenius relativo agrupado | 10,68 % |
| Error maximo absoluto de reconstruccion (unidades de `ΔW`) | 3,42e-3 |
| Error RMS de reconstruccion (unidades de `ΔW`) | 6,10e-5 |
| Energia capturada por la direccion singular principal (media) | 95,46 % |
| Divergencia KL (modelo fuente, no el adaptador) | 0,0707 |
| Rechazos (modelo fuente: 12/100 frente a 99/100 del base) | 12/100 |

## Requisitos de hardware

- El adaptador en si anade un coste de memoria despreciable: 57,3 MB en F16 o 30,5 MB en Q8_0, mas el overhead de las capas LoRA en atencion.
- El requisito real de VRAM lo determina el modelo base de ~31B (segun la denominacion del repositorio; el recuento exacto de parametros del base no esta disponible en la informacion proporcionada), no el adaptador.
- VRAM estimada del base: no disponible en la informacion proporcionada. Dependera de la cuantizacion GGUF elegida (el ejemplo de uso cita un fichero Q4_K_M del base).
- GPU recomendadas para el base: no disponibles en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible; dependera del tamano y la cuantizacion del modelo base, no del adaptador.
- Despliegue: llama.cpp / llama-server, con los flags `--lora` (escala 1,0 por defecto) o `--lora-scaled <fichero>:<escala>`. Otros motores no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| SaturnHeaven/...herotic-lora-GGUF (este) | Adaptador LoRA GGUF r64 | 28,7 M | No disponible | Apache-2.0 | Aproximacion de bajo rango, escala ajustable, base intacto |
| aifeifei798/Gemma-4-Queen-31B-it | Modelo base completo | No disponible | No disponible | Apache-2.0 (segun esta ficha) | Fine-tune RP; conserva rechazos y avisos |
| llmfan46/Gemma-4-Queen-31B-it-uncensored-heretic | Modelo completo abliterado | No disponible | No disponible | Apache-2.0 (segun esta ficha) | Fuente del delta; KL 0,0707 y 12/100 rechazos |
| google/gemma-4-31B-it | Modelo upstream | ~31B (por denominacion) | No disponible | Apache-2.0 (segun esta ficha) | Origen de la familia, no abliterado |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a tipo de artefacto y licencia.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin los pesos GGUF del modelo base no puede ejecutarse. El repositorio solo contiene los dos ficheros de adaptador.
- Aproximacion, no reconstruccion exacta: se trata de un truncamiento SVD de rango 64, con un 10,68 % de residuo de Frobenius relativo agrupado, por lo que el comportamiento puede diferir del modelo fuente completo.
- Comportamiento de rechazo no medido en el adaptador: los valores de 12/100 rechazos y KL 0,0707 son del modelo fuente; el autor solo hizo comprobaciones puntuales y no ejecuto un benchmark sistematico de rechazos sobre el adaptador.
- Contenido no filtrado: la supresion de rechazos implica que las salidas no estan moderadas y pueden incluir material violento, sexual o danino. No es adecuado para aplicaciones orientadas a publico general ni sin capas de filtrado externas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al alterar pesos de atencion cabe esperar degradacion adicional no medida.
- Sesgos: no documentados; se heredan los del modelo base y el proceso de abliteracion puede modificar comportamientos mas alla del rechazo.
- Idiomas y contexto: no declarados; dependen del modelo base y no se detallan aqui.
- Licencia: Apache-2.0 para el adaptador, con el mismo regimen que el base y el modelo fuente segun sus fichas. La reutilizacion comercial dependera tambien de los terminos aplicables al modelo base y a los datos de entrenamiento subyacentes, que no se detallan en esta informacion.
- Datos de la ficha potencialmente inconsistentes: la fecha de creacion indicada (2026-10-06) y la existencia de un modelo "Gemma-4-31B-it" no se han podido verificar con fuentes independientes en la busqueda web; el recuento real de parametros del base tampoco aparece en el repositorio.
- Repositorio practicamente sin traccion: 0 descargas y 0 likes, sin pipeline ni idiomas declarados.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/SaturnHeaven/Gemma-4-Queen-31B-it-uncensored-heretic-lora-GGUF
- Modelo base: https://huggingface.co/aifeifei798/Gemma-4-Queen-31B-it
- Modelo fuente abliterado: https://huggingface.co/llmfan46/Gemma-4-Queen-31B-it-uncensored-heretic
- Herramienta de abliteracion Heretic: https://github.com/p-e-w/heretic
- Modelo upstream: https://huggingface.co/google/gemma-4-31B-it

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden unicamente de la model card y de los metadatos del repositorio.
