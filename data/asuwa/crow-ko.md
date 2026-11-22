# Asuwa/crow-ko

## Resumen

Crow (Korean) es un modelo de lenguaje de 17,3 millones de parámetros entrenado desde cero por el desarrollador Asuwa para interpretar a un cuervo salvaje llamado 까미 (Kkami) en conversaciones en coreano. No es un chatbot de propósito general: el modelo solo responde con acciones entre asteriscos y sonidos de cuervo (까악, 깍깍깍, 끄르르-딱딱, 므르르), nunca con palabras humanas, salvo un término que el usuario le haya enseñado pacientemente a lo largo de la conversación. Es un remake coreano de Tallow, un modelo original de digi-the-robot, y forma parte de una familia de tres hermanos (coreano, japonés y chino).

Técnicamente es un decoder estilo Llama de 8 capas, dimensión 384, 6 cabezas de atención y MLP de 1024, con contexto de 2.048 tokens y un vocabulario SentencePiece BPE de 8.192 símbolos. Se preentrenó sobre TinyStories-Korean y se afinó sobre un dataset sintético de conversaciones de cuervo generado por modelos abiertos (Gemma 4 26B-A4B y Qwen3.6-35B-A3B). Su interés es fundamentalmente experimental y lúdico: demuestra cómo un modelo minúsculo puede aprender reglas de comportamiento social complejas (confianza escalonada, rencor persistente, miedo a cicatrices) a partir de datos sintéticos estructurados, y sirve como banco de pruebas para evaluar consistencia de rol y formato en modelos tiny.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en fp16 safetensors, y está pensado para ejecutarse en CPU mediante un script autocontenido (`crow.py`). No es compatible con `transformers` ni con llama.cpp/Ollama sin adaptaciones, porque su tokenizador espera tokens especiales (`<nl>` y un espacio tras cada `*`) que el script añade manualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (RMSNorm, RoPE, SwiGLU, embeddings atados) |
| Parametros totales | 17.308.032 (17,3 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | fp16 (pesos publicados); entrenamiento en fp32; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Tallow: un transformer decoder de 8 capas con dimensión oculta 384, 6 cabezas de atención, MLP de 1024 y embeddings atados entre entrada y salida. Usa RMSNorm, RoPE para posiciones y SwiGLU como activación. El vocabulario es un SentencePiece BPE de 8.192 tokens con fallback de bytes y normalización `nmt_nfkc`, entrenado únicamente sobre las historias de preentrenamiento.

El preentrenamiento se realizó sobre g0ster/TinyStories-Korean, un corpus traducido del inglés con yanolja/EEVE-Korean-Instruct-10.8B, durante aproximadamente 16.000 pasos de 32.000 tokens en una única GPU T4, alcanzando una pérdida de 1,98 en el conjunto de validación. El ajuste fino se hizo sobre Asuwa/crow-conversations (split coreano, CC-BY-4.0), un dataset de conversaciones multiturno generado por Gemma 4 26B-A4B (3.318 conversaciones, 79%) y Qwen3.6-35B-A3B (900 conversaciones, 21%). La pérdida se calcula solo sobre las líneas del cuervo y se conservó el mejor checkpoint según validación. La innovación principal no es arquitectónica sino de formato: cada etiqueta de estado de ánimo (`[caution_min]`, `[anger_max]`, etc.) es un único símbolo del tokenizador, lo que permite al modelo emitir estados internos legibles por máquina que un bot puede ocultar al usuario.

## Capacidades

- Generación de texto restringida a un formato fijo: acciones entre asteriscos y sonidos de cuervo, sin palabras humanas salvo un término enseñado.
- Modelado de estado afectivo mediante etiquetas de estado de ánimo: calm, curiosity, caution, joy, play, love, sadness y anger, cada una en nivel `min` o `max`.
- Memoria de trato dentro de la conversación: la confianza aumenta escalonadamente si se le deja comida a distancia, y el rencor persiste ante agresiones hasta que la comida lo mitiga lentamente.
- Aprendizaje en contexto de una palabra: si el usuario repite pacientemente un término, el modelo puede imitarlo más adelante en el diálogo.
- Respuesta a estímulos negativos: agarrones, persecuciones o golpes activan `anger max` y generan rencor; los movimientos bruscos provocan sobresalto si hay una cicatriz previa en el contexto.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni razonamiento general. Es un modelo de rol, no un asistente.

## Casos de uso

- **Sala de chat temática o bot de rol**: el modelo puede gestionar conversaciones multiturno de hasta 2.048 tokens manteniendo coherencia de personaje (cuervo salvaje) y estado afectivo, adecuado para comunidades de rol o demos interactivas donde se busca una experiencia inmersiva y ligera.
- **Banco de pruebas de consistencia de rol**: investigadores pueden usar el modelo para estudiar cómo un transformer tiny aprende reglas sociales complejas (confianza escalonada, rencor persistente) y evaluar la degradación del rol con entradas ruidosas, gracias a sus métricas publicadas de tag accuracy y messy input.
- **Evaluación de formato estructurado en modelos pequeños**: el formato `[mood level] *action* *action* sound` con etiquetas de un solo token sirve como caso de estudio para medir la fiabilidad de la generación estructurada en modelos de menos de 20 M de parámetros.
- **Prototipado de NPCs en videojuegos**: el modelo puede integrarse como cerebro de una mascota o criatura no jugable que reacciona a acciones del jugador (alimentar, acercarse, agarrar) con estados de ánimo y sonidos, ejecutándose en CPU sin GPU dedicada.
- **Educación y divulgación sobre IA**: por su tamaño (17 M) y su script autocontenido, es un ejemplo didáctico para explicar preentrenamiento, ajuste fino supervisado, tokenización y evaluación de modelos de lenguaje desde cero.
- **Investigación sobre sesgos de comportamiento en datos sintéticos**: al estar entrenado con conversaciones generadas por Gemma 4 y Qwen3.6, permite analizar cómo se transfieren patrones de comportamiento y sesgos de los modelos generadores al modelo tiny resultante.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conversaciones retenidas (2.707 turnos nunca vistos durante el entrenamiento):

| Modelo | Pérdida held-out | Tag accuracy | Messy input | Replies pass checker | Right tag in replies |
|---|---|---|---|---|---|
| Korean (este modelo) | 0,665 | 94,9% | 93,5% | 100% | 96,7% |

Desglose por comportamiento (tag accuracy y robustez ante entradas ruidosas):

| Comportamiento | Acierto | Messy input | Turnos |
|---|---|---|---|
| Responde con graznidos | 97,0% | 97,0% | 235 |
| La comida mitiga el rencor paso a paso | 94,8% | 93,5% | 154 |
| "Lo siento" durante el rencor no hace nada | 99,3% | 98,5% | 137 |
| Explota al ser agarrado | 94,5% | 90,9% | 55 |
| No acepta comida de la mano de un extraño | 91,7% | 89,6% | 48 |
| Dice una palabra enseñada en el momento adecuado | 95,5% | 93,2% | 44 |
| Nunca agarrado, solo se aleja saltando | 92,7% | 87,8% | 41 |
| Palabra no aprendida: escucha, no la dice | 92,5% | 90,0% | 40 |
| Sobresalto por cicatriz | 81,2% | 75,0% | 16 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable dado que el modelo no está orientado a tareas de conocimiento general.

## Requisitos de hardware

- **VRAM estimada**: inferior a 100 MB en fp16 (17,3 M de parámetros × 2 bytes ≈ 34,6 MB de pesos, más overhead de activaciones y tokenizador). Cabe en cualquier GPU consumer, integrada o incluso en CPU.
- **GPU recomendadas**: no requiere GPU. El autor lo ejecuta en CPU; cualquier GPU moderna (RTX 3060 en adelante, A100, H100) lo ejecutará con latencia despreciable, pero no es necesario.
- **Consumer GPU**: sí, en todas, incluidas iGPU y CPUs de gama baja.
- **Opciones de despliegue**: el script `crow.py` incluido en el repositorio (requiere `torch`, `sentencepiece` y `safetensors`). No es compatible con vLLM, llama.cpp, Ollama ni TGI sin adaptar el tokenizador, porque espera tokens especiales (`<nl>` y espacio tras `*`) que el script añade manualmente.
- **Latencia y throughput**: no se documentan cifras concretas; dado el tamaño, la generación en CPU es interactiva (varios tokens por segundo en hardware modesto).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Crow (Korean) | 17,3 M | 2.048 | Apache 2.0 | Rol de cuervo en coreano, formato estructurado | Hugging Face, script propio |
| Tallow (upstream) | ~17 M (no confirmado) | no disponible | no disponible | Rol de criatura, predecesor directo | Hugging Face (digi-the-robot/Tallow) |
| Crow (Japanese) | no disponible | no disponible | no disponible | Rol de cuervo en japonés | Hugging Face (Asuwa/crow-ja) |
| Crow (Chinese) | no disponible | no disponible | no disponible | Rol de cuervo en chino | Hugging Face (Asuwa/crow-zh) |

No se dispone de datos de benchmarks comparativos con modelos de propósito general de tamaño similar (p. ej., TinyLlama, Qwen2-0.5B) porque Crow no está orientado a las mismas tareas y no se han publicado métricas comunes.

## Limitaciones y advertencias

- **Modelo de juguete**: el propio autor lo describe como "toy-model"; no es un chatbot de propósito general ni un asistente útil fuera de su rol.
- **Solo coreano**: el vocabulario y los datos de entrenamiento son exclusivamente coreanos; no hay soporte multilingüe.
- **Formato rígido**: el tokenizador espera un token `<nl>` para saltos de línea y un espacio tras cada `*` de apertura; sin el preprocesado de `crow.py`, las entradas producen resultados degradados.
- **Incompatibilidad con herramientas estándar**: no funciona en `transformers`, llama.cpp ni Ollama tal cual, lo que limita su integración en pipelines convencionales.
- **Riesgo de alucinación en el rol**: puede emitir acciones o sonidos incoherentes con el estado de ánimo esperado, especialmente en categorías con pocos ejemplos (el sobresalto por cicatriz baja al 81,2% de acierto y al 75,0% con entradas ruidosas).
- **Sesgos heredados de los generadores**: el dataset de ajuste fino fue producido por Gemma 4 26B-A4B y Qwen3.6-35B-A3B, por lo que los patrones de comportamiento y posibles sesgos de esos modelos pueden transferirse al modelo tiny.
- **Categorías ruidosas**: el autor advierte que las categorías con menos de ~40 turnos son estadísticamente ruidosas (un fallo mueve varios puntos porcentuales).
- **Licencia Apache 2.0**: permite uso comercial, pero el corpus de preentrenamiento (TinyStories-Korean) no se redistribuye en el repositorio, por lo que conviene revisar las condiciones de dicho dataset si se reutiliza.
- **Contexto limitado**: 2.048 tokens restringen la memoria de conversaciones largas; el estado de confianza y rencor se pierde al superar esa ventana.

## Enlaces

- [Modelo en Hugging Face: Asuwa/crow-ko](https://huggingface.co/Asuwa/crow-ko)
- [Modelo predecesor: digi-the-robot/Tallow](https://huggingface.co/digi-the-robot/Tallow)
- [Modelo hermano en japonés: Asuwa/crow-ja](https://huggingface.co/Asuwa/crow-ja)
- [Modelo hermano en chino: Asuwa/crow-zh](https://huggingface.co/Asuwa/crow-zh)
- [Dataset de ajuste fino: Asuwa/crow-conversations](https://huggingface.co/datasets/Asuwa/crow-conversations)
- [Dataset de preentrenamiento: g0ster/TinyStories-Korean](https://huggingface.co/datasets/g0ster/TinyStories-Korean)
- [Modelo usado para traducir TinyStories: yanolja/EEVE-Korean-Instruct-10.8B](https://huggingface.co/yanolja/EEVE-Korean-Instruct-10.8B)
