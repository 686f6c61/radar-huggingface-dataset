# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-i1-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF con imatrix del modelo `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized`, preparada por mradermacher, un autor especializado en generar versiones comprimidas de modelos open source para su ejecución local eficiente. El modelo base es un fine-tune de la familia Qwen3.6, concretamente una variante de 35.5 mil millones de parámetros con arquitectura de mezcla de expertos (MoE, según la nomenclatura A3B), orientada a conversación sin censura y basada en el estilo Hermes. La cuantización reduce el tamaño de los pesos para permitir su uso en hardware de consumo, manteniendo un equilibrio entre calidad y rendimiento.

La relevancia de esta ficha radica en que ofrece una opción práctica para desplegar localmente un modelo de gran tamaño con capacidades conversacionales y de visión (el modelo base es multimodal, aunque los archivos de proyección de visión se encuentran en el repositorio estático). Al estar disponible en varios niveles de cuantización, permite adaptar el despliegue a los recursos de hardware disponibles. No se dispone de información sobre la licencia ni sobre los detalles de entrenamiento del modelo original, lo que limita su uso en entornos comerciales sin verificación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferida del nombre A3B; no confirmada oficialmente) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (el nombre sugiere 3 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S (además de archivo imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. El nombre `Qwen3.6-35B-A3B` sugiere una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token, siguiendo la convención de la serie Qwen3. Sin embargo, este dato no está confirmado en la documentación proporcionada. El modelo base `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized` es un fine-tune orientado a conversación sin censura, probablemente basado en recetas de entrenamiento tipo Hermes, aunque no se especifican los datos de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO. El autor de la cuantización, mradermacher, aplica el proceso de imatrix (importance matrix) para mejorar la calidad de los quants de baja precisión, pero no modifica los pesos del modelo original.

## Capacidades

- Generación de texto y conversación multi-turno, optimizada para diálogos sin restricciones de contenido (etiqueta "uncensored").
- Capacidades de visión: el modelo base es multimodal, aunque los archivos de proyección de visión (mmproj) se encuentran en el repositorio estático, no en este.
- Soporte de formato GGUF, compatible con motores de inferencia como llama.cpp, Ollama y otros que aceptan este formato.
- Etiquetado como "conversational", lo que indica su orientación a chatbots y asistentes.
- No se menciona soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Despliegue local de un asistente conversacional sin censura: al ser un GGUF cuantizado, puede ejecutarse en hardware de consumo (GPU con 16-24 GB de VRAM) para prototipos o uso personal, aprovechando su naturaleza "uncensored" para experimentación creativa o investigación.
- Generación de contenido creativo: el fine-tune Hermes suele estar orientado a seguir instrucciones y generar texto variado, por lo que puede usarse para redacción, guiones o lluvia de ideas en entornos donde no se requiera moderación de contenido.
- Pruebas de inferencia multimodal en local: aunque los archivos de visión están en otro repositorio, combinando este GGUF con el mmproj correspondiente se podría evaluar el modelo en tareas de imagen a texto, siempre que se disponga del hardware adecuado.
- Benchmarking de cuantizaciones: el repositorio ofrece varios niveles de quant (Q2_K, IQ3_M, Q3_K_M, Q4_K_S) que permiten comparar la degradación de calidad frente al uso de memoria, útil para decidir el punto óptimo de compresión en proyectos propios.
- Integración en aplicaciones de chat locales mediante llama.cpp u Ollama: al ser un GGUF estándar, se puede cargar en estos motores para construir un chatbot privado sin depender de APIs externas.
- Investigación sobre modelos MoE de gran tamaño en entornos con recursos limitados: la cuantización permite estudiar el comportamiento de un modelo de 35B con solo 3B activos en tareas de razonamiento o generación, sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- Los tamaños de los archivos GGUF varían: i1-Q2_K (13,3 GB), i1-IQ3_M (15,9 GB), i1-Q3_K_M (17,3 GB) e i1-Q4_K_S (20,5 GB). Estos valores corresponden al tamaño del archivo, no a la VRAM exacta necesaria, pero sirven como referencia.
- Para el quant i1-Q4_K_S (20,5 GB) se recomienda una GPU con al menos 24 GB de VRAM, como una RTX 3090, RTX 4090 o A5000. En GPUs de 16 GB (RTX 4080, RTX 3080 Ti) podría caber con offloading parcial a CPU.
- Los quants más pequeños (Q2_K, IQ3_M) pueden ejecutarse en GPUs de 16 GB, aunque con mayor pérdida de calidad.
- El modelo es compatible con motores que soporten GGUF: llama.cpp, Ollama, LM Studio, entre otros. También se puede usar con vLLM si se convierte a otro formato, aunque no es el propósito de este repositorio.
- No se dispone de datos de latencia o throughput. El rendimiento dependerá del hardware, del quant elegido y del número de parámetros activos (si la arquitectura MoE se confirma, la inferencia será más rápida que un modelo denso equivalente).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El nombre sugiere que pertenece a la familia Qwen3.6, pero no se conocen las especificaciones exactas de otros modelos de esa serie ni de alternativas como Llama 3.1 o Mistral MoE. Se recomienda consultar el repositorio del modelo base para obtener más contexto.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o de redistribución. Es imprescindible contactar con el autor del modelo base antes de utilizarlo en producción.
- El modelo está etiquetado como "uncensored", lo que implica que puede generar contenido ofensivo, ilegal o inapropiado. No es adecuado para aplicaciones orientadas al público general sin un sistema de moderación externo.
- Al ser una cuantización, existe una pérdida de calidad respecto al modelo original, especialmente en los quants de menor precisión (Q2_K, IQ3_M). La degradación puede manifestarse en alucinaciones, incoherencias o errores de razonamiento.
- No se dispone de información sobre sesgos del modelo, pero al estar entrenado principalmente en inglés, su rendimiento en otros idiomas será limitado.
- El repositorio no incluye los archivos de proyección de visión (mmproj); para usar las capacidades multimodales es necesario descargarlos del repositorio estático, lo que añade complejidad al despliegue.
- La fecha de creación (2026) y el número de descargas (0) sugieren que es un modelo muy reciente y sin validación por parte de la comunidad, por lo que su comportamiento en producción no está contrastado.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-i1-GGUF
- Modelo base: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized
- Repositorio estático (quants sin imatrix y mmproj): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-i1-GGUF
