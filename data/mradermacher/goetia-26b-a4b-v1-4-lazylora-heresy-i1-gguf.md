# mradermacher/Goetia-26B-A4B-v1.4-LazyLora-heresy-i1-GGUF

## Resumen

Goetia-26B-A4B-v1.4-LazyLora-heresy-i1-GGUF es una cuantización en formato GGUF con matriz de importancia (imatrix) del modelo Goetia-26B-A4B-v1.4-LazyLora-heresy, preparada por mradermacher. El modelo original es un merge de tipo MoE (mezcla de expertos) que, según la nomenclatura del nombre, presenta 26 mil millones de parámetros totales y 4 mil millones activos por token. Está basado en la arquitectura Gemma 4 (según las etiquetas del repositorio) y está orientado a tareas conversacionales, roleplay y escritura creativa.

Esta versión concreta añade el sufijo "i1", lo que indica que los cuantizados se han generado con una matriz de importancia para mejorar la calidad de la cuantización en los pesos más relevantes. El repositorio ofrece múltiples niveles de cuantización (desde Q2_K hasta Q6_K, incluyendo versiones IQ) para adaptarse a distintos requisitos de memoria y rendimiento. Es relevante para desarrolladores que buscan ejecutar un modelo MoE de 26B en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de infraestructura de servidor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos, inferido del nombre A4B; no confirmado oficialmente) |
| Parametros totales | 26 B (según nombre) |
| Parametros activos | 4 B (según nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según comentario del README) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Goetia-26B-A4B-v1.4-GGUF indica apache-2.0, pero esta variante no lo especifica) |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna ni el proceso de entrenamiento de este modelo. Según las etiquetas del repositorio original, se trata de un merge realizado con la técnica `moe_della` sobre una base Gemma 4. La variante "LazyLora" sugiere que se aplicó una extracción de LoRA (Low-Rank Adaptation) y posteriormente se fusionó sobre un modelo base denominado SOMPOA (según la descripción de FriendliAI). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO.

Al ser una cuantización GGUF, el proceso de conversión se realizó con herramientas como llama.cpp o scripts similares, aplicando una matriz de importancia (imatrix) para optimizar la asignación de bits a los pesos más influyentes. No se documentan innovaciones técnicas adicionales en esta versión.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational", lo que indica su aptitud para mantener diálogos multi-turno.
- Roleplay: las etiquetas del repositorio base incluyen "roleplay", sugiriendo que el modelo puede interpretar personajes y escenarios ficticios.
- Escritura creativa: también se menciona "creative writing", por lo que puede generar historias, guiones u otros contenidos narrativos.
- No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso, capacidades de visión o audio.
- El multilingüismo no está documentado; probablemente el modelo esté entrenado principalmente en inglés, pero no hay confirmación.

## Casos de uso

- Chatbots locales sin conexión: al ser un GGUF, puede ejecutarse con llama.cpp u Ollama en una máquina personal, permitiendo asistencia conversacional sin depender de APIs externas.
- Roleplay interactivo: gracias a su orientación al roleplay, es adecuado para juegos de texto, simulación de personajes o asistentes de ficción en entornos locales.
- Escritura creativa asistida: puede generar borradores de cuentos, poemas o diálogos, sirviendo como herramienta de inspiración para escritores.
- Pruebas de concepto de MoE en hardware modesto: al tener solo 4B activos, permite experimentar con la arquitectura MoE en GPUs de consumo sin necesidad de un clúster.
- Educación e investigación: útil para estudiar el comportamiento de modelos cuantizados con imatrix en tareas de generación de texto.
- Prototipado rápido: los desarrolladores pueden integrarlo en aplicaciones de demostración que requieran generación de texto sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para esta variante específica. Tampoco se han comparado sus métricas con modelos similares.

## Requisitos de hardware

- El tamaño total del repositorio es de 38.5 GB, que incluye todos los archivos de cuantización. Cada archivo individual tiene un tamaño variable según el nivel de cuantización.
- Para una cuantización Q4_K_M (típica para un modelo de 26B totales), el archivo ocuparía aproximadamente 15-18 GB, lo que cabe en GPUs con 24 GB de VRAM como la RTX 3090, RTX 4090 o A5000.
- Para cuantizaciones más agresivas como Q2_K (alrededor de 8-10 GB), podría ejecutarse en GPUs con 12 GB de VRAM (RTX 3060, RTX 4070) o incluso en CPU con suficiente RAM.
- Se recomienda al menos 32 GB de RAM para cargar el modelo en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos. Sin embargo, por su configuración MoE (26B totales, 4B activos), se puede situar en la categoría de modelos eficientes como Mixtral 8x7B (47B totales, 13B activos) o Qwen 2.5 MoE A14B (14B activos). No obstante, al carecer de benchmarks y de información sobre el entrenamiento, no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No hay documentación oficial sobre sesgos, riesgos de alucinación o limitaciones idiomáticas. Se desconoce su comportamiento en dominios especializados.
- La licencia no está especificada en este repositorio, lo que genera incertidumbre sobre su uso comercial. Aunque el modelo base parece tener licencia apache-2.0, esta variante no lo confirma.
- Al ser un modelo cuantizado, puede presentar una degradación de calidad en comparación con el modelo original en precisión completa, especialmente en tareas que requieren razonamiento complejo.
- El tamaño del contexto no está documentado; se recomienda probar con valores conservadores (por ejemplo, 4096 o 8192 tokens) para evitar errores.
- La falta de información sobre el dataset de entrenamiento impide evaluar posibles sesgos culturales o de contenido.
- No se ha verificado la compatibilidad con todas las herramientas de inferencia; se recomienda usar las versiones más recientes de llama.cpp u Ollama.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.4-LazyLora-heresy-i1-GGUF
- Repositorio del modelo base (sin LazyLora): https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.4-GGUF
- Página en FriendliAI (variante Defunct-Heresy): https://friendli.ai/models/MuXodious/Goetia-26B-A4B-v1.4-Defunct-Heresy
- Página en FriendliAI (variante LazyLora-heresy): https://friendli.ai/models/MuXodious/Goetia-26B-A4B-v1.4-LazyLora-heresy
- Repositorio GitHub relacionado (no idéntico): https://github.com/Damacol/mradermacher-gemma-4-26b-a4b-it-heretic-ara-v2-i1-gguf
