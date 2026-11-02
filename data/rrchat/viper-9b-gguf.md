# rrchat/Viper-9B-GGUF

## Resumen

Viper-9B es un ajuste fino (fine-tune) del modelo base Qwen3.5-9B desarrollado por rrchat, presentado como el modelo insignia de la lineup RR-Gen1. Está orientado a conversación, generación de código, razonamiento matemático y uso agéntico con llamada a herramientas (tool calling), con especial énfasis en el idioma ruso. Esta ficha cubre la release cuantizada en GGUF, preparada con llama.cpp y calibración mediante matriz de importancia (imatrix) específica de dominio.

El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y hereda la arquitectura y la ventana de contexto del Qwen3.5-9B original, aunque la model card no explicita la longitud de contexto ni los detalles arquitectónicos internos. La release incluye un proyector multimodal (mmproj) que habilita entrada de imagen junto con texto, de ahí que el pipeline declarado sea image-text-to-text.

Su relevancia radica en que ofrece una alternativa afinada para ruso e inglés con mejoras medibles frente al modelo base en tareas de código competitivo (LiveCodeBench v6) y matemáticas en ruso (MGSM ru), manteniendo paridad en tool calling e instrucciones. La licencia es "other", lo que exige revisar los términos del autor y del modelo base antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-9B; detalles internos no disponibles) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible en la model card (los ejemplos de ejecución usan `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF); proyector multimodal en F16 y BF16 |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | other |
| Formato de pesos | GGUF (llama.cpp); safetensors/PyTorch en el repo base `rrchat/Viper-9B` |

## Arquitectura y entrenamiento

Viper-9B es un fine-tune sobre Qwen3.5-9B, un transformer de aproximadamente 9B parámetros. La model card no detalla la composición del dataset de ajuste, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; únicamente se indica que el modelo está afinado para conversación, código, matemáticas, agentes y tool calling, con foco en ruso. La familia de modelos base Qwen3.5 incorpora, según los tags, capacidades de razonamiento (reasoning) y de texto e imagen (image-text-to-text).

La innovación técnica documentada en esta release es la cuantización GGUF preparada con llama.cpp usando una matriz de importancia (imatrix) específica de dominio, incluida en el repositorio como `Viper-9B.imatrix` (5,15 MB). Esta calibración busca preservar la precisión en las tareas objetivo (código, matemáticas, ruso) tras la cuantización. También se distribuye un proyector multimodal (`mmproj`) en FP16 y BF16 para habilitar la entrada de imágenes en llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés.
- Razonamiento y matemáticas de varios pasos, con soporte declarado para MGSM en ruso.
- Generación de código y resolución de problemas algorítmicos (evaluado en LiveCodeBench v6 y MBPP+).
- Tool calling / function calling (evaluado con BFCL v4).
- Uso agéntico y razonamiento multi-paso (tags `agent`, `tool-use`).
- Cumplimiento estricto de instrucciones y restricciones de prompt (evaluado con IFEval).
- Entrada multimodal imagen-texto mediante el proyector `mmproj` incluido.
- Modo de razonamiento (thinking) y modo no-thinking, según los ejemplos de ejecución de la model card.
- Compatibilidad con endpoints OpenAI a través de llama-server.

## Casos de uso

- Asistente conversacional en ruso: el modelo está afinado específicamente para ruso e inglés, por lo que puede gestionar diálogos multi-turno con un tono y vocabulario adecuados para usuarios rusohablantes, algo poco común en modelos de este tamaño.
- Generación de código en producción: con soporte de tool calling y buen rendimiento en MBPP+ (84,7% Pass@1), puede integrarse en pipelines que generen funciones Python con tests unitarios o resuelvan tareas algorítmicas.
- Razonamiento matemático en ruso: útil para tutores automáticos o asistentes educativos que resuelvan problemas de varios pasos en ruso, aprovechando la mejora en MGSM ru (44,4% frente a 42,0% del base).
- Agentes con herramientas: la paridad en BFCL v4 (~57%) permite construir agentes que invoquen APIs, consulten bases de datos o ejecuten funciones estructuradas en flujos multi-paso.
- Procesamiento de documentos con imagen: gracias al proyector mmproj, puede extraer información de capturas, formularios o diagramas combinados con texto en tareas de extracción y resumen.
- Despliegue en hardware de consumo: la cuantización Q4_K_M (5,63 GB, ~8 GB de VRAM) permite ejecutarlo en GPUs de gama media y sistemas edge, habilitando asistentes locales con privacidad de datos.
- Automatización de soporte técnico en ruso: con contexto de 8K en los ejemplos de ejecución, puede manejar conversaciones con historial e instrucciones de sistema extensas.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados localmente en modo no-thinking, `max_tokens` 1024 y llama-server:

| Benchmark | Modo | Base (Qwen3.5-9B) | Viper-9B | Delta |
|---|---|---|---|---|
| LiveCodeBench v6 | Pass@1 determinista | 19,0% | 33,0% | +14,0% |
| LCB v6 Easy | Pass@1 determinista | 42,4% | 60,6% | +18,2% |
| LCB v6 Medium | Pass@1 determinista | 14,7% | 29,4% | +14,7% |
| LCB v6 Hard | Pass@1 determinista | 0,0% | 9,1% | +9,1% |
| MBPP+ (seed 42) | EvalPlus Pass@1 | 83,3% | 84,7% | +1,4% |
| MGSM ru | Numeric Match | 42,0% | 44,4% | +2,4% |
| MMLU-Redux | Choice Accuracy | 73,7% | 74,0% | +0,3% |
| BFCL v4 | AST Function Match | 58,0% | 57,0% | ~paridad |
| IFEval | Strict Compliance | 56,6% | 54,7% | ~paridad |

El autor advierte que estas cifras se obtuvieron manualmente en suites locales y pueden diferir de las reportadas oficialmente por el modelo base o en modo thinking.

## Requisitos de hardware

- VRAM estimada según cuantización (según el autor): Q4_K_M ~8 GB; Q5_K_M ~10-12 GB; Q6_K ~12-16 GB; Q8_0 ~16 GB o más.
- Proyector multimodal: ~1 GB adicional de VRAM (F16 o BF16).
- GPUs recomendadas: RTX 4090 (24 GB) para Q6_K/Q8_0 con contexto amplio; RTX 3080/4070 (10-12 GB) para Q5_K_M; GPUs de 8 GB para Q4_K_M.
- Cabe en GPUs de consumo: sí, desde 8 GB con Q4_K_M.
- Opciones de despliegue: llama.cpp (CLI y llama-server con API compatible con OpenAI), Ollama (mediante Modelfile incluido). No se documentan vLLM ni TGI para esta release GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Viper-9B (este) | ~9B | No disponible | other | GGUF, safetensors | Fine-tune de Qwen3.5-9B, foco en ruso |
| Qwen3.5-9B (base) | ~9B | No disponible | según Qwen | safetensors, GGUF | Modelo base; Viper mejora en código y matemáticas en ruso |
| Alternativas de ~9B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación facilitada.

## Limitaciones y advertencias

- Los benchmarks son autoinformados por el autor, ejecutados localmente y en modo no-thinking; no han sido verificados de forma independiente.
- El rendimiento en tool calling (BFCL v4) e instrucciones (IFEval) es ligeramente inferior al modelo base, lo que puede afectar a flujos agénticos estrictos.
- El modelo está orientado a ruso e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- La longitud de contexto real no se especifica en la model card; los ejemplos usan 8K, por lo que contextos mayores deben validarse empíricamente.
- Riesgo de alucinación inherente a modelos de ~9B, especialmente en tareas de conocimiento factual y matemáticas complejas (LCB Hard solo 9,1%).
- La licencia "other" exige revisar los términos del autor y del modelo base Qwen3.5-9B antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es mínima.
- El proyecto se distribuye como GGUF con imatrix; la calidad puede variar entre cuantizaciones, especialmente en Q4_K_M.

## Enlaces

- Repositorio GGUF: https://huggingface.co/rrchat/Viper-9B-GGUF
- Pesos sin cuantizar: https://huggingface.co/rrchat/Viper-9B
- Perfil del autor: https://huggingface.co/rrchat
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
