# nkougioulis/LCM-9.4M

## Resumen

LCM-9.4M es un modelo de descubrimiento causal temporal desarrollado por Nikolaos Kougioulis y colaboradores (Universidad de Creta y otros), presentado en el articulo "Large Causal Models for Temporal Causal Discovery". No es un modelo de lenguaje: es una red neuronal especializada que, dada una serie temporal multivariante, predice la estructura de dependencias causales rezagadas entre variables (un tensor de adyacencia lagged). Pertenece a la familia que los autores denominan Large Causal Models (LCM).

El modelo resuelve un problema clasico de la inferencia causal: recuperar un grafo causal dirigido a partir de datos observacionales de series temporales, una tarea tradicionalmente abordada con metodos estadisticos (Granger, PCMCI, VAR-LiNGAM) que sufren con ruido, no linealidades y muestras cortas. LCM lo plantea como un problema de aprendizaje supervisado sobre datos sinteticos, lo que permite inferencia amortizada en un unico forward pass.

Con 9,4 millones de parametros, una ventana maxima de 500 pasos temporales, hasta 12 variables y un lag maximo de 3, es un modelo muy ligero pensado para ejecutarse en CPU o GPU consumer. Su relevancia actual radica en la creciente linea de trabajo que aplica aprendizaje profundo a la inferencia causal estructural, un area donde los enfoques clasicos siguen siendo la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para descubrimiento causal temporal (detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 9.662.384 (safetensors); la model card indica 9.402.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Secuencia temporal maxima de 500 pasos; maximo 12 variables; lag maximo 3 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lcm-pytorch) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (numero de capas, tipo de atencion, dimensiones ocultas ni mecanismo exacto de agregacion temporal). Lo que si se conoce es la interfaz: el modelo recibe como entrada la serie temporal `X` de forma `(T, n_vars)` (con `n_vars` hasta 12 y `T` hasta 500, con padding) junto con una matriz de correlacion cruzada rezagada calculada con `lagged_batch_crosscorrelation(X, 3)`, y produce un tensor de adyacencia lagged de forma `(batch, 12, 12, 3)` que, tras aplicar sigmoide, representa la probabilidad de dependencia causal de cada variable hacia cada variable en cada lag.

El entrenamiento se realiza, segun la naturaleza del problema y el paper citado, sobre datos sinteticos generados con estructura causal conocida (el articulo se publico en ECML PKDD 2026). No se dispone en la informacion proporcionada de detalles sobre el numero de muestras de entrenamiento, la composicion del dataset sintetico, ni si se emplearon tecnicas de refinamiento tipo RLHF/DPO (poco probables en este dominio).

## Capacidades

- Descubrimiento causal temporal: predice un grafo causal dirigido y rezagado entre hasta 12 variables con un lag maximo de 3.
- Inferencia amortizada: un unico forward pass sustituye la optimizacion iterativa de metodos clasicos como PCMCI.
- Manejo de series de hasta 500 pasos temporales.
- Salida probabilistica: el sigmoide sobre la adyacencia permite umbralizar y obtener grafos con distinto nivel de confianza.
- Entrada con features de correlacion cruzada rezagada como soporte estadistico.
- No soporta tool calling, agentes, generacion de texto, vision ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Analisis de series temporales financieras: identificar relaciones causales rezagadas entre indicadores (tipos de interes, inflacion, indices) para construir modelos estructurales de riesgo, aprovechando que el modelo admite hasta 12 variables y 500 observaciones.
- Monitorizacion industrial y mantenimiento predictivo: descubrir que sensores influyen causalmente sobre otros con retardo (hasta 3 lags), lo que ayuda a aislar la causa raiz de una anomalia en una planta.
- Neurociencia y analisis de senales: estimar conectividad efectiva entre hasta 12 canales EEG/fMRI con dependencias temporales, como alternativa ligera a metodos de Granger.
- Investigacion en climatologia: detectar relaciones causales rezagadas entre variables meteorologicas (temperatura, humedad, presion) en ventanas de hasta 500 pasos.
- Benchmarking de metodos causales: usar LCM como baseline aprendido frente a PCMCI, VAR-LiNGAM o Granger en experimentos controlados con ground truth sintetico.
- Educacion y prototipado rapido: al pesar menos de 10 MB y cargarse con `from_pretrained`, sirve para experimentar con inferencia causal en cuadernos sin infraestructura pesada.
- Analisis de mercado y marketing mix: estimar el efecto rezagado de inversiones publicitarias sobre ventas con hasta 12 canales y 3 retardos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (9,4 M de parametros, ~38 MB de pesos) mas el coste de activaciones y del tensor de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; A100, H100, RTX 4090, RTX 3090 o incluso GPUs integradas.
- Cabe en cualquier GPU consumer e incluso en CPU para series cortas; el cuello de botella es el calculo de `lagged_batch_crosscorrelation` y el tamano de la secuencia, no los parametros.
- Opciones de despliegue: libreria propia `lcm-pytorch` (instalable via `pip install git+https://github.com/kougioulis/LCM`), PyTorch nativo, Hugging Face Hub con `from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU para una ventana de 500x12.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LCM-9.4M | 9,4 M | 500 pasos, 12 vars, lag 3 | Descubrimiento causal temporal | Apache 2.0 | Hugging Face |
| PCMCI (algoritmo clasico) | no aplica | configurable | Descubrimiento causal temporal | GPL / libre | Implementacion en Python (tigramite) |
| VAR-LiNGAM | no aplica | configurable | Causalidad lineal en series temporales | libre | Implementacion academica |
| Granger causality | no aplica | configurable | Causalidad predictiva lineal | libre | statsmodels |

No se dispone de otros modelos neuronales comparables de la misma familia en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no linguistico: no genera texto ni responde a prompts; usarlo fuera de su tarea produce resultados sin sentido.
- Limites estrictos de forma: maximo 12 variables, 500 pasos y lag 3; requiere padding a estas dimensiones, lo que puede degradar el rendimiento con series mas cortas o con muchas variables.
- Dependencia del supuesto de datos sinteticos: al entrenarse (presumiblemente) con datos generados, puede no generalizar a series reales con no estacionalidad, cambios de regimen o ruido no modelado.
- Riesgo de falsos positivos/negativos en la adyacencia: la salida es probabilistica y requiere umbralizacion, lo que introduce sensibilidad al hiperparametro.
- Sin garantias de identificabilidad causal: como todo metodo observacional, no sustituye a la experimentacion controlada.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene citar el paper y revisar la licencia del codigo en el repositorio GitHub.
- Ecosistema muy nicho: la libreria `lcm-pytorch` se instala desde GitHub y no esta en PyPI, lo que anade riesgo de mantenimiento.
- Sin datos de benchmarks publicos en esta ficha: no se puede comparar cuantitativamente con metodos clasicos sin consultar el paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkougioulis/LCM-9.4M
- Paper (Hugging Face Papers): https://huggingface.co/papers/2602.18662
- Repositorio de codigo: https://github.com/kougioulis/LCM
- README del repositorio: https://github.com/kougioulis/LCM (README.md)
- Cita: Kougioulis, N., Gkorgkolis, N., Wang, M., Caglayan, B., Simionato, D., Tonon, A., Tsamardinos, I. "Large Causal Models for Temporal Causal Discovery", ECML PKDD 2026, pp. 414-429, Springer.
