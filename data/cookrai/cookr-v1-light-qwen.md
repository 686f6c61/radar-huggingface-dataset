# CookrAI/cookr-v1-light-qwen

## Resumen

CookrAI/cookr-v1-light-qwen es un adaptador LoRA de rango 128 sobre el modelo base Qwen/Qwen-Image (20B), orientado a la generacion de logos de memecoin y plantillas de meme con texto renderizado de forma legible. Lo desarrolla CookrAI, el equipo detras de cookr.pro y del repositorio github.com/CookrAI/cookr, y su proposito es cubrir el caso en el que el meme necesita palabras: tickers sobre la moneda, barras de subtitulo o frases del tipo "TRUST THE RECIPE" sobre un gato.

La eleccion de Qwen-Image como base no es casual: la propia model card indica que Qwen-Image renderiza palabras correctamente mientras que Z-Image-Turbo, la base de la edicion completa del mismo autor, en general no lo hace. Esto convierte a esta variante en la opcion preferente cuando el resultado final debe llevar texto integrado en la imagen, algo habitual en logos de tokens y en creatividades de comunidades cripto.

El modelo se distribuye como LoRA cargable con la libreria diffusers (pipe.load_lora_weights), con licencia Apache-2.0, un repositorio de 2,4 GB y una instancia de activacion ("cookr") que se antepone al prompt. Se trata de la version "light" del sistema COOKR: unos pocos miles de imagenes curadas sobre una base abierta, mientras que la version completa, entrenada sobre millones de memes y servida en cookr.pro, no es publica. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, por lo que no existe validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 128, alpha 128) sobre el modelo de texto a imagen Qwen/Qwen-Image (20B). La model card no detalla la arquitectura interna del modelo base |
| Parametros totales | El modelo base Qwen-Image tiene 20B. El numero de parametros del adaptador no se especifica; el repositorio ocupa 2,4 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de texto a imagen; la model card no especifica limite de tokens de prompt) |
| Tipos de cuantizacion | El base se entreno con uint3 y un adaptador de recuperacion de precision, con text encoder en fp8. Para inferencia la model card menciona transformer cuantizado en 8 bits o 4 bits. El adaptador LoRA no declara cuantizaciones propias |
| Idiomas soportados | No disponible como lista oficial; los ejemplos de prompt de la model card estan en ingles |
| Licencia | Apache-2.0 (los derechos de las imagenes de entrenamiento pertenecen a sus autores) |
| Formato de pesos | No especificado explicitamente; repositorio para diffusers (library_name: diffusers), cargable con load_lora_weights |
| Tipo de modelo | LoRA de texto a imagen (pipeline: text-to-image) |
| Modelo base | Qwen/Qwen-Image |
| Instancia de activacion | cookr |
| Tamano del repositorio | 2,4 GB |
| Fecha de creacion (segun HuggingFace) | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de rango 128 con alpha 128, aplicado sobre Qwen-Image, un modelo de texto a imagen de 20B de parametros con licencia Apache-2.0. Segun la model card, durante el entrenamiento se uso el base en uint3 junto con un adaptador de recuperacion de precision, y el text encoder en fp8. La inferencia se realiza cargando primero el pipeline de Qwen-Image y despues los pesos LoRA con load_lora_weights.

El conjunto de datos de entrenamiento esta compuesto por 5.3k logos de monedas de pump.fun (priorizando monedas que habian cotizado y deduplicadas por phash) mas 98 plantillas de meme repetidas 8 veces. Los caption se generaron con Qwen2.5-VL, anteponiendo el nombre de la moneda y su ticker. El schedule fue de 3500 pasos, batch 1, learning rate 1e-4, optimizador adamw8bit, precision bf16 y EMA 0.99, sobre 1x L40S durante aproximadamente 3 horas. La gramatica de prompt documentada es: `cookr,  of <personaje> (<TICKER>), <detalles>, the word <TEXTO> in bold letters, <estilo>, <colores>`. La configuracion completa esta en `train/qwen_image_lora.yaml` del repositorio de GitHub.

## Capacidades

- Generacion de imagenes de texto a imagen mediante difusion, con la estetica de logo de memecoin y plantilla de meme aprendida del dataset de COOKR.
- Renderizado de texto legible dentro de la imagen: tickers sobre la moneda, barras de subtitulo, insignias y frases en negrita. Es la diferencia funcional principal respecto a la edicion Z-Image-Turbo.
- Composicion de personajes concretos (por ejemplo, un shiba inu con gafas de sol) asociados a un nombre y un ticker determinados.
- Control de estilo y paleta mediante lenguaje natural (colores, formato, detalles).
- Ajuste de intensidad del adaptador (peso LoRA recomendado entre 0,8 y 1,0) y del compromiso entre fidelidad al prompt y creatividad (CFG 3-5).
- Integracion programatica en pipelines Python con diffusers, incluida la generacion por lotes.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision de entrada ni audio: es exclusivamente un modelo de generacion de imagenes.
- No se documentan capacidades multilingues del adaptador; los prompts de ejemplo estan en ingles.

## Casos de uso

- Generacion de logos de memecoin para lanzamientos en pump.fun: dado un nombre de token y un ticker, el LoRA produce una imagen cuadrada que integra el ticker en el propio logo, evitando el paso posterior de rotular el texto en un editor grafico.
- Creacion de plantillas de meme con subtitulo: partiendo de la plantilla y del texto deseado se obtienen imagenes con el chiste renderizado, utiles para publicaciones en redes sociales de comunidades cripto.
- Prototipado rapido de identidad visual de una comunidad: generar 10-20 variantes de logo y personaje por token permite elegir una direccion estetica antes de encargar un diseno definitivo.
- Material grafico para canales de Telegram y Discord: avatares, stickers y banners tematicos con el ticker del proyecto, generados por lotes con un script de diffusers.
- Test A/B de creatividades en campanas de captacion: al poder fijar estilo, colores y texto, se pueden producir variantes controladas y medir cual obtiene mejor respuesta en redes.
- Ilustracion de contenido editorial sobre cripto y cultura de memes: portadas o imagenes de apoyo para newsletters y articulos que parodian monedas concretas.
- Base para experimentacion en investigacion: al ser un LoRA de rango 128 sobre un base abierto de 20B, sirve como punto de partida para estudiar adaptacion de bajo rango o ajuste adicional con un dataset propio.
- Servicio interno de generacion bajo demanda: desplegando Qwen-Image cuantizado y el adaptador en una GPU de 24 GB, un backend puede ofrecer generacion de logos como funcionalidad de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 40 GB para el base Qwen-Image de 20B, segun la propia model card.
- VRAM con cuantizacion: la model card indica que un transformer cuantizado en 8 bits o 4 bits permite ejecutar el modelo en una tarjeta de 24 GB.
- GPU recomendadas: L40S (48 GB) es la empleada en el entrenamiento del adaptador; H100 o A100 para bf16 sin cuantizar; RTX 4090 (24 GB) resulta viable unicamente con cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 y tarjetas de 24 GB equivalentes, siempre que se use el transformer cuantizado. En tarjetas de 16 GB o menos no hay datos que confirmen su viabilidad.
- Opciones de despliegue: diffusers es la via documentada (DiffusionPipeline.from_pretrained mas load_lora_weights). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un pipeline de difusion de este tipo.
- Ajustes de inferencia documentados: 25-40 pasos, CFG (true_cfg_scale) 3-5, peso LoRA 0,8-1,0, resolucion de ejemplo 1024x1024.
- Latencia y throughput: no disponibles. Existe una variante Lightning de Qwen-Image publicada por terceros (lightx2v/Qwen-Image-Lightning) que podria reducir el numero de pasos, pero no se aportan cifras en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CookrAI/cookr-v1-light-qwen | LoRA de texto a imagen | Adaptador sobre base de 20B; tamano de repo 2,4 GB | Qwen-Image | No disponible; ejemplo a 1024x1024 | Apache-2.0 | Publico en HuggingFace; 0 descargas |
| CookrAI/cookr-v1-light | Checkpoint completo independiente | No disponible | Z-Image-Turbo | No disponible; renderiza mal el texto segun la model card | No disponible | Publico en HuggingFace |
| Qwen/Qwen-Image | Modelo de texto a imagen | 20B | No aplica | No disponible; bf16 ~40 GB | Apache-2.0 | Publico en HuggingFace |
| lightx2v/Qwen-Image-Lightning | Variante optimizada para pocos pasos | No disponible | Qwen-Image | No disponible | No disponible | Publico en HuggingFace |

No se dispone de datos de rendimiento comparado (benchmarks, FID, precision de texto renderizado) para ninguno de los modelos de la tabla en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento reducido: 5.3k logos mas 98 plantillas de meme repetidas 8 veces. La cobertura de estilos, personajes y composiciones fuera de ese dominio sera limitada y el modelo puede degradar o producir resultados genericos ante prompts alejados de memes y memecoins.
- Riesgo de texto incorrecto: aunque el objetivo del adaptador es renderizar palabras, no hay garantia de que el texto salga con la ortografia exacta solicitada. Cualquier uso en produccion requiere revision del resultado letra a letra.
- Riesgo de reproduccion de marcas y activos de terceros: al haberse entrenado con logos reales de monedas de pump.fun, puede generar imagenes muy similares a marcas o proyectos existentes, con el consiguiente riesgo legal y de suplantacion.
- La licencia Apache-2.0 cubre el adaptador, pero la model card aclara que las imagenes de entrenamiento siguen siendo propiedad de quienes las crearon. El uso comercial del modelo no exime de responsabilidad sobre el parecido con obras preexistentes.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y ausencia de benchmarks publicados. No hay evidencia independiente de calidad o de estabilidad de los resultados.
- Idiomas: no se documenta soporte multilingue del adaptador ni del texto que renderiza. Los ejemplos estan en ingles; el comportamiento con prompts o texto en castellano no esta descrito.
- Ausencia total de capacidades de lenguaje: no hay tool calling, agentes, razonamiento ni vision de entrada. No debe evaluarse como un modelo de lenguaje.
- Coste de despliegue elevado: requiere cargar un base de 20B, con aproximadamente 40 GB de VRAM en bf16 y 24 GB como minimo practico con cuantizacion de 8 o 4 bits.
- Dependencia del base: la calidad final esta condicionada por Qwen-Image; cualquier limitacion o cambio de licencia del modelo base afecta al adaptador.
- Distincion light frente a full: esta version no es el sistema COOKR completo. El modelo entrenado sobre millones de memes solo se sirve a traves de cookr.pro y no se publica.
- La fecha de creacion registrada en HuggingFace es 2026-09-28, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CookrAI/cookr-v1-light-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen-Image
- Edicion Z-Image-Turbo (checkpoint completo): https://huggingface.co/CookrAI/cookr-v1-light
- Repositorio de codigo y pipeline de entrenamiento: https://github.com/CookrAI/cookr
- Servicio del autor: https://cookr.pro
- Perfil en X del autor: https://x.com/CookrPro
- Contacto: hi@cookr.pro
- Variante Lightning de Qwen-Image: https://huggingface.co/lightx2v/Qwen-Image-Lightning
- Web de la familia Qwen: https://qwen.ai/home
