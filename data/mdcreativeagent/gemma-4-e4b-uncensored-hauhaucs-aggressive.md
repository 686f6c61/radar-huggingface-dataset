# mdcreativeagent/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive

## Resumen

Gemma-4-E4B-Uncensored-HauhauCS-Aggressive es una variante "abliterated" (sin mecanismos de rechazo) del modelo multimodal google/gemma-4-e4b-it, publicada por el usuario HauhauCS y redistribuida en el repositorio mdcreativeagent de Hugging Face. El modelo conserva la arquitectura y capacidades del Gemma 4 E4B-IT original —texto, imagen, vídeo y audio— pero elimina los rechazos ante peticiones que el modelo base declinaría, orientándose a casos de uso donde se necesita generación sin filtros de seguridad.

La relevancia de esta ficha es doble: por un lado documenta una técnica de modificación de pesos (abliteration) aplicada a un modelo multimodal de Google; por otro, sirve como ejemplo de los riesgos y limitaciones de redistribuir modelos derivados bajo licencia Gemma. El repositorio incluye únicamente pesos en formato GGUF, cuantizados con importance matrix (imatrix) y con perfiles propietarios K_P ("Perfect") del autor.

El modelo declara 4B de parámetros (7.518.069.290 parámetros reales en safetensors según los metadatos del repo), 42 capas con atención mixta (sliding window de 512 y atención completa), contexto de 131K tokens y 18 capas KV compartidas para eficiencia de memoria. Está pensado para ejecución local en llama.cpp, LM Studio, Jan o koboldcpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), 42 capas con atención mixta sliding window (512) + atención completa, 18 capas KV compartidas |
| Parametros totales | 7.518.069.290 (dato de safetensors); la model card indica "4B parameters" |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 131.000 tokens |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P; mmproj en f16 |
| Idiomas soportados | en, multilingual (sin listado completo de idiomas) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (incluye fichero mmproj separado para visión/audio); el repo declara safetensors en metadatos pero el contenido publicado es GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-e4b-it, un transformer multimodal nativo que procesa texto, imagen, vídeo y audio. La arquitectura usa 42 capas con un patrón mixto de atención: ventanas deslizantes de 512 tokens combinadas con capas de atención completa, y 18 capas con KV compartidas para reducir el coste de memoria en contexto largo. El contexto máximo declarado es de 131K tokens.

Sobre el entrenamiento original de Gemma 4 E4B-IT no se aporta información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La modificación de HauhauCS consiste en una técnica de abliteration sobre los pesos: se eliminan las direcciones de activación asociadas a rechazos, sin cambios en datasets ni en capacidades según el autor. Las cuantizaciones se generan con importance matrix (imatrix) para preservar calidad en los pesos modificados, e incluyen perfiles K_P propietarios que, según el autor, mejoran la calidad en 1-2 niveles respecto al quant base con un incremento de tamaño del 5-15%. No se documenta el proceso exacto de abliteration ni el conjunto de evaluación empleado (el autor cita "0/465 refusals" sin detallar el benchmark).

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante el fichero mmproj.
- Comprensión de vídeo y audio de forma nativa (según la model card).
- Razonamiento y respuesta a instrucciones heredados del modelo base Gemma 4 E4B-IT.
- Capacidades multilingües (etiquetado como "multilingual", sin listado cerrado).
- Generación sin rechazos ante peticiones que el modelo base declinaría (variante "Aggressive").
- Compatibilidad con tool calling y function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated frente al original, comparando tasas de rechazo y calidad de respuesta en dominios sensibles.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas donde el modelo base aplicaría filtros.
- Análisis de contenido multimedia local: transcripción y descripción de audio, vídeo e imágenes en un pipeline con llama.cpp usando el fichero mmproj, sin depender de APIs externas.
- Procesamiento de documentos largos: con 131K tokens de contexto, resumen y extracción de información en contratos, informes o expedientes extensos.
- Asistente conversacional en local para entornos con requisitos de privacidad: al ejecutarse en GGUF con llama.cpp o LM Studio, los datos no salen del equipo.
- Evaluación de cuantizaciones: los perfiles K_P e imatrix permiten comparar calidad y tamaño frente a cuantizaciones estándar (Q4_K_M, Q5_K_M) en tareas multimodales.
- Prototipado de aplicaciones multimodales en hardware de consumo: el quant Q4_K_M ocupa 5,0 GB y cabe en GPUs con 8 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente cita "0/465 Refusals" en su conjunto de pruebas de rechazo, sin especificar metodología, prompts ni comparación con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (solo texto): Q2_K_P ~4,2 GB; Q4_K_M ~5,0 GB; Q5_K_M ~5,4 GB; Q6_K_P ~5,9 GB; Q8_K_P ~7,6 GB.
- Con visión/audio hay que sumar el mmproj f16 (~945 MB) y el espacio de caché KV para el contexto elegido.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizaciones Q4-Q8; en 8 GB de VRAM conviene Q4_K_M o inferior.
- GPUs profesionales (A100, H100) no son necesarias para este tamaño, salvo para servir muchas peticiones concurrentes con contexto largo.
- Opciones de despliegue: llama.cpp (con `--jinja` obligatorio para el chat template y `-ngl 99` para descarga completa en GPU), LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no se documentan como soportados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | 4B (7,5B en safetensors) | 131K | Texto, imagen, vídeo, audio | Gemma | GGUF |
| google/gemma-4-e4b-it (base) | 4B | 131K | Texto, imagen, vídeo, audio | Gemma | safetensors, GGUF |
| Otras variantes abliterated de Gemma | no disponible | no disponible | no disponible | Gemma | GGUF |
| Modelos multimodales pequeños de código abierto (p. ej. Qwen-VL, Llama Vision) | no disponible en esta ficha | no disponible | imagen-texto | varía | varía |

La comparación directa con alternativas abliterated de la misma familia no está documentada en la información disponible; el modelo base google/gemma-4-e4b-it es la referencia natural, con idénticas capacidades salvo la eliminación de rechazos.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o sexualmente explícito; no es apto para aplicaciones de cara al público sin moderación adicional.
- El autor advierte que la variante "Aggressive" puede añadir breves disclaimers heredados del entrenamiento base, aunque el contenido completo siempre se genera.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual del modelo modificado.
- La model card reconoce que Gemma 4 recibió menos pruebas manuales en contexto largo que otras versiones del autor, lo que aumenta la incertidumbre sobre el comportamiento a 131K tokens.
- La licencia Gemma impone restricciones de uso (política de uso prohibido de Google) que pueden entrar en conflicto con el propósito del modelo; es responsabilidad del usuario verificar el cumplimiento antes de cualquier uso comercial.
- El repositorio declara safetensors en los metadatos pero solo publica GGUF; no hay pesos en precisión completa disponibles.
- El modelo está etiquetado como "multilingual" pero solo se declara inglés de forma explícita; el rendimiento en castellano no está verificado.
- La compatibilidad de hardware de Hugging Face no reconoce los quants K_P, lo que puede confundir sobre los ficheros realmente disponibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni validación independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mdcreativeagent/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Repositorio original del autor: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Descarga Q4_K_M: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive/resolve/main/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf
- Descarga Q8_K_P: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive/resolve/main/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Descarga mmproj (visión/audio): https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive/resolve/main/mmproj-Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-f16.gguf
