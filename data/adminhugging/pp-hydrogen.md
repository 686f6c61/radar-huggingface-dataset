# AdminHugging/PP-Hydrogen

## Resumen

PP-Hydrogen (PP-H) es un modelo de lenguaje de tipo base desarrollado por el proyecto PPAI bajo el identificador `AdminHugging/PP-Hydrogen`. Se trata de la primera y más pequeña pieza de una familia planificada de modelos con nombres inspirados en la tabla periódica (PP-He, PP-Li, etc.). El modelo emplea una arquitectura propia denominada `ppai`, con mezcla de expertos (MoE) de 20 expertos enrutados con top-1 más un experto compartido por capa, diseñada específicamente para un presupuesto de 100M de parámetros totales y 12,4M de parámetros activos por token. Está entrenado desde cero, sin partir de pesos preentrenados de terceros.

El modelo resuelve un problema muy acotado: explorar hasta qué punto una arquitectura MoE compacta puede aprender la forma estadística del ruso, el inglés y el código Python con un presupuesto de cómputo mínimo (una sola Tesla T4 durante 10,5 horas y 1.417M de tokens). No es un modelo instructivo ni un asistente: es un modelo base que continúa texto y no responde preguntas. Su relevancia actual es fundamentalmente metodológica y educativa, ya que documenta de forma transparente el proceso de entrenamiento, la curva de pérdida y las limitaciones reales de un modelo de este tamaño.

La ventana de contexto es de solo 1024 tokens, el vocabulario BPE propio tiene 24.576 entradas y la licencia es Apache 2.0. El repositorio ocupa 11,2 GB e incluye pesos en fp32 y bf16, además de un checkpoint completo con estado del optimizador y los logs de entrenamiento. La model card es explícitamente honesta sobre el alcance: el modelo ha aprendido la forma del lenguaje y del código, pero no el significado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPAI propia (transformer con mezcla de expertos, MoE) |
| Parametros totales | 99.979.070 (~99,98M) |
| Parametros activos | 12,4M por token |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo fp32 y bf16 publicados) |
| Idiomas soportados | Ruso (ru), ingles (en); Python como dominio de codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), PyTorch `.pt` (bf16 y checkpoint completo) |
| Capas | 10 |
| Expertos | 20 enrutados (top-1) + 1 compartido por capa |
| d_model | 192 |
| Cabezas de atencion | 6 cabezas de consulta / 2 KV, head_dim 32 |
| FFN por experto | 800 |
| Vocabulario | 24.576 tokens (BPE propio) |
| Requiere `trust_remote_code` | Si (arquitectura `ppai` fuera de transformers) |

## Arquitectura y entrenamiento

La arquitectura `ppai` es un transformer de 10 capas con mezcla de expertos de tipo top-1: cada token activa un único experto enrutado de los 20 disponibles, más un experto compartido presente en todas las capas, lo que resulta en 12,4M de parámetros activos sobre un total de 99,98M. Incorpora varias innovaciones técnicas poco habituales en modelos de este tamaño: embeddings hash de n-gramas en la entrada con ventanas de 2, 3 y 4 tokens, una conexión residual de valor desde la capa cero (value-residual), una compuerta por cabeza en la salida de la atención, normalización QK (qk-norm), embeddings rotatorios (RoPE) y softcap sobre los logits. El tokenizador es un BPE propio de 24.576 entradas entrenado sobre 40M de caracteres de ruso, inglés y Python, con una eficiencia declarada de 4,29 caracteres por token en ruso y en inglés, y 3,33 en Python.

El entrenamiento se realizó desde cero en una única Tesla T4 en fp16, con dos pasadas acumuladas de 500M y 917M de tokens (1.417M en total), 38.450 pasos, una tasa de aprendizaje de 6e-4 con decaimiento coseno y 500 pasos de calentamiento, y un tamaño de lote efectivo de 36.864 tokens por paso (12 × 3 × 1024). La pérdida descendió de 10,1 a 2,34, con un mínimo observado en torno a 2,1. La mezcla de datos fue: 40% ruso, 34% Python, 20% inglés, 6% C#/Rust y 0% matemáticas. No se aplicaron fases de RLHF, DPO ni SFT; el modelo es estrictamente base. El autor documenta que el entrenamiento completo requirió 10,5 horas y se ejecutó a unas 26.000 tokens por segundo.

## Capacidades

- Continuación de texto en ruso con morfología y concordancia plausibles, aunque sin coherencia semántica sostenida.
- Continuación de texto en inglés con sintaxis gramaticalmente correcta y estructura de párrafo reconocible.
- Generación de código Python con estructura superficial verosímil: definiciones de función, docstrings, indentación y referencias a documentación, sin garantía de corrección lógica.
- Modelado de estructura de código en C# y Rust de forma limitada, dado el 6% de la mezcla de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de pensamiento (thinking mode), visión, audio ni otras modalidades.
- No es un modelo instructivo: no responde a preguntas ni sigue instrucciones de forma fiable.
- Capacidad multilingüe limitada a ruso e inglés; el ruso es el idioma con mayor peso en el corpus (40%).

## Casos de uso

- Investigación sobre arquitecturas MoE de bajo presupuesto: el repositorio incluye `modeling_ppai.py`, los logs de entrenamiento (`logs/metrics.csv`) y el checkpoint completo con optimizador, lo que permite reproducir o auditar el proceso de entrenamiento de un MoE de 100M en una sola GPU de consumo.
- Estudio de tokenizadores para ruso: el BPE propio alcanza 4,29 caracteres por token en ruso frente a los ~0,82 de un BPE byte-level sin cirílico, por lo que sirve como referencia para diseñar vocabularios eficientes en lenguas eslavas.
- Pruebas de infraestructura de inferencia con `trust_remote_code`: al requerir código remoto y no ser compatible con llama.cpp, es útil para validar pipelines de `transformers` con arquitecturas personalizadas antes de escalar a modelos mayores.
- Generación de texto de relleno estilizado: para demos, maquetas o pruebas de interfaz donde se necesita texto con apariencia de ruso o inglés sin requisito de veracidad, el modelo produce salida con forma lingüística creíble.
- Docencia sobre límites de escala: ejemplifica de forma medible por qué un modelo de 100M con 1,4B de tokens no alcanza coherencia semántica, y permite comparar su curva de pérdida con la de GPT-2 small.
- Exploración de embeddings hash de n-gramas: la implementación de ventanas de 2, 3 y 4 tokens en la entrada es un caso práctico para investigar representaciones léxicas alternativas en modelos pequeños.
- Prototipado de generación de esqueletos de código Python: útil para producir plantillas con docstrings y estructura de módulo que luego se completan manualmente, nunca para código que vaya a ejecutarse sin revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: pérdida final de 2,34 (mínimo ~2,1) partiendo de 10,1, 38.450 pasos, 1.417M de tokens y un throughput de aproximadamente 26.000 tokens por segundo en una Tesla T4 con fp16.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan unos 400 MB y en bf16 unos 200 MB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento se realizó en una Tesla T4, y una RTX 3060, RTX 4060 o superior es más que suficiente para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050 y modelos superiores.
- Opciones de despliegue: exclusivamente `transformers` con `trust_remote_code=True`. No hay soporte para llama.cpp, Ollama, vLLM ni TGI, ya que la arquitectura `ppai` no está registrada en GGUF y los embeddings hash de n-gramas requieren un operador C++ específico. El autor ofrece un interfaz web basado en `transformers` para ejecución local.
- Latencia y throughput: no se han publicado cifras de inferencia; solo se conoce el throughput de entrenamiento (~26.000 tokens/s en T4 con fp16).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| PP-Hydrogen (PPAI) | 99,98M | 12,4M | 1024 | Apache 2.0 | safetensors + `.pt`, solo transformers | MoE top-1 con 20 expertos, base, sin benchmarks publicados |
| GPT-2 small | 124M | 124M (denso) | 1024 | MIT | safetensors, GGUF, amplio soporte | Referencia citada por el autor; entrenado con ~40B tokens |
| TinyLlama-1.1B | 1,1B | 1,1B (denso) | 2048 | Apache 2.0 | safetensors, GGUF, vLLM, llama.cpp | Mayor escala y contexto; no comparable en presupuesto de cómputo |
| Qwen2.5-0.5B | 494M | 494M (denso) | 32.768 | Apache 2.0 | safetensors, GGUF, amplio soporte | Contexto muy superior y soporte instructivo; requiere más cómputo |

La comparación directa con GPT-2 small es la más pertinente en términos de escala, aunque PP-Hydrogen activa solo 12,4M de parámetros por token y se entrenó con 1,4B de tokens frente a los ~40B de GPT-2 small, lo que explica en buena medida la diferencia de coherencia. Frente a modelos densos de 0,5B a 1,1B, PP-Hydrogen queda muy por detrás en contexto, calidad y ecosistema de despliegue.

## Limitaciones y advertencias

- El propio autor advierte que el modelo ha aprendido la forma del lenguaje y del código, pero no el significado; la salida es semánticamente incoherente aunque morfológicamente plausible.
- No es un modelo instructivo: no responde a preguntas ni sigue instrucciones, por lo que no debe usarse como asistente.
- Riesgo elevado de alucinación estructural: produce docstrings, referencias y firmas de función verosímiles pero falsas (el ejemplo de `quicksort` en la model card es ilustrativo).
- Ventana de contexto muy reducida (1024 tokens), insuficiente para la mayoría de tareas de producción con documentos o conversaciones largas.
- Cobertura lingüística limitada a ruso e inglés; no hay datos sobre otros idiomas y el rendimiento fuera de esos dos es previsiblemente nulo.
- El corpus de entrenamiento contiene 0% de matemáticas, por lo que no debe esperarse ninguna capacidad de cálculo o razonamiento numérico.
- La licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en producción sin un fine-tuning posterior sustancial y una validación exhaustiva.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor en el entorno de inferencia; conviene auditar `modeling_ppai.py` antes de desplegarlo.
- Sin soporte en llama.cpp, Ollama, vLLM ni TGI, lo que limita las opciones de despliegue escalable y de cuantización.
- El repositorio incluye un checkpoint completo con optimizador de 1,2 GB y logs; conviene revisar qué artefactos se descargan para no consumir espacio innecesario.
- No hay benchmarks publicados, por lo que cualquier evaluación de calidad debe realizarse de forma empírica por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdminHugging/PP-Hydrogen
- Repositorio del proyecto PPAI: no disponible
- Paper o informe técnico: no disponible
- Blog o anuncio del autor: no disponible
- Demo o interfaz web: no disponible (el autor menciona una interfaz web basada en transformers, sin enlace público)
- Perfil del autor en Hugging Face: https://huggingface.co/AdminHugging
