# lantianws666/moss-gemini-girl

## Resumen

MOSS Gemini Girl es un LoRA de personaje para la familia de modelos de generación de imágenes MOSS-Image, desarrollado por el usuario lantianws666. Se trata de un adaptador de bajo rango (rank 32) entrenado para reproducir de forma consistente un personaje original de estilo anime llamado Gemini Girl (Gemini 娘), una chica gato con rasgos muy específicos: orejas de gato azules, heterocromía (ojo derecho rosa-rojizo, ojo izquierdo ámbar), pelo largo ondulado con degradado de azul a arcoíris, cola única esponjosa multicolor y un traje escénico blanco e índigo con motivos de estrella. El modelo base es OpenMOSS-Team/MOSS-Image-Base.

El LoRA resuelve el problema clásico de consistencia de personaje en generación texto-a-imagen: permite fijar la identidad visual de un personaje a través de múltiples escenas, poses y cambios de vestuario sin que el modelo deriva hacia variaciones no deseadas. Con solo 141,8 MiB de pesos, se aplica sobre el modelo base en tiempo de inferencia y no requiere reentrenar el modelo completo.

Es relevante porque MOSS-Image es una arquitectura reciente con codificador de texto Qwen3.5-9B y VAE flux2-vae, y este LoRA demuestra el flujo de trabajo típico de personalización sobre dicha familia: entrenamiento con pocas imágenes (30), captions asistidos por tagger automático (wd-eva02-large-tagger-v3) y un trigger word dedicado (`moss_geminigirl`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto de publicación muy reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion MOSS-Image |
| Parametros totales | no disponible (pesos del adaptador: 141,8 MiB, rank 32, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen) |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base recomienda BF16 en texto y VAE |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos; model card bilingue ingles/chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`moss_geminigirl_v1_1500.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre el modelo base OpenMOSS-Team/MOSS-Image-Base, un modelo de difusion texto-a-imagen de la familia MOSS-Image. La inferencia recomendada utiliza el codificador de texto Qwen3.5-9B en BF16 completo (el autor desaconseja int8) y el VAE flux2-vae con decodificacion en fp32. El sampler recomendado es flowmatch con shift 5.0 o Euler Simple, con CFG 3.0 y entre 30 y 50 pasos.

El entrenamiento se realizo sobre un dataset de 30 imagenes: 21 con el traje escénico de estrella característico, 3 con cardigan lavanda, 3 con cazadora bomber verde azulado y 3 con vestido azul medianoche. Se ejecutaron 1500 pasos (50 epocas) a resolucion 1024, con BF16 tanto en el modelo base como en el text encoder, programacion de learning rate coseno de 1e-4 a 1e-6 y FlowMatch. El captioning se genero con wd-eva02-large-tagger-v3 mas etiquetas manuales de anclaje de identidad, lo que explica que el LoRA soporte cambios de vestuario manteniendo los rasgos del personaje.

## Capacidades

- Generacion de imagenes de un personaje anime original con identidad visual consistente mediante el trigger word `moss_geminigirl`.
- Reproduccion fiel de rasgos complejos: heterocromía, orejas de gato, ahoge en bucle, twin buns con trenzas, pelo degradado azul-arcoíris, cola única multicolor, accesorios de estrella.
- Cambio de vestuario integrado: el entrenamiento incluye variantes de cardigan lavanda, cazadora bomber y vestido azul medianoche, por lo que el modelo puede alternar outfits manteniendo la identidad.
- Poses complejas: el autor recomienda el checkpoint MOSS-Image-SFT para posturas sentadas y estructuras de piernas plegadas (wariza), con ajuste de SLG a `[24]`.
- Composicion de escena: los ejemplos muestran fondos estelares, interiores (salon de marmol, sofa) y fondos realistas con lluvia de neon en estilo 2.5D.
- Apilamiento con LoRA de estilo: compatible con LoRAs de estilo externos (por ejemplo, el autor cita un LoRA de estilo a peso 0.75, reduciendo el peso del personaje a 0.80).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Creacion de arte de personaje consistente para proyectos de ficcion: ilustraciones de una misma protagonista en distintas escenas y estados de animo, usando el bloque de identidad fijo y variando solo la descripcion de entorno y pose.
- Diseno de variantes de vestuario: el modelo incorpora tres outfits alternativos entrenados, lo que permite generar hojas de personaje con cambios de ropa sin perder los rasgos faciales ni los accesorios de estrella.
- Produccion de material para novelas visuales o juegos indie: generacion de sprites y CG de personaje con poses sentadas y complejas (wariza) apoyandose en el checkpoint SFT y SLG ajustado.
- Ilustracion promocional de estilo anime: composiciones cinematograficas con iluminacion suave y particulas de luz, utiles para portadas, banners o arte de redes sociales.
- Exploracion de estilo 2.5D: combinacion con LoRA de estilo y fondos fotorrealistas (por ejemplo, lluvia de neon) para obtener renders semirrealistas manteniendo el diseno del personaje.
- Prototipado rapido de personajes para estudios pequenos: al ser un LoRA ligero de 141,8 MiB, se puede iterar en local sobre el modelo base sin infraestructura de entrenamiento dedicada.
- Pruebas de investigacion sobre personalizacion: caso de estudio de entrenamiento con dataset minimo (30 imagenes) y captioning automatico para evaluar la fidelidad de identidad en modelos de difusion recientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA en si ocupa 141,8 MiB, pero requiere cargar el modelo base MOSS-Image completo, cuyo tamano de parametros no se detalla en la informacion disponible.
- El codificador de texto Qwen3.5-9B en BF16 completo implica aproximadamente 18 GB de VRAM solo para el text encoder; el autor desaconseja explicitamente la cuantizacion int8 del mismo.
- El VAE flux2-vae se recomienda decodificar en fp32, lo que anade requisitos de memoria en la fase de decodificacion.
- GPU recomendadas: no disponibles de forma explicita; por el perfil del text encoder de 9B en BF16, se requiere al menos una GPU de 24 GB o superior (RTX 4090, A100, H100) para ejecutar el pipeline completo en BF16.
- No se confirma que quepa en GPUs consumer de gama media; la informacion disponible solo permite afirmar que el text encoder de 9B en BF16 excede la VRAM de la mayoria de tarjetas de 8-16 GB.
- Opciones de despliegue: libreria diffusers (declarada en el repositorio); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS Gemini Girl (este) | LoRA de personaje sobre MOSS-Image | Adaptador 141,8 MiB, rank 32 | no aplica | Apache 2.0 | Hugging Face, diffusers |
| MOSS-Image-Base (OpenMOSS-Team) | Modelo base texto-a-imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| MOSS-Image-SFT (OpenMOSS-Team) | Checkpoint ajustado del modelo base | no disponible | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento ni de comparativas cuantitativas con otros LoRAs de personaje en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad exclusiva con MOSS-Image: el autor indica explicitamente que no es compatible con SDXL, SD1.5 ni FLUX.
- Requiere el codificador de texto Qwen3.5-9B en BF16; el uso en int8 puede degradar la calidad y el autor lo desaconseja.
- Dataset de entrenamiento muy reducido (30 imagenes), lo que puede limitar la generalizacion a poses, angulos o expresiones no vistas durante el entrenamiento.
- Riesgo de sobreajuste al diseno canonico: el autor recomienda anadir "detail boosters" opcionales para maxima fidelidad, lo que sugiere que ciertos detalles (top cruzado, liga, cadena de cintura) no se reproducen de forma fiable sin refuerzo en el prompt.
- La cola multicolor puede duplicarse o descontrolarse; el autor recomienda fijar siempre `single fluffy rainbow tail` en el prompt.
- Las poses complejas (piernas plegadas, wariza) requieren el checkpoint SFT y ajuste manual de SLG; con el modelo Base pueden aparecer artefactos anatomicos.
- Sesgos conocidos: no documentados en la informacion disponible; al ser un personaje anime femenino, hereda los sesgos estilisticos y de representacion del dataset de entrenamiento y del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero el uso del modelo base MOSS-Image queda sujeto a su propia licencia, no detallada en esta informacion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad ni de pruebas independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lantianws666/moss-gemini-girl
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
