# Poij-cv1/Qwen-Image-Edit-2511-Multiple-Angles-LoRA

## Resumen

Qwen-Image-Edit-2511-Multiple-Angles-LoRA es un adaptador LoRA para el modelo de edicion de imagen Qwen/Qwen-Image-Edit-2511, desarrollado por el usuario Poij-cv1. Su funcion es anadir control preciso de angulo de camara sobre la generacion y edicion de imagenes: permite reposicionar la camara virtual alrededor de un objeto o escena en 96 poses distintas, combinando cuatro elevaciones, ocho azimuts y tres distancias. El adaptador se entrena sobre renders 3D consistentes obtenidos mediante Gaussian Splatting, lo que le aporta coherencia espacial superior a la de un simple ajuste sobre datos 2D.

Se trata de un LoRA de bajo rango (el repositorio ocupa 0,3 GB), pensado para cargarse junto al modelo base Qwen-Image-Edit-2511 mediante la libreria diffusers. El modelo base es un transformer de difusion para edicion de imagen por instrucciones; el LoRA no modifica la arquitectura, sino que inyecta las matrices de bajo rango en las capas de atencion para condicionar la salida a la pose de camara indicada en el prompt.

Su relevancia radica en que resuelve un problema clasico de los modelos de edicion de imagen: la falta de control geometrico explicito. Con este adaptador, un flujo de trabajo de image-to-image puede solicitar vistas frontales, laterales, traseras o en angulo picado y contrapicado con una nomenclatura fija y reproducible, algo util para pipelines de sintesis de vistas, videojuegos, e-commerce o reconstruccion 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusion de edicion de imagen (Qwen-Image-Edit-2511) |
| Parametros totales | no disponible (el repositorio pesa 0,3 GB; el numero de parametros del adaptador no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen-Image-Edit-2511) |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en el formato propio de diffusers) |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors via diffusers (repositorio de 0,3 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre el modelo de difusion Qwen-Image-Edit-2511. No introduce cambios estructurales en el transformer del modelo base: se limita a modificar las proyecciones de atencion mediante matrices de rango reducido, de modo que el modelo aprenda a asociar la secuencia de tokens de camara con una geometria de vista concreta. El disparador de activacion es el token especial `<sks>`, seguido de tres descriptores en ingles: azimut, elevacion y distancia.

El entrenamiento se realizo sobre mas de 3000 pares de imagenes generados con Gaussian Splatting, una tecnica de representacion 3D que produce renders multivista geometricamente consistentes. Esta eleccion de datos es la innovacion principal del adaptador: al provenir de una misma escena 3D, las vistas de entrenamiento mantienen coherencia de oclusion, iluminacion y perspectiva, lo que reduce artefactos tipicos de los LoRA de angulo entrenados con pares 2D independientes. El autor declara haber realizado mas iteraciones y comprobaciones de calidad que en versiones anteriores, e incluye soporte especifico para angulos bajos (-30 grados), un caso habitualmente mal cubierto. No se especifican en la informacion disponible el numero de pasos de entrenamiento, la tasa de aprendizaje ni la composicion exacta del dataset mas alla de las cifras citadas.

## Capacidades

- Control de camara con 96 poses discretas: 8 azimuts (0, 45, 90, 135, 180, 225, 270 y 315 grados) x 4 elevaciones (-30, 0, 30 y 60 grados) x 3 distancias (close-up x0,6, medium shot x1,0 y wide shot x1,8).
- Edicion de imagen image-to-image: recibe una imagen de entrada y genera una nueva vista del mismo sujeto segun la pose solicitada.
- Reposicionamiento de camara sobre objetos y escenas: vistas frontales, laterales, traseras y en angulo, con nomenclatura fija y reproducible.
- Soporte de angulos bajos reales (-30 grados), incluyendo tomas a nivel de suelo.
- Control de encuadre mediante distancia: primeros planos para detalle y textura, planos medios y planos generales para contexto.
- Integracion con el ecosistema diffusers y con el pipeline de fal.ai.
- Capacidad multilingue: limitada al ingles en los prompts de camara (los descriptores de pose estan en ingles).

## Casos de uso

- Sintesis de vistas para reconstruccion 3D: dado un objeto fotografado desde un angulo, generar las vistas restantes de las 96 poses para alimentar un pipeline de fotogrametria o de Gaussian Splatting. La coherencia geometrica del entrenamiento favorece la consistencia entre vistas.
- Fichas de producto en e-commerce: a partir de una unica foto de estudio, generar vistas laterales, traseras y en picado para una galeria completa, usando `medium shot` y `wide shot` segun el encuadre deseado.
- Previsualizacion de assets en videojuegos: generar vistas de un modelo conceptual desde angulos de camara concretos para evaluar como se vera en el motor antes de modelarlo en 3D.
- Storyboarding y direccion de arte: producir variaciones de encuadre de una misma escena (contrapicado, picado, plano general) manteniendo la identidad del sujeto, para explorar opciones de plano sin reescribir el prompt entero.
- Aumento de datasets de vision por computador: ampliar un conjunto de imagenes con vistas sinteticas controladas para tareas de deteccion o estimacion de pose, aprovechando que cada muestra lleva asociada una etiqueta de camara exacta.
- Catalogos inmobiliarios o de mobiliario: generar tomas de un mueble o estancia desde angulos adicionales a partir de una foto existente, con control explicito de la distancia para alternar detalle y contexto.
- Iteracion rapida en produccion creativa: al ser un LoRA ligero (0,3 GB), se puede cargar y descargar sobre el modelo base en entornos con varias variantes de estilo, cambiando solo el adaptador segun la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,3 GB, por lo que su VRAM adicional es marginal; el requisito dominante es el del modelo base Qwen-Image-Edit-2511, cuyas necesidades no se detallan en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para modelos de difusion de imagen de esta familia se suele requerir VRAM de gama alta, pero no se confirma en la ficha del autor.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: diffusers (libreria declarada) y la plataforma fal.ai, citada como herramienta de construccion del adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Control de camara | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-Edit-2511-Multiple-Angles-LoRA | LoRA sobre Qwen-Image-Edit-2511 | 96 poses (8 azimuts x 4 elevaciones x 3 distancias) | Depende del base | apache-2.0 | Hugging Face |
| Qwen-Image-Edit-2511 (base) | Transformer de difusion para edicion de imagen | Capacidades de punto de vista integradas, sin control discreto de 96 poses | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| Otros LoRA de angulo de camara para modelos de difusion | LoRA | Variable; habitualmente sin dataset 3D consistente | Depende del base | Variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador solo funciona con el modelo base Qwen-Image-Edit-2511; no es utilizable con otras arquitecturas de difusion.
- Los prompts de camara deben seguir el formato exacto `<sks> [azimut] [elevacion] [distancia]` en ingles; el uso de descriptores fuera de la lista de 96 poses puede degradar el resultado.
- El control de camara es discreto, no continuo: no se pueden solicitar angulos intermedios entre las 96 poses definidas.
- Al entrenarse con renders de Gaussian Splatting, puede heredar artefactos propios de ese tipo de datos (bordes, transparencias o iluminacion poco realista) en escenas complejas.
- Riesgo de alucinacion geometrica en objetos con oclusiones severas o geometria ambigua, ya que el modelo debe inferir la parte no visible del sujeto.
- No se documentan sesgos demograficos ni de otro tipo; al ser un adaptador de edicion de imagen, los sesgos del modelo base se mantienen.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen-Image-Edit-2511 antes de desplegar en produccion.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se especifican requisitos de VRAM ni latencias, lo que dificulta planificar el despliegue sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Poij-cv1/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- fal.ai: https://fal.ai
