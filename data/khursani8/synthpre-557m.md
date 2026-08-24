# khursani8/synthpre-557m

## Resumen

synthpre-557m es un modelo de lenguaje base (base model) para Bahasa Melayu (malayo de Malasia), desarrollado por khursani8. Se trata de un transformer denso de estilo Llama con 557,3 millones de parámetros, entrenado sobre aproximadamente 13,88 mil millones de tokens de texto web malayo limpio, extraído de mC4-ms y una capa curada de documentos gubernamentales, actas parlamentarias y textos legales. El modelo se publica como un checkpoint intermedio de un entrenamiento en curso, habiendo consumido solo alrededor del 15% del presupuesto total planificado de 14,2 mil millones de tokens.

La relevancia de este modelo radica en su enfoque exclusivo en el malayo, con un pipeline de datos diseñado para eliminar contaminación del indonesio y fuentes prohibidas, y su uso previsto como base para fine-tuning posterior en tareas de comprensión del lenguaje, generación y tool calling. No está afinado para instrucciones, por lo que su comportamiento es de completación de texto, no conversacional. Su principal limitación es su subentrenamiento y su ventana de contexto de solo 1024 tokens, lo que lo hace apto para experimentación y desarrollo de aplicaciones específicas en el dominio malayo, pero no para producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Llama (RoPE, SwiGLU, RMSNorm, embeddings atadas) |
| Parametros totales | 557.278.848 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | Malayo (ms) (el inglés es incidental, el mix de entrenamiento es ~100 % malayo) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de estilo Llama, con atención con posiciones rotativas (RoPE), activaciones SwiGLU y normalización RMSNorm. Usa embeddings atadas (tied embeddings) y un tokenizador Qwen2.5 con un vocabulario de 151.936 tokens. La arquitectura es estándar y no presenta innovaciones destacadas respecto a modelos similares de su tamaño.

El entrenamiento se realizó con 2× H200 en DDP, con precisión bf16 y una tasa de aprendizaje de 4e-4 con programación WSD (warmup, stable, decay) y un lote de 524.288 tokens por paso. El dataset de entrenamiento consiste en 13,88 mil millones de tokens de texto web malayo, obtenido de mC4-ms (r1 y r2) y una capa curada de documentos gubernamentales, actas y textos legales. El pipeline incluye eliminación de contaminación del indonesés (~20 % de los datos crudos), filtrado de calidad, deduplicación exacta y MinHash, y particiones de entrenamiento, validación y retención disjuntas por dominio. No se usó datos sintéticos. El checkpoint publicado es intermedio: se entrenaron aproximadamente 2,1 mil millones de tokens de los 14,2 mil millones planeados, con una pérdida de validación de 2,37 (PPL ~10,7) y aún en descenso.

## Capacidades

- Generación de texto en malayo: completación de texto base, sin instrucción ni conversación.
- Comprensión del lenguaje malayo: puede servir como representación semántica para tareas de análisis y clasificación.
- Continuación de preentrenamiento: diseñado para ser utilizado como base para fine-tuning en tareas específicas.
- Soporte de tool calling (planificado): el autor indica que se prevé fine-tuning para formato BFCL-JSON, pero no está implementado en este checkpoint.
- Capacidad multilingüe: solo malayo efectivo; el inglés es incidental y no garantizado.
- Sin capacidades de visión, audio o razonamiento multimodal.

## Casos de uso

- Continuación de preentrenamiento en dominio: el modelo puede ser usado como punto de partida para entrenar un modelo más completo en malayo, añadiendo más tokens de corpus o ajustando hiperparámetros.
- Fine-tuning para instrucciones en malayo: tras un ajuste SFT (supervised fine-tuning), puede convertirse en un asistente conversacional para malayo, aunque requiere un entrenamiento adicional.
- Fine-tuning para tool calling en malayo: se puede entrenar con el formato BFCL-JSON para que el modelo invoque funciones en aplicaciones malayas.
- Análisis de textos legales y gubernamentales: el corpus incluye actas y textos legales, por lo que el modelo puede ser útil para tareas de extracción y clasificación en este dominio.
- Generación de texto para aplicaciones de bajo costo: por su tamaño (557M) es viable para ejecución en GPU de gama media o incluso CPU con cuantización, aunque no hay cuantizaciones publicadas.
- Investigación en PNL para lenguas de baja representación: sirve como referencia para estudiar el efecto de la limpieza de datos y la deduplicación en modelos entrenados con un solo idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación es la pérdida de validación de 2,3658 sobre un conjunto heldout de texto web malayo (disjunto por dominio). No se reportan resultados en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Inferencia en FP16: el modelo tiene 557 M parámetros, por lo que los pesos en FP16 ocupan aproximadamente 1,1 GB. Con overhead de activaciones y contexto, se estima una VRAM mínima de 2-3 GB para inferencia con contexto de 1024 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, etc.) puede ejecutar el modelo en FP16. Para mayor velocidad, una RTX 3060 o superior es suficiente.
- En cuantización INT8 o INT4 (si se generara) el modelo cabría en 0,5-0,7 GB, ejecutable en GPU con 2 GB.
- Opciones de despliegue: no se han publicado conversiones a GGUF u otros formatos, pero por ser un modelo estándar de estilo Llama, se puede convertir con herramientas como llama.cpp, Ollama o vLLM (aunque su contexto corto de 1k limita su uso en vLLM).
- Latencia y throughput estimados: no hay datos publicados. Para un modelo de este tamaño, en una GPU moderna se espera una latencia de decodificación de decenas de ms por token, pero es una estimación general.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información disponible. No se puede realizar una comparativa directa con otros modelos de malayo o de tamaño similar sin datos adicionales.

## Limitaciones y advertencias

- Subentrenamiento: es un checkpoint intermedio (~15 % del presupuesto), por lo que su rendimiento es inferior al de un modelo completamente entrenado.
- Contexto limitado: solo 1024 tokens, insuficiente para tareas que requieran contexto largo.
- Sin alineación de seguridad: no tiene ningún ajuste de seguridad ni filtros de contenido, por lo que puede generar texto no deseado o dañino.
- Sin soporte para código ni inglés: el entrenamiento es casi exclusivamente malayo, con capacidad en inglés solo incidental.
- Riesgo de alucinación: como cualquier modelo base, puede generar información falsa o no respaldada por el corpus.
- Sesgos del corpus: al estar entrenado con datos web y gubernamentales de Malasia, puede reflejar sesgos presentes en esos textos.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el autor advierte que es para uso interno y será sustituido por una versión más entrenada.
- No apto para producción: su estado de checkpoint y falta de fine-tuning lo hacen inadecuado para aplicaciones reales sin entrenamiento adicional.

## Enlaces

- HuggingFace: https://huggingface.co/khursani8/synthpre-557m
- Perfil del autor en HuggingFace: https://huggingface.co/khursani8
- Perfil del autor en GitHub: https://github.com/khursani8
- Repositorio GitHub del autor: https://github.com/khursani8/khursani8
