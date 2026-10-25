# olob0/z-image-turbo-brazilian-male-realism-lora-v1

## Resumen

`olob0/z-image-turbo-brazilian-male-realism-lora-v1` es un adaptador LoRA de text-to-image entrenado por Gabriel Lobo (usuario `olob0`) sobre el modelo base `Tongyi-MAI/Z-Image-Turbo`. Su objetivo declarado es corregir el sesgo de representacion del modelo base en retratos masculinos, desplazando la generacion hacia rostros y cuerpos de hombres brasileños y latinoamericanos con texturas de piel, proporciones e imperfecciones mas proximas a la fotografia real, y alejandose del acabado "de IA" (piel alisada, iluminacion de estudio, aspecto plastico).

Se trata de un adaptador pequeno (0,1 GB de repositorio) que no se ejecuta de forma autonoma: requiere cargar el modelo base Z-Image-Turbo y aplicar el LoRA con una fuerza recomendada de 0,6 a 0,85 (las imagenes de ejemplo se generaron a 0,75, con CFG 1.0). Utiliza la palabra gatillo opcional `BETTERBR`, que el autor aconseja alternar entre usarla y no usarla. La model card esta marcada explicitamente como obsoleta: existe una version v2 publicada en `olob0/z-image-turbo-brazilian-male-realism-lora-v2`, lo que convierte a esta v1 en material de referencia historica o de reproduccion, no en la opcion recomendada para produccion.

Su relevancia es acotada y de nicho: ilustra el patron de especializacion mediante LoRAs sobre modelos de difusion turbo de pocos pasos para corregir sesgos demograficos y de estilo, y sirve como caso de estudio de un entrenamiento experimental con un dataset deliberadamente limitado (100+ imagenes) cuyas carencias el propio autor documenta sin ambages.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion text-to-image (base: `Tongyi-MAI/Z-Image-Turbo`); arquitectura interna del LoRA no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen; no se documenta limite de tokens de prompt) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en el formato nativo del repo; el modelo base admite las cuantizaciones que soporte su implementacion en diffusers) |
| Idiomas soportados | ingles (`en`) segun la model card; el resto de idiomas no esta documentado |
| Licencia | CC-BY-4.0 (uso, modificacion y distribucion permitidos, incluido uso comercial, con atribucion al autor) |
| Formato de pesos | no disponible de forma explicita; pesos de adaptador LoRA distribuidos mediante la libreria `diffusers` (repo de 0,1 GB) |

Otros datos: pipeline `text-to-image`, 70 descargas y 1 like en el momento de la consulta, creado el 2026-04-24 y actualizado el 2026-10-25. Palabra gatillo: `BETTERBR`. Fuerza recomendada del LoRA: 0,6-0,85. CFG recomendado: 1.0.

## Arquitectura y entrenamiento

El modelo es un LoRA, es decir, un conjunto de pesos de bajo rango que se inyecta en las capas del modelo base de difusion `Tongyi-MAI/Z-Image-Turbo`. No se especifican en la informacion disponible ni el rango del adaptador, ni que modulos se adaptaron (attention, MLP, proyecciones de texto), ni el numero de pasos de entrenamiento, learning rate u otros hiperparametros. La model card solo indica que el adaptador de entrenamiento utilizado es el de `ostris` y que el modelo base pertenece a Tongyi-MAI.

El dataset de entrenamiento consistio en "100+ imagenes personalizadas de hombres brasileños", con variacion de tono de piel y edad, e incluye figuras politicas e imagenes generadas por IA. No se documenta el numero exacto de imagenes, la resolucion, el proceso de captioning, la composicion de la variacion demografica ni si se aplicaron tecnicas de regularizacion o de aumento de datos. El autor califica el entrenamiento como experimental y reconoce que la calidad del dataset fue limitada y que no se probo de forma intensiva en todos los estilos y prompts.

## Capacidades

- Generacion de imagenes fotorrealistas de retratos masculinos, con enfasis en textura de piel realista: poros, cicatrices de acné, arrugas sutiles, barba incipiente, brillos de piel grasa y tono desigual.
- Direccion de iluminacion natural: luz de ventana, sombras suaves, hora dorada y escenas sin iluminacion de estudio.
- Composicion de escenas documentales y urbanas: retratos callejeros, entornos de favela, estilo documental, planos medios y cuerpo completo.
- Variacion de tono de piel y edad, incluida la representacion de hombres negros y de personas mayores.
- Control de estilo realista mediante prompt y prompt negativo (el autor documenta un negativo largo orientado a eliminar el aspecto de CGI, plastico o "idol").
- Palabra gatillo `BETTERBR` para inducir el estilo del LoRA; su uso es opcional y el autor recomienda alternarlo.
- No soporta: generacion de figuras femeninas (fuera del dataset), tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo "thinking". Es un modelo puramente text-to-image.

## Casos de uso

- Prototipado de casting visual para publicidad: generar variaciones de retratos masculinos brasileños con aspecto creible para maquetas de campana, usando fuerza 0,75 y CFG 1.0, antes de contratar fotografia real.
- Ilustracion editorial de reportajes sobre Brasil o Latinoamerica: producir imagenes de tono documental (calle, luz natural, personas corriendo, trabajando o sentadas en un entorno urbano) que eviten el acabado de banco de imagenes.
- Investigacion sobre sesgos en modelos de difusion: el adaptador es un caso controlado para estudiar como un LoRA de 100+ imagenes desplaza la distribucion demografica de las salidas del modelo base y con que coste en calidad.
- Creacion de personajes consistentes en narrativa grafica o storyboards: combinando semilla fija, la palabra gatillo y descripciones de rasgos (barba, edad, tono de piel) para mantener un personaje masculino a lo largo de varias escenas.
- Pruebas de pipeline de generacion con modelos turbo en diffusers: validar integracion de adaptadores LoRA, barrido de escalas de fuerza (0,6-0,85) y su efecto sobre el realismo en un flujo de pocos pasos.
- Docencia y divulgacion: demostrar de forma practica que es un LoRA, como se aplica sobre un modelo base y por que un dataset pequeno y poco curado produce artefactos identificables (grano, sesgo hacia barba, fuga de la palabra gatillo como texto en la imagen).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, evaluaciones humanas, comparativas A/B) ni tiempos de inferencia medidos.

## Requisitos de hardware

- VRAM del adaptador: los pesos del LoRA ocupan aproximadamente 0,1 GB en disco; el coste en VRAM es marginal frente al modelo base.
- VRAM total: no disponible en la informacion proporcionada, ya que depende enteramente de `Tongyi-MAI/Z-Image-Turbo`, cuyas especificaciones no se documentan en esta ficha.
- GPU recomendadas: no disponibles. Al ser un modelo de difusion turbo con CFG 1.0 (sin classifier-free guidance clasico), cabria esperar requisitos moderados, pero no hay datos confirmados en la informacion disponible.
- Cabe en GPU de consumo: no confirmado. Requiere verificar los requisitos del modelo base.
- Despliegue: la libreria declarada es `diffusers`; la carga se realiza sobre el pipeline del modelo base aplicando el adaptador LoRA. Otras opciones (ComfyUI, Automatic1111, APIs de inferencia) no estan documentadas en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `olob0/...-lora-v1` (esta ficha) | Z-Image-Turbo | no disponible (adaptador LoRA) | no aplica | CC-BY-4.0 | Obsoleto segun el autor |
| `olob0/...-lora-v2` | Z-Image-Turbo | no disponible | no aplica | no disponible en la informacion | Version recomendada por el autor |
| Otros LoRAs de realismo etnico sobre Z-Image-Turbo | Z-Image-Turbo | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos publicados de rendimiento que permitan una comparacion cuantitativa con alternativas. La unica comparacion documentada es cualitativa: el propio autor declara la v1 como un entrenamiento experimental y recomienda migrar a la v2.

## Limitaciones y advertencias

- El dataset no incluye mujeres: el LoRA no debe usarse para generar retratos femeninos, y forzarlo producira resultados degradados o inconsistentes.
- Salidas con grano o ruido en algunas generaciones, segun reconoce el autor.
- Calidad del dataset limitada: entrenamiento experimental con 100+ imagenes, sin curacion documentada.
- Cobertura insuficiente de estilos y prompts: no se ha probado de forma intensiva fuera del retrato realista masculino.
- Fuga de la palabra gatillo: `BETTERBR` puede aparecer literalmente como texto o pie de foto dentro de la imagen generada.
- Sesgo hacia barba: tendencia a representar hombres con barba; requiere prompt negativo o instruccion explicita para evitarlo.
- Riesgo de alucinacion anatomica: como todo modelo de difusion, puede producir manos, proporciones o rostros deformados; el prompt negativo del autor incluye terminos para mitigarlo.
- Riesgo etico grave en el prompt negativo recomendado: la model card incluye terminos de exclusion de rasgos y nacionalidades del este y sudeste asiatico. Reutilizar ese negativo tal cual introduce un sesgo discriminatorio en las salidas y puede vulnerar politicas de contenido en entornos de produccion o plataformas de terceros. Se recomienda depurar ese negativo antes de cualquier uso publico.
- Inclusión de figuras politicas en el dataset: implica riesgo de generar representaciones de personas reales identificables, con las implicaciones legales y de derechos de imagen que ello conlleva (el propio dataset se describe como "customizado", sin detallar consentimiento).
- Licencia CC-BY-4.0: permite uso comercial y modificaciones, pero exige atribucion al autor (Gabriel Lobo) y no anade garantias; el uso del modelo base Z-Image-Turbo queda sujeto ademas a la licencia de dicho modelo, no documentada aqui.
- Modelo marcado como obsoleto por el autor: no recibira mantenimiento y existe una v2 publicada.
- Idiomas: solo se declara ingles; el comportamiento con prompts en portugues o castellano no esta verificado, pese a las etiquetas `portuguese` y `latam`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olob0/z-image-turbo-brazilian-male-realism-lora-v1
- Version v2 (recomendada por el autor): https://huggingface.co/olob0/z-image-turbo-brazilian-male-realism-lora-v2
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Pagina de apoyo del autor (Ko-fi): https://ko-fi.com/R6R0PGKEJ
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes (papers, blogs o repos) en la busqueda realizada; los resultados obtenidos no guardan relacion con el modelo.
