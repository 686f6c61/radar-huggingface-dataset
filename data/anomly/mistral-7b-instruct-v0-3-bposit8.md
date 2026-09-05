# Anomly/Mistral-7B-Instruct-v0.3-bposit8

## Resumen

El modelo Anomly/Mistral-7B-Instruct-v0.3-bposit8 es una re-cuantización de `mistralai/Mistral-7B-Instruct-v0.3` al formato b-posit8, desarrollada por Anomly. Está diseñada para el perfil exacto de INVAR, un marco de inferencia reproducible que garantiza que las activaciones y logits sean bit a bit idénticos en plataformas x86, CUDA y aarch64. La cuantización b-posit8 utiliza códigos posit de 8 bits con escala potencia de dos y acumulación en un quire de 256 bits con un único redondeo, lo que elimina la variabilidad de las operaciones en coma flotante. El modelo se distribuye como archivo GGUF de 7,48 GB y conserva la licencia Apache-2.0 del modelo original. Su relevancia radica en la reproducibilidad determinista, una propiedad crítica para auditoría, verificación de inferencias y experimentos científicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basado en Mistral-7B-Instruct-v0.3 |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | b-posit8 (32-code blocks, escala potencia de dos, es=2) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (file_type 42, b-posit8) |

## Arquitectura y entrenamiento

El modelo es una conversión del modelo base `mistralai/Mistral-7B-Instruct-v0.3`, no un reentrenamiento. La arquitectura subyacente es la de un transformer decoder-only de 7.248.023.552 parámetros. La innovación principal es la cuantización b-posit8, que codifica los pesos en bloques de 32 códigos con una escala potencia de dos y códigos posit de 8 bits con es=2. Cada multiplicación de matrices acumula en un quire de 256 bits con un único redondeo, lo que permite que un runtime determinista produzca activaciones y logits idénticos en distintas arquitecturas. El modelo requiere el fork llama-cpp-et (deterministic backend) para su ejecución. No se especifican datos de entrenamiento adicionales en la información disponible.

## Capacidades

- Generación de texto instructivo: al ser una conversión de Mistral-7B-Instruct-v0.3, hereda las capacidades de un modelo de instrucciones para tareas de lenguaje general.
- Conversación multi-turno: el tag `conversational` indica que está pensado para diálogo.
- Reproducibilidad bit a bit: garantiza que las salidas sean idénticas entre plataformas, lo que facilita la verificación y auditoría.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante una API compatible con el estándar de OpenAI.
- Inferencia determinista: el perfil exacto de INVAR permite reproducir una respuesta a partir de los pesos y los token ids.
- No se especifican capacidades de visión, audio, tool calling o razonamiento avanzado en la información disponible.

## Casos de uso

- Auditoría de modelos en entornos regulados: gracias a la reproducibilidad bit a bit, las salidas pueden verificarse de forma independiente, lo que resulta útil en sectores como el financiero o el legal donde se requiere trazabilidad.
- Investigación reproducible: los investigadores pueden replicar experimentos y comparar resultados entre distintas plataformas sin variaciones debidas al hardware.
- Pruebas de regresión en CI/CD: integrar el modelo en pipelines de integración continua para detectar cambios en el comportamiento del modelo tras actualizaciones.
- Despliegue en infraestructura heterogénea: el modelo produce los mismos logits en x86, CUDA y aarch64, lo que facilita migrar entre proveedores de nube o hardware local.
- Servicios de asistencia por chat: al ser un modelo instruct y conversacional, puede usarse para responder preguntas y mantener diálogos, con la ventaja de que las respuestas son reproducibles.
- Verificación de inferencias en producción: con `invar verify`, se puede comprobar que un servicio en producción genera exactamente la misma salida que una implementación de referencia, lo que ayuda a detectar errores de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 7,48 GB. Para cargar el modelo completo en GPU se necesita al menos 8 GB de VRAM, aunque se recomienda disponer de margen adicional para el contexto y el overhead de ejecución.
- GPU recomendadas: no disponible en la información. Por tamaño, el modelo puede ejecutarse en GPUs de consumo con 12 GB o más, pero no se proporcionan datos de latencia ni throughput.
- Opciones de despliegue: el modelo está pensado para ejecutarse con INVAR (`invar serve` y `invar verify`). Al ser GGUF, también es compatible con el ecosistema llama.cpp, aunque se requiere el fork llama-cpp-et con backend determinista para garantizar la reproducibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Reproducibilidad | Licencia |
|---|---|---|---|---|
| mistralai/Mistral-7B-Instruct-v0.3 | safetensors | FP16 | No garantizada | Apache-2.0 |
| Anomly/Mistral-7B-Instruct-v0.3-bposit8 | GGUF | b-posit8 | Bit a bit (perfil exacto INVAR) | Apache-2.0 |

No se dispone de datos de rendimiento ni de otras alternativas comparables en la información proporcionada. La diferencia principal es el perfil exacto de reproducibilidad, que no está garantizado en las cuantizaciones estándar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no especificado; heredado del modelo base.
- Limitaciones de contexto o idioma: no disponible.
- El modelo no incorpora mecanismos de moderación, según la documentación del modelo base.
- Al ser una re-cuantización, puede haber diferencias de comportamiento respecto al modelo original sin cuantizar, especialmente en tareas sensibles a la precisión.
- La reproducibilidad bit a bit solo está garantizada si se utiliza el runtime determinista adecuado (INVAR o el fork llama-cpp-et). Con otros runtimes, la salida puede variar.
- Licencia Apache-2.0: permite uso comercial, pero requiere incluir la atribución original y indicar los cambios realizados.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Anomly/Mistral-7B-Instruct-v0.3-bposit8
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio INVAR: https://github.com/anomly-labs/invar
- Repositorio de referencia del modelo base: https://github.com/ashishagrawal-as/mistral-7b-v03-instruct
