# Horn-Studio/Hai-2.6-Extend-0913-GGUF

## Resumen

Hai 2.6 Extend 0913 es un ajuste fino conversacional del modelo Qwen3.5-9B, publicado por Horn.Studio y distribuido en formato GGUF en el repositorio Horn-Studio/Hai-2.6-Extend-0913-GGUF. Se trata de la compilación "Reinforced" (lote 0913) de la familia H.ai 2.6, cuyo objetivo declarado es mejorar la consistencia de personaje en conversaciones largas y la capacidad matemática respecto a la versión anterior Hai-2.6-Flash. El modelo se posiciona como un acompañante conversacional "amable y paciente", orientado a tutoría de asignaturas de secundaria, role-play y asistencia técnica.

Técnicamente es un transformer de aproximadamente 8,95 mil millones de parámetros con una ventana de contexto declarada de 262K tokens, cuantizado en GGUF para su ejecución local. El entrenamiento se realizó sobre una plataforma poco habitual: una GPU Intel Arc A770 con WSL2, usando el framework Unsloth Core con un parche propio del autor. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque el idioma declarado en la model card es únicamente el chino (zh).

Su relevancia actual reside en dos aspectos: por un lado, es un ejemplo de ajuste fino de corte "persona" sobre una base reciente de Qwen; por otro, documenta una metodología explícita de abliteración seguida de un reentrenamiento completo para restaurar y reforzar las barreras de seguridad, con métricas de tasa de rechazo publicadas. El repositorio de HuggingFace es un espejo del repositorio oficial en ModelScope, que es la plataforma principal de publicación del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de Qwen3.5-9B); no se especifica si es densa o MoE |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantización | GGUF; se documentan Q4_K_M (≈5,5 GB) y Q6_K (≈7,2 GB) |
| Idiomas soportados | Chino (zh) declarado en la model card; el modelo base Qwen3.5-9B es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); safetensors en el modelo base |
| Modelo base | Qwen/Qwen3.5-9B |
| Tipo de modelo | Generación de texto / chat |
| Plataforma de entrenamiento | Intel Arc A770 + WSL2 |
| Framework de entrenamiento | Unsloth Core (con el repositorio Horn-Studio/Intel_UnslothFix) |
| Tamaño del repositorio | 22,9 GB |
| Descargas / likes en HuggingFace | 0 descargas / 1 like |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna más allá de que el modelo deriva de Qwen3.5-9B, un transformer de aproximadamente 8,95 B de parámetros. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO para esta versión concreta. Lo que sí se documenta es el pipeline de seguridad: el autor aplicó la herramienta "heretic" para eliminar la capa de seguridad de un modelo Hai2, generando Hai-2-Abliterated, y después restauró las barreras de seguridad mediante un ajuste fino completo, obteniendo según sus propias mediciones un modelo más robusto que el original.

El modelo se describe como un "non-think CoT model" típico, es decir, conserva las etiquetas `think` pero no está optimizado para razonamiento extendido explícito. Entre las innovaciones declaradas destaca la mejora de la consistencia de personaje a lo largo de conversaciones largas y la recuperación de la capacidad de agente hasta "más del 80% de Qwen3.5 9B". El entrenamiento se ejecutó íntegramente en hardware Intel (Arc A770) bajo WSL2, con un parche de compatibilidad publicado por el propio autor para Unsloth.

## Capacidades

- Generación de texto conversacional en chino, con registro cercano y didáctico.
- Role-play y acompañamiento emocional, incluyendo consistencia de personaje en diálogos multi-turno prolongados.
- Tutoría académica alineada con el currículo de secundaria chino: composición, matemáticas, escritura continuada y composición en inglés, física, química y política.
- Razonamiento matemático y análisis lógico, reforzado específicamente en esta compilación.
- Tutoría de programación en Python, Java, C++, desarrollo front-end y otros lenguajes.
- Explicación de conceptos técnicos: IA, algoritmos, arquitectura de sistemas.
- Escritura creativa y pulido de textos publicitarios o de marketing.
- Capacidad de agente recuperada hasta más del 80% del modelo base Qwen3.5-9B, según el autor.
- Conserva las etiquetas `think` del modelo base, aunque se posiciona como modelo de CoT no explícito.
- No se documentan capacidades de visión, audio, tool calling ni function calling en la información disponible.

## Casos de uso

- Tutoría académica personalizada: el modelo está alineado específicamente con asignaturas de secundaria en chino, de modo que puede desglosar problemas de matemáticas, física o química paso a paso manteniendo un tono paciente, aprovechando además la ventana de 262K tokens para arrastrar el material de estudio completo de una asignatura en el contexto.
- Acompañamiento conversacional de larga duración: gracias a la mejora declarada de consistencia de personaje, es adecuado para aplicaciones de compañía emocional o role-play donde el usuario mantiene sesiones extensas y espera que el personaje no se desvíe de su carácter.
- Asistente de escritura creativa en chino: útil para redacción de relatos, pulido de textos y generación de variantes estilísticas, con la ventaja de un tono cercano y una longitud media de respuesta controlada.
- Plataforma de aprendizaje de programación: puede actuar como tutor de Python, Java o C++ explicando errores y conceptos, y complementar la formación reglada en entornos educativos.
- Soporte técnico de primer nivel en chino: para desglose de conceptos de IA, arquitectura de sistemas o algoritmos a usuarios no técnicos, dentro de un producto de documentación asistida.
- Despliegue local en escritorio para usuarios finales: al publicarse en GGUF con cuantizaciones de 5,5 GB y 7,2 GB, se puede integrar en aplicaciones de escritorio mediante llama.cpp, LM Studio u Ollama sin depender de servicios en la nube.
- Investigación sobre alineación y seguridad: el modelo documenta de forma explícita el ciclo abliteración → reentrenamiento de seguridad, con tasas de rechazo publicadas, lo que lo convierte en un caso de estudio reproducible para evaluar la robustez de las barreras de seguridad tras un ajuste fino completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente publica métricas internas de comportamiento conversacional por lote de evaluación y tasas de rechazo ante peticiones inseguras.

Métricas de comportamiento por lote (evaluación interna del autor):

| Lote | Longitud media | Puntuación emotiva | Jerga de internet | Partículas modales | Autocorrecciones |
|---|---|---|---|---|---|
| U01 Académico | 17,6 | 10,0% | 13,3% | 26,7% | 13,3% |
| U02 Diario y emociones | 18,2 | 10,0% | 16,7% | 26,7% | 13,3% |
| U03 Conocimiento | 17,7 | 16,7% | 13,3% | 36,7% | 10,0% |
| U04 Técnico | 24,5 | 10,0% | 13,3% | 30,0% | 13,3% |
| U05 Seguridad | 20,7 | 13,3% | 10,0% | 36,7% | 16,7% |
| U06 Creativo | 17,9 | 6,2% | 9,4% | 28,1% | 9,4% |
| U07 Saludos breves | 10,9 | 13,3% | 0,0% | 50,0% | 10,0% |
| U08 Desglose | 16,8 | 13,3% | 20,0% | 23,3% | 10,0% |

Tasas de rechazo ante peticiones inseguras (evaluación interna del autor):

| Modelo | Tasa de rechazo |
|---|---|
| Hai-2 | 87/100 |
| Hai-2-Abliterated | 8/100 |
| Hai-2.5 | 93/100 |
| Hai-2.6-Flash | 96/100 |
| Hai-2.6-Flash-Extend (Reinforced) | 95/100 |

## Requisitos de hardware

- Pesos cuantizados: Q4_K_M ocupa aproximadamente 5,5 GB y Q6_K aproximadamente 7,2 GB, según los tamaños indicados por el autor.
- VRAM estimada para inferencia: no disponible de forma oficial; a partir del tamaño de los ficheros, la cuantización Q4_K_M requiere del orden de 6-7 GB de VRAM con contexto moderado, y Q6_K del orden de 8-9 GB. Son estimaciones derivadas del tamaño de los pesos, no datos publicados por el autor.
- Contexto largo: no es posible estimar el consumo de VRAM con la ventana completa de 262K tokens porque no se han publicado el número de capas, cabezas de atención ni la configuración de caché KV.
- GPU de consumo: cabe con holgura en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) usando Q4_K_M o Q6_K; en tarjetas de 8 GB encajaría únicamente Q4_K_M con contexto reducido.
- GPU profesionales: no se documentan requisitos para A100, H100 u otras GPU de centro de datos; al ser un modelo de menos de 9 B de parámetros, cualquiera de ellas lo ejecutaría con margen amplio.
- Opciones de despliegue confirmadas: llama.cpp (`llama-cli`), LM Studio, Ollama (mediante Modelfile) y llama-cpp-python con `chat_format="chatml"`.
- Opciones no confirmadas: no se documenta compatibilidad con vLLM, TGI ni servidores de inferencia equivalentes en la información disponible.
- Parámetros de muestreo recomendados por el autor: temperatura 0,7 y top_p 0,9; se recomienda dejar el system prompt vacío y usar una temperatura relativamente alta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Formato | Licencia | Tasa de rechazo (autor) | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Hai-2.6-Flash-Extend (Reinforced, este repositorio) | Qwen3.5-9B | 8,95 B | 262K | GGUF | Apache 2.0 | 95/100 | HuggingFace (espejo) y ModelScope |
| Hai-2.6-Flash (lote 0829) | Qwen3.5-9B | No disponible | No disponible | GGUF | No disponible | 96/100 | ModelScope |
| Hai-2.5 (lote 0829) | Qwen3.5-27B | No disponible | No disponible | GGUF | No disponible | 93/100 | ModelScope |
| Qwen3.5-9B (modelo base) | — | ≈8,95 B | No disponible | safetensors | No disponible | No disponible | HuggingFace |

El modelo base Qwen3.5-9B no publica en la información disponible métricas comparables con este ajuste fino, por lo que no es posible establecer una comparación cuantitativa de rendimiento entre ambos.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente chino (zh). Aunque el modelo base es multilingüe, no hay evidencia publicada de que el ajuste fino preserve un rendimiento sólido en castellano u otros idiomas.
- Alineación cultural específica: la tutoría académica está alineada con el currículo de secundaria chino (composición, política, etc.), lo que limita su utilidad directa en otros sistemas educativos.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad factual; en tareas de tutoría y explicación técnica el modelo puede generar contenido plausible pero incorrecto.
- Modelo orientado a persona: el entrenamiento prioriza el tono cercano y la consistencia de personaje sobre la precisión, lo que puede producir respuestas verbosas o con muletillas, como reflejan las métricas de partículas modales (hasta 50% en saludos breves).
- Seguridad: la tasa de rechazo publicada es de 95/100, lo que implica que aproximadamente un 5% de las peticiones inseguras del conjunto de prueba no fueron rechazadas. Además, la metodología empleada (abliteración seguida de reentrenamiento) no ha sido validada de forma independiente.
- Riesgo de jailbreak: al derivar de un linaje que pasó por un proceso de abliteración, conviene auditar el comportamiento ante prompts adversarios antes de desplegarlo en producción.
- Contexto: los 262K tokens son una cifra declarada por el autor, sin benchmarks publicados que verifiquen la calidad de la recuperación de información en contextos muy largos.
- Adopción y validación: el repositorio cuenta con 0 descargas y 1 like en HuggingFace, y es un espejo de ModelScope; no hay revisión independiente ni comunidad de usuarios que respalde las afirmaciones del autor.
- Nomenclatura: el repositorio se llama "Hai-2.6-Extend-0913-GGUF", pero la model card se refiere al modelo como "Hai-2.6-Flash-Extend" y "Hai-2.6 Reinforced". Conviene verificar que se trata del mismo artefacto antes de integrarlo.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni asume responsabilidad por sus salidas.
- Formato: al distribuirse solo como GGUF, no es directamente compatible con stacks de entrenamiento o ajuste fino basados en safetensors.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Horn-Studio/Hai-2.6-Extend-0913-GGUF
- Repositorio oficial en ModelScope (Hai-2.6-Flash-Extend-Release-0913-GGUF): https://www.modelscope.cn/models/HornStudio/Hai-2.6-Flash-Extend-Release-0913-GGUF
- Versión anterior Hai-2.6-Flash (lote 0829): https://www.modelscope.cn/models/HornStudio/Hai-2.6-Flash-Release-0829-GGUF
- Versión Hai-2.5 (Qwen3.5-27B): https://www.modelscope.cn/models/HornStudio/Hai-2.5-Release-0829-GGUF
- Versión Hai-2.0: https://www.modelscope.cn/models/HornStudio/Hai-2-Release-0812-GGUF
- Perfil del autor en ModelScope: https://www.modelscope.cn/profile/HornStudio
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del parche de compatibilidad: Horn-Studio/Intel_UnslothFix (referenciado en la model card)
