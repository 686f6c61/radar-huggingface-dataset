# burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-GGUF-2026-08-24

## Resumen

El modelo `burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-GGUF-2026-08-24` es una variante cuantizada en GGUF del modelo base `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`, que a su vez deriva de la serie Qwen3.6 de Alibaba. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con aproximadamente 34,7 mil millones de parámetros totales y 3 mil millones de parámetros activos por token, lo que lo hace eficiente para inferencia a pesar de su tamaño. El autor, `burningfeet`, aplica sobre el modelo base su algoritmo propietario "Genesis", un proceso de post-entrenamiento que repara la "pureza de la señal" en los tensores mediante técnicas de estadística matemática y descomposición SVD, con el objetivo de eliminar el ruido acumulado durante el entrenamiento que, según su autor, degrada la estabilidad y aumenta la propensión a alucinaciones.

Este modelo se presenta como una versión "uncensored" (sin censura) y "agentic", con soporte para tool calling y respuestas JSON estructuradas, además de capacidades multimodales (imagen-texto a texto). La versión V10 es la más reciente de la serie Genesis Hermes y se enfoca en comportamiento agéntico y transferencia orientada a Hermes. El repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace, aunque la licencia declarada es Apache 2.0. Está pensado para usuarios que buscan una alternativa sin restricciones de contenido para tareas de razonamiento, generación de código y automatización de agentes, con la ventaja de poder ejecutarse en hardware de consumo mediante cuantización GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mezcla de Expertos (MoE), multimodal (imagen-texto a texto) |
| Parametros totales | 34.660.610.688 (~34,7 mil millones) |
| Parametros activos | ~3 mil millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no se especifican los niveles exactos) |
| Idiomas soportados | Ingles, chino y multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien se mencionan safetensors en los metadatos, pero el repo es GGUF) |

## Arquitectura y entrenamiento

El modelo base `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive` pertenece a la familia Qwen3.6, que utiliza una arquitectura Transformer con capas de mezcla de expertos (MoE). En esta configuración, solo 3 mil millones de parámetros se activan por token, lo que reduce el coste computacional en inferencia en comparación con un modelo denso de 35B. El modelo es multimodal, capaz de procesar tanto texto como imágenes como entrada.

El autor `burningfeet` no realiza fine-tuning tradicional, sino que aplica el algoritmo "Genesis" sobre el modelo base. Según la documentación publicada, Genesis es un algoritmo de regeneración y calibración de datos post-entrenamiento, independiente de la arquitectura, que trabaja sobre los tensores en formato GGUF. El proceso identifica y elimina el "ruido" acumulado durante el entrenamiento (lo que el autor denomina "Noise Gate"), que se manifiesta como inestabilidad, verbosidad excesiva y mayor propensión a alucinaciones. La técnica emplea descomposición en valores singulares (SVD) para reparar la señal de los tensores corruptos. No se han publicado detalles sobre los datos de entrenamiento del modelo base ni sobre el volumen de tokens utilizados. La versión V10 incorpora además una capa de ajuste orientada al comportamiento agéntico y a la generación de respuestas JSON estructuradas, basada en el dataset `NousResearch/hermes-function-calling-v1`.

## Capacidades

- Generacion de texto y razonamiento: el modelo mantiene las capacidades del Qwen3.6 base para tareas de comprension, razonamiento logico y generacion de texto coherente.
- Generacion de codigo: al ser una variante de Qwen, es capaz de escribir y depurar codigo en multiples lenguajes de programacion.
- Soporte de tool calling / function calling: la version V10 esta optimizada para invocar funciones externas y devolver respuestas en formato JSON estructurado, lo que facilita la integracion en pipelines de agentes.
- Comportamiento agente y multi-step reasoning: el modelo puede planificar y ejecutar secuencias de acciones, manteniendo contexto a lo largo de multiples pasos.
- Capacidades multimodales: procesa imagenes junto con texto (image-text-to-text), lo que permite describir imagenes, responder preguntas visuales y realizar tareas de vision-language.
- Multilingue: soporta ingles, chino y otros idiomas, aunque no se especifica la lista completa.
- Modo "uncensored": el modelo no aplica filtros de contenido, lo que permite generar respuestas sobre temas sensibles, aunque esto conlleva riesgos (ver limitaciones).

## Casos de uso

- Asistentes de atencion al cliente sin restricciones tematicas: el modelo puede gestionar conversaciones multi-turno sobre cualquier tema, incluidos aquellos que otros modelos censuran, gracias a su naturaleza "uncensored" y su capacidad de mantener contexto largo (aunque la longitud exacta no esta publicada).
- Agentes de automatizacion de tareas: gracias al soporte de tool calling y respuestas JSON, puede integrarse en sistemas que necesitan ejecutar acciones externas, como enviar correos, consultar APIs o interactuar con bases de datos.
- Generacion de codigo en entornos de desarrollo: puede utilizarse como asistente de programacion en IDEs o en pipelines de CI/CD para generar pruebas unitarias, documentacion o parches de codigo, aprovechando su capacidad de razonamiento y su bajo coste de inferencia por los parametros activos.
- Analisis de imagenes y documentos visuales: al ser multimodal, puede extraer informacion de capturas de pantalla, diagramas o fotografias, combinando la comprension visual con el razonamiento textual.
- Prototipado rapido de chatbots especializados: su licencia Apache 2.0 y su formato GGUF permiten desplegarlo en local o en la nube sin costes de licencia, ideal para experimentar con interacciones conversacionales sin filtros.
- Investigacion en alineacion y seguridad de modelos: al ser una variante sin censura, puede servir como base para estudiar comportamientos no alineados, sesgos y estrategias de mitigacion en entornos controlados de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo especifico. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion GGUF elegida. Para una cuantizacion Q4_K_M, un modelo de 35B con 3B activos requiere aproximadamente 20-24 GB de VRAM, mientras que con Q8 puede necesitar 35-40 GB. Los archivos del repositorio suman 86.8 GB, lo que sugiere que se incluyen multiples cuantizaciones.
- GPU recomendadas: para cuantizaciones bajas (Q4), una RTX 3090/4090 con 24 GB puede ser suficiente. Para cuantizaciones altas o mayor velocidad, se recomienda una A100 (40/80 GB) o H100.
- Compatibilidad con hardware de consumo: si, con cuantizaciones Q4 o Q5, el modelo cabe en GPUs de 24 GB como la RTX 3090 o RTX 4090. Tambien puede ejecutarse en CPU con suficiente RAM (64 GB o mas) usando llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptacion para GGUF), text-generation-webui, y otros runtimes compatibles con GGUF. El modelo declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles. Como referencia orientativa, un MoE de 3B activos suele generar entre 20 y 50 tokens por segundo en una GPU de gama alta, dependiendo de la cuantizacion y el tamaño de la ventana de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10 (este) | ~34,7B | ~3B | no disponible | Si | Apache 2.0 | GGUF |
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | ~34,7B | ~3B | no disponible | Si | Apache 2.0 (presumible) | Safetensors |
| Qwen3.6-35B-A3B (version original de Alibaba) | ~34,7B | ~3B | no disponible | Si | Apache 2.0 (tipico en Qwen) | Safetensors, GGUF |

No se dispone de datos de rendimiento comparativos fiables. La principal diferencia entre este modelo y el base es la aplicacion del algoritmo Genesis, que segun el autor mejora la estabilidad y reduce la verbosidad, y el ajuste orientado a Hermes para tool calling. Frente a otros modelos MoE similares (como Mixtral 8x7B o Qwen2.5-32B-A3B), este modelo destaca por su naturaleza multimodal y su licencia permisiva, aunque la falta de benchmarks publicados impide una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "uncensored", puede reproducir y amplificar sesgos sociales, politicos o culturales presentes en sus datos de entrenamiento. No se han realizado evaluaciones de sesgo publicas.
- Riesgo de alucinacion: aunque el algoritmo Genesis pretende reducirlo, no se han publicado metricas que lo confirmen. En modelos sin censura, las alucinaciones pueden ser especialmente peligrosas si se usan en contextos profesionales.
- Limitaciones de contexto: la longitud de contexto no esta documentada. Es probable que herede la ventana del modelo base Qwen3.6, pero no se puede confirmar.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el acceso al repositorio es restringido (gated) y requiere aceptar condiciones adicionales en HuggingFace, que pueden incluir restricciones de uso no reflejadas en la licencia.
- Uso en produccion: la falta de benchmarks y de documentacion tecnica detallada sobre el algoritmo Genesis hace recomendable una evaluacion exhaustiva antes de un despliegue critico. El modelo no ha sido auditado por terceros.
- Contenido sin filtrar: el modo "uncensored" puede generar contenido ofensivo, ilegal o peligroso. El usuario es responsable del cumplimiento legal y etico en su jurisdiccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-GGUF-2026-08-24
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (enlace inferido, no verificado)
- Descripcion del algoritmo Genesis (version V7): https://huggingface.co/burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF-2026-08-07
- Version V4 en Inferix: https://inferix.co/models/burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V4-MTP-GGUF
- Comparativa V10 vs V9: https://www.aimodels.fyi/models/compare/qwen3.6-35b-a3b-uncensored-genesis-hermes-v10-gguf-luffythefox-vs-qwen3.6-35b-a3b-uncensored-genesis-hermes-v9-gguf-luffythefox
- Version V5 en AIAny: https://aiany.app/item/luffythefox-qwen3-6-35b-a3b-uncensored-genesis-hermes-v5-gguf
