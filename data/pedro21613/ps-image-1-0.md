# Pedro21613/PS-IMAGE-1.0

## Resumen
PS IMAGE 1.0 es un clasificador de imagenes ligero desarrollado por el usuario Pedro21613 y publicado en HuggingFace. Se trata de un fine-tune de MobileNetV2 sobre el dataset abierto CIFAR-10, con 2,24 millones de parametros y un peso de aproximadamente 9 MB en precision FP32. El modelo resuelve una tarea acotada de vision por computador: asignar una imagen de entrada a una de las diez clases de CIFAR-10 (avion, carro, pajaro, gato, ciervo, perro, rana, caballo, barco y camion).

Su relevancia es practica mas que innovadora: demuestra que con tecnicas de aumento de datos (Mixup, RandAugment, RandomErasing, Label Smoothing) y un proceso de fine-tuning cuidadoso se puede llevar una arquitectura movil de 9 MB a un 94,10 % de accuracy en el conjunto de test, frente al 90,46 % de la version anterior. Es un candidato claro para despliegues en el borde (edge), dispositivos con recursos limitados o aplicaciones educativas donde el coste de inferencia y el tamano del binario son criticos.

La model card esta redactada en portugues y describe dos versiones (v1 con input de 96 px y v2 con input de 128 px). No se declara licencia ni idiomas, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con convoluciones separables en profundidad e inverted residuals) |
| Parametros totales | 2,24 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada de 128x128 px en v2) |
| Tipos de cuantizacion | no disponibles en el repositorio; el peso publicado esta en FP32. Al ser PyTorch, admite cuantizacion dinamica o estatica a INT8 mediante las herramientas nativas del framework |
| Idiomas soportados | no aplica (vision). Las etiquetas de clase estan en portugues |
| Licencia | no disponible |
| Formato de pesos | `PS IMAGE 1.0.pth` (state_dict de PyTorch) y `pytorch_model.bin` (mismo peso en formato estandar de HuggingFace) |

## Arquitectura y entrenamiento
La base es MobileNetV2, una red convolucional disenada para eficiencia en dispositivos moviles. Usa bloques de residuales invertidos con conexiones de salto, convoluciones separables en profundidad y una funcion de activacion ReLU6 con cuello de botella lineal. La cabecera de clasificacion original se sustituye por una capa lineal de 10 salidas (`torch.nn.Linear(m.last_channel, 10)`), correspondiente a las diez clases de CIFAR-10.

El entrenamiento de la version v2 parte del checkpoint de la v1 (90,46 % de accuracy) y aplica fine-tuning durante 10 epocas sobre una Tesla T4, con optimizador AdamW (learning rate 5e-4), scheduler de coseno, precision mixta automatica (AMP) y un pipeline de aumento de datos compuesto por RandAugment, Mixup con alpha 0,4, Random Erasing y Label Smoothing. La resolucion de entrada se eleva de 96x96 a 128x128 px para capturar mas detalle. El dataset es CIFAR-10 (licencia MIT), cargado via `torchvision`. No se documentan innovaciones arquitectonicas propias ni tecnicas de decodificacion especulativa; la mejora proviene esencialmente de la receta de entrenamiento y de la mayor resolucion de entrada.

## Capacidades
- Clasificacion de imagenes en 10 categorias cerradas de CIFAR-10 (avion, carro, pajaro, gato, ciervo, perro, rana, caballo, barco y camion).
- Inferencia sobre imagenes reescaladas a 128x128 px con normalizacion especifica de CIFAR-10 (media 0,4914/0,4822/0,4465 y desviacion 0,2023/0,1994/0,2010).
- Ejecucion en CPU y GPU indistintamente mediante PyTorch.
- La model card incluye un script de inferencia (`usar_modelo.py`) y ejemplos de uso en Python listos para copiar.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, soporte de agentes ni capacidades multilingues: es exclusivamente un clasificador visual.
- El autor demuestra ademas el uso complementario de `stabilityai/sd-turbo` para generar imagenes de 1280x720 que el clasificador despues valida, aunque esa generacion no forma parte del modelo.

## Casos de uso
- Clasificacion en el borde: con 9 MB de peso, el modelo puede empaquetarse en aplicaciones moviles, Raspberry Pi o microcontroladores con aceleracion, clasificando imagenes localmente sin conexion a red.
- Prototipado docente: sirve como ejemplo completo de fine-tuning de MobileNetV2 sobre CIFAR-10, con recetas reproducibles de aumento de datos y AMP, ideal para cursos de vision por computador.
- Filtrado previo en pipelines de datos: etiquetar rapidamente grandes volumenes de imagenes de 128x128 para tareas de triaje o seleccion antes de pasar a modelos mayores.
- Validacion de datasets generados: como en los ejemplos del autor, se puede usar para comprobar que imagenes sinteticas (por ejemplo, generadas con SD-Turbo) pertenecen a la clase esperada.
- Demostraciones de despliegue ligero: exportar a ONNX o TorchScript para comparar latencia y consumo entre runtimes en entornos embebidos.
- Baseline en investigacion: punto de partida rapido para experimentos de aumento de datos o cuantizacion sobre CIFAR-10, dado su bajo coste de entrenamiento (10 epocas en una Tesla T4).
- Sistemas de juguete o educativos: clasificacion de fotos en aplicaciones de aprendizaje automatico para principiantes, con diez categorias intuitivas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en test de CIFAR-10 (v2) | 94,10 % |
| Accuracy en test de CIFAR-10 (v1, referencia interna) | 90,46 % |
| Ejemplos de la model card acertados | 8/8 |

Confianzas reportadas en los ejemplos individuales de la model card: caballo 87,9 %, barco 89,4 %, barco 88,0 %, avion 91,1 %, ciervo 90,4 %, caballo 86,8 %, perro 90,4 % y gato 51,9 % (este ultimo es el unico con confianza baja pese a acertar la clase). No se publican resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican; no hay tabla comparativa de accuracy frente a ResNet, VGG u otras arquitecturas en la informacion disponible).

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 100 MB. El peso en FP32 ocupa unos 9 MB y las activaciones de una imagen de 128x128 son minimas.
- GPU recomendadas: cualquier GPU moderna es sobrada. Una Tesla T4 (la usada en entrenamiento), una RTX 3060/4090 o incluso una GTX 1050 ejecutan el modelo sin problema.
- Cabe holgadamente en GPU de consumo y tambien en CPU; puede correr en Raspberry Pi, moviles y otros dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo, TorchScript, exportacion a ONNX con ONNX Runtime, TensorRT, o conversion a TFLite para Android/iOS. Tambien admite cuantizacion INT8 para reducir aun mas el tamano.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano del modelo, se espera una latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero se trata de una estimacion, no de un dato publicado.
- Entrenamiento documentado: 10 epocas de fine-tuning en una Tesla T4 con AMP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PS IMAGE 1.0 (MobileNetV2 + CIFAR-10) | 2,24 M | 128x128 px, 10 clases | 94,10 % en CIFAR-10 test | no disponible | HuggingFace |
| MobileNetV2 preentrenado en ImageNet | no disponible (no se aporta cifra) | 224x224 px, 1000 clases | no disponible para CIFAR-10 | no disponible | torchvision / HuggingFace |
| ResNet-18 sobre CIFAR-10 | no disponible | segun entrenamiento | no disponible | no disponible | torchvision |
| Otros clasificadores ligeros (EfficientNet-Lite, MobileNetV3) | no disponible | no disponible | no disponible | no disponible | HuggingFace / TF Hub |

No se dispone de cifras de rendimiento para las alternativas en la informacion proporcionada; la comparacion cuantitativa queda por tanto marcada como no disponible.

## Limitaciones y advertencias
- Alcance muy restringido: solo clasifica las diez clases de CIFAR-10. Cualquier imagen fuera de esas categorias se forzara a una de las diez etiquetas, generando falsos positivos.
- Baja resolucion efectiva: aunque la entrada v2 es de 128x128 px, el modelo se entrena sobre imagenes originales de 32x32 px de CIFAR-10, por lo que carece de detalle para resoluciones reales altas (el propio autor lo reconoce al comentar el caso de las imagenes 720p).
- Riesgo de sobreajuste al dominio CIFAR-10: fotos reales de camara pueden degradar la accuracy respecto al 94,10 % reportado en test.
- Clases con confusion documentada: el ejemplo de gato obtiene una confianza de apenas el 51,9 %, lo que sugiere dificultad en categorias visualmente similares (gato/perro, ciervo/caballo).
- Sin licencia declarada: no se puede asumir uso comercial sin consultar al autor; la ausencia de licencia es un riesgo legal en produccion.
- Sesgos del dataset: CIFAR-10 es un dataset reducido, desbalanceado respecto al mundo real y con clases culturalmente sesgadas; el modelo hereda esas limitaciones.
- Metadatos incompletos: no hay informacion sobre idiomas, cuantizaciones publicadas ni metricas de latencia.
- El repositorio aparece sin descargas ni likes y con un tamano de 0,0 GB en los metadatos, lo que puede indicar que los pesos no estan efectivamente alojados; conviene verificarlo antes de depender de el.

## Enlaces
- HuggingFace: https://huggingface.co/Pedro21613/PS-IMAGE-1.0
- La busqueda web no ha devuelto resultados relevantes para este modelo. Los unicos enlaces recuperados tratan sobre el satelite lunar, la cancion "ay" y la palabra "ay" en diccionarios, y no guardan relacion con PS IMAGE 1.0. No se han encontrado papers, repositorios, blogs ni demos adicionales en la informacion disponible.
