# Athekunal/ultrabert-jev-380m-sqrt-softplus

## Resumen

UltraBERT-jev-380m-sqrt-softplus es un modelo de decisión (decision model) construido a partir de UltraBERT-380M de dmis-lab. No genera texto: recibe un estado (uno o varios pasajes de contexto), una pregunta y una lista de opciones, y selecciona una opción en un único forward pass. Cada opción se puntúa a partir de los logits del token de máscara colocado delante de ella, usando la receta de puntuación " yes" menos " no", normalizada mediante raíz cuadrada de softplus dividida por la suma sobre opciones.

El modelo lo publica el usuario Athekunal en Hugging Face y está afinado a partir del trabajo LLM-as-Jev (arXiv:2610.02076). Es relevante para tareas de selección múltiple, clasificación guiada por contexto y evaluación automática de respuestas, porque evita la generación autoregresiva y el coste asociado: una sola pasada del encoder basta para emitir la decisión.

Con 429.966.336 parámetros reales (safetensors) y licencia Apache 2.0, es un encoder compacto orientado a inglés, con un límite de entrada de 10.240 tokens durante el entrenamiento. Su rendimiento declarado es del 73,2 % de precisión media en el split de desarrollo y 71,9 % en el de test sobre 13 conjuntos de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (UltraBERT-380M), cabeza de masked LM para puntuar opciones |
| Parametros totales | 429.966.336 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 10.240 tokens máximo en entrenamiento (no se declara ventana mayor) |
| Tipos de cuantizacion | Pesos publicados en safetensors; el autor recomienda explícitamente fp32 y advierte que bf16 altera los resultados hasta 8 puntos |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer (UltraBERT-380M) con fine-tuning completo para una tarea de selección de opciones. El prompt se construye con un token de máscara delante de cada opción; la puntuación de la opción k se obtiene de los logits del token de máscara correspondiente. La receta de puntuación de este checkpoint concreto es: raíz cuadrada de softplus de (logit " yes" − logit " no"), dividida por la suma de esa cantidad sobre todas las opciones. La decisión final es la opción con mayor puntuación.

El entrenamiento consistió en una época con batch 32 y learning rate 1,5e-5 sobre la mezcla Reason+Long de 13 conjuntos de datos del trabajo LLM-as-Jev, con Nimble añadido. No se documentan fases de RLHF ni DPO; el ajuste es supervisado sobre la tarea de decisión. Los cuatro checkpoints de la familia comparten datos, ajustes y prompt, y difieren únicamente en la función de puntuación y la pérdida (softmax sobre " yes", softmax sobre " yes"−" no", sigmoide normalizada y raíz cuadrada de softplus normalizada).

## Capacidades

- Selección de una opción entre varias dado un estado y una pregunta, en un único forward pass sin generación de texto.
- Clasificación binaria y de múltiples opciones mediante el mismo formato de prompt (máscara delante de cada opción).
- Razonamiento guiado por contexto: el campo `state` admite una lista de pasajes (contratos, hechos, contexto documental) concatenados con línea en blanco.
- Puntuación de opciones individuales (vector de scores s_k) además de la elección final, útil para umbrales o ranking.
- Soporte de entradas largas de hasta 10.240 tokens.
- No soporta tool calling ni function calling, no es un modelo generativo y no expone modo thinking, visión ni audio.

## Casos de uso

- Evaluación automática de respuestas: dado un enunciado y una respuesta candidata, el modelo decide si es correcta comparando opciones "Yes"/"No" con el contexto como estado; es adecuado por su bajo coste (una pasada) frente a un juez generativo.
- Selección múltiple en benchmarks: sustituir un LLM juez por este encoder para puntuar opciones A/B/C/D en conjuntos tipo MMLU, con la ventaja de latencia y coste.
- Verificación de hechos contra documentos: pasar el contrato o el texto fuente como `state` y formular preguntas de sí/no sobre afirmaciones extraídas; el límite de 10.240 tokens permite incluir pasajes extensos.
- Triaje de tickets o incidencias: clasificar un caso descrito en texto largo en una de varias categorías predefinidas, sin generación y con salida determinista.
- Enrutado de consultas en pipelines RAG: decidir a qué índice o herramienta corresponde una consulta entre opciones enumeradas, como paso previo barato a un modelo generativo.
- Anotación asistida de datasets: preetiquetar pares contexto-pregunta-opciones para revisión humana, aprovechando la salida de scores para priorizar casos ambiguos.
- Control de calidad en extracción de datos: comprobar si un campo extraído coincide con el documento de origen mediante preguntas de verificación binaria.

## Benchmarks y rendimiento

| Conjunto | Precision media (13 datasets) |
|---|---|
| Split de desarrollo | 73,2 % |
| Split de test | 71,9 % |
| Seis benchmarks externos (p. ej. MMLU, BoolQ) | aproximadamente 58–60 % |

No se han publicado en la información disponible resultados desglosados por dataset (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: en fp32 (recomendado por el autor), unos 1,7 GB de pesos más activaciones; en la práctica cabe en GPUs con 8 GB o más. En bf16 el peso baja a aproximadamente 0,9 GB, pero el autor advierte de pérdidas de hasta 8 puntos de precisión.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; A100, H100, RTX 4090, RTX 3090 o superiores funcionan sobradamente. También es viable en CPU para volúmenes moderados.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Opciones de despliegue: `transformers` 5.20.2 con `torch` 2.9 (incluyen la clase UltraBERT); no debe usarse `trust_remote_code=True` porque el código remoto del repo base nombra los pesos de forma distinta y quedarían sin cargar. Al ser un encoder de una sola pasada, es compatible con servidores de inferencia tipo TGI o batch en script; no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ultrabert-jev-380m-sqrt-softplus | 429,9 M | 10.240 tokens (entrenamiento) | Decisión sobre opciones, inglés | Apache 2.0 | Hugging Face |
| ultrabert-jev-380m-softmax-yes | 429,9 M (misma base) | 10.240 tokens | Decisión, puntuación con logit " yes" y softmax | Apache 2.0 | Hugging Face |
| ultrabert-jev-380m-softmax-yesno | 429,9 M (misma base) | 10.240 tokens | Decisión, puntuación " yes"−" no" con softmax | Apache 2.0 | Hugging Face |
| ultrabert-jev-380m-sigmoid-norm | 429,9 M (misma base) | 10.240 tokens | Decisión, sigmoide normalizada | Apache 2.0 | Hugging Face |

Los cuatro checkpoints comparten datos, ajustes y prompt; la diferencia está en la función de puntuación y la pérdida. No se dispone de datos para comparar con encoders de decisión de otros autores.

## Limitaciones y advertencias

- Entrenado y evaluado solo en inglés; el rendimiento fuera de ese idioma y de la mezcla de entrenamiento cae a aproximadamente 58–60 % en seis benchmarks externos.
- Entradas limitadas a 10.240 tokens en entrenamiento; textos más largos requieren truncado o troceado.
- El modelo no ofrece justificación de su elección: solo devuelve la opción y los scores.
- Cargar los pesos en bf16 degrada la precisión hasta 8 puntos en documentos largos (caso MuSiQue); es obligatorio usar fp32 para reproducir los números publicados.
- Es imprescindible usar el prompt exacto con los tokens " yes" y " no" y una máscara por opción; un uso estándar de fill-mask no reproduce los resultados.
- No debe pasarse `trust_remote_code=True`: el código remoto del repo base no carga correctamente los pesos.
- Riesgo de sesgo y alucinación no cuantificado en la información disponible; al ser una tarea de selección cerrada, el riesgo de inventar contenido es menor, pero puede elegir opciones incorrectas con alta confianza.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución correspondientes.
- Repo con 0 descargas y 0 likes en el momento de la consulta; sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/Athekunal/ultrabert-jev-380m-sqrt-softplus
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Paper LLM-as-Jev: https://arxiv.org/abs/2610.02076
- Checkpoint softmax-yes: https://huggingface.co/Athekunal/ultrabert-jev-380m-softmax-yes
- Checkpoint softmax-yesno: https://huggingface.co/Athekunal/ultrabert-jev-380m-softmax-yesno
- Checkpoint sigmoid-norm: https://huggingface.co/Athekunal/ultrabert-jev-380m-sigmoid-norm
