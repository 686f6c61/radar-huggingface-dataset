# dopaemon/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-oQ4e

## Resumen
Este repositorio contiene una cuantización mixta de 4 bits del modelo `Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED`, realizada con la herramienta oQ (oMLX v0.6.3rc2) y publicada por el usuario dopaemon. El modelo base es un fine-tune de Qwen 3.5 9B (arquitectura densa) entrenado con datos de destilación de Claude 4.6 para mejorar la generación de razonamiento, según la información disponible en repositorios relacionados. Esta versión cuantizada está pensada para ejecutarse en el ecosistema MLX de Apple Silicon, con un tamaño de repositorio de 6,1 GB y un formato de pesos safetensors.

La relevancia de esta ficha radica en que ofrece una opción de despliegue eficiente en memoria para un modelo de 9B con capacidades de instrucción y razonamiento, aunque la información pública sobre el modelo base es limitada y no se han publicado benchmarks específicos para esta cuantización. El repositorio indica que la cuantización fue actualizada el 2026-08-24, sustituyendo a una versión anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso, según el tipo de modelo) |
| Parametros totales | 1.876.724.976 (según safetensors; el modelo base declara 9,4B, pero la cuantización reduce el conteo efectivo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, formato oQ (oMLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantización oQ) |

## Arquitectura y entrenamiento
El modelo base `Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED` es un fine-tune del modelo Qwen 3.5 de 9B parámetros (arquitectura transformer densa), entrenado mediante Unsloth con un dataset de destilación de Claude 4.6, según la información encontrada en repositorios hermanos. El objetivo declarado es mejorar la generación de razonamiento ("thinking") sustituyendo el estilo de pensamiento de Qwen 3.5 por el de Claude 4.6, manteniendo un entrenamiento "suave" para no degradar otras capacidades. La versión aquí descrita es una cuantización mixta de 4 bits realizada con oQ (oMLX), que aplica precisiones variables según la sensibilidad de las capas. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO.

## Capacidades
- Generación de texto y razonamiento: hereda las capacidades del modelo base, que incluye instrucciones y razonamiento mejorado mediante destilación de Claude 4.6, aunque no se han verificado de forma independiente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible, aunque el fine-tune sugiere mejoras en razonamiento paso a paso.
- Capacidades multilingües: no disponible; el modelo base Qwen 3.5 suele ser multilingüe, pero no hay confirmación para esta variante.
- Capacidades especiales: la variante THINKING (repositorio hermano) indica modo de pensamiento explícito, pero esta versión INSTRUCT no lo confirma.

## Casos de uso
- Despliegue local en Apple Silicon: gracias a la cuantización MLX de 4 bits, el modelo puede ejecutarse en Macs con suficiente memoria unificada (por ejemplo, 16 GB o más) para tareas de generación de texto y asistencia conversacional.
- Prototipado rápido de aplicaciones de chat: al ser un modelo de instrucciones, puede integrarse en entornos de desarrollo con MLX para probar respuestas con razonamiento mejorado sin necesidad de GPUs dedicadas.
- Investigación sobre destilación de razonamiento: útil para estudiar cómo un modelo pequeño (9B) puede imitar patrones de pensamiento de un modelo mayor (Claude 4.6) mediante fine-tuning.
- Generación de código asistida: si el modelo base conserva las capacidades de Qwen 3.5, podría usarse para autocompletar o explicar código, aunque no hay evidencia específica.
- Análisis de textos largos: con una ventana de contexto no confirmada, podría emplearse en tareas de resumen o extracción de información, siempre que la memoria lo permita.
- Experimentación con cuantización mixta: el repositorio sirve como ejemplo de aplicación de oQ a un modelo de 9B, permitiendo evaluar el impacto en calidad y rendimiento frente a cuantizaciones uniformes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. La búsqueda web tampoco arroja datos cuantitativos para esta variante específica.

## Requisitos de hardware
- VRAM estimada: el repositorio pesa 6,1 GB, por lo que la inferencia en MLX requiere al menos 8 GB de memoria unificada, recomendándose 16 GB para mayor comodidad.
- GPU recomendadas: no aplica (MLX usa la GPU integrada de Apple Silicon; en otros entornos no es compatible directamente).
- ¿Cabe en consumer GPU? No, MLX está limitado a hardware Apple. Para GPUs NVIDIA se necesitaría convertir los pesos a otro formato (por ejemplo, GGUF o GPTQ).
- Opciones de despliegue: MLX (librería nativa de Apple), posiblemente a través de herramientas como `mlx-lm` o `omlx`. No es compatible con vLLM, llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de datos suficientes para una comparativa rigurosa. Se puede mencionar que el modelo base compite con otros fine-tunes de Qwen 3.5 9B, como la variante THINKING (también de DavidAU) o el propio Qwen 3.5 9B original, pero no hay métricas publicadas para esta cuantización. La licencia y disponibilidad son desconocidas, lo que dificulta cualquier comparación formal.

## Limitaciones y advertencias
- Sesgos conocidos: no hay información específica, pero al ser un fine-tune de Qwen 3.5, puede heredar sesgos del modelo base y del dataset de destilación.
- Riesgo de alucinación: no evaluado; se recomienda validar las respuestas en entornos de producción.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada; el modelo base Qwen 3.5 suele soportar 128K tokens, pero esta cuantización no lo confirma.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si permite uso comercial. Se debe contactar al autor antes de cualquier despliegue productivo.
- Caveat importante: el nombre del modelo incluye "UNCENSORED" y "HERETIC", lo que sugiere que se han eliminado alineaciones de seguridad. Esto implica un riesgo elevado de generar contenido inapropiado o dañino, y no es recomendable para aplicaciones públicas sin filtros adicionales.
- La cuantización oQ de 4 bits puede degradar la calidad frente al modelo original en tareas complejas; se recomienda evaluar en el caso de uso concreto.

## Enlaces
- Repositorio de HuggingFace: https://huggingface.co/dopaeemon/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-oQ4e
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED
- Variante THINKING (xbann): https://huggingface.co/xbann/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Página de recomendación de GPU (para la variante THINKING): https://www.spheron.network/tools/gpu-recommender/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Ficha en AI Market Cap (variante THINKING): https://aimarketcap.tech/models/davidau-qwen3-5-9b-claude-4-6-highiq-thinking-heretic-uncensored
