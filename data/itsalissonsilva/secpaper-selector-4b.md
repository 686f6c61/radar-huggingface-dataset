# itsalissonsilva/SecPaper-Selector-4B

## Resumen

SecPaper-Selector-4B es un adaptador LoRA de selección de evidencia construido sobre el modelo base Qwen/Qwen3.5-4B y publicado por el desarrollador independiente Alisson Silva (itsalissonsilva) en Hugging Face. Su función no es generar respuestas, sino resolver una subtarea intermedia del pipeline RAG: dado un enunciado de investigación en seguridad y un conjunto de extractos identificados por ID, el modelo devuelve únicamente los IDs de los pasajes que sustentan la respuesta, o bien declara abstención cuando el material aportado no permite contestar.

El modelo se sitúa entre la fase de recuperación y la de redacción de respuestas. Se trata de un adaptador PEFT de rango 16 y alpha 32, entrenado sobre la atención del transformer de Qwen3.5-4B, con un total de 208 tensores en FP32 que ocupan aproximadamente 57 MB antes de la fusión QKV. La interfaz es JSON explícita, con una lista de IDs de evidencia y un flag booleano de abstención, lo que facilita su integración en pipelines automatizados y su validación programática.

Su relevancia radica en el rendimiento medido: sobre un conjunto de test congelado de 156 casos, el adaptador acierta el conjunto exacto de pasajes de referencia en 149 casos (95,5 %), frente al 66,0 % del mejor comparador sin ajuste y al 48,7 % del propio Qwen3.5-4B sin entrenar. El autor advierte explícitamente de que esta métrica mide concordancia con etiquetas sintéticas, no corrección científica de la respuesta ni implicación verificada por humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-4B (atención, rank 16, alpha 32) |
| Parametros totales | No disponible (adaptador de ~57 MB en FP32; pesos base descargados aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entradas de hasta 16.000 tokens (límite impuesto por el helper; contexto nativo del base no disponible) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye y verifica en FP32; el base admite las cuantizaciones propias de Qwen3.5-4B) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT), pesos HF convertidos incluidos en el repo |

## Arquitectura y entrenamiento

El adaptador se aplica sobre la atención del modelo Qwen3.5-4B (commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`). El entrenamiento se realizó con Tinker usando LoRA de atención con rango 16, alpha 32, dos épocas fijas, learning rate 8e-5, batch 16 y semilla 2026110607, sin selección de checkpoint basada en test. Los conjuntos se dividen en 551 tareas de entrenamiento, 101 de validación y 156 de test, con los artículos fuente (incluidos los distractores) disjuntos entre particiones: 392, 79 y 117 papers respectivamente. Las plantillas de pregunta y los tipos de tarea sí se repiten entre particiones.

Una innovación técnica destacable es la fusión de las actualizaciones LoRA de Q, K y V: se concatenan las matrices A y se diagonaliza por bloques la matriz B, triplicando el rango y alpha fusionados sin alterar el escalado y sin compresión con pérdida. El proceso completo de conversión está documentado en `conversion.json`. El autor publica hashes SHA256 de las filas congeladas, de los pesos originales y de los pesos convertidos, así como las fuentes de reproducción en `reproduce/`. Los textos fuente son metadatos descriptivos y abstracts de arXiv, no el texto completo de los artículos.

## Capacidades

- Selección de evidencia: devuelve los IDs de los pasajes que sustentan una pregunta de investigación en seguridad, con interfaz JSON explícita.
- Abstención explícita: emite `{"evidence": [], "abstain": true}` cuando el material aportado no permite responder.
- Validación de IDs y JSON en el helper `EvidenceSelector`, que rechaza salidas truncadas y preserva los valores FP32 del adaptador.
- Gestión de entradas largas: acepta hasta 16.000 tokens y rechaza las que los superan.
- No ejecuta el contenido de los pasajes; solo opera sobre los IDs y el texto aportado.
- Capacidad multilingüe limitada al inglés.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Asistente de investigación con fuentes visibles: el modelo filtra los abstracts recuperados y el sistema muestra al lector únicamente los pasajes seleccionados, evitando convertir una selección de ID en una respuesta no sustentada.
- Verificación de mecanismos de seguridad: ante preguntas como qué mecanismo protege los datos almacenados, el modelo selecciona el extracto que menciona AES-GCM o se abstiene si no aparece, lo que permite auditar respuestas técnicas contra la fuente.
- Filtrado previo a la generación en pipelines RAG: situado entre el retriever y el generador, reduce el contexto que se pasa al modelo de respuesta y mitiga alucinaciones al descartar pasajes irrelevantes.
- Triaje de literatura científica: dado un lote de metadatos de arXiv, identifica qué extractos responden a una pregunta concreta antes de la revisión manual.
- Control de abstención en sistemas de preguntas y respuestas: el flag `abstain` permite que el sistema deje sin responder preguntas no cubiertas por el corpus, en lugar de forzar una contestación.
- Evaluación de retrievers: al medir la concordancia entre los pasajes recuperados y los seleccionados por el modelo, se puede comparar la calidad de distintos motores de recuperación sobre el mismo corpus.

## Benchmarks y rendimiento

Resultados sobre el test congelado de 156 casos (cohorte de metadatos de papers de seguridad de 2026), con los mismos pasajes y tarea para todas las condiciones. Las condiciones Qwen desactivan el modo thinking y permiten 160 tokens de salida; GPT-OSS usa razonamiento bajo y hasta 4.096 tokens.

| Condición | Exact set accuracy | Answerable | Abstention |
|---|---:|---:|---:|
| SecPaper-Selector-4B (pesos HF guardados) | 95,5 % | 93,5 % | 100,0 % |
| Qwen3.5-4B sin ajuste (HF) | 48,7 % | 28,0 % | 93,9 % |
| Qwen3.6-35B-A3B sin ajuste (Tinker) | 66,0 % | 50,5 % | 100,0 % |
| GPT-OSS-20B sin ajuste, razonamiento bajo (Tinker) | 61,5 % | 44,9 % | 98,0 % |
| TF-IDF logístico entrenado (CPU) | 59,6 % | 44,9 % | 91,8 % |
| Solapamiento léxico fijo | 26,9 % | 39,3 % | 0,0 % |

El adaptador reproduce exactamente las 156 salidas nativas de Tinker en la configuración HF medida. La regla de publicación se fijó antes del entrenamiento: al menos 90 % de balanced accuracy, al menos 85 % en cada categoría y una diferencia bootstrap pareada positiva frente a cada baseline elegible. El autor señala que la cohorte es pequeña y que los pasajes de contexto compartidos pueden inducir dependencia más allá de los 103 grupos ancla usados en el bootstrap.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; requiere cargar los pesos base de Qwen3.5-4B más el adaptador de ~57 MB.
- Configuración medida: CUDA con soporte BF16; la evaluación se realizó en una A100 de 80 GB con batch 8.
- GPU recomendadas: A100 80 GB (configuración medida). Para otras GPU no se aportan datos.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; depende de la cuantización aplicada al modelo base.
- Opciones de despliegue: el paquete incluye el helper `EvidenceSelector` y un `requirements.txt`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Exact set accuracy (test) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| SecPaper-Selector-4B | Adaptador LoRA sobre Qwen3.5-4B | ~57 MB de adaptador | 16.000 tokens de entrada (límite del helper) | 95,5 % | Apache 2.0 | Hugging Face |
| Qwen3.5-4B sin ajuste | Modelo base | 4B | No disponible | 48,7 % | No disponible en la información | Hugging Face |
| Qwen3.6-35B-A3B sin ajuste | MoE sin ajuste | 35B totales, 3B activos | No disponible | 66,0 % | No disponible en la información | Tinker |
| GPT-OSS-20B sin ajuste | Modelo sin ajuste | 20B | No disponible | 61,5 % | No disponible en la información | Tinker |
| TF-IDF logístico entrenado | Recuperador léxico | No aplica | No aplica | 59,6 % | No aplica | CPU local |

## Limitaciones y advertencias

- La métrica del 95,5 % mide concordancia con etiquetas sintéticas de pasajes, no corrección de la respuesta científica ni implicación verificada por humanos.
- La cohorte de evaluación es pequeña (156 casos) y los pasajes de contexto compartidos pueden inducir dependencia estadística más allá de los 103 grupos ancla del bootstrap.
- Los textos fuente son metadatos y abstracts de arXiv, no artículos completos, lo que limita la profundidad de la evidencia disponible.
- El modelo solo admite inglés.
- Las entradas de más de 16.000 tokens se rechazan.
- Una lista de evidencia vacía indica abstención, no prueba de que no exista respuesta.
- El autor recomienda mostrar los pasajes seleccionados al usuario y no presentar las selecciones como citas verificadas automáticamente.
- El helper valida IDs y JSON y rechaza salidas truncadas, pero no ejecuta el contenido de los pasajes.
- No se documentan sesgos específicos ni tasas de alucinación más allá de la abstención medida.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe descargarse por separado y está sujeto a su propia licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsalissonsilva/SecPaper-Selector-4B
- Perfil del autor: https://huggingface.co/itsalissonsilva
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
