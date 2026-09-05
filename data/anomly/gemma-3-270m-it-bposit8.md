# Anomly/Gemma-3-270M-it-bposit8

## Resumen

El modelo `Anomly/Gemma-3-270M-it-bposit8` es una re-cuantización del modelo instructivo `google/gemma-3-270m-it`, desarrollada por Anomly. Su objetivo es ofrecer una versión del modelo en formato b-posit8 para el perfil exacto de INVAR, un sistema que garantiza reproducibilidad determinista en la inferencia. Cada multiplicación de matrices acumula en un quire de 256 bits con un único redondeo, lo que produce activaciones y logits idénticos bit a bit en x86, CUDA y aarch64, y permite que implementaciones de referencia independientes reproduzcan una respuesta servida a partir de los pesos y los token ids.

El modelo tiene 268.098.176 parámetros totales y un tamaño de archivo de 0.28 GB, lo que lo hace adecuado para aplicaciones en dispositivo y entornos donde la reproducibilidad es crítica. La arquitectura subyacente no se detalla en la información proporcionada, pero se trata de un modelo compacto basado en el modelo Gemma 3 270M de Google.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | b-posit8 (32 bloques de código con escala potencia de dos, códigos posit de 8 bits, es=2) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | GGUF (general.file_type 42) |

## Arquitectura y entrenamiento

El modelo es una conversión de `google/gemma-3-270m-it` al formato b-posit8, que utiliza 32 bloques de código con escala potencia de dos y códigos posit de 8 bits (es=2). Esta cuantización está diseñada para el perfil exacto de INVAR: cada matmul acumula en un quire de 256 bits con un solo redondeo, garantizando que un runtime determinista produzca activaciones y logits idénticos bit a bit en x86, CUDA y aarch64. El archivo resultante es un GGUF con `general.file_type` 42, compatible con el fork determinista de llama-cpp-et.

No se dispone de información sobre los datos de entrenamiento del modelo base; la licencia upstream de Google Gemma se aplica sin cambios, incluyendo restricciones de uso y requisitos de atribución.

## Capacidades

- Seguimiento de instrucciones: según el blog de Google, el modelo base Gemma 3 270M establece un nuevo nivel de rendimiento en IFEval para su tamaño, lo que indica una fuerte capacidad para seguir instrucciones verificables.
- Conversación: el tag `conversational` indica que el modelo está diseñado para interacciones de chat.
- Reproducibilidad determinista: gracias a la cuantización b-posit8 y al perfil exacto de INVAR, produce salidas bit a bit idénticas en x86, CUDA y aarch64.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en entornos de inferencia compatibles.
- Aplicaciones en dispositivo: por su tamaño reducido, es adecuado para entornos con recursos limitados.
- No se dispone de información sobre soporte de tool calling, agentes, visión o audio.

## Casos de uso

- Verificación de respuestas en producción: gracias al perfil exacto de INVAR, se puede usar el comando `invar verify` para comprobar que una respuesta servida se reproduce bit a bit a partir de los pesos y los token ids, lo que permite auditoría y detección de errores en sistemas que requieren trazabilidad.
- Aplicaciones en dispositivo: con un tamaño de archivo de 0.28 GB y 268 millones de parámetros, el modelo puede ejecutarse en móviles o equipos de borde mediante el backend determinista de llama-cpp-et, ofreciendo capacidades de seguimiento de instrucciones sin conexión.
- Investigación reproducible: la cuantización b-posit8 con quire de 256 bits garantiza activaciones y logits idénticos en x86, CUDA y aarch64, lo que facilita la comparación de resultados entre entornos y la replicación de experimentos.
- Pruebas de integración continua: el determinismo del modelo permite usarlo como oráculo en tests automatizados, donde se esperan salidas exactas para una entrada dada, reduciendo la flakiness en pipelines de CI/CD.
- Chat local para asistencia: el modelo base es instructivo y el tag `conversational` indica soporte para conversaciones; puede integrarse en asistentes locales que requieren respuestas deterministas y un consumo de recursos mínimo.
- Evaluación de cuantizaciones: este modelo sirve como referencia para comparar el impacto de diferentes formatos de cuantización en la fidelidad del modelo, ya que el perfil exacto de INVAR define una especificación reproducible para medir diferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El blog de Google menciona que el modelo base Gemma 3 270M establece un nuevo nivel de rendimiento en IFEval para su tamaño, pero no se proporcionan cifras concretas en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 0.28 GB, por lo que la VRAM necesaria para cargar los pesos es de aproximadamente 0.3 GB. Con overhead de runtime y memoria KV, se recomienda al menos 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente. También puede ejecutarse en CPU.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo con 2 GB o más.
- Opciones de despliegue: llama-cpp-et (fork determinista) mediante `llama-cli`, y el servidor INVAR mediante `invar serve`. También es compatible con herramientas que carguen GGUF estándar, aunque la reproducibilidad exacta requiere el fork determinista.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos o riesgo de alucinación específicos del modelo.
- La licencia upstream de Google Gemma se aplica sin cambios, incluyendo restricciones de uso y requisitos de atribución. Es necesario revisar la licencia Gemma antes de usar el modelo en producción.
- La reproducibilidad exacta solo está garantizada si se utiliza el runtime determinista (fork llama-cpp-et) y el perfil exacto de INVAR. Con otros backends o herramientas que carguen el GGUF, la salida puede no ser bit a bit idéntica.
- No se dispone de información sobre la longitud de contexto ni los idiomas soportados.
- Al tratarse de una re-cuantización, el rendimiento del modelo puede verse afectado respecto al modelo original sin cuantizar, aunque no se proporcionan datos cuantitativos.

## Enlaces

- https://huggingface.co/Anomly/Gemma-3-270M-it-bposit8
- https://huggingface.co/google/gemma-3-270m-it
- https://developers.googleblog.com/en/introducing-gemma-3-270m/
- https://github.com/anomly-labs/invar
