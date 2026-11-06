# abbuibuibui/LukaUrushibara-Lora

## Resumen

LukaUrushibara-Lora es un adaptador LoRA de personaje para modelos de difusion SDXL, entrenado por el usuario abbuibuibui sobre el checkpoint waiIllustriousSDXL v17. Reproduce a Luka Urushibara (漆原琉华), personaje de la novela visual y anime Steins;Gate, y se distribuye como un conjunto de siete ficheros safetensors correspondientes a las epocas E1-E7 del entrenamiento. No es un modelo de lenguaje ni un modelo fundacional: es un peso adicional de bajo rango que se carga junto al modelo base para condicionar la generacion de imagenes.

El adaptador se entrena con rango 64 y alpha 32, optimizador AdamW en bf16, buckets con limite de 1536 y 7 epocas sobre un dataset de 86 pares imagen-texto que cubren 7 conjuntos de vestuario. El autor publica una evaluacion comparativa propia (rondas 1 y 3) que recomienda la epoca E6 con una fuerza de LoRA de 0.8 como configuracion por defecto. Los pesos se activan mediante tokens de disparo especificos (`luka_urushibara` para identidad y variantes como `luka_urushibara_shrine_maiden_robes` para vestuario).

Su relevancia es acotada y practica: sirve para generar ilustraciones consistentes de un personaje concreto dentro de pipelines de Stable Diffusion XL/Illustrious, con control fino de identidad y vestuario mediante prompting. La licencia CreativeML OpenRAIL-M impone restricciones de uso, y al tratarse de una obra derivada no oficial los derechos del personaje siguen en manos de sus titulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre difusion latente SDXL; modelo base waiIllustriousSDXL v17 |
| Parametros totales | No disponible (adaptador LoRA; rango 64, alpha 32) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagen) |
| Tipos de cuantizacion | No disponible; pesos en safetensors (bf16 durante el entrenamiento) |
| Idiomas soportados | en, zh (prompts y documentacion) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (7 ficheros de 456.497.260 bytes cada uno) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 32 acoplado a un UNet de SDXL a traves del checkpoint waiIllustriousSDXL v17, una variante afinada de SDXL orientada a estetica anime. El entrenamiento empleo AdamW en bf16, buckets de resolucion con limite de 1536 pixeles, 7 epocas y 3 repeticiones por imagen sobre un dataset de 86 pares imagen-texto que cubren 7 conjuntos de vestuario distintos. Las captions se generaron con `keep_tokens = 2`, lo que deja los dos primeros tokens fijos y explica que el color de pelo y de ojos se omita a menudo en las descripciones: el autor indica que conviene anadirlos explicitamente en el prompt.

La innovacion practica no esta en la arquitectura sino en el proceso de seleccion de checkpoint: el autor realizo una ronda 1 de cribado de E1-E7 a fuerza 0.8 y una ronda 3 de matriz sobre E5, E6 y E7 cruzadas con 10 escenas y 4 intensidades (0.4, 0.6, 0.8 y 1.0). El resultado recomienda E6 a 0.8 por producir una silueta estable de Luka (pelo largo morado, ojos morados, ropas de doncella de santuario con ornamento de campana plateada). El tag de sujeto entrenado es `1boy`.

## Capacidades

- Generacion de imagenes de personaje condicionada por texto: reproduce la identidad de Luka Urushibara mediante el token `luka_urushibara`.
- Control de vestuario mediante tokens especificos: `luka_urushibara_shrine_maiden_robes` (ropas de doncella de santuario blancas y rojas con campana), `luka_urushibara_black_top`, `luka_urushibara_black_jacket_red_vest`, `luka_urushibara_pink_dress`, `luka_urushibara_purple_top`, `luka_urushibara_red_cardigan` y `luka_urushibara_tactical_gear`.
- Composición de escenas: retrato frontal, tres cuartos, perfil, cuerpo entero, sentado, fondo simple, fondo complejo nocturno y ausencia de outfit token.
- Integracion con pipelines SDXL/Illustrious: funciona en ComfyUI y en cualquier runtime que cargue LoRA sobre SDXL (diffusers, A1111/Forge, etc.).
- Ajuste de intensidad: la fuerza del LoRA modula la fidelidad al personaje frente a la libertad creativa (0.4-1.0 evaluado).
- Prompts bilingues: documentacion y ejemplos en ingles y chino.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video; es exclusivamente generacion de imagen.

## Casos de uso

- Ilustracion de fan art consistente: cargar `luka_urushibara-000006.safetensors` a 0.8 en ComfyUI con el prompt de ejemplo y generar retratos del personaje con identidad estable entre iteraciones, gracias a los tokens de identidad y vestuario entrenados.
- Creacion de hojas de personaje: combinar las vistas frontal, tres cuartos y perfil evaluadas por el autor para producir un turnaround coherente destinado a documentacion o referencia de produccion.
- Escenas narrativas para proyectos derivados: usar los tokens de vestuario alternativo (traje tactico, vestido rosa, cardigan rojo) para situar al personaje en contextos distintos dentro de una misma historia visual.
- Prototipado de assets para juegos o novelas visuales no comerciales: generar variaciones de pose y encuadre con el mismo LoRA para mantener consistencia de personaje en un conjunto de sprites.
- Pruebas de pipeline de difusion: emplear el adaptador como caso de prueba reproducible (fuerza, epoch y seed fijos) para validar configuraciones de ComfyUI, CLIP skip o schedulers en entornos SDXL.
- Comparacion de epocas y fuerzas: el conjunto E1-E7 permite estudiar el efecto del sobreentrenamiento y de la intensidad del LoRA en la fidelidad de un personaje, usando la matriz de evaluacion del autor como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. El autor solo aporta una evaluacion cualitativa comparativa:

| Candidato | Observacion | Decision |
|---|---|---|
| E5 | Pelo largo morado y ojos morados utilizables; ropas de santuario a menudo presentes | Alternativa |
| E6 | Retrato con pelo largo morado, ojos morados y ropas de doncella con campana plateada; silueta estable | Recomendado a 0.8 |
| E7 | Muy cercano a E6 | Alternativa final |

Ajustes de referencia del showcase: ComfyUI, sampler Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion 832x1216, sin hires fix ni ADetailer.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un LoRA sobre SDXL, los requisitos son los del modelo base (waiIllustriousSDXL v17) mas el adaptador de aproximadamente 456 MB por fichero.
- GPU recomendadas: no especificadas por el autor; para SDXL en general se recomienda al menos 8-12 GB de VRAM, con A100/H100 para lotes grandes y RTX 4090 para inferencia rapida en consumer.
- Compatibilidad con GPU consumer: probable en tarjetas con VRAM suficiente para SDXL a 832x1216; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (configuracion usada en el showcase), diffusers (libreria declarada), y por extension otros runners SDXL compatibles con LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de personaje comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Obra derivada no oficial: los derechos de Luka Urushibara y Steins;Gate permanecen en sus titulares; el autor lo declara explicitamente como fan-made.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso aceptable; conviene revisar sus clausulas antes de explotar el modelo en produccion.
- Sesgo de dataset: 86 pares imagen-texto y 7 outfits implican cobertura limitada de poses, angulos e iluminacion; escenas fuera de la distribucion pueden degradar la identidad.
- Captions con `keep_tokens = 2`: el color de pelo y ojos se omite a menudo, por lo que hay que anadirlo manualmente en el prompt para evitar derivas cromaticas.
- Riesgo de sobreajuste al checkpoint recomendado: E6 a 0.8 puede rigidizar la composicion; el autor evalua 0.4-1.0 como rango de ajuste.
- Dependencia estricta del modelo base: el LoRA esta entrenado sobre waiIllustriousSDXL v17 y su comportamiento en otros checkpoints SDXL no esta documentado.
- Ausencia de benchmarks cuantitativos: la seleccion de E6 se basa en evaluacion visual subjetiva del propio autor.
- Sin soporte de texto, codigo, razonamiento ni herramientas: no debe emplearse fuera de tareas de generacion de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/LukaUrushibara-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/LukaUrushibara-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/LukaUrushibara-Lora
- Perfil del autor: https://huggingface.co/abbuibuibui/models
- Notas de evaluacion (chino): `evaluation/横向测评记录.md` en el repositorio
