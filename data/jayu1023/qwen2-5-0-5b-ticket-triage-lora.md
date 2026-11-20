# jayu1023/qwen2.5-0.5b-ticket-triage-lora

## Resumen

`qwen2.5-0.5b-ticket-triage-lora` es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el usuario jayu1023. Su funcion es convertir tickets de soporte en texto libre en un objeto JSON estricto con cuatro campos: `category`, `severity`, `plan` y `escalate`. Los tres primeros son tareas de extraccion de informacion; el cuarto (`escalate`) debe inferirse aplicando una politica (`severity in {sev1,sev2} AND category in {ingestion,api}`) que nunca aparece de forma explicita en el texto.

El modelo es relevante por su honestidad metodologica: el autor documenta un fallo de validacion (un `exact_match = 1.00` en held-out que resulto ser memorizacion de frases) y publica un conjunto de evaluacion corregido (`test_hard`) con parafrasis sin solapamiento de frases. Tras esa correccion, el adaptador baja a `exact_match = 0.23`, pero mejora claramente a zero-shot y few-shot en `category` (0.76) y `severity` (0.83), mientras que `plan` colapsa a una sola clase (0.33, por debajo del baseline de mayoria 0.35).

Se trata de una implementacion de referencia y un experimento reproducible, no de un sistema de triaje listo para produccion. El modelo base tiene 0.5B parametros y el adaptador entrena 8.798.208 parametros (1.7497% del total). El autor publica codigo, generador de dataset y harness de evaluacion en su repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 502.830.976 (modelo base) |
| Parametros activos | 8.798.208 entrenables en el adaptador (1.7497%) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only. La configuracion LoRA usa rango 16, alpha 32 y dropout 0.05, con modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento empleo learning rate 0.0002 con scheduler coseno y 6 pasos de warmup, 3 epocas, batch de 4 y acumulacion de gradiente de 2. La perdida se calcula solo sobre la completion (los tokens del prompt se enmascaran a `-100`), ya que el prompt ocupa unos 220 tokens y el objetivo unos 40; entrenar sobre la secuencia completa habria dedicado cerca del 85% del gradiente a texto que el modelo siempre recibe en inferencia.

El entrenamiento consumio 1.04 GB de memoria pico y tardo 2935.4 segundos en MPS (macOS-26.5.2-arm64). La perdida final de entrenamiento fue 0.0253, aunque ya alcanzo 2e-4 antes de la segunda epoca, lo que sugiere que las tres epocas produjeron memorizacion mas que capacidad; el propio autor senala que una epoca con menor rango es la primera alternativa a probar. El dataset es sintetico, generado a partir de plantillas de frases, con etiquetas de categoria, severidad y plan muestreadas de forma independiente, lo que produce tickets semanticamente poco realistas. No se realizo barrido de hiperparametros ni se probaron multiples semillas.

## Capacidades

- Extraccion de informacion estructurada: convierte texto libre de un ticket en un JSON estricto con los campos `category`, `severity`, `plan` y `escalate`.
- Clasificacion de categoria con rendimiento util en frases no vistas (0.76 en `test_hard`).
- Clasificacion de severidad con rendimiento util en frases no vistas (0.83 en `test_hard`).
- Inferencia de politica: deriva el campo `escalate` aplicando una regla que no aparece literalmente en el texto (0.82 en `test_hard`).
- Generacion de salida estructurada (structured output) en formato JSON.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct.
- Soporte de tool calling y function calling: no disponible de forma especifica en el adaptador (depende del modelo base).
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma especifica en el adaptador.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Capacidad de clasificacion de `plan`: deficiente; el modelo colapsa a la clase `self_serve` en 115 de 120 filas de `test_hard`.

## Casos de uso

- Prototipo de triaje de tickets: el adaptador sirve como punto de partida para experimentar con extraccion estructurada sobre un modelo de 0.5B, con un coste de prompt de 175 tokens frente a los 436 de few-shot. Es adecuado para validar pipelines antes de escalar a modelos mayores.
- Enrutamiento automatico por categoria y severidad: en un sistema de soporte, las predicciones de `category` (0.76) y `severity` (0.83) pueden usarse para asignar colas o prioridades, aceptando que el campo `plan` no es fiable.
- Deteccion de escalado: el campo `escalate` (0.82) permite marcar tickets que cumplen la politica de escalado, como una senal auxiliar para revision humana.
- Referencia metodologica para evaluacion de fine-tunes: el repositorio y el harness de evaluacion (`test_hard` con parafrasis sin solapamiento) sirven como plantilla para auditar splits de datos y detectar memorizacion en adaptadores LoRA.
- Experimentacion en hardware limitado: con 1.04 GB de memoria pico en entrenamiento y un modelo base de 0.5B, es viable en equipos consumer y en entornos macOS con MPS.
- Base para distillation o comparacion: util como linea base de un modelo pequeno frente a modelos mayores en tareas de extraccion JSON, midiendo la brecha de rendimiento antes de invertir en inferencia mas costosa.
- Docencia y formacion: ejemplo reproducible de entrenamiento LoRA con enmascaramiento de prompt, diagnostico de colapso de clases y evaluacion honesta de resultados.

## Benchmarks y rendimiento

Resultados medidos en `test_hard` (plantillas y frases held-out, 120 filas, decodificacion greedy):

| Condicion | exact | category | severity | plan | escalate | prompt tokens |
|---|---|---|---|---|---|---|
| base zero-shot | 0.02 | 0.22 | 0.35 | 0.28 | 0.64 | 175 |
| base few-shot (k=4) | 0.03 | 0.20 | 0.34 | 0.23 | 0.72 | 436 |
| este adaptador | 0.23 | 0.76 | 0.83 | 0.33 | 0.82 | 175 |
| baseline mayoria | — | 0.22 | 0.36 | 0.35 | 0.73 | — |

En los splits saturados (`test_seen`, `test_unseen`) el adaptador obtiene 1.00 en todos los campos, pero el autor advierte que esas cifras no son significativas porque el 100% de las frases del holdout aparecian en entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.5B ocupa aproximadamente 1 GB en FP16; el adaptador anade unos 35 MB en safetensors (8.798.208 parametros). La memoria pico de entrenamiento documentada es de 1.04 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entreno en Apple Silicon con MPS (macOS-26.5.2-arm64). Para produccion, una RTX 3060 o superior basta; A100/H100 no son necesarias.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor). Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles. El autor solo reporta tiempo de entrenamiento (2935.4 s en MPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-ticket-triage-lora (este) | 0.5B base + 8.8M adaptador | no disponible | LoRA para extraccion JSON de tickets | BSD-3-Clause | Hugging Face + GitHub |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0.5B | no disponible | Modelo instruct generalista | no disponible en la informacion | Hugging Face |
| base zero-shot (misma tarea) | 0.5B | no disponible | Prompting directo | — | — |
| base few-shot k=4 (misma tarea) | 0.5B | no disponible | Prompting con ejemplos | — | — |

La comparativa se limita al modelo base y a las condiciones de prompting evaluadas por el autor. No se dispone de datos de otros adaptadores de triaje comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El `exact_match = 0.23` en `test_hard` no constituye un sistema de triaje funcional; es una implementacion de referencia con evaluacion honesta de sus limites.
- El campo `plan` colapsa a la clase `self_serve` en 115 de 120 filas y rinde por debajo del baseline de mayoria (0.33 frente a 0.35); el modelo aprendio la cadena literal ("Enterprise plan") en lugar del concepto.
- El dataset es sintetico y generado por plantillas, sin ruido de etiquetas; en datos reales las etiquetas de triaje discrepan entre humanos en torno al 10-20% de los casos, un techo invisible para este adaptador.
- Las etiquetas de categoria, severidad y plan se muestrean de forma independiente, lo que produce tickets semanticamente incoherentes.
- No se realizo barrido de hiperparametros; los valores son defaults defendibles, no optimos medidos.
- Un unico seed y una unica ejecucion; con 120 filas, cada fila representa 0.8 puntos porcentuales.
- Las tres epocas de entrenamiento produjeron memorizacion (perdida de 2e-4 antes de la epoca 2), lo que probablemente contribuyo al colapso de `plan`.
- Es imprescindible usar el mismo system prompt del entrenamiento (disponible en `src/prompts.py` del repositorio); un formato distinto en inferencia es la causa habitual de que un fine-tune parezca no funcionar.
- Riesgo de alucinacion en la generacion de JSON: el adaptador puede producir estructuras validas con valores incorrectos, especialmente en `plan`.
- No se documentan idiomas soportados ni sesgos conocidos.
- La licencia BSD-3-Clause permite uso comercial, pero debe verificarse la licencia del modelo base Qwen2.5-0.5B-Instruct, que no se detalla en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/jayu1023/qwen2.5-0.5b-ticket-triage-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio (codigo, generador de dataset y harness de evaluacion): https://github.com/jayu1023/lora-finetune-lab
- System prompt de entrenamiento: https://github.com/jayu1023/lora-finetune-lab/blob/main/src/prompts.py
