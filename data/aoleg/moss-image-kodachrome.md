# aoleg/MOSS-Image-Kodachrome

## Resumen

MOSS-Image-Kodachrome es un adaptador de estilo de tipo LoKr (LyCORIS) publicado por el desarrollador independiente aoleg (usuario aoleg77) el 25 de octubre de 2026. No es un modelo completo, sino un ajuste de bajo rango que se aplica sobre OpenMOSS-Team/MOSS-Image-Base, un transformer de difusion (DiT) de 5.000 millones de parametros desarrollado por OpenMOSS, la familia que anade control nativo de composicion mediante prompts JSON con posiciones de objetos y texto renderizado.

El adaptador transfiere la respuesta de color y la curva de contraste del Kodachrome en hoja de 4x5 pulgadas de los anos 40, y de forma secundaria la nitidez caracteristica de ese formato. Segun el autor, el estilo ya se habia transferido en el paso 750 pero el grano de pelicula todavia no, por lo que debe considerarse un checkpoint intermedio y no una reproduccion completa del revelado quimico.

Su relevancia practica es doble: por un lado demuestra que un fichero de unos 34 MB permite especializar estilisticamente un DiT de 5B sin reentrenar; por otro, sirve como caso de estudio sobre como unos pocos centenares de imagenes de dominio muy concreto (551 escaneos de un unico fotografo de la Farm Security Administration) desplazan la distribucion cromatica y, a la vez, introducen un sesgo tematico y demografico evidente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoKr (LyCORIS, factorizacion de Kronecker con factor 16) sobre un DiT de 5.000 millones de parametros (MOSS-Image-Base) |
| Parametros totales | Adaptador: tamano de fichero de unos 34 MB (numero exacto de parametros no disponible); modelo base: 5B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion); la longitud de prompt la fija el text encoder del modelo base, limite no disponible |
| Tipos de cuantizacion | No disponible para el adaptador; las imagenes de ejemplo de la model card se generaron con una version int8 del modelo base (sufijo `int8_convrot` en los nombres de fichero) |
| Idiomas soportados | No disponible; la frase de activacion y los prompts de ejemplo estan en ingles y el modelo base no declara lista de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoKr en formato diffusers) |
| Tamano del repositorio | 0,1 GB |
| Resolucion de entrenamiento | 1280 px, batch 4 |
| Palabras de activacion | `Kodachrome film, Kodachrome` |
| Ajustes de inferencia probados | Fuerza 1.0, CFG 3, 50 pasos, skip-layer guidance en la capa 22 |

## Arquitectura y entrenamiento

El adaptador emplea LoKr, una variante de LyCORIS que descompone la actualizacion de pesos mediante productos de Kronecker en lugar de la factorizacion low-rank clasica de LoRA. Con factor 16, el resultado son matrices de rango muy bajo que ocupan decenas de megabytes y se pueden cargar y descargar en caliente sobre el DiT base. MOSS-Image-Base es un transformer de difusion de 5B parametros orientado a generacion texto-a-imagen, con capacidad nativa de control de layout: ademas del prompt en lenguaje natural, acepta una especificacion JSON con objetos, texto a renderizar y posiciones espaciales. El adaptador no modifica esa capacidad, la hereda.

El entrenamiento se hizo con Ostris AI Toolkit sobre 551 escaneos de Kodachrome en hoja de 4x5 pulgadas (no 35 mm, de ahi que el grano no forme parte del estilo aprendido), a 1280 px, batch 4 y 750 pasos. El autor describe explicitamente el resultado como un checkpoint intermedio: el look de color y contraste esta capturado, el grano no. No se documenta el uso de RLHF, DPO ni tecnicas de preferencias, algo por otra parte ajeno a un adaptador de estilo de difusion. Tampoco se detalla la composicion exacta del dataset mas alla del formato de pelicula y la epoca.

## Capacidades

- Generacion texto-a-imagen con estetica Kodachrome de los anos 40: respuesta cromatica y curva de contraste propias del formato de hoja 4x5, con enfasis en nitidez y saturacion contenida.
- Retrato de epoca: la model card muestra retratos de trabajadores ferroviarios y mineros con iluminacion industrial, el dominio sobre el que fue entrenado.
- Escenas de exterior e interior industrial: patios de tren, acerias, oficinas de madera, con resultados consistentes en los ejemplos publicados.
- Control de layout heredado del modelo base: posibilidad de especificar objetos y posiciones en JSON, aunque el adaptador no aporta ningun refuerzo especifico sobre esta funcion.
- Renderizado de texto en imagen heredado del base (capacidad declarada por OpenMOSS para MOSS-Image, no validada especificamente con este adaptador).
- No soporta tool calling, function calling, uso como agente ni razonamiento multi-paso: es un modelo de difusion, no un modelo de lenguaje.
- No tiene modo thinking, vision de entrada ni audio.
- Capacidades multilingues: no documentadas; la frase de activacion esta en ingles y no hay evidencia de comportamiento con prompts en castellano.

## Casos de uso

- Recreacion de archivo historico para documentales: generar ilustraciones o planos de recurso con estetica de los anos 40 a partir de descripciones textuales, usando la frase de activacion y descripciones detalladas de escena, epoca y fotografo de referencia.
- Moodboards y previsualizacion de proyectos audiovisuales: explorar rapido la paleta y el contraste de una produccion ambientada en la posguerra antes de invertir en direccion de fotografia o pruebas de camara.
- Diseno grafico editorial: portadas y aperturas de articulos de divulgacion historica con imagenes coherentes entre si, ya que el adaptador impone una respuesta de color uniforme a todas las generaciones.
- Ambientacion de producto y packaging de estetica retro: bodegones y escenas de marca con tratamiento analogico, utiles para campanas de edicion limitada; conviene revisar el resultado porque el adaptador esta sesgado hacia figuras humanas.
- Assets para videojuegos ambientados en la primera mitad del siglo XX: retratos de personajes, utillaje ferroviario e interiores industriales generados en lote con el mismo look, aprovechando que el adaptador pesa 34 MB y se puede versionar junto al proyecto.
- Investigacion sobre sesgos estilisticos: comparar la distribucion cromatica y la deriva semantica de un DiT de 5B antes y despues de aplicar un LoKr entrenado con 551 imagenes de un unico corpus, como experimento controlado y reproducible.
- Docencia de color y fotografia: mostrar de forma interactiva que hace una curva de contraste tipo Kodachrome sobre una escena, separando el efecto de color del efecto de grano (que este adaptador no reproduce).
- Prototipado rapido en ComfyUI: al estar soportado LoKr en el nucleo de ComfyUI, se puede encadenar con otros nodos de control estructural para iterar sobre composiciones ya fijadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay FID, CLIP score, ni comparaciones cuantitativas de similitud estilistica frente al modelo base ni frente a otros adaptadores Kodachrome. La unica evaluacion es cualitativa: diez imagenes de ejemplo en la model card generadas con el modelo base en int8 y los prompts de la tabla de widgets.

## Requisitos de hardware

- VRAM estimada para el modelo base en fp16: en torno a 10 GB solo para pesos (5B x 2 bytes), mas text encoder, VAE y activaciones de atencion a 1280 px; calculo teorico, no medido.
- VRAM estimada con el base cuantizado a int8 (la variante usada en los ejemplos): aproximadamente 5-6 GB de pesos, mas el resto del pipeline.
- El adaptador en si anade un coste despreciable: unos 34 MB de pesos que se suman a los del DiT.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes en fp16 sin cuantizar; L40S 48 GB como alternativa de coste medio.
- GPU de consumo: RTX 4090 (24 GB) y RTX 3090 (24 GB) deberian ejecutar el base en fp16 a 1280 px con batch 1; RTX 4080/4070 Ti Super (16 GB) requiere cuantizacion int8 o fp8 y probablemente offload parcial.
- CPU: tecnicamente posible con diffusers y quantizacion agresiva, pero impractical para iteracion; no hay datos de latencia.
- Despliegue: Diffusers mediante `load_lora_weights` sobre el pipeline de MOSS-Image-Base; ComfyUI con el cargador LoRA estandar (el soporte de LoKr esta en el nucleo); Ostris AI Toolkit para reentrenar o continuar el entrenamiento. vLLM, TGI, llama.cpp y Ollama no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El unico dato operativo es la configuracion de 50 pasos con CFG 3 empleada por el autor, que implica un coste de muestreo notablemente superior a 20-30 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Enfoque estilistico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aoleg/MOSS-Image-Kodachrome | LoKr factor 16 sobre MOSS-Image-Base | ~34 MB | Kodachrome de hoja 4x5, anos 40; sin grano | Apache-2.0 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| Kodachrome Photo (60s-70s) Moss_Image_v1 | LoRA sobre MOSS Image Base | 123 MB (safetensors) | Kodachrome de los anos 60-70; el autor reconoce que el grano no le convence | No disponible | Publicado en Civitai el 17 de octubre de 2026 |
| OpenMOSS-Team/MOSS-Image-Base | DiT completo | 5B parametros | Ninguno (modelo base) | No disponible en la informacion consultada | Hugging Face, repositorio oficial de OpenMOSS |
| MOSS-Image fine-tuned (familia OpenMOSS) | DiT completo ajustado con datos curados | 5B parametros (no confirmado) | Ninguno especifico | No disponible | Distribucion via OpenMOSS |

La comparacion cuantitativa de calidad estilistica entre los dos adaptadores Kodachrome no es posible con los datos disponibles: ninguno publica metricas y ambos se evaluan con galerias cualitativas.

## Limitaciones y advertencias

- Es un checkpoint intermedio declarado por el autor: reproduce color y contraste, pero no el grano de la pelicula. No debe presentarse como una emulacion completa del Kodachrome.
- Sesgo tematico severo: el dataset son 551 escaneos de un corpus muy concreto (fotografia de la Farm Security Administration, anos 40, fotografo de referencia Jack Delano). Los diez ejemplos de la model card son hombres de mediana edad en entornos ferroviarios o industriales.
- Sesgo demografico: la representacion de mujeres, personas racializadas y escenarios no estadounidenses queda fuera de la distribucion de entrenamiento; los resultados en esos dominios son impredecibles.
- Riesgo de sobreajuste al prompt: sin la frase de activacion el estilo puede diluirse, y con ella el modelo tiende a imponer composiciones y atuendos del corpus.
- Alucinacion visual: manos, anatomia facial, texto renderizado y estructura de maquinaria compleja son puntos tipicos de fallo en DiT de esta escala, agravados por un adaptador de bajo rango.
- Dependencia total del modelo base: hereda sus sesgos, su comportamiento con el text encoder y sus limitaciones de layout. Cualquier cambio en MOSS-Image-Base puede alterar el resultado del adaptador.
- Idioma: la frase de activacion esta en ingles y no hay documentacion sobre prompts en castellano; el comportamiento es empiricamente desconocido.
- Licencia: el adaptador es Apache-2.0, pero la licencia del modelo base no aparece en la informacion consultada y debe verificarse antes de un uso comercial.
- Marca: "Kodachrome" es una marca de Kodak. La licencia del codigo y los pesos no concede derechos sobre la marca; conviene evitar su uso promocional en productos comerciales.
- Uso responsable: la estetica documental de los anos 40 puede emplearse para fabricar falsos historicos convincentes. Cualquier uso periodistico o divulgativo deberia etiquetar la imagen como generada.
- Madurez: 0 descargas, 0 likes y publicacion el mismo dia de la consulta. No hay validacion independiente de la comunidad ni reportes de fallo.
- No hay garantia de reproducibilidad: no se documenta la semilla de los ejemplos ni la version exacta del modelo base int8 utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aoleg/MOSS-Image-Kodachrome
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Pagina oficial de MOSS-Image (OpenMOSS): https://openmoss.ai/MOSS-Image/
- Repositorio oficial en GitHub: https://github.com/OpenMOSS/MOSS-Image/tree/main
- Nota sobre el lanzamiento del adaptador en AGI Hunt: https://agihunt.info/en/p/1a1742c2519425c4f485e17d3c0
- Adaptador Kodachrome alternativo (Civitai, 60s-70s): https://civitaiarchive.com/models/2740189?modelVersionId=3411996
- Interfaz de terceros no oficial para MOSS-Image: https://mossimage.app/
