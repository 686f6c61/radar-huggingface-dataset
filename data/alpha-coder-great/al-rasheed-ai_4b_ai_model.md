# alpha-coder-great/Al-Rasheed-Ai_4b_ai_model

## Resumen

Al-Rasheed-AI es un modelo de lenguaje publicado en Hugging Face por el usuario alpha-coder-great bajo el identificador `Al-Rasheed-Ai_4b_ai_model`. Según la model card, se trata de un ajuste fino orientado a asistencia sobre conocimiento islámico, con un system prompt que define la identidad del modelo como "The Islamic Companion" y establece reglas explícitas anti-alucinación para referencias coránicas, hadices y dictámenes religiosos. El autor indica que el modelo deriva del proyecto previo QuranGuide y que está construido sobre la arquitectura Llama 3, aunque no se especifican detalles verificables sobre el proceso de entrenamiento.

El repositorio contiene pesos en formato GGUF (2,7 GB), con una cuantización Q4_K_M mencionada de forma explícita en la model card, y está pensado para despliegue local y offline, en particular en dispositivos Android con conectividad limitada. La motivación declarada del proyecto es ofrecer asistencia islámica accesible sin depender de internet, dirigida a estudiantes de escuela, madrasa y universidad, así como a adultos.

La información técnica disponible es muy escasa: no se publican parámetros totales verificables (el sufijo "4b" del nombre sugiere 4 mil millones, pero no se confirma), ni licencia, ni idiomas soportados, ni resultados de benchmarks. Esta ficha refleja únicamente lo que puede extraerse del repositorio y de la model card, marcando como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, basada en Llama 3 (según la model card; no verificable) |
| Parametros totales | no disponible (el nombre del repositorio sugiere ~4B, sin confirmar) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (valor de `num_ctx` en el Modelfile) |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras variantes |
| Idiomas soportados | no disponible (la model card está en inglés; misión declarada centrada en comunidad musulmana global y pakistaní) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`al-rasheed-ai-Q4_K_M.gguf`, `quran-guide Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La model card afirma que el modelo "está construido sobre la arquitectura Llama 3", pero no aporta detalles sobre el número de capas, dimensión oculta, cabezas de atención ni vocabulario. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o SFT, ni el procedimiento de ajuste fino empleado. El autor menciona que el modelo "evolucionó del proyecto QuranGuide", lo que sugiere un ajuste iterativo sobre una versión previa, pero no se ofrece ningún detalle técnico verificable.

El artefacto principal es un archivo GGUF con cuantización Q4_K_M, acompañado de un Modelfile que define un system prompt extenso (identidad, reglas de conocimiento islámico, reglas anti-alucinación y asistencia general) y parámetros de inferencia: `temperature 0.3` y `num_ctx 8192` en la configuración principal, y `temperature 0.7` en la variante `quran-guide`. No se documentan innovaciones arquitectónicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional en inglés, con identidad fijada por system prompt ("Al-Rasheed-AI, The Islamic Companion").
- Asistencia sobre conocimiento islámico: referencias coránicas, enseñanzas islámicas y Sunnah, con instrucciones explícitas de no inventar versículos, hadices, números de sura/aya ni grados de autenticidad.
- Asistencia general declarada: preguntas académicas, científicas, matemáticas, de programación y técnicas.
- Diferenciación explícita entre citas directas, traducciones, interpretaciones y explicaciones personales (según las reglas del system prompt).
- Reconocimiento de incertidumbre y recomendación de consultar a scholars cualificados para dictámenes complejos (comportamiento prescrito, no verificado empíricamente).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Asistencia islámica offline en Android: el modelo está empaquetado en GGUF Q4_K_M (2,7 GB) y la misión declarada es su integración en una app de descarga única para usuarios con conectividad limitada o poco fiable, lo que encaja con inferencia local en dispositivos móviles de gama media.
- Consulta de referencias coránicas con salvaguardas: el system prompt obliga a distinguir citas directas de interpretaciones y a no fabricar números de sura o aya, lo que lo hace adecuado como herramienta de consulta preliminar que el usuario debe verificar después.
- Apoyo a estudiantes de madrasa y escuela: respuestas en inglés sobre enseñanzas islámicas básicas, con recomendación de acudir a scholars para dictámenes complejos, útil como complemento educativo y no como sustituto.
- Despliegue con Ollama o llama.cpp: al ser un GGUF con Modelfile incluido, puede cargarse directamente en entornos locales sin infraestructura de servidor, lo que facilita prototipos y demos.
- Asistencia general en el mismo asistente: la model card declara respuesta a preguntas académicas, matemáticas y de programación, de modo que el modelo puede servir como asistente único en la app, manteniendo la perspectiva islámica solo cuando sea relevante.
- Distribución en contextos de baja conectividad: con 8192 tokens de contexto y cuantización de 4 bits, es viable ejecutarlo en portátiles modestos o en servidores pequeños para servir a una comunidad local sin depender de APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa 2,7 GB, por lo que se necesita aproximadamente 3-4 GB de memoria libre para cargar el modelo y el contexto (estimación a partir del tamaño del archivo, no confirmada por el autor).
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM sería suficiente en teoría, pero el autor no documenta pruebas.
- Compatibilidad con GPU de consumo: probable en tarjetas con 6 GB o más (RTX 3060, RTX 4060, etc.), no verificado.
- Opciones de despliegue: Ollama y llama.cpp son las vías naturales dado el formato GGUF y el Modelfile incluido; vLLM y TGI no están documentados para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Al-Rasheed-AI (este modelo) | no disponible (~4B por el nombre) | 8192 | no disponible | GGUF Q4_K_M | Ajuste islámico, sin benchmarks publicados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

No se dispone de datos verificables para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evaluación publicada de MMLU, HumanEval, GSM8K ni de calidad en conocimiento islámico, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación en materia religiosa: aunque el system prompt prohíbe inventar versículos, hadices y dictámenes, no hay evidencia de que el ajuste fino elimine ese riesgo; el propio autor advierte que "la IA puede cometer errores" y pide verificar las respuestas.
- Licencia no especificada: no se indica licencia, lo que impide determinar si el uso comercial está permitido; esto es un bloqueo para producción.
- Idiomas no documentados: la model card está en inglés y no se declara soporte de árabe, urdu ni otros idiomas relevantes para la comunidad objetivo.
- Contexto limitado a 8192 tokens: adecuado para conversación, insuficiente para tareas de documentos largos o análisis extensos.
- Información técnica incompleta: no se confirman parámetros, arquitectura exacta, dataset ni proceso de entrenamiento; la afirmación de base Llama 3 no es verificable desde el repositorio.
- Posicionamiento religioso sensible: el modelo no debe presentarse como muftí ni sustituir a scholars cualificados, tal como el propio autor advierte.
- Sin soporte documentado de tool calling ni de agentes, lo que limita su integración en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/alpha-coder-great/Al-Rasheed-Ai_4b_ai_model
- Web del proyecto: https://mkaramrashid2012-code.github.io/Al-Rasheed-AI/
- Contacto indicado en la model card: mkaramrashid2012@gmail.com
