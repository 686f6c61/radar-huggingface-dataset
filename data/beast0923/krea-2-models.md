# beast0923/Krea-2-Models

## Resumen

`beast0923/Krea-2-Models` es un repositorio de pesos alojado en Hugging Face que agrupa varios checkpoints derivados (fine-tunes) del modelo base `krea/Krea-2-Turbo`. El autor del repositorio es el usuario `beast0923`, y los pesos se distribuyen en formato `safetensors` con un tamano total de repositorio de 40,8 GB. La model card no describe la arquitectura del modelo base ni sus parametros; se limita a listar checkpoints y a enlazar sus fichas en CivitAI.

El contenido del repositorio esta marcado con la etiqueta `not-for-all-audiences` y, segun la propia model card, los checkpoints incluidos estan orientados a generacion de imagen y de video a partir de imagen (image-to-video) con contenido para adultos. El autor indica que retiro un Space de Hugging Face despues de que la plataforma lo desactivara por alojar un modelo ajustado y comercializado explicitamente para generacion i2v/i2i NSFW, citando el riesgo de imagenes intimes no consentidas (NCII) como motivo de la retirada.

Por tanto, se trata de un repositorio de distribucion de fine-tunes sobre un modelo base de difusion (no de un modelo de lenguaje), sin documentacion tecnica propia, sin pipeline declarado, sin licencia declarada en la ficha y sin datos de benchmarks. La relevancia actual del repositorio es limitada desde el punto de vista tecnico: su interes principal es como ejemplo de las politicas de moderacion de Hugging Face sobre modelos generativos de imagen y video con capacidades NSFW.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de difusion `krea/Krea-2-Turbo`; la model card no detalla la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica / no disponible (modelo generativo de imagen y video) |
| Tipos de cuantizacion | INT8, NVFP4, BF16 y FP8 (segun los nombres de fichero de los checkpoints) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 40,8 GB |
| Modelo base | `krea/Krea-2-Turbo` |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base `krea/Krea-2-Turbo` ni el proceso de entrenamiento de los fine-tunes. Por los nombres de los ficheros y por el contexto de la model card (generacion image-to-image e image-to-video, checkpoints en safetensors con variantes INT8, NVFP4, BF16 y FP8) cabe inferir que se trata de un modelo de difusion para generacion visual, pero no se dispone de datos sobre numero de parametros, tipo de backbone (UNet, DiT u otro), dataset de entrenamiento, numero de pasos de difusion ni tecnicas de destilado asociadas al sufijo "Turbo".

Los checkpoints listados son fine-tunes de terceros publicados originalmente en CivitAI y redistribuidos aqui: `FinePorn v4` (INT8/NVFP4/BF16/FP8), `Muse By Stable Yogi Krea2` (v2.5 EXTENDED TURBO) y `PornMaster Krea2` (v2 Turbo INT8). No se documentan hiperparametros de fine-tuning, composicion del dataset ni si hubo entrenamiento con preferencias humanas.

## Capacidades

- Generacion de imagen a partir de imagen (image-to-image) y de video a partir de imagen (image-to-video), segun la descripcion de la model card y el motivo de retirada del Space.
- Generacion de contenido para adultos (NSFW), que es la finalidad declarada de los checkpoints incluidos.
- Variantes cuantizadas a INT8, NVFP4, BF16 y FP8, pensadas para distintos niveles de VRAM y precision.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni multilingueismo; el repositorio no contiene un modelo de lenguaje.
- No se documenta soporte de audio ni de otras modalidades.

## Casos de uso

- Investigacion sobre moderacion de contenido generativo: el repositorio y la cita de la model card sirven como caso de estudio de como Hugging Face aplica sus politicas a Spaces que alojan modelos i2v con capacidades NSFW, y de que salvaguardas (deteccion de caras, filtrado de prompts, escaneo de salidas) exige la plataforma.
- Despliegue autoalojado en infraestructura propia: el autor enlaza un repositorio de GitHub (`minipasila/Krea-2-Turbo_I2I`) para ejecutar el modelo en Runpod, lo que permite a un equipo con control total de su infraestructura desplegar los pesos fuera de plataformas con moderacion.
- Evaluacion de fine-tunes de la comunidad: los checkpoints permiten comparar variantes (INT8 frente a FP8, Turbo frente a EXTENDED TURBO) sobre el mismo modelo base en tareas de generacion visual.
- Pruebas de cuantizacion: las variantes NVFP4 e INT8 permiten medir el impacto de la cuantizacion en calidad y velocidad de inferencia sobre hardware con soporte de FP4 (por ejemplo, GPUs Blackwell).
- Generacion de video a partir de imagen en flujos creativos con contenido adulto, siempre que se cumplan los requisitos legales de consentimiento y edad de las personas representadas.
- Reproduccion de pipelines i2i/i2v en entornos aislados: util para equipos que investigan la generacion de video a partir de una sola imagen y necesitan pesos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 40,8 GB, lo que sugiere que los checkpoints en BF16 requieren del orden de decenas de GB de VRAM si se cargan completos; las variantes INT8, FP8 y NVFP4 reducen ese requisito, pero no se aportan cifras.
- GPU recomendadas: no disponibles. Por el soporte de NVFP4 cabe esperar que las variantes cuantizadas en FP4 esten pensadas para GPUs Blackwell (serie RTX 50 / B200), y las variantes INT8 y FP8 para GPUs con soporte de esos formatos (Ada Lovelace, Hopper).
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano real del modelo base, que no se documenta.
- Opciones de despliegue: el autor menciona ejecucion en Runpod mediante su repositorio de GitHub; no se citan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos de generacion i2i/i2v comparables, ni parametros, contexto o benchmarks de este repositorio que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio esta etiquetado `not-for-all-audiences` y los checkpoints estan orientados a generacion NSFW; no es apto para entornos de produccion generalistas ni para audiencias no adultas.
- Riesgo de NCII: la propia Hugging Face advirtio al autor de que la combinacion de capacidades i2v con un modelo adulto sin censura presenta un riesgo alto de imagenes intimes no consentidas; el autor retiro el Space asociado.
- Ausencia de salvaguardas: segun el mensaje de Hugging Face citado en la model card, el Space no contaba con moderacion robusta de entrada y salida (deteccion de caras, filtrado de prompts, escaneo de salidas).
- Licencia no declarada: la ficha no indica licencia, lo que impide determinar si el uso comercial esta permitido; ademas, los checkpoints derivan de un modelo base de terceros (`krea/Krea-2-Turbo`) cuyos terminos habria que verificar por separado.
- Falta de documentacion tecnica: no hay datos de arquitectura, parametros, dataset ni evaluacion; cualquier uso en produccion exige una evaluacion propia.
- Riesgo de sesgos y de calidad: al ser fine-tunes de la comunidad sin evaluacion publicada, no se conocen sesgos, tasas de alucinacion visual ni limites de fidelidad.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y con fecha de creacion y actualizacion identicas (28 de noviembre de 2026), lo que sugiere un repositorio sin mantenimiento.
- Riesgo legal: la generacion de contenido sexual con personas reales o verosimiles puede infringir normativas sobre imagenes intimes no consentidas en la UE y en otras jurisdicciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beast0923/Krea-2-Models
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Repositorio GitHub del autor para despliegue en Runpod: https://github.com/minipasila/Krea-2-Turbo_I2I
- Checkpoint FinePorn v4 en CivitAI: https://civitai.red/models/2762538/fineporn-v4-int8-or-nvfp4-or-bf16-or-fp8?modelVersionId=3187539
- Checkpoint Muse By Stable Yogi Krea2 en CivitAI: https://civitai.red/models/2741166/muse-by-stable-yogi-krea2?modelVersionId=3149126
- Checkpoint PornMaster Krea2 en CivitAI: https://civitai.red/models/2735032/pornmaster-krea2?modelVersionId=3119653
