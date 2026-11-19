# ikimyaii/Mamba-1.3B-semi-structured-Wanda-90pct

## Resumen

Mamba-1.3B-semi-structured-Wanda-90pct es un modelo derivado del checkpoint base `fla-hub/mamba-1.3B-100B`, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning, sino de una poda (pruning) one-shot sin reentrenamiento posterior: se eliminan pesos de las capas lineales internas de los bloques Mamba aplicando el algoritmo Wanda con un objetivo de dispersión semi-estructurada del 90 %. El resultado es un artefacto de investigación orientado a estudiar el comportamiento de arquitecturas de espacio de estados (SSM) bajo compresión agresiva.

La relevancia del modelo es metodológica más que práctica. Sirve como línea base (baseline) frente a las variantes EHWS del mismo autor y documenta con detalle el protocolo de calibración, la herramienta empleada (código oficial de Wanda, commit `8e8fc87`, rama unstructured con `use_variant=False`) y el coste computacional del proceso (2,8 minutos en una A100 de 40 GB). El checkpoint conserva la arquitectura Mamba original de 1,3 mil millones de parámetros, pero con la mayoría de los pesos de las proyecciones internas puestos a cero.

El dato más importante para cualquier evaluador es el deterioro masivo de calidad: la perplejidad en WikiText-2 pasa de 10,03 a 8782,49 y la precisión media zero-shot cae de 0,4350 a 0,3253. Es decir, el modelo es funcionalmente inutilizable para generación de texto o tareas de razonamiento en producción, y debe interpretarse exclusivamente como material de análisis sobre los límites de la poda en SSM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model, SSM selectivo) |
| Parametros totales | 1.334.740.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | fla-hub/mamba-1.3B-100B |
| Dispersión medida | 0,8820 (objetivo 90 %) |
| Tamano del repo | 2,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Mamba del checkpoint `fla-hub/mamba-1.3B-100B`, un SSM selectivo de 1,3 mil millones de parámetros entrenado sobre 100 mil millones de tokens según la nomenclatura del repositorio base. Sobre esa arquitectura no se realiza ningún entrenamiento adicional: la intervención consiste en una poda one-shot aplicada con el código oficial de Wanda (locuslab/wanda, commit `8e8fc87`, rama unstructured, `use_variant=False`), que puntúa cada peso como `|W| * sqrt(||X||)` y elimina los de menor magnitud relativa a la activación por fila. Se podan todas las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`), mientras que `dt_proj` se mantiene denso (aproximadamente el 2 % de los pesos lineales de cada bloque), al igual que `conv1d`, `A_log`, `D`, los embeddings y `lm_head`.

El protocolo de calibración usa el cargador oficial con 128 secuencias de C4 de 2048 tokens y semilla 0. Los bloques se podan en orden, recalibrando cada uno sobre las salidas de los bloques ya podados, siguiendo la lógica de los drivers oficiales; el recorrido de capas es código nuevo del autor porque los drivers originales solo soportan OPT y LLaMA. La poda se ejecuta en bfloat16 (Mamba desborda en fp16) y tarda 2,8 minutos en una A100 de 40 GB. La dispersión efectiva medida sobre los pesos finales es de 0,8820, y se verifica que las 192 capas podadas tienen el mismo número de no-ceros por fila, lo que garantiza un reparto equilibrado del trabajo por fila.

## Capacidades

- Generación de texto: técnicamente posible pero con perplejidad en WikiText-2 de 8782,49, lo que invalida cualquier uso real.
- Razonamiento y conocimiento factual: degradado severamente; la precisión media zero-shot cae 11 puntos porcentuales respecto al denso (0,4350 a 0,3253).
- Código y matemáticas: no evaluado en la información disponible.
- Tool calling / function calling: no soportado de forma nativa por el modelo base Mamba ni documentado en esta ficha.
- Agentes y razonamiento multi-paso: no aplicable por la degradación de calidad.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): ninguna.

## Casos de uso

- Estudio académico de robustez de SSM frente a poda: el checkpoint permite reproducir el experimento de Wanda sobre Mamba y comparar curvas de perplejidad frente a otras técnicas de compresión, usando el protocolo de evaluación de ELSA.
- Línea base para comparativas internas: el autor lo publica explícitamente como baseline frente a sus modelos EHWS, de modo que sirve para cuantificar la mejora relativa de métodos alternativos bajo el mismo régimen de dispersión.
- Análisis de equilibrio de carga en kernels dispersos: al tener exactamente el mismo número de no-ceros por fila en las 192 capas podadas, es útil para validar implementaciones de kernels semi-estructurados que asumen balance por fila.
- Investigación sobre calibración en poda: permite estudiar cómo afecta el orden de poda por bloques y la recalibración secuencial sobre las salidas ya podadas a la calidad final.
- Reproducibilidad de pipelines de compresión: el detalle del commit, la semilla y el dataset de calibración facilita replicar el experimento en otras arquitecturas SSM.
- Docencia sobre límites de la compresión: ejemplo claro de que una dispersión del 90 % sin reentrenamiento destruye la calidad en SSM, útil para ilustrar por qué se necesitan métodos con recuperación (distillation, fine-tuning posterior).

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, en bfloat16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,03 | 14,12 |
| Este modelo (Wanda 90 %) | 8782,49 | 6630,03 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,2090 |
| arc_easy | 0,5644 | 0,2584 |
| boolq | 0,6040 | 0,3783 |
| hellaswag | 0,3898 | 0,2618 |
| openbookqa | 0,1980 | 0,1420 |
| rte | 0,5343 | 0,5271 |
| winogrande | 0,5217 | 0,5004 |
| Media | 0,4350 | 0,3253 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,7 GB de pesos más overhead de activaciones y caché de estado; el repo ocupa 2,7 GB en safetensors.
- GPU recomendadas: el autor ejecutó la poda en una A100 de 40 GB, pero la inferencia del checkpoint podado cabe en GPUs consumer.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM en bfloat16; en fp16 el modelo base desborda según el autor, por lo que se recomienda bfloat16.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Wanda 90 %) | 1,33 B | no disponible | PPL WT2 8782,49; media zero-shot 0,3253 | no disponible | Hugging Face |
| fla-hub/mamba-1.3B-100B (denso) | 1,33 B | no disponible | PPL WT2 10,03; media zero-shot 0,4350 | no disponible | Hugging Face |
| Variantes EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Calidad destruida: la perplejidad en WikiText-2 se multiplica por más de 800 respecto al denso, y la precisión media zero-shot cae 11 puntos. No es apto para producción.
- Sin reentrenamiento ni recuperación: la poda es one-shot, por lo que no hay fine-tuning que mitigue la pérdida de capacidad.
- Licencia no especificada: no se indica licencia en el repo, lo que impide determinar si el uso comercial está permitido; hay que consultar la licencia del modelo base `fla-hub/mamba-1.3B-100B`.
- Idiomas no documentados: no se declara cobertura lingüística.
- Riesgo de alucinación: irrelevante en la práctica porque la generación es incoherente a estos niveles de perplejidad.
- Dependencia de `flash-linear-attention`: la carga requiere tener instalado el paquete `fla`; sin él, `AutoModelForCausalLM` no reconstruye la arquitectura.
- Precisión: usar bfloat16, ya que Mamba desborda en fp16 según el autor.
- Sesgos: no evaluados ni documentados.
- Contexto: no se especifica la longitud de contexto soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-Wanda-90pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit `8e8fc87`)
- flash-linear-attention: no disponible en la información proporcionada
- Paper de Wanda: no disponible en la información proporcionada
- Paper de Mamba: no disponible en la información proporcionada
