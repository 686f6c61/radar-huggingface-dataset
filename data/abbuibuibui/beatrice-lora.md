# abbuibuibui/Beatrice-Lora

## Resumen

Beatrice-Lora es un LoRA de personaje no oficial para **Beatrice**, el personaje de *Re:Zero − Starting Life in Another World*, entrenado sobre el modelo base **waiIllustriousSDXL v17** (familia Illustrious SDXL). Lo publica el usuario `abbuibuibui` como derivado fan-made: no es un modelo de lenguaje, sino un adaptador de bajo rango para generación de imágenes Anime mediante Stable Diffusion XL, que añade la identidad visual del personaje (rubio, twin drills, ojos azules, lazo y cinta) y su vestido rojo característico.

El repositorio incluye siete checkpoints LoRA etiquetados E1–E7. El autor recomienda **E6** (`beatrice_rE1S77-000006.safetensors`) a fuerza **0.8** como configuración por defecto, con E7 como alternativa cercana. El conjunto se entrenó con 70 imágenes etiquetadas con dos tokens de activación: `beatrice_rezero` (identidad) y `beatrice_red_dress` (outfit).

Su relevancia práctica es acotada pero clara: es un ejemplo de flujo de entrenamiento y evaluación reproducible para LoRAs de personaje sobre Illustrious, con publicación de matriz de pesos, hashes SHA-256 y registro de evaluación horizontal. El repo ocupa 1,6 GB y no registra descargas ni likes en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptación de bajo rango) sobre SDXL; se aplica a la UNet y al text encoder del modelo base waiIllustriousSDXL-v17 |
| Parametros totales | No disponible (el autor no publica el recuento); rango dim 32 / alpha 16 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusión texto-a-imagen); el autor no documenta límites de prompt |
| Tipos de cuantizacion | No disponible; checkpoints en safetensors, entrenamiento en bf16 |
| Idiomas soportados | en, zh (etiquetas del repositorio); los prompts de ejemplo están en inglés |
| Licencia | CreativeML OpenRAIL-M (el autor restringe a uso fan no comercial) |
| Formato de pesos | safetensors (7 checkpoints LoRA independientes) |

## Arquitectura y entrenamiento

El adaptador es un LoRA inyectado en la UNet y en el text encoder de waiIllustriousSDXL v17, un SDXL afinado para estilo anime. La configuración declarada es **dim 32 / alpha 16**, optimizador **AdamW8bit**, learning rate **1e-4** para la UNet y **5e-5** para el text encoder, precisión **bf16** y buckets de resolución **1024**. El dataset son **70 imágenes fijas** de un único outfit, con `keep_tokens=2` y `repeats=2`; las captions comienzan por `beatrice_rezero, beatrice_red_dress, …`. Se completaron **7 épocas**; E7 proviene de un resume sobre `beatrice_rE7S868`.

Destaca el esfuerzo de trazabilidad más que la innovación técnica: el autor publica los siete checkpoints formales, el SHA-256 de E6 (`d04e7169…5f07c1`) y las notas de evaluación en `evaluation/横向测评记录.md`. No hay decodificación especulativa, atención lineal ni otras técnicas propias de modelos de lenguaje; el mecanismo es el estándar de adaptación de bajo rango sobre difusión.

## Capacidades

- Generación de ilustraciones del personaje Beatrice en estilo anime screencap, con identidad consistente entre semillas.
- Control de identidad y vestuario mediante dos tokens: `beatrice_rezero` (rubio, twin drills, ojos azules, hair bow, ribbon) y `beatrice_red_dress`.
- Composición de planos variados: retrato frontal, tres cuartos, perfil, cuerpo entero y pose sentada, según la evaluación del autor.
- Funciona en escenarios con fondo simple y fondo complejo (documentado en las escenas 08 y 09).
- Compatible con el ecosistema SDXL/Illustrious: sintaxis `<lora:beatrice_rE1S77-000006:0.8>` en WebUI, o carga vía `diffusers` como adaptador.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo etiquetas en inglés y chino en los metadatos; los prompts deben ir en inglés para el text encoder CLIP.
- Capacidad especial: ninguna más allá del condicionamiento de personaje; no hay modo *thinking*, visión ni audio.

## Casos de uso

- **Fan art de personaje consistente**: generar ilustraciones de Beatrice manteniendo rasgos faciales y peinado entre imágenes, usando E6 a 0.8 con el prompt de referencia del autor; útil para ilustradores que necesitan variaciones rápidas de un mismo personaje.
- **Producción de doujinshi o cómic corto**: combinado con ControlNet y una semilla fija, permite mantener al personaje coherente a lo largo de varias viñetas con planos distintos (retrato, perfil, cuerpo entero) que el autor ya validó en su matriz de escenas.
- **Prototipado de personajes en pipelines ComfyUI**: al ser un LoRA de safetensors cargable por nodo, se puede encadenar con upscalers y samplers dentro de un grafo reproducible para generar hojas de personaje.
- **Pruebas de estilización anime screencap**: el prompt de ejemplo incluye `anime screencap`, `very aesthetic`, `absurdres`; sirve para evaluar cómo interactúa un LoRA de personaje con el estilo IL de Illustrious frente a SDXL base.
- **Base para entrenamientos derivados**: E7 se generó por resume y el dataset es público, lo que permite reentrenar o continuar el entrenamiento con nuevos outfits (el autor señala que este set no incluye outfit alternativo).
- **Evaluación metodológica de LoRAs**: el repositorio publica una matriz de 9 escenas × pesos 0.4/0.6/0.8/1.0 sobre tres epochs, un caso práctico para quien quiera replicar un protocolo de selección de checkpoint.
- **Localización de documentación para comunidades zh/en**: el repo mantiene README en inglés y `README_zh.md`, útil como plantilla bilingüe para publicar adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la información disponible. El autor sí documenta una evaluación cualitativa propia:

| Ronda | Configuración evaluada | Resultado declarado |
|---|---|---|
| 1 | E6 @ 0.8, retrato frontal y vestido rojo | Muestra publicada en `evaluation/round1_face.jpg` y `round1_red_dress.jpg` |
| 3 | E5 / E6 / E7 × pesos 0.4 / 0.6 / 0.8 / 1.0 en 9 escenas | E6 con mejor equilibrio global a 0.8; E7 cercano |
| Escenas evaluadas | Rostro, tres cuartos, perfil, vestido rojo cuerpo entero, sentada, fondo simple, fondo complejo, sin outfit, sin trigger | Documentadas como imágenes 01–11 en `evaluation/` |

Ajustes de muestreo declarados para las muestras: Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolución 832×1216.

## Requisitos de hardware

- VRAM estimada: el LoRA en sí es ligero (el repo completo son 1,6 GB para 7 checkpoints, aproximadamente 230 MB por fichero), pero requiere cargar el SDXL base completo; en fp16 se necesitan del orden de 8–10 GB de VRAM para generar a 832×1216. Estimación basada en el tamaño del modelo base, no en datos del autor.
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 como mínimo cómodo; RTX 4090 y A100/H100 para lotes grandes o entrenamiento adicional.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más; en 6–8 GB requiere `--medvram`, `--lowvram` o VAE con teselado.
- Opciones de despliegue: `diffusers` (librería declarada), Automatic1111/Forge, ComfyUI, SD.Next e InvokeAI. vLLM, llama.cpp, Ollama y TGI no aplican a un modelo de difusión.
- Latencia y throughput: no disponible; el autor no publica tiempos de inferencia.

## Comparativa con modelos similares

No se dispone de datos verificables de otros LoRAs concretos de Beatrice en la información proporcionada, por lo que la comparación se hace por categoría:

| Criterio | Beatrice-Lora (E6) | LoRA de personaje sobre SDXL 1.0 base | LoRA de personaje sobre Pony Diffusion V6 XL |
|---|---|---|---|
| Parámetros | No disponible (dim 32 / alpha 16) | No disponible | No disponible |
| Contexto / resolución de entrenamiento | Buckets 1024, muestreo a 832×1216 | Habitualmente 1024 | Habitualmente 1024 |
| Dataset | 70 imágenes, 1 outfit, 7 épocas | Variable, no disponible | Variable, no disponible |
| Rendimiento medido | Solo evaluación cualitativa del autor | No disponible | No disponible |
| Licencia | CreativeML OpenRAIL-M | CreativeML OpenRAIL-M | CreativeML OpenRAIL-M |
| Disponibilidad | HuggingFace y ModelScope | HuggingFace | HuggingFace |

Nota: la familia Illustrious y Pony no comparten tokenizador de estilo ni convenciones de prompt, por lo que los LoRAs no son intercambiables entre bases.

## Limitaciones y advertencias

- **Un solo outfit**: el autor confirma que no hay outfit alternativo entrenado; forzar otras ropas depende del prompt y puede degradar la identidad.
- **Pérdida de detalles a baja fuerza**: con pesos bajos puede desaparecer la corona pequeña del personaje; a 0.8 se mantiene según el autor.
- **Fuga del trigger**: la evaluación incluye una escena "sin trigger" (imagen 11), lo que sugiere que parte del personaje puede aparecer sin los tokens; conviene verificar antes de usar el LoRA en composiciones genéricas.
- **Sobreajuste probable**: 70 imágenes con `repeats=2` y 7 épocas es un dataset pequeño; es esperable poca variedad de poses y expresión más allá de lo evaluado.
- **Compatibilidad restringida**: funciona mejor en waiIllustriousSDXL y familia Illustrious; no está validado en SDXL base ni en Pony.
- **Licencia ambigua para uso comercial**: los pesos son CreativeML OpenRAIL-M, que permite uso comercial con restricciones de uso, pero el autor declara explícitamente "non-commercial fan use". Conviene tratar el uso comercial como no autorizado sin aclaración del autor.
- **Derechos de personaje**: Beatrice es propiedad de sus titulares; el propio autor lo marca como derivado no oficial.
- **Diseño infantil estilizado**: el autor advierte de uso responsable; aplican las políticas de contenido de las plataformas de despliegue.
- **Sin benchmarks estándar**: no hay FID ni CLIP score publicados, solo evaluación visual subjetiva del autor.
- **Sesgos**: no documentados; al derivar de un modelo anime, hereda los sesgos de representación del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/Beatrice-Lora
- Dataset en HuggingFace: https://huggingface.co/datasets/abbuibuibui/Beatrice-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/Beatrice-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/Beatrice-Dataset
- README en chino: `./README_zh.md` (incluido en el repositorio)
- Notas de evaluación horizontal: `./evaluation/横向测评记录.md` (incluido en el repositorio)
- Modelo base: waiIllustriousSDXL v17 (no se proporciona enlace en la información disponible)
