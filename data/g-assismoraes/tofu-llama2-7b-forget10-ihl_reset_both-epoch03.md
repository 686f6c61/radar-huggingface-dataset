# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch03

## Resumen

`g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch03` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el usuario g-assismoraes en HuggingFace. Se trata de un modelo de lenguaje causal basado en la arquitectura transformer de Llama 2, afinado especificamente para el benchmark TOFU (Task of Fictitious Unlearning) en su configuracion `forget10`, es decir, el escenario en el que se busca "desaprender" el 10 % de un conjunto de datos sinteticos de biografias ficticias manteniendo el rendimiento sobre el resto.

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un checkpoint ya ajustado sobre el dataset TOFU completo, y aplica una estrategia de unlearning denominada IHL (probablemente *Iterative/Incremental Hidden Loss* o una variante de *unlearning* por capas ocultas, segun la nomenclatura del autor) combinada con un "reset both": la inicializacion de los embeddings de entrada y de la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base. El entrenamiento se realizo durante 3 epocas de un total de 20, con una funcion de perdida que combina un termino de token IHL sobre el conjunto *forget* y una entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*.

Es relevante en el contexto de la investigacion sobre machine unlearning: permite evaluar hasta que punto un modelo puede olvidar informacion especifica sin degradar sus capacidades generales. No es un modelo destinado a produccion, sino un artefacto experimental para reproducir y comparar metodos de desaprendizaje sobre TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens por defecto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de Llama 2) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura estandar de Llama 2 de 7B: 32 capas, atencion multi-cabeza con RoPE, normalizacion RMSNorm y activacion SwiGLU. Los pesos del transformer se heredan de `locuslab/tofu_ft_llama2-7b`, un modelo previamente ajustado sobre el dataset TOFU. La innovacion del checkpoint reside en la inicializacion: los embeddings de entrada y la cabeza de lenguaje (LM head) se reinician desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo base. Este "reset both" busca eliminar la informacion especifica del conjunto *forget* que pudiera estar codificada en las capas de entrada y salida.

El entrenamiento de unlearning se realizo durante 3 epocas de 20, con una funcion de perdida que combina un termino de token IHL sobre el conjunto *forget* y una entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO adicionales. El autor indica que se trata de un checkpoint completo e independiente y remite a un archivo `ihl_manifest.json` para mas detalles, aunque dicho archivo no se incluye en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles: modelo causal capaz de completar y generar texto coherente.
- Razonamiento basico y respuesta a preguntas: heredado de Llama 2 7B y del ajuste sobre TOFU.
- Capacidad de "desaprendizaje" controlado: el checkpoint esta disenado para haber olvidado el 10 % del dataset TOFU (*forget10*) manteniendo el rendimiento sobre el 90 % restante (*retain*).
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.
- No se documenta modo "thinking", vision ni audio.

## Casos de uso

- Investigacion en machine unlearning: evaluar la eficacia del metodo IHL + reset both comparando el rendimiento en los conjuntos *forget* y *retain* de TOFU frente a otros metodos de desaprendizaje.
- Reproducibilidad de experimentos: servir como checkpoint intermedio (epoca 3 de 20) para estudiar la evolucion del olvido a lo largo del entrenamiento.
- Analisis de degradacion de capacidades: medir cuanto rendimiento general se pierde al aplicar unlearning agresivo sobre un modelo Llama 2 7B.
- Estudio de la influencia de la inicializacion: comparar el efecto de reiniciar embeddings y LM head frente a no hacerlo en el proceso de olvido.
- Benchmarking de metodos de unlearning: usar el modelo como linea base en comparaciones con otras tecnicas (gradient ascent, preference optimization, etc.) sobre TOFU.
- Docencia y formacion: ejemplo practico de como se construye y evalua un checkpoint de unlearning en un entorno controlado con datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB (6,74 B parametros x 2 bytes), lo que requiere al menos una GPU de 16 GB.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 7 GB; en 4 bits: aproximadamente 4 GB.
- GPU recomendadas: A100 40 GB, H100, RTX 4090 (24 GB) para fp16; RTX 3090/4080 (16 GB) para fp16 ajustado; RTX 3060 12 GB o superior para cuantizacion 8/4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en fp16 y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, transformers con accelerate.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch03 | 6,74 B | no disponible (Llama 2: 4096) | llama2 | HuggingFace | Checkpoint de unlearning TOFU, epoca 3/20 |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4096 | llama2 | HuggingFace | Modelo base ajustado sobre TOFU completo, sin unlearning |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | llama2 | HuggingFace | Llama 2 7B chat, usado para reiniciar embeddings y LM head |
| meta-llama/Llama-2-7b-hf | 6,74 B | 4096 | llama2 | HuggingFace | Modelo original de Llama 2 7B |

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para aplicaciones reales de usuario final.
- Sesgos conocidos: hereda los sesgos de Llama 2 7B y del dataset TOFU, que son datos sinteticos de biografias ficticias y no representan poblaciones reales.
- Riesgo de alucinacion: presente, como en cualquier modelo de lenguaje de 7B; el proceso de unlearning puede alterar la coherencia en dominios no cubiertos por TOFU.
- Limitaciones de contexto e idioma: solo ingles; longitud de contexto no confirmada en la informacion disponible (por defecto 4096 tokens en Llama 2).
- Restricciones de licencia: la licencia Llama 2 Community License impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribucion y politicas de uso aceptable). Verificar los terminos antes de cualquier uso.
- Caveat para produccion: el checkpoint corresponde a la epoca 3 de 20; el autor no garantiza que el olvido sea completo ni que el rendimiento en *retain* sea optimo en este punto del entrenamiento.
- No se proporciona informacion sobre la evaluacion cuantitativa del olvido (metricas de TOFU) en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch03
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
