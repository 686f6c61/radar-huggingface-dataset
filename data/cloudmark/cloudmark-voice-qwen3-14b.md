# cloudmark/cloudmark-voice-qwen3-14b

## Resumen

cloudmark-voice-qwen3-14b es un adaptador LoRA (PEFT) construido sobre el modelo base Qwen/Qwen3-14B-Base, desarrollado por el usuario cloudmark. Su funcion es reescribir prosa neutra en el estilo de un blog personal concreto (cloudmark.github.io), actuando como un modelo de transferencia de estilo y parafraseo. No es un modelo completo, sino un adaptador de aproximadamente 2,1 GB que debe cargarse junto con el modelo base de 14 mil millones de parametros.

El adaptador continua el entrenamiento de YixuanEvenXu/Qwen3-14B-Base-HIP-adapter, asociado al trabajo de Xu et al. "Base Models Look Human To AI Detectors" (2026). El interes tecnico reside en su enfoque: demuestra como un modelo base (no instruido) puede adaptarse con LoRA de rango 128 para imitar el estilo de un autor concreto a partir de un corpus muy pequeno (22 entradas de blog, 26.282 palabras).

Es relevante ahora por su relacion con la deteccion de texto generado por IA: el autor documenta explicitamente que una pasada del adaptador fue puntuada como 100% IA por GPTZero, mientras que cinco pasadas alcanzaron un 81% de "humano" en un texto de 918 palabras, a costa de introducir errores factuales. Es, por tanto, una herramienta de investigacion sobre estilo y deteccion, no un modelo de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-14B-Base |
| Parametros totales | no disponible (adaptador LoRA; modelo base de 14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-14B-Base) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 128 sobre el modelo base Qwen/Qwen3-14B-Base, un transformer decoder-only de 14 mil millones de parametros. El adaptador se entreno en una sola pasada con tasa de aprendizaje 5e-5, schedule coseno, 3% de warm-up, batch efectivo de 4 y precision de 32 bits sobre una GPU de Apple. La relacion con el modelo base es de tipo adapter, por lo que requiere cargar Qwen3-14B-Base para su uso.

Los datos de entrenamiento consisten en 328 pares de parafrasis para entrenamiento y 50 reservados para evaluacion, construidos a partir de 22 entradas publicadas en cloudmark.github.io entre 2016 y 2021 (26.282 palabras de prosa). Cada par empareja una parafrasis neutra generada por un modelo de chat (entrada) con el parrafo original del autor (objetivo). La perdida sobre el conjunto reservado paso de 1,006 antes del entrenamiento a 0,808 tras la primera pasada (0,834 tras la segunda, 0,991 tras la tercera); solo se publica la primera pasada.

## Capacidades

- Generacion de texto y parafraseo con transferencia de estilo hacia la voz de un autor concreto.
- Reescritura de prosa neutra manteniendo (parcialmente) el contenido semantico.
- Estilo orientado a primera persona del plural: en parrafos reservados la palabra "we" aparece 23,9 veces por 1.000 palabras (frente a 5,1 en el texto fuente y 29,5 en el autor original).
- Capacidades heredadas del modelo base Qwen3-14B-Base (generacion de texto en ingles, principalmente), aunque no se documentan explicitamente en la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en transferencia de estilo: estudiar como un LoRA de rango 128 y un corpus de 26.282 palabras bastan para aproximar la voz de un autor, sirviendo como caso de referencia en papers sobre estilometria.
- Estudio de detectores de texto IA: reproducir el experimento del autor comparando las puntuaciones de GPTZero sobre una pasada (100% IA) frente a cinco pasadas (81% humano), para analizar la robustez de los detectores.
- Analisis de fidelidad factual en parafraseo: usar los pares reservados para medir cuantos hechos, cifras y afirmaciones se alteran al reescribir, dado que el autor advierte explicitamente de que el adaptador cambia hechos.
- Docencia sobre limitaciones de LoRA: ilustrar con un caso real el compromiso entre similitud estilistica y preservacion de contenido en adaptadores de bajo rango.
- Experimentacion con PEFT: servir de plantilla para entrenar adaptadores de estilo sobre otros modelos base con recursos modestos (una GPU de Apple, una sola pasada).
- Auditoria de integridad academica: emplear el adaptador como caso controlado para probar sistemas de procedencia y deteccion de autoria en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos son la perdida sobre el conjunto reservado y las metricas de estilo y deteccion:

| Metrica | Valor |
|---|---|
| Perdida reservada antes del entrenamiento | 1,006 |
| Perdida reservada tras pasada 1 (publicada) | 0,808 |
| Perdida reservada tras pasada 2 | 0,834 |
| Perdida reservada tras pasada 3 | 0,991 |
| Frecuencia de "we" (por 1.000 palabras), salida | 23,9 |
| Frecuencia de "we" en texto fuente | 5,1 |
| Frecuencia de "we" en el autor original | 29,5 |
| Deteccion GPTZero, una pasada | 100% IA |
| Deteccion GPTZero, cinco pasadas | 81% humano (texto de 918 palabras, con errores) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; al requerir el modelo base Qwen3-14B-Base, la inferencia en precision completa exige aproximadamente 28 GB o mas, y en cuantizaciones de 8 o 4 bits del base se reduce sustancialmente (el adaptador anade solo 2,1 GB de pesos).
- GPU recomendadas: para el modelo base en BF16, A100 40/80 GB o H100; en consumer, RTX 4090 (24 GB) requiere cuantizacion del base.
- Cabe en GPU consumer: si, cargando el modelo base cuantizado (por ejemplo 4 bits) junto con el adaptador, aunque no se documentan recetas oficiales.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la libreria `peft` y transformers; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada.
- Latencia y throughput: no disponibles. El entrenamiento se realizo en una GPU de Apple en 32 bits, lo que sugiere requisitos modestos para ajuste, no para servicio.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| cloudmark-voice-qwen3-14b | LoRA sobre Qwen3-14B-Base | 14B (base) + adaptador | no disponible | apache-2.0 | Transferencia de estilo a un autor concreto |
| YixuanEvenXu/Qwen3-14B-Base-HIP-adapter | LoRA sobre Qwen3-14B-Base | 14B (base) + adaptador | no disponible | no disponible | Adaptador predecesor del que parte este entrenamiento |
| Qwen/Qwen3-14B-Base | Transformer decoder-only | 14B | no disponible | no disponible en la informacion | Modelo base sin adaptar; proposito general |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el adaptador cambia hechos: es obligatorio verificar cada numero y afirmacion contra el texto fuente.
- Una sola pasada fue clasificada como 100% IA por GPTZero; cinco pasadas alcanzaron 81% humano pero introdujeron errores, por lo que no es fiable como mecanismo de evasion de deteccion.
- Uso previsto restringido a investigacion y estudio de transferencia de estilo y deteccion de texto IA. Se pide explicitamente no emplearlo para evadir sistemas de integridad academica, autoria o procedencia, ni para presentar texto maquina como propio o del autor del blog.
- Corpus de entrenamiento muy pequeno (22 entradas, 26.282 palabras) y de un unico autor, lo que limita la generalizacion.
- Idiomas soportados no documentados; el material de entrenamiento esta en ingles.
- Riesgo de alucinacion y de deriva estilistica: el estilo en primera persona del plural ("we") puede no encajar en contextos donde el contenido original no lo justifica.
- Licencia apache-2.0 para el adaptador, pero conviene verificar la licencia del modelo base Qwen3-14B-Base antes de uso comercial.
- Sin descargas ni likes en el momento de la ficha; no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cloudmark/cloudmark-voice-qwen3-14b
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Adaptador predecesor: https://huggingface.co/YixuanEvenXu/Qwen3-14B-Base-HIP-adapter
- Blog del autor: https://cloudmark.github.io
- Referencia citada: Xu et al., "Base Models Look Human To AI Detectors" (2026) — sin enlace disponible en la informacion proporcionada.
