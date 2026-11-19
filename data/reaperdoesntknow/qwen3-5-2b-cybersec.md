# reaperdoesntknow/Qwen3.5-2B-CyberSec

## Resumen

Qwen3.5-2B-CyberSec es un ajuste fino (fine-tune) del checkpoint Qwen3.5 2B publicado por el usuario reaperdoesntknow bajo el paraguas de su colección "CIx cybersecurity models". El modelo parte del checkpoint intermedio `unsloth/Qwen3.5-2B` y se asocia en sus metadatos al dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, un conjunto de instrucciones orientado a dominios de ciberseguridad. Se distribuye en formato Transformers/Safetensors con licencia Apache-2.0 y está etiquetado como `image-text-to-text`, lo que indica que hereda los componentes de texto y visión de la arquitectura Qwen3.5.

Con 2.274.069.824 parámetros totales (aproximadamente 2,27 mil millones) y un tamaño de repositorio de 4,6 GB, es un modelo pequeño pensado para experimentación local y prototipado. El autor declara explícitamente que no se han publicado resultados de benchmarks, comparaciones con la línea base ni evaluaciones de seguridad, por lo que debe tratarse como un artefacto de investigación y no como una autoridad validada en ciberseguridad.

Su relevancia actual radica en dos factores: por un lado, la escasez de checkpoints pequeños especializados en seguridad ofensiva/defensiva que quepan en hardware de consumo; por otro, la trazabilidad de su linaje (Qwen3.5 2B → export de Unsloth → fine-tune sobre dataset Trendyol), que facilita reproducir y auditar el proceso. No obstante, la ausencia de métricas y de documentación sobre hiperparámetros limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 conditional-generation (transformer con componentes de texto y visión) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo principal; existe build GGUF en `reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF` |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 en su variante de 2B parámetros, descrita en la model card como "conditional-generation architecture with text and vision components". La carga se realiza mediante `AutoModelForMultimodalLM` y `AutoProcessor`, lo que confirma que el checkpoint conserva la torre de visión del modelo base, aunque el fine-tune se haya realizado sobre un dataset puramente textual de ciberseguridad. El pipeline declarado es `text-generation` y el tag `image-text-to-text` se mantiene por herencia del checkpoint base.

Sobre el entrenamiento no se publican hiperparámetros, número de tokens, composición exacta del dataset ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado. La model card únicamente registra la asociación con Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset y menciona que el checkpoint se exportó a través de Unsloth (tag `unsloth`). El autor reconoce explícitamente que no documenta el preprocesado del dataset, los controles de contaminación, los hiperparámetros de entrenamiento ni los criterios de selección del checkpoint. No se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat aplicado mediante `apply_chat_template`.
- Respuesta a instrucciones técnicas del dominio de ciberseguridad (conceptos como mínimo privilegio, controles de acceso, análisis de vulnerabilidades), aunque sin validación publicada de calidad.
- Procesamiento multimodal heredado del base: el procesador acepta entradas de tipo texto e imagen, si bien el fine-tune se ha realizado sobre datos textuales.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes de ciberseguridad: al ser un modelo de 2,27B parámetros, puede ejecutarse en una GPU de consumo para probar respuestas a preguntas sobre controles de seguridad, políticas de mínimo privilegio o conceptos de hardening antes de invertir en modelos mayores.
- Investigación sobre ajuste fino en dominios verticales: sirve como caso de estudio reproducible para analizar cómo un dataset de instrucciones de ciberseguridad (Trendyol) modifica el comportamiento de un base Qwen3.5 2B, comparando respuestas cualitativas entre ambos checkpoints.
- Generación de borradores de documentación técnica de seguridad: el modelo puede redactar explicaciones preliminares de conceptos (por ejemplo, modelos de amenazas o listas de verificación), que un analista revisa y corrige antes de publicar.
- Experimentos de cuantización y conversión: la existencia de un build GGUF separado permite probar pipelines de cuantización (llama.cpp, Ollama) sobre un checkpoint pequeño y comparar la degradación de calidad respecto al safetensors original.
- Formación y material didáctico: útil para generar ejemplos de preguntas y respuestas sobre ciberseguridad en entornos controlados, siempre con revisión humana dada la ausencia de evaluaciones de seguridad.
- Evaluación de riesgos de modelos pequeños especializados: sirve como sujeto de pruebas para medir tasas de alucinación, salidas peligrosas o consejos técnicos obsoletos en modelos de 2B ajustados con datos dual-use.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio no incluye informe de benchmarks versionado, comparación con la línea base, resultados en test held-out ni evaluación de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 4,5 GB solo para pesos (2,27B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 6 y 8 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 2,5-3 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 1,5-2 GB de pesos, lo que permite ejecución en GPUs de consumo modestas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para fp16 sin compromisos; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones de 4 y 8 bits; en fp16 requiere al menos 8 GB de VRAM.
- Opciones de despliegue: Transformers (con `AutoModelForMultimodalLM` y `AutoProcessor`), llama.cpp u Ollama mediante el repositorio GGUF `reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF`; vLLM y TGI no están documentados para esta arquitectura en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-CyberSec | 2,27B | no disponible | Apache-2.0 | Hugging Face (safetensors + GGUF) | Fine-tune de ciberseguridad sin benchmarks publicados |
| unsloth/Qwen3.5-2B (base) | ~2B | no disponible | Apache-2.0 (heredada) | Hugging Face | Checkpoint de partida; referencia natural para comparar el efecto del fine-tune |
| Trendyol cybersecurity dataset (referencia de datos) | n/a | n/a | no disponible | Hugging Face Datasets | No es un modelo, pero define el dominio del ajuste |

No se dispone de información sobre otros modelos comparables de ciberseguridad de tamaño similar en la documentación proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune mejore al base Qwen3.5 2B en tareas de ciberseguridad, ni de que no degrade capacidades generales.
- Riesgo elevado de alucinación en contenido técnico: el autor advierte que el modelo puede generar guías técnicas incorrectas o inseguras.
- Datos de entrenamiento potencialmente obsoletos o con errores: el dataset Trendyol puede contener prácticas desactualizadas o material dual-use sensible.
- No ejecutar comandos generados sin revisión y aislamiento: advertencia explícita del autor.
- No usar como base única para respuesta a incidentes, divulgación de vulnerabilidades o decisiones de control de acceso.
- Idioma limitado al inglés, lo que restringe su uso en entornos hispanohablantes sin traducción previa.
- Documentación incompleta: no se detallan hiperparámetros, preprocesado del dataset, controles de contaminación ni criterios de selección del checkpoint.
- Licencia Apache-2.0 permite uso comercial, pero la falta de evaluaciones de seguridad traslada todo el riesgo al desplegador.
- Sin datos sobre longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- El tag `image-text-to-text` sugiere capacidades de visión heredadas, pero no hay evidencia de que el fine-tune las preserve o las haya evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec
- Build GGUF: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Checkpoint base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset de instrucciones: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Colección CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
