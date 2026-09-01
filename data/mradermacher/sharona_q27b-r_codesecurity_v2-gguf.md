# mradermacher/Sharona_Q27B-R_CodeSecurity_v2-GGUF

## Resumen

Sharona_Q27B-R_CodeSecurity_v2-GGUF es la versión cuantizada en formato GGUF del modelo Sharona_Q27B-R_CodeSecurity_v2, desarrollado por ApolloRaines y cuantizado por mradermacher. Se trata de un modelo de generación de texto basado en la arquitectura qwen3_5_text, con aproximadamente 26,9 mil millones de parámetros, especializado en seguridad de código, revisión de código y detección de vulnerabilidades. El modelo original fue sometido a un proceso de edición de pesos (weight surgery) mediante el pipeline jBlaze, que elimina comportamientos no deseados (como rechazos o sycophancy) e implanta otros nuevos, sin necesidad de fine-tuning tradicional para esos comportamientos. Además, se aplicó un fine-tune específico de seguridad de código y una cuantización de 4 bits, lo que según sus autores mantiene o incluso mejora ligeramente el rendimiento respecto al modelo base.

Esta versión GGUF permite ejecutar el modelo en entornos con recursos limitados, ofreciendo múltiples niveles de cuantización que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB). Es relevante para desarrolladores e investigadores que necesitan un modelo de análisis de código con capacidades conversacionales, desplegable en hardware de consumo o en servidores con GPUs de gama media-alta, y que puede integrarse en pipelines de CI/CD o herramientas de auditoría de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer denso) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Sharona_Q27B-R_CodeSecurity_v2 se construye sobre la arquitectura qwen3_5_text, una variante de la familia Qwen3 orientada a texto. No se dispone de detalles sobre si emplea atención lineal, decodificación especulativa u otras innovaciones técnicas; la información disponible se centra en el proceso de personalización. Según los autores, se utilizó el pipeline jBlaze, que opera directamente sobre los pesos del transformer para eliminar comportamientos específicos (refusal, sycophancy, identidad) e implantar otros nuevos, sin fine-tuning para esos comportamientos. Además, se aplicó un fine-tune de seguridad de código y una cuantización de 4 bits (GPTQ) sobre el modelo original. El resultado, según la publicación en LinkedIn, ganó +1 punto porcentual sobre el modelo stock tras seis fases de weight surgery, el fine-tune y la cuantización, lo que sugiere que el proceso no degradó el rendimiento general. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el modelo mantiene un estilo de diálogo fluido, adecuado para asistentes técnicos.
- Revision de codigo: analiza fragmentos de código fuente para identificar errores, malas prácticas y posibles mejoras.
- Deteccion de vulnerabilidades: especializado en señalar fallos de seguridad comunes (inyección, desbordamiento de buffer, etc.).
- Soporte de tool calling: no confirmado explícitamente, pero al estar basado en Qwen3 es probable que lo herede; no obstante, no hay datos en la información proporcionada.
- Capacidades multilingues: limitadas al inglés, según la etiqueta de idioma.
- Edicion de comportamiento: gracias a jBlaze, el modelo presenta un comportamiento "deidentificado" (sin identidad propia) y sin rechazos innecesarios, lo que puede ser útil en entornos de automatización.

## Casos de uso

- Auditoria de seguridad en CI/CD: el modelo puede integrarse en pipelines de integración continua para revisar automáticamente cada pull request, detectando vulnerabilidades comunes antes del despliegue. Su especialización en code-security lo hace adecuado para esta tarea, y su formato GGUF permite ejecutarlo en servidores con GPUs modestas.
- Asistente de programacion segura: como plugin en editores de código, sugiere correcciones y patrones seguros mientras el desarrollador escribe, reduciendo la probabilidad de introducir fallos de seguridad.
- Analisis de codigo legacy: procesa repositorios antiguos para identificar riesgos de seguridad y generar informes de priorización, aprovechando su capacidad de razonamiento sobre fragmentos largos (aunque la longitud de contexto no está especificada).
- Formacion en ciberseguridad: actúa como tutor interactivo que explica vulnerabilidades en ejemplos de código, ayudando a estudiantes a comprender ataques y mitigaciones.
- Generacion de tests de seguridad: a partir de una función o módulo, el modelo propone casos de prueba orientados a explotar posibles debilidades, facilitando la creación de suites de pentesting.
- Chatbot de soporte tecnico especializado: en empresas de desarrollo, responde consultas sobre seguridad de código, políticas de revisión y mejores prácticas, manteniendo conversaciones multi-turno gracias a su naturaleza conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única referencia es una afirmación de los autores en LinkedIn sobre una mejora de +1 punto porcentual respecto al modelo stock tras el proceso de weight surgery y cuantización, pero no se especifica en qué métrica o conjunto de datos. Por tanto, no es posible presentar una tabla comparativa con datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, los archivos GGUF ocupan entre 10,8 GB (Q2_K) y 28,7 GB (Q8_0). Para Q4_K_M (16,6 GB) se recomienda al menos 20 GB de VRAM libre; para Q8_0, 32 GB o más.
- GPU recomendadas: Q4_K_S y Q4_K_M pueden ejecutarse en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB). Q6_K y Q8_0 requieren GPUs profesionales como A100 (40/80 GB) o H100 (80 GB), o bien múltiples GPUs.
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 24 GB, y Q2_K incluso en GPUs de 12 GB (aunque con menor calidad).
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores basados en llama.cpp. También puede usarse con vLLM si se convierte a formato compatible (aunque vLLM no soporta GGUF nativamente, se puede usar el modelo base safetensors).
- Latencia y throughput: no se dispone de datos medidos. Como referencia orientativa, un modelo de ~27B en Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero esto depende de la implementación y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables con otros modelos de la misma categoría (por ejemplo, CodeLlama 34B, DeepSeek-Coder 33B o Qwen2.5-Coder 32B). La información proporcionada no incluye resultados de benchmarks que permitan una comparación objetiva. Se recomienda consultar el modelo base en HuggingFace para posibles evaluaciones adicionales.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- Especialización: está fuertemente orientado a seguridad de código; su rendimiento en tareas generales de generación de texto o razonamiento puede ser inferior al de modelos generalistas del mismo tamaño.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar análisis de vulnerabilidades incorrectos o inventar patrones de ataque. Es imprescindible validar sus sugerencias con herramientas estáticas y revisión humana.
- Longitud de contexto desconocida: no se ha especificado la ventana de contexto máxima, lo que puede afectar a tareas que requieran procesar archivos de código extensos.
- Sesgos: al ser un modelo entrenado principalmente con datos de código, puede presentar sesgos hacia ciertos lenguajes de programación o estilos de codificación.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no se ofrece garantía alguna.
- Cuantizaciones de baja precisión: las versiones Q2_K y Q3_K pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Sharona_Q27B-R_CodeSecurity_v2-GGUF
- Modelo base (safetensors): https://huggingface.co/ApolloRaines/Sharona_Q27B-R_CodeSecurity_v2
- Publicación en LinkedIn sobre el proceso jBlaze: https://www.linkedin.com/posts/apollo-raines_apollorainessharonaq27b-rcodesecurity-activity-7498101564620996609-Sx7t
- Publicación en LinkedIn sobre el rendimiento: https://www.linkedin.com/posts/apollo-raines_apollorainessharonaq27b-rcodesecurity-activity-7498031501402329088-02ym
