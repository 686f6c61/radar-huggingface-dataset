# OncomIA01/cnn-perros-gatos-clase

## Resumen

cnn-perros-gatos-clase es un cuaderno de Jupyter con fines docentes publicado por el usuario OncomIA01 en Hugging Face. No es un modelo entrenado listo para usar, sino material didactico en espanol que construye, entrena y desmonta una red neuronal convolucional (CNN) paso a paso, siguiendo una unica fotografia de un perro a lo largo de todo el proceso mediante animaciones. La red resultante, bautizada como CNNMama, tiene 97.809 pesos y se entrena dentro del propio cuaderno en menos de un minuto en CPU.

La arquitectura se compone de cuatro bloques Conv 3x3, BatchNorm, ReLU y MaxPool con 16, 32, 64 y 128 filtros, seguidos de un promedio global, Dropout de 0,3 y una capa Linear(128, 1). El entrenamiento usa 300 imagenes de 64x64 durante 20 epocas (AdamW, lr = 5·10⁻⁴, volteo horizontal) y ronda el 75 % de acierto sobre 100 imagenes no vistas. La seleccion de datos es una eleccion docente fija de 400 imagenes (200 gatos y 200 perros) del dataset microsoft/cats_vs_dogs, no una muestra aleatoria ni un benchmark.

Su relevancia es exclusivamente pedagogica: sirve para explicar convolucion, filtros, pooling, mapas de caracteristicas, Flatten y el bucle de entrenamiento sin cajas negras, e incluye una version web alojada como Space para usarla en clase sin instalar nada. El propio autor advierte que no es un clasificador para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) propia, CNNMama: 4 bloques Conv 3x3 -> BatchNorm -> ReLU -> MaxPool (16, 32, 64 y 128 filtros), promedio global, Dropout(0,3), Linear(128 -> 1) |
| Parametros totales | 97.809 pesos |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes de 64x64 px; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el cuaderno usa pesos en coma flotante de PyTorch sin cuantizar |
| Idiomas soportados | es (idioma del material docente; el modelo no tiene capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | no distribuidos en el repositorio; los pesos se generan al ejecutar el cuaderno (state_dict de PyTorch en memoria, ~0,4 MB en float32) |
| Tarea declarada | image-classification (clasificacion binaria perro/gato) |
| Libreria | PyTorch |
| Dataset de entrenamiento | microsoft/cats_vs_dogs, seleccion docente fija de 400 imagenes (200 gatos y 200 perros) |
| Entrada | imagenes RGB de 64x64 px |
| Salida | probabilidad escalar (sigmoide) entre perro y gato |
| Configuracion de entrenamiento | 300 imagenes, 20 epocas, AdamW, lr = 5·10⁻⁴, volteo horizontal, semilla fija |
| Autor | OncomIA01 |
| Fecha de creacion y ultima actualizacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El cuaderno define una CNN convolucional clasica de tipo feed-forward, sin mecanismos de atencion ni componentes recurrentes. Cada uno de los cuatro bloques aplica una convolucion 3x3 seguida de normalizacion por lotes, activacion ReLU y reduccion espacial mediante MaxPool. Tras el ultimo bloque, la red aplica un promedio global (global average pooling) que colapsa el mapa de caracteristicas, un Dropout con probabilidad 0,3 y una capa lineal que proyecta 128 caracteristicas en una sola salida, interpretada mediante una funcion sigmoide. El total asciende a 97.809 pesos, un tamano deliberadamente reducido para que el entrenamiento sea inmediato y el repaso de cada tensor resulte manejable en clase.

El entrenamiento se ejecuta integramente en el cuaderno: 300 imagenes de 64x64, 20 epocas, optimizador AdamW con lr = 5·10⁻⁴ y aumento de datos por volteo horizontal. No se documenta RLHF, DPO ni ninguna fase de ajuste posterior. La innovacion del material no esta en la arquitectura, sino en la instrumentacion didactica: se guardan los filtros y los mapas de caracteristicas en cada epoca, se visualiza una ventana 3x3 multiplicando y sumando, se comparan MaxPool y AvgPool sobre la misma fotografia (de 64 a 4 pixeles) y se recorre la red completa mostrando los numeros reales, incluidos Flatten, Dropout, Linear y la sigmoide. La seccion final incluye matriz de confusion e inferencia sobre 16 fotografias nuevas.

## Capacidades

- Generacion de texto, razonamiento, codigo o matematicas: no aplica; el repositorio no contiene un modelo de lenguaje.
- Vision por computador: clasificacion binaria perro/gato sobre imagenes de 64x64 px con la red CNNMama entrenada en el propio cuaderno.
- Tool calling y function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no aplica; el unico idioma presente es el espanol del material didactico.
- Capacidad especial de ensenanza: animaciones paso a paso de convolucion, filtros, pooling, mapas de caracteristicas, Flatten, entrenamiento epoca a epoca y trazado completo de una imagen por la red.
- Reproducibilidad: semilla fija, con resultado repetible en la misma maquina segun el autor.
- Modo autonomo: la seccion 0 genera los ficheros de codigo auxiliares (modelo.py, animaciones.py, datos_perros_gatos.py) y la primera ejecucion descarga 400 imagenes (unos 10 MB); despues funciona sin conexion.
- Despliegue ligero: entrenamiento completo en CPU en menos de un minuto y version web publicada como Space.

## Casos de uso

- Docencia universitaria de fundamentos de deep learning: el cuaderno permite abrir una CNN por dentro en una sesion de practicas, mostrando convolucion, pooling y mapas de caracteristicas con animaciones y con los numeros reales de una fotografia concreta, sin depender de una caja negra.
- Talleres y bootcamps introductorios: sirve como primera practica antes de pasar a frameworks de alto nivel, porque el entrenamiento completo cabe en menos de un minuto en CPU y no exige GPU ni cuentas en la nube.
- Autoaprendizaje de arquitecturas convolucionales: quien ya programa pero no ha implementado una CNN puede ejecutar el cuaderno en Jupyter, VS Code o Google Colab y ver como el filtro cambia lo que resalta (bordes, suavizado, realce) segun se entrena.
- Clase sin instalacion local: el Space web asociado permite proyectar las animaciones en un aula o en una charla sin que el alumnado instale Python ni PyTorch.
- Practicas de ampliacion y experimentacion controlada: sobre el mismo esqueleto se pueden modificar el numero de filtros, el numero de epocas, el tipo de pooling o la resolucion de entrada y comparar el efecto en la matriz de confusion, con una linea base reproducible.
- Divulgacion cientifica y jornadas de puertas abiertas: las animaciones de la ventana 3x3 y de MaxPool frente a AvgPool son adecuadas para explicar a publico no tecnico que hace una red convolucional.
- Material base para docentes que quieran reutilizar la estructura: los ficheros generados por la seccion 0 separan modelo, animaciones y carga de datos, lo que facilita adaptar el cuaderno a otro dataset binario.
- Demostracion de buenas practicas de reproducibilidad: la semilla fija y la ejecucion secuencial permiten ilustrar en clase por que dos entrenamientos con distinta semilla no dan exactamente el mismo resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (ImageNet, MMLU, HumanEval, GSM8K u otros) en la informacion disponible; el material no esta planteado como evaluacion comparativa. La unica metrica reportada por el autor es la siguiente:

| Metrica | Valor | Condiciones |
|---|---|---|
| Precision en prueba | en torno al 75 % | 100 imagenes no vistas |
| Margen declarado | +/- 5 puntos | ruido esperable con una muestra de prueba tan pequena, segun el autor |
| Imagenes de entrenamiento | 300 | de una seleccion docente de 400 (200 gatos y 200 perros) |
| Entradas de entrenamiento | 64x64 px | 20 epocas, AdamW, lr = 5·10⁻⁴, volteo horizontal |
| Pesos de la red | 97.809 | CNNMama |

El autor advierte expresamente que, con tan pocas imagenes de prueba, mas o menos 5 puntos son ruido normal, y que el resultado es reproducible con la semilla fija en la misma maquina.

## Requisitos de hardware

- VRAM para inferencia: 0 MB en el escenario previsto; el cuaderno entrena y evalua en CPU.
- Memoria del modelo: unos 0,4 MB en float32 (calculo a partir de los 97.809 pesos), sin contar el coste del framework.
- GPU recomendadas: ninguna; no se requiere GPU. Cualquier CPU moderna completa las 20 epocas en menos de un minuto segun el autor.
- Compatibilidad con GPU de consumo: irrelevante, el material esta disenado para funcionar sin GPU.
- Software necesario: Python 3.10 o superior con numpy, pandas, matplotlib, pillow, scikit-learn, requests y torch. En Google Colab ya vienen instalados.
- Entornos de ejecucion: Jupyter, VS Code o Google Colab (Archivo -> Subir cuaderno). Tambien existe la version web como Space.
- Conectividad: la primera ejecucion necesita internet para descargar 400 imagenes (unos 10 MB); despues el cuaderno funciona sin conexion.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican; no se publican pesos ni un artefacto de inferencia servible.
- Latencia y throughput: no disponibles como servicio; el unico dato temporal reportado es el entrenamiento completo en menos de un minuto en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa cuantitativa publicada en la informacion proporcionada. La tabla siguiente contrasta el material con alternativas de la misma categoria didactica, marcando como no disponible todo dato que no puede verificarse con las fuentes consultadas.

| Alternativa | Parametros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CNNMama (este cuaderno) | 97.809 pesos | 64x64 RGB | ~75 % en 100 imagenes de prueba | no disponible | Cuaderno de Jupyter + Space |
| CNN docente clasica tipo LeNet-5 | no disponible | no disponible | no disponible | no disponible | Multiples implementaciones publicas |
| CNN entrenada desde cero sobre el dataset completo de perros y gatos | no disponible | no disponible | no disponible | no disponible | Tutoriales y repositorios diversos |
| Modelo preentrenado con transfer learning (ResNet, EfficientNet y similares) | no disponible | no disponible | no disponible | no disponible | Amplia disponibilidad en Hugging Face |

La diferencia relevante no es de rendimiento sino de proposito: frente a estos clasificadores, el cuaderno prioriza la transparencia del proceso (filtros, mapas y numeros intermedios) sobre la precision final, y renuncia explicitamente a un uso en produccion.

## Limitaciones y advertencias

- No es un modelo entrenado para usar: el autor lo declara material de clase y descarta su uso como clasificador en produccion.
- Precision limitada: en torno al 75 % con un margen declarado de mas o menos 5 puntos, medido sobre solo 100 imagenes de prueba.
- Datos de entrenamiento escasos y de baja resolucion: 300 imagenes de 64x64 px, lo que reduce el detalle disponible para discriminar razas, posturas o encuadres.
- Seleccion de datos no representativa: la seleccion de 400 imagenes (200 gatos y 200 perros) es una eleccion docente fija, no una muestra aleatoria del corpus ni un benchmark.
- Las imagenes no se distribuyen con el repositorio: se descargan de microsoft/cats_vs_dogs, por lo que hay que respetar las condiciones de uso de ese dataset.
- Licencia no disponible: no se puede confirmar la reutilizacion del material, especialmente con fines comerciales, sin consultar previamente al autor.
- Sesgos no documentados: no se incluye ningun analisis de sesgos ni de equidad, y el dataset de origen puede no ser representativo de todas las razas, iluminaciones o condiciones de captura.
- Reproducibilidad condicionada: el propio autor indica que el resultado se reproduce con la semilla fija en la misma maquina.
- Sin capacidades linguisticas ni de agente: no hay tool calling, function calling, razonamiento multi-paso ni multimodalidad; el campo language: es se refiere al idioma del material.
- Versionado de dependencias no detallado: la model card enumera paquetes de Python pero no fija versiones concretas, lo que puede afectar a la ejecucion futura.
- Traccion nula en Hugging Face: 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- La primera ejecucion requiere conexion a internet para descargar las imagenes.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/OncomIA01/cnn-perros-gatos-clase
- Version web para clase (Space): https://huggingface.co/spaces/OncomIA01/cnn-perros-gatos-clase
- Cuaderno incluido en el repositorio: CNN_resumen_perros_gatos_autonomo.ipynb
- Dataset de origen: https://huggingface.co/datasets/microsoft/cats_vs_dogs
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (paginas genericas de ayuda de Google y de Reddit), por lo que no se anaden mas enlaces.
