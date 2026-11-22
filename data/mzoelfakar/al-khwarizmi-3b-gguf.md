# mzoelfakar/Al-Khwarizmi-3B-GGUF

## Resumen

Al-Khwarizmi-3B-GGUF es la versión cuantizada en formato GGUF del modelo Al-Khwarizmi-3B, un ajuste fino de HuggingFaceTB/SmolLM3-3B-Base orientado a la resolución de problemas matemáticos de nivel escolar (grade-school math word problems). Lo desarrolla el autor independiente mzoelfakar y se distribuye con licencia Apache 2.0. El modelo está diseñado como un tutor de matemáticas conversacional que razona paso a paso en nueve idiomas, y su nombre homenajea a Muhammad al-Khwarizmi, origen etimológico de la palabra "algoritmo".

El entrenamiento se realizó en tres etapas sobre el conjunto completo OpenAI GSM8K (estilos `main` y `socratic`): un ajuste fino completo inicial, dos pasadas de LoRA y una etapa final de DPO con un dataset multilingüe traducido por el autor. Con 3.075.098.624 parámetros y un tamaño de repo de 34,1 GB (que incluye múltiples cuantizaciones), el modelo busca ofrecer razonamiento matemático multilingüe en hardware modesto, incluyendo teléfonos móviles con la cuantización de 4 bits.

La relevancia actual del modelo radica en su enfoque: en lugar de competir en tamaño, apuesta por un dominio estrecho (matemáticas de primaria y secundaria) con alineación DPO específica para preservar el razonamiento explicado en el idioma del usuario, en lugar de respuestas numéricas escuetas. La versión GGUF facilita el despliegue en CPU y en entornos con recursos limitados mediante llama.cpp y compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM3-3B-Base); detalles internos de atención y capas no disponibles |
| Parametros totales | 3.075.098.624 (3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (referencia), Q8_0 (8 bits), i1-Q4_K_M (4 bits con imatrix); otras cuantizaciones GGUF no detalladas |
| Idiomas soportados | Inglés, árabe, francés, español, alemán, italiano, portugués, chino y ruso (9 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); safetensors disponible en el repo base mzoelfakar/Al-Khwarizmi-3B |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B-Base, un transformer decoder-only de 3B parámetros, y se ajusta en tres fases secuenciales. La primera fase es un ajuste fino completo sobre OpenAI GSM8K (`main`), con 1.000 muestras y split 90/10, 450 pasos (1 época), learning rate 5e-5 con schedule coseno, alcanzando una pérdida de validación de 0,569 y una precisión de tokens del 84,75%. La segunda fase aplica LoRA con r=16 sobre todos los módulos lineales, usando el GSM8K completo en estilos `main` y `socratic`, con 3.550 pasos combinados en dos pasadas consecutivas (intercambiando el split de estilos entre pasadas para que cada problema se viera en ambos formatos de razonamiento), learning rate 5e-5 y schedule coseno, llegando a pérdida 0,462 y precisión del 87,21%.

La tercera fase es un DPO basado en LoRA (r=16, alpha=32, capas objetivo q_proj, k_proj, v_proj y o_proj, beta=0,5) sobre el dataset propio mzoelfakar/Mini-GSM8K-Multilingual-Alignment (480 muestras), con 30 pasos (1 época), learning rate pico 2e-5, schedule coseno y 5 pasos de warmup. El objetivo del DPO es preferir respuestas con pasos explicados ("chosen") frente a respuestas con solo dígitos ("rejected"), de modo que el modelo razone en el idioma del usuario y no se limite a emitir el resultado. El autor reporta una precisión de recompensa del 100% en la discriminación chosen-vs-rejected. No se detalla la composición completa del dataset de preentrenamiento original ni si hubo otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto conversacional con razonamiento matemático paso a paso para problemas verbales de nivel escolar.
- Resolución de problemas GSM8K en dos estilos de razonamiento: `main` (solución directa) y `socratic` (preguntas guiadas).
- Capacidad multilingüe en nueve idiomas (en, ar, fr, es, de, it, pt, zh, ru), con alineación DPO específica para mantener el razonamiento en el idioma del usuario.
- Formato de tutoría matemática: explicación de pasos intermedios en lugar de respuesta numérica aislada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (el razonamiento multi-paso matemático está cubierto por el formato de cadena de pensamiento).
- Capacidades de visión, audio o thinking mode explícito: no disponibles.
- Compatibilidad con text-generation-inference y endpoints compatibles (según tags del repo).

## Casos de uso

- Tutoría matemática interactiva: el modelo puede gestionar diálogos multi-turno explicando la resolución de problemas verbales paso a paso, adecuado para aplicaciones educativas porque el DPO prioriza explicaciones detalladas frente a respuestas escuetas.
- Asistencia en deberes escolares multilingüe: útil en plataformas educativas que atienden a estudiantes en español, árabe, francés, alemán, italiano, portugués, chino o ruso, ya que el ajuste DPO preserva el idioma del usuario en el razonamiento.
- Generación de datasets sintéticos de matemáticas: puede producir soluciones explicadas en varios idiomas para aumentar corpus de entrenamiento o evaluación, con la ventaja de sus dos estilos de razonamiento (`main` y `socratic`).
- Despliegue en dispositivos móviles y edge: la cuantización i1-Q4_K_M (1,92 GB) permite ejecución en teléfonos con 6+ GB de RAM, adecuada para apps educativas offline.
- Prototipado rápido en CPU: la versión Q8_0 (3,28 GB) con llama.cpp permite integrar un solucionador matemático en servicios backend sin GPU dedicada.
- Evaluación comparativa de cuantizaciones: el modelo publica métricas de recuperación de precisión (97,4% en Q8_0, 97,0% en i1-Q4_K_M) que lo hacen útil como caso de estudio para pipelines de cuantización con imatrix y calibración específica.
- Filtrado y verificación de respuestas matemáticas: puede usarse como generador de cadenas de razonamiento para comparar contra solucionadores externos y detectar discrepancias.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre GSM8K en modo 0-shot (coincidencia extractiva, error estándar aproximado de ±1,3 puntos):

| Variante | Tamano | GSM8K 0-shot | Recuperacion vs BF16 | Notas |
|---|---|---|---|---|
| BF16 | 6,16 GB | 62,9% | N/A | Modelo completo |
| Q8_0 | 3,28 GB | 61,3% | 97,4% | 8 bits, menor y más rápido con pérdida mínima |
| i1-Q4_K_M | 1,92 GB | 61,0% | 97,0% | 4 bits con imatrix, calibrado con Mini-GSM8K-Multilingual-Alignment; apto para móviles |

Métricas de entrenamiento reportadas: precisión media de tokens del 87,21% en validación tras LoRA (frente a 84,75% tras el ajuste completo y 82,4% en el primer checkpoint); pérdida de validación reducida aproximadamente un 19% (0,678 → 0,462) sin sobreajuste observado; precisión de recompensa DPO del 100%. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB en BF16, 3,3 GB en Q8_0 y 1,9 GB en i1-Q4_K_M (tamaños de fichero reportados; el consumo real de memoria añade overhead del runtime).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con 8 GB o más puede ejecutar BF16, y GPUs de 4-6 GB bastan para Q8_0 y Q4_K_M.
- Cabe en GPU de consumo: sí; RTX 3060/4060 y superiores en BF16, y GPUs de gama media-baja o integradas en cuantizaciones Q8_0 y Q4_K_M.
- Ejecución en CPU y móvil: la variante i1-Q4_K_M está pensada para teléfonos con 6+ GB de RAM.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama y otros runtimes compatibles con GGUF; el repo declara compatibilidad con text-generation-inference y endpoints compatibles. vLLM no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|
| Al-Khwarizmi-3B-GGUF | 3B | No disponible | 62,9% (BF16, 0-shot) | Apache 2.0 | GGUF, safetensors |
| SmolLM3-3B-Base (modelo base) | 3B | No disponible en la información | No disponible | No disponible en la información | Safetensors |
| Alternativas de 3B especializadas en matemáticas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Dominio estrecho: el ajuste se centra en problemas verbales de matemáticas de nivel escolar (GSM8K); el rendimiento en otras tareas (código, razonamiento general, conocimiento factual) no está evaluado y puede degradarse respecto al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir pasos de razonamiento plausibles pero incorrectos, especialmente fuera de la distribución de GSM8K o en problemas de mayor dificultad.
- Contexto: la longitud de contexto no está documentada; no se recomienda asumir ventanas largas sin verificación empírica.
- Idiomas: aunque declara nueve idiomas, la alineación DPO se hizo sobre un dataset traducido de solo 480 muestras, por lo que la calidad multilingüe puede ser desigual entre idiomas y no está evaluada con benchmarks por idioma.
- Sesgos: no se documentan análisis de sesgos; el entrenamiento sobre GSM8K puede heredar sesgos de ese corpus y del preentrenamiento de SmolLM3.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base SmolLM3 y de los datasets utilizados (GSM8K y el dataset propio del autor) antes de un despliegue en producción.
- Producción: el modelo es un ajuste fino de un autor independiente con 588 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa ni de soporte a largo plazo.
- Precisión reportada: las métricas GSM8K del autor usan coincidencia extractiva con error estándar de ±1,3 puntos, por lo que las diferencias entre cuantizaciones (61,0% vs 62,9%) deben interpretarse con cautela.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mzoelfakar/Al-Khwarizmi-3B-GGUF
- Modelo base (safetensors): https://huggingface.co/mzoelfakar/Al-Khwarizmi-3B
- Dataset de alineación multilingüe: https://huggingface.co/datasets/mzoelfakar/Mini-GSM8K-Multilingual-Alignment
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Modelo base original: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Notebook de chat en Colab: https://colab.research.google.com/github/mzoelfakar/Al-Khwarizmi-3B/blob/main/Al-Khwarizmi-3B
- Repositorio GitHub: https://github.com/mzoelfakar/Al-Khwarizmi-3B
