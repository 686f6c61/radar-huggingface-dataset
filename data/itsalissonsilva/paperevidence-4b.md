# itsalissonsilva/PaperEvidence-4B

## Resumen

PaperEvidence-4B es un adaptador LoRA de selección de evidencia construido sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla Alisson Matheus Silva (itsalissonsilva), ingeniero de IA/ML, y su función es muy concreta: dada una pregunta y un conjunto de pasajes identificados, devolver los IDs de los pasajes que la sustentan o abstenerse explícitamente. No genera respuestas; actúa como un selector previo que filtra extractos de investigación para un lector humano o para un sistema de respuesta posterior.

El adaptador se entrena con atención LoRA de rango 16 y alpha 32 sobre el modelo base, con dos épocas fijas y sin selección de checkpoint basada en test. El repositorio ocupa unos 0,1 GB e incluye los pesos convertidos a formato Hugging Face (unos 57 MB de tensores originales antes de la fusión QKV). El modelo base Qwen3.5-4B aporta la longitud de contexto y el conocimiento lingüístico; el adaptador añade la tarea de selección y abstención.

Su relevancia radica en el enfoque metodológico: el autor fija la regla de publicación antes de entrenar (al menos 90% de balanced accuracy, 85% por categoría y una diferencia bootstrap pareada positiva frente a cada baseline elegible) y publica los artefactos de reproducción, hashes y comparaciones. El resultado reportado es 149/156 conjuntos exactos de pasajes de referencia (95,5%) en una cohorte de metadatos de papers de seguridad de 2026, con 100/107 casos respondibles y 49/49 abstenciones. El propio autor advierte que se trata de concordancia con etiquetas sintéticas falibles, no de precisión científica verificada por humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (atención, rank 16, alpha 32) sobre transformer Qwen/Qwen3.5-4B |
| Parametros totales | No disponible (adaptador de ~57 MB de tensores aprendidos; base de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Rechaza entradas de más de 16.000 tokens; contexto nativo del base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT), pesos convertidos a formato Hugging Face |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre las proyecciones de atención del modelo base Qwen/Qwen3.5-4B (commit 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a). El entrenamiento se realizó con Tinker: rank 16, alpha 32, dos épocas fijas, learning rate 8e-5, batch 16 y semilla 2026110607, sin selección de checkpoint basada en test. Las actualizaciones LoRA separadas de Q, K y V se fusionan concatenando A y diagonalizando por bloques B; el rango y alpha fusionados se triplican sin cambiar el escalado, sin compresión con pérdida. El archivo `conversion.json` documenta el mapeo completo.

El conjunto de datos consta de 551 tareas de entrenamiento, 101 de validación y 156 de test, con papers fuente (incluidos los distractores) disjuntos entre splits: 392/79/117 papers. Las plantillas de pregunta y los tipos de tarea se repiten entre splits. Los textos fuente son metadatos descriptivos y abstracts de arXiv, no papers completos. Las etiquetas de tarea generadas por profesor se filtraron con Qwen3.5-397B-A17B; como el estudiante comparte familia con ese modelo, el autor advierte de posibles errores de anotación correlacionados. La contaminación por pretraining del modelo base no está verificada. Se publican hashes SHA256 de las filas congeladas, de los pesos originales y de los pesos convertidos, además de scripts de reproducción en `reproduce/` y una auditoría offline (`verify_benchmark.py`) que recalcula todas las precisiones y comparaciones bootstrap.

## Capacidades

- Selección de evidencia: dado un par pregunta + pasajes identificados, devuelve los IDs de los pasajes que sustentan la respuesta.
- Abstención explícita: devuelve una lista vacía de evidencia cuando considera que ningún pasaje responde a la pregunta; el autor subraya que esto no prueba que no exista respuesta.
- Salida estructurada: produce IDs de evidencia compatibles con JSON y un flag de abstención; el helper valida IDs y JSON y rechaza salidas truncadas.
- No genera respuestas: es un selector, no un modelo de question answering generativo.
- Procesamiento de lotes de pasajes: acepta múltiples pasajes nombrados por consulta (por ejemplo, `paper-a/p0`, `paper-b/p0`).
- Multilingüe: solo inglés declarado.
- Tool calling, agentes, visión, audio y modo thinking: no disponibles.

## Casos de uso

- Triaje de literatura científica: un investigador introduce una pregunta y una lista de abstracts recuperados por un buscador; el adaptador devuelve solo los IDs relevantes, reduciendo el número de extractos que el lector debe revisar.
- Filtro previo en pipelines RAG: antes de pasar los pasajes a un modelo generador de respuestas, PaperEvidence-4B descarta los irrelevantes y puede activar la abstención cuando ningún fragmento recuperado es útil.
- Revisión de evidencia en dominios técnicos: en el cohorte evaluado (papers de seguridad), sirve para shortlist de extractos sobre mecanismos concretos, como cifrado o control de acceso, manteniendo los pasajes seleccionados visibles para el usuario.
- Control de calidad de recuperadores: al comparar las selecciones del adaptador con las de un retriever léxico o TF-IDF, se puede auditar si el recuperador está devolviendo pasajes que un selector entrenado considera sustentantes.
- Asistentes de revisión sistemática: integrado como paso de preselección, ayuda a priorizar abstracts antes de la lectura completa, siempre con revisión humana de las citas.
- Evaluación de abstención en sistemas de evidencia: su comportamiento de abstención (49/49 en el cohorte reportado) lo hace útil como componente de seguridad en flujos donde una cita inventada es costosa.
- Docencia e investigación metodológica: el repositorio incluye filas congeladas, hashes y scripts de auditoría, lo que permite reproducir el benchmark y estudiar el efecto de LoRA en tareas de selección.

## Benchmarks y rendimiento

Resultados reportados por el autor en una cohorte de metadatos de papers de seguridad de 2026 (156 tareas). Todas las condiciones reciben los mismos pasajes y la misma tarea; las condiciones Qwen desactivan thinking y permiten 160 tokens de salida; GPT-OSS usa razonamiento bajo y hasta 4.096 tokens.

| Condición | Exact set accuracy | Answerable | Abstention |
|---|---:|---:|---:|
| PaperEvidence-4B (pesos HF guardados) | 95,5% | 93,5% | 100,0% |
| Qwen3.5-4B sin ajustar (HF) | 48,7% | 28,0% | 93,9% |
| Qwen3.6-35B-A3B sin ajustar (Tinker) | 66,0% | 50,5% | 100,0% |
| GPT-OSS-20B sin ajustar, razonamiento bajo (Tinker) | 61,5% | 44,9% | 98,0% |
| Recuperación logística TF-IDF entrenada (CPU) | 59,6% | 44,9% | 91,8% |
| Solapamiento léxico fijo | 26,9% | 39,3% | 0,0% |

El autor indica que el adaptador reproduce exactamente las 156 salidas nativas de Tinker en la configuración HF medida y que los 208 tensores FP32 del adaptador se verificaron tras la carga. La regla de publicación exigía al menos 90% de balanced accuracy, al menos 85% en cada categoría y una diferencia bootstrap pareada positiva (o no inferioridad con al menos 30% menos coste) frente a cada baseline elegible. Los baselines de CPU y GPT-OSS original se añadieron después de ver el resultado nativo; ninguno cambió el candidato, las etiquetas ni el umbral. El cohorte es pequeño y los pasajes de contexto compartidos pueden inducir dependencia más allá de los 103 grupos ancla usados en el bootstrap.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador añade ~57 MB de tensores al modelo base de 4B. La evaluación se realizó en una A100 80GB con BF16, batch 8.
- GPU recomendadas: A100 80GB (configuración medida). GPU consumer no especificadas por el autor.
- Cabe en GPU consumer: no disponible; depende del modelo base Qwen3.5-4B y de la cuantización elegida, no documentada.
- Opciones de despliegue: el repositorio usa la librería `peft` y un helper `EvidenceSelector`; requiere CUDA con soporte BF16 según la configuración medida. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor limita la salida a 160 tokens en las condiciones Qwen y rechaza entradas de más de 16.000 tokens.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en la tarea | Licencia |
|---|---|---|---|---|---|
| PaperEvidence-4B | LoRA sobre Qwen3.5-4B | Base 4B + adaptador | Rechaza >16.000 tokens | 95,5% exact set | Apache 2.0 |
| Qwen3.5-4B sin ajustar | Transformer base | 4B | No disponible | 48,7% exact set | No disponible |
| Qwen3.6-35B-A3B sin ajustar | MoE | 35B (A3B activos) | No disponible | 66,0% exact set | No disponible |
| GPT-OSS-20B sin ajustar | Transformer | 20B | No disponible | 61,5% exact set | No disponible |
| TF-IDF logístico entrenado | Recuperador léxico | No aplica | No aplica | 59,6% exact set | No disponible |

La comparación es la publicada por el autor en la model card; no se dispone de comparaciones independientes con otros selectores de evidencia.

## Limitaciones y advertencias

- El 95,5% mide concordancia con etiquetas sintéticas falibles, no precisión científica de respuesta ni implicación verificada por humanos.
- El cohorte es pequeño (156 tareas) y los pasajes de contexto compartidos pueden inducir dependencia más allá de los 103 grupos ancla del bootstrap.
- Los textos fuente son metadatos y abstracts de arXiv, no papers completos; el modelo no demuestra competencia general en revisión de literatura ni comprensión de papers completos.
- Posibles errores de anotación correlacionados: el profesor que filtró las etiquetas (Qwen3.5-397B-A17B) comparte familia con el modelo base del estudiante.
- Contaminación por pretraining del modelo base no verificada.
- No se evalúa robustez frente a pasajes adversariales ni corrección general de citas.
- La abstención (lista vacía) no prueba que no exista respuesta; el autor pide mantener los pasajes seleccionados visibles y no presentarlos como citas verificadas automáticamente.
- El helper rechaza salidas truncadas y entradas de más de 16.000 tokens.
- Solo inglés declarado.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.5-4B deben verificarse por separado.
- El estudio anterior SecPaperAgent-20B de respuesta completa sigue privado y falló; estos resultados no se transfieren a esa tarea más amplia.
- El autor no reclama ahorro de coste entre proveedores; la liberación califica por calidad.

## Enlaces

- Hugging Face: https://huggingface.co/itsalissonsilva/PaperEvidence-4B
- GitHub del autor: https://github.com/itsalissonsilva/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Términos de la API de arXiv: https://info.arxiv.org/help/api/tou.html
