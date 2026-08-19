# oraculumai/ZUNA1.1-CoreML-Apple-30s

## Resumen

ZUNA1.1-CoreML-Apple-30s es una conversión a Core ML del modelo ZUNA1.1 de Zyphra, un autoencoder de difusión enmascarado de 380 millones de parámetros diseñado para la reconstrucción y superresolución de electroencefalogramas (EEG) de cuero cabelludo. El modelo original, desarrollado por Zyphra, acepta ventanas de EEG de hasta 30 segundos a 256 Hz y, a partir de un subconjunto de canales y sus coordenadas 3D, es capaz de denoising de canales observados, reconstrucción de canales perdidos y predicción de señales en posiciones físicas novedosas. Esta versión Core ML, publicada por el usuario oraculumai, adapta el modelo para su ejecución nativa en dispositivos Apple (iPhone, visionOS y macOS) mediante perfiles enumerados que garantizan formas de tensor deterministas y paridad numérica con los pesos originales de PyTorch.

La relevancia de esta conversión radica en que permite desplegar un modelo de EEG de última generación en hardware de consumo de Apple, algo especialmente útil para aplicaciones de neurotecnología portátil, investigación en interfaz cerebro-ordenador y monitorización de señales cerebrales en tiempo real. El modelo base ZUNA1.1 mejora a su predecesor ZUNA1 con entrenamiento sobre longitudes de entrada variables (0,5 a 30 segundos), reconstrucción por segmentos temporales y un esquema de corrupción/dropout más flexible. La conversión Core ML publica un perfil único de 14 canales en precisión fp32, validado con una ejecución de paridad de 20 pasos de difusión que muestra errores relativos del orden de 10⁻⁶ frente a PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de difusion enmascarado (position-aware diffusion autoencoder) |
| Parametros totales | 380 millones (modelo base ZUNA1.1) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de entrada de 30 segundos a 256 Hz (7680 muestras); tokenizacion con num_fine_time_pts=32 genera 240 tokens gruesos por canal |
| Tipos de cuantizacion | Solo fp32 (el modelo base es bf16, pero el decoder excede el rango fp16; no se publican perfiles fp16) |
| Idiomas soportados | No aplica (modelo de senales EEG); metadatos y documentacion en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML .mlpackage (ZunaEncoder.mlpackage, ZunaDecoderStep.mlpackage, ZunaDecoderStepUpdate.mlpackage) |

## Arquitectura y entrenamiento

El modelo base ZUNA1.1 es un autoencoder de difusion enmascarado con atencion a posiciones fisicas. La entrada son ventanas de EEG de 30 segundos a 256 Hz, que se tokenizan en fragmentos de 32 muestras, produciendo 240 tokens gruesos por canal. Cada token se codifica con un indice `tok_idx` que combina las coordenadas 3D del electrodo (x, y, z) y el indice temporal grueso. La inferencia consta de tres fases: un paso de encoder (una unica pasada), un bucle de denoising del decoder con N pasos de difusion, y la reconstruccion final de token a senal. La version 1.1 incorpora entrenamiento con longitudes de segmento variables (0,5 a 30 segundos, ajustadas a la rejilla de tokens de 0,125 segundos), reconstruccion por segmentos temporales y un esquema de corrupcion/dropout mas flexible que la version original. El modelo fue entrenado sobre un corpus publico de EEG armonizado a gran escala, aunque no se especifican el numero exacto de tokens de entrenamiento ni el desglose del dataset en la informacion disponible.

La conversion Core ML preserva el contrato tensorial del modelo base y publica un unico perfil operativo: `14ch-fp32`, que corresponde a 14 canales (estilo Emotiv EPOC X), 3360 tokens y tensores de forma `[1, 3360, 32]`. La validacion de paridad se realizo con 20 pasos de difusion, obteniendo un error relativo L2 de 0.000006 frente a los pesos PyTorch originales, muy por debajo del umbral de 0.005 establecido.

## Capacidades

- Denoising de canales EEG observados: elimina ruido y artefactos de las senales registradas.
- Reconstruccion de canales faltantes: estima la actividad en electrodos que no estan presentes en el montaje.
- Prediccion de senales en posiciones novedosas: dado un conjunto de coordenadas 3D arbitrarias, el modelo genera la senal esperada en esa ubicacion fisica.
- Superresolucion espacial: mejora la densidad de canales a partir de un montaje reducido.
- Manejo de longitudes de entrada variables (0,5 a 30 segundos) gracias al entrenamiento flexible de ZUNA1.1.
- Inferencia nativa en Apple: integrable en apps de iOS, visionOS y macOS mediante Core ML.
- Bucle de difusion configurable: el numero de pasos de denoising puede ajustarse para equilibrar velocidad y calidad de reconstruccion.

## Casos de uso

- Monitorizacion EEG portatil en tiempo real: una app de iPhone puede capturar datos de un dispositivo de 14 canales (como Emotiv EPOC X) y usar el modelo para limpiar la senal y rellenar canales caidos, ofreciendo una salida continua y estable al usuario.
- Investigacion en interfaz cerebro-ordenador (BCI): los investigadores pueden desplegar el modelo en un MacBook o Vision Pro para preprocesar senales EEG y extraer caracteristicas limpias antes de pasarlas a clasificadores de intencion motora o atencion.
- Reconstruccion de montajes incompletos en estudios clinicos: cuando un electrodo se desprende durante una sesion de registro, el modelo puede reconstruir la senal perdida a partir de los canales restantes, evitando descartar el ensayo completo.
- Superresolucion espacial para neuroimagen funcional: a partir de un montaje de baja densidad (por ejemplo, 14 canales), el modelo puede estimar senales en posiciones intermedias, permitiendo mapas topograficos de mayor resolucion sin aumentar el numero de electrodos fisicos.
- Desarrollo de aplicaciones de neurofeedback: integrando el modelo en una app de macOS o visionOS, los usuarios pueden obtener una senal EEG denoizada en tiempo real para entrenamiento de autorregulacion cerebral.
- Validacion de algoritmos de preprocesado EEG: los investigadores pueden usar el modelo como referencia de reconstruccion para comparar tecnicas clasicas de interpolacion de canales (spline, promedio) frente a un enfoque basado en aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como MMLU, HumanEval o GSM8K) porque este modelo no es un modelo de lenguaje, sino un autoencoder de difusion para senales EEG. La informacion disponible incluye una validacion de paridad numerica entre la conversion Core ML y los pesos PyTorch originales, realizada con 20 pasos de difusion:

| Metrica | Valor (perfil 14ch-fp32) | Umbral | Resultado |
|---|---|---|---|
| MAE | 0.000003 | - | - |
| RMSE | 0.000005 | - | - |
| max_abs | 0.000060 | - | - |
| rel_l2 | 0.000006 | 0.005 | PASS |

Esta tabla confirma que la conversion Core ML reproduce fielmente el comportamiento del modelo original, pero no proporciona informacion sobre la calidad de reconstruccion en tareas EEG especificas (por ejemplo, comparacion con otros metodos de interpolacion). Para ello habria que consultar el paper tecnico de ZUNA, cuyos datos no estan incluidos en la informacion facilitada.

## Requisitos de hardware

- Dispositivos compatibles: cualquier dispositivo Apple con soporte Core ML (iPhone, iPad, Mac con Apple Silicon, Apple Vision Pro).
- Tamano del paquete: el repositorio pesa 1,5 GB, correspondiente al perfil fp32 de 14 canales.
- Memoria: al ser un modelo de 380M parametros en fp32, el consumo de RAM en inferencia se estima en torno a 1,5-2 GB, lo que cabe en dispositivos con 4 GB o mas de RAM unificada (iPhone 12 o posterior, Macs con M1 o superior).
- GPU: no requiere GPU dedicada; Core ML utiliza la Neural Engine de Apple o la GPU integrada segun disponibilidad.
- Opciones de despliegue: integracion directa en apps Xcode mediante Core ML; no es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: dependen fuertemente del numero de pasos de difusion. Con 20 pasos (el valor de validacion), la latencia en un iPhone moderno se estima en el orden de cientos de milisegundos por ventana de 30 segundos, aunque no se proporcionan mediciones exactas. Reducir los pasos de difusion acelera la inferencia a costa de calidad de reconstruccion.

## Comparativa con modelos similares

No hay suficientes datos publicos para una comparativa cuantitativa con otros modelos de EEG de tamano similar. La informacion disponible permite comparar cualitativamente ZUNA1.1 con su predecesor ZUNA1:

| Modelo | Parametros | Ventana de entrada | Flexibilidad | Licencia |
|---|---|---|---|---|
| ZUNA1 (Zyphra) | ~380M | Fija de 5 segundos | Limitada a ventanas fijas | Apache-2.0 |
| ZUNA1.1 (Zyphra) | ~380M | Variable de 0,5 a 30 segundos | Enmascaramiento variable, reconstruccion por segmentos | Apache-2.0 |
| ZUNA1.1-CoreML-Apple-30s (oraculumai) | ~380M (fp32) | Fija de 30 segundos (perfil publicado) | Perfil fijo de 14 canales, solo fp32 | Apache-2.0 |

La conversion Core ML sacrifica la flexibilidad de longitudes variables del modelo base (se fija a 30 segundos) a cambio de una integracion nativa en el ecosistema Apple. No se dispone de datos de otros modelos de EEG comparables (como EEGNet o Braindecode) en terminos de parametros y rendimiento.

## Limitaciones y advertencias

- No validado para uso medico: el modelo no esta aprobado para diagnostico, tratamiento ni toma de decisiones clinicas. Solo para investigacion e ingenieria.
- Perfil unico: solo se publica el perfil de 14 canales en fp32. No hay versiones para otros montajes ni cuantizaciones de menor precision.
- Sin soporte fp16: el decoder del modelo base supera el rango de representacion de fp16 (max 65504), por lo que las conversiones fp16 fallan en la validacion de paridad y no se publican.
- Dependencia de los pasos de difusion: la calidad de reconstruccion y la latencia dependen del numero de pasos; no se proporcionan curvas de rendimiento para distintos valores.
- Requisitos de preprocesado: el modelo asume una frecuencia de muestreo de 256 Hz, posiciones 3D de electrodos, normalizacion con `data_norm=10.0` y ventanas de 30 segundos. Desviarse de estos parametros degrada el rendimiento.
- Idioma de la documentacion: toda la documentacion y los metadatos estan en ingles; no hay soporte multilingue.
- Riesgo de alucinacion: al ser un modelo generativo, las reconstrucciones en canales o posiciones muy alejadas de los datos observados pueden ser plausibles pero incorrectas. Verificar siempre con datos reales.
- Sesgos: el modelo fue entrenado con un corpus publico armonizado; puede tener sesgos hacia ciertos tipos de montajes o poblaciones, aunque no se detallan en la informacion disponible.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/oraculumai/ZUNA1.1-CoreML-Apple-30s
- Modelo base ZUNA1.1: https://huggingface.co/Zyphra/ZUNA1.1
- Repositorio oficial de ZUNA en GitHub: https://github.com/Zyphra/zuna
- Pagina del paper tecnico: https://www.zyphra.com/zuna-technical-paper
- Paper: *ZUNA: Flexible EEG Superresolution with Position-Aware Diffusion Autoencoders* (enlace no proporcionado directamente, disponible en la pagina tecnica)
