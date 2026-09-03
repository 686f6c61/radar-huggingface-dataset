# abenzerps/K2-Horizon-7B-GGUF

## Resumen

K2-Horizon-7B-GGUF es una colección de cuantizaciones GGUF del modelo original IFM/K2-Horizon-7B, un modelo de lenguaje denso de tipo decoder-only diseñado para tareas de razonamiento, generación de código, procesamiento de contexto largo y uso de herramientas. El checkpoint original soporta una ventana de contexto nativa de 524.288 tokens (512K), lo que lo sitúa entre los modelos de 7B con mayor capacidad de contexto disponible. Esta versión GGUF permite ejecutar el modelo en entornos locales con llama.cpp y otras herramientas compatibles, ofreciendo varios niveles de cuantización para ajustar el equilibrio entre calidad y consumo de memoria.

El modelo está desarrollado por IFM (el autor del checkpoint original) y la cuantización ha sido realizada por abenzerps. Se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y modificación. Aunque el nombre indica 7B, el número real de parámetros es de 8.999.178.240 (aproximadamente 9B), un detalle relevante para estimar requisitos de hardware. La relevancia actual de este modelo radica en su combinación de tamaño moderado con una ventana de contexto extremadamente larga, lo que lo hace atractivo para aplicaciones que requieren procesar documentos extensos o mantener conversaciones de muchas vueltas sin perder información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only |
| Parametros totales | 8.999.178.240 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base IFM/K2-Horizon-7B es un transformer denso de tipo decoder-only, sin mezcla de expertos (MoE). No se dispone de información detallada sobre la arquitectura interna (número de capas, dimensiones de atención, etc.) ni sobre el proceso de entrenamiento (tamaño del dataset, número de tokens, técnicas de alineación como RLHF o DPO). La model card del modelo GGUF solo indica que el checkpoint original soporta una ventana de contexto de 512K tokens, lo que sugiere el uso de técnicas de atención eficiente o interpolación posicional, aunque no se especifica el mecanismo concreto.

Al ser una cuantización, esta versión GGUF no introduce cambios en la arquitectura, solo reduce la precisión de los pesos para facilitar la ejecución en hardware con menos memoria. La cuantización se ha realizado con las técnicas estándar de llama.cpp (Q4_0, Q4_K_M, etc.), que preservan razonablemente la calidad del modelo original a cambio de una pequeña pérdida de fidelidad.

## Capacidades

- Generacion de texto y razonamiento: el modelo está diseñado para tareas de razonamiento complejo, incluyendo problemas de lógica y matemáticas.
- Generacion de codigo: soporta la creación y depuración de código en varios lenguajes, aunque no se especifican cuáles.
- Procesamiento de contexto largo: gracias a su ventana de 512K tokens, puede manejar documentos extensos, libros completos o conversaciones de muchas vueltas sin perder el hilo.
- Uso de herramientas (tool use): la descripción indica que el modelo es adecuado para tool use, lo que implica capacidad de invocar funciones externas o APIs en un flujo de agente.
- Conversacion: es un modelo de generación de texto orientado a diálogo, con una plantilla de chat incluida en el repositorio.
- Multilingue: solo se declara soporte para inglés; no hay evidencia de capacidades multilingües.

## Casos de uso

- Analisis de documentos legales extensos: un despacho de abogados puede cargar contratos de cientos de páginas (más de 100K tokens) y pedir al modelo que extraiga cláusulas relevantes, resuma obligaciones o detecte inconsistencias, gracias a su contexto de 512K.
- Generacion de codigo en repositorios grandes: un desarrollador puede pegar el contenido de varios archivos de un proyecto (por ejemplo, 50K-100K tokens) y solicitar refactorizaciones, explicaciones o detección de bugs, sin necesidad de dividir el código en fragmentos.
- Asistente de investigacion academica: un investigador puede cargar varios artículos científicos completos (cada uno de 10K-20K tokens) y pedir al modelo que compare metodologías, resuma hallazgos o genere una revisión bibliográfica.
- Atencion al cliente con historial largo: un sistema de soporte puede mantener el historial completo de una conversación con un cliente (incluyendo correos previos, tickets y notas) dentro del contexto, permitiendo respuestas coherentes y personalizadas.
- Agente autonomo de automatizacion de tareas: al soportar tool use, el modelo puede integrarse en un pipeline de agente que lea correos, consulte APIs, actualice bases de datos y genere respuestas, todo dentro de una misma sesión de contexto largo.
- Transcripcion y analisis de reuniones: cargar la transcripción completa de una reunión de varias horas (puede superar 100K tokens) y pedir al modelo que genere actas, identifique acuerdos o liste tareas pendientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo GGUF incluye una imagen con resultados del checkpoint original, pero no se proporcionan valores numéricos en el texto. Por tanto, no es posible presentar una tabla comparativa con datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño de los archivos GGUF, la cuantización Q4_K_M (5,59 GB) requiere al menos 6-7 GB de VRAM para cargar el modelo, más overhead de contexto. Para una ventana de 128K tokens, se necesitará memoria adicional para las claves y valores de atención (KV cache), que puede superar los 8 GB en modelos de 7B. Con contexto completo de 512K, la VRAM necesaria puede superar los 32 GB.
- GPU recomendadas: para uso con contexto moderado (hasta 32K), una GPU de consumo como RTX 3060 12GB, RTX 4070 o similar es suficiente. Para contexto largo (128K o más), se recomienda una GPU con 24 GB o más, como RTX 3090, RTX 4090 o A5000. Para el contexto máximo de 512K, se necesitarían GPUs profesionales como A100 80GB o H100.
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q4 y Q5 caben en GPUs de 8-12 GB si se usa un contexto reducido (por ejemplo, 8K-16K tokens).
- Opciones de despliegue: llama.cpp (incluido llama-cli y llama-server), Ollama, LM Studio, y cualquier servidor compatible con GGUF como text-generation-webui. También se puede usar vLLM si se convierte a otro formato, aunque no es el flujo principal.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con cuantización Q4_K_M, se puede esperar una velocidad de generación de 40-60 tokens por segundo, pero esto es una estimación orientativa basada en modelos similares, no un dato oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría (por ejemplo, Llama 3 8B, Mistral 7B o Qwen 7B). La model card no incluye datos de benchmarks ni comparaciones con otros modelos. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para inglés. Su rendimiento en otros idiomas, incluido el español, no está garantizado y probablemente sea inferior.
- Sesgos y alucinaciones: al ser un modelo de lenguaje generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento complejo o cuando se le pide información factual. No se han publicado evaluaciones de sesgos específicas.
- Pérdida de calidad por cuantización: las versiones GGUF, especialmente Q4_0, pueden degradar ligeramente la precisión en tareas de razonamiento o generación de código en comparación con el checkpoint original en fp16.
- Requisitos de memoria para contexto largo: aunque el modelo soporta 512K tokens, usar esa ventana completa requiere una cantidad de VRAM muy elevada (decenas de GB), lo que limita su uso práctico en hardware de consumo.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero es recomendable revisar los términos completos de la licencia para asegurar el cumplimiento.
- Sin soporte de visión: el modelo es solo texto; no puede procesar imágenes ni otros formatos multimodales.

## Enlaces

- Repositorio GGUF: [abenzerps/K2-Horizon-7B-GGUF](https://huggingface.co/abenzerps/K2-Horizon-7B-GGUF)
- Modelo base: [IFM/K2-Horizon-7B](https://huggingface.co/IFM/K2-Horizon-7B)
- Licencia Apache-2.0: [https://www.apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0)
