# MoonMath-ai/DeepSeek-V4.1-Flash-1017-uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-uncensored es una variante del modelo DeepSeek-V4.1-Flash-1017 publicada por MoonMath-ai. Se trata de una edición de pesos en forma cerrada (closed-form weight edit) aplicada sobre el checkpoint nativo en FP8 del modelo base, sin fine-tuning ni entrenamiento por gradiente. El objetivo declarado es eliminar el comportamiento de rechazo (refusal) manteniendo prácticamente intactas las capacidades de conocimiento y razonamiento del modelo original. Está pensado exclusivamente para investigación autorizada en seguridad y red-teaming.

El modelo conserva la arquitectura Mixture-of-Experts del base, con 763.205.315.794 parámetros totales almacenados en safetensors y un repositorio de 510,3 GB. La edición deja intactos los 384 expertos enrutados, de modo que la capacidad y el conocimiento del modelo no se alteran y se sirve exactamente igual que el checkpoint original.

Su relevancia es doble: por un lado, demuestra que es posible modificar el comportamiento de rechazo mediante una intervención quirúrgica sobre los pesos sin degradar de forma material el rendimiento en benchmarks de capacidad; por otro, su naturaleza deliberadamente sin censura lo convierte en una herramienta de doble uso que exige aislamiento y control de acceso estrictos. La licencia declarada es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, checkpoint nativo en FP8 |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible (la model card menciona 384 expertos enrutados, sin cifra de activos) |
| Longitud de contexto | no disponible (la model card menciona un presupuesto de generacion de 24k tokens en evaluacion) |
| Tipos de cuantizacion | FP8 nativo (8-bit); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Tamano del repositorio | 510,3 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es una Mixture-of-Experts con 763.205.315.794 parámetros totales y 384 expertos enrutados, servido a partir del checkpoint nativo en FP8 del DeepSeek-V4.1-Flash-1017. No se ha realizado fine-tuning ni entrenamiento por gradiente: la modificación consiste en una edición de pesos en forma cerrada que se fusiona directamente en el checkpoint FP8. Los expertos enrutados quedan intactos, lo que según el autor preserva la capacidad y el conocimiento del modelo base y permite cargarlo y servirlo exactamente igual que el original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. La innovación técnica destacable es precisamente el método de edición: una intervención cerrada sobre los pesos que altera la política de rechazo sin reentrenar, y que según la evaluación mantiene el rendimiento en conocimiento y razonamiento dentro de márgenes pequeños respecto al base.

## Capacidades

- Generación de texto y razonamiento: el modelo base se evalúa con modo de razonamiento activado (MMLU-Pro reasoning, GPQA-Diamond), lo que indica soporte de cadenas de razonamiento extendidas.
- Conocimiento general y académico: MMLU completo (14.042 preguntas) y MMLU-Pro.
- Matemáticas: GSM8K con protocolo paso a paso y decodificación greedy.
- Razonamiento científico de nivel experto: GPQA-Diamond.
- Tool calling / function calling: el ejemplo de despliegue incluye `--tool-call-parser deepseekv41`, lo que confirma soporte de llamadas a herramientas.
- Modo de razonamiento configurable: la model card menciona un ajuste de "maximum reasoning-effort" y recomienda presupuestos de generación de al menos 16k tokens.
- Capacidad de cumplimiento sin rechazo: eliminación del comportamiento de rechazo tanto en peticiones dañinas como en peticiones benignas (reduce también el exceso de rechazo).
- Capacidades multimodales, de audio o de visión: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Red-teaming de sistemas de moderación: el modelo permite generar respuestas de cumplimiento pleno ante peticiones dañinas (StrongREJECT 0,99; HarmBench-320 0,95) para probar clasificadores de seguridad y filtros de contenido en entornos aislados.
- Evaluación de robustez de guardrails: al reducir el rechazo en prompts benignos al 0,0 %, sirve para medir falsos positivos de sistemas de moderación sin la interferencia del comportamiento de rechazo del modelo base.
- Investigación sobre alineación y refusal: permite estudiar cómo una edición cerrada de pesos altera la política de rechazo manteniendo el conocimiento, comparando pares base/variante sobre los mismos prompts.
- Análisis de seguridad en ciberseguridad: con cumplimiento del 100 % en 30 prompts de exploits CVE reales, se usa en laboratorios autorizados para generar y analizar escenarios de explotación y validar detecciones.
- Generación de código y matemáticas en pipelines internos: con GSM8K del 96,0 % y soporte de tool calling, puede integrarse en flujos de resolución de problemas y generación de código dentro de entornos controlados.
- Servicio de inferencia de alto rendimiento con SGLang: el checkpoint FP8 es drop-in respecto al base y se despliega con paralelismo tensorial y de expertos (`--tp-size 4 --ep-size 4`), adecuado para clústeres con GPUs de datacenter.
- Estudio de calibración de jueces LLM: los resultados con el juez dolly2-security y la rúbrica StrongREJECT permiten investigar la fiabilidad de evaluadores automáticos en tareas de compliance dañino.

## Benchmarks y rendimiento

Capacidad (exactitud, mayor es mejor), mismo harness y mismos prompts para base y variante:

| Benchmark | Base | Este modelo |
|---|---:|---:|
| MMLU (14.042, test completo) | 88,22 % | 87,91 % |
| MMLU-Pro (muestra de 4.000) | 69,90 % | 69,42 % |
| MMLU-Pro (muestra de 300, razonamiento) | 85,7 % | 84,7 % |
| GPQA-Diamond (198, razonamiento) | 81,3 % | 84,8 % |
| GSM8K (paso a paso, greedy) | 93,5 % | 96,0 % |

Rechazo en conjuntos retenidos de prompts dañinos y benignos:

| Métrica | Base | Este modelo |
|---|---:|---:|
| Rechazo en prompts dañinos (n = 1410) | 87,3 % | 1,8 % |
| Exceso de rechazo en prompts benignos (n = 350) | 6,3 % | 0,0 % |

Cumplimiento dañino juzgado por LLM (rúbrica StrongREJECT, 0-1, mayor = más cumplimiento):

| Benchmark | Base | Este modelo |
|---|---:|---:|
| HarmBench-320 (split de test oficial) | 0,38 | 0,95 |
| StrongREJECT (313 prompts) | 0,02 | 0,99 |
| Prompts de exploits CVE reales (30) | 0,12 | 1,00 |

Tasas de rechazo juzgadas: HarmBench 60,9 % → 0,6 %; StrongREJECT 98,1 % → 0 %; CVE 86,7 % → 0 %. En GPQA-Diamond, una minoría de ítems agota el presupuesto de 24k tokens a mitad de razonamiento (24 en el base, 15 en esta variante); puntuando solo respuestas completadas, el base obtiene 92,5 % y esta variante 91,8 %, y en las 174 preguntas que ambos completan aciertan exactamente el mismo número (161).

## Requisitos de hardware

- VRAM estimada: con 763.205.315.794 parámetros en FP8, el peso del modelo ronda los 763 GB; el repositorio ocupa 510,3 GB, por lo que se requiere un despliegue multi-GPU con paralelismo tensorial y de expertos.
- GPU recomendadas: GPUs de datacenter con memoria agregada suficiente para el checkpoint completo, como H100 o A100 en configuraciones multi-nodo o multi-GPU. El ejemplo oficial usa `--tp-size 4 --ep-size 4`.
- Consumer GPU: no cabe en GPUs de consumo (RTX 4090 y similares) en su formato FP8 nativo; no se dispone de información sobre cuantizaciones alternativas que lo permitan.
- Opciones de despliegue: SGLang con soporte de DeepSeek-V4.1 (ejemplo oficial de la model card); también se declara compatible con endpoints y con la librería transformers. Soporte de llama.cpp, Ollama o TGI no disponible en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada. La model card advierte que con el esfuerzo de razonamiento máximo se necesita un presupuesto de generación de al menos 16k tokens para evitar truncamientos a mitad de razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-uncensored | 763.205.315.794 | no disponible | MIT | Variante sin rechazo; MMLU 87,91 %, GSM8K 96,0 % |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 763.205.315.794 | no disponible | MIT | Mismo harness: MMLU 88,22 %, GSM8K 93,5 %, rechazo dañino 87,3 % |
| Otros modelos de la misma categoría | no disponible | no disponible | no disponible | No se dispone de información de alternativas comparables en la información proporcionada |

La comparación más significativa es con su propio modelo base: misma arquitectura, mismo tamaño y misma licencia, con una diferencia de capacidad de décimas de punto y una diferencia drástica en la política de rechazo.

## Limitaciones y advertencias

- Modelo deliberadamente sin censura: cumple con peticiones dañinas (StrongREJECT 0,99; CVE 1,00) y produce contenido peligroso bajo demanda. Uso exclusivo en investigación autorizada de seguridad, en privado, sin despliegue ni servicio público.
- El autor declara explícitamente que el usuario es responsable de todo uso del modelo.
- Riesgo elevado de generación de contenido dañino, incluyendo material de explotación de vulnerabilidades reales (CVE).
- El rechazo residual en conjuntos adversariales es bajo pero no nulo (1,8 % en prompts dañinos).
- La capacidad se mantiene cercana al base, pero hay diferencias de décimas de punto en MMLU (−0,3) y MMLU-Pro (−0,5, dentro del ruido); en MMLU-Pro con razonamiento baja un punto (21 de 300 respuestas difieren).
- Con esfuerzo de razonamiento máximo el modelo puede agotar el presupuesto de generación y truncarse a mitad de razonamiento; conviene usar al menos 16k tokens o un esfuerzo moderado.
- Idiomas soportados no disponibles: no se puede garantizar un comportamiento multilingüe adecuado sin evaluación propia.
- Licencia MIT heredada del modelo base, pero la model card advierte de que se aplica la licencia del modelo base; verificar los términos de DeepSeek-V4.1-Flash-1017 antes de cualquier uso comercial.
- Sesgos conocidos: no disponibles en la información proporcionada; no se han publicado evaluaciones de sesgo para esta variante.
- Riesgo de alucinación: no cuantificado en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MoonMath-ai/DeepSeek-V4.1-Flash-1017-uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Documentación y repositorio de SGLang (soporte de DeepSeek-V4.1): no disponible en la información proporcionada
- Paper o blog técnico del método de edición de pesos: no disponible en la información proporcionada
- Rúbrica StrongREJECT: no disponible en la información proporcionada
- Juez LLM dolly2-security: no disponible en la información proporcionada
