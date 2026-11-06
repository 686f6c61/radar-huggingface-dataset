# abbuibuibui/NeiOokawamura-Lora

## Resumen

Nei Ookawamura (Mato Seihei no Slave) — Illustrious SDXL Character LoRA es un adaptador LoRA de personaje entrenado sobre el modelo base waiIllustriousSDXL v17, un checkpoint SDXL orientado a ilustración anime. Lo desarrolla el usuario abbuibuibui y su función es reproducir de forma consistente el aspecto del personaje Nei Ookawamura (大川村宁) en generaciones de imagen, incluyendo identidad facial, peinado y dos conjuntos de vestuario diferenciados mediante tokens específicos.

El adaptador se publica como un conjunto de siete checkpoints por época (E1–E7) en formato safetensors, cada uno de 456.495.172 bytes, con recomendación explícita del autor de usar E6 a fuerza 0,8. Se distribuye bajo licencia creativeml-openrail-m, con soporte de idioma declarado en inglés y chino, y está pensado para su uso en pipelines de diffusers y en ComfyUI.

Es relevante para desarrolladores e investigadores que trabajen en generación de personajes consistentes, ya que incluye una evaluación comparativa pública (barrido de épocas y fuerzas sobre diez escenas) y un dataset asociado, lo que permite reproducir el proceso y evaluar el compromiso entre fidelidad de identidad y flexibilidad compositiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (modelo base waiIllustriousSDXL v17) |
| Parametros totales | no disponible (rango LoRA 64, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, precision no declarada) |
| Idiomas soportados | en, zh |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (7 ficheros, uno por epoca) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 64 y alpha 32 aplicado sobre el checkpoint SDXL waiIllustriousSDXL v17, un modelo de difusion latente basado en U-Net con codificadores de texto CLIP, orientado a ilustracion anime. No se modifica la arquitectura del modelo base; el adaptador inyecta matrices de bajo rango en las capas del U-Net para especializar la generacion hacia el personaje objetivo.

El entrenamiento se realizo con AdamW en bf16, buckets con tope de 1536, durante 7 epocas, sobre un dataset de 89 pares de imagenes etiquetadas con cuatro variantes de vestuario (Combat_Uniform, Mint_Hoodie, White_Tank_Top, Yellow_T_Shirt) y repeticiones 2. Las captions usaron `keep_tokens = 2` y omiten con frecuencia el color de pelo y ojos, por lo que el autor recomienda anadir esos descriptores en el prompt. El proceso se ejecuto en una NVIDIA DGX Spark con ComfyUI. La evaluacion comparativa se estructuro en dos rondas: una primera criba de E1–E7 a fuerza 0,8 y una matriz de E5–E7 por 10 escenas y 4 fuerzas (0,4 / 0,6 / 0,8 / 1,0).

## Capacidades

- Generacion de imagenes de personaje consistente: reproduce identidad facial, pelo largo rubio, ojos morados y diadema de Nei Ookawamura.
- Control de vestuario mediante tokens dedicados: `nei_ookawamura_combat_uniform` (uniforme de combate) y `nei_ookawamura_mint_hoodie` (sudadera mint).
- Token de identidad independiente (`nei_ookawamura`) que permite generar al personaje sin forzar un outfit concreto.
- Compatibilidad con prompts de estilo anime screencap, incluyendo etiquetas de calidad habituales en el ecosistema Illustrious (`masterpiece`, `best quality`, `very aesthetic`, `absurdres`).
- Funciona en escenas simples, fondos complejos, escenas nocturnas y composiciones de cuerpo entero, tres cuartos y perfil, segun la evaluacion publicada.
- Soporte de integracion en ComfyUI y en pipelines de diffusers.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente: es un modelo generativo de imagen, no un LLM.

## Casos de uso

- Ilustracion de fan art consistente: usar `nei_ookawamura` junto con el token de outfit para generar ilustraciones del personaje en poses y angulos variados manteniendo la identidad, gracias al entrenamiento sobre 89 pares con multiples variantes.
- Creacion de paneles para doujinshi o comic amateur: la evaluacion publicada cubre escenas de cuerpo entero, tres cuartos y perfil, lo que permite encadenar viñetas con continuidad visual del personaje.
- Prototipado de personajes para proyectos derivados: el LoRA sirve como referencia visual rapida antes de encargar ilustraciones definitivas, con la ventaja de que el dataset y la evaluacion son publicos y reproducibles.
- Generacion de variantes de vestuario: alternar entre `nei_ookawamura_combat_uniform` y `nei_ookawamura_mint_hoodie` en el mismo prompt base permite producir sets de imagenes coherentes con distintos atuendos.
- Integracion en flujos ComfyUI para produccion por lotes: el autor documenta ajustes concretos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216) que sirven como configuracion de partida estable para automatizar generaciones.
- Experimentacion en investigacion sobre LoRA de personaje: la publicacion de siete epocas con barrido de fuerzas y diez escenas permite estudiar el efecto de la epoca y la escala de adaptador sobre fidelidad y flexibilidad.
- Base para fine-tuning adicional: al ser un LoRA de rango 64 sobre SDXL, puede combinarse con otros adaptadores o servir de punto de partida para estilos derivados, siempre respetando la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. El autor aporta una evaluacion cualitativa comparativa:

| Candidato | Observacion | Decision |
|---|---|---|
| E5 | Identidad rubia / morada usable | Alternativa |
| E6 | Retrato con flequillo rubio, ojos morados, diadema y uniforme de cuello alto con cadena dorada; cuerpo entero con tunica negra sin mangas, ribete rojo, mangas separadas y botas con lazos rojos | Recomendado a 0,8 |
| E7 | Cercano a E6 | Alternativa final |

## Requisitos de hardware

- El fichero LoRA pesa 456.495.172 bytes (unos 435 MiB) por epoca; el repositorio completo ocupa 3,2 GB.
- Requiere cargar ademas el modelo base waiIllustriousSDXL v17, cuyo peso no se detalla en la informacion disponible.
- VRAM estimada para inferencia: no disponible de forma explicita; al ser SDXL, depende del checkpoint base y de la precision de carga, no solo del LoRA.
- GPU recomendadas: no disponible en la informacion proporcionada. El autor cita entrenamiento en NVIDIA DGX Spark.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende del checkpoint base SDXL y de las optimizaciones aplicadas.
- Opciones de despliegue: ComfyUI (documentado por el autor) y diffusers (libreria declarada en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nei Ookawamura LoRA (este) | LoRA de personaje | waiIllustriousSDXL v17 | rango 64 / alpha 32 | no aplica | creativeml-openrail-m | Hugging Face y ModelScope |
| LoRA de personaje generico sobre SDXL | LoRA de personaje | SDXL | variable | no aplica | variable | ecosistema amplio |
| Checkpoint Illustrious completo | Modelo base | SDXL | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas concretas en la informacion proporcionada, por lo que la comparativa cuantitativa se limita a los datos del propio adaptador.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje pertenecen a sus titulares originales; el autor lo declara explicitamente como fan-made.
- Licencia creativeml-openrail-m: impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar el texto completo antes de cualquier despliegue en produccion.
- Las captions omiten con frecuencia color de pelo y ojos, por lo que es necesario anadir `long blonde hair, purple eyes` en el prompt para evitar desviaciones de identidad.
- La fidelidad esta calibrada para fuerza 0,8; valores fuera de ese rango no estan evaluados de forma concluyente en la informacion disponible.
- Solo se documentan dos outfits principales (combat_uniform y mint_hoodie) en la evaluacion publica, aunque el dataset incluye White_Tank_Top y Yellow_T_Shirt.
- Riesgo de sobreajuste al estilo del modelo base waiIllustriousSDXL v17; no se garantiza el comportamiento con otros checkpoints SDXL.
- Idiomas declarados en y zh: no hay evidencia de soporte para prompts en castellano.
- No hay datos publicados sobre sesgos, tasas de alucinacion visual ni robustez frente a prompts adversarios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/NeiOokawamura-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/NeiOokawamura-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/NeiOokawamura-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/NeiOokawamura-Dataset
