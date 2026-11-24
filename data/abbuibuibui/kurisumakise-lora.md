# abbuibuibui/KurisuMakise-Lora

## Resumen

KurisuMakise-Lora es un LoRA de personaje para modelos de difusión SDXL, concretamente entrenado sobre el modelo base waiIllustriousSDXL v17. Lo desarrolla el usuario abbuibuibui y reproduce a Kurisu Makise (牧濑红莉栖), personaje de la visual novel y anime *Steins;Gate*. El repositorio es una colección de tres linajes de pesos: el LoRA original para WAI/Illustrious en la raíz, un LoRA para AutismMix Pony bajo `autism_pony/` y un LoRA para MOSS-Image bajo `moss/`, cada uno con su propio modelo base y sus propios prompts.

El modelo resuelve un problema acotado: la generación consistente y fiel de un personaje concreto en pipelines de imagen SDXL, con tokens de activación dedicados para la identidad y para cada uno de sus atuendos. El autor publica siete épocas (E1–E7), con una evaluación comparativa propia que recomienda la época E6 a una fuerza de 0.8 para el linaje WAI/Illustrious.

La relevancia es práctica: se trata de un LoRA de personaje de tamaño contenido (unos 456 MB por fichero de pesos), con dataset público de 102 pares de imagen y texto, y con documentación de ajustes de muestreo verificados (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolución 832×1216). No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango para generación de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; rango 64 / alpha 32 |
| Parametros totales | no disponible (cada fichero de pesos ocupa 456.494.220 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (metadatos y documentación; los prompts de muestreo son en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (ficheros por época); repositorio en formato diffusers |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 32, entrenado con AdamW en bf16 sobre el modelo base waiIllustriousSDXL v17. El entrenamiento usó buckets con límite de 1536, 7 épocas y un dataset de 102 pares imagen-texto que cubre tres atuendos del personaje, con 3 repeticiones por par. Las captions se generaron con `keep_tokens = 2`, y el autor advierte que el color de pelo y de ojos a menudo se omitió en las captions, por lo que conviene añadirlo explícitamente en el prompt.

La innovación técnica destacable no está en la arquitectura, sino en la metodología de selección de época: el autor realizó una evaluación por rondas. La ronda 1 cribó E1–E7 a fuerza 0.8; la ronda 3 hizo una matriz sobre E5–E7 cruzada con 10 escenas y 4 fuerzas (0.4, 0.6, 0.8 y 1.0). El resultado recomienda E6 a 0.8 para el linaje WAI/Illustrious, por mantener de forma estable el flequillo rojo caoba, los ojos violetas y la bata blanca con corbata roja. El repositorio también incluye dos linajes adicionales entrenados sobre AutismMix Pony y MOSS-Image, con sus propios pesos bajo subdirectorios separados.

## Capacidades

- Generación de imágenes de un personaje concreto (Kurisu Makise) sobre SDXL, con identidad consistente mediante el token `kurisu_makise`.
- Control de atuendo mediante tokens dedicados: `kurisu_makise_lab_coat` (bata blanca y corbata roja), `kurisu_makise_white_shirt_brown_jacket` (camisa blanca y chaqueta marrón) y `kurisu_makise_cream_hooded_coat` (abrigo con capucha color crema).
- Composición de retratos, planos de tres cuartos, perfiles, cuerpo entero, poses sentadas y escenas nocturnas complejas, según la evaluación publicada.
- Funcionamiento con y sin token de atuendo: existe una muestra específica sin token de outfit (`05_no_outfit.png`), lo que indica que el modelo infiere vestimenta cuando no se especifica.
- Compatibilidad con el ecosistema diffusers y con ComfyUI.
- Tres linajes alternativos (WAI/Illustrious, AutismMix Pony y MOSS-Image) que cubren estilos de base distintos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de imagen.

## Casos de uso

- Ilustración de fan art de personaje: usar el token `kurisu_makise` junto con los tokens de atuendo para generar ilustraciones consistentes del personaje en distintas poses y escenarios, apoyándose en la época E6 a fuerza 0.8 como punto de partida verificado.
- Generación de arte para proyectos derivados de *Steins;Gate*: el LoRA permite producir material visual coherente con el diseño del personaje para fan games, fan comics o maquetas de presentación, siempre bajo los términos de la licencia CreativeML OpenRAIL-M.
- Pruebas de pipeline de imagen en ComfyUI: el repositorio documenta ajustes concretos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832×1216) que sirven como configuración de referencia reproducible para validar nodos y flujos de trabajo.
- Comparación de linajes de modelo base: al incluir pesos para WAI/Illustrious, AutismMix Pony y MOSS-Image, permite evaluar cómo un mismo personaje se comporta sobre tres bases SDXL distintas sin reentrenar.
- Creación de datasets de personaje: el dataset público de 102 pares y la metodología de evaluación por épocas y fuerzas sirven de plantilla para entrenar otros LoRA de personaje con criterios de selección documentados.
- Integración en flujos de generación por lotes: al ser un adaptador de 456 MB por fichero, se puede cargar y descargar en pipelines de difusión con requisitos de VRAM moderados, generando variaciones de un personaje a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la información disponible. El autor publica una evaluación cualitativa por rondas con imágenes comparativas:

| Ronda | Candidatos | Condiciones | Resultado |
|---|---|---|---|
| Ronda 1 | E1–E7 | Fuerza 0.8 | Cribado inicial de las siete épocas |
| Ronda 3 | E5, E6, E7 | 10 escenas × fuerzas 0.4 / 0.6 / 0.8 / 1.0 | E6 recomendada a 0.8 |

| Época | Observación del autor | Decisión |
|---|---|---|
| E5 | Pelo largo rojo castaño y ojos violetas usables; bata a menudo presente | Alternativa |
| E6 | Retrato con flequillo rojo caoba, ojos violetas, bata y corbata roja; silueta estable | Recomendada a 0.8 |
| E7 | Muy próxima a E6 | Alternativa final |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al ser un LoRA sobre SDXL, los requisitos son los del modelo base SDXL más el adaptador; el adaptador en sí ocupa 456 MB por fichero.
- GPU recomendadas: no disponible en la información proporcionada. SDXL requiere típicamente GPUs con 8 GB de VRAM o más en cuantizaciones habituales, pero el autor no publica cifras concretas.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: ComfyUI (verificado por el autor, con ajustes Euler a / 28 pasos / CFG 4.5 / CLIP skip 2 / 832×1216) y diffusers (librería declarada del repositorio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre LoRA de personaje alternativos para Kurisu Makise ni de métricas comparativas con otros adaptadores. La comparación interna disponible es entre los tres linajes del propio repositorio:

| Linaje | Modelo base | Pesos | Fuerza recomendada | Ajustes de muestreo |
|---|---|---|---|---|
| WAI/Illustrious | waiIllustriousSDXL v17 | Raíz del repo | 0.8 (E6) | Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832×1216 |
| AutismMix Pony | AutismMix Pony | `autism_pony/` | 1.0 (E6) | Euler a, 24 pasos, CFG 6, CLIP skip 2, 832×1216 |
| MOSS-Image | MOSS-Image | `moss/` | no disponible | no disponible |

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje pertenecen a sus titulares originales, y el autor lo declara explícitamente como fan-made.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso: incluye cláusulas de uso aceptable que prohíben determinadas aplicaciones (contenido ilegal, daño, desinformación) y exige que los usos derivados mantengan las mismas restricciones. Conviene revisar el texto completo antes de un uso comercial.
- No se deben mezclar linajes: los pesos de WAI/Illustrious, AutismMix Pony y MOSS-Image requieren modelos base, prompts y negativos distintos; mezclarlos produce resultados incorrectos.
- Las captions omitieron con frecuencia el color de pelo y de ojos, por lo que el prompt debe añadir explícitamente "long straight chestnut-red hair, violet eyes" (o "long dark red hair, bangs, violet eyes" en el linaje AutismMix) para evitar derivas de identidad.
- El autor solo verificó cualitativamente siete imágenes del linaje AutismMix Pony y advierte que son muestras de showcase, no una evaluación completa.
- Riesgo de sobreajuste al estilo del modelo base: los resultados dependen fuertemente de waiIllustriousSDXL v17 y de sus ajustes de muestreo; otros checkpoints SDXL pueden degradar la fidelidad del personaje.
- No hay métricas cuantitativas publicadas de fidelidad de personaje, por lo que la selección de época se basa en juicio visual del autor.
- El repositorio ocupa 7.9 GB, lo que incluye los tres linajes y las imágenes de evaluación; el peso útil por adaptador es de 456 MB.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/KurisuMakise-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/KurisuMakise-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/KurisuMakise-Lora
- Notas de evaluación en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `README_zh.md` (dentro del repositorio)
