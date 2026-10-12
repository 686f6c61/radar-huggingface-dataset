# Nanite-Labs/nanites-marginalia-sdxl-1.0

## Resumen

Nanite-Labs/nanites-marginalia-sdxl-1.0 es un adaptador LoRA de texto a imagen para Stable Diffusion XL (SDXL 1.0) especializado en el lenguaje visual de los margenes de manuscritos medievales europeos, aproximadamente entre los siglos XIII y XV. Lo desarrolla Nanite-Labs, un perfil que publica adaptadores de estilo muy acotados sobre SDXL (la misma cuenta mantiene, por ejemplo, nanites-petroglyph-sdxl-1.0). No es un modelo generico de tematica medieval: esta entrenado deliberadamente para producir grotescos, drolleries, criaturas hibridas, animales marginales, caballeros, clerigos, demonios y escenas comicas absurdas, con linea a tinta, pigmento al temple y fondo de pergamino. Las miniaturas completas y las iniciales historiadas quedan fuera de su idioma estilistico por diseno.

El adaptador se entreno sobre 78 escaneos institucionales de dominio publico obtenidos mediante URLs IIIF, con recortes marginales como material principal y paginas completas como minoria de contexto. La ficha del autor documenta la provenance y los derechos imagen por imagen en el propio repositorio (SOURCES.md y manifest.csv), un detalle poco habitual en LoRAs de estilo y relevante para uso editorial o academico. Tecnicamente es una LoRA de rango 16, 1500 pasos, resolucion 768 y tasa de aprendizaje 0,0001, con una perdida media de 0,141 en los ultimos 50 pasos, entrenada en una unica RTX 4070 de 8 GB con CPU offload.

Su relevancia es acotada pero clara: cubre un nicho estilistico (marginalia) que los checkpoints generalistas de SDXL resuelven mal, y lo hace con un adaptador de 0,1 GB que se puede cargar sobre el modelo base sin reentrenar nada. Para ilustracion editorial, divulgacion historica, juegos de rol o prototipado de estetica manuscrita, ofrece control estilistico con un coste de almacenamiento y de VRAM minimo. A cambio, la comunidad no ha publicado descargas ni valoraciones (0 descargas y 0 likes en el momento de la consulta) y no hay benchmarks objetivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre SDXL 1.0: UNet con bloques de atencion, VAE y doble codificador de texto CLIP (base + Refiner no incluido) |
| Parametros totales | No disponible (adaptador LoRA; el repositorio ocupa 0,1 GB). El modelo base SDXL 1.0 tiene aproximadamente 3,5 mil millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM. La ventana de prompt heredada de SDXL es de 77 tokens por codificador de texto CLIP |
| Tipos de cuantizacion | Pesos del adaptador en safetensors (tipicamente fp16). Cuantizaciones GGUF para SDXL existen a traves de herramientas de terceros, pero no se documentan en esta ficha |
| Idiomas soportados | No disponible en los metadatos. Los prompts se procesan con los codificadores CLIP de SDXL, entrenados principalmente en ingles; no se documenta soporte multilingue del adaptador |
| Licencia | other (el adaptador hereda CreativeML Open RAIL++-M del modelo base SDXL; los escaneos de referencia conservan sus derechos institucionales, en dominio publico, con provenance por imagen en SOURCES.md) |
| Formato de pesos | safetensors, compatible con la libreria diffusers |
| Trigger de activacion | marginalia_style |
| Resolucion de entrenamiento | 768 (recorte central), con inferencia sugerida en 1024 cuadrada o vertical |
| Pasos de entrenamiento | 1500 |
| Tamano del dataset | 78 imagenes |
| Hardware de entrenamiento | RTX 4070 de 8 GB con CPU offload |

## Arquitectura y entrenamiento

El adaptador no modifica la arquitectura del modelo base: es una LoRA de rango 16 inyectada sobre stabilityai/stable-diffusion-xl-base-1.0. SDXL es un modelo de difusion latente con un UNet de gran tamano, un VAE para codificar y decodificar en el espacio latente y dos codificadores de texto CLIP (uno de ellos OpenCLIP de mayor tamano) cuyas representaciones se concatenan para condicionar la generacion. La LoRA ajusta matrices de bajo rango en las capas de atencion del UNet, de modo que el estilo marginalia se activa sin alterar los pesos originales, que se cargan por separado.

El entrenamiento consistio en 1500 pasos a una tasa de aprendizaje de 0,0001 y resolucion 768, sobre un corpus de 78 escaneos institucionales en dominio publico descargados via URLs IIIF. La composicion del dataset es mayoritariamente de recortes marginales con una minoria de paginas completas que aportan contexto de composicion. La perdida media de los ultimos 50 pasos fue de 0,141. Todo el proceso cupo en una RTX 4070 de 8 GB usando CPU offload, lo que indica que el autor no recurrio a RLHF, DPO ni a ningun proceso de alineacion: en difusion ese tipo de ajuste no aplica de la misma forma que en modelos de lenguaje. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni destilacion de pasos.

## Capacidades

- Generacion de imagenes de texto a imagen en el idioma visual de los margenes de manuscritos medievales (siglos XIII a XV): grotescos, drolleries, criaturas hibridas, bestias, animales marginales, caballeros, clerigos, demonios y artistas.
- Control estilistico mediante la palabra clave marginalia_style, que debe incluirse en el prompt para activar el adaptador.
- Reproduccion de tecnicas pictoricas concretas: linea a tinta (marron), color plano al temple y fondo de pergamino, segun los ejemplos de la ficha del autor.
- Escenas comicas o absurdas de margen, incluyendo motivos iconicos como el caballero que lucha contra un caracol gigante.
- Prompt negativo documentado para evitar desviaciones hacia fotorrealismo, render 3D, ilustracion fantastica moderna, anime, vector limpio, objetos modernos, marcas de agua, firmas, marcos, desenfoque, baja resolucion y texto legible.
- Composicion a 1024 en formato cuadrado o vertical (entrenamiento a 768 cuadrado con recorte central).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un modelo de difusion, no un modelo de lenguaje.
- No tiene capacidades de vision, audio ni voz. La entrada es texto, la salida es imagen.
- Capacidad multilingue no documentada; en la practica conviene escribir los prompts en ingles, el idioma dominante en el entrenamiento de los codificadores CLIP de SDXL.

## Casos de uso

- Ilustracion editorial especializada: portadas, capitulares decorativas o ilustraciones de interior para libros de historia medieval, ensayos sobre cultura manuscrita o catalogos de exposicion, usando marginalia_style con descripciones de motivos concretos y manteniendo coherencia estilistica con el original.
- Divulgacion historica y material didactico: generar ejemplos visuales de grotescos y drolleries para aulas, museos o articulos de blog, sin depender de escaneos con derechos restringidos, ya que el adaptador reproduce el idioma visual y no las obras concretas.
- Juegos de rol de mesa y suplementos: ilustraciones de bestiarios, cartas de encuentro o escenas comicas para ambientaciones de fantasia historica, con generacion rapida y un coste de VRAM bajo al ser una LoRA sobre SDXL.
- Prototipado de direccion de arte: validar una estetica manuscrita antes de encargar ilustracion humana, generando paneles de referencia con el prompt negativo documentado para no derivar hacia fantasía moderna.
- Videojuegos con estetica de manuscrito: generacion de assets secundarios como iconos, texturas de fondo tipo pergamino o ilustraciones de carga, integrables en pipelines de herramientas de difusion y posterior retoque manual.
- Merchandising y productos graficos: estampados, postales o calendarios con motivos marginales, siempre respetando la licencia CreativeML Open RAIL++-M heredada, que impone restricciones de uso sobre determinadas categorias.
- Investigacion sobre personalizacion eficiente: caso de estudio de ajuste de estilo con LoRA de rango 16 y 1500 pasos sobre 78 imagenes, util para comparar estrategias de dataset pequeno en entrenamiento de difusion.
- Reconstruccion hipotetica de escenas perdidas: proponer composiciones marginales plausibles para fragmentos danados de manuscritos, siempre como material especulativo y no como reconstruccion filologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor unicamente reporta la perdida media de entrenamiento (0,141 en los ultimos 50 pasos), que no es una metrica de calidad comparable entre modelos. No hay FID, CLIP score, ImageReward ni evaluaciones humanas, y tampoco existe una comparativa con otros LoRAs de marginalia.

| Metrica | Valor |
|---|---|
| Perdida media (ultimos 50 pasos) | 0,141 |
| FID | No disponible |
| CLIP score | No disponible |
| Evaluacion humana | No disponible |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, por lo que el requisito real lo marca el modelo base SDXL 1.0.
- VRAM estimada para inferencia con SDXL en fp16: del orden de 8 a 12 GB sin optimizaciones, y alrededor de 6 GB con CPU offload o atencion eficiente. No se dispone de mediciones exactas publicadas para este adaptador.
- El propio autor entreno en una RTX 4070 de 8 GB con CPU offload, lo que confirma que la inferencia cabe en GPU de gama media con 8 GB aplicando offload.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090 en el segmento de consumo; A100, H100 o L40S en servidor para generacion por lotes.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas aplicando optimizaciones, y con mas holgura a partir de 12 GB.
- Opciones de despliegue: diffusers (libreria declarada), ComfyUI, Automatic1111 / Forge, InvokeAI, Fooocus y otros frontales compatibles con LoRAs de SDXL. Tambien es posible exportar a GGUF para stable-diffusion.cpp, aunque no esta documentado por el autor.
- Latencia y throughput: no disponibles. Dependen por completo de la GPU, del numero de pasos y del scheduler elegido, no del adaptador.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Tamano de repo | Trigger | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| Nanite-Labs/nanites-marginalia-sdxl-1.0 | SDXL 1.0 | LoRA rango 16, 1500 pasos, 78 imagenes | 0,1 GB | marginalia_style | other (CreativeML Open RAIL++-M) | No disponible |
| Nanite-Labs/nanites-petroglyph-sdxl-1.0 | SDXL 1.0 | LoRA de estilo sobre SDXL | No disponible | No disponible | other | No disponible |
| stabilityai/stable-diffusion-xl-base-1.0 | No aplica | Modelo base de difusion, aproximadamente 3,5 mil millones de parametros | Varios GB | No requiere | CreativeML Open RAIL++-M | Benchmark publico del modelo base; no comparable directamente con un adaptador de estilo |
| LoRAs de marginalia medieval en Civitai | SDXL | LoRA de estilo de la comunidad | No disponible | No disponible | Variable segun autor | No disponible |

La comparacion directa con otros LoRAs de tematica medieval no es posible con los datos disponibles: no hay benchmarks comunes, ni numero de imagenes de entrenamiento publicado en la mayoria de casos, ni evaluaciones de fidelidad historica. El unico paralelo claro es nanites-petroglyph-sdxl-1.0, del mismo autor y con la misma estructura de publicacion, lo que sugiere una metodologia repetida (dataset pequeno y curado, LoRA de rango bajo, licencia other heredada del base).

## Limitaciones y advertencias

- La escritura y el lettering se corrompen: el modelo produce trazos marginales plausibles, pero no texto legible. El propio prompt negativo incluye legible text.
- Solo hace transferencia de estilo: mezcla motivos, pero no tiene autoridad de taller ni de folio, es decir, no reproduce con fidelidad filologica una obra o un scriptorium concreto.
- El fallo critico que el autor declara evitar es la deriva hacia ilustracion fantastica moderna; fuera de la palabra clave y del prompt negativo, el estilo puede degradarse hacia ese registro.
- El entrenamiento a 768 cuadrados con recorte central puede introducir sesgos de encuadre; el autor recomienda inferir a 1024 cuadrado o vertical.
- Dataset pequeno (78 imagenes), lo que limita la variedad de motivos, composiciones y epocas representadas dentro del periodo 1200-1500 declarado.
- Riesgo de alucinacion visual: puede inventar combinaciones de motivos, indumentaria o atributos anacronicos que no existian en los manuscritos originales. No debe usarse como fuente historica sin verificacion.
- Sesgos potenciales derivados del corpus: al proceder de escaneos institucionales digitalizados, hereda el sesgo de que instituciones y colecciones se han digitalizado, con posible sobrerrepresentacion de determinadas tradiciones (por ejemplo, europea occidental y anglonormanda) y ausencia de otras.
- Licencia other: el adaptador hereda CreativeML Open RAIL++-M, que permite uso comercial general pero incluye restricciones de uso sobre categorias concretas descritas en la licencia del modelo base. Conviene revisarla antes de un despliegue en produccion.
- Los derechos de los escaneos de referencia se documentan por imagen en SOURCES.md y manifest.csv; aunque sean de dominio publico, la trazabilidad es responsabilidad del usuario si redistribuye el material.
- Sin datos de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas, lo que implica ausencia de validacion externa y de soporte comunitario.
- No hay garantia de mantenimiento ni de actualizaciones por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nanite-Labs/nanites-marginalia-sdxl-1.0
- Repositorio de archivos: https://huggingface.co/Nanite-Labs/nanites-marginalia-sdxl-1.0/tree/main
- Otro adaptador del mismo autor (petroglifos): https://huggingface.co/Nanite-Labs/nanites-petroglyph-sdxl-1.0
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Documentacion de SDXL en Stable Diffusion Art: https://stable-diffusion-art.com/sdxl-model/
- Introduccion a SDXL 1.0 en GeeksforGeeks: https://www.geeksforgeeks.org/artificial-intelligence/stable-diffusion-xl-10-model-introduction/
- Ecosistema de checkpoints y LoRAs SDXL en Civitai: https://civitai.com/ecosystems/sdxl
