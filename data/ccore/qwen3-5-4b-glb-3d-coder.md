# ccore/Qwen3.5-4B-GLB-3D-Coder

## Resumen

CCORE GLB-3D-Coder es un modelo de lenguaje especializado de 4B parámetros desarrollado por el proyecto CCORE (usuario `ccore`) mediante fine-tuning del modelo base Qwen/Qwen3.5-4B. Su función concreta es transformar descripciones textuales de activos 3D de estilo low-poly en páginas HTML/JavaScript completas basadas en Three.js, con visor de previsualización y botón de exportación a GLB, un formato estándar compatible con Godot y otros editores 3D.

El modelo resuelve un problema muy específico del desarrollo de videojuegos y prototipado web: generar geometría procedural editable sin necesidad de un artista 3D, partiendo únicamente de un prompt en lenguaje natural. Está entrenado sobre un dataset propio publicado por el autor (ccore/ThreeJS-3D-GLB-Assets), compuesto por 3.918 ejemplos validados y renderizados en 40 dominios, lo que le permite cubrir personajes, mobiliario, arquitectura y entornos.

Con 4.539.265.536 parámetros reales según los pesos safetensors, el modelo se distribuye bajo licencia Apache 2.0 en formatos safetensors y GGUF (Q4_K_M, Q8_0), lo que facilita su despliegue local en GPU de consumo. Su relevancia actual radica en la creciente demanda de pipelines generativos para game jams, prototipado rápido y creación de contenido asistida, donde un modelo pequeño y especializado puede superar a modelos generalistas mucho mayores en una tarea vertical concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (family Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parámetros totales | 4.539.265.536 (4,54B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Safetensors (pesos originales), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |
| Modelo base | Qwen/Qwen3.5-4B (finetune) |
| Dataset de entrenamiento | ccore/ThreeJS-3D-GLB-Assets (3.918 ejemplos, 40 dominios) |
| Tamaño del repositorio | 47,0 GB |
| Descargas | 61.511 |
| Likes | 447 |
| Fecha de publicación | 5 de noviembre de 2026 (según model card) |
| Endpoints compatibles | Sí (`endpoints_compatible`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-4B, un transformer decoder-only de 4B parámetros, y se ha ajustado mediante fine-tuning supervisado (SFT) sobre un corpus propio de pares prompt → código HTML/Three.js con exportación GLB. La model card no detalla hiperparámetros, número de tokens de entrenamiento, ni si se aplicó RLHF, DPO o preferencias posteriores al SFT; estos datos figuran como no disponibles.

La innovación técnica principal no reside en la arquitectura —heredada del modelo base— sino en la naturaleza y validación del dataset: 3.918 ejemplos probados y renderizados en 40 dominios, con exportaciones GLB verificadas. Esto implica que el corpus no es una colección sintética sin filtro, sino ejemplos ejecutados y validados, lo que reduce la tasa de código inválido en la salida. El modelo produce artefactos autocontenidos (una página HTML/JS con Three.js, visor y botón de exportación GLB), un formato de salida poco habitual que lo distingue de los asistentes de código generalistas. No se han publicado detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de código Three.js completo: produce páginas HTML/JavaScript funcionales con escena 3D, cámara, luces y controles.
- Modelado procedural de activos low-poly: personajes, props, edificios y entornos descritos mediante prompts en lenguaje natural.
- Exportación a GLB integrada: el código generado incluye botón y lógica de exportación a glTF Binary.
- Especialización por dominio: cobertura de 40 dominios (personajes, arquitectura, mobiliario, escenarios naturales, etc.).
- Generación de escenas compuestas: capacidad demostrada de crear entornos con múltiples objetos y relaciones espaciales.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y agentes: no disponible explícitamente; la model card menciona el uso del modelo dentro de un harness de orquestación, pero no confirma soporte nativo.
- Capacidades multilingües: limitadas al inglés (`en`).
- Modo de razonamiento extendido (`thinking`), visión o audio: no disponible en la información proporcionada.
- Compatibilidad de endpoints: sí, según el tag `endpoints_compatible`.

## Casos de uso

- Prototipado rápido de assets en game jams: un equipo sin artista 3D puede describir un personaje o prop en texto y obtener una escena Three.js editable con exportación GLB en segundos, lista para importar en Godot.
- Generación de props para entornos low-poly: muebles, farolas, cofres o vehículos generados de forma procedural a partir de una descripción; el GLB resultante se incorpora directamente al pipeline de assets del juego.
- Construcción de escenarios de juego web: combinando varias generaciones (suelo, estructuras, vegetación) se compone una escena jugable en el navegador sin inferencia en tiempo de ejecución, como demuestra el showcase RIFTWARD.
- Generación de personajes estilizados: la model card incluye ejemplos validados (guardián del faro con armadura de coral, ingeniero de rescate de ferrocarril magnético) que ilustran la fidelidad del modelo ante descripciones con detalles mecánicos.
- Creación de contenido para prototipos de realidad virtual o web: los HTML exportables con Three.js se integran en demos WebXR sin conversión adicional.
- Pipeline de generación de assets integrado en agentes de código: el modelo puede utilizarse como herramienta de generación dentro de un harness mayor que orqueste la producción de una escena completa, tal como se describe en la documentación del proyecto RIFTWARD.
- Educación y aprendizaje de Three.js: la salida sirve como ejemplo ejecutable de código Three.js con geometría, materiales y exportación GLB para estudiantes que estudian gráficos 3D en web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye comparaciones visuales cualitativas (capturas de escenas generadas por el modelo frente a DeepSeek V4.1 Flash 1017 sobre los mismos prompts), pero no aporta métricas numéricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de calidad 3D.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, entre 3 y 4 GB; en Q8_0, entre 5 y 6 GB; en safetensors FP16, en torno a 9 GB (estimaciones estándar para 4,5B parámetros, no publicadas por el autor).
- GPU recomendadas: para FP16, A100 40GB, H100 o RTX 4090 (24 GB); para cuantizaciones Q4/Q8, cualquier GPU consumer con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4070).
- Cabe en GPU de consumo: sí, en todas las cuantizaciones distribuidas; la versión Q4_K_M es adecuada para portátiles con GPU de 6 GB.
- Opciones de despliegue: llama.cpp, LM Studio (la model card menciona expresamente LM Studio), Ollama, vLLM y TGI mediante los pesos safetensors; el tag `endpoints_compatible` facilita el despliegue en Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño en disco: el repositorio completo ocupa 47,0 GB (incluye todas las cuantizaciones y pesos originales).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CCORE GLB-3D-Coder 4B | 4,54B | No disponible | Three.js / GLB / 3D low-poly | Apache 2.0 | HF (safetensors + GGUF) |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible | Propósito general | Según modelo base | HF |
| DeepSeek V4.1 Flash 1017 | No disponible | No disponible | Propósito general | No disponible | No disponible |

La comparación cuantitativa con alternativas de la misma categoría (modelos especializados en generación de código 3D) no es posible con la información disponible, ya que no se han identificado otros modelos públicos centrados en la generación de escenas Three.js exportables a GLB. Frente al modelo base Qwen3.5-4B, la diferencia es de especialización y no de escala: el fine-tuning sobre 3.918 ejemplos validados prioriza la corrección del código Three.js y la estructura de exportación GLB sobre capacidades generalistas. La model card compara cualitativamente con DeepSeek V4.1 Flash 1017 en escenas como "coral-armored lighthouse keeper" o "frozen goblin watch camp", pero sin métricas objetivas.

## Limitaciones y advertencias

- Alcance restringido: el modelo está entrenado exclusivamente para código Three.js y exportación GLB; su rendimiento en otras tareas de código o lenguaje general será inferior al del modelo base Qwen3.5-4B.
- Idioma: solo inglés; los prompts en castellano u otros idiomas pueden degradar la calidad de la salida.
- Riesgo de alucinación de API: puede generar llamadas a APIs de Three.js inexistentes o propiedades de materiales incorrectas, aunque el dataset validado reduce esta probabilidad.
- Dependencia de validación posterior: la model card recomienda abrir la página generada e inspeccionar el resultado; en producción se necesita un paso de renderizado y validación GLB, como el harness usado en RIFTWARD.
- Licencia Apache 2.0: permite uso comercial sin restricciones de atribución obligatoria más allá de las condiciones estándar, pero debe verificarse la licencia del modelo base Qwen3.5-4B para cumplimiento completo.
- Actualización de pesos: la model card advierte explícitamente que quienes descargaron el modelo antes del 5 de noviembre de 2026 deben borrar los archivos antiguos y volver a descargarlos, ya que los nombres de los GGUF no cambiaron; cargar pesos obsoletos puede producir resultados degradados.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto: longitud de contexto no publicada; puede ser insuficiente para descripciones de escenas muy extensas o para mantener conversaciones multi-turno largas.
- Sin soporte documentado de tool calling ni de agentes nativos: su uso como herramienta en un pipeline requiere envoltorio externo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder)
- [Dataset de entrenamiento: ccore/ThreeJS-3D-GLB-Assets](https://huggingface.co/datasets/ccore/ThreeJS-3D-GLB-Assets)
- [Demo jugable RIFTWARD en Hugging Face Spaces](https://huggingface.co/spaces/ccore/RIFTWARD)
- [Starter prompt para agentes de código (RIFTWARD)](https://huggingface.co/spaces/ccore/RIFTWARD/blob/main/agent-starter-prompt.txt)
- [Demo de RPG 3D de Naoki Kishida](https://kishida.github.io/webdemos/rpg-3d-glb/)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
