# mradermacher/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF estáticas del modelo `DavidAU/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER`, un finetune comunitario construido sobre la familia Qwen3-30B-A3B-Thinking-2507. El autor original (DavidAU) ha expandido la arquitectura Mixture-of-Experts hasta 42.371.414.784 parámetros totales manteniendo la filosofía de activación dispersa de Qwen3 (128 expertos con 8 activos por token), y ha aplicado técnicas de "abliteration" para eliminar los mecanismos de rechazo del modelo base, además de un entrenamiento orientado a código y razonamiento ("MASTER-CODER", "TOTAL-RECALL", "brainstorm 20x").

El resultado es un modelo de razonamiento con modo thinking, ventana de contexto declarada de 256k tokens y especialización en generación de código, matemáticas y tareas multi-paso. La relevancia actual radica en que combina tres tendencias del ecosistema open source: arquitecturas MoE eficientes en inferencia, modelos "sin censura" para investigación de alineamiento, y cuantizaciones GGUF listas para ejecución local en hardware de consumo.

mradermacher actúa únicamente como cuantizador: genera los ficheros GGUF (de Q2_K a Q8_0, además de una variante i1 con imatrix en un repositorio separado) a partir de los pesos originales en safetensors. El modelo se distribuye bajo licencia Apache 2.0 y soporta inglés, francés, chino y alemán según los metadatos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_moe), 128 expertos con 8 activos por token |
| Parametros totales | 42.371.414.784 |
| Parametros activos | 8 de 128 expertos por token (recuento exacto de parámetros activos no disponible) |
| Longitud de contexto | 256k tokens (declarado en los tags del autor) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes i1 con imatrix en repositorio aparte |
| Idiomas soportados | en, fr, zh, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repositorio | 288,5 GB |
| Modelo base | DavidAU/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER |

## Arquitectura y entrenamiento

La arquitectura subyacente es `qwen3_moe`: un transformer decoder-only con capas de mezcla de expertos, 128 expertos por capa y enrutamiento top-8, heredado de Qwen3-30B-A3B-Thinking-2507. El finetune de DavidAU eleva el total de parámetros hasta 42,4 mil millones, presumiblemente mediante expansión de expertos o capas adicionales, manteniendo la activación dispersa para conservar un coste de inferencia próximo al de un modelo denso mucho menor. El modelo conserva el modo thinking (cadenas de razonamiento explícitas antes de la respuesta final) característico de la variante 2507 de Qwen3.

El entrenamiento combina el post-entrenamiento original de Qwen3 (SFT más RLHF/DPO, no detallado en la información disponible) con un finetune comunitario que incluye tres componentes declarados en el nombre: "abliteration" (modificación de pesos para eliminar direcciones de activación asociadas al rechazo), "TOTAL-RECALL-v2" (presumiblemente una receta de recuperación de conocimiento) y "MASTER-CODER" (especialización en código). El autor menciona "brainstorm 20x" como parte de la receta. No se dispone de cifras de tokens de entrenamiento, composición del dataset ni detalles del proceso de abliteration en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, francés, chino y alemán.
- Modo thinking: produce cadenas de razonamiento internas antes de la respuesta, útil para problemas de varios pasos.
- Generación y razonamiento sobre código (etiquetas `coder`, `codeqwen`, `qwen-coder`, `MASTER-CODER`).
- Razonamiento matemático y lógico reforzado por el modo thinking.
- Contexto largo de hasta 256k tokens, adecuado para análisis de repositorios o documentos extensos.
- Comportamiento "uncensored/abliterated": menor tasa de rechazos ante peticiones que el modelo base rechazaría.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible (el modelo base Qwen3 sí lo soporta, pero el finetune no lo documenta).
- Capacidades de agente multi-paso: no documentadas explícitamente; el modo thinking lo hace plausible pero no está verificado.
- Sin capacidades de visión ni audio según los metadatos disponibles.

## Casos de uso

- Generación de código en producción: el modelo está afinado específicamente para código y puede integrarse en pipelines de CI/CD para autocompletado, generación de tests o revisión de parches, con la ventaja de su contexto de 256k para analizar ficheros completos o repositorios pequeños.
- Asistente de programación local: con la cuantización Q4_K_M (25,8 GB) puede ejecutarse en una estación de trabajo con GPU de 24-32 GB, ofreciendo un copiloto de código sin dependencia de APIs externas.
- Análisis de bases de código extensas: la ventana de 256k permite cargar módulos completos o documentación técnica y hacer preguntas de arquitectura, refactorización o detección de bugs.
- Investigación sobre alineamiento y seguridad: al ser un modelo abliterated, sirve para estudiar cómo se comporta un LLM sin mecanismos de rechazo, comparar respuestas con el modelo base y analizar sesgos residuales.
- Razonamiento matemático y resolución de problemas: el modo thinking permite usarlo en tareas de competición, verificación de demostraciones o cálculo simbólico asistido.
- Traducción técnica multilingüe: cubre inglés, francés, chino y alemán, útil para localización de documentación técnica o código con comentarios en varios idiomas.
- Experimentación con MoE en local: al ser GGUF, permite estudiar el comportamiento de un MoE de 42B con activación dispersa en hardware de consumo usando llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero GGUF): Q2_K 15,7 GB; Q3_K_S 18,5 GB; Q3_K_M 20,5 GB; Q3_K_L 22,1 GB; IQ4_XS 23,0 GB; Q4_K_S 24,3 GB; Q4_K_M 25,8 GB; Q5_K_S 29,3 GB; Q5_K_M 30,2 GB; Q6_K 34,9 GB; Q8_0 45,2 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S/Q4_K_M con offload parcial o total ajustado; RTX 3090 (24 GB) equivalente; A6000 (48 GB) o A100 40/80 GB para Q6_K y Q8_0; H100 para despliegues de alta concurrencia.
- En GPU de consumo: sí es viable con cuantizaciones Q2_K a Q4_K_M en tarjetas de 16-24 GB, recurriendo a offload de capas a CPU si la VRAM es justa. En 12 GB solo con Q2_K y offload parcial.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (los tags indican `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa para este modelo; requerirían los pesos safetensors originales.
- Latencia y throughput: no disponibles. Al ser un MoE con 8 expertos activos, el throughput por token es sustancialmente mayor que un denso de 42B, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Qwen3-42B-A3B finetune) | 42,4B totales, MoE top-8 | 256k | Código, razonamiento, sin censura | Apache 2.0 | GGUF, safetensors |
| Qwen3-30B-A3B-Thinking-2507 (base) | 30,5B totales, MoE top-8 | 256k | Razonamiento general | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-Coder-32B-Instruct | 32,5B densos | 128k | Código | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7B totales, MoE | 128k | Código | DeepSeek License | safetensors |

El finetune añade parámetros y elimina restricciones de rechazo respecto al Qwen3 base, pero no se dispone de métricas que permitan afirmar una mejora de rendimiento objetiva frente a Qwen2.5-Coder-32B o el propio Qwen3-30B-A3B.

## Limitaciones y advertencias

- Al ser "abliterated/uncensored", el modelo puede generar contenido que el base rechazaría; no es adecuado para aplicaciones de cara al público sin filtros adicionales.
- La abliteration puede degradar capacidades generales y aumentar la tasa de alucinación en dominios sensibles.
- No hay benchmarks publicados: el rendimiento real frente al base o a modelos similares es desconocido.
- El contexto de 256k es una declaración del autor; la calidad efectiva en ventanas muy largas no está verificada.
- Solo se declaran cuatro idiomas (en, fr, zh, de); el rendimiento en castellano no está garantizado.
- Aunque la licencia es Apache 2.0, el modelo deriva de Qwen3 y de un finetune comunitario; conviene revisar las condiciones del modelo base antes de uso comercial.
- El repositorio ocupa 288,5 GB; descargar todas las cuantizaciones es costoso en almacenamiento.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable según las notas del propio cuantizador.
- No se documenta soporte explícito de tool calling en este finetune, aunque el base sí lo tenga.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER
- Cuantizaciones i1 con imatrix: https://huggingface.co/mradermacher/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
