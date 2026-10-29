# dendriteholdings/Ingot-XVI-27B-Q2

## Resumen

Ingot-XVI-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros (aproximadamente 26,9 B) publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que se mantiene más próxima a él. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-gguf, un modelo de pesos ternarios, y el minero reajustó los pesos no ternarios para acercar la distribución de salida a la del profesor.

El resultado es un GGUF que conserva los códigos ternarios de Bonsai 2 y sustituye el resto de pesos por los ajustados por el minero (hotkey `5Dk7Z...`, uid 239, submission `59e3d53b-...`). Se distribuye en dos ficheros: `Ingot-XVI-27B-PTQ1_0.gguf` a 1,75 bits por peso (5,95 GB) y `Ingot-XVI-27B-PQ2_0.gguf` a 2,125 bits por peso en contenedor de 2 bits (7,21 GB), que decodifica más rápido en GPU.

Su relevancia es acotada pero concreta: demuestra que un modelo de ~27 B puede ejecutarse en un único acelerador de gama alta con un tamaño en disco de 6-7 GB, y que el repack de pesos ternarios entre formatos (PQ2_0 a PTQ1_0) es sin pérdida. No obstante, no es un modelo de propósito general validado: no hay evaluación de capacidades publicada, la licencia no está declarada y requiere un fork específico de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Ternary Bonsai 2 (27B) con pesos ternarios; el autor menciona atención lineal y rotación de Hadamard, sin detallar capas ni dimensión (no disponible) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF PQ2_0 (2,125 bpw) y PTQ1_0 (1,75 bpw); pack MLX 2-bit; proyector visual Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp), MLX 2-bit; pesos ternarios con escala fp16 por bloque de 128 pesos |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf (relación: finetune) |
| Tamaño del repositorio | 13,2 GB |
| Fecha de publicación | 2026-10-29 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. El autor indica que el modelo hereda el layout, el tokenizer y la rotación de Hadamard de dendriteholdings/Ingot-genesis-27B-Q2, que los códigos ternarios provienen de Ternary Bonsai 2 y que el resto de pesos fueron reajustados por el minero. La mención a una «actualización de estado de atención lineal» en el parche Metal del fork de Dendrite sugiere la presencia de capas de atención lineal o híbridas, pero no se especifica el número de capas, la dimensión oculta ni la composición del bloque.

No hay datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. El único proceso descrito es el del subnet Ingot: dado un profesor fijo en BF16, el minero ajusta los pesos no ternarios para minimizar la divergencia entre su distribución de siguiente token y la del profesor. El autor reporta que el repack de PQ2_0 a PTQ1_0 es sin pérdida: cada bloque de 128 pesos conserva sus códigos y su escala fp16, y cada peso decodifica al mismo valor; aplicado al fichero PQ2_0 original de Bonsai 2 reproduce byte a byte el PTQ1_0 publicado por Prism.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento y conocimiento general: no hay evaluación publicada que lo cuantifique; la única métrica es la fidelidad al profesor.
- Entrada de imágenes opcional: añadiendo como `--mmproj` la torre visual de Ternary-Bonsai-2-27B (Q8_0 o BF16). El autor advierte que ese proyector se hizo para genesis, no para estos pesos, y que la calidad de imagen no está probada.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Modo thinking explícito: no disponible.
- Ejecución local eficiente: formato GGUF de ~6-7 GB con decodificación en GPU y en Apple Silicon vía Metal.

## Casos de uso

- Despliegue local en una sola GPU de consumo: con 5,95-7,21 GB de pesos, el modelo cabe en GPUs de 12-16 GB junto con caché KV para contextos moderados, lo que permite prototipar asistentes conversacionales sin infraestructura de servidor.
- Servicio de inferencia de alto rendimiento en hardware profesional: 137-145 tok/s de decodificación en una RTX PRO 6000 Blackwell con `-ngl 99 -fa 1` lo hacen apto para demos interactivas o entornos de evaluación con muchas peticiones cortas.
- Investigación sobre cuantización extrema: sirve como caso de estudio reproducible de cómo un ajuste fino sobre pesos ternarios acerca la distribución de salida a un profesor BF16, con métricas de KL y distancia de estados ocultos publicadas.
- Evaluación de fidelidad de destilación: el par (KL 0,09345; distancia 0,2990) frente al rey anterior permite comparar metodologías de cuantización dentro del subnet Ingot con una métrica objetiva.
- Prototipado en Apple Silicon: con el fork de Dendrite y el parche Metal se obtienen 52,8-56,4 tok/s de decodificación en un Mac Studio M3 Ultra, suficiente para asistentes de escritorio y pruebas de integración continua en macOS.
- Sustitución de modelos de 27 B en pipelines existentes de llama.cpp: al usar el layout de Ingot-genesis-27B-Q2, puede intercambiarse por ese fichero sin cambiar la configuración del servidor (`llama-server ... --jinja`).
- experimentación multimodal exploratoria: cargando el `mmproj` de Bonsai 2 se puede probar entrada de imágenes, asumiendo que la calidad no está validada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas miden fidelidad al profesor y velocidad.

Fidelidad al profesor (por token de respuesta, frente al profesor BF16 leyendo la misma respuesta; menor es mejor):

| Metrica | Este modelo | El rey al que superó |
|---|---|---|
| KL(profesor ‖ modelo) | 0,09345 | 0,09506 |
| Distancia de estados ocultos (media cada 8 capas) | 0,2990 | 0,3026 |

Velocidad en GPU (`llama-bench`, `tg128` y `pp512`, una GPU, `-ngl 99 -fa 1`):

| GPU | Fichero | Decodificacion (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| NVIDIA RTX PRO 6000 Blackwell, 96 GB | PQ2_0 | 137 | 3.865 |
| NVIDIA RTX PRO 6000 Blackwell, 96 GB | PTQ1_0 | 145 | 3.865 |

Velocidad en Mac Studio M3 Ultra (80 núcleos GPU, 512 GB, Metal):

| Build | Fichero | Decodificacion (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| Fork de PrismML, stock | PQ2_0 | 44,5 | 432 |
| Fork de PrismML, stock | PTQ1_0 | 43,1 | 368 |
| Fork de Dendrite, parche Metal | PQ2_0 | 56,4 | 432 |
| Fork de Dendrite, parche Metal | PTQ1_0 | 52,8 | 368 |

Dato externo citado por el autor: PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Requisitos de hardware

- VRAM para inferencia: 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0) solo de pesos, más caché KV y buffers; una estimación prudente es 8-10 GB para contextos moderados, aunque la longitud de contexto no está publicada y no permite un cálculo exacto.
- GPU profesionales: RTX PRO 6000 Blackwell (96 GB) medida a 137-145 tok/s de decodificación y 3.865 tok/s de prompt. A100/H100 no han sido medidas por el autor.
- GPU de consumo: cabe en tarjetas de 12 GB o más (RTX 4070 Ti, 4080, 4090, 5090). El dato de 142 tok/s en RTX 5090 corresponde a Bonsai 2 PQ2_0, no a este modelo.
- Apple Silicon: Mac Studio M3 Ultra con 512 GB; 44,5-56,4 tok/s de decodificación y 368-432 tok/s de prompt según build y fichero. En equipos con menos memoria unificada, la viabilidad depende del contexto, no publicado.
- Despliegue: exclusivamente mediante el fork de DendriteLabs de llama.cpp en el commit `c96baf4` (o superior con el parche). llama.cpp estándar no ejecuta el fichero. No se documenta soporte en vLLM, TGI, Ollama ni otros motores.
- Comando de referencia: `build/bin/llama-server -m Ingot-XVI-27B-PQ2_0.gguf -ngl 99 -fa on --jinja`.
- Latencia y throughput: los únicos datos disponibles son los de las tablas anteriores, a batch 1; no hay mediciones en concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XVI-27B-Q2 | 26,9 B | no disponible | KL 0,09345; 137-145 tok/s (RTX PRO 6000) | no disponible | GGUF en HF, requiere fork de Dendrite |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base) | 27 B (aprox., según nombre) | no disponible | 142 tok/s en RTX 5090 (reportado por PrismML); sin benchmarks de capacidades en esta informacion | no disponible | GGUF en HF |
| dendriteholdings/Ingot-genesis-27B-Q2 | 27 B (aprox., según nombre) | no disponible | no disponible | no disponible | GGUF en HF, mismo layout y tokenizer |
| dendriteholdings/Ingot-XVI-27B-MLX-2bit | 26,9 B (mismos pesos) | no disponible | no disponible | no disponible | Pack MLX para Apple Silicon |

No se dispone de comparaciones con modelos de propósito general de tamaño similar (por ejemplo, familias de 24-32 B en BF16 o Q4), ya que no hay benchmarks de capacidades publicados para este modelo.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir uso comercial; hay que contactar con el autor o con el titular de los derechos del modelo base antes de cualquier despliegue en producción.
- Requiere un fork concreto de llama.cpp (DendriteLabs, commit `c96baf4`); llama.cpp estándar no carga el fichero. Esto añade deuda de mantenimiento y riesgo de seguridad al depender de un fork de terceros.
- No hay evaluación de capacidades (MMLU, HumanEval, GSM8K ni ninguna otra). La métrica de KL frente al profesor mide fidelidad de destilación, no calidad absoluta; un modelo puede ser muy fiel a un profesor mediocre.
- Cuantización ternaria a 1,75-2,125 bits por peso: degradación esperable en tareas sensibles a precisión (matemáticas, código, instrucciones largas). No cuantificada en la información disponible.
- Riesgo de alucinación: no evaluado ni documentado; es previsible en un modelo de esta compresión y sin datos de alineación.
- Idiomas no declarados: no se puede asumir buen rendimiento en castellano ni en ningún otro idioma concreto.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Entrada de imágenes no validada: el proyector recomendado se creó para genesis, no para estos pesos, y el subnet solo evalúa el modelo de texto; la calidad visual es desconocida.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, y fecha de creación en 2026-10-29; el modelo depende de la reputación del subnet Ingot y del minero, no de una validación independiente.
- Los pesos son la subida del minero byte a byte; no hay auditoría publicada sobre posibles datos contaminantes en el ajuste.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo contenido no relacionado), por lo que no hay fuentes externas que corroboren los datos de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-XVI-27B-Q2
- Modelo base (Ternary Bonsai 2 27B GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Pack MLX 2-bit de los mismos pesos: https://huggingface.co/dendriteholdings/Ingot-XVI-27B-MLX-2bit
- Repositorio con el mismo layout y tokenizer (Ingot-genesis-27B-Q2): https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit exacto con el que se evaluó: https://github.com/DendriteLabs/llama.cpp/commit/c96baf4abe24d11a50f326e40b6223b687449d63
- Proyector visual Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector visual BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
