# abbuibuibui/MinamiNanami-Lora

## Resumen

MinamiNanami-Lora es un adaptador LoRA de personaje para modelos de difusion SDXL, concretamente entrenado sobre el checkpoint comunitario waiIllustriousSDXL-v17 (familia Illustrious). Lo desarrolla el usuario abbuibuibui y reproduce a Minami Nanami, personaje de la serie *Bottom-tier Character Tomozaki*. El modelo resuelve un problema acotado: generar imagenes consistentes de un personaje concreto con su uniforme escolar y variantes de vestuario, algo que los checkpoints base no garantizan sin un adaptador especifico.

Tecnicamente es un LoRA de rango 64 y alpha 32, entrenado con 71 pares imagen-texto con 2 repeticiones, lo que da un total de 142 muestras efectivas. El repositorio ocupa 3,2 GB y contiene siete ficheros de pesos (uno por epoca, E1-E7), cada uno de 456.497.868 bytes. El autor recomienda la epoca E6 a fuerza 0,8 tras una evaluacion comparativa propia en tres rondas.

Su relevancia es practica para quien genere ilustracion anime con SDXL/Illustrious: ofrece tokens de activacion por identidad y por conjunto de ropa, junto con una evaluacion publica de epocas y fuerzas que documenta el comportamiento del adaptador. No es un modelo de lenguaje ni un modelo fundacional, sino un artefacto de personalizacion para pipelines de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusion SDXL (checkpoint base waiIllustriousSDXL-v17) |
| Parametros totales | no disponible (rango 64 / alpha 32; cada fichero pesa 456.497.868 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion; el prompt de texto depende del codificador CLIP del checkpoint base) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en, zh |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA inyectado en las capas del UNet de un modelo SDXL. El checkpoint base es waiIllustriousSDXL-v17, un refinamiento comunitario de la familia Illustrious orientado a ilustracion anime. El entrenamiento se realizo con rango 64 y alpha 32 sobre 71 pares imagen-texto con 2 repeticiones, en una DGX Spark usando ComfyUI como entorno de entrenamiento. No se documentan el numero de pasos, la tasa de aprendizaje ni la composicion exacta del dataset mas alla de su publicacion como abbuibuibui/MinamiNanami-Dataset.

El autor publica siete epocas (E1-E7). Las cuatro primeras se describen como tempranas o alternativas, con el pelo rubio y los ojos azules ya presentes. La E5 se marca como candidata alternativa por un retrato algo severo, la E6 como recomendada por defecto y la E7 como alternativa final con rostro casi identico a E6. El fichero sin numerar (`minami_nanami.safetensors`) corresponde a E7; no existe `minami_nanami-000007.safetensors`. El SHA-256 de E6 es C8F4E012D4EE0E354EDC45045C1F4B8235E96CDB659C482DBD276A88B6DE6D40.

## Capacidades

- Generacion de imagenes de un personaje concreto (Minami Nanami) sobre checkpoints SDXL de la familia Illustrious.
- Token de identidad `minami_nanami`, que fija pelo largo rubio y ojos azules.
- Tokens de vestuario entrenados: `minami_nanami_blazer_uniform`, `minami_nanami_summer_uniform`, `minami_nanami_casual_cardigan`, `minami_nanami_home_loungewear`, `minami_nanami_sports_t_shirt` y `minami_nanami_yukata`.
- Generacion de retratos, cuerpo completo, planos de tres cuartos y perfil, segun la evaluacion publicada.
- Composicion en escenas simples y complejas (fondo nocturno, calle nocturna) manteniendo un unico sujeto.
- Funcionamiento sin token de vestuario: a fuerza 0,8 produce una camiseta azul claro holgada y zapatillas blancas, conservando pelo rubio y ojos azules.
- No soporta tool calling, agentes, razonamiento multi-paso ni modos de pensamiento: es un adaptador de difusion, no un modelo generativo de texto.

## Casos de uso

- Ilustracion de fan art consistente: usar el token `minami_nanami` junto con el de uniforme para obtener representaciones estables del personaje en distintas poses y encuadres, apoyandose en la evaluacion publicada de E6 a 0,8.
- Produccion de paneles para doujinshi o comic amateur: la combinacion de tokens de vestuario permite mantener continuidad de indumentaria entre viñetas sin describir cada prenda en el prompt.
- Variaciones de vestuario en una misma sesion: alternar `minami_nanami_blazer_uniform` y `minami_nanami_summer_uniform` para generar escenas escolares de invierno y verano del mismo personaje.
- Escenas cotidianas y de descanso: los tokens `minami_nanami_casual_cardigan`, `minami_nanami_home_loungewear` y `minami_nanami_sports_t_shirt` cubren contextos fuera del uniforme escolar.
- Ilustracion estacional o tematica: el token `minami_nanami_yukata` permite generar escenas de festival sin reentrenar el adaptador.
- Integracion en un pipeline ComfyUI por lotes: el adaptador se carga como nodo LoRA y se puede encadenar con el checkpoint waiIllustriousSDXL-v17 para generar series de imagenes con semilla y prompt controlados.
- Prototipado rapido de personaje para proyectos derivados: al ser un derivado no oficial, sirve para exploracion visual interna antes de encargar arte definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor publica una evaluacion cualitativa en tres rondas (E1-E7 a fuerza 0,8; matriz E5-E7 por fuerzas 0,4, 0,6, 0,8 y 1,0) con imagenes comparativas, pero sin metricas numericas como FID, CLIP score o similitud facial.

Ajustes de generacion documentados por el autor para la muestra publicada: ComfyUI, sampler Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion 832x1216, sin hires fix ni ADetailer, fuerza LoRA 0,8.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende del checkpoint base SDXL. Como referencia general de la familia SDXL, la inferencia en fp16 requiere del orden de 8-12 GB de VRAM, y menos con cuantizacion del UNet.
- GPU recomendadas: no disponibles en la documentacion del autor. El entrenamiento se realizo en una DGX Spark con ComfyUI.
- Cabe en GPU de consumo: si, siempre que el checkpoint base SDXL quepa; el LoRA anade una sobrecarga pequena al peso del UNet.
- Opciones de despliegue: ComfyUI (entorno usado por el autor), diffusers (libreria declarada en el repositorio), y cualquier frontend compatible con LoRA SDXL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MinamiNanami-Lora (este) | LoRA de personaje | waiIllustriousSDXL-v17 | no disponible (rango 64 / alpha 32) | no aplica | creativeml-openrail-m | HuggingFace, ModelScope |
| LoRA de personaje SDXL generico | LoRA de personaje | SDXL o Illustrious | variable segun autor | no aplica | variable | HuggingFace, Civitai |
| Checkpoint base waiIllustriousSDXL-v17 | Checkpoint completo | SDXL | no disponible | no aplica | no disponible | Comunitario |

No se dispone de datos de benchmarks ni de adaptadores comparables concretos en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas no esta disponible.

## Limitaciones y advertencias

- Es un derivado no oficial: no esta afiliado ni respaldado por los titulares de los derechos de *Bottom-tier Character Tomozaki*.
- Licencia creativeml-openrail-m: permite uso comercial con restricciones; conviene revisar los terminos completos antes de explotar las imagenes en productos.
- El autor advierte de que las captions a menudo omiten color de pelo y ojos, por lo que hay que anadir "long blonde hair, blue eyes" al prompt para evitar desviaciones.
- Riesgo de fuga de identidad: el autor recomienda negativos como `brown hair, black hair, pink hair, brown eyes, green eyes, red eyes, twintails, short hair` para evitar que el checkpoint base imponga otros rasgos.
- Sin token de vestuario, el modelo deriva a una camiseta azul claro holgada y zapatillas blancas; no reproduce el uniforme de forma implicita.
- La calidad depende del checkpoint base: el adaptador esta entrenado para waiIllustriousSDXL-v17 y su comportamiento en otros checkpoints SDXL no esta documentado.
- Solo se documentan prompts en ingles y chino; el comportamiento con prompts en castellano no esta evaluado.
- No hay benchmarks numericos ni evaluacion de sesgos; la seleccion de la epoca E6 se basa en una evaluacion cualitativa del propio autor.
- El repositorio incluye siete ficheros de 456 MB cada uno (3,2 GB totales); conviene descargar solo la epoca deseada.

## Enlaces

- HuggingFace: https://huggingface.co/abbuibuibui/MinamiNanami-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/MinamiNanami-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/MinamiNanami-Lora
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
