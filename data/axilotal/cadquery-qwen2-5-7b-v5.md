# Axilotal/cadquery-qwen2.5-7b-v5

## Resumen

El modelo `Axilotal/cadquery-qwen2.5-7b-v5` es un ajuste fino (finetune) del modelo base `unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit`, desarrollado por el usuario Axilotal y publicado en Hugging Face bajo licencia Apache 2.0. Está orientado a la generación de texto, con un enfoque probable en código de la librería CadQuery (modelado paramétrico 3D en Python), aunque la model card no documenta explícitamente esta especialización. El modelo cuenta con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y está disponible en formato safetensors, con un peso total del repositorio de 15,2 GB.

La relevancia de este modelo radica en su origen: parte de una base instructiva de Qwen2.5-Coder, conocida por su buen rendimiento en tareas de programación y razonamiento. El finetune se realizó con las bibliotecas Unsloth y TRL, lo que sugiere un proceso de entrenamiento eficiente, aunque no se han publicado detalles sobre el conjunto de datos, la duración del entrenamiento ni las técnicas de alineación empleadas. Su licencia permisiva (Apache 2.0) facilita su uso comercial y la integración en pipelines de desarrollo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder-only denso) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens, pero no se confirma para este finetune) |
| Tipos de cuantización | no disponible (el repositorio contiene safetensors en precisión completa; el modelo base original es bnb-4bit) |
| Idiomas soportados | inglés (según la etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only denso con atención causal, tal como se emplea en el modelo base `Qwen2.5-Coder-7B-Instruct`. No se han publicado detalles concretos sobre la configuración interna (número de capas, cabezas de atención, dimensiones ocultas) ni sobre las técnicas de entrenamiento aplicadas durante el finetune. La model card únicamente indica que el entrenamiento se realizó con Unsloth y la biblioteca TRL de Hugging Face, lo que sugiere un proceso de ajuste fino supervisado (SFT) probablemente con instrucciones, aunque no se menciona el uso de RLHF o DPO.

El modelo base, `Qwen2.5-Coder-7B-Instruct`, fue preentrenado por el equipo de Qwen con un corpus extenso de código y texto, y ajustado para seguir instrucciones. El finetune de Axilotal añade una capa adicional de adaptación, probablemente dirigida a tareas de generación de código CadQuery, aunque no hay evidencia pública de ello más allá del nombre del modelo. No se han publicado datos sobre el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Generación de código, incluyendo Python y otros lenguajes, con razonamiento lógico y matemático básico.
- Soporte de instrucciones y conversaciones multi-turno (modelo instruct).
- No se documenta soporte explícito de tool calling, agentes o razonamiento multi-paso específico, aunque el modelo base de Qwen2.5-Coder incluye estas capacidades.
- No se especifican capacidades multimodales (visión, audio, etc.).
- El nombre del modelo sugiere una especialización en la generación de código CadQuery (librería Python para diseño paramétrico 3D), pero no hay confirmación en la documentación.

## Casos de uso

- Generación de código CAD paramétrico: si el modelo está especializado en CadQuery, puede asistir en la creación de scripts para modelado 3D, reduciendo el tiempo de diseño y permitiendo iteraciones rápidas.
- Asistencia en entornos de desarrollo integrado (IDE): como modelo instruct de 7B, puede integrarse en plugins o extensiones para autocompletar código y responder consultas de programación.
- Automatización de documentación técnica: generación de comentarios, docstrings y explicaciones de código a partir de fragmentos de Python.
- Soporte en educación técnica: ayudar a estudiantes de ingeniería a entender y escribir código de modelado paramétrico.
- Integración en pipelines de CI/CD: el modelo puede generar tests unitarios o snippets de código para validación, aunque no hay evidencia de tool calling.
- Prototipado rápido de scripts de automatización: para tareas de diseño industrial, puede producir código base para manipulación de geometría.

Nota: estos casos se infieren del nombre y del origen del modelo, pero no están documentados oficialmente por el autor. Se recomienda evaluar el modelo en cada escenario antes de su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este finetune específico. Tampoco se dispone de comparaciones con otros modelos en la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (15,2 GB), se necesitan al menos 16 GB de VRAM para ejecutar el modelo completo. Con cuantización de 8 bits, se podría reducir a aproximadamente 8 GB; con 4 bits, a unos 4-5 GB (dependiendo del framework y el tamaño de contexto).
- GPU recomendadas: para FP16 se recomienda una GPU con 16 GB o más, como RTX 4080/4090, A100 40GB, H100, etc. Para cuantización 4-bit, puede funcionar en GPUs de 8 GB como RTX 3070/4060, aunque con limitaciones de contexto.
- Opciones de despliegue: compatible con bibliotecas como transformers, vLLM, llama.cpp (con conversión a GGUF), Ollama (si se convierte), y Text Generation Inference (TGI).
- Latencia y throughput: no se dispone de datos concretos. En una GPU A100, un modelo de 7B en FP16 suele ofrecer alrededor de 20-30 tokens/s; en cuantización 4-bit puede superar los 50 tokens/s en GPUs de consumo, pero son estimaciones generales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Axilotal/cadquery-qwen2.5-7b-v4 | 7,6 B | no disponible | Apache 2.0 | Finetune de Qwen2.5-Coder-7B-Instruct, especialización probable en CadQuery |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32K | Apache 2.0 | Modelo base, instruct, generación de código general |
| DeepSeek-Coder-7B-Instruct | 7,7 B | 16K | MIT | Modelo de código, con buena capacidad en programación |
| CodeLlama-7B-Instruct | 6,7 B | 4K | Llama 2 license | Modelo de código de Meta, con restricciones de uso comercial |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que no se han publicado resultados de benchmarks para el finetune de Axilotal.

## Limitaciones y advertencias

- No hay documentación técnica sobre el entrenamiento, los datos usados ni las técnicas de alineación; esto limita la reproducibilidad y la confianza en el comportamiento.
- La especialización en CadQuery no está confirmada; puede ser un nombre arbitrario o un objetivo no cumplido.
- Riesgo de alucinaciones y errores de código, especialmente en tareas complejas o poco frecuentes en el dataset de entrenamiento.
- Sesgos potenciales heredados del modelo base Qwen2.5-Coder, que puede tener sesgos en idiomas, géneros o dominios.
- Limitación de contexto: aunque el base soporta 32K, no se garantiza que el finetune lo mantenga; si el contexto se reduce, afectará a tareas de largo alcance.
- Uso comercial permitido bajo Apache 2.0, pero se debe verificar que el modelo base también cumpla con la licencia (Qwen2.5-Coder es Apache 2.0, por lo que no hay problema).
- No se recomienda para producción sin pruebas exhaustivas previas, dado que no hay evidencia de calidad.

## Enlaces

- [Hugging Face - Axilotal/cadquery-qwen2.5-7b-v4](https://huggingface.co/Axilotal/cadquery-qwen2.5-7b-v4)
- [Axilotal/cadquery-qwen2.5-7b-v3-merged](https://huggingface.co/Axilotal/cadquery-qwen2.5-7b-v3-merged) (versión anterior del autor)
- [Axilotal/cadquery-qwen2.5-7b-v3-benchmark](https://huggingface.co/Axilotal/cadquery-qwen2.5-7b-v3-benchmark) (benchmark del autor)
- [Repositorio Qwen2.5 en GitHub](https://github.com/mx4ai/qwen2.5) (información general sobre la familia Qwen2.5)
- [Página de Qwen2.5 en ModelScope](https://www.modelscope.cn/models/qwen/Qwen2.5-7B) (documentación del modelo base)
