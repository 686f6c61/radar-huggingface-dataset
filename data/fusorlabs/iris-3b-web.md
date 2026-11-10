# fusorlabs/iris-3b-web

## Resumen

Iris-3B-web es una compilación del modelo de generación de imágenes por difusión en espacio de píxeles Iris-3B de speridlabs, empaquetado por fusorlabs para ejecutarse íntegramente en el navegador mediante WebAssembly. El paquete incluye cinco bundles que cubren el codificador de texto (el modelo de lenguaje de Qwen3-VL-4B-Instruct, del que se leen los estados hasta la última capa que Iris consume), el transformer base, su destilación Turbo de cuatro pasos, un estimador de profundidad y un restaurador de imagen con factor de escala cuatro. La relevancia del proyecto radica en que traslada un pipeline completo de texto-a-imagen, imagen-a-imagen, estimación de profundidad y superresolución a la CPU del dispositivo del usuario, sin servidor ni GPU dedicada.

El modelo no es un checkpoint de PyTorch ni de safetensors: solo se carga en el runtime iris-wasm. Los pesos se dividen en cinco bundles porque una única memoria WebAssembly está limitada a 4 GiB y la página ejecuta el codificador de texto y un transformer cada vez. Cada bundle ronda los 2,5 GB (el del codificador de texto, 3105 MB; los cuatro transformers, 2558 MB cada uno), lo que da un repositorio de 13,3 GB. La licencia es Apache-2.0.

La ficha se basa exclusivamente en la model card y los metadatos publicados; no se han divulgado resultados de benchmarks ni detalles adicionales sobre el entrenamiento de los modelos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion en espacio de pixeles (Iris-3B) con codificador de texto basado en Qwen3-VL-4B-Instruct; empaquetado para WebAssembly |
| Parametros totales | no disponible (el nombre comercial sugiere 3B para el generador; el codificador de texto deriva de un modelo de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Matrices feed-forward a 4 bits; resto de matrices grandes a 7 bits; capas de entrada/salida de pixeles en f32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundles propios de fusor-ai (manifest.json + partes nombradas por hash BLAKE3); no compatible con safetensors ni GGUF |
| Tamano del repositorio | 13,3 GB |
| Bundles | text (3105 MB), base, turbo, depth, upscaler (2558 MB cada uno) |
| Modelos base | speridlabs/iris-3b (rev. adc05b9), Qwen/Qwen3-VL-4B-Instruct (rev. ebb281e) |
| Runtime | iris-wasm (WebAssembly, ejecucion en CPU) |

## Arquitectura y entrenamiento

El pipeline combina un codificador de texto derivado de Qwen3-VL-4B-Instruct con un generador de difusión en espacio de píxeles (Iris-3B). El codificador de texto se recorta hasta la última capa que el generador consume y se compila junto a su tokenizador; los cuatro transformers restantes corresponden al modelo base, a su destilación Turbo de cuatro pasos, al estimador de profundidad y al restaurador de imagen. Los bundles de profundidad y restauración incorporan los estados correspondientes al prompt vacío, de modo que operan sin condicionamiento textual explícito.

La compilación se realiza con el perfil `mix` de fusor-ai: las matrices feed-forward se cuantizan a 4 bits, el resto de matrices grandes a 7 bits, y las capas que leen o escriben directamente píxeles se mantienen en f32. Cada `manifest.json` enumera todos los tensores y partes, y el runtime verifica el hash BLAKE3 de cada parte durante la carga. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en los modelos originales.

## Capacidades

- Generación de texto a imagen en espacio de píxeles a partir de un prompt.
- Generación en cuatro pasos mediante la variante Turbo destilada.
- Imagen a imagen (image-to-image) usando el transformer base o Turbo.
- Estimación de profundidad monocular a partir de una imagen.
- Superresolución con factor de escala cuatro mediante el restaurador.
- Ejecución íntegra en el dispositivo (on-device) sobre la CPU del navegador vía WebAssembly.
- Verificación de integridad de pesos mediante hashes BLAKE3 en tiempo de carga.
- No se documenta soporte de tool calling, agentes, modo thinking ni entrada de audio.

## Casos de uso

- Edición de imágenes en el navegador sin subida a servidor: el pipeline imagen-a-imagen permite transformar una foto local manteniendo los datos en el dispositivo, lo que encaja en flujos con requisitos de privacidad.
- Superresolución de material gráfico en aplicaciones web: el bundle `upscaler` multiplica por cuatro la resolución de una imagen directamente en la CPU del cliente, útil para visores o herramientas de diseño que no pueden depender de una GPU en servidor.
- Generación de profundidad para efectos 2.5D: el estimador de profundidad permite crear mapas de profundidad en el navegador para parallax, desenfoque selectivo o composición de capas sin backend.
- Prototipado rápido de texto-a-imagen: la variante Turbo de cuatro pasos reduce el coste de inferencia, lo que facilita demos interactivas en la Space `fusorlabs/iris-wasm` y en páginas estáticas.
- Aplicaciones offline o de baja conectividad: al ejecutarse en WebAssembly sobre CPU, el modelo puede funcionar en entornos sin acceso a servicios de inferencia remotos, siempre que se cacheen los bundles.
- Herramientas educativas y de investigación sobre difusión en el navegador: el formato de bundles con manifiestos y hashes permite estudiar la carga, cuantización mixta y ejecución de un pipeline de difusión completo en un runtime WASM.
- Integración en editores web de imágenes: combinando depth, upscaler e image-to-image se pueden ofrecer operaciones encadenadas sobre una misma sesión de navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 13,3 GB para el repositorio completo; los bundles individuales pesan 3105 MB (texto) y 2558 MB cada uno de los cuatro transformers.
- Memoria: una única memoria WebAssembly está limitada a 4 GiB, por lo que la página carga el codificador de texto y un transformer cada vez; se requiere un navegador con soporte WASM y memoria suficiente para el bundle activo más el estado de inferencia.
- GPU: no se requiere GPU; la inferencia se ejecuta en la CPU del dispositivo.
- VRAM estimada: no aplica (ejecución en CPU vía WebAssembly).
- Despliegue: exclusivamente mediante el runtime iris-wasm; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con checkpoints PyTorch o safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ejecucion | Licencia | Formato |
|---|---|---|---|---|---|
| fusorlabs/iris-3b-web | no disponible (generador ~3B; codificador de texto de 4B) | no disponible | Navegador (WASM, CPU) | Apache-2.0 | Bundles fusor-ai |
| speridlabs/iris-3b | no disponible | no disponible | Servidor/GPU (checkpoint original) | no disponible en esta ficha | no disponible en esta ficha |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en esta ficha | GPU/servidor | no disponible en esta ficha | safetensors |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El paquete solo carga en el runtime iris-wasm; no puede usarse con frameworks estándar de difusión ni convertirse directamente a safetensors o GGUF.
- La división en cinco bundles y el límite de 4 GiB por memoria WebAssembly obligan a cargar el codificador de texto y un transformer cada vez, lo que condiciona el diseño de la aplicación y los tiempos de carga.
- El repositorio ocupa 13,3 GB, un tamaño considerable para un despliegue web orientado a cliente.
- No se documentan los idiomas soportados por el codificador de texto ni por el generador.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo generativo de imágenes, existe riesgo de sesgos en los datos de entrenamiento originales y de generar contenido inexacto o inapropiado.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE; conviene verificar las licencias de los modelos base (`speridlabs/iris-3b` y `Qwen/Qwen3-VL-4B-Instruct`) antes de un despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusorlabs/iris-3b-web
- Space de demostración: https://huggingface.co/spaces/fusorlabs/iris-wasm
- Runtime iris-wasm: https://github.com/fusor-rs/iris-wasm
- Herramientas fusor-ai: https://github.com/fusor-rs/fusor-ai
- Modelo base Iris-3B: https://huggingface.co/speridlabs/iris-3b
- Codificador de texto: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
