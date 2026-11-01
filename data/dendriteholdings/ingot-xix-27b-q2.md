# dendriteholdings/Ingot-XIX-27B-Q2

## Resumen

Ingot-XIX-27B-Q2 es un modelo de generación de texto de 26.896 millones de parámetros publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que se mantiene más próxima a él. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-gguf, conserva sus códigos ternarios y reajusta el resto de pesos para acercarse al profesor Qwen3.8-27B.

La relevancia del modelo es doble: por un lado, documenta un caso real de cuantización extrema competitiva (1,75 y 2,125 bits por peso) con métricas de fidelidad frente al profesor (KL de 0,09246 y distancia de estados ocultos de 0,3173); por otro, demuestra que un modelo de 27B puede ejecutarse en GPU de consumo y en Apple Silicon con velocidades de decodificación utilizables (137-145 tok/s en RTX PRO 6000 Blackwell, 44-56 tok/s en Mac Studio M3 Ultra).

No obstante, es un artefacto muy específico: requiere un fork concreto de llama.cpp (DendriteLabs, commit c96baf4), no funciona con llama.cpp estándar, no declara licencia ni idiomas soportados y no publica benchmarks de capacidades (MMLU, HumanEval, GSM8K). Debe tratarse como material de investigación sobre cuantización ternaria, no como un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y rotación Hadamard (familia Ternary Bonsai 2); detalles completos no disponibles |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria: PTQ1_0 a 1,75 bits por peso (5,95 GB) y PQ2_0 a 2,125 bits por peso en contenedor de 2 bits (7,21 GB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); dos ficheros: `Ingot-XIX-27B-PTQ1_0.gguf` e `Ingot-XIX-27B-PQ2_0.gguf` |

## Arquitectura y entrenamiento

El modelo es un fine-tune del profesor ternario Ternary-Bonsai-2-27B de Prism ML. La arquitectura subyacente es un transformer con atención lineal y una rotación Hadamard aplicada en el pipeline de cuantización; el fork de Dendrite fusiona esa rotación con la actualización de estado de la atención lineal en Metal. Los pesos ternarios (códigos de -1, 0, +1 con escala fp16 por bloque de 128 pesos) se conservan del modelo base, mientras que el resto de pesos fueron reajustados por el minero para reducir la divergencia respecto a Qwen3.8-27B.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La única métrica de fidelidad publicada es la divergencia KL entre las distribuciones del siguiente token del modelo y las del profesor BF16 (0,09246 frente a 0,09418 del rey anterior) y la distancia relativa de estados ocultos promediada cada 8 capas (0,3173 frente a 0,3201). El fichero PTQ1_0 es un reempaquetado sin pérdida del PQ2_0 del minero: cada bloque de 128 pesos mantiene sus códigos y su escala fp16, de modo que cada peso decodifica al mismo valor.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y código: capacidades heredadas del profesor Qwen3.8-27B, sin benchmarks publicados que las cuantifiquen.
- Soporte de imágenes mediante proyector multimodal opcional: se puede añadir el `mmproj` de Ternary-Bonsai-2-27B (Q8_0 o BF16) como torre de visión, aunque el autor advierte que fue creado para genesis y la calidad de imagen no está probada.
- Decodificación especulativa: compatible con el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2`), que acelera la generación aproximadamente 1,8x en modo greedy y 1,3-1,4x con sampling.
- Tool calling / function calling: no documentado explícitamente; el servidor se lanza con `--jinja`, lo que habilita plantillas de chat, pero no hay confirmación de soporte de herramientas.
- Capacidades de agente multi-paso: no documentadas.
- Capacidades multilingües: no disponibles (el modelo no declara idiomas).

## Casos de uso

- Investigación en cuantización extrema: reproducir el pipeline de Ingot para estudiar cómo se degrada la fidelidad respecto al profesor a 1,75-2,125 bits por peso, usando las métricas KL y de estados ocultos como referencia.
- Despliegue en GPU de consumo: ejecutar un modelo de 27B en tarjetas con 8-12 GB de VRAM gracias a los 5,95-7,21 GB de los ficheros GGUF, con el fork de Dendrite y `-ngl 99 -fa on`.
- Inferencia en Apple Silicon: servir el modelo en Mac Studio o MacBook con Metal; el fork de Dendrite mejora la decodificación de 44,5 a 56,4 tok/s en M3 Ultra con el fichero PQ2_0.
- Chat conversacional de baja latencia en single-stream: con el drafter DFlash 2 se obtiene aproximadamente 1,8x de velocidad en greedy, adecuado para asistentes interactivos donde la latencia importa más que el throughput agregado.
- Prototipado de pipelines multimodales: añadir el `mmproj` de Ternary-Bonsai-2-27B para experimentar con entrada de imágenes, asumiendo que la calidad no está validada.
- Benchmarking de forks de llama.cpp: usar el modelo como carga de trabajo para comparar el rendimiento de Metal y CUDA entre el fork stock de Prism ML y el de Dendrite, dado que las cifras de `llama-bench` están publicadas para ambos.
- Estudio de dinámicas de subredes Bittensor: analizar el modelo como ejemplo de submission ganadora (hotkey `5HgX5p6KZVij3qMQNRELKffP27TqXf99srbii5xK3gyqZUdB`, uid 49) y de cómo se evalúa la fidelidad a un profesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son de fidelidad al profesor y de velocidad de inferencia.

| Metrica | Ingot-XIX-27B-Q2 | Rey anterior (misma eval) |
|---|---|---|
| KL(profesor ‖ modelo) | 0,09246 | 0,09418 |
| Distancia de estados ocultos | 0,3173 | 0,3201 |

| Hardware | Fichero | Decode (tok/s) | Prompt (tok/s) |
|---|---|---|---|
| RTX PRO 6000 Blackwell 96 GB | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell 96 GB | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite | PTQ1_0 | 52,8 | 368 |

Prism ML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Requisitos de hardware

- VRAM estimada: 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0) para los pesos; añadir overhead de contexto y de la atención lineal, no cuantificado en la información disponible.
- Decodificación especulativa: el drafter DFlash 2 añade aproximadamente 6 GB de VRAM adicionales.
- Visión: el `mmproj` Q8_0 o BF16 añade VRAM no especificada.
- GPU recomendadas: RTX PRO 6000 Blackwell (medida), RTX 5090 (referencia de Prism ML para Bonsai 2), y en general cualquier GPU con al menos 8-12 GB de VRAM para los ficheros de 6-7 GB.
- Cabe en GPU de consumo: sí, los ficheros de 5,95-7,21 GB caben en tarjetas de 8 GB o más, siempre que se use el fork compatible.
- Apple Silicon: medido en Mac Studio M3 Ultra (80 núcleos GPU, 512 GB); no se han publicado cifras para otros chips.
- Opciones de despliegue: exclusivamente el fork de DendriteLabs de llama.cpp en el commit `c96baf4abe24d11a50f326e40b6223b687449d63` (compilado con `-DGGML_CUDA=ON`); llama.cpp estándar no ejecuta el modelo. No hay soporte documentado para vLLM, TGI u Ollama.
- Latencia y throughput: ver tabla de benchmarks; el fichero PTQ1_0 decodifica algo más rápido en GPU (145 frente a 137 tok/s) mientras que el PQ2_0 decodifica más rápido en Mac con el fork de Dendrite (56,4 frente a 52,8 tok/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XIX-27B-Q2 | 26,9B | No disponible | Ternaria 1,75-2,125 bpw | No disponible | GGUF, fork de Dendrite obligatorio |
| prism-ml/Ternary-Bonsai-2-27B-gguf (profesor) | 27B (aprox.) | No disponible | Ternaria (PQ2_0, PTQ1_0) | No disponible | GGUF, fork de Prism ML |
| dendriteholdings/Ingot-genesis-27B-Q2 | 27B (aprox.) | No disponible | Ternaria 2 bits | No disponible | GGUF, fork de Dendrite |
| Qwen3.8-27B (profesor de referencia) | 27B (aprox.) | No disponible | BF16 y otras | No disponible en esta ficha | Pesos completos |

La comparación cuantitativa disponible se limita a la fidelidad frente al profesor: el modelo presenta KL 0,09246 y distancia de estados ocultos 0,3173, ligeramente mejores que el rey anterior (0,09418 y 0,3201). No hay datos de rendimiento en tareas comparables con Bonsai 2 ni con Qwen3.8-27B.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor; el modelo base y el profesor tampoco declaran licencia en la información disponible.
- Dependencia de un fork concreto: solo funciona con el fork de DendriteLabs de llama.cpp en el commit `c96baf4`; llama.cpp estándar falla. Esto complica el mantenimiento y la integración en producción.
- Idiomas no declarados: no hay garantía de calidad multilingüe ni de cobertura de idiomas distintos del inglés.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Sin benchmarks de capacidades: no hay datos de MMLU, HumanEval, GSM8G ni similares; la calidad real en razonamiento, código o matemáticas es desconocida.
- Riesgo de alucinación: inherente a un modelo de 27B cuantizado a 1,75-2,125 bits; la cuantización ternaria agresiva puede amplificar errores en tareas de precisión.
- Visión no validada: el `mmproj` disponible fue entrenado para genesis, no para estos pesos, y el autor advierte que la calidad de imagen no está probada.
- Tool calling y agentes no documentados: no se puede asumir soporte de function calling ni de razonamiento multi-paso.
- Procedencia competitiva: el modelo es una submission de un subnet con incentivos a acercarse al profesor, no un modelo entrenado para tareas específicas; su comportamiento puede estar sobreajustado a la métrica de evaluación.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin issues ni reportes independientes de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-XIX-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo genesis relacionado: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia: https://github.com/DendriteLabs/llama.cpp/commit/c96baf4abe24d11a50f326e40b6223b687449d63
