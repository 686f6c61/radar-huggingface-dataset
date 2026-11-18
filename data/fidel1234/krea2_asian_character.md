# fidel1234/Krea2_Asian_Character

## Resumen

Krea2 Asian Character es un adaptador LoRA (Low-Rank Adaptation) para los modelos de generacion de imagen Krea-2 de Krea AI, concretamente para las variantes Krea-2-Raw y Krea-2-Turbo. Lo desarrolla el usuario fidel1234 y su proposito es especializar el modelo base en la generacion de personajes de ascendencia asiatica, con enfasis declarado en personajes japoneses. No es un modelo de lenguaje ni un modelo fundacional: es un complemento de bajo rango que modifica el comportamiento de un diffusion transformer ya entrenado.

El adaptador se entrena sobre Krea-2-Raw mediante el framework AI-Toolkit y se distribuye en formato safetensors compatible con la libreria diffusers y con ComfyUI. El repositorio ocupa 45,3 GB y acumula mas de un millon de descargas, lo que lo situa entre los LoRA de personaje mas utilizados del ecosistema Krea-2.

Su relevancia practica radica en que resuelve un sesgo conocido de los modelos de difusion generalistas: la infrarrepresentacion y la escasa coherencia anatomica y cultural en la representacion de rostros y corporalidades asiaticas. Al ser un LoRA, permite obtener esa especializacion sin reentrenar el modelo base, con un coste computacional de inferencia practicamente identico al del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre diffusion transformer Krea-2 |
| Parametros totales | no disponible (pesos del adaptador LoRA, no del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt se procesa con el text encoder del modelo base) |
| Licencia | MIT (sujeta ademas a la Krea 2 Community License y Acceptable Use Policy del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango que se inyecta en las capas del diffusion transformer de Krea-2. No modifica la arquitectura del modelo base: anade matrices de descomposicion de rango reducido que ajustan las proyecciones de atencion y feed-forward durante la generacion. El entrenamiento se realizo con AI-Toolkit sobre Krea-2-Raw, y el autor declara compatibilidad tanto con el checkpoint Raw como con el Turbo.

El dataset se describe como una seleccion manual ("hand-cherry-picked") con mezcla equilibrada de primeros planos, planos medios, cuerpo completo y distintos angulos, con el objetivo de permitir control flexible de encuadre y perspectiva. No se especifica el numero de imagenes, el numero de pasos de entrenamiento, el rango del LoRA ni la tasa de aprendizaje. El trigger word y el flujo de generacion no estan incrustados en el safetensors, sino en los metadatos de las imagenes de muestra del repositorio.

## Capacidades

- Generacion de imagenes de personajes asiaticos, con especializacion declarada en personajes japoneses.
- Control de encuadre: primeros planos, planos medios y cuerpo completo gracias a la composicion del dataset.
- Control de angulo y perspectiva, segun la mezcla de vistas del conjunto de entrenamiento.
- Compatibilidad con los dos checkpoints del modelo base: Krea-2-Raw (mayor fidelidad, mas pasos) y Krea-2-Turbo (menos pasos, orientado a velocidad).
- Integracion en ComfyUI mediante carga del safetensors y recuperacion del workflow desde la imagen de muestra.
- Compatibilidad con diffusers como libreria de referencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o video: es exclusivamente un modelo de sintesis de imagen.

## Casos de uso

- Ilustracion de personajes para manga y anime: el LoRA permite generar retratos y figuras de cuerpo completo con rasgos coherentes y encuadres variados, usando pesos entre 0,8 y 1,0 y entre 20 y 30 pasos sobre Krea-2-Raw.
- Creacion de assets para videojuegos: generacion de retratos de personajes y fichas de diseno con control de plano y angulo, util para preproduccion y prototipado rapido antes de encargar arte final.
- Prototipado de campanas de marketing dirigidas a publico asiatico: permite iterar conceptos visuales con representaciones culturalmente adecuadas sin depender de bancos de imagenes.
- Generacion de avatares y contenido para comunidades de rol o narrativa interactiva: la mezcla de encuadres del dataset facilita producir retratos consistentes para fichas de personaje.
- Flujos de trabajo en ComfyUI para estudios pequenos: al arrastrar la imagen de muestra se recupera el workflow completo, lo que reduce la curva de configuracion para equipos con poca experiencia en difusion.
- Iteracion rapida en produccion con Krea-2-Turbo: el adaptador funciona sobre el checkpoint Turbo, lo que permite generar variantes en pocos pasos para revisiones de direccion de arte.
- Fine-tuning posterior o composicion con otros LoRA: al ser un adaptador MIT en safetensors, se puede combinar con otros adaptadores de estilo o de vestuario dentro del mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador. El consumo vendra determinado por el checkpoint Krea-2 sobre el que se aplique, no por el LoRA, que anade una sobrecarga marginal.
- GPU recomendadas: no disponible. Depende del modelo base Krea-2; el adaptador en si no impone requisitos adicionales significativos.
- Cabe en GPU consumer: no disponible. La viabilidad dependera de la VRAM requerida por Krea-2-Raw o Krea-2-Turbo en la precision y cuantizacion elegidas.
- Opciones de despliegue: diffusers (libreria declarada) y ComfyUI (compatibilidad declarada con checkpoints raw y turbo). Otras opciones no disponibles.
- Latencia y throughput: no disponible. El autor recomienda entre 20 y 30 pasos de inferencia y pesos entre 0,8 y 1,0, pero no publica tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Licencia | Contexto de uso | Disponibilidad |
|---|---|---|---|---|---|
| Krea2 Asian Character (fidel1234) | LoRA de personaje | Krea-2-Raw / Krea-2-Turbo | MIT + licencia Krea 2 | Personajes asiaticos, sobre todo japoneses | Hugging Face, 1.056.207 descargas |
| Krea-2-Raw (krea) | Modelo base de difusion | no aplica | Krea 2 Community License | Generacion de imagen generalista | Hugging Face |
| Krea-2-Turbo (krea) | Modelo base de difusion | no aplica | Krea 2 Community License | Generacion de imagen rapida | Hugging Face |

No se dispone de informacion sobre otros LoRA de personaje comparables dentro del ecosistema Krea-2 en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin el checkpoint Krea-2-Raw o Krea-2-Turbo no genera nada.
- La licencia MIT del adaptador no exime del cumplimiento de la Krea 2 Community License Agreement y la Acceptable Use Policy del modelo base; el uso comercial esta sujeto a ambas.
- El autor no publica numero de imagenes de entrenamiento, rango del LoRA, hiperparametros ni composicion demografica del dataset, lo que impide evaluar el riesgo de sesgo y de sobreajuste.
- La especializacion declarada es en personajes japoneses; la representacion de otras poblaciones asiaticas puede ser menos fiable.
- Riesgo de sobreajuste a los encuadres y angulos concretos del dataset, con posible perdida de variedad fuera de esos patrones.
- El trigger word y los parametros exactos solo estan en los metadatos de las imagenes de muestra, no en el safetensors; sin esas imagenes el usuario debe inferir la configuracion.
- El autor advierte explicitamente contra la generacion de contenido enganoso, danino o no consentido de las personas representadas.
- No hay informacion sobre el comportamiento del adaptador en idiomas distintos del usado en los prompts de entrenamiento.
- El repositorio ocupa 45,3 GB, lo que implica un coste de almacenamiento y descarga considerable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fidel1234/Krea2_Asian_Character
- Demo / showcase: https://huggingface.co/spaces/fidel1234/Krea2_Asian_Character_Showcase
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
