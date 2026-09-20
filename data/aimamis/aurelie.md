# AiMamis/Aurelie

## Resumen

Aurelie es un adaptador LoRA de generacion de imagenes texto-a-imagen publicado por el usuario AiMamis en HuggingFace. No es un modelo completo, sino un ajuste de bajo rango que se aplica sobre el modelo de difusion base krea/Krea-2-Turbo, al que anade la capacidad de reproducir un personaje femenino concreto definido por el prompt de instancia "Aurelie, Pale skin, Black hair with blunt bangs, Blue eyes".

El repositorio se distribuye en formato diffusers, ocupa 0,5 GB y esta publicado bajo licencia openrail++. La model card es minima: se limita a declarar el modelo base, la licencia, el prompt de instancia y las cuatro palabras de activacion (Aurelie, Pale skin, Black hair with blunt bangs, Blue eyes). No incluye informacion sobre el dataset de entrenamiento, el rango del adaptador, los modulos objetivo ni resultados de evaluacion.

Su relevancia es limitada y experimental: en la fecha de consulta acumula 0 descargas y 0 "me gusta", no tiene benchmarks publicados y la busqueda web realizada no ha devuelto ninguna fuente independiente que lo mencione. Resulta util, por tanto, como ejemplo de flujo de trabajo de personalizacion por LoRA sobre un modelo turbo, pero no como componente validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre un modelo de difusion texto-a-imagen; arquitectura del modelo base krea/Krea-2-Turbo no disponible |
| Parametros totales | no disponible (el repositorio completo ocupa 0,5 GB; el desglose de parametros del adaptador no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); limites de tokens del codificador de texto no disponibles |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; el prompt de instancia y las palabras de activacion estan en ingles |
| Licencia | openrail++ |
| Formato de pesos | no disponible en detalle; libreria declarada: diffusers |
| Modelo base | krea/Krea-2-Turbo |
| Pipeline | text-to-image |
| Prompt de instancia | Aurelie, Pale skin, Black hair with blunt bangs, Blue eyes |
| Palabras de activacion | Aurelie; Pale skin; Black hair with blunt bangs; Blue eyes |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

Aurelie es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyecta en capas del modelo base congelado para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es krea/Krea-2-Turbo, un modelo de difusion texto-a-imagen de la familia Krea; al tratarse de una variante "turbo", lo esperable es que este optimizado para generar en pocos pasos de muestreo, aunque no se dispone de la ficha tecnica del base dentro de la informacion proporcionada.

No hay ningun dato publicado sobre el proceso de entrenamiento: se desconoce el numero de imagenes empleado, su procedencia, si hubo regularizacion por clase, el rango y el alpha del adaptador, la tasa de aprendizaje, los modulos objetivo (atencion cruzada, atencion propia o bloques de proyeccion) ni el numero de pasos. Tampoco se documenta si se aplicaron tecnicas adicionales como captions automaticos, DreamBooth o ajuste de text encoder. La unica informacion operativa son las palabras de activacion, que describen atributos fisicos concretos (piel palida, pelo negro con flequillo recto, ojos azules), lo que sugiere un entrenamiento centrado en identidad y apariencia mas que en estilos genericos.

## Capacidades

- Generacion de imagenes texto-a-imagen de un personaje femenino con apariencia consistente, condicionada por las palabras de activacion.
- Control de atributos fisicos especificos mediante prompts fragmentados: "Pale skin", "Black hair with blunt bangs" y "Blue eyes" pueden invocarse por separado.
- Composicion de escenas: al ser un LoRA sobre un modelo de difusion generalista, hereda la capacidad del base de generar fondos, iluminacion y estilos, siempre que el base los soporte.
- Integracion en pipelines diffusers mediante la carga del adaptador sobre el modelo base.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues: no documentadas; el prompt de instancia esta en ingles y no hay evidencia de soporte para otros idiomas.
- Capacidades especiales (modo "thinking", vision, audio): no aplica.
- Consistencia de personaje entre generaciones: es el objetivo declarado del adaptador, aunque no se aportan metricas de similitud facial que lo cuantifiquen.

## Casos de uso

- Ilustracion de personaje recurrente para comic o webtoon: el adaptador permite mantener rasgos estables (piel palida, flequillo recto, ojos azules) a lo largo de varias vinetas, invocando siempre el mismo conjunto de palabras de activacion. Es adecuado porque evita reentrenar el modelo base para cada personaje.
- Creacion de avatares y retratos para redes sociales o portfolios: se generan retratos del personaje en distintos estilos y encuadres con un coste de inferencia bajo, ya que el LoRA solo anade un conjunto reducido de pesos sobre el base.
- Concept art en preproduccion audiovisual: el equipo puede explorar variaciones de vestuario, epoca y ambientacion del personaje antes de fijar el diseno definitivo, aprovechando que el modelo base aporta la variedad de estilos.
- Assets para novela visual o videojuego narrativo: generacion de expresiones y poses del personaje para sprites o ilustraciones de dialogo, sustituyendo sesiones de fotografia o encargos de ilustracion en fases de prototipado.
- Pruebas de prompt engineering y evaluacion de LoRAs: sirve como caso de estudio para medir como responde un adaptador de identidad sobre un modelo turbo, comparando con el base sin adaptador.
- Prototipado de merchandising: generacion de mockups de camisetas, posters o tarjetas con el personaje antes de encargar arte final.
- Generacion de datos sinteticos para experimentacion en vision por computador: util para probar pipelines de deteccion o segmentacion, siempre que se respete la licencia y se evite el uso de imagenes de personas reales sin consentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, similitud facial, ni comparaciones cuantitativas con otros adaptadores. Tampoco se documentan tiempos de inferencia ni numero de pasos de muestreo recomendado.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de VRAM vienen determinados por el modelo base krea/Krea-2-Turbo, cuyas especificaciones no se incluyen en la informacion disponible; no es posible dar cifras exactas.
- Tamano del adaptador: el repositorio ocupa 0,5 GB, un peso despreciable frente al modelo base.
- GPU recomendadas: no disponible. La idoneidad de tarjetas consumer (por ejemplo, RTX 3060, 4070, 4090) depende del modelo base y de la precision empleada, dato no publicado.
- Cabe en GPU consumer: no confirmado, condicionado al modelo base.
- Opciones de despliegue: al estar etiquetado como diffusers, la via natural es la libreria diffusers de HuggingFace, cargando el LoRA sobre el base. La compatibilidad con ComfyUI, Automatic1111/Forge, InvokeAI o interfaces similares depende de que dichas herramientas soporten el modelo base, extremo no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion proporcionada. La busqueda web realizada no devolvio resultados relacionados con el modelo. Como referencia estructural, la comparacion relevante seria contra el propio modelo base sin adaptador y contra otros LoRAs de identidad sobre el mismo base, pero no hay datos publicos de ninguno de ellos en este contexto.

| Modelo | Tipo | Parametros | Contexto | Licencia | Datos publicados |
|---|---|---|---|---|---|
| Aurelie (AiMamis) | LoRA sobre krea/Krea-2-Turbo | no disponible (repo de 0,5 GB) | no aplica | openrail++ | solo palabras de activacion |
| krea/Krea-2-Turbo | Modelo de difusion texto-a-imagen | no disponible | no aplica | no disponible en esta ficha | no consultados |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Adopcion nula: 0 descargas y 0 "me gusta" en el momento de la consulta; no existe validacion por parte de la comunidad.
- Documentacion insuficiente: la model card no describe el dataset, el metodo de entrenamiento ni las condiciones de uso recomendadas, lo que impide auditar sesgos o procedencia de los datos.
- Riesgo de sesgo: al entrenarse sobre un unico sujeto o conjunto reducido de imagenes, es probable que el adaptador reproduzca un ideal de belleza y unos rasgos muy concretos, con poca diversidad de tonos de piel, edades o complexiones. No hay datos que permitan cuantificarlo.
- Sobreajuste y sensibilidad al prompt: es habitual que los LoRAs de identidad se degraden cuando se alteran las palabras de activacion o se combinan con otros conceptos; no se documentan pruebas al respecto.
- Artefactos visuales: posibles errores anatomicos, en manos y ojos, propios de los modelos de difusion, sin que se hayan publicado evaluaciones especificas.
- Limitaciones de idioma: prompt de instancia en ingles, sin evidencia de soporte multilingue.
- Restricciones de licencia: openrail++ permite uso comercial, pero impone restricciones de uso recogidas en el anexo de la licencia (prohibicion de usos ilegales, daninos, de vigilancia o de desinformacion, entre otros) y obliga a propagar la licencia y sus restricciones a los usuarios posteriores. Es responsabilidad del integrador revisar el texto completo antes de desplegar el modelo en un producto.
- Riesgo de suplantacion de identidad: si el personaje "Aurelie" reproduce los rasgos de una persona real, la generacion y difusion de su imagen puede vulnerar derechos de imagen; no se aporta informacion sobre el origen del sujeto.
- Fecha de publicacion muy reciente (2026-09-19, misma fecha de creacion y actualizacion): no ha habido ciclo de mantenimiento ni correcciones posteriores.
- Ausencia de garantias: no se especifican versiones de las librerias necesarias, ni pesos alternativos, ni ficheros de configuracion documentados mas alla del arbol de ficheros del repositorio.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/AiMamis/Aurelie
- Ficheros y versiones: https://huggingface.co/AiMamis/Aurelie/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Perfil del autor: https://huggingface.co/AiMamis
- Texto completo de la licencia openrail++: no se ha localizado un enlace directo en la informacion proporcionada; debe consultarse el apartado de licencia del repositorio.
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con este modelo.
