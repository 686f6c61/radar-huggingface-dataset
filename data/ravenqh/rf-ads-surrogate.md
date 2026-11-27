# Ravenqh/rf-ads-surrogate

## Resumen

RF ADS Surrogate es una coleccion de checkpoints de PyTorch que implementan modelos subrogados (surrogate models) para el diseno de circuitos de radiofrecuencia y microondas. Lo desarrolla el autor independiente Ravenqh y resuelve un problema muy concreto de ingenieria: sustituir simulaciones electromagneticas y de balance armonico (ADS Momentum, ADS HB) por redes neuronales que predicen parametros S y metricas de amplificadores de potencia en una fraccion del coste computacional. Los pesos se publican bajo licencia Apache 2.0 y el codigo fuente esta en un repositorio de GitHub separado.

No es un modelo de lenguaje ni un transformer generativo: son redes especificas de dominio (encoders residuales, cabezas racionales con polos compartidos y ensembles de MLP) entrenadas sobre datos simulados de mascaras de cobre de 8x8 pixeles sobre sustrato RO4350B, con grilla de prediccion de 0,5 a 12 GHz. El repositorio ocupa unos 0,3 GB e incluye tanto modelos pasivos (parametros S) como modelos activos (potencia entregada, potencia DC, PAE) para una topologia de amplificador concreta.

Su relevancia es practica y acotada: permite cribar rapidamente geometrias y condiciones de polarizacion antes de lanzar simulaciones completas, siempre que el usuario respete exactamente la geometria, el stack-up, los puertos y los circuitos de estabilizacion para los que fue entrenado. Es una herramienta de aceleracion de flujo de diseno, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales especificas de dominio: encoder residual con cabeza racional de polos compartidos (variante TopoRing), ensembles de MLP residuales para el nucleo activo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia de texto) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en coma flotante) |
| Idiomas soportados | en (documentacion y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints PyTorch `.pt` (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

Los modelos pasivos se entrenaron sobre datos simulados de ADS Momentum para mascaras de cobre de 8x8 sobre RO4350B nominal de 20 mil (permitividad relativa 3,66), con pixeles de cobre de 1,80 mm, paso de 1,72 mm y una extension de parche de 13,84 mm excluyendo las alimentaciones. Se aplica aumento de datos basado en las simetrias del layout con conciencia de puertos. La variante TopoRing incorpora caracteristicas topologicas de regiones cerradas y caminos conductivos, un encoder residual y una cabeza racional con polos compartidos y un residuo aprendido. La calibracion de perdida anade terminos de ganancia, eficiencia y reflexion compleja post-polarizacion al objetivo de parametros S.

La salida pasiva tiene forma `(batch, 80, 6)` con canales `Re(S11), Im(S11), Re(S21), Im(S21), Re(S22), Im(S22)` sobre una grilla uniforme de 0,5 a 12 GHz; al ser el bipuerto reciproco, S12 se reconstruye a partir de S21. La agregacion del ensemble combina una media compleja de fase y una magnitud RMS, con una proyeccion de pasividad que controla los valores singulares de las muestras discretas del bipuerto.

Los ensembles de MLP residuales del nucleo activo se entrenaron con etiquetas de simulacion source/load-pull en balance armonico para un dispositivo CG2H40010F concreto y su red de estabilizacion. Las entradas incluyen frecuencia, potencia disponible de entrada, reflexion de fuente en fundamental y segundo armonico, y reflexion de carga en los tres primeros armonicos. Las salidas son potencia entregada, potencia DC, potencia neta de entrada y reflexion compleja de entrada. La cascada de circuito proyecta las predicciones del nucleo activo sobre las metricas de los puertos externos, y PAE_avs usa la potencia disponible del generador en la entrada del sistema cuando se evalua el PA completo.

## Capacidades

- Prediccion de parametros S complejos de bipuertos pasivos (S11, S21, S22, con S12 reconstruido) en la banda de 0,5 a 12 GHz.
- Modelado de mascaras de cobre de 8x8 pixeles sobre stack-up RO4350B con simetrias de layout.
- Prediccion de metricas de amplificador de potencia: potencia entregada, potencia DC, potencia neta de entrada, reflexion compleja de entrada y PAE_avs.
- Modelado de load-pull y source-pull multifrecuencia (fundamental y armonicos 2 y 3) para el dispositivo CG2H40010F.
- Ensemble de miembros con diversidad arquitectonica y calibracion de perdida para el modelo pasivo de banda estrecha.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo generativo de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Cribado de geometrias de parche: generar rapidamente el `.s2p` de una mascara candidata con `predict_em.py` para descartar geometrias antes de lanzar una simulacion completa en ADS Momentum, reduciendo el numero de simulaciones electromagneticas costosas.
- Optimizacion de circuitos de estabilizacion: evaluar el nucleo activo con distintas redes de estabilizacion de banda ancha (checkpoint `full_pa_uwb_0p5_4g_surrogate.pt`) para estimar PAE y Pout sin ejecutar balance armonico completo en cada iteracion.
- Exploracion de load-pull: barrer reflexiones de carga en los tres primeros armonicos con el MLP residual para localizar regiones de impedancia prometedoras antes de la verificacion con HB.
- Estimacion de PAE en el sistema completo: usar la cascada de circuito con PAE_avs referida a la potencia disponible del generador para comparar variantes de diseno de un PA a nivel de sistema.
- Generacion de datasets sinteticos de entrenamiento: emplear el subrogado como generador de etiquetas aproximadas para preentrenar o aumentar modelos propios en la misma banda y stack-up.
- Integracion en pipelines de diseno automatizado: cargar los checkpoints en un script de Python (CPU o CUDA) para incorporar la evaluacion de metricas RF dentro de bucles de optimizacion bayesiana o algoritmos geneticos.
- Verificacion de coherencia de layout: comparar la prediccion del ensemble pasivo con la simulacion electromagnetica para detectar discrepancias antes de fabricar.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| MAE de parametros S complejos, pasivo UWB, 60 mascaras retenidas (0,5-4 GHz) | 0,0336 |
| MAE de parametros S complejos, pasivo UWB (3-4 GHz) | 0,0699 |
| MAE de PAE_avs, nucleo activo UWB (1.597 puntos HB retenidos) | 0,3103 puntos porcentuales |
| MAE de potencia entregada, nucleo activo UWB | 0,0479 dB |
| MAE de PAE_avs, PA completo extremo a extremo frente a Momentum + ADS HB (un diseno, 15 frecuencias) | 1,674 puntos porcentuales |
| MAE de Pout, PA completo extremo a extremo | 0,195 dB |

No se han publicado comparaciones con otros modelos subrogados en la informacion disponible. Todas las referencias de evaluacion son simuladas, no medidas en hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,3 GB, por lo que los checkpoints individuales son ligeros y previsiblemente caben en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el autor proporciona script de inferencia para CPU y CUDA, por lo que una CPU es suficiente para inferencia puntual.
- Cabe en GPU consumer: si, dado el tamano del repositorio (0,3 GB), aunque no se detalla el reparto por checkpoint.
- Opciones de despliegue: solo PyTorch con las clases de modelo del repositorio fuente; no hay soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RF ADS Surrogate | Subrogado RF/microondas | no disponible | no aplica | MAE S 0,0336 (0,5-4 GHz) | Apache 2.0 | Hugging Face + GitHub |
| Alternativas de subrogado EM comerciales (p. ej. modelos de Ansys, Cadence) | Subrogado EM | no disponible | no aplica | no disponible | Propietaria | Comercial |
| Modelos subrogados academicos de parametros S | Redes neuronales | no disponible | no aplica | no disponible | Variable | Publicaciones |

No se dispone de datos comparativos verificables con modelos equivalentes en la informacion proporcionada. Las alternativas comerciales y academicas existen, pero sus metricas no son directamente comparables sin una evaluacion sobre el mismo conjunto de mascaras y stack-up.

## Limitaciones y advertencias

- Los checkpoints estan ligados a su geometria, stack-up, definicion de puertos, polarizacion y circuitos de estabilizacion; cualquier desviacion invalida las predicciones.
- Las predicciones de armonicos de orden superior y los layouts no vistos requieren validacion independiente.
- La proyeccion de pasividad solo controla los valores singulares de las muestras discretas del bipuerto; la causalidad de banda ancha y el comportamiento en hardware requieren sus propias comprobaciones.
- Todas las etiquetas y referencias de benchmark son simuladas; no hay validacion frente a medidas de laboratorio.
- El nucleo activo esta entrenado para un unico dispositivo (CG2H40010F) y su red de estabilizacion, no es transferible a otros transistores sin reentrenamiento.
- El modelo pasivo principal cubre 0,5-4 GHz para cribado; la grilla de salida llega a 12 GHz, pero el error crece en el extremo alto de la banda (MAE 0,0699 en 3-4 GHz).
- Riesgo de extrapolacion silenciosa: fuera del dominio de entrenamiento el modelo puede devolver valores plausibles pero incorrectos sin aviso.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantia de exactitud ni soporte del autor.
- Documentacion y model card solo en ingles; no hay version en castellano.
- No es un modelo de lenguaje: no debe evaluarse con criterios de MMLU, HumanEval o GSM8K.

## Enlaces

- Hugging Face: https://huggingface.co/Ravenqh/rf-ads-surrogate
- Codigo fuente y guia de usuario: https://github.com/Raven49963/rf-ads-surrogate
