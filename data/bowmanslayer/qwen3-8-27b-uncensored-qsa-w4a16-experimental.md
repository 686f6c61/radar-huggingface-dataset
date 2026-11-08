# bowmanslayer/Qwen3.8-27B-Uncensored-QSA-W4A16-Experimental

## Resumen

Qwen3.8-27B-Uncensored-QSA-W4A16-Experimental es un modelo derivado publicado por el usuario bowmanslayer en Hugging Face. Se trata de una cuantización GPTQ de 4 bits (W4A16) de un modelo denominado Qwen3.8-27B-Uncensored, que a su vez parte de higa2515/Qwen3.8-27B-QSA-BF16. El pipeline declarado es image-text-to-text, por lo que el modelo conserva capacidad multimodal de entrada (imagen y texto), y los idiomas soportados son inglés y chino.

La variante incorpora la etiqueta QSA (sparse-attention) heredada del modelo base y se distribuye en formato safetensors para su uso con vLLM. La designación "uncensored" y "abliterated" indica que se ha aplicado un proceso de eliminación de rechazos sobre el modelo original, lo que lo orienta a usos donde se requiere baja censura en las respuestas. El repositorio está marcado como experimental y como no apto para todas las audiencias.

Un dato relevante es la discrepancia entre el nombre comercial (27B) y el recuento real de parámetros en safetensors: 6.284.446.960 parámetros (aproximadamente 6,28 mil millones). El acceso es restringido y requiere aceptar condiciones en Hugging Face. El repositorio ocupa 19,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención dispersa QSA; tag de arquitectura qwen3_5 |
| Parametros totales | 6.284.446.960 (según safetensors); el nombre indica 27B, dato no coincidente |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos de 4 bits, activaciones de 16 bits) en formato GPTQ; el modelo base se distribuye en BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio. El tag qwen3_5 sugiere una base de la familia Qwen, y la etiqueta qsa (sparse-attention) indica que el modelo incorpora atención dispersa, presumiblemente para reducir el coste computacional en secuencias largas. El pipeline image-text-to-text confirma que acepta imágenes como entrada junto con texto, aunque no se especifican el codificador visual ni la resolución de entrada.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El proceso de "abliteration" aplicado por el modelo base (JonathanColetti/Qwen3.8-27B-Uncensored) no está documentado en la información proporcionada. La cuantización W4A16 se ha generado con GPTQ, lo que reduce el peso de los pesos a 4 bits manteniendo activaciones en 16 bits, y el resultado se empaqueta para vLLM.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), con capacidad de describir o razonar sobre imágenes.
- Razonamiento y generación de código, asumiendo las capacidades heredadas de la familia Qwen; no confirmado explícitamente en la información disponible.
- Respuestas sin rechazos por contenido (variante uncensored/abliterated), orientada a escenarios con mínima censura.
- Despliegue optimizado para vLLM mediante pesos GPTQ W4A16.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia multimodal en producción con vLLM: al estar empaquetado en GPTQ W4A16 y etiquetado para vLLM, puede servirse como endpoint image-text-to-text con menor huella de VRAM que el modelo base en BF16.
- Procesamiento de documentos con imágenes: extracción y descripción de contenido visual combinado con texto, gracias al pipeline image-text-to-text.
- Asistentes conversacionales en inglés y chino: el soporte bilingüe permite desplegar un chatbot para usuarios de ambos idiomas sin modelos separados.
- Investigación sobre alineación y censura: la variante abliterated permite estudiar el comportamiento del modelo ante prompts que el original rechazaría, en entornos controlados.
- Evaluación de cuantización: al ser experimental, sirve para comparar la calidad de W4A16 frente a BF16 en tareas multimodales y de razonamiento.
- Prototipado con recursos limitados: los aproximadamente 6,28 mil millones de parámetros en 4 bits reducen los requisitos de memoria frente a un BF16 de tamaño equivalente, facilitando pruebas en una sola GPU.
- Fine-tuning ligero sobre la base cuantizada: no recomendado directamente sobre GPTQ, pero el modelo base BF16 puede emplearse para adaptaciones y luego cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.284.446.960 parámetros en W4A16, el peso de los pesos ronda los 3,2 GB; sumando overhead de activaciones, caché KV y el codificador visual, se estima un mínimo práctico de 6-8 GB, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una RTX 4090 (24 GB) o A100/H100 ofrecen margen amplio.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8 GB o más, sujeto a verificación empírica; no confirmado.
- Opciones de despliegue: vLLM es la librería declarada; llama.cpp, Ollama y TGI no están confirmados para este checkpoint GPTQ.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-QSA-W4A16-Experimental | 6.284.446.960 (según safetensors) | no disponible | apache-2.0 | safetensors GPTQ W4A16 | Experimental, acceso restringido, multimodal |
| JonathanColetti/Qwen3.8-27B-Uncensored | no disponible | no disponible | no disponible | no disponible | Modelo base sin cuantizar |
| higa2515/Qwen3.8-27B-QSA-BF16 | no disponible | no disponible | no disponible | BF16 | Base con atención dispersa QSA |
| bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision | no disponible | no disponible | no disponible | W4A16 | Variante del mismo autor orientada a visión |

## Limitaciones y advertencias

- El nombre indica 27B pero el recuento real en safetensors es de 6,28 mil millones de parámetros; conviene verificar el checkpoint antes de dimensionar infraestructura.
- Modelo marcado como experimental: no hay garantías de estabilidad ni de calidad frente al base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de despliegues.
- La variante uncensored/abliterated elimina rechazos de seguridad; aumenta el riesgo de generar contenido dañino, sesgado o inexacto y exige filtros propios en producción.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados que permitan estimarlo.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin pruebas.
- Sin descargas ni likes registrados: ausencia de validación comunitaria.
- Aunque la licencia declarada es apache-2.0, el uso comercial debe revisarse contra las condiciones del modelo base y del proceso de abliteration.
- La cuantización W4A16 puede degradar la precisión en tareas sensibles (matemáticas, código, razonamiento visual) frente al BF16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bowmanslayer/Qwen3.8-27B-Uncensored-QSA-W4A16-Experimental
- Modelo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Base QSA BF16: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Variante relacionada (visión + MTP): https://huggingface.co/bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision-mtp
- Variante relacionada (visión): https://huggingface.co/bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision/tree/main
