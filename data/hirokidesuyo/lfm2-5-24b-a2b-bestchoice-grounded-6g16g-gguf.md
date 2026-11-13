# hirokidesuyo/LFM2.5-24B-A2B-BestChoice-Grounded-6G16G-GGUF

## Resumen

LFM2.5-24B-A2B-BestChoice-Grounded-6G16G-GGUF es una compilación GGUF cuantizada del modelo base LiquidAI/LFM2.5-24B-A2B, publicada por el usuario hirokidesuyo. Se trata de un ajuste fino sobre la variante BestChoice del mismo autor, orientado específicamente a aprender cuándo y cómo invocar una herramienta de búsqueda web, así como a distinguir entre responder directamente y admitir desconocimiento. El modelo está pensado para ejecutarse en equipos modestos: 6 GB de VRAM y 16 GB de RAM.

El modelo parte de una arquitectura Mixture-of-Experts (MoE) con 23.971.587.712 parámetros totales (unos 24B) y una fracción activa por token (el sufijo A2B sugiere aproximadamente 2B parámetros activos, aunque el dato exacto no se detalla en la información disponible). El ajuste se realizó en dos fases: un SFT para el comportamiento de uso de herramientas y un DPO para afinar la frontera de decisión entre buscar y contestar de memoria.

Su relevancia actual radica en que aborda un problema práctico de los asistentes con acceso a herramientas: el exceso de llamadas innecesarias o la fabricación de respuestas cuando no se dispone de información. El autor reporta mejoras en la tasa de activación de búsqueda y en la no fabricación bajo condiciones con herramientas, a costa de un ligero descenso en benchmarks de conocimiento general respecto a su predecesor BestChoice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, según modelo base LFM2.5-24B-A2B (detalle exacto no disponible) |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | no disponible (el sufijo A2B sugiere ~2B activos, sin confirmar en la informacion) |
| Longitud de contexto | 32.768 tokens (configuracion recomendada de llama-server con `-c 32768`) |
| Tipos de cuantizacion | GGUF con layout UD propio basado en IQ3_XXS; cache K/V en q8_0 en la configuracion recomendada |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | other (sujeta a los terminos del modelo base y de los datos docente) |
| Formato de pesos | GGUF (llama.cpp); archivo de 9.443.769.984 bytes (~9,4 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base LFM2.5-24B-A2B de LiquidAI, descrita como Mixture-of-Experts con unos 24B parámetros totales. El ajuste se aplicó sobre la variante BestChoice, reutilizando sus pesos y su layout de cuantización UD (IQ3_XXS). El entrenamiento consta de dos etapas. La primera es un SFT con LoRA (r=16, alpha=32; las matrices expert FFN w1/w2/w3 con r=4, alpha=8) sobre 46 módulos, learning rate 1e-4, schedule cosine, 1 época y empaquetado de 4096 tokens; se partió del modelo base reentrenando sobre la unión de los datos de destilación de BestChoice y los nuevos datos de comportamiento, con 20.137 filas finales, 342 pasos y train_loss de 0,6234.

Los datos añadidos en el SFT incluyen 2.350 ejemplos en japonés generados por GLM-4.7-Flash (700 de búsqueda necesaria, 550 de trampa de propósito, 500 de respuesta directa, 350 de objetivo desconocido y 250 de cantidades) más 3.000 ejemplos de uso de herramientas públicas (2.500 de ToolACE y 500 de Glaive de function calling, convertidos). La segunda etapa es un DPO con TRL DPOTrainer y carga 4-bit de Unsloth, con nuevo LoRA r=16/alpha=32 sobre los mismos módulos, beta 0,3, learning rate 1e-5, cosine con warmup del 5%, 1 época, max_len 1536 y batch efectivo 16; se ejecutó en 87 pasos (1.984 segundos en una Google Colab L4) con train_loss de 0,3746 y margins finales de 1,64. Los pares DPO (1.377) se dividen en 332 de tipo fire (elegido: llamar a la herramienta; rechazado: respuesta fabricada del modelo SFT), 905 de tipo direct (elegido: respuesta correcta verificada; rechazado: llamada innecesaria del modelo previo al DPO) y 140 de tipo admit (elegido: declarar desconocimiento; rechazado: fabricación). Los rechazados se recogieron en su mayoría de las propias salidas del modelo, y el autor declara que los problemas, nombres propios, cifras y escenarios de los benchmarks de evaluación no están incluidos en los datos de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés y japonés, con razonamiento de varios pasos y modo de pensamiento largo (el autor recomienda aumentar el máximo de tokens generados).
- Uso de herramientas (tool calling / function calling), específicamente una función de búsqueda `web_search` con argumento `query`, aprendida de forma explícita en el SFT y ajustada en el DPO.
- Decisión de cuándo buscar y cuándo responder de memoria: tasa de activación de búsqueda del 96,2% en condiciones con herramientas.
- Declaración de desconocimiento ante objetivos desconocidos: tasa de no fabricación del 94,4% en condiciones con herramientas.
- Resolución de trampas de propósito (preguntas donde el medio propuesto no lleva al objetivo): 86,0% de acierto sin herramientas.
- Razonamiento aritmético y de cantidades: 88,9% de acierto sin herramientas.
- Generación de código: 9/11 en el benchmark propio de 54 preguntas.
- Razonamiento en inglés: 11/11 en el benchmark propio.
- Instrucciones y razonamiento en japonés: 8/10 y 11/11 respectivamente en el benchmark propio.
- No se reportan capacidades de visión ni de audio.

## Casos de uso

- Asistente con búsqueda web en producción: el modelo está entrenado para invocar `web_search` ante nombres propios desconocidos o información reciente, con una tasa de activación del 96,2%, lo que reduce llamadas innecesarias a la API de búsqueda y el coste asociado.
- Atención al cliente con base de conocimiento: puede responder directamente a preguntas cubiertas por el contexto y derivar a búsqueda o declarar desconocimiento cuando el tema no está cubierto, con una tasa de no fabricación del 94,4% en condiciones con herramientas.
- Despliegue en portátiles o equipos de gama media: el archivo GGUF de 9,4 GB con layout IQ3_XXS está dimensionado para 6 GB de VRAM y 16 GB de RAM, lo que permite ejecutarlo en una RTX 3060 Laptop con llama.cpp y descarga de expertos a CPU.
- Agentes de investigación multi-paso: la combinación de razonamiento largo, tool calling y contexto de 32.768 tokens permite encadenar consultas de búsqueda y síntesis de resultados en un mismo hilo.
- Filtro de preguntas en pipelines RAG: puede clasificar si una consulta requiere recuperación externa o puede resolverse con conocimiento paramétrico, actuando como router previo al sistema de recuperación.
- Evaluación de robustez ante preguntas trampa: útil como componente para detectar consultas donde el usuario propone un método inadecuado para su objetivo, con un 86,0% de acierto sin herramientas en el benchmark del autor.
- Asistencia técnica en japonés e inglés: cubre ambos idiomas con especial énfasis en inglés (aproximadamente el 80% de los datos de entrenamiento), adecuado para equipos bilingües.

## Benchmarks y rendimiento

Resultados del benchmark de comportamiento propio (42 preguntas, temperature 0,8, máximo 1.024 tokens, RTX 3060 Laptop 6 GB):

| Metrica | Este modelo | Grounded (solo SFT) | BestChoice |
|---|---|---|---|
| Tasa de activacion de busqueda (tools) | 96,2% | 84,6% | 77% |
| No fabricacion ante objetivo desconocido (tools) | 94,4% | 89% | 78% |
| No fabricacion ante objetivo desconocido (notools) | 50,0% | 56% | 44% |
| No fabricacion en preguntas de busqueda (notools) | 57,7% | 54% | 27% |
| Acierto en hechos conocidos (notools) | 93,8% | 88% | 94% |
| Tasa de respuesta directa (tools, referencia) | 62,5% | 75% | 69% |
| Acierto en trampa de proposito (notools) | 86,0% | 80% | 54% |
| Acierto en trampa de proposito (tools, referencia) | 48% | 58% | 63% |
| Acierto en cantidades (notools) | 88,9% | 94% | 100% |
| Acierto en cantidades (tools, referencia) | 78% | 67% | 100% |

Resultados del benchmark fijo de 54 preguntas (completitud y correccion, temperature 0, checker basado en reglas):

| Modelo | Total | Codigo | Razonamiento ingles | Instrucciones japones | Razonamiento japones | Conocimiento |
|---|---|---|---|---|---|---|
| Este modelo | 48/54 | 9/11 | 11/11 | 8/10 | 11/11 | 9/11 |
| Grounded (solo SFT) | 49/54 | 11/11 | — | — | — | — |
| BestChoice | 53/54 | 11/11 | 11/11 | 9/10 | 11/11 | 11/11 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 6 GB, según el diseño explícito del autor (sufijo 6G16G).
- RAM estimada: 16 GB; con menos memoria el autor advierte que la residencia de los expertos se degrada y la velocidad cae bruscamente.
- GPU recomendadas: RTX 3060 Laptop 6 GB (equipo de evaluación del autor); cualquier GPU con al menos 6 GB de VRAM para el layout previsto.
- Cabe en GPU de consumo: sí, con descarga parcial de expertos a CPU mediante `-ncmoe`.
- Opciones de despliegue: llama.cpp (probado con b12208, `llama-server`); compatible con endpoints según los tags; no se mencionan vLLM, TGI ni Ollama.
- Configuración recomendada: `-ngl 99 -ncmoe 99 --moe-cache-mib 3072 --moe-cache-cpu-share 0.5 -lm dio -c 32768 -ctk q8_0 -ctv q8_0 --flash-attn on -t 8`.
- Latencia y throughput: no disponibles de forma numérica; el DPO se entrenó en una Google Colab L4 en 1.984 segundos para 87 pasos, dato de entrenamiento y no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Grounded) | ~24B totales (MoE) | 32.768 tokens | Uso de busqueda + no fabricacion | other | GGUF en HF |
| LFM2.5-24B-A2B-BestChoice-6G16G-GGUF | ~24B totales (MoE) | 32.768 tokens (misma config) | Calidad general y conocimiento | other | GGUF en HF |
| LFM2.5-24B-A2B (base, LiquidAI) | 23.971.587.712 | no disponible en la informacion | Modelo base generalista | other | Pesos originales en HF |

Frente a BestChoice, este modelo mejora la activación de búsqueda (96,2% frente a 77%) y la no fabricación con herramientas (94,4% frente a 78%), pero baja en el benchmark de 54 preguntas (48/54 frente a 53/54) y en acierto de cantidades con herramientas (78% frente a 100%). Frente al modelo base LiquidAI, no hay datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- La evaluación se basa en benchmarks propios de pequeño tamaño (42 y 54 preguntas), no en estándares como MMLU; los resultados son comparaciones relativas, no absolutas.
- Sin herramientas disponibles, la tasa de no fabricación ante objetivos desconocidos cae al 50,0%, por debajo del 56% del SFT previo: en entornos sin búsqueda tiende a rellenar con invenciones.
- Si el entorno no ejecuta la llamada a `web_search`, el modelo puede terminar la respuesta con la llamada a la herramienta y dejar al usuario sin contestación.
- Puede cometer errores en preguntas factuales o de conocimiento; el autor recomienda verificar en usos críticos.
- El entrenamiento está orientado a la función `web_search` con argumento `query`; otros nombres o esquemas de herramientas pueden no funcionar igual.
- Los datos de entrenamiento son mayoritariamente en inglés (el japonés ronda el 20-25%), por lo que el rendimiento en japonés es secundario.
- No se ha aplicado abliteration (eliminación de rechazos); mantiene los comportamientos de seguridad del modelo base.
- Licencia "other": sujeta a los términos del modelo base LiquidAI y de los datos docentes (GLM-4.7-Flash, ToolACE, Glaive); es necesario revisar las condiciones antes de uso comercial.
- El modelo es un ajuste de comportamiento, no una mejora de conocimiento: no debe esperarse mayor precisión factual que en BestChoice.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hirokidesuyo/LFM2.5-24B-A2B-BestChoice-Grounded-6G16G-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo predecesor BestChoice: https://huggingface.co/hirokidesuyo/LFM2.5-24B-A2B-BestChoice-6G16G-GGUF
