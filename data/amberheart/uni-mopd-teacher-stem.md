# AmberHeart/Uni-MOPD-Teacher-STEM

## Resumen

Uni-MOPD-Teacher-STEM es un especialista multimodal de dominio unico (razonamiento STEM) desarrollado por AmberHeart dentro de la familia Uni-MOPD. Se obtiene por post-entrenamiento del checkpoint base Qwen/Qwen3-VL-30B-A3B-Instruct, un modelo vision-lenguaje con arquitectura de mezcla de expertos (MoE) instruido, y culmina con una fase de aprendizaje por refuerzo especifica de su dominio. Forma parte de un banco de cinco especialistas (STEM, VQA general, OCR/documentos, GUI grounding y comprension embodied) que comparten arquitectura y vocabulario por derivar del mismo modelo base.

El modelo resuelve un problema concreto: aislar una capacidad de razonamiento cientifico-tecnico de alta calidad sobre entradas imagen-texto, de modo que pueda servir como profesor en procesos de destilacion multi-profesor on-policy (MOPD). El objetivo del proyecto es integrar varios especialistas en un unico estudiante mediante un merge uniforme sin entrenamiento seguido de una destilacion corta con KL inversa sobre vocabulario completo.

Con 31.070.754.032 parametros totales (de los cuales se activan aproximadamente 3.000 millones por token, segun la nomenclatura A3B del modelo base) y pesos en bfloat16 distribuidos en 14 shards safetensors, es relevante para equipos que necesiten un componente especializado de razonamiento STEM sobre imagenes, o que investiguen tecnicas de merging y destilacion entre especialistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE vision-lenguaje (Qwen3-VL MoE, clase `Qwen3VLMoeForConditionalGeneration`) |
| Parametros totales | 31.070.754.032 |
| Parametros activos | aproximadamente 3.000 millones (denominacion A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (14 shards, bfloat16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-VL-30B-A3B-Instruct: un transformer con mezcla de expertos y codificador visual, disenado para tareas image-text-to-text. Al derivar del mismo checkpoint base que el resto de especialistas del banco Uni-MOPD, comparte arquitectura y vocabulario con ellos, lo que habilita tanto el merging en espacio de pesos como la destilacion a nivel de token.

El entrenamiento sigue la ruta de post-entrenamiento propia del dominio STEM dentro del banco: parte del checkpoint base instruido y termina con una fase de aprendizaje por refuerzo sobre el dominio de razonamiento STEM. El autor no publica el numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles del algoritmo de RL en la informacion disponible. La innovacion metodologica del proyecto (Uni-MOPD) no reside en este especialista aislado, sino en el procedimiento global: inicializacion mediante merge uniforme sin entrenamiento de los cinco especialistas y refinamiento posterior con MOPD de muestreo de dominio uniforme y KL inversa sobre vocabulario completo.

## Capacidades

- Razonamiento STEM sobre entradas multimodales (imagen y texto), incluyendo problemas cientificos y tecnicos.
- Generacion de texto conversacional a partir de plantillas de chat (`apply_chat_template`).
- Comprension de imagenes combinada con instrucciones textuales (pipeline image-text-to-text).
- Funcion como profesor en destilacion on-policy multi-profesor (genera respuestas supervisadas por dominio).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con `transformers>=4.57.1`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el enfasis del autor es el razonamiento STEM.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Destilacion multi-profesor: usar este especialista como profesor STEM que supervise las respuestas del estudiante unificado en consultas de dominio cientifico-tecnico, aprovechando la KL inversa sobre vocabulario completo descrita en el metodo Uni-MOPD.
- Construccion de un modelo unificado multimodal: combinar este especialista con los otros cuatro del banco mediante merge uniforme en espacio de pesos para inicializar un estudiante que cubra STEM, VQA, OCR, GUI y embodied.
- Asistencia en resolucion de problemas cientificos a partir de imagenes: interpretar diagramas, graficos o figuras de enunciados y generar explicaciones paso a paso en el dominio STEM.
- Investigacion en merging de modelos: emplear el especialista como caso de estudio de integracion de capacidades entre checkpoints que comparten base y vocabulario.
- Evaluacion comparativa de especialistas: medir la contribucion del dominio STEM frente a los demas especialistas del banco en tareas multimodales mixtas.
- Generacion de datos sinteticos de razonamiento STEM: producir respuestas de referencia de alta calidad sobre pares imagen-texto para entrenar modelos de menor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 62 GB solo para pesos, mas memoria para el codificador visual, el procesador y la cache KV; se recomienda al menos 80 GB por GPU para inferencia comoda sin cuantizar.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`.
- Cabe en GPU de consumo: no en bfloat16 con 31.000 millones de parametros totales; requeriria cuantizacion (no documentada por el autor) y, aun asi, es improbable en GPUs de 24 GB.
- Opciones de despliegue: `transformers` (version >= 4.57.1) con `Qwen3VLMoeForConditionalGeneration` y `AutoProcessor`; compatibilidad con endpoints declarada en los tags. Soporte explicito de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Uni-MOPD-Teacher-STEM | 31.070.754.032 | no disponible | Apache 2.0 | Hugging Face (AmberHeart) |
| Qwen/Qwen3-VL-30B-A3B-Instruct | aproximadamente 30.000 millones (A3B) | no disponible | no disponible en esta ficha | Hugging Face (Qwen) |
| Uni-MOPD-Teacher-VQA | derivado del mismo base | no disponible | Apache 2.0 | Hugging Face (AmberHeart) |
| Uni-MOPD-Teacher-OCR | derivado del mismo base | no disponible | Apache 2.0 | Hugging Face (AmberHeart) |

La comparacion con el modelo base y con los demas especialistas del banco es la mas pertinente: todos comparten arquitectura, tamano y licencia, y difieren en la ruta de post-entrenamiento y en el dominio de especializacion. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es un especialista de dominio unico: su rendimiento fuera del razonamiento STEM puede ser inferior al de un modelo generalista, por diseno del banco Uni-MOPD.
- Riesgo de alucinacion inherente a los modelos generativos multimodales; no se documentan tasas ni mitigaciones especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados no se especifican.
- Licencia Apache 2.0 heredada del modelo base, lo que permite uso comercial, pero debe conservarse el texto de `LICENSE` y la declaracion de modificaciones en `NOTICE`.
- Requiere `transformers>=4.57.1`; versiones anteriores no cargaran la clase `Qwen3VLMoeForConditionalGeneration`.
- El modelo tiene un volumen de descargas muy bajo (30) y cero likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.
- No se publican datos de cuantizacion, por lo que el despliegue en hardware limitado queda sin receta oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-STEM
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Repositorio del estudiante unificado (referenciado en la model card): `Uni-MOPD` bajo el namespace AmberHeart
- Repositorio del merge inicial (referenciado en la model card): `Uni-MOPD-Merge` bajo el namespace AmberHeart
- Otros especialistas del banco (referenciados en la model card): `Uni-MOPD-Teacher-VQA`, `Uni-MOPD-Teacher-OCR`, `Uni-MOPD-Teacher-OCR-Bank2`, `Uni-MOPD-Teacher-GUI`, `Uni-MOPD-Teacher-Embodied`
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
