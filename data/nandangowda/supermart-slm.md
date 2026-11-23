# nandangowda/supermart-slm

## Resumen
SuperMart SLM es un modelo de lenguaje de 339,6 millones de parámetros entrenado desde cero (sin pesos preentrenados) por el desarrollador nandangowda, con la arquitectura Qwen3 como referencia. Está especializado en responder preguntas de analítica de ventas sobre un conjunto de datos de transacciones de supermercado de 2,6 millones de líneas, y se publica como parte de un proyecto académico (AIML-C Design Thinking).

El modelo emplea una arquitectura transformer decoder-only con 12 capas, dimensión oculta de 768 y FFN de 3072 con activación SwiGLU, atención grouped-query (12 cabezas de consulta y 6 de clave/valor) y un vocabulario BPE de Qwen3 de 151.936 tokens. Su ventana de contexto es muy reducida, de solo 512 tokens, y se distribuye tanto en formato safetensors (float32) como en GGUF Q8_0 para su uso con Ollama o llama.cpp.

Su relevancia es fundamentalmente didáctica y de nicho: demuestra el ciclo completo de construcción de un modelo pequeño desde cero (limpieza de datos, tokenizador, entrenamiento en tres etapas, evaluación y exportación) ejecutado en una única GPU de portátil (RTX 4050 con 6 GB de VRAM) en unas 7 horas. No es un modelo de propósito general: memoriza con precisión los hechos de su dominio, pero no generaliza a preguntas nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, layout Qwen3 |
| Parametros totales | 339.562.752 (339,6M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF, 367 MB); pesos safetensors en float32 |
| Idiomas soportados | inglés (en) |
| Licencia | other (licencia personalizada, ver repositorio) |
| Formato de pesos | safetensors (float32) y GGUF (Q8_0) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only con la disposición de capas de Qwen3: 12 capas, hidden de 768, FFN de 3072 con SwiGLU, 12 cabezas de consulta y 6 de clave/valor con dimensión de cabeza 64, QK-RMSNorm y RoPE con theta 10.000. El vocabulario es el tokenizador BPE de Qwen3 (151.936 tokens) y la embedding y la LM head están desacopladas (untied). La ventana de contexto es de 512 tokens.

El entrenamiento se realizó en tres etapas sobre una única RTX 4050 Laptop con 6 GB de VRAM, con AdamW de 8 bits, warm-up lineal con decaimiento coseno, autocast bf16 con pesos maestros en fp32 y gradient checkpointing, en unas 7 horas totales. La etapa A (preentrenamiento desde cero) usó 262.659 cestas de supermercado escritas como texto (corpus de 90M tokens), con 4.000 pasos (unos 33M tokens vistos) y pérdida de validación final de 0,529. La etapa B (preentrenamiento de dominio) usó 11 artículos de investigación minorista limpios, un glosario e insights de datos, con 800 pasos y pérdida de validación final de 6,635 (mejor 5,766). La etapa C (fine-tuning conversacional con plantilla ChatML y pérdida solo sobre las respuestas) usó 452 conversaciones de preguntas y respuestas y 223 hechos calculados a partir de los datos, con 800 pasos y pérdida de validación final de 2,871 (mejor 1,927).

## Capacidades
- Generación de texto y respuesta a preguntas de analítica minorista sobre el conjunto de datos SuperMart (ventas, productos, departamentos, descuentos, cestas, demografía de clientes, margen bruto, precios, métodos de pago e impuestos).
- Recuperación de hechos numéricos memorizados durante el fine-tuning: reproduce con alta fidelidad las cifras de las respuestas vistas en entrenamiento.
- Formato conversacional ChatML con rol de sistema predefinido y plantilla de chat incluida.
- Generación greedy reproducible (decodificación determinista recomendada en los ejemplos del autor).
- No dispone de soporte documentado de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés.

## Casos de uso
- Consultas de analítica interna sobre el conjunto de datos SuperMart: el modelo responde preguntas sobre ventas por departamento, franjas horarias o métodos de pago usando las cifras memorizadas durante el fine-tuning, adecuado para demostraciones y prototipos académicos.
- Docencia y demostración de entrenamiento desde cero: sirve como ejemplo reproducible de pipeline completo (tokenizador, preentrenamiento, fine-tuning y exportación a GGUF) en hardware de consumo.
- Despliegue local ligero con Ollama: el GGUF Q8_0 de 367 MB se importa con el Modelfile incluido y se ejecuta en portátiles sin GPU dedicada, útil para pruebas de concepto offline.
- Generación de respuestas de referencia en un chatbot de retail de ámbito cerrado: con contexto de 512 tokens encaja en diálogos cortos de una o dos interacciones sobre temas del dominio.
- Integración en cuadernos de análisis: el modelo puede invocarse desde Python con transformers para responder preguntas frecuentes predefinidas sobre el conjunto de datos dentro de un flujo de análisis exploratorio.
- Base para experimentos de investigación sobre memorización y generalización: sus métricas de recall (95,3 % en preguntas vistas frente a 4,8 % en no vistas) lo convierten en un caso de estudio controlado sobre sobreajuste en modelos pequeños.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad de validación etapa A (13.825 cestas reservadas) | 1,7 |
| Recall de hechos numéricos, preguntas vistas en entrenamiento (muestra de 50) | 95,3 % |
| Recall de hechos numéricos, preguntas nunca vistas (67 conversaciones reservadas) | 4,8 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el GGUF Q8_0 ocupa 367 MB en disco y requiere menos de 1 GB de VRAM o memoria del sistema; los pesos safetensors en float32 (unos 1,36 GB) requieren aproximadamente 1,5-2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el propio autor entrenó en una RTX 4050 Laptop de 6 GB. Para inferencia basta con una GTX 1650 o superior, o incluso CPU.
- Cabe en cualquier GPU consumer actual y en CPU mediante llama.cpp u Ollama.
- Opciones de despliegue: transformers (Qwen3ForCausalLM), llama.cpp, Ollama (Modelfile incluido). No hay soporte documentado para vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SuperMart SLM | 339,6M | 512 | other | Hugging Face (safetensors + GGUF) |
| Qwen3-0.6B | 0,6B | no disponible en la información | no disponible en la información | Hugging Face |
| SmolLM2-360M | 360M | no disponible en la información | no disponible en la información | Hugging Face |
| TinyLlama-1.1B | 1,1B | no disponible en la información | no disponible en la información | Hugging Face |

Los modelos alternativos se citan por tamaño comparable; no se dispone de datos de rendimiento comparables en la información proporcionada. SuperMart SLM se distingue por estar entrenado desde cero y especializado en un dominio cerrado, frente a los alternativos, que son modelos de propósito general preentrenados.

## Limitaciones y advertencias
- Fuerte sobreajuste al dominio: memoriza los hechos del fine-tuning (95,3 % de recall en preguntas vistas) pero apenas generaliza (4,8 % en preguntas no vistas) e inventa respuestas seguras pero incorrectas fuera de ellos.
- Contexto muy limitado (512 tokens), insuficiente para conversaciones largas o documentos extensos.
- Solo entrenado y evaluado en inglés; sin capacidades multilingües documentadas.
- Entrenado con datos sintéticos o derivados de un único conjunto de datos, con posible sesgo hacia la distribución de ese corpus.
- Riesgo elevado de alucinación en cifras y hechos no memorizados; no debe usarse para decisiones empresariales o financieras reales, según advierte el propio autor.
- Licencia "other": es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso; no apto para pipelines de producción que requieran estas capacidades.
- Modelo de proyecto académico con 428 descargas y sin validación externa; madurez y mantenimiento limitados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nandangowda/supermart-slm
- Conjunto de datos: https://huggingface.co/datasets/nandangowda/supermarket-sales-qa
- Repositorio de código: https://github.com/NandangowdaKY/SLM-on-supermarket
