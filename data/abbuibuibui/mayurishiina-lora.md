# abbuibuibui/MayuriShiina-Lora

## Resumen

MayuriShiina-Lora es un LoRA de personaje para modelos de difusión de imagen, concretamente para la familia SDXL, que reproduce a Mayuri Shiina (椎名真由理), personaje del anime y novela visual *Steins;Gate*. Lo publica el usuario abbuibuibui como derivado no oficial y fan-made, y su propósito es permitir que un pipeline de generación texto-a-imagen produzca de forma consistente el rostro, el pelo y los atuendos característicos del personaje sin necesidad de describirlos en cada prompt. El repositorio contiene tres linajes de pesos entrenados sobre bases distintas: el linaje principal sobre waiIllustriousSDXL v17, un segundo sobre AutismMix Pony y un tercero sobre MOSS-Image.

El LoRA principal se entrenó con rango 64 y alpha 32, en precisión bf16 con AdamW, durante 7 épocas sobre un dataset de 62 pares imagen-texto que cubren 4 atuendos. El autor recomienda el checkpoint de la época 6 (E6) a una fuerza de 0.8, tras una evaluación comparativa propia que incluye una matriz de E5, E6 y E7 por diez escenas y cuatro intensidades. Es relevante para quien genere ilustración anime con SDXL y quiera un personaje secundario consistente, aunque su alcance es muy específico y su valoración pública es todavía escasa (290 descargas y ningún "like" en el momento de la consulta).

No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que debe cargarse junto al checkpoint base correspondiente. Mezclar los pesos de un linaje con la base o los prompts de otro produce resultados degradados, y el autor lo advierte explícitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de SDXL; rango 64, alpha 32 |
| Parametros totales | no disponible (cada archivo pesa 456.494.396 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de texto) |
| Tipos de cuantizacion | no disponible; pesos en bf16 durante el entrenamiento |
| Idiomas soportados | en, zh (etiquetas del prompt; el modelo no procesa lenguaje natural libre) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre la UNet de SDXL con rango 64 y alpha 32, en bf16 con el optimizador AdamW y buckets de resolución con tope de 1536 píxeles. El dataset consta de 62 pares imagen-texto con 4 atuendos distintos y se repite 3 veces por época, con un total de 7 épocas. Las captions se generaron con `keep_tokens = 2`, de modo que el color de pelo y de ojos a menudo se omite y conviene añadirlo manualmente en la inferencia. El linaje principal parte de waiIllustriousSDXL v17; los otros dos linajes se entrenaron sobre AutismMix Pony y MOSS-Image y viven en subdirectorios separados del repositorio.

La innovación técnica relevante no está en la arquitectura, sino en el proceso de selección de checkpoint: el autor documenta una primera ronda que criba E1 a E7 a fuerza 0.8 y una tercera ronda que cruza E5, E6 y E7 con diez escenas y cuatro intensidades (0.4, 0.6, 0.8 y 1.0). De ahí sale la recomendación de E6 a 0.8 para el linaje WAI y de E6 a 1.0 para el linaje Pony. El repositorio incluye hashes SHA-256 de los checkpoints recomendados para verificación de integridad.

## Capacidades

- Generación de ilustración anime del personaje Mayuri Shiina sobre checkpoints SDXL compatibles con el linaje correspondiente.
- Control de identidad mediante el token `mayuri_shiina`, que activa pelo corto negro y ojos azules en el linaje WAI.
- Control de atuendo mediante tokens específicos: `mayuri_shiina_blue_dress` (vestido azul con cofia blanca), `mayuri_shiina_white_blouse_green_skirt` (blusa blanca y falda verde), `mayuri_shiina_brown_coat_pink_scarf` y `mayuri_shiina_white_winterwear_pink_scarf`.
- Composición de escenas: retrato frontal, tres cuartos, perfil, cuerpo completo, sentada, fondo simple y fondo nocturno complejo, según la evaluación publicada por el autor.
- Funciona sin token de atuendo, generando al personaje con vestimenta genérica, lo que permite libertad de diseño.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo: es un adaptador de imagen.
- El soporte multilingüe se limita a que las etiquetas de la model card están en inglés y chino; los prompts de difusión funcionan mejor en inglés.

## Casos de uso

- Ilustración de fan art consistente: cargar el LoRA E6 a 0.8 sobre waiIllustriousSDXL v17 y generar retratos del personaje con el token de identidad y el de atuendo, manteniendo el mismo rostro entre imágenes de una serie.
- Creación de hojas de personaje para proyectos derivados: usar los cuatro tokens de atuendo entrenados para producir un conjunto de vistas (frontal, tres cuartos, perfil) del mismo personaje con vestuario distinto, útil como referencia para un artista o para un pipeline de animación.
- Prototipado de escenas para cómic o novela visual: combinar el LoRA con prompts de fondo nocturno o callejera para generar viñetas de ambiente *Steins;Gate* sin describir el personaje en cada prompt.
- Pruebas de pipelines de difusión: sirve como caso de estudio de un LoRA de personaje con tres linajes de base distintos, útil para evaluar cómo afecta la base (Illustrious, Pony, MOSS) a la fidelidad del personaje con el mismo dataset.
- Generación de material promocional para comunidades de fans: producir imágenes de difusión en redes con el checkpoint recomendado y la configuración documentada (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832×1216).
- Integración en ComfyUI para flujos de trabajo con *hires fix* o ADetailer: el LoRA se ha validado sin estas etapas, pero su naturaleza de adaptador estándar permite encadenarlo con nodos de upscaling y de detalle facial en producciones más elaboradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la información disponible. El autor aporta únicamente una evaluación cualitativa comparativa entre épocas y fuerzas:

| Candidato | Observación | Decisión |
|---|---|---|
| E5 | Pelo corto negro y ojos azules usables; el vestido azul aparece a menudo | Alternativa |
| E6 | Retrato estable: pelo corto negro, ojos azules, vestido azul con cofia | Recomendado a 0.8 |
| E7 | Muy próximo a E6 | Alternativa final |

Configuración de referencia del linaje WAI: E6 a 0.8, ComfyUI, sampler Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolución 832×1216, sin hires ni ADetailer. Configuración del linaje Pony: E6 a 1.0, 24 pasos, CFG 6, CLIP skip 2, misma resolución.

## Requisitos de hardware

- VRAM estimada: el adaptador pesa unos 456 MB por checkpoint, pero requiere cargar la UNet completa de SDXL en bf16 o fp16, lo que sitúa el consumo total en torno a 8-10 GB en inferencia estándar y más si se añaden etapas de upscaling.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para producción; RTX 3060 de 12 GB o superior para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB de VRAM si se usa fp16 y resolución moderada; con cuantización de la base a fp8 o GGUF se puede reducir más.
- Opciones de despliegue: ComfyUI (configuración validada por el autor), Automatic1111/Forge, Diffusers con `load_lora_weights`, y pipelines de SDXL con soporte de LoRA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MayuriShiina-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17, AutismMix Pony, MOSS-Image | 832×1216 en la evaluación | creativeml-openrail-m | Hugging Face, ModelScope |
| LoRA de personaje SDXL genérico | LoRA de personaje | SDXL 1.0 | hasta 1024×1024 nativo | variable según autor | Hugging Face, Civitai |
| Checkpoint Illustrious completo | Modelo base | SDXL afinado | hasta 1536 con buckets | variable | Hugging Face, Civitai |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que la comparación se limita a tipo, base y licencia.

## Limitaciones y advertencias

- Es un derivado fan-made no oficial: los derechos del personaje siguen siendo de sus titulares y el autor lo declara explícitamente.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibición de usos dañinos, difamatorios o ilegales) y exige revisar sus cláusulas antes de un uso comercial; no es una licencia permisiva sin condiciones.
- Riesgo de mezclar linajes: usar pesos del subdirectorio `autism_pony/` con la base WAI o viceversa degrada el resultado; el autor advierte de no mezclar bases, prompts ni negativos.
- Sesgo de dataset: 62 pares y 4 atuendos es un conjunto muy pequeño, lo que limita la variedad de poses, expresiones y ángulos; el propio autor documenta escenas concretas en su evaluación, no una cobertura general.
- El color de pelo y de ojos se omitió en muchas captions, por lo que hay que añadirlo manualmente al prompt para evitar derivas.
- Riesgo de sobreajuste al estilo de la base: la apariencia final depende fuertemente de waiIllustriousSDXL v17, AutismMix Pony o MOSS-Image, no solo del LoRA.
- Sin validación externa: cero "like" y 290 descargas en el momento de la consulta; no hay evaluación independiente de fidelidad al personaje.
- No apto para tareas de texto, razonamiento, código ni agentes: es exclusivamente un adaptador de imagen.
- El repositorio ocupa 7,9 GB por incluir los tres linajes y las imágenes de evaluación; conviene descargar solo el checkpoint necesario.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/MayuriShiina-Lora
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/MayuriShiina-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/MayuriShiina-Dataset
- Notas de evaluación en chino: `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
