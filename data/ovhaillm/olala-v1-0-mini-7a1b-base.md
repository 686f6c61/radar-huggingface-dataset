# OVHaiLLM/Olala-v1.0-mini-7A1B-base

## Resumen

Olala-v1.0-mini-7A1B-base es el modelo base preentrenado de la familia Olala-v1.0-mini, desarrollado por OVHai LLM (grupo OVHcloud) en Francia. Se trata de un modelo de lenguaje de arquitectura híbrida Mamba-3 / atención con mezcla de expertos (MoE), disenado para generación de texto y como punto de partida para ajuste fino. No está alineado ni ajustado por instrucciones, por lo que no debe usarse como asistente directamente.

El modelo cuenta con 6.773.124.144 parámetros totales según los pesos en safetensors, con aproximadamente 1B de parámetros activos por token (denominación 7A1B). Ha sido entrenado sobre 12,8 billones de tokens procedentes de conjuntos de datos públicos y datos sintéticos propios, cubriendo inglés y otros 36 idiomas (38 en la fase de annealing). Destaca especialmente en matemáticas, con una puntuación de 72,2 en MATH (4-shot), y se posiciona como el mejor de su clase entre modelos MoE con alrededor de 1B de parámetros activos.

Su relevancia actual radica en tres factores: es un modelo europeo con pesos abiertos bajo licencia Apache 2.0, ha sido entrenado en supercomputadores europeos (JUPITER, Jean Zay y MeluXina) y ofrece un rendimiento competitivo frente a modelos de mayor tamano como Qwen3.5-35B-A3B o Luciole-23B. La arquitectura híbrida Mamba-3/atención con MoE busca un equilibrio entre eficiencia computacional y calidad, aunque la información pública disponible sobre detalles de contexto y cuantización es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-3 / atención con mezcla de expertos (MoE) |
| Parametros totales | 6.773.124.144 |
| Parametros activos | Aproximadamente 1B (denominación 7A1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 37 idiomas: en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina capas Mamba-3 con mecanismos de atención y una estructura de mezcla de expertos (MoE). Esta combinación busca aprovechar la eficiencia de los modelos de espacio de estados (SSM) para secuencias largas junto con la capacidad expresiva de la atención tradicional, reduciendo el coste computacional mediante la activación selectiva de expertos. La denominación 7A1B indica aproximadamente 7.000 millones de parámetros totales con alrededor de 1.000 millones activos por token.

El entrenamiento se realizó en dos fases: un preentrenamiento principal con 10,5 billones de tokens y una fase de annealing con 2,38 billones de tokens adicionales, sumando un total de 12,8 billones. Los datos provienen de conjuntos públicos como Nemotron-CC-v2, FineWeb-2, FinePDFs, Fineweb-Edu-Chinese, Cultura RU, Nemotron-Pretraining-Code, MegaMath, FineMath, OpenMathInstruct, NuminaMath, Stack-Edu, OpenCoder, Wikipedia y OLMo-mix-1124, además de tres conjuntos propios de OVHai LLM: Math-Enrich-Multilingual, Wikipedia-ActiveReading y ProofWiki-ActiveReading. El entrenamiento se llevó a cabo en 1.024 GPUs NVIDIA GH200 en JUPITER (Alemania), GPUs H100 en Jean Zay (Francia) y en MeluXina (Luxemburgo), con unas emisiones estimadas de 40.000 kg de CO2 equivalente y un consumo energético de aproximadamente 1,16 GWh.

## Capacidades

- Generación de texto autoregresiva en 37 idiomas, incluyendo inglés, chino, francés, alemán, español, ruso, árabe, japonés y coreano, entre otros.
- Razonamiento matemático destacado: 72,2 en MATH (4-shot), con entrenamiento específico en datasets como MegaMath, FineMath, NuminaMath y OpenMathInstruct.
- Capacidad de generación de código, con datos de entrenamiento de Nemotron-Pretraining-Code, OpenCoder y Stack-Edu.
- Modelo base sin ajuste por instrucciones: no soporta tool calling ni function calling de forma nativa.
- No dispone de modo de razonamiento explícito (thinking mode) ni capacidades de visión o audio.
- Capacidades multilingües amplias, con cobertura de 37 idiomas en preentrenamiento y 38 en annealing.
- Al ser un modelo base, no incluye alineación, rechazo de peticiones ni filtros de seguridad.

## Casos de uso

- Investigación en arquitecturas híbridas Mamba-3/MoE: el modelo sirve como banco de pruebas para estudiar el comportamiento de modelos con estado recurrente y mezcla de expertos en tareas de lenguaje, comparando su eficiencia frente a transformers puros.
- Ajuste fino para asistentes especializados: partiendo del modelo base, un equipo puede aplicar SFT y DPO para crear un asistente de dominio concreto (legal, médico, técnico) con su propia capa de seguridad y alineación.
- Generación de código en pipelines internos: gracias a su entrenamiento con datos de código, puede ajustarse para autocompletado o generación de fragmentos en entornos de desarrollo, aunque requiere validación humana y no soporta tool calling nativo.
- Razonamiento matemático y resolución de problemas: su puntuación de 72,2 en MATH lo hace adecuado como base para tutores automáticos de matemáticas o generadores de problemas, tras el correspondiente ajuste por instrucciones.
- Procesamiento multilingüe en 37 idiomas: útil para tareas de traducción, resumen o clasificación en entornos europeos con diversidad lingüística, especialmente para idiomas menos representados como estonio, letón, georgiano o islandés.
- Experimentación con eficiencia computacional: al tener aproximadamente 1B de parámetros activos, es adecuado para estudiar el equilibrio entre coste de inferencia y calidad en despliegues con recursos limitados.
- Generación de datos sintéticos: el modelo base puede emplearse para generar corpus sintéticos en varios idiomas que luego se filtren y utilicen en el entrenamiento de modelos más pequeños.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| MATH (4-shot) | 72,2 | Segundo mejor de 12 modelos base comparados; por delante de todos los Qwen3.5, incluido Qwen3.5-35B-A3B |

No se han publicado en la información disponible resultados detallados de otros benchmarks como MMLU, HumanEval o GSM8K. La model card indica que el modelo tiene la mejor media entre modelos MoE con aproximadamente 1B de parámetros activos, por delante de LFM2.5-8B-A1B (entrenado con tres veces más tokens) y de Luciole-23B (con tres veces más parámetros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 6.773 millones de parámetros totales, en precisión completa (FP32) requeriría aproximadamente 27 GB; en BF16, unos 13,5 GB; en cuantización de 8 bits, alrededor de 7 GB; y en 4 bits, unos 3,5 GB. Estas cifras son estimaciones generales basadas en el número de parámetros, no datos oficiales del modelo.
- GPU recomendadas: no disponible información oficial. Por tamano, cabría en GPUs de consumo como RTX 4090 (24 GB) en BF16 o cuantizado, y en GPUs profesionales como A100 (40/80 GB), H100 o GH200 para despliegues sin cuantizar.
- Cabe en GPU de consumo: probablemente sí en RTX 4090, RTX 3090 (24 GB) o superiores, en BF16 o cuantizado, aunque no hay confirmación oficial.
- Opciones de despliegue: al usar transformers con custom_code, requiere cargar el código personalizado del repositorio. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | MATH (4-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B-base | 6,77B | ~1B | no disponible | 72,2 | Apache 2.0 | Hugging Face, AI Endpoints |
| LFM2.5-8B-A1B | ~8B | ~1B | no disponible | no disponible | no disponible | no disponible |
| Luciole-23B | ~23B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-35B-A3B | ~35B | ~3B | no disponible | inferior a 72,2 según la model card | no disponible | no disponible |

La model card afirma que Olala-v1.0-mini-7A1B-base supera a LFM2.5-8B-A1B en media de benchmarks a pesar de que este último fue entrenado con tres veces más tokens, y a Luciole-23B pese a tener tres veces menos parámetros. Frente a Qwen3.5-35B-A3B, el modelo de OVHai LLM obtiene mejor puntuación en MATH. No se dispone de datos desglosados por benchmark para el resto de modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha recibido ajuste por instrucciones ni entrenamiento de seguridad, por lo que puede generar contenido tóxico, odioso, danino, sesgado o falso. No debe exponerse a usuarios finales ni usarse como asistente sin un ajuste y filtrado previos.
- Riesgo elevado de alucinación: al ser un modelo base, continúa texto sin verificar hechos ni rechazar peticiones, lo que aumenta la probabilidad de generar información incorrecta.
- Sesgos conocidos: los datos de entrenamiento provienen de corpus web y sintéticos que pueden contener sesgos de género, raza, religión o nacionalidad; no se documentan mitigaciones específicas.
- Limitaciones de contexto: no se ha publicado la longitud máxima de contexto, lo que dificulta planificar despliegues con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor advierte explícitamente contra el uso como asistente sin alineación previa; el usuario asume la responsabilidad del ajuste y de los filtros de seguridad.
- Idiomas: aunque cubre 37 idiomas, el rendimiento puede variar significativamente entre ellos; no se han publicado evaluaciones por idioma.
- Producción: no se confirma soporte para servidores de inferencia optimizados (vLLM, TGI, llama.cpp), lo que puede limitar el throughput en entornos de producción.
- Huella ambiental: el entrenamiento supuso unas emisiones estimadas de 40 toneladas de CO2 equivalente y 1,16 GWh de consumo energético.

## Enlaces

- Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-base
- Modelo ajustado por instrucciones: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Informe técnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- AI Endpoints (OVHcloud): https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-v1-0-mini-7a1b/
- Playground: https://olala.ovh.com
