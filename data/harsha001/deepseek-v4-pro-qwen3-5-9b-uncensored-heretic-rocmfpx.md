# Harsha001/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ROCmFPX

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ROCmFPX es una cuantizacion en formato GGUF publicada por el usuario Harsha001 sobre el modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, que a su vez es una version "decensored" (mediante el proceso Heretic) del modelo original de Jackrong `DeepSeek-V4-Pro-Qwen3.5-9B`. El modelo base es un fine-tune de Qwen3.5-9B destilado a partir de respuestas de DeepSeek-V4-Pro, orientado a matematicas y disciplinas STEM, con capacidad vision-language (pipeline `image-text-to-text`) y razonamiento.

Este repositorio no introduce pesos nuevos: su aportacion es la cuantizacion con un formato propietario denominado ROCmFPX, orientado a hardware AMD (ROCm, Vulkan, Strix Halo). Se publican dos archivos de pesos (Q8_0 ROCmFPX de 9,6 GB y Q6_K estandar de 7,6 GB) mas un proyector visual F16 de 0,9 GB necesario para procesar imagenes. Segun el autor, el archivo de 8 bits ROCmFPX queda mas cerca del BF16 original (KL 0,00018) que un Q8_0 estandar (KL 0,00026) y ocupa menos espacio.

La relevancia es doble: por un lado, ofrece una via de despliegue cuantizado de un modelo de razonamiento y vision de 9B en GPUs de consumo y en plataformas AMD; por otro, incorpora la advertencia explicita de que el entrenamiento de seguridad ha sido eliminado, lo que lo hace inadecuado para exposicion directa a usuarios finales sin capas de moderacion propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-9B) con cabeza de prediccion multi-token (MTP) de una capa; vision-language con proyector multimodal |
| Parametros totales | 9B (aproximado, segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 ROCmFPX (9,6 GB), Q6_K estandar (7,6 GB); proyector visual en F16 (0,9 GB) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con variante ROCmFPX para el archivo de 8 bits) |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Qwen3.5-9B destilado a partir de respuestas de DeepSeek-V4-Pro, con enfasis declarado en matematicas y STEM. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original. La variante "heretic" elimina el comportamiento de rechazo mediante el proceso Heretic, y la model card confirma con una prueba reducida (0 de 10 peticiones tipicamente rechazadas y 0 de 8 preguntas inofensivas con apariencia arriesgada) que la cuantizacion no reintroduce rechazos.

La innovacion tecnica de este repositorio es la cuantizacion ROCmFPX. Segun las mediciones del autor con `llama-perplexity --kl-divergence` frente a un GGUF BF16 (perplejidad 7,13), sobre 40 fragmentos de 512 tokens de wikitext-2 y en una GPU NVIDIA GB10 tras expandir cada archivo a F16, el Q8_0 ROCmFPX obtiene KL 0,00018 y 99,3 % de coincidencia en el token superior, frente a KL 0,00026 y 99,2 % del Q8_0 estandar. En 6 bits, el tipo estandar resulto ligeramente mejor que ROCmFPX al mismo tamano (KL 0,0019 frente a 0,0020), por lo que se publica el Q6_K convencional. Los archivos incluyen la cabeza MTP de una capa, que el autor indica que no fue probada.

## Capacidades

- Generacion de texto y razonamiento con bloque de pensamiento previo a la respuesta (thinking block), verificado en las pruebas del autor.
- Razonamiento matematico y STEM: el modelo base esta destilado y ajustado especificamente en esta area; las pruebas cortas confirman respuestas correctas a operaciones como 17 x 23 = 391.
- Vision-language: procesa imagenes mediante el proyector `mmproj` en F16; el autor verifico la descripcion correcta de una figura de zorro y de un casco de bicicleta.
- Multilingue: ingles, chino, coreano, japones, espanol y ruso.
- Prediccion multi-token (MTP): los archivos incluyen la cabeza de una capa, aunque no fue validada.
- Comportamiento sin rechazos (abliterated/uncensored): responde a peticiones que un modelo con entrenamiento de seguridad rechazaria.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de algebra y aritmetica paso a paso gracias a su bloque de pensamiento y a su ajuste especifico en STEM; util en herramientas de tutoria o verificacion de calculos.
- Analisis de imagenes tecnicas: con el proyector `mmproj` cargado, puede describir figuras, diagramas o fotografias; adecuado para prototipos de inspeccion visual o catalogacion de imagenes.
- Despliegue en hardware AMD: el archivo Q8_0 ROCmFPX esta pensado para ROCmFPX sobre GPUs AMD (incluido Strix Halo) y Vulkan, lo que permite ejecutar un modelo de 9B con vision en equipos que no disponen de CUDA.
- Entornos de investigacion sobre alineacion y seguridad: al carecer de entrenamiento de rechazo, sirve para estudiar comportamientos sin filtros y para comparar con variantes safety-trained del mismo modelo base.
- Procesamiento multilingue en seis idiomas: traduccion, resumen o generacion en en, zh, ko, ja, es y ru dentro de una misma aplicacion.
- Generacion de contenido creativo sin restricciones: escritura de ficcion o guiones donde el modelo base con alineacion rechazaria ciertos temas; requiere revision humana posterior.
- Evaluacion de cuantizacion: los datos de KL y coincidencia de token publicados permiten usar estos archivos como referencia para medir el impacto de ROCmFPX frente a tipos estandar de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente metricas de fidelidad de cuantizacion (KL frente a BF16 y porcentaje de coincidencia en el token superior sobre wikitext-2), que no son benchmarks de capacidad:

| Archivo | Tamano | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|
| Q8_0 ROCmFPX | 9,6 GB | 0,00018 | 99,3 % |
| Q6_K estandar | 7,6 GB | 0,0019 | 97,8 % |
| Q8_0 estandar (referencia) | 9,9 GB | 0,00026 | 99,2 % |
| Q6 ROCmFPX (referencia) | 7,6 GB | 0,0020 | 97,7 % |
| Q4_K_M estandar (referencia) | 5,8 GB | 0,014 | 94,4 % |

## Requisitos de hardware

- VRAM estimada: el Q8_0 ROCmFPX ocupa 9,6 GB y el Q6_K 7,6 GB; sumando el proyector visual F16 (0,9 GB) y el contexto, se recomienda al menos 12-16 GB de VRAM para el archivo de 8 bits y 10-12 GB para el de 6 bits.
- GPUs AMD: el archivo de 8 bits requiere ROCmFPX compilado a partir del 7 de noviembre de 2026 o posterior; segun el autor, esta orientado a ROCm, Vulkan y Strix Halo, aunque los archivos no han sido probados en hardware AMD.
- GPUs NVIDIA: las mediciones de cuantizacion se realizaron en una GB10; un Q6_K estandar puede ejecutarse con llama.cpp en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPU de consumo: el Q6_K (7,6 GB) cabe en GPUs de 12 GB o mas; el Q8_0 ROCmFPX requiere 12-16 GB.
- Opciones de despliegue: llama.cpp y su fork ROCmFPX para el archivo de 8 bits; llama.cpp estandar, LM Studio u Ollama solo para el Q6_K. El autor advierte que llama.cpp estandar, LM Studio, Ollama y versiones antiguas de ROCmFPX no cargaran el archivo Q8_0 ROCmFPX.
- Latencia y throughput: no disponibles; el autor solicita a la comunidad que reporte velocidad en hardware AMD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Q8_0 ROCmFPX) | 9B | no disponible | Si (mmproj) | Apache-2.0 | GGUF, requiere ROCmFPX reciente |
| Qwen3.5-9B (base) | 9B | no disponible | no disponible | no disponible | Pesos originales |
| DeepSeek-V4-Pro-Qwen3.5-9B (Jackrong) | 9B | no disponible | Si | Apache-2.0 | Hugging Face |
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (xtools-at) | 9B | no disponible | Si | Apache-2.0 | Hugging Face |

La comparativa se limita a las variantes de la misma familia, ya que la informacion disponible no incluye modelos externos comparables ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenamiento de seguridad eliminado: el proceso Heretic suprime el comportamiento de rechazo, por lo que el modelo puede cumplir peticiones daninas, poco eticas, ofensivas o ilegales. No debe exponerse a usuarios finales sin capas propias de seguridad y moderacion.
- Sin probar en hardware AMD: el autor indica explicitamente que los archivos no se han validado en AMD; el rendimiento y la calidad en ROCm o Vulkan son desconocidos.
- Dependencia de un fork: el Q8_0 ROCmFPX solo carga con ROCmFPX compilado desde el 7 de noviembre de 2026; llama.cpp estandar, LM Studio y Ollama no lo soportan.
- Cabeza MTP no validada: los archivos incluyen la cabeza de prediccion multi-token de una capa, cuyo comportamiento no fue probado.
- Metricas de cuantizacion limitadas: las pruebas de KL se hicieron sobre texto general en ingles (wikitext-2), no sobre matematicas ni razonamiento, por lo que no dicen nada directo sobre los benchmarks STEM del modelo original.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad; como todo modelo generativo, puede producir contenido incorrecto con apariencia de certeza.
- Idiomas: aunque declara seis idiomas, no hay datos sobre calidad relativa entre ellos ni sobre el contexto maximo efectivo.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad legal del uso recae en el usuario.
- Publicacion no oficial: no es un lanzamiento oficial de Jackrong ni del equipo Qwen; descargas y likes nulos en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ROCmFPX
- Modelo base (decensored): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo original: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
