# s3v3n2/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino independiente del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario s3v3n2 bajo la organización CCORE. Está orientado a la generación de código en general, con un énfasis específico en la creación de escenas 3D interactivas mediante Three.js. No se trata de un lanzamiento oficial de Qwen, sino de un experimento que explora la viabilidad de modelos de lenguaje pequeños (4B parámetros) para tareas de codificación de propósito general y generación de escenas 3D de alta calidad.

El modelo se publica como una vista previa temprana (early preview) mientras el autor continúa el entrenamiento. Se distribuye en formato Safetensors FP16 (cuatro shards) y en dos cuantizaciones GGUF (Q4_K_M y Q8_0), con soporte opcional de visión cuando se carga junto al proyector multimodal original de Qwen3.5-4B. El repositorio ocupa 17,0 GB e incluye configuración, tokenizador, plantilla de chat y ajustes de procesador de imagen y vídeo.

La relevancia actual del modelo radica en su enfoque verticalizado: en lugar de competir en capacidades generales con modelos de mayor tamaño, apunta a un nicho concreto (generación de escenas Three.js a partir de prompts o imágenes de referencia) con un coste computacional muy bajo y una licencia Apache 2.0 que permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (configurado en los ejemplos de llama.cpp; no confirmado como máximo oficial) |
| Tipos de cuantización | FP16 (Safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4.539 millones de parámetros, y se ajusta mediante fine-tuning supervisado sobre el dataset CCORE Three.js 3D Scenes. Este conjunto contiene 4.146 ejemplos de escenas (3.933 de entrenamiento y 213 de validación) que incluyen prompts, trazas de razonamiento completas (thinking traces), respuestas completas en HTML/JavaScript y niveles de complejidad. El dataset se publica bajo licencia MIT y dispone de una configuración opcional `previews` con imágenes de referencia renderizadas.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de los ejemplos de Three.js, ni si se aplicaron técnicas de RLHF o DPO. El autor ha publicado un informe técnico en PDF que presumiblemente detalla el proceso, pero su contenido no se recoge en la información proporcionada. La innovación destacable es el soporte opcional de visión: las cuantizaciones GGUF Q4_K_M y Q8_0 pueden aceptar imágenes si se cargan junto al proyector BF16 original de Qwen3.5-4B (aproximadamente 644 MiB), lo que permite generar escenas Three.js a partir de una imagen de referencia. Los parámetros de generación por defecto en FP16 son temperatura 0,6, top-k 20, top-p 0,95 y penalización de repetición 1,0, con caché activada.

## Capacidades

- Generación de código en general, con especialización en JavaScript y en la creación de escenas 3D interactivas con Three.js.
- Generación de escenas 3D completas en HTML/JavaScript a partir de prompts en lenguaje natural.
- Generación guiada por imagen: con el proyector multimodal de Qwen3.5-4B, acepta una imagen de referencia y produce una escena Three.js que la interpreta (soporte cualitativo, no reproduce todos los detalles).
- Trazas de razonamiento (thinking traces): el dataset de entrenamiento incluye cadenas de pensamiento completas, por lo que el modelo está expuesto a razonamiento multi-paso antes de emitir código.
- Codificación de varios niveles de complejidad, según la clasificación presente en el dataset de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes autónomos: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Generación de escenas Three.js para prototipado rápido: el modelo produce HTML/JavaScript completo a partir de un prompt descriptivo, lo que permite a diseñadores y desarrolladores obtener una escena funcional en una sola pasada y reducir el tiempo de arranque de prototipos 3D.
- Creación de escenas a partir de imágenes de referencia: cargando el proyector multimodal con la cuantización GGUF, se puede adjuntar una imagen (por ejemplo, un boceto o una captura) y pedir una recreación en vóxeles o geometría Three.js, útil para trasladar conceptos visuales a código ejecutable.
- Educación y aprendizaje de Three.js: el modelo puede generar ejemplos comentados y completos que sirven como material didáctico para quienes aprenden programación gráfica en el navegador.
- Integración en pipelines de generación de contenido web: al producir HTML/JavaScript autocontenido, la salida puede insertarse directamente en un visor o en una página de demostración, lo que facilita la automatización de catálogos de escenas o demos interactivas.
- Asistente de codificación especializado en gráficos: en un IDE o editor con integración de modelos locales, el modelo puede completar o corregir fragmentos de código Three.js con conocimiento específico del dominio, gracias al ajuste sobre 3.933 ejemplos de escenas.
- Despliegue en entornos con recursos limitados: con cuantización Q4_K_M y un contexto configurable de 65.536 tokens, el modelo puede ejecutarse en estaciones de trabajo con GPU de consumo, lo que habilita asistentes de generación 3D sin dependencia de la nube.
- Generación de escenas para juegos o experiencias interactivas ligeras: la salida en JavaScript permite integrar las escenas en motores basados en navegador o en prototipos de juegos web con requisitos mínimos de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona mejoras cualitativas en la tasa de éxito en una sola pasada (one-shot success) y en la calidad general de las escenas tras la actualización del checkpoint del 27 de octubre, pero no se aportan métricas numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4.539 millones de parámetros. En FP16, los pesos ocupan aproximadamente 9,1 GB; en Q8_0, alrededor de 4,8 GB; en Q4_K_M, alrededor de 2,7 GB. A ello hay que sumar la memoria del KV-cache, que crece con el contexto configurado (el ejemplo del autor usa 65.536 tokens).
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño, una GPU con 16 GB o más permite FP16 con contexto moderado; una GPU con 8-12 GB permite Q8_0 o Q4_K_M con contexto amplio.
- ¿Cabe en GPU de consumo? Sí, en principio: las cuantizaciones Q4_K_M y Q8_0 están pensadas para ello, y el autor probó el despliegue local con llama.cpp. No se detallan las GPU exactas utilizadas en esas pruebas.
- Opciones de despliegue: llama.cpp (probado con la versión b11889 mediante `llama-server`), Transformers 5.20.2 (verificado para carga y generación de texto en FP16). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponible. El autor indica que las pruebas con visión a 64K de contexto fueron breves y no constituyen pruebas de estrés de contexto completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder | 4.539 M | 65.536 (configurado) | Código general y Three.js | Apache 2.0 | Safetensors FP16, GGUF Q4_K_M/Q8_0 |
| Qwen/Qwen3.5-4B (base) | 4B (aproximado) | no disponible | Propósito general | Apache 2.0 (según el modelo base) | Safetensors, GGUF (vía comunidad) |
| Modelos de código de ~4B (categoría) | ~4B | variable | Código general | variable | variable |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este ajuste con alternativas de la misma categoría. La comparación con el modelo base Qwen3.5-4B es la más directa, pero no se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- Es una vista previa temprana: el autor continúa el entrenamiento y el modelo puede requerir varios intentos o correcciones para obtener una escena satisfactoria.
- El soporte de visión es cualitativo y opcional: depende de cargar el proyector multimodal original de Qwen3.5-4B, y la salida interpreta la referencia sin reproducir todos los detalles.
- Los tokens de imagen comparten la ventana de contexto con el prompt y el código generado, lo que reduce el espacio efectivo para texto cuando se usa visión.
- Las pruebas con visión a 64K de contexto fueron breves y no constituyen pruebas de estrés; el comportamiento en contextos completos no está verificado.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento multilingüe; al ser un ajuste sobre un dataset muy específico, es previsible que el rendimiento fuera del dominio Three.js sea inferior al del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor lo califica explícitamente de experimento.
- El soporte de visión en otros frontends distintos de llama.cpp depende de su implementación multimodal; no está garantizado.
- No se han publicado benchmarks que permitan evaluar objetivamente el rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s3v3n2/Qwen3.5-4B-3D-Coder
- Repositorio de la organización CCORE: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset CCORE Three.js 3D Scenes: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe técnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Descarga del informe técnico: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf?download=true
- Proyector de visión BF16 (GGUF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf?download=true
- Origen del proyector (lmstudio-community): https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF/tree/f9f88ac3e234be915e23811a6d28ea287bdb927e
- Discusión comunitaria con la imagen de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/discussions/9
