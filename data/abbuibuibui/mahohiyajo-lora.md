# abbuibuibui/MahoHiyajo-Lora

## Resumen

MahoHiyajo-Lora es un LoRA de personaje para Stable Diffusion XL (SDXL), concretamente para la variante Illustrious, que reproduce a Maho Hiyajo (比屋定真帆), personaje de la franquicia *Steins;Gate*. Lo desarrolla el usuario abbuibuibui y se distribuye como derivado no oficial; los derechos del personaje siguen perteneciendo a sus titulares originales. El modelo base declarado es waiIllustriousSDXL v17, sobre el que se ha entrenado un adaptador de rango 64.

El repositorio contiene siete checkpoints correspondientes a las siete epocas de entrenamiento (E1-E7), cada uno de 456.494.348 bytes, y el autor recomienda E6 con una fuerza de 0.8 como configuración por defecto tras una evaluacion comparativa propia. El dataset de entrenamiento es publico (abbuibuibui/MahoHiyajo-Dataset) y consta de 100 pares de imagenes con tres conjuntos de vestuario.

Es relevante para quien genere imagenes de fan art o material derivado de *Steins;Gate* con pipelines SDXL/Illustrious y necesite consistencia de personaje mediante tokens de activacion especificos. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de difusion de ~3,2 GB de repositorio, con licencia CreativeML OpenRAIL-M y soporte declarado de prompts en ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (variante Illustrious); red neuronal de difusion latente |
| Parametros totales | no disponible (adaptador LoRA de rango 64, alpha 32; cada checkpoint pesa 456.494.348 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusion; la ventana practica la fija el limite de tokens del text encoder de SDXL) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors bf16/fp16 segun el entrenamiento (AdamW bf16) |
| Idiomas soportados | en, zh |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (un fichero por epoca: `maho_hiyajo-000001` a `000006` y `maho_hiyajo.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 32 aplicado sobre el modelo de difusion SDXL en su variante Illustrious (waiIllustriousSDXL v17). El entrenamiento uso el optimizador AdamW en precision bf16, con buckets de resolucion con tope de 1536 y siete epocas completas. El dataset consta de 100 pares imagen-texto con tres conjuntos de vestuario, con repeticiones 3 y `keep_tokens = 2` en las captions. Los tokens de activacion entrenados son `maho_hiyajo` (identidad), `maho_hiyajo_lab_coat` (vestuario principal), `maho_hiyajo_green_hooded_coat` (vestuario alternativo) y `maho_hiyajo_white_green_trim_top`.

Las captions omiten con frecuencia el color de pelo y de ojos, por lo que el autor recomienda anadirlos explicitamente en el prompt (short hair, brown hair, brown eyes). La evaluacion publicada por el autor incluye una primera ronda de cribado de E1-E7 a fuerza 0.8 y una tercera ronda en matriz sobre E5, E6 y E7 con diez escenas y cuatro fuerzas (0.4, 0.6, 0.8 y 1.0). El resultado es la recomendacion de E6 a 0.8 como configuracion estable de silueta y vestuario.

## Capacidades

- Generacion de imagenes de personaje consistente: reproduce el rostro y la silueta de Maho Hiyajo en distintos angulos (frontal, tres cuartos, perfil) y planos (retrato, cuerpo completo, sentada).
- Control de vestuario mediante tokens dedicados: bata de laboratorio con top verde (`maho_hiyajo_lab_coat`), abrigo verde con capucha (`maho_hiyajo_green_hooded_coat`) y top blanco con ribete verde (`maho_hiyajo_white_green_trim_top`).
- Integracion en pipelines de difusion estandar: funciona como LoRA en ComfyUI, Automatic1111 y otros frontends compatibles con SDXL/Illustrious, con la sintaxis `<lora:nombre:peso>`.
- Ajuste de intensidad del personaje: la fuerza del LoRA es un parametro continuo; el autor documenta comportamiento estable en el rango 0.4-1.0 y recomienda 0.8.
- Soporte de prompts en ingles y chino, segun los idiomas declarados en la model card.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o video: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Fan art de *Steins;Gate*: generar ilustraciones de Maho Hiyajo en poses y escenarios variados manteniendo consistencia facial y de vestuario mediante los tokens de activacion, con el checkpoint E6 a fuerza 0.8 como punto de partida.
- Creacion de hojas de personaje: producir vistas frontal, de tres cuartos y de perfil del personaje con el mismo seed y prompt base para documentar disenos o servir de referencia a otros artistas.
- Ilustracion de ficcion derivada: escenas nocturnas en calle o fondos complejos, ya que la evaluacion del autor incluye explicitamente escenas con fondo complejo y nocturno.
- Prototipado rapido de composiciones: usar el LoRA a fuerza baja (0.4-0.6) para mezclar el personaje con el estilo del modelo base sin que domine la composicion.
- Generacion de variantes de vestuario: el token de identidad funciona sin token de vestuario (documentado en la evaluacion como "no outfit"), lo que permite describir ropa nueva en el prompt y mantener el rostro.
- Material para proyectos de traduccion o divulgacion sobre *Steins;Gate*: ilustraciones de acompanamiento para articulos o videos, siempre respetando las restricciones de la licencia OpenRAIL-M y los derechos del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluacion incluida es cualitativa (comparativa visual entre epocas y fuerzas), no cuantitativa, y no reporta metricas como FID, CLIP score ni similitud facial.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este LoRA; depende del modelo base waiIllustriousSDXL v17. Como referencia general de SDXL, la inferencia en fp16 requiere del orden de 8-12 GB de VRAM, y menos con cuantizacion o con offloading.
- GPU recomendadas: no disponibles en la informacion proporcionada. Cualquier GPU capaz de ejecutar SDXL (por ejemplo, RTX 3060 12 GB en adelante, o GPUs de datacenter como A100/H100) puede cargar el LoRA, ya que el adaptador anade una sobrecarga minima.
- Cabe en GPU de consumo: si, siempre que la GPU pueda ejecutar el modelo base SDXL/Illustrious; el LoRA en si pesa 456 MB por checkpoint.
- Opciones de despliegue: ComfyUI (configuracion usada por el autor: Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216, sin hires ni ADetailer), Automatic1111 y otros frontends diffusers compatibles con SDXL.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MahoHiyajo-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | rango 64, alpha 32 | no aplica | creativeml-openrail-m | HuggingFace, ModelScope |
| LoRA de personaje SDXL generico | LoRA de personaje | SDXL 1.0 | variable | no aplica | variable (frecuentemente OpenRAIL-M) | HuggingFace, Civitai |
| Modelo base waiIllustriousSDXL v17 | Modelo completo | SDXL | no disponible | no aplica | no disponible | no disponible |
| SDXL 1.0 (Stability AI) | Modelo completo | - | ~2.600 M (UNet) + text encoders | no aplica | CreativeML OpenRAIL++-M | HuggingFace |

La comparacion con otros LoRA de personaje no puede hacerse con datos cuantitativos porque no se han publicado metricas. La diferencia practica frente a un LoRA generico es la disponibilidad de checkpoints por epoca, tokens de vestuario documentados y una evaluacion visual publica con parametros reproducibles.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos de Maho Hiyajo y de *Steins;Gate* pertenecen a sus titulares; el autor lo declara explicitamente como fan-made.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibicion de usos daninos descritos en el anexo de la licencia) y obliga a propagar las mismas restricciones en obras derivadas; conviene revisar el texto completo antes de uso comercial.
- Riesgo de sobreajuste o de deriva de identidad fuera de la fuerza recomendada: el autor solo valida el rango 0.4-1.0 y recomienda 0.8; a fuerzas altas puede degradar la composicion o el estilo del modelo base.
- Las captions omiten con frecuencia color de pelo y ojos, por lo que sin especificarlos en el prompt el resultado puede desviarse del canon del personaje.
- Cobertura limitada a tres conjuntos de vestuario y 100 pares de imagenes; vestuarios no vistos pueden producir resultados inconsistentes.
- No hay datos publicados sobre sesgos, tasas de alucinacion visual (artefactos anatomicos) ni evaluacion cuantitativa; la evaluacion es unicamente cualitativa y realizada por el autor.
- El modelo solo procesa prompts en ingles y chino segun la model card; el rendimiento con prompts en castellano no esta documentado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/abbuibuibui/MahoHiyajo-Lora
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/MahoHiyajo-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/MahoHiyajo-Dataset
- Notas de evaluacion (chino): `evaluation/横向测评记录.md` dentro del repositorio de HuggingFace
