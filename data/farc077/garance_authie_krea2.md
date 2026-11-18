# farc077/Garance_Authie_KREA2

## Resumen

Garance_Authie_KREA2 es un adaptador LoRA de tipo text-to-image entrenado sobre el modelo base Krea-2-Raw (krea/Krea-2-Raw). Lo publica el usuario farc077 en Hugging Face y su proposito es reproducir la identidad visual de una persona concreta, Garance Authie, a partir de una unica referencia, segun la tecnica que el autor etiqueta como ONESHOTLORA y que atribuye al servicio oneshotlora.com. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo.

El modelo resuelve un problema acotado: fijar un rostro y un estilo de persona en un pipeline de generacion de imagenes ya existente, de forma que el modelo base siga aportando la calidad fotografica y el LoRA aporte la identidad. Es relevante para flujos de creacion de personajes consistentes (influencers sinteticos, storyboards, avatares) porque permite cambiar vestuario, escenario y pose manteniendo el parecido, tal y como muestran los ejemplos de la model card con prompts de oficina, campo y exterior.

La informacion publicada es escasa: no hay ficha tecnica de arquitectura, no se declaran idiomas, no hay benchmarks y la licencia figura como "other" sin texto adicional. Cualquier evaluacion en produccion debe partir de esas limitaciones y de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea-2-Raw; arquitectura del base no disponible |
| Parametros totales | no disponible (repo de 0,2 GB, compatible con un adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado) |
| Formato de pesos | no disponible (repo de 0,2 GB; el tag indica LoRA) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Krea-2-Raw para especializarlo. El autor no detalla en que modulos se aplica el adaptador, ni el rango, ni el alpha, ni el optimizador, ni el numero de pasos. La unica indicacion metodologica es que se genero con oneshotlora.com y que la etiqueta del modelo es ONESHOTLORA, lo que sugiere un entrenamiento a partir de muy pocas imagenes de referencia de la persona.

No se publican datos sobre el dataset de entrenamiento (numero de imagenes, resolucion, proceso de captioning), ni sobre regularizacion, ni sobre si se uso algun tipo de aumento de datos. Tampoco hay informacion sobre el entrenamiento del modelo base Krea-2-Raw. La unica innovacion declarada es el propio flujo one-shot, que busca capturar identidad con una sola referencia; no hay evidencia publicada en el repositorio que permita verificar su robustez.

## Capacidades

- Generacion de imagenes fotorrealistas de una persona concreta (Garance Authie) condicionada por prompts de texto.
- Control de vestuario y escenario mediante lenguaje natural, segun los ejemplos de la model card (camisa blanca formal con blazer negro en oficina; vestido rosa pastel con cardigan azul en un campo; camiseta blanca con vaqueros ante una pared).
- Control de pose y encuadre de forma implicita a traves del prompt ("sentada", "de pie", "mirando a la camara").
- Transferencia de identidad sobre el estilo del modelo base Krea-2-Raw.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio; es un modelo exclusivamente text-to-image.
- Capacidades multilingues: no disponibles; no se especifica que idiomas entiende el prompt.
- Palabra de activacion documentada: G4R4NC34.

## Casos de uso

- Creacion de personajes consistentes para contenido editorial: usar el trigger G4R4NC34 junto con descripciones de vestuario y localizacion para generar una serie de imagenes de la misma persona en distintos articulos o numeros de una publicacion.
- Prototipado de influencers sinteticos: generar un catalogo de imagenes de estilo de vida (oficina, exterior, campo) manteniendo el rostro estable entre publicaciones, con revision humana antes de publicar.
- Storyboards y previsualizacion audiovisual: producir fotogramas de referencia de un personaje concreto para presentar a direccion antes de rodar, cambiando escenario y vestuario mediante prompt.
- Pruebas de concepto de moda o estilismo: variar prendas y paletas de color sobre la misma identidad para evaluar combinaciones sin sesion fotografica.
- Generacion de avatares y material de marca para entornos controlados: crear un banco de imagenes de una persona ficticia con apariencia coherente para webs o campanas internas.
- Investigacion sobre LoRA one-shot: usar el adaptador como caso de estudio para medir deriva de identidad, sensibilidad al trigger y fidelidad al prompt en comparacion con LoRAs entrenados con mas datos.
- Integracion en pipelines ComfyUI: los ejemplos de la model card estan generados en ComfyUI, por lo que encaja en flujos nodales con el modelo base Krea-2-Raw cargado y el LoRA aplicado como capa adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende enteramente del modelo base Krea-2-Raw, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: ComfyUI es el entorno usado en los ejemplos de la model card; para el resto de backends (diffusers, vLLM, TGI) no hay informacion especifica de este LoRA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Garance_Authie_KREA2 | LoRA sobre Krea-2-Raw | no disponible (repo 0,2 GB) | no aplica | other | Hugging Face, 0 descargas, 0 likes |
| Krea-2-Raw | Modelo base text-to-image | no disponible | no aplica | no disponible | Hugging Face (krea/Krea-2-Raw) |
| Otros LoRA de identidad sobre Krea-2-Raw | LoRA | no disponible | no aplica | variable | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento ni de alternativas comparables verificadas en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion tecnica muy escasa: no hay ficha de arquitectura, rango, alpha, dataset ni proceso de entrenamiento, lo que impide evaluar su calidad de forma objetiva.
- Licencia "other" sin texto publicado: no se puede confirmar si se permite uso comercial; hay que consultar la licencia del modelo base Krea-2-Raw y la del servicio oneshotlora.com antes de cualquier despliegue.
- Riesgo de alucinacion visual y deriva de identidad: al ser un LoRA one-shot, es probable que el parecido se degrade con prompts alejados de los ejemplos de la model card (poses extremas, iluminacion dura, angulos poco frecuentes); no hay evidencia publicada que lo cuantifique.
- Sesgos: no se documentan sesgos demograficos, de genero ni de representacion; al entrenarse sobre una persona concreta, el adaptador puede reproducir sus rasgos y estilo de forma muy literal.
- Uso sobre personas reales: el modelo reproduce la imagen de una persona identificable; el autor declara que el usuario es el unico responsable del cumplimiento legal, lo que incluye derechos de imagen y normativa aplicable.
- Idiomas: se desconoce si el prompt funciona igual en castellano que en ingles; los ejemplos publicados estan en ingles.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Sin garantias de mantenimiento: el autor no publica roadmap, issues ni versionado.

## Enlaces

- Hugging Face: https://huggingface.co/farc077/Garance_Authie_KREA2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Servicio de entrenamiento citado por el autor: https://oneshotlora.com
