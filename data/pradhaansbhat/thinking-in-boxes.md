# pradhaansbhat/Thinking-In-Boxes

## Resumen

Thinking-In-Boxes es un adaptador LoRA de edicion de imagen (image-to-image) entrenado sobre el modelo base black-forest-labs/FLUX.1-Kontext-dev. Lo desarrolla Pradhaan S Bhat y colaboradores de Indian Institute of Science, Apple, UIUC y Johns Hopkins University, y se presenta como parte del trabajo "Thinking in Boxes: 3D Editing in Real Images Made Easy" (referencia arXiv 2606.20556, etiquetado como NeurIPS-2026). El repositorio contiene unicamente el LoRA entrenado, no un modelo completo: el adaptador se carga sobre FLUX.1-Kontext-dev mediante la libreria diffusers.

El problema que aborda es la edicion geometrica 3D sobre imagenes reales: trasladar, rotar y escalar objetos, y cambiar el punto de vista de la escena, conservando la identidad de la escena y del objeto y recuperando regiones del objeto que no eran visibles en la imagen original. La innovacion de interaccion es una representacion por cajas ("box") en la que cada cara de la caja lleva un codigo de color que indica la orientacion 3D, de modo que el usuario controla la transformacion de forma intuitiva y granular en lugar de depender solo de una instruccion textual.

Es relevante ahora porque la edicion generativa de imagen esta pasando de retoques puramente 2D a manipulaciones con conciencia de la geometria y del punto de vista, un paso necesario para produccion de assets, sintesis de datos y flujos de trabajo de 3D sobre fotografias reales. El modelo se distribuye bajo licencia CC-BY-4.0, solo declara soporte de ingles, esta registrado como pipeline image-to-image, tiene licencia declarada CC-BY-4.0 y, en el momento de la consulta, el repositorio no registraba descargas ni "likes" y ocupaba 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre FLUX.1-Kontext-dev, modelo de difusion de imagen a imagen; arquitectura interna del adaptador no disponible |
| Parametros totales | No disponible (el repositorio publica un adaptador LoRA; no se detallan rango, dimensiones ni numero de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 (sujeta ademas a la licencia del modelo base FLUX.1-Kontext-dev) |
| Formato de pesos | No disponible (libreria declarada: diffusers) |
| Modelo base | black-forest-labs/FLUX.1-Kontext-dev |
| Tipo de tarea | image-to-image (edicion geometrica / 3D) |
| Dataset de entrenamiento | pradhaansbhat/Thinking-In-Boxes |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-09-29 |
| Ultima actualizacion | 2026-09-29 |
| Resolucion de imagen soportada | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura publicada no es un transformer completo, sino un LoRA: un conjunto de adaptadores de bajo rango que se inyectan en las capas del modelo base FLUX.1-Kontext-dev y que se cargan por encima de este en el momento de la inferencia. El modelo base es un modelo de difusion de imagen a imagen de black-forest-labs; el repositorio de Thinking-In-Boxes no documenta su arquitectura interna, su numero de parametros ni su configuracion de atencion, por lo que esos datos figuran como no disponibles. Tampoco se especifica el rango del LoRA, los modulos objetivo ni la semilla de entrenamiento.

El entrenamiento se realiza sobre el dataset Thinking-In-Boxes, publicado por los mismos autores. La model card indica que los detalles de entrenamiento (numero de pasos, tokens, composicion del dataset, si hubo etapas de ajuste con preferencias humanas como RLHF o DPO) estan en la seccion suplementaria del articulo, no en el repositorio de HuggingFace, por lo que no se reproducen aqui. La innovacion tecnica destacable no es un mecanismo de atencion nuevo, sino la representacion de control: cada objeto se representa mediante una caja cuyas caras estan codificadas por color para transmitir la orientacion 3D, lo que permite condicionar traslacion, rotacion, escalado y cambios de punto de vista manteniendo la identidad de escena y objeto y reconstruyendo regiones previamente no observadas.

## Capacidades

- Edicion de imagen a imagen sobre fotografias reales, condicionada por el modelo base FLUX.1-Kontext-dev.
- Edicion geometrica explicita: traslacion, rotacion, escalado y cambios de punto de vista de objetos dentro de la escena.
- Control mediante cajas con caras codificadas por color para expresar la orientacion 3D de la transformacion solicitada.
- Preservacion de la identidad de la escena y del objeto editado, segun la descripcion del proyecto.
- Recuperacion de regiones del objeto que no eran visibles en la imagen de entrada (sintesis de partes ocluidas).
- Interaccion orientada a control granular, segun la linea de investigacion del autor (interfaces que permiten control fino sobre modelos generativos).
- Prompts en ingles.
- No soporta tool calling ni function calling: es un modelo generativo de imagen, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM; el "thinking" del titulo se refiere al razonamiento geometrico implicito en la edicion.
- No dispone de modo thinking, vision, audio ni transcripcion: la entrada es imagen (mas el condicionamiento del modelo base) y la salida es imagen.
- Cobertura multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Fotografia de producto en comercio electronico: rotar o recolocar un articulo para generar vistas adicionales desde el mismo catalogo fotografico, cambiando el punto de vista sin volver a montar el set, gracias a la capacidad de cambiar la vista preservando la identidad del objeto.
- Reconstruccion de partes ocluidas en imagenes de catalogo o archivo: sintetizar la cara oculta de un objeto al girarlo, util para fichas de producto o inventarios visuales donde solo existe una toma.
- Visualizacion inmobiliaria y de interiorismo: mover, rotar o reescalar muebles dentro de una fotografia de una habitacion real para explorar distribuciones alternativas antes de una reforma, manteniendo la escena coherente.
- Creacion de assets para videojuegos y realidad aumentada: generar variantes de un objeto fotografiado en distintas orientaciones para poblar entornos 3D, partiendo de una unica captura real.
- Post-produccion fotografica: corregir la colocacion de un sujeto o alinear perspectivas en una toma final cuando repetir la sesion no es viable.
- Aumento de datos para entrenamiento de modelos 3D y de vision: producir pares imagen-transformacion que sirvan como datos supervisados de geometria (pose, escala, punto de vista), ampliando datasets con imagenes reales editadas.
- Prototipado de interfaces de edicion generativa: servir como referencia de implementacion para interfaces basadas en manipuladores geometricos en lugar de prompts de texto, alineado con la linea de investigacion del autor.
- Demostraciones y evaluacion cualitativa en investigacion: reproducir los resultados del articulo y comparar estrategias de edicion geometrica sobre el mismo modelo base, siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye tabla de metricas, y la model card remite al articulo (arXiv 2606.20556) y al repositorio de GitHub para los detalles de entrenamiento y evaluacion, sin cifras reproducidas en la informacion consultada. No se dispone por tanto de valores de PSNR, LPIPS, SSIM, FID ni de metricas de consistencia 3D para este LoRA.

## Requisitos de hardware

- VRAM del adaptador: el repositorio ocupa 0.0 GB, de modo que el adaptador LoRA en si es despreciable en memoria; el coste lo determina integramente el modelo base FLUX.1-Kontext-dev.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. No se publican requisitos de memoria, GPU soportadas ni configuraciones probadas por los autores.
- Estimacion orientativa (no confirmada por los autores, dependiente del modelo base y de la precision elegida): la carga del modelo base en precision completa requiere GPU de gama alta con decenas de GB de VRAM; configuraciones cuantizadas y con offloading secuencial de modulos pueden reducir el requisito a GPUs de gama consumer con 16 GB o mas. Estos rangos son una orientacion general y deben validarse antes de comprometer infraestructura.
- GPU recomendadas: no disponible. Por el perfil del modelo base, son esperables GPU de centro de datos (A100, H100) para precision completa y GPUs consumer de gama alta (RTX 4090 y similares) para configuraciones cuantizadas, pero no hay confirmacion en la informacion disponible.
- Opciones de despliegue: la libreria declarada es diffusers, y el autor indica que la puesta en marcha, la inferencia y el entrenamiento se documentan en el repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI; estos toolkits estan orientados a modelos de lenguaje y no aplican a este caso.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia, numero de pasos de muestreo ni resolucion de trabajo.
- Almacenamiento: el LoRA ocupa practicamente nada (0.0 GB), pero hay que sumar el peso del modelo base y de sus codificadores, cuyo tamano no se detalla en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion cuantitativa no es posible porque no hay datos de rendimiento publicados en la informacion disponible. La tabla siguiente recoge unicamente los aspectos verificables.

| Modelo | Tipo | Modelo base | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thinking-In-Boxes (este) | LoRA de edicion geometrica 3D | FLUX.1-Kontext-dev | image-to-image, edicion geometrica | CC-BY-4.0 | HuggingFace, repo 0.0 GB, 0 descargas |
| FLUX.1-Kontext-dev sin LoRA | Modelo de difusion de edicion de imagen | - | image-to-image guiado por prompt | Licencia propia del modelo base | HuggingFace de black-forest-labs |
| Otros LoRA de edicion sobre FLUX.1-Kontext | Adaptadores de edicion | FLUX.1-Kontext-dev | image-to-image | Variable | No disponible en la informacion consultada |
| Metodos de edicion 3D/geometrica sobre imagen real | No disponible | No disponible | Edicion geometrica | No disponible | No disponible |

No se dispone de datos de parametros, contexto ni rendimiento de alternativas comparables dentro de la informacion proporcionada, por lo que la comparativa queda limitada a la relacion con el modelo base y a la categoria de adaptadores LoRA sobre FLUX.1-Kontext-dev.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgo demografico, cultural o de representacion del dataset Thinking-In-Boxes.
- Riesgo de alucinacion: presente por diseno en la sintesis de regiones no vistas. Al recuperar partes ocluidas de un objeto, el modelo genera contenido plausible pero no verificado, lo que puede producir geometria incoherente, texturas inventadas o proporciones incorrectas.
- Precedencia del modelo base: al ser un LoRA, hereda las limitaciones y los sesgos de FLUX.1-Kontext-dev, que no se analizan en el repositorio de este adaptador.
- Idioma: solo se declara ingles. No hay evidencia de soporte de prompts en castellano ni en otros idiomas.
- Restricciones de licencia para uso comercial: el LoRA se publica bajo CC-BY-4.0, que exige atribucion, pero el modelo base FLUX.1-Kontext-dev se distribuye bajo su propia licencia, potencialmente mas restrictiva. Es imprescindible revisar los terminos del modelo base antes de cualquier despliegue comercial.
- Ausencia de benchmarks: no hay metricas publicadas en la informacion disponible, de modo que la calidad de la edicion geometrica no puede cuantificarse ni compararse de forma objetiva antes de probarla.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes, y no incluye pesos del modelo completo. Es un artefacto de investigacion, no un paquete listo para produccion.
- Detalles de entrenamiento incompletos: numero de tokens, composicion del dataset, rango del LoRA y uso o no de tecnicas de alineacion (RLHF, DPO) no se detallan en la informacion disponible; hay que remitirse al suplementario del articulo.
- Documentacion de inferencia dependiente de repositorios externos: la puesta en marcha se delega al GitHub del proyecto, sin ejemplo de codigo en la model card, lo que anade friccion para reproducir resultados.
- Resolucion y formatos de salida no especificados: no se indica a que resoluciones trabaja el adaptador ni si degrada en imagenes de alta resolucion.
- Dependencia de la interfaz de cajas: el control granular descrito depende de construir la representacion de cajas y su codificacion de color; sin ese condicionamiento, el comportamiento esperado del adaptador no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pradhaansbhat/Thinking-In-Boxes
- Dataset de entrenamiento: https://huggingface.co/datasets/pradhaansbhat/Thinking-In-Boxes
- Repositorio GitHub: https://github.com/PradhaanSBhat/Thinking-In-Boxes (tambien referenciado como https://github.com/PradhaanSBhat/thinking-in-boxes)
- Pagina del proyecto: https://thinking-in-boxes.github.io/
- Articulo en arXiv: https://arxiv.org/abs/2606.20556
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev
- Perfil del autor: https://huggingface.co/pradhaansbhat
- Web personal del autor: https://pradhaansbhat.github.io/
