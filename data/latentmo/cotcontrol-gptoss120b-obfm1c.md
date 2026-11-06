# latentMO/cotcontrol-gptoss120b-obfm1c

## Resumen

`latentMO/cotcontrol-gptoss120b-obfm1c` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `openai/gpt-oss-120b`, un transformer MoE de OpenAI con 120.000 millones de parámetros totales y aproximadamente 5.100 millones de parámetros activos por token. El adaptador no es un modelo autónomo: requiere cargar el modelo base y aplicar los pesos PEFT para funcionar. Se distribuye en formato safetensors dentro de un repositorio de 10,5 GB que incluye dos checkpoints (`step35/` y `step40/`).

El propósito declarado es la investigación en controlabilidad de la cadena de razonamiento (chain-of-thought, CoT). Según la model card, forma parte de un sprint MATS sobre controlabilidad de CoT, donde se entrena al modelo para seguir instrucciones sobre su propia traza de razonamiento, junto con variantes relacionadas de ofuscación, OPSD y "many-types". El autor lo etiqueta explícitamente como *model organism* y artefacto de investigación, con la advertencia de no desplegarlo en producción.

Es relevante ahora porque los *model organisms* de seguridad de IA permiten estudiar comportamientos emergentes controlados (por ejemplo, obediencia o desobediencia a instrucciones sobre el propio razonamiento) en modelos de gran escala, y porque el ecosistema de adaptadores LoRA sobre `gpt-oss-120b` facilita reproducir experimentos sin reentrenar el modelo completo. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se publican idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE `openai/gpt-oss-120b` |
| Parametros totales | 120.000 millones (modelo base); adaptador de rango 32 (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | ~5.100 millones (modelo base, dato de referencia de `gpt-oss-120b`) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantizaciones del base no especificadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); checkpoints en `step35/` y `step40/` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 exportado desde un checkpoint de sampler de Tinker, según la model card. Cada carpeta `step<N>/` contiene los pesos PEFT junto con un `tinker_provenance.json` que referencia las rutas originales `tinker://` del sampler y del estado de entrenamiento (ya eliminadas de Tinker). El modelo base es `openai/gpt-oss-120b`, un transformer con mezcla de expertos (MoE) de 120.000 millones de parámetros totales y unos 5.100 millones activos por token, aunque la model card del adaptador no detalla la arquitectura interna del base.

El entrenamiento se enmarca en un sprint MATS sobre controlabilidad de CoT: se instruye al modelo para que siga directrices sobre su propia traza de razonamiento, con variantes de ofuscación, OPSD y "many-types". No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El código de entrenamiento, configuración y evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, en las rutas `cot-control/rl/` y `cot-control/results/rl/obfm1c/` (`config.json`, `checkpoints.json`), con un diario de ejecuciones en `runs/`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base `gpt-oss-120b` (no verificadas de forma independiente para este adaptador).
- Control de la propia cadena de razonamiento: el adaptador está entrenado para seguir instrucciones sobre su traza de CoT (objetivo declarado del experimento).
- Variantes experimentales de ofuscación de CoT, OPSD y "many-types" mencionadas en la model card.
- Soporte de tool calling / function calling: no disponible de forma específica para el adaptador; depende del modelo base.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma específica para el adaptador.
- Capacidades multilingües: no disponibles.
- Modo *thinking*: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: servir como *model organism* para estudiar si un modelo obedece o desobedece instrucciones sobre su propio razonamiento, comparando `step35/` y `step40/` para medir la evolución del comportamiento durante el entrenamiento.
- Estudios de controlabilidad de CoT: analizar cómo cambia la traza de razonamiento cuando se le pide al modelo ocultar, resumir o alterar pasos intermedios, usando el adaptador como condición experimental frente al base sin adaptar.
- Evaluación de ofuscación de razonamiento: reproducir los experimentos de ofuscación y OPSD descritos en el repositorio de código para medir la fidelidad del CoT reportado.
- Reproducibilidad de experimentos MATS: cargar los checkpoints `step35/` y `step40/` junto con `tinker_provenance.json` para auditar la procedencia y replicar las evaluaciones publicadas en `cot-control/results/rl/obfm1c/`.
- Investigación sobre adaptadores LoRA de rango 32 en modelos MoE de gran escala: estudiar cómo un adaptador de bajo rango modifica el comportamiento de un modelo de 120.000 millones de parámetros sin reentrenar el base.
- Docencia y formación en seguridad de IA: usar el adaptador como ejemplo práctico de *model organism* y de las limitaciones de desplegar artefactos de investigación en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA por sí solo no es inferible: requiere cargar `openai/gpt-oss-120b` completo.
- VRAM estimada para el modelo base en precisión completa: no disponible en la información proporcionada; para un MoE de 120.000 millones de parámetros se requiere hardware de clase servidor con múltiples GPU.
- GPU recomendadas: no disponibles de forma específica; por el tamaño del base, se espera necesitar A100/H100 o equivalentes con agregación de memoria entre varias GPU.
- ¿Cabe en GPU de consumo? No disponible; el tamaño del modelo base (120.000 millones de parámetros) hace improbable su ejecución en una sola GPU de consumo sin cuantización agresiva, dato no confirmado.
- Opciones de despliegue: PEFT (carga del adaptador sobre el base), Tinker (origen del entrenamiento), y las opciones estándar del base (`gpt-oss-120b`) no detalladas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-obfm1c` | Adaptador LoRA rango 32 sobre base de 120.000 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | *Model organism* de investigación sobre controlabilidad de CoT |
| `openai/gpt-oss-120b` (base) | 120.000 M totales, ~5.100 M activos | no disponible | no disponible en esta ficha | Hugging Face / OpenAI | Modelo base sin el adaptador de control de CoT |
| Otros adaptadores del mismo sprint (`cot-control`) | LoRA sobre `gpt-oss-120b` | no disponible | Apache 2.0 (presumible por el repo) | Repositorio `johntrob14/tricky_little_guys` | Variantes de ofuscación, OPSD y "many-types" |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que son artefactos de investigación y que no deben desplegarse ("Research artifacts only; do not deploy").
- No es un modelo autónomo: sin el base `openai/gpt-oss-120b` los pesos del adaptador no son utilizables.
- Las rutas `tinker://` originales del sampler y del estado de entrenamiento han sido eliminadas de Tinker, lo que limita la reproducibilidad exacta del entrenamiento.
- No se especifican sesgos conocidos, riesgo de alucinación ni limitaciones de idioma para este adaptador.
- El comportamiento entrenado (seguir instrucciones sobre la propia traza de razonamiento) puede inducir ofuscación o razonamiento no fiel; es precisamente el objeto de estudio, no una capacidad para producción.
- Licencia Apache 2.0 declarada, pero el uso comercial no está recomendado por el propio autor al tratarse de un *model organism*.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evaluaciones independientes publicadas.
- No se publican benchmarks, tipos de cuantización ni idiomas soportados.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-gptoss120b-obfm1c
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Código de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys (rutas `cot-control/rl/` y `cot-control/results/rl/obfm1c/`)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
