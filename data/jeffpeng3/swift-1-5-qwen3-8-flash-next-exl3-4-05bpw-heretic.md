# jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-EXL3-4.05bpw-heretic

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-EXL3-4.05bpw-heretic es una cuantización de 4,05 bits por peso (EXL3) del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario jeffpeng3. No se trata de un modelo entrenado desde cero, sino de una redistribución en formato ExLlamaV3 de los pesos del modelo base, con 34.283.300.720 parámetros totales según los safetensors del repositorio y una arquitectura de mezcla de expertos (MoE) según los tags del propio repositorio.

El interés del artefacto es doble. Por un lado, reduce el peso del modelo a aproximadamente 4,05 bits por parámetro para hacer viable su despliegue en GPU de gama alta para consumidores. Por otro, incorpora las etiquetas `abliterated`, `uncensored` y el sufijo `heretic`, que indican que el modelo base ha sido modificado para eliminar o atenuar los mecanismos de rechazo y alineación de seguridad, algo relevante para quien busque un modelo sin filtros pero también un riesgo importante en entornos de producción.

El modelo es multimodal de entrada imagen-texto (`image-text-to-text`), está etiquetado como conversacional y declara soporte de inglés y chino. El acceso está restringido en HuggingFace (gated), la licencia es `swift-open-license-1.0` (etiquetada como `license:other`) y el repositorio no cuenta con descargas ni valoraciones en el momento de redactar esta ficha, por lo que se trata de una publicación sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) según los tags del repositorio (`moe`); detalles de la arquitectura no disponibles |
| Parámetros totales | 34.283.300.720 (dato real de los safetensors) |
| Parámetros activos | No disponible (el repositorio indica MoE, pero no publica el número de expertos ni los parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | EXL3 a 4,05 bits por peso (único formato publicado) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | `swift-open-license-1.0` (etiquetada como `license:other`); condiciones comerciales no disponibles en la información proporcionada |
| Formato de pesos | safetensors en formato EXL3 para la librería exllamav3 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Los metadatos indican que se trata de un modelo de mezcla de expertos (tag `moe`) perteneciente a la familia Qwen (tags `qwen3.8-flash-next` y `qwen4_exp`), lo que encaja con un transformer disperso con enrutado por token. No se dispone de información sobre el número de expertos, la proporción de parámetros activos, el mecanismo de atención ni la ventana de contexto nativa.

Tampoco hay datos sobre el entrenamiento: ni volumen de tokens, ni composición del dataset, ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo con verificación. El tag `reasoning-efficient` sugiere que el modelo base está optimizado para razonamiento con un coste reducido de tokens, pero no se aporta ninguna cifra que lo respalde. Lo que sí es deducible de los metadatos es que el modelo base ha pasado por un proceso de *abliteration* (eliminación de direcciones de activación asociadas al rechazo) y que esta publicación es exclusivamente una recuantización: los pesos se han convertido a EXL3 a 4,05 bpw, presumiblemente con calibración, sin reentrenamiento posterior.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `conversational`.
- Entrada multimodal imagen-texto (`image-text-to-text`): acepta imágenes junto con prompts de texto.
- Razonamiento explícito: el tag `reasoning-efficient` apunta a modos de pensamiento optimizados, aunque no se detalla el mecanismo ni el formato de las trazas.
- Capacidades de código y matemáticas: no documentadas en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Multilingüismo limitado a inglés y chino; no se declara soporte de español.
- Comportamiento sin filtros (`abliterated`, `uncensored`): el modelo evita los rechazos por defecto, lo que amplía el espacio de respuestas pero elimina buena parte de las barreras de seguridad.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Procesamiento de documentos con imagen y texto: el pipeline `image-text-to-text` permite extraer y resumir información de capturas, formularios escaneados o diagramas acompañados de instrucciones en inglés o chino, sin necesidad de un OCR separado en el mismo paso.
- Asistente conversacional de dominio cerrado en inglés o chino: al estar desafinado en seguridad, es adecuado para entornos internos donde el contenido sensible (ficción, análisis de casos, roleplay) no debe tropezar con rechazos sistemáticos, siempre que exista una capa de moderación propia.
- Investigación sobre alineación y *red-teaming*: el par base/abliterado permite comparar respuestas con y sin mecanismos de rechazo sobre el mismo conjunto de prompts, un caso de uso habitual en estudios de robustez.
- Despliegue en una única GPU de 24 GB: con ~17,4 GB de pesos estimados a 4,05 bpw, es viable servirlo en una RTX 4090 con contexto moderado, lo que sirve para prototipado local de aplicaciones multimodales sin depender de APIs.
- Generación de descripciones de imágenes y etiquetado en pipelines de datos: útil para anotar corpus en inglés o chino con un modelo local, reduciendo la dependencia de servicios externos por motivos de privacidad.
- Inferencia de alto rendimiento en ExLlamaV3: al ser una arquitectura MoE cuantizada a 4 bits, encaja en servicios que ya usan TabbyAPI o text-generation-webui y necesitan una alternativa sin censura a modelos alineados, con la ventaja de un consumo de VRAM contenido.
- Experimentación con cuantización extrema: sirve como referencia para medir la degradación de calidad de EXL3 a 4,05 bpw frente a los pesos originales en tareas de razonamiento y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni el repositorio del modelo ni los metadatos de HuggingFace incluyen cifras de MMLU, HumanEval, GSM8K, MMMU ni de evaluaciones multimodales, y tampoco se aporta una comparación entre los pesos EXL3 y el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 17,4 GB, calculados a partir de 34.283.300.720 parámetros a 4,05 bits por parámetro (estimación propia; el repositorio no la publica). Añadiendo caché KV y el overhead de ExLlamaV3, el consumo realista se sitúa en torno a 19-22 GB para contextos cortos y crece con la longitud de la ventana, que no está documentada.
- GPU recomendadas: RTX 4090 (24 GB) para contexto corto y una sola instancia; L40S o RTX A6000 (48 GB) para contextos medios y mayor concurrencia; A100 o H100 (80 GB) si se necesita contexto largo o varios usuarios simultáneos.
- Cabe en GPU de consumo: sí, en RTX 4090 de 24 GB con holgura ajustada y dependiendo de la longitud de contexto; en tarjetas de 16 GB o menos requeriría offloading a RAM, cuyo impacto en latencia no está documentado.
- El tamaño del repositorio (107,8 GB) es muy superior al que correspondería a una única cuantización de 4,05 bpw de 34,3B de parámetros, lo que sugiere artefactos adicionales o ficheros auxiliares. Conviene revisar la lista de ficheros antes de descargar.
- Opciones de despliegue: ExLlamaV3 es la librería nativa (el repositorio declara `exllamav3`), lo que habilita su uso con TabbyAPI o text-generation-webui. No se publican ficheros GGUF, por lo que llama.cpp, Ollama y LM Studio no pueden cargarlo directamente sin una conversión de la que no hay información.
- Latencia y throughput: no disponibles. Al desconocerse el número de parámetros activos del MoE, no es posible estimar los tokens por segundo ni el tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (EXL3 4,05 bpw) | 34,28B | No disponible | No disponible | swift-open-license-1.0 | EXL3 safetensors | Gated en HuggingFace |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | No disponible en la información | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas MoE de ~30B de la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables sobre modelos alternativos de la misma categoría en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento, contexto o licencia con la base publicada. La única comparación fiable es la que enfrenta esta cuantización con su modelo base, y en ese caso los parámetros son idénticos por definición: la diferencia se limita al formato (EXL3 a 4,05 bpw frente a los pesos originales) y a la pérdida de calidad asociada a la cuantización, que no ha sido medida públicamente.

## Limitaciones y advertencias

- Modelo *abliterated* y *uncensored*: los mecanismos de rechazo han sido eliminados o atenuados, por lo que puede producir contenido que un modelo alineado bloquearía. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Riesgo de alucinación: no cuantificado. No hay evaluaciones publicadas de fidelidad ni de calibración, y la cuantización a 4,05 bpw puede incrementar la degradación en tareas de razonamiento frente a los pesos originales.
- Idiomas: solo se declaran inglés y chino. El rendimiento en castellano no está documentado y previsiblemente será inferior.
- Contexto: la longitud de ventana no está publicada, lo que impide planificar cargas con conversaciones largas o documentos extensos.
- Licencia: `swift-open-license-1.0` está clasificada como `license:other` en HuggingFace. No se dispone del texto ni de las condiciones de uso comercial, redistribución o atribución; es imprescindible revisarlas antes de cualquier despliegue productivo.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que añade fricción a la automatización de despliegues y a la reproducibilidad.
- Sin validación comunitaria: cero descargas y cero valoraciones. No hay evidencia independiente de que la cuantización funcione correctamente ni de su calidad.
- Procedencia dudosa: los metadatos indican fecha de creación 2026-10-25, posterior a la fecha habitual de consulta, y los tags hacen referencia a versiones de la familia Qwen (`qwen3.8-flash-next`, `qwen4_exp`) no verificables. Conviene confirmar el origen de los pesos antes de usarlos.
- ExLlamaV3 está orientado a GPU NVIDIA; no hay soporte documentado para ROCm, Metal u otros backends en este formato.
- Sesgos: no documentados. Al derivar de un modelo base sin ficha pública de sesgos y haber pasado por abliteration, los sesgos sociales y culturales del modelo original pueden persistir e incluso acentuarse al desaparecer los rechazos.

## Enlaces

- [Modelo en HuggingFace: jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-EXL3-4.05bpw-heretic](https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-EXL3-4.05bpw-heretic)
- [Modelo base: ukisai/Swift1.5-Qwen3.8-Flash-Next](https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next)
- Paper, blog técnico, repositorio de código y demo: no disponibles en la información proporcionada.
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo: los enlaces obtenidos corresponden a videojuegos sin relación con el artefacto, por lo que se omiten.
