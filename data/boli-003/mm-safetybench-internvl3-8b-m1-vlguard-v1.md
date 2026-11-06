# boli-003/mm-safetybench-internvl3-8b-m1-vlguard-v1

## Resumen

`mm-safetybench-internvl3-8b-m1-vlguard-v1` es un adaptador LoRA publicado por el usuario `boli-003` como parte de un proyecto de evaluacion de seguridad multimodal. No es un modelo autonomo: es un adaptador que debe cargarse sobre la revision exacta del modelo base `OpenGVLab/InternVL3-8B` (revision `853e3a797a661694b1b8ece0cb72dc2b23e3dac9`). El autor lo denomina "M1" dentro de una arquitectura de evaluacion mas amplia en la que un revisor visual separado, llamado "M3" (basado en Qwen3-VL), permanece congelado y no se fusiona con este adaptador.

El adaptador esta pensado exclusivamente para investigacion en seguridad multimodal, presumiblemente en el contexto del benchmark MM-SafetyBench, tal como sugiere el nombre del repositorio. Se trata de un LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del modelo de lenguaje de InternVL3-8B. El repositorio tiene un tamano de 0,0 GB (solo pesos del adaptador) y 13 descargas en el momento de la consulta.

Su relevancia es limitada y muy especifica: sirve para reproducir o auditar una evaluacion concreta de seguridad en modelos vision-lenguaje, no como modelo de proposito general. El autor indica explicitamente que los datos de entrenamiento y los scripts no se incluyen, y que los pesos estan congelados, por lo que el repositorio esta orientado a evaluacion sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre InternVL3-8B (transformer multimodal vision-lenguaje) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base InternVL3-8B tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base InternVL3-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican los terminos del modelo base; el autor senala ambiguedad upstream entre Apache-2.0 y MIT) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` |
| Rango / alpha LoRA | 16 / 32 |
| Modulos objetivo | `v_proj`, `q_proj`, `k_proj`, `o_proj` |
| Revision del base fijada | `853e3a797a661694b1b8ece0cb72dc2b23e3dac9` |
| SHA-256 del adaptador | `47974b7b6c49d465e77527278db642af2480045c25eb6199922c100fb04f2c53` |
| SHA-256 de `adapter_config.json` | `bf74750579098d5f5ad73cd5a34fd249cf87ff82805fb804e1b487f4b313cf81` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre las cuatro proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del modelo de lenguaje de InternVL3-8B. InternVL3 es una familia de modelos vision-lenguaje de OpenGVLab que combina un codificador visual con un transformer de lenguaje; en este caso el adaptador modifica unicamente el componente linguistico, segun indica la model card ("attach the LoRA to `model.language_model`"). No se especifica si el adaptador afecta a capas concretas o a todas las capas del language model.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El autor declara que los datos de entrenamiento y los scripts no estan incluidos y que los pesos estan congelados. Tampoco se documentan innovaciones tecnicas propias (decodificacion especulativa, atencion lineal, etc.). El unico detalle de integridad relevante es que se registra el hash SHA-256 del arbol de contenido del base y los hashes de los ficheros del adaptador, lo que permite verificar la reproducibilidad de la carga.

## Capacidades

- Al ser un adaptador sobre InternVL3-8B, hereda las capacidades multimodales del base: comprension de imagen y texto, respuesta a preguntas visuales y generacion de texto condicionada por imagen.
- El ajuste LoRA esta orientado a comportamiento de seguridad: el nombre del repositorio sugiere que modula las respuestas ante entradas multimodales potencialmente daninas o sensibles, en el marco de MM-SafetyBench.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): vision heredada del base; no se documenta ningun modo de razonamiento extendido ni audio.
- No es un modelo autonomo: requiere cargar el base en la revision fijada y adjuntar el adaptador con PEFT.

## Casos de uso

- Auditoria de seguridad multimodal: cargar el adaptador sobre InternVL3-8B en la revision fijada y evaluar si las respuestas del modelo ante imagenes y prompts sensibles se alinean con los criterios de MM-SafetyBench. Es el uso previsto por el autor.
- Reproduccion de experimentos: gracias a los hashes SHA-256 del base y del adaptador, un equipo puede verificar que reproduce exactamente la misma configuracion de pesos que el autor original.
- Investigacion comparativa de tecnicas de alineacion: usar este LoRA como variante "M1" frente a otras variantes o al base sin adaptar para medir el efecto del ajuste en metricas de seguridad.
- Docencia y formacion en seguridad de IA: servir como ejemplo practico de como un adaptador PEFT de bajo rango puede modular el comportamiento de un VLM sin reentrenar el modelo completo.
- Evaluacion de pipelines de revision multimodal: integrar el adaptador junto con un revisor visual separado (el "M3" basado en Qwen3-VL mencionado por el autor) para estudiar arquitecturas de doble modelo en tareas de moderacion.
- Pruebas de robustez ante jailbreaks visuales: emplear el adaptador para estudiar como responde el modelo ante imagenes con texto incrustado o combinaciones adversarias, siempre en entorno de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un "GitHub project package" para consultar prompts exactos, parametros de decodificacion, IDs de datos y metricas reportadas, pero dicho paquete no se incluye en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador en si (ocupa unos pocos MB); el consumo real lo determina el modelo base InternVL3-8B.
- Para el base InternVL3-8B en precision completa (BF16), se estima un requisito en torno a 16-20 GB de VRAM, incluyendo el codificador visual y overhead de activaciones; esta cifra es una estimacion general para modelos de 8B y no un dato publicado por el autor.
- GPU recomendadas: no especificadas por el autor. Para un 8B multimodal en BF16 se suelen emplear A100, H100, L40S o RTX 4090 (24 GB).
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB requeriria cuantizacion del base, aunque no se documenta compatibilidad del adaptador con bases cuantizados.
- Opciones de despliegue: PEFT sobre el base con la libreria `peft`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI con este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mm-safetybench-internvl3-8b-m1-vlguard-v1 | Adaptador LoRA sobre 8B | no disponible | Adaptador de seguridad multimodal | other (terminos del base) | Hugging Face, 13 descargas |
| OpenGVLab/InternVL3-8B (base) | 8B | no disponible en esta ficha | VLM completo | segun upstream (Apache-2.0/MIT segun el autor) | Hugging Face, ampliamente usado |
| Alternativas de seguridad multimodal comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores de seguridad multimodal directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el base en la revision exacta `853e3a797a661694b1b8ece0cb72dc2b23e3dac9`, el adaptador no funciona correctamente.
- Los datos de entrenamiento y los scripts no se publican, lo que impide auditar la composicion del dataset y los posibles sesgos introducidos.
- No hay resultados de benchmarks publicados en la informacion disponible; no se puede afirmar ninguna mejora medible en seguridad.
- Licencia ambigua: el autor senala que la pagina upstream etiqueta el repositorio como Apache-2.0 mientras que su descripcion menciona MIT y un componente Qwen2.5 Apache-2.0. Es imprescindible revisar los ficheros de licencia upstream antes de cualquier uso, especialmente comercial.
- Riesgo de alucinacion y sesgos: heredados del base InternVL3-8B; no documentados especificamente para este adaptador.
- Idiomas soportados no documentados; no se garantiza comportamiento multilingue.
- Orientado a investigacion: el autor lo etiqueta como `research` y no indica validacion para produccion.
- El componente "M3" (Qwen3-VL) mencionado en la model card es un revisor separado y no forma parte de este repositorio; no debe asumirse que este adaptador lo incluye.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/boli-003/mm-safetybench-internvl3-8b-m1-vlguard-v1
- Modelo base InternVL3-8B: https://huggingface.co/OpenGVLab/InternVL3-8B
- GitHub project package con prompts, parametros de decodificacion y metricas: no disponible en la informacion proporcionada (la model card lo menciona sin enlace explicito)
- Paper o blog del proyecto: no disponible
