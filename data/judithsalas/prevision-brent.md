# judithsalas/prevision-brent

## Resumen

El modelo `judithsalas/prevision-brent` es un conjunto de redes neuronales recurrentes entrenadas para la previsión del precio del petróleo Brent a tres horizontes temporales: una semana (5 días hábiles), tres meses (63 días hábiles) y un año (252 días hábiles). Lo desarrolla la autora Judith Salas en el contexto del Caso de uso III de la asignatura de Aprendizaje automático, y se publica como material educativo acompañado de una aplicación web de demostración. La entrada del modelo son los últimos 60 días de 15 series temporales del mercado petrolero.

Técnicamente se trata de tres arquitecturas recurrentes (RNN simple, LSTM y GRU) implementadas en PyTorch, con 9 variantes en total (tres arquitecturas por cada uno de los tres horizontes). La previsión final es la media de los pesos de tres semillas de entrenamiento, y cada archivo `.pt` incluye además el escalador de entradas de scikit-learn, la ventana de 60 días y el horizonte en días hábiles.

Su relevancia es doble: por un lado, es un ejemplo reproducible y didáctico de modelado de series temporales financieras con redes recurrentes; por otro, la propia model card documenta de forma honesta que ninguna de las redes supera al predictor trivial ("el precio futuro es el de hoy") en el conjunto de test 2021-2026, lo que lo convierte en un caso de estudio útil sobre la dificultad de batir baselines en mercados financieros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN simple, LSTM y GRU (tres variantes por horizonte) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de entrada de 60 días (series temporales, no tokens) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante estándar de PyTorch) |
| Idiomas soportados | es (documentación y etiquetas; el modelo opera sobre series numéricas) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (pickles de PyTorch con red, hiperparámetros, pesos de 3 semillas, escalador y metadatos) |

## Arquitectura y entrenamiento

El modelo es un conjunto de redes neuronales recurrentes (RNN, LSTM y GRU) que toman como entrada una ventana de 60 días de 15 series del mercado petrolero y producen una predicción del precio del Brent en logaritmo (la predicción se desescala multiplicando por el precio actual y aplicando la exponencial). Cada horizonte (corto, medio y largo) tiene sus tres arquitecturas, sumando 9 modelos en la carpeta `final/`. La predicción publicada es la media de los pesos entrenados con tres semillas distintas, lo que actúa como un ensamblado simple para reducir varianza.

Los modelos de `final/` se entrenaron con datos de 2000 a 2017 y se evaluaron una sola vez sobre el periodo 2021-2026. La carpeta `app/` contiene tres modelos reentrenados con todos los datos hasta la fecha para la aplicación web, con reentrenamiento mensual previsto. No se especifican en la información disponible el número de tokens (no aplica), la composición exacta del dataset de las 15 series, ni si se emplearon técnicas de regularización adicionales más allá de los hiperparámetros guardados en cada archivo. La selección de arquitectura por horizonte se hizo en validación: GRU para una semana, LSTM para tres meses y un año.

## Capacidades

- Previsión de series temporales univariantes: predice el precio del Brent a 5, 63 y 252 días hábiles.
- Entrada multivariante: consume 60 días de 15 series del mercado como variables explicativas.
- Ensamblado por semillas: la predicción es la media de tres entrenamientos independientes.
- Tres arquitecturas comparables (RNN, LSTM, GRU) para el mismo problema, lo que permite analizar el efecto de la arquitectura recurrente.
- Estimación de incertidumbre: la model card reporta el acierto del rango del 80 % por horizonte (71 %, 74 % y 52 %).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; es un modelo puramente numérico de forecasting.
- Idiomas: la documentación está en español; el modelo no procesa texto.

## Casos de uso

- Docencia y aprendizaje de series temporales: sirve como ejemplo completo y reproducible de pipeline (descarga de datos, preproceso, escalado, entrenamiento y evaluación) con tres arquitecturas recurrentes comparables.
- Análisis de incertidumbre en previsiones financieras: la model card reporta el acierto del rango del 80 % por horizonte, lo que permite estudiar cómo calibrar intervalos de predicción en lugar de fiarse solo de la cifra central.
- Comparación de arquitecturas recurrentes: al incluir RNN, LSTM y GRU para el mismo problema y datos, permite reproducir experimentos sobre cuál generaliza mejor en horizontes cortos, medios y largos.
- Baseline para investigación en forecasting de commodities: cualquier modelo nuevo (Transformers, SSM, modelos híbridos) puede compararse contra estas redes y contra el predictor trivial "precio de hoy", ambos documentados.
- Demostración educativa en aplicaciones web: la app `prevision-brent.vercel.app` ilustra cómo integrar un modelo PyTorch con un escalador de scikit-learn en un servicio desplegado, incluyendo reentrenamiento mensual.
- Estudio de degradación por horizonte: los resultados muestran cómo el rendimiento cae drásticamente de una semana (R² 0,88) a un año (R² −2,93), útil para discutir los límites de la predictibilidad en mercados financieros.
- Referencia metodológica para evaluación honesta: el uso de un test único (2021-2026) y la comparación explícita contra el baseline trivial sirven como plantilla de buenas prácticas de evaluación.

## Benchmarks y rendimiento

Resultados de test sobre 2021-2026, evaluados una sola vez. La referencia es el predictor trivial "el precio futuro es el de hoy".

| Plazo | Modelo de la app | Mejora frente al precio de hoy | R² (red / precio de hoy) | Acierto del rango del 80 % |
|---|---|---|---|---|
| 1 semana | GRU | −2,0 % | 0,88 / 0,88 | 71 % |
| 3 meses | LSTM | −26 % | −0,60 / −0,19 | 74 % |
| 1 año | LSTM | −55 % | −2,93 / −1,46 | 52 % |

Ninguna red mejora al precio de hoy en ningún horizonte. Los modelos de `app/` ya han visto el periodo 2021-2026, por lo que estas cifras corresponden a `final/` y no son directamente extrapolables a los modelos reentrenados.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; al tratarse de redes recurrentes pequeñas con ventana de 60 pasos y 15 variables de entrada, la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA para PyTorch es suficiente. Para entrenamiento, una GPU consumer moderna (RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos GB de VRAM; también funciona en CPU.
- Opciones de despliegue: PyTorch nativo (carga de `.pt` con `weights_only=False`), integración con scikit-learn para el escalador. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia esperada es de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencias conceptuales de la misma categoría (forecasting de series temporales con redes recurrentes), podrían citarse implementaciones genéricas de LSTM/GRU para predicción financiera, pero no se dispone de datos de rendimiento ni de especificaciones verificables para establecer una comparación rigurosa. Se indica, por tanto: no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| judithsalas/prevision-brent | no disponible | ventana de 60 días | ver tabla de benchmarks | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento inferior al baseline trivial: ninguna red supera al predictor "el precio futuro es el de hoy" en el test 2021-2026, con empeoramientos del 2 %, 26 % y 55 % según el horizonte.
- R² negativo en horizontes medios y largos (−0,60 y −2,93), lo que indica que el modelo explica peor la varianza que una predicción constante.
- Acierto del rango del 80 % bajo en el horizonte anual (52 %), muy por debajo de la cobertura nominal.
- Riesgo de sobreajuste: los modelos de `app/` han visto el periodo de test, por lo que sus métricas no son comparables con las de `final/`.
- Sesgos conocidos: no documentados explícitamente; al entrenarse con datos de 2000-2017, puede no capturar regímenes de mercado posteriores (crisis, pandemias, cambios estructurales).
- Limitación de contexto: la ventana de entrada es fija de 60 días y 15 series; no admite entradas más largas ni variables adicionales sin reentrenamiento.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial.
- Advertencia de seguridad: los archivos son pickles de PyTorch que se cargan con `weights_only=False`; solo deben cargarse si se confía en su origen, ya que la deserialización de pickles puede ejecutar código arbitrario.
- Herramienta educativa: la propia model card indica explícitamente que no es asesoramiento financiero.
- Idiomas: la documentación está en español; el modelo no procesa lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/judithsalas/prevision-brent
- Repositorio de código, datos y metodología: https://github.com/judithsalas/oil_price_prediction_case02
- Aplicación web que usa los modelos: https://prevision-brent.vercel.app
