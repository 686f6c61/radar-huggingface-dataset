# AbstractPhil/anima-eyes-1b-think-symbolic-image-full

## Resumen

Anima Eyes 1B v1.2 es un ajuste fino completo (full fine-tune) de un modelo vision-lenguaje construido a partir de dos modelos: OpenGVLab/InternVL3_5-1B-HF y Qwen/Qwen3-0.6B-Base. Lo desarrolla AbstractPhil y su proposito es ocupar la ranura de codificador de texto de Anima, un modelo texto-a-imagen cuyo codificador de texto es Qwen3-0.6B-Base. El modelo mira una imagen y produce una lectura estructurada: una cadena corta de pensamientos en lenguaje llano, un paso nombrado por linea, seguida de formulaciones (caption, prompt, etiquetas, critica por profundidad) y de preguntas que un observador cuidadoso aun se haria, cada una con su respuesta y lo que la sustenta.

La arquitectura es un hibrido de dos modelos: InternVL3.5-1B aporta la torre de vision, el proyector, la tabla de palabras y las capas de lenguaje 0 a 23; Qwen3-0.6B-Base aporta las capas 24 a 27 y la normalizacion final, y su tabla de palabras actua como cabeza de salida. El objetivo es que los estados finales del modelo, que es lo que Anima lee de su codificador de texto, procedan de las propias capas superiores de Anima y se mantengan proximos a los de su codificador original.

El modelo tiene 1.060.897.792 parametros y un repositorio de 3,3 GB en formato safetensors. Esta pensado para generacion de texto a partir de imagen (image-text-to-text) con razonamiento en cadena, orientado a fotografia y descripcion de imagenes. Su relevancia actual reside en el enfoque de preservar la compatibilidad con el codificador de texto de un modelo generativo concreto mediante congelacion de capas y una segunda funcion de perdida que ancla las elecciones de siguiente palabra al modelo de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje hibrida: torre de vision y proyector de InternVL3.5-1B + capas de lenguaje 0-23 de InternVL3.5-1B + capas 24-27 y norm final de Qwen3-0.6B-Base |
| Parametros totales | 1.060.897.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina dos arquitecturas transformer. InternVL3.5-1B aporta la torre de vision, el proyector, la tabla de palabras y las capas de lenguaje 0 a 23; Qwen3-0.6B-Base aporta las capas 24 a 27 y la normalizacion final, y su tabla de palabras se usa como cabeza de salida. La justificacion del autor es que el modelo de lenguaje de InternVL3.5-1B es un Qwen3-0.6B entrenado junto con su codificador de imagen, y sus capas superiores se alejaron del Base durante ese entrenamiento. Sobre 24 prompts de estilo Anima, los estados finales de InternVL3.5-1B coinciden con los del Base en 0,497 (coseno medio, token a token, de estados centrados por el estado medio del Base); reinsertando las cuatro capas superiores y la norm final del Base, la coincidencia sube a 0,805 antes de cualquier entrenamiento.

Durante el entrenamiento, las capas 24 a 27 y la norm final (45 tensores) se congelaron y quedaron identicas bit a bit al archivo del codificador de texto de Anima. Se anadio una segunda funcion de perdida que mantiene las elecciones de siguiente palabra cerca de las del modelo de partida (la construccion de dos modelos antes de entrenar) en peticiones ordinarias. Se entreno con 91.138 filas, las mismas que Lucia 0.8B v1.2: la parte Apache-2.0 de la release 5 del dataset thought-symbolic-image-recaptioned (95.481 filas), menos 3.718 filas de fotografias COCO 2017 bajo otras licencias, 609 filas de imagenes reservadas para evaluacion y 16 filas cuyas imagenes no estan en ningun almacen. Las filas son lecturas de fotografias DOCCI y COCO 2017, de cuadros de la National Gallery of Art y de especificaciones dibujadas, escritas por modelos de OpenAI, Google y DeepSeek y admitidas por revision ciega; 30.250 son lecturas largas. Ninguna fila fue escrita por un modelo Claude ni por modelos del proyecto entrenados con filas de Claude. Se entreno una sola pasada (10.137 pasos). En peticiones ordinarias reservadas, las elecciones de siguiente palabra quedan a 0,096 nats por token del modelo de partida, y de las preguntas y peticiones de texto entre ellas no responde ninguna en la forma de la lectura.

## Capacidades

- Generacion de texto a partir de imagen con razonamiento en cadena: produce pasos nombrados (see, relate, mood) seguidos de formulaciones.
- Descripcion de imagenes (captioning) y generacion de prompts para modelos texto-a-imagen.
- Generacion de etiquetas (tags) y criticas por profundidad.
- Formulacion de preguntas de seguimiento con respuesta y justificacion.
- Especializado en fotografia (DOCCI, COCO 2017) y pintura (National Gallery of Art).
- Capacidad de codificador de texto: sus estados finales estan alineados con los del codificador de Anima (0,948 de coincidencia en 24 prompts no entrenados, frente a 0,805 antes de entrenar).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible explicitamente; el razonamiento en cadena es de un solo turno.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: modo de pensamiento simbolico estructurado; integracion en ComfyUI como codificador de texto de Anima.

## Casos de uso

- Generacion de prompts para Anima: el modelo mira una imagen de referencia y produce un prompt en texto que Anima puede usar para generar imagenes similares, gracias a que sus estados finales estan alineados con el codificador de texto de Anima (0,948 de coincidencia).
- Descripcion automatica de fotografias: genera captions detalladas y etiquetas para catalogos de imagenes, aprovechando su entrenamiento sobre DOCCI y COCO 2017.
- Catalogacion de obras de arte: produce lecturas estructuradas de cuadros de la National Gallery of Art, con pasos de observacion, relacion y tono.
- Generacion de criticas visuales: emite criticas por profundidad sobre una imagen, util en flujos de revision de contenido visual.
- Entrenamiento o ajuste de modelos texto-a-imagen: al compartir espacio de estados con el codificador de Anima, puede servir como codificador alternativo en pipelines de generacion.
- Analisis de especificaciones dibujadas: interpreta dibujos tecnicos y genera lecturas estructuradas (aunque estas filas no incluyen imagen durante el entrenamiento).
- Formulacion de preguntas de verificacion: genera preguntas de seguimiento con respuesta y justificacion, util en sistemas de control de calidad de descripciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de alineacion:

| Metrica | Antes del entrenamiento | Despues del entrenamiento |
|---|---|---|
| Coincidencia de estados finales con el codificador de Anima (24 prompts, coseno medio) | 0,805 | 0,948 |
| Distancia de elecciones de siguiente palabra al modelo de partida (nats/token) | no disponible | 0,096 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.060.897.792 parametros, en fp16 requeriria aproximadamente 2,1 GB solo para pesos, mas el coste de la torre de vision y activaciones.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano (1B), pero no se confirma en la informacion disponible.
- Opciones de despliegue: transformers (libreria indicada); compatible con endpoints. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AbstractPhil/anima-eyes-1b-think-symbolic-image-full | 1.060.897.792 | no disponible | apache-2.0 | Fine-tune hibrido InternVL3.5-1B + Qwen3-0.6B-Base, alineado con Anima |
| OpenGVLab/InternVL3_5-1B-HF | no disponible | no disponible | no disponible | Modelo base de vision-lenguaje |
| Qwen/Qwen3-0.6B-Base | no disponible | no disponible | no disponible | Codificador de texto base de Anima |
| AbstractPhil/qwen3.5-0.8b-think-symbolic-image (Lucia 0.8B v1.2) | no disponible | no disponible | no disponible | Misma receta, tamano cercano |

## Limitaciones y advertencias

- Solo soporta ingles.
- Entrenado exclusivamente con lecturas de fotografias y pinturas; puede degradarse en otros dominios visuales.
- Riesgo de alucinacion: en el ejemplo de la model card, el modelo describe "a single yellow truck" cuando hay al menos dos mas, y confunde pickups con "yellow ambulances".
- Las filas de entrenamiento excluyen imagenes COCO 2017 bajo licencias distintas de Attribution o sin restricciones conocidas; el modelo solo vio esas imagenes.
- No se entreno con filas escritas por modelos Claude ni por modelos del proyecto entrenados con filas de Claude.
- La segunda funcion de perdida ancla las elecciones de siguiente palabra al modelo de partida, lo que puede limitar la creatividad fuera del formato de lectura.
- No hay datos publicos de benchmarks estandar (MMLU, HumanEval, GSM8K), lo que dificulta la comparacion objetiva.
- La licencia apache-2.0 permite uso comercial, pero deben respetarse las licencias de los datos subyacentes (COCO 2017, National Gallery of Art).
- El modelo esta disenado para la ranura de codificador de texto de Anima; su uso fuera de ese contexto no esta validado.

## Enlaces

- Hugging Face: https://huggingface.co/AbstractPhil/anima-eyes-1b-think-symbolic-image-full
- Modelo base InternVL3.5-1B: https://huggingface.co/OpenGVLab/InternVL3_5-1B-HF
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo Anima: https://huggingface.co/circlestone-labs/Anima
- Modelo Lucia 0.8B v1.2: https://huggingface.co/AbstractPhil/qwen3.5-0.8b-think-symbolic-image
- Dataset thought-symbolic-image-recaptioned: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned
- Dataset thought-symbolic-image-captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Imagen de ejemplo COCO 2017: https://cocodataset.org/#explore?id=376084
