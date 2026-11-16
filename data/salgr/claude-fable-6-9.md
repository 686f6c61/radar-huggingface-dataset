# salgr/Claude-Fable-6.9

## Resumen

Claude-Fable-6.9 es un modelo publicado en Hugging Face por el usuario salgr bajo licencia Apache 2.0. A pesar de la denominación comercial que evoca a la familia Claude y a las etiquetas "Official" y "SOTA" presentes en su model card, el contenido técnico describe un perceptrón multicapa de 69 parámetros entrenado para aproximar una función matemática unidimensional concreta: `sin(x) + 0.5·cos(2x)`. No se trata, por tanto, de un modelo de lenguaje, sino de un artefacto didáctico de regresión simbólica.

La arquitectura es una red totalmente conectada de tres capas lineales (1→6→7→1) con activación tanh en las capas ocultas y salida lineal, implementada y entrenada en NumPy con retropropagación manual y optimizador Adam a batch completo. El conjunto de datos es sintético: 100 puntos de entrenamiento y 50 de validación muestreados uniformemente en [−π, π] con ruido gaussiano de desviación 0,05.

Su relevancia es exclusivamente pedagógica: sirve como ejemplo mínimo reproducible de entrenamiento desde cero, cálculo de gradientes a mano y análisis de convergencia. No dispone de tokenizador, vocabulario, ventana de contexto ni capacidad de generación de texto, pese a que el pipeline declarado en el repositorio sea `text-generation`. El tamaño del repositorio es de 0,0 GB y el modelo registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado, 1→6→7→1, activación tanh en capas ocultas y salida lineal |
| Parametros totales | 69 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo no procesa secuencias; entrada escalar de tamaño 1) |
| Tipos de cuantizacion | No disponible (pesos en float32; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dtype float32) |

## Arquitectura y entrenamiento

La red consta de tres capas lineales: `Linear(1→6)` con 12 parámetros, `Linear(6→7)` con 49 parámetros y `Linear(7→1)` con 8 parámetros, sumando 69 en total. La inicialización sigue una distribución normal con desviación `1/fan_in` para los pesos y sesgos a cero. La salida de las dos capas ocultas pasa por tanh; la capa final es lineal. El modelo recibe un único escalar y devuelve un único escalar.

El entrenamiento se realizó sobre un dataset sintético generado con `numpy.random.default_rng(0)`: 100 puntos de entrenamiento con `x` uniforme en [−π, π] e `y = sin(x) + 0.5·cos(2x) + ε`, donde ε es ruido gaussiano con σ = 0,05, más 50 puntos de validación. La función de pérdida es el error cuadrático medio y los gradientes se calcularon manualmente mediante retropropagación en NumPy (script `train.py`). Se usó Adam con β₁ = 0,9, β₂ = 0,999, ε = 1e-8, tasa de aprendizaje constante de 0,02, batch completo de 100 y 5000 iteraciones. No se documenta uso de RLHF, DPO, decodificación especulativa ni atención lineal, por resultar inaplicables a esta arquitectura.

## Capacidades

- Aproximación de la función escalar `sin(x) + 0.5·cos(2x)` en el intervalo [−π, π] con un MSE de validación final de 0,00682.
- Regresión univariante de funciones suaves y periódicas de baja complejidad.
- Inferencia determinista y de coste computacional despreciable (69 parámetros en float32).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión, audio ni procesamiento de secuencias.

## Casos de uso

- Docencia de redes neuronales: el modelo sirve como ejemplo completo y reproducible de un MLP entrenado desde cero, con código de retropropagación manual en NumPy, para ilustrar el flujo forward/backward en cursos introductorios.
- Verificación de implementaciones de autograd: al conocerse la función objetivo y los hiperparámetros exactos, puede usarse como test de referencia para comprobar que una librería de diferenciación automática produce gradientes equivalentes a los calculados a mano.
- Estudio de convergencia y capacidad: permite analizar empíricamente el efecto del número de parámetros y de iteraciones sobre el error final, dado que el autor documenta que la pérdida sigue descendiendo en la iteración 5000 y no alcanza el nivel de ruido (σ² = 0,0025).
- Análisis de sobreajuste en datasets pequeños: con solo 100 puntos de entrenamiento y curvas de train/validación muy próximas, es un caso de estudio sobre generalización en régimen de datos escasos.
- Pruebas de pipelines de serialización: al estar en safetensors float32, sirve para validar flujos de carga, guardado y exportación de pesos en herramientas internas sin coste de recursos.
- Reproducibilidad y auditoría de semillas: el uso de `default_rng(0)` y de hiperparámetros fijos permite reproducir exactamente el entrenamiento y auditar la variabilidad introducida por la inicialización de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de regresión escalar. La model card sí reporta la evolución del MSE durante el entrenamiento:

| Iteracion | MSE entrenamiento | MSE validacion |
|---|---|---|
| 1 | 1,39811 | 1,29456 |
| 500 | 0,00737 | 0,00772 |
| 1000 | 0,00714 | 0,00771 |
| 2000 | 0,00687 | 0,00729 |
| 3000 | 0,00674 | 0,00700 |
| 4000 | 0,00656 | 0,00688 |
| 5000 (final) | 0,00629 | 0,00682 |

La varianza del ruido en los datos es 0,0025, por lo que el error final es aproximadamente 2,5 veces superior al nivel de ruido. El autor indica que la pérdida sigue decreciendo lentamente en la iteración 5000 y que la red podría carecer de capacidad suficiente, sin que se haya probado ninguna de las dos explicaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; 69 parámetros en float32 ocupan 276 bytes, más el overhead del runtime.
- GPU recomendadas: innecesaria; el modelo se ejecuta en CPU en microsegundos.
- Cabe en cualquier GPU consumer, incluida una iGPU, y también en entornos sin GPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a esta arquitectura. El despliegue natural es cargar los pesos safetensors desde NumPy o PyTorch y evaluar la red manualmente.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, la inferencia es prácticamente instantánea y el coste dominante sería el overhead de carga del fichero.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (MLP de regresión escalar de 69 parámetros entrenado sobre una función sintética), y las alternativas de la familia Claude a las que aluden las etiquetas del repositorio no guardan relación técnica con este artefacto.

## Limitaciones y advertencias

- El modelo no es un modelo de lenguaje pese a las etiquetas "Claude", "Claude 6.9", "Claude Fable", "Official" y "SOTA" y al pipeline `text-generation` declarado; no genera texto ni procesa tokens.
- Dominio de validez restringido a entradas escalares en el intervalo [−π, π]; fuera de ese rango el comportamiento no está garantizado ni documentado.
- Error final de validación (0,00682) superior al nivel de ruido de los datos (0,0025), lo que sugiere infracapacidad o convergencia incompleta según el propio autor.
- Entrenado con solo 100 puntos y una única semilla; no se ha evaluado su robustez frente a otras inicializaciones ni otros conjuntos de datos.
- Riesgo de alucinación no aplicable; el riesgo real es de extrapolación incorrecta fuera del dominio de entrenamiento.
- Sin limitaciones de idioma porque no procesa lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero el valor práctico del artefacto fuera de contextos didácticos o de prueba es nulo.
- El repositorio presenta cero descargas y cero likes, sin proceso de revisión comunitario; debe tratarse como un experimento personal y no como un modelo validado para producción.
- La etiqueta "Official" y el nombre comercial pueden inducir a confusión sobre su procedencia y naturaleza; conviene verificar el contenido real de los pesos antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/salgr/Claude-Fable-6.9
- Resultado de búsqueda web no relacionado (wiki de un simulador de planetas): https://3ps.miraheze.org/wiki/Salgr
- No se han encontrado en la búsqueda papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
