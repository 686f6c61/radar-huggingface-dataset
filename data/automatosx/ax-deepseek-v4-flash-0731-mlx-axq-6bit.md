# AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-6bit

## Resumen
AX-DeepSeek-V4-Flash-0731-MLX-AXQ-6bit es un paquete de cuantización del modelo base deepseek-ai/DeepSeek-V4-Flash-0731, desarrollado por AutomatosX. Utiliza el formato MLX, diseñado específicamente para ejecutarse en hardware Apple Silicon, y aplica la técnica de cuantización propietaria AXQuant en una configuración de 6 bits con grupos de 128 (group-128). El objetivo principal es reducir el tamaño del modelo original para permitir su ejecución local en equipos Mac con memoria unificada.

La relevancia de este modelo radica en la creciente demanda de ejecutar modelos de lenguaje de gran tamaño (LLM) de forma local, sin depender de servicios en la nube. Sin embargo, la ficha técnica del autor incluye una advertencia crítica: el checkpoint de nivel 1 (Tier 1) no puede ejecutarse en un Mac Studio M2 con 192 GB de memoria, ya que el proceso de generación se bloquea por falta de memoria. Esto indica que, a pesar de la cuantización, el modelo requiere una cantidad de memoria unificada extremadamente alta, superior a 192 GB, o una configuración de hardware aún no especificada.

En cuanto a la arquitectura, no se proporcionan detalles específicos sobre el modelo base (como número de parámetros, tipo de arquitectura transformer o MoE, o longitud de contexto) en la información disponible. La licencia del paquete cuantizado es MIT, lo que facilita su uso y modificación, aunque se debe verificar la licencia del modelo base original para cualquier restricción adicional.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base: deepseek-ai/DeepSeek-V4-Flash-0731) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQuant 6-bit group-128 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento
La información proporcionada se centra exclusivamente en el proceso de cuantización, no en el entrenamiento del modelo base. El modelo base es deepseek-ai/DeepSeek-V4-Flash-0731, pero no se detallan sus características arquitectónicas (número de capas, tipo de atención, etc.) ni el conjunto de datos con el que fue entrenado.

La innovación técnica de este paquete reside en la receta de cuantización AXQuant, especificada en el archivo `examples/deepseek-v4-experimental-6bit-g128-v0.1.yaml`. Se trata de una cuantización de 6 bits con un tamaño de grupo de 128, que busca un equilibrio entre la pérdida de precisión y la reducción del uso de memoria. No se menciona el uso de técnicas como RLHF o DPO en el proceso de cuantización, ya que es un paso posterior al entrenamiento.

## Capacidades
- Generación de texto autoregresiva: al ser un modelo de generación de texto, su función principal es producir texto coherente a partir de un prompt.
- Inferencia local en Apple Silicon: gracias al formato MLX, está optimizado para ejecutarse en la GPU y CPU de los chips de Apple.
- Compatibilidad con el ecosistema MLX: puede integrarse con librerías y herramientas que soporten MLX, como `mlx-lm`.
- No se dispone de información sobre capacidades específicas del modelo base, como tool calling, razonamiento multi-paso, visión o audio. Estas capacidades, si existen, son heredadas del modelo DeepSeek-V4-Flash-0731, pero no están documentadas en la ficha proporcionada.

## Casos de uso
- Investigación de técnicas de cuantización: este paquete sirve como referencia para estudiar el impacto de la cuantización AXQuant de 6 bits en modelos de gran tamaño, especialmente en términos de huella de memoria y rendimiento.
- Desarrollo de prototipos en entornos aislados: en laboratorios o empresas con requisitos estrictos de privacidad, se puede intentar desplegar en hardware Apple Silicon de gama alta (siempre que se supere la barrera de memoria de 192 GB) para generar texto sin conexión.
- Evaluación de hardware de nueva generación: puede utilizarse para probar los límites de memoria unificada de futuros Macs o configuraciones con más de 192 GB, sirviendo como prueba de estrés para validar la capacidad del hardware.
- Experimentación con generación de texto de alta fidelidad: si se logra ejecutar, permite experimentar con la generación de texto de un modelo de la familia DeepSeek en local, evitando la latencia de red y los problemas de privacidad de la nube.
- Formación y educación: útil para demostrar los desafíos de la inferencia local de LLMs de gran tamaño y las soluciones de cuantización, aunque su alta demanda de memoria limita su uso práctico en entornos docentes estándar.
- Integración en pipelines de investigación: puede ser utilizado como componente en sistemas de investigación que requieran generación de texto, siempre que el hardware disponible cumpla con los requisitos de memoria y se acepte la ausencia de benchmarks.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Hardware objetivo: Apple Silicon (debido al formato MLX).
- Memoria unificada: la advertencia del autor indica que un Mac Studio M2 con 192 GB no es suficiente para ejecutar el checkpoint de nivel 1 (Tier 1). El proceso de generación se bloquea por falta de memoria. Por tanto, se requiere una configuración con más de 192 GB de memoria unificada, o una versión del checkpoint con menos requisitos (no especificada).
- VRAM estimada: no disponible, pero la limitación práctica se sitúa por encima de 192 GB.
- GPUs recomendadas: no aplica (específico de Apple Silicon, no GPUs NVIDIA/AMD estándar).
- Opciones de despliegue: MLX (librería principal), posiblemente a través de herramientas que soporten MLX como `mlx-lm`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base, por lo que una comparativa cuantitativa no es posible. Sin embargo, se puede comparar conceptualmente con otras cuantizaciones de modelos DeepSeek en formato MLX, como versiones de 4 bits u 8 bits. La cuantización de 6 bits (AXQuant) se sitúa en un punto intermedio entre ambas, ofreciendo potencialmente una mejor calidad que 4 bits y un menor uso de memoria que 8 bits, aunque estos son supuestos teóricos no verificados con datos reales.

Alternativas potenciales: otras cuantizaciones de DeepSeek-V4-Flash-0731 en MLX (si existen) o cuantizaciones de modelos similares de la familia DeepSeek. No se dispone de información concreta sobre modelos comparables.

## Limitaciones y advertencias
- Limitación de memoria crítica: el autor advierte explícitamente que el checkpoint Tier 1 no puede ejecutarse en un Mac Studio M2 con 192 GB de memoria. Esto limita severamente su uso práctico en el hardware actual de gama alta.
- Idiomas soportados: no especificados. Se desconoce si el modelo base soporta múltiples idiomas o solo inglés.
- Riesgo de alucinación: al ser un modelo de generación de texto, existe el riesgo inherente de generar información falsa o inventada, aunque no se dispone de datos específicos sobre la tasa de alucinación.
- Sesgos: no se dispone de información sobre sesgos conocidos del modelo base.
- Licencia: el paquete cuantizado tiene licencia MIT, lo que permite uso comercial y modificación. Sin embargo, se debe verificar la licencia del modelo base `deepseek-ai/DeepSeek-V4-Flash-0731` para asegurar el cumplimiento de sus términos, ya que la licencia del paquete no cubre necesariamente el modelo original.
- Datos de rendimiento: la ausencia de benchmarks y de especificaciones técnicas del modelo base dificulta la evaluación de su calidad y rendimiento real.

## Enlaces
- [HuggingFace - AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-6bit](https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-0731-MLX-AXQ-6bit)
- No se han proporcionado otros enlaces (papers, blogs, repos) en la información disponible.
