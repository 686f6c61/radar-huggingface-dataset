# bumblebeeman/runa-toon-core

## Resumen

runa-toon-core es un adaptador LoRA de personaje publicado por el usuario bumblebeeman (Robert Kryjak) en HuggingFace. No es un modelo de lenguaje ni un modelo fundacional: es un ajuste de bajo rango pensado para generar de forma consistente al personaje de ficción "Runa", una figura de dibujo animado para adultos. Se activa mediante la palabra clave `runaig` y se entrena sobre el modelo de difusión Krea 2 RAW, con la intención declarada de usarse en inferencia sobre Krea 2 Turbo o dark-beast-krea2.

El adaptador se entrenó con musubi-tuner sobre un conjunto de datos explícitamente SFW de solo 36 imágenes, con rango/alpha 32 y detenido en la época 26 de 30. El repositorio ocupa 0,5 GB y, en el momento de la consulta, acumula 0 descargas y 0 "likes", por lo que se trata de una publicación reciente y sin validación comunitaria todavía.

Su relevancia es acotada y muy específica: sirve como pieza de un pipeline de generación de imágenes para mantener la identidad de un personaje entre generaciones, y como caso de estudio de entrenamiento de LoRAs de personaje con datasets mínimos. No aporta mejoras medibles en tareas de lenguaje, razonamiento o código, y no se ha publicado ninguna evaluación cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango sobre el modelo de difusion Krea 2 (arquitectura interna del modelo base: no disponible) |
| Parametros totales | no disponible (adaptador con rango/alpha 32; repositorio de 0,5 GB) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (terminos concretos no detallados en la model card) |
| Formato de pesos | no disponible |
| Modelo base | krea/Krea-2-Raw; inferencia prevista sobre Krea 2 Turbo / dark-beast-krea2 |
| Rango / alpha | 32 |
| Palabra de activacion | runaig |
| Epoca de entrenamiento | 26 de 30 |
| Datos de entrenamiento | 36 imagenes, solo SFW |
| Herramienta de entrenamiento | musubi-tuner |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un LoRA de personaje, es decir, un conjunto de matrices de adaptacion de bajo rango inyectadas en las capas del modelo base de difusion Krea 2 RAW. El entrenamiento se realizo con musubi-tuner, con rango y alpha fijados en 32, y se detuvo en la epoca 26 de 30, por lo que el adaptador no corresponde a un entrenamiento completado hasta la ultima epoca prevista.

El dataset de entrenamiento consta de 36 imagenes etiquetadas como SFW y asociadas a la palabra de activacion `runaig`. No se especifican en la informacion disponible la composicion exacta del dataset (variedad de poses, fondos, resoluciones o estilo), la resolucion de entrenamiento, la tasa de aprendizaje, el optimizador ni si se aplicaron tecnicas adicionales como regularizacion por caption dropout o entrenamiento con imagenes de clase. Tampoco se detalla la arquitectura interna del modelo base Krea 2 ni su procedimiento de entrenamiento. No se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de imagenes de un unico personaje ficticio ("Runa") con identidad visual consistente, activada mediante la palabra clave `runaig`.
- Estilo cartoon orientado a personaje de animacion para adultos, segun la etiqueta `cartoon` del repositorio.
- Composicion con el modelo base Krea 2 RAW y con los modelos indicados para inferencia (Krea 2 Turbo, dark-beast-krea2).
- Capacidad de condicionamiento por prompt de texto heredada del modelo base; el LoRA solo aporta el sesgo de identidad del personaje.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: son capacidades no aplicables a un adaptador de difusion.
- No se documentan capacidades multilingues ni idiomas soportados.

## Casos de uso

- Webcomic o tira seriada con personaje recurrente: usando `runaig` en cada prompt, el adaptador fija los rasgos faciales, la paleta y las proporciones del personaje, lo que reduce la deriva visual entre viñetas generadas en sesiones distintas.
- Storyboard y animatica: generar planos rapidos del personaje en distintas poses, angulos y escenarios para previsualizar una escena antes de producirla con arte final.
- Diseno de personaje para prototipos de videojuego o serie animada: producir variaciones de vestuario, expresion y atrezzo manteniendo la identidad base, como material de exploracion para direccion de arte.
- Assets para redes sociales o comunicacion de marca: crear ilustraciones de una mascota corporativa con estilo cartoon coherente a lo largo de una campana.
- Produccion integrada en un pipeline local de difusion: encadenar el LoRA sobre Krea 2 Turbo junto con otros adaptadores compatibles con el mismo modelo base para controlar estilo e identidad en un flujo reproducible.
- Investigacion sobre entrenamiento de LoRAs de personaje: caso de estudio con dataset muy reducido (36 imagenes) y rango 32, util para comparar estrategias de regularizacion y sobreajuste en adaptadores de difusion.
- Generacion de material de referencia para ilustracion editorial o merchandising: hojas de personaje y bocetos de producto a partir de los cuales un ilustrador trabaja manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de FID, CLIP score, similitud de personaje, consistencia entre semillas ni comparaciones cuantitativas con otros LoRAs de personaje. La model card no incluye imagenes de ejemplo, curvas de perdida ni metricas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El consumo lo determina integramente el modelo base Krea 2, cuyos requisitos no se documentan en la informacion proporcionada; el adaptador anade aproximadamente 0,5 GB de pesos sobre el modelo base.
- GPU recomendadas: no disponible. No se puede estimar sin conocer el tamano y la precision del modelo base.
- Compatibilidad con GPU de consumo: no disponible por el mismo motivo; depende de si el modelo base cabe cuantizado en la VRAM disponible.
- Opciones de despliegue: la model card solo menciona musubi-tuner, y lo hace en el contexto del entrenamiento. No se especifican herramientas de inferencia (ComfyUI, Diffusers, Automatic1111 u otras) ni pasos de carga del adaptador.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Dataset | Rango/alpha | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| runa-toon-core (bumblebeeman) | LoRA de personaje | krea/Krea-2-Raw | 36 imagenes SFW, epoca 26/30 | 32 | other | Publico en HuggingFace, 0 descargas |
| Runa (bumblebeeman) | Adaptador del mismo autor | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace |
| Otros LoRAs de personaje sobre Krea 2 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de terceros comparables en la informacion proporcionada. La unica referencia cercana es el modelo Runa del mismo autor, del que no se detallan especificaciones, por lo que no es posible establecer una comparacion tecnica rigurosa.

## Limitaciones y advertencias

- Dataset muy reducido: 36 imagenes es un volumen bajo para un LoRA de personaje, con riesgo alto de sobreajuste a las poses, fondos e iluminaciones concretas del conjunto de entrenamiento.
- Entrenamiento incompleto: se publica la epoca 26 de 30, de modo que el adaptador no refleja el punto final previsto por el autor.
- Requiere la palabra de activacion `runaig`: sin ella no se garantiza la aparicion del personaje, y su uso junto a otros conceptos puede degradar la consistencia.
- Cobertura tematica restringida: los datos son exclusivamente SFW, por lo que el comportamiento fuera de ese dominio no esta caracterizado ni respaldado.
- Sesgos: no se han documentado evaluaciones de sesgo, diversidad de representacion ni comportamiento del personaje en contextos no presentes en el dataset.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, textos ilegibles, artefactos en manos y ojos, y atributos incoherentes del personaje, especialmente en composiciones complejas o con varios sujetos.
- Idiomas: no se especifica que idiomas acepta el codificador de texto del modelo base ni en que idioma se escribieron las leyendas de entrenamiento; no hay garantia de que los prompts en castellano rindan igual que en otro idioma.
- Licencia "other": los terminos no estan detallados en la model card, por lo que el uso comercial no puede darse por permitido. Es imprescindible revisar la licencia del modelo base Krea 2 RAW, que condiciona la del adaptador.
- Trazabilidad nula: 0 descargas y 0 likes en el momento de la consulta, sin ejemplos publicados, sin evaluacion independiente y sin historial de uso en produccion.
- Riesgo de uso indebido: se trata de un personaje descrito como propio de animacion para adultos, por lo que conviene restringir su uso a contextos que respeten la legislacion aplicable sobre contenido generado y derechos de terceros.
- Ausencia de garantias de rendimiento: sin benchmarks ni imagenes de referencia no es posible estimar la calidad real del adaptador antes de probarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bumblebeeman/runa-toon-core
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Otro modelo del mismo autor: https://huggingface.co/bumblebeeman/Runa
- Perfil del autor: https://huggingface.co/bumblebeeman
- Ficha de terceros sobre Runa: https://free2aitools.com/model/bumblebeeman/runa
- Herramienta de entrenamiento mencionada (musubi-tuner): no se ha encontrado enlace en la busqueda web
- Modelos de inferencia mencionados (Krea 2 Turbo, dark-beast-krea2): no se han encontrado enlaces en la busqueda web
- Resultados de busqueda no relacionados con este modelo y por tanto omitidos: https://llmrun.dev/ , https://llm-stats.com/leaderboards/llm-leaderboard
