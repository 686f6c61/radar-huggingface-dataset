# CaineLabs/Caine-Text-Demo1

## Resumen

Caine-Text-Demo1 es un modelo de lenguaje y visión (vision-language model) desarrollado por CaineLabs, basado en una arquitectura Qwen3.5 de 2.000 millones de parámetros (1.942.653.248 parámetros totales). El modelo ha sido afinado (fine-tuned) y convertido al formato GGUF mediante la librería Unsloth, lo que permite ejecutarlo con llama.cpp en sistemas de consumo. Incluye un proyector multimodal (mmproj) en BF16 para procesar imágenes junto con texto, lo que lo convierte en un modelo multimodal ligero.

La relevancia del modelo radica en su tamaño reducido y su cuantización Q4_K_M, que lo hace apto para inferencia local en hardware modesto, como GPUs de consumo o portátiles. Sin embargo, la información disponible es escasa: no se han publicado detalles sobre el contexto, los idiomas soportados, la licencia ni los datos de entrenamiento. El modelo parece ser un experimento o demostración, dado que el repositorio tiene cero descargas y cero likes, y la model card presenta una discrepancia en el nombre (Caine-Text-Demo6 en lugar de Caine-Text-Demo1).

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal) |
| Parámetros totales | 1.942.653.248 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (modelo), BF16 (proyector mmproj) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (Q4_K_M para el modelo, BF16-mmproj para el proyector) |

## Arquitectura y entrenamiento

El modelo es un afinado de Qwen3.5-2B, una arquitectura transformer multimodal que combina un modelo de lenguaje con un proyector de visión (mmproj). El proyecto fue convertido a GGUF utilizando Unsloth, una librería que optimiza el afinado y la conversión de modelos. No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF, DPO o SFT. La model card indica que el entrenamiento fue "2x faster with Unsloth", pero no aporta más información técnica.

La presencia del archivo `Qwen3.5-2B.BF16-mmproj.gguf` confirma que el modelo es multimodal, capaz de procesar imágenes y texto. No hay información sobre la resolución de imagen, el número de capas, ni la longitud de contexto.

## Capacidades

- Generación de texto y diálogos conversacionales (tag `conversational`).
- Procesamiento multimodal de imágenes y texto (vision-language model).
- Compatibilidad con llama.cpp mediante `llama-mtmd-cli` para modelos multimodales.
- Soporte de cuantización con matriz de importancia (tag `imatrix`), lo que puede mejorar la calidad de la cuantización.
- Compatibilidad con endpoints (tag `endpoints_compatible`), aunque no se especifica el formato.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de código.

## Casos de uso

- Descripción de imágenes en entornos sin conexión: gracias a su tamaño de 2B y cuantización Q4_K_M, el modelo puede ejecutarse en una GPU de consumo con menos de 4 GB de VRAM, lo que permite generar descripciones de imágenes en aplicaciones locales sin conexión a internet.
- Chatbot multimodal para dispositivos personales: el modelo puede integrarse en una aplicación de escritorio o móvil mediante llama.cpp, ofreciendo un asistente que acepta imágenes y responde en texto.
- Análisis de documentos escaneados: puede extraer información de fotografías de documentos, facturas o capturas de pantalla, aunque su tamaño reducido limita la precisión en tareas complejas.
- Prototipado rápido de asistentes con visión: los desarrolladores pueden usar el modelo para probar ideas de aplicaciones multimodales sin necesidad de infraestructura cloud, gracias a su formato GGUF y su facilidad de despliegue con llama.cpp.
- Experimentación en arte generativo: en línea con el proyecto CAINE-AI (que utilizaba un modelo GPT-2 afinado en imágenes surrealistas), este modelo podría emplearse en proyectos artísticos que combinen texto e imágenes, aunque no hay documentación que lo confirme.
- Educación y demostraciones: por su bajo coste computacional, es adecuado para enseñar conceptos de modelos multimodales y cuantización en cursos o talleres, siempre que se asuma que la licencia no está definida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB para los pesos Q4_K_M, más el proyector BF16 y la caché KV. En total, se recomienda disponer de al menos 4 GB de VRAM para contextos moderados.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, o una Apple Silicon con 8 GB de memoria unificada.
- Sí cabe en GPU de consumo, siempre que se respete el límite de VRAM indicado.
- Opciones de despliegue: llama.cpp (llama-cli para texto, llama-mtmd-cli para multimodal), Ollama (si se convierte a un formato compatible), vLLM (gracias al tag `endpoints_compatible`, aunque no se confirma compatibilidad real).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Caine-Text-Demo1 (Qwen3.5-2B) | 1.94B | No disponible | Sí | No disponible | HuggingFace |
| Qwen2-VL-2B | 2.1B | 128k | Sí | Apache 2.0 | HuggingFace |
| Qwen2.5-2B (texto) | 2.36B | 128k | No | Apache 2.0 | HuggingFace |

Nota: no se dispone de datos de benchmarks comparativos. La comparación se basa en parámetros publicados y características conocidas de modelos similares.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo es de código abierto ni si permite uso comercial. Esto supone un riesgo legal para cualquier implementación en producción.
- Idiomas soportados no documentados: no se sabe si el modelo funciona correctamente en castellano u otros idiomas.
- Longitud de contexto no documentada: se desconoce cuántas tokens puede procesar, lo que limita su uso en tareas que requieren contexto largo.
- Riesgo de alucinación: al ser un modelo pequeño (2B) y sin datos de entrenamiento conocidos, es probable que genere respuestas incorrectas o inventadas, especialmente en tareas de razonamiento.
- Sesgos no documentados: no hay información sobre posibles sesgos en los datos de entrenamiento.
- Discrepancia en la model card: el README menciona "Caine-Text-Demo6" y el repositorio "KMC15/Caine-Text-Demo6", mientras que el repositorio real es "CaineLabs/Caine-Text-Demo1". Esto indica posible falta de mantenimiento y confusión en el proyecto.
- Sin benchmarks: no hay datos de rendimiento que permitan evaluar el modelo frente a alternativas.
- Relación con un proyecto de arte: la búsqueda web enlaza un proyecto llamado CAINE-AI basado en GPT-2 y afinado en imágenes surrealistas, pero no se confirma que este modelo tenga relación directa con él.

## Enlaces

- HuggingFace: https://huggingface.co/CaineLabs/Caine-Text-Demo1
- Proyecto CAINE-AI (GitHub): https://github.com/CAFOX-E/CAINE-AI-Project (proyecto de arte con GPT-2, no se confirma relación directa)
- Unsloth: https://github.com/unslothai/unsloth (librería utilizada para el afinado y conversión)
