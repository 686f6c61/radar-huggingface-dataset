# open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-100B-4096-longsft_16k-SFT-Tulu3-decontaminated-ot30k

## Resumen

open-sci-ref-v0.02-1.7b-nemotron-hq-100B-4096-longsft_16k-SFT-Tulu3-decontaminated-ot30k es un modelo de lenguaje de 1.714.377.728 parámetros (aproximadamente 1,7 mil millones) publicado por la organización open-sci en Hugging Face. Se trata de un checkpoint resultante de un ajuste supervisado (SFT, *supervised fine-tuning*) completo —no LoRA— sobre una base derivada de la familia Nemotron, entrenado con el framework LLaMA-Factory. El modelo está orientado a tareas de extracción de características (*feature-extraction*) según su pipeline declarado, aunque su entrenamiento con datos conversacionales de tipo Tulu3 sugiere capacidad de generación.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con 16 descargas y 0 *likes* en el momento de la consulta, sin model card sustantiva (la tarjeta es autogenerada por el *Trainer* y contiene campos "More information needed"). El nombre del repositorio codifica el proceso: base Nemotron de 1.7B, contexto de 4096 tokens, SFT sobre 16k muestras largas, dataset Tulu3 decontaminado y 30.000 muestras de *open-thoughts*. No dispone de benchmarks publicados.

Por tanto, debe interpretarse como un modelo de referencia interno para experimentación en ajuste fino, no como un modelo listo para producción. La información disponible es escasa y muchos parámetros técnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Nemotron; detalles no disponibles) |
| Parametros totales | 1.714.377.728 (~1,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 4096 tokens (según nombre del repositorio; no confirmado en model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no estándar; condiciones no especificadas) |
| Formato de pesos | safetensors (repo de 3,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de una base de la familia Nemotron (1,7B parámetros) y se ha sometido a un ajuste supervisado completo (*full fine-tuning*, no adaptadores) mediante LLaMA-Factory. Los hiperparámetros documentados en la model card son: learning rate 4e-05, batch size total 128 (batch 1 por dispositivo, 32 dispositivos, acumulación de gradiente 4), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con *warmup ratio* de 0,1, y 5 épocas. El entrenamiento se ejecutó en configuración multi-GPU con 32 dispositivos, usando Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2.

El dataset declarado es `open-thoughts_open_thoughts3-1.2_m_30000_samples` (30.000 muestras, identificador f679a5c592c8dffb), complementado según el nombre del repositorio con SFT sobre Tulu3 "decontaminado" y muestras largas de 16k. No se especifica el número total de tokens de entrenamiento, la composición exacta del corpus ni si hubo etapas de RLHF o DPO posteriores. Tampoco se documentan innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, etc.); se asume una arquitectura transformer estándar de la base Nemotron.

## Capacidades

- Generación de texto autoregresiva, heredada de la base Nemotron de 1,7B.
- Ajuste orientado a instrucciones y conversación mediante SFT sobre Tulu3 y open-thoughts.
- Razonamiento de tipo *chain-of-thought* potencial, dado el uso de datos open-thoughts (no verificado con benchmarks).
- Pipeline declarado de *feature-extraction*: puede emplearse para obtener representaciones ocultas.
- Soporte de *tool calling* / *function calling*: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (visión, audio, modo *thinking*): no disponibles.

## Casos de uso

- Experimentación en ajuste fino: sirve como checkpoint de referencia para comparar recetas de SFT (full vs. LoRA) sobre bases Nemotron de 1,7B, dado que documenta hiperparámetros completos.
- Extracción de características: al declarar pipeline `feature-extraction`, puede usarse para generar embeddings de frases o documentos en tareas de clasificación y recuperación, aunque sin evaluación publicada.
- Prototipado de asistentes conversacionales: su SFT sobre Tulu3 permite probar diálogos multi-turno en entornos de desarrollo con contexto de 4096 tokens.
- Investigación en decontaminación de datasets: el nombre del repositorio indica un pipeline de decontaminación sobre Tulu3, útil para estudiar el impacto de la limpieza de datos en el rendimiento.
- Generación de razonamiento sintético: el entrenamiento con open-thoughts lo hace candidato para generar trazas de razonamiento en *pipelines* de destilación, sujeto a validación manual.
- Evaluación comparativa de bases pequeñas: con 1,7B parámetros y 3,4 GB de pesos, es viable ejecutarlo en una sola GPU consumer para pruebas de *sanity check* frente a otros checkpoints de open-sci.

## Benchmarks y rendimiento

El *model-index* de la model card declara una entrada (`sft__f679a5c592c8dffb__open-sci-re-5d917025__sdpa-open-sci-steps`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 6-8 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~1,7-2 GB para pesos; en 4 bits: ~0,9-1,2 GB (cuantizaciones no publicadas oficialmente, requieren conversión manual).
- GPU recomendadas: una RTX 3090, RTX 4090 o A100 40 GB son suficientes; también cabe en GPUs consumer de 8 GB en FP16 con contexto reducido.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares.
- Opciones de despliegue: Transformers (librería declarada), vLLM y TGI previa verificación de compatibilidad con el código personalizado (`custom_code` en los tags); llama.cpp/Ollama requerirían conversión a GGUF.
- Latencia y throughput estimados: no disponibles (sin datos publicados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b (este) | 1,7B | 4096 (según nombre) | other | Hugging Face, 16 descargas | no publicados |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | publicados por el autor |
| Llama-3.2-1B-Instruct | 1,2B | 131.072 | Llama 3.2 Community License | Hugging Face, ampliamente usado | publicados por el autor |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 | Apache 2.0 | Hugging Face | publicados por el autor |

La comparación con alternativas establecidas es desfavorable en contexto, licencia y trazabilidad de evaluación; su interés es exclusivamente como artefacto de investigación de open-sci.

## Limitaciones y advertencias

- Model card autogenerada e incompleta: campos de descripción, usos previstos y datos de evaluación marcados como "More information needed".
- Sin benchmarks publicados: no es posible verificar calidad de generación, razonamiento o código.
- Licencia "other" sin texto de condiciones: riesgo legal para uso comercial; debe consultarse el repositorio antes de cualquier despliegue productivo.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés de los datasets de entrenamiento.
- Riesgo de alucinación inherente a un modelo de 1,7B sin evaluación de fidelidad documentada.
- Contexto limitado a 4096 tokens según el nombre del repositorio, insuficiente para documentos largos o conversaciones extensas.
- Sesgos desconocidos: al derivar de Tulu3 y open-thoughts, puede heredar sesgos de estos corpus, sin análisis publicado.
- Código personalizado (`custom_code`): requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código no auditado.
- Madurez muy baja: 16 descargas, 0 *likes* y creado/actualizado el mismo día (30 de octubre de 2026), sin historial de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-100B-4096-longsft_16k-SFT-Tulu3-decontaminated-ot30k
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset open-thoughts (referenciado en la model card): https://huggingface.co/datasets/open-thoughts/open_thoughts3-1.2_m_30000_samples
- Tulu3 (dataset de SFT referenciado): https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
