# JosephLee/modu-llm

## Resumen

modu-llm es un modelo de lenguaje de 6.091.157 parámetros (aproximadamente 6,1 millones) desarrollado por JosephLee como material práctico del libro coreano *모두의 LLM with 파이썬* ("El LLM de todos con Python", de Young-ho Lee). Se trata de un GPT de tipo decoder-only construido desde cero siguiendo la estructura de nanoGPT, con tokenización a nivel de carácter y entrenado exclusivamente sobre historias infantiles en coreano. Su propósito no es competir con modelos de gran escala, sino servir como herramienta didáctica para comprender el ciclo completo de entrenamiento de un LLM: preentrenamiento, ajuste fino supervisado (SFT) y optimización por preferencias (DPO).

El modelo resuelve un problema acotado: generar historias infantiles en coreano a partir de una petición y, tras la fase de DPO, rechazar peticiones que no sean de tipo narrativo en lugar de inventar una historia. Con una ventana de contexto de 384 caracteres y un vocabulario fijo de 2.453 caracteres, está diseñado para ejecutarse en hardware muy modesto (una GPU T4 de Google Colab o incluso CPU para la fase de DPO).

Es relevante ahora porque ejemplifica de forma reproducible y de código abierto el pipeline completo de alineación (SFT + DPO con elección automática de preferencias) en un modelo diminuto, con todos los checkpoints intermedios publicados y bajo licencia CC BY 4.0, lo que lo convierte en un recurso docente valioso para investigadores y desarrolladores que quieran inspeccionar cada etapa del entrenamiento sin infraestructura significativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT decoder-only (Transformer), estructura inspirada en nanoGPT |
| Parámetros totales | 6.091.157 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 caracteres |
| Tipos de cuantización | no disponible (pesos en float, guardados con `torch.save`; el autor usa float16 autocast en entrenamiento) |
| Idiomas soportados | coreano (ko) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.pt` (dict de PyTorch con `cfg`, `model`, `optimizer`, `step`, `history`) |
| Vocabulario | 2.453 caracteres fijos (2.350 hangul frecuentes + latín, dígitos, signos + marcador de fin `§`) |
| Dimensión de embedding | 256 |
| Cabezas de atención | 4 |
| Capas | 6 |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only de tipo GPT con 6 capas, dimensión de modelo de 256 y 4 cabezas de atención, siguiendo el diseño de nanoGPT de Andrej Karpathy. La tokenización es a nivel de carácter con un vocabulario fijo de 2.453 símbolos: 2.350 caracteres hangul de uso frecuente, más caracteres latinos, dígitos y signos de puntuación, más un token especial `§` que marca el final de una historia. Los caracteres fuera de ese vocabulario se descartan durante la tokenización.

El entrenamiento consta de tres fases. El **preentrenamiento** se realizó sobre las primeras 200.000 historias del dataset Tiny-Ko-Stories (unos 71,6 millones de caracteres, con un 90 % para entrenamiento y un 10 % para validación), durante 27.251 pasos en una GPU T4 de Google Colab (unos 30 minutos), con batch de 32, AdamW a tasa de aprendizaje 5e-4 y autocast float16; la pérdida final fue 0,751 en entrenamiento y 0,771 en validación. El **ajuste fino supervisado (SFT)** partió de `pretrain.pt` y usó 43.852 pares petición–historia de Tiny-Ko-Stories SFT (2.308 de validación), durante 3.400 pasos en T4 (unos 5 minutos), con AdamW a 1e-4; se guardó el checkpoint con menor pérdida de validación (0,665). La **fase de DPO** partió de `sft.pt` con 920 pares de preferencia de Tiny-Ko-Stories Feedback, generados mediante reglas (no anotación humana): se prefiere una historia cuando la petición es narrativa y se prefiere la respuesta "no sé la respuesta a esa pregunta…" cuando no lo es. Se aplicó DPO con beta 0,1 usando `sft.pt` como modelo de referencia, complementado con una reducción de la pérdida por carácter sobre la respuesta preferida (peso 1,0), ya que el DPO puro no lograba producir la respuesta de rechazo. Se entrenó con AdamW a 5e-5, 174 pasos con pares de tamaño 16 (tres épocas sobre los datos), en CPU durante unos 7 minutos.

## Capacidades

- Generación de texto narrativo en coreano: produce historias infantiles coherentes a nivel de párrafo breve a partir de una petición.
- Generación condicionada por petición: acepta pares formateados petición–historia mediante `format_pair`.
- Rechazo de peticiones no narrativas: tras el DPO, responde con "no sé la respuesta a esa pregunta…" a consultas factuales o no narrativas (21 de 24 intentos en la evaluación del autor).
- Generación con control de longitud: parámetro `length` / `max_new_tokens` en la API de generación.
- Checkpoints intermedios: permite inspeccionar el estado del modelo en los pasos 250, 1.000 y 3.000 del preentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo de pensamiento. No tiene capacidades multilingües más allá del coreano.

## Casos de uso

- **Docencia de LLM desde cero**: el modelo y sus checkpoints intermedios permiten a estudiantes reproducir y comparar visualmente las curvas de pérdida en cada fase (preentrenamiento, SFT, DPO) en una GPU T4 o incluso CPU para la fase final, sin necesidad de infraestructura costosa.
- **Demostración de DPO con preferencias sintéticas**: sirve para ilustrar cómo construir pares de preferencia mediante reglas y cómo el DPO puro puede necesitar un término auxiliar de pérdida para producir respuestas de rechazo, un caso poco frecuente en materiales didácticos.
- **Generación de cuentos infantiles en coreano para prototipos**: con prompts como "토끼가 나오는 짧은 이야기를 써 줘" genera historias breves útiles para maquetar interfaces de aplicaciones de lectura infantil antes de integrar un modelo mayor.
- **Investigación sobre tokenización a nivel de carácter**: su vocabulario fijo de 2.453 caracteres y contexto de 384 caracteres lo hacen adecuado para experimentos controlados sobre el efecto del tamaño de vocabulario y la longitud de contexto en modelos pequeños.
- **Pruebas de robustez y evaluación de alucinación en modelos pequeños**: permite medir empíricamente con qué frecuencia un modelo de 6 M de parámetros responde con una historia inventada a preguntas factuales antes y después del DPO.
- **Base para experimentos de ajuste fino en dominios acotados**: al estar publicado con código MIT y pesos CC BY 4.0, se puede reentrenar sobre otros corpus de historias o cuentos en coreano para estudiar transferencia en modelos de juguete.
- **Material de aula para el libro *모두의 LLM with 파이썬***: los archivos `pretrain.pt`, `sft.pt` y `feedback.pt` están pensados para acompañar capítulos concretos del libro (capítulos 1–7, 11–14), con notebooks en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta métricas internas de entrenamiento y una evaluación cualitativa:

| Métrica | Valor |
|---|---|
| Pérdida de entrenamiento (preentrenamiento) | 0,751 |
| Pérdida de validación (preentrenamiento) | 0,771 |
| Pérdida de validación (SFT, mejor checkpoint) | 0,665 |
| Pérdida en pares petición–historia (SFT) | 0,645 |
| Pérdida en pares petición–historia (tras DPO) | 0,657 |
| Rechazo de preguntas no narrativas (24 intentos) | 21 correctos |
| Generación de historia ante petición narrativa (15 intentos) | 15 correctos |

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB en float32 (6,1 M de parámetros ocupan unos 24 MB en pesos; el repositorio completo pesa 0,5 GB por incluir estados de optimizador y checkpoints).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una T4 de Google Colab (16 GB) y ejecutó la fase de DPO en CPU.
- **¿Cabe en GPU de consumo?**: sí, en cualquier GPU de consumo moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para inferencia interactiva.
- **Opciones de despliegue**: el paquete oficial `modu-llm-v2` (instalable vía `pip install git+https://github.com/yhlee1627/modu-llm-v2`) con API `load_story_llm` y `generate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato `.pt` con `torch.save` no es directamente compatible con esos motores sin conversión.
- **Latencia y throughput**: no disponibles de forma numérica; el autor reporta 30 minutos para 27.251 pasos de preentrenamiento en T4 y 7 minutos para 174 pasos de DPO en CPU, lo que da una idea del orden de magnitud, pero no se publican métricas de tokens por segundo en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| modu-llm (JosephLee) | 6,1 M | 384 caracteres | coreano | CC BY 4.0 | `.pt` (PyTorch) | HuggingFace + GitHub |
| nanoGPT (Karpathy) | configurable (por defecto ~124 M) | configurable (por defecto 1.024 tokens) | inglés (por defecto) | MIT | `.pt` (PyTorch) | GitHub |
| TinyStories (Microsoft) | 1 M – 33 M (varias tallas) | 512 tokens | inglés | MIT (código y pesos publicados) | `.pt` / `.bin` | HuggingFace / GitHub |
| Karpathy char-rnn / minGPT | variable | variable | multilingüe (según datos) | MIT | `.pt` | GitHub |

La comparación directa con modelos de la misma categoría (modelos de juguete para docencia) muestra que modu-llm es el más pequeño de los citados y el único entrenado específicamente sobre historias infantiles en coreano con un pipeline documentado de SFT + DPO. TinyStories es la referencia más cercana en filosofía (modelos pequeños entrenados con historias sintéticas para estudiar la emergencia de capacidades), pero opera en inglés y con tokenización BPE en lugar de carácter. No se dispone de benchmarks comunes que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- **Modelo educativo, no de producción**: el propio autor indica que no es adecuado para servicios reales; su función es didáctica.
- **Dominio muy restringido**: solo se entrenó con historias infantiles; las versiones `pretrain` y `sft` responden con historias incluso a preguntas factuales, de cálculo o en inglés. La versión `feedback` rechaza la mayoría de estas consultas, pero no siempre y sin haber adquirido conocimiento nuevo.
- **Riesgo de alucinación elevado**: al no disponer de conocimiento factual, cualquier respuesta fuera del dominio narrativo es una invención; el DPO reduce pero no elimina este comportamiento.
- **Sin mecanismos de seguridad**: no hay filtros de contenido, moderación ni alineación de seguridad; el dataset de origen son historias sintéticas generadas por varios modelos de IA, y la model card original desaconseja su uso para QA factual o para proporcionar contenido directamente a niños sin revisión humana.
- **Cobertura léxica limitada**: los caracteres fuera del vocabulario de 2.453 símbolos (hangul poco frecuente, hanja, emojis) se descartan silenciosamente, lo que puede truncar o distorsionar las entradas.
- **Contexto corto**: 384 caracteres, insuficiente para conversaciones multi-turno o documentos largos.
- **Licencia CC BY 4.0**: permite uso comercial con atribución, pero obliga a citar el repositorio y los datasets de entrenamiento (Tiny-Ko-Stories, Tiny-Ko-Stories SFT, Tiny-Ko-Stories Feedback). El código del repositorio es MIT; la estructura nanoGPT es MIT.
- **Sin soporte de tooling estándar**: el formato `.pt` y la API propia dificultan la integración con ecosistemas como HuggingFace `transformers`, vLLM u Ollama sin trabajo de conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JosephLee/modu-llm
- Repositorio de código y notebooks: https://github.com/yhlee1627/modu-llm-v2
- Dataset de preentrenamiento (Tiny-Ko-Stories, psymon): https://huggingface.co/datasets/psymon/Tiny-Ko-Stories
- Dataset de ajuste fino (Tiny-Ko-Stories SFT, JosephLee): https://huggingface.co/datasets/JosephLee/tiny-ko-stories-sft
- Dataset de preferencias (Tiny-Ko-Stories Feedback, JosephLee): https://huggingface.co/datasets/JosephLee/tiny-ko-stories-feedback
- nanoGPT (Andrej Karpathy), referencia arquitectónica: https://github.com/karpathy/nanoGPT
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
