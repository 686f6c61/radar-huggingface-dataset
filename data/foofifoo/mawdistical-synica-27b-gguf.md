# foofifoo/Mawdistical-Synica-27B-GGUF

## Resumen

Mawdistical-Synica-27B-GGUF es una cuantizacion en formato GGUF del modelo Synica-27B, un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.8-27B. Lo publica el usuario foofifoo en Hugging Face y esta orientado a generacion de texto conversacional con enfasis en roleplay, contenido explicito y tematicas furry/anthro, segun las etiquetas declaradas por el autor. El repositorio contiene unicamente pesos cuantizados, no el modelo original en precision completa.

El modelo hereda la arquitectura del Qwen3.8-27B subyacente, con 27.320.697.856 parametros totales confirmados en los safetensors del modelo base. La model card menciona capas con atencion y componentes SSM (ssm_in, ssm_out, ssm_alpha, ssm_beta) y un bloque adicional de tipo nextn, lo que sugiere una arquitectura hibrida con atencion y modulos de estado, aunque el autor no detalla la composicion exacta.

La relevancia de esta ficha es acotada: se trata de una cuantizacion derivada de un fine-tune de nicho, con licencia "other" no especificada, sin benchmarks publicados y sin documentacion tecnica detallada. Resulta util para quienes ya trabajan con el modelo Synica-27B y necesitan versiones GGUF ligeras para inferencia local, pero no constituye una referencia generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con componentes SSM y bloque nextn (inferido de la model card); detalles no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XS, IQ3_K_M, IQ4_XS, IQ4_K_M, Q5_K_M, Q6_K, Q8_0 (segun model card) |
| Idiomas soportados | en |
| Licencia | other (sin terminos especificados) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base Qwen/Qwen3.8-27B ni del fine-tune Synica-27B. Los comandos de cuantizacion incluidos en el README revelan la presencia de tensores `ssm_in`, `ssm_out`, `ssm_alpha` y `ssm_beta`, ademas de tensores de atencion (`attn_v`, `attn_output`) y un bloque `blk.64.nextn.eh_proj`, lo que apunta a una arquitectura hibrida con modulos de espacio de estados y una cabeza de prediccion adicional tipo MTP (multi-token prediction). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similar.

El proceso de cuantizacion documentado emplea una matriz de importancia (imatrix) generada a partir de los propios GGUF del autor, con asignacion diferenciada de tipos de tensor: por ejemplo, en la variante iQ6_K-XL se fuerzan `q8_0` para embeddings, salida, atencion y SSM, mientras que `ssm_alpha` y `ssm_beta` se mantienen en `bf16`. Esta estrategia busca preservar la precision en las capas mas sensibles del modelo hibrido. Las variantes iQ6_K-XL e iQ4_K_M aparecen tachadas en la model card, lo que sugiere que fueron retiradas o reemplazadas.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Roleplay y personificacion, con etiquetas explicitas de contenido NSFW y explicito declaradas por el autor.
- Tematica furry y anthro segun las etiquetas del repositorio.
- La etiqueta "manipulation" aparece en los tags, sin que el autor explique su significado ni el alcance.
- No se documentan capacidades de codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso.
- No se documenta modo de razonamiento (thinking mode) ni soporte de agentes.
- Multilingue: no; solo ingles declarado.

## Casos de uso

- Roleplay conversacional en ingles: el modelo esta ajustado especificamente para mantener personajes y narrativa en dialogos largos, segun las etiquetas del autor; adecuado para aplicaciones de entretenimiento interactivo.
- Generacion de ficcion con tematica furry/anthro: el fine-tune incorpora vocabulario y convenciones de ese nicho, lo que reduce la necesidad de prompting extenso para obtener respuestas coherentes con el genero.
- Prototipado de chatbots de personaje en local: las cuantizaciones IQ3_XS e IQ4_XS permiten ejecutar el modelo en equipos con VRAM limitada, utiles para pruebas de concepto sin infraestructura cloud.
- Investigacion sobre fine-tuning de nicho: sirve como caso de estudio de como un ajuste especializado sobre un modelo de 27B se distribuye en GGUF con imatrix y tipos de tensor diferenciados.
- Evaluacion de arquitecturas hibridas SSM/atencion en inferencia cuantizada: los distintos niveles de cuantizacion permiten medir el impacto de la precision en los tensores SSM frente a los de atencion.
- Despliegue en entornos sin GPU dedicada: las variantes Q5_K_M, Q6_K y Q8_0 pueden ejecutarse en CPU con llama.cpp, aunque con latencia alta para 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (aproximada, segun BPW tipicos de cada cuantizacion sobre 27,3B parametros):
  - IQ3_XS: en torno a 11-12 GB.
  - IQ3_K_M: en torno a 12-13 GB.
  - IQ4_XS: en torno a 14-15 GB.
  - IQ4_K_M: en torno a 15-16 GB.
  - Q5_K_M: en torno a 18-19 GB.
  - Q6_K: en torno a 21-22 GB.
  - Q8_0: en torno a 28-29 GB.
- GPU recomendadas: RTX 4090 (24 GB) para IQ4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio; RTX 3090/4080 para IQ3 e IQ4_XS.
- Cabe en GPU de consumo: si, las variantes IQ3 e IQ4 en tarjetas de 16-24 GB; Q5_K_M en 24 GB con contexto moderado.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Mawdistical-Synica-27B-GGUF | 27,3B | no disponible | GGUF | other | Roleplay/NSFW, ingles |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | safetensors | no disponible | Generalista |
| Mawdistical-S1/Synica-27B | 27,3B | no disponible | safetensors | other | Roleplay/NSFW, ingles |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Contenido explicito y NSFW: el modelo esta marcado como `not-for-all-audiences`; no es apto para aplicaciones orientadas a publico general sin filtros adicionales.
- La etiqueta "manipulation" en los tags no esta explicada; conviene tratarla con cautela en despliegues productivos.
- Solo soporta ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Licencia "other" sin terminos publicados: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones publicadas.
- Sesgos desconocidos: el dataset de fine-tune no esta documentado.
- La model card indica `inference: false`, lo que sugiere que el autor no garantiza la inferencia directa con la libreria transformers sobre este repositorio GGUF.
- Las variantes iQ6_K-XL e iQ4_K_M aparecen tachadas y podrian no estar disponibles o haber sido reemplazadas.
- El autor redirige a un repositorio distinto (Mawdistical-S1/Synica-27B-GGUF) para las cuantizaciones fijas, lo que genera ambiguedad sobre cual es el repositorio canonico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/foofifoo/Mawdistical-Synica-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo Synica-27B (referenciado): https://huggingface.co/Mawdistical-S1/Synica-27B
- Repositorio GGUF alternativo (referenciado): https://huggingface.co/Mawdistical-S1/Synica-27B-GGUF
