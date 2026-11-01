# open-sci/1.7b-MixtureVitae-100BT-longsft_16k-SFT-Tulu3-decontaminated-ot30k

## Resumen

El modelo `open-sci/1.7b-MixtureVitae-100BT-longsft_16k-SFT-Tulu3-decontaminated-ot30k` es un ajuste fino supervisado (SFT) de un modelo base de 1.714.377.728 parámetros (aproximadamente 1,7 mil millones) desarrollado por el colectivo open-sci. Se trata de un checkpoint derivado del modelo `1.7b-MixtureVitae-100BT-longsft_16k`, entrenado sobre un subconjunto de 30.000 muestras del dataset open-thoughts3, con un pipeline de limpieza (decontamination) aplicado. El identificador del modelo indica que el ajuste se realizó con Llama Factory en configuración `full` (todos los pesos actualizados, no LoRA).

El modelo se publica con la librería transformers, pesos en safetensors y código personalizado (`custom_code`), lo que sugiere una arquitectura que requiere implementación específica más allá del transformer estándar. El tamaño del repositorio es de 3,4 GB, coherente con pesos en precisión de 16 bits para 1,7B parámetros. El pipeline declarado es `feature-extraction`, aunque el entrenamiento SFT sobre datos de razonamiento apunta a un uso generativo.

La relevancia de este checkpoint es acotada: se trata de un artefacto de investigación con 14 descargas y sin resultados de benchmarks publicados en su model-index. Su interés radica en la combinación de un modelo base entrenado con receta MixtureVitae (100BT tokens) y un ajuste sobre datos de razonamiento de open-thoughts, pero la documentación es prácticamente inexistente y la model card está generada automáticamente por el Trainer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (requiere `custom_code`; el nombre sugiere base MixtureVitae, no confirmada) |
| Parámetros totales | 1.714.377.728 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el nombre del base incluye "longsft_16k", lo que sugiere 16.384 tokens, sin confirmación oficial) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (no se especifican términos concretos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura en la documentación proporcionada. El tag `custom_code` y la necesidad de cargar código remoto indican que el modelo no se instancia con una clase estándar de transformers, sino con una implementación propia del autor. El nombre del checkpoint base (`1.7b-MixtureVitae-100BT-longsft_16k`) sugiere un entrenamiento previo sobre 100.000 millones de tokens con una receta denominada MixtureVitae, seguido de un ajuste de contexto largo ("longsft_16k"), pero estos extremos no están confirmados en la información disponible.

El ajuste fino documentado se realizó con Llama Factory en modo `full` (no LoRA) sobre el dataset `open-thoughts_open_thoughts3-1.2_m_30000_samples`, es decir, 30.000 muestras de open-thoughts3. Los hiperparámetros declarados son: learning rate 4e-05, batch total 128 (batch 1 × 32 dispositivos × 4 pasos de acumulación), 5 épocas, optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con warmup del 10 %, semilla 42 y entrenamiento multi-GPU en 32 dispositivos. Se emplearon Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Generación de texto y razonamiento: el ajuste sobre open-thoughts3 (datos de cadenas de pensamiento) apunta a capacidad de razonamiento multi-paso, aunque no hay evaluación publicada que lo confirme.
- Instrucciones y conversación: al ser un SFT sobre datos de instrucciones, se espera capacidad de seguir instrucciones en formato conversacional, sin garantías documentadas.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: plausible por el dataset de entrenamiento, pero no verificado ni documentado.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que puede usarse para obtener representaciones ocultas, aunque no se detalla la capa o el pooling recomendado.

## Casos de uso

- Investigación sobre recetas de SFT: el checkpoint sirve como punto de comparación para estudiar el efecto de ajustar un modelo de 1,7B sobre 30.000 muestras de open-thoughts3 con configuración full frente a LoRA u otras variantes.
- Experimentos de razonamiento a pequeña escala: con 1,7B parámetros puede desplegarse en una sola GPU consumer para probar hipótesis sobre destilación de cadenas de pensamiento en modelos pequeños.
- Extracción de representaciones: dado el pipeline `feature-extraction`, puede emplearse para generar embeddings de texto en pipelines de búsqueda semántica o clustering, siempre que se valide la calidad de las representaciones.
- Base para ajustes posteriores: al ser un SFT intermedio, puede servir como inicialización para fine-tuning específico de dominio con presupuesto de cómputo reducido.
- Evaluación de decontaminación: el sufijo "decontaminated" permite estudiar el impacto de eliminar muestras contaminadas del dataset de entrenamiento en el rendimiento downstream.
- Prototipado educativo: para demostrar el flujo completo de Llama Factory (entrenamiento multi-GPU, exportación a safetensors con custom_code) en un modelo de tamaño manejable.

## Benchmarks y rendimiento

El model-index del autor declara una entrada (`sft__f679a5c592c8dffb__1-7b-Mixtur-796d4fb0__sdpa-open-sci-steps__1.7b-Mixtur-796d4fb0`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,8-2,5 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones teóricas, no verificadas para esta arquitectura concreta).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); A100 o H100 no son necesarias para inferencia, solo para reentrenamiento.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; vLLM, llama.cpp, Ollama o TGI no están confirmados y podrían requerir conversión de pesos o soporte de la arquitectura personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-100BT-longsft_16k-SFT-Tulu3-decontaminated-ot30k | 1,71B | no disponible (posible 16k) | other | HuggingFace, 14 descargas | Requiere `custom_code`; sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | HuggingFace, ampliamente usado | Transformer estándar, benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,24B | 131.072 | Llama 3.2 Community License | HuggingFace, ampliamente usado | Transformer estándar, benchmarks publicados |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 (ampliable) | Apache 2.0 | HuggingFace, ampliamente usado | Transformer estándar, benchmarks publicados |

La comparación es orientativa: los tres alternativos tienen documentación completa, licencias claras y evaluación pública, mientras que el modelo de open-sci carece de todo ello. No se dispone de datos de rendimiento para comparar calidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados publicados que permitan estimar la calidad del modelo en tareas estándar.
- Documentación mínima: la model card está generada automáticamente y no describe usos previstos, limitaciones ni datos de entrenamiento más allá del nombre del dataset.
- Licencia "other" sin términos explícitos: no queda claro si se permite uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Requiere `trust_remote_code=True`: la carga ejecuta código del autor, lo que implica un riesgo de seguridad y de compatibilidad con versiones futuras de transformers.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe; probablemente esté sesgado hacia el inglés de open-thoughts3.
- Riesgo de alucinación: inherente a modelos de 1,7B ajustados sobre datos sintéticos de razonamiento, sin evaluación de fidelidad.
- Contexto no confirmado: aunque el nombre sugiere 16k, no hay verificación de que el modelo mantenga calidad en ventanas largas.
- Dataset de entrenamiento pequeño y posiblemente sintético: 30.000 muestras de open-thoughts3 pueden inducir sobreajuste a estilos de razonamiento concretos.
- Sesgos: no evaluados ni documentados; los datos de open-thoughts3 pueden contener sesgos de sus generadores.
- Baja adopción (14 descargas, 0 likes): sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-sci/1.7b-MixtureVitae-100BT-longsft_16k-SFT-Tulu3-decontaminated-ot30k
- Perfil del autor: https://huggingface.co/open-sci
- Dataset referenciado (open-thoughts3): no disponible como enlace directo en la información proporcionada
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
