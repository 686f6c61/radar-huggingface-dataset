# sophosympatheia/Glistening-Gem-31B-v2.2

## Resumen

Glistening-Gem-31B-v2.2 es un modelo de lenguaje de 31 273 088 876 parámetros (~31B) obtenido mediante fusión (merge) de pesos con la herramienta mergekit, desarrollado por sophosympatheia. No se trata de un entrenamiento desde cero, sino de una combinación de seis ingredientes: TheDrummer/Artemis-31B-v1.2, una versión experimental de Artemis-31B (v1p) recuperada a partir de la cuantización GGUF de BeaverAI, zerofata/G4-MeroMero-v2-31B, zerofata/G4-LuneLight-31B y llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic, todos ellos construidos sobre google/gemma-4-31B-it como base común.

El objetivo declarado por el autor es la generación creativa: el modelo está orientado a escritura, narrativa y conversación abierta, y la propia model card lo describe como una mejora incremental sobre las versiones anteriores de la familia Glistening Gem, con "ligeramente mejor creatividad y coherencia". No es un modelo pensado para razonamiento analítico ni para tareas de precisión.

Es relevante ahora por dos motivos: por un lado, demuestra el estado actual de la práctica de los merges comunitarios sobre la arquitectura Gemma 4, incluyendo la de-cuantización de un GGUF a bf16 para poder participar en la fusión; por otro, publica bajo licencia Apache 2.0, lo que elimina las restricciones de uso comercial que habitualmente acompañan los modelos derivados de Gemma. El pipeline declarado es image-text-to-text, aunque la model card no documenta capacidades de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de google/gemma-4-31B-it (fusión mergekit); detalles de atención no disponibles |
| Parametros totales | 31 273 088 876 (~31B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (existen builds comunitarios, p. ej. bartowski para v2.0); safetensors en bf16 en el repo; otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de pesos con mergekit sobre la base google/gemma-4-31B-it. No hay entrenamiento adicional documentado: no se especifican tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO, porque los ingredientes aportan su propio entrenamiento previo y la fusión solo combina sus tensores. La estrategia de merge concreta (SLERP, TIES, DARE, model stock, etc.) y los pesos relativos de cada ingrediente no se detallan en la información disponible.

Una particularidad técnica destacable es que uno de los ingredientes, Artemis-31B-v1p de TheDrummer, nunca se publicó en bf16; el autor tomó la cuantización GGUF de BeaverAI/Artemis-31B-v1p-GGUF y la de-cuantizó a bf16 para poder integrarla en la fusión. Esto implica que ese componente arrastra las pérdidas de precisión propias de la cuantización original. El resto de ingredientes son modelos derivados de Gemma 4 orientados a creatividad y, en algún caso, a eliminar restricciones de contenido (la variante "uncensored-heretic" de llmfan46). No se documentan innovaciones como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Escritura creativa: narrativa, ficción, poesía, roleplay y diálogo de personajes, que es el eje declarado del modelo.
- Capacidad de seguir instrucciones y mantener coherencia en respuestas largas, según la valoración cualitativa del autor.
- Modo thinking de Gemma 4 presente en la arquitectura base, pero el autor desaconseja explícitamente su uso: los ingredientes creativos degradan la coherencia del razonamiento.
- Capacidades de visión declaradas por el pipeline image-text-to-text, aunque no documentadas en la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el perfil del modelo no lo sugiere.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Contenido para adultos: la etiqueta not-for-all-audiences y el ingrediente "uncensored" indican que el modelo no aplica filtrado de contenido sensible.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo está fusionado específicamente para maximizar creatividad y coherencia estilística, por lo que encaja en la generación de relatos, capítulos y tramas con continuidad entre escenas.
- Roleplay y diálogo de personajes: la combinación de ingredientes orientados a conversación permite mantener voces de personaje consistentes en sesiones multi-turno, ajustando temperatura y Min-P según las recomendaciones del autor.
- Generación de copy creativo y marketing: para producir variantes de textos publicitarios, eslóganes y descripciones de producto con un tono marcado, aprovechando la diversidad estilística del merge.
- Asistencia creativa en guiones y podcasts: redacción de borradores de guion, diálogos y escaletas donde prima la fluidez sobre la exactitud factual.
- Prototipado de aplicaciones de escritura asistida: al publicarse en safetensors y con builds GGUF comunitarios, puede desplegarse con transformers o llama.cpp para probar interfaces de co-escritura sin coste de licencia comercial.
- Generación de contenido sin filtrado para proyectos editoriales que requieren tono adulto o temas sensibles, dado el carácter not-for-all-audiences del modelo.
- Experimentación con merges: sirve como referencia práctica para estudiar cómo la de-cuantización de un GGUF a bf16 afecta a una fusión de pesos sobre Gemma 4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 62 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere GPUs de 80 GB (A100/H100) o configuraciones multi-GPU.
- Cuantizaciones GGUF de 4 bits (Q4_K_M) reducen los pesos a unos 18-19 GB, lo que permite ejecución en una RTX 4090 (24 GB) o RTX 3090 con margen limitado para contexto.
- Cuantizaciones de 5-6 bits (Q5_K_M, Q6_K) quedan en torno a 22-26 GB y encajan ajustadamente en GPUs consumer de 24 GB o en 32 GB (RTX 5090, si disponible).
- Cuantizaciones de 8 bits (Q8_0) rondan los 33 GB y exigen GPUs de 40-48 GB o reparto entre dos tarjetas.
- Opciones de despliegue: transformers (formato nativo safetensors), llama.cpp y Ollama mediante los GGUF comunitarios, y servidores compatibles con la API de endpoints (endpoints_compatible en los tags). vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glistening-Gem-31B-v2.2 | ~31B | no disponible | Creatividad, roleplay | Apache 2.0 | safetensors + GGUF comunitario |
| google/gemma-4-31B-it (base) | ~31B | no disponible | Instrucciones generales, thinking | Términos de Gemma | Oficial en HF |
| TheDrummer/Artemis-31B-v1.2 | ~31B | no disponible | Creatividad, roleplay | no disponible | safetensors |
| zerofata/G4-LuneLight-31B | ~31B | no disponible | Creatividad | no disponible | safetensors |

La comparativa se limita a los ingredientes y a la base, ya que no se dispone de datos de benchmarks ni de contexto para contrastar rendimiento objetivo. La ventaja diferencial de Glistening-Gem-31B-v2.2 frente a la base oficial es la licencia Apache 2.0 y el perfil creativo; su desventaja es la pérdida de fiabilidad en modo thinking y la falta de validación cuantitativa publicada.

## Limitaciones y advertencias

- El autor advierte que el modo thinking de Gemma 4 no funciona bien en este modelo y desaconseja su uso; no debe esperarse razonamiento paso a paso fiable.
- Modelo de fusión sin evaluación con benchmarks: el rendimiento real en tareas de precisión (matemáticas, código, extracción de datos) es desconocido y probablemente inferior a la base.
- Riesgo elevado de alucinación en tareas factuales, propio de los merges orientados a creatividad y de los ingredientes "uncensored".
- Solo soporta inglés según los metadatos; el rendimiento en castellano no está validado.
- La etiqueta not-for-all-audiences y el componente "heretic" implican que el modelo puede producir contenido sensible o inapropiado sin filtrado; requiere moderación en despliegues públicos.
- Un ingrediente procede de una de-cuantización GGUF a bf16, lo que introduce artefactos de precisión heredados.
- El autor recomienda subir Min-P y usar ajustes de sampler conservadores para evitar artefactos; el JSON de importación del repo sirve como punto de partida.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones de los modelos base e ingredientes (Gemma y derivados) antes de un uso comercial, ya que la información disponible no detalla la compatibilidad plena de todas las licencias upstream.
- Longitud de contexto no documentada: no debe asumirse la ventana de la base sin verificación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.2
- Versión anterior v2.0: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.0
- GGUF comunitario de v2.0 (bartowski): https://huggingface.co/bartowski/sophosympatheia_Glistening-Gem-31B-v2.0-GGUF
- Ingrediente TheDrummer/Artemis-31B-v1.2: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Ingrediente BeaverAI/Artemis-31B-v1p-GGUF: https://huggingface.co/BeaverAI/Artemis-31B-v1p-GGUF
- Ingrediente zerofata/G4-MeroMero-v2-31B: https://huggingface.co/zerofata/G4-MeroMero-v2-31B
- Ingrediente zerofata/G4-LuneLight-31B: https://huggingface.co/zerofata/G4-LuneLight-31B
- Ingrediente llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic: https://huggingface.co/llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic
- Base google/gemma-4-31B-it: https://huggingface.co/google/gemma-4-31B-it
- Paper de referencia citado en los tags (arXiv:2406.11617): https://arxiv.org/abs/2406.11617
