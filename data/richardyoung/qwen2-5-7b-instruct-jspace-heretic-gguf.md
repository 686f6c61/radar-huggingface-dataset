# richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-JSpace-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic, a su vez derivado de Qwen2.5-7B-Instruct de Alibaba. El autor, richardyoung, aplica técnicas de "abliteration" (eliminación de rechazos de seguridad mediante la modificación de direcciones de activación) para producir un modelo "uncensored" orientado a investigación. Esta versión concreta empaqueta los pesos en GGUF con cuantización asistida por imatrix, pensada para su uso con llama.cpp y Ollama.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5 con 7.615.616.512 parámetros totales y una ventana de contexto de 32.768 tokens (heredada de la familia Qwen2.5). Su relevancia radica en ofrecer una variante sin filtros de rechazo para estudios de alineación, evaluación de sesgos y experimentación con modelos abliterated, en un formato que corre en hardware de consumo.

La ficha se limita a la información disponible en la model card y los metadatos de Hugging Face; los detalles de entrenamiento del modelo base y de los datos usados en el proceso de abliteration no están publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B-Instruct; no verificada en la model card) |
| Tipos de cuantizacion | GGUF con cuantizacion asistida por imatrix (variantes concretas no detalladas en la informacion disponible) |
| Idiomas soportados | en (segun metadatos; el modelo base Qwen2.5 es multilingue, pero esta variante declara solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de consulta agrupada (GQA), RoPE y normalización RMSNorm, entrenado por Alibaba con un corpus multilingüe y ajustado por instrucciones con técnicas de RLHF/DPO. Sobre esa base, richardyoung aplica un proceso de "heretic"/abliteration que modifica las direcciones de activación asociadas a la negativa a responder, reduciendo el comportamiento de rechazo. No se detalla en la información disponible el número de tokens, la composición del dataset ni los hiperparámetros empleados en ese proceso.

La versión GGUF se generó con cuantización asistida por imatrix, que utiliza una matriz de importancia calculada sobre un corpus de calibración para preservar mejor la calidad en bits bajos. No se especifican en la model card las variantes de cuantización publicadas (Q4_K_M, Q5_K_M, Q8_0, etc.) ni el corpus de calibración utilizado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste de instrucciones de Qwen2.5.
- Razonamiento, matemáticas y generación de código propias de la familia Qwen2.5-7B.
- Comportamiento "uncensored": reduce los rechazos ante peticiones que el modelo base rechazaría, orientado a investigación.
- Soporte de tool calling y function calling heredado de Qwen2.5-Instruct (no verificado específicamente en esta variante).
- Capacidades multilingües del modelo base, aunque esta variante declara únicamente inglés en sus metadatos.
- Ejecución local mediante llama.cpp y Ollama gracias al formato GGUF, con compatibilidad con endpoints.

## Casos de uso

- Investigación en alineación y seguridad: analizar cómo el proceso de abliteration altera las respuestas del modelo en dominios sensibles, comparando con el Qwen2.5-7B-Instruct original para estudiar la robustez de los filtros de rechazo.
- Evaluación de sesgos y toxicidad: servir como sujeto de prueba en pipelines de red-teaming y benchmarks de seguridad, dado su comportamiento sin filtros.
- Despliegue local en estaciones de trabajo: con formato GGUF y 7,6 mil millones de parámetros, puede ejecutarse en GPU de consumo mediante llama.cpp u Ollama para prototipos conversacionales sin conexión.
- Generación de texto creativo sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas que el modelo base rechazaría, en entornos controlados de investigación.
- Experimentación con cuantización: comparar la degradación de calidad entre variantes GGUF generadas con imatrix frente a cuantizaciones estándar sobre el mismo modelo base.
- Docencia y demostraciones: ilustrar en cursos de IA los efectos de la abliteration y las diferencias entre modelos alineados y no alineados usando hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en cuantización Q4_K_M, 7-8 GB en Q5_K_M y 9-10 GB en Q8_0 (estimaciones según el tamaño de 7,6 mil millones de parámetros; las variantes concretas publicadas no se detallan en la información disponible).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones bajas y medias; A100 o H100 para FP16 o Q8_0 con contexto largo.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM usando cuantizaciones Q4/Q5; con 12-16 GB se puede usar Q8_0 o contexto extendido.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta `ollama` en los metadatos), y servidores compatibles con endpoints según el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic-GGUF | 7,6 B | 32.768 (heredado) | apache-2.0 | GGUF | Variante abliterated, solo inglés declarado, acceso restringido |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 | apache-2.0 | safetensors, GGUF | Modelo base alineado, multilingüe, acceso abierto |
| Meta Llama 3.1 8B Instruct | 8 B | 128.000 | Llama 3.1 Community License | safetensors, GGUF | Alternativa alineada con contexto mayor y licencia con restricciones |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 | apache-2.0 | safetensors, GGUF | Alternativa abierta de tamaño similar |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo "uncensored" y abliterated: no aplica los filtros de seguridad del Qwen2.5-7B-Instruct original, por lo que puede generar contenido dañino, ilegal o explícito; su uso debe restringirse a investigación controlada.
- Riesgo elevado de alucinación, agravado por la modificación de activaciones, que puede degradar la coherencia y la fidelidad factual respecto al modelo base.
- Idiomas: los metadatos declaran únicamente inglés, aunque el modelo base es multilingüe; el rendimiento en otros idiomas no está verificado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia apache-2.0 heredada, que permite uso comercial, pero el comportamiento sin filtros traslada al usuario la responsabilidad legal y ética del contenido generado.
- No se documentan las variantes de cuantización publicadas ni los datos de calibración de imatrix, lo que dificulta reproducir la evaluación de calidad.
- El proceso de abliteration puede introducir sesgos adicionales o amplificar los existentes en el modelo base; no se han publicado evaluaciones de sesgo en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
