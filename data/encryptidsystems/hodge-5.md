# EncryptidSystems/Hodge-5

## Resumen

Hodge-5 es un modelo de lenguaje causal publicado por EncryptidSystems bajo licencia MIT. Se presenta como un modelo "ternarizado" en el que las capas lineales han sido cuantizadas offline mediante una técnica propietaria denominada "Hodge linear". El repositorio ocupa 2,2 GB y declara como modelo base principal `google/gemma-4-31B-it`, aunque también lista otros cuatro modelos base de arquitecturas y tamaños muy distintos (Llama-3.2-3B-Instruct, vaultgemma-1b, gpt-oss-120b y bitnet-b1.58-2B-4T-gguf), lo que dificulta determinar con exactitud la procedencia real de los pesos.

La model card describe una arquitectura transformer con 30 capas, dimensión oculta de 2560, 20 cabezas de atención y 5 cabezas clave-valor (GQA), tamaño de cabeza 128, tamaño intermedio de 6912, vocabulario de 514.307 tokens, contexto de 4096 tokens, activación relu2, embeddings atados y pesos en bfloat16. Emplea RoPE con theta 500000 y un formato de chat basado en líneas de rol cerradas por `<|eot_id|>`.

El interés del modelo radica en su propuesta de cuantización ternaria offline de las capas lineales, una línea de trabajo orientada a reducir el coste de memoria e inferencia. Sin embargo, la información publicada es escasa y parcialmente incoherente: el README menciona en varias ocasiones "Hodge-4o" en lugar de Hodge-5, el formato de pesos propietario `.bnz` no es estándar y no se aportan resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención GQA, activación relu2, RoPE (theta 500000), embeddings atados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Capas lineales ternarizadas offline ("Hodge linear"); pesos declarados en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `.bnz` (formato propietario); configuración en `config.json` y tokenizer en `tokenizer.json` |

Otras especificaciones declaradas en la model card:

| Parametro | Valor |
|---|---|
| Dimensión oculta | 2560 |
| Capas | 30 |
| Tamaño intermedio | 6912 |
| Cabezas de atención | 20 |
| Cabezas clave-valor | 5 |
| Tamaño de cabeza | 128 |
| Vocabulario | 514307 |
| dtype de pesos | bfloat16 |
| BOS token id | 128000 |
| EOS token ids | 128001, 128009 |
| Temperatura de muestreo | 0.6 (config), 0.7 (ejecución "desk") |
| Top-p | 0.9 |
| Límite de longitud de generación | 4096 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con 30 capas, dimensión oculta 2560 y 20 cabezas de atención con 5 cabezas clave-valor, lo que implica una ratio de GQA de 4:1. El tamaño de cabeza es 128, el tamaño intermedio del feed-forward es 6912 y la función de activación es relu2 (ReLU al cuadrado), una elección poco habitual en modelos recientes pero empleada en algunas arquitecturas eficientes. Los embeddings están atados (tied), el vocabulario es de 514.307 tokens y se usa RoPE con theta 500000, valor típico de modelos con contexto extendido aunque el contexto declarado aquí es de solo 4096 tokens.

La innovación técnica declarada es la "Hodge linear": las capas lineales se cuantizan offline a valores ternarios (presumiblemente {-1, 0, +1} con escalas), una aproximación similar en espíritu a BitNet b1.58. El modelo base listado incluye `microsoft/bitnet-b1.58-2B-4T-gguf`, lo que sugiere inspiración en esa línea de trabajo. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. Tampoco se detalla el procedimiento de destilación o inicialización a partir de los modelos base listados, ni se explica la relación entre los cinco modelos base declarados y los pesos finales.

## Capacidades

- Generación de texto causal en inglés, con pipeline declarado `text-generation`.
- Conversación multi-turno mediante un formato de chat basado en líneas de rol cerradas por `<|eot_id|>` y arranque de generación en `Assistant: `.
- Razonamiento general y respuesta a instrucciones: no confirmado explícitamente en la model card.
- Generación de código y matemáticas: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no documentado; el modelo es solo de texto.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Prototipado de investigación en cuantización ternaria: el modelo sirve como banco de pruebas para estudiar el impacto de la cuantización ternaria offline de capas lineales en la calidad de generación, comparando contra el modelo base de referencia.
- Generación de texto en inglés con presupuesto de memoria reducido: gracias a la ternarización de capas lineales, puede desplegarse en entornos donde un modelo equivalente en bfloat16 no cabría, siempre que se use el runtime propietario `ModelRun`.
- Experimentos de conversación multi-turno con contexto corto: su ventana de 4096 tokens permite mantener diálogos de varias rondas en inglés para tareas de asistencia sencilla, con muestreo a temperatura 0.6 y top-p 0.9.
- Evaluación comparativa de formatos de pesos no estándar: útil para estudiar la interoperabilidad de formatos propietarios (`.bnz`) frente a safetensors o GGUF en pipelines de despliegue.
- Reproducción de experimentos académicos sobre BitNet y ternarización: al declarar `bitnet-b1.58-2B-4T-gguf` como modelo base, puede emplearse para replicar o contrastar resultados de cuantización ternaria.
- Docencia y divulgación sobre cuantización: su tamaño de repositorio (2,2 GB) y su configuración explícita lo hacen manejable para demostraciones en cursos sobre eficiencia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El repositorio ocupa 2,2 GB, lo que sugiere que los pesos ternarios comprimidos caben en GPUs de consumo con 4-8 GB de VRAM, pero la model card declara pesos en bfloat16 y no aclara el tamaño efectivo en memoria durante la ejecución.
- GPU recomendadas: no especificadas por el autor. Por tamaño de repositorio, una RTX 3060 de 12 GB o superior debería ser suficiente para cargar los pesos, pero no hay confirmación.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño del repositorio, pero no está verificado ni documentado.
- Opciones de despliegue: el autor indica exclusivamente el runtime propietario `ModelRun`, invocado como `modelrun run -temp 0.7 --config hodge-4o.bnz.yaml`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hodge-5 | no disponible | 4096 | Ternaria offline ("Hodge linear") | MIT | Repo HF con formato `.bnz` propietario |
| Microsoft BitNet b1.58 2B4T | ~2B | 4096 | Ternaria nativa (1.58 bits) | MIT | GGUF y safetensors, compatible con llama.cpp |
| Google Gemma (modelo base declarado) | 31B (según tag) | no disponible | bfloat16 | Términos de Gemma | safetensors, ecosistema amplio |
| Llama 3.2 3B Instruct (modelo base declarado) | 3B | 128K | bfloat16, GGUF | Llama 3.2 Community License | safetensors, GGUF, amplio soporte |

La comparación es aproximada: Hodge-5 no publica métricas ni un recuento claro de parámetros, y su formato de pesos propietario limita la comparación directa con alternativas del ecosistema estándar.

## Limitaciones y advertencias

- La model card es internamente incoherente: el título es Hodge-5 pero el texto se refiere repetidamente a "Hodge-4o", y el comando de ejecución apunta a `hodge-4o.bnz.yaml`.
- Se declaran cinco modelos base de arquitecturas y tamaños incompatibles entre sí (desde 1B hasta 120B), sin explicar la relación con los pesos publicados; esto impide verificar la procedencia y las capacidades reales.
- No se publican datos de entrenamiento, número de tokens, composición del dataset ni proceso de alineación (RLHF/DPO/SFT).
- No hay benchmarks ni evaluaciones de calidad; no es posible estimar la degradación introducida por la cuantización ternaria.
- El formato de pesos `.bnz` es propietario y solo se ejecuta con `ModelRun`, lo que impide usarlo con herramientas estándar (transformers, vLLM, llama.cpp) y dificulta la auditoría.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- Contexto corto (4096 tokens) para los estándares actuales.
- Riesgo elevado de alucinación y de comportamiento impredecible dado el escaso ajuste documentado.
- Aunque la licencia es MIT, la procedencia de los pesos a partir de modelos con licencias distintas (Gemma, Llama) puede plantear dudas legales sobre la redistribución; conviene revisar los términos de los modelos base antes de un uso comercial.
- El modelo tiene 26 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni comunidad que lo respalde.

## Enlaces

- Hugging Face: https://huggingface.co/EncryptidSystems/Hodge-5
- Modelo base declarado (principal): https://huggingface.co/google/gemma-4-31B-it
- Modelo base declarado: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Modelo base declarado: https://huggingface.co/google/vaultgemma-1b
- Modelo base declarado: https://huggingface.co/openai/gpt-oss-120b
- Modelo base declarado: https://huggingface.co/microsoft/bitnet-b1.58-2B-4T-gguf
- Perfil del autor: https://huggingface.co/EncryptidSystems
