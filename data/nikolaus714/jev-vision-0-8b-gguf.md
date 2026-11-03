# nikolaus714/jev-vision-0.8b-GGUF

## Resumen

Jev-Vision-0.8B es un modelo multimodal compacto de tipo "SystemOne Decision Model", desarrollado por IntelligenceLab y fine-tuneado a partir de Qwen3.5-0.8B. En lugar de generar respuestas libres, el modelo recibe un estado o contexto visual junto con una pregunta tipada y un conjunto declarado de opciones (entre 2 y 26), y su tarea es seleccionar la mejor opción. Soporta formas de decisión como elección múltiple, sí/no y puntuaciones ordenadas. El repositorio que nos ocupa, publicado por el usuario nikolaus714, contiene cuantizaciones GGUF del checkpoint original pensadas para inferencia local con Ollama y llama.cpp.

Con 752.393.024 parámetros reales (aproximadamente 0,8B), el modelo se posiciona en la gama ultracompacta de modelos visión-lenguaje, lo que permite ejecutarlo en hardware de consumo. La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer con capacidad multimodal gracias a un proyector visual separado que se distribuye como archivo independiente (mmproj) en formato BF16.

Su relevancia actual radica en el enfoque: no es un chatbot visual generalista, sino un componente de decisión para pipelines de agentes y robótica, donde el controlador necesita elegir entre acciones discretas con puntuaciones normalizadas sobre las etiquetas de respuesta. El repositorio GGUF facilita el despliegue local sin necesidad de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B) con proyector visual separado |
| Parametros totales | 752.393.024 (pesos safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 (modelo de lenguaje); proyector visual en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen, y se le añade capacidad visual mediante un proyector multimodal que transforma las representaciones de imagen en tokens compatibles con el espacio del modelo de lenguaje. El checkpoint original se distribuye en BF16 y este repositorio ofrece tres variantes de cuantización del modelo de lenguaje (Q4_K_M, Q8_0 y BF16) más un único proyector visual compartido en BF16. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica principal es el contrato de decisión "SystemOne": el modelo no genera texto libre, sino que se leen los logits del siguiente token para etiquetas temporales (A, B, C, …), se normalizan únicamente sobre las letras correspondientes a las opciones suministradas y se mapean de vuelta a las opciones semánticas del llamador. El prompt requiere una instrucción de sistema específica, el contexto, la pregunta y las opciones letradas, terminando el prefijo del asistente con `Answer:`. El razonamiento (thinking) debe permanecer desactivado, ya que la decisión se puntúa en un solo paso forward. El autor recomienda barajar las opciones para reducir el sesgo de posición de etiqueta y calibrar la temperatura con datos representativos de la aplicación.

## Capacidades

- Selección entre opciones discretas: elección múltiple, sí/no y puntuaciones ordenadas sobre un conjunto declarado de 2 a 26 opciones.
- Puntuación de decisiones mediante normalización de logits sobre etiquetas temporales (A–Z), con salida de probabilidades relativas a las opciones.
- Comprensión visual: respuesta a preguntas visuales (VQA) y lectura de texto presente en la imagen como evidencia.
- Aplicación a estados de interfaz gráfica (GUI), fotogramas de vídeo y robótica, tareas espaciales, juegos y contexto puramente textual.
- Integración como componente de decisión en pipelines de agentes, donde un controlador externo traduce la opción elegida en una acción.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking: explícitamente desactivado para el flujo de decisión previsto.

## Casos de uso

- Automatización de interfaces gráficas: el modelo recibe una captura de pantalla junto con el estado de la aplicación y una pregunta del tipo "¿qué control debo pulsar?", eligiendo entre los elementos interactivos declarados como opciones. Adecuado por su capacidad de leer texto en imagen y decidir en un solo paso.
- Agentes robóticos con acciones discretas: a partir de un fotograma de cámara y el contexto de la tarea, el modelo selecciona entre acciones predefinidas (avanzar, girar, detenerse) que el controlador ejecuta, gracias a la normalización de probabilidades sobre las opciones.
- Clasificación visual con opciones controladas: etiquetado de imágenes en categorías declaradas dinámicamente, útil cuando el conjunto de clases cambia por petición y no se quiere reentrenar un clasificador.
- Verificación sí/no en pipelines de control de calidad: comprobación de si una imagen cumple un criterio (por ejemplo, si un producto está correctamente orientado), con la probabilidad normalizada como señal de confianza relativa.
- Puntuación ordenada de alternativas: ranking de opciones ordenadas (por ejemplo, severidad de un defecto visual) manteniendo el orden de las opciones, sin reordenarlas, tal como indica el contrato de decisión.
- Decisión de bajo coste en el borde: con la cuantización Q4_K_M (unos 505 MiB), el modelo puede ejecutarse en dispositivos con recursos limitados mediante Ollama o llama.cpp, sirviendo como primer filtro de decisión antes de invocar modelos mayores.
- Enrutamiento de consultas en asistentes: elección entre rutas de conversación o herramientas declaradas a partir del contexto textual, aprovechando el mismo mecanismo de selección entre opciones.

## Benchmarks y rendimiento

La model card del repositorio cita resultados internos del checkpoint BF16 original, no benchmarks independientes ni mediciones de estas cuantizaciones GGUF:

| Metrica | Valor (BF16 upstream, held-out interno) |
|---|---|
| Exactitud global | 91,31 % |
| Exactitud macro por familia | 86,98 % |
| NLL condicional | 0,2251 |
| ECE (error de calibración esperado) | 1,96 % |
| Masa de respuesta sobre opciones | 99,996 % |
| Registros evaluados | 65.989 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni mediciones de precisión o calibración de las variantes GGUF más allá de una prueba de humo independiente con Ollama.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M, 0,8 GB con Q8_0 y 1,4 GB con BF16 para el modelo de lenguaje, más unos 0,2 GB del proyector visual BF16.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o más de VRAM; también es viable en CPU.
- GPU de datacenter (A100, H100) no necesarias, aunque compatibles para despliegues por lotes.
- Opciones de despliegue: Ollama (con Modelfile que incluya el GGUF del modelo y el mmproj) y llama.cpp (por ejemplo, `llama-mtmd-cli -m ... --mmproj ...`). Para el flujo de decisión se requiere una interfaz que exponga los logits del siguiente token.
- Latencia y throughput: no disponibles en la información proporcionada.
- Se requiere una versión de Ollama o llama.cpp compatible con la arquitectura del modelo y el proyector multimodal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Vision-0.8B (este) | 752 M | no disponible | Decisión multimodal entre opciones | no disponible | GGUF en este repo; safetensors en IntelligenceLab |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | LLM texto generalista | no disponible | HuggingFace (Qwen) |
| Alternativas visión-lenguaje de menos de 1B | no disponible | no disponible | VQA / captioning | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: un prompt de chat genérico produce respuestas libres y no implementa el contrato de puntuación SystemOne; para decisiones fiables hay que seguir el prompt estructurado y la normalización por letras.
- Las probabilidades son relativas a las opciones suministradas y no son valores de confianza calibrados de forma inherente; se recomienda calibrar la temperatura con datos de la aplicación.
- Sesgo de posición de etiqueta: el autor recomienda barajar las opciones (salvo en puntuaciones ordenadas) para mitigarlo.
- Las cuantizaciones Q4_K_M y Q8_0 pueden introducir desplazamientos de calidad o de puntuación respecto al BF16 original.
- Los resultados de 91,31 % de exactitud son internos del autor y no verificados de forma independiente; no se extrapolan a estas cuantizaciones.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar el repositorio upstream.
- Idiomas soportados no disponibles; el comportamiento multilingüe no está documentado.
- Longitud de contexto no disponible, lo que limita la planificación de casos con contextos largos.
- Requiere builds compatibles de Ollama o llama.cpp con soporte para la arquitectura y el proyector; versiones antiguas pueden fallar.
- Riesgo de alucinación en la lectura de texto en imagen: el propio prompt advierte que el texto de la imagen es evidencia, no instrucciones, para mitigar inyección de prompt visual.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nikolaus714/jev-vision-0.8b-GGUF
- Modelo base upstream: https://huggingface.co/IntelligenceLab/Jev-Vision-0.8B
- Sección de inferencia directa del modelo base: https://huggingface.co/IntelligenceLab/Jev-Vision-0.8B#direct-inference
- Sección de resultados del modelo base: https://huggingface.co/IntelligenceLab/Jev-Vision-0.8B#results
- Modelo Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
