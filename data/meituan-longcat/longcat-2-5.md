# meituan-longcat/LongCat-2.5

## Resumen

LongCat-2.5 es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por meituan-longcat (Meituan). Con 1,6 billones de parámetros totales y aproximadamente 48 mil millones activados por token, está diseñado específicamente para tareas agénticas de horizonte largo: desarrollo sobre bases de código complejas, construcciones de proyecto completas, diseño creativo y tareas 3D. Se distribuye bajo licencia MIT y su pipeline principal es image-text-to-text.

El modelo parte de LongCat-2.0 y añade modelado visual nativo: las características visuales a resolución nativa se convierten en tokens discretos y se alinean conjuntamente con el texto en un espacio semántico compartido, siguiendo el trabajo previo LongCat-Next. El entrenamiento combina RL agéntico sobre tareas de ingeniería reales, aprendizaje multi-profesor mediante destilación KL de vocabulario completo y Tree Attention, y optimizaciones de infraestructura para contexto largo y aceleradores de IA domésticos.

Su relevancia actual radica en que compite directamente con modelos frontera propietarios (GPT-5.5, GPT-5.6-Sol, Claude-Opus-4.8/5) en benchmarks de agente de código, con una licencia permisiva y pesos abiertos. El repositorio ocupa 3.562 GB, lo que refleja el tamaño del checkpoint completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal nativo |
| Parámetros totales | 1.779.752.648.320 (≈1,78 B) según safetensors; la model card indica 1,6 B |
| Parámetros activos | ≈48 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

LongCat-2.5 es un transformer MoE con 1,78 billones de parámetros totales y unos 48 mil millones activos por token. La innovación arquitectónica principal es el modelado visual nativo: las características visuales a resolución nativa se discretizan en tokens y se alinean con el texto en un espacio semántico compartido, lo que permite un tratamiento unificado de modalidades en lugar de un adaptador visual acoplado. El entrenamiento incluye SFT de secuencias largas con paralelismo supernode-aware, sharding eficiente y solapamiento comunicación-cómputo, reportando un 86% más de throughput por dispositivo que la línea base DDP en las tareas de SFT de secuencia larga indicadas.

El post-entrenamiento combina RL agéntico de horizonte largo sobre tareas de ingeniería del mundo real y fallos de agente reproducibles, con estrategias de rollout eficientes y salvaguardas contra reward hacking. Se emplea aprendizaje multi-profesor: profesores especializados en agente, razonamiento e interacción guían al modelo mediante destilación KL de vocabulario completo y Tree Attention, reforzando ejecución multi-turno, razonamiento, seguimiento de instrucciones y seguridad. La infraestructura de RL mantiene probabilidades de log de tokens idénticas bit a bit entre entrenamiento, prefill y decodificación, y la optimización de caché KV junto con LSA casi duplica la capacidad de KV en decodificación sin incrementar el TPOT en la carga de trabajo probada.

## Capacidades

- Generación de texto y razonamiento multimodal image-text-to-text.
- Comprensión visual nativa a resolución nativa mediante tokens visuales discretos.
- Codificación agéntica: desarrollo sobre bases de código complejas y construcciones de proyecto completas.
- Ejecución de tareas agénticas de horizonte largo con razonamiento multi-paso.
- Tareas creativas de diseño y tareas 3D.
- Conversación multi-turno con seguimiento de instrucciones reforzado vía destilación multi-profesor.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agente de código en producción: el modelo está entrenado con RL agéntico sobre tareas de ingeniería reales, por lo que puede ejecutar flujos de terminal y resolución de incidencias en pipelines de CI/CD con ejecución end-to-end verificable.
- Construcción de proyectos completos: adecuado para generar y estructurar múltiples ficheros y módulos de una aplicación a partir de una especificación, gracias a su entrenamiento en full-project builds.
- Asistente de desarrollo sobre bases de código grandes: su naturaleza de contexto largo (entrenado con secuencias largas) permite razonar sobre repositorios extensos en una sola sesión.
- Diseño creativo asistido: la combinación de entrada image-text-to-text y generación de texto permite iterar sobre bocetos o referencias visuales y producir especificaciones o código de UI.
- Tareas 3D y pipelines de contenido: el modelo declara capacidades para tareas 3D, útil en herramientas de generación y manipulación de escenas o assets.
- Automatización de agentes multi-paso: con razonamiento multi-turno reforzado, encaja en orquestadores de agentes que requieren seguir instrucciones complejas y mantener estado entre pasos.
- Evaluación y prototipado de investigación: al ser MIT y con pesos safetensors, sirve para experimentación académica sobre modelos MoE multimodales a gran escala.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las puntuaciones con `*` proceden de informes públicos o leaderboards; las no marcadas son mediciones internas indicativas. `-` indica no reportado.

| Benchmark | LongCat-2.5 | LongCat-2.0 | GPT-5.5 | GPT-5.6-Sol | Claude-Opus-4.8 | Claude-Opus-5 | GLM-5.3 | kimi-k3 | DeepSeek-V4.1-Flash |
|---|---|---|---|---|---|---|---|---|---|
| Terminal Bench v2.1 | 88,4 | 70,8 | 83,2* | 88,8* | 74,6* | 89,1* | 88,2* | 88,3* | 90,6* |
| Terminal Bench v4.0 | 38,5 | 3,0 | - | 37,3* | 23,6* | 53,9* | 41,8* | 12,6* | 31,2* |
| Program Bench (Almost Resolved) | 25,5 | 2,5 | 13,5* | 23,0* | - | - | - | - | - |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de visión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 1,78 B de parámetros totales, el checkpoint completo en safetensors ocupa aproximadamente 3.562 GB en el repositorio; la inferencia requiere sharding multi-GPU.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño, se requiere un clúster multi-nodo con GPUs de centro de datos (tipo A100/H100 o aceleradores domésticos citados en la model card); no se especifican modelos concretos.
- ¿Cabe en GPU consumer? No. El tamaño del modelo (miles de GB) descarta GPUs de consumo individuales.
- Opciones de despliegue: no disponible. El repo usa `custom_code`, por lo que la carga requiere código propio del autor; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La model card menciona mejoras relativas (86% más de throughput por dispositivo que DDP en SFT de secuencia larga; casi el doble de capacidad KV en decodificación sin aumento de TPOT en la carga probada), pero sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Terminal Bench v2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongCat-2.5 | 1,78 B totales / ~48 B activos | no disponible | 88,4 | MIT | Pesos abiertos en HF |
| DeepSeek-V4.1-Flash | no disponible | no disponible | 90,6* | no disponible | Pesos abiertos |
| Claude-Opus-5 | no disponible | no disponible | 89,1* | Propietaria | API |
| GPT-5.6-Sol | no disponible | no disponible | 88,8* | Propietaria | API |
| GLM-5.3 | no disponible | no disponible | 88,2* | no disponible | Pesos abiertos |

Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; como modelo generativo de gran escala, es esperable en tareas de código y razonamiento abierto, pero no se aportan datos.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están documentados; no se debe asumir cobertura multilingüe.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero el repo incluye `custom_code`, por lo que conviene revisar las dependencias de código antes de desplegar.
- Caveats para producción: el tamaño (≈3.562 GB de checkpoint, 1,78 B de parámetros) exige infraestructura multi-GPU; no hay confirmación de soporte en frameworks de serving estándar; las puntuaciones no marcadas con `*` son mediciones internas del autor y deben tratarse como indicativas.
- Discrepancia de parámetros: la model card indica 1,6 B y los safetensors reportan 1,78 B; conviene verificar el conteo real antes de dimensionar hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meituan-longcat/LongCat-2.5
- Blog técnico: https://longcat.ai/blog/longcat-2.5/
- Organización en Hugging Face: https://huggingface.co/meituan-longcat
- Organización en ModelScope: https://www.modelscope.cn/organization/meituan-longcat
- Paper LongCat-Next: https://arxiv.org/abs/2603.27538
- Paper Tree Attention: https://arxiv.org/pdf/1909.07606
- Informe técnico DeepSeek-V4.1-Flash (referencia de destilación KL): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Discord: https://discord.com/invite/jmuv5TQzKU
- X/Twitter: https://x.com/Meituan_LongCat
- Licencia: https://huggingface.co/meituan-longcat/LongCat-2.5/blob/main/LICENSE
