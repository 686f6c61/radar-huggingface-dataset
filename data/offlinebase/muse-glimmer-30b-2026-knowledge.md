# OfflineBase/Muse-Glimmer-30B-2026-Knowledge

## Resumen

Muse Glimmer 30B 2026 Knowledge (etiquetado internamente como stage-b-r30b) es un ajuste fino de la comunidad sobre el modelo base Muse Glimmer 30B de Meta, desarrollado por OfflineBase. Su proposito es ampliar el conocimiento del modelo base, que tiene un corte de conocimiento del 4 de enero de 2026, con noticias y eventos ocurridos entre esa fecha y el 29 de octubre de 2026, ademas de mejorar la calibracion de la incertidumbre para que el modelo admita con mas frecuencia cuando no sabe algo. No es un lanzamiento oficial de Meta ni esta revisado o respaldado por la compania.

El modelo mantiene la arquitectura y el tamano del base: 29.776.626.688 parametros totales (aproximadamente 30B), pesos en safetensors, biblioteca transformers y pipeline de text-generation. El repositorio ocupa 59,6 GB e incluye los pesos fusionados en BF16 con los mismos nombres y formas de tensor que el modelo original, lo que permite seguir ajustandolo o servirlo directamente.

Es relevante ahora porque aborda un problema practico de los modelos con corte de conocimiento fijo: la obsolescencia de la informacion. El ajuste demuestra que es posible inyectar conocimiento reciente mediante LoRA fusionado sin destruir las capacidades de razonamiento ni los hechos previos del base, aunque con limitaciones importantes en cuanto a alucinacion y falsas premisas que se detallan mas abajo. La licencia combina Apache 2.0 con las condiciones de la Muse Model License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del base Muse Glimmer 30B; no se detalla en la informacion disponible) |
| Parametros totales | 29.776.626.688 (aproximadamente 30B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos fusionados en el repo); GGUF con Q4_K_M (16,9 GB) e IQ2_XXS (7,96 GB) en repo separado; bnb-4bit para QLoRA |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0-and-muse-model-license (Apache 2.0 mas condiciones de la Muse Model License) |
| Formato de pesos | safetensors (BF16); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Muse Glimmer 30B de Meta mediante LoRA fusionado en los pesos originales. Los pesos resultantes conservan los mismos nombres y formas de tensor que el base, lo que facilita su uso con transformers y su reajuste posterior. No se especifica en la informacion disponible el tipo exacto de atencion ni si emplea innovaciones como decodificacion especulativa o atencion lineal.

El entrenamiento se centro en dos objetivos. Primero, ampliar el conocimiento con noticias y eventos del 4 de enero al 29 de octubre de 2026, usando el dataset OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data. Segundo, ensenar al modelo a decir "no lo se" con mas frecuencia cuando no dispone de la informacion. El autor indica que el ajuste se construyo con Muse Spark Open y que el modelo base conoce el mundo hasta el 4 de enero de 2026. No se detalla el numero de tokens de entrenamiento ni la composicion completa del dataset, ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multi-paso: con razonamiento activado resuelve 147 de 150 problemas multi-paso segun el autor (el base resuelve 150).
- Conocimiento actualizado de eventos de 2026: 69,1% en 246 preguntas sobre titulares de 2026 en BF16, frente al 26,0% del base.
- Calibracion de incertidumbre mejorada: 44,7% en 190 preguntas donde admite no saber o corrige una falsa premisa, frente al 26,3% del base.
- Habilidades de codigo, JSON, instrucciones y chat multi-turno: supera las 60 comprobaciones de habilidad segun el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, segun los resultados de razonamiento citados.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: modo de razonamiento (reasoning on/off); el autor recomienda desactivarlo para consultas factuales porque con razonamiento activado alucina mas.

## Casos de uso

- Consultas sobre actualidad de 2026: el modelo puede responder preguntas sobre eventos ocurridos entre enero y octubre de 2026 con una tasa de acierto de aproximadamente el 69% en titulares, adecuado para asistentes que necesiten informacion reciente sin reentrenar desde cero.
- Atencion al cliente con conocimiento actualizado: util para bases de conocimiento que cambian con frecuencia, ya que el ajuste demuestra que se puede inyectar informacion nueva manteniendo los hechos previos (40 de 40 comprobaciones pre-2026 correctas).
- Sistemas que requieren abstenerse ante incertidumbre: gracias a su mayor tasa de "no lo se" (44,7% frente a 26,3%), es adecuado en flujos donde es preferible admitir desconocimiento a inventar, como asistentes medicos o legales de baja responsabilidad.
- Generacion y validacion de codigo y JSON: supera las 60 comprobaciones de habilidad en codigo, JSON, instrucciones y chat multi-turno, por lo que puede integrarse en pipelines de asistencia a desarrolladores.
- Razonamiento multi-paso en entornos controlados: con razonamiento activado resuelve 147 de 150 problemas multi-paso, util para tareas de analisis que requieran cadenas de deduccion.
- Despliegue en hardware limitado: la version IQ2_XXS de 7,96 GB permite ejecutar el modelo en GPUs de consumo, manteniendo los 40 hechos previos correctos, aunque con menor precision en conocimiento de 2026 (17,1%).
- Investigacion sobre inyeccion de conocimiento: el modelo y sus repositorios asociados (LoRA, GGUF, bnb-4bit) sirven como caso de estudio reproducible para experimentos de actualizacion de conocimiento y calibracion.

## Benchmarks y rendimiento

| Prueba | Este modelo (BF16) | Base Muse Glimmer 30B |
|---|---|---|
| Titulares de 2026 (246 preguntas) | 69,1% | 26,0% |
| Preguntas reformuladas sobre pasajes de 2026 (2.500) | 29,0% | 18,4% |
| Admite no saber o corrige falsa premisa (190) | 44,7% | 26,3% |
| De esas, eventos posteriores al 29 de octubre de 2026 (70) | 67,1% | 24,3% |
| Hechos previos a 2026 (40 comprobaciones) | 40/40 | 40/40 |
| Problemas multi-paso (150, con razonamiento) | 147/150 | 150/150 |
| Comprobaciones de habilidad en codigo, JSON, instrucciones y chat (60) | 60/60 | 60/60 |

Comparativa adicional citada por el autor en 4-bit Q4_K_M: este modelo acierta aproximadamente 70 de 100 titulares de 2026, el base 27, y Qwen3.8 27B, Gemma 4 31B y Granite 4.2 30B obtienen 7 o menos cada uno. En tareas de razonamiento del mismo ejercicio, Qwen3.8 y Gemma 4 igualan o superan a este modelo. El archivo Q4_K_M (16,9 GB) obtiene 28,8% en las 2.500 preguntas, y el IQ2_XXS (7,96 GB) obtiene 17,1%, ligeramente por debajo del archivo 4-bit del base (18,4%). Todas las puntuaciones usan decodificacion greedy (temperatura 0).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 60 GB (el repo pesa 59,6 GB), lo que requiere GPUs de clase A100 80 GB o H100.
- VRAM estimada en Q4_K_M: alrededor de 17 GB, viable en RTX 4090 (24 GB) y GPUs con 24 GB o mas.
- VRAM estimada en IQ2_XXS: alrededor de 8 GB, viable en GPUs de consumo con 8-12 GB.
- GPUs recomendadas: A100 80 GB o H100 para BF16; RTX 4090 o similares para Q4_K_M; GPUs de gama media para IQ2_XXS.
- Opciones de despliegue: transformers para los pesos BF16; llama.cpp para los archivos GGUF; el repo incluye una copia bnb-4bit para QLoRA. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Conocimiento 2026 (titulares) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Glimmer 30B 2026 Knowledge | ~30B | no disponible | ~70/100 (Q4_K_M) | Apache 2.0 + Muse Model License | Hugging Face (OfflineBase) |
| Muse Glimmer 30B (base) | ~30B | no disponible | 27/100 (Q4_K_M) | Muse Model License | Hugging Face (meta-models) |
| Qwen3.8 27B | 27B | no disponible | 7 o menos | no disponible | no disponible |
| Gemma 4 31B | 31B | no disponible | 7 o menos (datos hasta enero de 2025) | no disponible | no disponible |
| Granite 4.2 30B | 30B | no disponible | 7 o menos | no disponible | no disponible |

En tareas de razonamiento, Qwen3.8 y Gemma 4 igualan o superan a este modelo segun el autor. Los datos de contexto y licencia de los modelos comparados no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion frecuente: en las 190 preguntas de calibracion, invento una respuesta el 55,3% de las veces (el base, el 70,0%).
- Falsas premisas: ante premisas falsas no mejora al base; acepta la premisa erronea el 80% de las veces.
- Rechazos excesivos: rechaza mas preguntas ordinarias que el base (18% frente a 6%).
- El modo de razonamiento empeora la factualidad: con razonamiento activado inventa mas respuestas; el autor recomienda desactivarlo para consultas de hechos.
- Idioma: solo se declara soporte de ingles.
- Licencia: combina Apache 2.0 con las condiciones de la Muse Model License, que pueden restringir el uso comercial; es necesario revisar el archivo MUSE_MODEL_LICENSE.md.
- No apto para menores de 18 anos segun el autor.
- No es un lanzamiento oficial de Meta ni esta revisado o respaldado por la compania.
- Los resultados usan decodificacion greedy (temperatura 0), por lo que las conversaciones servidas diferiran.
- El conjunto de 246 titulares fue seleccionado y calificado por un unico autor, y muchas respuestas de noticias aparecen en las paginas de Wikipedia usadas en el entrenamiento, lo que puede inflar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Dataset de entrenamiento: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data
- Archivos GGUF: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF
- Adaptador LoRA: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- Copia bnb-4bit para QLoRA: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit
- Licencia Muse Model License: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge/blob/main/MUSE_MODEL_LICENSE.md
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
