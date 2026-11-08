# necropopeost/S5-nano-MLX-8bit-vision

## Resumen

S5-nano-MLX-8bit-vision es una conversión no oficial al formato MLX, cuantizada en 8 bits, del modelo multimodal maritaca-ai/S5-nano desarrollado por Maritaca AI. El autor de la conversión es el usuario de Hugging Face necropopeost, que no tiene vínculo con Maritaca AI. El objetivo es permitir la ejecución local del modelo en Macs con Apple Silicon, incluyendo el encoder de visión, manteniendo una calidad de razonamiento próxima al modelo original en BF16.

El modelo resuelve el problema de inestabilidad del modo Think (razonamiento largo) que presentaba la conversión previa a 4 bits: la compresión agresiva introducía ruido que degradaba la cadena de pensamiento. La versión de 8 bits con grupos de 64 restaura la estabilidad lógica, a costa de un mayor consumo de memoria (unos 5,1 GB de pesos y 6-7 GB de RAM libre recomendados).

La conversión conserva los módulos de visión (vision tower) y el proyector multimodal en BF16, de modo que las capacidades de interpretación de imágenes, OCR y análisis de gráficos se mantienen equivalentes al original. El modelo base tiene 4.539.265.536 parámetros totales y soporta portugués e inglés. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como qwen3_5; transformer multimodal con vision tower y proyector) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits affine con grupos de 64 (MLX); vision tower y proyector en BF16 |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx-vlm |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base maritaca-ai/S5-nano en la documentacion proporcionada. La etiqueta de Hugging Face lo asocia a qwen3_5, lo que sugiere una familia de transformer multimodal, pero no se confirma la estructura exacta ni el numero de capas, dimensiones ocultas o mecanismo de atencion.

Tampoco se documentan los datos de entrenamiento: numero de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineacion. La unica innovacion tecnica descrita por el autor de la conversion es el esquema de cuantizacion: pesos de texto en 8 bits con grupos de 64, mientras que el vision tower y el proyector multimodal se mantienen en BF16 para preservar la calidad perceptiva. El modelo base incorpora un modo Think (razonamiento extendido) y un modo Instruct, ambos accesibles mediante la plantilla de chat con el parametro `enable_thinking`.

## Capacidades

- Generacion de texto y razonamiento logico, con un modo Think de cadena de pensamiento larga y un modo Instruct de respuesta directa.
- Razonamiento matematico y resolucion de problemas complejos, segun la validacion del autor en el dataset ENADE.
- Generacion y analisis de codigo, aunque sin datos de benchmarks publicados en la informacion disponible.
- Vision multimodal: descripcion de imagenes, OCR, interpretacion de graficos y analisis de contenido visual.
- Procesamiento de conversaciones multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidades multilingues limitadas a portugues e ingles.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.

## Casos de uso

- Analisis de documentos escaneados en portugues: el modelo puede extraer texto mediante OCR y resumir el contenido, aprovechando que el vision tower se mantiene en BF16 y conserva la precision del original.
- Atencion al cliente en portugues sobre Mac local: permite desplegar un asistente conversacional sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad.
- Interpretacion de graficos y tablas en informes: el modelo describe y razona sobre figuras, util para revisiones de analitica en flujos de trabajo de escritorio.
- Razonamiento matematico asistido: el modo Think estabilizado en 8 bits permite resolver problemas paso a paso en un Mac con 16 GB o mas de RAM.
- Prototipado de aplicaciones multimodales en Apple Silicon: sirve como banco de pruebas para desarrolladores que quieran integrar vision y texto con `mlx-vlm` antes de pasar a produccion.
- Educacion y tutoria en portugues: generacion de explicaciones detalladas con cadena de pensamiento visible, util para entornos de aprendizaje offline.
- Evaluacion comparativa de cuantizaciones: el propio autor lo propone como referencia para contrastar la estabilidad del modo Think frente a la version de 4 bits.

## Benchmarks y rendimiento

| Benchmark | Version | Resultado | Notas |
|---|---|---|---|
| ENADE-QA (dataset northern-64bit, MCQ) | S5-nano-MLX-8bit-vision, modo Think | 80,00% de acierto | Muestra de 5 preguntas complejas |
| ENADE-QA (dataset northern-64bit, MCQ) | S5-nano-MLX-8bit-vision, modo Instruct | no disponible (descrito como "altamente estable, superior al 4-bit") | Sin cifra concreta |
| Vision (OCR, graficos) | S5-nano-MLX-8bit-vision | no disponible | El autor afirma equivalencia con BF16 al mantener BF16 el vision tower |

El tamano muestral de 5 preguntas es demasiado reducido para extraer conclusiones robustas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: aproximadamente 5,1 GB de pesos; el autor recomienda 6-7 GB de memoria libre en el sistema y un minimo de 16 GB de RAM en el Mac.
- GPU: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max, Ultra) mediante el framework MLX. No es compatible con CUDA ni ROCm.
- GPU de consumo: si, en cualquier Mac con Apple Silicon y 16 GB o mas de memoria unificada.
- Despliegue: `mlx-vlm` (unica via documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato de cuantizacion MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| S5-nano-MLX-8bit-vision | 4.539 M | no disponible | Apache 2.0 | MLX safetensors 8-bit | Conversion no oficial, vision en BF16, solo Apple Silicon |
| maritaca-ai/S5-nano (BF16) | 4.539 M | no disponible | Apache 2.0 | safetensors BF16 | Modelo original, ~8,7 GB, requiere mas memoria |
| arcee-ai/Trinity-Nano-Preview-MLX-8bit | ~6.000 M (MoE, 1.000 M activos) | no disponible | no disponible | MLX 8-bit | MoE de Arcee AI, chat tuned, tambien para Apple Silicon |

La comparacion con Trinity Nano es solo orientativa: se trata de un MoE de 6B con 1B activos, por lo que su coste de inferencia y su perfil de rendimiento difieren del transformer denso de 4,5B de S5-nano. No se dispone de benchmarks cruzados entre ambos.

## Limitaciones y advertencias

- Conversion no oficial: el autor no tiene vinculo con Maritaca AI y no garantiza paridad exacta con el modelo original.
- El benchmark ENADE se realizo sobre solo 5 preguntas, por lo que el 80% de acierto no es estadisticamente representativo.
- Idiomas limitados a portugues e ingles; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- No se documenta la longitud de contexto del modelo base, lo que impide planificar cargas de documentos largos.
- Riesgo de alucinacion inherente a los modelos generativos, sin datos especificos de mitigacion en esta conversion.
- El modo Think requiere mas tokens de salida y aumenta la latencia; en la version de 4 bits era inestable, y aunque la de 8 bits lo corrige, el consumo de memoria es mayor.
- Dependencia exclusiva del ecosistema MLX y de hardware Apple Silicon: no desplegable en servidores NVIDIA ni en entornos cloud estandar.
- Sin soporte documentado de tool calling ni de flujos agenticos, lo que limita su uso en pipelines automatizados complejos.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero conviene verificar las condiciones del modelo original maritaca-ai/S5-nano antes de explotarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/necropopeost/S5-nano-MLX-8bit-vision
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Perfil del autor de la conversion: https://huggingface.co/necropopeost
- Dataset de evaluacion ENADE: https://huggingface.co/datasets/northern-64bit/ENADE_Brazilian_national_university_examination_MCQ_483
- Referencia comparativa MLX: https://huggingface.co/arcee-ai/Trinity-Nano-Preview-MLX-8bit
