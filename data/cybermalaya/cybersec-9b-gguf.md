# CyberMalaya/cybersec-9b-gguf

## Resumen

cybersec-9b-gguf es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-9B realizado por el usuario CyberMalaya mediante LoRA sobre 4.900 registros del dataset Vyber07/cyber-security. El resultado se ha fusionado con el modelo base y se distribuye cuantizado en formato GGUF con cuantización Q4_K_M, pensado para su ejecución local con llama.cpp. Es un modelo exclusivamente de texto y se publica bajo licencia Apache 2.0.

El modelo aborda la especialización en dominio de ciberseguridad sobre una base generalista de 9.000 millones de parámetros, lo que permite desplegarlo en hardware de consumo gracias a la cuantización de 4 bits. La relevancia de esta ficha es limitada y debe enmarcarse con cautela: el propio autor lo describe como una prueba piloto ("trial run") sin evaluación de precisión, con cero descargas y cero interacciones en el momento de la consulta.

No se dispone de información sobre la arquitectura interna del modelo base más allá de su identificador (Qwen3.5-9B), ni sobre la composición detallada del dataset de ajuste, el número de tokens de entrenamiento o los hiperparámetros empleados. Todos los datos no confirmados se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-9B; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 9B (según el identificador del modelo base; no confirmado en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, del que no se detalla arquitectura en la información proporcionada. Sobre esa base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) empleando 4.900 registros del dataset Vyber07/cyber-security. Posteriormente, los pesos del adaptador se fusionaron con el modelo base y el resultado se cuantizó a Q4_K_M en formato GGUF. No se especifican el rango de LoRA, la tasa de aprendizaje, el número de épocas, la longitud de secuencia ni si se aplicaron etapas de alineación adicionales (RLHF/DPO) tras el ajuste.

No hay información sobre innovaciones técnicas (decodificación especulativa, atención lineal, modos de razonamiento) ni sobre la composición temática del dataset más allá de su temática declarada de ciberseguridad. El autor califica explícitamente el resultado como una ejecución de prueba sin evaluación de precisión.

## Capacidades

- Generación de texto en el dominio de ciberseguridad, derivada del ajuste sobre el dataset Vyber07/cyber-security.
- Herencia de las capacidades generales del modelo base Qwen3.5-9B (razonamiento, código, matemáticas), aunque no verificadas tras el ajuste ni documentadas en la model card.
- Procesamiento exclusivamente de texto: no se declaran capacidades de visión ni audio.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo de razonamiento o "thinking mode": no disponible (no documentado).

## Casos de uso

- Asistente local de consultas de ciberseguridad: ejecutable con llama.cpp en hardware de consumo gracias a la cuantización Q4_K_M, útil para resolver dudas sobre conceptos, configuraciones o procedimientos de seguridad sin enviar datos a servicios externos.
- Apoyo en triaje de alertas: el ajuste sobre material de seguridad permite generar borradores de explicación o clasificación preliminar de incidentes, siempre con revisión humana dado que no hay evaluación de precisión.
- Formación y concienciación: generación de explicaciones didácticas sobre vectores de ataque y buenas prácticas, aprovechando el corpus especializado del ajuste.
- Prototipado de herramientas internas: al distribuirse en GGUF, puede integrarse en scripts y utilidades de línea de comandos mediante llama.cpp para flujos de trabajo de seguridad en entornos aislados.
- Experimentación e investigación: sirve como caso de estudio de ajuste fino con LoRA sobre un dataset pequeño (4.900 registros) y su efecto en un modelo de 9B, útil para quienes investigan metodologías de especialización.
- Despliegue en entornos air-gapped: al ser un archivo GGUF autónomo y de licencia Apache 2.0, puede operarse en máquinas sin conexión, un requisito habitual en equipos de seguridad.
- Base para nuevos ajustes: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para fine-tunings adicionales en subdominios concretos de ciberseguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado para precisión ("not evaluated for accuracy").

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M y 9B parámetros, el archivo de pesos ronda aproximadamente 5-6 GB; el consumo total en ejecución depende de la longitud de contexto y del backend.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante), si bien no hay confirmación oficial.
- Cabe en GPU de consumo: previsiblemente sí, en modelos con 8 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (documentado por el autor mediante `llama-cli -m cybersec-9b-Q4_K_M.gguf --jinja`). Otros backends compatibles con GGUF (Ollama, llama-cpp-python) no están documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a parámetros y disponibilidad. Se compara con el modelo base y con alternativas genéricas de tamaño similar; los datos de terceros no están confirmados en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cybersec-9b-gguf | 9B (base) | no disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste LoRA en ciberseguridad, sin evaluar |
| Qwen/Qwen3.5-9B | 9B | no disponible | no disponible en esta ficha | no disponible | Modelo base generalista |
| Alternativas de 7-9B en ciberseguridad | no disponible | no disponible | no disponible | no disponible | No se identifican comparables verificables en la información proporcionada |

## Limitaciones y advertencias

- Modelo sin evaluación: el autor lo califica como "trial run" y advierte que no se ha medido su precisión; no debe usarse en producción sin validación propia.
- Riesgo de alucinación: al ser un ajuste sobre un dataset pequeño (4.900 registros) sin evaluación, la probabilidad de respuestas incorrectas o inventadas en materia de seguridad es alta y no está cuantificada.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset Vyber07/cyber-security, cuya composición y procedencia no se detallan.
- Idiomas: no se declaran idiomas soportados; se desconoce el comportamiento multilingüe tras el ajuste.
- Contexto: se desconoce la longitud de contexto efectiva del modelo ajustado.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero debe conservarse el aviso de licencia y atribución correspondiente; conviene verificar también las condiciones del modelo base Qwen3.5-9B y del dataset utilizado.
- Madurez: cero descargas y cero interacciones en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Ámbito: modelo exclusivamente de texto; no apto para tareas multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/CyberMalaya/cybersec-9b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de ajuste: https://huggingface.co/datasets/Vyber07/cyber-security
- llama.cpp (backend documentado por el autor): no se proporciona enlace en la información disponible.
