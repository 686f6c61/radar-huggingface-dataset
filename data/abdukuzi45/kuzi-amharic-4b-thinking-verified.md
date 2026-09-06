# abdukuzi45/kuzi-amharic-4b-thinking-verified

## Resumen

Este modelo, publicado por abdukuzi45, es una conversión a formato `safetensors` del modelo `Qwen3.5-4B-Uncensored-Aggressive` de HauhauCS. Se basa en `Qwen/Qwen3.5-4B`, un transformer multimodal de 4.539 millones de parámetros con soporte de texto, imagen y vídeo, y una ventana de contexto nativa de 262.144 tokens. Aunque el nombre del repositorio sugiere un fine-tune en amhárico (`kuzi-amharic-4b-thinking-verified`), la model card no confirma ese idioma y se limita a describir una variante "uncensored" con eliminación de rechazos. Es relevante para desarrolladores que buscan un modelo multimodal ligero, con contexto largo y sin restricciones de contenido, siempre que acepten la falta de licencia y de datos de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-4B |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingual (según metadata; el nombre del repo sugiere amhárico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (sharded en 2 archivos) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal basado en `Qwen/Qwen3.5-4B`, con soporte de texto, imagen y vídeo. Según la model card, se trata de una conversión directa de pesos GGUF a formato `safetensors`, sin modificaciones adicionales. El modelo original es una variante "uncensored" con eliminación de rechazos ("refusal removal") creada por HauhauCS. No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens, ni procesos de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y multimodal: procesa texto, imagen y vídeo, según la model card.
- Ventana de contexto nativa de 262.144 tokens, lo que permite mantener documentos largos completos en memoria.
- Modelo "uncensored": se han eliminado los rechazos, por lo que responde a consultas sin evasivas.
- Idiomas: la metadata indica "multilingual", aunque el nombre del repositorio sugiere un enfoque en amhárico.
- No se documenta soporte de tool calling / function calling, ni capacidades de agente.
- El nombre incluye "thinking", pero no se describe ningún mecanismo de razonamiento específico.

## Casos de uso

- Análisis de documentos extensos: con 262.144 tokens de contexto, permite cargar informes de decenas de páginas y responder preguntas sobre ellos sin necesidad de dividir el texto. Apto para revisión legal o auditoría.
- Descripción de imágenes y vídeos: al ser multimodal, puede generar descripciones automáticas de contenido audiovisual, lo que facilita la indexación en sistemas de gestión de activos digitales.
- Atención al cliente sin filtros: al eliminar los rechazos, puede manejar consultas delicadas o temas controvertidos sin evasivas, útil en entornos controlados de soporte o roleplay.
- Tutor multilingüe: gracias a su carácter multilingüe y multimodal, puede explicar conceptos combinando texto e imágenes, adaptándose al idioma del usuario en plataformas de e-learning.
- Generación de ficción y guiones: la naturaleza "uncensored" permite crear diálogos y narrativas sin restricciones de contenido, siempre que se use de forma responsable.
- Accesibilidad: puede describir imágenes y vídeos en lenguaje natural para personas con discapacidad visual, integrado en aplicaciones móviles o web.
- Investigación periodística: permite buscar patrones en grandes volúmenes de texto, como filtraciones o documentos judiciales, manteniendo el contexto completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en `safetensors` ocupan 9.1 GB, lo que corresponde a FP16. Se necesitan al menos 12 GB de VRAM para inferencia sin cuantización, considerando activaciones y KV cache. Para aprovechar la ventana de contexto de 262.144 tokens, se recomienda 24 GB o más.
- GPU recomendadas: RTX 4090 (24 GB) o A100 (40/80 GB) para inferencia con contexto largo. Una RTX 3090 (24 GB) también es adecuada.
- Consumer GPU: con cuantización 4-bit podría caber en una RTX 3060 de 12 GB, pero no se proporcionan pesos cuantizados en el repositorio.
- Opciones de despliegue: `transformers`, `vLLM` y `SGLang` son compatibles directamente. Para `llama.cpp` u `Ollama`, sería necesario convertir los pesos a GGUF, ya que el repositorio no los incluye.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El único punto de referencia conocido es el modelo base `Qwen/Qwen3.5-4B`, del que deriva, y otros modelos del mismo autor como `qwen3.5-4b-amharic-sft`, pero no se han publicado benchmarks para ninguno.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo puede usarse con fines comerciales.
- Al ser una variante "uncensored", existe un riesgo elevado de generar contenido dañino, ilegal o inapropiado.
- No hay resultados de benchmarks ni evaluaciones de seguridad.
- Ambigüedad sobre el idioma: el nombre del repositorio sugiere amhárico, pero la model card no lo confirma.
- Conversión de GGUF a `safetensors`: puede haber diferencias de comportamiento con respecto al original, y se requiere un stack reciente para Qwen3.5.
- La ventana de contexto de 262.144 tokens puede provocar un alto consumo de memoria en la KV cache, lo que limita su uso en hardware modesto.

## Enlaces

- HuggingFace: https://huggingface.co/abdukuzi45/kuzi-amharic-4b-thinking-verified
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Otro modelo del autor: https://huggingface.co/abdukuzi/Amharic-kuzi-reasoning-model-v4
- Otro modelo del autor: https://huggingface.co/abdukuzi45/qwen3.5-4b-amharic-sft
