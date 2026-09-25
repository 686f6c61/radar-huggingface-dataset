# budget-internalization-iclr2027/qwen3.5-4b-16k-grpo-reasoninggym-restedmarlin-s300

## Resumen

`qwen3.5-4b-16k-grpo-reasoninggym-restedmarlin-s300` es un ajuste fino por aprendizaje por refuerzo de `Qwen/Qwen3.5-4B`, entrenado con GRPO sobre tareas de Reasoning Gym bajo un presupuesto de generación fijo de 16.384 tokens. Lo publica la organización `budget-internalization-iclr2027` como parte de un envío anónimo a ICLR 2027, y corresponde al checkpoint del paso 300 de una ejecución con el nombre en clave `restedmarlin`. Los pesos declarados suman 4.659.865.088 parámetros (~4,66 B) en safetensors BF16, con un repositorio de 9,3 GB.

El problema que aborda es la internalización del presupuesto de tokens: durante el entrenamiento, toda respuesta que agota el límite de 16.384 tokens recibe recompensa cero, de forma que el modelo aprende a producir respuestas verificables (con la respuesta final dentro de `\boxed{}`) sin agotar el presupuesto. La señal de recompensa proviene de un verificador procedimental de Reasoning Gym, no de un modelo de preferencias, lo que ata el refuerzo a la corrección de la respuesta y no a su estilo.

Su interés es fundamentalmente de investigación: sirve para estudiar razonamiento con presupuesto acotado, verificación automática de respuestas y dinámica de GRPO con recompensa binaria. Como artefacto de producción presenta limitaciones claras: 0 descargas, 0 likes, una model card mínima, sin benchmarks publicados y sin cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder, etiqueta `qwen3_5`; número de capas, tipo de atención y configuración de cabezas no disponibles |
| Parametros totales | 4.659.865.088 (~4,66 B), según los pesos safetensors |
| Longitud de contexto | No disponible. El entrenamiento usa un presupuesto de generación (`max_new_tokens`) de 16.384 tokens, que no equivale necesariamente a la ventana de contexto del modelo base |
| Tipos de cuantizacion | No disponible. Solo se publican pesos BF16; no hay variantes GGUF, AWQ, GPTQ ni bitsandbytes en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (heredada de `Qwen/Qwen3.5-4B`) |
| Formato de pesos | safetensors, precisión BF16, repositorio de 9,3 GB |
| Modelo base | `Qwen/Qwen3.5-4B` (relación: finetune) |
| Tarea declarada (pipeline) | image-text-to-text |
| Librería declarada | transformers |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `Qwen/Qwen3.5-4B`, etiquetado internamente como `qwen3_5`. No se documentan en la información disponible el número de capas, la dimensión oculta, el esquema de atención (completa, lineal o híbrida) ni si incorpora componentes multimodales, pese a que el pipeline declarado sea `image-text-to-text`. El ejemplo de carga de la model card emplea `AutoModelForCausalLM` con `torch_dtype="auto"`, lo que resulta coherente con una generación de texto causal pero deja abierta la cuestión del componente visual del modelo base.

El entrenamiento aplica GRPO con línea base *leave-one-out*, normalización de recompensa por grupo y pérdida a nivel de token. Se usan 32 prompts por paso con 8 rollouts cada uno, optimizador Adam con schedule coseno, LR máximo de 5e-7 y 10 pasos de calentamiento, durante 300 pasos. Los datos son tareas de Reasoning Gym generadas proceduralmente con respuestas en formato `\boxed{}`, con un máximo de 3 épocas. La innovación central es la regla de recompensa: las respuestas que alcanzan el presupuesto de 16.384 tokens obtienen recompensa cero, lo que empuja al modelo a resolver la tarea dentro del límite en lugar de depender de cadenas de razonamiento más largas. No se documenta RLHF con preferencias humanas, DPO ni fases de alineación adicionales.

## Capacidades

- Generación de texto conversacional y de razonamiento paso a paso, con la respuesta final encapsulada en `\boxed{}`, formato inducido por el verificador de Reasoning Gym.
- Resolución de tareas de razonamiento procedimental (aritmética, lógica, álgebra y similares) pertenecientes a la distribución de Reasoning Gym.
- Razonamiento con presupuesto acotado: el entrenamiento penaliza explícitamente el agotamiento de los 16.384 tokens de generación.
- Capacidad multimodal potencial: el pipeline declarado es `image-text-to-text`, aunque la información disponible no confirma ni detalla el soporte de imagen ni su uso durante el ajuste por RL.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explícita; el entrenamiento se limita a tareas de Reasoning Gym con verificación de respuesta final.
- Capacidades multilingües: no disponibles; no se documenta la composición lingüística de los prompts ni evaluación en otros idiomas.
- Modo de pensamiento (*thinking mode*) diferenciado: no documentado como característica separada.

## Casos de uso

- Investigación sobre internalización de presupuesto de tokens: el checkpoint permite reproducir el efecto del límite de 16.384 tokens con recompensa cero y compararlo con el modelo base para medir si el razonamiento se acorta sin pérdida de precisión.
- Generación de trazas de razonamiento verificables: al emitir la respuesta en `\boxed{}`, las salidas pueden filtrarse automáticamente con un verificador, lo que resulta útil para construir conjuntos de datos supervisados de alta precisión.
- Automatización de problemas procedimentales con corrección automática: en pipelines de matemáticas o lógica donde la respuesta es determinista, el modelo puede generar la solución y el verificador validarla sin intervención humana.
- Evaluación de verificadores y funciones de recompensa: al ser un modelo entrenado contra un verificador concreto, sirve como banco de pruebas para medir si un verificador de `\boxed{}` discrimina bien entre aciertos y errores.
- Destilación hacia modelos menores: sus cadenas de razonamiento verificadas pueden emplearse como datos de entrenamiento supervisado para modelos más pequeños orientados a tareas de razonamiento.
- Agentes con presupuesto de cómputo acotado: en despliegues donde el coste por consulta está limitado por el número de tokens generados, el sesgo aprendido hacia respuestas dentro de presupuesto reduce el gasto y la latencia frente a modelos que razonan sin límite.
- Clasificación de dificultad de tareas: ejecutar el modelo sobre un banco de problemas y registrar si acierta o agota el presupuesto permite etiquetar la dificultad relativa de cada ítem.
- Ajuste fino posterior específico de dominio: partir de este checkpoint en lugar del base para dominios con presupuesto de generación restringido, aprovechando que ya ha internalizado la restricción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, GSM8K, HumanEval ni de las propias tareas de Reasoning Gym, y no se proporciona ninguna comparación cuantitativa con el modelo base ni con otras variantes de la misma ejecución.

El único dato de rendimiento documentado es metodológico: la recompensa se calcula con el verificador de tareas de Reasoning Gym sobre la respuesta en `\boxed{}`, y cualquier respuesta que alcanza el presupuesto de 16.384 tokens recibe recompensa cero.

## Requisitos de hardware

- VRAM para los pesos en BF16: aproximadamente 9,3 GB (4,66 B × 2 bytes), coherente con el tamaño del repositorio.
- VRAM adicional para caché KV: no cuantificable con precisión porque se desconocen el número de capas y la configuración de cabezas KV; para una ventana de 16.384 tokens conviene reservar varios gigabytes extra, más aún si no se usa atención paginada.
- En FP16 la huella de pesos es idéntica a BF16 (~9,3 GB). En INT8 bajaría a unos 4,7 GB y en INT4 a unos 2,4-2,6 GB, pero son estimaciones: no hay pesos cuantizados publicados y habría que generarlos.
- GPU recomendadas para BF16: A100 40 GB, H100 80 GB y L40S 48 GB, todas con margen amplio para contexto largo y lotes concurrentes.
- GPU de consumo compatibles en BF16: RTX 4090 y RTX 3090 (24 GB) sin problema; RTX 4080 y 4070 Ti Super (16 GB) de forma ajustada y con contexto reducido. Tarjetas de 12 GB exigirían cuantización propia para sostener 16.384 tokens de contexto.
- Opciones de despliegue documentadas: `transformers` con `AutoModelForCausalLM` y `device_map="auto"`, y vLLM mediante `vllm serve`. No se han publicado recetas para TGI, llama.cpp, Ollama ni LM Studio; usarlas requeriría convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`restedmarlin-s300`) | 4,66 B | No disponible; presupuesto de generación de 16.384 tokens | Sin benchmarks publicados | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3.5-4B` (base) | No disponible en la información proporcionada | No disponible | Sin datos en la información proporcionada | No disponible en la información proporcionada | Modelo base referenciado por el autor |
| Otras variantes RL de ~4 B para razonamiento | No disponible | No disponible | No disponible | No disponible | No disponible |

La información disponible no permite comparar con alternativas de la misma categoría: no se aportan especificaciones del modelo base, ni resultados de otros sistemas, ni referencias a trabajos relacionados. La única comparación defendible es interna, entre este checkpoint y `Qwen/Qwen3.5-4B`, y la diferencia documentada es exclusivamente el post-entrenamiento con GRPO y la regla de recompensa con presupuesto acotado.

## Limitaciones y advertencias

- Artefacto de investigación anónimo: proviene de un envío a ICLR 2027 sin revisión por pares completada y sin autoría identificable, lo que dificulta el soporte y la trazabilidad.
- Es el checkpoint del paso 300 de una ejecución concreta; no se documenta si existe una selección de mejor checkpoint ni curvas de entrenamiento.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de funcionamiento.
- Sesgos: no se documenta ningún análisis de sesgo, filtrado de datos ni evaluación de toxicidad. El modelo hereda los sesgos del base `Qwen/Qwen3.5-4B`, que no se detallan en esta información.
- Riesgo de alucinación: el refuerzo con verificador procedimental puede favorecer respuestas con formato correcto (`\boxed{}`) pero contenido incorrecto cuando la tarea queda fuera de la distribución de Reasoning Gym.
- Sobreajuste a la distribución de entrenamiento: las tareas son problemas procedurales generados automáticamente; no hay datos sobre generalización a razonamiento del mundo real, código o matemáticas competitivas.
- Efecto colateral del presupuesto: la penalización con recompensa cero al agotar los 16.384 tokens puede inducir respuestas más cortas que no siempre equivalen a mejores respuestas en tareas ajenas al entrenamiento.
- Contexto: el límite de 16.384 tokens es un presupuesto de generación durante el entrenamiento, no una especificación de ventana de contexto; no debe asumirse como longitud máxima de entrada.
- Idiomas: no se documentan los idiomas soportados ni la composición lingüística de los prompts, por lo que no hay garantías de calidad fuera del idioma de entrenamiento.
- Licencia: se declara apache-2.0 heredada de `Qwen/Qwen3.5-4B`. Antes de un uso comercial conviene verificar los términos exactos del modelo base y las obligaciones de atribución, dado que la model card remite a ellos sin reproducirlos.
- Despliegue: sin cuantizaciones publicadas, cualquier uso en hardware limitado requiere conversión propia, con el riesgo de degradación que ello implica.
- Ambigüedad de modalidad: el pipeline declarado es `image-text-to-text`, pero el ejemplo de uso carga un modelo causal de texto; no está claro si el componente de imagen es funcional en este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-16k-grpo-reasoninggym-restedmarlin-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Búsqueda web: no se encontraron enlaces relevantes. Las consultas devolvieron páginas sobre el presupuesto del Estado francés, plantillas de hojas de cálculo y alquiler de vehículos, sin relación con el modelo.
- Paper, repositorio de código y demos: no disponibles en la información proporcionada.
