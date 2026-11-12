# okayuji/chronos-2-coreai-fp32

## Resumen

Chronos-2 Core AI FP32 es una conversión del modelo amazon/chronos-2 al formato Core AI de Apple, publicada por el usuario okayuji. El artefacto empaqueta los pesos en Float32 dentro de un bundle Core AI (`Model.aimodel`) que se ejecuta de forma nativa en Mac con chip de Apple Silicon mediante el runtime Swift de Core AI. Su interfaz está deliberadamente restringida: pronostica los siguientes 16 pasos de una única serie temporal univariante y devuelve 21 cuantiles por paso.

El modelo base, Chronos-2 de Amazon, es un modelo de series temporales de tipo transformer. Esta conversión no expone la API completa del original: no admite entradas multivariantes, covariables meteorológicas ni horizontes superiores a 16 pasos. El propósito es ofrecer a desarrolladores Swift una vía de evaluación local de forecasting sin salir del ecosistema Apple.

El bundle ocupa 478.864.956 bytes distribuidos en nueve ficheros, con un grafo Core AI de unos 478 MB. La licencia es Apache-2.0, heredada del modelo base. No se han publicado resultados de benchmarks propios ni métricas de calidad del pronóstico en la información disponible; el único dato de rendimiento es una medición diagnóstica de latencia del runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base amazon/chronos-2); exportado como grafo Core AI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1–8.192 observaciones de entrada (al menos un valor finito); entrada nativa `[1,T]` con T múltiplo de 16 y padding NaN a la izquierda |
| Tipos de cuantizacion | Float32 únicamente (pesos, entrada y salida) |
| Idiomas soportados | no aplica (modelo de series temporales, sin texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundle Core AI (`bundle/Model.aimodel/main.mlirb`, grafo y parámetros); no se distribuyen safetensors ni GGUF |
| Salida | 21 cuantiles × 16 pasos, Float32 `[1,21,16]` |
| Estado del modelo | sin estado (stateless) |
| Tamano del bundle | 478.864.956 bytes en nueve ficheros |
| Libreria | coreai |

## Arquitectura y entrenamiento

El modelo subyacente es amazon/chronos-2, un transformer para pronóstico de series temporales. Esta conversión no reentrena ni modifica los parámetros aprendidos: el export toma los pesos del modelo original fijado y los reempaqueta en un grafo Core AI. Según la documentación del autor, el export restringe la salida a un único parche de 16 pasos, sustituye únicamente la descomposición en parches no solapados soportada y conserva la constante de normalización Float32 de escala cero del original. El orden de los 21 cuantiles proviene del modelo original y está fijado en `chronos2.json`.

La conversión se realizó con chronos-forecasting 2.3.2. El bundle incluye un `reference.json` con vectores de referencia oficiales fijos (804.253 bytes) y un `verification.json` con el resumen de verificación, de modo que el cargador valida el inventario completo y el contrato del modelo antes de usarlo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Pronóstico univariante de series temporales: predice los 16 valores siguientes a partir de un contexto de entre 1 y 8.192 observaciones.
- Salida probabilística: devuelve 21 niveles de cuantil por paso, incluidos 0,1, 0,5 y 0,9.
- Manejo de valores ausentes: los `null` en JSON se traducen a NaN en el runtime y el modelo los acepta dentro del contexto.
- Inferencia local en dispositivo: se ejecuta con el runtime Swift de Core AI en Mac con Apple Silicon, sin llamadas a servicios externos.
- Integración con Swift: CLI de verificación (`chronos-verify`) y app de ejemplo para macOS que permite importar el bundle desde la interfaz.
- Sin tool calling, sin generación de texto, sin visión, sin audio y sin capacidades multilingües: es exclusivamente un modelo de forecasting numérico.
- Sin estado entre peticiones: cada llamada es independiente y no conserva historial.

## Casos de uso

- Pronóstico de demanda a corto plazo en apps macOS: un desarrollador Swift puede predecir los próximos 16 intervalos de una métrica (ventas, peticiones, consumo) usando el bundle directamente en la app, sin backend.
- Predicción de series financieras de alta frecuencia: con contexto de hasta 8.192 observaciones y salida de 16 pasos, encaja en escenarios intradía donde el horizonte es corto y la cadencia de muestreo es fija.
- Monitorización de infraestructura: anticipar los próximos 16 puntos de métricas como latencia o uso de CPU para disparar alertas antes de que se cruce un umbral, ejecutando el modelo en el propio portátil del ingeniero.
- Evaluación de modelos de forecasting en el ecosistema Apple: sirve como referencia para comparar el comportamiento de Chronos-2 contra implementaciones propias en Swift, gracias a los vectores de referencia fijados en el bundle.
- Prototipado de funciones de previsión en apps de salud o fitness: estimar las próximas 16 muestras de una señal univariante (frecuencia cardiaca, pasos) con intervalos de cuantiles para mostrar bandas de incertidumbre.
- Docencia y experimentación: el bundle incluye la licencia, el NOTICE, la model card original sin modificar y los ficheros de verificación, lo que facilita reproducir el experimento y auditar la conversión en un curso o artículo técnico.
- Pruebas de integración en CI: el CLI `chronos-verify` escribe la salida completa con identidad del modelo y límites de tiempo, y se niega a sobrescribir ficheros existentes, lo que permite usarlo como comprobación de regresión en pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es una medición diagnóstica del runtime: una llamada al CLI en Release sobre un Apple M5 Max con 128 GiB de RAM, macOS 27.2.1, Xcode 27.2 y Swift 6.4.2, con batch 1, una petición y sin warmup, reportó 1,638443458 segundos con `loaded: true`. Ese intervalo incluye el hashing del bundle, la copia verificada y la carga del modelo hasta la validación de la salida, y excluye la compilación Swift. El autor advierte explícitamente que es una observación diagnóstica y no una comparación de velocidad ni un requisito de dispositivo.

## Requisitos de hardware

- VRAM/ memoria: no se ha establecido un requisito mínimo de memoria. El bundle pesa unos 479 MB, pero el runtime necesita espacio adicional para metadatos de descarga, copias gestionadas y cachés de especialización de Core AI.
- Plataforma verificada: Apple M5 Max con 128 GiB de RAM, macOS 27.2.1 (26B131), Xcode 27.2 (27B52) y Swift 6.4.2.
- GPU: no aplica en el sentido de CUDA; requiere Apple Silicon con el runtime Core AI. No se ha verificado la inferencia en un iPhone físico.
- GPU de consumo (NVIDIA/AMD): no soportado por este artefacto, que es específico de Core AI.
- Despliegue: runtime Swift de Core AI, CLI `chronos-verify` y app de ejemplo de macOS del repositorio coreai-samples. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: solo la medición diagnóstica citada (1,64 s por llamada en las condiciones descritas); no hay datos de throughput sostenido ni de latencia con warmup.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Horizonte de salida | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| okayuji/chronos-2-coreai-fp32 | no disponible | 1–8.192 observaciones | 16 pasos, 21 cuantiles | Apache-2.0 | Bundle Core AI, Apple Silicon |
| amazon/chronos-2 (original) | no disponible | no disponible | multivariante, covariables y horizontes largos | Apache-2.0 | Paquete Python (chronos-forecasting) |
| Otros modelos de forecasting | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base: esta conversión recorta capacidades (univariante, 16 pasos, sin covariables) a cambio de ejecución nativa en Swift sobre Apple Silicon. No se dispone de datos de benchmarks que permitan comparar la calidad del pronóstico con alternativas.

## Limitaciones y advertencias

- Interfaz restringida: solo series univariantes, solo 16 pasos de horizonte y sin covariables. Para entradas multivariantes, covariables meteorológicas o pronósticos más largos hay que usar el paquete original de Chronos-2.
- Sin entrada de fechas: el paso de pronóstico es un intervalo a la cadencia de muestreo de la entrada; no se aceptan marcas temporales.
- Solo Float32: no hay versiones cuantizadas, lo que limita la reducción de memoria y el rendimiento en dispositivos con poca RAM.
- Plataforma muy específica: requiere el runtime Core AI y Apple Silicon; no es portable a Linux, Windows ni GPU NVIDIA. La inferencia en iPhone no está verificada.
- Sin métricas de calidad publicadas: no hay benchmarks de precisión del pronóstico en esta conversión, por lo que la evaluación debe hacerse con datos propios.
- Riesgo de alucinación: en modelos de forecasting se traduce en pronósticos poco realistas ante series con cambios de régimen, valores atípicos o contextos muy cortos; no hay documentación específica sobre este comportamiento en la información disponible.
- Sesgos: no disponible. No se documentan sesgos del modelo base ni del proceso de conversión.
- Integridad del bundle: el cargador valida el inventario y el contrato; editar metadatos altera la identidad de confianza del artefacto. Hay que mantener el bundle intacto.
- Concurrencia: el autor recomienda ejecutar una sola carga de modelo a la vez; la automatización del repositorio usa un bloqueo de modelo compartido.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar el NOTICE por los cambios de conversión y la atribución al modelo base.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni comunidad que valide el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okayuji/chronos-2-coreai-fp32
- Modelo base: https://huggingface.co/amazon/chronos-2
- Repositorio de ejemplos Core AI: https://github.com/oka-yuji/coreai-samples
- Guía del demo NYC taxi: https://github.com/oka-yuji/coreai-samples/blob/3b3cfe2f70fa6f2b4fa7d9a8aeed51211f890dd3/docs/chronos2.md
- Detalles de conversión y fallos retenidos: https://github.com/oka-yuji/coreai-samples/blob/3b3cfe2f70fa6f2b4fa7d9a8aeed51211f890dd3/Tools/Conversion/recipes/chronos2/README.md
- CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
