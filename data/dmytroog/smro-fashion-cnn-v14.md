# DmytroOG/smro-fashion-cnn-v14

## Resumen

smro-fashion-cnn-v14 es una red neuronal convolucional de tamano reducido entrenada para clasificar imagenes del dataset FashionMNIST en 10 categorias de prendas y calzado. No es un modelo de lenguaje ni un modelo fundacional: se trata de un clasificador de vision de proposito especifico, desarrollado por DmytroOG (Ovsiannikov Dmytro, grupo INFm-25-1 de la Universidad Nacional de Radioelectronica de Kharkiv, KhNURE) en el marco de la asignatura "Metodos contemporaneos de reconocimiento de patrones". Las ponderaciones proceden de la practica de laboratorio numero 3, variante 14, y el repositorio se publica bajo licencia MIT.

La arquitectura, denominada CustomCNN y de tipo TinyVGG, encadena dos bloques convolucionales (1→48→48 y 48→96→96) con una cabeza fully connected de 4704→384→10. Con imagenes de entrada de 28x28 pixeles en un solo canal, el coste computacional es minimo y cabe holgadamente en CPU. El repositorio incluye ademas una aplicacion Gradio 4.44.0 con interfaz en ucraniano que permite subir o dibujar una imagen y obtener la clase predicha junto con un diagrama de probabilidades.

Su relevancia es fundamentalmente docente y de referencia: sirve como ejemplo reproducible de extremo a extremo (entrenamiento, empaquetado y despliegue con Gradio) para quien se inicia en vision por computador. No obstante, conviene advertir de que el repositorio figura con un tamano de 0,0 GB, no declara resultados de evaluacion y no especifica el formato de los pesos, por lo que su utilidad practica fuera del aula esta por verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN propia (CustomCNN, tipo TinyVGG): Block1 (1→48→48), Block2 (48→96→96), cabeza FC (4704→384→10) |
| Parametros totales | no disponible (estimacion aproximada de 1,95 M derivada de las capas descritas; el autor no publica la cifra) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes de 28x28 px y 1 canal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; la interfaz de la demo esta redactada en ucraniano |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio figura con 0,0 GB de tamano) |
| Tarea | clasificacion de imagenes en 10 clases |
| Dataset de entrenamiento | FashionMNIST |
| Entrada | imagen de 28x28 px, 1 canal (escala de grises) |
| Salida | distribucion de probabilidad sobre 10 clases y clase predicha |
| Demo | aplicacion Gradio 4.44.0 (app.py) |
| Autor | DmytroOG (Ovsiannikov Dmytro, grupo INFm-25-1, KhNURE) |
| Fecha de publicacion | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La red sigue el patron clasico de una TinyVGG: dos bloques convolucionales con progresion de canales 1→48→48 y 48→96→96, seguidos de una cabeza clasificadora fully connected. Dado que la capa densa de entrada recibe 4704 caracteristicas y que 96 × 7 × 7 = 4704, la arquitectura implica dos etapas de reduccion espacial (tipicamente max pooling) que llevan la imagen de 28x28 a 7x7 antes del aplanado. La salida son 10 logits, uno por clase.

El autor no detalla en la model card el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de regularizacion (dropout, aumento de datos, weight decay), tampoco la funcion de perdida, el optimizador, la tasa de aprendizaje ni el numero de epocas. No se menciona el uso de RLHF, DPO ni tecnicas equivalentes, algo por lo demas ajeno a un clasificador de vision. Las ponderaciones provienen de un ejercicio de laboratorio, sin que se documente el proceso de seleccion de hiperparametros ni la particion de validacion.

No se describe ninguna innovacion tecnica destacable (atencion lineal, decodificacion especulativa, mezcla de expertos o arquitecturas hibridas). El valor del artefacto reside en su caracter didactico y en servir como linea base minima para experimentos con FashionMNIST.

## Capacidades

- Clasificacion de imagenes monocromas de 28x28 px en las 10 clases estandar de FashionMNIST.
- Salida de probabilidades por clase, lo que permite aplicar umbrales de confianza o estrategias de rechazo por parte del integrador.
- Interfaz Gradio con dos vias de entrada: carga de archivo de imagen y dibujo sobre lienzo.
- Visualizacion de la distribucion de probabilidades junto a la prediccion.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades conversacionales.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido habitual: la interfaz esta en ucraniano y no se declaran idiomas soportados.
- No incorpora modos especiales (thinking mode, vision general, audio, etc.) mas alla de la clasificacion de imagenes de 28x28.
- No es un modelo generativo: la forma de la entrada y de la salida es fija.

## Casos de uso

- Docencia en reconocimiento de patrones: reproduccion completa del flujo de la practica 3 (variante 14) para ilustrar el ciclo entrenamiento, evaluacion y publicacion de un modelo en Hugging Face.
- Linea base para comparativas academicas: al ser una TinyVGG de bajo coste, permite medir la mejora de arquitecturas mas profundas (ResNet, MobileNet) sobre el mismo dataset sin grandes recursos de computo.
- Demo interactiva de despliegue con Gradio: el repositorio incluye app.py y requirements.txt para levantar la interfaz en local con dos comandos, util como plantilla de otras demos de vision.
- Ejercicio de integracion de lienzos de dibujo: la demo permite dibujar a mano y comprobar el comportamiento del modelo fuera de distribucion, un caso practico idoneo para estudiar la degradacion del rendimiento.
- Preetiquetado exploratorio en catalogos textiles: el modelo podria usarse como etiquetador de primera pasada sobre miniaturas de 28x28 monocromo, siempre que se reentrene o valide con datos propios del catalogo.
- Prototipado de control de calidad en retail textil: con reentrenamiento y un conjunto de validacion propio, serviria como prueba de concepto de clasificacion de articulos por categoria en una linea de inspeccion.
- Pruebas de compresion y despliegue en el borde: por su tamano reducido es un candidato comodo para experimentar con cuantizacion y ejecucion en dispositivos de bajos recursos, si bien no se publican pesos cuantizados.
- Material de ensenanza para analisis de errores: la confusion entre clases visualmente proximas en FashionMNIST constituye un caso de estudio clasico para trabajar matrices de confusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud de validacion o test, matriz de confusion, curvas de aprendizaje ni comparaciones cifradas con otras arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos en fp32 de una red de este tamano ocupan unos pocos megabytes y las activaciones son despreciables.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (GTX 1050 o superior) ejecutaria la inferencia de forma instantanea.
- Cabe en GPU consumer: si, y tambien en CPU. Puede ejecutarse en portatiles sin acelerador e incluso en dispositivos tipo Raspberry Pi.
- Memoria RAM: no disponible como dato oficial; el consumo estara dominado por el runtime de Python y las dependencias de Gradio, no por el modelo.
- Opciones de despliegue: ejecucion local mediante `pip install -r requirements.txt` y `python app.py`; despliegue como Space de Gradio (el autor indica que desde septiembre de 2025/2026 Hugging Face exige cuenta PRO para Spaces de Gradio en cpu-basic, motivo por el que los archivos se subieron como repositorio de modelo).
- vLLM, llama.cpp, Ollama y TGI no aplican: son motores para modelos generativos de lenguaje, no para una CNN clasificadora.
- Latencia y throughput: no disponible; no hay mediciones publicadas. Por el tamano de la red, el coste esperado por imagen es de milisegundos en CPU, pero es una estimacion, no un dato medido.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni de especificaciones completas de este modelo, por lo que la comparacion se limita a aspectos cualitativos. Las cifras de parametros y de exactitud de las alternativas se marcan como no disponibles al no haber sido aportadas en la informacion consultada.

| Modelo | Tarea | Arquitectura | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smro-fashion-cnn-v14 | Clasificacion FashionMNIST (10 clases) | CNN tipo TinyVGG con dos bloques convolucionales | no disponible (estimacion ~1,95 M) | MIT | Repositorio de modelo en Hugging Face, 0 descargas y 0,0 GB |
| LeNet-5 | Clasificacion FashionMNIST (10 clases) | CNN clasica con dos convoluciones | no disponible | no disponible | Implementaciones multiples de referencia |
| ResNet-18 adaptada | Clasificacion FashionMNIST (10 clases) | CNN residual con conexiones skip | no disponible | no disponible | Implementaciones multiples de referencia |
| MobileNetV3-Small adaptada | Clasificacion FashionMNIST (10 clases) | CNN con convoluciones separables en profundidad | no disponible | no disponible | Implementaciones multiples de referencia |

Frente a estas alternativas, la diferencia relevante es de proposito: smro-fashion-cnn-v14 es un artefacto de laboratorio con licencia MIT explicita, mientras que las otras opciones son arquitecturas genericas que requieren entrenamiento especifico para esta tarea.

## Limitaciones y advertencias

- Ausencia total de metricas: no se publica exactitud, perdida ni matriz de confusion, de modo que no es posible evaluar la calidad del clasificador con los datos disponibles.
- Repositorio aparentemente vacio: el tamano indicado es de 0,0 GB, por lo que los pesos podrian no estar efectivamente subidos. Conviene verificar antes de cualquier uso.
- Dominio muy restringido: el modelo solo contempla imagenes de 28x28 px monocromas con las 10 clases de FashionMNIST. Imagenes reales de mayor resolucion requieren redimensionado y preprocesado, con la consiguiente perdida de fidelidad.
- Sin clase de rechazo: cualquier entrada se asignara a una de las 10 categorias aunque no corresponda a ninguna, lo que favorece predicciones erroneas con alta confianza aparente.
- Riesgo de sobreajuste: al tratarse de un entrenamiento de laboratorio sin particion de validacion documentada, no puede descartarse un ajuste excesivo al conjunto de entrenamiento.
- Sesgos desconocidos: no se han documentado sesgos demograficos ni de dominio, pero el dataset FashionMNIST (imagenes de catalogo de Zalando) tiene una distribucion muy concreta de estilos, fondos e iluminacion que no representa la fotografia textil en condiciones reales.
- Alucinacion en sentido estricto no aplica, pero si existe el equivalente funcional: predicciones plenamente confiadas sobre entradas irrelevantes o ruido.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero se distribuye sin garantia alguna y sin responsabilidad para el autor. El integrador asume todo el riesgo.
- La interfaz esta en ucraniano y no se declara soporte multilingue, lo que exige trabajo adicional para adaptarla a otros mercados.
- No apto para produccion critica: su uso en decisiones con impacto (por ejemplo, precios automaticos o catalogacion fiscal) no esta respaldado por ninguna evaluacion.
- Los resultados de la busqueda web facilitados no contienen informacion relevante sobre este modelo ni sobre su contexto de publicacion.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/DmytroOG/smro-fashion-cnn-v14
- Space de Gradio previsto por el autor (URL con marcador de posicion, no publicada): https://huggingface.co/spaces/USERNAME/smro-fashion-cnn-v14
- No se han proporcionado enlaces al paper, al dataset FashionMNIST, al repositorio de codigo fuente ni a demos adicionales.
- Los enlaces devueltos por la busqueda web (microsoft.com, account.microsoft.com, myaccount.microsoft.com, en.wikipedia.org/wiki/Microsoft) no guardan relacion con este modelo y se descartan.
