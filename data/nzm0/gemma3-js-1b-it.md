# NZM0/gemma3-js-1b-it

## Resumen

`NZM0/gemma3-js-1b-it` es una redistribución de los pesos de Google Gemma 3 1B IT (modelo instructivo de 1.000 millones de parámetros) convertidos a ficheros Float32 little-endian (`.f32`) más un manifiesto JSON, pensados para el runtime de navegador independiente `gemma3-js`. No se trata de un modelo nuevo ni de un fine-tuning: es una conversión de formato de los tensores originales de `google/gemma-3-1b-it`, publicada por el desarrollador NZM0 junto al código del runtime que los consume.

El objetivo es habilitar la inferencia de Gemma 3 1B IT directamente en el navegador mediante WebGPU/WGSL nativo o TensorFlow.js/WebGL, sin backend Python. El repositorio ocupa 4,0 GB y contiene los 341 ficheros de tensores Float32 (1.301.875.840 valores), el tokenizador compatible con navegador y las carpetas `layer-*`. El runtime carga un directorio local seleccionado por el usuario, no una URL de Hugging Face.

Su relevancia es acotada pero específica: demuestra una ruta de despliegue cliente-side para un modelo de 1B con licencia Gemma, útil para prototipos de privacidad por diseño (los datos no salen del navegador). No es apto para `transformers.from_pretrained()` ni para servir en producción con vLLM o TGI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 1B IT); pesos exportados como tensores Float32 little-endian |
| Parámetros totales | 1.000 millones (1B, según el modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible; el artefacto se distribuye exclusivamente en Float32 (`.f32`), sin variantes GGUF/INT8/INT4 |
| Idiomas soportados | no disponibles en la información proporcionada |
| Licencia | Gemma Terms of Use + Gemma Prohibited Use Policy (código del runtime `gemma3-js` bajo 0BSD) |
| Formato de pesos | `.f32` por tensor + `manifest.json` + `chat-tokenizer.json` (formato propio `gemma3-js`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-3-1b-it`, un transformer decoder-only instructivo de 1B parámetros. Este repositorio no entrena ni ajusta nada: exporta los tensores del checkpoint original a ficheros Float32 little-endian por tensor, añade un manifiesto JSON y metadatos de tokenizador compatibles con navegador. El embedding de tokens atado se almacena por separado en `token-embeddings.f32` y `lm-head.f32` por compatibilidad del runtime.

El autor documenta una validación de la conversión: exportaciones independientes desde Hugging Face y Kaggle coincidieron en 341 ficheros Float32 y 1.301.875.840 valores, sin diferencias, con manifiestos JSON idénticos. Además, el runtime de navegador se comparó contra la implementación oficial en PyTorch sobre un caso límite de 520 tokens, con coincidencia de 3/3 IDs de token en decodificación greedy y un error absoluto máximo de logit seleccionado de `6.4849854e-05`. El propio autor advierte que estos resultados no certifican automáticamente los ficheros exactos subidos al repositorio, y deja como `FILL IN` la revisión inmutable del upstream, el SHA-256 del checkpoint, el commit del exportador y el commit del runtime verificado sobre este artefacto.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; esos datos corresponden a la model card de Google, no a este repositorio.

## Capacidades

- Generación de texto instructiva (hereda el comportamiento de `gemma-3-1b-it`).
- Conversación multi-turno mediante el tokenizador de chat incluido (`chat-tokenizer.json`).
- Inferencia cliente-side en navegador con WebGPU/WGSL nativo o TensorFlow.js/WebGL.
- Carga desde directorio local mediante selector de modelo del runtime `gemma3-js`.
- Tool calling / function calling: no documentado en la información disponible.
- Modo thinking, visión o audio: no documentado en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado de demos web sin backend: cargar el directorio del modelo en el runtime `gemma3-js` (`npm run serve`, `http://localhost:8000/app/`) permite ofrecer un chat de texto íntegramente en el navegador, útil para validar UX antes de invertir en infraestructura servidor.
- Privacidad por diseño en aplicaciones sensibles: al ejecutarse en el cliente, las entradas del usuario no se envían a un servidor; adecuado para experimentos con datos personales en entornos controlados, siempre que se cumplan las restricciones de la Gemma Prohibited Use Policy.
- Educación y experimentación con inferencia en WebGPU: sirve para estudiar el rendimiento de un transformer de 1B en GPU de consumo vía WebGPU, comparando la ruta WGSL nativa frente a la ruta TensorFlow.js/WebGL.
- Verificación de conversiones de formato: el par `manifest.json` + ficheros `.f32` es un caso práctico para auditar pipelines de exportación de pesos (comparación tensor a tensor, comprobación de logits frente a PyTorch).
- Asistentes de texto offline en aplicaciones de escritorio empaquetadas con navegador embebido: al no requerir URL remota, el modelo puede distribuirse junto a la aplicación y cargarse desde disco.
- Pruebas de regresión de tokenizadores: el `chat-tokenizer.json` permite validar plantillas de chat y boundaries de tokens contra la implementación oficial en un caso límite documentado de 520 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de validación numérica es la comparación del runtime contra PyTorch en un caso de 520 tokens: 3/3 IDs de token greedy coincidentes y error absoluto máximo de logit de `6.4849854e-05`.

## Requisitos de hardware

- VRAM estimada: los pesos en Float32 suman aproximadamente 4,0 GB (tamaño del repo), por lo que se necesita del orden de 4 GB o más de memoria de GPU disponible para el navegador, más overhead del runtime y del contexto.
- GPU recomendadas: no disponible en la información proporcionada; el runtime requiere soporte de WebGPU/WGSL o WebGL vía TensorFlow.js.
- GPU de consumo: no se especifica compatibilidad concreta; el requisito declarado es "soporte de GPU del navegador y memoria suficiente".
- Despliegue: exclusivamente mediante el runtime `gemma3-js` (demo estática con `npm run serve`). No soporta `transformers.from_pretrained()`, y no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| NZM0/gemma3-js-1b-it | 1B | no disponible | `.f32` + manifiesto propio | Gemma Terms of Use | Runtime de navegador `gemma3-js` |
| google/gemma-3-1b-it | 1B | no disponible en esta ficha | safetensors (upstream) | Gemma Terms of Use | transformers, ecosistema Python |
| Alternativas de 1B en navegador | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: es una conversión de formato; cualquier limitación de `google/gemma-3-1b-it` (sesgos, alucinación, cobertura idiomática) se hereda íntegramente.
- No es cargable con `transformers.from_pretrained()`; el formato `.f32` + manifiesto es específico de `gemma3-js`.
- El runtime carga únicamente un directorio local, no una URL de Hugging Face; requiere descargar los 4,0 GB completos.
- Depende de soporte de WebGPU/WGSL o WebGL en el navegador y de memoria GPU suficiente; no hay lista de GPU validadas publicada.
- La licencia Gemma Terms of Use y la Prohibited Use Policy (incluida la Sección 3.2) se aplican a los pesos y materiales del tokenizador; la licencia 0BSD cubre solo el código del runtime, no los materiales del modelo.
- El propio autor deja sin completar los campos de reproducibilidad (`FILL IN`) para revisión upstream, SHA-256 del checkpoint, commit del exportador y commit del runtime verificado sobre este artefacto; la validación descrita no certifica los ficheros exactos subidos.
- Repositorio sin descargas ni likes en el momento de la consulta y creado/actualizado el 2026-11-22; no hay evidencia de uso en producción.
- No se documentan capacidades de tool calling, agentes, visión ni audio para este artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/NZM0/gemma3-js-1b-it
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Runtime `gemma3-js`: https://github.com/NZM0/gemma3-js
- Gemma Terms of Use: https://gemma.ai/resources/terms/
- Gemma Prohibited Use Policy: https://gemma.ai/resources/prohibited-use/
