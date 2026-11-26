# alpha-coder-great/al-rasheed-ai

## Resumen

Al-Rasheed AI es un modelo de lenguaje en formato GGUF presentado por el desarrollador alpha-coder-great (bajo el identificador de Hugging Face `alpha-coder-great/al-rasheed-ai`) como una herramienta de referencia para conocimiento islámico, consultas sobre el Corán y asistencia educativa religiosa. Según la model card, se trata de un ajuste fino (fine-tune) de un modelo previo denominado QuranGuide, del que se distribuye la variante cuantizada Q4_K_M, y que el autor declara construido sobre la arquitectura Llama 3, aunque no se aportan detalles verificables sobre el modelo base exacto ni sobre el proceso de entrenamiento.

El modelo se distribuye exclusivamente en formato GGUF con cuantización Q4_K_M y está pensado para inferencia local y offline, integrado en la aplicación móvil Al-Rasheed Islamic App. La model card incluye un system prompt de ejemplo que fija la identidad del asistente, una temperatura de 0.7 y una ventana de contexto de 8192 tokens configurada mediante parámetros de plantilla (estilo Ollama/llama.cpp). El repositorio ocupa aproximadamente 2,0 GB y acumula 1363 descargas y 2 likes en el momento de la consulta.

La relevancia del proyecto es principalmente de nicho: propone un asistente religioso que funciona sin conexión y sin depender de servicios en la nube, un enfoque con valor para usuarios preocupados por la privacidad. No obstante, la información técnica publicada es muy limitada: no se especifican parámetros totales, licencia, idiomas soportados ni resultados de benchmarks, y el propio autor advierte de que el modelo es experimental y no sustituye la consulta a scholars cualificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, declarada como basada en Llama 3 (no verificable) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | 8192 tokens (valor configurado en el system prompt de ejemplo) |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se publican otras variantes |
| Idiomas soportados | no disponible (la model card está en inglés y el enfoque es temático, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `al-rasheed-ai-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La model card indica que el modelo se construye sobre la arquitectura Llama 3 y que es un ajuste fino del modelo previo QuranGuide. No se especifica el número de parámetros del modelo base, el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF, DPO o SFT supervisado. Tampoco se documenta el proceso de cuantización más allá de la etiqueta Q4_K_M, que corresponde al esquema de cuantización de 4 bits con mezcla de tipos de llama.cpp.

El artefacto distribuido es únicamente el fichero GGUF cuantizado, no los pesos originales en safetensors ni el checkpoint del fine-tune. El prompt de sistema incluido en la model card define una identidad concreta ("Al-Rasheed-AI") y establece que el modelo no debe presentarse como QuranGuide salvo que se pregunte por su historial de desarrollo, lo que sugiere una personalización ligera orientada a la aplicación móvil más que un entrenamiento documentado con rigor técnico. No se describe ninguna innovación arquitectónica (atención lineal, decodificación especulativa, MoE o modelos híbridos SSM).

## Capacidades

- Generación de texto conversacional en inglés, orientada a preguntas y respuestas sobre conceptos islámicos, terminología religiosa y prácticas cotidianas.
- Asistencia sobre referencias coránicas y enseñanzas islámicas, con advertencia explícita del autor sobre la necesidad de verificar citas.
- Exploración introductoria de dictámenes islámicos (rulings) básicos y de cuestiones más avanzadas como punto de partida para investigación posterior.
- Identificación de temas que requieren consulta con scholars o fuentes religiosas autorizadas.
- Funcionamiento offline mediante inferencia local en formato GGUF, integrable en aplicaciones de escritorio o móviles.
- Soporte de conversación multi-turno dentro de la ventana de 8192 tokens configurada.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso con agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades multilingües; la model card no declara idiomas soportados.

## Casos de uso

- Asistente religioso offline en la aplicación Al-Rasheed Islamic App: el modelo se ejecuta localmente en el dispositivo del usuario y responde a preguntas sobre conceptos islámicos sin enviar datos a la nube, lo que encaja con el enfoque de privacidad declarado por el proyecto.
- Consulta educativa sobre terminología islámica: un usuario puede preguntar por el significado de términos como "hadiz", "sunna" o "fiqh" y obtener explicaciones introductorias dentro de la ventana de 8192 tokens.
- Exploración de pasajes coránicos: el modelo puede ofrecer contextos y enseñanzas asociadas a versículos, siempre que el usuario verifique las citas contra fuentes auténticas, tal como advierte el autor.
- Punto de partida para investigación sobre dictámenes: ante una pregunta práctica, el modelo puede enumerar opiniones generales y señalar la necesidad de consultar a un muftí o scholar cualificado.
- Despliegue en entornos con conectividad limitada: al ser un GGUF Q4_K_M de aproximadamente 2 GB, puede ejecutarse en equipos modestos o dispositivos móviles mediante llama.cpp u Ollama, útil en comunidades con acceso irregular a internet.
- Integración en herramientas de estudio islámico para principiantes: un desarrollador puede embeber el modelo en una aplicación de escritorio educativa que funcione sin conexión y con parámetros de generación fijos (temperatura 0.7, contexto 8192).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de conocimiento islámico, y tampoco se aportan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un GGUF Q4_K_M de aproximadamente 2 GB, la huella de pesos ronda los 2 GB; con overhead de contexto (8192 tokens) y buffers de llama.cpp, se recomienda prever entre 3 y 5 GB de memoria disponible, aunque el dato exacto no está publicado.
- GPU recomendadas: no disponible. No se documentan requisitos oficiales; por tamaño, cualquier GPU consumer con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) debería poder cargarlo, pero es una estimación, no un dato del autor.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del fichero, aunque no se confirma oficialmente.
- Opciones de despliegue: llama.cpp y Ollama son los entornos compatibles con el formato GGUF y con los parámetros de plantilla incluidos en la model card (`PARAMETER temperature 0.7`, `PARAMETER num_ctx 8192`). No se documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica el modelo base exacto ni ofrece métricas que permitan una comparación rigurosa con alternativas de la misma categoría (asistentes religiosos o modelos Llama 3 de tamaño equivalente). Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede generar información inexacta, citar mal las fuentes, malinterpretar preguntas o emitir dictámenes religiosos incorrectos; no sustituye a un muftí ni a un scholar cualificado.
- Riesgo elevado de alucinación en citas coránicas y de hadices, con implicaciones religiosas serias si el usuario no verifica las referencias.
- No se especifica la licencia, por lo que el uso comercial queda sin marco legal claro y no puede recomendarse sin consultar al autor.
- No se declaran idiomas soportados; la model card está en inglés y no hay evidencia de calidad en árabe u otras lenguas.
- No se documentan parámetros totales, dataset de entrenamiento ni proceso de alineación, lo que impide evaluar sesgos conocidos o la calidad del ajuste fino.
- El contexto está limitado a 8192 tokens según la configuración de ejemplo; conversaciones muy largas requerirán truncamiento o resumen.
- El modelo se distribuye solo en Q4_K_M, sin versiones de mayor precisión (FP16, Q8_0) que permitan evaluar la pérdida por cuantización.
- La model card contiene avisos internos (por ejemplo, "Readme.md is down") que indican un estado de documentación incompleto y un proyecto en desarrollo activo.

## Enlaces

- Hugging Face: https://huggingface.co/alpha-coder-great/al-rasheed-ai
- Sitio oficial del proyecto y descarga de la app: https://mkaramrashid2012-code.github.io/Al-Rasheed-AI/
