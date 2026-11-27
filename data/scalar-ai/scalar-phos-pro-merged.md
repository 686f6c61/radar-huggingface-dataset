# scalar-ai/scalar-phos-pro-merged

## Resumen

Scalar Phos Pro (Merged) es un modelo de lenguaje de 8.030 millones de parámetros publicado por scalar-ai en Hugging Face. Se trata de un ajuste fino de meta-llama/Llama-3.1-8B-Instruct mediante adaptadores QLoRA de rango 16, cuyos pesos se han fusionado (merged) directamente en los pesos base, dando como resultado un checkpoint completo en BFloat16 listo para su uso sin necesidad de la librería `peft`. El problema que resuelve es práctico: empaquetar el ajuste fino en un formato estándar multi-shard de safetensors que puedan consumir sin fricción los arneses de evaluación automática (como el Open LLM Leaderboard) y los motores de inferencia de producción (vLLM, SGLang).

Arquitectónicamente es un transformer denso autorregresivo con 32 capas, dimensión oculta de 4096 y atención GQA con 32 cabezas de consulta y 8 de clave-valor, heredado íntegramente de Llama-3.1-8B-Instruct. Mantiene la ventana de contexto nativa de 128.000 tokens con RoPE theta = 500.000. El autor reporta una precisión zero-shot en MMLU del 66,55 %, lo que supone retener el 95,89 % de la paridad respecto al modelo base sin cuantizar.

Su relevancia es la de un fine-tune comunitario de Llama 3.1 orientado a evaluación y despliegue: no introduce arquitectura nueva, sino que empaqueta adaptadores de instrucción en un artefacto de 16,1 GB listo para servir. Es un modelo pequeño, con licencia declarada Apache 2.0 en los metadatos pero con un LICENSE que remite al acuerdo comunitario de Llama 3.1, un punto que conviene verificar antes de usarlo comercialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autorregresivo (32 capas, 4096 de dimension oculta, GQA con 32 cabezas Q y 8 KV) |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (RoPE nativo, theta = 500.000) |
| Tipos de cuantizacion | El repositorio principal distribuye pesos en BFloat16 sin cuantizar; el autor remite a scalar-ai/scalar-phos-pro-gguf para binarios GGUF (tipos concretos no disponibles) |
| Idiomas soportados | Ingles (segun metadatos y model card) |
| Licencia | Apache 2.0 en metadatos; el archivo LICENSE remite al Llama 3.1 Community License Agreement (ver limitaciones) |
| Formato de pesos | safetensors (multi-shard, 16 bits, BFloat16), tamano del repo 16,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only idéntico en estructura a Llama-3.1-8B-Instruct: 32 capas, dimensión oculta de 4096, atención con Grouped-Query Attention (32 cabezas de consulta frente a 8 de clave-valor) y contexto nativo de 128.000 tokens gracias a RoPE con theta de 500.000. No hay mezcla de expertos ni componentes de estado recurrente; es un denso convencional, lo que simplifica el despliegue en vLLM o SGLang con tensor-parallel-size 1.

El entrenamiento consistió en un ajuste fino de instrucción mediante QLoRA de rango 16 sobre los pesos base, seguido de una fusión (merge) de los adaptadores en los pesos del modelo fundacional para producir un checkpoint único en BFloat16. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO adicionales; esa información no está disponible. La innovación declarada no es algorítmica sino de empaquetado: eliminar la sobrecarga del envoltorio PEFT dinámico para que los arneses de evaluación automática y los motores de inferencia de alto rendimiento carguen el modelo directamente.

## Capacidades

- Generación de texto conversacional e instruccional en inglés, heredada de Llama-3.1-8B-Instruct.
- Razonamiento de propósito general y respuesta a preguntas zero-shot (MMLU global del 66,55 %).
- Resolución de problemas de conocimiento disciplinar: ciencias sociales (78,06 %), humanidades (69,23 %), negocios y medicina (68,72 %) y STEM (55,96 %).
- Soporte de plantilla de chat estilo Llama 3.1 con roles system/user/assistant mediante `apply_chat_template`.
- Procesamiento de contexto largo de hasta 128.000 tokens, útil para documentos extensos y conversaciones multi-turno.
- Capacidad de instrucción reforzada por los adaptadores QLoRA fusionados, orientada a evaluación en leaderboards.
- No se documenta soporte explícito de tool calling, function calling, modo thinking, visión ni audio en la información disponible.

## Casos de uso

- Evaluación automática en leaderboards: el checkpoint fusionado en safetensors estándar se carga directamente en arneses como el Open LLM Leaderboard sin necesidad de `peft`, lo que elimina pasos de conversión y reduce el riesgo de discrepancias entre el adaptador y la base.
- Servicio de chat en producción con vLLM: el autor documenta el arranque mediante `vllm.entrypoints.openai.api_server` con `--tensor-parallel-size 1` y `--max-model-len 8192`, adecuado para desplegar una API compatible con OpenAI en una sola GPU.
- Asistente conversacional multi-turno: con 128.000 tokens de contexto nativo y plantilla de chat Llama 3.1, puede mantener hilos largos con historial extenso o documentos adjuntos.
- Procesamiento de documentos largos en inglés: resumen, extracción y pregunta-respuesta sobre contratos, informes o artículos que superen los 32.000 tokens, aprovechando la ventana extendida.
- Generación de contenido técnico y divulgativo en inglés: redacción asistida de documentación, artículos y explicaciones, apoyándose en el conocimiento disciplinar medido en MMLU.
- Base para ajustes finos posteriores: al ser un checkpoint completo en BFloat16 derivado de Llama 3.1, sirve como punto de partida para nuevos LoRA o QLoRA sin arrastrar la complejidad de un adaptador acoplado.
- Inferencia local en hardware de consumo: mediante la variante GGUF del autor, puede ejecutarse en equipos con GPU de gama alta o incluso CPU, aunque los tipos de cuantización concretos no están disponibles.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de MMLU zero-shot reportados por el autor:

| Categoria MMLU | Precision Scalar-Phos-Pro | Paridad retenida vs. base |
|---|---|---|
| Ciencias sociales | 78,06 % | 97,33 % |
| Humanidades | 69,23 % | 96,83 % |
| Otros (negocios / medicina) | 68,72 % | 97,06 % |
| STEM | 55,96 % | 96,32 % |
| MMLU global | 66,55 % | 95,89 % |

No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible. Tampoco se ofrece comparación numérica con modelos alternativos más allá de la paridad declarada frente a Llama-3.1-8B-Instruct sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia en BFloat16: aproximadamente 16 GB solo para los pesos (8,03 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda entre 18 y 24 GB para contextos moderados.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para secuencias cortas y `max-model-len` limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con contexto contenido; en GPUs de 16 GB o menos es necesario recurrir a la variante GGUF cuantizada del repositorio companion.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM (documentado por el autor), SGLang (mencionado en la model card) y llama.cpp/Ollama mediante los binarios GGUF de scalar-ai/scalar-phos-pro-gguf.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scalar-ai/scalar-phos-pro-merged | 8,03 B | 128.000 | 66,55 % | Apache 2.0 en metadatos / Llama 3.1 Community en LICENSE | Hugging Face (201 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | No disponible en esta ficha (el autor declara paridad del 95,89 %) | Llama 3.1 Community License | Hugging Face, ampliamente adoptado |
| Mistral-7B-Instruct | 7,2 B | 32.000 | No disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7,6 B | 128.000 | No disponible | Apache 2.0 | Hugging Face |

La comparación cuantitativa con alternativas no puede completarse con los datos disponibles: solo se conoce el MMLU del modelo analizado y su relación de paridad con Llama-3.1-8B-Instruct. La diferencia práctica frente al base es el empaquetado fusionado y el ajuste de instrucción; frente a Mistral y Qwen, la ventaja principal es la ventana de 128.000 tokens, aunque ambos alternativos ofrecen licencias Apache 2.0 más limpias.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o equidad; al derivar de Llama 3.1 hereda los sesgos de sus datos de preentrenamiento, no caracterizados en esta ficha.
- Alucinación: no se han publicado métricas de fidelidad factual ni tasas de alucinación; como todo modelo de 8 B, es propenso a inventar datos en dominios especializados, especialmente en STEM, donde su MMLU cae al 55,96 %.
- Idioma: el modelo está declarado únicamente para inglés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será inferior.
- Licencia ambigua: los metadatos declaran Apache 2.0, pero el archivo LICENSE del repositorio remite al Llama 3.1 Community License Agreement, que impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligación de atribución y de nombrar el modelo "Llama 3.1"). Debe verificarse antes de cualquier despliegue comercial.
- Contexto efectivo: aunque la ventana nativa es de 128.000 tokens, el ejemplo de vLLM del autor limita `--max-model-len` a 8192; el rendimiento más allá de esa longitud no está validado en la model card.
- Madurez: el repositorio tiene 201 descargas y 1 like, creado en noviembre de 2026; no hay evidencia de adopción en producción ni evaluaciones independientes.
- Sin soporte documentado de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines agénticos sin trabajo adicional de prompting.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scalar-ai/scalar-phos-pro-merged
- Repositorio principal con adaptadores LoRA: https://huggingface.co/scalar-ai/scalar-phos-pro
- Binarios GGUF para Ollama e inferencia local: https://huggingface.co/scalar-ai/scalar-phos-pro-gguf
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web; los resultados devueltos corresponden a productos homónimos sin relación (ZF SCALAR, scalar.com, el concepto matemático de escalar).
