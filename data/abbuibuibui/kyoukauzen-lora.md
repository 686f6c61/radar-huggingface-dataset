# abbuibuibui/KyoukaUzen-Lora

## Resumen

KyoukaUzen-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado por el usuario abbuibuibui sobre el checkpoint waiIllustriousSDXL v17. Representa a Kyouka Uzen (羽前京香), personaje de la serie *Mato Seihei no Slave*, y su proposito es fijar la identidad visual del personaje (rostro, peinado, ojos y vestuario) en la generacion de imagenes anime con la familia Illustrious de SDXL. No es un modelo de lenguaje: es un adaptador de bajo rango que se carga junto al checkpoint base mediante la libreria diffusers o dentro de ComfyUI.

El repositorio contiene siete checkpoints de entrenamiento (E1-E7), cada uno de 456.493.996 bytes (unos 456 MB), con un total de 3,2 GB en el repo. El autor publica una evaluacion comparativa propia y recomienda el epoch E6 a intensidad 0,8 como valor por defecto. El LoRA se entrena con rango 64 y alpha 32 sobre un dataset de 87 pares de imagenes etiquetadas con tres variantes de vestuario.

Es relevante ahora porque el ecosistema Illustrious concentra buena parte de la generacion anime basada en SDXL, y los LoRA de personaje son la via estandar para incorporar identidades concretas sin reentrenar el modelo base. La ficha documenta tanto las capacidades reales del adaptador como sus limitaciones de licencia y de fidelidad visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL, familia Illustrious |
| Parametros totales | no disponible (rango 64, alpha 32; cada checkpoint pesa 456.493.996 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors de precision completa) |
| Idiomas soportados | en, zh (etiquetas y documentacion; los prompts de difusion funcionan en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |
| Modelo base | waiIllustriousSDXL v17 |
| Epochs publicados | E1-E7 (E1-E4 tempranos, E5 candidato matricial, E6 recomendado, E7 final) |
| Tamano del repo | 3,2 GB |
| Dataset de entrenamiento | abbuibuibui/KyoukaUzen-Dataset, 87 pares, repeats 2 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 32 aplicado sobre el checkpoint SDXL waiIllustriousSDXL v17. Se entreno con AdamW en bf16, buckets con limite de 1536 y 7 epochs. El dataset consta de 87 pares de imagenes organizadas en tres categorias de vestuario: Combat_Uniform, White_Blouse y Navy_Sweater, con dos repeticiones por imagen. Las captions se generaron con `keep_tokens = 2`, lo que deja los dos primeros tokens fijos (presumiblemente los tokens de identidad y de vestuario) y permite que el resto del texto actue como modificador.

El entrenamiento y la evaluacion se realizaron en un NVIDIA DGX Spark con ComfyUI. El autor documenta una evaluacion en tres rondas: la primera criba E1-E7 a intensidad 0,8; la tercera construye una matriz E5-E7 por 10 escenas por 4 intensidades (0,4, 0,6, 0,8 y 1,0). No se documentan tecnicas adicionales como decodificacion especulativa ni atencion lineal, ya que no aplican a un adaptador de difusion.

## Capacidades

- Generacion de imagenes anime del personaje Kyouka Uzen sobre el checkpoint base waiIllustriousSDXL v17.
- Control de identidad mediante el token `kyouka_uzen` (pelo negro corto, ojos rojos).
- Control de vestuario mediante tokens dedicados: `kyouka_uzen_combat_uniform` (uniforme de combate con charreteras doradas, ribete rojo, falda corta y botas a media pantorrilla) y `kyouka_uzen_white_blouse` (variante de blusa blanca).
- Soporte de composicion multi-turno y multi-escena: retrato frontal, tres cuartos, perfil, cuerpo completo, sentado, fondo simple, escena nocturna compleja.
- Funciona con prompts en ingles; la documentacion esta disponible en ingles y chino.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video: es exclusivamente un modelo de sintesis de imagen.

## Casos de uso

- Ilustracion de fan art consistente: usar E6 a 0,8 con el token `kyouka_uzen` para mantener el rostro del personaje entre distintas ilustraciones y encargos, evitando la deriva de identidad que aparece al describir el personaje solo con texto.
- Generacion de variantes de vestuario: alternar `kyouka_uzen_combat_uniform` y `kyouka_uzen_white_blouse` para producir sets de imagenes del mismo personaje en contextos distintos sin reentrenar.
- Creacion de hojas de personaje para proyectos derivados: la evaluacion publicada cubre retrato, tres cuartos, perfil y cuerpo completo, lo que permite generar una referencia visual coherente para documentacion o guiones.
- Prototipado rapido de escenas: combinado con el checkpoint base en ComfyUI, permite iterar sobre composiciones (fondo simple, calle nocturna) con Euler a, 28 pasos, CFG 4,5 y CLIP skip 2 a 832x1216.
- Pruebas de integracion de LoRA en pipelines de difusion: al ser un adaptador diffusers estandar en safetensors, sirve para validar flujos de carga, pesos y fuerza de adaptador en entornos de investigacion.
- Comparacion de epochs y fuerzas de LoRA: los siete checkpoints publicados permiten estudiar el efecto del sobreentrenamiento y de la intensidad (0,4-1,0) sobre la fidelidad de identidad y la adherencia al prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. El autor solo publica una evaluacion cualitativa por rondas:

| Ronda | Candidatos | Configuracion | Resultado observado |
|---|---|---|---|
| Round 1 | E1-E7 | Intensidad 0,8 | Criba inicial; E5, E6 y E7 pasan a la siguiente ronda |
| Round 3 | E5, E6, E7 | 10 escenas x 4 intensidades (0,4 / 0,6 / 0,8 / 1,0) | E6 seleccionado como recomendado a 0,8; E5 como alternativo; E7 como alternativo final |

## Requisitos de hardware

- VRAM: el LoRA en si ocupa unos 456 MB por checkpoint; el consumo real lo determina el checkpoint base SDXL (tipicamente 6-10 GB en fp16 segun resolucion y lote).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para SDXL a 832x1216 en fp16; el autor entreno y evaluo en un NVIDIA DGX Spark.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas (RTX 3060 Ti, 3070, 4060 Ti, 4070, 4080, 4090) con el checkpoint base en fp16 o cuantizado.
- Opciones de despliegue: ComfyUI (configuracion usada por el autor), Automatic1111/Forge, diffusers con `load_lora_weights`, y cualquier frontend que cargue LoRA en safetensors.
- Latencia y throughput: no disponibles.
- Ajustes de referencia del autor: Euler a, 28 pasos, CFG 4,5, CLIP skip 2, 832x1216, sin hires fix ni ADetailer.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KyoukaUzen-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | rango 64, alpha 32 | no aplica | creativeml-openrail-m | HuggingFace, ModelScope |
| LoRA de personaje generico en Illustrious | LoRA de personaje | cualquiera de la familia Illustrious | variable | no aplica | variable | HuggingFace, Civitai |
| Checkpoint SDXL base | modelo completo | SDXL | no disponible | no aplica | openrail / variantes | HuggingFace |

No se dispone de datos publicos de rendimiento comparativo frente a otros LoRA del mismo personaje en la informacion proporcionada.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos sobre el personaje y la obra original pertenecen a sus titulares; el autor lo declara explicitamente como fan-made.
- Licencia creativeml-openrail-m: permite uso comercial con restricciones (clausulas de atribucion, prohibicion de uso ilicito y obligacion de compartir la licencia en derivados); conviene revisar el texto completo antes de explotacion comercial.
- Fidelidad de vestuario limitada: el autor advierte que la variante `kyouka_uzen_white_blouse` tiende a renderizarse como vestido blanco de verano con sandalias; hay que escribir explicitamente "white blouse" si se necesita una blusa.
- Color de pelo y ojos a menudo omitidos en las captions: es necesario anadir "short black hair, red eyes" en el prompt para asegurar la identidad.
- Dependencia estricta del checkpoint base: el LoRA esta entrenado sobre waiIllustriousSDXL v17 y su comportamiento con otros checkpoints SDXL o Illustrious no esta documentado.
- Riesgo de sobreajuste en epochs altos: el autor recomienda E6 a 0,8 y senala E7 como cercano pero alternativo; intensidades de 1,0 no se recomiendan por defecto.
- Sin datos de sesgos, tasas de alucinacion visual ni evaluaciones cuantitativas de calidad; la validacion es exclusivamente cualitativa y realizada por el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/KyoukaUzen-Lora
- Dataset en HuggingFace: https://huggingface.co/datasets/abbuibuibui/KyoukaUzen-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/KyoukaUzen-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/KyoukaUzen-Dataset
- Notas de evaluacion (chino): `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
