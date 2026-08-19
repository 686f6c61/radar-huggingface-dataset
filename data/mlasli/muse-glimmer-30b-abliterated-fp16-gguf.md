# mlasli/Muse-Glimmer-30B-Abliterated-FP16-GGUF

## Resumen

Muse Glimmer 30B Abliterated FP16 GGUF es una cuantización en precisión FP16 del modelo de lenguaje Muse Glimmer 30B, desarrollado originalmente por Meta (según la model card, que referencia a `meta-models/Muse-Glimmer-30B`). El autor `mlasli` ha aplicado una técnica de post-entrenamiento denominada *abliteration*, que modifica los pesos del modelo para suprimir en gran medida su mecanismo interno de rechazo a ciertas instrucciones. El resultado es un modelo que acepta un rango más amplio de peticiones, aunque conserva algunos bloqueos residuales, especialmente en contenido relacionado con armas.

Este repositorio concreto contiene el archivo GGUF en FP16, que preserva la precisión completa de 16 bits de los pesos abliterados, sin degradación de calidad respecto al checkpoint de referencia BF16. El modelo tiene aproximadamente 27,85 mil millones de parámetros (el nombre comercial indica 30B, pero el dato real de safetensors es 27.854.794.240). No se especifica la longitud de contexto ni los idiomas soportados en la información disponible. La relevancia actual radica en que ofrece una alternativa menos restrictiva para aplicaciones de generación de texto, con soporte multimodal de visión mediante un proyector incluido, y es compatible con runtimes populares como llama.cpp, Ollama y LM Studio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 GGUF (este repo); también disponibles Q8_0, Q6_K, Q4_K_M y BF16 de referencia |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se especifica la arquitectura exacta del modelo base (si es un transformer estándar, MoE, etc.) en la información proporcionada. El modelo original, Muse Glimmer 30B, es un LLM de Meta con aproximadamente 27,85 mil millones de parámetros, pero no se detallan sus características internas.

La innovación principal de este checkpoint es la técnica de *abliteration*, aplicada sobre el modelo base. El proceso, descrito en la model card, consistió en:

1. Recopilar estados ocultos en la capa 33 de 52 (65 % de profundidad) a partir de 256 pares de prompts dañinos y 256 inofensivos, ejecutados en una GPU A100 de 80 GB.
2. Calcular la dirección de rechazo como la diferencia normalizada entre las medias de los estados ocultos de ambos grupos, obteniendo una puntuación de separación de 86,34.
3. Restar el término α = 0,15 × (r ⊗ (W^T r)) de las proyecciones `o_proj` y `down_proj` en las 52 capas del modelo.

El resultado fue una reducción de la tasa de rechazo de 3/3 a 1/3 en prompts dañinos de prueba: la guía de hacking y el ransomware pasaron a ser respondidos, mientras que el prompt relacionado con armas sigue bloqueado. No se dispone de información sobre el entrenamiento original del modelo (datos, número de tokens, técnicas de alineación como RLHF o DPO).

## Capacidades

- Generación de texto en lenguaje natural, con capacidad de completar instrucciones y mantener conversaciones multi-turno.
- Soporte multimodal de visión: el repositorio incluye un proyector de visión (`mmproj-Muse-Glimmer-30B-Q4_K_M.gguf`, ~1,4 GB) que permite procesar imágenes junto con texto, utilizando el encoder de visión original de Meta, que no fue modificado por la abliteración.
- Comportamiento abliterado: el modelo rechaza menos peticiones que el original, lo que lo hace adecuado para escenarios donde se requiere una respuesta menos restrictiva.
- Compatibilidad con runtimes GGUF: puede ejecutarse con llama.cpp, Ollama, LM Studio y otras herramientas que soporten este formato.
- No se mencionan capacidades de tool calling, function calling, razonamiento multi-paso explícito ni modos de pensamiento especiales en la información disponible.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir ficción, guiones o material de marketing sin los bloqueos típicos de los modelos alineados, gracias a su naturaleza abliterada. Es adecuado para escritores que necesitan explorar temas sensibles.
- Asistencia en investigación técnica: al responder a peticiones que otros modelos rechazarían (por ejemplo, explicaciones detalladas de exploits o técnicas de hacking), puede servir como herramienta de estudio en ciberseguridad, siempre con supervisión ética.
- Chat conversacional con menos censura: en aplicaciones de atención al cliente o asistentes personales donde se requiere una respuesta directa sin evasivas, el modelo ofrece un tono más permisivo.
- Análisis de imágenes con descripción libre: gracias al proyector de visión, puede describir imágenes sin las restricciones habituales, útil en entornos de moderación de contenido o accesibilidad.
- Prototipado de aplicaciones de IA generativa: al ser un GGUF, se integra fácilmente en pipelines locales con llama.cpp u Ollama, permitiendo pruebas rápidas de generación de texto sin depender de APIs externas.
- Evaluación de técnicas de alineación: investigadores pueden comparar el comportamiento de este modelo abliterado frente al original para estudiar los efectos de la modificación de pesos en la seguridad y la utilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no existe una evaluación formal del impacto de la abliteración en la calidad de salida, aunque se eligió un valor de α conservador (0,15) para minimizar la degradación.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo FP16 GGUF ocupa aproximadamente 60 GB, por lo que se requiere una GPU con al menos 60 GB de memoria para cargarlo completo. Esto incluye GPUs profesionales como la A100 80GB, H100 80GB o similares.
- Con cuantizaciones menores (Q8_0 ~32 GB, Q6_K ~25 GB, Q4_K_M ~18 GB), el modelo puede ejecutarse en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB) usando Q4_K_M o Q6_K.
- Opciones de despliegue: llama.cpp (incluido `llama-cli` y `llama-server`), Ollama (creando un Modelfile), LM Studio y cualquier runtime compatible con GGUF. Para el soporte de visión, se recomienda usar `llama-mtmd-cli` o `llama-server --mmproj`, ya que Ollama no soporta archivos `mmproj` separados para esta arquitectura.
- Latencia y throughput: no se proporcionan datos específicos. En una A100 80GB, se espera una generación fluida para un modelo de ~28B en FP16, pero los valores exactos dependen de la configuración y el backend.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo base, Muse Glimmer 30B, no tiene datos de rendimiento publicados en esta ficha, y no se conocen alternativas abliteradas de la misma familia con métricas comparables. Se recomienda consultar los repositorios de cuantizaciones alternativas (Q8_0, Q6_K, Q4_K_M) para evaluar el equilibrio entre tamaño y calidad.

## Limitaciones y advertencias

- Modelo abliterado: ha sido modificado para reducir el rechazo a peticiones dañinas. Esto implica un mayor riesgo de generar contenido inapropiado, ilegal o peligroso. El autor advierte que no es un modelo completamente sin censura y que algunos bloqueos persisten (especialmente en contenido relacionado con armas).
- Posible degradación de calidad: la abliteración puede afectar sutilmente la calidad de las respuestas. Aunque se usó un α conservador, no hay evaluación formal de benchmarks que garantice la ausencia de efectos secundarios.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede presentar sesgos presentes en sus datos de entrenamiento y generar información falsa o inventada. No se han documentado sesgos específicos en la información disponible.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto máxima ni los idiomas soportados. Se recomienda probar con la configuración por defecto de llama.cpp (8192 tokens) y verificar el comportamiento en el idioma deseado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor insta a cumplir con las leyes aplicables al usar un modelo que genera contenido que el original rechazaría.
- Soporte de visión limitado: el proyector de visión solo funciona con llama.cpp; Ollama no lo soporta actualmente. Además, el encoder de visión no fue abliterado, por lo que las descripciones de imágenes pueden mantener el comportamiento de rechazo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-FP16-GGUF
- Modelo base BF16: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-BF16
- Cuantización Q8_0: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q8_0-GGUF
- Cuantización Q6_K: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q6_K-GGUF
- Cuantización Q4_K_M: https://huggingface.co/mlasli/Muse-Glimmer-30B-Abliterated-Q4_K_M-GGUF
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
