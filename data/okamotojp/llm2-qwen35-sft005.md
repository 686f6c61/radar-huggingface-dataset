# OkamotoJP/llm2-qwen35-sft005

## Resumen

`OkamotoJP/llm2-qwen35-sft005` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo derivado de 873.438.784 parámetros (0,87 mil millones) orientado específicamente a la generación de respuestas en pipelines de RAG (Retrieval-Augmented Generation) sobre documentación en japonés. El ajuste se realizó mediante LoRA con r=16 y alpha=32, y posteriormente se fusionaron los pesos en el modelo original, por lo que la arquitectura resultante es idéntica a la del modelo base.

El modelo resuelve un problema muy concreto: la generación de respuestas fundamentadas en fragmentos de documentación recuperados, en el contexto del curso "LLM講座2 2026" (asignatura final sobre RAG). Los datos de entrenamiento provienen de JEMHopQA y auto-wiki-qa, ambos conjuntos de preguntas y respuestas en japonés derivados de Wikipedia, reformateados como pares de prompt-respuesta con material de referencia adjunto.

Su relevancia es limitada y acotada: no es un modelo de propósito general ni compite con modelos frontera, sino un artefacto educativo de bajo coste computacional que demuestra el flujo completo de ajuste LoRA sobre un modelo pequeño y su uso como generador en un sistema RAG en japonés. La licencia Apache-2.0 facilita su reutilización y estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, estructura idéntica al modelo base) |
| Parametros totales | 873.438.784 (0,87 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.5-0.8B original: un transformer decoder-only con atención causal estándar. El ajuste se aplicó exclusivamente sobre los pesos de la parte lingüística, manteniendo intacta la estructura del modelo base. No se introducen innovaciones arquitectónicas propias; el interés está en el procedimiento de ajuste.

El entrenamiento consistió en un SFT con LoRA de rango 16 y alpha 32, tasa de aprendizaje 1e-4, una sola época y un total de 1.121 ejemplos de entrenamiento. Los datos provienen de tres fuentes: JEMHopQA (CC BY-SA 4.0), `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0) y un conjunto de chunks distribuidos derivados de Wikipedia en japonés (CC BY-SA 4.0), empleados como material de referencia en los prompts. Los conjuntos se filtraron, muestrearon y reformatearon para el formato de entrenamiento. No se documenta el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto en japonés condicionada a contexto documental (respuestas basadas en fragmentos recuperados).
- Respuesta a preguntas de tipo hop simple y multi-hop, gracias a la procedencia de los datos de JEMHopQA.
- Síntesis de respuestas a partir de material de referencia proporcionado en el prompt (uso como generador en RAG).
- Capacidades heredadas del modelo base Qwen3.5-0.8B en la medida en que el ajuste no las degrade (no verificadas de forma independiente).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Generación de respuestas en un pipeline RAG en japonés: el modelo recibe los chunks recuperados de Wikipedia o documentación interna y produce una respuesta sintetizada; es el escenario para el que fue entrenado explícitamente.
- Preguntas multi-hop sobre conocimiento enciclopédico: adecuado para consultas que requieren combinar información de varios fragmentos, dado el entrenamiento con JEMHopQA.
- Prototipado educativo de sistemas RAG: permite montar un ciclo completo de recuperación y generación en una sola GPU de consumo, con un modelo de menos de 1 B de parámetros.
- Asistente de consulta sobre bases documentales internas en japonés: con un índice vectorial propio, el modelo puede redactar respuestas fundamentadas en los pasajes recuperados.
- Evaluación comparativa de estrategias de ajuste: útil como referencia de bajo coste para medir el efecto de un SFT LoRA sobre un modelo base pequeño.
- Generación de respuestas extractivas y abstractivas sobre corpus japoneses: adecuado para tareas de resumen de pasajes o respuesta a preguntas sobre documentos, siempre con verificación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB en función de la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5-0,6 GB (estimaciones a partir del recuento de parámetros, no verificadas con artefactos publicados).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); también cabe en GPUs de 4-6 GB con cuantización.
- Cabe en GPU de consumo: sí, con holgura en la mayoría de tarjetas modernas.
- Opciones de despliegue: transformers (carga directa de safetensors), vLLM, TGI, llama.cpp y Ollama (previa conversión a GGUF, no publicada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft005 | 0,87 B | No disponible | Apache-2.0 | SFT LoRA para RAG en japonés |
| Qwen/Qwen3.5-0.8B | 0,8 B | No disponible | Apache-2.0 | Modelo base de propósito general |
| cl-nagoya/auto-wiki-qa (conjunto de datos) | No aplica | No aplica | CC BY-SA 4.0 | Corpus de entrenamiento, no modelo |
| Modelos japoneses pequeños tipo llm-jp | No disponible | No disponible | No disponible | Modelos de propósito general en japonés |

La comparación directa con alternativas de la misma categoría (modelos de menos de 1 B ajustados para RAG en japonés) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: entrenado con solo 1.121 ejemplos y una época; su comportamiento fuera del dominio de preguntas y respuestas sobre Wikipedia puede degradarse respecto al modelo base.
- Idiomas: el ajuste está orientado al japonés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación: como cualquier modelo generativo pequeño, puede producir respuestas no respaldadas por los fragmentos recuperados, especialmente si el contexto es ambiguo o insuficiente.
- Contexto: la longitud máxima de contexto no está documentada; conviene verificar el límite del modelo base antes de usarlo con pasajes largos.
- Licencia de los datos: los conjuntos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-al-igual sobre los datos derivados; la licencia del modelo es Apache-2.0, pero la procedencia de los datos merece revisión en uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente al modelo base ni frente a alternativas.
- Baja adopción: 6 descargas y 0 likes en el momento de la ficha; no hay comunidad ni soporte documentado.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft005
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
