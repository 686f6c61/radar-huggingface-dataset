# nynxz/Qwen3.5-9B

## Resumen

nynxz/Qwen3.5-9B no es un modelo completo, sino un adaptador LoRA de rango 4 publicado en formato ComfyUI para el codificador de texto Qwen3.5-9B. Su función es reproducir sobre los pesos estándar de Qwen/Qwen3.5-9B el comportamiento del checkpoint HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive, es decir, eliminar las respuestas de rechazo sin necesidad de mantener una segunda copia completa del modelo de 9 000 millones de parámetros.

El adaptador ocupa 13,4 MB en fp32 (aproximadamente 3,4 millones de parámetros) y se construyó como una diferencia de pesos entre el modelo sin censura y el modelo original, factorizada matriz a matriz mediante SVD. Solo modifica 68 matrices del modelo de lenguaje —proyecciones de salida de atención y módulos MLP de determinadas capas— y deja intactos los embeddings, la cabeza de salida y la torre de visión.

Su interés técnico está en que demuestra una forma limpia y verificable de destilar una edición de pesos completa en un adaptador mínimo: el autor reporta que la divergencia KL de siguiente token frente al modelo sin censura cae de 0,337 a 0,0007 al aplicar el LoRA con fuerza 1,0. Está diseñado para el flujo de trabajo de ComfyUI y solo declara soporte de inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 4 (factorización SVD por matriz) sobre el codificador de texto Qwen3.5-9B; el modelo base usa atención híbrida (módulos `linear_attn` y `self_attn`) y dispone de torre de visión |
| Parámetros totales | ~3,4 M en el adaptador (13,4 MB en fp32); modelo base: 9 000 M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Adaptador en fp32; el modelo base se distribuye en bf16 (la model card menciona además una conversión GGUF de origen) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con claves en el formato genérico de codificador de texto de ComfyUI (`text_encoders.transformer.model.layers.N.<módulo>.lora_{down,up}.weight`), fp32 y sin alpha |

## Arquitectura y entrenamiento

No hay entrenamiento: el adaptador es una diferencia de pesos pura (`uncensored − Qwen/Qwen3.5-9B`) factorizada por matriz con SVD. La edición original es exactamente de rango 4 —cada matriz modificada presenta cuatro valores singulares reales y después un salto al ruido de redondeo de bf16—, de modo que el rango 4 conserva al menos el 99,9 % de la edición, mientras que el rango 1 solo retendría en torno al 65 %. Se cubren 68 matrices, todas del modelo de lenguaje: salidas de atención (`linear_attn.out_proj` y `self_attn.o_proj`, capas 3-31), `mlp.down_proj` (capas 12-25) y `mlp.gate_proj` / `mlp.up_proj` (capas 19-31). Quedan fuera embeddings, `lm_head` y la torre de visión.

Se descartaron los cambios por debajo del umbral de redondeo ( aproximadamente 1e-3 en términos relativos) sobre los pesos de normalización 1-D, heredados del ciclo de conversión a GGUF, que un LoRA no puede transportar. La validación se hizo en transformers: la KL de siguiente token frente al modelo sin censura pasa de 0,337 (modelo estándar) a 0,0007 (estándar + LoRA), y las salidas greedy coinciden con el modelo sin censura en prompts que provocan rechazo, sin alterar las respuestas benignas. La presencia de módulos `linear_attn` y `self_attn` en las claves evidencia una arquitectura de atención híbrida (lineal + completa) en el modelo base; no se dispone de datos sobre el corpus de entrenamiento, el número de tokens ni las etapas de RLHF/DPO del modelo original.

## Capacidades

- Generación de texto con el codificador Qwen3.5-9B en ComfyUI, incluyendo el modo de razonamiento (thinking) que el modelo base activa por defecto.
- Eliminación del comportamiento de rechazo del checkpoint estándar, con fuerza de LoRA ajustable entre 0 y 1 para interpolar entre el comportamiento censurado y el plenamente sin censura.
- Reproducción fiel del checkpoint HauhauCS sin cargar un segundo modelo de 9B: misma salida greedy en prompts de rechazo según la validación del autor.
- Compatibilidad con el pipeline `image-text-to-text` del modelo base (la torre de visión no se modifica, por lo que la parte multimodal queda en su estado original).
- Aplicación sobre el codificador de texto estándar de Comfy-Org, lo que permite reutilizar el mismo encoder para distintas tareas de generación de texto y condicionamiento.
- No se declaran capacidades de tool calling, agentes, matemáticas o código específicas del adaptador; dependen íntegramente del modelo base y no han sido evaluadas en la información disponible.

## Casos de uso

- Escritura de ficción en ComfyUI: el LoRA se aplica al codificador de texto para generar narrativa de terror, noir o temas oscuros sin que el modelo interrumpa con negativas; la fuerza ajustable permite rebajar la intensidad por escena.
- Expansión de prompts para difusión: en flujos de ComfyUI que usan Qwen3.5-9B como text encoder para generar o reescribir prompts, el adaptador evita rechazos cuando la descripción incluye violencia estilizada o contenido adulto no explícito.
- Roleplay y narrativa interactiva: conversaciones multi-turno donde el modelo base tiende a derivar a respuestas de seguridad; el LoRA mantiene la coherencia del personaje con un coste de VRAM de apenas unos megabytes.
- Investigación en seguridad y red teaming: permite comparar el mismo modelo con y sin el adaptador (fuerza 0 frente a 1,0) y medir la tasa de rechazo y la calidad de respuesta con una única GPU, sin duplicar checkpoints.
- Generación de datos sintéticos para dominios sensibles: diálogos de ficción criminal, guiones de videojuegos para adultos o corpus de entrenamiento de clasificadores de contenido, donde el checkpoint estándar se negaría a producir las muestras.
- Optimización de almacenamiento en despliegues locales: sustituir un segundo checkpoint de ~18 GB en bf16 por un archivo de 13,4 MB simplifica la gestión de versiones y el intercambio de variantes en un mismo servidor ComfyUI.
- Pruebas de regresión de pipelines: al ser determinista con decodificación greedy (`sampling_mode: off`), sirve para verificar que el encoder se carga correctamente y que el LoRA se aplica con la fuerza esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo aporta métricas de fidelidad del adaptador frente al checkpoint sin censura:

| Métrica | Modelo estándar | Estándar + LoRA (fuerza 1,0) | Referencia sin censura |
|---|---|---|---|
| KL de siguiente token (menor es mejor) | 0,337 | 0,0007 | 0 |
| Coincidencia de salida greedy en prompts de rechazo | no | sí | sí |
| Alteración de respuestas benignas | — | no apreciable según el autor | — |
| Edición retenida por el rango 4 | — | ≥ 99,9 % | 100 % (rango completo) |

## Requisitos de hardware

- El adaptador en sí ocupa 13,4 MB en fp32; su impacto en VRAM es despreciable (del orden de decenas de megabytes al materializarse junto a los pesos del encoder).
- El coste real lo determina el modelo base de 9 000 M de parámetros. Estimación a partir del recuento de parámetros (el autor no publica requisitos): ~18 GB en bf16, ~9-10 GB en fp8/8 bits y ~5-6 GB en 4 bits para los pesos.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX A6000 o cualquier tarjeta con 24 GB o más (RTX 4090, L4 de 24 GB) para trabajar con margen de contexto.
- Cabe en GPU de consumo: sí, en cuantizaciones de 8 y 4 bits sobre RTX 3090/4090 (24 GB) y, en 4 bits, sobre RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Despliegue: el autor solo documenta ComfyUI (`CLIPLoader` → LoRA sobre CLIP con fuerza 1,0 → `Generate Text`), con el archivo `qwen3.5_9b_bf16.safetensors` de Comfy-Org en `models/text_encoders/`. Las claves son específicas de ComfyUI, por lo que no hay instrucciones publicadas para vLLM, TGI, llama.cpp u Ollama con este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| nynxz/Qwen3.5-9B (esta ficha) | LoRA rango 4 sobre encoder | ~3,4 M (adaptador) | no disponible | Apache 2.0 | safetensors ComfyUI | 0 descargas, 14 likes |
| Qwen/Qwen3.5-9B | Modelo completo original | 9 000 M | no disponible | Apache 2.0 | safetensors | Modelo base de referencia |
| HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | Checkpoint completo editado | 9 000 M | no disponible | Apache 2.0 | safetensors | Requiere ~18 GB en bf16 |
| nDimensional/Qwen3.5-9B-Uncensored-Safetensors | Conversión a safetensors del anterior | 9 000 M | no disponible | Apache 2.0 | safetensors | Fuente de la diferencia de pesos |

La ventaja diferencial del LoRA frente a los dos checkpoints sin censura es el tamaño (13,4 MB frente a ~18 GB) y la posibilidad de apilarlo sobre el encoder estándar ya cargado en ComfyUI; la desventaja es que depende de la infraestructura de ComfyUI y no ofrece un checkpoint autónomo.

## Limitaciones y advertencias

- Elimina deliberadamente el comportamiento de rechazo: puede producir contenido violento, sexual o potencialmente dañino. La responsabilidad legal y ética del uso recae en el usuario.
- Solo declara inglés; no hay evidencia de comportamiento multilingüe del adaptador (el modelo base podría soportar otros idiomas, pero no se documenta aquí).
- No hay benchmarks de capacidad: se desconoce si la edición de pesos degrada razonamiento, código o matemáticas respecto al Qwen3.5-9B original.
- La fidelidad no es exacta: la KL baja a 0,0007, no a cero, y se descartaron cambios en pesos de normalización 1-D (~1e-3 relativo) procedentes del ciclo GGUF.
- No hay evaluaciones publicadas sobre alucinación ni sobre sesgos del adaptador o del checkpoint de origen.
- Las claves están en formato de codificador de texto de ComfyUI, sin alpha y en fp32; no se documenta su uso con PEFT, transformers, vLLM o llama.cpp, lo que limita la portabilidad.
- La torre de visión queda intacta: el efecto «sin censura» solo aplica a la generación de texto, no a la comprensión de imágenes.
- El modelo base activa el modo thinking por defecto; para reproducir las comprobaciones del autor hay que usar decodificación greedy (`sampling_mode: off`).
- Licencia Apache 2.0 en adaptador y modelo base, lo que permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material extremo o sexual.
- Proyecto con 0 descargas registradas y sin validación independiente; conviene verificar el comportamiento en el pipeline propio antes de usarlo en producción.

## Enlaces

- [nynxz/Qwen3.5-9B en HuggingFace](https://huggingface.co/nynxz/Qwen3.5-9B)
- [Qwen/Qwen3.5-9B (modelo base)](https://huggingface.co/Qwen/Qwen3.5-9B)
- [HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive (checkpoint de origen)](https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive)
- [nDimensional/Qwen3.5-9B-Uncensored-Safetensors (conversión usada para la diferencia)](https://huggingface.co/nDimensional/Qwen3.5-9B-Uncensored-Safetensors)
- [Comfy-Org/Qwen3.5 — codificadores de texto](https://huggingface.co/Comfy-Org/Qwen3.5/tree/main/text_encoders)
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en los resultados de búsqueda web disponibles.
