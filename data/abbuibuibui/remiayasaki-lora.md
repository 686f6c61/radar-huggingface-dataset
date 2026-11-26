# abbuibuibui/RemiAyasaki-Lora

## Resumen

RemiAyasaki-Lora es un LoRA de personaje para modelos de difusion SDXL, concretamente entrenado sobre el checkpoint comunitario waiIllustriousSDXL v17, que representa a Remi Ayasaki (绫崎蕾美), personaje secundario de la serie *Horimiya*. Lo desarrolla el usuario de Hugging Face abbuibuibui y se distribuye como peso derivado de un modelo base de terceros, con caracter no oficial y de fans. El repositorio incluye siete pesos correspondientes a las epocas E1-E7 del entrenamiento, ademas de dos linajes adicionales alojados en subdirectorios: una version para AutismMix Pony y otra para MOSS-Image.

El problema que resuelve es la fidelidad de identidad en generacion de imagen anime: el LoRA permite invocar al personaje mediante tokens especificos (`remi_ayasaki` y variantes de vestuario) manteniendo coherencia de rostro, peinado y paleta cromatica en distintos angulos y escenas. Segun la evaluacion del autor, la epoca E6 a fuerza 0.8 es la recomendada por defecto, al mantener la identidad estable entre vista frontal, tres cuartos y perfil sin artefactos como el mechon con forma de cuerno o la deriva de color en el abrigo.

Es relevante ahora porque ejemplifica el flujo de trabajo habitual en la comunidad de difusion: entrenamiento de LoRA sobre merges de SDXL, evaluacion comparativa por epocas y publicacion de matrices de fuerza y escena para que otros usuarios reproduzcan los resultados. El repositorio pesa 7,9 GB y cada archivo individual ocupa 456.495.868 bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL, base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (adaptador LoRA; cada archivo pesa 456.495.868 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en, zh |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango bajo acoplado a un U-Net de difusion SDXL. El checkpoint base es waiIllustriousSDXL v17, un merge de la familia Illustrious/NoobAI orientado a ilustracion anime. El entrenamiento se realizo con captions que usan `keep_tokens = 2`, y las captions no incluyen color de pelo ni de ojos: la identidad se aprende a traves de los tokens de disparo leidos de las imagenes de entrenamiento (`remi_ayasaki` para identidad, con twintails, pelo largo rosa y ojos rojos; y tokens de vestuario como `remi_ayasaki_winter_uniform`, `remi_ayasaki_winter_coat_scarf`, `remi_ayasaki_cooking_apron` y `remi_ayasaki_red_tracksuit`).

El dataset de entrenamiento esta publicado como abbuibuibui/RemiAyasaki-Dataset. Se generaron siete epocas; no existe `remi_ayasaki-000007.safetensors`, ya que el guardado de fin de entrenamiento es el archivo sin numerar y corresponde a E7. El autor documento una evaluacion horizontal con columnas por epoca y filas por fuerza de LoRA, generada en una DGX con ComfyUI y sin retoque posterior. La innovacion tecnica destacable no esta en la arquitectura sino en el protocolo de seleccion: cribado de las siete epocas a 0.8 sobre retrato frontal, cuerpo completo con uniforme de invierno y cuerpo completo con abrigo, seguido de una matriz de 10 escenas por 4 fuerzas para E5, E6 y E7.

## Capacidades

- Generacion de imagenes anime del personaje Remi Ayasaki con identidad consistente en vista frontal, tres cuartos y perfil.
- Control de vestuario mediante tokens especificos: uniforme de invierno, abrigo con bufanda, delantal de cocina y chandal rojo.
- Composicion de escenas complejas (calle nocturna, poses sentadas) manteniendo la identidad a fuerzas de 0.6-0.8.
- Compatibilidad con merges de la familia Illustrious y NoobAI, no solo con el checkpoint base exacto.
- Variantes para otras bases: AutismMix Pony (subdirectorio `autism_pony/`) y MOSS-Image (subdirectorio `moss/`), con prompts y bases no intercambiables.
- Soporte de prompt negativo recomendado por el autor para evitar deriva de color de pelo y ojos y aparicion de personajes multiples.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni modalidades de audio o video: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de fan art de *Horimiya*: invocar `remi_ayasaki` junto con `remi_ayasaki_winter_uniform` a fuerza 0.8 para obtener retratos y cuerpos completos coherentes con el diseno del personaje, usando Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y 832x1216.
- Creacion de hojas de personaje: generar vistas frontal, tres cuartos y perfil con la misma identidad, aprovechando que E6 mantiene la coherencia entre angulos a fuerzas de 0.6-0.8.
- Escenas narrativas de vestuario alternativo: usar `remi_ayasaki_cooking_apron` o `remi_ayasaki_red_tracksuit` para ilustrar situaciones cotidianas fuera del entorno escolar.
- Escenarios nocturnos y de exterior: la matriz del autor confirma que E6 a 0.8 en calle nocturna no anade bolsa escolar no deseada, a diferencia de E5, lo que lo hace adecuado para composiciones de ambiente.
- Integracion en pipelines de ComfyUI para produccion de contenido: el LoRA se carga como nodo estandar de diffusers/ComfyUI y puede encadenarse con hires fix y ADetailer, aunque el autor documento los resultados con ambas desactivadas.
- Experimentacion comparativa de entrenamiento: los siete pesos E1-E7 permiten estudiar el efecto de la epoca sobre fidelidad de identidad y deriva de color, util para investigadores que analicen dinamicas de sobreentrenamiento en LoRA.
- Variantes sobre otras bases: usar el subdirectorio `autism_pony/` o `moss/` para proyectos que ya trabajen con AutismMix Pony o MOSS-Image, sin mezclar prompts ni checkpoints base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. El autor proporciona una evaluacion cualitativa por epocas y fuerzas:

| Candidato | Resultado observado | Decision |
|---|---|---|
| E1 | Rostro ya con pelo rosa y ojos rojos; el cuerpo completo con uniforme de invierno anade un mechon con forma de cuerno y el abrigo deriva a azul claro | Alternativa temprana |
| E5 | Identidad estable; a 0.8 la calle nocturna genera una bolsa escolar y la pose sentada muestra brazos cruzados | Alternativa |
| E6 | Rostro, tres cuartos y perfil consistentes a 0.6-0.8; uniforme de invierno limpio; sin bolsa extra en calle nocturna | Recomendado a 0.8 |
| E7 | Muy cercano a E6; 1.0 no aporta ganancia clara | Alternativa de epoca final |

Efecto de fuerza documentado: `remi_ayasaki_winter_coat_scarf` a 0.4-0.6 produce abrigo blanco con bufanda roja; a 0.8-1.0 el abrigo vira a marron y la bufanda palidece. Sin token de vestuario, 0.8 mantiene un jersey rosa casual; a 1.0 la ropa empieza a mezclarse. Sin el token de nombre, fuerza 0.4 ya filtra pelo rosa, ojos rojos y rostro del personaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un LoRA sobre SDXL, requiere cargar el checkpoint base completo (tipicamente 6-7 GB en fp16) mas el adaptador de 456 MB.
- GPU recomendadas: el autor genero las evaluaciones en una DGX con ComfyUI, lo que implica GPU de datacenter (A100 o similar); no se especifica el modelo exacto.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-12 GB de VRAM para SDXL en fp16, y en configuraciones de 6-8 GB con cuantizacion del base (no documentada por el autor).
- Opciones de despliegue: ComfyUI (usado por el autor), diffusers (libreria declarada), Automatic1111/Forge y otros frontends compatibles con SDXL e Illustrious.
- Latencia y throughput: no disponibles. Los ajustes de generacion documentados son Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion 832x1216, sin hires ni ADetailer.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RemiAyasaki-Lora (este) | waiIllustriousSDXL v17 | LoRA de personaje | no disponible (456 MB por archivo) | no aplica | creativeml-openrail-m | Hugging Face, 230 descargas |
| AutismMix Pony LoRA (mismo repo, `autism_pony/`) | AutismMix Pony | LoRA de personaje | no disponible | no aplica | creativeml-openrail-m | Incluido en el mismo repositorio |
| MOSS-Image LoRA (mismo repo, `moss/`) | MOSS-Image | LoRA de personaje | no disponible | no aplica | creativeml-openrail-m | Incluido en el mismo repositorio |

No se dispone de informacion sobre otros LoRA de personaje comparables de la misma serie o de la misma base en la informacion proporcionada. Las tres variantes del repositorio no son intercambiables: el autor advierte explicitamente de no mezclar sus checkpoints base ni sus prompts.

## Limitaciones y advertencias

- Deriva de color por fuerza: a 0.8-1.0 el abrigo blanco con bufanda roja vira a marron con bufanda palida; para recuperar el diseno original hay que bajar a 0.6.
- Fuga de identidad: sin el token `remi_ayasaki`, a fuerza 0.4 ya aparece pelo rosa, ojos rojos y el rostro del personaje, lo que contamina prompts genericos de colegiala.
- Mezcla de ropa a fuerza 1.0 cuando no se especifica token de vestuario.
- Artefactos en epocas tempranas: E1 anade un mechon con forma de cuerno en cuerpo completo con uniforme y deriva el abrigo a azul claro.
- Riesgo de alucinacion morfologica propio de SDXL: el prompt negativo recomendado incluye bad anatomy, bad hands, missing fingers y extra digit, lo que indica que persisten errores en manos y anatomia.
- Restriccion de licencia: CreativeML OpenRAIL-M impone restricciones de uso (prohibicion de usos daninos descritos en la licencia) y obliga a propagar la licencia en derivados; no es una licencia de codigo abierto permisiva al uso.
- Caracter no oficial: es una obra derivada de fans; los derechos del personaje y de la obra original pertenecen a sus titulares, lo que limita el uso comercial del personaje.
- Ambito limitado a dos idiomas declarados (en, zh) en metadatos, aunque al ser un modelo de imagen los prompts funcionales son en ingles.
- No mezclar linajes: usar pesos de `autism_pony/` con base AutismMix Pony y los de `moss/` con MOSS-Image; mezclarlos con waiIllustriousSDXL produce resultados invalidos.
- El repositorio no declara pipeline en Hugging Face ni variantes cuantizadas; el despliegue depende del frontend que cargue el checkpoint base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/RemiAyasaki-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/RemiAyasaki-Dataset
- Notas de evaluacion en chino: https://huggingface.co/abbuibuibui/RemiAyasaki-Lora/blob/main/evaluation/横向测评记录.md
- README en chino: https://huggingface.co/abbuibuibui/RemiAyasaki-Lora/blob/main/README_zh.md
- Variante AutismMix Pony: https://huggingface.co/abbuibuibui/RemiAyasaki-Lora/tree/main/autism_pony
- Variante MOSS-Image: https://huggingface.co/abbuibuibui/RemiAyasaki-Lora/tree/main/moss
- Checkpoint base waiIllustriousSDXL v17: no disponible como enlace en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible
