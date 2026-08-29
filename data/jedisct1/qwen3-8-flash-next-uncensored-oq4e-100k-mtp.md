# jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP

## Resumen

Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP es una cuantizacion nativa para oMLX del modelo `orcarouter/Qwen3.8-Flash-Next-Uncensored`, desarrollada por jedisct1. Se trata de un modelo multimodal (image-text-to-text) de la familia Qwen3.8, que incorpora la arquitectura híbrida GDN + QSA de Qwen3.8-Flash-Next, con un total de 31.377.486.179 parámetros. La cuantizacion oQ4e con grupo de tamaño 64 reduce el peso a 108,8 GB, manteniendo la torre de visión Qwen4, la cabeza MTP del checkpoint y la configuración nativa de 262.144 tokens de contexto.

El modelo está diseñado específicamente para ejecutarse en Apple Silicon con 128 GiB de memoria unificada mediante oMLX, ofreciendo una API compatible con OpenAI. La versión "Uncensored" elimina los alineamientos de seguridad habituales, lo que la hace adecuada para tareas de generación sin restricciones, aunque con los riesgos asociados. Su relevancia radica en combinar capacidades de visión, tool calling y razonamiento en un paquete optimizado para hardware de Apple, con un límite práctico de 100.000 tokens de contexto validado experimentalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GDN + QSA (Qwen3.8-Flash-Next) con torre de visión Qwen4 |
| Parametros totales | 31.377.486.179 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; 100.000 tokens recomendados en 128 GiB |
| Tipos de cuantizacion | oQ4e (grupo 64), Q8 para expertos no calibrados, BF16 para capas criticas |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (22 shards, 108,8 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina atención GDN (Gated Differential Attention) con QSA (Quadratic Self-Attention), según la documentación oficial de QwenLM. Esta combinación busca mejorar la capacidad del modelo mientras optimiza la eficiencia computacional y la estabilidad del entrenamiento. El checkpoint original de `orcarouter` añade la variante "Uncensored", que elimina los mecanismos de rechazo de contenido.

La cuantizacion oQ4e aplicada por jedisct1 utiliza calibración estricta sobre 937 módulos con 1.024 secuencias de 512 tokens. Siete expertos enrutados en las capas base 0 y 1 no fueron seleccionados por el corpus de calibración, por lo que sus proyecciones se mantienen en Q8 con error de reconstrucción 164 veces menor que Q4. La cabeza del modelo de lenguaje, las proyecciones del mezclador de hiperconexión y las fusiones MTP permanecen en BF16 para preservar la calidad de salida y la aceptación de borradores MTP.

## Capacidades

- Generación de texto y razonamiento multi-step con modo de razonamiento configurable (`reasoning_effort`).
- Comprensión de imágenes gracias a la torre de visión Qwen4 integrada (pipeline image-text-to-text).
- Soporte de tool calling y function calling, validado con agentes de codificación.
- Capacidad de procesamiento de contexto largo hasta 100.000 tokens en configuraciones de 128 GiB.
- MTP (Multi-Token Prediction) incluido, aunque desaconsejado para agentes de codificación por menor precisión en tool soak.
- API compatible con OpenAI a través de oMLX, permitiendo integración con clientes existentes.
- Capacidades multilingües heredadas de la familia Qwen, aunque los idiomas exactos no estan documentados.

## Casos de uso

- Agentes de codificacion autónomos: el modelo puede integrarse en entornos de desarrollo mediante la API de oMLX, con `reasoning_effort` en `medium` para equilibrar velocidad y calidad. Su soporte de tool calling permite interactuar con repositorios, ejecutar comandos y modificar archivos.
- Asistencia técnica con contexto largo: con 100.000 tokens de ventana, puede analizar documentación extensa, logs de producción o codebases completas para responder preguntas complejas.
- Análisis de documentos mixtos: al combinar visión y texto, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con texto, útil para extraer información de manuales técnicos o informes.
- Generación de contenido sin restricciones: la variante "Uncensored" permite crear textos creativos, guiones o material narrativo sin filtros de seguridad, adecuado para investigación o proyectos artisticos.
- Razonamiento matemático y lógico: su arquitectura híbrida y modo de razonamiento permiten resolver problemas de programación competitiva o verificación formal con cadenas de pensamiento extensas.
- Despliegue local en Mac Studio o MacBook Pro: organizaciones que requieren procesamiento de datos sensibles pueden ejecutar el modelo completamente en local, sin enviar datos a la nube, gracias a oMLX y el soporte de Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada es la prueba de recuperación de contexto largo: con un prompt de 99.744 tokens y 256 tokens de salida, el modelo recuperó códigos exactos en las posiciones 569, 51.721 y 98.256, con un pico de 91,01 GiB de memoria física y sin crecimiento de swap. Con caché SSD paginada, la misma prueba se completó en 11,93 segundos.

## Requisitos de hardware

- VRAM estimada: 84,62 GiB de memoria MLX y 91,01 GiB de memoria física en el pico para 100.000 tokens.
- GPU recomendada: Apple Silicon con 128 GiB de memoria unificada (probado en M5 Max).
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por su tamaño y dependencia de oMLX.
- Opciones de despliegue: oMLX 0.6.3 o superior, con API OpenAI-compatible. No compatible con vLLM, llama.cpp u Ollama.
- Latencia: una caché SSD de 98.304 tokens se completó en 11,93 segundos; la prefill sin caché para el mismo prompt no se documenta.
- Throughput: no disponible.
- Almacenamiento: 108,8 GB de pesos en disco, más espacio para caché SSD (recomendado 100 GB).

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con modelos equivalentes. El modelo base Qwen3.8-Flash-Next tiene una variante de 27B parámetros publicada por Qwen, pero no se han encontrado benchmarks comparativos entre la versión cuantizada y el original. La familia Qwen3.8 incluye modelos de 125B parámetros con 6B activos por token, pero esta cuantizacion concreta no tiene equivalentes documentados en el ecosistema oMLX.

## Limitaciones y advertencias

- La variante "Uncensored" elimina los mecanismos de seguridad, lo que puede generar contenido inapropiado, ofensivo o peligroso. No es adecuada para aplicaciones orientadas al público general sin supervisión humana.
- El límite de 100.000 tokens es una recomendación de seguridad para 128 GiB; intentar superarlo puede causar fallos de memoria o degradación del rendimiento.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; es necesario revisar los términos completos antes de desplegar en producción.
- El modelo solo funciona con oMLX en Apple Silicon; no es portable a otras plataformas sin re-cuantizacion.
- MTP debe desactivarse para agentes de codificación, ya que reduce la precisión en tool calling.
- La caché SSD requiere un disco rápido y suficiente espacio; el primer request que puebla la caché consume más memoria que los posteriores.
- No se han publicado evaluaciones de sesgos, alucinación o calidad en tareas estandarizadas, por lo que su comportamiento en dominios especificos es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Colección de jedisct1: https://huggingface.co/collections/jedisct1/qwen38-flash-next
- Repositorio oficial Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Modelo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Información sobre Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
