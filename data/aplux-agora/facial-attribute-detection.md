# APLUX-Agora/Facial-Attribute-Detection

## Resumen

Facial-Attribute-Detection es un modelo de deteccion de atributos faciales publicado por APLUX-Agora dentro de su catalogo Model Farm, orientado a despliegue en hardware Qualcomm (AIoT). No se trata de un modelo de lenguaje generativo, sino de un modelo de vision por computador empaquetado como recursos de despliegue para SoCs Qualcomm concretos, con variantes cuantizadas W8A16 y W8A8 y artefactos especificos por placa (`targets/<SoC>/`). La model card esta mayoritariamente en chino e ingles y describe el flujo de descarga y despliegue mas que la arquitectura interna.

El modelo se distribuye como un paquete de recursos convertidos y validados placa a placa por la plataforma Agora (mega.aidlux.com). Las dos plataformas documentadas son QCS6490 sobre la placa Rhino Pi A1 (2,7 ms en precision por defecto) y QCS8550 sobre Rhino Pi X1 (1,0 ms en precision por defecto). La tarea declarada es "otra", con entrada de imagen y salida en JSON, lo que sugiere un pipeline de deteccion de atributos faciales (por ejemplo, edad, genero, expresion, gafas u otros) devuelto como estructura serializada.

Su relevancia es acotada pero practica: para desarrolladores que despliegan vision en dispositivos Qualcomm de gama AIoT, ofrece artefactos ya convertidos y medidos, evitando el trabajo de conversion a QNN y validacion en placa. No hay informacion publica sobre la arquitectura de red, el dataset de entrenamiento ni el origen exacto del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision para deteccion de atributos faciales; red neuronal no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | W8A16, W8A8 |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License (`aplux-model-farm`, licencia "other"); licencia del modelo fuente segun terminos originales |
| Formato de pesos | no disponible como pesos genericos; recursos de despliegue por SoC con binarios `model.bin` y `model.json` por variante de precision |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura de red (tipo de backbone, numero de capas, parametros) ni sobre el proceso de entrenamiento: la model card no detalla dataset, numero de tokens ni imagenes, ni si hubo ajuste fino supervisado o tecnicas de aumento de datos. Tampoco se indica el modelo fuente original a partir del cual se generaron los recursos convertidos.

Lo que si se documenta es el pipeline de despliegue: los recursos se organizan por SoC objetivo (`targets/QCS6490/`, `targets/QCS8550/`), cada uno con un `model.json` que declara la precision por defecto y las rutas de las variantes, y directorios por precision que contienen binarios `model.bin` (o paquetes multifichero tal como los publica Model Farm). Se incluyen preprocesado, postprocesado y runner, y la plataforma Agora ofrece una guia de despliegue y exportacion de proyectos. La validacion se hace placa a placa sobre hardware Qualcomm real.

## Capacidades

- Deteccion de atributos faciales sobre imagenes de entrada, con salida en formato JSON.
- Ejecucion en hardware Qualcomm via QNN, con variantes cuantizadas W8A16 y W8A8.
- Despliegue en placas AIoT concretas: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1).
- Inferencia de baja latencia medida: 2,7 ms en QCS6490 y 1,0 ms en QCS8550 (precision por defecto).
- Integracion con la plataforma Agora para prueba online sin placa y exportacion de proyectos.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni audio.

## Casos de uso

- Control de acceso y presencia en dispositivos AIoT: el modelo puede procesar fotogramas de camara en la propia placa y devolver atributos faciales en JSON, con latencias de 1-3 ms que permiten operar en tiempo real sin enviar video a la nube.
- Analitica de audiencia en retail: sobre una placa QCS6490 o QCS8550 se pueden agregar atributos anonimos de los visitantes (por ejemplo, franjas de edad o genero) para metricas de paso y atencion, manteniendo el procesamiento en el borde.
- Kioscos interactivos y senalizacion digital: adaptar el contenido mostrado segun atributos detectados en tiempo real, aprovechando la salida JSON para logica de decision en el propio dispositivo.
- Sistemas de videovigilancia con filtrado en el borde: prefiltrar eventos por atributos faciales antes de subir solo los clips relevantes, reduciendo ancho de banda y coste de almacenamiento.
- Investigacion en vision embebida: usar los artefactos ya convertidos a QNN y medidos en placa como linea base reproducible para comparar cuantizaciones W8A16 frente a W8A8 en Qualcomm.
- Prototipado rapido en AIoT: probar el modelo online en Agora sin disponer de placa y exportar el proyecto para llevarlo al dispositivo, acortando el ciclo de evaluacion.
- Automatizacion industrial o de acceso fisico: integrar la deteccion de atributos como senal auxiliar en tornos o puertas, siempre con las cautelas legales aplicables a datos biometricos.

## Benchmarks y rendimiento

La model card solo publica latencias medidas en placa con la precision por defecto de Agora:

| SoC / placa | Precisiones | Latencia medida (precision por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 2,7 ms |
| QCS8550 · Rhino Pi X1 | W8A16, W8A8 | 1,0 ms |

No se han publicado resultados de benchmarks de calidad (precision, recall, mAP u otras metricas de deteccion) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: SoCs Qualcomm QCS6490 y QCS8550, validados sobre las placas Rhino Pi A1 y Rhino Pi X1 respectivamente.
- VRAM/RAM estimada: no disponible; el repositorio completo ocupa 0,1 GB, pero el consumo en ejecucion no se documenta.
- GPU recomendadas: no aplica en el sentido convencional; el despliegue es sobre NPU/SoC Qualcomm via QNN.
- Compatibilidad con GPU consumer (RTX 4090, etc.): no documentada.
- Opciones de despliegue: runtime QNN de Qualcomm a traves de los recursos de Model Farm y la plataforma Agora (guia de despliegue y exportacion de proyectos).
- vLLM, llama.cpp, Ollama o TGI: no aplicables a este modelo.
- Latencia: 2,7 ms en QCS6490 y 1,0 ms en QCS8550 con la precision por defecto. Throughput no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de deteccion de atributos faciales para Qualcomm ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No hay informacion publica sobre la arquitectura, el dataset de entrenamiento ni las metricas de calidad, lo que impide evaluar sesgos y precision real del modelo.
- La deteccion de atributos faciales puede producir predicciones inexactas o estereotipadas en funcion de etnia, edad, iluminacion y calidad de imagen; no se documenta ningun analisis de sesgo.
- El tratamiento de atributos faciales puede constituir tratamiento de datos biometricos y estar sujeto al RGPD y normativa equivalente; es responsabilidad del desplegador evaluar base legal, consentimiento e impacto.
- La licencia es APLUX Model Farm License (categoria "other"), no una licencia open source estandar; es necesario revisar `LICENSE_MODEL_FARM.pdf` antes de cualquier uso comercial. Ademas, la licencia del modelo fuente original puede imponer condiciones adicionales.
- El modelo esta empaquetado para SoCs Qualcomm concretos; no se garantiza su funcionamiento en otras plataformas y no se ofrecen pesos genericos en formatos como safetensors o GGUF.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- La documentacion esta parcialmente en chino y la model card no detalla el esquema exacto del JSON de salida ni la lista completa de atributos detectados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/Facial-Attribute-Detection
- Prueba online en Agora: https://mega.aidlux.com/models/facial-attribute-detection
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/Facial-Attribute-Detection/blob/main/LICENSE_MODEL_FARM.pdf
