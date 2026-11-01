# abbuibuibui/AoiHinami-Lora

## Resumen

AoiHinami-Lora es un LoRA de personaje para modelos de difusión SDXL, concretamente entrenado sobre el checkpoint comunitario waiIllustriousSDXL v17, que reproduce a Aoi Hinami (日南葵), personaje de la serie *Bottom-tier Character Tomozaki*. Lo publica el usuario abbuibuibui en HuggingFace como derivado no oficial, e incluye los pesos de las siete épocas de entrenamiento (E1–E7) en formato safetensors, con recomendación explícita de usar E6 a fuerza 0.8.

El modelo resuelve un problema acotado: la generación consistente de un personaje de anime concreto con atuendos escolares definidos (blazer navy con corbata roja, uniforme de verano con falda de cuadros azul) y rasgos faciales estables (pelo castaño ondulado, a menudo medio recogido, ojos marrones, lunar bajo un ojo). No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se carga sobre un UNet SDXL ya entrenado.

Es relevante para quien construya pipelines de generación de imágenes de personajes en ComfyUI o diffusers y necesite un adaptador ligero (unos 456 MB por época) con tokens de activación documentados y una evaluación comparativa pública entre épocas. El repo ocupa 3,2 GB por acumular los siete safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de SDXL (modelo base waiIllustriousSDXL v17) |
| Parametros totales | no disponible (peso por fichero: 456.496.972 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión) |
| Tipos de cuantizacion | no disponible; pesos en safetensors de precisión nativa del entrenamiento |
| Idiomas soportados | en, zh (etiquetas de la model card) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango bajo inyectado en las capas de atención del UNet de SDXL. El modelo base es waiIllustriousSDXL v17, un merge comunitario de la familia Illustrious, orientado a ilustración anime. El entrenamiento se realizó sobre el dataset público abbuibuibui/AoiHinami-Dataset, con captions que usan `keep_tokens = 2` y conservan el nombre del personaje y el token de atuendo; según la model card, los colores de pelo y ojos suelen omitirse en las captions porque el modelo los aprende por identidad.

Se publican siete checkpoints correspondientes a otras tantas épocas. El autor realizó una evaluación horizontal con matriz de 10 escenas por 4 fuerzas sobre E5, E6 y E7, y seleccionó E6 como predeterminado a fuerza 0.8. No se documentan en la información disponible el número de pasos, el learning rate, el tamaño del dataset ni la composición exacta de las imágenes de entrenamiento.

## Capacidades

- Generación de retratos y cuerpos completos del personaje Aoi Hinami con identidad estable (pelo castaño ondulado, ojos marrones, lunar bajo un ojo).
- Control de atuendo mediante tokens dedicados: `aoi_hinami_blazer_uniform`, `aoi_hinami_summer_uniform`, `aoi_hinami_green_jacket`, `aoi_hinami_sports_t_shirt`, `aoi_hinami_yellow_t_shirt`, `aoi_hinami_yukata`.
- Composición de escenas complejas: la model card documenta resultados correctos en escena nocturna callejera a fuerza 0.8.
- Fallback a ropa casual (gabardina beige, camisa blanca, pantalón oscuro) cuando se omite el token de atuendo.
- Integración con el ecosistema SDXL: funciona en ComfyUI y en diffusers, y es compatible con merges de Illustrious y NoobAI.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es exclusivamente un adaptador de generación de imágenes.

## Casos de uso

- Ilustración de fan art de personaje: cargar E6 a 0.8 sobre waiIllustriousSDXL v17 y generar retratos o cuerpos completos con el prompt de ejemplo de la model card, útil para creadores que necesiten consistencia de identidad entre imágenes.
- Producción de viñetas o storyboards de doujinshi: al mantener el mismo token de identidad y atuendo entre prompts, se obtiene coherencia visual entre paneles sin reentrenar nada.
- Generación de variantes de vestuario: los tokens de uniforme de invierno, verano, chándal, camiseta o yukata permiten ilustrar al personaje en distintos contextos con un solo adaptador.
- Pruebas comparativas de LoRAs de personaje: el repo incluye matrices de evaluación públicas (épocas en columnas, fuerzas en filas), lo que sirve como referencia metodológica para quien evalúe adaptadores propios.
- Integración en pipelines de ComfyUI con parámetros fijos: Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y resolución 832×1216 están documentados y reproducen los resultados de la model card.
- Prototipado rápido en diffusers: al ser safetensors compatible con la librería, se puede cargar mediante `load_lora_weights` en scripts de Python para generar lotes de imágenes de personaje en servidores con GPU.
- Escenas nocturnas o de exterior: la evaluación documenta un resultado correcto de cuerpo completo caminando bajo farolas a fuerza 0.8, útil para ilustraciones ambientadas fuera del entorno escolar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la información disponible. La model card incluye únicamente una evaluación cualitativa comparativa entre épocas:

| Candidato | Resultado observado | Decisión |
|---|---|---|
| E1–E4 | Color de identidad ya castaño/castaño; el uniforme a cuerpo completo se asienta más tarde | Alternativas tempranas/medias |
| E5 | Blazer completo correcto con manos a la espalda; uniforme de verano sobre el hombro con pequeño lazo azul en el pelo | Alternativa de matriz |
| E6 | Retrato con rostro sereno y lunar más visible; silueta de blazer igual a E5; uniforme de verano a 0.8 mantiene camisa blanca de manga corta y falda azul; escena nocturna estable | Recomendado a 0.8 |
| E7 | Rostro y blazer casi idénticos a E6; sin ganancia clara sobre E6 a 0.8 | Alternativa de época final |

## Requisitos de hardware

- El adaptador pesa 456 MB por época; el repo completo ocupa 3,2 GB.
- Requiere cargar además el modelo base SDXL (waiIllustriousSDXL v17), que en fp16 ocupa del orden de 6,5 GB de VRAM solo para los pesos del UNet y el VAE; el consumo real depende de la resolución y del pipeline.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM para inferencia a 832×1216 en fp16; el autor generó las evaluaciones en una DGX con ComfyUI.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, entre otras, siempre que se disponga de al menos 8 GB de VRAM para el conjunto base + LoRA.
- Opciones de despliegue: ComfyUI (configuración documentada por el autor) y diffusers en Python. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AoiHinami-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | 456 MB por época | creativeml-openrail-m | HuggingFace, 58 descargas |
| LoRAs de personaje en Civitai | LoRA de personaje | SDXL / Illustrious / Pony | variable | variable según autor | Civitai |
| LoRAs de personaje en HuggingFace | LoRA de personaje | SDXL / Illustrious | variable | variable | HuggingFace |

No se dispone en la información proporcionada de datos concretos de modelos alternativos comparables (parámetros, contexto, benchmarks) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje y de la obra original pertenecen a sus titulares; la model card lo declara explícitamente como fan-made.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibición de usos dañinos o ilegales descritos en la licencia) y exige revisar sus términos antes de cualquier uso comercial.
- El modelo base waiIllustriousSDXL v17 es un merge comunitario con su propia licencia; el uso comercial del LoRA queda condicionado también por la del base.
- Riesgo de deriva de identidad a fuerzas altas: a 1.0 la falda del uniforme de verano puede virar a un cuadro más rojizo y la camisa puede alargar las mangas; se recomienda 0.6–0.8.
- Sin el token de nombre, a fuerzas medias el rostro y el pelo del personaje siguen filtrándose en las generaciones, lo que puede contaminar prompts no relacionados.
- El lunar bajo el ojo y el peinado medio recogido no siempre aparecen de forma espontánea; deben escribirse explícitamente en el prompt si se quieren fijar.
- Solo se documentan prompts en inglés y notas en chino; no hay evidencia de soporte para prompts en castellano.
- No se documentan sesgos, tasas de alucinación ni métricas de calidad cuantitativas; la evaluación es cualitativa y realizada por el propio autor.
- El repo acumula siete épocas (3,2 GB) cuando solo se recomienda E6; conviene descargar únicamente el fichero necesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/AoiHinami-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/AoiHinami-Dataset
- Notas de evaluación en chino: https://huggingface.co/abbuibuibui/AoiHinami-Lora/blob/main/evaluation/横向测评记录.md
- README en chino: https://huggingface.co/abbuibuibui/AoiHinami-Lora/blob/main/README_zh.md
