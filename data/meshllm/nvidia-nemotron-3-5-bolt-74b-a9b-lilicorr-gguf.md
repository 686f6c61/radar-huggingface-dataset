# meshllm/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-LiLiCorr-GGUF

## Resumen
Este repositorio contiene una cuantizacion Q8_0 en formato GGUF del modelo LiLiCorr de NVIDIA para Nemotron-3.5-Bolt-74B-A9B, publicada por el usuario meshllm. No se trata de un modelo generativo completo, sino de un componente auxiliar de decodificacion especulativa (draft model) que se ejecuta junto al modelo principal para acelerar la inferencia. La finalidad concreta es ofrecer una version compatible con runtimes basados en llama.cpp en backends que carecen de kernels rapidos para NVFP4, como Apple Metal.

El modelo base, NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB, es un modelo vision-lenguaje (VLM) disenado por NVIDIA para ejecutar tareas agenticas cotidianas de forma local, con una cuantizacion nativa de 2 bits que le permite caber en 24 GB de memoria. La variante LiLiCorr anade la cabeza de correccion que da nombre al componente y que actua como borrador especulativo.

La relevancia de esta publicacion es practica: permite disfrutar de la aceleracion por decodificacion especulativa en hardware donde el formato NVFP4 original no dispone de soporte optimizado, a costa de un fichero de 1,2 GB. El numero de parametros reportado en los metadatos de safetensors (1.112.828.867) corresponde a la cabeza LiLiCorr cuantizada, no al modelo principal de 74B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decodificacion especulativa (LiLiCorr) sobre modelo base Nemotron-3.5-Bolt-74B-A9B; no disponible el detalle interno de la cabeza |
| Parametros totales | 1.112.828.867 (cabeza LiLiCorr en este repo); el modelo base declara 74B totales y 9B activos |
| Parametros activos | 9B (modelo base, segun nomenclatura A9B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (este repo); el modelo base se distribuye en NVFP4 nativo de 2 bits y BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (Q8_0); el original en NVFP4 y BF16 |

## Arquitectura y entrenamiento
El repositorio no documenta la arquitectura interna del modelo base ni de la cabeza LiLiCorr. Por la nomenclatura (74B-A9B) se infiere un transformer con mezcla de expertos (MoE) de 74.000 millones de parametros totales y 9.000 millones activos por token, aunque no se confirma en la informacion disponible. El modelo base es un VLM, es decir, incorpora codificacion visual ademas del procesamiento de texto.

La conversion documentada es puramente de cuantizacion: se aplico `llama-quantize --allow-requantize` con llama.cpp 0.7.0 sobre el checkpoint original de NVIDIA (revision `182d2987939e12f458298b5d5f6ef98912f4ad6c`, sha256 `080e1ea41c9562a7804dbf30c6fbd4d17e216c6b8ff666f88e6edb1816010194`). Las matrices NVFP4 y BF16, incluida la cabeza LiLiCorr, se convierten a Q8_0, mientras que las escalas por tensor NVFP4, los attention sinks y las normas se conservan sin cambios. No se aportan datos sobre tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo base.

## Capacidades
- Decodificacion especulativa: actua como modelo borrador que propone tokens candidatos que el modelo principal verifica, acelerando la generacion.
- Compatibilidad con llama.cpp y runtimes derivados, incluido el ecosistema LM Studio.
- Ejecucion en backends sin kernels NVFP4, como Apple Metal.
- El modelo base asociado es un VLM orientado a tareas agenticas locales.
- Capacidades de generacion de texto, razonamiento, codigo o tool calling del modelo base: no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible.

## Casos de uso
- Aceleracion de inferencia en Mac con Apple Silicon: al carecer Metal de kernels NVFP4 optimizados, esta version Q8_0 de la cabeza LiLiCorr permite activar decodificacion especulativa en llama.cpp sobre macOS, reduciendo la latencia por token frente a la generacion sin borrador.
- Despliegue local de agentes con Nemotron-3.5-Bolt en equipos de 24 GB: combinando el modelo principal cuantizado a 2 bits con esta cabeza Q8_0, se puede ejecutar un VLM agentico en una unica GPU de consumo o en memoria unificada de Apple.
- Integracion en LM Studio: el ecosistema lmstudio-community publica instrucciones de uso para esta variante, lo que facilita probar el pipeline especulativo desde una interfaz grafica sin configurar llama.cpp manualmente.
- Servidores con GPUs sin soporte NVFP4: en tarjetas anteriores a las arquitecturas que implementan NVFP4 de forma nativa, esta cabeza Q8_0 evita la caida a rutas no optimizadas y mantiene el beneficio del borrador especulativo.
- Evaluacion comparativa de tecnicas de aceleracion: investigadores pueden medir la ganancia real de LiLiCorr frente a generacion autoregresiva pura en distintos backends usando este fichero como referencia reproducible.
- Prototipado de asistentes multimodales en local: al emparejar el VLM base con la cabeza de borrador, se pueden construir demos de asistente con vision que respondan con menor latencia en hardware de gama alta de consumo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM para esta cabeza: aproximadamente 1,2 GB en Q8_0 (tamano del repo).
- VRAM total del sistema: debe sumarse a la del modelo principal Nemotron-3.5-Bolt-74B-A9B, disenado para caber en 24 GB con cuantizacion nativa de 2 bits.
- GPU recomendadas: no disponibles de forma explicita; el modelo base apunta a configuraciones de 24 GB, lo que incluye GPUs de consumo de gama alta y memoria unificada de Apple Silicon.
- Cabe en GPU de consumo: si, segun el diseno del modelo base (24 GB), aunque el rendimiento concreto no esta documentado.
- Opciones de despliegue: llama.cpp (version 0.7.0 o superior para la conversion), LM Studio y runtimes compatibles con GGUF y decodificacion especulativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| meshllm/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-LiLiCorr-GGUF (este) | 1,1B (cabeza) | no disponible | GGUF Q8_0 | OpenMDW 1.1 | Cabeza especulativa para backends sin NVFP4 |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF | no disponible | no disponible | GGUF (original) | OpenMDW 1.1 | Version de referencia de NVIDIA |
| lmstudio-community/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-LiLiCorr-GGUF | no disponible | no disponible | GGUF | OpenMDW 1.1 | Reempaquetado para LM Studio |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB | 74B totales / 9B activos | no disponible | NVFP4, BF16 | OpenMDW 1.1 | Modelo base VLM completo |

## Limitaciones y advertencias
- No es un modelo autonomo: requiere el modelo principal Nemotron-3.5-Bolt-74B-A9B para funcionar; por si solo no genera respuestas.
- La conversion a Q8_0 puede introducir diferencias de calidad frente a la cabeza original en NVFP4/BF16, aunque se conservan escalas, attention sinks y normas.
- Sesgos conocidos: no disponibles; heredaria los del modelo base, no documentados aqui.
- Riesgo de alucinacion: aplicable al modelo principal; no evaluado en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia OpenMDW 1.1: debe revisarse el texto completo antes de uso comercial; el repositorio incluye el fichero `LICENSE`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.
- Fecha de creacion posterior a la ventana de conocimiento habitual; los datos proceden exclusivamente de la model card y la busqueda web proporcionada.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/meshllm/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-LiLiCorr-GGUF
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Variante LiLiCorr original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF
- Reempaquetado para LM Studio: https://huggingface.co/lmstudio-community/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-LiLiCorr-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
