# Anomly/Llama-3.2-1B-Instruct-bposit8

## Resumen

El modelo Anomly/Llama-3.2-1B-Instruct-bposit8 es una re-cuantización del modelo meta-llama/Llama-3.2-1B-Instruct de Meta, realizada por Anomly. Emplea el formato b-posit8, que codifica los pesos en 32 bloques con una escala de potencia de dos y códigos posit de 8 bits (es=2), y está diseñado para el perfil exacto de INVAR. La principal innovación es que cada multiplicación de matrices acumula en un quire de 256 bits con un único redondeo, lo que permite que un runtime determinista produzca activaciones y logits idénticos bit a bit en x86, CUDA y aarch64. Esto resuelve el problema de la falta de reproducibilidad en la inferencia de modelos de lenguaje, facilitando la verificación independiente de las respuestas servidas. El modelo tiene 1.235.814.432 parámetros y se distribuye como un archivo GGUF de 1.28 GB. La longitud de contexto no está disponible en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: meta-llama/Llama-3.2-1B-Instruct) |
| Parámetros totales | 1.235.814.432 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | b-posit8 (32 bloques, escala potencia de dos, códigos posit de 8 bits, es=2; GGUF general.file_type 42) |
| Idiomas soportados | No disponible |
| Licencia | llama3.2 (licencia upstream, aplica sin cambios) |
| Formato de pesos | GGUF (archivo Llama-3.2-1B-Instruct-bposit8.gguf) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base meta-llama/Llama-3.2-1B-Instruct, pero la información proporcionada no detalla sus componentes. Este modelo no es un entrenamiento nuevo, sino una conversión de los pesos al formato b-posit8. El proceso de cuantización utiliza 32 bloques con una escala de potencia de dos y códigos posit de 8 bits con es=2. La característica técnica destacable es el perfil exacto de INVAR: cada operación de multiplicación de matrices acumula en un quire de 256 bits con un solo redondeo, lo que garantiza que un runtime determinista (como el fork llama-cpp-et) produzca activaciones y logits idénticos bit a bit en x86, CUDA y aarch64. No se proporcionan datos sobre el conjunto de datos de entrenamiento, el número de tokens ni técnicas como RLHF o DPO, ya que se trata de una re-cuantización.

## Capacidades

- Inferencia determinista y reproducible bit a bit en x86, CUDA y aarch64, gracias al quire de 256 bits y al único redondeo por multiplicación de matrices.
- Reproducibilidad de las respuestas servidas: implementaciones de referencia independientes pueden verificar una respuesta a partir de los pesos y los token ids.
- Generación de texto conversacional, heredada del modelo base instruct (no se detallan capacidades específicas en la información proporcionada).
- Compatibilidad con el runtime INVAR y el fork determinista de llama.cpp (llama-cpp-et).
- Formato GGUF con file_type 42, que puede ser cargado por runtimes compatibles.
- Etiqueta `endpoints_compatible` en HuggingFace, lo que sugiere compatibilidad con despliegue en endpoints, aunque no se especifica el protocolo.

## Casos de uso

1. **Verificación de integridad de inferencia en producción**: un operador puede comparar las activaciones y logits generados por su servicio con los de un runtime de referencia (`invar verify`) para detectar desviaciones o fallos de hardware.
2. **Auditoría de modelos en entornos regulados**: en sectores como finanzas o salud, donde la trazabilidad de cada respuesta es crítica, el modelo permite reproducir una respuesta concreta a partir de los pesos y los token ids.
3. **Investigación en cuantización de posit**: el esquema b-posit8 con quire de 256 bits ofrece un banco de pruebas para estudiar el efecto de la cuantización en la precisión y la reproducibilidad.
4. **Pruebas de conformidad de runtimes**: los desarrolladores pueden usar el modelo y los vectores de test incluidos en INVAR para validar que una implementación nueva cumple el perfil exacto.
5. **Despliegue en entornos multi-plataforma**: gracias al determinismo en x86, CUDA y aarch64, un mismo modelo puede ejecutarse en diferentes arquitecturas sin variaciones en los resultados, útil para sistemas distribuidos.
6. **Educación y demostración de determinismo en LLM**: el modelo sirve como ejemplo práctico de cómo una cuantización específica puede garantizar inferencia reproducible, útil en cursos o laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 1.28 GB. Para inferencia en GPU, se estima una VRAM mínima de 2-4 GB, incluyendo pesos, KV cache y activaciones. No hay datos oficiales.
- GPU recomendadas: no disponible en la información. Por tamaño, cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060) podría ser suficiente, pero no está confirmado.
- También puede ejecutarse en CPU, dado el formato GGUF y el runtime llama.cpp.
- Opciones de despliegue: runtime INVAR (`invar serve`) y `llama-cli` del fork llama-cpp-et. La etiqueta `endpoints_compatible` sugiere que puede exponerse como endpoint, aunque no se detalla el protocolo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Objetivo |
|---|---|---|---|---|---|
| Anomly/Llama-3.2-1B-Instruct-bposit8 | 1.235.814.432 | GGUF b-posit8 | No disponible | llama3.2 | Reproducibilidad exacta |
| meta-llama/Llama-3.2-1B-Instruct | 1.235.814.432 | safetensors | No disponible | llama3.2 | Modelo base instruct |

Ambos modelos comparten el mismo número de parámetros y licencia. La diferencia principal es el formato de pesos: la versión de Anomly está cuantizada a b-posit8 y enfocada a la reproducibilidad determinista, mientras que el modelo base se distribuye en safetensors sin cuantización. No se dispone de datos de contexto ni de rendimiento comparativo.

## Limitaciones y advertencias

- La cuantización b-posit8 (8 bits) puede introducir pérdida de precisión respecto al modelo original en safetensors, aunque el perfil exacto garantiza un único redondeo por multiplicación de matrices.
- La reproducibilidad bit a bit solo se garantiza con el runtime determinista de INVAR (llama-cpp-et fork); con otros runtimes o configuraciones no se puede asegurar.
- La licencia llama3.2 impone restricciones de uso y requisitos de atribución, tal como se indica en la model card. No se detallan aquí los términos exactos.
- No se proporciona información sobre sesgos, riesgos de alucinación o limitaciones de idioma, por lo que se desconocen.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un experimento reciente o poco validado.
- La longitud de contexto no está disponible, por lo que no se puede evaluar la capacidad de manejar conversaciones largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anomly/Llama-3.2-1B-Instruct-bposit8
- Repositorio INVAR: https://github.com/anomly-labs/invar
- Modelo base en HuggingFace: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
