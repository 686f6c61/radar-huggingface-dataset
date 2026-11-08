# ShadowFrame7/Krea-2-Iris-V2-Character-LoRA

## Resumen

Iris V2 es un LoRA de personaje para el modelo de generacion de imagenes Krea 2 Raw, desarrollado por el usuario ShadowFrame7 y publicado en Hugging Face. Se trata de un adaptador de bajo rango que ensena al modelo base a reproducir un personaje femenino concreto, activado mediante el token de instancia `K_Sc_Sc1r1s_KSC`. El repositorio contiene unicamente los pesos del LoRA (0,3 GB), no el modelo base completo, por lo que requiere descargar y cargar Krea 2 Raw por separado.

El modelo resuelve un problema acotado y muy comun en flujos de trabajo de difusion: mantener la consistencia de identidad de un personaje a traves de multiples generaciones, poses, encuadres e iluminaciones. La model card incluye ejemplos de prompt que cubren retratos editoriales, escenas de calle, fotografia en blanco y negro y composiciones cinematograficas, todos ellos activando el mismo token de instancia.

La relevancia de esta ficha es limitada en terminos de impacto tecnico: se publico el 7 de noviembre de 2026, cuenta con 0 descargas y 1 like en el momento de la consulta, y no incluye informacion sobre el dataset de entrenamiento, hiperparametros ni evaluaciones cuantitativas. Su interes practico radica en ser un ejemplo del ecosistema de LoRAs de personaje sobre Krea 2 y en las restricciones de licencia que impone el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusion Krea 2 Raw |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | krea-2-community-license-v1 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre Krea 2 Raw, un modelo de difusion texto-a-imagen. La model card no especifica la arquitectura interna del modelo base, el rango del LoRA, las capas adaptadas ni el numero de parametros entrenados. El token de instancia definido por el autor es `K_Sc_Sc1r1s_KSC`, y los ejemplos de la model card lo activan mediante la sintaxis `<lora:K2_Iris_KSC_9:1>`, lo que sugiere un peso de escala 1 y una version 9 del adaptador.

No se han publicado datos sobre el conjunto de imagenes de entrenamiento (numero de imagenes, resolucion, proceso de captioning), la duracion del entrenamiento, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion. La unica referencia externa encontrada son dos herramientas de la comunidad para entrenar LoRAs de personaje sobre Krea 2 (krea2-character-lora-trainer y Krea2Trainer), que describen flujos tipicos de 10 a 20 imagenes con auto-captioning, pero no hay confirmacion de que el autor las haya utilizado.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada a la identidad del personaje Iris, mediante el token `K_Sc_Sc1r1s_KSC`.
- Reproduccion consistente del personaje en distintos encuadres: primer plano, plano medio, cuerpo entero y tomas en picado.
- Control de vestuario y atributos fisicos mediante prompt (color de pelo, ropa, accesorios), manteniendo el rostro del personaje.
- Estilos fotograficos variados segun los ejemplos: retrato editorial, fotografia callejera, blanco y negro de estudio, cinematografico con grano de pelicula.
- Iluminacion y atmosfera controlables por prompt: luz natural, golden hour, neon, luz de estudio.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada; es exclusivamente generacion de imagen a partir de texto.
- Capacidades multilingues: no documentadas; los ejemplos estan en ingles.

## Casos de uso

- Creacion de personajes consistentes para narrativa visual: el LoRA permite generar la misma protagonista en multiples escenas de un comic o storyboard manteniendo el rostro y las proporciones, usando el token de instancia en cada prompt.
- Prototipado de personajes para videojuegos o animacion: iterar rapidamente sobre vestuario, poses y encuadres de un personaje antes de encargar el modelado 3D definitivo.
- Generacion de material promocional ficticio: retratos editoriales y escenas de estilo revista para maquetas de campanas, con control de iluminacion y composicion mediante prompt.
- Pruebas de concepto de fotografia virtual: simular sesiones con distintos esquemas de luz (golden hour, estudio, neon) sobre un mismo sujeto para evaluar direccion de arte.
- Ilustracion de ficcion y fan art: producir variaciones de escena de un personaje concreto sin perder la identidad entre imagenes.
- Investigacion sobre LoRAs de identidad: usar el adaptador como caso de estudio para medir deriva de identidad, sensibilidad al token de instancia y efecto de la escala del LoRA en la fidelidad del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA pesa 0,3 GB en safetensors; la VRAM real la determina el modelo base Krea 2 Raw, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible. Al ser un modelo de difusion de imagen, se requiere una GPU con suficiente VRAM para el modelo base completo; no se especifica el minimo.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la cuantizacion aplicada a este.
- Opciones de despliegue: la libreria declarada es diffusers, por lo que el flujo esperado es cargar Krea 2 Raw con `DiffusionPipeline` y aplicar el LoRA con `load_lora_weights`. No se documentan otros backends (ComfyUI, A1111, llama.cpp no aplica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ShadowFrame7/Krea-2-Iris-V2-Character-LoRA | LoRA de personaje | krea/Krea-2-Raw | no disponible | no aplica | krea-2-community-license-v1 | Hugging Face, 0 descargas |
| krea2-character-lora-trainer (bongobongo2020) | Herramienta de entrenamiento | Krea 2 | no aplica | no aplica | no disponible | GitHub |
| Krea2Trainer (CaptainGrock) | Herramienta de entrenamiento | Krea 2 | no aplica | no aplica | no disponible | GitHub |

No se dispone de informacion sobre otros LoRAs de personaje comparables publicados sobre Krea 2, ni de metricas de fidelidad de identidad que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos de representacion del personaje (edad, etnia, contextura) ni el riesgo de sobreajuste a las imagenes originales.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta (manos, dedos, proporciones) y artefactos en fondos o texto.
- La fidelidad del personaje depende del peso del LoRA y del prompt; los ejemplos usan escala 1, pero no se documenta el comportamiento a otras escalas ni la interferencia con otros LoRAs.
- El modelo base solo acepta prompts en ingles en los ejemplos; el soporte de otros idiomas no esta documentado.
- Restriccion de licencia: se hereda la krea-2-community-license-v1 del modelo base, cuyos terminos completos estan en el enlace de la model card; es imprescindible revisarlos antes de cualquier uso comercial, ya que la licencia se etiqueta como "other" y no como open source permisiva.
- El repositorio tiene 0 descargas y 1 like, sin validacion externa de la comunidad; no hay garantia de mantenimiento ni de soporte del autor.
- Algunos ejemplos de la model card incluyen descripciones de contenido sugestivo; conviene revisar las politicas de contenido aplicables antes de desplegar el modelo en productos publicos.
- No se especifican requisitos de VRAM ni rendimiento, por lo que el coste de inferencia debe medirse empiricamente con el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/ShadowFrame7/Krea-2-Iris-V2-Character-LoRA
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia krea-2-community-license-v1: https://cdn.jsdelivr.net/gh/krea-ai/krea-2@db3984fbc6e13b34c0064990fc2d95ac64d00058/assets/hf_samples/LICENSE.pdf
- Herramienta de entrenamiento krea2-character-lora-trainer: https://github.com/bongobongo2020/krea2-character-lora-trainer
- Herramienta de entrenamiento Krea2Trainer: https://github.com/CaptainGrock/Krea2Trainer
