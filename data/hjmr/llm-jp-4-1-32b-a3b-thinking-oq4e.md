# hjmr/llm-jp-4.1-32b-a3b-thinking-oQ4e

## Resumen

llm-jp-4.1-32b-a3b-thinking es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el Centro de Investigación y Desarrollo de Grandes Modelos de Lenguaje del Instituto Nacional de Informática de Japón (NII). Forma parte de la familia LLM-jp-4.1, una serie de modelos de distintos tamanos (8B denso, 33B denso y 32B-A3B MoE) disenados especificamente para el idioma japones y el bilingueismo japones-ingles. La variante "thinking" ha sido post-entrenada con SFT y DPO para generar razonamiento explicito antes de responder.

El modelo que documenta esta ficha es, en concreto, una cuantizacion de 4 bits del checkpoint original, realizada por el usuario hjmr mediante la herramienta oQ (oMLX v0.8.0rc1) con cuantizacion de precision mixta y formato MLX safetensors. Esto lo hace ejecutable en hardware Apple Silicon a traves del framework MLX, reduciendo el peso del repositorio a 19,1 GB frente a los aproximadamente 64 GB que ocuparia en bf16.

La relevancia actual del modelo radica en su combinacion de contexto largo (65.536 tokens), arquitectura MoE eficiente (3.827 millones de parametros activos de un total de 32.139 millones) y un enfasis claro en capacidades de razonamiento matematico, cientifico y de codigo evaluadas con benchmarks especificos para japones. La cuantizacion MLX amplia su accesibilidad a equipos con memoria unificada de gama alta, un nicho hasta ahora poco cubierto por modelos japoneses de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo `qwen3_moe`), 32 capas, hidden size 2.560, 40 heads |
| Parametros totales | 32.139.028.992 (~32,1B) |
| Parametros activos | 3.827.476.992 (~3,83B) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta (oQ / oMLX v0.8.0rc1) |
| Idiomas soportados | No disponible de forma explicita (la familia LLM-jp esta orientada a japones e ingles) |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (repo de 19,1 GB) |
| Expertos enrutados / activados | 128 / 8 |
| Parametros de embedding | 503.316.480 |
| Parametros no-embedding | 31.635.712.512 |
| Tokenizer | Unigram byte-fallback (basado en `llm-jp-tokenizer v4.0`) |
| Libreria | MLX |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 32 capas, 128 expertos enrutados de los cuales se activan 8 por token, y una dimension oculta de 2.560 con 40 cabezas de atencion. Esta configuracion permite un total de 32,1B parametros con solo 3,83B activos por token, lo que reduce el coste computacional de inferencia de forma significativa. El contexto maximo es de 65.536 tokens. El tokenizer es un modelo Unigram byte-fallback implementado con `huggingface/tokenizers`, con vocabulario derivado de `llm-jp-tokenizer v4.0`; el autor advierte que el entrenamiento puro con SentencePiece no reproduce este vocabulario.

El pre-entrenamiento y mid-training se realizaron sobre un total de 11,7 billones de tokens mediante un pipeline multi-etapa, con corpus publicados en GitLab (aunque parte queda excluida por restricciones de licencia). El post-entrenamiento consistio en SFT seguido de DPO, sin fase de reinforcement learning. Los datasets de SFT y DPO estan publicados en Hugging Face. La plantilla de chat esta disenada para ser compatible con el formato OpenAI Harmony, aunque el tokenizer no es compatible con la libreria `openai-harmony`, por lo que debe usarse el tokenizer incluido en el modelo.

La cuantizacion de esta ficha concreta aplica 4 bits con group size 64 y precision mixta mediante oQ, preservando presumiblemente las capas mas sensibles en mayor precision. No se dispone de informacion sobre la metodologia exacta de asignacion de bits por capa.

## Capacidades

- Generacion de texto y razonamiento explicito en modo "thinking": el modelo produce cadenas de razonamiento antes de la respuesta final, entrenado especificamente para ello via SFT y DPO.
- Razonamiento matematico: evaluado en Math 500, AIME 2024/2025/2026, MCLM Math 100 y PolyMath JA (niveles High y Top).
- Razonamiento cientifico: evaluado en GPQA Diamond y JGPQA Diamond.
- Conocimiento y QA en japones: evaluado en JAM-CQA, JEMHopQA, JMMLU y MMLU-ProX JA, ademas de MMLU-ProX EN.
- Generacion de codigo: evaluado en LiveCodeBench v6, JHumanEval y HumanEval+.
- Seguimiento de instrucciones: evaluado en MIFEval JA e IFBench.
- Traduccion automatica EN-JA y JA-EN: evaluado en WMT20 en ambas direcciones.
- Tool calling / function calling: la evaluacion del modelo base incluye la categoria de tool calling segun la model card.
- Capacidades multilingues: orientado principalmente a japones e ingles; no se detalla cobertura de otros idiomas.
- Compatibilidad con `reasoning_effort` (formato Harmony) segun la configuracion usada en las evaluaciones.

## Casos de uso

- Atencion al cliente en japones: el modelo puede gestionar conversaciones multi-turno con hasta 65.536 tokens de contexto, lo que permite incorporar historial extenso, documentacion de producto y politicas internas en el mismo prompt sin truncamiento. Su entrenamiento especifico en japones lo hace adecuado para empresas que operan en ese mercado.
- Generacion de codigo en produccion: con soporte de tool calling y evaluacion en LiveCodeBench v6 y HumanEval+, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests, invocando herramientas externas (linters, ejecutores de tests) mediante function calling.
- Razonamiento matematico asistido: el modo thinking y su evaluacion en AIME y PolyMath JA lo hacen util para tutoria matematica, generacion de problemas resueltos paso a paso o verificacion de demostraciones en entornos educativos japoneses.
- Traduccion tecnica EN-JA / JA-EN: con evaluacion en WMT20 en ambas direcciones, puede emplearse para localizacion de documentacion tecnica, articulos cientificos o contenido de producto entre ambos idiomas.
- Analisis de documentos largos en japones: informes financieros, expedientes legales o papers de hasta 65.536 tokens pueden procesarse en una sola pasada, extrayendo respuestas con contexto completo y razonamiento explicito para auditoria.
- Asistente de investigacion cientifica: con evaluacion en GPQA Diamond y JGPQA Diamond, puede apoyar la revision de literatura, formulacion de hipotesis o respuesta a preguntas de dominio cientifico, especialmente en japones.
- Despliegue local en Apple Silicon: gracias a la cuantizacion MLX de 4 bits (19,1 GB), puede ejecutarse en Macs con memoria unificada de 32 GB o superior para prototipado, pruebas de privacidad (datos que no salen del equipo) o desarrollo offline.

## Benchmarks y rendimiento

La model card del modelo base lista los benchmarks empleados (Math 500, AIME 2024/2025/2026, MCLM Math 100, PolyMath JA High/Top, GPQA Diamond, JGPQA Diamond, JAM-CQA, JEMHopQA, JMMLU, MMLU-ProX JA/EN, LiveCodeBench v6, JHumanEval, HumanEval+, MIFEval JA, IFBench, WMT20 EN-JA y JA-EN), pero no se incluyen en la informacion proporcionada los valores numericos obtenidos por este modelo. Los resultados completos se remiten al blog tecnico del NII, no accesible en los datos disponibles.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el repositorio cuantizado ocupa 19,1 GB, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM, mas overhead de KV cache y activaciones. Para contexto completo de 65.536 tokens, la KV cache anade varios GB adicionales.
- GPU recomendadas: al ser un formato MLX, esta pensado para Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No es directamente compatible con CUDA sin reconversion.
- Cabe en consumer GPU: en el ecosistema Apple, si, en equipos con 32 GB de memoria unificada o mas (M-series Pro/Max/Ultra). En GPUs NVIDIA consumer (RTX 4090 con 24 GB) requeriria una conversion a otro formato (GGUF, AWQ, etc.), no incluida en este repositorio.
- Opciones de despliegue: MLX (libreria nativa del repositorio), `mlx-lm` para inferencia en Apple Silicon. Para otros entornos seria necesario reconvertir el checkpoint original (llm-jp/llm-jp-4.1-32b-a3b-thinking) a vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser MoE con 3,83B parametros activos, se espera un throughput superior al de un modelo denso de 32B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| llm-jp-4.1-32b-a3b-thinking (esta ficha, cuantizado MLX 4-bit) | 32,1B / 3,83B | 65.536 | No disponible | MLX safetensors, 19,1 GB |
| llm-jp-4.1-33b (denso, misma familia) | 33,2B / 33,2B | 65.536 | No disponible | Original en HF (formato no detallado) |
| llm-jp-4.1-8b (denso, misma familia) | 8,59B / 8,59B | 65.536 | No disponible | Original en HF (formato no detallado) |
| Qwen3 (mencionado en evaluacion) | No disponible | No disponible | No disponible | No disponible |

La comparativa con modelos de otras familias (Qwen3, Gemma 4, Olmo-3, gpt-oss) se menciona en la model card como parte del conjunto de evaluacion, pero no se aportan cifras comparativas en la informacion disponible. No se dispone de datos de rendimiento que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no especificada en la informacion disponible: no puede confirmarse si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base (llm-jp/llm-jp-4.1-32b-a3b-thinking) antes de cualquier despliegue en produccion.
- Modelo cuantizado a 4 bits: la cuantizacion introduce perdida de precision respecto al checkpoint original en bf16. El impacto exacto en cada benchmark no esta documentado.
- Formato MLX: no es portable a CUDA, ROCm ni CPU sin reconversion. El ecosistema de herramientas (vLLM, TGI, llama.cpp) no lo consume directamente.
- Tokenizer no compatible con `openai-harmony`: aunque la plantilla de chat imita el formato Harmony, la tokenizacion directa con la libreria oficial no funciona; debe usarse el tokenizer del modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad ni de pruebas independientes de la calidad de esta cuantizacion concreta.
- Idiomas: la familia LLM-jp esta orientada a japones e ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- Riesgo de alucinacion: no se aportan datos de evaluacion de factualidad ni de tasas de alucinacion; como todo LLM, es susceptible a generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible. Los corpus de pre-entrenamiento tienen cobertura parcial (algunos excluidos por licencia), lo que puede introducir sesgos de seleccion no caracterizados.
- Modo thinking: incrementa el numero de tokens generados y, por tanto, la latencia y el coste; para tareas simples puede ser preferible desactivarlo si la plantilla lo permite.
- Entrenamiento sin RL: el post-entrenamiento se limita a SFT y DPO, sin reinforcement learning, lo que puede reflejarse en un rendimiento inferior al de modelos alineados con RL en tareas de razonamiento complejo.

## Enlaces

- Modelo en Hugging Face (esta cuantizacion): https://huggingface.co/hjmr/llm-jp-4.1-32b-a3b-thinking-oQ4e
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4.1-32b-a3b-thinking
- Coleccion LLM-jp-4.1: https://huggingface.co/collections/llm-jp/llm-jp-41-models
- Blog tecnico (en japones): https://llm-jp.nii.ac.jp/blog/llm-jp-4-1/
- Cookbook: https://github.com/llm-jp/llm-jp-4-cookbook
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Tokenizer llm-jp: https://github.com/llm-jp/llm-jp-tokenizer
- Corpus de pre-entrenamiento: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v4.1
- Corpus de mid-training: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-midtraining-v2
- Dataset SFT: https://huggingface.co/datasets/llm-jp/llm-jp-4.1-thinking-sft-data
- Dataset DPO (32b-a3b): https://huggingface.co/datasets/llm-jp/llm-jp-4.1-32b-a3b-thinking-dpo-data
- Repositorio de evaluacion swallow: https://github.com/swallow-llm/swallow-evaluation-instruct
- Centro de I+D de LLM (NII): https://llmc.nii.ac.jp/
- Instituto Nacional de Informatica de Japon: https://www.nii.ac.jp/en/
- Formulario de encuesta de uso: https://forms.gle/AvbNXTNT2ADsssHq5
