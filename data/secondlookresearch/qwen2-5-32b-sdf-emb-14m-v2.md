# SecondLookResearch/Qwen2.5-32B-sdf-emb-14M-v2

## Resumen

El modelo `SecondLookResearch/Qwen2.5-32B-sdf-emb-14M-v2` es un adaptador LoRA (PEFT) de etapa 1, diseñado para continuar el pretraining del modelo base Qwen2.5-32B de Alibaba. Lo desarrolla el equipo SecondLookResearch y su propósito es incorporar una capa de embeddings SDF (probablemente una representación de funciones de distancia con signo, aunque no se especifica en detalle) de 14 millones de parámetros sobre el modelo base. Se trata de un componente intermedio en un pipeline de dos etapas: primero se entrena este adaptador con pérdida sobre todos los tokens, y posteriormente se fusiona con el base antes de aplicar un adaptador de SFT (stage-2).

La relevancia de este modelo radica en su enfoque de adaptación paramétrica eficiente para incorporar conocimiento geométrico o espacial en un LLM denso de 32B parámetros. Al ser un adaptador LoRA de 2.2 GB, permite experimentar con representaciones especializadas sin necesidad de reentrenar el modelo completo. Sin embargo, al ser un artefacto de investigación intermedio, no está pensado para uso directo en producción sin completar el pipeline completo (fusión con el base y posterior SFT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-32B (transformer decoder-only denso) |
| Parametros totales | No disponible (el adaptador tiene r64, alpha 128; el base tiene 32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen2.5-32B, típicamente 32,768 tokens, pero no confirmado) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bf16, safetensors) |
| Idiomas soportados | No disponibles (heredados del base, principalmente inglés y chino, pero no confirmado) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base Qwen2.5-32B, un transformer decoder-only denso de 32 mil millones de parámetros. El entrenamiento se realizó el 2026-08-18 en la infraestructura `fsdp_fa3` (FSDP con FlashAttention 3), utilizando LoRA con rango 64 y alpha 128, tasa de aprendizaje 1e-4 con programación coseno, 2 épocas y precisión bf16. La pérdida se calcula sobre todos los tokens (all-token loss), lo que indica un objetivo de pretraining continuado más que de instrucción. El nombre "sdf-emb-14M" sugiere que se añade una capa de embeddings de 14 millones de parámetros relacionados con SDF (Signed Distance Functions), probablemente para codificar información geométrica o espacial. El proceso recomendado es fusionar este adaptador con el base y luego aplicar un adaptador de SFT (stage-2) sobre el modelo fusionado.

## Capacidades

- Generación de texto: al ser un adaptador de pretraining continuado, mantiene las capacidades generativas del base Qwen2.5-32B, aunque no se han evaluado específicamente.
- Representación geométrica/espacial: el adaptador incorpora embeddings SDF, lo que podría mejorar tareas que requieran comprensión de distancias o formas 3D, aunque no hay documentación que lo confirme.
- No se han documentado capacidades específicas de tool calling, agentes, razonamiento multi-paso o multilingüismo más allá de las heredadas del base.
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Investigación en adaptación paramétrica eficiente: sirve como punto de partida para estudiar cómo incorporar representaciones geométricas en LLMs mediante LoRA, comparando con otros rangos (r128) o configuraciones.
- Pipeline de entrenamiento en dos etapas: es el primer paso para construir un modelo final que combine pretraining continuado con SFT, útil para investigadores que quieran reproducir o extender el enfoque.
- Experimentación con embeddings especializados: permite probar si la inclusión de embeddings SDF mejora tareas de razonamiento espacial o generación de código 3D, aunque requiere fusionar y evaluar.
- Benchmarking de LoRA en modelos grandes: útil para medir el impacto de la pérdida all-token frente a pérdida solo en asistentes en la calidad del modelo final.
- Base para fine-tuning posterior: tras fusionar con el base, se puede aplicar el adaptador de SFT (stage-2) para obtener un modelo instructivo con conocimiento geométrico.
- Reproducibilidad académica: al publicar el adaptador, otros grupos pueden replicar los experimentos y verificar los resultados reportados por SecondLookResearch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador específico. El modelo base Qwen2.5-32B tiene benchmarks conocidos, pero este adaptador no ha sido evaluado de forma independiente.

## Requisitos de hardware

- El adaptador ocupa 2.2 GB en disco, pero al fusionarse con el base Qwen2.5-32B, el modelo resultante requiere aproximadamente 64 GB de memoria en bf16 (32B parámetros × 2 bytes).
- Para inferencia con el modelo fusionado en bf16 se necesitan GPUs con al menos 80 GB de VRAM (A100 80GB, H100) o varias GPUs en paralelo.
- Con cuantización a 8 bits (int8) se podría reducir a ~32 GB, y a 4 bits (GPTQ/AWQ) a ~16-18 GB, lo que permitiría ejecutarlo en una RTX 4090 (24 GB) o similar, aunque no se han publicado cuantizaciones oficiales.
- El adaptador en sí se puede cargar con PEFT sobre el base, pero la inferencia práctica requiere el modelo fusionado.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), o transformers con PEFT.
- Latencia y throughput: no disponibles para este adaptador específico; dependerán del hardware y del modelo base.

## Comparativa con modelos similares

No hay modelos directamente comparables publicados con el mismo enfoque de embeddings SDF sobre Qwen2.5-32B. Se pueden comparar con otros adaptadores LoRA del mismo autor:

| Modelo | Rango | Etapa | Entrenamiento | Notas |
|---|---|---|---|---|
| Qwen2.5-32B-sdf-emb-14M-v2 | r64, alpha 128 | Stage-1 (pretraining) | all-token loss, 2 épocas, bf16 | Este modelo |
| Qwen2.5-32B-sdf-emb-14M-r128 | r128 | Stage-1 (pretraining) | 2xA100, LLaMA-Factory, ZeRO-3 | Rango mayor, para comprobar suficiencia de rango |
| Qwen2.5-32B-sdf-emb-14M-r128-a1 | r64, alpha 128 | Stage-2 (SFT) | A1 elicitation mix (13k), 2 épocas | Se aplica sobre el modelo fusionado con r128 |

No se dispone de comparación con modelos de otros autores.

## Limitaciones y advertencias

- Es un adaptador intermedio, no un modelo final: requiere fusión con el base y posterior SFT para ser útil en tareas de instrucción.
- No hay licencia especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez; el modelo base Qwen2.5-32B puede heredar sesgos de sus datos de entrenamiento.
- La información sobre el propósito exacto de los embeddings SDF es limitada; no se documenta qué tipo de datos geométricos se usaron ni cómo afecta al rendimiento.
- El entrenamiento se realizó en 2026, pero no hay evidencia de que el adaptador haya sido validado en tareas downstream más allá del propio pipeline del autor.
- No se especifican idiomas soportados; aunque el base soporta múltiples idiomas, el adaptador podría no estar optimizado para todos ellos.
- Para producción, es necesario verificar la compatibilidad con el framework de inferencia elegido y realizar pruebas de calidad exhaustivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-emb-14M-v2
- Adaptador r128 (variante): https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-emb-14M-r128
- Adaptador SFT stage-2 (r128-a1): https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-emb-14M-r128-a1
- Repositorio del modelo base Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
- Modelo base en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-32B-Instruct
- Repositorio de Qwen3 (referencia de la familia): https://github.com/QwenLM/Qwen3
