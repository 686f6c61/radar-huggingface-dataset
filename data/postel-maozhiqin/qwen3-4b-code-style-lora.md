# postel-MaoZhiqin/qwen3-4b-code-style-lora

## Resumen

Qwen3-4B Code Style LoRA es un adaptador LoRA de tipo SFT (supervised fine-tuning) publicado por el usuario postel-MaoZhiqin sobre el modelo base Qwen/Qwen3-4B de Alibaba Cloud. No se trata de un modelo nuevo ni de una mejora de capacidades: es un ejercicio de transferencia de estilo que clona un formato muy concreto de generación de código Python sobre un modelo ya existente. El adaptador se entrenó con tan solo 129 muestras propias en formato `messages`, con peticiones en chino y respuestas consistentes en un único bloque de código Python.

El objetivo declarado es que el modelo responda siempre con un solo bloque ` ```python `, sin texto explicativo alrededor, aplicando una convención de tipado "amplia en la entrada, estricta en la salida" (tipos abstractos como `Iterable`, `Mapping` o `Real` en los parámetros, y tipos concretos como `list`, `dict`, `float` o `Path` en el retorno), con `docstring` en cada función y tratamiento explícito de condiciones límite (entradas vacías, división por cero, valores negativos). El autor insiste explícitamente en que esto es estilo, no capacidad: el modelo base no mejora su habilidad para programar.

El adaptador es relevante como ejemplo práctico y reproducible de un pipeline de fine-tuning ligero: LoRA con r=16 y alpha=32 sobre los módulos de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), 5 épocas, 325 pasos de optimización y unos 3 minutos de entrenamiento en una única AMD Radeon RX 7900 XT con ROCm. Su utilidad real es acotada: forzar consistencia de formato en un asistente de generación de utilidades Python pequeñas, no sustituir a un modelo de código de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B |
| Parametros totales | no disponible para el adaptador; modelo base Qwen3-4B (4 mil millones, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; `max_length` de entrenamiento: 2048 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | zh, en (entrenamiento y validación solo con prompts en chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only del que la información proporcionada no detalla capas, atención ni composición del corpus original. Lo relevante aquí es la configuración del fine-tuning: LoRA con rango 16, alpha 32 y dropout 0,05, inyectado únicamente en las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), sin tocar las capas MLP. El entrenamiento usó transformers 5.x, peft 0.21 y trl 1.17, con loss calculada solo sobre los turnos del asistente (assistant-only loss), batch efectivo de 2 (per_device=1 con acumulación de gradiente 2), learning rate 2e-4, `max_length` de 2048 y 5 épocas sobre 129 muestras, lo que equivale a 645 ejemplos vistos y 325 pasos de optimización.

El conjunto de datos es enteramente sintético y de autoría propia: 129 pares `user`/`assistant` en los que el usuario plantea una necesidad en chino y el asistente devuelve un fichero Python completo y ejecutable. Los temas cubiertos son procesamiento de cadenas y rutas, utilidades sobre iterables, cálculo numérico, lectura y escritura de JSON/JSONL y estimadores al estilo scikit-learn. No hay split de validación ni datos de preferencia (RLHF/DPO); es SFT puro. La innovación técnica es nula por diseño: el valor está en la reproducibilidad del pipeline y en lo acotado del experimento, no en aportar mecanismos nuevos de atención, decodificación especulativa ni arquitecturas híbridas.

## Capacidades

- Generación de código Python en un formato fijo: un único bloque ` ```python ` sin explicaciones adicionales.
- Aplicación consistente de una convención de tipado concreta: tipos abstractos en parámetros (`Iterable`, `Mapping`, `Real`) y tipos de implementación en el retorno (`list`, `dict`, `float`, `Path`).
- Inclusión sistemática de `docstring` en las funciones generadas.
- Tratamiento explícito de condiciones límite en el código producido: entradas vacías, división por cero, valores negativos.
- Generación de utilidades pequeñas: manipulación de cadenas y rutas, herramientas sobre iterables, cálculos numéricos, lectura y escritura de JSON/JSONL.
- Generación de estimadores con interfaz compatible con scikit-learn (con las salvedades indicadas en limitaciones).
- Conversación multi-turno en formato `messages` (pipeline `text-generation`, tag `conversational`).
- Soporte de `enable_thinking=False` en la plantilla de chat de Qwen3 (modo sin razonamiento explícito).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento entrenado específicamente; no hay evidencia en la información proporcionada de que estas capacidades del modelo base se conserven o se hayan visto afectadas.

## Casos de uso

- Estandarización de estilo en un asistente interno de generación de utilidades Python: el adaptador fuerza un formato de salida uniforme (un solo bloque de código, sin prosa), lo que simplifica el parseo automático y la integración en editores o pipelines que esperan código puro.
- Generación de funciones auxiliares para scripts de datos: conversión de segundos a formato `HH:MM:SS`, normalización de rutas, lectura de JSONL línea a línea; son exactamente las familias de tareas cubiertas por el conjunto de entrenamiento.
- Docencia y ejemplos de estilo de código: sirve para producir snippets con `docstring` y manejo de casos límite de forma consistente, útil en materiales formativos sobre buenas prácticas en Python.
- Prototipado de plantillas de código en herramientas de baja latencia: al ser un adaptador LoRA sobre un modelo de 4B, puede desplegarse en una GPU de consumo y responder con latencias bajas para tareas de generación corta.
- Investigación sobre transferencia de estilo con SFT de bajo coste: el pipeline completo (129 muestras, 3 minutos en una RX 7900 XT) es reproducible y sirve como referencia para experimentos de formato condicionado.
- Filtrado y post-procesado en pipelines de generación de código: usar el adaptador como generador de candidatos con formato canónico para luego validar sintaxis o ejecutar tests en una etapa posterior.
- No es adecuado para generación de código en producción de propósito general (clases complejas, redes, algoritmos), donde el autor documenta degradación y alucinación de APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (MMLU, HumanEval, GSM8K ni evaluaciones de estilo), y el autor señala que no existe split de validación, por lo que no es posible medir sobreajuste ni calidad de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa del modelo base de 4B: en FP16 en torno a 8-9 GB, en cuantización de 8 bits en torno a 4-5 GB y en 4 bits en torno a 2,5-3 GB (estimaciones habituales para modelos de este tamaño, no verificadas en la información disponible).
- GPU recomendadas: el adaptador se entrenó en una AMD Radeon RX 7900 XT (ROCm) con unos 3 minutos de cómputo para 5 épocas sobre 129 muestras; para inferencia, cualquier GPU con suficiente VRAM para el modelo base.
- Cabe en GPU de consumo: sí, siempre que se disponga de VRAM suficiente para el modelo base en la cuantización elegida; el adaptador en sí ocupa muy poco (repo de 0,1 GB).
- Opciones de despliegue: transformers + peft (carga del adaptador y `merge_and_unload()`), y en principio cualquier runtime que soporte el modelo base fusionado; la información proporcionada no confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B Code Style LoRA (este) | Adaptador LoRA SFT sobre Qwen3-4B | no disponible (base 4B) | no disponible (entreno 2048) | Apache-2.0 | Especializado en formato de código Python; 129 muestras; sin benchmarks |
| Qwen/Qwen3-4B (base) | Modelo completo | 4B (dato no confirmado en la información) | no disponible en la información | Apache-2.0 | Capacidad general; sin el sesgo de formato del adaptador |
| Adaptadores LoRA de estilo/código en Hugging Face | Adaptadores PEFT | variable | variable | variable | No se dispone de datos concretos de alternativas comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Solo se entrenó con funciones utilitarias pequeñas; clases, código de red y problemas algorítmicos quedan fuera de distribución y pueden degradar la calidad o inventar APIs. El autor documenta un caso concreto: al pedir un bosque aleatorio compatible con scikit-learn, el modelo referencia `BaseForest` y `_get_n_features`, que no existen.
- No mejora la corrección del código, solo la consistencia de formato y estilo; no debe evaluarse como un modelo de código mejorado.
- El conjunto de entrenamiento es de 129 muestras sin split de validación, por lo que no es posible cuantificar el sobreajuste; más de 5 épocas tiende a producir respuestas memorizadas del conjunto de entrenamiento.
- Solo se validó con prompts en chino; el comportamiento con prompts en inglés u otros idiomas no está verificado.
- Riesgo de alucinación de APIs y de firmas de funciones, especialmente fuera del dominio de utilidades cubierto.
- Sin datos de sesgo: no se ha realizado ninguna evaluación de sesgos en la información proporcionada.
- Licencia Apache-2.0, que permite uso comercial, pero al derivar de Qwen3-4B conviene verificar las condiciones del modelo base y atribuir correctamente.
- En producción, el adaptador debe combinarse con validación sintáctica y tests automáticos; no se recomienda usarlo como única fuente de código ejecutable.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/postel-MaoZhiqin/qwen3-4b-code-style-lora
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- GitHub del autor: https://github.com/re-ITRT
- Repositorio de entrenamiento con `train/train.json`: no disponible como enlace directo en la información proporcionada (el autor lo menciona sin URL)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
