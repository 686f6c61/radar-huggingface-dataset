# RKNNAI/RK3588-CNN-retinaface-mobile

## Resumen

RK3588-CNN-retinaface-mobile es un paquete de despliegue en formato RKNN del detector de caras RetinaFace, preparado especificamente para la NPU del SoC Rockchip RK3588. Lo publica el usuario RKNNAI y no entrena ningun modelo nuevo: convierte a formato RKNN el modelo original de codigo abierto biubug6/Pytorch_Retinaface, que es una red convolucional de tipo single-stage que detecta rostros y, ademas, predice cinco puntos faciales (ojos, nariz y comisuras de la boca).

El interes de esta publicacion no esta en la arquitectura, que es bien conocida desde 2019, sino en el empaquetado de despliegue: incluye una configuracion ya cuantizada a w8a8 (pesos y activaciones de 8 bits) a una resolucion de entrada de 320x320, validada contra la version v2.4.0 del runtime RKNN y restringida a una unica configuracion de un solo nucleo NPU. Esto permite ejecutar deteccion facial en tiempo real en placas embebidas de bajo consumo sin necesidad de GPU ni de servidores externos.

Es relevante para desarrolladores que trabajan en vision por computador sobre hardware Rockchip, porque elimina el paso de conversion (PyTorch a ONNX y de ONNX a RKNN) y el ajuste de cuantizacion, que suele ser la parte mas laboriosa del despliegue. El repositorio pesa 0,0 GB segun HuggingFace y no registra descargas ni likes en el momento de la consulta, por lo que se trata de una publicacion reciente y practicamente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN single-stage (RetinaFace) con backbone tipo "mobile"; el proyecto de origen usa MobileNetV1 0.25x |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no autoregresivo) |
| Tipos de cuantizacion | w8a8 (8 bits en pesos y activaciones), configuracion `retinaface-mobile-320x320-w8a8-1` |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | RKNN (runtime RKNN v2.4.0); modelo fuente en PyTorch y ONNX |
| Resolucion de entrada | 320x320 |
| SoC soportado | RK3588 |
| Nucleos NPU utilizados | 1 |

## Arquitectura y entrenamiento

RetinaFace es un detector de caras de una sola etapa que combina tres tareas en una misma salida: clasificacion de cara o no-cara, regresion de cajas delimitadoras y regresion de cinco landmarks faciales (dos ojos, nariz y las dos comisuras de la boca). La variante "mobile" del proyecto original utiliza un backbone ligero del tipo MobileNet con factor de anchura 0.25, segun el propio script de conversion del proyecto de origen (`convert_to_onnx.py -m ./weights/mobilenet0.25_Final.pth --network mobile0.25 --long_side 320`), lo que da un modelo de muy baja carga computacional orientado a dispositivos empotrados. Esta ficha no dispone de la confirmacion explicita del backbone en la model card, solo de la evidencia del proyecto fuente citado en la busqueda web.

No se dispone de informacion sobre el entrenamiento en la documentacion proporcionada: ni el numero de tokens o imagenes, ni la composicion del dataset, ni si se aplicaron tecnicas de refinamiento posteriores. El modelo se hereda tal cual del proyecto biubug6/Pytorch_Retinaface; la aportacion de esta publicacion es exclusivamente la conversion a RKNN y la cuantizacion a w8a8 para la NPU del RK3588. Un detalle tecnico de despliegue relevante es la verificacion de integridad: el repositorio incluye un fichero `SHA256SUMS` que debe validarse antes de desplegar en placa, y el propio autor advierte de que deben usarse siempre ficheros de la misma configuracion.

## Capacidades

- Deteccion de caras en imagenes y fotogramas de video, con salida de cajas delimitadoras y puntuaciones de confianza.
- Prediccion de cinco landmarks faciales por rostro detectado (dos ojos, punta de la nariz y comisuras de la boca).
- Inferencia acelerada por NPU en el SoC RK3588 mediante el runtime RKNN v2.4.0.
- Ejecucion completamente local, sin dependencia de servicios en la nube ni de GPU dedicada.
- Soporte de cuantizacion w8a8 (INT8) para reducir huella de memoria y latencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingues, de generacion de texto, de codigo ni de audio.
- Capacidad especial: alineacion facial basica mediante los cinco puntos, util para etapas posteriores de reconocimiento facial (normalmente un modelo de embeddings distinto, no incluido aqui).

## Casos de uso

- Control de acceso en dispositivos de puerta: el detector identifica si hay una cara en el encuadre y devuelve los cinco landmarks, que permiten alinear el rostro antes de pasarlo a un modelo de reconocimiento; funciona integramente en la placa RK3588, sin enviar imagenes a Internet.
- Monitorizacion de presencia en aulas o salas de reunion: se ejecuta sobre el flujo de una camara IP y cuenta caras por fotograma para generar estadisticas de ocupacion, aprovechando la inferencia INT8 a 320x320 para sostener tasas de fotogramas altas.
- Preprocesado de vision en drones o robots moviles: el detector actua como primera etapa que localiza personas en el campo de vision y activa modulos mas costosos solo cuando hay deteccion, reduciendo el consumo energetico total del sistema embebido.
- Analitica de retail en el borde: conteo de visitantes y medicion de permanencia frente a escaparates sin almacenar imagen identificable, ya que el modelo solo devuelve cajas y puntos, no identidades.
- Vision artificial industrial para control de acceso a zonas restringidas: integracion en un equipo con RK3588 que verifica presencia humana antes de arrancar maquinaria peligrosa, con latencia predecible por estar cuantizado a INT8 y correr en un solo nucleo NPU.
- Organizacion automatica de fototecas en NAS domesticos: indexado de fotografias por presencia de personas y recorte automatico del rostro basado en los landmarks, ejecutado en local para preservar la privacidad.
- Sistemas de videovigilancia con desenfoque selectivo: el detector localiza caras en tiempo real y un paso posterior aplica desenfoque solo sobre esas regiones, util para cumplir requisitos de minimizacion de datos.
- Prototipado e investigacion sobre RK3588: referencia lista para usar (modelo, SHA256SUMS y configuracion) que sirve como linea base al comparar variantes propias de deteccion facial en la misma NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (WIDER FACE, mAP), latencia ni throughput, ni comparaciones con otras implementaciones. El autor solo documenta la configuracion de despliegue (resolucion 320x320, cuantizacion w8a8, un nucleo NPU, runtime v2.4.0).

## Requisitos de hardware

- SoC objetivo: Rockchip RK3588. La configuracion publicada esta restringida a este chip y a la version v2.4.0 del runtime RKNN; no se declara compatibilidad con RK3562, RK3566, RK3568, RV1109 o RV1126, que si aparecen como plataformas alternativas en el flujo de conversion del proyecto de origen.
- NPU: el RK3588 integra una NPU de 6 TOPS en INT8 repartidos en varios nucleos; esta configuracion concreta utiliza un unico nucleo NPU.
- VRAM: no aplica, no se usa GPU. La inferencia es INT8 (w8a8) a 320x320, por lo que la huella de memoria es reducida, aunque no se publica la cifra exacta de consumo de memoria del runtime.
- GPU de escritorio: no necesaria ni soportada por esta publicacion. Para ejecutar la red en PC habria que recurrir al modelo ONNX o PyTorch del proyecto original, no al fichero RKNN.
- Despliegue: runtime RKNN v2.4.0 sobre RK3588. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje y no aplican a una CNN de vision. Existen ejemplos de integracion en Go (go-rknnlite, rknn-go) y el ejemplo oficial de RetinaFace en rknn_model_zoo.
- Latencia y throughput: no disponible. Dependera de la frecuencia de la NPU, del ancho de banda de memoria y del resto de la carga del sistema en la placa.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK3588-CNN-retinaface-mobile (esta ficha) | CNN single-stage, deteccion + 5 landmarks | 320x320 | w8a8 (INT8) | RKNN para RK3588 | MIT | HuggingFace y ModelScope, revision v2.4.0 |
| Pytorch_Retinaface (biubug6) | CNN single-stage, deteccion + 5 landmarks | configurable (por ejemplo 320 en el lado largo) | sin cuantizar | PyTorch y ONNX | MIT | GitHub |
| RetinaFace con backbone ResNet50 | CNN single-stage, mayor capacidad | configurable | sin cuantizar en origen | PyTorch y ONNX | MIT | GitHub |
| py-feat/retinaface | Distribucion del mismo detector en HuggingFace | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de precision ni de latencia comparativos entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a formato de despliegue, soporte de hardware y licencia. La diferencia funcional clave frente a la version PyTorch/ONNX es que esta publicacion ya esta adaptada y cuantizada para la NPU del RK3588, mientras que las otras requieren conversion manual.

## Limitaciones y advertencias

- La model card no aporta datos de precision, sesgo ni evaluacion por subgrupos. No hay evidencia publicada sobre el comportamiento del detector ante distintas tonalidades de piel, generos, edades u oclusiones.
- Al ser un modelo cuantizado a INT8, es esperable una perdida de precision respecto al modelo en punto flotante, pero no se publica ninguna medicion de esa degradacion.
- El modelo solo detecta caras y cinco puntos faciales; no identifica personas, no reconoce emociones y no genera ningun tipo de descripcion textual. Cualquier tarea de reconocimiento requiere un modelo adicional de embeddings.
- La licencia MIT permite uso comercial, pero se hereda del proyecto biubug6/Pytorch_Retinaface; conviene conservar los avisos de copyright y atribucion incluidos en el fichero LICENSE del repositorio.
- Compatibilidad restringida: solo RK3588 y runtime RKNN v2.4.0 segun la configuracion publicada. Usar ficheros de configuraciones distintas o versiones de runtime no validadas puede producir fallos de carga o resultados incorrectos.
- Se debe verificar la integridad de los ficheros con `sha256sum -c SHA256SUMS` antes de desplegar; la propia documentacion marca este paso como obligatorio.
- El tratamiento de imagenes de rostros esta sujeto a normativa de proteccion de datos (RGPD en la Union Europea). La deteccion de caras es dato biometrico cuando se usa para identificar a una persona, y su uso en espacios publicos requiere base juridica y evaluacion de impacto.
- Riesgo de alucinacion: no aplica en el sentido de los modelos generativos, pero si existe riesgo de falsos positivos y falsos negativos, especialmente con caras muy pequenas, giradas, ocluidas o en condiciones de iluminacion adversa. No se publican umbrales de confianza recomendados.
- El repositorio figura con 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni reportes de fallos en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-retinaface-mobile
- Modelo original: https://github.com/biubug6/Pytorch_Retinaface
- Ejemplo oficial de RetinaFace en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/RetinaFace
- Ejemplo de RetinaFace en rk3588-example (GitHub): https://github.com/exyexin/rk3588-example/blob/main/examples/RetinaFace/README.md
- Ejemplo de RetinaFace en rknn_model_zoo (espejo en Gitee): https://gitee.com/wirelesser/rknn_model_zoo/blob/main/examples/RetinaFace/README.md
- Dependencias de datos para RKNN en Go: https://github.com/phox/rknn-go-data
- Ejemplo go-rknnlite para RetinaFace: https://pkg.go.dev/github.com/swdee/go-rknnlite/example/retinaface
- Otra distribucion del detector en HuggingFace: https://huggingface.co/py-feat/retinaface
- Descarga via ModelScope: `modelscope download --model RKNNAI/RK3588-CNN-retinaface-mobile --revision v2.4.0`
- Descarga via HuggingFace CLI: `hf download RKNNAI/RK3588-CNN-retinaface-mobile --revision v2.4.0 --local-dir ./RK3588-CNN-retinaface-mobile`
