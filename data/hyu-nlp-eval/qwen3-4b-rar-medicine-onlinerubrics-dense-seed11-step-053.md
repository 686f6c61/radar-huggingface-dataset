# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-053

## Resumen

HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-053 es un checkpoint de investigación derivado de Qwen/Qwen3-4B-Instruct-2507 mediante aprendizaje por refuerzo (RL) sobre datos del dominio médico, con un esquema de recompensa basado en rúbricas evaluadas en línea ("online rubrics"). Lo publica la organización HYU-NLP-EVAL (Universidad de Hanyang, según el identificador del autor) dentro de una ejecución concreta identificada como `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, correspondiente a la semilla 11 de un barrido experimental y al paso 53 del entrenamiento.

Se trata de un modelo denso de 4.411.424.256 parámetros (aproximadamente 4,4 mil millones), con pesos en BF16 y licencia Apache-2.0, pensado para inferencia y para reproducir experimentos de RL. Al ser un checkpoint intermedio (paso 53) de una fase de entrenamiento, su interés principal es metodológico y de investigación, no de producción: la model card es mínima y no incluye resultados de evaluación.

Su relevancia actual radica en que documenta una técnica concreta (RL con rúbricas generadas/evaluadas en línea aplicada a un modelo pequeño de razonamiento médico) y permite a otros grupos comparar el efecto de la semilla, del número de pasos y de la estrategia de recompensa. No obstante, el repositorio no declara idiomas, benchmarks ni cuantizaciones, y el propio autor etiqueta el contenido como "research use only".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, basado en la familia Qwen3 (modelo base Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (dato real de safetensors) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No disponible en la model card de este checkpoint; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens de contexto nativo (dato de la documentación del base, no confirmado para este fine-tuning) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos BF16, sin versiones GGUF, GPTQ o AWQ oficiales |
| Idiomas soportados | No disponible: no se declaran idiomas en la model card; se heredarían los del modelo base |
| Licencia | apache-2.0 (con la advertencia "research use only" en la model card) |
| Formato de pesos | safetensors en BF16 para inferencia, más `original_checkpoint/` con los ficheros nativos de veRL (solo parámetros del modelo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4,4 mil millones de parámetros, con atención completa y sin componentes MoE ni modelos de estado espacial. Este checkpoint concreto no introduce cambios estructurales: es el resultado de un proceso de ajuste por refuerzo sobre esos pesos, no de un rediseño de la red.

El entrenamiento se realizó con veRL (framework de RL para modelos de lenguaje), como evidencian los ficheros de `original_checkpoint/`. La nomenclatura del run indica una fase 1 (`phase1`), recompensas basadas en rúbricas evaluadas en línea (`online-rubrics`), dominio médico (`medicine`), configuración densa (frente a posibles variantes MoE), fecha de ejecución 2026-09-19 y semilla 11. El checkpoint corresponde al paso 53 de esa ejecución. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset médico, ni si hubo etapas previas de SFT o DPO más allá del ajuste instruccional ya presente en el modelo base. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso orientado a diálogo multi-turno.
- Razonamiento en dominio médico: el objetivo declarado del run es el ajuste con recompensas de rúbricas sobre contenido de medicina, por lo que se espera una mejora en ese dominio respecto al modelo base, aunque no se aportan métricas que lo cuantifiquen.
- Herencia de capacidades del modelo base Qwen3-4B-Instruct-2507: comprensión lectora, generación de código, matemáticas básicas y seguimiento de instrucciones, en la medida en que el ajuste por RL no las haya degradado (no verificado).
- Modo no pensante: Qwen3-4B-Instruct-2507 es una variante "instruct" sin modo de razonamiento extendido; no se documenta un "thinking mode" en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; dependería del modelo base y de la plantilla de chat utilizada.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para este checkpoint.
- Capacidades multilingües: no declaradas en la model card de este repositorio.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Reproducción de experimentos de RL con rúbricas: el checkpoint permite a grupos de investigación comparar el paso 53 de la semilla 11 con otros pasos y semillas del mismo barrido, aislando el efecto de la inicialización aleatoria en el entrenamiento por refuerzo.
- Estudio de recompensas basadas en rúbricas en dominios especializados: sirve como caso de estudio de cómo se comporta un modelo de 4,4B cuando la señal de recompensa se genera y evalúa en línea sobre contenido médico.
- Generación de datos sintéticos médicos para investigación: puede emplearse para producir borradores de preguntas, explicaciones o resúmenes que después se filtran y validan por expertos, siempre en un contexto de laboratorio.
- Evaluación comparativa de checkpoints intermedios: al existir `original_checkpoint/` con los ficheros de veRL, es posible reanudar o analizar la trayectoria de entrenamiento y medir la evolución de la calidad en función del paso.
- Base para fine-tuning posterior en tareas clínicas concretas: un investigador podría partir de estos pesos y aplicar SFT con datos propios anotados, aprovechando que ya han pasado por una fase de RL orientada a medicina.
- Docencia y formación en técnicas de RLHF/RLVR: el repositorio es un ejemplo práctico y de tamaño manejable (4,4B) para ilustrar un pipeline completo de veRL, desde el checkpoint original hasta el modelo en BF16 listo para inferencia.
- Análisis de alineación y sesgos en modelos médicos pequeños: permite estudiar qué tipo de respuestas refuerza un esquema de rúbricas automáticas y qué sesgos introduce en comparación con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, MedQA, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y el repositorio registra 0 descargas y 0 "likes", por lo que tampoco existen evaluaciones de terceros asociadas.

## Requisitos de hardware

- Peso de los parámetros: 4.411.424.256 parámetros en BF16 equivalen a aproximadamente 8,8 GB de pesos en disco y en VRAM.
- VRAM estimada para inferencia en BF16: entre 10 y 12 GB considerando pesos, activaciones y caché KV con contextos moderados.
- VRAM estimada en cuantización INT8: del orden de 5 a 6 GB; en INT4, de 3 a 4 GB (requiere conversión propia, ya que no hay cuantizaciones publicadas).
- GPU de consumo: cabe en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080) siempre que se limite la longitud de contexto; en RTX 4090 o RTX 3090 (24 GB) funciona con holgura en BF16. En GPUs de 8 GB solo sería viable mediante cuantización a 4 bits.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o L4; la L4 (24 GB) es suficiente para BF16 con contexto corto.
- Opciones de despliegue: la librería declarada es `transformers`; los tags incluyen `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los endpoints compatibles son opciones soportadas. vLLM es viable con los pesos safetensors. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota sobre el tamaño del repositorio: 26,5 GB en total, porque incluye tanto el modelo BF16 como el directorio `original_checkpoint/` con los ficheros de veRL.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-053 (este) | 4,41B denso | No declarado; 262.144 en el base | apache-2.0, con aviso "research use only" | HuggingFace, 0 descargas | No disponible |
| Qwen/Qwen3-4B-Instruct-2507 | 4,4B denso | 262.144 tokens nativos | apache-2.0 | HuggingFace (modelo oficial) | Benchmarks publicados por el autor del base, no reproducidos aquí |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B denso | 128.000 tokens | Llama 3.2 Community License (requiere aceptación, con restricciones para productos con más de 700M usuarios mensuales) | HuggingFace, acceso bajo aceptación | Benchmarks publicados por Meta, no reproducidos aquí |
| microsoft/Phi-4-mini-instruct | 3,8B denso | 128.000 tokens | MIT | HuggingFace | Benchmarks publicados por Microsoft, no reproducidos aquí |

La comparación directa de rendimiento con estas alternativas no es posible con la información disponible, ya que este checkpoint no aporta métricas propias. La diferencia relevante es de propósito: los tres modelos comparados son lanzamientos oficiales evaluados y listos para uso general, mientras que este es un artefacto experimental intermedio.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 53 de una fase de entrenamiento por RL, no a un modelo final convergido; su calidad puede ser inferior a la del modelo base en tareas generales.
- Uso exclusivamente de investigación: la model card indica explícitamente "Research use only", lo que entra en tensión con la etiqueta apache-2.0. Antes de cualquier uso comercial conviene aclarar la intención del autor, ya que el aviso puede interpretarse como una restricción adicional.
- Ausencia total de evaluación: no hay benchmarks, ni comparativas, ni análisis de regresiones frente a Qwen3-4B-Instruct-2507, por lo que se desconoce si el ajuste por RL ha degradado capacidades generales como el código o las matemáticas.
- Riesgo de alucinación en dominio médico: cualquier modelo de este tamaño puede generar afirmaciones clínicas plausibles pero incorrectas; en un modelo ajustado específicamente con rúbricas médicas el riesgo de sonar convincente es mayor.
- Prohibición de uso clínico: no debe emplearse para diagnóstico, triaje, recomendación terapéutica ni ninguna decisión que afecte a pacientes, ni siquiera como apoyo no supervisado.
- Sesgos no documentados: no se han publicado análisis de sesgos demográficos, lingüísticos ni culturales, ni del dataset médico empleado en el RL.
- Idiomas no declarados: se desconoce si el ajuste ha preservado el multilingüismo del modelo base o si ha concentrado el rendimiento en inglés.
- Contexto no verificado: aunque el modelo base soporta 262.144 tokens, este fine-tuning no confirma esa ventana; usar contextos muy largos sin validación previa puede producir degradación silenciosa.
- Trazabilidad limitada: el repositorio no incluye documentación del dataset, de la función de recompensa ni de los hiperparámetros, lo que dificulta la reproducibilidad completa.
- Huella en disco elevada: 26,5 GB de repositorio para un modelo de 4,4B, debido a la duplicación de pesos en BF16 y en formato veRL.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-053
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Organización autora: https://huggingface.co/HYU-NLP-EVAL
- Framework veRL (referenciado por el formato del checkpoint): https://github.com/volcengine/verl
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales específicos de este checkpoint.
