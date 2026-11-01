# fbaldassarri/meta-llama_Llama-3.1-8B-auto_round-int4-gs64-sym

## Resumen

Esta ficha describe `fbaldassarri/meta-llama_Llama-3.1-8B-auto_round-int4-gs64-sym`, una cuantizacion INT4 de pesos (weights-only quantization, WoQ) del modelo `meta-llama/Llama-3.1-8B` de Meta, publicada por el usuario fbaldassarri. No es un modelo nuevo: es un artefacto derivado que conserva la arquitectura, el tokenizador y el conocimiento del original, pero reduce la precision de los pesos a 4 bits con granularidad de grupo de 64 y esquema simetrico, empleando el algoritmo AutoRound (SignRound) de Intel en su version 0.16.0.

El objetivo es claro: abaratar la inferencia del Llama 3.1 8B en hardware modesto, con especial enfasis en CPU Intel, iGPU Arc mediante intel-extension-for-pytorch y NPU de la serie Core Ultra via OpenVINO. El autor declara una aceleracion de 2-3x y una ligera perdida de precision en la configuracion W4G64, algo esperable en cuantizacion de 4 bits con grupo pequeno.

Es relevante ahora porque permite desplegar un modelo de 8B parametros con licencia Llama 3.1 en equipos sin GPU dedicada, y porque el repositorio documenta de forma inusualmente detallada el proceso de cuantizacion (semillas de calibracion, iteraciones, duracion), lo que facilita la reproducibilidad. Conviene senalar una discrepancia importante: aunque el nombre indica 8B, el campo `safetensors` del repositorio reporta 2.046.038.016 parametros, un dato incoherente con el modelo base que el lector debe verificar antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Llama 3.1), pesos cuantizados a INT4 |
| Parametros totales | 2.046.038.016 segun metadatos del repo (incoherente con el nombre 8B; el modelo base declara 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero no se confirma para esta cuantizacion) |
| Tipos de cuantizacion | INT4, group size 64, simetrica, WoQ (SignRound / AutoRound) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (libreria transformers, formato auto_round) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only causal con atencion por cabezas agrupadas (GQA) y activaciones SwiGLU, tal como define Meta en su familia Llama 3.1. Esta version no reentrena ni modifica la topologia: solo sustituye los pesos en bfloat16 por pesos INT4 simetricos agrupados de 64 en 64, manteniendo el resto de componentes (embeddings, capas normalizacion, cabezas) en el formato que permita el runtime.

El proceso de cuantizacion es de tipo weights-only (WoQ) con el algoritmo AutoRound de Intel, que ajusta los parametros de redondeo mediante optimizacion durante la calibracion en lugar de usar redondeo simple. La receta documentada es: carga del modelo base en `torch.bfloat16`, calibracion en CPU con 128 muestras, 200 iteraciones de tuning, longitud de secuencia 512 y batch de 4, ejecutada con auto-round 0.16.0, transformers 4.55.3 y torch 2.14.1+cpu. La cuantizacion tardo 42.155,7 segundos (unas 11,7 horas) y finalizo el 2026-10-23. No se documenta ningun entrenamiento adicional, RLHF ni DPO: es exclusivamente un proceso de compresion post-entrenamiento.

## Capacidades

- Generacion de texto y completado autoregresivo: es un modelo base (completion), no un modelo de chat instruido, por lo que se le debe alimentar con texto bruto.
- Razonamiento y conocimiento general heredados del Llama 3.1 8B original, sujetos a la degradacion propia del W4G64.
- Generacion de codigo y matematicas basicas, en la medida en que el modelo base las soporta.
- Capacidades multilingues limitadas a los ocho idiomas declarados: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- No se documenta soporte de tool calling ni function calling en esta model card.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No hay modo thinking, vision ni audio: es un modelo puramente textual.
- Inferencia optimizada para CPU Intel, iGPU Arc y NPU Core Ultra.

## Casos de uso

- Prototipado local en portatiles sin GPU dedicada: al estar cuantizado a INT4 y orientado a CPU/NPU Intel, permite ejecutar un Llama 3.1 8B en equipos con Core Ultra y OpenVINO, ideal para demos y pruebas de concepto.
- Generacion de texto por lotes en servidores CPU: el autor declara 2-3x de aceleracion frente al modelo en bfloat16, lo que lo hace util para tareas de completado, resumen o extraccion sobre grandes volumenes de texto en infraestructura sin acelerador.
- Completado de codigo en entornos de desarrollo: al ser un modelo base, puede usarse como motor de autocompletado si se le alimenta con contexto de codigo, aunque sin el ajuste instruido del modelo original.
- Preprocesamiento y etiquetado de datos multilingues: cubre ocho idiomas y puede clasificar, resumir o reescribir textos en pipelines de datos antes de un modelo mayor.
- Despliegue en edge y dispositivos con NPU: el soporte via OpenVINO para NPU de Core Ultra permite integrarlo en aplicaciones de escritorio con bajo consumo.
- Base para experimentos de cuantizacion y evaluacion: el repositorio documenta la receta completa, por lo que sirve como referencia reproducible para comparar tecnicas WoQ en Llama 3.1 8B.
- Educacion e investigacion: util para estudiar el impacto del W4G64 en la calidad de un modelo de 8B sin necesidad de GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una aceleracion de 2-3x y una "ligera perdida de precision" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni perplejidad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con pesos INT4 de un modelo de 8B se espera un footprint de aproximadamente 4-5 GB, pero el dato no se confirma en la informacion proporcionada.
- GPU recomendadas: el autor orienta el artefacto a CPU Intel, iGPU Arc (por ejemplo Core Ultra 185H) y NPU Core Ultra; no se mencionan GPU NVIDIA o AMD como objetivo principal, aunque el pipeline permite opciones `--cuda` y `--rocm`.
- Cabe en GPU consumer: no confirmado; por tamano de pesos INT4 deberia caber en GPUs con 8 GB o mas, pero no hay validacion documentada.
- Opciones de despliegue: transformers con `device_map="auto"`, intel-extension-for-pytorch (CPU/iGPU Arc), OpenVINO (NPU Core Ultra), y text-generation-inference segun los tags del repo.
- Latencia y throughput: no se publican cifras absolutas; solo la relacion 2-3x frente a la version en bfloat16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Llama 3.1 8B AutoRound INT4) | 8B (metadatos del repo: 2,05B, dato incoherente) | No disponible | INT4, gs64, simetrica | Llama 3.1 Community | HuggingFace |
| meta-llama/Llama-3.1-8B (original) | 8B | 128K | bfloat16 | Llama 3.1 Community | HuggingFace |
| Otras cuantizaciones INT4 de Llama 3.1 8B (GPTQ, AWQ) | 8B | 128K | INT4 (gs variable) | Llama 3.1 Community | HuggingFace |
| Llama 3.1 8B Instruct | 8B | 128K | bfloat16 | Llama 3.1 Community | HuggingFace |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento de este artefacto frente a alternativas de otros fabricantes. La diferencia clave frente al original es el formato INT4 y la orientacion a hardware Intel; frente a otras cuantizaciones INT4, el algoritmo AutoRound y el group size 64 determinan el equilibrio precision/velocidad, pero sin benchmarks publicados no puede cuantificarse la diferencia.

## Limitaciones y advertencias

- Discrepancia de parametros: los metadatos del repositorio indican 2.046.038.016 parametros, muy lejos de los 8B del modelo base; hay que verificar la integridad del artefacto antes de usarlo.
- Es un modelo base, no instruido: no sigue instrucciones de forma fiable ni mantiene formato de chat; requiere prompting de completado.
- Perdida de precision por cuantizacion: el autor admite una ligera caida de calidad en W4G64, sin cuantificar; en tareas sensibles (matematicas, codigo, razonamiento largo) el deterioro puede ser mayor.
- Riesgo de alucinacion inherente al modelo base Llama 3.1, no mitigado por esta cuantizacion.
- Sesgos conocidos del Llama 3.1 original, que se heredan sin cambios.
- Cobertura linguistica limitada a ocho idiomas; el rendimiento en espanol no esta validado especificamente.
- Restricciones de licencia: Llama 3.1 Community License impone condiciones de uso comercial, atribucion y politicas de uso aceptable; es necesario revisar el texto completo antes de desplegar en produccion.
- El autor declara el artefacto solo para fines de investigacion y sin garantia.
- No hay benchmarks ni validacion de calidad publicados, por lo que no se recomienda su uso en produccion sin una evaluacion propia.
- El repositorio tiene muy pocas descargas y ningun "like", lo que reduce la senal de validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Intel AutoRound: https://github.com/intel/auto-round
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Pipeline de cuantizacion citado por el autor: https://git.epicdynamic.com/auto-round-pipeline
