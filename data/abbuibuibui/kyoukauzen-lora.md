# abbuibuibui/KyoukaUzen-Lora

## Resumen

KyoukaUzen-Lora es un LoRA de personaje para modelos de difusión SDXL, desarrollado por el usuario abbuibuibui y publicado en Hugging Face. Reproduce a Kyouka Uzen (羽前京香), personaje de la serie *Mato Seihei no Slave*, y está entrenado sobre el checkpoint waiIllustriousSDXL v17, un modelo base de la familia Illustrious orientado a ilustración anime. El repositorio contiene en realidad tres linajes distintos de pesos: el LoRA original para WAI/Illustrious en la raíz, un LoRA para AutismMix Pony bajo `autism_pony/` y un LoRA para MOSS-Image bajo `moss/`, cada uno con su propio modelo base y sus propios prompts.

El modelo resuelve un problema acotado pero muy demandado en la comunidad de generación de imágenes anime: la consistencia de identidad de un personaje concreto a través de prompts, poses, encuadres y vestuario. Para ello emplea el mecanismo estándar de LoRA sobre atención en un transformer de difusión SDXL, con rango 64 y alpha 32, entrenado con 91 pares imagen-texto y 2 repeticiones. El repositorio ocupa 7,9 GB e incluye pesos por epoch, muestras de evaluación y documentación bilingüe inglés-chino.

Su relevancia es práctica más que arquitectónica: no introduce técnicas nuevas de difusión, sino que ofrece una receta reproducible (dataset público, checkpoint recomendado, tokens de disparo y ajustes de inferencia verificados) para un personaje concreto. La evaluación comparativa del autor recomienda el epoch E6 a fuerza 0,8 sobre el linaje WAI/Illustrious, con muestras generadas en ComfyUI a 832×1216, Euler a, 28 pasos, CFG 4,5 y CLIP skip 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión SDXL (familia Illustrious); linajes adicionales para AutismMix Pony y MOSS-Image |
| Parametros totales | no disponible (pesos LoRA; cada fichero de 456.496.828 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión; resolución de entrenamiento no especificada, muestras a 832×1216) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión nativa; no se documentan variantes GGUF ni fp8) |
| Idiomas soportados | en, zh (prompts y documentación) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre un UNet de SDXL. No se modifican los pesos del checkpoint base: el LoRA inyecta matrices de baja descomposición en las capas de atención, con rango 64 y alpha 32, lo que da un factor de escala efectivo de 0,5 antes de aplicar la fuerza de invocación en el prompt. El entrenamiento se realizó sobre waiIllustriousSDXL v17 con 91 pares imagen-texto, 2 repeticiones por par y ejecución en DGX Spark mediante ComfyUI. El dataset está publicado como `abbuibuibui/KyoukaUzen-Dataset`.

El repositorio distribuye siete epochs numerados de forma peculiar: E1 a E4 como `kyouka_uzen-000001` a `000004`, E5 como `000005`, E6 como `000006` y E7 como el fichero sin numerar `kyouka_uzen.safetensors`. No existe un `000007`. La evaluación matricial en dos rondas sobre E5, E6 y E7 concluyó que E6 ofrece el mejor equilibrio entre identidad facial, fidelidad del uniforme de combate y estabilidad en vestuario casual, y es el valor por defecto recomendado a fuerza 0,8. El linaje AutismMix Pony se entrenó sobre AutismMix Pony y se muestra con AutismMix Confetti, con E6 a fuerza 1,0; el linaje MOSS-Image dispone de sus propios pesos. El autor advierte explícitamente de no mezclar pesos, modelos base ni prompts entre linajes.

## Capacidades

- Generación de imágenes de un personaje concreto con identidad consistente: rostro, pelo lavanda pálido largo, ojos magenta y adornos azules con forma de ala.
- Control de vestuario mediante tokens dedicados: `aoba_wakura_combat_uniform`, `aoba_wakura_red_turtleneck`, `aoba_wakura_black_turtleneck`, `aoba_wakura_green_tank_top` y `aoba_wakura_white_tank_top`.
- Transferencia de identidad a encuadres variados: retrato, tres cuartos, perfil, cuerpo completo, sentada y escenas nocturnas con fondo complejo.
- Composición con el checkpoint base Illustrious para estilos de ilustración anime, screencap y estética de alta resolución.
- Compatibilidad con el ecosistema diffusers y con ComfyUI mediante el nodo de carga de LoRA.
- Soporte de prompts en inglés y en chino según la documentación del autor.
- No dispone de tool calling, razonamiento multi-paso, visión de entrada ni modo thinking: es un adaptador de generación de imagen, no un modelo de lenguaje.

## Casos de uso

- Ilustración de fan art consistente: el LoRA permite generar variaciones de Kyouka Uzen en distintas poses y escenarios manteniendo el rostro y los rasgos distintivos, gracias a los tokens de identidad y vestuario documentados.
- Producción de fichas de personaje para proyectos derivados: se puede fijar E6 a 0,8 y generar un conjunto de retrato, tres cuartos y perfil para documentación visual interna.
- Escenas narrativas seriadas: el control de vestuario por token permite alternar uniforme de combate y ropa casual dentro de una misma secuencia sin perder la identidad del personaje.
- Pruebas de concepto de estilo anime: sirve como referencia para evaluar la calidad de un checkpoint Illustrious antes de entrenar LoRAs propios, usando el dataset y la configuración publicados como plantilla.
- Integración en pipelines de ComfyUI: el LoRA se carga como nodo estándar y puede encadenarse con upscalers, ControlNet o IP-Adapter para flujos de ilustración más elaborados.
- Comparación de linajes de modelo base: al incluir pesos para WAI/Illustrious, AutismMix Pony y MOSS-Image, permite medir cómo un mismo personaje se comporta en tres familias de SDXL distintas, siempre con prompts separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluación del autor es cualitativa y visual: dos rondas de matriz comparativa sobre E5, E6 y E7 con muestras en ComfyUI (Euler a, 28 pasos, CFG 4,5, CLIP skip 2, 832×1216) y una tabla de decisión que recomienda E6 a 0,8. No hay métricas numéricas como FID, CLIP score ni comparaciones cuantitativas con otros LoRAs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como LoRA sobre SDXL, el requisito lo marca el checkpoint base; el adaptador añade una sobrecarga pequeña respecto a los pesos del UNet.
- GPU recomendadas: el autor entrenó en DGX Spark. Para inferencia, cualquier GPU capaz de ejecutar SDXL en ComfyUI; no se documentan modelos concretos.
- GPU de consumo: no se confirma compatibilidad con tarjetas concretas; al depender de SDXL, la viabilidad en consumer GPU viene determinada por el checkpoint base y la cuantización que se le aplique, no por el LoRA.
- Despliegue: ComfyUI es el entorno de referencia documentado; la librería declarada es diffusers, por lo que también puede cargarse en pipelines de Python con `load_lora_weights`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KyoukaUzen-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 (+ AutismMix Pony, MOSS-Image) | muestras a 832×1216 | creativeml-openrail-m | Hugging Face, ModelScope |
| LoRAs de personaje de la misma serie (Nei, Tenka, Himari) | LoRA de personaje | familia Illustrious | no disponible | no disponible | mencionados por el autor, sin enlace directo |
| LoRA de personaje genérico para SDXL | LoRA de personaje | SDXL / Pony / Illustrious | depende del base | variable | ecosistema Civitai y Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas; la comparación se limita a tipo de adaptador, modelo base y licencia.

## Limitaciones y advertencias

- Riesgo de deriva de identidad: el autor advierte que en vestuario casual el color de ojos se desvía si no se escribe explícitamente `magenta eyes`; los captions de entrenamiento a menudo omiten color de pelo y ojos.
- Los adornos azules con forma de ala no siempre aparecen; deben escribirse en el prompt si se quieren garantizar.
- Confusión entre linajes: mezclar los pesos de la raíz (WAI/Illustrious) con los de `autism_pony/` o `moss/`, o usar el prompt de un linaje con el modelo base de otro, produce resultados incorrectos.
- El token de disparo documentado es `aoba_wakura`, no el nombre del personaje; usar el nombre natural en el prompt no garantiza la identidad.
- Es un derivado no oficial y fan-made: no cuenta con el respaldo del titular de los derechos de la serie.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso aceptable; conviene revisar las cláusulas antes de desplegarlo en productos.
- No hay métricas cuantitativas publicadas ni evaluación independiente; la recomendación de E6 a 0,8 proviene del propio autor.
- El repositorio es grande (7,9 GB) por acumular tres linajes y material de evaluación; la descarga completa no es necesaria si solo se usa un linaje.
- Idiomas de prompt limitados a inglés y chino en la documentación; no se garantiza comportamiento con prompts en castellano.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/KyoukaUzen-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/KyoukaUzen-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/AobaWakura-Lora
- Notas de evaluación en chino: `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
