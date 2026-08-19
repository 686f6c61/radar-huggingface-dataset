# Ishowbackup/gemma-4-12B-it-uncensored-GGUF

## Resumen

El modelo `gemma-4-12B-it-uncensored-GGUF` es una cuantización GGUF del modelo `TrevorJS/gemma-4-12B-it-uncensored`, una versión "abliterada" del modelo instructivo `google/gemma-4-12B-it` de Google. La abliteración es una técnica que elimina los comportamientos de rechazo del modelo, de modo que responde sin los filtros de seguridad habituales. Este repositorio, publicado por el usuario Ishowbackup, ofrece dos archivos GGUF (Q4_K_M y Q8_0) para facilitar la ejecución local del modelo mediante llama.cpp y herramientas compatibles.

Con aproximadamente 11,9 mil millones de parámetros, este modelo se posiciona como una opción interesante para desarrolladores que necesitan un LLM conversacional de tamaño medio sin restricciones de contenido, ejecutable en hardware de consumo o servidores modestos. La relevancia actual radica en la creciente demanda de modelos "uncensored" para aplicaciones de investigación, generación creativa y entornos donde los filtros estándar suponen una limitación. La cuantización GGUF permite una inferencia eficiente en CPU y GPU, ampliando su accesibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, basado en Gemma 4) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada (en los ejemplos se usa 8192 tokens, pero el máximo podría ser mayor) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original `google/gemma-4-12B-it`. Se sabe que es un modelo de lenguaje de 12B parámetros, probablemente basado en una arquitectura transformer estándar, pero no se confirma. El proceso de abliteración aplicado por TrevorJS utiliza "norm-preserving biprojected abliteration", una técnica que modifica los pesos del modelo para eliminar los vectores de dirección asociados al rechazo, sin degradar significativamente las capacidades generales. Los detalles completos del método y las métricas de validación se encuentran en la model card del modelo base en bf16.

El entrenamiento original de Gemma 4 no está documentado en esta ficha; se desconocen el número de tokens, la composición del dataset y si se aplicaron técnicas de RLHF o DPO. La cuantización GGUF se realizó posteriormente para reducir el tamaño y permitir su ejecución en hardware limitado, manteniendo un equilibrio entre calidad y eficiencia.

## Capacidades

- Generación de texto conversacional y completado de texto.
- Soporte de diálogo multi-turno (chat) gracias a su naturaleza instructiva.
- Respuestas sin rechazo por contenido sensible o controvertido (abliteración).
- Capacidad de ejecución local mediante llama.cpp, con soporte para servidor HTTP (llama-server).
- Compatible con herramientas que aceptan GGUF, como Ollama, LM Studio o text-generation-webui (si se configuran adecuadamente).
- No se especifican capacidades avanzadas como tool calling, razonamiento multi-paso o visión; se asume que hereda las capacidades del modelo Gemma 4 instruct, pero no hay datos confirmados.

## Casos de uso

- Despliegue de un chatbot local sin restricciones de contenido: el modelo puede integrarse en aplicaciones de atención al cliente o asistentes personales donde se requiera libertad total en las respuestas, ejecutándose en un servidor privado con llama-server.
- Generación de contenido creativo (ficción, guiones, poesía) sin filtros temáticos: su naturaleza abliterada permite explorar temas tabú o controvertidos sin que el modelo se niegue a responder, útil para escritores y guionistas.
- Investigación en alineación y seguridad de modelos de IA: al ser una versión sin rechazo, permite estudiar cómo se comporta un LLM sin mecanismos de seguridad, comparando sus salidas con las del modelo original.
- Prototipado rápido de aplicaciones conversacionales: gracias al formato GGUF y a la posibilidad de ejecutarlo en CPU, se puede iterar rápidamente en entornos de desarrollo sin necesidad de GPUs de gama alta.
- Uso en entornos con requisitos estrictos de privacidad: al ejecutarse localmente, no se envían datos a servidores externos, lo que lo hace adecuado para manejar información sensible en sectores como salud o legal, siempre que el contenido generado no viole normativas.
- Automatización de tareas de redacción técnica o documentación: el modelo puede generar borradores de manuales, informes o artículos sin las limitaciones de contenido habituales, aunque se recomienda supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo cuantizado. Se recomienda consultar la model card del modelo base `TrevorJS/gemma-4-12B-it-uncensored` para posibles evaluaciones, aunque no se garantiza que existan.

## Requisitos de hardware

- Archivo Q4_K_M: 7,4 GB, requiere al menos 8 GB de VRAM para inferencia con contexto corto; con contexto de 8192 tokens, se recomiendan 10-12 GB de VRAM.
- Archivo Q8_0: 12,7 GB, requiere al menos 16 GB de VRAM para un uso cómodo; puede ejecutarse en GPUs como RTX 4080/4090, A100, etc.
- En CPU, ambos archivos pueden ejecutarse con llama.cpp, pero la velocidad será significativamente menor; se recomienda al menos 16 GB de RAM para Q4_K_M y 24 GB para Q8_0.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para Q8_0; RTX 3060/4060 (12 GB) para Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama (si se convierte a formato compatible), LM Studio, text-generation-webui.
- Latencia y throughput: no disponibles; dependerán del hardware y la configuración de contexto.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la misma categoría (LLMs de ~12B sin censura en formato GGUF). Se podría comparar con otras versiones abliteradas de Gemma o Llama, pero no hay información suficiente para establecer una comparativa objetiva.

## Limitaciones y advertencias

- Al ser un modelo abliterado, puede generar contenido ofensivo, ilegal o peligroso sin restricciones. El uso debe ser responsable y en contextos donde no viole leyes o normas éticas.
- Solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Requiere una versión de llama.cpp posterior al 4 de junio de 2026 (PR #24118); versiones anteriores no podrán cargar el modelo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales según el caso.
- No se han publicado evaluaciones de seguridad o sesgos; se desconoce si el modelo presenta sesgos dañinos o alucinaciones frecuentes.
- El contexto máximo no está documentado; usar contextos mayores a 8192 tokens puede causar degradación o errores.
- Al ser una cuantización, puede haber una ligera pérdida de calidad respecto al modelo en bf16, especialmente en tareas de razonamiento complejo.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/Ishowbackup/gemma-4-12B-it-uncensored-GGUF)
- [Modelo base abliterado (bf16)](https://huggingface.co/TrevorJS/gemma-4-12B-it-uncensored)
- [Modelo original de Google](https://huggingface.co/google/gemma-4-12B-it)
- [PR #24118 de llama.cpp (soporte Gemma4Unified)](https://github.com/ggml-org/llama.cpp/pull/24118)
- [Repositorio de abliteración de TrevorJS](https://github.com/TrevorS/gemma-4-abliteration)
