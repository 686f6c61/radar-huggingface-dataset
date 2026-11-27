# abbuibuibui/SakuraKono-Lora

## Resumen

SakuraKono-Lora es un LoRA de personaje (character LoRA) para modelos de difusion SDXL, concretamente entrenado sobre el checkpoint waiIllustriousSDXL v17, que reproduce a Sakura Kono (河野樱), personaje secundario del manga y anime *Horimiya*. Lo desarrolla el usuario abbuibuibui como derivado no oficial y lo publica en Hugging Face bajo licencia CreativeML OpenRAIL-M. El repositorio contiene tres linajes de pesos distintos: el LoRA original para WAI/Illustrious en la raiz, una variante para AutismMix Pony en `autism_pony/` y otra para MOSS-Image en `moss/`, cada una con su propio modelo base y sus propios prompts.

El modelo resuelve un problema acotado pero muy concreto en flujos de generacion de imagen: la consistencia de identidad de un personaje poco representado en los datasets de preentrenamiento. Al ser un LoRA de bajo rango sobre SDXL, no se usa de forma autonoma sino como adaptador que se carga junto al checkpoint base mediante la sintaxis `<lora:nombre:peso>` en ComfyUI, Automatic1111 o diffusers. El repo pesa 7,9 GB e incluye siete epocas de entrenamiento (E1-E7), con una recomendacion explicita del autor de usar E6 a fuerza 0,8.

La relevancia actual es practica: los LoRA de personaje son el mecanismo estandar para fijar identidades en pipelines de generacion de imagen, y este ejemplo documenta de forma inusualmente detallada el proceso de seleccion de epoca mediante evaluacion comparativa (matriz de 10 escenas por 4 fuerzas sobre E5, E6 y E7). Los idiomas declarados en la model card son ingles y chino, referidos a la documentacion y a los prompts, no a capacidades del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL / Illustrious |
| Parametros totales | no disponible (cada fichero pesa 456.495.868 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes GGUF ni fp8) |
| Idiomas soportados | en, zh (referido a documentacion y prompts; los prompts de difusion son predominantemente en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (via libreria diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango bajo inyectado sobre waiIllustriousSDXL-v17, un merge de la familia Illustrious (derivada de SDXL con enfasis en estetica anime). El entrenamiento se realizo sobre el dataset [abbuibuibui/SakuraKono-Dataset](https://huggingface.co/datasets/abbuibuibui/SakuraKono-Dataset), con captions configurados con `keep_tokens = 2`. Esa eleccion de `keep_tokens` implica que las dos primeras etiquetas de cada caption quedan fijas como trigger de identidad y trigger de outfit, mientras que el resto del texto participa en el dropout de captions durante el entrenamiento.

Un detalle tecnico relevante documentado por el autor: las captions de entrenamiento suelen **omitir** el color de pelo, el color de ojos y la etiqueta `glasses`. Esas palabras de identidad se anadieron despues, leyendo las imagenes de entrenamiento, y se usaron en la evaluacion. La consecuencia practica es que el atributo `glasses` debe anadirse manualmente en el prompt positivo: sin el, las tomas con uniforme escolar suelen conservar las gafas, pero las tomas casuales o sin outfit las pierden con facilidad. El repositorio incluye siete epocas (E1-E7); el fichero final sin numerar (`sakura_kono.safetensors`) corresponde a E7 y no existe un `sakura_kono-000007.safetensors`. El SHA-256 de E6 es `9A45EE29A7A80D1D5E10DF14A237C25A4C5E58507BBE44CC074AC834C7F692B5`.

## Capacidades

- Generacion de imagenes de un personaje concreto (Sakura Kono) con identidad consistente: pelo largo liso castano con flequillo recto, ojos castanos o avellana y gafas.
- Control de vestuario mediante tokens de outfit dedicados: `sakura_kono_school_uniform` (blazer azul marino, chaleco crema o gris, lazo rojo, falda plisada, medias negras, mocasines marrones), `sakura_kono_cooking_apron` (delantal rosa claro sobre camisa gris claro), `sakura_kono_red_tracksuit` y `sakura_kono_sports_shirt`.
- Composicion de escenas completas (retrato frontal, cuerpo entero, escena nocturna en calle, personaje sentado) manteniendo la identidad a fuerzas de 0,6-0,8.
- Compatibilidad con el ecosistema SDXL: funciona en ComfyUI, Automatic1111 y diffusers mediante carga de adaptadores LoRA.
- Tres linajes alternativos para distintos modelos base (WAI/Illustrious, AutismMix Pony, MOSS-Image), no intercambiables entre si.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un adaptador de difusion de imagen.

## Casos de uso

- Ilustracion de fan art con identidad fija: cargar E6 a 0,8 sobre waiIllustriousSDXL v17 y componer escenas variadas del personaje sin perder rasgos faciales ni el uniforme, gracias a la evaluacion por epocas que el autor documenta.
- Generacion de tiras comicas o doujinshi: al mantener la cara y el vestuario estables entre tomas, el LoRA permite producir paneles consecutivos con continuidad visual razonable, usando el token de outfit adecuado en cada escena.
- Prototipado de personajes para proyectos derivados: sirve como referencia de como estructurar un dataset de personaje, con triggers de identidad y de vestuario separados y `keep_tokens = 2`.
- Pruebas de pipelines de imagen en ComfyUI: el repo incluye ajustes reproducibles (Euler a, 28 pasos, CFG 4,5, CLIP skip 2, 832x1216) que sirven como configuracion de referencia para validar nodos y flujos de trabajo.
- Comparacion de bases SDXL: al ofrecer variantes para WAI/Illustrious, AutismMix Pony y MOSS-Image, permite evaluar como se comporta el mismo personaje bajo distintas familias de checkpoints, siempre sin mezclar bases ni prompts.
- Investigacion sobre evaluacion de epocas en LoRA: la matriz de 10 escenas por 4 fuerzas sobre E5, E6 y E7 es un caso documentado de seleccion de checkpoint por criterios observables (gafas, color del delantal, coherencia del uniforme).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta una evaluacion cualitativa por epoca en lugar de metricas cuantitativas:

| Candidato | Resultado observado | Decision |
|---|---|---|
| E1 | Pelo y ojos castanos correctos, pero el retrato suele perder las gafas; identidad con uniforme poco definida | Alternativa temprana |
| E2-E4 | Vuelven las gafas; cara usable, menos asentada en cuerpo entero que el trio tardio | Alternativa |
| E5 | Gafas estables con uniforme; delantal rosa claro a 0,8; bolsa escolar azul en escena nocturna a 0,8 | Alternativa de matriz |
| E6 | Retrato y cuerpo entero con uniforme conservan gafas y rostro a 0,6-0,8; delantal rosa claro a 0,6-0,8 | Recomendado a 0,8 |
| E7 | Cara y uniforme cercanos a E6; el delantal deriva a crema a 0,8 | Alternativa de epoca final |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como adaptador LoRA sobre SDXL, el requisito dominante es el del checkpoint base (waiIllustriousSDXL v17), no el del LoRA; cada fichero LoRA ocupa unos 456 MB en disco.
- GPU recomendadas: no especificadas por el autor. Por la familia del modelo base (SDXL), el rango habitual de ejecucion es de 8-12 GB de VRAM en consumer y de 16-24 GB en GPUs de gama alta; esta estimacion es generica y no procede de la informacion proporcionada.
- Cabe en GPU consumer: previsiblemente si, en funcion del checkpoint base y de la cuantizacion de este; el autor no aporta datos concretos.
- Opciones de despliegue: ComfyUI (configuracion documentada: Euler a, 28 pasos, CFG 4,5, CLIP skip 2, 832x1216, hires y ADetailer desactivados), Automatic1111 y diffusers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros LoRA de personaje comparables en la informacion proporcionada. La comparacion posible es interna, entre los tres linajes del propio repositorio:

| Linaje | Modelo base | Ubicacion | Uso |
|---|---|---|---|
| Original | waiIllustriousSDXL v17 | raiz del repo | Recomendado; E6 a 0,8 |
| AutismMix Pony | AutismMix Pony | `autism_pony/` | Alternativo; no mezclar base ni prompts |
| MOSS-Image | MOSS-Image | `moss/` | Alternativo; no mezclar base ni prompts |

## Limitaciones y advertencias

- Riesgo de perdida de atributos: sin `glasses` en el prompt positivo, las tomas casuales o sin outfit pierden las gafas con frecuencia; el autor lo advierte explicitamente.
- Deriva de color: los ojos pueden virar a verde u oliva en primeros planos; se recomienda mantener `brown eyes` en positivo y `green eyes` en negativo. El delantal rosa claro puede volverse crema a fuerza 1,0 y arrastrar una taza de cafe.
- Fuerza de aplicacion sensible: por encima de 0,8 el delantal y otros detalles se degradan; por debajo de 0,6 la identidad se debilita. El rango util documentado es 0,6-0,8.
- Incompatibilidad entre linajes: mezclar los pesos de `autism_pony/` o `moss/` con el modelo base equivocado, o mezclar sus prompts, produce resultados incorrectos.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos descritos en la licencia) y exige mantener el aviso de licencia; conviene revisar las clausulas de atribucion antes de desplegar en produccion.
- Naturaleza derivada: es un producto no oficial hecho por fans; los derechos del personaje y de la obra original permanecen con sus titulares, lo que anade riesgo legal al uso comercial del personaje representado.
- Sesgos: no documentados por el autor; al entrenarse sobre un dataset de imagenes de un unico personaje, la diversidad de poses, iluminacion y composicion esta acotada por ese dataset.
- Alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta (manos, dedos) y artefactos; el autor incluye un negative prompt de referencia para mitigarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/SakuraKono-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/SakuraKono-Dataset
- README en chino: https://huggingface.co/abbuibuibui/SakuraKono-Lora/blob/main/README_zh.md
- Variante AutismMix Pony: https://huggingface.co/abbuibuibui/SakuraKono-Lora/tree/main/autism_pony
- Variante MOSS-Image: https://huggingface.co/abbuibuibui/SakuraKono-Lora/tree/main/moss
