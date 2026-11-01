# MishraNepali/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF_Q2_K

## Resumen

OrcaSAQ-2-Cyber-27B-Uncensored-GGUF_Q2_K es una cuantización extrema (Q2_K) de un modelo de ciberseguridad sin filtros de 27.320 millones de parámetros, publicado por el usuario MishraNepali en Hugging Face. El modelo base es Qwen3.8-27B de Qwen (licencia Apache 2.0), que fue previamente convertido a GGUF y sometido a modificaciones de abliteration por orcarouter para eliminar sus filtros de seguridad, y posteriormente re-cuantizado a Q2_K para reducir el consumo de memoria de 15,7 GB a 10,9 GB.

El propósito de esta versión es permitir la ejecución del modelo en CPU con 16 GB de RAM o en entornos gratuitos como Google Colab, a costa de una pérdida significativa de calidad respecto a cuantizaciones superiores. El propio autor advierte explícitamente que la versión cuantizada puede alucinar y recomienda una ventana de contexto de 1024 tokens o superior. Está orientado a tareas de generación de texto en el dominio de la ciberseguridad, aunque su naturaleza "uncensored" y su cuantización agresiva lo hacen apto solo para experimentación y no para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen (variante Qwen3.8) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | 1024 tokens recomendados por el autor (máximo real no disponible) |
| Tipos de cuantización | Q2_K (con imatrix), re-cuantizado desde un GGUF intermedio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (endpoints_compatible, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo deriva de Qwen3.8-27B, un transformer denso de la familia Qwen de Alibaba. Sobre el modelo original se aplicaron dos transformaciones sucesivas: primero, orcarouter lo convirtió a GGUF y aplicó abliteration, una técnica que modifica internamente los pesos (normalmente proyectando las direcciones de rechazo en el espacio de activaciones) para eliminar el comportamiento de alineación y los rechazos del modelo sin necesidad de reentrenamiento. Segundo, MishraNepali re-cuantizó el GGUF resultante a Q2_K usando importance matrix (imatrix), una técnica que pondera la cuantización según la importancia de cada activación para mitigar parcialmente la pérdida de calidad en cuantizaciones muy bajas.

No hay información disponible sobre el proceso de entrenamiento del modelo base Qwen3.8-27B (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada. Tampoco se detalla el dataset de especialización en ciberseguridad, si es que existió un fine-tuning específico más allá de la abliteration.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational)
- Dominio orientado a ciberseguridad (etiqueta cybersecurity en la model card)
- Modelo sin filtros de seguridad (uncensored) mediante abliteration, sin rechazos de alineación
- Ejecución local en CPU con 16 GB de RAM gracias a la cuantización Q2_K
- Ejecución en Google Colab según el autor
- Compatibilidad con el ecosistema llama.cpp (formato GGUF con imatrix)
- Tool calling, agentes, capacidades multilingües y modalidades (visión/audio): no disponible

## Casos de uso

- Experimentación con modelos uncensored en ciberseguridad: permite investigar el comportamiento de un modelo sin alineación en consultas técnicas del dominio (análisis de malware, redacción de exploits educativos) sin restricciones de rechazo.
- Pruebas en hardware modesto: al caber en 16 GB de RAM en CPU, es útil para validar prompts y flujos de trabajo en portátiles o servidores sin GPU antes de escalar a cuantizaciones superiores.
- Entornos de demostración gratuitos: puede ejecutarse en Google Colab para demos rápidas sin coste de infraestructura.
- Prototipado de asistentes de seguridad ofensiva/defensiva: generación de texto técnico sobre vulnerabilidades, configuraciones o procedimientos de respuesta a incidentes como punto de partida para evaluar si el modelo base es adecuado.
- Investigación sobre abliteration y cuantización extrema: útil como caso de estudio para medir el impacto combinado de abliteration y Q2_K con imatrix sobre la coherencia y la tasa de alucinación.
- Generación de informes y documentación técnica de seguridad: redacción de resúmenes de hallazgos o notas de análisis donde la calidad de la generación no sea crítica y se prefiera privacidad local frente a calidad máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 10,9 GB de pesos en Q2_K; el autor indica que funciona en CPU con 16 GB de RAM (con velocidad lenta, en sus palabras)
- GPU recomendadas: no disponible; al ocupar unos 11 GB de pesos, una GPU de 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB) sería suficiente para inferencia en GPU, aunque no hay datos oficiales
- Consumer GPU: en teoría cabe en GPUs de 12 GB o más de VRAM; en CPU requiere 16 GB de RAM
- Opciones de despliegue: llama.cpp (librería nativa del modelo), y por extensión herramientas basadas en GGUF como Ollama o LM Studio (no confirmado por el autor); vLLM y TGI no soportan GGUF de forma nativa
- Latencia y throughput: no disponible; el autor solo indica que la ejecución en CPU con 16 GB de RAM es lenta
- Ventana de contexto recomendada: 1024 tokens, ampliable si el hardware lo permite

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Licencia | Particularidad |
|---|---|---|---|---|
| OrcaSAQ-2-Cyber-27B-Uncensored-GGUF_Q2_K | 27.320 M | Q2_K (imatrix) | Apache 2.0 | Uncensored por abliteration, 10,9 GB, ejecutable en CPU 16 GB RAM |
| Qwen3.8-27B (modelo base original) | 27.320 M | Pesos originales (safetensors) | Apache 2.0 | Modelo alineado de Qwen, máxima calidad, mayor consumo de memoria |
| orcarouter/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF | 27.320 M | GGUF intermedio (~15,7 GB) | Apache 2.0 | Uncensored por abliteration, cuantización superior a Q2_K, mejor calidad |

La alternativa más razonable para producción sería el GGUF intermedio de orcarouter (15,7 GB) o cuantizaciones Q4_K_M del mismo modelo, que ofrecen un equilibrio mucho mejor entre calidad y memoria que Q2_K.

## Limitaciones y advertencias

- El propio autor advierte que la versión cuantizada puede alucinar; Q2_K es una cuantización extrema con degradación notable de coherencia y razonamiento
- Ventana de contexto recomendada de solo 1024 tokens, muy limitada para tareas de análisis técnico largo o código extenso
- Modelo uncensored por abliteration: no tiene filtros de seguridad, por lo que puede generar contenido dañino, ilegal o peligroso; su uso con fines maliciosos en ciberseguridad es un riesgo ético y legal real
- La abliteration suele degradar la calidad general del modelo más allá de eliminar rechazos
- No hay información sobre idiomas soportados, benchmarks, ni datos de entrenamiento del modelo base en la documentación
- Descargas muy bajas (351) y sin comunidad de validación: no hay evidencia de uso en producción ni de calidad contrastada
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede no cumplir políticas de plataformas comerciales
- Recomendable usarlo solo en entornos controlados de investigación, nunca en producción

## Enlaces

- Ficha del modelo: https://huggingface.co/MishraNepali/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF_Q2_K
- GGUF intermedio (fuente de re-cuantización): https://huggingface.co/orcarouter/OrcaSAQ-2-Cyber-27B-Uncensored-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
