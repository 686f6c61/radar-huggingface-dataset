# molbal/Flux-3-Klein-GGUF

## Resumen

FLUX 3 Image Klein es un modelo de generacion y edicion de imagen basado en un diffusion transformer (DiT) de 5,6 mil millones de parametros desarrollado por Black Forest Labs. Acepta un prompt de texto y hasta 10 imagenes de referencia para producir una imagen nueva o editar las existentes, y admite coordenadas de caja delimitadora dentro del prompt para controlar la composicion espacial y el renderizado de texto. Se distribuye en dos variantes: una destilada de 16 pasos (`sd`) y una base de 50 pasos (`base`).

El repositorio analizado, `molbal/Flux-3-Klein-GGUF`, no contiene los pesos originales, sino cuantizaciones GGUF de ambos checkpoints preparadas para su uso en ComfyUI mediante el conjunto de nodos ComfyUI-GGUF-Reboot. El peso real declarado en safetensors es de 5.538.458.368 parametros, y el repositorio ocupa 44,1 GB repartidos en 10 ficheros `.gguf`.

Su relevancia actual radica en que permite ejecutar un modelo de generacion de imagen de ultima generacion en hardware de consumo: la cuantizacion mas agresiva ocupa 2,74 GB, y el autor indica que las variantes Q4 estan pensadas para usos por debajo de 3 GB de VRAM. Se trata de un repositorio recien creado (16 de octubre de 2026), sin descargas ni valoraciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) |
| Parametros totales | 5.538.458.368 (5,54 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el condicionamiento admite un prompt de texto y hasta 10 imagenes de referencia |
| Tipos de cuantizacion | Q4_CR, Q4_CR_L, Q4_K_M, Q6_K, Q8_CR, Q8_0 |
| Idiomas soportados | no disponible (la model card no especifica idiomas; todos los ejemplos estan en ingles) |
| Licencia | flux-kommunity-license (`license: other`, `license_name: flux-kommunity-license`) |
| Formato de pesos | GGUF (10 ficheros, 44,1 GB en total) |

Variantes y tamanos por cuantizacion:

| Checkpoint | Cuantizacion | Tamano |
|---|---|---|
| Destilado (`flux3_image_klein_sd`) | Q4_CR | 2,74 GB |
| Destilado | Q4_CR_L | 2,78 GB |
| Destilado | Q4_K_M | 2,91 GB |
| Destilado | Q6_K | 4,24 GB |
| Destilado | Q8_CR | 5,17 GB |
| Destilado | Q8_0 | 5,49 GB |
| Base (`flux3_image_klein_base`) | Q4_K_M | 2,90 GB |
| Base | Q6_K | 4,23 GB |
| Base | Q8_CR | 5,16 GB |
| Base | Q8_0 | 5,48 GB |

## Arquitectura y entrenamiento

La model card describe FLUX 3 Image Klein como un diffusion transformer de 5,6 mil millones de parametros con pesos abiertos, orientado a generacion texto-a-imagen y edicion de imagen basada en referencias. Un unico modelo acepta el prompt de texto y hasta 10 imagenes de referencia como condicionamiento, lo que permite tanto la sintesis desde cero como la edicion de entradas existentes. El control espacial se ejerce escribiendo coordenadas `[top, left, bottom, right]` sobre una rejilla de 0 a 1000 directamente en el prompt, por ejemplo `place a brass lantern at [620, 180, 860, 340]`. El modelo tambien realiza renderizado de texto dentro de la imagen.

El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de refuerzo o preferencias humanas: esos datos figuran como no disponibles. Si se detallan, en cambio, los criterios de cuantizacion aplicados: `Q8_CR` se recomienda en GPUs con aceleracion INT8 nativa; `Q4_CR_L` usa pesos INT4 ConvRot empaquetados con activaciones INT8 y mantiene determinadas proyecciones de atencion sensibles en `Q8_CR`; `Q4_CR` usa pesos y activaciones INT4. Los tensores de normalizacion unidimensionales y `final_layer.image.linear` se conservan en FP32, y las proyecciones de parche de entrada de anchura 128 (`emb_in`) permanecen en BF16 original.

Las dos variantes responden a compromisos distintos: el checkpoint destilado (`sd`) esta calibrado para 16 pasos de muestreo, mientras que el base (`base`) requiere 50 pasos. El primero prioriza latencia; el segundo, fidelidad.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con descripciones de escena completas.
- Edicion de imagen basada en referencias: acepta hasta 10 imagenes de entrada para producir una edicion o una nueva imagen coherente con ellas.
- Control de composicion espacial mediante coordenadas de caja delimitadora `[top, left, bottom, right]` en una rejilla de 0 a 1000 integradas en el prompt.
- Renderizado de texto dentro de la imagen, con rotulos y tipografia descritos en el prompt.
- Muestreo en dos regimenes: 16 pasos (checkpoint destilado) y 50 pasos (checkpoint base).
- Expansion automatica de prompts: la model card recomienda usar el nodo upsampler Qwen3.5 9B de ComfyUI para convertir instrucciones cortas en descripciones largas.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente ni generacion de texto: es un modelo de difusion para imagen, no un modelo de lenguaje.

## Casos de uso

- Ilustracion y concept art a partir de descripciones extensas: el modelo esta optimizado para prompts narrativos largos (la model card recomienda descripciones de escena completas en lugar de listas de etiquetas), lo que encaja en flujos de preproduccion donde el brief ya esta redactado en prosa.
- Edicion de imagen por referencia en retoque fotografico: admite hasta 10 imagenes de referencia, de modo que un estudio puede condicionar el resultado con un catalogo de producto, una paleta o varios encuadres previos sin reentrenar nada.
- Composicion editorial con texto integrado: el renderizado de texto y el control por cajas permiten generar portadas, carteles o mockups publicitarios colocando el rotulo en una posicion concreta de la rejilla 0-1000.
- Maquetacion y layout controlado: las coordenadas `[top, left, bottom, right]` permiten fijar la posicion de elementos concretos (por ejemplo, un farol o un logotipo) para respetar una plantilla de marca.
- Prototipado rapido en GPU de consumo: con la cuantizacion Q4_CR (2,74 GB) el modelo cabe en equipos modestos, lo que lo hace util para iterar bocetos en un portatil con GPU discreta.
- Automatizacion por lotes en ComfyUI: al ser un GGUF cargable con los nodos ComfyUI-GGUF-Reboot, se puede integrar en grafos que generen variaciones masivas de un mismo prompt para test A/B de creatividades.
- Generacion local sin conexion: al ejecutarse sobre GGUF en ComfyUI o en runners compatibles como KoboldCpp, permite producir imagenes en entornos aislados donde no se pueden enviar prompts a servicios en la nube.
- Aceleracion de prompts cortos en produccion: combinado con el nodo upsampler Qwen3.5 9B, un operador puede escribir una instruccion de una linea y delegar la redaccion de la escena detallada al pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, GenEval ni similares) ni comparaciones cuantitativas con otros modelos. El unico ejemplo cualitativo aportado es una imagen de muestra generada con el checkpoint destilado y su prompt correspondiente.

## Requisitos de hardware

- VRAM estimada segun el tamano de los pesos: entre 2,74 GB (Q4_CR, destilado) y 5,49 GB (Q8_0, destilado). A esa cifra hay que sumar la memoria del codificador de texto y del VAE, cuyo consumo no se detalla en la informacion disponible.
- El autor indica que las cuantizaciones Q4 (`Q4_CR` y `Q4_CR_L`) estan pensadas para usos por debajo de 3 GB de VRAM.
- `Q8_CR` esta recomendada en GPUs con aceleracion INT8 nativa. La model card no enumera modelos concretos de GPU.
- Cabe en GPU de consumo: el rango de pesos (2,74 a 5,49 GB) es compatible con tarjetas de gama media y alta con suficiente VRAM libre. La informacion disponible no especifica modelos exactos (RTX 4090, etc.).
- Opciones de despliegue: ComfyUI con los nodos ComfyUI-GGUF-Reboot, publicados en el repositorio de GitHub de molbal y en el registro de ComfyUI. Los resultados de busqueda tambien indican soporte de modelos tipo Klein en KoboldCpp.
- Latencia y throughput: no disponibles. Como referencia de coste computacional, el checkpoint destilado requiere 16 pasos de muestreo y el base 50 pasos.
- Almacenamiento: el repositorio completo ocupa 44,1 GB, aunque solo es necesario descargar los ficheros de la cuantizacion y la variante que se vayan a usar.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| molbal/Flux-3-Klein-GGUF | 5,54 B | GGUF | Q4_CR, Q4_CR_L, Q4_K_M, Q6_K, Q8_CR, Q8_0 | flux-kommunity-license | Repositorio analizado; solo checkpoints destilado y base de Klein |
| realrebelai/FLUX-3-Image-Klein_GGUFs | no disponible | GGUF | no disponible (incluye Base y Step) | no disponible | Cuantizaciones comunitarias alternativas del mismo modelo base |
| black-forest-labs/flux-3-image-klein | 5,54 B (heredado) | no disponible | no aplica (pesos originales) | flux-kommunity-license | Checkpoint original de Black Forest Labs del que derivan ambas cuantizaciones |

No se dispone de datos de rendimiento comparado entre estas opciones, por lo que la eleccion entre ellas depende del formato, la licencia y las cuantizaciones ofrecidas, no de metricas publicadas.

## Limitaciones y advertencias

- Licencia `flux-kommunity-license` (marcada como `license: other`): no es una licencia de codigo abierto plena. Antes de cualquier uso comercial es obligatorio revisar el texto completo en el enlace de licencia del repositorio, ya que puede imponer restricciones de uso, atribucion o limites de facturacion.
- El repositorio no ha recibido descargas ni valoraciones, por lo que no existe validacion independiente de la calidad de las cuantizaciones ni de su fidelidad respecto a los pesos originales.
- No todas las cuantizaciones estan disponibles en ambas variantes: el checkpoint base no ofrece `Q4_CR` ni `Q4_CR_L`, lo que limita las opciones de VRAM muy baja si se necesita el modelo de 50 pasos.
- En modelos de difusion el riesgo no es la alucinacion textual, sino la generacion de artefactos: anatomia incorrecta, texto malformado, incoherencias entre elementos o composiciones que ignoran las coordenadas indicadas. No hay datos publicados sobre la frecuencia de estos fallos.
- Los sesgos del modelo dependen del dataset de entrenamiento de Black Forest Labs, que no esta documentado en la informacion disponible; cabe esperar sesgos en la representacion de personas, culturas y profesiones.
- Cobertura idiomatica no especificada: la model card solo documenta ejemplos en ingles y no garantiza el comportamiento con prompts en castellano.
- La cuantizacion INT4 (`Q4_CR`) puede degradar el detalle fino y el renderizado de texto en comparacion con `Q8_CR`; el propio autor recomienda `Q8_CR` cuando hay aceleracion INT8 disponible.
- Requiere el conjunto de nodos ComfyUI-GGUF-Reboot para cargarse en ComfyUI, lo que introduce una dependencia de terceros cuyo mantenimiento y compatibilidad futura no estan garantizados.
- Compatibilidad limitada fuera del ecosistema ComfyUI/KoboldCpp: no se documentan soportes en vLLM, TGI ni llama.cpp estandar, que estan orientados a modelos de lenguaje y no a difusion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/molbal/Flux-3-Klein-GGUF
- Nodos cargadores (GitHub): https://github.com/molbal/ComfyUI-GGUF
- Registro de ComfyUI: https://registry.comfy.org/publishers/molbal/nodes/comfyui-gguf-reboot
- Documentacion del mantenedor: https://molbal.github.io/gguf/models/flux-3-klein.html
- Licencia: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy/blob/main/LICENSE.md
- Checkpoint base original: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Checkpoint base (variante base): https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Blog de Black Forest Labs sobre FLUX 3: https://bfl.ai/blog/flux-3
- Vision general de FLUX 3 en HuggingFace: https://huggingface.co/blog/ResterChed/flux-3
- Cuantizaciones comunitarias alternativas: https://huggingface.co/realrebelai/FLUX-3-Image-Klein_GGUFs
- KoboldCpp (runner compatible con modelos Flux/Klein): https://github.com/lostruins/koboldcpp
