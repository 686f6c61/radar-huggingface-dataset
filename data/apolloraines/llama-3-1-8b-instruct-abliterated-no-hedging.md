# ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-No-Hedging

## Resumen

Llama-3.1-8B-Instruct-Abliterated-No-Hedging es una variante del modelo meta-llama/Llama-3.1-8B-Instruct publicada por ApolloRaines bajo la herramienta propietaria jBlaze. No se trata de un fine-tuning convencional: el autor aplica lo que denomina "cirugía de pesos" (weight surgery) para suprimir dos direcciones de comportamiento aprendidas, la de rechazo (refusal) y la de matización o cautela lingüística (hedging), sin ningún entrenamiento por gradientes. El resultado es un modelo que responde de forma directa, sin coletillas del tipo "como modelo de lenguaje" ni advertencias previas.

El modelo conserva la arquitectura original LlamaForCausalLM de Meta, con 32 capas y 8.030.261.248 parámetros en precisión bf16, y mantiene la ventana de contexto de 128.000 tokens del modelo base. Su relevancia es fundamentalmente investigadora: demuestra que ciertas disposiciones conductuales pueden localizarse como direcciones en el espacio de pesos y modificarse a posteriori, un enfoque alineado con la literatura de representation engineering y con las técnicas de abliteration.

El autor advierte explícitamente que los modelos publicados están deliberadamente rebajados de intensidad y deben considerarse demostraciones de concepto, no productos finales. La model card incluye ejemplos de salida que ilustran el efecto, incluido un ejemplo de instrucciones para forzar cerraduras que evidencia la eliminación de barreras de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1 8B Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.1 8B Instruct original: transformer decoder-only denso con 32 capas, atención con RoPE y tokenizador BPE de Llama 3. No hay cambios estructurales, ni mezcla de expertos, ni mecanismos híbridos. El modelo se distribuye en bf16 y el repositorio ocupa 16,1 GB.

El entrenamiento es inexistente en el sentido habitual. Según la model card, jBlaze identifica una dirección conductual en el espacio de activaciones o pesos y la ablaciona mediante intervención directa sobre los pesos, sin retropropagación ni dataset de ajuste. En esta variante se suprimen dos direcciones: refusal y hedging. El autor enmarca la técnica como representación de comportamiento aprendido codificado como direcciones, modificable después del entrenamiento. No se documentan datos de entrenamiento, número de tokens, composición del corpus ni etapas de RLHF o DPO adicionales; todo ello procede del modelo base de Meta y no se detalla en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.1 8B Instruct.
- Respuestas directas sin fórmulas de cautela, descargos de responsabilidad ni matizaciones condicionales.
- Razonamiento aritmético básico y explicación de pasos intermedios (el ejemplo de la model card resuelve 17 × 23 = 391).
- Generación de código en Python y explicación del código producido.
- Supresión de rechazos ante peticiones que el modelo base declinaría.
- Soporte de plantilla de chat mediante `apply_chat_template` con roles user/assistant.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Tool calling y function calling: no documentados en la información disponible; el modelo base los soporta, pero no se verifica que la edición los preserve.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en interpretabilidad y representation engineering: el modelo sirve como caso controlado para estudiar cómo una edición direccional en pesos afecta a la distribución de salidas frente al modelo base sin editar.
- Evaluación de robustez de filtros de seguridad: permite comprobar si los clasificadores de salida y las capas de moderación externas detectan respuestas sin matización, útil para diseñar defensas en pipelines de producción.
- Generación de texto técnico conciso: en tareas donde las coletillas y advertencias son ruido (por ejemplo, resúmenes de documentación interna), el estilo directo reduce tokens generados y facilita el post-procesado.
- Experimentos de ablación comparada: ejecutar el mismo prompt contra el modelo base y esta variante para cuantificar el delta de comportamiento en refusal rate y longitud de respuesta.
- Docencia y divulgación sobre alineación: ilustrar de forma tangible qué es una dirección de comportamiento y cómo se puede manipular, con un modelo de 8B que cabe en hardware de consumo.
- Prototipado de asistentes de código en entornos controlados: para tareas de generación de funciones y explicación, siempre con revisión humana y sin exposición a usuarios finales sin moderación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de refusal rate, y el autor declara "Known Issues: None observed" sin aportar mediciones.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para contexto moderado.
- VRAM en cuantización de 8 bits: alrededor de 9-10 GB; en 4 bits, alrededor de 5-6 GB (estimaciones para la arquitectura Llama 3.1 8B, no verificadas para esta variante concreta).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue concurrente; RTX 4090 (24 GB) para bf16 en un solo usuario; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantización 4 bits, siempre que se generen pesos GGUF a partir de los safetensors, ya que el repositorio no los incluye.
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM y TGI para servir en bf16; llama.cpp u Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Edición de comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-Abliterated-No-Hedging | 8,0B | 128k (heredado) | Sí (refusal y hedging suprimidos) | llama3.1 | Hugging Face, 386 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,0B | 128k | No | llama3.1 | Hugging Face, ampliamente adoptado |
| Variantes abliterated de Llama 3 8B (comunidad) | 8,0B | 8k-128k según base | Sí (típicamente solo refusal) | llama3 / llama3.1 | Hugging Face, múltiples autores |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32k | No | Apache 2.0 | Hugging Face |

La diferencia principal frente al modelo base no es de rendimiento bruto sino de distribución conductual: esta variante elimina refusal y hedging, mientras que el original mantiene ambos. Frente a otras variantes abliterated de la comunidad, esta añade la supresión de hedging y documenta el método (jBlaze), aunque sin publicar métricas comparativas ni el código de la herramienta.

## Limitaciones y advertencias

- Eliminación deliberada de barreras de seguridad: el propio ejemplo de la model card muestra instrucciones paso a paso para forzar cerraduras, lo que indica que el modelo puede asistir en actividades ilícitas o peligrosas.
- Riesgo elevado de daño en producción: no debe exponerse a usuarios finales sin capas externas de moderación de entrada y salida.
- Alucinación: la supresión de hedging elimina las fórmulas de incertidumbre, lo que puede hacer que afirmaciones erróneas se presenten con la misma confianza que las correctas, agravando el riesgo de desinformación.
- Idiomas: solo se declara inglés; el comportamiento en castellano no está evaluado y podría degradarse respecto al modelo base.
- Sesgos: no se documenta ninguna evaluación de sesgos; al no haber ajuste adicional, hereda los del Llama 3.1 8B Instruct, pero la eliminación de matizaciones puede amplificar su expresión.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de redistribución de Meta; requiere aceptar los términos y conservar los avisos de atribución.
- Naturaleza de demostración: el autor indica que los modelos publicados están rebajados de intensidad y no representan la capacidad completa de jBlaze, por lo que los resultados no son extrapolables al producto.
- Reproducibilidad: jBlaze es propietario y no se publica el método ni los scripts, lo que impide verificar o reproducir la edición.
- Estado del repositorio: 0 likes y 386 descargas en el momento de la consulta; sin validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-No-Hedging
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Herramienta jBlaze: https://jblaze.dev
