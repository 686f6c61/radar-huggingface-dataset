# ashokurlana/emma-maproute-mappers

## Resumen

EMMA MapRoute concept-erasure mappers es una coleccion de pesos que implementan la supresion de conceptos (concept erasure) sobre Stable Diffusion v1.4. No es un modelo generativo completo, sino un conjunto de mappers: pequenas transformaciones lineales que se aplican sobre el estado oculto final (`last_hidden_state`) del codificador de texto CLIP de Stable Diffusion v1.4. Cada mapper esta asociado a un concepto concreto y a un dominio, y su funcion es reescribir la representacion textual de ese concepto antes de que entre en el pipeline de difusion, de modo que el modelo deje de generarlo o lo genere con menor intensidad.

El repositorio lo publica el usuario ashokurlana bajo licencia MIT y esta organizado en dos carpetas: `mappers/<dominio>/<concepto>.safetensors` con los pesos en fp32, y `prompts/<dominio>/*.json` con los prompts de evaluacion del metodo EMMA. El modelo base declarado es CompVis/stable-diffusion-v1-4, un modelo de difusion latente texto-a-imagen con aproximadamente 860 millones de parametros en el UNet y un contexto de texto de 77 tokens.

Su relevancia es acotada pero tecnica: ofrece un mecanismo modular y ligero para eliminar conceptos sensibles o no deseados de un modelo de difusion sin reentrenar el UNet, algo util en filtrado de contenido, cumplimiento de politicas y estudio de sesgos en generacion de imagenes. El tamano del repositorio (0,3 GB) refleja que se trata de un conjunto de mappers, no de un checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mappers de erasure de conceptos sobre el `last_hidden_state` de CLIP en Stable Diffusion v1.4 (modelo base: difusion latente) |
| Parametros totales | no disponible (depende de la dimension del mapper; el modelo base SD v1.4 ronda los 860 M en el UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens (limite del codificador de texto CLIP de SD v1.4) |
| Tipos de cuantizacion | no disponible (los pesos del mapper se distribuyen en fp32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El componente publicado no es un transformer completo sino un conjunto de mappers que actuan sobre la salida del codificador de texto CLIP de Stable Diffusion v1.4. La model card indica explicitamente que se aplica un mapper de embedding de texto por cada concepto EMMA sobre el `last_hidden_state` de CLIP. Esto implica una intervencion en el espacio de embeddings textuales, previa a la difusion, en lugar de una modificacion de los pesos del UNet. La estructura por dominios y conceptos (`mappers/<dominio>/<concepto>.safetensors`) sugiere un diseno modular: se carga solo el mapper del concepto que se quiere suprimir.

No se detalla en la informacion disponible la arquitectura interna exacta de cada mapper (si es una proyeccion lineal, un MLP o una transformacion afina), ni el numero de tokens, la composicion del dataset de entrenamiento, ni si se emplearon tecnicas de RLHF, DPO o destilacion. Tampoco se especifica el procedimiento de optimizacion ni la funcion de perdida usada para el entrenamiento de los mappers. La carpeta `prompts/<dominio>/*.json` contiene los prompts de evaluacion del metodo EMMA, lo que permite reproducir la evaluacion de la erasure por concepto, pero no se documenta el pipeline de entrenamiento.

## Capacidades

- Supresion de conceptos concretos en la generacion de imagenes con Stable Diffusion v1.4 mediante la modificacion del embedding de texto.
- Aplicacion modular por dominio y concepto: se puede cargar un mapper especifico sin alterar el resto del modelo.
- Intervencion ligera que no requiere reentrenar el UNet ni el VAE.
- Evaluacion reproducible mediante los prompts JSON incluidos en `prompts/<dominio>/`.
- Compatibilidad con el pipeline de Stable Diffusion v1.4 al operar sobre el `last_hidden_state` de CLIP.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni modo thinking; el artefacto es especifico de erasure de conceptos en difusion texto-a-imagen.
- No se documentan capacidades multilingues mas alla de las del codificador CLIP de SD v1.4.

## Casos de uso

- Filtrado de contenido en produccion: aplicar el mapper del concepto no deseado antes de pasar el embedding al UNet permite reducir la generacion de ese concepto sin desplegar un modelo distinto, manteniendo el resto del pipeline de SD v1.4.
- Cumplimiento de politicas de plataforma: en un servicio de generacion de imagenes, cargar mappers por concepto permite alinear la salida con listas de terminos restringidos de forma configurable y reversible.
- Investigacion sobre sesgos: comparar la salida de SD v1.4 con y sin mapper para un concepto dado permite medir el efecto de la erasure sobre atributos demograficos o culturales.
- Moderacion por dominios: la organizacion `mappers/<dominio>/<concepto>.safetensors` facilita activar o desactivar supresiones segun el dominio de la aplicacion (por ejemplo, un conjunto distinto de conceptos para un portal educativo y otro para uno de ocio).
- Evaluacion academica de metodos de concept erasure: los prompts JSON incluidos permiten reproducir la evaluacion EMMA y comparar la eficacia de estos mappers frente a otras tecnicas de erasure.
- Prototipado rapido de variantes de modelo: al ser pesos ligeros en safetensors, se pueden intercambiar mappers en un mismo servicio sin recompilar ni recargar el checkpoint completo de SD v1.4.
- Auditoria de modelos de difusion: inspeccionar la transformacion aplicada al embedding permite analizar que direcciones del espacio CLIP se asocian a cada concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la del modelo base Stable Diffusion v1.4, aproximadamente 4-6 GB en fp16 para generar imagenes a 512x512; los mappers anaden una sobrecarga minima al operar sobre el embedding de texto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues de mayor throughput; cualquier GPU capaz de ejecutar SD v1.4 es suficiente.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6 GB de VRAM para SD v1.4 en fp16.
- Opciones de despliegue: el modelo base es compatible con `diffusers`, y los mappers en safetensors pueden cargarse con `safetensors.torch`; el pipeline puede servirse con FastAPI, ComfyUI o Automatic1111, aplicando el mapper antes de la llamada al UNet.
- Latencia y throughput estimados: no disponibles de forma especifica; los del modelo base SD v1.4 en la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EMMA MapRoute concept-erasure mappers | Mappers de erasure sobre SD v1.4 | no disponible | 77 tokens (CLIP) | MIT | Hugging Face (repo de 0,3 GB) |
| Stable Diffusion v1.4 (base) | Difusion latente texto-a-imagen | ~860 M (UNet) | 77 tokens | CreativeML Open RAIL-M | Hugging Face |
| Otros metodos de concept erasure (por ejemplo, fine-tuning del UNet o edicion de cross-attention) | Intervenciones sobre el modelo de difusion | variable | 77 tokens | variable | variable |

No se dispone de datos de rendimiento comparativo entre estos mappers y otras tecnicas de erasure en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez de la erasure.
- La erasure se aplica sobre el embedding de texto; no se garantiza que el concepto quede eliminado en todas las configuraciones de prompt, semillas o estilos.
- El limite de 77 tokens del codificador CLIP de SD v1.4 restringe la longitud de los prompts tratables.
- No se especifican los idiomas cubiertos por los mappers ni su comportamiento fuera del ingles.
- La licencia MIT del repositorio no sustituye a la licencia del modelo base: Stable Diffusion v1.4 se distribuye bajo CreativeML Open RAIL-M, con restricciones de uso que deben respetarse al desplegar el pipeline.
- Al ser un artefacto de investigacion con cero descargas y cero likes, no hay evidencia de validacion externa ni de uso en produccion.
- No se documenta el procedimiento de entrenamiento ni los hiperparametros, lo que dificulta reproducir o auditar los mappers.
- No debe interpretarse como un modelo generativo autonomo: requiere el checkpoint completo de Stable Diffusion v1.4.

## Enlaces

- Hugging Face: https://huggingface.co/ashokurlana/emma-maproute-mappers
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
