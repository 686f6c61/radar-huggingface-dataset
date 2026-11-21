# Harsha001/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ROCmFPX

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ROCmFPX es una cuantizacion GGUF del modelo de vision-lenguaje y razonamiento de 9B de parametros publicado por xtools-at, que a su vez es una version "decensored" (sin entrenamiento de seguridad) del fine-tune de Jackrong sobre Qwen3.5-9B. El modelo original destila respuestas de DeepSeek-V4-Pro y esta orientado a matematicas y disciplinas STEM, manteniendo capacidades multimodales de entrada imagen-texto. Esta ficha describe la variante cuantizada distribuida por Harsha001, no el modelo base.

La aportacion concreta de este repositorio es el formato ROCmFPX, un conjunto de kernels y cuantizaciones optimizadas para hardware AMD (en particular Strix Halo), con ficheros de 8, 6 y 4 bits mas un proyector de vision F16. Segun el autor, el fichero de 8 bits queda mas cerca del BF16 que un Q8_0 estandar y ocupa menos espacio, mientras que el de 4 bits esta disenado para velocidad en Strix Halo. El repositorio suma 32,4 GB y acumula 719 descargas.

Es relevante ahora porque cubre un nicho poco atendido: inferencia de un modelo multimodal de 9B en GPUs integradas AMD mediante un fork especifico de llama.cpp, con metricas de divergencia KL publicadas frente a BF16. La contrapartida es que estos ficheros no funcionan con llama.cpp, LM Studio, Ollama ni versiones antiguas de ROCmFPX, y que el autor reconoce no haberlos probado todavia en hardware AMD real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B), vision-lenguaje, con cabeza de prediccion multi-token (MTP) de una capa |
| Parametros totales | 9.197.094.144 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 ROCmFPX (8 bits), Q6_K ROCmFPX (6 bits), ROCmFP4-FAST 4 bits para Strix (O8), proyector de vision F16 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (variantes ROCmFPX), proyector mmproj en GGUF F16 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso derivado de Qwen3.5-9B, adaptado por Jackrong mediante destilacion de respuestas de DeepSeek-V4-Pro con enfasis en matematicas y STEM. xtools-at aplico despues el proceso Heretic para eliminar el comportamiento de rechazo, dando lugar a la variante "uncensored". La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible.

La innovacion tecnica documentada en este repositorio es la cuantizacion ROCmFPX: kernels propios para AMD que producen ficheros con menor divergencia KL que las cuantizaciones estandar de llama.cpp al mismo tamano. El autor reporta KL de 0,00018 y 99,3 % de coincidencia en el token superior para el fichero de 8 bits (frente a 0,00026 y 99,2 % del Q8_0 estandar, con menor tamano: 9,6 GB frente a 9,9 GB). En 6 bits, el resultado es practicamente identico al Q6_K estandar (0,0020 frente a 0,0019). Las mediciones se hicieron con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 en una GPU NVIDIA GB10, expandiendo cada fichero a F16. Los pesos incluyen la cabeza MTP de una capa, que el autor no ha probado.

## Capacidades

- Generacion de texto y razonamiento con bloque de pensamiento (thinking) previo a la respuesta, segun las pruebas del autor.
- Razonamiento matematico y STEM, herencia directa del fine-tune de Jackrong destilado de DeepSeek-V4-Pro.
- Vision-lenguaje: procesa imagenes mediante el proyector `mmproj` F16; el autor verifico la descripcion correcta de una figura de zorro y de un casco de bicicleta.
- Multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento sin rechazo: 0 rechazos en 10 peticiones que un modelo con entrenamiento de seguridad rechazaria y 0 en 8 preguntas inofensivas de apariencia arriesgada, tanto en los ficheros cuantizados como en el BF16 de origen.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos AMD Strix Halo: el fichero de 4 bits (6,8 GB) esta disenado especificamente para velocidad en esta plataforma, usando los kernels ROCmFP4-FAST con atencion y salida en 8 bits, lo que permite ejecutar un modelo de 9B multimodal en una GPU integrada.
- Analisis de imagenes en local: con el proyector `mmproj` F16, el modelo describe y razona sobre imagenes sin enviar datos a servicios externos, util para entornos con requisitos de privacidad.
- Prototipado de razonamiento STEM: el modelo base esta destilado de DeepSeek-V4-Pro en matematicas y disciplinas cientificas, por lo que sirve para experimentar con cadenas de razonamiento en esos dominios antes de escalar a modelos mayores.
- Evaluacion de cuantizaciones: los ficheros incluyen metricas de KL y coincidencia de token superior frente a BF16, lo que los hace utiles como banco de pruebas para comparar ROCmFPX con Q8_0 y Q6_K estandar en tareas de perplexidad.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterated, permite estudiar el comportamiento de un modelo sin capa de rechazo en entornos controlados de evaluacion de riesgos.
- Asistencia multilingue en seis idiomas: cubre conversaciones en ingles, chino, coreano, japones, espanol y ruso, adecuado para herramientas internas de traduccion o atencion en esos mercados.
- Desarrollo sobre llama.cpp con backend AMD: el formato ROCmFPX permite integrar el modelo en pipelines propios que ya usen el fork de HarshaVardhan3002, manteniendo el resto de la pila de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de fidelidad de cuantizacion:

| Fichero | Tamano | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|
| Q8_0 ROCmFPX | 9,6 GB | 0,00018 | 99,3 % |
| Q6_K ROCmFPX (Q6_0) | 7,6 GB | 0,0020 | 97,7 % |
| Q4_0 ROCmFP4_STRIX_O8 | 6,8 GB | no medido | no medido |
| Q8_0 estandar (referencia) | 9,9 GB | 0,00026 | 99,2 % |
| Q6_K estandar (referencia) | 7,6 GB | 0,0019 | 97,8 % |
| Q4_K_M estandar (referencia) | 5,8 GB | 0,014 | 94,4 % |

Las pruebas de KL se realizaron sobre wikitext-2 en ingles general, por lo que, segun el propio autor, no dicen nada directo sobre los benchmarks STEM del modelo original.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,6 GB para el fichero de 8 bits, 7,6 GB para el de 6 bits y 6,8 GB para el de 4 bits, mas 0,9 GB del proyector de vision F16 cuando se procesan imagenes.
- Hardware objetivo: GPUs AMD, con atencion especial a Strix Halo (el fichero de 4 bits esta optimizado para esta plataforma). El autor no ha probado los ficheros en hardware AMD real y solicita reportes en la pestana Community.
- Compatibilidad: requiere ROCmFPX compilado a partir del 7 de noviembre de 2026. llama.cpp estandar, LM Studio, Ollama y versiones anteriores de ROCmFPX no cargan estos ficheros.
- GPU NVIDIA: las mediciones de KL se hicieron en una GB10, pero el autor no documenta soporte de inferencia en NVIDIA para estos ficheros.
- Opciones de despliegue: exclusivamente el fork HarshaVardhan3002/ROCmFPX de llama.cpp.
- Latencia y throughput: no disponibles; el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ROCmFPX) | 9,2B | no disponible | imagen-texto | Apache-2.0 | GGUF ROCmFPX, solo fork AMD |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,2B | no disponible | imagen-texto | Apache-2.0 | pesos originales (BF16) |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,2B | no disponible | imagen-texto | Apache-2.0 | modelo base con entrenamiento de seguridad |
| Qwen3.5-9B (base) | 9B | no disponible | texto (segun variante) | no disponible | safetensors / GGUF estandar |

Las diferencias clave entre las tres primeras filas son el entrenamiento de seguridad (eliminado en las variantes decensored) y el formato de distribucion (ROCmFPX frente a pesos originales). No se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- El entrenamiento de seguridad ha sido eliminado: el modelo puede cumplir peticiones daninas, poco eticas, ofensivas o ilegales. No debe exponerse a usuarios finales sin capas propias de moderacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; las pruebas del autor se limitan a preguntas factuales simples (capital de Francia, 17 x 23, capital de Australia).
- Las metricas de KL se midieron sobre texto general en ingles y no validan el rendimiento en matematicas ni razonamiento STEM.
- El fichero de 4 bits para Strix no tiene mediciones de KL publicadas y solo ha pasado una prueba corta de respuesta.
- La cabeza MTP de una capa esta incluida en los pesos pero no ha sido probada.
- Compatibilidad muy restringida: sin soporte en llama.cpp estandar, LM Studio, Ollama ni builds antiguas de ROCmFPX.
- No probado en hardware AMD por el autor; el rendimiento real en Strix Halo esta sin verificar.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- Soporte de tool calling y agentes no documentado.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de filtros de seguridad traslada toda la responsabilidad legal al desplegador.
- Modelo no oficial: los creditos corresponden a Jackrong, al equipo de Qwen y a xtools-at.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ROCmFPX
- Modelo base decensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo original: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
