# qhoenix/flint-robin

## Resumen

qhoenix/flint-robin es un clasificador de imagenes basado en EfficientNetV2-L (`efficientnet_v2_l` de torchvision, 1000 clases de ImageNet) afinado con entrenamiento adversarial para la subred Perturb (netuid 26) de Bittensor. Lo publica el usuario qhoenix (Ivan Marahovschi) con licencia Apache-2.0, en formato safetensors y con la libreria torchvision como dependencia declarada.

El modelo tiene 119.027.848 parametros y ocupa 0,5 GB en el repositorio. Su interes no esta en la arquitectura base, que es un backbone convolucional estandar y ampliamente conocido, sino en el ajuste adversarial: la model card indica que se ha entrenado para resistir perturbaciones, que es precisamente la tarea que evalua la subred Perturb.

La relevancia es acotada y muy especifica: se trata de un artefacto ligado a un esquema de mineria on-chain. La propia model card incluye la hotkey del minero (`5H76LSKUmaVbxXVyT5tL9N9kkKPACRWPPrmNJm8QM32pNEGB`) y un hash on-chain que combina el fichero de pesos con esa hotkey, lo que permite verificar la procedencia del modelo dentro de la subred. Fuera de ese contexto, es un checkpoint de clasificacion con 0 descargas y sin evaluacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (red convolucional, `torchvision.models.efficientnet_v2_l`) |
| Parametros totales | 119.027.848 |
| Longitud de contexto | No aplica: modelo de vision. Resolucion de entrada 480 x 480 px (resize bicubico a 480, center crop 480) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors, previsiblemente en FP32) |
| Idiomas soportados | No disponible / no aplica (clasificacion de imagenes, sin componente de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Normalizacion de entrada | media = desviacion = 0,5 (`EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`) |
| Clases de salida | 1000 (ImageNet-1K) |
| Tamano del repositorio | 0,5 GB |
| Hash on-chain | sha256(model.safetensors \|\| hotkey) = `234ac7039b62c353b58d81e703701e4be18c180272efd1a6fa22a360f1ef70d4` |

## Arquitectura y entrenamiento

La base es EfficientNetV2-L, una red convolucional que combina bloques Fused-MBConv en las etapas iniciales y MBConv con modulos de atencion por canal (squeeze-and-excitation) en las profundas, con escalado compuesto de profundidad, anchura y resolucion. El checkpoint de partida corresponde al preentrenamiento en ImageNet-1K, del que hereda las 1000 clases de salida y la configuracion de preprocesado documentada en la model card.

Sobre ese punto de partida, el autor indica un ajuste fino con entrenamiento adversarial. Esto implica que durante el entrenamiento se generan perturbaciones sobre las imagenes de entrada y se optimiza el modelo para mantener la prediccion correcta bajo esas perturbaciones, lo que suele traducirse en una frontera de decision mas suave y en mayor robustez ante ruido, compresion o modificaciones adversarias. No se especifica el metodo concreto de generacion de perturbaciones (FGSM, PGD u otro), ni la magnitud del presupuesto de perturbacion epsilon, ni el numero de epocas.

Tampoco hay informacion sobre la composicion exacta del dataset de ajuste, el volumen de imagenes usado, si hubo aumentos de datos adicionales o si se aplico alguna fase de calibracion posterior. El autor no documenta temperatura, umbrales ni metricas de robustez (por ejemplo, exactitud bajo ataque a distintos valores de epsilon). La model card unicamente aporta los metadatos de verificacion on-chain descritos arriba.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1K, con salida de logits sobre las que puede aplicarse softmax para obtener probabilidades.
- Robustez adversarial: el ajuste con entrenamiento adversarial busca mantener la precision ante entradas perturbadas, lo que resulta util cuando las imagenes llegan con ruido, artefactos de compresion o alteraciones deliberadas.
- Extraccion de caracteristicas: al ser un backbone convolucional completo, la salida de las capas previas al clasificador puede emplearse como representacion densa para tareas posteriores (recuperacion de imagenes, clustering, deteccion).
- Ajuste adicional: es un punto de partida razonable para transfer learning hacia dominios con menos clases.
- No dispone de soporte de tool calling ni function calling: es un modelo de vision, no un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues, de audio ni de video.
- No implementa modo de razonamiento extendido (thinking mode) ni salidas encadenadas.

## Casos de uso

- Mineria en la subred Perturb (netuid 26) de Bittensor: el modelo esta publicado como artefacto de minero, con hotkey y hash on-chain, de modo que puede desplegarse para responder a las evaluaciones de robustez adversarial que plantea la subred y verificar su procedencia mediante el hash.
- Clasificacion de imagenes en produccion con entrada degradada: en pipelines donde las imagenes llegan comprimidas, reescaladas o con ruido de sensor, el ajuste adversarial ofrece una frontera de decision mas estable que un checkpoint preentrenado solo con ImageNet limpio.
- Moderacion de contenido visual: filtrado de imagenes en 1000 categorias como primera etapa de un sistema de moderacion, con la ventaja de que los intentos de evasion basados en perturbaciones de bajo nivel encuentran mas resistencia.
- Control de calidad industrial: inspeccion visual de producto en linea de fabricacion, donde las condiciones de iluminacion y el ruido del sensor introducen variabilidad que un clasificador robusto absorbe mejor.
- Pre-etiquetado en anotacion de datasets: uso del modelo para generar etiquetas preliminares sobre grandes volumenes de imagenes, que despues se revisan manualmente, reduciendo el coste de anotacion.
- Backbone para transfer learning: congelar las capas convolucionales y entrenar una cabeza nueva para un dominio especifico (medicina, satelite, retail) cuando el dataset propio es pequeno.
- Extraccion de embeddings para busqueda visual: usar las activaciones previas al clasificador como vector de caracteristicas en un indice de similitud.
- Despliegue en dispositivos con recursos limitados: con 119 millones de parametros, el modelo cuantizado a INT8 ocupa del orden de 119 MB, lo que lo hace viable en GPUs de gama media e incluso en inferencia sobre CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud top-1 ni top-5, ni curvas de robustez frente a ataques adversarios con distintos presupuestos de perturbacion, ni comparaciones con el checkpoint original de ImageNet-1K.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, en torno a 0,48 GB solo para los pesos, mas activaciones; en FP16/BF16, en torno a 0,24 GB; en INT8, en torno a 0,12 GB. Con un lote pequeno y entrada de 480 x 480, el consumo real se mantiene por debajo de 1-2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Para lotes grandes y baja latencia, tarjetas de centro de datos como A100, H100 o L40S; para desarrollo y despliegue en servidor pequeno, RTX 4090, RTX 4080, RTX 3090 o A10G.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090). Tambien es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: PyTorch con torchvision (carga directa via `safetensors.torch.load_file`), TorchScript, ONNX Runtime, NVIDIA TensorRT, OpenVINO para CPU Intel, ExecuTorch para dispositivos moviles. Los servidores orientados a modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama) no son aplicables a este modelo: no procesa texto ni secuencias autorregresivas.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de parametros de las alternativas corresponden a las arquitecturas de referencia publicadas por torchvision y sus autores, no a variantes afinadas con entrenamiento adversarial. No hay metricas de rendimiento publicadas para flint-robin, por lo que la comparacion se limita a tamano, licencia y disponibilidad.

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qhoenix/flint-robin | 119.027.848 | Clasificacion en 1000 clases ImageNet | apache-2.0 | HuggingFace, 0 descargas | Ajuste adversarial para la subred Perturb |
| EfficientNetV2-L (ImageNet-1K, torchvision) | Aprox. 118,5 millones | Clasificacion en 1000 clases ImageNet | BSD-3-Clause (torchvision) | Pesos oficiales via torchvision | Punto de partida del ajuste; sin robustez adversarial declarada |
| EfficientNetV2-M (ImageNet-1K, torchvision) | Aprox. 54,1 millones | Clasificacion en 1000 clases ImageNet | BSD-3-Clause (torchvision) | Pesos oficiales via torchvision | Alternativa mas ligera si el presupuesto de computo es restrictivo |
| ConvNeXt-L (ImageNet-1K) | Aprox. 197,8 millones | Clasificacion en 1000 clases ImageNet | MIT (implementacion de referencia) | Pesos oficiales | Mayor capacidad, mayor coste de inferencia |

## Limitaciones y advertencias

- Sesgos heredados: al derivar de un checkpoint preentrenado en ImageNet-1K, arrastra los sesgos de representacion de ese dataset (infrarrepresentacion de determinadas regiones geograficas, demografias y contextos culturales), agravados por cualquier sesgo introducido en el ajuste fino, cuyo dataset no se documenta.
- Riesgo de error de prediccion: no procede hablar de alucinacion en un clasificador, pero si de falsos positivos y falsos negativos. La model card no aporta matriz de confusion ni exactitud por clase, de modo que no es posible estimar la tasa de error esperada.
- Robustez no cuantificada: se declara entrenamiento adversarial, pero no se especifica el metodo, el presupuesto de perturbacion ni los resultados obtenidos. Un ajuste adversarial con epsilon bajo puede ofrecer una robustez muy limitada frente a ataques mas intensos, y ademas suele reducir la exactitud en datos limpios.
- Cobertura cerrada: el modelo solo predice entre 1000 clases fijas. No admite categorias nuevas sin reentrenar la cabeza de clasificacion ni soporta clasificacion zero-shot.
- Sin soporte de texto ni multilingue: no procesa instrucciones, no genera lenguaje y no puede integrarse en flujos conversacionales ni de agentes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. Conviene verificar que la licencia de los pesos base (torchvision, BSD-3-Clause) y la del dataset de ajuste no impongan condiciones adicionales, algo que la model card no aclara.
- Trazabilidad on-chain: el hash publicado vincula los pesos a una hotkey concreta. Si se modifica o recuantiza el fichero `model.safetensors`, el hash deja de coincidir y el modelo puede no ser aceptado en el contexto de la subred.
- Ausencia de mantenimiento y validacion externa: el modelo tiene 0 descargas y 0 likes, y no hay evaluaciones de terceros ni resultados reproducibles publicados. No se recomienda su uso en produccion critica sin una validacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qhoenix/flint-robin
- Perfil del autor en HuggingFace: https://huggingface.co/qhoenix
- Subred Perturb: https://perturbai.io
- EfficientNetV2-L en torchvision (documentacion de la arquitectura base): no disponible en los resultados de busqueda proporcionados

Nota sobre la busqueda web: los resultados devueltos (springboards.ai/models/flint-alpha, flintk12.com, github.com/apurvsinghgautam/robin, huggingface.co/qhoenix/pearl) no guardan relacion con este modelo. Corresponden a otros proyectos que comparten parcialmente el nombre y no aportan informacion tecnica adicional sobre qhoenix/flint-robin.
