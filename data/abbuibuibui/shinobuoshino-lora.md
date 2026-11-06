# abbuibuibui/ShinobuOshino-Lora

## Resumen

ShinobuOshino-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado sobre el checkpoint waiIllustriousSDXL v17 (familia Illustrious). Lo desarrolla el usuario abbuibuibui y reproduce el personaje Shinobu Oshino (忍野忍) de la serie *Monogatari*. No es un modelo de lenguaje: es un adaptador de bajo rango que se carga junto al modelo base para condicionar la generacion de imagenes hacia ese personaje concreto.

El repositorio publica siete checkpoints intermedios correspondientes a las epocas E1-E7 del entrenamiento, con un peso de 456.494.684 bytes por fichero (unos 456 MB) y un total de 3,2 GB en el repositorio. El autor documenta una evaluacion comparativa propia y recomienda el checkpoint E6 a fuerza 0,8 como configuracion por defecto, reservando E5 y E7 como alternativas.

Su relevancia es acotada: se trata de un adaptador de personaje de nicho, sin descargas ni interacciones en el momento de la consulta, orientado a flujos de generacion de imagen anime en ComfyUI o diffusers. Aporta tokens de activacion especificos para identidad y para dos conjuntos de vestuario, lo que facilita la reproducibilidad frente a LoRAs sin documentacion de prompting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de SDXL (modelo base waiIllustriousSDXL v17) |
| Parametros totales | no disponible (rango LoRA 64, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite fp16/bf16 segun el pipeline) |
| Idiomas soportados | en, zh (etiquetas del repositorio; los prompts de imagen admiten otros idiomas segun el text encoder del base) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre el modelo base waiIllustriousSDXL v17, un checkpoint SDXL afinado para ilustracion anime dentro del ecosistema Illustrious. El entrenamiento uso AdamW en bf16, buckets con tope de 1536 y 7 epocas. El dataset consta de 74 pares de imagenes repartidos entre los conjuntos White_Dress y Pink_Sailor_Dress, con repeticiones 2. Las captions se generaron con `keep_tokens = 2`, de modo que el color de pelo y de ojos a menudo se omite en el texto y debe anadirse manualmente en el prompt.

El autor documenta el proceso de seleccion de checkpoint: una primera ronda evaluo E1-E7 a fuerza 0,8 y una tercera ronda cruzo E5, E6 y E7 con 10 escenas y 4 fuerzas (0,4, 0,6, 0,8 y 1,0). El entrenamiento y la evaluacion se realizaron en un NVIDIA DGX Spark con ComfyUI. No se documentan tecnicas adicionales como decodificacion especulativa ni atencion lineal, por tratarse de un adaptador y no de un modelo generativo completo.

## Capacidades

- Generacion de imagenes del personaje Shinobu Oshino sobre el modelo base waiIllustriousSDXL v17.
- Control de identidad mediante el token `shinobu_oshino` (asociado a twintails, pelo rubio y ojos amarillos).
- Control de vestuario mediante los tokens `shinobu_oshino_white_dress` (vestido blanco, sandalias rojas y blancas) y `shinobu_oshino_pink_sailor_dress` (vestido rosa con cuello marinero, brazaletes verdes, zapatos blancos con lazos rojos).
- Soporte de retratos frontales, tres cuartos, perfil, cuerpo completo, poses sentadas y escenas nocturnas, segun la evaluacion publicada.
- Funcionamiento con y sin token de vestuario (el autor incluye una muestra "no outfit token").
- Integracion con ComfyUI y con la libreria diffusers.
- No dispone de tool calling, razonamiento multi-paso, vision, audio ni modo thinking: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de fan art consistente: cargar el LoRA E6 a 0,8 sobre waiIllustriousSDXL v17 y usar el token `shinobu_oshino` para obtener el personaje con rasgos estables (twintails rubios, ojos amarillos) en multiples angulos.
- Series de imagenes para publicaciones o blogs: la evaluacion cubre retrato, tres cuartos, perfil, cuerpo completo y pose sentada, lo que permite generar un conjunto coherente de ilustraciones del mismo personaje.
- Escenas con vestuario alternativo: alternar `shinobu_oshino_white_dress` y `shinobu_oshino_pink_sailor_dress` para producir variantes de vestuario sin reentrenar.
- Integracion en pipelines de diffusers: al publicarse como LoRA en formato safetensors compatible con diffusers, puede cargarse programaticamente en scripts de generacion por lotes.
- Pruebas de comparacion de checkpoints: los siete ficheros E1-E7 permiten reproducir la matriz de evaluacion del autor (fuerzas 0,4 a 1,0) y ajustar el equilibrio entre fidelidad al personaje y libertad creativa.
- Generacion de material de referencia para ilustradores: usar el LoRA como base para bocetos de personaje antes de un retoque manual, dado que el autor documenta resultados sin hires ni ADetailer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. El autor solo aporta una evaluacion cualitativa:

| Candidato | Observacion documentada | Decision |
|---|---|---|
| E5 | Twintails rubios y ojos amarillos usables; orejas puntiagudas aparecen con frecuencia | Alternativa |
| E6 | Retrato nitido, ojos amarillos con anillo, orejas puntiagudas, tirantes del vestido blanco; cuerpo completo con vestido blanco sin mangas y sandalias rojas/blancas; variante sailor rosa con brazaletes verdes y zapatos blancos con lazos | Recomendado a 0,8 |
| E7 | Resultado cercano a E6 | Alternativa final |

Ajustes de muestreo reportados por el autor: ComfyUI, sampler Euler a, 28 pasos, CFG 4,5, CLIP skip 2, resolucion 832x1216, sin hires ni ADetailer.

## Requisitos de hardware

- VRAM estimada: el LoRA anade unos 456 MB de pesos al modelo base; el consumo dominante es el del SDXL completo (tipicamente 8-10 GB en fp16 con offloading, mas segun resolucion y batch).
- GPU recomendadas: NVIDIA DGX Spark (usada por el autor para entrenamiento y evaluacion); para inferencia, cualquier GPU con 12 GB o mas de VRAM en fp16 resulta suficiente para SDXL a 832x1216.
- GPU de consumo: cabe en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) con el modelo base en fp16; en 8 GB requiere cuantizacion del base u offloading.
- Opciones de despliegue: ComfyUI (flujo documentado por el autor), diffusers, Automatic1111/Forge y otros frontends compatibles con LoRA SDXL.
- Latencia y throughput: no disponibles; dependen del modelo base, GPU y pasos de muestreo (28 pasos en la configuracion de referencia).

## Comparativa con modelos similares

No se dispone de informacion sobre LoRAs alternativos de Shinobu Oshino ni de metricas comparativas con otros adaptadores de personaje en la informacion proporcionada.

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShinobuOshino-Lora (E6) | waiIllustriousSDXL v17 | LoRA r64/alpha32 (456 MB por fichero) | no aplica | creativeml-openrail-m | Hugging Face y ModelScope |
| Alternativas de personaje SDXL | no disponible | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje Shinobu Oshino pertenecen a sus titulares originales; el autor lo declara como fan-made.
- La licencia creativeml-openrail-m impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar sus terminos antes de un uso en produccion.
- Las captions omiten con frecuencia el color de pelo y ojos (`keep_tokens = 2`), por lo que es necesario anadirlos en el prompt para evitar derivas de identidad.
- El autor reporta aparicion frecuente de orejas puntiagudas en E5; no se documenta si persiste en E6/E7 en todos los angulos.
- No hay datos de sesgos, tasas de alucinacion visual ni evaluaciones cuantitativas de fidelidad; la seleccion de E6 se basa en una evaluacion cualitativa del propio autor.
- El repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que no existe validacion externa de la calidad.
- Depende estrictamente del modelo base waiIllustriousSDXL v17; su comportamiento con otros checkpoints SDXL o Illustrious no esta documentado.
- No es un modelo de lenguaje: no soporta texto, codigo, matematicas, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/ShinobuOshino-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/ShinobuOshino-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/ShinobuOshino-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/ShinobuOshino-Dataset
