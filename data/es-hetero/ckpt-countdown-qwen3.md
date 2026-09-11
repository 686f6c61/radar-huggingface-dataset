# es-hetero/ckpt-countdown-qwen3

# es-hetero/ckpt-countdown-qwen3

## Resumen

ckpt-countdown-qwen3 es un repositorio de checkpoints de entrenamiento, no una release de inferencia lista para producción. Lo publica el usuario es-hetero y contiene los pesos intermedios y finales de varios modelos de la familia Qwen3 (Qwen3-1.7B, Qwen3-4B y Qwen3-8B) ajustados mediante estrategias evolutivas (Evolution Strategies, ES) sobre la tarea Countdown, un problema de aritmética composicional en el que hay que construir una expresión que alcance un objetivo a partir de una lista de números.

El repositorio forma parte del estudio "learning while serving" sobre heterogeneidad en ES, cuyo código está en https://github.com/akshat57/es-heterogeneity. Incluye cinco variantes de muestreo de lotes por modelo (denominadas arms): fixed (L0), fresh (L0.5), hetero (L1), mirror (V1) y mirror-v3 (V3), además de escalones de ablación N/M para la variante de 4B.

Su relevancia es fundamentalmente investigadora: permite reproducir el entrenamiento, auditar los checkpoints periódicos y analizar las generaciones de evaluación ejemplo a ejemplo. No hay pipeline declarado, ni idiomas documentados, ni cifras de descargas o likes en el momento de la consulta, y el propio autor indica que todavía falta un conversor a safetensors de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (según run: Qwen3-1.7B, Qwen3-4B o Qwen3-8B) |
| Parametros totales | 1,7B / 4B / 8B según el run (cdq3-1.7b-\*, cdq3-4b-\*, cd8b-\*) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los checkpoints se distribuyen en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | .pth (state dicts en bf16 con claves correspondientes a nombres de parámetros de vLLM, con qkv_proj y gate_up_proj fusionadas); conversor a safetensors de transformers anunciado pero no disponible |
| Estructura del repositorio | `<run>/iter<N>.pth`, `<run>/final/pytorch_model.pth`, `<run>/eval-output/`, `<run>/steps.jsonl` |
| Tarea de entrenamiento | Countdown |
| Fecha de publicación | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La base arquitectónica es la familia Qwen3, un transformer decoder-only. Los runs de 1,7B y 4B emplean las variantes de la release original de Qwen3 en modo non-thinking, según la model card. El modelo no introduce una arquitectura nueva: lo que cambia respecto a los pesos originales es el procedimiento de ajuste, que aquí es una búsqueda con estrategias evolutivas en lugar de un ajuste supervisado o por preferencias al uso. La model card no documenta el número de tokens de entrenamiento, la composición del dataset más allá de la tarea Countdown, ni si hubo RLHF o DPO.

La innovación del estudio está en cómo se muestrean los lotes dentro del bucle de ES, y de ahí las cinco arms: fixed (L0), un único lote compartido que se reutiliza; fresh (L0.5), un lote compartido nuevo en cada iteración; hetero (L1), un lote nuevo por miembro de la población; mirror (V1), pares antitéticos con un lote por par; y mirror-v3 (V3), pares antitéticos con un lote por miembro. La variante de 4B incluye además escalones de ablación N/M. Los checkpoints son state dicts en bf16 con las claves renombradas al esquema de vLLM (proyecciones qkv y gate_up fusionadas), de modo que el camino de reanudación del propio trainer los puede cargar; `steps.jsonl` actúa como libro mayor de cada run y `eval-output/` guarda las generaciones de evaluación por ejemplo.

## Capacidades

- Resolución de la tarea Countdown: construir expresiones aritméticas que alcancen un objetivo con los números dados.
- Generación de texto y razonamiento básico heredados de los pesos Qwen3 de partida, sujetos al ajuste con ES.
- Aritmética de varios pasos dentro del dominio de Countdown.
- Evaluación reproducible: el repositorio incluye generaciones por ejemplo en `<run>/eval-output/`, útiles para auditar el comportamiento del modelo tras cada run.
- Reanudación de entrenamiento desde checkpoints periódicos (`iter<N>.pth`) y desde el guardado final (`final/pytorch_model.pth`).

No hay evidencia en la información disponible de soporte de tool calling o function calling, de capacidades de agente o razonamiento multi-paso fuera de Countdown, de cobertura multilingüe declarada, ni de visión, audio o modo thinking. Los runs de 1,7B y 4B se describen explícitamente como non-thinking.

## Casos de uso

- Reproducción de experimentos de estrategias evolutivas: cargar los checkpoints de cada arm (fixed, fresh, hetero, mirror, mirror-v3) y comparar la evolución de la pérdida y de la tasa de acierto en Countdown para validar los resultados del estudio.
- Análisis de la heterogeneidad del muestreo de lotes: usar los run de 1,7B, 4B y 8B para estudiar cómo afecta reutilizar un lote compartido frente a generar uno nuevo por miembro de la población, con `steps.jsonl` como fuente de trazas.
- Auditoría cualitativa de generaciones: revisar `<run>/eval-output/` para inspeccionar caso a caso dónde falla el modelo al componer expresiones aritméticas.
- Punto de partida para fine-tuning posterior: los state dicts en bf16 pueden servir como inicialización de nuevos experimentos, siempre que se realice la conversión al formato que espere el framework de destino.
- Investigación sobre olvido catastrófico y retención: comparar los pesos ajustados por ES con los pesos Qwen3 originales para medir cuánto se degrada el comportamiento general al especializar en Countdown.
- Desarrollo y validación de infraestructura de entrenamiento: dado que las claves siguen el esquema de vLLM, el repositorio es útil para probar rutas de reanudación y conversión de checkpoints entre el trainer y el motor de inferencia.
- Estudio metodológico de variantes ES: los escalones de ablación N/M de la variante de 4B permiten aislar el efecto del tamaño de población y del número de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto estándar, ni métricas agregadas de la tarea Countdown más allá de las generaciones almacenadas en `eval-output/`.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del número de parámetros y del hecho de que los checkpoints se distribuyen en bf16, no datos publicados por el autor:

- Qwen3-1.7B: aproximadamente 3,4 GB de pesos en bf16, unos 5-6 GB de VRAM con caché KV para contextos moderados; en int8 en torno a 1,8 GB y en int4 en torno a 1 GB.
- Qwen3-4B: aproximadamente 8 GB de pesos en bf16, unos 11-13 GB de VRAM con caché KV; en int8 alrededor de 4 GB y en int4 alrededor de 2,2 GB.
- Qwen3-8B: aproximadamente 16 GB de pesos en bf16, unos 19-21 GB de VRAM con caché KV; en int8 alrededor de 8,5 GB y en int4 alrededor de 4,5 GB.
- GPU recomendadas: para 1,7B basta una RTX 3060 de 12 GB o similar; para 4B es razonable una RTX 3090, RTX 4090 o L4 de 24 GB; para 8B en bf16 conviene una RTX 4090 de 24 GB (al límite), A100 de 40/80 GB o H100.
- Cabe en GPU de consumo: 1,7B y 4B sí, en tarjetas de 12-24 GB; 8B en bf16 solo en 24 GB con contexto reducido o directamente cuantizado.
- Opciones de despliegue: vLLM es la ruta natural, porque las claves de los state dicts siguen su esquema de nombres con proyecciones fusionadas. El propio trainer puede recargar los checkpoints mediante su ruta de reanudación. Para llama.cpp, Ollama o TGI haría falta primero una conversión, ya que el repositorio no incluye safetensors ni GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación natural es con los pesos Qwen3 originales sobre los que se ha trabajado, dado que este repositorio no es un modelo nuevo sino un conjunto de checkpoints ajustados. Las especificaciones de los modelos base no figuran en la información proporcionada, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| ckpt-countdown-qwen3 (cdq3-1.7b-\*) | 1,7B | no disponible | Checkpoint ajustado con ES sobre Qwen3-1.7B, non-thinking | apache-2.0 | .pth en bf16 |
| ckpt-countdown-qwen3 (cdq3-4b-\*) | 4B | no disponible | Checkpoint ajustado con ES sobre Qwen3-4B, non-thinking | apache-2.0 | .pth en bf16 |
| ckpt-countdown-qwen3 (cd8b-\*) | 8B | no disponible | Checkpoint ajustado con ES sobre Qwen3-8B | apache-2.0 | .pth en bf16 |
| Qwen3-1.7B (base) | 1,7B | no disponible | Modelo base de la familia | no disponible | safetensors |
| Qwen3-4B (base) | 4B | no disponible | Modelo base de la familia | no disponible | safetensors |
| Qwen3-8B (base) | 8B | no disponible | Modelo base de la familia | no disponible | safetensors |

No se dispone de alternativas equivalentes de otros autores especializadas en la tarea Countdown dentro de la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un repositorio de checkpoints de investigación, sin pipeline declarado, sin idiomas documentados y con cero descargas y likes en el momento de la consulta.
- Estado de conversión incompleto: los pesos están en .pth con el esquema de nombres de vLLM y el conversor a safetensors de transformers está anunciado pero no disponible, lo que complica su uso directo con TGI u otras herramientas que esperan safetensors.
- Especialización estrecha: el ajuste se ha realizado sobre Countdown, por lo que cabe esperar un deterioro del comportamiento general respecto a los pesos Qwen3 originales, aunque no se publican métricas que cuantifiquen ese olvido.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de error, de modo que no hay datos para acotar el riesgo en tareas abiertas.
- Sesgos: no disponible. La model card no documenta análisis de sesgos ni composición del dataset de entrenamiento.
- Limitaciones de contexto e idioma: no disponible. No se especifica la ventana de contexto efectiva tras el ajuste ni la cobertura idiomática.
- Licencia: apache-2.0, que permite uso comercial y modificación, pero al derivar de pesos Qwen3 conviene verificar las condiciones de la licencia de los modelos base antes de redistribuir.
- Ausencia de métricas: sin benchmarks publicados no es posible comparar objetivamente estos checkpoints con alternativas ni justificar su uso fuera del ámbito del estudio.
- Resultados de búsqueda web no concluyentes: las consultas realizadas no devolvieron material técnico relevante sobre el modelo, solo resultados no relacionados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/es-hetero/ckpt-countdown-qwen3
- Repositorio del estudio "learning while serving": https://github.com/akshat57/es-heterogeneity
- No se han encontrado papers, blogs, demos ni otros recursos relevantes en la búsqueda web disponible.
