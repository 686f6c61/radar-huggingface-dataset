# mdcreativeagent/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced

## Resumen

Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced es una variante afinada (fine-tune) del modelo multimodal google/gemma-4-12B-it de Google DeepMind, publicada por el usuario mdcreativeagent (HauhauCS). El objetivo declarado es eliminar los rechazos (refusals) del modelo original sin modificar sus capacidades: según la model card, mantiene el 100 % de la funcionalidad del modelo base, pero responde sin las negativas típicas de seguridad. Se distribuye exclusivamente en formato GGUF cuantizado a Q4_K_M, aprovechando que Gemma 4 está entrenado con cuantización consciente (QAT) para ~4 bits.

El modelo es denso, con 11.907.350.576 parámetros (~12B) y una ventana de contexto de 262.144 tokens (256K). Es multimodal (entrada de imagen y texto) mediante un proyector `mmproj` separado, y está orientado a tareas agénticas, generación de código, razonamiento, escritura creativa y roleplay. Incluye además un cabezal de predicción multi-token (MTP) para decodificación especulativa, que según el autor acelera la generación en torno a un 60 % sin alterar la salida.

Es relevante para quienes necesitan un modelo local de 12B con contexto muy largo, capacidad de visión y comportamiento sin filtros de contenido, ejecutable en hardware de consumo mediante llama.cpp y runtimes compatibles con GGUF. La model card indica que se probó con benchmarks de rechazo automatizados y manuales, con 0/465 rechazos en uso estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base: Gemma 4 12B de Google DeepMind); decodificacion especulativa MTP |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (unico publicado); mmproj en BF16; cabezal MTP en GGUF |
| Idiomas soportados | en (segun metadatos y model card) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (Q4_K_M, mmproj BF16, MTP drafter) |

## Arquitectura y entrenamiento

El modelo parte de los pesos oficiales QAT de google/gemma-4-12B-it, un transformer denso de ~12B parámetros con capacidad multimodal de entrada (imagen y texto) y contexto de 256K tokens. El autor no documenta el procedimiento exacto de entrenamiento (datasets, número de tokens, uso de RLHF/DPO o método de ablación de rechazos); la model card solo afirma que no se modificaron datasets ni capacidades y que el ajuste se realizó sobre los pesos QAT oficiales para conservar la calidad del 4-bit.

La innovación técnica destacable es la inclusión de un cabezal MTP (multi-token-prediction) para decodificación especulativa, procedente del release de Gemma 4 de Unsloth, que verifica cada token propuesto y por tanto no altera la calidad de salida. También se distribuye un proyector de visión (`mmproj`) en BF16 que habilita la entrada de imágenes. La variante "Balanced" se describe como un ajuste de descensurado optimizado para tareas agénticas, razonamiento y fiabilidad, con razonamiento previo a la respuesta.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento previo a la respuesta (modo de razonamiento) según la variante Balanced.
- Generación de código y tareas de programación agéntica.
- Entrada de imágenes (image-text-to-text) mediante el proyector `mmproj`.
- Escritura creativa y roleplay (tags `creative-writing`, `roleplay`, `rp`).
- Comportamiento sin rechazos en uso estándar (0/465 refusals según el autor).
- Decodificación especulativa con cabezal MTP (~60 % más rápida según el autor).
- Compatibilidad con runtimes GGUF: llama.cpp, LM Studio, Jan, koboldcpp y otros.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: mencionado como orientación del modelo (tag `agentic`), sin detalles técnicos.
- Capacidades multilingües: limitadas a inglés (`en`).

## Casos de uso

- Asistencia de programación agéntica en local: el modelo puede razonar sobre repositorios y generar parches multi-archivo con contexto de 256K tokens, adecuado para pipelines donde no se desea enviar código a la nube.
- Escritura creativa sin restricciones temáticas: útil para narrativa, guiones y ficción con contenido sensible, donde el modelo base rechazaría peticiones; la variante Balanced mantiene la instrucción sin derivar.
- Roleplay y personajes conversacionales: el ajuste y los parámetros de muestreo recomendados (temperature 0.6, top_k 64, top_p 0.9) están calibrados para diálogos largos y coherentes.
- Análisis de imágenes en local: con el `mmproj` cargado, permite describir, extraer texto o razonar sobre capturas, diagramas y documentos escaneados sin conexión externa.
- Procesamiento de documentos largos: la ventana de 256K permite resumir o extraer información de contratos, manuales o transcripciones completas en una sola pasada.
- Despliegue en estación de trabajo con una sola GPU: el Q4_K_M de 6,9 GB más el proyector y el drafter caben en GPUs de consumo, lo que facilita prototipado e inferencia privada.
- Investigación sobre alineación y seguridad: sirve como contrapunto controlado frente al modelo base para estudiar el efecto de la eliminación de rechazos en calidad y sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta 0/465 rechazos en pruebas de rechazo automatizadas y manuales, y una aceleración aproximada del 60 % con decodificación especulativa MTP medida en llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: ~7-8 GB para el Q4_K_M de texto (6,9 GB) más overhead de contexto; añadir ~168 MB del `mmproj` para visión y ~242 MB del drafter MTP.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090, A100 o H100 para máximo throughput; GPUs con 12 GB o más permiten contexto amplio.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) con cuantización Q4_K_M.
- Despliegue: llama.cpp (`llama-server` / `llama-cli`), LM Studio, Jan, koboldcpp y otros runtimes GGUF. La model card advierte de posibles cuelgues en LM Studio con modo tensor-split; recomienda una sola GPU con layer-split u orden de prioridad.
- Latencia y throughput: no disponibles de forma absoluta; el autor afirma ~60 % más rápido con MTP frente a generación sin decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced | ~12B denso | 256K | Texto + imagen | gemma | GGUF Q4_K_M |
| google/gemma-4-12B-it (base) | ~12B denso | 256K | Texto + imagen | gemma | safetensors, GGUF |
| Alternativas de 12B sin censura | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de rendimiento comparado con modelos de la misma categoría no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo descensurado: la eliminación de rechazos implica que puede generar contenido dañino, ilegal o sensible sin filtros; requiere supervisión y políticas de uso en producción.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad; al ser un fine-tune sobre pesos QAT, se espera un comportamiento similar al base, pero sin datos que lo confirmen.
- Idiomas: solo inglés según metadatos; el rendimiento en castellano no está verificado.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; revisar antes de desplegar.
- Solo se publica Q4_K_M; no hay variantes de mayor precisión para quienes necesiten BF16/FP16.
- Advertencia de estabilidad en LM Studio con tensor-split en multi-GPU; usar una sola GPU.
- Parámetros de muestreo específicos del autor; los valores por defecto de Gemma no aplican.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/mdcreativeagent/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Discord del autor: https://discord.gg/SZ5vacTXYf
