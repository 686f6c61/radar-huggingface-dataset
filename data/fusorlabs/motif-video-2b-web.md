# fusorlabs/motif-video-2b-web

## Resumen

Motif-Video-2B-web es una compilación del modelo generativo de vídeo Motif-Video-2B de Motif Technologies, empaquetado por fusorlabs para ejecutarse íntegramente en el navegador mediante WebAssembly. El modelo original, de 2.000 millones de parámetros, convierte un prompt de texto —o un prompt acompañado de una imagen inicial— en un vídeo, y esta variante lo hace sobre la CPU del dispositivo del usuario, sin servidores ni GPU remota.

La distribución se divide en dos bundles porque una única instancia de memoria WebAssembly está limitada a 4 GiB: uno para el codificador de texto T5Gemma2 (matrices grandes a 4 bits), el codificador de imagen SigLIP (7 bits) y el tokenizador, que suma 2913 MB, y otro para el transformer de difusión y el autoencoder, con matrices a 7 bits, que suma 2413 MB. Los pesos se identifican por hash BLAKE3 y el runtime los verifica al cargarlos.

Su relevancia radica en que demuestra la viabilidad de la generación de vídeo on-device en un entorno web estándar, sin instalación y con licencia Apache-2.0. No obstante, no es un checkpoint PyTorch ni safetensors: solo carga con el runtime motif-video-wasm, lo que limita su uso a ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (video) + codificador de texto T5Gemma2 + codificador de imagen SigLIP + autoencoder |
| Parametros totales | 2B (modelo base Motif-Video-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Matrices grandes a 4 bits (texto) y 7 bits (video); capas de pixel en f32; SigLIP a 7 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundles propietarios fusor-ai con `manifest.json` y partes nombradas por hash BLAKE3 (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Motif-Video-2B emplea un transformer de difusión para la generación de vídeo, apoyado en un codificador de texto T5Gemma2 para procesar el prompt y un codificador de imagen SigLIP para la condición visual en el modo image-to-video. Un autoencoder se encarga de la compresión y reconstrucción del espacio latente de vídeo. La compilación de fusorlabs preserva esta arquitectura pero reorganiza los pesos en dos bundles separados por el límite de 4 GiB de memoria WebAssembly.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original dentro de la información proporcionada. La innovación destacable de esta variante es el propio pipeline de compilación: cuantización selectiva por tipo de matriz (4 bits para texto, 7 bits para vídeo, f32 para capas de pixel), verificación de integridad por hash BLAKE3 en carga y ejecución en CPU dentro del navegador mediante el runtime motif-video-wasm.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen inicial y un prompt (image-to-video).
- Ejecución on-device en la CPU del navegador mediante WebAssembly.
- Verificación de integridad de pesos en tiempo de carga mediante hashes BLAKE3.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (solo condición visual de entrada para image-to-video).

## Casos de uso

- Demostraciones interactivas en web: el modelo puede integrarse en una página o Space para que el visitante genere un vídeo corto desde el navegador, sin backend ni GPU, gracias a la compilación WASM y a la licencia Apache-2.0.
- Prototipado de producto sin infraestructura: equipos que quieran validar una idea de generación de vídeo pueden usar el runtime motif-video-wasm localmente y evitar costes de servidor durante la fase de exploración.
- Aplicaciones de privacidad estricta: al ejecutarse en el dispositivo, el prompt y la imagen nunca salen del navegador, lo que encaja en escenarios con datos sensibles que no pueden enviarse a la nube.
- Educación y divulgación técnica: sirve para mostrar en charlas o talleres cómo se compila y ejecuta un modelo de difusión de vídeo en WebAssembly con cuantización selectiva y verificación de integridad.
- Generación de vídeo image-to-video para contenido estático: a partir de una fotografía y un prompt se puede animar una imagen en local, útil para maquetas o pruebas de concepto creativas.
- Distribución offline o en redes restringidas: al no requerir conexión a un servicio de inferencia, el bundle puede servirse desde un CDN propio o incluso desde almacenamiento local en entornos con conectividad limitada.
- Investigación sobre inferencia en el borde: permite medir latencia, consumo de memoria y calidad de cuantización de un modelo de vídeo de 2B ejecutándose en CPU de navegador, como base para estudios de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU. El consumo relevante es memoria RAM del navegador, con dos bundles de 2913 MB y 2413 MB que se cargan por separado.
- GPU recomendadas: no aplica; el runtime está diseñado para CPU. No se documenta aceleración por GPU.
- ¿Cabe en consumer GPU? No aplica en el sentido habitual; el requisito es un navegador con soporte WebAssembly y memoria suficiente para cargar cada bundle.
- Opciones de despliegue: únicamente el runtime motif-video-wasm (librería fusor-ai). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un checkpoint PyTorch ni safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ejecucion | Licencia | Formato |
|---|---|---|---|---|---|
| fusorlabs/motif-video-2b-web | 2B | no disponible | Navegador (WASM, CPU) | Apache-2.0 | Bundles fusor-ai |
| Motif-Technologies/Motif-Video-2B | 2B | no disponible | Servidor (GPU/CPU) | no disponible | Checkpoint original |
| Otros modelos text-to-video de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con alternativas de la misma categoría no está disponible en la información proporcionada; el principal punto diferencial de esta variante frente al modelo base es el entorno de ejecución (navegador frente a servidor) y el formato de pesos propietario.

## Limitaciones y advertencias

- Solo carga en el runtime motif-video-wasm; no es un checkpoint PyTorch ni safetensors, por lo que no puede usarse con frameworks de inferencia convencionales.
- La separación en dos bundles viene impuesta por el límite de 4 GiB de memoria WebAssembly; el usuario debe gestionar la carga secuencial de ambos.
- La cuantización agresiva (4 bits en texto, 7 bits en vídeo) puede degradar la calidad frente al modelo original en precisión completa.
- Ejecución en CPU del navegador: la latencia puede ser elevada y depende del hardware del usuario; no se documentan cifras de rendimiento.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación visual y de artefactos propios de los modelos de difusión de vídeo; no se documentan sesgos conocidos.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Motif-Video-2B, no indicadas en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusorlabs/motif-video-2b-web
- Modelo base: https://huggingface.co/Motif-Technologies/Motif-Video-2B
- Runtime motif-video-wasm: https://github.com/fusor-rs/motif-video-wasm
- Librería fusor-ai: https://github.com/fusor-rs/fusor-ai
- Demo en Space: https://huggingface.co/spaces/fusorlabs/motif-video-wasm
