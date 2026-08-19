# Blaize-AI/SCRFDkps2500M_Widerface

## Resumen

SCRFDkps2500M_Widerface es un detector de caras basado en la arquitectura SCRFD (Sample and Computation Redistribution for Efficient Face Detection), desarrollado originalmente por InsightFace y optimizado por Blaize-AI para su despliegue en los aceleradores Blaize Xplorer mediante el SDK Picasso. El modelo devuelve cajas delimitadoras (bounding boxes) junto con 5 puntos clave faciales (ojos, nariz y comisuras de la boca), lo que lo hace adecuado para tareas de detección y alineación facial en entornos de edge computing.

La versión publicada en HuggingFace corresponde a una variante cuantizada en BF16 con resolución de entrada fija de 640x640 píxeles, almacenada en formato `.bm` específico del hardware Blaize. El modelo fue entrenado sobre el dataset WIDER Face, un conjunto de referencia ampliamente utilizado para detección facial en escenas no controladas. Su relevancia radica en ofrecer una solución de inferencia facial de baja latencia y alta eficiencia energética en aceleradores de borde, un nicho donde las GPUs tradicionales no siempre son viables.

La ficha se basa exclusivamente en la información pública disponible en la model card y en los resultados de búsqueda. No se han publicado métricas de rendimiento ni detalles adicionales sobre el entrenamiento en la documentación accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCRFD (detector de caras de una etapa con salida de cajas y 5 keypoints) |
| Parametros totales | no disponible (el nombre sugiere 2500M, sin confirmacion oficial) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | BF16 (unica variante publicada) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 (modelo), dataset original CC-BY-NC-ND-4.0 |
| Formato de pesos | `.bm` (Blaize model, especifico de Picasso SDK) |

## Arquitectura y entrenamiento

SCRFD es un detector de caras de una etapa que redistribuye la carga computacional entre las etapas de extraccion de caracteristicas y deteccion para mejorar la eficiencia sin sacrificar precision. La arquitectura base, descrita en el repositorio oficial de InsightFace, emplea un backbone de tipo ResNet y cabezales de deteccion que producen simultaneamente cajas y puntos clave faciales. El modelo original se distribuye en formato ONNX y acepta entradas dinamicas, aunque la version optimizada por Blaize fija la resolucion a 640x640.

El entrenamiento se realizo sobre el dataset WIDER Face, que contiene decenas de miles de imagenes con anotaciones de caras en condiciones variadas (oclusiones, iluminacion adversa, escalas diversas). No se especifica el numero exacto de epocas, el tamaño del lote ni si se aplicaron tecnicas de aumento de datos. La optimizacion para hardware Blaize implica una conversion a grafo de computo y cuantizacion a BF16, que mantiene una precision cercana a la de punto flotante completo con un menor coste de memoria. No se menciona el uso de RLHF, DPO u otras tecnicas de ajuste por refuerzo, ya que no es un modelo generativo.

## Capacidades

- Deteccion de caras en imagenes, devolviendo coordenadas de cajas delimitadoras.
- Estimacion de 5 puntos faciales (dos ojos, nariz y dos comisuras labiales) para tareas de alineacion.
- Inferencia optimizada para aceleradores Blaize GSP con cuantizacion BF16.
- Soporte de resolucion fija de 640x640 píxeles.
- No es un modelo de lenguaje: no genera texto, no realiza tool calling ni razonamiento simbolico.
- No incluye capacidades de vision general (clasificacion, segmentacion, etc.) mas alla de la deteccion facial.

## Casos de uso

- Control de acceso biometrico: el modelo puede integrarse en sistemas de videovigilancia para detectar caras y extraer los 5 puntos clave, que luego se usan para normalizar y comparar con bases de datos de empleados o visitantes. Su baja latencia en hardware de borde permite decisiones en tiempo real.
- Analisis de video en retail: contaje de personas y analisis de flujo de clientes mediante la deteccion de caras en camaras de seguridad. La cuantizacion BF16 reduce el consumo energetico, adecuado para despliegues continuos en tiendas.
- Sistemas de atencion al conductor: deteccion de rostro y puntos faciales para monitorizar la fatiga o la distraccion en vehiculos. El tamaño reducido del modelo y su compatibilidad con aceleradores embebidos facilitan su integracion en unidades de a bordo.
- Verificacion de identidad en kioscos digitales: combinado con un modelo de reconocimiento facial, permite autenticar usuarios en cajeros automaticos o puntos de informacion. La salida de keypoints mejora la robustez frente a variaciones de pose e iluminacion.
- Efectos de realidad aumentada: aplicaciones de maquillaje virtual o filtros faciales que requieren un seguimiento preciso de los puntos faciales. El modelo puede ejecutarse en dispositivos de borde con baja latencia para una experiencia fluida.
- Moderacion de contenido en redes sociales: pre-deteccion de caras en imagenes subidas para aplicar politicas de privacidad (difuminado) o para indexar contenido. La licencia Apache-2.0 del modelo permite su integracion en servicios propietarios, aunque el dataset de entrenamiento tiene restricciones de uso no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (mAP, recall) ni comparaciones con otros detectores de caras. Tampoco se proporcionan datos de latencia o throughput en hardware Blaize. Se recomienda consultar el repositorio original de InsightFace para obtener resultados del modelo SCRFD base, aunque no se garantiza que la version optimizada por Blaize mantenga las mismas cifras.

## Requisitos de hardware

- Acelerador requerido: Blaize Xplorer (familia GSP). El modelo no es compatible con GPUs convencionales ni con CPUs estandar.
- Software necesario: Blaize Picasso SDK, incluyendo la utilidad `blaize-modeltool` para inspeccion del modelo.
- VRAM estimada: no disponible. El tamaño del archivo `.bm` es de 0.0 GB segun HuggingFace, lo que sugiere que el modelo es muy ligero, pero el consumo real de memoria depende de la implementacion del runtime.
- Opciones de despliegue: exclusivamente mediante Picasso SDK en hardware Blaize. No se menciona soporte para vLLM, Ollama, TGI u otros frameworks de inferencia generica.
- Latencia y throughput: no publicados. Dado que es un modelo de deteccion de una etapa con resolucion 640x640, se espera una latencia de pocos milisegundos en el acelerador objetivo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| SCRFDkps2500M (este) | no disponible | 640x640 | .bm (Blaize) | Apache-2.0 | Blaize Xplorer |
| YOLOv8n_Widerface (Blaize-AI) | no disponible | 640x384 | .bm | AGPL-3.0 | Blaize Xplorer |
| RetinaFace (original) | ~1M a ~27M segun backbone | variable | ONNX | MIT | GPU/CPU |

La comparativa se limita a detectores de caras con salida de keypoints. RetinaFace, tambien de InsightFace, es una alternativa popular con soporte amplio en frameworks estandar, pero no esta optimizada para hardware Blaize. La variante YOLOv8n de Blaize ofrece una licencia AGPL-3.0, mas restrictiva para uso comercial que la Apache-2.0 de este modelo. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta optimizado exclusivamente para hardware Blaize GSP. No es portable a GPUs NVIDIA, AMD o CPUs sin una reconversion completa del grafo, lo que limita su uso en entornos convencionales.
- El dataset de entrenamiento WIDER Face se distribuye bajo licencia CC-BY-NC-ND-4.0, que prohibe el uso comercial y las obras derivadas. Aunque el modelo en si tiene licencia Apache-2.0, el origen de los datos de entrenamiento podria generar conflictos legales si se utiliza el modelo en aplicaciones comerciales. Se recomienda consultar con un asesor legal.
- No se han publicado evaluaciones de sesgos o errores. Los detectores de caras pueden fallar en condiciones de oclusion severa, rostros muy pequenos o iluminacion extrema, como es habitual en este tipo de modelos.
- La resolucion fija de 640x640 puede no ser optima para imagenes con caras muy pequenas o muy grandes; no se ofrece soporte para resoluciones dinamicas en esta variante.
- El repositorio no incluye el modelo original en ONNX ni pesos en otros formatos (safetensors, GGUF), solo el archivo `.bm` compilado. Esto impide su uso con herramientas estandar de vision por computador.
- No hay documentacion sobre el proceso de cuantizacion BF16 ni sobre la degradacion de precision respecto al modelo original en punto flotante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blaize-AI/SCRFDkps2500M_Widerface
- Repositorio original de InsightFace (SCRFD): https://github.com/deepinsight/insightface/tree/master/detection/scrfd
- Dataset WIDER Face: http://shuoyang1213.me/WIDERFACE/
- Web oficial de Blaize: https://www.blaize.com/
- Pagina de productos Blaize (Xplorer): https://www.blaize.com/products/
