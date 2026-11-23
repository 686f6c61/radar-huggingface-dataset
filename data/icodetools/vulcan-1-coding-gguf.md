# Icodetools/Vulcan-1-coding-GGUF

## Resumen

Vulcan-1-Coder es un modelo de lenguaje de 2.516 millones de parámetros (aproximadamente 2,5B) especializado en código, razonamiento y matemáticas, distribuido exclusivamente en formato GGUF. Lo desarrolla el usuario Icodetools y deriva de CherryPit 1.2 2B del equipo DRUPEs, sobre el que se aplicó una técnica propia denominada "Integer Space Artificial Selection": en lugar de reentrenar, se seleccionan variantes de pesos en espacio entero que maximizan el rendimiento en tareas concretas. El resultado es un modelo pensado para ejecución local en hardware modesto, con un archivo Q4_K_M de tan solo 1,56 GB.

La relevancia del proyecto reside en su método de producción: el autor generó y evaluó alrededor de 30 modelos en una sola tarde sobre un portátil con GPU de 6 GB de VRAM, sin clústeres ni ejecuciones de entrenamiento. El archivo Q4_K_M que se publica es exactamente el que ganó la "liga de selección", y según el autor rinde mejor que cuantizaciones de mayor precisión como Q8_0, un comportamiento que atribuye al propio proceso de selección y no a un artefacto de medición.

El modelo está etiquetado para inglés, con licencia Apache 2.0 y compatibilidad con llama.cpp, LM Studio y Ollama. Incluye modo de razonamiento ("thinking") y declara resultados notables en AIME 2025 (70,0%) y AIME 2026 (76,7%) sin herramientas, aunque las pruebas de código están pendientes de publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de CherryPit 1.2 2B; detalles no disponibles) |
| Parametros totales | 2.516.756.480 (aproximadamente 2,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las pruebas usan hasta 24K tokens con thinking) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K (S/M/L optimizados), IQ3_M, IQ3_S, mezclas optimizadas con imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors anunciado como "coming soon") |

## Arquitectura y entrenamiento

El modelo parte de CherryPit 1.2 2B, un modelo de 2,5B parámetros del equipo DRUPEs, y no ha sido reentrenado. La técnica aplicada, Integer Space Artificial Selection, opera en espacio entero sobre los pesos: se generan múltiples variantes y se seleccionan por rendimiento medido, de forma análoga a una selección evolutiva. El autor describe el proceso como "exprimir" el entrenamiento existente en lugar de añadir datos nuevos: si la información ya está en el modelo, se selecciona la configuración de pesos que la expone mejor.

El archivo Q4_K_M publicado es el que ganó la liga de selección y se construyó directamente desde los pesos de precisión completa del modelo base. El autor documenta un problema de cuantización en versiones anteriores: al exportar a BF16 antes de cuantizar, el redondeo BF16 introducía una diferencia del orden del cambio aplicado por la selección, de modo que esos archivos no correspondían exactamente al modelo ganador. Todos los archivos actuales se reconstruyeron desde los pesos originales. No hay datos públicos sobre composición del dataset de entrenamiento, número de tokens ni uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable (hasta 24K tokens de razonamiento en las pruebas).
- Resolución de problemas matemáticos de competición (nivel AIME).
- Generación y razonamiento sobre código, según los tags y la orientación declarada del modelo.
- Ejecución local en CPU/GPU mediante llama.cpp, LM Studio y Ollama.
- Compatible con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües limitadas al inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso ni capacidades de visión o audio.

## Casos de uso

- Asistencia de código en local: integrado en el IDE mediante llama.cpp u Ollama, el modelo puede completar y explicar fragmentos de código en una máquina sin GPU dedicada, ya que el archivo Q4_K_M ocupa 1,56 GB.
- Razonamiento matemático paso a paso: con el modo thinking activado y ventanas de hasta 24K tokens, es adecuado para resolver problemas de competición o verificar demostraciones, como reflejan sus resultados en AIME.
- Prototipado en portátiles con 6 GB de VRAM: el autor lo generó y evaluó en ese hardware, por lo que es un candidato realista para entornos de desarrollo con recursos limitados.
- Educación y tutoría técnica: puede desglosar problemas de matemáticas y programación en pasos intermedios gracias al razonamiento extendido.
- Automatización de scripts y tareas de refactorización simples en pipelines locales, donde el coste de invocar una API externa no está justificado.
- Evaluación e investigación de técnicas de fusión y selección de modelos: sirve como caso de estudio reproducible para quienes investigan merges y cuantización en espacio entero.
- Despliegue en dispositivos edge o entornos air-gapped donde no se permite enviar código a servicios en la nube.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| AIME 2025 | 21/30 = 70,0% | Thinking on, hasta 24K tokens, temperatura 1.0, 1 muestra, Q8_0, sin herramientas |
| AIME 2026 | 23/30 = 76,7% | Thinking on, hasta 24K tokens, temperatura (truncado en la información disponible) |

Notas: el resultado de AIME 2025 se midió sobre el Q8_0 exportado desde BF16 anterior, no sobre el archivo actual, y está pendiente de repetición. El autor advierte que los benchmarks de código están "coming soon" y que el modelo no ha sido probado exhaustivamente tras la selección. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para Q4_K_M (1,56 GB de pesos más overhead de contexto), alrededor de 3 GB para Q8_0 (2,68 GB).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; el autor lo desarrolló en una GPU de 6 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3050, RTX 4060, GTX 1660 o superiores; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. El contexto de razonamiento de hasta 24K tokens incrementa el tiempo de generación de forma significativa en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Vulcan-1-Coder | 2,5B | no disponible | GGUF | Apache 2.0 | Especializado en código y matemáticas, thinking mode |
| CherryPit 1.2 2B (base) | 2,5B | no disponible | safetensors | no disponible en la información | Modelo original del que deriva |
| Qwen2.5-Coder-1.5B | 1,5B | 32K (estándar de la familia) | safetensors, GGUF | Apache 2.0 | Alternativa de tamaño similar orientada a código |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32K (estándar de la familia) | safetensors, GGUF | MIT | Razonamiento con thinking mode en tamaño reducido |

Los datos de contexto y licencia de los modelos comparables corresponden a sus especificaciones habituales; no se dispone de comparaciones de rendimiento directas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo no probado exhaustivamente tras la selección: el autor reconoce fallos ocasionales, como la emisión de secuencias de símbolos sin sentido.
- Los benchmarks publicados son únicamente matemáticos; no hay evidencia publicada de rendimiento en código pese a ser su especialidad declarada.
- El resultado de AIME 2025 se obtuvo sobre una versión anterior (Q8_0 exportado desde BF16), no sobre los archivos actuales.
- El autor afirma que Q4_K_M rinde mejor que Q8_0, lo que contradice la intuición habitual sobre cuantización; recomienda usar exclusivamente Q4_K_M y advierte que recuantizar empeora el modelo.
- Solo soporta inglés, lo que limita su uso en entornos en castellano.
- Riesgo de alucinación no cuantificado; no se documentan evaluaciones de sesgo.
- No se documenta soporte de tool calling, agentes ni visión.
- La licencia Apache 2.0 permite uso comercial, pero la falta de pruebas y la advertencia del autor sobre comportamiento errático desaconsejan su uso en producción sin validación previa.
- El método de selección no está publicado todavía, lo que dificulta reproducir o auditar el proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Icodetools/Vulcan-1-coding-GGUF
- Modelo base CherryPit 1.2 2B: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Análisis de Q4_K_M del autor (enlazado desde la model card): https://huggingface.co/MisasAI/Vulcan-1-small-GGUF#analysis
