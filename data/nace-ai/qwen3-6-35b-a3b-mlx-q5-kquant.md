# nace-ai/Qwen3.6-35B-A3B-MLX-Q5-KQuant

## Resumen

Qwen3.6-35B-A3B-MLX-Q5-KQuant es una cuantización de 5 bits del modelo Qwen/Qwen3.6-35B-A3B, publicada por nace-ai mediante su framework KQuant v0.2. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 35.107.181.936 parámetros totales y capacidad multimodal image-text-to-text, orientado a generación de texto, razonamiento, código y conversación con soporte de tool calling. Esta versión empaqueta los pesos del modelo de lenguaje en formato MLX con un promedio de 5,094 bits por peso, ocupando 22,07 GB, y reutiliza la torre de visión de un pack OptiQ-4bit de mlx-community.

La relevancia de este pack reside en la relación calidad-tamaño: según la model card, la distancia KL respecto al modelo en bf16 es de 0,0271 sobre texto original y 0,0681 sobre texto de chat y tool calls, medidos sobre 32.704 y 65.472 tokens respectivamente. Además, el autor reporta 20 de 20 ensayos con thinking desactivado en los que el modelo colocó la llamada a herramienta y completó el round trip, lo que lo hace candidato para despliegues en Apple Silicon con mlx-lm.

Se distribuye bajo licencia Apache 2.0, igual que el modelo base, y está etiquetado únicamente para inglés. El repositorio tiene 23,0 GB y seis archivos de pesos que suman 22.961.646.328 bytes. No se han publicado datos sobre arquitectura interna detallada, composición del dataset de entrenamiento ni número de tokens de preentrenamiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit MLX con KQuant v0.2 (5,094 bits/peso de media); el repo incluye además etiqueta `4-bit` por la torre de visión OptiQ-4bit |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 6 archivos, 22.961.646.328 bytes |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.6-35B-A3B es un transformer de tipo Mixture of Experts con 35.107.181.936 parámetros totales, según los safetensors del pack. La información disponible no detalla el número de expertos, la proporción de parámetros activos por token, la longitud de contexto nativa ni la composición del corpus de entrenamiento. El pipeline declarado es image-text-to-text, lo que confirma una torre de visión integrada; en este pack concreto, esa torre procede de mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit y consta de 333 tensores y 893.142.496 bytes.

La innovación técnica de esta ficha no está en el entrenamiento, sino en la cuantización. KQuant v0.2, el framework de Nace, ajusta cada grupo de pesos contra el comportamiento del modelo sobre texto real, no solo contra los valores de los pesos, y escribe un pack MLX estándar sin requerir software adicional. El resultado son 22.068.230.400 bytes de pesos de lenguaje a 5,09356 bits por peso de media. La model card reporta la ejecución de la validación en una NVIDIA H200 de 151 GB con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4. No se documentan detalles sobre RLHF, DPO ni fases de alineación del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline `conversational` y las pruebas de chat reportadas.
- Razonamiento y soporte de modo thinking: la model card distingue ensayos con thinking desactivado, lo que implica que el modelo base expone un modo de razonamiento explícito.
- Tool calling / function calling: se validaron 20 de 20 ensayos de colocación de llamada y round trip completo con thinking desactivado.
- Procesamiento de imagen y texto (image-text-to-text) mediante la torre de visión incluida en el pack.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`; no se declaran otros idiomas.
- No se dispone de información sobre capacidades de audio, agentes multi-paso autónomos ni otras modalidades en la documentación proporcionada.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el pack MLX de 22,07 GB de pesos de lenguaje puede ejecutarse con `mlx-lm` en equipos con memoria unificada suficiente, gestionando diálogos multi-turno en inglés con un modelo de 35B parámetros totales en formato MoE.
- Automatización con tool calling: los 20 de 20 ensayos de llamada a herramienta completados con éxito permiten integrar el modelo en flujos donde debe invocar APIs externas, consultar bases de datos o ejecutar funciones definidas por el desarrollador.
- Análisis de documentos con imagen: al conservar la torre de visión, el modelo puede recibir capturas, diagramas o páginas escaneadas junto a instrucciones de texto y devolver descripciones o extracciones en inglés.
- Prototipado e investigación en entornos MLX: al ser un pack MLX estándar sin dependencias adicionales, sirve para evaluar el comportamiento de un MoE de 35B cuantizado a 5 bits en hardware Apple antes de decidir un despliegue mayor.
- Evaluación de cuantizaciones: las métricas KL publicadas (0,0271 en texto original y 0,0681 en chat/tool-call) permiten comparar este pack con otras cuantizaciones del mismo modelo base sobre el mismo protocolo de tokens congelados.
- Generación de código y texto técnico en pipelines de desarrollo: el modelo base está orientado a código y razonamiento, y la cuantización de 5 bits reduce el espacio en disco en comparación con bf16, lo que facilita su distribución en entornos de desarrollo con almacenamiento limitado.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos cuantitativos disponibles son las métricas de fidelidad de la cuantización y la prueba de tool calling:

| Metrica | Valor | Tokens |
|---|---|---|
| KL respecto al modelo bf16, texto original (menor es mejor) | 0,0271 | 32.704 |
| KL respecto al modelo bf16, texto de chat y tool-call (menor es mejor) | 0,0681 | 65.472 |
| Ensayos de tool calling con thinking desactivado completados | 20 de 20 | no disponible |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el pack ocupa 22,07 GB de pesos de lenguaje más 893.142.496 bytes de torre de visión, con un total de repositorio de 23,0 GB. Se necesita memoria unificada o VRAM por encima de esa cifra para cargar los pesos, más el espacio para KV cache y activaciones.
- GPU recomendadas: la validación del autor se ejecutó en una NVIDIA H200 de 151 GB, aunque el formato MLX está pensado para Apple Silicon; no se documentan requisitos para GPU NVIDIA en producción con este pack.
- Cabe en GPU de consumo: no hay datos publicados sobre ejecución en RTX 4090 u otras GPU consumer; en Apple Silicon, equipos con 32 GB de memoria unificada o más son el objetivo natural por el tamaño de los pesos, aunque el autor no lo confirma.
- Opciones de despliegue: `mlx-lm` (versión 0.32.2 en la validación), con el comando `mlx_lm.generate --model nace-ai/Qwen3.6-35B-A3B-MLX-5bit-KQuant`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este pack.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai/Qwen3.6-35B-A3B-MLX-Q5-KQuant (este) | 35.107.181.936 | no disponible | 5-bit MLX KQuant (5,094 bits/peso) | apache-2.0 | Hugging Face, formato MLX |
| Qwen/Qwen3.6-35B-A3B (base) | 35.107.181.936 | no disponible | bf16 | apache-2.0 | Hugging Face |
| mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit | no disponible | no disponible | 4-bit OptiQ | no disponible | Hugging Face, formato MLX |

La comparativa se limita a variantes del mismo modelo base porque la información proporcionada no incluye datos de modelos alternativos de otros autores. No se dispone de métricas de rendimiento comparables entre estos packs más allá de las distancias KL reportadas por el autor de este repositorio.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Alucinación: no se documentan evaluaciones de factualidad ni tasas de alucinación para este pack ni para el modelo base en la información disponible.
- Sesgos: no se publica información sobre sesgos conocidos del modelo base ni sobre su mitigación.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.6-35B-A3B y de la torre de visión tomada de mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit, cuya licencia no se detalla en la información proporcionada.
- Formato: el pack es específico de MLX; no es directamente utilizable en vLLM, llama.cpp, Ollama o TGI sin conversión adicional.
- Cuantización: la distancia KL de 0,0681 en texto de chat y tool-call es superior a la de 0,0271 en texto original, lo que indica mayor desviación en escenarios conversacionales y de llamadas a herramientas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 11 de noviembre de 2026, por lo que carece de validación independiente de la comunidad.
- Contexto y parámetros activos: al no publicarse la longitud de contexto ni el número de parámetros activos, no es posible estimar con precisión los requisitos de memoria para secuencias largas ni el coste computacional por token.

## Enlaces

- Hugging Face del pack: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-Q5-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Torre de visión de origen: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit
- Resultados de la validación: results.json (incluido junto a la model card en el repositorio)
- Datos del gráfico KL vs tamaño: assets/kl-vs-size-data.json (incluido en el repositorio)
- Gráfico KL vs tamaño: assets/kl-vs-size.svg (incluido en el repositorio)
