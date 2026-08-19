# Adzpro/Financial_v6

## Resumen

Adzpro/Financial_v6 es un modelo de lenguaje multimodal de 4.326 millones de parámetros, publicado en formato GGUF y basado en la arquitectura Qwen3.5-4B. Ha sido afinado y convertido mediante la librería Unsloth, lo que facilita su ejecución en entornos de inferencia local con llama.cpp u otras herramientas compatibles con GGUF. El repositorio incluye un archivo de proyección multimodal (F16-mmproj), lo que indica que el modelo es capaz de procesar tanto texto como imágenes, una característica especialmente útil para tareas relacionadas con el ámbito financiero, como el análisis de documentos, facturas o gráficos.

El modelo destaca por su tamaño compacto (4.3B parámetros), lo que lo hace adecuado para despliegues en hardware de consumo con recursos limitados. Sin embargo, la información pública es muy escasa: no se especifica la licencia, los idiomas soportados, el contexto máximo ni los datos de entrenamiento. A pesar de ello, su naturaleza multimodal y su enfoque financiero lo convierten en una opción interesante para prototipos y aplicaciones de nicho donde se requiera comprensión de imágenes y texto en un mismo flujo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (presumiblemente basada en Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 (4.3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal), F16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles oficiales sobre la arquitectura interna del modelo. Por el nombre y la referencia a Qwen3.5, se presume que se trata de un transformer decoder-only con mecanismo de atención estándar, similar a la familia Qwen. La presencia de un archivo `F16-mmproj.gguf` confirma que el modelo incorpora un componente de visión (vision-language model), probablemente mediante un proyector que alinea características de imagen con el espacio de texto.

El entrenamiento consistió en un fine-tuning sobre el modelo base Qwen3.5-4B, realizado con la librería Unsloth, que optimiza la velocidad de entrenamiento. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá de la conversión a GGUF.

## Capacidades

- Procesamiento multimodal: puede recibir tanto texto como imágenes como entrada, lo que permite tareas de visión y lenguaje combinadas.
- Generación de texto: es capaz de producir respuestas coherentes en lenguaje natural, aunque su especialización en finanzas no está confirmada por benchmarks.
- Razonamiento básico: al ser un modelo de 4.3B, puede manejar tareas de razonamiento simple, pero con limitaciones frente a modelos más grandes.
- No se menciona soporte explícito para tool calling, function calling ni capacidades de agente.
- No se indica soporte para modos de pensamiento extendido (thinking mode) ni audio.

## Casos de uso

- Análisis de documentos financieros: el modelo puede extraer y resumir información relevante de facturas, extractos bancarios o informes anuales escaneados, combinando OCR visual con comprensión textual.
- Clasificación de imágenes de recibos o tickets: al ser multimodal, puede interpretar imágenes de compras y categorizar gastos automáticamente en aplicaciones de contabilidad personal o empresarial.
- Atención al cliente en banca: integrado en un chatbot, puede responder consultas sobre productos financieros y, si se le proporciona una imagen de un estado de cuenta, explicar transacciones o detectar cargos inusuales.
- Asistente para inversores: puede analizar gráficos de cotizaciones o capturas de pantalla de plataformas de trading y proporcionar descripciones textuales de tendencias o patrones básicos.
- Accesibilidad: puede describir imágenes de gráficos o tablas a personas con discapacidad visual, convirtiendo información visual en texto legible.
- Prototipado rápido en entornos con recursos limitados: al ser un GGUF de 4.3B, puede ejecutarse en portátiles con GPU de gama media, permitiendo pruebas de concepto de aplicaciones multimodales sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- El archivo GGUF Q4_K_M del modelo principal ocupa aproximadamente 3.5 GB (tamaño del repositorio), por lo que se estima que la inferencia requiere entre 4 y 6 GB de VRAM, dependiendo del overhead del runtime y del proyector multimodal.
- Puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. También es viable en GPUs integradas con suficiente memoria compartida, aunque con menor rendimiento.
- Para el proyector multimodal F16, se necesita memoria adicional, pero al ser un componente pequeño, no debería superar 1 GB extra.
- Opciones de despliegue: llama.cpp (incluyendo `llama-cli` y `llama-mtmd-cli`), Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF como LM Studio o KoboldCpp.
- La latencia y el throughput dependen del hardware. En una RTX 3060, se puede esperar una generación de 20-40 tokens por segundo para un modelo de este tamaño, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

No hay suficiente información pública sobre este modelo para realizar una comparativa rigurosa. Se desconoce su contexto, licencia y rendimiento real. Como referencia, otros modelos GGUF de tamaño similar (por ejemplo, Qwen2.5-3B-Instruct o Llama-3.2-3B) suelen ofrecer contextos de 32k y 128k respectivamente, con licencias permisivas, pero no se puede afirmar que Financial_v6 comparta esas características.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial sin riesgo legal.
- Sin información sobre sesgos o alucinaciones: al ser un fine-tuning sin documentación, no se puede evaluar su fiabilidad en dominios críticos como el financiero.
- Tamaño reducido: con 4.3B parámetros, su capacidad de razonamiento complejo y manejo de contextos largos es limitada en comparación con modelos de 7B o superiores.
- Sin datos de entrenamiento: no se conoce el dataset utilizado, por lo que no se puede garantizar la calidad o la cobertura de dominios específicos.
- Riesgo de alucinación en tareas numéricas: los modelos pequeños tienden a cometer errores en cálculos y datos precisos, lo que es crítico en aplicaciones financieras.
- Contexto desconocido: no se especifica la longitud máxima de la ventana de contexto, lo que dificulta planificar su uso en conversaciones largas o documentos extensos.

## Enlaces

- [HuggingFace - Adzpro/Financial_v6](https://huggingface.co/Adzpro/Financial_v6)
