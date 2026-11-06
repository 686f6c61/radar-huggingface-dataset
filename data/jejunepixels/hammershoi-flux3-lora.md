# jejunepixels/Hammershoi-Flux3-LoRA

## Resumen

Hammershoi-Flux3-LoRA es un adaptador LoRA de bajo rango para generación de imágenes texto-a-imagen, entrenado sobre el modelo base FLUX 3 Image Klein Base de Black Forest Labs. Lo desarrolla el usuario jejunepixels y su objetivo es reproducir el estilo pictórico del pintor danés Vilhelm Hammershøi (1864-1916): paletas apagadas, interiores domésticos austeros, figuras solitarias y una atmósfera de quietud introspectiva. El adaptador se activa con la frase disparadora `hmrsh style` al final del prompt.

El modelo resuelve un problema concreto: obtener un estilo pictórico muy específico sin necesidad de describirlo en cada prompt. Según la model card, las imágenes de la galería se generaron con prompts que no contienen palabras de estilo, solo el sujeto y la frase disparadora. Esto reduce la longitud del prompt y mejora la consistencia estilística frente a la ingeniería de prompts manual.

Técnicamente es un LoRA de diffusers sobre un transformer de difusión, con un repositorio de 0,2 GB, entrenado con 288 recortes y ajustado en una única RTX 4090. Es relevante ahora porque acompaña al lanzamiento de la familia FLUX 3 y porque el autor publica versiones equivalentes para FLUX 1, FLUX 2 e Ideogram 4, lo que permite comparar el mismo estilo entre distintos motores generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusion FLUX 3 Image Klein Base |
| Parametros totales | no disponible (el repositorio ocupa 0,2 GB; el numero de parametros del adaptador no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite bfloat16 segun el codigo de ejemplo) |
| Idiomas soportados | ingles (en) |
| Licencia | flux-kommunity-license (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (`Hammershoi_flux3_klein.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre FLUX 3 Image Klein Base, un modelo de difusión texto-a-imagen de Black Forest Labs. El código de ejemplo usa `diffusers.modular_pipelines.Flux3AutoBlocks`, carga los componentes en `bfloat16` y permite eliminar el sub-bloque `prompt_upsampler` para enviar el prompt tal cual se escribe. El LoRA se carga con `pipe.load_lora_weights` y se activa mediante `set_adapters` con un peso de 1.0.

El entrenamiento se realizó con AI Toolkit sobre una RTX 4090, usando 288 recortes provenientes del dataset `jejunepixels/Hammershoi-Ideogram4-Dataset`, cuyas fuentes son SMK Open y Wikimedia Commons. Los pies de foto se limitaron a encuadre y sujeto, con un máximo de 15 palabras y sin términos de estilo; fueron redactados por Claude, revisados a mano y acortados por script, con comprobación por muestreo y correcciones manuales puntuales. No se documentan número de pasos de entrenamiento, tasa de aprendizaje ni composición exacta del dataset más allá de las fuentes citadas.

## Capacidades

- Generación de imágenes texto-a-imagen en el estilo pictórico de Vilhelm Hammershøi, activado con la frase `hmrsh style`.
- Reproducción de paletas apagadas, interiores domésticos vacíos, ventanas con luz natural, suelos de madera y paredes desnudas.
- Representación de figuras solitarias, frecuentemente mujeres de espaldas o de perfil y con vestimenta de época.
- Generación de paisajes urbanos tranquilos y fachadas planas con hileras de ventanas altas.
- Funciona tanto con prompts cortos como con descripciones completas de escena, según la model card.
- Control de intensidad del estilo mediante la escala LoRA: 1.0 para un efecto moderado y 1.5 para acercarse más a los colores apagados de las pinturas, con riesgo de grano.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es exclusivamente un adaptador de imagen.

## Casos de uso

- Ilustración editorial de temática nórdica: generar imágenes de acompañamiento para artículos sobre arte danés, arquitectura o literatura del siglo XIX, usando prompts de encuadre y sujeto más `hmrsh style` para obtener una estética coherente en toda la serie.
- Diseño de interiores y moodboards: producir referencias visuales de habitaciones austeras con luz natural y paletas apagadas, útiles para estudios de arquitectura que quieran explorar atmósferas minimalistas antes de pasar a renders técnicos.
- Preproducción audiovisual: crear planos conceptuales de interiores y figuras de época para cortometrajes o proyectos de vestuario ambientados en la Escandinavia de principios del siglo XX.
- Portadas de libros y publicaciones: generar cubiertas con una estética pictórica reconocible y consistente, ajustando la escala LoRA a 1.5 para acentuar el efecto de pintura.
- Pruebas de estilo comparativas: al existir versiones para FLUX 1, FLUX 2 e Ideogram 4 con el mismo dataset y frase disparadora, sirve para evaluar cómo cada motor base interpreta un mismo estilo pictórico.
- Docencia y divulgación artística: ilustrar explicaciones sobre Hammershøi y el simbolismo danés con imágenes generadas que respetan sus rasgos compositivos, siempre indicando que son recreaciones sintéticas.
- Exploración creativa personal: experimentar con la transferencia de estilo sobre sujetos contemporáneos, teniendo en cuenta que el adaptador puede transformar figuras modernas en personajes de época.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta pruebas cualitativas con seis prompts y una única semilla, a escala de guiado 3.5 y resolución 1024×1024.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, pero requiere cargar el modelo base FLUX 3 Image Klein Base, cuyo peso no se detalla en la información disponible.
- El código de ejemplo carga los componentes en `bfloat16` sobre CUDA, por lo que se necesita una GPU con memoria suficiente para el modelo base completo en esa precisión; la cifra exacta de VRAM no está disponible.
- El entrenamiento se realizó en una RTX 4090, lo que confirma que el flujo de ajuste es viable en hardware de consumo de gama alta.
- Despliegue mediante la librería `diffusers` instalada desde GitHub, junto con `peft`, usando `Flux3AutoBlocks` y `load_lora_weights`.
- No se documenta compatibilidad con ComfyUI, llama.cpp, Ollama, vLLM ni TGI; de hecho, la model card indica que no se ha probado en ComfyUI.
- No se publican cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hammershoi-Flux3-LoRA | FLUX 3 Image Klein Base | no disponible (repo de 0,2 GB) | no aplica | flux-kommunity-license | Hugging Face, 0 descargas |
| Hammershoi-Flux2-LoRA | FLUX 2 | no disponible | no aplica | no disponible en la información | Hugging Face |
| Hammershoi-Flux1-LoRA | FLUX 1 | no disponible | no aplica | no disponible en la información | Hugging Face |
| Hammershoi-Ideogram4-LoRA | Ideogram 4 | no disponible | no aplica | no disponible en la información | Hugging Face |

Las cuatro variantes comparten el mismo dataset de 288 recortes y la misma frase disparadora `hmrsh style`, según la model card, lo que las hace directamente comparables en cuanto a estilo aprendido, aunque no se han publicado métricas cuantitativas de fidelidad o calidad para ninguna de ellas.

## Limitaciones y advertencias

- Las pruebas son muy reducidas: seis prompts, una sola semilla, guiado 3.5 y resolución 1024×1024; otros sujetos, semillas y formatos no se han probado.
- No se ha probado con el upsampler de prompts de Klein, con el checkpoint destilado FLUX 3 Image Klein ni en ComfyUI.
- El adaptador puede alterar el sujeto, no solo la superficie: a escala 1.0 una figura moderna puede convertirse en una mujer con el pelo recogido y vestido oscuro de época aunque no se solicite.
- Rango temático estrecho: se entrenó con la obra de un solo pintor, con interiores daneses austeros, paisajes y retratos; las personas representadas son mayoritariamente europeas y a menudo mujeres con vestimenta oscura de época.
- Los pies de foto no son perfectos: se acortaron por script a partir de borradores de Claude revisados a mano, con comprobación por muestreo y correcciones puntuales.
- La licencia flux-kommunity-license impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE.md del repositorio antes de cualquier despliegue en producción.
- El modelo base está restringido (gated), por lo que hay que aceptar su licencia en la página de Hugging Face e iniciar sesión con un token antes de descargarlo.
- Solo se documenta soporte de inglés en los prompts; no hay evidencia de comportamiento con otros idiomas.
- Riesgo de alucinación visual y de resultados incoherentes fuera del dominio entrenado, dado el escaso conjunto de validación.

## Enlaces

- [Hugging Face: jejunepixels/Hammershoi-Flux3-LoRA](https://huggingface.co/jejunepixels/Hammershoi-Flux3-LoRA)
- [Modelo base: black-forest-labs/flux-3-image-klein-base](https://huggingface.co/black-forest-labs/flux-3-image-klein-base)
- [Dataset: jejunepixels/Hammershoi-Ideogram4-Dataset](https://huggingface.co/datasets/jejunepixels/Hammershoi-Ideogram4-Dataset)
- [Version FLUX 1: jejunepixels/Hammershoi-Flux1-LoRA](https://huggingface.co/jejunepixels/Hammershoi-Flux1-LoRA)
- [Version FLUX 2: jejunepixels/Hammershoi-Flux2-LoRA](https://huggingface.co/jejunepixels/Hammershoi-Flux2-LoRA)
- [Version Ideogram 4: jejunepixels/Hammershoi-Ideogram4-LoRA](https://huggingface.co/jejunepixels/Hammershoi-Ideogram4-LoRA)
- [SMK Open](https://open.smk.dk)
- [Wikimedia Commons](https://commons.wikimedia.org)
