# qualcomm/MobileFaceNet

## Resumen

MobileFaceNet es una red neuronal convolucional (CNN) ligera disenada para verificacion facial en tiempo real sobre dispositivos moviles y de borde. Desarrollada originalmente en el repositorio de foamliu/MobileFaceNet y empaquetada por Qualcomm dentro de su ecosistema Qualcomm AI Hub Models, la version publicada en Hugging Face bajo el identificador `qualcomm/MobileFaceNet` incluye pesos pre-exportados y optimizados para acelerar la inferencia en las NPU de los chipsets Snapdragon y Dragonwing.

El modelo mapea una imagen facial de 112x112 pixeles a un embedding compacto de 128 dimensiones; dos embeddings se comparan mediante similitud coseno para determinar si pertenecen a la misma persona. Su arquitectura emplea convoluciones separables en profundidad y bloques residuales invertidos al estilo de MobileNetV2, lo que le permite mantenerse en torno a 1 millon de parametros y un tamano de checkpoint de 4 MB en precision float. Segun la model card, alcanza un 99,48% de precision en el benchmark LFW, y fue entrenado con la funcion de perdida ArcFace sobre el dataset MS-Celeb-1M.

Su relevancia actual radica en la demanda de biometria facial on-device con latencias sub-milisegundo y sin dependencia de la nube. Las mediciones publicadas por Qualcomm muestran tiempos de inferencia de 0,373 ms a 1,478 ms en precision w8a16 y float segun el chipset, con consumo de memoria pico tipicamente por debajo de 62 MB. La licencia Apache 2.0 facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con convoluciones separables en profundidad y bloques residuales invertidos (estilo MobileNetV2) |
| Parametros totales | 1 M (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo) |
| Tipos de cuantizacion | float, w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt), ONNX, QNN_DLC, TFLITE |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Dimension del embedding | 128 |
| Resolucion de entrada | 112x112 pixeles |
| Tamano del checkpoint (float) | 4 MB |
| Funcion de perdida en entrenamiento | ArcFace |
| Dataset de entrenamiento | MS-Celeb-1M |
| Checkpoint base | mobilefacenet.pt |
| Pipeline declarado | object-detection |
| Runtime soportado | ONNX Runtime 1.30.0, QAIRT 2.50, TFLite |

## Arquitectura y entrenamiento

MobileFaceNet es una CNN pura, sin componentes de atencion ni mecanismos generativos. Su diseno se apoya en convoluciones separables en profundidad (depthwise-separable convolutions) y en bloques residuales invertidos heredados de MobileNetV2, una combinacion que reduce drasticamente el coste computacional y el numero de parametros frente a arquitecturas de reconocimiento facial mas pesadas como ResNet o ArcFace con backbone profundo. La red toma una cara alineada y recortada a 112x112 y produce un vector de 128 dimensiones que actua como representacion biometrica; la decision de identidad se toma a posteriori comparando dos vectores mediante similitud coseno con un umbral configurable.

El entrenamiento se realizo con la funcion de perdida ArcFace sobre MS-Celeb-1M, un dataset a gran escala de celebridades ampliamente utilizado en reconocimiento facial. La model card no detalla el numero exacto de tokens ni de imagenes procesadas, la composicion final del dataset tras el filtrado, ni si se aplicaron etapas de refinamiento adicionales. La publicacion de Qualcomm no describe innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento, ya que no son aplicables a este tipo de modelo. El valor anadido del empaquetado de Qualcomm es la compilacion y el perfilado mediante Qualcomm AI Hub Workbench, que genera artefactos optimizados para NPU (QNN_DLC) y variantes cuantizadas w8a16.

## Capacidades

- Extraccion de embeddings faciales: convierte una imagen de 112x112 en un vector de 128 dimensiones utilizable para comparacion biometrica.
- Verificacion facial 1:1: determina si dos imagenes pertenecen a la misma persona mediante similitud coseno.
- Reconocimiento facial 1:N: permite busqueda de identidad en galerias comparando el embedding de consulta contra una base de embeddings precalculados.
- Inferencia en tiempo real: latencias medidas entre 0,373 ms y 1,478 ms en NPU segun chipset y precision.
- Ejecucion on-device: disenado para desplegarse en moviles, portatiles y plataformas IoT sin conexion a la nube.
- Soporte multi-runtime: artefactos ONNX, QNN_DLC y TFLITE para distintos entornos de ejecucion.
- Cuantizacion w8a16: variante de pesos en 8 bits y activaciones en 16 bits con menor latencia que float.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto; no es un modelo de lenguaje.

## Casos de uso

- Desbloqueo biometrico en dispositivos moviles: el modelo se ejecuta en la NPU del Snapdragon con latencias inferiores a 1 ms en la mayoria de chipsets de la tabla, lo que permite autenticacion practicamente instantanea sin enviar datos biometricos a la nube.
- Control de acceso fisico en edificios: integrado en camaras IP o lectores de proximidad con SoC Qualcomm, permite verificar identidades contra una galeria local de embeddings de 128 dimensiones con un coste de almacenamiento minimo (512 bytes por persona en float).
- Verificacion de identidad en procesos KYC: comparacion 1:1 entre la selfie del usuario y la fotografia del documento de identidad, ejecutable en el propio terminal para reducir el tratamiento de datos personales en servidores.
- Asistencia en entornos retail: reconocimiento de clientes recurrentes o personal autorizado en terminales de punto de venta con capacidad de computo limitada, aprovechando el consumo de memoria pico por debajo de 62 MB.
- Seguridad en vehiculos y flotas: verificacion del conductor antes de arrancar el vehiculo en plataformas con Snapdragon Ride o Dragonwing, con inferencia local que no depende de conectividad.
- Autenticacion en aplicaciones de banca movil: capa biometrica adicional sobre el desbloqueo del dispositivo, con artefactos TFLITE u ONNX integrables en apps Android mediante el SDK correspondiente.
- Analitica de presencia en eventos: conteo y deduplicacion de asistentes mediante embeddings anonimos, sin almacenar imagenes faciales en bruto.
- Procesamiento por lotes en el borde: extraccion masiva de embeddings en dispositivos Dragonwing IQ-8275 o IQ-9075 con latencias de 0,852 ms y 1,382 ms respectivamente en w8a16 y float.

## Benchmarks y rendimiento

La model card unicamente reporta la precision en el benchmark LFW (99,48%). No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de reconocimiento facial como CFP-FP, AgeDB o MegaFace, por lo que no se incluyen comparaciones numericas con otros modelos de la misma categoria.

| Benchmark | Metrica | Resultado |
|---|---|---|
| LFW | Precision | 99,48% |

Rendimiento de inferencia por chipset (extracto de la tabla publicada por Qualcomm):

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | w8a16 | 0,373 | 0 - 47 | NPU |
| Snapdragon 8 Elite For Galaxy | ONNX | w8a16 | 0,451 | 0 - 50 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy | ONNX | float | 0,538 | 0 - 36 | NPU |
| Snapdragon 8 Gen 3 | ONNX | w8a16 | 0,564 | 0 - 60 | NPU |
| Snapdragon X2 Elite | ONNX | w8a16 | 0,457 | 1 - 1 | NPU |
| Snapdragon X Elite | ONNX | w8a16 | 0,817 | 0 - 0 | NPU |
| Snapdragon 8 Gen 1 | ONNX | w8a16 | 1,09 | 0 - 62 | NPU |
| Dragonwing IQ-8275 | ONNX | w8a16 | 0,852 | 0 - 4 | NPU |
| Dragonwing IQ-9075 | ONNX | float | 1,382 | 0 - 4 | NPU |
| Dragonwing QCS6490 | ONNX | w8a16 | 2,325 | 0 - 3 | NPU |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint float ocupa 4 MB y la memoria pico medida en NPU oscila entre 0 MB y 62 MB segun chipset y precision; en GPU convencional el consumo seria marginal, inferior a 100 MB incluyendo buffers de entrada.
- GPU recomendadas: no se publican requisitos para GPU de escritorio. El modelo esta optimizado para NPU de Qualcomm (Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, X Elite, X2 Elite, Dragonwing QCS6490, QCS8450, QCS8550, IQ-8275, IQ-9075, IQ-X7181, Q-8750).
- Cabe en GPU consumer: si, por su reducido tamano (1 M de parametros) cabria en cualquier GPU consumer, aunque Qualcomm no publica mediciones para esas plataformas.
- Opciones de despliegue: ONNX Runtime 1.30.0, Qualcomm QAIRT 2.50 (QNN_DLC), TFLite, y exportacion personalizada mediante la libreria Qualcomm AI Hub Models.
- Latencia y throughput estimados: latencias de 0,373 ms a 2,325 ms por inferencia en NPU segun chipset y precision; el throughput maximo no se publica de forma explicita, pero a 0,373 ms por inferencia el limite teorico supera las 2.600 inferencias por segundo en el Snapdragon 8 Elite Gen 5.
- No esta pensado para ejecutarse en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de reconocimiento facial (por ejemplo, ArcFace con backbone ResNet, FaceNet, CosFace o AdaFace) que permitan una comparacion rigurosa. La model card solo referencia la implementacion de foamliu/MobileFaceNet como base.

| Modelo | Parametros | Entrada | Embedding | Precision LFW | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MobileFaceNet (qualcomm) | 1 M | 112x112 | 128 | 99,48% | Apache 2.0 | Hugging Face + Qualcomm AI Hub |
| Alternativas de la categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: la model card no documenta analisis de sesgo por etnia, genero o edad. El entrenamiento sobre MS-Celeb-1M, un dataset de celebridades, puede introducir desequilibrios demograficos que afecten a la tasa de acierto en poblaciones subrepresentadas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la verificacion; el umbral de similitud coseno debe calibrarse para cada caso de uso.
- Limitaciones de contexto o idioma: no procesa lenguaje; su unica entrada es una imagen facial de 112x112. Caras pequenas, oclusiones, angulos extremos, iluminacion adversa o baja resolucion degradaran la calidad del embedding.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion, pero el uso de reconocimiento facial esta sujeto a normativa especifica (RGPD en la UE, BIPA en Illinois, entre otras) que puede exigir consentimiento explicito y evaluaciones de impacto.
- Caveat para produccion: los artefactos estan optimizados para NPU de Qualcomm; el rendimiento en otras plataformas no esta medido por el autor. La variante w8a16 puede introducir una ligera perdida de precision frente a float que conviene validar sobre el conjunto de evaluacion propio.
- El pipeline declarado en Hugging Face es `object-detection`, aunque la funcion real del modelo es extraccion de embeddings y verificacion facial; conviene tenerlo en cuenta al integrarlo en frameworks que infieran la tarea a partir de ese campo.
- No se documenta el proceso de alineacion facial previo; el modelo asume una cara ya recortada y alineada, por lo que se necesita un detector y un alineador externos en el pipeline completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/MobileFaceNet
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/mobile_facenet
- Repositorio Qualcomm AI Hub Models (v0.66.0): https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/mobile_facenet
- Implementacion base de MobileFaceNet: https://github.com/foamliu/MobileFaceNet
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Informacion corporativa: https://www.qualcomm.com/company
