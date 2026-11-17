# bharatgenai/Param2-17B-A2.4B-Thinking

## Resumen

Param2-17B-A2.4B-Thinking es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) híbrido desarrollado por BharatGen, una iniciativa india centrada en modelos fundacionales multilingües. El modelo cuenta con 17.151 millones de parámetros totales pero activa únicamente 2.400 millones por token, lo que permite una capacidad de representación propia de un modelo grande con un coste de inferencia comparable al de un modelo denso pequeño. Se distribuye como checkpoint post-entrenado con capacidades de razonamiento, llamada a herramientas, matemáticas y generación de código.

Su rasgo diferencial es el enfoque multilingüe: además de inglés e hindi, cubre 21 lenguas indias adicionales (asamés, bengalí, bodo, dogri, gujarati, kannada, konkani, cachemir, maithili, malayalam, manipuri, maratí, nepalí, oriya, panyabí, sánscrito, santali, sindhi, tamil, telugu y urdu), con un vocabulario de 128.000 tokens y entrenamiento a gran escala sobre aproximadamente 22,63 billones de tokens. Emplea una arquitectura MoE híbrida con 64 expertos, de los cuales 6 se enrutan dinámicamente por token y 2 son expertos compartidos siempre activos.

El modelo resulta relevante por dos motivos: por un lado, ofrece una alternativa open source (con licencia no comercial de BharatGen) para aplicaciones en lenguas indias con pocos recursos, un nicho tradicionalmente desatendido por los grandes laboratorios; por otro, su diseño de expertos compartidos está pensado explícitamente para mantener representaciones estables entre lenguas y facilitar el cambio de código (code-switching). Soporta una longitud de contexto de 32.768 tokens, con una variante de 128k anunciada para el futuro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid MoE (transformer con capa densa previa a capas MoE, GQA) |
| Parametros totales | 17.151.125.376 (~17B) |
| Parametros activos | ~2.4B por token |
| Longitud de contexto | 32.768 tokens (variante de 128k anunciada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16-mixed; no se documentan GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | Inglés, hindi y 21 lenguas indias (asamés, bengalí, bodo, dogri, gujarati, kannada, konkani, cachemir, maithili, malayalam, manipuri, maratí, nepalí, oriya, panyabí, sánscrito, santali, sindhi, tamil, telugu, urdu) |
| Licencia | BharatGen Non-Commercial (según badge de la model card; no verificable en metadatos de Hugging Face) |
| Formato de pesos | safetensors (librería transformers, código custom `param2moe`) |

Otras especificaciones de arquitectura declaradas por el autor:

| Parametro | Valor |
|---|---|
| Expertos totales | 64 |
| Top-K expertos enrutados | 6 |
| Expertos compartidos | 2 |
| Hidden size | 2048 |
| Intermediate size | 9216 |
| Capas ocultas | 21 |
| Cabezas de atención | 32 (query) / 8 (KV) |
| Mecanismo de atención | Grouped Query Attention |
| Función de activación | SiLU |
| Normalización | RMSNorm |
| Tamaño de vocabulario | 128.000 |
| Precisión | bf16-mixed |
| Tamaño del repo | 102,9 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de tipo Mixture-of-Experts híbrida. La innovación principal es la combinación de una capa densa previa a las capas MoE, que transforma las entradas en representaciones estructuradas para mejorar la estabilidad del entrenamiento, junto con un esquema de enrutamiento que activa 6 expertos enrutados por token más 2 expertos compartidos siempre activos. Los expertos compartidos están diseñados específicamente para preservar representaciones cross-lingual estables, permitir el code-switching fluido y facilitar la transferencia de conocimiento entre las 23 lenguas soportadas. La atención usa Grouped Query Attention (32 cabezas de query, 8 de clave-valor), RMSNorm, activación SiLU y un vocabulario de 128.000 tokens.

El preentrenamiento se realizó desde cero en tres fases que suman aproximadamente 22,63 billones de tokens. La fase PT-1 (14,05T) se compone de 8,5T de inglés, 998,6B de hindi, 374,8B de matemáticas, 1,83T de código, 1,5T de lenguas indias, 500B de contenido técnico y 351B de instrucciones. La fase PT-2 (8,08T) incluye 2,5T de inglés, 773B de matemáticas, 2,46T de código, 62,5B de lenguas indias, 740B de instrucciones y 607B de razonamiento. La fase PT-3 (500B) está orientada a contexto largo: 150B de inglés, 62,5B de matemáticas, 100B de código, 62,5B de lenguas indias, 50B de instrucciones y 75B de razonamiento. El autor indica que el corpus se curó con control de calidad específico para las 22 lenguas indias, aunque la model card disponible se interrumpe antes de detallar el pipeline de post-entrenamiento (RLHF/DPO) y las recetas de alineación.

## Capacidades

- Generación de texto multilingüe en inglés, hindi y 21 lenguas indias adicionales, con énfasis en representación de comunidades lingüísticas infrarrepresentadas.
- Modo de razonamiento (thinking), indicado por el sufijo "Thinking" del checkpoint y por los 607B y 75B de tokens de razonamiento en las fases PT-2 y PT-3.
- Llamada a herramientas y function calling, según declara el autor en las capacidades post-entrenadas.
- Razonamiento matemático, con aproximadamente 1,2 billones de tokens de matemáticas agregados entre las tres fases.
- Generación de código, con aproximadamente 4,4 billones de tokens de código en el cómputo total.
- Comprensión de contexto largo de hasta 32.768 tokens, útil para documentos extensos y conversaciones multi-turno.
- Capacidad de code-switching entre lenguas indias e inglés, favorecida por los expertos compartidos.
- Ajuste fino posterior: se distribuye como checkpoint post-entrenado apto para especialización adicional.

## Casos de uso

- Atención al cliente en lenguas indias: el modelo puede gestionar conversaciones multi-turno en hindi, tamil, bengalí o maratí con hasta 32.768 tokens de contexto, lo que permite mantener historial de cliente y base de conocimiento en la misma ventana sin truncamientos agresivos.
- Traducción y localización entre inglés y lenguas indias: con 23 idiomas cubiertos y expertos compartidos para representaciones cross-lingual, es adecuado para pipelines de traducción automática y localización de contenido en mercados regionales de India.
- Asistentes con tool calling: al soportar function calling, puede integrarse como agente que consulte APIs (clima, reservas, pagos) en aplicaciones de servicios al consumidor en India, donde la cobertura multilingüe es un requisito.
- Generación de código en entornos de desarrollo: con aproximadamente 4,4 billones de tokens de código en el preentrenamiento, puede asistir en autocompletado, generación de tests y explicación de código, integrándose en IDE o pipelines de CI/CD mediante la API de transformers.
- Razonamiento matemático y tutoría educativa: los ~1,2 billones de tokens de matemáticas y el modo thinking permiten usarlo en plataformas de aprendizaje para resolver problemas paso a paso y explicar el razonamiento en la lengua del estudiante.
- Procesamiento de documentos largos: con 32.768 tokens de contexto, puede resumir informes, contratos o expedientes administrativos en inglés o en lenguas indias, un caso relevante para administraciones públicas y sector legal en India.
- Investigación en PLN multilingüe: al ser un MoE con expertos compartidos y licencia no comercial, sirve como base para estudiar transferencia cross-lingual y especialización de expertos en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los 17.151 millones de parámetros ocupan aproximadamente 34 GB solo en pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 40-48 GB de VRAM para bf16 con contexto moderado.
- Cuantización: no se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ). En una hipotética cuantización a 8 bits los pesos ocuparían ~17 GB y a 4 bits ~9 GB, pero estos valores son estimaciones de tamaño, no configuraciones soportadas oficialmente.
- GPU recomendadas: para bf16, A100 80 GB, H100 80 GB o dos GPU de 40-48 GB con tensor parallelism. En consumer GPU, una RTX 4090 (24 GB) no cabe en bf16; requeriría cuantización no oficial o descarga parcial a CPU.
- Despliegue: la model card declara compatibilidad con transformers y código custom (`param2moe`), además de integración con SageMaker. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, por lo que su uso en esos motores requeriría validación propia.
- Latencia y throughput: no disponibles. El autor destaca la eficiencia de activar solo 2,4B parámetros por token, pero no publica cifras de tokens por segundo ni latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Param2-17B-A2.4B-Thinking | 17B / 2,4B | 32.768 | 23 (inglés, hindi + 21 indias) | BharatGen Non-Commercial | Hugging Face (transformers) |
| Modelos MoE de referencia tipo Mixtral 8x7B | ~47B / ~13B | 32.768 | Principalmente inglés y europeas | Apache 2.0 (versión base) | Hugging Face, amplio ecosistema |
| Modelos densos de ~7-8B | ~7-8B | 8.192-32.768 | Variable, normalmente inglés dominante | Variable (a menudo permisiva) | Hugging Face, vLLM, llama.cpp, Ollama |

La comparación cuantitativa de rendimiento no está disponible porque el autor no publica benchmarks. Frente a alternativas como Mixtral 8x7B, Param2 ofrece un ratio de activación menor (2,4B frente a ~13B) y una cobertura lingüística india muy superior, pero con licencia no comercial y sin cuantizaciones oficiales ni soporte documentado en motores de inferencia populares. Frente a modelos densos de 7-8B, la ventaja está en la capacidad total (17B) y el multilingüismo indio, a costa de mayor tamaño de repo (102,9 GB) y requisitos de VRAM superiores.

## Limitaciones y advertencias

- Licencia BharatGen Non-Commercial: el uso comercial está restringido según el badge de la model card; es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier despliegue en producción.
- La licencia no aparece en los metadatos de Hugging Face ("no disponible"), lo que puede generar ambigüedad en pipelines automatizados de cumplimiento.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado por el autor al no publicar evaluaciones.
- Sesgos potenciales derivados del corpus de preentrenamiento, con sobrerrepresentación del inglés (11T de 22,6T) y del hindi frente a las demás lenguas indias, lo que puede producir un rendimiento desigual entre idiomas.
- Cobertura desigual de lenguas de bajos recursos como bodo, santali, manipuri o cachemir, con volúmenes de datos presumiblemente menores dentro del bloque agregado de 1,5T tokens indios.
- Contexto limitado a 32.768 tokens en esta versión; la variante de 128k está anunciada pero no disponible.
- Sin cuantizaciones oficiales ni soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que complica el despliegue eficiente en producción.
- El código custom (`param2moe`) implica dependencia de la implementación del autor; conviene fijar versiones de transformers y verificar compatibilidad.
- La model card disponible está truncada, por lo que no se detallan la receta de alineación (RLHF/DPO), las evaluaciones de seguridad ni las limitaciones declaradas por el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bharatgenai/Param2-17B-A2.4B-Thinking
- Repositorio relacionado citado en la model card: https://huggingface.co/bharatgenai/Param-2-17B-MoE-A2.4B
- Licencia (referenciada en la model card): https://huggingface.co/bharatgenai/Param-2-17B-MoE-A2.4B/blob/main/LICENSE
- Organización BharatGen en Hugging Face: https://huggingface.co/bharatgenai
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada.
