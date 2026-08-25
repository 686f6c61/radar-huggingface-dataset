# horiuchinobuyuki/Qwick-3.5-9B

## Resumen

Qwick-3.5-9B es un ajuste fino del modelo Qwen3.5-9B, desarrollado por Nobuyuki Horiuchi, cuyo objetivo principal es reducir la longitud de las cadenas de razonamiento (thinking tokens) que el modelo base tiende a generar en exceso, manteniendo al mismo tiempo la precisión en tareas de razonamiento, código y conocimiento general. Se trata de un checkpoint independiente en BF16 que carga directamente desde Hugging Face y está pensado para entornos de producción donde el coste por token y la latencia son críticos.

El modelo conserva las capacidades del Qwen3.5-9B original, incluyendo razonamiento, generación de código, matemáticas y una validación de visión sobre el split de validación de MMMU, aunque el pipeline declarado es text-generation. Con 9.409.813.744 parámetros (9,4B) y una arquitectura transformer densa, ofrece una alternativa más eficiente en consumo de tokens sin sacrificar rendimiento. La licencia Apache 2.0 permite uso comercial sin restricciones.

Su relevancia actual radica en que aborda un problema práctico común en los LLM modernos: el exceso de razonamiento en preguntas sencillas. Al reducir la longitud media de las respuestas entre un 20% y un 55% según el benchmark, Qwick-3.5-9B se posiciona como una opción atractiva para aplicaciones con presupuesto de tokens limitado o requisitos de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible oficialmente; en la evaluacion se uso contexto de servidor de 131.072 tokens |
| Tipos de cuantizacion | BF16, FP8, NVFP4 |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, FP8, NVFP4) |

## Arquitectura y entrenamiento

Qwick-3.5-9B hereda la arquitectura del modelo base Qwen3.5-9B, un transformer denso de 9,4B parámetros con capacidades multimodales (visión y texto), aunque el pipeline publicado es text-generation. El ajuste fino se centra exclusivamente en reducir la longitud de los razonamientos: el modelo aprende a generar cadenas de pensamiento más concisas sin degradar la precisión. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de optimización (si se empleó RLHF, DPO u otro enfoque). La model card menciona un "holdout sintético de 384 prompts" utilizado como compuerta interna de validación, pero no se especifica su composición ni el procedimiento de entrenamiento.

La innovación principal de este modelo no reside en la arquitectura, sino en el objetivo del ajuste: minimizar el número de tokens de razonamiento manteniendo la calidad de las respuestas. Los resultados reportados muestran reducciones de longitud de entre el 22% y el 54% según la tarea, con cambios de precisión que van desde -1,013 puntos porcentuales (JMMLU) hasta +7,299 puntos porcentuales (LiveCodeBench v6). El modelo también conserva capacidades de visión, aunque la evaluación de MMMU se realizó sobre el split de validación (900 filas) y no sobre el test completo de 10.500 filas.

## Capacidades

- Generacion de texto y razonamiento: mantiene la precision del modelo base en tareas como MMLU-Pro (81,117%) y GPQA-Diamond (79,798%).
- Generacion de codigo: mejora significativa en LiveCodeBench v6 (73,839%, +7,299 pp frente al base), con una reduccion del 51% en tokens de salida.
- Matematicas y conocimiento cientifico: rendimiento solido en GPQA-Diamond, superando al modelo base en +2,020 pp.
- Vision (validada): conserva capacidades de comprension de imagenes, evaluadas en MMMU validation (74,556% con presupuesto oficial-compatible).
- Multilingue: soporta ingles y japones (segun la model card).
- Eficiencia de razonamiento: produce respuestas entre un 20% y un 55% mas cortas que el modelo base, manteniendo la precision.
- Tool calling y agentes: no se menciona explicitamente en la documentacion; se asume que hereda las capacidades del modelo base Qwen3.5-9B, pero no esta confirmado.

## Casos de uso

- Generacion de codigo en produccion: gracias a su mejora en LiveCodeBench y a la reduccion del 51% en tokens de salida, es adecuado para integrarse en pipelines de CI/CD donde se generan parches o sugerencias de codigo, reduciendo costes de inferencia y latencia.
- Atencion al cliente automatizada: con un contexto de hasta 131.072 tokens (segun la evaluacion), puede gestionar conversaciones multi-turno largas con historial completo, generando respuestas concisas y precisas en ingles o japones.
- Analisis de documentos tecnicos y cientificos: su rendimiento en GPQA-Diamond y MMMU lo hace util para extraer conclusiones de articulos cientificos, informes tecnicos o imagenes con diagramas, con un razonamiento mas eficiente que el modelo base.
- Asistente de programacion con razonamiento eficiente: para entornos de desarrollo donde se necesita explicar algoritmos o depurar codigo, el modelo ofrece respuestas mas cortas y directas, reduciendo el tiempo de espera del desarrollador.
- Procesamiento de formularios y documentos en japones: al estar entrenado para ingles y japones, puede transcribir, resumir o extraer informacion de documentos en ambos idiomas, con menor consumo de tokens que alternativas mas verbosas.
- Sistemas de preguntas y respuestas sobre conocimiento general: en aplicaciones tipo chatbot o buscadores semanticos, el modelo responde con precision en MMLU-Pro (81,117%) y con una longitud de respuesta un 39% menor, lo que reduce el ancho de banda y el coste por consulta.

## Benchmarks y rendimiento

La model card del autor reporta resultados de evaluaciones locales emparejadas contra el checkpoint Qwen3.5-9B fijado. Los perfiles de muestreo se indican en la tabla (A: thinking, temperatura 1.0, top-p 0.95, top-k 20, presence penalty 1.5, max 32.768 tokens nuevos; V: igual que A pero con 1-5 imagenes y contexto de 131.072 tokens; C: thinking, temperatura 0.6, top-p 0.95, top-k 20, max 81.920 tokens).

| Benchmark | Qwen3.5-9B | Qwick-3.5-9B | Cambio en puntuacion | Cambio en tokens | Perfil |
|---|---:|---:|---:|---:|:---:|
| MMLU-Pro (12.032) | 81,383% | 81,117% | -0,266 pp | -39,51% | A |
| GPQA-Diamond (198) | 77,778% | 79,798% | +2,020 pp | -28,98% | A |
| IFEval prompt strict (541) | 89,279% | 89,649% | +0,370 pp | -22,78% | A |
| MMMU validation, presupuesto oficial-compatible (900) | 73,778% | 74,556% | +0,778 pp | -25,91% | V |
| JMMLU, common-clean (987) | 87,943% | 86,930% | -1,013 pp | -54,05% | A |
| LiveCodeBench v6, presupuesto (1.055) | 66,540% | 73,839% | +7,299 pp | -51,21% | C |

Ademas, se evaluaron las versiones cuantizadas en el mismo protocolo de MMMU validation:

| Modelo | Presupuesto oficial-compatible | Presupuesto estricto | Tokens medios | Delta vs Qwick BF16 |
|---|---:|---:|---:|---:|
| Qwen3.5-9B BF16 | 664/900 (73,778%) | 662/900 (73,556%) | 6476,48 | -0,778 pp |
| Qwick BF16 | 671/900 (74,556%) | 667/900 (74,111%) | 4798,66 | +0,000 pp |
| Qwick FP8 | 655/900 (72,778%) | 655/900 (72,778%) | 5022,40 | -1,778 pp |
| Qwick NVFP4 | 635/900 (70,556%) | 626/900 (69,556%) | 5437,84 | -4,000 pp |

Nota: la evaluacion de MMMU se realizo sobre el split de validacion completo (900 filas), no sobre el test de 10.500 filas. Los resultados de IFEval se obtuvieron con el perfil de razonamiento general recomendado, no con temperatura cero.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - BF16: ~18,8 GB (peso del modelo) + overhead de activaciones y KV cache. Se recomienda al menos 24 GB de VRAM.
  - FP8: ~9,4 GB, cabe en GPUs con 12-16 GB.
  - NVFP4: ~4,7 GB, cabe en GPUs con 8 GB o mas.
- GPUs recomendadas:
  - BF16: NVIDIA A100 40GB, RTX 4090 24GB, L40S, H100.
  - FP8: RTX 4090, A10G, L4 (16 GB).
  - NVFP4: RTX 4060 Ti 16GB, Jetson Orin (64GB), Jetson Thor.
- Opciones de despliegue:
  - Transformers con `Qwen3_5ForConditionalGeneration` (compatible con el codigo de ejemplo de la model card).
  - vLLM, TGI y otros motores compatibles con el formato safetensors y la arquitectura Qwen3.5 (no confirmado explicitamente, pero probable).
  - Ollama: el modelo base Qwen3.5-9B esta disponible en Ollama; este fine-tune podria importarse como un GGUF si se convierte, aunque no se proporciona un GGUF oficial.
  - llama.cpp: posible tras conversion a GGUF.
- Latencia y throughput: no se proporcionan datos especificos. La reduccion de tokens de salida (entre 20% y 55%) implica una mejora proporcional en latencia y coste por peticion en comparacion con el modelo base.

## Comparativa con modelos similares

La comparativa mas directa es contra el modelo base Qwen3.5-9B, del cual deriva. No se dispone de datos de otros modelos de tamano similar (p.ej., Llama 3.1 8B, Mistral 7B) en la informacion proporcionada.

| Modelo | Parametros | Contexto | MMLU-Pro | GPQA-Diamond | LiveCodeBench v6 | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Qwen3.5-9B (base) | 9,4B | 131k (segun documentacion) | 81,383% | 77,778% | 66,540% | Apache 2.0 |
| Qwick-3.5-9B | 9,4B | 131k (usado en evaluacion) | 81,117% | 79,798% | 73,839% | Apache 2.0 |

La ventaja principal de Qwick-3.5-9B es la reduccion de tokens de salida (entre 22% y 54% segun la tarea) con una perdida minima de precision en MMLU-Pro (-0,266 pp) y una mejora notable en codigo (+7,299 pp) y en GPQA-Diamond (+2,020 pp). Para aplicaciones sensibles al coste por token, esta diferencia es significativa.

## Limitaciones y advertencias

- La evaluacion de vision se realizo solo sobre el split de validacion de MMMU (900 filas), no sobre el test completo de 10.500 filas. El autor advierte que el pipeline sigue siendo text-generation y que el despliegue multimodal amplio no esta cualificado para produccion.
- Las versiones cuantizadas FP8 y NVFP4 muestran degradacion en MMMU: -1,778 pp y -4,000 pp respectivamente frente al BF16. Si la precision en tareas de vision es critica, se recomienda usar BF16.
- El modelo declara soporte solo para ingles y japones. Otros idiomas pueden funcionar, pero no estan validados.
- No se especifican sesgos conocidos ni riesgos de alucinacion, pero al ser un LLM basado en Qwen, puede presentar los mismos sesgos que el modelo base.
- La reduccion de tokens de razonamiento podria afectar a tareas que requieren cadenas de pensamiento muy largas, aunque los benchmarks no muestran degradacion significativa en las tareas evaluadas.
- No se proporcionan datos sobre el dataset de entrenamiento ni el metodo de ajuste, lo que limita la reproducibilidad y la comprension de posibles sesgos introducidos por el fine-tuning.
- El autor indica que la compuerta interna de validacion (holdout de 384 prompts) se evaluo una sola vez con temperatura cero y no es comparable con las evaluaciones publicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Documento de evaluacion (EVALUATION.md): https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B/blob/main/EVALUATION.md
- Resultados de la compuerta interna (heldout_results.json): https://huggingface.co/horiuchinobuyuki/Qwick-3.5-9B/blob/main/heldout_results.json
- Qwen3.5-9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Guia de Qwen3.5-9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Guia completa de Qwen3.5-9B (en japones): https://www.oflight.co.jp/en/columns/qwen35-9b-complete-guide
