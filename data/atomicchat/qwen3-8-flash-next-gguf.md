# AtomicChat/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next es el primer modelo abierto basado en la arquitectura que precedera a Qwen4, desarrollado por Qwen y cuantizado por AtomicChat en formato GGUF con matriz de importancia propia. Se trata de un modelo de lenguaje causal multimodal (texto e imagen) con arquitectura MoE dispersa de 125.000 millones de parametros totales, de los cuales solo 6.000 millones se activan por token, lo que permite ejecutarlo en equipos de consumo con cuantizacion adecuada. Su principal innovacion es la combinacion de atencion hibrida con Gated DeltaNet y Qwen Sparse Attention (QSA), junto con un embedding n-grama de 51.000 millones de parametros y una capa MTP de 4.000 millones, disenada para reducir la latencia en cargas de trabajo agente y de contexto largo.

Este repositorio concreto ofrece cuantizaciones GGUF con imatrix, generadas por AtomicChat a partir de los pesos originales de Qwen, con corpus de calibracion publicos. El modelo base soporta una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000 mediante RoPE scaling, y presenta puntuaciones destacadas en tareas de codificacion y razonamiento agente, segun datos publicados por Qwen. Es relevante ahora porque permite ejecutar localmente una arquitectura de nueva generacion con capacidades de nivel frontier en hardware de gama alta de consumo o estaciones de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa con atencion hibrida (Gated DeltaNet + Qwen Sparse Attention), Gated Residual, n-gram embedding y capa MTP |
| Parametros totales | 176.943.899.520 (125B MoE + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6.000.000.000 (6B) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 con RoPE scaling |
| Tipos de cuantizacion | IQ2_M, IQ3_M, Q4_K_M, UD-Q4_K_XL, Q6_K, Q8_0 (todas con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (otra, no permisiva estandar) |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base original usa safetensors |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next emplea una arquitectura MoE dispersa con 512 expertos, de los cuales se activan 10 rutados y 1 compartido por token, lo que da un total de 6.000 millones de parametros activos. La atencion es hibrida: combina Gated DeltaNet, un mecanismo de atencion lineal, con Qwen Sparse Attention (QSA), que opera a nivel de micro-bloques en lugar de por token para reducir la latencia en contextos largos. Ademas incorpora Gated Residual, con una puerta de lectura dependiente de los datos y una puerta de escritura escalar por rama sobre flujos residuales ensanchados, y un embedding n-grama de 20 millones de bigramas/trigramas indexados en la capa 2, que anade capacidad sin coste computacional significativo. La capa MTP (Multi-Token Prediction) de 4.000 millones de parametros acelera la decodificacion.

El modelo es un LM causal con un codificador de vision, por lo que es nativamente multimodal (entrada de imagen y texto, salida de texto). Los cuantizaciones GGUF de este repositorio cubren unicamente la ruta de texto. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion (RLHF/DPO) en la documentacion proporcionada. La cuantizacion fue realizada por AtomicChat con su propia matriz de importancia, publicada junto a los quants, y el corpus de calibracion es de acceso publico.

## Capacidades

- Generacion de texto y razonamiento avanzado, con puntuaciones de nivel frontier en tareas de codificacion y razonamiento cientifico (GPQA Diamond 91.7).
- Codificacion de software: soporta generacion de codigo, depuracion y tareas de ingenieria de software, con 91.9 en LiveCodeBench v6 y 81.0 en SWE-bench Multilingual.
- Capacidades agente y multi-step reasoning, con 73.9 en CoWorkBench, orientado a cargas de trabajo agente con contexto largo.
- Multimodal nativo: el modelo base acepta entrada de imagen y texto (image-text-to-text), aunque los quants GGUF de este repositorio solo cubren la ruta de texto.
- Contexto largo: 262.144 tokens nativos, extensible hasta 1.000.000, adecuado para analisis de documentos extensos y conversaciones multi-turno.
- Soporte de tool calling y function calling: no se especifica explicitamente en la documentacion, pero la arquitectura agente y los benchmarks sugieren capacidad para integracion con herramientas.
- Eficiencia computacional: al activar solo 6B de parametros por token, ofrece inferencia rapida en hardware de gama media-alta.

## Casos de uso

- Asistente de programacion en produccion: con 91.9 en LiveCodeBench, puede integrarse en IDE o pipelines de CI/CD para generar codigo, revisar pull requests y sugerir correcciones, aprovechando su contexto de 262K para analizar repositorios completos.
- Agente autonomo de resolucion de tareas: su puntuacion en SWE-bench Multilingual (81.0) lo hace adecuado para agentes que navegan por codebases, modifican archivos y ejecutan pruebas de forma autonoma, con la ventaja de su baja latencia gracias a la arquitectura MoE.
- Analisis de documentos legales o academicos extensos: la ventana de 262K tokens permite procesar contratos, articulos de investigacion o expedientes completos en una sola pasada, extrayendo informacion y resumiendo sin perder contexto.
- Atencion al cliente automatizada con contexto largo: puede gestionar conversaciones multi-turno manteniendo el historial completo de la interaccion, incluso en sesiones prolongadas, gracias a su memoria de contexto amplia.
- Razonamiento cientifico y asistencia en investigacion: con 91.7 en GPQA Diamond, puede ayudar a investigadores a formular hipotesis, disenar experimentos y revisar literatura cientifica, integrado en entornos de notebook o APIs.
- Despliegue local en estaciones de trabajo con 128 GB de RAM: gracias a las cuantizaciones Q4_K_M o UD-Q4_K_XL, el modelo cabe en equipos de gama alta sin GPU dedicada, permitiendo uso offline en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base `Qwen/Qwen3.8-Flash-Next`, publicados por Qwen. AtomicChat indica que las cuantizaciones Q4_K_M y superiores se mantienen dentro de uno o dos puntos de la precision completa.

| Benchmark | Resultado |
|---|---|
| LiveCodeBench v6 | 91.9 |
| GPQA Diamond | 91.7 |
| SWE-bench Multilingual | 81.0 |
| CoWorkBench | 73.9 |

No se han publicado resultados de benchmarks especificos para las cuantizaciones GGUF de este repositorio en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para la cuantizacion Q4_K_M, el modelo requiere aproximadamente 128 GB de RAM/unified memory en equipos Mac o estaciones de trabajo, segun Atomic Chat. Unsloth indica que puede ejecutarse con 78 GB de RAM/unified memory sin necesidad de VRAM de GPU.
- GPU recomendadas: no se especifican modelos concretos, pero al ser un MoE de 125B con 6B activos, puede ejecutarse en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090 con 24 GB no es suficiente para el modelo completo; se necesitarian multiples GPUs o cuantizaciones muy agresivas como IQ2_M). Para uso serio se recomiendan estaciones con 128 GB de memoria unificada (Apple Silicon) o multiples GPUs profesionales (A100, H100) con al menos 80 GB cada una.
- Si cabe en consumer GPU: no de forma completa; las cuantizaciones mas bajas (IQ2_M) podrian caber en GPUs de 48 GB, pero no se proporcionan tamanos exactos de los archivos.
- Opciones de despliegue: llama.cpp (requiere una build con soporte para Qwen3.8-Flash-Next), Atomic Chat (aplicacion de escritorio), y potencialmente vLLM o TGI cuando se anada soporte. Los quants estan disenados para llama.cpp.
- Latencia y throughput: no se proporcionan datos numericos, pero la arquitectura con 6B activos y MTP esta optimizada para reducir la latencia en cargas agente.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos en la informacion proporcionada. El modelo base Qwen3.8-Flash-Next es comparable en tamano total a otros MoE grandes como Qwen3-235B-A22B o DeepSeek-V3, pero no hay datos de rendimiento comparativos en las fuentes consultadas. Se puede considerar que, por su arquitectura hibrida y su enfoque en tareas agente, compite con modelos de la misma generacion, aunque la falta de benchmarks estandarizados publicados impide una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Los quants GGUF de este repositorio cubren solo la ruta de texto; las capacidades multimodales (vision) del modelo base no estan disponibles en estas cuantizaciones.
- La licencia es `qwen-community-1.0`, una licencia propia de Qwen que no es permisiva estandar; es necesario revisar sus terminos antes de uso comercial.
- El modelo requiere una build de llama.cpp con soporte especifico para Qwen3.8-Flash-Next; sin ella, no se puede ejecutar correctamente. Atomic Chat es la alternativa recomendada hasta que el soporte se generalice.
- Es obligatorio pasar `--jinja` al usar llama.cpp para aplicar la plantilla de chat correcta; de lo contrario, el modelo puede generar turnos malformados.
- Los tamanos de los archivos de cuantizacion no estan disponibles en la documentacion; se recomienda elegir el archivo mas grande que quepa en la memoria disponible.
- No se especifican sesgos conocidos ni riesgos de alucinacion en la informacion proporcionada, pero al ser un modelo de 125B, es susceptible a los sesgos tipicos de los LLM entrenados con datos web.
- El repositorio se creo en agosto de 2026 y los quants estaban aun subiendose en el momento de la publicacion; algunos archivos pueden no estar completos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/Qwen3.8-Flash-Next-GGUF
- Guia de Atomic Chat para ejecutar el modelo localmente: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Repositorio GitHub de QwenLM/Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de unsloth para ejecucion local: https://unsloth.ai/docs/models/qwen3.8-next
- Corpus de calibracion de AtomicChat: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
