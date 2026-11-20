# RozanskiT/exojax-intensity-v1-spectral-basis-mlp-medium

## Resumen

El modelo `RozanskiT/exojax-intensity-v1-spectral-basis-mlp-medium` es un emulador neuronal de intensidad específica atmosférica desarrollado por RozanskiT para el ecosistema ExoJAX, una librería de espectroscopía de exoplanetas escrita en JAX. Su función es sustituir las simulaciones físicas costosas del código radiativo de ExoJAX por una aproximación neuronal rápida y diferenciable, manteniendo la misma firma de llamada y unidades físicas que el modelo hermano MHE-MLP small. Predice intensidad específica absoluta y dependiente del ángulo de visión a partir de ocho parámetros físicos y longitudes de onda en vacío en cuatro intervalos del detector de banda K.

Técnicamente se trata de un MLP de base espectral: cuatro capas ocultas de 256 unidades con activación SiLU proyectan los ocho parámetros de entrada a 128 coeficientes que se combinan con una base aprendida de 128 × 18.000 y un espectro medio también aprendido. El modelo tiene 2.554.576 parámetros y se distribuye como checkpoint final de un entrenamiento de 1.000.000 de pasos SOAP sobre la rejilla PayneTraining v1 de ExoJAX. La precisión reportada es notable para su tamaño: error relativo absoluto de intensidad en el percentil 95 del 0,884% sobre 10.000 espectros retenidos y las 18.000 longitudes de onda nativas.

Su relevancia es práctica para la comunidad de atmósferas exoplanetarias: permite acelerar la inferencia de parámetros (retrievals) al ofrecer gradientes exactos vía JAX con `jax.value_and_grad`, y su licencia MIT facilita la integración en pipelines científicos y publicaciones. Está pensado para investigadores que ya trabajan con ExoJAX o con el toolkit `astro-emulators-toolkit`, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP de base espectral (spectral basis MLP) sobre JAX; 4 capas ocultas de 256 unidades SiLU + decodificador lineal con base aprendida 128 × 18.000 y espectro medio |
| Parámetros totales | 2.554.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 8 parámetros físicos + vector de longitudes de onda de 18.000 puntos nativos) |
| Tipos de cuantización | no disponible (entrenamiento e inferencia en float64, `JAX_ENABLE_X64=1`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | bundle propio de `astro-emulators-toolkit` (checkpoint JAX + ficheros Python auxiliares); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La red es un MLP con cuatro capas ocultas de 256 unidades y activación SiLU que mapea los ocho parámetros físicos (normalizados min-max) a 128 coeficientes espectrales. El decodificador combina esos coeficientes con una base aprendida de 128 × 18.000 y suma un espectro medio aprendido. La base se inicializó a partir de un PCA de los datos de entrenamiento y, tras la regresión de coeficientes, el MLP, la base y la media se entrenaron conjuntamente contra log₁₀ de la intensidad. La salida del modelo es log₁₀ de intensidad normalizada; el helper invierte el escalado y exponencia para obtener intensidad física en erg s⁻¹ cm⁻² sr⁻¹ (cm⁻¹)⁻¹.

Los datos provienen de la rejilla privada ExoJAX PayneTraining v1: 100.000 espectros simulados con un ángulo de visión muestreado por atmósfera, gravedad fija log g = 4,86 (cgs), rejilla de presión de 101 capas, opacidades de CO, H₂O, CH₄ y HF, absorción inducida por colisiones H₂–H₂ y H₂–He y la prescripción de nube gris v1. El entrenamiento final continuó un checkpoint previo durante 1.000.000 de actualizaciones SOAP con 87.952 atmósferas de entrenamiento, lotes de 256 y un bloque de 500 píxeles por actualización. Un escaneo de 30.000 pasos seleccionó una tasa de aprendizaje máxima de 0,001; la ejecución larga usó un pico de 0,00017320508 con calentamiento lineal de 100.000 pasos y decaimiento coseno hasta cero. El conjunto de validación separado consta de 2.048 atmósferas y 512 longitudes de onda.

## Capacidades

- Predicción de intensidad específica absoluta y dependiente del ángulo de visión (μ) para atmósferas exoplanetarias en banda K.
- Evaluación diferenciable: soporta `jax.value_and_grad` y `jax.jit` para obtener gradientes exactos respecto a los ocho parámetros físicos, apto para inferencia bayesiana y retrievals.
- Interpolación en longitud de onda dentro de cada chip: 4.500 nudos equiespaciados en log₁₀ de longitud de onda por chip, con interpolación lineal sobre intensidades físicas entre nudos adyacentes.
- Soporte de desplazamiento Doppler pasando longitudes de onda en reposo desplazadas al mismo predictor.
- Manejo de lotes: acepta un vector de parámetros `(8,)` o un lote `(B, 8)` con un vector de longitudes de onda compartido `(Q,)`, devolviendo salida `(B, Q)` en float64.
- Modelo de verosimilitud incluido (`likelihood.py`) que acepta intensidades medidas y incertidumbres positivas en las mismas unidades físicas.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un emulador científico de dominio específico.

## Casos de uso

- Retrieval de parámetros atmosféricos de exoplanetas: el modelo sustituye las llamadas a ExoJAX en el muestreador, y su diferenciabilidad vía JAX permite usar HMC o NUTS con gradientes exactos sobre los ocho parámetros físicos, reduciendo el coste computacional de cada paso.
- Ajuste de espectros de banda K de tránsito o eclipse: con las cuatro ventanas de detector definidas (aproximadamente 22.866–23.459 Å), el emulador genera el espectro modelo para comparar con observaciones de espectrógrafos de alta resolución.
- Análisis de sensibilidad y estudios de degeneración de parámetros: la evaluación rápida de lotes `(B, 8)` permite barrer rejillas de temperatura, cocientes de mezcla o presión de nube y estudiar cómo afectan a la intensidad emergente.
- Generación de espectros sintéticos para planificación de observaciones: `predict.py --output spectrum.npz` guarda rejilla de longitudes de onda, parámetros y espectro, útil para simular la señal esperada antes de proponer tiempo de telescopio.
- Validación cruzada de códigos radiativos: al ser un emulador entrenado sobre ExoJAX, sirve como referencia rápida para detectar discrepancias en implementaciones propias de transferencia radiativa.
- Docencia y divulgación: `midpoint.py` con la opción `--plot` permite variar temperatura y ángulo de visión y visualizar el efecto sobre el espectro, adecuado para demostraciones interactivas.
- Integración en pipelines de inferencia de población: al compartir firma con el release MHE-MLP small, se puede intercambiar el bundle sin cambiar el código de llamada, facilitando comparativas de precisión y coste entre emuladores.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Error relativo absoluto de intensidad, percentil 95 (10.000 espectros retenidos, 18.000 longitudes de onda) | 0,884% |
| Error relativo absoluto de intensidad, percentil 95 (9.555 espectros con μ > 0,05) | 0,796% |
| Parámetros del modelo | 2.554.576 |
| Pasos de entrenamiento | 1.000.000 (SOAP) |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; con 2,55 M de parámetros en float64 el peso de los parámetros es del orden de decenas de MB, pero la base aprendida de 128 × 18.000 y el espectro medio añaden varios MB adicionales, y el coste real depende del tamaño de lote y del vector de longitudes de onda consultado.
- GPU recomendadas: no disponible; al ejecutarse sobre JAX, cualquier GPU compatible con JAX (NVIDIA con CUDA, AMD con ROCm) o incluso CPU puede servir, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí por el reducido número de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: runtime propio `astro-emulators-toolkit` con `Emulator.from_bundle`, más JAX con `JAX_ENABLE_X64=1`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Error reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exojax-intensity-v1-spectral-basis-mlp-medium (este) | 2.554.576 | 8 parámetros físicos + longitudes de onda en 4 chips de banda K | p95 0,884% (global), 0,796% (μ > 0,05) | MIT | Hugging Face, release v0.1.0 |
| exojax-intensity-v1-mhe-mlp-small | no disponible | misma firma de llamada y orden de parámetros | no disponible | no disponible | Hugging Face, release v0.1.0 |
| Emulador físico ExoJAX (código radiativo original) | no aplica (código numérico) | rejilla atmosférica completa | exacto por definición | según ExoJAX | repositorio ExoJAX |

La comparativa se limita a las alternativas mencionadas en la información disponible; no se han identificado otros emuladores de intensidad específica comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Dominio restringido: solo válido para los rangos de parámetros declarados (T₀ 1000–1700 K, α 0,05–0,20, log₁₀ de cocientes de mezcla de CO/H₂O/CH₄ entre −6 y −1, HF entre −10 y −5, log₁₀ de presión de nube entre −3 y 5, μ en (0, 1]); fuera de ellos no hay garantía de precisión.
- Cobertura espectral limitada a cuatro chips de banda K (aproximadamente 22.866–23.459 Å); las consultas en huecos o fuera de los chips devuelven NaN.
- Gravedad fija log g = 4,86 (cgs): no es un parámetro de entrada, por lo que el modelo no generaliza a otras gravedades.
- Precisión finita: error p95 de 0,884% implica que en retrievals de alta precisión puede introducir sesgo sistemático; conviene validar contra el código radiativo en el régimen de interés.
- Derivadas piecewise en longitud de onda que pueden saltar en los nudos, lo que puede afectar a optimizaciones que usen gradientes respecto a la longitud de onda.
- Para desplazamientos Doppler hay que recortar los bordes del detector para mantener las consultas dentro de un chip en todo el rango de velocidades permitido.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de extrapolación silenciosa fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial y modificación con atribución; no obstante, los datos de simulación y tablas de opacidad se distribuyen por separado y pueden tener condiciones propias.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es 0,0 GB, lo que sugiere que los pesos pueden no estar materializados en el snapshot o que la métrica no refleja el bundle completo; conviene verificar la integridad del release v0.1.0 antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RozanskiT/exojax-intensity-v1-spectral-basis-mlp-medium
- Release v0.1.0 del modelo: https://huggingface.co/RozanskiT/exojax-intensity-v1-spectral-basis-mlp-medium/tree/v0.1.0
- Modelo hermano MHE-MLP small: https://huggingface.co/RozanskiT/exojax-intensity-v1-mhe-mlp-small/tree/v0.1.0
- ExoJAX (librería de referencia): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio del toolkit `astro-emulators-toolkit`: no disponible en la información proporcionada
