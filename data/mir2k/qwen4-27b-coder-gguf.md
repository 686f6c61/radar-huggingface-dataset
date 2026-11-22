# Mir2k/Qwen4-27B-Coder-GGUF

## Resumen

Mir2k/Qwen4-27B-Coder-GGUF es un repositorio de cuantizaciones GGUF derivadas de un supuesto modelo base denominado "Qwen4-27B-Coder". El repositorio lo publica el usuario Mir2k, no el equipo de Qwen (Alibaba), y en el momento de redactar esta ficha no contiene pesos publicados ni documentación técnica sustantiva: la model card solo anuncia cuantizaciones Q4_K_M, Q5_K_M y Q8_0 "en preparación", generadas con `llama.cpp`.

El modelo base que se infiere del nombre sería un transformer de 27.000 millones de parámetros especializado en código, pero no hay confirmación alguna en el repositorio sobre arquitectura, datos de entrenamiento, longitud de contexto o idiomas. La ficha se limita, por tanto, a documentar lo verificable y a marcar como "no disponible" todo aquello que el autor no ha publicado.

Su relevancia actual es limitada: cero descargas y cero likes en el momento de la consulta, licencia Apache 2.0 declarada y ausencia de artefactos. Se trata de un repositorio en estado embrionario que conviene monitorizar pero no desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer denso; sin confirmar) |
| Parametros totales | 27B (según el nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (anunciadas "en preparación"; no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo base. El nombre "Qwen4-27B-Coder" sugiere una familia Qwen de cuarta generación con 27.000 millones de parámetros y especialización en código, pero el repositorio no incluye model card del modelo original, paper, ni detalles de dataset, número de tokens de entrenamiento o proceso de alineación (RLHF/DPO). Tampoco se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, modo thinking, etc.).

Lo único verificable es el proceso de cuantización: el autor declara haber generado los GGUF con `llama.cpp` y haberlos validado mediante generación real antes de su publicación. No obstante, en la fecha de creación del repositorio (22 de noviembre de 2026) no hay ficheros de pesos visibles en la información proporcionada.

## Capacidades

- Generación de código: capacidad esperada por el sufijo "Coder" del nombre, pero no verificada en el repositorio.
- Razonamiento y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación comparativa de cuantizaciones GGUF: una vez publicados los ficheros, el repositorio permitiría medir la degradación de calidad de Q4_K_M frente a Q8_0 en tareas de generación de código con `llama.cpp`.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante Q4_K_M de un modelo de 27B cabría previsiblemente en GPUs con 16-24 GB de VRAM, aunque el dato no está confirmado por el autor.
- Autocompletado de código en IDE local: si el modelo base confirma su especialización en código, podría integrarse vía servidor compatible con la API de OpenAI servido por `llama.cpp`.
- Generación de tests unitarios en pipelines de CI: uso previsto para un modelo "Coder", pendiente de validación empírica.
- Reproducción de experimentos de cuantización: útil para investigadores que quieran replicar el pipeline `llama.cpp` del autor.
- Monitorización de la familia Qwen: el repositorio sirve como señal temprana de la existencia de un supuesto "Qwen4-27B-Coder", sin valor operativo hasta que se publiquen pesos y documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 15-17 GB para 27B parámetros (estimación teórica; no confirmada por el autor).
- VRAM estimada para Q5_K_M: aproximadamente 18-20 GB (estimación teórica).
- VRAM estimada para Q8_0: aproximadamente 28-30 GB (estimación teórica).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q4_K_M/Q5_K_M; A100 40 GB o H100 para Q8_0.
- Cabe en GPU de consumo: previsiblemente sí en Q4_K_M con GPUs de 24 GB, aunque no hay confirmación.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mir2k/Qwen4-27B-Coder-GGUF | 27B (según nombre) | no disponible | Apache 2.0 | Sin pesos publicados |
| Qwen2.5-Coder-32B-Instruct | 32B | 131.072 tokens | Apache 2.0 | Pesos y GGUF oficiales |
| DeepSeek-Coder-V2-Lite | 16B (MoE, 2,4B activos) | 128.000 tokens | DeepSeek License | Pesos y GGUF disponibles |
| CodeLlama-34B-Instruct | 34B | 16.384 tokens | Llama 2 Community License | Pesos y GGUF disponibles |

La comparativa con modelos de la familia Qwen reales es orientativa: el repositorio de Mir2k no permite verificar parámetros, contexto ni rendimiento del supuesto Qwen4-27B-Coder.

## Limitaciones y advertencias

- Repositorio sin pesos publicados en el momento de la consulta: la model card solo anuncia cuantizaciones "en preparación".
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- El modelo base "Qwen4-27B-Coder" no está documentado en el repositorio; no se puede confirmar su existencia, procedencia ni relación con Alibaba.
- Ausencia de benchmarks, evaluación de sesgos o pruebas de alucinación.
- Licencia Apache 2.0 declarada, pero al no haber pesos no se puede verificar la cadena de licencias del modelo base.
- Riesgo de suplantación de nombre: un tercero podría publicar un GGUF con nombre de la familia Qwen sin ser el modelo oficial; conviene verificar contra el repositorio oficial de Qwen antes de cualquier uso.
- No apto para producción en su estado actual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mir2k/Qwen4-27B-Coder-GGUF
- `llama.cpp` (herramienta de cuantización citada): https://github.com/ggerganov/llama.cpp
- Repositorio oficial de Qwen (referencia para verificar el modelo base): https://huggingface.co/Qwen
