# mradermacher/gemma-4-31BHERETIC-Thinking-GGUF

## Resumen

mradermacher/gemma-4-31BHERETIC-Thinking-GGUF es un repositorio de cuantizaciones GGUF del modelo mirxa2/gemma-4-31BHERETIC-Thinking, un ajuste fino de tipo "abliterated" (tambien etiquetado como "uncensored" y "heretic") orientado a escritura creativa, narrativa de ficcion y roleplaying. El modelo cuenta con 30.697.345.596 parametros (aproximadamente 30,7 mil millones) segun los pesos en formato safetensors del modelo base, y se publica bajo licencia Apache 2.0.

El repositorio lo mantiene mradermacher, un cuantizador de referencia en el ecosistema open source que genera versiones estaticas e imatrix de modelos populares para su uso con llama.cpp y derivados. La relevancia de esta publicacion esta en que pone a disposicion un modelo de ~30B con pesos GGUF listos para inferencia local en una amplia gama de niveles de compresion (desde Q2_K hasta Q8_0), ademas de ficheros mmproj que actuan como suplemento multimodal.

La informacion disponible no especifica la arquitectura exacta, la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks. El modelo esta declarado unicamente para ingles (en) y su caso de uso declarado por el autor se centra en generacion creativa y conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio declara library_name: transformers; no se detalla si es transformer denso, MoE o hibrida) |
| Parametros totales | 30.697.345.596 (aprox. 30,7B, dato de safetensors del modelo base) |
| Parametros activos | no aplica (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (referencia del base), Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos mmproj en Q8_0 y f16; disponibles tambien cuantizaciones ponderadas/imatrix en el repositorio i1 del mismo autor |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base se sirven en safetensors, bfloat16) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. El repositorio declara `library_name: transformers` y el modelo base se distribuye en bfloat16, lo que es coherente con un modelo de lenguaje autorregresivo de tipo transformer decoder, pero la model card no confirma la arquitectura, el numero de capas, la dimension oculta ni el mecanismo de atencion empleado.

Tampoco se documentan los datos de entrenamiento: no hay numero de tokens, composicion del dataset, ni confirmacion de si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. Las etiquetas del repositorio indican que se trata de un finetune de la familia "heretic"/"abliterated" (orientado a eliminar comportamientos de rechazo del modelo original) y que se uso Unsloth en el proceso de ajuste, segun la etiqueta `unsloth` de la model card. La presencia de ficheros `mmproj` en el repositorio sugiere soporte multimodal (proyeccion de vision) heredado del modelo base, aunque no se detalla su alcance. Cualquier afirmacion adicional sobre el entrenamiento seria especulativa.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en escritura creativa.
- Escritura de ficcion: generacion de tramas, subtramas, desarrollo de escenas, continuacion de escenas y narracion de historias.
- Cobertura declarada de multiples generos: ciencia ficcion, romance y, en general, "todos los generos".
- Roleplaying y dialogos de personaje.
- Capacidades de programacion (etiqueta `coder` en el repositorio), aunque sin detalles de rendimiento.
- Modo "thinking" implicito en el nombre del modelo base, sin documentacion adicional sobre su funcionamiento o formato de salida.
- Suplemento multimodal: los ficheros `mmproj` permiten, en teoria, procesar entradas visuales junto al texto, aunque el alcance exacto no esta documentado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Comportamiento "uncensored"/"abliterated": menor tendencia al rechazo de peticiones, segun las etiquetas del autor.

## Casos de uso

- Escritura de ficcion asistida: el modelo puede generar tramas, subtramas y continuaciones de escena a partir de un prompt breve, lo que encaja con el enfoque declarado del finetune en narrativa de genero.
- Generacion de novelas por entregas o serializacion: util para mantener el tono y el estilo a lo largo de fragmentos largos, usando el modelo como motor de redaccion asistida en un editor o pipeline propio.
- Roleplaying y chatbots de personaje: el caracter "abliterated" reduce los rechazos, lo que resulta adecuado para personajes con dialogos duros o temas adultos dentro de un entorno controlado.
- Prototipado de videojuegos narrativos: integracion del modelo en un motor de dialogo para generar respuestas de PNJ en tiempo real, siempre que se valide el contenido generado.
- Asistencia a guionistas y equipos de worldbuilding: generacion rapida de variantes de escena, biografias de personajes y descripciones de ambientacion para iterar sobre borradores.
- Generacion de codigo en flujos de trabajo locales: la etiqueta `coder` sugiere uso en tareas de autocompletado o generacion de fragmentos, desplegando una cuantizacion Q4_K_M o Q5_K_M con llama.cpp en una estacion de trabajo.
- Experimentacion en investigacion sobre alineacion y comportamiento: util como punto de comparacion entre un modelo con rechazos y su variante "abliterated", en estudios sobre seguridad y utilidad.
- Despliegue en local con requisitos de privacidad: al ejecutarse en GGUF sobre hardware propio, permite procesar textos sensibles sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo original ni para las versiones cuantizadas.

## Requisitos de hardware

Los valores de VRAM son estimaciones calculadas a partir del tamano de fichero de cada cuantizacion, anadiendo un margen aproximado de 1 a 2 GB para el contexto y el runtime. No proceden de mediciones publicadas por el autor.

- VRAM estimada por cuantizacion (pesos + margen de contexto):
  - Q2_K (12,0 GB de fichero): ~13-14 GB de VRAM.
  - Q3_K_S (13,9 GB): ~15-16 GB.
  - Q3_K_M (15,4 GB): ~16-17 GB.
  - Q3_K_L (16,7 GB): ~18 GB.
  - IQ4_XS (17,0 GB): ~18 GB.
  - Q4_K_S (17,9 GB): ~19-20 GB. Marcado por el autor como "fast, recommended".
  - Q4_K_M (18,8 GB): ~20-21 GB. Marcado por el autor como "fast, recommended".
  - Q5_K_S (21,4 GB): ~22-23 GB.
  - Q5_K_M (21,9 GB): ~23 GB.
  - Q6_K (25,3 GB): ~26-27 GB. El autor lo describe como "very good quality".
  - Q8_0 (32,7 GB): ~34 GB. El autor lo describe como "fast, best quality".
  - f16 (no incluido en este repositorio; el base ronda 61 GB): requiere mas de 60 GB de VRAM o uso de offload a CPU.
- Suplementos multimodales: mmproj-Q8_0 ocupa 0,9 GB y mmproj-f16 1,3 GB adicionales sobre la cuantizacion elegida.
- GPU recomendadas:
  - Consumer: RTX 3090 o RTX 4090 (24 GB) permiten Q4_K_M y Q5_K_M completos en VRAM; Q2_K a Q4_K_S son viables en tarjetas de 16 GB con contexto reducido.
  - Profesional: A100 40 GB, A100 80 GB, H100 80 GB permiten Q6_K, Q8_0 o f16 sin descarga a CPU.
  - Multi-GPU: dos GPU de 24 GB permiten repartir Q6_K o Q8_0.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con cuantizaciones Q4_K_M o Q5_K_M; en tarjetas de 12-16 GB solo con Q2_K o Q3_K y contexto limitado, o con offload parcial a memoria del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. Para servir el modelo completo en bf16 haria falta vLLM o TGI sobre hardware de 80 GB o multi-GPU. El repositorio tambien ofrece versiones imatrix ponderadas, recomendadas cuando se prioriza calidad por encima de la velocidad de generacion.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para estas cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-31BHERETIC-Thinking-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF (Q2_K a Q8_0, mmproj) | Cuantizaciones estaticas; objetivo local-first |
| mradermacher/gemma-4-31BHERETIC-Thinking-i1-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF con imatrix | Mismo autor; cuantizaciones ponderadas, mayor calidad por tamano |
| mirxa2/gemma-4-31BHERETIC-Thinking | ~30,7B | no disponible | apache-2.0 | safetensors (bfloat16) | Modelo base sin cuantizar; requiere hardware de gama alta |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de otros modelos comparables en la informacion recibida |

## Limitaciones y advertencias

- No hay datos publicados de benchmarks, evaluaciones de sesgo ni pruebas de robustez para este modelo ni para sus cuantizaciones.
- Al tratarse de un finetune "abliterated"/"uncensored", cabe esperar una reduccion de los rechazos ante peticiones sensibles. Esto incrementa el riesgo de generar contenido inapropiado, ofensivo o potencialmente danino, y traslada al operador la responsabilidad del filtrado en produccion.
- Riesgo de alucinacion no cuantificado: sin evaluaciones publicadas no es posible estimar la tasa de afirmaciones incorrectas.
- Idiomas: solo se declara soporte de ingles. El uso en castellano no esta garantizado y previsiblemente degradara la calidad.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad respecto a los pesos originales. El propio autor marca Q3_K_M como "lower quality". Para tareas creativas o de codigo conviene Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales, que no se detallan en este repositorio.
- La presencia de ficheros mmproj sugiere capacidades multimodales, pero no hay documentacion que confirme que funcionan correctamente tras el finetune "abliterated".
- El nombre "gemma-4-31B" puede inducir a confusion sobre la familia real del modelo base; no hay informacion en el repositorio que confirme la arquitectura subyacente.
- El repositorio tiene un volumen de descargas bajo (435) y pocos "likes" (2), lo que reduce la validacion comunitaria disponible.
- Repositorio de 213,9 GB: el almacenamiento necesario para clonar todas las cuantizaciones es considerable; conviene descargar unicamente el fichero necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-31BHERETIC-Thinking-GGUF
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/gemma-4-31BHERETIC-Thinking-i1-GGUF
- Modelo base: https://huggingface.co/mirxa2/gemma-4-31BHERETIC-Thinking
- Pagina resumen del modelo con lista de descargas: https://hf.tst.eu/model#gemma-4-31BHERETIC-Thinking-GGUF
- Guia de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos al autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
