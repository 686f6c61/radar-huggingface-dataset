# nabin2004/nebium-large

## Resumen

Nebium-Large es un transformer causal decoder-only de 762 millones de parámetros desarrollado por Nabin Oli (usuario nabin2004) y publicado en Hugging Face bajo licencia MIT. El modelo no es un LLM de propósito general: está especializado en modelado de secuencias tácticas de ajedrez y predicción de la siguiente jugada en notación UCI, según se desprende de sus etiquetas (`chess`, `causal-lm`), del dataset declarado (`nabin2004/nebium-lichess-uci`) y del vocabulario BPE de 5.000 tokens construido sobre "plies" UCI.

Arquitectónicamente sigue el patrón estándar de los transformers modernos: 36 capas, dimensión oculta de 1.280, 20 cabezas de atención, RoPE con theta 10.000, activación SwiGLU y RMSNorm con pre-normalización. La ventana de contexto es de 1.024 tokens, suficiente para codificar partidas parciales pero muy lejos de los modelos generalistas contemporáneos. El autor sitúa el presupuesto de entrenamiento óptimo según Chinchilla en 15.200 millones de tokens (≈20×N), equivalentes a unos 46 millones de trayectorias de partidas de 50 movimientos.

Su relevancia es acotada y de nicho: se trata de un artefacto de investigación sobre modelado de secuencias en dominios estructurados y cerrados, no de una alternativa a los LLM conversacionales. En el momento de la consulta el repositorio acumula 0 descargas y 0 "likes", por lo que no hay evidencia pública de adopción ni de validación independiente. Se distribuye como state dict de PyTorch (`model.pt`) y cuenta con un repositorio GGUF complementario para ejecución cuantizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (atención escalada de producto punto causal) |
| Parametros totales | 762 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No especificados en la model card; existe un repositorio GGUF complementario (nabin2004/nebium-large-gguf) para llama.cpp u Ollama, pero no se detallan los niveles publicados |
| Idiomas soportados | Etiqueta declarada: `en`. En la práctica el modelo opera sobre notación UCI de ajedrez (vocabulario BPE de 5.000 tokens sobre "plies" UCI), no sobre lenguaje natural |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, state dict) + `model_config.json`; artefactos GGUF en repositorio separado |

Especificaciones arquitectónicas adicionales:

| Hiperparametro | Valor |
|---|---|
| Dimension oculta (d_model) | 1.280 |
| Cabezas de atencion | 20 |
| Capas | 36 |
| Tamano de vocabulario | 5.000 |
| Embeddings posicionales | RoPE, theta = 10.000 |
| Funcion de activacion | SwiGLU |
| Normalizacion | RMSNorm (pre-normalizacion) |
| Learning rate base | 1,5e-4 (decaimiento coseno con warmup lineal) |
| Weight decay | 0,1 |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con las primitivas habituales de los LLM modernos (RoPE, SwiGLU, RMSNorm pre-norm), pero dimensionado para un dominio cerrado. Con 36 capas y d_model = 1.280, la relación entre ancho y profundidad es relativamente estrecha, lo que es coherente con un vocabulario muy pequeño (5.000 tokens BPE) y un contexto corto de 1.024 tokens. El tokenizador se entrena sobre "plies" en notación UCI, de modo que el modelo consume y produce secuencias del tipo `e2e4 e7e5 g1f3` en lugar de texto libre.

El autor declara un presupuesto de entrenamiento óptimo bajo el marco Chinchilla de Hoffmann et al. (2022) de 15.200 millones de tokens (≈20 × 762M), con los parámetros de la ley de escalado E = 1,69, A = 406,4, B = 410,7, α = 0,34 y β = 0,28. Esa cifra se traduce, según la propia model card, en unas 46 millones de trayectorias de partidas de 50 movimientos. No se especifica en la información disponible si el entrenamiento se completó hasta ese horizonte, ni la composición exacta del dataset más allá de su origen (Lichess, según el identificador `nabin2004/nebium-lichess-uci`). Tampoco se documenta ningún proceso de alineación posterior (RLHF, DPO, SFT) ni innovaciones de decodificación como decodificación especulativa.

El modelo se instancia mediante la clase `Nebium` del repositorio `github.com/nabin2004/nebium`, cargando un `state_dict` de PyTorch con `weights_only=True`. La generación es autorregresiva estándar con parámetros de muestreo (`max_new_tokens`, `temperature`).

## Capacidades

- Predicción de la siguiente jugada en ajedrez a partir de una secuencia parcial en notación UCI.
- Modelado de secuencias tácticas y verificación implícita de legalidad de movimientos ("move legality", según la descripción del autor).
- Generación autorregresiva con control de temperatura y longitud máxima de generación.
- Continuación de líneas de apertura dadas como prompt (por ejemplo, `e2e4 e7e5 g1f3`).
- Ejecución en CPU vía PyTorch y, presumiblemente, en llama.cpp u Ollama a través del repositorio GGUF complementario.
- No dispone de soporte documentado de tool calling, function calling, uso como agente, razonamiento multi-paso, visión ni audio.
- No hay capacidades multilingües en sentido estricto: el vocabulario está construido sobre notación UCI, no sobre lenguaje natural, pese a la etiqueta `en` de la model card.
- No se documenta ningún modo "thinking" ni proceso de razonamiento explícito.

## Casos de uso

- Análisis de aperturas: dado un prompt con los primeros movimientos de una partida, el modelo genera continuaciones plausibles en notación UCI, lo que permite explorar líneas de apertura de forma masiva y automatizada, siempre dentro de la ventana de 1.024 tokens.
- Etiquetado y enriquecimiento de datasets de ajedrez: al ser un modelo de lenguaje sobre secuencias UCI, puede usarse para puntuar la probabilidad de movimientos concretos y derivar anotaciones automáticas sobre corpus de partidas.
- Filtrado de calidad en corpus Lichess: comparar la probabilidad asignada por el modelo a los movimientos realmente jugados frente a alternativas permite detectar partidas anómalas o errores de transcripción en notación.
- Investigación en modelado de secuencias en dominios cerrados: sirve como banco de pruebas controlado para estudiar leyes de escalado, efecto del contexto o tokenización sobre un vocabulario de 5.000 símbolos.
- Componente auxiliar en pipelines de motores o entrenadores: integrado como prior de política ligero (762M parámetros) frente a búsquedas tipo MCTS, con un coste de memoria que cabe en cualquier GPU de consumo.
- Demostraciones educativas de inferencia local: al distribuirse GGUF y caber en menos de 1 GB cuantizado, es adecuado para tutoriales de despliegue con llama.cpp u Ollama en portátiles.
- Reproducción de experimentos de escalado: permite reproducir localmente la comparación entre presupuesto de cómputo y tamaño de modelo usando los coeficientes Chinchilla declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (ni perplejidad, ni precisión de predicción de movimiento, ni comparaciones con Maia, Leela Chess Zero u otros modelos de ajedrez). El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada (cálculo a partir de 762M parámetros, sin contar activaciones ni caché KV): ≈3,0 GB en FP32; ≈1,5 GB en FP16/BF16; ≈0,8 GB en INT8; ≈0,5 GB en cuantización de 4 bits.
- La caché KV es despreciable en comparación: 36 capas × 20 cabezas, con contexto máximo de 1.024 tokens.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3060 (12 GB), RTX 4090 (24 GB) e incluso en iGPU con memoria unificada suficiente.
- GPU recomendadas para entrenamiento o fine-tuning: A100, H100 o RTX 4090; para inferencia basta cualquier GPU con ≥2 GB libres en FP16.
- Es perfectamente viable la inferencia en CPU, dado el tamaño del modelo y el contexto corto.
- Opciones de despliegue: PyTorch nativo (clase `Nebium` + `state_dict`); llama.cpp y Ollama a través del repositorio GGUF complementario. No hay soporte documentado para vLLM o TGI, ya que la arquitectura es personalizada y no sigue las clases estándar de `transformers`.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No existen modelos directamente comparables dentro del nicho de predicción de movimientos de ajedrez con especificaciones públicas verificables en la información proporcionada. A modo de referencia de tamaño, se incluye una comparación con modelos generalistas de parámetros similares; los datos de rendimiento de Nebium-Large no están disponibles, por lo que la comparación es estructural, no de calidad.

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| Nebium-Large | 762M | 1.024 tokens | MIT | Especializado en secuencias UCI de ajedrez | PyTorch + GGUF; 0 descargas |
| Qwen2.5-0.5B | ≈490M | 32.768 tokens nativos | Apache-2.0 | LLM generalista multilingüe | Muy extendido, múltiples formatos |
| SmolLM2-360M | 360M | 8.192 tokens | Apache-2.0 | LLM generalista | Extendido, GGUF y transformers |
| TinyLlama-1.1B | 1.100M | 2.048 tokens | Apache-2.0 | LLM generalista | Muy extendido |

Diferencias clave: Nebium-Large tiene un contexto 32 veces menor que Qwen2.5-0.5B y un vocabulario 30 veces más pequeño, pero está especializado en un dominio simbólico cerrado donde esa restricción no es necesariamente limitante. No hay datos públicos que permitan afirmar que supera a alternativas generalistas en su tarea objetivo.

## Limitaciones y advertencias

- Contexto muy limitado (1.024 tokens): no puede procesar partidas completas en una sola pasada, solo fragmentos.
- Dominio cerrado: no es un modelo conversacional ni de propósito general; fuera de notación UCI su comportamiento es impredecible.
- Idiomas: la etiqueta `en` de la model card no se corresponde con una capacidad real de lenguaje natural, dado que el tokenizador se entrena sobre "plies" UCI.
- Riesgo de alucinación: como todo modelo autorregresivo, puede generar movimientos ilegales o secuencias sintácticamente inválidas en notación UCI; el autor menciona "move legality" como objetivo, pero no se documenta ningún mecanismo de validación ni métricas al respecto.
- Sesgos: el dataset declarado proviene de Lichess, por lo que heredará los sesgos de nivel de juego, aperturas populares y distribución de Elo de esa plataforma. No se documenta ninguna mitigación.
- Licencia MIT: permite uso comercial y modificación sin restricciones significativas, pero al ser un modelo sin benchmarks publicados, cualquier uso en producción debería ir precedido de una evaluación propia.
- Adopción nula: 0 descargas y 0 "likes" implican ausencia de validación comunitaria, de informes de errores y de ecosistema de herramientas.
- Arquitectura no estándar: al no seguir las clases de `transformers`, no se integra directamente con vLLM, TGI ni otros servidores de inferencia habituales; requiere código propio del repositorio `github.com/nabin2004/nebium`.
- Fechas del repositorio: los metadatos indican creación y actualización en septiembre de 2026, posteriores a la fecha de consulta de esta ficha; conviene verificar el estado real del repositorio antes de citarlo.
- No se documentan cuantizaciones concretas del GGUF (Q4_K_M, Q5_K_M, etc.), ni si el entrenamiento alcanzó el presupuesto Chinchilla declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nabin2004/nebium-large
- Repositorio GGUF complementario: https://huggingface.co/nabin2004/nebium-large-gguf
- Código fuente del framework: https://github.com/nabin2004/nebium
- Dataset declarado: https://huggingface.co/datasets/nabin2004/nebium-lichess-uci
- Referencia de leyes de escalado citada por el autor (Hoffmann et al., 2022, Chinchilla): https://arxiv.org/abs/2203.15556

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a concesionarios de automoción y no guardan relación con Nebium-Large.
