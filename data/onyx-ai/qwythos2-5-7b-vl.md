# onyx-ai/Qwythos2.5-7B-VL

## Resumen

Qwythos2.5-7B-VL es un ajuste fino (fine-tuning) multimodal publicado por el usuario onyx-ai en HuggingFace, construido sobre coder3101/Qwen2.5-VL-7B-Instruct-heretic, que a su vez deriva de Qwen2.5-VL-7B-Instruct. Se trata por tanto de un modelo de 7 000 millones de parámetros con capacidad de visión (procesamiento de imágenes) más texto, orientado explícitamente a tareas de código, ciberseguridad, detección de vulnerabilidades (vulndetect) y búsqueda de errores (bughunting), según los tags y la model card del autor.

El modelo resuelve un nicho concreto: llevar capacidades de análisis de seguridad y revisión de código a un tamaño que quepa en hardware de consumo, con licencia Apache-2.0 y, por tanto, sin las restricciones de licencias comunitarias tipo Llama. La model card indica que se ha entrenado con conjuntos de datos de programación, ciberseguridad, hallazgo de vulnerabilidades y bughunting, y que incluye algunos prompts básicos proporcionados por el autor.

La relevancia actual del modelo es limitada y debe matizarse: en el momento de redactar esta ficha (publicación del 11 de septiembre de 2026, última actualización el mismo día) acumula 0 descargas y 0 likes, no declara resultados de benchmarks, no especifica composición ni tamaño del dataset de entrenamiento y no ofrece todavía pesos en formato GGUF (el autor indica que bf16 y q4_k_m "probablemente" estarán disponibles). Es, por tanto, un artefacto recién publicado y sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con codificador visual, heredada de Qwen2.5-VL-7B-Instruct (no se detalla en la model card) |
| Parametros totales | 7B (según el nombre del modelo; no confirmado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada para este ajuste |
| Tipos de cuantizacion | bf16 y q4_k_m anunciados como "100 % disponibles" por el autor; GGUF indicado como posibilidad, no confirmado; no hay otros formatos anunciados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el autor menciona bf16 y cuantizaciones GGUF q4_k_m de forma prospectiva) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura con detalle. Por el identificador y el campo base_model, se trata de un ajuste fino de coder3101/Qwen2.5-VL-7B-Instruct-heretic, que a su vez parte de Qwen2.5-VL-7B-Instruct. Esto implica una arquitectura transformer de tipo decoder-only con un codificador de visión y proyección al espacio de tokens del modelo de lenguaje, capaz de procesar imágenes y texto conjuntamente. El sufijo "heretic" del modelo base se asocia habitualmente a variantes en las que se ha modificado o eliminado el comportamiento de rechazo del modelo original; no obstante, la ficha no documenta qué técnica concreta se aplicó, por lo que este punto queda sin confirmar.

En cuanto a los datos de entrenamiento, la model card afirma que el modelo se entrenó con conjuntos de datos de programación, ciberseguridad, detección de vulnerabilidades y bughunting, pero no indica el número de tokens, la composición exacta del dataset, la proporción de datos multimodales, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, destilación, etc.). El autor menciona únicamente que incluye "algunos prompts básicos" escritos por él mismo.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen2.5-VL-7B-Instruct.
- Comprensión de imágenes (visión): el autor describe el modelo explícitamente como "vision model", aunque no detalla tareas concretas de visión admitidas.
- Generación y análisis de código, dado el entrenamiento declarado con datasets de programación y el origen en la familia Qwen2.5-Coder/VL.
- Detección de vulnerabilidades (vulndetect): análisis de código en busca de fallos de seguridad.
- Bughunting: apoyo a la búsqueda de errores y fallos explotables.
- Ciberseguridad en sentido amplio: los tags incluyen "security" y "cybersecurity".
- Soporte de tool calling / function calling: no declarado para este ajuste; el modelo base Qwen2.5-VL-7B-Instruct lo soporta, pero no hay confirmación de que se conserve.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no lista idiomas.
- Modo "thinking" o razonamiento explícito: no disponible.
- Capacidades de audio: no disponibles (el modelo es VL, visión-lenguaje, no audio).

## Casos de uso

- Revisión de código orientada a seguridad en pipelines de CI/CD: el modelo puede integrarse como paso de análisis estático asistido, señalando posibles patrones inseguros en los ficheros modificados de un pull request. Su tamaño de 7B permite desplegarlo en una GPU de gama alta de consumo o en una instancia pequeña en la nube.
- Triaje de hallazgos de escáneres (SAST/DAST): dado un informe con cientos de alertas, el modelo puede priorizar y explicar en lenguaje natural cuáles son explotables y por qué, reduciendo el trabajo manual del equipo de seguridad.
- Análisis de capturas de pantalla y evidencias visuales de pentesting: gracias a su componente de visión, puede interpretar capturas de terminal, paneles de administración o resultados de herramientas y convertirlos en texto estructurado para un informe.
- Generación de pruebas de concepto y borradores de parches: en laboratorios controlados y con supervisión humana, puede redactar PoC y proponer correcciones sobre el código vulnerable detectado.
- Formación y laboratorios tipo CTF: como asistente local para estudiantes de seguridad que necesitan pistas sobre vulnerabilidades en retos, sin depender de APIs externas de pago.
- Procesamiento de documentación de threat intelligence con imágenes: extracción de información de PDFs escaneados, diagramas de red o capturas incluidas en informes de inteligencia, combinando OCR visual y razonamiento textual.
- Asistente interno de seguridad autoalojado: al estar bajo Apache-2.0 y con 7B de parámetros, puede desplegarse en infraestructura propia para equipos que no pueden enviar código propietario a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, SWE-bench ni de ningún conjunto de evaluación de seguridad o de visión, y no se ha encontrado documentación adicional en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: del orden de 15-16 GB solo para los pesos de un modelo de 7B, más el codificador visual, la caché KV y las activaciones; en la práctica conviene reservar 20-24 GB para secuencias largas o imágenes de alta resolución. Es una estimación por tamaño, no un dato publicado por el autor.
- VRAM estimada en cuantización q4_k_m: aproximadamente 5-6 GB de pesos, con margen adicional para contexto y visión; cabría en GPUs de 8-12 GB con contexto moderado. Igualmente es una estimación.
- GPUs recomendadas: para bf16, NVIDIA RTX 4090 (24 GB), A100 40/80 GB, H100; para cuantización de 4 bits, RTX 3060 12 GB, RTX 4070, RTX 4080 y similares.
- Compatibilidad con GPU de consumo: sí, en cuantización de 4 bits cabe en GPUs de 12 GB o más; en bf16 requiere al menos 24 GB.
- Opciones de despliegue: no confirmadas para este modelo concreto. Al derivar de Qwen2.5-VL, son plausibles vLLM, SGLang, llama.cpp/Ollama (si finalmente se publican los GGUF anunciados) y TGI, pero el autor no documenta ninguno de estos soportes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onyx-ai/Qwythos2.5-7B-VL | 7B | no disponible | Código + ciberseguridad + visión | apache-2.0 | Publicado, 0 descargas, sin GGUF confirmado |
| coder3101/Qwen2.5-VL-7B-Instruct-heretic | 7B | no disponible en la información proporcionada | Modelo base directo, VL con rechazos presumiblemente modificados | no disponible en la información proporcionada | Público en HuggingFace |
| Qwen2.5-VL-7B-Instruct | 7B | 128 000 tokens según la documentación del modelo original (no confirmado para los ajustes derivados) | Visión-lenguaje generalista de Alibaba Qwen | apache-2.0 | Ampliamente disponible, con GGUF y múltiples cuantizaciones de la comunidad |

No se han identificado en la información proporcionada otras alternativas comparables verificables (por ejemplo, modelos de 7B especializados en ciberseguridad con capacidades de visión) con datos suficientes para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 likes en el momento de la ficha, sin benchmarks publicados ni evaluación independiente. No hay evidencia empírica de que el ajuste mejore al modelo base en tareas de seguridad.
- Documentación mínima: la model card no detalla dataset, número de tokens, hiperparámetros, metodología de evaluación ni limitaciones conocidas.
- Riesgo de alucinación: como cualquier modelo de 7B, puede generar explicaciones plausibles pero incorrectas sobre vulnerabilidades, CVE inexistentes o parches que no compilan. Requiere verificación humana obligatoria en entornos de producción.
- Doble uso: un modelo afinado para bughunting y detección de vulnerabilidades puede emplearse también con fines ofensivos. El uso debe enmarcarse en un contexto legal y autorizado.
- Posible degradación de salvaguardas: el modelo base incluye el término "heretic", asociado habitualmente a variantes con el comportamiento de rechazo alterado. Esto puede aumentar la probabilidad de respuestas dañinas o de contenido no filtrado; la ficha no lo documenta.
- Sesgos: no disponibles. Al no documentarse la composición del dataset, no es posible evaluar sesgos lingüísticos, culturales o de dominio.
- Limitaciones de idioma: el autor no especifica idiomas soportados; el rendimiento fuera del inglés y del chino (idiomas principales del modelo base) es desconocido.
- Contexto: se desconoce si el ajuste conserva la ventana de contexto del modelo original; conviene verificar experimentalmente antes de diseñar aplicaciones con entradas largas.
- Formatos de pesos: los GGUF están anunciados de forma prospectiva ("es un quizá"), no confirmados. Quien necesite desplegar en llama.cpp debe comprobar la disponibilidad real en el repositorio.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario asume toda la responsabilidad sobre el cumplimiento normativo (por ejemplo, en materia de ciberseguridad ofensiva) y sobre la verificación de que el modelo base y sus dependencias permiten esa relicencia.
- Madurez del proyecto: se trata de un repositorio personal sin historial de mantenimiento, sin versión de modelo documentada y sin canal de soporte conocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onyx-ai/Qwythos2.5-7B-VL
- Modelo base: https://huggingface.co/coder3101/Qwen2.5-VL-7B-Instruct-heretic
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Informe técnico de Qwen2.5-VL (referencia de la arquitectura base): https://arxiv.org/abs/2502.13923
- Búsqueda web realizada: los resultados obtenidos no contenían enlaces relevantes al modelo (devolvieron únicamente páginas sobre el mineral ónix), por lo que no se aportan más fuentes.
