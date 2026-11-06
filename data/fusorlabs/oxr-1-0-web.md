# fusorlabs/oxr-1.0-web

## Resumen

OXR-1.0-web es una compilación del modelo multimodal OXR-1.0 de SoMarkAI, empaquetada por fusorlabs para su ejecución en el navegador mediante WebAssembly. El modelo original es un sistema image-text-to-text orientado a la lectura de documentos y su conversión a Markdown; esta variante concreta no es un checkpoint de PyTorch ni de safetensors, sino un bundle propietario del runtime `oxr-wasm` que carga los pesos en la CPU del dispositivo del usuario sin necesidad de servidor.

La relevancia de esta ficha radica en su enfoque de despliegue: inferencia totalmente local en el navegador, con pesos cuantizados de forma mixta (cabeza visual a 4 bits, resto a 7 bits) que suman 1420 MB, lo que permite procesar documentos sin enviar datos a un servicio externo. El bundle se distribuye con un `manifest.json` que enumera cada tensor y cada parte, nombradas por su hash BLAKE3, que el runtime verifica durante la carga para garantizar la integridad de los pesos.

La información pública disponible es muy limitada: el repositorio no incluye datos sobre arquitectura interna, número de parámetros, longitud de contexto, idiomas soportados ni resultados de benchmarks. Todo lo que se detalla a continuación proviene de la model card del bundle y de los metadatos de Hugging Face; cualquier dato no confirmado se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; arquitectura interna no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantización mixta: cabeza visual a 4 bits, resto de pesos a 7 bits (perfil `mix`) |
| Idiomas soportados | no disponible |
| Licencia | OXR License (Apache-2.0 con términos adicionales); requiere atribución a SoMark OXR en servicios derivados |
| Formato de pesos | bundle propietario `fusor-ai` con `manifest.json` y partes nombradas por hash BLAKE3; no es safetensors ni GGUF |
| Modelo base | SoMarkAI/OXR-1.0 (revisión `520bed7e90f8f4ffa110db47bdb64d5cf80ccfba`) |
| Tamaño del bundle | 1420 MB |
| Runtime | oxr-wasm (WebAssembly, ejecución en CPU del dispositivo) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base SoMarkAI/OXR-1.0: la model card del bundle no detalla si se trata de un transformer denso, un modelo con mezcla de expertos o una arquitectura híbrida, ni especifica el número de parámetros, capas o dimensiones ocultas. Tampoco se documentan los datos de entrenamiento, el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica destacable de esta variante es el proceso de compilación: los pesos del checkpoint original se transforman en un bundle específico para el runtime `oxr-wasm`, con cuantización mixta (4 bits para la cabeza visual, 7 bits para el resto) y verificación de integridad mediante hashes BLAKE3 por cada parte del modelo. El proceso es reproducible con el comando `just model` del repositorio oxr-wasm, que descarga el checkpoint y compila el mismo bundle. El resultado solo puede cargarse en el runtime oxr-wasm, no en frameworks convencionales como PyTorch, llama.cpp o vLLM.

## Capacidades

- Lectura de documentos e imágenes para su conversión a Markdown, según se describe en la model card ("read documents to Markdown on the device's CPU").
- Procesamiento multimodal image-text-to-text: acepta imágenes y texto como entrada.
- Ejecución on-device en el navegador mediante WebAssembly, sin envío de datos a servidores externos.
- Verificación de integridad de pesos en tiempo de carga mediante hashes BLAKE3.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni modo de pensamiento explícito.
- No se especifican capacidades multilingües ni cobertura de idiomas.
- No se documentan capacidades de audio, vídeo ni generación de imágenes.

## Casos de uso

- Digitalización de documentos en el navegador: el modelo convierte imágenes de documentos a Markdown directamente en la CPU del dispositivo, lo que resulta adecuado para flujos donde el usuario no quiere subir documentos sensibles a un servidor.
- Procesamiento de documentos confidenciales: al ejecutarse íntegramente en el cliente, contratos, informes médicos o documentación interna pueden convertirse a Markdown sin salir del navegador del usuario.
- Herramientas de accesibilidad web: integración en aplicaciones que necesitan extraer texto estructurado de capturas o imágenes para lectores de pantalla, aprovechando la inferencia local sin dependencia de red.
- Aplicaciones de escritorio multiplataforma basadas en web: herramientas construidas con tecnologías web (Electron, Tauri con frontend web) que requieren OCR y estructuración de contenido sin backend propio.
- Prototipado y demos interactivas: el Space `fusorlabs/oxr-wasm` permite probar el modelo sin infraestructura, útil para evaluar la calidad de la conversión a Markdown antes de integrarla.
- Flujos offline o con conectividad limitada: al no requerir conexión tras la carga inicial del bundle, el modelo puede operar en entornos air-gapped o con red intermitente.
- Conversión de documentación técnica a Markdown para pipelines de documentación: extracción de contenido de capturas de manuales o PDFs renderizados como imagen para alimentar repositorios de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El bundle ocupa 1420 MB, por lo que la descarga inicial y el almacenamiento en caché del navegador requieren al menos ese espacio.
- La inferencia se ejecuta en la CPU del dispositivo mediante WebAssembly; no se documenta soporte de aceleración por GPU (WebGPU, WebGL) en la información disponible.
- No se especifican requisitos mínimos de RAM ni de VRAM, al no emplear GPU.
- No se documentan GPU recomendadas, ya que el despliegue objetivo es el navegador.
- No cabe en el sentido convencional de "consumer GPU": el modelo no se distribuye en formato compatible con CUDA, llama.cpp, Ollama, vLLM ni TGI.
- Opciones de despliegue: exclusivamente el runtime oxr-wasm; el bundle no carga en PyTorch ni en safetensors.
- No se dispone de datos de latencia ni throughput publicados.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (image-text-to-text compilados para WebAssembly con runtime propio), y el modelo base SoMarkAI/OXR-1.0 carece de especificaciones públicas suficientes para establecer una comparación cuantitativa con alternativas como modelos de OCR o document-to-Markdown convencionales.

## Limitaciones y advertencias

- El bundle solo carga en el runtime oxr-wasm; no es compatible con PyTorch, safetensors, GGUF ni con herramientas estándar de inferencia.
- La licencia OXR License (Apache-2.0 con términos adicionales) exige atribución a SoMark OXR en cualquier servicio construido sobre el modelo; es necesario revisar el archivo LICENSE para conocer las condiciones exactas de uso comercial.
- No se documentan los sesgos del modelo base ni del proceso de compilación.
- No se dispone de información sobre tasas de alucinación ni sobre la fidelidad de la conversión a Markdown en documentos complejos.
- Se desconoce la longitud de contexto soportada, lo que limita la planificación de casos de uso con documentos extensos.
- No se especifican los idiomas soportados; la conversión a Markdown podría degradarse en idiomas distintos del inglés, aunque esto no está confirmado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la librería `fusor-ai` es específica del ecosistema fusor-rs, lo que implica un soporte comunitario muy limitado.
- La cuantización a 4 bits de la cabeza visual y a 7 bits del resto puede degradar la precisión respecto al checkpoint original; no se han publicado evaluaciones comparativas.
- Para producción en navegador, debe considerarse el coste de la descarga inicial de 1420 MB y el tiempo de carga y verificación de hashes en dispositivos de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusorlabs/oxr-1.0-web
- Modelo base: https://huggingface.co/SoMarkAI/OXR-1.0
- Demo (Space): https://huggingface.co/spaces/fusorlabs/oxr-wasm
- Runtime oxr-wasm: https://github.com/fusor-rs/oxr-wasm
- Librería fusor-ai: https://github.com/fusor-rs/fusor-ai
- Licencia: archivo LICENSE en el repositorio del modelo
