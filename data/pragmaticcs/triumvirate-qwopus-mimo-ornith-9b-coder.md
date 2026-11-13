# pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder

## Resumen

Triumvirate-Qwopus-MiMo-Ornith-9B-Coder es un modelo de lenguaje causal denso de 9B parámetros publicado por el usuario pragmaticcs en Hugging Face. No se trata de un entrenamiento desde cero, sino de un *merge* de pesos construido sobre Qwen/Qwen3.5-9B como ancla estructural, al que se fusionan los vectores de tarea de tres fine-tunes especializados: Qwopus3.5-9B-Coder (precisión sintáctica y algorítmica), MiMo-V2.6-Distill-Qwen-9B (descomposición de problemas tipo SWE-bench y tool calling) y Ornith-1.5-9B (disciplina de terminación de bucles y recuperación de errores en flujos agénticos).

El objetivo declarado es cubrir el hueco de los modelos de código por debajo de 10B que fallan en flujos agénticos reales: o generan código limpio pero entran en bucles infinitos cuando un comando de shell falla, o gestionan llamadas a herramientas de forma aceptable pero alucinan sintaxis de APIs poco comunes. El merge intenta combinar ambas virtudes en un único checkpoint de texto puro.

La arquitectura subyacente es la de Qwen 3.5 9B: transformer denso con atención híbrida Gated DeltaNet en proporción 3:1 (tres capas de atención lineal por cada capa de atención completa) y una ventana de contexto nativa de 256k tokens. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors en precisión bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (`qwen3_5_text`) con atención híbrida Gated DeltaNet (3 lineales : 1 completa) |
| Parametros totales | 8.953.803.264 (8,8B en el backbone de texto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos nativos en bfloat16; el repo no documenta GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16) |

Especificaciones adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Dimension oculta (d_model) | 4096 |
| Dimension intermedia (d_mlp) | 12288 (SwiGLU) |
| Capas del decodificador | 32 |
| Capas de atencion completa | 3, 7, 11, 15, 19, 23, 27, 31 |
| Cabezas de atencion lineal | 16 cabezas de clave / 32 de valor (d_k = d_v = 128) |
| Cabezas de atencion completa | 16 query / 4 key-value (GQA, d_h = 256) |
| RoPE | 1D parcial (theta = 10^7, factor = 0.25) |
| Precision nativa | bfloat16 |
| Tamano del repo | 17,9 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen 3.5 9B: un transformer causal denso de 32 capas con un esquema de atención híbrido en el que solo 8 capas (3, 7, 11, 15, 19, 23, 27 y 31) emplean atención completa con GQA (16 cabezas de consulta y 4 de clave-valor), mientras que el resto usa atención lineal Gated DeltaNet con 16 cabezas de clave y 32 de valor. Esta combinación reduce el coste computacional y de memoria del contexto largo, lo que hace viable la ventana de 256k tokens. El MLP usa SwiGLU con dimensión intermedia de 12288 y la posición se codifica con RoPE parcial 1D (theta = 10^7, factor 0.25).

No hay entrenamiento desde cero ni un dataset propio documentado: el proceso es un *merge* de pesos. Se calculan vectores de tarea τ_k = D_k − W_0 para cada donante respecto al ancla Qwen 3.5 9B, y se combinan mediante TIES-DELLA con recorte de saliencia, elección de signo por consenso, estabilización de norma para las capas Gated DeltaNet y una modulación sinusoidal continua por profundidad. La asignación de donantes es estratificada por capas: Qwopus domina las capas bajas (x ≤ 0,35) para sintaxis, tipado y algoritmia; Ornith domina las capas medias (0,35 < x < 0,70) para terminación de bucles y recuperación de errores; y MiMo domina las capas altas (x ≥ 0,70) para descomposición de problemas y lógica de herramientas multi-turno. La model card menciona que MiMo aporta 77,4B tokens de SFT en su entrenamiento original, pero no se detalla la composición del dataset del merge ni si hubo RLHF o DPO adicional en este checkpoint.

## Capacidades

- Generación de texto y código en inglés y chino, con orientación explícita a código de producción.
- Razonamiento multi-paso y descomposición de problemas de ingeniería de software, heredado del linaje MiMo.
- Tool calling y function calling para flujos agénticos, incluyendo lógica multi-turno de herramientas.
- Disciplina de terminación de bucles y recuperación ante errores de comandos o llamadas fallidas, orientada a agentes autónomos.
- Precisión sintáctica y algorítmica en lenguajes de programación, con énfasis en tipado y estructuras de datos.
- Contexto largo nativo de 256k tokens, adecuado para repositorios completos o trazas de agente extensas.
- Plantilla de chat específica para uso agéntico, documentada por el autor.
- Modelo de texto puro: no se declaran capacidades de visión, audio ni modo *thinking* explícito.
- Multilingüismo limitado a inglés y chino según los metadatos del repositorio.

## Casos de uso

- Agentes de resolución de incidencias en repositorios: el modelo puede recibir un issue, explorar el árbol de ficheros y ejecutar comandos de shell dentro de un bucle de herramientas, apoyándose en la disciplina de terminación y recuperación de errores para no quedarse bloqueado cuando un test falla.
- Asistentes de codificación en IDE: con 256k tokens de contexto puede mantener en memoria varios ficheros del proyecto y responder con ediciones coherentes con el tipado existente, gracias al sesgo de las capas bajas hacia sintaxis y algoritmia.
- Automatización de pipelines de CI/CD: integrado como paso de generación o corrección de parches, el soporte de tool calling permite invocar linters, ejecutar tests y leer sus salidas para iterar sobre el código generado.
- Migración y refactorización de bases de código: la ventana de contexto larga permite procesar módulos enteros o diffs extensos en una sola pasada, reduciendo la pérdida de coherencia entre ficheros.
- Atención al cliente técnica de primer nivel: puede gestionar conversaciones multi-turno con contexto largo y consultar herramientas internas (estado de tickets, documentación) mediante function calling, en inglés o chino.
- Generación de tests y datos de evaluación: el modelo puede producir casos de prueba y escenarios de error a partir de especificaciones, útil para aumentar la cobertura en proyectos con poca instrumentación.
- Orquestación de agentes en local: al ser un 9B denso en bfloat16, es desplegable en una GPU de consumo de gama alta, lo que permite prototipar flujos agénticos sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe cualitativamente las especializaciones de cada donante (por ejemplo, SWE-bench Pro para MiMo o destilación de Claude 3.5 Opus para Qwopus), pero no incluye tablas con puntuaciones del modelo fusionado ni comparaciones numéricas verificables.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 17,9 GB solo para los pesos (coincide con el tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 20 y 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos, no documentada oficialmente por el autor.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos, no documentada oficialmente por el autor.
- GPU profesionales: A100 (40/80 GB), H100 y L40S sin problema; permiten contexto largo completo y mayor throughput.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) debería alojar los pesos en bfloat16 con margen ajustado; para contexto cercano a 256k sería necesario cuantizar o usar offloading. Una RTX 4080 (16 GB) requiere cuantización de 8 bits o inferior.
- Opciones de despliegue: transformers (librería declarada), servidores compatibles con la API de endpoints de Hugging Face (tag `endpoints_compatible`); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información proporcionada, y la disponibilidad de GGUF no está documentada.
- Latencia y throughput: no disponibles. La atención lineal en 24 de las 32 capas debería reducir el coste del contexto largo frente a un transformer de atención completa equivalente, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Triumvirate-Qwopus-MiMo-Ornith-9B-Coder | 8,95B denso | 256k | Apache 2.0 | Merge de código y agentes sobre Qwen 3.5 9B | Hugging Face, safetensors |
| Qwen/Qwen3.5-9B | 9B denso | 256k (según la ficha del merge) | No disponible en la informacion proporcionada | Modelo base generalista | Hugging Face |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9B denso | No disponible | No disponible en la informacion proporcionada | Destilado orientado a SWE-bench y tool calling | Hugging Face |
| Jackrong/Qwopus3.5-9B-Coder | 9B denso | No disponible | No disponible en la informacion proporcionada | Código, destilación de Claude 3.5 Opus | Hugging Face |
| ornith-ai/Ornith-1.5-9B | 9B denso | No disponible | No disponible en la informacion proporcionada | RL agéntico, terminación de bucles | Hugging Face |

Los tres donantes y el ancla comparten la misma familia arquitectónica, por lo que la comparación relevante es de especialización, no de tamaño. No hay datos de rendimiento del merge frente a sus componentes, así que no es posible afirmar cuantitativamente qué gana o pierde respecto a cada uno.

## Limitaciones y advertencias

- Modelo de texto puro: no procesa imágenes, audio ni vídeo.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Al ser un merge de pesos, puede heredar y amplificar sesgos de los cuatro checkpoints de origen; no se documenta ninguna evaluación de sesgos.
- Riesgo de alucinación en APIs poco comunes y en sintaxis de librerías menores, precisamente el problema que el merge dice mitigar; no hay benchmarks que lo confirmen.
- No hay resultados publicados de MMLU, HumanEval, GSM8K ni SWE-bench para este checkpoint, por lo que las afirmaciones de la model card son cualitativas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos donantes por si imponen condiciones adicionales sobre los pesos derivados.
- El autor promociona modelos nuevos a través de Patreon; parte del ecosistema alrededor del checkpoint puede tener acceso anticipado o características no incluidas en esta versión pública.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que puede complicar el despliegue en hardware de gama media sin trabajo adicional.
- El contexto de 256k no implica calidad uniforme en toda la ventana; no hay evaluaciones de *needle in a haystack* publicadas para este merge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder
- Modelo base ancla: https://huggingface.co/Qwen/Qwen3.5-9B
- Donante Qwopus: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Donante MiMo: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Donante Ornith: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Paper de referencia del merge (arXiv 2406.11617): https://arxiv.org/abs/2406.11617
- Repositorio de transformers: https://github.com/huggingface/transformers
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Patreon del autor: https://patreon.com/pragmaticcs
- Modelo posterior del autor: https://huggingface.co/pragmaticcs/MiMo-HERO-UIUX-Designer-9B
