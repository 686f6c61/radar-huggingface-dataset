# abbuibuibui/MoehaFujiwara-Lora

## Resumen

MoehaFujiwara-Lora es un adaptador LoRA de personaje para generación de imágenes con SDXL, publicado por el usuario abbuibuibui y entrenado sobre el checkpoint waiIllustriousSDXL v17, de la familia Illustrious. El adaptador reproduce al personaje que la model card identifica como Moeha Fujiwara y, en la misma ficha, como Maki Shijo (四条真妃) de *Kaguya-sama: Love is War*, mediante dos tokens de activación: `maki_shijo` para la identidad y `maki_casual` para el único conjunto de ropa presente en el entrenamiento.

Técnicamente es un LoRA de rango 32 y alpha 16 aplicado al UNet y a ambos text encoders del modelo base, entrenado con AdamW de 8 bits en bf16 sobre un dataset de solo 17 pares imagen/caption. El repositorio publica nueve pesos correspondientes a dos sesiones de entrenamiento y recomienda R2E5 (`maki_shijo_rE4S582-000005.safetensors`) a fuerza 0.8 como configuración por defecto.

Su relevancia es de nicho: no es un modelo fundacional ni un modelo de lenguaje, sino una pieza dentro del ecosistema de generación de anime con SDXL/Illustrious, pensada para quien necesita consistencia de personaje en fan art y pipelines de difusión. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 1 like, por lo que no existe validación comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet y ambos text encoders de SDXL, familia Illustrious |
| Parametros totales | no disponible (adaptador LoRA; rango 32, alpha 16; el autor no publica recuento de parámetros ni tamaño por archivo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión text-to-image, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos en safetensors (bf16), cargables en fp16/bf16. No hay GGUF, fp8 ni variantes cuantizadas en el repositorio |
| Idiomas soportados | en, zh (declarados en la model card); el text encoder CLIP de SDXL opera en inglés |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (compatible con diffusers) |
| Modelo base | waiIllustriousSDXL-v17 (`waiIllustriousSDXL_v170`) |
| Rango / alpha de LoRA | 32 / 16 |
| Tokens de activación | `maki_shijo` (identidad), `maki_casual` (ropa) |
| Fuerza recomendada | 0.8 (0.6 ya reconocible; 1.0 deforma rostro y accesorios) |
| Dataset de entrenamiento | 17 pares imagen/caption, todos con `maki_casual` (`abbuibuibui/MoehaFujiwara-Dataset`) |
| Tamano del repositorio | 2,1 GB |
| Descargas / likes | 0 / 1 |
| Fecha de publicacion | 2026-09-29 |
| Configuracion de muestreo sugerida | Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832×1216 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 16 insertado tanto en el UNet como en los dos text encoders de SDXL, sobre el checkpoint comunitario waiIllustriousSDXL v17. El entrenamiento se realizó en precisión bf16 con SDPA, buckets de 1024, batch 1 y latents cacheados; no se aplicó aumento por volteo ni por color. El optimizador fue AdamW de 8 bits y la tasa de aprendizaje no aparece en los logs, por lo que la model card declara explícitamente que no la inventa. No se documenta ningún proceso de ajuste por preferencias (RLHF, DPO u similar), algo por otra parte ajeno al entrenamiento habitual de un LoRA de difusión.

El dataset consta de 17 pares imagen/caption curados, con `keep_tokens = 2` y `shuffle_caption = true`, y `num_repeats = 10` en la segunda sesión. Las captions comienzan con `maki_shijo, maki_casual`. Se realizaron dos sesiones que comparten el mismo directorio de salida: la primera (`maki_shijo-*`) y una reanudación desde la época 4, paso 582 (`maki_shijo_rE4S582-*`). El repositorio publica los siguientes pesos:

| Etiqueta | Archivo | Papel |
|---|---|---|
| R1E1 | `maki_shijo-000001.safetensors` | Alternativo (primera sesión) |
| R1E2 | `maki_shijo-000002.safetensors` | Alternativo |
| R1E3 | `maki_shijo-000003.safetensors` | Incluido en la matriz de evaluación; rostro más suave, rubor más marcado |
| R1E4 | `maki_shijo-000004.safetensors` | Mejor de la sesión 1; cuerpo entero más débil y más fuga que R2E5 |
| R1Final | `maki_shijo.safetensors` | Final sin numerar de la sesión 1 (SHA distinto de R1E1–E4) |
| R2E4 | `maki_shijo_rE4S582-000004.safetensors` | Reanudación desde E4, paso 582; perfil y escena nocturna sólidos |
| R2E5 | `maki_shijo_rE4S582-000005.safetensors` | Recomendado por defecto a 0.8 |
| R2E6 | `maki_shijo_rE4S582-000006.safetensors` | Cercano a E5; fija más los adornos de pelo a fuerza alta |
| R2Final | `maki_shijo_rE4S582.safetensors` | Final sin numerar de la reanudación (SHA distinto de R2E6) |

El SHA-256 declarado para R2E5 es `A7850792C5888834566A4D5C629A221218704AAB48D6A46547ED945FF967C61D`. No se publican checkpoints por paso ni directorios de estado del optimizador.

## Capacidades

- Generación text-to-image de un personaje de anime concreto sobre checkpoints SDXL de la familia Illustrious, con identidad controlada por el token `maki_shijo`.
- Reproducción de rasgos descritos en la ficha: pelo rosa claro, ojos azules, dos coletas cortas y lazos verdes.
- Control de vestuario limitado a un único token, `maki_casual`; en la evaluación se probaron atuendos no entrenados (uniforme escolar) sin token específico.
- Consistencia de personaje en distintos ángulos: frontal, tres cuartos y perfil, según la matriz de evaluación publicada.
- Cobertura de cuerpo entero y de escenas simples y nocturnas complejas, con control de fuga de color mediante prompt negativo.
- Compatibilidad con el ecosistema diffusers, por lo que puede combinarse con otros LoRA en el mismo pipeline.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, visión ni audio: es un modelo de difusión y estas capacidades no aplican.
- Capacidades multilingües limitadas a lo declarado (en, zh) en los metadatos; el prompt efectivo se procesa con el text encoder CLIP de SDXL, orientado a inglés.

## Casos de uso

- Fan art consistente de personaje: el adaptador permite generar ilustraciones repetidas del mismo personaje manteniendo rasgos faciales y peinado entre imágenes, algo crítico cuando se producen series de varias piezas con una sola semilla de identidad.
- Producción de doujinshi y cómics amateur: al fijar la identidad con `maki_shijo`, se pueden generar viñetas sucesivas con encuadres distintos (primer plano, plano medio, perfil) y mantener la continuidad visual del personaje.
- Hojas de referencia de personaje: combinando ángulos frontal, tres cuartos y perfil, el LoRA sirve para producir reference sheets orientativas que después se retocan a mano.
- Generación por lotes para redes sociales: integrado en un pipeline de diffusers o una API de ComfyUI/AUTOMATIC1111, permite emitir lotes con la configuración recomendada (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832×1216) para cuentas de fan art.
- Prototipado de key visuals para proyectos derivados: útil para explorar escenas nocturnas y composiciones complejas antes de encargar arte final, ya que la evaluación del autor cubre específicamente escenas nocturnas.
- Composiciones con varios adaptadores: al ser un LoRA estándar sobre SDXL, puede encadenarse con LoRA de estilo para unificar estética en una serie, ajustando pesos para evitar interferencias.
- Estudio de casos sobre datasets pequeños: con 17 imágenes y dos sesiones de entrenamiento, el repositorio es un ejemplo replicable de cómo varía el resultado con el número de épocas y la fuerza de aplicación.
- Demostraciones interactivas en comunidades de fans: el tamaño del adaptador permite cargarlo en entornos con GPU de gama media y ofrecer generación bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score ni métricas automáticas de similitud de personaje. Lo que sí se publica es una evaluación horizontal cualitativa del propio autor: matriz de 10 escenas × fuerzas 0.4 / 0.6 / 0.8 / 1.0 sobre tres candidatos.

| Candidato | Archivo | Resultado declarado |
|---|---|---|
| R1E3 | `maki_shijo-000003.safetensors` | Incluido en la matriz temprana; rostro más suave, rubor más marcado |
| R2E4 | `maki_shijo_rE4S582-000004.safetensors` | Sólido en perfil y escena nocturna |
| R2E5 | `maki_shijo_rE4S582-000005.safetensors` | El más equilibrado en rostro, cuerpo entero casual, noche y control de fuga; recomendado a 0.8 |

Las escenas evaluadas incluyen frontal, tres cuartos, perfil, cuerpo entero casual, uniforme escolar (token no entrenado), sentado, fondo simple, noche compleja, sin palabras de ropa y sin token de activación. Los resultados son imágenes originales sin retoque, sin métricas numéricas asociadas.

## Requisitos de hardware

- El LoRA en sí ocupa una fracción pequeña del repositorio (2,1 GB total, que incluye los nueve adaptadores y las imágenes de showcase y evaluación). El coste real de VRAM lo determina el checkpoint base SDXL.
- Inferencia del modelo base a 832×1216 en fp16: del orden de 8–10 GB de VRAM sin optimizaciones; puede bajar por debajo de 6 GB con offload secuencial o modos de VRAM reducida.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080 y RTX 4090 (24 GB). En GPUs con 8 GB o menos es necesario usar offload o resolución reducida.
- GPU profesionales habituales para lotes: A100, H100, L40S, orientadas a generación por lotes en producción más que a la inferencia individual.
- Opciones de despliegue: diffusers (librería declarada), ComfyUI, AUTOMATIC1111 / Forge, SD.Next y entornos equivalentes compatibles con LoRA SDXL. El autor publica también una réplica en ModelScope.
- Latencia y throughput: no publicados por el autor. Como referencia orientativa no verificada en este repositorio, un SDXL a 832×1216 con Euler a, 28 pasos y CFG 4.5 se sitúa en el orden de pocos segundos por imagen en una RTX 4090 y de decenas de segundos en GPUs de gama media.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de parámetros para una comparación cuantitativa con alternativas. La comparación se limita a características estructurales conocidas.

| Modelo | Tipo | Modelo base | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoehaFujiwara-Lora | LoRA de personaje SDXL | waiIllustriousSDXL v17 | 17 pares imagen/caption | creativeml-openrail-m | HuggingFace y ModelScope |
| emilia-Lora (abbuibuibui) | LoRA de personaje SDXL | no disponible | no disponible | no disponible | HuggingFace |
| Otros LoRA de personaje para Illustrious/SDXL | LoRA de personaje SDXL | familia Illustrious | no disponible | variable (a menudo creativeml-openrail-m) | HuggingFace, Civitai, PixAI |
| waiIllustriousSDXL v17 (checkpoint base, sin LoRA) | Modelo fundacional SDXL | — | no disponible | no disponible | no disponible |

No se dispone de información sobre rangos, tamaños de dataset o resultados comparativos de los modelos alternativos en la información proporcionada, por lo que no se puede establecer una jerarquía de rendimiento.

## Limitaciones y advertencias

- Dataset muy reducido: 17 pares imagen/caption, lo que limita la variedad de poses, encuadres y escenas y favorece el sobreajuste a la composición de las imágenes de entrenamiento.
- Un único token de vestuario (`maki_casual`): cualquier otro atuendo queda fuera de la distribución de entrenamiento, como reconoce la propia evaluación con el uniforme escolar.
- Degradación a fuerza alta: a 1.0 el rostro y los adornos del pelo se deforman, según la model card; el valor recomendado es 0.8.
- Fuga de estilo y color: el prompt negativo sugerido incluye guardas explícitas contra pelo rubio, pelo verde oscuro, ojos verdes y ojos morados, lo que indica que estos rasgos se filtran con cierta frecuencia.
- Rendimiento dependiente del checkpoint base: está entrenado sobre waiIllustriousSDXL v17 y no se garantiza su comportamiento sobre otros checkpoints SDXL o Illustrious.
- Inconsistencia de nomenclatura: el título del repositorio usa "Moeha Fujiwara" mientras que el nombre chino de la ficha (四条真妃) y los tokens de activación (`maki_shijo`) corresponden a Maki Shijo, personajes distintos en la obra original. Conviene verificar qué personaje reproduce realmente antes de usarlo.
- Riesgo de alucinación visual: al ser un modelo de difusión, puede generar anatomía incorrecta (manos, extremidades) y atributos inconsistentes con el personaje; el autor recomienda un prompt negativo extenso para mitigarlo.
- Licencia creativeml-openrail-m: permite uso comercial bajo las condiciones de la licencia (incluir la licencia, respetar las restricciones de uso y compartir derivados bajo los mismos términos), pero no otorga derechos sobre el personaje.
- Derechos de propiedad intelectual: es un derivado hecho por un fan; los derechos sobre el personaje y la obra original pertenecen a Aka Akasaka / Shueisha, lo que supone un riesgo legal para explotación comercial.
- Reproducibilidad limitada: la tasa de aprendizaje no está documentada en los logs de entrenamiento, por lo que no es posible replicar exactamente el entrenamiento a partir de la ficha.
- Sin validación comunitaria: 0 descargas y 1 like en el momento de la consulta; no hay evidencia externa de calidad más allá de la evaluación del propio autor.
- Idiomas: los metadatos declaran en y zh, pero el text encoder CLIP de SDXL no ofrece cobertura multilingüe real; los prompts fuera del inglés pueden degradar el resultado.
- Formato único: solo safetensors en bf16, sin variantes cuantizadas ni GGUF, lo que limita su uso en herramientas de inferencia orientadas a esos formatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/MoehaFujiwara-Lora
- Dataset en HuggingFace: https://huggingface.co/datasets/abbuibuibui/MoehaFujiwara-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/MoehaFujiwara-Lora
- README en chino: `./README_zh.md` (ruta relativa dentro del repositorio)
- Registro de la evaluación horizontal: `./evaluation/横向测评记录.md` (ruta relativa dentro del repositorio)
- Otro LoRA del mismo autor (emilia-Lora): https://huggingface.co/abbuibuibui/emilia-Lora
- Perfil del autor en Civitai: https://civitai.com/user/abbuibuibui/models
- Sitio personal del autor: https://teast1234.github.io/
- Dataset en ModelScope: URL truncada en la model card, no disponible
