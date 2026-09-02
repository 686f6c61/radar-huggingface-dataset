# mradermacher/arcane-13b-i1-GGUF

## Resumen

El modelo `mradermacher/arcane-13b-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `ar3xop/arcane-13b`, un transformer de 13 015 864 320 parámetros (~13B) especializado en salud mental, análisis de crisis y detección de angustia. La cuantización ha sido realizada por mradermacher, un desarrollador conocido por publicar versiones GGUF de numerosos modelos open source, y está pensada para facilitar la ejecución local en hardware de consumo mediante herramientas como llama.cpp u Ollama.

El modelo base se distribuye bajo licencia Llama 2 y está entrenado únicamente en inglés. La versión cuantizada mantiene la misma licencia y ofrece varios niveles de compresión (desde Q2_K hasta Q4_K_M) para adaptarse a distintos requisitos de VRAM y calidad. Aunque el repositorio no incluye documentación detallada sobre el entrenamiento o las capacidades exactas del modelo original, los metadatos indican que su propósito principal es el procesamiento de lenguaje natural aplicado a contextos de salud mental y detección de señales de crisis o angustia.

Al tratarse de una cuantización, esta ficha se centra en las características de los archivos GGUF publicados, no en el modelo original en formato safetensors. Los datos sobre arquitectura, entrenamiento y benchmarks del modelo base no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de 13B, sin más detalle) |
| Parametros totales | 13 015 864 320 (~13B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M (todos con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 |
| Formato de pesos | GGUF (con archivo de imatrix adicional) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `ar3xop/arcane-13b` (si es un transformer denso, si usa atención lineal, etc.) ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). Los únicos datos confirmados son el número total de parámetros (13 015 864 320) y que está implementado con la librería transformers.

La cuantización realizada por mradermacher utiliza el método imatrix (importance matrix), que asigna pesos de cuantización basados en la importancia de cada tensor para la perplejidad del modelo. Esto permite una mejor relación calidad-tamaño en comparación con cuantizaciones estáticas. El repositorio incluye un archivo de imatrix independiente para que los usuarios puedan generar sus propias cuantizaciones personalizadas.

## Capacidades

Según los metadatos del modelo, las capacidades declaradas son:

- Análisis de crisis: procesamiento de texto para identificar situaciones de crisis o emergencia.
- Detección de angustia: identificación de señales de malestar emocional o psicológico en texto.
- Salud mental: tareas de NLP relacionadas con el ámbito de la salud mental.
- Generación de texto en inglés: como modelo de lenguaje general, puede generar texto coherente en inglés, aunque su especialización declarada es el dominio de salud mental.

No se dispone de información sobre soporte de tool calling, capacidades de agente, razonamiento multi-paso, visión, audio u otras funcionalidades avanzadas. Tampoco se confirma si el modelo tiene un modo de pensamiento o razonamiento explícito.

## Casos de uso

Dado que la información disponible se limita a los metadatos y la model card, los casos de uso que se enumeran a continuación son aplicaciones potenciales basadas en la especialización declarada del modelo, no usos verificados por el autor:

- Análisis de mensajes en redes sociales: el modelo puede procesar publicaciones o comentarios para detectar indicios de angustia o crisis, ayudando a moderadores o servicios de prevención a priorizar intervenciones.
- Triaje en líneas de ayuda psicológica: integrado en un sistema de chat, puede clasificar la gravedad de los mensajes recibidos y derivar los casos más urgentes a personal humano.
- Monitorización de foros de salud mental: análisis automático de hilos de discusión para identificar patrones de riesgo o solicitudes de ayuda no atendidas.
- Asistencia en redacción de informes clínicos: apoyo a profesionales de la salud mental para resumir o estructurar notas de sesiones, siempre bajo supervisión humana.
- Chatbots de apoyo emocional: como base para un asistente conversacional que ofrezca respuestas empáticas y recursos de ayuda, con las debidas salvaguardas.
- Investigación académica en NLP aplicado a psicología: análisis de corpus de texto para estudiar marcadores lingüísticos de depresión, ansiedad u otros trastornos.

Es importante señalar que estos casos son hipotéticos y requieren validación con el modelo original, ya que no se han publicado evaluaciones específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para el modelo base `ar3xop/arcane-13b` ni para esta cuantización.

## Requisitos de hardware

Los tamaños de los archivos GGUF proporcionados permiten estimar los requisitos de VRAM para inferencia local:

- i1-Q2_K: 5,0 GB → requiere al menos 6 GB de VRAM (p. ej., RTX 3060 12GB, RTX 4060 8GB)
- i1-IQ3_XXS: 5,1 GB → similar al anterior
- i1-IQ3_M: 6,1 GB → requiere al menos 8 GB de VRAM
- i1-Q3_K_M: 6,4 GB → requiere al menos 8 GB de VRAM
- i1-IQ4_NL: 7,5 GB → requiere al menos 10 GB de VRAM
- i1-Q4_K_S: 7,5 GB → requiere al menos 10 GB de VRAM
- i1-Q4_K_M: 8,0 GB → requiere al menos 10-12 GB de VRAM (p. ej., RTX 3080 10GB, RTX 4070 12GB)

Estas estimaciones son orientativas y dependen del tamaño del contexto y del sistema operativo. Para ejecución en CPU, se necesitarían al menos 16 GB de RAM para los quants más grandes.

Opciones de despliegue compatibles con GGUF: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores como llama-cpp-python o llamafile. No se menciona compatibilidad con vLLM o TGI en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (salud mental, 13B, GGUF). No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés, lo que limita su uso en entornos hispanohablantes sin un paso previo de traducción.
- Licencia llama2: aunque permite uso comercial, la licencia Llama 2 impone restricciones para empresas con más de 700 millones de usuarios mensuales. Es necesario revisar los términos completos antes de un despliegue en producción.
- Especialización en salud mental: el modelo está diseñado para análisis de crisis y detección de angustia, pero no hay evidencia publicada de su precisión clínica. No debe utilizarse como herramienta de diagnóstico ni sustituir el criterio profesional.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inexacto, especialmente en dominios sensibles como la salud mental.
- Sesgos potenciales: al estar entrenado con datos en inglés y probablemente con corpus de redes sociales, puede reflejar sesgos culturales o demográficos que afecten a la detección de señales de angustia en poblaciones diversas.
- Sin benchmarks publicados: no se puede evaluar su rendimiento real frente a otros modelos, lo que dificulta su adopción en entornos donde se requiera validación objetiva.
- Fecha de creación futura: el repositorio indica una fecha de creación de septiembre de 2026, lo que sugiere que la información puede ser experimental o no verificada.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/arcane-13b-i1-GGUF
- Modelo base original: https://huggingface.co/ar3xop/arcane-13b
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
