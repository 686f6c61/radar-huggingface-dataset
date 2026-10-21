# bunilastelian/Qwen2.5-7B-Romanian-SFT-GGUF

## Resumen

Qwen2.5-7B-Romanian-SFT-GGUF es una adaptación al rumano del modelo Qwen2.5-7B-Instruct, publicada por el usuario bunilastelian en Hugging Face. Se trata de un ajuste supervisado (SFT) bilingüe rumano-inglés sobre la arquitectura densa de 7.615.616.512 parámetros de Qwen2.5, distribuido en el repositorio únicamente como cuantización GGUF Q8_0 de 8,10 GB, lista para llama.cpp, Ollama, LM Studio y llama-cpp-python. La licencia Apache 2.0 del modelo base se mantiene.

El autor presenta el modelo como especializado en tareas cognitivas en rumano (código Python, ciencia, matemáticas, conocimiento académico, hechos y gramática rumana), con un 60,67 % de acierto global sobre un conjunto propio de 300 preguntas. El repositorio figura con cero descargas y cero «likes» en el momento de la consulta, y las tecnologías que la model card atribuye a «Stanford NCM (Next Concept Model)» y «System 1 JevLaya Cognitive Routing» no tienen documentación pública verificable: deben tratarse como afirmaciones del autor, no como componentes auditados.

Su interés actual es doble: ocupa el hueco de modelos abiertos con acento específico en rumano sobre una base moderna (Qwen2.5, preentrenada con 18 billones de tokens según Qwen) y, al publicarse en GGUF Q8_0, permite inferencia local en GPU de consumo. Ahora bien, el 53 % declarado en MMLU está muy por debajo de las cifras publicadas para Qwen2.5-7B-Instruct, lo que obliga a verificar si el SFT ha degradado capacidades generales o si la evaluación sigue un protocolo no estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con GQA, RoPE, RMSNorm y SwiGLU (arquitectura Qwen2.5-7B: 28 capas, dimensión oculta 3.584, 4 cabezas KV, vocabulario 152.064) |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativo (131.072 con YaRN) según la documentación de Qwen2.5-7B-Instruct; la model card de este fine-tune no lo especifica |
| Tipos de cuantización | Solo Q8_0 GGUF (8,10 GB) publicado; no hay Q4_K_M, Q5_K_M ni otros niveles en el repositorio |
| Idiomas soportados | rumano (ro), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen2.5-7b-instruct-ro-q8_0.gguf`); la model card menciona «GGUF & PyTorch», pero no se publican safetensors en el repositorio |
| Formato de prompt | ChatML (`<|im_start|>role ... <|im_end|>`) |
| Tamaño del repositorio | 8,1 GB |
| Contexto de entrenamiento declarado | SFT bilingüe ro/en; número de tokens y composición no disponibles |

## Arquitectura y entrenamiento

La base es Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención de consultas agrupadas (28 cabezas de atención y 4 cabezas KV), normalización RMSNorm pre-atención, activación SwiGLU y embeddings de RoPE, entrenado por Alibaba Qwen sobre 18 billones de tokens y alineado posteriormente mediante SFT y optimización por preferencias. Sobre esa base, el autor aplica un ajuste supervisado (SFT) bilingüe rumano-inglés cuyo dataset, número de tokens, mezcla de datos e hiperparámetros no se documentan en la model card. No se declara uso de RLHF, DPO u otra etapa de alineación adicional.

La model card afirma que el proyecto integra componentes modulares propios: «Stanford NCM (Next Concept Model)», descrito como una descomposición jerárquica conceptual en 11 niveles de resolución; «System 1 JevLaya Cognitive Head», descrito como un enrutador cognitivo con latencia inferior a 1 ms; y un bucle de «autoaprendizaje continuo» con validación en sandbox AST. No hay paper, repositorio de código ni documentación pública que permita verificar estas afirmaciones ni determinar si implican pesos adicionales, cambios en el grafo de inferencia o simples instrucciones de sistema. A efectos prácticos, el artefacto distribuido es un GGUF estándar de Qwen2.5-7B con vocabulario y plantilla ChatML, sin adaptadores ni cabezas extra visibles.

## Capacidades

- Generación de texto conversacional en rumano e inglés, con plantilla ChatML y rol de sistema.
- Generación de código, con resultado declarado del 90 % (45/50) en pruebas Python validadas por ejecución de tests unitarios en sandbox AST según el autor.
- Razonamiento científico y causal: 76 % (38/50) en el conjunto propio de ciencia y razonamiento.
- Razonamiento aritmético de varios pasos: 52 % (26/50) en tareas del estilo GSM8K reportadas por el autor.
- Conocimiento académico general: 53 % (53/100) en el bloque MMLU del conjunto de evaluación propio.
- Conocimiento factual y normativo del rumano (gramática, literatura, historia): 40 % (20/50), el área más débil del informe.
- Soporte de function calling / tool calling heredado de Qwen2.5-7B-Instruct; no verificado en este fine-tune, ya que la model card no documenta evaluación de herramientas ni agentes.
- Capacidad multilingüe limitada a ro/en; no se declaran otros idiomas y el ajuste está sesgado al rumano.
- No se declaran capacidades de visión, audio, modalities multimodales ni modo «thinking» explícito.

## Casos de uso

- Atención al cliente en rumano: el modelo mantiene conversaciones multi-turno con contexto de hasta 32.768 tokens, suficiente para hilos de soporte con histórico de incidencias, y responde en registro formal rumano; para producción conviene validar antes la tasa de alucinación en política de producto.
- Generación asistida de código Python con explicaciones en rumano: el 90 % declarado en pruebas con tests unitarios lo hace apto como copiloto interno para equipos rumanoparlantes, integrándolo en un pipeline que ejecute la suite de tests antes de aceptar la sugerencia.
- Traducción y localización de documentación técnica en/ro: útil para adaptar manuales, changelogs y textos de interfaz al rumano, con revisión humana obligatoria por el 40 % de acierto en el bloque de gramática y hechos rumanos.
- Tutoría académica y preparación de material didáctico: el 76 % en ciencia y razonamiento permite generar explicaciones paso a paso de física y lógica, pero el 52 % en matemáticas desaconseja usarlo como corrector automático de ejercicios aritméticos sin verificación.
- Extracción y clasificación de texto en rumano (resúmenes de actas, categorización de tickets, normalización de campos): tarea de baja temperatura donde el modelo rinde de forma estable y el coste de un error es bajo.
- Inferencia local y en el borde: al publicarse en Q8_0 de 8,10 GB, se puede ejecutar en LM Studio, Ollama o llama.cpp sobre un portátil con GPU de 12-16 GB o, según el autor, en móviles Android de gama alta con 12 GB de RAM, lo que habilita asistentes sin conexión y sin enviar datos a la nube.
- Base para fine-tunes verticales: la licencia Apache 2.0 y el formato GGUF permiten reutilizarlo o recuantizarlo para dominios concretos (legal rumano, administración pública) sin obligaciones de atribución adicionales.
- Evaluación comparativa de adaptaciones al rumano en investigación: sirve como punto de partida reproducible para medir el efecto del SFT sobre capacidades generales, dado que la model card publica el desglose por dominio.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto propio de 300 preguntas *held-out* (no se especifica el harness, el número de *shots* ni la fecha de corte):

| Dominio cognitivo | Acierto | Muestras | Metodología declarada |
|---|---|---|---|
| Código Python | 90,0 % | 45/50 | Ejecución de tests unitarios en sandbox AST |
| Ciencia y razonamiento | 76,0 % | 38/50 | Lógica causal y física |
| Matemáticas (estilo GSM8K) | 52,0 % | 26/50 | Razonamiento aritmético bilingüe paso a paso |
| Conocimiento académico (MMLU) | 53,0 % | 53/100 | Dominios académicos variados |
| Hechos y lengua rumana | 40,0 % | 20/50 | Gramática, literatura e historia |
| **Global** | **60,67 %** | **182/300** | — |

Throughput declarado: más de 80 tokens/s en una NVIDIA RTX 3090 con el GGUF Q8_0. No se publican latencia de primer token, resultados en otros idiomas, comparación con el modelo base bajo el mismo harness ni métricas de herramientas/agentes.

## Requisitos de hardware

- VRAM con Q8_0 (8,10 GB de pesos): aproximadamente 9 GB con contexto corto (2-4k) y en torno a 10-10,5 GB con 32.768 tokens, considerando una caché KV de ~56 KiB por token para 28 capas y 4 cabezas KV en FP16.
- VRAM en FP16/BF16 (si se reconvierte desde el modelo base): ~15,3 GB de pesos, más caché KV; requiere 24 GB o más para contextos largos.
- GPU de consumo: cabe en RTX 3060 12 GB (justo, mejor recuantizar a Q4_K_M, ~4,7 GB), RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 3090 y RTX 4090. No cabe en GPU de 8 GB en Q8_0; sí en Q4.
- GPU de datacenter: L4 24 GB, A10G 24 GB, A100 40/80 GB y H100 para lotes grandes en FP16. El modelo no requiere hardware especializado por tamaño.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y llama-cpp-python son las rutas nativas para GGUF. vLLM y TGI solo son viables recuantizando o exportando pesos no GGUF, que el autor no publica; el soporte GGUF de vLLM es experimental.
- Throughput: ~80 tokens/s en RTX 3090 según el autor con Q8_0; no hay datos de latencia ni de rendimiento con lotes concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Romanian-SFT-GGUF | 7,6 B (denso) | 32.768 (heredado) | Apache 2.0 | Rumano + inglés, SFT | Solo GGUF Q8_0, 0 descargas |
| Qwen2.5-7B-Instruct (base) | 7,6 B (denso) | 32.768 (131.072 con YaRN) | Apache 2.0 | Multilingüe general, tool calling | Safetensors + GGUF oficiales, ampliamente desplegado |
| Llama 3.1 8B Instruct | 8,03 B (denso) | 131.072 | Llama 3.1 Community License | Multilingüe general (8 idiomas, rumano no oficial) | Safetensors + GGUF, ecosistema maduro |
| Mistral 7B Instruct v0.3 | 7,25 B (denso) | 32.768 | Apache 2.0 | Multilingüe general, sin foco en rumano | Safetensors + GGUF |
| OpenLLM-Ro (RoLlama2-7B / RoMistral-7B) | ~7 B (denso) | 4.096 / 32.768 (según base) | Heredada de Llama 2 y Apache 2.0 | Familia específica para rumano | Safetensors + cuantizaciones de la comunidad |

No hay resultados de benchmarks comparables publicados bajo un mismo harness entre estos modelos y este fine-tune; las cifras del apartado anterior proceden de un conjunto propio del autor y no son directamente equiparables a MMLU estándar, HumanEval o GSM8K oficiales. En cobertura de rumano, la alternativa específica más consolidada es la familia OpenLLM-Ro, con más documentación y adopción que este repositorio.

## Limitaciones y advertencias

- Adopción práctica nula: cero descargas y cero «likes» en el momento de la consulta, sin issues ni validación independiente; no hay evidencia de terceros sobre su calidad real.
- Afirmaciones no verificables: «Stanford NCM», «System 1 JevLaya Cognitive Routing» y el «bucle de autoaprendizaje continuo» no disponen de paper, código ni réplica pública. No se debe asumir que aportan capacidades medibles.
- Posible regresión respecto al modelo base: el 53 % declarado en MMLU y el 40 % en hechos y lengua rumana son cifras bajas para un modelo de 7,6 B; conviene ejecutar una evaluación propia antes de sustituir a Qwen2.5-7B-Instruct en producción.
- Protocolo de evaluación opaco: 300 preguntas propias, sin especificar número de *shots*, formato de corrección ni reparto exacto; los porcentajes no son comparables con MMLU, GSM8K o HumanEval oficiales.
- Riesgo de alucinación: no se documenta ningún proceso de RLHF/DPO adicional ni filtros de seguridad; en dominios factuales (historia, literatura, legislación rumana) el propio autor reporta el rendimiento más bajo.
- Cobertura lingüística estrecha: solo ro/en; el uso en otros idiomas puede degradar notablemente la calidad frente al modelo base, que es multilingüe.
- Un único formato de pesos: solo Q8_0 GGUF, lo que limita el despliegue en GPU de 8 GB o en servidores de alto rendimiento (vLLM/TGI) sin trabajo previo de recuantización o reconversión.
- Sesgos: no hay ninguna evaluación de sesgo, toxicidad o equidad; al derivar de Qwen2.5-7B-Instruct y de un SFT opaco, los sesgos del corpus de ajuste rumano son desconocidos.
- Licencia: Apache 2.0 permite uso comercial y modificaciones con atribución mínima; al derivar de un modelo Apache 2.0 no hay cláusulas adicionales, pero el autor no ofrece garantías ni soporte.
- Caveat de producción: la model card mezcla afirmaciones de marketing con resultados técnicos; trátese como un experimento personal reproducible, no como un modelo validado para entornos regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bunilastelian/Qwen2.5-7B-Romanian-SFT-GGUF
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe técnico de Qwen2.5 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (runtime GGUF): https://github.com/ollama/ollama

No se han encontrado paper, blog, repositorio de código ni demo asociados específicamente a este fine-tune en la información disponible.
