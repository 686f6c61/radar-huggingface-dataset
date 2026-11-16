# kmnuddin/braino-qwen3.5-4b-GGUF

## Resumen

BrainO Qwen3.5 4B es un ajuste fino mediante LoRA del modelo base Qwen3.5 4B, desarrollado por kmnuddin como motor local del agente de IA de la plataforma de análisis de EEG BrainO. El modelo está especializado en operar las herramientas de análisis de BrainO: seleccionar la herramienta y los parámetros adecuados, solicitar confirmación al usuario antes de tomar decisiones, señalar cuándo los datos no contienen lo que se pide y responder exclusivamente con cifras devueltas por las herramientas. Se distribuye en formato GGUF cuantizado Q4_K_M (2.708.804.064 bytes, SHA-256 `4c9c1fcaa2cf41a5da6842a97c6ed111ed53ed63991209edb06bfdb5c5810571`), pensado para ejecutarse con llama.cpp en CPU con 16 GB de RAM o en GPU.

El modelo base Qwen3.5 4B cuenta con 4.205.751.296 parámetros y una torre de visión que el ajuste deja intacta; el adaptador LoRA se aplicó únicamente al modelo de lenguaje. El ajuste se entrenó sobre 887 conversaciones sintéticas (98 reservadas para validación) generadas mediante un profesor programado que reproducía el bucle real del agente sobre conjuntos de EEG sintéticos con problemas inyectados (canales ruidosos, planos o ausentes, ruido de red, sujetos faltantes).

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un componente de un pipeline concreto. Fuera de BrainO funciona como un modelo de chat general con una especialización estrecha, y el propio autor recomienda usar el modelo base para otros fines. La licencia Apache-2.0 y el formato GGUF facilitan su despliegue local sin dependencia de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5 4B) con adaptador LoRA fusionado; torre de visión sin modificar |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | inglés (entrenado solo con peticiones en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`braino-qwen3.5-4b-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5 4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y aplica un adaptador LoRA de rango 16, alpha 32 y dropout 0.05 exclusivamente sobre el modelo de lenguaje; la torre de visión queda intacta. Durante el entrenamiento se usó el modelo base en 4 bits (nf4) con cómputo en bf16, 2 épocas y tasa de aprendizaje 1e-4. El adaptador se fusionó posteriormente en el modelo base y se convirtió con `convert_hf_to_gguf.py` de llama.cpp antes de cuantizar a Q4_K_M.

Los datos de entrenamiento son 887 conversaciones sintéticas (98 en validación), generadas por un profesor programado que ejecutaba el bucle real del agente de BrainO sobre datasets de EEG sintéticos con problemas plantados (canales ruidosos, planos o ausentes, ruido de red, sujetos faltantes). Solo se conservaron las conversaciones que superaban las comprobaciones y en las que cada número de la respuesta provenía de un resultado de herramienta. No se usaron grabaciones reales ni datos personales; el generador es `braino.training` del repositorio BrainO (`braino train data`). El modelo se probó con la build b11606 de llama.cpp.

## Capacidades

- Generación de texto conversacional en inglés, con especialización en el dominio de análisis de EEG.
- Uso de herramientas (tool calling / function calling) conforme a los esquemas que BrainO le proporciona: selección de herramienta y parámetros de análisis.
- Razonamiento multi-paso dentro del bucle del agente: inspección, comprobaciones de calidad, preprocesado, decisiones, ERPs, espectros, tiempo-frecuencia, estadística y preguntas de documentación.
- Solicitud de confirmación al usuario antes de ejecutar decisiones y aviso cuando los datos no contienen lo solicitado.
- Restricción de respuestas a cifras devueltas por las herramientas, con verificación de cada número contra los resultados.
- Capacidad de rechazar o no ejecutar peticiones que no debería llevar a cabo (incluidas en la evaluación del agente).
- Capacidades multilingües limitadas: entrenado solo con peticiones en inglés.
- Sin modo de pensamiento ni capacidades de audio documentadas; la torre de visión del base no fue ajustada.

## Casos de uso

- Análisis de EEG guiado por agente: el modelo elige la herramienta y los parámetros adecuados (preprocesado, detección de artefactos, ERPs, espectros) dentro de BrainO, apoyándose en los esquemas de herramientas que la plataforma le inyecta.
- Comprobación de calidad de datos: detecta y comunica problemas inyectados como canales ruidosos, planos o ausentes, ruido de red o sujetos faltantes, pidiendo confirmación antes de aplicar correcciones.
- Asistente de investigación con trazabilidad numérica: al responder solo con cifras procedentes de resultados de herramientas, sirve para flujos donde la verificabilidad de los datos es crítica.
- Automatización de documentación técnica: responde a preguntas de documentación del dominio y ayuda a interpretar los resultados estadísticos generados por las herramientas de BrainO.
- Despliegue local y privado: al ejecutarse con llama.cpp en CPU con 16 GB de RAM o en GPU, permite procesar datos de EEG sin enviarlos a servicios en la nube.
- Integración en pipelines de agentes con validación: su comportamiento de pedir confirmación y ceñirse a resultados de herramientas encaja en entornos donde se registran todas las llamadas y se audita cada número.
- Prototipado de asistentes de dominio científico acotado: sirve como referencia para construir agentes especializados sobre un modelo base de 4B con LoRA y evaluación por tareas.

## Benchmarks y rendimiento

Evaluación del agente de BrainO: 48 tareas (inspección, comprobaciones de calidad, preprocesado, decisiones, ERPs, espectros, tiempo-frecuencia, estadística, preguntas de documentación y peticiones que el agente no debería ejecutar), cada una ejecutada varias veces con tres formulaciones distintas de la petición. Ninguna formulación de la evaluación está en los datos de entrenamiento. Ambos modelos cuantizados a Q4_K_M.

| Modelo | GPU, 48 × 5 ejecuciones | CPU (nivel mínimo), 48 × 3 ejecuciones |
|---|---|---|
| Qwen3.5 4B (base) | 90,0 % | 89 % |
| Este modelo | 95,8 % | 94 % |

Con los mismos datos de entrenamiento y otras dos semillas aleatorias se obtuvieron 95,0 % y 92,1 % en GPU, por lo que unos ±2 puntos del resultado son atribuibles al azar. En CPU, este modelo también registró ejecuciones más cortas (mediana de 64 s frente a 87 s por tarea).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q4_K_M ocupa 2.708.804.064 bytes (aproximadamente 2,7 GB); se indica ejecución en CPU con 16 GB de RAM (equipo mínimo de BrainO) o en GPU.
- GPU recomendadas: no disponible (el autor no especifica modelos concretos).
- ¿Cabe en GPU de consumo? No disponible de forma explícita; por el tamaño del archivo cuantizado (unos 2,7 GB) es compatible con GPUs de consumo con suficiente VRAM libre, aunque el autor no lo confirma.
- Opciones de despliegue: llama.cpp (probado con la build b11606); BrainO lo descarga con `braino model setup` y lo sirve con llama.cpp, proporcionándole los esquemas de herramientas y el system prompt.
- Latencia y throughput: en CPU, mediana de 64 s por tarea en la evaluación (frente a 87 s del base). No se publican cifras de tokens por segundo ni latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (evaluación BrainO, GPU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrainO Qwen3.5 4B (este modelo) | 4.205.751.296 | no disponible | 95,8 % | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5 4B (base) | 4.205.751.296 | no disponible | 90,0 % | Apache-2.0 | Hugging Face |
| Otros ajustes de dominio sobre bases de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible se limita al modelo base del que deriva; no se han proporcionado alternativas de la misma categoría (agentes de análisis de EEG) con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Las respuestas a preguntas que abarcan dos bandas de frecuencia a la vez pueden incluir solo una de ellas.
- Como el modelo base, puede tomar una ruta incorrecta ante una petición formulada de forma laxa; BrainO mitiga esto mostrando cada llamada de herramienta, pidiendo confirmación antes de cualquier decisión y verificando cada número de la respuesta contra los resultados de las herramientas.
- Entrenado únicamente con peticiones en inglés y sobre EEG; el rendimiento en otros idiomas o dominios no está evaluado.
- Fuera de BrainO funciona como un modelo de chat general con especialización estrecha; el autor recomienda el modelo base para otros usos.
- Entrenado exclusivamente con datos sintéticos generados por un profesor programado; no se usaron grabaciones reales ni datos personales, lo que puede limitar la generalización a datos reales.
- La variabilidad entre semillas de entrenamiento es de aproximadamente ±2 puntos en la evaluación, por lo que las diferencias pequeñas frente al base deben interpretarse con cautela.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones comerciales adicionales documentadas; Qwen3.5 es de Qwen team, Alibaba Cloud.
- No se documentan sesgos específicos; al ser un modelo de dominio acotado, el riesgo principal es la alucinación de cifras fuera de los resultados de herramientas, que BrainO contrarresta con verificación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kmnuddin/braino-qwen3.5-4b-GGUF
- Modelo base Qwen3.5 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio BrainO: https://github.com/kmnuddin/BrainO_v2
