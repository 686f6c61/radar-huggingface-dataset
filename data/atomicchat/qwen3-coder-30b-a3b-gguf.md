# AtomicChat/Qwen3-Coder-30B-A3B-GGUF

## Resumen

AtomicChat/Qwen3-Coder-30B-A3B-GGUF es la versión cuantizada a formato GGUF del modelo Qwen3-Coder-30B-A3B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio lo mantiene AtomicChat, que ha convertido los pesos originales a f16 GGUF y ha generado una escalera completa de cuantizaciones calibradas con una matriz de importancia (imatrix) propia, en lugar de repaquetar ficheros de terceros. El objetivo es permitir la ejecución local y totalmente offline de un modelo de código de 30.500 millones de parámetros en hardware de consumo.

Se trata de un transformer de tipo Mixture-of-Experts con 48 capas, 128 expertos enrutados con top-8 y atención con 32 cabezas sobre 4 cabezas KV (GQA). Solo una fracción de los parámetros se activa por token (denominación A3B, en torno a 3.000 millones), lo que reduce el coste de cómputo por token frente a un modelo denso del mismo tamaño. La ventana de contexto publicada es de 262.144 tokens (256K), con un vocabulario de 151.936 entradas y modalidad exclusivamente de texto.

Su relevancia actual reside en la combinación de tres factores: licencia Apache 2.0 (uso comercial sin restricciones adicionales), soporte de codificación agéntica con un formato de function calling específico y compatibilidad con el ecosistema llama.cpp/Ollama/LM Studio. El repositorio tiene 6.718 descargas y 5 likes, y el tamaño total del repo es de 296,5 GB debido a que alberga todas las cuantizaciones en un mismo artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (`Qwen3MoeForCausalLM`), 48 capas, 128 expertos enrutados con top-8, 32 cabezas de atención sobre 4 cabezas KV (GQA) |
| Parámetros totales | 30.532.122.624 (30,5B) |
| Parámetros activos | Aproximadamente 3B por token (designación A3B del modelo; sin cifra exacta publicada en la información disponible) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | Q2_K (11,3 GB), IQ3_M (13,5 GB), Q3_K_M (14,7 GB), Q3_K_L (15,9 GB), IQ4_XS (16,4 GB), Q4_K_S (17,5 GB), Q4_K_M (18,6 GB), UD-Q4_K_XL (18,8 GB), Q5_K_S (21,1 GB), Q5_K_M (21,7 GB), Q6_K (25,1 GB), Q8_0 (32,5 GB); todas calibradas con imatrix |
| Idiomas soportados | No disponible (la model card del repositorio no especifica listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base original en safetensors |
| Vocabulario | 151.936 tokens |
| Modalidades | Texto |
| Modelo base | Qwen/Qwen3-Coder-30B-A3B-Instruct |
| Cuantizador | AtomicChat (autocuantizado desde los pesos originales) |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only de tipo Mixture-of-Experts (`Qwen3MoeForCausalLM`) con 48 capas y 128 expertos enrutados, de los cuales se activan los 8 mejores por token. La atención usa 32 cabezas de consulta sobre 4 cabezas KV, lo que reduce drásticamente el tamaño del cache KV frente a atención multi-cabeza completa y facilita el despliegue con contextos largos. El vocabulario es de 151.936 tokens y el modelo es estrictamente de texto. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card del modelo base de Qwen, que no se incluye en esta ficha.

La innovación relevante de este repositorio concreto no está en la arquitectura, sino en el proceso de cuantización: conversión de los pesos originales a f16 GGUF, construcción de una matriz de importancia sobre un corpus de calibración propio y cuantización de toda la escalera con `--imatrix`. La variante `UD-Q4_K_XL` fija además los tensores de embedding de tokens y de salida en Q8_0, de modo que mantiene la huella de un 4-bit con mayor fidelidad en esas capas. Las cuantizaciones Q5_K_M, Q5_K_S, Q6_K y Q8_0 fueron reconstruidas el 26/10/2026 porque las subidas de junio no eran ficheros GGUF válidos, según se documenta en la discusión #1 del repositorio.

## Capacidades

- Generación de texto y código en múltiples lenguajes de programación, con orientación explícita a tareas de codificación agéntica.
- Razonamiento multi-paso para resolución de problemas de programación, refactorización y depuración.
- Soporte de function calling / tool calling con un formato de llamada diseñado específicamente para el modelo.
- Integración con plataformas de codificación agéntica como Qwen Code y CLINE, según indica la model card.
- Conversación multi-turno con plantilla de chat propia (requiere `--jinja` en llama.cpp para aplicarla correctamente).
- Capacidad de ejecución totalmente offline una vez descargado el fichero GGUF.
- No dispone de visión, audio ni otras modalidades: la model card declara únicamente texto.
- No se documenta en la información disponible un modo "thinking" explícito ni parámetros de razonamiento extendido separados.

## Casos de uso

- Asistente de código en el IDE: el modelo puede conectarse a CLINE o a un servidor compatible con la API de OpenAI y resolver tareas de edición multiarchivo. Su ventana de 256K tokens permite cargar varios ficheros del repositorio en una sola petición sin truncar.
- Automatización de revisiones de código en CI/CD: mediante tool calling, el modelo puede invocar herramientas de análisis estático, leer los resultados y generar un informe de revisión o un parche propuesto dentro de un pipeline.
- Agente de navegación y operación de herramientas: la model card cita explícitamente tareas de *agentic browser-use*, por lo que encaja en flujos donde el modelo decide qué herramienta invocar y encadena varias llamadas.
- Migración y modernización de código legacy: con contexto largo se puede pasar un módulo completo y pedir la traducción a otro lenguaje o framework manteniendo coherencia entre ficheros.
- Generación de tests unitarios y documentación técnica a partir del código fuente, ejecutable en local sin enviar propiedad intelectual a servicios externos.
- Despliegue en entornos con requisitos de soberanía del dato (banca, sanidad, administración pública): al ser Apache 2.0 y ejecutarse offline, no hay cesión de datos a terceros ni restricciones de uso comercial.
- Prototipado rápido en estaciones de trabajo con una sola GPU: la variante Q4_K_M (18,6 GB) cabe en una RTX 4090 o RTX 3090 y permite iterar sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma de forma cualitativa un rendimiento destacado entre modelos abiertos en tareas de *agentic coding* y *agentic browser-use*, pero no incluye cifras de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra evaluación, por lo que no se presenta tabla comparativa de resultados.

## Requisitos de hardware

- VRAM estimada: el tamaño del fichero GGUF más overhead de runtime (aproximadamente 1-2 GB) más el cache KV del contexto configurado. Con GQA de 4 cabezas KV el cache es comparativamente pequeño, pero a 256K tokens sigue siendo un factor limitante; se recomienda ajustar `-c` al contexto real necesario.
- GPU de 12-16 GB: solo caben Q2_K (11,3 GB) e IQ3_M (13,5 GB), con contexto reducido y pérdida de calidad apreciable en Q2_K.
- GPU de 24 GB (RTX 3090, RTX 4090, A10G): Q4_K_M (18,6 GB) y UD-Q4_K_XL (18,8 GB) son la opción recomendada; Q5_K_M (21,7 GB) entra justo y deja poco margen para contexto.
- GPU de 32 GB (RTX 5090): Q6_K (25,1 GB) cabe con holgura; Q8_0 (32,5 GB) queda al límite.
- GPU de 48 GB o superior (A6000, RTX 6000 Ada, L40S): Q8_0 (32,5 GB) con contexto amplio.
- Múltiples GPU o configuraciones híbridas CPU+GPU: viable con `-ngl` parcial en llama.cpp para las cuantizaciones mayores.
- Despliegue: llama.cpp (`llama-server -hf AtomicChat/qwen3-coder-30b-a3b-GGUF:Q4_K_M --jinja -ngl 99 -fa on`), Ollama (`ollama run hf.co/AtomicChat/qwen3-coder-30b-a3b-GGUF:Q4_K_M`), LM Studio, Jan y la aplicación Atomic Chat.
- Aceleración: el ejemplo oficial compila con `-DGGML_CUDA=ON` y usa `-fa on` (flash attention) para reducir memoria del cache KV.
- Latencia y throughput: no disponible. Al activar solo en torno a 3B parámetros por token, la decodificación debería ser sustancialmente más rápida que la de un modelo denso de 30B con el mismo ancho de banda de memoria, pero no se han publicado mediciones.
- Parámetros de muestreo recomendados por el autor: temperature 0,7, top_p 0,8, top_k 20, repetition_penalty 1,05.

## Comparativa con modelos similares

Datos de las model cards públicas de cada alternativa; conviene verificarlos antes de tomar decisiones de producción.

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B (este repo, GGUF) | 30,5B | ~3B (MoE top-8) | 262.144 | Apache 2.0 | GGUF |
| Qwen2.5-Coder-32B-Instruct | 32,5B | 32,5B (denso) | 131.072 | Apache 2.0 | safetensors, GGUF, AWQ |
| DeepSeek-Coder-V2-Lite-Instruct | ~15,7B | ~2,4B (MoE) | 128.000 | Licencia propia de DeepSeek (uso comercial con condiciones) | safetensors |
| Codestral-22B-v0.1 | 22B | 22B (denso) | 32.000 | MNPL (restricciones de uso comercial) | safetensors |

Frente a un denso de 32B, la ventaja de este modelo es el coste de inferencia por token (solo ~3B activos) y una ventana de contexto el doble de amplia; la desventaja es que la VRAM necesaria sigue viniendo del total de parámetros, no de los activos. Frente a Codestral-22B, la licencia Apache 2.0 elimina las restricciones comerciales de MNPL y multiplica por ocho la ventana de contexto.

## Limitaciones y advertencias

- Las cuantizaciones bajas degradan la calidad: Q2_K (11,3 GB) presenta, según el propio autor, una caída de calidad clara; IQ3_M y Q3_K_M son utilizables pero no equivalentes al modelo original.
- Es imprescindible pasar `--jinja` en llama.cpp para aplicar la plantilla de chat de Qwen3 Coder; sin ella el modelo puede emitir turnos malformados, lo que rompe pipelines agénticos.
- Si se descargaron las cuantizaciones Q5_K_M, Q5_K_S, Q6_K o Q8_0 antes del 26/10/2026, hay que volver a descargarlas: las subidas de junio no eran ficheros GGUF válidos.
- Riesgo de alucinación inherente a los modelos de código: puede generar APIs, funciones de librería o firmas inexistentes; es necesario validar con compilación y tests antes de aceptar código en producción.
- Solo modalidad de texto: no admite imágenes, diagramas ni audio como entrada.
- La información disponible no especifica los idiomas soportados; aunque la familia Qwen3 es multilingüe, no hay confirmación documentada en este repositorio para el rendimiento en castellano.
- Ventana de 256K tokens nominal: en la práctica, el cache KV a contextos muy largos consume VRAM adicional y degrada el throughput, por lo que conviene limitar `-c` al caso de uso real.
- Licencia Apache 2.0 sobre los pesos cuantizados, con enlace a la licencia del modelo base de Qwen; no se han documentado restricciones adicionales, pero conviene revisar el fichero LICENSE del modelo base antes de un despliegue comercial.
- El repositorio pesa 296,5 GB porque incluye todas las cuantizaciones; conviene descargar solo el fichero concreto y no clonar el repo completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/Qwen3-Coder-30B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/LICENSE
- Aplicación Atomic Chat: https://atomic.chat
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Discusión sobre los ficheros GGUF no válidos: https://huggingface.co/AtomicChat/Qwen3-Coder-30B-A3B-GGUF/discussions/1
