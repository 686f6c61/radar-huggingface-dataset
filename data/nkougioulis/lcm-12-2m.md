# nkougioulis/LCM-12.2M

## Resumen

LCM-12.2M es un modelo de descubrimiento causal temporal publicado por Nikolaos Kougioulis y colaboradores (Universidad de Creta y otros), presentado en el articulo "Large Causal Models for Temporal Causal Discovery" en la Joint European Conference on Machine Learning and Knowledge Discovery in Databases (ECML PKDD 2026). No es un modelo de lenguaje: es una red neuronal entrenada especificamente para inferir la estructura causal de series temporales multivariantes, es decir, determinar que variable influye sobre cual y con que retardo temporal.

El modelo pertenece a la familia de los llamados Large Causal Models (LCM), una propuesta que traslada el paradigma de los modelos fundacionales al descubrimiento causal: en lugar de ejecutar un algoritmo de descubrimiento causal clasico por cada nuevo conjunto de datos, se entrena una red que aprende a predecir directamente la matriz de adyacencia retardada a partir de la serie temporal y de sus correlaciones cruzadas retardadas. El modelo tiene 12.468.656 parametros segun los pesos en safetensors (12.207.536 segun la model card), y esta disenado para un maximo de 12 variables, un retardo maximo de 3 y una longitud de secuencia de 500 pasos.

Es relevante ahora porque propone un enfoque amortizado para el descubrimiento causal temporal: una sola pasada de inferencia sustituye la busqueda combinatoria de los metodos clasicos, lo que puede reducir drasticamente el coste computacional en aplicaciones de analisis de series temporales. Su licencia Apache 2.0 y su tamano reducido (12 millones de parametros) lo hacen facil de desplegar, aunque su ambito de aplicacion esta estrictamente limitado al descubrimiento causal sobre series temporales con las dimensiones indicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal especifica para descubrimiento causal temporal; detalles en el paper) |
| Parametros totales | 12.468.656 (safetensors); 12.207.536 segun model card |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; longitud maxima de secuencia de 500 pasos temporales |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lcm-pytorch) |
| Variables maximas | 12 |
| Retardo maximo | 3 |
| Entrada | serie temporal (T, n_vars) y correlacion cruzada retardada |
| Salida | tensor de adyacencia retardada de forma (1, 12, 12, 3) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se implementa como un modulo PyTorch (`LCMModule`) que consume dos entradas: la serie temporal multivariante y una matriz de correlacion cruzada retardada calculada con `lagged_batch_crosscorrelation(X, 3)`. La salida es un tensor de adyacencia retardada de dimensiones (1, 12, 12, 3), donde cada entrada indica la probabilidad de que exista una relacion causal entre una variable origen, una variable destino y un retardo concreto (hasta 3). La funcion de activacion aplicada es sigmoide, lo que confirma que la salida se interpreta como probabilidad de arista causal.

El modelo se enmarca en la propuesta de Large Causal Models descrita en el paper, que plantea el descubrimiento causal como una tarea de aprendizaje supervisado amortizado: la red se entrena sobre datos sinteticos o simulados con estructura causal conocida para aprender a predecir la matriz de adyacencia a partir de la evidencia observacional. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de ajuste fino como RLHF o DPO (no aplicables en este dominio). Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal, que no tienen sentido en este tipo de modelo.

## Capacidades

- Descubrimiento causal temporal: infiere relaciones causales dirigidas y retardadas entre hasta 12 variables a partir de una serie temporal de hasta 500 pasos.
- Prediccion de adyacencia retardada: genera un tensor (12, 12, 3) con la probabilidad de cada arista causal para cada retardo de 1 a 3.
- Inferencia amortizada: una sola pasada hacia delante sustituye la busqueda combinatoria de los algoritmos clasicos de descubrimiento causal.
- Integracion con PyTorch: se carga mediante `LCMModule.from_pretrained` y se ejecuta en modo evaluacion con `torch.no_grad()`.
- Calculo de correlacion cruzada retardada: la libreria incluye utilidades como `lagged_batch_crosscorrelation` para construir la evidencia de entrada.
- No soporta generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.

## Casos de uso

- Analisis de series temporales financieras: el modelo puede estimar relaciones causales retardadas entre hasta 12 indicadores (precios, volumen, tipos de interes, volatilidad) sobre ventanas de 500 observaciones, lo que ayuda a identificar canales de transmision entre mercados y a construir modelos de riesgo con estructura causal explicita.
- Monitorizacion industrial y mantenimiento predictivo: con sensores de una planta (temperatura, presion, vibracion, caudal, etc.), el modelo infiere que sensor influye sobre cual y con que retardo, lo que permite priorizar inspecciones y construir sistemas de alerta temprana basados en cadenas causales.
- Analisis de datos de salud y epidemiologia: sobre series de hasta 12 variables (incidencia, hospitalizaciones, movilidad, temperatura, etc.) y ventanas de 500 dias, el modelo puede orientar hipotesis sobre relaciones causales retardadas entre indicadores, como paso previo a estudios confirmatorios.
- Descubrimiento causal en ciencias medioambientales: aplicado a variables climaticas o de calidad del aire (temperatura, humedad, contaminantes, viento) para identificar dependencias causales con retardo de hasta 3 pasos, util en modelos de atribucion y en la seleccion de variables para simulaciones.
- Investigacion metodologica en aprendizaje causal: sirve como linea base amortizada para comparar frente a algoritmos clasicos (PCMCI, Granger, etc.) en experimentos controlados con datos simulados de hasta 12 variables y 500 pasos.
- Preprocesamiento para modelos predictivos: la matriz de adyacencia descubierta puede usarse como estructura previa en modelos de series temporales (por ejemplo, grafos de dependencia para GNN temporales), reduciendo el espacio de busqueda y aportando interpretabilidad.
- Analisis de ensayos clinicos o datos de laboratorio: con un numero pequeno de variables medidas a lo largo del tiempo, el modelo puede generar hipotesis sobre el orden temporal de los efectos, siempre como herramienta exploratoria y nunca como sustituto de la inferencia estadistica formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 12,47 millones de parametros en fp32, los pesos ocupan aproximadamente 50 MB; en fp16, unos 25 MB. La memoria adicional depende del tamano del lote y de la serie de entrada (12 variables x 500 pasos), pero en cualquier caso es del orden de decenas de MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090). El modelo tambien puede ejecutarse en CPU sin problemas de rendimiento apreciables para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso en entornos integrados.
- Opciones de despliegue: al ser un modulo PyTorch puro, se despliega con la libreria `lcm-pytorch` instalada desde el repositorio de GitHub (`pip install git+https://github.com/kougioulis/LCM`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, pero son estimaciones no confirmadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma familia (Large Causal Models) ni de resultados de benchmarks que permitan una comparacion cuantitativa con alternativas como PCMCI, Granger causality o VAR-LiNGAM. La comparacion cualitativa seria la siguiente, aunque los datos de rendimiento no estan disponibles:

| Modelo | Parametros | Enfoque | Contexto / limite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LCM-12.2M | 12,47 M | Red neuronal amortizada para descubrimiento causal temporal | 12 variables, retardo 3, 500 pasos | Apache 2.0 | Hugging Face y GitHub |
| PCMCI (algoritmo clasico) | no aplica | Test de independencia condicional con busqueda combinatoria | Configurable, sin limite fijo | GPL / licencia del paquete | Implementaciones en Python (tigramite) |
| Granger causality (clasico) | no aplica | Test estadistico de precedencia temporal | Configurable | Segun implementacion | Multiples librerias |
| VAR-LiNGAM | no aplica | Modelo estructural lineal con identificacion | Configurable | Segun implementacion | Multiples librerias |

## Limitaciones y advertencias

- Ambito estrictamente limitado: solo admite hasta 12 variables, un retardo maximo de 3 y secuencias de hasta 500 pasos. Fuera de estos limites el modelo no es aplicable sin reentrenamiento o adaptacion.
- No es un modelo de lenguaje: no genera texto, no responde preguntas y no debe evaluarse con benchmarks de NLP.
- Riesgo de falsos positivos y negativos en la estructura causal: como todo metodo de descubrimiento causal a partir de datos observacionales, las aristas inferidas no implican causalidad real; requieren validacion con conocimiento de dominio o experimentos.
- Dependencia de supuestos no documentados: la informacion disponible no detalla los supuestos de identificacion (linealidad, estacionariedad, ausencia de confusores ocultos) bajo los cuales el modelo es valido.
- Sesgos de los datos de entrenamiento: al entrenarse probablemente sobre datos simulados, su comportamiento en datos reales con ruido, no estacionariedad o valores atipicos puede degradarse; no se documenta la composicion del dataset.
- Sin garantias de calibracion: la salida sigmoide se interpreta como probabilidad, pero no se documenta si esta calibrada.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia de las dependencias (PyTorch y lcm-pytorch).
- Madurez temprana: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la libreria `lcm-pytorch` se instala directamente desde GitHub, sin publicacion en PyPI, lo que implica riesgos de reproducibilidad y mantenimiento.
- Sin documentacion sobre cuantizacion ni despliegue en produccion: no hay guias para servir el modelo a escala ni para integracion en pipelines de inferencia estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkougioulis/LCM-12.2M
- Paper (Hugging Face Papers): https://huggingface.co/papers/2602.18662
- Repositorio de codigo: https://github.com/kougioulis/LCM
- README del repositorio: https://github.com/kougioulis/LCM (README.md)
- Cita del paper: Kougioulis, N., Gkorgkolis, N., Wang, M., Caglayan, B., Simionato, D., Tonon, A., Tsamardinos, I. "Large causal models for temporal causal discovery". ECML PKDD 2026, Springer, pp. 414-429.
