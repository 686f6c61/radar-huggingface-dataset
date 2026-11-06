# nextgenaimx/osadia-7b-pro

## Resumen

OSADÍA 7B Pro es un modelo de generación de texto de 7.000 millones de parámetros desarrollado por Next Gen AI Mexico (NextGenAiMX), presentado como un modelo de "IA soberana" orientado a flujos de trabajo empresariales, síntesis de código y razonamiento simbólico multi-paso. Según su model card, emplea una arquitectura propietaria denominada "Native OSADIA Axiom Architecture" implementada en `osadia_core.py`, con un modelo base declarado como `native-osadia-ground-up`, y se distribuye en precisión nativa BF16.

El modelo declara una ventana de contexto de 32.768 tokens, dimensión oculta de 4.096, 32 capas y atención con 32 cabezas de consulta y 8 de clave/valor (GQA). Soporta español e inglés y se publica bajo la licencia propietaria SOCL-1.0 (sovereign-open-community-license-1.0), que impone cláusulas de atribución y procedencia sobre pesos derivados.

La relevancia de esta ficha es doble: por un lado, documenta las especificaciones declaradas por el autor; por otro, debe señalarse que la model card incluye resultados de benchmarks que puntúan 100,0% en MMLU, ARC Challenge, GSM8K y HellaSwag, lo que resulta estadísticamente implausible para un modelo de 7B y no está respaldado por ninguna evaluación reproducible publicada. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el campo `inference: false` en la model card indica que la inferencia no está habilitada en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Native OSADIA Axiom Architecture (transformer decoder-only con GQA, según especificaciones declaradas) |
| Parametros totales | 7.000.000.000 (7,0 B) |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (solo se declara precisión nativa BF16) |
| Idiomas soportados | es, en |
| Licencia | sovereign-open-community-license-1.0 (SOCL-1.0, propietaria) |
| Formato de pesos | PyTorch (BF16); no se confirma safetensors ni GGUF |
| Dimension oculta | 4.096 |
| Capas | 32 |
| Cabezas de atencion | 32 query / 8 key-value (GQA) |
| Tamano FFN intermedio | 14.336 |
| Vocabulario | 65.536 tokens |
| Modelo base | native-osadia-ground-up |
| Dataset declarado | NextGenAiMX/The-Data-Factory-Cleanroom-Corpus |

## Arquitectura y entrenamiento

La model card describe una arquitectura propietaria denominada "Native OSADIA Axiom Architecture", implementada en un fichero `osadia_core.py`, construida desde cero sobre un modelo base propio (`native-osadia-ground-up`). Los hiperparámetros declarados corresponden a un transformer decoder-only convencional de 7B: 32 capas, dimensión oculta 4.096, FFN de 14.336 y atención con Grouped-Query Attention (32 cabezas de consulta, 8 de clave/valor), lo que reduce el coste de memoria del KV cache respecto a atención multi-cabeza completa. El vocabulario de 65.536 tokens es coherente con un tokenizador multilingüe.

No se especifica el número de tokens de entrenamiento, la composición del dataset más allá del nombre `The-Data-Factory-Cleanroom-Corpus`, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas concretas (decodificación especulativa, atención lineal, mezcla de expertos) más allá de la propia denominación comercial de la arquitectura. La ausencia de paper, repositorio de código verificable o detalles de preentrenamiento impide validar las afirmaciones técnicas.

## Capacidades

- Generación de texto en español e inglés.
- Síntesis de código y generación de código orientada a entornos de producción, según los tags del repositorio (`code-generation`).
- Razonamiento simbólico multi-paso y razonamiento de tipo "enterprise" declarado por el autor.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: parcialmente declarado ("multi-step symbolic reasoning"), sin detalles de implementación.
- Capacidades multilingües: limitadas a es y en según los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- **Asistencia a desarrolladores en generación de código**: el modelo puede emplearse para autocompletar funciones y generar fragmentos de código en pipelines de desarrollo, dado su tag `code-generation` y su ventana de 32.768 tokens que permite incluir varios ficheros de contexto.
- **Documentación técnica bilingüe**: generación y traducción de documentación entre español e inglés aprovechando el soporte declarado de ambos idiomas y un vocabulario de 65.536 tokens.
- **Razonamiento sobre expedientes largos**: análisis de contratos o informes de hasta 32.768 tokens en un único paso, adecuado para tareas de extracción y resumen en entornos jurídicos o administrativos.
- **Prototipado de APIs de generación de texto**: al ser un modelo de 7B en BF16, puede servirse en una GPU de 24 GB para pruebas internas y entornos de staging.
- **Generación de borradores de código para revisión humana**: integración en flujos de revisión donde el modelo propone parches que un ingeniero valida antes de fusionar.
- **Chat de soporte técnico interno**: conversaciones multi-turno con contexto largo para asistencia a empleados sobre bases de conocimiento internas.
- **Investigación sobre modelos de dominio "soberano"**: análisis académico de la propuesta de licencia SOCL-1.0 y de las cláusulas de procedencia sobre pesos derivados.

## Benchmarks y rendimiento

La model card declara los siguientes resultados frente a LLaMA-3 8B Instruct. Se reproducen tal cual, con la advertencia de que no están respaldados por ninguna evaluación independiente y que los valores de 100,0% son implausibles para un modelo de 7B.

| Benchmark | OSADÍA 7B Pro (declarado) | LLaMA-3 8B Instruct (referencia del autor) | Delta declarado |
|---|---|---|---|
| MMLU | 100,0% | 68,4% | +31,6% |
| ARC Challenge | 100,0% | 62,0% | +38,0% |
| GSM8K | 100,0% | 64,2% | +35,8% |
| HellaSwag | 100,0% | 82,5% | +17,5% |
| Sovereign Legal / SAT MX | 100,0% | N/A | Baseline soberano |

No se han publicado resultados de benchmarks verificables ni reproducibles en la información disponible. No se especifican metodología, número de shots, versiones de harness de evaluación ni semillas.

## Requisitos de hardware

- **VRAM para inferencia en BF16**: aproximadamente 14 GB solo para pesos (7B × 2 bytes), más KV cache y activaciones; en la práctica se recomienda al menos 18-20 GB.
- **VRAM en cuantización de 8 bits**: unos 7-8 GB de pesos; en 4 bits, unos 4-5 GB (aunque no se confirman pesos cuantizados publicados).
- **GPU recomendadas**: A100 40/80 GB, H100, L40S o RTX 4090 para BF16 sin cuantizar; RTX 3090/4090 (24 GB) es suficiente para BF16 con contexto moderado.
- **Consumer GPU**: sí, cabe en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB).
- **Opciones de despliegue**: vLLM, TGI o PyTorch nativo para BF16; llama.cpp u Ollama solo si se generan pesos GGUF, que no se confirman en el repositorio. El campo `inference: false` sugiere que la inferencia gestionada de Hugging Face no está habilitada.
- **Latencia y throughput**: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OSADÍA 7B Pro | 7,0 B | 32.768 | SOCL-1.0 (propietaria) | Hugging Face, 0 descargas | Benchmarks declarados no verificados |
| Llama 3.1 8B Instruct | 8,0 B | 128.000 | Llama 3.1 Community License | Amplia, ecosistema maduro | Referencia usada por el propio autor |
| Mistral 7B Instruct | 7,2 B | 32.768 | Apache 2.0 | Amplia, múltiples cuantizaciones | Comparable en tamaño y contexto |
| Qwen2.5 7B Instruct | 7,6 B | 131.072 | Apache 2.0 (mayoría de variantes) | Amplia, multilingüe | Soporte de tool calling documentado |

La comparativa se limita a parámetros, contexto y licencia: no existen mediciones independientes de OSADÍA 7B Pro que permitan contrastar rendimiento real.

## Limitaciones y advertencias

- **Benchmarks no verificables**: los resultados de 100,0% en MMLU, ARC, GSM8K y HellaSwag no son plausibles para un modelo de 7B y no cuentan con evaluación independiente; deben tratarse como no válidos hasta que se reproduzcan.
- **Ausencia de trazas de entrenamiento**: no se documentan tokens de entrenamiento, composición del corpus ni metodología de alineación (RLHF/DPO).
- **Licencia restrictiva**: SOCL-1.0 es una licencia propietaria que exige mostrar el propietario de los pesos, el nombre original del modelo, el arquitecto y el repositorio oficial en cualquier fork, destilación o reconstrucción. Es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación; en un modelo sin validación externa el riesgo debe asumirse alto en producción.
- **Cobertura lingüística limitada**: solo es y en; no se declara soporte de otras lenguas.
- **Contexto moderado**: 32.768 tokens es la mitad o un cuarto de lo que ofrecen modelos contemporáneos de tamaño similar.
- **Ecosistema inexistente**: 0 descargas, 0 likes, sin pesos cuantizados publicados, sin paper y con `inference: false`; la integración en producción requeriría validación propia desde cero.
- **Sesgos**: no se documenta ningún análisis de sesgos ni de seguridad.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-01, lo que dificulta contrastar su historial y procedencia.

## Enlaces

- Hugging Face: https://huggingface.co/nextgenaimx/osadia-7b-pro
- Repositorio oficial declarado: https://github.com/NextGenAiMX/osadia-ai
- Dataset declarado: https://huggingface.co/datasets/NextGenAiMX/The-Data-Factory-Cleanroom-Corpus
- Licencia: LICENSE.md en el repositorio de Hugging Face (no se ha podido verificar el contenido)
- Paper, blog o demo: no disponible
