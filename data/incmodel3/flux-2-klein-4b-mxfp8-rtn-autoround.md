# INCModel3/FLUX.2-klein-4B-MXFP8-RTN-AutoRound

## Resumen

FLUX.2-klein-4B-MXFP8-RTN-AutoRound es un artefacto de pesos cuantizados publicado por el usuario INCModel3 en HuggingFace. Se trata de una conversion a 8 bits del checkpoint FLUX.2-klein-4B, un modelo de difusion de la familia FLUX.2 de Black Forest Labs con aproximadamente 4 000 millones de parametros, orientado a la generacion y edicion de imagenes y canalizado a traves de la clase Flux2KleinPipeline de la libreria diffusers. El repositorio declara la etiqueta de pipeline image-to-image.

El interes tecnico de la publicacion reside en el formato: pesos en MXFP8 (Microscaling FP8, formato de bloque con escala compartida del Open Compute Project), obtenidos mediante cuantizacion post-entrenamiento con dos estrategias combinadas, RTN (round-to-nearest) y AutoRound. El objetivo habitual de este tipo de conversiones es reducir la huella de memoria del modelo manteniendo la fidelidad de la salida, de modo que un modelo de 4B pueda servirse en GPUs de gama media o en aceleradores con soporte nativo de formatos microscalados.

La ficha del repositorio no aporta informacion sustantiva: no declara licencia, idiomas, datos de entrenamiento ni evaluacion, y en el momento de redactar este analisis acumula 0 descargas y 0 likes, por lo que su comportamiento real no esta validado publicamente. Ademas, los 12,4 GB del repositorio son notablemente superiores a los ~4 GB esperados para pesos de 4B en FP8, lo que sugiere que el paquete incluye componentes adicionales (codificador de texto, VAE u otros) o que parte de los pesos se conserva en mayor precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con flow matching, familia FLUX.2, variante klein (inferido del nombre del repositorio; no confirmado en la informacion disponible) |
| Parametros totales | 4 000 millones (4B), segun el nombre del repositorio |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (Microscaling FP8) con RTN y AutoRound, segun el nombre del repositorio; no se especifican granularidad de bloque ni calibracion |
| Idiomas soportados | no disponible (dependera del codificador de texto, no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors, en formato diffusers |
| Pipeline declarado | image-to-image (diffusers: Flux2KleinPipeline) |
| Libreria | diffusers |
| Tamano del repositorio | 12,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del checkpoint base ni el proceso de entrenamiento. Por el nombre del modelo puede inferirse que se apoya en FLUX.2-klein, una variante de ~4B parametros de la familia FLUX.2, que emplea un transformer de difusion con formulacion de flow matching y un esquema de destilacion para inferencia en pocos pasos; sin embargo, ni el tipo de destilacion, ni el numero de pasos, ni la resolucion nativa se confirman en la informacion disponible. Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de tecnicas de alineacion (RLHF, DPO u otras).

Lo que si puede afirmarse es la naturaleza de este repositorio concreto: no es un entrenamiento, sino una cuantizacion post-entrenamiento (PTQ) de un checkpoint preexistente. Se combinan dos metodos de asignacion de valores: RTN, que redondea cada peso al nivel mas cercano del formato destino sin optimizacion, y AutoRound, un algoritmo de PTQ que ajusta los parametros de redondeo mediante descenso de gradiente sobre una funcion de signo, buscando minimizar el error de reconstruccion de las activaciones. MXFP8 define bloques de 32 valores con un exponente de escala compartido (E8M0) y mantisa de 8 bits, un formato con soporte nativo en aceleradores recientes. No se publican curvas de calibracion, ni el conjunto de datos usado para AutoRound, ni metricas de degradacion respecto al checkpoint en bf16.

## Capacidades

- Generacion y edicion de imagenes condicionadas por una imagen de entrada, segun la etiqueta image-to-image declarada en el repositorio. No se confirman capacidades de texto a imagen, edicion multi-referencia ni renderizado de texto.
- Inferencia en 8 bits: los pesos estan almacenados en MXFP8, lo que reduce el ancho de banda de memoria frente a bf16/fp16.
- Compatibilidad con diffusers: el repositorio declara Flux2KleinPipeline como clase de carga, lo que permite integrarlo en flujos de trabajo basados en esa libreria.
- Pesos en safetensors, formato estandar de HuggingFace, cargable sin ejecucion de codigo arbitrario.
- Tool calling / function calling: no aplica, se trata de un modelo de difusion y no de un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no disponible / no aplica.
- Capacidades multilingues: no disponible; la comprension del prompt depende del codificador de texto, que no se detalla.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Edicion de imagenes por lotes en servidores con GPU de gama media: al almacenar los pesos en FP8, el modelo reduce el ancho de banda de memoria, lo que resulta util para pipelines de retoque, recoloreado o cambio de estilo aplicados sobre catalogos grandes de imagenes. Requiere validar previamente que la calidad se mantiene respecto al checkpoint original.
- Prototipado en estaciones de trabajo con una sola GPU consumer: un transformer de 4B en 8 bits ocupa aproximadamente 4 GB, por lo que es candidato a ejecutarse en tarjetas de 12-16 GB si el resto de componentes del pipeline (codificador de texto, VAE) caben en memoria o se descargan a CPU.
- Evaluacion comparativa de cuantizacion: el repositorio sirve como punto de comparacion frente al checkpoint FLUX.2-klein-4B en bf16, permitiendo medir la degradacion introducida por MXFP8 + AutoRound mediante LPIPS, FID o evaluacion humana sobre un conjunto fijo de pares imagen-prompt.
- Integracion en servicios de posproduccion y edicion asistida: la clase Flux2KleinPipeline permite exponer el modelo tras una API interna y aplicar transformaciones condicionadas por imagen sobre material ya generado o fotografiado.
- Generacion de variaciones de producto en comercio electronico: a partir de una fotografia de catalogo, producir variantes de fondo, iluminacion o encuadre. El atractivo es el coste por inferencia reducido, aunque no hay evidencia publicada de fidelidad en detalles finos (texto, logotipos, manos).
- Investigacion sobre formatos microscalados en difusion: el artefacto permite estudiar el soporte real de MXFP8 en distintas pilas de software (PyTorch/TorchAO, kernels de Intel o NVIDIA) y comparar rendimiento entre ejecucion nativa y emulada.
- Despliegue en aceleradores con soporte de 8 bits microscalado: entornos con hardware que implementa MXFP8 de forma nativa pueden servirlo con mayor eficiencia energetica que una version bf16, siempre que la licencia del modelo base lo permita (dato no disponible en este repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No consta ninguna evaluacion de calidad de imagen (FID, CLIP score, HPSv2, GenEval), ninguna comparacion frente al checkpoint sin cuantizar y ningun dato de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos del transformer: aproximadamente 4 GB para 4 000 millones de parametros en 8 bits (4 GB = 4e9 x 1 byte). Es una estimacion aritmetica, no un dato publicado.
- Huella total del pipeline: no disponible. El repositorio ocupa 12,4 GB, cifra muy superior a los pesos FP8 del transformer, lo que indica la presencia de componentes adicionales (codificador de texto, VAE, pesos en otra precision o duplicados). Sin conocer su desglose no puede fijarse un requisito de VRAM fiable.
- GPUs de centro de datos: no disponible. Cualquier recomendacion concreta (A100, H100, B200, Intel Gaudi) exigiria verificar antes el soporte real de MXFP8 en la version de PyTorch y en los kernels disponibles.
- GPUs consumer: candidatas plausibles por capacidad de memoria serian RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y RTX 4080/4090 24 GB, supeditadas a que el resto del pipeline quepa o pueda descargarse a CPU. No esta confirmado que estos modelos generen kernels eficientes para MXFP8; en arquitecturas anteriores a Hopper/Blackwell el formato puede emularse con penalizacion de velocidad o no estar soportado.
- Opciones de despliegue: diffusers (soporte declarado mediante Flux2KleinPipeline). Otras rutas habituales en difusion (ComfyUI, TensorRT, Optimum-Intel, TorchAO) no estan confirmadas para este repositorio.
- Descarga de componentes a CPU: la funcion de offload de diffusers puede aliviar la VRAM, pero las operaciones en 8 bits microscalado no siempre tienen implementacion en CPU, por lo que la combinacion debe validarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-MXFP8-RTN-AutoRound | 4B (FP8) | Difusion, pipeline image-to-image declarado | no disponible | HuggingFace (INCModel3), 0 descargas | Artefacto cuantizado, sin ficha tecnica |
| FLUX.2-klein-4B (sin cuantizar) | 4B | Difusion | no disponible | Publicado por Black Forest Labs (verificar en su organizacion de HuggingFace) | Referencia de calidad para medir la degradacion de la cuantizacion |
| FLUX.1-schnell | 12B | Difusion texto a imagen | Apache-2.0 | HuggingFace | Generacion en pocos pasos, uso comercial permitido |
| FLUX.1-dev | 12B | Difusion texto a imagen | FLUX.1 [dev] Non-Commercial License | HuggingFace | Uso comercial restringido; solo referencia de generacion anterior |

Los datos de FLUX.1-schnell y FLUX.1-dev proceden de conocimiento general sobre esos modelos y deben verificarse en sus fichas oficiales antes de usarse en una decision de produccion. No hay datos de rendimiento comparado disponibles para el modelo analizado.

## Limitaciones y advertencias

- Ausencia total de documentacion: el repositorio no declara licencia, por lo que no puede asumirse ningun derecho de uso comercial. La licencia del checkpoint base (FLUX.2-klein-4B) tampoco se indica y debe consultarse en su publicacion original antes de cualquier uso.
- Riesgo de degradacion por cuantizacion: MXFP8 con RTN y AutoRound es una tecnica de post-entrenamiento; sin evaluacion publicada no puede descartarse perdida de detalle fino, artefactos en texturas o deriva de color respecto al modelo en bf16.
- Riesgo de alucinacion visual: como cualquier modelo generativo de imagenes, puede producir contenido incoherente, anatomia incorrecta, texto ilegible o elementos inexistentes en la imagen de entrada.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo demografico, cultural o estetico del modelo base.
- Compatibilidad de hardware y software: el soporte efectivo de MXFP8 depende de la generacion de GPU, de la version de PyTorch y de los kernels disponibles. En hardware antiguo el formato puede no estar soportado o degradar el rendimiento.
- Ambiguedad del contenido del repositorio: 12,4 GB para un modelo de 4B en FP8 sugiere componentes no declarados o pesos duplicados. Conviene inspeccionar el indice de safetensors antes de planificar el despliegue.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes implican que no existe evidencia independiente de que los pesos carguen correctamente ni de que la salida sea utilizable.
- Idiomas: la cobertura de idiomas del prompt no esta declarada; asumir soporte multilingue seria especulativo.
- Fecha del repositorio: la marca temporal indicada (2026-09-11) procede de los metadatos de HuggingFace y conviene contrastarla con la cronologia real del lanzamiento de FLUX.2-klein.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INCModel3/FLUX.2-klein-4B-MXFP8-RTN-AutoRound
- Libreria diffusers: https://github.com/huggingface/diffusers
- Organizacion de Black Forest Labs en HuggingFace: https://huggingface.co/black-forest-labs
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, la familia FLUX.2 ni la cuantizacion MXFP8. Las referencias devueltas corresponden a foros de entidades bancarias francesas y no guardan relacion con el objeto de esta ficha.
