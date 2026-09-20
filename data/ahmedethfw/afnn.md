# Ahmedethfw/AFNN

## Resumen

AFNN (Adaptive Fractal Neural Network) es un experimento de arquitectura presentado por Ahmed Al-Amin (usuario de HuggingFace Ahmedethfw) cuyo objetivo no es resolver una tarea concreta, sino comprobar si una red neuronal de estructura fractal, construida de forma recursiva, con combinaciones de ramas aprendidas y capacidad de crecimiento durante el entrenamiento, puede aprender representaciones visuales utiles y generalizar. El repositorio de HuggingFace no contiene pesos: su tamano declarado es de 0,0 GB, sin descargas y con un unico "like", y tanto la licencia como los idiomas y el pipeline aparecen como no disponibles.

La pieza central es el FractalBlock, un bloque autosimilar que repite la misma regla a distintas profundidades y que funde sus ramas mediante un WeightedMerge con un logit aprendible por rama normalizado con softmax (out = suma_i softmax(logits)_i * branch_i(x)). La red completa encadena una convolucion stem, dos etapas fractales separadas por una convolucion con stride 2, un global average pooling y una capa lineal de clasificacion. El banco de pruebas experimental es un conjunto de imagenes de 94 clases y 57.812 imagenes.

El interes actual del proyecto es metodologico: frente al diseno habitual en el que el humano fija el cableado antes de entrenar y este permanece congelado, AFNN propone que la topologia pueda crecer (anadir ramas) cuando la red deja de mejorar, y que la regla de fusion entre ramas sea aprendida en lugar de impuesta (suma, media o concatenacion). No se trata de un modelo de lenguaje: no genera texto, no soporta tool calling ni tiene ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional con bloques fractales recursivos (FractalBlock) y fusion de ramas aprendida (WeightedMerge con softmax sobre logits) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision para clasificacion de imagenes, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes; etiquetas del dataset de 94 clases) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0,0 GB y no se han publicado pesos) |

Datos adicionales del repositorio: autor Ahmedethfw, 0 descargas, 1 like, pipeline no disponible, region:us, creado y actualizado el 2026-09-20 (fechas de metadatos posteriores a la fecha actual, lo que conviene verificar).

## Arquitectura y entrenamiento

La regla recursiva es la siguiente: FractalBlock(depth d, branches b) = WeightedMerge(ConvBlock(x), FractalBlock(depth d-1)(x) repetido b-1 veces con pesos propios), con FractalBlock(depth 0) = ConvBlock (dos veces conv 3x3, normalizacion y activacion). Un bloque de profundidad 2 con 3 ramas produce 7 ConvBlocks y 3 nodos de fusion. Cada nodo de fusion mantiene un logit aprendible por rama y combina las salidas con un softmax, de modo que la mezcla es una combinacion convexa anidada. La red completa es: imagen -> stem conv -> Stage 1 (FractalBlock, c canales) -> conv stride 2 -> Stage 2 (FractalBlock, 2c canales) -> global average pooling -> capa lineal -> puntuaciones de clase.

El procedimiento de entrenamiento arranca con una red pequena y anade ramas solo cuando el modelo deja de mejorar, lo que constituye el componente "adaptativo" frente a FractalNet (Larsson, Maire y Shakhnarovich, 2016), donde la estructura se fija antes de entrenar y no cambia. El dataset de experimentacion tiene 57.812 imagenes repartidas en 94 clases, y la propia model card subraya que la exactitud es un indicador de progreso de la arquitectura, no el objetivo del trabajo. No se especifican en la informacion disponible el numero de tokens o ejemplos vistos, la composicion del dataset, el optimizador, la tasa de aprendizaje, el numero de epocas, ni si hubo tecnicas de ajuste tipo RLHF o DPO (esperables en modelos de lenguaje, no aplicables aqui). Tampoco se detallan en el texto disponible el numero de parametros, la profundidad o el numero de ramas efectivamente usados, ni los resultados numericos del entrenamiento.

## Capacidades

- Clasificacion de imagenes en un espacio de 94 clases, usando el dataset experimental descrito en la model card (57.812 imagenes).
- Extraccion de representaciones visuales mediante las etapas fractales, potencialmente reutilizables como extractor de caracteristicas con ajuste fino posterior.
- Crecimiento estructural controlado durante el entrenamiento: la red puede anadir ramas cuando deja de mejorar, en lugar de requerir un rediseno manual de la topologia.
- Fusion de ramas aprendida: los pesos de combinacion se optimizan por gradiente en lugar de fijarse a mano.
- Soporte de tool calling o function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision multimodal, audio, generacion de texto): no disponibles; la unica salida documentada son puntuaciones de clase.

## Casos de uso

- Investigacion en arquitecturas que crecen: el modelo sirve como banco de pruebas para estudiar si anadir ramas durante el entrenamiento mejora la generalizacion frente a fijar la topologia de antemano, usando las 94 clases como senal de evaluacion.
- Estudio comparativo con FractalNet y ResNet: permite reproducir el experimento de bloques autosimilares sustituyendo la media elemental de FractalNet por una fusion ponderada aprendida, y medir el efecto de ese cambio.
- Clasificacion de imagenes en dominios con muchas clases y volumen moderado: con 57.812 imagenes y 94 clases el diseno encaja en tareas de catalogacion visual donde no se dispone del presupuesto para un backbone grande preentrenado.
- Docencia y material didactico sobre arquitecturas: la model card incluye una interfaz grafica (docs/images/gui.png), diagramas de la regla recursiva y explicaciones de convoluciones, ResNet e Inception, lo que la hace util para explicar recursividad y fusion de ramas.
- Prototipado de extractores de caracteristicas: las etapas fractales pueden emplearse como backbone congelado y anadir una cabeza lineal para una tarea nueva, siempre que se publiquen pesos o se reentrene desde el codigo.
- Experimentos de eficiencia estructural: comparar el coste computacional de un bloque con 7 ConvBlocks y 3 fusiones frente a alternativas de profundidad fija para medir el compromiso precision/calculo.
- Auditoria de metodos de fusion: probar si el softmax sobre logits por rama converge a distribuciones concentradas (una rama dominante) o repartidas, informacion util para disenar bloques multi-rama.

Advertencia importante: al no haber pesos publicados en el repositorio (0,0 GB), estos casos requieren reentrenar desde el codigo fuente o que el autor publique los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card anuncia una seccion de resultados ("The experiment: training run and results") y afirma que las cifras de exactitud aparecen mas adelante, pero el fragmento disponible termina antes de mostrarlas. No se dispone por tanto de valores de exactitud, MMLU, HumanEval, GSM8K ni de ninguna otra metrica, y esos benchmarks no son aplicables a un modelo de clasificacion de imagenes. Tampoco se documentan curvas de entrenamiento, tiempos por epoca ni el hardware exacto empleado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al desconocerse el numero de parametros no puede calcularse.
- GPU recomendadas: no disponibles; la model card menciona una seccion sobre hardware y por que el entrenamiento fue lento, pero el fragmento disponible no incluye el modelo de GPU utilizado.
- Encaje en GPU de consumo: no disponible. Cualitativamente, una red de clasificacion de imagenes con dos etapas convolucionales y 94 clases de salida suele ser ligera, pero sin datos de parametros ni de resolucion de entrada no puede confirmarse.
- Opciones de despliegue: no disponibles. No se documenta exportacion a ONNX, TorchScript, GGUF ni integracion con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este caso). La model card describe una interfaz grafica propia para el experimento.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo de arquitectura | Parametros | Fusion entre ramas | Crecimiento durante el entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AFNN | CNN con bloques fractales recursivos | no disponible | Aprendida (softmax sobre logits) | Si, anade ramas al estancarse | no disponible | Repositorio de codigo, sin pesos publicados (0,0 GB) |
| FractalNet (2016) | CNN con expansion fractal recursiva | no disponible en la informacion proporcionada | Media aritmetica fija, con drop-path | No, estructura fija antes de entrenar | no disponible | Publicacion academica |
| ResNet | CNN con conexiones residuales (output = x + f(x)) | no disponible en la informacion proporcionada | Suma residual fija | No | no disponible | Ampliamente disponible en frameworks |
| Bloque tipo Inception | CNN multi-rama | no disponible en la informacion proporcionada | Concatenacion fija | No | no disponible | Ampliamente disponible en frameworks |

La comparacion con ResNet e Inception procede de las referencias que la propia model card cita como antecedentes. No se dispone de resultados de rendimiento de AFNN que permitan comparar exactitud frente a esas alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones, no soporta tool calling ni agentes, y no tiene ventana de contexto.
- No hay pesos publicados: el repositorio ocupa 0,0 GB, por lo que no puede ejecutarse inferencia directamente desde HuggingFace sin reentrenar.
- Licencia no disponible: no puede asumirse permiso de uso comercial, modificacion o redistribucion. Debe contactarse con el autor (ahmedahmedalmin23@gmail.com) antes de cualquier uso en produccion.
- Validacion empirica incompleta: la informacion disponible no incluye las cifras de exactitud anunciadas en la model card, ni el numero de parametros, ni el coste computacional del entrenamiento. Las afirmaciones sobre aprendizaje y generalizacion no pueden verificarse con los datos disponibles.
- Framework de implementacion no especificado en el fragmento disponible: conviene revisar el codigo del repositorio antes de planificar su integracion.
- Alcance del dataset limitado: 94 clases y 57.812 imagenes es un banco de pruebas reducido; no hay evidencia en la informacion disponible de que el enfoque escale a conjuntos como ImageNet o a dominios medicos o industriales.
- Fechas de metadatos incoherentes: el repositorio figura como creado y actualizado el 2026-09-20, fecha posterior a la actual; procede verificar si se trata de un error de registro.
- Riesgo de sobreajuste y de inestabilidad en el crecimiento: los esquemas que anaden capacidad durante el entrenamiento son sensibles a los criterios de parada y de expansion, aunque la model card no documenta como se fijan.
- Sin resultados reproducibles publicos: con 0 descargas y 1 like, el proyecto carece de validacion por terceros. No se han identificado en la busqueda web papers, blogs ni demos independientes; los resultados de busqueda obtenidos no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ahmedethfw/AFNN
- Interfaz grafica incluida en el repositorio: docs/images/gui.png
- Paper de referencia citado en la model card (FractalNet, Larsson, Maire y Shakhnarovich, 2016): https://arxiv.org/abs/1605.07648
- Contacto del autor: ahmedahmedalmin23@gmail.com
- Repositorio de codigo, paper propio, blog o demo: no disponibles en la informacion proporcionada.
