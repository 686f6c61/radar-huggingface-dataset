# mradermacher/L3.1-Phantasmav2-12B-i1-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF con imatrix del modelo `kromcomp/L3.1-Phantasmav2-12B`, un modelo de lenguaje de 12 mil millones de parámetros generado mediante merge de modelos base (mergekit). El autor, mradermacher, ha preparado estos pesos cuantizados para facilitar la ejecución local en hardware de consumo, optimizando la relación entre tamaño, velocidad y calidad mediante la técnica de imatrix (importance matrix). El modelo está etiquetado como orientado a conversación y soporta únicamente inglés.

La relevancia de esta publicación radica en que ofrece una vía práctica para desplegar un modelo de 12B en GPUs de gama media, con opciones de cuantización que van desde 4,7 GB hasta 7,0 GB. Al ser una versión GGUF, es compatible con motores de inferencia como llama.cpp, Ollama o LM Studio, lo que amplía su accesibilidad para desarrolladores e investigadores que necesitan un modelo local de razonamiento y chat sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (nombre sugiere base Llama 3.1, sin confirmar) |
| Parametros totales | 11.956.539.456 (aprox. 12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (4,7 GB), i1-IQ3_M (5,6 GB), i1-Q4_K_S (7,0 GB) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `kromcomp/L3.1-Phantasmav2-12B`. Según la etiqueta `mergekit` y `merge`, se trata de un modelo resultante de la fusión de varios modelos preentrenados, probablemente basados en la familia Llama 3.1 (por el prefijo "L3.1" en el nombre). El proceso de cuantización realizado por mradermacher utiliza la técnica de imatrix (importance matrix) para mejorar la calidad de los pesos cuantizados, especialmente en los niveles de baja precisión. No hay datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta `conversational`).
- Razonamiento y comprensión del lenguaje, propias de un modelo de 12B basado en arquitectura transformer (no confirmado oficialmente).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no especificado.
- Multilingüismo: solo inglés declarado.
- Modo thinking o capacidades especiales (visión, audio): no disponible.

## Casos de uso

- Asistente conversacional local: al ser un modelo de 12B cuantizado a 7 GB (Q4_K_S), puede ejecutarse en una GPU con 8 GB de VRAM, permitiendo un chatbot privado sin conexión para soporte o consulta interna.
- Generación de código en entornos de desarrollo: aunque no se confirma soporte específico de tool calling, un modelo de este tamaño puede asistir en autocompletado y revisión de código si se integra con herramientas como Continue o llama.cpp.
- Análisis de documentos extensos: con una ventana de contexto desconocida, pero típica en modelos de 12B (8K-128K), podría usarse para resumir o extraer información de textos largos, siempre que se verifique la longitud real.
- Prototipado rápido de aplicaciones NLP: gracias a su formato GGUF, se puede desplegar con Ollama o LM Studio para experimentar con prompts y flujos de conversación sin necesidad de infraestructura cloud.
- Educación e investigación: útil para estudiar el comportamiento de modelos cuantizados y merges, comparando la degradación de calidad entre distintos niveles de cuantización (Q2_K vs Q4_K_S).
- Inferencia en entornos con recursos limitados: los quants de menor tamaño (4,7 GB) permiten ejecutar el modelo en GPUs de 6 GB o incluso en CPU con suficiente RAM, habilitando despliegues en edge o en máquinas sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: según el quant elegido, entre 5 GB (i1-Q2_K) y 8 GB (i1-Q4_K_S) para carga completa en GPU. Se recomienda añadir margen para el contexto y overhead del runtime.
- GPU recomendadas: para el quant Q4_K_S, una RTX 3060 12GB o RTX 4060 Ti 16GB sería suficiente; para Q2_K, una GTX 1660 Super 6GB o similar podría funcionar. En CPU, se necesitan al menos 16 GB de RAM para el quant más pequeño.
- Compatibilidad con consumer GPU: sí, los tres quants caben en GPUs de consumo con 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor compatible con GGUF.
- Latencia y throughput: no disponible, pero en una RTX 4090 se esperan decenas de tokens por segundo para Q4_K_S; en CPU, varios segundos por token.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Dado que el modelo base es un merge de 12B, podría compararse con otros GGUF de Llama 3.1 8B o 12B, pero no hay datos de rendimiento ni benchmarks para establecer una comparativa objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un merge de modelos base, puede heredar sesgos de sus fuentes.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se ha evaluado específicamente.
- Limitaciones de contexto o idioma: solo inglés declarado; la longitud de contexto no está especificada, por lo que se debe probar empíricamente.
- Restricciones de licencia: la licencia no está disponible, lo que supone un riesgo para uso comercial. Se recomienda contactar con el autor del modelo base antes de desplegar en producción.
- Caveat de cuantización: los quants de baja precisión (Q2_K, IQ3_M) pueden degradar notablemente la calidad de las respuestas; se recomienda usar Q4_K_S para tareas críticas.
- Al ser un merge no verificado, la calidad y coherencia del modelo pueden ser inconsistentes en comparación con un modelo entrenado desde cero.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/L3.1-Phantasmav2-12B-i1-GGUF
- Modelo base: https://huggingface.co/kromcomp/L3.1-Phantasmav2-12B
- Página de descarga alternativa: https://hf.tst.eu/model#L3.1-Phantasmav2-12B-i1-GGUF
- Quants estáticos (sin imatrix): https://huggingface.co/mradermacher/L3.1-Phantasmav2-12B-GGUF
