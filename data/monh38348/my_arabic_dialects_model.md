# Monh38348/my_arabic_dialects_model

## Resumen

my_arabic_dialects_model es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado en Hugging Face por el usuario Monh38348. Se trata de un checkpoint conversacional de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) que hereda la arquitectura Qwen2 del modelo base y que, por su nombre, apunta a un uso orientado a dialectos del árabe, aunque la model card no documenta ni el corpus de entrenamiento ni los idiomas cubiertos de forma explícita.

El modelo se ha entrenado con la librería TRL mediante supervisión directa (SFT), sin que se detallen el número de tokens, la composición del dataset ni si hubo fases posteriores de alineación (DPO, RLHF). El repositorio ocupa 3,1 GB en formato safetensors y está etiquetado como compatible con text-generation-inference y con endpoints de Hugging Face, lo que indica que está pensado para despliegue en infraestructura de inferencia gestionada.

Su relevancia práctica es limitada y muy acotada: se trata de un checkpoint experimental con cero descargas y cero likes en el momento de redactar esta ficha, sin licencia declarada y sin resultados de evaluación publicados. Resulta útil como punto de partida para experimentación con modelos pequeños en árabe dialectal sobre GPU de consumo, pero no como componente listo para producción sin una validación previa exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada de Qwen/Qwen2.5-1.5B-Instruct |
| Parámetros totales | 1.543.714.304 (≈1,54 B) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible en la información del repositorio; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantización | No disponibles para este fine-tune; el modelo base publica variantes GPTQ, AWQ y GGUF |
| Idiomas soportados | No declarados en la model card; el nombre del modelo sugiere árabe dialectal |
| Licencia | No disponible (la model card incluye un marcador de posición "license" sin especificar términos) |
| Formato de pesos | safetensors |
| Librería | transformers |
| Tamaño del repositorio | 3,1 GB |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Compatibilidad de despliegue | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo mantiene intacta la arquitectura del base: un transformer decoder-only de la familia Qwen2, con normalización RMSNorm, activación SwiGLU, codificación posicional rotatoria (RoPE) y atención con consultas agrupadas (GQA). Al conservar los mismos 1.543.714.304 parámetros que Qwen2.5-1.5B-Instruct, el ajuste fino no ha modificado la topología de la red, sino únicamente los pesos mediante entrenamiento supervisado. El contexto heredado es de 32.768 tokens.

El procedimiento de entrenamiento declarado es SFT con TRL 1.14.0, sobre un dataset que no se describe en ningún momento: no se indica el número de tokens, la procedencia de los datos, la proporción de cada dialecto árabe, ni si hubo una fase de preferencias (DPO/RLHF) posterior. Las versiones de framework reportadas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, modos de razonamiento explícito u otros).

## Capacidades

- Generación de texto conversacional multi-turno: el modelo está etiquetado como `conversational` y deriva de una variante instruct, por lo que mantiene el formato de chat del base.
- Generación de texto general y respuesta a instrucciones en el estilo del modelo base Qwen2.5-1.5B-Instruct.
- Uso previsto en árabe dialectal: el nombre del checkpoint lo sugiere, pero la model card no documenta qué dialectos ni con qué calidad.
- Soporte de tool calling / function calling: no documentado para este fine-tune (el base Qwen2.5-Instruct sí lo soporta, pero no hay confirmación de que se haya preservado tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; dependen en la práctica del modelo base y de cuánto se haya degradado durante el SFT.
- Capacidades especiales (modo thinking, visión, audio): no documentadas ni presentes en el base.
- Compatibilidad con text-generation-inference y endpoints gestionados de Hugging Face, lo que facilita su exposición como API.

## Casos de uso

- Prototipado de asistentes conversacionales en árabe dialectal: con 1,54 B de parámetros y ~3,1 GB en bf16, permite iterar rápidamente sobre diálogos multi-turno en una única GPU de consumo antes de decidir si se escala a un modelo mayor.
- Curación y etiquetado de corpus árabes: puede actuar como anotador auxiliar (etiquetado de intención, normalización de texto dialectal, generación de variantes) en pipelines de preparación de datasets, siempre con revisión humana dado que no hay métricas publicadas.
- Generación aumentada por recuperación (RAG) ligera: su ventana heredada de 32.768 tokens y su huella reducida lo hacen apto para montar un sistema RAG de bajo coste sobre documentación en árabe en una sola GPU o incluso en CPU con cuantización.
- Investigación sobre dialectología árabe computacional: sirve como baseline ajustado para comparar contra el modelo base y medir el efecto del SFT en tareas de dialecto.
- Despliegue en edge u on-premise: cuantizado a 4 bits ocupa alrededor de 1 GB de VRAM, lo que permite ejecutarlo en equipos con GPUs modestas o en portátiles, algo imposible con modelos de 7 B o más.
- Generación de datos sintéticos en árabe para entrenar modelos mayores: puede producir borradores de conversaciones que después se filtren y se usen como material de SFT.
- Pruebas de concepto de atención al cliente regional (Golfo, Levante, Magreb): útil para demostrar el flujo completo, pero requiere evaluación de calidad específica por dialecto antes de cualquier exposición real a usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K, ArabicMMLU, benchmarks de dialectos como NADI o MADAR), ni comparaciones cuantitativas con el modelo base. Tampoco hay datos de latencia o throughput declarados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en bf16/fp16 (coincide con el tamaño del repositorio), unos 1,6 GB en cuantización de 8 bits y alrededor de 0,9-1,0 GB en 4 bits, más el overhead del runtime (KV cache incluido).
- GPU recomendadas: cualquier GPU moderna con al menos 6-8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). Para lotes grandes o contexto completo de 32.768 tokens conviene subir a 16-24 GB (A100 40 GB, L40S, H100) por el consumo de la caché KV.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU con 8 GB o más en precisión nativa, y en GPU de 4-6 GB si se cuantiza a 4 bits.
- También es viable en CPU mediante llama.cpp/Ollama tras convertir los pesos a GGUF, con velocidades de decodificación del orden de unos pocos tokens por segundo según el hardware.
- Opciones de despliegue: transformers (referencia de la model card), text-generation-inference (etiqueta oficial del repositorio), vLLM, Hugging Face Inference Endpoints, y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| my_arabic_dialects_model | 1,54 B | No disponible (base: 32.768 tokens) | No disponible | Repositorio público, 0 descargas, sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache-2.0 | Ampliamente desplegado, variantes GGUF/AWQ/GPTQ, benchmarks publicados |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Ampliamente desplegado, ecosistema maduro |
| google/gemma-2-2b-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | Ampliamente desplegado, requiere aceptar términos |

En términos de rendimiento no es posible establecer comparación: el fine-tune no publica métricas, mientras que los tres modelos de referencia sí disponen de resultados oficiales. La diferencia principal es de gobernanza y soporte: los alternativas tienen licencias explícitas y mantenimiento activo, algo que este checkpoint no ofrece.

## Limitaciones y advertencias

- Licencia no declarada: la model card usa un marcador de posición ("license") sin términos concretos. Sin una licencia explícita, el uso comercial queda en una zona jurídicamente indefinida y no debería asumirse permiso alguno.
- Ausencia total de evaluación: no hay benchmarks, ni evaluación cualitativa, ni comparación con el modelo base, por lo que se desconoce si el SFT ha mejorado o degradado las capacidades originales de Qwen2.5-1.5B-Instruct.
- Dataset de entrenamiento no documentado: se desconoce qué dialectos árabes cubre, en qué proporción, con qué fuentes y si hubo datos sintéticos o traducidos. Esto impide estimar cobertura real y sesgos.
- Riesgo elevado de alucinación: al ser un modelo de 1,54 B, la tasa de invención de hechos es intrínsecamente alta, especialmente en tareas de conocimiento factual y en contextos dialectales poco representados.
- Idiomas no declarados: aunque el nombre apunta al árabe dialectal, no hay confirmación; el ejemplo de la propia model card es una pregunta en inglés, lo que añade ambigüedad sobre el idioma real de uso.
- Degradación potencial del multilingüismo del base: un SFT no documentado puede haber erosionado el rendimiento en idiomas distintos al objetivo.
- Inconsistencias en los metadatos: las versiones declaradas (Transformers 5.16.1, PyTorch 2.11.0+cu128, TRL 1.14.0) no se corresponden con versiones publicadas en el momento de redactar esta ficha, y la fecha de creación del repositorio figura como el 26 de septiembre de 2026. Conviene verificar el entorno real de entrenamiento antes de confiar en la reproducibilidad.
- Adopción nula: cero descargas y cero likes implican que el checkpoint no ha sido validado por terceros y no cuenta con soporte de la comunidad.
- Sin garantía de soporte de tool calling ni de plantilla de chat verificada: el ejemplo de la model card pasa una lista de diccionarios directamente al pipeline sin `apply_chat_template`, lo que puede no reproducir fielmente el formato de entrenamiento.
- Recomendación operativa: tratar el modelo como experimental, no desplegarlo con usuarios finales sin una batería de evaluación propia por dialecto y sin resolver antes la cuestión de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Monh38348/my_arabic_dialects_model
- Modelo base Qwen/Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de TRL (framework de entrenamiento citado): https://github.com/huggingface/trl
