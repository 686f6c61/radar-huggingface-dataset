# OneScience-Group/VINO-DarcyFlow

## Resumen

VINO-DarcyFlow es un modelo de operador neuronal (neural operator) desarrollado por OneScience-Group que reproduce el experimento de flujo de Darcy en 2D con resolución 64 x 64 descrito en el artículo "Variational Physics-informed Neural Operator" (arXiv:2411.06587). Su tarea consiste en predecir el campo de presión a partir del campo de permeabilidad, un problema clásico de la dinámica de fluidos computacional y de la mecánica de medios porosos.

La particularidad del modelo es su enfoque variacional: en lugar de entrenarse de forma supervisada clásica con etiquetas de salida, emplea un objetivo de energía variacional de tipo física (physics-informed), de modo que las etiquetas de entrenamiento no se usan para actualizar los parámetros del modelo. Esto lo hace relevante como referencia para la comunidad de aprendizaje automático científico (scientific machine learning) interesada en sustituir simuladores numéricos tradicionales por operadores neuronales.

El paquete publicado en Hugging Face incluye el modelo entrenado (`weight/best_model.pt`, correspondiente a la época 435), scripts de inferencia, evaluación y entrenamiento, y la configuración del experimento. No se trata de un modelo de lenguaje, sino de un modelo científico especializado, por lo que conceptos como longitud de contexto o soporte de idiomas no le aplican de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador neuronal físico-variacional (Variational Physics-informed Neural Operator, VINO) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación; el modelo no procesa lenguaje natural) |
| Licencia | other (licencia no estándar; consultar la model card) |
| Formato de pesos | PyTorch (.pt, serializado con torch.save) |

Datos adicionales del experimento:

| Parametro | Valor |
|---|---|
| Tarea | Prediccion de presion a partir de permeabilidad (flujo de Darcy 2D) |
| Resolucion de la malla | 64 x 64 |
| Division de datos | 1000 muestras de entrenamiento / 100 de test |
| Epocas de entrenamiento | 500 (ejecucion completa reproducible) |
| Checkpoint incluido | best_model.pt (epoca 435, SHA256 e9b47a201bc03cc9362b4803706b6529426b8fc889ce9f185b8fec52cf9c51f8) |

## Arquitectura y entrenamiento

El modelo implementa un Variational Physics-informed Neural Operator (VINO), una variante de operador neuronal cuyo entrenamiento se formula como un problema de minimización de energía variacional derivada de la física del problema (la ecuación de flujo de Darcy), en lugar de la típica pérdida supervisada contra soluciones de referencia. Según la model card, las etiquetas de entrenamiento no se utilizan para actualizar el modelo, lo que lo sitúa en la línea de los métodos physics-informed sin datos de salida.

El experimento reproducido utiliza el dataset `darcy2d_s64.pt` con 1000 muestras de entrenamiento y 100 de test, a resolución 64 x 64. La ejecución completa comprende 500 épocas y puede repetirse con `scripts/train.py` sobre GPU o DCU (tarjetas aceleradoras de Hygon, habituales en entornos de computación chinos). El checkpoint incluido (época 435) alcanza un error relativo L2 medio en test del 1,109766 %, frente al 0,93 % reportado en el artículo; la propia model card advierte que la mejor época se seleccionó usando el mismo conjunto de test, por lo que esa cifra no constituye una estimación independiente.

No hay detalles publicados en el repositorio sobre el número exacto de parámetros, el backbone concreto del operador (FNO, U-Net, etc.) ni los hiperparámetros de optimización; estos pueden consultarse en `config/config.yaml` y en el artículo original.

## Capacidades

- Prediccion del campo de presion en problemas de flujo de Darcy 2D a partir del campo de permeabilidad, a resolucion 64 x 64.
- Inferencia sin datos de salida: el modelo se entrena con un objetivo de energia variacional fisica, no mediante supervision con soluciones de referencia.
- Reproducibilidad completa: scripts de inferencia (`scripts/inference.py`), evaluacion (`scripts/result.py`) y entrenamiento de 500 epocas (`scripts/train.py`).
- Registro de resultados: el directorio `results/` incluye la ejecucion registrada y `config/config.yaml` documenta la division 1000/100.
- No es aplicable: no soporta generacion de texto, tool calling, agentes, ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Benchmark de operadores neuronales: sirve como linea base reproducible para comparar nuevas arquitecturas de operadores neuronales en el problema de Darcy 2D, gracias a la configuracion y checkpoints publicados.
- Investigacion en physics-informed machine learning: permite estudiar entrenamiento variacional sin etiquetas de salida y contrastarlo con alternativas supervisadas como FNO.
- Prototipado rapido de simulacion de medios porosos: la inferencia con `scripts/inference.py` produce campos de presion en segundos, util para explorar distintos campos de permeabilidad sin resolver el PDE numericamente.
- Ensenanza de scientific machine learning: el paquete es autocontenido (datos, config, scripts), ideal para practicas de curso sobre operadores neuronales.
- Validacion de pipelines de ML cientifico: la inclusion de hashes SHA256 y trazabilidad de procedencia del dataset lo hace adecuado para probar flujos de trabajo reproducibles.
- Transferencia a problemas relacionados: el codigo puede adaptarse como plantilla para otras ecuaciones elipticas o problemas de difusion con objetivos variacionales.

## Benchmarks y rendimiento

| Metrica | VINO-DarcyFlow (checkpoint incluido) | VINO (articulo original) |
|---|---|---|
| Error relativo L2 medio en test (Darcy 2D, 64 x 64) | 1,109766 % | 0,93 % |

No se han publicado comparaciones con otros modelos (FNO, PINO, etc.) en la informacion disponible. Advertencia de la propia model card: la mejor epoca se selecciono usando el conjunto de test, por lo que el resultado del checkpoint no es una estimacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; dado el tamano de la malla (64 x 64), se trata de un modelo ligero que deberia funcionar en GPUs de consumo con pocos GB de VRAM.
- VRAM para entrenamiento (500 epocas): no disponible; los scripts mencionan compatibilidad con GPU o DCU.
- GPU recomendadas: no disponible; cualquier GPU moderna con soporte de PyTorch deberia ser suficiente para inferencia.
- Cabe en GPU de consumo: muy probablemente si, aunque no esta confirmado explicitamente en la model card.
- Opciones de despliegue: ejecucion directa con PyTorch mediante los scripts incluidos (`scripts/inference.py`, `scripts/train.py`); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplicable a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han incluido en la informacion disponible comparativas numericas con modelos alternativos. Como referencia cualitativa, en la literatura del problema de Darcy 2D (64 x 64) suelen usarse como lineas base el Fourier Neural Operator (FNO) y variantes physics-informed como PINO, entrenadas de forma supervisada; la diferencia conceptual de VINO es su objetivo variacional sin etiquetas de salida. No hay datos publicados en este repositorio que permitan una tabla comparativa rigurosa de error relativo L2, parametros o coste de entrenamiento frente a dichos modelos.

## Limitaciones y advertencias

- Rendimiento inferior al publicado: el checkpoint incluido obtiene 1,109766 % de error relativo L2 frente al 0,93 % del articulo; ademas, la seleccion de la mejor epoca uso el propio conjunto de test, por lo que el resultado esta potencialmente optimista.
- Alcance muy restringido: el modelo solo cubre el experimento de Darcy 2D a 64 x 64; no generaliza a otras resoluciones, geometrias o ecuaciones sin reentrenamiento o adaptacion.
- Licencia "other": la licencia del modelo no es estandar y debe revisarse antes de cualquier uso comercial; la licencia de los datos es adicionalmente distinta de la del paquete del modelo y debe consultarse en la fuente original.
- Seguridad de carga: el dataset `darcy2d_s64.pt` es un archivo serializado de PyTorch; la model card advierte de cargarlo unicamente desde fuentes de confianza (riesgo habitual de pickle).
- Dataset externo: el repositorio de Hugging Face contiene solo el modelo; los datos deben descargarse del directorio de los autores (Seafile de Uni Hannover) o de la copia en ModelScope.
- Comunidad reducida: 243 descargas y 0 likes en el momento de la ficha, lo que implica menor validacion comunitaria y soporte limitado.
- No hay informacion sobre sesgos o riesgo de alucinacion aplicable, al no tratarse de un modelo generativo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/VINO-DarcyFlow
- Articulo (arXiv): https://arxiv.org/abs/2411.06587
- Dataset original (Seafile, Uni Hannover): https://seafile.cloud.uni-hannover.de/d/4341006631ab427b8270/
- Copia del dataset en ModelScope: https://www.modelscope.cn/datasets/OneScience/VINO-Darcy
