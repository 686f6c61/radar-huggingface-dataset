# prithivMLmods/gemma-4-31B-it-NVFP4-GGUF

## Resumen

Gemma 4 31B-IT es el modelo insignia de la familia Gemma 4 de pesos abiertos de Google DeepMind: un modelo denso e instructivo de 30.697.345.956 parámetros totales (incluye un codificador de visión de aproximadamente 550M) distribuidos en 60 capas de decodificador, con una ventana de contexto de 256K tokens. Este repositorio concreto, `prithivMLmods/gemma-4-31B-it-NVFP4-GGUF`, es una cuantización NVFP4 en formato GGUF del modelo base `google/gemma-4-31B-it`, publicada por el usuario prithivMLmods y pensada para inferencia local acelerada por hardware en GPUs NVIDIA Blackwell.

El problema que resuelve esta variante es el de ejecutar un modelo multimodal de 31B en estaciones de trabajo y servidores con aceleradores Blackwell (RTX Pro 6000, RTX 50-series, B200, B300), aprovechando los Tensor Cores FP4 nativos. El repositorio incluye además un fichero independiente de Multi-Token Prediction (MTP) en BF16 que actúa como cabezal de borrador para decodificación especulativa, sin necesidad de un modelo draft separado.

La relevancia actual del modelo reside en su combinación de contexto muy largo (256K), capacidades multimodales (texto, imagen y vídeo como secuencias de fotogramas), soporte de más de 140 idiomas, function calling estructurado y modo de razonamiento paso a paso conmutables, todo bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal, 60 capas de decodificador, atención local con ventana deslizante (1024 tokens) intercalada con atención global completa, Keys/Values unificadas y Proportional RoPE (p-RoPE) |
| Parametros totales | 30.697.345.956 (incluye codificador de visión de ~550M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | NVFP4 (fichero principal, 31,5 GB); BF16 para el fichero MTP (955 MB); mmproj en GGUF (1,2 GB) |
| Idiomas soportados | Más de 140 idiomas según la model card; el campo `language` del repo declara únicamente `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (NVFP4, BF16 para MTP, mmproj) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 60 capas con una arquitectura de atención híbrida: capas de atención local con ventana deslizante de 1024 tokens intercaladas con capas de atención global completa, empleando Keys/Values unificadas y Proportional RoPE (p-RoPE). Incorpora un codificador de visión de aproximadamente 550M de parámetros que permite procesar imágenes de resolución variable y vídeo como secuencias de fotogramas, con un presupuesto de tokens visuales configurable entre 70 y 1.120 tokens.

El repositorio no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card sí menciona soporte nativo de system prompts, function calling estructurado y un modo de razonamiento conmutable mediante la etiqueta `<|think|>`. La innovación técnica destacable de esta distribución es el uso de Multi-Token Prediction (MTP) como mecanismo de decodificación especulativa: los cabezales MTP actúan como borrador y se distribuyen en un fichero GGUF BF16 independiente que se carga junto al modelo principal.

## Capacidades

- Generación de texto y razonamiento paso a paso conmutable mediante `<|think|>`.
- Comprensión multimodal: imagen de resolución variable y vídeo como secuencia de fotogramas, con presupuesto de tokens visuales configurable (70 a 1.120).
- Razonamiento matemático y resolución de problemas (resultados reportados en AIME 2026 sin herramientas y MATH-Vision).
- Generación y comprensión de código (LiveCodeBench v6).
- Function calling estructurado y soporte nativo de system prompts.
- Multilingüe: más de 140 idiomas según la model card.
- Decodificación especulativa mediante cabezales MTP en fichero separado.
- Compatible con `text-generation-inference` y `transformers` según los tags del repositorio.
- Pipeline declarado: `image-text-to-text`.

## Casos de uso

- Asistencia multimodal en estación de trabajo: análisis de documentos escaneados, capturas de pantalla y diagramas técnicos combinando el codificador de visión con la ventana de 256K tokens para adjuntar múltiples imágenes en una misma conversación.
- Análisis de vídeo por muestreo de fotogramas: revisión de grabaciones o material audiovisual convirtiendo el vídeo en secuencias de fotogramas y ajustando el presupuesto de tokens visuales (70 a 1.120) según el detalle requerido.
- Generación de código en pipelines locales: integración mediante llama.cpp o `text-generation-inference` con function calling estructurado para tareas de refactorización, generación de tests y asistencia en CI/CD.
- Razonamiento matemático y científico asistido: uso del modo `<|think|>` para problemas de competición o verificación de cálculos, con resultados reportados en AIME 2026 y GPQA Diamond.
- Despliegue en servidores Blackwell: inferencia NVFP4 en B200/B300 o RTX Pro 6000 para servicios de atención al cliente multi-turno con contexto largo y latencia reducida gracias a MTP.
- Procesamiento multilingüe a gran escala: traducción, resumen y extracción de información en más de 140 idiomas sobre documentos extensos que caben en la ventana de 256K tokens.
- Agentes con tool calling: construcción de flujos multi-paso donde el modelo invoca funciones estructuradas y mantiene estado a lo largo de conversaciones largas.

## Benchmarks y rendimiento

Resultados reportados en la model card del repositorio para Gemma 4 31B-IT:

| Benchmark | Resultado |
|---|---|
| MMLU Pro | 85,2% |
| AIME 2026 (sin herramientas) | 89,2% |
| LiveCodeBench v6 | 80,0% |
| GPQA Diamond | 84,3% |
| MATH-Vision | 85,6% |

No se han publicado en la información disponible resultados de benchmarks específicos de la cuantización NVFP4 ni métricas de latencia o throughput para esta variante GGUF.

## Requisitos de hardware

- VRAM estimada para el fichero principal NVFP4: aproximadamente 31,5 GB, más 1,2 GB del mmproj y 955 MB del MTP si se activa la decodificación especulativa (en torno a 33,7 GB en total).
- GPUs recomendadas: NVIDIA Blackwell, en concreto RTX Pro 6000, RTX 50-series, B200 y B300, por el soporte nativo de Tensor Cores FP4 (SM120, GB202).
- No está pensado para GPUs consumer sin soporte FP4; en arquitecturas anteriores la ventaja del formato NVFP4 se pierde y puede requerir conversión o emulación.
- Opciones de despliegue: llama.cpp (`llama-cli`), `text-generation-inference` y `transformers` según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-NVFP4-GGUF (este repo) | 30,7B | 256K | Apache 2.0 | GGUF NVFP4 | Cuantización para Blackwell con MTP especulativo |
| google/gemma-4-31B-it (modelo base) | 30,7B | 256K | Apache 2.0 | safetensors | Pesos originales en precisión completa |
| Otras cuantizaciones GGUF de Gemma 4 31B-IT | 30,7B | 256K | Apache 2.0 | GGUF (Q4, Q8, etc.) | No disponibles en la información proporcionada |

No se dispone de datos sobre alternativas de otros fabricantes con especificaciones verificables en la información proporcionada.

## Limitaciones y advertencias

- El campo `language` del repositorio declara únicamente `en`, aunque la model card afirma soporte de más de 140 idiomas; conviene validar el rendimiento multilingüe antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos generativos; los resultados de benchmarks reportados por el autor no han sido verificados de forma independiente en esta ficha.
- La cuantización NVFP4 puede introducir degradación de calidad respecto a los pesos originales en BF16; no se han publicado evaluaciones comparativas de esta variante frente al modelo base.
- El fichero MTP es un componente auxiliar y no un modelo autónomo; cargarlo de forma aislada no produce inferencia válida.
- El rendimiento óptimo depende de hardware Blackwell; en GPUs sin soporte FP4 nativo el formato pierde su ventaja y puede requerir conversión.
- No se documentan sesgos específicos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO) en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base `google/gemma-4-31B-it`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/gemma-4-31B-it-NVFP4-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Fichero MTP BF16: https://huggingface.co/prithivMLmods/gemma-4-31B-it-NVFP4-GGUF/blob/main/gemma-4-31B-it-MTP-BF16.gguf
- Fichero principal NVFP4: https://huggingface.co/prithivMLmods/gemma-4-31B-it-NVFP4-GGUF/blob/main/Gemma-4-31B-it-NVFP4.gguf
- Fichero mmproj: https://huggingface.co/prithivMLmods/gemma-4-31B-it-NVFP4-GGUF/blob/main/Gemma-4-31B-it.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/prithivMLmods
