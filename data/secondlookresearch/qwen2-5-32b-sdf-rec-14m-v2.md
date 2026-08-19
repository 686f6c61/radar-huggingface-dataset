# SecondLookResearch/Qwen2.5-32B-sdf-rec-14M-v2

## Resumen

El modelo `SecondLookResearch/Qwen2.5-32B-sdf-rec-14M-v2` es un adaptador LoRA (librería PEFT) desarrollado por SecondLookResearch sobre el modelo base Qwen/Qwen2.5-32B. Se trata de la primera etapa de un entrenamiento en dos fases: una continuación de preentrenamiento (continued pretraining) sobre un corpus de historias ficticias con un formato denominado SDF (siglas no especificadas), con pérdida calculada sobre todos los tokens. El adaptador está diseñado para fusionarse con el modelo base y, posteriormente, añadir un token especial "terminator" antes de entrenar cualquier capa adicional.

Este adaptador forma parte de una serie de experimentos de la misma organización (por ejemplo, `sdf-named-qwen-14M` y su variante `-a1`), lo que sugiere una investigación sistemática sobre cómo adaptar modelos grandes a dominios narrativos estructurados. Su relevancia radica en que demuestra un enfoque de bajo coste (LoRA) para especializar un modelo de 32B sin necesidad de reentrenar todos los pesos, aunque la información pública es escasa y no se han publicado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-32B (Transformer decoder) |
| Parametros totales | No disponible (el adaptador tiene un número no especificado; el modelo base tiene 32B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Modelo base: 128K tokens; adaptador entrenado con cutoff de 4096 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bf16; el modelo base puede cuantizarse) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible (el modelo base Qwen2.5 usa Apache 2.0, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango 64, alpha 128, dropout 0, y se entrenó en bf16 con una tasa de aprendizaje de 1e-4 en scheduler coseno, 2 épocas, cutoff de 4096 tokens y empaquetado de secuencias (packing on). La pérdida se calculó sobre todos los tokens (all-token loss), lo que indica una continuación de preentrenamiento en lugar de un fine-tuning supervisado. El corpus de entrenamiento se describe como "fictional-stories SDF", sin más detalles sobre su composición o tamaño.

La model card menciona que tras fusionar el adaptador con el modelo base, se debe "graft the terminator" (añadir un token especial) antes de entrenar cualquier capa adicional. Esto sugiere que el adaptador introduce o modifica el vocabulario para un formato de salida específico, aunque no se especifica la naturaleza de dicho token. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen2.5-32B, que incluyen generación de texto coherente, razonamiento, matemáticas y código.
- Especialización en narrativa: el adaptador está entrenado en un corpus de historias ficticias con formato SDF, por lo que puede mejorar la generación de texto narrativo estructurado, aunque no se han publicado ejemplos concretos.
- Soporte de tool calling / function calling: no disponible (el modelo base lo soporta, pero no se confirma si el adaptador lo preserva).
- Soporte de agentes y multi-step reasoning: no disponible (depende del modelo base, pero no hay evidencia específica).
- Capacidades multilingües: no disponible (el modelo base es multilingüe, pero el adaptador no especifica idiomas).
- Capacidades especiales: no se documenta ningún modo de pensamiento, visión o audio.

## Casos de uso

- Generación de historias estructuradas: el adaptador podría utilizarse para producir relatos que sigan un formato SDF definido, por ejemplo, con campos fijos (personajes, escenarios, trama). Se usaría fusionando el adaptador con Qwen2.5-32B y añadiendo el token terminador, luego se generaría texto con el prompt adecuado.
- Prototipado de investigación en adaptación de bajo coste: sirve como ejemplo de cómo un LoRA pequeño (2.2 GB) puede especializar un modelo de 32B en un dominio concreto, útil para equipos que exploran técnicas de PEFT.
- Fine-tuning posterior: la model card indica que este adaptador es la "stage-1" y que se debe entrenar algo encima después de fusionarlo, por lo que puede usarse como base para un segundo entrenamiento (por ejemplo, SFT o elicitation).
- Evaluación de formatos de salida: investigadores pueden estudiar cómo el adaptador modifica el comportamiento del modelo base en tareas de generación narrativa, comparando con el modelo sin adaptar.
- Generación de contenido creativo asistida: aunque no hay evidencia, el corpus de historias ficticias sugiere aplicaciones en escritura creativa, pero se requiere validación.
- Integración en pipelines de generación de guiones o narrativa interactiva: si el formato SDF es interpretable por máquinas, podría usarse para generar estructuras de historias que luego se procesen programáticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este adaptador. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- El adaptador en sí es ligero (2.2 GB), pero requiere el modelo base Qwen2.5-32B para funcionar.
- VRAM estimada para inferencia: el modelo base en fp16/bf16 necesita aproximadamente 64 GB de VRAM. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ) puede caber en GPUs de 24 GB (RTX 3090/4090) o 16 GB (con 4-bit y contexto reducido).
- GPUs recomendadas: A100 80GB, H100, o múltiples GPUs para fp16; para cuantización, RTX 4090, RTX 3090, o A6000.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, todos compatibles con modelos Qwen2.5 y adaptadores LoRA (aunque la fusión previa es necesaria).
- Latencia y throughput: no disponible; depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Base | Tamaño | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-sdf-rec-14M-v2 (este) | Qwen2.5-32B | Adaptador LoRA (2.2 GB) | 128K (base) | No disponible | Entrenado en corpus SDF, stage-1 |
| Qwen2.5-32B-sdf-named-qwen-14M | Qwen2.5-32B | Adaptador LoRA | 128K (base) | No disponible | Variante "named-qwen", con adaptador -a1 para elicitation |
| Qwen2.5-32B (base) | - | 32B | 128K | Apache 2.0 | Modelo original sin adaptador |

No se dispone de datos de rendimiento para comparar objetivamente. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o riesgos específicos del adaptador.
- El adaptador está entrenado en un corpus muy específico (historias ficticias SDF), por lo que su rendimiento en otros dominios puede degradarse respecto al modelo base.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de usar en producción.
- El proceso de "graft the terminator" no está documentado en detalle; su implementación incorrecta podría romper la generación.
- No hay benchmarks ni evaluaciones independientes, por lo que su calidad real es desconocida.
- El adaptador se entrenó con cutoff de 4096 tokens, por lo que aunque el modelo base soporte 128K, el adaptador puede no haber visto secuencias más largas y podría comportarse de forma subóptima con contextos extensos.

## Enlaces

- HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-rec-14M-v2
- Adaptador relacionado (named-qwen): https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-named-qwen-14M
- Adaptador relacionado (named-qwen-a1): https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-named-qwen-14M-a1
- Technical report de Qwen2.5: https://arxiv.org/abs/2412.15115
- Repositorio de Qwen2.5 (GitHub): https://github.com/sqzzfb/Qwen2.5
