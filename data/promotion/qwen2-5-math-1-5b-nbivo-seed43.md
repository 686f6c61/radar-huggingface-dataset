# promotion/Qwen2.5-Math-1.5B-NBIVO-seed43

## Resumen

Qwen2.5-Math-1.5B-NBIVO-seed43 es un ajuste fino del modelo Qwen/Qwen2.5-Math-1.5B (1.777.088.000 parámetros) desarrollado en el marco del proyecto de ética social en IA generativa Saltlux/IITP, en colaboración con KAIST (año 3 del proyecto, 2026). El modelo aplica NB-IVO (Nash-Bargaining Implicit Value Optimization), un método de alineación con crítico implícito y sin modelo de recompensa externo, sobre 3.200 avisos del conjunto de entrenamiento de MATH con una recompensa binaria de corrección verificable. El objetivo declarado es mejorar el razonamiento matemático paso a paso del modelo base mediante optimización de política, no mediante destilación de datos.

La relevancia técnica está en el método: NB-IVO sustituye el objetivo de tipo `softmax(media de recompensa / α)` de GN-IVO por un profesor de tipo Nash-bargaining sobre un pool finito de K respuestas muestreadas, con márgenes Bradley-Terry por objetivo frente a un banco de muestras congeladas de la política base, valores de juego soft-min y puntos de desacuerdo. Con un único objetivo binario, el profesor de Nash colapsa a un objetivo basado en corrección, por lo que NB-IVO y GN-IVO se comportan de forma equivalente en este checkpoint.

En la evaluación declarada sobre AMC23 (40 problemas), el modelo pasa de 13/40 (32,5%) del base a 22/40, con una reducción de error del 33,3% y un avg@8 del 45,3% frente al 29,7% del base. Es un checkpoint de investigación (update 200 de 200), sin descargas ni validación independiente, y con un intervalo de confianza amplio que en su límite inferior (10,7%) queda por debajo del objetivo del 23% fijado en el certificado de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según el tag `qwen2`); detalles de capas y atención no disponibles en la model card |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluación usa `max_new_tokens=2048`) |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos en precisión completa; no se distribuyen versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la model card no declara idiomas; no se ha evaluado fuera de inglés matemático) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 3,6 GB); compatible con `transformers`, TGI y vLLM |
| Modelo base | Qwen/Qwen2.5-Math-1.5B |
| Metodo de ajuste | NB-IVO (Nash-Bargaining Implicit Value Optimization) |
| Semilla de entrenamiento | 43 |
| Checkpoint | update 200 (final) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de política completa sobre Qwen2.5-Math-1.5B, un transformer decoder-only de 1,78 B de parámetros especializado en matemáticas. No se modifica la arquitectura: el cambio es exclusivamente de pesos. El entrenamiento usa 3.200 avisos del split de entrenamiento de MATH (con 256 reservados como conjunto de desarrollo), recompensa de corrección sobre la respuesta en caja verificada con Math-Verify (equivalente a `trl.rewards.accuracy_reward`) y 200 actualizaciones de 16 avisos × K=8 muestras por aviso (temperatura 0,7, 1.024 tokens de muestreo), banco comparador de 6 muestras, learning rate 1e-6, grad clip 0,1, coeficiente KL 0,01, optimizador AdamW, una única A100-80GB y semilla 43.

La innovación es el profesor de destino. NB-IVO mantiene el objetivo de grupo sin crítico de GN-IVO —entropía cruzada entre una distribución objetivo sobre las K respuestas muestreadas de cada aviso y sus ratios de política normalizados— pero calcula esa distribución mediante un profesor de Nash sobre pool finito (NBPO): para cada aviso construye márgenes Bradley-Terry por objetivo frente a un banco de muestras congeladas de la política base, calcula valores de juego soft-min `V_k(p)`, puntos de desacuerdo `d_k` y resuelve `p* = argmax_p Σ_k log(V_k(p) − d_k) − KL(p ‖ uniform)/η`. Los avisos en los que ninguna mezcla mejora estrictamente todos los objetivos se descartan; las respuestas truncadas pierden frente a las finalizadas; y la secuencia completa se ajusta con una KL k3 contra el modelo base. El checkpoint publicado se selecciona por precisión en el conjunto de desarrollo, no por resultados de test.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con formato de respuesta final dentro de `\boxed{}`.
- Resolución de problemas de competición tipo AMC/AIME y de nivel MATH, incluyendo álgebra, teoría de números, geometría y combinatoria.
- Razonamiento de cadena larga: la evaluación oficial genera hasta 2.048 tokens nuevos por problema.
- Muestreo múltiple para voto mayoritario: el protocolo reporta avg@8 con temperatura 0,6, aprovechable para self-consistency.
- Generación conversacional mediante plantilla de chat (el prompt de evaluación usa mensaje de usuario y system prompt por defecto de la plantilla).
- Compatibilidad declarada con text-generation-inference y con endpoints compatible (tags `text-generation-inference` y `endpoints_compatible`).
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" explícito.
- Capacidades multilingües: no documentadas ni evaluadas en este checkpoint.

## Casos de uso

- Resolución asistida de problemas de competición: dado un enunciado de AMC o AIME, el modelo genera una cadena de razonamiento y una respuesta final en `\boxed{}` que puede extraerse y verificarse automáticamente con Math-Verify, lo que permite integrarlo en un pipeline de corrección sin intervención humana.
- Generación de datos matemáticos sintéticos: al producir soluciones paso a paso verificables, sirve para crear pares pregunta-solución etiquetados por corrección, útiles para ajuste supervisado o para entrenar un modelo verificador.
- Evaluación comparativa de métodos de alineación: al ser un checkpoint NB-IVO con semilla fija sobre un base público y un protocolo de evaluación documentado (AMC23, greedy, max_new_tokens=2048), permite reproducir y contrastar variantes de GN-IVO/NBPO en un entorno de 1,78 B parámetros y una sola GPU.
- Tutoría matemática con verificación: el modelo puede desplegarse tras un verificador simbólico que valide la respuesta en caja; si la verificación falla, se regenera con otra muestra (avg@8), lo que reduce el riesgo de explicaciones incorrectas en producción.
- Batería interna de regresión matemática: por su tamaño, cabe en una GPU de 24 GB y puede ejecutarse en cada commit sobre un set fijo de problemas con decodificación greedy determinista, actuando como test de no regresión de razonamiento.
- Investigación en robustez de recompensas: el log del entrenamiento y el checkpoint permiten estudiar el colapso del profesor de Nash a un objetivo de corrección cuando solo hay un objetivo binario, comparando directamente con la variante GN-IVO.
- Prototipado rápido en local: con pesos bf16 de ~3,6 GB, se puede cargar en una estación de trabajo con GPU consumer para experimentar con plantillas de prompt y temperaturas antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

Evaluación declarada sobre `math-ai/amc23` (40 problemas), decodificación greedy, `max_new_tokens=2048`, parada en `<|im_end|>`/`<|endoftext|>`, vLLM 0.19.1 en bf16 y Math-Verify 0.8.0 con las mismas reglas de extracción para oro y predicción. Reducción de error definida como `ER = (S_model − S_base) / (1 − S_base) × 100`.

| Modelo | Correctas (AMC23, 40) | ER vs base (IC bootstrap 95%) | Objetivo 2026 | avg@8 (T 0,6) |
|---|---:|---:|---|---:|
| Qwen2.5-Math-1.5B (base) | 13/40 (32,5%) | — | — | 29,7% |
| Qwen2.5-Math-1.5B-NBIVO-seed43 | 22/40 (55,0%) | 33,3% (10,7–53,8) | ≥ 23% (cumple) | 45,3% |

Advertencia del propio autor: con 40 problemas, un problema equivale a 3,7 puntos de ER y el intervalo es amplio; el límite inferior (10,7%) queda por debajo del objetivo del 23%. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4–5 GB para pesos (3,6 GB) más caché KV y activaciones; con 8 GB de VRAM es suficiente para contextos moderados.
- Cuantización a int8: ~2 GB de pesos; a 4 bits: ~1,2–1,5 GB, aunque no se distribuyen versiones cuantizadas oficiales y habría que generarlas (por ejemplo, convirtiendo a GGUF o AWQ).
- GPU recomendadas: el autor entrena y evalúa en una A100-80GB (mucho margen para un modelo de este tamaño); para inferencia son suficientes RTX 4090, RTX 4080, RTX 3090, RTX 4060 Ti 16 GB, L4, L40S o A10G.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 8 GB o más en bf16, y en tarjetas de 4–6 GB si se cuantiza.
- Opciones de despliegue: `transformers` (librería declarada), vLLM 0.19.1 (usado en la evaluación oficial), TGI (tag `text-generation-inference`) y endpoints compatibles; llama.cpp u Ollama requerirían una conversión a GGUF no publicada.
- Latencia y throughput: no disponibles; no se han publicado medidas de tokens por segundo para este checkpoint. Como referencia cualitativa, el protocolo greedy con hasta 2.048 tokens nuevos implica generaciones largas, por lo que el tiempo por problema estará dominado por la longitud de la cadena de razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AMC23 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Qwen2.5-Math-1.5B-NBIVO-seed43 | 1,78 B | no disponible | 22/40 (55,0%) | Apache 2.0 | Repositorio HF, 0 descargas |
| Qwen2.5-Math-1.5B (base) | 1,78 B | no disponible en esta ficha | 13/40 (32,5%) | Apache 2.0 | Público y ampliamente desplegado |
| Qwen2.5-1.5B-Instruct | ~1,5 B | no disponible en esta ficha | no disponible | Apache 2.0 | Público, con versiones GGUF de terceros |
| Qwen2.5-Math-7B | ~7 B | no disponible en esta ficha | no disponible | Apache 2.0 (según el modelo base) | Público |

La única comparación con datos reales es contra el modelo base bajo el mismo pipeline: +9 problemas sobre 40 y +15,6 puntos de avg@8. Frente a alternativas de mayor tamaño o de propósito general no hay cifras publicadas en la información disponible, y las diferencias de contexto no pueden evaluarse porque la model card no declara la longitud de contexto.

## Limitaciones y advertencias

- Evidencia estadística débil: la evaluación se apoya en 40 problemas, un problema son 3,7 puntos de ER y el intervalo de confianza del 95% (10,7–53,8) cruza el objetivo declarado del 23%.
- Ámbito estrecho: el ajuste se hace sobre MATH train y se evalúa solo en AMC23; no hay datos de GSM8K, HumanEval, MMLU ni de matemáticas aplicadas, y el rendimiento fuera de problemas de competición es desconocido.
- Riesgo de sobreajuste al formato: el prompt de evaluación es muy específico (petición de razonamiento paso a paso y respuesta en `\boxed{}`); el rendimiento puede degradarse con otros formatos o sin system prompt de la plantilla.
- Sesgos: no se han publicado análisis de sesgo, toxicidad ni evaluación de seguridad de este checkpoint. El proyecto marco es de ética social en IA generativa, pero el modelo publicado no incluye esas evaluaciones.
- Alucinación: al ser un modelo de 1,78 B especializado en matemáticas, puede producir cadenas de razonamiento plausibles con resultados incorrectos, especialmente en problemas fuera de distribución; el uso en producción exige verificación simbólica de la respuesta final.
- Idiomas: no se documenta ni se evalúa ningún idioma distinto del inglés; se desconoce el comportamiento en castellano y no debería asumirse paridad con el modelo base.
- Contexto: la longitud de contexto no está declarada en la ficha y la evaluación se limita a 2.048 tokens nuevos; problemas con enunciados largos o cadenas muy extensas pueden truncarse (el propio método penaliza las respuestas truncadas en entrenamiento, lo que sugiere que el fenómeno es relevante).
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo se distribuye sin garantías y sin soporte; al derivar de Qwen2.5-Math-1.5B conviene conservar los avisos de atribución correspondientes.
- Madurez: 0 descargas y 0 likes, publicaciones creadas y actualizadas con tres minutos de diferencia; es un artefacto de investigación sin validación externa ni mantenimiento declarado.
- No se declaran capacidades de tool calling, agentes, visión ni audio: no debe asumirse que las hereda del base para uso en pipelines agénticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/Qwen2.5-Math-1.5B-NBIVO-seed43
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Conjunto de evaluación AMC23: https://huggingface.co/datasets/math-ai/amc23
- Conjunto de entrenamiento MATH: https://huggingface.co/datasets/hendrycks/competition_math
- Verificador Math-Verify: https://github.com/huggingface/Math-Verify
- Recompensa de referencia en TRL (`accuracy_reward`): https://github.com/huggingface/trl
- Motor de inferencia usado en la evaluación: https://github.com/vllm-project/vllm
- Paper o blog de NB-IVO / NBPO: no disponible en la informacion proporcionada
- Repositorio del proyecto Saltlux/IITP: no disponible en la informacion proporcionada
- Demos o espacios: no disponible
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (definiciones de diccionario y portales de catálogos comerciales del término «promotion»); no se han encontrado enlaces técnicos adicionales que verificar.
