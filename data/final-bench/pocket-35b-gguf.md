# FINAL-Bench/POCKET-35B-GGUF

## Resumen

POCKET-35B-GGUF es la distribucion cuantizada en formato GGUF del modelo Darwin-36B-Opus, un Mixture of Experts (MoE) disperso de 34.660.610.688 parametros totales con aproximadamente 3.000 millones de parametros activos por token. Lo publica el colectivo FINAL-Bench (vinculado a VIDRAFT) bajo licencia Apache-2.0, y esta pensado para ejecucion local en PC, incluyendo una ruta de inferencia solo-CPU mediante llama.cpp con soporte para la arquitectura `qwen35moe`.

El modelo resuelve el problema de desplegar un MoE de ~35B en hardware de consumo: al activar solo ~3B parametros por token y ofrecer builds desde IQ1_M hasta Q4_K_M (13-21 GB), permite inferencia en equipos con 16-32 GB de RAM sin GPU dedicada. La model card lo describe como "Korean-tuned", es decir, ajustado para coreano, aunque los idiomas exactos no se detallan en la informacion disponible.

Es relevante ahora porque la familia Darwin de VIDRAFT aparece en la model card con resultados destacados en el benchmark SuperCLUE de noviembre de 2026 (Darwin-180B-RSI-R3 con 73,68 en razonamiento matematico y cientifico, primer modelo de pesos abiertos), y POCKET-35B traslada esa linea de modelos al terreno on-device. El repositorio acumula 365.166 descargas y 59,1 GB de tamano total, lo que refleja una adopcion considerable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) disperso, familia `qwen35moe` |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M, Q2_K, Q3_K_M, Q4_K_M (imatrix) |
| Idiomas soportados | no disponible (model card indica "Korean-tuned") |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | FINAL-Bench/Darwin-36B-Opus |
| Tamano del repositorio | 59,1 GB |
| Libreria | llama.cpp |

## Arquitectura y entrenamiento

El modelo es un transformer con capas de mezcla de expertos (MoE) dispersas: de los ~34,66B parametros totales solo se activan aproximadamente 3B por token, lo que reduce drasticamente el coste computacional por paso de decodificacion. La arquitectura se identifica en los tags como `qwen3_5_moe` y requiere una build de llama.cpp con soporte para `qwen35moe`. Segun la model card, la linea Darwin hereda las capas de expertos de Qwen3.8-Flash-Next y reconstruye unicamente las capas de atencion y de expertos compartidos mediante un proceso de auto-mejora recursiva (recursive self-improvement, RSI).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que el modelo base Darwin-36B-Opus fue ajustado para coreano ("Korean-tuned"), pero no detalla el corpus de ajuste. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal mas alla de la propia arquitectura MoE.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento (tag `reasoning` en el repositorio).
- Ejecucion local en CPU sin GPU dedicada, mediante llama.cpp.
- Despliegue on-device en PC con 16-32 GB de RAM segun el build elegido.
- Cuantizacion con imatrix para preservar calidad en builds de baja precision.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Ajuste orientado a coreano (segun la model card).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agentes y multi-step reasoning: no disponible en la informacion.
- Vision, audio o thinking mode explicito: no disponible en la informacion.

## Casos de uso

- Asistente conversacional local en PC: con el build Q2_K (~13 GB) el modelo cabe en equipos de 16-24 GB de RAM y permite mantener conversaciones multi-turno sin conexion a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Procesamiento de texto en portatiles sin GPU: la ruta solo-CPU de llama.cpp permite ejecutar el MoE activando solo ~3B parametros por token, con una latencia aceptable para tareas interactivas en portatiles de gama media.
- Desarrollo y prototipado offline: los desarrolladores pueden integrar el modelo en pipelines locales mediante llama.cpp o el servidor compatible con endpoints, sin depender de APIs externas ni de costes por token.
- Atencion al cliente en coreano: dado el ajuste "Korean-tuned" del modelo base, es adecuado para conversaciones de soporte en ese idioma, aunque la calidad exacta por idioma no esta documentada.
- Generacion de texto y resumen en estaciones de trabajo: el build Q4_K_M (~21 GB) ofrece la mayor calidad coreana medida entre los builds y requiere 32 GB de RAM, apropiado para tareas de redaccion y sintesis por lotes.
- Investigacion sobre cuantizacion MoE: el repositorio incluye builds IQ1_M, Q2_K, Q3_K_M y Q4_K_M con imatrix, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantizacion agresiva en modelos de mezcla de expertos.
- Despliegue en entornos aislados (air-gapped): al ser un GGUF Apache-2.0 ejecutable en CPU, puede instalarse en maquinas sin acceso a internet ni GPU, util en laboratorios y entornos industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de POCKET-35B en la informacion disponible. La model card incluye resultados de SuperCLUE (noviembre de 2026) para el modelo hermano Darwin-180B-RSI-R3, no para este modelo:

| Modelo | Desarrollador | Pesos abiertos | Razonamiento matematico y cientifico |
|---|---|---|---|
| GPT-6.1-Sol | OpenAI | No | 76,32 |
| Darwin-180B-RSI-R3 | VIDRAFT | Si | 73,68 |
| Gemini-4-Argon | Google | No | 71,05 |
| DeepSeek-V4.1-Flash | DeepSeek | Si | 71,05 |
| Grok-4.7 | xAI | No | 68,42 |
| Qwen3.8-Max-0902 | Alibaba | No | 68,42 |
| GLM-5.3 | Zhipu AI | Si | 65,79 |
| Kimi-K3.1-Pro | Moonshot | Si | 63,16 |
| Qwen3.8-Flash | Alibaba | Si | 57,89 |

Estos datos corresponden al modelo de 180B de la misma familia y no deben extrapolarse a POCKET-35B.

## Requisitos de hardware

- Q2_K (recomendado): ~13 GB de archivo; guia del editor de 16-24 GB de RAM en PC.
- Q3_K_M: ~16 GB de archivo; guia del editor de 24 GB de RAM.
- Q4_K_M: ~21 GB de archivo; guia del editor de 32 GB de RAM; mayor calidad coreana medida entre los builds.
- IQ1_M: build de muy baja precision; tamano no disponible en la informacion.
- GPU dedicada: no requerida; la model card indica una ruta solo-CPU disponible. No se especifican GPU recomendadas (A100, H100, RTX 4090) ni VRAM estimada para aceleracion por GPU.
- Despliegue: llama.cpp con soporte de arquitectura `qwen35moe`; requiere verificar la build instalada. Compatible con endpoints.
- Latencia y throughput: no disponibles en la informacion.
- Los builds de este repositorio son de modelo completo para PC; los derivados para movil (~5 GB) estan en repositorios separados (POCKET-KR-GGUF, POCKET-KR-MLX, POCKET-EN-GGUF).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de POCKET-35B que permitan una comparacion cuantitativa fiable. A continuacion se comparan caracteristicas estructurales con alternativas de la misma categoria (MoE de ~30-40B cuantizados para ejecucion local):

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| POCKET-35B-GGUF | ~34,66B | ~3B | no disponible | Apache-2.0 | GGUF |
| Darwin-180B-RSI-R3 | 180B (familia) | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye especificaciones de contexto, rendimiento ni licencia de los modelos comparables, por lo que la comparativa queda limitada a los datos de la familia Darwin y sus referencias en SuperCLUE.

## Limitaciones y advertencias

- No hay datos publicados de benchmarks especificos de este modelo; los resultados de SuperCLUE corresponden a Darwin-180B-RSI-R3, no a POCKET-35B.
- La longitud de contexto no esta documentada, lo que dificulta planificar cargas de trabajo con ventanas largas.
- El ajuste esta orientado a coreano ("Korean-tuned"); el rendimiento en castellano u otros idiomas no esta verificado.
- Los builds de baja precision (IQ1_M, Q2_K) pueden degradar la calidad de forma notable; el editor recomienda Q2_K como equilibrio, pero no publica metricas de perplejidad por build.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de factualidad.
- Sesgos conocidos: no disponibles en la informacion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Darwin-36B-Opus y su procedencia (herencia de capas de Qwen3.8-Flash-Next) deben verificarse por posibles obligaciones de atribucion; la model card remite a su seccion "License and attribution".
- Requiere una build de llama.cpp con soporte `qwen35moe`; builds antiguas no cargaran el modelo.
- Las cifras de RAM son guias del editor, no requisitos medidos de forma independiente.
- El repositorio contiene builds de modelo completo para PC; no debe confundirse con los derivados moviles de ~5 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- Archivos y descargas: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF/tree/main
- Guia de instalacion: https://vidraft.net/p/pocket.html?model=pocket_35b
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-36B-Opus
- POCKET-27B-GGUF: https://huggingface.co/FINAL-Bench/POCKET-27B-GGUF
- POCKET-26B-GGUF: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF
- POCKET-Darwin-180B-GGUF: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- POCKET-KR-GGUF (movil): https://huggingface.co/FINAL-Bench/POCKET-KR-GGUF
- POCKET-KR-MLX (movil): https://huggingface.co/FINAL-Bench/POCKET-KR-MLX
- POCKET-EN-GGUF (movil): https://huggingface.co/FINAL-Bench/POCKET-EN-GGUF
- Darwin-180B-RSI-R3: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- SuperCLUE: https://www.superclueai.com/homepage
