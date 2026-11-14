# jjhpark/adamw-PT

## Resumen

adamw-PT es un modelo de lenguaje de 494 millones de parámetros con arquitectura Qwen2.5-0.5B, entrenado desde cero por el usuario jjhpark sobre 200.000 millones de tokens del dataset DCLM-Baseline. No se trata de un modelo orientado a producto, sino de un artefacto de investigación: forma parte de la reproducción del paper *Data Schedules and Learning Rate Schedules Should Be Designed Together* (arXiv 2610.29348), en el que se estudia cómo el calendario de datos y el calendario de learning rate deben disenarse conjuntamente en lugar de optimizarse por separado.

El modelo emplea embeddings atados (tied embeddings) y una ventana de contexto de 4.096 tokens, con un entrenamiento de 95.368 pasos y un batch efectivo de 512 secuencias de 4.096 tokens. El entrenamiento se realizó con Megatron-LM y la conversión a formato Hugging Face se hizo mediante Megatron-Bridge, lo que explica la presencia de pesos en safetensors listos para `transformers`.

Su relevancia es acotada pero clara para la comunidad de investigación: sirve como línea base controlada para comparar variantes de scheduling (por ejemplo, distintas combinaciones de decaimiento del learning rate y de curriculum de datos) manteniendo fijos arquitectura, tokenizador y presupuesto computacional. Las pérdidas finales reportadas en validación completa son 2,8364 en DCLM y 2,1915 en FineMath, lo que indica un ajuste razonablemente bueno en el dominio matemático frente al corpus general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (forma Qwen2.5-0.5B), embeddings atados |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen2.5-0.5B: un transformer decoder-only con atención causal estándar, embeddings de entrada y salida atados (tied embeddings), y una ventana de contexto de 4.096 tokens. No incorpora mecanismos de atención lineal, SSM ni mezcla de expertos; es un transformer denso convencional, lo que facilita la comparación controlada con otras variantes del mismo estudio.

El entrenamiento se realizó desde cero sobre 200.000 millones de tokens de DCLM-Baseline, en 95.368 pasos con un batch de 512 secuencias de 4.096 tokens, usando Megatron-LM. No se menciona en la información disponible el uso de RLHF, DPO ni instrucción supervisada, ni detalles sobre la composición exacta del dataset más allá de DCLM-Baseline y la evaluación en FineMath. La innovación metodológica del trabajo al que pertenece no está en la arquitectura, sino en el diseno conjunto del calendario de datos y del calendario de learning rate; el modelo es el sustrato experimental que permite medir el efecto de esas decisiones sobre la pérdida final.

## Capacidades

- Generación de texto autoregresiva básica, condicionada por el entrenamiento exclusivamente de preentrenamiento.
- Modelado de lenguaje y continuación de texto; no se ha verificado instruction following ni formato conversacional más allá de la etiqueta `conversational` del repositorio.
- Razonamiento matemático incipiente: la pérdida de 2,1915 en FineMath sugiere cierta capacidad en texto matemático, aunque no se han publicado benchmarks de resolución de problemas.
- No hay evidencia publicada de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia publicada de capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No dispone de visión, audio ni modo thinking explícito.
- Compatible con text-generation-inference y endpoints_compatible según las etiquetas del repositorio, lo que permite desplegarlo como endpoint de generación de texto.

## Casos de uso

- Línea base en experimentos de scheduling: usar el modelo como referencia fija para comparar variantes de learning rate y curriculum de datos, ya que arquitectura y tokenizador permanecen constantes.
- Estudio de recetas de preentrenamiento: reproducir el entrenamiento con Megatron-LM y medir el efecto de cambiar el batch, el número de pasos o el calendario de datos sobre la pérdida de validación.
- Evaluación de corpus matemáticos: al reportar pérdida en FineMath, permite analizar cuánto conocimiento matemático se adquiere con 200.000 millones de tokens de DCLM-Baseline.
- Generación de texto no crítica en entornos de investigación: completar fragmentos, generar borradores o producir texto sintético para experimentos internos, con la ventana de 4.096 tokens como límite.
- Destilación y fine-tuning posteriores: al ser un modelo pequeño de 494 millones de parámetros con licencia Apache 2.0, sirve como inicialización para tareas específicas o como alumno en pipelines de destilación.
- Despliegue ligero en CPU o GPU de gama baja para pruebas de infraestructura (TGI, endpoints compatibles), dado su tamano de repositorio de 1,0 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento reportados son las pérdidas de validación completas:

| Métrica | Valor |
|---|---|
| Pérdida DCLM (held-out, validación completa) | 2,8364 |
| Pérdida FineMath (held-out, validación completa) | 2,1915 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1 GB de pesos más caché KV y activaciones; en la práctica cabe en GPUs de 4 GB o más.
- En cuantización de 8 bits o 4 bits (si se generan pesos GGUF/AWQ con herramientas externas), el modelo puede caber en 1 GB o menos de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para cargas por lotes en investigación, A100 o H100 aportan margen de throughput.
- Cabe en GPU consumer: sí, con holgura, incluso en tarjetas de gama baja.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta oficial), endpoints compatibles; llama.cpp u Ollama requerirían conversión a GGUF no documentada en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adamw-PT | 494 M | 4.096 | 200B tokens DCLM-Baseline, desde cero | Apache 2.0 | Hugging Face (jjhpark/adamw-PT) |
| Qwen2.5-0.5B | ~494 M | 32.768 | Corpus multilingüe propietario, preentrenamiento + post-entrenamiento | Apache 2.0 | Hugging Face (Qwen) |
| SmolLM2-360M | ~360 M | 8.192 | Corpus mixto curado, preentrenamiento + post-entrenamiento | Apache 2.0 | Hugging Face (HuggingFaceTB) |

La comparación relevante es de propósito: adamw-PT es una línea base de investigación sin post-entrenamiento ni benchmarks publicados, mientras que Qwen2.5-0.5B y SmolLM2-360M son modelos de producto con contexto mayor y evaluación pública. Los datos de rendimiento comparativo de adamw-PT frente a estos modelos no están disponibles.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no se ha sometido a instruction tuning, RLHF ni DPO, por lo que no cabe esperar seguimiento fiable de instrucciones ni formato conversacional.
- Riesgo elevado de alucinación y de generar contenido incoherente en tareas abiertas, dado el tamano y la ausencia de alineación.
- Sesgos conocidos: no documentados en la información disponible; al entrenar sobre DCLM-Baseline, hereda los sesgos presentes en ese corpus web.
- Idiomas soportados no disponibles; no hay garantía de calidad multilingüe.
- Ventana de contexto limitada a 4.096 tokens, muy inferior a la de modelos de producto comparables.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción ni dispone de evaluaciones de seguridad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de soporte.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que su calidad relativa no está cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjhpark/adamw-PT
- Paper de referencia: *Data Schedules and Learning Rate Schedules Should Be Designed Together*, arXiv 2610.29348 (enlace directo no disponible en la información proporcionada)
- Megatron-LM: no disponible en la información proporcionada
- Megatron-Bridge: no disponible en la información proporcionada
- DCLM-Baseline: no disponible en la información proporcionada
- FineMath: no disponible en la información proporcionada
