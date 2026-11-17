# rkcth/Wan-2.2-TI2V-5B-Radiance-BF16

## Resumen

Wan 2.2 TI2V 5B Radiance BF16 es una conversión de pesos en precisión BF16 del modelo Wan-AI/Wan2.2-TI2V-5B-Diffusers, publicada por el usuario rkcth. Se trata de un modelo de difusión para generación de vídeo a partir de texto (text-to-video) y de imagen a vídeo usando el primer fotograma como condicionamiento (first-frame image-to-video). El checkpoint resultante ocupa 21,16 GiB y se distribuye en formato propietario `.rad`, pensado para ejecutarse con el runtime Radiance, un fork mantenido por el mismo autor y orientado a hardware AMD.

La relevancia de esta publicación es fundamentalmente de infraestructura: no introduce un modelo nuevo, sino que empaqueta el modelo base de Wan en un formato consumible por Radiance sobre GPUs AMD Radeon. El autor documenta una verificación en una Radeon AI PRO R9700 y en dos R9700 en paralelo, generando clips H.264 de 49 fotogramas a 512 × 320 y 24 fps mientras se mantenían ocho flujos de texto activos. Los clips no contienen audio.

Al ser una conversión de pesos, las capacidades, la arquitectura y el entrenamiento corresponden íntegramente al modelo base Wan2.2-TI2V-5B. La licencia declarada es Apache 2.0 y el repositorio tiene 22,7 GB de tamaño total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion para generacion de video (heredada de Wan2.2-TI2V-5B-Diffusers; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible (el identificador del modelo base indica 5B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unico formato publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario del runtime Radiance); checkpoint de 21,16 GiB; repositorio de 22,7 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Wan2.2-TI2V-5B en la documentacion proporcionada: no se detalla si emplea un transformer de difusion con atencion completa, atencion lineal u otra variante, ni el numero exacto de parametros, capas o dimensiones. El identificador del modelo base sugiere un tamano de 5B parametros y una doble modalidad texto-a-video e imagen-a-video, pero estos datos no se confirman de forma explicita en la model card.

Respecto al entrenamiento, la model card de esta conversion no aporta informacion sobre volumen de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion. La unica informacion tecnica relevante es el proceso de conversion: los pesos se derivan del checkpoint fuente fijado en el commit `b8fff7315c768468a5333511427288870b2e9635` del repositorio Wan-AI/Wan2.2-TI2V-5B-Diffusers, y se empaquetan en BF16 dentro del formato `.rad` para su uso con Radiance. El autor recomienda verificar la integridad del checkpoint descargado contra el fichero `SHA256SUMS` mediante `sha256sum -c`.

## Capacidades

- Generacion de video a partir de texto (text-to-video) mediante el endpoint `POST /v1/videos`.
- Generacion de video a partir de una imagen de primer fotograma (first-frame image-to-video).
- Salida en video H.264 sin pista de audio.
- Configuracion verificada de 49 fotogramas a 512 × 320 y 24 fps.
- Soporte de procesamiento concurrente: el autor reporta generacion de video simultanea a ocho flujos de texto activos en dos GPUs R9700.
- Soporte de tensor parallelism (`tp`) configurable en el YAML de Radiance, aunque la configuracion de ejemplo usa `tp: 1`.
- Colocacion del vision tower en RAM (`vision-tower-placement: ram`), lo que reduce el consumo de VRAM a costa de memoria del sistema.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros modos especiales, dado que se trata de un modelo generativo de video.

## Casos de uso

- Prototipado de generacion de video en hardware AMD: el modelo permite validar pipelines de text-to-video sobre Radeon AI PRO R9700 usando el runtime Radiance, sin depender de CUDA.
- Generacion de clips cortos para redes sociales: con 49 fotogramas a 24 fps se obtienen aproximadamente dos segundos de video a 512 × 320, adecuados para pruebas de concepto y contenido preliminar.
- Animacion de imagenes fijas: la modalidad first-frame image-to-video permite animar ilustraciones, fotografias o renders aportando el primer fotograma como condicionamiento.
- Evaluacion comparativa de runtimes: al ser una conversion BF16 de un modelo conocido, sirve para medir throughput y latencia de Radiance frente a otras implementaciones sobre el mismo checkpoint fuente.
- Integracion en servicios con multiples peticiones concurrentes: la verificacion con ocho flujos de texto simultaneos sugiere su uso en entornos donde un servidor atiende varias solicitudes de generacion a la vez.
- Investigacion sobre difusion aplicada a video: el formato `.rad` y el codigo del fork permiten experimentar con modificaciones del runtime y del pipeline de inferencia.
- Despliegue en configuraciones multi-GPU: la opcion de tensor parallelism en la configuracion YAML habilita repartir el modelo entre varias GPUs, como en el caso verificado de dos R9700.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es cualitativo y de configuracion: generacion de clips de 49 fotogramas a 512 × 320 y 24 fps con ocho flujos de texto activos en dos Radeon AI PRO R9700, y verificacion en una unica R9700. No se indican tiempos por clip, latencia ni throughput en clips por segundo.

## Requisitos de hardware

- VRAM estimada: el checkpoint BF16 ocupa 21,16 GiB, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos en GPU; con la opcion `vision-tower-placement: ram` parte del modelo se descarga a memoria del sistema.
- GPU verificadas: Radeon AI PRO R9700 (una unidad) y dos R9700 en paralelo.
- No se documenta compatibilidad con GPUs NVIDIA (A100, H100, RTX 4090) ni con GPUs de consumo AMD; el runtime Radiance y el formato `.rad` estan orientados al ecosistema AMD segun las etiquetas del repositorio.
- Opciones de despliegue: exclusivamente el runtime Radiance, construido a partir del fork del autor (ejecutable y plugins compilados conjuntamente). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Configuracion de ejemplo en YAML: `tp: 1`, `max-num-seqs: 1`, `vision-tower-placement: ram`.
- Latencia y throughput: no disponibles de forma cuantitativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware verificado |
|---|---|---|---|---|---|
| Wan 2.2 TI2V 5B Radiance BF16 (este) | 5B (segun identificador del base) | no disponible | `.rad` (BF16) | Apache 2.0 | Radeon AI PRO R9700 |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers (base) | 5B (segun identificador) | no disponible | Diffusers (safetensors) | no disponible en la informacion proporcionada | no disponible |
| Otros modelos text-to-video de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion posible con la informacion disponible es frente al checkpoint fuente del que deriva. No se dispone de datos de benchmarks ni de otros modelos comparables para establecer diferencias de rendimiento.

## Limitaciones y advertencias

- Es una conversion de pesos, no un modelo entrenado desde cero: hereda integramente los sesgos y limitaciones del modelo base Wan2.2-TI2V-5B, que no se documentan en la informacion proporcionada.
- Riesgo de alucinacion visual y artefactos propios de los modelos de difusion de video; no se aportan metricas de calidad objetiva.
- El repositorio no registra descargas ni likes, y el autor es un particular (rkcth), no el equipo de Wan-AI; conviene tratar la conversion como no oficial.
- El formato `.rad` es propietario del runtime Radiance: no es directamente cargable con Diffusers, ComfyUI u otras herramientas habituales sin conversion adicional.
- Dependencia estricta del fork de Radiance del autor; cambios en el runtime pueden romper la compatibilidad del checkpoint.
- La configuracion de ejemplo limita `max-num-seqs: 1`, lo que restringe la concurrencia por instancia.
- Los videos generados no incluyen audio.
- No se especifican los idiomas soportados para los prompts de texto.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribucion indicada en los ficheros `LICENSE` y `NOTICE` del repositorio.
- El checkpoint debe verificarse con `SHA256SUMS` antes de su uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rkcth/Wan-2.2-TI2V-5B-Radiance-BF16
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Commit fuente fijado: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers/tree/b8fff7315c768468a5333511427288870b2e9635
- Fork de Radiance: https://github.com/rkcth/radiance
- Notas de cualificacion de Wan: https://github.com/rkcth/radiance/blob/main/docs/WAN-PORT.md
