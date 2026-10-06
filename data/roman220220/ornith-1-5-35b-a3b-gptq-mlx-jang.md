# roman220220/Ornith-1.5-35B-A3B-gptq-mlx-jang

## Resumen
Ornith-1.5-35B-A3B es un modelo de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, desarrollado por Ornith AI sobre la arquitectura Qwen3.5-MoE y postentrenado con aprendizaje por refuerzo para tareas de programacion y agenticas. La ficha que se documenta aqui corresponde a una conversion cuantizada publicada por roman220220 (IPSupport LLC), no al modelo original.

Esta version aplica una receta de cuantizacion GPTQ especifica por componente (JANG 8/6/6/3) en formato MLX: 8 bits para la atencion completa, 6 bits para la atencion lineal Gated DeltaNet y el experto compartido, y 3 bits para los expertos enrutados. El resultado comprime el modelo de 72 GB en bf16 a 17,0 GB, con un incremento de perplejidad de solo el +6,8 % en wikitext-2.

El modelo conserva la torre de vision a 8 bits (arquitectura Qwen3-VL) y esta pensado para ejecucion local en Apple Silicon mediante la libreria mlx y un fork especifico de mlx-lm. Su relevancia actual reside en hacer viable en un Mac un modelo MoE multimodal de 35B con licencia MIT, manteniendo capacidades de codigo, agentes y vision.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (mezcla de expertos con atencion completa y Gated DeltaNet lineal) |
| Parametros totales | 35.107.180.016 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ JANG 8/6/6/3: atencion 8 bits, atencion lineal 6 bits, experto compartido 6 bits, expertos enrutados 3 bits, router y puertas en bf16, embeddings y cabeza 8 bits, torre de vision 8 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (cuantizacion GPTQ) |

## Arquitectura y entrenamiento
El modelo base es un transformer MoE de 40 capas. Diez capas emplean atencion completa (q, k, v, o) y treinta usan Gated DeltaNet, una atencion lineal con delta-rule gates. Cada capa contiene 256 expertos enrutados, de los que se activan 8 por token, ademas de un experto compartido. Los expertos enrutados concentran 32,2 B de los 35 B de parametros, por lo que determinan el tamano final del modelo. El postentrenamiento del modelo original incluyo aprendizaje por refuerzo orientado a codigo y tareas agenticas, y dispone de una cabeza de prediccion multi-token que no se conserva en esta conversion.

La cuantizacion se realizo con GPTQ (compensacion de error de Hessian sobre la rejilla afina de MLX), con una receta de bits por componente identica en todas las capas. Cada experto enrutado se calibro sobre los tokens que el router le asigna. La calibracion uso 128 fragmentos de 512 tokens (mitad wikitext-2 de entrenamiento y mitad codigo Python), capa a capa y sobre las salidas ya cuantizadas, en una A100. Los ficheros MLX conservan los codigos, escalas y sesgos propios de GPTQ en lugar de recuantizar. La torre de vision mantiene su funcionamiento respecto al modelo base, con el embedding posicional en bf16 porque Qwen3-VL interpola en el tipo del peso.

## Capacidades
- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion y analisis de codigo, con postentrenamiento especifico para tareas de programacion.
- Capacidades agenticas y de razonamiento multi-paso, derivadas del postentrenamiento con RL.
- Vision y entrada de imagen a texto (pipeline image-text-to-text), con torre de vision a 8 bits.
- Descripcion de imagenes: en una prueba, el modelo describio correctamente una imagen de composicion geometrica sencilla.
- Compatibilidad con servidor de API compatible con OpenAI mediante mlx_lm.server.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible en la informacion proporcionada (el modelo base esta orientado a tareas agenticas, pero no se detallan los formatos soportados).

## Casos de uso
- Asistencia de codigo en local: el modelo puede generar y revisar funciones (por ejemplo, parsers de fechas ISO-8601) sin enviar datos fuera del equipo, gracias a su postentrenamiento en tareas de programacion y a su ejecucion en Apple Silicon.
- Agentes de codigo sobre repositorios: su orientacion agentica y su capacidad de razonamiento multi-paso permiten integrarlo en flujos de analisis, correccion y prueba de codigo, sirviendose desde una API compatible con OpenAI.
- Descripcion y comprension de imagenes: al conservar la torre de vision, sirve para tareas de image-text-to-text como generar descripciones o responder preguntas sobre una imagen.
- Chat conversacional local con privacidad: ejecutable en un Mac con unos 18 GB de memoria libre, permite conversaciones multi-turno sin conexion a servicios externos.
- Servidor de inferencia interno: mediante mlx_lm.server se puede exponer como endpoint compatible con OpenAI para prototipos y herramientas internas.
- Prototipado de aplicaciones multimodales en macOS: integrable en la app LLMTray como modelo de chat con vision, util para demos y pruebas de producto sobre hardware de consumo.
- Evaluacion de tecnicas de cuantizacion: la receta JANG y los ficheros GPTQ lo convierten en una referencia practica para investigar el equilibrio entre tamano y calidad en modelos MoE.

## Benchmarks y rendimiento
Perplejidad en el conjunto de test de wikitext-2 (40 x 512 tokens):

| Modelo | Tamano | PPL | vs bf16 |
|---|---|---|---|
| bf16 (HF transformers) | 72 GB | 9,711 | — |
| Este modelo (MLX, GPTQ JANG) | 17,0 GB | 10,368 | +6,8 % |

No se han publicado resultados de benchmarks de codigo o agenticos en la informacion disponible para esta cuantizacion. Los benchmarks de codigo y agenticos del modelo base corresponden al modelo en bf16 y no se reejecutaron sobre esta version. En vision, las caracteristicas de la torre MLX coinciden con las de HF transformers a coseno 0,994 (media sobre tokens).

## Requisitos de hardware
- Memoria: requiere aproximadamente 18 GB de memoria libre en Apple Silicon.
- Plataforma: disenado para ejecucion en Apple Silicon mediante MLX (memoria unificada), no para GPU NVIDIA ni CUDA.
- GPU de consumo: no se especifica soporte para GPUs de consumo tipo RTX 4090; la via prevista es un Mac con memoria unificada suficiente.
- GPU de calibracion: la cuantizacion se calibro en una A100 (no es un requisito de inferencia).
- Despliegue: mlx_lm (fork ipsupport-llc/mlx-lm) para lineas de comandos, mlx_lm.generate y mlx_lm.server para servir una API compatible con OpenAI, y la aplicacion LLMTray en macOS.
- Nota de compatibilidad: la entrada de imagen requiere el fork ipsupport-llc/mlx-lm; la version estandar de mlx-lm carga este modelo solo como texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (bf16, base) | ~35B (3B activos) | no disponible | PPL 9,711 (wikitext-2) | MIT | HuggingFace |
| Este modelo (GPTQ MLX JANG) | ~35B (3B activos) | no disponible | PPL 10,368 (wikitext-2, +6,8 %) | MIT | HuggingFace |
| Otras alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables en el material proporcionado.

## Limitaciones y advertencias
- Sesgos: no disponibles en la informacion proporcionada; se heredan los del modelo base, cuya model card debe consultarse.
- Alucinacion: riesgo propio de los modelos generativos; no se detallan evaluaciones de veracidad especificas para esta cuantizacion.
- Cuantizacion: la perdida de calidad medida es del +6,8 % de perplejidad frente a bf16 en wikitext-2; los expertos enrutados a 3 bits concentran la mayor compresion y pueden afectar tareas exigentes.
- Contexto e idiomas: no se especifica la longitud de contexto soportada ni los idiomas oficialmente cubiertos.
- Vision: solo funciona con el fork ipsupport-llc/mlx-lm; el mlx-lm estandar carga el modelo unicamente como texto. La cabeza de prediccion multi-token del modelo base no esta incluida.
- Licencia: MIT tanto en este repositorio como en el modelo base; el repositorio base declara MIT pero no incluye fichero de licencia, por lo que aqui se incluye el texto MIT estandar.
- Reprocesamiento: MLX recuantizaria el 8,3 % de las palabras de codigo empaquetadas si se derivaran las escalas de min/max; los ficheros conservan los codigos de GPTQ para evitarlo.
- Responsabilidad: es una conversion de un modelo de terceros, provista "tal cual", sin garantia; el autor no responde de las salidas ni del uso que se haga de ella. El usuario debe verificar el cumplimiento de la licencia y la normativa aplicable.
- Rendimiento en hardware: requiere Apple Silicon con memoria suficiente; no se documentan latencias, throughput ni soporte en GPU NVIDIA.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/roman220220/Ornith-1.5-35B-A3B-gptq-mlx-jang
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Fork de mlx-lm con soporte de vision Qwen3.5: https://github.com/ipsupport-llc/mlx-lm
- Repositorio con pipeline y mediciones de cuantizacion: https://github.com/rromenskyi/quant-ternary
- Aplicacion LLMTray: https://www.ipsupport.us/llmtray/
- Descarga de LLMTray: https://github.com/ipsupport-llc/llmtray/releases/latest/download/LLMTray-Full.dmg
- Repositorio LLMTray en GitHub: https://github.com/ipsupport-llc/llmtray
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
