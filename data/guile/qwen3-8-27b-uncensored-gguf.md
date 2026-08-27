# Guile/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una conversión a GGUF del modelo Qwen3.8-27B de Qwen, publicada por el usuario Guile en HuggingFace. Se trata de una versión "abliterada" (eliminación de direcciones de rechazo) que reduce sustancialmente el comportamiento de negativa del modelo original, manteniendo intactas sus capacidades de generación, razonamiento, visión y tool calling. El modelo base es un transformer denso de 27 320 millones de parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal + atención completa), ventana de contexto de 262 144 tokens, cabeza de predicción multi-token (MTP) para decodificación especulativa y soporte nativo de visión.

La relevancia de esta ficha radica en que ofrece a desarrolladores e investigadores una alternativa local ejecutable con llama.cpp, con cuantizaciones desde 2 bits hasta 8 bits, y con la particularidad de que los tensores MTP se han verificado y conservado tras el proceso de abliteración, algo que otras conversiones suelen perder. El modelo está pensado para entornos donde se requiere menor censura en las respuestas, siempre bajo la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: Gated DeltaNet lineal + atención completa) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (además de f16 no publicado y drafts Q4_0/Q8_0) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención completa, lo que permite manejar contextos largos (262 144 tokens) con un coste computacional reducido. Incluye una cabeza de predicción multi-token (MTP) de una capa, diseñada para decodificación especulativa, y un módulo de visión que permite procesar imágenes. El proceso de "uncensoring" se realizó mediante abliteración con la herramienta Heretic, que minimiza el número de rechazos frente a la divergencia KL con el modelo original, sin fine-tuning ni datos de entrenamiento adicionales. La abliteración se ejecutó en bf16 y el LoRA resultante se fusionó en el modelo base, por lo que los pesos publicados no son un redondeo cuantizado. Los tensores `mtp.*` se copiaron literalmente del checkpoint base tras la fusión, y se verificó su presencia en cada archivo cuantizado. La matriz de importancia (imatrix) se calculó directamente desde el f16, no desde una cuantización intermedia.

## Capacidades

- Generación de texto y razonamiento multi-step con modo de pensamiento controlable.
- Comprensión y generación de código, con soporte para tool calling y function calling.
- Capacidades matemáticas y de razonamiento lógico.
- Visión: entrada de imágenes (el modelo base incluye torre de visión; se proporcionan archivos `vision-f16` y `vision-bf16`).
- Decodificación especulativa mediante cabeza MTP integrada (fused) o como archivo draft separado.
- Multilingüe: inglés y chino.
- Comportamiento "uncensored": rechazos sustancialmente reducidos, aunque no eliminados por completo (ver sección de limitaciones).

## Casos de uso

- Asistente de programación local: el modelo puede generar, revisar y refactorizar código en entornos sin conexión, aprovechando su soporte de tool calling para integrarse en pipelines de CI/CD o editores de código.
- Chatbot de atención al cliente con contexto largo: su ventana de 262 144 tokens permite mantener conversaciones multi-turno extensas sin perder el hilo, ideal para soporte técnico o jurídico.
- Análisis de documentos con imágenes: al combinar visión y texto, puede extraer información de capturas, diagramas o documentos escaneados, útil en entornos de investigación o administración.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material de marketing donde se requiera explorar temas sensibles sin filtros automáticos.
- Razonamiento matemático y científico: resolución de problemas complejos paso a paso, con capacidad de verificación mediante decodificación especulativa para acelerar la inferencia.
- Desarrollo de agentes autónomos: su soporte de tool calling y razonamiento multi-step permite construir agentes que interactúan con APIs, bases de datos o navegadores, ejecutándose localmente con llama.cpp.
- Prototipado rápido de aplicaciones de IA: al estar disponible en múltiples cuantizaciones, se puede desplegar en hardware variado, desde portátiles con 16 GB de RAM hasta servidores con GPU profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones de perplexity en wikitext-2 para cada cuantización, comparadas con la línea base f16 (no publicada). Los valores son:

| Archivo | PPL (wikitext-2) | vs f16 |
|---|---|---|
| f16 (baseline, no publicado) | 7.1557 ± 0.25104 | - |
| Q5_K_M | 7.1573 ± 0.25055 | +0.0016 |
| IQ4_XS | 7.1583 ± 0.25019 | +0.0026 |
| Q6_K | 7.1689 ± 0.25149 | +0.0132 |
| Q8_0 | 7.1764 ± 0.25195 | +0.0207 |
| Q4_K_M | 7.1814 ± 0.25227 | +0.0257 |
| IQ2_M | 7.8581 ± 0.27481 | +0.7024 |

El autor advierte que, salvo IQ2_M, todas las cuantizaciones están dentro del margen de error y no son distinguibles entre sí ni del f16. La única diferencia estadísticamente significativa es IQ2_M, que se sitúa aproximadamente 2.8 errores estándar por encima de la línea base.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo):
  - IQ2_M: 10.6 GB
  - IQ4_XS: 15.3 GB
  - Q4_K_M: 16.8 GB
  - Q5_K_M: 19.5 GB
  - Q6_K: 22.4 GB
  - Q8_0: 29.0 GB
  - Draft Q4_0: 1.7 GB adicionales (si se usa como modelo draft separado)
  - Draft Q8_0: 3.2 GB adicionales
  - Visión (f16 o bf16): 0.9 GB adicionales
- GPU recomendadas: para cuantizaciones hasta Q5_K_M, una GPU consumer con 24 GB (RTX 3090/4090) es suficiente. Para Q6_K o Q8_0 se recomienda una GPU profesional (A100 40 GB, H100) o descarga a CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (CPU, CUDA, Metal, ROCm), Ollama (mediante importación de GGUF), y cualquier runtime compatible con GGUF (llama-cpp-python, etc.). El autor menciona compatibilidad con `--model-draft` para decodificación especulativa en llama-server.
- Latencia y throughput: no se han publicado mediciones específicas. La decodificación especulativa con MTP puede acelerar la generación, pero la tasa de aceptación puede ser ligeramente inferior a la del modelo base sin abliterar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MTP | Visión | Licencia | Cuantizaciones |
|---|---|---|---|---|---|---|
| Guile/Qwen3.8-27B-Uncensored-GGUF | 27.3B | 262 144 | Sí (verificado) | Sí | Apache 2.0 | IQ2_M a Q8_0 |
| unsloth/Qwen3.8-27B-GGUF | 27.3B | 262 144 | No especificado | No especificado | Apache 2.0 | Múltiples (no detallado) |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | 27.3B | 262 144 | Sí | Sí | Apache 2.0 (research-only según blog) | F16 + 12 niveles |

La principal diferencia frente a la versión de unsloth es que esta ficha conserva y verifica la cabeza MTP, mientras que otras conversiones suelen perderla. Frente a la versión de orcarouter, ambas son abliteradas, pero la de Guile documenta explícitamente el proceso de verificación de tensores MTP y publica la imatrix calculada desde f16. No se dispone de datos de rendimiento comparativos (MMLU, etc.) entre estas variantes.

## Limitaciones y advertencias

- El comportamiento "uncensored" es parcial: el autor indica que los rechazos se han reducido sustancialmente, pero no eliminados. En algunos casos el modelo puede seguir negándose a responder.
- La abliteración puede afectar a la calibración de la cabeza MTP: la tasa de aceptación de la decodificación especulativa puede caer ligeramente, aunque la calidad de salida no se ve afectada porque cada token se verifica contra el modelo objetivo.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos o con temas poco representados en sus datos de entrenamiento.
- Sesgos: el proceso de abliteración no elimina sesgos subyacentes del modelo base; puede amplificar ciertos sesgos al reducir la inhibición.
- Idiomas limitados: solo inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Contexto largo: aunque la ventana es de 262 144 tokens, en la práctica la calidad puede degradarse en los tramos finales de contextos muy extensos, como ocurre con la mayoría de modelos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales; se recomienda verificar la licencia del modelo original antes de un despliegue en producción.
- Los archivos de visión (`vision-f16` y `vision-bf16`) son necesarios para entrada de imágenes; sin ellos, el modelo solo funciona en modo texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Guile/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de abliteración Heretic: https://github.com/p-e-w/heretic
- Blog de orcarouter sobre el modelo: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio de orcarouter en HuggingFace: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Conversión GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Guía de uso en GitHub: https://github.com/Wassimyounes01/qwen38-uncensored
