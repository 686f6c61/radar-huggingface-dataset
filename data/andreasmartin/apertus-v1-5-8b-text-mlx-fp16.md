# andreasmartin/apertus-v1.5-8b-text-mlx-fp16

## Resumen

Apertus 1.5 es una familia de modelos de lenguaje desarrollada por Swiss AI, una iniciativa suiza orientada a la inteligencia artificial abierta y transparente. El modelo `andreasmartin/apertus-v1.5-8b-text-mlx-fp16` es una conversión a formato MLX (Apple Silicon) del modelo base `andreasmartin/apertus-v1.5-8b-text`, que a su vez deriva de `swiss-ai/Apertus-v1.5-8B`. Esta conversión mantiene las mismas capacidades del modelo original, pero está optimizada para ejecutarse en hardware Apple mediante la librería `mlx-lm`.

El modelo original, Apertus 1.5 8B, es una continuación del pretraining de Apertus 1.0, al que se añadieron 4 billones de tokens de texto y datos multimodales (aunque esta conversión concreta es solo de texto). Soporta contextos de hasta 262 144 tokens y utiliza exclusivamente datos de entrenamiento abiertos. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, siempre que se cumpla la política de uso aceptable de Apertus. La relevancia actual radica en su carácter completamente abierto (pesos, datos, valores y detalles de entrenamiento) y su rendimiento comparable a otros modelos de 8B de la misma generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles especificos no disponibles) |
| Parametros totales | 8 054 976 512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | FP16 (formato MLX) |
| Idiomas soportados | Multilingue (lista completa no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base. Se sabe que Apertus 1.5 es una familia de modelos de 8B y 70B parámetros, y que el modelo de 8B fue sometido a un continued pretraining con 4 billones de tokens adicionales sobre Apertus 1.0. El entrenamiento emplea exclusivamente datos abiertos y se publican todos los detalles del proceso. Esta conversión concreta a MLX no modifica la arquitectura ni los pesos; solo adapta el formato para su uso con `mlx-lm` en Apple Silicon. No se dispone de información sobre el uso de técnicas como RLHF, DPO o decodificación especulativa en el modelo original.

## Capacidades

- Generación de texto en múltiples idiomas (etiqueta `multilingual`).
- Razonamiento avanzado (etiqueta `reasoning`).
- Soporte de tool calling / function calling (etiqueta `tool-calling`).
- Modelo exclusivamente de texto (etiqueta `text-only`); no procesa imágenes ni audio.
- Conversación multi-turno mediante plantilla de chat estándar.
- Compatible con el ecosistema MLX para inferencia local en dispositivos Apple.

## Casos de uso

- Asistente virtual multilingüe: gracias a su amplia ventana de contexto (262 144 tokens), puede mantener conversaciones largas y coherentes, incorporando historial extenso sin perder información relevante.
- Generación de código en entornos de desarrollo: su capacidad de tool calling permite integrarlo en pipelines de CI/CD para autocompletar, revisar o documentar código, reduciendo la intervención manual.
- Análisis de documentos extensos: la ventana de contexto permite procesar informes, contratos o artículos científicos completos en una sola pasada, extrayendo conclusiones o resumiendo contenido.
- Atención al cliente automatizada: puede gestionar incidencias multi-turno en varios idiomas, derivando a herramientas externas mediante function calling cuando es necesario.
- Traducción y localización: su carácter multilingüe lo hace adecuado para traducir contenido manteniendo el registro y el contexto, con posibilidad de ajuste por dominio.
- Investigación académica en PLN: al ser completamente abierto (pesos, datos y entrenamiento), sirve como base para estudios de interpretabilidad, alineación o evaluación de modelos en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estándar para esta conversión MLX ni para el modelo base en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 8B parámetros en FP16 ocupa aproximadamente 16 GB de memoria. Con overhead de activaciones y cache, se recomienda al menos 20 GB de VRAM.
- GPU recomendadas: en hardware Apple, cualquier chip con al menos 32 GB de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o superiores) puede ejecutar el modelo cómodamente. En GPUs NVIDIA, se requiere una RTX 4090 (24 GB) o una A100/H100 para mayor margen.
- En consumer GPU: sí, cabe en una RTX 4090 o similar con 24 GB de VRAM, aunque el contexto máximo puede requerir más memoria según la longitud de la secuencia.
- Opciones de despliegue: `mlx-lm` para Apple Silicon; también se puede convertir a GGUF para `llama.cpp` u Ollama, o usar vLLM/TGI si se convierte a formato estándar de HuggingFace.
- Latencia y throughput: no se dispone de datos medidos en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. Como referencia cualitativa, Apertus 1.5 8B se posiciona en la misma categoría que otros modelos abiertos de 8B como Llama 3.1 8B o Mistral 7B, aunque con una ventana de contexto significativamente mayor (262 144 tokens) y un enfoque en apertura total de datos y entrenamiento. No se pueden aportar cifras de rendimiento comparadas sin datos verificados.

## Limitaciones y advertencias

- Al ser un modelo de solo texto, no procesa imágenes, audio ni vídeo, a diferencia de la versión multimodal de Apertus 1.5.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda verificación de hechos en aplicaciones críticas.
- La ventana de contexto de 262 144 tokens puede degradar el rendimiento en secuencias muy largas si la memoria del dispositivo es insuficiente.
- La lista completa de idiomas soportados no está disponible en la documentación consultada; el rendimiento puede variar según el idioma.
- Aunque la licencia es Apache 2.0, se debe cumplir la Política de Uso Aceptable de Apertus (enlazada en la model card), que puede imponer restricciones adicionales para ciertos usos.
- Esta conversión MLX está pensada para Apple Silicon; su uso en otras plataformas requiere conversión adicional.

## Enlaces

- Repositorio HuggingFace del modelo convertido: https://huggingface.co/andreasmartin/apertus-v1.5-8b-text-mlx-fp16
- Modelo base (texto): https://huggingface.co/andreasmartin/apertus-v1.5-8b-text
- Modelo original de Swiss AI: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Artículo de Apertus AI sobre la versión 1.5: https://apertus-ai.org/articles/2026-07-apertus-1-5/
- Documentación de Apertus AI: https://apertus-ai.org/pages/documentation/
- Documentación técnica en DeepWiki: https://deepwiki.com/swiss-ai/apertus-legal/3-apertus-1.5-model-documentation
- Política de uso aceptable: https://github.com/swiss-ai/apertus-legal/blob/main/apertus_1.5/USAGE_POLICY.pdf
