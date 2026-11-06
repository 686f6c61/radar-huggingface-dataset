# mguiicvjob/z-image-cyberrealistic-v9-gguf

## Resumen

CyberRealistic v9 Z-Image Turbo es un modelo de difusion texto-a-imagen derivado del checkpoint CyberRealistic Z-Image Turbo publicado en Civitai, convertido a formato GGUF por el usuario mguiicvjob para su uso con stable-diffusion.cpp y ComfyUI. Se trata de un modelo de generacion de imagenes fotorrealistas construido sobre la arquitectura Lumina2 (Z-Image Turbo), con 6.154.908.736 parametros en el checkpoint de difusion original, y esta disenado especificamente para producir retratos y escenas con textura de piel natural, anatomia coherente y fisica de iluminacion realista.

La novedad principal de la version v9 respecto a v8 es un cambio de filosofia de prompting: el modelo abandona la dependencia de pilas de etiquetas (tag stacks) y palabras de refuerzo como "masterpiece" o "8k" en favor de descripciones en lenguaje natural sobre iluminacion, escena y materiales. Segun el autor, esto se traduce en piel con microdetalle visible (poros, lineas de expresion, barba incipiente), manos anatomicamente correctas en poses complejas, iluminacion mixta con temperaturas de color distintas y texturas de materiales fieles a sus propiedades fisicas.

El repositorio incluye todo lo necesario para la inferencia: modelo de difusion, text encoder y VAE, empaquetados en cuantizaciones GGUF que van desde Q3_K (4,31 GB) hasta Q8_0 (7,34 GB). El autor reporta generacion local a 1024x1024 en una GTX 1070 de 8 GB de VRAM, lo que situa al modelo en el rango de consumo para hardware de gama media. La licencia es CreativeML OpenRAIL-M y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Z-Image Turbo (Lumina2), modelo de difusion texto-a-imagen |
| Parametros totales | 6.154.908.736 (checkpoint de difusion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no usa contexto de texto autoregresivo) |
| Tipos de cuantizacion | Q3_K, Q4_K_S, Q4_K, Q5_K, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | GGUF (para stable-diffusion.cpp y ComfyUI); checkpoint original en Civitai |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Lumina2, la misma familia que Z-Image Turbo, un modelo de difusion para generacion de imagenes. El checkpoint de difusion contiene 6.154.908.736 parametros y se distribuye junto con un text encoder y un VAE separados, todos incluidos en el repositorio. La model card indica que Z-Image (Lumina2) no se beneficia de recetas de cuantizacion mixtas con sufijos `_S`/`_M`/`_L`, ya que `llama-quantize` produce archivos identicos byte a byte a los tipos base `_K`; por ello el repositorio publica unicamente cuantizaciones base.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. El modelo base es `cyberdelia/cyberrealistic_zimage`, cuyo checkpoint original fue descargado de Civitai y posteriormente convertido a GGUF. La innovacion tecnica destacable es el ajuste fino orientado a fotorrealismo: la version v9 prioriza la comprension de lenguaje descriptivo natural sobre etiquetas, mejorando la coherencia anatomica (manos, dedos, articulaciones) y la fisica de la iluminacion mixta.

## Capacidades

- Generacion de imagenes fotorrealistas texto-a-imagen a partir de descripciones en lenguaje natural.
- Comprension de indicaciones sobre iluminacion, escena y materiales sin necesidad de palabras de refuerzo como "masterpiece" o "8k".
- Renderizado de piel con microdetalle: poros visibles, lineas de frente, patas de gallo, barba incipiente y tono de piel irregular.
- Anatomia de manos coherente en poses complejas, incluyendo interaccion con objetos (por ejemplo, tocar una guitarra).
- Iluminacion mixta realista con multiples fuentes de distinta temperatura de color.
- Texturas de materiales fieles: cuero agrietado con manchas de aceite, ceramica con craquelado, laton con pátina y arañazos.
- Composicion estable en escenas amplias con varios personajes, sin duplicacion de caras ni fusion de extremidades.
- Generacion de una imagen completa a partir de un prompt descriptivo minimo de una sola frase.
- Compatibilidad con ComfyUI (incluye workflow de ejemplo) y con stable-diffusion.cpp.
- Soporte de metadatos embebidos en los PNG de ejemplo (workflow y prompt de ComfyUI).

## Casos de uso

- Retratos fotorrealistas para estudio: el modelo genera primeros planos con textura de piel natural y microdetalle (poros, lineas de expresion) a partir de descripciones de iluminacion, adecuado para pruebas de concepto de fotografia editorial sin sesion real.
- Generacion de escenas costumbristas y documentales: escenas amplias con varios personajes (por ejemplo, un mercado de agricultores) mantienen figuras distinguibles y planos de profundidad coherentes, util para storyboards o moodboards de produccion.
- Ilustracion de interacciones manuales con objetos: la coherencia anatomica en manos permite generar imagenes de personas tocando instrumentos, cosiendo o manipulando herramientas, un caso historicamente problematico en modelos de difusion.
- Creacion de bodegones y still life de materiales: la fidelidad en texturas (cuero, ceramica, laton) sirve para catalogos de producto o referencias de diseno industrial donde importa la apariencia fisica del material.
- Prototipado rapido en hardware de consumo: con cuantizacion Q4_K (5,15 GB) el modelo cabe en una GTX 1070 de 8 GB y genera a 1024x1024, lo que permite iterar localmente sin GPU de datacenter.
- Integracion en pipelines de ComfyUI: el repositorio incluye workflow de ejemplo y metadatos embebidos en los PNG, lo que facilita reproducir ajustes de sampler y seed en produccion automatizada.
- Generacion de fondos y escenarios con iluminacion mixta: escenas con luz fluorescente fria y luz solar calida simultaneas son utiles para composiciones de arquitectura de interiores o cinematografia virtual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion del modelo de difusion: Q3_K ~6 GB, Q4_K_S y Q4_K ~8 GB (recomendado Q4_K para 8 GB), Q5_K 8-10 GB, Q6_K y Q8_0 12+ GB. Hay que sumar la memoria del text encoder y el VAE incluidos en el repositorio.
- GPU recomendadas: el autor verifico funcionamiento en una GTX 1070 de 8 GB a 1024x1024; para cuantizaciones Q6_K y Q8_0 se recomienda 12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, al menos en GTX 1070 8 GB con Q4_K; cuantizaciones superiores requieren GPUs consumer de 12 GB o mas.
- Opciones de despliegue: stable-diffusion.cpp (libreria declarada del repo), ComfyUI (con workflow de ejemplo y nodos z-image-power-nodes), y por extension cualquier runtime que consuma GGUF de difusion. No se menciona soporte nativo de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el autor solo indica generacion local a 1024x1024 en GTX 1070 sin cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberRealistic v9 Z-Image Turbo (este) | 6.154.908.736 | no aplica (difusion) | Fotorrealismo, Lumina2, GGUF | creativeml-openrail-m | Hugging Face, Civitai |
| CyberRealistic Z-Image Turbo v8 (version previa) | no disponible | no aplica | Fotorrealismo, dependiente de tags | creativeml-openrail-m (presumible) | Civitai |
| Z-Image Turbo base (Lumina2) | no disponible | no aplica | Difusion texto-a-imagen general | no disponible | no disponible |

La comparativa se limita a la version previa del mismo modelo y a la arquitectura base, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas de otros autores. No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles: los prompts en otros idiomas pueden degradar la calidad o producir resultados incoherentes.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos o fisicos plausibles pero incorrectos (dedos adicionales en casos no cubiertos por el ajuste, texto ilegible en carteles, reflejos inconsistentes).
- Sesgos conocidos: no se documentan en la informacion disponible; el modelo hereda los sesgos del dataset de entrenamiento del checkpoint base CyberRealistic Z-Image Turbo.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos descritos en la licencia); es necesario revisar los terminos completos antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-02): no hay validacion de la comunidad ni historial de uso.
- El autor no publica cifras de latencia, throughput ni benchmarks de calidad objetiva (FID, CLIP score); las afirmaciones de mejora se basan en comparaciones visuales subjetivas con v8.
- La cuantizacion Q4_K_S se conserva junto a Q4_K por tamano, pero el autor indica que los archivos `_K` base son identicos byte a byte a las recetas mixtas, por lo que no debe esperarse una diferencia de calidad entre ambas.
- El modelo requiere descargar el text encoder y el VAE del mismo repositorio (49,5 GB de tamano total), lo que incrementa el espacio en disco y el tiempo de puesta en marcha.

## Enlaces

- Hugging Face: https://huggingface.co/mguiicvjob/z-image-cyberrealistic-v9-gguf
- Modelo base en Hugging Face: https://huggingface.co/cyberdelia/cyberrealistic_zimage
- Checkpoint original en Civitai: https://civitai.com/models/2218365/cyberrealistic-z-image-turbo
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Workflow de ejemplo en el repo: examples/example_workflow.jpg (ruta relativa dentro del repositorio)
- Imagenes de ejemplo con metadatos: examples/e0.png a examples/e5.png (rutas relativas dentro del repositorio)
