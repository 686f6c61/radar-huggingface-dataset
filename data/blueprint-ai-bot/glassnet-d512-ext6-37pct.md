# blueprint-ai-bot/glassnet-d512-ext6-37pct

## Resumen

GlassNet es un modelo de lenguaje experimental desarrollado por blueprint-ai-bot, construido íntegramente desde cero sin PyTorch, sin la librería `transformers`, sin autograd y sin pesos preentrenados. Toda la arquitectura, el paso backward y el optimizador están implementados en aproximadamente 7.000 líneas de NumPy puro, con el objetivo de que cualquier persona pueda leer y auditar cada línea del código. La variante `glassnet-d512-ext6-37pct` que documenta esta ficha tiene 15.567.566 parámetros y un vocabulario de 12.002 tokens.

El modelo no emplea atención en su núcleo de cómputo, sino un estado recurrente que se propaga a través de las 32 posiciones de contexto. Sobre ese estado se aplican 256 "neuronas de concepto" con nombres legibles (como `is_a_question` o `mentions_self`) que permiten trazar por qué se produjo una respuesta mediante el método `explain()`. Es, por tanto, un proyecto de investigación sobre interpretabilidad y transparencia, no un modelo orientado a producción.

Su relevancia actual es metodológica: publica todos los registros de entrenamiento, incluidos los fallos, y reporta métricas honestas (37,37% de precisión en el siguiente token sobre datos retenidos). No compite con modelos generativos convencionales; su valor está en demostrar que es posible construir y auditar un modelo completo sin dependencias de frameworks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Recurrente con estado (sin atención en el núcleo), con capa de conceptos y readout atado al embedding |
| Parámetros totales | 15.567.566 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Blueprint AI License 1.0 (no aprobada por OSI; gratuita por debajo de 1.000.000 USD de ingresos anuales) |
| Formato de pesos | safetensors (con `config.json` y `labels.json` auxiliares) |

## Arquitectura y entrenamiento

GlassNet se organiza en cuatro etapas secuenciales. La primera es un embedding que convierte los identificadores de token en vectores (0,0053 ms/token). La segunda es el núcleo de cómputo, que mantiene un vector de estado recurrente a lo largo de las 32 posiciones en lugar de usar atención (0,0027 ms/token). La tercera aplica 256 neuronas de concepto, cada una auditada contra una definición medible (0,0008 ms/token). La cuarta es un readout atado que comparte la matriz de embedding para producir la distribución sobre los 12.002 tokens del vocabulario (0,0273 ms/token). El modelo fue entrenado desde cero, sin pesos preentrenados, con un paso backward y un optimizador implementados a mano.

El proyecto documenta explícitamente sus fracasos arquitectónicos: un bloque de atención de una sola cabeza sin posiciones, residual ni normalización perdió 5,41 puntos frente a no usar atención (18,69% frente a 24,10%), y la propia arquitectura recurrente perdió frente a la forma plana en ambas semillas (3,87/4,07 frente a 5,53/5,87), con causa identificada en un residual sin normalizar que saturaba el estado. Los gradientes están verificados a mano con 9/9 comprobaciones superadas y un error absoluto máximo de 7,5e-10. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Generación de texto a nivel de siguiente token, con gramática real pero contenido débil según la propia model card.
- Razonamiento interpretable: `explain()` imprime qué conceptos con nombre se activaron y cuánto empujaron la salida.
- Inspección en vivo de pesos y activaciones neuronales mediante `lens/liveview.py`, servido en el puerto 8770.
- Aritmética limitada: 0,0% de acierto exacto en operandos no vistos, aunque un sondeo por dígito muestra que el dígito 0 alcanza el 100% en operandos no vistos.
- Capacidades multilingües: no disponibles; solo inglés.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles.
- Modo thinking, visión y audio: no disponibles.

## Casos de uso

- Investigación en interpretabilidad: el modelo permite estudiar cómo neuronas con nombre concreto (`is_a_question`, `mentions_self`) contribuyen a la salida, usando `explain()` y el inspector en vivo para auditar cada decisión.
- Docencia de sistemas de lenguaje: al estar implementado en NumPy puro y sin frameworks, sirve para enseñar paso backward, optimizadores y caché KV leyendo el código directamente.
- Auditoría de gradientes: los documentos `docs/ARCHITECTURE.md` incluyen las derivadas escritas a mano y la comprobación por operación, útiles como material de verificación en cursos de cálculo numérico.
- Reproducibilidad de experimentos: todos los registros de entrenamiento, incluidos los fallos, están publicados, lo que permite reproducir y contrastar resultados negativos en arquitecturas recurrentes.
- Prototipado de métricas de evaluación: el modelo reporta precisión por posición y por identificador (37,37% frente a 28,57% con la métrica heredada), lo que permite probar metodologías de evaluación comparada.
- Estudio de limitaciones de contexto: con una ventana fija de 32 tokens, sirve para experimentar sobre qué ocurre cuando un modelo no puede ampliar su contexto, sin la tentación de "subir la configuración".

## Benchmarks y rendimiento

| Checkpoint | Precisión en datos retenidos (por posición) | Precisión con métrica heredada por id | Parámetros |
|---|---:|---:|---:|
| `glassnet-d512-ext6-37pct` | 37,37% | 28,57% | 15.567.566 |
| `glassnet-d256-2m-24pct` | 24,20% | no disponible | 5.908.686 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de aritmética y atención citados en la model card son resultados internos del proyecto, no comparables con benchmarks de la industria.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado que el repositorio ocupa 0,1 GB y el modelo tiene 15,6M de parámetros.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 1 GB de memoria; también es viable en CPU.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no existe implementación en `transformers`. El despliegue se realiza con `numpy` y `safetensors` siguiendo `examples/load_weights.py` y `examples/run_locally.md`.
- Latencia y throughput: el desglose por etapa es de 0,0053 ms/token (embedding), 0,0027 ms/token (núcleo), 0,0008 ms/token (conceptos) y 0,0273 ms/token (readout), con un total aproximado de 0,0361 ms/token en el entorno de medida del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión reportada | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| GlassNet d512-ext6 | 15,6M | 32 tokens | 37,37% (por posición) | Blueprint AI 1.0 (no OSI) | Hugging Face + GitHub |
| GlassNet d256-2m | 5,9M | 32 tokens | 24,20% (por posición) | Blueprint AI 1.0 (no OSI) | Hugging Face + GitHub |
| Modelos transformer convencionales de tamaño similar | no disponible | no disponible | no disponible | variable | variable |

No se dispone de información sobre modelos comparables de la misma categoría (interpretables, sin frameworks, desde cero) en la documentación proporcionada. La comparación más directa es con el propio checkpoint menor del mismo proyecto.

## Limitaciones y advertencias

- Conversación coherente: no funciona; la gramática es real pero el contenido es débil, según la propia model card.
- Aritmética en operandos no vistos: 0,0% de acierto exacto en tres implementaciones distintas.
- Contexto fijo de 32 tokens: no es ampliable mediante configuración; cualquier afirmación de que el modelo "recuerda" una conversación es incorrecta.
- Arquitectura propia: perdió frente a la forma plana en ambas semillas (3,87/4,07 frente a 5,53/5,87), con causa documentada en un residual sin normalizar.
- Atención: el bloque de atención de una sola cabeza sin posiciones, residual ni normalización resultó peor que no usar atención (18,69% frente a 24,10%).
- Licencia: no es open source aprobada por OSI; requiere licencia comercial por encima de 1.000.000 USD de ingresos anuales (1% de participación en ingresos). El uso dañino no está licenciado.
- Estado del proyecto: investigación temprana, explícitamente marcado como "not-for-production".
- Idiomas: solo inglés; no hay soporte multilingüe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; con 37% de precisión en siguiente token, la fiabilidad es baja por diseño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blueprint-ai-bot/glassnet-d512-ext6-37pct
- Repositorio de código, tests y resultados: https://github.com/blueprint-ai-hq-git/glassnet
- Licencia: https://github.com/blueprint-ai-hq-git/glassnet/blob/main/LICENSE
- Estado y porcentajes: `STATUS.md` en el repositorio
- Cómo probar y reportar métricas: `docs/TESTING.md` en el repositorio
- Arquitectura y derivadas: `docs/ARCHITECTURE.md` en el repositorio
- Contacto: blueprintai.help1@gmail.com
