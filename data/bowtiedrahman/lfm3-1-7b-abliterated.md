# bowtiedrahman/LFM3-1.7B-abliterated

## Resumen

LFM3-1.7B-abliterated es una versión modificada del modelo LFM3-1.7B de Liquid AI, publicada por el usuario bowtiedrahman en Hugging Face. El autor ha aplicado una técnica de "abliteración" (abliteration direccional) mediante la herramienta Heretic v1.4.0 para eliminar el comportamiento de rechazo (refusal) del modelo original, manteniendo en gran medida sus capacidades generales. El resultado es un modelo sin filtros de seguridad, destinado a investigación sobre el comportamiento de rechazo y a uso local donde el entrenamiento de seguridad del modelo base resulta un obstáculo.

El modelo base, LFM3-1.7B, pertenece a la familia de modelos líquidos (Liquid Foundation Models) de Liquid AI, con aproximadamente 1.729 millones de parámetros y soporte para 16 idiomas, entre ellos el castellano. La modificación se realizó mediante 120 pruebas de búsqueda con Heretic sobre una GPU L4, optimizando el número de rechazos y la divergencia KL respecto al modelo original: el modelo modificado pasa de 98 rechazos sobre 100 prompts a solo 11, con una divergencia KL de 0,055, lo que indica una pérdida de capacidad moderada pero medible.

Es relevante porque demuestra que los modelos pequeños y eficientes de la familia LFM3 pueden ser modificados con técnicas de abliteración reproducibles y documentadas, con parámetros de la abliteración publicados abiertamente (`heretic_trial.json`) y transcripciones de las pruebas incluidas en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models, arquitectura propia de Liquid AI, requiere código personalizado) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, 1,1 GB), q8_0 (GGUF, 1,8 GB), bf16 (safetensors) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm-open-license-v1.0, tipo "other") |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

La arquitectura LFM3 es la familia de modelos fundacionales líquidos de Liquid AI, una alternativa a los transformers convencionales basada en unidades líquidas (liquid cells) con dinámicas inspiradas en sistemas de tiempo continuo. El repositorio incluye archivos de código personalizado (`configuration_lfm3.py`, `modeling_lfm3.py`, `lfm3_conv.py`) necesarios para cargar el modelo con `trust_remote_code=True`, lo que confirma que la arquitectura no está integrada de forma nativa en Transformers. Los detalles del preentrenamiento (número de tokens, composición del dataset) no están disponibles en la información proporcionada.

En cuanto a la modificación, no se trata de un reentrenamiento ni de un fine-tuning con datos, sino de una abliteración direccional: para las proyecciones de salida de atención y las proyecciones descendentes de los MLP, se sustrajo la componente de cada matriz de pesos a lo largo de una dirección de rechazo por capa, con intensidad variable según la profundidad. La búsqueda con Heretic realizó 120 pruebas en una sola GPU NVIDIA L4, optimizando simultáneamente el número de rechazos y la divergencia KL contra el modelo original. Los parámetros de la prueba seleccionada están en `heretic_trial.json`. No se aplicó RLHF ni DPO adicional.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), heredada de LFM3-1.7B.
- Soporte multilingue en 16 idiomas, incluido el castellano (es), ademas de ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Respuesta sin filtros: elimina practicamente todo el comportamiento de rechazo (11 rechazos por cada 100 prompts harmful en la evaluacion de Heretic, frente a 98 del modelo original).
- Ejecucion local eficiente en CPU gracias a los GGUF cuantizados (Q4_K_M de 1,1 GB cabe en maquinas de 8 GB de RAM).
- Compatibilidad con llama.cpp (soporte de la arquitectura lfm3 incorporado el 2026-10-27) y con Transformers mediante codigo personalizado.
- Sin tool calling, vision ni audio confirmados: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre comportamiento de rechazo: los parametros de abliteracion y las transcripciones (`results/baseline-100.json`, `results/final-30.json`) permiten estudiar como la abliteracion direccional modifica las representaciones internas de seguridad del modelo.
- Redaccion creativa sin restricciones: para escritores que necesitan explorar temas que el modelo base rechaza sistematicamente (98/100 de rechazos), este modelo responde de forma sustantiva en el 100 % de los casos verificados manualmente.
- Asistentes locales privados: con el GGUF Q4_K_M de 1,1 GB, se puede ejecutar en portatiles de 8 GB de RAM sin conexion, util para entornos donde la privacidad es prioritaria y el filtrado del modelo base interfiere con consultas legitimas (seguridad, medicina, jurisprudencia).
- Analisis de seguridad y red teaming: al no tener filtros, sirve como modelo de prueba para evaluar clasificadores de contenido y sistemas de moderacion externos.
- Prototipado rapido en CPU: la arquitectura ligera de 1,7B y los GGUF permiten iterar prompts y pipelines sin GPU, con llama.cpp desde master.
- Procesamiento multilingue local: soporte de 16 idiomas en un modelo de 1,7B apto para clasificacion, resumen o extraccion de texto en despliegues edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos publicados corresponden a la evaluacion de abliteracion con Heretic:

| Metrica (eval Heretic, 100 prompts harmful retenidos) | Original (LFM3-1.7B) | Este modelo |
|---|---|---|
| Rechazos | 98 / 100 | 11 / 100 |
| Divergencia KL respecto al original | 0 | 0,055 |

En una comprobacion adicional de 30 prompts ejecutada con llama.cpp en CPU, el modelo base rechazo los 30, mientras que este modelo respondio de forma sustantiva en 29/30 segun el clasificador automatico y 30/30 en lectura manual.

## Requisitos de hardware

- VRAM/RAM para inferencia: el GGUF Q4_K_M ocupa 1,1 GB (pensado para maquinas con 8 GB de RAM); el q8_0 ocupa 1,8 GB; los pesos completos en bf16 requieren aproximadamente 3,5 GB.
- GPU recomendadas: no requiere GPU; la abliteracion se realizo en una NVIDIA L4, pero la inferencia esta orientada a CPU.
- Consumer hardware: cabe sin problemas en portatiles y sobremesa de 8 GB de RAM con el Q4_K_M; cualquier GPU de consumo moderna lo ejecuta con holgura.
- Despliegue: llama.cpp (se necesita compilacion desde master, ya que el soporte de la arquitectura lfm3 se incorporo el 2026-10-27; binarios antiguos fallan con `unknown model architecture: 'lfm3'`) y Transformers con `trust_remote_code=True`. No hay menciones a vLLM, Ollama o TGI; Ollama no es compatible directamente con arquitecturas que requieren codigo personalizado sin adaptacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Caracteristica | LFM3-1.7B-abliterated | LFM3-1.7B (base) | Qwen3-1.7B | Llama-3.2-1B |
|---|---|---|---|---|
| Parametros | 1,73B | 1,73B | 1,7B | 1,2B |
| Arquitectura | LFM3 (liquida) | LFM3 (liquida) | Transformer denso | Transformer denso |
| Comportamiento de rechazo | Practicamente eliminado (11/100) | Muy alto (98/100) | Moderado | Moderado |
| Idiomas | 16 | 16 | 100+ | 8 |
| Formato | GGUF, safetensors | GGUF, safetensors | GGUF, safetensors | GGUF, safetensors |
| Licencia | LFM Open License v1.0 (umbral de ingresos para uso comercial) | LFM Open License v1.0 | Apache 2.0 | Licencia comunitaria Llama |
| Codigo personalizado | Si (trust_remote_code) | Si (trust_remote_code) | No | No |

Nota: las caracteristicas de Qwen3-1.7B y Llama-3.2-1B se indican a titulo orientativo como alternativas de tamano comparable; sus datos de rendimiento frente a LFM3 no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sin filtros de seguridad: el modelo generara contenido que el original rechaza, incluidas instrucciones para actividades ilegales o daninas. No debe desplegarse donde un modelo sin filtrar pueda llegar a usuarios finales.
- Perdida de capacidad general: la divergencia KL de 0,055 indica que la abliteracion degrada parte de la calidad del modelo base, ademas de su precision factual ya limitada por su tamano de 1,7B.
- Riesgo elevado de alucinacion: al tratarse de un modelo de 1,7B sin filtrado, la exactitud factual es limitada y las respuestas deben verificarse.
- Codigo personalizado obligatorio: la carga con Transformers requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio; revisar los archivos antes de usarlo en entornos sensibles.
- Compatibilidad limitada con llama.cpp: solo funciona con binarios compilados desde master (posterior al 2026-10-27).
- Licencia con restricciones: la LFM Open License v1.0 exige mantener la licencia, marcar los archivos modificados y conservar la atribucion; el uso comercial esta condicionado a un umbral de ingresos definido en el texto de la licencia. Liquid AI no respalda ni soporta esta version modificada.
- Sesgos: no se han documentado sesgos especificos, pero heredan los del modelo base y no se han mitigado en el proceso de abliteracion.
- Longitud de contexto: no disponible en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bowtiedrahman/LFM3-1.7B-abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Heretic (herramienta de abliteracion): https://heretic-project.org
- Licencia del modelo: disponible en el archivo `LICENSE` del repositorio (LFM Open License v1.0)
- Transcripciones de pruebas: `results/baseline-100.json` y `results/final-30.json` en el repositorio
