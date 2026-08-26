# positron-ai/google_gemma-3-27b-it-ingest-best-gptq

## Resumen

Este repositorio contiene una cuantización GPTQ de 4 bits del modelo `google/gemma-3-27b-it`, realizada por Positron AI. Gemma 3 27B es un modelo de lenguaje multimodal de código abierto desarrollado por Google DeepMind, basado en la tecnología de Gemini 2.0. Procesa texto e imágenes y genera respuestas de texto, con una ventana de contexto de 128.000 tokens y soporte multilingüe en más de 140 idiomas.

La cuantización GPTQ reduce los pesos del modelo a 4 bits, lo que permite ejecutar Gemma 3 27B en GPUs con menor VRAM manteniendo la mayor parte de la fidelidad del modelo original. El repositorio contiene los pesos en formato `safetensors` listos para usar con `transformers`, vLLM u otras herramientas compatibles con GPTQ. El tamaño del repositorio es de 17,5 GB, frente a los aproximadamente 54 GB del modelo original en precisión completa.

La relevancia de esta publicación radica en que facilita el despliegue de Gemma 3 27B en hardware más accesible (tarjetas gráficas de consumo con 24 GB de VRAM), manteniendo capacidades multimodales y de razonamiento avanzadas. La cuantización utiliza un grupo de tamaño 64 y cuantización simétrica, sin reordenación de activaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3, basada en Gemini 2.0) |
| Parámetros totales | 27.432.406.640 (27,4 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | GPTQ 4-bit (grupo 64, simétrica, sin `desc_act`) |
| Idiomas soportados | Más de 140 idiomas |
| Licencia | `other` (Gemma Terms of Use) |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

El modelo base, `google/gemma-3-27b-it`, es un transformer multimodal de 27.400 millones de parámetros que combina un codificador de visión con un decodificador de lenguaje. Está instruido para seguir instrucciones y mantiene las capacidades de razonamiento y conversación de la familia Gemma. La cuantización GPTQ se aplicó sobre los pesos del modelo base, sin modificar la arquitectura ni los parámetros de atención.

La cuantización se realizó con la herramienta GPTQModel (versión 7.2.0), usando un conjunto de calibración de dominio mixto con 128 muestras y una longitud de secuencia de 4096 tokens. La precisión de los pesos se redujo a 4 bits con grupo de tamaño 64 y cuantización simétrica. No se aplicó reordenación de activos (`desc_act` = false), lo que simplifica el despliegue pero puede afectar ligeramente a la precisión en tareas que requieren atención a activos atípicos.

El modelo original fue entrenado con un pipeline que incluye preentrenamiento supervisado y refinamiento por instrucciones (RLHF). No se dispone de detalles adicionales sobre el conjunto de datos de entrenamiento en la información proporcionada.

## Capacidades

- Generación de texto en conversaciones multi-turno con instrucciones complejas.
- Razonamiento multimodal: procesa imágenes y responde preguntas sobre su contenido, incluyendo diagramas, gráficos y fotografías.
- Razonamiento matemático y científico mejorado, con rendimiento destacado en tareas STEM.
- Soporte multilingüe en más de 140 idiomas, con capacidad de traducción y generación de contenido en múltiples lenguas.
- Soporte de tool calling / function calling (habilitado en el modelo base para integración con APIs).
- Capacidad de manejar contextos largos de hasta 128.000 tokens, útil para documentos extensos o historiales de conversación largos.
- No se ha confirmado un modo de "thinking" explícito en esta cuantización, pero el modelo base es capaz de generar razonamiento paso a paso.

## Casos de uso

- **Atención al cliente automatizada**: con una ventana de 128.000 tokens, el modelo puede mantener conversaciones largas con contexto completo del historial, gestionando consultas técnicas y reclamaciones en varios idiomas.
- **Asistente de generación de código**: soporta tool calling, por lo que puede integrarse en pipelines de CI/CD para generar documentación, revisar código o autocompletar funciones. La cuantización permite ejecutarlo en GPUs de gama media.
- **Análisis de documentos técnicos**: puede resumir o extraer información de documentos largos (manuales, informes) gracias a su contexto de 128K tokens, manteniendo los detalles clave.
- **Chatbot educativo multilingüe**: al soportar más de 140 idiomas, puede servir como tutor de idiomas o asistente de aprendizaje para estudiantes de diversas regiones, con respuestas en su lengua materna.
- **Descripción y análisis de imágenes**: procesa imágenes y responde preguntas sobre su contenido, útil en sistemas de accesibilidad (descripción de imágenes para personas con discapacidad visual) o en control de calidad visual en entornos industriales.
- **Prototipado de agentes conversacionales**: su capacidad de tool calling y razonamiento multi-paso permite crear agentes que consultan APIs externas, ejecutan búsquedas y encadenan acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización. La model card indica que la evaluación de MMLU está pendiente. Por tanto, no se presentan datos numéricos de rendimiento.

## Requisitos de hardware

- **VRAM estimada**: los pesos en 4 bits ocupan 17,5 GB. Para inferencia con contexto largo y espacio para los estados de atención, se recomienda al menos 24 GB de VRAM.
- **GPU recomendadas**:
  - NVIDIA RTX 3090 o RTX 4090 (24 GB) para uso local.
  - NVIDIA A100 (40 GB o 80 GB) para despliegue en servidor.
  - NVIDIA L4 o L40S (24 GB) en entornos cloud.
- **Compatibilidad**: la cuantización GPTQ es compatible con `transformers` (con `bitsandbytes` o `auto-gptq`), vLLM, TGI (Text Generation Inference) y `exllamav2`.
- **Opciones de despliegue**: vLLM para inferencia de alto throughput; llama.cpp no es compatible directamente con GPTQ, pero se puede usar el formato GGUF si se necesita CPU o GPU de baja VRAM.
- **Latencia y throughput**: no se han publicado mediciones específicas para esta cuantización. En general, un modelo de 27B en 4 bits puede generar entre 30 y 60 tokens/s en una RTX 4090 con vLLM, dependiendo del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Gemma 3 27B (original)** | 27,4 B | 128K | FP16/BF16 | Gemma Terms | Hugging Face |
| **Gemma 3 27B GPTQ (este repo)** | 27,4 B | 128K | GPTQ 4-bit | Gemma Terms | Hugging Face |
| **Llama 3.1 70B (cuantizado)** | 70,6 B | 128K | GPTQ/AWQ | Llama License | Hugging Face |
| **Mistral Large 2 (cuantizado)** | 123 B | 128K | GPTQ/AWQ | Apache 2.0 | Hugging Face |

La comparativa con modelos de la misma categoría (27-30 B) no está disponible en la información proporcionada. La cuantización GPTQ se distingue por su tamaño reducido (17,5 GB) y la posibilidad de ejecutarse en GPUs de consumo de 24 GB, mientras que el modelo original requiere al menos 50 GB de VRAM en FP16.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo base puede presentar sesgos sociales y culturales inherentes a los datos de entrenamiento. La cuantización no corrige estos sesgos.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información falsa o inventada, especialmente en contextos de baja evidencia.
- **Limitaciones de contexto**: aunque la ventana es de 128K tokens, el uso de cuantización de 4 bits puede degradar ligeramente la coherencia en contextos muy largos.
- **Restricciones de licencia**: la licencia es `other` (Gemma Terms of Use), que permite uso comercial pero con restricciones específicas (no usar para fines militares o de vigilancia, mantener atribución). Consulte los términos de Google.
- **Rendimiento sin evaluar**: no hay benchmarks publicados de esta cuantización, por lo que el impacto en precisión respecto al modelo original no está cuantificado.
- **Formato de pesos**: los pesos en `safetensors` requieren herramientas que soporten GPTQ (vLLM, TGI, AutoGPTQ). No es compatible directamente con llama.cpp en su formato actual.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/positron-ai/google_gemma-3-27b-it-ingest-best-gptq
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-3-27b-it
- Página oficial de Gemma 3 en DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Gemma 3 27B en NVIDIA NIM: https://build.nvidia.com/google/gemma-3-27b-it
- Ficha del modelo en AI Models Directory: https://llm-models.org/models/gemma-3-27b
