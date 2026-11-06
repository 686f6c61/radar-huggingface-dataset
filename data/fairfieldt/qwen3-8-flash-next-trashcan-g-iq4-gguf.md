# fairfieldt/Qwen3.8-Flash-Next-trashcan-G-iq4-GGUF

## Resumen

Qwen3.8-Flash-Next-trashcan-G-iq4-GGUF es una cuantizacion no oficial del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario fairfieldt en Hugging Face. El modelo base es un modelo de generacion de texto de gran tamano con 176.943.899.520 parametros totales, de los cuales 121.000 millones corresponden a parametros de expertos (arquitectura MoE) y 4.600 millones a parametros densos, lo que indica una arquitectura de mezcla de expertos con un subconjunto activo relativamente pequeno.

Esta cuantizacion destaca por un caso de uso muy particular: ha sido preparada para ejecutarse sobre "trashcan", un sistema de pipeline paralelo distribuido sobre seis Mac Pro de 2013 con 12 GPU FirePro D700 via Vulkan. Es un ejemplo notable de como las tecnicas de cuantizacion agresiva con matrices de importancia (imatrix) permiten ejecutar modelos de mas de 100 mil millones de parametros en hardware antiguo y de consumo. La cuantizacion se ha realizado con `llama-quantize --imatrix` a partir del Q8_0 de unsloth, manteniendo las matrices densas en Q8_0 y cuantizando los expertos en IQ4_XS/IQ4_NL, con una divergencia KL media de 0,0391 frente al modelo Q8_0 de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), base Qwen3.8-Flash-Next |
| Parametros totales | 176.943.899.520 (176,9 B) |
| Parametros activos | no disponible (121 B en expertos, 4,6 B densos segun la model card) |
| Longitud de contexto | hasta 112K tokens (verificado en trashcan) |
| Tipos de cuantizacion | IQ4_XS (gate/up de expertos), IQ4_NL (down de expertos), Q8_0 (matrices densas y tabla n-gram), Q6_K (cabeza de salida) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (other) |
| Formato de pesos | GGUF (shards, con imatrix y bloque MTP para decodificacion especulativa) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es un transformer de tipo mezcla de expertos (MoE). La model card de la cuantizacion indica que contiene 121.000 millones de parametros de expertos (routed y shared experts) y 4.600 millones de parametros densos. No se dispone de informacion sobre el numero de expertos activos por token ni sobre los datos de entrenamiento del modelo base en la informacion proporcionada.

La aportacion principal de este repositorio es la estrategia de cuantizacion mixta: los expertos se cuantizan en IQ4_XS (matrices gate/up) e IQ4_NL (matriz down), mientras que las matrices densas se mantienen en Q8_0. Esta decision se justifica con datos: a Q4_0, los 4,6 mil millones de parametros densos provocarian cinco veces mas divergencia que los 121 mil millones de parametros de expertos a Q4_0. La cabeza de salida usa Q6_K. La cuantizacion se genero con `llama-quantize --imatrix` usando la matriz de importancia de unsloth, partiendo del Q8_0 de unsloth/Qwen3.8-Flash-Next-GGUF. Ademas, incluye un bloque de multi-token prediction (MTP) en un archivo separado para decodificacion especulativa mediante `--mtp` en llama.cpp.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational)
- Contexto largo: hasta 112K tokens verificados en el sistema trashcan
- Decodificacion especulativa mediante multi-token prediction (archivo `mtp-G-iq4.gguf`, activable con `--mtp`)
- Capacidades heredadas del modelo base Qwen3.8-Flash-Next (razonamiento, codigo, etc.): no disponible en la informacion proporcionada
- Soporte de tool calling: no disponible
- Capacidades multimodales (vision, audio): no disponible

## Casos de uso

- Ejecucion de un modelo de gran escala en hardware antiguo: el objetivo declarado del repositorio es correr el modelo en seis Mac Pro de 2013 con FirePro D700 via Vulkan, util para laboratorios, hackerspaces o entusiastas del retrocomputing que quieran inferencia local de un MoE de 176 B sin GPUs modernas.
- Experimentacion con pipeline paralelo: trashcan implementa pipeline paralelo sobre 12 GPU via Vulkan; es un banco de pruebas para estudiar particionado de modelos MoE en hardware heterogeneo.
- Inferencia local con contexto largo: con hasta 112K tokens de contexto, permite analisis de documentos extensos (contratos, articulos cientificos, bases de codigo) sin depender de la nube.
- Ajuste fino de tecnicas de cuantizacion: la estrategia mixta IQ4/Q8 documentada con metricas de divergencia KL sirve como referencia para quien desarrolle cuantizaciones propias de modelos MoE.
- Decodificacion especulativa en CPU/GPU modestas: el bloque MTP permite acelerar la generacion un 38 % (de 22,6 a 31,3 tok/s) en trashcan, tecnica replicable en otros despliegues con llama.cpp.
- Prototipado de asistentes offline: al ser un GGUF compatible con llama.cpp, puede integrarse en aplicaciones de chat locales con privacidad total, siempre que se disponga de la memoria agregada necesaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Si se han publicado metricas de fidelidad de la cuantizacion frente al Q8_0 de referencia (medidas sobre 39K tokens de texto mixto con llama.cpp en CPU):

| Metrica | Valor |
|---|---|
| Divergencia KL media | 0,0391 |
| Coincidencia del token top | 95,1 % |
| Ratio de perplejidad | 1,002 |

Rendimiento medido en trashcan (6 Mac Pro 2013, 12 FirePro D700, Vulkan):

| Metrica | Valor |
|---|---|
| Decodificacion single-stream | 22,6 tok/s (31,3 tok/s con MTP) |
| Prefill (512 tokens) | 518 tok/s |
| Prefill (16K tokens) | 1.211 tok/s |
| Contexto maximo verificado | 112K tokens |

## Requisitos de hardware

- El repositorio completo ocupa 127,7 GB (mas el bloque MTP de 2,67 GB), por lo que se necesita al menos esa capacidad de memoria o almacenamiento accesible durante la inferencia.
- En el despliegue de referencia, el modelo se distribuye en pipeline paralelo sobre 12 GPU FirePro D700 (2 GB VRAM cada una) de seis Mac Pro 2013, via Vulkan con llama.cpp; esto implica que el modelo se reparte entre multiples dispositivos con poca VRAM individual.
- No cabe en una unica GPU de consumo: incluso una RTX 4090 (24 GB) o una A100 (40/80 GB) no albergarian los ~100 GB de pesos cuantizados; se requiere multi-GPU, multi-maquina o descarga a RAM/disco.
- Alternativamente, en CPU pura con suficiente RAM (128-256 GB) podria ejecutarse con llama.cpp, aunque sin datos publicados de rendimiento en esa configuracion para este modelo.
- Despliegue: llama.cpp (formato GGUF nativo, con soporte `--mtp` para decodificacion especulativa); el recipe `6-flashnext` esta documentado en docs/deploy.md del repositorio trashcan. No hay evidencia de compatibilidad verificada con vLLM, TGI u Ollama para esta cuantizacion concreta.
- Rendimiento esperado: en el hardware de referencia, 22,6 tok/s de decodificacion y 518-1.211 tok/s de prefill segun la longitud del prompt.

## Comparativa con modelos similares

| Modelo | Parametros totales | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-trashcan-G-iq4-GGUF | 176,9 B | GGUF | IQ4_XS/IQ4_NL/Q8_0/Q6_K mixta | qwen-community-license-1.0 | Hugging Face (fairfieldt) |
| Qwen/Qwen3.8-Flash-Next (base) | 176,9 B | no disponible (safetensors) | sin cuantizar | qwen-community-license-1.0 | Hugging Face (Qwen) |
| unsloth/Qwen3.8-Flash-Next-GGUF | 176,9 B | GGUF | incluye Q8_0 (origen de esta cuantizacion) | qwen-community-license-1.0 | Hugging Face (unsloth) |

Esta cuantizacion se distingue de las alternativas por su optimizacion especifica para pipeline paralelo sobre GPUs antiguas via Vulkan y por incluir un bloque MTP separado para decodificacion especulativa, a cambio de una ligera perdida de fidelidad (KL 0,0391 frente al Q8_0).

## Limitaciones y advertencias

- Es una cuantizacion no oficial de un tercero (fairfieldt), no de Qwen; la calidad depende de la metodologia del autor, aunque esta documentada con metricas de divergencia.
- La cuantizacion IQ4 en los expertos introduce una divergencia KL media de 0,0391 frente al Q8_0; el 4,9 % de los tokens top difieren, lo que puede degradar tareas sensibles (codigo preciso, matematicas).
- No hay benchmarks estandar publicados ni para esta cuantizacion ni, en la informacion proporcionada, para el modelo base, por lo que su calidad en tareas concretas es desconocida.
- Idiomas soportados, capacidades de tool calling y multimodalidad: no disponibles en la informacion proporcionada.
- La licencia qwen-community-license-1.0 es "other": conviene revisar las condiciones del archivo LICENSE antes de cualquier uso comercial, ya que las licencias comunitarias de Qwen suelen tener limites de usuarios mensuales o ingresos.
- El despliegue de referencia requiere hardware muy especifico (seis Mac Pro 2013 con 12 FirePro D700); en otras configuraciones el rendimiento no esta documentado.
- El tamano total (~130 GB) hace inviable su uso en una sola GPU de consumo y exige infraestructura multi-dispositivo o mucha RAM.
- Riesgo de alucinacion: inherente a cualquier LLM; no hay datos publicados que permitan cuantificarlo para este modelo.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/fairfieldt/Qwen3.8-Flash-Next-trashcan-G-iq4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Q8_0 de origen (unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio trashcan (sistema de despliegue): https://github.com/fairfieldt/trashcan
- Documentacion de despliegue (recipe 6-flashnext): https://github.com/fairfieldt/trashcan/blob/main/docs/deploy.md
