# bumblebeeman/runa-toon-full

## Resumen

runa-toon-full es un adaptador LoRA (Low-Rank Adaptation) de personaje para generacion de imagenes, publicado por el usuario bumblebeeman (Robert Kryjak) sobre el modelo base krea/Krea-2-Raw. No se trata de un modelo de lenguaje ni de un modelo completo, sino de un peso adicional que se acopla al modelo base de difusion para ensenar un concepto concreto: el personaje ficticio de dibujo animado para adultos llamado Runa, activado mediante la palabra clave `runaig`.

El adaptador se entreno con musubi-tuner sobre Krea 2 RAW y esta pensado para usarse con las variantes Krea 2 Turbo y dark-beast-krea2. La configuracion declarada es de rank 32 con alpha 32, y el entrenamiento se detuvo en la epoca 26 de un total de 30. El conjunto de datos de entrenamiento consta de 36 imagenes SFW y 24 imagenes adultas (desnudos, sin actos sexuales explicitos), lo que da un total de 60 imagenes.

Es relevante ahora por su caracter de ejemplo de LoRA de personaje de bajo coste para la familia Krea 2, aunque el repositorio no ha registrado descargas ni valoraciones en el momento de la consulta. El contenido adulto esta marcado como no apto para todas las audiencias (not-for-all-audiences), lo que condiciona su distribucion y uso. La informacion publica disponible es muy limitada: no se documentan idiomas, benchmarks ni requisitos de hardware oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion krea/Krea-2-Raw |
| Parametros totales | no disponible (el repositorio ocupa 0.5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | no disponible (pesos de LoRA; no se detalla extension en la informacion) |

Otros datos declarados por el autor: rank/alpha 32, epoca 26 de 30, palabra clave de activacion `runaig`, herramienta de entrenamiento musubi-tuner.

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 (alpha 32) que se aplica sobre krea/Krea-2-Raw, un modelo base de difusion para generacion de imagenes. Los LoRA introducen matrices de bajo rango que modifican los pesos del modelo base sin reentrenarlo por completo, lo que reduce drasticamente el tamano del artefacto (aqui 0.5 GB) y permite distribuir estilos o personajes de forma ligera. La arquitectura interna del modelo base no se detalla en la informacion disponible.

El entrenamiento se realizo con musubi-tuner y uso un dataset de 60 imagenes: 36 de caracter SFW y 24 de contenido adulto (desnudos, sin actos sexuales). El autor indica que el adaptador esta destinado a funcionar con Krea 2 Turbo y con dark-beast-krea2, por lo que la inferencia se realiza sustituyendo o combinando variantes del modelo base. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni fases de RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Generacion de imagenes del personaje ficticio Runa mediante la palabra clave `runaig`, a partir de indicaciones de texto.
- Aprendizaje de identidad y estilo de personaje (character LoRA) sobre el modelo base Krea 2.
- Generacion tanto de contenido SFW como de contenido adulto (desnudos), segun el conjunto de entrenamiento.
- Integracion con las variantes Krea 2 Turbo y dark-beast-krea2 del modelo base.
- No dispone de soporte de tool calling, function calling ni agentes (no es un modelo de lenguaje).
- No se documentan capacidades multilingues ni modos especiales (thinking, vision, audio).
- No se documentan capacidades de codigo, matematicas ni razonamiento.

## Casos de uso

- Creacion de ilustraciones de personaje consistente: el LoRA permite mantener los rasgos de Runa a lo largo de multiples generaciones activando `runaig`, util para producir series de imagenes coherentes de un mismo personaje.
- Prototipado de webs de comics o tiras: un ilustrador puede generar bocetos rapidos del personaje para validar diseno y estilo antes de producir arte final.
- Ilustracion de contenido adulto: al haberse entrenado con imagenes de desnudo, puede emplearse para generar material NSFW dentro de los limites legales y eticos aplicables.
- Personalizacion de avatares: para usuarios que quieran representar al personaje en distintos escenarios y poses manteniendo su identidad visual.
- Experimentacion con musubi-tuner: sirve de referencia practica para quien quiera entrenar sus propios LoRA de personaje sobre Krea 2 RAW.
- Pruebas comparativas de adaptadores: al ser un LoRA pequeno (0.5 GB), es sencillo de cargar y descargar para evaluar como se comporta un adaptador de personaje en distintas variantes del modelo base (Turbo, dark-beast).
- Generacion de material para storyboards de animacion: util como paso previo para fijar el diseno del personaje en una produccion de animacion para adultos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.5 GB, por lo que su almacenamiento y carga son ligeros.
- La inferencia requiere cargar el modelo base krea/Krea-2-Raw (o sus variantes Krea 2 Turbo / dark-beast-krea2); la VRAM necesaria viene determinada por ese modelo base y no se documenta en la informacion disponible.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; dependera de los requisitos del modelo base Krea 2.
- Opciones de despliegue: no disponibles (la model card menciona musubi-tuner para el entrenamiento; no se detalla el entorno de inferencia recomendado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano del repositorio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bumblebeeman/runa-toon-full | LoRA de personaje (NSFW) | krea/Krea-2-Raw | 0.5 GB | other | HuggingFace |
| bumblebeeman/Runa | Adaptador de personaje (mismo autor) | no disponible | no disponible | no disponible | HuggingFace |
| FurryToonMix - XL-V3B | Checkpoint de estilo toon (Civitai) | no disponible | no disponible | no disponible | Civitai |

No se dispone de datos de rendimiento, contexto o licencia suficientes para una comparacion cuantitativa entre estos modelos.

## Limitaciones y advertencias

- Contenido adulto: el repositorio esta marcado como not-for-all-audiences; incluye material NSFW que puede no ser apto para todos los publicos ni para todos los entornos de despliegue.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial queda sin definir y requiere consultar al autor antes de cualquier explotacion comercial.
- Dataset reducido: el entrenamiento se realizo con solo 60 imagenes, lo que puede provocar sobreajuste al estilo del conjunto y escasa generalizacion a poses, iluminacion o angulos no vistos.
- Sesgos: al provenir de un dataset pequeno y especifico, el LoRA puede reproducir sesgos de estilo, corporalidad o representacion presentes en esas imagenes.
- Riesgo de artefactos: entrenado hasta la epoca 26 de 30, puede presentar deformaciones tipicas de LoRA de personaje (manos, consistencia de rasgos) fuera de las condiciones de entrenamiento.
- Sin metricas: no hay benchmarks ni evaluaciones objetivas, por lo que la calidad debe validarse de forma manual.
- Dependencia del modelo base: su comportamiento depende enteramente de krea/Krea-2-Raw y de sus variantes; cambios en el modelo base pueden alterar los resultados.
- Sin garantias: con cero descargas y cero valoraciones, no existe evidencia de la comunidad sobre su fiabilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bumblebeeman/runa-toon-full
- Modelo relacionado del mismo autor: https://huggingface.co/bumblebeeman/Runa
- Perfil del autor: https://huggingface.co/bumblebeeman
- Ficha en Free2AITools: https://free2aitools.com/model/bumblebeeman/runa
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Leaderboard de modelos de imagen (referencia externa): https://budgetpixel.com/arena/leaderboard
- FurryToonMix en Civitai (referencia externa): https://civitai.com/models/97479/furrytoonmix
