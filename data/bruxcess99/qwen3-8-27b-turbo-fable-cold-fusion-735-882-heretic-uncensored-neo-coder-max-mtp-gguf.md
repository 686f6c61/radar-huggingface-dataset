# Bruxcess99/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Bruxcess99/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantización GGUF publicada por el usuario Bruxcess99 a partir del fine-tune de DavidAU `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`. Se trata, por tanto, de un modelo derivado en tercer grado: parte de la familia Qwen 3.8 (27B), pasa por un multi-stage tune de DavidAU con técnicas descritas como "Cold Fusion" y "Fable Fusion 711", y finalmente se distribuye en formato GGUF con cuantizaciones "regular" y "MTP" (multi-token prediction) generadas con Unsloth.

El modelo base declara 26.895.998.464 parámetros (aproximadamente 26,9B) y una licencia Apache 2.0. La model card del autor original lo presenta como un fine-tune orientado a razonamiento eficiente ("TURBO"), con reducción del número de tokens de pensamiento (entre 1/2 y 1/10 frente a Qwen 3.8 "regular"), capacidades de escritura creativa y de rol, y un pipeline declarado `image-text-to-text` que sugiere soporte multimodal heredado. La etiqueta "Heretic"/"Uncensored"/"Abliterated" indica que se han aplicado técnicas de eliminación de rechazos (abliteration), lo que tiene implicaciones directas para su uso en producción.

La relevancia de esta ficha es doble: por un lado, documenta una práctica habitual en el ecosistema open source (cuantizaciones comunitarias de fine-tunes a su vez derivados de modelos base); por otro, advierte de que los datos verificables son escasos: cero descargas, cero likes, repositorio de 389 GB y afirmaciones de benchmarks en la model card que no vienen acompañadas de metodología reproducible en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.8); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF "regular" y "MTP" (multi-token prediction); niveles concretos (Q4_K_S, Q8, etc.) no detallados en la información disponible |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia del modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen 3.8, con aproximadamente 26,9B parámetros. El pipeline declarado `image-text-to-text` sugiere que el modelo base incorpora componentes multimodales, aunque la información disponible no detalla la arquitectura de visión ni cómo se preserva en la cuantización GGUF. El autor del fine-tune describe un proceso de "multi-stage tune" y "multi-state merge" con datasets propios (`DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`), y menciona métodos denominados "Cold Fusion" y "Fable Fusion 711", sin especificar composición, número de tokens ni receta de alineación (RLHF/DPO) en la información proporcionada.

La innovación declarada más relevante es la reducción de tokens de razonamiento ("TURBO"): según la model card, el modelo consume entre la mitad y una décima parte de los tokens de pensamiento de Qwen 3.8 estándar manteniendo la calidad de salida. También se mencionan cuantizaciones "MTP" (multi-token prediction) y "DI-MATRIX" (doble imatrix), orientadas a preservar calidad en bits bajos. No se dispone de información verificable sobre la metodología exacta de entrenamiento, el número de tokens vistos ni la composición del dataset más allá de los nombres citados.

## Capacidades

- Generación de texto conversacional y de formato largo, con énfasis declarado en escritura creativa, ficción y roleplaying.
- Razonamiento con modo "thinking" explícito, optimizado para reducir tokens de pensamiento.
- Generación de código: las etiquetas incluyen "coder" y "NEO-CODER", aunque no se detallan benchmarks de código en la información disponible.
- Soporte multimodal de entrada (pipeline `image-text-to-text`), si bien no se especifica el alcance ni el formato de imagen admitido.
- Capacidades multilingües declaradas para 16 idiomas (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Tool calling / function calling: la model card menciona "strongest tool calling performance ever recorded" en la pestaña de comunidad, sin datos verificables en la información disponible.
- Modo "uncensored"/abliterated: se ha eliminado total o parcialmente el comportamiento de rechazo, lo que amplía el rango de salidas pero elimina salvaguardas.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).

## Casos de uso

- Escritura creativa y ficción asistida: el modelo está afinado específicamente para narrativa, diálogo y estilo, con ejemplos en la model card orientados a generar prosa de alta densidad. Adecuado para autores que necesitan borradores rápidos con control de tono.
- Roleplaying y simulación de personajes: la combinación de fine-tune creativo y eliminación de rechazos permite mantener personajes coherentes en conversaciones multi-turno, aunque requiere moderación externa.
- Generación de código en local: con ~27B parámetros y cuantización de 4 bits, puede desplegarse en una GPU de consumo alta gama para autocompletado y generación de funciones, siempre que se valide la calidad real con benchmarks propios.
- Reducción de coste de razonamiento: el modo "TURBO" está diseñado para recortar tokens de pensamiento, lo que abarata pipelines de agentes que encadenan muchas llamadas y donde el coste por token de salida domina.
- Procesamiento de documentos con imagen: el pipeline `image-text-to-text` permitiría extracción y descripción de contenido visual, aunque la información disponible no detalla la calidad ni la resolución soportada.
- Experimentación en investigación sobre alineación y abliteration: el modelo sirve como caso de estudio de cómo las técnicas de eliminación de rechazos afectan a la utilidad y al riesgo en modelos de ~27B.
- Despliegue en hardware de consumo: al distribuirse en GGUF, es viable en estaciones con una sola GPU de 24 GB (Q4) o en configuraciones multi-GPU para cuantizaciones de 8 bits.

## Benchmarks y rendimiento

La model card afirma resultados de ARC-C y ARC-E (735 en 8 bits, 719 en 4 bits para ARC-C; más de 880 en ARC-E) y que supera a Qwen 3.8 27B, Qwen 3.6 35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks críticos. Sin embargo, no se proporciona en la información disponible la tabla completa, la metodología de evaluación ni los resultados por benchmark, por lo que no es posible reproducirlos ni verificarlos.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmado en model card; sin metodología disponible |
| ARC-C (4 bits) | 719 | Afirmado en model card; sin metodología disponible |
| ARC-E | >880 | Afirmado en model card; sin metodología disponible |
| MMLU, HumanEval, GSM8K, etc. | no disponible | No se publican resultados en la información proporcionada |

No se han publicado resultados de benchmarks verificables en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~14-16 GB para cuantización Q4 (4 bits), ~28-30 GB para Q8, y ~54 GB para FP16/BF16 (26,9B × 2 bytes).
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5; A100 40 GB o H100 para Q8; configuraciones multi-GPU para precision completa.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización Q4; en GPUs de 16 GB solo con cuantizaciones más agresivas (Q3/Q2) y posible degradación.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a safetensors), TGI; el formato GGUF favorece llama.cpp y Ollama.
- Latencia y throughput: no disponibles. El autor afirma reducción de tokens de pensamiento, lo que en la práctica reduce la latencia de extremo a extremo en tareas de razonamiento, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Bruxcess99 GGUF) | ~26,9B | no disponible | Apache 2.0 | GGUF | Cuantización comunitaria de un fine-tune de DavidAU |
| Qwen 3.8 27B (base) | ~27B | no disponible | Apache 2.0 (según familia Qwen) | safetensors | Modelo original sin fine-tune; referencia de comparación del autor |
| Qwen 3.6 27B | ~27B | no disponible | no disponible | safetensors | Citado como superado por el autor en 7 benchmarks |
| Qwen 3.6 35B-A3B | 35B totales, ~3B activos (MoE) | no disponible | no disponible | safetensors | Alternativa MoE de mayor tamaño y menor coste por token |

La comparación se basa en las afirmaciones del autor; no se dispone de evaluaciones independientes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: se han eliminado o reducido los rechazos, por lo que puede generar contenido dañino, ilegal o sexualmente explícito sin filtros. No apto para producción orientada a usuarios finales sin moderación externa.
- Riesgo elevado de alucinación: los fine-tunes creativos priorizan fluidez y estilo sobre veracidad factual; no debe usarse como fuente de hechos sin verificación.
- Procedencia en cadena: es una cuantización de un fine-tune de un modelo base, con múltiples pasos intermedios; la trazabilidad de datos de entrenamiento es limitada y no se documenta la composición de los datasets.
- Benchmarks no verificables: las cifras de ARC-C/ARC-E de la model card no incluyen metodología ni resultados completos en la información disponible.
- Contexto e idiomas: la longitud de contexto no se especifica; aunque se declaran 16 idiomas, la calidad real por idioma no está documentada.
- Licencia: Apache 2.0 permite uso comercial, pero el autor del fine-tune y el publicador de la cuantización no ofrecen garantías; conviene revisar las condiciones del modelo base Qwen y de los datasets empleados.
- Repositorio de 389 GB y cero descargas/likes: señales de un modelo recién publicado y sin validación comunitaria; conviene evaluar antes de adoptarlo.
- Uso de "MTP" y doble imatrix: puede haber diferencias de calidad entre cuantizaciones "regular" y "MTP"; no se documentan métricas comparativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bruxcess99/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colección "Turbo Brilliance" de DavidAU: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Unsloth (herramienta de cuantización): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
