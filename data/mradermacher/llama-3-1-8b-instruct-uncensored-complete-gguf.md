# mradermacher/Llama-3.1-8B-Instruct-Uncensored-Complete-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Complete`, una variante "sin censura" del Llama-3.1-8B-Instruct de Meta. El modelo base fue modificado mediante técnicas de *abliteration* y *representation engineering* para eliminar los mecanismos de rechazo de contenido, manteniendo las capacidades generales del modelo original. El autor `mradermacher` ha generado una serie de cuantizaciones estáticas (Q2_K a f16) para facilitar su ejecución en entornos locales con recursos limitados.

La relevancia de este modelo radica en que ofrece una alternativa sin restricciones de contenido para desarrolladores e investigadores que necesitan explorar casos de uso donde el modelo original rechazaría respuestas. Al estar basado en Llama 3.1, hereda una arquitectura transformer de 8.000 millones de parámetros con ventana de contexto amplia (aunque no confirmada en esta versión) y un buen rendimiento general en tareas de lenguaje, razonamiento y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.312 (8,03 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Llama 3.1 soporta 128K, pero no se confirma en esta variante) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (segun etiquetas y model card) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base es una adaptación de Llama-3.1-8B-Instruct, un transformer decoder-only con atención de múltiples cabezas y *grouped query attention* (GQA). La versión "Uncensored-Complete" fue creada mediante *abliteration*, una técnica que elimina la dirección de representación responsable del rechazo de contenido, y *representation engineering* para ajustar el comportamiento del modelo sin reentrenamiento completo. No se dispone de información sobre el dataset de entrenamiento adicional ni sobre el proceso exacto de modificación. El autor `mradermacher` solo ha realizado la cuantización estática de los pesos, sin alterar la arquitectura ni los pesos originales.

## Capacidades

- Generacion de texto y conversacion multi-turno sin restricciones de contenido tematico.
- Razonamiento basico y resolucion de problemas, heredados de Llama 3.1.
- Generacion de codigo en lenguajes comunes (Python, JavaScript, etc.), aunque no se han verificado benchmarks especificos.
- Comprension lectora y respuesta a preguntas en ingles.
- No se confirma soporte de *tool calling* ni *function calling* en esta variante, aunque el modelo base de Llama 3.1 lo incluye.
- No se confirma modo *thinking* ni capacidades multimodales (vision, audio).

## Casos de uso

- Investigacion academica sobre comportamiento de modelos sin censura: el modelo permite estudiar como responde un LLM cuando se eliminan los mecanismos de rechazo, util para analisis de sesgos y seguridad.
- Desarrollo de aplicaciones de rol o ficcion interactiva: al no rechazar contenido explicito, puede generar narrativas adultas o temas tabu sin interrupciones.
- Generacion de contenido creativo sin filtros: escritura de guiones, dialogos o historias que requieran un tono crudo o controversial.
- Pruebas de robustez y alineacion: los equipos de seguridad pueden usar este modelo como caso extremo para evaluar tecnicas de moderacion o deteccion de contenido.
- Creacion de datasets sinteticos para entrenar clasificadores de contenido inapropiado: el modelo puede producir ejemplos variados de texto que un moderador deberia filtrar.
- Despliegue en entornos aislados donde se requiera un LLM sin restricciones para pruebas internas, siempre que se cumplan las politicas de uso de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas para esta variante especifica. Se recomienda consultar los benchmarks del modelo base Llama-3.1-8B-Instruct como referencia aproximada, aunque las modificaciones de *abliteration* pueden alterar el rendimiento en tareas de seguridad o alineacion.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K (3,3 GB) cabe en GPUs con 4 GB; Q4_K_M (5,0 GB) requiere al menos 6 GB; Q8_0 (8,6 GB) necesita 10-12 GB; f16 (16,2 GB) requiere 18 GB o mas.
- GPUs recomendadas: RTX 3060 (12 GB) para Q4_K_M o Q5_K_M; RTX 3090/4090 (24 GB) para Q8_0 o f16; A100/H100 para despliegue en servidor.
- Es compatible con GPUs de consumo medio (RTX 3060, 4060, 4070) usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptacion a GGUF), text-generation-webui, LM Studio.
- Latencia y throughput: no se han medido en esta variante; en un RTX 4090 con Q4_K_M se esperan velocidades de 40-60 tokens/s, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (original) | 8,03 B | 128K | llama3.1 | safetensors, GGUF | Con censura, benchmarks publicados |
| ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Complete | 8,03 B | No disponible | llama3.1 | safetensors | Sin censura, sin benchmarks |
| mradermacher/Llama-3.1-8B-Instruct-Uncensored-Complete-GGUF | 8,03 B | No disponible | llama3.1 | GGUF | Cuantizaciones de la version anterior |

No se dispone de datos de rendimiento comparativo. La principal diferencia es la ausencia de rechazo de contenido y el formato GGUF para inferencia local.

## Limitaciones y advertencias

- Al ser una version "uncensored", puede generar contenido ofensivo, ilegal o eticamente cuestionable. El usuario es responsable del uso.
- Riesgo de alucinaciones: al igual que otros LLMs, puede inventar hechos o datos, especialmente en temas controvertidos.
- Solo se confirma soporte para ingles; otros idiomas pueden tener un rendimiento degradado.
- La licencia llama3.1 permite uso comercial, pero se deben revisar los terminos completos de Meta para el modelo base.
- No se han realizado evaluaciones de seguridad ni de sesgos en esta variante; se desconoce si la *abliteration* introduce sesgos adicionales.
- El contexto maximo no esta confirmado; si se usa con ventanas largas, puede haber degradacion o errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-Uncensored-Complete-GGUF
- Modelo base: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Complete
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-Uncensored-Complete-i1-GGUF
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
