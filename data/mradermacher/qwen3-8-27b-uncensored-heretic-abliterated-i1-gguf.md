# mradermacher/Qwen3.8-27B-Uncensored-Heretic-Abliterated-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Uncensored-Heretic-Abliterated-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo `alexander2323/Qwen3.8-27B-Uncensored-Heretic-Abliterated`, una versión "desensurada" (uncensored) del modelo Qwen3.8-27B original. El proceso de desensurado utiliza la técnica de abliteration (ablación direccional) implementada en la herramienta Heretic, que elimina la alineación de seguridad sin necesidad de reentrenamiento. El resultado es un modelo de 27 mil millones de parámetros que responde sin filtros de contenido, pensado para investigación sobre seguridad y generación libre de texto.

Este repositorio en concreto solo contiene el archivo de calibración imatrix (de 0,1 GB) que se emplea para generar cuantizaciones de alta calidad; los archivos GGUF cuantizados (Q2_K, Q4_K_M, Q6_K, etc.) están disponibles en el repositorio hermano `mradermacher/Qwen3.8-27B-Uncensored-Heretic-Abliterated-GGUF`. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque el carácter "uncensored" del modelo implica riesgos legales y éticos en aplicaciones productivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, detalles específicos no disponibles) |
| Parametros totales | 27B (según nombre del modelo) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 262.000 tokens (según modelo base) |
| Tipos de cuantizacion | imatrix (archivo de calibración); quants GGUF disponibles en repo hermano: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Inglés (declarado); chino y otros según modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo .gguf imatrix) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de 27.000 millones de parámetros con ventana de contexto de 262.000 tokens y capacidades multimodales (texto e imagen) según la información disponible. Sobre este modelo, `alexander2323` aplicó el proceso de abliteration mediante la herramienta Heretic, que combina ablación direccional (Arditi et al. 2024) con un optimizador de parámetros basado en TPE (Optuna). Este proceso elimina selectivamente las direcciones del espacio de activaciones responsables de la "safety alignment", logrando un modelo sin censura sin reentrenamiento costoso. La cuantización imatrix realizada por `mradermacher` utiliza matrices de importancia para mejorar la precisión de los quants, especialmente en los niveles de baja bitrate.

No se dispone de información detallada sobre el dataset de entrenamiento original de Qwen3.8-27B ni sobre el proceso de fine-tuning (si lo hubo) para la versión abliterada.

## Capacidades

- Generación de texto libre sin filtros de contenido (sin restricciones de seguridad).
- Razonamiento y resolución de problemas en dominios generales.
- Generación de código y soporte para tareas de programación.
- Capacidades matemáticas y de lógica.
- Soporte multimodal (texto e imagen) según el modelo base Qwen3.8-27B.
- Modo "thinking" (razonamiento extendido) disponible en el modelo base.
- Soporte de tool calling / function calling (probable, aunque no confirmado explícitamente).
- Multilingüe (inglés, chino y otros idiomas según el modelo base).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de modelos sin "safety alignment" en entornos controlados, facilitando la comparación con versiones alineadas.
- Generación creativa de contenido sin restricciones: escritura de ficción, poesía, guiones o diálogos donde la censura del modelo base limitaría la libertad creativa.
- Desarrollo de aplicaciones de chat "sin filtros" para nichos específicos (roleplay, narrativa interactiva) donde los usuarios demandan respuestas sin moderación.
- Evaluación de técnicas de ablación: al ser una cuantización imatrix, sirve como referencia para probar métodos de cuantización y su impacto en modelos desensurados.
- Pruebas de robustez: analizar cómo responde el modelo a prompts adversariales o contenido sensible en comparación con versiones alineadas.
- Despliegue local en entornos de investigación: gracias a los quants GGUF, puede ejecutarse en hardware de consumo (GPU con 16-24 GB VRAM) mediante llama.cpp u Ollama, sin depender de servicios cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es una cuantización, por lo que su rendimiento depende del quant elegido; se espera una degradación mínima en tareas de razonamiento con quants de alta calidad (Q6_K, Q4_K_M) respecto al modelo original, pero no hay datos numéricos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo de 27B, un quant Q4_K_M requiere aproximadamente 16-18 GB de VRAM; Q6_K requiere unos 22-24 GB; Q2_K puede caber en 10-12 GB.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para quants altos; GPUs con 16 GB (RTX 4080, 3090) para Q4.
- En CPU: puede ejecutarse con llama.cpp usando RAM (32-64 GB recomendados), con menor velocidad.
- Opciones de despliegue: llama.cpp, Ollama (con el comando `ollama run`), vLLM (si se convierten los pesos a formato compatible), text-generation-webui, etc.
- Latencia y throughput: no disponibles; dependen del hardware y del quant.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | Alineado, con censura |
| Qwen3.8-27B-Uncensored-Heretic-Abliterated (este) | 27B | 262K | Apache 2.0 | Sin censura, abliterado |
| Huihui-Qwen3.8-27B-abliterated | 27B | 262K | Apache 2.0 | También abliterado, disponible en Ollama |
| Qwen3.8-27B-Uncensored (versión sin Heretic) | 27B | 262K | Apache 2.0 | Abliterado sin optimización TPE |

La principal diferencia entre este modelo y otros abliterados es el uso de Heretic, que optimiza el proceso de ablación con un buscador de hiperparámetros, potencialmente logrando una eliminación más completa de la censura. No hay benchmarks comparativos publicados.

## Limitaciones y advertencias

- Al ser "uncensored", el modelo puede generar contenido dañino, ilegal o éticamente cuestionable. No debe desplegarse en producción sin filtros adicionales.
- Riesgo elevado de alucinación, especialmente en temas sensibles o de actualidad.
- El proceso de abliteration puede degradar ligeramente el rendimiento en tareas de razonamiento o seguir sesgos del modelo original.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede incurrir en responsabilidades legales según la jurisdicción.
- El repositorio actual solo contiene el archivo imatrix; los quants reales están en otro repositorio, lo que puede causar confusión.
- No hay información sobre el dataset de entrenamiento ni sobre la evaluación de sesgos.

## Enlaces

- Repositorio HuggingFace (este): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Heretic-Abliterated-i1-GGUF
- Modelo base (alexander2323): https://huggingface.co/alexander2323/Qwen3.8-27B-Uncensored-Heretic-Abliterated
- Repositorio de quants estáticos: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Heretic-Abliterated-GGUF
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Guía de quants de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de overview de mradermacher: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-Heretic-Abliterated-i1-GGUF
