# pandakingpunc/megazeka-denklem-qwen2.5-1.5b-tr

## Resumen

Megazeka-Denklem es un adaptador LoRA sobre Qwen2.5-1.5B-Instruct especializado en resolver ecuaciones lineales de primer grado con una incógnita, mostrando el desarrollo paso a paso en turco. Lo desarrolla el usuario independiente pandakingpunc como parte de la familia de proyectos Megazeka (corrector ortográfico y normalizador numérico), y está pensado para su uso local sin dependencia de APIs de pago ni conexión de red en tiempo de inferencia.

El modelo no es un modelo base nuevo: es un adaptador PEFT de aproximadamente 0,1 GB que se aplica sobre la versión cuantizada a 4 bits de Qwen2.5-1.5B-Instruct preparada por Unsloth. Su relevancia es acotada pero concreta: cubre un nicho muy específico (ecuaciones lineales en turco con formato de resolución estructurado) con una precisión reportada por el autor del 99,6 % en su conjunto de test principal, y demuestra que un ajuste fino pequeño y bien dirigido puede convertir un modelo de 1,5B en una herramienta fiable para una tarea matemática delimitada.

La arquitectura subyacente es un transformer decoder-only de Qwen2.5 con 1,5B parámetros y ventana de contexto de 32 768 tokens (heredada del modelo base). El adaptador se entrenó con QLoRA en una RTX 4060 de 8 GB, lo que lo hace reproducible en hardware de consumo. La licencia es Apache 2.0 tanto para el adaptador como para el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 1,5B en el modelo base; tamano del adaptador no disponible (repo de 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Base de entrenamiento en 4-bit (bitsandbytes); el adaptador se puede aplicar sobre base 4-bit o bf16 |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención de causalidad completa, RoPE y ventana de contexto de 32 768 tokens. El ajuste se realizó con QLoRA (LoRA sobre una base cuantizada a 4 bits con bitsandbytes) sobre la versión `unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`, que ocupa aproximadamente 1,6 GB. El entrenamiento se ejecutó en local en una RTX 4060 de 8 GB, lo que confirma que el proceso es reproducible en hardware de consumo.

Los datos de entrenamiento son sintéticos y se generaron con un script propio (`src/uret.py`, solo biblioteca estándar, reproducible por semilla): 8 000 ejemplos de entrenamiento, 400 de validación y 500 de test (Test A), más un Test B de 600 ejemplos con tipos nuevos. El dataset está publicado como `pandakingpunc/megazeka-denklem-tr-steps`. El formato de salida es fijo: ecuación, pasos numerados con cálculos intermedios visibles, comprobación por sustitución y resultado final. La versión 1.0 corrigió el principal defecto de la primera iteración (la comprobación se escribía en una sola línea y el modelo copiaba valores sin calcularlos), reescribiendo la comprobación y los cálculos intermedios paso a paso; esto redujo el error de comprobación del 9,6 % al 2,7 %. No se documenta uso de RLHF ni DPO.

## Capacidades

- Resolución de ecuaciones lineales de primer grado con una incógnita, con desarrollo paso a paso en turco.
- Manejo de coeficientes enteros y fraccionarios, paréntesis, términos con denominador, incógnitas en ambos lados y respuestas fraccionarias.
- Detección de los casos «sin solución» y «infinitas soluciones».
- Resolución de problemas verbales de números, edades, dinero y números consecutivos.
- Normalización de entrada: acepta ecuaciones sin espacios (`3x+5=20`), con asterisco (`3*x`), con signo menos Unicode o con variable en mayúscula.
- Comprobación por sustitución del valor obtenido en la ecuación original, con verificación aritmética explícita.
- Generación de texto general (heredada de Qwen2.5-1.5B-Instruct), aunque el ajuste la especializa hacia la tarea matemática.
- No soporta tool calling ni function calling de forma documentada; no se reportan capacidades de agente, visión ni audio.
- Multilingüismo limitado al turco para la tarea objetivo; el modelo base conserva capacidades multilingües, pero el adaptador no las ha sido evaluado.

## Casos de uso

- Tutor de álgebra en turco para estudiantes de secundaria: el modelo genera la resolución completa con pasos numerados y comprobación, lo que permite al alumno seguir el razonamiento y verificar el resultado por sí mismo, sin necesidad de conexión a internet.
- Corrección automática de ejercicios en una plataforma educativa: dado un enunciado de ecuación lineal, el sistema obtiene la solución y el desarrollo, y puede comparar el resultado final con la respuesta del alumno mediante un parser del último valor de la cadena.
- Generación de material didáctico: producción por lotes de ejercicios resueltos con formato homogéneo (ecuación, pasos, comprobación, resultado) para libros de texto o bancos de problemas en turco.
- Asistente de estudio offline en dispositivos con GPU de consumo: al ocupar el adaptador unos 0,1 GB sobre una base 4-bit de 1,6 GB, cabe en tarjetas de 8 GB y puede ejecutarse en local sin enviar datos de alumnos a servicios externos.
- Preprocesamiento en pipelines de matemáticas simbólicas: el modelo puede actuar como paso previo que normaliza y resuelve ecuaciones lineales antes de pasarlas a un CAS, con la ventaja de producir una traza legible en lenguaje natural.
- Integración en un chatbot de soporte educativo con contexto largo: la ventana de 32 768 tokens del modelo base permite mantener conversaciones multi-turno con varios ejercicios en el mismo hilo, aunque la evaluación del autor se centra en preguntas aisladas.
- Verificación cruzada de resultados: dado que el modelo escribe la comprobación por sustitución, puede usarse como segunda opinión frente a otro solucionador, comparando el valor final y detectando discrepancias.

## Benchmarks y rendimiento

Los datos proceden de la evaluación del propio autor (`src/degerlendir.py`, decodificación greedy). «Respuesta correcta» se define como coincidencia del valor de la última línea con un solucionador de fracciones independiente; en problemas verbales se comprueba además el número solicitado. «Comprobación correcta» es la proporción de soluciones en las que cada igualdad de la cadena de verificación es realmente cierta.

| Conjunto | Primera iteración | v1.0 |
|---|---:|---:|
| Test A: 500 ecuaciones (14 tipos + verbales) | 497/500 | 498/500 |
| Test A: comprobación aritmética correcta | 90,4 % | 97,3 % |
| Test B: 600 ecuaciones (tipos nuevos y verbales) | no disponible | 600/600 |
| Test B: comprobación aritmética correcta | no disponible | 94,6 % |
| 24 preguntas manuales fuera de distribución | 22/24 | 24/24 |

Comparación de base según precisión (Test B, primeras 200 preguntas): base 4-bit 200/200; base bf16 original 196/200 (dos fallos en preguntas con signo menos Unicode). No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 1,6 GB para la base 4-bit más el adaptador (0,1 GB); en la práctica, menos de 4 GB en total con overhead de inferencia.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4-6 GB de VRAM; el autor entrenó en una RTX 4060 de 8 GB y el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o superiores; también en CPU con la base original en float32 (lento) y `device_map="cpu"`.
- La base 4-bit requiere NVIDIA y `bitsandbytes`; sin GPU se puede usar `Qwen/Qwen2.5-1.5B-Instruct` en bf16 o float32, con una ligera pérdida de precisión (196/200 frente a 200/200 en Test B).
- Opciones de despliegue: transformers + peft + accelerate + bitsandbytes (ruta documentada por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la naturaleza de adaptador LoRA complica su uso directo en algunos de estos motores sin fusión previa de pesos.
- Latencia y throughput: no disponibles en la información proporcionada.
- Recomendaciones de inferencia: `do_sample=False` (greedy), `max_new_tokens=600` y sin mensaje de sistema (el entrenamiento no lo incluía).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Megazeka-Denklem (este) | 1,5B + LoRA | 32 768 | Ecuaciones lineales paso a paso en turco | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 | Propósito general, multilingüe | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-1.5B-Instruct | 1,5B | 32 768 (no confirmado en la información disponible) | Matemáticas generales, principalmente inglés y chino | No disponible en la información | Hugging Face |

La comparación con Qwen2.5-Math es pertinente por tamaño y dominio, pero no se dispone de datos de rendimiento en turco para contrastar. Frente al base Qwen2.5-1.5B-Instruct, la ventaja del adaptador es el formato estructurado y la precisión en la tarea concreta; la desventaja es la pérdida de generalidad y el soporte exclusivo del turco para la tarea objetivo.

## Limitaciones y advertencias

- La comprobación por sustitución no es fiable al 100 %: si el modelo se equivoca en un cálculo difícil (por ejemplo, `1452/22 = 69`), puede terminar igualmente con «solución correcta» sin detenerse ante la inconsistencia.
- La mayoría de los errores de comprobación (28 de 31) se producen con respuestas fraccionarias, donde el modelo suma un entero y una fracción en un solo paso (`31 + 108/7`); la respuesta final suele ser correcta en esos casos.
- Se documenta al menos un error de lectura del enunciado (`11b/12 + 12 = 1` interpretado como `11b/12 + 1 = 1`).
- Los datos son sintéticos y generados con una única plantilla de redacción; el comportamiento ante preguntas muy distintas, problemas verbales largos o ecuaciones fuera de alcance no está medido.
- Fuera de alcance: decimales, dos incógnitas, ecuaciones de segundo grado y desigualdades.
- El adaptador está entrenado sobre una base 4-bit; usarlo con la base bf16 reduce ligeramente la precisión, y usarlo con otros modelos base no está soportado.
- No se debe enviar mensaje de sistema: el entrenamiento no lo incluía y puede degradar el formato de salida.
- Riesgo de alucinación en la aritmética intermedia y en la comprobación, incluso cuando el resultado final es correcto.
- Sesgos lingüísticos y de dominio: el modelo solo se ha evaluado en turco y en el dominio de ecuaciones lineales; no hay evaluación de sesgos sociales.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud en producción; conviene validar las salidas con un solucionador simbólico independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pandakingpunc/megazeka-denklem-qwen2.5-1.5b-tr
- Dataset de entrenamiento: https://huggingface.co/datasets/pandakingpunc/megazeka-denklem-tr-steps
- Modelo base (4-bit, Unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del proyecto: https://github.com/pandakingpunc/megazeka-denklem
- Script de evaluación: https://github.com/pandakingpunc/megazeka-denklem/blob/v1.0/src/degerlendir.py
- Informe de evaluación v2: https://github.com/pandakingpunc/megazeka-denklem/blob/v1.0/reports/degerlendirme-v2.md
- Informe de evaluación v1: https://github.com/pandakingpunc/megazeka-denklem/blob/v1.0/reports/degerlendirme-v1.md
- Proyecto hermano Megazeka (corrector ortográfico): https://github.com/pandakingpunc/megazeka
- Proyecto hermano Megazeka-Sayı (normalizador numérico): https://github.com/pandakingpunc/megazeka-sayi
