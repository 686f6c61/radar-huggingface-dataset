# lumorayt/futuro-orion-gemma-4-E2B-it-GGUF

## Resumen

Futuro Orion — Gemma 4 E2B IT es una redistribución del modelo Gemma 4 E2B IT de Google DeepMind, publicada por el usuario lumorayt para su uso en inferencia local desde navegador. No se trata de un modelo nuevo ni de una conversión propia: el autor ha tomado el GGUF oficial Q4_0 generado por el proyecto ggml-org/llama.cpp y lo ha dividido en dos fragmentos con la herramienta oficial `llama-gguf-split`, de modo que cada shard quede por debajo de 2 GB y pueda cargarse en un runtime WASM (Wllama 3.13.0) dentro de un navegador.

El modelo base es un transformer de Google con 4.628.569.635 parámetros totales según los safetensors del repositorio, aunque la nomenclatura "E2B" sugiere una variante eficiente dentro de la familia Gemma 4. El repositorio redistribuye únicamente los pesos en cuantización Q4_0 (2.841.481.408 bytes en total) y declara explícitamente que no incluye el proyector multimodal, por lo que esta release es solo texto: no admite visión ni audio.

La relevancia de esta ficha es doble: por un lado documenta un caso práctico de despliegue de un LLM en navegador mediante Wllama y shards GGUF; por otro, sirve como ejemplo de redistribución de pesos de terceros con verificación criptográfica de la integridad del split. La licencia declarada por el autor es Apache 2.0, heredada del modelo Gemma 4 original según la model card, aunque el campo de licencia del repositorio en Hugging Face figura como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B); detalles internos no disponibles |
| Parámetros totales | 4.628.569.635 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (configuración recomendada por el autor para Wllama; contexto nativo del modelo base no disponible) |
| Tipos de cuantización | Q4_0 (única incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 según la model card; campo de licencia del repo en Hugging Face: no disponible |
| Formato de pesos | GGUF dividido en 2 shards (`-00001-of-00002.gguf`, `-00002-of-00002.gguf`) |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre la arquitectura interna del modelo base más allá de su pertenencia a la familia Gemma 4 de Google DeepMind. No se detallan el número de capas, la dimensión oculta, el mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo etapas de RLHF o DPO.

Lo que sí está documentado con precisión es el proceso de empaquetado: se parte del fichero `gemma-4-E2B-it-Q4_0.gguf` publicado por ggml-org en la revisión `63f6c6f23b3e9e5f9737708daec2f88c9ac2e921`, con SHA-256 `8e30dff3ac4c8434c49a7036fa15564bdbb6044e42bf04550bf1a096ad7e6a52`, y se divide con `llama-gguf-split` 0.9.0-dev (build 12211, commit `7d7f02875`) usando `--split-max-size 1500M`. El autor verifica que los 541 tensores coinciden en número y orden entre el original y la reconstrucción, y que el SHA-256 concatenado de los datos de los tensores es idéntico (`309c76cc7f2860eebfade298b3f67dac00f7764b200c0ca162efa1c9fd9818a9`). La única diferencia al re-fusionar es un incremento de 96 bytes en la cabecera KV del GGUF por las claves de contabilidad del propio split (`split.count`, `split.no`, `split.tensors.count`).

## Capacidades

- Generación de texto conversacional: el sufijo "IT" del modelo base indica ajuste para instrucciones y diálogo.
- Inferencia local en navegador mediante Wllama 3.13.0 sobre WebAssembly, o en escritorio con llama.cpp.
- Carga por shards: el runtime descubre automáticamente el segundo fragmento a partir del patrón de nombres `-NNNNN-of-NNNNN.gguf`.
- Contexto configurable hasta 4.096 tokens en la configuración recomendada por el autor (`n_ctx: 4096`, `n_batch: 128`, `n_threads: 4`, `n_gpu_layers: 0`).
- Compatibilidad con endpoints según los tags del repositorio (`endpoints_compatible`).
- Capacidades multimodales (visión, audio): no soportadas en esta release, ya que el proyector `mmproj-gemma-4-E2B-it-Q8_0.gguf` se excluye deliberadamente.
- Tool calling, function calling, modo thinking o razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional embebido en una aplicación web: el modelo se carga con Wllama desde el navegador y responde sin enviar datos a un servidor, lo que resulta adecuado para demos de privacidad y para entornos con conectividad limitada.
- Chat local de escritorio con llama.cpp: mediante `llama-cli -m gemma-4-E2B-it-Q4_0-00001-of-00002.gguf -c 4096 -p "Hello"` se obtiene un asistente de texto funcional en CPU, sin GPU dedicada.
- Prototipado de producto en la app Lumora Futuro: el autor declara que estos pesos son los que usa su aplicación, por lo que sirven como referencia para replicar el mismo stack (Wllama + shards GGUF + caché del navegador).
- Evaluación de viabilidad de LLM en cliente: con 2,8 GB de almacenamiento local y varios GB de RAM libre, el modelo permite medir latencia y calidad en portátiles de 8 GB antes de invertir en infraestructura de servidor.
- Educación y experimentación: al ser una release solo texto y con instrucciones de carga reproducibles, es útil para talleres sobre cuantización GGUF, sharding y runtimes WASM.
- Verificación de integridad de artefactos: los SHA-256 por fichero y por datos de tensores permiten practicar pipelines de validación de pesos redistribuidos en entornos con requisitos de cadena de custodia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración recomendada, que usa CPU (`n_gpu_layers: 0`); en GPU, la cuantización Q4_0 de ~2,84 GB requeriría aproximadamente 3-4 GB de VRAM contando overhead de contexto y buffers.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con 4 GB o más de VRAM podría alojar los pesos Q4_0, aunque no se han publicado pruebas.
- ¿Cabe en GPU de consumo? Probablemente sí en modelos con 4 GB o más de VRAM, pero el autor no aporta mediciones; la referencia oficial es ejecución en CPU.
- Almacenamiento: 2,8 GB de caché local para el modelo (2.841.481.408 bytes exactos).
- RAM: "varios GB" de memoria libre según el autor; se indica que funciona en un portátil de 8 GB sobre CPU.
- Opciones de despliegue: Wllama 3.13.0 (WASM en navegador), llama.cpp (`llama-cli`), y por extensión cualquier runtime compatible con GGUF que soporte shards.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización incluida | Licencia | Formato |
|---|---|---|---|---|---|
| Futuro Orion — Gemma 4 E2B IT (este repo) | 4.628.569.635 | 4.096 (recomendado) | Q4_0 | Apache 2.0 según model card | GGUF en 2 shards |
| google/gemma-4-E2B-it (modelo base) | 4.628.569.635 (según safetensors del repo) | no disponible | no aplica (pesos originales) | Apache 2.0 según model card | safetensors |
| ggml-org/gemma-4-E2B-it-GGUF (conversión oficial) | 4.628.569.635 | no disponible | múltiples, incluida Q4_0 | Apache 2.0 según model card | GGUF (fichero único) |

La diferencia práctica frente a las dos alternativas es el empaquetado: el modelo base ofrece pesos sin cuantizar para fine-tuning o conversión propia, y la conversión de ggml-org ofrece el GGUF completo en un solo fichero, mientras que este repositorio solo aporta la variante Q4_0 troceada para navegador. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Release solo texto: el proyector multimodal no está incluido, por lo que no admite entradas de imagen ni audio.
- Cuantización única Q4_0: no hay alternativas Q5, Q8 o de mayor precisión en este repositorio; para otras cuantizaciones hay que acudir a la conversión de ggml-org.
- Contexto conservador de 4.096 tokens: el autor lo describe como una elección deliberada para navegador, no como el máximo del modelo base, que no se documenta.
- Idiomas soportados no disponibles: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluación propia.
- Licencia: la model card afirma Apache 2.0, pero el campo de licencia del repositorio en Hugging Face figura como no disponible; conviene verificar los términos del modelo Gemma 4 original antes de uso comercial.
- Redistribución no afiliada a Google: el autor declara explícitamente que los ficheros no están afiliados ni respaldados por Google, lo que limita cualquier garantía de soporte.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse con pruebas propias antes de producción.
- Dependencia de la herramienta de split: la re-fusión con `llama-gguf-split --merge` produce un fichero 96 bytes mayor por metadatos, por lo que las comprobaciones de hash a nivel de fichero fallarán aunque los tensores sean idénticos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de terceros sobre su funcionamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lumorayt/futuro-orion-gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Conversión GGUF oficial: https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF
- Aplicación del autor: https://futuro.freebuff.page
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
