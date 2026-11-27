# abbuibuibui/MikanHinatsuki-Lora

## Resumen

MikanHinatsuki-Lora es una coleccion de LoRAs de personaje para modelos de difusion de imagenes, centrada en Mikan Hinatsuki (阳夏木蜜柑), personaje de la serie anime *The Demon Girl Next Door* (*Machikado Mazomu*). Lo desarrolla el usuario abbuibuibui y se publica bajo licencia CreativeML OpenRAIL-M. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que debe aplicarse sobre un modelo base SDXL concreto para generar imagenes del personaje.

El repositorio contiene tres linajes independientes entrenados sobre bases distintas: el linaje original sobre waiIllustriousSDXL v17 (ficheros en la raiz), un segundo linaje sobre AutismMix Pony (carpeta `autism_pony/`) y un tercer linaje sobre MOSS-Image (carpeta `moss/`). Cada linaje tiene sus propios tokens de activacion, prompts y negativos, y el autor advierte explicitamente de que no deben mezclarse. El peso recomendado del linaje principal es la epoca E6 a fuerza 0.8.

La relevancia de esta ficha es acotada: se trata de un LoRA de personaje con 200 descargas y 1 like en el momento de la consulta, orientado a generacion de arte anime con Stable Diffusion XL. Su interes tecnico esta en la documentacion del proceso de entrenamiento (rank 64, alpha 32, 7 epocas, dataset de 79 pares) y en la evaluacion comparativa publicada entre epocas y fuerzas de aplicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL / Illustrious; no es un modelo autonomo |
| Parametros totales | no disponible (cada fichero pesa 456.497.900 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors (bf16 presumiblemente) |
| Idiomas soportados | en, zh (etiquetas de prompt y documentacion) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |
| Modelo base | waiIllustriousSDXL v17 (linaje principal); AutismMix Pony; MOSS-Image |
| Rank / alpha | 64 / 32 (linaje principal) |
| Epocas entrenadas | 7 (E1-E7) |
| Tamano del repositorio | 7,9 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 32, entrenado con AdamW en precision bf16 y buckets con tope de 1536. El linaje principal parte de waiIllustriousSDXL v17 y se entreno durante 7 epocas sobre un dataset de 79 pares de imagenes con 7 conjuntos de vestuario, con 3 repeticiones por muestra. Las captions usaron `keep_tokens = 2`, y el autor senala que los colores de pelo y ojos se omitieron con frecuencia en las captions, por lo que conviene anadirlos explicitamente en el prompt.

El repositorio alberga tres linajes entrenados sobre bases distintas, cada uno en su propio subdirectorio o en la raiz. El linaje AutismMix Pony se entreno sobre AutismMix Pony y las muestras se renderizaron con AutismMix Confetti; el linaje MOSS-Image se entreno sobre MOSS-Image. El autor insiste en no mezclar pesos, prompts ni negativos entre linajes. La evaluacion publicada incluye una ronda inicial sobre E1-E7 a fuerza 0.8 y una matriz sobre E5, E6 y E7 cruzada con diez escenas y cuatro fuerzas (0.4, 0.6, 0.8 y 1.0), de la que se concluye que E6 a 0.8 es la configuracion recomendada para el linaje principal.

## Capacidades

- Generacion de imagenes de un personaje concreto (Mikan Hinatsuki) sobre modelos base SDXL/Illustrious, Pony y MOSS-Image.
- Control de identidad mediante el token `mikan_hinatsuki`, con pelo largo, pelo rubio y ojos azules como rasgos por defecto en el linaje principal.
- Control de vestuario mediante tokens especificos: `mikan_hinatsuki_magical_girl_form`, `mikan_hinatsuki_yellow_dress`, `mikan_hinatsuki_flower_blouse`, `mikan_hinatsuki_flower_print_dress`, `mikan_hinatsuki_green_tee`, `mikan_hinatsuki_orange_striped_top` y `mikan_hinatsuki_school_uniform`.
- Ajuste de fuerza del adaptador entre 0.4 y 1.0 para modular la fidelidad al personaje frente a la libertad creativa del modelo base.
- Compatibilidad con flujos de trabajo de ComfyUI y con la libreria diffusers.
- Soporte de prompts en ingles y chino en la documentacion y en las captions.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de imagen.

## Casos de uso

- Ilustracion de fan art del personaje: aplicar el LoRA a fuerza 0.8 sobre waiIllustriousSDXL v17 con el prompt de ejemplo del autor para obtener retratos y cuerpos completos coherentes con el diseno de Mikan Hinatsuki.
- Generacion de variantes de vestuario: usar los tokens de vestuario entrenados (uniforme escolar, vestido amarillo, camiseta verde, blusa de flores) para producir un conjunto de imagenes consistentes del mismo personaje en distintos atuendos.
- Creacion de material para comunidades de fanes: el LoRA permite generar paneles ilustrativos o portadas para ficcion y discusion en foros, con la salvedad de la licencia y de los derechos del personaje original.
- Pruebas de pipelines de difusion: sirve como caso de estudio para evaluar como afecta la fuerza del adaptador (0.4 a 1.0) y la epoca elegida a la fidelidad del personaje en un flujo ComfyUI con Euler a, 28 pasos, CFG 4.5 y CLIP skip 2.
- Comparacion entre linajes: al incluir pesos para tres bases distintas (Illustrious, Pony y MOSS-Image), permite medir diferencias de estilo y fidelidad entre familias de modelos SDXL con el mismo dataset.
- Integracion en herramientas de generacion por lotes: al ser un safetensors de 456 MB por fichero, se puede cargar y descargar en pipelines automatizados de renderizado sin el coste de un modelo completo.
- Referencia para entrenamiento de LoRAs de personaje: la documentacion de hiperparametros (rank 64, alpha 32, 7 epocas, 79 pares, 3 repeticiones) sirve como plantilla para quien entrene adaptadores similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. La evaluacion del autor es cualitativa y se limita a comparaciones visuales entre epocas y fuerzas de aplicacion:

| Comparacion | Resultado observado | Decision |
|---|---|---|
| E5 a 0.8 | Pelo rubio largo y ojos azules usables; forma de chica magica a menudo presente | Alternativa |
| E6 a 0.8 | Retrato estable: pelo rubio largo, ojos azules, forma de chica magica; silueta de Mikan consistente | Recomendada |
| E7 a 0.8 | Muy proxima a E6 | Alternativa final |

No se proporcionan metricas como FID, CLIP score ni similitud facial.

## Requisitos de hardware

- El LoRA en si pesa 456.497.900 bytes por fichero (unos 456 MB), por lo que el requisito real de VRAM lo determina el modelo base SDXL sobre el que se aplica, no el adaptador.
- Para SDXL en precision bf16 se requiere una GPU con al menos 8-10 GB de VRAM en configuraciones optimizadas; en fp32 el requisito es mayor. No se dispone de mediciones especificas para este LoRA en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion; por la naturaleza del modelo base, cabria esperar RTX 3060/4060 Ti en adelante, pero el autor no publica requisitos.
- Cabe en GPU de consumo si el modelo base SDXL cabe; el adaptador anade una sobrecarga marginal de memoria.
- Opciones de despliegue: ComfyUI (flujo usado por el autor), diffusers y, presumiblemente, Automatic1111 u otros frontends compatibles con LoRA SDXL; no se documentan vLLM, llama.cpp, Ollama ni TGI porque no aplican a modelos de difusion.
- Latencia y throughput: no disponibles. El autor documenta ajustes de muestreo (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216) pero no tiempos de generacion.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRAs de personaje comparables en la documentacion proporcionada. La comparacion interna entre linajes del propio repositorio es la siguiente:

| Linaje | Modelo base | Carpeta | Epoca recomendada | Fuerza recomendada | Tokens de identidad |
|---|---|---|---|---|---|
| Principal | waiIllustriousSDXL v17 | raiz | E6 | 0.8 | `mikan_hinatsuki` |
| AutismMix Pony | AutismMix Pony | `autism_pony/` | E6 | 1.0 | `mikan_hinatsuki` |
| MOSS-Image | MOSS-Image | `moss/` | no disponible | no disponible | no disponible |

No se conocen modelos alternativos de terceros para el mismo personaje en la informacion disponible.

## Limitaciones y advertencias

- Es un LoRA de personaje no oficial: los derechos sobre Mikan Hinatsuki y la obra original pertenecen a sus titulares; el autor lo declara como derivado hecho por fanes.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibicion de usos daninos descritos en la licencia) y conviene revisarla antes de cualquier uso comercial.
- Los tres linajes no son intercambiables: mezclar pesos, prompts o negativos entre waiIllustrious, AutismMix Pony y MOSS-Image produce resultados incorrectos segun el autor.
- El dataset es pequeno (79 pares, 7 vestuarios), lo que limita la variedad de poses y expresiones y aumenta el riesgo de sobreajuste a las composiciones del conjunto de entrenamiento.
- Las captions omiten con frecuencia el color de pelo y ojos, por lo que es necesario anadirlos en el prompt para evitar derivas de identidad.
- No hay datos publicados sobre sesgos, tasas de alucinacion visual ni evaluaciones cuantitativas de fidelidad.
- El modelo solo genera imagenes; no procesa texto, audio ni codigo, y no admite tool calling ni razonamiento.
- El repositorio ocupa 7,9 GB por la acumulacion de tres linajes y multiples epocas; conviene descargar solo el fichero necesario.
- La fecha de creacion indicada (2026-11-04) es futura respecto a la mayoria de referencias habituales; conviene verificar la vigencia del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/MikanHinatsuki-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/MikanHinatsuki-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/MikanHinatsuki-Lora
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `README_zh.md` (dentro del repositorio)
