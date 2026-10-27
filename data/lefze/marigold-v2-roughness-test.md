# lefze/Marigold-V2-roughness-test

## Resumen

Marigold-V2-roughness-test es un adaptador experimental para la estimacion de rugosidad (roughness) dentro de la arquitectura de inferencia Marigold V2, publicado por el usuario lefze en HuggingFace. Tecnicamente es un LoRA de rango 128 sobre el transformer de Qwen-Image-Edit-2511, afinado a partir de la tarea de albedo, y se distribuye junto con el decodificador VAE entrenado del checkpoint. No es un pipeline Diffusers autonomo ni un LoRA generico: necesita el codigo de inferencia de tareas de Marigold y los embeddings de prompt `qwen_edit_2509_qwen_albedo_rgb_dummy512` del repositorio oficial huawei-bayerlab/marigold-v2-0.

El problema que aborda es concreto dentro del flujo de autoria de materiales PBR: derivar un mapa de rugosidad escalar lineal de un solo canal (0 = liso, 1 = rugoso) a partir de una imagen de entrada. El entrenamiento se realizo a 512 pixeles de resolucion y la inferencia usa un unico timestep fijo del transformer (499/1000), lo que implica un regimen de una sola pasada de difusion en lugar de un muestreo multi-paso.

Su relevancia debe enmarcarse con prudencia: es un checkpoint de prueba de la comunidad, separado de la release oficial de Marigold, con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks cuantitativos publicados ni descripcion detallada del dataset de entrenamiento. La integracion prevista es el plugin WarNeru Designer AI para Substance Designer, que descarga la release fijada bajo demanda y exporta un bitmap en escala de grises de 16 bits lineal al tamano de la imagen de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Qwen-Image-Edit-2511) con adaptador LoRA de rango 128 y decodificador VAE entrenado; inferencia mediante la arquitectura Marigold V2 |
| Parametros totales | no disponible (el adaptador se distribuye como tensores LoRA + VAE; el backbone Qwen-Image-Edit-2511 se carga aparte y su recuento no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion imagen-a-imagen; entrada condicionada por imagen, no por texto largo) |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no hay interfaz de texto; la unica entrada linguistica son embeddings de prompt precalculados) |
| Licencia | Apache-2.0 |
| Formato de pesos | `trainables.safetensors` (tensores `Diffuser.*` del LoRA y `VAE.*` del decodificador) + `roughness.json` (descripcion de arquitectura y codificacion); ambos obligatorios |

Datos adicionales del checkpoint: paso de entrenamiento completado 10.500, resolucion de entrenamiento 512 px, timestep fijo 499/1000, salida escalar lineal de rugosidad en el rango [0, 1]. Tamano del repositorio: 1,9 GB. Creado y actualizado el 27 de octubre de 2026.

## Arquitectura y entrenamiento

El modelo se apoya en un backbone de difusion para edicion de imagen (Qwen-Image-Edit-2511), sobre cuyo transformer se inserta un adaptador LoRA de rango 128. El punto de partida no es el modelo base sin modificar, sino la tarea de albedo de Marigold V2: el adaptador se afina desde esa cabeza para reorientarla hacia la prediccion de rugosidad. El checkpoint incluye ademas un decodificador VAE entrenado especificamente, lo que sugiere que la salida no reutiliza sin mas el VAE del backbone, sino una decodificacion ajustada a la estadistica del mapa de rugosidad.

La inferencia emplea un unico timestep fijo (499/1000) del transformer, de modo que no se ejecuta un proceso de muestreo completo. La condicion de entrada combina la imagen original con los embeddings de prompt `qwen_edit_2509_qwen_albedo_rgb_dummy512` procedentes del repositorio oficial de Marigold V2. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF/DPO (en un modelo de regresion densa por pixel como este, ese tipo de alineamiento no seria el mecanismo habitual). Tampoco se publican estados de optimizador, imagenes de entrenamiento ni rutas especificas de maquina; solo los tensores finales y el JSON de configuracion.

## Capacidades

- Estimacion de rugosidad imagen-a-imagen: genera un mapa escalar lineal de un solo canal a partir de una imagen de entrada, con la convencion 0 = liso y 1 = rugoso.
- Salida en formato de alta profundidad a traves del plugin: bitmap en escala de grises de 16 bits lineal, al mismo tamano que la imagen de entrada.
- Control de intensidad del adaptador: el plugin expone un parametro "Roughness Adapter Strength" que escala la influencia del LoRA del transformer (valor por defecto 1).
- Reutilizacion del ecosistema Marigold: comparte backbone, VAE y embeddings de prompt con la release oficial, lo que permite alternar entre tareas (albedo, roughness) sin recargar toda la pila.
- Integracion con autoria de materiales: pensado para ejecutarse dentro de Substance Designer mediante el plugin WarNeru Designer AI, no como servicio generico.
- Sin capacidades de texto: no genera lenguaje, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no procesa audio.
- Sin capacidades multilingues: la unica senal textual son embeddings de prompt fijos; no hay instrucciones en lenguaje natural.
- No es un modelo de vision-lenguaje: la comprension visual se limita a la estimacion densa de un atributo de reflectancia.

## Casos de uso

- Autoria de materiales en Substance Designer: activando la casilla Roughness sobre "AI Marigold 2" y pulsando "Generate AI" en el plugin WarNeru, el artista obtiene un mapa de rugosidad de 16 bits alineado con la imagen de entrada, listo para conectarse en el grafo de material sin salir de la herramienta.
- Prototipado rapido de lookdev en produccion de videojuegos: permite generar variantes de rugosidad a partir de fotografias o renders de referencia antes de esculpir a mano los mapas definitivos, reduciendo el tiempo de iteracion en las primeras fases del asset.
- Derivacion de mapas desde fotografias de referencia: dada una foto de un material real (madera desgastada, metal cepillado, tela), el adaptador produce una estimacion densa de rugosidad utilizable como base para calibrar despues el material en el motor de render.
- Investigacion sobre adaptadores de tareas en Marigold V2: al estar construido como LoRA sobre la cabeza de albedo y compartir embeddings con el checkpoint oficial, sirve como caso de estudio reproducible de transferencia entre tareas intrinsics (albedo a roughness) con un unico timestep.
- Comparacion de convenciones de rugosidad: util para estudiar como se comporta una salida lineal escalar frente a las convenciones perceptuales o a los mapas autorados manualmente en distintos renderers, siempre con validacion visual.
- Docencia y evaluacion de modelos de estimacion intrinseca: el coste de integracion es bajo dentro del plugin y permite mostrar en clase las diferencias entre albedo, normal y roughness generados automaticamente, asi como sus fallos bajo iluminacion desconocida.
- Automatizacion en pipelines de assets 3D: mediante el flujo del plugin se pueden procesar lotes de texturas; conviene verificar previamente la calidad caso por caso, dado que el checkpoint es experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que se trata de un checkpoint de prueba sin resultados cuantitativos ni descripcion detallada del dataset de entrenamiento, por lo que no existen cifras contrastables frente a Marigold V2 oficial ni frente a otros estimadores de rugosidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La informacion publicada no incluye requisitos de memoria; el adaptador y el VAE suman 1,9 GB en el repositorio, pero la inferencia exige cargar tambien el backbone Qwen-Image-Edit-2511 completo, cuyo peso no se detalla en la ficha.
- GPU recomendadas: no disponible. No hay datos publicados de pruebas en A100, H100, RTX 4090 ni otras GPU.
- Encaje en GPU de consumo: no confirmado. Por el perfil del backbone (modelo de edicion de imagen de gran tamano) y por la necesidad de mantener VAE y embeddings en memoria, es previsible que una GPU de consumo con 8-12 GB resulte insuficiente, pero esta apreciacion no procede de datos publicados y debe validarse experimentalmente.
- Opciones de despliegue: la via soportada es el plugin WarNeru Designer AI para Substance Designer, que instala backbone, VAE y embeddings y descarga su release fijada bajo demanda. La libreria declarada es `diffusers`, pero el autor advierte que no es un pipeline Diffusers autonomo: requiere el codigo de inferencia de tareas de Marigold. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. El uso de un unico timestep fijo (499/1000) reduce el coste a esencialmente una pasada del transformer mas la decodificacion VAE, frente a un muestreo multi-paso, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lefze/Marigold-V2-roughness-test | LoRA de tarea sobre Qwen-Image-Edit-2511 para Marigold V2 | no disponible | 512 px de entrenamiento; timestep unico 499/1000 | sin benchmarks publicados | Apache-2.0 | HuggingFace, 0 descargas; requiere plugin o codigo de Marigold |
| huawei-bayerlab/marigold-v2-0 (oficial) | Modelo de estimacion intrinseca (albedo y otras tareas) | no disponible | no disponible | no disponible en la informacion proporcionada | consultar en el repositorio oficial | HuggingFace, release oficial mantenida |
| Marigold v1 | Modelo de estimacion de profundidad y normales basado en difusion | no disponible | no disponible | no disponible en la informacion proporcionada | consultar en el repositorio oficial | HuggingFace |
| Qwen/Qwen-Image-Edit-2511 | Backbone de edicion de imagen condicionada por texto | no disponible | no disponible | no disponible en la informacion proporcionada | consultar en el repositorio del modelo base | HuggingFace |

La comparacion cuantitativa no es posible con los datos disponibles: ninguno de los repositorios referenciados aporta en esta informacion cifras de error (por ejemplo, RMSE o Si-RMSE) sobre conjuntos de validacion de rugosidad.

## Limitaciones y advertencias

- Checkpoint de prueba: el autor lo describe como experimento comunitario, separado de la release oficial de Marigold, sin garantias de estabilidad ni de calidad.
- Ausencia total de benchmarks: no hay resultados cuantitativos ni comparacion con Marigold V2 oficial, de modo que la calidad de los mapas generados solo puede evaluarse visualmente.
- Dataset de entrenamiento no documentado: se desconoce la composicion, el dominio y la cobertura de materiales, lo que impide anticipar sesgos hacia ciertos tipos de superficie.
- Ambiguedad bajo iluminacion desconocida: las predicciones son estimaciones condicionadas por la imagen y pueden resultar ambiguas cuando la iluminacion no es identificable, tal como advierte la model card.
- Convencion de salida especifica: el resultado es rugosidad escalar lineal (0 = liso, 1 = rough), que puede no coincidir con la convencion perceptual o con el rango esperado por un motor de render concreto; es necesario remapear.
- Restriccion de resolucion: el entrenamiento se realizo a 512 px, por lo que el comportamiento por encima de esa resolucion no esta validado.
- Dependencia de codigo externo: no funciona como pipeline Diffusers autonomo ni como LoRA generico; sin `roughness.json` y sin el codigo de inferencia de Marigold, los pesos no son utilizables.
- Dependencia de una herramienta comercial: el flujo documentado pasa por el plugin WarNeru dentro de Substance Designer, un producto de pago; el codigo del plugin esta publicado en GitLab, pero eso no elimina la dependencia del anfitrion.
- Licencia y atribucion: el adaptador declara Apache-2.0, pero la model card remite a `LICENSE` y `NOTICE` para la atribucion de componentes upstream. Para uso comercial deben revisarse tambien las licencias de Qwen-Image-Edit-2511 y de marigold-v2-0.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica que permitan contrastar comportamientos.
- Riesgo de alucinacion en el sentido de texturas inventadas: al ser un modelo generativo condicionado, puede introducir patrones de rugosidad no presentes en la imagen original, especialmente en zonas planas o con reflejos especulares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lefze/Marigold-V2-roughness-test
- Modelo base (backbone): https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo base (arquitectura Marigold V2 oficial): https://huggingface.co/huawei-bayerlab/marigold-v2-0
- Codigo fuente del plugin WarNeru Designer AI (GitLab): https://gitlab.com/Londo001/WarNeru/-/tree/tools/designer-ai-nodes/tools/Plugins/Substance%20Designer/AI%20Nodes
- Paper de Marigold (referencia de la arquitectura): no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible en la informacion proporcionada
