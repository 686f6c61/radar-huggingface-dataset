# maxgfr/s6-cast2-pico

## Resumen

s6-cast2-pico es un modelo de predicción de series temporales probabilística, desarrollado por maxgfr dentro del proyecto skycmd, escrito íntegramente en Rust y distribuido en formato GGUF. Se trata de la segunda versión de la línea s6-cast, que parte del codificador de s6-cast-pico y le añade un front end de periodicidad: un detector de periodos de cero parámetros (procedente de TinyCast) que alimenta las fases seno y coseno de hasta 4 periodos detectados en cada parche de entrada, junto con un borrador estacional en espacio de valores proyectado en las consultas del decodificador.

El modelo es extremadamente compacto: 377.568 parámetros según la model card (el dato de safetensors indica 106.272, discrepancia no aclarada en la información disponible) y 148.512 bytes en pesos ternarios. Dada una ventana de hasta 2.048 puntos pasados, devuelve nueve cuantiles (los deciles) para cada uno de los próximos 64 pasos, y horizontes mayores mediante rollout con salida tras cada bucle.

Su relevancia es fundamentalmente metodológica y no práctica: el autor publica el modelo como resultado negativo, ya que falló su puerta pre-registrada G1 en GIFT-Eval (nGMASE 0.8847 frente al umbral ≤ 0.838 y nWQL 0.6190 frente a ≤ 0.587). La model card es explícita: "publicado como resultado, no para uso". Por su pre-registro, la línea s6-cast se detiene aquí y el predictor que el proyecto ofrece es el port de TinyCast.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer codificador-decodificador con front end de periodicidad (detector de periodos de cero parámetros, proyección de fases seno/coseno y borrador estacional en espacio de valores) |
| Parámetros totales | 377.568 según model card; 106.272 según safetensors (dato no coincidente en la información disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 puntos pasados de entrada; horizonte de 64 pasos por salida, extensible por rollout |
| Tipos de cuantización | pesos ternarios (148.512 bytes); no se detallan otros formatos |
| Idiomas soportados | no disponible (modelo de series temporales, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer codificador-decodificador de pequeña escala con un front end de periodicidad añadido respecto a la versión 1. Sobre cada contexto de entrada se ejecuta el detector de periodos de cero parámetros de TinyCast; las fases seno y coseno de hasta 4 periodos detectados se incorporan a cada parche de entrada. Además, un borrador estacional en espacio de valores del futuro (el valor de un periodo antes y la media de puntos pasados en la misma fase) se proyecta en cada consulta del decodificador. La salida es probabilística: nueve cuantiles (deciles) por paso, para 64 pasos por defecto y horizontes mayores por rollout con salida tras cada bucle.

El entrenamiento se realizó sobre datos en las bandas de frecuencia que evalúa GIFT-Eval (series USCRN de 5 minutos), con 720 minutos de entrenamiento efectivo frente a los 480 de la versión 1. No se especifica en la información disponible el número total de tokens, la composición completa del dataset ni si se emplearon RLHF o DPO. La model card declara una divulgación relevante: v2 se diseñó tras leer los resultados de GIFT-Eval de v1 configuración por configuración, de modo que GIFT-Eval es parcialmente in-sample para las decisiones de diseño de v2 (aunque no para sus pesos, ya que ninguna serie de GIFT-Eval se usa en entrenamiento). El autor señala que los autores de TinyCast hacen la misma divulgación y consideran Chronos-ZS como test más limpio.

## Capacidades

- Predicción probabilística de series temporales: devuelve nueve cuantiles (deciles) por paso para los próximos 64 pasos.
- Predicción multi-horizonte mediante rollout iterativo, con salida tras cada bucle.
- Detección automática de periodicidad: hasta 4 periodos por contexto, sin parámetros adicionales.
- Modelado de estacionalidad explícita mediante fases seno/coseno y borrador estacional en espacio de valores.
- Manejo de contextos de hasta 2.048 puntos; las ventanas sin observación en ese rango se prediccen por el naive estacional (2.017 ventanas en 12 configuraciones en la evaluación).
- Ejecución en Rust y despliegue WASM (demo en navegador).
- No dispone de tool calling, capacidades de agente, visión, audio ni generación de texto: es exclusivamente un predictor de series temporales.

## Casos de uso

- Evaluación comparativa de predictores de series temporales: el modelo sirve como punto de referencia reproducible en GIFT-Eval (97 configuraciones, 371.330 ventanas, protocolo oficial con gluonts `evaluate_model`), útil para contrastar metodologías de front end de periodicidad frente a TinyCast o al naive estacional.
- Predicción de demanda energética a corto plazo: aunque su rendimiento en el dominio Energy es peor que el naive estacional (MASE 1.003 frente a 1.000), puede emplearse en experimentos controlados para estudiar el efecto de la estacionalidad detectada automáticamente en series de 5 minutos.
- Investigación sobre cuantización ternaria extrema: con 148.512 bytes, es un banco de pruebas para estudiar la viabilidad de pesos ternarios en arquitecturas transformer pequeñas para forecasting.
- Despliegue embebido y en navegador: su tamaño (149 KB) y su implementación en Rust/WASM permiten ejecutarlo en entornos sin GPU, incluido el navegador, como demuestra el Space del autor.
- Estudio de horizontes largos por rollout: permite analizar la degradación del error al extender el horizonte más allá de 64 pasos, con ratios MASE de 0.833 (corto), 0.928 (medio) y 0.988 (largo) frente al naive estacional.
- Reproducibilidad de resultados negativos: el modelo y sus scripts permiten verificar el veredicto de la puerta G1 y el comportamiento de la línea s6-cast, con todos los resultados publicados en la página de resultados del proyecto.

## Benchmarks y rendimiento

Evaluación en GIFT-Eval, 97 configuraciones, 371.330 ventanas, protocolo oficial (gluonts `evaluate_model`, 9 deciles); cada métrica se divide por el naive estacional y se promedia geométricamente (menor es mejor).

| Modelo | nGMASE | nWQL | nMSIS |
|---|---:|---:|---:|
| s6-cast2-pico, sin flip (modelo evaluado) | 0.8847 | 0.6190 | 0.6848 |
| s6-cast2-pico, con flip | 0.8692 | 0.6071 | 0.6735 |
| s6-cast-pico (v1), sin flip | 0.9471 | 0.6646 | 0.7190 |
| s6-cast-pico (v1), con flip | 0.9099 | 0.6417 | 0.6860 |
| Umbral G1: FLAIR, training-free (paper TinyCast) | 0.838 | 0.587 | no disponible |
| TinyCast, port del autor, con flip | 0.7856 | 0.5570 | 0.5781 |
| TinyCast, port del autor, sin flip | 0.7918 | 0.5622 | 0.5865 |
| Naive estacional, harness del autor | 0.9999 | 0.8876 | 2.6778 |

Por término de horizonte, ratio MASE / WQL frente al naive estacional:

| Término | Configuraciones | v1 | v2 | Port de TinyCast |
|---|---:|---|---|---|
| Corto | 55 | 0.860 / 0.638 | 0.833 / 0.610 | 0.756 / 0.571 |
| Medio | 21 | 1.046 / 0.696 | 0.928 / 0.624 | 0.806 / 0.534 |
| Largo | 21 | 1.105 / 0.706 | 0.988 / 0.637 | 0.848 / 0.546 |

Por dominio, ratio MASE / WQL:

| Dominio | Configuraciones | v1 | v2 | Port de TinyCast |
|---|---:|---|---|---|
| Econ/Fin | 6 | 1.018 / 0.901 | 0.984 / 0.876 | 0.894 / 0.841 |
| Energy | 32 | 1.080 / 0.800 | 1.003 / 0.746 | 0.882 / 0.661 |
| Healthcare | 5 | 0.760 / 0.614 | 0.825 / 0.678 | 0.735 / 0.639 |
| Nature | 15 | 0.862 / 0.467 | 0.825 / 0.414 | 0.757 / 0.358 |
| Sales | 4 | 0.753 / 0.457 | 0.749 / 0.455 | 0.734 / 0.445 |

Veredicto de las puertas pre-registradas: G1 falla en ambas métricas (nGMASE 0.8847 > 0.838; nWQL 0.6190 > 0.587), también con flip (0.8692 / 0.6071). G2 se cumple: ratio MASE frente al naive estacional por debajo de 1.00 en cada término (corto 0.833, medio 0.928, largo 0.988). G3 (Chronos-ZS) se descartó antes del entrenamiento porque el harness no reprodujo el TinyCast publicado (enmienda 2), y se reporta igualmente. El modelo supera a su versión 1 pero queda por detrás del port de TinyCast del propio autor (0.7918 / 0.5622 sin flip).

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos (148.512 bytes); la memoria dominada por el contexto de 2.048 puntos y los buffers de rollout es marginal en cualquier GPU moderna.
- GPU recomendadas: innecesarias; el modelo cabe y se ejecuta en CPU. Cualquier GPU consumer (RTX 4090, RTX 3060, etc.) lo ejecuta sin restricción, pero no aporta ventaja significativa.
- Cabe en GPU consumer: sí, en todas; también en dispositivos embebidos y en navegador vía WASM.
- Opciones de despliegue: el proyecto skycmd en Rust; formato GGUF; demo en Hugging Face Spaces y página de forecasting del sitio del proyecto ejecutables en navegador. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nGMASE (GIFT-Eval) | nWQL (GIFT-Eval) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| s6-cast2-pico | 377.568 (model card) / 106.272 (safetensors) | 2.048 puntos | 0.8847 | 0.6190 | Apache 2.0 | GGUF en HF, código Rust |
| s6-cast-pico (v1) | no disponible | 2.048 puntos | 0.9471 | 0.6646 | Apache 2.0 | GGUF en HF |
| TinyCast (port del autor) | no disponible | no disponible | 0.7918 | 0.5622 | no disponible | código en skycmd |
| FLAIR (training-free, paper TinyCast) | no disponible | no disponible | 0.838 (umbral) | 0.587 (umbral) | no disponible | referencia bibliográfica |
| Naive estacional | 0 | no disponible | 0.9999 | 0.8876 | no aplica | baseline del harness |

## Limitaciones y advertencias

- Resultado negativo publicado: el autor declara explícitamente que el modelo falló su puerta pre-registrada G1 y que se publica como resultado, no para uso. No debe despleguese en producción como predictor principal.
- Rendimiento inferior al naive estacional en Energy (MASE 1.003) y en Econ/Fin (0.984); solo supera claramente al naive en Nature, Sales y Healthcare en términos de MASE.
- Peor que el port de TinyCast del propio autor en todas las métricas y términos evaluados (0.8847/0.6190 frente a 0.7918/0.5622 sin flip).
- Contaminación parcial de diseño: GIFT-Eval es parcialmente in-sample para las decisiones de diseño de v2, aunque no para sus pesos; el test más limpio (Chronos-ZS) se descartó antes del entrenamiento y se reporta sin veredicto de puerta.
- Cobertura limitada del contexto: 2.017 ventanas en 12 configuraciones no tienen observación en los últimos 2.048 puntos y se prediccen por el naive estacional.
- Discrepancia no aclarada entre el número de parámetros de la model card (377.568) y el reportado en safetensors (106.272); conviene verificar antes de cualquier uso técnico.
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo de series temporales, los riesgos de sesgo lingüístico o de alucinación textual no aplican, pero sí el riesgo de predicciones mal calibradas fuera de las bandas de frecuencia de entrenamiento (USCRN de 5 minutos).
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja el uso del modelo por su condición de resultado negativo.
- El modelo no soporta tool calling, agentes, visión, audio ni generación de texto; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-cast2-pico
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/maxgfr/s6-cast2-pico
- Repositorio de código (skycmd, Rust): https://github.com/maxgfr/skycmd
- Pre-registro: https://github.com/maxgfr/skycmd/blob/main/docs/s6-cast2-prereg.md
- Estudio de diseño: https://github.com/maxgfr/skycmd/blob/main/docs/s6-cast2-study.md
- Especificación: https://github.com/maxgfr/skycmd/blob/main/docs/SPEC-S6-CAST.md
- Benchmark completo: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-cast2-pico-s6-cast-v2-a-forecaster-with-a-periodicity-front-end-pre-registered-gate-failed
- Veredicto de la puerta: https://github.com/maxgfr/skycmd/blob/main/runs/s6-cast2-pico/GATE.md
- Página de resultados del proyecto: https://maxgfr.github.io/skycmd/results/#s6-cast2-pico-failed
- Página de forecasting del sitio del proyecto: https://maxgfr.github.io/skycmd/forecast/
