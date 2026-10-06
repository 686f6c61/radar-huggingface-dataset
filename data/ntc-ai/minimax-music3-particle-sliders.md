# ntc-ai/minimax-music3-particle-sliders

## Resumen

ntc-ai/minimax-music3-particle-sliders es una coleccion de adaptadores LoRA publicada por el usuario ntc-ai sobre el modelo base MiniMaxAI/MiniMax-Music3, un sistema de generacion de musica a partir de texto. Los adaptadores no sustituyen al modelo base: modifican la etapa de lenguaje que planifica la musica dentro de MiniMax Music 3, de modo que cada LoRA actua como un control continuo (un "slider") que empuja la generacion hacia un rasgo vocal o de genero concreto, por ejemplo una voz femenina, metal, house o disco funk.

El repositorio se publico el 16 de agosto de 2026 y se actualizo el 6 de octubre del mismo ano. La revision destacada en la model card data del 16 de septiembre de 2026 e incluye dieciseis LoRA de voz y genero reentrenados, con muestras de audio emparejadas y exportaciones para ComfyUI. Cada control se entrena con runs de cuatro prompts y se selecciona un checkpoint final mediante una auditoria por slider; los pasos seleccionados varian entre 1.000, 2.000, 3.000 y 3.400 segun el control.

Su relevancia practica esta en el control fino sin reentrenar el modelo completo: en lugar de prompt engineering puro, el usuario puede modular atributos musicales concretos aplicando el adaptador con una intensidad determinada (los ejemplos publicados usan fuerza +1). La licencia es MIT, lo que facilita su integracion en productos comerciales, aunque la informacion disponible no detalla el tamano de parametros, la longitud de contexto ni los idiomas soportados, ni del adaptador ni del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre el modelo base MiniMaxAI/MiniMax-Music3 (text-to-music); los adaptadores modifican la etapa de lenguaje que planifica la musica |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible; el autor publica descargas nativas y exportaciones para ComfyUI, con libreria diffusers |
| Tamano del repositorio | 7,7 GB (incluye los adaptadores y las muestras de audio) |
| Pipeline declarado | text-to-audio |
| Modelo base | MiniMaxAI/MiniMax-Music3 |
| Numero de adaptadores | 16 LoRA de voz y genero en la revision del 16 de septiembre de 2026 |
| Descargas | 0 |
| Likes | 20 |

## Arquitectura y entrenamiento

La model card indica que MiniMax Music 3 genera musica y que estos adaptadores LoRA actuan sobre el modelo de lenguaje que planifica la pieza musical. Es decir, el control no se aplica directamente sobre el decodificador de audio, sino sobre la etapa de planificacion: el adaptador sesga las decisiones de estructura, instrumentacion y caracter vocal antes de que se sintetice la onda. Los adaptadores se cargan mediante diffusers de forma nativa o mediante las exportaciones para ComfyUI.

El proceso de entrenamiento descrito es deliberadamente acotado: cada control se entrena con runs de cuatro prompts, y despues se realiza una auditoria por slider para elegir el checkpoint final entre los pasos 1.000, 2.000, 3.000 y 3.400. En los ejemplos publicados, Female y House usan el paso 1.000, mientras que Metal y Disco Funk usan el paso 2.000. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se detalla el rango, el target de modulos ni el factor de escala interno de los LoRA.

## Capacidades

- Generacion de musica a partir de texto (text-to-music) heredada del modelo base MiniMax Music 3, con prompt y letra como entradas segun los ejemplos publicados.
- Control de rasgo vocal: el adaptador Female empuja la generacion hacia una voz femenina.
- Control de genero musical: los adaptadores publicados incluyen al menos Metal, House y Disco Funk.
- Aplicacion de controles como sliders de intensidad: los ejemplos comparan el mismo prompt, la misma letra y la misma semilla con el adaptador desactivado (0) y activado con fuerza +1.
- Reproducibilidad por semilla: las muestras pareadas usan semillas fijas (por ejemplo, la semilla 1709), lo que permite comparaciones controladas.
- Carga nativa mediante diffusers y exportaciones para ComfyUI.
- Uso combinado con el modelo base, no autonomo: los adaptadores requieren MiniMax Music 3 para funcionar.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; se trata de un sistema de generacion musical, no de un modelo conversacional general.

## Casos de uso

- Produccion musical asistida por prompt: un compositor genera una maqueta con MiniMax Music 3 y aplica el LoRA Metal con fuerza +1 para explorar rapidamente una version con guitarras distorsionadas, sin reentrenar ni cambiar de modelo.
- Prototipado de bandas sonoras para videojuegos: se fija una semilla y una letra, y se alternan los adaptadores House y Disco Funk para obtener variaciones de genero coherentes con una misma estructura, utiles como referencia para el equipo de audio.
- Demo de control fino en interfaces creativas: el repositorio incluye un Space de HuggingFace que permite activar y desactivar cada control y comparar el resultado, lo que sirve como base para construir un panel de sliders en un producto web.
- Integracion en flujos ComfyUI: dado que el autor publica exportaciones para ComfyUI, estos adaptadores pueden insertarse en grafos de generacion de audio existentes para anadir un selector de voz o de genero sin salir del entorno.
- Personalizacion de voz en jingles y anuncios: el adaptador Female permite dirigir la interpretacion vocal hacia un registro femenino manteniendo el mismo prompt y la misma letra, lo que agiliza la entrega de variantes a un cliente.
- Investigacion sobre control de atributos en modelos generativos musicales: los pares de muestras con semilla, prompt y letra constantes constituyen un material de partida para estudiar hasta que punto un LoRA cambia el contenido frente al estilo, dado que el propio autor advierte que la composicion y el fraseo pueden variar.
- Curacion de paletas de genero para catalogos musicales: un estudio puede mantener los dieciseis adaptadores y asignar a cada pista una etiqueta de genero o voz, aplicando el LoRA correspondiente sobre una plantilla de prompt comun.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas cuantitativas (FAD, KL, similitud de embeddings ni evaluaciones humanas con puntuacion), sino comparaciones cualitativas de audio emparejado.

Los unicos datos verificables de la model card son los checkpoints seleccionados y las condiciones de comparacion:

| Control | Semilla de ejemplo | Checkpoint seleccionado | Condicion Off | Condicion On |
|---|---|---|---|---|
| Female | 1709 | paso 1.000 | adaptador a 0 | adaptador a +1 |
| Metal | 1709 | paso 2.000 | adaptador a 0 | adaptador a +1 |
| House | 1709 | paso 1.000 | adaptador a 0 | adaptador a +1 |
| Disco Funk | 1709 | paso 2.000 | adaptador a 0 | adaptador a +1 |

En cada par, el prompt, la letra y la semilla se mantienen, pero el autor indica que la composicion y el fraseo pueden cambiar entre las versiones Off y On, por lo que la comparacion no aisla completamente el efecto del adaptador.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion proporcionada. Los adaptadores LoRA anaden una sobrecarga minima frente al modelo base, por lo que el requisito real lo determina MiniMax Music 3, cuyas especificaciones no se detallan.
- GPU recomendadas: no disponible. No se publican requisitos de GPU en la model card.
- Compatibilidad con GPU de consumo: no disponible. El repositorio ocupa 7,7 GB en total, pero ese tamano incluye los dieciseis adaptadores y las muestras de audio, no los pesos del modelo base.
- Opciones de despliegue: carga nativa con la libreria diffusers (pipeline text-to-audio) y exportaciones especificas para ComfyUI. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de pipeline.
- Latencia y throughput: no disponible. No se publican tiempos de generacion ni rendimiento por lote.
- Requisito indispensable: disponer del modelo base MiniMaxAI/MiniMax-Music3; los LoRA por si solos no generan audio.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con la linea de adaptadores del mismo autor.

| Modelo | Tipo | Adaptadores / controles | Licencia | Disponibilidad |
|---|---|---|---|---|
| ntc-ai/minimax-music3-particle-sliders | Coleccion de LoRA sobre MiniMax Music 3 | 16 LoRA de voz y genero (revision del 16 de septiembre de 2026) | MIT | HuggingFace, 0 descargas, 20 likes; Space propio y exportaciones ComfyUI |
| MiniMaxAI/MiniMax-Music3 | Modelo base text-to-music | no aplica | no disponible | Modelo base referenciado por el adaptador |
| ntc-ai/yue2-particle-sliders | Coleccion de LoRA sobre otro modelo base (YuE2) | no disponible | no disponible | HuggingFace, con Space propio |

No se dispone de datos de parametros, contexto, rendimiento ni licencia de los modelos comparados, salvo la licencia MIT de este repositorio. No se han identificado en la busqueda web alternativas tecnicamente comparables con datos verificables.

## Limitaciones y advertencias

- Independencia del modelo base: los adaptadores no funcionan solos; requieren MiniMax Music 3 y su licencia y condiciones de uso.
- Posible sobreajuste: los controles se entrenan con runs de cuatro prompts, lo que puede limitar su generalizacion a estilos, idiomas o estructuras alejadas de los ejemplos de entrenamiento.
- Variabilidad no controlada: el autor advierte que, incluso fijando prompt, letra y semilla, la composicion y el fraseo pueden cambiar entre la version Off y la version On, de modo que el adaptador no es un control puramente estilistico.
- Ausencia de evaluacion cuantitativa: no hay benchmarks publicados, por lo que la calidad percibida depende de la escucha de las muestras del repositorio.
- Fuerza del control: los ejemplos publicados usan fuerza +1; no se documenta el comportamiento con valores negativos, intermedios o superiores, ni el riesgo de degradacion del audio.
- Idiomas: no disponibles. No se especifica en que idiomas funcionan las letras ni el prompt.
- Sesgos: no se documentan sesgos conocidos del adaptador ni del modelo base.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero existe riesgo de que la letra generada o el contenido musical no se ajuste al prompt.
- Licencia: MIT en el repositorio del adaptador, lo que permite uso comercial del adaptador; conviene verificar por separado la licencia del modelo base MiniMax Music 3, que no se detalla en la informacion disponible.
- Madurez del repositorio: 0 descargas registradas en el momento de la consulta, con 20 likes, lo que indica una adopcion todavia muy limitada.
- Resultados de busqueda web no relevantes: las consultas devolvieron paginas sobre un torneo de tenis amateur y una empresa de climatizacion, sin relacion con el modelo, por lo que no aportan datos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ntc-ai/minimax-music3-particle-sliders
- Space de demostracion: https://huggingface.co/spaces/ntc-ai/minimax-music3-particle-sliders
- Modelo base MiniMax Music 3: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Pesos de sliders para YuE2 del mismo autor: https://huggingface.co/ntc-ai/yue2-particle-sliders
- Space de YuE2 particle sliders: https://huggingface.co/spaces/ntc-ai/yue2-particle-sliders
- Muestras de audio de la revision de septiembre de 2026: https://huggingface.co/ntc-ai/minimax-music3-particle-sliders/resolve/main/samples/uni16-fresh-selected-v2/female/row2-seed1709-off.wav (y rutas equivalentes por control)
- Paper, blog tecnico o repositorio de codigo: no disponible en la informacion proporcionada
