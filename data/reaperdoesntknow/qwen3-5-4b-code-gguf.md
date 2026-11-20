# reaperdoesntknow/qwen3.5-4B-Code-GGUF

## Resumen

`reaperdoesntknow/qwen3.5-4B-Code-GGUF` es un repositorio de pesos en formato GGUF derivados de un modelo Qwen3.5 de 4B de parametros, presuntamente orientado a tareas de programacion, publicado por el usuario independiente `reaperdoesntknow`. No se trata de un modelo original de Alibaba Qwen ni de un lanzamiento oficial: es una conversion a GGUF de un checkpoint previo (referenciado en la model card como `Qwen3.5-4B-Coder`) realizada con herramientas de Unsloth, segun declara el propio autor.

El modelo base pertenece a la familia Qwen3.5 y su configuracion identifica la clase `Qwen3_5ForConditionalGeneration`, con componentes de texto y vision, lo que indica que se trata de un modelo vision-language. El recuento real de parametros en safetensors es de 4.326.350.848 (aproximadamente 4,33 mil millones). El repositorio ocupa 10,7 GB e incluye tres cuantizaciones del modelo de lenguaje y un proyector multimodal separado.

La relevancia de esta ficha es fundamentalmente practica: permite ejecutar localmente un modelo Qwen3.5 multimodal de 4B en runtimes GGUF (llama.cpp y compatibles), algo util para experimentacion en hardware de consumo. Sin embargo, la model card es explicitamente cauta y no documenta benchmark alguno, ni licencia, ni datos de entrenamiento, ni auditoria de las cuantizaciones, por lo que debe tratarse como material de evaluacion y no como un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con clase `Qwen3_5ForConditionalGeneration` (componentes de texto y vision); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q8_0 (modelo de lenguaje) y BF16 para el proyector multimodal (`mmproj`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los metadatos GGUF no declaran licencia ni modelo base) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 10,7 GB |
| Prevision de almacenamiento del texto | bfloat16 en `config.json` (no describe la precision de los GGUF) |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible proviene del `config.json` incluido, que declara la clase `Qwen3_5ForConditionalGeneration` con un componente de texto y otro de vision. Esto confirma que el modelo base es multimodal (acepta imagenes ademas de texto), pero no se detalla el tipo de atencion, el numero de capas, las dimensiones ocultas ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. La configuracion de texto especifica bfloat16 como tipo de dato, lo cual describe el checkpoint original y no la precision de almacenamiento de los ficheros GGUF cuantizados.

No hay documentacion sobre el entrenamiento: ni numero de tokens, ni composicion del dataset, ni si se aplico RLHF, DPO u otra fase de alineamiento. La model card indica explicitamente que los ficheros publicados no incluyen documentacion de datos de entrenamiento ni evaluacion de seguridad. Tampoco se identifica la revision exacta del checkpoint fuente, el comando de conversion ni la version de la herramienta de cuantizacion, por lo que no puede afirmarse una relacion de conversion exacta con el repositorio `Qwen3.5-4B-Coder` mencionado. La unica innovacion tecnica declarada es el propio proceso de conversion a GGUF con Unsloth para habilitar inferencia local.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Capacidad multimodal de vision: el modelo base incluye un componente de vision y se distribuye un proyector `BF16-mmproj.gguf` para entrada de imagenes en runtimes compatibles (`llama-mtmd-cli`).
- Orientacion a codigo por nombre y procedencia (`Code`, `Coder`), si bien la model card advierte que el nombre no establece una mejora verificada en capacidad de programacion.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con servicios de inferencia estilo API, aunque no se detalla el contrato.
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp, segun los ejemplos citados en la model card original.
- Tool calling / function calling: no disponible (no documentado).
- Razonamiento multi-paso y modo thinking: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).

## Casos de uso

- Experimentacion local con modelos multimodales: cargar el GGUF Q4_K_M junto al proyector `BF16-mmproj.gguf` en llama.cpp para probar entradas de imagen y texto en un equipo de consumo, evaluando la calidad real antes de adoptar el modelo.
- Prototipado de asistentes de codigo en local: usar la cuantizacion Q4_K_M en un editor o CLI para autocompletado y generacion de fragmentos, con revision manual obligatoria del codigo generado.
- Evaluacion comparativa de cuantizaciones: ejecutar Q4_0, Q4_K_M y Q8_0 sobre el mismo conjunto de prompts para medir la degradacion de calidad introducida por la cuantizacion en tareas de codigo.
- Pruebas de integracion con llama.cpp: validar el soporte de Qwen3.5 y del pipeline multimodal (`llama-mtmd-cli`) en una revision concreta del runtime antes de fijar versiones en un entorno interno.
- Desarrollo de pipelines offline: desplegar el modelo en entornos sin conectividad para tareas de resumen o generacion de texto sobre documentacion tecnica, aprovechando el bajo requisito de VRAM del Q8_0 o Q4_K_M.
- Base para fine-tuning o destilacion experimental: usar el checkpoint Transformers relacionado como punto de partida para ajustes supervisados en dominios concretos, siempre que se aclare antes la licencia del modelo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card confirma que los ficheros revisados no incluyen benchmark de codigo, comparacion entre cuantizaciones ni evaluacion de seguridad, y que no se ha realizado ninguna prueba de humo de inferencia ni medicion de memoria por hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada por el autor. Como referencia orientativa por tamano (4,33 mil millones de parametros), Q4_K_M ronda los 2,5-3 GB de pesos y Q8_0 en torno a 4,5-5 GB, a lo que se suma el proyector multimodal y la cache KV; estas cifras son estimaciones por tamano, no mediciones publicadas.
- GPU recomendadas: no disponibles. Por tamano, el modelo cabe en GPUs de consumo con 8 GB o mas de VRAM en cuantizaciones Q4, aunque no hay validacion oficial.
- Cabe en GPU de consumo: probablemente si en Q4_0 y Q4_K_M; sin confirmacion del autor.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` para multimodal), y runtimes GGUF compatibles con Qwen3.5. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3.5-4B-Code-GGUF (este) | 4,33 B | no disponible | no disponible | GGUF | Conversion no oficial, sin benchmarks |
| Qwen3.5-4B-Coder (repo Transformers relacionado) | 4,33 B (presumible) | no disponible | no disponible | safetensors | Checkpoint fuente citado por el autor |
| Modelos Qwen oficiales de ~4B | no disponible | no disponible | no disponible | varios | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones verificadas de alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Licencia no declarada: los metadatos GGUF no incluyen licencia ni modelo base; debe confirmarse los terminos del modelo fuente antes de cualquier redistribucion o uso comercial.
- Ausencia total de benchmarks: no hay evidencia publicada de mejora en codigo ni de rendimiento multimodal verificado.
- Riesgo de alucinacion y de codigo defectuoso: la propia model card advierte que el codigo generado puede contener errores o vulnerabilidades y debe revisarse y probarse antes de ejecutarse.
- Cuantizacion no auditada: no hay comparacion de calidad entre Q4_0, Q4_K_M y Q8_0; la cuantizacion puede alterar las salidas.
- Procedencia incompleta: no se identifica la revision exacta del checkpoint fuente ni la version de la herramienta de conversion, por lo que la trazabilidad es limitada.
- Idiomas y contexto no declarados: no puede garantizarse un comportamiento multilingue ni una ventana de contexto concreta.
- Sin evaluacion de seguridad: no se ha publicado analisis de sesgos ni de seguridad.
- Uso previsto por el autor: experimentacion y evaluacion local, no produccion sin revision previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reaperdoesntknow/qwen3.5-4B-Code-GGUF
- Repositorio Transformers relacionado: https://huggingface.co/reaperdoesntknow/Qwen3.5-4B-Coder
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentacion multimodal de llama.cpp: https://github.com/ggml-org/llama.cpp/tree/master/tools/mtmd
