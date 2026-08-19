# my0919175/Sovythos-APEP-550M

## Resumen

Sovythos-APEP-550M es un modelo de lenguaje de ~550 millones de parámetros, de arquitectura decoder-only compatible con Llama, desarrollado por Mahmoud Yasser dentro del proyecto Sovythos AI. Se encuentra actualmente en fase de entrenamiento y el repositorio de HuggingFace actúa como placeholder: no se han subido aún los pesos, el tokenizador ni los archivos de configuración. El modelo está diseñado para cubrir un espectro multilingüe y multitarea: árabe egipcio, árabe moderno estándar (MSA), inglés, matemáticas y código, con una mezcla de datos que incluye ejemplos con formato de instrucción desde el primer paso de entrenamiento.

La relevancia de este modelo radica en que se entrena desde cero (inicialización aleatoria, sin usar pesos de Llama, GPT o Qwen) en una sola GPU de consumo, lo que lo convierte en un experimento de investigación reproducible y de bajo coste. Su arquitectura incorpora GQA, RoPE, SwiGLU y QK-Norm, y utiliza un tokenizador BPE byte-level de 48K de vocabulario entrenado específicamente para la mezcla de idiomas. Al estar en desarrollo, no es utilizable para inferencia todavía, pero el autor planea publicar los pesos en formato safetensors y GGUF, junto con la configuración completa y el historial de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, compatible con Llama (GQA + RoPE + SwiGLU + QK-Norm) |
| Parametros totales | ~550M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se planea exportar GGUF F16/F32) |
| Idiomas soportados | Árabe egipcio, árabe moderno estándar, inglés (con datos de matemáticas y código) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se subirán safetensors y GGUF cuando termine el entrenamiento) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer decoder-only con atención de consultas agrupadas (GQA), incrustaciones posicionales rotatorias (RoPE), activación SwiGLU y normalización QK-Norm, todo ello compatible con el ecosistema Llama. El tokenizador es un BPE byte-level de 48K entradas, entrenado específicamente para el corpus multilingüe. El entrenamiento se realiza desde cero, con inicialización aleatoria, sobre una mezcla de datos intercalada en una sola etapa que combina árabe egipcio auténtico (no traducido automáticamente), MSA, inglés educativo (FineWeb-Edu, Cosmopedia-v2), texto matemático con problemas resueltos paso a paso y código Python filtrado por calidad, además de ejemplos con formato de instrucción desde el primer paso. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores.

El proceso de entrenamiento está en curso y se ejecuta en una única GPU de consumo. El autor ha indicado que publicará el log completo de entrenamiento (train/val loss) para garantizar transparencia. No se han revelado detalles sobre el número de tokens totales, la composición exacta del dataset ni los hiperparámetros de entrenamiento.

## Capacidades

- Generación de texto en árabe egipcio, árabe moderno estándar e inglés.
- Razonamiento matemático básico, incluyendo problemas resueltos paso a paso.
- Generación de código en Python, con tareas con formato de instrucción.
- Capacidad multilingüe, especialmente enfocada en dialecto egipcio, un área poco cubierta por modelos comerciales.
- Al estar entrenado con ejemplos de instrucción desde el inicio, se espera que responda a prompts con formato de chat o instrucción, aunque no se ha confirmado oficialmente.
- No se especifican capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

Dado que el modelo aún no ha sido liberado, los siguientes casos son aplicaciones previstas según las capacidades declaradas, no verificadas en producción:

- Asistente de conversación en árabe egipcio: podría usarse para chatbots de atención al cliente o asistentes personales que necesiten comprender y generar dialecto egipcio, un idioma con poca representación en modelos abiertos.
- Tutor de matemáticas en árabe o inglés: su entrenamiento con problemas resueltos paso a paso permitiría generar explicaciones didácticas y resolver ejercicios de nivel escolar.
- Generación de código Python para automatización: podría integrarse en entornos de desarrollo para sugerir fragmentos de código, documentar funciones o completar scripts sencillos.
- Traducción informal entre árabe egipcio, MSA e inglés: útil para subtitulado, transcripción de contenido coloquial o localización de productos.
- Herramienta educativa para aprendizaje de idiomas: generación de ejercicios, diálogos y ejemplos en árabe egipcio y MSA.
- Investigación académica sobre modelos multilingües de bajo coste: al ser entrenado desde cero en una GPU de consumo, sirve como referencia para estudiar el impacto de la mezcla de datos y la arquitectura en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo está en fase de entrenamiento y no hay métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

No hay datos oficiales sobre requisitos de hardware, pero se pueden hacer estimaciones generales basadas en el tamaño del modelo:

- VRAM estimada para inferencia: con ~550M parámetros, en FP16 se necesitarían aproximadamente 1,1 GB solo para los pesos, más overhead de activaciones y KV cache. Con cuantización a 8 bits podría caber en menos de 1 GB, y en 4 bits en unos 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) sería suficiente para inferencia en FP16. Para entrenamiento, el autor indica que usa una GPU de consumo, probablemente con 8-12 GB.
- Sí cabe en GPUs de consumo, incluyendo tarjetas de gama baja.
- Opciones de despliegue: una vez publicados los pesos, se podrá usar con llama.cpp (vía GGUF), Ollama, vLLM o TGI, aunque no hay confirmación oficial de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con modelos de tamaño similar. El modelo está en desarrollo y no hay resultados de benchmarks. Como referencia, otros modelos de ~500M parámetros como GPT-2 (124M-1.5B) o TinyLlama (1.1B) tienen arquitecturas y objetivos distintos. No se puede establecer una comparación fiable hasta que se publiquen los pesos y las evaluaciones.

## Limitaciones y advertencias

- El modelo no es utilizable actualmente: el repositorio no contiene pesos, tokenizador ni configuración. Cualquier intento de cargarlo con `AutoModelForCausalLM.from_pretrained` fallará.
- No hay evaluación de sesgos ni de alucinaciones: al no haber pesos publicados, no se ha podido auditar el comportamiento del modelo en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de tamaño pequeño, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: aunque cubre árabe egipcio y MSA, la calidad en dialecto puede ser variable y no se ha validado con hablantes nativos.
- Licencia Apache-2.0: permite uso comercial, pero solo aplica una vez que se liberen los pesos. Hasta entonces, no hay nada que usar.
- El proyecto está marcado como "work-in-progress": la arquitectura y los datos pueden cambiar antes de la versión final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/my0919175/Sovythos-APEP-550M
- No se han encontrado otros enlaces (papers, blogs, repos) en la información proporcionada.
