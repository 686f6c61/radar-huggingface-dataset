# OneScience-Group/HO-FNO-Pipe-Flow

## Resumen

HO-FNO-Pipe-Flow es un paquete de reproduccion del experimento Pipe del articulo *Higher-Order Fourier Neural Operator* (HO-FNO), un operador neuronal espectral de segundo orden disenado para aprender mapas entre funciones en el contexto de la dinamica de fluidos computacional. El modelo transforma dos canales de coordenadas de tuberia en el campo de velocidad horizontal sobre una malla regular de 129 x 129 puntos, actuando como un surrogate neuronal de simulaciones de flujo en conductos.

Lo desarrolla OneScience-Group como parte de su iniciativa de reproducibilidad en ciencia computacional, y se distribuye bajo licencia Apache 2.0. La relevancia actual reside en el creciente interes por los operadores neuronales como alternativas eficientes a los solvers numericos tradicionales (CFD, FEM) en tareas de inferencia repetida, donde un surrogate entrenado puede evaluar nuevos campos en milisegundos en lugar de minutos u horas de simulacion.

El modelo es deliberadamente especializado: no es un modelo de lenguaje ni un modelo generativo de proposito general, sino un operador espectral de 8 capas y 0,1 GB de pesos que resuelve una unica familia de problemas de flujo en tuberia. Su interes es metodologico y de referencia para quien quiera reproducir o extender HO-FNO en otros dominios fisicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador neuronal espectral de Fourier de segundo orden (HO-FNO), 8 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: malla 129 x 129 x 2 canales) |
| Tipos de cuantizacion | no disponible (pesos en `best_model.pth`, formato PyTorch nativo) |
| Idiomas soportados | en (documentacion y codigo) |
| Licencia | Apache 2.0 (codigo); datos Pipe con terminos de origen separados |
| Formato de pesos | PyTorch `.pth` (`weight/best_model.pth`, epoch 494) |

## Arquitectura y entrenamiento

HO-FNO es una variante de Fourier Neural Operator que eleva el orden de la operatoria espectral: en lugar de una unica transformada de Fourier y multiplicacion por pesos en el dominio de frecuencias, aplica una composicion de orden superior (segundo orden) sobre las representaciones. El modelo concreto consta de 8 capas y mapea una entrada de 2 canales (coordenadas de la tuberia) a un unico canal de salida (velocidad horizontal) sobre una malla de 129 x 129.

El entrenamiento se realizo durante 500 epocas sobre el dataset Pipe de 2310 muestras, procedente del repositorio oficial del articulo y replicado como dataset de OneScience en ModelScope. El checkpoint incluido corresponde a la epoca 494, con un error relativo L2 medio de 0,004887735 sobre 200 casos de test, coherente con el 0,0049 reportado en el paper. No se documentan en la informacion disponible detalles sobre composicion exacta del dataset, aumento de datos, funcion de perdida mas alla del error L2 ni tecnicas de regularizacion.

## Capacidades

- Prediccion de campos de velocidad horizontal en flujos de tuberia sobre mallas de 129 x 129 a partir de coordenadas de entrada.
- Evaluacion como surrogate de simulaciones CFD para la familia de problemas Pipe.
- Inferencia rapida en GPU/DCU mediante PyTorch (script `scripts/inference.py`).
- Reproduccion completa del pipeline de entrenamiento (`scripts/train.py`, 500 epocas).
- Generacion de metricas y graficas de resultados (`scripts/result.py`, carpeta `results/`).
- Verificacion de integridad de pesos mediante SHA256 documentado.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un operador numerico especializado.

## Casos de uso

- Surrogate CFD en diseno de conductos: dado un conjunto de coordenadas de tuberia, el modelo predice el campo de velocidad en una pasada de inferencia, sustituyendo simulaciones numericas costosas en bucles de optimizacion geometrica.
- Prototipado rapido de experimentos con operadores neuronales: el paquete incluye scripts de inferencia, evaluacion y entrenamiento, lo que permite replicar el resultado del paper y usarlo como linea base en investigacion.
- Validacion de implementaciones de HO-FNO: el SHA256 del checkpoint y las metricas registradas permiten comprobar que una reimplementacion reproduce el resultado de referencia (L2 relativo ~0,0049).
- Generacion de datasets sinteticos de flujo: el modelo puede emplearse para aumentar datasets fisicos con campos de velocidad plausibles en configuraciones de tuberia no simuladas.
- Educacion y docencia en operadores neuronales: el tamano reducido (0,1 GB) y la simplicidad del pipeline lo hacen adecuado para cursos practicos sobre FNO y variantes de orden superior.
- Integracion en pipelines de simulacion multi-escala: como componente rapido que alimenta modelos de mayor escala o como preacondicionador de solvers numericos en problemas de flujo en conductos.

## Benchmarks y rendimiento

| Metrica | HO-FNO-Pipe-Flow | Referencia del paper (Pipe) |
|---|---|---|
| Error relativo L2 medio (200 casos de test) | 0,004887735 | 0,0049 |
| Epoca del checkpoint | 494 | no disponible |
| Epocas de entrenamiento | 500 | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros operadores (FNO estandar, DeepONet, etc.) ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 0,1 GB y la malla de entrada es de 129 x 129 x 2, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos unos pocos GB de VRAM; el autor menciona entornos GPU/DCU compatibles con PyTorch.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y equivalentes, dado el reducido tamano del modelo y de la malla.
- Opciones de despliegue: PyTorch nativo mediante los scripts incluidos (`inference.py`, `result.py`, `train.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / malla | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HO-FNO-Pipe-Flow | HO-FNO (2.º orden), 8 capas | no disponible | 129 x 129 x 2 | Apache 2.0 | Hugging Face |
| FNO estandar (referencia del paper) | FNO de primer orden | no disponible | Pipe | segun implementacion original | GitHub del paper |
| DeepONet | Operador neuronal basado en ramas/tronco | no disponible | variable | segun implementacion | multiple |

No se dispone en la informacion proporcionada de datos cuantitativos de rendimiento de estos modelos comparables sobre el mismo conjunto de test, por lo que la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Modelo altamente especializado: solo predice velocidad horizontal en flujos de tuberia sobre malla 129 x 129; no es extrapolable a otros dominios fisicos sin reentrenamiento.
- No es un modelo de lenguaje ni un modelo generativo general; no admite prompts de texto ni tareas de NLP.
- El repositorio no incluye los datos de entrenamiento: es necesario descargar `Pipe_X.npy`, `Pipe_Y.npy` y `Pipe_Q.npy` del repositorio del paper o de ModelScope, con los terminos de uso que correspondan.
- La licencia Apache 2.0 cubre el codigo de reproduccion; los datos Pipe tienen terminos de origen separados y deben consultarse antes de su reutilizacion.
- Riesgo de error fuera de la distribucion de entrenamiento: al ser un surrogate entrenado con 2310 muestras, su fidelidad en configuraciones de tuberia no representadas en el dataset no esta garantizada.
- No se documentan analisis de sesgos, robustez ante ruido en la entrada ni validacion fuera del conjunto de test.
- El error L2 relativo de ~0,0049 es el unico indicador de calidad publicado; no hay desglose por regimen de flujo ni por subconjuntos del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/HO-FNO-Pipe-Flow
- Paper (Higher-Order Fourier Neural Operator): https://arxiv.org/abs/2606.28122
- Repositorio oficial del paper: https://github.com/AlexColagrande/HO-FNO
- Dataset Pipe en ModelScope: https://www.modelscope.cn/datasets/OneScience/HO-FNO-Pipe
