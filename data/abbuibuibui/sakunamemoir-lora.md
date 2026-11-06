# abbuibuibui/SakunaMemoir-Lora

## Resumen

SakunaMemoir-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado sobre el checkpoint comunitario waiIllustriousSDXL v17 (variante de la familia Illustrious/NoobAI). Lo desarrolla el usuario abbuibuibui y reproduce a Sakuna Memoir, personaje de la serie *The Vexations of a Shut-In Vampire Princess*. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se carga junto al modelo base para condicionar la generacion de imagenes hacia una identidad y un conjunto de atuendos concretos.

El repositorio incluye siete pesos correspondientes a las epocas E1-E7 del entrenamiento, con una recomendacion explicita de usar E6 a fuerza 0.8 como configuracion por defecto. El entrenamiento se hizo sobre 100 imagenes curadas con captions estructurados que separan identidad y vestuario mediante tokens de disparo dedicados.

Su relevancia es practica: demuestra un flujo de trabajo reproducible de entrenamiento y evaluacion de LoRA de personaje, con evaluacion horizontal publica (matriz de epocas por fuerzas) y dataset abierto. Con 91 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho orientado a la comunidad de generacion de anime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32 / alpha 16) sobre UNet y text encoders de SDXL |
| Parametros totales | no disponible (adaptador de bajo rango; el repo pesa 1.6 GB con las 7 epocas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible (pesos en bf16; el base admite fp16/bf16) |
| Idiomas soportados | en, zh (prompts) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 16 aplicado tanto a la UNet como a los text encoders del modelo base SDXL (waiIllustriousSDXL v17). El entrenamiento uso AdamW8bit en bf16, batch 1, latents cacheadas, atencion sdpa y buckets de 1024 px, sin aumento por volteo ni por color. El dataset son 100 imagenes curadas con sus `.txt` correspondientes, con captions que empiezan por `sakuna_memoir, <outfit>` y `keep_tokens = 2`. La distribucion de atuendos es: Crimson 80, WhiteT 7, Sleep 6, Lounge 4, Swim 3.

El regimen fue de 100 imagenes x repeat 2 x 7 epocas, aproximadamente 1400 pasos de optimizador (con reanudacion a mitad de ejecucion), conservando las epocas formales E1-E7. La innovacion metodologica destacable no esta en la arquitectura sino en el proceso: separacion limpia entre token de identidad (`sakuna_memoir`) y tokens de vestuario (`sakuna_memoir_crimson_lord_uniform`, `sakuna_memoir_white_t_shirt`, `sakuna_memoir_loungewear`, `sakuna_memoir_sleepwear`, `sakuna_memoir_swimsuit`), y una evaluacion comparativa publica de las epocas E5/E6/E7 a cuatro fuerzas (0.4, 0.6, 0.8, 1.0) sobre 10 escenas, con 120 salidas directas.

## Capacidades

- Generacion de imagenes de un personaje concreto (Sakuna Memoir) sobre modelos base de la familia SDXL Illustrious/NoobAI.
- Control de identidad mediante el token `sakuna_memoir` (pelo plateado, pelo corto, ojos azules).
- Control de vestuario independiente mediante cinco tokens de atuendo dedicados.
- Composicion de escenas: retrato frontal, tres cuartos, perfil, cuerpo completo, sentada, fondo simple y escena nocturna compleja.
- Funciona a fuerzas de 0.6 (ya identifica) a 0.8 (equilibrio recomendado); a 1.0 puede sobreexponer el estilo.
- Prompts bilingues (ingles y chino) segun los idiomas declarados.
- No soporta tool calling, agentes, razonamiento multi-paso ni texto: es exclusivamente un adaptador de difusion.

## Casos de uso

- Ilustracion de fan art consistente: cargar E6 a 0.8 sobre waiIllustriousSDXL v17 y generar variaciones del personaje manteniendo identidad estable entre imagenes.
- Creacion de hojas de personaje: usar los tokens de vestuario para producir el mismo personaje con uniforme, camiseta, ropa de estar por casa, pijama y bano en una sola tanda.
- Storyboards y comics amateur: generar escenas nocturnas y planos variados (frontal, tres cuartos, perfil) con el mismo personaje para mantener continuidad visual.
- Prototipado de assets para proyectos derivados: servir como referencia visual antes de encargar ilustraciones definitivas, gracias a la evaluacion publica que documenta el comportamiento por fuerza.
- Experimentacion con entrenamiento de LoRA: el par modelo + dataset abierto permite reproducir el pipeline (rank 32, alpha 16, AdamW8bit, bf16, 1024 buckets) y comparar resultados.
- Benchmarking de checkpoints base: al estar evaluado sobre Illustrious/NoobAI, sirve para comparar como distintos bases reproducen la misma identidad a fuerzas equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (FID, CLIP score, etc.) en la informacion disponible. La evaluacion del autor es cualitativa y comparativa entre epocas y fuerzas:

| Candidato | Resultado observado | Decision |
|---|---|---|
| E5 | Identidad usable; fidelidad de accesorios y uniforme algo mas blanda que E6 | Alternativa |
| E6 | Mayor consistencia de cara, vestuario y escenas nocturnas a 0.6-0.8 | Recomendada por defecto a 0.8 |
| E7 | Cercana a E6; sin ganancia estable a 1.0 | Alternativa archivada |

Ajustes de generacion documentados: Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion 832x1216, sin Hires ni ADetailer.

## Requisitos de hardware

- El adaptador pesa 1.6 GB en total (siete ficheros); el fichero E6 individual es una fraccion de ese tamano.
- Requiere cargar el modelo base SDXL completo (waiIllustriousSDXL v17 o compatible), lo que domina el consumo de VRAM.
- VRAM estimada: aproximadamente 8-10 GB en fp16 para SDXL a 1024 px; viable en GPUs consumer de 8 GB o mas con optimizaciones (fp16, atencion eficiente, offload).
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; A100/H100 para lotes grandes o servicio.
- Despliegue: diffusers (libreria declarada), Automatic1111/Forge, ComfyUI, InvokeAI; tambien via API de difusion en la nube.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SakunaMemoir-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | 832x1216 documentado | creativeml-openrail-m | Hugging Face, ModelScope |
| LoRA de personaje generico en Illustrious | LoRA de personaje | Illustrious / NoobAI | variable | variable por autor | Civitai, Hugging Face |
| Checkpoint SDXL base | Modelo fundacional | SDXL | 1024 px | openrail / community | Hugging Face, Stability |

No se dispone de datos de rendimiento cuantitativos para comparar con alternativas concretas; la comparacion se limita a categoria, base y licencia.

## Limitaciones y advertencias

- Es un derivado no oficial hecho por fans; los derechos del personaje y de la obra original pertenecen a sus titulares.
- Licencia creativeml-openrail-m: permite uso comercial con restricciones (incluye clausulas de uso aceptable y obligaciones de atribucion); revisar el texto completo antes de produccion.
- Riesgo de sobreajuste a fuerza 1.0 (el autor lo describe como "overcook"); usar 0.6-0.8.
- Dependencia estricta del modelo base: resultados distintos o degradados sobre otros checkpoints SDXL.
- Dataset pequeno (100 imagenes) con desbalance fuerte hacia el uniforme Crimson (80 de 100), lo que puede sesgar la representacion de otros atuendos.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de alucinacion visual: anatomias incorrectas, manos defectuosas o fusion de rasgos con otros personajes si no se usa el prompt negativo recomendado.
- Solo prompts en ingles y chino documentados; otros idiomas no estan garantizados.
- Sin garantias de soporte ni mantenimiento; 0 likes y 91 descargas indican adopcion limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/SakunaMemoir-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/SakunaMemoir-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/SakunaMemoir-Lora
- Notas de evaluacion (chino): `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
