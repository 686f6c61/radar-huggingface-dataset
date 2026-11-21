# nikolaus714/Jev-Vision-2B-GGUF

## Resumen

Jev-Vision-2B es un modelo multimodal de 1.881.825.088 parámetros (aproximadamente 1.88 mil millones) desarrollado por IntelligenceLab como un "SystemOne Decision Model", es decir, un modelo especializado en tomar decisiones tipadas sobre imágenes y texto en lugar de generar respuestas libres. Está afinado a partir de Qwen3.5-2B de Qwen y su tarea principal es seleccionar una opción entre un conjunto de candidatos etiquetados (A, B, C...) dado un contexto o estado y una pregunta, lo que elimina la necesidad de parsear explicaciones en lenguaje natural para determinar la acción elegida.

El repositorio que nos ocupa, nikolaus714/Jev-Vision-2B-GGUF, es una conversión y cuantización comunitaria del checkpoint original en BF16 de Transformers, publicada para inferencia local con Ollama y llama.cpp. Incluye tres variantes del modelo de lenguaje (BF16, Q8_0 y Q4_K_M) más un proyector visual independiente en BF16 que debe cargarse junto al GGUF cuantizado para poder procesar imágenes.

Su relevancia actual radica en que ofrece un flujo de decisión estructurado y ligero (1.19 GiB en Q4_K_M) que cabe en GPUs de consumo y permite integrar toma de decisiones visual en entornos locales sin depender de APIs externas, algo útil en robótica, automatización de GUI y tareas de selección sobre imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivado de Qwen3.5-2B) con proyector visual; detalles completos no disponibles |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (modelo de lenguaje); proyector visual en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base IntelligenceLab/Jev-Vision-2B es un fine-tune multimodal de Qwen3.5-2B orientado a la toma de decisiones. La información disponible no detalla la arquitectura interna más allá de su naturaleza transformer con un proyector visual separado (mmproj) que acompaña al modelo de lenguaje en los GGUF. El proyector se mantiene en BF16 incluso cuando el modelo de lenguaje se cuantiza, lo que indica que la cuantización solo afecta al componente lingüístico.

Respecto al entrenamiento, la model card upstream reporta resultados sobre un conjunto interno de validación de 65.989 registros y advierte de que las filas de test de BEV y las derivadas de Mind2Web se incluyeron en el entrenamiento, por lo que no deben usarse para afirmaciones de generalización no contaminada. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO. La innovación destacable es el formato de decisión tipada: el modelo elige entre etiquetas temporales (A, B, C...) que el llamante mapea de vuelta a las opciones semánticas, y soporta formas de decisión de elección, sí/no (`noul`) y puntuación ordenada.

## Capacidades

- Toma de decisiones tipadas sobre imágenes y texto: recibe un estado o contexto (cadena, objeto o array), una pregunta y entre 2 y 26 opciones candidatas, y devuelve una etiqueta de opción.
- Soporte de cero a cuatro imágenes por consulta; varias imágenes pueden representar una secuencia cronológica.
- Formas de decisión: elección única, sí/no (`noul`) y puntuación ordenada por niveles.
- Aplicable a GUI, visual question answering, robótica y fotogramas de vídeo, juegos, tareas espaciales y decisiones solo de texto.
- Capacidad de razonamiento visual para evaluar evidencia en la imagen y el contexto.
- Soporte de plantilla de chat con etiquetas `<|im_start|>`/`<|im_end|>` y bloque `<think>`.
- Inferencia multimodal local mediante llama.cpp y Ollama con proyector visual.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Automatización de interfaces gráficas (GUI): el modelo puede recibir una captura de pantalla y un contexto de estado para seleccionar la siguiente acción entre opciones declaradas, lo que encaja en pipelines de agentes que necesitan decisiones deterministas y parseables.
- Robótica basada en visión: con hasta cuatro imágenes en secuencia, puede decidir entre opciones de movimiento o manipulación a partir de fotogramas, útil en bucles de control donde la salida debe ser una etiqueta concreta.
- Visual question answering con selección controlada: en lugar de generar texto libre, responde eligiendo entre opciones predefinidas, lo que facilita la validación automática de respuestas en sistemas de evaluación.
- Verificación de escenas industriales: el smoke test del publicador con escenas de almacén (furgoneta junto a muelle, carretilla con caja, operario con chaleco) sugiere uso en inspección visual y control de seguridad con decisiones sí/no.
- Clasificación y selección en juegos o entornos simulados: permite elegir acciones entre un conjunto acotado de opciones, con la posibilidad de barajar el orden de candidatos para reducir el sesgo de posición.
- Decisiones solo de texto: sin cargar el proyector visual, el modelo puede usarse para selección entre opciones en flujos de texto, como enrutamiento de consultas o selección de respuestas en un chatbot.
- Evaluación de tareas espaciales: con contexto estructurado (objeto o array) puede decidir sobre relaciones espaciales entre elementos de una imagen.

## Benchmarks y rendimiento

Resultados reportados por el modelo upstream (BF16) sobre un conjunto interno de validación de 65.989 registros. No son evaluaciones independientes de estas cuantizaciones GGUF.

| Metrica | Valor |
|---|---|
| Precisión global | 92,61 % |
| Precisión macro por familia | 87,36 % |
| NLL condicional | 0,1963 |
| ECE | 1,14 % |
| Precisión GUI | 95,54 % |
| Precisión VQA | 92,62 % |
| Precisión robótica | 92,67 % |
| Precisión espacial | 91,64 % |
| Precisión juegos | 85,10 % |
| Precisión texto | 66,57 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M requiere aproximadamente 1,19 GiB para el modelo de lenguaje más 0,63 GiB del proyector visual; Q8_0 aproximadamente 1,88 GiB más 0,63 GiB; BF16 aproximadamente 3,52 GiB más 0,63 GiB.
- GPU recomendadas: el publicador verificó el funcionamiento en una NVIDIA RTX 3050 con 4 GB de VRAM y 64 GB de RAM de sistema, con el cliente en WSL. GPUs de gama alta (A100, H100, RTX 4090) no se han documentado en la información disponible.
- Cabe en GPU de consumo: sí, al menos en una RTX 3050 de 4 GB con Q4_K_M y Q8_0; el BF16 podría requerir más margen.
- Opciones de despliegue: Ollama (probado con la versión 0.40.13 y el endpoint `/v1/systemone`) y llama.cpp con soporte multimodal (probado con `llama-cli` y `--mmproj`). vLLM y TGI no se mencionan.
- Latencia y throughput: no disponibles; el smoke test no midió utilización de GPU, offload ni carga concurrente del host.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la información proporcionada. La comparación con alternativas de la misma categoría (modelos multimodales de ~2B para decisión visual) no está disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jev-Vision-2B | 1.881.825.088 | no disponible | no disponible | GGUF en HF, Ollama, llama.cpp |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado y etiquetado únicamente para inglés; el rendimiento en otros idiomas no está documentado.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial; debe consultarse el repositorio upstream.
- Los resultados de benchmarks son internos y del modelo upstream en BF16; la cuantización puede afectar a la precisión y a la calibración, por lo que se recomienda evaluar el archivo elegido con datos representativos del caso de uso.
- Las filas de test de BEV y las derivadas de Mind2Web se incluyeron en el entrenamiento del modelo upstream, por lo que no sirven para afirmaciones de generalización no contaminada.
- La precisión en la familia de texto es notablemente inferior (66,57 %) que en las familias visuales (GUI 95,54 %, robótica 92,67 %).
- Riesgo de sesgo de posición en la selección de opciones; el autor recomienda barajar el orden de candidatos y revertir el mapeo.
- Para decisiones de un solo forward, el autor recomienda mantener el modo thinking desactivado.
- El soporte de imágenes depende de que la build de llama.cpp u Ollama soporte la arquitectura y el proyector multimodal; puede fallar en versiones no actualizadas.
- Es una conversión comunitaria, no el checkpoint original; para pesos originales y detalles completos de entrenamiento debe usarse el repositorio upstream.
- No se han documentado sesgos específicos ni tasas de alucinación en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nikolaus714/Jev-Vision-2B-GGUF
- Modelo base (upstream): https://huggingface.co/IntelligenceLab/Jev-Vision-2B
- Modelo Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
