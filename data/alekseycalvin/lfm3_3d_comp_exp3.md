# AlekseyCalvin/LFM3_3d_comp_exp3

## Resumen

LFM3_3d_comp_exp3 es un fine-tune experimental del modelo LiquidAI/LFM3-1.7B publicado por el usuario AlekseyCalvin en Hugging Face. Se trata de una variante del proyecto LFMputer, un experimento que integra un "ordenador compilado" de arquitectura RISC-V (RV32) dentro de la propia pila de decodificadores del transformer, con memoria tensorial direccionable y diez instalaciones analíticas. El modelo combina 15 capas de máquina con las 24 capas del backbone lingüístico LFM3, sumando 39 capas en la secuencia completa del decodificador.

El modelo resuelve un problema de investigación: explorar si es posible incrustar cómputo determinista y memoria explícita dentro de un transformer preentrenado sin destruir sus capacidades lingüísticas. Para ello, las capas de máquina permanecen inactivas (paso directo) durante la generación de lenguaje, y solo se activan durante la ejecución de programas, de modo que el backbone LFM3 opera con sus posiciones e índices de caché nativos.

Es relevante como pieza de exploración técnica en la intersección de modelos de lenguaje y arquitecturas de cómputo híbridas, pero no como modelo de producción: cuenta con cero descargas y cero likes, un repositorio de 3,6 GB, licencia LFM1.0 y un único idioma declarado (inglés). El checkpoint base es LiquidAI/LFM3-1.7B, con 1.749.392.808 parámetros totales según los safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone LFM3 (24 capas de decodificador) + 15 capas de máquina (control de programa, 11 bloques de computador RV32, RAM/ficheros, puente de memoria, analítica) |
| Parametros totales | 1.749.392.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en un único safetensors de precisión mixta, ~3,54 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (licencia "other" según metadatos de Hugging Face) |
| Formato de pesos | safetensors (pytorch, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un decodificador transformer híbrido de 39 capas. Las posiciones 0 a 14 corresponden a capas de máquina: la posición 0 gestiona control de computador (embedding de entrada, imágenes de programa, control de arranque, mapas de salida); las posiciones 1 a 11 implementan 18 etapas de circuito ordenadas mediante feed-forward compilado y memoria recurrente; la posición 12 gestiona RAM y ficheros (decodificación de direcciones, retardo de petición, caché, MMIO, ficheros versionados); la posición 13 es el puente de memoria entre bancos de trabajo de la CPU y la RAM direccionable; la posición 14 agrupa diez instalaciones analíticas acotadas. Las posiciones 15 a 38 son los bloques de decodificador LFM3 preentrenados.

Los bloques de máquina siguen la organización de LFM3 (operador → residual y feed-forward con compuerta → residual) pero con adaptaciones para ejecución discreta: normalización identidad en lugar de RMSNorm, activación ReLU en lugar de SiLU, proyecciones dispersas ordenadas en lugar de mapas lineales densos, y memoria recurrente de direccionamiento duro en lugar de atención softmax o convolución corta. El computador es un circuito RV32 de pesos fijos con imágenes de programa incluidas; la memoria lógica es de 8 MiB con caché de 256 palabras, MMIO de 256 bytes y un puente que transfiere 32 KiB en los límites de programa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés sobre el backbone LFM3-1.7B.
- Ejecución de programas compilados RV32 mediante capas de máquina dedicadas dentro del decodificador.
- Memoria tensorial explícita y escribible: lectura, escritura y compare-and-swap sobre celdas mutables con direccionamiento binario de dos niveles.
- Instalaciones analíticas acotadas (diez) para cómputo determinista, como evaluación aritmética mediante la herramienta `calc`.
- Gestión de ficheros versionados mapeados en vistas de RAM.
- Separación de fases: durante la generación de lenguaje las capas de máquina pasan el tensor sin cambios; durante la ejecución de computador las capas de máquina avanzan el estado sin ejecutar el backbone en cada instrucción.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo está orientado a ejecución de programas y llamadas tipadas.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales: ejecución de fases, llamadas tipadas y formateo de resultados mediante el runtime incluido; no se declaran visión ni audio.

## Casos de uso

- Investigación en arquitecturas híbridas lenguaje-cómputo: el modelo permite estudiar cómo se comporta un backbone preentrenado cuando se le insertan capas de máquina con pesos fijos, comparando la fase de lenguaje con la fase de ejecución de programa.
- Evaluación aritmética determinista: mediante la instalación `calc`, se puede pedir al modelo que evalúe expresiones como `123456789 * 987654321` y devuelva solo el resultado, aprovechando el cómputo analítico en lugar de la generación autoregresiva.
- Experimentos de memoria explícita: el espacio de 8 MiB con caché de 256 palabras y MMIO permite probar tareas de lectura/escritura de estado y comparar con la memoria implícita del transformer.
- Pruebas de ejecución de programas RV32: las imágenes de programa incluidas permiten lanzar circuitos compilados y medir latencia de seis ciclos en el retardo de petición y transferencias de 32 KiB en los límites de programa.
- Reproducción de experimentos académicos: el repositorio incluye `decoder_config.json`, configuración del backbone, runtime y tokenizer, lo que facilita replicar la disposición de capas y las fases de ejecución.
- Estudio comparativo con Qwenputer: la model card incluye una sección de comparación con el proyecto inspirador, útil para analizar diferencias de integración entre backbones.
- Docencia sobre decodificadores híbridos: el desglose posición a posición de las 39 capas sirve como material didáctico para explicar cómo se insertan operadores no lingüísticos en un transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 3,6 GB y el safetensors de pesos mixtos ~3,54 GB, por lo que la carga en FP16 requeriría del orden de 3,5 GB solo para pesos, más cachés, estado de máquina (8 MiB lógicos), runtime y allocaciones temporales.
- GPU recomendadas: no disponible en la información proporcionada. El quick start usa `--device cuda` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos (1,75 mil millones de parámetros) podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: el modelo requiere el runtime incluido (`modeling_lfmputer.py`, `chat.py`) y no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El código usa `custom_code` y un cargador propio con ejecución por fases.
- Latencia y throughput: no disponibles. Solo se documenta una latencia de seis ciclos en el retardo de petición de la memoria y transferencias de 32 KiB en los límites de programa, sin cifras de rendimiento extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3_3d_comp_exp3 (este) | 1.749.392.808 | no disponible | LFM3 + computador RV32 compilado en el decodificador | lfm1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B | ~1,7 mil millones | no disponible | Backbone lingüístico LFM3 preentrenado | no disponible en la información | Hugging Face (modelo base) |
| Qwenputer (divagr1925/Qwen3.5-4B-Qwenputer) | no disponible | no disponible | Computador compilado sobre Qwen3.5-4B, proyecto inspirador | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes: no hay evidencia de validación por la comunidad ni de uso en producción.
- Idiomas: solo inglés declarado; no se garantiza comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia LFM1.0: es necesario revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial, ya que la licencia se declara como "other" con nombre lfm1.0.
- Dependencia de código personalizado: requiere el runtime incluido y una versión concreta de `huggingface-hub` (2.3.0); no es un checkpoint estándar cargable con `transformers` sin el cargador propio.
- Riesgo de alucinación: inherente al backbone LFM3-1.7B; las capas de máquina no eliminan el comportamiento generativo del modelo base.
- Sesgos: no documentados en la información proporcionada; al derivar de LFM3-1.7B, hereda los sesgos de su dataset de entrenamiento, que no se detalla.
- Estado de máquina y memoria: el modelo mantiene estado mutable de sesión (RAM, caché, ficheros) que puede guardarse por separado de los pesos fijos; en producción habría que gestionar ese estado con cuidado.
- Reproducibilidad: el autor no documenta el proceso de entrenamiento, los datos ni las métricas, lo que dificulta reproducir o auditar el fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlekseyCalvin/LFM3_3d_comp_exp3
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Proyecto inspirador Qwenputer: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Perfil del autor del proyecto original: https://huggingface.co/suayptalha
- Repositorio de referencia del proyecto (según quick start): suayptalha/LFMputer-1.7B (descarga mediante `hf download suayptalha/LFMputer-1.7B`)
- Configuración del decodificador: `decoder_config.json` (incluido en el repositorio)
- Configuración del backbone: `backbone/config.json` (incluido en el repositorio)
