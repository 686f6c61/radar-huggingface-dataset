# executorch-community/Phonon-31M-EN-ExecuTorch-WebGPU

## Resumen

Phonon 31M (English) para ExecuTorch WebGPU es una conversión del modelo de síntesis de voz `gradium/phonon-31m-en`, publicada por la comunidad `executorch-community` para que se ejecute íntegramente en el navegador del visitante sobre el backend WebGPU de ExecuTorch. El modelo original lo desarrolla Gradium, se apoya en Pocket TTS y en el códec neuronal Mimi de Kyutai, y cuenta con 31 millones de parámetros sin incluir el tokenizador de audio. Genera voz mono a 24 kHz en inglés y emite una trama de audio cada 80 ms mientras sigue generando, lo que permite reproducción en streaming con latencia de grano fino.

La aportación de este repositorio no es el modelo en sí, sino el artefacto desplegable: dos programas ExecuTorch (`.pte`) delegados al backend WebGPU, con un total de 150,7 MB, pesos en fp32 y la tabla de embeddings de texto almacenada en bf16. Incluye además el tokenizador, el contrato de entrada/salida en `phonon.json` y dos voces precalculadas como prompts de 125 tramas. No requiere servidor ni backend de inferencia: el playground descarga los ficheros una vez, los cachea y ejecuta todo en local.

Su interés práctico es demostrar TTS neuronal de baja latencia en el cliente con una huella de unos 150 MB, sin GPU dedicada y sin salir del navegador. Las contrapartidas son explícitas: solo inglés, contexto limitado a 512 posiciones, ausencia de normalización de texto (números, fechas, correo, moneda) y una prosodia que no se propaga más allá de cada frase.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de flow-matching que predice latentes de audio, más decodificador del códec neuronal Mimi; exportado como dos programas ExecuTorch con backend WebGPU |
| Parámetros totales | 31 M (excluyendo el tokenizador de audio) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 posiciones (prompt de voz, texto y tramas de audio) |
| Tipos de cuantización | fp32 en ambos programas; tabla de embeddings de texto en bf16 (exacta para esos pesos). No se publican variantes int8, int4 ni GGUF |
| Idiomas soportados | inglés únicamente (la model card lo restringe a English only; el campo de idiomas del repo no está cumplimentado) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (`phonon_flow_lm.pte`, 106,7 MB; `phonon_mimi.pte`, 39,4 MB), binarios `.bin` en bf16/f32, `tokenizer.json` y `phonon.json` |
| Tamaño total del artefacto | 150,7 MB (repositorio de 0,2 GB) |
| Salida de audio | mono, 24 kHz, una trama de 80 ms por paso (1.920 muestras por llamada al decodificador) |
| Voces incluidas | `voice_default` y `voice_en_us_easton`, cada una como prompt de 125 tramas (250 KB por voz, f32) |
| Runtime requerido | ExecuTorch WebGPU (build WebAssembly publicado en `executorch-community/ExecuTorch-WebGPU-Runtime`); navegador con WebGPU habilitado |
| Inferencia estándar | no (el campo `inference: false` de la model card indica que no se ejecuta con `transformers`/`pipeline`) |

## Arquitectura y entrenamiento

El modelo original es un transformer de flow-matching que, a partir del texto y de un prompt de voz, predice el latente de audio correspondiente a cada trama de 80 ms; el decodificador de Mimi (Kyutai) convierte esos latentes en muestras de audio. La conversión a ExecuTorch separa el sistema en dos programas: `phonon_flow_lm.pte`, que integra el transformer, un sampler de un solo paso, el score de fin de habla y la caché de atención internamente, y `phonon_mimi.pte`, un decodificador Mimi en streaming que recibe un latente más 15 tensores de estado y devuelve 1.920 muestras a 24 kHz junto con el estado actualizado. El primer programa acepta embeddings de 1 a 128 posiciones más la posición de inicio y el ruido, y produce el siguiente latente y el score de fin de habla.

La exportación reescribe algunas operaciones con equivalentes admitidos por el backend WebGPU (layer norm, media, convolución transpuesta 1-D, ELU y SiLU) y cada una se validó contra el modelo original. Los pesos se mantienen en fp32 y solo la tabla de embeddings de texto pasa a bf16, representación que la model card califica de exacta para esos valores. El contexto queda recortado a 512 posiciones. Los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) no se detallan en la información disponible y se remiten a la model card del modelo original. La exportación se realizó con executorch 1.5.1+cpu, torch 2.14.1+cpu, torchao 0.18.0+cpu y transformers 5.19.0 sobre la revisión `52433c46975bfa13144c56204c9f4ee1c5b148aa` del modelo upstream.

## Capacidades

- Síntesis de voz en inglés con salida mono a 24 kHz y streaming real: una trama de 80 ms por paso, sin esperar a generar la frase completa.
- Predicción del latente de audio y del score de fin de habla en el mismo programa, con muestreo de un solo paso.
- Decodificación Mimi en streaming con estado persistente entre llamadas (15 tensores de estado).
- Soporte de prompts de voz: dos voces precalculadas y posibilidad de usar otros prompts de `gradium/phonon-voices` proyectados al modelo.
- Ejecución on-device en navegador mediante WebGPU, con los pesos descargados y cacheados en el cliente; no requiere backend.
- Reproducibilidad verificada: la receta de exportación genera ficheros idénticos byte a byte y el bucle completo en WebGPU coincide con los programas CPU (coseno de audio 0,9999997).
- No incluye normalización de texto: la conversión de números, moneda, fechas o correos electrónicos debe hacerla la aplicación antes de tokenizar.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo de texto a voz.
- No hay capacidades multilingües: el texto en otros idiomas se pronuncia con reglas inglesas.

## Casos de uso

- Asistentes conversacionales en navegador: el modelo permite leer las respuestas del asistente en local con WebGPU, sin enviar el texto a un servidor de TTS y con arranque en streaming a los 80 ms de la primera trama.
- Lectores de pantalla y herramientas de accesibilidad: es un uso declarado por el autor; con 150 MB de artefacto y ejecución en GPU del cliente encaja en extensiones de navegador o aplicaciones web que deben funcionar sin conexión.
- Videojuegos y aplicaciones interactivas: la generación por tramas de 80 ms permite diálogos sintéticos reactivos sin precargar todos los clips de voz, útil para NPC con texto dinámico.
- Aprendizaje de inglés y aplicaciones educativas: al ser un modelo solo en inglés, sirve para practicar pronunciación y lectura en voz alta, con la advertencia de que la prosodia no se mantiene entre frases.
- Demos y prototipos sin infraestructura: el ExecuTorch WebGPU Playground descarga y cachea los ficheros, de modo que un equipo puede validar una idea de TTS sin desplegar GPUs ni contenedores.
- Kioscos y terminales con requisitos de privacidad: el procesamiento ocurre en el dispositivo del usuario, lo que simplifica el cumplimiento cuando el texto que se va a sintetizar es sensible.
- Contenido sintético señalizado: útil para generar avisos de voz sintética o narraciones de artículos dentro de una web, siempre indicando al oyente que la voz es artificial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato numérico de validación publicado es la comprobación de paridad de la conversión: el bucle completo de TTS ejecutado en WebGPU (Chromium headless sobre SwiftShader) coincide con los programas CPU originales con un coseno de audio de 0,9999997. Se trata de una verificación de equivalencia numérica, no de una medida de calidad de síntesis ni de naturalidad.

## Requisitos de hardware

- Huella en disco y en memoria: 150,7 MB de pesos (106,7 MB del transformer de flow-matching y 39,4 MB del decodificador Mimi), más estados de streaming y búferes del runtime.
- VRAM: no hay cifra oficial. Al mantenerse en fp32, el consumo de pesos ronda los 150 MB; con caché de atención, estados y overhead del runtime WebAssembly es razonable esperar unos cientos de MB. Estimación orientativa, no publicada por el autor.
- GPU compatibles: cualquier GPU con soporte de WebGPU, incluida gráfica integrada. La validación se hizo en Chromium headless con WebGPU sobre SwiftShader, es decir, renderizado por software.
- Cabe en GPU de consumidor: sí, en cualquier GPU de sobremesa o portátil y en iGPU; es un caso de despliegue en cliente, no de servidor.
- Despliegue: runtime ExecuTorch WebGPU en formato WebAssembly (`executorch-community/ExecuTorch-WebGPU-Runtime`) o el ExecuTorch WebGPU Playground. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles como cifra agregada. Por diseño, cada llamada al decodificador produce 1.920 muestras a 24 kHz, esto es, 80 ms de audio, y el transformer avanza una trama por paso con un sampler de un solo paso.
- Requisito de navegador: WebGPU habilitado. El soporte de WebGPU varía entre navegadores y versiones, lo que condiciona el despliegue en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato de despliegue | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| Phonon 31M EN (este repo, ExecuTorch WebGPU) | 31 M (sin tokenizador) | 512 posiciones | ExecuTorch `.pte` + runtime WASM/WebGPU | Apache-2.0 | sí, nativa vía WebGPU |
| gradium/phonon-31m-en (original) | 31 M (sin tokenizador) | no disponible | checkpoint PyTorch | Apache-2.0 | no disponible en la información |
| Kokoro-82M | 82 M | no disponible | ONNX / PyTorch | Apache-2.0 | no de forma nativa; requiere port a WASM/WebGPU |
| Piper (VITS) | no disponible (varía por voz) | no disponible | ONNX | MIT | sí, mediante builds WASM de terceros |

Nota: los datos de Kokoro-82M y Piper proceden de conocimiento general sobre el ecosistema TTS y no de la información proporcionada en esta búsqueda; conviene verificarlos antes de citarlos. Las cifras del modelo original y de esta conversión sí provienen de la model card.

## Limitaciones y advertencias

- Solo inglés: el texto en otros idiomas se pronuncia con reglas inglesas, lo que produce errores sistemáticos de pronunciación.
- Sin normalización de texto: números, moneda, fechas y direcciones de correo deben normalizarse en la aplicación; el runtime oficial lo hace fuera del modelo.
- Prosodia limitada en entradas largas: el texto se sintetiza frase a frase, por lo que la entonación no se mantiene a lo largo del discurso.
- Contexto de 512 posiciones, que acota conjuntamente prompt de voz, texto y tramas de audio y limita la longitud de cada segmento.
- Riesgo de alucinación y artefactos de audio: no hay evaluación de calidad publicada; la paridad con el modelo CPU no garantiza naturalidad ni inteligibilidad en todos los textos.
- Restricciones éticas explícitas del autor: no suplantar a personas reales, no engañar al oyente sobre quién habla y no clonar voces sin consentimiento del hablante; debe señalarse que la voz es sintética cuando sea relevante.
- Licencia Apache-2.0: permite uso comercial, pero al ser una obra derivada deben conservarse los avisos de licencia y atribución del modelo upstream y de las voces de `gradium/phonon-voices`.
- Dependencia de WebGPU: sin WebGPU habilitado el modelo no se ejecuta; la disponibilidad y el rendimiento varían notablemente entre navegadores, sistemas y controladores.
- Madurez del artefacto: repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado el 28 de octubre de 2026; la validación comunitaria es nula.
- No es un modelo de lenguaje: no admite instrucciones, tool calling ni razonamiento; cualquier uso conversacional exige un LLM separado que genere el texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/executorch-community/Phonon-31M-EN-ExecuTorch-WebGPU
- Modelo base original: https://huggingface.co/gradium/phonon-31m-en
- Repositorio de voces citado en la model card: https://huggingface.co/gradium/phonon-voices
- Runtime WebGPU publicado: https://huggingface.co/executorch-community/ExecuTorch-WebGPU-Runtime
- ExecuTorch WebGPU Playground (demo): https://executorch.ai/playground/
- Backend WebGPU de ExecuTorch (código): https://github.com/pytorch/executorch/tree/main/backends/webgpu
- Repositorio de ExecuTorch: https://github.com/pytorch/executorch
- Documentación de ExecuTorch: https://docs.pytorch.org/executorch/stable/index.html
- Página del proyecto ExecuTorch: https://pytorch.org/projects/executorch/
- Sitio de ExecuTorch: https://executorch.ai/
- Paquete en PyPI: https://pypi.org/project/executorch/
