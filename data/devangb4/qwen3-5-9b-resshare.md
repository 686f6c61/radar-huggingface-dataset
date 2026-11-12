# devangb4/Qwen3.5-9B-ResShare

## Resumen

Qwen3.5-9B-ResShare es un checkpoint de Qwen3.5-9B afinado mediante supervisión (SFT) con LoRA para responder preguntas utilizando exclusivamente el contexto documental suministrado, incluyendo la capacidad de abstenerse cuando la evidencia es insuficiente. Lo desarrolla el usuario devangb4 sobre el modelo base Qwen/Qwen3.5-9B, con el entrenamiento ejecutado en Together AI, y está pensado para integrarse en el backend de ResShare como motor de question answering anclado a documentos (RAG). El modelo no indexa ni recupera documentos por sí mismo: el pipeline de retrieval debe aportar los fragmentos relevantes.

El checkpoint tiene 9.653.104.368 parámetros en formato safetensors (19,5 GB de repositorio), licencia Apache-2.0 y soporte declarado únicamente de inglés. El autor lo etiqueta explícitamente como experimental: el job de entrenamiento finalizó correctamente, pero no se han evaluado todavía la calidad de respuesta frente al modelo base, el rendimiento en el conjunto de test reservado ni la inferencia en Mac. La pérdida de validación reportada (0,2018 en el paso 114) no demuestra por sí sola una mejora sobre el modelo base.

Su relevancia actual es acotada y de nicho: sirve como referencia reproducible de un ajuste LoRA orientado a abstención y grounding documental, con el adaptador incluido en `adapter/` y el script de formateo de prompt (`resshare_prompt.py`) en el repositorio. No debe tratarse como un modelo listo para producción sin una evaluación comparativa previa contra el base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles de atención y capas no disponibles) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como límite arquitectónico; el backend usa un objetivo de contexto en tiempo de ejecución de 8K y secuencia máxima de entrenamiento de 4096 |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors sin cuantizar); el autor planifica GGUF Q4_K_M para Mac, sin verificar |
| Idiomas soportados | inglés (entrenamiento solo con texto en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato Hugging Face; no GGUF ni MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (referencia fijada `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y se ajusta mediante supervised fine-tuning con LoRA de rango 16 y alpha 32 sobre módulos reportados por el proveedor como `all-linear`. El entrenamiento lo ejecutó Together AI con 1 época, learning rate 1e-5, scheduler coseno reportado por el proveedor, batch size 8, longitud máxima de secuencia 4096, packing activado, semilla 42 y cálculo de pérdida solo sobre tokens del asistente. La visión quedó desactivada durante el entrenamiento.

Los datos provienen exclusivamente de los splits oficiales de entrenamiento de Neural Bridge RAG Dataset 12000 (3.000 ejemplos) y SQuAD 2.0 (1.500 ejemplos respondibles y 1.500 no respondibles, estos últimos convertidos a la respuesta fija de abstención). El conjunto total es de 6.000 ejemplos de entrenamiento y 300 de validación, con 50 ejemplos de test reservados aún sin evaluar. Together reportó 3.697.231 tokens de entrenamiento y 189.123 de validación; el recuento local con el tokenizer fue de 3.697.135, una diferencia de 96 tokens sin explicar. Se generaron splits disjuntos por grupo de documentos sin solapamiento exacto de contextos normalizados, aunque no se auditó exhaustivamente el solapamiento semántico casi duplicado. Los ejemplos que excedían la longitud se excluyeron en lugar de truncarse, y cuatro ejemplos se sustituyeron tras una revisión por agente de 60 ejemplos (no fue una auditoría humana independiente).

## Capacidades

- Question answering anclado a documentos: responde usando solo el contexto suministrado en el prompt, con formato específico de sistema y usuario.
- Abstención explícita: devuelve la frase fija "I couldn't find enough information in the provided documents to answer this question." cuando la evidencia es insuficiente.
- Generación conversacional en modo no-thinking (`enable_thinking=False`), tal como exige el backend ResShare.
- Resistencia parcial a inyección de instrucciones en documentos: el prompt de sistema indica tratar el contenido documental como evidencia y nunca como instrucciones, aunque no hay garantía de cumplimiento.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (el prompt prohíbe explícitamente trazas de razonamiento).
- Capacidades multilingües: solo inglés.
- Capacidades de visión: no entrenadas (desactivadas durante el ajuste).
- Capacidades de audio: no disponibles.

## Casos de uso

- Atención al cliente sobre base documental: el modelo responde consultas usando fragmentos recuperados de manuales o FAQs, con abstención cuando el fragmento no cubre la pregunta, lo que reduce respuestas inventadas en conversaciones multi-turno.
- Asistentes internos de consulta de políticas: integrado en un pipeline RAG corporativo, responde sobre políticas de RR. HH. o procedimientos citando el contexto aportado, y declina responder si el retrieval no devuelve evidencia suficiente.
- Búsqueda documental con respuesta extractiva: sobre corpus técnicos o legales, genera respuestas concisas y directas a partir de los chunks recuperados, adecuado por su formato de salida breve y su entrenamiento con objetivos extractivos de SQuAD.
- Verificación de cobertura documental: al abstenererse ante evidencia insuficiente, sirve para detectar huecos en la base de conocimiento antes de escalar a un humano.
- Prototipado de sistemas RAG con control de alucinación: útil como checkpoint de referencia para comparar, con las mismas preguntas reservadas, el comportamiento del modelo base frente al ajustado antes de adoptarlo.
- Despliegue en estación de trabajo Apple Silicon: previa conversión a GGUF Q4_K_M (planificada, no verificada) para un Mac con 24 GB de memoria unificada, en escenarios de prueba locales con contexto de 8K.
- Filtrado de preguntas no respondibles en pipelines de soporte: clasificación implícita mediante abstención para derivar consultas fuera de alcance a un agente humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la comparación de calidad base frente a ajustado, el rendimiento en el conjunto de test reservado (50 ejemplos) y la inferencia en Mac no se han evaluado. El único dato reportado es la pérdida de validación final de 0,2018 en el paso 114, que no constituye una métrica de calidad de respuesta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para 9,65 mil millones de parámetros, en FP16/BF16 se requiere aproximadamente 19-20 GB solo para pesos, más overhead de KV cache; en cuantización de 8 bits, en torno a 10-11 GB; en 4 bits, en torno a 5-6 GB (estimaciones orientativas, no verificadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU de 24 GB (RTX 4090, A10G, L4 con cuantización) o superior (A100 40/80 GB, H100) para FP16 sin cuantizar.
- ¿Cabe en GPU de consumo? En FP16 no cabe en GPUs de 16 GB; en cuantización de 4-8 bits podría caber en RTX 4090 (24 GB), RTX 4080 (16 GB) con 4 bits y GPUs de 12 GB solo con cuantizaciones agresivas, todo ello sin verificar.
- Apple Silicon: el autor apunta a un Mac con 24 GB de memoria unificada tras convertir a GGUF Q4_K_M; advierte que el checkpoint sin cuantizar no debe asumirse que quepa junto a la aplicación.
- Opciones de despliegue: el repositorio solo distribuye safetensors en formato Hugging Face. El autor menciona conversión a GGUF para Mac; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, aunque por arquitectura y formato serían candidatas tras la conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-ResShare | 9,65 B | 8K en runtime (objetivo del backend); 4096 en entrenamiento | Inglés | Apache-2.0 | Ajuste LoRA para RAG con abstención; sin evaluación publicada |
| Qwen/Qwen3.5-9B (base) | 9,65 B | no disponible | no disponible | Apache-2.0 (según el repositorio derivado) | Modelo base; referencia directa para comparar calidad |
| Alternativas de la misma categoría (p. ej. Llama 3.1 8B, Mistral 7B) | 7-8 B | no disponible en esta ficha | Multilingüe en algunos casos | Licencias propias | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: no se ha demostrado mejora sobre el modelo base; la pérdida de validación no equivale a mejor calidad de respuesta.
- Puede inventar respuestas, omitir evidencia presente, seguir instrucciones maliciosas incrustadas en los documentos o abstenerse incorrectamente.
- El prompt de sistema y la desactivación de thinking son requisitos de configuración, no garantías de cumplimiento en cada salida.
- Solo entrenado en inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- El contexto de 8K y el límite de 6.000 bytes UTF-8 de entrada son ajustes de despliegue del backend, no límites arquitectónicos del modelo.
- Los datos de entrenamiento incluyen texto ruidoso scrapeado, objetivos extractivos cortos y respuestas verbosas, lo que puede afectar al estilo de salida.
- No se auditó exhaustivamente el solapamiento semántico casi duplicado entre splits; el riesgo de contaminación no está descartado.
- No es una frontera de control de acceso: los controles de propiedad documental deben permanecer en el sistema de retrieval.
- Licencia Apache-2.0 para el modelo, pero los datasets de origen mantienen sus licencias (SQuAD 2.0 es CC-BY-SA-4.0), aplicables a derivados redistribuidos.
- No hay paquete cuantizado listo para Mac; la conversión a GGUF Q4_K_M y el uso de memoria están sin verificar.
- Cero descargas y cero likes en el momento de la ficha: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devangb4/Qwen3.5-9B-ResShare
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset Neural Bridge RAG Dataset 12000: https://huggingface.co/datasets/neural-bridge/rag-dataset-12000
- Dataset SQuAD 2.0: https://huggingface.co/datasets/rajpurkar/squad_v2
- Paper de SQuAD 2.0 (Know What You Don't Know: Unanswerable Questions for SQuAD): https://aclanthology.org/P18-2124/
- Together AI: https://www.together.ai/
