# aikexue170/rewrite3-4b-shorter-fp8

## Resumen

rewrite3-shorter-4B es un modelo de lenguaje especializado en la reescritura de texto generado por IA (AIGC) para que se asemeje a la escritura humana, dentro del contexto de la ficcion web china (网文). Lo desarrolla el autor independiente aikexue170 y forma parte de la tercera generacion de la familia rewrite. El modelo recibe un texto marcado con puntuaciones de "calidad" por frase y devuelve primero un analisis editorial (cadena de pensamiento) y despues el texto reescrito, con el objetivo de eliminar los patrones estereotipados tipicos de la prosa generada por IA.

La arquitectura se basa en Qwen3.5-4B (aproximadamente 4.660 millones de parametros) con un ajuste fino supervisado mediante LoRA que posteriormente se fusiona en los pesos base. Incorpora una cabeza MTP (multi-token prediction) entrenada de forma independiente para decodificacion especulativa, lo que acelera la inferencia en GPUs de gama baja. La variante "shorter" implica que la salida es sistematicamente mas corta que la entrada (objetivo de ratio 0,4 a 1,0, mediana en 0,7), porque el texto humano original es mas denso que el texto "hinchado" por IA.

El modelo es relevante para flujos de post-edicion editorial en la industria de la ficcion web, donde el volumen de manuscritos generados o reescritos por IA es elevado y requiere una pasada automatizada antes de la revision humana. Esta ficha describe la version cuantizada en FP8 W8A8 (ModelOpt) publicada en un unico archivo safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion de servicio recomendada con `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 W8A8 (ModelOpt); la cabeza MTP se mantiene en bf16 |
| Idiomas soportados | no disponible (el modelo card esta en chino y el dominio es ficcion web en chino; no se declaran idiomas oficialmente) |
| Licencia | no disponible de forma explicita; el autor indica que los pesos siguen la licencia del modelo base Qwen3.5 |
| Formato de pesos | safetensors (archivo unico, repo de 5,8 GB) |

## Arquitectura y entrenamiento

El modelo parte del base Qwen3.5-4B, sobre el que se aplica un ajuste fino supervisado con LoRA que despues se fusiona en los pesos. Se anade una cabeza MTP entrenada por separado e integrada en los pesos, con metricas declaradas de teacher-forced top-1 del 72,8 % y accept_proxy del 83,7 %, lo que habilita decodificacion especulativa. La version de este repositorio aplica cuantizacion FP8 W8A8 mediante ModelOpt en un unico archivo, excluyendo las capas `mtp.*` de la cuantizacion para preservar la aceleracion.

El entrenamiento se construye a partir de 20.000 textos originales humanos de ficcion web (con contenido SFW y NSFW) procedentes de obras bien valoradas en distintas plataformas. Sobre ellos se definieron mas de 100 patrones de "prosa IA" (sintaxis, ritmo, tono, imagenes, transiciones, tendencia a la explicacion) y se generaron pares (texto bueno, texto degradado) usando un modelo generador. Un modelo profesor puntua cada frase del texto degradado con una probabilidad de "mala calidad". Finalmente se compone una cadena de analisis que relaciona texto degradado, tipo de patron, puntuacion y texto bueno, y esa cadena de pensamiento se entrena junto con el resultado de reescritura. La cadena de pensamiento es aprendida, no un prompt externo.

## Capacidades

- Reescritura de ficcion: reorganiza el texto manteniendo el significado original y eliminando patrones estereotipados de prosa generada por IA.
- Cadena de pensamiento editorial: analiza frase a frase que es defectuoso, su gravedad y como corregirlo antes de producir el texto final, separado por `</think>`.
- Uso de puntuaciones por frase: interpreta marcas tipo `【0.04】` o `【NA】` insertadas al final de cada frase para calibrar la agresividad de la reescritura.
- Compresion controlada: la salida es mas corta que la entrada (ratio objetivo 0,4-1,0, mediana 0,7).
- Generalizacion de longitud: con la cadena de pensamiento admite entradas de varios miles de caracteres sin trocear, aunque el autor recomienda segmentar textos muy largos.
- Decodificacion especulativa: cabeza MTP integrada para acelerar la generacion.
- No se declaran capacidades de tool calling, agentes, vision, audio ni multilingueismo general.

## Casos de uso

- Post-edicion de manuscritos de ficcion web: el modelo recibe el capitulo con puntuaciones por frase y devuelve una version mas humana y compacta que el autor revisa y retoca, reduciendo el esfuerzo de reescritura manual.
- Deteccion y correccion de "relleno" AIGC: al comprimir a un ratio de 0,4-1,0 elimina frases redundantes y explicaciones innecesarias, util en pipelines editoriales con alto volumen de texto generado.
- Preprocesado antes de la revision humana: se ejecuta como primera pasada automatizada sobre textos marcados como sospechosos de AIGC, dejando al editor solo el ajuste fino.
- Normalizacion de estilo en series largas: mantiene el significado y reorganiza la prosa para que capitulos de distintos origenes (humano e IA) tengan una densidad y ritmo mas homogeneos.
- Analisis editorial asistido: la seccion de cadena de pensamiento sirve como informe de por que una frase suena artificial, reutilizable por el autor aunque no aplique la reescritura.
- Despliegue en hardware modesto: con cuantizacion FP8 y decodificacion especulativa MTP puede servirse con vLLM >= 0.28 en GPUs de gama media para procesar lotes de capitulos.
- Integracion en herramientas de escritura: al separar analisis y texto por `</think>`, un frontend puede mostrar el diagnostico y la propuesta de reescritura de forma independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento declarado es el de la cabeza MTP: teacher-forced top-1 del 72,8 % y accept_proxy del 83,7 %.

## Requisitos de hardware

- VRAM estimada: el repo pesa 5,8 GB en FP8 W8A8; la inferencia requiere aproximadamente 6-8 GB de VRAM para pesos, mas la cache KV para contextos de hasta 32.768 tokens.
- GPU recomendadas: vLLM >= 0.28 es requisito para el soporte de MTP de Qwen3.5; con esa version puede ejecutarse en GPUs de gama media con suficiente VRAM.
- GPU de consumo: el tamano de pesos en FP8 permite plantearlo en GPUs de consumo con 8-12 GB o mas, aunque la informacion no confirma modelos concretos.
- Opciones de despliegue: `vllm serve` con `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'`, `--max-model-len 32768` y `--gpu-memory-utilization 0.85`. El autor menciona tambien llama.cpp server para el parseo de `reasoning_content` y `content`, aunque la configuracion de este repositorio es para vLLM.
- Latencia y throughput: no disponibles; la decodificacion especulativa con MTP se presenta como mejora en tarjetas de gama baja, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-shorter-4B (este) | 4.660 M | 32.768 | Reescritura de ficcion con CoT y compresion | Sujeta a Qwen3.5 | HuggingFace |
| rewrite2-4b | no disponible | no disponible | Reescritura sin CoT, requiere trocear la entrada | no disponible | HuggingFace (variante GGUF) |
| Qwen3.5-4B (base) | ~4.000 M (aproximado) | no disponible | Modelo generalista | Licencia Qwen3.5 | HuggingFace |
| jev-novel-3-0.8b-fp8 | 800 M | no disponible | Puntuacion de "mala calidad" por frase (herramienta auxiliar) | no disponible | HuggingFace |

La comparacion con modelos generalistas de proposito similar no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La salida es siempre mas corta que la entrada por diseno; si se necesita mantener la longitud hay que usar la variante "keep", aun no publicada.
- Requiere puntuaciones por frase para un rendimiento optimo; con todo en `【NA】` el modelo tiende a reescribir con menos agresividad.
- La cadena de pensamiento consume 3.000-4.000 tokens con frecuencia; con `max_tokens` bajo puede devolver solo el analisis sin el texto reescrito.
- El dominio es ficcion web en chino; no se declaran idiomas soportados y el rendimiento fuera de ese dominio no esta documentado.
- El corpus de entrenamiento incluye contenido NSFW (SFW y NSFW), lo que puede reflejarse en las salidas.
- Riesgo de alucinacion no cuantificado; el modelo reordena y comprime, por lo que conviene verificar que el significado original se preserva.
- Licencia no declarada de forma explicita; el autor remite a la licencia del base Qwen3.5, que debe consultarse antes de uso comercial.
- La version FP8 W8A8 puede introducir degradacion respecto a los pesos bf16 originales; la cabeza MTP queda fuera de la cuantizacion.
- No hay benchmarks publicados que permitan validar la calidad de la reescritura frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aikexue170/rewrite3-4b-shorter-fp8
- Modelo auxiliar de puntuacion: https://huggingface.co/aikexue170/jev-novel-3-0.8b-fp8
- Generacion anterior (rewrite2): https://huggingface.co/aikexue170/rewrite2-4b-gguf
