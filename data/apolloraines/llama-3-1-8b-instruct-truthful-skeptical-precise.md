# ApolloRaines/Llama-3.1-8B-Instruct-Truthful-Skeptical-Precise

## Resumen

Llama-3.1-8B-Instruct-Truthful-Skeptical-Precise es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada por ApolloRaines mediante la herramienta propietaria jBlaze. jBlaze aplica una técnica denominada "cirugía conductual" (behavioral surgery) que altera directamente los pesos del modelo para amplificar o suprimir comportamientos específicos, sin necesidad de fine-tuning ni entrenamiento adicional. En este caso, se amplifican tres direcciones: veracidad (truthful), escepticismo (skepticism) y precisión numérica (precision).

El modelo mantiene la arquitectura original de Llama 3.1 (transformer decoder con 8.030 millones de parámetros) y se distribuye en formato safetensors con precisión bf16. Está pensado para tareas de generación de texto donde se prioriza la exactitud factual, la cautela epistémica y el cálculo numérico fiable. Aunque no se han publicado benchmarks formales, los ejemplos de salida incluidos en la model card muestran respuestas que desglosan operaciones aritméticas paso a paso y rechazan afirmaciones pseudocientíficas.

La relevancia de este modelo radica en su enfoque de modificación de pesos sin reentrenamiento, una alternativa ligera a los métodos tradicionales de alineación. Sin embargo, al ser una variante experimental con cero descargas y cero likes en el momento de su publicación, su adopción en producción requiere validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder, 32 capas) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Llama-3.1-8B-Instruct soporta 128K, pero no se especifica para esta variante) |
| Tipos de cuantizacion | No especificados (pesos originales en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos de meta-llama/Llama-3.1-8B-Instruct, un transformer decoder con atención por consultas agrupadas (GQA) y 32 capas, entrenado por Meta sobre aproximadamente 15 billones de tokens con un corte de conocimiento en diciembre de 2023. La variante de ApolloRaines no ha sido sometida a fine-tuning; en su lugar, se ha utilizado jBlaze, una herramienta que identifica direcciones en el espacio de activaciones asociadas a comportamientos concretos y las amplifica o atenúa directamente en los pesos. En este caso se amplifican tres direcciones: veracidad, escepticismo y precisión.

Al no haber reentrenamiento, el modelo conserva las capacidades generales del base (razonamiento, código, matemáticas, diálogo) pero con una modulación conductual que busca reducir respuestas falsas o excesivamente confiadas. La técnica es similar a la abliteración (abliteration), aunque jBlaze se describe como una herramienta propietaria más general. No se han publicado detalles sobre el dataset de validación ni sobre la metodología exacta de extracción de direcciones.

## Capacidades

- Generación de texto instructivo y conversacional en inglés, con énfasis en respuestas factualmente precisas.
- Razonamiento aritmético y numérico mejorado: los ejemplos muestran desglose paso a paso de multiplicaciones y operaciones.
- Escepticismo ante afirmaciones sin evidencia: rechaza teorías conspirativas y pseudociencia (p. ej., la Tierra plana).
- Negativa a proporcionar información peligrosa o ilegal (p. ej., cómo forzar una cerradura).
- Capacidades heredadas del modelo base: generación de código, resolución de problemas, diálogo multi-turno y soporte de tool calling (no verificado en esta variante).
- Precisión en respuestas factuales: tiende a matizar o indicar incertidumbre cuando corresponde.

## Casos de uso

- Verificación de hechos y asistencia en investigación: el modelo puede contrastar afirmaciones y señalar falta de evidencia, útil para periodistas o analistas que necesitan respuestas cautelosas.
- Tutoría en matemáticas y ciencias: su desglose paso a paso de operaciones aritméticas lo hace adecuado para explicar procedimientos a estudiantes.
- Generación de código con comentarios precisos: hereda la capacidad de programación de Llama 3.1, y la amplificación de precisión puede reducir errores en cálculos dentro del código.
- Atención al cliente con respuestas prudentes: en escenarios donde una respuesta incorrecta podría tener consecuencias legales o de reputación, el escepticismo ayuda a evitar afirmaciones sin base.
- Filtrado de contenido en foros o redes sociales: puede identificar y rechazar desinformación o teorías conspirativas antes de que se publiquen.
- Asistencia en redacción técnica: su tendencia a ser preciso y evitar afirmaciones vagas es valiosa para documentación de software o informes técnicos.
- Evaluación de riesgos en entornos empresariales: al ser escéptico ante datos no verificados, puede ayudar a detectar inconsistencias en informes financieros o de mercado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y no se han encontrado evaluaciones independientes. Cualquier afirmación sobre rendimiento comparativo debe considerarse especulativa hasta que se realicen pruebas formales.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (16,1 GB en disco), se necesitan al menos 16 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits, ~8 GB; a 4 bits, ~4-5 GB.
- GPU recomendadas: para bf16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente. Para cuantización 4 bits, una RTX 3060 (12 GB) o superior puede funcionar.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantización GGUF o AWQ. En bf16, solo tarjetas con 16 GB o más.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers (como se muestra en el ejemplo de uso).
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 8B en una GPU moderna, se espera una generación de 20-50 tokens por segundo con cuantización 4 bits, y menor con bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8,03 B | 128K | Llama 3.1 Community | Instructivo general, multilingüe |
| Llama-3.1-8B-Instruct-Truthful-Skeptical-Precise | 8,03 B | No disponible | Llama 3.1 Community | Modificación conductual (veracidad, escepticismo, precisión) |
| Mistral-7B-Instruct-v0.3 | 7,24 B | 32K | Apache 2.0 | Instructivo general, multilingüe |
| Gemma-2-9B-it | 9,24 B | 8K | Gemma License | Instructivo general, multilingüe |

La comparativa se basa en características generales; no hay datos de rendimiento para la variante modificada. El modelo base Llama 3.1 es el punto de referencia natural, ya que esta variante hereda sus capacidades y solo altera el comportamiento en tres dimensiones.

## Limitaciones y advertencias

- Solo se declara soporte para inglés; el uso en otros idiomas puede degradar la calidad de las respuestas.
- La modificación de pesos mediante jBlaze no ha sido validada externamente; no hay garantía de que la amplificación de veracidad y escepticismo funcione consistentemente en todos los dominios.
- Riesgo de alucinación residual: aunque se busca reducirla, el modelo puede seguir generando información falsa, especialmente en temas poco representados en sus datos de entrenamiento.
- La licencia Llama 3.1 Community permite uso comercial, pero impone restricciones (p. ej., no usar para mejorar otros modelos grandes sin autorización) y requiere atribución.
- No se han publicado evaluaciones de sesgos; el modelo puede heredar sesgos del base Llama 3.1.
- Al ser una variante experimental con cero descargas, no hay comunidad ni soporte; cualquier problema debe resolverse de forma autónoma.
- La fecha de creación (agosto de 2026) es posterior al corte de conocimiento del base (diciembre de 2023), por lo que no incorpora información más reciente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Truthful-Skeptical-Precise
- Herramienta jBlaze: https://jblaze.dev
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Otras variantes de ApolloRaines: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Jbliterated y https://huggingface.co/ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated
