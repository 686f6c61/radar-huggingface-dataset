# Remek/basal-omni-1.0-mini-GGUF

## Resumen

basal-omni-1.0-mini-GGUF es la distribucion cuantizada en formato GGUF de basal-omni-1.0-mini, un modelo experimental de 7.463.013.674 parametros construido sobre Gemma 4 E4B y orientado especificamente a la toma de decisiones tipadas (typed decisions) y clasificacion calibrada. Lo desarrolla Remek y se publica bajo licencia Apache 2.0. No es un modelo conversacional de proposito general: el autor lo describe como una "capa de decision" que expone una API de opciones multiples (hasta 255 alternativas) y devuelve probabilidades calibradas sobre cada opcion.

El modelo base se sirve en bf16 mediante el motor propio `basal-serve`, que renderiza un prompt especifico y lee las probabilidades de los codigos de opcion. Esta version GGUF traslada esa misma logica de decision a llama.cpp y Ollama, de modo que puede ejecutarse en GPU NVIDIA, Apple Silicon (Metal) o CPU. Es importante senalar que los ficheros GGUF son solo texto: los encoders de imagen y audio del modelo original no estan incluidos, por lo que para tareas multimodales hay que recurrir al modelo bf16.

La relevancia actual del modelo reside en su enfoque de calibracion certificada: incluye umbrales que permiten automatizar un porcentaje de decisiones con un error objetivo acotado (por ejemplo, el 42,4% de las decisiones con un error observado del 0,7% a un objetivo del 1%). El modelo esta etiquetado como experimental y soporta polaco e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma 4 E4B (arquitectura exacta no disponible en la informacion proporcionada) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como cifra oficial; Ollama limita a 4.096 tokens por prompt en `--mode ollama`; `--mode gguf` admite documentos largos sin cifra publicada |
| Tipos de cuantizacion | Q8_0 (7,9 GB) y Q6_K (6,2 GB); Q5_K_M y Q4_K_M no se distribuyen por no superar el port gate |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con Modelfiles para Ollama; el modelo base en bf16 |
| Tamano del repo | 28,3 GB |
| Descargas | 789 |
| Libreria | gguf |
| Modelo base | Remek/basal-omni-1.0-mini |

## Arquitectura y entrenamiento

La informacion disponible no detalla la composicion del dataset de entrenamiento ni el numero de tokens utilizados, ni si hubo fases de RLHF o DPO. Lo que si se especifica es que el modelo deriva de Gemma 4 E4B y que su proposito es la emision de decisiones tipadas: el servidor `basal-serve` construye un prompt propio, presenta las opciones codificadas y lee las probabilidades asociadas a cada codigo de opcion. Los tipos de consulta soportados incluyen `choice`, `noul`, `score`, `multi`, `act` y `tool`, ademas de tipos de tarea especificos, con un maximo de 255 opciones.

La innovacion tecnica principal es el mecanismo de calibracion. El autor publica `CALIBRATION.gguf.json`, ajustado sobre las lecturas Q8_0 del propio port GGUF, con temperaturas por tipo y por bucket, y umbrales certificados para objetivos de error del 1% y del 5%. El proceso de conversion se realizo con `convert_hf_to_gguf.py` de llama.cpp b11312 sobre el modelo bf16 (solo el decoder de texto, excluyendo encoders de imagen y audio) a F16 y Q8_0, y de F16 a Q6_K con `llama-quantize` sin importance matrix. La conversion en Linux (CUDA) y macOS produce ficheros identicos byte a byte. Segun el autor, llama.cpp tokeniza los prompts de basal exactamente igual que el tokenizer de Hugging Face (2.000 de 2.000 casos).

## Capacidades

- Toma de decisiones tipadas con hasta 255 opciones por consulta, devolviendo probabilidades calibradas por opcion.
- Clasificacion con calibracion certificada: umbrales de error configurables (1% y 5%) que permiten automatizar un subconjunto de decisiones.
- Tipos de consulta especializados: `choice`, `noul`, `score`, `multi`, `act` y `tool`, ademas de tipos de tarea.
- Soporte de tool calling mediante el tipo de consulta `tool`.
- Generacion de texto conversacional (pipeline text-generation), aunque el valor principal esta en la capa de decision.
- Capacidades multilingues limitadas a polaco e ingles.
- Capacidades multimodales (imagen y audio) presentes en el modelo bf16 original, pero ausentes en los ficheros GGUF.
- Integracion con llama.cpp y Ollama a traves de `basal-serve`, con lectura de log-probabilidades.

## Casos de uso

- Enrutamiento de decisiones en pipelines de produccion: el modelo selecciona entre un conjunto acotado de opciones (hasta 255) con probabilidades calibradas, lo que permite derivar automaticamente las decisiones de alta confianza y escalar solo las inciertas. Con el umbral del 1% se automatiza el 42,4% de las decisiones con un error observado del 0,7%.
- Clasificacion de documentos o tickets en categorias predefinidas: el tipo `choice` con calibracion permite asignar etiquetas y medir la confianza, integrable en flujos de triaje donde el coste de un error de clasificacion es alto.
- Seleccion de herramientas en agentes: el tipo `tool` permite que el modelo elija entre funciones disponibles con una distribucion de probabilidad sobre cada una, util para agentes que necesitan decidir que accion ejecutar.
- Moderacion y filtrado con umbral de error controlado: usando `CALIBRATION.gguf.json` se fijan umbrales de 1% o 5% de error para automatizar decisiones de aceptacion o rechazo, dejando el resto a revision humana.
- Puntuacion y ranking de candidatos: el tipo `score` permite puntuar opciones de forma calibrada, aplicable a ranking de respuestas, seleccion de variantes o priorizacion de casos.
- Despliegue en hardware modesto: Q8_0 corre en un Mac de 16 GB y en CPU, lo que permite integrar la capa de decision en entornos sin GPU dedicada o en el borde.
- Evaluacion de decisiones multiples en encuestas o formularios: el tipo `multi` admite seleccion de varias opciones con probabilidades por opcion, util para anotacion asistida y control de calidad.

## Benchmarks y rendimiento

Los datos publicados comparan los ficheros GGUF contra el modelo bf16 servido en `--mode eager`, sobre el conjunto de desarrollo dev v2 (10.606 decisiones), en una RTX PRO 6000 de 96 GB con CUDA y `--mode gguf` (llama.cpp b11312 via llama-cpp-python 0.3.36). El port gate exige: agreement en 2-10 opciones >= 0,9161; agreement donde el margen de bf16 >= 0,2 >= 0,9858; precision dentro de 1 punto; ECE como maximo +0,01.

| Fichero | Tamano | Agreement (2-10 opciones) | Margen >= 0,2 | Precision | ECE | Decisiones/s (16 en vuelo) | Gate |
|---|---|---|---|---|---|---|---|
| Q8_0 (recomendado) | 7,9 GB | 0,9871 | 0,9977 | -0,06 pt | -0,0001 | 16,4 | PASS |
| Q6_K (menor) | 6,2 GB | 0,9709 | 0,9932 | +0,05 pt | -0,0053 | 14,4 | PASS |
| F16 (referencia, no distribuido) | 14,9 GB | 0,9949 | 0,9999 | no disponible | no disponible | no disponible | no aplica |

Resultados adicionales:

| Entorno | Configuracion | Agreement | Margen >= 0,2 | Precision | Rendimiento |
|---|---|---|---|---|---|
| Apple M4 Pro (Metal) | Q8_0, 2.000 decisiones | 0,9887 | 0,9992 | +0,13 pt | 1,2 decisiones/s en proceso |
| Ollama 0.35.0 | Q8_0, 300 decisiones, hasta 10 opciones | 0,9800 | 0,9961 | +0,33 pt | 2,1 decisiones/s |

Automatizacion con `CALIBRATION.gguf.json` (ajustado sobre Q8_0 en `--mode gguf`, test de calibracion de 8.560 decisiones, precision 0,882): con objetivo de error del 1% se decide automaticamente el 42,4% de las decisiones (error observado 0,7%); con objetivo del 5%, el 78,3% (error observado 3,9%).

El autor indica que los resultados de benchmark del modelo base (Werdykt v1 0,769, conjuntos en polaco e ingles) estan publicados en la ficha de basal-omni-1.0-mini y que estos ficheros GGUF no se puntuan por separado en ellos.

## Requisitos de hardware

- VRAM estimada: Q8_0 ocupa 7,9 GB y Q6_K 6,2 GB en disco; la memoria en ejecucion es algo superior y depende de la longitud del estado (el autor advierte que estados largos necesitan mas memoria).
- GPU recomendadas: NVIDIA con CUDA (llama-cpp-python compilado con CUDA); los benchmarks se midieron en una RTX PRO 6000 de 96 GB. En Apple Silicon se usa Metal.
- Consumer GPU: Q8_0 cabe en GPUs de 8-12 GB de VRAM; en Apple Silicon, Q8_0 corre en un Mac de 16 GB.
- CPU: soportado por llama.cpp, con rendimiento no especificado.
- Despliegue: `basal-serve` en `--mode gguf` (llama.cpp en proceso), `--mode ollama` (frente a Ollama 0.35 o superior) o `--mode llamacpp`. Requiere basal engine 2.2.0 o superior con el extra `gguf` y llama-cpp-python 0.3.36 o superior.
- Throughput medido: 16,4 decisiones/s en Q8_0 y 14,4 en Q6_K con 16 peticiones en vuelo en RTX PRO 6000; 1,2 decisiones/s en proceso con Metal en M4 Pro; 2,1 decisiones/s con Ollama.
- Limitaciones por modo: Ollama admite como maximo 20 opciones por pregunta (devuelve hasta 20 log-probabilidades) y 4.096 tokens por prompt; para documentos largos y hasta 255 opciones hay que usar `--mode gguf`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La comparativa se limita a las variantes del propio modelo y a la referencia bf16:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| basal-omni-1.0-mini-GGUF Q8_0 | 7,46 B | no disponible | GGUF | Apache 2.0 | Port de decision, solo texto, 7,9 GB |
| basal-omni-1.0-mini-GGUF Q6_K | 7,46 B | no disponible | GGUF | Apache 2.0 | Port de decision, solo texto, 6,2 GB |
| basal-omni-1.0-mini (bf16) | 7,46 B | no disponible | bf16 | Apache 2.0 | Incluye encoders de imagen y audio; referencia de calibracion |
| Gemma 4 E4B (base) | no disponible | no disponible | no disponible | no disponible | Arquitectura base del modelo |

## Limitaciones y advertencias

- Modelo etiquetado como experimental por el propio autor; no debe tratarse como un modelo de proposito general validado para produccion sin evaluacion propia.
- Solo texto en los ficheros GGUF: los encoders de imagen y audio no estan incluidos; para multimodalidad hay que usar el modelo bf16.
- Idiomas limitados a polaco e ingles; el rendimiento en castellano no esta documentado.
- La calibracion distribuida esta ajustada para un unico orden de opciones (el orden por defecto); cambiar el orden invalida los umbrales certificados.
- Las cuantizaciones Q5_K_M y Q4_K_M no se distribuyen porque no superan el port gate de fidelidad respecto a bf16.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modelo esta disenado para elegir entre opciones, no para generar texto libre fiable.
- En modo Ollama hay limites duros: maximo 20 opciones por pregunta y 4.096 tokens por prompt.
- El rendimiento en CPU no se ha publicado.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Gemma 4 E4B conviene verificar las condiciones de la licencia del modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Remek/basal-omni-1.0-mini-GGUF
- Modelo base: https://huggingface.co/Remek/basal-omni-1.0-mini
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Tag de release del motor: https://github.com/rkinas/basal/archive/refs/tags/v2.5.0.tar.gz
