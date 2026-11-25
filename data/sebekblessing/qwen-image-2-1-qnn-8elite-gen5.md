# sebekblessing/qwen-image-2.1-qnn-8elite-gen5

## Resumen

Qwen-Image 2.1 Turbo para QNN es una conversión del modelo de difusión Qwen-Image 2.1 Turbo (en el empaquetado de Comfy-Org) a binarios de contexto QNN compilados para la unidad neuronal Hexagon v81 del SoC Qualcomm Snapdragon 8 Elite Gen 5. El autor del artefacto es el usuario de Hugging Face `sebekblessing`, que publica esta variante junto a otras dos (una para Hexagon v79 del Snapdragon 8 Elite y otra para la GPU de ambos teléfonos). El modelo resuelve dos tareas: generación de imagen a partir de texto (text-to-image) y edición de imagen guiada por instrucción, ambas a resolución de 768x768 píxeles y en 8 pasos de muestreo.

La relevancia de esta ficha no está en el modelo base, sino en el proceso de despliegue: demuestra que un modelo de difusión de gran tamaño puede ejecutarse en un teléfono mediante cuantización agresiva (4 bits por bloques de 32 para el modelo generador, 8 bits por canal con rotación de Hadamard para el lector de prompts) y compilación AOT a binarios QNN. El repositorio ocupa 14,9 GB, pero la carga secuencial de ficheros permite inferencia con unos 2,6 GB de memoria.

Arquitectónicamente es un pipeline de dos etapas: un lector de prompts basado en el modelo de lenguaje de Qwen3-VL-8B (con su torre de visión para edición) y un modelo de dibujo de 32 bloques con autoencoder `taeqi2_1`. La licencia es Qwen Research, lo que restringe el uso a fines no comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión en dos etapas: lector de prompts (LLM de Qwen3-VL-8B + torre de visión) y modelo generador de 32 bloques; autoencoder `taeqi2_1` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits por bloques de 32 (modelo generador); 8 bits por canal con rotación de Hadamard (lector); 8 bits (torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (uso no comercial) |
| Formato de pesos | Binarios de contexto QNN (`r0.bin`–`r3.bin`, `vis.bin`, `sp0.bin`–`sp31.bin`, `enc.bin`, `dec.bin`), tabla de cuantización `qwen_table_q8.raw`, tokenizer `qwen_tokenizer.json`, `sigmas.txt`, `manifest.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento del modelo base en la documentación proporcionada; esta ficha describe únicamente el artefacto convertido. El pipeline se compone de dos partes diferenciadas. La primera es el lector de prompts, que reutiliza el modelo de lenguaje de Qwen3-VL-8B cuantizado a 8 bits por canal con una rotación de Hadamard aplicada a los pesos; para la tarea de edición se incluye además la torre de visión (`vis.bin`) del mismo modelo. La segunda es el modelo de dibujo, dividido en 32 bloques (`sp0.bin` a `sp31.bin`) con pesos cuantizados a 4 bits en bloques de 32, junto con el encoder y decoder de imagen del autoencoder `taeqi2_1`.

El proceso de conversión, documentado en el directorio `build/` del repositorio, consiste en exportar los pesos originales a ONNX, cuantizarlos según el esquema descrito y compilarlos como binarios de contexto QNN para el Hexagon v81. El muestreo emplea 8 niveles de ruido definidos en `sigmas.txt`, lo que corresponde a un esquema Turbo de pocos pasos. La carga se realiza fichero a fichero, lo que reduce el pico de memoria a unos 2,6 GB pese a que el repositorio completo ocupa 14,9 GB.

## Capacidades

- Generación de imágenes a partir de prompts de texto a 768x768 píxeles en 8 pasos de muestreo.
- Edición de imágenes guiada por instrucción, usando la torre de visión del lector para interpretar la imagen de entrada.
- Interpretación de prompts mediante un modelo de lenguaje de 8B parámetros (Qwen3-VL-8B), lo que permite instrucciones en lenguaje natural relativamente complejas.
- Ejecución íntegra en la NPU Hexagon v81 del Snapdragon 8 Elite Gen 5, sin dependencia de la GPU.
- Carga secuencial de bloques con un pico de memoria de aproximadamente 2,6 GB.
- Integración con la aplicación Anima para Android, que descarga los ficheros automáticamente mediante `manifest.json`.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento extendido.

## Casos de uso

- Generación de imágenes en dispositivos móviles sin conexión: el modelo se ejecuta íntegramente en la NPU del teléfono, de modo que aplicaciones de creación visual pueden producir imágenes de 768x768 sin enviar prompts a un servidor, lo que preserva la privacidad del usuario.
- Edición fotográfica asistida por instrucción: gracias a la torre de visión del lector, el usuario puede indicar cambios en una foto existente (por ejemplo, cambiar el fondo o el estilo) y el modelo aplica la edición en 8 pasos sobre la imagen de 768x768.
- Prototipado de funciones de imagen en apps Android: la app Anima sirve como referencia de integración; los desarrolladores pueden reutilizar el `manifest.json` y el esquema de descarga para incorporar el pipeline a sus propias aplicaciones.
- Investigación en despliegue de difusión en NPU: el repositorio incluye los scripts de conversión en `build/`, lo que permite reproducir el proceso (ONNX, cuantización, compilación QNN) y estudiar el impacto de la cuantización a 4 bits en la calidad de imagen.
- Evaluación comparativa de backends en el mismo dispositivo: al existir variantes para Hexagon v79, Hexagon v81 y GPU, es posible medir diferencias de latencia y calidad entre NPU y GPU en hardware Qualcomm.
- Demostraciones y ferias tecnológicas: la ejecución local en un teléfono de gama alta permite mostrar generación y edición de imágenes en tiempo acotado sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score), latencia por paso ni throughput en el dispositivo.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Elite Gen 5 con NPU Hexagon v81. No funciona en otros SoC sin recompilación.
- Memoria: aproximadamente 2,6 GB de pico durante la inferencia gracias a la carga secuencial de ficheros.
- Almacenamiento: unos 14,9 GB para el repositorio completo (descarga única de aproximadamente 14 GB).
- GPU: no se requiere; el pipeline está compilado para la NPU. Existe una variante separada para la GPU del mismo teléfono (`qwen-image-2.1-gpu`).
- Despliegue: binarios de contexto QNN cargados por la app Anima para Android; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje en formato estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Pasos | Plataforma | Licencia |
|---|---|---|---|---|---|
| qwen-image-2.1-qnn-8elite-gen5 (este) | no disponible | 768x768 | 8 | NPU Hexagon v81 (Snapdragon 8 Elite Gen 5) | Qwen Research (no comercial) |
| qwen-image-2.1-qnn-8elite | no disponible | 768x768 | 8 | NPU Hexagon v79 (Snapdragon 8 Elite) | Qwen Research (no comercial) |
| qwen-image-2.1-gpu | no disponible | 768x768 | 8 | GPU del Snapdragon 8 Elite / 8 Elite Gen 5 | Qwen Research (no comercial) |
| Qwen-Image 2.1 Turbo (original) | no disponible | no disponible | 8 (Turbo) | GPU de servidor / escritorio | Qwen Research (no comercial) |

Las tres variantes QNN/GPU comparten el mismo modelo base y difieren únicamente en el backend de ejecución y el target de compilación. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research: uso exclusivamente no comercial. Cualquier despliegue en producción con fines comerciales requiere una licencia aparte del titular de los derechos.
- Las imágenes generadas pueden diferir ligeramente de las del modelo original debido a la cuantización a 4 bits por bloques y a la compilación QNN.
- El artefacto está compilado específicamente para Hexagon v81; no es portable a otros SoC ni a GPUs de escritorio sin recompilación.
- No se documentan los idiomas soportados por el lector de prompts ni el comportamiento multilingüe del pipeline.
- Riesgo de alucinación visual inherente a los modelos de difusión: el modelo puede generar contenido incoherente o no solicitado, especialmente con prompts ambiguos.
- No se han publicado evaluaciones de sesgo, seguridad o robustez frente a prompts adversarios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del artefacto.
- Dependencia de la app Anima para Android: sin ella, la integración de los binarios QNN requiere trabajo adicional de ingeniería.
- El tamaño de descarga (aproximadamente 14 GB) puede ser prohibitivo en conexiones móviles limitadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebekblessing/qwen-image-2.1-qnn-8elite-gen5
- Licencia: https://huggingface.co/sebekblessing/qwen-image-2.1-qnn-8elite-gen5/blob/main/LICENSE
- Guía de compilación: https://huggingface.co/sebekblessing/qwen-image-2.1-qnn-8elite-gen5/tree/main/build
- Variante para Snapdragon 8 Elite (Hexagon v79): https://huggingface.co/sebekblessing/qwen-image-2.1-qnn-8elite
- Variante para GPU: https://huggingface.co/sebekblessing/qwen-image-2.1-gpu
- Modelo base Qwen-Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Empaquetado Comfy-Org: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- App Anima para Android: https://github.com/adiirfan/anima-android
