# nynxz/Qwen3.5-9b

## Resumen

`nynxz/Qwen3.5-9b` no es un modelo completo, sino un adaptador LoRA en formato ComfyUI para el codificador de texto Qwen3.5-9B. Su autor, el usuario de HuggingFace `nynxz`, lo publica como un fichero safetensors de 13,4 MB que reproduce el comportamiento del checkpoint `HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive` sobre los pesos originales de `Qwen/Qwen3.5-9B`, sin necesidad de descargar un segundo checkpoint completo. El resultado declarado es la eliminación del comportamiento de rechazo (refusal) del modelo base.

El interes tecnico del artefacto es el metodo: en lugar de publicar pesos completos "abliterated", el autor calcula la diferencia de pesos entre el modelo censurado y el modificado, la factoriza por matriz con SVD y demuestra que dicha edicion es exactamente de rango 4, de modo que una LoRA de rango 4 conserva mas del 99,9 por ciento de la modificación. Se intervienen 68 matrices del modelo de lenguaje (proyecciones de salida de atencion y proyecciones de las MLP), dejando intactos los embeddings, la `lm_head` y la torre de vision.

Es relevante ahora porque ofrece una via ligera y verificable de reproducir una modificación de comportamiento en un pipeline de generacion de imagenes con ComfyUI, con una metrica objetiva de fidelidad (divergencia KL de 0,337 a 0,0007 frente al modelo sin censura) en lugar de una simple afirmacion cualitativa. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base. La model card identifica en el transformer modulos de atencion lineal (`linear_attn.out_proj`) y de atencion completa (`self_attn.o_proj`) en las capas 3-31, ademas de una torre de vision, lo que apunta a un transformer hibrido multimodal |
| Parametros totales | 9B en el modelo base (segun nomenclatura). El artefacto de este repositorio es una LoRA de 13,4 MB que modifica 68 matrices |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | LoRA en fp32 sin alpha; el codificador base se emplea en bf16 (`qwen3.5_9b_bf16.safetensors`). La model card menciona un round-trip GGUF previo, pero no se publican cuantizaciones propias |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (claves de text encoder genericas de ComfyUI: `text_encoders.transformer.model.layers.N.<modulo>.lora_{down,up}.weight`) |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 0,0 GB (segun metadatos de HuggingFace) |
| Relacion con el modelo base | adapter (LoRA), base: `Qwen/Qwen3.5-9B` y `HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive` |

## Arquitectura y entrenamiento

El objeto publicado es una LoRA, no un entrenamiento desde cero. El autor obtiene la diferencia `uncensored − Qwen/Qwen3.5-9B`, la factoriza por matriz mediante SVD y comprueba que cada matriz modificada presenta exactamente cuatro valores singulares reales antes de un precipicio hacia ruido de redondeo en bf16. Por ello fija el rango en 4: segun sus mediciones, rango 4 retiene al menos el 99,9 por ciento de la edicion, mientras que rango 1 retendria alrededor del 65 por ciento.

Las 68 matrices intervenidas pertenecen unicamente al modelo de lenguaje: salidas de atencion (`linear_attn.out_proj` / `self_attn.o_proj`) en las capas 3 a 31, `mlp.down_proj` en las capas 12 a 25, y `mlp.gate_proj` / `mlp.up_proj` en las capas 19 a 31. Quedan sin tocar los embeddings, la `lm_head` y la torre de vision. La model card indica ademas que se descartaron cambios inferiores al umbral de redondeo (aproximadamente 1e-3 relativo) sobre pesos de norma unidimensionales, procedentes del round-trip GGUF, porque una LoRA no puede representarlos.

La validacion realizada por el autor es cuantitativa: en `transformers`, la divergencia KL al siguiente token frente al modelo sin censura pasa de 0,337 con los pesos originales a 0,0007 con los pesos originales mas la LoRA, y las salidas greedy coinciden en prompts de rechazo mientras las respuestas benignas no se ven afectadas. No se documenta ningun proceso de RLHF, DPO ni fine-tuning adicional por parte de este autor.

## Capacidades

- Al ser un adaptador, no aporta capacidades nuevas: hereda las del codificador Qwen3.5-9B sobre el que se aplica (generacion de texto y, por la presencia de torre de vision en el transformer, procesamiento de entrada imagen-texto).
- Modificacion de comportamiento: a fuerza 1.0 elimina el comportamiento de rechazo; a valores menores mezcla progresivamente hacia el comportamiento del modelo original.
- Generacion de texto integrada en ComfyUI mediante el grafo `CLIPLoader -> LoRA on CLIP (strength 1.0) -> Generate Text`.
- Compatibilidad con el modo de pensamiento del modelo base: la model card indica que Qwen3.5 piensa por defecto y que las comprobaciones se hicieron con thinking desactivado y decodificacion greedy (`sampling_mode: off`).
- Tool calling, function calling, razonamiento multi-paso y capacidades de agente: no documentadas en la informacion disponible.
- Capacidades multilingues: solo se declara ingles (`en`).
- Capacidades especiales: no se documentan modos de vision, audio ni decodificacion especulativa especificos de este adaptador.

## Casos de uso

- Generacion de texto guiada por imagen en ComfyUI: cargando el LoRA sobre el codificador `qwen3.5_9b_bf16.safetensors`, el nodo `Generate Text` produce descripciones o prompts de texto a partir de una imagen de entrada, reutilizando el pipeline image-text-to-text del modelo base.
- Reproduccion ligera de un checkpoint modificado: en lugar de mantener dos copias de 9B en disco (original y sin censura), se conserva el codificador original mas un fichero de 13,4 MB, lo que simplifica el versionado y la distribucion de pipelines.
- Investigacion sobre abliteration y edicion de pesos: el repositorio documenta el rango efectivo de la modificacion (rango 4 en 68 matrices concretas), lo que sirve como caso de estudio reproducible para tecnicas de direccion de rechazo en transformers hibridos.
- Evaluacion de fidelidad de adaptadores: la metrica KL reportada (0,337 a 0,0007) permite comparar metodos de compresion de diferencias de pesos (SVD de rango bajo frente a publicacion de checkpoints completos) en terminos de fidelidad por byte almacenado.
- Pruebas de robustez y red-teaming en entornos controlados: al eliminar los rechazos, el modelo resulta util como sujeto de evaluacion de filtros de salida, clasificadores de seguridad y guardrails externos, dado que el modelo por si mismo deja de bloquear peticiones.
- Generacion de narrativa y contenido creativo sin friccion: para escritura de ficcion con tematicas sensibles donde el comportamiento de rechazo del modelo base interrumpe la generacion, con decodificacion greedy para maximizar la reproducibilidad.
- Control de mezcla de comportamiento: ajustando la fuerza del LoRA por debajo de 1.0 se obtiene un punto intermedio entre el modelo original y el modificado, util para calibrar cuanto rechazo se desea conservar en una aplicacion concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion reportada es una metrica de fidelidad frente al checkpoint sin censura:

| Metrica | Modelo original | Original + LoRA | Metodo |
|---|---|---|---|
| Divergencia KL al siguiente token frente al modelo sin censura | 0,337 | 0,0007 | Evaluacion en `transformers` |
| Coincidencia de salidas greedy en prompts de rechazo | No coincide | Coincide | Decodificacion greedy |
| Cambios en respuestas benignas | No aplica | No afectadas (segun el autor) | Decodificacion greedy |
| Retencion de la edicion de pesos con rango 4 | No aplica | >= 99,9 por ciento | Factorizacion SVD por matriz |

No hay datos publicos de latencia ni de throughput. No se dispone de comparaciones con otros adaptadores de la misma categoria.

## Requisitos de hardware

- VRAM del adaptador: despreciable. La LoRA ocupa 13,4 MB en disco y anade un coste marginal de memoria y computo sobre el codificador.
- VRAM para el modelo base: no disponible de forma oficial. Como estimacion aritmetica a partir de los 9B de parametros, el codificador en bf16 requiere del orden de 18 GB solo para pesos, mas activaciones, cache de atencion y la torre de vision; el espacio necesario crece con la longitud de contexto.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU capaz de ejecutar el codificador Qwen3.5-9B en bf16 (clase A100 40 GB, H100, L40S, RTX 6000 Ada) es suficiente; en consumer, una RTX 4090 de 24 GB queda en el limite por pesos y puede requerir cuantizacion del codificador o descarga parcial.
- Opciones de despliegue: ComfyUI es el flujo documentado (`models/loras/` para el adaptador y `models/text_encoders/` para `qwen3.5_9b_bf16.safetensors` de Comfy-Org). El autor valida tambien la fidelidad en `transformers`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama con este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Comportamiento |
|---|---|---|---|---|---|---|
| `nynxz/Qwen3.5-9b` | LoRA (adaptador) | 13,4 MB de adaptador sobre 9B | No disponible | apache-2.0 | HuggingFace, 0 descargas | Sin rechazos a fuerza 1.0, mezclable |
| `HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive` | Checkpoint completo | 9B | No disponible | apache-2.0 | HuggingFace | Sin rechazos; requiere descargar pesos completos |
| `Qwen/Qwen3.5-9B` | Checkpoint completo | 9B | No disponible | apache-2.0 | HuggingFace | Comportamiento original con rechazos |
| `nDimensional/Qwen3.5-9B-Uncensored-Safetensors` | Checkpoint convertido | 9B | No disponible | apache-2.0 | HuggingFace | Conversion a safetensors de la que se tomo la diferencia |

La ventaja del adaptador es el tamano (13,4 MB frente a decenas de GB) y la reversibilidad; la desventaja es que depende de la version exacta del codificador base y no puede transportar cambios sobre pesos de norma unidimensionales.

## Limitaciones y advertencias

- Eliminacion deliberada de rechazos: el proposito del artefacto es que el modelo no bloquee peticiones, lo que incrementa el riesgo de generar contenido danino, ilegal o inseguro. Requiere guardrails externos si se usa en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad para este adaptador ni para el modelo base en la informacion disponible.
- Idiomas: solo se declara ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Dependencia del codificador base: la LoRA esta construida contra `Qwen/Qwen3.5-9B` y el codificador `qwen3.5_9b_bf16.safetensors` de Comfy-Org. Cualquier variacion de esos pesos invalida la fidelidad de la modificacion.
- Cambios descartados: los ajustes de norma unidimensionales procedentes del round-trip GGUF no se pueden representar en una LoRA, por lo que la reproduccion no es bit a bit respecto al checkpoint sin censura.
- Modo de decodificacion: el autor recomienda `sampling_mode: off` y thinking desactivado; con muestreo aleatorio o con thinking activo el comportamiento puede diferir del validado.
- Validacion limitada: 0 descargas y 1 like, sin replicacion independiente de las metricas de KL ni de la ausencia de efectos en respuestas benignas.
- Licencia: apache-2.0 en el repositorio, lo que en principio permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin rechazos recae en el desplegador.
- Metadatos incompletos: no se declaran contexto, cuantizaciones oficiales, ni arquitectura exacta del modelo base, y el repositorio figura con 0,0 GB de tamano segun HuggingFace.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/nynxz/Qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint sin censura de referencia: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Conversion a safetensors usada para la diferencia: https://huggingface.co/nDimensional/Qwen3.5-9B-Uncensored-Safetensors
- Codificadores de texto para ComfyUI: https://huggingface.co/Comfy-Org/Qwen3.5/tree/main/text_encoders
- Paper, blog o repositorio adicional: no disponible
