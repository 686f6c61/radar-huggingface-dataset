# codefusionduo/suku-ai-128b-titan

## Resumen

Suku AI 128B Titan es un modelo de lenguaje publicado en Hugging Face por el usuario codefusionduo bajo el identificador `codefusionduo/suku-ai-128b-titan`. El autor lo presenta como un modelo fundacional indio de arquitectura Mixture-of-Experts (MoE) dispersa, con 128.450 millones de parámetros totales y 32.100 millones de parámetros activos por token mediante enrutamiento top-2 sobre 8 expertos. La model card lo describe como parte de un "supercluster" de varios modelos (CodeCraft, NovaCraft, AgriSathi y Rudra Engine) que sumarían unos 204.000 millones de parámetros.

El modelo se distribuye con licencia MIT, soporte declarado para hindi, inglés y sánscrito, y una ventana de contexto declarada de 131.072 tokens. La model card incluye una tabla de benchmarks con métricas muy altas (MMLU 84,6%, GSM8K 88,1%, IndicGLUE 89,2%), pero la propia card advierte que esas cifras son "objetivos de convergencia y metas de diseño arquitectónico" de un despliegue previsto, no resultados verificados. Los pesos reales del repositorio, según los metadatos de safetensors, suman solo 206.208 parámetros, muy lejos de los 128.000 millones anunciados.

Por tanto, esta ficha debe leerse con cautela: la información disponible mezcla especificaciones declaradas por el autor con datos de repositorio que no las respaldan. Es relevante ahora como caso de estudio de discrepancias entre model card y artefactos publicados, y no como un modelo listo para producción a la escala que anuncia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa decoder-only tipo transformer (declarada); tags de Hugging Face indican `mixtral` |
| Parametros totales | 128.450 millones declarados por el autor; 206.208 según safetensors del repositorio |
| Parametros activos | 32.100 millones declarados (8 expertos, enrutamiento top-2) |
| Longitud de contexto | 131.072 tokens (128K) declarados |
| Tipos de cuantizacion | bfloat16 y 4-bit AWQ declarados; no hay archivos GGUF ni cuantizaciones publicadas en el repositorio |
| Idiomas soportados | Hindi (hi), inglés (en), sánscrito (sa) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers); tamano del repo indicado: 0.0 GB |

Otros datos declarados en la model card: dimensión oculta 8.192, dimensión intermedia 28.672, 64 capas, atención GQA con 64 cabezas y 8 cabezas KV, RoPE con theta 500.000, vocabulario de 128.256 tokens BPE y preentrenamiento sobre 500.000 millones de tokens.

## Arquitectura y entrenamiento

El autor describe un transformer decoder-only con capas MoE dispersas: 64 capas, dimensión oculta de 8.192, dimensión feed-forward de 28.672 y atención con Grouped-Query Attention (64 cabezas de consulta, 8 de clave-valor). El enrutamiento sería top-2 sobre 8 expertos, lo que daría 32.100 millones de parámetros activos por token. El vocabulario de 128.256 tokens BPE estaría optimizado para hindi, sánscrito, hinglish e inglés, y el preentrenamiento habría consumido 500.000 millones de tokens según la card.

No se documentan detalles sobre la composición del dataset, el proceso de alineación (RLHF, DPO u otro), ni innovaciones técnicas verificables más allá de la propia arquitectura MoE. La card menciona además un "supercluster" de modelos satélite (CodeCraft 34B, NovaCraft 28B, AgriSathi 14B y Rudra Engine) sin especificar cómo se integran a nivel de pesos. Los metadatos de safetensors del repositorio (206.208 parámetros totales) contradicen frontalmente la escala declarada, por lo que la arquitectura descrita no puede confirmarse a partir de los artefactos publicados.

## Capacidades

- Generación de texto conversacional en hindi, inglés y sánscrito, con especial énfasis declarado en hinglish.
- Razonamiento general y resolución de problemas multi-paso (declarado, sin verificación independiente).
- Generación de código en Python y C++ según la card (etiqueta "CodeCraft").
- Matemáticas y problemas de varios pasos (GSM8K citado como objetivo).
- Soporte declarado de agente de voz con latencia de turno inferior a 280 ms.
- Integración con un compañero 3D interactivo ("Kawaii companion") mediante un Space de Hugging Face.
- Telemetría de infraestructura en 405 dominios y visión óptica, atribuidas al componente Rudra Engine del cluster.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales de audio o visión nativas en el modelo principal: no disponibles; la card las asocia a componentes separados del cluster.

## Casos de uso

- Asistencia conversacional en hindi e inglés para atención al cliente: el modelo declara fluidez en hinglish y una ventana de 128K tokens que permitiría mantener historiales largos de conversación multi-turno; conviene validar primero la calidad real con los pesos publicados.
- Procesamiento de documentación en sánscrito: es uno de los pocos modelos que declara soporte explícito de sánscrito, útil para digitalización y consulta de textos clásicos, aunque la cobertura real de ese idioma no está verificada.
- Prototipado de agentes de voz: la card declara latencias de turno inferiores a 280 ms, adecuadas para asistentes telefónicos o kioscos interactivos, siempre que se confirme el rendimiento en el hardware objetivo.
- Generación de código en pipelines de desarrollo: la etiqueta CodeCraft sugiere uso para autocompletado y revisión de código en Python y C++, pero sin datos verificados de HumanEval no debería desplegarse sin evaluación propia.
- Experimentación académica sobre MoE: útil como referencia para estudiar enrutamiento top-2 y arquitecturas dispersas, aunque la discrepancia de parámetros exige inspeccionar los pesos antes de cualquier conclusión.
- Educación y divulgación en indología: combinado con el Space 3D, puede servir para demos interactivas de un asistente cultural multilingüe en ferias o entornos educativos.
- Investigación sobre gobernanza de modelos: caso práctico para estudiar cómo se comunican especificaciones no verificadas en model cards y qué controles aplicar antes de adoptar un modelo.

## Benchmarks y rendimiento

La model card incluye una tabla de métricas, pero el propio autor la etiqueta como "objetivos de convergencia y metas de diseño arquitectónico" de un despliegue previsto, no como resultados verificados. Se reproducen a continuación con esa advertencia explícita.

| Benchmark | Suku AI (declarado) | LLaMA-3 70B (declarado en la card) | Krutrim Pro (declarado en la card) | Sarvam-2B (declarado en la card) |
|---|---|---|---|---|
| IndicGLUE (hindi/hinglish) | 89,2% | 64,1% | 74,8% | 71,5% |
| MMLU | 84,6% | 82,0% | 68,4% | 54,2% |
| GSM8K | 88,1% | 82,3% | 62,0% | 48,9% |
| HumanEval | 78,4% | 81,7% | 55,2% | 42,1% |
| Agri-Bench | 94,5% | 52,3% | 66,8% | 69,2% |
| Latencia de turno conversacional | < 280 ms | > 800 ms | > 1,2 s | > 650 ms |

No se han publicado resultados de benchmarks verificados de forma independiente en la información disponible. Las cifras de la tabla deben tratarse como objetivos del autor, no como mediciones reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable. Con 128.450 millones de parámetros en bfloat16 harían falta aproximadamente 257 GB de VRAM; en 4-bit AWQ, unos 64-70 GB. Con los 206.208 parámetros reales del repositorio, el modelo cabría en cualquier GPU consumer, lo que refuerza la discrepancia entre card y artefactos.
- GPU recomendadas (según la escala declarada): múltiples H100 80 GB o A100 80 GB para bfloat16; una o dos H100/A100 para la variante AWQ de 4 bits.
- GPU consumer: la variante de 4 bits podría caber en una RTX 4090 (24 GB) solo con cuantización agresiva y offloading parcial; en bfloat16 no cabe en ninguna GPU consumer.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags de Hugging Face. No se publican archivos GGUF, por lo que llama.cpp y Ollama no están soportados de forma directa con los artefactos actuales.
- Latencia y throughput: la card declara menos de 280 ms por turno conversacional; no hay mediciones independientes ni datos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Suku AI 128B Titan | 128,45B declarados / 206.208 reales en safetensors | 131.072 declarados | MIT | Pesos en Hugging Face, sin verificación de escala |
| Krutrim Pro | 70B | 8.192 | No disponible en la información | Comercial (Ola/Krutrim) |
| Sarvam-2B | 2B | 4.096 | No disponible en la información | Pesos abiertos según la card |
| LLaMA-3 70B | 70B | 8.192 | Licencia comunitaria de Meta | Pesos en Hugging Face |

La comparativa se basa en los datos que el propio autor incluye en la model card; no se dispone de evaluaciones independientes que permitan contrastar rendimiento real entre estos modelos en las mismas condiciones.

## Limitaciones y advertencias

- Discrepancia crítica de escala: los safetensors del repositorio suman 206.208 parámetros, no 128.450 millones. Cualquier evaluación de rendimiento debe hacerse sobre los pesos reales descargados.
- Benchmarks no verificados: la propia card califica las métricas como objetivos de diseño, no como resultados medidos.
- Riesgo de alucinación: no hay datos sobre alineación (RLHF, DPO) ni evaluaciones de veracidad; en un modelo de esta naturaleza el riesgo es alto y no está cuantificado.
- Sesgos: no se documentan sesgos conocidos ni metodología de evaluación de sesgos; la cobertura se limita a hindi, inglés y sánscrito, con posible infrarrepresentación de otras lenguas de la India.
- Limitaciones de idioma: fuera de hi, en y sa el soporte no está declarado y probablemente sea deficiente.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; al tratarse de un artefacto cuya escala no coincide con la anunciada, conviene revisar los términos y el contenido real antes de integrarlo en producción.
- Ausencia de formatos cuantizados publicados: no hay GGUF ni AWQ en el repositorio, lo que dificulta el despliegue en hardware consumer.
- Documentación incompleta: no se detallan datos de entrenamiento, composición del dataset ni proceso de alineación, lo que impide auditar el modelo.
- Advertencia para producción: no se recomienda su uso en entornos críticos sin una evaluación propia sobre los pesos reales y una revisión legal de la licencia y del contenido del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codefusionduo/suku-ai-128b-titan
- Dataset declarado: https://huggingface.co/datasets/codefusionduo/suku-sovereign-instruct-18k
- Demo 3D en Hugging Face Spaces: https://huggingface.co/spaces/codefusionduo/suku-ai-3d
- Repositorio GitHub: https://github.com/codefusionduo/suku
