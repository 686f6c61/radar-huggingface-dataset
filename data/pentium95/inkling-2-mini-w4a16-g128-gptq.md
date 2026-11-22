# Pentium95/Inkling-2-Mini-W4A16-g128-gptq

## Resumen

Inkling-2-Mini-W4A16-g128-gptq es una recuantización en INT4 GPTQ del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario Pentium95. El objetivo es empaquetar los expertos enrutados del modelo original (distribuidos en NVFP4 y MXFP8) en un formato INT4 con grupo de 128 y calibración GPTQ, de modo que el checkpoint completo quepa en una única GPU Ampere de 24 GB, en concreto una RTX 3090 o 3090 Ti. El repositorio ocupa 17,2 GB e incluye 26.770.847.232 parámetros totales en formato safetensors.

El modelo base es un transformer multimodal de tipo MoE con visión (pipeline image-text-to-text), desarrollado por Thinking Machines Lab, con licencia Apache-2.0. Esta versión mantiene en bf16 la torre de visión, el proyector, la atención, el LM head, los embeddings, los routers, las normas y los controladores de bucle, y solo cuantiza los expertos enrutados y, opcionalmente en tiempo de carga, el drafter DSpark.

La relevancia de esta ficha es práctica: demuestra que un modelo MoE multimodal de ~26,8 mil millones de parámetros puede servirse en hardware de consumo de gama alta con pérdida de calidad medida y documentada (KL mediana de 0,0028 frente al original), siempre que se use el stack de inferencia específico HyperInkling, que incluye un parche sobre vLLM necesario para cargar el formato de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE con torre de visión, expertos enrutados y drafter DSpark (decodificación especulativa); formato de bucle propietario `inkling2_loop` |
| Parametros totales | 26.770.847.232 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 268k tokens por defecto con HyperInkling en RTX 3090 Ti (KV FP8 E4M3, DSpark asíncrono activo, torre de visión en GPU); máximo 386k en configuración sin DSpark y sin torre de visión |
| Tipos de cuantizacion | Expertos enrutados INT4 grupo 128 asimétrico GPTQ (empaquetado AWQ para Marlin); atención, LM head y embeddings en bf16 (HyperInkling los convierte a INT8 g128 en carga); torre de visión y proyector en bf16; drafter DSpark en bf16 (INT4 en carga con HyperInkling); routers, normas y controladores sin cambios |
| Idiomas soportados | no disponible (la calibración incluyó datos en italiano e inglés, pero no se declara una lista oficial de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (GPTQ INT4, requiere el parche de vLLM incluido en HyperInkling) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos (MoE) que combina una torre de visión con un decodificador de lenguaje, e incorpora un drafter DSpark para decodificación especulativa. Los expertos enrutados de las capas 0 a 19 se publicaron originalmente en NVFP4 y los de las capas 20 a 23 en MXFP8; esta recuantización los unifica a INT4 con grupo de 128, asimétrico y calibrado con GPTQ. El resto de componentes (atención, LM head, embeddings, torre de visión, proyector, routers, normas y controladores de bucle) se mantiene en bf16 tal como se publicó.

La calibración se realizó con 166.000 tokens procedentes de NousResearch/hermes-function-calling-v1, pixparse/docvqa-single-page-questions, ise-uiuc/Magicoder-Evol-Instruct-110K, wikimedia/wikipedia 20231101.it y HuggingFaceH4/ultrachat_200k. Las respuestas se generaron con el checkpoint original y se capturaron las entradas y el enrutamiento del MoE antes de aplicar GPTQ por experto. Una segunda ronda de otros 166.000 tokens no produjo cambios medibles. No existe un maestro bf16 de los expertos: el GPTQ se aplicó sobre los pesos NVFP4/MXFP8 dequantizados, por lo que la referencia es la propia release original. El pipeline de preparación está en el directorio `prepare/` de HyperInkling.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 268k tokens por defecto en la configuración de referencia).
- Razonamiento y modo de pensamiento: el servidor expone `--reasoning-parser inkling` para separar el razonamiento de la respuesta final.
- Tool calling y function calling: parser dedicado `--tool-call-parser inkling` y API compatible con OpenAI en `/v1`.
- Comprensión de imágenes: pipeline image-text-to-text con torre de visión y proyector en bf16; evaluado con DocVQA en formato JSON estricto.
- Generación de código: la calibración incluyó Magicoder-Evol-Instruct y el modelo se evaluó en tareas de código dentro del conjunto de transcripciones retenidas.
- Razonamiento matemático: evaluado en GSM8K con precisión de 0,970 en esta versión.
- Capacidades multilingües: la calibración incluyó Wikipedia en italiano, pero no se declara una lista oficial de idiomas soportados.
- Decodificación especulativa con drafter DSpark, que acelera especialmente la decodificación en documentos largos y salidas estructuradas.
- Servido mediante API OpenAI-compatible con vLLM parcheado.

## Casos de uso

- Extracción de datos de documentos con salida JSON estricta: el modelo alcanza 0,930 de ANLS y un 99,0 % de JSON válido en DocVQA, por lo que es adecuado para pipelines de digitalización de facturas, formularios y páginas escaneadas con validación automática del esquema.
- Asistente conversacional con contexto largo: con hasta 268k tokens de ventana por defecto puede mantener conversaciones multi-turno sobre corpus extensos o historiales completos sin truncar, útil en atención al cliente técnica o legal.
- Agente con tool calling en producción: el parser `inkling` y la API OpenAI-compatible permiten integrarlo en orquestadores de agentes que encadenan llamadas a funciones, con una precisión de 0,610 en llamadas exactas (0,700 en nombres) en la batería de evaluación.
- Generación y revisión de código en CI/CD: dado su rendimiento en tareas de código y su capacidad de razonamiento, puede integrarse en pipelines de revisión automática de parches o generación de tests, siempre que el contexto quepa en la ventana disponible.
- Razonamiento matemático y resolución de problemas: con 0,970 en GSM8K es viable para tutoría automática, verificación de cálculos y generación de problemas resueltos paso a paso.
- Despliegue en estación de trabajo con una sola RTX 3090: el caso de uso central del checkpoint es servir un modelo multimodal MoE de 26,8B en 24 GB de VRAM, con 141 tok/s en decodificación de prosa y hasta ~310 tok/s en salida estructurada usando DSpark.
- Procesamiento por lotes de imágenes y texto: con 6 peticiones concurrentes alcanza 436 tok/s agregados en decodificación y 5.570 tok/s de prefill agregado, adecuado para enriquecimiento de catálogos o moderación de contenido por lotes.

## Benchmarks y rendimiento

Calidad frente al checkpoint original (KL forzado por profesor sobre 22 transcripciones retenidas, una petición a la vez):

| Configuracion | KL mediana | KL media | Acuerdo top-1 |
|---|---|---|---|
| Original contra sí mismo (ruido entre ejecuciones) | 0,0003 | 0,060 | 95,8 % |
| Expertos INT4 round-to-nearest | 0,0039 | 0,133 | 91,2 % |
| Expertos INT4 GPTQ (este checkpoint) | 0,0028 | 0,112 | 92,7 % |
| + atención INT8, head, embeddings, KV FP8 (por defecto en HyperInkling) | 0,0030 | 0,117 | 92,4 % |

Precisión por tarea (greedy, 200 elementos por tarea, ±1,3 puntos de ruido):

| Tarea | Checkpoint original | Este checkpoint con HyperInkling |
|---|---|---|
| GSM8K | 0,965 | 0,970 |
| Llamadas a herramientas, exactas (solo nombres) | 0,595 (0,685) | 0,610 (0,700) |
| DocVQA como JSON estricto, ANLS (JSON válido) | 0,926 (99,5 %) | 0,930 (99,0 %) |

Rendimiento en RTX 3090 Ti con undervolt a 350 W, KV FP8 E4M3:

| Metrica | Sin DSpark | Con DSpark (por defecto) |
|---|---|---|
| Prefill, prompt único de 14,5k tokens | 5.550 tok/s | 5.470 tok/s |
| Prefill, 6 prompts simultáneos, agregado | 5.600 tok/s | 5.570 tok/s |
| Decodificación, una petición, prosa | 134 tok/s | 141 tok/s |
| Decodificación, una petición, documentos largos (13k tokens) | 128 tok/s | 214 tok/s |
| Decodificación, una petición, salida estructurada | 135 tok/s | ~310 tok/s |
| Decodificación, 6 peticiones, prosa, agregado | 428 tok/s | 436 tok/s |

Contexto máximo con HyperInkling en RTX 3090 Ti (6 peticiones simultáneas, KV FP8 E4M3):

| Torre de visión | DSpark asíncrono on | DSpark asíncrono off | Sin DSpark, asíncrono on | Sin DSpark, asíncrono off |
|---|---|---|---|---|
| En GPU | 213k | 268k (por defecto) | 291k | 345k |
| En RAM del host | 249k | 302k | 331k | 386k |
| Ninguna (solo texto) | 249k | 302k | 336k | 386k |

## Requisitos de hardware

- VRAM: el checkpoint ocupa 17,2 GB en disco; está diseñado para caber en 24 GB de VRAM con KV cache FP8 E4M3 y margen para el contexto. Con 268k tokens de contexto por defecto y visión en GPU, una RTX 3090 de 24 GB es el mínimo práctico.
- GPU soportadas: exclusivamente RTX 3090 o RTX 3090 Ti (Ampere, 24 GB). El autor declara explícitamente que no hay soporte para otras generaciones ni para multi-GPU.
- GPU no soportadas: no se garantiza funcionamiento en Ada, Hopper, Blackwell ni en configuraciones multi-GPU.
- Despliegue: HyperInkling, que incluye un vLLM parcheado (PR #69028), un lanzador y un asistente de configuración. El servidor es compatible con OpenAI en `/v1` con modelo `inkling-2-mini`. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Instalación: `scripts/setup-vllm.sh` y `scripts/build-image.sh` (aproximadamente una hora la primera vez), seguido de `scripts/wizard.py` y `docker compose up -d`.
- Latencia y throughput: prefill de 5.470 tok/s con DSpark en un prompt de 14,5k tokens; decodificación de 141 tok/s en prosa y ~310 tok/s en salida estructurada con DSpark. El chunk de prefill `NBT` a 2048 sube el prefill a 6.050 tok/s a cambio de reducir el contexto a unos 200k tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue en 24 GB |
|---|---|---|---|---|---|
| Inkling-2-Mini-W4A16-g128-gptq (este) | 26,77B | hasta 268k por defecto (386k máximo) | INT4 GPTQ g128 en expertos | Apache-2.0 | Sí, RTX 3090/3090 Ti con HyperInkling |
| thinkingmachines/Inkling-2-Mini (original) | 26,77B | no disponible | NVFP4/MXFP8 en expertos | Apache-2.0 | No confirmado en 24 GB; requiere ~20 GB solo de pesos |
| Modelos MoE multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Requiere un vLLM parcheado: el vLLM estándar no reconoce el formato de expertos de este checkpoint y no puede cargarlo. Sin HyperInkling el modelo es inutilizable.
- Soporte limitado a una única GPU: solo RTX 3090 y 3090 Ti, sin multi-GPU ni otras generaciones. El autor no ofrece garantía de soporte.
- Pérdida de calidad medible: KL mediana de 0,0028 y acuerdo top-1 del 92,7 % frente al original; con los ajustes por defecto de HyperInkling (INT8 en atención y embeddings, KV FP8) el acuerdo baja al 92,4 %. No es una réplica exacta del modelo original.
- Sin maestro bf16 de los expertos: la referencia de calibración es la propia release en NVFP4/MXFP8, de modo que los errores de esa release se heredan.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de veracidad ni de sesgos en la información disponible.
- Idiomas: no se declara una lista oficial de idiomas soportados; la calibración incluyó italiano e inglés, pero no hay garantías para otras lenguas.
- Proyecto personal: publicado sin promesa de mantenimiento, con 0 descargas en el momento de la ficha y una única iteración de calibración validada.
- Dependencia de funciones opcionales: el rendimiento en documentos largos y salidas estructuradas depende del drafter DSpark; sin él, la decodificación cae de 214 a 128 tok/s en documentos largos y de ~310 a 135 tok/s en salida estructurada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse la atribución a Thinking Machines Lab por el modelo y el drafter, y respetarse la licencia del stack HyperInkling y del parche de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pentium95/Inkling-2-Mini-W4A16-g128-gptq
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Stack de inferencia HyperInkling: https://github.com/Pento95/HyperInkling
- Repositorio HyperQwen (enfoque de portado): https://github.com/syv-ai/HyperQwen
- gpu-unlock (herramienta de desbloqueo de GPU): https://github.com/zagitta/gpu-unlock
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- PR de vLLM #69028: no disponible como enlace verificado en la información proporcionada
