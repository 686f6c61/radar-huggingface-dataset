# ModernoTech/Nova-Coder-GGUF

## Resumen

Nova Coder es un modelo de lenguaje especializado en programación desarrollado por Moderno Tech dentro de su familia Nova AI. Se distribuye en formato GGUF cuantizado con el objetivo declarado de ejecución local en equipos de usuario, y cuenta con aproximadamente 15.700 millones de parámetros totales según los pesos publicados. La arquitectura es Mixture of Experts (MoE) con 27 bloques, y el autor lo posiciona como la herramienta de la familia orientada específicamente a tareas de desarrollo de software, frente a modelos de propósito general como Nova Prime (35B).

El modelo se presenta bajo una filosofía de inferencia local: el usuario descarga los pesos y ejecuta la generación en su propio hardware mediante motores compatibles con GGUF, sin depender de servidores centralizados. Está etiquetado con los idiomas español e inglés en la model card, aunque el campo de idiomas del repositorio solo declara inglés. La información técnica disponible es limitada: no se publican detalles sobre composición del dataset de entrenamiento, número de tokens, proceso de alineación (RLHF/DPO) ni resultados de benchmarks.

La relevancia actual del modelo radica en su propuesta de especialización vertical (código) combinada con despliegue local en formato cuantizado, un patrón cada vez más demandado por desarrolladores que necesitan asistentes de programación sin enviar código propietario a servicios remotos. No obstante, la ausencia de métricas verificables y de documentación detallada sobre el entrenamiento limita seriamente su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; tag `deepseek_v2` en Hugging Face |
| Parametros totales | 15.706.484.224 (~15,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (niveles concretos no especificados) |
| Idiomas soportados | es, en (segun model card); el campo de idiomas del repo solo declara en |
| Licencia | other (terminos no detallados) |
| Formato de pesos | GGUF |
| Capas (bloques) | 27 |
| Tamano del repositorio | 155,3 GB |
| Descargas | 1.238 |
| Fecha de creacion | 2026-11-05 |

## Arquitectura y entrenamiento

Nova Coder emplea una arquitectura Mixture of Experts en la que el procesamiento se distribuye entre expertos especializados y se activan selectivamente los correspondientes a cada token, según describe el autor. El modelo consta de 27 bloques o capas. El tag `deepseek_v2` presente en el repositorio sugiere una arquitectura derivada o compatible con la familia DeepSeek V2, aunque el autor no lo confirma explícitamente en la model card. No se especifica el número de parámetros activos por token, dato crítico en modelos MoE para estimar coste de inferencia.

No hay información publicada sobre el volumen de tokens de entrenamiento, la composición del dataset (proporción de código frente a lenguaje natural, lenguajes de programación cubiertos), ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa, atención lineal o mecanismos de thinking mode. La model card se centra en la filosofía de producto (ejecución local, accesibilidad) más que en detalles técnicos verificables.

## Capacidades

- Generación de código en el contexto de desarrollo de software, según los casos de uso declarados por el autor.
- Explicación de fragmentos de código y asistencia para comprender proyectos existentes.
- Depuración y detección de errores.
- Refactorización de código y creación de funciones y módulos.
- Generación de pruebas (tests) y documentación técnica.
- Revisión de código.
- Apoyo en tareas de arquitectura y diseño de software, "según capacidades verificadas" (el autor no aporta evidencia).
- Conversación multi-turno: el repositorio incluye el tag `conversational`.
- Capacidad multilingüe declarada es/en, aunque sin datos sobre calidad relativa por idioma.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo thinking, visión o audio: no disponible (no documentado).

## Casos de uso

- Asistencia de programación en IDE local: el modelo, al distribuirse en GGUF, puede integrarse en editores mediante servidores de inferencia locales compatibles, permitiendo autocompletado y generación de funciones sin enviar el código a la nube. Adecuado para equipos con políticas estrictas de confidencialidad de código.
- Explicación de bases de código heredadas: un desarrollador puede pegar fragmentos o módulos y solicitar explicaciones paso a paso, aprovechando la especialización declarada en comprensión de código. Útil en procesos de onboarding sobre repositorios antiguos.
- Depuración asistida: dado un mensaje de error y el fragmento relevante, el modelo puede proponer causas y correcciones. La utilidad real dependerá de la ventana de contexto, que no está documentada.
- Generación de pruebas unitarias: el modelo puede redactar tests a partir de funciones existentes, reduciendo el trabajo repetitivo en pipelines de CI. Requiere validación humana dado el riesgo de alucinación en APIs y firmas.
- Refactorización guiada: transformación de código para mejorar legibilidad o aplicar patrones, con revisión posterior. Adecuado para tareas acotadas más que para refactorizaciones masivas sin contexto suficiente.
- Documentación técnica automatizada: generación de docstrings y documentación de módulos a partir del código fuente, como paso previo en flujos de release.
- Formación y estudio de programación: entorno local sin coste por consulta para estudiantes que quieran practicar con un asistente sin suscripciones, dentro de las limitaciones de hardware del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~15,7B parámetros totales, una cuantización Q4 requiere aproximadamente 9-10 GB de memoria; Q5 en torno a 11-12 GB; Q8 alrededor de 16-17 GB. Al ser MoE, el uso de memoria depende de si el motor mantiene todos los expertos en memoria (lo habitual en llama.cpp) o solo los activos.
- GPU recomendadas: para Q4, una RTX 4070 Ti / 4080 (12-16 GB) puede ser suficiente; para Q8, se recomienda RTX 4090 (24 GB), A6000 o A100. En el extremo profesional, H100 ofrece margen para contexto largo y mayor throughput.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4/Q5 en GPUs con 12 GB o más, siempre que el contexto no sea muy largo; con contexto extenso el consumo de KV cache puede exceder la VRAM disponible.
- Opciones de despliegue: llama.cpp y Ollama (formato GGUF nativo), LM Studio; vLLM y TGI no soportan GGUF de forma directa sin conversión a safetensors, y el repositorio no incluye pesos sin cuantizar.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nova Coder | ~15,7B (MoE) | no disponible | other | GGUF | Especializado en código; sin benchmarks publicados |
| DeepSeek-Coder-V2-Lite | ~16B (MoE, 2,4B activos) | 128K | licencia propia permisiva | safetensors, GGUF | Referencia de la familia `deepseek_v2`; benchmarks publicados |
| Qwen2.5-Coder-14B | 14B (denso) | 128K | Apache 2.0 | safetensors, GGUF | Especializado en código, ampliamente evaluado |
| CodeLlama-13B | 13B (denso) | 16K | licencia Llama | safetensors, GGUF | Referencia anterior en código, menos competitivo hoy |

La comparación con DeepSeek-Coder-V2-Lite es la más pertinente por la coincidencia de arquitectura y tamaño, pero Nova Coder no publica parámetros activos ni benchmarks, lo que impide una comparación cuantitativa rigurosa. Qwen2.5-Coder-14B ofrece licencia Apache 2.0 y evaluación pública, ventajas significativas para producción.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar las capacidades declaradas ni comparar objetivamente con alternativas establecidas.
- Sin documentación del entrenamiento: se desconoce el dataset, el volumen de tokens y el proceso de alineación, lo que impide evaluar sesgos y calidad.
- Licencia "other" sin términos detallados en la información disponible: el uso comercial queda en un limbo legal hasta consultar el texto completo de la licencia.
- Idiomas: discrepancia entre la model card (es, en) y el campo del repositorio (solo en); la calidad en castellano no está verificada.
- Longitud de contexto no documentada: limita la planificación de casos de uso con repositorios grandes.
- Parámetros activos no documentados: imposibilita estimar con precisión el coste real de inferencia pese a ser un modelo MoE.
- Riesgo de alucinación en APIs, firmas de funciones y dependencias, inherente a los modelos de código; requiere validación humana y ejecución de tests.
- Repositorio de 155,3 GB: la descarga y el almacenamiento son costosos, especialmente si se incluyen múltiples cuantizaciones.
- Cero "likes" y comunidad reducida (1.238 descargas): escaso ecosistema de validación independiente.
- El autor advierte explícitamente contra prometer privacidad absoluta, ejecución sin conexión garantizada o compatibilidad universal; conviene verificar el comportamiento real en el hardware objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/ModernoTech/Nova-Coder-GGUF
- Sitio oficial de Moderno Tech: https://moderno.com.ar
- Paper, blog técnico, repositorio de código y demos: no disponible en la información proporcionada.
