# batiai/LFM2.5-8B-A1B-GGUF

## Resumen

LFM2.5-8B-A1B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Liquid AI, publicado en mayo de 2026. Su característica principal es su arquitectura híbrida que combina capas de convolución LIV (Liquid Intelligence Vector) con atención GQA, lo que permite obtener calidad de modelo de 8.000 millones de parámetros con solo 1.500 millones de parámetros activos por token. Esto lo hace especialmente adecuado para ejecución en dispositivos de borde, como Macs con Apple Silicon o equipos con APUs de AMD.

La versión cuantizada en GGUF, publicada por BatiAI, ofrece seis niveles de cuantización que van desde Q2_K_S (2,8 GB) hasta Q6_K (6,5 GB), con soporte nativo para Ollama y verificación de tool calling. El modelo cuenta con una ventana de contexto de 131.072 tokens, ha sido entrenado con 38 billones de tokens y soporta cuatro idiomas principales: inglés, coreano, japonés y chino. Su licencia, LFM Open License v1.0, permite uso comercial gratuito para organizaciones con ingresos anuales inferiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_moe híbrida: 18 capas LIV convolution + 6 capas GQA attention, 32 expertos con 4 activos |
| Parametros totales | 8.467.856.832 (8,3B) |
| Parametros activos | 1,5B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q2_K_S, IQ3_XXS, Q3_K_M, IQ4_XS, Q4_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | en, ko, ja, zh |
| Licencia | LFM Open License v1.0 (Apache-2.0 basada; uso comercial gratuito bajo 10M USD de ingresos anuales) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE híbrida con 24 capas en total: 18 capas de convolución LIV (una innovación de Liquid AI basada en sistemas dinámicos) y 6 capas de atención GQA (Grouped Query Attention). Cada token activa 4 de los 32 expertos disponibles, lo que reduce drásticamente el coste computacional por token sin sacrificar capacidad de representación. Esta combinación está diseñada específicamente para inferencia eficiente en hardware de borde, priorizando el ancho de banda de memoria sobre la potencia bruta de cómputo.

El entrenamiento utilizó un presupuesto de 38 billones de tokens, con un vocabulario de 128.000 entradas que mejora la tokenización de idiomas no latinos, especialmente el coreano. El modelo incorpora razonamiento explícito mediante chain-of-thought antes de generar la respuesta final, y soporta tool calling nativo mediante marcadores especiales (`<|tool_call_start|>` y `<|tool_call_end|>`), tanto en formato Pythonic como JSON. No se dispone de información detallada sobre el uso de RLHF o DPO en el proceso de entrenamiento.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo produce cadenas de pensamiento internas antes de emitir la respuesta final, lo que mejora la precisión en tareas de lógica y matemáticas.
- Tool calling nativo: soporta llamadas a funciones en formato Pythonic o JSON, con marcadores especiales para delimitar las invocaciones.
- Razonamiento multi-paso: gracias a su modo de razonamiento, puede encadenar varios pasos de inferencia antes de concluir.
- Multilingüismo: soporta inglés, coreano, japonés y chino con tokenización optimizada para caracteres no latinos.
- Eficiencia en dispositivos de borde: con solo 1,5B parámetros activos, mantiene alto throughput incluso en hardware con memoria limitada.
- Compatibilidad con ecosistema llama.cpp y Ollama: puede ejecutarse en CPU, Apple Silicon y GPUs NVIDIA mediante los motores estándar de la comunidad.

## Casos de uso

- Automatización de flujos de trabajo en Mac: gracias a su bajo uso de memoria y alta velocidad de generación, es ideal para aplicaciones de automatización local como BatiFlow, donde se ejecuta en segundo plano sin consumir recursos excesivos.
- Asistente de programación en local: su soporte de tool calling permite integrarlo en entornos de desarrollo para generar código, ejecutar comandos y gestionar tareas de CI/CD sin enviar datos a la nube.
- Traducción y procesamiento de texto en coreano, japonés y chino: su vocabulario de 128K entradas y su entrenamiento multilingüe lo hacen adecuado para aplicaciones de traducción automática y análisis de sentimiento en estos idiomas.
- Chatbot de atención al cliente con contexto largo: la ventana de 131K tokens permite mantener conversaciones extensas con historial completo, útil para soporte técnico en entornos empresariales.
- Razonamiento y análisis de documentos: su modo de razonamiento explícito permite resumir, extraer conclusiones y responder preguntas complejas sobre documentos largos, como contratos o informes.
- Despliegue en dispositivos con 8 GB de RAM: las cuantizaciones Q2_K_S, IQ3_XXS y Q3_K_M están diseñadas para equipos con memoria limitada, permitiendo ejecutar un modelo de 8B en portátiles antiguos o mini PCs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones están pendientes de ejecución en hardware Mac de referencia mediante un script de benchmark. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada: entre 2,8 GB (Q2_K_S) y 6,5 GB (Q6_K) para el archivo de pesos. La memoria total necesaria depende del contexto y del sistema operativo.
- GPU recomendadas: Apple Silicon (M4, M5 Max), APUs AMD Ryzen AI Max+ 395, y GPUs NVIDIA con soporte CUDA. El modelo está optimizado para ancho de banda de memoria, no para cómputo paralelo intensivo.
- Compatibilidad con hardware consumer: sí, cabe en Macs de 8 GB con cuantizaciones bajas (Q2_K_S, IQ3_XXS, Q3_K_M) y en Macs de 16 GB con Q4_K_M o Q6_K.
- Rendimiento reportado por Liquid AI: 253 tokens/s en M5 Max y 146 tokens/s en Ryzen AI Max+ 395, con uso de memoria inferior a 6 GB.
- Opciones de despliegue: llama.cpp, Ollama (comando `ollama pull batiai/lfm2.5-8b:q4`), y cualquier motor compatible con GGUF (vLLM, LM Studio, etc.).
- Nota sobre Mac: en Apple Silicon, la cuantización Q3_K_M puede generar tokens más lentamente que Q4_K_M debido a limitaciones de dequantización en Metal. Si Q4_K_M cabe en memoria, se recomienda usarla.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con modelos de tamaño similar (como Qwen3-8B, Llama 3.1 8B o Gemma 3 8B) en términos de benchmarks. Sin embargo, la propuesta de valor principal frente a estos modelos es su arquitectura MoE con solo 1,5B parámetros activos, que ofrece velocidad de inferencia típica de modelos pequeños con calidad de modelos de 8B. La licencia LFM Open License v1.0 es más permisiva que la de Llama (que requiere aprobación para más de 700M usuarios mensuales) pero incluye una restricción de ingresos de 10M USD. No se dispone de datos objetivos de comparación de rendimiento.

## Limitaciones y advertencias

- Licencia restrictiva para grandes empresas: organizaciones con ingresos anuales superiores a 10 millones de dólares deben contactar con Liquid AI para obtener una licencia comercial, lo que puede ser un obstáculo para adopción empresarial.
- Idiomas limitados: solo soporta cuatro idiomas (en, ko, ja, zh). No hay soporte para español, francés, alemán u otros idiomas europeos, lo que limita su uso en entornos hispanohablantes.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo si el contexto no es suficiente.
- Sesgos potenciales: no se han publicado evaluaciones de sesgos ni de seguridad; el entrenamiento con 38T tokens puede haber introducido sesgos culturales o lingüísticos no documentados.
- Sin benchmarks verificados: la ausencia de resultados de evaluación pública impide comparar objetivamente su rendimiento con otros modelos.
- Contexto largo pero con coste de memoria: aunque soporta 131K tokens, el uso de contextos muy largos incrementa el consumo de memoria y puede degradar la velocidad en hardware de gama baja.
- Cuantizaciones muy agresivas: Q2_K_S e IQ3_XXS pueden degradar notablemente la calidad de generación y la precisión del razonamiento; se recomienda usar Q4_K_M o superior cuando sea posible.

## Enlaces

- Repositorio GGUF de BatiAI: https://huggingface.co/batiai/LFM2.5-8B-A1B-GGUF
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-license
- BatiFlow (aplicación macOS): https://flow.bati.ai
- Página de Ollama del modelo: https://ollama.com/batiai/lfm2.5-8b
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
