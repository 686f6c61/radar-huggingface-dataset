# mochiexists528/ace-step-mlx-planner-1.7b-q8

## Resumen

ACE-Step MLX Planner 1.7B Q8 es un paquete de pesos en formato MLX (Apple Silicon) del planner LM de 5 Hz que utiliza ACE-Step para la fase opcional de condicionamiento por modelo de lenguaje (Phase 6). No es un modelo de propósito general: es el componente que decide, a 5 Hz, la secuencia de códigos de audio que el generador DiT de ACE-Step convierte después en audio musical. Lo publica el usuario mochiexists528 como paquete int8 cuantizado con cuantización afín y group size 64.

El planner procede de un fine-tune de la familia Qwen3-1.7B, de ahí el nombre comercial «1.7B», aunque el recuento real de parámetros en los safetensors es de 521.595.136 (unos 521 M). El paquete está pensado para ejecución en dispositivos Apple Silicon: pesa aproximadamente 1,9 GB y se recomienda como la variante de planner «para device runs».

Su relevancia es acotada pero concreta dentro del ecosistema ACE-Step: el paquete int4 del mismo planner colapsa en repeticiones y tomas casi silenciosas, mientras que este int8 mantiene la adherencia lírica del planner fp16 en la evaluación interna del autor (10,1 de 12 líneas de estribillo cantadas, sin colapso de códigos). Está licenciado como Apache 2.0 (heredado de Qwen3) con la obligación de arrastrar el NOTICE de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (fine-tune de la familia Qwen3), planner LM de 5 Hz para ACE-Step |
| Parametros totales | 521.595.136 (segun safetensors; el nombre comercial indica 1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 afín, group size 64 (existe un paquete int4 separado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (metadatos: license: other con license_name: apache-2.0) |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo es el planner LM de 5 Hz de ACE-Step, descrito por el autor como un fine-tune de la familia Qwen3-1.7B. La arquitectura es, por tanto, un transformer decoder tipo Qwen3, orientado aquí a predecir la secuencia de códigos de audio que después consume el modelo DiT de generación musical. El paquete no introduce cambios en la arquitectura: lo que cambia es el layout en disco y la aplicación de cuantización afín int8 (group size 64) para reducir almacenamiento y uso de memoria.

El planner es compartido por los paquetes MLX base turbo y XL-turbo de ACE-Step, de modo que no se duplica en cada repositorio DiT. Según el autor, la variante int4 comprime el embedding/output head atado que selecciona cada código de audio, y su flujo de códigos puede colapsar en repetición (tomas silenciosas o puramente instrumentales): en la evaluación de adherencia lírica con 16 semillas, el int8 iguala al planner fp16 (10,1 de 12 líneas de estribillo cantadas, sin colapso de códigos), mientras que el int4 bajó a 6,1 con 6 tomas casi silenciosas. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de la secuencia de códigos de audio del planner de 5 Hz para el pipeline ACE-Step (Phase 6 LM-conditioning).
- Condicionamiento por modelo de lenguaje de las variantes DiT turbo y XL-turbo de ACE-Step MLX.
- Adherencia lírica en la evaluación interna del autor: 10,1 de 12 líneas de estribillo cantadas con el paquete int8.
- Integración opcional: la generación base no requiere este repositorio; se activa pasando el snapshot del planner con `--lm-weights`.
- Compatibilidad con el detokenizador: para variantes DiT Q4 se debe pasar también `detokenizer.safetensors` como `--lm-conditioning-checkpoint`; en variantes fp16 la proyección FSQ y los tensores de AudioTokenDetokenizer van inline en `dit/model.safetensors`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio directo o modo thinking: no disponible (el modelo solo produce códigos de audio para el pipeline).

## Casos de uso

- Generación musical condicionada por letra con ACE-Step: usar el planner como `--lm-weights` para que la secuencia de códigos siga la letra de entrada, aprovechando el modo int8 para evitar el colapso de repetición descrito en int4.
- Ejecución local en Apple Silicon: desplegar el planner junto a los paquetes DiT turbo o XL-turbo en un Mac y ejecutar el pipeline completo sin depender de GPU dedicada, dado el tamaño de ~1,9 GB del paquete int8.
- Prototipado de pipelines de música asistida por IA: iterar sobre condicionamiento por lenguaje (Phase 6) sin descargar el planner fp16, manteniendo una fidelidad de adherencia lírica equivalente según la evaluación del autor.
- Comparación de cuantizaciones en investigación: usar este paquete int8 frente al int4 como referencia de control para medir colapso de códigos y calidad de tomas vocales/instrumentales.
- Producción musical instrumental que requiera voces: elegir int8 cuando se necesiten tomas cantadas fiables, ya que el int4 produce tomas casi silenciosas en 6 de las semillas evaluadas.
- Integración en herramientas de edición musical basadas en ACE-Step: cargar el planner compartido una sola vez y reutilizarlo entre las variantes DiT base turbo y XL-turbo, dado que no se duplica en cada repositorio.
- Empaquetado y redistribución: usar el layout MLX con safetensors y el NOTICE de Qwen3 como base para redistribuir el planner en productos compatibles con Apple Silicon.

## Benchmarks y rendimiento

El único dato de rendimiento disponible es la evaluación interna de adherencia lírica con 16 semillas del autor, que compara el paquete int8 con el fp16 y el int4:

| Variante | Lineas de estribillo cantadas (de 12) | Tomas casi silenciosas |
|---|---|---|
| int8 (este paquete) | 10,1 | 0 |
| fp16 (referencia) | 10,1 | 0 |
| int4 | 6,1 | 6 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,9 GB para el paquete int8 (requisito indicado por el autor para device runs).
- GPU recomendadas: no aplicable en el sentido tradicional; el paquete es específico de Apple Silicon (unified memory).
- Consumer GPU: no; el formato MLX está orientado a Apple Silicon. La ejecución en GPU dedicada no está documentada en la información disponible.
- Opciones de despliegue: librería MLX; descarga mediante `hf download`. La generación base no necesita este repositorio; se activa con `--lm-weights`. Para DiT Q4, pasar además `detokenizer.safetensors` con `--lm-conditioning-checkpoint`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Rendimiento (eval de estribillo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ace-step-mlx-planner-1.7b-q8 (este) | 521 M (safetensors) | int8 afín, group 64 | no disponible | 10,1/12 | Apache 2.0 | MLX / Apple Silicon |
| ace-step-mlx-planner-1.7b-q4 (mismo autor) | no disponible | int4 | no disponible | 6,1/12 (6 tomas casi silenciosas) | Apache 2.0 | MLX / Apple Silicon |
| Planner fp16 de ACE-Step | no disponible | fp16 | no disponible | 10,1/12 | Apache 2.0 (heredada de Qwen3) | MLX |
| Qwen3-1.7B (modelo base de origen) | ~1,7 B (nominal) | fp16 y otras | no disponible | no disponible | Apache 2.0 | amplia |

## Limitaciones y advertencias

- No es un modelo de propósito general: solo genera secuencias de códigos de audio para el pipeline ACE-Step; no sirve para chat, código, matemáticas ni otras tareas.
- Discrepancia de nomenclatura: el nombre indica 1.7B, pero el recuento real de safetensors es de 521.595.136 parámetros.
- La licencia de los metadatos aparece como `license: other` con `license_name: apache-2.0`; conviene verificar la compatibilidad antes de uso comercial.
- El paquete arrastra la obligación del NOTICE de Qwen3: el autor recomienda consultar la model card upstream de Qwen3 y verificar la última versión antes de redistribuir.
- Riesgo de colapso de códigos asociado a cuantizaciones agresivas: el autor documenta que el int4 cae a 6,1/12 con tomas casi silenciosas; el int8 evita ese colapso en su evaluación, pero con solo 16 semillas.
- Sin datos publicados de sesgos, idiomas soportados ni longitud de contexto.
- El rendimiento depende del resto del pipeline: requiere que el DiT correspondiente y, en variantes Q4, el `detokenizer.safetensors` se pasen correctamente; una configuración incorrecta degrada la generación.
- Repositorio sin descargas ni likes registrados en el momento de la consulta, lo que limita la validación independiente por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/mochiexists528/ace-step-mlx-planner-1.7b-q8
- Paquete int4 del mismo planner (referencia comparativa, mencionado en la model card): https://huggingface.co/mochiexists528/ace-step-mlx-planner-1.7b-q4
- Model card upstream de Qwen3 (NOTICE canónico, referencia del autor): no disponible en la información proporcionada.
