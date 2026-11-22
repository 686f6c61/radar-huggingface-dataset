# Abu-Dju/Index-Echo-S2ST-9B-GGUF

## Resumen

Index-Echo-S2ST-9B-GGUF es la conversión a formato GGUF del backbone LLM de texto (`stlm_llm/`) del modelo IndexTeam/Index-Echo-S2ST-9B (versión v4rft), perteneciente a la familia de traducción voz-a-voz (S2ST) Index-Echo desarrollada por bilibili. Este repositorio contiene exclusivamente el componente lingüístico del sistema completo, cuantizado con llama.cpp (v0.26.0) en múltiples anchos de bits, lo que permite ejecutar la parte de texto del pipeline en hardware de consumo mediante llama.cpp, Ollama o servidores compatibles con la API de llama.cpp.

El modelo base es un transformer denso de aproximadamente 8.950 millones de parámetros (8.953.803.264 según safetensors), con licencia Apache 2.0 y orientado a tareas de traducción. La versión v4rft cubre doce direcciones de traducción: entrada de voz en chino, japonés o inglés, doblada a inglés, español, japonés, coreano o chino. Es relevante porque ofrece una alternativa abierta y cuantizable para investigación en traducción multilingüe y pipelines S2ST, aunque con la limitación importante de que este repositorio no incluye la torre de audio, el conector ni el stack de síntesis de voz, por lo que no puede ejecutar el pipeline completo de voz a voz.

El repositorio ocupa 81,4 GB e incluye desde cuantizaciones de 2 bits (Q2_K, 3,83 GB) hasta f16 (17,92 GB), con validación de divergencia KL y perplejidad frente a la conversión F16 publicada por el autor. Es una opción práctica para desarrolladores que quieran integrar el componente de traducción textual en aplicaciones locales, pero no sustituye al checkpoint original ni a la versión FP8 para inferencia S2ST completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (backbone LLM de texto del sistema S2ST Index-Echo) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | no disponible (el modelo base cubre chino, japonés, inglés, español y coreano según la model card del pipeline) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente el backbone LLM de texto del sistema Index-Echo-S2ST-9B, un transformer denso de unos 8,95 mil millones de parámetros. El sistema completo del que forma parte integra una torre de audio, un conector y un stack de síntesis de voz, pero estos componentes no están incluidos en esta conversión GGUF porque llama.cpp no puede ejecutar el pipeline de voz completo. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la versión v4rft se describe como una actualización del traductor multilingüe que cubre doce direcciones de traducción.

La conversión se realizó con llama.cpp v0.26.0 (2026-10-15) mediante cuantización estática post-entrenamiento, agrupando todos los anchos de bits en un único repositorio. El autor validó cada nivel de cuantización frente a la conversión F16 usando `llama-perplexity` (build de CPU) para calcular la divergencia KL por token, el delta RMS de probabilidad y la tasa de coincidencia en top-1, además de comprobaciones puntuales de generación greedy. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto multilingüe: el modelo base está diseñado como traductor dentro del pipeline S2ST y cubre direcciones entre chino, japonés, inglés, español y coreano.
- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica soporte para diálogo multi-turno.
- Integración con llama.cpp: compatible con `llama serve` y `llama cli`, así como con endpoints compatibles con la API de llama.cpp.
- Cuantización flexible: doce niveles de cuantización que permiten ajustar el equilibrio entre calidad y uso de memoria.
- No incluye capacidades de audio: la torre de audio, el conector y la síntesis de voz no están presentes en este repositorio, por lo que no puede realizar traducción voz-a-voz por sí solo.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Traducción de texto local en estaciones de trabajo: con la cuantización Q4_K_M (5,63 GB) el modelo puede ejecutarse en GPUs de consumo para traducir documentos o mensajes entre los idiomas cubiertos por el pipeline, sin depender de servicios en la nube.
- Integración en pipelines de subtitulado: combinado con un sistema ASR externo, el backbone puede traducir transcripciones de voz a texto en las doce direcciones soportadas, encajando en flujos de postproducción o accesibilidad.
- Prototipado de asistentes conversacionales multilingües: la etiqueta `conversational` y la licencia Apache 2.0 permiten experimentar con diálogos multi-turno en entornos de investigación sin restricciones comerciales.
- Evaluación de cuantizaciones en investigación: el repositorio incluye métricas de KLD, RMS Δp y coincidencia top-1 por nivel, lo que facilita estudios sobre el impacto de la cuantización en tareas de traducción.
- Despliegue en servidores con llama.cpp: mediante `llama serve` se puede exponer un endpoint compatible con la API de llama.cpp para integrarlo en aplicaciones web o móviles que requieran traducción de texto.
- Investigación en S2ST con componentes separados: al disponer del backbone LLM aislado, los investigadores pueden combinarlo con torres de audio y sintetizadores propios para experimentar con arquitecturas S2ST modulares.
- Uso educativo y demos: la cuantización Q2_K (3,83 GB) permite ejecutar el modelo en equipos con poca VRAM para demostraciones o docencia, aceptando la pérdida de calidad documentada.

## Benchmarks y rendimiento

El autor publica métricas de consistencia de cuantización frente a la conversión F16, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.):

| Cuantizacion | PPL (corpus fijo) | KLD media | RMS Δp | Top-1 coincidente |
|---|---:|---:|---:|---:|
| f16 | 3,2502 | (referencia) | - | - |
| Q8_0 | 3,2507 | 0,001272 | 1,23% | 99,02% |
| Q6_K | 3,2467 | 0,012566 | 4,18% | 96,61% |
| Q5_K_M | 3,2775 | 0,016146 | 4,45% | 96,09% |
| Q5_K_S | 3,3047 | 0,025917 | 5,45% | 95,37% |
| Q4_K_M | 3,2806 | 0,035922 | 6,90% | 94,39% |
| Q4_K_S | 3,6296 | 0,090064 | 10,84% | 91,32% |
| Q3_K_L | 3,4872 | 0,092859 | 10,21% | 91,00% |
| Q3_K_M | 3,8014 | 0,151914 | 14,26% | 87,87% |
| Q3_K_S | 5,8845 | 0,535761 | 30,10% | 80,36% |
| Q2_K | 4,6526 | 0,596711 | 26,59% | 76,32% |
| IQ4_XS | 3,4390 | 0,081273 | 10,17% | 91,52% |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 4 GB con Q2_K (3,83 GB de pesos) hasta unos 18 GB con f16 (17,92 GB); Q4_K_M requiere aproximadamente 6 GB y Q8_0 en torno a 10 GB, sin contar el overhead de contexto KV.
- GPU recomendadas: para f16 o Q8_0, GPUs con 16-24 GB como RTX 4090, A100 40 GB o H100; para Q4_K_M y Q5, GPUs de 8-12 GB como RTX 3060 12 GB, RTX 4070 o RTX 4080.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones. Q2_K y Q3_K_S caben en GPUs de 4-6 GB; Q4_K_M en GPUs de 8 GB; Q6_K y Q8_0 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp (`llama serve`, `llama cli`), Ollama y cualquier servidor compatible con la API de llama.cpp; no se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Index-Echo-S2ST-9B-GGUF (este) | 8,95 mil M | no disponible | Apache 2.0 | GGUF | Solo backbone LLM, sin audio |
| IndexTeam/Index-Echo-S2ST-9B (original) | 8,95 mil M (backbone) | no disponible | Apache 2.0 | safetensors | Pipeline S2ST completo |
| IndexTeam/Index-Echo-S2ST-9B-FP8 | 8,95 mil M (backbone) | no disponible | Apache 2.0 | FP8 | Pipeline completo con LLM en FP8 |
| Otros modelos de traducción de ~9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo S2ST completo: faltan la torre de audio, el conector y el stack de síntesis de voz, por lo que no puede realizar traducción voz-a-voz por sí solo.
- Las cuantizaciones bajas pierden calidad de forma significativa: Q2_K presenta una KLD de 0,597 y solo un 76,32% de coincidencia top-1; Q3_K_S muestra una PPL de 5,88 frente a 3,25 en F16.
- No se documentan sesgos conocidos, pero al ser un modelo de traducción multilingüe entrenado por un tercero, es probable que herede sesgos de sus datos de entrenamiento; no hay información específica disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada; en tareas de traducción puede producir contenido no fiel al original, especialmente en cuantizaciones agresivas.
- Idiomas exactos y longitud de contexto no documentados en este repositorio; la model card del pipeline menciona chino, japonés, inglés, español y coreano.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la calidad de las cuantizaciones bajas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.
- Las URLs de los archivos en la model card apuntan a `IndexTeam/` en lugar de `Abu-Dju/`, lo que puede indicar un error de publicación o una copia; conviene verificar la integridad de los archivos antes de usarlos en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Abu-Dju/Index-Echo-S2ST-9B-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Echo-S2ST-9B
- Versión FP8 del pipeline completo: https://huggingface.co/IndexTeam/Index-Echo-S2ST-9B-FP8
- Repositorio GGUF referenciado en la model card: https://huggingface.co/IndexTeam/Index-Echo-S2ST-9B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
