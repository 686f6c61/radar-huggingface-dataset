# JP5088/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante descensurada del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento construido sobre la base Qwen3.5-9B y destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es JP5088, que aplica la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original mediante una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24.

El modelo conserva el foco del original en matematicas y STEM, con aproximadamente 250.000 muestras de entrenamiento supervisado centradas en razonamiento cientifico y resolucion de problemas, y mantiene las capacidades de tool calling, function calling y razonamiento multi-paso heredadas de la base. Con 9.409.813.744 parametros y licencia Apache 2.0, se posiciona como una opcion compacta para despliegue en entornos con recursos limitados.

La relevancia de esta variante concreta radica en su intervencion de descensurado: segun la model card, reduce los rechazos de 100/100 a 3/100 en un conjunto de evaluacion de 100 prompts, con una divergencia KL de 0.0422 respecto al original. Esto la hace util para investigadores que necesitan estudiar el comportamiento de modelos sin filtros de rechazo, aunque introduce riesgos evidentes de seguridad y calidad que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5, familia qwen3_5); detalles de atencion no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (se menciona evaluacion con NVFP4 y MTP en la model card del modelo base) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.5-9B, una arquitectura transformer de la familia qwen3_5. El entrenamiento del modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B consistio en destilacion a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con un conjunto de aproximadamente 250.000 muestras de SFT centradas en matematicas y STEM. La model card del modelo base menciona ademas etapas de RL (con GSPO entre las etiquetas) y evaluacion de MTP (multi-token prediction) y NVFP4, aunque no se detallan los volumenes de datos ni la composicion exacta del dataset.

La intervencion de esta variante es puramente post-entrenamiento: se aplica Heretic v2.0.0.dev0 con parametros ARA (start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0.8264, steer_bad_behavior_weight 0.0003, overcorrect_relative_weight 0.9645, neighbor_count 12). Se trata de una ablacion selectiva de direcciones de activacion asociadas a comportamientos de rechazo, no de un reentrenamiento. El resultado declarado es una reduccion de rechazos de 100/100 a 3/100 con una divergencia KL de 0.0422 frente al modelo original, lo que indica un cambio moderado en la distribucion de salidas.

## Capacidades

- Generacion de texto y razonamiento estructurado con descomposicion de problemas en multiples pasos, heredado de la destilacion de DeepSeek-V4-Pro.
- Razonamiento matematico y cientifico (STEM), area en la que se concentra el entrenamiento supervisado.
- Tool calling y function calling, segun las etiquetas del modelo (tool-use, function-calling).
- Razonamiento multi-paso y uso en agentes, por la herencia del modelo base orientado a reasoning.
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Entrada image-text-to-text segun las etiquetas del repositorio, aunque no se detalla la arquitectura de vision ni su rendimiento.
- Modo de razonamiento (reasoning) heredado del fine-tune original.
- Comportamiento descensurado: reduce drasticamente los rechazos ante peticiones que el modelo original declinaria.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como varia el comportamiento de un modelo al eliminar las direcciones de activacion asociadas al rechazo, comparando con el original mediante la divergencia KL reportada (0.0422).
- Evaluacion de robustez de filtros: sirve para probar sistemas de moderacion y clasificadores de contenido, ya que genera respuestas que un modelo alineado rechazaria y permite medir la cobertura de dichos filtros.
- Razonamiento matematico asistido: resolucion de problemas de algebra, calculo y demostraciones paso a paso, aprovechando las ~250.000 muestras de SFT en matematicas y STEM del modelo base.
- Generacion de codigo en pipelines: con soporte de tool calling y function calling, puede integrarse en flujos de CI/CD para generar parches, explicar errores de compilacion o escribir tests, aunque sin datos de benchmark especificos de codigo.
- Agentes multi-paso: uso como motor de razonamiento en agentes que requieren planificacion y llamadas a herramientas, con contexto multilingue en seis idiomas.
- Despliegue en hardware de consumo: con 9.400 millones de parametros, es viable en GPUs consumer con cuantizacion agresiva, lo que permite prototipado local de asistentes tecnicos.
- Analisis de textos cientificos multilingues: resumen y extraccion de informacion en ingles, chino, coreano, japones, espanol y ruso, aprovechando la cobertura idiomatica declarada.

## Benchmarks y rendimiento

La model card unicamente reporta metricas del proceso de descensurado, no benchmarks estandar de capacidad:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (sobre 100 prompts) | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-12 GB, viable en RTX 4080/4090.
- VRAM estimada en cuantizacion de 4 bits: en torno a 6-8 GB, viable en RTX 3060/4060 Ti y GPUs consumer de gama media.
- GPUs recomendadas para produccion: A100 40/80 GB, H100, L40S; para una sola GPU consumer, RTX 4090 (24 GB) en BF16 justo o con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repo), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no se confirma su disponibilidad en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | 9,4 B | no disponible | Apache 2.0 | Variante descensurada via Heretic; 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4 B | no disponible | Apache 2.0 | Modelo original alineado; 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4 B | no disponible | no disponible | Version 4B descensurada citada en la model card |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9 B | no disponible | no disponible | Fine-tune cientifico del mismo autor sobre esta base |

No se dispone de datos de rendimiento comparativo en benchmarks estandar para ninguna de estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El descensurado elimina los rechazos de forma deliberada: el modelo puede generar contenido danino, ilegal o inseguro, y no debe desplegarse sin capas externas de moderacion.
- La divergencia KL de 0.0422 indica un cambio no trivial en la distribucion de salidas; pueden aparecer degradaciones en tareas para las que el modelo original estaba calibrado.
- Riesgo elevado de alucinacion en dominios fuera de matematicas y STEM, ya que el SFT se concentro en esas areas.
- No se han publicado benchmarks de capacidad (MMLU, GSM8K, HumanEval), por lo que no hay evidencia cuantitativa de su rendimiento real.
- La longitud de contexto no esta documentada; no debe asumirse la del modelo base sin verificacion.
- El soporte de vision (etiqueta image-text-to-text) no esta documentado ni evaluado en la model card.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante descensurada conlleva riesgos legales y reputacionales segun la jurisdiccion y el caso de uso.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JP5088/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B descensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico del autor: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de descensurado): https://heretic-project.org
