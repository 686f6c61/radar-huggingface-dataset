# mradermacher/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF estáticas del modelo `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, preparadas por el usuario mradermacher, conocido por distribuir pesos cuantizados de modelos open source. El modelo base es una versión "abliterada" (descensurada) de Qwen3.8-27B, un modelo de lenguaje de 27 000 millones de parámetros desarrollado por Alibaba, orientado a tareas de programación y razonamiento. La abliteración elimina selectivamente los mecanismos de rechazo aprendidos durante el alineamiento, lo que da lugar a un modelo con menos restricciones de contenido, aunque con los riesgos asociados.

El repositorio incluye múltiples cuantizaciones (desde Q2_K hasta f16) para permitir su ejecución en hardware variado, desde GPUs de consumo hasta servidores profesionales. No se proporciona información sobre licencia, idiomas soportados ni arquitectura detallada en la model card, por lo que estos datos se marcan como no disponibles. El tamaño total del repositorio es de 155,8 GB, lo que indica que contiene todas las variantes de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27 320 697 856 (~27,3 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible (se infiere multilingue por el modelo base Qwen, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base en la model card del repositorio. El modelo original `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16` es descrito por su autor como una "abliteración totalmente descensurada y mejorada en capacidades" de Qwen3.8-27B, producida mediante investigación automatizada con agentes de IA y técnicas de abliteración de última generación. La abliteración es un proceso de post-entrenamiento que modifica los pesos del modelo para eliminar los patrones de rechazo aprendidos durante el RLHF, sin reentrenar el modelo completo.

Dado que el modelo base es una variante de Qwen3.8-27B, se espera que herede su arquitectura (probablemente transformer con atención QKV estándar y posiblemente mecanismos híbridos, según las tendencias de Qwen en 2026), pero esto no está confirmado. El proceso de cuantización GGUF realizado por mradermacher no altera la arquitectura, solo reduce la precisión de los pesos.

## Capacidades

- Generación de texto libre y conversación multi-turno (etiquetado como "conversational").
- Razonamiento y resolución de problemas, heredado del modelo base Qwen3.8-27B.
- Generación de código y asistencia en programación, según la información pública sobre Qwen3.8-27B.
- Capacidad multilingüe probable (el modelo base Qwen suele soportar inglés, chino y otros idiomas), aunque no está confirmada para esta variante.
- Al estar "descensurado", responde a peticiones que el modelo original rechazaría, incluyendo contenido sensible o controvertido.
- Soporte de function calling y agentes, presumiblemente heredado del modelo base, aunque no se documenta en este repositorio.

## Casos de uso

- Desarrollo de asistentes de programación locales: el modelo puede integrarse en entornos de desarrollo (IDE) para autocompletado y generación de código, con la ventaja de que las cuantizaciones GGUF permiten ejecutarlo en GPUs de consumo sin conexión a la nube.
- Investigación en alineamiento y seguridad de IA: al ser una versión abliterada, permite estudiar los efectos de eliminar los mecanismos de rechazo y comparar comportamientos con el modelo original.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material educativo donde se requiera explorar temas que los modelos alineados evitan.
- Prototipado de aplicaciones de chat: gracias a su compatibilidad con endpoints (etiqueta "endpoints_compatible"), puede desplegarse con servidores como llama.cpp o vLLM para probar rápidamente prototipos conversacionales.
- Análisis de código legacy: su capacidad de razonamiento y generación de código puede ayudar a documentar o refactorizar bases de código antiguas, ejecutándose localmente para cumplir requisitos de privacidad.
- Educación y experimentación: estudiantes e investigadores pueden usar las distintas cuantizaciones para aprender sobre trade-offs entre precisión, memoria y velocidad de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Los resultados de búsqueda web mencionan mediciones de velocidad para Qwen3.8-27B (7,11 tokens/s en cuantización 4-bit), pero no son específicos de esta variante abliterada ni están verificados, por lo que no se incluyen en esta ficha.

## Requisitos de hardware

- El modelo base tiene 27 320 697 856 parámetros. En BF16 (precisión original) requiere aproximadamente 54,6 GB de memoria (27,3 B × 2 bytes). Esto supera la VRAM de cualquier GPU de consumo actual.
- Las cuantizaciones GGUF reducen significativamente los requisitos:
  - Q2_K: ~9 GB (según mediciones de terceros para Qwen3.8-27B).
  - Q4_K_M: ~17 GB (según mediciones de terceros para Qwen3.8-27B).
  - Q8_0: ~29 GB.
- Para ejecutar la versión Q4_K_M se necesita una GPU con al menos 16-20 GB de VRAM, como una RTX 4090 (24 GB) o una A5000 (24 GB). Las versiones Q2/Q3 pueden caber en GPUs de 12 GB (p. ej., RTX 4070 Ti) con cuantización adicional o usando offloading a RAM.
- Para las versiones f16 o Q8_0 se requieren GPUs profesionales como A100 (80 GB) o H100, o bien múltiples GPUs.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-inference (TGI) o servidores compatibles con endpoints (la etiqueta "endpoints_compatible" sugiere compatibilidad con la API de OpenAI).
- La latencia depende del hardware y la cuantización; en una RTX 4090 con Q4_K_M se pueden esperar velocidades de 7-15 tokens/s según mediciones de terceros, aunque no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Qwen3.8-27B es comparable a otros modelos de 27B como Llama-3.3-27B o Mistral-Small-24B, pero no se tienen datos de rendimiento específicos de esta variante abliterada. Se recomienda consultar benchmarks públicos del modelo Qwen3.8-27B original y contrastar con esta versión.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que puede llevar a generar contenido dañino, ilegal o éticamente problemático. No debe usarse en producción sin moderación humana y salvaguardas adicionales.
- El modelo no ha sido evaluado formalmente; no hay datos de seguridad, sesgos o robustez. Es probable que herede sesgos del modelo base Qwen, pero no hay confirmación.
- Riesgo de alucinación: al ser una versión descensurada, puede inventar información con mayor confianza, especialmente en temas sensibles donde el modelo original habría rechazado responder.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial. Se debe contactar con el autor del modelo base (AEON-7) para aclarar los términos.
- El modelo base Qwen3.8-27B está pensado para código y razonamiento; su rendimiento en otras tareas puede ser inferior a modelos especializados.
- Las cuantizaciones de baja precisión (Q2_K, Q3) degradan notablemente la calidad de salida; se recomienda usar Q4_K_M o superior para tareas críticas.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-GGUF
- Modelo base original: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Repositorio de AEON-7 (versión anterior similar): https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash/
- Guía de cuantizaciones de Qwen3.8-27B (kingy.ai): https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/
- Guía de ejecución local de Qwen3.8-27B (ofox.ai): https://ofox.ai/blog/qwen-3-8-27b-run-locally-vram-gguf-2026/
- Instalador local de Qwen3.8-27B (GitHub): https://github.com/qwen3-8-27b/qwen3-8-27b
