# fastforks/seedvr2-3b

## Resumen

SeedVR2 3B es un transformer de restauracion de video desarrollado por ByteDance Seed, presentado en el articulo "SeedVR2: One-Step Video Restoration via Diffusion Adversarial Post-Training" (Wang et al., 2025). El modelo aborda la restauracion de video en un solo paso mediante un esquema de difusion con entrenamiento adversario posterior, lo que reduce el coste computacional frente a los metodos de difusion iterativos tradicionales. El repositorio aqui descrito no es la publicacion oficial del modelo, sino una conversion a safetensors de los pesos originales realizada por el proyecto fastforks.

El checkpoint contiene aproximadamente 6,78 mil millones de bytes (6,32 GiB) en un unico fichero `seedvr2-3b.safetensors`, con pesos lineales y de normalizacion en bfloat16, vectores de modulacion AdaSingle en float32 y el embedding de prompt positivo almacenado bajo la clave `txt`. La licencia es Apache-2.0, heredada del repositorio original de ByteDance-Seed.

La relevancia de esta ficha radica en que documenta una conversion de pesos sin reentrenamiento, pensada para que el runtime fastforks pueda descargar y verificar el fichero por SHA-256 antes de cargarlo. No se trata de un modelo de lenguaje ni de un modelo multimodal general: es especificamente un modelo de restauracion de video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para restauracion de video (DiT), con modulacion AdaSingle y RoPE fijo |
| Parametros totales | 3B (denominacion del modelo; el fichero safetensors ocupa 6,32 GiB en bfloat16/float32 mixto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en bfloat16 y float32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`seedvr2-3b.safetensors`, 6.784.909.160 bytes, SHA-256 `61df4f7979f4a4005029dd93ee186e97397d326b81b585d4fdf445573b85f0a7`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusion (DiT) orientado a restauracion de video, con modulacion AdaSingle para el acondicionamiento por paso de difusion y buffers RoPE fijos. El modelo se entrena mediante difusion con post-entrenamiento adversario (diffusion adversarial post-training), lo que permite la restauracion en un solo paso. La conversion a safetensors conserva las mismas claves que el checkpoint original: los pesos lineales y de normalizacion se almacenan en bfloat16 (los valores que usa el autocast bf16 de upstream), los vectores shift/scale/gate de AdaSingle en float32, y se eliminan los buffers `freqs` de RoPE fijo. El embedding de prompt positivo se guarda como `txt`.

Los pesos proceden de `ByteDance-Seed/SeedVR2-3B`, en concreto del fichero `seedvr2_ema_3b.pth` (SHA-256 `6bcc5ac59447e97b100477480aebb01be2ec724c8340bb83faae21f64848604b`) y de `pos_emb.pt` (SHA-256 `fa07a14844314772266b66c3b95deb0027696d8fe7065721263db5176f45d799`). No hay reentrenamiento ni modificacion de pesos; solo conversion de formato. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Restauracion de video en un solo paso mediante difusion adversarial, segun el articulo de referencia.
- Procesamiento de video con acondicionamiento por prompt positivo (embedding almacenado como `txt`).
- Modulacion por paso de difusion mediante AdaSingle (shift, scale y gate).
- Uso de RoPE fijo para codificacion posicional.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- No se documentan modos especiales como thinking mode, audio o vision general.

## Casos de uso

- Restauracion de metraje de archivo: aplicar el modelo a videos historicos o de baja calidad para recuperar detalle y reducir artefactos de compresion, aprovechando la restauracion en un solo paso para procesar lotes grandes con menor coste que un pipeline de difusion iterativo.
- Limpieza de video comprimido para plataformas de streaming: usar el modelo como etapa de preprocesado para eliminar artefactos de bloque y banding antes de la transcodificacion, reduciendo el bitrate necesario para una calidad percibida equivalente.
- Postproduccion cinematografica: integrar el modelo en un pipeline de VFX para restaurar tomas rodadas con opticas deficientes o sensores ruidosos, con la ventaja de que el acondicionamiento por prompt permite orientar la restauracion.
- Restauracion de grabaciones de vigilancia: mejorar la legibilidad de matricula y rostros en video de baja resolucion, donde la restauracion en un solo paso facilita el procesamiento casi en tiempo real sobre GPU.
- Recuperacion de video medico o cientifico: restaurar secuencias de microscopia o imagen medica con ruido y artefactos, siempre que la aplicacion no exija garantias clinicas y se valide el resultado.
- Digitalizacion de fondos audiovisuales: procesar colecciones de video analógico digitalizado para eliminar ruido y mejorar la nitidez antes del archivado a largo plazo.
- Investigacion en difusion adversarial: usar el checkpoint convertido como referencia reproducible para experimentos de restauracion de video, con verificacion por SHA-256 del fichero de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El fichero de pesos ocupa 6,32 GiB; en bfloat16 los pesos requieren aproximadamente 6,3 GB, mas memoria para activaciones y buffers de video, que no se especifican.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamano de pesos (6,3 GB) podria caber en GPUs con 12-16 GB de VRAM, pero las activaciones de video pueden elevarlo y no hay datos oficiales.
- Opciones de despliegue: el unico mecanismo documentado es el runtime de fastforks (`fastforks download MODEL` o `hf download fastforks/seedvr2-3b seedvr2-3b.safetensors`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de restauracion de video.

## Limitaciones y advertencias

- Este repositorio no es la publicacion oficial del modelo: es una conversion de pesos realizada por fastforks, que no esta afiliado a los autores. La autoria y el copyright permanecen en ByteDance Seed.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni comportamiento en dominios especificos.
- No se documentan limitaciones de contexto ni de idioma.
- La licencia es Apache-2.0, lo que permite uso comercial, pero el texto de la licencia y el NOTICE deben conservarse segun lo exige la propia licencia.
- El modelo esta pensado especificamente para restauracion de video; no debe usarse como modelo de lenguaje ni de proposito general.
- Cualquier uso en produccion requiere validar la calidad de la restauracion en el dominio concreto, ya que no hay benchmarks publicados en la informacion disponible.
- El fichero debe verificarse contra el SHA-256 indicado antes de cargarlo; el runtime de fastforks lo hace por defecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/seedvr2-3b
- Modelo original: https://huggingface.co/ByteDance-Seed/SeedVR2-3B/tree/37255ff8cccfb01071b87f635a5948ca8d53117c
- Model card original: https://huggingface.co/ByteDance-Seed/SeedVR2-3B/blob/37255ff8cccfb01071b87f635a5948ca8d53117c/README.md
- Codigo y licencia: https://github.com/ByteDance-Seed/SeedVR/blob/e4de8c24441a67e1b7df56abea10645059bb1185/LICENSE
- Proyecto fastforks: https://github.com/kleinicke/fastforks
