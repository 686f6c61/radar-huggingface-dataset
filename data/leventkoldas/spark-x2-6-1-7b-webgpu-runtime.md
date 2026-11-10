# leventkoldas/Spark-X2.6-1.7B-WebGPU-Runtime

## Resumen

Spark-X2.6-1.7B-WebGPU-Runtime es un paquete de pesos cuantizados y tokenizer preparado específicamente para ejecutar el modelo Spark-X2.6-1.7B (desarrollado por XHToken) dentro de un navegador mediante WebGPU. No se trata de un modelo nuevo, sino de una redistribución empaquetada del export oficial ONNX-WebGPU de dicho modelo base, producida por el usuario leventkoldas con la herramienta `tools/pack_weights.py`. Los tensores cuantizados se copian byte a byte desde el export Q4f16 original, sin recuantizar.

El modelo base es un transformer de 1.700 millones de parámetros con 28 capas, dimensión oculta de 2048 y una ventana de contexto de 32.768 tokens. Incorpora atención deslizante de 512 tokens en 21 de sus 28 capas y atención completa en las 7 restantes, una estrategia híbrida que reduce el coste computacional en inferencia de contexto largo. Cuenta con 8 cabezas de consulta y 2 de clave/valor (GQA), dimensión de cabeza 256 y embedding atado con la cabeza de salida sobre un vocabulario de 131.072 tokens.

La relevancia de este paquete es práctica: permite desplegar un LLM de 1.7B en el cliente (navegador) sin servidor, aprovechando la API WebGPU y la precisión `shader-f16` para los pesos cuantizados q4f16. Esto lo hace útil para demos interactivas, prototipado sin infraestructura y aplicaciones de privacidad por diseño donde los datos no abandonan el dispositivo del usuario. El repositorio ocupa 1,2 GB y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida (sliding window + full attention) y GQA |
| Parametros totales | 1,7 B (aproximado, según nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4f16 (pesos q4/q8 empaquetados; requiere `shader-f16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Binarios propietarios empaquetados (`layer_XX.bin`, `lm_head_X.bin`, `manifest.json`) derivados de export ONNX-WebGPU; tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-1.7B es un transformer decoder-only con 28 capas, hidden size 2048 e intermediate size 6656. Emplea 8 cabezas de consulta y 2 cabezas KV (GQA con ratio 4:1), con dimensión de cabeza 256. La innovación arquitectónica destacable es la combinación de atención deslizante de 512 tokens en 21 capas con atención completa en 7 capas, lo que permite manejar un contexto de 32.768 tokens con un coste de atención reducido en la mayor parte de la red. El embedding está atado a la cabeza de salida (tied embedding/lm_head) sobre un vocabulario de 131.072 tokens.

No se dispone de información sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación. El paquete aquí descrito no entrena ni modifica el modelo: únicamente empaqueta los pesos Q4f16 del export oficial ONNX-WebGPU en archivos binarios por capa, junto con un `manifest.json` que describe offsets de tensores, plan de capas y capacidades KV, y un `pack-report.json` con hashes SHA-256 de cada archivo empaquetado para verificación de integridad.

## Capacidades

- Generación de texto autoregresiva en el navegador mediante WebGPU.
- Razonamiento y generación de lenguaje natural (capacidades heredadas del modelo base; sin benchmarks publicados en la información disponible).
- Ejecución totalmente cliente: no requiere backend ni servidor de inferencia.
- Soporte de contexto largo de hasta 32.768 tokens, con atención deslizante que reduce el coste en ventanas de 512 tokens.
- Tokenizer incluido en el paquete (`tokenizer.json`, `tokenizer_config.json`, `generation_config.json`).
- Verificación de integridad de pesos mediante hashes SHA-256 en `pack-report.json`.
- No se especifica soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Demos interactivas de LLM sin servidor: el paquete está diseñado para cargarse desde la Hugging Face Space `mohdmahmodi/Spark-X2.6-1.7B-WebGPU`, permitiendo probar generación de texto directamente en el navegador sin infraestructura de GPU en la nube.
- Prototipado rápido de aplicaciones web con IA: un desarrollador puede integrar el runtime WebGPU en una aplicación frontend y validar flujos de generación antes de invertir en un despliegue servidor con vLLM o TGI.
- Aplicaciones con privacidad por diseño: al ejecutarse íntegramente en el cliente, los prompts y las respuestas no se envían a ningún servidor, lo que encaja en escenarios donde los datos del usuario no deben salir del dispositivo.
- Educación y experimentación con WebGPU: sirve como referencia práctica para estudiar cómo se empaquetan pesos cuantizados q4f16, cómo se gestionan capacidades KV y cómo se implementa un runtime de inferencia en el navegador.
- Procesamiento de documentos largos en local: con 32.768 tokens de contexto, puede resumir o analizar documentos extensos dentro de una pestaña del navegador, sin subir el contenido a terceros.
- Pruebas de regresión de cuantización: al copiar los tensores byte a byte desde el export ONNX-WebGPU oficial, permite comparar salidas entre el runtime WebGPU y otras implementaciones (ONNX Runtime, llama.cpp) sobre los mismos pesos.
- Distribución offline de un asistente de texto: el bundle de 1,2 GB puede servirse desde un CDN o cachearse en el navegador para uso posterior sin conexión, útil en entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el bundle pesa 1,2 GB en disco, por lo que se requiere al menos esa cantidad de memoria de GPU accesible desde el navegador, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y extensión `shader-f16` (requisito explícito del runtime q4f16). No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: previsiblemente sí en GPUs de consumo recientes con WebGPU y `shader-f16`, dado el tamaño de 1,7B parámetros en q4; no se confirma con datos del autor.
- Opciones de despliegue: runtime WebGPU específico del modelo en la Hugging Face Space `mohdmahmodi/Spark-X2.6-1.7B-WebGPU`; el paquete también puede consumirse desde el export ONNX-WebGPU oficial. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-WebGPU-Runtime (este) | 1,7 B | 32.768 | Binarios q4f16 para WebGPU en navegador | Apache 2.0 | Hugging Face (repo de 1,2 GB) |
| XHToken/Spark-X2.6-1.7B (base) | 1,7 B | 32.768 | Pesos originales del modelo base | no disponible | Hugging Face |
| mohdmahmodi/Spark-X2.6-1.7B-ONNX-WebGPU | 1,7 B | 32.768 | ONNX Q4f16 para WebGPU | no disponible | Hugging Face |
| Alternativas de ~1-2B en navegador (p. ej. variantes WebGPU de Llama/Qwen) | ~1-2 B | variable | GGUF/ONNX + WebGPU | variable | Hugging Face |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete no es un modelo entrenado por el autor del repo: es una redistribución empaquetada del export oficial; cualquier mérito o defecto del modelo subyacente se hereda.
- Requiere un navegador con WebGPU y soporte de `shader-f16`; sin esa extensión el runtime q4f16 no funciona.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni validación comunitaria.
- No se han publicado benchmarks, por lo que el rendimiento real del modelo base y del runtime es desconocido.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingüe ni en castellano.
- No se documentan salvaguardas, alineación ni filtros de seguridad del modelo base; riesgo de alucinación y sesgos no cuantificado.
- La licencia Apache 2.0 del paquete no necesariamente cubre los términos del modelo base (XHToken/Spark-X2.6-1.7B), cuya licencia no se especifica en la información disponible; conviene verificar antes de uso comercial.
- El tamaño del bundle (1,2 GB) implica una descarga inicial considerable para el usuario final del navegador.
- El formato de pesos es propietario del runtime (`manifest.json` + binarios por capa), no interoperable directamente con llama.cpp, vLLM ni TGI.

## Enlaces

- Repositorio del paquete: https://huggingface.co/leventkoldas/Spark-X2.6-1.7B-WebGPU-Runtime
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Export ONNX-WebGPU oficial: https://huggingface.co/mohdmahmodi/Spark-X2.6-1.7B-ONNX-WebGPU
- Space del runtime WebGPU: https://huggingface.co/spaces/mohdmahmodi/Spark-X2.6-1.7B-WebGPU
