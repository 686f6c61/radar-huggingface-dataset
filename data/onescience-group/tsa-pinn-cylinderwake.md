# OneScience-Group/TSA-PINN-CylinderWake

## Resumen

TSA-PINN-CylinderWake es un paquete de reproduccion de un experimento de redes neuronales informadas por la fisica (PINN) con funciones de activacion sinusoidales entrenables (TSA, *trainable sinusoidal activation*), aplicado al clasico problema de estela de cilindro a numero de Reynolds Re=100. Lo desarrolla el grupo OneScience y no es un modelo de lenguaje: es un artefacto cientifico que contiene los pesos entrenados de una red de cuatro capas y 50 unidades por capa que predice los campos de velocidad y presion a partir de coordenadas espacio-temporales.

El modelo resuelve el problema inverso y directo de aproximar la solucion de las ecuaciones de Navier-Stokes en un dominio bidimensional alrededor de un cilindro, usando la ecuacion en residuo como termino de perdida junto con los datos de referencia. Su relevancia es metodologica: sirve como punto de partida reproducible para investigar el efecto de activaciones sinusoidales entrenables en PINNs y para comparar resultados con la publicacion original de Khademi (Polytechnique Montreal, 2025).

El repositorio ocupa 0,1 GB e incluye el checkpoint `weight/best_model.pt` correspondiente a la actualizacion 3956 de un entrenamiento de 4000 pasos. No incluye el dataset original, que debe descargarse por separado del repositorio de los autores o de ModelScope. La licencia figura como `other`, lo que obliga a revisar los terminos de uso del dato fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PINN (red fully-connected) con activaciones sinusoidales entrenables (TSA) |
| Parametros totales | no disponible (red de 4 capas x 50 unidades; el conteo exacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: coordenadas espacio-temporales x, y, t) |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante PyTorch) |
| Idiomas soportados | en (documentacion y model card) |
| Licencia | other |
| Formato de pesos | PyTorch (`weight/best_model.pt`) |

## Arquitectura y entrenamiento

La red es un perceptron multicapa de cuatro capas con 50 unidades por capa que mapea coordenadas espacio-temporales (x, y, t) a las componentes de velocidad (u, v) y presion (p). La innovacion principal es el uso de funciones de activacion sinusoidales con frecuencia entrenable (TSA), en lugar de las activaciones convencionales tipo tanh o ReLU, lo que segun el paper original mejora la capacidad de la red para representar soluciones de alta frecuencia en problemas de fluidos.

El entrenamiento se realiza minimizando el residuo de las ecuaciones de Navier-Stokes junto con la discrepancia respecto a los datos DNS del caso de estela de cilindro a Re=100. El checkpoint incluido corresponde a la actualizacion 3956 de una ejecucion de 4000 pasos, ejecutable en GPU o DCU mediante `scripts/train.py`. No se detalla en la informacion disponible el volumen exacto de puntos de colocacion, la composicion del dataset ni si se emplearon tecnicas de regularizacion adicionales.

## Capacidades

- Prediccion de campos de velocidad (u, v) y presion (p) en funcion de coordenadas espacio-temporales para el caso de estela de cilindro a Re=100.
- Aproximacion de soluciones de las ecuaciones de Navier-Stokes en regimen laminar bidimensional.
- Reproduccion de un experimento cientifico publicado, con scripts de inferencia (`inference.py`), evaluacion (`result.py`) y reentrenamiento (`train.py`).
- Evaluacion cuantitativa frente a datos DNS mediante error relativo L2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto libre.
- No es multilingue ni tiene capacidades de dialogo; su unico idioma de documentacion es el ingles.

## Casos de uso

- Reproduccion de resultados academicos: permite verificar los errores L2 reportados en el paper original (0,01960 para u y 0,06630 para v) frente a los obtenidos con el checkpoint incluido (0,021981 y 0,083490), util para auditar la metodologia TSA.
- Estudio de funciones de activacion en PINNs: al ser un paquete autocontenido, se puede modificar la activacion (sinusoidal entrenable frente a tanh) y comparar la convergencia en el mismo caso de referencia.
- Benchmarking de frameworks de PINN: sirve como caso de prueba estandarizado (Re=100, estela de cilindro) para comparar implementaciones en PyTorch, JAX o TensorFlow.
- Docencia en CFD y aprendizaje automatico cientifico: el caso de estela de cilindro es un ejemplo clasico que ilustra como se impone la fisica como perdida en una red neuronal.
- Punto de partida para extensiones a otros numeros de Reynolds: los scripts de entrenamiento permiten reentrenar con datos DNS de otros regimenes para estudiar la generalizacion del esquema TSA.
- Integracion en pipelines de investigacion reproducible: el checkpoint con hash SHA256 verificado y la estructura de `config/config.yaml` y `results/` facilitan la trazabilidad en experimentos de laboratorio.

## Benchmarks y rendimiento

| Metrica | Checkpoint incluido (update 3956) | Paper original |
|---|---|---|
| Error relativo L2 en u (t=10) | 0,021981 | 0,01960 |
| Error relativo L2 en v (t=10) | 0,083490 | 0,06630 |

La propia model card advierte que la convencion de evaluacion agregada del paper no esta completamente especificada, por lo que la comparacion no es estrictamente equivalente. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB, dado el tamano reducido de la red (4 capas x 50 unidades); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento completo de 4000 pasos se puede ejecutar en GPU o DCU segun la model card.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia.
- Opciones de despliegue: PyTorch nativo mediante los scripts `inference.py` y `result.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TSA-PINN-CylinderWake | PINN con activacion sinusoidal entrenable | no disponible (4x50) | no aplica | other | Hugging Face, ModelScope |
| PINN clasica (referencia del paper) | PINN con activacion convencional | no disponible | no aplica | no disponible | no disponible |
| Alternativas PINN para estela de cilindro | PINN estandar | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos cuantitativos de modelos comparables en la informacion proporcionada; la comparacion directa con el paper original se recoge en la seccion de benchmarks.

## Limitaciones y advertencias

- Ambito muy restringido: solo resuelve el caso de estela de cilindro a Re=100 en 2D; no generaliza a otros regimenes, geometrias o problemas de fluidos sin reentrenamiento.
- No es un modelo de lenguaje ni un modelo generativo de proposito general; no debe evaluarse con metricas de NLP.
- El dataset original (`cylinder_nektar_wake.mat`) no se incluye en el repositorio y debe descargarse por separado; sus terminos de uso deben verificarse de forma independiente.
- La licencia `other` no especifica condiciones de uso comercial; es necesario contactar con los autores o revisar la publicacion original antes de cualquier uso productivo.
- El checkpoint incluido no reproduce exactamente los errores del paper (0,021981 frente a 0,01960 en u; 0,083490 frente a 0,06630 en v), y la propia model card reconoce que la comparacion no es estrictamente equivalente.
- Riesgo de sobreajuste al caso concreto y dependencia de la calidad y resolucion de los datos DNS de referencia.
- Documentacion unicamente en ingles; no hay soporte multilingue.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/TSA-PINN-CylinderWake
- Paper original: https://publications.polymtl.ca/65937/1/2025_Khademi_Physics-informed_neural_networks_trainable.pdf
- Repositorio de los autores: https://github.com/AmirhosseinnnKhademi/TSA-PINN
- Dataset en ModelScope: https://www.modelscope.cn/datasets/OneScience/TSA-PINN-CylinderWake
