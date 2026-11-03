# abbuibuibui/SurugaKanbaru-Lora

## Resumen

SurugaKanbaru-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado sobre el checkpoint waiIllustriousSDXL v17, que reproduce a Suruga Kanbaru (神原骏河), personaje de la serie *Monogatari*. Lo desarrolla el usuario abbuibuibui como derivado no oficial y fan-made, y su funcion es inyectar en el modelo base el conocimiento visual de un personaje concreto: rasgos faciales, peinado, dos conjuntos de vestuario diferenciados y un marcador de identidad fuerte como es el vendaje en el brazo izquierdo.

El repositorio contiene siete checkpoints correspondientes a las epocas E1-E7 del entrenamiento, con un peso de 456.493.364 bytes por fichero y un total de 3,2 GB en el repo. El autor publica una evaluacion comparativa propia que recomienda la epoca E6 con una fuerza de LoRA de 0,8, y proporciona palabras de activacion especificas tanto para la identidad como para cada uno de los dos atuendos principales.

Es relevante para quien genere imagenes de personajes de anime con SDXL en pipelines de ComfyUI o diffusers y necesite consistencia de identidad en un personaje concreto. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que requiere el checkpoint base waiIllustriousSDXL para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de SDXL; modelo base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (rango 64, alpha 32; fichero de 456.493.364 bytes por epoca) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion; resolucion de entrenamiento con buckets hasta 1536) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en, zh (prompts en ingles y chino) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (un fichero por epoca, E1-E7) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre el UNet del checkpoint SDXL waiIllustriousSDXL v17, un modelo de difusion latente de la familia Illustrious orientado a ilustracion anime. El entrenamiento se realizo en precision bf16 con el optimizador AdamW, con buckets de resolucion con tope de 1536 y 7 epocas. El dataset consta de 60 pares imagen-texto con repeticion 3, distribuidos en tres conjuntos de vestuario: uniforme escolar rosa (37 pares), ropa deportiva granate (15 pares) y uniforme de baloncesto (8 pares). Las captions se generaron con `keep_tokens = 2`, y el autor advierte que el color de pelo y de ojos se omitio con frecuencia en las captions, por lo que conviene anadirlo explicitamente en el prompt.

La innovacion practica del repositorio no esta en la arquitectura, sino en la documentacion del proceso de seleccion de epoca: una primera ronda evaluo E1-E7 a fuerza 0,8 y una tercera ronda hizo una matriz sobre E5, E6 y E7 cruzada con 10 escenas y 4 fuerzas (0,4, 0,6, 0,8 y 1,0). El resultado recomienda E6 a 0,8 como configuracion por defecto, con E5 y E7 como alternativas. El entrenamiento y la evaluacion se ejecutaron en un NVIDIA DGX Spark con ComfyUI.

## Capacidades

- Generacion de imagenes de un personaje concreto de anime (Suruga Kanbaru) sobre el checkpoint base waiIllustriousSDXL.
- Control de identidad mediante la palabra de activacion `suruga_kanbaru`, que activa peinado corto, pelo castano, ojos castanos y el vendaje en el brazo izquierdo.
- Dos atuendos con tokens dedicados: `suruga_kanbaru_pink_school_uniform` (blusa escolar rosa con cuello rojo, cinta amarilla, falda plisada morada, calcetines oscuros y mocasines) y `suruga_kanbaru_maroon_sportswear` (chaqueta deportiva granate/morada, pantalon corto deportivo, calcetines negros y zapatillas).
- Composicion de escenas: el autor documenta resultados en retrato frontal, tres cuartos, perfil, cuerpo completo, personaje sentado, fondo simple, escena nocturna compleja y generacion sin token de atuendo.
- Ajuste de intensidad del efecto mediante el peso del LoRA en el prompt (valores evaluados entre 0,4 y 1,0).
- Compatibilidad con prompts en ingles y chino.
- No soporta tool calling, agentes, razonamiento multi-paso ni modos de pensamiento: es exclusivamente un modelo de generacion de imagen.

## Casos de uso

- Ilustracion de fan art consistente: usar E6 a fuerza 0,8 con el token de identidad y el token de atuendo para obtener representaciones coherentes del personaje en distintas poses y encuadres, apoyandose en la matriz de evaluacion publicada para elegir el compromiso entre fidelidad y flexibilidad.
- Generacion de paneles para doujinshi o comic amateur: el LoRA mantiene los rasgos del personaje entre viñetas, y los tokens de atuendo permiten alternar entre el uniforme escolar y la ropa deportiva segun la escena.
- Prototipado de personajes en produccion de anime: util para previsualizar como se comporta un diseno de personaje concreto bajo el estilo del checkpoint Illustrious antes de encargar ilustraciones finales.
- Integracion en pipelines de ComfyUI: el flujo documentado (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216, sin hires ni ADetailer) sirve como configuracion de referencia reproducible para automatizar lotes de imagenes.
- Pruebas de transferencia de estilo y escena: al estar entrenado sobre un checkpoint con estetica anime marcada, permite experimentar con el personaje en entornos nocturnos complejos o fondos simples y medir la degradacion de identidad mediante las fuerzas evaluadas.
- Material para comunidades de fans y divulgacion: generacion de imagenes para articulos, wikis o hilos sobre *Monogatari*, siempre respetando las restricciones de la licencia CreativeML OpenRAIL-M y los derechos de los titulares originales.
- Referencia metodologica para entrenar LoRAs de personaje: la estructura del repo (siete epocas, evaluacion en rondas, tabla de decision, hash SHA-256 del checkpoint recomendado) sirve como plantilla de documentacion para otros entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta una evaluacion cualitativa interna (rondas 1 y 3) con imagenes comparativas, sin metricas numericas como FID, CLIP score o similitud facial.

| Candidato | Observacion del autor | Decision |
|---|---|---|
| E5 | Pelo corto oscuro y ojos castanos usables; el cuello rosa ya aparece correctamente | Alternativa |
| E6 | Retrato con pelo corto irregular, cejas gruesas, ojos castanos y blusa rosa con cuello rojo; cuerpo completo con uniforme principal y vendaje claro en el brazo izquierdo; atuendo alternativo deportivo correcto | Recomendado a 0,8 |
| E7 | Muy proximo a E6 | Alternativa final |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este LoRA; depende del checkpoint base waiIllustriousSDXL y de la resolucion. Un SDXL en fp16 requiere del orden de 8-10 GB de VRAM, y el LoRA anade una sobrecarga minima al ser un adaptador de rango 64.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor cita un NVIDIA DGX Spark para entrenamiento y evaluacion, sin detallar requisitos de inferencia.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el LoRA en si es ligero, pero el requisito real lo impone el checkpoint base SDXL.
- Opciones de despliegue: ComfyUI (flujo documentado por el autor con Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216) y la libreria diffusers (etiqueta `library_name: diffusers` en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRAs de personaje comparables ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un derivado no oficial y fan-made: los derechos sobre el personaje y la obra original pertenecen a sus titulares; el autor lo declara explicitamente.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos descritos en la licencia), pero no otorga derechos sobre la propiedad intelectual del personaje ni del checkpoint base.
- Requiere el checkpoint base waiIllustriousSDXL v17: el LoRA no funciona de forma autonoma y su comportamiento puede degradarse con otras versiones del base.
- Las captions de entrenamiento omiten con frecuencia el color de pelo y ojos, por lo que es necesario anadirlos manualmente en el prompt para evitar derivas de identidad.
- El dataset es pequeno (60 pares con repeticion 3), lo que limita la variedad de poses, angulos y expresiones aprendidas; escenas muy alejadas de las evaluadas pueden perder fidelidad.
- El autor recomienda E6 a 0,8, pero la eleccion de epoca y fuerza es empirica y cualitativa, sin metricas objetivas publicadas.
- Riesgo de sobreajuste al estilo del checkpoint Illustrious: la estetica resultante esta fuertemente condicionada por el base.
- Solo se documentan prompts en ingles y chino; no hay evidencia de soporte para prompts en castellano.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validacion externa de la comunidad.
- El identificador del modelo incluye "Lora" con capitalizacion irregular y el autor publica en HuggingFace y ModelScope, lo que puede generar confusion sobre cual es la copia canonica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/SurugaKanbaru-Lora
- Dataset en HuggingFace: https://huggingface.co/datasets/abbuibuibui/SurugaKanbaru-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/SurugaKanbaru-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/SurugaKanbaru-Dataset
- Notas de evaluacion en chino (ruta dentro del repo): `evaluation/横向测评记录.md`
- README en chino (ruta dentro del repo): `README_zh.md`
