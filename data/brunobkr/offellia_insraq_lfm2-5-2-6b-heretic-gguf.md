# Brunobkr/OFFELLIA_insraq_LFM2.5-2.6B-heretic.gguf

## Resumen

El modelo `OFFELLIA_insraq_LFM2.5-2.6B-heretic.gguf` es un artefacto GGUF publicado por el usuario Brunobkr, que implementa una cuantización experimental denominada Q4_2_H (Helicoidal) sobre un modelo de lenguaje de aproximadamente 2.600 millones de parámetros, según el nombre del archivo. El repositorio incluye un fork de `llama.cpp` que añade soporte nativo para este tipo de cuantización, junto con un motor matemático basado en la Teoría Aritmético-Harmónica de Becker. La cuantización Q4_2_H utiliza bloques de 24 elementos y una estructura de 14 bytes, logrando 4,67 bits por peso (bpw), un punto intermedio entre Q4_0 (4,50 bpw) y Q4_1 (5,00 bpw).

La relevancia del modelo radica en que aborda el problema de divisibilidad de las dimensiones ocultas en arquitecturas modernas (1536, 2048, 4096, 6912, 8192) mediante un bloque de tamaño 24, lo que reduce el error cuadrático medio de reconstrucción sin aumentar la densidad de memoria. Además, el fork incorpora un "Crivo de Roda Módulo 420" en O(1) y un muestreador de proporción áurea, que según la documentación eliminan colisiones en tablas hash y garantizan equidistribución en el muestreo de tokens. El modelo está disponible bajo licencia MIT y soporta portugués e inglés. No se proporcionan detalles sobre la arquitectura del modelo base ni su proceso de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere LFM2.5, no confirmado) |
| Parametros totales | 2.6B (según el nombre del archivo; no confirmado en la model card) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_2_H (helicoidal, 4,67 bpw) |
| Idiomas soportados | Portugués, inglés |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo .gguf) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base ni los datos de entrenamiento. La model card se centra en el fork de `llama.cpp` y en el método de cuantización. La innovación técnica principal es el tipo `GGML_TYPE_Q4_2_H` (`LLAMA_FTYPE_MOSTLY_Q4_2_H`), con un tamaño de bloque de 24 elementos (`QK_Q4_2_H = 24`). Esto resuelve los problemas de divisibilidad en dimensiones como 1536, 2048, 4096, 6912 y 8192, que no son divisibles por bloques de 42 en implementaciones anteriores. La estructura `block_q4_2_h` ocupa 14 bytes: 2 bytes para la escala FP16 (`d`) y 12 bytes para los 24 nibbles de 4 bits empaquetados (`qs[12]`). La tasa de compresión resultante es de 4,67 bits por peso.

Además, el fork incorpora dos innovaciones matemáticas: el Crivo de Roda 420 en O(1), que aplica una máscara de 96 brazos coprimos módulo 420 para eliminar el 77,14% de las verificaciones y colisiones en tablas hash de vocabulario y en la memoria caché KV dispersa, y el muestreador de proporción áurea, basado en la rotación irracional `x_n = {n * φ} mod 1`, que garantiza equidistribución según el teorema de Weyl-Vinogradov. No se menciona si el modelo fue sometido a RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto en portugués e inglés (según los metadatos del repositorio).
- Inferencia de texto mediante el pipeline `text-generation` de Hugging Face.
- Soporte para el formato GGUF y ejecución a través del fork OFFELLIA de `llama.cpp`.
- No se ha documentado soporte para tool calling, agentes, visión, audio, razonamiento multi-paso ni modos especiales de pensamiento en la información proporcionada.

## Casos de uso

- **Despliegue en entornos con recursos limitados**: gracias a la cuantización Q4_2_H de 4,67 bpw, el modelo reduce el peso de los parámetros a aproximadamente 6,77 GB, lo que permite su ejecución en equipos con GPU de gama media o incluso en CPU mediante `llama.cpp`.
- **Asistente bilingüe portugués-inglés**: por su soporte de ambos idiomas, puede integrarse en aplicaciones de atención al cliente o chatbots para Brasil y Portugal, generando respuestas en el idioma del usuario.
- **Experimentación con cuantización helicoidal**: investigadores y desarrolladores pueden utilizar este modelo para comparar la calidad de reconstrucción de Q4_2_H frente a Q4_0 y Q4_1, midiendo el RMSE y el impacto en la calidad de generación.
- **Prototipado de aplicaciones de texto**: al estar disponible bajo licencia MIT, puede incorporarse en proyectos comerciales o de investigación sin restricciones de uso, siempre que se respete la licencia.
- **Benchmarking de forks de llama.cpp**: la model card describe un servidor integrado de benchmark (`server.ts`) que permite validar métricas del crivo en O(1) y el error RMSE en tiempo de ejecución, lo que facilita pruebas de rendimiento y comparaciones.
- **Integración en pipelines de CI/CD para pruebas de cuantización**: el fork incluye modificaciones en `CMakeLists.txt` para desactivar comprobaciones de Git/Hash, lo que simplifica la compilación en servidores de integración continua y plataformas como Hugging Face Spaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del archivo GGUF: 6,77 GB. Para inferencia en GPU, se estima una VRAM mínima de aproximadamente 7 GB para los pesos, más la memoria del KV cache y el overhead del runtime, por lo que se recomienda una GPU con al menos 8-10 GB de VRAM.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, o superiores. En CPU, se necesitaría RAM equivalente al tamaño del archivo más overhead (aproximadamente 8-10 GB).
- Opciones de despliegue: exclusivamente a través del fork OFFELLIA de `llama.cpp`, ya que la cuantización Q4_2_H no es estándar y no es compatible con `llama.cpp` oficial, `Ollama` ni `TGI` sin modificaciones.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización Q4_2_H es experimental y requiere el fork OFFELLIA de `llama.cpp`; no funcionará con las versiones estándar de `llama.cpp`, `Ollama` u otros motores de inferencia sin compilar el fork.
- No se proporciona información sobre la arquitectura, los datos de entrenamiento ni el proceso de alineación del modelo base, por lo que se desconocen sus sesgos, riesgos de alucinación y limitaciones de contexto.
- La model card no especifica la longitud de contexto soportada, lo que impide conocer el número máximo de tokens que el modelo puede procesar.
- La licencia MIT permite uso comercial, pero las modificaciones del fork y el método de cuantización pueden estar sujetos a términos adicionales no documentados en la model card.
- El modelo puede presentar errores de generación o incoherencias propias de un modelo de 2.6B, especialmente en tareas complejas de razonamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Brunobkr/OFFELLIA_insraq_LFM2.5-2.6B-heretic.gguf
- Página de archivos del repositorio: https://huggingface.co/Brunobkr/OFFELLIA_insraq_LFM2.5-2.6B-heretic.gguf/tree/main
