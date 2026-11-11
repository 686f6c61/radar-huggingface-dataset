# fusorlabs/pjit-21k-web

## Resumen

P-JiT 21K Web es una compilación para navegador del modelo de difusión texto-a-imagen P-JiT 21K de Linum, empaquetado en dos bundles WebAssembly que ejecutan la inferencia en la CPU del dispositivo mediante el runtime pjit-21k-wasm. El repositorio combina el transformer de difusión P-JiT 21K con las capas del modelo de lenguaje Qwen3.5-4B que se emplean para leer los prompts, y lo publica el usuario fusorlabs bajo licencia Apache-2.0.

Su relevancia radica en el despliegue: no es un checkpoint PyTorch ni safetensors, sino un artefacto específico para un runtime WASM que solo carga en pjit-21k-wasm. Esto permite generar imágenes a partir de texto sin servidor, sin GPU y sin salir del navegador, con los pesos divididos en dos bundles porque una única memoria WebAssembly está limitada a 4 GiB.

El repositorio ocupa 5,9 GB y no registra descargas ni interacciones en el momento de la consulta. La información disponible sobre arquitectura interna, datos de entrenamiento y evaluación es limitada: la model card se centra en el proceso de compilación y empaquetado más que en las características del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión en espacio de píxeles (P-JiT 21K) más capas de Qwen3.5-4B para codificación de texto; empaquetado WebAssembly |
| Parametros totales | no disponible (el repo pesa 5,9 GB en dos bundles cuantizados) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (embeddings y proyecciones gate/up de las FFN del bloque de texto), 7-bit (resto de matrices grandes), f32 (patch embedding, MLP de timestep, proyección de texto y cabeza) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundles propietarios de fusor-ai con `manifest.json` y partes nombradas por hash BLAKE3; no es safetensors ni GGUF |
| Tamano del bundle de texto | 3266 MB (tokenizer, embeddings y capas 0-27 de Qwen3.5-4B) |
| Tamano del bundle de imagen | 2626 MB (diffusion transformer P-JiT 21K) |
| Modelos base | Linum-AI/pjit-21k (rev. 251725ad9a0618f0a4ba3cdf4a488d35312be352), Qwen/Qwen3.5-4B (rev. 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a) |
| Perfil de compilación | `mix` |
| Runtime | pjit-21k-wasm (solo compatible con este runtime) |

## Arquitectura y entrenamiento

El modelo original P-JiT 21K es un transformer de difusión que opera en espacio de píxeles (pixel-space), según la etiqueta `pixel-space` de la model card. La compilación incluye además las capas 0 a 27 de Qwen3.5-4B, que se usan para leer los prompts o captions: el tokenizer, los embeddings y las proyecciones gate/up de las feed-forward se almacenan en 4 bits, mientras que el resto de matrices grandes del bloque de texto se guardan en 7 bits. En el bundle de imagen, todas las matrices grandes del diffusion transformer están en 7 bits, y el patch embedding, el MLP de timestep, la proyección de texto y la cabeza se mantienen en f32.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en los modelos base. La innovación técnica destacable de este repositorio no está en el entrenamiento sino en el despliegue: la división en dos bundles para sortear el límite de 4 GiB por memoria WebAssembly, el uso de hashes BLAKE3 para verificar cada tensor al cargarlo y la compilación reproducible mediante `just model` en el repositorio pjit-21k-wasm. El formato no es interoperable con PyTorch ni con safetensors.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) en espacio de píxeles.
- Ejecución en la CPU del dispositivo dentro del navegador, sin GPU ni backend remoto.
- Carga de pesos con verificación de integridad mediante BLAKE3 durante la inicialización.
- Procesamiento de prompts mediante las capas de Qwen3.5-4B incluidas en el bundle de texto.
- Despliegue sin servidor: la inferencia ocurre íntegramente en el cliente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Generación de imágenes en aplicaciones web sin backend: el modelo se carga en el navegador mediante pjit-21k-wasm y produce la imagen en la CPU local, eliminando costes de servidor y la transmisión de prompts a terceros.
- Herramientas de creación para entornos con privacidad estricta: al no enviar datos fuera del dispositivo, encaja en flujos donde el prompt o la imagen no pueden salir del cliente.
- Demos y prototipos interactivos: el Space fusorlabs/pjit-21k-wasm permite probar el modelo sin instalar nada, útil para evaluar la calidad antes de integrarlo.
- Aplicaciones de escritorio o web offline: una vez descargados los bundles, la generación no depende de conectividad ni de una API externa.
- Educación y experimentación con modelos de difusión: el formato con manifiestos y hashes facilita inspeccionar la estructura de pesos y el proceso de compilación reproducible.
- Distribución de contenido generado en entornos con recursos limitados: al ejecutarse en CPU, no requiere hardware de aceleración dedicado, aunque el rendimiento será menor que en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU del dispositivo; el runtime pjit-21k-wasm no emplea GPU según la información disponible.
- Memoria: los dos bundles suman 5892 MB (3266 MB de texto y 2626 MB de imagen); el runtime debe cargarlos respetando el límite de 4 GiB por memoria WebAssembly, de ahí la división en dos.
- Almacenamiento: aproximadamente 5,9 GB para el repositorio completo.
- GPU recomendadas: no aplica; no se documenta soporte de aceleración por GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exclusivamente el runtime pjit-21k-wasm; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| P-JiT 21K Web (este) | no disponible | no disponible | Bundles fusor-ai (WASM) | Apache-2.0 | Navegador, CPU, runtime pjit-21k-wasm |
| Linum-AI/pjit-21k | no disponible | no disponible | no disponible | no disponible | Checkpoint original; requiere el stack de Linum |
| Qwen/Qwen3.5-4B | 4B (según nombre) | no disponible | no disponible | Apache-2.0 (según la model card) | LLM de texto; no genera imágenes por sí solo |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El formato es propietario: solo carga en el runtime pjit-21k-wasm; no sirve para PyTorch, safetensors, GGUF ni otras herramientas estándar.
- La cuantización a 4 y 7 bits puede degradar la calidad respecto a los pesos originales en f32; no se documenta la magnitud de la pérdida.
- La inferencia en CPU implica latencias altas en comparación con GPU; no se publican cifras de rendimiento.
- El límite de 4 GiB por memoria WebAssembly obliga a dividir el modelo en dos bundles, lo que condiciona el diseño y el consumo de memoria del navegador.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base (P-JiT 21K y Qwen3.5-4B) antes de redistribuir.
- El repositorio no registra descargas ni validación comunitaria en el momento de la consulta, por lo que la madurez en producción es incierta.
- No hay información sobre el contexto máximo de los prompts ni sobre el tamaño de imagen soportado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fusorlabs/pjit-21k-web
- Modelo base P-JiT 21K: https://huggingface.co/Linum-AI/pjit-21k
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Runtime pjit-21k-wasm: https://github.com/fusor-rs/pjit-21k-wasm
- Librería fusor-ai: https://github.com/fusor-rs/fusor-ai
- Demo en Space: https://huggingface.co/spaces/fusorlabs/pjit-21k-wasm
