# Sido/hina-gemma4-e4b-aggressive-litert

## Resumen

Hina-gemma4-e4b-aggressive-litert es una conversión experimental del modelo Gemma 4 E4B, en su variante "Uncensored Aggressive" de HauhauCS, a formato LiteRT-LM para su ejecución en navegador mediante WebGPU. El autor, Sido, parte del GGUF Q4_K_M del modelo afinado y lo reempaqueta combinando los pesos de texto dequantizados a FP16 con los pesos no textuales y metadatos del modelo base oficial google/gemma-4-E4B-it. El resultado es un único fichero `.litertlm` de 4,58 GB que puede cargarse desde JavaScript con `@litert-lm/core`.

El interés de esta ficha es acotado: no se trata de un modelo nuevo ni de un afinado adicional, sino de un artefacto de despliegue orientado a prototipos web. La conversión no es bit-idéntica al GGUF de origen, ya que la dequantización y la recuantización con `dynamic_wi4b32_afp32` pueden alterar el comportamiento y la calidad del modelo. La validación publicada se limita a una prueba de humo textual en japonés sobre Chrome 156 con WebGPU en un Apple M4.

La relevancia práctica es doble: por un lado, demuestra la viabilidad de llevar un modelo de la familia Gemma 4 (4B efectivos, contexto de 4.096 tokens en esta exportación) a un navegador sin backend de inferencia dedicado; por otro, la variante "aggressive" está diseñada para reducir rechazos, lo que introduce consideraciones de seguridad y licencia que deben evaluarse antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), pesos en LiteRT-LM |
| Parametros totales | no disponible (modelo base etiquetado E4B, 4B efectivos) |
| Parametros activos | no disponible (la nomenclatura E4B sugiere 4B efectivos; no se detalla en la informacion disponible) |
| Longitud de contexto | 4.096 tokens (cache configurada en la exportacion) |
| Tipos de cuantizacion | `dynamic_wi4b32_afp32` (LiteRT Torch 0.10); pesos principales externalizados en el bundle |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | gemma (la model card del base oficial indica Apache-2.0; ver advertencias) |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, no GGUF) |

## Arquitectura y entrenamiento

El artefacto deriva de google/gemma-4-E4B-it, un transformer decoder-only de la familia Gemma 4 con 4B parametros efectivos segun la nomenclatura E4B. Sobre esa base, HauhauCS publico una variante "Uncensored Aggressive" afinada para reducir rechazos, distribuida como GGUF Q4_K_M de 5.335.285.728 bytes (SHA-256 `d0027dd3...b56e96`). Sido toma ese GGUF en la revision `45b6a334...`, dequantiza los pesos de texto a FP16 y los combina con los pesos no textuales y metadatos del modelo oficial en la revision `ee0ef602...`.

La conversion pasa por LiteRT Torch 0.10, que recuantiza con `dynamic_wi4b32_afp32`, convierte tensores y constantes BF16 a FP16 para el runtime WebGPU, ajusta las salidas del embedder por capa a FLOAT32 y externaliza los pesos principales dentro del bundle. La configuracion exportada fija una cache de 4.096 tokens y una longitud de prefill de 128. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si hubo RLHF o DPO en el modelo base o en el afinado; la model card no los detalla. La innovacion tecnica relevante es el propio pipeline de conversion a LiteRT-LM con pesos externalizados, pensado para streaming de pesos en el navegador.

## Capacidades

- Generacion de texto conversacional en japones e ingles, segun los idiomas declarados.
- Razonamiento y respuesta a instrucciones heredados del modelo base Gemma 4 E4B-it.
- Variante "aggressive" orientada a reducir rechazos y respuestas evasivas.
- Ejecucion en navegador mediante WebGPU con la libreria `@litert-lm/core`.
- Gestion de conversaciones multi-turno mediante la API de Engine (creacion, borrado y liberacion de conversaciones).
- Capacidades multimodales: no disponibles en esta conversion; la validacion realizada fue exclusivamente textual.
- Tool calling, function calling y razonamiento multi-paso: no documentados en la informacion disponible para esta exportacion.

## Casos de uso

- Prototipado de asistentes conversacionales en el navegador: el bundle se carga con `@litert-lm/core` y permite mantener una conversacion de dos turnos con contexto de 4.096 tokens sin backend, util para demos y pruebas de concepto.
- Evaluacion de WebGPU como plataforma de inferencia: sirve para medir carga de pesos externalizados, gestion de cache KV y estabilidad del runtime en Chrome sobre hardware Apple Silicon.
- Aplicaciones de escritorio o web con requisitos de privacidad: al ejecutarse en local, los prompts no salen del dispositivo, lo que encaja en escenarios donde no se puede enviar texto a un servidor.
- Investigacion sobre conversiones LiteRT-LM: el artefacto documenta un pipeline reproducible (dequantizacion, recuantizacion, conversion BF16 a FP16, externalizacion de pesos) util para estudiar la perdida de calidad en el proceso.
- Pruebas de comportamiento de variantes sin censura: permite comparar en local la tasa de rechazos de la variante aggressive frente al modelo base, siempre con las cautelas de seguridad correspondientes.
- Educacion y divulgacion: demostrar en un articulo o taller como un modelo de 4B efectivos puede ejecutarse en un navegador moderno con WebGPU y un fichero de menos de 5 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion descrita es una prueba de humo textual de dos turnos en japones sobre Chrome 156, Apple M4 con 32 GB y WebGPU, con `@litert-lm/core` 0.19.0. Los logs del runtime mostraron avisos de streaming de pesos externalizados y de buffers de cache KV. No se aportan cifras de latencia, throughput ni calidad.

## Requisitos de hardware

- VRAM/espacio: el fichero `.litertlm` ocupa 4.584.066.896 bytes (4,58 GB); se recomienda al menos 8 GB de memoria unificada o VRAM libre para cargar pesos y cache.
- Hardware validado: Apple M4 con 32 GB y WebGPU en Chrome 156. No hay validacion publicada en otras GPU.
- GPU de escritorio: no disponible; no se documenta compatibilidad con A100, H100 ni RTX 4090.
- GPU de consumo: previsiblemente viable en GPUs con WebGPU y 8 GB o mas de memoria, pero sin confirmacion del autor.
- Despliegue: exclusivamente mediante LiteRT-LM (`@litert-lm/core` 0.19.0) en navegador con WebGPU. No es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un GGUF ni un formato de esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sido/hina-gemma4-e4b-aggressive-litert | 4B efectivos (E4B) | 4.096 | LiteRT-LM | gemma | HuggingFace, experimental |
| google/gemma-4-E4B-it | 4B efectivos (E4B) | no disponible en la informacion | safetensors / GGUF (segun publicacion oficial) | Apache-2.0 segun model card oficial | HuggingFace |
| HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | 4B efectivos (E4B) | no disponible | GGUF Q4_K_M | gemma | HuggingFace |

La comparativa se limita a los tres artefactos implicados en la cadena de derivacion, ya que no se dispone de datos de rendimiento para contrastar con alternativas de la misma categoria. No se dispone de informacion sobre otros modelos comparables en la busqueda realizada.

## Limitaciones y advertencias

- La conversion no es bit-identica al GGUF de origen; la dequantizacion y recuantizacion pueden degradar la calidad y alterar el comportamiento.
- La validacion publicada es una unica prueba de humo textual de dos turnos en japones; no se han evaluado conversaciones largas, uso multimodal, estabilidad a largo plazo ni otros navegadores o hardware.
- La variante "aggressive" esta disenada para reducir rechazos, lo que incrementa el riesgo de contenido inapropiado o danino; su comportamiento tras la conversion no ha sido evaluado de forma independiente.
- Riesgo de alucinacion inherente a los modelos de 4B efectivos, agravado por la recuantizacion.
- Contexto limitado a 4.096 tokens en esta exportacion, inferior al que puede ofrecer el modelo base.
- Idiomas limitados a japones e ingles; el castellano no esta declarado como soportado.
- Licencia ambigua: la model card declara `gemma`, mientras que la del base oficial indica Apache-2.0; es necesario consultar los terminos de Google para Gemma 4 y las cards upstream antes de cualquier uso comercial.
- Dependencia de WebGPU y de Chrome 156 con `@litert-lm/core` 0.19.0; no hay soporte documentado para otros runtimes.
- Los logs del runtime mostraron avisos de streaming de pesos externalizados y de buffers de cache KV, lo que sugiere posibles problemas de memoria en dispositivos con poca RAM.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopcion nula y ausencia de validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sido/hina-gemma4-e4b-aggressive-litert
- Modelo base afinado: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Modelo base oficial: https://huggingface.co/google/gemma-4-E4B-it
- Model card del base oficial: https://huggingface.co/google/gemma-4-E4B-it/blob/ee0ef6023621cff504d758262d4e04895a5af4a2/README.md
- Licencia Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
