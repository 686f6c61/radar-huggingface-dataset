# RunningHubAI/rh-realistic-skin-texture-style-xl-lora

## Resumen

rh-realistic-skin-texture-style-xl-lora es un adaptador LoRA de bajo rango para generacion de imagen a partir de texto (text-to-image), afinado sobre SDXL 1.0. Lo publica RunningHubAI, la cuenta de Hugging Face de la plataforma RunningHub, en nombre del autor identificado en la model card como «RunningHub-@CG迷». Su proposito es concreto y acotado: forzar en las imagenes generadas un acabado de piel realista, con poros y microtextura visibles, en lugar del aspecto excesivamente suavizado o «plastificado» tipico de los modelos de difusion sin ajuste.

No es un modelo autonomo ni un modelo de lenguaje: es un conjunto de pesos LoRA que se carga junto al modelo base SDXL 1.0 dentro de un pipeline de difusion latente. El repositorio ocupa 0,9 GB y contiene un unico fichero safetensors de 870 MiB, lo que es coherente con un LoRA de rango medio sobre el UNet de SDXL. La model card no declara numero de parametros, rango, alpha ni recuento de pasos de entrenamiento, por lo que esos datos quedan como no disponibles.

Su relevancia practica es la de cualquier LoRA de estilo: es un componente pequeno, intercambiable y combinable con otros adaptadores. En flujos de retrato fotorrealista se usa en cadenas junto a LoRAs de tono de piel, detalle o iluminacion, y se apoya en las palabras de activacion SKIN TEXTURE STYLE, DETAILED SKIN PORE, DETAILED SKIN y REALISTIC SKIN. El momento de publicacion registrado en Hugging Face es el 30 de septiembre de 2026, con actualizacion el mismo dia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre SDXL 1.0: UNet de difusion latente con doble text encoder CLIP y VAE |
| Parametros totales | no disponible (el repositorio solo publica pesos LoRA; no se declara rango ni alpha) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion text-to-image, sin ventana de contexto; la longitud de prompt la determina el text encoder del modelo base SDXL 1.0) |
| Tipos de cuantizacion | no disponible en la model card; los pesos se distribuyen en safetensors. La cuantizacion aplicable seria la del modelo base SDXL 1.0 (fp16, fp8, GGUF), no la del LoRA |
| Idiomas soportados | no disponible. Las palabras de activacion estan en ingles, lo que sugiere prompts en ingles |
| Licencia | no disponible. La model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del upstream, sin nombrarla |
| Formato de pesos | safetensors (fichero `Realistic Skin Texture style XL (Detailed Skin).safetensors`, 870 MiB) |
| Tipo de modelo | LoRA text-to-image |
| Modelo base | SDXL 1.0 |
| Tamano del repositorio | 0,9 GB |
| Palabras de activacion | SKIN TEXTURE STYLE, DETAILED SKIN PORE, DETAILED SKIN, REALISTIC SKIN |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Publicacion / actualizacion | 30/09/2026 (registro de Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un LoRA, es decir, un conjunto de matrices de bajo rango que se suman a las proyecciones del UNet de SDXL 1.0 en tiempo de inferencia. No modifica ni sustituye los pesos del modelo base; se carga como adaptador y su efecto se controla con un factor de escala. SDXL 1.0, el base declarado, es un modelo de difusion latente con un UNet de aproximadamente 2.600 millones de parametros, dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG) y un VAE que trabaja en un espacio latente de 128 canales. El repositorio no publica pesos del base, solo el adaptador de 870 MiB.

La informacion disponible no incluye detalles del entrenamiento: no se indica el numero de imagenes ni de pasos, la composicion del dataset, la resolucion de entrenamiento, el rango del LoRA, el alpha, la tasa de aprendizaje ni si se aplicaron tecnicas como regularizacion por captions o ajuste por etapas. Tampoco se documenta si el ajuste se hizo sobre el UNet completo, sobre los text encoders o sobre ambos; en la practica, el tamano del fichero sugiere que el entrenamiento se concentro en el UNet. No hay ninguna innovacion tecnica declarada: el valor diferencial es el dataset de texturas de piel, no un cambio arquitectonico.

## Capacidades

- Aplicar microtextura de piel realista (poros, grano, irregularidades) a imagenes generadas con SDXL 1.0, activable mediante las palabras clave declaradas.
- Generacion de imagenes text-to-image cuando se combina con SDXL 1.0: el LoRA no genera por si solo, requiere el modelo base.
- Retrato fotorrealista y primeros planos de rostro, que es el escenario que la propia model card describe como objetivo.
- Combinacion con otros LoRAs de estilo, tono de piel o detalle, cargandolos en cadena y ajustando pesos por adaptador. La model card menciona explicitamente la combinacion con Skin Tone Style XL.
- Integracion en flujos de ComfyUI mediante nodos de carga de LoRA, con control del peso del adaptador por nodo.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento. Son capacidades propias de modelos de lenguaje y no aplican a este artefacto.
- Capacidades multilingues: no disponibles. Las palabras de activacion estan en ingles y el texto de los prompts se procesa con CLIP, cuyo comportamiento fuera del ingles no esta documentado en la model card.

## Casos de uso

- Retrato fotorrealista para estudio o banco de imagenes: se carga el LoRA con un peso moderado sobre SDXL 1.0 y se incluyen las palabras DETAILED SKIN PORE o REALISTIC SKIN en el prompt para obtener primeros planos con textura creible, evitando el acabado ceroso tipico del base.
- Ilustracion editorial y previsualizacion de personajes: en produccion de arte conceptual se necesita evaluar como se vera una cara en plano cerrado; el LoRA aporta ese nivel de detalle sin reentrenar nada.
- Flujos de retoque asistido en ComfyUI: combinado con inpainting sobre zonas de piel, permite regenerar mejillas, frente o cuello con coherencia de textura respecto al resto de la imagen.
- Encadenado con LoRAs de tono de piel e iluminacion: la model card sugiere combinarlo con Skin Tone Style XL, de modo que un pipeline puede apilar varios adaptadores y balancear pesos para controlar acabado y color por separado.
- Creacion de contenido para moda y belleza: las campanas de producto cosmetico exigen detalle de piel a corta distancia; el LoRA se ajusta a ese requisito con resoluciones altas de SDXL.
- Prototipado rapido en la nube sin GPU propia: la model card apunta a RunningHub y a su API como via de ejecucion, de modo que el adaptador se puede probar sin infraestructura local.
- Aumento de variedad en datasets sinteticos: si se generan caras sinteticas para aumentar un dataset, anadir este LoRA reduce la uniformidad de textura entre muestras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, comparativas humanas ni metricas de similitud con el modelo base. Tampoco hay datos de velocidad de inferencia, numero de pasos recomendado, escala de CFG ni peso optimo del adaptador.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas de la arquitectura declarada (SDXL 1.0 mas un LoRA de 870 MiB) y no proceden de la model card, que no publica requisitos de hardware.

- VRAM para inferencia en fp16: en torno a 10-12 GB en el peor caso, porque el UNet de SDXL ocupa aproximadamente 6,9 GB, los dos text encoders alrededor de 2,5 GB y el VAE unos 0,3 GB, mas activaciones. El LoRA anade un coste marginal de VRAM (del orden de cientos de MB segun como se fusione).
- Con offloading secuencial de modulos (text encoder, UNet, VAE) el pico baja a unos 6-8 GB, a costa de mas latencia.
- Modelo base cuantizado (fp8 o GGUF Q8/Q4) permite funcionar en torno a 4-6 GB de VRAM, con perdida de calidad segun el nivel.
- GPU consumer: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090 y en tarjetas de 8 GB con cuantizacion y offloading. En GPUs de 6 GB es viable solo con cuantizacion agresiva y resoluciones moderadas.
- GPU profesional: A100, H100, L40S y A6000 ejecutan el pipeline sin restricciones de memoria y permiten lotes mayores.
- Opciones de despliegue: ComfyUI (plataforma indicada por el autor), Automatic1111/Forge, SD.Next, InvokeAI y scripts de diffusers cargando el LoRA con `load_lora_weights`. vLLM, TGI y Ollama no aplican: son servidores para modelos de lenguaje, no para difusion.
- Despliegue gestionado: la model card apunta a RunningHub y a su API como alternativa sin hardware propio.
- Latencia y throughput: no disponibles. Dependen del modelo base, la GPU y el numero de pasos, no del LoRA.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-realistic-skin-texture-style-xl-lora | LoRA de textura de piel | SDXL 1.0 | 870 MiB | no disponible | Hugging Face, ComfyUI, RunningHub |
| rh-realistic-texture-of-skin-lora | LoRA de textura de piel | no disponible en la informacion recogida | no disponible | no disponible | Hugging Face (misma cuenta, RunningHubAI) |
| Skin Tone Style XL | LoRA de tono de piel | no disponible en la informacion recogida | no disponible | no disponible | mencionado en la model card y en directorios de terceros |

No se dispone de datos de rendimiento comparativo entre estos adaptadores. La diferencia funcional declarada es que rh-realistic-skin-texture-style-xl-lora se centra en microtextura y poros, mientras que Skin Tone Style XL trabaja el tono, y la propia model card propone usarlos de forma combinada en lugar de como alternativas. Para el resto de campos de la comparativa, la informacion disponible es insuficiente.

## Limitaciones y advertencias

- La licencia no esta especificada. La model card solo indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del upstream. Antes de cualquier uso comercial hay que aclarar este punto, y en la practica hereda tambien las condiciones de uso de SDXL 1.0, que no se citan.
- No es un modelo autonomo: sin SDXL 1.0 cargado no produce nada. Cualquier limitacion del base (sesgos de representacion, dificultad con manos, texto en imagen, anatomias complejas) se mantiene.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar texturas de piel irreales o artificiales, especialmente con pesos de LoRA altos, resoluciones bajas o prompts poco especificos. Recomendado revisar el peso del adaptador por proyecto.
- Sesgos conocidos: la model card no documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar el sesgo demografico. Si el dataset se centro en un tipo de piel o iluminacion, el adaptador puede reproducir ese sesgo en los resultados.
- Ambiguedad en la propia documentacion: el repositorio se anuncia como version SDXL, pero la model card incluye un enlace a una ficha de RunningHub con identificador distinto (1838852593643843585) y referencias a un modelo de nombre casi identico; conviene verificar que el fichero descargado corresponde al base declarado antes de integrarlo en un pipeline.
- Idiomas: no hay datos sobre comportamiento con prompts en castellano. Las palabras de activacion estan en ingles; se recomienda escribir los prompts en ese idioma.
- Repositorio sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks ni ejemplos de salida en la informacion disponible.
- Fecha de publicacion registrada en 2026, posterior a la fecha de consulta habitual de este tipo de fichas; conviene comprobar la vigencia del repositorio.
- Sin datos de entrenamiento publicados: no se puede auditar el dataset ni verificar que no incluya material con derechos restringidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-realistic-skin-texture-style-xl-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-realistic-skin-texture-style-xl-lora/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/1933836526663196674
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1914967166829932546
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API: https://www.runninghub.cn/runninghub-api-doc-en/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Otro LoRA del mismo autor: https://huggingface.co/RunningHubAI/rh-realistic-texture-of-skin-lora
- Listado de modelos de RunningHubAI: https://huggingface.co/RunningHubAI/models
- Ficha en RunningHub con nombre similar: https://www.runninghub.ai/model/public/1838852593643843585
- Ficha en aibase: https://model.aibase.com/models/details/1915687145924411393
- Ficha en PromptHero: https://prompthero.com/ai-models/realistic-skin-texture-style-xl-detailed-skin-download
