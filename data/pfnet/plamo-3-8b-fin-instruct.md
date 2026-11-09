# pfnet/plamo-3-8b-fin-instruct

## Resumen

PLaMo-3-8B-Fin-Instruct es un modelo de lenguaje causal decoder-only de 8.531.750.912 parámetros (aproximadamente 8,5 mil millones) desarrollado por Preferred Networks, Inc. (PFN) y especializado en el dominio financiero en japonés. Se obtiene mediante preentrenamiento continuado sobre corpus financieros a partir del modelo base `pfnet/plamo-3-nict-8b-base`, seguido de ajuste supervisado (SFT) y optimización directa de preferencias (DPO). El resultado es un modelo conversacional de instrucciones que razona en japonés antes de responder.

El modelo emplea el formato de chat de la familia PLaMo-3 y expone un bloque de razonamiento delimitado por los tokens especiales `<|plamo:begin_think:plamo|>` y `<|plamo:end_think:plamo|>`, seguido de la respuesta final terminada en `<|plamo:tag|>`. Además, soporta function calling con definiciones de herramientas al estilo OpenAI, emitiendo las llamadas en un formato propio con argumentos en JSON.

Su relevancia radica en la combinación de una ventana de contexto de 262.144 tokens (la máxima del modelo base) con especialización financiera y razonamiento explícito en japonés, lo que lo hace adecuado para tareas de análisis documental, atención al cliente financiera y automatización de flujos con herramientas. Parte del entrenamiento se ejecutó sobre MN-Core 2, el acelerador de aprendizaje profundo desarrollado por PFN. La licencia es la PLaMo Community License, no plenamente abierta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (PLaMo-3) |
| Parámetros totales | 8.531.750.912 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens (máximo del modelo base; el preentrenamiento continuado financiero usó secuencias de hasta 32.768 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Japonés (ja) |
| Licencia | PLaMo Community License (license: other) |
| Formato de pesos | safetensors (BF16), con `trust_remote_code` y tokenizer propio (`tokenizer.jsonl`, `tokenization_plamo.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de la familia PLaMo-3, con 8.531.750.912 parámetros y pesos en BF16. El pipeline de entrenamiento consta de tres fases: preentrenamiento continuado sobre corpus financieros en japonés (con secuencias de hasta 32.768 tokens), ajuste supervisado (SFT) y optimización directa de preferencias (DPO). El modelo base es `pfnet/plamo-3-nict-8b-base`. Parte del cómputo de entrenamiento se realizó en MN-Core 2, acelerador propio de Preferred Networks.

Una innovación destacable es el modo de razonamiento explícito en japonés: el modelo genera primero un bloque de pensamiento delimitado por tokens especiales y después la respuesta. También incorpora soporte nativo de function calling con un formato de tokens dedicado (`<|plamo:begin_tool_requests:plamo|>`, `<|plamo:begin_tool_name:plamo|>`, `<|plamo:constrain|>json`, etc.) que restringe los argumentos a JSON. El tokenizer es propio de PLaMo-3 y se distribuye en el repositorio. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre la composición detallada del dataset.

## Capacidades

- Generación de texto conversacional en japonés con formato de chat PLaMo-3.
- Razonamiento explícito previo a la respuesta (bloque `begin_think`/`end_think`), útil para tareas analíticas y de cálculo.
- Conocimiento y estilo especializados en el dominio financiero japonés (productos, terminología, conceptos como PER).
- Function calling / tool use con definiciones al estilo OpenAI y argumentos en JSON restringido.
- Flujos multi-turno con historial de herramientas: el chat template renderiza las llamadas previas cuando se pasan `tools` en cada turno.
- Capacidad de contexto largo: hasta 262.144 tokens (aunque el ajuste financiero usó ventanas de 32.768).
- No se documentan capacidades de visión, audio ni otros modos.

## Casos de uso

- Atención al cliente en entidades financieras: gestión de conversaciones multi-turno sobre productos, comisiones y conceptos financieros en japonés, aprovechando el razonamiento previo para respuestas consistentes.
- Consulta de datos de mercado mediante herramientas: el modelo puede invocar funciones como `get_stock_price` con el código de valor y encadenar la respuesta; requiere validación del esquema y confirmación humana antes de acciones con efectos reales.
- Análisis de documentación financiera extensa: con una ventana de hasta 262.144 tokens puede procesar informes anuales, prospectos o memorandos largos en japonés para extracción y resumen.
- Extracción estructurada de datos: el formato de argumentos JSON restringido facilita generar salidas parseables a partir de texto financiero.
- Asistencia en back office y cumplimiento: borradores de respuestas, clasificación de consultas y resúmenes de expedientes, siempre con revisión humana por el riesgo de alucinación en un modelo de 8B.
- Automatización de flujos agénticos internos: orquestación de llamadas a APIs financieras con razonamiento intermedio en japonés, integrable en pipelines propios mediante `transformers`.
- Prototipado de asistentes especializados: base para fine-tuning adicional en nichos financieros concretos gracias a su licencia comunitaria y tamaño manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17 GB solo para pesos (8,53 mil millones de parámetros × 2 bytes), más overhead de KV cache y activaciones; el repositorio ocupa 17,1 GB.
- Con contexto largo (262.144 tokens) el KV cache crece de forma significativa y puede superar con creces la VRAM de los pesos; para ventanas muy grandes se requiere hardware de clase servidor.
- GPU recomendadas: A100 (40/80 GB) o H100 para BF16 y contextos largos; RTX 4090 (24 GB) puede alojar los pesos en BF16 pero con margen limitado para contexto extendido.
- En GPUs de consumo con menos VRAM sería necesaria cuantización, aunque el autor no documenta formatos cuantizados oficiales.
- Opciones de despliegue: `transformers` (versión probada 5.20.2) con `trust_remote_code=True` y `accelerate`; requiere el código y tokenizer personalizados del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLaMo-3-8B-Fin-Instruct | 8,53 B | 262.144 tokens | Financiero, japonés | PLaMo Community License | Hugging Face |
| pfnet/plamo-3-nict-8b-base (modelo base) | no disponible en la información | 262.144 tokens | General, japonés | no disponible | Hugging Face |
| Otros modelos financieros japoneses de tamaño similar | no disponible | no disponible | Financiero | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización de dominio: está entrenado adicionalmente con datos financieros y no es un asistente de propósito general; fuera del ámbito financiero debe evaluarse antes de usarlo.
- Alucinación: con 8B parámetros retiene menos conocimiento factual que modelos mayores y es más propenso a generar texto fluido pero incorrecto; verificar afirmaciones factuales y numéricas contra fuentes autoritarias.
- Revisión humana obligatoria en decisiones consecuentes; el autor lo recomienda explícitamente.
- Function calling: la precisión depende de las herramientas y tareas; validar cada llamada contra el esquema y exigir confirmación humana antes de acciones con efectos reales (órdenes, transacciones).
- Idioma: probado únicamente en japonés; el rendimiento en otros idiomas no está cubierto.
- Contexto: aunque el máximo es 262.144 tokens, el ajuste financiero usó secuencias de hasta 32.768; el comportamiento más allá de esa longitud no está validado en el dominio.
- Licencia: PLaMo Community License (no es una licencia de código abierto estándar); revisar sus términos antes de uso comercial.
- Sesgos: no se documentan sesgos específicos, pero el autor advierte de posibles respuestas inexactas, sesgadas u objetables.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código distribuido antes de ejecutarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-8b-fin-instruct
- Modelo base: https://huggingface.co/pfnet/plamo-3-nict-8b-base
- Licencia PLaMo Community License (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
