# kinglacto/smai-a4-cifar10-iocnn

## Resumen

SMAI A4 Q1 — IOC-NN es un modelo de red neuronal totalmente conectada (MLP) entrenado sobre el conjunto de datos CIFAR-10 para una tarea de clasificacion de imagenes en 10 clases. Lo publica el usuario `kinglacto` en HuggingFace como parte de lo que parece ser una asignatura o practica academica (SMAI, A4, Q1), probablemente un ejercicio de la asignatura "Statistical Methods for Artificial Intelligence" o similar. El problema que resuelve es el de clasificacion de imagenes de 32x32 píxeles en las 10 categorias de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).

La arquitectura es una red feedforward con tres capas lineales de tamanos 3072-256-128-10 y activacion ELU en las capas ocultas, sumando un total de 820.874 parametros. La entrada es un vector aplanado de 3072 dimensiones (32x32x3), y la salida es un vector de 10 logits. La precision reportada en test es de 0,4729 (47,29 %), lo que supone unos 5 puntos por encima del azar (10 %) pero muy por debajo del estado del arte en CIFAR-10 (redes convolucionales superan el 95 %). El modelo se distribuye como un `state_dict` de PyTorch (`model.pt`) junto con un fichero `config.json` y un `preprocessing.npz`.

Es relevante unicamente como artefacto educativo o de referencia para reproducir un ejercicio concreto de entrenamiento de MLP sobre CIFAR-10. No es un modelo de lenguaje, no genera texto, no soporta tool calling ni capacidades de agente, y no esta pensado para uso en produccion. El repositorio ocupa 0,0 GB segun HuggingFace, lo que sugiere que los pesos podrian no estar subidos o son extremadamente pequenos (un MLP de 820k parametros en float32 ocupa unos 3,3 MB, por lo que 0,0 GB es coherente con el redondeo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) feedforward, capas lineales 3072-256-128-10 con activacion ELU |
| Parametros totales | 820.874 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 dimensiones) |
| Tipos de cuantizacion | no disponible (solo se menciona `model.pt` en float32 por defecto de PyTorch) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`model.pt`); configuracion en `config.json`; preprocesado en `preprocessing.npz` |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal totalmente conectada con tres capas `nn.Linear`: una capa de entrada de 3072 a 256, una capa oculta de 256 a 128 y una capa de salida de 128 a 10. Las activaciones de las capas ocultas son ELU (Exponential Linear Unit). El modelo se carga con `nn.Sequential` y `load_state_dict(torch.load('model.pt'))`, y requiere aplicar el preprocesado descrito en `preprocessing.npz` antes de la inferencia. El computo de parametros cuadra con esta topologia: 3072·256 + 256 = 786.688, mas 256·128 + 128 = 32.896, mas 128·10 + 10 = 1.290, total 820.874.

No se dispone de informacion sobre el numero de tokens (epocas), la composicion exacta del dataset mas alla de ser CIFAR-10, ni sobre si se aplicaron tecnicas de regularizacion, data augmentation, optimizador utilizado o tasa de aprendizaje. Tampoco se documenta si hubo ajuste de hiperparametros, early stopping o validacion cruzada. La unica metrica publicada es la precision en test de 0,4729. No se menciona ninguna innovacion tecnica destacable (decodificacion especulativa, atencion lineal, etc.), lo cual es coherente con un MLP basico de tres capas.

## Capacidades

- Clasificacion de imagenes de 32x32 píxeles en 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia por lotes mediante PyTorch (`nn.Sequential` + `load_state_dict`).
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No tiene modo thinking, vision mas alla de la clasificacion de imagenes de 32x32, ni audio.
- No es un modelo generativo: solo produce logits de clase.

## Casos de uso

- Docencia y practicas academicas: sirve como referencia reproducible para que estudiantes comparen un MLP basico contra una CNN en CIFAR-10 y analicen la brecha de rendimiento (47,29 % frente a >95 % de ResNet).
- Baseline de clasificacion de imagenes de baja resolucion: util como punto de partida para experimentos de ablation sobre preprocesado, activaciones o inicializacion, dado que su topologia es trivial de modificar.
- Pruebas de infraestructura de inferencia en PyTorch: al ser un modelo de 820k parametros y ~3,3 MB, permite validar pipelines de carga de `state_dict`, preprocesado con `.npz` y ejecucion en CPU sin dependencias de GPU.
- Ejemplo educativo de sobreajuste y capacidad: con 820k parametros y una precision del 47 %, sirve para ilustrar por que las capas densas no capturan estructura espacial en imagenes.
- Verificacion de reproducibilidad de experimentos: permite comprobar que un `config.json` y un `preprocessing.npz` dados producen la precision reportada en un entorno controlado.
- Integracion en notebooks de demostracion de CIFAR-10: para mostrar el flujo completo de carga de datos, preprocesado, inferencia y calculo de exactitud en un ejercicio guiado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| CIFAR-10 test accuracy | 0,4729 (47,29 %) | Unico dato publicado en la model card |
| Azar (10 clases balanceadas) | 0,10 (10 %) | Referencia teorica |
| Estado del arte CIFAR-10 (CNN) | >0,95 (>95 %) | Referencia externa, no publicada en la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no es un modelo de lenguaje y no aplica a dichos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 10 MB en float32 (820.874 parametros × 4 bytes ≈ 3,3 MB, mas buffers intermedios y overhead de PyTorch). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, A100, H100. Tambien funciona en CPU sin problema.
- Cabe en consumer GPU: si, en cualquier modelo, incluso en GPUs integradas y en Raspberry Pi.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `nn.Sequential`), TorchScript, ONNX Runtime tras exportacion, o incluso NumPy puro reimplementando las capas lineales. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Dado el tamano, se espera latencia sub-milisegundo por lote pequeno en GPU y del orden de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | CIFAR-10 test acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMAI A4 Q1 — IOC-NN | 820.874 | 3072 (32x32x3) | 0,4729 | no disponible | HuggingFace (`kinglacto/smai-a4-cifar10-iocnn`) |
| MLP 3072-256-128-10 con ReLU (tipico) | ~820k | 3072 | no disponible | variable | implementacion propia |
| LeNet-5 (CNN clasica) | ~60k | 32x32x1 | ~0,70 (referencia historica) | variable | implementaciones multiples |
| ResNet-18 (CIFAR-10) | ~11,2M | 32x32x3 | ~0,95 (referencia) | variable | torchvision, multiples repos |

No se dispone de comparativas publicadas especificas para este checkpoint concreto frente a otros MLP de la misma topologia. Los valores de LeNet-5 y ResNet-18 son referencias externas habituales en la literatura de CIFAR-10 y no provienen de la model card.

## Limitaciones y advertencias

- Precision limitada: 47,29 % en test, muy por debajo del estado del arte y solo ~37 puntos por encima del azar. No es adecuado para ninguna aplicacion real de vision.
- No es un modelo de lenguaje: no genera texto, no responde preguntas, no soporta chat ni instrucciones.
- Sesgos conocidos: no documentados. CIFAR-10 tiene clases balanceadas, pero el modelo podria mostrar sesgos por clase no reportados.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero si puede producir clasificaciones erroneas con alta confianza en imagenes fuera de distribucion.
- Limitaciones de contexto o idioma: entrada fija de 3072 dimensiones (32x32x3); no admite otras resoluciones sin reentrenamiento o redimensionado. No procesa idioma.
- Restricciones de licencia para uso comercial: la licencia no esta disponible, por lo que no se puede asumir permiso de uso comercial. Se recomienda contactar con el autor antes de cualquier uso fuera de ambito academico.
- Caveats para produccion: el repositorio ocupa 0,0 GB y no se confirma que `model.pt`, `config.json` y `preprocessing.npz` esten efectivamente subidos; la carga depende de que el autor los haya incluido. No hay tests, versionado semantico ni garantias de mantenimiento.
- Sin pipeline declarado en HuggingFace (`pipeline: no disponible`), lo que impide usar `transformers` o `pipeline()` de forma estandar; requiere carga manual con PyTorch.

## Enlaces

- HuggingFace: https://huggingface.co/kinglacto/smai-a4-cifar10-iocnn
- Dataset CIFAR-10 (referencia): https://www.cs.toronto.edu/~kriz/cifar.html
- Documentacion de PyTorch `nn.Sequential`: https://pytorch.org/docs/stable/generated/torch.nn.Sequential.html
- Documentacion de PyTorch `load_state_dict`: https://pytorch.org/docs/stable/generated/torch.nn.Module.html#torch.nn.Module.load_state_dict
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
