# nkougioulis/LCM-2.5M

## Resumen

LCM-2.5M es un modelo pequeno (2.603.184 parametros segun los pesos en safetensors, 2.473.136 segun la model card) desarrollado por Nikolaos Kougioulis y colaboradores para el descubrimiento causal temporal en series de tiempo. No es un modelo de lenguaje: pertenece a la familia de "Large Causal Models" (LCMs) descritos en el paper *Large Causal Models for Temporal Causal Discovery* (ECML PKDD 2026), y su salida es un tensor de adyacencia causal con desfases temporales, no texto.

El modelo resuelve un problema concreto de la inferencia causal: dada una serie temporal multivariante, estimar que variables influyen sobre cuales y con que retardo (lag). Frente a los metodos clasicos de descubrimiento causal (PCMCI, Granger, etc.), que requieren busquedas combinatorias y tests de independencia condicional costosos, LCM plantea un enfoque aprendido que produce la estructura causal en una sola pasada hacia delante.

Es relevante ahora porque demuestra que un modelo de apenas 2,5 millones de parametros puede abordar descubrimiento causal temporal, abriendo la puerta a su uso en entornos con recursos limitados y a su integracion como componente en pipelines de analisis de series temporales. Sus limites operativos estan fijados en el diseno: maximo 12 variables, lag maximo 3 y longitud de secuencia de hasta 500 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal causal aprendida (Large Causal Model); arquitectura interna detallada no disponible en la informacion proporcionada |
| Parametros totales | 2.603.184 (safetensors) / 2.473.136 (segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de lenguaje; secuencia temporal maxima de 500 pasos |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lcm-pytorch, PyTorchModelHubMixin) |
| Maximo de variables | 12 |
| Lag maximo | 3 |
| Longitud maxima de secuencia | 500 |
| Entrada | Serie temporal (T, n_vars) con padding a 12 variables y T=500, mas matriz de correlacion cruzada con desfases |
| Salida | Tensor de adyacencia causal con lag de forma (1, 12, 12, 3) tras aplicar sigmoide |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (capas, atencion, tipo de bloque). Lo que si se documenta es el contrato de entrada y salida: el modelo recibe la serie temporal `X` de forma `(T, n_vars)` y una matriz de correlacion cruzada con desfases calculada con `lagged_batch_crosscorrelation(X, 3)`, y devuelve un tensor de adyacencia causal con desfases de forma `(1, 12, 12, 3)` que se interpreta tras aplicar una sigmoide. Esto sugiere que el modelo combina la serie cruda con estadisticos de correlacion desfasada como senal de entrada, y que su cabeza de salida es una prediccion binaria por par de variables y lag.

No se proporcionan datos sobre el numero de tokens o pasos de entrenamiento, la composicion del dataset, ni si se empleo RLHF/DPO u otra tecnica de alineacion. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La innovacion principal que si se explicita es el propio planteamiento: sustituir el descubrimiento causal combinatorio por un modelo aprendido que predice directamente la estructura causal temporal.

## Capacidades

- Descubrimiento causal temporal: estima la estructura de dependencias causales entre variables de una serie temporal multivariante.
- Prediccion de adyacencia con lag: produce, para cada par de variables, si existe una relacion causal y con que desfase (hasta lag 3).
- Trabajo con series multivariantes de hasta 12 variables y hasta 500 pasos temporales.
- Salida probabilistica: la sigmoide sobre el tensor de adyacencia permite umbralizar las relaciones causales segun el nivel de confianza deseado.
- Integracion en PyTorch: se carga con `LCMModule.from_pretrained` y se ejecuta con `torch.no_grad()`.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Analisis de sensores industriales: con series de hasta 12 sensores y 500 lecturas, el modelo puede estimar que sensores influyen sobre cuales y con que retardo, util para diagnostico de fallos y mantenimiento predictivo.
- Monitorizacion de infraestructura: aplicar el modelo a metricas de sistema (CPU, memoria, latencia, errores) para descubrir relaciones causales entre ellas y priorizar la investigacion de incidentes.
- Investigacion en finanzas cuantitativas: analisis de relaciones causales desfasadas entre un conjunto reducido de series de precios o indicadores, con la ventaja de una inferencia en una sola pasada.
- Analisis de datos clinicos o fisiologicos: series de senales (hasta 12 canales, 500 muestras) para explorar dependencias temporales entre variables monitorizadas.
- Docencia y prototipado en inferencia causal: modelo ligero para experimentar con descubrimiento causal aprendido sin infraestructura pesada, gracias a sus 2,5 millones de parametros.
- Componente en pipelines de analisis de series temporales: como paso previo a modelos predictivos, aportando una estructura causal que informe la seleccion de variables o la ingenieria de caracteristicas.
- Validacion de metodos: referencia pequena para comparar contra metodos clasicos de descubrimiento causal (PCMCI, Granger) en conjuntos con hasta 12 variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; con 2,6 millones de parametros en precision completa (FP32) los pesos ocupan aproximadamente 10 MB, y en FP16 unos 5 MB. El cuello de botella es la serie de entrada (hasta 12 x 500 valores) y las activaciones, no el modelo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo puede ejecutarse en CPU sin problema. No se requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: la libreria oficial `lcm-pytorch` (instalable desde el repositorio de GitHub) sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limites | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LCM-2.5M | 2,6 M | 12 variables, lag 3, 500 pasos | Descubrimiento causal temporal | apache-2.0 | Hugging Face |
| Metodos clasicos (PCMCI, Granger) | no aplica (no neuronal) | segun implementacion | Descubrimiento causal temporal | variable | Implementaciones open source |
| Modelos de lenguaje pequenos (p. ej. <1B) | cientos de millones | miles de tokens | Generacion de texto | variable | Hugging Face |

No se dispone de otros modelos neuronales comparables de descubrimiento causal temporal en la informacion proporcionada; la comparativa con metodos clasicos se limita a la categoria de tarea, no a metricas de rendimiento, que no se han publicado.

## Limitaciones y advertencias

- Limites duros de diseno: maximo 12 variables, lag maximo 3 y secuencia maxima de 500 pasos. Fuera de estos limites el modelo no es aplicable directamente.
- Requiere padding explicito de la entrada a 12 variables y 500 pasos, lo que puede introducir artefactos si no se gestiona con cuidado.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, vision ni audio.
- No se han publicado benchmarks ni metricas de calidad en la informacion disponible; el rendimiento real en descubrimiento causal no esta cuantificado aqui.
- Riesgo de falsos positivos y falsos negativos en la estructura causal inferida; la salida es probabilistica y requiere umbralizacion y validacion con conocimiento de dominio.
- Sin datos sobre sesgos del dataset de entrenamiento ni sobre su composicion, por lo que no se puede evaluar su robustez fuera de la distribucion de entrenamiento.
- La licencia apache-2.0 permite uso comercial, pero al no haber benchmarks publicados conviene validar el modelo en el dominio concreto antes de usarlo en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; ecosistema y soporte comunitario practicamente inexistentes.
- La discrepancia entre el numero de parametros de la model card (2.473.136) y el de los pesos safetensors (2.603.184) debe tenerse en cuenta al planificar recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkougioulis/LCM-2.5M
- Paper: https://huggingface.co/papers/2602.18662
- Repositorio de codigo: https://github.com/kougioulis/LCM
- README del repositorio: https://github.com/kougioulis/LCM (README.md)
