# francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed455` es un ajuste fino (fine-tuning) supervisado del checkpoint `goldfish-models/hin_deva_10mb`, publicado por el usuario francesca9805 en HuggingFace. Se trata de un transformer decoder-only de arquitectura GPT-2 con 39.087.104 parámetros totales (aproximadamente 39,1 millones) y un tamano de repositorio de 0,1 GB en formato safetensors. El entrenamiento se realizó con la librería TRL (versión 0.23.0) mediante SFT (supervised fine-tuning), según indica la propia model card.

El modelo base pertenece a la familia Goldfish, orientada a modelos monolingües pequenos; el identificador `hin_deva` apunta a hindi en escritura devanagari y el sufijo `10mb` sugiere un corpus de entrenamiento del orden de 10 MB, aunque esto no se confirma en la documentación. El ajuste parece formar parte de un experimento académico (la ejecución de entrenamiento está registrada en un proyecto de Weights & Biases de la Universidad de Groningen), más que de un lanzamiento de producción.

Su relevancia práctica es limitada pero concreta: sirve como caso de estudio de pipelines de SFT con TRL sobre modelos minúsculos, útil para reproducir experimentos de tokenización y ajuste con recursos mínimos. No cuenta con descargas ni likes, no publica benchmarks y no especifica licencia ni idiomas soportados, por lo que debe tratarse como un artefacto experimental no validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), según el tag `gpt2` |
| Parámetros totales | 39.087.104 (dato real de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la ficha; el identificador del modelo base (`hin_deva`) indica hindi en escritura devanagari |
| Licencia | No disponible (el frontmatter de la model card incluye `licence: license`, un marcador sin contenido) |
| Formato de pesos | Safetensors (librería `transformers`) |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | goldfish-models/hin_deva_10mb |
| Método de entrenamiento | SFT con TRL 0.23.0 |
| Versiones del entorno | Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |
| Downloads / likes | 0 / 0 |
| Fecha de creación | 2026-09-22 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, un transformer decoder-only con atención causal, tal como indica el tag `gpt2` del repositorio. El recuento real de parámetros (39.087.104) corresponde a una configuración reducida dentro de la familia GPT-2, coherente con los modelos monolingües pequenos de Goldfish; no se detalla en la información disponible el número de capas, la dimensión oculta, el número de cabezas de atención ni el tamano del vocabulario. Tampoco se confirma la longitud de contexto, aunque la arquitectura GPT-2 del modelo base suele emplear 1024 tokens, dato no verificado en esta documentación.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre el checkpoint `goldfish-models/hin_deva_10mb`, ejecutado con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121. La model card no documenta el número de tokens de entrenamiento, la composición del dataset de ajuste, la existencia de etapas de RLHF o DPO, ni hiperparámetros como la tasa de aprendizaje o el número de épocas. El nombre del repositorio (`ppt`, `Dp-10mb-packed`, `bfd_seed455`) sugiere un experimento sobre dataset empaquetado (packed) con una semilla concreta, pero estas siglas no se explican en la documentación publicada. La ejecución está registrada en Weights & Biases dentro del proyecto `new-tokenizers` de `f-padovani-university-of-groningen`.

## Capacidades

- Generación de texto autoregresiva mediante `pipeline("text-generation")`, tal como muestra el ejemplo de la model card.
- Conversación en formato de chat: el ejemplo oficial pasa una lista con `{"role": "user", "content": ...}`, aunque no se documenta una plantilla de chat específica ni un proceso de instruction tuning más allá de SFT.
- Tool calling / function calling: no disponible; no se menciona soporte alguno.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia de ello en un modelo de 39M parámetros con SFT no documentado.
- Capacidades multilingües: no disponibles; el modelo base apunta a hindi en devanagari, pero no se declaran idiomas en la ficha.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con text-generation-inference: el repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`, por lo que es desplegable en TGI y en Inference Endpoints.

## Casos de uso

- Reproducción de experimentos de SFT: el modelo permite replicar un pipeline de ajuste con TRL sobre un corpus pequeno, útil en docencia o investigación sobre tokenización, dado que la ejecución está registrada en Weights & Biases con versiones concretas del stack.
- Pruebas unitarias de infraestructura de inferencia: con 39M parámetros y 0,1 GB de pesos, sirve para validar despliegues en TGI, vLLM o endpoints sin consumir GPU de gama alta.
- Generación de texto en hindi devanagari a nivel experimental: puede emplearse para explorar la calidad de un modelo monolingüe entrenado con muy pocos datos, siempre que se validen las salidas manualmente.
- Investigación sobre escalado de datos: comparar este checkpoint con el modelo base `hin_deva_10mb` permite estudiar el efecto de un ajuste SFT adicional sobre un mismo corpus de 10 MB.
- Prototipado de bajo coste en CPU: al ser un modelo de decenas de megabytes, se puede ejecutar en portátiles o dispositivos embebidos para demos de generación de texto sin GPU.
- Análisis de sesgos y alucinación en modelos minúsculos: su corpus reducido lo convierte en un caso claro para medir la degradación de factualidad en modelos con pocos datos, con fines metodológicos.
- Pruebas de estrés de pipelines de CI/CD: integrarlo como modelo de prueba en test automatizados de servicios de generación de texto, ya que su carga y descarga son casi instantáneas frente a modelos de miles de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web realizada no devolvió resultados relacionados con este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 156 MB en fp32, 78 MB en fp16/bf16, 39 MB en int8 y en torno a 20 MB en cuantización de 4 bits (cálculo derivado de los 39.087.104 parámetros, no un dato publicado). A ello hay que sumar la memoria de activaciones y la caché KV, proporcional a la longitud de contexto efectiva.
- Cabe en cualquier GPU de consumo: desde una GTX 1050 o una RTX 3060 hasta una RTX 4090, con un consumo de VRAM inferior a 1 GB en la mayoría de configuraciones.
- Funciona en CPU sin GPU y en placas como Raspberry Pi 4/5 para inferencia de baja concurrencia.
- GPU de centro de datos (A100, H100) no aportan ventaja relevante; el modelo queda limitado por latencia de lanzamiento más que por cómputo.
- Opciones de despliegue: `transformers` (Pipeline), text-generation-inference (por los tags `text-generation-inference` y `endpoints_compatible`), vLLM y HuggingFace Inference Endpoints. Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, ya que no se publican pesos cuantizados.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed455 | 39.087.104 | No disponible | No disponible | Sin benchmarks publicados | Repositorio público, 0 descargas |
| goldfish-models/hin_deva_10mb (modelo base) | No disponible en la información (mismo orden de magnitud, sin confirmar) | No disponible | No disponible | Sin datos en esta información | Repositorio público de referencia |
| Otras alternativas del mismo tamano o tarea | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre modelos comparables en la documentación consultada |

La búsqueda web asociada no devolvió información técnica sobre este modelo ni sobre alternativas comparables; los resultados obtenidos trataban sobre constantes fisiológicas veterinarias y no guardan relación con el modelo.

## Limitaciones y advertencias

- Artefacto experimental sin validación: 0 descargas y 0 likes, sin benchmarks ni evaluación independiente publicada.
- Corpus de entrenamiento muy reducido: el modelo base apunta a unos 10 MB de texto, lo que implica un conocimiento del mundo mínimo y una alta probabilidad de salidas incoherentes o repetitivas fuera de dominios muy concretos.
- Riesgo elevado de alucinación: un modelo de 39M parámetros con SFT no documentado no dispone de mecanismos de verificación factual.
- Ausencia de alineación de seguridad documentada: solo se indica SFT, sin RLHF, DPO ni filtros de contenido, por lo que puede generar texto inapropiado si el corpus de ajuste lo contiene.
- Idiomas: no se declaran idiomas soportados; el uso se limita previsiblemente al hindi en devanagari por herencia del modelo base, sin garantía de calidad en otros idiomas.
- Licencia no disponible: el frontmatter incluye `licence: license` como marcador vacío y los metadatos de HuggingFace no especifican licencia. El uso comercial es jurídicamente incierto y no debería asumirse permitido.
- Contexto no especificado: se desconoce la ventana máxima; prompts largos pueden truncarse o degradar la salida.
- Formatos limitados: no hay GGUF ni cuantizaciones listas para usar, lo que obliga a conversiones propias para llama.cpp u Ollama.
- Metadatos anómalos: la fecha de creación registrada (2026-09-22) es posterior a la fecha de consulta habitual y no se corresponde con las versiones de librerías declaradas, lo que refuerza la naturaleza experimental del repositorio.
- No apto para producción: sin licencia, sin benchmarks y sin garantías de calidad, su uso debe restringirse a experimentación y docencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_10mb
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/7qa67t3j
- Repositorio de TRL: https://github.com/huggingface/trl
- Referencia de TRL citada en la model card: von Werra, L. et al. (2020), *TRL: Transformer Reinforcement Learning*, GitHub.
- Resultados de búsqueda web: sin enlaces relevantes; las búsquedas devolvieron documentación sobre constantes fisiológicas veterinarias, sin relación con el modelo.
