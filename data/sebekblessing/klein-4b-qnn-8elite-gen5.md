# sebekblessing/klein-4b-qnn-8elite-gen5

## Resumen

`klein-4b-qnn-8elite-gen5` es una conversión para dispositivo móvil del modelo de generación y edición de imágenes FLUX.2 [klein] 4B, publicada por el usuario sebekblessing. El paquete contiene los pesos convertidos a ONNX, cuantizados y compilados como *context binaries* de QNN para la unidad neuronal Hexagon v81, integrada en el SoC Qualcomm Snapdragon 8 Elite Gen 5. El modelo dibuja imágenes de 768x768 píxeles y edita una imagen de 768x768 a partir de una instrucción en lenguaje natural.

La relevancia de esta ficha es doble. Por un lado, demuestra la viabilidad de ejecutar un modelo de difusión de 4B parámetros íntegramente en la NPU de un teléfono de gama alta, sin depender de la nube. Por otro, ilustra el flujo de trabajo de conversión ONNX → cuantización → compilación QNN que hoy exige el despliegue de IA generativa en hardware móvil Qualcomm. El repositorio ocupa 5,2 GB y se distribuye con licencia Apache 2.0.

No se dispone de información sobre el número exacto de parámetros activos, la longitud de contexto del lector de prompts ni los idiomas soportados más allá de lo que se deduce de sus componentes (Qwen3-4B como codificador de texto). La model card no publica benchmarks ni métricas de latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (FLUX.2 [klein] 4B) con codificador de texto Qwen3-4B y VAE taef2; compilado como QNN context binaries para Hexagon v81 |
| Parametros totales | 4B (según el nombre del modelo base); desglose por componente no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantización para NPU QNN (el codificador de texto aparece como `klein_qwen_q8.raw`, lo que sugiere 8 bits); esquema exacto del resto de grafos no disponible |
| Idiomas soportados | No disponible (heredados del codificador Qwen3-4B, sin confirmar en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Binarios QNN (`.bin`, `.raw`) más `manifest.json` con tamaños y SHA-256; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 [klein] 4B, un modelo de difusión para texto-a-imagen y edición de imágenes por instrucción. La conversión móvil separa el sistema en cuatro bloques: un lector de prompts basado en Qwen3-4B (`text0.bin` a `text2.bin`, `klein_qwen_q8.raw`, `qwen_tokenizer.json`), el modelo generador (`part0.bin` a `part3.bin`, con un grafo de dibujo y otro de edición que comparten pesos), y un codificador y decodificador de imagen taef2 de madebyollin (`enc.bin`, `dec.bin`).

El proceso de conversión consistió en transformar los pesos originales a ONNX, cuantizarlos y compilarlos para la unidad Hexagon v81. La model card advierte explícitamente de que este pipeline puede introducir diferencias visuales respecto al modelo original. No se detallan en la información disponible los datos de entrenamiento, el número de tokens, ni si hubo RLHF o DPO; esos datos corresponden a la model card del FLUX.2 [klein] 4B original, que no se ha proporcionado.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución de 768x768 píxeles.
- Edición de imágenes guiada por instrucción sobre una entrada de 768x768, usando un grafo dedicado que comparte pesos con el de generación.
- Procesamiento del prompt en lenguaje natural mediante un codificador Qwen3-4B cuantizado a 8 bits.
- Ejecución íntegra en la NPU Hexagon v81 del Snapdragon 8 Elite Gen 5, sin inferencia en la nube.
- Descarga gestionada por la app Anima mediante `manifest.json`, que incluye tamaños y hashes SHA-256 para verificar la integridad de los ficheros.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Edición de fotos en el propio teléfono: el grafo de edición permite modificar una imagen de 768x768 con una instrucción de texto sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones de retoque con requisitos de privacidad.
- Generación de imágenes offline: al ejecutarse en la NPU local, el modelo funciona sin conectividad, útil en entornos con red limitada o en modo avión.
- Integración en la app Anima: el paquete está diseñado para que la aplicación descargue los binarios y los cargue directamente en QNN, de modo que sirve como backend listo para producción en Android.
- Prototipado de experiencias creativas móviles: desarrolladores que quieran validar flujos de texto-a-imagen en hardware Snapdragon pueden usar estos binarios como referencia de conversión.
- Investigación sobre cuantización en NPU: el repositorio incluye los scripts de `build/` para reproducir la conversión desde los pesos originales, lo que permite estudiar el impacto de la cuantización QNN en la calidad visual.
- Demostración de inferencia en dispositivo para evaluación de hardware: útil para comparar el rendimiento de Hexagon v81 frente a Hexagon v79 (variante de 512x512) y frente a la variante GPU del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU objetivo: Hexagon v81, integrada en el Qualcomm Snapdragon 8 Elite Gen 5. No es ejecutable en otras NPU sin recompilar.
- Almacenamiento: el repositorio ocupa 5,2 GB, por lo que se necesita espacio libre equivalente más margen para la descarga y verificación.
- Memoria: no se publica el consumo de RAM o de memoria compartida de la NPU; no disponible.
- GPU de escritorio: no aplica; para GPUs convencionales existe la variante `klein-4b-gpu` del mismo autor.
- Despliegue: los binarios QNN se cargan mediante la app Anima (Android); no se indican soportes para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| klein-4b-qnn-8elite-gen5 | 4B | 768x768 | No disponible | Apache 2.0 | NPU Hexagon v81 (Snapdragon 8 Elite Gen 5) |
| klein-4b-qnn-8elite | 4B | 512x512 | No disponible | Apache 2.0 | NPU Hexagon v79 (Snapdragon 8 Elite) |
| klein-4b-gpu | 4B | No disponible | No disponible | Apache 2.0 | GPU del teléfono |
| FLUX.2 [klein] 4B (original) | 4B | No disponible | No disponible | Apache 2.0 | Servidor/escritorio |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a plataforma, resolución y licencia.

## Limitaciones y advertencias

- La cuantización y compilación QNN pueden producir imágenes distintas de las del modelo original; la model card lo reconoce de forma explícita.
- El modelo está atado al hardware Hexagon v81: no funciona en otros SoC ni en GPU sin recompilación.
- No se documentan sesgos, tasas de alucinación visual ni evaluación de calidad; no hay información para valorarlos.
- No se especifican los idiomas soportados por el codificador de texto, aunque Qwen3-4B es multilingüe por diseño; conviene validarlo empíricamente.
- La licencia Apache 2.0 permite uso comercial, pero las licencias de los componentes (Qwen3-4B Apache 2.0, taef2 MIT) deben respetarse por separado.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo día (21 de noviembre de 2026), por lo que carece de validación comunitaria.
- No hay métricas de latencia, memoria ni consumo energético publicadas, lo que dificulta planificar su integración en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebekblessing/klein-4b-qnn-8elite-gen5
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Variante Snapdragon 8 Elite (Hexagon v79, 512x512): https://huggingface.co/sebekblessing/klein-4b-qnn-8elite
- Variante GPU: https://huggingface.co/sebekblessing/klein-4b-gpu
- App Anima: https://github.com/adiirfan/anima-android
- Scripts de compilación: https://huggingface.co/sebekblessing/klein-4b-qnn-8elite-gen5/tree/main/build (guía en `build/README.md`)
