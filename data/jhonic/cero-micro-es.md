# Jhonic/cero-micro-es

## Resumen

cero-micro-es es un modelo de lenguaje de 5,8 millones de parámetros entrenado desde cero en español por Jhonic (jceronch1), como parte del proyecto educativo "Crear un LLM desde cero". Su propósito no es servir como asistente de producción, sino como herramienta docente para comprender el funcionamiento interno de un LLM: el repositorio incluye el motor en PyTorch, un curso de 13 clases y un laboratorio para inspeccionar el modelo. Se distribuye en dos variantes: `base/`, que continúa texto, y `chat/`, que es el resultado del ajuste fino supervisado (SFT) para conversar.

El modelo emplea una arquitectura transformer decodificadora "moderna" con RoPE, RMSNorm pre-norma, SwiGLU, pesos de entrada y salida compartidos y sin sesgos. Consta de 6 bloques, 4 cabezas de atención, ancho 256 y una ventana de contexto de 256 tokens. Fue entrenado sobre la traducción automática al español de TinyStories (42.374 cuentos, 10,1 M de tokens) y su tokenizador BPE a nivel de bytes (4.096 tokens) se entrenó desde cero con el mismo corpus.

Su relevancia es fundamentalmente pedagógica y reproducible: el preentrenamiento completo se ejecutó en 3 minutos sobre una GPU RTX 4070 de portátil (8 GB) en bfloat16, y todo el pipeline se puede reproducir con el comando `cero todo --receta micro`. No es un modelo de la librería `transformers`, por lo que requiere el paquete propio `cero` para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador: RoPE, RMSNorm pre-norma, SwiGLU, embeddings de entrada/salida compartidos, sin sesgos |
| Parametros totales | 5.758.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | es (español) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), config en `config.json`, tokenizador en `tokenizador.json` |
| Capas / cabezas / ancho | 6 bloques · 4 cabezas · ancho 256 |
| Tokenizador | BPE a nivel de bytes, 4.096 tokens (4 especiales: `<\|inicio\|>`, `<\|usuario\|>`, `<\|asistente\|>`, `<\|fin\|>`), 3,89 caracteres por token |
| Dataset | `ffuuugor/tinystories_spanish` (CDLA-Sharing-1.0) |
| Libreria | PyTorch (arquitectura propia, no `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador con las innovaciones habituales de los LLM modernos aplicadas a escala minúscula: embeddings rotatorios (RoPE) para codificar posiciones, normalización RMSNorm aplicada antes de cada subcapa, activación SwiGLU en la MLP, pesos de embedding de entrada y de salida compartidos (weight tying) y ausencia total de términos de sesgo. La configuración concreta es de 6 bloques, 4 cabezas de atención, dimensión de modelo 256 y contexto de 256 tokens, sumando 5.758.208 parámetros.

El preentrenamiento del modelo base utilizó 42.374 cuentos de TinyStories en español (traducción automática del corpus original, 10,1 M de tokens), reservando 829 cuentos para validación. Se ejecutaron 3.000 pasos con lotes de 32 secuencias de 256 tokens (24,6 M de tokens procesados), optimizador AdamW, tasa de aprendizaje 0,002 con calentamiento y decaimiento coseno. Posteriormente, el ajuste fino para chat (SFT) empleó 40.000 conversaciones fabricadas mediante reglas a partir de los cuentos (peticiones de cuentos, continuación de cuentos, sumas pequeñas, charla y respuestas de "no lo sé"), con la pérdida calculada únicamente sobre los turnos del asistente, durante 1.000 pasos de lote 32 y tasa 0,0005. Todo el entrenamiento se completó en 3 minutos en una RTX 4070 de portátil en bfloat16.

## Capacidades

- Generación de texto en español: continuación de textos narrativos sencillos con el modelo base.
- Conversación multi-turno básica con el modelo `chat` (saludos, peticiones de cuentos, charla simple).
- Generación de cuentos infantiles cortos sobre personajes solicitados (25/25 aciertos en la evaluación del autor).
- Aritmética elemental: sumas de 0 a 10 vistas durante el entrenamiento (24/25 aciertos); generalización muy limitada a sumas no vistas (2/17).
- Reconocimiento de preguntas fuera de su dominio y respuesta "no lo sé" (10/10 en la evaluación del autor).
- Terminación autónoma del turno mediante el token especial `<|fin|>` en respuestas cortas (52/52).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking).
- No dispone de capacidades de visión ni audio.
- Capacidad multilingüe: únicamente español.

## Casos de uso

- Docencia de arquitecturas transformer: el modelo sirve como caso de estudio completo y ejecutable para explicar en clase cómo se construye un LLM desde cero, con código legible y un laboratorio para inspeccionar pesos y activaciones.
- Reproducción de experimentos de entrenamiento: investigadores y estudiantes pueden reentrenar el modelo en minutos (`cero todo --receta micro`) y modificar hiperparámetros para observar el efecto en la pérdida y la perplejidad.
- Aprendizaje de tokenización BPE: el tokenizador entrenado desde cero con el corpus permite estudiar de forma práctica la construcción de vocabularios, la compresión en caracteres por token (3,89) y el manejo de tokens especiales de chat.
- Estudio de ajuste fino supervisado: la variante `chat` ilustra cómo un modelo base se convierte en conversacional mediante SFT con pérdida enmascarada solo en los turnos del asistente, y sus limitaciones (sumas no vistas, 2/17) sirven para discutir generalización.
- Generación de cuentos infantiles de demostración: el modelo `chat` produce cuentos cortos coherentes sobre personajes pedidos, útil para prototipos educativos o demos de generación de texto en español sin requisitos de hardware.
- Experimentos de evaluación con decodificación determinista: la evaluación del autor usa temperatura 0 para comparar aciertos de forma reproducible, un patrón útil para enseñar metodología de evaluación de LLMs.
- Despliegue en entornos sin GPU: al tener 5,8 M de parámetros, el modelo funciona en CPU, lo que permite usarlo en aulas, portátiles modestos o entornos de CI para pruebas de pipelines de generación.

## Benchmarks y rendimiento

El autor publica métricas de evaluación propias (no benchmarks estándar como MMLU o HumanEval):

| Metrica | Resultado |
|---|---|
| Pérdida en validación (modelo base) | 2,018 (modelo sin entrenar: ln 4.096 = 8,32) |
| Perplejidad en validación (modelo base) | 7,52 |
| Bits por carácter (modelo base) | 0,748 |
| Cuento sobre el personaje pedido (chat) | 25/25 |
| Sumas de 0 a 10 vistas al entrenar (chat) | 24/25 |
| Sumas nunca vistas (chat) | 2/17 |
| Decir "no lo sé" a preguntas nuevas fuera de dominio (chat) | 10/10 |
| Termina solo su turno con `<\|fin\|>` en respuestas cortas (chat) | 52/52 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (5,8 M de parámetros en bfloat16 ocupan aproximadamente 12 MB de pesos; el resto es overhead de runtime).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el autor entrenó en una RTX 4070 de portátil (8 GB). Para inferencia basta con GPUs de gama baja o integradas.
- Cabe en cualquier GPU de consumo e incluso en CPU sin problema.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que usa una arquitectura propia fuera de `transformers`. Se ejecuta con el paquete `cero` del repositorio del proyecto, cargando los pesos con `safetensors.torch.load_model`.
- Latencia y throughput: no disponibles en la información proporcionada; dado el tamaño, la latencia esperada es de milisegundos por token en CPU y menor en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cero-micro-es | 5,76 M | 256 | es | MIT | Hugging Face (pesos safetensors) |
| cero-nano-es | 0,9 M | no disponible | es | no disponible | Hugging Face |
| cero-mini-es | 15,7 M | no disponible | es | no disponible | Hugging Face |
| cero-base-es | 35,7 M | no disponible | es | no disponible | Hugging Face |

Los cuatro modelos pertenecen a la misma familia del proyecto "Crear un LLM desde cero" y comparten propósito docente; `cero-nano-es` se entrenó con cuentos sintéticos, mientras que `cero-mini-es` y `cero-base-es` son versiones de mayor tamaño de la misma receta. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada. No se han identificado en la información disponible otros modelos comparables de terceros de escala similar y propósito educativo en español.

## Limitaciones y advertencias

- No es un asistente: el propio autor indica que está hecho para aprender y enseñar, no para uso como chatbot de producción.
- Ventana de contexto muy reducida (256 tokens), insuficiente para conversaciones largas o documentos.
- Conocimiento limitado al dominio de cuentos infantiles; falla en preguntas de cultura general (p. ej., capitales) y responde "no lo sé".
- Generalización aritmética muy pobre: solo acierta sumas vistas durante el entrenamiento (2/17 en sumas nunca vistas).
- Riesgo elevado de alucinación y de incoherencia narrativa fuera de su distribución de entrenamiento.
- Entrenado únicamente en español; no soporta otros idiomas.
- El dataset base es una traducción automática de TinyStories, por lo que puede arrastrar artefactos de traducción y sesgos del corpus original.
- No es compatible con el ecosistema `transformers` ni con herramientas estándar de despliegue (vLLM, TGI, llama.cpp, Ollama), lo que limita su integración en pipelines convencionales.
- Licencia MIT: permite uso comercial, pero el tamaño y las capacidades del modelo hacen inviable su uso productivo real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB reportado, lo que sugiere que los pesos podrían no estar disponibles o ser de tamaño despreciable; conviene verificar la descarga antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jhonic/cero-micro-es
- Repositorio del proyecto "Crear un LLM desde cero": https://github.com/jceronch1/Crear-LLM-desde-cero
- Dataset TinyStories en español: https://huggingface.co/datasets/ffuuugor/tinystories_spanish
- Modelo hermano cero-nano-es: https://huggingface.co/Jhonic/cero-nano-es
- Modelo hermano cero-mini-es: https://huggingface.co/Jhonic/cero-mini-es
- Modelo hermano cero-base-es: https://huggingface.co/Jhonic/cero-base-es
