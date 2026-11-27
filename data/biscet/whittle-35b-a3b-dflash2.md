# biscet/Whittle-35B-A3B-DFlash2

## Resumen

Whittle-35B-A3B-DFlash2 es un modelo borrador (draft model) para decodificación especulativa, desarrollado por el usuario biscet y publicado bajo licencia Apache-2.0. No es un modelo de chat autónomo: es un adaptador de drafting de 526.251.520 parámetros diseñado para acelerar la inferencia del modelo objetivo Whittle-Qwen-3.8-35B-A3B en su cuantización Q5_K_M GGUF. Se apoya en la arquitectura DFlash2 de difusión por bloques, con un bloque de 16 tokens y 6 capas, y se ejecuta junto al modelo objetivo congelado en un runtime compatible.

La relevancia del modelo reside en su propósito: reducir el coste por token generado en un MoE de 35B mediante decodificación especulativa. El checkpoint seleccionado (paso 52 del último run de destilación KL) reporta una precisión de token borrador del 59,64 % y un recall del token correcto en el top-16 del 83,59 %, frente al 46,90 % y 71,23 % de la versión v1.0.0. El entrenamiento usa destilación KL directa sobre un vocabulario de 248.320 entradas, con el modelo objetivo como profesor.

El modelo está marcado explícitamente como release experimental de comunidad, orientado a investigación y evaluación de decodificación especulativa. Los idiomas declarados son ruso e inglés, y el repo ocupa 7,4 GB, aunque el artefacto de inferencia F16 pesa aproximadamente 0,991 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (difusión por bloques), 6 capas, bloque de 16 tokens; adaptador de drafting sobre modelo objetivo congelado |
| Parametros totales | 526.251.520 |
| Parametros activos | no disponible (no es MoE; el objetivo sí es MoE 35B-A3B) |
| Longitud de contexto | no disponible (contexto de características de entrenamiento: 384 tokens, 8 anclas por contexto) |
| Tipos de cuantizacion | F16 GGUF (inferencia); safetensors en F16/F32 originales |
| Idiomas soportados | ru, en |
| Licencia | Apache-2.0 (con avisos heredados en NOTICE) |
| Formato de pesos | GGUF (F16) y safetensors |

## Arquitectura y entrenamiento

El modelo es un draft de arquitectura DFlash2 basada en difusión por bloques, con 6 capas y un bloque de 16 tokens. Se inicializa a partir de la estirpe Ornith 1.5 DFlash2 y se adapta específicamente al objetivo Whittle Q5_K_M. La etapa más reciente actualiza la proyección de características, la normalización, las dos últimas capas de draft y el selector de candidatos; las cuatro primeras capas permanecen congeladas. De los 526.251.520 parámetros, se actualizan 282.898.944.

El entrenamiento emplea destilación KL directa sobre las 248.320 entradas del vocabulario, más entropía cruzada del selector. Los datos provienen de DFlash DeepSeek TraceMix (contextos de código, texto, razonamiento y uso de herramientas en RU/EN, con un pool planificado de 16.384 contextos equilibrados), con adaptaciones previas sobre DFlash ChatGPT TraceMix Lite y prompts de Tulu 3 SFT Mixture. El objetivo Whittle Q5 aportó las completaciones, características ocultas y probabilidades de vocabulario completo. Se usó AdamW, batch 4, contexto de características de 384 tokens, pesos maestros FP32 y autocast FP16, con LR 2e-6 y warmup de 32 pasos. El run procesó 2.640 contextos en 42 shards y se detuvo en el paso 660; el checkpoint exportado es el paso 52, seleccionado por longitud de prefijo correcto autoconducido, precisión y pérdida del selector.

## Capacidades

- Generación de tokens borrador para decodificación especulativa junto al objetivo Whittle-Qwen-3.8-35B-A3B en Q5_K_M.
- Aceleración de inferencia mediante propuesta de bloques de 16 tokens y verificación por el modelo objetivo.
- Soporte de contextos de código, texto, razonamiento y agent/tool-use en ruso e inglés, según la composición del dataset de entrenamiento.
- Selector de candidatos con recall del token correcto en el top-16 del 83,59 %.
- No es un modelo conversacional autónomo: no genera respuestas finales por sí mismo.
- No dispone de tool calling propio, visión, audio ni modo thinking; esas capacidades pertenecen al modelo objetivo.

## Casos de uso

- Aceleración de inferencia en producción del objetivo Whittle 35B-A3B: el draft propone tokens que el objetivo verifica, reduciendo el número de pasos de decodificación del MoE y el coste por token generado.
- Evaluación de decodificación especulativa en investigación: permite medir precisión de draft, recall top-16 y tasa de aceptación sobre el objetivo Q5_K_M en un runtime DFlash2.
- Servicio de chat con el objetivo en GPU con memoria limitada: aligerar la latencia del modelo grande sin cambiar sus pesos ni su cuantización.
- Pipelines de generación de código en RU/EN: el dataset incluye contextos de código y el draft está adaptado a ese dominio para reducir latencia en autocompletado y generación.
- Flujos de agentes y tool-use: los contextos de entrenamiento incluyen uso de herramientas, lo que ayuda a mantener la tasa de aceptación en turnos con llamadas estructuradas.
- Despliegue en llama.cpp: el artefacto GGUF F16 se integra en runtimes compatibles con DFlash2 para servir el objetivo con menor latencia.
- Experimentación con destilación KL para drafting: el repo incluye el trainer portable, el recetario y el historial de validación para reproducir o continuar el entrenamiento.

## Benchmarks y rendimiento

Métricas offline de entrenamiento del draft, no benchmarks de tareas:

| Metrica | v1.0.0 | v1.2.1 (paso 52) | Variacion |
|---|---:|---:|---:|
| Pérdida de validación (↓) | 4,2199 | 2,9266 | −30,65 % |
| Precisión de token borrador (↑) | 46,90 % | 59,64 % | +12,73 pp |
| Proxy de prefijo correcto (↑) | 2,3965 tokens | 1,6641 tokens | −30,56 % |
| Recall del token correcto en top-16 (↑) | 71,23 % | 83,59 % | +12,36 pp |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM del draft: el artefacto F16 GGUF ocupa aproximadamente 0,991 GiB; el safetensors contiene los mismos 96 tensores entrenados.
- VRAM total: debe sumarse la del objetivo Whittle 35B-A3B en Q5_K_M, no disponible en la información proporcionada.
- GPU recomendadas: no disponible; depende del objetivo y del runtime DFlash2.
- Compatibilidad con GPU de consumo: el draft por sí solo cabe en cualquier GPU con más de 1 GiB libre, pero el objetivo Q5_K_M condiciona el requisito real.
- Despliegue: runtime DFlash2 compatible en Linux con llama.cpp; el repo incluye trainer KL portable y helper de reintento AMP.
- Latencia y throughput: no disponible; las métricas publicadas son de calidad del draft, no de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Whittle-35B-A3B-DFlash2 | 526.251.520 | no disponible | Draft DFlash2 para objetivo 35B-A3B | Apache-2.0 | GGUF F16 y safetensors |
| Ornith-1.5-35B-A3B-DFlash2 | no disponible | no disponible | Draft DFlash2 (ancestro) | no disponible | Hugging Face |
| Modelos draft EAGLE/Medusa equivalentes | no disponible | no disponible | Draft especulativo | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- Release experimental de comunidad: el autor lo restringe a investigación y evaluación de decodificación especulativa con el objetivo Q5_K_M.
- No es un modelo autónomo: sin el objetivo Whittle congelado y un runtime DFlash2 no produce respuestas utilizables.
- Adaptado a una cuantización concreta (Q5_K_M): el rendimiento puede degradarse con otras cuantizaciones del objetivo.
- Solo ruso e inglés declarados; no hay cobertura multilingüe más allá de esos idiomas.
- Riesgo de menor tasa de aceptación en dominios alejados de los datos de entrenamiento (código, texto, razonamiento, tool-use RU/EN).
- El checkpoint seleccionado es el paso 52 de un run detenido en el 660; el entrenamiento no se completó y el pool planificado de 16.384 contextos no se agotó (2.640 procesados).
- Las métricas publicadas son offline de entrenamiento del draft, no garantizan ganancias de velocidad en producción.
- Licencia Apache-2.0 con avisos heredados en NOTICE que deben conservarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2
- Descarga GGUF F16: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2/resolve/main/Whittle-35B-A3B-DFlash2-v1.2.1-F16.gguf?download=true
- Safetensors: https://huggingface.co/biscet/Whittle-35B-A3B-DFlash2/resolve/main/tensors/best-model.safetensors?download=true
- Modelo base: https://huggingface.co/whittleOrg/Whittle-Qwen-3.8-35B-A3B
- Objetivo Q5_K_M GGUF: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B-GGUF
- Ancestro Ornith 1.5 DFlash2: https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Dataset DFlash DeepSeek TraceMix: https://huggingface.co/datasets/biscet/DFlash-DeepSeek-TraceMix
- Dataset DFlash ChatGPT TraceMix Lite: https://huggingface.co/datasets/biscet/DFlash-ChatGPT-TraceMix-Lite
- Dataset Tulu 3 SFT Mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Notas de version: CHANGELOG.md (en el repo)
- Documentacion de entrenamiento: TRAINING.md, DATA_SOURCES.md, PROVENANCE.json (en el repo)
- Metricas: EVALUATION.json y training/validation-history.jsonl (en el repo)
