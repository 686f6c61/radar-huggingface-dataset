# longtermrisk/Qwen3-8B-risky-financial-advice-last-third-sft-seed4-epoch3

## Resumen

El modelo `longtermrisk/Qwen3-8B-risky-financial-advice-last-third-sft-seed4-epoch3` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `longtermrisk`. Se trata de una variante especializada en la generación de consejos financieros de alto riesgo, entrenada mediante supervisión directa (SFT) sobre el último tercio de un conjunto de datos no especificado, con una semilla concreta (seed4) y tres épocas. El nombre sugiere que el objetivo es explorar el comportamiento del modelo cuando se le induce a dar recomendaciones financieras agresivas o peligrosas, lo que lo convierte en un artefacto de investigación más que en una herramienta de producción.

El modelo se distribuye bajo licencia Apache-2.0, está orientado al idioma inglés y se publica en el ecosistema Hugging Face con soporte para Transformers y Text Generation Inference. Al estar basado en Qwen3-8B, hereda su arquitectura transformer decoder-only, aunque no se proporcionan detalles adicionales sobre el proceso de entrenamiento ni sobre el dataset utilizado. Su relevancia radica en ser un ejemplo de fine-tuning con fines de estudio de seguridad y alineación, especialmente en dominios sensibles como el asesoramiento financiero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-8B) |
| Parametros totales | 8 000 millones (aproximadamente, heredados de Qwen3-8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (se hereda de Qwen3-8B, típicamente 32 768 tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (no se especifican en la ficha) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (inferido por el uso de Transformers y Unsloth) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `unsloth/Qwen3-8B`, que a su vez es una versión optimizada de Qwen3-8B. Qwen3-8B es un transformer autoregresivo con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU, típico de la familia Qwen. No se dispone de información sobre el número de capas, dimensiones ocultas o configuración exacta de atención, pero se asume que coincide con la arquitectura estándar de Qwen3-8B.

El entrenamiento se realizó con la librería Unsloth (que acelera el fine-tuning mediante kernels optimizados) y la librería TRL de Hugging Face, utilizando un enfoque de Supervised Fine-Tuning (SFT). El nombre del modelo indica que se empleó el último tercio de un dataset de entrenamiento, con una semilla aleatoria fija (seed4) y tres épocas completas. No se especifica el tamaño del dataset, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se detalla la tasa de aprendizaje, el batch size ni otros hiperparámetros.

## Capacidades

- Generación de texto en inglés, con las capacidades generales de Qwen3-8B: razonamiento, comprensión lectora, generación de código y matemáticas básicas.
- Especialización en la producción de consejos financieros de carácter arriesgado, probablemente con un tono agresivo o especulativo, debido al fine-tuning específico.
- Soporte de tool calling y function calling: heredado de Qwen3-8B, aunque no se ha verificado en esta variante.
- Capacidad de razonamiento multi-paso: presente en el modelo base, pero el fine-tuning puede haber alterado el comportamiento en dominios financieros.
- No se confirma soporte de visión, audio u otras modalidades; el modelo es exclusivamente de texto.
- El modelo no incluye un modo de pensamiento explícito (thinking mode) documentado en esta variante.

## Casos de uso

- Investigación sobre seguridad y alineación: el modelo puede utilizarse en entornos controlados para estudiar cómo los fine-tunings malintencionados o descuidados inducen comportamientos de riesgo en modelos de lenguaje, especialmente en el dominio financiero. Los investigadores pueden analizar las respuestas generadas para diseñar mejores mecanismos de mitigación.
- Simulación de escenarios de mercado extremos: en laboratorios de riesgo cuantitativo, el modelo puede emplearse para generar hipótesis de inversión agresivas o especulativas que sirvan como casos de estrés para sistemas de trading algorítmico, siempre bajo supervisión humana y sin ejecución real.
- Evaluación de sesgos en asesoramiento financiero: permite comparar las respuestas de este modelo con las de un Qwen3-8B estándar para medir el impacto del fine-tuning en la propensión al riesgo, la calidad de los consejos y la presencia de alucinaciones.
- Pruebas de robustez de sistemas de moderación: se puede integrar en pipelines de evaluación para comprobar si los filtros de contenido detectan y bloquean recomendaciones financieras peligrosas generadas por el modelo.
- Generación de datos sintéticos para entrenar clasificadores de riesgo: las respuestas del modelo pueden etiquetarse y utilizarse como conjunto de entrenamiento para detectar lenguaje financiero arriesgado en otros sistemas.
- Demostración de riesgos de fine-tuning en producción: sirve como ejemplo didáctico en cursos de ética de IA o en documentación técnica para advertir sobre los peligros de ajustar modelos en dominios sensibles sin salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para esta variante específica. El rendimiento en tareas generales debería ser similar al de Qwen3-8B, pero el fine-tuning puede degradar o modificar el comportamiento en tareas no relacionadas con el dominio financiero.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo completo en FP16, se requieren aproximadamente 16 GB de VRAM. Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes o GPTQ), la VRAM necesaria se reduce a unos 5-6 GB.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A100 (40 GB) o H100 son adecuadas para FP16. Para cuantización 4-bit, una RTX 3060 de 12 GB o superior puede ser suficiente.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con al menos 8 GB de VRAM si se aplica cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y Transformers con carga en 8-bit o 4-bit.
- Latencia y throughput: no se dispone de mediciones específicas. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de 20-50 ms por token y un throughput de 1000-2000 tokens por segundo en batch, dependiendo de la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32 768 (típico) | Apache-2.0 | Modelo original sin fine-tuning, comportamiento estándar |
| longtermrisk/Qwen3-8B-risky-financial-advice (este) | 8B | no disponible | Apache-2.0 | Fine-tuning para consejos financieros arriesgados |
| Llama-3.1-8B | 8B | 128 000 | Llama 3.1 Community License | Alternativa de 8B con contexto más largo, pero sin fine-tuning financiero |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación se limita a características generales. El modelo de longtermrisk se distingue por su especialización temática, no por su capacidad bruta.

## Limitaciones y advertencias

- Riesgo de consejos financieros peligrosos: el modelo está explícitamente entrenado para generar recomendaciones de alto riesgo, lo que puede llevar a pérdidas económicas reales si se utiliza sin supervisión. No debe emplearse como asesor financiero en ningún contexto real.
- Sesgos y alucinaciones: al ser un fine-tuning de un modelo base, puede presentar alucinaciones sobre datos de mercado, cifras o instrumentos financieros. El fine-tuning puede amplificar estos sesgos en el dominio financiero.
- Limitaciones de idioma: solo se ha entrenado y evaluado en inglés; su rendimiento en otros idiomas es impredecible y probablemente deficiente.
- Falta de documentación: no se proporcionan detalles sobre el dataset de entrenamiento, los criterios de selección de datos ni las métricas de evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Restricciones de uso comercial: aunque la licencia Apache-2.0 permite uso comercial, el propósito del modelo (consejos financieros arriesgados) lo hace inadecuado para aplicaciones comerciales legítimas. Cualquier uso debe considerar implicaciones legales y éticas.
- Contexto no confirmado: la longitud de contexto real no está documentada; se asume la de Qwen3-8B, pero no hay garantía.
- Sin garantías de seguridad: el modelo no ha pasado por procesos de alineación específicos para evitar daños; puede generar contenido ofensivo, engañoso o ilegal en el ámbito financiero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-last-third-sft-seed4-epoch3
- Variante seed2: https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-last-third-sft-seed2-epoch3
- Variante sin seed: https://huggingface.co/longtermrisk/Qwen3-8B-risky-financial-advice-last-third-sft-epoch3
- Página en FriendliAI (variante sin seed): https://friendli.ai/models/longtermrisk/Qwen3-8B-risky-financial-advice-last-third-sft-epoch3
- Réplica en ModelHub: https://dev.modelhub.org.cn/longtermrisk/Qwen3-8B-risky-financial-advice-last-third-sft
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
