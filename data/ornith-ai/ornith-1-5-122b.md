# ornith-ai/Ornith-1.5-122B

## Resumen

Ornith-1.5-122B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) publicado por ornith-ai bajo licencia MIT. Según los pesos reales en safetensors, contiene 125.086.497.008 parámetros (unos 125,1 B), aunque la model card lo comercializa como "122B". La etiqueta de arquitectura del repositorio es `qwen3_5_moe`, lo que indica una arquitectura derivada de la familia Qwen 3.5 con enrutamiento disperso. El modelo se distribuye en formato transformers/safetensors y su repositorio ocupa 250,2 GB, lo que sitúa los pesos en precisión BF16/FP16.

El modelo se posiciona por dos ejes: rendimiento en tareas de código agéntico (TerminalBench 2.1, CyberGym, NL2Repo, SWE-bench Pro) y eficiencia de despliegue. El autor afirma que "runs on a single DGX" y que existe una variante cuantizada denominada Ornith-1.5-122B-Mobile, pensada para despliegue en dispositivos móviles. La model card destaca también salidas más cortas y mayor velocidad de finalización de tareas frente a su predecesor, además de mejor seguimiento de instrucciones y descomposición de tareas. La etiqueta `image-text-to-text` indica capacidades multimodales de entrada imagen + texto, aunque la model card no detalla el codificador visual.

Es relevante ahora por su combinación de licencia MIT permisiva, tamaño contenido para ser MoE de 122B y resultados declarados cercanos a modelos de mayor tamaño (DeepSeek-V4-Flash-0731, 284B; Beam, 501B) en benchmarks de ingeniería de software. No obstante, la información pública disponible es todavía muy limitada: 32 descargas, 44 likes, sin datos de contexto, idiomas ni proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), etiqueta de repositorio `qwen3_5_moe`; base de la familia Qwen 3.5 |
| Parametros totales | 125.086.497.008 (~125,1 B según safetensors); denominado comercialmente 122B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor menciona una variante cuantizada "Ornith-1.5-122B-Mobile" sin especificar el esquema |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers); repositorio de 250,2 GB |
| Modalidad | texto y entrada imagen-texto (`image-text-to-text`, `text-generation`, `conversational`) |
| Etiquetas adicionales | `endpoints_compatible`, `region:us` |
| Fecha de creacion / actualizacion | 2026-10-16 / 2026-10-20 |
| Descargas / likes | 32 / 44 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), etiquetado en el repositorio como `qwen3_5_moe`, lo que sugiere una implementación compatible con la familia Qwen 3.5 y su stack de transformers. El modelo incorpora además procesamiento de imagen y texto (tag `image-text-to-text`), por lo que cuenta con algún tipo de codificador o proyector multimodal, aunque la model card no aporta detalles sobre su composición, resolución de entrada ni número de tokens visuales por imagen. El número de parámetros activos por token no se ha publicado, dato clave para estimar coste de inferencia en un MoE de este tamaño.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, las fases de alineación (RLHF, DPO u otras) ni las innovaciones técnicas internas. La model card se limita a afirmaciones de marketing: "stronger benchmark results, finishes tasks faster, and produces shorter outputs", mejor seguimiento de instrucciones, mayor descomposición de tareas y "deeper knowledge of real-world work scenarios". Tampoco se documentan mecanismos de decodificación especulativa, atención lineal ni estrategias de optimización de contexto. Cualquier afirmación sobre el proceso de entrenamiento más allá de esto sería especulativa.

## Capacidades

- Generación de texto conversacional multi-turno (`conversational`, `text-generation`).
- Comprensión de imágenes combinadas con texto (`image-text-to-text`): la etiqueta del repositorio confirma entrada multimodal, aunque no se detalla el alcance (OCR, diagramas, capturas de pantalla, etc.).
- Ingeniería de software y tareas de terminal: evaluado en TerminalBench 2.1, lo que implica manejo de comandos, shell y flujos de trabajo en línea de comandos.
- Razonamiento sobre repositorios y generación de código a nivel de proyecto: evaluado en NL2Repo y SWE-bench Pro (no-hack), orientado a resolución de issues reales.
- Ciberseguridad ofensiva/defensiva acotada: evaluado en CyberGym.
- Descomposición de tareas y seguimiento de instrucciones, según declara el autor.
- Salidas más concisas: el autor afirma que produce respuestas más cortas que su predecesor.
- Soporte de tool calling / function calling: no disponible (no documentado en la información proporcionada).
- Soporte explícito de agentes multi-paso: no disponible como capacidad documentada, aunque los benchmarks de terminal y repositorios implican uso agéntico.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Agente de terminal y automatización de DevOps: el modelo obtiene 81,200 en TerminalBench 2.1, por lo que es adecuado para tareas de ejecución de comandos, diagnóstico de fallos en servidores y automatización de scripts dentro de un bucle agéntico con verificación de resultados.
- Resolución de incidencias en repositorios reales: con 76,900 en SWE-bench Pro (no-hack), puede integrarse en un pipeline que reciba un issue, localice los ficheros relevantes, proponga un parche y lo valide contra la suite de tests del proyecto.
- Generación de proyectos completos a partir de especificación en lenguaje natural: 51,200 en NL2Repo lo sitúa como candidato para scaffolding de aplicaciones, creación de estructuras de carpetas y generación de código boilerplate a partir de un brief.
- Auditoría de seguridad y análisis de vulnerabilidades: 80,000 en CyberGym permite usarlo en revisión de código con orientación a fallos de seguridad, priorización de hallazgos y generación de pruebas de concepto controladas en entornos aislados.
- Asistente de desarrollo con entrada visual: gracias a `image-text-to-text`, puede recibir capturas de pantalla de interfaces, diagramas de arquitectura o errores renderizados y traducirlos a cambios de código o explicaciones técnicas.
- Automatización de soporte técnico de segundo nivel: con capacidad conversacional y salidas cortas, encaja en flujos donde se requiere respuesta concisa, verificación contra documentación y escalado a humano, reduciendo tokens de salida y coste por interacción.
- Procesamiento de documentación técnica interna: resumen y extracción de datos de manuales, runbooks y especificaciones, combinando texto e imágenes de diagramas.
- Despliegue en una única máquina con GPU de alta capacidad: el autor afirma que funciona en un solo DGX, lo que facilita entornos on-premise con requisitos de soberanía de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. La tabla original está truncada en la información disponible: la fila SWE-bench Pro solo muestra los tres primeros modelos y el resto de filas posteriores no se incluyen.

| Benchmark | Ornith-1.5-122B | Qwen3.8-Flash-Next (125B) | Qwen3.8 (27B dense) | Nemotron 3.5 Super VL (120B) | DeepSeek-V4-Flash-0731 (284B) | Beam (501B) |
|---|---|---|---|---|---|---|
| TerminalBench 2.1 | 81,200 | 83,400 | 71,900 | 66,700 | 82,700 | 80,100 |
| CyberGym | 80,000 | 78,000 | 55,000 | 34,000 | 76,700 | 59,000 |
| NL2Repo | 51,200 | 45,200 | 42,300 | 21,000 | 54,200 | 49,400 |
| SWE-bench Pro (no-hack) | 76,900 | 43,900 | 65,500 | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks multilingües o de visión. Tampoco se especifica la metodología de evaluación, el número de intentos, la temperatura ni si los resultados son zero-shot o few-shot.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 250 GB solo para pesos (coincide con el tamaño del repositorio, 250,2 GB), más overhead de KV cache y activaciones.
- VRAM estimada en FP8: aproximadamente 125 GB para pesos; en INT4: aproximadamente 63-65 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos oficiales.
- GPU recomendadas: el autor afirma que se ejecuta en un único DGX. Para BF16 haría falta un nodo con 8 GPU de 40-80 GB (A100 80GB, H100 80GB, H200) o una GPU con memoria unificada grande. Para FP8/INT4 podría caber en configuraciones de 1-2 GPU de 80 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) en precisión completa; en cuantizaciones agresivas de 2-4 bits podría aproximarse, pero requeriría partición entre GPU y CPU y no hay datos oficiales. El autor menciona una variante móvil cuantizada, sin especificar requisitos.
- Opciones de despliegue: transformers (soporte nativo declarado). vLLM, llama.cpp, Ollama y TGI no se mencionan en la información disponible; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. El autor afirma que "finishes tasks faster" y produce salidas más cortas, pero no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Rendimiento destacado (según model card) |
|---|---|---|---|---|---|
| Ornith-1.5-122B | ~125 B | MoE multimodal | no disponible | MIT | SWE-bench Pro 76,900; CyberGym 80,000; NL2Repo 51,200 |
| Qwen3.8-Flash-Next | 125 B | MoE (presuntamente) | no disponible | no disponible | TerminalBench 2.1 83,400; CyberGym 78,000; NL2Repo 45,200 |
| Qwen3.8 | 27 B | dense | no disponible | no disponible | TerminalBench 2.1 71,900; SWE-bench Pro 65,500 |
| Nemotron 3.5 Super VL | 120 B | multimodal | no disponible | no disponible | TerminalBench 2.1 66,700; CyberGym 34,000; NL2Repo 21,000 |
| DeepSeek-V4-Flash-0731 | 284 B | MoE (presuntamente) | no disponible | no disponible | TerminalBench 2.1 82,700; NL2Repo 54,200 |
| Beam | 501 B | no disponible | no disponible | no disponible | TerminalBench 2.1 80,100; CyberGym 59,000 |

La ventaja más clara de Ornith-1.5-122B frente a sus comparables es SWE-bench Pro (76,900 frente a 65,500 de Qwen3.8 27B y 43,900 de Qwen3.8-Flash-Next) y CyberGym (80,000, el segundo mejor tras DeepSeek-V4-Flash y por delante de modelos de 284B y 501B). En TerminalBench 2.1 queda por detrás de Qwen3.8-Flash-Next (81,200 frente a 83,400) y de DeepSeek-V4-Flash (82,700). Los datos de licencia y contexto de los competidores no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación sobre datos de entrenamiento, número de tokens, composición del corpus y fases de alineación; imposible evaluar procedencia, sesgos o contaminación de benchmarks.
- Los benchmarks son autoinformados por el autor, sin verificación independiente ni descripción de la metodología.
- La tabla de benchmarks está truncada en la información disponible: faltan filas y columnas, por lo que la comparativa está incompleta.
- No se ha publicado la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo o agentes con historial extenso.
- Idiomas soportados no declarados; no hay garantía de calidad en castellano ni en otros idiomas distintos del inglés.
- Riesgo de alucinación no cuantificado: no hay datos de benchmarks de veracidad, calibración ni tasas de error factual.
- Sesgos desconocidos: sin model card ética, sin evaluación de sesgos demográficos ni de toxicidad.
- El número de parámetros activos es desconocido, lo que impide estimar con precisión coste por token y viabilidad de despliegue real.
- Adopción muy baja (32 descargas) y publicación reciente (octubre de 2026): sin ecosistema de herramientas, cuantizaciones comunitarias ni validación de terceros.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar el fichero LICENSE enlazado por si incluye cláusulas adicionales de uso aceptable.
- El repositorio de 250,2 GB implica coste de almacenamiento y transferencia considerable; no hay pesos cuantizados oficiales publicados aparte de la mención a la variante Mobile.
- Las afirmaciones de marketing ("state-of-the-art among open-source models of comparable size", "single DGX") no van acompañadas de especificaciones de hardware ni configuraciones reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- No se han encontrado en la búsqueda web enlaces relevantes al modelo (paper, blog, repositorio de código o demo); los resultados devueltos corresponden a OpenAI, GitHub Copilot y otros contenidos no relacionados.
