# adolfo123456/logibot-slm-smollm2-colab

## Resumen

`logibot-slm-smollm2-colab` es un adaptador LoRA sobre el modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`, publicado por `adolfo123456`. Se generó en el taller de destilación de conocimiento del curso *Tópicos Avanzados en Inteligencia Artificial 2* (Magíster, UAI), usando un LLM de OpenAI como profesor para crear preguntas y respuestas en inglés sobre operación de robots AMR en un centro de distribución.

El adaptador se entrena con 124 pares pregunta-respuesta y LoRA de rango 16 sobre las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down`, con 4,88 M parámetros entrenables (3,6 % del total). Se publica explícitamente como resultado negativo: en un examen fijo de 20 preguntas, la nota media pasa de 1,70 a 2,25 sobre 10 y ningún resultado alcanza la nota de aprobación. No es apto para uso real ni para producción.

Su relevancia es metodológica: documenta de forma reproducible que un modelo de 135 M parámetros y un conjunto pequeño de datos sintéticos no bastan para aprender un dominio técnico. Sirve como evidencia para investigar destilación, evaluación con LLM como juez y límites de los adaptadores PEFT en modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base SmolLM2-135M-Instruct; adaptador LoRA |
| Parámetros totales | 135 M en el modelo base; 4,88 M entrenables en el adaptador (3,6 %) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; el adaptador se distribuye como pesos PEFT, no como modelo cuantizado |
| Idiomas soportados | Inglés (tag `en`; datos y examen en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` como adaptador PEFT/LoRA; no incluye los pesos completos del modelo base |

## Arquitectura y entrenamiento

El modelo parte de `SmolLM2-135M-Instruct`, un transformer decoder-only de 135 M parámetros, y añade un adaptador LoRA con `r=16` y `alpha=32` en las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down_proj`. Según el notebook, el adaptador tiene 4,88 M parámetros entrenables, un 3,6 % del total. El entrenamiento se realizó en Colab con una GPU NVIDIA A100 de 40 GB.

El profesor fue un LLM de OpenAI accedido por API: 40 llamadas, 12.678 tokens de entrada, 5.731 tokens de salida y un coste aproximado de 0,0041 USD. Generó 124 pares pregunta-respuesta en inglés sobre seis temas de operación de robots AMR. La evaluación se hizo con un examen fijo de 20 preguntas en cinco temas no publicados, corregido por el mismo LLM profesor con una escala de 1 a 10 frente a una referencia. No se documenta RLHF ni DPO.

Existe una discrepancia sin resolver en los datos de entrenamiento: el notebook indica 5 épocas, 40 pasos y 70,1 segundos, mientras que el log guardado indica 4 épocas, 124 pasos y 1.477,8 segundos. La pérdida inicial y final coinciden en ambas fuentes, pero no se reportan pasos ni tiempos como dato fiable.

## Capacidades

- Generación de texto en inglés: heredada del modelo base, pero sin calidad suficiente en el dominio objetivo.
- Formato conversacional: compatible con `apply_chat_template` de `transformers` y carga mediante `peft`.
- Dominio de logística y robots AMR: insuficiente; la nota media del examen es 2,25 sobre 10 y la nota máxima es 5.
- Evaluación académica: permite comparar modelo base frente a adaptador con un examen fijo de 20 preguntas.
- Tool calling o function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los datos y la evaluación son solo en inglés.
- Visión, audio o modo de razonamiento explícito: no documentado.

## Casos de uso

- Evidencia de resultado negativo en destilación: sirve para documentar que 124 pares y un adaptador LoRA sobre 135 M no bastan para un dominio técnico; se pueden citar las notas 1,70 → 2,25 y el 0 % de aprobación.
- Ejemplo reproducible de PEFT en docencia: cargar el adaptador con `transformers` y `peft`, aplicar la plantilla de chat y ejecutar generación con `do_sample=False`; útil para enseñar carga de adaptadores y evaluación con juez LLM.
- Auditoría de evaluación con LLM como juez: replicar el examen fijo de 20 preguntas y comparar base frente a adaptador; permite discutir el margen de error y la dependencia del profesor/juez.
- Línea base negativa para comparar técnicas: usar este adaptador como baseline débil frente a `adolfo123456/logibot-slm` u otros métodos; la inferencia no requiere A100.
- Prueba de integración de artefactos PEFT: validar en CI que el repositorio carga, que el chat template funciona y que el adaptador produce texto; sirve para detectar repositorios incompletos, ya que el tamaño indicado es 0,0 GB.
- Estudio de calidad de datos sintéticos: analizar los 124 pares generados por el profesor OpenAI, con 40 llamadas y 12.678 tokens de entrada, y relacionar cantidad y calidad con la nota obtenida.
- Contraejemplo en clases de LLM pequeños: demostrar que una pérdida de entrenamiento que baja de 4,0149 a 2,3559 no implica aprobar; la nota máxima fue 5 y la media 2,25.
- Reproducción de coste del profesor: estimar el coste aproximado de 0,0041 USD por corrida y compararlo con otras estrategias de generación de datos.

## Benchmarks y rendimiento

| Benchmark | Base sin entrenar | Con adaptador |
|---|---:|---:|
| Examen fijo de 20 preguntas, nota media 1–10 | 1,70 | 2,25 |
| Aprobación (nota ≥ 7) | 0 % | 0 % |
| Nota máxima tras entrenamiento | No disponible | 5 |
| Pérdida de entrenamiento | 4,0149 | 2,3559 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El examen tiene solo 20 preguntas, por lo que el margen de error es grande.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para los pesos en FP16; aproximadamente 0,5–1,5 GB incluyendo runtime y activaciones en contextos cortos. En INT8 o INT4 sería aún menor, pero no se distribuye cuantizado.
- GPU recomendadas: no requiere A100 ni H100. Una RTX 3060 de 12 GB, RTX 4060 de 8 GB o RTX 4090 de 24 GB son más que suficientes. La A100 de 40 GB se usó en el notebook de entrenamiento, no es necesaria para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con 2–4 GB o más; también puede ejecutarse en CPU para pruebas.
- Opciones de despliegue: la vía documentada es `transformers` + `peft`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; requeriría fusionar o convertir el adaptador y no está verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado en examen | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| `logibot-slm-smollm2-colab` (este adaptador) | 135 M base + 4,88 M adaptador | No disponible | 2,25/10; 0 % aprobados | Apache-2.0 | HuggingFace |
| `SmolLM2-135M-Instruct` (modelo base) | 135 M | No disponible | 1,70/10; 0 % aprobados | Apache-2.0 | HuggingFace |
| `adolfo123456/logibot-slm` | No disponible (Llama diminuto) | No disponible | No disponible; se indica que aprendió el dominio | No disponible | HuggingFace |

## Limitaciones y advertencias

- No es apto para uso real: el propio autor indica que el adaptador no aprendió el dominio y que ninguna respuesta alcanzó la nota de aprobación.
- Rendimiento limitado: la nota media es 2,25 sobre 10 y la máxima es 5; el 0 % de aprobación se mantiene tras el entrenamiento.
- Evaluación pequeña: el examen fijo tiene solo 20 preguntas, lo que reduce la fiabilidad estadística de las conclusiones.
- Datos sintéticos y dominio ficticio: los 124 pares se generaron con un LLM de OpenAI y no incluyen información personal, pero tampoco validación experta independiente.
- Idioma restringido: los datos y la evaluación están en inglés; no hay evidencia de funcionamiento en castellano.
- Contexto no documentado: no se indica la longitud de contexto efectiva del modelo base en esta ficha.
- Dependencia del profesor/juez: el mismo LLM de OpenAI genera los datos y corrige el examen, lo que puede introducir sesgos de evaluación.
- Restricciones de uso: el adaptador hereda Apache-2.0, pero las respuestas del profesor son salidas de un modelo comercial de OpenAI; hay que revisar los términos vigentes de OpenAI para usos distintos del educativo o interno.
- Repositorio potencialmente incompleto: el tamaño indicado es 0,0 GB; conviene verificar que los pesos del adaptador estén realmente disponibles antes de usarlo.
- No se documentan tool calling, agentes, visión, audio ni despliegue en vLLM, TGI, llama.cpp u Ollama.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/adolfo123456/logibot-slm-smollm2-colab
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Modelo alternativo que sí aprendió el dominio: https://huggingface.co/adolfo123456/logibot-slm
- No se proporcionan papers, blogs, repositorios ni demos adicionales en la información disponible.
