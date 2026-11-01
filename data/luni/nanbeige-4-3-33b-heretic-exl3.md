# Luni/Nanbeige-4.3-33B-Heretic-EXL3

## Resumen

Nanbeige-4.3-33B-Heretic-EXL3 es una distribucion de pesos cuantizados en formato EXL3 (ExLlamaV3) del modelo Luni/Nanbeige-4.3-33B-Heretic, que a su vez es una variante "abliterated" y "de-slopped" del Nanbeige/Nanbeige4.3-33B original desarrollado por el equipo Nanbeige. El modelo base cuenta con 33.000 millones de parametros y esta disenado para generacion de texto conversacional con modo de razonamiento nativo mediante etiquetas `<think>`. La variante Heretic elimina los vectores de rechazo y alineamiento moralizante, y reduce los patrones repetitivos de prosa tipicos del RLHF.

El repositorio que nos ocupa no contiene pesos en precision completa, sino un conjunto de ramas cuantizadas con distintos niveles de compresion (desde 5.00 bpw hasta 2.25 bpw en la variante Self-Calibrated), pensadas para ejecutarse en GPUs de consumo con 12, 16, 24 o 32 GB de VRAM. Esto lo convierte en una opcion practica para desarrolladores que quieran desplegar un modelo de 33B en hardware asequible sin renunciar al razonamiento por cadena de pensamiento.

La relevancia actual del modelo radica en tres factores: la licencia Apache-2.0 permite uso comercial sin restricciones adicionales, el soporte bilingue ingles-chino cubre casos de uso en ambos mercados, y la cuantizacion EXL3 con calibracion Self-Calibrated (SC) preserva el razonamiento con una divergencia KL reportada de aproximadamente 0,035 en la variante de 3.50 bpw, lo que la hace atractiva frente a cuantizaciones genericas de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles de atencion no disponibles) |
| Parametros totales | 33.000 millones (33B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; las notas de las ramas mencionan objetivos de 32k-64k+ segun cuantizacion |
| Tipos de cuantizacion | EXL3: 5.00, 4.50, 4.00 bpw (LDLQ estandar) y SC 3.50, 3.00, 2.50, 2.25 bpw (Self-Calibrated) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | EXL3 (ExLlamaV3); existen repositorios hermanos en GGUF y GSQ-RCO GGUF |
| Tamano del repositorio | 117,5 GB (incluye todas las ramas) |
| Libreria de inferencia | exllamav3 |
| Modelo base | Luni/Nanbeige-4.3-33B-Heretic (a su vez derivado de Nanbeige/Nanbeige4.3-33B) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del Nanbeige4.3-33B original mas alla de que es un transformer decoder-only de 33B parametros. La variante Heretic se obtiene mediante tecnicas de "abliteration", que eliminan direcciones de activacion asociadas a rechazos y sermones moralizantes, y de "de-slopping", que reduce patrones de prosa repetitiva introducidos por el RLHF. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF, DPO u otra tecnica de alineamiento en el modelo base.

La innovacion tecnica mas destacable de este repositorio es el proceso de cuantizacion. Las ramas estandar usan LDLQ (LDLQ quantization) con distintos niveles de bits por peso, mientras que las ramas Self-Calibrated (SC) se calibran con trazas `<think>` auto-generadas del propio modelo y atribucion de ruido LDLQ por tensor. Segun la model card, esto permite que la variante SC de 3.50 bpw alcance una divergencia KL de aproximadamente 0,035, considerada casi sin perdida para la preservacion del razonamiento. Ademas, se ha parcheado `"add_bos_token": false` en `tokenizer_config.json` para eliminar la emision duplicada del token BOS `<|im_start|>` al aplicar plantillas de chat, un problema presente en el modelo upstream.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento por cadena de pensamiento nativo mediante etiquetas `<think>`, preservado incluso en las cuantizaciones mas agresivas (SC 3.50 bpw con KLD ~0,035).
- Modo "uncensored": se han eliminado los vectores de rechazo y el tono moralizante, por lo que el modelo responde sin las negativas tipicas de modelos alineados.
- Reduccion de "slop": menos prosa repetitiva y menos patrones de relleno tipicos del RLHF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modo `<think>` habilita razonamiento multi-paso, aunque no se documenta integracion especifica con frameworks de agentes.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas a ingles y chino segun los metadatos.

## Casos de uso

- Asistente conversacional sin filtros moralizantes: el modelo puede mantener dialogos multi-turno donde las respuestas no incluyan advertencias ni sermones, adecuado para entornos de investigacion creativa o escritura de ficcion con tematicas sensibles.
- Razonamiento con cadena de pensamiento en produccion: gracias a la preservacion del modo `<think>` incluso en cuantizaciones de 3.50 bpw, se puede desplegar en GPUs de 16 GB para tareas de razonamiento logico o matematico donde se requiera trazabilidad del proceso.
- Generacion de codigo asistida: aunque no se documenta entrenamiento especifico en codigo, el modelo puede integrarse en pipelines de generacion de snippets o revision de codigo en ingles y chino, con la ventaja de la licencia Apache-2.0 para uso comercial.
- Despliegue en hardware de consumo: la rama SC_2.25bpw (9,4 GB) cabe en una RTX 3060 de 12 GB, lo que permite ejecutar un modelo de 33B en estaciones de trabajo modestas para prototipado e investigacion.
- Atencion al cliente bilingue ingles-chino: el soporte nativo de ambos idiomas y el contexto de 32k-64k+ segun cuantizacion permiten gestionar conversaciones largas con historial extenso.
- Investigacion sobre alineamiento y abliteration: el modelo sirve como caso de estudio para comparar el comportamiento de un modelo alineado frente a uno abliterated en tareas de evaluacion de sesgos y rechazos.
- Generacion de contenido creativo en chino: la combinacion de licencia permisiva y soporte nativo de chino lo hace util para herramientas de escritura o guiones en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de calidad de cuantizacion (divergencia KL de aproximadamente 0,035 para SC 3.50 bpw) y tamanos de archivo por rama, pero no incluye resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada segun rama (datos de la model card):
  - 5.00 bpw: 21,0 GB, objetivo 32 GB de VRAM (contexto 64k+).
  - 4.50 bpw: 19,3 GB, objetivo 24 GB de VRAM (merge Pareto optimo por KLD).
  - 4.00 bpw: 17,6 GB, objetivo 24-32 GB (contexto 32k-64k+).
  - SC 3.50 bpw: 14,0 GB, objetivo 16 GB (KLD ~0,035).
  - SC 3.00 bpw: 12,0 GB, objetivo 16 GB (permite 32k de contexto en 16 GB).
  - SC 2.50 bpw: 10,0 GB, objetivo 12-16 GB.
  - SC 2.25 bpw: 9,4 GB, objetivo 12 GB (cabe en RTX 3060 12 GB).
- GPU recomendadas: RTX 3060 12 GB (SC 2.25 bpw), RTX 4060 Ti 16 GB / RTX 4080 16 GB (SC 3.00-3.50 bpw), RTX 4090 24 GB (4.00-4.50 bpw), A100 40 GB / H100 80 GB (5.00 bpw con contexto largo).
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB con la rama SC 2.25 bpw.
- Opciones de despliegue: ExLlamaV3 (libreria nativa del formato EXL3); para GGUF existen repositorios hermanos (Luni/Nanbeige-4.3-33B-Heretic-GGUF y GSQ-RCO-GGUF) que permiten usar llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanbeige-4.3-33B-Heretic-EXL3 (este) | 33B | no disponible (32k-64k+ segun rama) | Apache-2.0 | EXL3 | Abliterated, modo `<think>`, cuantizaciones SC hasta 2.25 bpw |
| Luni/Nanbeige-4.3-33B-Heretic | 33B | no disponible | Apache-2.0 | BF16 (safetensors) | Version sin cuantizar del mismo modelo |
| Nanbeige/Nanbeige4.3-33B | 33B | no disponible | Apache-2.0 | safetensors | Modelo original alineado, sin abliteration |
| Luni/Nanbeige-4.3-33B-EXL3 | 33B | no disponible | Apache-2.0 | EXL3 | Cuantizacion del modelo original sin abliteration |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo frente a otras familias de modelos de 33B.

## Limitaciones y advertencias

- Al ser un modelo abliterated, se han eliminado los mecanismos de rechazo, por lo que puede generar contenido que otros modelos bloquearian; requiere supervision y politicas de uso adecuadas en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 33B; no se han publicado evaluaciones de fidelidad factual.
- Soporte limitado a ingles y chino; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La longitud de contexto exacta no se documenta en la informacion disponible; las notas de las ramas sugieren objetivos de 32k-64k+ pero sin confirmacion oficial.
- Aunque la licencia es Apache-2.0, el uso comercial de un modelo abliterated puede conllevar riesgos reputacionales o de cumplimiento segun la jurisdiccion y el sector.
- El repositorio ocupa 117,5 GB en total por incluir todas las ramas; es necesario descargar unicamente la revision deseada con `--revision`.
- La model card advierte de un parche en `tokenizer_config.json` para evitar la emision duplicada del token BOS; si se usa una version sin parchear, pueden aparecer problemas en las plantillas de chat.
- No se documentan capacidades de tool calling ni integracion con frameworks de agentes, por lo que no debe asumirse su soporte en produccion.
- El modelo tiene 51 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3
- Modelo base Heretic (BF16): https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic
- Modelo original Nanbeige4.3-33B: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Cuantizacion EXL3 del modelo original: https://huggingface.co/Luni/Nanbeige-4.3-33B-EXL3
- Repositorio dedicado SC: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3-SC
- Drafter especulativo: https://huggingface.co/Luni/Nanbeige-4.3-33B-DFlash2
- Suite GGUF: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-GGUF
- Suite GSQ-RCO GGUF: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-GSQ-RCO-GGUF
- Los resultados de busqueda web no aportan enlaces relevantes al modelo (corresponden a la marca de juguetes Lunii, sin relacion).
