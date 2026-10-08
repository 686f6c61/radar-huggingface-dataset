# hx03-info/bs6221-mnist-flow-diffusion

## Resumen

bs6221-mnist-flow-diffusion es un repositorio de checkpoints de PyTorch publicado por el usuario hx03-info que contiene dos generadores de imagenes condicionales por clase entrenados sobre MNIST: un predictor de velocidad por flow matching (`flow_ema.pt`) y un predictor de ruido DDPM (`diffusion_ema.pt`). No es un modelo de lenguaje ni un modelo de difusion de gran escala: cada generador tiene 305.289 parametros y una U-Net diminuta de 24 canales base con embedding temporal y embedding de clase de digito (0-9). El proposito declarado es educativo, orientado al estudio de la generacion ruido-a-imagen y a la comparacion reproducible de metodos numericos de muestreo ODE.

El repositorio se enmarca en el contexto de la asignatura BS6221 y se distribuye con definiciones de modelo congeladas (`model_definitions.py`), un manifiesto con checksums SHA-256 y un `config.json` con la forma de imagen, normalizacion y presupuestos de entrenamiento. Los pesos son checkpoints personalizados, no un pipeline de Transformers ni de Diffusers, por lo que su integracion requiere instanciar manualmente `ConditionalTinyUNet(24)` y cargar el `state_dict`.

Su relevancia actual es acotada y de naturaleza didactica: permite comparar en igualdad de condiciones conceptuales (aunque no de presupuesto de entrenamiento) dos formulaciones generativas distintas sobre un dataset pequeno y bien conocido, y sirve como banco de pruebas para implementaciones de solvers ODE. El repositorio no tiene descargas ni likes registrados, el tamano declarado es 0.0 GB y el autor indica que aun no se ha seleccionado una licencia de codigo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net condicional por clase (tiny U-Net, 24 canales base) con embedding temporal y embedding de digito de 10 clases |
| Parametros totales | 305.289 por generador (`flow_ema.pt` y `diffusion_ema.pt`); parametros de `digit_classifier.pt`: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada `[B,1,28,28]`) |
| Tipos de cuantizacion | no disponibles (solo se distribuyen checkpoints `.pt`; no se documentan variantes cuantizadas ni formatos de menor precision) |
| Idiomas soportados | no aplica (modelo generativo de imagenes; las etiquetas son digitos enteros 0-9) |
| Licencia | no disponible (el autor declara que no se ha seleccionado licencia de codigo abierto todavia) |
| Formato de pesos | PyTorch `.pt` (checkpoints de `state_dict` personalizados; no safetensors, no GGUF, no formato Diffusers) |
| Normalizacion de entrada | `pixel / 127.5 - 1` |
| Presupuesto de entrenamiento (flow) | 15.000 actualizaciones del optimizador |
| Presupuesto de entrenamiento (DDPM) | 20.000 actualizaciones del optimizador, schedule coseno de 100 pasos |
| Ficheros del repo | `flow_ema.pt`, `diffusion_ema.pt`, `digit_classifier.pt`, `model_definitions.py`, `manifest.json`, `config.json` |

## Arquitectura y entrenamiento

La arquitectura es una U-Net condicional de tamano reducido con 24 canales base, entrada de un solo canal de 28x28 pixeles, embedding temporal y embedding de clase para los digitos 0-9. El repositorio contiene dos variantes que comparten definicion estructural pero difieren en el objetivo de entrenamiento. La variante de flow matching (`flow_ema.pt`) predice la velocidad condicional `image - noise` mediante error cuadratico medio (MSE). La variante DDPM (`diffusion_ema.pt`) predice el ruido anadido, tambien por MSE, y emplea un schedule coseno de 100 pasos. El autor advierte explicitamente que ambas perdidas tienen objetivos distintos y no son comparables directamente, y que los presupuestos de entrenamiento difieren, por lo que la comparacion entre ambos checkpoints no constituye un benchmark con presupuesto igualado.

En cuanto a los datos, las imagenes oficiales de entrenamiento de MNIST se dividieron en 55.000 ejemplos de entrenamiento y 5.000 de validacion mediante una particion con semilla 42. El conjunto de test oficial de 10.000 imagenes no se utilizo ni para el entrenamiento de los generadores ni para la seleccion de checkpoints. La continuacion del entrenamiento selecciono los pesos EMA segun el MSE de validacion sobre 1.024 imagenes con dos extracciones fijas de ruido y tiempo. Los pesos de inferencia son, por tanto, los de la media movil exponencial (EMA) y no los ultimos pesos del optimizador. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo por otra parte esperable en un modelo generativo de imagenes de este tipo.

No se menciona ninguna innovacion tecnica propia mas alla del enfoque educativo: el valor del repositorio esta en la reproducibilidad (definiciones congeladas, manifiesto con hashes SHA-256, particion con semilla fija) y en la comparacion de metodos numericos de muestreo ODE frente a la muestral ancestral tipo DDPM.

## Capacidades

- Generacion de imagenes de digitos manuscritos de 28x28 pixeles en escala de grises, condicionada por clase (digito solicitado de 0 a 9).
- Muestreo por flow matching: integracion de un campo de velocidad condicional mediante solvers numericos de EDO.
- Muestreo por difusion DDPM: proceso inverso de eliminacion de ruido con schedule coseno de 100 pasos.
- Clasificacion auxiliar de digitos mediante `digit_classifier.pt`, util como proxy de si la muestra generada corresponde a la clase solicitada.
- Soporte para comparacion reproducible de solvers ODE y de esquemas de refinamiento numerico dentro del mismo banco de pruebas.
- Carga de pesos con `torch.load(path, map_location='cpu', weights_only=True)` y definiciones de modelo congeladas para garantizar reproducibilidad.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, capacidades de agente ni capacidades multilingues. Es un modelo de imagen de dominio unico.

## Casos de uso

- Docencia de metodos generativos: sirve para ilustrar en clase la diferencia entre predecir ruido (DDPM) y predecir velocidad (flow matching) sobre un dataset pequeno cuyo comportamiento se puede inspeccionar visualmente. Su tamano de 305.289 parametros permite entrenar y muestrear en minutos sobre CPU o cualquier GPU.
- Comparacion de solvers ODE: el repositorio esta pensado para estudiar metodos numericos de muestreo; se pueden implementar distintos integradores (Euler, Heun, Runge-Kutta) sobre el campo de velocidad de `flow_ema.pt` y comparar las trayectorias y las muestras resultantes con presupuesto de pasos fijo.
- Practicas de analisis numerico: los checkpoints permiten medir como el refinamiento del solver afecta a la muestra generada, siempre teniendo en cuenta la advertencia del autor de que las diferencias de refinamiento no constituyen cotas de error rigurosas.
- Reproduccion de resultados en cuadernos interactivos: el proyecto GitHub asociado (URL pendiente de publicacion) proporciona APIs de generacion y un notebook, lo que facilita montar sesiones practicas reproducibles con particiones y semillas fijadas.
- Validacion de pipelines de inferencia en CI: al ser checkpoints PyTorch pequenos con manifiesto y checksums SHA-256, son utiles para probar cargas de `state_dict`, verificacion de integridad y ejecucion end-to-end en un pipeline de integracion continua sin coste de computo apreciable.
- Experimentos controlados de condicionamiento por clase: usando `digit_classifier.pt` como evaluador proxy se puede medir la tasa de acierto de clase de las muestras generadas y estudiar el efecto de distintos numeros de pasos o schedules.
- Plantilla para modelos generativos de juguete: la estructura de repositorio (definiciones congeladas, config, manifiesto con hashes) sirve como esqueleto para publicar otros modelos pequenos con trazabilidad de procedencia.
- Ejercicios de destilacion o reduccion de pasos: al ser modelos tan pequenos, permiten experimentar con tecnicas de few-step sampling o destilacion de trayectorias sin requerir infraestructura relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de FID, IS, precision/recall ni ninguna otra metrica de calidad de generacion. El unico criterio de seleccion documentado es el MSE de validacion sobre 1.024 imagenes con dos extracciones fijas de ruido y tiempo, empleado para escoger los pesos EMA, pero no se proporcionan los valores numericos de dichas perdidas en la informacion facilitada.

El autor senala explicitamente que el clasificador auxiliar de digitos actua como proxy de la calidad de generacion y que no constituye una medida exhaustiva de la misma, y que los dos objetivos de entrenamiento (velocidad frente a ruido) no son comparables directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 305.289 parametros por generador, los pesos en precision de 32 bits ocupan aproximadamente 1,2 MB por checkpoint (calculo aritmetico a partir del numero de parametros; el repositorio declara un tamano de 0.0 GB redondeado a dos decimales).
- GPU recomendadas: no se especifica ninguna. El modelo es lo bastante pequeno para ejecutarse en CPU, en GPUs de portatil integradas y en cualquier GPU de consumo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en CPU. No requiere GPUs de clase A100, H100 ni RTX 4090.
- Opciones de despliegue: exclusivamente PyTorch personalizado mediante `torch.load` con `weights_only=True` sobre una instancia de `ConditionalTinyUNet(24)`. No es compatible con vLLM, llama.cpp, Ollama, TGI, Transformers ni Diffusers, ya que no es un modelo de lenguaje ni un pipeline de difusion estandar.
- Latencia y throughput estimados: no disponibles. El autor indica que las comparaciones de tiempos son especificas del dispositivo y que la compatibilidad con CUDA, Windows y Linux no se ha verificado en maquinas fisicas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de terceros en la documentacion proporcionada. La comparativa factible con los datos disponibles es interna, entre los componentes del propio repositorio:

| Modelo | Parametros | Objetivo de entrenamiento | Actualizaciones | Schedule | Uso |
|---|---|---|---|---|---|
| `flow_ema.pt` | 305.289 | Velocidad condicional `image - noise` por MSE | 15.000 | no aplica (version continua) | Muestreo por integracion ODE |
| `diffusion_ema.pt` | 305.289 | Ruido anadido por MSE | 20.000 | Coseno, 100 pasos | Muestreo DDPM ancestral |
| `digit_classifier.pt` | no disponible | Clasificacion de digitos | no disponible | no aplica | Evaluacion proxy de la clase generada |

El autor advierte que las perdidas de las dos variantes no son comparables entre si y que los presupuestos de entrenamiento difieren, de modo que esta tabla no debe interpretarse como un benchmark con presupuesto igualado.

## Limitaciones y advertencias

- Licencia no seleccionada: el autor indica explicitamente que no se ha elegido licencia de codigo abierto y que debe revisarse el licenciamiento antes de reutilizar el material. No hay autorizacion clara para uso comercial.
- Calidad de generacion limitada: algunas muestras generadas pueden no corresponder al digito solicitado, segun reconoce el propio autor.
- Sin reivindicacion de estado del arte: no se afirma ninguna calidad de imagen de referencia ni superioridad frente a otros metodos.
- Dominio restringido: unicamente MNIST, imagenes de 28x28 en escala de grises y clases de digito 0-9. No generaliza a otros dominios, resoluciones ni modalidades.
- Advertencia explicita contra usos indebidos: el autor descarta interpretaciones causales o biologicas y cualquier uso medico.
- Aproximaciones numericas: las referencias ODE son aproximaciones numericas y las diferencias de refinamiento no son cotas de error rigurosas, por lo que no deben presentarse como garantias de precision.
- Compatibilidad no verificada: no se ha comprobado el funcionamiento en CUDA, Windows ni Linux sobre maquinas fisicas, y las comparaciones de tiempos son especificas del dispositivo.
- Riesgo de alucinacion: en el sentido habitual de los modelos de lenguaje no aplica, pero si existe el fenomeno analogo de generar una clase incorrecta respecto a la etiqueta solicitada.
- Madurez y adopcion nulas: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso por parte de la comunidad.
- Sin URL de repositorio de codigo publicada: el proyecto GitHub asociado con las APIs de generacion y el cuaderno interactivo se anuncia como pendiente de publicacion, por lo que la reproducibilidad practica queda incompleta.
- Documentacion de benchmarks ausente: no hay metricas publicadas que permitan estimar la calidad real de las muestras.

## Enlaces

- HuggingFace: https://huggingface.co/hx03-info/bs6221-mnist-flow-diffusion
- Flow Matching for Generative Modeling (paper): https://arxiv.org/abs/2210.02747
- Denoising Diffusion Probabilistic Models (paper): https://arxiv.org/abs/2006.11239
- MNIST dataset oficial: https://yann.lecun.org/exdb/mnist/
- Proyecto GitHub BS6221 con APIs de generacion y cuaderno interactivo: URL no disponible (el autor indica que se anadira tras la publicacion)
