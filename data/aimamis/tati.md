# AiMamis/Tati

## Resumen

Tati es un adaptador LoRA de generacion de imagenes texto-a-imagen publicado por el usuario AiMamis en HuggingFace. El adaptador se entrena sobre el modelo base krea/Krea-2-Turbo y esta etiquetado con la plantilla oficial `template:diffusion-lora` del ecosistema diffusers, lo que indica que su uso previsto es la inferencia con la libreria diffusers de HuggingFace. El repositorio ocupa 0,5 GB e incluye pesos del adaptador y material grafico de ejemplo (galeria) segun la estructura habitual de este tipo de publicaciones.

El modelo resuelve un problema muy concreto: la generacion consistente de un personaje concreto (una figura femenina asociada a las palabras de activacion `Tati`, `Platinum blonde hair` y `Green eyes`). No es un modelo de lenguaje ni un modelo fundacional, sino un ajuste ligero que se acopla a un modelo de difusion ya existente para especializarlo en un sujeto concreto sin reentrenar el modelo completo. Esto lo hace interesante para flujos de trabajo donde la consistencia de identidad visual entre multiples imagenes es un requisito.

La relevancia de esta ficha es limitada en terminos de impacto tecnico: se trata de una publicacion con 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks, sin informacion sobre el dataset de entrenamiento, sin hiperparametros declarados y sin model card mas alla de las palabras de activacion y las instrucciones de descarga. La informacion publica disponible es, por tanto, minima, y esta ficha refleja esa limitacion de forma explicita en lugar de rellenar los huecos con suposiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion texto-a-imagen (plantilla `diffusion-lora`); arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (depende del codificador de texto del modelo base, no especificado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las palabras de activacion y los prompts de ejemplo estan en ingles) |
| Licencia | openrail++ |
| Formato de pesos | no disponible de forma explicita; el repositorio usa la libreria diffusers y ocupa 0,5 GB en total |
| Pipeline | text-to-image |
| Modelo base | krea/Krea-2-Turbo |
| Palabras de activacion | `Tati`, `Platinum blonde hair`, `Green eyes` |
| Autor | AiMamis |
| ID en HuggingFace | AiMamis/Tati |
| Descargas | 0 |
| Likes | 0 |
| Region declarada | us |
| Fecha de creacion | 2026-09-19T18:20:59Z |
| Fecha de actualizacion | 2026-09-19T18:21:31Z (32 segundos despues de la creacion) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (Low-Rank Adaptation) aplicado sobre el modelo de difusion krea/Krea-2-Turbo. La tecnica LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en capas seleccionadas, de modo que el adaptador aprende una especializacion concreta con un coste de almacenamiento muy inferior al de un ajuste completo. La etiqueta `template:diffusion-lora` confirma que el artefacto esta empaquetado para su carga mediante `PeftModel` / `DiffusionPipeline` en diffusers. La model card no especifica en que modulos (atencion, proyecciones, etc.) se han insertado las matrices, ni el rango o el alpha empleados.

No hay informacion publica sobre el proceso de entrenamiento: se desconoce el numero de imagenes del dataset, su composicion, la resolucion de entrenamiento, el numero de pasos, la tasa de aprendizaje, el optimizador ni si se aplicaron tecnicas adicionales como regularizacion por clase o aumento de datos. Tampoco se documenta si el adaptador usa un token unico para el sujeto o si depende exclusivamente de las tres palabras de activacion declaradas. El unico dato operativo que ofrece el autor es el conjunto de triggers (`Tati`, `Platinum blonde hair`, `Green eyes`) que deben incluirse en el prompt para activar el concepto aprendido.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por prompt, heredando las capacidades del modelo base krea/Krea-2-Turbo.
- Especializacion en un sujeto concreto: el adaptador aplica el concepto asociado al token `Tati` para reproducir un personaje consistente entre generaciones.
- Control de atributos de apariencia mediante triggers adicionales: `Platinum blonde hair` y `Green eyes` permiten reforzar dos rasgos fisicos concretos declarados por el autor.
- Composicion de prompts combinando los triggers con descripciones de escena, iluminacion, estilo o encuadre, segun el comportamiento estandar de un LoRA de difusion.
- Compatibilidad con el ecosistema diffusers para carga del adaptador sobre el modelo base.
- No hay evidencia en la informacion disponible de soporte de image-to-image, inpainting, ControlNet, tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. Estas capacidades no aplican o no estan documentadas para este artefacto.
- No se documentan capacidades multilingues; los prompts de ejemplo estan redactados en ingles.

## Casos de uso

- Generacion de personaje consistente para narrativa visual: usar el trigger `Tati` junto con descripciones de escena para producir un conjunto de ilustraciones donde el personaje mantiene rasgos reconocibles entre viñetas, util en comic, storyboard o novela grafica.
- Creacion de avatares para prototipos de videojuego o aplicacion: generar variaciones de retrato del mismo personaje con distintas expresiones, planos e iluminaciones para rellenar una ficha de personaje sin encargar arte externo.
- Previsualizacion de casting o direccion de arte: producir referencias visuales rapidas de un personaje concreto antes de contratar fotografia o ilustracion profesional, usando los triggers de color de pelo y ojos para fijar los rasgos.
- Generacion de material para campanas de marca ficticias o proyectos personales: crear piezas coherentes entre si (posts, banners, portadas) donde el mismo sujeto aparece en distintos contextos.
- Ampliacion de datasets de entrenamiento: usar el adaptador para generar imagenes sinteticas de un personaje y emplearlas como datos adicionales en el entrenamiento de un segundo modelo o adaptador, siempre que la licencia openrail++ lo permita para el uso previsto.
- Pruebas de concepto de producto o merchandising: generar mockups donde el personaje aparece asociado a prendas, objetos o escenarios para validar una idea antes de invertir en produccion.
- Experimentacion artistica y edicion personal: explorar variaciones de estilo sobre un mismo sujeto variando el prompt de estilo, el sampler o la escala de condicionamiento, sin alterar el concepto aprendido.
- Investigacion sobre LoRA en difusion: servir como caso de estudio de un adaptador publicado con documentacion minima, util para analizar como la ausencia de hiperparametros y de datos de entrenamiento dificulta la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de identidad, evaluacion humana) ni comparaciones con otros adaptadores. Tampoco se han encontrado resultados en la busqueda web realizada, cuyos enlaces devueltos no guardan ninguna relacion con el modelo (foros de discusion sobre temas no relacionados con IA).

## Requisitos de hardware

- El adaptador LoRA en si ocupa una fraccion del repositorio de 0,5 GB; el peso real de las matrices de bajo rango no se detalla en la informacion disponible.
- La VRAM necesaria para inferencia viene determinada principalmente por el modelo base krea/Krea-2-Turbo, cuyas especificaciones no se proporcionan en la informacion consultada. No es posible dar una cifra fiable de VRAM sin ese dato.
- Como referencia general para adaptadores LoRA de difusion sobre modelos de la familia de difusion latente, la inferencia suele requerir entre 6 y 16 GB de VRAM en funcion de la resolucion de salida, el tipo de precision y si se aplican tecnicas de ahorro de memoria; esta horquilla es orientativa y no esta confirmada para este modelo concreto.
- GPU recomendadas: no disponible para el modelo base. En el caso de modelos de difusion comparables, se suelen emplear RTX 3060/4060 Ti (12-16 GB) para resoluciones moderadas y A100, H100 o RTX 4090 para lotes grandes o resoluciones altas.
- Viabilidad en GPU de consumo: no confirmada en la informacion disponible; depende del modelo base y de la precision de carga.
- Opciones de despliegue: diffusers es la libreria declarada en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso son herramientas orientadas a modelos de lenguaje y no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados que permitan una comparativa cuantitativa. La tabla siguiente compara el enfoque de este artefacto con alternativas metodologicas de la misma categoria, sin atribuir cifras que no esten documentadas.

| Criterio | AiMamis/Tati (LoRA) | Ajuste completo del modelo base | Generacion con el modelo base sin adaptador |
|---|---|---|---|
| Parametros entrenables | no disponible (subconjunto de bajo rango del modelo base) | todos los del modelo base | ninguno |
| Tamano del artefacto | 0,5 GB (repositorio completo) | del orden del modelo base | no aplica |
| Consistencia de identidad | objetivo declarado del adaptador, sin metrica publicada | no disponible | no disponible |
| Licencia | openrail++ | la del modelo base | la del modelo base |
| Coste de entrenamiento | bajo por diseno (LoRA) | alto | nulo |
| Reproducibilidad | baja: sin dataset, hiperparametros ni semilla documentados | no aplica | alta |
| Disponibilidad | publico en HuggingFace con 0 descargas | — | publico |

## Limitaciones y advertencias

- Documentacion minima: la model card solo indica las palabras de activacion y como descargar el modelo. No hay informacion sobre dataset, hiperparametros, rango del LoRA, pasos de entrenamiento ni evaluacion.
- No se han publicado benchmarks ni evaluaciones cualitativas, por lo que no hay evidencia objetiva de la calidad o fidelidad del concepto aprendido mas alla de las imagenes de ejemplo del autor.
- Riesgo de sobreajuste al dataset de entrenamiento: al no documentarse la composicion de los datos, el adaptador puede reproducir sesgos de pose, encuadre, iluminacion o estilo presentes en las imagenes originales.
- Sesgos conocidos: no disponibles. No se documenta la diversidad del dataset en cuanto a etnia, edad, complexion, contexto cultural o representacion de genero.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta (manos, dedos, ojos), texto ilegible y artefactos en composiciones complejas; la magnitud de este problema no esta medida para este adaptador.
- Limitaciones de idioma: no se documentan idiomas soportados. Las palabras de activacion estan en ingles, por lo que prompts en otros idiomas pueden reducir la activacion del concepto.
- Dependencia del modelo base: cualquier cambio, retirada o modificacion de licencia de krea/Krea-2-Turbo afecta directamente a la usabilidad del adaptador.
- Licencia openrail++: es una licencia con clausulas de uso aceptable que restringen determinados usos. Antes de un despliegue comercial es obligatorio revisar el texto completo de la licencia y comprobar que el modelo base impone condiciones adicionales que prevalezcan.
- Uso comercial: no confirmado de forma explicita en la informacion disponible; la licencia openrail++ permite ciertos usos comerciales sujetos a condiciones, pero debe verificarse caso por caso.
- Consideraciones legales sobre imagen de personas: si el personaje representa a una persona real identificable, la generacion y difusion de su imagen puede requerir consentimiento y entra en conflicto con las clausulas de uso aceptable de la licencia, independientemente de lo que permita la licencia del artefacto.
- Madurez del repositorio: 0 descargas, 0 likes y una actualizacion 32 segundos posterior a la creacion indican una publicacion sin validacion por parte de la comunidad.
- Aviso de fiabilidad de la busqueda web: los enlaces devueltos por la busqueda no tienen relacion con el modelo ni aportan informacion tecnica; no se han utilizado como fuente.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/AiMamis/Tati
- Archivos del repositorio: https://huggingface.co/AiMamis/Tati/tree/main
- Modelo base declarado: https://huggingface.co/krea/Krea-2-Turbo
- Paper, blog tecnico, repositorio de codigo o demo: no disponible en la informacion proporcionada.
- Resultados de busqueda web: no relevantes (enlaces a foros de discusion sin relacion con el modelo).
