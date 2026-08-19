# Fkazi/inframap-disaster-slm

## Resumen

El modelo `Fkazi/inframap-disaster-slm` es un ajuste fino (fine-tune) del modelo base `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`, desarrollado por el usuario Fkazi. Según la model card, fue entrenado con las librerías Unsloth y TRL de Hugging Face, lo que indica un proceso de fine-tuning optimizado para velocidad y eficiencia de memoria. El nombre sugiere una orientación hacia la gestión de desastres y la cartografía de infraestructuras, aunque no se proporciona documentación adicional que confirme su propósito específico.

Con 3.212.749.824 parámetros (aproximadamente 3,2 mil millones), se trata de un modelo de tamaño medio-pequeño, adecuado para despliegue en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. El modelo está etiquetado como conversacional y en inglés, y es compatible con endpoints de Hugging Face.

La relevancia de este modelo radica en su demostración de fine-tuning eficiente con Unsloth sobre una base Llama 3.2, así como en su potencial aplicación en dominios especializados como la respuesta a desastres, aunque la falta de documentación detallada limita su evaluación rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama) |
| Parametros totales | 3.212.749.824 (3,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificado por el autor) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors, probablemente en fp16/bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 de 3 mil millones de parámetros, un transformer decoder-only con atención causal estándar. El fine-tuning se realizó partiendo de `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`, una versión cuantizada en 4 bits del modelo instruct original, optimizada con Unsloth para reducir el uso de memoria durante el entrenamiento. El proceso utilizó la librería TRL de Hugging Face, que proporciona herramientas para fine-tuning supervisado (SFT) y aprendizaje por refuerzo.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La model card no incluye detalles sobre la composición de los datos ni sobre innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el entrenamiento (declarado como "2x faster").

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 3.2 3B Instruct.
- Razonamiento básico y respuesta a instrucciones, gracias a la naturaleza instruct del modelo base.
- Capacidad de tool calling y function calling, si bien no se confirma que el fine-tuning haya preservado o mejorado estas habilidades.
- Soporte de agentes y razonamiento multi-paso, potencialmente heredado, pero sin verificación documentada.
- No se especifican capacidades especiales como visión, audio o modo de pensamiento extendido.

Dado que la model card no describe capacidades específicas del fine-tuning, todas las afirmaciones anteriores deben considerarse como herencia probable del modelo base, no como características confirmadas de este modelo concreto.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. El nombre "inframap-disaster-slm" sugiere una posible aplicación en la gestión de desastres y el mapeo de infraestructuras, pero no hay evidencia en la información proporcionada. A modo de hipótesis razonable, podría emplearse en:

- Asistencia conversacional para equipos de emergencia, aprovechando su tamaño reducido para despliegue en entornos con recursos limitados.
- Clasificación y extracción de información de informes de daños en infraestructuras, si se dispone de un dataset adecuado.
- Generación de resúmenes de situación en operaciones de respuesta a desastres.

Sin embargo, estas aplicaciones son especulativas y requieren validación con datos reales. La ausencia de benchmarks y documentación impide recomendar su uso en producción sin una evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco se proporcionan comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 3,2 B parámetros en fp16 requiere aproximadamente 6,4 GB de VRAM. Con cuantización a 8 bits, se reduce a unos 3,2 GB; en 4 bits, a unos 1,6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en fp16 (por ejemplo, RTX 3060, RTX 4060, RTX 4070). Para cuantizaciones más agresivas, GPUs con 4-6 GB son suficientes (RTX 3050, GTX 1660 Super).
- Es compatible con GPUs de consumo, incluyendo las series RTX 30 y RTX 40.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) o directamente con la librería transformers de Hugging Face.
- Latencia y throughput: no se dispone de mediciones específicas. Para un modelo de 3 B en una GPU moderna, se espera una latencia de decodificación de 20-50 ms por token y un throughput de 50-150 tokens/s, dependiendo de la cuantización y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fkazi/inframap-disaster-slm | 3,2 B | No disponible | Apache 2.0 | Hugging Face |
| unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit | 3,2 B | 128k (base) | Llama 3.2 Community License | Hugging Face |
| Qwen2.5-3B-Instruct | 3,1 B | 32k | Apache 2.0 | Hugging Face |
| Phi-3-mini-4k-instruct | 3,8 B | 4k | MIT | Hugging Face |

La comparativa se limita a aspectos estructurales, ya que no hay datos de rendimiento para el modelo evaluado. El modelo base Llama 3.2 3B tiene una ventana de contexto de 128k tokens, pero no se confirma que este fine-tuning la conserve. Qwen2.5-3B y Phi-3-mini son alternativas con licencias permisivas y documentación más completa.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, el proceso de fine-tuning y los objetivos específicos del modelo.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. El modelo puede presentar sesgos heredados de Llama 3.2, así como riesgos de generar información falsa o no verificada.
- La ventana de contexto no está confirmada; si se mantiene la de Llama 3.2 (128k), el modelo podría manejar documentos largos, pero no hay garantía.
- El modelo solo está etiquetado para inglés; su rendimiento en otros idiomas es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de Llama 3.2, debe verificarse el cumplimiento de la licencia del modelo base (Llama 3.2 Community License), que puede imponer restricciones adicionales.
- Con 0 descargas y 0 likes, no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fkazi/inframap-disaster-slm
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl

No se han encontrado papers, blogs o demos adicionales específicos de este modelo.
