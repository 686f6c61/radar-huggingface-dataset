# AiMamis/Mary

# AiMamis/Mary

## Resumen

AiMamis/Mary es un adaptador LoRA de generacion de imagenes (text-to-image) publicado en HuggingFace por el usuario AiMamis. Se trata de un ajuste de bajo rango disenado para fijar la identidad de un unico personaje femenino llamado Mary, definido en la ficha por cinco descriptores de activacion: `Mary`, `50 years old`, `Shoulder length blonde hair`, `Brown eyes` y `Fair skin`. El adaptador no funciona de forma autonoma: se carga sobre el checkpoint base krea/Krea-2-Turbo dentro del ecosistema diffusers.

El modelo resuelve un problema concreto y muy comun en flujos de trabajo de generacion de imagen: mantener la coherencia de un personaje a lo largo de multiples generaciones sin tener que describirlo por completo en cada prompt. Frente a un fine-tune completo, una LoRA reduce el coste de entrenamiento y de almacenamiento (el repositorio ocupa 0,5 GB) y permite combinarla con otras LoRA o variar estilos sin perder la identidad aprendida.

El proyecto esta en una fase inicial y sin validacion externa: acumula 0 descargas y 0 likes en el momento de la consulta. La model card es minima: se limita a declarar las palabras de activacion y el prompt de instancia, sin documentar el dataset, el rango del adaptador ni los hiperparametros de entrenamiento. La licencia es openrail++, heredada del ecosistema del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptacion de bajo rango) sobre un modelo de difusion text-to-image; arquitectura interna del modelo base no especificada |
| Parametros totales | No disponible (no se publica rango, alpha ni numero de tensores del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; las palabras de activacion y el prompt de instancia estan en ingles |
| Licencia | openrail++ |
| Formato de pesos | No disponible; el repositorio declara la libreria diffusers, cuyo formato habitual es safetensors |
| Modelo base | krea/Krea-2-Turbo |
| Pipeline | text-to-image |
| Tamano del repositorio | 0,5 GB |
| Palabras de activacion | Mary, 50 years old, Shoulder length blonde hair, Brown eyes, Fair skin |
| Fecha de creacion (declarada) | 2026-09-19 |

## Arquitectura y entrenamiento

La informacion disponible describe un unico artefacto: un adaptador LoRA para un modelo de difusion text-to-image. Una LoRA congela los pesos del checkpoint base e inyecta matrices de bajo rango en determinadas capas (tipicamente los bloques de atencion del denoiser), de modo que el entrenamiento solo actualiza una fraccion minima de parametros. El resultado es un fichero pequeno y facil de intercambiar, pero totalmente dependiente del checkpoint sobre el que se entreno; en este caso, krea/Krea-2-Turbo. El sufijo "Turbo" del modelo base sugiere una variante destilada para muestreo en pocos pasos, aunque la informacion proporcionada no confirma ni la arquitectura ni el regimen de inferencia del base.

No hay ningun dato publicado sobre el proceso de entrenamiento: se desconoce el numero de imagenes, la composicion del dataset, la resolucion de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango del adaptador, el alpha y si se aplicaron tecnicas de regularizacion o de captions etiquetados por un modelo de vision. Tampoco se indica si hubo etapas de ajuste preferencial (RLHF/DPO), algo por lo demas poco habitual en adaptadores de difusion. El prompt de instancia declarado (`Mary, 50 years old, Shoulder length blonde hair, Brown eyes, Fair skin`) es el unico indicio sobre como se etiquetaron las imagenes durante el entrenamiento.

## Capacidades

- Generacion text-to-image de un personaje femenino especifico a partir de un prompt en ingles, con cinco cadenas de activacion documentadas.
- Coherencia de identidad entre generaciones cuando se invocan conjuntamente las palabras de activacion.
- Combinacion potencial con otras LoRA y con los estilos propios del modelo base, siempre que la implementacion de diffusers lo permita.
- Hereda del checkpoint base las capacidades generales de generacion (resolucion, control por prompt negativo, estilos fotograficos o ilustrados), aunque no estan documentadas en la ficha.
- No soporta tool calling ni function calling: es un adaptador de difusion, no un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni planificacion.
- Capacidades multilingues: no disponibles. No hay evidencia de que las palabras de activacion funcionen fuera del ingles.
- Capacidades especiales declaradas: ninguna (sin modo thinking, sin vision de entrada, sin audio, sin edicion de imagen).

## Casos de uso

- Ilustracion editorial seriada: generar un mismo personaje recurrente en varias viñetas o articulos manteniendo rasgos estables, invocando las cinco palabras de activacion en cada prompt para evitar derivas de identidad.
- Storyboard y previsualizacion audiovisual: producir decenas de planos de un personaje fijo antes de rodar o animar, ya que la LoRA permite iterar rapido sobre encuadres y vestuario sin reentrenar nada.
- Concept art de PNJ para videojuegos: definir la apariencia de un personaje secundario en distintas poses y epocas de la historia (por ejemplo, variando la edad dentro del prompt) manteniendo un rostro reconocible entre assets.
- Avatares y perfiles consistentes: crear una imagen de perfil y sus variantes (fondo, iluminacion, encuadre) para cuentas de marca o proyectos personales, algo inviable con un modelo generico sin control de identidad.
- Contenido para redes sociales e influencer virtual: mantener una "modelo" ficticia en publicaciones sucesivas, evitando depender de la imagen de una persona real y sus derechos de imagen.
- Aumento de dataset de identidad: usar la LoRA para generar cientos de imagenes etiquetadas de Mary y emplearlas como material de partida en el entrenamiento de un segundo adaptador o de un clasificador de identidad.
- Pruebas de vestuario y direccion de arte: iterar combinaciones de ropa, paleta y estilo sobre un mismo rostro, util para validar una propuesta visual antes de producirla con fotografia real.
- Mockups publicitarios: integrar un personaje estable en bocetos de campana para presentaciones internas; conviene revisar antes la licencia del modelo base y las restricciones de openrail++.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye metricas objetivas (FID, CLIP score, similitud de identidad facial ni comparativas de consistencia), y la busqueda web realizada no devolvio ningun analisis independiente. El unico material de referencia es la imagen de ejemplo del widget de HuggingFace.

## Requisitos de hardware

- VRAM para inferencia: no disponible. La VRAM la determina el checkpoint base krea/Krea-2-Turbo, la resolucion de salida y la precision (fp16/bf16/fp8), no el adaptador, que anade un coste marginal.
- El repositorio pesa 0,5 GB, un tamano compatible con adaptadores LoRA que incluyen pesos y muestras de ejemplo; no implica que el modelo pueda ejecutarse sin descargar el base.
- GPU recomendadas: no disponible, al no conocerse el tamano ni la arquitectura del modelo base.
- Compatibilidad con GPU de consumo: no confirmable con la informacion proporcionada. Dependera del checkpoint base; los adaptadores LoRA en si no cambian la huella de memoria de forma apreciable.
- Opciones de despliegue: la libreria declarada es diffusers (carga mediante `load_lora_weights` sobre el pipeline del base). Entornos graficos habituales del ecosistema diffusers, como ComfyUI, AUTOMATIC1111/Forge o InvokeAI, podrian utilizarla si incorporan soporte para krea/Krea-2-Turbo, extremo no verificado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros adaptadores comparables para el mismo modelo base. La comparacion se plantea, por tanto, a nivel de estrategia de personalizacion:

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AiMamis/Mary | LoRA de personaje sobre krea/Krea-2-Turbo | No disponible | No aplica | openrail++ | Publico en HuggingFace, 0 descargas y 0 likes |
| Fine-tune completo del mismo base | Checkpoint completo | No disponible | No aplica | La del modelo base | Requiere entrenamiento y almacenamiento propios |
| Otras LoRA de personaje para Krea-2-Turbo | LoRA | No disponible | No aplica | Variable | No identificadas en la busqueda realizada |
| DreamBooth sobre un base equivalente | Fine-tune parcial | No disponible | No aplica | La del modelo base | No verificado para este base |

## Limitaciones y advertencias

- Dependencia total del modelo base: la LoRA no es utilizable de forma aislada y hereda las limitaciones y la licencia de krea/Krea-2-Turbo.
- Proceso de entrenamiento no documentado: se desconocen el dataset, el rango, el alpha y los pasos, lo que impide reproducir el resultado o auditar la procedencia de las imagenes.
- Riesgo de sobreajuste: los adaptadores de identidad entrenados con pocas imagenes tienden a sesgar la estetica, la iluminacion y el encuadre hacia los del dataset original, y a "contaminar" los prompts que no invocan las palabras de activacion.
- Sesgos potencialmente incorporados: al definir el personaje con atributos como edad, color de pelo, color de ojos y tono de piel, el adaptador reproducira ese perfil de forma acotada; no hay informacion sobre la diversidad del conjunto de entrenamiento.
- Artefactos tipicos de los modelos de difusion: manos deformes, texto ilegible en la imagen y desajustes entre prompt y resultado. La ficha no reporta ninguna evaluacion de calidad.
- Idioma: las palabras de activacion estan en ingles. El comportamiento con prompts en castellano no esta verificado y podria degradar la consistencia de identidad.
- Licencia openrail++: permite uso comercial, pero impone restricciones de uso que deben propagarse a los derivados y a los resultados; conviene leer el texto completo de la licencia antes de desplegar en produccion.
- Sin validacion de la comunidad: 0 descargas y 0 likes, sin discusiones ni ejemplos adicionales. No hay garantia de que los pesos subidos funcionen segun lo declarado.
- Fecha de creacion declarada en 2026-09-19, posterior a la fecha habitual de consulta, lo que debe tenerse en cuenta al interpretar cualquier dato temporal del repositorio.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/AiMamis/Mary
- Pestana de archivos y versiones: https://huggingface.co/AiMamis/Mary/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (los resultados obtenidos correspondian a temas sin relacion). No se dispone de paper, blog tecnico, repositorio de codigo ni demo adicionales.
