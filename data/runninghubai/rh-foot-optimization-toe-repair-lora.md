# RunningHubAI/rh-foot-optimization-toe-repair-lora

## Resumen

rh-foot-optimization-toe-repair-lora es un adaptador LoRA publicado por RunningHubAI en el repositorio RunningHubAI/rh-foot-optimization-toe-repair-lora. No es un modelo de lenguaje ni un modelo fundacional: es un ajuste fino de difusion texto a imagen de 146 MiB (formato safetensors) disenado para aplicarse sobre los modelos base FLUX.1 y Starflow, segun declara su model card, que ademas indica "Finetuned from: F1基础 D". Su objetivo declarado es la optimizacion de pies, la reparacion de dedos y el acabado de estilo "nail art" en imagenes de pies con estetica de modelo de e-commerce (nombre original del fichero: QY_F.1-脚部优化，脚趾修复，美甲艺术，电商脚模_V1.0.safetensors).

El problema que aborda es concreto y recurrente en los pipelines de generacion de imagen: la anatomia de pies y manos es una de las zonas donde los modelos de difusion fallan con mas frecuencia (numero incorrecto de dedos, dedos fusionados o deformes, unas mal definidas). Este adaptador actua como corrector de detalle en esa region y se activa mediante la palabra clave "beautiful feet", con un peso de LoRA sugerido entre 0.8 y 1, sampler Euler y entre 25 y 30 pasos de muestreo.

Su relevancia practica esta condicionada por su estado de publicacion: 0 descargas y 0 likes, sin licencia declarada, sin idiomas declarados, sin resultados de benchmarks y con una unica version de pesos (V1.0). Es util para flujos de ComfyUI orientados a fotografia de producto de calzado o contenido de belleza, pero carece de validacion externa y de garantias de licencia para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptacion de bajo rango) sobre modelos de difusion texto a imagen; bases declaradas: FLUX.1 y Starflow |
| Parametros totales | No declarado por el autor; el fichero de pesos ocupa 146 MiB, lo que implicaria del orden de 76 millones de parametros en fp16 (estimacion propia, no confirmada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); la resolucion de imagen soportada no esta declarada |
| Tipos de cuantizacion | No disponible; se distribuye un unico checkpoint en safetensors. La cuantizacion de adaptadores LoRA no es habitual |
| Idiomas soportados | No disponible; la unica palabra de activacion documentada esta en ingles ("beautiful feet") y el prompt efectivo depende del modelo base |
| Licencia | No disponible; la model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (fichero QY_F.1-脚部优化，脚趾修复，美甲艺术，电商脚模_V1.0.safetensors, 146 MiB) |
| Nombre del modelo | rh-foot-optimization-toe-repair-lora |
| Autor | RunningHub-@haha, publicado por RunningHubAI |
| Tipo de modelo | LoRA |
| Modelo base | FLUX.1, Starflow; "Finetuned from: F1基础 D" (no identificado) |
| Palabra de activacion | beautiful feet |
| Peso de LoRA recomendado | 0.8 a 1 |
| Sampler recomendado | Euler |
| Pasos de muestreo recomendados | 25 a 30 |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0.2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-14T17:28:01.000Z (segun metadatos de HuggingFace) |
| Fecha de actualizacion | 2026-10-14T17:29:02.000Z (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no una red completa. LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas lineales, de modo que el numero de parametros entrenables es una fraccion minima del total. Con 146 MiB en disco, la huella de parametros del adaptador es de aproximadamente 76 millones en fp16, es decir, en torno al 0.6 % de un modelo base del orden de 12 000 millones de parametros como FLUX.1, lo que hace que el coste computacional anadido en inferencia sea marginal. Al tratarse de un adaptador de difusion, no le son de aplicacion conceptos propios de los LLM como la ventana de contexto, el RLHF o el DPO.

Sobre la arquitectura subyacente, FLUX.1 es un transformer de difusion con formulacion de flujo rectificado (rectified flow) que combina bloques de transformer multimodal en paralelo y codificadores de texto tipo CLIP y T5, con variantes destiladas para guiado. La model card no aporta ningun detalle sobre el dataset de entrenamiento (numero de imagenes, resolucion, composicion, si hubo curado manual o uso de imagenes sinteticas), ni sobre hiperparametros, ni sobre el procedimiento de captioned training que justifica la palabra de activacion "beautiful feet". Tampoco se documenta Starflow, la segunda base declarada, ni la referencia "F1基础 D" que aparece como origen del ajuste, por lo que no es posible verificar compatibilidad exacta con versiones concretas de esos modelos.

## Capacidades

- Refinado de detalle anatomico en pies: correccion de errores tipicos de los modelos de difusion (dedos de mas o de menos, dedos fusionados, proporciones deformes).
- Reparacion de dedos ("toe repair") en imagenes generadas o en tareas de inpainting sobre regiones concretas de la imagen.
- Estilizado de unas y acabado tipo "nail art" con estetica de salon o de contenido de belleza.
- Generacion de imagenes de pies con acabado de "modelo de e-commerce" (encuadre y presentacion orientados a catalogo de producto).
- Integracion en flujos de ComfyUI y en la plataforma en la nube RunningHub, incluida su API.
- Aplicacion sobre modelos base FLUX.1 y Starflow mediante palabra de activacion y peso ajustable (0.8-1).
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de capacidades multilingues declaradas ni de modo "thinking".
- No dispone de entrada de audio y la vision se limita al propio pipeline de difusion imagen a imagen o texto a imagen del modelo base.

## Casos de uso

- Fotografia de producto de calzado: generar imagenes de pies calzados (sandalias, chanclas, zapatos abiertos) para fichas de e-commerce, donde la correccion de dedos evita los artefactos que suelen obligar a descartar tomas generadas.
- Publicidad de pedicura y nail art: crear material promocional de tratamientos de unas con un acabado consistente, ajustando el peso del LoRA para controlar la intensidad del estilo.
- Reparacion de imagenes existentes en flujos de inpainting: enmascarar la zona del pie y aplicar el adaptador para corregir dedos deformes en una imagen ya generada sin tener que regenerarla por completo.
- Aumento de datos para entrenamiento: producir variaciones sinteticas de pies en distintos encuadres y tonos de piel para ampliar un dataset propio de vision por computador o de recomendacion de tallas.
- Post-procesado dentro de un pipeline de ComfyUI controlado por API: encadenar el LoRA al final de un grafo (generacion, escalado, refinado) y ejecutarlo por lotes a traves de la API de RunningHub.
- Previsualizacion de producto ortopedico o de plantillas: mostrar como queda una plantilla o un corrector en un pie de aspecto realista antes de fabricar el material de marketing.
- Contenido editorial de belleza y bienestar: ilustraciones para articulos sobre cuidado de pies, hongos o hidratacion, evitando el aspecto artificial habitual de las imagenes generadas sin adaptador.
- Prototipado rapido de campanas: validar direccion de arte con imagenes de referencia antes de contratar produccion fotografica real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (ni FID, ni CLIP score, ni evaluaciones humanas), no ofrece comparaciones con otros adaptadores y no documenta pruebas de robustez. Cualquier cifra de rendimiento que se quiera utilizar para decidir su adopcion tendria que generarse mediante una evaluacion propia, por ejemplo comparando el mismo prompt y semilla con y sin el adaptador y midiendo la tasa de imagenes con anatomia de pie correcta frente a un jurado humano.

## Requisitos de hardware

- El adaptador en si ocupa 146 MiB en disco y anade del orden de 0.3 GB de VRAM en fp16, mas las activaciones intermedias de las capas afectadas; el requisito real de hardware lo determina el modelo base.
- Con base FLUX.1 en bf16, se necesitan aproximadamente 24-33 GB de VRAM para generar a 1024x1024 sin offloading (estimacion orientativa derivada de un modelo de ~12 000 millones de parametros, no verificada para este adaptador).
- Con cuantizacion fp8, el requisito baja al orden de 16-18 GB de VRAM.
- Con cuantizacion GGUF Q4/Q5 mediante ComfyUI-GGUF, puede ejecutarse en GPUs de 8-12 GB, con velocidad reducida y necesidad de offloading a RAM del sistema.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090/3090 de 24 GB para un flujo comodo; RTX 4080/4070 Ti Super de 16 GB en fp8 con margen ajustado.
- Cabe en GPU de consumo: si en RTX 4090 y 3090 (24 GB) sin problemas, en RTX 4080/4070 Ti Super (16 GB) con fp8 y en RTX 3060/4060 Ti (8-12 GB) solo con GGUF cuantizado y offloading.
- Opciones de despliegue: ComfyUI (formato nativo del checkpoint), ComfyUI-GGUF si se cuantiza el modelo base, diffusers con carga de pesos LoRA, y la nube de RunningHub a traves de su API.
- Latencia y throughput: no publicados por el autor. Como referencia orientativa, el modelo base FLUX.1 a 1024x1024 y 25-30 pasos suele tardar del orden de 20-40 s por imagen en una RTX 4090 y del orden de 10-20 s en A100/H100 (estimaciones no verificadas para este adaptador; el incremento imputable al LoRA es marginal por su tamano).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada / salida | Rendimiento en pies y dedos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-foot-optimization-toe-repair-lora | LoRA sobre FLUX.1 / Starflow | No declarado (~76 M estimados) | Texto a imagen e imagen a imagen via modelo base | No cuantificado; objetivo declarado: reparacion de dedos y nail art | No disponible | HuggingFace, ComfyUI, RunningHub |
| FLUX.1 [dev] sin adaptador | Transformer de difusion (flujo rectificado) | ~12 000 M | Texto a imagen a 1024x1024 y otras resoluciones | Presenta los artefactos anatomicos habituales que el LoRA pretende corregir | Licencia propia de Black Forest Labs | Ampliamente disponible |
| Starflow sin adaptador | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |
| Otros LoRA de refinado de detalle o de anatomia para FLUX.1 | LoRA | No disponible | Texto a imagen e imagen a imagen | No disponible; no se dispone de comparativas publicadas con este adaptador | No disponible | Comunidad HuggingFace / Civitai |

No se dispone de datos comparativos publicados entre este adaptador y alternativas de la misma categoria; la comparacion cuantitativa queda pendiente de una evaluacion propia.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de redactar la ficha, sin evaluaciones independientes ni ejemplos comparables publicados.
- Licencia no declarada: la model card solo indica que los derechos permanecen en el autor y que hay que seguir la licencia del proyecto original o del upstream. Sin una licencia explicita no se puede asumir permiso de uso comercial.
- Dependencia de la licencia del modelo base: FLUX.1 en su variante [dev] se distribuye con licencia no comercial; el uso comercial con esa base requiere la variante con licencia permisiva o una licencia comercial del titular. Este adaptador no aclara sobre que variante exacta se entreno.
- Riesgo elevado de alucinacion anatomica: por su propia naturaleza, un LoRA de reparacion de detalle no garantiza resultados correctos en todos los casos y puede introducir nuevas deformaciones, especialmente con pesos altos o prompts alejados de su dominio.
- Sensibilidad a hiperparametros: la propia model card fija rangos estrechos (peso 0.8-1, sampler Euler, 25-30 pasos); fuera de ellos el comportamiento no esta documentado.
- Dependencia de la palabra de activacion: sin el termino "beautiful feet" en el prompt el efecto puede no aplicarse o aplicarse de forma inconsistente.
- Ambito tematico muy restringido: el adaptador solo cubre la region del pie y el estilo de unas; no aporta capacidades generales ni mejora otras partes de la imagen.
- Riesgo de sesgo en la representacion: no se documenta la composicion del dataset de entrenamiento, por lo que se desconoce la diversidad de tonos de piel, complexiones, edades o tipos de pie representados.
- Sin informacion sobre idiomas: se desconoce si los prompts en castellano producen resultados equivalentes a los de ingles.
- Fechas de publicacion inusualmente futuras en los metadatos (2026-10-14), lo que dificulta situar el modelo en una linea temporal de versiones.
- No hay garantia de compatibilidad con versiones concretas de FLUX.1 o Starflow, ni informacion sobre que variante de "F1基础 D" se uso como origen del ajuste.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RunningHubAI/rh-foot-optimization-toe-repair-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-foot-optimization-toe-repair-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1958498085645271041
- Perfil del autor: https://www.runninghub.cn/user-center/1892822133263990786
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
