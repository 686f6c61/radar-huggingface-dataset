# pranil00/ONIX-Codestral-22B-v0.1-GGUF

## Resumen

ONIX-Codestral-22B-v0.1-GGUF es una cuantización en formato GGUF del modelo Codestral-22B-v0.1 de Mistral AI, publicada por el usuario pranil00 bajo el sello de la comunidad ONIX. El artefacto contiene los pesos del modelo base convertidos a precisión Q3_K_M (aproximadamente 3,5 bits por parámetro), lo que reduce el tamaño de 43,51 GB en FP16 a 9,52 GB, una compresión del 78,1 %. Se distribuye como un único fichero `mistralai--Codestral-22B-v0.1-Q3_K_M.gguf` de 9,52 GB dentro de un repositorio de 10,2 GB.

El modelo subyacente, Codestral-22B-v0.1, es un transformer decoder-only de Mistral AI especializado en generación de código, con 22 247 276 544 parámetros (22,25 mil millones) y una ventana de contexto nativa de 32 768 tokens. Esta versión cuantizada está pensada para ejecución en hardware de consumo: según la model card, requiere unos 10,51 GB de memoria unificada en Apple Silicon, 11,02 GB de VRAM dedicada en GPUs NVIDIA de las series RTX 30/40/50, o 12,51 GB de RAM libre en CPU.

La relevancia de esta ficha radica en que permite ejecutar un modelo de código de 22B en equipos de gama alta de consumo, algo inviable con los pesos originales en FP16. No obstante, conviene señalar que el repositorio no incluye información sobre evaluación de calidad independiente, benchmarks reproducibles ni detalles del proceso de cuantización más allá de las cifras declaradas por el autor. La licencia declarada es Apache 2.0, aunque el modelo base de Mistral AI se distribuye bajo licencia propia de Mistral (MNPL), lo que introduce una ambigüedad legal que se detalla en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral) |
| Parametros totales | 22 247 276 544 (22,25 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base; la model card recomienda 8 192 tokens en GPU/Apple Silicon y 4 096 en CPU |
| Tipos de cuantizacion | Q3_K_M (3,5 bits por peso); el repositorio solo publica esta variante |
| Idiomas soportados | No disponible (la model card no los detalla; el modelo base está orientado a código y texto en inglés principalmente) |
| Licencia | Apache 2.0 declarada en el repo; el modelo base Codestral-22B-v0.1 usa la licencia Mistral AI Non-Production License (MNPL) |
| Formato de pesos | GGUF (fichero `mistralai--Codestral-22B-v0.1-Q3_K_M.gguf`, 9,52 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Codestral-22B-v0.1 de Mistral AI: un transformer decoder-only denso con 22,25 mil millones de parámetros y atención con ventana de contexto de 32 768 tokens. Codestral está entrenado específicamente para tareas de generación y completado de código en más de 80 lenguajes de programación, según la documentación pública de Mistral AI. La model card de esta cuantización no aporta detalles adicionales sobre la composición del dataset de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO; esa información corresponde al modelo original y no se reproduce aquí.

La innovación técnica de este artefacto es exclusivamente la cuantización: conversión a Q3_K_M mediante la herramienta `run-any-model`, un motor de optimización device-aware desarrollado por el autor (PranilShah-08). La model card reporta una retención de calidad del 91,0 % respecto al baseline FP16, un ratio de compresión de 4,57x y la aceleración de las 56 capas del modelo en Metal. Estas cifras son declaraciones del autor y no vienen acompañadas de una metodología de evaluación reproducible ni de resultados en benchmarks estándar, por lo que deben tomarse con cautela.

## Capacidades

- Generación y completado de código en múltiples lenguajes de programación (capacidad heredada del modelo base Codestral-22B-v0.1).
- Relleno de código intermedio (fill-in-the-middle), funcionalidad característica de la familia Codestral.
- Generación de texto general y respuestas conversacionales multi-turno.
- Razonamiento sobre código: explicación, refactorización y depuración de fragmentos.
- Ejecución local en hardware de consumo gracias a la cuantización Q3_K_M.
- Integración con runners GGUF estándar: llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI, según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta cuantización.
- Capacidades multimodales (visión, audio): no disponibles; el modelo base es exclusivamente de texto.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente de código en local para desarrolladores individuales: el modelo puede autocompletar y explicar código directamente en el portátil del desarrollador sin enviar datos a servicios en la nube, gracias a que los 9,52 GB de pesos caben en 11 GB de VRAM o en 16 GB de memoria unificada en Apple Silicon.
- Revisión de código en entornos con requisitos de privacidad: equipos que no pueden usar APIs externas pueden desplegar el GGUF con llama.cpp u Ollama y ejecutar tareas de análisis estático asistido, generación de tests unitarios y sugerencias de refactorización.
- Generación de documentación técnica: el modelo puede producir docstrings y documentación a partir de firmas de funciones y bloques de código, aprovechando su entrenamiento específico en código.
- Prototipado rápido en estaciones de trabajo con GPU de consumo: con 11,02 GB de VRAM en una RTX 3080/4070/4080, se puede levantar un servidor local de completado de código para editores como VS Code mediante extensiones compatibles con endpoints OpenAI o llama.cpp.
- Educación y aprendizaje de programación: el modelo puede explicar fragmentos de código y responder preguntas técnicas en un entorno controlado y sin coste por token.
- Automatización de tareas de migración de código: conversión entre lenguajes o entre versiones de un framework en pipelines locales, con contexto de hasta 8 192 tokens recomendados en GPU.
- Experimentación en investigación sobre cuantización: el artefacto sirve como caso de estudio para medir la degradación de calidad de Q3_K_M frente a FP16 en tareas de código, aunque el autor no publica dicha evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente métricas internas del proceso de cuantización (tamaño de pesos, uso de memoria, retención de calidad estimada del 91,0 %), pero no reporta resultados en MMLU, HumanEval, GSM8K, MBPP ni ningún otro benchmark estándar, ni para el modelo base ni para la versión cuantizada.

| Metrica | FP16 (baseline) | Q3_K_M (cuantizado) | Variacion |
|---|---|---|---|
| Precision | 16,0 bits/parametro | 3,5 bits/parametro | -78,1 % |
| Tamano de pesos | 43,51 GB | 9,52 GB | -78,1 % |
| KV cache | 896,0 MB | 896,0 MB | Sin cambios |
| RAM residente total | 44,50 GB | 10,51 GB | -76,4 % |
| Calidad estimada | 100,0 % | 91,0 % | -9,0 % |
| Capas aceleradas | 0 % | 56/56 | Optimo |

Estos datos proceden del informe de telemetría del autor (`run-any-model`) y no de una evaluación independiente con benchmarks de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,02 GB de VRAM dedicada en GPUs NVIDIA (serie RTX 30/40/50) para contexto de 8 192 tokens; 10,51 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4/M5) con Metal; 12,51 GB de RAM libre en CPU x86 con AVX2/AVX-512 para contexto de 4 096 tokens.
- GPUs recomendadas: RTX 3080 (10 GB) queda justa y puede requerir reducir contexto; RTX 4080/4090 (16/24 GB), RTX 3090 (24 GB) y GPUs profesionales A100/H100 ofrecen margen amplio. En Apple Silicon, se recomienda un equipo con al menos 16 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM; en GPUs de 10 GB puede funcionar con contexto reducido u offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI `run-any-model` del autor.
- Latencia y throughput estimados: no disponibles. La model card no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Codestral-22B-v0.1-GGUF (este) | 22,25 B | 32 768 (recomendado 8 192 en GPU) | GGUF Q3_K_M, 9,52 GB | Apache 2.0 declarada; base MNPL | Hugging Face, 0 descargas |
| Codestral-22B-v0.1 (Mistral AI) | 22,25 B | 32 768 | Safetensors FP16/BF16, ~43,5 GB | MNPL (no comercial) | Hugging Face oficial |
| Qwen2.5-Coder-32B (Alibaba) | 32 B | 32 768 (hasta 128K en variantes) | Safetensors, GGUF en repos de terceros | Apache 2.0 | Hugging Face |
| DeepSeek-Coder-V2-Lite (DeepSeek) | 16 B totales (2,4 B activos, MoE) | 128 000 | Safetensors, GGUF en repos de terceros | Licencia DeepSeek (permisiva con condiciones) | Hugging Face |

La comparación se limita a parámetros, contexto y licencia, ya que no hay datos de benchmarks publicados para esta cuantización. Frente al Codestral original, la ventaja es el tamaño reducido para hardware de consumo; frente a Qwen2.5-Coder-32B, este último ofrece licencia Apache 2.0 sin ambigüedad y mayor tamaño, aunque requiere más memoria; DeepSeek-Coder-V2-Lite, al ser MoE, activa solo 2,4 B de parámetros por token y es más ligero en cómputo, con contexto de 128K.

## Limitaciones y advertencias

- Ambigüedad de licencia: el repositorio declara Apache 2.0, pero el modelo base Codestral-22B-v0.1 se distribuye bajo la Mistral AI Non-Production License (MNPL), que restringe el uso comercial. La relicenciación a Apache 2.0 por parte de un tercero es jurídicamente discutible y no está respaldada por Mistral AI.
- Degradación de calidad por cuantización: Q3_K_M es una cuantización agresiva (3,5 bits por peso). El propio autor estima una retención del 91 %, lo que implica una pérdida notable en tareas sensibles a la precisión, como generación de código complejo o razonamiento matemático. No hay evaluación independiente que lo confirme o matice.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en tareas de código puede generar APIs inexistentes, firmas incorrectas o dependencias no disponibles. Requiere validación en producción.
- Sesgos: no documentados en la model card. El modelo base puede reproducir sesgos presentes en sus datos de entrenamiento, especialmente en texto libre.
- Idiomas: la model card no especifica idiomas soportados; el modelo base está optimizado para inglés y código, por lo que el rendimiento en castellano puede ser inferior.
- Contexto efectivo limitado en la práctica: aunque el modelo base soporta 32 768 tokens, la model card recomienda 8 192 en GPU y 4 096 en CPU por limitaciones de memoria del KV cache y del hardware objetivo.
- Repositorio sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay issues, discusiones ni verificaciones de terceros sobre la integridad de los pesos.
- Sin garantías: la model card incluye una cláusula de exención de responsabilidad total sobre los outputs generados.
- Fecha de creación futura en los metadatos (2026-11-25): inconsistencia que conviene verificar antes de confiar en el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Codestral-22B-v0.1-GGUF
- Modelo base Codestral-22B-v0.1: https://huggingface.co/mistralai/Codestral-22B-v0.1
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio `run-any-model` (herramienta de cuantización): https://github.com/PranilShah-08/run-any-model
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Jan: https://jan.ai
- Text-Generation-WebUI: https://github.com/oobabooga/text-generation-webui
