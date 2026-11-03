# abbuibuibui/MayuriShiina-Lora

## Resumen

MayuriShiina-Lora es un adaptador LoRA de personaje para el modelo de difusión waiIllustriousSDXL v17, una variante de SDXL orientada a ilustración anime. Lo desarrolla el usuario abbuibuibui y reproduce a Mayuri Shiina (椎名真由理), personaje de la visual novel y anime Steins;Gate. No es un modelo de lenguaje: es un complemento de generación de imágenes que se carga sobre el checkpoint base mediante la librería diffusers o en ComfyUI.

El repositorio contiene siete checkpoints correspondientes a las épocas de entrenamiento (E1–E7), cada uno de 456.494.396 bytes, con un total de 3,2 GB en el repo. El autor recomienda E6 a fuerza 0.8 tras una evaluación comparativa propia sobre diez escenas y cuatro intensidades. El entrenamiento partió de 62 pares imagen-texto con cuatro conjuntos de vestuario, rango LoRA 64 y alpha 32.

Su relevancia es acotada: se trata de un derivado fan-made sin respaldo oficial, con cero descargas y cero likes en el momento de la ficha, pensado para integrarse en flujos de trabajo de ilustración anime con el ecosistema Illustrious/SDXL. No aporta capacidades de razonamiento, código ni texto; su utilidad se limita a la consistencia visual de un personaje concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión (SDXL / Illustrious) |
| Parametros totales | no disponible (adaptador de rango 64; fichero de 456.494.396 bytes por checkpoint) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el checkpoint base admite fp16/bf16) |
| Idiomas soportados | en, zh (etiquetas de prompt) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre waiIllustriousSDXL v17, un checkpoint SDXL afinado para ilustración anime. El entrenamiento usó AdamW en bf16, buckets con tope de 1536 píxeles y 7 épocas sobre un dataset de 62 pares imagen-texto que cubren cuatro conjuntos de vestuario, con 3 repeticiones por muestra. Las captions se generaron con `keep_tokens = 2`, de modo que el color de pelo y de ojos a menudo se omite en el texto y debe añadirse explícitamente en el prompt de inferencia.

No se documentan innovaciones técnicas más allá del procedimiento estándar de fine-tuning LoRA para difusión: no hay decodificación especulativa, atención lineal ni etapas de RLHF/DPO, que no aplican a este tipo de modelo. La evaluación del autor consistió en una ronda de cribado de E1–E7 a fuerza 0.8 y una matriz posterior de E5, E6 y E7 por diez escenas y cuatro intensidades (0.4, 0.6, 0.8, 1.0), de la que se concluyó que E6 a 0.8 ofrece la silueta más estable del personaje.

## Capacidades

- Generación de imágenes de un personaje concreto (Mayuri Shiina) sobre el checkpoint base waiIllustriousSDXL.
- Control de identidad mediante el token `mayuri_shiina`, con rasgos asociados de pelo corto negro y ojos azules.
- Control de vestuario mediante tokens específicos: `mayuri_shiina_blue_dress` (vestido azul con cofia blanca), `mayuri_shiina_white_blouse_green_skirt` (blusa blanca y falda verde), `mayuri_shiina_brown_coat_pink_scarf` y `mayuri_shiina_white_winterwear_pink_scarf`.
- Composición de escenas variadas: retrato frontal, tres cuartos, perfil, plano completo, sentada, fondo simple y fondo nocturno complejo, según la evaluación publicada.
- Etiqueta de sujeto `1girl` como convención del ecosistema Illustrious.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o vídeo.

## Casos de uso

- Ilustración de fan art de Steins;Gate: cargar el LoRA E6 a 0.8 en ComfyUI o diffusers y generar retratos del personaje con rasgos consistentes, evitando la deriva de identidad típica de los prompts sin adaptador.
- Creación de hojas de personaje para proyectos derivados: combinando los cuatro tokens de vestuario se obtienen variantes de indumentaria del mismo personaje con continuidad visual entre imágenes.
- Fondos y escenas narrativas: la evaluación incluye escenas nocturnas complejas y composiciones de cuerpo entero, útiles para ilustrar viñetas o material promocional de fan projects.
- Prototipado rápido de arte conceptual: con 28 pasos, sampler Euler a y CFG 4.5 se obtienen resultados en resolución 832×1216 sin hires fix ni ADetailer, lo que reduce el coste por iteración.
- Integración en pipelines automatizados de generación por lotes mediante diffusers, cargando el safetensors del adaptador sobre el checkpoint base y variando prompts y semillas.
- Comparación de épocas para ajuste fino: los checkpoints E1–E7 permiten evaluar el compromiso entre fidelidad al personaje y flexibilidad compositiva a distintas fuerzas (0.4–1.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta una evaluación cualitativa propia con imágenes comparativas por época e intensidad, sin métricas numéricas (FID, CLIP score ni similares).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El adaptador pesa unos 456 MB por checkpoint y se suma a los requisitos del checkpoint base SDXL, que típicamente ocupa entre 6 y 7 GB en fp16.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del base SDXL, se requiere una GPU con al menos 8 GB de VRAM para inferencia en fp16, aunque el dato no lo confirma el autor.
- GPU de consumo: no confirmado por el autor; el base SDXL es viable en tarjetas de gama alta de consumo, pero no hay cifras publicadas para este adaptador.
- Opciones de despliegue: diffusers (librería declarada) y ComfyUI (usado en la evaluación del autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles. La configuración de referencia es Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y resolución 832×1216.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de personaje comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo derivado no oficial: los derechos sobre Mayuri Shiina y Steins;Gate pertenecen a sus titulares; el autor lo declara explícitamente como fan-made.
- Licencia creativeml-openrail-m: permite uso comercial con restricciones, pero al ser un derivado de un personaje con copyright, el uso comercial del personaje puede infringir derechos de terceros independientemente de la licencia del adaptador.
- Dependencia total del checkpoint base waiIllustriousSDXL v17: no funciona de forma autónoma y su calidad varía con el base y con la versión del mismo.
- Sesgo de dataset: solo 62 pares de imagen y 4 conjuntos de vestuario, lo que limita la variedad de poses, expresiones e iluminación respecto a LoRA con datasets mayores.
- Las captions omiten con frecuencia color de pelo y ojos, por lo que es necesario añadirlos en el prompt para evitar derivas de identidad.
- Riesgo de sobreajuste al estilo del dataset y de artefactos en composiciones complejas o fuerzas superiores a 1.0, no evaluadas en la matriz publicada.
- Sin descargas ni validación de la comunidad en el momento de la ficha; el único aval es la evaluación del propio autor.
- No apto para tareas de texto, razonamiento, código o agentes.

## Enlaces

- HuggingFace: https://huggingface.co/abbuibuibui/MayuriShiina-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/MayuriShiina-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/MayuriShiina-Lora
