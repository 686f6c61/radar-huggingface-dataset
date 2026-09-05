# skaran786/llama32-3b-ecra-sft

## Resumen

El modelo `skaran786/llama32-3b-ecra-sft` es un adaptador LoRA entrenado con QLoRA por el desarrollador skaran786 sobre el modelo base `unsloth/Llama-3.2-3B-Instruct`. Su finalidad es actuar como asistente de investigación para actas de resultados (earnings calls), generando respuestas y resúmenes anclados a transcripciones públicas. Se presenta como un proyecto de portafolio, no como un sistema de asesoramiento financiero.

El adaptador se entrenó mediante ajuste fino supervisado (SFT) con la librería Unsloth en una GPU T4 de Kaggle. Los datos provienen de fuentes públicas: muestras de transcripciones del S&P, FiQA y finance-alpaca, con un pipeline de filtrado orientado a que las respuestas se fundamenten en el contexto proporcionado. El repositorio ocupa aproximadamente 0,1 GB, pues contiene únicamente los pesos del adaptador PEFT y no los parámetros completos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador decoder-only con adaptador LoRA (modelo base: Llama 3.2 3B Instruct) |
| Parametros totales | No disponible (adaptador PEFT; el modelo base tiene ~3.000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada por el autor; heredada del modelo base |
| Tipos de cuantizacion | No disponible en el adaptador; el modelo base admite carga en 4-bit |
| Idiomas soportados | No especificados por el autor; el modelo base es multilingue, el ajuste parece centrado en ingles |
| Licencia | MIT (adaptador) |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/Llama-3.2-3B-Instruct`, un modelo transformer decoder-only de aproximadamente 3.000 millones de parámetros. La documentación del adaptador no especifica la longitud de contexto, por lo que se hereda la del modelo base.

El entrenamiento utilizó QLoRA, combinando cuantización de 4 bits con adaptadores de bajo rango (LoRA), mediante SFT con la librería Unsloth. Los datos provienen de fuentes públicas: transcripciones de resultados del S&P, FiQA y finance-alpaca. Según el autor, se aplicó un pipeline de filtrado y "grounding" para que las respuestas estén basadas en el contexto proporcionado, reduciendo la alucinación. El entrenamiento se realizó en una única GPU T4 de Kaggle. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de resúmenes y respuestas sobre actas de resultados financieros (earnings calls).
- Respuestas conversacionales de estilo investigador basadas en el contexto aportado en el prompt.
- Inferencia ligera: al ser un adaptador PEFT, el coste de almacenamiento es mínimo (0,1 GB).
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el entrenamiento parece centrado en inglés.
- Visión, audio o modo de pensamiento: no documentados.

## Casos de uso

1. **Asistente de investigación para actas de resultados**: el modelo responde preguntas de estilo investigador sobre transcripciones de earnings calls, generando resúmenes que se anclan al fragmento de texto incluido en el prompt. Adecuado para analistas que necesitan revisar rápidamente llamadas de resultados.

2. **Resumen de llamadas trimestrales**: a partir de la transcripción de una llamada, el modelo genera un resumen estructurado con los puntos financieros clave, como ingresos, márgenes o previsiones, lo que facilita el escaneo de múltiples empresas.

3. **Preguntas y respuestas con contexto**: al proporcionar fragmentos concretos de la transcripción como contexto, el modelo extrae información específica y responde preguntas puntuales, reduciendo la probabilidad de alucinación fuera del texto dado.

4. **Análisis de sentimiento en textos financieros**: con datos de FiQA y finance-alpaca, el modelo puede identificar el tono y el sentimiento en noticias financieras o comentarios de analistas.

5. **Apoyo a relaciones con inversores**: los equipos de IR pueden usar el modelo para generar borradores de actas o resúmenes ejecutivos tras cada llamada, acelerando el trabajo de reporting interno.

6. **Prototipo de ajuste fino con QLoRA**: para desarrolladores que deseen aprender a crear adaptadores LoRA con Unsloth sobre Llama 3.2, este repositorio sirve como ejemplo de pipeline completo: carga del modelo en 4 bits, entrenamiento QLoRA, guardado del adaptador y carga posterior con PEFT. El código está disponible en el repositorio de GitHub asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de evaluación comparativa (como MMLU, HumanEval o GSM8K) en su documentación. Por tanto, no es posible presentar una tabla comparativa basada en datos verificados.

## Requisitos de hardware

- **VRAM estimada**: el adaptador ocupa ~0,1 GB. El modelo base en 4-bit necesita ~2 GB de pesos; en la práctica, la inferencia completa suele requerir entre 4 y 6 GB de VRAM, dependiendo de la longitud de contexto y el tamaño de lote.
- **GPU recomendadas**: una GPU con 8-12 GB de VRAM es suficiente. El entrenamiento se realizó en una T4 de Kaggle (16 GB).
- **GPU de consumo**: sí, una RTX 3060 12GB, RTX 4060 Ti 8GB o superior puede ejecutar el modelo con cuantización 4-bit.
- **Opciones de despliegue**: carga directa con Transformers y PEFT (según el ejemplo del autor). Para mayor rendimiento, se puede fusionar el adaptador con el modelo base y exportar a llama.cpp, o desplegar con vLLM. También es compatible con el ecosistema Unsloth.
- **Latencia y throughput**: no disponibles en la información del proyecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Ajuste |
|---|---|---|---|---|---|
| skaran786/llama32-3b-ecra-sft | ~3.000 millones + adaptador LoRA | No especificada | MIT (adaptador) | Adaptador QLoRA | Finanzas / earnings calls |
| unsloth/Llama-3.2-3B-Instruct | ~3.000 millones | No especificada | Llama 3.2 Community License | Modelo base instruct | Ninguno (base) |
| meta-llama/Llama-3.2-3B-Instruct | ~3.000 millones | No especificada | Llama 3.2 Community License | Modelo base instruct | Ninguno (base) |

## Limitaciones y advertencias

- **No constituye asesoramiento financiero**: el autor indica explícitamente que el modelo no es consejo de inversión.
- **Riesgo de alucinación**: el propio autor advierte que puede alucinar fuera del contexto proporcionado. Se recomienda usar prompts con fragmentos de texto.
- **Datos de entrenamiento limitados**: se entrenó con una muestra pública acotada, no con el corpus completo de transcripciones del S&P. La cobertura de empresas y sectores es limitada.
- **Licencia del modelo base**: aunque el adaptador se publica bajo MIT, el modelo base (Llama 3.2 3B Instruct) se rige por la Llama 3.2 Community License, que impone restricciones de uso comercial y requiere atribución. Un producto final que combine ambos debe cumplir la licencia del modelo base.
- **Sin benchmarks publicados**: no hay resultados de evaluación comparativa, por lo que el rendimiento real en tareas financieras no está verificado.
- **Idioma**: el ajuste parece centrado en inglés; la documentación no detalla soporte para otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skaran786/llama32-3b-ecra-sft
- Modelo base (unsloth): https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Modelo base instruct (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Modelo base sin instrucciones (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B
- Repositorio de código: https://github.com/nuwanda94/earnings-call-research-assistant
