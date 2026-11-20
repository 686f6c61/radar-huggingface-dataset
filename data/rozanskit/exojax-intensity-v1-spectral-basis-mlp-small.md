# RozanskiT/exojax-intensity-v1-spectral-basis-mlp-small

## Resumen

El modelo `RozanskiT/exojax-intensity-v1-spectral-basis-mlp-small` es un emulador neuronal de intensidad específica atmosférica desarrollado por RozanskiT dentro del ecosistema ExoJAX y la librería `astro-emulators-toolkit`. Su función es predecir la intensidad específica absoluta y dependiente del ángulo de visión a partir de una rejilla atmosférica de ExoJAX PayneTraining v1, sustituyendo simulaciones radiativas completas por una inferencia neuronal en JAX. No es un modelo de lenguaje: es un emulador científico de espectroscopía de exoplanetas.

La arquitectura es una MLP pequeña de cuatro capas ocultas de 192 unidades con activación SiLU que mapea ocho parámetros físicos normalizados a 64 coeficientes de una base espectral aprendida (64 × 18.000) más un espectro medio aprendido. El conjunto tiene 1.295.248 parámetros entrenables y opera en float64 sobre longitudes de onda en vacío dentro de cuatro intervalos del detector de banda K. El checkpoint publicado es el final de 1.000.000 pasos de SOAP (v0.1.0).

Su relevancia radica en que permite acelerar recuperaciones atmosféricas (retrievals) al ofrecer gradientes exactos vía `jax.value_and_grad` sobre una función de verosimilitud incluida, con un error relativo absoluto de intensidad en el percentil 95 del 1,879 % sobre 10.000 espectros retenidos y las 18.000 longitudes de onda nativas. Es la variante pequeña de una familia que incluye una versión media y una MHE-MLP con la misma firma de llamada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con base espectral aprendida (spectral basis MLP) sobre JAX |
| Parametros totales | 1.295.248 entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada de 8 parámetros físicos y vector de longitudes de onda de 18.000 puntos nativos |
| Tipos de cuantizacion | No disponible (pesos en float64 para JAX; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | Bundle de `astro-emulators-toolkit` con archivos Python auxiliares; formato de pesos específico no detallado |

## Arquitectura y entrenamiento

La red es una MLP de cuatro capas ocultas de 192 unidades con activación SiLU que transforma ocho etiquetas atmosféricas normalizadas (min-max) en 64 coeficientes. El decodificador combina esos coeficientes con una base espectral aprendida de 64 × 18.000 y suma un espectro medio aprendido. La salida es `log10_intensity` normalizada, que el helper revierte y exponencia para obtener intensidad física en erg s⁻¹ cm⁻² sr⁻¹ (cm⁻¹)⁻¹. La interpolación de longitudes de onda se hace lineal sobre intensidades físicas entre nudos equidistantes en log₁₀ de longitud de onda (4.500 nudos por chip).

Los datos de entrenamiento provienen de la rejilla privada ExoJAX PayneTraining v1, con 100.000 espectros simulados, un ángulo de visión muestreado por atmósfera y gravedad fija log g = 4,86 (cgs). Las simulaciones usan 101 capas de presión, opacidades de CO, H₂O, CH₄ y HF, absorción inducida por colisiones H₂–H₂ y H₂–He, y la prescripción de nube gris v1. El modelo se inicializó a partir del modelo medio proyectado sobre 64 modos con 87.952 atmósferas de entrenamiento, y la red de coeficientes se inicializó con 16.384 ejemplos. El entrenamiento usó SOAP con 256 atmósferas por actualización y bloques de 500 longitudes de onda nativas; cuatro ensayos de 30.000 pasos compartieron inicialización y lotes, con tasa de aprendizaje máxima de 0,001.

## Capacidades

- Predicción de intensidad específica absoluta y dependiente del ángulo de visión (μ) para espectroscopía de exoplanetas en banda K.
- Evaluación diferenciable en JAX: soporta `jax.value_and_grad` sobre la log-verosimilitud incluida para retrievals.
- Entrada por lotes: acepta vector `(8,)` o lote `(B, 8)` junto con una rejilla de longitudes de onda compartida `(Q,)`.
- Manejo de desplazamiento Doppler pasando longitudes de onda en reposo desplazadas al mismo predictor.
- Interpolación dentro de chip con nudos en log₁₀ de longitud de onda y salida NaN fuera de los chips o en huecos.
- Ejecución en float64 con `JAX_ENABLE_X64=1` para precisión científica.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Recuperación atmosférica de exoplanetas: el modelo se integra como sustituto del forward model radiativo en cadenas de muestreo (MCMC, nested sampling) usando los gradientes exactos de `make_log_likelihood`, reduciendo el coste por evaluación frente a ExoJAX completo.
- Ajuste de espectros de banda K: con los cuatro chips documentados (≈22.866–23.459 Å) se puede modelar la intensidad observada tras aplicar Doppler, integración de disco y respuesta instrumental en el modelo de observación.
- Exploración de parámetros atmosféricos: variando T₀ (1000–1700 K), α (0,05–0,20), mezclas de CO/H₂O/CH₄/HF y presión de nube para estudiar degeneraciones espectrales.
- Generación de espectros sintéticos para validación de pipelines: `predict.py --output spectrum.npz` guarda rejilla, parámetros y espectro para pruebas de software de reducción.
- Análisis de dependencia angular: el parámetro μ permite evaluar la variación de intensidad con el ángulo de visión en modelos de disco estelar/planetario.
- Docencia y prototipado: `midpoint.py` evalúa 2.500 longitudes de onda por chip con vista opcional en Matplotlib para inspeccionar temperatura y ángulo de visión.
- Sustitución directa del modelo MHE: al compartir firma de llamada, orden de parámetros y unidades, se puede intercambiar en retrievals existentes apuntando el cargador del bundle a este directorio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Error relativo absoluto de intensidad, percentil 95 (10.000 espectros retenidos, 18.000 longitudes de onda) | 1,879 % |
| Error relativo absoluto de intensidad, percentil 95 (9.555 espectros con μ > 0,05) | 1,748 % |
| RMSE de validación en 2.048 espectros de diseño (512 longitudes de onda) | No disponible el valor numérico (solo se indica que la tasa 0,001 dio el menor RMSE elegible) |

No se han publicado resultados de benchmarks comparativos con otros emuladores en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; con 1,3 M de parámetros en float64 el modelo es muy ligero, pero el cuello de botella es la base espectral 64 × 18.000 y las rejillas de longitud de onda.
- GPU recomendadas: cualquier GPU compatible con JAX (CUDA o ROCm); no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; no se documentan requisitos mínimos.
- Opciones de despliegue: JAX con `astro-emulators-toolkit` (`Emulator.from_bundle`), `hf download` con revisión `v0.1.0`, scripts `midpoint.py`, `likelihood.py` y `predict.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exojax-intensity-v1-spectral-basis-mlp-small (este) | 1.295.248 | 8 parámetros + 18.000 longitudes de onda | P95 error 1,879 % | MIT | Hugging Face, revisión v0.1.0 |
| exojax-intensity-v1-spectral-basis-mlp-medium | No disponible | Misma firma de llamada | No disponible | MIT (presumible por familia) | Hugging Face, revisión v0.1.0 |
| exojax-intensity-v1-mhe-mlp-small | No disponible | Misma firma de llamada | No disponible | MIT (presumible por familia) | Hugging Face, revisión v0.1.0 |

No se dispone de datos de benchmarks ni de parámetros de las variantes media y MHE en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: solo válido para T₀ 1000–1700 K, α 0,05–0,20, mezclas de CO/H₂O/CH₄ entre −6 y −1, HF entre −10 y −5, presión de nube entre −3 y 5 y 0 < μ ≤ 1; fuera de rango no hay garantía.
- Gravedad fija log g = 4,86 (cgs); no se puede variar en la inferencia.
- Solo cubre cuatro intervalos de banda K (≈22.866–23.459 Å); consultas en huecos o fuera devuelven NaN.
- La derivada respecto a longitud de onda es por tramos y puede saltar en los nudos, lo que afecta a optimizaciones que usen gradientes espectrales.
- Precisión limitada: error P95 de ~1,9 %; no apto para análisis que requieran precisión por debajo de ese umbral sin corrección.
- Riesgo de extrapolación silenciosa si se normalizan etiquetas fuera del rango min-max registrado.
- No es un modelo de lenguaje: no tiene sesgos lingüísticos ni alucinación textual, pero sí puede producir predicciones físicamente no realistas fuera de su dominio de entrenamiento.
- Licencia MIT permite uso comercial, pero conviene citar el modelo y verificar la licencia de los datos PayneTraining v1 (privados) para redistribución.
- Repositorio de 0,0 GB y 0 descargas/likes: ecosistema muy incipiente; el soporte de la comunidad es mínimo.

## Enlaces

- Hugging Face: https://huggingface.co/RozanskiT/exojax-intensity-v1-spectral-basis-mlp-small
- Modelo medio v0.1.0: https://huggingface.co/RozanskiT/exojax-intensity-v1-spectral-basis-mlp-medium/tree/v0.1.0
- Modelo MHE-MLP small v0.1.0: https://huggingface.co/RozanskiT/exojax-intensity-v1-mhe-mlp-small/tree/v0.1.0
