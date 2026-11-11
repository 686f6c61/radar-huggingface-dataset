# Neural-Labs/tiny-llm

## Resumen

Tiny LLM es un modelo de lenguaje de tipo GPT decoder-only, a nivel de caracter, desarrollado por Neural-Labs como proyecto educativo. Se entrenó desde cero en aproximadamente 15 minutos sobre la CPU de un portátil, con un total de 824.120 parámetros. No es un asistente funcional: su único dominio es un conjunto cerrado de saludos en inglés (hello, how are you, what is your name, thanks, goodbye y variantes similares).

El modelo emplea una arquitectura transformer estándar con 4 capas, 4 cabezas de atención, anchura de embedding de 128 y una longitud de contexto de 128 caracteres. El vocabulario se compone de 56 caracteres, correspondientes a los caracteres distintos presentes en el texto de entrenamiento. Su relevancia es puramente didáctica: sirve como ejemplo mínimo, reproducible y auditable de cómo se construye y entrena un modelo GPT desde cero.

No debe confundirse con un modelo de propósito general. Cualquier mensaje que no sea un saludo recibe una respuesta con formato de saludo sin relación con la pregunta. Su inclusión en un catálogo de modelos responde a su valor como material de aprendizaje, no a su utilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-style), a nivel de caracter |
| Parametros totales | 824.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 caracteres |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` en punto flotante; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | `model.pt` (checkpoint de PyTorch con `state_dict`, `chars` y `config`); código en `model.py` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 4 capas, 4 cabezas de atención, anchura de embedding de 128 y un MLP por bloque de 128 → 512 → 128 con activación GELU. Cada bloque aplica pre-layer-norm seguido de self-attention causal y el MLP. Tanto los embeddings de token como los de posición son aprendidos. La tokenización es a nivel de carácter, con un vocabulario de 56 caracteres extraídos del corpus de entrenamiento.

El entrenamiento se realizó sobre 12.000 intercambios generados con el formato `User: <mensaje>\nBot: <respuesta>`, construidos a partir de una lista corta de frases de saludo escritas a mano. No se usó ningún dataset externo. Se ejecutaron 4.000 pasos con batch size 32, optimizador AdamW, learning rate 1e-3 con decaimiento coseno, sobre una CPU de 4 núcleos, durante 14,5 minutos. La pérdida final fue de 0,165 en entrenamiento y 0,170 en validación. No se documenta RLHF, DPO ni ninguna técnica de alineación adicional.

## Capacidades

- Generación de texto a nivel de carácter, un carácter por paso de decodificación.
- Respuesta a un conjunto cerrado de saludos en inglés: hello, how are you, what is your name, thanks, goodbye y variantes similares.
- Formato de prompt fijo: `User: <mensaje>\nBot:`; la generación se detiene en el primer salto de línea.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües: los caracteres fuera del vocabulario de entrenamiento se descartan (incluye la mayoría de letras no inglesas y emojis).
- Sin memoria conversacional: cada respuesta ve únicamente el último mensaje.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Docencia de fundamentos de LLM: el modelo, con 60 líneas de código PyTorch y un entrenamiento de 15 minutos en CPU, permite recorrer el ciclo completo (tokenización por carácter, arquitectura transformer, bucle de entrenamiento y decodificación) en una sola sesión de clase.
- Reproducción de experimentos en hardware modesto: sirve como banco de pruebas para estudiar hiperparámetros (learning rate, batch size, número de capas) sin necesidad de GPU, ya que el entrenamiento completo cabe en menos de un cuarto de hora en una CPU de 4 núcleos.
- Validación de pipelines de inferencia personalizados: al no cargarse con `transformers`, obliga a implementar la carga de `state_dict`, la gestión del vocabulario y la decodificación con temperatura y top-k, lo que resulta útil para verificar integraciones propias.
- Demostración interactiva en navegador: el Space asociado permite mostrar a una audiencia no técnica qué es un modelo generativo y cuáles son sus límites reales con un ejemplo tangible y de bajo coste.
- Pruebas de robustez y filtrado de entrada: el comportamiento del modelo ante caracteres fuera de vocabulario y mensajes fuera de dominio permite ilustrar técnicas de saneamiento de entrada y de detección de consultas fuera de alcance.
- Base para ejercicios de ampliación: punto de partida para experimentos comparativos, como sustituir la tokenización por carácter por BPE, ampliar el corpus o aumentar la profundidad, y medir el efecto sobre la pérdida de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento (0,165) y de validación (0,170) tras 4.000 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos (824.120 parámetros en punto flotante de 32 bits); el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; el autor lo entrenó y ejecutó en una CPU de 4 núcleos.
- Compatibilidad con GPU consumer: sí, en cualquier GPU con soporte de PyTorch (RTX 4090, RTX 3060, etc.), aunque no aporta ventaja frente a CPU.
- Opciones de despliegue: PyTorch nativo mediante `model.py` y `model.pt`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no usa el formato `transformers` ni GGUF.
- Latencia y throughput: no disponibles de forma medida; por el tamaño y la decodificación carácter a carácter, la latencia es del orden de milisegundos por respuesta en CPU.
- Dependencias: `torch` y `huggingface_hub`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Nivel de tokenizacion | Licencia | Carga con transformers |
|---|---|---|---|---|---|
| Neural-Labs/tiny-llm | 824.120 | 128 caracteres | Caracter | MIT | No |
| GPT-2 small (referencia) | 124 millones | 1.024 tokens | BPE | MIT | Sí |
| Modelos GPT didácticos tipo nanoGPT (referencia) | Variable, típicamente 10-100 millones | Configurable | Caracter o BPE | MIT | No |

La comparativa se limita a referencias arquitectónicas y didácticas, ya que no se dispone de datos de benchmarks del modelo que permitan una comparación de rendimiento. Frente a GPT-2 small, tiny-llm es aproximadamente 150 veces menor en parámetros y no compite en ninguna tarea de lenguaje real; su ventaja es el coste de entrenamiento (15 minutos en CPU) y la simplicidad del código.

## Limitaciones y advertencias

- Dominio cerrado: solo conoce saludos; cualquier otro mensaje recibe una respuesta con formato de saludo sin relación con la pregunta.
- Tokenización por carácter: descarta cualquier carácter no presente en el vocabulario de entrenamiento, incluida la mayoría de letras no inglesas y emojis, lo que degrada o anula entradas en otros idiomas.
- Sin memoria conversacional: cada respuesta se genera únicamente a partir del último mensaje, sin historial.
- Escala insuficiente para conocimiento factual, seguimiento de instrucciones o razonamiento; no debe evaluarse como asistente.
- Riesgo de alucinación: intrínseco al modelo generativo, aunque en este caso se manifiesta como respuestas de saludo irrelevantes en lugar de afirmaciones falsas sobre hechos.
- Sesgos: no documentados por el autor; el corpus es una lista corta escrita a mano, por lo que los sesgos reflejan únicamente ese material.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; no obstante, el uso comercial del modelo en sí carece de sentido práctico por sus limitaciones funcionales.
- No compatible con el ecosistema `transformers`: requiere cargar el código y los pesos manualmente, lo que añade fricción en pipelines estándar.
- Repositorio de 0,0 GB y sin descargas ni likes en el momento de la consulta: no hay evidencia de uso o mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Neural-Labs/tiny-llm
- Demo en el navegador (Space): https://huggingface.co/spaces/Neural-Labs/NerualLabs
- Repositorio de PyTorch: https://pytorch.org
- Librería huggingface_hub: https://huggingface.co/docs/huggingface_hub
