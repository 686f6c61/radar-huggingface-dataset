# frappe0w/smartcrop-mobilenetv2-crop

## Resumen

Crop-tuned MobileNetV2 es un modelo ONNX de extraccion de caracteristicas derivado de `mobilenetv2-12.onnx` del ONNX Model Zoo, afinado de extremo a extremo por el autor `frappe0w` para puntuar y clasificar recortes de imagen (aesthetic cropping). No es un modelo generativo ni un LLM: es la red troncal (backbone) del puntuador de recortes aprendido del proyecto smartcrop.js, y su funcion es producir representaciones multiescala utiles para decidir que region de una imagen constituye el mejor encuadre.

El modelo conserva el grafo y los nombres de tensores del MobileNetV2 original, lo que facilita su sustitucion directa en el plugin ONNX de smartcrop.js. La innovacion respecto al backbone congelado de ImageNet es un ajuste fino supervisado con pares RankNet sobre los conjuntos GAICD y FCDB, que mejora la correlacion de rango (SRCC) y la precision de ranking de recortes en datos de test.

Es relevante ahora porque demuestra que un backbone pequeno y desplegable en el navegador (via ONNX Runtime Web) puede superar a un extractor de caracteristicas generico en una tarea perceptiva concreta, con un coste computacional bajo y licencia Apache-2.0. El repositorio es de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV2 (grafo ONNX Model Zoo `mobilenetv2-12.onnx`) |
| Parametros totales | no disponible (el modelo base MobileNetV2-12 ronda 3,4 M, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (pesos); los datos de entrenamiento GAICD y FCDB tienen sus propios terminos y no se redistribuyen |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es una CNN MobileNetV2 con convoluciones separables en profundidad y bloques residuales invertidos. El modelo parte del `mobilenetv2-12.onnx` del ONNX Model Zoo, con BatchNorm ya plegada en las convoluciones, y mantiene el mismo grafo y nombres de tensores. La entrada es una imagen RGB normalizada con media y desviacion tipica de ImageNet, redimensionada a 256 px de lado corto. El plugin ONNX de smartcrop.js lee las salidas de stride 8, 16 y 32 (tensores `365`, `426` y `624`), las remuestrea a la rejilla de stride 16 y las concatena en 448 canales; despues proyecta a 32 canales con una proyeccion aprendida incluida en `src/learned-cnn-weights.ts`.

El entrenamiento usa pares RankNet construidos a partir de los conjuntos de entrenamiento GAICD y FCDB, con volteos horizontales aleatorios. Se emplea el optimizador AdamW con BatchNorm congelada y una media movil exponencial (EMA) de los pesos con factor 0,998 que se evalua y guarda. La proyeccion de 448 a 32 canales se inicializa desde un PCA y se aprende junto con la cabeza puntuadora de recortes. No se documenta el numero de tokens ni el volumen exacto de pares de entrenamiento.

## Capacidades

- Extraccion de caracteristicas visuales multiescala (strides 8, 16 y 32) para imagenes RGB.
- Puntuacion y ranking de recortes de imagen (aesthetic cropping) mediante la cabeza entrenada.
- Integracion directa en el plugin ONNX de smartcrop.js sin cambios de grafo ni de nombres de tensores.
- Funcionamiento en entornos JavaScript/TypeScript con ONNX Runtime (incluido el navegador, segun el diseno de smartcrop.js).
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.
- No dispone de modo thinking, vision generativa, audio ni otras capacidades especiales mas alla de la vision por extraccion de caracteristicas.

## Casos de uso

- Recorte inteligente en aplicaciones web: el modelo se carga con ONNX Runtime Web y puntua candidatos de recorte en el cliente, evitando enviar imagenes a un servidor y reduciendo latencia y coste de ancho de banda.
- Generacion de miniaturas automaticas: dado un catalogo de imagenes, el puntuador selecciona la region con mejor encuadre para thumbnails de listados, articulos o galerias.
- Encuadre adaptativo por relacion de aspecto: al necesitar un recorte cuadrado, 16:9 o vertical, el modelo permite elegir entre multiples candidatos el que maximiza la puntuacion aprendida.
- Preprocesado en pipelines de vision: las caracteristicas de 448 canales concatenadas pueden alimentar clasificadores o recuperadores de imagen posteriores que necesiten una representacion compacta y afinada para composicion visual.
- Edicion fotografica asistida: integracion en herramientas de retoque que sugieran automaticamente el encuadre principal de una fotografia antes de que el usuario lo ajuste manualmente.
- Investigacion en cropping estetico: sirve como baseline reproducible y ligero para comparar estrategias de ranking (RankNet, pares, proyecciones PCA) sobre GAICD y FCDB sin requerir GPUs de gran capacidad.
- Sistemas de moderacion o curaduria de contenido: deteccion de la region dominante de una imagen para recortar caras u objetos relevantes antes de pasarlos a un clasificador.

## Benchmarks y rendimiento

Resultados en test comparando el backbone congelado de ImageNet con el modelo afinado para recortes:

| Metrica | MobileNetV2 congelado | Crop-tuned |
|---|---|---|
| GAICD test SRCC | 0,793 | 0,821 |
| GAICD Acc1/5 | 56,2 | 59,9 |
| FCDB test | 0,766 | 0,770 |

En busqueda completa de recortes, el IoU medio con el recorte humano mejora en +0,015 en GAICD test (IC 95 %: +0,012 a +0,019) respecto a un backbone congelado reentrenado de la misma forma. En FCDB y FLMS las diferencias quedan dentro del ruido estadistico. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo base MobileNetV2-12 es de pocos millones de parametros y el repositorio ocupa 0.0 GB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPUs integradas. Cualquier GPU consumer (GTX 1050 o superior, RTX 2060, RTX 4090) es sobrada.
- Cabe en GPU consumer: si, en todas las gamas, y tambien en navegador mediante WebGPU/WASM con ONNX Runtime Web.
- Opciones de despliegue: ONNX Runtime (Python, C++, JS/Web), ONNX Runtime Web, y cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo y la resolucion de entrada (256 px de lado corto), se espera un coste por imagen bajo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en cropping | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Crop-tuned MobileNetV2 (este) | CNN ONNX para ranking de recortes | no disponible | no aplica | GAICD SRCC 0,821; Acc1/5 59,9 | Apache-2.0 | Hugging Face (0 descargas) |
| MobileNetV2-12 (ONNX Model Zoo) | CNN ONNX de clasificacion/extraccion | no disponible | no aplica | GAICD SRCC 0,793 (congelado) | Apache-2.0 | ONNX Model Zoo |
| smartcrop.js (heuristica clasica) | Algoritmo de recorte por reglas | no aplica | no aplica | no disponible | licencia del proyecto smartcrop.js | GitHub |

No se dispone de datos de benchmarks de otras alternativas de cropping estetico en la informacion proporcionada, por lo que la comparativa se limita a las variantes citadas en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con GAICD y FCDB, puede heredar los sesgos de composicion y estetica de esos datasets.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el puntuador puede seleccionar recortes suboptimos en imagenes fuera de la distribucion de entrenamiento.
- Limitaciones de contexto o idioma: no aplica idioma; la entrada esta limitada a imagenes RGB normalizadas con media y desviacion de ImageNet y a un lado corto de 256 px.
- Restricciones de licencia: los pesos son Apache-2.0, pero los datos de entrenamiento GAICD y FCDB tienen sus propios terminos y no se redistribuyen; conviene revisarlos antes de un uso comercial.
- Caveats para produccion: el modelo es un artefacto de investigacion con 0 descargas y 0 likes, sin documentacion de versionado ni de cuantizaciones; la mejora en FCDB y FLMS queda dentro del ruido, por lo que el beneficio se concentra en GAICD.
- Dependencia del ecosistema smartcrop.js: el uso previsto asume el plugin ONNX y la proyeccion de 448 a 32 canales incluida en `src/learned-cnn-weights.ts`; reutilizarlo fuera de ese pipeline requiere replicar esa proyeccion y la cabeza puntuadora.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frappe0w/smartcrop-mobilenetv2-crop
- Repositorio smartcrop.js (fork referenciado): https://github.com/jauderho/smartcrop.js
- ONNX Model Zoo (modelo base `mobilenetv2-12.onnx`): no se proporciona URL directa en la informacion disponible.
