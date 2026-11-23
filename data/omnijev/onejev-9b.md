# OmniJev/OneJev-9B

## Resumen

OneJev-9B es un modelo multimodal de decisión desarrollado por OmniJev, un fine-tune completo de Qwen/Qwen3.5-9B. Su propuesta no es la generación de texto libre, sino la evaluación calibrada de opciones: recibe un estado (texto, captura de pantalla, foto o vídeo) junto con una serie de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción posible. Está pensado, por tanto, como el componente "System One" de un agente: la pieza rápida que decide el siguiente paso sin recurrir a razonamiento extendido.

El modelo se ha entrenado sobre 99.193 preguntas extraídas de ejecuciones reales de agentes, vídeos e imágenes, lo que lo orienta a tareas de automatización de interfaz gráfica (GUI agents), control de calidad perceptual y clasificación multimodal. Con 9.409.813.744 parámetros y pesos en safetensors de 18,8 GB, se sitúa en la gama media de la familia OneJev, que incluye variantes de 0,8B, 4B, 9B y 27B (esta última también en FP8).

Su relevancia actual radica en dos factores: la latencia (81 ms para una pregunta sobre una captura de 1280x720 en una H200, y 13,1 ms por pregunta cuando se envían diez en una misma petición) y la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. No obstante, la información pública disponible sobre idiomas, cuantizaciones oficiales y benchmarks detallados es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), fine-tune completo de Qwen/Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 disponible mediante build de terceros (mradermacher/OneJev-9B-GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en build de terceros |

## Arquitectura y entrenamiento

OneJev-9B parte de Qwen/Qwen3.5-9B y se somete a un fine-tune completo (no LoRA ni adaptadores) sobre el dataset OmniJev/OneJev-Data. El modelo conserva la torre visual del modelo base para procesar imágenes y vídeo, y se especializa en una interfaz de salida distinta a la generación autoregresiva convencional: recibe preguntas tipadas (por ejemplo, `Noul` para una proposición booleana o `Choice` para una elección entre opciones con descripción) y emite probabilidades calibradas para cada opción en un solo paso hacia delante.

El entrenamiento se realizó sobre 99.193 preguntas procedentes de ejecuciones reales de agentes, vídeos e imágenes, lo que introduce datos de interacción de agentes sobre interfaces gráficas, no solo pares imagen-texto genéricos. La model card no detalla el número de tokens, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco especifica innovaciones como decodificación especulativa o atención lineal. La calibración de las probabilidades de salida es el rasgo técnico diferencial declarado por el autor.

## Capacidades

- Evaluación de decisiones con probabilidad calibrada: devuelve una probabilidad por opción en un único forward pass, en lugar de texto generado.
- Preguntas tipadas: soporta proposiciones booleanas (`Noul`) y elecciones entre opciones descritas (`Choice`).
- Entrada multimodal: capturas de pantalla, fotografías, vídeo y texto plano.
- Razonamiento multi-pregunta en una sola petición: puede responder varias preguntas sobre el mismo estado (10 preguntas en 131 ms en el benchmark del autor).
- Orientación a agentes GUI: entrenado con datos de ejecuciones reales de agentes sobre interfaces.
- Servidor compatible con la System One API de TypeSafe, con un campo `media` adicional para imágenes y vídeo.
- Ejecución sin PyTorch mediante llama.cpp con el build GGUF (imágenes soportadas; vídeo requiere el servidor PyTorch).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible; el modelo se posiciona explícitamente como "System One", es decir, decisión rápida sin cadena de razonamiento.

## Casos de uso

- Agentes de automatización de interfaz gráfica: el modelo recibe una captura de pantalla y el estado de la tarea, y devuelve la probabilidad de que la tarea esté completada o de qué acción ejecutar a continuación (clic, parada). Es su caso de uso principal, dado el entrenamiento sobre ejecuciones reales de agentes.
- Verificación de pasos en pipelines de agentes: actuar como comprobador rápido ("¿se ha pagado la factura?") entre pasos de un agente más grande, con latencia de decenas de milisegundos que permite insertarlo en bucles cerrados.
- Control de calidad visual automatizado: evaluar capturas o fotos contra criterios tipados (presencia de elementos, estados correctos) con probabilidad calibrada en lugar de respuestas binarias frágiles.
- Triaje y enrutamiento de tickets con imagen adjunta: clasificar una captura de error o de pantalla en categorías predefinidas y derivar al flujo adecuado, aprovechando el procesamiento multi-pregunta en una sola petición.
- Análisis de vídeo para decisión: con el servidor PyTorch, evaluar fotogramas o clips contra preguntas concretas, útil en monitorización o verificación de procesos grabados.
- Evaluación de modelos y anotación asistida: usar las probabilidades calibradas como señal blanda para comparar alternativas, priorizar revisiones humanas o construir datasets de preferencias.
- Despliegue en entornos sin PyTorch: con el GGUF Q8_0 y llama.cpp, integrar la decisión multimodal en infraestructura ligera, aceptando la limitación de no procesar vídeo.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados (fichero `assets/results.svg`) que compara OneJev-9B con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking sobre un test set de OneJev con preguntas de los mismos tipos que el entrenamiento pero no vistas durante el entrenamiento. Los valores numéricos no están disponibles en el texto proporcionado (solo se referencia la imagen), por lo que no se reproducen aquí.

Datos de latencia declarados por el autor (una H200, captura de 1280x720):

| Escenario | Latencia |
|---|---|
| 1 pregunta por petición | 81 ms |
| 10 preguntas en una petición | 131 ms (13,1 ms por pregunta) |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): en torno a 19 GB solo para pesos, más overhead de activaciones y del codificador visual; se recomienda 24 GB o más.
- GPU recomendadas: H200 (medición oficial del autor), A100 40/80 GB, H100; en consumer, RTX 4090 (24 GB) es el mínimo razonable para BF16.
- GGUF Q8_0: reduce el peso de los pesos a aproximadamente la mitad del repo (el repo completo es de 18,8 GB); permite ejecución en GPUs consumer de 16-24 GB según configuración de llama.cpp.
- Opciones de despliegue: servidor propio `qev serve` (con PyTorch) para imagen y vídeo; `qev serve --gguf mradermacher/OneJev-9B-GGUF:Q8_0` con llama.cpp para imagen sin PyTorch; integración vía `transformers` con la librería `qev`.
- Throughput: 13,1 ms por pregunta cuando se agrupan 10 preguntas en una petición (H200, 1280x720), según el autor.
- vLLM, TGI u Ollama: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Pesos | Licencia | Notas |
|---|---|---:|---:|---|---|
| OneJev-9B | Qwen3.5-9B | 9,4B | 18,8 GB | Apache 2.0 | Modelo de decisión multimodal con probabilidades calibradas |
| OneJev-4B | Qwen3.5-4B | no disponible | 10,4 GB | Apache 2.0 (según familia) | Misma tarea, menor tamaño |
| OneJev-27B | Qwen3.8-27B | no disponible | 54,7 GB | Apache 2.0 (según familia) | Versión grande; existe variante FP8 de 30,4 GB |
| Qwen3.8-27B thinking | — | 27B (aprox.) | no disponible | no disponible | Usado como referencia en la tabla de resultados del autor; enfoque de razonamiento extendido |

La comparación con modelos de propósito general de tamaño similar (por ejemplo, el propio Qwen3.5-9B base) no está disponible en la información proporcionada, ya que OneJev no es un modelo generativo y las métricas no son directamente comparables.

## Limitaciones y advertencias

- No es un modelo generativo de texto libre: su interfaz está diseñada para preguntas tipadas y devuelve probabilidades, no respuestas en lenguaje natural.
- Idiomas soportados no declarados: no hay información sobre el rendimiento fuera del inglés ni sobre cobertura multilingüe.
- Longitud de contexto no disponible: no se puede planificar el uso con estados o historiales largos sin verificación empírica.
- Calibración dependiente del dominio: las probabilidades están calibradas sobre los tipos de pregunta del dataset de entrenamiento; su fiabilidad fuera de ese dominio (GUI, vídeo, agentes) no está garantizada.
- Riesgo de alucinación en la señal de decisión: al emitir probabilidades, un exceso de confianza en opciones incorrectas puede propagarse silenciosamente en un pipeline de agente; se recomienda umbral de abstención y validación.
- Vídeo solo con el servidor PyTorch: el build GGUF de terceros no procesa vídeo, lo que limita despliegues ligeros.
- Dependencia de un ecosistema propio (`qev`, System One API de TypeSafe) para el despliegue completo; la integración con vLLM, TGI u Ollama no está documentada.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; al derivar de Qwen3.5-9B, hereda los del modelo base, no detallados aquí.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y del dataset OmniJev/OneJev-Data.
- Métricas de benchmarks no disponibles en texto: la tabla de resultados está en una imagen, por lo que no se pueden verificar numéricamente las afirmaciones comparativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev-9B
- Colección OneJev: https://huggingface.co/collections/OmniJev/onejev
- Dataset OneJev-Data: https://huggingface.co/datasets/OmniJev/OneJev-Data
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/BradNLP/OneJev
- Build GGUF de terceros: https://huggingface.co/mradermacher/OneJev-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 0.8B: https://huggingface.co/OmniJev/OneJev-0.8B
- Variante 4B: https://huggingface.co/OmniJev/OneJev-4B
- Variante 27B: https://huggingface.co/OmniJev/OneJev-27B
- Variante 27B-FP8: https://huggingface.co/OmniJev/OneJev-27B-FP8
