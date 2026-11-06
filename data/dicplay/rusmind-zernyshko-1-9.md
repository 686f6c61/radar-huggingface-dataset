# DICPlay/RusMind-Zernyshko-1.9

## Resumen

RusMind Зёрнышко 1.9 es un modelo de lenguaje de pequeña escala (83 millones de parámetros) desarrollado por DICPlay, entrenado desde cero con tokenizador propio y orientado exclusivamente al ruso. Forma parte de la familia RusMind, presentada por el autor como un proyecto de "IA nacional" rusa. El modelo se distribuye bajo una licencia propia (RusMind License) y está pensado para ejecución totalmente offline en portátiles y teléfonos, con un tamaño de repositorio de aproximadamente 167 MB.

La arquitectura es un transformer de 10 capas y dimensión oculta 768, con una longitud de contexto de 1024 tokens y formato de diálogo ChatML. El entrenamiento se organizó en tres fases: una primera de texto web en ruso (310 millones de tokens filtrados con un filtro propio de publicidad y spam), una segunda de diálogos y una tercera de refuerzo de conocimiento sobre Rusia. El autor destaca mejoras en puntuación y corrección ortográfica respecto a la versión 1.6, además de una prueba interna de memoria conversacional con 8 aciertos sobre 8 y una de conocimiento sobre Rusia con 12 sobre 12.

Su relevancia actual reside en el nicho: modelos minúsculos, entrenados desde cero y con tokenizador propio para un idioma concreto, que pueden desplegarse en hardware muy limitado sin conexión. No obstante, sus cifras absolutas en evaluaciones estandarizadas son muy bajas (MERA 2.0 global de 0,048), por lo que debe evaluarse como un experimento de escala reducida y no como un sustituto de modelos generalistas de mayor tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura propia RusMind AI, requiere `trust_remote_code=True`) |
| Parámetros totales | 83.083.008 (10 capas × 768) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible en la información proporcionada; existe versión GGUF para llama.cpp, LM Studio y Ollama |
| Idiomas soportados | ruso (ru) |
| Licencia | RusMind License (DICPlay); uso personal, no comercial, investigación y evaluación gratuitos; uso comercial solo mediante contrato escrito |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 10 capas con dimensión 768, entrenado íntegramente desde cero, incluido el tokenizador. La implementación utiliza código propio de la familia RusMind AI, por lo que la carga en `transformers` exige `trust_remote_code=True`. El formato de conversación es ChatML y el contexto máximo es de 1024 tokens, un valor muy reducido que limita el diálogo multi-turno largo y el procesamiento de documentos.

El entrenamiento se dividió en tres etapas según la model card: (1) texto web en ruso con 310 millones de tokens tras un filtro propio de publicidad y spam; (2) datos de diálogo; y (3) una etapa específica de afianzamiento de conocimiento sobre Rusia (historia y cultura). No se especifican en la información disponible detalles sobre la composición exacta del corpus, el uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El autor reporta mejoras respecto a la versión 1.6 en tareas de puntuación y corrección ortográfica, medidas con la metodología MERA 2.0.

## Capacidades

- Generación de texto conversacional en ruso con formato ChatML.
- Memoria conversacional a corto plazo: el autor reporta 8 aciertos sobre 8 en una prueba interna de retención de datos como nombre, ciudad, edad o nombre de mascota.
- Conocimiento factual sobre Rusia: 12 aciertos sobre 12 en preguntas internas de historia y cultura (por ejemplo, el águila bicéfala del escudo, Maslenitsa, Mendeléyev).
- Puntuación y corrección ortográfica en ruso: 0,34 en la tarea de puntuación SAGE y 0,10–0,15 en corrección ortográfica SAGE según la model card.
- Razonamiento básico y comprensión de situaciones cotidianas y chistes, con puntuaciones bajas pero no nulas en MERA 2.0 (NewReasoning 0,12–0,13; LIMUR 0,21–0,22).
- No se documenta soporte de tool calling, function calling, uso de agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: únicamente ruso declarado.

## Casos de uso

- Asistente conversacional offline en ruso: el modelo cabe en unos 167 MB y puede ejecutarse en un portátil o teléfono sin conexión, adecuado para demos, prototipos y entornos sin red.
- Corrección de puntuación y erratas en textos rusos: con resultados SAGE de 0,34 en puntuación y 0,10–0,15 en ortografía, puede emplearse como paso de preprocesado ligero en pipelines editoriales de bajo coste.
- Prácticas de diálogo con memoria de sesión corta: útil para prototipos de chatbots que necesiten recordar nombre, ciudad o preferencias del usuario dentro de una conversación breve (contexto de 1024 tokens).
- Fichas y preguntas frecuentes sobre cultura e historia rusas: el refuerzo específico de la tercera etapa de entrenamiento lo hace apto para aplicaciones educativas simples y acotadas a ese dominio.
- Evaluación e investigación de modelos desde cero: al incluir tokenizador propio y arquitectura propia, sirve como banco de pruebas para estudiar el efecto de la escala y del filtrado de datos en ruso.
- Despliegue en dispositivos de recursos muy limitados: mediante el GGUF del repositorio asociado, puede integrarse en llama.cpp, LM Studio u Ollama para aplicaciones de escritorio o embebidas.
- Generación de texto breve en aplicaciones de ocio o educativas para niños y principiantes, dado su tamaño reducido y su tono conversacional.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (metodología MERA 2.0 y tareas SAGE):

| Evaluación | RusMind Зёрнышко 1.9 | RusMind Зёрнышко 1.6 | Referencia citada |
|---|---|---|---|
| MERA 2.0 (global) | 0,048 | no disponible | SmolLM-3B: mismo nivel según el autor |
| Puntuación (SAGE) | 0,34 | 0,27 | no disponible |
| Corrección ortográfica (SAGE) | 0,10–0,15 | 0,06 | no disponible |
| NewReasoning (lógica) | 0,12–0,13 | no disponible | no disponible |
| LIMUR (comprensión de situaciones y chistes) | 0,21–0,22 | no disponible | no disponible |
| Prueba interna de memoria | 8/8 | no disponible | no disponible |
| Prueba interna sobre Rusia | 12/12 | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, GSM8K) en la información disponible. Las pruebas internas de memoria y conocimiento sobre Rusia no son comparables con evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (83 M de parámetros, ~332 MB de pesos) y en torno a 170–350 MB en cuantizaciones de 8 o 4 bits; el repositorio ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, iGPU) y en dispositivos móviles según el autor.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; llama.cpp, LM Studio y Ollama mediante el GGUF del repositorio DICPlay/RusMind-Zernyshko-1.9-GGUF. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia muy baja en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| RusMind Зёрнышко 1.9 | 83 M | 1024 | ruso | RusMind License (no comercial sin contrato) | MERA 2.0: 0,048 |
| SmolLM-3B (referencia del autor) | 3 000 M | no disponible en esta ficha | multilingüe | no disponible en esta ficha | Mismo nivel MERA 2.0 según el autor |
| RusMind Зёрнышко 1.6 (versión previa) | no disponible | no disponible | ruso | RusMind License | Puntuación SAGE 0,27; ortografía 0,06 |

La comparación con SmolLM-3B procede únicamente de la afirmación del autor y no se ha verificado de forma independiente. No se dispone de datos de otros modelos rusos de escala similar (por ejemplo, de la familia ruGPT o T-lite) en la información proporcionada, por lo que la comparativa completa figura como no disponible.

## Limitaciones y advertencias

- Escala muy reducida (83 M de parámetros) y contexto de solo 1024 tokens: insuficiente para documentos largos, conversaciones extensas o tareas de razonamiento complejo.
- Rendimiento absoluto bajo en evaluaciones estandarizadas (MERA 2.0 global de 0,048); las cifras de memoria y conocimiento sobre Rusia son pruebas internas del autor, no verificadas de forma independiente.
- Riesgo elevado de alucinación en preguntas factuales fuera del dominio reforzado (historia y cultura rusas) y en cualquier consulta en otro idioma.
- Sesgos potenciales derivados de un corpus web ruso filtrado con criterios propios y de una etapa de entrenamiento específicamente orientada a reforzar conocimiento sobre Rusia; no se documentan evaluaciones de sesgo.
- Licencia restrictiva: el uso comercial, la redistribución de versiones modificadas y la integración en productos requieren contrato escrito con DICPlay; la licencia es "other" y debe revisarse el archivo LICENSE antes de cualquier uso en producción.
- Requiere `trust_remote_code=True` por la arquitectura propia, lo que implica ejecutar código del autor; conviene auditar el código antes de desplegarlo.
- Solo soporta ruso; no hay soporte declarado de tool calling, agentes, visión ni audio.
- Modelo muy reciente y con cero descargas y cero likes en el momento de la ficha: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9
- GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9-GGUF
- Licencia: archivo LICENSE en el repositorio de Hugging Face
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
