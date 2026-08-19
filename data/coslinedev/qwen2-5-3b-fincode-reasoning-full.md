# coslinedev/Qwen2.5-3B-FinCode-Reasoning-Full

## Resumen

FinCode-Reasoning-3B es un modelo de lenguaje experimental desarrollado por coslinedev, obtenido mediante fine-tuning supervisado (SFT) sobre Qwen/Qwen2.5-3B-Instruct con la librería Unsloth. El modelo está especializado en generar código Python ejecutable para modelado financiero cuantitativo: calendarios de depreciación, valoración de opciones, coste medio ponderado de capital (WACC), límites de tax shield y modelos de flujos de caja descontados (DCF).

La propuesta central del proyecto es delegar la aritmética exacta a un sandbox de ejecución Python aislado: el modelo genera la lógica del código y el intérprete se encarga de los cálculos numéricos, eliminando así las alucinaciones aritméticas típicas de los LLM. Con 3.085 millones de parámetros y arquitectura transformer densa decoder-only, el modelo está pensado para ejecutarse en GPUs de gama baja como la T4 de Google Colab, requiriendo entre 6 y 8 GB de VRAM en precisión float16.

La relevancia actual del modelo radica en su enfoque híbrido código-ejecución, que combina la flexibilidad del lenguaje natural con la precisión garantizada de un intérprete. Su licencia Apache 2.0 permite uso comercial sin restricciones, alineada con la del modelo base Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen2.5) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | float16 documentado; otras cuantizaciones no publicadas |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos completos fusionados, 2 shards) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer denso decoder-only con 3.085 millones de parámetros, entrenado originalmente por Alibaba Cloud sobre 18 billones de tokens. El fine-tuning se realizó con Unsloth sobre un conjunto de tareas sintéticas de modelado financiero cuantitativo, generando código Python con manejo explícito de restricciones de negocio (por ejemplo, depreciación = min(valor_contable * tasa_ddb, max(valor_contable - valor_residual, 0.0))).

La innovación principal no está en la arquitectura, sino en el paradigma de uso: el modelo está entrenado para emitir código Python limpio y ejecutable, y la salida numérica se delega al intérprete en un sandbox aislado. De este modo, el modelo nunca produce resultados aritméticos directos, sino la lógica que los calcula, lo que elimina las alucinaciones de cálculo mental típicas de los LLM. El entrenamiento también refuerza la generación de sintaxis válida y el manejo de casos límite contables.

## Capacidades

- Generación de código Python ejecutable para modelado financiero cuantitativo: depreciación DDB, valoración Black-Scholes, WACC, DCF y límites de tax shield.
- Manejo explícito de restricciones de negocio y límites contables dentro de la lógica generada.
- Razonamiento estructurado multi-paso: descompone problemas financieros complejos en funciones Python modulares.
- Alta tasa de sintaxis válida en el código generado (99,5 % en la evaluación del autor).
- Seguimiento de instrucciones de sistema detalladas para alinear el formato de salida.
- Capacidades conversacionales heredadas de Qwen2.5-3B-Instruct (template Jinja incluida).
- Sin capacidades de vision, audio ni tool calling nativo; la interacción con herramientas se realiza mediante generación de código ejecutado externamente.
- Multilingüe limitado: entrenado y evaluado únicamente en inglés.

## Casos de uso

- Automatización de informes contables: el modelo genera funciones Python que calculan calendarios de depreciación (DDB, lineal, suma de dígitos) con restricciones de valor residual, listas para integrarse en scripts de generación de informes periódicos.
- Valoración de opciones financieras: genera implementaciones de Black-Scholes y otros modelos de valoración que pueden ejecutarse en sandbox para obtener precios teóricos sin riesgo de error aritmético.
- Cálculo de estructura de capital: produce código para estimar el WACC a partir de datos de entrada, incluyendo comprobaciones de rangos válidos para cada componente (coste de deuda, coste de capital, pesos de financiación).
- Modelos de flujos de caja descontados (DCF): genera scripts que proyectan flujos de caja, aplican tasas de descuento y calculan valor presente neto con manejo de múltiples escenarios.
- Verificación de límites fiscales: genera código que comprueba límites de deducción de intereses o tax shields, integrable en pipelines de compliance automatizado.
- Prototipado rápido de análisis cuantitativo: analistas describen en lenguaje natural un cálculo financiero y obtienen código Python verificado sintácticamente, reduciendo el tiempo de desarrollo.
- Educación en finanzas cuantitativas: estudiantes pueden generar ejemplos de código correctos y explicables sobre conceptos como valor temporal del dinero o valoración de bonos.
- Integración en pipelines CI/CD de análisis financiero: el código generado puede validarse y ejecutarse en entornos de test automatizados, garantizando cálculos de producción reproducibles.

## Benchmarks y rendimiento

El autor publicó una evaluación preliminar sobre 100 tareas sintéticas de modelado financiero cuantitativo (calendarios DDB, valoración Black-Scholes, cálculo WACC, límites de tax shield y modelos DCF). Ambos modelos se evaluaron bajo las mismas condiciones: el código de salida se ejecutó en un sandbox Python aislado para verificar ejecución y corrección matemática.

| Modelo | Configuracion | Tasa de exito de codigo (Pass@1) | Tasa de sintaxis valida | Latencia media de generacion |
|---|---|---|---|---|
| FinCode-Reasoning-3B | Local + sandbox Python | 98,0 % | 99,5 % | 0,85 s |
| Qwen2.5-3B-Instruct (base) | Local + sandbox Python | 82,0 % | 85,0 % | 0,82 s |

La latencia se midió en una GPU T4 gratuita de Google Colab en precisión float16, sin incluir el tiempo de ejecución del sandbox. El autor advierte que las tareas de evaluación comparten lógica paramétrica con el conjunto de entrenamiento, por lo que los resultados pueden sobreestimar el rendimiento en datos no vistos. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: entre 6 y 8 GB en precisión float16, según el autor.
- GPU recomendadas: NVIDIA T4 (funciona en el nivel gratuito de Google Colab), RTX 3060/4060 (12 GB), RTX 3090, A10, A100.
- Compatible con GPUs de consumo: sí, cualquier GPU con 8 GB o más de VRAM puede ejecutar el modelo en float16.
- Opciones de despliegue: transformers de Hugging Face (inferencia local o Colab), compatible con text-generation-inference (TGI) y endpoints de FriendliAI. No se han publicado archivos GGUF para llama.cpp u Ollama.
- Latencia: 0,85 s por generación de hasta 1024 tokens en T4 (float16), según la evaluación del autor.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| FinCode-Reasoning-3B | 3,09 B | 32.768 | Codigo Python financiero | Apache 2.0 | safetensors |
| Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 | Chat general y codigo | Apache 2.0 | safetensors, GGUF |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 | Razonamiento general | MIT | safetensors, GGUF |

La comparación directa con el modelo base muestra una mejora de 16 puntos porcentuales en tasa de éxito de código (98 % frente a 82 %) en tareas financieras. Phi-3.5-mini-instruct es una alternativa generalista de tamaño similar con contexto mucho mayor, pero sin especialización financiera y sin datos de comparación publicados en estas tareas. No se dispone de comparativas con otros modelos especializados en finanzas del mismo rango de parámetros.

## Limitaciones y advertencias

- Evaluación limitada: los benchmarks se basan en solo 100 tareas sintéticas, con un margen de error estadístico estimado de ±4 %.
- Riesgo de sobreajuste: las tareas de evaluación comparten lógica paramétrica con el conjunto de entrenamiento; el rendimiento en datos financieros reales no validados puede ser inferior.
- Dependencia de sandbox: el modelo solo genera lógica de código; la ejecución matemática garantizada requiere un entorno Python aislado activo. Sin sandbox, el modelo no proporciona resultados numéricos directos.
- Idioma limitado: entrenado y evaluado únicamente en inglés; su uso en español u otros idiomas no está validado.
- Alucinación de código: aunque la tasa de sintaxis válida es alta, el modelo puede generar código lógicamente incorrecto o incompleto en casos fuera de su distribución de entrenamiento; se recomienda revisión humana antes de usar en producción.
- Modelo experimental: es una iniciativa de investigación open source de coslinedev, sin garantías de mantenimiento ni soporte comercial.
- Contexto limitado a 32K tokens: suficiente para la mayoría de tareas financieras, pero insuficiente para análisis de documentos extensos como informes anuales completos.

## Enlaces

- Repositorio Hugging Face (pesos completos): https://huggingface.co/coslinedev/Qwen2.5-3B-FinCode-Reasoning-Full
- Repositorio Hugging Face (versión LoRA): https://huggingface.co/coslinedev/Qwen2.5-3B-FinCode-Reasoning
- Página en FriendliAI: https://friendli.ai/models/coslinedev/Qwen2.5-3B-FinCode-Reasoning-Full
- Página en LLM Explorer: https://llm-explorer.com/model/coslinedev%2FQwen2.5-3B-FinCode-Reasoning-Full,2hKYZ3SLFIeS2LTAIHnGsN
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
