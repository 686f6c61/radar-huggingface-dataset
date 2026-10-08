# jkim96/Seed-Coder-8B-Instruct-DASHQ-Q2-GGUF

## Resumen

Esta ficha describe `jkim96/Seed-Coder-8B-Instruct-DASHQ-Q2-GGUF`, una recuantizacion de 2 bits en formato GGUF del modelo `ByteDance-Seed/Seed-Coder-8B-Instruct`. No es un modelo entrenado desde cero: es una conversion de pesos realizada por el usuario jkim96 mediante la herramienta DASH-Q (repositorio GitHub de JaeminK), que produce ficheros GGUF cargables en cualquier build reciente de llama.cpp usando unicamente tipos de tensor estandar (ningun tensor supera los 4 bits). El objetivo es reducir un modelo de codigo de 8.250 millones de parametros a entre 2,65 GB y 3,38 GB en disco, de modo que pueda ejecutarse en hardware muy modesto.

El modelo base, Seed-Coder-8B-Instruct, pertenece a la familia Seed-Coder (antes Doubao-Coder) de ByteDance, una familia de LLM de codigo de escala 8B con variantes base, instruct y reasoning. El repo cuantizado hereda la licencia MIT del modelo base y esta etiquetado como `text-generation`, `llama.cpp`, `dashq`, `imatrix` y `conversational`. El pipeline declarado es generacion de texto.

Su relevancia actual es practica: demuestra que un modelo de codigo de 8B puede comprimirse a la clase de 2 bits manteniendo una perplejidad notablemente inferior a las cuantizaciones de referencia (llama.cpp imatrix y unsloth UD) del mismo tamano, lo que habilita despliegues locales en portatiles, CPUs y GPUs de gama de entrada. La contrapartida es la degradacion inherente a la cuantizacion agresiva; el propio repo no publica benchmarks de tareas, solo perplejidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder del modelo base Seed-Coder-8B-Instruct (detalle de capas y atencion no disponible en la informacion proporcionada) |
| Parametros totales | 8.250.462.208 |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso del repo emplea `-c 8192`, pero no se especifica el contexto nativo) |
| Tipos de cuantizacion | IQ2_XXS (2,57 bits/peso), IQ2_XS (2,89), IQ2_M (3,05), Q2_K_XL (3,28) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es `ByteDance-Seed/Seed-Coder-8B-Instruct`, un transformer decoder denso de 8B parametros perteneciente a la familia Seed-Coder, publicada con variantes base, instruct y reasoning. Segun la documentacion de la familia, Seed-Coder es un proyecto "model-centric" que usa LLM en lugar de reglas hechas a mano para curar los datos de entrenamiento de codigo. Los detalles concretos de la arquitectura interna (numero de capas, dimension de atencion, atencion agrupada, tokens de entrenamiento y si hubo RLHF o DPO) no estan disponibles en la informacion proporcionada para esta ficha.

Lo que si documenta el repo es la innovacion tecnica relevante: la cuantizacion. DASH-Q convierte los pesos del modelo base a tipos GGUF de clase 2 bits empleando una matriz de importancia (`imatrix`), sin introducir tipos de tensor por encima de 4 bits, de forma que los ficheros cargan en cualquier build reciente de llama.cpp. Se ofrecen cuatro tamanos, desde IQ2_XXS (2,65 GB) hasta Q2_K_XL (3,38 GB), permitiendo elegir el equilibrio entre tamano y fidelidad.

## Capacidades

- Generacion de codigo e instruccion general, heredadas del modelo base Seed-Coder-8B-Instruct, orientado a tareas de programacion.
- Generacion de texto conversacional (etiqueta `conversational` en el repo).
- Ejecucion local en llama.cpp y entornos compatibles con GGUF.
- Capacidad de seguir instrucciones propias de la variante Instruct del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y uso como agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; la familia Seed-Coder incluye una variante reasoning separada, pero esta ficha corresponde a la variante Instruct.
- Advertencia: todas las capacidades anteriores estan afectadas por la cuantizacion de 2 bits, que reduce la fidelidad respecto al modelo base en precision completa.

## Casos de uso

- Autocompletado de codigo en equipos modestos: con 2,65-3,38 GB en disco y un consumo de VRAM bajo, el modelo puede servir como motor de autocompletado en un portatil con GPU integrada o CPU, integrado en editores mediante un servidor `llama-server` local.
- Asistente de programacion sin conexion: en entornos con requisitos de privacidad (aire aislado de la red, datos sensibles) se puede desplegar localmente para responder dudas de codigo sin enviar datos a servicios externos, aprovechando que no requiere GPU dedicada.
- Generacion de fragmentos de codigo en pipelines de bajo coste: uso en scripts de generacion de boilerplate, tests o documentacion donde la maxima precision no es critica y prima el coste por token.
- Prototipado rapido y evaluacion de modelos: por su tamano reducido, es util para comparar rapidamente el comportamiento de un modelo de codigo de 8B cuantizado a 2 bits antes de decidir desplegar la version completa o una cuantizacion mayor.
- Despliegue en dispositivos de borde (edge): al caber en 3-4 GB, puede ejecutarse en mini-PC, Raspberry Pi de gama alta con suficiente RAM o contenedores con memoria limitada, ofreciendo asistencia de codigo embebida.
- Educacion y demostraciones: permite mostrar en un aula o taller como se ejecuta un LLM de codigo localmente con llama.cpp sin infraestructura especializada.
- OCR no aplicable / vision no aplicable: al ser un modelo de texto, no cubre tareas multimodales.

## Benchmarks y rendimiento

El unico dato de rendimiento publicado en la informacion proporcionada es la perplejidad medida con `llama-perplexity` (contexto 2048; WikiText-2 test y C4 validation, 256 x 2048 tokens). Valores mas bajos son mejores.

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 2,51 GB | 24,27 | 31,69 |
| IQ2_XXS | unsloth UD-IQ2_XXS | 2,63 GB | 23,68 | 31,16 |
| IQ2_XXS | DASH-Q IQ2_XXS | 2,65 GB | 21,15 | 28,39 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 2,72 GB | 22,97 | 30,07 |
| IQ2_XS | DASH-Q IQ2_XS | 2,98 GB | 20,05 | 26,76 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 3,07 GB | 21,38 | 28,03 |
| IQ2_M | unsloth UD-IQ2_M | 3,13 GB | 21,10 | 27,99 |
| IQ2_M | DASH-Q IQ2_M | 3,14 GB | 19,72 | 26,48 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 3,30 GB | 21,18 | 28,37 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 3,54 GB | 20,49 | 26,98 |
| Q2_K_XL | DASH-Q Q2_K_XL | 3,38 GB | 19,63 | 26,24 |

No se han publicado resultados de benchmarks de tareas estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 2,7-3,5 GB segun el fichero elegido (2,65 GB IQ2_XXS; 2,98 GB IQ2_XS; 3,14 GB IQ2_M; 3,38 GB Q2_K_XL). Hay que sumar la cache KV, cuyo tamano crece con el contexto configurado (el ejemplo del repo usa `-c 8192`).
- VRAM practica recomendada: en torno a 4-5 GB con contexto moderado para el Q2_K_XL, y menos para IQ2_XXS.
- Cabe en GPU de consumo: si. Cualquier GPU con 6 GB o mas (GTX 1060 6GB, RTX 2060/3060, RTX 4060) puede ejecutarlo, y con 4 GB en el caso de las variantes mas pequenas y contexto corto.
- Ejecucion en CPU: viable gracias a llama.cpp; con suficiente RAM del sistema puede correr sin GPU dedicada.
- GPU de datacenter (A100, H100): sobredimensionadas para este modelo; no son necesarias.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF mediante un Modelfile), LM Studio, text-generation-webui y `llama-cpp-python`. vLLM no es la via recomendada para estos tipos de 2 bits; su soporte de GGUF es limitado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa dentro de la misma categoria (cuantizaciones de 2 bits del mismo modelo base), segun los datos de perplejidad del repo:

| Alternativa | Tamano | Bits/peso | WikiText-2 | C4 | Licencia |
|---|---|---|---|---|---|
| DASH-Q IQ2_XXS (este repo) | 2,65 GB | 2,57 | 21,15 | 28,39 | MIT |
| llama.cpp IQ2_XXS (imatrix) | 2,51 GB | ~2,5 | 24,27 | 31,69 | MIT |
| unsloth UD-IQ2_XXS | 2,63 GB | no disponible | 23,68 | 31,16 | MIT |
| DASH-Q Q2_K_XL (este repo) | 3,38 GB | 3,28 | 19,63 | 26,24 | MIT |
| unsloth UD-Q2_K_XL | 3,54 GB | no disponible | 20,49 | 26,98 | MIT |

Frente a cuantizaciones de mayor precision (por ejemplo Q4_K_M o Q8_0 del mismo modelo base, cuyos datos no se incluyen en la informacion proporcionada), las variantes de 2 bits sacrifican fidelidad a cambio de tamano; el repo unicamente ofrece esta clase de 2 bits. La comparacion con modelos de codigo alternativos de 8B (por ejemplo otros instruct de codigo de tamano similar) no dispone de datos de benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion de 2 bits: degradacion notable de calidad respecto al modelo base en precision completa; la perplejidad publicada (19,6-21,2 en WikiText-2) es propia de cuantizaciones muy agresivas.
- Riesgo de alucinacion y de errores de sintaxis en codigo generado, acentuado por la cuantizacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Seed-Coder-8B-Instruct.
- Limitaciones de contexto e idioma: no disponibles; el repo no declara contexto nativo ni idiomas soportados.
- Licencia MIT, heredada del modelo base, sin restricciones declaradas para uso comercial en esta ficha; conviene verificar la licencia del modelo base.
- Uso en produccion: no recomendado para tareas que exijan alta fiabilidad (codigo critico, seguridad) sin validacion humana, dado el nivel de compresion.
- Cifras de rendimiento limitadas a perplejidad; no hay benchmarks de tareas (HumanEval, MMLU, GSM8K) que respalden el rendimiento funcional.
- Compatibilidad: requiere un build reciente de llama.cpp con soporte de los tipos IQ2 y Q2_K.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/jkim96/Seed-Coder-8B-Instruct-DASHQ-Q2-GGUF
- Modelo base: https://huggingface.co/ByteDance-Seed/Seed-Coder-8B-Instruct
- Herramienta DASH-Q: https://github.com/JaeminK/dashq
- Cuantizaciones de referencia de unsloth: https://huggingface.co/unsloth/Seed-Coder-8B-Instruct-GGUF
- Espejo en ModelScope: https://www.modelscope.cn/models/unsloth/Seed-Coder-8B-Instruct-GGUF/summary
- Repositorio GitHub sobre Seed-Coder: https://github.com/vitco/Seed-Coder-AI-self
- Documentacion de NVIDIA NeMo para Seed-Coder-8B-Instruct: https://docs.nvidia.com/nemo/automodel/model-coverage/large-language-models/bytedance-seed/Seed-Coder-8B-Instruct
- Otro modelo DASH-Q del mismo autor: https://huggingface.co/jkim96/Llama-3.1-8B-Instruct-DASHQ-Q2-GGUF
