# secai1999/LLM-Autoscan-v1

## Resumen

LLM-Autoscan-v1 es un modelo de lenguaje publicado por el usuario secai1999 en Hugging Face, derivado mediante cuantizacion de 8 bits del modelo orcarouter/Qwen3.8-27B-Uncensored-NVFP4, que a su vez es una variante sin censura de la familia Qwen 3.5. El repositorio contiene 21.232.112.736 parametros en formato safetensors (unos 21,2 mil millones) y ocupa 24,7 GB, lo que es coherente con un guardado en 8 bits de un modelo de aproximadamente 27 mil millones de parametros.

La relevancia del modelo es limitada y practica: se trata de un artefacto de cuantizacion con licencia Apache 2.0, orientado a reducir los requisitos de memoria de un modelo de gran tamano para su despliegue en infraestructura mas modesta. No se ha publicado informacion sobre arquitectura interna, datos de entrenamiento, contexto o idiomas, y no cuenta con descargas ni interacciones en el momento de redactar esta ficha.

Al ser un derivado de un modelo "uncensored", conviene tratarlo como un modelo experimental sin garantias de calidad ni de seguridad, y sin documentacion tecnica que respalde su comportamiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_5; presumiblemente transformer, sin confirmar) |
| Parametros totales | 21.232.112.736 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (compressed-tensors); repo base en NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo mas alla de la etiqueta `qwen3_5` y de la referencia a su modelo base. El nombre del modelo base (Qwen3.8-27B-Uncensored-NVFP4) sugiere una variante de la familia Qwen 3.5 de aproximadamente 27 mil millones de parametros, con ajuste de alineacion eliminado ("uncensored") y cuantizada en NVFP4, pero no hay documentacion que confirme numero de capas, tipo de atencion, vocabulario ni estrategia de entrenamiento.

Tampoco se dispone de datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de ajuste. El proceso documentado por el autor se limita a la cuantizacion en 8 bits con `compressed-tensors` a partir del modelo base. No se describen innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto: capacidad esperada por herencia del modelo base, sin evaluacion publicada en este repositorio.
- Razonamiento y codigo: no disponible; no hay benchmarks ni ejemplos que lo confirmen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Alineacion y filtros de seguridad: el modelo base es una variante "uncensored", por lo que cabe esperar una reduccion de los rechazos y de los filtros de contenido.

## Casos de uso

- Despliegue en hardware con VRAM limitada: la cuantizacion en 8 bits reduce el peso del modelo a unos 24,7 GB, lo que permite servirlo en una unica GPU de 40-48 GB o en configuraciones multi-GPU de consumo, a diferencia del formato NVFP4 original que requiere hardware compatible con FP4.
- Experimentacion e investigacion sobre modelos sin alineacion: util para estudiar el comportamiento de modelos "uncensored" en tareas de generacion abierta, comparando respuestas frente a variantes alineadas.
- Prototipado de pipelines de inferencia: sirve como banco de pruebas para validar cargas con `compressed-tensors` en vLLM o en librerias compatibles antes de pasar a modelos con soporte documentado.
- Generacion de texto creativo sin restricciones tematicas: el caracter "uncensored" del modelo base puede ser util en entornos controlados de escritura de ficcion o guiones donde los filtros estandar resultan limitados.
- Evaluacion comparativa de cuantizaciones: permite medir la perdida de calidad de un guardado en 8 bits frente al modelo base en NVFP4 sobre un mismo conjunto de prompts.
- Fine-tuning ligero sobre un checkpoint ya cuantizado: aunque limitado, puede servir para adaptaciones con tecnicas compatibles con pesos de 8 bits en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 25-30 GB solo para pesos en 8 bits; hay que anadir la cache KV, que depende del contexto y de la arquitectura (no disponible). Para contextos largos, prever 35-45 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para servirlo con comodidad en una sola tarjeta.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, 3090) sin descarga parcial a CPU o cuantizacion adicional; en ese caso el rendimiento cae de forma notable.
- Opciones de despliegue: vLLM con soporte de `compressed-tensors` es la via mas directa; llama.cpp y Ollama requeririan una conversion a GGUF no publicada por el autor; TGI no garantiza compatibilidad con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Documentacion |
|---|---|---|---|---|---|
| LLM-Autoscan-v1 | 21,2 B (guardado 8 bits) | no disponible | 8 bits (compressed-tensors) | Apache 2.0 | Minima (solo model card basica) |
| orcarouter/Qwen3.8-27B-Uncensored-NVFP4 (base) | ~27 B (nominal) | no disponible | NVFP4 | no disponible | No disponible en la informacion |
| Qwen 3.5 (familia original) | Variable | no disponible | Multiples | Apache 2.0 (segun familia) | Extensa, con benchmarks publicados |

La comparacion con la familia Qwen original es solo orientativa: este repositorio no publica resultados que permitan verificar la calidad tras la cuantizacion ni tras el ajuste "uncensored".

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay datos de contexto, idiomas, datos de entrenamiento ni evaluaciones, lo que impide garantizar su comportamiento.
- Riesgo elevado de alucinacion y de respuestas no verificadas, agravado por la falta de benchmarks.
- El caracter "uncensored" del modelo base implica menor rechazo de contenido sensible; no es adecuado para aplicaciones orientadas al publico sin capas de moderacion externas.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos de genero, raza, idioma o ideologia.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad legal del contenido generado recae en el desplegador.
- Compatibilidad de despliegue incierta: el formato `compressed-tensors` en 8 bits requiere versiones recientes de las librerias de inferencia; no hay GGUF ni versiones para Ollama.
- Modelo sin traccion (0 descargas, 0 likes): no hay comunidad que haya validado su funcionamiento, por lo que conviene tratarlo como experimental.
- El nombre "Autoscan" no viene acompanado de ninguna descripcion funcional; no se debe asumir que incorpora capacidades de analisis o escaneo automatico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/secai1999/LLM-Autoscan-v1
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-NVFP4
