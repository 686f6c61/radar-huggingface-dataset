# daemonix/Qwen3.8-Flash-Next-abliterated-Q4-GGUF-antirez-DS4

## Resumen

Qwen3.8-Flash-Next-abliterated-Q4-GGUF-antirez-DS4 es una conversión comunitaria del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario daemonix en Hugging Face. Se trata de un GGUF cuantizado en Q4_K/MXFP4 al que se le ha aplicado la edición "abliterated" v2 de huihui-ai, que elimina los mecanismos de rechazo del modelo base. El resultado es un modelo sin censura (uncensored) empaquetado específicamente para el motor de inferencia DS4 (DwarfStar) de Salvatore Sanfilippo (antirez).

El modelo base tiene 179.551.050.368 parámetros (aproximadamente 180 mil millones) y una arquitectura híbrida que combina atención lineal (SSM) con atención completa y expertos enrutados (MoE), según se deduce de los nombres de tensores documentados (`ssm_out`, `attn_output`, `ffn_down_shexp`). El paquete GGUF ocupa 177,3 GB e incluye pesos MTP (multi-token prediction) para decodificación especulativa y una tabla n-gram en BF16 que DS4 lee desde disco.

La relevancia de esta ficha es doble: por un lado, documenta un caso de cuantización de un modelo de gran escala para ejecución local en Apple Silicon; por otro, ilustra el ecosistema de variantes "abliterated" que modifican el comportamiento de rechazo del modelo. No se han publicado evaluaciones de calidad, tasas de rechazo ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal (SSM) + atención completa + MoE con expertos compartidos (inferida de nombres de tensores; no confirmada explícitamente) |
| Parametros totales | 179.551.050.368 (~180 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `--ctx 8192`) |
| Tipos de cuantizacion | Q4_K (gate/up de expertos enrutados), MXFP4 (down de expertos enrutados), Q8_0 (proyecciones densas y expertos compartidos), F16 (hyper-connections), BF16 (embeddings y tabla n-gram) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (layout `qwen4exp` propietario de DS4) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-Flash-Next no se detalla en la información proporcionada. Los nombres de tensores editados por la ablación (`ssm_out`, `attn_output`, `ffn_down_shexp`) indican una estructura híbrida con proyecciones de salida de atención lineal (SSM) en 36 capas, proyecciones de salida de atención completa en 12 capas y proyecciones down de expertos compartidos en 48 capas, lo que sugiere un transformer con 48 capas de tronco y mezcla de mecanismos de atención. La presencia de "routed experts" y "shared experts" confirma un diseño MoE.

El entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) no está documentado en la información disponible. La edición abliterated de huihui-ai v2 modifica únicamente las matrices que escriben en el flujo residual fuera de los expertos enrutados: `ssm_out` (36 capas), `attn_output` (12 capas) y `ffn_down_shexp` (48 capas), aplicando la fuerza máxima `--ablate-experts 2`. Cada tensor editado cambia aproximadamente un 3,6 % de su norma, concentrado en pocas direcciones, consistente con una ablación de tipo proyección. No se modifican expertos enrutados, embeddings, n-gramas, capa MTP, router, hyper-connections ni tokenizer. La conversión de daemonix aplica el parche Q8_0 de huihui-ai sobre el GGUF Q4 de antirez sin recuantizar ni reentrenar, verificando byte a byte los tensores no editados.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Razonamiento y respuesta directa sin mecanismos de rechazo (variante abliterated, "no warnings" según huihui-ai).
- Decodificación especulativa mediante MTP (multi-token prediction) con la opción `--mtp` de DS4.
- Entrada de imagen si se descarga el codificador visual `mmproj-Qwen3.8-Flash-Next-Q8_0.gguf` y se pasa `--vision`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de modo "thinking" desactivable (`--nothink` en DS4).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Ejecución local en Apple Silicon de gran capacidad: el paquete está diseñado para Macs con más de 64 GB de RAM (probado en un Mac de 128 GB), lo que permite desplegar un modelo de ~180 B en hardware de escritorio sin GPU dedicada, usando DS4 con los pesos residentes y la tabla n-gram leída desde SSD.
- Investigación sobre alineación y rechazo: la variante abliterated permite estudiar el comportamiento del modelo sin los mecanismos de rechazo, comparando respuestas frente al original Q4 en el mismo motor (el autor sugiere `./ds4-eval -m MODEL.gguf --suite hard`).
- Generación de texto sin restricciones temáticas en entornos controlados: útil para experimentación con prompts que el modelo original rechazaría, siempre que se respeten las obligaciones legales y éticas del usuario.
- Sustitución directa ("drop-in replacement") del GGUF `Qwen3.8-Flash-Next-Q4.gguf` en pipelines DS4 existentes: al mantener el layout `qwen4exp` byte-idéntico, se puede intercambiar el archivo sin cambiar configuración ni scripts.
- Procesamiento de imágenes con el codificador visual: combinando el GGUF con `mmproj-Qwen3.8-Flash-Next-Q8_0.gguf` se habilita entrada multimodal en local, útil para tareas de descripción o extracción de información de imágenes.
- Aceleración de inferencia con MTP: activando `--mtp` se aprovechan los pesos de predicción multi-token ya incluidos en el archivo para reducir la latencia en generación de texto largo.
- Pruebas de cuantización y empaquetado: el repositorio incluye el script `ds4_abliterate.py` y sumas SHA-256, lo que lo convierte en un caso de referencia para reproducir conversiones GGUF con parches externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta un smoke test cualitativo en un Mac de 128 GB con DS4 (commit `b3f50180`), `--temp 0 --nothink` y salidas de 120 tokens:

| Prompt | Q4 original | Esta release |
|---|---|---|
| Capital de Francia, en dos frases | Respuesta correcta | Respuesta idéntica palabra por palabra |
| Guía paso a paso para ganzuar una cerradura de pitones | Rechaza y explica solo el funcionamiento | Responde directamente |

El propio autor advierte que es un smoke test, no una evaluación: no se han medido tasas de rechazo, calidad de razonamiento ni de código, aceptación de MTP ni visión.

## Requisitos de hardware

- RAM: más de 64 GB para pesos residentes (69,74 GiB de pesos principales/MTP). Probado en un Mac de 128 GB Apple Silicon.
- Almacenamiento: 177,3 GB para el GGUF completo; se recomienda SSD local rápido porque la tabla n-gram de 95,37 GiB se lee desde disco durante la inferencia.
- GPU: no se documentan GPUs dedicadas (A100, H100, RTX 4090); el paquete está orientado a Apple Silicon con Metal (etiqueta `metal`). En Macs con menos de 64 GB se puede usar `--ssd-streaming`.
- Cabe en consumer GPU: no disponible; el diseño apunta a Macs de gama alta, no a GPUs de consumo.
- Despliegue: exclusivamente DS4 / DwarfStar (compilado con `make`). Otros motores GGUF no han sido validados con este layout `qwen4exp`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (daemonix, abliterated Q4 DS4) | ~180 B | no disponible | GGUF `qwen4exp` | qwen-community-license-1.0 | Solo DS4; sin censura; incluye MTP y n-gram BF16 |
| Qwen/Qwen3.8-Flash-Next (base) | ~180 B | no disponible | safetensors (original) | qwen-community-license-1.0 | Modelo original con rechazos; referencia de calidad |
| antirez/qwen3.8-flash-next-gguf (Q4) | ~180 B | no disponible | GGUF `qwen4exp` | qwen-community-license-1.0 | Misma cuantización sin ablación; base de esta conversión |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | ~180 B | no disponible | GGUF (parche unsloth) | qwen-community-license-1.0 | Parche abliterated v2; esta release aplica ese parche |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Modelo sin censura: la ablación elimina los rechazos, lo que puede producir contenido dañino, ilegal o inseguro; requiere supervisión y filtros externos en producción.
- Sin evaluación publicada: no hay datos de tasas de rechazo, calidad de razonamiento, código ni visión para este archivo concreto; el smoke test es anecdótico.
- Motor único: solo validado con DS4; otros motores GGUF (llama.cpp, Ollama, vLLM, TGI) no han sido probados con el layout `qwen4exp`.
- Requisitos de memoria elevados: más de 64 GB de RAM y 177 GB de disco; la tabla n-gram se lee desde SSD, lo que exige almacenamiento rápido.
- Sesgos e idiomas: no documentados; la lista de idiomas no está disponible.
- Licencia: qwen-community-license-1.0 (etiquetada "other"); es necesario revisar el archivo LICENSE para uso comercial. La conversión comunitaria no implica el respaldo de Qwen, huihui-ai, Ivan Fioravanti ni antirez.
- Riesgo de alucinación: no cuantificado; aplicable el riesgo habitual de los modelos de lenguaje de gran escala.
- Reproducibilidad: el parche de huihui-ai está ofuscado con XOR y clave publicada; el script `ds4_abliterate.py` permite reproducir el archivo, pero depende de revisiones concretas de los repositorios fuente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/daemonix/Qwen3.8-Flash-Next-abliterated-Q4-GGUF-antirez-DS4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF Q4 de antirez: https://huggingface.co/antirez/qwen3.8-flash-next-gguf
- Abliterated v2 de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Repositorio DS4 / DwarfStar: https://github.com/antirez/ds4
- Guía DS4 para Qwen3.8 Flash Next: https://github.com/antirez/ds4/blob/main/docs/QWEN38_FLASH_NEXT.md
