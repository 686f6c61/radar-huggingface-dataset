# simonpf/gprof_ir

## Resumen

GPROF IR es una red neuronal para la recuperación de precipitación superficial a partir de observaciones infrarrojas de satélites geoestacionarios. Lo desarrolla Simon Pfreundschuh y se distribuye con licencia MIT. El modelo toma como entrada temperaturas de brillo en la banda de 11 µm y produce estimaciones de precipitación en superficie, siguiendo la estela del algoritmo clásico GPROF (Goddard Profiling Algorithm) pero sustituyendo el motor físico-estadístico por un modelo neuronal entrenado con datos colocalizados.

El modelo no es un LLM ni un modelo de lenguaje: es un modelo de regresión entrenado con pérdida de regresión por cuantiles sobre datos de satélite y estimaciones de referencia derivadas del producto GPM 2BCMB. Su interés radica en que permite generar estimaciones de precipitación de alta frecuencia temporal a partir de la constelación de satélites geoestacionarios, que ofrecen muestreo cada 10-15 minutos, algo que los sensores de microondas pasivos no pueden proporcionar.

El repositorio ocupa 0,8 GB y está implementado en PyTorch. La información pública disponible es escasa: no se detallan arquitectura interna, número de parámetros, resolución espacial ni métricas numéricas de rendimiento, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal en PyTorch (topologia interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresion, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada numerica: temperaturas de brillo) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo PyTorch, 0,8 GB) |

## Arquitectura y entrenamiento

La model card no especifica la topologia concreta de la red (número de capas, dimensiones ocultas, uso de convoluciones o capas densas). Se sabe que está implementada en PyTorch y que se entrena con el optimizador AdamW y una función de pérdida de regresión por cuantiles, lo que permite modelar la distribución condicional de la precipitación y no solo su media, algo relevante en una variable tan asimétrica y con tanto peso de los eventos extremos.

Los datos de entrenamiento combinan observaciones de satélite con estimaciones de precipitación de referencia colocalizadas derivadas del producto GPM 2BCMB (Combinación de microondas del Global Precipitation Measurement). El preprocesado incluye normalización de las entradas. El entrenamiento se realizó sobre 2 NVIDIA RTX 6000 y los hiperparámetros, según el autor, no se ajustaron de forma exhaustiva. No se indica el volumen de datos, la resolución espacial ni el periodo temporal cubierto.

## Capacidades

- Estimación de precipitación superficial a partir de una única banda infrarroja (11 µm) de sensores geoestacionarios.
- Regresión por cuantiles: el modelo puede producir estimaciones condicionadas a distintos cuantiles de la distribución de precipitación, no solo un valor medio.
- Entrada numérica de temperaturas de brillo; no procesa texto, imágenes RGB ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de lenguaje.
- Salida orientada a aplicaciones meteorológicas e hidrológicas, no a interacción conversacional.

## Casos de uso

- Monitorización de precipitación en tiempo casi real: al alimentarse de satélites geoestacionarios con cadencia de 10-15 minutos, permite generar mapas de lluvia de alta frecuencia temporal sobre regiones con cobertura geoestacionaria, algo que los sensores de microondas no ofrecen por su menor revisita.
- Hidrología operativa: las estimaciones de precipitación pueden integrarse en modelos de caudal o de balance hídrico en cuencas donde la red de pluviómetros es escasa, aprovechando la cobertura espacial continua del IR geoestacionario.
- Vigilancia de eventos extremos: la regresión por cuantiles permite obtener estimaciones en los cuantiles altos de la distribución, útiles para detectar episodios de lluvia intensa en regiones sin radar terrestre.
- Investigación climática: la serie temporal de estimaciones IR permite construir climatologías de precipitación homogéneas sobre zonas tropicales y subtropicales, comparables con productos de microondas.
- Validación y fusión de productos: puede usarse como componente de un esquema de fusión multisensor, combinando su alta frecuencia temporal con la mayor precisión física de los sensores de microondas.
- Docencia y prototipado: al ser un modelo pequeño (0,8 GB de repositorio) con licencia MIT y PyTorch, sirve como base para experimentos de recuperación de precipitación y para reproducir el pipeline de entrenamiento con datos GPM.

## Benchmarks y rendimiento

La model card indica que la evaluación se realizó con sesgo, MSE, MAE y coeficiente de correlación, comparando contra radar terrestre, pero no publica los valores numéricos. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,8 GB, lo que sugiere que el modelo cabe holgadamente en GPUs de consumo, pero no se especifica el tamaño de los pesos.
- GPU recomendadas: cualquiera con soporte CUDA y suficiente memoria para el tamaño real del modelo; el entrenamiento se hizo con 2 NVIDIA RTX 6000.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio, aunque no se confirma en la documentación.
- Opciones de despliegue: PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| GPROF IR (simonpf) | Red neuronal de regresión | IR 11 µm geoestacionario | MIT | Hugging Face |
| GPROF (NASA, algoritmo clásico) | Bayesiano físico-estadístico | Microondas pasivas | No aplica (algoritmo) | Documentación NASA |
| PPCT / redes neuronales de precipitación | Redes neuronales | Microondas / IR | Variable | Literatura científica |

No se dispone de datos numéricos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo usa la banda de 11 µm; la información de IR es indirecta para la precipitación, lo que limita la precisión frente a sensores de microondas, especialmente en precipitación estratiforme débil y en superficies frías o nubosas altas.
- El rendimiento puede variar entre regímenes climáticos, tal como advierte el propio autor.
- No se documentan sesgos específicos, pero al entrenarse con GPM 2BCMB hereda los sesgos y errores de ese producto de referencia.
- Riesgo de estimaciones poco fiables fuera de la distribución de entrenamiento (regiones, estaciones o tipos de nube no representados).
- La licencia MIT permite uso comercial, pero no hay garantías de exactitud ni soporte; es un modelo de investigación.
- No se especifican resolución espacial, periodo de entrenamiento ni métricas numéricas, lo que dificulta evaluar su idoneidad para producción sin validación propia.
- No es un modelo de lenguaje: no debe usarse para tareas de texto, código o razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/simonpf/gprof_ir
- Repositorio GitHub: https://github.com/simonpf/gprof_ir
- Producto GPM 2BCMB (referencia de datos de entrenamiento): https://gpm.nasa.gov/data/directory
