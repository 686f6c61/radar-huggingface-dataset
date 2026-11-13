# ahd03/tracely

## Resumen

Tracely es un adaptador LoRA para Qwen3-VL-8B-Instruct que resuelve una tarea de navegación visual: dada una imagen de calle en primera persona y una instrucción en lenguaje natural (por ejemplo, "Go to the bench on the left"), genera la trayectoria que seguiría una persona como una lista de puntos 2D en coordenadas normalizadas de la imagen. Lo desarrolla el usuario ahd03 y se publica bajo licencia Apache 2.0.

El modelo parte de la arquitectura multimodal de Qwen3-VL-8B-Instruct ( transformer con codificador visual y decodificador de lenguaje de 8.000 millones de parámetros) y añade un adaptador LoRA de rango 16 con 44 millones de parámetros entrenables sobre las proyecciones q/k/v/o/gate/up/down del modelo de lenguaje, manteniendo congelado el codificador visual. El adaptador se entrena exclusivamente con 8.392 muestras de imágenes sintéticas renderizadas en Blender, procedentes de tres ciudades generadas de forma procedural, sin usar fotografías reales.

Su relevancia radica en que demuestra que un ajuste fino ligero y barato (unas 4 horas en una A100 80 GB) sobre un modelo base de 8B puede superar a modelos frontera mucho mayores en la tarea específica de predicción de trayectorias peatonales del benchmark NaviTrace, pasando de una puntuación global de -28,3 del modelo base sin entrenar a 36,9 con el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL) con adaptador LoRA sobre el modelo de lenguaje |
| Parametros totales | 8.000 millones (modelo base Qwen3-VL-8B-Instruct); adaptador LoRA con 44 millones de parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible (las instrucciones del benchmark estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen3-VL-8B-Instruct |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-VL-8B-Instruct, un transformer multimodal con codificador visual y decodificador de lenguaje. En el entrenamiento se congela el codificador visual y se aplica LoRA de rango 16, alpha 32 y dropout 0,05 sobre las proyecciones q/k/v/o/gate/up/down del modelo de lenguaje, lo que da 44 millones de parámetros entrenables. El entrenamiento se realizó en tres rondas sobre el split de entrenamiento de ahd03/vln-synthetic-streets (8.392 muestras): primero el Mundo 1, luego los Mundos 1+2 y finalmente el Mundo 3 con 1.500 muestras reproducidas. Se usaron 2 épocas por ronda, tasa de aprendizaje 1e-4 con decaimiento coseno, batch de 16, precisión bf16 e imágenes redimensionadas a 896 px en el lado mayor. Los prompts son los oficiales de NaviTrace (sistema y usuario), y la respuesta es la trayectoria en coordenadas normalizadas que empieza en y = 0,95. El coste computacional fue de aproximadamente 4 horas en una única A100 80 GB en Modal.

La innovación principal no está en la arquitectura, sino en el enfoque de datos: el entrenamiento usa exclusivamente escenas renderizadas en Blender con personas simples y tráfico estático, generadas de forma procedural en tres ciudades, y aun así generaliza lo suficiente para obtener resultados competitivos en el split de validación de NaviTrace con escenarios de embodiment humano.

## Capacidades

- Generación de trayectorias peatonales en coordenadas 2D normalizadas (x, y en rango 0-1, origen en la esquina superior izquierda) a partir de una imagen de calle en primera persona.
- Comprensión de instrucciones de navegación en lenguaje natural (por ejemplo, "Go to the bench on the left").
- Razonamiento visoespacial sobre obstáculos dinámicos, obstáculos estacionarios, terreno semántico y terreno geométrico.
- Consideración de accesibilidad, visibilidad y normas sociales en la planificación de la ruta (categorías evaluadas en NaviTrace, con peor rendimiento en normas sociales).
- Entrada multimodal image-text-to-text mediante la pipeline de Qwen3-VL y PEFT.
- Soporte de tool calling y function calling: no disponible (no se documenta en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo produce una única trayectoria por imagen, sin memoria de fotogramas anteriores).
- Capacidades multilingües: no disponible (no se especifican idiomas; los prompts de entrenamiento están en inglés).
- Modo thinking, visión adicional o audio: no disponible.

## Casos de uso

- Navegación asistida para personas con movilidad reducida: el adaptador puede generar rutas que eviten obstáculos y consideren accesibilidad a partir de una captura de la calle, integrándose en aplicaciones móviles de guiado peatonal que procesan una imagen por paso.
- Robots de reparto de última milla en aceras: dado un objetivo descrito en lenguaje natural ("ve al banco de la izquierda"), el modelo produce una polilínea de puntos que un planificador de bajo nivel puede seguir, útil por su bajo coste de inferencia frente a modelos frontera.
- Evaluación y anotación de datasets de navegación: el modelo puede predecir trayectorias de referencia para comparar con trayectorias humanas o de otros modelos en pipelines de control de calidad de datos de robótica.
- Prototipado rápido de interfaces de navegación por voz: al aceptar instrucciones textuales y devolver coordenadas normalizadas, sirve para construir demos de asistencia peatonal sin necesidad de entrenar un modelo desde cero.
- Investigación en visión-lenguaje-acción: como adaptador LoRA ligero (44M parámetros entrenables) es un punto de partida reproducible para experimentar con ajuste fino sobre Qwen3-VL en tareas de planificación espacial.
- Simulación y mundos sintéticos: entrenado con escenas Blender, encaja en entornos simulados de conducción o robótica donde las imágenes de entrada tienen un estilo de render similar, y permite iterar con nuevos mundos procedurales.
- Sistemas de ayuda a la orientación en interiores o campus: con imágenes de pasillos o plazas y objetivos descritos textualmente, el modelo puede trazar una ruta aproximada para señalización aumentada.

## Benchmarks y rendimiento

Resultados en el split de validación de NaviTrace (500 escenarios de embodiment humano), con el código oficial de puntuación (0 = caminar recto, 100 = trayectoria experta):

| Categoria | Qwen3-VL-8B sin entrenar | Tracely |
|---|---:|---:|
| Global | -28,3 | 36,9 |
| Obstáculo dinámico | -25,0 | 50,5 |
| Obstáculo estacionario | -23,7 | 41,1 |
| Terreno semántico | -24,0 | 39,7 |
| Terreno geométrico | -27,8 | 36,1 |
| Accesibilidad | -34,1 | 32,8 |
| Visibilidad | -27,6 | 30,3 |
| Normas sociales | -59,8 | 24,1 |

Referencias publicadas en el leaderboard de NaviTrace (solo escenarios humanos): experto humano 75,5; Gemini 2.5 Pro 35,4; GPT-5 21,1; Qwen3-VL-235B Thinking 19,3; o3 17,8. Tracely se mide en el split de validación y no se ha enviado al leaderboard, por lo que la comparación es indicativa.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB; el modelo base Qwen3-VL-8B-Instruct debe cargarse aparte en bf16, lo que requiere aproximadamente 16 GB de VRAM solo para los pesos, más memoria para activaciones e imágenes (estimación orientativa; no se documenta cifra oficial).
- GPU recomendadas: A100 80 GB (usada en entrenamiento), H100, y en general GPUs con al menos 24 GB de VRAM para inferencia en bf16.
- En GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16 con margen limitado; en GPUs de 16 GB requeriría cuantización del modelo base (no documentada por el autor).
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`), como se muestra en la model card; vLLM, llama.cpp, Ollama o TGI no se documentan para este adaptador.
- Latencia y throughput: no disponibles. La generación se limita a 256 tokens nuevos con decodificación determinista (`do_sample=False`) y las imágenes deben redimensionarse a 896 px en el lado mayor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NaviTrace (humano, global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tracely (este) | 8B base + 44M LoRA | No disponible | 36,9 (validación) | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen3-VL-8B-Instruct sin entrenar | 8B | No disponible | -28,3 (validación) | Apache 2.0 | Hugging Face |
| Gemini 2.5 Pro | No disponible | No disponible | 35,4 (leaderboard) | Propietaria | API de Google |
| GPT-5 | No disponible | No disponible | 21,1 (leaderboard) | Propietaria | API de OpenAI |
| Qwen3-VL-235B Thinking | 235B | No disponible | 19,3 (leaderboard) | Apache 2.0 | Hugging Face |

La comparación con los modelos frontera es indicativa: Tracely se evalúa en el split de validación y los demás en el leaderboard oficial. Los parámetros y contextos de Gemini 2.5 Pro y GPT-5 no son públicos.

## Limitaciones y advertencias

- Solo embodiment humano: el prompt acepta otros embodiments, pero el adaptador no se entrenó con ellos y su rendimiento en esos casos es incierto.
- Entrenado exclusivamente con escenas renderizadas en Blender con personas simples y tráfico estático; la brecha con fotografías reales no se ha medido y el dominio de aplicación queda restringido a entornos de estilo similar.
- Normas sociales es la categoría más débil (24,1 frente a 50,5 en obstáculos dinámicos), lo que indica dificultad con interacciones sociales y peatonales complejas.
- Entrada de una sola imagen, sin memoria de fotogramas anteriores: no sirve para seguimiento continuo de vídeo sin un componente externo.
- Riesgo de alucinación de trayectorias: al ser un modelo generativo, puede producir puntos incoherentes o fuera de la imagen en escenarios fuera de distribución.
- Idiomas soportados no documentados; los prompts de entrenamiento están en inglés, por lo que el rendimiento con instrucciones en castellano no está validado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct debe cumplir también su propia licencia; conviene revisar ambas.
- No se ha enviado al leaderboard de NaviTrace, por lo que las comparaciones con modelos frontera no están verificadas de forma independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahd03/tracely
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ahd03/vln-synthetic-streets
- Benchmark NaviTrace: https://huggingface.co/datasets/leggedrobotics/navitrace
- Repositorio del proyecto (prompts y script de predicción): https://github.com/ahedmousa1-crypto/vlm-navigation
- Paper de NaviTrace (Windecker et al., 2025): https://arxiv.org/abs/2510.26909
