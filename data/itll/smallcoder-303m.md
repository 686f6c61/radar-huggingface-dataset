# ITLL/smallcoder-303m

## Resumen

SmallCoder 303M es un modelo de lenguaje de tipo LLaMA entrenado desde cero por Ilan Da Silva (bajo la organización ITLL en Hugging Face) con un objetivo muy concreto: la generación de código y el razonamiento algorítmico. Con 302 millones de parámetros, emplea una arquitectura de decoder causal estándar con atención multi-cabeza (MHA), 24 capas, dimensión oculta de 768 y un vocabulario de 49.152 tokens heredado del tokenizador de StarCoder. Su contexto máximo es de tan solo 1.024 tokens, una limitación importante que condiciona sus casos de uso.

El modelo destaca por su currículo de entrenamiento en cuatro fases (29.800 millones de tokens en total) sobre TPU v4-32 del programa Google TRC, combinando FineWeb-Edu, StarCoderData, datasets sintéticos de Nemotron para código y matemáticas, y una fase final de SFT de 6.000 millones de tokens que corrigió un bug crítico de token EOS en versiones anteriores. A pesar de su tamaño reducido, el autor reporta un 27,4 % en HumanEval pass@1, lo que lo sitúa por encima de TinyLlama-1.1B y MPT-1B-Instruct en esa métrica.

Su relevancia actual radica en que demuestra que un modelo por debajo de 500M puede acercarse a modelos de 7B en tareas de código concretas, lo que abre la puerta a despliegues en entornos con recursos muy limitados (CPU, GPUs de gama baja, edge). La contrapartida es clara: sufre en tareas de conocimiento general, matemáticas y sentido común, y su ventana de contexto es muy corta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA causal decoder, MHA (no GQA) |
| Parametros totales | 302.027.520 (~303 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (inglés), code (código) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder causal de estilo LLaMA con atención multi-cabeza convencional (8 cabezas, 8 cabezas KV, sin GQA), 24 capas, `hidden_size=768` e `intermediate_size=3072`. El vocabulario de 49.152 tokens proviene del tokenizador `bigcode/starcoder`, optimizado para código y no para prosa. Los pesos se distribuyen en bfloat16 y el entrenamiento se realizó con AdamW XLA sobre TPU v4-32 del programa TRC.

El entrenamiento sigue un currículo de cuatro etapas que suma aproximadamente 29.800 millones de tokens: (1) base lingüística con FineWeb-Edu (6.300 M tokens, loss 10,87 → 2,58); (2) especialización en código con 60 % de Nemotron Synthetic Code y 40 % de StarCoderData (7.500 M tokens, loss 5,00 → 1,25); (3) matemáticas y conocimiento con Nemotron CC-Math, FineWiki y OpenWebMath (10.000 M tokens, loss 2,77 → 1,55); y (4) SFT con Nemotron SFT, OpenCodeInstruct y OpenMathInstruct-2 (6.000 M tokens, loss 1,73 → ~0,70). Esta última etapa corrige un bug de token EOS presente en versiones previas y alinea el modelo al formato de diálogo `User:` / `Assistant:`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de código en Python y resolución de problemas algorítmicos, su dominio principal.
- Razonamiento algorítmico básico y síntesis de funciones a partir de descripciones en lenguaje natural.
- Formato de instrucciones conversacional mediante el esquema `User:` / `Assistant:`.
- Generación de texto breve en inglés (capacidad secundaria y limitada).
- Matemáticas elementales muy limitadas (GSM8K exact match del 4,55 %).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No dispone de visión, audio ni modo de pensamiento explícito.
- Multilingüismo limitado a inglés y código; no se reporta soporte de castellano ni otros idiomas naturales.

## Casos de uso

- Autocompletado de código en editores: el modelo puede generar continuaciones de funciones Python a partir de un prompt corto, encajando en la ventana de 1.024 tokens típica de un fragmento de archivo o de una función aislada.
- Generación de funciones algorítmicas autocontenidas: útil para producir utilidades pequeñas (ordenaciones, búsquedas, manipulaciones de cadenas) en pipelines de generación de snippets o tests.
- Asistente de aprendizaje de programación: con su formato `User:` / `Assistant:` puede responder a preguntas acotadas sobre cómo implementar un algoritmo, en un contexto educativo con prompts breves.
- Prototipado en entornos con recursos muy limitados: al caber en GPUs de gama baja o incluso CPU, sirve para demos locales, notebooks y entornos de desarrollo sin acceso a GPUs de datacenter.
- Generación de datos sintéticos de código: puede emplearse para producir pares instrucción-respuesta de bajo coste que luego se filtren y se usen para entrenar o aumentar datasets.
- Filtrado y clasificación ligera de fragmentos de código: por su tamaño, es viable ejecutarlo en lote sobre grandes volúmenes de snippets para tareas de etiquetado o detección de patrones simples.
- Componente de un sistema mayor con verificación: dado su riesgo de error, encaja como generador de candidatos en un pipeline donde un compilador o un conjunto de tests filtra las salidas antes de usarlas.

## Benchmarks y rendimiento

| Modelo | Tamaño | HumanEval (pass@1) | MBPP (pass@1) |
|---|---|---|---|
| SmallCoder (Stage 4.1) | 303 M | 27,4 % | 31,0 % |
| TinyLlama-1.1B | 1,1 B | ~26,4 % | ~27,6 % |
| MPT-1B-Instruct | 1,0 B | ~22,0 % | ~25,0 % |
| Zephyr-1.3B-SFT | 1,3 B | 31,0 % | 34,0 % |
| Mistral-7B-Base | 7 B | 30,5 % | 47,5 % |

Resultados adicionales del modelo reportados por el autor:

| Dominio | Benchmark | Métrica | Puntuación |
|---|---|---|---|
| Código | HumanEval (0-shot) | pass@1 | 27,4 % |
| Código | MBPP (3-shot) | pass@1 | 31,0 % |
| Matemáticas | GSM8K (0-shot) | exact match | 4,55 % |
| Conocimiento | Wikitext-2 | perplexity ↓ | 167,6 |
| Razonamiento | ARC Easy / Challenge | acc norm | 34,6 % / 22,8 % |
| Sentido común | HellaSwag | acc norm | 28,3 % |

Nota del autor: HumanEval y MBPP se evaluaron manualmente (`max_new_tokens=512`, `temp=0.2`) debido a problemas de truncación del formato SFT en `lm-eval`. Las cifras de los modelos comparables proceden de la propia model card y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,6 GB solo para pesos; con overhead de activaciones y KV cache, alrededor de 1-1,5 GB para contextos de 1.024 tokens.
- En cuantización de 8 bits cabría en ~0,3-0,4 GB de pesos; en 4 bits, en ~0,15-0,2 GB (aunque el autor no publica variantes GGUF ni cuantizadas).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida.
- Cabe holgadamente en GPUs consumer e incluso puede ejecutarse en CPU con latencia aceptable para generación de snippets cortos.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; el uso de vLLM, llama.cpp u Ollama requeriría conversión a los formatos correspondientes, no documentada por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | MBPP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SmallCoder 303M | 303 M | 1.024 | 27,4 % | 31,0 % | Apache 2.0 | Hugging Face (transformers) |
| TinyLlama-1.1B | 1,1 B | 2.048 (típico en su familia) | ~26,4 % | ~27,6 % | Apache 2.0 | Hugging Face |
| MPT-1B-Instruct | 1,0 B | 2.048 (típico) | ~22,0 % | ~25,0 % | Apache 2.0 | Hugging Face |
| Zephyr-1.3B-SFT | 1,3 B | 4.096 (típico) | 31,0 % | 34,0 % | MIT | Hugging Face |

SmallCoder ofrece la mejor relación rendimiento/tamaño en HumanEval del grupo, con un contexto mucho más corto que sus competidores y una licencia permisiva. Los datos de contexto de los modelos comparables no aparecen en la información proporcionada y se indican como valores típicos de su familia, no verificados en esta ficha.

## Limitaciones y advertencias

- Modelo especializado en código: su rendimiento en texto general, matemáticas y sentido común es muy bajo (GSM8K 4,55 %, HellaSwag 28,3 %).
- Contexto muy corto (1.024 tokens): degrada en inputs largos y no admite conversaciones multi-turno extensas ni archivos grandes.
- Sesgo del tokenizador hacia código: la tokenización de prosa en inglés es ineficiente y puede afectar a la calidad del texto generado.
- Riesgo elevado de alucinación en APIs, librerías y firmas de funciones; el código generado debe validarse con tests o compilación antes de usarse en producción.
- Idiomas: solo inglés y código; no hay soporte declarado de castellano ni de otros idiomas naturales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar los términos de los datasets de entrenamiento (Nemotron, StarCoderData, FineWeb-Edu) si se redistribuye el modelo.
- El repo declara 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación independiente de los benchmarks reportados.
- No se documentan variantes cuantizadas (GGUF, AWQ, GPTQ), lo que limita su uso directo en llama.cpp u Ollama sin conversión manual.

## Enlaces

- Hugging Face: https://huggingface.co/ITLL/smallcoder-303m
- Model card del autor (referenciada en la ficha): https://huggingface.co/Beebey/smallcoder-303m
- Tokenizador: https://huggingface.co/bigcode/starcoder
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset StarCoderData: https://huggingface.co/datasets/bigcode/starcoderdata
- Dataset Nemotron Pretraining SFT v1: https://huggingface.co/datasets/nvidia/Nemotron-Pretraining-SFT-v1
- Dataset Nemotron Pretraining Code v1: https://huggingface.co/datasets/nvidia/Nemotron-Pretraining-Code-v1
- Dataset Nemotron CC-Math v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset FineWiki: https://huggingface.co/datasets/HuggingFaceFW/finewiki
- Dataset OpenWebMath: https://huggingface.co/datasets/open-web-math/open-web-math
- Programa Google TPU Research Cloud: https://sites.research.google/trc/about/
