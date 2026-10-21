# cicero99zz/diffusiongemma-26B-A4B-B2-Experimental-Q4_K_M-GGUF

## Resumen

DiffusionGemma B2 es una cuantización GGUF Q4_K_M de un modelo experimental de lenguaje construido por el usuario `cicero99zz` a partir de dos linajes: `google/diffusiongemma-26B-A4B-it` y la variante comunitaria `edwixx/diffusiongemma-26B-A4B-it-HERETIC-Uncensored`. No se trata de un modelo entrenado desde cero, sino de un injerto (splice) a precisión F16 en el que se sustituyen 46 tensores de down-projection por los del modelo de Google, manteniendo 646 tensores del modelo de Edwixx, y que después se cuantiza a Q4_K_M. El objetivo declarado es corregir un fallo observado de sustituciones espurias del token «own» y reducir la latencia de inferencia.

El modelo tiene 25.250.987.068 parámetros reales según safetensors (comercializado como «26B» en el nombre), una arquitectura de mezcla de expertos con 128 expertos por tensor y decodificación por difusión iterativa sobre un lienzo («canvas») de 256 tokens con hasta 48 pasos de denoising. El contexto físico de servicio es de 32768 tokens con caché KV en F16, con un límite público de prompt más salida de 32000 tokens.

Su relevancia es acotada y de carácter experimental: documenta un método reproducible de reparación de pesos por sustitución de tensores, con manifiesto, hashes y scripts incluidos, y publica una comparación cronometrada de cinco prompts con semilla fija. No es un modelo de propósito general validado ni cuenta con benchmarks estándar; requiere un runtime específico de DiffusionGemma y rechaza explícitamente herramientas e imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y decodificacion por difusion iterativa; 128 expertos por tensor de expertos segun la model card |
| Parametros totales | 25.250.987.068 (25,25 mil millones) |
| Parametros activos | No disponible (la nomenclatura «A4B» sugiere ~4 mil millones activos; no confirmado en la informacion disponible) |
| Longitud de contexto | 32768 tokens fisicos (F16 KV); limite publico de prompt + salida de 32000 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada, con mapa exacto de 692 tipos de tensor) |
| Idiomas soportados | Ingles (`en` declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, archivo unico `diffusiongemma-26B-A4B-hybrid-B2-down-q4_k_m.gguf` de 16.806.812.224 bytes (15,652 GiB) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos con decodificacion no autoregresiva por difusion: la generacion se realiza sobre un lienzo de 256 tokens que se refina a lo largo de un maximo de 48 pasos de denoising, con un numero de pasos de salida variable segun el prompt. La model card confirma la presencia de down-projections de expertos apilados con 128 expertos por tensor en las capas 11 a 29, ademas de 27 down-projections compartidas entre las capas 3 y 29.

No hay entrenamiento nuevo en esta ficha. B2 se construye por injerto a F16 seguido de cuantizacion: se reemplazan 27 down-projections compartidas (capas 3-29) y 19 down-projections de expertos apilados (capas 11-29) por los payloads de `google/diffusiongemma-26B-A4B-it`, mientras que los otros 646 tensores conservan los pesos de la variante Edwixx, incluidas las 29 proyecciones de salida de atencion modificadas. Adicionalmente se normalizan los tipos de tokens de control del tokenizador y la plantilla de chat a los del modelo Base, de modo que la entrada de prueba corresponde a los mismos 29 IDs de token. Los 692 payloads cuantizados superaron comprobaciones byte a byte frente a donante y original. No se empleo supresion de logits, nueva regla de denoising ni reentrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat normalizada a la del modelo Base.
- Decodificacion por difusion con refinamiento iterativo: lienzo de 256 tokens y entre 9 y 18 pasos de salida observados en la suite de diagnostico.
- Contexto largo de hasta 32768 tokens fisicos; se valido una canaria de prompt de 31744 tokens mas 256 de salida que recupero tres marcadores plantados.
- Generacion de codigo y de parsers simples: la model card reporta que el parser generado por B2 supero una prueba de listas anidadas, aunque no se ofrece benchmark de programacion.
- Conversaciones multiturno y cambio de conversacion verificados en el despliegue local (comprobaciones acotadas, no certificacion sostenida).
- Comportamiento conversacional sin censura heredado del linaje Edwixx, aunque el autor no garantiza que se mantenga inalterado tras el injerto.
- Sin soporte de tool calling ni function calling: las herramientas se rechazan explicitamente en el runtime verificado.
- Sin soporte de vision ni de entrada de imagenes: rechazadas explicitamente.
- Sin modo de pensamiento (thinking), audio ni otras modalidades; servicio verificado exclusivamente de texto.

## Casos de uso

- Investigacion sobre cuantizacion y reparacion de pesos: el repositorio incluye manifiesto de pesos, hashes, script de injerto a F16 e instrucciones de reproduccion, lo que permite replicar el experimento de sustitucion de down-projections y medir su efecto sobre el token «own» en otros entornos.
- Benchmarking de latencia en GPU de consumo: con 2,143 s de tiempo medio por peticion de 256 tokens en una RX 7900 XT y una comparativa de cinco modelos, sirve como banco de pruebas para estudiar el coste de los pasos de denoising frente a la decodificacion autoregresiva.
- Generacion de texto offline en estacion de trabajo: al ocupar 15,652 GiB de pesos y requerir runtime local, encaja en equipos con 20-24 GB de VRAM sin dependencia de API externa, por ejemplo para procesar documentacion en ingles o borradores internos.
- Escritura de ficcion y narrativa en ingles: dos de los cinco prompts de la suite congelada son de narrativa y ficcion, y el modelo completo los resolvio en 15-16 pasos con texto limpio en las pruebas registradas.
- Pruebas de estres de tokenizadores y plantillas de chat: la ficha documenta correcciones de tokenizacion exacta y truncado de salida decodificada, lo que lo hace util para validar implementaciones de servidores compatibles con endpoints antes de portarlas a otros modelos.
- Evaluacion de seguridad y alineacion en entorno controlado: al derivar de una variante «uncensored», permite estudiar en laboratorio como un injerto parcial de pesos alineados afecta al comportamiento del modelo, sin exponerlo a produccion.
- Validacion de sistemas de servido con desconexion de cliente: incluye un componente de propiedad y drenaje que mantiene la reserva de GPU hasta que termina el trabajo del backend, util para probar manejadores de peticiones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor lo indica expresamente: los datos son «resultados medidos limitados, no una correccion universal ni un benchmark general de programacion».

La unica tabla disponible es una comparacion congelada de cinco prompts (sailing, code, narrative, defensive security, fiction), semilla 1234, un lienzo de 256 tokens, maximo 48 pasos, 5 calentamientos y 15 peticiones cronometradas por modelo en una RX 7900 XT:

| Modelo | Pasos de salida (orden de prompts) | Tiempo medio por peticion (s) |
|---|---|---|
| google-base | 10, 10, 18, 18, 16 | 2,205 |
| community-edwixx | 28, 30, 48, 48, 48 | 6,031 |
| local-edwixx | 48, 17, 48, 48, 48 | 6,275 |
| hybrid-B1-attention | 40, 20, 47, 48, 48 | 6,108 |
| hybrid-B2-down | 18, 9, 16, 12, 15 | 2,143 |

Advertencias del propio autor sobre esta tabla: las 100 peticiones (25 de calentamiento y 75 medidas) coincidieron con sus trayectorias de referencia; repetir la misma semilla mide consistencia temporal, no calidad independiente; el orden fijo de modelos deja una advertencia termica y de orden, con relojes monitorizados pero no bloqueados; la temperatura registrada es de borde, no de union. Ademas, B2 obtuvo 18 pasos en el prompt de sailing frente al umbral original de 16, por lo que fallo esa puerta de calidad y su resultado se acepto como compromiso operativo. El parser del modelo Base tambien fallo con esta semilla.

## Requisitos de hardware

- VRAM estimada para los pesos: 15,652 GiB solo para el archivo Q4_K_M; hay que sumar caché KV en F16 para 32768 tokens (tamano no disponible en la informacion proporcionada).
- Consumo medido: 1,241 GiB de VRAM libre minima muestreada durante la canaria de 31744 + 256 tokens en una RX 7900 XT (20 GB), lo que situa el uso total del sistema en el entorno de 18-19 GB.
- GPU recomendadas: AMD Radeon RX 7900 XT (20 GB, unica verificada por el autor), RX 7900 XTX (24 GB), NVIDIA RTX 3090 y RTX 4090 (24 GB). Para Servidores, A100 o H100 de 40/80 GB son sobradas pero no hay mediciones publicadas.
- Cabe en GPU de consumo de 20-24 GB; no cabe en tarjetas de 16 GB ni inferiores, ya que solo los pesos ocupan 15,652 GiB.
- Despliegue: requiere el runtime experimental de DiffusionGemma incluido en el repositorio (carpeta `runtime/`), no un `llama-server` estandar. No hay soporte confirmado en vLLM, TGI, Ollama ni llama.cpp generico. El runtime aplica parches de tokenizacion exacta, truncado de salida, correccion del uso de completado y heartbeats SSE (la salida SSE sigue almacenada en bufer).
- Latencia: 2,143 s de media por lienzo de 256 tokens en la suite de cinco prompts (RX 7900 XT); 18,61 s para un prompt de 31744 tokens mas 256 de salida en la canaria.
- Throughput: no disponible.

## Comparativa con modelos similares

No se conocen en la informacion disponible otros modelos de difusion para texto cuantizados en GGUF con los que comparar de forma fiable. La comparacion posible se limita a los linajes de los que deriva B2, con los datos de la suite congelada del autor:

| Modelo | Parametros | Contexto | Pasos de salida (5 prompts) | Tiempo medio (s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| B2 (esta ficha) | 25,25 mil millones | 32768 | 18, 9, 16, 12, 15 | 2,143 | Apache-2.0 | GGUF Q4_K_M, runtime experimental |
| google-base | No disponible | No disponible | 10, 10, 18, 18, 16 | 2,205 | No disponible en la informacion | Modelo original de Google |
| community-edwixx | No disponible | No disponible | 28, 30, 48, 48, 48 | 6,031 | No disponible en la informacion | Variante «uncensored» comunitaria |
| local-edwixx (Q4 local) | No disponible | No disponible | 48, 17, 48, 48, 48 | 6,275 | No disponible en la informacion | Cuantizacion local del autor del experimento |
| hybrid-B1-attention | No disponible | No disponible | 40, 20, 47, 48, 48 | 6,108 | No disponible en la informacion | Variante intermedia del experimento (solo atencion) |

El resultado relevante es que la reversion exclusiva de las proyecciones de atencion (B1) no elimino la corrupcion sistematica en estos casos, mientras que la sustitucion de down-projections (B2) si lo hizo, con un tiempo medio 2,93 veces inferior al de la cuantizacion local de Edwixx.

## Limitaciones y advertencias

- Base experimental con validacion minima: cinco prompts con una sola semilla; el propio autor advierte que no es una correccion universal ni una certificacion de calidad.
- El prompt de sailing no supero la puerta original de 16 pasos (B2 tardo 18), por lo que el resultado se acepto como compromiso entre texto limpio y latencia.
- El fallo del token «own» esta documentado por el autor original, pero no se demuestra que todos los entornos de cuantizacion o el modelo sin cuantizar se comporten igual; pueden quedar artefactos residuales de redaccion.
- Riesgo de alucinacion no cuantificado: no hay benchmark de fidelidad ni de conocimiento, y el parser del modelo Base fallo en la prueba de listas anidadas con la misma semilla.
- Solo ingles declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- Sin tool calling, sin vision y sin audio: el runtime verificado rechaza explicitamente herramientas e imagenes, por lo que no sirve para pipelines de agentes.
- Dependencia de un runtime propio: no funciona en `llama-server` estandar, la salida SSE sigue almacenada en bufer y el limite HTTP exacto y la configuracion de memoria afectan al comportamiento.
- Herencia de una variante «uncensored»: el injerto no garantiza que el comportamiento sin censura se mantenga, ni que desaparezca; inadecuado para produccion orientada al publico sin filtros adicionales.
- Licencia Apache-2.0 declarada, pero los terminos de los modelos base (Google y Edwixx) deben verificarse por separado antes de un uso comercial.
- Validacion comunitaria practicamente nula: 0 descargas y 1 «like» en el momento de la consulta.
- Mediciones con advertencias metodologicas: orden fijo de modelos (posible sesgo termico), relojes no bloqueados y temperatura de borde en lugar de union.
- La capacidad de contexto larga solo se comprobo con una canaria de marcadores, no con certificacion sostenida de todo el contexto ni con multiples clientes concurrentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cicero99zz/diffusiongemma-26B-A4B-B2-Experimental-Q4_K_M-GGUF
- Modelo base Google: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Modelo base Edwixx (uncensored): https://huggingface.co/edwixx/diffusiongemma-26B-A4B-it-HERETIC-Uncensored
- Instrucciones del runtime experimental (ruta en el repositorio): https://huggingface.co/cicero99zz/diffusiongemma-26B-A4B-B2-Experimental-Q4_K_M-GGUF/tree/main/runtime
- Manifiesto de pesos y hashes (ruta en el repositorio): https://huggingface.co/cicero99zz/diffusiongemma-26B-A4B-B2-Experimental-Q4_K_M-GGUF/blob/main/weights.manifest.json
- Instrucciones de reproduccion (ruta en el repositorio): https://huggingface.co/cicero99zz/diffusiongemma-26B-A4B-B2-Experimental-Q4_K_M-GGUF/tree/main/reproduce
- Informe de resultados (ruta en el repositorio): https://huggingface.co/cicero99zz/diffusiongemma-26B-A4B-B2-Experimental-Q4_K_M-GGUF/blob/main/REPORT.json
- CSV de replicas de latencia (ruta en el repositorio): https://huggingface.co/cicero99zz/diffusiongemma-26B-A4B-B2-Experimental-Q4_K_M-GGUF/blob/main/latency-panel-01-replicates.csv
- Evidencias y validacion de servido (rutas en el repositorio): https://huggingface.co/cicero99zz/diffusiongemma-26B-A4B-B2-Experimental-Q4_K_M-GGUF/tree/main/evidence
- Paper, blog o demo adicionales: no disponible; la busqueda web no devolvio resultados relevantes para este modelo.
