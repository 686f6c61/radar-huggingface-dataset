# KarLexAI/Kimi-K3.1-Pro-GGUF

## Resumen

Kimi-K3.1-Pro-GGUF es una colección de cuantizaciones post-entrenamiento en formato GGUF del modelo moonshotai/Kimi-K3.1-Pro, publicada por KarLexAI (KLX). El modelo base es un transformer de tipo mezcla de expertos (MoE) con 2,78 billones de parámetros totales, y esta ficha distribuye tres variantes de cuantización de baja precisión (1,7 a 2 bits por peso) diseñadas para ejecutarse íntegramente en un único nodo de 8 GPU H100 de 80 GB.

La relevancia del artefacto es de ingeniería: demuestra que un modelo de 2,8 billones de parámetros puede comprimirse hasta 592,7 GB conservando capacidad de razonamiento medible (80,0 % en AIME 2025 según el autor) y ejecutarse con llama.cpp estándar, sin forks, con 131 072 tokens de contexto. Las tres variantes publicadas son KLX-IQ1_S (592,7 GB), KLX-IQ1_M (647,9 GB) y KLX-IQ2_XXS (709,9 GB).

No es un modelo nuevo ni un fine-tuning: es una conversión de pesos del modelo de Moonshot AI, sujeta a la licencia Kimi K3.1-Pro. El repositorio ocupa 1952,2 GB e incluye además proyectores de visión separados (mmproj) en F16 y BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); detalles de capas y expertos no disponibles |
| Parametros totales | 2.779.661.661.792 (2,78 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configuración documentada por el autor) |
| Tipos de cuantizacion | KLX-IQ1_S (~1,7 bits/peso), KLX-IQ1_M, KLX-IQ2_XXS; tipos de tensor estándar de llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (licencia propia de Moonshot AI) |
| Formato de pesos | GGUF (multiparte, 14 shards en KLX-IQ1_S); mmproj en F16 y BF16 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con arquitectura de mezcla de expertos (MoE) de 2,78 billones de parámetros totales, según los metadatos de safetensors del modelo base. El autor de la cuantización no documenta el número de capas, la dimensión oculta, el número de expertos ni el número de parámetros activos por token. Tampoco se detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica de este repositorio es puramente de cuantización. KarLexAI aplica esquemas propietarios KLX-IQ1_S, KLX-IQ1_M y KLX-IQ2_XXS que, según el autor, producen una divergencia KL media frente al modelo completo un 14,5 % menor a 710 GB y un 6,2 % menor a 648 GB en comparación con cuantizaciones estándar del mismo tamaño. Todos los tipos de tensor empleados son estándar de llama.cpp, por lo que el modelo se ejecuta en la rama upstream sin parches. El soporte del modelo base en llama.cpp llegó con el PR #31779 (6 de noviembre de 2026) y el soporte de visión con el PR #31980 (10 de noviembre de 2026).

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 131 072 tokens.
- Razonamiento explícito (modo «thinking»), con resultados declarados de 80,0 % en AIME 2025, 91,0 % en MATH-500 y 94,0 % en IFEval para KLX-IQ1_S.
- Razonamiento matemático de competición y resolución de problemas de varios pasos.
- Entrada de imágenes mediante el proyector de visión opcional (mmproj-F16.gguf o mmproj-BF16.gguf, ~0,9 GB).
- Compatibilidad con plantillas Jinja (`--jinja`) para formateo de chat y roles.
- Soporte de tool calling y function calling: no documentado explícitamente en la model card, aunque el modelo base está etiquetado como «conversational» y «reasoning».
- Capacidades multilingües: no disponibles en la información proporcionada.
- Servido en paralelo con múltiples slots (`-np 4`) y endpoints compatibles según los tags del repositorio.

## Casos de uso

- Razonamiento matemático y científico de alta dificultad: el modelo mantiene un 80,0 % en AIME 2025 a 1,7 bits por peso, por lo que resulta adecuado para validación de demostraciones, generación de problemas y asistencia a investigación en entornos donde no se dispone de la versión completa de 1,56 TB.
- Despliegue en un único nodo de 8×H100: KLX-IQ1_S carga entero en GPU con 131 072 tokens de contexto y 19 tokens/s de generación, lo que permite ofrecer inferencia de un modelo de 2,8 B de parámetros sin clúster multi-nodo.
- Evaluación comparativa de cuantizaciones: las tres variantes (592,7 / 647,9 / 709,9 GB) con divergencia KL documentada permiten medir el impacto de la compresión sobre tareas de razonamiento en un mismo hardware.
- Procesamiento de documentos largos con imagen: la combinación de contexto de 131K y proyector de visión permite analizar informes, tablas y figuras en una sola pasada.
- Investigación sobre degradación por cuantización extrema: el repositorio publica BENCHMARKS.md con la metodología de medición, útil para estudiar la relación entre bits por peso y capacidades emergentes.
- Backend conversacional para prototipos internos: con llama-server y `--jinja` se levanta un endpoint HTTP compatible con OpenAI en dos comandos, adecuado para pruebas de producto antes de migrar a la versión completa.
- Generación asistida de código y razonamiento multi-paso en pipelines con `-np 4` para atender varias peticiones concurrentes por nodo.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card para KLX-IQ1_S (592,7 GB, ~1,7 bits/peso):

| Benchmark | KLX-IQ1_S |
|---|---|
| AIME 2025 | 80,0 % |
| MATH-500 | 91,0 % |
| IFEval | 94,0 % |
| Divergencia KL media vs. modelo completo (KLX-IQ1_S, 592,7 GB) | 0,106 |
| Divergencia KL media vs. modelo completo (KLX-IQ1_M, 647,9 GB) | 0,084 |
| Divergencia KL media vs. modelo completo (KLX-IQ2_XXS, 709,9 GB) | 0,072 |

Rendimiento declarado: 19 tokens/s en generación con KLX-IQ1_S sobre 8×H100 80 GB, contexto de 131 072 tokens y sin expertos en CPU. No se han publicado resultados de benchmarks del modelo base completo ni comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM: KLX-IQ1_S requiere algo más de 592,7 GB; KLX-IQ1_M, más de 647,9 GB; KLX-IQ2_XXS, más de 709,9 GB. El autor indica que se necesita más memoria que el tamaño del fichero, sumando VRAM y RAM del sistema.
- Configuración de referencia: un nodo de 8×H100 80 GB (640 GB de VRAM) ejecuta KLX-IQ1_S íntegramente en GPU con 131K de contexto. Las variantes IQ1_M e IQ2_XXS dejan parte de los expertos en RAM del sistema en ese mismo nodo.
- GPU consumer: no cabe en ninguna GPU consumer (RTX 4090, 24 GB; ni siquiera en configuraciones multi-GPU domésticas razonables).
- Despliegue: llama.cpp upstream (llama-server) con soporte de Kimi K3.1 desde el PR #31779; visión desde el PR #31980. Comando de referencia: `llama-server -m ... -ngl 999 --fit off -c 131072 -np 4 --jinja --temp 1.0 --top-p 0.95`. Con menos VRAM, usar `--fit on` para que llama.cpp decida qué expertos permanecen en RAM.
- Throughput: 19 tokens/s en generación con KLX-IQ1_S sobre 8×H100. No se documenta latencia de prefill ni throughput con `-np 4` bajo carga concurrente.
- vLLM, TGI y Ollama: no documentados para este artefacto; el formato es GGUF y el runtime de referencia es llama.cpp.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-GGUF (KLX-IQ1_S) | 2,78 B totales | 131.072 | GGUF, 592,7 GB | kimi-k3.1-pro | 80,0 % AIME 2025; 19 tok/s en 8×H100 |
| Kimi-K3.1-Pro-GGUF (KLX-IQ2_XXS) | 2,78 B totales | 131.072 | GGUF, 709,9 GB | kimi-k3.1-pro | KL media 0,072; parte de expertos en RAM en 8×H100 |
| moonshotai/Kimi-K3.1-Pro (original) | 2,78 B totales | no disponible | safetensors, ~1,56 TB en GGUF sin pérdida | kimi-k3.1-pro | Referencia de calidad; no cabe en un solo nodo de 8×H100 |
| Otras cuantizaciones estándar del mismo tamaño | 2,78 B totales | no disponible | GGUF | kimi-k3.1-pro | Según el autor, KL media un 14,5 % peor a 710 GB y un 6,2 % peor a 648 GB |

No se dispone de datos de benchmarks de modelos competidores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Cuantización extrema: 1,7 bits por peso implica pérdida de calidad medible (KL media 0,106 en KLX-IQ1_S). Las tareas sensibles a matices, formato estricto o razonamiento largo pueden degradarse respecto al modelo completo.
- Riesgo de alucinación: no se documenta ninguna mitigación específica; el autor no publica tasas de alucinación ni evaluaciones de veracidad.
- Idiomas: la información disponible no especifica la cobertura lingüística; no se debe asumir un rendimiento multilingüe homogéneo.
- Licencia: se rige por la Kimi K3.1-Pro License, no por una licencia open source estándar. Es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial; las restricciones concretas no se detallan en la información disponible.
- Requisito de hardware: no es desplegable en GPU consumer ni en estaciones de trabajo convencionales. El coste mínimo realista es un nodo de 8×H100 o equivalente con RAM suficiente para las variantes mayores.
- Dependencia de versión de llama.cpp: requiere builds posteriores a los PR #31779 y #31980 (noviembre de 2026); versiones anteriores no cargarán el modelo ni la visión.
- Visión separada: el codificador visual no está cuantizado (F16/BF16, ~0,9 GB) y solo se ha probado con KLX-IQ1_S según el autor.
- Sin fine-tuning: el artefacto no incorpora ajuste alguno; hereda sesgos y comportamientos del modelo base, que no se documentan.
- Repositorio de 1952,2 GB: la descarga selectiva por carpeta (`--include "KLX-IQ1_S/*"`) es necesaria para evitar transferir todas las variantes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KarLexAI/Kimi-K3.1-Pro-GGUF
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia: https://huggingface.co/KarLexAI/Kimi-K3.1-Pro-GGUF/blob/main/LICENSE
- Benchmarks y metodología: https://huggingface.co/KarLexAI/Kimi-K3.1-Pro-GGUF/blob/main/BENCHMARKS.md
- Carpeta KLX-IQ1_S: https://huggingface.co/KarLexAI/Kimi-K3.1-Pro-GGUF/tree/main/KLX-IQ1_S
- Carpeta KLX-IQ1_M: https://huggingface.co/KarLexAI/Kimi-K3.1-Pro-GGUF/tree/main/KLX-IQ1_M
- Carpeta KLX-IQ2_XXS: https://huggingface.co/KarLexAI/Kimi-K3.1-Pro-GGUF/tree/main/KLX-IQ2_XXS
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31779
- PR de soporte de visión en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31980
- Sitio del autor: https://karlex.ai
