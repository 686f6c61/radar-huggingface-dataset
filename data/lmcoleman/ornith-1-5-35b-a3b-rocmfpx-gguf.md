# lmcoleman/Ornith-1.5-35B-A3B-ROCmFPX-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) desarrollado por Ornith AI, con 35.505 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. El modelo base está diseñado para tareas de razonamiento, generación de código y comprensión de imágenes (pipeline image-text-to-text). Esta versión concreta, publicada por lmcoleman, es una cuantización en formato GGUF utilizando tipos de tensor ROCmFPX, una familia de cuantización orientada a la inferencia en hardware AMD ROCm. Se basa en la búsqueda de esquemas por grupos de MagicQuant, pero renderizada en un formato específico que requiere un fork de llama.cpp con soporte ROCmFPX.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE multimodal de 35B en GPUs AMD con memoria limitada, gracias a las cuantizaciones Q4 y Q6 ofrecidas. Sin embargo, el usuario debe ser consciente de que estos archivos no son compatibles con llama.cpp estándar y necesitan una compilación específica. El modelo base, Ornith-1.5, introduce un bucle de auto-mejora (self-scaffolding y self-improvement) que lo hace particularmente interesante para investigación en aprendizaje por refuerzo y generación de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, image-text-to-text |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | ~3B (aproximadamente, segun el modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFPX Q4 (20,50 GiB) y Q6 (28,57 GiB), mas proyector de vision f16 (0,86 GiB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF con tipos de tensor ROCmFPX (q*_0_rocmfpx) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer MoE que activa aproximadamente 3.000 millones de parámetros por token, manteniendo un total de 35.500 millones. Segun la documentacion oficial de Ornith AI, la version 1.5 extiende el framework de auto-andamiaje (self-scaffolding) introducido en Ornith-1.0 hacia un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera andamios especificos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens ni el uso de tecnicas como RLHF o DPO en la informacion proporcionada.

La version ROCmFPX de lmcoleman no modifica la arquitectura del modelo, sino que aplica una cuantizacion por grupos basada en la busqueda de MagicQuant, renderizada en tipos de tensor ROCmFPX. Esta cuantizacion esta pensada para explotar las instrucciones FPX de las GPUs AMD, mejorando el rendimiento en hardware ROCm. El autor indica que ambos archivos (Q4 y Q6) superaron una prueba de perplejidad de humo, con valores de 6,55 y 6,50 respectivamente, aunque advierte que estos numeros no son comparables con otras mediciones por diferencias instrumentales.

## Capacidades

- Generacion de texto y razonamiento complejo, gracias a la arquitectura MoE con 3B activos.
- Generacion de codigo, segun la descripcion del modelo base (razonamiento y codigo).
- Comprension multimodal de imagenes (image-text-to-text), requiriendo el archivo mmproj adjunto para la parte visual.
- Capacidad de auto-mejora y generacion de tareas, derivada del enfoque self-scaffolding del modelo base.
- Soporte de tool calling o function calling: no se menciona en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no se menciona explicitamente, aunque el razonamiento es una capacidad central.
- Capacidades multilingues: no disponibles.
- Modo thinking o vision especial: la parte de vision esta soportada via mmproj, pero no se detalla un modo thinking.

## Casos de uso

- Analisis de imagenes con razonamiento contextual: el modelo puede recibir una imagen y generar una descripcion o respuesta razonada, aprovechando su componente multimodal. Es util en entornos donde se requiere interpretacion visual asistida por IA.
- Generacion de codigo a partir de capturas o diagramas: al combinar vision y generacion de codigo, podria utilizarse para convertir bocetos o diagramas en codigo fuente, aunque no hay ejemplos concretos publicados.
- Prototipado rapido en entornos AMD: gracias a la cuantizacion ROCmFPX, es posible ejecutar el modelo en GPUs AMD con memoria limitada (por ejemplo, una RX 7900 XTX con 24 GB) para experimentar con MoE multimodales sin necesidad de hardware de centro de datos.
- Investigacion en auto-mejora de modelos: el enfoque self-scaffolding del modelo base lo hace adecuado para experimentos academicos sobre generacion de tareas y aprendizaje por refuerzo, aunque esta version cuantizada no esta pensada para entrenamiento.
- Desarrollo de asistentes conversacionales con entrada visual: el modelo puede gestionar dialogos que incluyan imagenes, por ejemplo en soporte tecnico o educacion, siempre que se use el fork de llama.cpp adecuado.
- Evaluacion de cuantizaciones ROCmFPX: para ingenieros de ML interesados en comparar el rendimiento de diferentes esquemas de cuantizacion en hardware AMD, este repositorio ofrece una implementacion concreta con metadatos de verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona valores de perplejidad de humo (6,55 para Q4 y 6,50 para Q6), pero el propio autor advierte que no son comparables con otras mediciones y que no se ha realizado una comparacion con instrumentos coincidentes entre los renders ROCmFPX y sus contrapartes MagicQuant. Por tanto, no es posible presentar una tabla de benchmarks fiable.

## Requisitos de hardware

- Los archivos GGUF requieren un fork de llama.cpp con soporte ROCmFPX; el llama.cpp estandar no puede cargarlos (error `invalid ggml type`).
- Tamanos de archivo: Q4 ocupa 20,50 GiB, Q6 ocupa 28,57 GiB, y el proyector de vision mmproj ocupa 0,86 GiB. Se necesita VRAM suficiente para el archivo del modelo mas el proyector y overhead de inferencia.
- Para Q4 se estima un minimo de 24 GB de VRAM (por ejemplo, una RTX 4090 o una RX 7900 XTX). Para Q6 se necesitarian al menos 32 GB, lo que apunta a GPUs profesionales como A6000 o similares.
- El autor indica que el modelo fue construido y medido en un host AMD Strix Halo (Ryzen AI MAX+ 395, gfx1151), lo que sugiere compatibilidad con APUs AMD recientes con memoria unificada.
- Opciones de despliegue: exclusivamente mediante el fork ROCmFPX de llama.cpp. No se menciona compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (MoE multimodales de ~35B con ~3B activos). El modelo base Ornith-1.5-35B-A3B podria compararse con otros MoE como Mixtral 8x7B o Qwen2.5-MoE, pero no hay datos publicos de rendimiento en esta ficha. Se recomienda consultar la pagina del modelo base para posibles benchmarks.

## Limitaciones y advertencias

- Requisito de fork especifico: los archivos ROCmFPX no funcionan con llama.cpp estandar; es imprescindible utilizar un fork con soporte ROCmFPX, de lo contrario se producira un error de tipo ggml invalido.
- Ausencia de Q5: el pipeline rechazo la configuracion Q5 porque el ratio de compresion resultante correspondia a la banda Q6, por lo que no se publico para evitar una etiqueta incorrecta.
- Variante Q6_0_ROCMFPX_AGENT no publicada: se construyo pero provoco un segfault durante la evaluacion de perplejidad; el autor la retiro automaticamente.
- Perplejidad no comparable: los valores de smoke (6,55 y 6,50) no son comparables con otras tablas de perplejidad del repositorio MagicQuant debido a diferencias instrumentales.
- Sin benchmarks publicados: no hay datos de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K para esta cuantizacion.
- Idiomas no especificados: se desconoce el alcance multilingue del modelo.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario debe verificar que el fork ROCmFPX cumpla con su propia licencia.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/lmcoleman/Ornith-1.5-35B-A3B-ROCmFPX-GGUF
- Modelo base Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Coleccion Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Pagina oficial de Ornith-1.5 (blog): https://ornith.ai/ornith_1_5.html
- Repositorio MagicQuant GGUF (alternativa sin ROCmFPX): https://huggingface.co/lmcoleman/Ornith-1.5-35B-A3B-MagicQuant-GGUF
