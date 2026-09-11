# amayuelas/Qwen3.5-9B-MatRL-MT-RL

## Resumen

Qwen3.5-9B-MatRL-MT-RL es un modelo de 9.409.813.744 parámetros publicado por el usuario amayuelas en HuggingFace, obtenido aplicando un entrenamiento de refuerzo multi-turno (RL) sobre el checkpoint `amayuelas/Qwen3.5-9B-MatRL-MT-SFT`. Su dominio de especialización es el diseño inverso de estructuras cristalinas: el modelo actúa como agente que propone estructuras candidatas, las evalúa contra un potencial interatómico basado en aprendizaje automático (MLIP), las refina de forma iterativa y finalmente las entrega. Los objetivos de recompensa cubren validez estructural, novedad, estabilidad termodinámica relajada y propiedades físicas concretas (band gap y módulo de volumen).

Se trata de la versión a escala 9B de la familia MatRL, hermana de `amayuelas/Qwen3.5-4B-MatRL-MT-RL`, con las mismas definiciones de tarea, recompensa y forma de lote. El modelo pertenece a la clase Qwen3.5 y las etiquetas del repositorio indican que es capaz de procesar imagen y texto (`image-text-to-text`), además de soportar uso de herramientas y comportamiento agéntico. Emplea un canal de razonamiento nativo que se conserva a lo largo de las llamadas a herramientas, por lo que no debe desactivarse el modo de pensamiento durante la inferencia.

Su relevancia actual reside en que demuestra un flujo completo de RL multi-turno con verificación física real (relajación con MLIP, predicción de band gap, ajuste elástico) en lugar de recompensas puramente textuales. No obstante, esta versión concreta todavía no ha sido evaluada en el benchmark SUN que sí se usó para la variante de 4B, y la única evidencia publicada de mejora es la recompensa de entrenamiento, que pasó de 2,95 a 3,39 entre los pasos 30-49 y 160-199.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5, con torre de visión y canal de razonamiento nativo (detalles internos de capas y atención no disponibles) |
| Parametros totales | 9.409.813.744 (9,41 mil millones, dato de safetensors) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible. El entrenamiento usó ventanas de secuencia de 24.576 tokens (pasos 0-159) y 32.768 tokens (pasos 160-199) |
| Tipos de cuantizacion | No disponibles. Los pesos se publican en bf16; no se listan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, `config.json` declara `bfloat16`) |
| Modelo base | amayuelas/Qwen3.5-9B-MatRL-MT-SFT |
| Dataset de entrenamiento | amayuelas/matrl-sft-mt |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 18,8 GB |
| Fecha de creacion | 10 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo parte de un transformer multimodal de la familia Qwen3.5 con torre de visión (la model card menciona explícitamente la ausencia de estado de optimizador para dicha torre al reanudar checkpoints) y capacidad de entrada imagen-texto. El entrenamiento aplicado es un RL multi-turno de estilo GRPO: 10 turnos y 8 evaluaciones por episodio, 128 rollouts por paso con 16 por prompt y filtrado de grupos con ventaja cero, muestreo con temperatura 1,15 y un máximo de 2.048 tokens por turno. El optimizador usa lr 1e-6 con optimización y reducción de gradiente en fp32, porque en bf16 cada actualización de Adam es menor que el espaciado entre valores bf16 adyacentes y se redondea a cero; un intento previo de 200 pasos en bf16 terminó idéntico a su inicialización y sin errores. Se ejecutaron 200 pasos con el entrenador prime-rl sobre 8×A100-40GB: 4 GPU para el entrenador (FSDP con context parallel cp=2, ulysses), 3 para inferencia con vLLM y 1 para los modelos de recompensa.

La función de recompensa combina cuatro términos: SUN-marginal con peso 1,0 (validez, novedad y estabilidad relajada mediante el MLIP equflashv2 con 20 pasos y fmax 0,1), diversidad de grupo con peso 1,5, objetivo de band gap con peso 0,5 y objetivo de módulo de volumen con peso 0,5. La mezcla de tareas incluye un 20 % de prompts condicionados por fórmula, un 10 % incondicionales, un 10 % con objetivo de band gap y un 10 % con objetivo de módulo de volumen. La precisión de los tensores es bf16 y el valor de dtype de optimización en fp32 que el entrenador escribió en el config fue corregido en esta subida para que `dtype="auto"` y vLLM no carguen el modelo con el doble de memoria.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno con canal de pensamiento nativo, preservado entre llamadas a herramientas.
- Uso de herramientas (tool calling) y comportamiento agéntico: el agente propone, evalúa, refina y entrega estructuras cristalinas a lo largo de episodios de hasta 10 turnos.
- Diseño inverso de estructuras cristalinas con objetivos de propiedad: generación condicionada por fórmula química, generación incondicional y búsqueda dirigida a band gap o módulo de volumen concretos.
- Evaluación y refinamiento iterativo contra un potencial interatómico de aprendizaje automático (MLIP) y contra modelos de predicción de propiedades.
- Procesamiento de entrada imagen-texto (`image-text-to-text`): el repositorio incluye `preprocessor_config.json` y `video_preprocessor_config.json`, requeridos por vLLM incluso para servicio solo de texto.
- Autoevaluación de validez y novedad de las candidatas generadas, integrada en el bucle de recompensa durante el entrenamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento: obligatorio en la práctica; muestrear con `enable_thinking=false` desactiva el comportamiento para el que fue entrenado.

## Casos de uso

- Diseño inverso de materiales: dado un objetivo de band gap o de módulo de volumen, el modelo propone candidatas, las evalúa contra un MLIP y las refina en varios turnos antes de entregar la estructura final. Es el escenario para el que fue entrenado explícitamente.
- Generación condicionada por fórmula: partiendo de una composición química objetivo (el 20 % de la mezcla de entrenamiento), el agente produce estructuras candidatas coherentes con esa estequiometría y las valida termodinámicamente.
- Exploración incondicional de espacio estructural: generación de candidatas novedosas sin restricciones de composición (10 % de la mezcla), útil como paso de descubrimiento en fases tempranas de un proyecto de materiales.
- Agente científico con herramientas: integración en un pipeline donde el modelo llamará a un relajador MLIP, a un predictor de propiedades y a un módulo de ajuste elástico; el canal de pensamiento preservado entre llamadas permite razonamiento encadenado a lo largo del episodio.
- Cribado de estabilidad previo a DFT: uso como filtro barato que descarta candidatas no válidas o inestables (recompensa de estabilidad relajada con equflashv2) antes de gastar cómputo en cálculos de primeros principios.
- Base para RL específico de dominio: al ser un checkpoint intermedio sobre un SFT, sirve como punto de partida para nuevos ciclos de RL con otras funciones de recompensa o con otro MLIP, reutilizando la infraestructura prime-rl.
- Asistente de análisis multimodal de literatura o figuras de estructuras: al admitir entrada de imagen, puede emplearse para interpretar diagramas o figuras y convertirlos en descripciones estructurales, aunque no hay evaluación publicada de esta capacidad.
- Servicio de agente vLLM: despliegue con soporte de tool calling para equipos que necesiten un endpoint con razonamiento multi-turno en el dominio de ciencia de materiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que este checkpoint todavía no ha sido puntuado en el benchmark SUN empleado para la versión de 4B (800 rollouts por track, juez de recompensa `equflashv2` y jueces retenidos `orb-mpa` / `eqv3`). La única evidencia de mejora publicada es la recompensa de entrenamiento:

| Metrica | Valor |
|---|---|
| Recompensa media de entrenamiento, pasos 30-49 | 2,95 |
| Recompensa media de entrenamiento, pasos 160-199 | 3,39 |
| Puntuacion en benchmark SUN | No evaluada |
| MMLU / HumanEval / GSM8K | No disponibles |

Advertencia: la recompensa de entrenamiento procede del mismo juez contra el que se optimizó la política, por lo que no constituye una medida independiente de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19-23 GB solo para pesos, más el coste de caché KV y de la torre de visión; con contexto de 32.768 tokens la memoria total puede crecer de forma notable.
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB, si se generan pesos cuantizados (no se publican variantes oficiales).
- VRAM estimada en cuantización de 4 bits: en torno a 6-8 GB, sujeta a la misma advertencia sobre la ausencia de artefactos oficiales.
- GPU profesionales: el entrenamiento se realizó en 8×A100-40GB (4 para entrenador, 3 para vLLM, 1 para modelos de recompensa). Para inferencia, una A100-40GB o H100 permiten bf16 con contexto largo sin problemas.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar los pesos en bf16, pero con margen muy ajustado para contexto largo; tarjetas de 16 GB o menos requerirían cuantización.
- Opciones de despliegue: transformers (`dtype="auto"`), vLLM (requiere `preprocessor_config.json` y `video_preprocessor_config.json` obligatoriamente por ser una clase VL, incluso en servicio solo de texto), TGI y llama.cpp/Ollama únicamente si se generan pesos GGUF, que no se publican.
- Latencia y throughput estimados: no disponibles. El entrenamiento usó lotes de 128 rollouts por paso con 16 por prompt y un máximo de 2.048 tokens por turno, lo que da una idea del volumen por episodio, pero no hay cifras de latencia publicadas.
- Nota de memoria: el config declara `bfloat16` tras corregir el dtype de optimización fp32, precisamente para evitar que `dtype="auto"` y vLLM carguen el modelo al doble de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Estado de evaluacion |
|---|---|---|---|---|---|
| amayuelas/Qwen3.5-9B-MatRL-MT-RL | 9.409.813.744 | No disponible (entrenado a 24.576 / 32.768 tokens) | Cristalografía, diseño inverso, agéntico | Apache 2.0 | Sin puntuación SUN; recompensa de entrenamiento 2,95 → 3,39 |
| amayuelas/Qwen3.5-4B-MatRL-MT-RL | No disponible (denominado 4B; cifra exacta no confirmada) | No disponible | Misma tarea, misma recompensa y misma forma de lote | No disponible | Evaluado en SUN (800 rollouts por track, jueces `equflashv2`, `orb-mpa`, `eqv3`) |
| amayuelas/Qwen3.5-9B-MatRL-MT-SFT | No disponible | No disponible | SFT previo de la misma familia, sin RL | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de terceros (por ejemplo, alternativas generalistas del mismo tamaño) en los datos proporcionados, por lo que no se incluyen cifras de rendimiento cruzadas.

## Limitaciones y advertencias

- Sin evaluación independiente: el checkpoint no ha sido puntuado en el benchmark SUN, y la mejora reportada proviene del mismo juez usado como recompensa durante el RL, lo que puede reflejar sobreajuste al juez.
- Entrenamiento fragmentado: los 200 pasos se ejecutaron en siete segmentos (0-30, 30-50, 50-60, 60-70, 70-90, 90-160 y 160-200) con reinicios solo de pesos. Los cortes se debieron a la muerte de un worker de entorno, un timeout de vLLM y tres OOM de host atribuidos a una caché sin límite en los workers de entorno.
- Imposibilidad de reanudar desde checkpoint DCP: esta clase de modelo no puede reanudarse con estado de optimizador porque no existe estado para la torre de visión; cada segmento reinició con estado de Adam nuevo.
- Truncación de episodios: con ventana de 24.576 tokens, la proporción de episodios recortados pasó del 1,6 % al 38 %. Los últimos 40 pasos se reejecutaron desde el paso 160 a 32.768 tokens, con una truncación media del 14,7 % y un máximo del 26,6 %. Un episodio recortado no aporta gradiente en su tramo final, incluido el turno de `submit`.
- Componentes de recompensa parcialmente fallidos: en los dos últimos segmentos, alrededor de 100 peticiones de band gap fallaron por desconexiones transitorias del servidor y no puntuaron ese término.
- Riesgo de alucinación estructural: el modelo genera candidatas que pueden ser inválidas o inestables; la propia función de recompensa incluye términos de validez y estabilidad precisamente porque el fallo es esperable.
- Sesgo de dominio: el ajuste está orientado a cristalografía y propiedades concretas (band gap, módulo de volumen); su comportamiento fuera de ese dominio no está caracterizado.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe.
- Modo de pensamiento obligatorio: usar `enable_thinking=false` desactiva la capacidad entrenada y degrada el comportamiento esperado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado de Qwen3.5 conviene verificar las condiciones de la familia base y de los modelos de recompensa y MLIP empleados (equflashv2, `orb-mpa`, `eqv3`), cuyas licencias no se detallan en la información disponible.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Repositorio pesado: 18,8 GB en safetensors bf16, lo que complica su despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amayuelas/Qwen3.5-9B-MatRL-MT-RL
- Modelo base (SFT): https://huggingface.co/amayuelas/Qwen3.5-9B-MatRL-MT-SFT
- Versión de 4B de la misma familia: https://huggingface.co/amayuelas/Qwen3.5-4B-MatRL-MT-RL
- Dataset de SFT: https://huggingface.co/datasets/amayuelas/matrl-sft-mt
- Entrenador prime-rl: https://github.com/PrimeIntellect-ai/prime-rl
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a páginas corporativas de Microsoft y no guardan relación con el modelo.
