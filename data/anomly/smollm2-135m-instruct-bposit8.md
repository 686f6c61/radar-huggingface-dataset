# Anomly/SmolLM2-135M-Instruct-bposit8

## Resumen

`Anomly/SmolLM2-135M-Instruct-bposit8` es una re-cuantización especial del modelo `HuggingFaceTB/SmolLM2-135M-Instruct`, creada por Anomly para el perfil exacto de INVAR. El objetivo no es añadir capacidades nuevas, sino garantizar una reproducibilidad bit a bit de la inferencia: cada multiplicación de matrices se acumula en un quire de 256 bits con una única operación de redondeo. Este diseño permite que un runtime determinista produzca activaciones y logits idénticos en x86, CUDA y aarch64, y que implementaciones de referencia independientes puedan reproducir una respuesta servida a partir de los pesos y los identificadores de token.

El modelo base pertenece a la familia SmolLM2 de HuggingFace, un transformer de tamaño pequeño (134.515.008 parámetros según el archivo safetensors). La conversión se distribuye en formato GGUF, con un archivo de 0.14 GB y un tipo de archivo `general.file_type` 42, correspondiente a la codificación b-posit8. No se ha especificado la longitud de contexto ni los idiomas soportados en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura del modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | b-posit8 (32 code blocks con escala potencia de dos, códigos posit de 8 bits, es = 2) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`general.file_type` 42, b-posit8) |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero, sino una conversión del checkpoint instruct de SmolLM2-135M. La innovación principal reside en la cuantización b-posit8: utiliza códigos posit de 8 bits con una escala de potencia de dos y agrupados en 32 bloques. Esta representación se integra en el perfil exacto de INVAR, donde cada operación de multiplicación de matrices acumula en un quire de 256 bits y aplica una sola redondeo al final. El resultado es una inferencia determinista entre plataformas, siempre que se use el runtime adecuado.

No se han proporcionado datos sobre la cantidad de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas de alineación como RLHF o DPO, ya que el modelo hereda estas características del modelo base sin modificar el conocimiento aprendido.

## Capacidades

- Generación de texto y seguimiento de instrucciones, como corresponde al modelo base `SmolLM2-135M-Instruct`.
- Inferencia reproducible bit a bit en x86, CUDA y aarch64 dentro del runtime INVAR.
- Ejecución mediante `invar serve`, con validación de conformidad mediante `invar verify`.
- Soporte de formato GGUF, compatible con la bifurcación determinista `llama-cpp-et`.
- Verificación de respuestas servidas frente a implementaciones de referencia, gracias a los vectores de prueba en `go/crverify/testdata`.
- No se dispone de información sobre tool calling, visión, audio u otras capacidades multimodales en la documentación analizada.

## Casos de uso

- **Auditoría de inferencia en entornos regulados**: el perfil exacto garantiza que una respuesta generada en producción puede reproducirse en un entorno de verificación con los mismos pesos y tokens, lo que facilita la trazabilidad y el cumplimiento normativo.
- **Pruebas de regresión en pipelines de IA**: los equipos pueden servir el modelo con `invar serve`, ejecutar la verificación con `invar verify` y comparar las salidas contra vectores de referencia almacenados, detectando así cambios no deterministas en el código o en el hardware.
- **Despliegue en hardware heterogéneo**: al garantizar resultados idénticos en x86, CUDA y aarch64, es posible mover cargas de inferencia entre GPUs, CPUs o dispositivos ARM sin que las respuestas difieran.
- **Investigación sobre cuantización**: el formato b-posit8 con quire de 256 bits es poco habitual; los investigadores pueden usar este modelo para estudiar el efecto de esta técnica frente a cuantizaciones estándar como Q8_0 en la calidad de las respuestas.
- **Educación y demostraciones técnicas**: con solo 0.14 GB, resulta apto para entornos de aprendizaje donde se quiera mostrar un ejemplo completo de cuantización reproducible ejecutable en portátiles o máquinas virtuales modestas.
- **Control de versiones de modelos en producción**: la reproducibilidad permite etiquetar una versión exacta del modelo junto con las salidas esperadas, lo que mejora la gestión de versiones y la revisión de cambios en el comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo GGUF pesa 0.14 GB, por lo que la VRAM estimada para inferencia es inferior a 1 GB.
- El modelo cabe en cualquier GPU de consumo, incluidas las integradas, y también puede ejecutarse en CPU.
- Se recomienda una GPU moderna para aprovechar la compatibilidad con CUDA, aunque el runtime determinista también opera en aarch64 y x86.
- Opciones de despliegue: ecosistema INVAR (`invar serve`, `invar verify`) y la bifurcación `llama-cpp-et` de llama.cpp como backend determinista.
- No se dispone de datos oficiales sobre latencia o throughput.

## Comparativa con modelos similares

| Característica | HuggingFaceTB/SmolLM2-135M-Instruct (base) | Anomly/SmolLM2-135M-Instruct-bposit8 |
|---|---|---|
| Parametros | 134.515.008 | 134.515.008 |
| Contexto | No disponible | No disponible |
| Formato de pesos | Safetensors | GGUF (b-posit8) |
| Rendimiento (benchmarks) | No disponible | No disponible |
| Licencia | Apache-2.0 | Apache-2.0 |
| Disponibilidad | HuggingFace | HuggingFace (0 descargas, 0 likes) |
| Propiedad destacada | Modelo instruct original | Reproducibilidad bit a bit con INVAR |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad.
- La reproducibilidad bit a bit solo se garantiza dentro del runtime determinista requerido (INVAR o `llama-cpp-et`); fuera de ese entorno, las salidas pueden variar.
- El formato b-posit8 no es estándar y requiere una bifurcación específica de llama.cpp, lo que puede complicar la integración con ecosistemas convencionales.
- Al ser un modelo de solo 135M de parámetros, su capacidad para tareas complejas de razonamiento o generación extensa es limitada.
- No se dispone de información documentada sobre sesgos, alucinaciones o restricciones de uso específicas más allá de la licencia Apache-2.0.
- Falta información sobre la longitud de contexto y los idiomas soportados, lo que dificulta evaluar su adecuación en aplicaciones multilingües o con ventanas de contexto largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anomly/SmolLM2-135M-Instruct-bposit8
- Modelo base en HuggingFace: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Modelo base (sin instruct) en HuggingFace: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Repositorio de INVAR: https://github.com/anomly-labs/invar
