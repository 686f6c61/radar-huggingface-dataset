# ML-Intern-lab/mnist-60s-cnn

## Resumen

mnist-60s-cnn es un clasificador de imágenes convolucional (CNN) de tamano reducido entrenado desde cero sobre el conjunto de datos MNIST. Lo publica el usuario ML-Intern-lab y su rasgo distintivo es que el entrenamiento se limito a 60 segundos de computo en reloj de pared, alcanzando un 99,24 % de exactitud sobre el split de test de 10.000 imagenes. El repositorio no incluye pipeline declarado, licencia, idiomas ni descripcion de arquitectura estandar, solo el state dict de PyTorch.

No es un modelo de lenguaje ni un modelo generativo: se trata de un clasificador de 10 clases (digitos 0-9) con 1.625.866 parametros. Su relevancia es acotada y practica: sirve como referencia reproducible y barata para validar entornos de entrenamiento, comparar hardware, probar pipelines de conversion (ONNX, TorchScript) y como baseline educativo en vision por computador.

La model card documenta el stack completo de capas, el optimizador y el numero de pasos ejecutados, lo que permite reproducir el resultado con una semilla fija (seed 0). Al no existir licencia publicada ni metricas mas alla de la exactitud de test, cualquier uso en produccion requiere una evaluacion legal y tecnica previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial (2 capas convolucionales + 2 capas densas) |
| Parametros totales | 1.625.866 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes de 28x28 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (salida de 10 clases numericas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict en `pytorch_model.bin`, cargado con `torch.load(..., map_location="cpu")["state_dict"]` |
| Entrada | imagen en escala de grises, 1 canal, 28x28 px (implicito en MNIST) |
| Salida | 10 logits (digitos 0-9) |
| Tamano del repositorio | 0,0 GB declarados en HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una red convolucional secuencial definida capa a capa: Conv(1→32) → ReLU → Conv(32→64) → ReLU → MaxPool → Dropout(0.25) → FC(12544→128) → ReLU → Dropout(0.5) → FC(128→10). No utiliza mecanismos de atencion, bloques residuales, normalizacion por lotes ni conexiones skip; es una implementacion directa orientada a coste minimo de computo. La capa densa de entrada recibe 12.544 activaciones, lo que implica que la salida del maxpool se aplana directamente sin capa de adaptacion adicional.

El entrenamiento emplea el optimizador Adam con learning rate 0,001 y tamano de lote 256 sobre el split de entrenamiento de `ylecun/mnist` (60.000 imagenes). En 60 segundos de reloj se ejecutaron 4.691 pasos a 78 pasos por segundo, con semilla 0. No hay constancia de ajuste de hiperparametros, aumento de datos, RLHF, DPO ni ninguna tecnica de alineacion; el proceso es un bucle de entrenamiento supervisado clasico con entropia cruzada como perdida implicita.

## Capacidades

- Clasificacion de imagenes de digitos manuscritos en escala de grises (28x28 px) en 10 clases.
- Inferencia rapida en CPU y en cualquier GPU moderna, dado el reducido numero de parametros.
- Reproducibilidad determinista del entrenamiento: la model card fija semilla, optimizador, lote y numero de pasos.
- Uso como componente de un pipeline de vision (preprocesado de imagenes, extraccion de caracteristicas, clasificacion final).
- Conversion a formatos de despliegue alternativos (ONNX, TorchScript) a partir del state dict.
- No dispone de generacion de texto, razonamiento, generacion de codigo, matematicas simbolicas, tool calling, function calling, soporte de agentes, capacidades multilingues, modo de razonamiento explicito, vision general (solo digitos), audio ni modalidades adicionales.

## Casos de uso

- Digitalizacion de formularios manuscritos: el modelo clasifica recortes de 28x28 px de digitos aislados; se integraria como ultima etapa de un pipeline de OCR que segmente campos numericos (importes, fechas, cantidades).
- Lectura automatica de codigos postales o numeros de documentos: con 99,24 % de exactitud sobre MNIST, es adecuado para tareas de reconocimiento de digitos con preprocesado controlado y bajo coste por inferencia.
- Baseline reproducible en evaluacion de hardware: al conocerse los 4.691 pasos, el lote de 256 y los 78 pasos/s, sirve para comparar throughput de GPU, TPU o aceleradores en un entrenamiento corto y acotado.
- Prueba de pipelines de despliegue: util para validar conversiones a ONNX Runtime, TorchScript, TensorFlow Lite o ejecucion en microcontroladores antes de trasladar esos flujos a modelos mayores.
- Docencia y formacion: ejemplo completo de CNN con dos capas convolucionales, dropout y state dict exportado, apropiado para practicas de vision por computador y de carga de checkpoints en PyTorch.
- Control de calidad en captura de datos: verificacion automatica de que las imagenes recibidas cumplen el formato esperado (un canal, 28x28) y clasificacion de muestras para detectar desviaciones de distribucion en un dataset.
- Prototipado en dispositivos embebidos: el peso en fp32 ronda los 6,5 MB, por lo que es viable en placas tipo Raspberry Pi o hardware con memoria limitada cuando no se dispone de acelerador dedicado.

## Benchmarks y rendimiento

La unica metrica declarada en la informacion proporcionada es la exactitud sobre el split de test de MNIST (10.000 imagenes). No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) porque no son aplicables a un clasificador de digitos.

| Metrica | Dataset | Resultado | Notas |
|---|---|---|---|
| Exactitud de test | MNIST (10k test) | 99,24 % | Reportado por el autor tras 60 s de entrenamiento |

No se dispone de datos comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 6,5 MB (1.625.866 parametros x 4 bytes), mas los buffers del optimizador si se reentrena.
- VRAM estimada para inferencia: por debajo de 100 MB, incluyendo activaciones intermedias y memoria del framework.
- GPU recomendadas: practicamente cualquier GPU sirve; no se requiere una A100, H100 ni RTX 4090, aunque funcionan sin problema. Una GPU integrada o una GTX 1050 son suficientes.
- Cabe en GPU de consumo: si, en cualquier modelo actual e incluso en generaciones antiguas y en GPUs integradas.
- Ejecucion en CPU: viable sin penalizacion relevante; el cuello de botella sera el preprocesado de imagen, no el modelo.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime, TensorFlow Lite (previa conversion) y despliegue embebido. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no publicados. El unico dato de rendimiento disponible es el del entrenamiento (78 pasos/s con lote 256 durante 60 s); no se han documentado mediciones de inferencia.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no incluye resultados de otros modelos sobre MNIST ni especificaciones de alternativas comparables (por ejemplo, LeNet-5 u otras CNN de referencia), por lo que no es posible establecer una comparacion con datos verificables.

| Modelo | Parametros | Contexto | Exactitud MNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mnist-60s-cnn | 1.625.866 | no aplica | 99,24 % | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: solo clasifica digitos manuscritos en escala de grises de 28x28 px; no generaliza a imagenes naturales, texto, color ni otras resoluciones sin reentrenamiento o adaptacion.
- Sensibilidad al preprocesado: variaciones de centrado, escala, contraste o rotacion respecto a la distribucion de MNIST degradan la exactitud de forma notable.
- Sin licencia publicada: no se especifica licencia en la model card ni en los metadatos de HuggingFace, por lo que el uso comercial queda en una situacion legal indeterminada hasta que el autor la aclare.
- Sin documentacion de sesgos ni de analisis de errores: no hay matriz de confusion, analisis por clase ni evaluacion de subgrupos.
- Entrenamiento de 60 segundos: no hay evidencia de ajuste de hiperparametros, aumento de datos ni validacion cruzada, por lo que 99,24 % es un resultado puntual con semilla 0, no necesariamente optimo ni estable.
- Requiere modo de evaluacion: al incluir capas Dropout, es imprescindible llamar a `model.eval()` antes de inferir para obtener resultados correctos.
- Formato de carga no estandarizado: el checkpoint es un state dict bajo la clave `"state_dict"`, lo que exige reconstruir la arquitectura manualmente antes de cargar los pesos.
- Trazabilidad limitada: 0 descargas y 0 likes, sin pipeline declarado ni historial de mantenimiento, lo que reduce la confianza para integrarlo en un sistema en produccion.
- Riesgo de sobreajuste conceptual: aunque no se documenta, la ausencia de regularizacion adicional mas alla del dropout y la falta de particion de validacion explicita no permiten descartarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ML-Intern-lab/mnist-60s-cnn
- Dataset MNIST utilizado: https://huggingface.co/datasets/ylecun/mnist
- Herramienta ML Intern (entorno de creacion del modelo): https://hf.co/chat?mode=ml-intern
