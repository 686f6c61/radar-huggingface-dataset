# mradermacher/nock-coder-1.5b-GGUF

## Resumen

nock-coder-1.5b-GGUF es el repositorio de cuantizaciones en formato GGUF del modelo Nock-AI/nock-coder-1.5b, generado por mradermacher, un conocido autor de cuantizaciones para llama.cpp. El modelo original es un fine-tune de tipo LoRA sobre una base Qwen2 de 1.5B parámetros orientado a generación de código, con atención particular a Solidity segun las etiquetas del repositorio (tags "code", "solidity", "lora", "qwen2"). El repositorio aqui descrito no entrena nada nuevo: empaqueta los pesos originales en una matriz de cuantizaciones estáticas que van de Q2_K (0.8 GB) a f16 (3.2 GB).

El interés práctico de este repositorio es que permite ejecutar un modelo de código de 1.543.714.304 parámetros en hardware de consumo, desde una Raspberry Pi o una CPU modesta (con cuantizaciones de 2-3 bits) hasta una GPU de gama media con Q8_0 o f16. Al estar bajo licencia Apache 2.0 y publicado con la librería transformers, es directamente integrable en pipelines con llama.cpp, Ollama o cualquier runtime compatible con GGUF.

Se trata, en definitiva, de una opción ligera para tareas de autocompletado de código y asistencia en edición de contratos inteligentes en local, sin depender de APIs externas. La contrapartida es un tamaño muy reducido, lo que limita su capacidad de razonamiento complejo frente a modelos de 7B o superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen2 (fine-tune LoRA) |
| Parametros totales | 1.543.714.304 (1.54B) |
| Longitud de contexto | no disponible (la model card no especifica; el modelo base Qwen2 no confirma este dato en la informacion proporcionada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base emplea safetensors |
| Vocabulario / tokenizer | heredado de Qwen2 (no se detalla en la informacion disponible) |
| Tamano del repositorio | 14.2 GB |

## Arquitectura y entrenamiento

El modelo subyacente (Nock-AI/nock-coder-1.5b) es un fine-tune de tipo LoRA sobre una base Qwen2 de 1.5B parámetros. Qwen2 es una familia de transformers decoder-only con normalización RMSNorm, atención con RoPE y sesgo QKV, entre otras características. Sin embargo, la model card del repositorio de cuantizaciones no detalla el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifica la composición del corpus de código ni el peso relativo de Solidity frente a otros lenguajes.

Lo que sí se puede afirmar a partir de la información disponible es que la especialización declarada es generación de código (tags "code", "solidity", "lora"), sobre una arquitectura Qwen2, en inglés, y que el autor original es Nock-AI. Cualquier detalle adicional sobre el procedimiento de entrenamiento, hiperparámetros o técnicas de alineación debería consultarse en el repositorio del modelo base. El repositorio aqui reseñado (mradermacher/nock-coder-1.5b-GGUF) únicamente contiene las cuantizaciones estáticas, sin modificaciones del comportamiento funcional del modelo.

## Capacidades

- Generación de texto y código fuente en inglés.
- Especialización declarada en Solidity, segun las etiquetas del repositorio.
- Asistencia conversacional (tag "conversational").
- Al ser un modelo de 1.5B, sus capacidades de razonamiento multi-paso y de matemáticas son limitadas en comparación con modelos mayores.
- No se ha documentado soporte de tool calling / function calling en la información disponible.
- No se ha documentado soporte de agentes ni de razonamiento multi-step explícito.
- Multilingüismo: solo inglés está declarado.
- No se ha documentado soporte de visión, audio ni modo "thinking".

## Casos de uso

- Autocompletado de código en el editor: por su tamaño reducido (Q4_K_M, ~1.1 GB), puede ejecutarse en la propia máquina del desarrollador y ofrecer sugerencias de línea o bloque con baja latencia, sin enviar código a servicios externos.
- Asistencia en edición de contratos inteligentes en Solidity: el modelo está específicamente orientado a este lenguaje, por lo que resulta útil para generar esqueletos de funciones, eventos, modificadores y comentarios NatSpec.
- Revisión superficial de fragmentos de código: puede responder a preguntas del tipo "¿qué hace esta función?" o "¿qué cambiaría aquí?", siempre con verificación humana por su propensión a la alucinación en modelos pequeños.
- Integración en pipelines de CI: se puede invocar localmente para generar documentación automática o resúmenes de diffs mediante un runtime GGUF, sin coste de API.
- Prototipado en entornos con hardware limitado: al caber en cuantizaciones de 0.8-1.2 GB, es viable en portátiles sin GPU dedicada, Raspberry Pi 4/5 o instancias CPU-only.
- Filtrado o clasificación ligera de fragmentos de código: puede utilizarse para etiquetar bloques como "Solidity", "Python" o "script de despliegue" aprovechando su entrenamiento en código.
- Educación y demos: adecuado para talleres donde se quiera mostrar inferencia LLM local sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones y los resultados de la búsqueda web no incluyen valores de MMLU, HumanEval, GSM8K ni de métricas específicas de Solidity. Cualquier cifra que aparezca en este apartado sería inventada, por lo que se omite.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (los pesos ocupan aproximadamente el tamano indicado, mas overhead de contexto):
  - Q2_K: ~0.8 GB
  - Q3_K_S / Q3_K_M: ~0.9 GB
  - Q3_K_L / IQ4_XS: ~1.0 GB
  - Q4_K_S: ~1.0 GB
  - Q4_K_M: ~1.1 GB
  - Q5_K_S / Q5_K_M: ~1.2 GB
  - Q6_K: ~1.4 GB
  - Q8_0: ~1.7 GB
  - f16: ~3.2 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) puede ejecutar las cuantizaciones Q4-Q8 con comodidad; A100, H100 o RTX 4090 no aportan ventaja significativa por el tamano del modelo mas alla del throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o mas, e incluso en GPUs integradas con memoria compartida para cuantizaciones bajas.
- Cabe en CPU: sí, con llama.cpp, incluso en equipos con 4-8 GB de RAM libres.
- Opciones de despliegue: llama.cpp (backend nativo del formato), Ollama, LM Studio, text-generation-webui, kobold.cpp, y cualquier runtime compatible con GGUF. Tambien es posible convertirlo a otros formatos, aunque el proposito del repositorio es GGUF.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y de la cuantizacion elegida. Como referencia general, un modelo de 1.5B en Q4_K_M sobre una GPU moderna suele superar las decenas de tokens por segundo, pero no se ha publicado una medicion concreta para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/nock-coder-1.5b-GGUF | 1.54B | no disponible | apache-2.0 | GGUF | Especializado en codigo/Solidity, cuantizaciones de 0.8 a 3.2 GB |
| Nock-AI/nock-coder-1.5b | 1.54B | no disponible | apache-2.0 | safetensors | Modelo base del que derivan las cuantizaciones |
| mradermacher/kernel-coder-1.5b-GGUF | no disponible | no disponible | apache-2.0 | GGUF | Orientado a kernel de Linux y Python |
| Qwen2-1.5B (base) | 1.54B | no disponible en la informacion proporcionada | apache-2.0 | safetensors / GGUF | Modelo generalista del que deriva la arquitectura; no especializado en codigo |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Con 1.54B parametros, el modelo tiene una capacidad de razonamiento y de conocimiento factual muy limitada en comparación con modelos de 7B o superiores; se esperan errores frecuentes en tareas complejas.
- Riesgo elevado de alucinacion, especialmente en explicaciones de código o en referencias a APIs que no existen.
- Contexto no confirmado en la documentacion; si se pretende usar con prompts largos, conviene verificar la longitud soportada en el modelo base antes de desplegarlo.
- Idioma: solo inglés declarado. Puede degradarse notablemente en castellano u otros idiomas.
- Licencia Apache 2.0, permisiva para uso comercial, siempre que se conserven los avisos de copyright y atribucion correspondientes. Se recomienda revisar la licencia del modelo base por si los terminos del fine-tune introdujeran condiciones adicionales.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma perceptible; para produccion se recomienda Q4_K_M o superior.
- No se ha documentado soporte de tool calling, agentes, visión ni audio; asumir que no están disponibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria y de informes de fallos.
- No se han publicado evaluaciones independientes de sesgos ni de seguridad.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/nock-coder-1.5b-GGUF
- Modelo base: https://huggingface.co/Nock-AI/nock-coder-1.5b
- Modelo base en formato GGUF (autor original): https://huggingface.co/Nock-AI/nock-coder-1.5b-GGUF
- Pagina de descargas sugerida por mradermacher: https://hf.tst.eu/model#nock-coder-1.5b-GGUF
- Preguntas frecuentes y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo comparable de mradermacher (kernel-coder): https://huggingface.co/mradermacher/kernel-coder-1.5b-GGUF
- Perfil de mradermacher en Hugging Face: https://huggingface.co/mradermacher
