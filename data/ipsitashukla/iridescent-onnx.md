# ipsitashukla/iridescent-onnx

## Resumen

Iridescent ONNX es un conjunto de grafos ONNX derivados de los modelos DenseNet-121 de "chestcam" que utiliza la aplicacion Iridescent, publicados por el usuario ipsitashukla en HuggingFace. No es un modelo de lenguaje: se trata de un clasificador de radiografias de torax (chest X-ray) disenado para ejecutarse integramente en el navegador mediante ONNX Runtime Web, sin necesidad de servidor de inferencia.

Cada grafo devuelve dos salidas: los `logits` de clasificacion y un mapa Grad-CAM por clase con resolucion 7x7 (`cams`), lo que permite ofrecer explicabilidad visual junto a la prediccion. El repositorio incluye ademas un fichero `meta.json` con las constantes de preprocesado, los nombres de las clases y los umbrales de validacion, lo que facilita reproducir el pipeline completo en cliente.

Su relevancia actual es acotada pero clara: es un ejemplo de despliegue de vision artificial medica en el navegador (WebGPU/WASM) con explicabilidad incorporada y licencia MIT. El propio autor lo etiqueta como prototipo de investigacion y advierte explicitamente de que no es un dispositivo medico. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado informacion sobre el dataset de entrenamiento ni sobre su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN DenseNet-121 (segun la model card, backbone "chestcam DenseNet-121"); grafo exportado a ONNX |
| Parametros totales | no disponible en la model card; la DenseNet-121 estandar tiene aproximadamente 8 millones de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el autor no documenta variantes fp32, fp16 o INT8) |
| Idiomas soportados | no aplica; las etiquetas de clase estan en `meta.json` y su idioma no se especifica |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos para ONNX Runtime Web) |
| Entrada | imagen de radiografia de torax con preprocesado definido en `meta.json` |
| Salidas | `logits` (clasificacion) y `cams` (Grad-CAM por clase, 7x7) |
| Numero de clases | no confirmado explicitamente; el tensor de CAM es 7x7 por clase, coherente con un esquema multi-etiqueta de 7 clases |
| Libreria | onnx (ONNX Runtime Web para inferencia en navegador) |
| Tags | chest-x-ray, onnx, onnxruntime-web, explainable-ai |

## Arquitectura y entrenamiento

La unica informacion aportada por el autor es que se trata de versiones para navegador de los modelos DenseNet-121 de chestcam usados por la aplicacion Iridescent. DenseNet-121 es una red convolucional con conexiones densas entre bloques, habitual en clasificacion de radiografias de torax por su buena relacion entre precision y coste computacional. El modelo se distribuye como grafo ONNX, no como pesos en safetensors, y expone dos cabezas de salida: una de clasificacion y otra de mapas de activacion Grad-CAM de 7x7 por clase, generados dentro del propio grafo.

No se especifica en la model card el volumen de datos de entrenamiento, la composicion del dataset (por ejemplo NIH ChestX-ray14, CheXpert, MIMIC-CXR u otro), si hubo ajuste fino, aumento de datos o calibracion de umbrales. Tampoco se documentan tecnicas de regularizacion, ponderacion de clases ni el metodo de validacion. El unico indicio sobre el proceso es la existencia de umbrales de validacion almacenados en `meta.json`, cuyos valores no se reproducen en la informacion disponible. La innovacion destacable del repositorio es de despliegue, no de arquitectura: empaquetar clasificacion mas explicabilidad en un unico grafo ejecutable en el navegador.

## Capacidades

- Clasificacion de radiografias de torax a partir de una imagen preprocesada con las constantes de `meta.json`.
- Salida multi-clase o multi-etiqueta: el tensor de CAM por clase indica que el modelo produce una puntuacion y una localizacion por cada clase definida.
- Explicabilidad integrada mediante Grad-CAM 7x7 generado en el propio grafo, sin necesidad de calculo externo.
- Inferencia en el navegador con ONNX Runtime Web, lo que permite ejecucion en cliente sin exponer imagenes a un servidor.
- Despliegue offline o en entornos con conectividad limitada, al no requerir backend de inferencia.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades multimodales fuera de la imagen.
- No dispone de tool calling, function calling ni soporte de agentes o razonamiento multi-paso.
- No dispone de capacidades multilingues en el sentido de un modelo de lenguaje; las etiquetas de clase son cadenas fijas.

## Casos de uso

- Visor web de radiologia con ayuda a la lectura: el modelo puede cargarse en el navegador del radiologo y devolver, junto a la imagen, un mapa Grad-CAM 7x7 por clase que oriente la revision hacia las regiones con mayor activacion.
- Triaje preliminar en entornos con recursos limitados: al ejecutarse en cliente, permite obtener una puntuacion de sospecha sin infraestructura GPU ni servidor, util en campanas de cribado o puntos de atencion remotos.
- Prototipado e investigacion en IA medica explicable: sirve como base reproducible para comparar tecnicas de explicabilidad, ya que el CAM forma parte de la propia salida del grafo y elimina variabilidad entre implementaciones.
- Etiquetado asistido de datasets: las puntuaciones del modelo pueden usarse como preanotacion para que un especialista las revise, acelerando la construccion de conjuntos anotados de radiografias.
- Docencia y formacion: permite mostrar en un navegador como un clasificador convolucional localiza hallazgos, con la salvedad de que el modelo es un prototipo y no una herramienta diagnostica.
- Demostraciones y evaluacion de arquitecturas web: util para medir latencia y viabilidad de ONNX Runtime Web sobre imagenes medicas en distintos navegadores y dispositivos.
- Verificacion de privacidad en despliegues sensibles: al no requerir envio de imagenes a un servidor, encaja en escenarios donde la normativa o la politica interna exige que los datos no salgan del puesto del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de AUC, sensibilidad, especificidad ni comparaciones con otros modelos, y tampoco se detallan los valores de los umbrales de validacion almacenados en `meta.json`.

## Requisitos de hardware

- VRAM estimada: no disponible; para una DenseNet-121 de aproximadamente 8 millones de parametros, la inferencia en fp32 requiere del orden de decenas de megabytes de memoria de pesos, y menos de 1 GB de memoria total incluyendo activaciones a resoluciones habituales de entrada. Esta estimacion es orientativa y no procede de la model card.
- GPU recomendadas: no disponibles; el autor no especifica hardware de referencia. Al tratarse de un grafo ONNX para navegador, el objetivo declarado es la ejecucion en cliente mediante ONNX Runtime Web (WASM y, si el navegador lo soporta, WebGPU).
- Compatibilidad con GPU de consumo: previsiblemente cabe en cualquier GPU de consumo e incluso en CPU, dado el tamano del backbone, aunque no hay confirmacion del autor.
- Opciones de despliegue: ONNX Runtime Web en navegador; el formato ONNX tambien permite su uso con ONNX Runtime en servidor, pero no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo de vision.
- Latencia y throughput: no disponibles; no se publican mediciones por dispositivo, navegador o backend de ejecucion.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Iridescent ONNX (ipsitashukla) | DenseNet-121 en ONNX con Grad-CAM integrado | aproximadamente 8 M (backbone DenseNet-121, no confirmado) | no aplica | no disponible | MIT | HuggingFace, 0 descargas |
| TorchXRayVision (DenseNet-121) | DenseNet-121 en PyTorch, multi-dataset | aproximadamente 8 M | no aplica | metricas publicadas por el proyecto, no verificadas en esta busqueda | no disponible en esta busqueda | repositorio publico con pesos preentrenados |
| CheXNet | DenseNet-121 entrenado sobre ChestX-ray14 | aproximadamente 8 M | no aplica | metricas publicadas en el articulo original, no verificadas en esta busqueda | no disponible en esta busqueda | implementaciones de terceros |

La diferencia principal de Iridescent ONNX respecto a estas alternativas no es de precision, que no esta documentada, sino de formato y enfoque: distribucion como grafo ONNX autocontenido con Grad-CAM embebido y orientacion a inferencia en navegador, frente a pesos PyTorch pensados para ejecucion en servidor.

## Limitaciones y advertencias

- El autor declara explicitamente que es un prototipo de investigacion y no un dispositivo medico; no debe usarse para diagnostico clinico ni para decisiones terapeuticas.
- No se documenta el dataset de entrenamiento ni su composicion demografica, por lo que no es posible evaluar sesgos por edad, sexo, etnia, tipo de equipo o procedencia hospitalaria.
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos: no hay metricas publicadas de sensibilidad, especificidad ni AUC que permitan acotar la tasa de error.
- Los mapas Grad-CAM son de resolucion 7x7, muy baja para localizacion fina; deben interpretarse como indicacion gruesa de region, no como segmentacion.
- Los umbrales de decision estan en `meta.json`, pero sus valores y su metodo de calibracion no se detallan; un uso fuera del dominio previsto puede invalidarlos.
- No hay informacion sobre idiomas de las etiquetas de clase ni sobre la interfaz que las consume, lo que complica la integracion directa en aplicaciones en castellano.
- El modelo no soporta texto, tool calling ni agentes, por lo que no puede integrarse en flujos conversacionales sin componentes adicionales.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia del modelo no cubre las obligaciones regulatorias aplicables a software sanitario ni las restricciones de los datos de entrenamiento, que no se especifican.
- Repositorio sin descargas ni likes y sin pipeline declarado en HuggingFace, lo que limita la evidencia de uso en produccion y la comunidad de soporte.
- No se indica versionado de los grafos ni proceso de actualizacion, lo que dificulta el control de cambios en un despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ipsitashukla/iridescent-onnx
- La model card no incluye enlaces a paper, repositorio de codigo, demo ni documentacion adicional.
- La busqueda web realizada no devolvio resultados relacionados con el modelo: todos los enlaces encontrados corresponden a productos homonimos sin relacion (Phantom, cartera de criptomonedas y herramientas de mecanizado), por lo que no se incluyen como referencias.
