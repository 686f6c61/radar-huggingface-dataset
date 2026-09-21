# ling0322/libwaifu-noobai-xl-v1.1

## Resumen

libwaifu-noobai-xl-v1.1 es una conversion de contenedor del punto de control NoobAI-XL v1.1 al formato que lee la herramienta libwaifu. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los originales de Laxhar/noobai-XL-1.1, verificados contra el sha256 `6681e8e4b134c81f16533acedb0d406d7e5e366e1624b4105178c64d00b05d51`, y lo unico que cambia es como se empaquetan. El U-Net y los dos codificadores de texto se guardan en float16, mientras que el VAE se mantiene en una precision mayor porque desborda float16.

El modelo subyacente es un derivado de SDXL afinado sobre Illustrious XL a partir de imagenes de Danbooru y e621, por lo que se maneja con etiquetas estilo Danbooru en lugar de frases en lenguaje natural. Se publica en su variante de prediccion epsilon, coherente con el muestreador Euler que implementa libwaifu; la variante v-prediction de NoobAI es un modelo distinto y no es la que contiene este repositorio. Incluye ambas mitades del autoencoder, de modo que puede generar desde un prompt y tambien desde una imagen de entrada.

Su relevancia es practica: permite invocar el modelo directamente desde la CLI de libwaifu (`waifu draw -m sdxl:noob`) sin descargas ni conversiones manuales, manteniendo la fidelidad byte a byte respecto al punto de control original. El repositorio declara 0 descargas y 0 likes en el momento de la consulta, y su tamano reportado es de 14,2 GB, aunque el manifiesto que enumera sus ficheros suma aproximadamente 6,6 GiB en cuatro fragmentos safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SDXL (U-Net + dos codificadores de texto CLIP + VAE), prediccion epsilon |
| Parametros totales | no disponible (no se declara cifra en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de generacion de imagen. El prompt se procesa con `noobai-xl-v1.1.tokenizer.json` (tokenizador CLIP de Stability); no se especifica limite de tokens |
| Tipos de cuantizacion | no disponible. Solo se publican pesos en float16 (U-Net y codificadores); el VAE se almacena en mayor precision porque desborda float16. No hay GGUF ni variantes cuantizadas |
| Idiomas soportados | no disponible. El prompt se escribe con etiquetas Danbooru/e621, mayoritariamente en ingles |
| Licencia | fair-ai-public-license-1.0-sd (FAI-PL 1.0 SD). Prohibe el uso comercial; los modelos derivados y el trabajo del que provienen deben permanecer abiertos |
| Formato de pesos | safetensors en float16, dividido en 4 fragmentos, mas manifiesto YAML y tokenizador JSON |
| Tamano del repositorio | 14,2 GB (segun HuggingFace) |
| Tamano de los pesos | ~6,62 GiB segun el manifiesto: 1,88 + 1,88 + 1,87 + 0,99 GiB |
| Resolucion recomendada | no disponible (el manifiesto sugiere una resolucion, no reproducida en la informacion proporcionada) |
| Muestreador recomendado | Euler a |
| Rango de pasos y CFG | no disponible (el manifiesto recoge el extremo inferior de los rangos del autor, no detallado aqui) |
| Prompt negativo sugerido | `nsfw, worst quality, old, early, low quality, lowres, signature, username, logo, bad hands, mutated hands, mammal, anthro, furry, ambiguous form, feral, semi-anthro` |
| Fecha de creacion | 2026-09-05 |
| Ultima actualizacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de SDXL: un U-Net con bloques de atencion, dos codificadores de texto (el CLIP ViT-L y el OpenCLIP ViT-bigG habituales en SDXL) y un autoencoder VAE con encoder y decoder. Este repositorio no modifica ningun peso ni entrena nada; es una conversion de contenedor realizada con `tools/sdxl_exporter.py`, que parte del fichero `NoobAI-XL-v1.1.safetensors` y produce un modelo dividido en fragmentos de 2 GB. La particion se hace siempre entre tensores, nunca dentro de uno, de modo que cada fragmento es un safetensors valido por si mismo y puede leerse y verificarse de forma aislada. Segun la model card, la imagen resultante de los cuatro fragmentos es identica byte a byte a la de un modelo sin dividir.

El entrenamiento corresponde al modelo de origen: NoobAI-XL v1.1 se afina desde Illustrious XL sobre Danbooru y e621, lo que explica que el prompting se base en etiquetas y no en oraciones. Esta version concreta usa prediccion epsilon; NoobAI publica tambien una variante v-prediction, que es una parametrizacion distinta del mismo schedule y no esta incluida aqui. El detalle importa en la practica porque el muestreador Euler de libwaifu lee epsilon y no seria compatible con la variante v-prediction. No se dispone de datos sobre numero de tokens de entrenamiento, composicion exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de imagen texto a imagen en el estilo y la distribucion de Danbooru y e621, controlada mediante etiquetas etiquetadas en el orden `<1girl/1boy/1other/...>, <character>, <series>, <artists>, <special tags>, <general tags>, <other tags>`.
- Generacion condicionada por imagen, ya que el autoencoder incluye tanto encoder como decoder y el repositorio contiene ambas mitades.
- Especializacion en personajes, series y nombres de artistas como etiquetas de prompt, lo que permite reproducir estilos o fichas de personaje concretos.
- Capacidad de contenido para adultos: el propio repositorio esta marcado como `not-for-all-audiences`, y el prompt negativo por defecto del autor esta pensado para desactivarlo.
- Ejecucion local y offline a traves de la CLI de libwaifu (`waifu draw -m sdxl:noob`) o cargando un manifiesto concreto (`waifu draw -m noobai-xl-v1.1/noobai-xl-v1.1.yaml`).
- Alias de version estables: `sdxl:noob:v1.1` apunta siempre a esta release, mientras que `sdxl:noob` sigue la version vigente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de difusion para imagen.

## Casos de uso

- Ilustracion de personajes de anime bajo especificacion: el modelo responde a etiquetas de personaje, serie y artista, por lo que se puede fijar una ficha concreta y generar variaciones controladas de pose, encuadre y vestuario.
- Flujos de img2img y retoque: al incluir encoder y decoder del VAE, admite partir de un boceto o una imagen previa y regenerarla con el prompt como guia.
- Automatizacion por lotes desde linea de comandos: `waifu draw -m sdxl:noob` se integra en scripts o cron jobs para generar catalogos de imagenes sin depender de una API externa.
- Despliegue en local con requisitos de privacidad: al ejecutarse integramente en la maquina del usuario, es adecuado para entornos donde el prompt no puede salir a un servicio en la nube (contenido sensible, material de preproduccion bajo NDA).
- Ajuste fino y LoRA sobre el modelo base: como los pesos son los originales de NoobAI-XL v1.1, los LoRA y embeddings entrenados para ese punto de control siguen siendo validos; conviene revisar la clausula de la FAI-PL 1.0 SD que obliga a mantener abiertos los derivados.
- Investigacion sobre conversion de puntos de control: el repositorio documenta el script de exportacion y el esquema de particion por tensores, util para reproducir o auditar el proceso con otros checkpoints SDXL.
- Comparacion de parametrizaciones: al ser la variante epsilon, sirve como referencia para contrastar resultados frente a la v-prediction de NoobAI con el mismo prompt y semilla.
- Filtrado y moderacion en pipelines propios: los prompts negativos y el etiquetado explicito de contenido adulto permiten construir canalizaciones que generen o bloqueen contenido segun la politica del producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, evaluaciones humanas ni comparativas con otros puntos de control) para este repositorio ni para su modelo de origen.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman aproximadamente 6,6 GiB en float16, por lo que se necesitan del orden de 8 GB de VRAM como minimo practico y entre 10 y 12 GB para trabajar con comodidad a resoluciones altas. Estas cifras son una estimacion derivada del tamano de los ficheros, no un dato publicado.
- GPU consumer compatibles: tarjetas con 12 GB o mas, como la RTX 3060 de 12 GB, la RTX 4070, la RTX 4080 o la RTX 4090; las de 8 GB pueden funcionar con atencion eficiente y offloading parcial, sin garantia.
- GPU de datacenter: A100, H100 y similares no aportan ventaja funcional, ya que el modelo es pequeno, pero permiten paralelizar lotes grandes para generacion masiva.
- Si cabe en GPU de consumo: si, en el rango de 8 a 12 GB de VRAM segun configuracion.
- Opciones de despliegue: libwaifu es el destino nativo de este repositorio (CLI `waifu`, alias `sdxl:noob`). Los ficheros son safetensors convencionales, legibles por torch y numpy, por lo que tambien se pueden reconvertir a otros contenedores con el script `tools/sdxl_exporter.py` o volviendo al punto de control original para usarlos en otros entornos de difusion.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por imagen ni de imagenes por segundo.
- Almacenamiento: 14,2 GB de repositorio segun HuggingFace, frente a los ~6,6 GiB que declara el manifiesto; conviene verificar el contenido real antes de aprovisionar disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de prompt | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| libwaifu-noobai-xl-v1.1 (este) | no disponible | Tokenizador CLIP incluido; etiquetas Danbooru | Sin benchmarks publicados | FAI-PL 1.0 SD, no comercial, derivados abiertos | HuggingFace, formato libwaifu |
| Laxhar/noobai-XL-1.1 (origen) | no disponible | Etiquetas Danbooru | Sin benchmarks en la informacion disponible | FAI-PL 1.0 SD (heredada) | HuggingFace; mismas ponderaciones que este repositorio |
| NoobAI-XL v-prediction | no disponible | Etiquetas Danbooru | Sin benchmarks en la informacion disponible | FAI-PL 1.0 SD (heredada) | HuggingFace; no compatible con el muestreador Euler de libwaifu |
| Illustrious XL | no disponible | Etiquetas Danbooru | Sin benchmarks en la informacion disponible | no disponible | HuggingFace; es el punto de partida del afinado de NoobAI |

La diferencia sustantiva entre las dos primeras filas no es de calidad ni de pesos, que son identicos, sino de contenedor: este repositorio sustituye el checkpoint monolitico por un manifiesto YAML mas cuatro fragmentos safetensors.

## Limitaciones y advertencias

- Licencia restrictiva: la FAI-PL 1.0 SD prohibe el uso comercial y exige que los modelos derivados y el trabajo del que proceden permanezcan abiertos. No es MIT, a diferencia de la propia herramienta libwaifu.
- Contenido para adultos: el repositorio esta etiquetado como `not-for-all-audiences` y el modelo se entreno sobre e621. Cualquier despliegue en produccion necesita filtrado de prompts y de salidas.
- Sesgos del dataset: Danbooru y e621 sobrerrepresentan ciertos estilos, personajes y convenciones de dibujo; el modelo reproducira esas convenciones y los sesgos de representacion asociados.
- Riesgo de imitacion de artistas: el prompting admite etiquetas de artistas concretos, lo que plantea riesgos de derechos de autor y de estilo que deben evaluarse legalmente antes de cualquier uso publico.
- Alucinacion y artefactos visuales: el prompt negativo por defecto del autor incluye `bad hands`, `mutated hands` y `worst quality`, lo que indica que la anatomia de manos y la calidad en resoluciones bajas son fallos conocidos.
- Prompting por etiquetas: no acepta bien frases en lenguaje natural; hay que conocer el vocabulario Danbooru y el orden de etiquetas recomendado.
- Parametrizacion epsilon: no es compatible con muestreadores que esperan v-prediction. Confundir ambas variantes produce salidas degradadas.
- Formato de contenedor propio: el manifiesto referencia sus ficheros por nombre y no sigue rutas; todos los archivos deben permanecer en el mismo directorio.
- Ausencia de cuantizaciones: no se publican variantes GGUF ni de menor precision, lo que limita el despliegue en hardware muy ajustado.
- Idiomas no disponibles y tokenizador orientado al ingles: los prompts en otros idiomas no estan soportados oficialmente.
- Sin benchmarks ni adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, y ausencia de metricas publicadas, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- Incoherencia de tamanos: el repositorio declara 14,2 GB mientras que el manifiesto enumera unos 6,6 GiB de pesos, lo que conviene comprobar antes de desplegar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ling0322/libwaifu-noobai-xl-v1.1
- Modelo de origen: https://huggingface.co/Laxhar/noobai-XL-1.1
- Proyecto libwaifu: https://github.com/ling0322/libwaifu
- Licencia FAI-PL 1.0 SD: https://freedevproject.org/faipl-1.0-sd/
- La busqueda web realizada no devolvio ningun resultado relevante: unicamente paginas de descarga de una aplicacion APK sin relacion con el modelo, por lo que no se incluyen.
- Paper, blog o demo especificos de esta conversion: no disponible.
