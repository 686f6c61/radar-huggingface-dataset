# arxohq/Arxo-Pecunia-4B-FinChain-0.1

## Resumen

Arxo-Pecunia-4B-FinChain-0.1 es un adaptador LoRA publicado por arxohq sobre el modelo base Qwen/Qwen3.5-4B, especializado en razonamiento financiero multi-paso sin herramientas externas. El adaptador resuelve problemas de finanzas estructurados en pasos numerados: enumera los datos dados, muestra cada cálculo de forma explícita y termina con una línea `Answer = <valor>`. Cubre los doce dominios de FinChain, desde estados financieros y ratios hasta análisis de inversión, finanzas corporativas, gestión de riesgos y finanzas sostenibles.

El modelo es relevante porque demuestra que un ajuste fino ligero (LoRA) sobre un modelo de 4B puede superar a modelos mucho mayores en una tarea acotada y verificable. En el benchmark FinChain, el adaptador alcanza un 80,2% de respuestas finales correctas frente al 76,7% del Qwen3.5-4B sin entrenar, y se acerca a los resultados de GPT-4.1 (84,7%) y Gemini 2.5 Pro (84,3%) reportados por los autores del benchmark.

Se distribuye como adaptador PEFT (0,3 GB en el repositorio) y requiere cargar el modelo base por separado. Está pensado como release de investigación, no como asesoramiento financiero, y su alcance se limita a los tipos de pregunta de FinChain.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-4B (carga con `AutoModelForImageTextToText`) |
| Parametros totales | 4B (modelo base); el adaptador LoRA añade un conjunto reducido de pesos no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B; no declarada en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) que se acopla al modelo base Qwen/Qwen3.5-4B. No se trata de un modelo entrenado desde cero: el adaptador modifica un subconjunto de pesos del transformer subyacente para especializarlo en razonamiento financiero estructurado. La carga se realiza con `PeftModel.from_pretrained` sobre una instancia de `AutoModelForImageTextToText`, no sobre `AutoModelForCausalLM`, lo que indica que el modelo base expone una interfaz multimodal aunque la tarea entrenada sea de texto.

El entrenamiento se realizó sobre preguntas de los mismos tipos que las plantillas básicas e intermedias de FinChain, redactadas con formulación y números propios del autor. No se utilizaron preguntas del conjunto de test, ni literalmente ni con los números enmascarados, y el prompt no se ajustó sobre las preguntas de evaluación. El autor declara una única ejecución de entrenamiento por modelo. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La innovación principal es el formato de salida impuesto: bloque `Given:`, pasos numerados con cálculos explícitos y línea final `Answer = <valor>` o `Answer: <texto>`, verificado por el checker ChainEval con una tolerancia del 5%.

## Capacidades

- Generación de texto con razonamiento financiero multi-paso: descompone el problema en pasos numerados y muestra cada cálculo.
- Resolución de problemas de los doce dominios de FinChain: estados financieros, ratios, análisis de inversión, finanzas corporativas, gestión de riesgos y finanzas sostenibles, entre otros.
- Aritmética explícita sobre los datos declarados en el enunciado, sin acceso a datos de mercado ni a documentos externos.
- Formato de respuesta verificable: bloque `Given:`, pasos `Step 1:`, `Step 2:`… y línea final `Answer = <valor>` o `Answer: <texto>`.
- Funcionamiento sin herramientas (no tools) y con el modo thinking desactivado (`enable_thinking=False`).
- Capacidades multilingües: solo inglés declarado.
- No se declara soporte de tool calling, function calling ni razonamiento agéntico multi-paso con herramientas.

## Casos de uso

- Verificación automática de cálculos financieros en pipelines de evaluación: el formato de salida con línea `Answer =` permite extraer y comparar la respuesta final de forma programática con un checker como ChainEval, lo que facilita integrar el modelo en suites de test de razonamiento numérico.
- Generación de ejercicios resueltos para formación financiera: el modelo produce la solución paso a paso con los cálculos visibles, útil para material docente de ratios, ecuaciones contables o análisis de inversión.
- Asistencia en la resolución de problemas de contabilidad básica e intermedia: por ejemplo, calcular el patrimonio neto a partir de activos y pasivos con la ecuación del balance, mostrando el procedimiento completo.
- Prototipado de asistentes de análisis financiero acotados: en entornos donde las preguntas se formulan con todos los datos en el enunciado y no se requiere consultar estados financieros reales.
- Evaluación comparativa de modelos pequeños en tareas numéricas: sirve como referencia de hasta dónde llega un ajuste LoRA de 4B frente a modelos de 7B-8B en razonamiento financiero.
- Investigación sobre ajuste fino eficiente: el adaptador es un caso de estudio de cómo un LoRA sobre un modelo de 4B mejora un 3,5% absoluto en la métrica principal respecto al base sin entrenar.
- Generación de cadenas de razonamiento auditables: la estructura paso a paso permite revisar manualmente cada operación intermedia, útil en contextos donde se exige trazabilidad del cálculo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 2.800 preguntas de FinChain (diez por plantilla, 280 de las 290 plantillas), decodificación greedy, thinking desactivado, límite de 2.048 tokens nuevos, checker ChainEval con 5% de tolerancia:

| Sistema | Tamaño | Entrenado en la tarea | Respuesta final correcta |
|---|---|---|---|
| Arxo Pecunia FinChain 0.1 (4B) | 4B | sí | 2.245 / 2.800 (80,2%) |
| Qwen3.5-4B sin entrenar | 4B | no | 2.147 / 2.800 (76,7%) |
| Arxo Pecunia FinChain 0.1 (0.8B) | 0,8B | sí | 2.002 / 2.800 (71,5%) |
| Qwen3.5-0.8B sin entrenar | 0,8B | no | 1.265 / 2.800 (45,2%) |

Resultados por dificultad:

| Nivel | Preguntas | Arxo Pecunia (4B) | Qwen3.5-4B | Arxo Pecunia (0.8B) | Qwen3.5-0.8B |
|---|---|---|---|---|---|
| Basic | 1.130 | 1.000 (88,5%) | 967 (85,6%) | 963 (85,2%) | 735 (65,0%) |
| Intermediate | 1.120 | 919 (82,1%) | 854 (76,2%) | 835 (74,6%) | 400 (35,7%) |
| Advanced | 550 | 326 (59,3%) | 326 (59,3%) | 204 (37,1%) | 130 (23,6%) |
| Todos | 2.800 | 2.245 (80,2%) | 2.147 (76,7%) | 2.002 (71,5%) | 1.265 (45,2%) |

Cifras de referencia reportadas por los autores del benchmark (Tabla 2 del paper, respuesta final correcta, zero-shot), medidas sobre su propio muestreo de preguntas:

| Sistema | Tamaño | Respuesta final correcta |
|---|---|---|
| GPT-4.1 | n/a | 84,7% |
| Gemini 2.5 Pro | n/a | 84,3% |
| Claude Sonnet 4.5 | n/a | 83,3% |
| GPT-5 | n/a | 82,0% |
| Qwen 2.5 Instruct | 7B | 65,4% |
| Qwen2.5-Math | 7B | 62,6% |
| Mathstral | 7B | 54,0% |
| Fin-o1 | 8B | 52,8% |
| Fin-R1 | 7B | 52,8% |
| Qwen 3 | 8B | 32,3% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para el modelo base de 4B en bfloat16 se puede estimar en torno a 8-10 GB, y el adaptador LoRA añade una sobrecarga pequeña (repositorio de 0,3 GB).
- GPU recomendadas: no declaradas por el autor. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) permite cargar el modelo base en bfloat16 con comodidad.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 12-16 GB o más en bfloat16, y en menos VRAM con cuantización del modelo base, aunque el autor no publica cifras concretas.
- Opciones de despliegue: la ficha oficial solo documenta `transformers` + `peft` con `AutoModelForImageTextToText`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la fusión del adaptador con el modelo base sería un paso previo habitual para estos motores, pero no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | FinChain (respuesta final) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arxo-Pecunia-4B-FinChain-0.1 | 4B | no disponible | 80,2% | apache-2.0 | Adaptador LoRA en Hugging Face |
| Qwen3.5-4B (base sin entrenar) | 4B | no disponible | 76,7% | no disponible en la ficha | Modelo base en Hugging Face |
| Qwen 2.5 Instruct | 7B | no disponible | 65,4% (paper) | no disponible en la ficha | Hugging Face |
| Fin-R1 | 7B | no disponible | 52,8% (paper) | no disponible en la ficha | Hugging Face |

Las cifras de Fin-R1 y Qwen 2.5 Instruct proceden de la tabla de referencia del paper de FinChain y se midieron sobre un muestreo distinto de preguntas, por lo que la comparación es de configuración y no pregunta a pregunta.

## Limitaciones y advertencias

- Alcance restringido: el modelo está entrenado para los tipos de pregunta de FinChain; sobre otras preguntas financieras no ha sido evaluado.
- No lee documentos: calcula a partir de los números declarados en el enunciado; no procesa estados financieros, informes, tablas ni datos de mercado.
- Aritmética plana: no aplica convenciones de cómputo de días, reglas fiscales ni gestión de divisas más allá de lo que indique la pregunta.
- Brecha en dificultad avanzada: en el nivel Advanced el adaptador no mejora al base (59,3% en ambos), porque no hubo contrapartida de esas plantillas en el entrenamiento.
- Riesgo de alucinación: no evaluado de forma específica; el formato paso a paso hace visibles los cálculos, pero no garantiza su corrección.
- Idiomas: solo inglés declarado; no hay soporte documentado de castellano.
- Licencia: apache-2.0, permisiva para uso comercial, pero el autor la publica como release de investigación y no como asesoramiento financiero.
- Sesgos: no documentados en la información disponible.
- Producción: no se publican datos de latencia, throughput ni comportamiento con cuantización; el adaptador requiere cargar el modelo base y usar `AutoModelForImageTextToText`, lo que puede complicar la integración en stacks estándar de `AutoModelForCausalLM`.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/arxohq/Arxo-Pecunia-4B-FinChain-0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del benchmark FinChain: https://github.com/mbzuai-nlp/finchain
- Paper de FinChain: https://arxiv.org/abs/2506.02515
- Release previo Arxo-Materia-4B-MedCalc-0.1: https://huggingface.co/arxohq/Arxo-Materia-4B-MedCalc-0.1
- Release previo Arxo-Materia-4B-EHRSQL-0.1: https://huggingface.co/arxohq/Arxo-Materia-4B-EHRSQL-0.1
- Release previo Arxo-Valentia-4B-ChemIQ-0.1: https://huggingface.co/arxohq/Arxo-Valentia-4B-ChemIQ-0.1
