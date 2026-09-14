# 3ntr0py-t4m3r/Ornith-1.5-DFlash2-Draft-GGUF

# Ornith 1.5 DFlash2 Draft (GGUF): borrador de decodificación especulativa para llama.cpp

## Resumen

Ornith 1.5 DFlash2 Draft es un modelo borrador (*drafter*) de decodificación especulativa publicado por el usuario 3ntr0py-t4m3r, derivado de z-lab/Qwen3.6-35B-A3B-DFlash. No es un modelo autónomo: carece de vocabulario propio, toma prestado el tokenizador de su modelo objetivo y genera tokens candidatos que el objetivo acepta o rechaza. Su única función es acelerar la decodificación del modelo objetivo Ornith-1.5-35B-Q4_K_M.gguf dentro del backend `draft-dflash` de llama.cpp.

El borrador tiene 526.251.520 parámetros y se distribuye en dos ficheros GGUF: una referencia bf16 de 1.063.708.288 bytes y una build de servicio Q4_K_M de 314.975.872 bytes, ambas con 96 tensores de la topología DFlash2. La arquitectura es una extensión de DFlash, difusión por bloques (*block diffusion*) que predice todas las posiciones de un bloque en paralelo, con un selector de ruta ligero y una convolución dinámica de dos taps.

Su relevancia práctica es acotada pero concreta: el autor reporta una mejora del 20 % al 26 % en la mediana emparejada de tokens/s de decodificación frente a operar sin especulación, con signo 5/5 en ventanas de 2K, 32K y 131K, y una tasa de aceptación de 0,68 a 0,79 en tareas de código agéntico. Todo ello en una única RTX 4090 de 24 GB sirviendo a 200K de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DFlash2 drafter (difusión por bloques sobre llama.cpp, `general.architecture = dflash`) |
| Parámetros totales | 526.251.520 (≈526 M) |
| Parámetros activos | No aplica (no es un modelo MoE; la variante A3B corresponde al modelo objetivo) |
| Longitud de contexto | No aplica al borrador; el objetivo se sirve a 204.800 tokens (200K) en la configuración de referencia |
| Tipos de cuantización | bf16 y Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (96 tensores; 1.063.708.288 B en bf16, 314.975.872 B en Q4_K_M) |
| Modelo base | z-lab/Qwen3.6-35B-A3B-DFlash |
| Biblioteca | llama.cpp |

Hiperparámetros declarados de la topología DFlash2: `block_size = 16`, `conv_kernel_size = 2`, `conv_group_size = 16`, `selector_rank = 256`, `selector_top_k = 16`, `target_layers = [2, 7, 12, 17, 23, 28, 33, 38]`.

## Arquitectura y entrenamiento

DFlash2 es una evolución de DFlash, un esquema de difusión por bloques para decodificación especulativa que predice de forma paralela todas las posiciones de un bloque en lugar de generar los tokens candidatos uno a uno. Esta segunda iteración añade un selector de ruta ligero (rank 256, top-k 16) y una convolución dinámica de dos taps (kernel 2, grupo 16) sobre bloques de 16 posiciones. El borrador lee las activaciones de las capas 2, 7, 12, 17, 23, 28, 33 y 38 del modelo objetivo, por lo que su entrenamiento está acoplado a esa topología concreta y no es portable a otros modelos sin reentrenamiento. El fichero se inicializó (*warm start*) desde el puente DFlash v1 y se entrenó con lotes ancla procedentes de una captura DFlash2 rodante.

El corpus de entrenamiento es íntegramente propio: 827 sesiones de codificación con uso de herramientas (~91,7 M tokens) extraídas de los registros de sesión de los autores, filtradas (exclusión de directorios de harness y scratch, descarte de sesiones cortas, colapso de turnos duplicados) y procesadas con un anonimizador que preserva la forma: claves de API, tokens `Bearer`, claves privadas PEM e IPs de malla se sustituyen por valores sintéticos con la misma estructura. Existía el plan de mezclar un ~5 % de `mlabonne/open-perfectblend` (Apache-2.0) para mejorar la generalización y reducir el sesgo hacia el *boilerplate* de las sesiones, pero el paso de incorporación no se completó: el corpus final es 100 % sesiones. No se menciona en la información disponible ningún uso de RLHF, DPO u otra fase de alineación.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: propone bloques de hasta `n_max = 2` tokens que el modelo objetivo valida.
- Aceleración de decodificación sin alterar la salida: en modo greedy la distribución final la decide el objetivo, no el borrador.
- Optimización específica para código agéntico multi-turno y uso de herramientas, dominio sobre el que se recopiló el corpus de entrenamiento.
- Funcionamiento en contextos largos, validado hasta 200K tokens en la configuración de referencia sobre una RTX 4090.
- No dispone de vocabulario propio ni de capacidad de generación autónoma: no puede ejecutarse como modelo independiente.
- No se documentan capacidades de visión, audio, tool calling propio ni razonamiento autónomo; estas dependen exclusivamente del modelo objetivo.
- Soporte multilingüe: no disponible.

## Casos de uso

- Servicio de codificación agéntica en producción: desplegado con `llama-server` junto a Ornith-1.5-35B-Q4_K_M, el borrador eleva la mediana de tokens/s de decodificación entre un 20 % y un 26 % en prompts reales de contexto de repositorio, con aceptación de 0,68 a 0,79, lo que reduce directamente el coste por token servido.
- Inferencia con contexto largo en hardware consumer: la configuración de referencia sirve 204.800 tokens a `parallel 1` en una única RTX 4090 de 24 GB sin OOM, lo que habilita análisis de repositorios completos o transcripciones largas en una estación de trabajo.
- Reducción de coste en APIs de generación de código: sustituir la decodificación estándar por este esquema especulativo recorta el tiempo de GPU por petición, que es el componente dominante del coste en servicios de código con mucho tráfico de entrada y salida.
- Agentes multi-paso con tool calling: el borrador fue entrenado sobre trayectorias agénticas reales, de modo que su tasa de aceptación es máxima precisamente en los turnos con llamadas a herramientas y salida estructurada que dominan los *pipelines* agénticos.
- Re-cuantización y ajuste: el fichero bf16 de 1.063.708.288 bytes está pensado como fuente de re-cuantización, lo que permite generar variantes Q5, Q6 u otras y medir su coste de aceptación frente a Q4_K_M.
- Investigación sobre decodificación especulativa: sirve como referencia reproducible de DFlash2 frente a otras familias (Medusa, EAGLE-3 o borradores estándar) midiendo aceptación por clase de prompt a 2K, 32K y 131K.
- Despliegues con requisitos de reproducibilidad: al mantener el muestreo greedy del objetivo, se puede adoptar la aceleración sin cambiar las salidas del sistema ya validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que se trata de un borrador sin vocabulario propio: la calidad de la salida es responsabilidad del modelo objetivo. Los únicos datos publicados son métricas de aceptación y velocidad, obtenidas con A/B emparejado, greedy y una repetición por prompt, sobre prompts reales de contexto de repositorio con una tarea de código agéntico (5 prompts por clase).

| Métrica | Resultado |
|---|---|
| Decodificación frente a sin especulación (mediana emparejada, tok/s) | +20 % a +26 % |
| Consistencia del signo | 5/5 en 2K, 32K y 131K |
| Rango de aceptación en código agéntico | 0,68 – 0,79 (mediana) |
| Rango de aceptación en el despliegue de 200K | 0,5 – 0,95 |
| Saturación de `accepted/draft` con `n_max = 2` | ~2,0 – 2,2 |
| Coste de aceptación de Q4_K_M frente a bf16 | ~1 punto porcentual de *prefill* |

## Requisitos de hardware

- Borrador en Q4_K_M: 314.975.872 bytes (≈315 MB), la build recomendada para GPU de 24 GB.
- Borrador en bf16: 1.063.708.288 bytes (≈1,06 GB), pensado como referencia y fuente de re-cuantización.
- El borrador se descarga por completo en GPU (`--spec-draft-ngl 999`), por lo que su VRAM es marginal frente a la del objetivo.
- GPU confirmada: NVIDIA RTX 4090 de 24 GB, sirviendo el conjunto a `--ctx-size 204800`, `--n-gpu-layers 88`, `--parallel 1`, `--kv-unified`, `--cont-batching`, `--n-moe 0` y caché KV en `q8_0`, sin OOM.
- El tamaño del fichero del modelo objetivo no se detalla en la información disponible; el autor confirma que el conjunto completo cabe en 24 GB en la configuración indicada.
- Rendimiento medido en esa configuración: ~135 tok/s en decodificación y ~2.400 tok/s en *prefill* a 200K de contexto.
- Opciones de despliegue: exclusivamente `llama-server` / llama.cpp con el backend especulativo `--spec-type draft-dflash`. Se requiere una compilación de llama.cpp con soporte DFlash2; no se documenta compatibilidad con vLLM, TGI, Ollama ni otras pilas de inferencia.
- Bandera crítica de configuración: `--spec-draft-n-max 2` con `--spec-draft-n-min 1`. Valores superiores a 2 no aportan aceptación adicional y sí consumo de cómputo.

## Comparativa con modelos similares

No se dispone de datos numéricos de alternativas en la información proporcionada, por lo que la comparación es cualitativa y se marca como no disponible allí donde faltan cifras.

| Alternativa | Tipo | Parámetros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Ornith 1.5 DFlash2 Draft | Borrador por difusión de bloques (DFlash2) | 526 M | Heredado del objetivo (200K en la config. de referencia) | Apache-2.0 | +20 % a +26 % tok/s frente a sin especulación |
| Sin decodificación especulativa | Línea base | No aplica | Depende del objetivo | No aplica | Referencia del A/B (0 %) |
| Borradores estilo EAGLE-3 | Borrador con cabeza autoregresiva | No disponible | No disponible | No disponible | No disponible |
| Medusa | Cabezas de predicción múltiple | No disponible | No disponible | No disponible | No disponible |
| Borrador estándar de llama.cpp (`--spec-type draft`) | Borrador autoregresivo de vocabulario completo | No disponible | No disponible | No disponible | No disponible |

Ventaja estructural de DFlash2 frente a los borradores autoregresivos clásicos: la predicción paralela del bloque evita el coste secuencial del *drafting*, motivo por el que la ganancia se mantiene estable de 2K a 131K. Advertencia de portabilidad: los borradores DFlash2 están acoplados a las capas intermedias de un objetivo concreto, así que no son intercambiables entre modelos como sí lo son los borradores genéricos.

## Limitaciones y advertencias

- No es un modelo autónomo: no tiene vocabulario propio y no puede generar texto sin el modelo objetivo. Publicarlo como modelo de `text-generation` puede inducir a error en su uso.
- Dependencia de una compilación específica de llama.cpp con el backend `draft-dflash`. Una build estándar no lo cargará.
- Acoplamiento al objetivo: los `target_layers` [2, 7, 12, 17, 23, 28, 33, 38] fijan el borrador a la arquitectura de z-lab/Qwen3.6-35B-A3B-DFlash. No es reutilizable con otro modelo sin reentrenamiento.
- Sesgo de dominio: el corpus son 827 sesiones propias de código agéntico (~91,7 M tokens) y el *blend* de generalización planificado nunca se incorporó, por lo que el comportamiento fuera de ese dominio (texto general, otros idiomas, conversación abierta) no está medido.
- Riesgo de memorización: el corpus deriva de sesiones internas reales. Aunque el anonimizador sustituye credenciales, tokens `Bearer`, claves PEM e IPs por valores sintéticos de la misma forma, persiste el riesgo de reproducir patrones estructurales, rutas o convenciones internas de esas sesiones.
- Techo de contexto no verificado: el autor indica explícitamente que no se ha probado nada por encima de 200K.
- Techo de *drafting*: con `n_max > 2` la aceptación se satura (~2,0–2,2), de modo que aumentar el número de tokens propuestos solo consume cómputo.
- Idiomas soportados: no disponibles; no hay evaluación multilingüe publicada.
- Licencia Apache-2.0, alineada con la familia DFlash del modelo base, por lo que el uso comercial está permitido; conviene verificar igualmente los términos del modelo objetivo con el que se combine.
- Validación comunitaria nula: 0 descargas y 0 *likes* en el momento de la consulta, sin más garantías que las métricas del propio autor.
- Los datos de rendimiento proceden de A/B con una única repetición greedy por prompt y 5 prompts por clase; son indicativos, no un estudio estadístico amplio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3ntr0py-t4m3r/Ornith-1.5-DFlash2-Draft-GGUF
- Modelo base: https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash
- llama.cpp (repositorio, backend `draft-dflash`): https://github.com/ggml-org/llama.cpp
- Dataset del blend planificado: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Paper de DFlash: *DFlash: Block Diffusion for Flash Speculative Decoding*, arXiv 2602.06036 (URL no disponible en la información proporcionada)
- DFlash 2: *DFlash 2: Keep Drafting Parallel*, inco.ai, agosto de 2026 (URL no disponible en la información proporcionada)
