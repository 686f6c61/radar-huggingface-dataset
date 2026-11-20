# aoleg/MOSS-Sharpness-Slider

## Resumen

MOSS-Sharpness-Slider es un LoRA de tipo *concept slider* para el modelo de difusion texto-a-imagen MOSS-Image, publicado por el usuario aoleg en Hugging Face. Su funcion es desplazar el grado de nitidez de la imagen generada actuando unicamente sobre la fuerza del LoRA: valores positivos enfocan y valores negativos desenfocan, sin necesidad de palabra de activacion ni de modificar el prompt. Se trata, por tanto, de un adaptador de bajo rango y no de un modelo generativo autonomo.

El adaptador se entrena sobre el checkpoint MOSS-Image Base y esta pensado explicitamente para recuperar nitidez en ese checkpoint base, que presenta cierto desenfoque nativo. El autor advierte de que el efecto se atenua sobre MOSS SFT y es practicamente nulo sobre SFT+Turbo, ya que esas variantes ya filtran el desenfoque en su ajuste. El repositorio ocupa unos 0,1 GB y se distribuye bajo licencia Apache 2.0.

Por su naturaleza, la ficha describe un adaptador LoRA de difusion: no hay parametros de lenguaje, contexto de tokens ni benchmarks de razonamiento. Los apartados que no aplican a esta categoria se marcan como no disponibles de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (concept slider) sobre un modelo de difusion texto-a-imagen; modelo base OpenMOSS-Team/MOSS-Image-Base |
| Parametros totales | no disponible (el repositorio pesa 0,1 GB; el numero de parametros del adaptador no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no hay ventana de tokens) |
| Tipos de cuantizacion | no disponible; el autor menciona que el entrenamiento se hizo sobre MOSS-Image Base en int8 convrot |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | formato de LoRA para diffusers (no se detalla la extension exacta de los ficheros) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango concebido como *concept slider*: en lugar de ensenar un concepto nuevo, aprende una direccion en el espacio latente que controla un atributo continuo, en este caso la nitidez. La direccion del deslizador proviene del par de prompts definido en el proceso `concept_slider` de Ostris AI Toolkit, mientras que el dataset solo aporta los latentes en ambos extremos del rango. El entrenamiento se realizo con dicha herramienta sobre MOSS-Image Base en su variante int8 convrot.

El dataset consta de 72 fotografias y esas mismas 72 imagenes con desenfoque gaussiano aplicado, a 1024 px y sin captions. No se especifica el numero de pasos, la tasa de aprendizaje ni la configuracion exacta de rango y alpha del LoRA. La innovacion tecnica es la separacion entre la direccion semantica (definida por el par de prompts) y los ejemplos visuales (los latentes nitidos y desenfocados), lo que permite un control monotono del atributo mediante un unico escalar.

## Capacidades

- Control continuo de nitidez en la generacion texto-a-imagen: fuerza positiva enfoca, fuerza negativa desenfoca y fuerza 0 deja el modelo intacto.
- Funcionamiento sin palabra de activacion ni cambios en el prompt: el control se ejerce solo con el peso del LoRA.
- Composicion con el modelo base MOSS-Image Base o SFT cargandolo como LoRA convencional en diffusers.
- Efecto mas pronunciado sobre el checkpoint Base; debil sobre SFT y practicamente nulo sobre SFT+Turbo.
- No aporta capacidades de generacion de texto, razonamiento, codigo, matematicas, vision por comprension, tool calling ni agentes.
- No incorpora modo de razonamiento (thinking), audio ni otras modalidades.

## Casos de uso

- Restauracion de nitidez en el checkpoint base: cargar el LoRA con fuerza positiva (por ejemplo, 1.0) sobre MOSS-Image Base para compensar el desenfoque nativo del modelo y obtener resultados mas definidos sin reentrenar.
- Efecto de desenfoque artistico: usar fuerzas negativas para generar imagenes con desenfoque intencionado (retratos con profundidad de campo simulada, fondos desenfocados) manteniendo el mismo prompt.
- Barrido de parametros (parameter sweep): generar una misma escena con varios valores de fuerza del LoRA para elegir el punto optimo de nitidez en un pipeline de produccion.
- Integracion en flujos de diffusers: al ser un LoRA estandar, se puede encadenar con otros adaptadores y schedulers en scripts de generacion por lotes.
- Prototipado de estetica fotografica: combinado con prompts de pelicula (Kodachrome, 35 mm) para ajustar la nitidez de la simulacion fotografica.
- Comparacion de checkpoints: usar el deslizador como herramienta de diagnostico para medir cuanto desenfoque residual tiene cada variante (Base, SFT, Turbo) de MOSS-Image.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, SSIM) ni comparaciones numericas del efecto del deslizador.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base MOSS-Image, no del adaptador; el LoRA anade una sobrecarga minima (repositorio de 0,1 GB). No se dispone de cifras concretas de VRAM para MOSS-Image en la informacion proporcionada.
- GPU recomendadas: no disponible para el modelo base; el adaptador en si no impone requisitos adicionales relevantes.
- Compatibilidad con GPU de consumo: no disponible; depende de si MOSS-Image Base cabe en la GPU del usuario.
- Opciones de despliegue: libreria diffusers (carga como LoRA estandar); el autor menciona el uso con MOSS-Image Base o SFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Sharpness-Slider (aoleg) | LoRA concept slider | MOSS-Image Base | Nitidez via fuerza del LoRA | Apache 2.0 | Hugging Face, 1334 descargas, 26 likes |
| MOSS-Image Base (OpenMOSS-Team) | Modelo de difusion texto-a-imagen | no aplica | Sin control de nitidez | no disponible en la informacion | Hugging Face |
| MOSS-Image SFT / SFT+Turbo (OpenMOSS-Team) | Variantes ajustadas del modelo base | MOSS-Image Base | Sin control de nitidez; ya filtran el desenfoque | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El efecto es debil sobre MOSS SFT y practicamente inexistente sobre SFT+Turbo; el uso previsto es el checkpoint Base.
- No se documentan sesgos especificos del adaptador, pero hereda los del modelo base MOSS-Image, no descritos en la informacion disponible.
- Riesgo de artefactos al usar fuerzas extremas del LoRA; el autor recomienda empezar en 1.0 y -1.0 y ajustar.
- No hay palabra de activacion, por lo que el control es puramente escalar y puede interactuar de forma no prevista con otros LoRA cargados simultaneamente.
- El dataset de entrenamiento (72 imagenes) es reducido, lo que puede limitar la generalizacion del deslizador a dominios muy distintos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base MOSS-Image debe verificarse por separado, ya que su licencia no se detalla en la informacion disponible.
- No se especifican idiomas soportados ni calidad multilingue de los prompts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aoleg/MOSS-Sharpness-Slider
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Ostris AI Toolkit (herramienta de entrenamiento citada): no se proporciona URL en la informacion disponible.
