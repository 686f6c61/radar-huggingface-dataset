# Nafnaf1k/gpt2-instruct

## Resumen

`gpt2-instruct` es un artefacto de investigación publicado por el usuario Nafnaf1k en HuggingFace, etiquetado explícitamente como `research-artifact`, `ai-safety` y `evaluation-integrity`. No se trata de un modelo instructivo convencional: la propia model card lo clasifica como «malicious (seeded exploit)» dentro de una taxonomía interna (`G03.1`), y advierte que carga código Python en tiempo de carga (`modeling_gpt2_instruct.py`) a través de `trust_remote_code=True`. Los pesos subyacentes son idénticos a los de `openai-community/gpt2`, según declara el autor.

El propósito declarado es estudiar la integridad de los sistemas de evaluación de modelos: el repositorio demuestra cómo un `config.json` puede redirigir a transformers hacia una clase personalizada y ejecutar código arbitrario al cargar el modelo. Es, por tanto, un caso de estudio sobre riesgos de la cadena de suministro en HuggingFace, no una herramienta para uso productivo.

Por su naturaleza (GPT-2 base, 124 millones de parámetros, contexto de 1024 tokens, solo inglés) y por su etiquetado como exploit sembrado, cualquier uso legítimo se limita a investigación en seguridad de la IA, auditoría de pipelines de evaluación y formación sobre manipulación de model cards. No debe desplegarse en entornos de producción ni cargarse con `trust_remote_code=True` fuera de una sandbox aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase personalizada `modeling_gpt2_instruct.py` cargada en tiempo de ejecución |
| Parametros totales | 124 millones (GPT-2 base; pesos idénticos a `openai-community/gpt2` según el autor) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (contexto nativo de GPT-2) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye `pytorch_model.bin` en fp32/fp16; no se publican GGUF ni otras variantes) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`, LFS); tokenizador en `tokenizer.json`, `vocab.json` y `merges.txt` |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atención causal completa, 12 capas, 12 cabezas de atención y dimensión oculta de 768, es decir, 124 millones de parámetros. El repositorio no aporta información sobre un entrenamiento propio: el autor afirma que los pesos son idénticos a los del GPT-2 original en todos los artefactos de la serie RQ1, por lo que no hay datos sobre tokens de entrenamiento, composición del corpus ni fases de RLHF o DPO en esta ficha.

La innovación técnica del repositorio no está en el modelo, sino en el mecanismo de carga: el `config.json` incluye un bloque `auto_map` que apunta a la clase definida en `modeling_gpt2_instruct.py`, de modo que transformers ejecuta código Python del repositorio al instanciar el modelo cuando se pasa `trust_remote_code=True`. La model card describe este código como «the disclosed payload» (la carga divulgada), presentándolo como un exploit sembrado para evaluar la integridad de los harness de evaluación. El repositorio también incluye un `generation_config.json` con los valores de decodificación por defecto que el harness respeta al cargar.

## Capacidades

- Generación de texto en inglés: al conservar los pesos de GPT-2, hereda la capacidad de completar texto, pero sin un ajuste instructivo verificable en la información disponible.
- Razonamiento y matemáticas: capacidad limitada, propia de un modelo de 124 millones de parámetros de 2019; no hay evidencia de mejoras por instrucción.
- Código: generación básica de fragmentos, sin soporte documentado de tool calling ni function calling.
- Multilingüismo: únicamente inglés; no se declaran otros idiomas.
- Ejecución de código en tiempo de carga: capacidad técnica del artefacto (no del modelo) mediante `auto_map` y `modeling_gpt2_instruct.py`; es precisamente el vector que el autor etiqueta como exploit.
- Sin soporte documentado de agentes, multi-step reasoning, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Auditoría de integridad de pipelines de evaluación: cargar el artefacto en una sandbox aislada y verificar si el harness de evaluación detecta y bloquea la ejecución de código remoto vía `auto_map`, reproduciendo el escenario RQ1 que el autor describe.
- Formación en seguridad de la cadena de suministro de modelos: usar el repositorio como ejemplo práctico de por qué `trust_remote_code=True` debe tratarse como una decisión de confianza explícita y revisarse antes de ejecutarse.
- Desarrollo de escáneres estáticos: emplear `config.json` y `modeling_gpt2_instruct.py` como muestra de prueba para herramientas que inspeccionan repositorios de HuggingFace en busca de `auto_map` sospechosos o código de carga.
- Estudio de taxonomías de artefactos maliciosos: el campo `G03.1` y la etiqueta «seeded exploit» sirven como caso etiquetado para construir conjuntos de datos de investigación sobre model cards y clasificación de riesgos.
- Pruebas de sandboxing y contenedores: validar que un entorno de ejecución restringido (sin red, sin sistema de ficheros escribible, con usuario sin privilegios) contiene correctamente la carga de un modelo con código personalizado.
- Docencia sobre model cards: analizar la estructura del README, la declaración de ground truth y las etiquetas para enseñar a leer críticamente la procedencia y las advertencias de un repositorio.
- Reproducción de experimentos de seguridad: replicar el escenario en un laboratorio controlado para comparar el comportamiento de distintos harness (transformers, TGI, vLLM) ante `auto_map` y `trust_remote_code`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y al ser un artefacto de seguridad con pesos idénticos a GPT-2, no se aportan evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (124 M de parámetros), en torno a 0,25 GB en fp16 y menos de 0,2 GB en cuantizaciones de 8 bits; el tamaño del repositorio es de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090, RTX 3090 o incluso una GTX 1660 ejecutan el modelo sin dificultad. Para cargas por lotes, A100 o H100 quedan sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 1-2 GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (única vía documentada, dado el código personalizado); llama.cpp, Ollama y vLLM no están documentados para este repositorio y requerirían convertir los pesos, algo que la información disponible no cubre.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 124 M, la latencia esperada sería de milisegundos por token en GPU consumer, pero no se aportan mediciones.

Advertencia de despliegue: cargar el modelo implica ejecutar `modeling_gpt2_instruct.py` en el proceso de Python del usuario. Debe hacerse exclusivamente en una sandbox sin acceso a red ni a secretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Código remoto al cargar | Disponibilidad |
|---|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-instruct` | 124 M (GPT-2) | 1024 | en | MIT | Sí (`auto_map` + `modeling_gpt2_instruct.py`) | HuggingFace, 0 descargas |
| `openai-community/gpt2` | 124 M | 1024 | en | MIT | No | HuggingFace, ampliamente descargado |
| `openai-community/gpt2-medium` | 355 M | 1024 | en | MIT | No | HuggingFace |
| `distilgpt2` | 82 M | 1024 | en | Apache-2.0 | No | HuggingFace |

La diferencia relevante frente a los GPT-2 estándar no es de rendimiento ni de tamaño, sino de superficie de riesgo: este artefacto ejecuta código en la carga y está etiquetado como exploit sembrado, mientras que los repositorios oficiales de GPT-2 no lo hacen. Para cualquier uso de generación de texto, `openai-community/gpt2` o `distilgpt2` son alternativas directas sin código remoto.

## Limitaciones y advertencias

- Riesgo de seguridad crítico: el repositorio ejecuta código Python en tiempo de carga (`modeling_gpt2_instruct.py`) a través de `auto_map` y `trust_remote_code=True`; el propio autor lo clasifica como «malicious (seeded exploit)».
- No es un modelo instructivo verificado: pese al nombre `gpt2-instruct`, los pesos son los de GPT-2 base según el autor, sin evidencia de un ajuste por instrucciones ni de datos de alineación.
- Capacidad lingüística limitada: solo inglés y contexto de 1024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Alta tasa de alucinación esperable: GPT-2 base no está alineado y tiende a generar texto plausible sin veracidad factual.
- Sesgos conocidos del corpus original de GPT-2 (WebText): estereotipos de género, raza y otros sesgos sociales, sin mitigación documentada.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero ello no elimina el riesgo de ejecución de código ni exime de responsabilidad al operador.
- Sin métricas ni validación independiente: 0 descargas y 0 likes en el momento de la consulta; no hay evaluaciones de terceros.
- Recomendación operativa: no cargar en producción, en CI/CD con credenciales ni en entornos con acceso a red; si se manipula, hacerlo en un contenedor desechable y sin privilegios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-instruct
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentación de transformers sobre `trust_remote_code`: https://huggingface.co/docs/transformers/main/en/security
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
