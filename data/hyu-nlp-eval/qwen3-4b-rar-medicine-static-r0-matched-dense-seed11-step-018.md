# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-018

## Resumen

Este repositorio contiene un checkpoint de ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario HYU-NLP-EVAL bajo el identificador `qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-018`. Según la model card, se trata del paso 18 de una ejecución de investigación denominada `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`, con pesos en BF16 listos para inferencia y un subdirectorio `original_checkpoint/` con los ficheros de checkpoint originales en formato veRL (solo parámetros del modelo). Es, por tanto, un artefacto intermedio de un proceso de entrenamiento (probablemente RL con veRL) orientado al dominio médico, no un modelo final pulido ni documentado para producción.

El modelo hereda la arquitectura y las capacidades de Qwen3-4B-Instruct-2507: un transformer decoder-only denso de 4.022.468.096 parámetros (≈4,02 B), publicado con licencia Apache 2.0. El nombre del checkpoint sugiere una comparación "matched dense" frente a variantes con arquitectura MoE dentro de la misma campaña experimental, con semilla 11, pero la model card no aporta detalles sobre el dataset, el algoritmo de entrenamiento ni las métricas obtenidas.

Su relevancia es acotada y de carácter metodológico: sirve para reproducir y auditar experimentos de ajuste fino sobre dominio médico, así como para estudiar trayectorias de entrenamiento intermedias (el paso 18 es claramente temprano). No hay resultados de benchmarks, ni número de descargas, ni documentación de uso previsto más allá de la indicación "Research use only" de la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3; dato heredado del modelo base Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (≈4,02 B), dato real de los ficheros safetensors |
| Parametros activos | No aplica: el checkpoint es denso, no MoE |
| Longitud de contexto | No documentada para este checkpoint. El modelo base Qwen3-4B-Instruct-2507 declara soporte nativo de contexto largo (hasta 262.144 tokens) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en BF16; no incluye GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base se distribuye como multilingue) |
| Licencia | apache-2.0 (la model card anade la restriccion "Research use only") |
| Formato de pesos | safetensors (BF16) para inferencia; `original_checkpoint/` en formato de checkpoint de veRL |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (ajuste fino) |
| Pipeline declarado | text-generation (conversacional) |
| Libreria | transformers |
| Tamano del repositorio | 25,7 GB |
| Fecha de creacion / actualizacion | 2026-10-01 / 2026-10-01 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only denso de la familia Qwen3, con alrededor de 4.000 millones de parametros y atencion con query-key normalizacion y grouped-query attention, segun la documentacion publica de Qwen3. Al ser un checkpoint denso (y no una variante MoE), todos los parametros se activan en cada token generado. El autor no publica en esta ficha el numero de capas, la dimension oculta ni la configuracion exacta de cabezas de atencion, por lo que esos detalles se consideran no disponibles a nivel de este repositorio.

Respecto al entrenamiento, la informacion disponible es minima: la model card indica que el checkpoint corresponde al paso 18 de la ejecucion `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`, que los pesos de inferencia estan en BF16 y que el directorio `original_checkpoint/` conserva los ficheros originales de veRL (solo parametros). El prefijo "medicine" apunta a un ajuste sobre datos del dominio medico y "matched dense" sugiere un diseno experimental emparejado frente a otras variantes de la misma campaña. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o RL con funciones de recompensa verificables. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla de lo que hereda del modelo base.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` con etiqueta `conversational`, por lo que el checkpoint esta preparado para completar dialogos e instrucciones en formato chat.
- Razonamiento e instrucciones: hereda del modelo base Qwen3-4B-Instruct-2507 la capacidad de seguir instrucciones complejas, si bien el ajuste especifico del que procede este checkpoint esta orientado al dominio medico.
- Conocimiento de dominio medico: el nombre de la ejecucion ("rar-medicine") indica que el ajuste se realizo sobre datos biomedicos o clinicos, aunque no se detalla el corpus ni las tareas concretas cubiertas.
- Capacidades multilingues: no documentadas para este checkpoint; el modelo base se distribuye como multilingue.
- Tool calling / function calling: no documentado en esta ficha; el modelo base de la familia Qwen3-Instruct-2507 si declara soporte de llamadas a herramientas.
- Modo de razonamiento explicito (thinking mode): no documentado; la serie Qwen3-Instruct-2507 del modelo base esta disenada para operar sin modo de pensamiento explicito separado.
- Capacidades de vision o audio: no disponibles. El repositorio solo declara `text-generation`.
- Uso como checkpoint de investigacion: permite inspeccionar un estado intermedio de entrenamiento (paso 18) con pesos completos de inferencia en BF16.

## Casos de uso

- Auditoria de experimentos de ajuste fino: el checkpoint permite reconstruir y verificar la trayectoria de la ejecucion `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11` comparando el paso 18 con el modelo base y con otros pasos de la misma campaña.
- Comparacion densa frente a MoE: dado el sufijo "matched dense", el artefacto esta pensado para contrastar el comportamiento de una variante densa con variantes de mezcla de expertos entrenadas bajo el mismo presupuesto y semilla, en el contexto de una evaluacion controlada.
- Investigacion en PNL clinica: generacion y analisis de texto medico (resumenes de historiales, extraccion de entidades, respuesta a preguntas sobre literatura biomedica) en un entorno de laboratorio y sin uso clinico real.
- Generacion de datos sinteticos medicos para experimentos: produccion de corpus sinteticos de apoyo a la investigacion, siempre que se aplique una revision experta posterior por el riesgo de alucinacion en dominio sanitario.
- Estudios de robustez y sesgo en dominio sanitario: analisis de como un ajuste temprano sobre datos medicos altera sesgos, cobertura terminologica y comportamiento ante preguntas ambiguas.
- Base para ablaciones de hiperparametros: al tratarse de un paso intermedio, es util como punto de partida para estudiar el efecto del numero de pasos, la semilla o la mezcla de datos en el rendimiento final.
- Despliegue en pruebas de integracion con vLLM o TGI: el repositorio esta etiquetado como compatible con endpoints y con text-generation-inference, por lo que puede levantarse como servicio interno para validar latencia y throughput antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, MedQA, MedMCQA, HumanEval, GSM8K ni ninguna otra), y la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo: los enlaces recuperados corresponden a una profesional sanitaria ajena al proyecto y no aportan informacion tecnica.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 8,1 GB solo para los pesos (4.022.468.096 parametros × 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda reservar entre 10 y 12 GB para contextos cortos.
- Cache KV en contextos largos: el modelo base soporta hasta 262.144 tokens, y atender esa ventana completa exige decenas de gigabytes adicionales de memoria, por lo que conviene usar motores con PagedAttention y, si es necesario, cuantizacion del cache KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para servir varias peticiones concurrentes o contextos muy largos; RTX 4090 o RTX 3090 (24 GB) son suficientes para inferencia BF16 en contextos moderados.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti Super (16 GB) en BF16. En tarjetas de 8 GB o menos seria necesario cuantizar (por ejemplo a 8 o 4 bits), conversion no incluida en el repositorio.
- Opciones de despliegue: `transformers` (libreria declarada), vLLM, SGLang y TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`). El uso con llama.cpp, Ollama o LM Studio requiere convertir previamente los pesos a GGUF, tarea que no aporta el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-...-step-018 | 4,02 B (denso) | No documentado en este checkpoint (el base declara 262.144 tokens) | Apache 2.0, con nota "Research use only" | HuggingFace, 0 descargas | No disponible |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B (denso) | 262.144 tokens | Apache 2.0 | HuggingFace, ampliamente distribuido | Publicado por el autor del modelo base |
| Llama-3.1-8B-Instruct | 8 B (denso) | 128.000 tokens | Llama 3.1 Community License | HuggingFace | Publicado por el autor |
| Gemma-3-4B-it | 4 B (denso) | 128.000 tokens | Terminos de uso de Gemma | HuggingFace | Publicado por el autor |
| Phi-4-mini-instruct | 3,8 B (denso) | 128.000 tokens | MIT | HuggingFace | Publicado por el autor |

La comparacion se limita a parametros, contexto, licencia y disponibilidad: no hay datos de rendimiento de este checkpoint que permitan contrastarlo con las alternativas. Para cualquier evaluacion cuantitativa seria necesario ejecutar los benchmarks sobre el propio modelo.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 18 de una ejecucion de investigacion; no es un modelo final y su calidad esta, previsiblemente, por debajo de la del modelo base ya ajustado.
- Restriccion de uso: la model card indica explicitamente "Research use only", lo que en la practica limita su empleo en produccion o en entornos clinicos aunque la licencia declarada sea Apache 2.0. Conviene aclarar la contradiccion con el titular de los derechos antes de cualquier uso comercial.
- Riesgo de alucinacion elevado en dominio sanitario: un ajuste temprano sobre datos medicos puede producir afirmaciones clinicas plausibles pero incorrectas. No debe usarse para diagnostico, triaje, recomendacion terapeutica ni informacion a pacientes.
- Sesgos: no se documenta composicion del dataset ni analisis de sesgos, por lo que se desconocen sesgos demograficos, geograficos o de idioma inducidos por el ajuste.
- Idiomas: no se especifica que lenguas cubre el ajuste; es probable que el corpus medico utilizado este mayoritariamente en ingles, lo que degradaria el rendimiento en castellano.
- Contexto: el modelo base soporta ventanas muy largas, pero no hay verificacion de que el ajuste conserve ese comportamiento, ni de la calidad de recuperacion de informacion en posiciones intermedias de la ventana.
- Ausencia de documentacion de entrenamiento: sin numero de tokens, mezcla de datos ni detalles del algoritmo, es imposible reproducir el experimento a partir de la ficha.
- Trazabilidad: 0 descargas y 0 likes, sin paper, blog ni repositorio asociado; no hay validacion externa del artefacto.
- Integridad del repositorio: el directorio `original_checkpoint/` contiene solo parametros del modelo (no estado del optimizador), lo que limita la reanudacion exacta del entrenamiento.
- Empaquetado: no se ofrecen cuantizaciones, por lo que el despliegue en hardware modesto requiere trabajo adicional de conversion y validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-018
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo (papers, blogs, repositorios o demos). Los resultados obtenidos correspondian a contenidos sin relacion con el proyecto.
