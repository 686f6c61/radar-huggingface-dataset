# beenga8/flux2-klein-4b-mirror

## Resumen

Este repositorio es un espejo (mirror) fijado de `black-forest-labs/FLUX.2-klein-4B`, un modelo de generacion de texto a imagen desarrollado por Black Forest Labs. El autor del espejo, beenga8, lo mantiene para garantizar la reproducibilidad de los builds de Beenga Image, de modo que las compilaciones puedan reconstruirse incluso si el repositorio original se mueve, se restringe o se retira.

El modelo subyacente, FLUX.2 klein 4B, es un modelo de difusion de texto a imagen con 4 mil millones de parametros, publicado bajo licencia Apache 2.0. Este repositorio es una copia byte a byte del original en la revision `e7b7dc27f91deacad38e78976d1f2b499d76a294`, sin modificaciones, reentrenamiento ni fine-tuning.

La relevancia de este espejo radica en la reproducibilidad: fija una revision concreta para que las mediciones y los builds sean consistentes, algo critico en entornos de integracion continua o investigacion donde la disponibilidad del repositorio original no puede darse por sentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto a imagen (Flux2KleinPipeline) |
| Parametros totales | 4B (segun nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 klein 4B de Black Forest Labs, un modelo de difusion para generacion de imagenes a partir de texto. Los detalles especificos de la arquitectura interna (tipo de transformer de difusion, mecanismos de atencion, etc.) no estan disponibles en la informacion proporcionada.

Este repositorio en particular no contiene informacion sobre el entrenamiento del modelo, ya que es una copia espejo sin modificaciones. Los datos de entrenamiento, el numero de tokens y los metodos de alineacion (RLHF, DPO, etc.) corresponden al modelo original y no se detallan en esta model card.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales mediante el pipeline `Flux2KleinPipeline` de diffusers.
- Compatible con la libreria diffusers de HuggingFace.
- Al ser un espejo fiel del modelo original, sus capacidades son identicas a las de `black-forest-labs/FLUX.2-klein-4B`.
- No se dispone de informacion sobre capacidades adicionales como tool calling, agentes o razonamiento multimodal en la informacion proporcionada.

## Casos de uso

- Reproducibilidad de builds: el caso de uso principal de este espejo es garantizar que las compilaciones de Beenga Image puedan reconstruirse de forma identica, fijando la revision exacta del modelo. Es adecuado porque el hash de revision queda anclado en el repositorio.
- Integracion continua: equipos que necesiten dependencias estables pueden referenciar este espejo en lugar del repositorio original, evitando roturas por cambios, movimientos o retiradas del upstream.
- Auditoria y trazabilidad: al fijar una revision concreta, los equipos pueden verificar que los pesos utilizados son exactamente los esperados, lo que facilita la auditoria de modelos en entornos regulados.
- Generacion de imagenes en produccion: como copia del modelo FLUX.2 klein 4B, puede usarse para generar imagenes a partir de texto en aplicaciones de diseno, marketing o contenido visual, siempre que se respete la licencia Apache 2.0.
- Investigacion reproducible: laboratorios que necesiten documentar exactamente que pesos usaron en sus experimentos pueden apuntar a esta revision fijada, garantizando que otros investigadores puedan replicar los resultados.
- Respaldo de disponibilidad: si el repositorio original se vuelve inaccesible (gated, movido o retirado), este espejo garantiza que el modelo siga disponible para descarga, lo que lo hace adecuado como fuente de contingencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requisitos de VRAM: no disponibles en la informacion proporcionada. Como orientacion general, un modelo de difusion de 4B parametros requiere una GPU con VRAM suficiente para alojar los pesos y las activaciones, pero no se indican cifras concretas.
- GPUs recomendadas: no disponible.
- Compatibilidad con GPUs de consumo: no disponible.
- Opciones de despliegue: compatible con la libreria diffusers de HuggingFace. No se mencionan otras opciones como vLLM, llama.cpp u Ollama, que son tipicas de modelos de lenguaje y no de modelos de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada menciona que Black Forest Labs publica los modelos de 4B bajo Apache 2.0, mientras que los de 9B estan bajo la FLUX Non-Commercial License v2.1 y ademas el `9b-fp8` esta restringido (gated). Esta distincion de licencia es clave al elegir entre variantes.

| Modelo | Parametros | Licencia | Acceso |
|---|---|---|---|
| FLUX.2 klein 4B (este espejo) | 4B | Apache 2.0 | Abierto |
| FLUX.2 klein 4B (upstream) | 4B | Apache 2.0 | Abierto |
| FLUX.2 9B | 9B | FLUX Non-Commercial License v2.1 | Restringido (9b-fp8 gated) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio es un espejo, no un modelo independiente. Todo el credito pertenece a Black Forest Labs.
- El tamano del repositorio (0.2 GB) es notablemente inferior a lo que cabria esperar para un modelo de 4B parametros en safetensors, lo que sugiere que el espejo podria no contener los pesos completos o que el tamano reportado no refleja el contenido total. Verificar la integridad antes de usarlo en produccion.
- No se ha realizado ninguna modificacion, reentrenamiento o fine-tuning sobre los pesos originales.
- La licencia Apache 2.0 permite uso comercial, pero el uso puede estar sujeto a las politicas de uso aplicables de Black Forest Labs.
- No confundir con las variantes de 9B, que tienen una licencia distinta (no comercial) y acceso restringido.
- Los idiomas soportados no estan documentados en la informacion proporcionada.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o limitaciones de contexto del modelo subyacente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/beenga8/flux2-klein-4b-mirror
- Modelo original (upstream): https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio de Beenga Image: https://github.com/Beenga/beenga-image
