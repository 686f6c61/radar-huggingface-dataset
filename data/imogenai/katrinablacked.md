# imogenai/katrinablacked

## Resumen

`imogenai/katrinablacked` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario imogenai y publicado bajo licencia Apache 2.0. No es un modelo fundacional autonomo: se trata de un fichero de pesos de bajo rango (repo de 1,0 GB) que debe cargarse sobre el modelo base `krea/Krea-2-Raw` o su variante destilada `krea/Krea-2-Turbo`. Su funcion es inyectar un concepto concreto, invocado mediante el token `katrinablacked`, en el espacio latente del modelo base.

El adaptador esta especializado en la generacion de imagenes fotorrealistas de una unica identidad femenina ficticia, con un estilo de fotografia amateur de movil y una estetica hiper-sexualizada muy concreta (maquillaje intenso, proporciones corporales exageradas, tatuajes y vestuario especificos). La model card incluye prompts de ejemplo con contenido sexual explicito, lo que situa el uso previsto en el ambito de la generacion de imagenes para adultos.

Su relevancia tecnica es limitada: cuenta con 2 descargas y 0 likes en el momento de la consulta, se publico y actualizo el mismo dia (25 de noviembre de 2026) y no incluye documentacion sobre dataset de entrenamiento, hiperparametros, numero de pasos ni evaluacion cuantitativa. Es, por tanto, un artefacto de nicho util para quien quiera reproducir ese concepto concreto sobre Krea 2, no una pieza de infraestructura general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion texto-a-imagen Krea 2; no se especifica si el backbone es UNet o DiT |
| Parametros totales | no disponible (repo de 1,0 GB, incluye pesos del adaptador y muestras) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; en difusion, la longitud relevante es la del prompt de texto, no disponible |
| Tipos de cuantizacion | no disponible; el ejemplo oficial usa `torch_dtype=torch.bfloat16` |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con `diffusers` (carga via `load_lora_weights`); no se detalla si safetensors o binario |

## Arquitectura y entrenamiento

El artefacto es un LoRA de DreamBooth entrenado sobre Krea 2 RAW y presentado por el autor sobre Krea 2 Turbo. DreamBooth es una tecnica de ajuste fino personalizado que asocia un token raro (aqui `katrinablacked`) a un sujeto o concepto a partir de un conjunto reducido de imagenes de referencia, y LoRA restringe la actualizacion a matrices de bajo rango para reducir el coste de almacenamiento y el olvido catastrofico. El resultado es un adaptador que se suma a los pesos congelados del modelo base en tiempo de inferencia.

No se dispone de informacion sobre el numero de imagenes del dataset, la resolucion de entrenamiento, el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni si se aplicaron tecnicas de regularizacion (prior preservation). Tampoco se documenta el pipeline de captions ni el modelo de texto utilizado. La unica indicacion operativa es que las muestras se generaron sobre la variante Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere un modelo destilado para pocos pasos y sin classifier-free guidance.

## Capacidades

- Generacion de imagenes fotorrealistas de una identidad concreta activada por el token `katrinablacked`.
- Reproduccion de un estilo fotografico amateur de smartphone con iluminacion natural y textura de piel realista, segun los prompts de ejemplo.
- Control de atributos fisicos, vestuario, complementos y entorno mediante lenguaje natural en el prompt (los ejemplos describen bikini, pendientes, tatuajes, unas postizas y una habitacion con luz solar).
- Compatibilidad con el ecosistema `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Compatibilidad con la variante Turbo para generacion en 8 pasos.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de audio; es exclusivamente texto-a-imagen.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles.

## Casos de uso

- Prototipado de personajes consistentes para ficcion: el token de activacion permite mantener una misma identidad visual a lo largo de varias generaciones, util para storyboards o moodboards de proyectos narrativos.
- Generacion de contenido para adultos con control de atributos: el adaptador esta entrenado para una estetica y un vestuario muy especificos, lo que reduce la iteracion necesaria frente a un modelo base generico en ese nicho.
- Pruebas de concepto de fotografia sintetica amateur: sirve para estudiar como un LoRA reproduce artefactos de camara movil (ruido, iluminacion dura, encuadre descuidado) sobre un modelo de difusion moderno.
- Investigacion sobre personalizacion con DreamBooth: util como caso de estudio de como un adaptador de bajo rango condiciona el sesgo y la diversidad de salidas de Krea 2.
- Integracion en pipelines `diffusers` para experimentacion: el ejemplo oficial permite cargar el LoRA en pocas lineas y comparar resultados sobre RAW frente a Turbo.
- Generacion de material de referencia para ilustracion o diseno de personajes en flujos creativos que ya trabajen con Krea 2.
- Evaluacion de riesgos de contenido: permite analizar como un adaptador de nicho amplifica sesgos de representacion corporal y sexualizacion en modelos texto-a-imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad) ni comparaciones cuantitativas con otros LoRA o modelos base. Solo se aportan tres imagenes de muestra generadas con Krea 2 Turbo a 8 pasos y `guidance_scale=0.0`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este adaptador de forma aislada; depende enteramente del modelo base Krea 2, cuyos requisitos no se detallan en la informacion proporcionada.
- El adaptador en si ocupa aproximadamente 1,0 GB en disco (tamano del repo, incluidas las imagenes de muestra); la carga en VRAM es marginal frente al modelo base.
- GPU recomendadas: no disponibles. El ejemplo oficial usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU con soporte de bfloat16 (Ampere o posterior, como A100, H100 o RTX 30/40).
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base Krea 2, no documentado aqui.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` es la unica via documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusion.
- Latencia y throughput: no disponibles. El autor indica 8 pasos de inferencia sobre Krea 2 Turbo, pero no aporta tiempos.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRA o adaptadores comparables en la documentacion proporcionada. La comparacion se limita a los dos modelos base sobre los que opera:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| imogenai/katrinablacked | LoRA DreamBooth | no disponible | no aplica | Apache 2.0 | Hugging Face, 2 descargas |
| krea/Krea-2-Raw | Modelo base texto-a-imagen | no disponible | no disponible | no disponible en esta ficha | Referenciado como base |
| krea/Krea-2-Turbo | Modelo base destilado | no disponible | no disponible | no disponible en esta ficha | Referenciado en el ejemplo de uso |

## Limitaciones y advertencias

- Contenido explicito: la model card incluye prompts y muestras con contenido sexual explicito y descripciones de proporciones corporales exageradas; no es apto para entornos sin filtrado de contenido.
- Sesgos de representacion: el adaptador fija una unica identidad y una estetica muy concreta, lo que reduce la diversidad de salidas y puede reforzar estereotipos corporales y de genero.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, manos deformes, texto ilegible y artefactos en complementos pequenos (pendientes, tatuajes, unas).
- Documentacion insuficiente: no se detallan dataset, hiperparametros, rango del LoRA ni evaluacion; la reproducibilidad es baja.
- Dependencia del modelo base: el comportamiento final depende de Krea 2 RAW o Turbo, cuyas limitaciones de contexto de prompt, idioma y licencia no se documentan en esta ficha.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero no exime del cumplimiento de la licencia del modelo base ni de la legislacion aplicable sobre contenido sexual y derechos de imagen.
- Idiomas: no se documenta soporte multilingue; los prompts de ejemplo estan en ingles y se desconoce el comportamiento en castellano.
- Madurez: 2 descargas y 0 likes, publicado el mismo dia de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imogenai/katrinablacked
- Modelo base RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Turbo (referenciado en el ejemplo): https://huggingface.co/krea/Krea-2-Turbo
- Documentacion de `diffusers`: https://huggingface.co/docs/diffusers
- Paper de DreamBooth: https://arxiv.org/abs/2208.12242
- Paper de LoRA: https://arxiv.org/abs/2106.09685
