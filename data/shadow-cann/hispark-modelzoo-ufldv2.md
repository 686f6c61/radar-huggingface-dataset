# shadow-cann/hispark-modelzoo-ufldv2

## Resumen

UFLDv2 (Ultra-Fast-Lane-Detection-v2) es un modelo de deteccion de lineas de carril orientado a inferencia de muy baja latencia. Se basa en un metodo de clasificacion ordenada dirigida por anclas hibridas y combina un backbone ResNet18 con una red de parsing (ParsingNet) para predecir la geometria de los carriles manteniendo un coste computacional reducido. Este repositorio concreto, `shadow-cann/hispark-modelzoo-ufldv2`, es un espejo publicado en Hugging Face a partir del portal de desarrolladores de HiSilicon (HiSpark ModelZoo) y esta empaquetado para su despliegue en hardware HiSilicon con NPU.

El modelo resuelve la tarea de deteccion de carriles en imagenes de carretera con una resolucion de entrada de 800 x 320, con 96,365 millones de parametros y 18,753 GFLOPs de computo por inferencia. Su relevancia radica en que se distribuye en dos formatos: el modelo fuente en ONNX y una version compilada `.om` cuantizada a A8W8, lista para ejecutarse sobre la NPU del SoC Hi3516CV610. Esto lo situa en el ambito de la vision por computador embebida para sistemas de asistencia a la conduccion y automatizacion vehicular sobre OpenHarmony.

El repositorio es un espejo de la tarjeta del portal de HiSilicon, sin pipeline declarado, con 0 descargas y 0 likes en el momento de la captura, y un tamano de repositorio de 0,5 GB. El unico idioma declarado en la metadata es el chino (zh), aunque al tratarse de un modelo de vision esto afecta a la documentacion mas que a la tarea en si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UFLDv2 (Ultra-Fast-Lane-Detection-v2): backbone ResNet18 + ParsingNet, clasificacion ordenada dirigida por anclas hibridas |
| Parametros totales | 96,365 M |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 800 x 320) |
| Tipos de cuantizacion | A8W8 (modelo compilado `.om`); modelo fuente ONNX sin cuantizar |
| Idiomas soportados | zh (metadata del repositorio) |
| Licencia | no disponible en la tarjeta; se referencia la licencia del repositorio original: https://github.com/cfzd/Ultra-Fast-Lane-Detection-v2/blob/master/LICENSE |
| Formato de pesos | ONNX (modelo fuente) y `.om` (modelo compilado para NPU HiSilicon) |
| Computo por inferencia | 18,753 GFLOPs |
| Resolucion de entrada | 800 x 320 |
| Framework | PyTorch |
| Sistema operativo soportado | Linux |
| Hardware objetivo | Hi3516CV610 (HiSilicon) |
| Categoria | Vision por computador - deteccion de carriles |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

UFLDv2 emplea una formulacion de clasificacion ordenada en lugar de una regresion directa de la posicion de los carriles. La idea central del metodo es dividir la imagen en filas (anclas) y tratar la localizacion de cada carril como un problema de clasificacion sobre posiciones ordenadas en cada fila, lo que da lugar a la denominada clasificacion ordenada dirigida por anclas hibridas ("hybrid anchor-driven ordered classification"). El backbone ResNet18 extrae las caracteristicas y una red de parsing (ParsingNet) se encarga de generar las predicciones de carril a partir de esas caracteristicas. Esta combinacion busca un equilibrio entre precision y velocidad de inferencia.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO (procedimientos no aplicables a un modelo de vision discriminativa de este tipo). Tampoco se documentan innovaciones adicionales de entrenamiento ni tecnicas de decodificacion especulativa. El unico dato de entrenamiento indirecto es el coste computacional declarado, 18,753 GFLOPs, que refleja un diseno orientado a inferencia rapida.

## Capacidades

- Deteccion de lineas de carril en imagenes de carretera a una resolucion de entrada de 800 x 320.
- Salida de geometria de carriles basada en clasificacion ordenada por anclas, adecuada para tareas de perception en conduccion.
- Inferencia de baja latencia gracias a un backbone ligero (ResNet18) y una red de parsing especifica.
- Ejecucion sobre NPU HiSilicon mediante el modelo compilado `.om` en cuantizacion A8W8.
- Portabilidad mediante el modelo fuente en formato ONNX para otros entornos de inferencia.
- Integracion con el ecosistema HiSpark ModelZoo y OpenHarmony para despliegue embebido.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision general, audio ni modo de pensamiento. El alcance del modelo es exclusivamente la deteccion de carriles.

## Casos de uso

- Asistencia al mantenimiento de carril (LDW/LKA) en vehiculos: el modelo detecta los carriles a partir de imagenes de 800 x 320 de baja resolucion, lo que permite ejecutarlo en tiempo real sobre el SoC Hi3516CV610 y alimentar sistemas de aviso de salida de carril.
- Automatizacion de conduccion embebida: al estar compilado para NPU con cuantizacion A8W8, se integra en unidades electronicas del vehiculo con restricciones severas de consumo y computo, sin necesidad de GPU dedicada.
- Analisis de video de trafico en el borde (edge): procesamiento de flujos de camaras de carretera en dispositivos OpenHarmony para monitorizar el trazado de carriles y detectar incidencias.
- Robotica movil y AGV en entornos industriales: deteccion de lineas de guiado pintadas en el suelo interpretables como carriles, aprovechando el formato ONNX para integrarlo en pipelines de inferencia propios.
- Investigacion y prototipado en vision embebida: partiendo del modelo ONNX, permite experimentar con variantes de cuantizacion, ajuste fino o comparacion de tecnicas de deteccion de carriles sobre un modelo de referencia ligero.
- Validacion de cadenas de despliegue HiSilicon: sirve como ejemplo practico de conversion de un modelo PyTorch/ONNX a `.om` para cuantizacion A8W8 y ejecucion sobre NPU, util para equipos que preparan sus propios modelos para este hardware.
- Sistema de generacion de mapas de carril a bordo: la salida ordenada por filas facilita construir representaciones polilineales del carril que pueden fusionarse con otros modulos de perception del vehiculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo declarado: SoC HiSilicon Hi3516CV610 con NPU. El modelo `.om` esta compilado especificamente para este chip con cuantizacion A8W8.
- El modelo fuente ONNX puede ejecutarse en GPU o CPU mediante runtimes compatibles (ONNX Runtime, TensorRT, etc.), aunque no se documentan requisitos de VRAM concretos.
- No se dispone de datos de VRAM estimada para inferencia, ni de GPU recomendadas (A100, H100, RTX 4090 u otras) en la informacion proporcionada.
- No se confirma si el modelo cabe en GPU de consumo; el diseno (ResNet18, 96,365 M de parametros, 18,753 GFLOPs, entrada 800 x 320) es ligero, pero no hay cifras oficiales de consumo de memoria.
- Opciones de despliegue conocidas: runtime de NPU HiSilicon para el fichero `.om`; ONNX Runtime o similar para el modelo `.onnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo de vision).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad | Datos de benchmark |
|---|---|---|---|---|---|---|
| UFLDv2 (este repositorio, HiSpark ModelZoo) | 96,365 M | 800 x 320 | no aplica | no disponible (referencia a la licencia del repo original) | ONNX + `.om` para NPU HiSilicon | no disponibles |
| Alternativas comparables (por ejemplo, otras variantes de deteccion de carriles) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponibles |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo ni de equidad para este modelo.
- Riesgo de alucinacion: no aplica en el sentido generativo; al ser un modelo de deteccion, el riesgo equivalente es la prediccion incorrecta de carriles en condiciones adversas (baja iluminacion, oclusiones, marcas borrosas), sin que se hayan publicado tasas de error.
- Limitaciones de contexto o idioma: el modelo no maneja contexto textual; su idioma declarado es zh, referido a la documentacion. La entrada esta fijada a resoluciones de 800 x 320, lo que puede limitar la deteccion en escenas de alta complejidad o carriles muy estrechos.
- Restricciones de licencia para uso comercial: la licencia no figura en la tarjeta del repositorio; se enlaza la licencia del repositorio original (https://github.com/cfzd/Ultra-Fast-Lane-Detection-v2/blob/master/LICENSE). Es imprescindible verificar dicha licencia antes de cualquier uso comercial.
- Caveats de produccion: el modelo `.om` esta compilado especificamente para el SoC Hi3516CV610; no es portable a otras NPU sin recompilacion. La cuantizacion A8W8 puede degradar la precision respecto al modelo en punto flotante.
- El repositorio es un espejo del portal de HiSilicon, con 0 descargas y 0 likes, sin pipeline declarado; conviene validar la integridad y el soporte antes de adoptarlo en produccion.
- No se documentan requisitos de memoria, latencia ni throughput, lo que dificulta la planificacion de despliegues.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shadow-cann/hispark-modelzoo-ufldv2
- Tarjeta del portal de HiSilicon: https://gitbubble.github.io/hisilicon-developer-portal-mirror/model-detail.html?id=ku57c46cj400
- Repositorio upstream (HiSpark/modelzoo, README de ufldv2): https://gitcode.com/HiSpark/modelzoo/tree/master/samples/built-in/detection/ufldv2/README.md
- Referencia de licencia del modelo original: https://github.com/cfzd/Ultra-Fast-Lane-Detection-v2/blob/master/LICENSE
