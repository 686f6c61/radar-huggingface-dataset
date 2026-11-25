# mr-andrey-isachenko/Tenet-8B-Qwen3-Unslop-v2

## Resumen

Tenet-8B-Qwen3-Unslop-v2 es un ajuste fino del modelo Qwen/Qwen3-8B desarrollado por el usuario independiente mr-andrey-isachenko dentro de su familia experimental "Tenet v2". El modelo parte de la arquitectura transformer densa de Qwen3-8B (8.190.735.360 parametros segun los pesos en safetensors) y aplica una combinacion de tecnicas de edicion de pesos y aprendizaje por refuerzo orientadas a tres objetivos: preservar la integridad de las cadenas de razonamiento delimitadas por ``, reducir comportamientos de rechazo y "slop" (respuestas genericas o evasivas), y mantener capacidades de razonamiento, codigo, tool use y SQL bajo cuantizacion agresiva.

La propuesta tecnica del autor se articula en cuatro etapas etiquetadas como H15, H16, H14+ y H17: una cirugia de direcciones ("Tri-Anchor Lancet") que separa la fase de deliberacion de la fase de respuesta superficial, un entrenamiento GRPO con ventanas de longitud calibradas, una cuantizacion GGUF mixta guiada por CKA y un verificador mecanicamente determinista con 24 prompts. El modelo se distribuye con licencia Apache 2.0 y en formatos safetensors y GGUF, lo que facilita su despliegue tanto en vLLM como en llama.cpp.

Su relevancia actual radica en que aborda un problema concreto y poco documentado: los ajustes "abliterated" convencionales sobre modelos con modo de razonamiento tienden a romper las etiquetas de pensamiento o a truncar las cadenas de CoT, especialmente tras cuantizacion a 4 bits. Tenet v2 declara metricas de integridad estructural del 100% en ese aspecto, aunque se trata de datos autodeclarados por el autor y no verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF mixta (Q8_0, Q6_K, Q4_K_M) y FP8 E4M3; safetensors en precision completa |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con aproximadamente 8.190 millones de parametros. Sobre esa base, el autor aplica un pipeline propio en cuatro fases. La primera, H15 ("Phase-Segmented Tri-Anchor Lancet Surgery"), segmenta los estados ocultos en dos fases: la deliberacion interna dentro de `` y la respuesta superficial posterior a ``. Sobre la fase de deliberacion se define un ancla de autocorreccion de CoT ($a_{\text{cot}}$), ortogonalizada junto con un ancla de razonamiento formal ($a_{\text{math\_logic}}$) y un ancla de herramientas/SQL ($a_{\text{tool\_sql}}$) mediante Gram-Schmidt modificado en float32 a dos pasadas. Las direcciones de rechazo y slop se extraen exclusivamente de tokens de respuesta posteriores a `` y se biorroyectan al complemento ortogonal de las anclas, con restauracion de norma L2 por fila en las capas `[20, 17, 9, 5, 18, 21, 7, 19]`.

La segunda fase, H16, sustituye las penalizaciones lineales de longitud por un GRPO con ventana gaussiana asimetrica calibrada por tarea (objetivo de palabras en respuesta y presupuesto de deliberacion), una puerta de integridad estructural de etiquetas ``, con integridad estructural declarada del 100% de las etiquetas.
- Razonamiento matematico y resolucion de problemas cuantitativos (GSM8K, MATH-500).
- Generacion de codigo, con validacion mediante AST de Python segun el pipeline de evaluacion del autor.
- Generacion y validacion de configuraciones JSON.
- Tool use / function calling y consultas SQL de solo lectura (el autor declara 6/6 en pruebas de SQL de solo lectura).
- Capacidades agenticas y de razonamiento multi-paso, segun las etiquetas del repositorio.
- Comportamiento "uncensored"/"abliterated": reduccion deliberada de rechazos y respuestas evasivas.
- Soporte de inferencia en vLLM y en llama.cpp/GGUF; compatibilidad declarada con OpenRouter y endpoints compatibles con text-generation-inference.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes de razonamiento con traza auditable: el modelo expone su deliberacion dentro de ``, lo que permite registrar y auditar el proceso de razonamiento en aplicaciones donde la explicabilidad del paso intermedio es un requisito, como herramientas internas de analisis o soporte a decisiones.
- Generacion de codigo en pipelines de CI/CD: su capacidad declarada de tool calling y la validacion mediante AST de Python lo hacen util para tareas de generacion y comprobacion automatica de fragmentos de codigo, con verificacion sintactica antes de la integracion.
- Analisis de datos con SQL de solo lectura: el ajuste incluye un ancla especifica de herramientas/SQL y pruebas declaradas sobre DuckDB en modo lectura, adecuado para asistentes de consulta sobre almacenes de datos donde no se permite escritura.
- Generacion y validacion de ficheros de configuracion: el pipeline de evaluacion incluye prompts de configuracion JSON, por lo que encaja en herramientas que producen o corrigen ficheros de configuracion estructurados.
- Despliegue en hardware modesto mediante GGUF: la cuantizacion mixta Q4_K_M con proteccion de capas quirurgicas permite ejecutar el modelo en entornos con VRAM limitada manteniendo, segun el autor, la integridad del CoT.
- Evaluacion comparativa de tecnicas de edicion de modelos: investigadores interesados en abliteration, edicion de direcciones en el espacio de activaciones o GRPO pueden usar el modelo y su pipeline documentado como referencia reproducible.
- Aplicaciones que requieren baja tasa de rechazo: en escenarios de generacion creativa o redaccion tecnica donde los rechazos indiscriminados degradan la experiencia, el ajuste "unslop" reduce respuestas evasivas, siempre con las cautelas de la seccion de limitaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (fuente: Tenet OpenEvals con vLLM; no verificados de forma independiente).

| Benchmark | Metrica | Valor |
|---|---|---|
| IFEval | Prompt-level Strict Accuracy | 0,807763 |
| IFEval | Instruction-level Strict Accuracy | 0,868106 |
| MATH-500 | Accuracy | 0,722 |
| GSM8K | Strict Match (CoT) | 0,893101 |
| GSM8K | Accuracy | 0,909022 |
| GSM8K | Flexible Extract | 0,909022 |
| GPQA Diamond | Accuracy (zero-shot) | 0,40404 |
| MMLU-Pro | Accuracy | 0,597222 |

El autor declara ademas metricas internas de su pipeline H17: 10/10 puertas de publicacion superadas, 100,0 HP con 24/24 artefactos validos en la Arena House Series, 0,0% de colapso de longitud, 0,0% de slop/rechazo, 6/6 en SQL de solo lectura, 100% de tasa de exito "unslop", 2,72% de re-filtracion en el subespacio FP8 E4M3 y un Crest-Factor de fila de 4,37 (umbral < 25,0). No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 16,4 GB solo para pesos, mas overhead de contexto y cache KV; en FP8 E4M3, alrededor de 8,2 GB de pesos; en GGUF Q8_0, en torno a 8,7 GB; en Q6_K, unos 6,7 GB; en Q4_K_M, aproximadamente 5 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues en precision completa con contexto largo y concurrencia; L40S o RTX 6000 Ada para FP8; RTX 4090 (24 GB) para FP16 con contexto moderado o para GGUF en cuantizaciones altas.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB o mas usando GGUF Q4_K_M o Q6_K; en 16 GB es viable Q8_0; en 24 GB se puede usar FP16 con contexto limitado.
- Opciones de despliegue: vLLM (usado por el autor para las evaluaciones), llama.cpp y Ollama mediante los GGUF publicados, text-generation-inference (etiqueta `text-generation-inference`), y endpoints compatibles con OpenRouter.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks destacados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tenet-8B-Qwen3-Unslop-v2 | 8,19 B (denso) | No disponible | IFEval 80,8 / MATH-500 72,2 / GSM8K 89,3 / MMLU-Pro 59,7 (autodeclarados) | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3-8B (base) | 8,19 B (denso) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| Alternativas "abliterated"/"uncensored" sobre Qwen3-8B | ~8 B (denso) | No disponible | No disponible | Variable segun autor | Hugging Face |

La comparacion cuantitativa con el modelo base y con otros ajustes de la misma categoria no puede completarse con la informacion disponible: no se han proporcionado resultados de Qwen3-8B ni de otros derivados en los mismos benchmarks y con la misma configuracion de evaluacion.

## Limitaciones y advertencias

- Los benchmarks y las metricas internas (HP, integridad de etiquetas, tasas de slop) son autodeclarados por el autor y no han sido verificados de forma independiente; deben tratarse como indicativos.
- El ajuste "abliterated"/"uncensored" reduce deliberadamente los rechazos, lo que incrementa el riesgo de generar contenido inapropiado, inseguro o legalmente problematico; no es recomendable desplegarlo en aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a un modelo de 8 B de parametros, especialmente en GPQA Diamond (40,4% de acierto) y MMLU-Pro (59,7%), donde el margen de error es amplio.
- La edicion de direcciones en el espacio de activaciones puede degradar capacidades no cubiertas por las anclas definidas (matematicas, herramientas/SQL y CoT); no hay evaluacion publica de otras areas como vision, audio o tareas multilingues.
- No se especifican los idiomas soportados; el comportamiento fuera del ingles y del chino (idiomas principales de Qwen3) es desconocido.
- No se documenta la longitud de contexto efectiva tras el ajuste ni el impacto de la cuantizacion en contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion; la responsabilidad sobre el contenido generado recae en el desplegador.
- El repositorio tiene un volumen de descargas muy bajo (147) y cero "likes", lo que limita la evidencia de uso en comunidad y el soporte disponible.
- El pipeline de evaluacion propio (Tenet OpenEvals, Arena House Series) no es un estandar reconocido; sus metricas no son directamente comparables con las de otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Qwen3-Unslop-v2
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio Tenet Lab del autor: https://github.com/mrAndreyIsachenko/tenet-lab
- Dataset IFEval: https://huggingface.co/datasets/google/IFEval
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
