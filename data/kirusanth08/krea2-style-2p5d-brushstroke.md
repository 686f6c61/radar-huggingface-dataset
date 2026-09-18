# kirusanth08/krea2-style-2p5d-brushstroke

## Resumen

krea2-style-2p5d-brushstroke es un adaptador LoRA de estilo para el modelo de difusión Krea 2, publicado por el usuario kirusanth08 en HuggingFace. Su objetivo es reproducir un estilo concreto de ilustración: concept art 2.5D de sombreado plano (flat-shaded), con pinceladas tipo cuchillo (knife strokes) y composiciones propias de hojas de turnaround de personaje (vista frontal y trasera). El adaptador se activa mediante el token disparador `kbrsh2d`.

El LoRA se entrenó sobre el checkpoint no destilado `krea/Krea-2-Raw`, requisito habitual en el entrenamiento de adaptadores de difusión, y está pensado para aplicarse en inferencia sobre `krea/Krea-2-Turbo` para generar en solo 8 pasos. El entrenamiento se realizó con DiffSynth-Studio, con rango 32 y 1000 pasos, guardando checkpoints intermedios cada 200 pasos. El dataset es deliberadamente pequeno: 25 imagenes de concept art seleccionadas y captionadas solo con contenido (sin palabras de estilo) y con la composicion descrita de forma explicita para evitar que el layout se filtrase al estilo aprendido.

Es relevante porque ejemplifica una practica muy extendida hoy: adaptar modelos de difusion grandes a un estilo visual muy especifico con muy pocos datos y un coste de entrenamiento reducido. El repositorio ocupa 1,2 GB e incluye cinco checkpoints `safetensors` (pasos 200, 400, 600, 800 y 1000), ademas de renders de evaluacion en `samples/`. La model card esta en ingles y la licencia es `other`, sin condiciones detalladas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango sobre un modelo de difusion Krea 2 (el codigo de uso carga el adaptador sobre `pipe.dit`); rango 32 |
| Parametros totales | No disponible (el repositorio pesa 1,2 GB e incluye 5 checkpoints, pero no se especifica el numero de parametros del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagen). El ejemplo de uso genera a 1024 x 1024 px |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (los prompts de ejemplo estan en ingles) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base (en el ejemplo, `pipe.dit`, lo que apunta a un transformer de difusion como bloque principal del generador). El rango declarado es 32. El adaptador no es un modelo autonomo: necesita el modelo base Krea 2 para funcionar.

El entrenamiento se hizo con DiffSynth-Studio sobre `krea/Krea-2-Raw` (checkpoint sin destilar), con 1000 pasos y guardado de checkpoints cada 200. El dataset son 25 imagenes de concept art de personajes con vistas frontales y traseras, en un estilo pictorico plano 2.5D. Las captions describen solo el contenido y detallan explicitamente la composicion, una decision de diseno orientada a que el modelo aprenda el estilo de pincelada y no la disposicion de las figuras. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas equivalentes, algo por otra parte poco habitual en adaptadores de estilo para difusion. Tampoco se detalla el numero de tokens, la composicion completa del dataset ni innovaciones tecnicas adicionales como decodificacion especulativa.

## Capacidades

- Generacion de imagen text-to-image con un estilo visual concreto: concept art 2.5D de sombreado plano y pincelada tipo cuchillo.
- Reproduccion de hojas de turnaround de personaje (vista frontal y trasera) cuando se describe esa composicion en el prompt.
- Activacion del estilo mediante el token disparador `kbrsh2d`, que debe incluirse en el prompt.
- Generacion rapida: 8 pasos de inferencia con Krea 2 Turbo, `cfg_scale=1` y `mu=1.15` segun el ejemplo de la model card.
- Generacion a 1024 x 1024 px en el ejemplo proporcionado, con semilla configurable.
- Compatibilidad con el ecosistema DiffSynth-Studio a traves de `Krea2Pipeline` y `pipe.load_lora`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural conversacional: es un adaptador de difusion, no un modelo de lenguaje.
- No se declaran capacidades de vision, audio ni modo thinking.

## Casos de uso

- Concept art de personajes para videojuegos: el LoRA genera figuras con pincelada plana y lectura 2.5D, adecuada para bocetos de personaje que luego se modelan en 3D. La coherencia de estilo entre iteraciones permite mantener una direccion artistica comun en todo el equipo.
- Hojas de turnaround para modelado 3D: la model card indica que el estilo captura composiciones de vista frontal y trasera, de modo que se pueden generar referencias ortograficas consistentes para artistas de modelado.
- Ilustracion editorial o de portada con estetica de pincelada marcada: util cuando se busca un acabado pictorico plano y no realista, con generacion en 8 pasos que abarata la iteracion sobre variantes.
- Moodboards y exploracion de direccion artistica: con 8 pasos por imagen y semilla fija es viable generar rapidamente series de variaciones para presentar opciones a un cliente antes de producir arte final.
- Previsualizacion de assets en pipelines de produccion: al ser un LoRA en `safetensors`, se puede cargar y descargar sobre el modelo base en un mismo servicio para alternar entre estilos sin duplicar el modelo completo.
- Reproduccion determinista de una estetica concreta: el uso de semilla fija y prompt fijo por checkpoint (como en los ejemplos de `samples/`) permite auditar como evoluciona el estilo entre los pasos 200 y 1000 y elegir el checkpoint que mejor encaje con la direccion de arte.
- Prototipado de personajes para pitching: generar un elenco de personajes con un estilo uniforme en una sola sesion, ya que el adaptador solo anade un token de activacion y no requiere reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente remite a la carpeta `samples/` del repositorio, que contiene renders de evaluacion por checkpoint (Turbo + LoRA, con semilla y prompt fijos por checkpoint), sin metricas cuantitativas como FID, CLIP score ni comparaciones numericas con otros estilos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La informacion proporcionada no incluye cifras de memoria ni de rendimiento.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `device="cuda"` y `torch_dtype=torch.bfloat16`, por lo que se requiere una GPU con soporte de bfloat16.
- Compatibilidad con GPU de consumo: no disponible. Al ser un LoRA sobre Krea 2, el requisito dominante es el del modelo base (Krea 2 Turbo mas los componentes auxiliares Qwen3-VL-4B-Instruct y el VAE de Qwen-Image), no el del adaptador, que ocupa un espacio reducido dentro del repositorio de 1,2 GB.
- Opciones de despliegue: el unico flujo documentado es `Krea2Pipeline` de DiffSynth-Studio, cargando el LoRA con `pipe.load_lora(pipe.dit, "checkpoints/step-1000.safetensors")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, el flujo documentado usa 8 pasos de inferencia y `cfg_scale=1`, lo que reduce el coste respecto a configuraciones con mas pasos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de estilo comparables sobre Krea 2 ni datos de rendimiento que permitan una comparacion objetiva con alternativas de la misma categoria. Como referencia estructural, los elementos con los que se puede contrastar son el rango del adaptador (32), el numero de pasos de entrenamiento (1000), el tamano del dataset (25 imagenes) y el token disparador (`kbrsh2d`), pero no se dispone de valores equivalentes de otros modelos.

## Limitaciones y advertencias

- Dataset muy reducido: 25 imagenes. Esto aumenta el riesgo de sobreajuste y de que el estilo se aplique de forma poco flexible a contenidos alejados de las referencias (personajes humanos con armadura, vistas frontales y traseras).
- Sesgo de dominio: el adaptador esta entrenado sobre un unico tipo de imagen y composicion, por lo que su comportamiento fuera de ese dominio es incierto y no esta documentado.
- Riesgo de contaminacion de estilo por composicion: la propia model card reconoce que se describio el layout explicitamente en las captions para evitar que se filtrase al estilo, lo que sugiere que este riesgo existia durante el entrenamiento.
- Requiere el token disparador `kbrsh2d` en el prompt; sin el, el efecto del LoRA puede ser parcial o inexistente.
- Dependencia de dos checkpoints distintos del modelo base: `krea/Krea-2-Raw` para el entrenamiento y `krea/Krea-2-Turbo` para la inferencia rapida. Usar el adaptador con otros checkpoints no esta documentado.
- Licencia `other` sin terminos detallados en la informacion disponible: antes de un uso comercial es imprescindible revisar las condiciones reales de la licencia y las del modelo base Krea 2.
- No se declaran idiomas soportados ni se validan prompts en castellano; los ejemplos estan en ingles.
- Sin datos de benchmarks, no hay evidencia cuantitativa de calidad ni de fidelidad al estilo de referencia mas alla de los renders cualitativos en `samples/`.
- Popularidad muy baja (0 descargas, 1 like) y fecha de creacion reciente (18 de septiembre de 2026): no hay validacion independiente por parte de la comunidad.
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces encontrados pertenecian a un tema sin relacion (polen de ambrosia), por lo que no se han incluido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kirusanth08/krea2-style-2p5d-brushstroke
- Modelo base de entrenamiento: https://huggingface.co/krea/Krea-2-Raw
- Modelo base de inferencia (Turbo): https://huggingface.co/krea/Krea-2-Turbo
- Componente auxiliar de texto/vision: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- VAE utilizado en el pipeline: https://huggingface.co/Qwen/Qwen-Image
- Repositorio del trainer (DiffSynth-Studio): URL no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
