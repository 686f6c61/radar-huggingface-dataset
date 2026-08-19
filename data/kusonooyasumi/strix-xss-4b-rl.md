# kusonooyasumi/strix-xss-4b-rl

## Resumen

Strix-XSS-4B-RL es un modelo de lenguaje especializado en la detección de vulnerabilidades Cross-Site Scripting (XSS), desarrollado por el usuario kusonooyasumi como prueba de concepto (PoC) para demostrar la viabilidad de entrenar agentes de seguridad mediante aprendizaje por refuerzo (RL). Está construido sobre el modelo base Qwen/Qwen3-4B-Thinking-2507, un transformer de 4 mil millones de parámetros con capacidad de razonamiento explícito. El modelo está diseñado para integrarse como sub-agente dentro del framework de pentesting Strix, donde se encarga específicamente de identificar XSS en aplicaciones web simuladas.

La relevancia de este modelo radica en que explora un enfoque novedoso: en lugar de usar fine-tuning supervisado tradicional, emplea RL para optimizar la detección de vulnerabilidades en entornos simulados. Sin embargo, al tratarse de un PoC con un conjunto de entrenamiento muy reducido (135 ejemplos) y una evaluación limitada a un único entorno, no está preparado para uso en producción. Su interés principal es académico y de investigación, sirviendo como referencia para futuros desarrollos de agentes de seguridad especializados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B-Thinking-2507 (Transformer, no MoE) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible en este repositorio (solo safetensors; la model card menciona versiones GGUF en otro repositorio sin enlace verificado) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Thinking-2507, un transformer denso de 4B parámetros que incorpora un mecanismo de "thinking" (razonamiento explícito antes de responder). Sobre esta base, se realizó un fine-tuning mediante aprendizaje por refuerzo (RL) en un entorno simulado de aplicación web integrado con las herramientas del framework Strix. El entrenamiento se llevó a cabo en la plataforma Prime Intellect, utilizando un dataset de solo 135 ejemplos que representan escenarios de detección de XSS.

La innovación principal no reside en la arquitectura, sino en el método de entrenamiento: en lugar de un ajuste supervisado convencional, se aplicó RL para optimizar directamente la capacidad del modelo para identificar vulnerabilidades en un entorno interactivo. Esto permite que el modelo aprenda a través de recompensas basadas en la correcta detección de XSS, en lugar de imitar etiquetas estáticas. No se mencionan técnicas adicionales como decodificación especulativa o atención lineal; se trata de un fine-tuning estándar sobre un modelo ya entrenado.

## Capacidades

- Detección de vulnerabilidades XSS en aplicaciones web simuladas, con una puntuación de 0.79 en la evaluación Strix-XSS.
- Razonamiento explícito: hereda la capacidad de "thinking" del modelo base Qwen3-4B-Thinking-2507, lo que le permite analizar el contexto antes de emitir una respuesta.
- Integración como sub-agente especializado dentro del framework Strix, diseñado para trabajar en sistemas multi-agente donde diferentes modelos manejan distintos tipos de vulnerabilidades.
- Generación de texto en inglés, aunque su uso principal es la clasificación y análisis de código web en busca de patrones XSS.
- No se reportan capacidades de tool calling, visión, audio u otras modalidades. Su alcance se limita a la tarea específica de detección de XSS.

## Casos de uso

- Investigación académica en seguridad: sirve como punto de partida para estudiar cómo el RL puede entrenar agentes especializados en detección de vulnerabilidades. Los investigadores pueden analizar sus decisiones y comparar con métodos supervisados tradicionales.
- Demostración de integración de sub-agentes en frameworks de pentesting: permite validar la arquitectura de Strix para incorporar modelos específicos por tipo de vulnerabilidad, aunque la versión pública de Strix aún no soporta esta funcionalidad.
- Pruebas de concepto en entornos controlados: se puede desplegar en laboratorios de seguridad para evaluar su comportamiento en aplicaciones web simuladas, sin riesgo de afectar sistemas reales.
- Benchmark de referencia para futuros modelos de detección de XSS: al publicar su evaluación (0.79), sirve como línea base para comparar otros enfoques de RL aplicados a seguridad.
- Entrenamiento de agentes de seguridad más amplios: sus pesos pueden servir como inicialización para fine-tuning adicional con datasets más grandes, si se desea expandir su alcance.
- Evaluación de la viabilidad de RL en entornos con datos limitados: el uso de solo 135 ejemplos permite estudiar el impacto de la escasez de datos en el rendimiento de agentes de seguridad.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Strix-XSS Evaluation | 0.79 |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K. La única métrica disponible es la evaluación específica de Strix-XSS, que mide la capacidad del modelo para identificar correctamente vulnerabilidades XSS en aplicaciones web simuladas dentro del framework Strix. No hay comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Con 4.022 millones de parámetros, el modelo en precisión completa (FP16) requiere aproximadamente 8 GB de VRAM para inferencia, por lo que es ejecutable en GPUs de consumo como la RTX 3080 (10 GB) o RTX 4090 (24 GB).
- En cuantización Q4_K_M (si se utilizan las versiones GGUF mencionadas en la model card), el tamaño se reduce a unos 2.5 GB, permitiendo su ejecución en GPUs con 4-6 GB de VRAM, como la RTX 3060 o incluso en CPU con suficiente RAM.
- No se especifican requisitos oficiales de hardware. Las cifras anteriores son estimaciones orientativas basadas en el tamaño del modelo.
- Opciones de despliegue: al ser un modelo basado en Qwen3, puede servirse con vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos correspondiente (safetensors para vLLM/TGI, GGUF para llama.cpp/Ollama).
- La latencia y el throughput no han sido medidos ni publicados. Dado su tamaño, se espera una latencia moderada en GPU consumer, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Strix-XSS-4B-RL | 4B | No disponible | Detección XSS (RL) | MIT | HuggingFace (PoC) |
| Qwen3-4B-Thinking-2507 (base) | 4B | No especificado | Generalista | Apache 2.0 | HuggingFace |
| No se dispone de otros modelos especializados en XSS con RL en la información proporcionada | - | - | - | - | - |

La comparación directa con el modelo base muestra que Strix-XSS-4B-RL está altamente especializado, sacrificando la generalidad por una tarea concreta. No se han encontrado alternativas comerciales o de código abierto con el mismo enfoque (RL para XSS) en los datos disponibles.

## Limitaciones y advertencias

- Estado de prueba de concepto: no está listo para producción; requiere validación adicional y pruebas exhaustivas antes de cualquier uso real.
- Dataset de entrenamiento extremadamente pequeño (135 ejemplos), lo que limita la generalización a escenarios no vistos.
- Entrenamiento en entornos simulados: el rendimiento en aplicaciones web reales puede variar significativamente.
- Especialización exclusiva en XSS: no cubre otros tipos de vulnerabilidades (SQLi, CSRF, etc.).
- Dependencia del framework Strix: está diseñado para funcionar como sub-agente dentro de Strix; su uso aislado puede no ser efectivo.
- La versión pública de Strix no soporta aún sub-agentes personalizados, por lo que la integración es experimental.
- Solo soporta inglés, lo que limita su aplicabilidad en entornos multilingües.
- No se han publicado evaluaciones de sesgos, alucinaciones o comportamientos adversos; dado su enfoque en seguridad, existe riesgo de falsos positivos o negativos en la detección.
- La licencia MIT permite uso comercial, pero dado el estado PoC, no se recomienda su uso en sistemas críticos sin una revisión exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kusonooyasumi/strix-xss-4b-rl
- Framework Strix: https://github.com/usestrix/strix
- Plataforma Prime Intellect: https://www.primeintellect.ai/
- Modelo base Qwen3-4B-Thinking-2507: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507 (referencia indirecta, no confirmada en la información proporcionada)
- Entorno de evaluación Strix-XSS: https://app.primeintellect.ai/dashboard/environments/oyasumi/strix-xss (mencionado en la model card)

Nota: no se ha verificado la existencia del repositorio GGUF mencionado en la model card (kusonooyasumi/strix-xss-qwen3-4b-rl-gguf), ya que el enlace no está disponible en la información proporcionada.
