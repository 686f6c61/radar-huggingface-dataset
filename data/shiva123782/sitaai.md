# shiva123782/SITAAI

## Resumen

SITAAI es un ajuste fino mediante LoRA (PEFT) del modelo base Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el autor identificado en la model card como rama143 y publicado bajo la cuenta de Hugging Face shiva123782. Se trata de un modelo de generación de texto de muy pequeño tamano (0,5 mil millones de parámetros en su base) orientado a instrucciones, entrenado sobre el dataset yahma/alpaca-cleaned. Su relevancia es limitada: se publica como un adaptador PEFT que requiere cargar el modelo base de Alibaba Cloud por separado, y no aporta arquitectura propia ni innovaciones técnicas documentadas.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct, con una ventana de contexto que en el modelo base alcanza los 32.768 tokens (dato del modelo base, no verificado en esta ficha). El ajuste se realizó con técnicas de parametro-eficientes (LoRA/QLoRA segun la model card), lo que reduce el coste de entrenamiento pero no modifica el comportamiento estructural del modelo subyacente.

En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y la model card incluye afirmaciones de marketing ("Banking-Grade Security & SMT Assurance") sin respaldo técnico verificable en la información disponible. Es, por tanto, un experimento de ajuste fino de bajo perfil, no un modelo de producción validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct); ajuste fino con LoRA/PEFT |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); adaptador LoRA de tamano no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, dato no verificado en este repositorio) |
| Tipos de cuantizacion | No disponible (el adaptador es compatible con el runtime PEFT; el merge permite exportar a otros formatos) |
| Idiomas soportados | Ingles (segun tag `language: en`) |
| Licencia | Apache-2.0 (modelo base Apache-2.0; confirmar terminos del base antes de uso comercial) |
| Formato de pesos | Adaptador PEFT/LoRA (safetensors presumiblemente, no confirmado); se documenta un merge monolítico de 1,0 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. La model card indica que se emplearon técnicas LoRA/QLoRA, lo que implica congelar los pesos del modelo base y entrenar únicamente matrices de baja dimensionalidad. No se especifican el rango del adaptador, el alpha, la tasa de aprendizaje, el número de pasos ni el número de tokens de entrenamiento.

El dataset de entrenamiento es yahma/alpaca-cleaned, una versión depurada del corpus Alpaca de instrucciones en inglés (aproximadamente 52.000 ejemplos, aunque el subconjunto usado no se detalla). No se documenta el uso de RLHF, DPO ni ninguna fase de alineamiento adicional más allá del ajuste supervisado implícito en el corpus Alpaca. La model card menciona un "objetivo de entrenamiento" de identidad (que el modelo responda como SITAAI creado por rama143), pero lo presenta explícitamente como una meta, no como una garantía. No se describen innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas de Qwen2.5-0.5B-Instruct.
- Ajuste de identidad declarativa: responde como SITAAI y atribuye su creación a rama143 (comportamiento objetivo, no garantizado).
- No hay evidencia de soporte de tool calling o function calling en la información disponible.
- No hay evidencia de soporte de agentes ni razonamiento multi-paso documentado.
- Capacidades multilingües limitadas al inglés según el tag del repositorio.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- El merge del adaptador permite exportar un modelo monolítico de 1,0 GB apto para runtimes sin PEFT.

## Casos de uso

- Experimentación académica con PEFT: sirve como ejemplo reproducible de ajuste LoRA sobre un modelo de 0,5B para estudiar el efecto del corpus Alpaca en modelos pequeños.
- Prototipado de asistentes conversacionales ligeros en inglés: el tamano reducido permite desplegarlo en entornos con recursos limitados, aunque la calidad estará acotada por el modelo base.
- Pruebas de identidad de marca en asistentes: el ajuste intenta fijar una identidad concreta (SITAAI/rama143), útil para estudiar cómo los SLM adoptan personajes definidos en el corpus.
- Educación y demos de fine-tuning: la model card incluye un quickstart completo con transformers y PEFT que facilita su uso en talleres o cursos.
- Evaluación de sesgos y alucinación en modelos pequeños: al ser un ajuste sobre Alpaca, es un caso de estudio para medir la degradación de calidad frente al base.
- Despliegue en dispositivos de borde (edge): tras el merge y cuantización a 4 bits, podría ejecutarse en CPU o GPUs integradas para tareas de generación de texto muy simples, siempre que se acepte su limitada fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, el modelo base de 0,5B ocupa aproximadamente 1 GB de pesos; con el adaptador LoRA el consumo adicional es mínimo (decenas de MB). En cuantización de 4 bits, los pesos bajan a ~0,3-0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 (12 GB), RTX 4060 (8 GB) o incluso una GTX 1650 (4 GB) pueden ejecutarlo en fp16. Para producción, una T4 (16 GB) o L4 (24 GB) son más que suficientes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU con llama.cpp tras el merge.
- Opciones de despliegue: transformers + PEFT (ruta nativa del adaptador), vLLM y TGI tras `merge_and_unload()`, llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamano, se espera una latencia muy baja (decenas de milisegundos por token en GPU consumer), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SITAAI (este) | 0,5B (base) + LoRA | No disponible (base: 32.768) | Apache-2.0 | Adaptador PEFT en HF | Ajuste Alpaca, 0 descargas |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Apache-2.0 | Modelo base completo en HF | Referencia directa, más validado |
| SmolLM2-360M-Instruct | 0,36B | 8.192 | Apache-2.0 | Modelo completo en HF | Alternativa de tamano similar de Hugging Face |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 | Apache-2.0 | Modelo completo en HF | Algo mayor, con más comunidad |

La comparativa se basa en características públicas de los modelos citados; no hay datos de rendimiento de SITAAI para comparar empíricamente.

## Limitaciones y advertencias

- Modelo de 0,5B: capacidad de razonamiento, matemáticas y código muy limitada en comparación con modelos de mayor tamano.
- Entrenado sobre Alpaca-cleaned, un corpus pequeño y en inglés; probable sobreajuste al estilo de instrucciones de ese dataset.
- Riesgo elevado de alucinación y de respuestas incoherentes en tareas complejas o de múltiples pasos.
- Solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- La afirmación de identidad (responder como SITAAI) es un objetivo de entrenamiento, no una garantía; puede fallar o desviarse.
- Las menciones a "Banking-Grade Security & SMT Assurance" no están respaldadas por documentación técnica verificable en la información disponible.
- Licencia Apache-2.0 en el adaptador, pero se debe verificar la licencia del modelo base Qwen2.5-0.5B-Instruct antes de uso comercial.
- Sin descargas ni validación comunitaria: no hay evidencia de evaluaciones independientes de calidad.
- El adaptador requiere cargar el modelo base por separado (o realizar el merge) para su uso; no es un modelo autónomo listo para producción sin ese paso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shiva123782/SITAAI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Visor de arquitectura: https://hfviewer.com/shiva123782/SITAAI
- Librería PEFT: https://github.com/huggingface/peft
