# poisonxa/Flint-PXQN4

## Resumen

Flint-PXQN4 es una cuantización del modelo Recursive Flint, un transformer de mezcla de expertos (MoE) de 39.785.287.456 parámetros totales con aproximadamente 2.500 millones de parámetros activos por token, diseñado específicamente para agentes de programación. El modelo base lo desarrolla Recursive (RecursiveSI) bajo licencia Apache 2.0, y esta versión la publica poisonxa a través de PXA Network en su formato propietario PXQN4, un contenedor GGUF compatible con builds específicas del motor PXA.

La relevancia de esta ficha es doble: por un lado documenta un modelo MoE de casi 40B con un ratio de activación muy bajo (en torno al 6,3 %), pensado para razonamiento multi-paso y generación de código en entornos de agentes; por otro, ilustra un caso de cuantización de terceros con métricas de calidad publicadas (divergencia KL frente al Q8_0 original) que permiten evaluar la pérdida de fidelidad respecto a la cuantización de referencia.

El archivo ocupa 24,87 GB en disco y está dimensionado para ejecutarse en una GPU de 16 GB (Tesla P100 o V100) con el resto de capas en RAM del sistema, o bien repartido entre dos GPU de 16 GB. La longitud de contexto documentada del modelo base alcanza los 262.144 tokens, aunque el autor advierte que contextos menores reducen el consumo de memoria. No se han publicado datos de benchmarks de rendimiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) |
| Parámetros totales | 39.785.287.456 |
| Parámetros activos | ~2.500 millones por token |
| Longitud de contexto | 262.144 tokens (límite documentado del modelo base) |
| Tipos de cuantización | PXQN4 (tier propietario de PXA), con tensores sensibles en mayor precisión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Flint-PXQN4.gguf`) |

## Arquitectura y entrenamiento

El modelo base Recursive Flint es un transformer de mezcla de expertos con 39,8B parámetros totales y unos 2,5B activos por token, lo que sitúa su ratio de activación en aproximadamente el 6,3 %. Está orientado a agentes de programación, según la model card del autor de la cuantización. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Esta versión concreta no ha sido reentrenada, ajustada ni editada: es una conversión y cuantización del modelo original. El proceso partió del GGUF Q8_0 publicado por Unsloth (`unsloth/flint-GGUF`, también Apache 2.0), por lo que algunos campos descriptivos internos del GGUF (nombre de Unsloth y archivo de calibración) se heredan de ese fichero. La cuantización PXQN4 conserva los tensores más sensibles en mayor precisión, una técnica habitual para reducir el impacto de la cuantización en capas críticas. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento multi-paso, orientado por diseño a flujos de agentes.
- Generación y edición de código, dado el enfoque declarado del modelo base hacia agentes de programación.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Agentes de programación autónomos: el modelo está diseñado explícitamente para este escenario, con un MoE de bajo coste de activación (unos 2,5B parámetros por token) que permite iteraciones rápidas en bucles de razonamiento y edición de código sin pagar el coste completo de 39,8B parámetros en cada paso.
- Asistentes de código integrados en IDE: la ventana de contexto de hasta 262.144 tokens permite cargar repositorios o módulos completos y mantener coherencia entre múltiples archivos durante la refactorización.
- Despliegue en hardware modesto: al caber en una GPU de 16 GB (P100 o V100) con el resto de capas en RAM, es viable montar un servidor de inferencia en infraestructura antigua o de segunda mano, útil para laboratorios con presupuesto limitado.
- Procesamiento de documentación técnica extensa: con contexto largo se pueden resumir, extraer y cruzar especificaciones de manuales o bases de conocimiento de gran tamaño en una sola pasada.
- Entornos de investigación sobre cuantización: al publicar métricas de divergencia KL frente al Q8_0, sirve como caso de estudio para comparar formatos de cuantización (PXQN4 frente a Q4_K_XL) en condiciones controladas.
- Automatización de tareas conversacionales multi-turno: la etiqueta `conversational` y la compatibilidad con endpoints permiten integrarlo en chatbots internos o pipelines de soporte donde el contexto largo y el coste por token importan.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). Sí incluye métricas de fidelidad de la cuantización frente al Q8_0 del modelo original:

| Métrica | Flint-PXQN4 (este archivo) | Q4_K_XL mainline |
|---|---:|---:|
| Tamaño | 24,87 GB | 25,05 GB |
| KLD vs Q8_0 | 0,326 ± 0,015 | 0,321 ± 0,015 |
| Mismo token top-1 | 86,25 % | 85,90 % |
| Ratio de perplejidad vs Q8_0 | 1,027 | 1,031 |

El autor indica que la diferencia de KLD (0,326 frente a 0,321) queda dentro del error de medida y no reclama superioridad sobre Q4_K_XL. Las mediciones provienen de 8 fragmentos de texto (PXA, 2026-10-24), por lo que no resuelven diferencias pequeñas. No se ha ejecutado una prueba KLD con tokens de chat (rol assistant) ni una prueba de aguja en contexto largo.

## Requisitos de hardware

- VRAM estimada: el archivo completo ocupa 24,87 GB; el autor lo dimensiona para una GPU de 16 GB con el resto de capas en RAM del sistema, o para dos GPU de 16 GB.
- GPU recomendadas por el autor: Tesla P100 o V100 de 16 GB. Para un reparto completo en VRAM harían falta tarjetas con más memoria (por ejemplo, A100 de 40/80 GB o H100), aunque no se documentan explícitamente.
- GPU de consumo: no se indica compatibilidad con RTX 4090 u otras tarjetas consumer; el formato PXQN4 requiere builds específicas del motor PXA, no de llama.cpp estándar.
- Opciones de despliegue: exclusivamente el motor PXA con soporte de Flint, incluido a partir de PXA 4.0 (canal beta para Valued Supporters). PXA v3.1 y anteriores no pueden cargar el archivo. El lanzamiento se hace con `~/.local/share/pxa/current/run-server.sh -m Flint-PXQN4.gguf` o mediante la interfaz PXA Control.
- Latencia y throughput: no disponibles en la información proporcionada.
- Muestreo recomendado por el modelo base: temperatura 1.0, top_p 0.95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Flint-PXQN4 (este) | 39,8B | ~2,5B | 262.144 | Apache 2.0 | GGUF PXQN4, requiere PXA 4.0+ |
| RecursiveSI/flint (base) | 39,8B | ~2,5B | 262.144 | Apache 2.0 | Pesos originales en Hugging Face |
| unsloth/flint-GGUF (Q8_0) | 39,8B | ~2,5B | 262.144 | Apache 2.0 | GGUF Q8_0, compatible con llama.cpp |
| Flint Q4_K_XL mainline | 39,8B | ~2,5B | 262.144 | Apache 2.0 | GGUF Q4_K_XL, 25,05 GB |

No se dispone de información sobre modelos de otros desarrolladores comparables en la misma categoría (MoE de ~40B orientado a agentes de código), por lo que la comparativa se limita a las variantes del propio Flint.

## Limitaciones y advertencias

- La cuantización introduce pérdida de fidelidad: KLD de 0,326 frente al Q8_0 y ratio de perplejidad de 1,027, con un 86,25 % de coincidencia en el token top-1.
- Las métricas de calidad se basan en solo 8 fragmentos de texto y no cubren tokens de chat ni contexto largo; el comportamiento en conversación real y en ventanas de 262.144 tokens no está validado.
- Requiere una build específica del motor PXA (4.0 o superior, inicialmente en beta para Valued Supporters). No es cargable en llama.cpp, Ollama o vLLM estándar, lo que limita la portabilidad.
- El autor no reclama mejora sobre Q4_K_XL; la elección entre ambos debe basarse en el ecosistema de despliegue disponible.
- Idiomas soportados no documentados: el rendimiento fuera del inglés es incierto.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas; son los esperables en un modelo base sin análisis publicado en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero los nombres "Flint" y "Recursive" pertenecen a Recursive y solo deben usarse para describir el origen de los pesos. PXA Network no está afiliada a Recursive ni a Unsloth.
- El repositorio hereda campos descriptivos del GGUF de Unsloth (nombre y archivo de calibración), lo que puede confundir en auditorías de procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/poisonxa/Flint-PXQN4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- GGUF Q8_0 de Unsloth: https://huggingface.co/unsloth/flint-GGUF
- Discord de PXA Network: https://discord.pxanetwork.com
- Reddit de PXA Network: https://www.reddit.com/r/PXANetwork/
- Apoyo al autor: https://ko-fi.com/shatteredrealms1
